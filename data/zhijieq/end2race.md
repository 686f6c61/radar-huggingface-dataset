# zhijieq/End2Race

## Resumen

End2Race es una política neuronal de conducción extremo a extremo para carreras autónomas multivehículo sobre la plataforma F1TENTH. Desarrollada por Zhijie Qiao, Haowei Li, Zhong Cao y Henry X. Liu (Michigan Traffic Lab, Universidad de Míchigan), convierte directamente escaneos LiDAR 2D de 360° y la velocidad longitudinal en comandos de dirección y velocidad a 40 Hz, sin módulos intermedios de percepción, localización o planificación.

El modelo es relevante dentro del campo de la robótica y el aprendizaje por refuerzo porque demuestra que una política recurrente compacta puede ejecutar maniobras de adelantamiento en circuitos reales de F1TENTH, un banco de pruebas habitual para vehículos autónomos a escala 1:10. Su tamaño es minúsculo (850.556 parámetros), lo que permite inferencia en tiempo real incluso en hardware embebido de bajo consumo.

El repositorio de Hugging Face distribuye tanto los pesos preentrenados como un paquete Python (`end2race`) que registra un entorno Gymnasium (`End2Race-v0`) para simulación, con cuatro circuitos disponibles (Austin, Hockenheim, MoscowRaceway y Nuerburgring) y dos modos: contrarreloj individual y carrera cabeza a cabeza contra un oponente controlado por línea de carrera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente (GRU) con codificadores para LiDAR y velocidad; política extremo a extremo |
| Parámetros totales | 850.556 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada: LiDAR de 180 haces tras submuestreo y velocidad; estado oculto de la GRU) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga vía `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

End2Race es una política de aprendizaje por refuerzo entrenada de extremo a extremo. La entrada es un diccionario de observación con LiDAR (`float32[1440]`, alcance máximo de 30 m), velocidad longitudinal (`float32[1]`) y pose del vehículo (`float32[3]`: x, y, orientación). Internamente, la política submuestrea el LiDAR a 180 haces, embebe la velocidad y mantiene un estado oculto recurrente de tipo GRU que se reinicia con `policy.reset()` al comienzo de cada episodio. La salida es un vector `float32[2]` con ángulo de dirección (recortado a ±0,4189 rad, es decir, ±24°) y velocidad deseada en m/s.

El entrenamiento se realiza mediante aprendizaje por refuerzo en el simulador propio de End2Race, que modela la dinámica del vehículo F1TENTH y varios circuitos. La model card no detalla el número de pasos de entrenamiento, la composición del dataset ni si se emplearon técnicas de ajuste fino supervisado o preferencias. La innovación principal es la integración de la política recurrente con un entorno de simulación Gymnasium que permite tanto evaluación individual como interacción multivehículo con oponentes que siguen líneas de carrera predefinidas (interna, central o externa) y escalado de velocidad ajustable.

## Capacidades

- Conducción autónoma extremo a extremo a 40 Hz a partir de LiDAR 2D y velocidad, sin mapas ni localización global explícita.
- Carreras multivehículo con maniobras de adelantamiento: el entorno reporta como resultado `"overtake"` o `"follow"`.
- Contrarreloj individual con seguimiento de vueltas y tiempos por vuelta.
- Adaptación a cuatro circuitos distintos: Austin, Hockenheim, MoscowRaceway y Nuerburgring.
- Gestión de estado recurrente para mantener coherencia temporal entre pasos de control.
- No dispone de tool calling, function calling, capacidades de agente basadas en lenguaje, multilingüismo ni modos de razonamiento explícito; es una política de control motor especializada.

## Casos de uso

- Investigación en conducción autónoma extremo a extremo: sirve como línea base reproducible para comparar políticas de control sobre F1TENTH, con un entorno Gymnasium que estandariza observaciones, acciones y criterios de terminación.
- Desarrollo de algoritmos de adelantamiento multivehículo: el modo `"multi"` permite evaluar estrategias de overtaking contra oponentes con líneas de carrera y velocidades configurables, lo que facilita experimentos controlados de interacción.
- Simulación de competiciones de robótica: el modo contrarreloj con seguimiento de vueltas y tiempos permite organizar benchmarks internos o reproducir condiciones de competición F1TENTH.
- Validación de pipelines de simulación a realidad: al ser una política compacta con entradas de sensores reales (LiDAR y velocidad), puede transferirse a un vehículo F1TENTH físico tras validación en simulador.
- Educación y docencia en robótica y RL: el tamaño reducido (850.556 parámetros) y la API sencilla (`reset`, `act`) permiten ejecutar experimentos completos en portátiles sin GPU dedicada.
- Pruebas de robustez y seguridad: el entorno reporta colisiones y resultados de episodio, lo que permite medir tasas de fallo y analizar el comportamiento de la política ante configuraciones adversariales de oponentes.
- Integración en sistemas de control de bajo nivel: la salida directa de dirección y velocidad a 40 Hz encaja en bucles de control de vehículos a escala con requisitos de latencia estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los metadatos no incluyen tablas comparativas de MMLU, HumanEval, GSM8K ni métricas específicas de conducción (tiempos de vuelta, tasas de colisión o porcentaje de adelantamientos exitosos) más allá de los campos que el entorno devuelve en tiempo de ejecución (`lap_times`, `avg_speed`, `outcome`).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 850.556 parámetros en precisión completa el peso de los parámetros ronda los 3,4 MB, y el estado recurrente y los buffers de observación son despreciables.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ejecuta la política sin problema. También es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware embebido tipo Raspberry Pi o Jetson Nano para el control del vehículo a escala.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` y el paquete `end2race` instalado desde el wheel del repositorio; el entorno de simulación se ejecuta con Gymnasium y renderizado opcional en ventana interactiva.
- Latencia y throughput estimados: no disponibles de forma publicada; el diseño apunta a control a 40 Hz (25 ms por paso), holgado para el tamaño del modelo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| End2Race | Política RL extremo a extremo para F1TENTH | 850.556 | LiDAR 2D (180 haces) + velocidad | Apache 2.0 | Hugging Face + GitHub |
| Políticas F1TENTH basadas en aprendizaje supervisado (por ejemplo, imitation learning) | Redes CNN para conducción | no disponible | Imágenes o LiDAR | variable | repositorios académicos |
| Controladores clásicos (MPC, Stanley, Pure Pursuit) | No neuronales | no aplica | Mapas y localización | variable | software abierto |

No se dispone de datos públicos de rendimiento comparativo entre End2Race y estas alternativas en la información proporcionada; la comparación se limita a categoría, tamaño y licencia.

## Limitaciones y advertencias

- Modelo especializado en conducción F1TENTH: no es un modelo de lenguaje ni un modelo de propósito general; no admite tareas de texto, código o visión genérica.
- Dependencia del simulador y de la dinámica del vehículo modelada: el rendimiento en un vehículo físico puede degradarse por diferencias de calibración del LiDAR, latencias y dinámica no modelada.
- Sin datos publicados sobre sesgos, tasas de colisión o robustez ante condiciones de iluminación, superficies o sensores ruidosos.
- Riesgo de sobreajuste a los cuatro circuitos incluidos; no hay evidencia de generalización a pistas no vistas.
- La licencia Apache 2.0 permite uso comercial, pero el código y el entorno asociados deben revisarse en el repositorio de GitHub para confirmar compatibilidad y dependencias.
- Requiere `trust_remote_code=True` al cargar el modelo, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de usarlo en producción.
- No se especifican requisitos de seguridad funcional ni certificaciones; su uso en vehículos reales exige validación independiente y mecanismos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhijieq/End2Race
- Paper (arXiv): https://arxiv.org/abs/2509.16894
- Código y documentación completa: https://github.com/michigan-traffic-lab/End2Race
- Plataforma F1TENTH: https://roboracer.ai/

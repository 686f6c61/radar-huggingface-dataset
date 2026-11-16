# Swenlon/microduck-spin

## Resumen

Microduck-spin es una política de control por refuerzo (reinforcement learning) para el robot cuadrúpedo de sobremesa Microduck, desarrollada por el usuario Swenlon. No es un modelo de lenguaje: es un actor PPO entrenado para producir comandos de articulación a partir de observaciones propioceptivas del robot. El paquete se publica como un único fichero ONNX de inferencia con normalización de observaciones incluida, acompañado de manifiesto, vídeos de replay y resultados numéricos de evaluación.

El origen es un experimento fallido: el objetivo original era conseguir un paso de ganso autónomo (goose-step) en simulación, y el entrenamiento no lo logró. El autor observó en los vídeos de replay que la política giraba rápidamente sobre sí misma y decidió preservar ese comportamiento inesperado como habilidad. Por tanto, el modelo representa un checkpoint intermedio (update 20.000) de la ejecución `march-from-walker`, no una política de locomoción validada.

Su relevancia es limitada y muy específica: sirve como ejemplo reproducible de exportación checkpoint→ONNX con verificación numérica, de interfaz de observación documentada para un robot de 14 servos XL330 a 50 Hz, y de caso de estudio sobre cómo documentar honestamente un resultado no previsto. El autor advierte explícitamente de que no es un controlador de hardware verificado ni sustituye a la política de marcha normal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP feed-forward (actor PPO); normalizador de observaciones integrado en el ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada fija de 61 valores float32) |
| Tipos de cuantización | no disponible (el paquete distribuye únicamente el ONNX en precisión original) |
| Idiomas soportados | zh, en (solo en documentación; el modelo no procesa texto) |
| Licencia | no disponible (el autor indica que no se ha seleccionado licencia para los pesos) |
| Formato de pesos | ONNX (`policy.onnx`); el checkpoint original es `model_19999.pt` (PyTorch) |
| Entrada | `obs`, float32 `[1, 61]` |
| Salida | `actions`, float32 `[1, 14]` |
| Frecuencia de control nominal | 50 Hz |
| Servos del robot | 14 × XL330 |
| Actualizaciones PPO completadas | 20.000 |
| Model API | 1 |

## Arquitectura y entrenamiento

La política es un actor PPO feed-forward de tipo MLP, entrenado en simulación con el proyecto `microduck_rl` de Pollen Robotics. La entrada de 61 dimensiones se compone, en este orden: velocidad angular (3), gravedad proyectada (3), posición de articulaciones (14), velocidad de articulaciones (14), acciones previas (14), comando (3), comando de cabeza (4) y comando de cuerpo (6). La salida son 14 acciones de posición articular con escala 1.0, referidas al offset de pose por defecto del robot de entrenamiento.

El entrenamiento se realizó sobre la ejecución `march-from-walker` y el checkpoint seleccionado corresponde al update 20.000 (`model_19999.pt`). Durante entrenamiento e inferencia, el bloque de comando se mantuvo constante en `[1, 0, 0]`, y los bloques de cabeza y cuerpo a cero; no se empleó la convención habitual de marcha `[vx, vy, yaw-rate]`. El inicializador reinició las columnas 48–60 de la primera capa (comando) y su normalización, de modo que el actor entrenado no es byte-equivalente al ONNX de marcha original aunque reutilice sus pesos como punto de partida. No se realizó ningún nuevo rollout de comportamiento ni actualización PPO para construir este paquete.

La validación de exportación comparó 66 vectores de entrada entre el actor determinista de PyTorch y ONNX Runtime en CPU, con un error absoluto máximo de acción de 9,5367431640625e-7 y validación de forma y modelo superada. Esta comprobación acredita fidelidad de exportación, no seguridad física ni calidad del giro.

## Capacidades

- Generación de acciones de control articular para un robot Microduck de 14 servos a partir de observaciones propioceptivas de 61 valores.
- Giro rápido en el sitio en simulación, observado en los replays con semillas 55 y 56 (cuatro ensayos, dos entornos por lote, sin caídas dentro de una ventana de observación acotada de 18 segundos).
- Inferencia determinista en CPU mediante ONNX Runtime, con normalización de observaciones incorporada en el grafo.
- Interfaz documentada mediante `manifest.json` (schema 2) con convención de comando y limitaciones declaradas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni procesamiento de lenguaje natural.
- No dispone de modo de parada segura ni de comando `idle` validado.

## Casos de uso

- Estudio de exportación checkpoint→ONNX: el paquete incluye `validation.json` con la comparación numérica entre PyTorch y ONNX Runtime, útil como plantilla para verificar la fidelidad de exportación de políticas RL antes de desplegarlas.
- Referencia de interfaz de observación para robots de 14 servos: el orden exacto de las 61 entradas y los offsets están documentados en `provenance/source.json` y en los metadatos del ONNX, lo que facilita reimplementar el pipeline de observaciones en otros proyectos.
- Análisis de comportamientos emergentes en RL: el caso documenta cómo una política que no alcanzó su objetivo de marcha produjo un giro en el sitio, y sirve para discutir selección de checkpoints y criterios de aceptación en entrenamientos PPO.
- Docencia y divulgación sobre reproducibilidad: los checksums SHA-256 del checkpoint y del ONNX, junto con los replays y los resultados de evaluación sin alterar, permiten auditar el paquete de forma independiente.
- Pruebas de integración en simulación: el ONNX puede cargarse en un simulador compatible con la configuración de comando autónomo para reproducir los replays con las semillas 55 y 56.
- Ejemplo de gobernanza de licencias: el autor deja constancia de que no se ha seleccionado licencia para los pesos y de que la licencia upstream no estaba disponible en la instantánea de entrenamiento, lo que ilustra un caso práctico de bloqueo de publicación por incertidumbre legal.
- No es adecuado para control de hardware real, sustitución de la política de marcha ni aplicaciones de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son de validación de exportación y de replay:

| Métrica | Resultado |
|---|---|
| Error absoluto máximo de acción (PyTorch vs ONNX Runtime, 66 vectores) | 9,5367431640625e-7 |
| Validación de forma y modelo ONNX | superada |
| Ensayos observados en replay | 4 (semillas 55 y 56, 2 entornos por lote) |
| Caídas en ventana de 18 s | 0 |
| Calidad cuantitativa del giro (velocidad angular, deriva de centro) | no evaluada |

## Requisitos de hardware

- El modelo es un MLP de entrada 61 y salida 14; la inferencia cabe holgadamente en CPU. No se dispone del número exacto de parámetros ni del tamaño del fichero ONNX (el repositorio completo ocupa 0,0 GB según Hugging Face).
- VRAM estimada para inferencia: no disponible; en la práctica, cualquier GPU con unos pocos cientos de MB libres es suficiente, y la CPU es viable a 50 Hz.
- GPU recomendadas: no aplica; no se requiere GPU dedicada. Cualquier GPU consumer (por ejemplo, serie RTX 40) queda sobradamente dimensionada.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: ONNX Runtime (validado en CPU por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. La frecuencia de control nominal del robot es de 50 Hz, lo que fija un presupuesto de 20 ms por ciclo de control.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye políticas RL comparables para el robot Microduck ni para plataformas de 14 servos con las que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El objetivo original de marcha tipo goose-step no se alcanzó; el giro es un comportamiento emergente preservado por decisión del autor.
- No es un controlador de hardware verificado. El propio autor lo califica como modelo experimental de simulación, no como controlador validado para robot físico.
- No se han medido velocidad de giro, deriva del centro ni parada segura; no hay criterios de aceptación cuantitativos para el comportamiento.
- No se proporciona un comando `idle` seguro ni una duración de desenrollado. El autor advierte explícitamente de no usar `[0, 0, 0]` como parada segura presunta ni de sustituir la política de marcha normal.
- La ventana de observación de los replays es de 18 segundos y no constituye un episodio completado ni una demostración de parada segura.
- El clasificador de replay estaba diseñado para goose-stepping, no para evaluar la calidad del giro.
- El bloque de comando fue constante `[1, 0, 0]` durante entrenamiento e inferencia; no se empleó la convención de marcha `[vx, vy, yaw-rate]`.
- El reinicio de las columnas 48–60 de la primera capa implica que el actor no es byte-equivalente al ONNX de marcha original.
- Licencia de pesos no seleccionada; la licencia upstream no estaba disponible en la instantánea local de entrenamiento. Antes de cualquier uso público o comercial debe confirmarse la permisibilidad de los pesos originales.
- El paquete no incluye mallas del robot ni implica que su licencia cubra estos pesos.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo equivalente es la generalización limitada fuera de las condiciones de simulación entrenadas.
- Idiomas: la documentación está en chino e inglés; el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/Swenlon/microduck-spin
- Proyecto de código de entrenamiento y exportación: Pollen Robotics `microduck_rl` (referenciado en la model card; no se proporciona URL directa)
- Manifiesto de interfaz: `manifest.json` dentro del repositorio
- Validación de exportación: `validation.json` dentro del repositorio
- Procedencia y metadatos de actuadores: `provenance/source.json` dentro del repositorio
- Replays: `replay.mp4` y `videos/replay-seed-56.mp4` dentro del repositorio
- Checksums: `CHECKSUMS.sha256` dentro del repositorio

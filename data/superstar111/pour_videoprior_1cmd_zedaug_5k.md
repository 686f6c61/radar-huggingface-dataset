# Superstar111/pour_videoprior_1cmd_zedaug_5k

## Resumen

`Superstar111/pour_videoprior_1cmd_zedaug_5k` es un checkpoint de un modelo de visión-lenguaje-acción (VLA) basado en π0.5, ajustado con la librería openpi de Physical Intelligence para una tarea robótica concreta de manipulación. Lo desarrolla el usuario Superstar111 y resuelve un problema muy específico: ejecutar tres habilidades encadenadas (coger una cuchara, llenarla de garbanzos y verterlos en una olla) bajo una única instrucción en lenguaje natural, sobre un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones.

El modelo es un fine-tune completo desde la base π0.5, entrenado exclusivamente en simulación con 300 trayectorias y 115.135 filas de entrenamiento tras el filtrado. Este checkpoint corresponde al paso 5.000 de 17.000 con pesos EMA, y no ha sido evaluado todavía ni en simulación ni en robot real, lo que lo convierte en material de investigación temprana más que en un artefacto listo para producción.

Su relevancia ahora es doble: por un lado, muestra el flujo de trabajo de openpi para adaptar π0.5 a tareas de manipulación con contexto largo; por otro, documenta con un nivel de detalle inusual las decisiones de modelado del simulador (cámara ZED Mini oficial, aumentación de imagen de openpi, calibración de la montura de la mano) y los riesgos conocidos antes de desplegar en hardware real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, ajustada con openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precisión de entrenamiento; el autor indica unos 10 GB de VRAM libre para servir) |
| Idiomas soportados | no disponible (las instrucciones del autor están en inglés) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de openpi (`params/` más estadísticas de normalización en `assets/local/pour_videoprior_zed_n300/`), empaquetado en `.tar.gz` junto al código fuente |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la política VLA de Physical Intelligence que combina un modelo de lenguaje-visión con una cabeza de acciones, y se ajusta de forma completa (full fine-tune) con openpi en el commit `cbad60bbd1ac50c471e204bdfff1b87d53f29290`, usando la configuración `pi05_maggie_2skill_hcw_openpiaug` con tres vistas: cabeza, muñeca y cam1. El entrenamiento se ejecutó en 2 NVIDIA H200 con paralelismo de datos (32 por GPU), batch 64, 17.000 pasos con schedule coseno (pico 5e-5 hasta 5e-6, warmup 500), EMA 0.999, semilla 43 y estadísticas de normalización calculadas sobre este dataset. Este checkpoint concreto son los pesos EMA del paso 5.000, momento en el que las filas se habían visto 2,78 veces; la pérdida bajó de 0,4154 en el primer paso registrado a 0,0028 en el paso 5.000.

Los datos son 300 trayectorias simuladas procedentes de la sesión `staged-videos-personal-b` (rama "Video + agent-extracted semantic priors" del baseline de prompt más simulador del 25 de noviembre de 2026), derivadas de los episodios del modelo `stir_videoprior_1cmd`, cada uno cortado al final de su vertido: 121.135 de 166.925 pasos conservados (396, 398 y 426 por episodio), que quedan en 115.135 filas tras el filtro de inactividad del empaquetador. La innovación destacable de esta versión frente a `pour_videoprior_1cmd` es el uso del modelo 3D oficial de la cámara ZED Mini de Stereolabs como cámara de muñeca en la escena del simulador, junto con la aumentación de imagen por defecto de openpi: color jitter (brillo, contraste, saturación) en todas las vistas y un recorte aleatorio del 95 % con rotación de hasta 5 grados en la vista de cabeza, con una única tirada aleatoria para todas las vistas. Las tres vistas se re-renderizaron desde las mismas articulaciones y poses de objeto registradas, manteniendo fila a fila los estados, objetivos, comandos y orden de episodios del modelo anterior.

## Capacidades

- Generación de acciones motoras para un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, a partir de observaciones visuales de tres cámaras y una instrucción en lenguaje natural.
- Ejecución encadenada de tres habilidades en un solo episodio (coger la cuchara, llenarla de garbanzos, verter en la olla) bajo un único comando para todo el episodio.
- Comprensión de instrucciones en lenguaje natural en inglés: el prompt siempre es "pick up the spoon, scoop the beans and pour them into the pot".
- Procesamiento multimodal de tres vistas simultáneas (cabeza, muñeca y cam1).
- Servido mediante un script incluido (`serve_vla.sh`) que expone un servidor en el puerto 8000 con el formato de petición y respuesta del run 2 de dextool (PR #11).
- Verificación de integridad y reproducibilidad: sumas sha256 del checkpoint y del bundle, más un script `golden.py` con consultas registradas que comprueban la ruta de servicio.
- No se documentan capacidades de tool calling, razonamiento multi-paso genérico, matemáticas, código ni otros idiomas distintos del usado en el comando.

## Casos de uso

- Investigación en manipulación robótica con VLAs: el checkpoint sirve como punto de partida para estudiar cómo se comporta π0.5 en tareas de scoop y pour con contexto de tres cámaras, comparando con los checkpoints anteriores del mismo autor.
- Reproducción de experimentos de simulación: al incluir el código fuente de openpi en el commit exacto de entrenamiento, el tokenizador y las estadísticas de normalización, permite reproducir la ruta de servicio y validar respuestas con `golden.py` antes de lanzar experimentos propios.
- Desarrollo de pipelines de despliegue sim-a-real: la documentación de la montura de la mano, la pose de la cámara de muñeca y el límite real de la articulación del pulgar sirve para planificar la conversión a hardware antes de ejecutar el modelo en el robot.
- Evaluación de aumentación de datos en robótica: la combinación de color jitter y recorte aleatorio del 95 % con rotación de hasta 5 grados en la vista de cabeza es un caso concreto para medir el efecto de la aumentación de openpi en políticas de manipulación.
- Benchmarking de encadenamiento de habilidades: al tratarse de tres habilidades en un episodio con un solo comando, es útil para comparar estrategias de segmentación de tareas frente a políticas de una sola habilidad.
- Formación y divulgación técnica: la model card detalla decisiones de calibración y riesgos de despliegue con medidas concretas (7 px de desviación, 8 cm de desplazamiento del agarre, clip de velocidad 0,4), lo que lo convierte en material didáctico sobre las trampas del sim-a-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado todavía ni en simulación ni en robot. La única métrica publicada es la pérdida de entrenamiento: 0,4154 en el primer paso registrado y 0,0028 en el paso 5.000. La comprobación de subida verificó que un servidor nuevo responde 12 consultas registradas dentro de 0,003163 rad de las respuestas del clúster de entrenamiento (tolerancia 0,005 rad), pero esa prueba valida la ruta de servicio, no la habilidad de la política.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 10 GB libres en una GPU NVIDIA, según las instrucciones del autor en `serve_vla.sh`.
- GPU recomendadas: el autor no especifica modelos concretos para inferencia; el entrenamiento se hizo en 2 NVIDIA H200.
- Cabe en GPU de consumo: no confirmado por el autor; con unos 10 GB de VRAM libre, GPUs de consumo de gama alta con 12 GB o más podrían ser suficientes, pero no hay validación publicada.
- Opciones de despliegue: servidor propio de openpi mediante `serve_vla.sh` en el puerto 8000, con el entorno gestionado por `uv`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pour_videoprior_1cmd_zedaug_5k` (este) | no disponible | no disponible | no evaluado | no disponible | Hugging Face, 12,4 GB |
| `Superstar111/pour_videoprior_1cmd` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `Superstar111/stir_videoprior_1cmd` | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible en esta información | no disponible | openpi (GitHub) |

La comparación se limita a los artefactos del mismo autor y a la base π0.5, porque la información proporcionada no incluye datos de parámetros, contexto ni rendimiento de ninguno de ellos. La diferencia principal de este checkpoint frente a `pour_videoprior_1cmd` es la cámara ZED Mini oficial, el re-renderizado de las tres vistas con aumentación de openpi y el entrenamiento con batch 64 durante 17.000 pasos.

## Limitaciones y advertencias

- No evaluado: el autor declara explícitamente que el modelo no se ha evaluado ni en simulación ni en robot, por lo que no hay evidencia publicada de que las habilidades funcionen.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- Desajuste de la mano: las trayectorias llevan la articulación lateral del pulgar (`right_thumb_CMC_AA`) a unos +15,9 grados, pero la mano real se detiene en unos +3 grados; en simulación ese tope desplaza el agarre del modelo de vídeo de 4 habilidades unos 8 cm hacia delante y pierde el scoop.
- Calibración de la cámara de muñeca: su pose procede del modelo oficial en la ranura de la montura, no de una calibración; frente a los frames de muñeca del rig del 23 y 27 de noviembre, la mano simulada queda unos 7 px (de 284) al lado de la real.
- Clip de velocidad: el clip de velocidad del runner del rig (0,4) detuvo por sí solo todos los scoops del modelo de vídeo de 4 habilidades (0 de 5 inicios) en simulación.
- Montura de la mano: entrenado con la montura girada; no aplicar la conversión de la articulación 6 de los cinco checkpoints anteriores.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política de acciones, el riesgo se traduce en ejecutar movimientos no deseados en el robot.
- Idiomas: solo se documenta el comando en inglés; no hay información sobre otros idiomas.
- Seguridad: el autor exige ejecutarlo con una persona en la parada de emergencia.
- Entrenamiento solo en simulación: las trayectorias se simularon con la forma de colisión y masa de la cámara anterior, lo que puede introducir discrepancias físicas respecto al modelo oficial.
- Tamaño del repositorio: 12,4 GB, lo que complica su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pour_videoprior_1cmd_zedaug_5k
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Modelo anterior de referencia: https://huggingface.co/Superstar111/pour_videoprior_1cmd
- Modelo de origen de los episodios: https://huggingface.co/Superstar111/stir_videoprior_1cmd
- No se han encontrado en la información proporcionada papers, blogs, demos ni otros repositorios adicionales.

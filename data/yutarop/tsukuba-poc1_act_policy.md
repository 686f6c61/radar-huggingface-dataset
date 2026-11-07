# Yutarop/tsukuba-poc1_act_policy

## Resumen

`Yutarop/tsukuba-poc1_act_policy` es una política de imitación para robótica basada en el método ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario Yutarop y entrenada con la librería LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulación —"Pick up an object and place it" (coger un objeto y colocarlo)— sobre un robot de tipo `so_follower` con una única cámara cenital (`top`). No es un modelo de lenguaje: es una política visomotora que consume el estado articular y una imagen y emite comandos de acción de 6 dimensiones.

El modelo tiene 51.668.614 parámetros en formato safetensors, con un repositorio de 0,2 GB. La entrada combina `observation.state` (vector de 6 componentes) y `observation.images.top` (imagen RGB de 3×480×640); la salida es un vector `action` de 6 componentes. Se entrenó durante 20.000 pasos con batch de 8, optimizador AdamW y learning rate de 1e-5, sobre un dataset de 50 episodios y 31.605 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: es un ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot, útil para quien quiera replicar el flujo (grabación de datos, entrenamiento, despliegue en robot real) o como punto de partida para una tarea de pick-and-place con hardware SO-100/SO-101. No hay resultados de evaluación publicados ni información de licencia, lo que limita su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = 1 observación por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.7.1 |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Cámaras | `top` (1 cámara) |
| Entrada `observation.state` | STATE, shape (6,) |
| Entrada `observation.images.top` | VISUAL, shape (3, 480, 640) |
| Salida `action` | ACTION, shape (6,) |
| Dataset de entrenamiento | `Yutarop/tsukuba-poc1_20261107_211425` (50 episodios, 31.605 fotogramas, 30 FPS) |
| Tarea entrenada | "Pick up an object and place it" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso, el modelo predice *chunks* de acciones cortos, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La arquitectura combina un codificador visual (procesa la imagen `top` de 3×480×640), un codificador del estado articular (vector de 6) y un transformer que fusiona ambas representaciones y decodifica la secuencia de acciones. La salida es un vector de 6 componentes por paso de control.

El entrenamiento se realizó con LeRobot 0.7.1 sobre 50 episodios teleoperados (31.605 fotogramas a 30 FPS), durante 20.000 pasos con batch 8, AdamW y LR 1e-5. No se documenta en la model card el uso de RLHF, DPO ni ningún proceso de refinamiento posterior; es aprendizaje supervisado puro sobre demostraciones. Tampoco se especifica el número de tokens de entrenamiento (no aplica) ni la composición detallada del dataset más allá de la tarea y las métricas de episodios/fotogramas.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de una imagen cenital y el estado articular.
- Predicción de *action chunks*: emite secuencias cortas de acciones en lugar de pasos individuales, lo que mejora la suavidad y reduce el error acumulado.
- Ejecución de la tarea "Pick up an object and place it" sobre robot `so_follower`.
- Inferencia en tiempo real a 30 FPS (la frecuencia del dataset de entrenamiento).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso lingüístico ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni ninguna capacidad fuera del control robótico.

## Casos de uso

- **Pick-and-place en laboratorio docente**: el modelo ejecuta la tarea de coger y colocar un objeto sobre un robot SO-100/SO-101 con una cámara cenital, lo que lo hace adecuado para prácticas de robótica de manipulación en entornos controlados.
- **Réplica de pipelines de imitación con LeRobot**: sirve como referencia reproducible para validar el flujo completo (grabación de 50 episodios a 30 FPS, entrenamiento de 20.000 pasos, despliegue con `lerobot-rollout`) antes de escalar a tareas propias.
- **Punto de partida para fine-tuning**: al estar en formato safetensors y ser compatible con `lerobot-train`, puede usarse como inicialización para tareas de manipulación similares con el mismo robot y configuración de cámara.
- **Evaluación de hardware SO-100/SO-101**: permite probar la cadena cinemática, la calibración y la latencia de un robot `so_follower` con una política ya entrenada antes de invertir en la grabación de datos propios.
- **Docencia en aprendizaje por imitación**: el modelo ilustra de forma concreta conceptos como action chunking, codificación visual y control a 30 FPS, con métricas de entrenamiento explícitas (LR, batch, semilla) que facilitan la reproducibilidad.
- **Prototipado de automatización de bajo coste**: para tareas de recogida y colocación de objetos ligeros en cintas o puestos de trabajo, siempre que el entorno coincida con el del dataset original (misma cámara, misma iluminación, misma posición de objeto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: *"No evaluation results have been provided for this policy yet"*. No hay tabla de éxito por tarea, ni número de ensayos, ni tasa de acierto.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada. Con 51,7 M de parámetros, la huella de pesos es de aproximadamente 0,2 GB en fp32 (el tamaño del repo), por lo que cabe holgadamente en cualquier GPU consumer, pero no se documenta el consumo real con el codificador visual.
- **GPU recomendadas**: no disponible. El comando de entrenamiento de la model card usa `--policy.device=cuda`, sin especificar modelo de GPU.
- **¿Cabe en GPU consumer?**: sí, por tamaño de parámetros (51,7 M) y repo de 0,2 GB, pero no se confirma qué GPU concreta se usó ni el rendimiento obtenido.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- **Latencia y throughput**: no disponibles. La única referencia temporal es la frecuencia del dataset (30 FPS), que sugiere que el control está pensado para operar a esa cadencia, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Yutarop/tsukuba-poc1_act_policy` | ACT (LeRobot) | 51,7 M | Imagen 3×480×640 + estado (6,) | Pick and place sobre `so_follower` | no disponible | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT (LeRobot) | no disponible | Configurable según robot | Manipulación fina genérica | según repo | Hugging Face / docs LeRobot |
| Políticas Diffusion Policy (LeRobot) | Diffusion Policy | no disponible | Configurable | Manipulación | según repo | Hugging Face / docs LeRobot |

No se dispone de datos de benchmarks ni de parámetros concretos de las alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- **Sin licencia declarada**: la model card marca la licencia como "[More Information Needed]". No se puede asumir uso comercial sin consultar al autor.
- **Sin evaluación publicada**: no hay tasa de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política.
- **Sobreajuste al entorno de entrenamiento**: entrenada con una sola cámara `top`, un robot `so_follower` concreto y 50 episodios; es probable que no generalice a cambios de iluminación, posición de cámara, tipo de objeto o robot distinto.
- **Dataset pequeño**: 50 episodios y 31.605 fotogramas es una cantidad modesta para imitación; puede provocar comportamientos frágiles fuera de la distribución de demostraciones.
- **Tarea única**: solo se ha entrenado para "Pick up an object and place it"; no es una política generalista.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- **Sin información de sesgos**: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos de un único operador y entorno, hereda sus sesgos de demostración.
- **Idiomas**: no aplica; el modelo no procesa texto.
- **Caveat de producción**: al no haber benchmarks ni licencia clara, no se recomienda su uso en producción sin una evaluación propia en el robot objetivo y una revisión legal de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yutarop/tsukuba-poc1_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Yutarop/tsukuba-poc1_20261107_211425
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yutarop/tsukuba-poc1_20261107_211425
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentación ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Guía de entrenamiento ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Perfil de GitHub del autor: https://github.com/Yutarop

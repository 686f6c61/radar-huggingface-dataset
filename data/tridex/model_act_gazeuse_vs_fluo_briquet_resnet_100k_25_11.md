# Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_100K_25_11

## Resumen

El modelo `Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_100K_25_11` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705 (Zhao et al.). Lo desarrolla el usuario Tridex y se distribuye a través de Hugging Face Hub con la librería LeRobot. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (estado articular de 6 dimensiones y tres cámaras RGB de 480x640) a acciones de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot).

El modelo resuelve una tarea concreta de manipulación: coger un objeto ("gazeuse") y depositarlo en una caja rosa, evitando explícitamente otros dos objetos (un "briquet" y un "fluo" amarillo). Se entrenó sobre un dataset propio de 40 episodios y 15.305 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 1e-5. El checkpoint tiene 51.668.614 parámetros y ocupa 0,2 GB en safetensors.

Su relevancia es la de un ejemplo reproducible de imitation learning end-to-end en robótica de bajo coste: ACT predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de compounding y permite tasas de éxito altas con datasets pequeños. Es útil para quien quiera replicar el pipeline de LeRobot o adaptar una política ACT a su propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con backbone ResNet para visión y cabeza de acción con modelado de incertidumbre (CVAE) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume una observación por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (modelo visomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Tipo de robot | so_follower (SO-100/SO-101 de LeRobot) |
| Cámaras de entrada | front, side, top (3 x 480 x 640 RGB) |
| Estado de entrada | observation.state, shape (6,) |
| Acción de salida | action, shape (6,) |
| Dataset de entrenamiento | Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841 (40 episodios, 15.305 frames, 30 FPS) |
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador / LR | AdamW / 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder para imitación. El encoder procesa la observación (estado de 6 dimensiones concatenado con características visuales extraídas por un backbone ResNet de las tres cámaras) y el decoder genera un chunk de k acciones futuras de forma autorregresiva. Incorpora un componente CVAE (conditional variational autoencoder) que modela la variabilidad de las demostraciones humanas, lo que ayuda a manejar la multimodalidad de las trayectorias. La innovación clave frente a políticas paso a paso es predecir chunks de acciones, lo que reduce el error acumulado y permite control a mayor frecuencia efectiva.

El entrenamiento se realizó con LeRobot 0.6.2 sobre 40 episodios teleoperados (15.305 fotogramas, 30 FPS) con la instrucción "take the gazeuse and drop it inside the pink box, but nerver try to take the briquet and yellow fluo". Se usaron 100.000 pasos, batch 8, AdamW con LR 1e-5 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni refuerzo; es imitation learning supervisado puro sobre demostraciones. El nombre del checkpoint sugiere el uso de un backbone ResNet (no se especifica la variante exacta, probablemente ResNet-18 por defecto en LeRobot).

## Capacidades

- Control visomotor de un robot manipulador `so_follower` a partir de tres cámaras RGB y el estado articular.
- Predicción de chunks de acción de 6 dimensiones (típicamente posición de articulaciones) para ejecución continua.
- Ejecución de una tarea de pick-and-place específica: coger el objeto "gazeuse" y depositarlo en la caja rosa.
- Discriminación de objetos distractores: la política aprende a no coger el "briquet" ni el "fluo" amarillo.
- Operación en tiempo real a 30 FPS (frecuencia del dataset).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No tiene modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitation learning: sirve como referencia reproducible para validar el pipeline de LeRobot (grabación, entrenamiento y rollout) en un robot SO-100/SO-101 con tres cámaras.
- Prototipado de pick-and-place en laboratorio: permite demostrar una tarea de recogida y depósito con distinción de objetos distractores, útil para comparar ACT con otros métodos (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Base para fine-tuning con datos propios: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con un dataset nuevo del mismo robot y cámaras, ajustando el número de pasos y el LR.
- Educación y formación en robótica: ejemplo didáctico de pipeline end-to-end de teleoperación, dataset, entrenamiento y despliegue con comandos `lerobot-train` y `lerobot-rollout`.
- Evaluación de robustez frente a distractores: el escenario con tres objetos (uno objetivo y dos prohibidos) permite medir la tasa de falsos positivos de la política en entornos con objetos similares.
- Integración en banco de pruebas de hardware: validar calibración de cámaras y del robot `so_follower` antes de escalar a tareas más complejas, dado el bajo coste computacional del modelo.
- Referencia para investigación en action chunking: comparar el efecto del tamaño de chunk y del backbone ResNet en la suavidad y precisión de la trayectoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de trials/success rate en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 son ~207 MB de pesos, más activaciones de tres imágenes 480x640 y el estado. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100). Para entrenamiento, una RTX 4090 o A100 acelera los 100.000 pasos; para inferencia basta una GPU modesta.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~2-4 GB de VRAM; también es viable en CPU para pruebas lentas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), PyTorch nativo, y exportación a TorchScript/ONNX no documentada en la model card.
- Latencia y throughput estimados: no disponibles; el dataset y el control están a 30 FPS, por lo que la política debe ejecutarse a esa frecuencia o superior para control fluido.
- Almacenamiento: repo de 0,2 GB en safetensors.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_100K_25_11 | ACT (imitation learning) | 51,7 M | 3 cámaras 480x640 + estado (6,) | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (checkpoints oficiales de ejemplo) | ACT | ~50 M (similar) | Configurable por robot/cámaras | Apache 2.0 | Hugging Face Hub / LeRobot |
| Diffusion Policy (referencia del paper) | Política por difusión | variable (decenas de M) | Imágenes + estado | según implementación | Repos académicos |
| VQ-BeT (referencia LeRobot) | Política con cuantización vectorial | variable | Imágenes + estado | según implementación | LeRobot |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política solo ejecuta la tarea "take the gazeuse and drop it inside the pink box, but nerver try to take the briquet and yellow fluo"; fuera de ese escenario no se garantiza comportamiento útil.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que el rendimiento en producción es desconocido.
- Dependencia del hardware: entrenada para `so_follower` con cámaras `front`, `side` y `top` a 480x640 y 30 FPS; cambios de robot, cámaras, calibración o iluminación degradan el comportamiento.
- Dataset pequeño: 40 episodios y 15.305 fotogramas implican poca diversidad de posiciones, iluminación y distractores; riesgo de sobreajuste al entorno de grabación.
- Riesgo de alucinación en sentido robótico: puede ejecutar acciones no deseadas (por ejemplo, tocar el briquet o el fluo) ante objetos o configuraciones no vistas.
- Sesgos: al ser datos teleoperados por una persona concreta, hereda sus sesgos motores y de posicionamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no hay garantías del autor; conviene citar el paper de ACT y LeRobot.
- No es un modelo de lenguaje: no procesa texto libre ni instrucciones en lenguaje natural en tiempo de inferencia; la instrucción `--task` es solo una etiqueta asociada al dataset.
- Sin cuantizaciones publicadas (GGUF/INT8): el despliegue se limita a PyTorch/LeRobot en este momento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_100K_25_11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento (imitation learning): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

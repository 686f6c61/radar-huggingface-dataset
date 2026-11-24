# Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_15K_18_11

## Resumen

El modelo `model_act_fluo_vs_gazeuse_briquet_resnet_15K_18_11`, publicado por el usuario Tridex, es una política de imitación (imitation learning) para robótica entrenada con el método ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que, a partir de tres cámaras y del estado articular del robot, predice directamente comandos de acción de 6 dimensiones. Su propósito concreto es resolver una tarea de manipulación muy específica: coger un rotulador fluorescente amarillo y depositarlo en una caja rosa, evitando explícitamente otros objetos (un mechero y una botella de agua con gas).

La arquitectura es un transformer con codificador visual ResNet (según el nombre del repositorio) y decodificador de acciones con chunking, con un total de 51.668.614 parámetros. El modelo se entrenó durante 15.000 pasos sobre un dataset propio de 40 episodios y 15.387 fotogramas a 30 FPS, capturados con un robot `so_follower` (SO-100/SO-101 de LeRobot) equipado con tres cámaras (`front`, `side`, `top`) a resolución 480x640.

Es relevante ahora porque ejemplifica el flujo actual de entrenamiento de políticas robóticas de código abierto con LeRobot: datasets pequeños, hardware de bajo coste y modelos ligeros que caben en una GPU de consumo. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, aunque el modelo está fuertemente especializado en una única tarea y no se han publicado evaluaciones reales de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; recibe instrucción de tarea como texto fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Cámaras de entrada | `front`, `side`, `top` (3, 480, 640) |
| Entrada de estado | `observation.state` (6,) |
| Salida de acción | `action` (6,) |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 15.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación. El modelo combina un codificador visual basado en ResNet que procesa las tres vistas de cámara con un transformer que fusiona la información visual con el estado articular del robot (6 dimensiones) y genera una secuencia de acciones de 6 dimensiones. El nombre del repositorio indica explícitamente el uso de ResNet como backbone visual.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531`, compuesto por 40 episodios de teleoperación y 15.387 fotogramas a 30 FPS (aproximadamente 8,5 minutos de datos efectivos). Se usaron 15.000 pasos con batch size 8, AdamW y learning rate 1e-05. La model card no documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de imitación supervisada pura sobre demostraciones humanas. No se especifica la composición del dataset más allá de la tarea descrita ni si hubo aumento de datos o variaciones de iluminación y posiciones.

## Capacidades

- Control visomotor para manipulación robótica: genera comandos de acción de 6 dimensiones a partir de tres cámaras y del estado articular.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas y coherentes en lugar de pasos aislados.
- Discriminación de objetos en la escena: la tarea exige coger el rotulador fluorescente amarillo y evitar el mechero y la botella de agua con gas.
- Percepción multi-vista: integra información de cámaras frontal, lateral y superior.
- Ejecución autónoma de una tarea de pick-and-place en un entorno de laboratorio controlado.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto.
- No dispone de capacidades multilingües, visión general, audio ni modo de razonamiento (thinking).
- No es un agente conversacional ni un modelo de propósito general: su alcance es la política entrenada para una única tarea.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo coge el rotulador fluorescente y lo deposita en la caja rosa de forma autónoma, adecuado para demostrar flujos de imitación con hardware SO-100/SO-101.
- Prototipado de pipelines de imitación con LeRobot: sirve como referencia para validar el ciclo completo de grabación, entrenamiento y despliegue con `lerobot-rollout` en un robot `so_follower`.
- Docencia e investigación en robótica de bajo coste: permite reproducir un experimento de ACT con 40 episodios y 15.000 pasos en una GPU de consumo, útil para cursos y talleres.
- Evaluación de robustez frente a distractores: la tarea incluye objetos que el robot debe evitar, lo que permite estudiar el comportamiento de la política ante falsos positivos visuales.
- Base para fine-tuning en tareas similares: al estar en Apache 2.0 y safetensors, se puede reentrenar con nuevos datasets manteniendo la arquitectura ACT y el esquema de observaciones.
- Integración en bancos de pruebas de manipulación: útil para comparar variantes de backbone visual (ResNet frente a otras alternativas) en la misma tarea y con el mismo dataset.
- Demostración de despliegue en robot real con tres cámaras: sirve para validar la sincronización de cámaras `front`, `side` y `top` a 30 FPS y la latencia del bucle de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (`No evaluation results have been provided for this policy yet`), por lo que no existe tasa de éxito medida, número de ensayos ni comparación cuantitativa con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 millones de parámetros (unos 207 MB en FP32 y unos 103 MB en FP16), por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, incluyendo GPUs integradas modestas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real será el procesamiento de las tres cámaras a 480x640 y 30 FPS, no el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en algunas integradas, dado el reducido tamaño del checkpoint (0,2 GB de repositorio).
- Opciones de despliegue: LeRobot con `lerobot-rollout` (comando documentado en la model card), con `--policy.path=Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_15K_18_11` y `--robot.type=so_follower`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. La model card no proporciona métricas de latencia ni de frecuencia de control efectiva; el dataset se grabó a 30 FPS, pero no se especifica la tasa de inferencia en robot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_15K_18_11 | ACT + ResNet | 51,7 M | no aplica | Pick-and-place de rotulador fluorescente | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | ACT | variable | no aplica | Manipulación diversa | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | Diffusion Policy | variable | no aplica | Manipulación diversa | variable | Hugging Face / LeRobot |
| Políticas VLA (p. ej. OpenVLA) | Transformer visión-lenguaje-acción | miles de millones | limitado | Manipulación guiada por lenguaje | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada. La comparación se limita a aspectos estructurales: este modelo es mucho más pequeño que las políticas VLA (51,7 M frente a miles de millones de parámetros), está especializado en una única tarea y no procesa instrucciones de lenguaje variables, a diferencia de los enfoques VLA.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único entorno; no generaliza a otras tareas, objetos o configuraciones de cámara sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 40 episodios y 15.387 fotogramas son insuficientes para capturar variaciones amplias de iluminación, posiciones de objetos o fondos; es probable un sobreajuste al entorno de grabación.
- Dependencia del hardware exacto: requiere un robot `so_follower` y tres cámaras con los nombres `front`, `side` y `top`; cambios en la configuración invalidan la política.
- Riesgo de alucinación en sentido robótico: puede ejecutar acciones incorrectas o intentar coger objetos prohibidos (mechero, botella) ante distribuciones visuales no vistas.
- Sesgos: no se documentan sesgos demográficos ni lingüísticos porque el modelo no procesa lenguaje ni personas; el sesgo relevante es el de la distribución de demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin cuantizaciones publicadas: no hay versiones GGUF ni ONNX, lo que limita el despliegue en entornos sin PyTorch/CUDA.
- Idiomas no aplicables: la instrucción de tarea se pasa como cadena fija y no se procesa semánticamente; no hay soporte multilingüe real.
- Fecha de creación futura (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_fluo_vs_gazeuse_briquet_resnet_15K_18_11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/40_fluo-vs-gazeuse-briquet_13h_23-11_20261123_131531
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference

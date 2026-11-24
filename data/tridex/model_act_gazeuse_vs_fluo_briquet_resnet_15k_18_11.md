# Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_15K_18_11

## Resumen

`Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_15K_18_11` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) sobre la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 6 dimensiones más tres cámaras RGB de 480x640) a comandos de acción de 6 dimensiones para un robot manipulador de tipo `so_follower`. El modelo tiene 51.668.614 parámetros en formato safetensors y ocupa 0,2 GB en el repositorio.

El modelo resuelve una tarea concreta de manipulación: coger una lata de refresco ("gazeuse") y depositarla dentro de una caja rosa, evitando explícitamente coger un mechero ("briquet") y un rotulador fluorescente amarillo ("fluo"). Se entrenó con 40 episodios de teleoperación (15.305 fotogramas a 30 FPS) durante 15.000 pasos con AdamW, batch de 8 y learning rate de 1e-5.

Es relevante como ejemplo de política ACT de extremo a extremo publicada en el Hub con licencia Apache 2.0, útil para reproducir el flujo de trabajo de LeRobot (grabación, entrenamiento y despliegue) y como referencia de un caso de aprendizaje por imitación con selección de objetos y distractores. No hay resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), backbone visual ResNet |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.front` (3,480,640), `observation.images.side` (3,480,640), `observation.images.top` (3,480,640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `front`, `side`, `top` |
| Libreria | LeRobot 0.6.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice trozos de acción ("action chunks") en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La política combina un codificador visual (ResNet, según indica el nombre del modelo) que procesa tres vistas de cámara con un transformer que fusiona las representaciones visuales con el estado articular y genera la secuencia de acciones. El modelo se entrenó con LeRobot 0.6.2 sobre el dataset `Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841`, compuesto por 40 episodios y 15.305 fotogramas a 30 FPS.

La configuración de entrenamiento fue de 15.000 pasos, batch de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se documenta en la información disponible el número de tokens (no aplica), la composición detallada del dataset, ni si hubo aumento de datos o regularización adicional. La tarea entrenada incluye una restricción negativa explícita (no coger el mechero ni el rotulador fluorescente), lo que convierte el modelo en un caso de selección de objeto entre distractores.

## Capacidades

- Control visomotor de un robot manipulador `so_follower` a partir de tres cámaras RGB y el estado articular.
- Predicción de chunks de acción de 6 dimensiones para ejecución continua.
- Selección de objeto entre distractores: la política está entrenada para coger la lata y evitar el mechero y el rotulador fluorescente.
- Ejecución de una tarea de pick-and-place con destino fijo (caja rosa).
- Integración con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modalidades de texto, audio o visión general; es una política robótica específica.

## Casos de uso

- Reproducción del flujo de LeRobot: sirve como ejemplo publicado para ejecutar `lerobot-rollout` con `--strategy.type=base` y validar la instalación de hardware, cámaras y calibración del robot `so_follower`.
- Pick-and-place con selección de objeto: la política demuestra cómo entrenar un manipulador para coger un objeto concreto y descartar distractores, patrón aplicable a líneas de clasificación o recogida selectiva.
- Base para fine-tuning con nuevos objetos: el checkpoint ACT puede reentrenarse con `lerobot-train` sobre datasets propios para adaptar la tarea a otras piezas o destinos.
- Investigación en aprendizaje por imitación: útil para estudiar el comportamiento de ACT con pocos episodios (40) y analizar robustez ante cambios de posición, iluminación o distractores.
- Docencia y prototipado en robótica de bajo coste: al ocupar 0,2 GB y tener 51,7 M de parámetros, es viable en estaciones de trabajo con GPU de consumo para experimentación.
- Evaluación de políticas en simulación o gemelo digital: el modelo puede integrarse en entornos que repliquen las observaciones de cámara y estado para pruebas previas al despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (ni tasa de éxito ni número de ensayos).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y tres cámaras de 480x640, el modelo cabe holgadamente en GPUs de consumo (estimación orientativa por debajo de 2 GB en FP32, sin contar buffers de las cámaras).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA para `lerobot-rollout`; una RTX 3060 o superior es suficiente para inferencia en tiempo real a 30 FPS.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y la GPU. La frecuencia de entrenamiento fue de 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT, ResNet) | 51,7 M | no aplica | Pick-and-place con distractores | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | Imitación robótica genérica | no disponible | Paper y código de referencia |
| Otras políticas LeRobot publicadas | variable | no aplica | Tareas de manipulación diversas | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real en robot físico.
- Entrenada con solo 40 episodios; la generalización a nuevas posiciones, iluminación o disposición de objetos es incierta.
- La política está especializada en un robot `so_follower` y en la configuración exacta de tres cámaras (`front`, `side`, `top`); cambiar la disposición o los índices de cámara invalida la inferencia.
- La tarea está definida en inglés y con una restricción negativa explícita; no es un modelo de propósito general.
- Riesgo de sobreajuste al entorno de grabación y a los objetos concretos del dataset.
- No se documentan sesgos, pero al ser un modelo visual puede verse afectado por condiciones de iluminación y oclusiones no representadas en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar el comportamiento en producción recae en el integrador.
- No apta para tareas de lenguaje, razonamiento o generación de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_gazeuse_vs_fluo_briquet_resnet_15K_18_11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/40_gazeuse-vs-fluo-briquet_14h_23-11_20261123_135841

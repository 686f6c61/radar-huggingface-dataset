# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_expert_600k-steps30k-decay30k

## Resumen

SOBIT Home Left es una política visión-lenguaje-acción (VLA) compacta obtenida mediante fine-tuning de `lerobot/smolvla_base`, el modelo base de SmolVLA presentado en el paper arXiv:2506.01844. La desarrolla el equipo `team-sobits` y está publicada en Hugging Face Hub bajo licencia Apache 2.0. Su propósito es controlar un manipulador móvil (robot tipo `mobile_manipulator`) con dos cámaras —una en la cabeza y otra en la mano izquierda— para ejecutar una tarea concreta de manipulación doméstica: arrojar una lata de tomate a una papelera.

El modelo no es un LLM de propósito general, sino una policy de imitación entrenada con LeRobot 0.6.1 sobre un único dataset de 200 episodios (48.141 frames a 10 FPS) generado en simulación. Con 450.046.176 parámetros (aproximadamente 450 M), se sitúa en la categoría de VLA pequeños diseñados para desplegarse en hardware de consumo, en línea con la filosofía de SmolVLA: rendimiento competitivo con coste computacional reducido.

Es relevante ahora porque ejemplifica el flujo actual de robótica open source: partir de un modelo base preentrenado, fine-tunear con un dataset propio de demostraciones y publicar la policy resultante con instrucciones reproducibles de rollout y entrenamiento. No obstante, se trata de un artefacto muy especializado (una sola tarea, un solo robot, datos simulados) y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; no se detalla la composición interna en la model card |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural como un LLM; recibe una instrucción de tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(20,)` |
| `observation.images.head_camera` | VISUAL | `(3, 480, 640)` |
| `observation.images.hand_left_camera` | VISUAL | `(3, 400, 640)` |
| `action` | ACTION | `(20,)` |

| Parametro de entrenamiento | Valor |
|---|---|
| Modelo base | `lerobot/smolvla_base` |
| Dataset | `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep` |
| Episodios / frames | 200 / 48.141 |
| Frame rate del dataset | 10 FPS |
| Pasos de entrenamiento | 30.000 |
| Batch size | 20 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tipo de robot | `mobile_manipulator` |
| Cámaras | `head_camera`, `hand_left_camera` |
| Tarea | "Throw the tomato can into the trash bin" |

## Arquitectura y entrenamiento

La model card no describe en detalle la arquitectura interna; se remite al paper de SmolVLA (arXiv:2506.01844), que define un modelo visión-lenguaje-acción compacto y eficiente, pensado para ejecutarse en hardware de consumo. La policy recibe como entrada el estado del robot (vector de 20 dimensiones) y dos flujos de imagen (cámara de cabeza a 480×640 y cámara de mano izquierda a 400×640), y produce un vector de acción de 20 dimensiones. No se especifica en la información disponible si emplea atención lineal, decodificación especulativa u otras innovaciones del paper, ni el número de tokens o la composición del corpus de preentrenamiento del modelo base.

El entrenamiento es de imitación supervisada (behavior cloning) sobre demostraciones, no se documenta RLHF ni DPO. Se parte de `lerobot/smolvla_base` y se fine-tunea durante 30.000 pasos con batch size 20, AdamW y learning rate 1e-4, semilla 1000, usando LeRobot 0.6.1. El dataset contiene 200 episodios y 48.141 frames a 10 FPS, todos ellos generados en simulación (`sim-pnp`) para la tarea de arrojar una lata de tomate a la papelera. El nombre del repositorio sugiere un ajuste con decaimiento de learning rate a partir de los 30.000 pasos (`steps30k-decay30k`), aunque el detalle no se explicita en la model card.

## Capacidades

- Control de un manipulador móvil mediante imitación: mapea observaciones (estado articular y dos imágenes) a comandos de acción de 20 dimensiones.
- Percepción visual multimodal con dos cámaras simultáneas (cabeza y mano izquierda).
- Ejecución de una tarea de manipulación concreta: coger una lata de tomate y arrojarla a una papelera.
- Condicionamiento por instrucción de tarea en texto (`--task="Throw the tomato can into the trash bin"`), heredado del paradigma VLA.
- Despliegue en hardware de consumo, según la premisa de SmolVLA.
- Integración con el ecosistema LeRobot: rollout con `lerobot-rollout` y reentrenamiento con `lerobot-train`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, código, matemáticas ni procesamiento de audio.

## Casos de uso

- Investigación en imitación robótica: servir como punto de partida reproducible para estudiar el fine-tuning de SmolVLA sobre un dataset propio, comparando hiperparámetros y número de episodios.
- Benchmark de políticas VLA pequeñas: evaluar en simulación el éxito de una policy de 450 M de parámetros frente a alternativas mayores en la misma tarea de pick-and-place.
- Prototipado de tareas de recogida de residuos: adaptar el pipeline (dataset, entrenamiento, rollout) a tareas análogas como depositar objetos en contenedores.
- Validación de pipelines LeRobot 0.6.1: usar el repositorio como ejemplo funcional de configuración de robot `mobile_manipulator` con dos cámaras y claves de observación específicas.
- Docencia y formación: demostrar el ciclo completo de aprendizaje por imitación (grabación de datos, entrenamiento, despliegue) con un modelo de tamaño manejable.
- Pruebas de integración hardware-software: verificar la calibración de cámaras y puertos de un manipulador móvil antes de escalar a políticas más complejas.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni ninguna tarea de lenguaje natural: su salida es un vector de acciones motoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta policy, por lo que no existen tasas de éxito ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros, los pesos en precisión completa (fp32) ocuparían aproximadamente 1,8 GB, y en fp16/bf16 alrededor de 0,9 GB, a lo que hay que sumar el coste de procesar dos flujos de imagen por paso. El tamaño del repositorio es de 4,8 GB, probablemente por checkpoints y artefactos adicionales.
- GPU recomendadas: no especificadas en la model card. SmolVLA está diseñado para hardware de consumo, por lo que una GPU consumer con suficiente memoria para el modelo y las imágenes debería ser viable; no se confirman modelos concretos.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no hay confirmación oficial ni cifras de latencia.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` con `--policy.device=cuda` para reentrenamiento. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de policy.
- Latencia y throughput: no disponibles. El dataset está grabado a 10 FPS, lo que da una referencia del régimen temporal de la tarea, pero no se publica la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOBIT Home Left (este modelo) | 450.046.176 | no disponible | Manipulación: lata a papelera | Apache 2.0 | Hugging Face Hub, 21 descargas |
| `lerobot/smolvla_base` | no disponible en la información proporcionada | no disponible | VLA base preentrenada, fine-tuneable | no disponible en la información proporcionada | Hugging Face Hub |
| Otras policies LeRobot del mismo autor | no disponible | no disponible | Tareas específicas de robot | no disponible | Hugging Face Hub |

La información disponible no incluye datos de rendimiento ni especificaciones completas de los modelos comparables, por lo que no es posible establecer una comparación cuantitativa. La comparación más directa es con su modelo base `lerobot/smolvla_base`, del que este repositorio es un fine-tune especializado en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una sola tarea ("Throw the tomato can into the trash bin") en un único tipo de robot; no generaliza a otras tareas sin reentrenamiento.
- Datos exclusivamente simulados (`sim-pnp`): el rendimiento en el mundo real no está validado y puede degradarse por diferencias de dominio (iluminación, texturas, dinámica).
- Sin evaluación publicada: no hay tasas de éxito ni número de ensayos, por lo que no se puede afirmar que la policy funcione de forma fiable.
- Dependencia de configuración exacta: las claves de observación (`head_camera`, `hand_left_camera`), las resoluciones y el vector de estado de 20 dimensiones deben coincidir con el robot de despliegue.
- Riesgo de sobreajuste al dataset de 200 episodios y 48.141 frames, con una única semilla de entrenamiento (1000).
- Sin información sobre sesgos: al no procesar lenguaje natural ni datos humanos, los sesgos típicos de LLM no aplican, pero no se documenta ningún análisis de robustez.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume la responsabilidad sobre el comportamiento del robot; no hay garantías del autor.
- No apto para producción sin validación previa en el robot objetivo y con protocolos de seguridad física.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep-smolvla_expert_600k-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200ep
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

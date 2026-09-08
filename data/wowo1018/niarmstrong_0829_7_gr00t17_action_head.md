# wowo1018/NiArmStrong_0829_7_GR00T17_action_head

## Resumen

NiArmStrong_0829_7_GR00T17_action_head es una política de imitación (policy) para robótica, desarrollada por wowo1018 y publicada en HuggingFace. Se trata de un "action head" entrenado sobre el modelo fundacional GR00T N1.7 de NVIDIA, que combina un backbone multimodal Cosmos-Reason2/Qwen3-VL con un transformador de acciones basado en flow-matching. El modelo está diseñado para controlar un brazo robótico híbrido (hybrid_arm) en tareas de pick_and_place, usando como entradas el estado del robot y dos cámaras (usb y zed_left). Con 3.144.016.000 parámetros (aproximadamente 3.14B), el modelo fue entrenado con LeRobot sobre el dataset soliscute/NiArmStrong_0829_7_final_stats.

El dataset de entrenamiento está compuesto por 101 episodios y 43.548 frames a 30 FPS, todos correspondientes a la tarea de pick_and_place. La licencia es Apache 2.0, y el formato de pesos es safetensors. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un modelo fundacional de robótica para una tarea concreta, con una arquitectura de vanguardia y disponibilidad abierta para investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3.14B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Robot type | hybrid_arm |
| Camaras | usb, zed_left |
| Tarea entrenada | pick_and_place |
| Framework | LeRobot 0.6.2 |
| Dataset de entrenamiento | soliscute/NiArmStrong_0829_7_final_stats (101 episodios, 43.548 frames, 30 FPS) |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7, un modelo fundacional de NVIDIA para razonamiento y habilidades de robots humanoides. La arquitectura combina un backbone multimodal Cosmos-Reason2/Qwen3-VL, encargado de procesar la información visual y de lenguaje, con un transformador de acciones que utiliza flow-matching para predecir acciones continuas condicionadas por visión, lenguaje y propiocepción. En este repositorio, el modelo se presenta como un "action head" específico: la salida es un vector de acción de 7 dimensiones (action), y las entradas son el estado del robot (observation.state, 7 dimensiones) y dos imágenes de 480x640 píxeles procedentes de las cámaras usb y zed_left.

El entrenamiento se realizó con LeRobot 0.6.2 sobre un dataset de demostración de la tarea pick_and_place. El dataset contiene 101 episodios y 43.548 frames a 30 FPS. La configuración de entrenamiento incluye 12.000 pasos, batch size de 16, optimizador AdamW con learning rate de 0.0001 y semilla 42. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones de control para un brazo robótico híbrido, con salida de 7 dimensiones (probablemente posiciones o velocidades articulares).
- Percepción visual a partir de dos cámaras simultáneas: una cámara USB y una cámara ZED (estereoscópica), con resolución de 480x640 píxeles.
- Ejecución de la tarea de manipulación pick_and_place: recoger un objeto y colocarlo en una posición objetivo.
- Integración con LeRobot para inferencia en tiempo real mediante el comando `lerobot-rollout`.
- Capacidad de ser reentrenado o afinado sobre nuevos datasets de demostración usando `lerobot-train`.
- Al estar basado en GR00T N1.7, hereda el diseño para razonamiento y habilidades generales de robots humanoides, aunque este checkpoint concreto está especializado en una única tarea.
- No es un modelo de lenguaje: no genera texto ni soporta tool calling; su salida es exclusivamente un vector de acciones.

## Casos de uso

- Automatización de picking en almacenes: el modelo puede controlar un brazo robótico para recoger objetos de una cinta transportadora y colocarlos en contenedores, usando las cámaras para localizar los objetos. Es adecuado porque está entrenado específicamente para la secuencia de recoger y colocar.
- Ensamblaje industrial: en tareas de pick_and_place en líneas de producción, el modelo genera acciones precisas para manipular piezas, reduciendo la necesidad de programación manual. Su arquitectura basada en GR00T N1.7 permite manejar entradas visuales complejas.
- Manipulación doméstica asistida: un brazo híbrido puede recoger objetos cotidianos y colocarlos en ubicaciones designadas, con supervisión humana. El modelo puede ejecutar la tarea de forma autónoma a partir de las imágenes de las cámaras.
- Investigación en robótica: sirve como punto de partida para fine-tuning en nuevas tareas de manipulación, gracias a su integración con LeRobot y su licencia Apache 2.0. Los investigadores pueden reentrenarlo con datasets propios.
- Clasificación de objetos en logística: el modelo puede separar objetos según su tipo o destino, ejecutando secuencias de pick_and_place con la información visual de las cámaras. Es adecuado para tareas repetitivas con alta demanda de fiabilidad.
- Colaboración humano-robot: en entornos de trabajo compartidos, el modelo ejecuta tareas repetitivas de recogida y colocación, liberando a los operarios de tareas monótonas. Su capacidad de percibir el entorno con dos cámaras permite adaptarse a cambios leves en la disposición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- El repositorio de pesos en safetensors ocupa 12.6 GB, lo que sugiere almacenamiento en precisión FP32 (3.144.016.000 parámetros x 4 bytes ≈ 12.6 GB).
- Para inferencia con LeRobot, se estima que se necesita una GPU con al menos 16 GB de VRAM para alojar los pesos y los tensores de activación en FP32. Una RTX 4090 (24 GB) o una A100 (40/80 GB) son opciones adecuadas.
- No se han publicado datos de latencia ni throughput.
- Despliegue: mediante LeRobot, usando el comando `lerobot-rollout` con `--policy.path=wowo1018/NiArmStrong_0829_7_GR00T17_action_head`. También se puede entrenar con `lerobot-train`.
- No se dispone de información sobre cuantizaciones compatibles (GGUF, etc.), por lo que el despliegue en CPU o en GPUs de gama baja no está garantizado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo es un fine-tuning específico de GR00T N1.7, pero no se han publicado resultados comparativos con otros policies de manipulación.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeño: solo 101 episodios y 43.548 frames, lo que limita la generalización a nuevas posiciones, iluminación o distracciones.
- Especialización extrema: el modelo solo está entrenado para la tarea pick_and_place y para un brazo híbrido con cámaras usb y zed_left. No funcionará en otros robots ni en otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay datos de tasa de éxito en el mundo real, por lo que el rendimiento real es desconocido.
- Posibles sesgos en la percepción: al estar entrenado con un dataset limitado, el modelo puede fallar con objetos o escenas no representadas en los datos.
- Riesgo de acciones incorrectas: si las observaciones están fuera de la distribución de entrenamiento, el modelo puede generar acciones no seguras. Es necesario implementar supervisión y límites de seguridad en el robot.
- Anomalía en metadatos: la fecha de creación indicada en HuggingFace es 2026-09-08, lo que podría ser un error en los metadatos o un repositorio de prueba.
- Idiomas y contexto: no se especifican idiomas ni longitud de contexto, ya que el modelo no está diseñado para tareas de lenguaje; su entrada es principalmente visual y de estado.

## Enlaces

- HuggingFace: https://huggingface.co/wowo1018/NiArmStrong_0829_7_GR00T17_action_head
- Dataset de entrenamiento: https://huggingface.co/datasets/soliscute/NiArmStrong_0829_7_final_stats
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=soliscute/NiArmStrong_0829_7_final_stats
- LeRobot: https://github.com/huggingface/lerobot
- GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T

# timzark/act_so101_pick_place_v2

## Resumen

`timzark/act_so101_pick_place_v2` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT) sobre el robot `so_follower` (plataforma SO-101) para la tarea concreta de coger un bloque y depositarlo en una taza. No es un modelo de lenguaje: es un modelo de control robótico que consume el estado articular (6 dimensiones) y una imagen frontal de 480x640 y produce una acción de 6 dimensiones. Lo publica el usuario timzark mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Se entrenó sobre un dataset propio de 30 episodios y 8.712 fotogramas a 30 FPS, durante 20.000 pasos con AdamW, batch de 8 y learning rate de 1e-5. Es, por tanto, un artefacto de investigación reproducible y de alcance muy acotado: una única tarea, un único tipo de robot y una única cámara.

Su relevancia es la de un ejemplo práctico y ligero de ACT aplicado a un brazo de bajo coste. No compite con modelos fundacionales de robótica ni con VLA de gran escala; sirve para validar el pipeline de LeRobot (grabación de datos, entrenamiento, rollout) y como punto de partida para quien quiera replicar la tarea o adaptar la receta a otro objeto o robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | so_follower (SO-101) |
| Entradas | observation.state (6,), observation.images.front (3, 480, 640) |
| Salidas | action (6,) |
| Frecuencia de datos | 30 FPS |
| Tarea | "Pick up the block and place it in the cup" |
| Dataset de entrenamiento | timzark/so101_pick_place_v2_20261115_223617 (30 episodios, 8.712 fotogramas) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. La arquitectura combina un codificador visual (procesa la imagen frontal de 480x640) con un transformer que, condicionado por el estado articular de 6 dimensiones y las representaciones visuales, genera una secuencia de acciones de 6 dimensiones. El modelo sigue el paper ACT (arXiv:2304.13705) y se entrenó con la implementación de LeRobot 0.7.0.

Los datos provienen de teleoperación sobre el robot SO-101: 30 episodios, 8.712 fotogramas a 30 FPS, todos de la misma tarea ("Pick up the block and place it in the cup"). El entrenamiento se hizo durante 20.000 pasos con AdamW, batch de 8, learning rate de 1e-5 y semilla 1000. No se documenta en la información disponible el uso de RLHF, DPO ni aumentos de datos, ni innovaciones adicionales más allá de las propias de ACT (predicción por chunks y regularización de la varianza de la acción, según el método original).

## Capacidades

- Control robótico de manipulación: ejecuta una política de agarre y colocación sobre el robot SO-101 (`so_follower`).
- Entrada multimodal: combina estado propioceptivo (6 dimensiones) con una imagen RGB frontal de 480x640.
- Predicción de acciones por chunks: genera secuencias cortas de acción (6 dimensiones por paso) en lugar de comandos aislados.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación, sin refuerzo ni recompensas explícitas.
- Ejecución en bucle cerrado: consume observaciones en tiempo real a 30 FPS y emite acciones de forma continua.
- Alcance de una sola tarea: no soporta tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento; no es un modelo generativo de texto.

## Casos de uso

- Replicación de la tarea pick-and-place: ejecutar la política sobre un SO-101 con cámara frontal para coger un bloque y dejarlo en una taza, usando `lerobot-rollout` con `--policy.path=timzark/act_so101_pick_place_v2` y la tarea indicada. Es el uso directo y el único validado por el autor.
- Validación de un pipeline de imitación completo: sirve como referencia de extremo a extremo (grabación, entrenamiento con `lerobot-train`, rollout) para equipos que estén montando su primer flujo con LeRobot 0.7.0.
- Base para fine-tuning en una tarea nueva: partir de estos pesos y reentrenar con un dataset propio de otro objeto o contenedor, manteniendo el mismo robot y configuración de cámara.
- Docencia y demostraciones de robótica de bajo coste: el tamaño (51,7 M de parámetros, 0,2 GB) permite mostrarlo en talleres y asignaturas con hardware asequible.
- Pruebas de robustez y evaluación de políticas: usar el modelo como sujeto de experimentos sobre sensibilidad a iluminación, posiciones de objeto o distracciones, ya que el autor no ha publicado resultados de evaluación.
- Integración en un banco de pruebas de manipulación: comparar ACT frente a otras políticas de LeRobot (por ejemplo, diffusion policy) sobre la misma tarea y el mismo dataset de 30 episodios.
- Automatización de una celda de pick-and-place simple: en un entorno controlado con posiciones de objeto y taza fijas, desplegar la política para una demostración repetible de recogida y depósito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía ("No evaluation results have been provided for this policy yet."), sin tasas de éxito, número de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros los pesos ocupan del orden de 0,1 GB en FP32 y menos en FP16. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real es la latencia de captura de cámara y del bucle de control a 30 FPS, no el cómputo del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas; también es viable en CPU para pruebas no críticas, aunque no se documenta latencia.
- Opciones de despliegue: LeRobot con `lerobot-rollout` (estrategia `base`), tal como indica la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El modelo se ejecuta a la frecuencia de los datos de entrenamiento (30 FPS), pero no se publican medidas de latencia por paso ni de tasa de éxito.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| timzark/act_so101_pick_place_v2 | ACT (LeRobot) | 51,7 M | estado (6,) + imagen 480x640 | pick-and-place en SO-101 | no disponible | Hugging Face |
| Políticas ACT de LeRobot (genéricas) | ACT (LeRobot) | variable según configuración | estado + imágenes | tareas de manipulación diversas | según repositorio | Hugging Face / LeRobot |
| Diffusion Policy (LeRobot) | difusión de acciones | variable | estado + imágenes | manipulación por imitación | según repositorio | Hugging Face / LeRobot |
| Modelos VLA de gran escala (p. ej. familias tipo RT/OpenVLA) | VLA | miles de millones | imágenes + instrucciones en lenguaje | manipulación generalista | según modelo | Hugging Face / repos públicos |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica tasas de éxito ni métricas frente a alternativas. La comparación se limita a tipo de método, tamaño y modalidad de entrada.

## Limitaciones y advertencias

- Alcance de una sola tarea: entrenado exclusivamente para "Pick up the block and place it in the cup"; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeño: 30 episodios y 8.712 fotogramas, lo que limita la robustez ante variaciones de posición, iluminación, fondo o tipo de objeto.
- Sin evaluación publicada: no hay tasas de éxito ni protocolo de prueba, por lo que el rendimiento real es desconocido.
- Dependencia del hardware: requiere un robot `so_follower` (SO-101) y una cámara frontal con la misma configuración (480x640, 30 FPS); los nombres de cámara deben coincidir con las claves de observación del entrenamiento.
- Licencia no especificada: la model card indica "[More Information Needed]", por lo que el uso comercial no está autorizado de forma explícita y debe consultarse con el autor.
- Riesgo de sobreajuste al entorno de grabación: al no documentarse variaciones en los datos, es probable que la política falle ante cambios de disposición de objetos o de iluminación.
- Sin soporte de lenguaje natural: no acepta instrucciones en texto ni tool calling; la tarea va fijada en el prompt de rollout.
- Sin garantías de seguridad física: es una política de investigación sin validación de seguridad para operar cerca de personas; requiere supervisión y paradas de emergencia en el robot.
- Idiomas y sesgos: no aplica como modelo de lenguaje, pero puede heredar sesgos de los datos de teleoperación (posiciones, objetos y condiciones concretas del demostrador).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timzark/act_so101_pick_place_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/timzark/so101_pick_place_v2_20261115_223617
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=timzark/so101_pick_place_v2_20261115_223617
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

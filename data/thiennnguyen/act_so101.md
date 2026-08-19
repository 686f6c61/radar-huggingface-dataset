# ThiennNguyen/act_so101

## Resumen

El modelo `ThiennNguyen/act_so101` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por ThiennNguyen y publicada en Hugging Face bajo licencia Apache 2.0. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. El modelo ha sido entrenado con el framework LeRobot y está diseñado para operar sobre un robot tipo `so_follower` con una cámara frontal.

Con 51,67 millones de parámetros, es un modelo compacto que procesa observaciones de estado (6 dimensiones) e imágenes RGB (480x640) para generar comandos de acción de 6 dimensiones. Su relevancia radica en que demuestra cómo un transformer de imitación puede resolver tareas de pick-and-place con un dataset reducido (10 episodios, 5756 frames), siendo un ejemplo práctico de entrenamiento de políticas robóticas con herramientas open source. El modelo se distribuye en formato safetensors y se integra directamente con el ecosistema LeRobot para entrenamiento y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador de vision y estado, y decodificador autoregresivo de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa observaciones por paso; el chunk de acciones se define en configuracion de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no aplica (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT combina un codificador de vision (para procesar la imagen de la camara frontal) con un codificador de estado (para las 6 dimensiones de observacion del robot) y un decodificador transformer que genera de forma autoregresiva un chunk de acciones futuras. Esta prediccion por chunks reduce la acumulacion de errores y mejora la estabilidad del control en comparacion con politicas que predicen un solo paso.

El entrenamiento se realizo con el framework LeRobot (version 0.6.2) sobre el dataset `ThiennNguyen/record_test_1408`, que contiene 10 episodios teleoperados (5756 frames a 30 FPS) de la tarea "Pick the candy and place it in the basket". La configuracion de entrenamiento incluye 10.000 pasos, batch size de 32, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento; es un entrenamiento puramente de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones (probablemente posicion y orientacion del efector final) a partir de observaciones de estado e imagen.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados, en este caso la tarea de recoger un caramelo y colocarlo en una cesta.
- Procesamiento visual: utiliza una camara frontal con resolucion 480x640 para percibir el entorno.
- Prediccion de chunks de acciones: genera secuencias de acciones en lugar de pasos individuales, lo que mejora la suavidad del movimiento.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multimodal fuera del ambito robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea especifica de recoger un objeto (caramelo) y depositarlo en una cesta, replicando la demostracion teleoperada. Es adecuado para prototipos de celdas de manipulacion con un robot `so_follower`.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del tamaño del dataset, la longitud del chunk o la arquitectura ACT en tareas de manipulacion reales.
- Desarrollo de politicas roboticas con LeRobot: los desarrolladores pueden clonar el repositorio, cargar los pesos y usarlos como referencia para entrenar sus propias politicas con el mismo tipo de robot y camara.
- Validacion de pipelines de entrenamiento: al ser un modelo pequeno (51M parametros), permite probar flujos completos de registro de datos, entrenamiento y rollout en hardware modesto antes de escalar a modelos mayores.
- Educacion en robotica y aprendizaje automatico: util en cursos o talleres donde se necesite un ejemplo funcional de politica de imitacion con codigo abierto y documentacion clara.
- Benchmarking de metodos de control: puede compararse con otras politicas (p. ej., Diffusion Policy) en la misma tarea para evaluar ventajas y desventajas de ACT en terminos de precision y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet". No se proporcionan metricas de exito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 millones de parametros, el modelo ocupa aproximadamente 207 MB en FP32 y 103 MB en FP16. La inferencia requiere ademas memoria para el procesamiento de imagenes (480x640x3), por lo que una GPU con al menos 2 GB de VRAM es suficiente.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, incluyendo NVIDIA GTX 1650, RTX 3060, RTX 4090, A100, etc. Tambien puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU consumer actual e incluso en placas integradas con suficiente RAM compartida.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia en tiempo real via `lerobot-rollout`. No se mencionan otros motores como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Depende del hardware y de la configuracion de la camara; al ser un modelo pequeno, se espera una latencia de pocos milisegundos por paso en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos comparables en el mismo repositorio o con la misma configuracion. Como referencia, la arquitectura ACT se ha utilizado en multiples politicas de LeRobot, pero no se han proporcionado datos de otros modelos entrenados para la misma tarea. Se puede comparar conceptualmente con Diffusion Policy (otro metodo de aprendizaje por imitacion), pero no hay datos cuantitativos disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThiennNguyen/act_so101 | 51,67 M | no disponible | Pick-and-place (caramelo en cesta) | Apache 2.0 | Hugging Face |
| Otros modelos ACT en LeRobot | no disponible | no disponible | no disponible | Apache 2.0 (tipico) | Hugging Face |
| Diffusion Policy (referencia) | no disponible | no disponible | manipulacion general | no disponible | no disponible |

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 10 episodios y 5756 frames, lo que aumenta el riesgo de sobreajuste y limita la generalizacion a variaciones de posicion, iluminacion o presencia de distractores.
- Sin evaluacion publicada: no hay resultados de exito en el robot real, por lo que el rendimiento real es desconocido.
- Tarea especifica: el modelo esta entrenado unicamente para "Pick the candy and place it in the basket"; no es transferible a otras tareas sin reentrenamiento.
- Dependencia de la configuracion del robot: requiere un robot `so_follower` con una camara frontal calibrada de forma identica a la usada en el entrenamiento; cambios en la posicion de la camara o en la cinematica del robot degradaran el rendimiento.
- Riesgo de alucinacion de acciones: como cualquier politica de imitacion, puede generar comandos de accion incorrectos o inseguros si las observaciones difieren del dominio de entrenamiento; se recomienda supervisar el despliegue.
- Sin soporte de lenguaje ni interaccion multimodal: no es un modelo de lenguaje y no puede procesar instrucciones textuales.
- Fecha de creacion futura (2026-08-14): el modelo fue publicado con una fecha posterior a la actual, lo que sugiere un posible error de metadatos; verificar la validez del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ThiennNguyen/act_so101
- Dataset de entrenamiento: https://huggingface.co/datasets/ThiennNguyen/record_test_1408
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de entrenamiento e inferencia: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ThiennNguyen/record_test_1408

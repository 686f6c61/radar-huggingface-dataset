# Yewy/rollout_mahjong_container_pickup_v1_policy

## Resumen

El modelo `Yewy/rollout_mahjong_container_pickup_v1_policy` es una política de control robótico entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers), publicado en el paper arXiv:2304.13705. Desarrollado por Yewy (Ethan Yew) y publicado en Hugging Face bajo licencia Apache 2.0, el modelo está especializado en una tarea concreta: recoger una ficha de mahjong de un contenedor usando un brazo robótico equipado con una cámara en la muñeca.

La política forma parte del ecosistema LeRobot de Hugging Face, que permite entrenar, evaluar y desplegar políticas de control en robots reales o simulados. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto que procesa imágenes de 224x224 píxeles junto con el estado del robot (6 dimensiones) para generar acciones de 6 dimensiones. Su relevancia actual radica en ser un ejemplo práctico de aplicación de transformers a la robótica de manipulación, con un tamaño lo suficientemente pequeño para ejecutarse en hardware de consumo.

El modelo se entrenó sobre un dataset propio del autor, `Yewy/mahjong_container_pickup_224`, que contiene 71 episodios teleoperados y 33.017 fotogramas a 30 FPS. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), encoder-decoder con VAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones por paso, sin contexto temporal explícito) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplicable (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad del control y reduce la acumulacion de errores. El modelo combina un encoder de imagenes (tipicamente un ResNet preentrenado) con un transformer encoder-decoder y un VAE (variational autoencoder) para modelar la variabilidad multimodal de las demostraciones. En este caso, la entrada visual es una unica camara `wrist` con resolucion 224x224x3, junto con dos vectores de estado de 6 dimensiones (`observation.state` y `observation.state_raw`). La salida es un vector de accion de 6 dimensiones (`action` y `action_raw`).

El entrenamiento se realizo con el framework LeRobot version 0.6.1, durante 100.000 pasos con un batch size de 96, optimizador AdamW y una tasa de aprendizaje de 1e-05, con semilla fija 1000. El dataset de entrenamiento contiene 71 episodios teleoperados (33.017 fotogramas a 30 FPS) de la tarea "recoger la ficha de mahjong del contenedor". No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posterior; se trata de aprendizaje por imitacion puro.

## Capacidades

- Control robotico de manipulacion: genera comandos de accion de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion de demostraciones teleoperadas: reproduce la tarea aprendida con alta fidelidad, gracias a la prediccion de chunks de acciones.
- Procesamiento de imagenes de camara de muneca: utiliza una unica vista RGB de 224x224 píxeles para percibir el entorno.
- Generalizacion limitada: la politica esta entrenada para una tarea especifica (recoger ficha de mahjong de un contenedor) y no es un modelo generalista.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.
- Sin capacidades de lenguaje, vision general, tool calling ni razonamiento simbolico: es un modelo puramente motor.

## Casos de uso

- Automatizacion de tareas de recogida en entornos controlados: el modelo puede integrarse en una celda de trabajo robotica para recoger piezas pequeñas (fichas, componentes) de contenedores, reduciendo la intervencion manual en lineas de montaje o clasificacion.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio para comparar el rendimiento de ACT frente a otros metodos (diffusion policies, etc.) en tareas de manipulacion con una sola camara.
- Prototipado rapido de politicas robotizadas: gracias a su tamano reducido y a la integracion con LeRobot, permite validar flujos de trabajo de entrenamiento y despliegue en pocas horas, sin necesidad de hardware de altas prestaciones.
- Demostracion educativa: util para cursos de robotica y aprendizaje automatico donde se ensena a entrenar y ejecutar politicas de control en robots reales o simulados.
- Prueba de concepto para control de brazos roboticos de bajo coste: al requerir poca VRAM y computo, puede ejecutarse en GPUs de gama media, facilitando su uso en laboratorios con presupuesto limitado.
- Generacion de datos de entrenamiento: el modelo puede utilizarse para realizar rollouts que generen nuevos datos de demostracion, ampliando el dataset original o explorando variaciones de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." Por tanto, no se dispone de tasas de exito en robot real, ni comparaciones con otros metodos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~51,7 millones de parametros con entrada de imagen 224x224, la inferencia en FP32 requiere aproximadamente 200-400 MB de VRAM (estimacion orientativa basada en el tamano del modelo; no hay datos oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia, por ejemplo NVIDIA GTX 1050 Ti, RTX 2060 o superiores. Para entrenamiento, se recomienda al menos 8 GB de VRAM (por ejemplo RTX 3070, RTX 4060 Ti) para acomodar el batch size de 96.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de gama baja y media sin problema.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. Tambien puede integrarse en pipelines de inferencia personalizados usando PyTorch y safetensors.
- Latencia y throughput: no disponibles. Depende del hardware y del robot utilizado.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria, ya que no se han publicado benchmarks ni se han identificado modelos comparables en el repositorio del autor. En el ecosistema LeRobot existen otras politicas ACT entrenadas para tareas de manipulacion (por ejemplo, recoger objetos de mesas o contenedores), pero no se dispone de datos publicos que permitan una comparacion cuantitativa. Se recomienda consultar el hub de LeRobot para encontrar modelos similares y evaluar cualitativamente sus diferencias en cuanto a dataset, camaras y tareas.

## Limitaciones y advertencias

- Especializacion estricta: el modelo solo realiza la tarea para la que fue entrenado (recoger ficha de mahjong de un contenedor). No generaliza a otros objetos, posiciones o entornos sin reentrenamiento.
- Sin resultados de evaluacion: no hay datos de tasas de exito ni pruebas en robot real publicadas, por lo que su rendimiento real es desconocido.
- Dependencia de la configuracion del robot: la politica asume una configuracion especifica de camara (unica camara `wrist`) y de espacio de acciones (6 dimensiones). Cambios en la cinematica del robot o en la colocacion de la camara invalidan la politica.
- Riesgo de sobreajuste al dataset: con solo 71 episodios, es probable que el modelo no haya capturado toda la variabilidad del entorno (iluminacion, posiciones de la ficha, oclusiones), lo que puede provocar fallos en condiciones ligeramente diferentes.
- Alucinacion de acciones: como cualquier politica de aprendizaje por imitacion, puede generar comandos de accion incorrectos o inestables si la observacion se aleja de la distribucion de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no incluye garantias de funcionamiento ni soporte.
- Sin soporte de lenguaje ni interaccion multimodal: no es adecuado para tareas que requieran comprension de instrucciones textuales o dialogos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Yewy/rollout_mahjong_container_pickup_v1_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/Yewy/mahjong_container_pickup_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Yewy/mahjong_container_pickup_224
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Perfil del autor en Hugging Face: https://huggingface.co/Yewy/models

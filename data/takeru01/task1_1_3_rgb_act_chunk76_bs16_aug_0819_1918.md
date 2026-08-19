# takeru01/task1_1_3_rgb_act_chunk76_bs16_aug_0819_1918

## Resumen

Este modelo es un checkpoint de política robótica entrenado con la arquitectura Action Chunking with Transformers (ACT), publicada en el paper de Zhao et al. (2023). Lo desarrolla el usuario takeru01 y se distribuye a través del ecosistema LeRobot de Hugging Face, una librería de código abierto para aprendizaje por imitación en robótica real. El modelo resuelve una tarea de manipulación dual con dos brazos UR5e, aprendiendo a generar secuencias de acciones a partir de observaciones visuales (cuatro cámaras RGB) y de estado (posiciones articulares, velocidades y posición de las pinzas).

El modelo tiene 51,66 millones de parámetros, un tamaño modesto que permite inferencia en tiempo real en hardware de consumo. Se entrenó durante 100.000 pasos con un batch de 16 sobre un dataset de 111 episodios teleoperados (314.366 frames a 30 FPS). La relevancia actual radica en que ACT es uno de los métodos de aprendizaje por imitación más utilizados en robótica manipuladora, y este checkpoint es un ejemplo práctico de cómo LeRobot permite entrenar y desplegar políticas en robots reales con un flujo reproducible. El nombre del repositorio indica que usa un chunk de acciones de 76 pasos, lo que permite planificar trayectorias cortas en lugar de acciones individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.660.430 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un LLM; usa chunks de 76 pasos de accion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de robotica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un modulo de estilo (style VAE). En lugar de predecir una sola accion por paso, el modelo predice un chunk de 76 acciones futuras, lo que reduce el error de acumulacion y mejora la consistencia de las trayectorias. La arquitectura procesa observaciones multimodales: cuatro imagenes RGB (frontal, superior, muneca izquierda y muneca derecha) de 240x424 píxeles, junto con el estado del robot (posicion articular, velocidad y posicion de las pinzas). La salida es un vector de accion de 14 dimensiones que controla ambos brazos.

El entrenamiento se realizo con el framework LeRobot (version 0.6.1) sobre el dataset takeru01/task1_1_3_rgb, compuesto por 111 episodios teleoperados de manipulacion dual. Se usaron 100.000 pasos de entrenamiento, batch size 16, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; el entrenamiento es puramente por imitacion supervisada. La innovacion tecnica principal es el uso de action chunking, que permite que la politica sea robusta a perturbaciones y adecuada para control en tiempo real.

## Capacidades

- Generacion de trayectorias de manipulacion dual para robots UR5e: predice secuencias de 76 acciones que controlan posicion articular y pinzas.
- Procesamiento multimodal: fusiona cuatro flujos de vision RGB con estado propioceptivo (posiciones, velocidades, grippers).
- Control en tiempo real: el tamano reducido (51,7 M de parametros) permite inferencia a frecuencias compatibles con control de robot (30 FPS).
- Aprendizaje por imitacion: reproduce comportamientos demostrados por teleoperacion, sin necesidad de ingenieria de recompensas.
- Integracion con LeRobot: compatible con las herramientas de rollout, entrenamiento y evaluacion de la libreria.
- Sin capacidades de lenguaje ni tool calling: es un modelo puramente motor, no un LLM.

## Casos de uso

- Manipulacion dual de objetos en entornos industriales: el modelo puede controlar dos brazos UR5e para tareas de ensamblaje o transferencia de piezas, aprovechando el action chunking para trayectorias suaves y repetibles.
- Automatizacion de demostraciones teleoperadas: permite convertir demostraciones humanas en politicas ejecutables, reduciendo el tiempo de programacion de celdas roboticas.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos con variaciones de dataset, aumento de datos o ajuste fino en nuevas tareas.
- Prototipado rapido en laboratorio: con LeRobot se puede desplegar el modelo en un robot real en minutos usando `lerobot-rollout`, ideal para validar conceptos antes de escalar a produccion.
- Benchmark de politicas ACT: al ser un checkpoint publico con configuracion documentada, puede usarse como referencia para comparar metodos alternativos (Diffusion Policy, etc.) en la misma tarea.
- Educacion y formacion en robotica: el repositorio incluye guias completas de instalacion, entrenamiento y despliegue, lo que facilita su uso en cursos universitarios de robotica y aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No existen datos de tasa de exito en robot real ni comparaciones con otros metodos en esta tarea especifica.

## Requisitos de hardware

- VRAM estimada: al tener 51,7 M de parametros y procesar 4 imagenes RGB de 240x424, la inferencia requiere aproximadamente 2-4 GB de VRAM en precision FP32. Con cuantizacion (no publicada) podria reducirse.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, por ejemplo RTX 3060, RTX 4060 o superior. Para entrenamiento, se recomienda una GPU con 8-12 GB (p. ej., RTX 3080, RTX 4070, A4000).
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo de gama media.
- Opciones de despliegue: el flujo principal es mediante LeRobot (`lerobot-rollout`), que gestiona la captura de camaras y el control del robot. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Se espera que la inferencia sea inferior a 50 ms por chunk en GPU moderna, dado el tamano del modelo, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de datos publicados de otros checkpoints ACT entrenados sobre la misma tarea para comparar directamente. El autor ha publicado otros dos repositorios relacionados (takeru01/task1_1_act_rgb_100k y takeru01/task1_1_act_100k), pero no se han encontrado especificaciones tecnicas ni resultados que permitan una comparacion cuantitativa. Como referencia, la arquitectura ACT base (Zhao et al., 2023) reporta tasas de exito superiores al 80% en tareas de manipulacion de un solo brazo, pero esos resultados no son directamente transferibles a esta tarea dual.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (ACT) | 51,7 M | Chunk de 76 acciones | Apache 2.0 | Hugging Face |
| ACT original (paper) | ~33 M (backbone ResNet) | Chunk variable | MIT (codigo) | GitHub |
| Diffusion Policy (referencia) | ~10-100 M segun config | Variable | MIT | GitHub |

La comparativa es orientativa; no hay datos de rendimiento comparables en la misma tarea.

## Limitaciones y advertencias

- Sin resultados de evaluacion publicados: no se conoce la tasa de exito real en robot fisico; el modelo podria no generalizar a variaciones de iluminacion, posicion de objetos o calibracion de camaras.
- Especifico de una tarea: entrenado exclusivamente para la tarea "Dual-arm manipulation demonstration task1_1_3"; no es un modelo generalista ni transferible a otras tareas sin reentrenamiento.
- Dependencia de la configuracion del robot: requiere el mismo tipo de robot (dual_ur5e_rosbag) y las mismas cuatro camaras con la misma disposicion; cualquier cambio en la cinematica o en la calibracion invalida la politica.
- Riesgo de sobreajuste: con solo 111 episodios, el modelo puede memorizar las demostraciones y fallar ante perturbaciones del entorno.
- Sin soporte de lenguaje ni interaccion multimodal avanzada: no puede procesar instrucciones textuales ni dialogar.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset asociado (takeru01/task1_1_3_rgb) tenga la misma licencia, ya que no se especifica en la informacion disponible.
- Alucinacion de acciones: como todo metodo de imitacion, puede generar trayectorias inconsistentes o peligrosas si el estado observado difiere del distribuido en entrenamiento; es obligatorio supervisar el despliegue en robot real.

## Enlaces

- Repositorio del modelo: https://huggingface.co/takeru01/task1_1_3_rgb_act_chunk76_bs16_aug_0819_1918
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/takeru01/task1_1_3_rgb
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=takeru01/task1_1_3_rgb

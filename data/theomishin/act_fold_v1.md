# theomishin/act_fold_v1

## Resumen

act_fold_v1 es una politica de robótica entrenada mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo desarrolla el usuario theomishin y se ha entrenado y subido al Hub con LeRobot, la librería de Hugging Face para robótica. Se trata de un checkpoint especializado en la tarea de plegado ("fold") sobre el brazo robótico SO-101, a partir del dataset de demostraciones teleoperadas theomishin/so101_fold_v1.

A diferencia de los modelos de lenguaje, no genera texto ni razona sobre instrucciones en lenguaje natural: es una politica visomotora que, dadas las observaciones (imágenes de cámara y estado de las articulaciones), predice fragmentos cortos de acciones (action chunks) que se ejecutan sobre el robot. Cuenta con 51.668.614 parámetros en formato safetensors y un repositorio de 0,2 GB, lo que lo sitúa en el rango de politicas ligeras ejecutables en hardware de consumo.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de imitación con LeRobot (dataset propio, entrenamiento con `lerobot-train` y evaluación con `lerobot-record`) y como punto de partida para hacer fine-tuning en tareas de manipulación similares. La licencia Apache 2.0 permite uso comercial, aunque el modelo solo es válido dentro del entorno físico y la tarea concretos con los que se recogieron los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y backbone visual convolucional |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observacion visual y de estado) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin versiones GGUF, int8 o int4) |
| Idiomas soportados | no aplica (politica de robotica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Autor | theomishin |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | theomishin/so101_fold_v1 |
| Tamano del repositorio | 0,2 GB |
| Descargas | 16 |
| Likes | 0 |
| Fecha de creacion | 2026-10-03 |
| Fecha de actualizacion | 2026-10-03 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación (behavior cloning) que predice secuencias cortas de acciones, los llamados action chunks, en lugar de un único paso de acción. La arquitectura combina un codificador visual convolucional para las imágenes de cámara, un transformer encoder que fusiona las observaciones (representaciones visuales y estado de las articulaciones) y un transformer decoder que genera el chunk de acciones. Sobre esa base se añade un componente de autoencoder variacional condicional (CVAE) con una variable latente que modela la variabilidad de las demostraciones humanas, lo que ayuda a evitar que la politica colapse a una media de los comportamientos observados. El entrenamiento típico optimiza una pérdida L1 sobre las acciones predichas más un término de divergencia KL sobre el espacio latente.

En este caso concreto, la politica se ha entrenado con LeRobot sobre el dataset theomishin/so101_fold_v1, compuesto por demostraciones teleoperadas del brazo SO-101 (familia de brazos de bajo coste de la serie SO). No se especifican en la información disponible el número de episodios, la composición exacta del dataset, el número de pasos de entrenamiento ni si se aplicaron fases posteriores de refinamiento. El modelo no incorpora RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Predicción de chunks de acciones para control de manipulación robótica, en lugar de acciones paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas sobre el brazo SO-101.
- Tarea especializada de plegado ("fold"), presumiblemente sobre textiles u objetos similares, según el nombre del dataset.
- Entrada multimodal de bajo nivel: imágenes de cámara y estado de las articulaciones del robot.
- Ejecución en tiempo de inferencia dentro del ecosistema LeRobot, con los scripts `lerobot-record` y el cargador de politicas de la librería.
- Reentrenamiento y fine-tuning mediante `lerobot-train` con `--policy.type=act`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión de propósito general, audio ni otras capacidades multimodales fuera del control visomotor.

## Casos de uso

- Automatización de plegado de textiles: la politica predice chunks de acciones para que el brazo SO-101 complete la secuencia de plegado; es adecuada porque el modelo se entrenó exactamente sobre esa tarea y ese robot.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible para comparar variantes de ACT, cambios en el dataset o hiperparámetros, ya que el pipeline completo (dataset, entrenamiento y evaluación) es público.
- Fine-tuning para tareas de manipulación relacionadas: partiendo de estos pesos se puede reentrenar con un dataset nuevo y un número reducido de demostraciones, aprovechando que se trata de una politica ligera de 51,7 M de parámetros.
- Banco de pruebas de infraestructura robótica: al ocupar 0,2 GB, permite validar cadenas de captura de cámara, comunicación con el robot y latencia de inferencia sin apenas coste de recursos.
- Docencia y talleres de robótica: es un ejemplo manejable para enseñar el flujo de LeRobot, desde la teleoperación y la grabación de episodios hasta el despliegue de la politica entrenada.
- Generación de datos de evaluación: ejecutando la politica con `lerobot-record` y el prefijo `eval_` se pueden recoger episodios etiquetados que después se usen para medir tasas de éxito o alimentar nuevos entrenamientos.
- Prototipado de estaciones de trabajo robotizadas: como política especializada, permite validar una celda concreta de plegado antes de invertir en politicas más generales o de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones cuantitativas. El paper original de ACT (arXiv:2304.13705) sí reporta tasas de éxito en sus propias tareas de manipulación bimanual, pero esos resultados corresponden a los modelos y entornos de dicho trabajo, no a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Con 51,7 M de parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16, más el consumo del backbone visual y los búferes de activaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluidas GTX 1050 Ti o superiores, RTX 2060/3060/4090 y GPUs de centro de datos como A100 o H100, que quedarían muy sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, y también en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot con PyTorch es la vía oficial, incluyendo los scripts `lerobot-train` y `lerobot-record`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y esos motores no aplican a politicas de acción.
- Latencia y throughput estimados: no disponibles. El rendimiento real depende del número de cámaras, la resolución de entrada, la frecuencia de control del robot y el hardware, y no se documenta en la información proporcionada.
- Requisitos adicionales: una o varias cámaras compatibles, el brazo SO-101 (follower) y, para teleoperación y recogida de datos, un dispositivo líder o un mando de teleoperación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_fold_v1 (este modelo) | 51,7 M | no aplica | ACT, imitacion con action chunks, tarea fold en SO-101 | Apache 2.0 | HuggingFace Hub, via LeRobot |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion proporcionada | no aplica | ACT, manipulacion bimanual con hardware de bajo coste | no disponible en la informacion proporcionada | publicacion cientifica y codigo asociado |
| Diffusion Policy (arXiv:2303.04137) | no disponible en la informacion proporcionada | no aplica | Politica de difusion para generacion de acciones | no disponible en la informacion proporcionada | implementaciones publicas en distintos repositorios |
| SmolVLA (Hugging Face) | aproximadamente 450 M | no disponible | Vision-language-action con componente de lenguaje | no disponible en la informacion proporcionada | HuggingFace Hub, integrado en LeRobot |

La comparación debe tomarse con cautela: los datos de los modelos alternativos no forman parte de la información proporcionada y solo se incluyen a modo de referencia de categoria. La diferencia principal es que act_fold_v1 es una politica estrecha y especializada, mientras que SmolVLA incorpora un componente de lenguaje que le permite generalizar a instrucciones en lenguaje natural.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para la tarea de plegado sobre SO-101 y no se espera que generalice a otras tareas, objetos o robots sin reentrenamiento.
- Dependencia del entorno de recogida de datos: cambios en la iluminación, la posición de las cámaras, el fondo o la disposición del espacio de trabajo pueden degradar el rendimiento de forma notable, algo habitual en politicas de imitación.
- Sin evaluación publicada: no hay tasas de éxito, número de episodios de prueba ni comparaciones con baselines, por lo que no es posible estimar su fiabilidad en producción.
- Validación comunitaria muy baja: 16 descargas y 0 likes en el momento de la consulta, lo que implica que el checkpoint no ha sido verificado de forma independiente por terceros.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe el riesgo de que la politica genere secuencias de acciones incoherentes ante observaciones fuera de distribución, con posible colisión o daño físico al robot o al entorno.
- Seguridad física: cualquier despliegue real debe hacerse con límites de par, paradas de emergencia y supervisión humana, ya que el modelo no incorpora mecanismos de seguridad propios.
- Idiomas y lenguaje natural: no soporta ningún idioma ni comprensión de instrucciones textuales; la fila de idiomas aparece como "no disponible" en los metadatos de HuggingFace, pero en la práctica no aplica.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia. No se detectan restricciones adicionales en la información proporcionada, aunque conviene revisar las condiciones del dataset theomishin/so101_fold_v1 y del hardware SO-101 por separado.
- Cuantización y exportación: no hay pesos cuantizados publicados, por lo que cualquier optimización de despliegue (int8, ONNX, TensorRT) tendría que realizarla el usuario por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theomishin/act_fold_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/theomishin/so101_fold_v1
- Paper de ACT en HuggingFace Papers: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente resultados sin relacion con el modelo.

# yannnnnn6/scooping-smolvla-v6

## Resumen

scooping-smolvla-v6 es un modelo de visión-lenguaje-acción (VLA) publicado por el usuario yannnnnn6 en Hugging Face. Se trata de un fine-tune del modelo base lerobot/smolvla_base, desarrollado por Hugging Face, y está especializado en tareas robóticas de "scooping" (recogida y vertido de material). El modelo resuelve el problema del control robótico guiado por instrucciones en lenguaje natural y observaciones visuales, generando directamente las acciones que debe ejecutar un manipulador. Es relevante porque demuestra el flujo de trabajo de ajuste fino de bajo coste sobre una política VLA compacta que, según la model card, puede desplegarse en hardware de consumo.

La arquitectura es de tipo VLA, con 450.046.176 parámetros totales (aproximadamente 450 millones), lo que lo sitúa en la gama de modelos ligeros. El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors bajo la librería LeRobot. El modelo se ha entrenado sobre el dataset yannnnnn6/scooping-all-v3-merged y está publicado bajo licencia Apache 2.0.

La relevancia actual de este tipo de políticas radica en que reducen la barrera de entrada para investigación en robótica: un modelo de ~450 M de parámetros puede ajustarse y ejecutarse sin clústeres de GPU dedicados. No obstante, al tratarse de un fine-tune muy específico con 0 descargas y 0 "likes" en el momento de la consulta, no cuenta con validación comunitaria ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); fine-tune de lerobot/smolvla_base |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de lenguaje dependen del backbone del VLA base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de lerobot/smolvla_base, la política SmolVLA descrita en el paper arXiv:2506.01844. Según la model card, SmolVLA es un modelo compacto y eficiente de visión-lenguaje-acción que alcanza un rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. No se detalla en la información disponible la composición interna exacta del backbone, el número de capas ni el mecanismo concreto de generación de acciones, por lo que esos datos deben consultarse en el paper de referencia.

En cuanto al entrenamiento, la información proporcionada indica únicamente que la política fue entrenada y subida al Hub con la librería LeRobot, usando el dataset yannnnnn6/scooping-all-v3-merged. No se especifican el número de tokens, la composición del dataset, el número de episodios de demostración ni si se aplicaron técnicas de RLHF o DPO. El identificador "v6" sugiere que existen iteraciones previas del ajuste, pero no se aporta información sobre las diferencias entre versiones.

## Capacidades

- Generación de acciones robóticas: produce comandos de control de un manipulador a partir de observaciones visuales, propiocepción y, previsiblemente, instrucciones en lenguaje natural.
- Ejecución de tareas de scooping: especializado en la recogida y el vertido de material, presumiblemente con cuchara o herramienta equivalente, según indica el nombre del modelo y del dataset.
- Condicionamiento multimodal: combina entrada visual y de estado del robot, propio de las políticas VLA.
- Integración con LeRobot: admite entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`, incluyendo evaluación por episodios.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.
- Capacidades especiales: no se documentan modos de pensamiento, visión para descripción de imágenes ni procesamiento de audio fuera del uso robótico previsto.

## Casos de uso

- Automatización de recogida de material granular en laboratorio: el modelo puede controlar un brazo robótico que dosifique y vierta polvos o granulados en recipientes, aprovechando su especialización en tareas de scooping.
- Manipulación de alimentos en cocina industrial: permite automatizar el trasvase de ingredientes a granel entre contenedores mediante una cuchara o cazo, tarea repetitiva y con riesgo ergonómico para operarios.
- Clasificación y vertido de piezas pequeñas en almacén: el modelo podría guiar la recogida de componentes sueltos y su depósito en cajas o tolvas, integrándose en una célula de manipulación con cámara cenital.
- Recogida de muestras en entornos de laboratorio o agroalimentario: útil para transferir muestras entre bandejas y recipientes manteniendo un protocolo de vertido controlado.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el ajuste fino de políticas VLA en tareas de scooping, dado que es un fine-tune público con dataset asociado.
- Evaluación comparativa de políticas robóticas: al estar en el ecosistema LeRobot, permite comparar el rendimiento de SmolVLA frente a otras políticas (por ejemplo ACT) sobre una tarea concreta usando el mismo banco de evaluación.
- Despliegue en hardware de bajo coste: gracias a sus ~450 M de parámetros y a la orientación de SmolVLA hacia hardware de consumo, puede ejecutarse en estaciones con GPU de gama media para prototipado educativo o de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de tarea ni comparaciones numéricas con otras políticas. El repositorio asociado registra 0 descargas y 0 "likes", por lo que tampoco existe validación comunitaria documentada.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los 450.046.176 parámetros; no validada por el autor):
  - Precisión fp32: aproximadamente 1,8 GB solo para pesos.
  - Precisión fp16/bf16: aproximadamente 0,9 GB solo para pesos.
  - Cuantización int8: aproximadamente 0,45 GB solo para pesos.
  - A estas cifras hay que sumar el consumo de activaciones, buffers del backbone de visión y del bucle de control, no cuantificados en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es compatible con GPU de consumo como RTX 3060, RTX 4070 o RTX 4090, así como con GPU de datacenter (A100, H100) si se requiere margen adicional.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido y la orientación de SmolVLA a hardware de consumo, aunque no se aporta confirmación oficial para este fine-tune concreto.
- Opciones de despliegue: la model card documenta el uso mediante la librería LeRobot (`lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que en general no están orientados a políticas robóticas.
- Latencia y throughput: no disponibles. La viabilidad en tiempo real dependerá de la frecuencia de control exigida por el robot y del coste del backbone de visión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yannnnnn6/scooping-smolvla-v6 | ~450 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible (modelo base del anterior) | no disponible | reportado como competitivo con coste reducido en el paper arXiv:2506.01844 | no disponible en la información proporcionada | Hugging Face |
| Otras politicas de LeRobot (p. ej. ACT) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos numéricos comparativos entre estas opciones en la información proporcionada. La comparación se limita a señalar que scooping-smolvla-v6 es un fine-tune del modelo base SmolVLA y que comparte su licencia Apache 2.0.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para tareas de scooping; es previsible que su rendimiento caiga fuera de ese dominio y de la distribución de su dataset de entrenamiento.
- Sin validación pública: 0 descargas y 0 "likes" en el momento de la consulta, sin benchmarks ni evaluaciones externas publicadas.
- Dependencia del embodiment: las políticas VLA de LeRobot suelen estar ligadas a una configuración concreta de robot, cámaras y espacio de acciones; no se especifica cuál en la información disponible, por lo que la transferencia a otro robot requiere verificación.
- Riesgo de alucinación / deriva de distribución: en robótica, esto se traduce en acciones erróneas o inseguras ante observaciones fuera de distribución. No hay datos sobre robustez ni sobre tasas de fallo.
- Sesgos: no disponibles. No se documenta la composición del dataset, por lo que no puede evaluarse si existen sesgos de iluminación, materiales, posiciones o condiciones de laboratorio.
- Limitaciones de idioma: no se especifica qué idiomas acepta como instrucción ni si el modelo usa lenguaje natural en absoluto.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar las licencias del modelo base y del dataset asociado antes de un despliegue en producción.
- Caveat de producción: al no existir métricas de éxito, latencia ni requisitos oficiales, cualquier uso real exige una fase de evaluación propia en el robot objetivo antes de considerarlo apto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yannnnnn6/scooping-smolvla-v6
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/yannnnnn6/scooping-all-v3-merged
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a dominios sin relación con robótica ni con inteligencia artificial.

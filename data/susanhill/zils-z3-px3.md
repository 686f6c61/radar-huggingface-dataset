# SusanHill/zils-z3-px3

## Resumen

zils-z3-px3 es un modelo de clasificación multimodal publicado en Hugging Face por el usuario SusanHill, derivado mediante fine-tuning del modelo base Qwen/Qwen3.8-27B. El repositorio declara la etiqueta `qwen3_5` y una relación de fine-tuning sobre Qwen3.8-27B, con un total real de 26.085.330.160 parámetros según los pesos en safetensors. La model card, sin embargo, describe el artefacto como "pplx-decider-v1.3", una versión de un clasificador multimodal orientado a tareas de decisión (enrutado, puntuación, extracción de spans), lo que sugiere una discrepancia entre la identidad declarada del repositorio y el contenido documentado.

El modelo no genera texto libre: su interfaz `decide` recibe un estado (texto, diccionario o lista) y una o varias preguntas tipadas (`choice`, `noul`, `score`, `locate`), y devuelve respuestas estructuradas con probabilidades, confianza y, en el caso de `locate`, spans verbatim con offsets de carácter. Esto lo sitúa en la categoría de modelos "decider" o clasificadores de decisión, no en la de asistentes conversacionales.

Es relevante porque propone una interfaz unificada para múltiples tareas de clasificación y extracción sobre un único modelo de ~26B parámetros, con soporte de imágenes y un esquema de calibración por temperatura. No obstante, la información pública disponible es escasa: cero descargas, cero likes, sin datos de benchmarks en la información proporcionada y con una model card que referencia un repositorio privado de otro autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen3.8-27B; etiqueta `qwen3_5`), con cabecera de clasificación/decisión y código personalizado (`custom-code`) |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en BF16; el repo ocupa 54,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo parte de Qwen/Qwen3.8-27B mediante fine-tuning, con relación `base_model_relation: finetune`. La model card describe un modelo multimodal de clasificación con una interfaz de decisión que acepta estado textual o estructurado y preguntas tipadas. Las imágenes se codifican junto al texto y se redimensionan, manteniendo la relación de aspecto, a un máximo de 1.638.400 píxeles (1,6 MP), valor almacenado en `decision_config.json`.

El entrenamiento se orienta a tareas de decisión: elección entre opciones (hasta 255), preguntas booleanas tipo `noul` (que devuelven P(true)), puntuación ordinal sobre una escala de 2 a 255 niveles y extracción de spans verbatim con offsets y puntuaciones de confianza. La model card menciona un fichero `decision_config.json` con una temperatura ajustada sobre datos de calibración reservados, aplicada una sola vez antes del softmax sobre las opciones válidas. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Un detalle técnico destacable es el modo de inferencia: por defecto (`mode="separate"`), cada pregunta se responde en su propia secuencia compuesta por el estado y esa pregunta únicamente, de modo que las preguntas no se ven entre sí y la respuesta no cambia al añadir, eliminar o reordenar otras preguntas. El modo `isolated` codifica toda la petición en una sola secuencia con el formato de entrenamiento, lo que abarata el coste cuando muchas preguntas comparten un estado largo, a cambio de que las respuestas puedan variar ligeramente (según la model card, entre el 1,5 % y el 2,2 % de las respuestas principales difieren del modo `separate`).

## Capacidades

- Clasificación por elección (`choice`) entre 1 y 255 opciones, con probabilidades por opción y confianza.
- Preguntas booleanas (`noul`) que devuelven P(true), con descripciones opcionales para los estados verdadero y falso.
- Puntuación ordinal (`score`) sobre escalas de 2 a 255 niveles, devolviendo el nivel esperado, probabilidades, leyenda y confianza.
- Extracción de spans verbatim (`locate`) con offsets de carácter, texto extraído y puntuación de confianza.
- Procesamiento multimodal: acepta imágenes como rutas, cadenas base64 (`data:image/...;base64,...`) o objetos PIL, visibles para todas las preguntas de la petición.
- Respuesta a múltiples preguntas sobre un mismo estado en una sola llamada, con orden de respuesta preservado.
- Acceso a logits crudos mediante `decider.logits(requests)`, útil para ranking mediante el margen `true - false` de una pregunta `noul`.
- Validación de esquema con excepción `pplx_decider.RequestError` antes de cualquier cómputo.
- No se documentan en la información disponible capacidades de generación de texto libre, código, matemáticas, tool calling ni razonamiento multi-paso.

## Casos de uso

- Enrutado de tickets de soporte: usar una pregunta `choice` con opciones como `billing`, `support` y `sales` para asignar cada solicitud al equipo adecuado, aprovechando las probabilidades por opción para umbrales de derivación manual.
- Priorización de urgencias: combinar una pregunta `noul` ("¿está el cliente bloqueado ahora mismo?") con una pregunta `score` de frustración para ordenar la cola de atención según severidad y estado emocional.
- Extracción de datos estructurados de documentos: emplear `locate` para recuperar spans verbatim (importes, fechas, identificadores) con offsets de carácter directamente utilizables para resaltado o post-procesado.
- Moderación y triaje de contenido multimodal: clasificar publicaciones con imagen y texto mediante preguntas `choice` sobre categorías de riesgo, con la imagen redimensionada a 1,6 MP para controlar el coste.
- Análisis de sentimiento granular: usar preguntas `score` con escalas ordinales (por ejemplo, `calm`, `mildly annoyed`, `frustrated`, `angry`) para obtener una puntuación esperada y su distribución de probabilidad.
- Clasificación por lotes con estado compartido: en escenarios con muchas preguntas sobre un mismo documento largo, el modo `isolated` reduce el coste de relectura del estado, a cambio de una ligera variación en las respuestas.
- Enriquecimiento de pipelines de datos: generar etiquetas y puntuaciones de confianza sobre grandes volúmenes de texto e imágenes para entrenar o evaluar otros modelos, usando `logits` para ranking cuando las probabilidades se saturan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 49 GiB solo para los pesos en BF16, más memoria de trabajo, según la model card. El repositorio ocupa 54,1 GB.
- GPU recomendadas: se requiere una GPU CUDA con capacidad suficiente para ~49 GiB en BF16; en la práctica, A100 80 GB, H100 80 GB o GPUs con 80 GB de VRAM. No se documentan configuraciones con menor VRAM.
- GPU de consumo: no cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en BF16 sin cuantización, y no se documentan tipos de cuantización en la información disponible.
- Opciones de despliegue: el modelo se usa mediante el paquete de código personalizado `pplx_decider` (instalable con `pip install ./source`), con dependencias de torch, transformers, safetensors, pillow, torchvision y huggingface-hub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12 o superior y autenticación con un token de Hugging Face, ya que la model card indica que el repositorio es privado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-px3 | ~26,1 B | no disponible | Clasificación multimodal / decisión | apache-2.0 | Pública en HF, sin descargas ni likes |
| Qwen/Qwen3.8-27B (base) | ~27 B (según nombre) | no disponible | Generación de texto multimodal | no disponible en la información | Referenciado como base |
| pplx-decider-v1.2 | no disponible | no disponible | Clasificación multimodal / decisión | no disponible en la información | Referenciado en la model card |
| pplx-decider-v1.3 | no disponible | no disponible | Clasificación multimodal / decisión | no disponible en la información | Referenciado como repositorio privado |

La comparación con alternativas de la misma categoría (clasificadores de decisión multimodales de gran tamaño) no está disponible en la información proporcionada más allá de las referencias internas de la model card.

## Limitaciones y advertencias

- Discrepancia de identidad: el repositorio se publica como `SusanHill/zils-z3-px3` con etiqueta `qwen3_5`, pero la model card describe "pplx-decider-v1.3" y enlaza a un repositorio privado de otro autor (`perplexity-ai/pplx-decider-v1.3`). Conviene verificar la procedencia y los derechos antes de cualquier uso.
- La model card indica que el repositorio es privado y requiere autenticación con token; el repositorio público no expone esa restricción, lo que añade incertidumbre sobre el estado real del artefacto.
- Sin datos de benchmarks, idiomas ni contexto publicados: no es posible evaluar su calidad frente a alternativas.
- Riesgo de alucinación en la extracción `locate`: los spans se devuelven con puntuaciones de confianza, pero no se documenta su fiabilidad ni validación externa.
- Calibración dependiente de la tarea: la model card advierte que una única temperatura no puede ser correcta para todas las tareas y recomienda calibrar sobre tráfico propio y usar umbrales por tarea si la aplicación depende de valores de probabilidad.
- El modo `isolated` puede alterar entre el 1,5 % y el 2,2 % de las respuestas principales respecto al modo `separate`, según la model card.
- Licencia apache-2.0 declarada, pero la cadena de fine-tuning sobre Qwen3.8-27B y la referencia a un modelo de terceros hacen recomendable revisar las condiciones del modelo base antes de uso comercial.
- Sin información sobre sesgos, cobertura lingüística ni comportamiento en dominios distintos de los de entrenamiento.
- Requisito de hardware elevado (~49 GiB en BF16) que excluye GPU de consumo sin cuantización, y no se documentan cuantizaciones disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SusanHill/zils-z3-px3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo predecesor referenciado: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Blog referenciado en la model card: https://www.perplexity.ai/hub/blog/perplexity-decider

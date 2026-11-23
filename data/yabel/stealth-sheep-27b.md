# yabel/stealth-sheep-27b

## Resumen

Stealth Sheep 27B es un modelo de decisión tipado ("typed decision model") construido sobre el backbone Qwen3.8-27B y publicado por el usuario yabel en Hugging Face. No es un modelo generativo al uso: responde preguntas de opción múltiple (`choice`), de sí/no (`noul`) y de puntuación sobre estados de texto o JSON, con soporte opcional de entradas de imagen. El paquete incluye un backbone BF16 fragmentado en shards, pesos de visión, una cabeza de lectura de decisión de 255 vías y el runtime de inferencia propio del autor.

El problema que aborda es el de la clasificación y el enrutamiento estructurado: en lugar de generar texto libre, el modelo emite una decisión discreta sobre un conjunto de criterios predefinidos, lo que facilita su integración en sistemas de enrutamiento, filtrado o evaluación automatizada. Con 26.085.330.160 parámetros reales (según los safetensors) y unos 52,2 GB de pesos en disco en BF16, se posiciona en la gama de modelos de 27B densos.

Su relevancia es limitada por el momento: el repositorio registra 0 descargas y 0 likes, la model card es escasa en detalles de entrenamiento y no se publican resultados desglosados por tarea más allá de una puntuación agregada en el Decision Index. La licencia Apache 2.0 y la compatibilidad con `transformers` mediante `trust_remote_code=True` son los principales atractivos para evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3.8-27B, pesos de visión y cabeza de decisión de 255 vías; etiquetado como `qwen3_5` con `custom_code` |
| Parámetros totales | 26.085.330.160 (26,09 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos publicados son BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards BF16), más pesos de visión, readout y tokenizer |

## Arquitectura y entrenamiento

La información disponible describe un backbone Qwen3.8-27B en BF16 fragmentado en shards, al que se añaden pesos de visión y una cabeza de lectura de decisión de 255 vías. El modelo se ejecuta con un runtime propio ("Stealth Sheep inference runtime") que expone un servidor HTTP con endpoints `/health` y `/v1/systemone`, y también puede cargarse mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`. Las dependencias declaradas para la evaluación pública incluyen PyTorch 2.10.0+cu126, torchvision 0.25.0, Transformers 5.17.0, flash-linear-attention 0.5.2, causal-conv1d 1.7.0 y Triton 3.8.0, lo que sugiere el uso de atención lineal y convoluciones causales en algún componente del runtime.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se detalla el procedimiento de entrenamiento de la cabeza de decisión ni cómo se generaron las etiquetas de las 255 vías. La evaluación del Decision Index Text 0.3 se realizó con atención completa no causal, temperatura 1.0, sin truncamiento de entrada ni de opciones, sin promediado de permutaciones y con batch size 1 sobre ocho GPU H100 de 80 GB, una réplica por GPU.

## Capacidades

- Respuesta a preguntas de opción múltiple (`choice`) sobre estados de texto o JSON, con criterios definidos por el usuario.
- Respuesta a preguntas de sí/no (tipo `noul`).
- Respuesta a preguntas de puntuación (score) sobre el estado proporcionado.
- Entrada multimodal opcional: acepta imágenes además de texto y JSON.
- Salida estructurada mediante una cabeza de decisión de 255 vías, en lugar de generación de texto libre.
- Despliegue como servidor HTTP con API JSON (`POST /v1/systemone`).
- Carga mediante `transformers` con `trust_remote_code=True` y ejecución in-process en una sola GPU.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes ni modo "thinking" en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card muestra cómo clasificar un estado textual ("el cliente quiere un reembolso por un cargo duplicado") en equipos de facturación o técnico mediante una pregunta `choice` con criterios. Es adecuado porque la salida es una decisión discreta y acotada, no texto libre.
- Moderación y filtrado de contenido: formular preguntas de sí/no (`noul`) sobre textos o estados JSON para decidir si un contenido cumple una política, aprovechando la cabeza de decisión para obtener una respuesta binaria directa.
- Clasificación zero-shot: el pipeline declarado es `zero-shot-classification`, de modo que puede usarse para etiquetar textos con categorías definidas en tiempo de inferencia sin reentrenamiento.
- Evaluación automatizada de respuestas: usar preguntas de puntuación para asignar una nota a una respuesta generada por otro sistema, con el estado y los criterios proporcionados en la petición.
- Enrutamiento sobre estados JSON de aplicaciones: al aceptar JSON como estado, encaja en pipelines que deciden la siguiente acción a partir del estado serializado de un flujo (por ejemplo, un formulario o un carrito).
- Verificación multimodal: con entrada de imagen opcional, puede responder preguntas de decisión sobre capturas, documentos escaneados o imágenes junto con contexto textual, aunque no se detallan métricas de visión.
- Servicio interno de decisiones: el servidor FastAPI/uvicorn incluido permite desplegar el modelo como microservicio con endpoint `/health` para sondas de disponibilidad y `/v1/systemone` para las peticiones.

## Benchmarks y rendimiento

El único dato publicado es la puntuación agregada del Decision Index Text público 0.3: **72,89**, obtenida con ocho H100 de 80 GB, batch size 1, sin promediado de permutaciones, atención completa no causal y temperatura 1.0. No se proporcionan resultados desglosados por tarea (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos similares.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Decision Index Text 0.3 (público) | 72,89 | 8× H100 80 GB, batch 1, sin permutation averaging, atención no causal, temperatura 1.0, sin truncamiento |

## Requisitos de hardware

- Pesos en BF16 de aproximadamente 52,2 GB en disco, lo que exige al menos ~55-60 GB de VRAM para cargar el modelo completo sin cuantización.
- La evaluación pública se realizó con ocho GPU H100 de 80 GB, una réplica del modelo por GPU, con batch size 1.
- Una sola GPU H100 de 80 GB o A100 de 80 GB es el mínimo razonable para inferencia en BF16 según el tamaño de los pesos; no se documenta soporte de cuantización a 8 o 4 bits.
- No cabe en GPU de consumo tipo RTX 4090 (24 GB) en BF16 sin cuantización, y no se indica que existan pesos GGUF o cuantizados.
- Despliegue: servidor propio `stealth_sheep_server.py` con FastAPI 0.115.12 y uvicorn 0.34.2; carga vía `transformers` con `trust_remote_code=True`; motor in-process con `decision_index run`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración de referencia usa batch size 1 y una réplica por GPU, lo que sugiere un enfoque de baja concurrencia por dispositivo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo frente a alternativas, y la información proporcionada no incluye comparaciones. Se ofrece una comparación estructural con el modelo base y con un clasificador encoder típico.

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stealth Sheep 27B | 26,09 B | no disponible | Decisión tipada (255 vías) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.8-27B (base) | ~27 B (según nombre) | no disponible | Generación de texto | no disponible en la información | Hugging Face |
| Clasificador encoder tipo DeBERTa | ~0,1-1,5 B | ~512 tokens típicamente | Logits de clasificación | MIT/Apache según variante | Amplia |

La comparación con clasificadores encoder es pertinente por la tarea (clasificación y enrutamiento), pero Stealth Sheep 27B parte de un backbone generativo de 27B, lo que implica un coste de inferencia muy superior sin métricas publicadas que lo justifiquen.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al derivar de un backbone generativo sin información sobre datos de alineamiento, el riesgo de sesgos heredados no puede descartarse.
- Riesgo de alucinación en el sentido de decisiones incorrectas: la cabeza de 255 vías puede producir una etiqueta plausible pero errónea; no se publican métricas de calibración ni de fiabilidad por tipo de pregunta.
- Longitud de contexto e idiomas soportados no disponibles, lo que impide garantizar su comportamiento en textos largos o en castellano.
- El repositorio registra 0 descargas y 0 likes y fue creado y actualizado el mismo día (22 de noviembre de 2026), sin señales de validación por parte de la comunidad.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el runtime antes de usarlo en producción.
- El despliegue de referencia usa ocho H100 y batch size 1, con un coste de infraestructura elevado para una tarea de clasificación.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el manifiesto, el índice, todos los shards de pesos, el readout y el tokenizer junto con el código de inferencia, y revisarse LICENSE y NOTICE para las atribuciones del backbone y del runtime.
- No se documenta soporte de cuantización, tool calling ni agentes, por lo que no debe asumirse para pipelines que dependan de esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yabel/stealth-sheep-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.

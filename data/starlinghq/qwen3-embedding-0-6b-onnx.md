# Starlinghq/qwen3-embedding-0.6b-onnx

## Resumen

Starlinghq/qwen3-embedding-0.6b-onnx es una conversión a ONNX en fp32 del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, publicada por StarlingHq para su uso dentro del paquete .NET `Starlings.Models.Qwen3Embedding` (perfil `qwen3-embedding-0.6b`, en estado experimental). El modelo original lo desarrolla el equipo Qwen de Alibaba Cloud y está pensado para generación de embeddings de texto: similitud semántica, recuperación de pasajes, clasificación y extracción de características. El repositorio no incluye pesos PyTorch, sino un grafo ONNX con pesos externos de aproximadamente 2,4 GB.

La relevancia de esta ficha es fundamentalmente de ingeniería: el repositorio original de Qwen3-Embedding-0.6B solo distribuye pesos PyTorch, sin grafo ONNX, de modo que esta build cubre el hueco para despliegues en runtime ONNX (ONNX Runtime, Text Embeddings Inference con backend ONNX) y para integraciones en .NET. El grafo expone `input_ids` y `attention_mask` de tipo int64 con forma `[batch, sequence]`, admite secuencias de hasta 8192 tokens y devuelve `last_hidden_state` float32 de forma `[batch, sequence, 1024]` tras la normalización final.

La build está verificada numéricamente contra el modelo PyTorch original con ONNX Runtime 1.30.0 sobre CPU: la diferencia máxima en el estado oculto es de 1,5e-3, en el embedding L2-normalizado de 6,0e-7 y en los cosenos query-documento del model card de 3,9e-7. La exportación es reproducible byte a byte (tres exportaciones independientes dieron los mismos SHA-256). La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3Model, atención SDPA), exportado a grafo ONNX, opset 20 |
| Parametros totales | 0,6B (modelo base Qwen3-Embedding-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (secuencia máxima del grafo) |
| Tipos de cuantizacion | no disponible en este repositorio (solo fp32); el modelo base admite otras precisiones, no documentadas aquí |
| Idiomas soportados | no disponible en la información proporcionada (el corpus de verificación incluye varios alfabetos y emoji) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` externo, fp32); tokenizer en JSON |
| Dimension de embedding | 1024 (salida `last_hidden_state`) |
| Entradas del grafo | `input_ids`, `attention_mask` (int64, `[batch, sequence]`), padding a la derecha con `<|endoftext|>` (151643) |
| Salida del grafo | `last_hidden_state` float32 `[batch, sequence, 1024]` |
| Tamano del repositorio | 2,4 GB |
| Runtime de referencia | ONNX Runtime 1.30.0 (CPUExecutionProvider) |

## Arquitectura y entrenamiento

El grafo corresponde a `Qwen3Model` con atención SDPA, exportado con el exportador dynamo de PyTorch (`torch.onnx.export(..., dynamo=True, opset_version=20)`) con batch y secuencia dinámicos, y posteriormente re-guardado eliminando metadatos y docstrings del exportador y consolidando los pesos en un único fichero de datos externo. La máscara de atención causal se construye dentro del grafo a partir de la máscara 2-D aditiva en float32. No hay entrada `position_ids` (las posiciones van de 0 a sequence-1) ni caché KV, lo que es coherente con un uso de solo codificación (encoding) sin generación autorregresiva.

El grafo no incluye pooling, normalización, prompts, truncamiento Matryoshka ni la cabeza del modelo de lenguaje: esas operaciones deben aplicarse fuera. Según la model card, el embedding se obtiene tomando el estado oculto en el último token válido (`sum(attention_mask) - 1`, ya que el tokenizer fijado añade `<|endoftext|>`) y aplicando normalización L2. Las consultas (queries) llevan el prefijo `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery:` (literal de `config_sentence_transformers.json`, sin espacio final); los documentos no llevan prefijo.

No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La build se generó a partir de la revisión `97b0c614be4d77ee51c0cef4e5f07c00f9eb65b3` del repositorio Qwen, con Python 3.11, torch 2.14.1+cpu, transformers 5.18.0, onnx 1.23.1, onnxscript 0.7.2 y onnxruntime 1.30.0 sobre Linux x86-64. Los ficheros de tokenizer y configuración se copian sin modificar desde esa revisión.

## Capacidades

- Generación de embeddings de texto de 1024 dimensiones para similitud semántica y recuperación de pasajes.
- Extracción de características (`feature-extraction`) y sentence-similarity.
- Soporte de secuencias largas de hasta 8192 tokens en una sola pasada.
- Procesamiento por lotes con batch dinámico y padding a la derecha.
- Instrucciones de consulta mediante prompt prefijado para tareas de retrieval.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Integración nativa en .NET a través del paquete `Starlings.Models.Qwen3Embedding`, que fija cada fichero por tamaño y SHA-256.
- No incluye tool calling, agentes, visión, audio ni modo thinking: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar fragmentos de hasta 8192 tokens con el grafo ONNX y consultar con el prefijo de instrucción para recuperar pasajes relevantes; el contexto largo evita trocear en exceso documentos extensos.
- RAG en aplicaciones .NET: el paquete `Starlings.Models.Qwen3Embedding` permite generar embeddings en proceso sin depender de un servidor Python, con verificación de integridad de los ficheros por SHA-256.
- Deduplicación y clustering de tickets de soporte: calcular similitud coseno entre embeddings normalizados para agrupar incidencias equivalentes antes de asignarlas a colas.
- Moderación y clasificación de contenido: usar los embeddings como características de entrada para clasificadores ligeros sobre textos multilingües.
- Motor de recomendación de artículos: indexar el corpus con embeddings de documento (sin prefijo) y consultar con el embedding de la consulta del usuario (con prefijo) para ordenar candidatos.
- Despliegue en entornos sin GPU: al ser un grafo fp32 ejecutable en ONNX Runtime CPU, encaja en servicios contenerizados sin acelerador, con la latencia dependiente del hardware no documentada.
- Evaluación de similitud entre pares de frases en pipelines de control de calidad de datos: la verificación reportada muestra un error máximo de 6,0e-7 en el embedding normalizado frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de verificación numérica de la conversión frente al modelo PyTorch original:

| Comparación | Diferencia máxima |
|---|---|
| Estado oculto, todos los tokens válidos | 1,5e-3 |
| Embedding L2-normalizado | 6,0e-7 |
| Cosenos query-documento del card frente a los valores publicados | 3,9e-7 |
| Embedding frente a `sentence-transformers.encode` (textos del card) | 2,1e-7 |

El conjunto de verificación incluye los cuatro textos de ejemplo del model card, los 49 textos del corpus de tokenizer de Starling (varios alfabetos, emoji, texto con tokens especiales y cadena vacía) en lotes con padding a la derecha, y dos entradas largas de aproximadamente 2300 y 6600 tokens.

## Requisitos de hardware

- VRAM estimada: el repositorio solo publica fp32, con pesos de aproximadamente 2,4 GB; en GPU se requiere espacio para pesos y activaciones, no cuantificado en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada.
- GPU de consumo: no confirmado; el tamaño de pesos fp32 (unos 2,4 GB) es compatible en términos de memoria con tarjetas de 8 GB o más, pero no hay validación publicada.
- Despliegue: ONNX Runtime (la verificación se hizo con CPUExecutionProvider 1.30.0), Text Embeddings Inference con backend ONNX y el paquete .NET `Starlings.Models.Qwen3Embedding`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota: al no incluir pooling ni normalización en el grafo, el pipeline de despliegue debe implementar el último token válido, la normalización L2 y el prefijo de consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starlinghq/qwen3-embedding-0.6b-onnx | 0,6B | 8192 | ONNX fp32 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | 8192 | PyTorch (safetensors) | Apache-2.0 | HuggingFace (modelo base) |
| Alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: misma arquitectura y mismos pesos, pero el original no incluye grafo ONNX. El resto de alternativas comparables no está cubierto en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: la propia model card califica la build como experimental y aclara que las cifras de verificación describen esta build, no constituyen una garantía de soporte.
- Solo fp32: no se ofrecen variantes cuantizadas en este repositorio, lo que limita el ahorro de memoria y el rendimiento en CPU frente a formatos int8.
- El grafo no incluye pooling, normalización L2, prompts, truncamiento Matryoshka ni la cabeza del modelo de lenguaje; un uso incorrecto del pipeline (por ejemplo, pooling distinto o prefijo de consulta omitido) degrada la calidad de recuperación.
- Requiere padding a la derecha con `<|endoftext|>` (151643) y que el tokenizer fijado añada dicho token; desviarse de esa convención altera el token del que se extrae el embedding.
- Sin caché KV ni `position_ids`: no es adecuado para generación de texto, solo para codificación.
- Idiomas soportados no documentados; el corpus de verificación incluye varios alfabetos, pero no se declara cobertura lingüística.
- Riesgo de sesgo y alucinación del modelo base no evaluado en la información disponible; los embeddings pueden reflejar sesgos del corpus de entrenamiento original.
- Licencia Apache-2.0 permite uso comercial, pero StarlingHq no está afiliada ni respaldada por Alibaba Cloud ni por el equipo Qwen; deben conservarse `NOTICE` y `LICENSE`.
- Integridad: el paquete .NET rechaza ficheros cuyo tamaño o SHA-256 no coincidan, por lo que modificar los pesos invalida la integración.
- Sin métricas de latencia ni throughput publicadas, la planificación de capacidad en producción requiere medición propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Starlinghq/qwen3-embedding-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Repositorio del proyecto Starling: https://github.com/starlinghq/starling

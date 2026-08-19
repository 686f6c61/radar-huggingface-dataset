# visible-cx/embeddinggemma-300m-CoreAI

## Resumen

El modelo `visible-cx/embeddinggemma-300m-CoreAI` es una exportación del modelo de embeddings `google/embeddinggemma-300m` de Google DeepMind al formato Core AI, un grafo estático diseñado para ejecutarse en dispositivos Apple silicon (macOS 27+). El proyecto Visible, responsable de esta conversión, ha integrado el pipeline completo de generación de embeddings —transformer, mean pooling, proyección densa y normalización L2— dentro del propio grafo, de modo que una única llamada recibe tokens y devuelve un vector de 768 dimensiones normalizado, sin necesidad de lógica de pooling en el host.

El modelo base es un encoder de 300 millones de parámetros construido sobre Gemma 3 con inicialización T5Gemma, optimizado por Google para ejecución en dispositivos cotidianos como teléfonos, portátiles y tabletas. Esta variante Core AI se distribuye en dos formatos: un bundle fp32 (1,28 GB) y una versión int8 comprimida (356 MB) obtenida mediante compresión del grafo original. Es relevante ahora porque permite desplegar búsqueda semántica y RAG local en hardware Apple sin depender de servicios en la nube, aunque su estado de cualificación es limitado: el bundle fp32 está construido y verificado a nivel de exportación, pero no se ha ejecutado en un Mac, y el int8 se considera experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Gemma 3, inicializacion T5Gemma) |
| Parametros totales | 300M (308M segun documentacion de Google) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (fija en el grafo; sin variante dinamica) |
| Tipos de cuantizacion | fp32 e int8 (compresion del grafo, no re-entrenamiento) |
| Idiomas soportados | Multilingue (lista no detallada en la informacion disponible) |
| Licencia | Gemma (Gemma Terms of Use, Gemma Prohibited Use Policy) |
| Formato de pesos | Core AI graph (.aimodel) con tokenizer.json; el modelo base esta disponible en safetensors |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-300m` es un encoder de embeddings basado en Gemma 3, con inicializacion T5Gemma, entrenado por Google DeepMind para generar representaciones densas de texto de alta calidad con un consumo reducido de recursos. El export Core AI no modifica los pesos del modelo: lo convierte a un grafo estatico que incorpora el pipeline completo de sentence-transformers (transformer → mean pooling → proyeccion densa → L2 normalizacion). El grafo tiene una secuencia fija de 256 tokens y una firma de entrada `input_ids [1, 256] int32` y `attention_mask [1, 256] int32`, con salida `embedding [1, 768]` fp32 L2-normalizada.

La version int8 se genera aplicando `coreai_opt.coreai_utils.quantize_weights(dtype=DType.INT8)` sobre el grafo fp32, sin re-trazado ni round-trip por PyTorch. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del export no los detalla y el modelo base no se describe en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones, L2-normalizados, listos para similitud coseno.
- Búsqueda semantica: recuperacion de documentos o fragmentos por similitud vectorial.
- Soporte de RAG on-device: el pipeline completo se ejecuta en el grafo, sin dependencias externas.
- Multilingue: el modelo base de Google es multilingue, aunque el export no especifica la lista de idiomas.
- Clasificacion y clustering de textos: representaciones densas aptas para tareas downstream.
- Sin capacidades de generacion de texto, tool calling ni agentes: es un encoder puro.

## Casos de uso

- Búsqueda semantica local en macOS e iOS: el modelo permite indexar documentos, notas o correos y recuperarlos por significado, no por palabras clave, todo en el dispositivo.
- RAG on-device para asistentes personales: al integrar el grafo en una app, se pueden construir pipelines de generacion aumentada por recuperacion sin enviar datos a la nube, con la ventaja de que el pipeline de embeddings esta encapsulado y no requiere pooling manual.
- Clasificacion automatica de tickets o emails: las embeddings de 768 dimensiones pueden alimentar clasificadores logisticos o SVM para categorizar consultas de soporte, con latencia baja al ejecutarse en Apple silicon.
- Deduplicacion de documentos: comparar embeddings de textos para detectar duplicados o versiones casi identicas en repositorios locales.
- Sistemas de recomendacion por similitud: recomendar articulos, productos o contenidos basandose en la distancia coseno entre embeddings de textos descriptivos.
- Analisis de sentimiento en texto corto: aunque no esta verificado en este export, el modelo base es apto para generar features que alimenten clasificadores de sentimiento en aplicaciones de analisis de redes sociales o encuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export indica explicitamente que no se ha calculado ningun vector de embedding desde los artefactos generados: fueron construidos en un servidor Linux sin runtime Core AI y no se ha registrado ninguna ejecucion en Mac. Por tanto, no hay datos de rendimiento, latencia ni throughput para este modelo.

## Requisitos de hardware

- Apple silicon Mac con runtime Core AI y macOS 27+ (requisito obligatorio).
- Memoria residente estimada: ~1,24 GB para el bundle fp32; ~0,32 GB para el int8.
- No requiere GPU dedicada: usa la GPU integrada del chip Apple silicon (por ejemplo, M2 Pro con 16 GB de RAM unificado, como referencia del entorno de desarrollo del catalogo).
- Sin KV cache: al ser un encoder, no hay crecimiento de memoria por token ni escalado de contexto.
- Opciones de despliegue: exclusivamente Core AI runtime; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- La secuencia de entrada es fija (256 tokens); hay que rellenar o truncar a esa longitud.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. El modelo base `google/embeddinggemma-300m` compite en la categoria de embeddings pequenos con alternativas como `all-MiniLM-L6-v2` (384 dimensiones, ~22M parametros) o `bge-small-en-v1.5` (384 dimensiones, ~33M parametros), pero no hay mediciones directas en este export que permitan una comparacion cuantitativa. La unica diferencia estructural destacable es la dimension de salida (768) y el origen en Gemma 3, frente a los 384 de los modelos MiniLM o BGE pequenos.

## Limitaciones y advertencias

- El bundle fp32 esta construido y verificado a nivel de exportacion (fingerprint y gate de coseno > 0,999 frente a `sentence_transformers.encode`), pero no se ha ejecutado en un Mac: es runtime-unqualified.
- El bundle int8 es experimental: no ha pasado la verificacion de paridad vectorial contra el fp32 en un Mac (similitud coseno por vector y concordancia de ranking de recuperacion). No debe usarse en produccion hasta que se valide.
- Se sabe que fp16 falla en este modelo: la conversion a float16 produce overflow en las activaciones de Gemma3 y genera embeddings NaN. La compresion int8 es, por tanto, una hipotesis no confirmada.
- La secuencia de entrada es fija en 256 tokens; no hay variante dinamica. Para textos mas largos hay que truncar, lo que puede degradar la calidad de la embedding.
- Solo compatible con Apple silicon y macOS 27+; no ejecutable en otras plataformas.
- Licencia Gemma con restricciones de uso: hay que cumplir la Gemma Terms of Use y la Gemma Prohibited Use Policy.
- No hay mediciones de rendimiento ni benchmarks publicados para este export concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visible-cx/embeddinggemma-300m-CoreAI
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Pagina oficial de EmbeddingGemma (Google DeepMind): https://deepmind.google/models/gemma/embeddinggemma/
- Model card de EmbeddingGemma (Google AI for Developers): https://ai.google.dev/gemma/docs/embeddinggemma/model_card
- Descripcion general de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Export de referencia (coreai-community): https://huggingface.co/coreai-community/embeddinggemma-300m-CoreAI

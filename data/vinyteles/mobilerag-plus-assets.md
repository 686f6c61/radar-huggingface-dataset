# vinyteles/mobilerag-plus-assets

## Resumen

MobileRAG+ assets es un repositorio de artefactos (no un modelo generativo único) publicado por el usuario vinyteles para ejecutar la pipeline de recuperación aumentada MobileRAG+ en dispositivos móviles, dentro del asistente móvil de la compañía eléctrica brasileña CEMIG. El paquete contiene dos modelos de embeddings en formato GGUF cuantizado Q8_0 (Qwen3-Embedding-0.6B-v2 para recuperación y granite-embedding-107m-multilingual para Selective Content Reduction), junto con tres bases de datos SQLite que implementan el índice vectorial EcoVector, el corpus de 3.764 fragmentos y 72.061 vectores de ventana en int8. El modelo de respuesta final (Energy-Mobile, en LiteRT) se descarga por separado y no forma parte de este repositorio.

La relevancia del artefacto es práctica: demuestra una arquitectura RAG completamente on-device pensada para un teléfono, con un presupuesto de almacenamiento inferior a 1 GB (0,8 GB de repositorio) y un esquema de cuantización agresivo que, según el autor, mantiene hit, evidence recall, nDCG@5 y MRR@5 dentro de 0,4 puntos respecto a los modelos float32 originales sobre 500 preguntas del benchmark_mobile. El recuento de parámetros declarado en safetensors (106.845.696) corresponde al embedder granite-107m; el Qwen3-Embedding-0.6B se distribuye únicamente como GGUF y no aparece en ese recuento.

Se trata, por tanto, de un recurso de infraestructura para desarrolladores que quieran replicar o adaptar una pipeline RAG móvil con recuperación en dos etapas (EcoVector + SCR), no de un modelo de lenguaje con el que conversar. La licencia es "other" y el único idioma declarado es el portugués.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para embeddings (Qwen3-Embedding-0.6B-v2 y granite-embedding-107m-multilingual); índice vectorial EcoVector (k-means + HNSW sobre centroides y por clúster) y ventanas SCR precalculadas |
| Parametros totales | 106.845.696 (safetensors, corresponde al embedder granite-107m); Qwen3-Embedding-0.6B no cuantificado en safetensors en este repo |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 para los dos embedders GGUF; int8 con una escala por ventana para los vectores SCR |
| Idiomas soportados | pt (portugués) |
| Licencia | other (modelos base: Apache 2.0 para Qwen3-Embedding-0.6B y granite-embedding-107m-multilingual; documentos fuente del corpus: other) |
| Formato de pesos | GGUF (embedders), SQLite con extensión sqlite-vec `vec0` (corpus e índices), JSON (manifiesto `mobilerag-plus.json`) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: empaqueta artefactos derivados. Los dos embedders se convierten a GGUF Q8_0 con `convert_hf_to_gguf.py` de llama.cpp build b10256, la versión que integra llama.rn 0.12.9. El embedder de recuperación es un fine-tune de Qwen/Qwen3-Embedding-0.6B (publicado como UFGCEMIGONA/Qwen3-Embedding-0.6B-v2), con pooling de último token y 1.024 dimensiones; requiere anteponer una instrucción de consulta almacenada en el manifiesto, sin separador, tras lo cual el modelo añade `<|endoftext|>`. El embedder de SCR es granite-embedding-107m-multilingual de IBM, con pooling CLS, 384 dimensiones y sin instrucción.

La pipeline consta de tres piezas. Primero, un corpus de 3.764 fragmentos embebidos con Qwen y almacenados en una tabla `vec0` de sqlite-vec (31 MB). Segundo, un índice EcoVector de 17 MB que particiona los vectores con k-means (unos 200 vectores por clúster, 19 clústeres) y construye un grafo HNSW sobre los centroides y otro por clúster, con búsqueda a `n_probe` 6 y `ef_search` 32. Tercero, Selective Content Reduction: cada ventana de 3 frases con paso 1 de cada fragmento se embebe con granite-107m en float32 y se cuantiza a int8 con una escala por ventana, generando 72.061 vectores (34 MB). La construcción y exportación las realiza la herramienta `mobile_rag` (`build-index`, `export-mobile-index`, `build-scr-windows`). El autor reporta que, sobre 500 preguntas, la combinación Q8_0 mantiene hit, evidence recall, nDCG@5 y MRR@5 a menos de 0,4 puntos de los modelos sentence-transformers en float32.

## Capacidades

- Generación de embeddings de consulta en dispositivo para recuperación semántica (Qwen3-Embedding-0.6B-v2, 1.024 dimensiones, Q8_0).
- Generación de embeddings de ventana para reducción selectiva de contenido (granite-embedding-107m-multilingual, 384 dimensiones, Q8_0).
- Recuperación aproximada de vecinos sobre 3.764 fragmentos mediante índice jerárquico EcoVector (centroides + 19 grafos HNSW por clúster).
- Expansión por vecinos de fichero (file-neighbor expansion) sobre el corpus.
- Reducción selectiva de contenido con 72.061 vectores de ventana de 3 frases en int8.
- Verificación de integridad y parámetros mediante manifiesto con tamaño y SHA-256 de cada fichero, con anclaje a un commit concreto del repositorio.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el stack llama.rn 0.12.9 / llama.cpp b10256.
- No incluye generación de texto: el modelo de respuesta (Energy-Mobile, LiteRT) se descarga aparte.

## Casos de uso

- Asistente móvil de atención al cliente en una eléctrica: la app descarga este paquete y ejecuta la recuperación local sobre el corpus de benchmark_mobile antes de invocar el modelo de respuesta, reduciendo llamadas a servidor y exponiendo menos datos del usuario.
- RAG completamente offline en Android/iOS: con los embedders Q8_0 y los índices SQLite, la recuperación funciona sin conectividad, útil en field service o zonas con cobertura intermitente.
- Búsqueda semántica sobre documentación regulatoria o técnica en portugués: los 3.764 fragmentos y el índice EcoVector permiten responder consultas con recuperación aproximada a bajo coste computacional.
- Filtrado y compresión de contexto antes de la generación: la etapa SCR selecciona ventanas de 3 frases relevantes mediante similitud con granite-107m, recortando el contexto que se envía al modelo de respuesta y reduciendo latencia y consumo.
- Prototipado de pipelines RAG en dos etapas: sirve como referencia reproducible de arquitectura embedder + índice jerárquico + reducción de contenido, con manifiesto versionado y verificación SHA-256.
- Evaluación de cuantización en recuperación: permite medir la degradación de hit, evidence recall, nDCG@5 y MRR@5 al pasar de float32 a Q8_0/int8 sobre un benchmark concreto de 500 preguntas.
- Empaquetado de activos para apps móviles: el manifiesto JSON con tamaños y hashes facilita la descarga incremental y la validación en el cliente, con anclaje a un commit.

## Benchmarks y rendimiento

El autor reporta únicamente una comparación agregada: sobre 500 preguntas de benchmark_mobile, MobileRAG+ con los vectores de consulta Q8_0 mantiene hit, evidence recall, nDCG@5 y MRR@5 dentro de 0,4 puntos de los modelos sentence-transformers en float32. No se publican valores absolutos por métrica ni comparaciones con otros sistemas.

| Metrica | Resultado |
|---|---|
| Hit (500 preguntas, Q8_0 vs float32) | diferencia ≤ 0,4 puntos (valor absoluto no disponible) |
| Evidence recall | diferencia ≤ 0,4 puntos (valor absoluto no disponible) |
| nDCG@5 | diferencia ≤ 0,4 puntos (valor absoluto no disponible) |
| MRR@5 | diferencia ≤ 0,4 puntos (valor absoluto no disponible) |
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo generativo) |

## Requisitos de hardware

- Almacenamiento: 0,8 GB de repositorio; en dispositivo, los ficheros suman aproximadamente 639 MB (Qwen Q8_0) + 121 MB (granite Q8_0) + 31 MB (corpus) + 17 MB (EcoVector) + 34 MB (ventanas SCR) + 2 KB (manifiesto).
- VRAM/RAM para inferencia de embeddings: no disponible de forma explícita; por tamaño, el embedder Qwen de 0,6B en Q8_0 requiere del orden de 0,7-1 GB de memoria y granite-107m en Q8_0 alrededor de 120-200 MB, pero son estimaciones, no datos del autor.
- GPU recomendadas: no disponible; el diseño está orientado a ejecución en CPU móvil vía llama.rn.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 2 GB de memoria libre puede alojar ambos embedders, aunque el objetivo declarado es el teléfono.
- Opciones de despliegue: llama.rn 0.12.9 (llama.cpp b10256) en móvil; llama.cpp en escritorio; sqlite-vec para los índices; la herramienta `mobile_rag` para construir y exportar índices.
- Latencia y throughput: no disponibles. Los parámetros de búsqueda declarados son `n_probe` 6 y `ef_search` 32 sobre 19 clústeres.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| MobileRAG+ assets (este repo) | 106.845.696 (granite-107m) + Qwen3-Embedding-0.6B en GGUF | no disponible | pt | other (bases Apache 2.0) | GGUF + SQLite | Pipeline RAG móvil completa con índices precalculados |
| Qwen/Qwen3-Embedding-0.6B | 0,6B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base del embedder de recuperación; sin índices ni SCR |
| ibm-granite/granite-embedding-107m-multilingual | 107M | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF | Modelo base del embedder de SCR; sin índices |
| sentence-transformers (float32) | variable | no disponible | variable | variable | safetensors | Referencia de calidad usada por el autor (diferencia ≤ 0,4 puntos) |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni responde preguntas por sí mismo; requiere un modelo de respuesta externo (Energy-Mobile en LiteRT).
- Idioma declarado únicamente portugués; el rendimiento en castellano u otros idiomas no está documentado.
- El corpus y los índices están atados al benchmark_mobile de CEMIG (3.764 fragmentos); no son reutilizables directamente para otros dominios sin reconstruir el índice con `mobile_rag`.
- La licencia es "other": los modelos base son Apache 2.0, pero los documentos fuente del corpus tienen licencia "other", lo que puede restringir el uso comercial del corpus y de los índices derivados. Verificar antes de producción.
- El repositorio ancla la app a un commit concreto; actualizar los ficheros exige revisar el manifiesto y los SHA-256.
- Solo se documenta una comparación agregada (≤ 0,4 puntos de diferencia frente a float32) sin valores absolutos por métrica, lo que impide evaluar la calidad real de recuperación de forma independiente.
- La cuantización Q8_0 e int8 introduce degradación, acotada según el autor pero no cuantificada por métrica.
- Sin datos publicados de latencia, throughput ni consumo energético en dispositivo.
- Riesgo de alucinación del sistema completo: reside en el modelo de respuesta externo, no en estos artefactos, pero la calidad de la recuperación condiciona directamente la fidelidad de las respuestas.
- El repositorio tiene 35 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vinyteles/mobilerag-plus-assets
- Modelo de respuesta Energy-Mobile (LiteRT): https://huggingface.co/Fazzioni/Energy-Mobile
- Embedder de recuperación (fine-tune): https://huggingface.co/UFGCEMIGONA/Qwen3-Embedding-0.6B-v2
- Embedder base de recuperación: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Embedder de SCR: https://huggingface.co/ibm-granite/granite-embedding-107m-multilingual
- Corpus fuente benchmark_mobile: UFGCEMIGONA/benchmark_mobile (referenciado en la model card; sin URL directa en la información disponible)
- llama.cpp (build b10256): no disponible en la información proporcionada
- llama.rn 0.12.9: no disponible en la información proporcionada
- sqlite-vec: no disponible en la información proporcionada
- Herramienta `mobile_rag`: no disponible en la información proporcionada

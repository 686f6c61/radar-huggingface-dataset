# waypoint-ML/pebble-25m

## Resumen

`pebble-25m` es un modelo de embeddings estáticos para inglés desarrollado por waypoint-ML, destilado del modelo denso `MongoDB/voyage-4-nano` mediante la técnica Tokenlearn. A diferencia de un transformer de codificación, no ejecuta atención ni capas profundas: codifica texto con una simple búsqueda en vocabulario, mean pooling y normalización L2, lo que permite inferencia en CPU a decenas de miles de documentos por segundo. Con 24,6 millones de parámetros (vocabulario de 48.000 tokens por 512 dimensiones), ocupa 98,3 MB en FP32.

El modelo está pensado para recuperación de alta throughput y pipelines híbridos BM25 + dense, donde el coste de codificar el corpus domina el presupuesto. Incorpora dimensiones Matryoshka (512, 256 y 128) para truncar vectores y reducir el coste del índice. En el benchmark NanoBEIR-en de 13 tareas alcanza 51,99 nDCG@10 y 57,27 MRR@10, situándose en un punto intermedio entre modelos estáticos más pequeños y más rápidos (`minishlab/blink-8M`) y modelos estáticos más grandes y precisos (`hotchpotch/bekko-static-embedding-v1`).

Es relevante ahora porque demuestra que la destilación de un modelo denso moderno a una tabla de embeddings estáticos conserva una calidad de recuperación competitiva con una fracción del coste computacional, lo que habilita búsqueda semántica en entornos sin GPU y a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Static Token Embedding Lookup (`model2vec` / `StaticEmbedding`) |
| Parametros totales | 24.576.000 (48.000 × 512) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; compatible con cuantización a través de las herramientas de model2vec, no documentada en la model card) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, FP32, 98,3 MB) |

## Arquitectura y entrenamiento

La arquitectura es un `StaticEmbedding` de model2vec: cada token se mapea a un vector de 512 dimensiones mediante una tabla de vocabulario (WordPiece en minúsculas de 48.000 entradas, con `[PAD]` en el ID 0); la representación de la frase se obtiene por mean pooling y normalización L2. No hay capas de atención ni cómputo dependiente de la longitud más allá del pooling, de ahí su velocidad en CPU (43.854 documentos/s con lotes de 64 frases). El checkpoint es Matryoshka: los vectores pueden truncarse a 256 o 128 dimensiones.

El entrenamiento se organiza en etapas. La etapa 1 (Tokenlearn) destila `MongoDB/voyage-4-nano` sobre 500.000 documentos de FineWeb-Edu, proyectando de 1024 a 512 dimensiones por PCA y aplicando SIF, y alcanza 43,55 nDCG@10. La etapa 2a aplica preentrenamiento contrastivo multi-dominio con InfoNCE y Matryoshka sobre pares de `lightonai/embeddings-pre-training-curated`. La etapa 2b refina con destilación KL desde las puntuaciones de un cross-encoder (`mxbai-rerank-large-v2`) sobre `lightonai/embeddings-fine-tuning-filtered-en`. El proceso se cierra con model souping con coincidencia de normas. Los conjuntos de evaluación OOD-8 se seleccionaron para no solaparse con los splits de entrenamiento.

## Capacidades

- Generación de embeddings de frase y documento para recuperación densa (feature-extraction).
- Búsqueda semántica y similitud coseno con vectores normalizados L2.
- Truncado Matryoshka a 256 y 128 dimensiones con pérdida de calidad controlada (51,99 → 50,50 → 47,28 nDCG@10 en NanoBEIR-13).
- Integración con `sentence-transformers` y con el ecosistema `model2vec`.
- Recuperación híbrida junto a BM25 en pipelines de búsqueda léxica + densa.
- Inferencia en CPU a alta velocidad, sin GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un codificador de embeddings.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Búsqueda semántica en producción sin GPU: codificar un corpus de millones de documentos en CPU a ~44.000 docs/s permite construir y refrescar índices vectoriales en minutos, sin depender de aceleradores.
- Recuperación híbrida BM25 + dense: usar `pebble-25m` como rama densa junto a un índice léxico para mejorar el recall en consultas parafraseadas, con coste de codificación despreciable frente a un modelo transformer.
- Reranking de primera etapa en pipelines de RAG: filtrar los cientos de candidatos iniciales con un codificador estático barato y reservar un cross-encoder o LLM para la etapa final, reduciendo el coste total del pipeline.
- Deduplicación y clustering de documentos a escala: calcular similitud entre millones de registros con vectores de 128 dimensiones truncados, reduciendo memoria del índice y coste de comparación.
- Búsqueda en dispositivos con recursos limitados: desplegar búsqueda semántica en portátiles, contenedores pequeños o entornos edge donde no cabe un modelo transformer, gracias a los 98,3 MB del checkpoint.
- Moderación y enrutado por similitud: clasificar tickets o consultas comparándolas contra un conjunto de prototipos embebidos, con latencia de milisegundos por lote en CPU.
- Filtrado previo en pipelines de anotación o curación de datasets: seleccionar pares texto-texto candidatos por similitud antes de un etiquetado más caro.

## Benchmarks y rendimiento

Resultados publicados en la model card, con embeddings normalizados y evaluados con `NanoBEIREvaluator` de `sentence-transformers`:

| Modelo | Parametros | Dim | NanoBEIR-13 nDCG@10 | OOD-8 nDCG@10 | MRR@10 | Recall@10 | Recall@100 | CPU docs/s |
|---|---|---|---|---|---|---|---|---|
| `pebble-25m` | 24,6M | 512 | 51,99 | 50,07 | 57,27 | 57,29 | 83,39 | 43.854 |
| `minishlab/blink-8M` | 7,7M | 256 | 51,82 | 50,25 | 56,29 | 58,38 | 83,81 | 49.248 |
| `minishlab/potion-base-32M` | 32,3M | 512 | 46,18 | 46,88 | 52,65 | 50,00 | 79,62 | 45.899 |
| `hotchpotch/bekko-static-embedding-v1` | 204,8M | 1024 | 53,10 | 52,64 | 58,42 | 58,79 | 85,08 | 25.944 |

Comparativa a dimensión truncada (nDCG@10 en NanoBEIR-13):

| Dim | `pebble-25m` | `blink-8M` | `bekko-static-v1` |
|---|---|---|---|
| 512d | 51,99 | no aplica | 52,17 |
| 256d | 50,50 | 51,82 | 50,32 |
| 128d | 47,28 | no disponible | 47,52 |

Progresión de entrenamiento (NanoBEIR-13): etapa 1 (Tokenlearn) 43,55 nDCG@10; etapa 2a (pares de preentrenamiento) 47,00 nDCG@10 y 52,99 Recall@10; el resultado final tras destilación KL y souping es 51,99 nDCG@10.

## Requisitos de hardware

- VRAM: no requiere GPU; el checkpoint FP32 ocupa 98,3 MB y la inferencia es una búsqueda en tabla, por lo que cabe en memoria principal de cualquier máquina.
- GPU recomendadas: no aplica; el modelo está diseñado para CPU. En GPU el cuello de botella sería el movimiento de memoria, no el cómputo.
- GPU de consumo: irrelevante; funciona en cualquier CPU moderna, incluidos portátiles y contenedores pequeños.
- Despliegue: librería `model2vec` y `sentence-transformers`; al ser un `StaticEmbedding`, no encaja en los motores de serving de LLM (vLLM, TGI) ni en llama.cpp/Ollama, que están orientados a transformers generativos.
- Rendimiento: 43.854 documentos/s en CPU con lotes de 64 frases (medido por el autor en una única máquina). Por debajo de `blink-8M` (49.248) y por encima de `potion-base-32M` (45.899) y `bekko-static-v1` (25.944).

## Comparativa con modelos similares

| Criterio | `pebble-25m` | `minishlab/blink-8M` | `minishlab/potion-base-32M` | `hotchpotch/bekko-static-embedding-v1` |
|---|---|---|---|---|
| Parametros | 24,6M | 7,7M | 32,3M | 204,8M |
| Dimension | 512 (MRL 256/128) | 256 | 512 | 1024 |
| NanoBEIR-13 nDCG@10 | 51,99 | 51,82 | 46,18 | 53,10 |
| OOD-8 nDCG@10 | 50,07 | 50,25 | 46,88 | 52,64 |
| CPU docs/s | 43.854 | 49.248 | 45.899 | 25.944 |
| Tamano de pesos | 98,3 MB FP32 | 29,3 MB FP32 | 123,2 MB FP32 | 390,6 MB FP16 |
| Licencia | Apache-2.0 | no disponible | no disponible | no disponible |

`pebble-25m` supera a `potion-base-32M` en calidad con menos parámetros, queda ligeramente por debajo de `blink-8M` en OOD y velocidad a un tercio del tamaño, y se acerca a `bekko-static-v1` con una octava parte de los parámetros.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado; su uso en otros idiomas degradará la recuperación.
- Ventana de 512 tokens: los documentos largos deben dividirse en fragmentos; el mean pooling diluye la señal en textos muy extensos.
- Al ser un modelo estático, no captura contexto posicional ni interacciones entre tokens más allá del pooling; el orden de las palabras se pierde.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos en similitud: términos polisémicos pueden quedar próximos en el espacio sin relación semántica real.
- En OOD-8 rinde ligeramente peor que `blink-8M` (50,07 frente a 50,25), pese a triplicar parámetros; conviene validar en el dominio objetivo antes de adoptarlo.
- No es adecuado para tareas generativas, tool calling ni agentes.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base `MongoDB/voyage-4-nano` debe verificarse por separado si se redistribuyen derivados.
- El modelo es muy reciente (creado en noviembre de 2026) y sin descargas ni likes registrados; no hay validación independiente de los resultados publicados.
- Los benchmarks son NanoBEIR, una versión reducida de BEIR; los resultados pueden no trasladarse a corpus de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waypoint-ML/pebble-25m
- Modelo base (profesor): https://huggingface.co/MongoDB/voyage-4-nano
- `minishlab/blink-8M`: https://huggingface.co/minishlab/blink-8M
- `minishlab/potion-base-32M`: https://huggingface.co/minishlab/potion-base-32M
- `hotchpotch/bekko-static-embedding-v1`: https://huggingface.co/hotchpotch/bekko-static-embedding-v1
- Dataset FineWeb-Edu (muestra): https://huggingface.co/datasets/ccde/fineweb-edu-sample-500K
- Dataset de preentrenamiento: https://huggingface.co/datasets/lightonai/embeddings-pre-training-curated
- Dataset de fine-tuning: https://huggingface.co/datasets/lightonai/embeddings-fine-tuning-filtered-en
- Librería model2vec: https://github.com/MinishLab/model2vec
- Cross-encoder usado en destilación KL: https://huggingface.co/mixedbread-ai/mxbai-rerank-large-v2

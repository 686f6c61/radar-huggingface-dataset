# tykan/KURE-Reranker-nano-GGUF

## Resumen

KURE-Reranker-nano es un reranker (cross-encoder) bilingüe coreano-inglés de aproximadamente 149 millones de parámetros, desarrollado por el grupo nlpai-lab de la Universidad de Corea (Korea University). El modelo recibe un par consulta-documento, los codifica conjuntamente y produce una puntuación escalar de relevancia, lo que lo hace adecuado para la segunda etapa de pipelines de recuperación de información (RAG, búsqueda semántica, motores de búsqueda internos).

Esta ficha describe la conversión a GGUF publicada por el usuario tykan, que empaqueta los pesos originales (revisión `8514b9e`) en formato GGUF para su uso con `llama-server --reranking` de llama.cpp. La conversión preserva la paridad numérica con el modelo original: 400 pares evaluados con correlación de Pearson 1.0000 y ranking idéntico tanto en F32 como en F16. Se ofrecen dos precisiones: F32 (570 MB) y F16 (286 MB).

La relevancia práctica de esta versión radica en que permite ejecutar un reranker de calidad en producción sin depender de PyTorch ni de sentence-transformers, con latencias de 0,11-0,12 segundos para 60 documentos cortos en un Apple M5 Pro. El modelo base está publicado bajo licencia Apache-2.0 y soporta coreano e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT (encoder transformer con atención de ventana deslizante y cabeza clasificadora con mean pooling) |
| Parametros totales | 149.323.009 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de referencia en `llama-server` con `-c 8192`) |
| Tipos de cuantizacion | F32 y F16 (en esta conversión GGUF); el modelo original no especifica otras cuantizaciones |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32 y F16); pesos originales en safetensors en el repositorio base |
| Tokenizador | WordPiece (con parche específico para ModernBERT en llama.cpp) |
| Tarea | text-ranking (reranking / cross-encoder) |
| Salida | logit de relevancia (aplicar sigmoid para obtener puntuación 0-1) |
| Repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en ModernBERT: un encoder transformer que procesa conjuntamente la consulta y el documento en una única secuencia con el formato `<s> query </s> document </s>`, y produce una puntuación de relevancia mediante una cabeza clasificadora con mean pooling. ModernBERT incorpora atención de ventana deslizante, lo que reduce el coste computacional en secuencias largas y permite manejar contextos de hasta 8192 tokens con un coste contenido para un modelo de 149M de parámetros.

La conversión a GGUF requirió un trabajo técnico específico: el tokenizador original es WordPiece, mientras que el conversor estándar de ModernBERT en llama.cpp asume BPE de GPT-2. El script `convert_wordpiece_modernbert.py` parchea únicamente el paso de vocabulario, escribiendo el vocabulario WordPiece con `add_bos=true`, `add_eos=true`, `add_sep=false`, y desactivando la conversión a minúsculas y la eliminación de acentos. Los pesos, el encoder ModernBERT, la cabeza clasificadora con mean pooling y la atención de ventana deslizante pasan por el conversor estándar sin modificaciones. La conversión se realizó con llama.cpp `cd959ba` (b12110) y se probó en llama.cpp 0.9.0 sobre Apple M5 Pro.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Reranking de pares consulta-documento: asigna una puntuación de relevancia escalar a cada par, útil para reordenar resultados de un recuperador de primera etapa (BM25, embeddings densos).
- Bilingüe coreano-inglés: entrenado y evaluado en ambos idiomas, con buen rendimiento en tareas de recuperación coreanas.
- Procesamiento de contexto largo: hasta 8192 tokens por par consulta-documento.
- Integración con llama.cpp: soporte nativo de `llama-server --reranking` con endpoint `/v1/rerank` compatible con la API de OpenAI.
- Salida de logits crudos: permite aplicar sigmoid para obtener puntuaciones normalizadas 0-1 o usar los logits directamente para ordenación.
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo exclusivamente de ranking.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- RAG (generación aumentada por recuperación): reordenar los documentos recuperados por un buscador vectorial o BM25 antes de pasarlos al LLM generador, mejorando la precisión de las respuestas. El contexto de 8192 tokens permite rerankear fragmentos largos sin truncar.
- Búsqueda empresarial interna en coreano: desplegar el modelo en un servidor llama.cpp junto a un índice de documentos coreanos para reordenar resultados de búsqueda con alta calidad (nDCG@10 de 0,9741 en AutoRAGRetrieval).
- Atención al cliente automatizada: rerankear artículos de base de conocimiento en coreano e inglés para seleccionar la respuesta más relevante antes de que un LLM la redacte, con latencia de 0,11-0,12 s para 60 documentos.
- Evaluación de calidad de datasets de recuperación: usar el modelo para puntuar pares consulta-documento y filtrar datos de entrenamiento o validación en pipelines de ML.
- Búsqueda en documentación técnica bilingüe: rerankear resultados en repositorios con documentación mixta coreano-inglés, aprovechando el soporte nativo de ambos idiomas.
- Despliegue en entornos sin GPU: la versión F16 (286 MB) puede ejecutarse en CPU con llama.cpp, lo que permite integrar el reranker en servicios ligeros o en el edge sin dependencias de PyTorch.
- Deduplicación y clustering de documentos: usar las puntuaciones de relevancia para agrupar documentos similares respecto a una consulta semilla.

## Benchmarks y rendimiento

Resultados de nDCG@10 según el protocolo de [reranker-simple-benchmark](https://github.com/instructkr/reranker-simple-benchmark) (gold + BM25 top-50), comparando la conversión F16 GGUF con el modelo original:

| Tarea | F16 GGUF | Original (model card) |
|---|---|---|
| PublicHealthQA | 0,8078 | 0,8078 |
| AutoRAGRetrieval | 0,9741 | 0,9741 |
| Ko-StrategyQA | 0,8598 | 0,8582 |
| BelebeleRetrieval | 0,9766 | 0,9768 |

Verificación de paridad con sentence-transformers: 400 pares, correlación de Pearson 1,0000 y ranking idéntico para F32 y F16; 0 desajustes de tokenizador en 210 casos sobre texto de benchmark.

Latencia medida en Apple M5 Pro con Metal:

| Documentos | F32 | F16 |
|---|---|---|
| 60 documentos cortos | 0,12 s | 0,11 s |
| 300 documentos | 0,59 s | 0,55 s |

Diferencia F32 vs F16 en PublicHealthQA (77 consultas × 50 documentos): diferencia máxima de logit de 0,006; el orden del top-10 cambió en 1 consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: F32 requiere aproximadamente 0,68 GB de RSS; F16, aproximadamente 0,39 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; probado en Apple M5 Pro con Metal. Funciona también en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp (`llama-server --reranking --pooling rank -c 8192 -b 8192 -ub 8192`), con endpoint `/v1/rerank` compatible con la API de OpenAI. No se documentan opciones para vLLM, TGI o Ollama en la información disponible.
- Latencia y throughput: 0,11-0,12 s para 60 documentos cortos y 0,55-0,59 s para 300 documentos en Apple M5 Pro (Metal). El throughput escala linealmente con el número de documentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| KURE-Reranker-nano (esta conversión) | 149M | 8192 | ko, en | Apache-2.0 | GGUF | Conversión comunitaria con paridad verificada |
| KURE-Reranker-nano (original) | 149M | 8192 | ko, en | Apache-2.0 | safetensors | Requiere sentence-transformers/PyTorch |
| KURE-Reranker-base | 2B | no disponible | ko, en | no disponible | no disponible | Versión de mayor tamaño de la misma familia |
| Alternativas de reranking multilingüe (p. ej. BGE-reranker, Jina Reranker) | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se han publicado resultados de benchmarks comparativos con modelos de otras familias en la información disponible. La única comparación disponible es con el propio modelo original, que muestra paridad numérica.

## Limitaciones y advertencias

- Tokenización de hanja (ideogramas CJK): llama.cpp siempre divide cada ideograma en su propia palabra (`大韓民國` → `大 韓 民 國`), mientras que el tokenizador original mantiene piezas de palabra (`大 ##韓 ##民 ##國`). El texto con abundantes hanja obtiene puntuaciones distintas y puede alterar el ranking.
- Normalización Unicode: llama.cpp no aplica NFC para WordPiece. El hangul descompuesto (NFD, por ejemplo, de nombres de archivo de macOS) se rompe en jamo y las puntuaciones pierden contraste. Es necesario normalizar a NFC antes de enviar el texto.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un modelo entrenado en coreano e inglés, puede reflejar sesgos de los corpus de entrenamiento en ambos idiomas.
- Riesgo de alucinación: al ser un cross-encoder de ranking, no genera texto, por lo que el riesgo de alucinación se limita a puntuaciones de relevancia poco calibradas en dominios alejados de los datos de entrenamiento.
- Limitaciones de idioma: solo soporta coreano e inglés; el rendimiento en otros idiomas no está garantizado ni documentado.
- Limitaciones de contexto: la ventana de 8192 tokens debe configurarse explícitamente en `llama-server`; secuencias más largas se truncan.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la atribución y el crédito del modelo corresponden a los autores originales (nlpai-lab).
- Caveat de producción: la salida son logits crudos, no probabilidades; es necesario aplicar sigmoid para obtener puntuaciones 0-1. La conversión se probó en llama.cpp 0.9.0 y `cd959ba` (b12110); versiones distintas pueden comportarse de forma diferente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la conversión es reciente y no ha sido ampliamente validada por la comunidad.

## Enlaces

- Conversión GGUF: https://huggingface.co/tykan/KURE-Reranker-nano-GGUF
- Modelo original: https://huggingface.co/nlpai-lab/KURE-Reranker-nano
- Colección KURE-Reranker: https://huggingface.co/collections/nlpai-lab/kure-reranker
- Estadísticas del modelo: https://openmodelstats.com/models/nlpai-lab/kure-reranker-nano
- Benchmark de rerankers: https://github.com/instructkr/reranker-simple-benchmark

# wasabihu/xerj-bilingual-fin-law-384

## Resumen

`xerj-bilingual-fin-law-384` es un modelo de embeddings densos de 384 dimensiones desarrollado por el usuario wasabihu, afinado a partir de `intfloat/multilingual-e5-small`. Está especializado en recuperación de información (retrieval) sobre tres dominios concretos: divulgaciones financieras ( filings de la SEC), legislación estatutaria de la República Popular China y documentación de ensayos clínicos. Soporta consultas y pasajes en chino simplificado, chino tradicional e inglés, y está diseñado para funcionar sin prefijos de tarea (`query:` / `passage:`), lo que simplifica su integración en motores de búsqueda.

El modelo se distribuye como adaptación directa del backbone BERT de 12 capas y 384 dimensiones de `multilingual-e5-small`, con 117,65 millones de parámetros totales y una longitud máxima de secuencia de 512 tokens. Su rasgo diferencial es la integración nativa con el motor de búsqueda XERJ (versión `v1.0.0-rc.105+`), para el que se publican tres formatos de pesos verificados: safetensors FP32, ONNX FP32 y ONNX con pesos en FP16 e I/O en FP32.

La relevancia actual del modelo radica en su enfoque de "clean-room": el autor declara una auditoría programática sobre 2.751 tripletas de entrenamiento y 606 de evaluación que garantiza cero solapamiento entre train y eval, y ausencia de registros propietarios de CNINFO o HKEX. La licencia MIT facilita su uso comercial, aunque el alcance real de la auditoría no es verificable de forma independiente a partir de la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (BertModel), 12 capas, 384 dimensiones de embedding |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | FP32 (safetensors y ONNX), FP16 en pesos con I/O FP32 (ONNX `model_fp16_io32.onnx`); no se documentan GGUF ni INT8 |
| Idiomas soportados | chino simplificado (zh-Hans), chino tradicional (zh-Hant), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 448,8 MB), ONNX FP32 (`onnx/model.onnx`, 448,44 MB), ONNX FP16 pesos / FP32 I/O (`onnx/model_fp16_io32.onnx`, 224,38 MB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del encoder BERT de `intfloat/multilingual-e5-small`: 12 capas, dimensión oculta de 384, `pad_token_id=0` y ventana de 512 tokens. La salida es un vector denso de 384 dimensiones obtenido mediante mean pooling sobre la atención con máscara y normalización L2, idéntico al pipeline que aplica XERJ internamente. El entrenamiento se realizó estrictamente sobre texto sin prefijos, eliminando la necesidad de anteponer `query:` o `passage:` en inferencia, lo que reduce el riesgo de desajuste entre el tokenizador del motor y el del modelo.

El conjunto de entrenamiento declarado consta de 2.751 tripletas y el conjunto de evaluación retenido de 606 tripletas, auditados mediante el fichero `CLEAN_ROOM_AUDIT.json` para descartar solapamiento a nivel de grupo, documento y consulta. La información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento, la función de pérdida (contrastiva, triplet, etc.) ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas más allá del fine-tuning estándar del encoder.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para búsqueda semántica y similitud de frases.
- Recuperación bilingüe y bidireccional entre chino simplificado, chino tradicional e inglés.
- Recuperación sobre dominios especializados: estatutos de la RPC (incluidos numerales arábigos como `第147条`), filings de la SEC y documentación de ensayos clínicos.
- Funcionamiento sin prefijos de tarea, compatible con la tokenización y el pooling nativos de XERJ.
- Integración en modos de búsqueda `neural` (Candle), `onnx-experimental`, `proxy` e `hybrid` RRF de XERJ `v1.0.0-rc.105+`.
- Compatibilidad con `transformers` y con `text-embeddings-inference` (según los tags del repositorio).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica en bases de datos regulatorias chinas: indexar estatutos de la RPC y recuperar el artículo relevante ante consultas en chino simplificado o tradicional, aprovechando el 100% de R@1 declarado en numerales arábigos sobre el benchmark del autor.
- Recuperación de fragmentos en filings de la SEC: construir un pipeline de RAG sobre informes 10-K y 10-Q en inglés, donde el modelo alcanza el 100% de R@1 en el benchmark de 150 consultas del autor.
- Búsqueda híbrida en repositorios de ensayos clínicos: combinar BM25 con este modelo en modo `hybrid` RRF de XERJ para consultas médicas en inglés y chino, con 84% de R@1 en el subconjunto clínico del benchmark.
- Deduplicación y clustering de documentos legales: usar los embeddings normalizados para agrupar versiones de estatutos o cláusulas contractuales por similitud coseno.
- RAG en asistentes de cumplimiento normativo: alimentar un recuperador de bajo coste (5,42 ms/consulta en ONNX FP32 sobre CPU Apple Silicon) para respuestas citadas sobre legislación y divulgaciones financieras.
- Filtrado previo en pipelines de revisión documental: descartar pasajes irrelevantes antes de un reranker más costoso, usando el modelo como primera etapa de recuperación.
- Búsqueda multilingüe en corpus mixtos zh-Hans/zh-Hant/en: normalizar consultas en chino tradicional y recuperar pasajes en simplificado o inglés sin traducción intermedia.

## Benchmarks y rendimiento

Evaluación ciega retenida completa (606 consultas, 673 pasajes; 6 estatutos, 11 tickers de la SEC y 14 documentos clínicos retenidos), según la model card:

| Modelo / modo | R@1 | R@5 | R@10 | MRR@10 | Estatutos arábigos R@1 (n=131) | CJK tradicional R@1 |
|---|---:|---:|---:|---:|---:|---:|
| Base `intfloat/multilingual-e5-small` (sin prefijos) | 52,48% | 73,93% | 78,88% | 0,6148 | 77,10% | 63,43% (n=216) |
| `xerj-bilingual-fin-law-384` (PyTorch/ORT offline) | 81,52% | 96,53% | 98,51% | 0,8789 | 99,24% | 98,15% (n=216) |

Benchmark en vivo de XERJ (150 consultas estratificadas, 238 pasajes; 50 clínicos, 50 estatutos de la RPC, 50 filings de la SEC), medido en CPU Apple Silicon:

| Modo | R@1 | R@5 | R@10 | MRR@10 | Clínico R@1 | Estatuto RPC R@1 | SEC R@1 | Arábigo R@1 (n=20) | CJK trad. R@1 (n=34) | Latencia |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `lexical` (rc.105) | 39,33% | 63,33% | 76,00% | 0,4980 | 62,00% | 42,00% | 14,00% | 60,00% | 5,88% | 0,67 ms/q |
| `bm25_xerj_cjk` | 82,00% | 96,00% | 100,00% | 0,8876 | 74,00% | 84,00% | 88,00% | 80,00% | 97,06% | 0,89 ms/q |
| `neural_candle` (safetensors) | 89,33% | 98,00% | 99,33% | 0,9367 | 70,00% | 98,00% | 100,00% | 100,00% | 97,06% | 20,44 ms/q |
| `proxy_onnx` (FP32) | 89,33% | 98,00% | 99,33% | 0,9367 | 70,00% | 98,00% | 100,00% | 100,00% | 97,06% | 5,42 ms/q |
| `proxy_onnx` (FP16/IO32) | 89,33% | 98,00% | 99,33% | 0,9367 | 70,00% | 98,00% | 100,00% | 100,00% | 97,06% | 8,86 ms/q |
| `hybrid` RRF 1:1,5 (FP32 ONNX) | 92,00% | 100,00% | 100,00% | 0,9539 | 84,00% | 92,00% | 100,00% | 100,00% | 97,06% | 5,96 ms/q |

El autor declara además una similitud coseno media de 1,000000 entre ONNX FP32 y PyTorch FP32, y de 0,999998 entre ONNX FP16/IO32 y FP32, con 0,00 pp de caída en Recall@1. No se han publicado resultados de benchmarks independientes ni comparaciones con otros modelos de embeddings en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en FP32 (safetensors u ONNX) y 0,22 GB en la variante ONNX FP16/IO32, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090 o RTX 3090 queda muy sobredimensionada para este encoder.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4060) e incluso en CPU. El benchmark del autor se ejecutó íntegramente en CPU Apple Silicon.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime, XERJ (`neural` con Candle, `onnx-experimental`, `proxy`, `hybrid`), y `text-embeddings-inference` según los tags. No se documentan instrucciones para llama.cpp, Ollama, vLLM ni TGI.
- Latencia declarada: 5,42 ms/consulta en ONNX FP32, 8,86 ms/consulta en ONNX FP16/IO32, 20,44 ms/consulta en Candle (safetensors), y 5,96 ms/consulta en modo híbrido RRF 1:1,5 con ONNX FP32, todo sobre CPU Apple Silicon. No se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | R@1 retenido (según autor) |
|---|---:|---:|---|---|---:|
| `xerj-bilingual-fin-law-384` | 117,65 M | 512 | zh-Hans, zh-Hant, en | MIT | 81,52% |
| `intfloat/multilingual-e5-small` (base) | ~118 M | 512 | multilingüe | MIT | 52,48% |
| `BAAI/bge-small-zh-v1.5` | ~24 M | 512 | zh | MIT | no disponible |
| `BAAI/bge-m3` | ~568 M | 8.192 | multilingüe | MIT | no disponible |

La comparación con `bge-small-zh-v1.5` y `bge-m3` se incluye por categoría (embeddings de retrieval), pero no se dispone de resultados de benchmarks de esos modelos sobre el conjunto de evaluación del autor, por lo que la comparación de rendimiento no es posible con la información proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de extracción de características: no genera texto, no razona y no soporta tool calling ni agentes.
- Ventana de contexto limitada a 512 tokens; los documentos largos deben fragmentarse antes de la indexación.
- Cobertura lingüística restringida a chino simplificado, chino tradicional e inglés; no se documenta rendimiento en otras lenguas.
- Los benchmarks proceden exclusivamente del autor del modelo, sobre conjuntos de evaluación propios y con tamaños reducidos (150 y 606 consultas); no hay validación independiente.
- La auditoría "clean-room" y la ausencia de solapamiento train/eval son declaraciones del autor no verificables de forma externa a partir de la información disponible.
- El rendimiento óptimo está ligado al ecosistema XERJ `v1.0.0-rc.105+`; fuera de ese motor, el comportamiento puede diferir del reportado.
- Riesgo de alucinación no aplicable en sentido estricto al ser un encoder, pero sí de recuperación de pasajes semánticamente próximos pero jurídicamente irrelevantes en consultas ambiguas.
- La licencia MIT permite uso comercial sin restricciones documentadas, pero conviene revisar las condiciones del modelo base `intfloat/multilingual-e5-small` (también MIT según la información disponible).
- No se documentan sesgos específicos ni evaluaciones de equidad; al entrenarse sobre dominios financiero, legal y clínico, puede heredar sesgos de esas fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasabihu/xerj-bilingual-fin-law-384
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio XERJ: https://github.com/xerj-org/xerj
- Fichero de auditoría clean-room: `CLEAN_ROOM_AUDIT.json` (referenciado en la model card, no se proporciona URL directa)
- Paper, blog o demo adicionales: no disponible

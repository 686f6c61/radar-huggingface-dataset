# webmp3/Sakura-EmbeddingGemma-2-AutoRound-GGUF

## Resumen

Sakura-EmbeddingGemma-2-AutoRound-GGUF es una familia de tres modelos de embeddings de texto cuantizados en formato GGUF, derivados del modelo base `google/embeddinggemma-2`. El autor, `webmp3`, aplica un pipeline propio de cuantización AutoRound (SignRoundV2 de AutoRound 0.16.0) sobre la arquitectura `gemma-embedding2` para producir variantes de precisión mixta nativa orientadas a llama.cpp. El modelo resuelve el problema de desplegar embeddings de alta fidelidad con huella de memoria mínima (entre 170 y 232 MiB según la variante) en entornos de CPU y consumer GPU, sin sacrificar apenas similitud coseno respecto al BF16 original.

La relevancia actual reside en la combinación de tres factores: cuantización calibrada con AutoRound en lugar de `llama-quantize` estándar, soporte nativo de Matryoshka Representation Learning (MRL) que permite truncar los embeddings de 768 a 512, 256 o 128 dimensiones con renormalización L2, y una licencia Gemma que permite uso comercial bajo condiciones. Los tres tiers (Q4_K_S, Q5_K_S y Q6_K) están calibrados con 256 muestras sintéticas de retrieval independientes del benchmark de evaluación, lo que evita contaminación de las métricas reportadas.

Con aproximadamente 271 millones de parámetros en la ruta de texto (413 tensores), el modelo es adecuado para pipelines de búsqueda semántica, deduplicación y clasificación donde el coste de almacenamiento de vectores y la latencia importan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma-embedding2 (transformer encoder de embeddings) |
| Parametros totales | 271.002.648 (~271M, ruta de texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (cuantización calibrada con seqlen 128) |
| Tipos de cuantizacion | Q4_K_S, Q5_K_S, Q6_K (precisión mixta nativa AutoRound; tensores PLE en Q8_0) |
| Idiomas soportados | en, multilingual |
| Licencia | gemma |
| Formato de pesos | GGUF (3 ficheros standalone, sin `mmproj`) |

| Variante | Fichero | Bytes | MiB | SHA256 |
|---|---|---:|---:|---|
| Q4 HQ | `sakura-embeddinggemma-2-autoround-v2-Q4_K_S-HQ-cal256.gguf` | 178.033.120 | 169,79 | `e01262207bf83d43043f9c880d4388b8b35f002c3fdaf86101252b3356f62ab1` |
| Q5 HQ | `sakura-embeddinggemma-2-autoround-v2-Q5_K_S-HQ-cal256.gguf` | 209.585.440 | 199,88 | `d0b5f556ed4916425a3512e4af1f0d7e631f9f85b6224b6b6d956c8f33adfaa0` |
| Q6 HQ | `sakura-embeddinggemma-2-autoround-v2-Q6_K-HQ-cal256.gguf` | 243.008.800 | 231,75 | `e5c8680e1562e47ac5d379a25dc98972ccbd037df858dbca387c1df316ae0430` |

| Dimension de embedding | Valor |
|---|---|
| Nativa | 768d |
| MRL tras truncado + renormalización L2 | 512 / 256 / 128 |

| Composicion de tensores por variante | Q4_K | Q8_0 | Q6_K | F32 |
|---|---:|---:|---:|---:|
| Q4 HQ | 169 | 49 | 1 | 194 |
| Q5 HQ | 169 | 50 | 0 | 194 |
| Q6 HQ | 169 | 50 | 0 | 194 |

## Arquitectura y entrenamiento

El modelo base `google/embeddinggemma-2` usa la arquitectura `gemma-embedding2`, un transformer encoder dedicado a la extracción de representaciones (pipeline `feature-extraction`), con 413 tensores y aproximadamente 271M de parámetros en la ruta de texto. Produce embeddings de 768 dimensiones y soporta truncado Matryoshka (MRL) a 512, 256 y 128 dimensiones con renormalización L2 posterior, lo que permite ajustar el compromiso entre precisión de recuperación y coste de almacenamiento en el índice vectorial. El snapshot BF16 de referencia está fijado en `914f7f89142e33e77833254d9c9b90c3cef7303b`.

El proceso de cuantización es la innovación técnica central: AutoRound 0.16.0 con SignRoundV2 nativo (`enable_alg_ext=True`), 50 iteraciones, calibración con 256 muestras sintéticas de retrieval independientes (48 consultas EN, 48 documentos EN, 48 consultas DE, 48 documentos DE, 32 consultas de código y 32 fragmentos de código, con solapamiento cero con el benchmark), seqlen 128, batch size 1, semilla 42, sobre CPU. Se optimizan 216 lineales del transformer y se empaquetan directamente los estados de escala, mínimo y doble escala sin pasar por `llama-quantize` ni por desquantización/requantización. Los tensores PLE (Per-Layer Embeddings) se almacenan en Q8_0 y las normas/escalares en F32. La variante Q5 incluye una corrección local al empaquetador Q5_K de AutoRound (enmascarado de nibbles bajos antes de combinar códigos de 5 bits y uso de `bits=5` en la ruta del token no calibrado), validada con siete tests de roundtrip y todas las comprobaciones de tensores optimizados. Los ficheros de AutoRound instalados y llama.cpp no se modifican.

## Capacidades

- Generación de embeddings de texto para similitud semántica y recuperación de información (pipeline `feature-extraction`).
- Embeddings multilingües con soporte declarado de inglés y multilingüe.
- Recuperación sobre código: el benchmark interno evalúa consultas y fragmentos de código por separado (Code Top-5 y Code nDCG@10).
- Truncado Matryoshka (MRL) a 512, 256 y 128 dimensiones con renormalización L2, para índices vectoriales de tamaño reducido.
- Compatibilidad con llama.cpp y endpoints compatibles (tag `endpoints_compatible`).
- No soporta tool calling, agentes ni generación de texto: es un modelo exclusivamente de embeddings.
- No dispone de visión, audio ni modo thinking.

## Casos de uso

- Búsqueda semántica en producción: el modelo genera embeddings de 768d (o 256d tras truncado MRL) indexables en bases vectoriales; la variante Q5 HQ ofrece un 95,40% de Text Top-5 con solo 200 MiB en disco, adecuada para corpus de documentación técnica.
- Deduplicación de documentos y detección de near-duplicates: la alta fidelidad coseno (0,9983 de media en Q5 HQ) permite fijar umbrales de similitud ajustados sin recalibrar contra el BF16.
- Recuperación de código en asistentes de desarrollo: la variante Q6 HQ alcanza un 97,20% de Code Top-5 y 0,9937 de Code nDCG@10, útil para indexar repositorios y sugerir fragmentos relevantes.
- Clasificación y clustering de tickets de soporte: con embeddings de 128d MRL y Q4 HQ (170 MiB) se puede ejecutar clustering en CPU sobre lotes grandes con huella mínima.
- RAG ligero en edge o portátil: los tres ficheros caben en cualquier GPU consumer y en CPU; Q4 HQ es un 28,45% más pequeño que el UD-Q6_K_XL de Unsloth, lo que facilita el despliegue en dispositivos con almacenamiento limitado.
- Filtrado multilingüe EN/DE: la calibración incluye muestras alemanas y el modelo declara soporte multilingüe, permitiendo recuperación cruzada en pipelines de contenido europeo.
- Servicio de embeddings de baja latencia: al ser un encoder de 271M en GGUF, la inferencia en llama.cpp sobre CPU es viable para servicios internos con throughput moderado y sin GPU dedicada.

## Benchmarks y rendimiento

Evaluación interna del autor sobre el mismo benchmark BF16, 768d, combinando 300 vectores (100 consultas de texto, 100 documentos, 50 consultas de código y 50 fragmentos de código). Todas las filas usan la misma referencia, prefijos, funciones de métrica y flags de runtime.

| Variante | MiB | Mean Cosine | Min Cosine | Spearman | Text Top-5 | Code Top-5 | Text/Code Recall@5 | Text nDCG@10 | Code nDCG@10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Sakura Q4 HQ | 169,79 | 0,99400270 | 0,98141599 | 0,98857239 | 90,00% | 87,60% | 100% / 100% | 0,97668917 | 0,97540851 |
| Unsloth UD-Q4_K_XL | 167,54 | 0,99354154 | 0,97681332 | 0,98770997 | 89,60% | 88,40% | 100% / 100% | 0,97352332 | 0,97615687 |
| Sakura Q5 HQ | 199,88 | 0,99828082 | 0,99384677 | 0,99664205 | 95,40% | 92,80% | 100% / 100% | 0,98892991 | 0,99019274 |
| Unsloth UD-Q5_K_XL | 200,32 | 0,99833661 | 0,99317700 | 0,99675520 | 94,80% | 94,40% | 100% / 100% | 0,98853356 | 0,99009068 |
| Sakura Q6 HQ | 231,75 | 0,99940187 | 0,99797606 | 0,99879852 | 96,80% | 97,20% | 100% / 100% | 0,99555133 | 0,99365559 |
| Unsloth UD-Q6_K_XL | 237,29 | 0,99926049 | 0,99767995 | 0,99853696 | 96,60% | 96,40% | 100% / 100% | 0,99417562 | 0,99165804 |

Comparación de tamaño verificada:

| Tier | Sakura HQ (MiB) | Unsloth mismo tier (MiB) | Ventaja de tamaño Sakura |
|---|---:|---:|---|
| Q4 | 169,79 | 167,54 | 1,34% más grande |
| Q5 | 199,88 | 200,32 | 0,22% más pequeño |
| Q6 | 231,75 | 237,29 | 2,33% más pequeño |

El autor indica que las comparaciones con Unsloth son específicas por métrica y no se reclama superioridad universal. No se han publicado resultados de benchmarks estándar externos (MMLU, HumanEval, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 271M en GGUF, los pesos ocupan entre 170 y 232 MiB; el consumo real de VRAM lo determina el tamaño de lote y la longitud de secuencia, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; A100, H100 y RTX 4090 quedan sobradamente dimensionadas y solo aportan ventaja en throughput por lotes grandes.
- Cabe en GPU consumer: sí, en cualquier RTX (3060 en adelante) y en GPUs integradas; también funciona en CPU.
- Opciones de despliegue: llama.cpp (formato nativo), servidores compatibles con endpoints (tag `endpoints_compatible`), Ollama mediante importación del GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensiones | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sakura-EmbeddingGemma-2 Q5 HQ | ~271M | no disponible | 768 (MRL 512/256/128) | gemma | GGUF | Mean Cosine 0,9983; Text Top-5 95,40% |
| Unsloth UD-Q5_K_XL (embeddinggemma-2) | ~271M | no disponible | 768 (MRL) | gemma | GGUF | Mean Cosine 0,9983; Text Top-5 94,80%; 200,32 MiB |
| Unsloth UD-Q6_K_XL (embeddinggemma-2) | ~271M | no disponible | 768 (MRL) | gemma | GGUF | Mean Cosine 0,9993; Text Top-5 96,60%; 237,29 MiB |
| google/embeddinggemma-2 (BF16) | ~271M | no disponible | 768 (MRL) | gemma | safetensors | Referencia de fidelidad; sin cuantización |

Las alternativas comparables documentadas son las variantes GGUF de Unsloth del mismo modelo base, que comparten arquitectura, licencia y dimensiones; la diferencia principal es el pipeline de cuantización (AutoRound nativo frente al esquema UD de Unsloth) y el tamaño resultante por tier.

## Limitaciones y advertencias

- Es un modelo exclusivamente de embeddings: no genera texto, no razona de forma autoregresiva y no soporta tool calling ni agentes.
- Riesgo de alucinación no aplica directamente (no genera texto), pero los embeddings pueden producir recuperaciones espurias en dominios fuera de la distribución de calibración (EN, DE y código).
- La calibración usó seqlen 128; no hay datos publicados sobre el comportamiento con secuencias largas, por lo que la longitud de contexto efectiva no está verificada.
- Los idiomas declarados son inglés y multilingüe, con calibración específica en EN y DE; el rendimiento en otras lenguas no está medido.
- La licencia Gemma impone condiciones de uso (política de uso aceptable de Google) y requiere revisión antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Las métricas reportadas provienen de un benchmark interno del autor con muestras sintéticas; no hay validación externa en MTEB ni en conjuntos públicos independientes.
- La variante Q5 incluye una corrección local al empaquetador de AutoRound; aunque el autor documenta hashes y tests, conviene verificar la integridad SHA256 antes de desplegar.
- El repositorio tiene 227 descargas y 2 likes en el momento de la consulta, lo que indica adopción comunitaria todavía baja.

## Enlaces

- [Hugging Face: webmp3/Sakura-EmbeddingGemma-2-AutoRound-GGUF](https://huggingface.co/webmp3/Sakura-EmbeddingGemma-2-AutoRound-GGUF)
- [Modelo base: google/embeddinggemma-2](https://huggingface.co/google/embeddinggemma-2)
- [Ficheros oficiales de Unsloth: unsloth/embeddinggemma-2-GGUF](https://huggingface.co/unsloth/embeddinggemma-2-GGUF/tree/main)
- [AutoRound (Intel)](https://github.com/intel/auto-round)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)

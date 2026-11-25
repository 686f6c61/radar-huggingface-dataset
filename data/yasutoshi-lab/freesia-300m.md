# yasutoshi-lab/Freesia-300M

## Resumen

Freesia-300M es un modelo de embeddings de frases (sentence-embeddings) bilingüe japonés-inglés desarrollado por yasutoshi-lab. Convierte frases y documentos en vectores de 768 dimensiones destinados a tareas de recuperación de información (retrieval), similitud semántica (STS) y clasificación. El modelo tiene 291.823.184 parámetros (aproximadamente 292M) y una longitud máxima de entrada de 2.048 tokens, lo que lo sitúa en la categoría de modelos de embeddings de ~300M con soporte para contexto medio-largo.

Su relevancia radica en la incorporación de dos mecanismos arquitectónicos propios: el Bloom gate, que aprende por cabeza de atención (336 en total) cuánto debe mirar hacia tokens posteriores, y el Petal Pooling, que agrega la salida de la última capa mediante 8 consultas aprendidas con cross-attention. El entrenamiento se realizó exclusivamente con datos abiertos (Wikipedia y FineWeb en japonés e inglés) más conjuntos sintéticos generados con LLM, en tres fases: preentrenamiento (~6B tokens), aprendizaje contrastivo débilmente supervisado y aprendizaje contrastivo supervisado.

El propio autor advierte en la model card que se trata de un modelo con fines de investigación y que su rendimiento como modelo de embeddings «no es alto». Los benchmarks publicados lo confirman: queda por debajo de alternativas como ruri-v3-310m, embeddinggemma-300m o granite-embedding-311m en la mayoría de las tareas evaluadas, tanto en JMTEB-lite como en MTEB. Su interés es, por tanto, más arquitectónico y experimental que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only adaptado a embeddings (28 capas), con Bloom gate por cabeza de atención y Petal Pooling |
| Parametros totales | 291.823.184 (~292M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (RoPE con θ=10.000, extendido con YaRN) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32) |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp32, ~1,17 GB) |

Otras especificaciones: dimensión oculta 768, dimensión intermedia FFN 3.072, 12 cabezas de atención con dimensión de cabeza 64, q_norm y k_norm, activación SiLU (SwiGLU), vocabulario de 32.768 tokens con BPE byte-level, embeddings de 768 dimensiones con normalización L2. Tamaño del repositorio: 1,2 GB.

## Arquitectura y entrenamiento

El modelo es un transformer de 28 capas con atención multi-cabeza estándar (12 cabezas, dimensión 64) que incorpora normalización de consultas y claves (q_norm, k_norm) y activación SwiGLU. La innovación principal es el Bloom gate: cada una de las 336 cabezas de atención (28 capas × 12 cabezas) dispone de un logit aprendido que modula la atención hacia tokens posteriores mediante un factor g = 0,1 + 0,9 × sigmoid(bloom_logit), sumado como log(g) a las puntuaciones de atención sobre tokens futuros. Tras el entrenamiento, los valores de g oscilan entre 0,11 y 0,98 con media 0,39, de modo que algunas cabezas operan principalmente de forma causal y otras adoptan comportamiento bidireccional. Esto permite cierto grado de atención hacia adelante sin renunciar a la estructura decoder-only.

Para obtener el embedding final se emplea Petal Pooling: 8 vectores de consulta aprendidos aplican cross-attention sobre la salida de la última capa, y el promedio de ese resultado se suma al mean pooling de la salida de la última capa, normalizándose después con L2. El entrenamiento consta de tres etapas: preentrenamiento con aproximadamente 6B tokens de Wikipedia y FineWeb en japonés e inglés; aprendizaje contrastivo débilmente supervisado con pares consulta-documento sintéticos generados por LLM a partir de los documentos de preentrenamiento; y aprendizaje contrastivo supervisado con tripletas consulta-positivo-negativo y pares de clasificación temática, también sintéticos. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de embeddings de frases y documentos de 768 dimensiones con normalización L2, aptos para búsqueda semántica y similitud.
- Recuperación de información (retrieval) bilingüe japonés-inglés mediante instrucciones de tarea (`ja-retrieval`, `en-retrieval`).
- Similitud semántica de frases (STS) con instrucciones `ja-sts` y `en-sts`.
- Clasificación de texto por temática con instrucciones `ja-classification` y `en-classification`.
- Soporte de instrucciones de tarea mediante chat template: el prefijo de instrucción se incluye en la atención pero se excluye del pooling.
- Manejo de entradas de hasta 2.048 tokens con truncado configurable.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio; es exclusivamente un modelo de extracción de características.

## Casos de uso

- Búsqueda semántica en corpus japoneses: indexar documentos y consultar con `task="ja-retrieval"` para recuperar pasajes relevantes; adecuado para bases documentales de hasta 2.048 tokens por fragmento, aunque con menor calidad que alternativas como ruri-v3-310m.
- Búsqueda semántica en corpus ingleses: mismo flujo con `task="en-retrieval"`, útil en prototipos y experimentos académicos donde la licencia Apache 2.0 y el tamaño reducido facilitan el despliegue.
- Detección de duplicados y near-duplicates: comparar embeddings de documentos con similitud coseno para deduplicar corpus bilingües antes de entrenar otros modelos.
- Clasificación temática zero-shot por similitud: generar embeddings de etiquetas y de textos con `ja-classification` o `en-classification` y asignar la etiqueta más próxima, sin entrenamiento adicional.
- Agrupamiento (clustering) de documentos: agrupar noticias, artículos o tickets de soporte por temática usando los embeddings normalizados y algoritmos como k-means.
- Investigación sobre arquitecturas de embeddings: el Bloom gate y el Petal Pooling son mecanismos reproducibles y documentados, útiles para estudiar atención bidireccional en modelos decoder-only y estrategias de pooling aprendidas.
- Servido de embeddings vía API compatible con OpenAI: el repositorio incluye un Dockerfile basado en vLLM (v0.34.0) con un plugin (`vllm_freesia/`) que expone `/v1/embeddings`, facilitando su integración en pipelines existentes.

## Benchmarks y rendimiento

Resultados publicados por el autor. Métricas: nDCG@10 para retrieval y correlación de Spearman para STS. Entradas de hasta 512 tokens en las tareas cortas.

Japonés (JMTEB-lite):

| Tarea | Tipo | Freesia-300M | ruri-v3-310m | gemma-300m | granite-311m-r2 | arctic-m-v2.0 | gte-base |
|---|---|---:|---:|---:|---:|---:|---:|
| JAQKET | Retrieval | 0,418 | 0,739 | 0,654 | 0,473 | 0,452 | 0,437 |
| Mr.TyDi | Retrieval | 0,389 | 0,620 | 0,568 | 0,578 | 0,561 | 0,613 |
| JaGovFaqs-22k | Retrieval | 0,630 | 0,772 | 0,722 | 0,714 | 0,643 | 0,622 |
| MIRACL | Retrieval | 0,484 | 0,708 | 0,665 | 0,641 | 0,599 | 0,659 |
| JaCWIR | Retrieval | 0,794 | 0,841 | 0,853 | 0,808 | 0,818 | 0,785 |
| JSTS | STS | 0,742 | 0,836 | 0,849 | 0,775 | 0,726 | 0,806 |
| JSICK | STS | 0,794 | 0,780 | 0,771 | 0,801 | 0,807 | 0,800 |
| Media retrieval | | 0,543 | 0,736 | 0,692 | 0,643 | 0,615 | 0,623 |
| Media STS | | 0,768 | 0,808 | 0,810 | 0,788 | 0,767 | 0,803 |
| Media total | | 0,607 | 0,757 | 0,726 | 0,684 | 0,658 | 0,675 |

Inglés (MTEB):

| Tarea | Tipo | Freesia-300M | ruri-v3-310m | gemma-300m | granite-311m-r2 | arctic-m-v2.0 | gte-base |
|---|---|---:|---:|---:|---:|---:|---:|
| SciFact | Retrieval | 0,579 | 0,624 | 0,784 | 0,704 | 0,718 | 0,730 |
| TREC-COVID | Retrieval | 0,573 | 0,675 | 0,763 | 0,692 | 0,804 | 0,571 |
| SCIDOCS | Retrieval | 0,139 | 0,163 | 0,195 | 0,218 | 0,204 | 0,182 |
| SICK-R | STS | 0,638 | 0,793 | 0,813 | 0,707 | 0,713 | 0,793 |
| STS13 | STS | 0,713 | 0,842 | 0,858 | 0,824 | 0,774 | 0,855 |
| STS15 | STS | 0,737 | 0,862 | 0,879 | 0,860 | 0,818 | 0,889 |
| Media retrieval | | 0,430 | 0,488 | 0,580 | 0,538 | 0,575 | 0,494 |
| Media STS | | 0,696 | 0,832 | 0,850 | 0,797 | 0,768 | 0,846 |
| Media total | | 0,563 | 0,660 | 0,715 | 0,668 | 0,672 | 0,670 |

Japonés, recuperación de documentos largos (JMTEB-lite), entradas de 512 tokens:

| Tarea | Freesia-300M | ruri-v3-310m | gemma-300m | granite-311m-r2 | arctic-m-v2.0 | gte-base |
|---|---:|---:|---:|---:|---:|---:|
| MLDR | 0,304 | 0,358 | 0,340 | 0,291 | 0,282 | 0,315 |
| NLP Journal (resumen→introducción) | 0,861 | 0,944 | 0,888 | 0,910 | 0,870 | 0,875 |

Los resultados con entradas de 2.048 tokens no están completos en la información disponible.

## Requisitos de hardware

- Inferencia en fp32: los pesos ocupan aproximadamente 1,17 GB; con activaciones y overhead de runtime, se estima un consumo de VRAM de entre 2 y 3 GB, aunque no se publican cifras oficiales.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090) puede ejecutar el modelo.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para indexar grandes corpus en paralelo.
- Despliegue recomendado por el autor: Docker basado en vLLM v0.34.0 con el plugin `vllm_freesia/`, que sirve `/v1/embeddings` y calcula el Bloom gate mediante PyTorch SDPA (el kernel de atención estándar de vLLM no lo soporta).
- Alternativas de despliegue (llama.cpp, Ollama, TGI): no disponibles de forma nativa, ya que requieren soporte para el Bloom gate y el Petal Pooling.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JMTEB-lite (total) | MTEB (total) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Freesia-300M | ~292M | 2.048 | 0,607 | 0,563 | Apache 2.0 | Hugging Face |
| ruri-v3-310m | ~310M | ≥2.048 | 0,757 | 0,660 | No disponible en la información | Hugging Face |
| embeddinggemma-300m | ~300M | ≥2.048 | 0,726 | 0,715 | No disponible en la información | Hugging Face |
| granite-embedding-311m-multilingual-r2 | ~311M | ≥2.048 | 0,684 | 0,668 | No disponible en la información | Hugging Face |
| snowflake-arctic-embed-m-v2.0 | ~300M (categoría) | ≥2.048 | 0,658 | 0,672 | No disponible en la información | Hugging Face |
| gte-multilingual-base | ~300M (categoría) | ≥2.048 | 0,675 | 0,670 | No disponible en la información | Hugging Face |

Freesia-300M es el menos competitivo del grupo en ambas medias globales. Destaca únicamente en JSICK (0,794, por delante de ruri-v3-310m y embeddinggemma-300m) y queda cerca en JaCWIR y NLP Journal. En retrieval japonés la brecha es notable (0,543 frente a 0,736 de ruri-v3-310m).

## Limitaciones y advertencias

- El autor declara explícitamente que es un modelo de investigación entrenado solo con datos abiertos y que su rendimiento como modelo de embeddings «no es alto».
- Rendimiento inferior a alternativas del mismo tamaño en la práctica totalidad de benchmarks publicados; no recomendable para producción sin evaluación previa en el dominio objetivo.
- Sesgos potenciales derivados de Wikipedia y FineWeb (sesgo de cobertura, sobrerrepresentación de ciertos temas y registros), no cuantificados en la información disponible.
- Riesgo de alucinación no aplica en sentido generativo, pero sí puede producir similitudes espurias en dominios alejados de los datos de entrenamiento.
- Los datos de entrenamiento contrastivo son sintéticos y generados por LLM, lo que puede introducir artefactos o sesgos del modelo generador.
- Contexto limitado a 2.048 tokens; entradas más largas se truncan por la derecha, con sustitución del último token por EOS en el plugin de vLLM.
- Solo soporta japonés e inglés; el rendimiento en otros idiomas no está evaluado.
- El uso correcto exige pasar las entradas en formato `messages` con `chat_template_kwargs.task`; usar el campo `input` directamente altera los embeddings porque omite la instrucción y el token EOS final.
- El Bloom gate no es compatible con los kernels de atención estándar de vLLM, lo que limita las opciones de despliegue y optimización.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasutoshi-lab/Freesia-300M
- Dataset del tokenizer: https://huggingface.co/datasets/yasutoshi-lab/freesia-tokenizer-pt
- Dataset de preentrenamiento: https://huggingface.co/datasets/yasutoshi-lab/freesia-pt
- Dataset de aprendizaje contrastivo débil: https://huggingface.co/datasets/yasutoshi-lab/freesia-weak-cl
- Dataset de aprendizaje contrastivo supervisado: https://huggingface.co/datasets/yasutoshi-lab/freesia-supervised-cl
- ruri-v3-310m (comparativa): https://huggingface.co/cl-nagoya/ruri-v3-310m
- embeddinggemma-300m (comparativa): https://huggingface.co/google/embeddinggemma-300m
- granite-embedding-311m-multilingual-r2 (comparativa): https://huggingface.co/ibm-granite/granite-embedding-311m-multilingual-r2
- snowflake-arctic-embed-m-v2.0 (comparativa): https://huggingface.co/Snowflake/snowflake-arctic-embed-m-v2.0
- gte-multilingual-base (comparativa): https://huggingface.co/Alibaba-NLP/gte-multilingual-base

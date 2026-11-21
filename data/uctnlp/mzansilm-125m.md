# uctnlp/mzansilm-125m

## Resumen

MzansiLM 125M es un modelo de lenguaje decoder-only de 125.008.384 parámetros desarrollado por el grupo uctnlp (University of Cape Town NLP) y preentrenado desde cero sobre MzansiText, un corpus abierto que cubre las once lenguas oficiales de Sudáfrica. Se publica junto al artículo de LREC 2026 «MzansiText and MzansiLM: An Open Corpus and Decoder-Only Language Model for South African Languages» y constituye una de las pocas bases abiertas de este tamaño centradas explícitamente en lenguas africanas de bajos recursos.

Arquitecturalmente sigue el patrón LlamaForCausalLM con atención de consultas agrupadas (GQA), 30 capas, dimensión oculta de 512, 9 cabezas de atención y 3 cabezas KV, con embeddings de palabras atados y una longitud de contexto de 2048 tokens. Incorpora un tokenizador BPE a nivel de byte propio con vocabulario de 65.536 entradas, entrenado sobre el mismo corpus multilingüe.

El modelo es relevante ahora porque ofrece una base ligera, con licencia Apache 2.0 y totalmente reproducible (corpus, tokenización, código de entrenamiento y evaluación publicados), pensada para ajuste fino e investigación en procesamiento de lenguas sudafricanas como zulú, xhosa, afrikáans, sesoto, setsuana, suazi, venda, tsonga, ndebele del sur y ndebele del norte. No es un modelo instruido: genera continuaciones de texto y requiere fine-tuning para tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only LlamaForCausalLM con GQA |
| Parametros totales | 125.008.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en precisión original; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | af, en, nso, st, ss, tn, ts, ve, xh, zu, nr (once lenguas oficiales sudafricanas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, PyTorch) |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Capas | 30 |
| Dimension oculta | 512 |
| Dimension intermedia | 1536 |
| Cabezas de atencion / cabezas KV | 9 / 3 (head_dim = 56) |
| RoPE theta | 10000.0 |
| RMSNorm epsilon | 1e-5 |
| Embeddings atados | si |
| Implementacion de atencion en entrenamiento | flash_attention_2 |
| Vocabulario del tokenizador | 65.536 (Byte-Level BPE) |
| Tokens especiales | [BOS]=0, [EOS]=1, [PAD]=2, [UNK]=3 |
| Normalizador | NFD (normalizar salidas a NFC para comparaciones) |
| Tamano del repositorio | 2.0 GB |
| Descargas | 1040 |
| Likes | 34 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estilo Llama con atención de consultas agrupadas (9 cabezas de consulta y 3 cabezas KV, head_dim de 56), 30 capas, dimensión oculta de 512 y dimensión intermedia de 1536. Usa RMSNorm con epsilon 1e-5, RoPE con theta 10000.0, embeddings de palabras atados y atención FlashAttention-2 durante el entrenamiento. La configuración presenta una particularidad técnica: hidden_size (512) no es divisible por num_attention_heads (9), por lo que el checkpoint fija explícitamente head_dim=56; esto provoca que el validador de LlamaConfig en Transformers 5 rechace la configuración y obliga a usar Transformers 4.x o el registro de compatibilidad de la librería sallm.

El preentrenamiento se realizó desde cero sobre MzansiText, corpus que cubre las once lenguas oficiales sudafricanas (afr, eng, nbl, nso, sot, ssw, tsn, tso, ven, xho, zul). La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF, DPO o instrucción; el modelo se distribuye como base pretrained sin ajuste por instrucciones. El tokenizador es un BPE a nivel de byte con normalizador NFD y post-procesador que añade [BOS] y [EOS] automáticamente, lo que exige eliminar el token EOS final antes de llamar a generate() para continuaciones de texto.

## Capacidades

- Generación de texto autoregresiva en once lenguas sudafricanas y en inglés.
- Modelado de lenguaje base: continuación de texto, cálculo de perplejidad y evaluación intrínseca.
- Punto de partida para ajuste fino supervisado en tareas downstream (clasificación, resumen, traducción, QA).
- Soporte de tool calling / function calling: no disponible (modelo base sin instrucción ni plantilla de chat).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingües limitadas a las lenguas del corpus MzansiText; no se documenta cobertura fuera de ese conjunto.
- Capacidades de visión, audio o modo thinking: no disponibles.
- Tokenizador multilingüe específico con vocabulario de 65.536 entradas adaptado a morfología aglutinante de las lenguas bantúes.

## Casos de uso

- Investigación en lenguas de bajos recursos: servir como baseline reproducible para experimentos de modelado de lenguaje en zulú, xhosa, sesoto y demás lenguas del corpus, con corpus y código de evaluación publicados.
- Ajuste fino para clasificación de texto (por ejemplo, detección de discurso de odio o análisis de sentimiento en xhosa o zulú): el tamaño de 125M permite entrenar en una única GPU consumer con datasets pequeños.
- Generación asistida de texto en afrikáans e inglés: continuación de frases y borradores para herramientas editoriales, dado el soporte nativo de ambos idiomas en el corpus.
- Traducción automática de bajo coste mediante fine-tuning: el modelo puede adaptarse como encoder-decoder implícito por continuación para pares entre inglés y lenguas sudafricanas.
- Experimentos de destilación y eficiencia: su reducido tamaño (125M) y contexto de 2048 tokens lo hacen adecuado como estudiante en pipelines de destilación desde modelos mayores.
- Evaluación comparativa de tokenizadores: permite estudiar el impacto de un vocabulario BPE de 65.536 entradas frente a tokenizadores multilingües genéricos en lenguas aglutinantes.
- Prototipado educativo y docencia: al ser Apache 2.0 y caber en GPUs modestas, es viable para cursos de NLP en contextos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo de LREC 2026 (ACL Anthology, DOI 10.63317/4g7i3kqszquh) para los resultados de evaluación, pero no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos (125M × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos, holgado en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU moderna; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo está sobredimensionado para estas GPUs en el sentido de que el cuello de botella será el throughput, no la memoria.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con al menos 4 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (versión 4.x recomendada por el propio autor), text-generation-inference (el repo declara endpoints_compatible), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU moderna, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MzansiLM 125M | 125M | 2048 | 11 lenguas sudafricanas + en | Apache 2.0 | Hugging Face (uctnlp) |
| Modelos tipo GPT-2 small | ~124M | 1024 | principalmente inglés | MIT (variantes) | amplia |
| Modelos tipo Llama pequeño (p. ej. variantes de 100-150M) | ~100-150M | variable | multilingüe general | variable | variable |
| Modelos africanos específicos de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer diferencias de rendimiento frente a alternativas. La comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Es un modelo base sin instrucción: no sigue instrucciones ni mantiene diálogos; requiere fine-tuning para tareas conversacionales o de agentes.
- Riesgo de alucinación alto en generación libre, especialmente fuera del dominio del corpus de entrenamiento.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida a las once lenguas oficiales sudafricanas y al inglés; no se garantiza calidad en otras lenguas.
- Posibles sesgos derivados del corpus MzansiText (fuentes web, desequilibrios por lengua y por registro); no se documenta un análisis de sesgos en la model card.
- Incompatibilidad conocida con Transformers 5 por la combinación hidden_size=512 y num_attention_heads=9; requiere Transformers 4.x o el registro de compatibilidad de sallm.
- El tokenizador añade [EOS] automáticamente; es necesario eliminarlo antes de generate() para continuaciones, lo que puede provocar errores en pipelines mal adaptados.
- Normalizador NFD: las comparaciones de cadenas deben normalizarse a NFC para evitar discrepancias.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo base los riesgos de calidad en producción recaen sobre el integrador.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uctnlp/mzansilm-125m
- Paper (LREC 2026, ACL Anthology): https://aclanthology.org/2026.lrec-1.109/
- Paper (arXiv): https://arxiv.org/abs/2603.20732
- DOI: https://doi.org/10.63317/4g7i3kqszquh
- Corpus MzansiText: https://huggingface.co/datasets/uctnlp/mzansi-text
- Corpus tokenizado: https://huggingface.co/datasets/uctnlp/mzansi-text-tokenized
- Código de entrenamiento y evaluación (sallm): https://github.com/Anri-Lombard/sallm
- Colección MzansiLM & MzansiText: https://huggingface.co/collections/uctnlp/mzansilm-and-mzansitext-6a6b3de8f1bff1af24030440

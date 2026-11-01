# webmp3/Sakura-Qwen_Qwen3-8B-GGUF

## Resumen

Sakura-Qwen_Qwen3-8B-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen3-8B, desarrollada por el usuario webmp3 bajo el paraguas del proyecto Sakura. No se trata de un modelo nuevo, sino de una redistribución optimizada del checkpoint original de Qwen, pensada para su ejecución en hardware de consumo mediante llama.cpp. El modelo base Qwen3-8B es un transformer denso de 8.190.735.360 parámetros publicado por Alibaba Qwen, con soporte nativo de razonamiento y capacidades multilingües en inglés y chino.

La relevancia de esta ficha radica en que ofrece cuatro niveles de cuantización (Q2_K, Q3_K_M, Q4_K_M y Q5_K_M) generados con una matriz de importancia (imatrix) calculada sobre un corpus de calibración fijo. El autor documenta métricas de fidelidad respecto al BF16 original (perplejidad, divergencia KL y coincidencia del token top-1), lo que permite evaluar el compromiso entre tamaño y degradación de calidad con datos medidos, algo poco habitual en cuantizaciones comunitarias.

El repositorio ocupa 18,3 GB e incluye los cuatro ficheros GGUF con hashes SHA-256 verificables, además de la build exacta de llama.cpp utilizada en las pruebas. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita su uso comercial con las condiciones habituales de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3 (transformer denso, segun metadatos GGUF) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (con imatrix) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (4 ficheros, de 3,3 GB a 5,9 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-8B, un transformer denso de 8,19 mil millones de parámetros. La model card de esta cuantización no detalla la composición del dataset de entrenamiento original, el número de tokens procesados ni si hubo fases de RLHF o DPO; esa información corresponde al repositorio oficial de Qwen/Qwen3-8B y no se reproduce aquí. Lo que sí documenta el autor es el proceso de cuantización: se parte del fichero `Qwen_Qwen3-8B-bf16.gguf` de bartowski (16,4 GB), verificado por SHA-256, y se recuantiza con las herramientas estándar de llama.cpp.

La innovación técnica de esta release es el uso de una importance matrix (imatrix) generada con `llama-imatrix` sobre un texto de calibración fijo de 6144 bytes (inglés, alemán y chino, con código y formatos de datos, en 11 fragmentos de 128 tokens). La matriz se aplica con `llama-quantize --imatrix`. El autor advierte que el corpus de calibración es corto y no reclama mejoras de calidad sin benchmark. Las pruebas de inferencia se realizaron con la build `b11669-620d2225c` de llama.cpp, y cada fichero fue cargado y utilizado para generar texto al menos una vez.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Razonamiento y resolución de problemas derivados del modelo base Qwen3-8B (no se documentan modos thinking específicos en esta cuantización).
- Generación de código y matemáticas, heredadas del checkpoint original, aunque sin benchmarks medidos en esta release.
- Tool calling y function calling: capacidad del modelo base, no verificada de forma específica en esta cuantización.
- Uso en agentes y razonamiento multi-paso: potencial heredado del modelo base, sin evaluación publicada aquí.
- Ejecución local en CPU y GPU mediante llama.cpp, con cuatro perfiles de memoria ajustables.

## Casos de uso

- Despliegue en portátiles y estaciones de trabajo sin GPU dedicada: la variante Q4_K_M (5,0 GB) permite ejecutar el modelo en CPU con llama.cpp en equipos con 8-16 GB de RAM, manteniendo una fidelidad del 90,39 % en el token top-1 respecto al BF16.
- Prototipado rápido de asistentes conversacionales en inglés o chino: la variante Q5_K_M (5,9 GB) ofrece la mayor fidelidad (93,14 % de coincidencia top-1) y es adecuada para validar flujos de diálogo antes de migrar a infraestructura mayor.
- Evaluación de pipelines RAG con contexto limitado: al no documentarse la longitud de contexto en esta release, conviene verificar la ventana efectiva en llama.cpp antes de diseñar el chunking; una vez confirmada, el modelo puede generar respuestas sobre documentos recuperados en inglés y chino.
- Generación de código asistida en entornos con recursos restringidos: la variante Q3_K_M (4,1 GB) cabe en GPUs de 6-8 GB y puede integrarse en editores o scripts de automatización, aceptando la pérdida de fidelidad asociada (84,02 % top-1).
- Experimentación académica con cuantizaciones: el repositorio proporciona hashes, métricas de perplejidad y KL por variante, lo que lo convierte en un banco de pruebas útil para estudiar el impacto de la cuantización con imatrix en modelos de 8B.
- Distribución de demos offline: la variante Q2_K (3,3 GB) permite empaquetar una demo funcional en entornos con almacenamiento muy limitado, a costa de una degradación notable (74,51 % top-1, perplejidad 1,38× la del BF16).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor sí proporciona métricas de fidelidad respecto al BF16 medidas con `llama-perplexity` sobre dos textos de dominio público (Pride and Prejudice en inglés y Hongloumeng en chino, 4 ventanas de 512 tokens). La perplejidad del BF16 de referencia es 8,590.

| Cuantizacion | Tamano | Perplejidad | Ratio vs BF16 | KL media | Top-1 coincidente |
|---|---:|---:|---:|---:|---:|
| Q2_K | 3,3 GB | 11,877 | 1,3826 ± 0,0528 | 0,35194 | 74,51 % |
| Q3_K_M | 4,1 GB | 10,352 | 1,2051 ± 0,0316 | 0,14697 | 84,02 % |
| Q4_K_M | 5,0 GB | 8,804 | 1,0249 ± 0,0150 | 0,04487 | 90,39 % |
| Q5_K_M | 5,9 GB | 8,678 | 1,0101 ± 0,0093 | 0,01966 | 93,14 % |

Estas cifras describen únicamente la concordancia con el modelo fuente en ese texto de evaluación y no constituyen benchmarks de tareas ni garantizan el comportamiento en otros idiomas o dominios.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q2_K ~3,3 GB, Q3_K_M ~4,1 GB, Q4_K_M ~5,0 GB, Q5_K_M ~5,9 GB (más overhead de contexto y KV cache).
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M y Q5_K_M encajan en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070); Q2_K y Q3_K_M caben en GPUs de 6 GB.
- Compatibilidad con GPU consumer: sí, todas las variantes caben en GPUs de gama media; las de 4 GB solo admitirían Q2_K con contexto muy reducido.
- Opciones de despliegue: llama.cpp (build `b11669-620d2225c` verificada por el autor). Otros runners compatibles con GGUF (Ollama, LM Studio, koboldcpp) no han sido validados en esta release.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sakura-Qwen_Qwen3-8B-GGUF (esta release) | 8,19B | no disponible | GGUF (Q2_K–Q5_K_M) | Apache 2.0 | Cuantizacion con imatrix y metricas de fidelidad publicadas |
| Qwen/Qwen3-8B (original) | 8,19B | no disponible | safetensors/BF16 | Apache 2.0 | Checkpoint de referencia, 16,4 GB en BF16 GGUF |
| bartowski/Qwen_Qwen3-8B-GGUF | 8,19B | no disponible | GGUF | Apache 2.0 | Fuente de la recuantizacion; sin metricas de fidelidad detalladas en la informacion disponible |

No se dispone de datos de benchmarks de tareas que permitan comparar el rendimiento cualitativo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: incluso Q5_K_M presenta un 6,86 % de discrepancia en el token top-1 respecto al BF16; Q2_K supera el 25 % de discrepancia y una perplejidad 1,38× superior.
- El corpus de calibración de la imatrix es muy corto (6144 bytes) y el propio autor no reclama mejoras de calidad sin benchmark.
- Los idiomas declarados son únicamente inglés y chino; el rendimiento en castellano no está evaluado ni garantizado.
- La longitud de contexto efectiva no se documenta en esta release; debe verificarse en llama.cpp antes de usarla en producción con prompts largos.
- Riesgo de alucinación inherente al modelo base Qwen3-8B, no mitigado por la cuantización.
- Sesgos del modelo original no evaluados en esta release.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución a Qwen y respetar los términos del modelo base.
- Solo se ha validado con una build concreta de llama.cpp (`b11669-620d2225c`); otras versiones o runners pueden presentar incompatibilidades.
- El repositorio tiene muy poca tracción (88 descargas, 0 likes) y no es una release oficial de Qwen; para producción se recomienda contrastar con el checkpoint original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen_Qwen3-8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio fuente de la cuantización: https://huggingface.co/bartowski/Qwen_Qwen3-8B-GGUF
- Commit del modelo base citado: https://huggingface.co/bartowski/Qwen_Qwen3-8B-GGUF/blob/0b69f75b7472688e6808490aa2b85efdb81b5ce7/README.md

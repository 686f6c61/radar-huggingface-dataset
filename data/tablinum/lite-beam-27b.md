# tablinum/Lite-Beam-27B

## Resumen

Lite-Beam 27B es una versión cuantizada extrema del modelo Qwen3.8-27B de Qwen, publicada por la empresa Tablinum en Hugging Face. No es un modelo base nuevo, sino un derivado cuantizado en formato GGUF para llama.cpp, disponible en dos variantes: IQ1_M (1-bit, 6,73 GB) e IQ2_S (2-bit, 9,26 GB). Su propuesta de valor es hacer que un modelo denso de 27B parámetros quepa en GPUs de consumo pequeñas, y compensar la pérdida de conocimiento que provoca una cuantización tan agresiva mediante un "engram" con puerta (gated engram): un mecanismo de recuperación aumentada (retrieval-augmented) que inyecta pasajes de referencia solo cuando responden exactamente a la pregunta.

La relevancia de esta ficha está en los resultados medidos: con el engram Tablinum-2, la variante 1-bit pasa de −14,0 a +43,0 en SimpleQA-verified (93 respuestas correctas frente a 7 incorrectas sobre 200) y de −14,5 a +13,5 en AA-Omniscience dev. El método Lite-Beam usa un conjunto de calibración, una matriz de importancia (imatrix) y un cuantizador propios, con layouts por tensor de ISTA-DASLab y Unsloth. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), con componentes DeltaNet según los maps de cuantización |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no consta que sea MoE; aparenta ser denso) |
| Longitud de contexto | no disponible (las ejecuciones de benchmark usan un presupuesto de 32K tokens) |
| Tipos de cuantización | IQ1_M (1,97 bpw) e IQ2_S (2,71 bpw), con maps mixtos por tensor (IQ3_S, IQ3_XXS, IQ2_XXS, IQ4_XS, F32/BF16 en gates DeltaNet) |
| Idiomas soportados | Inglés (según model card; el modelo base Qwen3.8 probablemente soporta más, pero no consta aquí) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

Lite-Beam 27B parte de Qwen/Qwen3.8-27B, un modelo de lenguaje de ≈27B parámetros. La innovación central no está en el entrenamiento del modelo base sino en el proceso de cuantización: Tablinum emplea su propio conjunto de calibración y matriz de importancia (imatrix) —el método "Lite-Beam"— para decidir qué bits asignar a cada tensor. En IQ2_S, la atención se cuantiza a IQ3_S/IQ3_XXS, el FFN mayoritariamente a IQ2_XXS–IQ3_XXS, la salida a IQ4_XS y los embeddings de tokens a IQ2_S, manteniendo los gates DeltaNet en F32/BF16. Los layouts por tensor provienen de ISTA-DASLab (GSQ-RCO IQ2_S) y Unsloth (UD-IQ1_M).

La fidelidad se mide con KLD frente al modelo BF16 solo sobre tokens del asistente (los tokens de sistema y usuario no entrenados falsearían la media): 0,121 para IQ2_S y 0,418 para IQ1_M en conversación; IQ1_M mantiene un 85,8% de coincidencia en el token top-1 con BF16. La segunda pieza clave es el engram Tablinum-2, un conjunto de tablas de recuperación por dominio (Software, Ley, STEM, Finanzas, Salud, Humanidades) con un prompt de inyección "v1" que instruye al modelo para usar un pasaje solo si responde exactamente a la pregunta, y en caso contrario apoyarse en su propio conocimiento o admitir que no lo sabe. No se ha publicado información sobre reentrenamiento, RLHF/DPO ni tokens del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Respuesta a preguntas de conocimiento cerrado (closed-book), muy mejorada con el engram Tablinum-2.
- Razonamiento científico: 70,2% en GPQA Diamond (139/198) con esfuerzo bajo y presupuesto de 32K tokens (IQ2_S).
- Respuesta fundamentada en documentos: el prompt v1 induce disciplina de citación, sustituyendo respuestas confiantes erróneas por respuestas fundamentadas.
- Calibración de incertidumbre: la variante 1-bit prefiere declinar ("no lo sé") antes que adivinar (71 errores frente a 149 en AA closed-book).
- No hay información publicada sobre tool calling, capacidades de agente, visión, audio ni modo de pensamiento explícito para esta versión cuantizada.

## Casos de uso

- Asistentes locales en GPUs de consumo: con 6,27 GiB (IQ1_M) o 8,62 GiB (IQ2_S), el modelo cabe en GPUs de 8-12 GB, permitiendo chat privado sin nube.
- QA de conocimiento con fuentes verificables: el engram permite responder preguntas factuales con un índice +43,0 en SimpleQA y solo 7 errores de 200, adecuado para sistemas donde una respuesta errónea cuesta tanto como una correcta.
- Dominios verticales con corpus propio: las tablas por dominio (Software, Ley, Finanzas, Salud) ilustran cómo montar un engram específico; en Software, IQ1_M pasa de −23,5 a +47,1 con el engram activado.
- Razonamiento científico offline: 70,2% en GPQA Diamond con 32K de presupuesto lo hace viable para asistentes de investigación en estaciones de trabajo modestas.
- Despliegue en máquinas muy limitadas: la variante IQ1_M está explícitamente recomendada para "las máquinas más pequeñas", útil para edge y servidores caseros.
- Sistemas anti-alucinación: la combinación de prompt v1 y gate por dominio reduce respuestas confiantes incorrectas, apropiado para atención al cliente o soporte técnico con base de conocimiento.
- Experimentación de cuantización extrema: los manifests por tensor y las métricas KLD publicadas lo convierten en referencia para investigar límites de la cuantización a 1-2 bits.

## Benchmarks y rendimiento

Índice de conocimiento = 100 × (correctas − incorrectas) / n. Los valores absolutos son autoevaluados a bajo esfuerzo de razonamiento y no comparables con números publicados de AA; los deltas pareados son el resultado relevante.

| Benchmark | Build | Closed-book | + engram | Δ | Correctas / incorrectas |
|---|---|---:|---:|---:|---:|
| SimpleQA-verified (dev 200) | IQ1_M | −14,0 | +43,0 | +57,0 | 93 / 7 |
| SimpleQA-verified (dev 200) | IQ2_S | −25,5 | +38,5 | +64,0 | 99 / 22 |
| AA-Omniscience (test 400) | IQ1_M | −7,2 | −3,5 | +3,7 | 72 / 86 |
| AA-Omniscience (test 400) | IQ2_S | −19,8 | −1,0 | +18,8 (p = 5·10⁻⁷) | 115 / 119 |
| AA-Omniscience dev 200, gated v1 | IQ1_M | −14,5 | ≈ +13,5 (mejor por dominio ≈ +15) | +28 | no disponible |
| GPQA Diamond (198) | IQ2_S | — | — | 70,2% (73,9% en las 198−10 que terminaron) | — |

Gate por dominio (IQ1_M, AA dev 200): Software −23,5 → +47,1; Ley 0,0 → +21,2 (v1); STEM −15,2 → +15,2 (solo con v1); Finanzas −12,1 → +6,1; Salud −36,4 → −3,0; Humanidades plano.

## Requisitos de hardware

- IQ1_M (1-bit): 6,27 GiB de ficha GGUF; cabe en GPUs de consumo de 8 GB (RTX 3060 Ti/4060 Ti de 8 GB, RTX 3070) dejando margen para el contexto y el engram.
- IQ2_S (2-bit): 8,62 GiB; cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) cómodamente, y probablemente en algunas de 10-11 GB.
- Con descarga parcial en CPU (offload de capas a RAM), también funciona en equipos sin GPU dedicada mediante llama.cpp, a costa de latencia.
- Despliegue: llama.cpp es la librería objetivo (formato GGUF); no hay menciones a vLLM, TGI ni Ollama en la model card, aunque GGUF es compatible con runtimes derivados de llama.cpp.
- Latencia y throughput: no disponible. Las métricas KLD se midieron en CPU (IQ1_M) y GPU (IQ2_S), lo que confirma que ambos builds funcionan en ambos entornos.
- VRAM para el engram: no disponible (depende del tamaño de las tablas de recuperación cargadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño cuantizado | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Lite-Beam 27B (IQ1_M) | 26,9B | 6,27 GiB (1,97 bpw) | no disponible (32K en benchmarks) | Apache-2.0 | Engram gated; mejor calibración |
| Lite-Beam 27B (IQ2_S) | 26,9B | 8,62 GiB (2,71 bpw) | no disponible (32K en benchmarks) | Apache-2.0 | Mejor razonamiento sin retrieval |
| Qwen/Qwen3.8-27B (base, BF16) | 26,9B | ≈54 GB (BF16) | no disponible en la información proporcionada | no disponible | Referencia de fidelidad (KLD = 0) |
| Lite-Beam 1.0 (501B-A23B) | 501B (23B activos) | no disponible | no disponible | no disponible | Variante MoE mucho mayor del mismo método |

No hay datos comparativos directos frente a otros quants de terceros (por ejemplo Unsloth o bartowski sobre el mismo base) en la información proporcionada, más allá de reutilizar sus layouts por tensor.

## Limitaciones y advertencias

- Pérdida de conocimiento en closed-book: la cuantización degrada el conocimiento propio del modelo (índices negativos sin engram); el sistema depende del engram para rendir en QA factual.
- KLD alto en IQ1_M (0,418 en chat): solo 85,8% de coincidencia top-1 con BF16; se espera degradación en tareas no cubiertas por los benchmarks publicados.
- Cobertura limitada del engram en STEM y Humanidades: la respuesta correcta solo aparece en el top-3 de pasajes para pocas preguntas; Tablinum está construyendo mejores fuentes.
- Salud empeora ligeramente con el engram en IQ1_M (−3,0 con v1): no usar este build para consultas médicas sin validación adicional.
- Métricas autoevaluadas a bajo esfuerzo de razonamiento: los valores absolutos no son comparables con benchmarks publicados de terceros.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado.
- Sin datos sobre tool calling, agentes, visión ni longitudes de contexto máximas: verificar en el modelo base antes de diseñar pipelines que dependan de esas funciones.
- Diez respuestas de GPQA alcanzaron el presupuesto de 32K tokens y contaron como incorrectas: vigilar el coste de tokens en tareas de razonamiento largo.
- Licencia Apache-2.0: sin restricciones comerciales relevantes, pero hereda las limitaciones del modelo base Qwen3.8-27B que correspondan.

## Enlaces

- Modelo: https://huggingface.co/tablinum/Lite-Beam-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Engram Tablinum-2 (dataset): https://huggingface.co/datasets/tablinum/tablinum-2
- Lite-Beam 1.0 (501B-A23B): https://huggingface.co/tablinum/Lite-Beam-1.0-501B-A23B-IQS_XXS

No se han encontrado en la información proporcionada enlaces a paper, blog técnico, repositorio de código ni demo adicional.

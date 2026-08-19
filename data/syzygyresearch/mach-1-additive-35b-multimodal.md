# SyzygyResearch/Mach-1-Additive-35B-Multimodal

## Resumen

Mach-1-Additive-35B-Multimodal es un modelo de lenguaje multimodal desarrollado por SyzygyResearch, basado en una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen3.5. Se presenta como una versión cuantizada de un modelo teacher Qwen3.6-35B-A3B, con la adición del vision tower en bf16 para capacidades de visión. El modelo destaca por su alta retención de capacidades respecto al teacher: una media del 95,1% en 12 benchmarks, superando a otras cuantizaciones como Ternary Bonsai 27B (93,6%) y Gemma 4 Q2_K_XL (85,6%). El tamaño del repositorio es de 22,5 GB, lo que sugiere una cuantización agresiva, probablemente ternaria o de baja precisión, que lo hace adecuado para despliegue en hardware con recursos limitados. Su relevancia actual radica en ofrecer capacidades multimodales y de razonamiento con un footprint reducido, ideal para entornos de producción donde la eficiencia es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en Qwen3.5 (tag `qwen3_5_moe`) |
| Parametros totales | No disponible (el nombre sugiere 35B, pero no confirmado) |
| Parametros activos | No disponible (el teacher Qwen3.6-35B-A3B tiene 3B activos, pero no se confirma para este modelo) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado (el repo incluye un payload de lenguaje cuantizado y un vision tower bf16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (se menciona `vision.safetensors` y un payload de lenguaje cuantizado) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE), como indica el tag `qwen3_5_moe`. Según la model card, el teacher es Qwen3.6-35B-A3B en BF16, lo que sugiere que el modelo original tiene 35 mil millones de parámetros totales y 3 mil millones activos por token. La versión aquí presentada es una cuantización de ese teacher, utilizando una técnica denominada "aditiva" (Additive), que probablemente combina cuantización ternaria o de baja precisión con un vision tower adicional en bf16. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de RLHF o DPO. La innovación principal reside en la técnica de cuantización que logra una retención media del 95,1% en 12 benchmarks, superando a otras aproximaciones de cuantización extrema.

## Capacidades

- Generación de texto y razonamiento complejo, con puntuaciones destacadas en benchmarks de matemáticas (AIME26: 84,17, MATH-500: 96,80) y razonamiento (MuSR: 65,08).
- Capacidades de código, evidenciadas en MBPP+ (90,21) y HumanEval+ (87,20).
- Soporte de tool calling y function calling, con resultados en BFCL-v3 (72,21) e IFBench (59,18).
- Capacidades de agente y razonamiento multi-step, reflejadas en τ²-bench (75,90).
- Multimodal: incluye un vision tower en bf16, lo que permite procesamiento de imágenes además de texto.
- Capacidad de seguir instrucciones (IFEval: 85,90) y conocimiento general (MMLU-Redux: 88,93).

## Casos de uso

- Asistentes virtuales con visión: el modelo puede procesar imágenes y texto simultáneamente, permitiendo aplicaciones como descripción de imágenes, análisis de documentos escaneados o asistencia en tiempo real con entrada visual.
- Generación de código en producción: con soporte de tool calling y buenos resultados en benchmarks de código, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, reduciendo costes de inferencia gracias a su cuantización.
- Razonamiento matemático y resolución de problemas: adecuado para plataformas educativas o herramientas de cálculo avanzado, donde su rendimiento en AIME y MATH-500 es competitivo.
- Automatización de tareas de agente: su capacidad en τ²-bench sugiere que puede manejar flujos de trabajo multi-paso, como navegación web automatizada o gestión de tareas empresariales.
- Chatbots de atención al cliente con contexto visual: al ser multimodal, puede interpretar capturas de pantalla o fotos enviadas por usuarios, mejorando la resolución de incidencias técnicas.
- Despliegue en edge o entornos con GPU limitada: el tamaño del repo (22,5 GB) y la cuantización permiten ejecutarlo en hardware de consumo, como estaciones de trabajo con una RTX 4090, para prototipado rápido o inferencia local.

## Benchmarks y rendimiento

La model card proporciona datos de retención de capacidades respecto al teacher BF16, así como los scores absolutos del modelo. A continuación se presentan las tablas originales.

**Retención media en 12 benchmarks (comparativa con otras cuantizaciones):**

| Modelo | Retención media |
| --- | ---: |
| **Mach-1 Small** | **95,1%** |
| Ternary Bonsai 27B (PrismML) | 93,6% |
| Gemma 4 Q2_K_XL (Unsloth) | 85,6% |

**Retención por benchmark:**

| Benchmark | Mach-1 Small | Ternary Bonsai 27B | Gemma 4 Q2_K_XL |
| --- | ---: | ---: | ---: |
| AIME26 | **93,5%** | 92,7% | 67,7% |
| MATH-500 | **98,2%** | **98,2%** | 95,6% |
| AIME25 | **92,5%** | 91,7% | 67,2% |
| GSM8K | 99,0% | **100,2%** | 97,3% |
| MBPP+ | 93,9% | **98,4%** | 92,2% |
| HumanEval+ | 91,7% | **98,7%** | 94,1% |
| MMLU-Redux | 96,0% | 94,0% | **96,9%** |
| IFEval | **96,5%** | 89,8% | 95,5% |
| MuSR | **97,6%** | 91,6% | 91,1% |
| BFCL-v3 | 96,3% | **98,9%** | 95,7% |
| τ²-bench | **95,5%** | 91,2% | 73,1% |
| IFBench | **91,1%** | 77,7% | 61,3% |
| **Media** | **95,1%** | **93,6%** | **85,6%** |

**Scores absolutos de Mach-1 Small y su teacher (Qwen3.6-35B-A3B BF16):**

| Benchmark | Score | Teacher (BF16) | Retención |
| --- | ---: | ---: | ---: |
| AIME26 | 84,17 | 90,00 | 93,5% |
| MATH-500 | 96,80 | 98,60 | 98,2% |
| AIME25 | 81,67 | 88,33 | 92,5% |
| GSM8K | 95,22 | 96,21 | 99,0% |
| MBPP+ | 90,21 | 96,03 | 93,9% |
| HumanEval+ | 87,20 | 95,12 | 91,7% |
| MMLU-Redux | 88,93 | 92,68 | 96,0% |
| IFEval | 85,90 | 89,05 | 96,5% |
| MuSR | 65,08 | 66,66 | 97,6% |
| BFCL-v3 | 72,21 | 74,98 | 96,3% |
| τ²-bench | 75,90 | 79,51 | 95,5% |
| IFBench | 59,18 | 64,97 | 91,1% |

No se dispone de datos de velocidad (la imagen correspondiente no es accesible en el texto proporcionado).

## Requisitos de hardware

- Tamaño del repositorio: 22,5 GB, lo que incluye el payload de lenguaje cuantizado y el vision tower bf16.
- VRAM estimada: no disponible oficialmente, pero el tamaño total sugiere que podría caber en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090, A10G) si se carga en memoria completa. Sin embargo, no se confirma el consumo exacto.
- GPU recomendadas: no especificadas por el autor. Dado el tamaño, es plausible que funcione en GPUs de consumo de gama alta (RTX 3090/4090) o en GPUs de datacenter con al menos 24 GB (A10G, L4).
- Opciones de despliegue: no se mencionan, pero al ser safetensors, es compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, siempre que soporten la arquitectura MoE y la cuantización específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card incluye una comparativa directa con otras cuantizaciones extremas:

| Modelo | Retención media | Tamaño (aprox.) | Arquitectura | Licencia |
| --- | ---: | --- | --- | --- |
| **Mach-1 Small** | **95,1%** | 22,5 GB (repo) | MoE (Qwen3.5) | No disponible |
| Ternary Bonsai 27B (PrismML) | 93,6% | No disponible | No disponible | No disponible |
| Gemma 4 Q2_K_XL (Unsloth) | 85,6% | No disponible | No disponible | No disponible |

No se dispone de más detalles sobre estos modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser una cuantización agresiva, puede presentar pérdida de precisión en tareas muy especializadas o de razonamiento largo, aunque la retención media es alta (95,1%).
- La licencia no está especificada, lo que impide determinar si es apto para uso comercial o requiere atribución. Se recomienda contactar con el autor antes de usarlo en producción.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones idiomáticas. El modelo está etiquetado con `region:us`, lo que podría indicar un sesgo hacia el inglés, pero no se confirma.
- El vision tower está en bf16, lo que aumenta el tamaño del repo y puede requerir más VRAM que una versión solo de lenguaje.
- No hay información sobre la longitud de contexto soportada, lo que es crítico para aplicaciones de agentes o procesamiento de documentos largos.

## Enlaces

- Repositorio HuggingFace: [SyzygyResearch/Mach-1-Additive-35B-Multimodal](https://huggingface.co/SyzygyResearch/Mach-1-Additive-35B-Multimodal)
- Repo base (sin vision tower): [SyzygyResearch/Mach-1-Additive-35B](https://huggingface.co/SyzygyResearch/Mach-1-Additive-35B)

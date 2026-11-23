# ssuasd/Caphlon-Model

## Resumen

Caphlon-Model es una familia de builds GGUF ultraligeros derivados de Qwen 3.8 27B, publicada por el usuario ssuasd en Hugging Face. El objetivo declarado es ofrecer las versiones ejecutables mas pequenas del modelo base sin recurrir a destilacion hacia una red estudiante menor: se mantiene la topologia hibrida de 64 capas (Gated-Delta-Net combinada con atencion completa) y se comprime el artefacto mediante cuantizacion ternaria en super-bloques, poda de vocabulario BPE y reduccion calibrada del ancho de las capas FFN.

La familia consta de dos builds. Caphlon-2 es el buque insignia: un fichero de 4,52 GiB en formato PTQ1_SB (1,65 bits por peso) que conserva las 64 capas y 23.298.072.064 parametros activos, pensado para ejecutarse en GPU de 6 GB de VRAM o portatiles con 8 GB de RAM. Caphlon-1 es el build heredado de 6,87 GiB en IQ2_S, compatible con llama.cpp estandar, con poda de 4 capas y vocabulario reducido a 100.000 tokens.

El modelo resulta relevante para desarrolladores que necesitan razonamiento de nivel 27B en hardware de consumo muy limitado, a costa de un formato de cuantizacion no estandar que requiere un fork parcheado de llama.cpp para el build PTQ1_SB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated-Delta-Net + atencion completa (64 capas en Caphlon-2, 60 en Caphlon-1) |
| Parametros totales | 23.298.072.064 (23,30B) en Caphlon-2; aproximadamente 24,8B en Caphlon-1 |
| Parametros activos | No aplica (no es MoE); 23,30B activos en Caphlon-2 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PTQ1_SB (GGML tipo 144, 1,65 bpw, ternaria en super-bloques de 1.024) e IQ2_S (2,31 bpw) |
| Idiomas soportados | Ingles y turco (segun model card); el tag de Hugging Face solo lista ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (851 tensores en Caphlon-2) |

## Arquitectura y entrenamiento

Caphlon-2 parte de Qwen 3.8 27B y del intermedio Ternary-Bonsai-2-27B (PTQ1_0, 5,54 GiB) de PrismML y UkisAI. Sobre esa base se aplican cuatro transformaciones: cirugia del vocabulario BPE con poda de la tabla de merges de 111.104 a 84.352 tokens (83.982 merges), remapeando los tokens de control y de pensamiento; poda adaptativa del ancho FFN calibrada por regresion ridge de influencia de bloque, reduciendo la dimension intermedia de 17.408 a 15.456 alineada a fronteras de super-bloque de 256 elementos; cuantizacion ternaria PTQ1_SB con super-bloque Hadamard H1024 de 1.024 elementos (205 B de trits empaquetados en base 3, 2 B de super-escala FP16 y 4 B de sub-escalas de 4 bits empaquetadas 8x128); y una intervencion en tiempo de inferencia (ITI) mediante un vector de calibracion de 1,2 MiB.

Caphlon-1 parte de Unsloth Dynamic IQ2_S sobre Qwen 3.8 27B, con reduccion de vocabulario a 100.000 tokens y poda de 4 capas del intervalo hibrido (60 capas resultantes). No se dispone de informacion sobre el volumen de tokens de entrenamiento ni sobre si hubo RLHF o DPO; el proceso descrito es exclusivamente de post-entrenamiento por cuantizacion y poda, sin reentrenamiento de pesos.

## Capacidades

- Generacion de texto conversacional y razonamiento de multiples pasos, con modo de pensamiento (tokens `<think>` y `</think>` remapeados en el vocabulario).
- Razonamiento cientifico y de nivel avanzado, medido en GPQA-Diamond.
- Generacion de codigo, con resultados reportados en HumanEval pass@1 para Caphlon-1.
- Abstención calibrada ante preguntas sin respuesta (recall de abstención del 100% en el benchmark Halu-270 con el vector ITI).
- Capacidades multilingues limitadas a ingles y turco segun la model card.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue en llama.cpp y Ollama.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento cientifico en portatiles: el build Caphlon-2 con 4,52 GiB permite ejecutar un modelo de 23,30B parametros en un Mac con Apple Silicon de 8 GB de RAM unificada, adecuado para consultas de fisica, quimica o biologia con moderacion de alucinacion gracias al vector ITI.
- Asistente local con abstención: en dominios donde una respuesta incorrecta es costosa (soporte tecnico interno, consultas normativas), el recall de abstención del 100% en preguntas sin respuesta permite desviar a un humano en lugar de inventar.
- Generacion de codigo en entornos con GPU de 6 GB: Caphlon-2 cabe en una GTX 1660 o RTX 3050 de 6 GB, permitiendo autocompletado y generacion de funciones en un IDE local sin enviar codigo a la nube.
- Despliegue en dispositivos edge con llama.cpp: el build Caphlon-1 en IQ2_S funciona con llama.cpp estandar sin parches, lo que simplifica la integracion en contenedores y pipelines existentes.
- Prototipado rapido de agentes conversacionales: la ventana de contexto no esta documentada, por lo que el uso recomendado es en conversaciones de turnos cortos y tareas de un solo paso.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden usar ambos builds para medir la degradacion de GPQA, HumanEval y perplejidad frente al BF16 base, con cifras de retencion publicadas (89,7% en GPQA, 92,9% en MMLU para Caphlon-1).

## Benchmarks y rendimiento

| Modelo / build | Formato | Tamano | GPQA-Diamond (60) | Mini-40 Truth & Abstain | Halu-270 | Perplejidad held-out (4x512 EN/TR) |
|---|---|---|---|---|---|---|
| Caphlon-2 | PTQ1_SB 1,65 bpw | 4,52 GiB | 48/60 (80,0%) | 32/40 (80,0%); abstención 100%; falso rechazo 2,86% | 232/270 (85,93%); Brier 0,1147 | 7,8551 / 6,8792 |
| Caphlon-2 + ITI | PTQ1_SB 1,65 bpw | 4,52 GiB | 48/60 (80,0%) | 34/40 (85,0%); abstención 100% | 236/270 (87,41%); Brier no disponible en el extracto | No disponible |
| Caphlon-1 | IQ2_S 2,31 bpw | 6,87 GiB | No disponible | No disponible | No disponible | No disponible |

Datos adicionales reportados: retencion del 89,7% en GPQA frente a BF16 (89,2% de referencia), 96,7% (29/30) en HumanEval pass@1 y 92,9% de retencion en MMLU para Caphlon-1. Las mediciones se realizaron en NVIDIA A100-SXM4-80GB, dos Tesla T4 de 16 GB y Apple M2 con Metal.

## Requisitos de hardware

- VRAM para Caphlon-2: aproximadamente 4,52 GiB de pesos mas overhead de contexto y cache KV; el autor indica que funciona en GPU de 6 GB de VRAM.
- RAM para Caphlon-2: 8 GB en portatiles Apple Silicon M1/M2/M3/M4 o equipos x86 con AVX2.
- VRAM para Caphlon-1: aproximadamente 6,87 GiB de pesos; requiere GPU de 8 GB o mas para contexto adicional.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB (RTX 3050, GTX 1660, RTX 4060); para throughput alto, A100-SXM4-80GB o Tesla T4.
- Cabe en GPU consumer: si, en modelos de 6 GB o mas para Caphlon-2.
- Despliegue: Caphlon-2 requiere el fork PrismML-Eng/llama.cpp (commit 6447906) con el parche `prismll_ptq1_sb_cuda_metal.patch`; Caphlon-1 funciona con llama.cpp estandar y Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Caphlon-2 | 23,30B | No disponible | PTQ1_SB, 4,52 GiB | Apache 2.0 | Requiere fork de llama.cpp |
| Caphlon-1 | ~24,8B | No disponible | IQ2_S, 6,87 GiB | Apache 2.0 | llama.cpp estandar |
| Ternary-Bonsai-2-27B (PrismML) | 27B (nominal) | No disponible | PTQ1_0, 5,54 GiB | No disponible | Intermedio upstream de Caphlon-2 |
| Qwen 3.8 27B (BF16) | 27B (nominal) | No disponible | BF16 | No disponible | Referencia de calidad; GPQA 89,2% |

## Limitaciones y advertencias

- La cuantizacion ternaria a 1,65 bpw introduce degradacion medible: retencion del 89,7% en GPQA y del 92,9% en MMLU, con perplejidad held-out de 7,86 en ingles.
- El build Caphlon-2 no funciona con llama.cpp estandar: exige un fork parcheado y el tipo GGML 144, lo que limita su integracion en toolchains existentes.
- La poda de vocabulario y de capas altera el tokenizador respecto al modelo base; prompts y plantillas calibradas para Qwen 3.8 pueden comportarse de forma distinta.
- Soporte idiomatico limitado a ingles y turco segun la model card; el rendimiento en castellano no esta documentado.
- La longitud de contexto no se especifica, por lo que no debe asumirse la ventana nativa de Qwen 3.8 27B.
- Riesgo de alucinacion residual: la tasa reportada es del 10,37-11,85% en Halu-270 incluso con ITI, y el falso rechazo se situa en el 2,48-2,86%.
- No hay informacion publica sobre sesgos demograficos o culturales especificos de estos builds.
- La licencia Apache 2.0 permite uso comercial, pero el cumplimiento debe verificarse tambien respecto a los modelos base e intermedios de la cadena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssuasd/Caphlon-Model
- Demostracion interactiva: https://caphlon.dev
- Modelo base Qwen 3.8 27B: https://huggingface.co/Qwen
- Intermedio Ternary-Bonsai-2-27B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Intermedio Swift-Bonsai-2-GGUF: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Fork de llama.cpp requerido: https://github.com/PrismML-Eng/llama.cpp/tree/6447906bf96c1a023980d3453fb59daa6af3bb23
- Metadatos PTQ1_SB: metadata/Caphlon-2-27B-PTQ1_SB.meta.json (en el repositorio)
- Vector ITI: metadata/iti_mean.gguf (en el repositorio)
- Parche CUDA/Metal: patches/prismll_ptq1_sb_cuda_metal.patch (en el repositorio)

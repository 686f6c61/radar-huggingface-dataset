# ssuasd/Caphlon-2

## Resumen

Caphlon-2 es una cuantización extrema del modelo Qwen 3.8 27B publicada por el usuario ssuasd en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un build derivado de la cadena Qwen 3.8 27B → Ternary-Bonsai-2-27B (PrismML) / Swift-Bonsai-2 (UkisAI) → PTQ1_SB, que comprime los 23.298.072.064 parámetros activos (23,30B) en un único fichero GGUF de 4,5227 GiB (4.856.213.824 bytes) con un ratio de 1,65 bits por peso. El objetivo declarado es ofrecer el build ejecutable más ligero de la familia Qwen 3.8 27B sin destilar una red estudiante más pequeña, preservando las 64 capas híbridas de la arquitectura original.

La relevancia del modelo radica en su perfil de despliegue: el autor afirma que puede ejecutarse en una GPU con 6 GB de VRAM o en un portátil con 8 GB de RAM (Apple Silicon M1/M2/M3/M4, Linux CUDA, Windows/Linux AVX2). Para lograrlo combina tres técnicas: cirugía del vocabulario BPE (de 111.104 a 84.352 tokens), poda adaptativa del ancho de las FFN (de 17.408 a 15.456) y un formato ternario de super-bloque propio denominado PTQ1_SB (tipo GGML 144). El repositorio incluye además un vector de calibración ITI (inference-time intervention) que el autor reporta que mejora la tasa de abstención ante preguntas sin respuesta.

El modelo está etiquetado para inglés y turco, con licencia Apache 2.0, y requiere un fork específico de llama.cpp (PrismML-Eng/llama.cpp, commit 6447906) con un parche para CUDA y Metal, ya que el formato PTQ1_SB no está soportado por el llama.cpp estándar. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y fue creado el 21 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-Delta-Net + Full-Attention (64 capas), heredado de Qwen 3.8 27B |
| Parametros totales | 23.298.072.064 (23,30B activos) |
| Parametros activos | No es MoE; 23,30B activos en todas las capas |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PTQ1_SB (GGML tipo 144, 1,648 bpw, super-bloque ternario); el linaje incluye IQ2_S (2,31 bpw) y PTQ1_0 |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero Caphlon-2-27B-PTQ1_SB.gguf, 851 tensores) |

## Arquitectura y entrenamiento

Caphlon-2 no entrena pesos nuevos: es una transformación post-entrenamiento sobre Qwen 3.8 27B, un transformer híbrido que alterna capas Gated-Delta-Net (atención lineal con estado recurrente) y capas de atención completa. El pipeline parte de Ternary-Bonsai-2-27B de PrismML (formato PTQ1_0, 5,54 GiB) y Swift-Bonsai-2 de UkisAI, y aplica tres transformaciones encadenadas. Primero, una poda de la tabla de merges BPE que reduce el vocabulario de 111.104 a 84.352 tokens (83.982 merges) preservando la clausura y remapeando los tokens de control y de razonamiento (`<think>` = 84267, `</think>` = 84268), con un perfil de logit-bias anti-vacilación de 24 tokens. Segundo, una reducción de la dimensión intermedia de las MLP de 17.408 a 15.456, calibrada mediante regresión ridge de influencia por bloque y alineada a fronteras de super-bloque de 256 elementos. Tercero, la cuantización ternaria PTQ1_SB, que sustituye las escalas FP16 por cada 128 pesos por un super-bloque Sylvester-Hadamard H₁₀₂₄ de 1.024 elementos: 205 bytes de trits empaquetados en base 3, 2 bytes de super-escala FP16 y 4 bytes de sub-escalas de 4 bits empaquetadas (8×128), es decir, 211 bytes por cada 1.024 pesos.

El autor no documenta el dataset de entrenamiento original de Qwen 3.8 27B ni si hubo RLHF o DPO en esa fase; toda la información disponible se refiere al proceso de compresión. La innovación diferencial es el formato PTQ1_SB y el vector ITI (`metadata/iti_mean.gguf`, 1,2 MiB), que según la model card eleva la precisión en el benchmark de alucinación Halu-270 de 85,93% (232/270) a 87,41% (236/270) manteniendo un 100% de recall de abstención en preguntas sin respuesta.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen 3.8 27B.
- Razonamiento explícito mediante tokens de pensamiento (`<think>` / `</think>`), remapeados en el vocabulario reducido.
- Razonamiento científico y de nivel experto: el autor reporta 80,0% (48/60) en GPQA-Diamond.
- Abstención calibrada ante preguntas sin respuesta verificable (100% de recall de abstención en Halu-270 con ITI).
- Generación de código: el build hermano Caphlon-1 reporta 96,7% (29/30) en HumanEval pass@1; para Caphlon-2 no se publica resultado de HumanEval.
- Capacidades multilingües limitadas a inglés y turco según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Inferencia local en hardware de gama baja: el fichero de 4,52 GiB permite ejecutar un modelo de 23,30B en una GPU con 6 GB de VRAM o en un portátil con 8 GB de RAM, lo que habilita prototipado y demos sin infraestructura cloud.
- Asistentes conversacionales en el borde (edge): con contexto multi-turno y tokens de razonamiento, el modelo puede gestionar diálogos en inglés o turco en dispositivos Apple Silicon M1/M2/M3/M4 o en equipos Linux con AVX2.
- Filtrado con abstención en dominios de alto riesgo: el vector ITI y la calibración reportada (Brier 0,1014, ECE 0,0767, 100% de abstención en preguntas sin respuesta) lo hacen adecuado para triaje de consultas donde una respuesta inventada es costosa.
- Evaluación de razonamiento científico en entornos con recursos limitados: su rendimiento de 80,0% en GPQA-Diamond permite usar el modelo como baseline de razonamiento experto en estaciones de trabajo sin GPU de datacenter.
- Investigación sobre cuantización ternaria: el formato PTQ1_SB y el pipeline de poda de vocabulario y FFN sirven como caso de estudio reproducible para medir la degradación de un modelo de 27B a 1,65 bpw.
- Despliegue en pipelines de CI/CD para pruebas de regresión de prompts: el tamaño reducido permite levantar el modelo en contenedores con límites de memoria estrictos y validar cambios de plantillas o de logit-bias sin coste de GPU dedicada.
- Aplicaciones en turco: es uno de los pocos builds ultraligeros etiquetados explícitamente para turco, útil para asistentes locales en ese idioma.

## Benchmarks y rendimiento

| Modelo / build | Formato | Tamano | GPQA-Diamond (60 RID) | Mini-40 Truth & Abstain | Halu-270 | PPL held-out (4x512 EN / TR) |
|---|---|---:|---|---|---|---|
| Caphlon-2 (Cand_pure) | PTQ1_SB (1,65 bpw) | 4,52 GiB | 48/60 (80,0%); 89,7% retención vs BF16 89,2% | 32/40 (80,0%); abstención 100%; falsos rechazos 2,86% | 232/270 (85,93%); Halu 11,85%; falsos rechazos 2,48%; Brier 0,1147 | 7,8551 / 6,8792 |
| Caphlon-2 + ITI | PTQ1_SB (1,65 bpw) | 4,52 GiB | 48/60 (80,0%); 89,7% retención vs BF16 89,2% | 34/40 (85,0%); abstención 100%; falsos rechazos 2,86% | 236/270 (87,41%); Halu 10,37%; abstención 100%; Brier 0,1014; ECE 0,0767 | 7,8551 / 6,8792 |

Datos adicionales del linaje reportados por el autor: Caphlon-1 (IQ2_S, 6,87 GiB) alcanza 96,7% (29/30) en HumanEval pass@1 y 92,9% de retención en MMLU. Las mediciones se realizaron en NVIDIA A100-SXM4-80GB, dos NVIDIA Tesla T4 de 16 GB y Apple M2 con Metal. No se publican resultados de MMLU, GSM8K ni HumanEval para Caphlon-2 en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para el fichero de 4,52 GiB más overhead de contexto y caché KV; el autor indica que funciona en 6 GB de VRAM.
- RAM estimada: 8 GB en CPU (Apple Silicon o x86 con AVX2).
- GPU recomendadas: NVIDIA A100-SXM4-80GB y Tesla T4 16 GB (usadas en la auditoría); cualquier GPU con 6 GB o más de VRAM compatible con el fork de llama.cpp.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 6 GB de VRAM; también en Apple Silicon M1/M2/M3/M4 mediante Metal.
- Opciones de despliegue: llama.cpp con el fork PrismML-Eng/llama.cpp (commit 6447906) y el parche `patches/prismll_ptq1_sb_cuda_metal.patch` para CUDA y Metal. El llama.cpp estándar no soporta el tipo GGML 144, por lo que no es compatible con Ollama, vLLM o TGI sin portar el formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Caphlon-2 (PTQ1_SB) | 23,30B | No disponible | 4,52 GiB (1,65 bpw) | Apache 2.0 | Requiere fork de llama.cpp; 80,0% GPQA-Diamond |
| Ternary-Bonsai-2-27B (PrismML, PTQ1_0) | 27B clase | No disponible | 5,54 GiB | No disponible | Base directa de Caphlon-2; 1,02 GiB más pesado |
| Caphlon-1 (IQ2_S) | ~24,8B (60 capas) | No disponible | 6,87 GiB (2,31 bpw) | Apache 2.0 | Compatible con llama.cpp estándar; 96,7% HumanEval, 92,9% retención MMLU |
| Qwen 3.8 27B en Q4_K_M | 27B clase | No disponible | 15,33 GiB | No disponible | Referencia de calidad; Caphlon-2 ocupa un 70,5% menos |

## Limitaciones y advertencias

- No es un modelo nuevo: hereda los sesgos y el conocimiento de Qwen 3.8 27B, y la poda de vocabulario y FFN puede degradar dominios poco representados en la calibración.
- El autor reporta un 89,7% de retención en GPQA-Diamond frente a BF16, lo que implica una pérdida medible de precisión respecto al modelo original.
- La perplejidad held-out es de 7,8551 en inglés y 6,8792 en turco; no se ofrecen valores de referencia del modelo BF16 en la información disponible, por lo que no puede cuantificarse la degradación en PPL.
- Riesgo de alucinación: el propio autor mide un 10,37% de alucinación en Halu-270 con ITI; sin el vector ITI sube a 11,85%.
- Idiomas limitados a inglés y turco según las etiquetas; el rendimiento en castellano no está documentado.
- Requiere un fork no estándar de llama.cpp y un parche para CUDA/Metal; no funciona con el llama.cpp de serie, Ollama, vLLM ni TGI, lo que complica el despliegue en producción.
- El formato PTQ1_SB (tipo GGML 144) es propietario del linaje PrismML y no está adoptado por el ecosistema GGUF general.
- El repositorio tiene 0 descargas y 1 like, y el autor es un usuario individual (ssuasd), no una organización con trayectoria verificable; la auditoría de benchmarks es autodeclarada.
- La licencia Apache 2.0 permite uso comercial, pero la cadena de modelos base (Qwen 3.8 27B, Ternary-Bonsai-2, Swift-Bonsai-2) puede imponer condiciones adicionales que no se detallan en la información disponible.
- El vector ITI debe cargarse por separado (`metadata/iti_mean.gguf`); sin él, las métricas de calibración empeoran.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssuasd/Caphlon-2
- Modelo base Qwen 3.8 27B: https://huggingface.co/Qwen
- Ternary-Bonsai-2-27B-gguf (PrismML): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Swift-Bonsai-2-GGUF (UkisAI): https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Fork de llama.cpp requerido: https://github.com/PrismML-Eng/llama.cpp/tree/6447906bf96c1a023980d3453fb59daa6af3bb23
- Demo interactiva: https://caphlon.dev
- Metadatos del formato: `metadata/Caphlon-2-27B-PTQ1_SB.meta.json` (en el repositorio)
- Vector ITI: `metadata/iti_mean.gguf` (en el repositorio)
- Parche CUDA/Metal: `patches/prismll_ptq1_sb_cuda_metal.patch` (en el repositorio)

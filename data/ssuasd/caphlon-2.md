# ssuasd/Caphlon-2

## Resumen

Caphlon-2 es una compilación cuantizada en formato GGUF del modelo Qwen 3.8 27B, desarrollada por el autor independiente ssuasd. Su objetivo es ofrecer la variante más ligera y ejecutable del modelo base sin recurrir a destilación hacia una red estudiante de menor tamaño: mantiene intacta la topología híbrida de 64 capas (Gated-Delta-Net más Full-Attention) del Qwen 3.8 27B original y la comprime hasta 4,52 GiB mediante una combinación de cirugía de vocabulario BPE, poda adaptativa del ancho de las capas FFN y un formato ternario de super-bloque denominado PTQ1_SB.

El resultado es un modelo de 23.298.072.064 parámetros activos (23,30B) que puede ejecutarse en una GPU con 6 GB de VRAM o en un portátil con 8 GB de RAM, incluyendo Apple Silicon y equipos con instrucciones AVX2. Frente a la cuantización estándar Q4_K_M (15,33 GiB), el archivo es un 70,5% más pequeño, y frente a su predecesor Caphlon-1 (6,87 GiB, IQ2_S), un 34,2% menor.

La relevancia actual del modelo reside en su enfoque de compresión extrema con preservación de capacidades: según la model card, retiene el 89,7% del rendimiento BF16 en GPQA-Diamond (80,0%, 48/60) y alcanza un 87,41% (236/270) en el benchmark de alucinación Halu-270 con un vector de intervención en inferencia (ITI) incluido. Requiere, no obstante, un fork parcheado de llama.cpp para el formato PTQ1_SB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: Gated-Delta-Net + Full-Attention (64 capas) |
| Parametros totales | 23.298.072.064 (23,30B) |
| Parametros activos | No es MoE; 23,30B activos en todas las capas |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | PTQ1_SB (tipo GGML 144, 1,65 bpw, ternario de super-bloque); predecesor Caphlon-1 en IQ2_S (2,31 bpw) |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (851 tensores); compatible con llama.cpp y Ollama |
| Tamano del archivo | 4,5227 GiB (4.856.213.824 bytes) |
| Modelo base | Qwen/Qwen3.8-27B; prism-ml/Ternary-Bonsai-2-27B-gguf; ukisai/Swift-Bonsai-2-GGUF |
| Vocabulario | 84.352 tokens (reducido desde 111.104) |
| Dimension FFN | 15.456 (reducida desde 17.408) |
| Runtime | Fork PrismML-Eng/llama.cpp (commit 6447906) con parche CUDA/Metal |

## Arquitectura y entrenamiento

Caphlon-2 no entrena un modelo nuevo, sino que aplica un pipeline de compresión post-entrenamiento sobre Qwen 3.8 27B, que conserva su arquitectura híbrida de 64 capas combinando Gated-Delta-Net (atención lineal con estado recurrente) y capas de atención completa. El proceso consta de cuatro etapas documentadas: primero, una cirugía del vocabulario BPE que reduce la tabla de merges de 111.104 a 84.352 tokens preservando la clausura del vocabulario y remapeando los tokens de control y de razonamiento (`` = 84268), junto con un perfil de logit-bias anti-vacilación de 24 tokens. Segundo, una poda adaptativa del ancho intermedio de las capas MLP (LayerTrim) calibrada mediante regresión ridge de influencia por bloque, que reduce la dimensión de 17.408 a 15.456, alineada a fronteras de super-bloque de 256 elementos.

Tercero, la cuantización al formato PTQ1_SB, que sustituye las escalas FP16 por cada 128 pesos por un super-bloque Hadamard de 1.024 elementos (205 bytes de trits empaquetados en base 3, 2 bytes de super-escala FP16 y 4 bytes de sub-escalas de 4 bits empaquetadas, 211 bytes por cada 1.024 pesos). Cuarto, se incluye un vector de calibración ITI (`metadata/iti_mean.gguf`, 1,2 MiB) que actúa como intervención en tiempo de inferencia para reducir alucinaciones. No se documentan datos de entrenamiento adicionales, RLHF ni DPO, ya que se trata de una compilación cuantizada del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de tokens de razonamiento (``) heredados de Qwen 3.8.
- Razonamiento de nivel experto: 80,0% en GPQA-Diamond (48/60), lo que indica capacidad para preguntas de posgrado en ciencias.
- Abstención calibrada ante preguntas sin respuesta: 100% de recall de abstención en las preguntas no respondibles de Halu-270 y Mini-40.
- Generación de código: el predecesor Caphlon-1 alcanza 96,7% (29/30) en HumanEval pass@1; para Caphlon-2 no se publica una métrica específica de código.
- Capacidades multilingües limitadas a inglés y turco según la model card.
- Perfil de logit-bias anti-vacilación que reduce respuestas evasivas o dubitativas.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente multi-paso en la información disponible.

## Casos de uso

- Despliegue en hardware de gama baja: ejecutar un modelo de 23,30B en una GPU de 6 GB de VRAM o en un portátil con 8 GB de RAM permite prototipar aplicaciones de razonamiento en equipos sin aceleradores de gama alta, algo inviable con el Q4_K_M de 15,33 GiB.
- Asistentes de razonamiento científico con abstención: gracias al 80,0% en GPQA-Diamond y al 100% de recall de abstención, es adecuado para sistemas de preguntas y respuestas técnicas donde sea preferible no responder a inventar.
- Filtrado de alucinaciones en producción: el vector ITI incluido eleva Halu-270 del 85,93% al 87,41% y reduce la tasa de alucinación al 10,37%, útil en pipelines de verificación de hechos o resumen documental con control de falsos positivos.
- Aplicaciones locales en Apple Silicon: el soporte Metal del fork parcheado permite ejecutar el modelo en portátiles M1/M2/M3/M4 con 8 GB de RAM unificada, habilitando asistentes offline sin conexión.
- Procesamiento de texto en inglés y turco: para productos dirigidos al mercado turco, el modelo cubre ambos idiomas con perplexity medida en held-out (7,8551 EN / 6,8792 TR).
- Investigación en cuantización extrema: sirve como referencia reproducible (SHA-256 y benchmarks auditados) para estudiar el impacto del formato ternario de super-bloque y la poda de vocabulario en la retención de capacidades.
- Evaluación comparativa de técnicas de compresión: al publicar métricas frente a BF16, Q4_K_M, Ternary-Bonsai-2 e IQ2_S, permite medir el coste real de cada técnica en tareas de razonamiento y calibración.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en NVIDIA A100-SXM4-80GB, doble Tesla T4 16GB y Apple M2 Metal:

| Modelo / build | Formato | Tamano | GPQA-Diamond (60) | Mini-40 Truth & Abstain | Halu-270 | PPL held-out (EN / TR) |
|---|---|---:|---|---|---|---|
| Caphlon-2 (`Cand_pure`) | PTQ1_SB (1,65 bpw) | 4,52 GiB | 48/60 (80,0%) | 32/40 (80,0%); abstención 100%; falso rechazo 2,86% | 232/270 (85,93%); alucinación 11,85% | 7,8551 / 6,8792 |
| Caphlon-2 + ITI | PTQ1_SB (1,65 bpw) | 4,52 GiB | 48/60 (80,0%) | 34/40 (85,0%); abstención 100%; falso rechazo 2,86% | 236/270 (87,41%); alucinación 10,37% | No disponible |
| Qwen 3.8 27B BF16 (referencia) | BF16 | No disponible | 89,2% | No disponible | No disponible | No disponible |
| Caphlon-1 | IQ2_S (2,31 bpw) | 6,87 GiB | No disponible | No disponible | No disponible | No disponible |

Retención declarada: 89,7% frente a BF16 en GPQA-Diamond. Caphlon-1 reporta 96,7% (29/30) en HumanEval pass@1 y 92,9% de retención en MMLU, aunque no se detallan los valores absolutos de MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB para el archivo de 4,52 GiB con overhead de contexto y runtime; el autor indica que funciona en GPU de 6 GB de VRAM.
- RAM: 8 GB suficientes para ejecución en CPU (portátiles Apple Silicon M1/M2/M3/M4, Linux y Windows con AVX2).
- GPU recomendadas: NVIDIA A100-SXM4-80GB y Tesla T4 16GB (usadas en la auditoría); cualquier GPU consumer con 6 GB o más de VRAM (por ejemplo, RTX 3060, RTX 4060) debería ser suficiente según el tamaño del archivo.
- Cabe en GPU consumer: sí, con 6 GB de VRAM o más.
- Opciones de despliegue: fork PrismML-Eng/llama.cpp (commit 6447906) con el parche `patches/prismll_ptq1_sb_cuda_metal.patch` para CUDA y Metal; el tag `ollama` sugiere compatibilidad con Ollama a través de llama.cpp, aunque el formato PTQ1_SB requiere el fork parcheado, no el llama.cpp estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | GPQA-Diamond | Licencia | Runtime |
|---|---|---|---|---|---|---|
| Caphlon-2 | 23,30B | No disponible | PTQ1_SB, 4,52 GiB | 80,0% | Apache 2.0 | Fork llama.cpp parcheado |
| Caphlon-1 | ~24,8B (60 capas) | No disponible | IQ2_S, 6,87 GiB | No disponible | Apache 2.0 | llama.cpp estándar |
| Ternary-Bonsai-2-27B | 27B (base) | No disponible | PTQ1_0, 5,54 GiB | No disponible | No disponible | Fork PrismML |
| Qwen 3.8 27B (Q4_K_M) | 27B | No disponible | GGUF Q4_K_M, 15,33 GiB | No disponible | Apache 2.0 (base) | llama.cpp estándar |

Caphlon-2 es la variante más pequeña de la familia y la única con benchmarks de razonamiento y alucinación auditados en la información disponible. Frente a Q4_K_M ocupa un 70,5% menos de espacio, a costa de requerir un runtime modificado.

## Limitaciones y advertencias

- La cuantización ternaria de 1,65 bpw implica pérdida de precisión: la retención en GPQA-Diamond es del 89,7% frente a BF16, no del 100%.
- Riesgo de alucinación medido del 10,37% con ITI (11,85% sin él) en Halu-270; no es un modelo libre de alucinaciones.
- Cobertura idiomática limitada a inglés y turco; el rendimiento en castellano no está documentado y probablemente sea degradado por la reducción de vocabulario a 84.352 tokens.
- Requiere un fork parcheado de llama.cpp (PrismML-Eng, commit 6447906) para el formato PTQ1_SB; no funciona con llama.cpp estándar ni con la mayoría de herramientas que solo soportan tipos GGML convencionales.
- La poda de vocabulario y de capas FFN puede afectar a tareas específicas no cubiertas por los benchmarks publicados (código, matemáticas, tool calling), para las que no hay métricas de Caphlon-2.
- No se documenta longitud de contexto soportada; la ventana efectiva tras la compresión no está verificada.
- Proyecto de autor individual con 295 descargas y 3 likes en el momento de la consulta; menor madurez de mantenimiento que el modelo base oficial.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos intermedios (Ternary-Bonsai-2, Swift-Bonsai-2) de los que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssuasd/Caphlon-2
- Demostración interactiva: https://caphlon.dev
- Modelo base: https://huggingface.co/Qwen
- Intermedio Ternary-Bonsai-2-27B: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Intermedio Swift-Bonsai-2: https://huggingface.co/ukisai/Swift-Bonsai-2-GGUF
- Fork de llama.cpp: https://github.com/PrismML-Eng/llama.cpp/tree/6447906bf96c1a023980d3453fb59daa6af3bb23
- Metadatos del modelo: https://huggingface.co/ssuasd/Caphlon-2/blob/main/metadata/Caphlon-2-27B-PTQ1_SB.meta.json
- Vector ITI: https://huggingface.co/ssuasd/Caphlon-2/blob/main/metadata/iti_mean.gguf
- Parche CUDA/Metal: https://huggingface.co/ssuasd/Caphlon-2/blob/main/patches/prismll_ptq1_sb_cuda_metal.patch

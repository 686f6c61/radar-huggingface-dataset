# verysweatydog/qwen3.8-27b-moe

## Resumen

Qwen3.8-27B sparse student (F2) es una destilación dispersa por token del modelo Qwen3.8-27B, publicada por el usuario verysweatydog. No se trata de un modelo entrenado desde cero, sino de un "student" que conserva las 64 capas del profesor pero, en cada token, lee únicamente una parte de los pesos: proyecciones de atención de bajo rango, un generador de candidatos de 1 bit para la FFN y una LM head con lista corta. El resultado es un modelo de 43.800 millones de parámetros totales que se ejecuta con un GGUF Q4_K_M de 20,9 GB y un parche específico de llama.cpp.

El interés técnico reside en la estrategia de dispersión: la decodificación usa rutas dispersas (lotes de hasta 8 tokens) mientras que el prefill usa rutas densas, de modo que el ahorro se aplica a la generación. El modelo conserva las 16 capas de atención completa y sustituye las otras 48 por capas Gated DeltaNet con estado de tamaño fijo, lo que reduce el coste de la caché KV. Está pensado para ejecutarse en máquinas de 32 GB, incluidas iGPU mediante Vulkan, y se distribuye con licencia Apache 2.0.

La relevancia actual es doble: por un lado, demuestra una vía poco habitual de compresión (destilación con selección dinámica de neuronas en la FFN y lista corta en la head); por otro, su naturaleza "uncensored" y la ausencia de ajuste de seguridad lo convierten en un objeto de estudio más que en un modelo listo para producción sin salvaguardas. El modelo base declarado es Qwen/Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas Gated DeltaNet (GDN), con FFN SwiGLU dispersa por token |
| Parametros totales | 43.803.532.800 (43,8 B) |
| Parametros activos | No disponible (dispersión por token, no MoE clásico; la FFN activa 3584 de 17408 neuronas por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (3,82 BPW); export en safetensors con factores del student; sketch FFN en ggml Q1_0 (grupo 128) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (F2-export) y GGUF (Q4_K_M listo para ejecutar) |

## Arquitectura y entrenamiento

El modelo es un student disperso del profesor Qwen3.8-27B (variante HauhauCS Uncensored-Aggressive, Q6_K_P GGUF). Mantiene las 64 capas, pero reduce el coste por token en cuatro bloques. En atención completa (16 capas), las proyecciones q y o son de bajo rango (q con rango 512 incluyendo la puerta, o con rango 1536), mientras que k y v se mantienen exactas. En las 48 capas Gated DeltaNet, q y k son de bajo rango 256, v es exacta y las proyecciones z y out se restringen a las 1024 mejores de 6144 canales, seleccionadas por un predictor z de rango 256. En la FFN (64 capas, 17408 neuronas), un sketch de 1 bit con grupo 128 aproxima las puertas gate/up de todas las neuronas, se calculan exactas sobre 6144 candidatas y se seleccionan las 3584 mejores según (silu(g)·u)²·‖w_down‖² antes de aplicar down; se fusionó un LoRA r16 en gate/up/down. La LM head (vocabulario de 248k) usa una head de rango 256 que selecciona una lista corta de 8192 tokens y calcula logits exactos solo sobre ella.

El entrenamiento consistió en destilación contra los logits del profesor con aproximadamente 12 millones de tokens: 65% texto general de distribución del profesor estilo SFT, respuestas verificadas no-thinking de INTELLECT-3-RL y trazas de razonamiento de DeepMath-hard truncadas a 4k tokens, con descontaminación frente al test de GSM8K. Se ejecutaron 1500 pasos, más que la iteración anterior (F1). El sketch de la FFN se movió a grupo 128 para mapear exactamente sobre ggml Q1_0, y el generador de candidatos se reajustó con escalas por capa y sesgo por neurona. La decodificación usa rutas dispersas y el prefill rutas densas con los mismos pesos.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline declarado como conversational en los tags).
- Razonamiento matemático y científico: se reporta un 89,8% en GSM8K (115/128) en modo greedy no-thinking, igualando al profesor.
- Trazas de razonamiento (thinking): el entrenamiento incluyó trazas de DeepMath-hard truncadas a 4k tokens.
- Generación de código: no hay evaluación específica publicada, pero el modelo base Qwen3.8-27B es de propósito general.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking está presente en los datos de entrenamiento.
- Capacidades multilingües: no disponibles (el campo de idiomas no está declarado).
- Capacidad especial: decodificación dispersa por token con knobs de sparsity ajustables en tiempo de ejecución (ffn_candidates, gdn_gate_k, ffn_active, head_shortlist).
- Modo uncensored: sin ajuste de seguridad añadido, heredado del profesor.

## Casos de uso

- Inferencia en hardware de gama consumer: el GGUF Q4_K_M de 20,9 GB más la caché KV cabe en una máquina de 32 GB; solo 16 de las 64 capas mantienen caché KV, lo que abarata el contexto largo en comparación con un transformer denso equivalente.
- Despliegue en iGPU mediante Vulkan: el autor incluye el parche de llama.cpp con el operador GGML_OP_GATHER_AXPY para CPU y Vulkan, pensado para ejecutar el modelo en iGPU sin GPU dedicada (aunque el autor advierte que no lo ha probado en hardware iGPU real).
- Investigación en compresión de modelos: el export en safetensors con factores del student y student_config.json permite estudiar y reproducir la destilación dispersa, comparar ablaciones (restaurar proyecciones GDN, atención q/o, head o FFN) y medir KL frente al profesor.
- Experimentación con decodificación especulativa y selección dinámica de expertos: la FFN con sketch de 1 bit y selección top-3584 por puntuación es un banco de pruebas para técnicas de routing por token.
- Razonamiento matemático asistido: con un 89,8% en GSM8K en modo no-thinking, es adecuado para prototipos de resolución de problemas aritméticos y de ciencia básica donde no se requiere un modelo mayor.
- Evaluación de riesgos de modelos sin alineación: al ser uncensored y sin safety tuning, sirve para estudiar comportamientos y sesgos en entornos controlados de investigación, no para exposición directa a usuarios finales.
- Ajuste fino ligero sobre el student: el LoRA r16 ya fusionado y la estructura de factores permiten adaptaciones posteriores con bajo coste de memoria en GPUs de 24 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor. KL se mide frente al profesor BF16 en texto retenido (13k tokens, dominios mixtos); el conjunto de matemáticas tiene 15,5k tokens de INTELLECT-3 math/science más DeepMath.

| Modelo | Dev KL | Dev top-1 | Math KL | Math top-1 |
|---|---:|---:|---:|---:|
| F1b (anterior) | 0,2387 | — | 0,2016 | — |
| F2 (knobs por defecto) | 0,2268 | 85,6% | 0,1648 | 88,4% |
| F2, candidates 8192 | 0,2125 | 86,2% | 0,1569 | 88,8% |
| F2, gate k 2048 | 0,2152 | 86,3% | 0,1582 | 88,8% |
| F2, ambos (+16% bytes/token) | 0,1974 | 86,8% | 0,1461 | 89,1% |

GSM8K (test, primeros 128 problemas, greedy, no-thinking):

| Modelo | 0–63 | 64–127 | Total |
|---|---:|---:|---:|
| Profesor | 56 | 59 | 115/128 (89,8%) |
| F2 | 55 | 60 | 115/128 (89,8%) |
| F1b | — | — | 107/128 (83,6%) |

KL medido con llama.cpp frente al profesor Q6_K_P, con `llama-perplexity --kl-divergence` a `-c 1024` y 6 chunks:

| Modelo | Ruta | General KL | General top-1 | Math KL | Math top-1 |
|---|---|---:|---:|---:|---:|
| Dense Q4_K_P (referencia) | — | 0,015 | 97,3% | 0,003 | 98,8% |
| F2 Q4_K_M | decodificación dispersa (`-ub 8`) | 0,285 | 87,5% | 0,130 | 90,8% |
| F2 Q4_K_M | prefill (`-ub 512`) | 0,244 | — | 0,123 | — |

Ablaciones sobre F1 (dev KL 0,239) para localizar el KL restante: restaurar proyecciones GDN del profesor da 0,199 (q/k exactas solas, 0,222; sin gate-select, 0,221); restaurar atención q/o da 0,251 (peor que el student); restaurar la head da 0,235; solo FFN con mixers y head del profesor da 0,205, y una selección FFN oracle top-3584 da 0,208.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 20,9 GB y, junto con la caché KV, cabe en una máquina de 32 GB según el autor. Solo 16 de las 64 capas mantienen caché KV; las 48 capas DeltaNet usan estado de tamaño fijo.
- GPU recomendadas: no se especifican modelos concretos; el autor apunta a Vulkan en GPU e iGPU y a CPU como alternativa. No hay datos de VRAM para A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? El tamaño de 20,9 GB sugiere que encaja en GPUs de 24 GB (RTX 3090, RTX 4090) y en máquinas de 32 GB de memoria unificada, siempre que se use el parche de llama.cpp; no hay confirmación del autor en hardware real.
- Opciones de despliegue: llama.cpp con el parche `llama.cpp-sparse-qwen35.patch` (commit f477f79), compilado con `-DGGML_VULKAN=ON` para Vulkan o sin esa opción para CPU. Se construyen `llama-cli`, `llama-server`, `llama-bench` y `llama-perplexity`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. El autor indica que el prefill cuesta aproximadamente lo mismo que el modelo denso y que el ahorro por token se aplica a la generación; los knobs de sparsity permiten aumentar calidad a cambio de aproximadamente un 16% más de bytes leídos por token.
- Estado de pruebas en Vulkan: todos los operadores nuevos pasan `test-backend-ops` en lavapipe (gather_axpy en f32/f16/q8_0/q4_K/q5_K/q6_K, mul_mat_id con 17408 expertos y top_k), salvo los operadores de head de tamaño vocabulario, limitados por el tope de 128 MB de búfer de lavapipe. El autor no ha ejecutado el modelo en hardware iGPU real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B sparse student (F2) | 43,8 B totales, FFN con 3584/17408 neuronas activas por token | No disponible | GSM8K 89,8%; KL 0,2268 (dev) frente al profesor | Apache 2.0 | Hugging Face (GGUF Q4_K_M y safetensors) |
| Qwen3.8-27B (profesor, HauhauCS Uncensored-Aggressive Q6_K_P) | No disponible en la información | No disponible | GSM8K 89,8%; referencia de KL | No disponible | Referenciado como base_model |
| F1b (student anterior) | No disponible | No disponible | GSM8K 83,6%; KL 0,2387 (dev) | No disponible | Incluido en el repositorio como referencia |
| Dense Q4_K_P (referencia de cuantización) | No disponible | No disponible | KL 0,015 general / 0,003 math; top-1 97,3% / 98,8% | No disponible | Referencia interna del autor |

No se dispone de datos de otros modelos de la misma categoría (destilaciones dispersas por token) para una comparación externa; la información proporcionada solo permite comparar con el profesor, la iteración anterior y la referencia densa cuantizada.

## Limitaciones y advertencias

- Modelo uncensored sin ajuste de seguridad: hereda del profesor la ausencia de safety tuning, por lo que puede generar contenido dañino o inapropiado sin filtros. No es apto para exposición directa a usuarios finales sin salvaguardas externas.
- Riesgo de alucinación: la destilación contra logits del profesor introduce un KL no nulo (0,2268 en dev con los knobs por defecto); la fidelidad al profesor es buena pero no exacta, y la selección dinámica de neuronas puede degradar respuestas en dominios poco representados en los 12M de tokens de entrenamiento.
- Idiomas no declarados: el campo de idiomas no está disponible, por lo que no se puede garantizar un rendimiento multilingüe más allá del que herede del modelo base.
- Longitud de contexto no disponible: no se documenta la ventana máxima; además, solo 16 capas mantienen caché KV, lo que condiciona el comportamiento en contextos largos.
- Dependencia de un parche específico de llama.cpp: requiere el commit f477f79 y el parche `llama.cpp-sparse-qwen35.patch`; no funciona con llama.cpp estándar ni con otros runtimes (vLLM, TGI, Ollama no están soportados según la información disponible).
- Estado de validación incompleto en hardware real: el autor no ha probado el modelo en iGPU real; los operadores de head de tamaño vocabulario no se han validado en lavapipe por el límite de 128 MB de búfer.
- El prefill no se beneficia de la dispersión: el procesamiento de prompts cuesta aproximadamente como el modelo denso, lo que penaliza cargas con prompts largos y generaciones cortas.
- Licencia Apache 2.0: permite uso comercial, pero la condición uncensored y la falta de evaluación de sesgos hacen recomendable una auditoría previa en producción.
- Sin datos de benchmarks estándar (MMLU, HumanEval, etc.): solo se publican KL, top-1 y GSM8K, por lo que la comparación con otros modelos de la misma talla es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/verysweatydog/qwen3.8-27b-moe
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de llama.cpp requerido: f477f79 (referenciado en la model card)
- Parche: `code-f2/llama.cpp-sparse-qwen35.patch` (incluido en el repositorio de Hugging Face)
- Export del student: `F2-export/` (safetensors y student_config.json, incluido en el repositorio)
- Student anterior F1: `F1-casc1b-6144-A3584/` y `code/` (incluidos en el repositorio)

# tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2` es un checkpoint experimental publicado por el desarrollador tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B al que se le han sustituido quirúrgicamente 18 de sus 24 capas de atención por un módulo de atención lineal recurrente denominado Kernelized Decay Attention (KDA), seguido de un proceso de destilación de conocimiento en dos etapas para recuperar la calidad del modelo original.

El interés del checkpoint es fundamentalmente de investigación: sirve como referencia reproducible de cómo se comporta una arquitectura híbrida (atención cuadrática + atención lineal con decaimiento) tras un trasplante de módulos y una destilación breve. El autor reporta una perplejidad de validación de 235,23 en WikiText-2, partiendo de una línea base post-cirugía de 22.158,08, lo que documenta la magnitud de la degradación inicial y la recuperación parcial tras 382 pasos de optimización.

El modelo conserva el tokenizador y la configuración base de Qwen2.5-0.5B (896 dimensiones ocultas, 14 cabezas de consulta, 2 cabezas KV, head_dim de 64) y tiene 495.138.958 parámetros en formato safetensors. Está pensado para text-generation en inglés y se distribuye con licencia MIT. No es un modelo apto para producción generalista: es un artefacto de ablación arquitectónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con KDA (atención lineal recurrente con decaimiento aprendible) y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23); patrón `hybrid_3_1` |
| Parametros totales | 495.138.958 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; el entrenamiento usó `seq_len=512` |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 en el quick start) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB; `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (GQA) y `head_dim=64`. Sobre esa base se aplica un trasplante de atención con patrón `hybrid_3_1`: 18 capas reciben el módulo `KDAAttention` mediante el `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de un único `o_proj`, mientras que 6 capas conservan la atención cuadrática original como anclas. KDA es una atención lineal recurrente con estado `S_t = γ · S_{t-1} + φ(k_t)ᵀ · v_t`, normalización por `Z_t` y decaimiento por cabeza `γ = sigmoid(β)` aprendible, con `φ(x) = ELU(x) + 1`. El módulo declara soporte causal, bidireccional, cross-attention y GQA, pero no RoPE nativo.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con `seq_len=512` y `grad_accum=4`. La etapa 1 (alineación con backbone congelado, `lm_head` puenteado, MSE y coseno sobre estados ocultos con peso 0,25) duró 116 pasos y 54,1 s. La etapa 2 (destilación de representaciones multicapa con peso 0,50) duró 266 pasos y 125,9 s. En total, 382 pasos y 180,4 s con un pico de VRAM de 17.309 MB en FP16 con parámetros maestros en FP32 y `topk=64`. No se documenta el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, con soporte declarado para atención causal.
- Atención bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del `KDAAttention`).
- Soporte nativo de GQA en el módulo de atención trasplantado.
- Inferencia con estado recurrente en las capas KDA, lo que en teoría reduce el coste por token frente a la atención cuadrática.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.
- No se documenta decodificación especulativa ni otras optimizaciones de inferencia.

## Casos de uso

- Investigación en eficiencia de atención: comparar el comportamiento de KDA frente a atención cuadrática en las mismas capas y con el mismo tokenizador, usando este checkpoint como referencia reproducible de ablación.
- Reproducción de experimentos de trasplante de módulos: el patrón `hybrid_3_1` y el adaptador `QwenAttentionAdapter` permiten replicar la cirugía sobre Qwen2.5-0.5B y medir el impacto en perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento en dos etapas: la telemetría publicada (116 + 266 pasos, 180,4 s, 17.309 MB de VRAM) sirve como línea base para comparar estrategias de alineación (MSE + coseno, `lm_head` puenteado) en modelos pequeños.
- Docencia y formación: ejemplo didáctico de sustitución de atención en un transformer real, con pesos separados (`model.safetensors` y `attention_weights.safetensors`) que permiten inspeccionar el módulo trasplantado de forma aislada.
- Prototipado de generación de texto en inglés con recursos muy limitados: al tener ~495 M de parámetros y pesos en FP16 de menos de 1 GB, cabe en GPUs de consumo para pruebas cualitativas, aunque la calidad es baja (PPL 235,23).
- Benchmarking de herramientas de inferencia: validar si vLLM, llama.cpp, TGI u Ollama soportan el módulo KDA y el patrón híbrido; el resultado esperado es que la mayoría no lo soporten sin adaptación, lo que convierte al checkpoint en un test de compatibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`, no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 235,23 |
| WikiText-2, línea base post-cirugía (Stage 0) | Perplejidad | 22.158,08 |
| WikiText-2, delta tras destilación | Perplejidad | -21.922,85 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para pesos (944,45 MB de `model.safetensors` más 86,24 MB de `attention_weights.safetensors`), más overhead de activaciones y estado recurrente; el entrenamiento documentado usó 17.309 MB de pico con parámetros maestros en FP32.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para pruebas; A100 o H100 no son necesarias para este tamaño, pero el autor usó una GPU con capacidad para ~17 GB en entrenamiento (probablemente una RTX 4090 o similar).
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs con 4-8 GB para inferencia en FP16.
- Opciones de despliegue: el quick start usa `transformers` con `AutoModelForCausalLM` más la función `apply_qwen_attention_surgery` del repositorio NeuralOps; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y es poco probable que funcionen sin adaptación por el módulo KDA personalizado.
- Latencia y throughput: no disponibles. La atención lineal recurrente debería reducir el coste asintótico por token en contexto largo, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2` | 495 M | no disponible (entrenado a 512) | 235,23 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~494 M | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas de atención lineal (p. ej. Mamba, RWKV) | variable | variable | no disponible | variable | Hugging Face / repos propios |

La comparación directa con el Qwen2.5-0.5B original no es posible con los datos proporcionados, ya que no se incluye su perplejidad en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0) y la ausencia de benchmarks estándar (MMLU, HumanEval, GSM8K) limitan la comparabilidad. No se dispone de datos de otros modelos del "Attention Zoo" de NeuralOps en la información proporcionada.

## Limitaciones y advertencias

- Calidad muy degradada: la perplejidad de 235,23 en WikiText-2 es muy superior a la de un modelo de 0,5 B bien entrenado, lo que indica que la destilación solo recuperó parcialmente la capacidad original.
- Entrenado únicamente sobre WikiText-2, un corpus de artículos de Wikipedia en inglés; el dominio y el registro son muy limitados y el modelo probablemente no generaliza fuera de él.
- Solo declara inglés; no hay evidencia de capacidades multilingües.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse.
- Riesgo elevado de alucinación y de generación incoherente por la baja calidad del checkpoint.
- Compatibilidad limitada: requiere el código de NeuralOps (`apply_qwen_attention_surgery`) y un módulo KDA personalizado; las herramientas estándar de inferencia probablemente no lo cargan directamente.
- La licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0; conviene revisar las obligaciones de atribución del modelo base.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false` en el `model-index`).
- No hay información sobre sesgos, datos de entrenamiento más allá de WikiText-2, ni evaluación de seguridad.
- Fecha de creación futura (2026-11-10) en los metadatos de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-kda-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de referencia de WikiText: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible

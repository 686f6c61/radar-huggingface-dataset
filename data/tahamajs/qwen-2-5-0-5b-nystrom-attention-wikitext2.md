# tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que el autor (tahamajs) ha sustituido quirúrgicamente parte de las capas de atención del decoder original por un operador de atención subcuadrática basado en Nyström (`NystromAttention`), dentro del ecosistema NeuralOps "Attention Zoo". El objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto de investigación para estudiar si la atención aproximada de Nyström puede reemplazar la atención cuadrática estándar en un transformer causal sin destruir la calidad del modelo.

El modelo parte de los pesos de `Qwen/Qwen2.5-0.5B` (arquitectura Qwen2, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas) y aplica un patrón híbrido `hybrid_3_1`: 18 de las 24 capas usan `nystrom_attention` y 6 capas ancla conservan la atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`. Tras la cirugía, el modelo se reentrena mediante destilación de conocimiento en dos etapas sobre WikiText-2, recuperando la perplejidad de 434,12 (baseline post-cirugía) hasta 34,02 en validación.

Es relevante ahora porque la atención subcuadrática vuelve a estar en el centro del debate técnico (eficiencia en contextos largos, alternativas a FlashAttention, híbridos lineales/cuadráticos). Este checkpoint es un banco de pruebas reproducible y ligero (86,28 MB de pesos de atención) para validar implementaciones de Nyströmformer en decoders causales modernos con GQA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atención híbrida: 18/24 capas `NystromAttention` + 6/24 capas de atención cuadrática completa (patrón `hybrid_3_1`) |
| Parámetros totales | 0,5B (heredados de Qwen2.5-0.5B; el repo solo distribuye pesos de atención de 86,28 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantización | no disponible (pesos distribuidos en safetensors; el quick start usa FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB); requiere cargar la base `Qwen/Qwen2.5-0.5B` desde transformers |

Detalles adicionales del adaptador: `QwenAttentionAdapter` mapea las proyecciones de `Qwen2Attention` (14 cabezas Q, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansión automática de cabezas KV 7x donde es necesario y contrato "Single-`o_proj` bypass". El módulo `NystromAttention` declara soporte causal, bidireccional, cross-attention y GQA nativo; RoPE se marca como "N/A" en el perfil del módulo (la posición se gestiona fuera del operador).

## Arquitectura y entrenamiento

La arquitectura es un decoder tipo Qwen2 en el que se ha realizado una "cirugía" de atención: se reemplazan los bloques de self-attention por `NystromAttention` (Nyströmformer con Nyström causal por chunks para decoders) en 18 de las 24 capas, manteniendo 6 capas con atención cuadrática completa como anclas. Esta mezcla 3:1 busca preservar la capacidad expresiva de las capas cuadráticas mientras se reduce el coste asintótico en el resto. El operador usa `topk=64` landmarks en la aproximación de Nyström.

El entrenamiento es una destilación de conocimiento en dos etapas desde el modelo base Qwen2.5-0.5B, sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`):

- **Etapa 0 (baseline post-cirugía):** perplejidad causal de 434,12 sin reentrenar.
- **Etapa 1 (alineación con backbone congelado):** 128 pasos (54,5 s), `lm_head` bypassado, MSE + coseno por capa sobre estados ocultos (peso coseno 0,25).
- **Etapa 2 (destilación multi-capa de representaciones):** 293 pasos (125,3 s), MSE + coseno por capa (peso coseno 0,50).
- **Total:** 421 pasos en 180,1 s, `seq_len=512`, `grad_accum=4`, `topk=64`, VRAM pico 14.818 MB (autocast FP16 con parámetros maestros FP32).

El resultado final es una perplejidad de validación de 34,02, una mejora de 400,10 puntos respecto al baseline post-cirugía. No se documenta RLHF, DPO ni instrucción-tuning específico; el modelo hereda el comportamiento de la base Qwen2.5-0.5B en la medida en que la destilación lo preserva.

## Capacidades

- Generación de texto causal autoregresiva (pipeline `text-generation`).
- Razonamiento y generación de lenguaje en inglés, heredados parcialmente de Qwen2.5-0.5B (el alcance real depende de cuánto preserva la destilación sobre WikiText-2).
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador (según el perfil del módulo).
- Soporte nativo de GQA en el operador `NystromAttention`.
- Compatibilidad con el ecosistema NeuralOps (`neuralops.hub.load_surgeried_model`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, thinking mode ni capacidades multimodales.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- **Investigación en atención subcuadrática:** usar el checkpoint como referencia reproducible para comparar Nyströmformer frente a atención cuadrática en un decoder causal moderno con GQA, midiendo perplejidad y calidad de generación sobre WikiText-2.
- **Validación de implementaciones de Nyström:** servir de test de integración para librerías que implementen atención aproximada de Nyström, comprobando que la perplejidad de validación se mantiene en torno a 34,02.
- **Prototipado de "attention surgery":** emplear el flujo `apply_qwen_attention_surgery` + destilación en dos etapas como plantilla para sustituir la atención en otros modelos pequeños (0,5B–1B) y medir la recuperación de perplejidad.
- **Benchmarking de eficiencia en decoders pequeños:** medir latencia y memoria de un decoder de 0,5B con 18/24 capas subcuadráticas frente al Qwen2.5-0.5B original, en secuencias de hasta 512 tokens (longitud de entrenamiento).
- **Experimentos de destilación de representaciones:** reutilizar la telemetría (Etapa 1 y Etapa 2, pesos MSE/coseno, número de pasos) como baseline para estudiar técnicas de KD capa a capa en modelos pequeños.
- **Docencia y divulgación técnica:** ilustrar de forma tangible qué ocurre al reemplazar atención cuadrática por aproximada en un transformer real, con métricas antes/después (434,12 → 34,02 de perplejidad).
- **Base para fine-tuning específico de dominio en inglés:** partir del checkpoint para tareas de modelado de lenguaje en inglés donde el coste de atención sea crítico, siempre que se valide la calidad tras el ajuste.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad causal | 34,02 |
| WikiText-2 (baseline post-cirugía, sin KD) | Perplejidad causal | 434,12 |
| WikiText-2 (delta tras KD) | Δ perplejidad | −400,10 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de capacidad. Tampoco se ofrecen comparaciones directas con el Qwen2.5-0.5B original en la misma métrica.

## Requisitos de hardware

- **VRAM para inferencia:** el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en GPUs consumer de 4–8 GB. El repo solo aporta 86,28 MB de pesos de atención que se cargan sobre la base.
- **VRAM para el entrenamiento documentado:** 14.818 MB de pico (FP16 autocast + maestro FP32), es decir, una GPU de 16 GB (p. ej. RTX 4090, A4000, V100 16GB) es suficiente para reproducir la destilación con `seq_len=512` y `grad_accum=4`.
- **GPUs recomendadas:** cualquier GPU con ≥16 GB para reproducir el entrenamiento; para inferencia basta una GPU consumer moderna (RTX 3060 12GB, RTX 4060, RTX 4090) o incluso CPU.
- **Despliegue:** el quick start oficial usa `transformers` + `safetensors` + el paquete `neuralops` (carga vía `neuralops.hub.load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que el operador de atención es custom (`is_custom_attention: Yes`) y requiere la implementación de NeuralOps.
- **Latencia y throughput:** no disponibles en la información proporcionada; solo se documenta el tiempo de entrenamiento (180,1 s para 421 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2` | 0,5B | no disponible (entrenado a 512) | Híbrida 18/24 Nyström + 6/24 cuadrática | MIT | Hugging Face (344 descargas) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según especificación oficial de Qwen2.5) | Cuadrática completa con GQA | Apache 2.0 | Hugging Face, ampliamente soportado |
| Nyströmformer original (paper) | variable (encoder) | no aplica a decoder | Nyström bidireccional | según implementación | Referencia académica |

La comparación directa con el Qwen2.5-0.5B original en perplejidad sobre WikiText-2 no está disponible en la información proporcionada, por lo que no es posible cuantificar la pérdida de calidad respecto a la base. Frente a alternativas de atención eficiente como Linformer, Performer o Linear Attention, este checkpoint destaca por ser un caso real de sustitución en un decoder con GQA y por publicar la telemetría completa del proceso de recuperación.

## Limitaciones y advertencias

- **Modelo de investigación, no de producción:** el autor lo presenta como artefacto del "Attention Zoo"; no hay evidencia de validación en tareas downstream más allá de WikiText-2.
- **Riesgo de alucinación:** heredado de Qwen2.5-0.5B y potencialmente agravado por la aproximación de Nyström y la destilación limitada (421 pasos, solo WikiText-2).
- **Sesgos:** no documentados; al entrenarse solo sobre WikiText-2 (texto enciclopédico en inglés), los sesgos del corpus original pueden amplificarse.
- **Idioma:** solo inglés declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- **Contexto:** el entrenamiento se realizó con `seq_len=512`; no hay datos sobre el contexto efectivo máximo soportado tras la cirugía, y el operador Nyström puede degradarse fuera de la distribución de longitudes vista.
- **Licencia:** MIT para los pesos de atención, pero el modelo base Qwen2.5-0.5B está bajo Apache 2.0; conviene revisar ambas licencias para uso comercial.
- **Dependencia de `neuralops`:** la carga requiere el paquete NeuralOps y un operador custom; no es directamente compatible con stacks estándar (vLLM, llama.cpp, TGI) sin trabajo adicional.
- **Verificación:** los resultados de perplejidad están marcados como `verified: false`; no han sido reproducidos de forma independiente en la información disponible.
- **Tamaño de repo:** 0,1 GB; solo incluye pesos de atención, no el modelo completo, por lo que es imprescindible descargar la base por separado.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

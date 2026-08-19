# ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l5

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l5` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) que se apila sobre el modelo base `allenai/Olmo-3-7B-Think` de AllenAI. Su propósito es inducir un razonamiento matemático con cadenas de pensamiento (CoT) comprimidas a un nivel extremo (L5), donde la solución se expresa como una única expresión colapsada. El adaptador se entrenó mediante GRPO sobre un modelo SFT previo que ya había sido ajustado con problemas de MATH re-expresados en ese dialecto de compresión.

La relevancia de este trabajo radica en explorar hasta qué punto se puede comprimir el razonamiento intermedio sin perder precisión, un área de investigación activa para reducir costes de inferencia y latencia en modelos de lenguaje. El adaptador es pequeño (0.2 GB) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación. No es un modelo autónomo: requiere cargar primero el modelo base y el adaptador SFT correspondiente antes de aplicar este adaptador GRPO.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (base: `allenai/Olmo-3-7B-Think`) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; repo 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en bf16; el base puede cuantizarse) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (vía PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un transformer denso de 7B parámetros entrenado por AllenAI sobre el dataset Dolma 3. El adaptador LoRA (r=16, alpha=32) se entrena con `trl.GRPOTrainer` sobre el modelo SFT fusionado `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`, que ya había sido ajustado con problemas de MATH re-expresados a nivel L5 (expresión única colapsada). El entrenamiento usa GRPO con dos componentes de recompensa: `correctness` (basada en coincidencia exacta con la respuesta, ponderada por el número de pasos de la solución dorada) y `format` (exige una estructura `thinking... response` seguida de `#### <respuesta>`). Se emplearon 8 generaciones por prompt, batch de 32 con acumulación de 2, y un máximo de 256 tokens de completación. El entrenamiento se realizó en una única NVIDIA A100 80GB.

Una nota técnica importante: el autor verificó que los adaptadores producidos por kernels fusionados tenían matrices `lora_B` nulas (matemáticamente inertes), por lo que usó atención `sdpa` estándar de `transformers` y descartó 13 adaptadores que fallaban esa verificación.

## Capacidades

- Razonamiento matemático con cadena de pensamiento comprimida a nivel L5 (expresión única).
- Generación de texto en inglés, orientada a problemas de palabras matemáticas.
- Soporte de formato estructurado de respuesta (`thinking... response` + `#### <answer>`).
- No soporta tool calling, ni visión, ni audio; es exclusivamente texto.
- No es un modelo autónomo: requiere cargar el base y el adaptador SFT previo.

## Casos de uso

- Evaluación de compresión de CoT: permite medir la pérdida de precisión al forzar razonamientos extremadamente condensados en problemas matemáticos, útil para investigación sobre eficiencia de inferencia.
- Generación de soluciones paso a paso para conjuntos de datos de entrenamiento: puede producir respuestas con formato `\boxed{}` para crear datasets sintéticos de matemáticas.
- Benchmarking de robustez: al evaluar en MATH-500 con greedy decoding, sirve como referencia para comparar dialectos de compresión (L1, L3, L5) en un mismo modelo base.
- Prototipado de agentes matemáticos: integrable en pipelines de razonamiento donde se requiera una salida compacta y verificable (por ejemplo, sistemas de tutoría automatizada).
- Análisis de degradación por dificultad: útil para estudiar cómo afecta la compresión a problemas de mayor complejidad, dado que la precisión cae más rápido en niveles comprimidos.
- Investigación en alineación de recompensas: el diseño de recompensa ponderada por pasos de la solución dorada puede servir como caso de estudio para otros entrenamientos GRPO.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en MATH-500 (n=500, greedy decoding, single-turn, sin ejemplos ni self-consistency):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 63.2% |

No se proporcionan comparaciones con otros modelos ni resultados adicionales en la información disponible.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre un modelo de 7B, se puede ejecutar en GPUs consumer con al menos 16 GB de VRAM si se cuantiza el base (por ejemplo, RTX 3090, RTX 4090). Sin cuantización, el base en bf16 requiere ~14 GB solo para los pesos, más overhead de activaciones.
- Entrenamiento: el autor utilizó 1x NVIDIA A100 80GB; con menos VRAM sería difícil replicar el entrenamiento GRPO completo.
- Despliegue: se puede usar con `transformers` + `peft` (cargando base, adaptador SFT y este adaptador). Para servir en producción, vLLM soporta LoRA si se fusiona el adaptador; también es posible convertir a GGUF para `llama.cpp` u Ollama, aunque el flujo de carga requiere el SFT previo.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores o modelos de razonamiento matemático en la información proporcionada. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | MATH-500 | Licencia |
|---|---|---|---|---|
| `allenai/Olmo-3-7B-Think` (base) | 7B | No disponible | No disponible | Apache 2.0 |
| Este adaptador (sobre el base) | 7B + LoRA | No disponible | 63.2% | Apache 2.0 |
| Otros adaptadores de la misma serie (L1, L3) | 7B + LoRA | No disponible | No disponible | Apache 2.0 |

No hay datos suficientes para una comparativa rigurosa con alternativas como Llama-3.1-8B-Instruct o Qwen2.5-7B-Instruct en MATH-500.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matemáticas en inglés; no generaliza a otros dominios.
- La precisión cae con la dificultad del problema, especialmente en niveles de compresión altos (L5).
- No es un modelo autónomo: requiere cargar primero el adaptador SFT `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5` sobre el base; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- El resultado de 63.2% proviene de una única semilla; diferencias de unos pocos puntos porcentuales están dentro del ruido (intervalo de confianza del 95% de ±4.4 pp para n=500).
- Riesgo de alucinación en problemas complejos o fuera de distribución, común en modelos de razonamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base tiene sus propias condiciones (también Apache 2.0 en este caso).
- No se proporcionan garantías de rendimiento en producción; se recomienda validar en el dominio específico antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido (mencionado en la model card): `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5` (sin URL directa en la información disponible)
- Referencia citada: Frolov, Anatolii, "Chain-of-Thought Compression Dialects" (2026) - preprint sin URL pública en la información proporcionada.

# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l5

## Resumen

El modelo `cot-dialect-olmo3-7b-think-grpo-base-seed7-l5` es un adaptador LoRA publicado por el autor `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` para razonar con un nivel de compresión extremo (nivel L5), donde las cadenas de pensamiento se reducen a una única expresión colapsada, como `18/3*2=12`. Este adaptador forma parte de una familia de "dialectos de compresión de chain-of-thought" y se presenta como una ablación para estudiar el diseño de recompensas en el entrenamiento con GRPO, no como un modelo principal.

El modelo base, Olmo-3-7B-Think, es un modelo de razonamiento de 7 mil millones de parámetros desarrollado por el Allen Institute for AI (AllenAI), entrenado con SFT, DPO y RLVR para producir cadenas de pensamiento explícitas. Sobre este base, el adaptador se entrena con GRPO en el conjunto GSM8K, usando un teacher que reexpresa los problemas a nivel L5, logrando una mediana de 16 caracteres por cadena de razonamiento. El resultado declarado es una precisión del 77,9% en GSM8K test (n=1317, greedy decoding).

Este adaptador es relevante para la investigación en compresión de razonamiento y diseño de recompensas, pero no está pensado para producción directa: requiere cargar primero un adaptador SFT específico del nivel y luego este adaptador GRPO, y solo ha sido evaluado en problemas matemáticos de tipo word problem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA r=16, alpha=32 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador puede usarse sobre el base cuantizado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de 7B parámetros, entrenado por AllenAI sobre el dataset Dolma 3, con variantes Base, Instruct y Think. La variante Think se especializa en razonamiento paso a paso mediante SFT, DPO y RLVR. Sobre este modelo, el adaptador se entrena en dos etapas: primero se fusiona un adaptador SFT para el nivel L5 (que reexpresa los problemas de GSM8K con cadenas de pensamiento comprimidas a 16 caracteres de mediana), y después se aplica GRPO con `trl.GRPOTrainer` sobre el modelo fusionado.

El entrenamiento GRPO usa 8 generaciones por prompt, batch de 32 con acumulación de 2, longitud máxima de completación de 256 tokens, learning rate de 1e-5 y coeficiente KL de 0.01. La recompensa combina `correctness` (basada en el recuento de pasos de la solución dorada, ponderando más los problemas difíciles) y `format` (exigiendo un bloque ` thinking... response` seguido de `#### <answer>`). Se entrenó en una única NVIDIA A100 80GB. El autor advierte que el uso de kernels fusionados produjo adaptadores con matrices `lora_B` nulas, por lo que se usó atención `sdpa` estándar y se verificó que todos los adaptadores publicados tienen `lora_B != 0`.

## Capacidades

- Razonamiento matemático: resuelve problemas aritméticos de tipo word problem con cadenas de pensamiento extremadamente comprimidas (una sola expresión).
- Generación de texto: al estar basado en un modelo de lenguaje causal, puede generar texto, aunque su entrenamiento se centra en razonamiento matemático.
- Sin soporte de tool calling, function calling ni capacidades multimodales.
- Sin soporte de agentes ni multi-step reasoning más allá de la cadena de pensamiento comprimida.
- Multilingüe: solo inglés (el modelo base puede tener otras capacidades, pero el adaptador se evalúa en inglés).
- Modo thinking: el modelo base produce cadenas de pensamiento visibles; el adaptador las comprime a nivel extremo.

## Casos de uso

- Investigación en compresión de razonamiento: permite estudiar cómo afecta la longitud de la cadena de pensamiento a la precisión, comparando niveles L1 a L5 dentro de la misma familia de adaptadores.
- Evaluación de diseño de recompensas: sirve como ablación para reproducir experimentos de GRPO con distintas funciones de recompensa (base-seed7 frente a otros seeds) y validar conclusiones del paper.
- Generación de explicaciones concisas en dominios matemáticos: puede usarse para producir respuestas cortas y directas en problemas aritméticos simples, donde una sola expresión es suficiente.
- Benchmarking de eficiencia: al reducir la longitud de las cadenas de pensamiento, puede servir para medir el impacto en latencia y coste computacional en inferencia.
- Fine-tuning posterior: como adaptador LoRA, puede servir de punto de partida para experimentos de transferencia a otros dominios de razonamiento.
- Validación de pipelines de entrenamiento con PEFT: su estructura (dos adaptadores apilados) permite probar flujos de trabajo con `merge_and_unload` y carga secuencial.

## Benchmarks y rendimiento

Se han publicado resultados oficiales en la model card para una única tarea:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 77,9% |

Estos resultados se obtuvieron con greedy decoding, single-turn, sin ejemplos y sin self-consistency. No se dispone de otros benchmarks (MMLU, HumanEval, etc.) en la información proporcionada.

## Requisitos de hardware

- El modelo base Olmo-3-7B-Think en bf16 requiere aproximadamente 14 GB de VRAM para inferencia; con cuantización 4-bit (GPTQ o AWQ) puede caber en GPUs con 6-8 GB.
- El adaptador LoRA añade un coste mínimo de VRAM (0.2 GB en disco), pero debe cargarse junto al modelo base.
- Se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para trabajar cómodamente en bf16.
- El entrenamiento se realizó en una NVIDIA A100 80GB, pero la inferencia es viable en GPUs consumer de gama alta.
- Para despliegue, el adaptador requiere `transformers` con `peft`; no es directamente compatible con vLLM o llama.cpp sin conversión previa. Se puede usar con `AutoModelForCausalLM` y `PeftModel`, o exportar el modelo fusionado a otros formatos.
- La latencia depende de la longitud de las cadenas de pensamiento; al ser extremadamente cortas (16 caracteres), la generación es rápida, aunque el modelo base sigue teniendo el coste de los 7B parámetros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K (greedy) | Licencia |
|---|---|---|---|---|
| ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l5 (adaptador) | 7B + LoRA | no disponible | 77,9% | Apache-2.0 |
| allenai/Olmo-3-7B-Think (base) | 7B | no disponible | no disponible | Apache-2.0 |
| Llama-3.1-8B-Instruct | 8B | 128K | ~84% (reportado) | Llama 3.1 Community License |
| Qwen2.5-7B-Instruct | 7B | 32K | ~83% (reportado) | Apache-2.0 |

Nota: los valores de Llama y Qwen son aproximados y no verificados en esta ficha; se incluyen solo como referencia de la categoría. No se dispone de comparativas directas con el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Es una ablación de investigación, no un modelo de producción; el autor indica que puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).
- Solo ha sido entrenado y evaluado en problemas matemáticos de tipo word problem (GSM8K); su rendimiento en otros dominios no está verificado.
- La precisión cae con la dificultad del problema, especialmente en los niveles más comprimidos.
- Requiere cargar primero el adaptador SFT del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados.
- El entrenamiento se realizó con una única semilla (seed7); diferencias de un par de puntos porcentuales están dentro del ruido estadístico.
- Riesgo de alucinación en problemas fuera de distribución, dado el entrenamiento limitado a GSM8K.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think también es Apache-2.0, por lo que no hay restricciones adicionales.
- No se proporcionan garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed7-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Colección Olmo 3 de AllenAI: https://huggingface.co/collections/allenai/olmo-3
- Página de ThinkLLM sobre Olmo 3 7B Think: https://thinkllm.dev/models/olmo-3-7b-think
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Artículo de llm.co sobre Olmo-3-7B-Think: https://llm.co/llms/olmo-3-7b-think

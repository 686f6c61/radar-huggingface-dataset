# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed3-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-base-seed3-l5` es un adaptador LoRA publicado por el usuario `ssurface` (Anatolii Frolov) que modifica el comportamiento del modelo de razonamiento `allenai/Olmo-3-7B-Think` de AllenAI (Ai2) para que genere cadenas de pensamiento extremadamente comprimidas, denominadas "nivel L5" dentro de la familia de "dialectos de compresión de chain-of-thought". En este nivel, la mediana de longitud de las cadenas de razonamiento es de apenas 16 caracteres (frente a 532 en el nivel L1), lo que supone una compresión de 33x. Este adaptador concreto es una **ablación de diseño de recompensa** (variante `base-seed3`), entrenada con GRPO sobre el modelo SFT L5, y se publica para permitir reproducir la comparación de recompensas descrita en el paper asociado, no como modelo principal.

El adaptador se entrena sobre el conjunto de entrenamiento de GSM8K (6993 ejemplos re-expresados a nivel L5 por un modelo teacher) y consigue un 77.2% de precisión exacta en el test de GSM8K con decodificación greedy y sin self-consistency. La arquitectura subyacente es la de Olmo-3-7B-Think, un transformer decoder-only de 7B parámetros con capacidades de razonamiento explícito, sobre el que se aplica un adaptador LoRA de rango 16 y alpha 32. El modelo está pensado exclusivamente para investigación en compresión de razonamiento y no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: `allenai/Olmo-3-7B-Think`) + adaptador LoRA |
| Parametros totales | 7B (base) + adaptador LoRA (~0.2 GB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la base `Olmo-3-7B-Think`, no especificada en la documentacion) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bfloat16; la base puede cuantizarse con metodos estandar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de la familia Olmo 3 de AllenAI entrenado con un enfoque de "pensamiento largo" (long chain-of-thought) para mejorar tareas de razonamiento como matematicas y codigo. El adaptador LoRA (r=16, alpha=32) se entrena con el algoritmo GRPO (Group Relative Policy Optimization) implementado en `trl.GRPOTrainer` sobre el modelo SFT L5 previamente fusionado (el adaptador `ssurface/cot-dialect-olmo3-7b-think-sft-l5`). El conjunto de datos de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo teacher, donde cada cadena de razonamiento se colapsa a una expresion unica de ~16 caracteres (ejemplo: `18/3*2=12`).

La funcion de recompensa combina dos componentes: `correctness`, que asigna una recompensa proporcional al numero de pasos de la solucion dorada cuando la respuesta coincide, y `format`, que exige una estructura de respuesta de un unico bloque `thinking` seguido de `response` y `#### <answer>`. El entrenamiento se realizo con 8 generaciones por prompt, batch efectivo de 64 (32 x 2 acumulacion), maximo de 256 tokens de completacion, learning rate 1e-05 y coeficiente KL beta 0.01, en una unica NVIDIA A100 80GB. Un detalle tecnico relevante: el autor advierte que el entrenamiento con kernels fusionados producia adaptadores con matrices `lora_B` todas a cero (inertes), por lo que se uso atencion `sdpa` estandar y se verifico que cada adaptador publicado tuviera `lora_B != 0`.

## Capacidades

- Generacion de texto con razonamiento matematico en formato comprimido: produce cadenas de pensamiento de nivel L5 (una unica expresion algebraica o aritmetica) seguidas de una respuesta final en formato `#### <resultado>`.
- Razonamiento paso a paso extremadamente condensado: a diferencia de los modelos de razonamiento convencionales que generan cadenas largas, este adaptador fuerza una representacion minimalista del proceso de solucion.
- Soporte de formato estricto: la salida debe contener exactamente un bloque `thinking` y un bloque `response` para cumplir la recompensa de formato.
- Capacidad multilingue: no disponible, el modelo esta entrenado y evaluado solo en ingles.
- Capacidades especiales: no incluye tool calling, ni vision, ni audio. Es un modelo puramente textual para razonamiento matematico.
- Capacidad de adaptacion a prompts especificos: se recomienda usar el prefijo "Solve this using Level 5 (Extreme)." para activar el comportamiento comprimido.

## Casos de uso

- Investigacion en compresion de chain-of-thought: este adaptador es una pieza clave para estudiar como afecta la longitud del razonamiento a la precision en tareas matematicas, permitiendo comparar niveles L1 a L5 y distintas funciones de recompensa.
- Reproduccion de experimentos de ablacion de recompensas: al ser una variante `base-seed3`, permite verificar si el diseño de recompensa (correctness ponderada por pasos) mejora o degrada el rendimiento frente al modelo principal del mismo nivel.
- Evaluacion de trade-offs entre longitud de salida y exactitud: en entornos donde el coste de generacion de tokens es critico (por ejemplo, APIs con limite de tokens de salida), este modelo permite medir hasta que punto se puede comprimir el razonamiento sin perder demasiada precision.
- Benchmarking de modelos de razonamiento comprimido: sirve como referencia para comparar otras tecnicas de compresion de CoT (distilacion, pruning, etc.) en el mismo conjunto de datos GSM8K.
- Analisis de robustez frente a la dificultad del problema: dado que la precision cae con la dificultad, puede usarse para estudiar en que rango de complejidad la compresion extrema es viable.
- Generacion de datos sinteticos de razonamiento corto: el adaptador puede emplearse para producir ejemplos de CoT extremadamente comprimidos que sirvan como datos de entrenamiento para otros modelos mas pequeños o para pipelines de destilacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, decodificacion greedy, single-turn, sin exemplars, sin self-consistency):

| Modelo | Accuracy (exact match) |
|---|---|
| `cot-dialect-olmo3-7b-think-grpo-base-seed3-l5` (este adaptador) | 77.2% |

No se proporcionan comparaciones con otros modelos en la informacion disponible. El autor indica que la diferencia de ruido estadistico es de aproximadamente ±2.7 puntos porcentuales al 95% de confianza para n=1317, por lo que diferencias de un par de puntos entre variantes no son significativas. Ademas, al ser una ablacion, puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`), cuyos resultados no se incluyen en esta documentacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa ~0.2 GB, pero la base `Olmo-3-7B-Think` requiere aproximadamente 14 GB en bfloat16 (7B parametros x 2 bytes). Con cuantizacion de 4 bits (por ejemplo, bitsandbytes) puede reducirse a ~4-5 GB.
- GPU recomendadas: para bf16 sin cuantizar se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Con cuantizacion 4-bit puede ejecutarse en GPUs consumer de 8 GB (RTX 3060/3070, RTX 4060).
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse con `transformers` + `peft` y fusionarse con el modelo base. No se menciona compatibilidad directa con vLLM, llama.cpp u Ollama, aunque tras fusionar y exportar a GGUF podria usarse en esos entornos.
- Latencia y throughput: no disponible. El entrenamiento se realizo en una A100 80GB, pero no se publican metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|---|
| `cot-dialect-olmo3-7b-think-grpo-base-seed3-l5` (este) | Adaptador LoRA sobre Olmo-3-7B-Think | 7B base + LoRA | no disponible | 77.2% | Apache-2.0 |
| `cot-dialect-olmo3-7b-think-grpo-l5` (modelo principal del mismo nivel) | Adaptador LoRA sobre Olmo-3-7B-Think | 7B base + LoRA | no disponible | no disponible (no publicado en la info) | Apache-2.0 |
| `allenai/Olmo-3-7B-Think` (base sin adaptador) | Modelo completo | 7B | no disponible | no disponible | Apache-2.0 |

No se dispone de datos de otros modelos de compresion de CoT comparables en la informacion proporcionada. La comparacion directa con el modelo base sin compresion no esta publicada en esta documentacion.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K). No se ha probado en otras tareas de razonamiento, codigo o comprension lectora.
- La precision disminuye rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas extremos (L5).
- Es una **ablacion de investigacion**, no un modelo listo para produccion. El autor advierte explicitamente que puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con la base antes de aplicar este adaptador GRPO. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- El resultado de 77.2% tiene un intervalo de confianza del 95% de aproximadamente ±2.7 puntos porcentuales; diferencias de un par de puntos entre variantes no son estadisticamente significativas.
- La compresion a nivel L5 produce cadenas de razonamiento de 16 caracteres que pueden ser ilegibles o dificiles de interpretar para humanos, lo que limita su uso en aplicaciones donde la explicabilidad sea necesaria.
- Solo se ha entrenado con una semilla (seed 3) y un conjunto de prompts balanceado de 1000 ejemplos; no hay garantia de robustez frente a variaciones en el prompt o en la distribucion de datos.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed3-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT L5 (requerido antes de este adaptador): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel (para comparacion): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Referencia del paper (citacion en la model card): Frolov, Anatolii. "Chain-of-Thought Compression Dialects" (2026), sin URL publica disponible.

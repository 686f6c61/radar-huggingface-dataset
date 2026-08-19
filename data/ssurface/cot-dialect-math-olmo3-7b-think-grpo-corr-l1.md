# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l1

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l1` es un adaptador LoRA diseñado para que el modelo base `allenai/Olmo-3-7B-Think` (7.3B parámetros, de Allen Institute for AI) razone a un nivel de compresión L1, es decir, con razonamiento completo en lenguaje natural. El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT previamente fusionado, y su objetivo es mejorar la precisión en problemas matemáticos del dataset MATH-500. Publicado bajo licencia Apache-2.0, está pensado para tareas de generación de texto con cadena de pensamiento (chain-of-thought) y razonamiento matemático.

La relevancia de este adaptador radica en que demuestra una técnica de compresión de razonamiento: el modelo base genera cadenas de pensamiento verbosas, y este adaptador las condensa a un nivel L1 sin perder precisión, lo que puede reducir costes de inferencia. El repositorio incluye solo el adaptador (0.2 GB) y requiere cargar el modelo base y el adaptador SFT previo para funcionar correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Olmo-3-7B-Think (transformer causal, attention SDPA) |
| Parametros totales | 7.3B (modelo base) + adaptador LoRA r=16, alpha=32 (tamano del adaptador no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors, el modelo base puede cuantizarse) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `allenai/Olmo-3-7B-Think`, un modelo causal de 7.3B parámetros entrenado con SFT, DPO y RLVR para producir cadenas de pensamiento visibles. El entrenamiento del adaptador se realizó con `trl.GRPOTrainer` sobre el modelo SFT fusionado (`merged_math_olmo/l1`), usando un dataset de problemas MATH re-expresados a nivel L1 por un modelo profesor. La recompensa `correctness` pondera el acierto con el número de pasos de la solución dorada, y se usó loss tipo dapo, 8 generaciones por prompt, batch 32x2, max completion de 256 tokens, learning rate 1e-05 y KL coefficient 0.04. El adaptador tiene r=16 y alpha=32. Se entrenó en una NVIDIA A100 80GB.

Una nota importante: el adaptador se entrena sobre el modelo SFT fusionado, no sobre el base directamente. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` sin el adaptador SFT previo no reproduce los resultados publicados. Además, el autor verificó que las matrices `lora_B` no fueran cero antes de publicar, descartando 13 adaptadores que fallaron esa comprobación.

## Capacidades

- Razonamiento matematico: resuelve problemas de nivel MATH-500 con exactitud del 68.2% (greedy decoding, sin self-consistency).
- Cadena de pensamiento comprimida: genera explicaciones verbosas (nivel L1) pero condensadas respecto al modelo base.
- Generacion de texto: al ser un adaptador sobre un modelo generativo, mantiene la capacidad de generar texto libre, aunque el entrenamiento se centra en problemas matematicos.
- No soporta tool calling, ni vision, ni audio (no se menciona en la documentacion).
- Multilingue: solo ingles confirmado.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar soluciones paso a paso para problemas de algebra, calculo o estadistica, util para tutores automaticos o plataformas de aprendizaje.
- Generacion de explicaciones para datasets de entrenamiento: al producir razonamientos comprimidos, puede usarse para crear datos sinteticos de chain-of-thought para otros modelos.
- Evaluacion de razonamiento en pipelines de QA: integrable en sistemas que requieran respuestas matematicas exactas (por ejemplo, verificacion de resultados en calculadoras simbolicas).
- Optimizacion de costes en inferencia: al comprimir el razonamiento, reduce el numero de tokens generados, lo que abarata el despliegue en produccion frente al modelo base sin adaptador.
- Benchmarking de tecnicas de compresion de CoT: sirve como referencia para investigacion sobre como reducir la longitud de las cadenas de pensamiento sin perder precision.
- Asistencia en tareas de ingenieria que requieran calculos: por ejemplo, estimaciones de diseno, conversion de unidades o calculo de parametros tecnicos, siempre que se formulen como problemas matematicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | MATH-500 (test) | Accuracy (exact match) | 68.2% |

Nota: el autor indica que el scoring se realizo con un grader consciente de LaTeX que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` == `14/3`). No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0.2 GB, pero requiere cargar el modelo base de 7.3B parametros.
- Para inferencia en fp16/bfloat16, el modelo base necesita aproximadamente 14-16 GB de VRAM (por ejemplo, una RTX 4090 24GB o A100 40GB).
- Con cuantizacion 4-bit (GGUF o bitsandbytes), puede caber en GPUs consumer de 8-12 GB, aunque no se proporcionan cuantizaciones oficiales del adaptador.
- El entrenamiento se realizo en 1x NVIDIA A100 80GB, pero para inferencia no se requiere esa capacidad.
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con `transformers` + `peft`. Para cuantizacion, se puede combinar con `bitsandbytes` o convertir a GGUF (aunque no se proporciona un GGUF especifico para este adaptador).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo base `allenai/Olmo-3-7B-Think` es la referencia natural, pero no se incluyen sus resultados en MATH-500 en esta documentacion. Otros adaptadores similares (por ejemplo, `Alelcv27/Olmo3-7B-Math-CoT`) existen en HuggingFace, pero no se han publicado sus benchmarks. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de estilo word problem; su rendimiento en otras tareas no esta garantizado.
- La precision cae con la dificultad del problema, especialmente en los niveles de compresion mas altos (aunque este adaptador es nivel L1, el mas verboso).
- El adaptador se apila sobre el modelo SFT fusionado, no sobre el base directo. Cargarlo incorrectamente produce resultados no reproducibles.
- Los resultados de exactitud tienen un margen de error de aproximadamente ±4.4 puntos porcentuales (n=500, 95% de confianza), segun el autor.
- Solo soporta ingles; no se ha evaluado en otros idiomas.
- Riesgo de alucinacion en problemas matematicos complejos, como cualquier modelo generativo.
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar en el dominio especifico.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l1
- Modelo base Olmo-3-7B-Think (referencia): https://huggingface.co/allenai/Olmo-3-7B-Think
- Articulo sobre Olmo-3-7B-Think en llm.co: https://llm.co/llms/olmo-3-7b-think
- Articulo sobre Olmo-3-7B-Think en DEV.co: https://dev.co/ai/llms/olmo-3-7b-think
- Repositorio GGUF de unsloth (para cuantizacion del modelo base): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Modelo similar (finetune sin benchmarks publicados): https://huggingface.co/Alelcv27/Olmo3-7B-Math-CoT

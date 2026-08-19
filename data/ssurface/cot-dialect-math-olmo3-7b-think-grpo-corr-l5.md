# ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l5

## Resumen

`cot-dialect-math-olmo3-7b-think-grpo-corr-l5` es un adaptador LoRA (PEFT) desarrollado por `ssurface` que se apila sobre el modelo base `allenai/Olmo-3-7B-Think` para especializarlo en razonamiento matemático bajo un "dialecto de compresión" de nivel L5, es decir, una forma de cadena de pensamiento extremadamente colapsada y expresada en una única línea. El modelo resuelve problemas matemáticos de nivel competitivo (MATH-500) con una precisión exacta del 65% en decodificación greedy, sin ejemplos ni self-consistency.

El adaptador fue entrenado mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo que ya había sido ajustado con problemas matemáticos reexpresados en el mismo nivel L5. La arquitectura subyacente es la del transformer Olmo-3-7B-Think, un modelo de 7B parámetros de la familia Olmo 3, preentrenado en el corpus Dolma 3 y post-entrenado en Dolci. El adaptador tiene un tamaño de repositorio de 0.2 GB y se distribuye bajo licencia Apache 2.0, aunque su uso práctico requiere cargar primero el adaptador SFT correspondiente antes de aplicar este.

La relevancia de este modelo radica en su enfoque experimental: demuestra que es posible comprimir el razonamiento de cadena de pensamiento a un nivel extremo (una sola expresión) manteniendo un rendimiento competitivo en tareas matemáticas, lo que abre vías para reducir la latencia y el coste computacional en inferencia de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer (Olmo-3-7B-Think) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bfloat16 sobre el base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer de 7B parámetros de la familia Olmo 3, preentrenado en el corpus Dolma 3 y post-entrenado en Dolci. El adaptador en sí es una matriz LoRA con r=16 y alpha=32, entrenada mediante GRPO con el `trl.GRPOTrainer` sobre el modelo SFT previo (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`), que ya había sido ajustado con problemas matemáticos reexpresados en el nivel de compresión L5.

El entrenamiento utilizó una recompensa basada únicamente en la corrección (`correctness`), con un componente adicional que pondera el número de pasos de la solución de referencia, de modo que los problemas más difíciles aportan mayor señal. Se emplearon 8 generaciones por prompt, un batch efectivo de 64 (32 × 2 acumulación), una longitud máxima de completación de 256 tokens, una tasa de aprendizaje de 1e-5 y un coeficiente KL de 0.04. El entrenamiento se realizó en una única NVIDIA A100 de 80 GB, con atención `sdpa` estándar (no kernels fusionados). El autor verificó que todas las matrices `lora_B` del adaptador fueran distintas de cero antes de publicarlo, descartando 13 adaptadores que fallaron esta comprobación.

## Capacidades

- Razonamiento matemático especializado en problemas de nivel MATH-500, con una precisión exacta del 65% en decodificación greedy.
- Generación de cadenas de pensamiento comprimidas en un nivel extremo (L5), donde el razonamiento se expresa como una única expresión colapsada.
- Soporte para problemas matemáticos con respuestas en formato `\boxed{}` (LaTeX), normalizando formas equivalentes como `\frac{14}{3}` y `14/3`.
- No se han documentado capacidades adicionales como tool calling, agentes, visión o audio; el modelo está limitado a la generación de texto para tareas matemáticas.

## Casos de uso

- Evaluación de razonamiento matemático en investigación: el modelo permite medir el impacto de la compresión de cadenas de pensamiento en la precisión, sirviendo como referencia para estudios sobre eficiencia en razonamiento.
- Generación de soluciones a problemas matemáticos de nivel competitivo: puede utilizarse para producir respuestas razonadas a problemas de olimpiadas o exámenes, aunque con una precisión limitada en problemas de alta dificultad.
- Benchmarking de adaptadores LoRA: al ser un adaptador ligero (0.2 GB), es útil para experimentos de ajuste fino eficiente en recursos, comparando estrategias de recompensa y compresión.
- Prototipado de sistemas de tutoría matemática: integrado en un pipeline que primero carga el adaptador SFT y luego este, puede generar explicaciones comprimidas para problemas concretos, aunque requiere validación humana.
- Estudio de dialectos de razonamiento: el modelo sirve como caso de estudio para entender cómo varía el rendimiento al cambiar el nivel de expresión de la cadena de pensamiento (L1, L3, L5).
- Despliegue en entornos con restricciones de latencia: al generar completaciones de solo 256 tokens y con un razonamiento colapsado, puede reducir el tiempo de respuesta frente a modelos que generan cadenas de pensamiento largas, aunque a costa de precisión.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 65.0% |

Condiciones de evaluación: decodificación greedy, single-turn, sin ejemplos, sin self-consistency, con un grader específico que normaliza respuestas LaTeX. No se proporcionan comparaciones con el modelo base sin adaptador ni con otros adaptadores.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` (7B parámetros) en memoria.
- Para inferencia en bfloat16, el modelo base necesita aproximadamente 14-16 GB de VRAM, lo que encaja en GPUs como la RTX 4090 (24 GB) o la A100 (80 GB). Con cuantización a 4 bits, podría caber en GPUs de 8-12 GB, aunque no se han publicado configuraciones específicas.
- El entrenamiento se realizó en una única NVIDIA A100 de 80 GB, pero para inferencia basta con una GPU de gama alta consumer o profesional.
- Opciones de despliegue: al ser un adaptador PEFT, puede usarse con `transformers` y `peft` directamente, o fusionarse con el modelo base y exportarse a formatos como GGUF (vía herramientas como `llama.cpp` o `unsloth`) para su uso en Ollama o vLLM.
- No se dispone de datos de latencia o throughput específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con alternativas de la misma categoría (adaptadores LoRA para razonamiento matemático sobre Olmo-3-7B-Think). El autor menciona que forma parte de una colección de adaptadores con distintos niveles de compresión (L1, L3, L5), pero no se publican los resultados de los demás niveles en la información disponible. Como referencia, el modelo base `allenai/Olmo-3-7B-Think` sin adaptador no tiene un resultado declarado en MATH-500 en esta ficha, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El adaptador solo ha sido entrenado y evaluado en problemas matemáticos de tipo word problem; no es adecuado para otras tareas de lenguaje general.
- La precisión disminuye rápidamente con la dificultad del problema, especialmente en los niveles de compresión más extremos (L5).
- El adaptador debe cargarse sobre el modelo SFT previo (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5`) y fusionarse antes de aplicar este; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el rendimiento declarado.
- Los resultados tienen un margen de error estadístico: el autor indica que el intervalo de confianza al 95% tiene una semiamplitud de ~4.4 puntos porcentuales para n=500, por lo que diferencias de unos pocos puntos pueden deberse al azar.
- No se han realizado evaluaciones de sesgos, alucinaciones o robustez fuera del dominio matemático.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-corr-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Versión GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Model card del SFT de Olmo 3 (Modelscope): https://www.modelscope.cn/models/allenai/Olmo-3-7B-Think-SFT/summary

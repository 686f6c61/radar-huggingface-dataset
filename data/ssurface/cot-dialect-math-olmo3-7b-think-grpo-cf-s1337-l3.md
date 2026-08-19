# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l3

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario ssurface (identificado como Anatolii Frolov en la cita) que modifica el comportamiento de `allenai/Olmo-3-7B-Think` para razonar con un nivel de compresión de cadena de pensamiento denominado L3 (una asignación nombrada por línea). El objetivo es reducir el número de tokens generados durante el razonamiento matemático manteniendo una precisión aceptable, lo que resulta relevante para optimizar costes de inferencia en entornos de producción y para investigar la compresión de cadenas de pensamiento en modelos de lenguaje.

El adaptador se entrena mediante GRPO sobre un modelo SFT fusionado previamente, y está diseñado específicamente para problemas de matemáticas del conjunto MATH. La licencia es Apache 2.0, el idioma soportado es inglés y el repositorio ocupa 0,2 GB en formato safetensors. No se han publicado parámetros totales del adaptador, aunque se sabe que utiliza r=16 y alpha=32.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre `allenai/Olmo-3-7B-Think` (arquitectura del modelo base no especificada en la información) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se apila sobre el modelo base `allenai/Olmo-3-7B-Think`, pero no directamente: el entrenamiento se realizó sobre un modelo SFT fusionado (denominado `merged_math_olmo/l3`), por lo que para reproducir los resultados es necesario cargar primero el adaptador SFT de nivel L3, fusionarlo y luego aplicar este adaptador GRPO. El entrenamiento utiliza `trl.GRPOTrainer` con atención `sdpa` y recompensas basadas en `correctness` (que pondera según el número de pasos de la solución dorada) y `format` (que exige una estructura específica de `thinking` y respuesta). Se generan 8 respuestas por prompt, con un batch de 32 y 2 acumulaciones, una longitud máxima de 256 tokens de completado, una tasa de aprendizaje de 1e-05 y un coeficiente KL de 0,04.

La innovación principal es la compresión de la cadena de pensamiento en tres niveles (L1, L3, L5), donde L3 corresponde a un nivel simbólico intermedio con una asignación por línea. El adaptador fue verificado para que las matrices `lora_B` no fueran nulas, descartando 13 adaptadores que fallaron esa comprobación. El entrenamiento se realizó en una única GPU NVIDIA A100 de 80 GB.

## Capacidades

- Razonamiento matemático con cadena de pensamiento comprimida a nivel L3 (una asignación por línea).
- Generación de texto en inglés (pipeline `text-generation`).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no mencionado; el modelo está orientado a problemas matemáticos de un solo turno.
- Capacidades multilingües: solo inglés.
- Capacidad especial: compresión de cadena de pensamiento, que reduce el número de tokens generados en comparación con el razonamiento estándar.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede generar soluciones paso a paso con una cadena de pensamiento comprimida, útil para plataformas de tutoría donde se requiere explicar el razonamiento de forma concisa.
- Evaluación de compresión de CoT en investigación: sirve como punto de referencia para estudiar cómo la compresión del razonamiento afecta a la precisión en tareas matemáticas, comparando niveles L1, L3 y L5.
- Integración en pipelines de generación de respuestas matemáticas con restricciones de presupuesto de tokens: al reducir la longitud de la cadena de pensamiento, se pueden disminuir los costes de inferencia en servicios que procesan grandes volúmenes de consultas.
- Benchmarking de adaptadores LoRA para razonamiento: el modelo puede utilizarse para probar metodologías de entrenamiento con GRPO y recompensas basadas en corrección y formato.
- Generación de explicaciones para problemas de matemáticas en inglés: adecuado para asistentes de estudio que necesitan respuestas claras y estructuradas con formato `\boxed{}`.
- Investigación sobre eficiencia de modelos de lenguaje: permite analizar el equilibrio entre precisión y longitud de razonamiento, con aplicaciones en despliegues en dispositivos con recursos limitados.

## Benchmarks y rendimiento

El autor declara un resultado en el conjunto MATH-500 (test) con decodificación greedy, un solo turno, sin ejemplos y sin self-consistency:

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | MATH-500 (test) | Accuracy (exact match) | 32,4% |

No se han publicado comparaciones con otros modelos en la información disponible. El autor señala que el harness inicial que buscaba el formato `#### n` de GSM8K arrojaba valores cercanos a 0% para modelos que en realidad obtenían alrededor del 60%, y que los números presentados provienen de un corrector específico que normaliza formas equivalentes como `\frac{14}{3}` y `14/3`.

## Requisitos de hardware

- El entrenamiento se realizó en una única NVIDIA A100 de 80 GB.
- Para inferencia, al ser un adaptador LoRA sobre un modelo de 7B parámetros, se requiere al menos la VRAM necesaria para el modelo base más el adaptador. En bfloat16, un modelo de 7B ocupa aproximadamente 14 GB, por lo que se necesitaría una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100, etc.).
- Con cuantización de 4 bits, el modelo base podría caber en GPUs con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060, aunque no se especifican cuantizaciones compatibles en la información.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` y `peft`; también podría usarse con vLLM o TGI si se fusiona el adaptador con el modelo base, aunque no se menciona soporte explícito.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la información proporcionada. Sin embargo, se pueden mencionar alternativas de la misma categoría:

| Modelo | Parámetros | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| `ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l3` | Adaptador LoRA sobre 7B | no disponible | Apache 2.0 | Compresión de CoT nivel L3, MATH-500 32,4% |
| `Alelcv27/Olmo3-7B-Math-CoT` | 7B | no disponible | Apache 2.0 | Finetune de Olmo-3-7B-Instruct para matemáticas con CoT, entrenado con Unsloth y TRL |
| `allenai/Olmo-3-7B-Think` | 7B | no disponible | Apache 2.0 | Modelo base de razonamiento, sin adaptador |

No se conocen resultados numéricos de estos modelos en los mismos benchmarks, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas; su rendimiento en otras tareas no está garantizado.
- La precisión cae con la dificultad del problema, especialmente en los niveles de compresión más altos.
- El adaptador depende del modelo SFT fusionado; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Solo soporta inglés.
- Riesgo de alucinación en problemas complejos o mal planteados, como cualquier modelo de lenguaje.
- El resultado de 32,4% en MATH-500 se obtuvo con un corrector específico; otros harnesses pueden dar valores muy diferentes.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y de los datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l3
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Modelo alternativo Olmo3-7B-Math-CoT: https://huggingface.co/Alelcv27/Olmo3-7B-Math-CoT

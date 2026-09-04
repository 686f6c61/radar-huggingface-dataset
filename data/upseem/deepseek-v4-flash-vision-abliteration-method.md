# upseem/deepseek-v4-flash-vision-abliteration-method

## Resumen

El repositorio `upseem/deepseek-v4-flash-vision-abliteration-method` no contiene pesos de modelo. Es una nota técnica que documenta cómo aplicar el método de abliteration descrito por Arditi et al. (2024) sobre el modelo base `deepseek-ai/DeepSeek-V4-Flash-Vision-Exp`. El objetivo es reproducir el proceso de eliminación de rechazos ("uncensoring") sobre este MoE experimental de DeepSeek, siguiendo la descripción publicada en la model card de `orcarouter/DeepSeek-V4-Flash-Vision-Uncensored`.

El modelo base es un MoE de aproximadamente 305B parámetros totales con unos 18B activos por token. Su arquitectura incluye 43 capas transformer más 3 módulos MTP/DSpark, atención sparse de DeepSeek, 256 expertos enrutados con top-6 y 1 experto compartido, un mecanismo de Hyper-Connection 4-wide (mHC) y un módulo de visión nativo. Admite una ventana de contexto de 1M tokens y está diseñado como modelo multimodal experimental.

La relevancia de esta nota radica en que documenta las dificultades técnicas específicas de aplicar abliteration a un checkpoint con cuantización mixta FP4/FP8/BF16, un problema no trivial que requiere soluciones de re-cuantización con restricciones. No es una guía de despliegue ni un modelo listo para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (DeepseekV4ForCausalLM) con atención sparse, 43 capas transformer + 3 módulos MTP/DSpark, 256 expertos enrutados (top-6) + 1 compartido, 4-wide mHC y visión nativa |
| Parametros totales | ~305B |
| Parametros activos | ~18B |
| Longitud de contexto | 1M tokens |
| Tipos de cuantizacion | FP4 `e2m1` (expertos enrutados, 2/byte) + `ue8m0` per-32 scales; FP8 block `e4m3` 128x128 (atención y experto compartido); BF16 (embeddings, visión, norms, router); FP32 (mixers mHC) |
| Idiomas soportados | no disponible |
| Licencia | MIT (aplica al repositorio de notas; la licencia del modelo base no se especifica en la información disponible) |
| Formato de pesos | no disponible (el repositorio no incluye pesos; el base usaría safetensors en ~48 shards / ~157 GiB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-Vision-Exp es un MoE híbrido con atención sparse de DeepSeek y un módulo de visión compuesto por una torre de 32 capas más un aligner. Los parámetros enrutados se distribuyen en 256 expertos con selección top-6 más un experto compartido. La capa de salida incluye 3 módulos MTP (Multi-Token Prediction) y DSpark para decodificación especulativa. El mecanismo mHC (Hyper-Connection) multiplica la dimensión del residuo por 4, lo que complica el análisis de direcciones en el espacio latente.

El proceso documentado en este repositorio aplica abliteration de dirección única (Arditi et al. 2024) al modelo base. Para estimar el vector de rechazo `r`, se ejecutan forward passes con prompts dañinos e inocuos, se capturan activaciones en los puntos de lectura pre-hook de los layers norm, y se calcula la diferencia de medias con enmascaramiento de activaciones masivas. El layer 28 (de 43) en el punto de lectura del MoE se identifica como el más efectivo, con una tasa de rechazo dañino que baja de 0.917 a 0.042.

La innovación técnica clave es el procedimiento de re-cuantización con restricciones para pesos FP4/FP8. No se puede aplicar la proyección directamente sobre el código nibble porque esto corrompe la matriz. La solución propuesta resuelve un problema de optimización por columna: minimizar la distancia al peso original con la restricción de que la proyección sobre `r` sea cero, dentro de la cuadrícula de cuantización FP4/FP8. El resultado es un checkpoint "bakeado" que mantiene la estructura de shards del base.

## Capacidades

- Generación de texto y visión multimodal: el modelo base combina un backbone MoE con una torre de visión, permitiendo entradas de imagen y texto.
- Razonamiento y matemáticas: el README indica que las evaluaciones de MMLU, MMLU-Pro y GSM8K varían en ±1 punto porcentual tras el proceso de abliteration.
- Contexto largo: ventana de 1M tokens, útil para documentos extensos o conversaciones multi-turno muy largas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque la arquitectura MTP/DSpark sugiere decodificación especulativa.
- Capacidad de "uncensored": el objetivo del proceso de abliteration es reducir drásticamente la tasa de rechazo ante instrucciones dañinas, manteniendo el rendimiento en tareas benignas.
- Capacidades especiales: visión nativa con tokens de imagen dedicados (image_start, image_end, newline, pad) y aligner propio.

## Casos de uso

- Investigación en alineación y seguridad de modelos: el repositorio documenta el procedimiento para eliminar la dirección de rechazo, lo que sirve como material de referencia para estudiar mecanismos de rechazo en MoE de gran escala.
- Desarrollo de modelos "uncensored" para entornos controlados: el proceso permite generar un checkpoint sin rechazos que puede usarse en experimentos donde se necesita que el modelo responda a cualquier instrucción, siempre que se tenga acceso autorizado a los pesos del base.
- Evaluación de métodos de edición de pesos en cuantización mixta: la técnica de re-cuantización con restricciones es útil para investigadores que trabajan con checkpoints FP4/FP8 y necesitan modificar pesos sin romper la cuantización.
- Reproducción de resultados en investigación académica: los pasos documentados permiten a otros grupos replicar el proceso en su propio entorno con GPU y licencia del base.
- Estudio de diferencias entre métodos de abliteration: la nota compara la abliteration clásica con Heretic ARA, proporcionando una referencia para elegir el método adecuado según la arquitectura.
- Análisis de comportamiento de visión en modelos alineados: se documenta cómo la dirección de rechazo estimada en texto afecta a las respuestas condicionadas por imagen, lo que abre líneas de investigación sobre sesgos multimodales.

## Benchmarks y rendimiento

Los datos de evaluación presentados en las notas del método se refieren al proceso de abliteration, no al modelo base. Se reportan tasas de rechazo ante instrucciones dañinas y tasas de sobre-rechazo en conjuntos benignos. Estos datos son orientativos y provienen de un clasificador de reglas, no de un LLM-judge.

| Conjunto | Base | Abliterated |
|---|---|---|
| MaliciousInstruct (tasa de rechazo dañino) | 0.940 | 0.020 |
| JailbreakBench harmful | 0.910 | 0.020 |
| AdvBench | 0.980 | 0.080 |
| ForbiddenQuestions | 0.853 | 0.113 |
| SimpleSafetyTests | 0.900 | 0.160 |
| XSTest-safe (sobre-rechazo) | 0.092 | 0.004 |
| JailbreakBench benign (sobre-rechazo) | 0.140 | 0.000 |

El README también indica que las puntuaciones en MMLU, MMLU-Pro y GSM8K cambian en ±1 punto porcentual tras la abliteration. No se proporcionan valores numéricos exactos para estos benchmarks. En el dominio visual, se menciona que VLSBench apenas provocaba rechazos en el base, pero al reformular las instrucciones como "action-seeking", la tasa de rechazo condicionada por imagen pasó de ~0.583 en el base a ~0.025 en el modelo abliterated.

No se han publicado resultados de benchmarks del modelo base en la información disponible.

## Requisitos de hardware

- Los pesos completos del modelo base ocupan aproximadamente 157 GiB distribuidos en 48 shards safetensors, según las notas del método.
- Para cargar el modelo completo en memoria se requieren GPUs de centro de datos con al menos 80 GB de VRAM (por ejemplo, A100 o H100), o varias GPUs en paralelo con tensor parallelism.
- La cuantización FP4 y FP8 reduce el footprint de memoria frente a un equivalente BF16, pero el tamaño total sigue siendo elevado. No se dispone de mediciones exactas de VRAM en la información proporcionada.
- El proceso de abliteration documentado requiere acceso a los pesos del base y un entorno con GPU suficiente para ejecutar forward passes de un modelo de 305B.
- Opciones de despliegue: vLLM es mencionado indirectamente en los resultados de búsqueda como soporte para el modelo base. También podría usarse llama.cpp con cuantizaciones GGUF si se generan, aunque el repositorio no incluye pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparación más directa es entre el modelo base y el resultado del proceso de abliteration, así como entre los dos métodos de edición de pesos.

| Aspecto | DeepSeek-V4-Flash-Vision-Exp (base) | Con abliteration clásica | Con Heretic ARA |
|---|---|---|---|
| Tipo de edición | Ninguna | Ortogonalización de dirección única (Arditi et al. 2024) | Optimización de matrices con L-BFGS/cerrado |
| Parámetros | ~305B totales / ~18B activos | Mismos | Mismos |
| Contexto | 1M tokens | 1M tokens | 1M tokens |
| Tasa de rechazo dañino (MaliciousInstruct) | 0.940 | 0.020 | no disponible |
| Complejidad de implementación | — | Media (requiere re-cuantización FP4/FP8) | Alta (requiere hooks y optimización por módulo) |
| Licencia del repositorio | no disponible | MIT (notas del método) | no disponible |

No se dispone de datos de comparación con otros modelos MoE de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no contiene pesos de modelo. No es posible descargar ni ejecutar ningún modelo desde aquí. Es únicamente documentación de método.
- El proceso de abliteration reduce drásticamente la tasa de rechazo, lo que puede hacer que el modelo responda a instrucciones dañinas. Su uso en producción requiere evaluaciones de seguridad adicionales.
- Las evaluaciones reportadas en las notas provienen de un clasificador de reglas, no de un LLM-judge, por lo que los números deben interpretarse con cautela.
- El modelo base es experimental (sufijo "Exp"). No se garantiza su estabilidad ni su soporte a largo plazo.
- La licencia MIT se aplica al repositorio de notas. La licencia del modelo base DeepSeek-V4-Flash-Vision-Exp no se especifica en la información disponible, por lo que antes de usar el modelo base hay que consultar su model card oficial.
- El proceso de re-cuantización con restricciones introduce una perturbación en los pesos de aproximadamente 3.7% (FP4) y 2.1% (FP8), según las notas. Esto puede afectar a tareas muy sensibles a cambios numéricos.
- La dirección de rechazo se estima únicamente en texto. El README advierte que la aplicación al canal visual puede comportarse de forma distinta, y de hecho documenta que el base apenas rechaza en VLSBench, lo que sugiere que el mecanismo de rechazo multimodal es diferente.

## Enlaces

- Repositorio de notas de método: https://huggingface.co/upseem/deepseek-v4-flash-vision-abliteration-method
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Model card de referencia del proceso abliterated: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored
- Conversión GGUF de referencia: https://huggingface.co/orcarouter/DeepSeek-V4-Flash-Vision-Uncensored-GGUF
- Paper de abliteration (Arditi et al. 2024): https://arxiv.org/abs/2406.11717
- Heretic ARA (método alternativo): https://github.com/p-e-w/heretic

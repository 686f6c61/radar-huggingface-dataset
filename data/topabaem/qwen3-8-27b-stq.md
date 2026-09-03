# topabaem/Qwen3.8-27B-STQ

## Resumen

Qwen3.8-27B-STQ es una colección de cuantizaciones GGUF del modelo vision-language Qwen/Qwen3.8-27B, publicada por el usuario topabaem como parte del proyecto de investigación mix-stq. El objetivo es medir el impacto de distintas cuantizaciones de baja precisión sobre un mismo modelo base, utilizando una metodología rigurosa con imatrix compartida y un build fijado de llama.cpp. No se trata de un nuevo modelo, sino de un estudio de medición que ofrece artefactos GGUF listos para usar.

El modelo base Qwen3.8-27B es un modelo denso de 27B parámetros con arquitectura híbrida: atención lineal en 48 de sus 64 capas, un vision tower nativo y un contexto de 262K tokens, extensible a 1M. Está diseñado para tareas multimodales (texto, imagen y vídeo) y destaca en razonamiento, código y productividad ofimática. La cuantización permite ejecutarlo en hardware más modesto, con tamaños que van desde 11 GB hasta 19 GB, manteniendo una calidad razonable según los benchmarks publicados.

La relevancia de esta ficha radica en que ofrece datos medidos de rendimiento, perplexity y throughput para cada cuantización, lo que permite a desarrolladores elegir el punto óptimo entre tamaño, velocidad y fidelidad para su caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa híbrida: atención lineal en 48/64 capas, vision tower, MTP draft head |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K nativo, extensible a 1M |
| Tipos de cuantizacion | IQ3_XXS, IQ4_XS, Q4_K_M, Q5_K_M (GGUF) + proyector de visión BF16 |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (shards divididos) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo causal de lenguaje con vision encoder integrado, entrenado de forma nativa para razonar sobre texto, imágenes y vídeo. Su arquitectura híbrida combina atención lineal en 48 de 64 capas, lo que reduce el coste computacional en contextos largos, junto con un mecanismo de atención completa en las capas restantes. Incluye un MTP (multi-token prediction) draft head para decodificación especulativa y soporta una ventana de contexto nativa de 262K tokens, ampliable a 1M.

La cuantización se realizó con un build fijado de llama.cpp (commit `580e88d8b7dece7099d9b62323521d0254ff3615`), partiendo de un GGUF BF16 reproducible byte a byte. Se utilizó una única importance matrix compartida por todas las ramas, calculada sobre un corpus de calibración de 96 registros. No se aplicó requantización ni mezcla de toolchains, garantizando la comparabilidad de los resultados. El estudio se centra en medir el impacto de cada cuantización, no en proponer un nuevo códec.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes, texto y vídeo de hasta una hora de duración.
- Razonamiento complejo y resolución de problemas en matemáticas, lógica y ciencias.
- Generación de código y asistencia en programación, con mejoras específicas en tareas de codificación.
- Productividad ofimática: comprensión de documentos, tablas, gráficos y presentaciones.
- Soporte de contexto largo: 262K tokens nativos, útil para documentos extensos o conversaciones multi-turno.
- Decodificación especulativa mediante MTP draft head, que acelera la generación en inferencia.
- Capacidades multilingües heredadas del modelo base (no se detallan los idiomas concretos en la documentación).

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones IQ3_XXS (11.19 GB) e IQ4_XS (15.08 GB), el modelo puede ejecutarse en GPUs consumer de 16 GB, como RTX 4080 o RTX 4090, manteniendo un rendimiento aceptable para tareas de chat y análisis de documentos.
- Asistentes de visión por computadora: el proyector de visión BF16 permite integrar el modelo en pipelines que requieren comprensión de imágenes, como descripción automática de fotografías o extracción de información de capturas de pantalla.
- Procesamiento de documentos largos: con 262K tokens de contexto, es adecuado para resumir informes extensos, analizar contratos o procesar libros completos sin truncamiento.
- Generación de código asistida: el modelo base destaca en tareas de programación; las cuantizaciones Q4_K_M y Q5_K_M ofrecen un equilibrio entre calidad y velocidad para integrarse en IDEs o herramientas de autocompletado.
- Investigación en cuantización: los artefactos y logs publicados en el dataset mix-stq-artifacts sirven como referencia para estudiar el impacto de distintas cuantizaciones en modelos multimodales.
- Inferencia en producción con llama.cpp: las cuantizaciones se cargan directamente con llama-cli o llama-server, y pueden fusionarse en un único archivo con `llama-gguf-split --merge` para simplificar el despliegue.

## Benchmarks y rendimiento

La model card publica resultados medidos sobre un conjunto de 800 ítems estratificados de MMLU+ARC, comparando cada cuantización contra el baseline BF16. También incluye perplexity en WikiText-2 y throughput en A100 80GB.

| Arm | Top-1 accuracy | Δ vs BF16 | 95% CI | McNemar p | Verdict |
|---|---:|---:|---|---:|---|
| BF16 | 696/800 (0.8700) | — | — | — | baseline |
| IQ3_XXS | 688/800 (0.8600) | +1.000 pp | [−0.375, +2.375] pp | 0.215 | undetermined |
| IQ4_XS | 685/800 (0.8563) | +1.375 pp | [+0.500, +2.375] pp | 0.007 | significant loss |
| Q4_K_M | 692/800 (0.8650) | +0.500 pp | [−0.375, +1.375] pp | 0.388 | non-inferior |
| Q5_K_M | 695/800 (0.8688) | +0.125 pp | [−0.750, +1.000] pp | 1.000 | non-inferior |

| Arm | PPL (WikiText-2) | Δ vs BF16 |
|---|---:|---:|
| BF16 | 6.8309 | — |
| IQ3_XXS | 7.3318 | +7.33% |
| IQ4_XS | 6.9023 | +1.05% |
| Q4_K_M | 6.8611 | +0.44% |
| Q5_K_M | 6.8498 | +0.28% |

| Arm | pp512 tok/s | tg128 tok/s | Peak VRAM |
|---|---:|---:|---:|
| BF16 | 2423.5 | 26.9 | 50.1 GB |
| IQ3_XXS | 1232.9 | 50.9 | 11.3 GB |
| IQ4_XS | 1338.5 | 57.1 | 14.9 GB |
| Q4_K_M | 1288.1 | 48.2 | 16.3 GB |
| Q5_K_M | 1248.0 | 44.2 | 18.7 GB |

Nota: los resultados de accuracy muestran una inversión inesperada (IQ4_XS peor que IQ3_XXS) que no se refleja en perplexity. El autor advierte que es una propiedad de este conjunto de evaluación concreto, no una conclusión general sobre IQ4_XS.

## Requisitos de hardware

- VRAM estimada para inferencia: 11.3 GB (IQ3_XXS), 14.9 GB (IQ4_XS), 16.3 GB (Q4_K_M), 18.7 GB (Q5_K_M), 50.1 GB (BF16).
- GPU recomendadas: A100 80GB para el baseline BF16 y pruebas de throughput; para las cuantizaciones, GPUs consumer de 12-24 GB como RTX 3080/4080/4090 o equivalentes de AMD.
- Las cuantizaciones IQ3_XXS e IQ4_XS caben en GPUs de 16 GB, mientras que Q4_K_M y Q5_K_M requieren al menos 20 GB de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), compatible con Ollama y otros frontends que usen GGUF. También se puede usar vLLM si se convierte a otro formato, aunque no está documentado.
- Latencia y throughput: en A100 80GB, la generación (tg128) varía entre 44.2 y 57.1 tok/s según la cuantización, con IQ4_XS como la más rápida. El prompt processing (pp512) oscila entre 1232.9 y 1338.5 tok/s.

## Comparativa con modelos similares

No se dispone de comparativas directas con otras cuantizaciones de modelos de tamaño similar en la información proporcionada. La única comparación publicada es contra el propio modelo base en BF16, cuyos resultados se detallan en la sección de benchmarks. Para una comparativa con otros modelos de la familia Qwen3.8, se puede consultar el análisis de Artificial Analysis, pero no se incluyen datos numéricos en esta ficha.

## Limitaciones y advertencias

- La cuantización IQ4_XS muestra una pérdida significativa en el conjunto de 800 ítems de MMLU+ARC, a pesar de tener mejor perplexity que IQ3_XXS. Esto indica que la calidad puede variar según la tarea y el conjunto de evaluación.
- El estudio es una medición de investigación, no una recomendación de despliegue. El autor advierte explícitamente que no se deben tomar estos resultados como una guía general de qué cuantización usar.
- No se han medido aún la calidad de generación libre ni benchmarks como Terminal Bench, por lo que el rendimiento en tareas abiertas es desconocido.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje, y la cuantización puede amplificar estos efectos en algunos casos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B para confirmar restricciones adicionales.
- El repositorio no incluye el GGUF BF16 completo (50.1 GB); solo las cuantizaciones y el proyector de visión. Para reproducir el BF16 es necesario seguir el procedimiento documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/topabaem/Qwen3.8-27B-STQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto mix-stq (GitHub): https://github.com/Topabaem05/mix-stq
- Artefactos y evidencia del estudio: https://huggingface.co/datasets/topabaem/mix-stq-artifacts
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Análisis en dev.to: https://dev.to/mayu2008/qwen38-27b-a-deep-dive-into-qwens-newest-vision-language-powerhouse-2e7
- Comparativa de modelos Qwen3.8 27B en Artificial Analysis: https://artificialanalysis.ai/models/releases/qwen3-8-27b

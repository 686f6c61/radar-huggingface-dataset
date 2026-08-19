# voves/gemma-4-26B-A4B-it-NVFP4

## Resumen

El modelo `voves/gemma-4-26B-A4B-it-NVFP4` es una versión cuantizada en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 25.805 millones de parámetros totales y 4.000 millones de parámetros activos, diseñado para procesar entradas de texto e imagen y generar salidas de texto. La cuantización reduce el peso del modelo a aproximadamente 16,5 GB, lo que facilita su despliegue en GPUs de consumo.

Este modelo resuelve el problema de ejecutar un LLM multimodal de gran tamaño en entornos con recursos limitados, manteniendo una calidad razonable gracias a la cuantización NVFP4. Es relevante porque permite desplegar capacidades de razonamiento, visión y generación de código en infraestructuras modestas, con una licencia Apache 2.0 que facilita su uso comercial. El contexto máximo es de 256.000 tokens, lo que lo hace apto para tareas que requieren ventanas largas, como análisis de documentos extensos o conversaciones multi-turno.

La versión cuantizada ha sido publicada por el usuario `voves` en HuggingFace, y su model card documenta un workaround necesario para ejecutarlo con sglang, aunque vLLM (versión nightly) lo soporta directamente. El modelo base original está disponible en el repositorio oficial de Google, con soporte para más de 140 idiomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal (vision encoder + LLM) |
| Parametros totales | 25.805.936.206 |
| Parametros activos | 4.000.000.000 (4B, según nomenclatura A4B) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | NVFP4 (4-bit floating point) mediante compressed-tensors |
| Idiomas soportados | en (model card); el modelo base soporta más de 140 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con pesos cuantizados NVFP4) |

## Arquitectura y entrenamiento

La arquitectura del modelo base `gemma-4-26B-A4B-it` es un transformer multimodal con un codificador de visión (vision tower) y un decodificador de lenguaje basado en MoE. El componente MoE activa solo 4.000 millones de parámetros por token, mientras que el total asciende a 26.000 millones, lo que permite un equilibrio entre capacidad y eficiencia computacional. El modelo acepta imágenes como entrada adicional al texto y genera texto como salida.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no se encuentran en la información proporcionada. Sin embargo, al ser una versión cuantizada, la cuantización NVFP4 se aplica posteriormente al entrenamiento mediante la librería `compressed-tensors`, que convierte los pesos a formato de punto flotante de 4 bits. Esta cuantización afecta a todas las capas lineales del modelo, excepto las del vision tower, que se mantienen en bf16. El proceso de cuantización no implica reentrenamiento, por lo que las capacidades del modelo original se conservan en gran medida, aunque con una posible pérdida de precisión inherente a la reducción de bits.

## Capacidades

- Generación de texto: produce respuestas coherentes y contextuales en inglés y, potencialmente, en más de 140 idiomas (según el modelo base).
- Razonamiento y matemáticas: el modelo base está optimizado para tareas de razonamiento lógico y resolución de problemas matemáticos.
- Generación de código: soporta tareas de programación, incluyendo generación, explicación y depuración de código.
- Comprensión de imágenes: al ser multimodal, puede procesar imágenes y responder preguntas sobre su contenido (image-text-to-text).
- Ventana de contexto larga: 256.000 tokens, adecuada para documentos extensos, libros o conversaciones prolongadas.
- Soporte para tool calling y agentes: aunque no se confirma explícitamente en la información, los modelos Gemma 4 suelen incluir capacidades de function calling; se recomienda verificar la documentación oficial.
- Multilingüismo: el modelo base declara soporte para más de 140 idiomas, aunque la model card de esta versión cuantizada solo indica "en".

## Casos de uso

- Análisis de documentos con imágenes: el modelo puede procesar documentos escaneados o capturas de pantalla, extrayendo información y respondiendo preguntas sobre su contenido, gracias a su ventana de 256K tokens y su capacidad multimodal.
- Asistente de atención al cliente: con su contexto largo y generación de texto fluida, puede gestionar conversaciones multi-turno con historial extenso, manteniendo el hilo de la conversación.
- Generación de código en entornos de desarrollo: integrable en IDE o pipelines de CI/CD para autocompletar código, generar tests o explicar fragmentos, aprovechando su capacidad de razonamiento.
- Resumen de vídeos o imágenes: al aceptar imágenes como entrada, puede describir el contenido visual de un fotograma o una ilustración, útil para accesibilidad o moderación de contenido.
- Educación y tutoría: puede explicar conceptos complejos, resolver ejercicios de matemáticas o ciencias, y adaptar sus respuestas al nivel del estudiante.
- Procesamiento de datos en investigación: con su contexto de 256K, puede analizar artículos científicos completos o informes técnicos, extrayendo conclusiones y comparando resultados.
- Despliegue en edge o GPUs de consumo: gracias a la cuantización NVFP4 y su tamaño de 16,5 GB, puede ejecutarse en GPUs como RTX 4090 (24 GB) o similares, habilitando asistentes locales sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y la búsqueda web no proporcionó datos adicionales. Se recomienda consultar la documentación oficial del modelo base `google/gemma-4-26B-A4B-it` para obtener resultados de evaluación, teniendo en cuenta que la cuantización NVFP4 puede introducir una degradación ligera en comparación con los pesos originales.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados ocupan aproximadamente 16,5 GB. Para inferencia con overhead de activaciones y KV cache, se recomienda al menos 20-24 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs profesionales equivalentes. Con cuantización adicional o ventanas de contexto reducidas, podría caber en GPUs de 16 GB, pero no es garantizable.
- Compatibilidad con consumer GPU: sí, una RTX 4090 o similar puede ejecutar el modelo sin problemas.
- Opciones de despliegue: vLLM (versión nightly) lo ejecuta directamente; sglang requiere un monkey-patch documentado en la model card. También es posible usar otros frameworks que soporten compressed-tensors, como TensorRT-LLM (con conversión previa).
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, se espera una generación de entre 20 y 50 tokens por segundo para modelos MoE de este tamaño, pero estos valores son estimaciones y dependen de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal | Cuantizacion |
|---|---|---|---|---|---|---|
| voves/gemma-4-26B-A4B-it-NVFP4 | 25,8B | 4B | 256K | Apache-2.0 | Sí | NVFP4 |
| google/gemma-4-26B-A4B-it (base) | 25,8B | 4B | 256K | Apache-2.0 | Sí | No (bf16) |
| Mixtral 8x7B (referencia) | 46,7B | 12,9B | 32K | Apache-2.0 | No | No (bf16) |

La comparativa se basa en especificaciones conocidas de los modelos; no se dispone de resultados de benchmarks comparativos en la información proporcionada. El modelo base sin cuantizar ofrece la máxima fidelidad, mientras que la versión NVFP4 sacrifica algo de precisión a cambio de un menor uso de VRAM. Frente a Mixtral 8x7B, el modelo Gemma 4 destaca por su naturaleza multimodal y su contexto mucho más largo, aunque Mixtral tiene más parámetros activos.

## Limitaciones y advertencias

- Pérdida de precisión por cuantización: la conversión a NVFP4 puede degradar ligeramente la calidad de las respuestas en tareas complejas de razonamiento o generación de código, en comparación con el modelo en bf16.
- Sesgos y alucinaciones: como cualquier LLM, el modelo puede generar información falsa o reflejar sesgos presentes en sus datos de entrenamiento. No se han publicado evaluaciones específicas de seguridad para esta versión cuantizada.
- Idioma: la model card indica solo "en", aunque el modelo base soporta más de 140 idiomas. Es posible que la cuantización afecte al rendimiento en idiomas distintos del inglés; se recomienda probar antes de usar en producción multilingüe.
- Soporte de framework limitado: sglang requiere un parche manual (documentado en la model card) y vLLM solo funciona en versiones nightly. Esto puede complicar el despliegue en entornos estables.
- Ventana de contexto: aunque el modelo soporta 256K tokens, el uso de ventanas muy largas aumenta el consumo de VRAM y puede provocar degradación de rendimiento si no se gestiona adecuadamente la memoria.
- Licencia: Apache-2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base de Google, ya que pueden existir condiciones adicionales para su uso en producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/voves/gemma-4-26B-A4B-it-NVFP4
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-26B-A4B-it
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Contenedor NIM en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/teams/google/containers/gemma-4-26b-a4b-it
- Documentación de Google Cloud sobre Gemma 4 26B A4B IT: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it

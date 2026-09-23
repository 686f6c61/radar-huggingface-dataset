# Thaurock/Qwen3-Coder-30B-A3B-Instruct-abliterated-GGUF

## Resumen

Esta ficha describe la colección de cuantizaciones GGUF del modelo Thaurock/Qwen3-Coder-30B-A3B-Instruct-abliterated, publicada por el usuario Thaurock. Se trata de una versión cuantizada en formato GGUF del modelo Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated, que a su vez deriva del Qwen3-Coder-30B-A3B-Instruct original de Qwen (Alibaba Cloud). El modelo base es un transformer de arquitectura MoE (mixture of experts) con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (denominación A3B), orientado a tareas de generación y razonamiento de código.

El valor diferencial de esta publicación es doble. Por un lado, ofrece una colección completa de cuantizaciones GGUF (desde F16 hasta Q2_K) lista para ejecutarse en llama.cpp, Ollama, LM Studio o Text-Generation-WebUI sin necesidad de dividir archivos. Por otro, el modelo subyacente ha sido procesado con técnicas de *abliteration* por parte de huihui-ai, lo que elimina los filtros de seguridad y rechazos del modelo original, dando lugar a un modelo sin censura orientado a investigación.

Es relevante ahora porque permite ejecutar localmente un modelo de código de 30B con contexto nativo de 256K (heredado del Qwen3-Coder original) en hardware de gama alta o incluso consumer mediante cuantizaciones de 4 bits, manteniendo la eficiencia computacional del enrutado MoE. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | Aproximadamente 3.000 millones (denominacion A3B) |
| Longitud de contexto | 256K nativo (heredado de Qwen3-Coder-30B-A3B-Instruct) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3-Coder en su variante MoE de 30B totales con 3B activos (A3B). Esta configuración activa únicamente una fracción de los expertos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso de tamaño equivalente. El modelo original Qwen3-Coder-30B-A3B-Instruct fue entrenado por Qwen (Alibaba Cloud) con foco en tareas de código y uso agéntico, incluyendo capacidades de agentic coding y agentic browser-use, y soporte nativo de contexto largo de 256K tokens.

Sobre esta base, huihui-ai aplicó técnicas de *abliteration* que modifican la alineación del modelo para eliminar los mecanismos de rechazo y filtros de seguridad, generando la variante Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated. Thaurock realizó después la conversión y cuantización a GGUF. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento lógico orientado a tareas de ingeniería.
- Generación, autocompletado y refactorización de código en múltiples lenguajes de programación.
- Razonamiento agéntico para coding, es decir, resolución de tareas de software en varios pasos.
- Capacidad de agentic browser-use heredada del modelo Qwen3-Coder original, según la documentación de Qwen.
- Manejo de contexto largo de hasta 256K tokens, apto para repositorios o ficheros extensos.
- Funcionamiento sin filtros de seguridad ni mecanismos de rechazo debido a la abliteración.
- Ejecución local mediante llama.cpp, Ollama, LM Studio y Text-Generation-WebUI.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible para esta variante abliterada.

## Casos de uso

- Auditoría de código sin restricciones: análisis estático y revisión de vulnerabilidades sobre repositorios completos aprovechando la ventana de 256K tokens, útil en equipos de seguridad que necesitan respuestas sin bloqueos temáticos.
- Generación de scripts de automatización y scraping: la model card cita como ejemplo de uso la escritura de scripts de web scraping avanzado, escenario donde la ausencia de filtros evita rechazos espurios.
- Refactorización de bases de código grandes: al soportar contexto largo, puede procesar varios ficheros simultáneamente y proponer cambios coherentes entre módulos.
- Asistente de desarrollo local en estación de trabajo: ejecutable con cuantización Q4_K_M en una GPU de 24 GB, sirve como copiloto de código sin enviar datos a servicios externos.
- Investigación sobre alineación y seguridad: la variante abliterada permite estudiar el comportamiento de un modelo de código sin las capas de rechazo, comparándolo con el modelo original.
- Despliegue en pipelines de CI/CD: integrable mediante llama.cpp u Ollama para tareas de generación de tests o documentación automática.
- Traducción y conversión de código entre lenguajes: la comprensión de sintaxis y lógica del modelo permite migrar fragmentos entre lenguajes de programación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las fuentes consultadas mencionan que el modelo original Qwen3-Coder-30B-A3B-Instruct obtiene un rendimiento destacado entre modelos abiertos en tareas de agentic coding y agentic browser-use, así como soporte nativo de contexto de 256K, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, SWE-bench u otros) para esta variante cuantizada y abliterada.

## Requisitos de hardware

- VRAM estimada según el tamaño del fichero GGUF publicado por el autor (sin contar overhead de contexto y caché KV):
  - F16: aproximadamente 61,1 GB.
  - Q8_0: aproximadamente 32,5 GB.
  - Q6_K: aproximadamente 25,1 GB.
  - Q5_K_M: aproximadamente 21,7 GB.
  - Q5_K_S: aproximadamente 21,1 GB.
  - Q4_K_M: aproximadamente 18,6 GB.
  - Q4_K_S: aproximadamente 17,5 GB.
  - Q3_K_L: aproximadamente 15,9 GB.
  - Q3_K_M: aproximadamente 14,7 GB.
  - Q3_K_S: aproximadamente 13,3 GB.
  - Q2_K: aproximadamente 11,3 GB.
- GPU recomendadas: para F16 y Q8_0, GPUs de centro de datos tipo A100 80 GB, H100 80 GB o múltiples GPU. Para Q6_K y Q5_K_M, GPU de 24-48 GB (RTX 3090, RTX 4090, A6000).
- Compatibilidad consumer: la cuantización Q4_K_M (18,6 GB) cabe en GPUs de 24 GB como la RTX 3090 o RTX 4090, dejando margen limitado para contexto. Las variantes Q3 y Q2 permiten ejecución con menor VRAM, a costa de degradación de la estructura del código.
- Opciones de despliegue: llama.cpp (mediante llama-cli), Ollama (referencia huihui_ai/qwen3-coder-abliterated en la model card), LM Studio y Text-Generation-WebUI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Thaurock/Qwen3-Coder-30B-A3B-Instruct-abliterated-GGUF | 30,5B totales / ~3B activos | 256K (heredado) | apache-2.0 | GGUF en HuggingFace |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B totales / ~3B activos | 256K | apache-2.0 | safetensors en HuggingFace |
| huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated | 30,5B totales / ~3B activos | 256K (heredado) | apache-2.0 | modelo base abliterado en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un modelo entrenado por Qwen, cabe esperar los sesgos del modelo original, aunque no se documentan.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta variante cuantizada.
- Limitaciones por cuantización: las variantes Q3 y Q2 pueden degradar la estructura del código y producir sangrado sintáctico, según advierte el propio autor; Q2_K se marca como solo para desarrollo experimental.
- Idiomas: no se especifican en la información proporcionada.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial. No obstante, la abliteración elimina los filtros de seguridad del modelo original, por lo que el uso en producción conlleva responsabilidad plena sobre el contenido generado.
- Advertencia de seguridad: la model card indica explícitamente que el modelo carece de filtros de seguridad artificiales y que la alineación original ha sido modificada por motivos experimentales y de investigación.
- Madurez del repositorio: con 16 descargas y 0 likes en el momento de la consulta, se trata de una publicación reciente y poco validada por la comunidad.

## Enlaces

- HuggingFace (esta ficha): https://huggingface.co/Thaurock/Qwen3-Coder-30B-A3B-Instruct-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio GitHub de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Catálogo de Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3-coder-30b-a3b-instruct
- Ficha en Local AI Zone: https://local-ai-zone.github.io/models/qwen3-coder-30b-a3b-instruct.html

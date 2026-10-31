# tryit301236/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una versión "abliterada" (sin rechazos de seguridad) del modelo Qwen3.8-27B de Qwen, publicada por la comunidad huihui-ai y replicada en este repositorio por el usuario tryit301236. El proceso de abliteration consiste en modificar internamente el modelo —en este caso, editando las capas 18 a 51— para eliminar sus comportamientos de negación (refusals) sin necesidad de reentrenamiento, mediante una implementación conceptual basada en el proyecto remove-refusals-with-transformers.

El modelo base es un LLM multimodal de 27.781 millones de parámetros (dato real extraído de los safetensors) con capacidades de imagen-texto-a-texto, lo que indica soporte de entrada visual además de texto. Se trata de una versión de prueba de concepto: la abliteration es "cruda" y puede degradar parcialmente el rendimiento respecto al modelo original, aunque el autor declara que conservar las primeras 15 capas sin modificar ayuda a mantener más del rendimiento original. Los componentes de MTP (multi-token prediction) y visión no han sido modificados.

Es relevante para desarrolladores e investigadores que necesiten un modelo sin filtros de seguridad para investigación en alineación, red-teaming o casos de uso donde los refusals estándar resultan excesivamente restrictivos. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 55,6 GB, y está disponible también vía Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5, pipeline image-text-to-text); detalles no disponibles |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en bfloat16/float16/float32 según el código de ejemplo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (55,6 GB de repo) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer de la familia Qwen con capacidades multimodales (entrada de imagen y texto, salida de texto) y, aparentemente, soporte de MTP (multi-token prediction) y razonamiento con tokens `<think>`, según se deduce del código de ejemplo que contabiliza tokens de "thinking". Los datos concretos de arquitectura (número de capas, cabezas de atención, tamaño de contexto) no están disponibles en la información proporcionada.

La abliteration se aplicó mediante una técnica de dirección de rechazo implementada sin TransformerLens: se modificaron únicamente las capas 18 a 51, dejando intactas las primeras 15 capas, los mecanismos de MTP y el componente visual. Esta abliteration selectiva busca eliminar los refusals preservando el máximo rendimiento del modelo original. No hay información sobre datos de entrenamiento adicionales, RLHF/DPO ni número de tokens: el modelo base es Qwen/Qwen3.8-27B sin finetuning posterior más allá de la abliteration.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Comprensión multimodal: pipeline image-text-to-text, es decir, acepta imágenes como entrada (el componente visual no fue modificado por la abliteration).
- Razonamiento con modo de "pensamiento": el código de ejemplo contabiliza tokens hasta `</think>`, lo que sugiere soporte de razonamiento extendido estilo Qwen3.
- Generación de código y matemáticas: heredadas del modelo base Qwen (sin datos específicos publicados).
- MTP (multi-token prediction) intacto, potencialmente útil para decodificación especulativa o generación más rápida.
- Sin filtros de seguridad: responde a peticiones que el modelo original rechazaría.
- No hay información sobre tool calling, function calling ni soporte de agentes.

## Casos de uso

- Investigación en alineación y seguridad: al ser una versión abliterada, permite estudiar cómo los mecanismos de refusal afectan al comportamiento del modelo y comparar respuestas con y sin abliteration capa a capa.
- Red-teaming y evaluación de robustez: útil para equipos que prueban sistemas de moderación, ya que genera salidas que el modelo original bloquearía, permitiendo validar filtros externos.
- Escritura creativa sin restricciones: autores que necesitan generar ficción con contenido maduro (violencia en contextos narrativos, temáticas sensibles) donde el modelo original se niega de forma excesiva.
- Procesamiento multimodal sin refusals: análisis de imágenes junto con instrucciones que el modelo original podría rechazar, aprovechando que el componente visual no fue alterado.
- Despliegue local privado vía Ollama: el comando `ollama run huihui_ai/Qwen3.8-abliterated` permite ejecutarlo en local para casos donde no se quiere enviar datos a APIs externas y se requiere control total sobre el comportamiento del modelo.
- Experimentación con abliteration selectiva: el repositorio documenta qué capas fueron modificadas (18-51) y conserva revisiones anteriores (revision `d42ca89`), lo que permite comparar estrategias de abliteration por rango de capas.
- Chatbots de investigación con razonamiento: el soporte aparente de tokens `<think>` permite evaluar tareas de razonamiento multi-paso sin las restricciones del modelo alineado original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica únicamente que la abliteration selectiva (capas 18-51) "ayuda a retener más del rendimiento original" del modelo, sin aportar métricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,8 B de parámetros en bfloat16, se necesitan aproximadamente 55-56 GB (coincide con los 55,6 GB del repo); en float16, cifras similares. Con cuantización a 4 bits (si se genera un GGUF, no disponible en este repo), rondaría los 15-18 GB.
- GPU recomendadas: A100 80 GB, H100 o A6000 48 GB con offloading parcial para inferencia en precisión completa. Con dos RTX 4090 (48 GB combinados) sería viable con offloading a CPU.
- Consumer GPU: no cabe en una única RTX 4090 (24 GB) en bfloat16; sería necesaria cuantización (no publicada en este repo) o multi-GPU.
- Opciones de despliegue: transformers (con `trust_remote_code=True`, según el código de ejemplo), Ollama (`ollama run huihui_ai/Qwen3.8-abliterated`, requiere la última versión de Ollama). No se menciona soporte explícito de vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles; el código de ejemplo incluye medición de latencia del primer token y tokens por segundo, pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Multimodal | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated | 27,8 B | Sí (image-text-to-text) | Apache 2.0 | Abliterated (capas 18-51), sin refusals |
| Qwen/Qwen3.8-27B (base) | 27,8 B | Sí | Apache 2.0 (según tags del derivado) | Modelo original con alineación estándar |
| Otras versiones abliteradas de huihui-ai | Variable | Variable | Apache 2.0 | Mismo método de abliteration sobre otros modelos base |

No hay datos de rendimiento comparativo disponibles entre estas versiones.

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: puede generar contenido ofensivo, dañino o ilegal bajo petición. Su uso conlleva responsabilidad legal y ética para el desplegador.
- La abliteration es descrita por el autor como una "implementación crude, proof-of-concept": puede degradar la calidad, coherencia y utilidad del modelo respecto al original.
- Riesgo de alucinación: no disponible como dato específico, pero inherente a cualquier LLM; la abliteration puede agravar comportamientos no deseados.
- Solo las capas 18-51 fueron abliteradas; las primeras 15 capas permanecen intactas, lo que puede dejar residuos de comportamiento de refusal en ciertos prompts.
- Idiomas soportados, longitud de contexto y benchmarks: no disponibles, lo que dificulta evaluar su idoneidad sin pruebas propias.
- Cuantizaciones oficiales no publicadas en este repo (solo safetensors en bfloat16), lo que limita el despliegue en hardware de consumo.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir la legislación aplicable al generar contenido sin moderación.
- Repositorio con muy poca tracción (37 descargas, 1 like) y duplicado de huihui-ai/Huihui-Qwen3.8-27B-abliterated; se recomienda verificar la procedencia de los pesos frente al repositorio original.

## Enlaces

- Repositorio: https://huggingface.co/tryit301236/Huihui-Qwen3.8-27B-abliterated
- Repositorio original de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Método de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Releases de Ollama: https://github.com/ollama/ollama/releases

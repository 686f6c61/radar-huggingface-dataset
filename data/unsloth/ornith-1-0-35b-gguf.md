# unsloth/Ornith-1.0-35B-GGUF

## Resumen

Ornith-1.0-35B es un modelo de lenguaje de codificacion agéntica desarrollado por DeepReinforce AI, post-entrenado sobre la arquitectura Qwen 3.5 MoE. Forma parte de la familia Ornith-1.0, que incluye versiones densas de 9B y MoE de 35B y 397B, todas orientadas a tareas de agente de codigo. El modelo emplea un marco de entrenamiento de auto-mejora basado en aprendizaje por refuerzo (RL) que optimiza conjuntamente el "scaffold" (andamiaje) del agente y las soluciones generadas, lo que le permite descubrir mejores trayectorias de busqueda y producir soluciones de mayor calidad.

Esta ficha documenta la version cuantizada en GGUF por Unsloth, que utiliza la tecnica Unsloth Dynamic 2.0 para lograr una precision superior a otras cuantizaciones. El modelo tiene 34.660.610.688 parametros totales (MoE), una ventana de contexto de 262.144 tokens (256K) y se distribuye bajo licencia MIT, sin restricciones regionales. Es un modelo de razonamiento que abre cada turno con un bloque de pensamiento antes de la respuesta final, y soporta tool calling y parsing de llamadas a herramientas en formato OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen 3.5 MoE (Mixture of Experts) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 2.0), multiples cuantizaciones disponibles en el repo |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

Ornith-1.0-35B es un modelo de arquitectura Mixture of Experts (MoE) basado en Qwen 3.5, con 34.660 millones de parametros totales. Aunque no se especifican los parametros activos, al ser MoE solo una fraccion de los expertos se activa por token, lo que reduce el coste computacional en inferencia. El modelo fue post-entrenado sobre el checkpoint base de DeepReinforce AI mediante un marco de auto-mejora que combina RL con generacion de "scaffolds" (andamiajes de agente) y soluciones. Esta aproximacion permite al modelo aprender a generar no solo respuestas, sino tambien las estructuras de control que guian el razonamiento del agente, mejorando la calidad de las trayectorias de busqueda.

El entrenamiento se centra en tareas de codificacion agéntica, incluyendo resolucion de issues en repositorios, ejecucion de comandos en terminal y generacion de repositorios completos. El modelo soporta una ventana de contexto de 256K tokens, lo que le permite manejar repositorios grandes y conversaciones multi-turno extensas. La version GGUF de Unsloth incorpora la tecnica Unsloth Dynamic 2.0, que segun sus desarrolladores logra una precision superior a otras cuantizaciones del mismo tamaño.

## Capacidades

- Generacion de codigo y resolucion de tareas de programacion agéntica, incluyendo edicion de multiples archivos, ejecucion de comandos y depuracion.
- Razonamiento multi-paso con modo "thinking" integrado: el modelo genera un bloque de pensamiento antes de la respuesta final, que puede extraerse en un campo separado `reasoning_content`.
- Tool calling y function calling: soporta bloques `<tool_call>` que se pueden parsear como `tool_calls` en formato OpenAI.
- Capacidad de agente autonomo: puede interactuar con terminales, sistemas de archivos y APIs para completar tareas complejas de ingenieria de software.
- Ventana de contexto larga (256K tokens) para manejar repositorios completos y conversaciones extensas.
- Multilingue: no se han publicado datos especificos sobre idiomas soportados, pero al estar basado en Qwen 3.5 es probable que soporte multiples idiomas, aunque no esta confirmado.

## Casos de uso

- Resolucion de issues en repositorios de codigo: el modelo puede analizar un issue, explorar el codigo fuente, generar un parche y verificar su correccion, gracias a su capacidad de razonamiento agéntico y su ventana de contexto de 256K tokens que permite cargar repositorios completos.
- Automatizacion de tareas de mantenimiento de software: puede ejecutar comandos de terminal, gestionar dependencias y realizar refactorizaciones de codigo de forma autonoma, reduciendo la intervencion manual en pipelines de CI/CD.
- Asistente de programacion en IDE: integrado como extension, puede generar codigo, explicar fragmentos, sugerir correcciones y ejecutar pruebas, aprovechando su modo de razonamiento para dar respuestas mas precisas.
- Generacion de repositorios completos a partir de especificaciones: el modelo puede crear la estructura de un proyecto, escribir los archivos necesarios y configurar el entorno, gracias a su entrenamiento en tareas de NL2Repo.
- Agente de soporte tecnico para desarrolladores: puede diagnosticar errores, buscar en documentacion y proponer soluciones, manteniendo contexto largo sobre la conversacion.
- Evaluacion de codigo y revision de pull requests: puede analizar cambios, detectar posibles bugs y sugerir mejoras, utilizando su capacidad de razonamiento y su conocimiento de patrones de programacion.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados en benchmarks de codificacion agéntica, comparados con otros modelos de tamaño similar:

| Benchmark | Ornith-1.0-35B | Qwen3.5-35B | Qwen3.6-35B | Gemma4-31B | Qwen3.5-397B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 64.2 | 41.4 | 52.5 | 42.1 | 53.5 |
| Terminal-Bench 2.1 (Claude Code) | 62.8 | 38.9 | 49.2 | - | 48.6 |
| SWE-bench Verified | 75.6 | 70.0 | 73.4 | 52.0 | 76.4 |
| SWE-bench Pro | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados para otros benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de SWE-bench Pro se cortaron en la model card original y no se han podido recuperar.

## Requisitos de hardware

- El modelo base en safetensors ocupa aproximadamente 69 GB en precision FP16 (estimacion a partir de 34.660 millones de parametros), por lo que requiere al menos una GPU con 80 GB de VRAM para cargarlo sin cuantizar.
- La version GGUF cuantizada permite reducir significativamente el uso de VRAM. Con cuantizacion Q4_K_M, el modelo podria ocupar alrededor de 20-25 GB, cabiendo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se han publicado mediciones exactas.
- Para cuantizaciones mas bajas (Q3, Q2), podria ejecutarse en GPUs de 16 GB, pero con perdida de precision.
- El repositorio GGUF de Unsloth incluye multiples cuantizaciones (el tamaño total del repo es 1035 GB, lo que sugiere que se incluyen todas las variantes).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte reciente para MoE), TGI, y cualquier framework compatible con GGUF.
- Se recomienda usar versiones recientes de las librerias de inferencia, ya que el modelo requiere soporte para arquitectura Qwen 3.5 MoE y parsing de razonamiento.
- Para despliegue en produccion con alta concurrencia, se recomienda vLLM o TGI con tensor parallelism en multiples GPUs.

## Comparativa con modelos similares

La siguiente tabla compara Ornith-1.0-35B con otros modelos de codificacion agéntica de tamaño similar, basandose en los benchmarks publicados en la model card:

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 (Terminus-2) | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Ornith-1.0-35B | 34.66B (MoE) | 256K | 64.2 | 75.6 | MIT |
| Qwen3.5-35B | ~35B | no disponible | 41.4 | 70.0 | no disponible |
| Qwen3.6-35B | ~35B | no disponible | 52.5 | 73.4 | no disponible |
| Gemma4-31B | ~31B | no disponible | 42.1 | 52.0 | no disponible |

Ornith-1.0-35B supera claramente a Qwen3.5-35B y Qwen3.6-35B en Terminal-Bench 2.1, y se acerca al rendimiento del modelo mucho mayor Qwen3.5-397B en SWE-bench Verified (75.6 vs 76.4). Su licencia MIT lo hace mas accesible que otros modelos con restricciones.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o limitaciones de idioma. Al estar basado en Qwen 3.5, es probable que tenga un rendimiento optimo en ingles y chino, pero no esta confirmado.
- Riesgo de alucinacion en tareas de codigo: como cualquier LLM, puede generar codigo incorrecto o inventar APIs inexistentes. Se recomienda verificar siempre las soluciones generadas.
- El modo de razonamiento ("thinking") puede aumentar la latencia en inferencia, ya que el modelo genera un bloque de pensamiento antes de la respuesta final.
- La cuantizacion GGUF puede degradar ligeramente la precision en tareas complejas de razonamiento, aunque Unsloth afirma que su tecnica Dynamic 2.0 minimiza esta perdida.
- El modelo requiere versiones recientes de las librerias de inferencia para soportar la arquitectura Qwen 3.5 MoE y el parsing de tool calls. No funcionara correctamente con versiones antiguas de llama.cpp o vLLM.
- Aunque la licencia es MIT, el modelo base (deepreinforce-ai/Ornith-1.0-35B) tambien es MIT, por lo que no hay restricciones de uso comercial conocidas.
- El tamaño del repositorio GGUF (1035 GB) indica que se incluyen muchas cuantizaciones; los usuarios deben seleccionar la adecuada para su hardware para evitar descargas innecesarias.

## Enlaces

- Repositorio HuggingFace (GGUF de Unsloth): https://huggingface.co/unsloth/Ornith-1.0-35B-GGUF
- Repositorio HuggingFace (GGUF oficial de ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.0-35B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Modelo en ModelScope: https://www.modelscope.cn/models/unsloth/Ornith-1.0-35B-GGUF
- Documentacion de Unsloth Dynamic 2.0: https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Articulo de verificacion de cuantizaciones (en japones): https://note.com/zephel01/n/n5916524fcaec

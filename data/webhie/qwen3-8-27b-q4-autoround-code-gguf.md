# webhie/Qwen3.8-27B-Q4-AutoRound-Code-GGUF

## Resumen

El modelo `webhie/Qwen3.8-27B-Q4-AutoRound-Code-GGUF` es una cuantización GGUF en formato `Q4_0` del modelo vision-lenguaje `Qwen/Qwen3.8-27B`, desarrollada por el usuario webhie utilizando el framework AutoRound de Intel. El modelo base, creado por el equipo Qwen de Alibaba, es un transformer denso de 27 000 millones de parámetros con capacidades multimodales (imagen y texto), razonamiento y una ventana de contexto nativa de 262 144 tokens. Esta versión cuantizada está diseñada para ejecutarse directamente con llama.cpp e incluye tanto el modelo de lenguaje como el proyector de visión (`mmproj-model.gguf`).

La cuantización emplea un esquema mixto: los pesos lineales principales se almacenan en `Q4_0` (bloques simétricos de 32 valores), el tensor `output.weight` se conserva en `Q6_K` y los tensores de normalización y auxiliares (como `ssm_dt`, `ssm_a`, `ssm_conv1d`) permanecen en `F32`. El proceso de calibración utilizó 512 muestras de un conjunto mixto de código, matemáticas y ciencia, con el objetivo de preservar el rendimiento en tareas de programación y razonamiento técnico. El repositorio también mantiene una capa de Multi-Token Prediction (MTP), una innovación que permite predecir varios tokens a la vez y mejorar la velocidad de inferencia.

Este lanzamiento resulta relevante porque ofrece una versión compacta y ejecutable en hardware de consumo de un modelo de 27B con visión y razonamiento, sin necesidad de transformar pesos a otros formatos. Aunque no se publican resultados de benchmarks, la elección de un conjunto de calibración orientado a código sugiere un enfoque específico para desarrolladores que necesitan asistencia en programación, análisis de imágenes y tareas agénticas de largo recorrido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | GGUF `Q4_0` mixto (output.weight en `Q6_K`, tensores auxiliares en `F32`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) + proyector de vision `mmproj-model.gguf` |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros que integra un codificador de visión para procesar imágenes junto con texto. Según la documentación del equipo Qwen, esta arquitectura está construida sobre la base de Qwen3.5 y está optimizada para tareas de codificacion, trabajo profesional, investigacion y razonamiento agéntico de largo horizonte. La ventana de contexto nativa alcanza los 262 144 tokens, lo que permite manejar documentos extensos o conversaciones multi-turno muy largas.

La cuantizacion se realizó con Intel AutoRound version 0.14.2, utilizando la receta `auto-round-best` con 1000 iteraciones y 512 muestras de calibracion. El conjunto de calibracion, denominado `mixed-code-math-science-512.jsonl`, se compone de un 50% de trazas de codigo de Open-SWE (Python, TypeScript, Rust, JavaScript, Go, Java y PHP), un 25% de razonamiento matematico de OpenMathReasoning y un 25% de ejemplos cientificos de OpenThoughts3 (quimica organica y fisica). La secuencia de calibracion se fijó en 2048 tokens con un tamaño de lote de 1 y 8 pasos de acumulacion de gradiente. El proceso se ejecutó con `--low_gpu_mem_usage` para reducir el consumo de memoria.

El modelo cuantizado mantiene una capa de Multi-Token Prediction (MTP), que permite predecir varios tokens simultáneamente y acelera la generacion. En el archivo GGUF del lenguaje se distinguen 505 tensores `Q4_0` (26 046 627 840 parametros), 1 tensor `Q6_K` correspondiente a `output.weight` (1 271 398 400 parametros) y 360 tensores `F32` (2 671 616 parametros) para normalizacion y componentes auxiliares. El proyector de vision se exporta por separado en `mmproj-model.gguf` con 334 tensores `F32`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de proposito general con capacidades de razonamiento paso a paso, especialmente en dominios tecnicos como matematicas y ciencias.
- Vision multimodal: acepta imagenes como entrada a traves del proyector `mmproj-model.gguf`, permitiendo tareas de descripcion, analisis y respuesta a preguntas visuales.
- Multi-Token Prediction (MTP): la capa MTP integrada permite predecir varios tokens a la vez, reduciendo la latencia de generacion en comparacion con modelos de un solo token.
- Modo de pensamiento (thinking): la plantilla de chat del modelo activa el razonamiento explicito por defecto, aunque puede desactivarse mediante opciones de llama.cpp (`enable_thinking`).
- Soporte para agentes: segun la documentacion de Cloudflare y Unsloth, el modelo base esta disenado para cargas de trabajo agénticas, lo que incluye planificacion de tareas y ejecucion de multiples pasos.
- Procesamiento de video (dependiente de la compilacion): el repositorio indica que la entrada de video es posible si la compilacion de llama.cpp incluye soporte para ello, aunque no se detalla el formato.

## Casos de uso

- Asistente de programacion en local: el modelo puede completar codigo, depurar errores y explicar fragmentos en multiples lenguajes (Python, TypeScript, Rust, etc.) gracias a su calibracion orientada a codigo. Se ejecuta con llama.cpp en una GPU de consumo, por ejemplo con `llama-cli -m Qwen3.8-27B-Q4_0-AutoRound-Code.gguf -ngl 999`.
- Analisis de imagenes tecnicas: con el proyector de vision, el modelo puede interpretar diagramas, capturas de pantalla de errores o esquemas de arquitectura, y generar descripciones o sugerencias de solucion.
- Razonamiento matematico y cientifico: su calibracion incluye ejemplos de matematicas y ciencias, por lo que resulta util para resolver problemas de calculo, fisica o quimica, tanto en entornos educativos como de investigacion.
- Agentes de automatizacion de tareas: gracias a su capacidad de razonamiento multi-paso y su contexto de 262K tokens, puede gestionar flujos de trabajo complejos, como la planificacion de proyectos, la redaccion de informes o la orquestacion de herramientas externas.
- Procesamiento de documentos largos: la ventana de contexto de 262 144 tokens permite analizar libros, manuales tecnicos o repositorios de codigo completos en una sola pasada, extrayendo informacion relevante o resumiendo contenido.
- Chat conversacional con memoria amplia: en aplicaciones de atencion al cliente o asistentes personales, el modelo mantiene el contexto de conversaciones muy largas sin perder informacion, mejorando la coherencia de las respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio indica explicitamente que no se reportan metricas de rendimiento para esta cuantizacion. Por tanto, no es posible comparar su calidad con la del modelo original ni con otras cuantizaciones.

## Requisitos de hardware

- Tamano del archivo GGUF del lenguaje: 15,72 GB; proyector de vision: 1,84 GB. En total, aproximadamente 17,6 GB de almacenamiento.
- VRAM estimada para inferencia: con cuantizacion `Q4_0`, el modelo cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) si se descargan todas las capas a la GPU (`-ngl 999`). Unsloth indica que el modelo base puede ejecutarse en 17 GB de RAM/VRAM, lo que sugiere que esta version cuantizada tambien podria funcionar en configuraciones con 16-20 GB, aunque con limitaciones de contexto.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40 GB) o superiores para aprovechar el contexto completo de 262K tokens. Para contextos mas cortos, una RTX 4080 (16 GB) podria ser suficiente con `-ngl` parcial.
- Opciones de despliegue: llama.cpp (incluido en el repositorio), y por extension Ollama, LM Studio o cualquier frontend compatible con GGUF. No se menciona soporte para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La capa MTP podria reducir la latencia, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otras cuantizaciones o modelos de tamano similar. El unico punto de referencia conocido es el modelo base `Qwen/Qwen3.8-27B`, que comparte arquitectura y parametros. Otras cuantizaciones GGUF del mismo modelo (por ejemplo, `zerodigest/Qwen3.8-27B-Uncensored-YMQ-MTP-GGUF`) existen, pero no se dispone de sus especificaciones detalladas en los datos proporcionados. Por tanto, no es posible ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Ausencia de benchmarks: al no publicarse resultados de evaluacion, el rendimiento real en tareas de codigo, vision o razonamiento es incierto. La cuantizacion `Q4_0` puede introducir degradacion de calidad, especialmente en tareas complejas que requieren precision numerica.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en dominios no cubiertos por su calibracion.
- Limitaciones de vision: el proyector de vision se almacena en `F32`, lo que incrementa el uso de memoria. Ademas, el procesamiento de video depende de la compilacion especifica de llama.cpp y no esta garantizado.
- Contexto largo y memoria: aunque la ventana nativa es de 262 144 tokens, utilizarla por completo requiere una cantidad significativa de memoria para la cache de atencion (KV cache), lo que puede superar la capacidad de GPUs de 24 GB si no se limita el contexto.
- Idiomas no especificados: no se indica que idiomas soporta el modelo. Aunque el modelo base de Qwen suele ser multilingue, esta cuantizacion no lo confirma.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero es necesario revisar la licencia del modelo base original para asegurar el cumplimiento completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webhie/Qwen3.8-27B-Q4-AutoRound-Code-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentacion de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Guia de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Framework AutoRound: https://github.com/intel/auto-round

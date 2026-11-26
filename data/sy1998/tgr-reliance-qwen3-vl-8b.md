# sy1998/TGR-Reliance-Qwen3-VL-8B

## Resumen

TGR-Reliance-Qwen3-VL-8B es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, desarrollado por el usuario sy1998, orientado especificamente a la comprension de video con anclaje temporal (temporal grounding). El modelo resuelve un problema concreto: hacer que el razonamiento sobre video se apoye de forma explicita en segmentos temporales verificables, en lugar de responder directamente a partir de una representacion global del video. Para ello, primero emite los intervalos de tiempo que contienen la evidencia y despues responde la pregunta, de modo que la respuesta queda ligada a esos intervalos.

El ajuste sigue la receta descrita en el articulo *When Does Temporal Grounding Help Video Reasoning?*: un entrenamiento supervisado (SFT) sobre el conjunto EviCe seguido de un refuerzo con GRPO cuya recompensa se calcula unicamente sobre el anclaje temporal (R_IoU). El modelo base aporta la arquitectura y el conocimiento multimodal; el ajuste anade el comportamiento de "pensar primero en segmentos, responder despues".

Con 8.767.123.696 parametros y un repositorio de 17,5 GB en safetensors, es un modelo de escala media-alta que hereda la ventana de contexto y el muestreo de video del Qwen3-VL original. Su relevancia actual radica en que aborda una de las criticas mas habituales a los modelos de video: la falta de trazabilidad de las respuestas y la dificultad de auditar si el modelo realmente ha mirado el fragmento correcto del video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-lenguaje con soporte de video |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imagenes y video junto con texto. El ajuste no modifica la arquitectura base: se aplica sobre los pesos del modelo instructivo. El entrenamiento sigue dos fases: primero un ajuste supervisado (SFT) sobre el dataset EviCe, y despues un refuerzo con GRPO en el que la unica recompensa es R_IoU, es decir, la calidad del solapamiento entre los intervalos temporales predichos y los intervalos de referencia que contienen la evidencia. No se recompensa directamente la correccion de la respuesta final, sino el anclaje temporal, lo que empuja al modelo a localizar el fragmento relevante antes de contestar.

La innovacion tecnica principal es el formato de salida estructurado: el modelo genera `<think>[s, e]</think><answer>X</answer>`, permitiendo uno o varios intervalos en el bloque de pensamiento. El muestreo de video sigue el sampler oficial de Qwen3-VL (1 fps, maximo 128 frames). La receta de evaluacion del repositorio TGR-Reliance usa vLLM 0.11.0 y transformers 4.57.1 con `--sampler qwen3 --prompt train --max_tokens 256`. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni la composicion completa del dataset EviCe.

## Capacidades

- Comprension de video con anclaje temporal: identifica uno o varios intervalos `[inicio, fin]` en segundos que contienen la evidencia para responder.
- Razonamiento guiado por evidencia: la respuesta final se apoya en los segmentos temporales emitidos previamente en `<think>`.
- Respuesta a preguntas de opcion multiple sobre video (video-text-to-text).
- Salida estructurada con etiquetas `<think>` y `<answer>`, apta para parseo automatico.
- Capacidades heredadas del modelo base Qwen3-VL-8B-Instruct en vision-lenguaje (no detalladas en la model card del ajuste).
- Soporte de multiples intervalos de evidencia en una misma respuesta.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modo thinking extendido mas alla del anclaje temporal.

## Casos de uso

- Auditoria de respuestas sobre video: en entornos donde hay que justificar por que un modelo respondio una opcion, el bloque `<think>` aporta los intervalos exactos que sustentan la respuesta, lo que permite revision humana o verificacion automatica por IoU contra anotaciones.
- Busqueda y recuperacion de momentos concretos: dado un video largo y una pregunta, el modelo devuelve el tramo temporal relevante, util para construir indices de momentos o para saltar directamente al fragmento en un reproductor.
- Control de calidad de anotaciones de video: comparar los intervalos predichos con los anotados por humanos para detectar desacuerdos y priorizar revisiones.
- Evaluacion de modelos de video en pipelines de investigacion: sirve como referencia de anclaje temporal en experimentos que comparan estrategias de razonamiento sobre video, gracias a su formato de salida reproducible.
- Moderacion y verificacion de contenido audiovisual: localizar el segmento que contiene la evidencia de un evento descrito en una pregunta de opcion multiple, con trazabilidad del tramo.
- Docencia y formacion con material audiovisual: generar preguntas de opcion multiple con el fragmento de video que las responde, facilitando la creacion de materiales con referencia temporal.
- Analisis de videos de vigilancia o de procesos: responder consultas sobre que ocurre y cuando, devolviendo el intervalo concreto para su inspeccion.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Benchmark | Accuracy | R@0.3 | ReGAP |
|---|---|---|---|
| ReliaNeedle | 64,6 | 75,7 | 1,225 |
| Video-Oasis | 36,65 | no disponible | 0,590 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni curvas de rendimiento por tamano de video.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): aproximadamente 17,5 GB solo para pesos, mas memoria para el procesador de vision, el cache KV y los frames muestreados; en la practica se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con margen ajustado; para lotes grandes o videos de 128 frames conviene A100/H100.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con bf16 y lotes pequenos, o en GPUs de 16 GB solo si se aplica cuantizacion (el autor no publica pesos cuantizados).
- Opciones de despliegue: transformers (version de referencia 4.57.1) y vLLM 0.11.0, segun la receta de evaluacion del autor. No se documentan Ollama, llama.cpp ni TGI para este modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Anclaje temporal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TGR-Reliance-Qwen3-VL-8B | 8,77 B | no disponible | Si (salida `<think>` con intervalos) | Apache-2.0 | Hugging Face (17 descargas) |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | 8 B (aprox.) | no disponible | No especifico | Apache-2.0 | Hugging Face |
| Alternativas de video-VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa de rendimiento frente al modelo base u otras alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho con muy poca adopcion (17 descargas, 0 likes en el momento de la consulta) y sin validacion externa conocida.
- El rendimiento en Video-Oasis es bajo en accuracy (36,65), lo que sugiere limitaciones en tareas de video mas alla de las de tipo needle o de evidencia localizada.
- El formato de salida esta acoplado a un prompt concreto (system message y sufijo de instruccion); usarlo con otros prompts puede degradar el anclaje temporal y la respuesta.
- La recompensa de entrenamiento se centra solo en R_IoU, por lo que el modelo puede priorizar la localizacion temporal sobre la correccion semantica de la respuesta.
- No se documentan sesgos conocidos, pero hereda los del modelo base Qwen3-VL-8B-Instruct, no evaluados en esta ficha.
- Riesgo de alucinacion de intervalos temporales cuando la evidencia es ambigua o el video es largo; el muestreo a 1 fps con maximo 128 frames limita la resolucion temporal en videos extensos.
- Idiomas soportados no documentados; el prompt de referencia esta en ingles.
- Licencia Apache-2.0, permisiva para uso comercial, pero sin garantias del autor sobre idoneidad en produccion.
- No hay pesos cuantizados publicados, lo que complica el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sy1998/TGR-Reliance-Qwen3-VL-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Repositorio de evaluacion TGR-Reliance: https://github.com/shuyansy/TGR-Reliance
- Articulo de referencia *When Does Temporal Grounding Help Video Reasoning?*: no disponible como enlace directo en la informacion proporcionada.

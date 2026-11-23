# tencent/WeMM-Video-2B

## Resumen

WeMM-Video-2B es un modelo multimodal denso de 2B (checkpoint base de la familia WeMM-Video, desarrollada por Tencent) orientado a la comprensión y el razonamiento conjunto de audio y vídeo. Acepta entradas de texto, imagen, audio y vídeo (con o sin pista de sonido) y genera respuestas en texto, en inglés y chino. El modelo combina codificadores de visión y de audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto, con marcas de tiempo en los fotogramas de vídeo.

La familia WeMM-Video se preentrenó con aproximadamente 1,2 billones de tokens multimodales y después se afinó con post-entrenamiento multi-profesor OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. Aunque el nombre comercial es "2B", los pesos reales en safetensors suman 3.283.624.264 parámetros (≈3,28B), lo que es relevante para dimensionar hardware y memoria.

Es relevante ahora porque cubre una tarea poco servida por modelos pequeños: entender vídeo con su banda sonora original de forma conjunta (describir eventos, transcribir habla y razonar sobre lo visto y lo oído), con licencia Apache 2.0, variantes cuantizadas publicadas y soporte en vLLM y SGLang con parches específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de vision y audio que alimentan tokens al modelo de lenguaje (base qwen3_5, custom_code) |
| Parametros totales | 3.283.624.264 (≈3,28B) segun safetensors; el autor lo denomina "dense 2B" |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explicita; la receta de vLLM de ejemplo usa `--max-model-len 8192` |
| Tipos de cuantizacion | BF16 (principal), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Ingles y chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 6,12 GiB de ficheros de pesos; repo 6,6 GB); variantes GGUF, AWQ y NVFP4 |

## Arquitectura y entrenamiento

Arquitectura multimodal compuesta: codificadores de vision y de audio independientes convierten imagen, audio y fotogramas de vídeo en tokens que el modelo de lenguaje (etiquetado como qwen3_5 y con `custom_code` en Transformers) procesa junto a los tokens de texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite razonar sobre la secuencia temporal. El procesador admite modos `video` (solo fotogramas) y `video_audio` (fotogramas más banda sonora original), con parámetros de muestreo como `fps`, `min_frames`, `max_frames` y `total_pixels`.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. El post-entrenamiento combina tres fases: OPD con múltiples profesores, MrDPO con penalización anti-repetición y aprendizaje por refuerzo con especialistas. El modelo expone un modo de razonamiento opcional mediante `enable_thinking` en la plantilla de chat (instruct directo por defecto, thinking cuando se activa).

## Capacidades

- Comprensión conjunta de vídeo y audio: descripción de eventos combinando lo visible con la banda sonora original.
- Transcripción de habla presente en el audio o en la pista de sonido de un vídeo.
- Razonamiento sobre lo visto y lo oído (preguntas que requieren correlacionar imagen y sonido).
- Entrada de vídeo silencioso, audio independiente, imagen y texto por separado.
- Generación de texto en inglés y chino.
- Modo de razonamiento conmutable (`enable_thinking=True/False`) en la plantilla de chat.
- Razonamiento aritmético/textual básico (el ejemplo de la model card resuelve un cálculo horario).
- No se documenta soporte de tool calling ni de uso agéntico multi-paso en la información disponible.

## Casos de uso

- Indexación y descripción automática de archivos audiovisuales: el modelo recibe fotogramas muestreados (por ejemplo, `fps=1.0`, entre 4 y 16 fotogramas) junto a la pista de audio y genera descripciones buscables de lo que ocurre y se dice.
- Transcripción y resumen de reuniones o clases grabadas: combinando `video_audio` con la pista original se obtiene transcripción del habla y síntesis del contenido, útil para actas automáticas.
- Moderación y análisis de contenido en plataformas de vídeo: detección de eventos descritos en imagen y audio (por ejemplo, lenguaje soñado en una escena) para colas de revisión.
- Accesibilidad: generación de descripciones de escenas y subtitulado asistido para vídeos en inglés o chino, aprovechando la entrada conjunta de imagen y sonido.
- Asistencia a personas con discapacidad auditiva o visual: resúmenes de lo que se ve y se oye en un clip, con respuestas en el idioma del usuario (en/zh).
- Análisis de material de archivo histórico o científico: el ejemplo de la model card procesa imágenes y audios del Apolo 11 para describir escenas y transcribir discursos.
- Prototipado en local o en GPU de consumo: las variantes GGUF Q4_K_M y AWQ W4A16 permiten desplegar el modelo en entornos con VRAM limitada para pruebas de concepto de comprensión audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos BF16: 6,12 GiB de ficheros de pesos; hay que sumar memoria para entradas multimedia y caché de generación. El repo completo ocupa 6,6 GB.
- VRAM estimada: no disponible de forma oficial; para BF16 conviene planificar por encima de los 6,12 GiB de pesos más overhead de activaciones, caché KV y tokens de medios.
- Variantes cuantizadas publicadas (FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16) reducen el espacio de pesos y facilitan el ajuste en GPUs de menor VRAM; no se proporcionan cifras exactas de VRAM por variante.
- GPU recomendadas: no disponible en la información; por tamaño, GPUs de datacenter (A100, H100) son holgadas para BF16, y GPUs de consumo con suficiente VRAM pueden usar las variantes cuantizadas.
- Despliegue: Transformers (`AutoModelForImageTextToText` con `trust_remote_code=True`), vLLM parcheado (0.18.0 y 0.31.0 para BF16), SGLang con runtime WeMM BF16, y GGUF (previsiblemente vía llama.cpp/Ollama, aunque no se documenta explícitamente).
- En vLLM la receta de ejemplo limita medios por prompt (`image:4`, `video:2`, `audio:2`), usa `--max-model-len 8192`, desactiva prefix caching y fija `mamba-ssm-cache-dtype float32`; requiere el parche de runtime WeMM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada; la comparativa cuantitativa no está disponible. A nivel cualitativo, el modelo se distingue por aceptar vídeo con audio original de forma conjunta en un tamaño compacto (≈3,28B parámetros reales) y por publicar variantes cuantizadas y recetas de serving para vLLM/SGLang.

| Modelo | Parametros | Contexto | Entrada audio+video | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-2B | 3.283.624.264 | No disponible (receta vLLM usa 8192) | Si | Apache 2.0 | Hugging Face, variantes cuantizadas |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede describir eventos o transcribir habla de forma incorrecta, especialmente con audio ruidoso o fotogramas escasos.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con datos web multimodales a gran escala, es probable que hereda sesgos de esos datos.
- Contexto: la longitud de contexto no está declarada; la receta de serving usa 8192 tokens, lo que limita la cantidad de medios y texto por petición.
- Muestreo de vídeo: el rendimiento depende de `fps`, `min_frames`, `max_frames` y `total_pixels`; valores bajos pueden perder eventos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los codificadores y del modelo base (qwen3_5) y de los datasets de entrenamiento.
- Despliegue: requiere `trust_remote_code=True` y, para vLLM/SGLang, parches de runtime específicos de WeMM; no es plug-and-play en stacks estándar sin esos parches.
- No se documenta soporte de tool calling ni de agentes; no asumir esas capacidades en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Visión general del proyecto: https://github.com/Tencent/WeMM-Video#overview
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Perfiles de runtime: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#runtime-profiles
- Receta vLLM: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#serve-with-vllm
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-2B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-2B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-2B-NVFP4

# tencent/WeMM-Video-2B-FP8

## Resumen

WeMM-Video-2B-FP8 es la variante cuantizada en FP8 del modelo multimodal WeMM-Video-2B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés diseñado para la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada y genera respuestas en texto. La versión FP8 reduce el peso de los ficheros de pesos a 4,84 GiB, lo que facilita su despliegue en GPUs con soporte de FP8.

El modelo sigue una arquitectura de tipo transformer multimodal en la que encoders de visión y audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo llevan marcas de tiempo, lo que permite razonar sobre la secuencia temporal de los eventos. La familia fue preentrenada con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustada con técnicas de post-entrenamiento (multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado).

Su relevancia actual radica en que cubre una modalidad poco frecuente en modelos de este tamaño: la comprensión conjunta de vídeo y su banda sonora, además de vídeo silencioso, audio independiente, imágenes y texto. La cuantización FP8 con bloques de 128×128 y escalado dinámico por token de activación busca reducir los requisitos de memoria sin sacrificar la precisión de los encoders de medios, que conservan su precisión original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con encoders de vision y audio separados que alimentan tokens de medios al modelo de lenguaje (arquitectura base qwen3_5) |
| Parametros totales | 3.283.624.264 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de servicio vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 E4M3FN en bloques de 128×128 con escalado dinamico de activaciones por token en grupos de 128; encoders de medios y tensores protegidos en su precision original |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4,84 GiB de ficheros de pesos; repositorio de 5,2 GB) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que encoders de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que habilita el razonamiento sobre la dimensión temporal de los eventos audiovisuales. El modelo base pertenece a la familia de arquitecturas qwen3_5, según los tags del repositorio.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. Posteriormente se aplicó un post-entrenamiento en varias fases: multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo con especialistas. La variante FP8 cuantiza selectivamente los pesos lineales del modelo de lenguaje en E4M3FN con bloques de 128×128 y escalado dinámico de activaciones por token, manteniendo los encoders de medios y ciertos tensores protegidos en su precisión original. El checkpoint fue validado con carga completa de pesos y generación en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo entradas de texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la banda sonora original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto como entradas individuales.
- Generación de respuestas en chino e inglés.
- Modo de razonamiento configurable (`enable_thinking` en el procesador, con opción de desactivarlo).
- Soporte de conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Integración con API compatible con OpenAI a través del servidor vLLM parcheado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Descripción y resumen de vídeo con audio: el modelo puede procesar fotogramas junto con la banda sonora para generar descripciones de eventos y resúmenes de contenido audiovisual, aprovechando las marcas de tiempo de los fotogramas.
- Transcripción y análisis de habla en vídeo: al aceptar vídeo con sonido, puede transcribir el habla y relacionarla con lo que ocurre visualmente en la escena.
- Accesibilidad de contenido multimedia: generación de descripciones textuales de vídeos para personas con discapacidad visual, combinando información visual y sonora.
- Análisis de reuniones o clases grabadas: procesamiento de audio y vídeo para extraer quién habla, qué se muestra en pantalla y el contenido de la exposición en inglés o chino.
- Moderación y etiquetado de contenido audiovisual: clasificación y descripción automática de clips para pipelines de catalogación de medios.
- Asistentes conversacionales multimodales: integración en un servidor vLLM con API compatible con OpenAI para atender consultas que incluyan imágenes, audio o vídeo en entornos de atención al usuario.
- Procesamiento por lotes de archivos de audio: transcripción y razonamiento sobre audio independiente en flujos de trabajo de documentación o subtitulado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros de pesos FP8 ocupan 4,84 GiB; con overhead de runtime, caché KV y procesamiento de medios se requiere previsiblemente más, aunque no se especifica una cifra oficial en la información disponible.
- GPU recomendadas: el modelo fue validado en una NVIDIA L20; el servicio vLLM requiere una GPU con soporte de FP8.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada.
- Opciones de despliegue: Transformers 5.2.0 con PyTorch 2.10.0+cu129 y `trust_remote_code=True`; vLLM 0.18.0 parcheado (receta oficial con `--max-model-len 8192`, límites multimodales y `--mamba-ssm-cache-dtype float32`); imágenes Docker y perfiles de dependencias descritos en la guía de servicio del proyecto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (comprensión audiovisual bilingüe de ~2-3B parámetros).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, es susceptible de producir descripciones inexactas de contenido audiovisual.
- Limitaciones de contexto o idioma: solo se declaran inglés y chino; el contexto máximo no se especifica, y el ejemplo de servicio usa 8192 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica revisar el código remoto antes de desplegarlo en producción.
- Requiere un parche específico de vLLM 0.18.0 y una GPU con soporte FP8 para el servicio; el despliegue con versiones no parcheadas no está garantizado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- La cuantización FP8 puede introducir degradaciones de precisión respecto al modelo base en tareas sensibles, aunque los encoders de medios conservan su precisión original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers

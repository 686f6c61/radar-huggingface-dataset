# tencent/WeMM-Video-4B

## Resumen

WeMM-Video-4B es un modelo multimodal denso de la familia WeMM-Video, desarrollado por Tencent, disenado para la comprension y el razonamiento conjunto de audio y video. Acepta texto, imagenes, audio y video como entradas y genera respuestas de texto en chino e ingles. El checkpoint se publica bajo licencia Apache 2.0 y esta pensado para tareas que requieren correlacionar lo que se ve con lo que se escucha en un mismo clip.

La arquitectura combina codificadores de vision y de audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto; los fotogramas de video llevan marcas temporales. El modelo fue preentrenado con aproximadamente 1,2 billones de tokens multimodales y posteriormente ajustado con tecnicas de post-entrenamiento que incluyen OPD multi-profesor, MrDPO anti-repeticion y aprendizaje por refuerzo especializado.

Con 5.611.749.896 parametros totales y pesos BF16 de 10,45 GiB, el modelo se posiciona como una opcion de tamano medio para despliegues de comprension audiovisual. Su relevancia actual radica en la escasez de modelos abiertos que integren audio y video de forma nativa con soporte bilingue chino-ingles y variantes cuantizadas listas para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de vision y audio alimentando un modelo de lenguaje (tag `qwen3_5`) |
| Parametros totales | 5.611.749.896 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible en la model card; las recetas de servicio de vLLM y SGLang usan `--max-model-len 8192` y `--context-length 8192` |
| Tipos de cuantizacion | BF16 (principal), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variantes GGUF y cuantizadas publicadas por separado |

## Arquitectura y entrenamiento

WeMM-Video-4B sigue una arquitectura multimodal en la que codificadores independientes de vision y de audio transforman imagenes, fotogramas de video y pistas de sonido en tokens que el modelo de lenguaje procesa de forma conjunta con el texto. Los fotogramas de video incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia de eventos y alinearlos con lo que se escucha en la banda sonora. El tag del modelo indica una base derivada de la familia Qwen 3.5, aunque la model card no detalla la configuracion interna de capas, dimensiones ni cabezas de atencion.

El preentrenamiento se realizo sobre aproximadamente 1,2 billones de tokens multimodales. La fase de post-entrenamiento combina tres tecnicas: OPD (destilacion multi-profesor), MrDPO orientado a mitigar la repeticion en las respuestas y aprendizaje por refuerzo con especialistas. La model card no especifica la composicion exacta del dataset ni los detalles de los procesos de RLHF/DPO mas alla de estas referencias. El modelo admite dos modos de chat: instructivo por defecto (`enable_thinking=False`) y modo razonamiento (`enable_thinking=True`).

## Capacidades

- Generacion de texto y razonamiento multimodal a partir de entradas de texto, imagen, audio y video.
- Comprension audiovisual conjunta: describir eventos combinando fotogramas y banda sonora original.
- Transcripcion de voz y resumen del habla contenida en un clip.
- Razonamiento sobre video silencioso, audio independiente, imagenes y texto.
- Respuestas en chino e ingles.
- Modo de razonamiento explicito activable mediante `enable_thinking=True` en la plantilla de chat.
- Procesamiento de video con control de muestreo (`fps`, `min_frames`, `max_frames`, `total_pixels`).
- Soporte de multiples medios por prompt (la configuracion de vLLM documentada permite hasta 4 imagenes, 2 videos y 2 audios por prompt).
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede procesar el video junto con el audio original para describir lo ocurrido en pantalla y resumir lo que se ha dicho, aprovechando el procesamiento conjunto de fotogramas y banda sonora.
- Generacion de subtitulos y transcripciones contextualizadas: al recibir la pista de audio y los fotogramas, puede transcribir el habla y correlacionarla con lo que se muestra, util para accesibilidad y archivo de medios.
- Moderacion y catalogacion de contenido audiovisual: permite describir escenas y resumir el audio de clips subidos por usuarios para clasificacion o revision automatica en plataformas de video.
- Analisis de material de vigilancia o industrial: con video silencioso o con audio ambiente, puede describir eventos en secuencia gracias a las marcas temporales de los fotogramas.
- Asistentes de accesibilidad: dado un fragmento de video, puede narrar lo que ocurre y sintetizar la informacion sonora relevante para personas con discapacidad visual o auditiva.
- Procesamiento de archivo historico y periodistico: con las variantes GGUF o AWQ puede desplegarse en infraestructura modesta para describir y transcribir clips de archivo de forma masiva.
- Analisis de contenido educativo: descripcion y resumen de clases grabadas o tutoriales, combinando lo mostrado en pantalla con la explicacion oral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 11,2 GB solo para pesos (10,45 GiB de ficheros de pesos), mas cache de generacion y memoria para las entradas multimedia; la model card recomienda dimensionar la GPU para los pesos completos, las entradas de medios y la cache de generacion.
- Variantes cuantizadas: FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16 reducen el requisito de memoria respecto a BF16; la model card no publica cifras exactas de VRAM por variante.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por el tamano de pesos en BF16, encaja en GPU profesionales (A100, H100) y en GPUs de consumo con 16 GB o mas de VRAM para BF16, o menos para las variantes cuantizadas.
- Cabe en GPU de consumo: si, en principio, con 16 GB o mas para BF16 y con menos memoria usando AWQ, GGUF Q4_K_M o NVFP4, aunque no se documentan cifras verificadas.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), vLLM parcheado (0.18.0 y 0.31.0 para BF16), SGLang parcheado (0.5.16 o 0.5.19) y variantes GGUF para llama.cpp/Ollama. Se requiere instalar el parche de runtime de WeMM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| WeMM-Video-4B | 5.611.749.896 | no disponible (recetas usan 8192) | en, zh | Apache 2.0 | Multimodal audio+video, variantes cuantizadas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al entrenarse con datos web y multimodales es esperable heredar sesgos de esas fuentes.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; la existencia de MrDPO anti-repeticion sugiere que la repeticion fue un problema identificado durante el desarrollo, pero no elimina el riesgo de contenido inventado.
- Limitaciones de idioma: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto: no se publica de forma explicita; las recetas de servicio usan 8192 tokens, lo que limita el volumen de medios y texto por peticion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del codigo personalizado (`trust_remote_code`) y los parches de runtime requeridos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del modelo; debe auditarse antes de desplegar en produccion.
- El despliegue en vLLM y SGLang exige versiones parcheadas concretas y un parche de runtime especifico de WeMM, lo que anade complejidad operativa.
- No se documenta soporte de tool calling ni de agentes multi-paso.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Coleccion de modelos: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-4B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-4B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-4B-NVFP4
- Guia de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalacion del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md

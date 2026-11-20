# tencent/WeMM-Video-35BA3B-NVFP4

## Resumen

WeMM-Video-35BA3B-NVFP4 es la variante cuantizada en NVFP4 W4A16 del modelo multimodal WeMM-Video-35B-A3B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés orientado a la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada, y genera respuestas en texto. La familia WeMM-Video está diseñada específicamente para combinar fotogramas de vídeo con su banda sonora original, de modo que el modelo puede describir eventos, transcribir voz y razonar sobre lo que se ve y se oye de forma simultánea.

El checkpoint aquí descrito no es el modelo original en BF16, sino una exportación cuantizada con ModelOpt en precisión mixta: las matrices de las capas feed-forward de expertos (enrutados y compartidos) se almacenan en NVFP4 con grupo de 16, mientras que las activaciones y el resto de tensores (atención, normalizaciones) mantienen su precisión de origen. El objetivo es reducir el peso en disco y los requisitos de memoria en inferencia manteniendo la calidad del modelo base.

Con 36.177.564.536 parámetros totales reales (según los safetensors) y un repo de 25,9 GB, esta variante está pensada para servirse con una versión parcheada de vLLM 0.31.0 y los backends Marlin sobre hardware SM120. Su relevancia actual radica en que permite desplegar un modelo audiovisual de gran tamaño en entornos con memoria limitada, aunque a costa de una integración de runtime más específica que la del checkpoint BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de visión y audio que alimentan tokens multimedia al modelo de lenguaje; familia `wemm_qwen3_5_moe` (MoE, según tags) |
| Parametros totales | 36.177.564.536 |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`, pero no se especifica como contexto máximo del modelo) |
| Tipos de cuantizacion | NVFP4 W4A16 (ModelOpt Mixed Precision): pesos FF de expertos en NVFP4 grupo-16, activaciones en BF16; resto de tensores en precisión original |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (25,9 GB de repo; 24,11 GiB de ficheros de pesos) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y de audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales (timestamps), lo que permite al modelo razonar sobre la secuencia temporal de los eventos. Los tags del repositorio indican una arquitectura de mezcla de expertos (`wemm_qwen3_5_moe`), coherente con la nomenclatura "35B-A3B" del modelo base, aunque el número exacto de parámetros activos no se detalla en la información disponible.

El entrenamiento se realizó en dos fases: un preentrenamiento sobre aproximadamente 1,2 billones (1.2T) de tokens multimodales, seguido de un post-entrenamiento que combina multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo con especialistas. La innovación técnica destacable de esta variante concreta es la cuantización NVFP4 W4A16 con ModelOpt Mixed Precision y el uso de backends Marlin para las capas cuantizadas, que permite servir los pesos en hardware SM120 con un parche específico de vLLM 0.31.0.

## Capacidades

- Comprensión conjunta de audio y vídeo: combina fotogramas con la banda sonora para describir eventos, transcribir habla y razonar sobre lo visto y oído.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo Thinking: se activa con `chat_template_kwargs.enable_thinking=True`; por defecto el template opera en modo Instruct.
- Procesamiento de múltiples medios por prompt (el ejemplo de servicio limita a 4 imágenes, 2 vídeos y 2 audios por petición).
- Control de muestreo de vídeo mediante `fps`, `min_frames`, `max_frames` y `total_pixels` en la petición.
- API compatible con OpenAI Chat Completions a través de vLLM (texto, `image_url`, `audio_url`, `video_url`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo recibe el vídeo con su audio y puede transcribir la voz y describir lo que ocurre en pantalla, combinando ambas modalidades en una sola respuesta.
- Accesibilidad de contenido audiovisual: generación de descripciones de vídeos que incluyen tanto lo visual como los sonidos y el habla, útil para subtitulado descriptivo.
- Moderación de contenido en plataformas de vídeo: análisis conjunto de imagen y sonido para detectar eventos descritos verbalmente o mostrados en pantalla.
- Transcripción y análisis de audio independiente: procesamiento de ficheros de audio sueltos mediante `audio_url`, con respuestas en inglés o chino.
- Indexación y búsqueda semántica de archivos multimedia: extracción de descripciones y transcripciones que alimenten un índice de búsqueda sobre vídeos y audios.
- Asistentes bilingües de análisis documental con imágenes: interpretación de capturas, diagramas o documentos escaneados junto a preguntas en texto, con salida en en o zh.
- Investigación en comprensión audiovisual: evaluación y experimentación con un modelo de referencia cuantizado para estudiar el impacto de NVFP4 en tareas de razonamiento multimodal.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| MMAR1000 | 72,1% (721/1000) | Solo audio, audio completo a 16 kHz, modo Instruct, decodificación greedy, hasta 256 tokens de salida, vLLM 0.31 parcheado sobre PRO 5000, TP 1 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras comparativas con modelos similares.

## Requisitos de hardware

- Peso en disco: 24,11 GiB de ficheros de pesos; repo total de 25,9 GB.
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño de pesos NVFP4 (24,11 GiB) más activaciones BF16 y cachés exige, como mínimo, GPUs con memoria superior a esa cifra.
- GPU de referencia: configuración SM120 (arquitectura Blackwell) con backends Marlin; la validación se realizó con TP 1 sobre "PRO 5000".
- GPU consumer: no disponible confirmación de que quepa en GPUs de consumo; el requisito de SM120 y Marlin limita el hardware compatible.
- Despliegue: vLLM 0.31.0 parcheado con ModelOpt Mixed Precision y Marlin; requiere `--trust-remote-code`, `--quantization modelopt_mixed`, `--linear-backend marlin`, `--moe-backend marlin`.
- El checkpoint no carga directamente en Transformers; para ello debe usarse el checkpoint BF16 correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WeMM-Video-35BA3B-NVFP4 (este) | 36,18B | no disponible | Apache 2.0 | safetensors NVFP4 | Cuantizado, requiere vLLM parcheado |
| WeMM-Video-35BA3B (BF16) | no disponible | no disponible | Apache 2.0 | safetensors BF16 | Carga directa en Transformers |
| Otros modelos audiovisuales comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- El checkpoint NVFP4 no es cargable directamente en Transformers; requiere el runtime parcheado (vLLM 0.31.0 + Marlin) y hardware SM120 para la configuración de referencia.
- La cuantización NVFP4 de los pesos FF puede introducir degradación de calidad frente al modelo BF16; no se publican comparativas de rendimiento entre ambas variantes.
- Riesgo de alucinación: no se documenta en la información disponible, pero es inherente a los modelos generativos multimodales.
- Sesgos conocidos: no documentados en la información proporcionada.
- Límites de contexto y de medios por prompt: el ejemplo de servicio restringe a 4 imágenes, 2 vídeos y 2 audios por petición y a 8192 tokens de longitud de modelo; conviene validar los límites reales en producción.
- Licencia Apache 2.0 permite uso comercial, pero los componentes de terceros quedan sujetos a sus términos originales; revisar la atribución en el repositorio del proyecto.
- La validación publicada se limita a cinco comprobaciones de generación y una ejecución de MMAR1000; la cobertura de pruebas es reducida.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-NVFP4
- Modelo base BF16: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de instalación del parche: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md#manual-install-and-patch
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#runtime-profiles
- Receta vLLM NVFP4: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#nvfp4
- Ejemplo de petición de vídeo: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md#send-a-video-request
- Visión general del proyecto: https://github.com/Tencent/WeMM-Video#overview
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE

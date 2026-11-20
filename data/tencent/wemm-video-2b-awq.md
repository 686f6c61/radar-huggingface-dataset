# tencent/WeMM-Video-2B-AWQ

## Resumen

WeMM-Video-2B-AWQ es la variante cuantizada en AWQ W4A16 del modelo multimodal WeMM-Video-2B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés orientado a la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo (tanto fotogramas mudos como vídeo con su pista de sonido original) y genera respuestas en texto. El checkpoint publicado emplea la arquitectura `qwen3_5` como base del modelo de lenguaje, con codificadores separados de visión y audio que convierten los medios en tokens que el LLM procesa junto al texto.

La relevancia de esta variante concreta reside en la cuantización: los pesos de las capas feed-forward del modelo de lenguaje se almacenan en INT4 AWQ con grupos de 128 en formato compressed-tensors, mientras que las activaciones y los pesos de atención permanecen en BF16. El repositorio ocupa 5,2 GB y los pesos cuantizados suman 4,86 GiB, lo que reduce de forma significativa el espacio en disco y la memoria necesaria frente al modelo base de 3.283.624.264 parámetros totales.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y está pensado para despliegues que requieran comprensión audiovisual con contexto de vídeo (fotogramas con marcas de tiempo) y transcripción de voz. Su puesta en marcha exige, no obstante, un runtime parcheado (vLLM 0.18.0 con el parche de WeMM) o Transformers 5.2.0 con `compressed-tensors==0.13.0`, además de un override en memoria de los tensores objetivo de la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM base `qwen3_5`) con codificadores separados de visión y audio |
| Parametros totales | 3.283.624.264 |
| Parametros activos | no disponible (no se indica que sea MoE; el checkpoint menciona `shared_expert` en los targets de cuantización, pero no se confirma la naturaleza MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio de vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16: INT4 grupo-128 en capas feed-forward del LLM; activaciones y pesos de atención en BF16; formato compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite razonar sobre la secuencia temporal de los eventos. El checkpoint está construido sobre la arquitectura `qwen3_5` y expone la pipeline `image-text-to-text`, con soporte de entrada de texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora.

La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y posteriormente se ajustó con multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. La variante AWQ cuantiza únicamente los pesos feed-forward del modelo de lenguaje (proyecciones gate, up y down, incluyendo expertos y shared_expert según los targets del manifiesto) a INT4 con grupos de 128, manteniendo el resto en BF16. El cargador de Transformers descomprime estos tensores a BF16 en memoria, por lo que hay que presupuestar memoria para los pesos descomprimidos y no solo para el tamaño del repositorio.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la pista de sonido original para describir eventos y razonar sobre lo que se ve y se oye.
- Transcripción de voz a partir del audio del vídeo o de audio independiente.
- Comprensión de vídeo mudo (solo fotogramas, con marcas de tiempo).
- Comprensión de imágenes y respuesta a preguntas visuales.
- Procesamiento de audio independiente.
- Generación de texto y razonamiento en chino e inglés.
- Entrada multimodal combinada: texto, imagen, audio, vídeo y vídeo con audio en una misma petición.
- Modo thinking controlable mediante `enable_thinking` en la plantilla de chat (el ejemplo de la model card lo desactiva explícitamente).
- Servicio mediante API compatible con OpenAI a través de vLLM parcheado, con límites configurables por prompt para imagen, vídeo y audio.

## Casos de uso

- Descripción y resumen de vídeo con audio: el modelo recibe el vídeo con su banda sonora y genera una descripción de los eventos junto con el contenido hablado, útil para indexación y catalogación de archivos audiovisuales.
- Transcripción y análisis de reuniones o clases grabadas: al aceptar vídeo con audio, puede transcribir la locución y relacionarla con lo que ocurre en pantalla (pizarras, diapositivas, gestos).
- Moderación y análisis de contenido multimedia: combinando fotogramas y audio en una sola pasada, permite detectar contenido relevante en plataformas de vídeo sin pipelines separados de visión y ASR.
- Accesibilidad: generación de descripciones textuales de vídeos para personas con discapacidad auditiva o visual, aprovechando tanto la imagen como el sonido.
- Asistentes conversacionales con entrada multimedia: al servirse mediante API compatible con OpenAI en vLLM, puede integrarse en aplicaciones de chat que acepten imágenes, audio o clips de vídeo como entrada.
- Análisis de audio independiente: transcripción y razonamiento sobre ficheros de voz (por ejemplo, notas de voz o llamadas) en inglés o chino.
- Procesamiento por lotes en infraestructura modesta: gracias a la cuantización AWQ W4A16 y a sus 3,28 mil millones de parámetros, el checkpoint cabe en GPUs de gama profesional con memoria limitada, lo que facilita despliegues de bajo coste para tareas de comprensión audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos cuantizados ocupan 4,86 GiB en disco (repositorio de 5,2 GB), pero el cargador de Transformers los descomprime a BF16 en memoria; hay que presupuestar memoria para los pesos descomprimidos, no solo para el tamaño del checkpoint.
- La validación oficial del checkpoint se realizó en una única NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo generación con texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora.
- No se especifican requisitos de VRAM concretos ni GPUs recomendadas más allá de la L20 empleada en la validación; no disponible para A100, H100 o RTX 4090.
- Despliegue con Transformers: requiere `compressed-tensors==0.13.0`, `trust_remote_code=True` y un override en memoria de los targets de cuantización (las proyecciones gate/up/down del MLP del modelo de lenguaje).
- Despliegue con vLLM: requiere vLLM 0.18.0 parcheado con el parche de WeMM y la configuración compressed-tensors del checkpoint; el ejemplo oficial usa `--dtype bfloat16`, `--max-model-len 8192`, `--no-enable-prefix-caching`, `--mamba-ssm-cache-dtype float32` y límites `{"image":4,"video":2,"audio":2}` por prompt.
- Parámetros de muestreo de vídeo en el ejemplo de servicio: `fps: 2`, `min_frames: 4`, `max_frames: 16`, `total_pixels: 262144`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada. A continuación se recoge únicamente lo que puede contrastarse con el propio modelo base del que deriva esta variante.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-2B-AWQ | 3.283.624.264 | no disponible | AWQ W4A16 (INT4 grupo-128) | apache-2.0 | Hugging Face (tencent/WeMM-Video-2B-AWQ) |
| WeMM-Video-2B (base) | no disponible en la informacion | no disponible | BF16 (sin cuantizar) | apache-2.0 | Hugging Face (tencent/WeMM-Video-2B) |
| Otros modelos multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; no hay soporte documentado de castellano ni de otros idiomas.
- Riesgo de alucinación: no se documentan evaluaciones de fiabilidad ni tasas de alucinación; como modelo generativo multimodal, puede producir descripciones o transcripciones incorrectas, especialmente con audio de baja calidad o vídeo con eventos ambiguos.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Contexto: la longitud de contexto no se especifica; el ejemplo de servicio de vLLM limita `--max-model-len` a 8192, lo que condiciona la duración de vídeo y el volumen de medios procesables por petición.
- Dependencia de runtime parcheado: tanto Transformers como vLLM requieren versiones y parches específicos (Transformers 5.2.0, `compressed-tensors==0.13.0`, vLLM 0.18.0 con parche de WeMM); no es un checkpoint que funcione con un stack estándar sin ajustes.
- Memoria: aunque el checkpoint está cuantizado, la descompresión a BF16 en memoria eleva el consumo real por encima de lo que sugiere el tamaño del repositorio.
- Límites por prompt en servicio: la configuración de vLLM restringe a 4 imágenes, 2 vídeos y 2 audios por petición en el ejemplo oficial.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias del runtime parcheado y de los codificadores incluidos antes de desplegar en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks; la validación se limita a comprobaciones de carga y generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-2B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación y parche del runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
- Visión general del proyecto: https://github.com/Tencent/WeMM-Video#overview
- Manifiesto de cuantización: https://huggingface.co/tencent/WeMM-Video-2B-AWQ/blob/main/quantization_manifest.json
- Página corporativa de Tencent: https://www.tencent.com/
- Tencent en Wikipedia: https://en.wikipedia.org/wiki/Tencent

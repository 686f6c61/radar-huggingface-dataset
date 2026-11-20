# tencent/WeMM-Video-9B-AWQ

## Resumen

WeMM-Video-9B-AWQ es la variante cuantizada en AWQ W4A16 del modelo multimodal WeMM-Video-9B, desarrollado por Tencent. Se trata de una familia bilingüe chino-inglés orientada a la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo como entrada y genera respuestas de texto. El modelo resuelve el problema de integrar la información visual y sonora en un único pipeline de razonamiento, algo relevante para tareas como descripción de eventos con banda sonora, transcripción de habla o razonamiento sobre lo que se ve y se oye simultáneamente.

La arquitectura combina codificadores de visión y audio que convierten el contenido multimedia en tokens que el modelo de lenguaje procesa junto al texto, incorporando marcas temporales en los fotogramas de vídeo. El modelo base se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. Esta variante AWQ reduce el peso de los ficheros a unos 12,86 GiB y está pensada para despliegue con vLLM parcheado.

La relevancia actual del modelo radica en su enfoque audio-visual conjunto en un rango de 9B parámetros (10.488.603.384 parámetros reales según safetensors), con licencia Apache 2.0 y soporte para chino e inglés, lo que facilita su adopción en entornos de producción que necesitan procesar vídeo con sonido de forma local o autoalojada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje (familia qwen3_5) |
| Parametros totales | 10.488.603.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la receta de vLLM usa `--max-model-len 8192`) |
| Tipos de cuantizacion | AWQ W4A16 con grupo de 128 en INT4 para los pesos feed-forward del modelo de lenguaje; activaciones y pesos de atención en BF16; formato compressed-tensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

WeMM-Video sigue una arquitectura multimodal en la que codificadores de visión y audio independientes transforman imágenes, audio y fotogramas de vídeo en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó mediante multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado.

Esta variante concreta aplica cuantización AWQ W4A16 en formato compressed-tensors: los pesos feed-forward del modelo de lenguaje se cuantizan a INT4 con grupo de 128, mientras que las activaciones y los pesos de atención permanecen en BF16. El checkpoint se validó con carga completa de pesos y generación en una única NVIDIA L20 usando Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora. El despliegue con vLLM requiere la versión 0.18.0 parcheada con la configuración compressed-tensors del checkpoint.

## Capacidades

- Comprensión audio-visual conjunta: combina fotogramas de vídeo con la banda sonora original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Procesamiento de vídeo con marcas temporales en los fotogramas.
- Razonamiento multimodal multi-turno mediante plantilla de chat (`apply_chat_template`).
- Modo thinking configurable (`enable_thinking=False` en los ejemplos de la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de audio: transcripción de habla y razonamiento sobre audio.
- Capacidades de visión: descripción y razonamiento sobre imágenes.

## Casos de uso

- Descripción de vídeo con audio: el modelo procesa fotogramas junto con la banda sonora para generar descripciones de eventos, útil en indexación automática de archivos audiovisuales y generación de metadatos.
- Transcripción y análisis de habla: acepta audio independiente o la pista de sonido de un vídeo para transcribir discurso y razonar sobre el contenido, aplicable a subtitulado automático y análisis de reuniones.
- Moderación de contenido audiovisual: al combinar lo que se ve y lo que se oye, permite detectar incoherencias o contenido inapropiado en vídeos subidos por usuarios.
- Asistencia a personas con discapacidad visual: descripción en tiempo casi real de vídeo con sonido, generando narraciones en inglés o chino.
- Análisis de contenido educativo: extracción de conceptos de clases grabadas en vídeo, combinando pizarra, diapositivas y explicación oral.
- Enriquecimiento de catálogos multimedia: generación automática de descripciones, etiquetas y resúmenes para bibliotecas de vídeo y audio, aprovechando la ventana de contexto configurable (hasta 8192 tokens en la receta de vLLM).
- Investigación en razonamiento multimodal: evaluación de modelos que integran visión y audio, con pesos abiertos y licencia Apache 2.0 que facilita la experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros de pesos ocupan 12,86 GiB; hay que presupuestar memoria para los pesos descomprimidos a BF16 al cargar con Transformers (el loader descomprime los tensores feed-forward empaquetados).
- GPU recomendadas: NVIDIA L20 (validada por el autor para carga y generación con Transformers); para vLLM se requiere la versión 0.18.0 parcheada.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el tamaño de pesos (12,86 GiB) sugiere que requiere GPUs con al menos 16-24 GB de VRAM, pero no se confirma.
- Opciones de despliegue: Transformers 5.2.0 con `compressed-tensors==0.13.0`; vLLM 0.18.0 parcheado con configuración compressed-tensors; guía de serving con perfiles de dependencias e imágenes Docker en el repositorio del proyecto.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoría que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje multimodales; no se han publicado evaluaciones específicas de fidelidad en la información disponible.
- La cuantización AWQ W4A16 puede introducir degradación respecto al modelo base en BF16; el autor no publica una comparativa de rendimiento entre ambas variantes.
- El despliegue con vLLM requiere una versión parcheada concreta (0.18.0) y configuración compressed-tensors específica, lo que añade complejidad operativa.
- La carga con Transformers exige `trust_remote_code=True` y código personalizado (`custom_code`), con el consiguiente riesgo de seguridad y de compatibilidad futura.
- La receta de vLLM desactiva el prefix caching (`--no-enable-prefix-caching`) y limita los elementos multimedia por prompt (`image:4`, `video:2`, `audio:2`), lo que restringe escenarios con muchas entradas simultáneas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del runtime parcheado y del código remoto.
- Sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-AWQ
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
- Overview de la familia: https://github.com/Tencent/WeMM-Video#overview

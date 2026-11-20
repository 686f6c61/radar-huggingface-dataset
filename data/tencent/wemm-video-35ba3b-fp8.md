# tencent/WeMM-Video-35BA3B-FP8

## Resumen

WeMM-Video-35BA3B-FP8 es la variante cuantizada en FP8 (bloques de 128 × 128) del modelo multimodal WeMM-Video-35B-A3B, desarrollado por Tencent. Se trata de un modelo de lenguaje con arquitectura MoE (mezcla de expertos) que integra codificadores de visión y audio para realizar comprensión y razonamiento conjuntos de vídeo, imagen, audio y texto. Acepta entradas multimodales y genera respuestas en inglés o chino.

El modelo resuelve el problema del razonamiento audiovisual conjunto: combina fotogramas de vídeo con su pista de sonido original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye. Con aproximadamente 36.180 millones de parámetros totales y 3.000 millones activos (la nomenclatura A3B indica los parámetros activos), se posiciona en la gama de modelos MoE de tamaño medio-grande orientados a despliegue en producción.

Esta variante FP8 reduce el peso de los ficheros a 36,09 GiB y está pensada para servirse con una versión parcheada de vLLM 0.18.0 sobre GPUs con soporte FP8. La licencia Apache 2.0 facilita su uso comercial, lo que la hace relevante para equipos que necesitan un modelo audiovisual bilingüe desplegable en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (codificadores de visión y audio + modelo de lenguaje con mezcla de expertos); tipo `wemm_qwen3_5_moe` |
| Parametros totales | 36.177.564.536 (~36,18 B) |
| Parametros activos | ~3 B (denominación A3B) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 E4M3FN en bloques 128 × 128 con escalado dinámico de activaciones por token en grupos de 128; codificadores y tensores protegidos en precisión original |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (36,09 GiB de ficheros de pesos; repo de 38,8 GB) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores separados de visión y audio convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite razonar sobre la secuencia temporal. El núcleo lingüístico es un transformer con mezcla de expertos (MoE), cuyos pesos lineales seleccionados —incluidos los expertos enrutados— se han cuantizado a FP8 E4M3FN en esta variante, mientras que los codificadores de medios y los tensores protegidos conservan su precisión original.

La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales. El post-entrenamiento combinó multi-teacher OPD (destilación/optimización con múltiples profesores), MrDPO con mecanismo anti-repetición y aprendizaje por refuerzo especializado. El checkpoint local superó la carga completa de pesos y la generación en una única NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129, cubriendo texto, imagen, audio, fotogramas de vídeo y vídeo con banda sonora.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con la pista de audio original para describir eventos y razonar sobre lo visto y oído.
- Transcripción de habla (speech-to-text) a partir de audio o de la banda sonora de un vídeo.
- Comprensión de vídeo silencioso y de audio independiente.
- Comprensión de imágenes (image-text-to-text).
- Generación de texto y razonamiento multimodal en inglés y chino.
- Modo thinking opcional (`enable_thinking` en el procesador).
- Entrada multimodal mixta: texto, imagen, audio, vídeo y vídeo con sonido en una misma petición.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videollamadas: el modelo puede procesar el vídeo con su banda sonora para transcribir el habla y describir eventos visuales simultáneamente, aprovechando la combinación de codificadores de audio y visión.
- Moderación de contenido audiovisual: revisión de clips que combina lo que se ve con lo que se dice, útil para detectar contenido inapropiado en plataformas de vídeo.
- Accesibilidad y subtitulado enriquecido: generación de descripciones de escenas junto a la transcripción del audio para personas con discapacidad visual o auditiva.
- Indexación y búsqueda de archivos multimedia: extracción de descripciones y transcripciones bilingües (en/zh) de vídeos y audios para alimentar motores de búsqueda internos.
- Análisis de contenido en redes sociales: descripción automática de clips cortos con audio para generar metadatos y resúmenes en inglés o chino.
- Asistentes de atención al cliente con soporte de vídeo: el modelo puede recibir capturas o clips enviados por el usuario junto a texto y responder en el idioma del cliente (en/zh).
- Servicio de inferencia en producción con vLLM: despliegue mediante la versión parcheada de vLLM 0.18.0 con límites configurables de imagen, vídeo y audio por prompt, adecuado para pipelines de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos FP8 ocupan aproximadamente 36,09 GiB, por lo que se necesita al menos una GPU con ~40 GB o más para cargar el modelo completo; con overhead de activaciones y caché KV conviene contar con margen adicional.
- GPU recomendadas: NVIDIA L20 (validada por el autor para carga y generación), GPUs con soporte FP8 como H100, H200, L40S o A100 (este último con matices según soporte de FP8 nativo).
- GPU de consumo: no cabe en GPUs de consumo típicas (RTX 4090 de 24 GB) sin cuantización adicional o descarga parcial; no se documenta una variante GGUF.
- Opciones de despliegue: vLLM 0.18.0 parcheado (recomendado por el autor), Transformers 5.2.0 con `trust_remote_code=True` y PyTorch 2.10.0+cu129. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El ejemplo de servicio limita a 8.192 tokens de contexto máximo y a 4 imágenes, 2 vídeos y 2 audios por prompt.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada que permitan una comparación rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un modelo entrenado principalmente en inglés y chino, puede presentar sesgos culturales y lingüísticos propios de esos corpus.
- Riesgo de alucinación: inherente a los modelos generativos; el post-entrenamiento incluyó MrDPO anti-repetición, pero no se publican tasas de alucinación.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto nativa; el ejemplo de servicio limita a 8.192 tokens.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias de los componentes base y del código de runtime parcheado.
- Caveat de producción: requiere una versión parcheada de vLLM 0.18.0 y GPU con soporte FP8; el uso con Transformers requiere `trust_remote_code=True` y un ajuste manual de `modules_to_not_convert` para cargar los expertos FP8.
- La cuantización FP8 puede introducir degradación de precisión respecto al modelo base en bf16; el autor no publica comparativas de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers

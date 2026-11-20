# tencent/WeMM-Video-9B

## Resumen

WeMM-Video-9B es un modelo multimodal denso de 9B (10.488.603.384 parámetros reales según los pesos en safetensors) desarrollado por Tencent dentro de la familia WeMM-Video. Está diseñado para la comprensión y el razonamiento conjuntos de audio y vídeo, y acepta como entrada texto, imágenes, audio y vídeo, generando respuestas en texto. La relevancia actual del modelo radica en que cubre una modalidad poco habitual en modelos abiertos de este tamaño: la combinación de pista de audio original con fotogramas de vídeo, lo que permite describir eventos, transcribir voz y razonar sobre lo que se ve y se oye de forma integrada.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en BF16 safetensors (19,54 GiB de archivos de pesos, 21 GB de repositorio) y variantes cuantizadas oficiales en FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16. Soporta inglés y chino, y está pensado para despliegue con transformers, vLLM (0.18.0 y 0.31.0 parcheados) y SGLang (0.5.16 o 0.5.19 parcheados).

La arquitectura combina codificadores de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto, con marcas de tiempo en los fotogramas de vídeo. Se entrenó con aproximadamente 1,2 billones de tokens multimodales y un post-entrenamiento con multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de visión y audio que alimentan tokens de medios al modelo de lenguaje (tag `qwen3_5`; detalles internos no disponibles) |
| Parámetros totales | 10.488.603.384 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como cifra oficial; los ejemplos de despliegue usan `--max-model-len 8192` y `--context-length 8192` |
| Tipos de cuantización | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), GGUF (Q4_K_M), además de variantes FP8, AWQ y NVFP4 |

## Arquitectura y entrenamiento

WeMM-Video-9B es un modelo multimodal denso en el que codificadores de visión y audio independientes transforman imágenes, vídeo y audio en tokens que el modelo de lenguaje procesa de forma conjunta con el texto. Los fotogramas de vídeo incorporan marcas de tiempo, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. El pipeline declarado es `image-text-to-text` y la librería es `transformers` con `trust_remote_code`, lo que implica código personalizado en el repositorio.

El entrenamiento partió de un preentrenamiento con aproximadamente 1,2 billones de tokens multimodales. El post-entrenamiento incluyó multi-teacher OPD (on-policy distillation), MrDPO anti-repetición y aprendizaje por refuerzo con especialistas. La model card no detalla la composición exacta del dataset, el número de tokens por modalidad ni la proporción de datos en inglés y chino. El modelo soporta dos modos de chat: instructivo (por defecto) y razonamiento, controlados mediante `enable_thinking` en `processor.apply_chat_template`.

## Capacidades

- Comprensión conjunta de audio y vídeo: describe eventos a partir de fotogramas y resume o transcribe la banda sonora original.
- Comprensión de vídeo sin audio (vídeo silencioso) con muestreo configurable de fotogramas (`fps`, `min_frames`, `max_frames`, `total_pixels`).
- Comprensión de audio independiente, incluida la transcripción de voz.
- Comprensión de imágenes y respuesta a preguntas visuales.
- Generación de texto y razonamiento en inglés y chino.
- Modo de razonamiento explícito activable mediante `enable_thinking=True`; modo instructivo directo con `enable_thinking=False`.
- Procesamiento de múltiples medios por prompt: la configuración de vLLM del ejemplo limita a 4 imágenes, 2 vídeos y 2 audios por prompt.
- No se documenta en la información disponible soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Accesibilidad de contenido audiovisual: generar descripciones de escenas y subtítulos que combinen lo que se ve con lo que se oye, usando la entrada `video_audio` para procesar fotogramas y pista de sonido en una sola llamada.
- Transcripción y resumen de reuniones o clases grabadas: el modelo recibe el vídeo con audio y devuelve la transcripción del habla junto con un resumen de los eventos visuales, útil para actas automáticas en inglés o chino.
- Moderación y análisis de contenido en plataformas de vídeo: clasificación y descripción de clips combinando señales visuales y sonoras, con muestreo controlado de fotogramas para ajustar coste computacional.
- Análisis de grabaciones de vigilancia o industria: descripción de lo que ocurre en un clip y de los sonidos relevantes (alarmas, voces), con marcas de tiempo en los fotogramas que facilitan la localización temporal.
- Enriquecimiento de archivos audiovisuales: generación de metadatos, descripciones y transcripciones para catálogos de bibliotecas o mediatecas en inglés y chino.
- Asistentes de análisis de vídeo para investigación: preguntas multi-turno sobre un clip concreto (qué aparece en pantalla, qué se dice, en qué orden) aprovechando el modo de razonamiento para preguntas que requieren inferencia temporal.
- Procesamiento por lotes en pipelines de datos: despliegue con vLLM o SGLang parcheados para servir peticiones de imagen, vídeo y audio con límites de medios por prompt configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: 19,54 GiB de archivos de pesos (repositorio de 21 GB); se necesita VRAM adicional para entradas de medios y caché de generación, por lo que una GPU de 24 GB resulta ajustada y se recomienda 40-80 GB para BF16 con margen.
- Variantes cuantizadas para reducir VRAM: FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16, distribuidas como repositorios separados.
- GPU recomendadas: A100 o H100 para BF16 en producción; GPUs consumer de gama alta (por ejemplo, RTX 4090 de 24 GB) solo con cuantización y prompts de medios moderados.
- Despliegue: transformers (`AutoModelForImageTextToText` con `trust_remote_code`), vLLM 0.18.0 o 0.31.0 parcheados, SGLang 0.5.16 o 0.5.19 parcheados, y GGUF vía llama.cpp/Ollama para la variante Q4_K_M.
- La configuración de vLLM del ejemplo desactiva el prefix caching y usa `--mamba-ssm-cache-dtype float32`, lo que sugiere componentes de estado (SSM) en la arquitectura y condiciona el uso de memoria.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-9B | 10,49B (denso) | No disponible (ejemplos a 8192) | Texto, imagen, audio, vídeo | Apache 2.0 | Hugging Face, variantes cuantizadas oficiales |
| Alternativas comparables de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino documentados; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: como modelo generativo multimodal, puede describir eventos o transcribir audio de forma incorrecta, especialmente con audio de baja calidad o vídeos con muchos elementos.
- El post-entrenamiento incluye técnicas anti-repetición (MrDPO), lo que sugiere que la repetición en la generación es un problema conocido en la familia.
- Requiere `trust_remote_code=True` y parches específicos del runtime (vLLM/SGLang) para servir el modelo, lo que añade complejidad operativa y riesgo de incompatibilidades con versiones futuras.
- La longitud de contexto no está declarada oficialmente; los ejemplos usan 8192 tokens, por lo que prompts con vídeos largos o muchos fotogramas pueden exceder el límite.
- El muestreo de vídeo está limitado en los ejemplos (4-16 fotogramas, `total_pixels` 262144), lo que restringe la resolución temporal para clips largos.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías, evaluaciones de sesgo ni limitaciones de seguridad específicas.
- No hay evidencia en la información disponible de soporte de tool calling ni de uso agéntico; no debe asumirse para pipelines que dependan de ello.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Colección de modelos WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-9B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-9B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-9B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-9B-NVFP4
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md

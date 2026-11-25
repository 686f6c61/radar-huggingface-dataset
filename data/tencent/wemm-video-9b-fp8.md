# tencent/WeMM-Video-9B-FP8

## Resumen

WeMM-Video-9B-FP8 es la variante cuantizada en FP8 del modelo WeMM-Video-9B, desarrollado por Tencent. Se trata de un modelo multimodal bilingüe (chino-inglés) orientado a la comprensión y el razonamiento conjunto de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entradas y genera respuestas en texto, combinando los fotogramas de un vídeo con su pista de audio original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye.

El modelo parte de una arquitectura Qwen3.5 (etiqueta `qwen3_5` en el repositorio) con codificadores separados de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo llevan marcas temporales. Cuenta con aproximadamente 10.488 millones de parámetros totales y un repositorio de 14,1 GB, con pesos en 13,10 GiB.

Esta versión FP8 Block128 aplica cuantización E4M3FN en bloques de 128×128 sobre determinados pesos lineales del modelo de lenguaje, con escalado dinámico de activaciones por token en grupos de 128, mientras que los codificadores de medios y los tensores protegidos conservan su precisión original. Es relevante para desarrolladores que necesitan desplegar un modelo audiovisual en hardware con soporte FP8 reduciendo el coste de memoria sin renunciar a las capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`) con codificadores separados de visión y audio |
| Parametros totales | 10.488.603.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 E4M3FN en bloques 128×128 con escalado dinámico de activaciones por token en grupos de 128; codificadores de medios y tensores protegidos en precisión original |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (13,10 GiB de archivos de pesos) |

## Arquitectura y entrenamiento

WeMM-Video emplea una arquitectura multimodal en la que codificadores de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. El modelo acepta vídeo con y sin pista de audio, audio independiente, imágenes y texto.

La familia se preentrenó con aproximadamente 1,2 billones (1,2 trillion) de tokens multimodales. Posteriormente se aplicó un post-entrenamiento con multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. La variante FP8 cuantiza pesos lineales seleccionados del modelo de lenguaje, manteniendo los codificadores de medios y los tensores protegidos en su precisión de origen; el manifiesto de cuantización (`quantization_manifest.json`) detalla el alcance de los tensores y las comprobaciones de exportación.

## Capacidades

- Comprensión conjunta de audio y vídeo: describe eventos combinando fotogramas y banda sonora.
- Transcripción de voz presente en el audio del vídeo o en audio independiente.
- Razonamiento sobre lo que se ve y se oye de forma simultánea.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo de pensamiento configurable (`enable_thinking` en la plantilla de chat).
- Procesamiento de múltiples elementos multimedia por petición (el ejemplo de vLLM limita a 4 imágenes, 2 vídeos y 2 audios por prompt).
- Muestreo de vídeo configurable (fps, mínimo y máximo de fotogramas, píxeles totales).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar el vídeo junto con su pista de audio para transcribir la voz y describir lo que ocurre en pantalla, aprovechando las marcas temporales de los fotogramas para alinear intervenciones con contenido visual.
- Moderación de contenido audiovisual: combinando fotogramas y audio en una sola pasada, permite detectar y describir escenas con contexto sonoro (por ejemplo, lenguaje agresivo acompañado de determinadas imágenes).
- Accesibilidad: generación de descripciones de vídeos que integran lo visual y lo sonoro, útil para subtitulado enriquecido o audiodescripción en inglés y chino.
- Indexación y búsqueda de archivos multimedia: el modelo puede generar descripciones textuales de clips de vídeo y audio que alimenten un motor de búsqueda o un sistema de etiquetado posterior.
- Análisis de contenido educativo o divulgativo: transcripción de la locución y descripción de las diapositivas o demostraciones visuales en un único paso, con respuestas en el idioma del usuario (inglés o chino).
- Procesamiento por lotes de archivos de audio: transcripción y razonamiento sobre audio independiente (por ejemplo, llamadas o notas de voz) sin necesidad de vídeo.
- Despliegue en producción con vLLM: al estar cuantizado en FP8, puede servirse con vLLM 0.18.0 parcheado sobre GPU con soporte FP8, reduciendo el coste de memoria frente a la versión en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 13,10 GiB; con overhead de activaciones, caché KV y codificadores de medios en precisión original, se recomienda planificar por encima de esa cifra (no se proporciona un valor oficial).
- GPU recomendadas: GPU con soporte FP8. La validación de carga y generación se realizó en una NVIDIA L20 con Transformers 5.2.0 y PyTorch 2.10.0+cu129. Para servicio se indica vLLM 0.18.0 parcheado sobre GPU con soporte FP8.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el requisito de soporte FP8 y el tamaño de pesos (~13 GiB) condicionan la elección.
- Opciones de despliegue:
  - Transformers con `AutoModelForImageTextToText` y `AutoProcessor` (`trust_remote_code=True`).
  - vLLM 0.18.0 con el parche de WeMM (receta de servicio incluida en el repositorio).
  - El repositorio menciona guías de servicio con perfiles de dependencias e imágenes Docker.
  - llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible en la información proporcionada.
- Parámetros de servicio de referencia (vLLM): `--max-model-len 8192`, `--limit-mm-per-prompt '{"image":4,"video":2,"audio":2}'`, muestreo de vídeo `{"fps":2,"min_frames":4,"max_frames":16,"total_pixels":262144}`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto: no se especifica en la información disponible; el ejemplo de servicio limita a 8192 tokens, lo que puede condicionar vídeos largos o conversaciones extensas.
- Riesgo de alucinación: no se documenta en la información proporcionada, pero es un riesgo inherente a los modelos generativos multimodales; conviene validar salidas en producción.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Cuantización FP8: los pesos cuantizados pueden introducir una degradación de precisión frente al modelo base `tencent/WeMM-Video-9B`; no se ofrecen métricas comparativas.
- Dependencia de parches: el servicio con vLLM requiere una versión parcheada (0.18.0) y perfiles de dependencias específicos, lo que añade complejidad operativa.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- `trust_remote_code=True`: el uso de Transformers requiere ejecutar código remoto del repositorio, lo que implica revisar dicho código antes de desplegarlo en entornos sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Colección WeMM-Video en Hugging Face: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos con Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers

# tencent/WeMM-Video-2B

## Resumen

WeMM-Video-2B es el checkpoint denso de 2B parámetros de la familia WeMM-Video, desarrollada por Tencent para comprensión y razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto, combinando los fotogramas de un vídeo con su banda sonora original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye. Está publicado bajo licencia Apache 2.0 y es bilingüe chino-inglés.

La arquitectura sigue el patrón multimodal habitual: codificadores de visión y audio independientes convierten el contenido multimedia en tokens que el modelo de lenguaje procesa junto al texto, con marcas temporales en los fotogramas de vídeo. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con técnicas de multi-teacher OPD, MrDPO anti-repetición y aprendizaje por refuerzo especializado. El checkpoint real en safetensors suma 3.283.624.264 parámetros, por encima de la denominación comercial "2B", y los pesos BF16 ocupan 6,12 GiB.

Su relevancia actual radica en que cubre la comprensión audio-visual conjunta con un tamaño contenido, ofrece variantes cuantizadas listas para producción (FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16) y dispone de recetas de despliegue para vLLM y SGLang, además de un modo de razonamiento opcional (`enable_thinking`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens multimedia al modelo de lenguaje (base etiquetada como `qwen3_5`) |
| Parametros totales | 3.283.624.264 (según safetensors); denominado comercialmente "2B" |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; la receta de vLLM usa `--max-model-len 8192` |
| Tipos de cuantizacion | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés y chino (en, zh); los tags de Hugging Face incluyen además `ar` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes GGUF y cuantizadas publicadas aparte |

## Arquitectura y entrenamiento

WeMM-Video-2B es un modelo denso de tipo transformer multimodal. Los codificadores de visión y audio transforman imágenes, fotogramas de vídeo y pistas de sonido en tokens que se concatenan con los tokens de texto y se procesan en el modelo de lenguaje; los fotogramas de vídeo incorporan marcas temporales para permitir el razonamiento sobre secuencias. El procesador admite configuraciones de muestreo de vídeo controlables (`fps`, `min_frames`, `max_frames`, `total_pixels`), lo que permite ajustar el coste computacional por clip.

El preentrenamiento se realizó sobre aproximadamente 1,2 billones de tokens multimodales. El postentrenamiento combina multi-teacher OPD, una variante de DPO orientada a evitar repeticiones (MrDPO) y aprendizaje por refuerzo con especialistas. El modelo soporta dos modos de chat mediante `enable_thinking`: respuesta directa (por defecto) o respuesta con razonamiento explícito. La receta de vLLM incluye `--mamba-ssm-cache-dtype float32`, lo que sugiere componentes de estado (SSM) en la pila de inferencia, aunque la model card no detalla la arquitectura interna más allá de la descripción de los codificadores.

## Capacidades

- Generación de texto y razonamiento general, incluido razonamiento aritmético sencillo (el ejemplo de la model card resuelve un problema de horarios).
- Comprensión de vídeo: descripción de eventos en pantalla a partir de fotogramas muestreados con marcas temporales.
- Comprensión audio-visual conjunta: combinación de fotogramas y banda sonora para describir escenas y resumir el habla.
- Transcripción de voz (speech-to-text) en audio independiente o integrado en vídeo.
- Comprensión de imágenes y respuesta a preguntas visuales.
- Entrada de vídeo sin audio, audio independiente y texto puro.
- Modo de razonamiento opcional (`enable_thinking=True`) frente a modo instruct directo.
- Respuestas en chino e inglés.
- Capacidad de extracción de características (`feature-extraction` en los tags).

## Casos de uso

- Análisis de reuniones y videoconferencias: procesar la grabación con su audio para generar resúmenes de lo tratado, transcribir intervenciones y describir contenido compartido en pantalla, aprovechando el procesamiento conjunto de fotogramas y voz.
- Moderación y catalogación de vídeo: clasificar y describir automáticamente clips subidos por usuarios combinando lo visible y lo audible, con muestreo configurable de fotogramas para controlar coste.
- Accesibilidad: generar descripciones de escenas y subtítulos a partir de la pista de audio de vídeos, útil para contenido educativo o de entretenimiento.
- Transcripción y análisis de podcasts o grabaciones de audio: el modelo acepta audio independiente y puede transcribir y resumir el contenido en inglés o chino.
- Asistentes sobre documentación visual: responder preguntas sobre imágenes (capturas, diagramas, fotografías) en flujos de atención al cliente o soporte técnico.
- Procesamiento por lotes en pipelines de datos multimedia: extracción de descripciones y transcripciones estructuradas de grandes volúmenes de vídeo para indexación o búsqueda, con despliegue en vLLM o SGLang y cuantización AWQ o FP8 para reducir VRAM.
- Investigación en modelos audio-visuales: base de 2B parámetros con pesos abiertos y recetas de servicio para experimentación y ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: los pesos ocupan 6,12 GiB; con caché de generación, entradas multimedia y overhead del runtime conviene prever al menos 12-16 GB.
- Variantes cuantizadas: AWQ W4A16 y GGUF Q4_K_M reducen los pesos a aproximadamente 2-3 GB, lo que facilita su uso en GPU de consumo; FP8 Block128 y NVFP4 W4A16 requieren hardware compatible (FP8 en Ada/Hopper, NVFP4 en Blackwell).
- GPU recomendadas: A100 o H100 para BF16 en producción; RTX 4090 o similares para BF16 con margen; GPU de consumo de gama media (8-12 GB) viables con cuantización de 4 bits.
- Despliegue: transformers con `trust_remote_code=True`, vLLM parcheado (0.18.0 y 0.31.0 para BF16 según la guía), SGLang con parche WeMM BF16, y GGUF mediante llama.cpp/Ollama.
- La receta de vLLM limita las entradas por prompt (`image`: 4, `video`: 2, `audio`: 2) y usa 8192 tokens de longitud máxima de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Video-2B | 3,28B | 8192 (config. vLLM) | Texto, imagen, audio, vídeo | Apache 2.0 | Pesos BF16, FP8, AWQ, GGUF, NVFP4 en Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Idiomas: el soporte declarado se limita a inglés y chino; el rendimiento en castellano no está garantizado y no se ha documentado.
- Riesgo de alucinación: como todo modelo generativo, puede producir descripciones o transcripciones incorrectas, especialmente con audio de baja calidad o vídeos con muchos objetos.
- El muestreo de vídeo (fps, número de fotogramas, píxeles totales) condiciona la calidad; clips largos o con cambios rápidos pueden perder información.
- Requiere `trust_remote_code=True` y, para servir en vLLM o SGLang, un parche específico del runtime WeMM; no funciona con versiones estándar sin adaptación.
- La longitud de contexto no está documentada explícitamente; la configuración de referencia usa 8192 tokens, lo que limita conversaciones o clips muy largos.
- El nombre comercial "2B" no coincide con los 3,28B parámetros reales; conviene dimensionar el hardware con la cifra real.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluaciones de sesgo; se recomienda auditoría propia antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-2B
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-2B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-2B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-2B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-2B-NVFP4
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md

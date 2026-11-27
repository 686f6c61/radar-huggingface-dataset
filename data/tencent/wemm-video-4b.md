# tencent/WeMM-Video-4B

## Resumen

WeMM-Video-4B es un modelo multimodal denso de 4B (5.611.749.896 parámetros reales según los safetensors) desarrollado por Tencent, diseñado para comprensión y razonamiento conjunto de audio y vídeo. Forma parte de la familia WeMM-Video, una línea bilingüe chino-inglés que acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto. El modelo resuelve el problema de razonar de forma conjunta sobre lo que se ve y lo que se oye en un vídeo, algo que los modelos puramente visuales no pueden abordar.

La arquitectura combina codificadores de visión y audio independientes que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto, con marcas temporales en los fotogramas de vídeo. Se entrenó con aproximadamente 1,2 billones de tokens multimodales y un post-entrenamiento que incluye OPD multi-profesor, MrDPO anti-repetición y aprendizaje por refuerzo especializado.

Es relevante ahora porque cubre una modalidad (vídeo con banda sonora original) poco frecuente en modelos de este tamaño, con licencia Apache 2.0, variantes cuantizadas oficiales (FP8, AWQ, GGUF, NVFP4) y soporte de despliegue en vLLM y SGLang mediante parches específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens al modelo de lenguaje (base qwen3_5) |
| Parametros totales | 5.611.749.896 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | BF16, FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 10,45 GiB); GGUF para la variante cuantizada |

## Arquitectura y entrenamiento

WeMM-Video-4B es un transformer multimodal denso en el que dos codificadores especializados, uno de visión y otro de audio, transforman los medios en tokens que el modelo de lenguaje procesa de forma conjunta con el texto. Los fotogramas de vídeo llevan marcas temporales, lo que permite al modelo razonar sobre la secuencia de eventos y alinear lo visual con la banda sonora original. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales.

El post-entrenamiento combina tres fases: OPD multi-profesor (destilación desde varios modelos docentes), MrDPO anti-repetición (una variante de DPO orientada a reducir bucles y repeticiones en la generación) y aprendizaje por refuerzo especializado. El modelo soporta dos modos de chat mediante `enable_thinking`: modo instruct (respuesta directa, por defecto) y modo razonamiento (respuesta con cadena de pensamiento).

## Capacidades

- Comprensión conjunta de audio y vídeo: describe eventos, transcribe el habla y razona sobre lo que se ve y se oye en la misma secuencia.
- Procesamiento de vídeo silencioso, audio independiente, imágenes y texto como entradas individuales.
- Generación de respuestas en chino e inglés.
- Modo razonamiento opcional (`enable_thinking=True`) además del modo instruct por defecto.
- Extracción de características (`feature-extraction`) además de generación video-text-to-text.
- Procesamiento de vídeo configurable en fps, número mínimo y máximo de fotogramas y píxeles totales.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede transcribir el habla de la grabación y resumir lo tratado, combinando la pista de audio con los fotogramas para identificar ponentes o contenido visual compartido.
- Accesibilidad y subtitulado enriquecido: generar descripciones de escenas con contexto sonoro (no solo diálogo) para vídeos en inglés o chino, útil en plataformas de contenido.
- Moderación y auditoría de vídeo: detectar y describir eventos audiovisuales en clips, con marcas temporales que permiten localizar el momento concreto.
- Documentación de material de archivo: catalogar vídeos históricos o científicos (por ejemplo, grabaciones de misiones espaciales) describiendo imagen y sonido de forma conjunta.
- Asistentes de análisis de contenido multimedia: integrar el modelo en pipelines que reciben un MP4 con banda sonora y devuelven un informe textual estructurado.
- Investigación en multimodalidad: usar la variante de extracción de características para experimentar con representaciones conjuntas de audio y vídeo.
- Procesamiento por lotes en servidor: desplegar con vLLM o SGLang (con parche WeMM) para atender peticiones de imagen, vídeo y audio con límites configurables por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos BF16: 10,45 GiB de archivos de pesos; el repositorio completo ocupa 11,2 GB.
- VRAM estimada: superior a los pesos por la caché de generación y los tokens de medios; para BF16 conviene reservar al menos 16-24 GB según la resolución y duración del vídeo.
- Variantes cuantizadas oficiales que reducen requisitos: FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16.
- GPU recomendadas: A100 o H100 para BF16 en producción; GPUs consumer de gama alta (por ejemplo, RTX 4090) previsiblemente viables con cuantización, aunque no se confirma en la información disponible.
- Despliegue: vLLM parcheado (0.18.0 y 0.31.0 para BF16) y SGLang con parche WeMM BF1; también Transformers con `trust_remote_code=True`.
- El ejemplo de vLLM usa `--max-model-len 8192`, `--mamba-ssm-cache-dtype float32` y límites multimodales de 4 imágenes, 2 vídeos y 2 audios por prompt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos: no se documentan análisis de sesgo en la model card.
- Requiere `trust_remote_code=True` y código personalizado (`custom_code`), lo que implica ejecutar código del autor.
- El despliegue en vLLM y SGLang exige parches específicos del proyecto; no funciona con instalaciones estándar sin ellos.
- La longitud de contexto no se especifica; el ejemplo de servicio limita a 8192 tokens.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los codificadores y datos subyacentes.
- No se documenta soporte de tool calling ni de flujos de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-4B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-4B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-4B-NVFP4
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md

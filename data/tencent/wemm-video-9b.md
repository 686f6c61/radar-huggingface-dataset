# tencent/WeMM-Video-9B

## Resumen

WeMM-Video-9B es un modelo multimodal denso de 9B (10.488.603.384 parámetros reales según los pesos en safetensors) desarrollado por Tencent, perteneciente a la familia WeMM-Video, orientada a la comprensión y el razonamiento conjuntos de audio y vídeo. Acepta texto, imágenes, audio y vídeo como entradas y genera respuestas en texto, lo que lo sitúa en la categoría de modelos video-text-to-text con capacidad para procesar la banda sonora original del vídeo junto con los fotogramas.

El modelo resuelve el problema de la comprensión audio-visual unificada: no se limita a describir lo que se ve, sino que combina los fotogramas (con marcas temporales) y el audio para transcribir habla, describir eventos y razonar sobre lo que se ve y se oye simultáneamente. Está entrenado sobre aproximadamente 1,2 billones de tokens multimodales y es bilingüe chino-inglés.

Es relevante ahora porque la familia WeMM-Video publica una colección completa con variantes cuantizadas (FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16), lo que facilita su despliegue en distintos perfiles de hardware, y porque incluye modos de chat con y sin razonamiento explícito (`enable_thinking`), además de soporte de servicio en vLLM y SGLang mediante parches específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores separados de visión y audio que proyectan tokens al modelo de lenguaje (etiqueta `qwen3_5` en Hugging Face) |
| Parametros totales | 10.488.603.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explícita; los ejemplos de servicio usan `--max-model-len 8192` |
| Tipos de cuantizacion | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes GGUF y cuantizadas publicadas por separado |

## Arquitectura y entrenamiento

WeMM-Video-9B sigue una arquitectura multimodal en la que codificadores de visión y audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo llevan marcas temporales asociadas, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La etiqueta de arquitectura en Hugging Face es `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5, aunque la model card no detalla la configuración interna de capas ni dimensiones.

El entrenamiento consta de una fase de preentrenamiento sobre aproximadamente 1,2 billones de tokens multimodales, seguida de un post-entrenamiento con tres componentes: OPD multi-profesor (destilación desde varios modelos docentes), MrDPO anti-repetición (optimización por preferencias orientada a reducir repeticiones en la generación) y aprendizaje por refuerzo especializado. La model card no especifica la composición exacta del dataset ni el desglose de tokens por modalidad.

## Capacidades

- Comprensión audio-visual conjunta: describe eventos a partir de fotogramas y banda sonora original de forma simultánea.
- Transcripción de habla presente en el audio del vídeo o en audio independiente.
- Razonamiento sobre lo visto y lo oído, combinando ambas modalidades en una misma respuesta.
- Entrada de vídeo silencioso (solo fotogramas), audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Modo instructivo (respuesta directa) y modo de razonamiento (`enable_thinking=True`) para respuestas con cadena de pensamiento.
- Procesamiento de vídeo configurable: control de fps, número mínimo y máximo de fotogramas y píxeles totales.
- Razonamiento aritmético y de sentido común básico en texto (el ejemplo de la model card resuelve un cálculo de horario).
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes multi-paso en la información disponible.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar el vídeo junto con el audio para transcribir intervenciones y resumir lo tratado, aprovechando las marcas temporales de los fotogramas para ubicar cada fragmento de habla en el tiempo.
- Accesibilidad y subtitulado automático: transcripción del habla de un vídeo y descripción de la escena visual en una sola pasada, útil para generar subtítulos descriptivos para personas con discapacidad auditiva o visual.
- Moderación de contenido audiovisual: revisión de vídeos subidos por usuarios combinando lo que se ve y lo que se dice para detectar contenido inapropiado que un análisis solo visual o solo textual pasaría por alto.
- Indexación y búsqueda semántica de archivos de vídeo: generación de descripciones y transcripciones que alimenten un motor de búsqueda sobre una videoteca, con respuestas en chino o inglés según el mercado.
- Supervisión industrial o de seguridad: análisis de grabaciones de cámara con audio ambiente para describir incidentes y correlacionar eventos sonoros con lo que ocurre en pantalla.
- Asistencia en análisis de material de archivo: descripción de documentos audiovisuales históricos (el ejemplo de la model card usa material del Apolo 11) combinando imagen, audio y contexto textual.
- Despliegue en producción con vLLM o SGLang: servicio con límites por petición de imágenes, vídeos y audios (`--limit-mm-per-prompt`) y control de fps y fotogramas para ajustar coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos originales en BF16: 19,54 GiB de archivos de pesos, más memoria para entradas multimedia y caché de generación; se recomienda dimensionar la VRAM por encima de los pesos (el repositorio completo ocupa 21,0 GB).
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una GPU de 24 GB o más en BF16 resulta ajustada, y se necesita mayor capacidad para contextos largos o lotes.
- Cuantizaciones para hardware limitado: AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16 reducen el peso de los pesos y permiten acercarse a GPU de consumo, aunque la model card no publica cifras de VRAM por variante.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, vLLM parcheado (0.18.0 y 0.31.0 para BF16), SGLang con parche WeMM BF1, y variante GGUF para motores compatibles.
- El servicio en vLLM requiere desactivar la caché de prefijos (`--no-enable-prefix-caching`) y usar `--mamba-ssm-cache-dtype float32`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (comprensión audio-visual) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al estar entrenado principalmente con datos en chino e inglés, es previsible un sesgo cultural y lingüístico hacia esos dos idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; el post-entrenamiento con MrDPO anti-repetición mitiga repeticiones, pero no garantiza la veracidad de las descripciones de audio o vídeo.
- Cobertura lingüística limitada: solo inglés y chino declarados; el rendimiento en otros idiomas no está garantizado.
- Contexto: la longitud máxima de contexto no se declara explícitamente; los ejemplos de servicio usan 8192 tokens, por lo que vídeos largos requerirán muestreo de fotogramas (fps, `max_frames`, `total_pixels`) y pueden perder detalle.
- Requiere `trust_remote_code=True` y, para servicio de alto rendimiento, parches específicos de vLLM o SGLang, lo que añade complejidad operativa frente a modelos estándar.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del código remoto y de los codificadores incluidos.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción sin verificación previa.
- El tamaño del repositorio (21,0 GB) y la necesidad de descargar variantes cuantizadas por separado complican el despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Visión general del proyecto: https://github.com/Tencent/WeMM-Video#overview
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-9B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-9B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-9B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-9B-NVFP4

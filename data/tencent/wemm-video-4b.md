# tencent/WeMM-Video-4B

## Resumen

WeMM-Video-4B es el checkpoint denso de 4B de la familia WeMM-Video, desarrollada por Tencent para la comprensión y el razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entrada y genera respuestas de texto, combinando fotogramas de vídeo con su banda sonora original para describir eventos, transcribir voz y razonar sobre lo que se ve y se oye. Es relevante porque cubre una modalidad poco frecuente en modelos abiertos de este tamaño: el entendimiento audio-visual nativo, no solo vídeo silencioso.

La familia se ha preentrenado con aproximadamente 1,2 billones de tokens multimodales y se ha post-entrenado con técnicas de destilación multi-profesor (OPD), DPO anti-repetición (MrDPO) y aprendizaje por refuerzo especializado. El modelo está disponible en BF16 safetensors, con variantes cuantizadas FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16, y se distribuye bajo licencia Apache 2.0.

El checkpoint declara 5.611.749.896 parámetros en los ficheros safetensors (pese a la denominación "4B" de la familia), un repositorio de 11,2 GB y soporte bilingüe chino-inglés. La longitud de contexto no se especifica en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que proyectan tokens al modelo de lenguaje (tag `qwen3_5`, `custom_code`) |
| Parametros totales | 5.611.749.896 (según safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio usa `--max-model-len 8192`) |
| Tipos de cuantizacion | BF16, FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), más variantes FP8, AWQ, GGUF y NVFP4 |

## Arquitectura y entrenamiento

WeMM-Video-4B sigue una arquitectura multimodal en la que codificadores de visión y audio independientes convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo incorporan marcas temporales (timestamps), lo que permite al modelo razonar sobre la secuencia temporal de los eventos. El pipeline declarado es `video-text-to-text` y la etiqueta de arquitectura apunta a `qwen3_5` con código personalizado (`trust_remote_code=True`).

El entrenamiento consta de un preentrenamiento con aproximadamente 1,2 billones de tokens multimodales, seguido de un post-entrenamiento en tres fases: destilación multi-profesor (OPD), DPO anti-repetición (MrDPO) y aprendizaje por refuerzo con especialistas. El modelo admite dos modos de chat: instructivo por defecto (`enable_thinking=False`) y modo razonamiento (`enable_thinking=True`).

## Capacidades

- Comprensión conjunta de vídeo y audio: describe eventos y resume el habla a partir de fotogramas y banda sonora.
- Transcripción de voz en audio e vídeo.
- Comprensión de vídeo silencioso, audio independiente, imágenes y texto.
- Razonamiento multimodal: el ejemplo de la model card incluye preguntas de aritmética temporal y descripción de imágenes.
- Modo de razonamiento explícito activable mediante `enable_thinking=True`.
- Respuestas en chino e inglés.
- Procesamiento de vídeo con control de FPS, número mínimo/máximo de fotogramas y píxeles totales.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede procesar el vídeo junto con la pista de audio para transcribir intervenciones y resumir lo tratado, aprovechando el procesamiento conjunto de fotogramas y sonido.
- Accesibilidad audiovisual: generación de descripciones de escenas y subtítulos combinados para contenido de vídeo, útil en plataformas de streaming o archivos audiovisuales.
- Moderación y catalogación de vídeo: clasificación y descripción automática de clips con audio (por ejemplo, detección de eventos descritos verbalmente) en pipelines de ingestión de contenido.
- Análisis de material de vigilancia o deportivo: descripción de lo que ocurre en pantalla con marcas temporales, permitiendo localizar eventos en el tiempo.
- Transcripción y análisis de podcasts o grabaciones de audio: uso del modo audio independiente para transcribir y responder preguntas sobre el contenido hablado.
- Asistentes multimodales en aplicaciones: integración vía vLLM o SGLang con soporte de imagen, vídeo y audio en la misma petición (`--limit-mm-per-prompt`), para interfaces conversacionales que reciben medios del usuario.
- Investigación en comprensión audio-visual: base de 4B parámetros con pesos abiertos y variantes cuantizadas para experimentación académica en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso en BF16: 10,45 GiB en ficheros de pesos; el repositorio completo ocupa 11,2 GB. La VRAM necesaria debe dimensionarse para los pesos completos, las entradas multimedia y la caché de generación (según la model card).
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por tamaño, el BF16 requiere GPUs con al menos ~16-24 GB de VRAM considerando overhead; las variantes AWQ W4A16, GGUF Q4_K_M y NVFP4 permiten despliegue en GPUs de consumo, aunque no se confirman modelos concretos.
- Cabe en GPU de consumo: probable con las variantes cuantizadas (AWQ, GGUF Q4_K_M, NVFP4); no confirmado explícitamente en la información disponible.
- Opciones de despliegue: Transformers (con `trust_remote_code=True`), vLLM parcheado (0.18.0 y 0.31.0 para BF16, con `--mamba-ssm-cache-dtype float32` y `--no-enable-prefix-caching`) y SGLang (perfil WeMM BF16). Requiere instalar el parche de runtime de WeMM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa fiable. Como referencia estructural, se trata de un modelo denso de ~5,6B parámetros, multimodal (texto, imagen, audio y vídeo), bilingüe en/zh y con licencia Apache 2.0, lo que lo sitúa en la categoría de modelos audio-visuales abiertos de tamaño medio; la comparación concreta con alternativas queda como no disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada; el ejemplo de servicio de vLLM usa 8192 tokens, lo que puede limitar el análisis de vídeos largos o conversaciones extensas.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se documentan evaluaciones de fidelidad en la información disponible.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código remoto antes de usarlo en producción.
- El despliegue con vLLM requiere un parche específico de runtime y versiones concretas (0.18.0 / 0.31.0), lo que añade complejidad operativa.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los codificadores y datos subyacentes, no detalladas en la información disponible.
- El procesamiento de vídeo exige configurar FPS y límites de fotogramas/píxeles; una configuración inadecuada puede degradar la calidad de la respuesta o el consumo de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B
- Colección WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe técnico (arXiv): https://arxiv.org/abs/2611.26409
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Variante FP8 Block128: https://huggingface.co/tencent/WeMM-Video-4B-FP8
- Variante AWQ W4A16: https://huggingface.co/tencent/WeMM-Video-4B-AWQ
- Variante GGUF Q4_K_M: https://huggingface.co/tencent/WeMM-Video-4B-GGUF
- Variante NVFP4 W4A16: https://huggingface.co/tencent/WeMM-Video-4B-NVFP4
- Guía de servicio: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Parche de runtime: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md

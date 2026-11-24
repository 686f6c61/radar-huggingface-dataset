# tencent/WeMM-Video-9B

## Resumen

WeMM-Video-9B es el checkpoint denso de 9B de la familia WeMM-Video, desarrollada por Tencent para la comprensión y el razonamiento conjunto de audio y vídeo. El modelo acepta texto, imágenes, audio y vídeo como entradas y genera respuestas de texto, combinando los fotogramas de un vídeo con su banda sonora original para describir eventos, transcribir habla y razonar sobre lo que se ve y se oye. Es un modelo bilingüe chino-inglés, orientado a tareas de comprensión audiovisual multimodal.

Con 10.488.603.384 parámetros reales (etiquetado comercialmente como 9B), el modelo se distribuye en BF16 Safetensors (19,54 GiB de pesos) y cuenta con variantes cuantizadas oficiales en FP8 Block128, AWQ W4A16, GGUF Q4_K_M y NVFP4 W4A16. Su relevancia actual radica en que cubre una categoría poco poblada: modelos abiertos que procesan vídeo y audio de forma nativa y conjunta, no solo vídeo mudo o audio aislado.

La arquitectura se apoya en codificadores de visión y audio separados que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto, con marcas temporales en los fotogramas. Se publica bajo licencia Apache 2.0, lo que facilita su adopción comercial, y está disponible en la librería transformers con código remoto personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con codificadores de visión y audio separados que alimentan tokens de medios al modelo de lenguaje (base qwen3_5, según tags) |
| Parametros totales | 10.488.603.384 (10,49B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible de forma explícita; los ejemplos de servicio usan `--max-model-len 8192` |
| Tipos de cuantizacion | BF16 (original), FP8 Block128, AWQ W4A16, GGUF Q4_K_M, NVFP4 W4A16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16); variantes GGUF y cuantizadas publicadas aparte |

## Arquitectura y entrenamiento

WeMM-Video-9B sigue un diseño multimodal de tipo encoder-decoder de tokens: codificadores de visión y audio independientes transforman los medios en tokens que el modelo de lenguaje procesa junto con el texto. Los fotogramas de vídeo llevan marcas temporales asociadas, lo que permite al modelo razonar sobre la secuencia temporal de los eventos. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales.

El post-entrenamiento combina tres técnicas: OPD multi-profesor (destilación desde varios profesores especialistas), MrDPO anti-repetición (una variante de DPO orientada a mitigar la repetición en las generaciones) y aprendizaje por refuerzo con especialistas. El modelo soporta dos modos de chat: modo instructivo por defecto (`enable_thinking=False`) y modo de razonamiento (`enable_thinking=True`), seleccionable en la plantilla de chat.

## Capacidades

- Comprensión audiovisual conjunta: describe eventos combinando fotogramas y banda sonora original del vídeo.
- Transcripción de habla (speech-to-text) a partir de audio o de la pista de sonido de un vídeo.
- Razonamiento sobre lo que se ve y se oye de forma integrada (por ejemplo, relacionar una acción visual con un comentario hablado).
- Entrada de vídeo mudo, audio independiente, imágenes y texto por separado.
- Generación de texto y razonamiento aritmético básico (el ejemplo de la model card resuelve un cálculo de horarios).
- Modo de razonamiento explícito (thinking mode) activable mediante `enable_thinking=True`.
- Capacidades multilingües limitadas a chino e inglés, tanto en entrada como en salida.
- Extracción de características (pipeline `feature-extraction` en los tags del repositorio).

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo recibe el vídeo con su audio y puede resumir lo tratado, transcribir las intervenciones y vincular cada afirmación con el momento en que se produce, gracias al procesamiento conjunto de fotogramas con marcas temporales y pista de sonido.
- Indexación y búsqueda de archivos audiovisuales: generar descripciones textuales de clips con audio para construir un índice semántico que permita búsquedas por contenido hablado y visual.
- Moderación de contenido en plataformas de vídeo: detectar y describir escenas relevantes combinando señales visuales y de audio en un único paso de inferencia.
- Subtitulado asistido y control de calidad: transcribir el habla de un vídeo y contrastarla con lo que ocurre en pantalla para detectar desajustes entre subtítulos y escena.
- Asistencia a personas con discapacidad auditiva o visual: generar descripciones de escenas y resúmenes del audio de un clip en inglés o chino.
- Análisis de material de vigilancia o industrial: describir eventos en grabaciones con audio ambiente (por ejemplo, alarmas o voces) apoyándose en la ventana de contexto de hasta 8192 tokens configurada en los ejemplos de servicio.
- Procesamiento por lotes en pipelines de datos multimodales: extraer descripciones y transcripciones de grandes volúmenes de vídeo usando las variantes cuantizadas (FP8, AWQ, GGUF) para reducir requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en BF16: 19,54 GiB de archivos de pesos, por lo que la inferencia en BF16 requiere aproximadamente 20 GB solo para los pesos, más memoria para entradas multimedia y caché de generación; en la práctica se recomienda una GPU de 24 GB o superior.
- Variante FP8 Block128 y NVFP4 W4A16: reducen la huella de memoria y permiten desplegar en GPUs con menos VRAM; no se especifican cifras exactas en la información disponible.
- Variante AWQ W4A16 y GGUF Q4_K_M: orientadas a cuantización de 4 bits, adecuadas para GPUs de consumo y para despliegue en CPU/GPU mixto con llama.cpp.
- GPU recomendadas: no se indica una lista oficial; por tamaño, encajan A100, H100, L40S o RTX 4090 (24 GB) en BF16, y GPUs de menor VRAM con las variantes cuantizadas.
- Despliegue: transformers con `trust_remote_code=True`; vLLM parcheado (0.18.0 y 0.31.0 para BF16) y SGLang con parche WeMM BF1; también hay variante GGUF para llama.cpp/Ollama.
- En vLLM se recomienda `--max-model-len 8192`, `--no-enable-prefix-caching` y `--mamba-ssm-cache-dtype float32`, con límites multimodales de 4 imágenes, 2 vídeos y 2 audios por prompt.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, la familia WeMM-Video incluye otros checkpoints además del denso 9B, y el modelo se posiciona frente a otros sistemas multimodales abiertos que aceptan vídeo y audio, pero no se aportan cifras de rendimiento relativas.

| Modelo | Parametros | Contexto | Audio+vídeo conjunto | Licencia |
|---|---|---|---|---|
| WeMM-Video-9B | 10,49B (denso) | hasta 8192 en ejemplos de servicio | Sí | Apache 2.0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés y chino; no se garantiza un rendimiento adecuado en castellano ni en otras lenguas.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede describir eventos o transcribir fragmentos de audio de forma incorrecta, especialmente con audio de baja calidad o vídeos con muchos objetos.
- El post-entrenamiento incluye técnicas anti-repetición (MrDPO), lo que sugiere que la repetición es un problema conocido en este tipo de modelos; conviene monitorizar las generaciones largas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; hay que revisarlo antes de usarlo en producción.
- El despliegue en vLLM y SGLang exige parches específicos del proyecto WeMM, no versiones estándar; esto añade complejidad operativa y riesgo de incompatibilidades.
- La model card no detalla la composición del dataset de entrenamiento ni los sesgos conocidos; no hay información sobre evaluación de sesgos.
- La longitud de contexto no se declara explícitamente; el valor de 8192 aparece solo como parámetro de ejemplo en el servicio con vLLM, por lo que no debe asumirse como máximo garantizado.
- El tamaño real de parámetros (10,49B) supera la denominación comercial 9B; hay que dimensionar la memoria con el dato real.

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

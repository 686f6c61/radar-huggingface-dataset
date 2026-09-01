# vkshdev/whisper-large-v2

## Resumen

Whisper large-v2 es un modelo de reconocimiento automático del habla (ASR) y traducción de voz desarrollado por OpenAI. Se basa en una arquitectura Transformer encoder-decoder (secuencia a secuencia) con 1550 millones de parámetros, entrenado sobre 680 000 horas de datos de audio etiquetados mediante supervisión débil a gran escala. El modelo es multilingüe y capaz de generalizar a numerosos dominios y conjuntos de datos sin necesidad de ajuste fino.

La versión large-v2 se entrenó durante 2,5 veces más épocas que el modelo large original, incorporando además regularización adicional, lo que mejora su rendimiento en tareas de transcripción y traducción. Este checkpoint es uno de los más utilizados en la comunidad por su equilibrio entre calidad y tamaño, y está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

El modelo procesa audio en ventanas de 30 segundos y soporta 99 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, entre otros. Su capacidad para predecir marcas de tiempo y realizar identificación de idioma lo convierte en una herramienta versátil para aplicaciones de transcripción, subtitulado y traducción de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (sequence-to-sequence) |
| Parametros totales | 1550 M (1 543 304 960 en safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | FP32, FP16, int8, int4 (via herramientas externas como llama.cpp o bitsandbytes) |
| Idiomas soportados | 99 idiomas, incluyendo en, es, fr, de, it, pt, zh, ja, ko, ru, ar, hi, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX |

## Arquitectura y entrenamiento

Whisper large-v2 emplea una arquitectura Transformer estándar con encoder y decoder. El encoder procesa espectrogramas log-Mel de 80 canales extraídos de ventanas de audio de 30 segundos, mientras que el decoder genera la transcripción o traducción token a token. El modelo fue entrenado con 680 000 horas de datos etiquetados obtenidos mediante supervisión débil, es decir, transcripciones generadas automáticamente a partir de audio en la web. Esta estrategia permite una gran robustez frente a acentos, ruido de fondo y variaciones de dominio.

La versión large-v2 se distingue de la large original por un entrenamiento más prolongado (2,5 veces más épocas) y la inclusión de técnicas de regularización adicionales. El modelo se entrenó de forma multitarea: reconocimiento del habla (transcripción en el mismo idioma del audio) y traducción de voz (transcripción a un idioma diferente). Además, es capaz de identificar el idioma hablado y predecir marcas de tiempo para cada segmento. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento fue puramente supervisado.

## Capacidades

- Transcripción de audio a texto en 99 idiomas, con alta robustez frente a ruido, acentos y dominios variados.
- Traducción de voz a texto en inglés (el modelo puede transcribir audio en cualquier idioma soportado y traducirlo al inglés).
- Identificación automática del idioma hablado en el audio.
- Predicción de marcas de tiempo a nivel de segmento, útil para subtitulado y alineación.
- Manejo de audio de hasta 30 segundos por ventana; para audios más largos se requiere segmentación.
- No soporta tool calling ni razonamiento multi-paso; es un modelo puramente de audio a texto.
- No tiene capacidades de visión ni de generación de texto libre más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto con alta precisión, incluso con varios interlocutores y ruido de fondo. Su ventana de 30 segundos permite procesar segmentos de forma secuencial.
- Subtitulado automático de vídeos: gracias a la predicción de marcas de tiempo, se pueden generar subtítulos sincronizados para plataformas como YouTube o Vimeo, reduciendo el trabajo manual de edición.
- Traducción de contenido audiovisual: al poder traducir voz de cualquier idioma soportado a inglés, facilita la localización de podcasts, conferencias o clases en línea para audiencias internacionales.
- Asistentes de voz y dictado: integrable en aplicaciones de dictado médico, legal o periodístico, donde la precisión y la velocidad son críticas. El modelo puede ejecutarse localmente para garantizar privacidad.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto para su posterior análisis de sentimiento o extracción de información, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Archivado y búsqueda de audio: conversión de archivos de audio históricos (entrevistas, discursos, programas de radio) en texto indexable, permitiendo búsquedas por contenido.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva, ya sea en entornos educativos o eventos públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de Whisper (Radford et al., 2022) reporta métricas en conjuntos como LibriSpeech, Common Voice y Fleurs, pero esos datos no están incluidos en la documentación proporcionada. Se recomienda consultar el paper para obtener cifras detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa aproximadamente 6,2 GB; en FP16, unos 3,1 GB; en int8, alrededor de 1,6 GB. Con cuantización int4, puede reducirse a menos de 1 GB.
- GPU recomendadas: para FP16, una GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super). Para FP32, se recomienda 8 GB o más (RTX 3070, RTX 3080, A100, etc.).
- Sí cabe en GPUs de consumo: con cuantización int8 o int4, puede ejecutarse en GPUs con 2-4 GB de VRAM, como una RTX 2060 o incluso una GTX 1050 Ti con int4.
- Opciones de despliegue: transformers (PyTorch), whisper.cpp (CPU/GPU), faster-whisper (CTranslate2), vLLM (aunque no es su uso principal), TGI (no recomendado para ASR), y servicios como Replicate o Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos concretos en la información proporcionada. En una GPU moderna (por ejemplo, RTX 3090), la transcripción de 30 segundos de audio suele tardar menos de 1 segundo en FP16, pero esto depende de la implementación y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Whisper large-v2 (este) | 1550 M | 30 s audio | 99 | Apache 2.0 | Entrenado 2,5x más épocas que large-v1 |
| Whisper large (v1) | 1550 M | 30 s audio | 99 | Apache 2.0 | Versión original, menos épocas de entrenamiento |
| Whisper large-v3 | 1550 M | 30 s audio | 99+ | Apache 2.0 | Mejora en idiomas de bajos recursos y robustez, entrenado con más datos |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Las diferencias principales entre versiones se basan en el proceso de entrenamiento (épocas, regularización, datos) más que en la arquitectura, que es idéntica.

## Limitaciones y advertencias

- El modelo puede alucinar contenido en segmentos de audio silencioso o con ruido no lingüístico, generando texto que no corresponde a lo hablado.
- La ventana de 30 segundos obliga a segmentar audios largos, lo que puede provocar cortes en frases o pérdida de contexto si la segmentación no se realiza adecuadamente.
- Aunque soporta 99 idiomas, el rendimiento varía significativamente entre ellos; los idiomas con menos datos de entrenamiento pueden presentar tasas de error más altas.
- No está diseñado para manejar audio de muy baja calidad (por ejemplo, grabaciones telefónicas extremadamente ruidosas) sin un preprocesamiento adicional.
- La licencia Apache 2.0 permite uso comercial, pero es necesario atribuir la autoría original de OpenAI si se redistribuye el modelo.
- No realiza diarización de hablantes (distinción de quién habla en cada momento); para ello se requieren herramientas adicionales.
- El modelo no es un sistema de comprensión del lenguaje; solo transcribe o traduce, sin interpretar el significado.

## Enlaces

- Modelo en Hugging Face (original de OpenAI): https://huggingface.co/openai/whisper-large-v2
- Repositorio de código de Whisper: https://github.com/openai/whisper
- Paper "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Discusión sobre el lanzamiento de large-v2: https://github.com/openai/whisper/discussions/661
- Modelo espejo en Hugging Face (vkshdev): https://huggingface.co/vkshdev/whisper-large-v2

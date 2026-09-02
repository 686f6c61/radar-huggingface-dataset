# spark-ux/indic-transcribe-flex

## Resumen

Indic-Transcribe-flex es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por el equipo de Bodhan AI en el IIT Madras, en colaboración con AI4Bharat. Está diseñado para transcribir audio en 27 lenguas de la India —incluidas las 22 lenguas constitucionalmente reconocidas, varios dialectos del hindi y el inglés con acento indio— y destaca por su capacidad de manejar code-switching natural (como el hinglish) y por ofrecer tres modos de salida: escritura nativa, escritura mixta y romanización. El modelo se basa en la arquitectura NVIDIA Canary (FastConformer encoder + Transformer decoder) y cuenta con 1.222 millones de parámetros, lo que lo sitúa en la gama de modelos ASR de tamaño medio-alto.

El modelo resuelve un problema crítico en el ecosistema tecnológico indio: la falta de sistemas ASR que manejen con precisión la diversidad lingüística y los acentos regionales, así como el code-mixing habitual en la conversación cotidiana. Su entrenamiento con 1,3 millones de horas de audio (según fuentes periodísticas) y su cobertura en dominios como educación, agricultura y sanidad lo hacen especialmente útil para productos de voz en el mercado indio. La variante "flex" se diferencia de otras del mismo proyecto por incluir inversión de normalización de texto (ITN) y detección automática de idioma, aunque no soporta streaming.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Transformer decoder (NVIDIA Canary) |
| Parametros totales | 1.222.553.584 (1,2 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica duración máxima de audio) |
| Tipos de cuantizacion | no disponible (checkpoint en fp16) |
| Idiomas soportados | en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, hne, bgc, bhb (27 en total) |
| Licencia | other (según HuggingFace; la model card indica CC-BY-4.0) |
| Formato de pesos | safetensors (también formato NeMo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NVIDIA Canary: un encoder FastConformer de 32 capas con 811 millones de parámetros (dimensión oculta 1024, 8 cabezas de atención, kernel de convolución 9) y un decoder Transformer de 24 capas con 419 millones de parámetros (dimensión oculta 1024, 8 cabezas). El vocabulario BPE consta de 7.152 tokens, de los cuales 1.152 son tokens especiales o de tarea y 6.000 son tokens multilingües. El modelo se inicializa desde nvidia/canary-1b-v2 y se ajusta finamente para las lenguas indias.

Según la información disponible, el entrenamiento utilizó 1,3 millones de horas de audio (dato reportado por Analytics India Magazine, no confirmado en la model card). No se especifican detalles sobre la composición exacta del dataset ni sobre técnicas de alineación como RLHF o DPO, al ser un modelo de ASR. La innovación principal reside en los tokens de tarea que permiten seleccionar el modo de transcripción (escritura nativa, mixta o romanizada) y el idioma de salida, así como la inclusión de una tarea de identificación de idioma integrada. El modelo también incorpora inversión de normalización de texto (ITN) para convertir números, fechas y abreviaturas a su forma hablada.

## Capacidades

- Transcripción de voz a texto en 27 lenguas indias, incluyendo inglés con acento indio y dialectos como bhojpuri, chhattisgarhi y haryanvi.
- Code-mixing nativo: transcribe audio que mezcla varios idiomas (p. ej., hinglish) sin forzar una única lengua.
- Tres modos de salida seleccionables mediante tokens de tarea: escritura nativa (devanagari, bengalí, tamil, etc.), escritura mixta (palabras nativas en su escritura, números y anglicismos en latino) y romanización completa.
- Identificación automática de idioma (LID) integrada: puede usarse directamente como clasificador de idioma o para auto-detectar el idioma antes de transcribir.
- Inversión de normalización de texto (ITN) para conversión de números, fechas y unidades a formato legible.
- Cobertura de vocabulario específico en dominios de educación, agricultura y sanidad.
- Robustez frente a ruido y acentos variados, según las afirmaciones de la model card, con latencia de 150 ms en una GPU H100.

## Casos de uso

- Atención al cliente telefónica en India: el modelo puede transcribir conversaciones con code-mixing (hindí-inglés, tamil-inglés, etc.) en tiempo casi real, permitiendo análisis de sentimiento y generación de resúmenes con la ITN para normalizar números de pedido, fechas y cantidades.
- Transcripción de consultas médicas en zonas rurales: gracias a su cobertura de vocabulario sanitario y su soporte para lenguas como bhojpuri o santali, puede convertir grabaciones de consultas en texto estructurado para historiales clínicos electrónicos, incluso con acentos marcados y ruido de fondo.
- Subtitulado automático de contenido educativo en vídeo: las instituciones educativas pueden generar subtítulos en escritura nativa o romanizada para cursos en lenguas regionales, con la opción de mezclar términos técnicos en inglés sin perder coherencia.
- Asistentes de voz para agricultura: el modelo puede transcribir consultas de agricultores sobre plagas, fertilizantes o meteorología en lenguas como maratí, telugu u odia, permitiendo que un chatbot responda en el mismo idioma y modo de escritura.
- Documentación de procedimientos legales y administrativos: en juzgados y oficinas gubernamentales, la transcripción con escritura mixta facilita la búsqueda de términos legales en inglés dentro de un discurso en lengua local.
- Generación de subtítulos para medios de comunicación: las emisoras pueden producir subtítulos en múltiples modos (nativo, mixto, romanizado) para el mismo contenido, adaptándose a las preferencias de audiencias diferentes.
- Evaluación de idiomas y dialectos: la función de identificación de idioma integrada permite clasificar automáticamente grabaciones cortas, útil para estudios sociolingüísticos o para enrutar llamadas al agente adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección "Results at a glance" que no se ha podido leer en su totalidad, y no se proporcionan métricas como WER o CER para los distintos idiomas. Tampoco hay comparativas con otros modelos ASR en los datos facilitados.

## Requisitos de hardware

- El checkpoint en fp16 ocupa aproximadamente 4,6 GB (4,9 GB el repositorio completo), por lo que los pesos caben en GPUs con al menos 6 GB de VRAM.
- Para inferencia con el modelo completo en fp16, se estima un consumo de VRAM de 5-6 GB más overhead de activaciones; una GPU como la RTX 3060 12 GB o superior sería suficiente para procesar audio de corta duración.
- La model card indica una latencia de 150 ms en una NVIDIA H100, lo que sugiere que en GPUs consumer la latencia será mayor pero aún utilizable para procesamiento por lotes.
- Opciones de despliegue: al ser un modelo NeMo, se puede servir con NVIDIA NeMo Inference Server, TensorRT, o exportar a ONNX para uso con otros frameworks. También es posible convertirlo a formato GGUF para ejecución en llama.cpp, aunque no hay instrucciones oficiales en la documentación proporcionada.
- Para uso en producción con múltiples peticiones concurrentes, se recomienda al menos una GPU A10G o A100 en la nube.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto/audio | Licencia | Notas |
|---|---|---|---|---|---|
| Indic-Transcribe-flex | 1,2 B | 27 lenguas indias + inglés | no disponible | CC-BY-4.0 (según card) | Code-mixing, 3 modos de salida, LID integrado |
| Whisper large-v3 | 1,55 B | ~100 idiomas | 30 s por segmento | MIT | Sin code-mixing específico, sin modos de salida múltiples |
| SeamlessM4T v2 | 2,3 B | ~100 idiomas | no disponible | CC-BY-NC 4.0 | Traducción y transcripción, pero sin enfoque en code-mixing indio |
| IndicWav2Vec (AI4Bharat) | 300 M | 9 lenguas indias | no disponible | CC-BY-NC 4.0 | Menor cobertura, sin modos de salida romanizada |

La comparativa se basa en características públicas; no se dispone de benchmarks comparativos para evaluar rendimiento real.

## Limitaciones y advertencias

- Los datos de entrenamiento no se detallan públicamente; la cifra de 1,3 millones de horas proviene de una fuente periodística y no está confirmada en la model card.
- No se han publicado métricas de WER/CER por idioma, por lo que no es posible validar la calidad real en cada lengua, especialmente en las de bajos recursos como bhili o santali.
- La licencia es ambigua: el campo de HuggingFace indica "other", mientras que la model card afirma CC-BY-4.0. Se recomienda verificar los términos exactos antes de uso comercial.
- El modelo no soporta streaming (la variante "realtime" lo hace, pero no esta versión flex), por lo que no es adecuado para transcripción en vivo de baja latencia.
- No se especifica la duración máxima de audio que puede procesar el modelo; es posible que audios muy largos requieran segmentación previa.
- Al ser un modelo entrenado principalmente con audio indio, su rendimiento fuera de ese contexto geográfico puede degradarse.
- La identificación de idioma integrada puede fallar en hablantes bilingües con code-switching extremo, aunque el modelo está diseñado para mitigarlo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/spark-ux/indic-transcribe-flex)
- [Modelo base NVIDIA Canary 1B v2](https://huggingface.co/nvidia/canary-1b-v2)
- [Noticia de The Education Express](https://www.theeducationexpress.in/2026/08/19/iit-madras-bodhan-ai-indic/)
- [Noticia de NewsBytes](https://www.newsbytesapp.com/news/science/iit-madras-introduces-indic-transcribe-a-multilingual-speech-recognition-model/story)
- [Noticia de Business Today](https://www.businesstoday.in/technology/artificial-intelligence/story/from-hindi-to-regional-accents-this-new-ai-model-is-built-to-understand-26-indian-languages-549708-2026-08-18)
- [Artículo de Analytics India Magazine](https://analyticsindiamag.com/ai-news/ai4bharat-bodhan-ai-build-12-bn-parameter-speech-model-for-26-indian-languages)
- [Repositorio GitHub de Bodhan AI (herramientas)](https://github.com/AshwinSankar17/bodhan_gen_ai_tools)

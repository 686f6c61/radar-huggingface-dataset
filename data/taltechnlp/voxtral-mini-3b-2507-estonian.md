# TalTechNLP/Voxtral-Mini-3B-2507-estonian

## Resumen

Voxtral-Mini-3B-2507-estonian es un modelo de reconocimiento de voz y comprensión de audio desarrollado por TalTechNLP (Universidad de Tecnología de Tallin) como un ajuste fino completo del modelo base `mistralai/Voxtral-Mini-3B-2507` de Mistral AI. Este último es un modelo compacto de audio-lenguaje que combina un encoder derivado de Whisper con un núcleo de lenguaje basado en Ministral-3B, diseñado para transcripción, traducción de voz y comprensión auditiva en más de 8 idiomas. El ajuste fino de TalTechNLP lo especializa específicamente en estonio, con capacidad de salida en inglés.

El modelo se publica con licencia Apache 2.0 y está disponible en formato safetensors, con un total de 4.676.271.104 parámetros (aunque el nombre comercial indica "3B", el peso real es de aproximadamente 4,7 mil millones). Se entrenó mediante ajuste fino supervisado de todos los parámetros (full-finetune) sobre una mezcla de siete conjuntos de datos que incluyen transcripción verbatim, subtítulos, estenogramas parlamentarios, noticias, resúmenes y preguntas sobre audio. El checkpoint seleccionado es el paso 4.500 de un máximo de 6.000, con una ventana de contexto máxima de 28.000 tokens en el conjunto de datos final. Este modelo es relevante para investigadores y desarrolladores que necesitan una solución de ASR y comprensión de audio específica para estonio con licencia abierta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `VoxtralForConditionalGeneration` (encoder de audio tipo Whisper + decodificador de lenguaje basado en Ministral-3B) |
| Parametros totales | 4.676.271.104 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 28.000 tokens en el manifest de entrenamiento final; el modelo base soporta hasta 131.072 tokens (según Inferbase) |
| Tipos de cuantizacion | No documentado; los pesos se publican en bfloat16. Se pueden aplicar cuantizaciones estándar de transformers (por ejemplo, 8-bit, 4-bit) pero no se han verificado |
| Idiomas soportados | Estonio (principal), inglés (salida adicional) |
| Licencia | Apache 2.0 (siguiendo el modelo base) |
| Formato de pesos | Safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de `Voxtral-Mini-3B-2507`, un modelo de audio-lenguaje que integra un encoder de audio derivado de Whisper con un decodificador de lenguaje basado en la arquitectura Ministral-3B. El encoder procesa audio de 16 kHz mono y genera representaciones que el decodificador utiliza para generar texto. La arquitectura es de tipo transformador de condicionamiento secuencial (encoder-decoder), con atención de causalidad en el decodificador y atención bidireccional en el encoder. La base original de Mistral AI fue entrenada con datos multilingües y soporta transcripción, traducción y comprensión auditiva general.

El ajuste fino de TalTechNLP se realizó con supervisión completa (full-parameter SFT) sobre un conjunto de datos combinado de 156.432 ejemplos iniciales, de los que se retuvieron 149.397 tras filtrar 7.035 ejemplos (5.500 excedían el límite de duración de audio y 1.535 excedían la longitud máxima de secuencia combinada). Las tareas incluyen: transcripción verbatim (12.972 ejemplos), subtítulos de emisiones (5.412), noticias en estonio a partir de audio (49.998), noticias en inglés desde audio estonio (9.999), resumen y extracción estructurada (49.797), preguntas sobre contenido de audio (5.264) y estenogramas parlamentarios (15.955). Las instrucciones y algunas respuestas en los datos fueron generadas con `google/gemini-3.1-flash-lite`, lo que puede introducir sesgos estilísticos o errores heredados. El entrenamiento se realizó en 4 GPUs A100-SXM4 de 80 GB, con un tamaño de lote global efectivo de 32, optimizador Fused AdamW, tasa de aprendizaje 5e-5, scheduler coseno con warmup del 3%, y precisión bfloat16 con TF32 habilitado. Se activó el gradiente checkpointing para componentes de lenguaje y audio/visión. La longitud máxima de secuencia se redujo de 32.768 a 30.000 y finalmente a 28.000 tokens durante el desarrollo.

## Capacidades

- Transcripción automática de voz en estonio con salida verbatim (fiel a la pronunciación).
- Generación de subtítulos legibles y estenogramas parlamentarios a partir de audio.
- Resumen de contenido de audio de emisiones de radio o televisión.
- Redacción de noticias en estonio a partir de material de audio.
- Traducción de habla estonia a inglés (generación de noticias o texto en inglés).
- Respuesta a preguntas sobre el contenido de audio (QA sobre audio).
- Extracción estructurada de información de emisiones (por ejemplo, nombres, fechas, temas).
- Soporte de instrucciones en formato de prompt que especifican la tarea y el formato de salida deseado.
- Capacidad de procesar audio de hasta 30 minutos para transcripción y 40 minutos para tareas de comprensión (según los límites de entrenamiento).

## Casos de uso

- Transcripción automática de sesiones parlamentarias estonias: el modelo puede generar estenogramas legibles a partir de grabaciones del Riigikogu, facilitando la documentación oficial y el análisis de debates.
- Generación de subtítulos para emisiones de televisión o radio en estonio: permite subtitular programas en tiempo real o en postproducción, mejorando la accesibilidad para personas con discapacidad auditiva.
- Resumen de programas de noticias o entrevistas: el modelo puede condensar audio largo en resúmenes estructurados, útil para periodistas o analistas que necesitan revisar rápidamente contenido de medios.
- Traducción de contenido hablado estonio a inglés: útil para difusión internacional de noticias o investigaciones, generando versiones en inglés de reportajes o discursos.
- Asistente de búsqueda y consulta sobre archivos de audio: el modelo responde preguntas específicas sobre el contenido de un programa, como "¿qué se dijo sobre la reforma fiscal?" o "¿quién participó en el debate?", facilitando la indexación y recuperación de información.
- Generación de noticias a partir de eventos en vivo: el modelo puede tomar un audio de una rueda de prensa o evento y producir un artículo de noticias en estonio, reduciendo el trabajo manual de los redactores.
- Creación de subtítulos en inglés para contenido estonio: permite que audiencias internacionales accedan a programas estonios mediante traducción automática de la transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como WER (Word Error Rate), BLEU ni comparaciones con otros modelos de transcripción en estonio. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 9,4 GB solo para los pesos. Además, se necesita memoria para activaciones y logits, por lo que se recomienda al menos 16 GB de VRAM para inferencia con contexto de hasta 28.000 tokens.
- GPU recomendadas: A100 80 GB, H100, RTX 4090 (24 GB), RTX 3090 (24 GB), o GPUs de datacenter con 24 GB o más. Para uso en producción con vLLM o TGI, se recomienda al menos 24 GB de VRAM.
- En consumer GPU: con cuantización 4-bit (por ejemplo, bitsandbytes) se podría reducir a aproximadamente 2,5-3 GB, lo que permitiría ejecutar en GPUs de 8 GB (como RTX 3070) pero con degradación de rendimiento y sin garantías de calidad.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión), Hugging Face TGI, o el pipeline de transformers estándar.
- Latencia y throughput: no se han publicado datos específicos. En una A100 80 GB, se espera un rendimiento razonable para transcripción en tiempo real, pero depende del tamaño de la secuencia y de la tarea.

## Comparativa con modelos similares

No se dispone de información cuantitativa sobre benchmarks comparativos. Sin embargo, se puede comparar estructuralmente con las siguientes alternativas:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral-Mini-3B-2507-estonian (este) | 4,68B | 28K (entrenamiento) / 131K (base) | et, en | Apache 2.0 | Hugging Face |
| mistralai/Voxtral-Mini-3B-2507 (base) | ~4,7B | 131K | 8+ idiomas | Apache 2.0 | Hugging Face |
| Whisper large-v3 | 1,55B | N/A (solo audio) | 99 idiomas | MIT | Hugging Face, OpenAI |

Nota: Whisper large-v3 es un modelo de transcripción sin capacidad de generación de texto libre (no puede resumir o responder preguntas), mientras que Voxtral-Mini es un modelo multimodal de lenguaje que puede realizar tareas más complejas. No se han publicado comparaciones directas de WER entre este modelo y Whisper en estonio.

## Limitaciones y advertencias

- El modelo no es un sistema certificado para transcripción legal, médica, de seguridad crítica o de alto riesgo. Los resultados pueden contener errores.
- La calidad de la transcripción depende de la calidad del audio: se recomienda audio de 16 kHz mono y segmentar grabaciones largas en fragmentos naturales.
- El modelo puede alucinar contenido o producir errores en la transcripción, especialmente con ruido de fondo, acentos no representados o jerga técnica.
- Los datos de entrenamiento incluyen contenido generado por `google/gemini-3.1-flash-lite`, lo que puede introducir sesgos estilísticos o errores en las respuestas en inglés y en las instrucciones.
- La ventana de contexto máxima de entrenamiento es de 28.000 tokens, lo que limita la duración del audio procesable en una sola pasada (para transcripción verbatim se recomienda segmentar en clips de hasta 30 minutos, pero el límite de tokens puede reducir el tiempo efectivo).
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de verificar los términos, derechos de autor, privacidad y usos permitidos de los datos fuente (por ejemplo, las grabaciones de ERR y Riigikogu) en su aplicación.
- El modelo está especializado en estonio y puede tener rendimiento degradado en otros idiomas, aunque se ha entrenado para producir salida en inglés a partir de audio estonio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TalTechNLP/Voxtral-Mini-3B-2507-estonian
- Modelo base de Mistral AI: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Documentación de hardware y rendimiento (madebyagents): https://www.madebyagents.com/models/voxtral-mini-3b-2507
- Versión ONNX del modelo base (textagent): https://huggingface.co/textagent/Voxtral-Mini-3B-2507-ONNX
- Model card en Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-mistral-ai-voxtral-mini-3b-2507.html
- Especificaciones y benchmarks (Inferbase): https://inferbase.ai/models/mistral-voxtral-mini-3b-2507
- Dataset de QA de broadcast (TalTechNLP): https://huggingface.co/datasets/TalTechNLP/qa_broadcast_conv_et

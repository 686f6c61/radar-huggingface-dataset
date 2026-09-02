# spark-ux/indic-transcribe-core

## Resumen

Indic-Transcribe-core es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por spark-ux, en colaboración con AI4Bharat y Bodhan AI, que transcribe audio en 25 lenguas indias y en inglés con acento indio. Está construido sobre la arquitectura NVIDIA Canary (FastConformer encoder con decoder Transformer) y cuenta con 1.200 millones de parámetros. Su principal propuesta de valor es la robustez ante el code-mixing típico del habla india (p. ej., hinglish), la identificación automática de idioma integrada y una cobertura léxica específica en los dominios de educación, agricultura y sanidad.

El modelo transcribe directamente a la escritura nativa de cada idioma y es capaz de detectar el idioma hablado sin necesidad de una pasada de encoder adicional. Según los datos publicados, alcanza un RTFx de 911 en una NVIDIA H100, lo que significa que procesa una hora de audio en unos cuatro segundos. Está disponible en Hugging Face con licencia CC-BY-4.0 y es apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + Transformer decoder (basado en nvidia/canary-1b-v2) |
| Parametros totales | 1.222.553.584 (1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (fp32 en disco, bf16 en inferencia) |
| Idiomas soportados | 25: en, as, bn, brx, doi, gu, hi, kn, ks, kok, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur, bho, bhb |
| Licencia | CC-BY-4.0 (según model card; en HF figura como "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Indic-Transcribe-core hereda la arquitectura de NVIDIA Canary-1b-v2: un encoder FastConformer de 32 capas con 811M parámetros (dimensión oculta 1024, 8 cabezas de atención, kernel de convolución 9) y un decoder Transformer de 24 capas con 419M parámetros (dimensión oculta 1024, 8 cabezas). El vocabulario consta de 7.152 tokens, de los cuales 1.152 son tokens especiales o de tarea y 6.000 son multilingües, codificados mediante BPE sin fallback de bytes. Los tokens de tarea permiten seleccionar el idioma objetivo en el decoder.

El entrenamiento, según la información publicada por AI4Bharat y Bodhan AI, se realizó sobre 1,3 millones de horas de audio multilingüe. La model card no detalla el proceso de entrenamiento (si hubo RLHF, DPO o algún otro método de alineación), ni la composición exacta del dataset. El modelo está diseñado para manejar code-switching y code-mixing de forma nativa, y su identificación de idioma está integrada en el decoder, lo que evita un segundo paso de encoder.

## Capacidades

- Transcripción de voz a texto en 25 lenguas indias y en inglés con acento indio, con salida en la escritura nativa de cada idioma.
- Identificación automática de idioma integrada: puede usarse directamente como sistema de language-ID o dejar que el modelo auto-detecte el idioma antes de transcribir, con un coste de un solo paso de decoder.
- Manejo nativo de code-mixing y code-switching (p. ej., hinglish, bengalí-inglés, etc.), transcribiendo el habla mixta tal como se produce.
- Cobertura léxica específica en los dominios de educación, agricultura y sanidad, con vocabulario profundo en esos ámbitos.
- Robustez ante ruido de fondo y condiciones adversas (mercados, centros de llamadas), según la model card.
- No soporta streaming, ni inversión de normalización de texto (ITN), ni salida romanizada.

## Casos de uso

- Atención al cliente en centros de llamadas indios: el modelo transcribe conversaciones reales con acentos y ruido de fondo, y maneja el code-mixing habitual entre inglés e hindi u otras lenguas regionales, lo que permite generar registros de interacción y análisis de calidad.
- Transcripción de consultas agrícolas: gracias a su vocabulario específico en agricultura, puede transcribir llamadas de asesores técnicos o mensajes de voz de agricultores en lenguas como punjabi, telugu o bengalí, facilitando sistemas de información de mercado o extensión rural.
- Documentación clínica en salud pública: el modelo cubre terminología sanitaria y transcribe consultas o informes de voz en lenguas regionales, útil para historiales médicos y telemedicina en zonas rurales.
- Educación y contenido audiovisual: subtitulación automática de vídeos educativos en lenguas indias, con salida en escritura nativa, para plataformas de e-learning y archivos institucionales.
- Análisis de llamadas y cumplimiento normativo: transcripción de audio de call centers para búsqueda de palabras clave, detección de incidencias o verificación de guiones en entornos bilingües.
- Sistemas de voz para administración pública: transcripción de quejas ciudadanas o trámites hablados en lenguas como bhojpuri o bhili (de bajos recursos), donde otros modelos no tienen cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card sí incluye resultados en el benchmark Voice of India, con 283.668 clips en 14 lenguas, medidos con la métrica OIWER (orthographically-informed word error rate, menor es mejor):

| Lengua | OIWER |
|---|---|
| Asamés | 8.32 |
| Bengalí | 4.34 |
| Bhojpuri | 13.66 |
| Guyaratí | 9.28 |
| Hindi | 3.51 |
| Canarés | 7.64 |
| Maithili | 11.81 |
| Malayalam | 11.96 |
| Maratí | 5.74 |
| Odia | 8.90 |
| Punyabí | 8.36 |
| Tamil | 9.20 |
| Telugu | 11.61 |
| Urdu | 5.06 |

**Promedio OIWER en las 14 lenguas: 8.53.**

No se aportan comparativas con otros modelos ASR en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación, pero al ser un modelo de 1,2B parámetros en bf16, el checkpoint ocupa 4,6 GB en disco; en inferencia se estima un consumo de VRAM en torno a 8-12 GB según la implementación.
- GPU recomendadas: NVIDIA H100 (usada en las mediciones de throughput). Por tamaño, también debería ejecutarse en GPUs consumer como RTX 3090 o RTX 4090 con cuantización, aunque no hay datos oficiales al respecto.
- Capacidad en consumer GPU: probablemente sí cabe en una RTX 4090 con 24 GB de VRAM en bf16, pero no hay confirmación oficial.
- Opciones de despliegue: la model card menciona instalación con torch y torchaudio; no se especifican vLLM, llama.cpp, Ollama ni TGI. Al ser un modelo ASR con arquitectura FastConformer, es probable que requiera NeMo o una implementación personalizada con transformers.
- Latencia y throughput medidos en H100 (bf16, inferencia por lotes sobre 3.000 clips, 3,11 horas de audio):
  - RTFx: 911 (una hora de audio en ~4 segundos)
  - Throughput: 244 utterances/s
  - Latencia (batch size 1): 286 ms mediana, 398 ms p90

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indic-Transcribe-core | 1,2B | 25 indias + en | no disponible | CC-BY-4.0 | Hugging Face |
| Meta Muse Voice Transcribe | no disponible | 70+ (25 verificadas, incluye 5 indias) | no disponible | no disponible | no disponible |
| Whisper large-v3 (OpenAI) | 1,55B | 99 | 30 s de audio | MIT | Hugging Face, OpenAI API |

Comparado con Whisper large-v3, Indic-Transcribe-core ofrece cobertura de lenguas indias de bajos recursos (bhojpuri, bhili, santali) que Whisper no cubre, y maneja code-mixing de forma explícita. Frente a Meta Muse Voice Transcribe, el modelo de spark-ux tiene más lenguas indias (25 frente a 5) y está disponible abiertamente. No hay datos de rendimiento comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- No soporta streaming ni normalización inversa de texto (ITN): la salida es texto en bruto, sin puntuación ni expansión de números.
- No ofrece salida romanizada: la transcripción es siempre en escritura nativa, lo que puede limitar su uso en sistemas que requieran transliteración.
- La métrica OIWER es una métrica propietaria que acepta variantes ortográficas y transliteraciones como correctas; los resultados no son directamente comparables con WER estándar.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero hay que verificar los términos exactos en la model card de Hugging Face, donde la licencia figura como "other".
- No se detallan sesgos conocidos ni riesgos de alucinación; como todo modelo ASR, puede producir errores en habla con acentos extremos o ruido severo no representado en los datos de entrenamiento.
- No se especifica el dataset de entrenamiento en detalle, por lo que no se puede evaluar su representatividad en todos los dialectos y variedades regionales.
- El modelo está pensado para lenguas indias; su rendimiento en otros acentos del inglés o en lenguas fuera de esa región no está documentado.

## Enlaces

- Modelo en Hugging Face: [spark-ux/indic-transcribe-core](https://huggingface.co/spark-ux/indic-transcribe-core)
- Modelo base: [nvidia/canary-1b-v2](https://huggingface.co/nvidia/canary-1b-v2)
- Artículo de Analytics India Magazine sobre el desarrollo del modelo: [AI4Bharat, Bodhan AI Build 1.2 Bn Parameter Speech Model for 26 Indian Languages](https://analyticsindiamag.com/ai-news/ai4bharat-bodhan-ai-build-12-bn-parameter-speech-model-for-26-indian-languages)
- Artículo de The Education Express: [IIT Madras Bodhan AI Indic-Transcribe](https://www.theeducationexpress.in/2026/08/19/iit-madras-bodhan-ai-indic/)

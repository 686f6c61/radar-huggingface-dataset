# StargateAfrica/Hleba-0.24B

## Resumen

Hleba-0.24B es un modelo de reconocimiento automático del habla (ASR) desarrollado por StargateAfrica, un proyecto orientado a ampliar la cobertura de tecnologías del habla para las lenguas de Sudáfrica. Se trata de un ajuste fino (fine-tuning) del modelo `openai/whisper-small`, especializado en tres lenguas bantúes: sesoto (sot), sepedi o sotho septentrional (nso) y setsuana (tsn). El modelo se presenta como el miembro de entrada de la familia Hleba, pensada para investigación y uso académico.

La propuesta de valor es concreta: Whisper Small, en su versión original, obtiene tasas de error de palabra (WER) superiores al 100 % en estas lenguas, lo que en la práctica lo hace inservible. Hleba-0.24B reduce ese WER a 0,026 en sepedi, 0,659 en sesoto y 0,594 en setsuana según la evaluación publicada por el autor, lo que supone una mejora sustancial para un modelo de apenas 244 millones de parámetros.

El modelo se distribuye principalmente en formato GGML/GGUF para inferencia con whisper.cpp y ofrece una ventana de contexto de audio de 30 segundos por segmento, heredada de la arquitectura Whisper. Su relevancia actual radica en que cubre un hueco real: lenguas con millones de hablantes y escasísimos recursos ASR de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 244 M (0,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (heredado de Whisper) |
| Tipos de cuantizacion | GGML (`ggml-Hleba-0.24B.bin`); otras cuantizaciones no disponibles |
| Idiomas soportados | Sesoto (sot), sepedi/sotho septentrional (nso), setsuana (tsn) |
| Licencia | Apache 2.0 (con restriccion declarada de uso comercial sujeta a autorizacion) |
| Formato de pesos | GGML/GGUF (binario compatible con whisper.cpp); safetensors no disponible |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-small`, un transformer encoder-decoder con atención completa, entrenado originalmente por OpenAI sobre 680 000 horas de audio supervisado débilmente y orientado a transcripción multilingüe y traducción al inglés. Hleba-0.24B es un ajuste fino sobre ese checkpoint, por lo que conserva la arquitectura, el tokenizador y el mecanismo de prompts especiales de Whisper (tokens de idioma, tarea y timestamps).

No se han publicado detalles sobre el corpus de ajuste fino: ni el número de horas de audio, ni la composición del dataset, ni si se aplicaron técnicas de aumento de datos, especificación de acentos o filtrado de calidad. Tampoco se documenta el uso de RLHF, DPO ni preferencias humanas, algo esperable en un modelo ASR. La innovación técnica principal es la adaptación del modelo base a tres lenguas de bajos recursos con acentos sudafricanos, junto con la distribución en formato GGML para despliegue ligero mediante whisper.cpp.

## Capacidades

- Transcripción de voz a texto en sesoto, sepedi y setsuana, con detección de idioma mediante el token de lenguaje de Whisper.
- Reconocimiento de acentos y patrones de habla sudafricanos, según declara el autor.
- Generación de timestamps por segmento (desactivable mediante `no_timestamps`).
- Soporte de segmentación simple (`single_segment`) para audios cortos.
- Compatibilidad con la API de Whisper y con `pywhispercpp` y `whisper.cpp`.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente ASR.
- No dispone de visión, audio generativo ni modo "thinking".
- Capacidad multilingüe limitada a las tres lenguas objetivo; el resto de lenguas de Whisper no están garantizadas tras el ajuste fino.

## Casos de uso

- Transcripción de entrevistas y material de campo en investigación lingüística: el modelo permite convertir grabaciones en sesoto, sepedi o setsuana a texto con un WER bajo en sepedi (0,026) y moderado en las otras dos lenguas, útil para corpus académicos.
- Evaluación comparativa de sistemas ASR: sirve como referencia de ajuste fino frente a Whisper Small original en benchmarks como NCHLT o DSFSI, dado que el autor publica resultados reproducibles sobre esos conjuntos.
- Subtitulado de contenido audiovisual comunitario: con segmentación de 30 segundos y timestamps, puede generar subtítulos para vídeos en lenguas bantúes sudafricanas en entornos de bajo recurso.
- Investigación sobre variación dialectal y acentos: al estar ajustado sobre habla sudafricana, permite estudiar el impacto del acento en la precisión del reconocimiento comparando con el modelo base.
- Desarrollo de tecnologías del habla para comunidades subrepresentadas: base para prototipos de asistentes de voz, dictado o accesibilidad en sepedi, sesoto y setsuana.
- Despliegue en dispositivos de bajos recursos: al ocupar 1,5 GB en formato GGML y requerir poca memoria, puede ejecutarse en CPU en portátiles o sistemas embebidos para transcripción offline.
- Docencia y formación en PLN de bajos recursos: ejemplo práctico de ajuste fino de Whisper para lenguas con pocos datos, replicable en cursos de procesamiento del habla.

## Benchmarks y rendimiento

El autor publica una evaluación comparativa frente a `ggml-whisper-small.bin` (control) sobre un conjunto de test compuesto al 50/50 por particiones de DSFSI y NCHLT.

| Idioma | Enunciados | WER control | WER test | Delta (test - control) |
|---|---:|---:|---:|---:|
| nso (sepedi) | 100 | 1,034 | 0,026 | -1,008 |
| sot (sesoto) | 95 | 1,169 | 0,659 | -0,510 |
| tsn (setsuana) | 98 | 1,126 | 0,594 | -0,531 |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no aplican a un modelo ASR. No se dispone de comparación con otros modelos ASR especializados en lenguas bantúes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (244 M de parámetros); en formato GGML cuantizado, en torno a 0,3-0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su tamaño.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y Raspberry Pi.
- Opciones de despliegue: `whisper.cpp`, `pywhispercpp`, `faster-whisper` (previa conversión), `transformers` con el checkpoint original si se dispone de safetensors (no publicado).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera inferencia en tiempo real o superior en CPU con 8 hilos, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas objetivo | Licencia | Formato |
|---|---|---|---|---|---|
| Hleba-0.24B | 244 M | 30 s | sot, nso, tsn | Apache 2.0 (uso comercial restringido) | GGML/GGUF |
| openai/whisper-small | 244 M | 30 s | 99 lenguas (incluye sot, nso, tsn con WER > 100 %) | MIT | safetensors, GGML |
| openai/whisper-base | 74 M | 30 s | 99 lenguas | MIT | safetensors, GGML |
| openai/whisper-medium | 769 M | 30 s | 99 lenguas | MIT | safetensors, GGML |

La comparación directa con Whisper Small es la más relevante: mismo tamaño y arquitectura, pero Hleba-0.24B mejora el WER de forma drástica en las tres lenguas. Frente a Whisper Medium, Hleba-0.24B es tres veces más pequeño y presumiblemente más rápido, aunque no hay datos de WER de Whisper Medium en estas lenguas en la información disponible. No se conocen otros modelos ASR especializados en sesoto, sepedi y setsuana con los que comparar directamente.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no debe asumirse con precisión de producción ni con rendimiento homogéneo entre todas las comunidades hablantes.
- El WER en sesoto (0,659) y setsuana (0,594) sigue siendo alto en términos absolutos; solo sepedi alcanza un WER bajo (0,026).
- El rendimiento puede degradarse con acentos, dialectos, velocidad de habla, ruido de fondo, calidad de grabación, cambio de código (code-switching) y vocabulario de dominio específico.
- La licencia es Apache 2.0, pero la model card declara explícitamente "not intended for commercial use" y exige autorización separada para uso comercial; esta ambigüedad debe resolverse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en silencios o segmentos ruidosos, especialmente con `single_segment` y `no_timestamps`.
- Sesgos potenciales derivados de la distribución del corpus de ajuste fino, no documentada: posible infrarepresentación de variedades dialectales o de hablantes no nativos.
- Sin datos publicados sobre el dataset de entrenamiento, no es posible auditar la composición ni la calidad de las transcripciones de referencia.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación externa por parte de la comunidad.
- Solo se distribuye en formato GGML; no hay safetensors ni versión directamente cargable con `transformers` sin conversión.

## Enlaces

- Hugging Face: https://huggingface.co/StargateAfrica/Hleba-0.24B
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio de pywhispercpp: https://github.com/absadiki/pywhispercpp
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Contacto del autor: contact@stargateafrica.org
- Statistics South Africa, Mbalo Brief, noviembre 2023: https://www.statssa.gov.za (referencia citada en la model card; URL completa no disponible)
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Conjunto NCHLT: https://repo.sadilar.org/handle/20.500.12185/7 (referencia estándar para ASR en lenguas sudafricanas; no enlazado explícitamente en la model card)
- DSFSI: https://dsfsi.github.io (grupo de investigación de la Universidad de Pretoria; no enlazado explícitamente en la model card)

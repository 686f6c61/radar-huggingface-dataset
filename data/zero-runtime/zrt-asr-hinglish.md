# zero-runtime/ZRT-ASR-Hinglish

## Resumen

ZRT-ASR-Hinglish es un modelo de reconocimiento automatico del habla (ASR) desarrollado por zero-runtime, disenado especificamente para transcripcion en tiempo real y de baja latencia de audio con code-switching hindi-ingles (hinglish). El modelo aborda un problema concreto: la mayoria de sistemas ASR comerciales y open source rinden deficientemente cuando un hablante alterna entre hindi e ingles dentro de la misma frase, un fenomeno ubicuo en India y en comunidades de diaspora. ZRT-ASR-Hinglish se presenta como una alternativa optimizada para ese escenario, con soporte declarado para audio telefonico de 8 kHz y orientacion a agentes de voz y centros de contacto.

El modelo se distribuye a traves de la libreria propietaria `zeroruntime` y bajo la licencia `zero-runtime-model-license`. La informacion publica disponible no detalla la arquitectura interna (no se especifica si es un transformer encoder-decoder, un modelo basado en Conformer, CTC o un esquema hibrido), ni el numero de parametros, ni la composicion exacta del dataset de entrenamiento. El repositorio en Hugging Face tiene un tamano declarado de 0.0 GB, lo que sugiere que los pesos podrian no estar alojados directamente en el repositorio o que se distribuyen por otra via.

La relevancia actual del modelo radica en su enfoque en streaming y baja latencia para hinglish, un nicho poco cubierto por modelos ASR genericos como Whisper, que aunque soporta hindi e ingles, no esta especificamente optimizado para code-mixing ni para audio telefonico de 8 kHz. Los benchmarks declarados por el autor muestran resultados competitivos en conjuntos de evaluacion estandar en ingles y un WER de 10.16 en Kathbath (hindi), aunque estos datos no han sido verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo ASR, no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), ingles (en); especializado en code-switching hinglish |
| Licencia | zero-runtime-model-license (propietaria, enlace a terminos) |
| Formato de pesos | no disponible (libreria `zeroruntime`; repo de 0.0 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la documentacion disponible. Los tags del repositorio indican que esta optimizado para streaming, tiempo real y baja latencia, y que soporta audio telefonico de 8 kHz, lo que sugiere un diseno orientado a inferencia incremental con atencion causal o chunked, aunque no se confirma el tipo de encoder (Conformer, transformer, etc.) ni el mecanismo de decodificacion (CTC, attention-based, RNN-T, etc.).

Tampoco se detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado. La model card menciona evaluacion en multiples conjuntos (AMI, Earnings22, GigaSpeech, SPGISpeech, URGENT2024, Voice Arena Monsoon, VoxPopuli, Kathbath), lo que indica que el modelo fue evaluado en dominios diversos, pero no se especifica si esos datos formaron parte del entrenamiento. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o compresion de estado.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tiempo real con soporte declarado para streaming y baja latencia.
- Transcripcion de audio con code-switching hindi-ingles (hinglish) y code-mixing dentro de la misma frase.
- Soporte para audio telefonico de 8 kHz, ademas de audio de banda ancha.
- Transcripcion en hindi e ingles de forma independiente.
- Orientacion a agentes de voz y IA conversacional (tags: voice-agents, conversational-ai, contact-center).
- Evaluado en dominios diversos: conversacional (AMI), financiero (Earnings22, SPGISpeech), lectura/audiollibros (GigaSpeech), llamadas de emergencia (URGENT2024), ingles indio (Voice Arena Monsoon) y hindi (Kathbath).
- No se declaran capacidades de vision, audio generativo, tool calling ni razonamiento multi-paso; es un modelo exclusivamente ASR.

## Casos de uso

- Centros de contacto en India: transcripcion en tiempo real de llamadas donde el agente y el cliente alternan hindi e ingles, con audio telefonico de 8 kHz. El modelo esta especificamente disenado para este escenario segun sus tags.
- Agentes de voz conversacionales: integracion en pipelines de ASR en streaming para asistentes telefonicos que necesitan transcripcion de baja latencia en hinglish, permitiendo respuestas del agente sin esperar a que termine el turno completo.
- Subtitulado en vivo de reuniones y webinars: transcripcion de sesiones con participantes que code-switchean entre hindi e ingles, aprovechando la evaluacion en AMI (conversacional) y la orientacion a streaming.
- Analitica de llamadas de atencion al cliente: transcripcion por lotes de grabaciones telefonicas para mineria de motivos de llamada, control de calidad y deteccion de sentimiento, usando el soporte de 8 kHz y el WER declarado en URGENT2024 (18.32).
- Transcripcion de contenido financiero y de negocios: procesamiento de llamadas de resultados (Earnings22, WER 13.48) y discursos (SPGISpeech, WER 3.29) en ingles, con capacidad de manejar terminos en hindi cuando aparecen.
- Asistentes de voz para dispositivos de consumo en India: reconocimiento de comandos y dictado en hinglish en tiempo real, con latencia baja para respuesta inmediata.
- Documentacion clinica o de servicios publicos: transcripcion de interacciones en hindi-ingles en entornos donde el code-switching es habitual, aunque el WER en dominios ruidosos (URGENT2024) sugiere cautela.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Se muestran dos variantes: decodificacion estandar y beam search, con el scorer del Open ASR Leaderboard salvo donde se indica.

| Dataset | WER (estandar) | WER (beam search) |
|---|---|---|
| AMI-Cleaned | 14.84 | 13.19 |
| Earnings22-Cleaned-AA-chunked | 13.48 | 12.27 |
| GigaSpeech-Cleaned | 9.86 | 9.32 |
| SPGISpeech | 3.29 | 3.19 |
| URGENT2024 | 18.32 | 17.53 |
| Voice Arena Monsoon (en-IN) | 6.41 | 5.77 |
| VoxPopuli-AA-Cleaned | 4.08 | 3.74 |
| Media de los 7 conjuntos publicos en ingles del Open ASR Leaderboard | 10.04 | 9.29 |
| Kathbath (hindi) | 10.16 (scorer propio) | no disponible |
| Kathbath (hindi) | 15.90 (scorer del publicador) | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros ni el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica la libreria `zeroruntime` como libreria oficial; no se mencionan vLLM, llama.cpp, Ollama ni TGI. El repositorio de Hugging Face tiene 0.0 GB, por lo que los pesos no parecen estar alojados alli.
- Latencia y throughput estimados: no disponible (aunque los tags declaran streaming y baja latencia, no se aportan cifras).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos directos en la informacion proporcionada. Se ofrece una comparacion cualitativa basada en caracteristicas publicas conocidas de alternativas ASR open source.

| Modelo | Parametros | Idiomas | Contexto/audio | Licencia | Enfoque hinglish |
|---|---|---|---|---|---|
| ZRT-ASR-Hinglish | no disponible | hi, en (hinglish) | streaming, 8 kHz | zero-runtime-model-license (propietaria) | Especifico |
| OpenAI Whisper (large-v3) | 1550 M | 99 idiomas | 30 s por ventana, no streaming nativo | MIT | Generico, no optimizado para code-mixing |
| NVIDIA NeMo Conformer/Canary | variable (hasta ~1B) | multilingue | streaming y offline | Apache 2.0 / CC-BY-4.0 | No especifico para hinglish |
| AI4Bharat IndicWhisper / IndicWav2Vec | variable | hindi y otras lenguas indias | offline | MIT / Apache 2.0 | Parcial, no centrado en code-switching |

La comparacion cuantitativa de WER entre estos modelos no esta disponible en la informacion proporcionada; los datos de ZRT-ASR-Hinglish no pueden contrastarse con los de las alternativas sin resultados publicados en los mismos conjuntos y con el mismo scorer.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos conocidos del modelo; al estar especializado en hinglish, podria tener sesgos hacia variantes regionales o registros concretos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo ASR, puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- El WER en dominios ruidosos o de emergencia (URGENT2024, 18.32) es notablemente superior al de dominios limpios (SPGISpeech, 3.29), lo que sugiere degradacion en condiciones acusticas adversas.
- La licencia `zero-runtime-model-license` es propietaria y remite a los terminos y condiciones de zeroruntime.ai; es imprescindible revisarlos antes de cualquier uso comercial, ya que no se garantiza permiso de uso comercial ni de modificacion.
- El modelo se distribuye mediante la libreria `zeroruntime`, no estandar; esto puede limitar la portabilidad a frameworks como Hugging Face Transformers, vLLM o llama.cpp.
- El repositorio de Hugging Face tiene 0.0 GB, lo que plantea dudas sobre la disponibilidad real de los pesos y la reproducibilidad de los benchmarks declarados.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en la model-index).
- No se especifica la longitud maxima de audio procesable ni el comportamiento en audio de mas de 8 kHz o en dominios no evaluados.
- El soporte linguistico se limita a hindi e ingles; no se declaran otras lenguas indias ni otros pares de code-switching.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zero-runtime/ZRT-ASR-Hinglish
- Licencia (terminos y condiciones): https://zeroruntime.ai/terms-and-conditions
- Open ASR Leaderboard (scorer y conjuntos de evaluacion): https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- Dataset Kathbath (AI4Bharat): https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Earnings22-Cleaned-AA-chunked: https://huggingface.co/datasets/ArtificialAnalysis/Earnings22-Cleaned-AA-chunked
- Dataset Voice Arena Monsoon (en-IN): https://huggingface.co/datasets/VoiceArena/MonsoonASR-Open-ASR-leaderboard-en-IN

# turkish-sa-asr/kashgari-large-v1.0

## Resumen

Kashgari-large-v1.0 es un modelo de reconocimiento automático del habla (ASR) especializado en turco, desarrollado por el colectivo `turkish-sa-asr`. Se trata de un ajuste fino (fine-tuning) del conocido `openai/whisper-large-v3`, lo que implica una arquitectura transformer encoder-decoder con aproximadamente 1.543 millones de parámetros. El modelo está diseñado para transcribir audio en turco con alta precisión, un idioma que, pese a su relevancia (más de 80 millones de hablantes), sigue estando infrarrepresentado en los sistemas ASR multilingües de propósito general.

La relevancia de este modelo radica en su especialización: mientras que Whisper-large-v3 ofrece un rendimiento aceptable en turco, un ajuste fino con datasets específicos (FLEURS, Common Voice 17.0 y WorldSpeech) permite reducir la tasa de error de palabra (WER) en dominios concretos como el parlamento o el habla espontánea. Los resultados declarados por el autor muestran un WER del 5,27 % en FLEURS, 4,56 % en Common Voice y 5,67 % en sesiones parlamentarias de WorldSpeech, cifras competitivas para un modelo de su tamaño.

El modelo se distribuye bajo una licencia de "research-evaluation" (solo para investigación y evaluación) y requiere acceso restringido en HuggingFace, lo que limita su uso comercial directo. Aun así, su publicación como safetensors y su compatibilidad con `transformers`, `ctranslate2` y `faster-whisper` lo convierten en una opción interesante para investigadores que necesiten un ASR turco de alta calidad y bajo consumo de recursos en comparación con alternativas más grandes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 1.543.490.560 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s en Whisper) |
| Tipos de cuantización | No disponible (compatible con cuantización vía CTranslate2/faster-whisper) |
| Idiomas soportados | Turco (tr) |
| Licencia | research-evaluation (solo investigación y evaluación) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura original de Whisper-large-v3: un transformer encoder-decoder con 32 capas de encoder y 32 de decoder, atención multi-cabeza y una dimensión de modelo de 1280. La entrada es un espectrograma mel de 80 canales calculado sobre ventanas de audio de 30 segundos, y la salida es texto tokenizado con el vocabulario multilingüe de Whisper. El ajuste fino se realizó sobre el checkpoint preentrenado de OpenAI, manteniendo la mayor parte de la arquitectura intacta y adaptando los pesos a las particularidades fonéticas y léxicas del turco.

Los datos de entrenamiento declarados incluyen tres fuentes principales: `google/fleurs` (configuración tr_tr), `mozilla-foundation/common_voice_17_0` (configuración tr) y `disco-eth/WorldSpeech` (sesiones parlamentarias en turco). No se especifica el número exacto de horas de audio ni si se aplicaron técnicas de aumento de datos, especificación de decodificación o RLHF (poco habitual en ASR). La innovación principal es la especialización en un solo idioma y en dominios concretos (habla espontánea y parlamentaria), lo que se traduce en mejoras medibles frente al modelo base en esos conjuntos.

## Capacidades

- Transcripción de audio en turco a texto con alta precisión en habla espontánea y leída.
- Reconocimiento de voz en dominios específicos como sesiones parlamentarias (WorldSpeech) y corpus de lectura (FLEURS, Common Voice).
- Compatibilidad con `transformers` (pipeline `automatic-speech-recognition`) y con `ctranslate2` / `faster-whisper` para inferencia optimizada.
- Soporte de audio de hasta 30 segundos por ventana (característica heredada de Whisper).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- Capacidad multilingüe limitada al turco (aunque los pesos base de Whisper-large-v3 conservan cierto conocimiento de otros idiomas, el ajuste fino está orientado a tr).
- No incluye modo "thinking", visión ni audio generativo.

## Casos de uso

- Transcripción de sesiones parlamentarias: el modelo ha sido evaluado en WorldSpeech con un WER del 5,67 %, lo que lo hace adecuado para generar actas y registros textuales de debates políticos en turco, un dominio con vocabulario especializado y solapamiento de hablantes.
- Subtitulado automático de vídeos y pódcast en turco: gracias a su ventana de 30 segundos y a la integración con `faster-whisper`, se puede desplegar en pipelines de generación de subtítulos para plataformas de contenido, reduciendo el coste frente a soluciones multilingües genéricas.
- Atención al cliente basada en voz: integrado en sistemas de IVR (respuesta interactiva de voz), el modelo puede transcribir consultas de usuarios turcos en tiempo real y alimentar un motor de intenciones o un chatbot, aprovechando su buen rendimiento en habla espontánea (Common Voice).
- Investigación lingüística y sociolingüística: los investigadores pueden transcribir grandes corpus de entrevistas o grabaciones de campo en turco con una precisión del 95 % (WER ~5 %), facilitando análisis fonéticos, léxicos o de variación dialectal.
- Accesibilidad para personas con discapacidad auditiva: generar transcripciones en directo de clases, conferencias o reuniones en turco, con la posibilidad de ejecutar el modelo en local mediante `faster-whisper` para preservar la privacidad.
- Archivística y digitalización de patrimonio oral: transcripción de grabaciones históricas o etnográficas en turco para su indexación y búsqueda textual, donde la licencia de investigación permite su uso en proyectos académicos sin fines comerciales.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados) son los siguientes:

| Dataset | Configuración | Split | Métrica | Valor |
|---|---|---|---|---|
| FLEURS | tr_tr | validation | WER (tr-norm-v1) | 5,27 % |
| Common Voice 17.0 | tr | validation | WER (tr-norm-v1) | 4,56 % |
| WorldSpeech (5 sesiones parlamentarias) | tr_tr | dev | WER (tr-norm-v1) | 5,67 % |

No se han publicado otros resultados de benchmarks en la información disponible. No se proporcionan comparaciones directas con el modelo base Whisper-large-v3 ni con otros modelos ASR turcos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB (1.543 M de parámetros × 2 bytes), más overhead de activaciones y buffers de audio; en la práctica, unos 4-6 GB.
- VRAM estimada en cuantización INT8 (vía CTranslate2): alrededor de 1,6-2 GB, lo que permite ejecución en GPUs de gama media.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, RTX 3090 para máximo throughput; RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) para inferencia en FP16; GTX 1660 (6 GB) o RTX 3050 (8 GB) para INT8.
- Cabe en GPUs de consumo: sí, en modelos con al menos 6 GB de VRAM (INT8) u 8 GB (FP16).
- Opciones de despliegue: `transformers` (pipeline ASR), `faster-whisper` (CTranslate2), `whisper.cpp` (si se convierte a GGML), `Ollama` (no oficial, pero posible con conversión), `TGI` (no verificado).
- Latencia y throughput estimados: no disponibles en la información proporcionada. En `faster-whisper` con INT8 en una RTX 4090, se espera un throughput de varias decenas de veces en tiempo real, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | WER turco (referencia) |
|---|---|---|---|---|---|
| kashgari-large-v1.0 | 1.543 M | 30 s | Turco | research-evaluation | 5,27 % (FLEURS) |
| openai/whisper-large-v3 | 1.550 M | 30 s | Multilingüe (99) | MIT | No disponible en la información |
| openai/whisper-medium | 769 M | 30 s | Multilingüe (99) | MIT | No disponible en la información |
| Vosk Turkish (modelo pequeño) | ~50-100 M | No disponible | Turco | Apache 2.0 | No disponible en la información |

No se dispone de datos comparativos de WER para los modelos alternativos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: "research-evaluation" impide el uso comercial sin autorización expresa; además, el acceso es restringido (gated) en HuggingFace y requiere aceptar condiciones.
- Sesgos conocidos: al estar entrenado principalmente con FLEURS, Common Voice y WorldSpeech, puede presentar sesgos hacia el turco estándar de Turquía y un rendimiento inferior en dialectos o acentos regionales (por ejemplo, turco de Chipre o de comunidades de diáspora).
- Riesgo de alucinación: como todo modelo basado en Whisper, puede generar texto plausible pero incorrecto en segmentos de audio con ruido, silencios largos o habla solapada.
- Limitación de contexto: la ventana de audio es de 30 segundos; para grabaciones más largas es necesario segmentar, lo que puede introducir errores en las fronteras.
- Limitación de idioma: aunque los pesos base son multilingües, el ajuste fino está orientado exclusivamente al turco; el rendimiento en otros idiomas no está garantizado y probablemente sea degradado.
- Caveat para producción: la licencia de investigación y la falta de verificación independiente de los benchmarks hacen recomendable una evaluación propia antes de cualquier despliegue crítico.
- No se especifican técnicas de mitigación de sesgos ni filtros de contenido; el modelo podría transcribir literalmente contenido sensible sin salvaguardas.

## Enlaces

- [HuggingFace: turkish-sa-asr/kashgari-large-v1.0](https://huggingface.co/turkish-sa-asr/kashgari-large-v1.0)
- [Modelo base: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [Dataset: google/fleurs](https://huggingface.co/datasets/google/fleurs)
- [Dataset: mozilla-foundation/common_voice_17_0](https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0)
- [Dataset: disco-eth/WorldSpeech](https://huggingface.co/datasets/disco-eth/WorldSpeech)
- [Paper de referencia (arXiv:2605.09167)](https://arxiv.org/abs/2605.09167) — no verificado en la información disponible
- [Repositorio faster-whisper (CTranslate2)](https://github.com/SYSTRAN/faster-whisper)

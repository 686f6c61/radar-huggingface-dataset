# Thareah/Tha-ASR

## Resumen

Tha-ASR es un modelo de reconocimiento automático del habla (ASR) derivado de Whisper-small, ajustado por el autor Thareah para transcribir camboyano (jemer, `km`), inglés (`en`) y, de forma destacada, habla con alternancia de código jemer-inglés dentro de la misma frase. El modelo parte de `PhanithLIM/whisper-small-aug-28-april-lightning-v1`, que a su vez es un ajuste fino de `openai/whisper-small` sobre datos en jemer. La versión publicada (v2) reduce el error de palabras en inglés del 11,1 % al 8,3 % y el error de caracteres en alternancia de código del 14,1 % al 4,5 % respecto a la versión anterior.

El interés práctico del modelo reside en cubrir un nicho poco atendido: el jemer apenas tiene cobertura en los modelos ASR multilingües generalistas y la alternancia jemer-inglés es frecuente en contextos laborales y urbanos de Camboya. Con solo 242 millones de parámetros y un peso de 967 MB en float32, es lo bastante ligero para ejecutarse en GPU de consumo y en entornos de despliegue modestos. La licencia MIT facilita su uso comercial, aunque el modelo hereda las limitaciones del Whisper-small original en cuanto a ruido, acentos y audio espontáneo.

La arquitectura es la de Whisper-small (transformer encoder-decoder de 12+12 capas), con entrada de audio mono a 16 kHz y ventanas de hasta 30 segundos por llamada (se recomiendan ≤ 15 s para jemer). La salida es texto sin marcas de tiempo, con escritura jemer en script jemer e inglés en alfabeto latino, incluyendo puntuación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (transformer encoder-decoder, 12 capas encoder + 12 capas decoder) |
| Parametros totales | 242 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de hasta 30 s por llamada (≤ 15 s recomendado para jemer); decoder limitado a 448 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en float32); compatible con cuantizaciones estándar de transformers/GGUF por conversión externa |
| Idiomas soportados | jemer (`km`), inglés (`en`), incluida alternancia jemer-inglés |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (float32, 967 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Whisper-small, un transformer encoder-decoder con 12 capas en cada torre y 242 M de parámetros. La entrada es audio mono a 16 kHz procesado por el `WhisperProcessor` estándar; la salida son tokens de texto sin timestamps. El ajuste parte de `PhanithLIM/whisper-small-aug-28-april-lightning-v1`, un fine-tune en jemer de `openai/whisper-small`, y añade capacidad para inglés y para alternancia de código.

Los datos de entrenamiento citados en la model card incluyen `google/fleurs` (jemer e inglés), `rinabuoy/khm-asr-open`, `seanghay/km-speech-corpus`, `seanghay/khmer_mpwt_speech` y `seanghay/khmer_grkpp_speech`. No se especifican en la información disponible el número total de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a ASR supervisado). La model card indica que los conjuntos de test están reservados y que ninguna transcripción de entrenamiento comparte texto con frases de test o dev. La innovación principal es la mejora específica en alternancia de código y la recomendación de detectar jemer/inglés comparando únicamente los tokens `<|km|>` y `<|en|>` en lugar de la detección de idioma integrada de Whisper, que puede derivar hacia tailandés o lao.

## Capacidades

- Transcripción de voz en jemer con salida en script jemer y puntuación.
- Transcripción de voz en inglés con salida en alfabeto latino y puntuación.
- Transcripción de habla con alternancia jemer-inglés en la misma frase (code-switching).
- Detección de idioma restringida a jemer/inglés mediante comparación de logits de los tokens de idioma.
- Procesamiento de audio de hasta 30 s por llamada; para grabaciones largas se recomienda segmentar en pausas en trozos de ≤ 15 s.
- No genera timestamps (salida de texto sin marcas temporales).
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio de salida; es un modelo puramente ASR.
- No se documentan modos de razonamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Transcripción de reuniones y entrevistas en Camboya: el modelo gestiona frases que mezclan jemer e inglés, frecuentes en entornos corporativos y ONG, segmentando el audio en pausas de ≤ 15 s y transcribiendo por lotes.
- Subtitulado de contenido audiovisual local: permite generar subtítulos en jemer e inglés para vídeos, con puntuación, a partir de audio limpio a 16 kHz.
- Digitalización de actas y notas de voz: útil para convertir grabaciones cortas de hasta 30 s en texto editable, con escritura jemer correcta.
- Atención al cliente en centros de contacto bilingües: transcripción de llamadas jemer-inglés para análisis de calidad y búsqueda en registros, dado el bajo coste de inferencia por el tamaño reducido del modelo.
- Investigación lingüística y corpus: generación de transcripciones para anotación y análisis de alternancia de código, con la salvedad de que el conjunto de evaluación de code-switching es pequeño y sintético.
- Despliegue en dispositivos de gama media: al pesar 967 MB en float32 y tener 242 M de parámetros, puede ejecutarse en GPU de consumo o incluso en CPU con cuantización, para aplicaciones de dictado local.
- Preprocesado para pipelines de NLP en jemer: transcripción previa a traducción, resumen o indexación de audio en sistemas de gestión documental.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Todas las métricas son "cuanto más bajo, mejor". Medición con audio limpio, beam search de 5 haces, batch 4, `max_new_tokens=440` y token de idioma fijado al del conjunto de test.

| Conjunto de test | Frases | Métrica | v1 | Tha-ASR (v2) |
|---|---:|---:|---:|---:|
| FLEURS jemer (`km_kh`, test) | 765 | CER | 12,74 % | 12,57 % |
| khm-asr-open (test) | 765 | CER | 12,72 % | 12,35 % |
| FLEURS inglés (`en_us`, test) | 647 | WER | 11,09 % | 8,27 % |
| FLEURS inglés (`en_us`, test) | 647 | CER | 5,05 % | 3,72 % |
| Alternancia jemer-inglés (reservado) | 534 | CER | 14,08 % | 4,46 % |

Notas del autor: 537 de las 765 frases de test de khm-asr-open también aparecen en el test de FLEURS jemer, por lo que ambos resultados se solapan en gran medida. El conjunto de alternancia de código se construyó con el mismo pipeline que los datos de entrenamiento, no a partir de conversaciones naturales, y es pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en float32 (peso de 967 MB más activaciones y caché del decoder); con cuantización a 8 bits o 4 bits puede reducirse por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con ≥ 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y en muchos casos sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas de gama media y en iGPU con memoria compartida suficiente para float32.
- Opciones de despliegue: `transformers` con `WhisperForConditionalGeneration` y `WhisperProcessor` (ruta oficial documentada); también es compatible con `faster-whisper`/CTranslate2 y `llama.cpp`/`Ollama` previa conversión a GGUF, aunque la model card solo documenta y valida la ruta de `transformers`.
- Latencia y throughput: no se publican cifras concretas en la información disponible; el tamaño reducido y el uso de beam search de 5 haces sugieren latencias bajas en GPU, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | CER/WER jemer | Disponibilidad |
|---|---:|---|---|---|---|---|
| Tha-ASR (v2) | 242 M | 30 s por llamada (≤ 15 s recomendado en jemer) | jemer, inglés, code-switching | MIT | CER 12,57 % (FLEURS km) | Hugging Face, `transformers` |
| `openai/whisper-small` | 242 M | 30 s | 99 idiomas (jemer incluido, cobertura escasa) | MIT | no disponible en la información | Hugging Face, `transformers` |
| `PhanithLIM/whisper-small-aug-28-april-lightning-v1` (modelo base) | 242 M | 30 s | jemer (fine-tune) | no disponible | CER 12,74 % (FLEURS km, v1) | Hugging Face |
| Whisper-large-v3 | 1.550 M | 30 s | 99 idiomas | MIT | no disponible en la información | Hugging Face, `transformers` |

La comparativa con Whisper-large-v3 se incluye por categoría (ASR multilingüe), pero no se dispone de cifras de jemer para ese modelo en la información proporcionada. Tha-ASR destaca frente a su versión v1 y frente a Whisper-small genérico por su especialización en jemer y en alternancia de código.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- El conjunto de evaluación de alternancia de código es pequeño (534 frases) y sintético; se esperan tasas de error mayores en habla espontánea mezclada.
- Los dos resultados en jemer se solapan: 537 de 765 frases de khm-asr-open aparecen también en FLEURS jemer.
- Whisper-small original tiene sesgos conocidos hacia audio limpio, acentos estándar y condiciones de grabación controladas; el ajuste fino no elimina necesariamente estos sesgos.
- Riesgo de alucinación y bucles de repetición en segmentaciones de longitud fija; el autor recomienda cortar en pausas y usar trozos de ≤ 15 s en jemer.
- La detección de idioma integrada de Whisper puede derivar hacia tailandés o lao en jemer; debe usarse la comparación restringida a `<|km|>` y `<|en|>`.
- El decoder está limitado a 448 tokens, lo que restringe la longitud de transcripción por llamada; el jemer consume muchos tokens por segundo de habla.
- No genera timestamps, lo que limita su uso en subtitulado sincronizado sin post-procesado adicional.
- Solo soporta jemer e inglés; no cubre otras lenguas minoritarias de la región.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento citados (FLEURS y corpus de terceros) antes de un despliegue comercial a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thareah/Tha-ASR
- Modelo base: https://huggingface.co/PhanithLIM/whisper-small-aug-28-april-lightning-v1
- Whisper-small original: https://huggingface.co/openai/whisper-small
- Repositorio de código (entrenamiento, evaluación y app web local): https://github.com/chestharastan/Tha-ASR
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset khm-asr-open: https://huggingface.co/datasets/rinabuoy/khm-asr-open
- Corpus km-speech-corpus: https://huggingface.co/datasets/seanghay/km-speech-corpus
- Corpus khmer_mpwt_speech: https://huggingface.co/datasets/seanghay/khmer_mpwt_speech
- Corpus khmer_grkpp_speech: https://huggingface.co/datasets/seanghay/khmer_grkpp_speech

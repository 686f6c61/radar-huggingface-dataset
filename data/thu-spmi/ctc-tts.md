# THU-SPMI/CTC-TTS

## Resumen

CTC-TTS es un sistema de síntesis de voz (text-to-speech) basado en modelos de lenguaje, desarrollado por el laboratorio THU-SPMI (Universidad de Tsinghua). Aborda dos problemas concretos de los sistemas de síntesis en streaming: la dependencia de herramientas externas de alineamiento forzado como MFA (Montreal Forced Aligner) y el uso de intercalados de tokens texto-voz con ratios fijos que no reflejan la relación real entre fonemas y audio. La propuesta sustituye MFA por un alineador neuronal basado en CTC, construido sobre el modelo ASR Whistle del mismo laboratorio, e introduce una estructura de intercalado por bloques de dos palabras (*bi-word interleaving block*).

El modelo se publica en cuatro variantes: dos para hablante único (CTC-TTS-L con 34,7 M de parámetros y CTC-TTS-F con 33,6 M, entrenadas sobre VoiceAssistant400K) y dos multihablante para síntesis zero-shot (CTC-TTS-L con 159,58 M y CTC-TTS-F con 158,47 M, entrenadas sobre LibriSpeech 960h). La variante L concatena tokens de texto y voz en la dimensión de secuencia para priorizar fidelidad, mientras que la F apila los embeddings de fonemas y voz en la dimensión de características para minimizar la latencia de streaming.

Su relevancia actual reside en que demuestra que un alineamiento CTC ligero puede sustituir a MFA en pipelines de síntesis en streaming y mejorar inteligibilidad (WER/CER), latencia de primer paquete y naturalidad (UTMOS) frente a LLMVox, ELLA-V y las variantes alineadas con MFA. El trabajo se ha aceptado en Interspeech 2026 y el checkpoint se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLM con intercalado dual-streaming de tokens de texto y voz; alineador CTC neuronal (base: Whistle ASR); tokenizador de audio WavTokenizer |
| Parámetros totales | 34,7 M (L, hablante único); 33,6 M (F, hablante único); 159,58 M (L, multihablante); 158,47 M (F, multihablante) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); repo de 11,5 GB |

## Arquitectura y entrenamiento

CTC-TTS es un marco de síntesis de voz en streaming guiado por un modelo de lenguaje que genera de forma entrelazada tokens de texto (fonemas) y tokens de voz. La innovación principal es el bloque de intercalado *bi-word*: en lugar de un ratio fijo de tokens texto-voz, se agrupan dos palabras con su contexto de voz asociado y una ventana de look-ahead compacta, lo que se aproxima mejor a las reglas reales de alineamiento fonema-habla. El alineamiento se obtiene con un alineador CTC neuronal derivado del modelo ASR Whistle (thu-spmi/whistle-small), lo que elimina la necesidad de un paso offline de alineamiento forzado con MFA. La representación de audio se apoya en el tokenizador ggml-org/WavTokenizer, sobre el que el modelo se ha afinado.

Las dos variantes difieren en cómo combinan las modalidades: CTC-TTS-L concatena tokens de texto y voz a lo largo de la dimensión de secuencia, lo que mejora la fidelidad de síntesis a costa de una latencia de primer paquete algo mayor; CTC-TTS-F apila los embeddings de fonemas y voz en la dimensión de características, lo que reduce la latencia para escenarios de tiempo real. El entrenamiento se realizó sobre VoiceAssistant400K (variantes de hablante único) y LibriSpeech 960h (variantes multihablante). La model card no detalla el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; únicamente se declara el uso de `openslr/librispeech_asr` y las métricas WER y CER.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio tokenizada mediante WavTokenizer.
- Streaming de baja latencia: la variante F está diseñada para minimizar la latencia del primer paquete (159 ms en el benchmark de hablante único).
- Síntesis zero-shot multihablante: clonación de voz a partir de unos 3 segundos de audio de referencia y su transcripción.
- Tarea de continuación: dada una secuencia de texto y sus primeros 3 segundos de voz, sintetizar el resto manteniendo el hablante.
- Alineamiento fonema-habla interno mediante CTC, sin dependencia de MFA.
- Control de compromiso calidad-latencia mediante la elección de variante L o F.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del prompt de referencia.

## Casos de uso

- Asistentes de voz en tiempo real: la variante CTC-TTS-F, con 33,6 M de parámetros y 159 ms de latencia de primer paquete en el benchmark de hablante único, es adecuada para respuestas habladas de baja latencia en asistentes conversacionales.
- Síntesis de voz para lectura de contenidos largos: la variante CTC-TTS-L, con WER de 1,50 y CER de 0,79 en VoiceAssistant400K, prioriza inteligibilidad cuando la latencia no es crítica.
- Clonación de voz zero-shot: con 3 segundos de audio de referencia y su transcripción, las variantes multihablante generan voz en un timbre similar (SPK de 0,929-0,930 en la tarea de continuación sobre LibriSpeech test-clean).
- Generación de audiolibros y contenido narrado: la tarea de continuación permite mantener la coherencia de hablante a lo largo de segmentos encadenados de un mismo texto.
- Integración en pipelines de producción con `transformers`: al publicarse en formato safetensors y con la etiqueta `endpoints_compatible`, puede desplegarse en infraestructuras de inferencia compatibles con la librería sin conversiones adicionales.
- Evaluación e investigación en alineamiento texto-voz: el alineador CTC y la estructura bi-word sirven como referencia para experimentos que comparen alineamiento CTC frente a MFA en sistemas de síntesis en streaming.
- Sistemas de respuesta de voz en aplicaciones de atención al cliente: las variantes multihablante permiten adaptar el timbre al usuario con un prompt corto, aunque el soporte se limita al inglés.

## Benchmarks y rendimiento

Resultados de la model card. FPL-A = latencia del primer paquete asumiendo texto completo disponible.

Benchmark de streaming con hablante único (VoiceAssistant400K, búsqueda greedy):

| Método | Parámetros | WER (↓) | CER (↓) | FPL-A ms (↓) | UTMOS (↑) |
|---|---|---|---|---|---|
| Ground Truth | — | — | — | — | 4,27 |
| LLMVox | 31,5 M | 2,40 | 1,36 | 167 | 4,15 |
| CTC-TTS-F | 33,6 M | 1,80 | 1,04 | 159 | 4,15 |
| CTC-TTS-L | 34,7 M | 1,50 | 0,79 | 210 | 4,15 |

Tarea de continuación multihablante zero-shot (LibriSpeech test-clean, muestreo nucleus):

| Grupo | Método | Parámetros | WER (↓) | CER (↓) | SPK (↑) | UTMOS (↑) | MOS (↑) | SMOS (↑) |
|---|---|---|---|---|---|---|---|---|
| Ground Truth | — | — | 1,92 | 0,69 | — | 4,086 | 4,28±0,060 | 4,60±0,048 |
| Propuesto | CTC-TTS-F | 158,47 M | 5,20 | 2,68 | 0,930 | 4,013 | 4,31±0,057 | 4,58±0,050 |
| Propuesto | CTC-TTS-L | 159,58 M | 4,82 | 2,47 | 0,929 | 4,050 | 4,33±0,061 | 4,60±0,049 |
| Ablación | CTC+ELLA-V | 159,58 M | 12,01 | 7,37 | 0,928 | 4,021 | 4,00±0,062 | 4,39±0,058 |
| Ablación | MFA+ELLA-V | 159,58 M | 10,98 | 6,99 | 0,928 | 4,021 | 3,94±0,066 | 4,44±0,056 |
| Ablación | MFA+bi-word | 159,58 M | 5,14 | 2,63 | 0,930 | 4,010 | 4,25±0,061 | 4,50±0,051 |

Tarea entre hablantes zero-shot (Seed-TTS test-en, muestreo nucleus):

| Grupo | Método | Parámetros | WER (↓) | CER (↓) | SPK (↑) | UTMOS (↑) | MOS (↑) | SMOS (↑) |
|---|---|---|---|---|---|---|---|---|
| Ground Truth | — | — | — | — | — | 3,527 | 4,18±0,068 | 4,14±0,072 |
| Propuesto | CTC-TTS-F | 158,47 M | 8,02 | 4,20 | 0,880 | 3,903 | 4,16±0,064 | 3,85±0,071 |
| Propuesto | CTC-TTS-L | 159,58 M | 6,33 | 3,21 | 0,878 | 3,971 | 4,23±0,060 | 3,98±0,073 |
| Ablación | CTC+ELLA-V | 159,58 M | 20,86 | 11,73 | 0,869 | 3,848 | 3,88±0,073 | 3,94±0,073 |
| Ablación | MFA+ELLA-V | 159,58 M | 34,89 | 19,58 | 0,872 | 3,873 | 3,75±0,071 | 3,88±0,074 |
| Ablación | MFA+bi-word | 159,58 M | 7,53 | 3,99 | 0,874 | 3,840 | 4,14±0,068 | 3,83±0,076 |

Métricas empleadas: WER/CER para inteligibilidad, UTMOS para naturalidad, SPK para similitud de hablante (WavLM-Base-Plus), y MOS/SMOS por evaluación subjetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 33,6-159,58 M de parámetros, el peso en precisión completa (FP32) se sitúa en el rango de aproximadamente 0,13-0,64 GB, pero la model card no publica cifras de memoria ni de cuantización.
- GPU recomendadas: no disponible. Por el tamaño del modelo, cualquier GPU consumer moderna debería poder alojarlo, pero no se han publicado mediciones.
- Cabe en GPU consumer: previsiblemente sí por el número de parámetros, aunque no se confirma con datos de la model card.
- Opciones de despliegue: librería `transformers` (etiqueta `endpoints_compatible`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la única cifra publicada es la latencia del primer paquete (FPL-A) de 159 ms para CTC-TTS-F y 210 ms para CTC-TTS-L en el benchmark de hablante único. No hay datos de throughput ni de latencia en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque de alineamiento | WER (continuación, LibriSpeech) | WER (entre hablantes, Seed-TTS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CTC-TTS-L | 159,58 M | CTC + bi-word | 4,82 | 6,33 | Apache 2.0 | Hugging Face |
| CTC-TTS-F | 158,47 M | CTC + bi-word | 5,20 | 8,02 | Apache 2.0 | Hugging Face |
| LLMVox | 31,5 M | — | no disponible | no disponible | no disponible | no disponible |
| ELLA-V (con CTC o MFA) | 159,58 M | ELLA-V con CTC o MFA | 12,01 (CTC) / 10,98 (MFA) | 20,86 (CTC) / 34,89 (MFA) | no disponible | no disponible |
| Baseline MFA+bi-word | 159,58 M | MFA + bi-word | 5,14 | 7,53 | no disponible | no disponible |

LLMVox solo se evalúa en el benchmark de hablante único de la model card (WER 2,40, CER 1,36, FPL-A 167 ms, UTMOS 4,15), por lo que no hay datos comparables en las tareas multihablante.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Alcance de la evaluación: los benchmarks publicados se limitan a VoiceAssistant400K, LibriSpeech test-clean y Seed-TTS test-en; no hay resultados en dominios ruidosos, acentos no nativos ni audio espontáneo.
- Alucinación y errores de pronunciación: en la tarea entre hablantes, el WER sube a 6,33 (variante L) y 8,02 (variante F), frente a 1,92 del ground truth, lo que indica errores de contenido en escenarios fuera de dominio.
- Similitud de hablante: el SPK en la tarea entre hablantes se queda en 0,878-0,880, por debajo del 0,929-0,930 de la tarea de continuación; la clonación se degrada con prompts fuera de dominio.
- Dependencia de un prompt de referencia: la síntesis zero-shot multihablante requiere unos 3 segundos de audio y su transcripción; sin ellos no se puede fijar el timbre.
- Licencia: Apache 2.0 permite uso comercial, pero no se documentan restricciones adicionales sobre el uso de la voz clonada ni sobre los datos de entrenamiento más allá de LibriSpeech.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye instrucciones de inferencia, lo que dificulta la reproducibilidad.
- No se documentan sesgos demográficos, de acento o de género en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THU-SPMI/CTC-TTS
- Paper (arXiv 2602.19574): https://arxiv.org/pdf/2602.19574
- Repositorio GitHub: https://github.com/thu-spmi/CTC-TTS
- Modelo base del tokenizador de audio: https://huggingface.co/ggml-org/WavTokenizer
- Modelo ASR Whistle (alineador CTC): https://huggingface.co/thu-spmi/whistle-small
- Laboratorio THU-SPMI: http://oa.ee.tsinghua.edu.cn/ouzhijian
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr

# ssws3/nemotron-hinglish-v6

## Resumen

Nemotron-Hinglish-v6 es un modelo de reconocimiento automático del habla (ASR) especializado en inglés, hindi y hinglish (alternancia de código hindi-inglés). Lo desarrolla el usuario ssws3 como fine-tune de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un modelo de NVIDIA basado en FastConformer-Transducer (RNNT) con streaming cache-aware.

El modelo conserva la arquitectura del base: unas 24 capas, 1024 dimensiones ocultas, aproximadamente 600 millones de parámetros, submuestreo 8x y un vocabulario BPE de 13.088 tokens con 128 prompts de idioma, incluido el prompt `auto` para detección automática. Está pensado para audio mono a 16 kHz y para transcripción por chunks de 80, 160, 320, 560 y 1120 ms.

Su relevancia está en el soporte específico de hinglish, un caso poco cubierto por modelos ASR convencionales. La versión v6 mejora la convergencia respecto a v5: reduce el WER de inglés del 4,2 % al 3,7 % y el de inglés con acento indio del 8,3 % al 5,9 %, manteniendo el fallo de latch en devanagari en el 0,0 % sobre la prueba indicada. La licencia declarada es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT), cache-aware streaming, submuestreo 8x, 24 capas, 1024 dimensiones ocultas |
| Parámetros totales | ~600 M |
| Parámetros activos | No aplica; modelo denso, no es MoE |
| Longitud de contexto | No aplica a ASR; streaming mediante chunks de 80, 160, 320, 560 y 1120 ms |
| Tipos de cuantización | No disponible; no se documentan cuantizaciones en la información proporcionada |
| Idiomas soportados | Inglés (`en`), hindi (`hi`) y hinglish o code-switching hindi-inglés mediante prompt `auto` |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint NeMo (`.nemo`), cargado con `ASRModel.restore_from`; no se indica safetensors ni GGUF |
| Modelo base | `nvidia/nemotron-3.5-asr-streaming-0.6b` |
| Frecuencia de muestreo | 16 kHz mono |
| Vocabulario | 13.088 tokens BPE y 128 prompts de idioma |
| Tarea | Reconocimiento automático del habla con puntuación y mayúsculas preservadas |

## Arquitectura y entrenamiento

El modelo es un FastConformer-Transducer con decoder RNNT y encoder cache-aware para streaming. Mantiene la arquitectura del modelo base de NVIDIA, incluyendo el submuestreo 8x, las 24 capas, las 1024 dimensiones ocultas y el vocabulario multilingüe de 13.088 tokens BPE con 128 prompts de idioma. El prompt `auto` permite detección automática de idioma y facilita la transcripción de fragmentos con alternancia hindi-inglés.

El fine-tune parte del checkpoint v5 y continúa entrenando sobre el mismo corpus mezclado de aproximadamente 5.030 horas y 2.227.473 enunciados: alrededor de 1.690 horas de inglés, incluyendo inglés con acento indio; 1.414 horas de hindi; y 1.922 horas de hinglish code-mixed. Se incluyen corpus densos en números y símbolos para mejorar dígitos y números de teléfono. El entrenamiento usa un scheduler de learning rate coseno, detección automática de idioma con `auto` y conserva puntuación y mayúsculas. No se documenta RLHF ni DPO; es un entrenamiento supervisado de ASR. La corrección del latch en devanagari introducida en v5 se mantiene en v6.

## Capacidades

- Transcripción de audio mono a 16 kHz en inglés, hindi y hinglish.
- Detección automática de idioma mediante el prompt `auto`, orientada a code-switching hindi-inglés.
- Streaming cache-aware con tamaños de chunk configurables de 80, 160, 320, 560 y 1120 ms.
- Generación de transcripciones con puntuación y mayúsculas preservadas.
- Reconocimiento reforzado de números, símbolos y números de teléfono gracias a corpus específicos.
- Soporte de 128 prompts de idioma y vocabulario BPE de 13.088 tokens.
- No soporta tool calling, function calling ni uso como agente.
- No dispone de capacidades de visión, audio generation, traducción, diarización ni timestamps documentadas.

## Casos de uso

- **Atención al cliente en centros de llamadas de India:** transcripción de conversaciones multi-turno en hinglish con el prompt `auto`, útil para analítica de llamadas, búsqueda de motivos de contacto y control de calidad. El soporte de code-switching evita forzar un único idioma en cada intervención.
- **Subtitulado en directo:** integración en pipelines de streaming con chunks de 160 o 320 ms para generar subtítulos de baja latencia en vídeos, webinars o retransmisiones con hablantes que alternan hindi e inglés.
- **Asistentes de voz para dispositivos:** reconocimiento de comandos y dictado en hinglish en entornos locales, con despliegue mediante NeMo y audio de 16 kHz mono.
- **Análisis de conformidad y riesgo:** transcripción de grabaciones de voz para revisión posterior, búsqueda de términos y extracción de números de teléfono o identificadores, aprovechando el corpus denso en números y símbolos.
- **Generación de datasets de voz:** creación de transcripciones pseudo-etiquetadas para entrenar o evaluar otros modelos ASR en hindi, inglés indio y hinglish, con revisión humana en los segmentos de mayor riesgo.
- **Transcripción de reuniones de equipos distribuidos:** conversión de reuniones con hablantes que mezclan hindi e inglés en texto con puntuación, para actas, resúmenes posteriores y búsqueda interna.
- **Dictado de notas en entornos profesionales:** transcripción de notas de campo, informes o incidencias en inglés indio o hindi, con la advertencia de que el WER en hindi es del 12,5 % en la evaluación publicada.

## Benchmarks y rendimiento

Resultados publicados en la model card: decodificación greedy, WER insensible a puntuación, prompt `auto` y muestra held-out no detallada.

| Idioma | Nemotron-Hinglish-v5 | Nemotron-Hinglish-v6 |
|---|---:|---:|
| Inglés | 4,2 % | **3,7 %** |
| Hindi | 12,5 % | **12,5 %** |
| Hinglish | 28,6 % | **27,3 %** |

Prueba específica de inglés con acento indio sobre 200 enunciados held-out:

| Métrica | Nemotron-Hinglish-v5 | Nemotron-Hinglish-v6 |
|---|---:|---:|
| Latch en devanagari | 0,0 % | **0,0 %** |
| WER | 8,3 % | **5,9 %** |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de modelos de lenguaje en la información disponible; no aplican a un modelo ASR.

## Requisitos de hardware

| Configuración | VRAM estimada | Notas |
|---|---:|---|
| FP16, lote pequeño | 2-3 GB | Estimación a partir de ~600 M de parámetros; no medida |
| FP16, lote 4 | 4-6 GB | Estimación; depende de la longitud de audio y del chunk |
| INT8 | 1,5-2,5 GB | Estimación teórica; no hay cuantizaciones documentadas |
| CPU | 2-4 GB de RAM | Posible con NeMo; throughput no disponible |

- **GPU recomendadas:** NVIDIA T4, L4, RTX 3060 12 GB, RTX 4090, A100. El modelo cabe en GPUs de consumo con 6-8 GB o más.
- **Despliegue:** la vía documentada es NeMo, con `nemo_asr.models.ASRModel.restore_from` y `model.transcribe`. Riva o Triton podrían servir el modelo, pero no se confirma en la información disponible. vLLM, llama.cpp y Ollama no son runtimes adecuados para este modelo ASR.
- **Latencia:** los chunks de streaming van de 80 a 1120 ms; el chunk mínimo no implica necesariamente una latencia total de 80 ms, ya que depende del buffer y del lookahead no documentado. No se publican cifras de throughput ni de latencia extremo a extremo.
- **Formato del repositorio:** 2,6 GB; contiene el checkpoint NeMo, no pesos GGUF ni safetensors.

## Comparativa con modelos similares

| Modelo | Parámetros | Streaming / contexto | Idiomas | Licencia | WER publicado |
|---|---:|---|---|---|---|
| Nemotron-Hinglish-v6 | ~600 M | Chunks de 80-1120 ms | Inglés, hindi y hinglish con `auto` | Apache-2.0 | Inglés 3,7 %; hindi 12,5 %; hinglish 27,3 % |
| `nvidia/nemotron-3.5-asr-streaming-0.6b` | ~600 M | Chunks de 80-1120 ms | Multilingüe con 128 prompts; idiomas exactos no detallados | No disponible en la información proporcionada | No disponible |
| Nemotron-Hinglish-v5 | No disponible en la información proporcionada | No disponible | Inglés, hindi y hinglish según la comparativa | No disponible en la información proporcionada | Inglés 4,2 %; hindi 12,5 %; hinglish 28,6 % |

No se incluyen cifras de alternativas externas como Whisper large-v3 porque no hay datos verificados en la información proporcionada. La comparación directa disponible se limita al modelo base y al checkpoint v5.

## Limitaciones y advertencias

- El WER en hinglish es del 27,3 %, alto para producción sin revisión humana o sin un proceso de corrección posterior.
- El WER en hindi es del 12,5 %, adecuado para transcripción asistida pero no necesariamente para sustituir revisión en dominios críticos.
- La evaluación publicada se basa en muestras held-out no detalladas y en 200 enunciados para inglés con acento indio; son muestras pequeñas y no cubren todos los acentos, ruidos ni dominios.
- El modelo está limitado a inglés, hindi e hinglish; no se documentan otras lenguas indias ni traducción.
- Puede producir sustituciones, inserciones y omisiones, especialmente con ruido, solapamiento de hablantes, audio de baja calidad o cambios de idioma en fronteras de palabra.
- El latch en devanagari se mantiene en 0,0 % en la prueba indicada, pero conviene monitorizarlo en producción con audio real.
- No se documentan diarización, timestamps, detección de hablante ni segmentación por interlocutor.
- El rendimiento en streaming depende del chunk elegido; chunks más pequeños reducen latencia pero pueden degradar precisión.
- La licencia declarada es Apache-2.0, pero debe verificarse la licencia del modelo base y de los corpus de entrenamiento antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.
- No se dispone de información sobre cuantizaciones oficiales, por lo que el uso en entornos con VRAM muy limitada requiere validación propia.

## Enlaces

- [HuggingFace: ssws3/nemotron-hinglish-v6](https://huggingface.co/ssws3/nemotron-hinglish-v6)
- [Modelo base: nvidia/nemotron-3.5-asr-streaming-0.6b](https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b)

No se han proporcionado papers, blogs, repositorios o demos adicionales en la información disponible.

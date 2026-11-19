# tanzilidrisi/Foreword-29M

## Resumen
Foreword 29M es un modelo de reconocimiento automático del habla (ASR) en inglés, disenado especificamente para transcripcion en streaming de baja latencia en agentes de voz y dispositivos con recursos limitados. Lo desarrolla el autor independiente tanzilidrisi como un fine-tuning del modelo Moonshine Streaming Tiny de Moonshine AI, y se distribuye bajo licencia MIT. Su propuesta central es poco habitual: en lugar de esperar a que termine una frase para transcribirla, emite la mayoria de las palabras antes de que el hablante las termine de pronunciar, con una ventana de actualizacion de 80 ms.

El modelo tiene 29,2 millones de parametros con pesos cuantizados a 4 bits, lo que resulta en un archivo de solo 16,79 MB (17,61 MB incluyendo configuracion y tokenizer). Esto lo hace apto para ejecutarse en un unico hilo de CPU, sin GPU, lo que abre la puerta a despliegues en navegador, moviles o sistemas embebidos. La arquitectura subyacente es la de Moonshine, un transformer optimizado para audio de duracion variable.

Su relevancia actual radica en el creciente interes por agentes de voz conversacionales que requieren respuestas casi instantaneas. Foreword aborda el cuello de botella de la latencia en ASR: sus mediciones indican que el 77,5% de las palabras en clips de audiolibro son correctas y definitivas antes de que el hablante las termine, con una mediana de 90 ms de antelacion. Es un modelo especializado, no generalista: solo ingles, solo voz, pero con un rendimiento en WER competitivo frente a su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Moonshine Streaming Tiny) |
| Parametros totales | 29,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos publicados); existe variante `long-full-precision` a precision completa (117 MB) |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; se menciona un archivo de pesos de 16,79 MB) |

## Arquitectura y entrenamiento
Foreword parte de `moonshine-ai/moonshine-streaming-tiny`, un modelo de la familia Moonshine disenado para ASR en streaming. La arquitectura es un transformer adaptado a audio, con un mecanismo de decodificacion que permite emitir actualizaciones parciales cada 80 ms de audio entrante. El autor no detalla en la model card la composicion exacta del dataset de fine-tuning ni el numero de tokens de entrenamiento; si indica que los conjuntos de entrenamiento de LibriSpeech, AMI y VoxPopuli forman parte de los datos de entrenamiento, mientras que TED-LIUM, Earnings22, GigaSpeech y SPGISpeech no.

La innovacion tecnica principal no esta en la arquitectura base sino en el proceso de fine-tuning y en la interfaz de streaming: el modelo produce actualizaciones incrementales con `text` (transcripcion acumulada), `words` (cada palabra con su confianza), `guess` (hasta dos palabras predichas con confianza) y `time` (segundos de audio procesados). Las palabras pueden ser revisadas por actualizaciones posteriores. El modelo se distribuye con un script `foreword.py` que implementa la logica de streaming y la CLI. No se menciona el uso de RLHF o DPO en la informacion disponible.

## Capacidades
- Transcripcion de voz a texto en ingles con salida incremental cada 80 ms de audio.
- Emision temprana de palabras: la mayoria se emiten antes de que el hablante las termine.
- Salida con confianza por palabra y prediccion de las siguientes palabras (`guess`).
- Procesamiento en streaming con chunks de cualquier tamano (audio mono a 16 kHz).
- Revision retroactiva de palabras ya emitidas en actualizaciones posteriores.
- Ejecucion en un unico hilo de CPU, sin GPU.
- Transcripcion de archivos completos (`transcribe`) y modo en vivo (`stream`).
- No soporta tool calling, agentes multi-step, vision ni audio mas alla de ASR.
- Capacidad multilingue limitada al ingles.

## Casos de uso
- Agentes de voz conversacionales: el modelo puede alimentar el bucle de escucha de un asistente por voz, emitiendo la transcripcion parcial mientras el usuario habla para que el agente empiece a procesar la intencion antes de que termine la frase, reduciendo la latencia percibida.
- Subtitulado en vivo de baja latencia: en retransmisiones o videollamadas, la emision temprana de palabras (mediana de 90 ms antes del final de la palabra en clips de audiolibro) permite generar subtitulos casi sincronizados.
- Transcripcion en navegador o movil: con 17 MB de pesos y ejecucion en un hilo de CPU, puede integrarse en aplicaciones web (via WebAssembly) o apps moviles sin depender de la nube.
- Dictado por voz en editores de texto: la salida incremental con confianzas por palabra permite mostrar texto provisional y corregirlo en tiempo real mientras el usuario dicta.
- Actas de reuniones en dispositivos locales: con un WER del 8,17% en clips de reunion de NOTSOFAR-1, es adecuado para transcribir reuniones en equipos sin GPU, priorizando privacidad al no enviar audio a servidores.
- Sistemas de atencion al cliente telefonicos: puede transcribir en tiempo real llamadas en ingles en infraestructura de CPU, permitiendo analisis de sentimiento o enrutamiento basado en palabras clave antes de que termine la llamada.
- Domotica y asistentes embebidos: en dispositivos con CPU limitada (Raspberry Pi, microcontroladores de gama alta), puede actuar como front-end de reconocimiento de comandos de voz.

## Benchmarks y rendimiento
Resultados publicados por el autor en la model card, medidos con los scripts del proyecto Foreword.

Precision en clips completos (normalizador de texto estilo Whisper):

| LibriSpeech test-clean | LibriSpeech test-other | AMI test (re-cut) | NOTSOFAR-1 eval |
|---|---|---|---|
| 4,58% | 13,16% | 18,50% | 9,86% |

Conjuntos de test del Open ASR Leaderboard (clip completo en un paso, normalizador del leaderboard):

| TED-LIUM | VoxPopuli | LibriSpeech clean | Earnings22 | LibriSpeech other | AMI | GigaSpeech | SPGISpeech | Media |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 6,77% | 12,30% | 4,50% | 22,42% | 13,09% | 18,08% | 14,07% | 7,79% | 12,38% |

Comparativa directa con Moonshine Tiny (su runtime, 45 MB) en los mismos ocho conjuntos:

| Modelo | Archivo | TED-LIUM | VoxPopuli | LibriSpeech clean | Earnings22 | LibriSpeech other | AMI | GigaSpeech | SPGISpeech | Media |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Moonshine Tiny (runtime propio) | 45 MB | 7,80% | 15,67% | 5,61% | 23,64% | 15,28% | 26,23% | 14,92% | 8,20% | 14,67% |
| Foreword 29M | 17 MB | 6,77% | 12,30% | 4,50% | 22,42% | 13,09% | 18,08% | 14,07% | 7,79% | 12,38% |

Latencia de emision temprana (clips alimentados en pasos de 80 ms; una palabra cuenta como temprana si es correcta y no cambia antes de que el hablante la termine):

| Clips | Modelo | Palabras correctas antes del final | Mediana temporal respecto al final de la palabra | WER en esos clips |
|---|---|---|---|---|
| 100 clips LibriSpeech test-clean | Moonshine Tiny (runtime propio) | 3,3% | 270 ms despues | 6,14% |
| | Foreword 29M | 77,5% | 90 ms antes | 4,87% |
| 272 clips NOTSOFAR-1 | Moonshine Tiny (runtime propio) | 5,2% | 300 ms despues | 11,43% |
| | Foreword 29M | 67,8% | 80 ms antes | 8,17% |

Mejora de Foreword frente a Moonshine Tiny: +74,3 puntos de palabras tempranas en clips de audiolibro (IC 95%: +71,9 a +76,6) y +62,6 en clips de reunion (+60,5 a +64,6). En WER, 1,3 puntos menos en audiolibro (-2,6 a +0,1) y 3,3 menos en reunion (-4,5 a -2,0).

## Requisitos de hardware
- VRAM: no requiere GPU; el modelo esta pensado para CPU.
- CPU: funciona en un unico hilo; el autor reporta 12-13 ms de computo por cada 80 ms de audio en un hilo de Apple M5.
- GPU recomendadas: no aplica; cualquier GPU moderna puede ejecutarlo pero no es necesario.
- Cabe en cualquier GPU consumer, pero su ventaja es precisamente no necesitarla.
- Opciones de despliegue: el propio script `foreword.py` (incluido en el repo), con `torch` y `transformers>=5`; tambien `soundfile` y `huggingface_hub` para carga de audio y pesos.
- Latencia: actualizaciones cada 80 ms de audio; 12-13 ms de computo por paso en Apple M5 (un hilo).
- Throughput estimado: no disponible de forma explicita; implicito en la relacion 12-13 ms por 80 ms de audio, lo que sugiere capacidad de tiempo real con margen amplio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | WER medio Open ASR |
|---|---|---|---|---|---|---|
| Foreword 29M | 29,2 M | no disponible | Ingles | MIT | no disponible | 12,38% |
| Moonshine Streaming Tiny | no disponible | no disponible | Ingles | no disponible | no disponible | 14,67% (runtime propio) |
| Whisper Tiny | 39 M | 30 s (ventana) | Multilingue | MIT | safetensors, GGUF | no disponible en esta ficha |
| Whisper Base | 74 M | 30 s (ventana) | Multilingue | MIT | safetensors, GGUF | no disponible en esta ficha |

La comparacion mas directa y documentada es con Moonshine Streaming Tiny, su modelo base, sobre el que Foreword mejora en WER en los ocho conjuntos del Open ASR Leaderboard y en la anticipacion de palabras. Frente a Whisper Tiny o Base, Foreword ofrece streaming nativo y menor latencia, pero carece de soporte multilingue y de la madurez de ecosistema de Whisper. No se dispone de datos de benchmarks de Whisper en la informacion proporcionada para una comparacion cuantitativa.

## Limitaciones y advertencias
- Solo reconoce ingles; no soporta otros idiomas.
- Es exclusivamente ASR: no genera texto libre, no razona, no hace tool calling ni procesa vision.
- El WER en dominios alejados del entrenamiento es alto: 22,42% en Earnings22 y 18,08% en AMI.
- Riesgo de alucinacion en audio silencioso o ruidoso: en el runtime de Moonshine Tiny se reportaron 3.364 de 12.643 clips de AMI sin texto devuelto, casi todos de menos de un segundo; Foreword puede comportarse de forma similar en clips muy cortos.
- Las palabras emitidas pueden ser revisadas por actualizaciones posteriores; los consumidores deben manejar texto mutable.
- El modelo tiene muy pocas descargas y likes (0 descargas, 1 like en el momento de la consulta), lo que implica escasa validacion externa.
- El repo es de 0.0 GB segun Hugging Face, lo que puede indicar que los pesos no estan subidos o que el tamano no se ha calculado correctamente; conviene verificar la disponibilidad real de los archivos antes de integrarlo.
- La licencia MIT permite uso comercial, pero el modelo base (Moonshine Streaming Tiny) puede tener sus propias condiciones; no se detallan en la informacion disponible.
- No hay informacion sobre sesgos demograficos o acentuales; al ser un fine-tuning sobre datos mayoritariamente de audiolibros y reuniones, es probable un sesgo hacia ingles estadounidense culto.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tanzilidrisi/Foreword-29M
- Modelo base: https://huggingface.co/moonshine-ai/moonshine-streaming-tiny
- Repositorio del proyecto Foreword: no disponible como enlace directo en la informacion proporcionada (el script `foreword.py` se menciona como incluido en el repo del modelo)
- Paper de Moonshine: no disponible en la informacion proporcionada
- Open ASR Leaderboard: no disponible como enlace en la informacion proporcionada

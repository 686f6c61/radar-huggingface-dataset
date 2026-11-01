# TheBiggyBang/whisper-small-tunisian-derja-ct2

## Resumen

`whisper-small-tunisian-derja-ct2` es la exportación a CTranslate2 del ajuste fino de Whisper-small para árabe tunecino (derja) con alternancia de código francés/inglés, desarrollado por TheBiggyBang. El modelo original parte de `openai/whisper-small` y se ha convertido al formato de CTranslate2 cuantizado en `int8_float16` (250 MB), lo que permite su uso con faster-whisper tanto en GPU como en CPU. Resuelve un problema concreto: el Whisper-small original obtiene un WER del 79,1 % sobre derja, mientras que este ajuste lo reduce al 30,4 % en el mismo conjunto de evaluación.

La relevancia actual reside en que el árabe tunecino es una variedad dialectal con escasa representación en los corpus de ASR estándar, y este modelo demuestra que un ajuste fino sobre datos específicos (LinTO Tunisian Arabic) más una cuantización agresiva permite desplegar ASR de calidad aceptable en hardware modesto, incluida una GPU T4 o una CPU de 4 núcleos. Incluye además un script `live_asr.py` que implementa transcripción pseudo-streaming con VAD de Silero y decodificación parcial.

El repositorio tiene 72 descargas, 0 likes, licencia Apache 2.0 y fue creado el 26 de octubre de 2026. El tamaño total del repo es de 0,2 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) exportado a CTranslate2 |
| Parámetros totales | no disponible (Whisper-small tiene ~244 M en el modelo original, no confirmado en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper, no confirmado explícitamente) |
| Tipos de cuantización | int8_float16 (GPU), int8 (CPU) |
| Idiomas soportados | aeb (árabe tunecino), ar, fr, en |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), con `config.json`, `vocabulary.json`, `tokenizer.json`, `preprocessor_config.json` |

## Arquitectura y entrenamiento

El modelo es un Whisper-small completo (encoder-decoder transformer con atención estándar) sometido a ajuste fino completo sobre `openai/whisper-small` durante 10,3 horas en 2× T4, con 4.071 pasos y batch de 32. El mejor checkpoint se seleccionó en el paso 3.416 según el WER normalizado de validación. Los datos de entrenamiento provienen de las configuraciones `default` de `linagora/linto-dataset-audio-ar-tn` (40 %) y `linagora/linto-dataset-audio-ar-tn-augmented` (60 %). La partición de desarrollo y test se realiza por grabación a partir de todos los splits de test originales, y las frases de evaluación se incluyeron en una lista de bloqueo para excluirlas del entrenamiento.

La innovación técnica destacable no está en la arquitectura sino en el pipeline de despliegue: la conversión a CTranslate2 con `ct2-transformers-converter` y cuantización `int8_float16`, junto con un motor de streaming (`live_asr.py`) que combina VAD de Silero, redecodificación cada 0,6 s para texto parcial y fijación de palabras en las que dos decodificaciones coinciden, finalizando el turno con beam search tras 500 ms de silencio. No se menciona uso de RLHF ni DPO.

## Capacidades

- Reconocimiento automático de voz (ASR) para árabe tunecino (derja) con etiqueta de idioma `ar`.
- Manejo de alternancia de código (code-switching) árabe-francés-inglés, declarado en los tags y en los idiomas soportados.
- Transcripción por lotes de audio pre-segmentado con beam search (beam 3 recomendado).
- Transcripción pseudo-streaming desde micrófono con texto parcial y finalización por silencio.
- Detección de actividad de voz (VAD) integrada mediante Silero para grabaciones largas.
- Ejecución en GPU (`int8_float16`) y en CPU (`int8`).
- No se declaran capacidades de traducción, diarización, timestamps precisos ni tool calling.

## Casos de uso

- **Transcripción de reuniones y entrevistas en derja:** el modelo procesa audio pre-segmentado con `beam_size=3` y `vad_filter=True` para grabaciones largas, con un WER normalizado del 29,5 % que permite obtener actas utilizables con revisión humana posterior.
- **Subtitulado de contenido audiovisual tunecino:** con RTF de 0,044 en GPU T4, un vídeo de una hora se transcribe en aproximadamente 2,6 minutos, lo que hace viable procesar catálogos completos por lotes.
- **Atención al cliente en centros de llamadas:** el modelo soporta la alternancia árabe-francés habitual en Túnez, y su ejecución en CPU int8 (RTF 0,889 en 4 hilos) permite desplegarlo en servidores sin GPU para transcripción diferida de llamadas.
- **Dictado y asistencia por voz en local:** `live_asr.py` ofrece texto parcial con latencia de 1,0–1,4 s en GPU T4 y finalización en 0,4–0,8 s tras dejar de hablar, adecuado para aplicaciones de escritorio con micrófono.
- **Generación de corpus anotados para NLP en árabe tunecino:** dado que el dominio derja carece de datos textuales, el modelo puede transcribir archivos de audio de LinTO y otros corpus para construir datasets de texto etiquetado.
- **Investigación en ASR dialectal de bajo recursos:** el repositorio incluye el cuaderno de entrenamiento y la evaluación completa en GitHub, lo que permite reproducir el ajuste fino y comparar con el Whisper-small base (WER 79,1 % frente a 30,4 %).
- **Transcripción en dispositivos con recursos limitados:** el peso cuantizado de 250 MB en int8 permite ejecución en CPU de 4 núcleos con `--no-partials`, con RTF de 0,49–0,80.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de test retenido de LinTO Tunisian Arabic (482 clips, 36,6 min, disjunto por grabación):

| Decodificador | WER | WER normalizado (IC 95 %) | CER | RTF |
|---|---|---|---|---|
| whisper-small sin ajuste, beam 3 | 79,1 | 76,3 (73,8–79,0) | 44,5 | 0,078 |
| **Este modelo, GPU int8_float16, beam 3** | **30,4** | **29,5** (27,5–31,6) | **12,0** | **0,044** |
| Este modelo, GPU int8_float16, greedy | 34,6 | 33,8 (30,5–38,6) | 15,0 | 0,042 |
| Este modelo, CPU int8 (4 hilos), greedy, subconjunto de 80 clips | 31,0 | 30,3 | 13,2 | 0,889 |

Latencia medida en streaming (mediana, audio de test reproducido en tiempo real):

| Configuración | Primeras palabras | Texto final tras silencio | RTF |
|---|---|---|---|
| GPU (T4), con parciales | 1,0–1,4 s | 0,4–0,8 s | 0,13–0,30 |
| CPU (4 hilos), con parciales | 4,7–5,2 s | 1,6–4,3 s | 1,05–1,16 (no alcanza tiempo real) |
| CPU (4 hilos), solo final (`--no-partials`) | no aplica | 3,1–3,9 s | 0,49–0,80 |

Sobre 10 s de ruido puro, ninguna configuración produjo texto. Los valores de GPU proceden de una única T4 y los de CPU de una máquina Kaggle de 4 vCPU.

## Requisitos de hardware

- **VRAM estimada:** el peso cuantizado ocupa 250 MB; con overhead de runtime, la inferencia en GPU cabe holgadamente en menos de 2 GB de VRAM.
- **GPU recomendadas:** T4 (medida por el autor), y por tamaño cualquier GPU consumer con al menos 2 GB libres (RTX 3060, RTX 4060, etc.).
- **CPU:** funciona en 4 núcleos con `device="cpu"` y `compute_type="int8"`; para streaming en tiempo real se recomienda `--no-partials` o una máquina con más núcleos.
- **Cabe en GPU consumer:** sí, cualquier GPU con 2 GB o más de VRAM.
- **Opciones de despliegue:** faster-whisper con CTranslate2 (soporte nativo del repo); el script `live_asr.py` requiere `faster-whisper`, `av<19`, `sounddevice`, `soundfile` y `numpy`.
- **Latencia y throughput:** RTF 0,044 en GPU T4 con beam 3 (unas 23 veces más rápido que tiempo real); RTF 0,889 en CPU int8 con 4 hilos en modo greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER en derja (LinTO test) | Licencia | Formato |
|---|---|---|---|---|---|
| whisper-small-tunisian-derja-ct2 (este) | no disponible (base Whisper-small) | no disponible | 30,4 (beam 3, GPU) | Apache 2.0 | CTranslate2 int8 |
| whisper-small (sin ajuste) | no disponible (base Whisper-small) | no disponible | 79,1 (beam 3) | MIT (modelo original, no confirmado en la información) | safetensors / múltiples |
| whisper-small-tunisian-derja (Transformers) | no disponible (base Whisper-small) | no disponible | no disponible en la información | Apache 2.0 | safetensors |

No se dispone en la información proporcionada de datos de otros modelos ASR específicos para derja (por ejemplo, variantes de SeamlessM4T o MMS) que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Solapamiento de hablantes posible:** el conjunto de test es disjunto por grabación pero no por hablante, porque los datos no incluyen identificadores de hablante; las métricas pueden ser optimistas si hay hablantes compartidos entre train y test.
- **Riesgo de alucinación:** como todo Whisper, puede generar texto plausible en segmentos con ruido o silencio; el autor verificó que 10 s de ruido puro no producen texto, pero no se documenta el comportamiento en ruido con habla.
- **Idioma:** el modelo fue ajustado con el token de idioma `ar`; usar `language="ar"` es obligatorio para obtener los resultados reportados. No se garantiza rendimiento en otras variedades de árabe distintas de la derja.
- **Streaming en CPU:** con parciales, el RTF en 4 hilos (1,05–1,16) supera el tiempo real y el sistema se retrasa; es necesario usar `--no-partials` o más núcleos.
- **Licencia:** Apache 2.0 permite uso comercial, pero el modelo base Whisper-small de OpenAI tiene su propia licencia que conviene verificar antes de un despliegue comercial.
- **Datos de entrenamiento:** provienen de LinTO, un corpus acotado; el dominio (vocabulario, acentos, condiciones de grabación) puede no generalizar a otros contextos.
- **Métricas no verificadas:** los resultados del model-index tienen `verified: false`; proceden del autor y no de una evaluación independiente.
- **Adopción muy baja:** 72 descargas y 0 likes en el momento de la ficha, sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/TheBiggyBang/whisper-small-tunisian-derja-ct2
- Modelo base (Transformers): https://huggingface.co/TheBiggyBang/whisper-small-tunisian-derja
- Repositorio GitHub (código, cuaderno de entrenamiento y evaluación): https://github.com/TheBiggyBang1/whisper-tn-ct2
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
- Dataset LinTO Tunisian Arabic: https://huggingface.co/datasets/linagora/linto-dataset-audio-ar-tn
- Dataset LinTO Tunisian Arabic augmented: https://huggingface.co/datasets/linagora/linto-dataset-audio-ar-tn-augmented
- Paper Whisper (arXiv:2212.04356): https://arxiv.org/abs/2212.04356
- Paper referenciado arXiv:2309.11327: https://arxiv.org/abs/2309.11327
- Paper referenciado arXiv:2504.02604: https://arxiv.org/abs/2504.02604

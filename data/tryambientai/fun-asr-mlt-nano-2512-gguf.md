# tryambientai/Fun-ASR-MLT-Nano-2512-gguf

## Resumen

Fun-ASR-MLT-Nano-2512 en formato GGUF es una conversión del modelo de reconocimiento automático del habla (ASR) multimodal Fun-ASR-MLT-Nano-2512, desarrollado originalmente por Tongyi Lab (Alibaba). Esta versión GGUF la publica el usuario tryambientai y está pensada para ejecutarse con transcribe.cpp, un runtime en C++ derivado de llama.cpp orientado a inferencia ASR local. El modelo resuelve el problema de la transcripción offline multilingüe en hardware modesto, cubriendo 31 idiomas con especial énfasis en lenguas de Asia Oriental y Sudoriental.

Arquitectónicamente es un modelo tipo audio-LLM de aproximadamente 830 millones de parámetros totales: un codificador SenseVoiceEncoderSmall congelado, un adaptador de audio de 2 capas y un LLM Qwen3-0.6B que actúa como decodificador. La entrada es audio WAV mono a 16 kHz y la salida es texto plano. No soporta streaming, ni traducción, ni marcas de tiempo, pero sí normalización inversa de texto (ITN) mediante el flag `--itn`.

Su relevancia actual radica en que ofrece cobertura multilingüe amplia en un paquete de menos de 1 GB (en cuantización Q4_K_M son 531 MB), con calidad de transcripción en inglés competitiva (WER del 1,74 % en LibriSpeech test-clean en BF16) y capacidad de ejecución en CPU y GPU de consumo. Es una alternativa práctica para despliegues locales de transcripción sin depender de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Audio-LLM: SenseVoiceEncoderSmall (congelado) + adaptador de audio de 2 capas + Qwen3-0.6B como decodificador |
| Parámetros totales | 829.791.840 (~830 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 31: zh, en, yue, ja, ko, vi, id, th, ms, tl, ar, hi, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, pl, pt, ro, sk, sl, sv |
| Licencia | FunASR Model Open Source License Agreement v1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de audio-LLM en dos etapas: un codificador de voz SenseVoiceEncoderSmall congelado extrae representaciones acústicas del audio de entrada (WAV mono a 16 kHz), un adaptador de audio de 2 capas proyecta esas representaciones al espacio del LLM, y un Qwen3-0.6B preentrenado genera el texto de transcripción de forma autoregresiva. Solo se entrenan el adaptador y el LLM; el codificador permanece congelado durante el ajuste.

Según la model card original de Tongyi Lab, el modelo se entrenó sobre "cientos de miles de horas" de audio multilingüe real, una cantidad notablemente inferior a las "decenas de millones de horas" del modelo Fun-ASR-Nano estándar, lo que explica que esta variante MLT priorice la cobertura de idiomas sobre la precisión en inglés. No se detalla en la información disponible la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La decodificación es greedy a través del head Qwen3-0.6B. La conversión GGUF está validada contra la referencia FunASR 1.3.1 en el commit f094d28 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto offline en 31 idiomas, con foco en chino, inglés, cantonés, japonés, coreano, vietnamita, indonesio, tailandés, malayo y filipino.
- Cobertura de 19 lenguas europeas adicionales: búlgaro, croata, checo, danés, neerlandés, estonio, finés, griego, húngaro, irlandés, letón, lituano, maltés, polaco, portugués, rumano, eslovaco, esloveno y sueco.
- Normalización inversa de texto (ITN) activable mediante `--itn` en la CLI o `transcribe_funasr_nano_params { use_itn }` en la API de librería.
- Entrada de audio WAV mono a 16 kHz; requiere conversión previa con ffmpeg si el audio original no cumple ese formato.
- No soporta streaming (procesamiento por lotes de audio completo).
- No soporta traducción entre idiomas.
- No genera marcas de tiempo.
- No incluye detección automática de idioma (lang_detect: false).
- No soporta tool calling ni comportamiento de agente; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones completas en WAV de 16 kHz y genera texto plano en cualquiera de los 31 idiomas, adecuado para equipos distribuidos en Europa y Asia que necesitan actas locales sin enviar audio a la nube.
- Subtitulado de contenido audiovisual multilingüe: dado que cubre chino, japonés, coreano, vietnamita y lenguas europeas, sirve para generar borradores de subtítulos en pipelines de postproducción, aunque sin marcas de tiempo habrá que alinear el texto con herramientas externas.
- Atención al cliente y análisis de llamadas: transcripción batch de grabaciones telefónicas o de VoIP para alimentar sistemas de análisis de sentimiento o extracción de entidades; el tamaño reducido (531 MB en Q4_K_M) permite desplegarlo en servidores modestos.
- Notas de voz en aplicaciones móviles o de escritorio: con cuantización Q4_K_M y ejecución en CPU (RTF de 4,5 en Ryzen 4750U), es viable integrarlo en apps de dictado offline que no pueden depender de conectividad.
- Investigación lingüística y corpus: la cobertura de 31 idiomas, incluidas lenguas de bajos recursos como el irlandés, maltés o filipino, permite construir corpus transcritos para estudios comparativos o entrenamiento de modelos posteriores.
- Accesibilidad y documentación de entrevistas: transcripción de entrevistas de campo, clases o conferencias en entornos con requisitos de privacidad, donde el procesamiento local evita el envío de datos sensibles a terceros.
- Preprocesado para pipelines de NLP: convertir audio en texto antes de tareas de resumen, búsqueda o clasificación, aprovechando el soporte de ITN para obtener cifras y fechas en formato legible.

## Benchmarks y rendimiento

Resultados de WER en LibriSpeech test-clean (2620 utterances, decodificación greedy con Qwen3-0.6B) publicados por el autor de la conversión GGUF:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 1590 MB | 1,74 % |
| F16 | 1590 MB | 1,74 % |
| Q8_0 | 850 MB | 1,74 % |
| Q6_K | 659 MB | 1,69 % |
| Q5_K_M | 602 MB | 1,77 % |
| Q4_K_M | 531 MB | 1,89 % |

La referencia FunASR 1.3.1 sobre el mismo manifiesto da un 1,76 % (IC 95 % [1,60 %, 1,93 %]); el port BF16 de transcribe.cpp queda a -0,02 puntos porcentuales de esa línea base. El autor advierte que LibriSpeech es solo inglés y que la fortaleza de la variante MLT es la cobertura multilingüe, no la precisión en inglés; para los otros 30 idiomas no se han publicado cifras.

Rendimiento (RTF, menor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 68 |
| Apple M4 Max | CPU | 16 |
| AMD Ryzen 4750U | Vulkan | 9 |
| AMD Ryzen 4750U | CPU | 4,5 |

No se han publicado resultados de benchmarks multilingües (FLEURS, Common Voice u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 531 MB (Q4_K_M) y 1590 MB (BF16/F16), más el overhead del runtime; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; el modelo se beneficia de Metal en Apple Silicon (RTF 68 en M4 Max) y de Vulkan en GPUs AMD (RTF 9 en Ryzen 4750U con iGPU). En NVIDIA funcionaría con backend CUDA si transcribe.cpp lo soporta, aunque no se detalla en la información disponible.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 e iGPU de portátiles recientes.
- Ejecución en CPU viable: RTF de 4,5 en un Ryzen 4750U implica procesar 1 segundo de audio en 4,5 segundos de cómputo; aceptable para batch, no para tiempo real.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y API de librería). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato GGUF está adaptado específicamente a transcribe.cpp.
- Latencia y throughput: los RTF publicados permiten estimar que en M4 Max con Metal se procesa audio aproximadamente 68 veces más rápido que tiempo real; en Ryzen 4750U con CPU, unas 4,5 veces más rápido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---:|---|---|---|
| Fun-ASR-MLT-Nano-2512 (este, GGUF) | ~830 M | 31 | No disponible | FunASR License v1.1 | GGUF |
| Fun-ASR-Nano-2512 | ~800 M (entrenables) | No disponible en la información | No disponible | FunASR License v1.1 | Safetensors |
| Whisper large-v3 | 1550 M | ~99 | 30 s de audio | MIT | Safetensors, GGUF, etc. |
| Whisper small | 244 M | ~99 | 30 s de audio | MIT | Safetensors, GGUF, etc. |

Frente a Whisper large-v3, este modelo ofrece menor tamaño (830 M frente a 1550 M) y un WER en LibriSpeech test-clean de 1,74 % en BF16, pero Whisper cubre más idiomas y tiene licencia MIT, más permisiva. Frente a Whisper small, la cobertura de idiomas es menor (31 frente a ~99) pero la precisión en inglés es sustancialmente mejor. La comparación con Fun-ASR-Nano-2512 es directa: misma arquitectura, pero la variante MLT se entrenó con menos horas de audio y prioriza idiomas sobre precisión.

## Limitaciones y advertencias

- No soporta streaming: solo procesa audio completo, lo que lo descarta para transcripción en tiempo real de llamadas o reuniones en vivo.
- No genera marcas de tiempo, lo que complica el subtitulado y la alineación con vídeo sin herramientas externas.
- No traduce ni detecta idioma automáticamente: el idioma debe especificarse o inferirse por el contexto del audio.
- La licencia FunASR Model Open Source License Agreement v1.1 no es una licencia de código abierto estándar; conviene revisar los términos completos antes de uso comercial, ya que puede incluir restricciones.
- La variante MLT se entrenó con menos datos que Fun-ASR-Nano, por lo que la precisión en inglés puede ser inferior a la del modelo Nano estándar; el autor no publica WER para los otros 30 idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios largos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse con datos reales de múltiples dominios puede heredar sesgos acústicos y dialectales de las fuentes.
- Dependencia de transcribe.cpp: el GGUF no es directamente compatible con llama.cpp u otros runtimes, lo que limita las opciones de despliegue.
- Requiere audio WAV mono a 16 kHz; sin conversión previa fallará o dará resultados degradados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/tryambientai/Fun-ASR-MLT-Nano-2512-gguf
- Modelo base original: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512
- Commit del modelo base usado para la conversión: https://huggingface.co/FunAudioLLM/Fun-ASR-MLT-Nano-2512/commit/cf67a938bf2829959d08fdfb84e186eff02a67ff
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/f094d28
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/fun-asr-mlt-nano-2512.md
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.12508

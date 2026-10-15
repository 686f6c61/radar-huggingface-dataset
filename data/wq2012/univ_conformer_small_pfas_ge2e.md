# wq2012/univ_conformer_small_pfas_ge2e

## Resumen

`univ_conformer_small_pfas_ge2e` es un modelo de verificacion e identificacion de hablante (speaker verification) desarrollado por Quan Wang (`wq2012`) dentro del proyecto FlaxSpeaker, una reproduccion open source, limpia e independiente en JAX/Flax de varios algoritmos de reconocimiento de hablante publicados por Google. El modelo no es un producto oficial de Google: es una reimplementacion de codigo abierto de las tecnicas GE2E, Dr-Vectors, Conformer-ATP y PFAS, con pesos entrenados por el autor sobre corpus publicos (LibriSpeech, CN-Celeb y VoxCeleb).

Tecnicamente es un encoder Conformer de tamano "small" con 2.162.184 parametros que produce embeddings de hablante de 640 dimensiones. Combina pooling temporal atencional sin parametros (PFAS) y una funcion de perdida GE2E softmax durante el entrenamiento, y emplea PFAS tambien como metodo de puntuacion en la fase de verificacion. El frontend de audio es un log-mel de 80 dimensiones a 16 kHz con VAD de energia y normalizacion CMVN.

Su relevancia actual es acotada pero clara: se trata de un modelo extremadamente ligero (menos de 9 MB en fp32) que cabe en cualquier CPU o dispositivo embebido y que sirve como punto de partida reproducible para experimentar con verificacion de hablante multi-dominio (ingles leido, chino multi-genero y audio "in-the-wild"). Sus tasas de error (EER del 15,20 % en LibriSpeech, 21,93 % en CN-Celeb2 y 23,65 % en VoxCeleb1 con una unica utterance) estan lejos de las de modelos de produccion mucho mas grandes, por lo que debe entenderse como una referencia educativa y experimental, no como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (variante `small`), encoder convolucional + auto-atencion, con pooling temporal atencional PFAS |
| Parametros totales | 2.162.184 (pesos en safetensors); 2.162.187 parametros de encoder segun la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se especifica duracion maxima de audio; procesa utterances completas mediante log-mel de 80 dimensiones a 16 kHz) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors y Flax msgpack; no hay versiones GGUF, AWQ, GPTQ ni ONNX) |
| Idiomas soportados | no disponible como lista cerrada; entrenamiento y evaluacion declarados en ingles (LibriSpeech) y chino (CN-Celeb2), con dominio de entrenamiento etiquetado como `universal` |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding | 640 |
| Pooling temporal | PFAS |
| Funcion de perdida de entrenamiento | `ge2e_softmax` |
| Metodo de puntuacion en verificacion | PFAS |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD de energia + CMVN (`WhisperFeatureExtractor`-compatible) |
| Biblioteca de inferencia | `flaxspeaker` (JAX/Flax); pipeline declarado: `audio-classification` |
| Metricas evaluadas | EER, minDCF (@0.01 y @0.10) y ROC-AUC, con intervalos de confianza bootstrap del 95 % |

## Arquitectura y entrenamiento

El backbone es un Conformer de configuracion `small`: bloques convolucionales y de auto-atencion apilados sobre representaciones log-mel de 80 dimensiones extraidas a 16 kHz. La model card indica que el entrenamiento se realizo con la perdida `ge2e_softmax` (Generalized End-to-End Loss, arXiv:1710.10467, con la variante mejorada de Dr-Vectors, arXiv:2104.01989), mientras que el pooling temporal y la puntuacion de verificacion usan PFAS (Parameter-Free Attentive Scoring, arXiv:2203.05642), una tecnica de atencion sin parametros adicionales. El pooling atencional sigue el planteamiento de Conformer-ATP (arXiv:2202.12163).

El resultado del encoder es un embedding de hablante de 640 dimensiones por utterance. El frontend incluye deteccion de actividad de voz (VAD) basada en energia y normalizacion CMVN, lo que filtra silencio antes de la extraccion de caracteristicas. El dominio de entrenamiento se declara como `universal`, y los corpus de evaluacion son LibriSpeech (ingles leido), CN-Celeb2 (chino multi-genero) y VoxCeleb1 (celebridades en condiciones reales). La model card no detalla el numero de tokens ni de horas de audio empleadas, la composicion exacta del dataset, ni si hubo etapas de RLHF/DPO (tecnicas que, por otra parte, no aplican a este tipo de modelo). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

Un punto relevante: el autor advierte explicitamente de que los experimentos de los papers originales se realizaron con infraestructura interna propietaria de Google y con datasets internos, no con esta biblioteca ni con estos splits publicos. Por tanto, las cifras de este checkpoint no son directamente comparables con las de las publicaciones de referencia.

## Capacidades

- Extraccion de embeddings de hablante de 640 dimensiones a partir de audio mono a 16 kHz.
- Verificacion de hablante (1:1): comparacion de dos utterances para decidir si pertenecen al mismo hablante, con puntuacion escalar devuelta por el metodo PFAS.
- Identificacion de hablante (1:N): los embeddings pueden indexarse y compararse por similitud coseno para reconocimiento cerrado o abierto.
- Verificacion multi-enrollment: la evaluacion publicada incluye resultados con 3 utterances de enrollment (EER del 11,00 % en LibriSpeech y 16,27 % en el pool universal), lo que indica soporte para agregar varias muestras del mismo hablante.
- Funcionamiento multi-dominio: evaluado simultaneamente en ingles leido (LibriSpeech), chino multi-genero (CN-Celeb2) y audio real de celebridades (VoxCeleb1).
- Frontend robusto con VAD de energia y CMVN, que reduce el impacto de silencios y variaciones de canal.
- Inferencia ligera: 2,16 millones de parametros, apta para CPU y dispositivos de borde.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso, mas alla del pipeline enroll/test de verificacion.
- No dispone de modo "thinking", vision ni audio generativo.

## Casos de uso

- Control de acceso por voz en dispositivos de borde: con menos de 9 MB en fp32, el encoder puede ejecutarse en CPU o SoC de baja potencia para desbloquear un dispositivo comparando el embedding de la frase pronunciada con el enrollment del usuario.
- Verificacion en IVR telefonico con multi-enrollment: agregando tres utterances de enrollment se reduce el EER hasta el 11,00 % en dominios de habla leida, lo que permite validar identidad en flujos de atencion automatizada sin infraestructura GPU.
- Deduplicacion y curaduria de corpus de audio: los embeddings de 640 dimensiones permiten agrupar utterances por hablante para limpiar datasets de entrenamiento o detectar voces repetidas en grandes colecciones.
- Segmentacion y diarizacion como post-proceso: dado que el frontend aplica VAD de energia, el modelo puede etiquetar segmentos de voz por hablante en grabaciones de reuniones o llamadas, siempre que se acepte su tasa de error relativamente alta.
- Analitica de centros de contacto: clasificacion de grabaciones por locutor para medir participacion de agentes y clientes, o para enrutar llamadas a un agente que ya haya atendido a ese hablante.
- Investigacion academica y reproduccion de resultados: al ser una reimplementacion limpia en JAX/Flax con licencia Apache 2.0, sirve para reproducir y comparar las tecnicas GE2E, PFAS y Conformer-ATP sin depender de codigo propietario.
- Personal VAD y wake-word condicionado al hablante: el mismo autor mantiene `personal_vad`, y este encoder puede alimentar sistemas de deteccion de voz dirigidos a un hablante concreto en dispositivos siempre escuchando.
- Prototipado de sistemas anti-fraude y pruebas de concepto: util para validar un flujo completo de verificacion de hablante a coste casi nulo antes de migrar a un modelo de produccion de mayor tamano.

## Benchmarks y rendimiento

Resultados de verificacion con 1 utterance, publicados en la model card:

| Split de evaluacion | Trials | EER (%) | IC 95 % bootstrap (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 15,20 | [13,70, 16,43] | 0,9620 | 0,7633 | 0,9258 |
| CN-Celeb2 (chino multi-genero) | 3.000 | 21,93 | [20,36, 23,47] | 0,9793 | 0,8493 | 0,8646 |
| VoxCeleb1 (celebridades in-the-wild) | 2.000 | 23,65 | [21,80, 25,55] | 0,9810 | 0,8740 | 0,8547 |
| Pool universal (3 dominios) | 8.000 | 19,86 | [19,09, 20,77] | 0,9780 | 0,8425 | 0,8869 |
| Media macro por dominio | 8.000 | 20,26 | no disponible | 0,9741 | 0,8289 | 0,8817 |

Resultados de verificacion con 3 utterances de enrollment:

| Split de evaluacion | Trials | EER 3-utt (%) | IC 95 % bootstrap (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 11,00 | [8,80, 12,90] | 0,7320 | 0,9580 |
| CN-Celeb2 (3-utt) | 1.000 | 17,40 | [15,05, 19,65] | 0,9500 | 0,9033 |
| VoxCeleb1 (3-utt) | 1.000 | 19,80 | [17,35, 22,65] | 0,9360 | 0,8836 |
| Pool universal (3-utt) | 3.000 | 16,27 | [15,00, 17,73] | 0,9093 | 0,9179 |
| Media macro por dominio (3-utt) | 3.000 | 16,07 | no disponible | 0,8727 | 0,9150 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de reconocimiento de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 2.162.184 parametros, los pesos ocupan aproximadamente 8,65 MB en fp32 y 4,33 MB en fp16; el consumo real depende de las activaciones y del buffer de audio.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria es suficiente; una NVIDIA RTX 3060 o superior resulta ya sobredimensionada. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en iGPU.
- Ejecucion en CPU: totalmente viable; es el escenario natural dado el tamano del modelo y su orientacion a dispositivos de borde.
- Opciones de despliegue: la ruta documentada es la biblioteca `flaxspeaker` sobre JAX/Flax, con API Python (`load_pretrained`, `extract_embedding`, `verify`) y un script CLI (`scripts/inference.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientadas a modelos de lenguaje y no aplican aqui.
- Latencia y throughput estimados: no disponible. La model card y la informacion proporcionada no incluyen mediciones de latencia ni de utterances por segundo.
- Requisitos de audio: entrada mono a 16 kHz; el frontend aplica log-mel de 80 dimensiones, VAD de energia y CMVN de forma automatica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad | EER en VoxCeleb1 |
|---|---|---|---|---|---|
| `univ_conformer_small_pfas_ge2e` (este modelo) | 2.162.184 | no especificado; audio completo con log-mel de 80 dim a 16 kHz | apache-2.0 | HuggingFace, PyPI, GitHub | 23,65 % (1-utt) / 19,80 % (3-utt) |
| ECAPA-TDNN (SpeechBrain) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| TitaNet (NVIDIA NeMo) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| WeSpeaker ResNet (variantes) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| x-vector clasico (basado en TDNN) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

Los modelos de la comparativa se citan por categoria (arquitecturas habituales de verificacion de hablante), pero la informacion proporcionada no incluye sus parametros, contextos, licencias ni metricas verificables, por lo que esos campos se marcan como no disponibles. La diferencia estructural mas clara es el orden de magnitud en tamano: este checkpoint usa 2,16 millones de parametros, mientras que las alternativas habituales de produccion manejan decenas de millones, lo que explica en parte sus tasas de error mas altas.

## Limitaciones y advertencias

- Tasas de error altas: EER del 15,20 % en LibriSpeech, 21,93 % en CN-Celeb2 y 23,65 % en VoxCeleb1 con una sola utterance. No es adecuado para control de acceso con requisitos de seguridad estrictos.
- Rendimiento insuficiente para produccion en escenarios adversos: el minDCF@0.01 supera 0,96 en todos los dominios con 1 utterance, lo que implica una tasa elevada de falsos positivos y falsos negativos en umbrales operativos exigentes.
- No es un producto oficial de Google: se trata de una reproduccion independiente tipo clean-room; los autores de los papers originales no avalan ni soportan este checkpoint.
- Los resultados no son comparables con los de las publicaciones de referencia, porque los experimentos originales usaron infraestructura y datasets internos de Google.
- Sesgos de dominio: el mejor resultado se obtiene en habla leida en ingles (LibriSpeech); el rendimiento cae de forma notable en audio espontaneo y multilingue, lo que sugiere dependencia de las condiciones acusticas y del canal de grabacion.
- No hay lista declarada de idiomas soportados, y no se documenta comportamiento en espanol ni en otras lenguas.
- Riesgo de alucinacion: no aplica, ya que el modelo no genera texto. El riesgo equivalente son falsos positivos (aceptar a un impostor) y falsos negativos (rechazar a un hablante legitimo).
- Robustez ante ataques de suplantacion no documentada: no se ofrecen resultados frente a voice spoofing, replay attacks ni deepfakes.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantias por parte del autor ni obligacion de soporte.
- Documentacion incompleta para produccion: no se especifican horas de entrenamiento, composicion exacta del dataset, limites de duracion de audio ni latencias medidas.
- Cero descargas y cero "likes" en HuggingFace en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_conformer_small_pfas_ge2e
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI `flaxspeaker`: https://pypi.org/project/flaxspeaker/
- Perfil del autor en GitHub: https://github.com/wq2012
- Repositorio Personal VAD (1.0 y 2.0) del mismo autor: https://github.com/wq2012/personal_vad
- Paper GE2E, "Generalized End-to-End Loss for Speaker Verification": https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, "Decision Residual Networks and an Improved Loss for Speaker Recognition": https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, "Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech": https://arxiv.org/abs/2202.12163
- Paper PFAS, "Parameter-Free Attentive Scoring for Speaker Verification": https://arxiv.org/abs/2203.05642v3

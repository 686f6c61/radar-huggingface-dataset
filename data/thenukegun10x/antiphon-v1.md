# thenukegun10x/Antiphon-V1

## Resumen

Antiphon V1 es un modelo conjunto de reconocimiento automático del habla (STT) y síntesis de voz (TTS) construido sobre una única columna vertebral transformer compartida. Lo desarrolla el usuario de Hugging Face thenukegun10x y se publicó el 15 de noviembre de 2026 como primera versión (0.1.0). Resuelve el problema de tener que desplegar dos modelos separados para transcribir y sintetizar voz: un solo conjunto de pesos realiza ambas tareas, con frontends congelados específicos por modalidad.

El modelo tiene aproximadamente 117 millones de parámetros (checkpoint fp32 de 445 MiB) más los frontends congelados (Whisper-base encoder, MiniLM-L6, ECAPA y HiFi-GAN). Trabaja con audio a 16 kHz, acepta entradas de hasta 15 segundos y genera salida a 16 kHz. Está entrenado exclusivamente en inglés y se distribuye con licencia Apache-2.0, aunque incorpora componentes de terceros con condiciones propias.

Su relevancia actual radica en la propuesta arquitectónica: un backbone compartido entrenado con objetivos JEPA multimodales (predicción de representaciones audio↔texto) que unifica STT y TTS en un solo modelo. Es un modelo pequeño, de primera generación, con resultados honestos: buena inteligibilidad en TTS, STT de rango medio y clonación de voz zero-shot débil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido de 4 capas con embeddings de modalidad; frontends congelados (Whisper-base encoder para audio, MiniLM-L6 para fonemas); adaptador STT de 2 capas + decoder STT de 4 capas + CTC; cabeza TTS de 4 capas con flow_energy + HiFi-GAN |
| Parametros totales | ~117M (445 MiB en fp32) + frontends congelados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Audio de entrada de hasta 15 s a 16 kHz |
| Tipos de cuantizacion | fp32 (por defecto) y bf16 (opcional); int8/fp8 diferido |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache-2.0 (codigo y pesos), con componentes de terceros bajo sus propios terminos (ECAPA entrenado en VoxCeleb, no comercial) |
| Formato de pesos | PyTorch (.pt): `weights/antiphon.pt` (fp32, 445 MiB) y `weights/antiphon-bf16.pt` (223 MiB); no se distribuye en safetensors pese a la etiqueta del repo |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer compartido. El audio entra por un encoder Whisper-base congelado y se proyecta mediante `proj_audio`; los fonemas entran por un encoder MiniLM-L6 congelado y se proyectan mediante `proj_text`. Ambas proyecciones confluyen en un bloque transformer compartido de 4 capas con embeddings de modalidad. Desde ese tronco, la rama STT usa un adaptador de 2 capas y un decoder de 4 capas con CTC para producir texto; la rama TTS usa una cabeza de 4 capas con `flow_energy` que genera mel-espectrogramas, convertidos a waveform por HiFi-GAN.

El bloque compartido se entrena con objetivos JEPA auto y cruzados (predicción enmascarada de representaciones docentes entre modalidades) combinados con pérdidas supervisadas de STT y TTS. Según la model card, el retrieval cross-modal R@1 alcanza el 98-100% en una sonda interna de desarrollo de 100 vías. El entrenamiento se realizó sobre LibriTTS-R train-clean-100 (CC BY 4.0). El frontend TTS es exacto respecto al entrenamiento: el texto se pasa a mayúsculas y se busca en un CMUdict fijado, sin fallback G2P; los dígitos, letras no ASCII y palabras fuera de vocabulario lanzan `FrontendError`.

## Capacidades

- Reconocimiento automático del habla (STT) en inglés: transcripción de audio de 16 kHz de hasta 15 segundos.
- Síntesis de voz (TTS) en inglés: generación de waveform a 16 kHz a partir de texto.
- Clonación de voz zero-shot mediante un vector de enrollment de speaker de 192 dimensiones extraído con ECAPA.
- Modelo conjunto: un único conjunto de pesos realiza ambas direcciones sin pipeline de dos modelos.
- Decodificación STT con beam attention de 8 y rescoring CTC de 0.5.
- Inferencia con torch SDPA estándar, sin kernels específicos de proveedor; compatible con ROCm, CUDA y CPU.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni capacidades de visión o audio más allá de STT/TTS.

## Casos de uso

- Transcripción de audio corto en inglés: el modelo puede transcribir clips de hasta 15 segundos con decodificación beam + CTC, adecuado para notas de voz, comandos o fragmentos de reunión.
- Síntesis de voz para asistentes: genera waveform a 16 kHz a partir de texto con una voz de referencia, útil para respuestas habladas en aplicaciones de voz en inglés.
- Prototipado de interfaces de voz bidireccionales: al unificar STT y TTS en un solo modelo de ~117M parámetros, simplifica el despliegue en entornos con recursos limitados (VRAM de ~1,1 GiB en STT y ~0,7 GiB en TTS).
- Investigación en modelos conjuntos multimodales: sirve como base reproducible para estudiar objetivos JEPA cross-modal y el entrenamiento de un backbone compartido audio-texto.
- Generación de audio de prueba en pipelines de datos: permite crear muestras de voz sintética en inglés para validar sistemas de ASR o de diarización.
- Despliegue en hardware de consumo o AMD: al usar torch SDPA estándar y funcionar en ROCm, CUDA y CPU, encaja en estaciones con GPU consumer o entornos AMD sin kernels propietarios.
- Transcripción por lotes de clips cortos: con velocidades de 54× (test-clean) y 51× (test-other) en tiempo real sobre una RX 9070 XT, es viable procesar lotes de audio corto en inglés.

## Benchmarks y rendimiento

STT — LibriSpeech (conjuntos del Open ASR Leaderboard):

| Set | WER | CER | Clips | Velocidad |
|---|---:|---:|---:|---:|
| test-clean | 15,66% | 7,99% | 2.382 | 54× tiempo real |
| test-other | 25,71% | 14,24% | 2.768 | 51× tiempo real |

Decodificación: beam attention 8 + rescoring CTC 0.5, normalización mayúsculas-alfanumérico. Aproximadamente el 9% de los clips superan el límite de 15 s y se excluyen (contabilizados en los informes).

TTS — Seed-TTS-eval test-en (protocolo del Open TTS Leaderboard):

| Métrica | Antiphon 0.1 | Rango SOTA |
|---|---:|---:|
| WER (referee Whisper-large-v3) | 2,58% | ~1,2–2,5% |
| Similitud de speaker (WavLM-SV) | 0,214 | ~0,66–0,79 |

Cobertura de 971/1.088 clips (89,2%; 117 omisiones por palabras fuera de CMUdict). Cero salidas inválidas. El scorer de similitud se validó contra grabaciones humanas reales (GT SIM 0,714).

Paridad bf16: WER STT dentro del ruido en 200 clips test-clean (14,96% → 15,12%, mismo número de coincidencias exactas); duraciones TTS idénticas en 7/8 frases de prueba (una +32 ms); deltas a nivel de mel de ~0,04–0,08.

## Requisitos de hardware

- VRAM estimada: ~1,1 GiB en STT y ~0,7 GiB en TTS (fp32 con autocast bf16 en GPU).
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm; los benchmarks de referencia se midieron en una AMD RX 9070 XT (gfx1201), ROCm 7.2.1, torch 2.14.0+rocm.
- Cabe en GPU consumer: sí, con amplio margen; también funciona en CPU en fp32 (lento).
- Opciones de despliegue: paquete de inferencia `antiphon` con `Antiphon.from_pretrained()`, scripts CLI `examples/transcribe.py` y `examples/synthesize.py`; usa torch SDPA estándar, sin kernels específicos. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: STT a 54× tiempo real (test-clean) y 51× tiempo real (test-other) en la RX 9070 XT de referencia.
- Nota multi-GPU: en sistemas con varias GPU, fijar `HIP_VISIBLE_DEVICES` (ROCm) o `CUDA_VISIBLE_DEVICES` (CUDA) antes de ejecutar; seleccionar un dispositivo sin los kernels adecuados produce `hipErrorInvalidKernelFile` en ROCm.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Antiphon V1 | ~117M + frontends congelados | Audio ≤15 s, 16 kHz | STT + TTS conjunto | Apache-2.0 (con componentes de terceros no comerciales) | Hugging Face, 0 descargas al publicarse |
| Whisper-base | ~74M | Audio de 30 s | STT | MIT | Ampliamente disponible |
| Whisper-large-v3 | ~1.550M | Audio de 30 s | STT | MIT (pesos con condiciones de OpenAI) | Ampliamente disponible |
| Parler-TTS / sistemas TTS dedicados | Variable | Texto | TTS | Variable | Variable |

No se dispone de datos de benchmarks comparativos directos entre Antiphon y estos modelos en la información proporcionada; la model card solo ofrece el rango SOTA de referencia para TTS en Seed-TTS-eval.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado.
- STT de rango medio: WER de 15,66% en test-clean y 25,71% en test-other, lejos de los mejores sistemas ASR.
- Clonación de voz zero-shot débil: similitud de speaker de 0,214 frente al rango SOTA de ~0,66–0,79; un único vector ECAPA de 192 dimensiones captura menos detalle que el prompting con audio en contexto.
- Límite de audio de 15 segundos: los clips más largos deben fragmentarse; ~9% de los clips de LibriSpeech se excluyeron por esta razón.
- Frontend TTS estricto: sin fallback G2P; dígitos, letras no ASCII y palabras fuera de CMUdict lanzan `FrontendError`. Los números deben escribirse con letras.
- Licencia: aunque los pesos son Apache-2.0, el encoder ECAPA incluido está entrenado en VoxCeleb (no comercial); es obligatorio revisar `THIRD_PARTY_NOTICES.md` antes de cualquier despliegue comercial.
- bf16 no es bit-idéntico a fp32 y no se ha revalidado perceptualmente; usar fp32 cuando la calidad sea crítica.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de primera versión con 0 descargas, no hay validación externa publicada.
- Modelo de primera generación (0.1.0) con escasa adopción; sin garantías de mantenimiento ni soporte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thenukegun10x/Antiphon-V1
- THIRD_PARTY_NOTICES.md (referenciado en la model card, dentro del repo)
- Informes de benchmarks: carpeta `benchmarks/` del repo (incluye `bf16_weight_parity.json`)
- Documentación de entrenamiento: `end2end/TRAINING.md` (workspace de investigación, no enlazado públicamente en la información disponible)
- Dataset de entrenamiento: parler-tts/libritts_r_filtered (LibriTTS-R train-clean-100, CC BY 4.0)

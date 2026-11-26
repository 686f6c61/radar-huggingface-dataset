# SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Cls

## Resumen

NII-SLT26-Qwen2Audio-Cls es un detector de audio falsificado (anti-spoofing) construido sobre Qwen2-Audio-7B-Instruct. Lo desarrolla el grupo de investigacion de Yamagishi en el NII (National Institute of Informatics, Japon) y se publica como parte del estudio "What Do Deepfake Audio Detectors Hear?" presentado en SLT 2026. El modelo no es un generador de audio ni un asistente conversacional: es un clasificador binario real/fake que reutiliza el backbone de un LLM de audio de 7B y anade una cabeza lineal de dos clases sobre el estado oculto final del ultimo token del prompt.

El empaquetado que nos ocupa, `SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Cls`, es un wrapper de evaluacion preparado para la Speech Anti-Spoofing Arena, un leaderboard que compara sistemas de deteccion de deepfakes de voz bajo condiciones homogeneas. Incluye el adaptador LoRA fusionado, el prompt exacto del colator original y el procesado de audio en features mel de 128 bandas al estilo Whisper. Su interes actual es doble: por un lado, sirve como referencia reproducible de como un LLM de audio se comporta como detector de spoofing; por otro, sus resultados en la Arena son deliberadamente crudos y muestran las limitaciones reales de este enfoque (varios datasets en el entorno del azar).

El modelo pesa 7758 millones de parametros, procesa los primeros 4 segundos de audio (64600 muestras) sin tiling y devuelve una puntuacion continua (logit[real] - logit[fake]) donde valores mas altos indican audio bona fide. Su licencia es CC-BY-NC-4.0, lo que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-Audio-7B-Instruct (transformer multimodal audio-texto) + LoRA en proyecciones q/v + cabeza lineal de clasificacion binaria |
| Parametros totales | 7758,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la entrada se trunca a los primeros 4 s de audio, 64600 muestras) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 para el backbone y FP32 para la cabeza) |
| Idiomas soportados | no disponibles (el modelo clasifica audio, no transcribe ni genera texto; el prompt esta en ingles) |
| Licencia | CC-BY-NC-4.0 |
| Formato de pesos | safetensors (`weights/adapter.safetensors`, adaptador LoRA fusionado en carga) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2-Audio-7B-Instruct, un transformer multimodal que combina un encoder de audio (con features mel de 128 bandas al estilo Whisper) con un decoder LLM de 7B. Sobre esa base se aplica un adaptador LoRA con rango 16 y alpha 32 en las proyecciones q y v de las 32 capas del encoder de audio y de las 32 capas de atencion del LLM. Encima del estado oculto final del ultimo token del prompt se anade una cabeza lineal de dos clases (real/fake). El score final es la diferencia `logit[real] - logit[fake]`, de modo que valores mayores indican mayor probabilidad de audio bona fide.

El entrenamiento se realizo sobre CompSpoof V2, un corpus que mezcla voz real (CommonVoice, LibriTTS, english-conversation-corpus) con sonido ambiental, y componentes falsos procedentes de ASVspoof 5, SONAR, CD-ADD, LibriSeVoc y fuentes MLAAD. La regla de etiquetado es estricta: si cualquier componente de la mezcla es falso, la muestra se etiqueta como fake. El prompt de inferencia es fijo ("Listen carefully to this recording ... Classify as either real or fake.") y el audio se procesa con el colator de los autores. En carga, el LoRA se fusiona en el backbone, que se sirve en BF16 repartido en dos GPUs, con la cabeza en FP32. No hay decodificacion especulativa ni trucos de inferencia: es un forward pass clasico.

## Capacidades

- Deteccion binaria de audio falsificado (real vs. fake) sobre los primeros 4 segundos de audio.
- Salida como score continuo (logit[real] - logit[fake]), lo que permite ajustar umbrales y calcular EER en lugar de depender de una etiqueta dura.
- Manejo de mezclas de voz con sonido ambiental, gracias al entrenamiento sobre CompSpoof V2.
- Procesamiento de audio en bruto (64600 muestras, 16 kHz implicito por el colator Whisper-style), sin necesidad de transcripcion previa.
- No soporta tool calling, function calling ni agentes: es un clasificador, no un asistente.
- No genera texto utilizable ni transcribe; el decoder LLM solo se usa como extractor de representaciones para la cabeza.
- Capacidades multilingues: no documentadas; el entrenamiento se apoya en corpus mayoritariamente en ingles.
- No incluye modo thinking, vision ni audio generation.

## Casos de uso

- Evaluacion comparativa de detectores de deepfake: el wrapper permite reproducir exactamente las condiciones de la Speech Anti-Spoofing Arena (prompt, colator, primeros 4 s) y comparar el EER de este sistema con otros en el mismo leaderboard. Es su uso principal y el unico para el que esta disenado.
- Investigacion sobre representaciones de LLMs de audio: al exponer la cabeza lineal sobre el ultimo token del prompt, permite estudiar que informacion del audio captura el backbone y como se relaciona con la deteccion de spoofing, en linea con la pregunta del paper ("What Do Deepfake Audio Detectors Hear?").
- Baseline para nuevos detectores: sirve como referencia fuerte (7B) frente a detectores clasicos mas ligeros (AASIST, RawNet2) en experimentos academicos, aunque sus resultados en varios datasets son cercanos al azar y conviene interpretarlo como cota superior de complejidad, no de rendimiento.
- Analisis de sensibilidad a dominio: dado que el modelo falla en voz de estudio limpia (fuera de dominio), es util para estudiar el efecto de la mezcla con sonido ambiental en la deteccion y para disenar experimentos de domain shift.
- Filtrado preliminar en pipelines de moderacion de audio: con un umbral ajustado sobre el score continuo, puede usarse como primera etapa de triaje en un sistema que luego aplique un detector especializado, siempre que el uso sea no comercial por la licencia.
- Docencia y divulgacion: el repositorio incluye pesos, prompt y resultados por dataset (`.eval_results/`), lo que lo convierte en un ejemplo didactico completo de como empaquetar y evaluar un detector basado en LLM de audio.

## Benchmarks y rendimiento

Resultados publicados en la Speech Anti-Spoofing Arena (EER%, menor es mejor). EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR% con el umbral EER de DeepVoice; no se incluyen aqui por falta de datos completos en la informacion disponible.

| Dataset | EER% |
|---|---|
| ASVspoof2019_LA | 15,68 |
| ASVspoof2021_LA | 29,16 |
| ASVspoof2021_DF | 26,63 |
| ASVspoof5 | 33,16 (marcado n/a* por solapamiento con entrenamiento) |
| InTheWild | 50,61 |
| ADD22_eval_31 | 43,57 |
| ADD2023_track12_test_r1 | 39,30 |
| CFAD | 30,67 |
| CD-ADD | 29,83 (marcado n/a* por solapamiento) |
| CVoiceFake_small | 50,95 |
| DeepVoice | 37,54 |
| LibriSeVoc | 49,72 (marcado n/a* por solapamiento) |
| SONAR | 51,85 (marcado n/a* por solapamiento) |
| ArAD | 50,26 |

Los propios autores advierten que la voz bona fide de estudio limpio queda fuera de dominio y que varias celdas estan cerca del azar o invertidas. No se han publicado en la informacion disponible resultados comparativos con otros sistemas en la misma tabla.

## Requisitos de hardware

- VRAM estimada: el backbone en BF16 ocupa aproximadamente 15,5 GB (7758 M parametros x 2 bytes); la cabeza en FP32 anade unos pocos MB. El empaquetado oficial asume reparto en dos GPUs, por lo que se recomienda un minimo de 2 x 16 GB o una unica GPU de 24 GB o mas.
- GPUs recomendadas: A100 40/80 GB, H100, o 2 x RTX 4090/A6000 para replicar el reparto BF16 descrito. Una RTX 4090 de 24 GB deberia bastar para una sola GPU en BF16, aunque no esta documentado en la model card.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) y previsiblemente en RTX 3090; no en GPUs de 8-12 GB sin cuantizacion, que no se distribuye.
- Opciones de despliegue: el wrapper es PyTorch puro (sin TensorRT). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y al ser un clasificador con cabeza custom no es trivial portarlo a esos motores.
- Latencia y throughput: no disponibles. Al procesar solo 4 s de audio y hacer un unico forward pass, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NII-SLT26-Qwen2Audio-Cls | 7758 M | 4 s de audio | LLM de audio + LoRA + cabeza lineal | CC-BY-NC-4.0 | Hugging Face (este repo) |
| AASIST | ~0,3 M | audio variable | Red neuronal ligera especifica de anti-spoofing | habitualmente abierta (no verificada aqui) | repos academicos |
| RawNet2 | ~0,02 M | audio variable | CNN sobre waveform | habitualmente abierta (no verificada aqui) | repos academicos |
| Wav2Vec2-XLS-R + clasificador | ~300 M-1 B | audio variable | encoder SSL + cabeza | variable | Hugging Face |

No se dispone de resultados comparativos publicados en la informacion proporcionada que permitan contrastar EER entre estos sistemas en los mismos datasets. La comparativa se limita a tamano, enfoque y licencia.

## Limitaciones y advertencias

- Licencia CC-BY-NC-4.0: prohibido el uso comercial sin autorizacion expresa de los titulares.
- Resultados cercanos al azar o invertidos en varios datasets (SONAR 51,85%, CVoiceFake 50,95%, InTheWild 50,61%, ArAD 50,26%). No es un detector fiable fuera del dominio de entrenamiento.
- Voz bona fide de estudio limpio queda fuera de dominio, lo que puede producir falsos positivos sistematicos en grabaciones profesionales.
- Solapamiento de entrenamiento con ASVspoof5, SONAR, CD-ADD y LibriSeVoc: sus resultados no son una medida valida de generalizacion y la Arena los marca como n/a*.
- Entrada truncada a los primeros 4 segundos: audios mas largos pierden informacion y no hay tiling que lo compense.
- No hay informacion sobre sesgos por idioma, genero o acento; el entrenamiento se apoya en corpus mayoritariamente en ingles.
- Riesgo de alucinacion no aplica en el sentido generativo, pero el score puede ser arbitrario en dominios no vistos y no debe interpretarse como probabilidad calibrada.
- No soporta tool calling, agentes ni otras capacidades de LLM; usarlo como asistente daria resultados sin sentido.
- El empaquetado asume dos GPUs en BF16; reproducir los resultados en una sola GPU o en otra precision puede alterar ligeramente los EER publicados.
- Es un artefacto de evaluacion, no un producto: no hay garantias de mantenimiento, versionado semantico ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Cls
- Pesos (commit-pinned): https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Qwen2Audio-Cls/blob/342ed8bc1040d1a206fe030958c961604fc2a509/weights/adapter.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Arena, vista del sistema: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=nii-slt26-qwen2audio-cls
- Paper (arXiv): https://arxiv.org/abs/2610.17617
- Codigo de los autores: https://github.com/nii-yamagishilab/AntiDeepfake-AudioLLM/tree/2d445b525bb52518448b353fe1fee51d5f815af9

# SpeechAntiSpoofingBenchmarks/ProSDD-ASV5

## Resumen

ProSDD-ASV5 es un sistema de deteccion de audio sintetico (anti-spoofing) empaquetado como wrapper para la Speech Anti-Spoofing Arena. El modelo subyacente, ProSDD, es un encoder wav2vec 2.0 XLS-R de 300M de parametros afinado completamente por Mahapatra et al. (2026) para distinguir voz real (bona fide) de voz generada por TTS o conversion de voz. El repositorio de Hugging Face no re-aloja los pesos: solo contiene el codigo de empaquetado para la arena, y los pesos deben descargarse del Google Drive de los autores.

El sistema se entrena en dos etapas: primero predice objetivos enmascarados a nivel de trama de hablante y prosodia sobre LibriSpeech, y despues se afina conjuntamente con ese objetivo y una cabeza binaria real/fake sobre ASVspoof 2024 (ASVspoof 5). La inferencia usa solo la ruta limpia del encoder, con entrada fija de 4 segundos a 16 kHz, sin normalizacion de amplitud, y devuelve un score continuo donde valores mas altos indican mayor probabilidad de voz autentica.

Es relevante porque participa en un benchmark publico y reproducible (Speech Anti-Spoofing Arena) que evalua sistemas anti-spoofing sobre 17 conjuntos de datos heterogeneos, y porque su enfoque de preentrenamiento con objetivos de hablante y prosodia es una alternativa a los clasificadores puramente discriminativos. El rendimiento es desigual: destaca en ASVspoof5 (7,38% EER) e InTheWild (6,57% EER), pero cae en conjuntos como SONAR (35,07%) o LibriSeVoc (30,51%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R 300M (CNN front-end + 24 capas transformer) con cabeza de clasificacion binaria |
| Parametros totales | 315.963.522 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4 s de audio a 16 kHz (64.000 muestras); secuencia latente fija de 200 tramas con zero-padding |
| Tipos de cuantizacion | no disponible (inferencia en FP32; el wrapper TensorRT usa FP32 y FP16) |
| Idiomas soportados | no disponible (el encoder XLS-R es multilingue por preentrenamiento, pero no se documenta cobertura) |
| Licencia | other (los autores no conceden licencia para los pesos; no se re-alojan) |
| Formato de pesos | checkpoint PyTorch (descarga externa desde Google Drive; sha256 en `meta.yaml`) |

## Arquitectura y entrenamiento

El modelo parte de un encoder wav2vec 2.0 XLS-R de 300M de parametros, con front-end CNN, proyeccion de caracteristicas, 24 capas de transformer y pooling por media. Sobre esa representacion se aplica una cabeza `Linear(1024,512)-ReLU-Linear(512,2)` que produce logits para las clases fake y bona fide; el score final es `logits[:,1]`.

El entrenamiento es en dos etapas. La etapa I entrena solo con datos bona fide de LibriSpeech train-clean-100 y dev para predecir objetivos enmascarados a nivel de trama de hablante y prosodia. La etapa II afina conjuntamente ese objetivo y la cabeza binaria real/fake sobre ASVspoof 2024 (ASVspoof 5) train/dev con la serie RawBoost 3. En inferencia se usa unicamente la ruta limpia (sin aumentacion RawBoost). La entrada se procesa a 16 kHz sin normalizacion de amplitud, con recorte central fijo de 4 s y zero-padding central para clips mas cortos.

## Capacidades

- Deteccion binaria de voz real frente a voz sintetica (TTS y conversion de voz).
- Puntuacion continua por clip: valores mas altos indican mayor probabilidad de bona fide.
- Preentrenamiento con objetivos de hablante y prosodia, lo que aporta senal complementaria a la clasificacion puramente acustica.
- Inferencia sobre clips de hasta 4 s (los mas largos se recortan por el centro; los mas cortos se rellenan con ceros).
- Ejecucion en FP32 en PyTorch y en FP32/FP16 mediante una clase TensorRT drop-in.
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo: es un clasificador de audio.

## Casos de uso

- Verificacion anti-fraude en call centers: puntuar cada segmento de 4 s de una llamada entrante para detectar voz sintetica antes de derivar a un agente humano, usando el score continuo como umbral configurable.
- Moderacion de contenido en plataformas de audio: filtrar subidas de voz generada por TTS o clonacion, con especial utilidad en conjuntos tipo InTheWild donde el modelo obtiene 6,57% EER.
- Autenticacion biometrica por voz: capa adicional de defensa contra ataques de presentacion sintetica antes de un sistema de verificacion de hablante.
- Evaluacion comparativa de detectores: usar el wrapper como linea base reproducible dentro de la Speech Anti-Spoofing Arena frente a otros sistemas.
- Monitorizacion de medios: detectar locuciones sinteticas en podcasts, audiolibros o boletines generados automaticamente.
- Investigacion en contramedidas: reutilizar el checkpoint como extractor de caracteristicas XLS-R afinado para experimentos de deteccion de deepfakes de voz.
- Despliegue en produccion con latencia baja: la clase TensorRT permite FP16 en GPUs consumer (RTX 5060 Ti segun la model card) manteniendo equivalencia con PyTorch en el conjunto completo J-SPAW_LA.

## Benchmarks y rendimiento

EER% (menor es mejor). EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR% en el umbral EER de DeepVoice.

| Conjunto de datos | EER% |
|---|---|
| ASVspoof2019_LA | 19,04 |
| ASVspoof2021_LA | 19,55 |
| ASVspoof2021_DF | 15,73 |
| ASVspoof5 | 7,38 |
| InTheWild | 6,57 |
| ADD22_eval_31 | 24,40 |
| ADD2023_track12_test_r1 | 28,72 |
| CFAD | 28,70 |
| CD-ADD | 4,31 |
| CVoiceFake_small | 30,46 |
| DeepVoice | 10,24 |
| LibriSeVoc | 30,51 |
| SONAR | 35,07 |
| ArAD | 13,64 |
| DECRO | 25,44 |
| J-SPAW_LA | 5,13 |
| ODSS | 15,31 |

No se dispone de comparacion numerica con otros sistemas en la informacion proporcionada; el ranking y el tier estan disponibles como badges dinamicos en la arena.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 316M de parametros en FP32, los pesos ocupan aproximadamente 1,26 GB; en FP16, unos 0,63 GB, mas activaciones y buffers del encoder.
- GPU recomendadas: la model card documenta ejecucion en RTX 4070 Ti SUPER (FP32, TensorRT) y RTX 5060 Ti (FP16, TensorRT); por tamano, cabe en cualquier GPU consumer con 4 GB o mas de VRAM.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4070 y equivalentes.
- Opciones de despliegue: PyTorch (wrapper incluido en el repositorio) y clase TensorRT drop-in; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de audio).
- Latencia y throughput: no disponibles. La model card solo indica que la ruta TensorRT FP16 en RTX 5060 Ti coincide con PyTorch en el conjunto completo J-SPAW_LA.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de otros sistemas anti-spoofing comparables ni sus especificaciones, por lo que no es posible construir una tabla comparativa fiable. La Speech Anti-Spoofing Arena mantiene rankings publicos que permiten la comparacion directa, pero sus cifras no se recogen en esta ficha.

## Limitaciones y advertencias

- Pesos no re-alojados: los autores no conceden licencia para los pesos, que se distribuyen via Google Drive externo; esto complica la reproducibilidad y la auditoria.
- Licencia "other" sin terminos explicitos: no hay garantia de uso comercial; conviene contactar con los autores antes de desplegar en produccion.
- Entrada fija de 4 s: clips mas largos se recortan por el centro, lo que puede descartar segmentos relevantes; clips mas cortos se rellenan con ceros.
- Sin normalizacion de amplitud: el rendimiento puede degradarse con niveles de volumen muy dispares respecto al entrenamiento.
- Rendimiento muy variable entre dominios: EER de 4,31% en CD-ADD frente a 35,07% en SONAR y 30,51% en LibriSeVoc; no es un detector universal.
- Entrenado sobre ASVspoof 5: posible sobreajuste a las condiciones y codificaciones de ese corpus; los resultados en ADD22/ADD23 y CFAD (24-29% EER) sugieren escasa generalizacion a otros dominios de ataque.
- Riesgo de falsos positivos y negativos en voz real con ruido o prosodia atipica; el score es continuo y requiere calibracion de umbral por caso de uso.
- Sesgos demograficos y linguisticos no documentados: no se reportan analisis por idioma, acento, edad o genero.
- No es un modelo generativo: no debe emplearse para sintesis, transcripcion ni tareas de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/ProSDD-ASV5
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Paper: https://arxiv.org/abs/2604.13229
- Codigo de los autores: https://github.com/ProSDD/codes/tree/bdb80440cd946368e77f4b51f6ddf26c7443dc33
- Checkpoint (Google Drive): https://drive.google.com/file/d/1AyD4f0RVVyDncqYbhi8QaP6-GFZ_ZGZl/view

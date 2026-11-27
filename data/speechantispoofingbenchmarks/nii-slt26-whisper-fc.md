# SpeechAntiSpoofingBenchmarks/NII-SLT26-Whisper-FC

## Resumen

NII-SLT26-Whisper-FC es un clasificador binario de audio orientado a la deteccion de voz sintetica y deepfakes de audio (anti-spoofing). Lo desarrollan Ge, Wang y Yamagishi en el marco de IEEE SLT 2026, dentro del laboratorio NII Yamagishi, y el paquete publicado en Hugging Face es un envoltorio de inferencia preparado por los mantenedores del benchmark Speech Anti-Spoofing Arena a partir del codigo y los pesos originales de los autores.

El modelo no es un modelo generativo: reutiliza unicamente el encoder de Whisper-large-v2 (transformers `WhisperEncoder`, sin decodificador), aplica mean pooling sobre las 1500 posiciones temporales de la ultima capa oculta y anade una cabeza lineal `Linear(1280, 2)` que produce dos logits, [real, fake]. Con 636,79 millones de parametros, resuelve la tarea de decidir si un fragmento de voz de 16 kHz es bona fide (humano) o spoof (generado o manipulado).

Su relevancia actual es doble: por un lado, ofrece un punto de referencia reproducible y empaquetado para evaluar sistemas de deteccion de deepfakes de voz; por otro, sus resultados publicados en el Arena son deliberadamente crudos y muestran un rendimiento desigual (EER entre 24,31 % y 56,25 % segun el conjunto), lo que lo convierte en una referencia util para calibrar expectativas sobre la generalizacion de los detectores basados en Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de Whisper-large-v2 (Transformer) + mean pooling temporal + cabeza lineal `Linear(1280, 2)`; el decodificador no se usa |
| Parametros totales | 636,79 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 30 s de audio (1500 frames); en el Arena se recorta a 4 s (primeros 64 600 muestras a 16 kHz) |
| Tipos de cuantizacion | FP32 como precision de referencia de los autores (TF32 desactivado); el repo incluye un wrapper TensorRT que ejecuta en FP16; no se documentan GGUF ni INT8 |
| Idiomas soportados | no disponible (el modelo opera sobre representacion acustica, no sobre texto) |
| Licencia | CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | safetensors (`nii_slt26_whisper_fc.safetensors`), empaquetado PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer tipo Whisper-large-v2 completo, afinado de extremo a extremo (fully fine-tuned) sobre la tarea de clasificacion. La entrada sigue el pipeline del `WhisperFeatureExtractor`: waveform a 16 kHz, conversion a log-mel de 80 bins sin normalizacion de amplitud, relleno con ceros hasta los 30 s de Whisper. Sobre la ultima capa oculta se aplica mean pooling sobre las 1500 posiciones (incluyendo los frames de relleno, igual que en entrenamiento) y una proyeccion lineal a dos clases. La puntuacion publicada es `logit[real] - logit[fake]`, monotona respecto a la diferencia de probabilidades softmax que reportan los autores (`Score_real - Score_fake`).

El entrenamiento usa CompSpoof V2 (ESDD2) con etiquetado "cualquier componente falso = falso" y excluyendo la clase "original" sin mezclar (protocolo `AnyFakeNoOriginal`), semilla 2 y checkpoint de mejor perdida de validacion. El conjunto de entrenamiento combina voz bona fide de CommonVoice, LibriTTS y english-conversation-corpus mezclada con sonido ambiental, y voz spoof procedente de ASVspoof 5, SONAR, CD-ADD, LibriSeVoc y fuentes MLAAD. No se documentan fases de RLHF ni DPO (no aplica a una tarea discriminativa). La innovacion tecnica principal es el reciclaje del encoder de un modelo de reconocimiento de voz como extractor de representaciones para anti-spoofing, con pooling temporal simple en lugar de atencion agregada.

## Capacidades

- Clasificacion binaria de audio como bona fide (real) o spoof (falso), con una puntuacion continua donde valores mas altos indican mayor probabilidad de voz autentica.
- Deteccion de deepfakes de voz generados por TTS y por clonacion de voz, incluyendo ataques de reemplazo y de sintesis parcial.
- Procesamiento de clips de hasta 30 s (recorte operativo de 4 s en el Arena) a 16 kHz mono.
- Inferencia en FP32 con PyTorch y en FP16 mediante un wrapper TensorRT proporcionado por los mantenedores.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, vision, audio generativo ni capacidades multilingues en el sentido textual: es un discriminador puro.
- No es un modelo conversacional ni genera texto; no expone una API de chat.

## Casos de uso

- Moderacion de contenido en plataformas de audio: puntuar automaticamente clips subidos por usuarios para marcar posibles voces sinteticas antes de su publicacion, usando el score `logit[real] - logit[fake]` como senal de triaje.
- Verificacion antifraude en banca y telecomunicaciones: como capa adicional en la autenticacion por voz, detectando si la muestra entrante procede de un sintetizador o de una grabacion reutilizada.
- Analisis forense de grabaciones: apoyo a peritos que necesitan una primera puntuacion objetiva sobre la autenticidad de un audio incautado, siempre acompanada de revision humana.
- Monitorizacion de campanas de desinformacion: procesar lotes de audios virales (noticias, mensajes de voz) para priorizar cuales requieren analisis manual por sospecha de sintesis.
- Investigacion en anti-spoofing: servir como baseline reproducible en experimentos academicos gracias a sus pesos publicados, protocolo de entrenamiento documentado y resultados de Arena por conjunto de datos.
- Evaluacion comparativa de detectores: integrarse en pipelines de benchmark (como el propio Speech Anti-Spoofing Arena) para contrastar nuevos sistemas contra una referencia basada en Whisper-large-v2.
- Filtrado previo en datasets de voz: etiquetar automaticamente grandes corpus para descartar muestras sinteticas antes de entrenar modelos de ASR o TTS, con umbral calibrado por el equipo.

## Benchmarks y rendimiento

Resultados publicados en el Speech Anti-Spoofing Arena. Metrica: EER % (menor es mejor); EmoSpoofTTS y LRLspoof son solo spoof y usan 1-SRR % en el umbral EER de DeepVoice.

| Conjunto de evaluacion | EER % |
|---|---|
| ASVspoof2019_LA | 27,70 |
| ASVspoof2021_LA | 31,56 |
| ASVspoof2021_DF | 30,81 |
| ASVspoof5 | 40,29 (marcado n/a* por solapamiento con entrenamiento) |
| InTheWild | 41,68 |
| ADD22_eval_31 | 24,85 |
| ADD2023_track12_test_r1 | 27,48 |
| CFAD | 33,54 |
| CD-ADD | 24,31 (marcado n/a* por solapamiento) |
| CVoiceFake_small | 39,23 |
| DeepVoice | 30,01 |
| LibriSeVoc | 56,25 (marcado n/a* por solapamiento) |

Notas: los conjuntos ASVspoof5, SONAR, CD-ADD y LibriSeVoc estan marcados como n/a* por solapamiento con los datos de entrenamiento. Segun la model card, la voz bona fide de estudio limpia queda fuera de dominio para estos checkpoints y varias celdas son practicamente aleatorias o invertidas, mantenidas por decision del mantenedor. No se han publicado en la informacion disponible resultados de benchmarks clasicos tipo MMLU, HumanEval o GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,6 GB en FP32 para los pesos (636,79 M parametros); en FP16 alrededor de 1,3 GB, mas el coste de activaciones del encoder de Whisper-large-v2 sobre 30 s de audio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en FP32; los mantenedores han validado FP16 en RTX 4070 Ti SUPER y RTX 5060 Ti, y PyTorch en RTX 4060 Ti.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060, RTX 4060 Ti, RTX 4070 y superiores.
- Opciones de despliegue: PyTorch nativo (referencia), wrapper TensorRT en FP16 proporcionado por los mantenedores. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo discriminativo.
- Latencia y throughput: no disponibles de forma agregada; la model card indica que el wrapper TensorRT en FP16 coincidio con PyTorch en el conjunto completo J-SPAW_LA (|dEER| <= 0,25, Spearman >= 0,999), lo que sugiere una fidelidad numerica alta sin cuantificar la ganancia de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NII-SLT26-Whisper-FC | 636,79 M | Encoder Whisper-large-v2 + cabeza lineal | 30 s (recorte 4 s en Arena) | CC BY-NC 4.0 | Pesos en HF, codigo en GitHub |
| AASIST y variantes | no disponible en esta ficha | Detector basado en grafos espectrales, entrenado desde cero | Tipico 4 s | habitualmente research-only | Multiples checkpoints publicos |
| Wav2Vec2-XLS-R anti-spoofing | no disponible en esta ficha | Encoder auto-supervisado + clasificador | Tipico 4 s | variable segun checkpoint | Repositorios de investigacion |
| Whisper-large-v2 original | 1550 M | ASR encoder-decoder | 30 s | MIT | OpenAI / HF |

La comparacion cuantitativa con AASIST o Wav2Vec2-XLS-R no esta disponible en la informacion proporcionada; se listan como alternativas de la misma categoria (deteccion de voz sintetica) sin cifras de rendimiento comparables.

## Limitaciones y advertencias

- Licencia CC BY-NC 4.0: prohibido el uso comercial sin autorizacion expresa de los titulares.
- Rendimiento desigual: EER de hasta 56,25 % en LibriSeVoc y 41,68 % en InTheWild, con celdas cercanas al azar o invertidas segun la propia model card.
- Fuera de dominio en voz bona fide de estudio limpia: el modelo fue entrenado con voz mezclada con sonido ambiental y puede fallar en grabaciones de locutorio o microfono profesional.
- Solapamiento de entrenamiento con ASVspoof5, SONAR, CD-ADD y LibriSeVoc: los resultados en esos conjuntos no son estimaciones limpias de generalizacion.
- Riesgo de falsos positivos y falsos negativos: al ser un clasificador binario con umbral dependiente del conjunto, no debe usarse como unica prueba en decisiones de fraude o forenses.
- Sesgos no documentados: la model card no detalla analisis por idioma, genero, edad o acento; el entrenamiento se apoya en CommonVoice, LibriTTS y english-conversation-corpus, con posible sesgo hacia ingles.
- Sin capacidades generativas ni de texto: no puede explicar sus decisiones ni producir justificaciones; la interpretabilidad queda limitada al score.
- Dependencia de la ventana de 4 s del Arena: los autores puntuan clips completos, por lo que el recorte puede alterar el comportamiento respecto a la evaluacion original.
- Precision: FP32 como referencia; el uso de FP16 o TensorRT debe validarse contra PyTorch en el dominio concreto de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Whisper-FC
- Pesos (commit fijado): https://huggingface.co/SpeechAntiSpoofingBenchmarks/NII-SLT26-Whisper-FC/blob/aed40234b7a636287238c971aa934b62659fed28/nii_slt26_whisper_fc.safetensors
- Speech Anti-Spoofing Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena
- Ficha del sistema en el Arena: https://huggingface.co/spaces/SpeechAntiSpoofingBenchmarks/SpeechAntiSpoofingArena?system=nii-slt26-whisper-fc
- Codigo de los autores (commit 2d445b5): https://github.com/nii-yamagishilab/AntiDeepfake-AudioLLM/tree/2d445b525bb52518448b353fe1fee51d5f815af9
- Paper (arXiv:2610.17617): https://arxiv.org/abs/2610.17617

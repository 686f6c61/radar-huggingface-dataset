# thegoatcc/xls-r-1b-antideepfake-finetuned

## Resumen

XLS-R-1B AntiDeepfake-NDA (fine-tuned) es un clasificador de audio binario especializado en deteccion de deepfakes de voz (anti-spoofing). Se trata de un ajuste fino del checkpoint `SpeechAntiSpoofingBenchmarks/XLS-R-1B-AntiDeepfake-NDA`, publicado por el usuario `thegoatcc`, que parte del modelo preentrenado multilingue XLS-R-1B de Meta (arquitectura wav2vec2) y lo adapta a la tarea de distinguir audio real de audio sintetico generado por sistemas de sintesis de voz.

El modelo resuelve un problema concreto y creciente: la verificacion de autenticidad de audio en entornos donde los sistemas TTS y de clonacion de voz de alta calidad hacen dificil distinguir una grabacion real de una generada. Con 964 millones de parametros (aproximadamente 1B, de ahi el nombre) y un repo de 2,1 GB en safetensors, se posiciona como una alternativa de tamano medio-grande para pipelines de moderacion y forense de audio.

Es relevante porque aplica la arquitectura XLS-R, originalmente disenada para reconocimiento de voz multilingue, a la deteccion de spoofing, y publica metricas de validacion concretas (ROC-AUC 0,9309 y EER 16,25% en el mejor checkpoint de desarrollo). No obstante, la model card es escasa: no declara licencia, no detalla composicion del dataset de ajuste fino ni idiomas soportados mas alla del ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (XLS-R-1B) con cabeza de clasificacion de secuencia (`Wav2Vec2ForSequenceClassification`) |
| Parametros totales | 964.139.650 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio de 4 s a 16 kHz) |
| Tipos de cuantizacion | no disponible (pesos en FP16 en el repo; el autor menciona encoder en FP16) |
| Idiomas soportados | no disponible (la model card indica deteccion para audio en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | audio-classification |
| Etiquetas | 0 = REAL, 1 = FAKE |
| Frecuencia de muestreo | 16 kHz mono WAV |
| Ventana de inferencia | 4 s con stride de 2 s; probabilidad de fake promediada |

## Arquitectura y entrenamiento

El modelo se basa en XLS-R-1B, un transformer de tipo wav2vec2 preentrenado de forma autosupervisada sobre audio multilingue a gran escala. Sobre esa base, el ajuste fino de `thegoatcc` modifica la cabeza de clasificacion y descongela los bloques del encoder 44 a 47 en FP16, manteniendo el resto de la red en su estado preentrenado. La salida es una distribucion de dos clases (REAL/FAKE) sobre ventanas de audio de 4 segundos.

El proceso de inferencia segmenta el audio en ventanas de 4 s con solapamiento de 2 s (stride), calcula la probabilidad de fake por ventana y las promedia para obtener una puntuacion global. El autor fija un umbral de decision congelado en 0,9239. No se documentan en la informacion disponible el numero de tokens de audio de entrenamiento, la composicion del dataset de ajuste fino, ni si hubo etapas de RLHF/DPO (no aplicables en un clasificador). Tampoco se detalla el dataset de evaluacion mas alla de las metricas de validacion.

## Capacidades

- Clasificacion binaria de audio: distingue entre voz real (REAL) y voz sintetica o manipulada (FAKE).
- Deteccion de spoofing y deepfakes de voz en audio de 16 kHz mono.
- Procesamiento por ventanas de 4 s con stride de 2 s y agregacion por media de probabilidades.
- Salida de probabilidad calibrada con umbral fijo (0,9239) para decision.
- Integracion con `transformers` (`AutoModelForAudioClassification`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador, no un LLM).
- No soporta vision ni audio generativo; solo clasificacion.
- Capacidades multilingues: no disponibles; la model card lo describe para ingles.

## Casos de uso

- Moderacion de contenido en plataformas de audio: filtrar clips de voz sintetica antes de su publicacion, usando la probabilidad de fake por ventana de 4 s para marcar audios sospechosos.
- Verificacion de autenticidad en atencion al cliente telefonica: analizar grabaciones de llamadas (16 kHz mono) y detectar voz clonada en intentos de fraude por suplantacion.
- Forense digital y peritaje: aportar una puntuacion cuantitativa (probabilidad de fake) como evidencia auxiliar en la investigacion de audios manipulados, junto con el umbral fijo de 0,9239.
- Deteccion de deepfakes en medios y periodismo: triaje automatico de material recibido (entrevistas, declaraciones) antes de la verificacion humana.
- Filtrado en datasets de entrenamiento de TTS: descartar muestras sinteticas o contaminadas en corpus de voz antes de reentrenar modelos de sintesis.
- Investigacion en anti-spoofing: servir como baseline reproducible con metricas de validacion publicadas (ROC-AUC 0,9309, EER 16,25%) para comparar nuevos detectores.
- Integracion en pipelines de KYC (verificacion de identidad): analizar la muestra de voz del usuario para detectar reproduccion o clonacion, como capa adicional a la verificacion biometrica.

## Benchmarks y rendimiento

| Metrica | Valor (mejor checkpoint de desarrollo) |
|---|---|
| ROC-AUC | 0,9309 |
| EER | 16,25% |
| Umbral de decision congelado | 0,9239 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, ASVspoof, In-the-Wild) en la informacion disponible, ni comparativas con otros detectores.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 2 GB para los pesos (964 M parametros a 2 bytes) mas activaciones y buffers; en la practica, 3-4 GB de VRAM son suficientes para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. En CPU es viable pero mas lento.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: `transformers` (referencia), exportacion a ONNX Runtime, TorchScript; no se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplican a un clasificador de audio).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del numero de ventanas por audio.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thegoatcc/xls-r-1b-antideepfake-finetuned | 964 M | Deteccion de deepfake de audio | Ventanas de 4 s, stride 2 s | no disponible | Hugging Face |
| SpeechAntiSpoofingBenchmarks/XLS-R-1B-AntiDeepfake-NDA (base) | ~1 B | Deteccion de deepfake de audio | no disponible | no disponible | Hugging Face |
| Wav2Vec2 / XLS-R base (Meta) | 300 M / 1 B | Representaciones de voz (ASR, clasificacion) | no disponible | MIT (XLS-R) | Hugging Face |

No se dispone de datos de rendimiento comparables de otros detectores de anti-spoofing en la informacion proporcionada; la comparativa se limita a parametros, tarea y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente sobre un corpus limitado, puede generalizar peor fuera de la distribucion de ese corpus (idiomas, acentos, canales telefonicos, ruido).
- Riesgo de alucinacion: no aplica como tal, pero existe riesgo de falsos positivos y falsos negativos; el EER del 16,25% implica una tasa de error considerable en produccion.
- Limitaciones de contexto o idioma: la model card indica deteccion para ingles; el rendimiento en otros idiomas no esta validado. Solo procesa audio de 16 kHz mono.
- Restricciones de licencia: la licencia no esta declarada, lo que impide confirmar el uso comercial; hay que contactar con el autor o asumir el riesgo legal.
- Caveat para produccion: el umbral de decision (0,9239) esta congelado y calibrado sobre el conjunto de validacion del autor; puede requerir recalibracion en dominios distintos.
- El modelo es un ajuste fino comunitario con 0 descargas y 1 like en el momento de la consulta; no hay garantia de mantenimiento ni soporte.
- No es un LLM: no genera texto, no razona y no soporta agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thegoatcc/xls-r-1b-antideepfake-finetuned
- Modelo base: https://huggingface.co/SpeechAntiSpoofingBenchmarks/XLS-R-1B-AntiDeepfake-NDA
- XLS-R (Meta): https://huggingface.co/facebook/wav2vec2-xls-r-1b
- Documentacion de wav2vec2 en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2

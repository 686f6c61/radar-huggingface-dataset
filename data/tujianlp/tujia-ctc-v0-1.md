# TujiaNLP/tujia-ctc-v0.1

## Resumen

tujia-ctc v0.1 es un sistema de reconocimiento automático de voz (ASR) a nivel de sílaba para el tujia, una lengua sino-tibetana en situación de peligro hablada principalmente en el norte de la provincia de Hunan (China). Lo desarrolla el proyecto TujiaNLP, centrado en la documentación computacional y la anotación de esta lengua de bajos recursos. El modelo no transcribe texto ortográfico ni fonemas completos: devuelve una secuencia de etiquetas silábicas con sus intervalos temporales, lo que lo convierte en una herramienta de anotación asistida y de documentación lingüística más que en un ASR de dictado convencional.

Técnicamente es un modelo híbrido: utiliza el codificador `facebook/wav2vec2-xlsr-53-espeak-cv-ft` congelado (salida a 50 Hz y 1024 dimensiones) y sobre él entrena una cabeza ligera formada por LayerNorm, dos capas BiLSTM de 256 unidades y una proyección lineal a 264 clases. La parte entrenable es de solo 4.339.976 parámetros (17 MB), mientras que el codificador, de aproximadamente 1,2 GB, no se distribuye con el paquete y debe descargarse aparte.

Su relevancia actual es doble: por un lado, demuestra que con muy pocos datos (unas 2,6 horas de audio de una única fuente) se puede construir un segmentador silábico funcional para una lengua sin recursos; por otro, expone con transparencia sus límites (ausencia total de predicción tonal, degradación severa en audio de banda estrecha), lo que resulta útil para quien planifique un pipeline de documentación lingüística asistida por máquina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-XLSR-53 congelado + LayerNorm + 2× BiLSTM(256) + Linear(512 → 264) |
| Parametros totales | 4.339.976 entrenables (cabeza); codificador externo no incluido |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (recomendado mantener cada entrada por debajo de ~60 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tujia (código `tji`), dialecto septentrional |
| Licencia | pesos: research-use-only; código: MIT; codificador: Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch), con vocabulario en `vocab.txt` y metadatos en `model_card.json` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de aprendizaje por transferencia con el codificador congelado. El front-end es `wav2vec2-xlsr-53-espeak-cv-ft`, que procesa audio mono a 16 kHz y produce representaciones de 1024 dimensiones a una tasa de 50 Hz. Sobre esas representaciones se aplica una LayerNorm y dos capas BiLSTM de 256 unidades, seguidas de una proyección lineal a 264 etiquetas silábicas. El entrenamiento usa CTC como función de pérdida y se realizó durante 40 épocas, con el mejor resultado en la época 35 (CER de validación de 0,4125).

Los datos de entrenamiento consisten en grabaciones de tujia de terceros, aproximadamente 2,6 horas, de una única fuente y con pocos puntos dialectales y hablantes. El corpus no se distribuye con el paquete. El vocabulario de 264 etiquetas corresponde a sílabas sin tono: el modelo no predice tonos en ningún caso y estos deben reconstruirse aguas abajo a partir de un lexicón. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra técnica de alineación.

## Capacidades

- Reconocimiento de voz a nivel de sílaba para tujia (dialecto septentrional): devuelve etiquetas silábicas con marcas de inicio y fin.
- Segmentación temporal: cada sílaba se acompaña de un intervalo (`start`, `end`) y una puntuación de confianza.
- Salida estructurada en JSON mediante la opción `--json`.
- Decodificación de fragmentos concretos con `--start` y `--duration`, lo que permite procesar audio largo por tramos.
- Entrada de audio mono a 16 kHz en formatos wav, flac y ogg (gestionados por `soundfile`); los contenedores mp4/m4a requieren demultiplexado previo con ffmpeg.
- Ejecución en CPU o GPU (`--device cpu`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz ni modo de pensamiento.
- Capacidad multilingüe: no; está especializado exclusivamente en tujia.

## Casos de uso

- Documentación lingüística asistida: el modelo segmenta grabaciones de campo en sílabas con marcas temporales, lo que acelera la alineación manual y la anotación posterior en herramientas como ELAN. Es adecuado porque su salida es directamente alineable con transcripciones existentes.
- Anotación de corpus de bajos recursos: para proyectos que necesiten ampliar un corpus de tujia, el modelo sirve como preanotador de sílabas que un hablante nativo revisa y corrige, reduciendo el coste por minuto de audio.
- Investigación fonética y prosódica: la segmentación silábica con intervalos permite estudiar duraciones y ritmo; los tonos deben añadirse por separado desde un lexicón.
- Evaluación de inteligibilidad y de calidad de grabación: comparando la recall sobre distintos materiales (por ejemplo, 80,26 % en el conjunto de retención frente a 48,85 % en una grabación de banda estrecha), puede usarse como indicador de la calidad acústica de nuevas grabaciones de campo.
- Prototipado de ASR para lenguas sin recursos: sirve como referencia metodológica para construir cabezas CTC ligeras sobre codificadores multilingües congelados cuando los datos disponibles son de pocas horas.
- Herramienta de apoyo en la enseñanza del tujia: con la salida silábica y sus tiempos, un docente puede localizar y aislar fragmentos concretos de una grabación para materiales didácticos.
- Procesamiento por tramos de entrevistas largas: gracias a `--start` y `--duration`, se pueden decodificar segmentos de menos de 60 segundos de entrevistas etnográficas extensas sin cargar todo el audio de una vez.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre audio no visto durante el entrenamiento. La métrica es la recall de sílabas, con normalización de formas silábicas y alineamiento Needleman-Wunsch; una sílaba de referencia cuenta como acierto con similitud de edición ≥ 0,5.

| Material | Referencia | Recall de silabas |
|---|---|---|
| Conjunto de retención interno (108 clips, solo decodificación) | 3.273 sílabas | 80,26 % |
| Habla leída entre hablantes distintos (21 enunciados) | 225 sílabas | 79,11 % |
| Sílabas aisladas leídas en voz alta (12 unidades) | 12 sílabas | 91,67 % |
| Grabación de campo de banda estrecha (un clip) | 131 sílabas | 48,85 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre corpus públicos) en la información disponible. La CER de validación durante el entrenamiento fue de 0,4125 en la mejor época (35).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; la cabeza es de 17 MB y el codificador de aproximadamente 1,2 GB, por lo que el peso en memoria es modesto y en FP32 se mantiene en el orden de unos pocos GB incluyendo activaciones.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU con suficiente memoria para el codificador XLSR (por ejemplo, una RTX 3060 o superior) debería bastar; el script admite `--device cpu`.
- Compatibilidad con GPU de consumo: sí, es previsible que quepa en GPU de consumo actuales dado el tamaño del codificador, aunque el autor no publica cifras de VRAM ni de latencia.
- Opciones de despliegue: el paquete incluye un script de inferencia autónomo (`infer.py`) que no requiere el repositorio de entrenamiento. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo CTC de este tipo.
- Latencia y throughput: no disponibles.
- Nota operativa: `fetch_encoder.sh` es un script POSIX y no funciona en Windows; en ese caso hay que copiar manualmente la carpeta del codificador y definir `TUJIA_XLSR`.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros sistemas ASR para tujia en la información proporcionada. Como referencia cualitativa de la categoría (ASR de bajos recursos sobre codificadores congelados), se pueden considerar los siguientes, sin datos comparativos verificados:

| Modelo | Enfoque | Idioma | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-ctc v0.1 | wav2vec2-XLSR congelado + BiLSTM + CTC | tujia (`tji`) | 4,34 M entrenables + codificador ~1,2 GB | research-use-only (pesos) | HuggingFace |
| wav2vec2-XLSR-53 (base) | Codificador multilingüe preentrenado | 53 idiomas | ~300 M | Apache-2.0 | HuggingFace |
| Sistemas ASR multilingües tipo Whisper | Transformer encoder-decoder | ~99 idiomas (sin tujia) | variable por tamaño | MIT (código y pesos) | OpenAI / HuggingFace |
| Herramientas de alineación forzada (p. ej. MFA) | Modelos acústicos + léxico | depende del modelo acústico | variable | variable | open source |

La comparación directa no está disponible porque no existen, en la información consultada, resultados de otros sistemas sobre el mismo conjunto de evaluación de tujia.

## Limitaciones y advertencias

- No predice tonos: las 264 etiquetas son sílabas sin tono y los tonos deben reconstruirse aguas abajo desde un lexicón. No debe usarse como reconocedor tonal.
- Degradación severa en audio de banda estrecha: en una grabación con el 85 % de la energía por debajo de 390 Hz, la recall cae al 48,85 %, con subsegmentación (104 sílabas predichas frente a 131 de referencia), de modo que predominan las omisiones sobre las sustituciones.
- Inestabilidad en vocales aisladas muy cortas: tokens de `i` o `u` de 0,5 a 1,0 s suelen adquirir un ataque (`ni`, `li`, `ji`), un patrón fuera de la distribución de entrenamiento.
- Cobertura limitada: los datos de entrenamiento son unas 2,6 horas de una única fuente, con pocos puntos dialectales y hablantes. Para otros puntos dialectales se recomienda usar un front-end de fonemas ZIPA como alternativa.
- Riesgo de alucinación y errores de segmentación inherentes a un CTC con CER de validación de 0,4125; los resultados requieren revisión humana en contextos de documentación.
- Restricciones de licencia: los pesos son solo para investigación (research-use-only). No se conceden derechos sobre las grabaciones ni las transcripciones de entrenamiento, que no se distribuyen. El código es MIT, pero el codificador upstream es Apache-2.0 y debe conservar su atribución.
- El corpus de entrenamiento no está disponible, lo que impide reproducir el entrenamiento o auditar los datos.
- Recomendación operativa: mantener cada entrada por debajo de ~60 segundos y dividir audio más largo con `--start` y `--duration`; los contenedores mp4/m4a deben demultiplexarse antes con ffmpeg.
- El script `fetch_encoder.sh` no funciona en Windows; es necesario configurar el codificador manualmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TujiaNLP/tujia-ctc-v0.1
- Proyecto padre (recolección de campo, normas de anotación, conversión ortográfica): https://github.com/ibaibing/TujiaNLP
- Página del proyecto ASR: https://github.com/ibaibing/tujia-asr
- Codificador upstream: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft

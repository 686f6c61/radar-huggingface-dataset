# TujiaNLP/tujia-ctc-v0.2

## Resumen

Tujia-ctc v0.2 es un sistema de reconocimiento automático del habla (ASR) a nivel de sílaba para el tujia, una lengua sino-tibetana en situación de peligro hablada principalmente en la provincia china de Hunan. Lo desarrolla el grupo TujiaNLP y su rasgo diferencial frente a la versión anterior es que incorpora los tonos directamente en las etiquetas de salida: el modelo devuelve secuencias como `la35` o `tsʰi53` en lugar de sílabas sin tono que hubiera que completar en una etapa posterior.

La arquitectura parte de un codificador wav2vec2 XLSR-53 preentrenado y ajustado, al que se añade una cabeza ligera formada por LayerNorm, dos capas BiLSTM de 256 unidades y una proyección lineal a 709 clases (708 sílabas con tono más el token blank). Solo la cabeza es entrenable en el paquete distribuido (4,5 millones de parámetros, unos 18 MB); el codificador ajustado se publica por separado como `TujiaNLP/tujia-xlsr53-ft` porque pesa aproximadamente 1,2 GB.

El modelo es relevante por dos motivos. Primero, aborda una lengua de muy bajos recursos con apenas 2,6 horas de audio de entrenamiento, un escenario en el que la mayoría de los ASR comerciales fallan por completo. Segundo, la separación entre cabeza y codificador permite iterar sobre la parte barata sin redistribuir el modelo completo, y la inclusión de tonos en la propia etiqueta simplifica la integración en pipelines de documentación lingüística y revitalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 XLSR-53 ajustado + LayerNorm + 2x BiLSTM(256) + Linear(512 → 709) |
| Parametros totales | no disponible (cabeza: 4.570.826; codificador aparte) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentacion por utterance, no por ventana fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tujia (codigo `tji`), dialecto septentrional |
| Licencia | research-use-only (codigo bajo MIT; pesos con licencia de solo investigacion) |
| Formato de pesos | PyTorch (`.pt` para la cabeza; codificador en safetensors segun el repo de Hugging Face) |

## Arquitectura y entrenamiento

El sistema se construye sobre `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, un modelo multilingue preentrenado con salida en fonemas espeak. En v0.2 se ajustan las cuatro capas superiores del transformer (de doce) junto con la cabeza CTC, lo que contrasta con v0.1, donde el codificador permanecia congelado. La cabeza combina normalizacion, dos capas BiLSTM bidireccionales de 256 unidades y una capa lineal que mapea 512 dimensiones a 709 clases: 708 silabas con tono mas el token blank en el indice 0. Durante el entrenamiento se anade una cabeza CTC auxiliar de cuatro clases para los tonos (`21`, `35`, `53`, `55`), que no se usa en inferencia.

Los datos de entrenamiento consisten en grabaciones de tujia de terceros, aproximadamente 2,6 horas, cuyos audios y transcripciones no se distribuyen. El mejor checkpoint corresponde a la epoca 18, seleccionado por tasa de error de silaba (SER) de validacion de 0,5527 sobre 108 clips reservados. La ablacion con `lambda_tone = 0` confirma que la perdida auxiliar de tono aporta unos cuatro puntos de mejora en la tasa de error de tono y alrededor de 0,3 puntos en silabas. En decodificacion se emplea un modelo de bigramas de silaba entrenado solo con las transcripciones de entrenamiento (descuento absoluto con respaldo a unigramas, 693 tipos y 692 contextos); el trigrama no aporto ganancia medible.

## Capacidades

- Reconocimiento de habla a nivel de silaba con marcas de tono integradas en la etiqueta de salida.
- Salida con marcas temporales de inicio y fin por silaba, ademas de una puntuacion de confianza por token.
- Decodificacion greedy, beam search (hasta 32) y decodificacion con modelo de lenguaje de bigramas de silaba.
- Salida estructurada en JSON mediante la opcion `--json`, y decodificacion de un intervalo concreto con `--start` y `--duration`.
- Procesamiento de audio en formato wav, flac y ogg a 16 kHz mono; los contenedores como mp4 o m4a requieren demultiplexado previo con ffmpeg.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-CTC.
- No dispone de capacidades de vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Documentacion linguistica de campo: transcribir grabaciones de hablantes de tujia con marcas de tono y marcas temporales, de modo que el linguista pueda alinear la transcripcion con el audio y revisar solo los segmentos de baja confianza.
- Revitalizacion y ensenanza del tujia: generar material de lectura con notacion tonal a partir de audios existentes, algo que con v0.1 exigia anotar los tonos manualmente en una etapa posterior.
- Corpus de bajo recursos para investigacion: producir transcripciones iniciales sobre las que aplicar correccion humana, reduciendo el coste de anotacion en una lengua sin herramientas comerciales.
- Busqueda por contenido en archivos de audio: indexar grabaciones por secuencia de silabas y tonos para localizar fragmentos concretos en archivos largos.
- Evaluacion comparativa de ASR de bajos recursos: servir como linea base reproducible (protocolo SER estricto con alineamiento Needleman-Wunsch) frente a otros enfoques sobre la misma lengua.
- Analisis prosodico y tonal: la cabeza auxiliar de tono y las etiquetas tonales permiten estudiar la distribucion de los cuatro tonos en un corpus sin anotacion manual previa.
- Despliegue en entornos con conectividad limitada: el codificador se puede obtener desde el espejo de ModelScope o desde `hf-mirror.com`, lo que facilita su uso en China continental sin proxy.

## Benchmarks y rendimiento

Resultados del protocolo estricto del autor. SER es la tasa de error de silaba tras alineamiento Needleman-Wunsch; la columna de tono se calcula solo sobre la subsecuencia tonal.

| Configuracion | dev SER | dev tono | test SER | test tono |
|---|---|---|---|---|
| Caracteristicas congeladas + greedy | 0,6882 | 0,4590 | 0,5402 | 0,3944 |
| Congeladas + beam 32 | 0,6866 | 0,4598 | 0,5381 | 0,3923 |
| Congeladas + bigrama (α=0,8) | 0,6753 | 0,4499 | 0,5274 | 0,3795 |
| Ajustado (esta version) + greedy | 0,6646 | 0,4568 | 0,4767 | 0,3463 |
| Ajustado + beam 32 | 0,6593 | 0,4514 | 0,4772 | 0,3463 |
| Ajustado + bigrama (α=1,5) | 0,6555 | 0,4439 | 0,4634 | 0,3376 |

Ablacion sobre la cabeza auxiliar de tono, medida sobre 108 clips reservados con el protocolo de v0.1:

| Checkpoint | recall 685 clips | recall 108 reservados | recall 577 entrenamiento | precision tonal reservados |
|---|---|---|---|---|
| `lambda_tone = 0` | 89,89 % | 82,80 % | 91,23 % | 65,05 % |
| `lambda_tone = 0,4` (esta version) | 89,90 % | 83,93 % | 91,03 % | no disponible en el extracto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: el codificador pesa aproximadamente 1,2 GB en precision completa; con la cabeza de 18 MB el total ronda 1,3-1,5 GB en fp32. No se han publicado cifras de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4090 o A100 funcionan sin problema, aunque el modelo es lo bastante pequeno para que la GPU no sea el cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU (el script de inferencia admite `--device cpu`).
- Opciones de despliegue: el paquete incluye `infer.py` como script autonomo; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un modelo CTC de este tamano.
- Latencia y throughput: no disponibles. La arquitectura (wav2vec2 + BiLSTM pequena) sugiere inferencia en tiempo real o mas rapida en GPU de consumo, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SER test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tujia-ctc v0.2 | cabeza 4,57 M + codificador XLSR-53 | no disponible | 0,4634 (con bigrama) | research-use-only | Hugging Face y ModelScope |
| Tujia-ctc v0.1 | cabeza sobre codificador congelado | no disponible | no disponible (264 silabas sin tono) | no disponible | Hugging Face |
| wav2vec2-xlsr-53-espeak-cv-ft | ~317 M | no disponible | no aplica (modelo base) | Apache-2.0 | Hugging Face |
| Whisper (large-v3) | ~1,55 B | 30 s por ventana | no disponible para tujia | MIT | Hugging Face, OpenAI |

La comparacion con Whisper es orientativa: no se han publicado evaluaciones de Whisper sobre tujia en la informacion disponible, y su salida es texto ortografico, no silabas con tono, por lo que no es directamente sustituible en este caso de uso.

## Limitaciones y advertencias

- Licencia `research-use-only`: los pesos no pueden usarse en productos comerciales sin autorizacion explicita; solo el codigo (`infer.py`, scripts) esta bajo MIT.
- El corpus de entrenamiento es de 2,6 horas, lo que limita la cobertura de hablantes, condiciones acusticas y variacion dialectal; el propio autor reporta SER de test en torno al 47 %, es decir, casi una de cada dos silabas incorrecta.
- El codificador original de Hugging Face no puede sustituir al ajustado: mezclarlos degrada el reconocimiento de forma sustancial, segun advierte el autor.
- Sesgos conocidos: no se documentan analisis de sesgo por sexo, edad o procedencia de los hablantes; con un corpus tan pequeno el riesgo de mal rendimiento fuera de la distribucion de entrenamiento es alto.
- Riesgo de alucinacion: en CTC el riesgo se manifiesta como sustituciones y silabas espurias, especialmente en audio con ruido o solapamiento de habla.
- Limitaciones de idioma: solo tujia, dialecto septentrional; no hay soporte multilingue ni cambio de codigo.
- Restricciones tecnicas: `fetch_encoder.sh` es un script POSIX y no funciona en Windows, donde hay que copiar el codificador manualmente; los contenedores mp4 y m4a requieren demultiplexado previo.
- En produccion conviene aplicar un umbral de confianza y revision humana: las puntuaciones por token que emite el modelo permiten filtrar segmentos dudosos, pero no se ha validado su calibracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-ctc-v0.2
- Codificador ajustado: https://huggingface.co/TujiaNLP/tujia-xlsr53-ft
- Modelo base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Espejo en ModelScope: https://modelscope.cn/models/TujiaNLP/tujia-xlsr53-ft (mismo identificador que en Hugging Face)
- Espejo de Hugging Face para China continental: https://hf-mirror.com

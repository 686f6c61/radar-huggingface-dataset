# Toxirerkinovtohir/whisper-small-karakalpak

## Resumen

Whisper-small-karakalpak es un ajuste fino del modelo openai/whisper-small (244 millones de parametros) para reconocimiento automatico del habla (ASR) en karakalpak o qaraqalpaq, una lengua turquica hablada principalmente en la Republica de Karakalpakstan (Uzbekistan). El modelo lo publica el desarrollador Toxir Erkinov (usuario Toxirerkinovtohir) y resuelve un problema de baja disponibilidad de recursos: Whisper no incluye el karakalpak entre sus 99 idiomas, por lo que sin ajuste fino el rendimiento es practicamente nulo (WER del 100,29 % en el conjunto de prueba).

La contribucion principal es practica: partiendo de un corpus de 99 horas de audio limpio y aplicando un ajuste fino completo durante 5 epocas, el modelo reduce el WER del 100,29 % al 20,22 % y el CER del 48,69 % al 7,12 % con decodificacion beam de tamano 5. El autor documenta una segunda mejora mediante una heuristica de "reserva de bucle" (loop guard) implementada en un script externo, que baja el WER al 18,69 % y el CER al 5,79 %.

Es relevante para investigadores y desarrolladores que trabajen con lenguas de bajos recursos, porque demuestra un flujo reproducible de limpieza de datos (VAD de Silero, normalizacion, deduplicacion y eliminacion de fugas entre particiones) y porque se distribuye con licencia Apache-2.0, lo que facilita su uso comercial sin las restricciones de otros corpus. El contexto de entrenamiento es de 30 segundos por ventana, el estandar de la familia Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), ajuste fino completo de openai/whisper-small |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (limite nativo de Whisper) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | kaa (karakalpak / qaraqalpaq, escritura latina); en inferencia se usa el token de idioma `uz` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura original de Whisper-small: un encoder Transformer que procesa espectrogramas mel logaritmicos de 30 segundos y un decoder autorregresivo que genera tokens de texto, con 244 millones de parametros en total. El ajuste fino es completo (no se congela ninguna capa), sobre el checkpoint openai/whisper-small. Como Whisper no dispone de token de idioma para el karakalpak, se utiliza el token `uz` (uzbeko, escritura latina) tanto en entrenamiento como en inferencia; el token queda fijado en `generation_config`.

Los datos proceden del dataset atikuwu/karakalpak-speech-corpus, que pasa de 21.702 a 20.737 clips y de 106,9 a 99,0 horas tras un proceso de limpieza que incluye recorte con VAD de Silero, normalizacion, deduplicacion y eliminacion de fugas entre particiones. La particion final es de 18.685 clips (89,3 horas) para entrenamiento, 1.034 para validacion y 1.018 para prueba. Los hiperparametros son: learning rate 1e-5, 500 pasos de warmup, batch de 16, 5 epocas y precision bf16, con un coste de 2 horas y 33 minutos en una NVIDIA DGX Spark (GB10). Se selecciono el checkpoint-5000 por WER de validacion.

La normalizacion del texto de referencia aplica minusculas, elimina puntuacion, expande unidades como `mln` a `million` y retira la marca final `ÓzA`; el modelo reproduce ese estilo de salida. No se documenta uso de RLHF ni DPO, solo ajuste fino supervisado con entropia cruzada estandar de ASR.

## Capacidades

- Transcripcion de voz a texto en karakalpak con escritura latina, con salida en minusculas y sin puntuacion.
- Manejo de audio de hasta 30 segundos por inferencia; para audios mas largos el autor proporciona un script (`transcribe.py`) que segmenta y procesa carpetas completas.
- Decodificacion con beam search configurable (el autor valida beam de tamano 5).
- Heuristica de reserva contra bucles de repeticion, implementada en el script externo, no en los pesos.
- Normalizacion implicita de numeros a palabras (`eki mıń jigirma altınshı`) y expansion de unidades.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente de transcripcion.
- No dispone de vision, audio generation ni modo thinking.
- Multilingue limitado: solo karakalpak; el token `uz` actua como aproximacion y no garantiza transcripcion correcta de uzbeko.

## Casos de uso

- Transcripcion de archivos de audio de noticias y boletines en karakalpak: el modelo se entreno sobre discurso leido de estilo informativo, por lo que es el escenario con mejor calidad esperada. Se usaria con `pipeline("automatic-speech-recognition")` y `num_beams=5`.
- Digitalizacion de archivos sonoros de radios locales de Karakalpakstan: el script `transcribe.py` permite procesar carpetas completas y audios de mas de 30 segundos mediante segmentacion, lo que facilita la conversion masiva de cintas y grabaciones historicas.
- Generacion de subtitulos para videos institucionales y educativos: con un CER del 7,12 % en habla limpia, la salida es util como base de subtitulado que despues se revisa manualmente, especialmente en terminologia tecnica.
- Investigacion en linguistica de lenguas turquicas: el modelo sirve como linea base reproducible para experimentos de ASR de bajos recursos, y el repositorio de GitHub documenta todo el pipeline de datos y las pruebas.
- Creacion de corpus anotados a partir de audio sin transcripcion: las transcripciones del modelo pueden usarse como preanotacion para acelerar el etiquetado humano en nuevos dominios (conversacion, dialectos), reduciendo el coste de anotacion.
- Integracion en aplicaciones de accesibilidad para hablantes de karakalpak: dictado de notas de voz o lectura de documentos en voz alta con transcripcion, desplegable en local con transformers sobre una GPU consumer por el reducido tamano del modelo.
- Prototipos de asistentes de voz en entornos con conectividad limitada: al pesar 1,0 GB en safetensors y tener 244 millones de parametros, puede ejecutarse en infraestructura modesta sin depender de servicios en la nube.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / configuracion | Conjunto de prueba | WER | CER |
|---|---|---|---|
| Whisper-small sin ajuste fino (token `kk`, salida latina) | Karakalpak Speech Corpus, test (1.018 clips) | 100,29 % | 48,69 % |
| whisper-small-karakalpak, beam 5 | Karakalpak Speech Corpus, test (1.018 clips) | 20,22 % | 7,12 % |
| whisper-small-karakalpak, beam 5 + reserva de bucle | Karakalpak Speech Corpus, test (1.018 clips) | 18,69 % | 5,79 % |

El autor indica que el WER de validacion con beam 5 fue del 20,07 %, coherente con el 20,22 % de prueba. No se han publicado resultados comparativos con otros modelos ASR para karakalpak en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1 GB para los pesos (244 millones de parametros), mas overhead de activaciones y del encoder de audio; en la practica, menos de 2 GB.
- En bf16/fp16: alrededor de 0,5 GB de pesos, con un consumo total tipico por debajo de 1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entreno en una NVIDIA DGX Spark (GB10), pero la inferencia cabe en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida; tambien es viable en CPU para audios cortos.
- Opciones de despliegue: transformers (pipeline oficial), y por compatibilidad de arquitectura con Whisper, exportacion a otros runtimes (no documentada por el autor); el repositorio incluye `transcribe.py` para procesamiento por lotes.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste de entrenamiento fue de 2 h 33 min en una DGX Spark para 5 epocas sobre 89,3 horas de audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | WER en karakalpak | Licencia |
|---|---|---|---|---|---|
| whisper-small-karakalpak | 241,7 M | 30 s | kaa (token `uz`) | 20,22 % (beam 5) | Apache-2.0 |
| openai/whisper-small (base) | 244 M | 30 s | 99 idiomas, sin karakalpak | 100,29 % (token `kk`) | Apache-2.0 |
| openai/whisper-large-v3 | 1.550 M | 30 s | 99 idiomas, sin karakalpak | no disponible | Apache-2.0 |
| whisper-small ajustado a otras lenguas turquicas | ~244 M | 30 s | idioma especifico | no disponible | variable |

La comparacion directa solo es posible contra el modelo base, ya que no se han publicado en la informacion disponible otros ajustes de Whisper para karakalpak ni resultados de Whisper-large-v3 sobre este corpus. La ventaja frente al base es clara (reduccion del WER de 100,29 % a 20,22 %); la desventaja frente a modelos mayores es el techo de calidad inherente a 244 millones de parametros y a un corpus de 99 horas de habla leida.

## Limitaciones y advertencias

- El corpus de entrenamiento es principalmente habla leida de estilo informativo; el rendimiento baja en conversacion libre, dialectos y entornos con ruido.
- El error se concentra en los sufijos (33,7 % de los errores): al ser una lengua aglutinante, la raiz suele ser correcta pero el sufijo sale mal, lo que puede alterar el significado gramatical.
- El modelo entra ocasionalmente en bucles de repeticion (11,7 % de los errores de validacion); la reserva de bucle del script externo lo mitiga, pero no lo elimina.
- Los numeros se emiten como palabras y los nombres propios y abreviaturas pueden fallar.
- El token de idioma `uz` es una aproximacion: el modelo no distingue karakalpak de uzbeko y puede producir salidas mezcladas si el audio no es karakalpak.
- La salida carece de puntuacion y mayusculas por diseno (normalizacion del texto de entrenamiento), lo que exige postprocesado para texto publicable.
- Riesgo de alucinacion en segmentos de silencio o ruido: Whisper tiende a generar texto plausible aunque no haya habla; conviene aplicar deteccion de actividad de voz antes de transcribir.
- Licencia Apache-2.0 permite uso comercial, pero el corpus de entrenamiento es CC-BY-4.0 y requiere atribucion a atikuwu si se redistribuye el modelo o se documenta su procedencia.
- Los resultados de benchmarks no estan verificados de forma independiente (`verified: false` en la model-index) y el conjunto de prueba procede del mismo corpus que el entrenamiento, aunque con eliminacion de fugas declarada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Toxirerkinovtohir/whisper-small-karakalpak
- Demo en Spaces: https://huggingface.co/spaces/Toxirerkinovtohir/karakalpak-asr
- Repositorio de codigo, pipeline de datos y experimentos: https://github.com/toxirerkinov70-commits/whisper-small-karakalpak
- Script de transcripcion por lotes: https://github.com/toxirerkinov70-commits/whisper-small-karakalpak/blob/main/transcribe.py
- Dataset Karakalpak Speech Corpus: https://huggingface.co/datasets/atikuwu/karakalpak-speech-corpus
- Perfil del autor del dataset: https://huggingface.co/atikuwu
- Perfil de GitHub del autor: https://github.com/toxirerkinov70-commits
- Modelo base: https://huggingface.co/openai/whisper-small

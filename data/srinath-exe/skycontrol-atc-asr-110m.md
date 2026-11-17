# srinath-exe/skycontrol-atc-asr-110m

## Resumen

SkyControl ATC-ASR 110M es un modelo de reconocimiento automatico del habla (ASR) especializado en comunicaciones de control de trafico aereo (ATC). Lo desarrolla el usuario srinath-exe y deriva de nvidia/parakeet-tdt_ctc-110m, un modelo transducer de NVIDIA de 110 millones de parametros que combina decodificacion TDT (Token-and-Duration Transducer) y CTC. El ajuste fino se ha realizado sobre habla ATC en ingles, cubriendo indicativos (callsigns), alfabeto fonetico, numeros agrupados y fraseologia estandar de control aereo.

La aportacion principal del modelo no es solo el ajuste de dominio, sino su formato de distribucion: se publica como tres grafos ONNX cuantizados a int8 (encoder, decoder y joiner) con el layout que espera sherpa-onnx, lo que permite ejecutarlo integramente en el navegador mediante ONNX Runtime Web sin conexion a servidores. Esto lo hace relevante para aplicaciones de asistencia a controladores, transcripcion de audio historico y herramientas de entrenamiento que necesiten baja latencia y funcionamiento offline.

El modelo procesa audio mono a 16 kHz con caracteristicas log-mel de 80 bins generadas con NeMo y emplea decodificacion greedy TDT. El repositorio ocupa aproximadamente 0,1 GB, esta licenciado bajo CC-BY-4.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT-CTC (encoder, decoder y joiner) |
| Parametros totales | 110 millones (heredados de nvidia/parakeet-tdt_ctc-110m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (segmentacion por ventanas de audio) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX int8 (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer de NVIDIA Parakeet en su variante TDT-CTC de 110 M de parametros, reajustado sobre audio de control de trafico aereo. La arquitectura transducer separa el modelado acustico (encoder), el modelado linguistico (decoder) y la combinacion de ambos (joiner); la variante TDT predice conjuntamente tokens y duraciones, lo que reduce el numero de pasos de decodificacion frente a un transducer convencional. El pipeline de entrada es el de NeMo: audio mono a 16 kHz convertido a log-mel de 80 bins, con decodificacion greedy TDT en inferencia.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion exacta del corpus ATC, ni sobre si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos. Tampoco se documentan hiperparametros de ajuste fino ni la procedencia de las grabaciones. La innovacion destacable es la exportacion a ONNX int8 en el layout de sherpa-onnx, que habilita inferencia en navegador con ONNX Runtime Web y ejecucion offline.

## Capacidades

- Reconocimiento de voz en ingles especializado en fraseologia de control de trafico aereo.
- Transcripcion de indicativos de aeronaves (callsigns) y alfabeto fonetico de la OACI.
- Reconocimiento de numeros agrupados y secuencias tipicas de instrucciones ATC (altitud, rumbo, frecuencia, pista).
- Inferencia offline en navegador mediante ONNX Runtime Web.
- Ejecucion con sherpa-onnx usando los tres grafos ONNX y el fichero tokens.txt.
- Procesamiento de audio mono a 16 kHz con caracteristicas log-mel de 80 bins.
- No se documentan capacidades de tool calling, agentes, vision, audio multilingue ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de grabaciones ATC para auditoria y analisis post-incidente: el modelo convierte audio de frecuencia aerea en texto para revision por parte de investigadores, aprovechando el ajuste a fraseologia y callsigns.
- Asistencia en tiempo real a controladores: integrado en una aplicacion web con ONNX Runtime Web, transcribe las comunicaciones y muestra el texto al controlador sin enviar audio a un servidor externo.
- Herramientas de entrenamiento de pilotos y controladores: genera transcripciones de sesiones simuladas para evaluar el uso correcto de fraseologia y la claridad de las instrucciones.
- Monitorizacion de calidad de comunicaciones: deteccion de instrucciones mal pronunciadas o incompletas comparando la transcripcion con la fraseologia esperada.
- Despliegue en entornos con conectividad limitada o restringida: al ejecutarse en navegador y de forma offline, es apto para torres remotas, simuladores aislados o ejercicios sin red.
- Prototipado rapido de interfaces de voz para aviacion: el formato sherpa-onnx y el tamano reducido (0,1 GB) permiten integrar el modelo en demos y pruebas de concepto sin infraestructura GPU.
- Analisis de corpus historicos de radio ATC: transcripcion por lotes de archivos de audio para construir bases de datos de comunicaciones etiquetadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 110 M de parametros en int8, el peso de los grafos es del orden de decenas de MB y cabe en memoria de CPU o GPU integrada.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion en navegador con ONNX Runtime Web, por lo que no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido, aunque no se documentan pruebas.
- Opciones de despliegue: ONNX Runtime Web (navegador) y sherpa-onnx; otros runtimes ONNX no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| SkyControl ATC-ASR 110M | 110 M | en | ONNX int8 | cc-by-4.0 | ASR de dominio ATC, navegador |
| nvidia/parakeet-tdt_ctc-110m | 110 M | en | NeMo | cc-by-4.0 | ASR general en ingles |
| Whisper small | 244 M | multilingue | varios | MIT | ASR general multilingue |
| Whisper base | 74 M | multilingue | varios | MIT | ASR general multilingue |

La comparacion con Whisper se basa en el orden de magnitud de parametros; no se dispone de resultados de benchmarks que permitan comparar precision entre estos modelos en el dominio ATC.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado para otros idiomas ni para acentos no documentados.
- El ajuste fino es de dominio muy especifico (ATC); su rendimiento en habla general puede degradarse respecto al modelo base.
- No se han publicado evaluaciones cuantitativas (WER) ni en el dominio ATC ni fuera de el, por lo que la calidad real es desconocida.
- Riesgo de alucinacion en audio ruidoso o con solapamiento de voces, habitual en comunicaciones de radio.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos no descritos, pueden heredarse sesgos acusticos y linguisticos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero obliga a citar al autor y al modelo base; conviene revisar las condiciones del modelo de NVIDIA subyacente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.
- El repo no declara pipeline ni documentacion sobre el corpus de ajuste, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srinath-exe/skycontrol-atc-asr-110m
- Proyecto SkyControl: https://openatc.aeon-labs.site
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m

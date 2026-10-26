# vanshnawander/sapc2-moonshine-m10s

## Resumen

`sapc2-moonshine-m10s` es un modelo de reconocimiento automático del habla (ASR) en inglés, con 10.746.112 parámetros (10,8 M), desarrollado por el usuario de Hugging Face vanshnawander como participación en la Speech Accessibility Project Challenge 2 (SAPC2). El modelo está especializado en habla disártrica de personas con ELA (ALS), parálisis cerebral, síndrome de Down, enfermedad de Parkinson e ictus, un dominio en el que los sistemas ASR convencionales fallan de forma sistemática.

Técnicamente es un "student" de la familia Moonshine (encoder-decoder transformer de baja latencia para ASR), con anchura de modelo 256 y 7 cabezas de atención, destilado del modelo mayor `m15s` del mismo autor. Su interés principal es el tamaño: poco más de 10 millones de parámetros permiten inferencia en CPU y en hardware muy modesto, algo relevante para interfaces de voz y herramientas de accesibilidad que deben ejecutarse en el dispositivo.

El modelo se distribuye con licencia MIT y pesos en safetensors para `transformers`, solo en inglés. No es un sistema listo para producción: sobre el conjunto Dev completo reporta un 43,60 % de WER en decodificación greedy y un 38,49 % con beam search de tamaño 4, con degradación clara en grabaciones largas y en determinadas etiologías. Su valor es como base de investigación, punto de partida para fine-tuning y referencia de eficiencia extrema en el dominio SAPC2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder transformer para ASR); anchura 256, 7 cabezas de atencion |
| Parametros totales | 10.746.112 (10,8 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de audio; en la evaluacion del autor se usaron ventanas de 200 s) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea declarada | automatic-speech-recognition |
| Modelo del que deriva | Moonshine `m15s` (destilacion), mismo autor |
| Dominio de entrenamiento | SAPC2: habla disartrica (ELA, paralisis cerebral, sindrome de Down, Parkinson, ictus) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Descargas / likes | 24 / 0 (en el momento de la consulta) |
| Fecha de creacion / actualizacion | 2026-10-23 / 2026-10-26 |

## Arquitectura y entrenamiento

La model card identifica el modelo como "Moonshine student m10s" y concreta su configuracion: anchura 256 y 7 cabezas de atencion, destilado del modelo `m15s` de SAPC2 del mismo autor. La familia Moonshine es una arquitectura encoder-decoder transformer orientada a ASR de baja latencia, disenada para procesar audio de longitud variable sin el relleno fijo a 30 segundos tipico de otros sistemas. No se detalla en la informacion disponible el numero de capas del encoder ni del decoder, la dimension de las features de entrada, el tamano de vocabulario ni el tokenizer.

El entrenamiento consiste en un fine-tuning sobre el corpus de SAPC2, formado por grabaciones en ingles de hablantes con cinco etiologias (ELA, paralisis cerebral, sindrome de Down, Parkinson e ictus). El autor documenta una "escalera" de compresion con checkpoints cada 100 pasos hasta el paso 2662, con evaluacion en Dev-1000. La model card no indica el numero de tokens de audio vistos, la composicion exacta del dataset, ni documenta etapas de RLHF, DPO ni preferencias; el proceso es supervision directa sobre transcripciones, complementado con destilacion desde `m15s`.

## Capacidades

- Transcripcion de voz a texto en ingles sobre habla disartrica, con especial cobertura de hablantes con ELA, paralisis cerebral, sindrome de Down, Parkinson e ictus.
- Decodificacion greedy y con beam search (beam 4 reportado por el autor).
- Procesamiento de audio de duracion variable; en la evaluacion completa se usaron ventanas de 200 s por grabacion.
- Modelo muy compacto (10,8 M de parametros): apto para inferencia en CPU y en GPU de gama baja.
- Integracion con el ecosistema `transformers` (pipeline `automatic-speech-recognition`), con tag `endpoints_compatible`.
- No documentado: soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla de la transcripcion, modo "thinking", diarizacion, marcas de tiempo, deteccion de idioma o traduccion.
- Capacidad multilingue: no, exclusivamente ingles.

## Casos de uso

- Subtitulado asistivo en tiempo real: con 10,8 M de parametros el modelo puede ejecutarse en el propio dispositivo, lo que permite generar subtitulos para una persona con disartria sin enviar audio a la nube, un requisito habitual en entornos personales y sanitarios.
- Comunicacion aumentativa y alternativa (AAC): integrado en una aplicacion de tablet o movil, convierte el habla disartrica en texto para que el interlocutor la lea; el tamano reducido hace viable el despliegue offline.
- Interfaces de voz de baja latencia: la familia Moonshine esta disenada para voz embebida; este checkpoint sirve como base para prototipos de activacion por voz o dictado en dispositivos con recursos limitados.
- Preprocesado de corpus clinicos: transcripcion inicial de grabaciones de pacientes para su posterior revision humana; el 38,49 % de WER con beam 4 obliga a un paso de correccion, pero acelera el etiquetado frente a la trascripcion manual desde cero.
- Baseline de investigacion para SAPC2: punto de comparacion reproducible (Dev-1000 con resultados por paso y desglose por etiologia y duracion) para medir mejoras de otros sistemas en el mismo dominio.
- Fine-tuning especifico por patologia o hablante: al ser un modelo de 10,8 M con licencia MIT, es barato reentrenarlo o adaptarlo con datos de un unico usuario o de una etiologia concreta (por ejemplo, paralisis cerebral, que concentra el 23,47 % de los errores).
- Analisis de sesiones largas de entrevista: util para explorar como se degrada la precision con la duracion (27,93 % de WER en 3-5 s frente a 55,39 % en mas de 35 s) y decidir la estrategia de segmentacion en pipelines de investigacion.

## Benchmarks y rendimiento

Resultados reportados por el autor. Dev-1000 es un subconjunto fijo de 1.000 grabaciones del Dev oficial; las puntuaciones usan el normalizador de la competicion contra la mejor de las dos referencias. Seleccion de la escalera de entrenamiento (la model card incluye los 29 puntos):

| Paso | Dev-1000 WER | Dev-1000 CER |
|---:|---:|---:|
| 0 | 99,76 % | 91,78 % |
| 500 | 49,09 % | 33,81 % |
| 1000 | 44,43 % | 30,66 % |
| 1500 | 42,00 % | 29,05 % |
| 2000 | 41,47 % | 27,78 % |
| 2300 (mejor) | 40,50 % | 27,13 % |
| 2662 (final) | 40,63 % | 27,64 % |

Conjunto Dev completo (47.929 grabaciones, ventanas de 200 s, scorer rapido):

| Decodificacion | WER | CER | Vacias | Capped | Tiempo de decodificacion |
|---|---:|---:|---:|---:|---:|
| Greedy | 43,60 % | 29,39 % | 0 | 38 | 11 min en una RTX 4050 |
| Beam 4 | 38,49 % | 25,78 % | 0 | 87 | 25 min en una RTX 4050 |

Desglose de errores con predicciones greedy: transcripciones exactas 38,48 %; sustituciones 32,67 %, deleciones 5,59 % e inserciones 7,31 % de las palabras de referencia (WER sin capado 45,57 %).

WER por duracion de la grabacion (greedy):

| Duracion | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| 1-2 s | 670 | 40,32 % | 0,34 % |
| 2-3 s | 4.354 | 27,06 % | 2,25 % |
| 3-5 s | 14.700 | 27,93 % | 10,09 % |
| 5-8 s | 14.739 | 35,99 % | 18,34 % |
| 8-12 s | 7.023 | 45,95 % | 15,96 % |
| 12-20 s | 3.867 | 51,96 % | 16,13 % |
| 20-35 s | 1.657 | 53,43 % | 15,92 % |
| >35 s | 919 | 55,39 % | 20,97 % |

WER por etiologia (greedy):

| Etiologia | Grabaciones | WER | Cuota de errores |
|---|---:|---:|---:|
| ELA (ALS) | 10.232 | 39,99 % | 20,26 % |
| Paralisis cerebral | 11.472 | 52,37 % | 23,47 % |
| Sindrome de Down | 7.719 | 46,42 % | 12,48 % |
| Enfermedad de Parkinson | 14.543 | 41,68 % | 39,23 % |
| Ictus | 3.963 | 37,93 % | 4,56 % |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech) en la informacion disponible; todas las cifras anteriores son metricas de la competicion SAPC2.

## Requisitos de hardware

- VRAM estimada: aproximadamente 43 MB en fp32 y 21,5 MB en fp16/bf16 para los pesos (calculo a partir de los 10,8 M de parametros); el cuello de botella real es el coste de atencion sobre audios largos, no el peso del modelo.
- GPU: el autor mide la decodificacion completa en una RTX 4050 (gama portatil de entrada). A100, H100 o RTX 4090 no aportan nada practico a este tamano; el modelo cabe en cualquier GPU consumer, integrada o incluso en CPU.
- Cabe en GPU consumer: si, sin restricciones relevantes de memoria en cualquier GPU con mas de 1 GB de VRAM.
- Despliegue: `transformers` con el pipeline `automatic-speech-recognition` (tag `endpoints_compatible`, por lo que puede servirse en Hugging Face Inference Endpoints). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un modelo de audio no es esperable que estas herramientas lo cubran sin adaptaciones.
- Rendimiento medido: 11 minutos para decodificar las 47.929 grabaciones del Dev completo en greedy y 25 minutos con beam 4 sobre una RTX 4050 (autor). No se proporciona RTF ni latencia por utterance.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sapc2-moonshine-m10s (este) | 10,8 M | ventanas de hasta 200 s en evaluacion | 43,60 % Dev completo greedy; 38,49 % beam 4 | MIT | Hugging Face, `transformers` |
| vanshnawander/sapc2-moonshine-tiny-rl | 27 M | no disponible | no disponible en la informacion consultada | no disponible | Hugging Face |
| Whisper-large-v2 (baseline del reto SAPC anterior, Interspeech 2025) | 1.550 M (dato publico del modelo original) | 30 s por ventana | 17,82 % de WER de partida en el corpus del reto anterior | MIT | Ampliamente disponible |
| Moonshine original (tiny/base) | no disponible en la informacion consultada | no disponible | no disponible | no disponible | GitHub `moonshine-ai/moonshine` |

Aviso importante sobre la comparacion: el 17,82 % de WER de Whisper-large-v2 corresponde al Speech Accessibility Project Challenge de Interspeech 2025, sobre un corpus distinto y anterior al de SAPC2, que es mas grande y esta balanceado por etiologia; por tanto no es una comparacion directa con las cifras de este modelo. La organizacion de SAPC2 indica que el mejor sistema del reto anterior bajo el WER de 17,82 % a 8,11 %, lo que situa el 38-43 % de este checkpoint muy lejos del estado del arte del dominio, a cambio de un tamano tres ordenes de magnitud menor.

## Limitaciones y advertencias

- Precision baja para uso productivo sin supervision: 38,49 % de WER incluso con beam 4 sobre el Dev completo; solo el 38,48 % de las transcripciones greedy son exactas.
- Degradacion fuerte con la duracion: el WER pasa del 27,06 % en grabaciones de 2-3 s al 55,39 % en las de mas de 35 s, y las grabaciones largas concentran la mayor parte de los errores.
- Sesgo por etiologia: la paralisis cerebral es la peor cubierta (52,37 % de WER) y el Parkinson la mejor (41,68 %), pese a que esta ultima aporta el 39,23 % de todos los errores por volumen de grabaciones.
- Alucinacion y transcripts desbocados: 926 transcripciones (5,43 % de todos los errores) superan 1,5 veces la longitud de la referencia y 402 aparecen truncadas; los ejemplos publicados muestran bucles de repeticion ("i was a soup i was a soup...") y texto sin sentido. Cualquier integracion debe incluir deteccion de longitudes anomalas.
- Solo ingles: no cubre otros idiomas ni cambios de codigo; no se documenta deteccion de idioma.
- Dominio estrecho: entrenado sobre habla disartrica de SAPC2; el rendimiento en habla tipica o en audio con ruido, telefonia o multiples hablantes no esta documentado.
- Validacion externa practicamente nula: 24 descargas y 0 likes en el momento de la consulta, sin revision por pares ni resultados en benchmarks independientes.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; conviene verificar los terminos del corpus SAPC2 si se va a reentrenar con datos derivados.
- Sin informacion sobre sesgos de generacion, tokenizer, preprocesado de audio ni requisitos exactos de sample rate; es necesario inspeccionar el repositorio antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/sapc2-moonshine-m10s
- Perfil del autor: https://huggingface.co/vanshnawander
- Modelo hermano (Moonshine Tiny 27M, SFT + RL): https://huggingface.co/vanshnawander/sapc2-moonshine-tiny-rl
- Speech Accessibility Project Challenge 2 (sitio oficial): https://xiuwenz2.github.io/SAPC2-website/
- Repositorio Moonshine (moonshine-ai): https://github.com/moonshine-ai/moonshine
- Modelos micro de Moonshine: https://github.com/moonshine-ai/moonshine/tree/main/micro/models

# weihongliang/jevtrainer-omni3b-2026-10-04

## Resumen

JevTrainer Omni 3B es un adaptador LoRA de tipo "decision model" construido sobre el *thinker* de Qwen/Qwen2.5-Omni-3B, publicado por el usuario weihongliang (repositorio `weihongliang/jevtrainer-omni3b-2026-10-04`). El modelo consume entradas multimodales (texto, imagen, vídeo y audio) y produce una salida de decision denominada `marker`; no es un modelo conversacional generativo, sino un cabezal de decision entrenado sobre las representaciones del thinker del modelo base. Segun la model card, solo se carga el thinker: la rama de salida de voz (talker) del modelo original no se utiliza.

El entrenamiento consiste en un adaptador LoRA con r=32 y alpha=64, afinado sobre 79 conjuntos de datos de texto, imagen, audio y vídeo durante una sola epoca, con la configuracion `configs/av/omni3b_v4.yaml` del repositorio jevtrainer. El proceso finalizo el 4 de octubre de 2026. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA mas el fichero de readout (`readout.json`) en lugar de pesos completos.

Su relevancia actual es acotada pero concreta: demuestra que un ajuste LoRA de bajo rango sobre un modelo omni de 3B parametros mejora de forma medible tareas de comprension audiovisual y de hablante, con incrementos de entre 2,18 y 5,61 puntos porcentuales sobre el modelo base en los cinco benchmarks reportados, y con una calibracion muy ajustada en el holdout interno (ECE 0,0096). Es, por tanto, mas interesante como receta reproducible de ajuste multimodal que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Thinker de Qwen2.5-Omni (transformer multimodal) con adaptador LoRA y cabezal de decision `marker`; la rama talker no se carga |
| Parametros totales | 3B en el modelo base Qwen2.5-Omni-3B; el repositorio solo contiene el adaptador LoRA (r=32, alpha=64) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Qwen2.5-Omni-3B declara 32 768 tokens segun su documentacion |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA + `readout.json`) |
| Tamano del repositorio | 0,3 GB |
| Modelo base | Qwen/Qwen2.5-Omni-3B |
| Modalidades de entrada | Texto, imagen, audio y video |
| Salida | Etiqueta de decision `marker` |
| Fecha de finalizacion del entrenamiento | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni-3B, un transformer multimodal que procesa texto, imagen, audio y video en un unico espacio de representaciones. Sobre ese thinker se entrena un adaptador LoRA de rango 32 y alpha 64, mas un cabezal de lectura cuya salida es `marker`. La model card especifica explicitamente que solo se carga el thinker y que la salida de voz no se emplea, de modo que el modelo no genera habla pese a derivar de una familia omni.

Los datos de entrenamiento provienen de 79 conjuntos de texto, imagen, audio y video, procesados durante una sola epoca con la configuracion `configs/av/omni3b_v4.yaml`. No se documenta en la informacion disponible el volumen total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; dado que se trata de un ajuste LoRA supervisado sobre un cabezal de decision, lo previsible es un entrenamiento supervisado clasico, pero esto no se confirma en la model card. El holdout de evaluacion interna consta de 1 610 ejemplos, con una exactitud del 85,03 %, una puntuacion de habilidad (skill) del 79,54 % y un ECE de 0,0096.

## Capacidades

- Comprension multimodal conjunta: procesa texto, imagenes, audio y video como entrada, de forma simultanea segun la model card.
- Decision multimodal: genera una etiqueta `marker` en lugar de texto libre, orientada a tareas de clasificacion o decision sobre el contenido de la entrada.
- Razonamiento sobre conocimiento del mundo a partir de video: evaluado en WorldSense.
- Comprension audiovisual integrada: evaluado en OmniBench y AV-Odyssey.
- Comprension de audio y contexto diario: evaluado en Daily-Omni.
- Tareas relacionadas con hablante: evaluado en SpeakerBench.
- No soporta: generacion de voz (la rama talker no se carga), y no se documenta soporte de tool calling, function calling, uso agentico ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Moderacion de contenido audiovisual: el modelo puede clasificar fragmentos de video y audio con una unica pasada multimodal, emitiendo una decision `marker` por clip; es adecuado porque integra las cuatro modalidades en un mismo thinker de 3B, con un coste de inferencia bajo.
- Verificacion de coherencia entre audio y video: util para detectar doblajes mal sincronizados, pistas de audio manipuladas o desalineaciones en pipelines de postproduccion, aprovechando su evaluacion en AV-Odyssey.
- Analisis de reuniones y transcripciones con identificacion de hablante: la evaluacion en SpeakerBench sugiere que el cabezal distingue caracteristicas del hablante; se puede emplear para etiquetar turnos o validar diarizacion antes de un postprocesado con ASR.
- Etiquetado automatico de archivos multimedia a escala: al ser un adaptador de 0,3 GB sobre un base de 3B, permite desplegar multiples cabezales de decision sobre el mismo thinker con requisitos de memoria contenidos.
- Clasificacion de escenas con conocimiento del mundo: tareas de catalogacion de video divulgativo, documental o educativo donde se necesita decidir si el contenido se ajusta a una categoria tematica (WorldSense).
- Filtrado previo en pipelines de generacion aumentada: usar el modelo como clasificador de admision que decida si un video, audio o combinacion merece pasar a un modelo mayor, reduciendo coste computacional.
- Investigacion en ajuste eficiente: sirve como referencia reproducible de hasta donde llega un LoRA r=32 sobre un modelo omni de 3B, con configuracion y scripts de evaluacion publicados en el repositorio jevtrainer.
- Analisis de actividad cotidiana en primera persona: clasificacion de secuencias de video largo con contexto diario (Daily-Omni), por ejemplo en estudios de usabilidad o registros de actividad.

## Benchmarks y rendimiento

Exactitud en porcentaje, segun la model card del autor.

| Modelo | WorldSense | OmniBench | Daily-Omni | AV-Odyssey | SpeakerBench |
|---|---:|---:|---:|---:|---:|
| Qwen2.5-Omni-3B (base) | 34,87 | 43,82 | 49,79 | 31,99 | 39,69 |
| JevTrainer Omni 3B | 37,05 | 49,43 | 54,05 | 36,60 | 43,69 |
| Diferencia (puntos) | +2,18 | +5,61 | +4,26 | +4,61 | +4,00 |

Metricas internas del holdout (1 610 ejemplos), segun la model card: exactitud 85,03 %, skill 79,54 %, ECE 0,0096.

## Requisitos de hardware

- El repositorio descargado ocupa 0,3 GB, pero la inferencia requiere ademas los pesos completos de Qwen2.5-Omni-3B, que no se incluyen.
- VRAM estimada para el modelo base en bf16: en torno a 6-8 GB solo para pesos, mas el coste de los codificadores de vision y audio y de las activaciones sobre entradas de video. Cifra estimada a partir del tamano del modelo; no confirmada en la informacion proporcionada.
- GPU consumer: un modelo de 3B en bf16 cabe con holgura en tarjetas de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090) y, con cuantizacion, en tarjetas de 8-10 GB. La viabilidad con video de resolucion alta o secuencias largas depende de la memoria del codificador y no esta documentada.
- GPU de centro de datos: A100, H100 o L40S son suficientes y permiten procesar lotes mayores para evaluacion o etiquetado masivo.
- Opciones de despliegue: el flujo documentado en la model card es el propio repositorio `jevtrainer` (instalacion con `pip install -e .`, descarga con `huggingface-cli` y evaluacion con `jt eval`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la presencia de un cabezal de decision personalizado complica su uso directo en esos servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Benchmarks (OmniBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JevTrainer Omni 3B | 3B + LoRA r=32 | Adaptador de decision multimodal | No disponible | 49,43 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen2.5-Omni-3B | 3B | Modelo omni generativo (thinker + talker) | 32 768 tokens segun documentacion del base | 43,82 | Apache 2.0 | HuggingFace |
| Qwen2.5-Omni-7B | 7B | Modelo omni generativo | 32 768 tokens segun documentacion del base | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |
| Qwen2.5-VL-3B | 3B | Modelo vision-lenguaje (sin audio) | No disponible en la informacion proporcionada | No aplica (no cubre audio) | Apache 2.0 | HuggingFace |

La unica comparacion con cifras verificables en la informacion proporcionada es contra el modelo base Qwen2.5-Omni-3B, sobre el que JevTrainer Omni 3B mejora en los cinco benchmarks reportados. Las filas de Qwen2.5-Omni-7B y Qwen2.5-VL-3B se incluyen como alternativas de categoria, pero sus resultados no estan disponibles en la informacion suministrada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: sin los pesos de Qwen/Qwen2.5-Omni-3B no se puede ejecutar. El repositorio de 0,3 GB no contiene el modelo completo.
- La salida es una etiqueta `marker`, no texto libre. No sirve como sustituto de un asistente conversacional ni de un modelo generativo generalista.
- No se carga la rama de salida de voz (talker): el modelo no puede generar habla pese a derivar de una familia omni.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado pipeline en HuggingFace. No hay evidencia de uso en produccion por terceros.
- Los resultados de benchmarks los reporta el propio autor del modelo; no consta una evaluacion independiente.
- El holdout interno es de 1 610 ejemplos y pertenece al mismo proceso de entrenamiento, por lo que la exactitud del 85,03 % no es directamente extrapolable a datos externos.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de Qwen2.5-Omni, hereda los sesgos del modelo base, no documentados en esta ficha.
- Riesgo de alucinacion: en un cabezal de decision el riesgo se manifiesta como falsos positivos o etiquetas `marker` incorrectas con alta confianza; el ECE reportado (0,0096) sugiere buena calibracion en el holdout interno, pero no hay datos de calibracion fuera de distribucion.
- Idiomas soportados: no disponibles. Si la tarea de decision depende de texto o habla en idiomas distintos del ingles, la cobertura es incierta.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva tras el ajuste LoRA; en tareas con video largo esto es un factor critico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los 79 datasets de entrenamiento, cuya composicion no se detalla.
- Caveat de produccion: no se documentan tasas de error por modalidad, latencia, throughput ni comportamiento con entradas mal formadas. Cualquier despliegue real exige una evaluacion propia con datos del dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weihongliang/jevtrainer-omni3b-2026-10-04
- Modelo base Qwen2.5-Omni-3B: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Repositorio de entrenamiento jevtrainer: https://github.com/hongliang-wei/jevtrainer
- Configuracion de entrenamiento citada: `configs/av/omni3b_v4.yaml` (dentro del repositorio jevtrainer)
- Configuracion de evaluacion citada: `configs/eval/av_omni.yaml` (dentro del repositorio jevtrainer)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los unicos enlaces recuperados corresponden a documentacion de NixOS y no guardan relacion con la ficha.

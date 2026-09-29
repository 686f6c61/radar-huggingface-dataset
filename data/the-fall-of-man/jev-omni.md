# the-fall-of-man/Jev-Omni

## Resumen

Jev-Omni es un clasificador multimodal de decisiones publicado por el usuario the-fall-of-man en HuggingFace. A diferencia de un modelo generativo, no produce explicaciones ni texto libre: recibe un estado (contexto), una pregunta y una lista de opciones, y devuelve una probabilidad calibrada para cada opción. Admite cuatro modalidades de entrada: texto, imagen, audio y vídeo.

El modelo parte de google/gemma-4-12B-it como base y ha sido sometido a un ajuste fino con 30.000 preguntas, segun la model card. Cuenta con 11.959.730.224 parametros (unos 11,96 B), se distribuye en formato safetensors y emplea la libreria transformers. Su interes actual radica en que propone una interfaz tipada de decision (preguntas de tipo si/no, eleccion y puntuacion) resueltas con probabilidades calibradas, un enfoque distinto al de los asistentes conversacionales convencionales.

La model card reporta resultados en DecisionBench Medium (87,57 % de accuracy), JevBench (86,15 %), MMAU (63,10 % de micro accuracy) y MVBench (53,10 %). El repositorio tiene 0 descargas y 0 likes, fue creado el 28 de septiembre de 2026 y su licencia es Apache-2.0. La longitud de contexto, los idiomas soportados y el detalle de la arquitectura interna no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal unificado de la familia Gemma 4 (etiqueta `gemma4_unified`); detalle interno no disponible |
| Parametros totales | 11.959.730.224 (~11,96 B) |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible (la prueba de velocidad usa ~2.000 tokens de texto) |
| Tipos de cuantizacion | no se documentan cuantizaciones (GGUF, AWQ, GPTQ); los pesos publicados son FP32 y la inferencia usa autocast BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 24,0 GB |
| Modelo base | google/gemma-4-12B-it |
| Pipeline declarado | text-classification |
| Modalidades de entrada | texto, imagen, audio (max. 30 s), video (16 fotogramas) |

## Arquitectura y entrenamiento

La informacion disponible indica que Jev-Omni se construye sobre google/gemma-4-12B-it, un modelo multimodal de la familia Gemma 4, y que se distribuye como modelo fusionado (tag `merged`). El pipeline declarado es de clasificacion de texto, con soporte de image-text-to-text, lo que encaja con un cabezal de clasificacion sobre representaciones multimodales. No se detallan el numero de capas, el mecanismo de atencion, la dimension oculta ni si se emplea alguna variante de atencion lineal o decodificacion especulativa.

En cuanto al entrenamiento, la model card menciona una ejecucion de ajuste fino con 30.000 preguntas, sin especificar la composicion del dataset, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta la estrategia de fusion de pesos. El unico dato de calibracion disponible es un ECE de 0,0400 en DecisionBench Medium (10 bins), lo que indica que las probabilidades emitidas estan razonablemente alineadas con la frecuencia observada de acierto.

## Capacidades

- Clasificacion de decisiones con opciones: recibe un estado mas una pregunta y devuelve una probabilidad por cada opcion, en lugar de texto generado.
- Tipos de pregunta soportados: noul (si/no), eleccion entre opciones y preguntas de puntuacion.
- Entrada multimodal: procesa texto, imagenes, audio de hasta 30 segundos y video de 16 fotogramas mediante el parametro `media` y `modality`.
- Probabilidades calibradas: ECE de 0,0400 en DecisionBench Medium, adecuado para umbrales de decision automatizados.
- Capacidad de opciones multiple: el cabezal acepta hasta 256 opciones, aunque la model card solo respalda calidad hasta 20 opciones.
- Sin generacion de explicaciones: el modelo no produce justificacion textual de la decision, solo la distribucion de probabilidad.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking, vision, audio o video: vision, audio y video si; modo thinking no documentado.

## Casos de uso

- Triaje de tickets de soporte: dado el historial de un caso (estado) y una pregunta como "¿requiere escalado a nivel 2?", el modelo devuelve la probabilidad de "si" y "no". Es adecuado porque evita generar texto y entrega directamente una puntuacion util para enrutado automatico.
- Moderacion de contenido con criterios explicitos: se formula el estado con el contenido y las opciones como categorias de politica, y se usa la probabilidad mas alta para decidir. La calibracion documentada permite fijar umbrales por encima de los cuales se deriva a revision humana.
- Verificacion de afirmaciones: con un contexto documental como estado y opciones del tipo "respaldada", "refutada" o "no concluyente", el clasificador actua como componente de un pipeline de fact-checking.
- Clasificacion de imagenes en pipelines de datos: la inferencia de imagen tarda 26 ms en H200, lo que permite etiquetar lotes grandes de imagenes con una pregunta y opciones predefinidas.
- Analisis de audio de atencion al cliente: con audio de hasta 30 segundos, se puede decidir entre opciones como "satisfaccion", "reclamacion" o "consulta", integrando la senal acustica sin transcripcion previa.
- Etiquetado de clips de video cortos: usando 16 fotogramas por clip, el modelo puede clasificar escenas o acciones con opciones cerradas; los 504 ms por peticion en H200 lo hacen viable para procesamiento por lotes.
- Anotacion asistida en investigacion: al devolver probabilidades por opcion, permite medir acuerdo entre anotadores y modelo, y priorizar los casos de mayor incertidumbre para revision manual.
- Decisiones multimodales combinadas: el mismo cabezal acepta texto, imagen, audio o video, lo que simplifica el despliegue cuando un sistema necesita un unico punto de decision sobre entradas heterogeneas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (modelo fusionado; la accuracy principal es la media de escenarios o grupos con el mismo peso):

| Benchmark | Accuracy | Micro accuracy |
|---|---:|---:|
| DecisionBench Medium (80 escenarios / 293 preguntas) | 87,57 % | 86,01 % |
| JevBench (195 grupos emparejados / 231 decisiones) | 86,15 % | 87,45 % |
| MMAU (1.000 preguntas) | — | 63,10 % |
| MVBench (14 tareas / 2.786 preguntas) | 53,10 % | 53,09 % |

Calibracion: ECE de 0,0400 en DecisionBench Medium (10 bins).

Latencia en H200 en caliente (medianas sobre 20 peticiones con backend optimizado, sin contar preprocesado ni red):

| Entrada | Latencia |
|---|---:|
| Texto (~2.000 tokens) | 83 ms |
| Imagen | 26 ms |
| Audio (13 s) | 31 ms |
| Video (16 fotogramas) | 504 ms |

No se han publicado otros resultados de benchmarks en la informacion disponible, ni cifras de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- GPU CUDA obligatoria segun la model card.
- Pesos en FP32: aproximadamente 50 GB antes del overhead del runtime, lo que exige aceleradores de 80 GB (H100, H200, A100 80 GB) para cargar el modelo sin cuantizar.
- Inferencia con autocast BF16, que reduce el coste de calculo respecto a FP32.
- Estimacion derivada (no confirmada por el autor): con pesos en BF16, los ~12 B de parametros ocuparian unos 24 GB, lo que situaria al modelo en el limite de una RTX 4090 de 24 GB o en una A100 de 40 GB. Esta cifra es una extrapolacion a partir del numero de parametros y de la nota sobre FP32, no un dato publicado.
- Descarga del repositorio: 24,0 GB.
- Opciones de despliegue: la model card solo documenta el cargador propio `jev_omni.load_jev_omni()` y la instalacion de `requirements.txt`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, por lo que su compatibilidad con esos motores es no disponible.
- Rendimiento medido en H200: 83 ms (texto), 26 ms (imagen), 31 ms (audio de 13 s) y 504 ms (video de 16 fotogramas). No se aportan cifras de throughput agregado.
- Dependencia adicional: ffmpeg es necesario para la entrada de audio.

## Comparativa con modelos similares

Datos tomados de la tabla comparativa de la propia model card. Las puntuaciones de referencia son las reportadas oficialmente por sus desarrolladores y pueden emplear protocolos de evaluacion distintos.

| Modelo | Parametros | MMAU | MVBench | Modalidades |
|---|---:|---:|---:|---|
| Jev-Omni | 12 B (denso) | 63,10 % | 53,10 % | Texto, imagen, audio, video |
| Inkling | 975 B totales / 41 B activos | 77,20 % | — | Texto, imagen, audio |
| Qwen3.5-397B-A17B | 397 B totales / 17 B activos | — | 77,60 % | Texto, imagen, video |

La diferencia principal es de escala: Jev-Omni es un modelo denso de 12 B que compite con alternativas MoE de cientos de miles de millones de parametros totales. No hay datos publicados en la informacion disponible sobre la licencia o el formato de pesos de Inkling y Qwen3.5-397B-A17B, ni comparativas frente a clasificadores especializados de tamano similar.

## Limitaciones y advertencias

- No es un modelo generativo: no produce explicaciones ni justificaciones de la decision; solo devuelve probabilidades sobre las opciones dadas.
- Limite funcional de opciones: el rendimiento solo esta respaldado hasta 20 opciones. El cabezal acepta 256, pero la calidad por encima de 20 no esta establecida.
- Restricciones de entrada multimodal: el audio esta limitado a 30 segundos y el video a 16 fotogramas por peticion, lo que puede perder informacion en contenido largo.
- Idiomas soportados no documentados: no hay lista de idiomas ni evaluacion multilingue, por lo que el rendimiento fuera del ingles es incierto.
- Cobertura de benchmarks limitada: los resultados se concentran en DecisionBench, JevBench, MMAU y MVBench. No hay MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o toxicidad.
- Riesgo de alucinacion: al no generar texto, el modo de fallo no es la invencion de contenido, sino la asignacion de alta probabilidad a una opcion incorrecta, especialmente en dominios fuera de la distribucion de entrenamiento.
- Calibracion dependiente del dominio: el ECE de 0,0400 se midio en DecisionBench Medium; no hay garantia de que se mantenga en otros dominios o idiomas.
- Requisito de GPU CUDA: no se documenta soporte para CPU ni para aceleradores no NVIDIA.
- Falta de validacion externa: el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (28 de septiembre de 2026), sin historial de uso ni auditoria independiente.
- Discrepancia de identificadores: el identificador de HuggingFace es `the-fall-of-man/Jev-Omni`, pero la model card usa rutas de `akhilaaa3/Jev-Omni` tanto en el ejemplo de `snapshot_download` como en la instalacion de `requirements.txt`. Conviene verificar cual es el repositorio vigente antes de integrarlo.
- Licencia: Apache-2.0, siguiendo la licencia de Gemma 4. La propia model card advierte que los derechos del dataset son independientes de la licencia del modelo.
- Relacion con terceros: el autor declara que Jev-Omni es un modelo independiente y no esta afiliado, respaldado ni derivado de TypeSafe AI ni de su modelo Jev, y que no se entreno con salidas de Jev.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-fall-of-man/Jev-Omni
- Repositorio alternativo citado en la model card: https://huggingface.co/akhilaaa3/Jev-Omni
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset DecisionBench: https://huggingface.co/datasets/akhilaaa3/decision-bench
- Inkling (comparativa): https://huggingface.co/thinkingmachines/Inkling
- Qwen3.5-397B-A17B (comparativa): https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Fichero de dependencias: https://huggingface.co/akhilaaa3/Jev-Omni/resolve/main/requirements.txt
- Resultados de busqueda web: no se encontraron enlaces relevantes al modelo; los resultados devueltos corresponden al articulo gramatical ingles "the" y a la plataforma de reservas TheFork, sin relacion con Jev-Omni.

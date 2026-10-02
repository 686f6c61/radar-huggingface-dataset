# zhuomingliu/MaLoW-Qwen3.5-0.8B

## Resumen

MaLoW-Qwen3.5-0.8B es un checkpoint de inferencia publicado por el usuario zhuomingliu (repositorio GitHub previsto: dragonlzm/MaLoW) asociado al trabajo "Memory as Weights: Internalizing Long-Term History for Streaming Videos". No es un modelo base autonomo: el repositorio contiene modulos de inferencia y un adaptador que debe cargarse sobre Qwen/Qwen3.5-0.8B, descargado por separado. El peso real del repositorio es de 115.515.448 parametros en safetensors (0,5 GB de repo), muy por debajo de los aproximadamente 800 millones del modelo base, lo que confirma que se trata de un adaptador y no de una copia completa del modelo.

El problema que aborda es la memoria a largo plazo en comprension de video en streaming: en lugar de mantener el historial en un contexto creciente o en un almacen externo, el trabajo propone internalizarlo en los propios pesos del modelo. El checkpoint esta etiquetado con las categorias `malow`, `memory-as-weights` y `adapter`, y su evaluacion requiere el codigo de MaLoW, cuya publicacion en GitHub esta pendiente segun la propia model card.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de los asistentes sobre video en directo (coste de contexto y latencia), aunque su madurez es muy temprana: cero descargas y cero likes en el momento de la consulta, licencia Apache-2.0 en los pesos y metadatos de inferencia, y resultados de referencia declarados por el autor que no constituyen una evaluacion independiente de esta exportacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Adaptador de memoria ("memory-as-weights") sobre el modelo base Qwen/Qwen3.5-0.8B; se evalua a traves del runtime MaLoW |
| Parametros totales | 115.515.448 (pesos safetensors del repositorio, solo el adaptador/modulos de inferencia; el modelo base se descarga aparte) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos y metadatos de inferencia); los modelos base y los recursos de benchmark conservan sus terminos originales |
| Formato de pesos | Safetensors (con metadatos JSON de configuracion de inferencia; requiere el runtime MaLoW) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del adaptador ni del modelo base. Lo que si se explicita es el enfoque: "Memory as Weights: Internalizing Long-Term History for Streaming Videos". Es decir, la memoria del historial de video se integra en los pesos del modelo en lugar de resolverse con una ventana de contexto ampliada o con recuperacion externa (RAG sobre memoria). El repositorio se describe como un checkpoint de inferencia con modulos, no como un modelo base completo, y su evaluacion exige cargarlo a traves del runtime MaLoW con la configuracion registrada en los metadatos JSON.

No se han facilitado datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se describe si el adaptador congela el modelo base, que modulos anade ni como se actualiza la memoria durante el streaming. El codigo de MaLoW se indica como preparado localmente, con publicacion publica en GitHub pendiente, por lo que la reproducibilidad completa no esta garantizada en el momento de redactar esta ficha.

## Capacidades

- Comprension de video en streaming con memoria de historial a largo plazo, segun el objetivo declarado del trabajo.
- Razonamiento temporal sobre eventos pasados, presentes y futuros: la evaluacion en OVO-Bench se desglosa en las categorias backward, real-time y forward.
- Respuesta en tiempo real dentro de una secuencia de video (metrica "Real-time" en ambos benchmarks).
- Capacidades multimodales de tipo omni, proactivas y de cuestiones de streaming, medidas mediante las categorias Omni, Proactive y SQA de StreamingBench.
- Generacion de texto y razonamiento general: heredadas del modelo base Qwen/Qwen3.5-0.8B, sin cuantificar en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el planteamiento de memoria persistente es compatible con escenarios agenciales, pero no se documenta.
- Capacidades multilingues: no disponible.
- Capacidad especial: internalizacion del historial en pesos ("memory-as-weights") como alternativa a la ventana de contexto.

## Casos de uso

- Vigilancia y analisis de video en directo: el modelo esta disenado para mantener el hilo de lo ocurrido minutos u horas antes dentro de los pesos, lo que permite responder a preguntas del tipo "que paso antes de esta escena" sin reenviar todo el historial en cada turno.
- Asistentes sobre retransmisiones deportivas o eventos en vivo: seguir la narracion y el estado del partido de forma continua, cubriendo consultas sobre jugadas anteriores (categoria backward de OVO-Bench) y sobre lo que esta ocurriendo en el instante (real-time).
- Robots y agentes embebidos con percepcion continua: al ser un adaptador de 115 millones de parametros sobre una base de 0,8B, el coste de despliegue es bajo, lo que resulta adecuado para dispositivos con presupuesto de computo limitado que necesitan memoria persistente del entorno.
- Moderacion de contenido en plataformas de streaming: detectar y recordar incidentes previos dentro de una misma emision para aplicar reglas de forma coherente a lo largo de la sesion.
- Analitica de accesibilidad y resumen incremental: generar resumentes que evolucionan con el video en lugar de reprocesar la grabacion completa, apoyandose en las metricas de resumen y preguntas de streaming (SQA).
- Investigacion en memoria de largo plazo para modelos multimodales: el checkpoint sirve como referencia reproducible para comparar estrategias de memoria en pesos frente a contextos extendidos o recuperacion externa.
- Despliegue en produccion: no se recomienda todavia, dado que la evaluacion exige el runtime MaLoW cuyo codigo no es publico, no hay datos de latencia ni throughput, y el modelo acumula cero descargas.

## Benchmarks y rendimiento

Los siguientes resultados son los "reported reference results" de la model card del autor, y segun la propia nota no corresponden a una evaluacion nueva de esta exportacion concreta. Se expresan en porcentaje.

| Benchmark | Categoria | Resultado |
|---|---|---|
| OVO-Bench | Backward | 54,7 |
| OVO-Bench | Real-time | 67,7 |
| OVO-Bench | Forward | 48,65 |
| OVO-Bench | Average | 57,0 |
| StreamingBench | Average | 63,02 |
| StreamingBench | Real-time | 76,68 |
| StreamingBench | Omni | 48,86 |
| StreamingBench | Proactive | 26 |
| StreamingBench | SQA | 48,4 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto general.

## Requisitos de hardware

Las cifras de VRAM son estimaciones a partir del numero de parametros declarado, no datos publicados por el autor.

| Componente | Precision | VRAM estimada de pesos |
|---|---|---|
| Adaptador MaLoW (115,5 M) | FP16 / BF16 | ~0,23 GB |
| Adaptador MaLoW (115,5 M) | INT8 | ~0,12 GB |
| Modelo base Qwen3.5-0.8B | FP16 / BF16 | ~1,6 GB |
| Modelo base Qwen3.5-0.8B | INT4 | ~0,5 GB |

- Conjunto completo en FP16: en torno a 1,8-2 GB de pesos, mas cache de activaciones y de estado de memoria, cuyo tamano no se documenta y que en procesamiento de video puede dominar el consumo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En 4-6 GB el margen dependera del coste de la memoria de video, no cuantificado.
- GPU de datacenter: A100, H100 o L40S son suficientes en terminos de peso, pero no se han publicado mediciones especificas de latencia ni de throughput para este checkpoint.
- Opciones de despliegue: el autor indica que la evaluacion requiere el runtime MaLoW, no publicado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Se incluye unicamente la relacion con el modelo base.

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaLoW-Qwen3.5-0.8B (zhuomingliu) | Adaptador de memoria sobre Qwen3.5-0.8B | 115,5 M (adaptador) | No disponible | Apache-2.0 | HuggingFace, requiere runtime MaLoW no publicado |
| Qwen/Qwen3.5-0.8B | Modelo base multimodal sobre el que se aplica el adaptador | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras propuestas de memoria para video en streaming | Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Reproducibilidad bloqueada: la evaluacion requiere el codigo de MaLoW, que segun la model card esta preparado en local pero pendiente de publicacion publica en GitHub.
- No es un modelo autonomo: sin el modelo base Qwen/Qwen3.5-0.8B y sin el runtime MaLoW, el repositorio no es utilizable.
- Resultados no verificados: las cifras de OVO-Bench y StreamingBench son "reported reference results" y no una evaluacion nueva de esta exportacion, tal como advierte el propio autor.
- Rendimiento debil en tareas proactivas: 26 en la categoria Proactive de StreamingBench, muy por debajo del resto de categorias del mismo benchmark.
- Rendimiento desigual en razonamiento temporal: OVO-Bench forward (48,65) y backward (54,7) quedan claramente por debajo de real-time (67,7), lo que sugiere dificultades con el razonamiento sobre eventos no presentes.
- Riesgo de alucinacion: no cuantificado; un adaptador pequeno sobre una base de 0,8B tiene un margen limitado para corregir errores factuales del modelo base.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin senales de uso en produccion ni incidencias reportadas.
- Licencia: los pesos y metadatos se distribuyen bajo Apache-2.0, lo que permite uso comercial, pero los modelos base y los recursos de benchmark conservan sus terminos originales, que deben respetarse por separado.
- Los resultados de la busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo y han sido descartados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio GitHub previsto (pendiente de publicacion): https://github.com/dragonlzm/MaLoW
- Paper "Memory as Weights: Internalizing Long-Term History for Streaming Videos": no disponible
- Documentacion de evaluacion (`docs/video_evaluation.md`): no disponible publicamente, incluida en la futura release de codigo de MaLoW
- Demos: no disponible
- Otros enlaces relevantes: no disponible

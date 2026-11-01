# Xander8888/Hy-Memory-30B-A3B-GGUF

## Resumen

Hy-Memory-30B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Tencent Hunyuan, orientado especificamente a tareas de memoria conversacional de largo plazo. Con 30.064 millones de parametros totales y aproximadamente 3.000 millones activos por token (de ahi el sufijo A3B), emplea una arquitectura dispersa que permite mantener un coste de inferencia propio de un modelo de 3B mientras conserva la capacidad de representacion de uno de 30B. El modelo se distribuye bajo licencia Apache 2.0 y soporta ingles y chino.

Este repositorio concreto, publicado por el usuario Xander8888, contiene unicamente cuantizaciones GGUF del modelo base `tencent/Hy-Memory-30B-A3B`, pensadas para inferencia local con llama.cpp. La receta de cuantizacion aplica calibracion mediante imatrix y una asignacion de precision mixta consciente de la estructura MoE: los expertos enrutados (que concentran la mayor parte de los parametros) se comprimen de forma agresiva, mientras que los expertos compartidos, las proyecciones de atencion y las capas de embedding y salida mantienen Q8_0. Segun la model card, la variante de aproximadamente 8 GB queda a unos 1,5 puntos del mejor resultado Q6_K en la evaluacion Mem0 LoCoMo, lo que hace viable su despliegue en hardware de consumo.

La relevancia del modelo reside en su enfoque especifico sobre memoria persistente en dialogos multi-turno, un area donde los LLM generalistas degradan rapidamente al crecer el contexto. El informe tecnico asociado (arXiv:2610.22196) y la receta de cuantizacion publicada lo convierten en una opcion interesante para evaluar pipelines de agentes con memoria a largo plazo en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer; detalles completos no disponibles |
| Parametros totales | 30.064.725.888 (30,06B) |
| Parametros activos | ~3B (sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M, Q4_K_M, Q6_K, Q8_0, Q8_0-expsIQ1_M, Q8_0-expsIQ2_XXS (con imatrix salvo Q8_0) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |
| Tamano del repo | 106,6 GB (incluye las seis variantes GGUF) |
| Libreria declarada | transformers (tags: gguf, llama.cpp) |
| Modelo base | tencent/Hy-Memory-30B-A3B |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE): un router selecciona un subconjunto de expertos enrutados por token, mientras que un conjunto de expertos compartidos procesa todos los tokens. Esta estructura explica la relacion entre los 30,06B de parametros totales y los aproximadamente 3B activos por token, lo que reduce el coste computacional por paso de decodificacion. El nombre "Hy-Memory" y la evaluacion con Mem0 sobre LoCoMo indican que el entrenamiento y la evaluacion estan orientados a tareas de memoria conversacional y recuperacion de informacion en dialogos largos.

No se dispone en la informacion proporcionada de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre el uso de RLHF, DPO u otras tecnicas de alineacion. El informe tecnico referenciado (arXiv:2610.22196) es la fuente indicada para esos detalles. La innovacion documentada en este repositorio es la receta de cuantizacion: calibracion con importance matrix para controlar el error de cuantizacion y asignacion de precision mixta por tipo de tensor (expertos enrutados en IQ1_M o IQ2_XXS, resto en Q8_0, tensores pequenos en F32), sin modificar el numero de expertos ni la estructura de routing. Los archivos mixtos contienen 141 tensores de expertos enrutados en el tipo IQ correspondiente, 338 tensores matriciales en Q8_0 y 287 tensores en F32.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis declarado en memoria de largo plazo.
- Razonamiento y respuesta en ingles y chino.
- Evaluado con el framework Mem0 sobre el benchmark LoCoMo, orientado a memoria conversacional.
- Soporte de modo "no-think" verificado por el autor de las cuantizaciones (generacion directa sin cadena de razonamiento explicita).
- Compatibilidad con llama.cpp y con endpoints compatibles (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; el pipeline declarado es text-generation.

## Casos de uso

- Asistentes con memoria persistente: el modelo esta disenado y evaluado sobre LoCoMo/Mem0, de modo que puede construir y consultar un banco de memoria de conversaciones previas y recuperar hechos relevantes en interacciones posteriores, algo critico en asistentes personales desplegados durante semanas.
- Despliegue local en estaciones de trabajo: la variante `Q8_0-expsIQ1_M` (~8,03 GB) permite ejecutar un modelo de 30B totales en GPU de consumo con 12-16 GB de VRAM, manteniendo un 57,25% en LoCoMo frente al 58,78% del Q6_K.
- Chatbot de soporte tecnico con historial de cliente: la combinacion de contexto conversacional y memoria permite mantener el hilo de incidencias abiertas entre sesiones sin reinyectar todo el historial en cada peticion.
- Procesamiento de documentacion en ingles y chino: util para equipos con documentacion bilingue que necesiten resumen, extraccion o Q&A sobre corpus en ambos idiomas.
- Prototipado de agentes con llama.cpp: al ser GGUF compatible con llama.cpp y endpoints compatibles, sirve para validar pipelines de agentes en local antes de escalar a infraestructura mayor.
- Investigacion sobre cuantizacion MoE: el repositorio publica seis variantes con receta documentada y resultados de evaluacion, lo que permite reproducir el estudio de degradacion por precision en modelos MoE.
- Evaluacion de memoria a largo plazo en entornos con presupuesto: investigadores que necesiten correr LoCoMo sin acceso a GPUs de datacenter pueden usar las variantes Q3_K_M (14,45 GB) o Q4_K_M (18,24 GB) en una unica RTX 4090 o A6000.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible corresponden a la evaluacion Mem0 sobre LoCoMo (configuracion fija, 20% del dataset, 262 preguntas, una sola ejecucion por variante):

| Cuantizacion | Tamano | LoCoMo Judge |
|---|---:|---:|
| Q6_K imatrix | 24,71 GB | 58,78% (154/262) |
| Q8_0 | 31,99 GB | 57,63% (151/262) |
| Q3_K_M imatrix | 14,45 GB | 57,25% (150/262) |
| Q8_0-expsIQ1_M imatrix | 8,03 GB | 57,25% (150/262) |
| Q4_K_M imatrix | 18,24 GB | 56,49% (148/262) |
| Q8_0-expsIQ2_XXS imatrix | 9,14 GB | 55,73% (146/262) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar, ni comparaciones con modelos de la competencia. El autor advierte que son puntuaciones de una sola ejecucion y que las variantes de menor precision no garantizan superar a las de mayor precision.

## Requisitos de hardware

- VRAM estimada de inferencia: el peso de los ficheros va de 8,03 GB (expsIQ1_M) a 31,99 GB (Q8_0); a esa cifra hay que sumar la cache KV y el overhead del framework, por lo que la VRAM real es superior al tamano de descarga.
- GPU de consumo: la variante de ~8 GB cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y en 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super) con margen para cache KV en contextos moderados. La Q3_K_M (14,45 GB) encaja en 16 GB con contexto limitado; la Q4_K_M (18,24 GB) requiere 24 GB (RTX 3090, RTX 4090).
- GPU de datacenter: Q6_K (24,71 GB) y Q8_0 (31,99 GB) requieren A100 40 GB, H100 80 GB o varias GPUs. Una A100 80 GB puede alojar Q8_0 con contexto amplio.
- Opciones de despliegue: llama.cpp es el runtime de referencia de este repositorio; tambien es compatible con servidores con endpoints compatibles con la API de OpenAI. vLLM, TGI y Ollama no estan confirmados en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B activos, el coste por token se aproxima al de un modelo denso de ese tamano, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos comparables de la misma categoria (MoE de ~30B totales con ~3B activos orientados a memoria conversacional). La siguiente tabla recoge unicamente los datos verificables de este modelo frente a sus propias variantes de cuantizacion, ya que no hay cifras de terceros disponibles.

| Modelo | Parametros totales | Activos | Contexto | LoCoMo | Licencia | Formato |
|---|---|---|---|---|---|---|
| Hy-Memory-30B-A3B (Q6_K) | 30,06B | ~3B | no disponible | 58,78% | Apache 2.0 | GGUF |
| Hy-Memory-30B-A3B (Q8_0-expsIQ1_M) | 30,06B | ~3B | no disponible | 57,25% | Apache 2.0 | GGUF |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo ingles y chino declarados; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto: no documentada en la informacion disponible; no se puede garantizar el comportamiento en ventanas largas sin consultar el informe tecnico.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni sobre el comportamiento en dominios factuales; en tareas de memoria conviene validar la recuperacion contra el banco de memoria real.
- Cuantizacion de muy baja precision: el propio autor advierte que algunos GGUF comunitarios de 1-2 bits cargan correctamente pero fallan al escribir memoria (texto corrupto, repeticiones infinitas, JSON roto). Un arranque exitoso del servidor no es evidencia suficiente de calidad.
- Resultados de una sola ejecucion: las cifras de LoCoMo no son medias de multiples semillas y no garantizan monotonia entre niveles de precision.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los pesos derivados deben conservar los avisos de atribucion correspondientes.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; es una publicacion de terceros, no el repositorio oficial de Tencent. Para produccion conviene contrastar con el repositorio oficial `tencent/Hy-Memory-30B-A3B-GGUF`.
- Uso en produccion: al ser un modelo especializado en memoria conversacional, no esta claro su rendimiento en tareas de codigo, matematicas o razonamiento general; no se han publicado benchmarks al respecto.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Xander8888/Hy-Memory-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- Repositorio GGUF oficial de Tencent: https://huggingface.co/tencent/Hy-Memory-30B-A3B-GGUF
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-Memory
- Informe tecnico: https://arxiv.org/pdf/2610.22196
- llama.cpp: https://github.com/ggml-org/llama.cpp

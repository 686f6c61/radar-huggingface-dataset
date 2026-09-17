# symdroid/Mistral-Large-3-675B-Instruct-2512-EXL3-K2

## Resumen

Este repositorio contiene una cuantizacion comunitaria del modelo Mistral Large 3 675B Instruct 2512 de Mistral AI, publicada por el usuario symdroid bajo el identificador symdroid/Mistral-Large-3-675B-Instruct-2512-EXL3-K2. Se trata de un checkpoint de tipo EXL3 K2 con expertos enrutados en EXL3 y componentes mixtos en FP8/BF16, pensado para inferencia local con un consumo de memoria reducido respecto al modelo original. El checkpoint ocupa aproximadamente 174 GB, frente a los varios cientos de gigabytes que requeriria el modelo sin cuantizar.

El modelo base es un MoE disperso de 675B parametros totales y aproximadamente 41B parametros activos por token, lo que lo situa en la categoria de modelos de gran escala con coste de computo por token relativamente contenido. La cuantizacion fue desarrollada y validada sobre 2 unidades NVIDIA DGX Spark con 256 GB de memoria unificada combinada, empleando ExLlamaV3 y el runtime denominado SymDroid Flash K2. El autor reporta velocidades de decodificacion de aproximadamente 4,9 tok/s en ejecucion directa y de 3,9 a 4,0 tok/s a traves de una API compatible con OpenAI.

Su relevancia actual esta en que permite ejecutar un modelo de 675B parametros en hardware de gama alta con memoria unificada, sin recurrir a un cluster multinodo, manteniendo el soporte nativo de tool calling de Mistral. La ficha se limita a los datos publicados en la model card; no hay informacion sobre el dataset de entrenamiento, la longitud de contexto ni resultados de benchmarks, y los resultados de busqueda web obtenidos no guardan relacion con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (sparse MoE) de tipo mistral3, con expertos enrutados |
| Parametros totales | 675B |
| Parametros activos | ~41B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K2 (expertos enrutados en EXL3 con componentes mixtos FP8/BF16) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | EXL3 (ExLlamaV3); no se indica disponibilidad en safetensors ni GGUF |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tamano del checkpoint | ~174 GB |
| Modelo base | mistralai/Mistral-Large-3-675B-Instruct-2512 |
| Runtime validado | ExLlamaV3 + SymDroid Flash K2, API compatible con OpenAI |
| Hardware de validacion | 2x NVIDIA DGX Spark (256 GB de memoria unificada combinada) |
| Velocidad de decodificacion | ~4,9 tok/s en runtime directo; ~3,9-4,0 tok/s via API compatible con OpenAI |
| Tool calling | Nativo de Mistral, validado de extremo a extremo por el autor |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |
| Flag de inferencia en la model card | inference: false |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con mezcla de expertos (MoE) dispersa: 675B parametros totales de los cuales se activan aproximadamente 41B por token. Esta relacion de activacion (en torno al 6 % de los parametros) es lo que permite que un modelo de ese tamano sea desplegable en un nodo con memoria unificada, ya que el coste de computo por token queda muy por debajo del de un modelo denso equivalente. No se dispone de informacion sobre el numero de expertos, la estrategia de enrutamiento, el numero de capas ni la dimension del modelo.

Respecto al entrenamiento, la model card del checkpoint no aporta datos sobre volumen de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas del modelo base. La unica informacion tecnica propia de esta publicacion es el proceso de cuantizacion: los expertos enrutados se almacenan en formato EXL3 K2 y el resto de componentes se mantiene en una mezcla de FP8 y BF16, una decision que preserva en mayor medida la precision de las capas no expertas. El pipeline SymDroid Flash K2 y ExLlamaV3 son el runtime con el que el autor valido el checkpoint sobre 2x DGX Spark.

## Capacidades

- Generacion de texto instruccional en once idiomas declarados: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Tool calling nativo de Mistral, validado de extremo a extremo segun la model card, lo que habilita integracion con APIs externas y flujos de function calling.
- Ejecucion local en un nodo con memoria unificada de 256 GB, sin necesidad de cluster multinodo, con el runtime ExLlamaV3.
- Servicio mediante API compatible con OpenAI, lo que permite reutilizar clientes y SDK existentes sin cambios de codigo.
- Capacidades propias del modelo base (razonamiento, codigo, matematicas, agentes multi-paso) no estan verificadas de forma especifica en esta model card; se asumen heredadas del modelo base, pero no hay datos publicados que las cuantifiquen.
- No se declara soporte de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion proporcionada.
- Compatibilidad con cuantizacion de bajo rango: el checkpoint es en si mismo una cuantizacion, no un modelo recien entrenado.

## Casos de uso

- Inferencia local en estacion de trabajo de gama alta: con 2x DGX Spark y 256 GB de memoria unificada se puede servir el modelo completo sin recurrir a la nube, algo util para equipos con requisitos de soberania de datos o entornos sin conectividad externa.
- Agentes con tool calling: dado que el autor valida el tool calling nativo de Mistral de extremo a extremo, el modelo puede orquestar llamadas a APIs, consultas a bases de datos y ejecucion de funciones dentro de un bucle de agente multi-paso servido por la API compatible con OpenAI.
- Atencion al cliente multilingue: los once idiomas declarados permiten cubrir conversaciones en espanol, frances, aleman, italiano, portugues, neerlandes y arabe con un unico despliegue, evitando mantener modelos separados por idioma.
- Asistencia de codigo en entorno aislado: el modelo puede integrarse en un servidor interno compatible con OpenAI y usarse desde plugins de editor, sin que el codigo fuente salga de la infraestructura de la organizacion.
- Procesamiento por lotes de documentacion tecnica: la ventana de contexto no esta documentada, por lo que el uso en lotes deberia dimensionarse con pruebas previas; el modelo es adecuado para resumen, extraccion y clasificacion de documentos largos siempre que se valide el limite real de contexto.
- Investigacion sobre cuantizacion: el checkpoint sirve como caso de estudio reproducible de una cuantizacion EXL3 K2 sobre un MoE de 675B, con velocidades medidas y hardware de referencia declarado.
- Evaluacion comparativa de calidad post-cuantizacion: permite medir la degradacion frente al modelo base en tareas concretas del dominio propio, dado que no existen benchmarks publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion de calidad. Los unicos datos de rendimiento publicados son de velocidad de inferencia, que se recogen en la tabla siguiente:

| Metrica | Valor reportado |
|---|---|
| Decodificacion en runtime directo | ~4,9 tok/s |
| Decodificacion via API compatible con OpenAI | ~3,9-4,0 tok/s |
| Hardware de medida | 2x NVIDIA DGX Spark, 256 GB de memoria unificada combinada |
| Runtime | ExLlamaV3 + SymDroid Flash K2 |
| Tamano del checkpoint | ~174 GB |

No se dispone de datos de longitud de prefill, throughput con batching, latencia por token bajo concurrencia ni consumo energetico.

## Requisitos de hardware

- VRAM / memoria para pesos: aproximadamente 174 GB solo para el checkpoint. Hay que sumar la cache KV y el overhead del runtime, por lo que el requisito real de memoria es superior a esa cifra.
- Hardware validado por el autor: 2x NVIDIA DGX Spark con 256 GB de memoria unificada combinada. Es la unica configuracion con datos de velocidad publicados.
- GPU de centro de datos: no se aportan medidas sobre A100, H100 ni similares en la informacion disponible. Cualquier configuracion necesitaria al menos 174 GB de memoria agregada solo para los pesos, lo que implica varias GPU de 80 GB trabajando en conjunto.
- GPU de consumo: no viable en una unica GPU de consumo. Una RTX 4090 con 24 GB no puede alojar el checkpoint ni siquiera con offloading parcial razonable, dado que los 174 GB de pesos exceden ampliamente su memoria.
- Opciones de despliegue: ExLlamaV3 es el runtime validado, con un servidor de API compatible con OpenAI. No se confirma soporte de vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM para este checkpoint, y el formato EXL3 no es directamente compatible con varios de ellos.
- Latencia y throughput: aproximadamente 4,9 tok/s en decodificacion directa y 3,9-4,0 tok/s a traves de la API. No hay datos de throughput con multiples peticiones simultaneas.
- Consideracion de memoria: al tratarse de un MoE con unos 41B parametros activos, el cuello de botella en este despliegue es la capacidad de memoria, no la potencia de computo bruta.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| symdroid/Mistral-Large-3-675B-Instruct-2512-EXL3-K2 (este checkpoint) | 675B | ~41B | no disponible | apache-2.0 | EXL3 | Publicado en HuggingFace, 0 descargas |
| mistralai/Mistral-Large-3-675B-Instruct-2512 (modelo base) | 675B | ~41B | no disponible | no disponible en la informacion proporcionada | no disponible | Referenciado como base_model en la model card |
| Otras cuantizaciones del mismo modelo base | no disponible | ~41B | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos objetivos (benchmarks, contexto, consumo) de alternativas como DeepSeek-V3, Qwen u otros MoE de escala comparable, por lo que no se incluye una comparacion cuantitativa con ellos. La unica comparacion posible con datos verificables es contra el modelo base sin cuantizar, del que no se detallan especificaciones en esta model card.

## Limitaciones y advertencias

- Ausencia total de benchmarks: el autor no publica ninguna evaluacion de calidad, por lo que no se puede cuantificar la degradacion introducida por la cuantizacion EXL3 K2 frente al modelo base.
- Licencia: el checkpoint declara apache-2.0, pero conviene verificar las condiciones de la licencia del modelo base mistralai/Mistral-Large-3-675B-Instruct-2512 antes de un uso comercial, ya que las condiciones del modelo original pueden imponer restricciones adicionales.
- Contexto desconocido: no se documenta la longitud de contexto soportada por el checkpoint ni por el modelo base en la informacion disponible, lo que impide planificar cargas con documentos largos sin pruebas previas.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y actualizacion practicamente inmediata a la creacion. No hay validacion independiente por terceros de las cifras de velocidad ni del correcto funcionamiento del checkpoint.
- Flag inference: false en la model card, lo que sugiere que el propio autor no lo marca como listo para el pipeline de inferencia estandar de HuggingFace; requiere ExLlamaV3.
- Velocidad muy baja para uso interactivo: entre 3,9 y 4,9 tok/s limita el uso a tareas por lotes o asincronas; una conversacion en tiempo real resultaria lenta para el usuario.
- Formato poco portable: EXL3 no es compatible con gran parte del ecosistema (llama.cpp, Ollama, vLLM), lo que restringe las opciones de despliegue al runtime ExLlamaV3.
- Idiomas: la lista de idiomas declarados es amplia, pero no se aportan evaluaciones por idioma; el rendimiento en lenguas distintas del ingles no esta verificado en esta publicacion.
- Riesgo de alucinacion: no hay informacion especifica para este checkpoint ni para su modelo base en la documentacion facilitada; aplica el riesgo habitual de los modelos generativos de gran escala.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion disponible.
- Requisito de hardware poco convencional: el unico hardware validado (2x DGX Spark) no es una configuracion habitual en centros de datos tradicionales, lo que dificulta reproducir las cifras publicadas.
- Fecha de creacion en 2026: el repositorio esta fechado en septiembre de 2026 y no presenta historial de mantenimiento posterior.

## Enlaces

- Repositorio del checkpoint en HuggingFace: https://huggingface.co/symdroid/Mistral-Large-3-675B-Instruct-2512-EXL3-K2
- Modelo base referenciado: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512

Nota: los resultados de busqueda web disponibles no guardan relacion con el modelo ni con su dominio tecnico, por lo que no se han incluido. No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demostraciones adicionales.

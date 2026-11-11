# stneric/simplixity-router-2b-GGUF

## Resumen

Simplixity-router-2b-GGUF es la version cuantizada en formato GGUF de simplixity-router-2b, un ajuste fino del modelo Qwen3.5-2B desarrollado por stneric. Su funcion no es la generacion de texto libre, sino actuar como enrutador (router) dentro de la aplicacion Simplixity: para cada consulta del usuario, en ingles o aleman, decide si es necesario buscar informacion en la web, con que consultas, cuanta investigacion hace falta, la forma que debe tener la respuesta, la antiguedad minima de las fuentes y que fuentes utilizar.

El modelo cuenta con 1.942.653.248 parametros (aproximadamente 1,9 mil millones) y se distribuye en un unico archivo Q4_K_M de 1,3 GB, generado con el script `convert_hf_to_gguf.py` de llama.cpp y cuantizado con `llama-quantize` a partir de pesos bf16. La model card reporta una precision de ruta del 96% con una latencia mediana de 0,53 s en Ollama sobre una RTX 3070 Ti, frente al 38% del Qwen3.5-2B sin ajustar y al 99% de Claude Haiku 5.5 con thinking, que actua como modelo profesor.

Su relevancia practica reside en que permite ejecutar localmente la capa de decision de un sistema de busqueda aumentada con un coste computacional minimo y una licencia permisiva (Apache 2.0), sin depender de APIs externas para el enrutamiento. Es, por tanto, una pieza de infraestructura para pipelines RAG y agentes, no un modelo conversacional de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ajuste fino de Qwen3.5-2B); no se detalla la variante exacta |
| Parametros totales | 1.942.653.248 (aproximadamente 1,9 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la model card; la configuracion de Ollama de referencia usa `num_ctx 8192` |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo `simplixity-router-2b-v1-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer denso de aproximadamente 1,9 mil millones de parametros, y se ha ajustado fino para una tarea de clasificacion estructurada: emitir una decision de enrutamiento con varios campos (buscar o no, consultas de busqueda, nivel de complejidad, forma de la respuesta, recencia de las fuentes y seleccion de fuentes). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que Claude Haiku 5.5 con thinking actuo como modelo profesor, lo que sugiere una destilacion de las decisiones de enrutamiento del modelo grande hacia el pequeno.

La innovacion principal no es arquitectonica sino operativa: se demuestra que un modelo de 2B puede aproximarse al comportamiento de enrutamiento de un modelo frontera (96% frente a 99% de precision de ruta) con una latencia mucho menor (0,53 s frente a 3,0 s) y ejecutandose en hardware de consumo. La conversion a GGUF se realizo con las herramientas estandar de llama.cpp y la cuantizacion Q4_K_M reduce el peso a 1,3 GB manteniendo el rendimiento reportado. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Clasificacion y enrutamiento de consultas: decide si una pregunta requiere busqueda web, con que consultas y con que nivel de profundidad.
- Planificacion de la respuesta: determina la forma que debe tener la respuesta y la recencia minima exigida a las fuentes.
- Seleccion de fuentes: elige que fuentes consultar para cada pregunta.
- Soporte bilingue limitado a ingles y aleman.
- Integracion como componente de un pipeline mayor (Simplixity) mediante Ollama, con renderer y parser `qwen3.5`.
- No esta disenado para generar texto libre, titulos de conversacion ni respuestas finales al usuario; la model card advierte explicitamente que no escribe titulos y recomienda un modelo aparte para esa funcion.
- No se documenta soporte de tool calling generico, agentes multi-paso ni modos de razonamiento extendido mas alla de la propia decision de enrutamiento.

## Casos de uso

- Enrutamiento en pipelines RAG: el modelo recibe la pregunta del usuario y el historial de chat, y devuelve si hay que buscar, que consultas lanzar y cuantas fuentes consultar. Es adecuado porque su tarea esta acotada y su latencia (0,53 s medianos) es compatible con un flujo interactivo.
- Despliegue local de asistentes con busqueda web: al caber en 1,3 GB en Q4_K_M, puede ejecutarse en una estacion de trabajo con GPU de consumo y evitar enviar las consultas de enrutamiento a una API externa, lo que reduce coste y exposicion de datos.
- Control de costes en sistemas con modelos grandes: usar el router para decidir cuando merece la pena invocar un modelo de busqueda o un modelo mayor evita llamadas innecesarias; la comparacion de la model card (96% de precision frente al 38% del base sin ajustar) justifica sustituir heuristicas o el modelo sin ajustar.
- Asistentes bilingues ingles-aleman: equipos que atienden a usuarios en ambos idiomas pueden usar un unico router entrenado especificamente para esas dos lenguas, con 52 y 53 preguntas de evaluacion respectivamente en el conjunto de prueba del autor.
- Investigacion sobre destilacion de decisiones: el modelo sirve como caso de estudio de como destilar el comportamiento de enrutamiento de un modelo frontera (Claude Haiku 5.5 con thinking) en un modelo de 2B con licencia Apache 2.0.
- Prototipado de agentes de investigacion: para experimentar con flujos de busqueda multi-consulta y seleccion de fuentes sin incurrir en costes de API durante el desarrollo, usando Ollama como runtime local.
- Evaluacion de calidad de respuestas con fuentes: al fijar la recencia minima y las fuentes permitidas, el router permite construir pipelines que citan informacion reciente de forma controlada.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card, medidos en Ollama 0.40 sobre una RTX 3070 Ti con 105 preguntas etiquetadas a mano (52 en ingles, 53 en aleman). "Ruta correcta" significa que acierta simultaneamente la decision de buscar o no, la complejidad y la forma de la respuesta.

| Modelo | Ruta correcta | Latencia mediana |
|---|---|---|
| simplixity-router-2b-v1 Q4_K_M | 96% | 0,53 s |
| Qwen3.5-2B Q4_K_M sin ajustar | 38% | 1,24 s |
| Claude Haiku 5.5 con thinking (profesor) | 99% | 3,0 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para el archivo Q4_K_M mas el espacio de contexto; con `num_ctx 8192` el consumo total se mantiene en el rango de 2 a 3 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; la medicion oficial se realizo en una RTX 3070 Ti.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 3070 Ti, RTX 4060 o superiores; tambien es viable en CPU, aunque la latencia aumentaria respecto a los 0,53 s reportados.
- Opciones de despliegue: Ollama (metodo documentado por el autor, con `RENDERER qwen3.5`, `PARSER qwen3.5` y `num_ctx 8192`); al ser GGUF, es compatible con llama.cpp y otros runtimes que lean este formato, aunque no se documentan configuraciones especificas para vLLM o TGI.
- Latencia y throughput: latencia mediana de 0,53 s por decision de enrutamiento en RTX 3070 Ti con Ollama 0.40; no se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en enrutamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| simplixity-router-2b-GGUF | 1,9B | no disponible (config. de referencia 8192) | 96% ruta correcta, 0,53 s | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-2B sin ajustar | 2B (aproximado) | no disponible | 38% ruta correcta, 1,24 s | no disponible en la informacion | Modelo base de Qwen |
| Claude Haiku 5.5 con thinking | no disponible | no disponible | 99% ruta correcta, 3,0 s | propietaria | API de Anthropic |

No se dispone de informacion sobre otros routers especializados de tamano comparable para establecer una comparacion adicional.

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado en ingles y aleman; su uso en castellano u otros idiomas no esta respaldado por la model card.
- No genera respuestas ni titulos de conversacion: en Simplixity es obligatorio configurar un modelo de titulos aparte (por ejemplo, simplixity-title-0.8b), ya que de lo contrario los chats quedan sin nombre.
- La evaluacion se basa en 105 preguntas etiquetadas a mano por el autor; es un conjunto pequeno y no se documenta su composicion mas alla del reparto por idioma, por lo que el 96% debe tomarse como una estimacion con incertidumbre.
- La integracion con Ollama exige `RENDERER` y `PARSER` explicitos y una ruta absoluta en `FROM`; sin ellos el system prompt no llega al modelo y el enrutamiento falla.
- Riesgo de alucinacion en las decisiones de enrutamiento: al ser una tarea de clasificacion estructurada, un error puede traducirse en busquedas innecesarias, consultas mal formuladas o fuentes inadecuadas en el pipeline posterior.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a consultas adversariales.
- Licencia Apache 2.0, que permite uso comercial y modificacion, pero se recomienda verificar las condiciones del modelo base Qwen3.5-2B, no detalladas en la informacion proporcionada.
- Solo se publica la cuantizacion Q4_K_M; no hay variantes Q5, Q8 o de mayor precision para escenarios que requieran maxima fidelidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/stneric/simplixity-router-2b-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/stneric/simplixity-router-2b
- Repositorio de Simplixity: https://github.com/stneric/simplixity
- Modelo de titulos recomendado: https://huggingface.co/stneric/simplixity-title-0.8b

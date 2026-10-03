# vllm-sr/Decision-2.0-Nox-4B

## Resumen

Decision-2.0-Nox-4B es un modelo de 4,21 mil millones de parametros desarrollado por el equipo de vLLM Semantic Router (organizacion vllm-sr) y publicado el 29 de septiembre de 2026. No es un modelo generativo al uso: es un modelo de decision de tipo "system-one" que recibe un estado de entrada (texto o JSON) junto con un conjunto de preguntas y devuelve, en una sola pasada hacia delante, una probabilidad para cada opcion de respuesta, sin generar texto. Resuelve el problema de convertir lenguaje natural no estructurado en decisiones discretas y etiquetas con puntuacion de confianza dentro de pipelines de enrutado y clasificacion.

El modelo es un fine-tune de Qwen/Qwen3.5-4B-Base, con una longitud de contexto de 16.384 tokens y licencia Apache-2.0. Su ambito de aplicacion principal es el enrutado semantico de consultas (por ejemplo, decidir que equipo o que modelo debe atender una peticion) y la clasificacion estructurada, ambitos en los que el autor reporta una latencia mediana de 12,9 ms por pregunta individual sobre una sola GPU.

Es relevante ahora porque propone una alternativa al patron habitual de "pedir al LLM que genere JSON con su decision": al emitir directamente probabilidades calibradas en una unica pasada, permite integrar decisiones en codigo de produccion con umbrales y margenes explicitos, y combinar preguntas de tipo eleccion, si/no y puntuacion sobre el mismo input sin coste adicional de decodificacion autoregresiva. El repositorio ocupa 19,4 GB y acumula 25 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; fine-tune de Qwen/Qwen3.5-4B-Base |
| Parametros totales | 4,21 mil millones |
| Parametros activos | No aplica (el autor no indica que sea un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de tarea | feature-extraction / clasificacion (decision model) |
| Tipos de decision | choice (eleccion), noul (si/no), score (puntuacion) |
| Tamano del repositorio | 19,4 GB |
| Libreria | transformers (>= 5.17), con custom_code y `trust_remote_code=True` |
| Modelo base | Qwen/Qwen3.5-4B-Base (relacion: finetune) |
| Idiomas de la model card | Ingles |

## Arquitectura y entrenamiento

El autor solo declara que Decision-2.0-Nox-4B es un fine-tune del modelo base Qwen/Qwen3.5-4B-Base, con 4,21 B de parametros y 16.384 tokens de contexto. No se detalla en la informacion disponible la arquitectura interna mas alla de esa dependencia (no se confirma si es transformer denso, MoE o hibrido), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o similares. Tampoco se especifica el metodo de ajuste (SFT, destilacion o cabezas de clasificacion entrenadas sobre representaciones del modelo base).

La innovacion tecnica destacable, segun la model card, es el modo de inferencia: el modelo expone un metodo `system_one` que recibe un unico estado y un diccionario de preguntas heterogeneas (eleccion entre criterios, si/no y puntuacion sobre una escala) y las responde todas a la vez en una sola pasada, devolviendo una probabilidad para cada respuesta en lugar de texto generado. Esto elimina la decodificacion autoregresiva y el parseo de JSON, y permite tratar la salida como una distribucion de probabilidad sobre la que aplicar umbrales. El modelo requiere codigo personalizado (`custom_code`) y una version de transformers igual o superior a 5.17; el autor ofrece tambien una tarea de pipeline registrada como `decision`. No se aportan detalles sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de atencion.

## Capacidades

- Decision de tipo eleccion (`choice`): selecciona entre varias opciones etiquetadas, cada una con una descripcion de criterio, y devuelve la probabilidad asignada a cada una.
- Decision de tipo si/no: responde preguntas booleanas sobre el estado de entrada (en la model card el tipo aparece identificado como `noul`).
- Decision de tipo puntuacion (`score`): asigna una probabilidad a cada nivel de una escala ordinal definida por el usuario (por ejemplo, "Routine", "Soon", "Today").
- Procesamiento conjunto de multiples preguntas: choice, si/no y score sobre el mismo input se resuelven en una sola pasada hacia delante.
- Salida probabilistica: cada respuesta se devuelve con su probabilidad, lo que permite fijar umbrales, comparar alternativas y detectar casos ambiguos.
- Entrada multimodadlidad de formato: acepta tanto texto plano como JSON como `state`.
- Sin generacion de texto: no produce explicaciones ni razonamiento en lenguaje natural; es un clasificador de decision.
- Uso como extractor de caracteristicas: el pipeline declarado en HuggingFace es `feature-extraction`.
- No se documentan capacidades de codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso; el modelo no esta disenado para ello.

## Casos de uso

- Enrutado semantico de consultas en el propio vLLM Semantic Router: el modelo recibe la peticion del usuario y decide, en una sola pasada, a que equipo o a que modelo debe derivarse, con la probabilidad de cada ruta como senal de confianza para el enrutador.
- Triaje de tickets de soporte: sobre el texto del ticket se evaluan simultaneamente la categoria (devoluciones, facturacion, tecnico), la presencia de un recibo y la urgencia en una escala ordinal, devolviendo todas las etiquetas de una vez.
- Pre-filtrado previo a un LLM grande: usar el modelo como primera etapa barata que decide si una consulta requiere un modelo de gran tamano, reduciendo coste y latencia del sistema global; los 12,9 ms por pregunta lo hacen viable en linea.
- Moderacion y filtros booleanos: aplicar preguntas de tipo si/no sobre contenido generado o entrante (por ejemplo, "el mensaje contiene datos personales") y actuar segun la probabilidad devuelta.
- Extraccion de senales estructuradas para agentes: dado un estado en JSON que resume la memoria de un agente, decidir que accion corresponde entre un conjunto cerrado de opciones antes de invocar herramientas externas.
- Puntuacion y priorizacion de leads o incidencias: mapear cada elemento a una escala definida por el negocio y ordenar por probabilidad, con umbrales explicitos para la cola de trabajo.
- Clasificacion documental por lotes: al no decodificar texto, el coste por elemento es bajo y permite clasificar grandes volumenes con respuestas normalizadas y comparables entre si.
- Evaluacion automatica de respuestas: formular preguntas de tipo si/no o de puntuacion sobre la salida de otro modelo para construir un juez binario o graduado rapido dentro de un pipeline de QA.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | JevArena (mayor es mejor) | Transferencia con etiquetado humano (mayor es mejor) | Jev Decision Index (mayor es mejor) |
|---|---:|---:|---:|
| Decision-2.0-Nox-4B | 63,6 | 52,3 | 43,8 |
| Decider 4B | 61,9 | 55,5 | No disponible |
| Jet v6.2 | 60,4 | 53,8 | No disponible |
| Decision 1.0 Nox | 56,5 | 51,9 | 34,4 |

Notas de la propia model card: en JevArena todos los modelos responden a los mismos prompts congelados y se puntuan igual, contando como error las respuestas ausentes o invalidas; la metrica de transferencia es la mediana de macro-F1 sobre 15 tareas etiquetadas por humanos (multiplicada por 100); los datos de Decision 2.0 proceden de una reproduccion independiente con el kit oficial 0.2.1 sobre los pesos publicados, mientras que los de los demas modelos provienen de una captura publica del tablero del 28 de septiembre de 2026. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible, y estas metricas no son comparables con ellos.

Latencia declarada: mediana de 12,9 ms por peticion de una sola pregunta sobre una unica GPU (el autor no especifica el modelo de GPU).

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de 4,21 B de parametros: aproximadamente 17 GB en fp32 (coherente con el tamano de repositorio de 19,4 GB), unos 8,5 GB en fp16/bf16 y del orden de 4,5 GB en int8 o 2,5-3 GB en 4 bits. Estas cifras son estimaciones de calculo, no datos publicados por el autor; no se han publicado pesos cuantizados en el repositorio.
- GPU recomendadas: A100 (40/80 GB), H100 y GPU de datacenter equivalentes cubren cualquier precision sin problema. En consumer, una RTX 4090 (24 GB) permite fp16/bf16 completo, y tarjetas de 8-12 GB como RTX 3060, 4060 Ti o 3080 pueden alojar el modelo solo si se cuantiza a 8 o 4 bits.
- Cabida en GPU de consumo: si, en fp16 en GPUs de 12-16 GB o superiores con margen ajustado, y con holgura en 24 GB.
- Opciones de despliegue: el autor documenta el uso con `transformers >= 5.17` y `trust_remote_code=True`, ademas de un pipeline registrado como `decision`. Al requerir codigo personalizado, no se confirma soporte en vLLM, TGI, llama.cpp, Ollama ni otros servidores estandar; no hay informacion disponible al respecto.
- Latencia y throughput: 12,9 ms de mediana por peticion de una pregunta individual en una sola GPU (hardware no especificado). El autor no publica cifras de throughput agregado ni de rendimiento con batching.
- Contexto largo: 16.384 tokens de ventana, lo que condiciona la memoria de activacion en entradas muy largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena | Transferencia humana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-2.0-Nox-4B | 4,21 B | 16.384 | 63,6 | 52,3 | Apache-2.0 | HuggingFace (safetensors, codigo custom) |
| Decider 4B | No disponible | No disponible | 61,9 | 55,5 | No disponible | No disponible en la informacion |
| Jet v6.2 | No disponible | No disponible | 60,4 | 53,8 | No disponible | No disponible en la informacion |
| Decision 1.0 Nox | 4 B (misma familia) | No disponible | 56,5 | 51,9 | No disponible | Coleccion Decision 2.0 del mismo autor |

La comparativa se limita a las metricas publicadas por el propio autor: Decision-2.0-Nox-4B lidera en JevArena y en Jev Decision Index, pero queda por detras de Decider 4B y Jet v6.2 en la metrica de transferencia con etiquetado humano (52,3 frente a 55,5 y 53,8). No se dispone de datos de parametros, contexto ni licencia de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, explicaciones ni cadenas de razonamiento. Cualquier caso de uso que requiera justificar la decision necesita un componente adicional.
- Requiere ejecucion de codigo remoto (`trust_remote_code=True`), lo que implica revisar y auditar el codigo del repositorio antes de desplegarlo en entornos de produccion o con datos sensibles.
- Los benchmarks reportados (JevArena, Jev Decision Index, transferencia con etiquetado humano) estan definidos por el propio autor y no son comparables con metricas estandar como MMLU, HumanEval o GSM8K; la evaluacion de Decision 2.0 la realiza el propio equipo, aunque se declara una reproduccion independiente con el kit oficial.
- No se declaran los idiomas soportados. El unico idioma presente en la model card es el ingles, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- No hay informacion sobre composicion del dataset de entrenamiento, numero de tokens ni proceso de alineacion, lo que impide evaluar sesgos conocidos o riesgos de contaminacion.
- Riesgo de alucinacion no aplicable en el sentido generativo (no genera texto), pero si existe riesgo de calibracion incorrecta: una probabilidad alta no garantiza que la decision sea correcta, y el umbral debe validarse con datos propios.
- Limitacion de contexto: 16.384 tokens; los estados de entrada mas largos deben truncarse o resumirse.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero la licencia del modelo base Qwen/Qwen3.5-4B-Base no se detalla en la informacion disponible y conviene verificarla antes de un despliegue comercial.
- Adopcion muy baja en el momento de la consulta (25 descargas y 0 "likes"), lo que implica poca validacion externa y ausencia de reportes de terceros sobre robustez en produccion.
- No se confirma soporte en motores de inferencia estandar (vLLM, TGI, llama.cpp, Ollama); el despliegue depende de transformers y del codigo personalizado del autor.
- El tipo de pregunta aparece escrito como `noul` en el ejemplo oficial, en lugar de un identificador mas habitual para si/no; conviene verificar la cadena exacta contra la version del repositorio antes de integrarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Nox-4B
- Coleccion Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- vLLM (proyecto): https://vllm.ai/
- Repositorio de vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Guia de inferencia con vLLM: https://learnvllm.com/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
- Cita BibTeX del autor (incluida en la model card): `@misc{decision_2_0_nox_4b_2026, title = {{Decision-2.0-Nox-4B}: A Decision 2.0 Model for Structured Decisions}, author = {{vLLM Semantic Router Team}}, year = {2026}}`

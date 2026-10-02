# tokenaii/Neo

## Resumen

Neo es un modelo de decision "System One" desarrollado por TokenAI, una startup sin animo de lucro fundada en 2025 por Assem Sabry. A diferencia de un modelo generativo convencional, Neo no produce texto libre: lee un estado de aplicacion y un esquema de decision declarado, y devuelve en una sola pasada forward probabilidades tipadas para tres tipos de pregunta: `choice`, `score` y `noul`.

El modelo esta publicado en HuggingFace bajo el identificador `tokenaii/Neo` (referencia canonica `tokenaii/neo`) con un tamano de repositorio de 0,4 GB y licencia propietaria TokenAI Neo Model License v1.0. Su orientacion principal es el enrutado de herramientas (`tool-routing`) dentro de pipelines de agentes, es decir, decidir que accion o herramienta corresponde dado un estado, en lugar de redactar la respuesta final.

El entrenamiento se realizo desde cero sobre registros de decision sinteticos mediante una metodologia inspirada en RLCD con objetivos suaves (soft-target), segun declara el propio autor. La model card no especifica arquitectura concreta, numero de parametros, longitud de contexto ni idiomas soportados. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y las busquedas web realizadas no han devuelto ningun resultado relevante sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como "system-one" y "decision-model") |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | TokenAI Neo Model License v1.0 (license: other) |
| Formato de pesos | PyTorch (library_name: pytorch); formato concreto no especificado |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-10-01 |
| Ultima actualizacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |
| Dataset de entrenamiento | tokenaii/neo-dataset |
| Metodo de entrenamiento | RLCD-inspired soft-target training from scratch sobre registros de decision sinteticos |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo mas alla de etiquetarlo como "System One decision model" y declarar `library_name: pytorch`. No se indica si se trata de un transformer, un encoder, una red feed-forward o un híbrido, ni se aportan datos sobre numero de capas, dimensiones ocultas, mecanismos de atencion o tamano de vocabulario. La unica referencia estructural es funcional: el modelo recibe un estado de aplicacion junto con un esquema de decision declarado y emite, en una unica pasada forward, probabilidades tipadas para preguntas de tipo `choice`, `score` y `noul`. Esto sugiere una cabeza de salida orientada a clasificacion y puntuacion mas que a decodificacion autoregresiva de tokens.

En cuanto al entrenamiento, el autor indica que se realizo desde cero sobre registros de decision sinteticos mediante una variante inspirada en RLCD (Reinforcement Learning from Contrastive Distillation, por las siglas que aparecen en las etiquetas) con objetivos suaves. No se especifica el volumen de tokens, la composicion del dataset, si hubo fases de RLHF o DPO, ni los hiperparametros de entrenamiento. La model card remite al repositorio del proyecto para codigo, manifiestos, logs de ejecucion y protocolos de evaluacion, pero no incluye enlaces directos a dichos artefactos en la informacion disponible.

## Capacidades

- Decision tipada: genera probabilidades para preguntas de tipo `choice` (seleccion entre opciones), `score` (puntuacion de un estado o candidato) y `noul` (categoria declarada por el esquema).
- Enrutado de herramientas: la etiqueta `tool-routing` indica que su funcion principal es decidir que herramienta o accion invocar dado un estado de aplicacion.
- Inferencia en una sola pasada forward: no requiere decodificacion iterativa, lo que en principio reduce la latencia frente a modelos generativos.
- Entrada basada en esquema: el comportamiento del modelo queda definido por el esquema de decision que se le declara, no por un prompt conversacional.
- Sin generacion de texto libre: el modelo no mantiene conversaciones ni redacta respuestas en lenguaje natural, por lo que no sirve como chatbot.
- Tool calling: soporte indirecto, en tanto que su salida decide la herramienta a ejecutar, pero la ejecucion queda fuera del modelo.
- Razonamiento multi-paso: no disponible como capacidad declarada; no se documenta planificacion ni cadenas de razonamiento.
- Capacidades multilingues: no disponibles; no se declara ningun idioma.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

- Enrutado de herramientas en agentes: dado el estado de una sesion y un catalogo de herramientas declarado como esquema, Neo devuelve la probabilidad de cada herramienta candidata; el orquestador elige la de mayor probabilidad y ejecuta la accion.
- Clasificacion de intenciones en soporte tecnico: el modelo puede puntuar y clasificar la intencion de una consulta entrante para decidir si se resuelve con base de conocimiento, se escala a un humano o se activa un flujo automatizado.
- Puntuacion de riesgo en formularios: con preguntas de tipo `score`, puede asignar una puntuacion a un estado de solicitud (por ejemplo, un formulario de alta) para priorizar revision manual.
- Filtrado previo en pipelines de recuperacion: puede decidir si un fragmento recuperado es relevante (`choice`) antes de pasarlo a un modelo generativo, reduciendo el coste de generacion.
- Orquestacion de sistemas multi-agente: como modulo de decision de bajo nivel, puede determinar que agente especializado debe atender una tarea segun el estado compartido.
- Validacion de decisiones en produccion: al devolver probabilidades tipadas en lugar de texto, la salida es directamente auditable y permite aplicar umbrales de confianza y derivar a supervision humana cuando la probabilidad es baja.
- Enrutado de consultas en buscadores internos: separar consultas que requieren busqueda semantica de las que requieren consulta estructurada a base de datos, segun el esquema declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones numericas con modelos alternativos. Tampoco se aportan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El unico dato utilizable es el tamano del repositorio, 0,4 GB, que incluye pesos y posibles recursos auxiliares; no permite derivar con fiabilidad el numero de parametros ni la VRAM necesaria.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no confirmado. Por el tamano del repositorio es plausible que el modelo quepa en GPUs de consumo con suficiente VRAM, pero es una inferencia no verificada, no un dato declarado por el autor.
- Opciones de despliegue: no disponibles. La model card solo declara `library_name: pytorch`; no menciona soporte para vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La categoria declarada por el autor ("System One decision model" con salida de probabilidades tipadas y enrutado de herramientas) no coincide con la de los modelos generativos habituales de proposito general, y no se han aportado en la model card ni en la busqueda web referencias a alternativas equivalentes con datos verificables de parametros, contexto, rendimiento o licencia.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TokenAI Neo | no disponible | no disponible | no disponible | TokenAI Neo Model License v1.0 (propietaria) | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido: el modelo no genera texto libre, por lo que no puede emplearse como asistente conversacional ni como generador de contenido.
- Ausencia total de especificaciones: no se publican parametros, contexto, idiomas, tokenizador ni arquitectura, lo que impide estimar coste, latencia y calidad antes de desplegarlo.
- Riesgo de alucinacion: no evaluado ni documentado. Al emitir probabilidades sobre un esquema declarado, un esquema mal definido o estados fuera de distribucion pueden producir decisiones erroneas con alta confianza aparente.
- Sesgos conocidos: no disponibles. El entrenamiento sobre registros de decision sinteticos puede introducir sesgos derivados del generador de datos, pero no se documenta ninguna evaluacion al respecto.
- Limitaciones de contexto o idioma: no disponibles; no se declara ningun idioma soportado ni longitud maxima de entrada.
- Restricciones de licencia: la TokenAI Neo Model License v1.0 prohibe redistribuir, rebrandear, renombrar, hacer white-labeling o publicar copias o checkpoints derivados bajo otra identidad sin permiso escrito de TokenAI. El modelo debe mantenerse identificado como "TokenAI Neo" y conservar la referencia canonica `tokenaii/neo`.
- Restricciones sobre el dataset: el dataset `tokenaii/neo-dataset` no puede usarse sin preservar su referencia `tokenaii/neo`.
- Uso no certificado: el autor declara explicitamente que el modelo no esta certificado para decisiones medicas, legales, financieras, de seguridad critica ni autonomas sin validacion independiente y supervision humana.
- Madurez del proyecto: 0 descargas, 0 likes y repositorio creado y actualizado el mismo dia, sin historial de versiones ni adopcion verificable.
- Trazabilidad limitada: la model card remite al repositorio del proyecto para codigo, logs y protocolos de evaluacion, pero no incluye enlaces directos a esos artefactos en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tokenaii/Neo
- Referencia canonica declarada por el autor: https://huggingface.co/tokenaii/neo
- Dataset de entrenamiento: https://huggingface.co/datasets/tokenaii/neo-dataset
- Licencia del modelo: https://huggingface.co/tokenaii/neo/blob/main/MODEL_LICENSE.md
- Sitio de TokenAI: https://tokenai.llc
- Contacto del autor: info@tokenaia.llc
- Repositorio del proyecto (codigo, manifiestos, logs y protocolos de evaluacion): mencionado en la model card, URL no disponible
- Paper o publicacion tecnica: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de busqueda web: no se han encontrado resultados relevantes sobre el modelo; las busquedas devolvieron unicamente contenido no relacionado

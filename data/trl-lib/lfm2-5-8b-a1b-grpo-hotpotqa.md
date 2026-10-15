# trl-lib/LFM2.5-8B-A1B-GRPO-HotpotQA

## Resumen

LFM2.5-8B-A1B-GRPO-HotpotQA es un ajuste fino del modelo LiquidAI/LFM2.5-8B-A1B publicado por la organizacion trl-lib. Se trata de un modelo de generacion de texto de arquitectura Mixture of Experts (etiqueta `lfm2_moe`), con 8.467.856.128 parametros totales (unos 8,47 mil millones) y un peso en disco de 17,0 GB en safetensors. No es un modelo de proposito general: ha sido entrenado especificamente como agente de investigacion multiturno mediante GRPO (Group Relative Policy Optimization) sobre el conjunto de datos HotpotQA.

La relevancia de esta ficha es doble. Por un lado, muestra el resultado de aplicar RL con verificacion automatica (recompensa de coincidencia exacta) a un modelo pequeno para ensenarle a usar herramientas de forma encadenada: buscar, leer y responder. Por otro, sirve como implementacion de referencia, ya que los scripts de entrenamiento y evaluacion (`3_grpo.py` y `2_evaluate.py`) estan publicados en el repositorio de TRL dentro de la ruta `examples/lfm2_5_moe_research_agent`.

El modelo resuelve un problema muy concreto: el modelo base tiende a repetir busquedas sobre la misma entidad hasta agotar los turnos, mientras que esta version aprende a abrir articulos, seguir el enlace hasta el segundo documento relevante y emitir la respuesta. En 500 preguntas de validacion reservadas, todas etiquetadas como `hard`, la coincidencia exacta pasa del 35,8 % al 47,8 %. Se publica bajo licencia lfm1.0, con fecha de creacion del 15 de octubre de 2026 y cero descargas registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, variante LFM2.5 (`lfm2_moe`) |
| Parametros totales | 8.467.856.128 (8,47 mil millones) |
| Parametros activos | Aproximadamente 1.000 millones, inferido de la nomenclatura del modelo base (8B-A1B); no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors (repo de 17,0 GB, compatible con precision bf16). No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible (el conjunto de entrenamiento HotpotQA es en ingles) |
| Licencia | lfm1.0 (campo `license: other`, con `license_name: lfm1.0` y enlace al fichero LICENSE del repositorio) |
| Formato de pesos | safetensors, cargables con la libreria transformers |
| Modelo base | LiquidAI/LFM2.5-8B-A1B |
| Pipeline | text-generation |
| Dataset de entrenamiento | hotpotqa/hotpot_qa |
| Tamano del repositorio | 17,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura del modelo base es una mezcla de expertos (MoE) de la familia LFM2.5, segun la etiqueta `lfm2_moe` del repositorio y el sufijo `A1B` del nombre, que indica en la convencion de LiquidAI un modelo de 8.000 millones de parametros totales con aproximadamente 1.000 millones activos por token. El ajuste publicado no modifica la arquitectura: se aplico LoRA con rango r=32 sobre el modelo base y posteriormente se fusionaron los adaptadores en los pesos finales, de modo que el resultado es un checkpoint denso de safetensors sin adaptadores separados.

El entrenamiento se realizo con GRPO implementado en la libreria TRL. La tarea es un entorno de investigacion multiturno: cada pregunta de HotpotQA viene acompanada de diez articulos de Wikipedia, dos de los cuales contienen la respuesta y ocho actuan como distractores. El agente solo puede interactuar mediante tres herramientas: `search(query)`, `read(title)` y `submit_answer(answer)`. La funcion de recompensa es unicamente la coincidencia exacta de la respuesta enviada, sin senales intermedias de proceso ni recompensas parciales. El entrenamiento completo duro 200 pasos sobre una unica GPU H100 y consumio 2,4 horas.

La innovacion tecnica destacable no esta en la arquitectura sino en el procedimiento: demuestra que unas pocas horas de RL con una recompensa binaria y un modelo de recompensa trivial (comparacion de cadenas) bastan para cambiar cualitativamente la politica de uso de herramientas. Ademas, el hecho de que el ajuste se haga con LoRA y se fusione simplifica el despliegue, ya que no requiere cargar adaptadores en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional con soporte de esquema de mensajes (etiqueta `conversational`).
- Uso de herramientas (tool calling / function calling) con tres funciones concretas: `search(query)`, `read(title)` y `submit_answer(answer)`.
- Razonamiento de multiples saltos (multi-hop) sobre un corpus documental: encadena varias llamadas a herramientas en un mismo episodio para reunir informacion de dos articulos distintos.
- Planificacion de episodios de agente multiturno: decide cuando buscar, cuando leer un articulo concreto y cuando cerrar el episodio enviando la respuesta.
- Investigacion sobre documentos con distractores: mantiene el foco cuando ocho de los diez articulos disponibles no contienen la respuesta.
- Generacion de respuestas con formato corto y verificable, apta para evaluacion automatica por coincidencia exacta.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible; no se documenta ninguna de estas capacidades.
- Capacidad de proposito general fuera del entorno de investigacion: no documentada y presumiblemente degradada por la especializacion del ajuste.

## Casos de uso

- Agente de investigacion sobre corpus documental: el modelo se integra como planificador dentro de un bucle de herramientas donde `search` consulta un indice (por ejemplo, Elasticsearch o un indice vectorial) y `read` recupera el documento completo. Es adecuado porque ha sido entrenado exactamente con ese contrato de tres herramientas y aprende a no quedarse atrapado repitiendo busquedas.
- Respuesta a preguntas sobre bases de conocimiento internas: en una empresa con documentacion tecnica o normativa, el modelo actua como capa de razonamiento de un sistema RAG agentico, decidiendo cuantas consultas lanzar y que documentos abrir antes de responder.
- Verificacion de hechos con multiples fuentes: dado que el entrenamiento premia la respuesta correcta tras consultar dos articulos distintos, encaja en flujos de fact-checking donde hay que contrastar una afirmacion en al menos dos documentos antes de darla por valida.
- Generacion de trayectorias sinteticas para destilar agentes: las secuencias completas de llamadas a herramientas que produce el modelo pueden registrarse como datos de entrenamiento para modelos mas pequenos o para ajustes por imitacion.
- Referencia de evaluacion en pipelines de RL: sirve como linea base reproducible (con los scripts `2_evaluate.py` y `3_grpo.py`) para medir si una receta nueva de GRPO mejora o empeora el comportamiento agente respecto a este checkpoint.
- Automatizacion de asistencia al cliente con acceso a articulos de ayuda: cada consulta del usuario se traduce en una o varias llamadas de busqueda sobre la base de articulos y una respuesta final breve; el modelo esta acostumbrado a operar con documentos distractores.
- Integracion en pruebas de regresion continuas: al tener una metrica objetiva de coincidencia exacta sobre 500 preguntas reservadas, se puede incorporar a un pipeline de CI que valide que cambios en prompts, herramientas o versiones de inferencia no degradan el agente.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion del autor sobre 500 preguntas de validacion reservadas de HotpotQA, todas etiquetadas como `hard`, con decodificacion voraz (greedy):

| Modelo | Coincidencia exacta | Respuesta enviada | Episodios que leen algun articulo |
|---|---|---|---|
| LiquidAI/LFM2.5-8B-A1B (base) | 35,8 % | 57,8 % | 60,4 % |
| Este modelo (GRPO) | 47,8 % | 88,4 % | 81,4 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La comparacion con el modelo base es la unica disponible y esta limitada a esta tarea concreta de agente.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 17 GB solo para pesos en bf16/fp16 (coincide con el tamano del repositorio). Sumando cache KV y buffers de activaciones, el consumo practico se situa en torno a 19-24 GB para contextos moderados.
- GPU recomendadas: H100 de 80 GB (la empleada en el entrenamiento), A100 de 80 GB, L40S de 48 GB o A6000 de 48 GB para ejecucion comoda en bf16.
- Compatibilidad con GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en bf16 siempre que se limite la longitud de contexto y el numero de secuencias concurrentes; en caso contrario, es necesario cuantizar a 8 o 4 bits, lo que reduciria el peso a aproximadamente 8,5 GB y 4,5 GB respectivamente (valores estimados, no publicados por el autor).
- Opciones de despliegue: la model card cita explicitamente la generacion con vLLM junto con el parser de llamadas a herramientas de TRL. El script de evaluacion `examples/lfm2_5_moe_research_agent/2_evaluate.py` implementa ese bucle. No se proporcionan ficheros GGUF ni recetas para llama.cpp u Ollama, por lo que su uso en esos entornos requeriria una conversion propia.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es de entrenamiento: 200 pasos de GRPO en 2,4 horas sobre una sola H100.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Rendimiento en la tarea | Licencia |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-GRPO-HotpotQA (este) | 8,47 mil millones | ~1.000 millones (inferido) | no disponible | 47,8 % de coincidencia exacta en 500 preguntas `hard` de HotpotQA | lfm1.0 |
| LiquidAI/LFM2.5-8B-A1B (base) | 8,47 mil millones | ~1.000 millones (inferido) | no disponible | 35,8 % de coincidencia exacta en el mismo conjunto | lfm1.0 |
| Otros agentes de investigacion multiturno comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de otros agentes de investigacion de tamano similar, por lo que no es posible establecer una comparacion adicional fiable. La unica referencia solida es la mejora de 12 puntos porcentuales en coincidencia exacta respecto al modelo base.

## Limitaciones y advertencias

- Especializacion extrema: el ajuste se ha realizado con una unica tarea, un unico dataset y una unica funcion de recompensa (coincidencia exacta). Fuera del entorno de tres herramientas y de preguntas de tipo HotpotQA, el comportamiento no esta garantizado y probablemente degrade capacidades generales del modelo base.
- Riesgo de alucinacion: la recompensa premia la respuesta final correcta, no la fidelidad de las lecturas intermedias. El modelo puede emitir respuestas con formato valido pero incorrectas; en la evaluacion publicada solo acierta el 47,8 % de las preguntas, es decir, mas de la mitad de las respuestas no coinciden exactamente con la referencia.
- Idiomas: no se declara ninguna lista de idiomas soportados y el entrenamiento se ha hecho con HotpotQA, que es en ingles. El comportamiento en castellano no esta documentado.
- Dependencia del contrato de herramientas: el modelo espera exactamente `search(query)`, `read(title)` y `submit_answer(answer)`. Cambiar nombres, firmas o semantica de las herramientas puede romper la politica aprendida.
- Restricciones de licencia: la licencia es lfm1.0 (campo `license: other`). Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial, ya que se trata de una licencia propia de LiquidAI con posibles condiciones adicionales.
- Sesgos de los datos de origen: HotpotQA se construye a partir de Wikipedia en ingles, por lo que hereda los sesgos de cobertura, notoriedad y perspectiva de esa fuente, con infrarrepresentacion de conocimiento no angloparlante.
- Escala del entrenamiento reducida: 200 pasos de GRPO con LoRA r=32 fusionado. Es una receta ligera, no un ajuste exhaustivo, y el rendimiento puede ser sensible a cambios en el formato de prompt o en el numero maximo de turnos.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada, lo que dificulta dimensionar la memoria necesaria y planificar despliegues con documentos largos.
- Madurez baja: cero descargas y cero likes en el momento de la publicacion, sin validacion externa por parte de la comunidad.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/trl-lib/LFM2.5-8B-A1B-GRPO-HotpotQA
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Repositorio de TRL: https://github.com/huggingface/trl
- Scripts del agente de investigacion (entrenamiento y evaluacion): https://github.com/huggingface/trl/tree/main/examples/lfm2_5_moe_research_agent
- Dataset HotpotQA: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Grafico de recompensa del entrenamiento GRPO: https://huggingface.co/datasets/trl-lib/documentation-images/resolve/main/lfm2_5_moe_grpo_reward.png

Nota sobre la busqueda web: los resultados recuperados corresponden a la escala Technology Readiness Level (TRL) de la NASA y no guardan relacion con este modelo ni con la libreria TRL de HuggingFace. No se ha encontrado informacion adicional relevante en la busqueda.

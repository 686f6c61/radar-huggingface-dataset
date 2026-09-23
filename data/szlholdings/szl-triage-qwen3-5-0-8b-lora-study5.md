# SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-study5

## Resumen

SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-study5 es un adaptador LoRA de tipo PEFT para generación de texto, entrenado sobre el modelo base `unsloth/Qwen3.5-0.8B` para una tarea muy concreta: el triaje estructurado. El adaptador recibe una entrada de triaje y debe devolver exclusivamente un objeto JSON con la forma `{"label":"...","state":"...","evidence":["..."]}`, donde `label` es la categoría propuesta, `state` indica si el modelo puede decidir o necesita revisión, y `evidence` contiene fragmentos de texto que deben proceder literalmente de la entrada. Un estado `REVIEW` funciona como una negativa explícita a decidir cuando el caso no está claro.

El artefacto no es un modelo de propósito general, sino un estudio de reproducibilidad: contiene cinco ejecuciones de entrenamiento idénticas salvo por la semilla (11, 23, 37, 53 y 71), el adaptador por defecto en la raíz del repositorio (que corresponde a la semilla 11), los cinco adaptadores completos bajo `adapters/`, predicciones en bruto, registros de fallos, recibos de entrenamiento y métricas agregadas. El diseño experimental fija la partición de datos por familias de plantillas, de modo que las plantillas de evaluación no aparecen en el conjunto de entrenamiento, y usa decodificación greedy con la reparación de JSON malformado desactivada.

Su relevancia ahora es doble. Por un lado, es un ejemplo de publicación de artefactos con límites explícitos: el propio repositorio declara que la puerta de publicación está bloqueada (11/12), que el modelo no es promocionable, que existe un veredicto de contaminación registrado y que no sustituye al motor de decisión determinista. Por otro, ilustra un patrón habitual en producción: modelos pequeños (del orden de 0,8 mil millones de parámetros nominales según el nombre del modelo base) especializados mediante LoRA en una salida estructurada y auditable, donde el valor está en el formato y la trazabilidad, no en el conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal; arquitectura del modelo base no especificada en la informacion disponible |
| Parametros totales | No disponible (el adaptador no declara recuento; el nombre del modelo base sugiere 0,8 mil millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El entrenamiento se realizo sin cuantizacion y en bfloat16; el autor no publica variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_model.safetensors` + `adapter_config.json`); repositorio con libreria `peft` |
| Rank / alpha de LoRA | 16 / 16 |
| Tamano del repositorio | 0,3 GB |
| Epocas | 3 |
| Learning rate | 0,0002 |
| Precision de entrenamiento | bfloat16 |
| Batch efectivo | 4 |
| Filas de entrenamiento / evaluacion | 515 / 113 (particion por familia de plantillas) |
| Semillas | 11, 23, 37, 53, 71 |
| Decodificacion de evaluacion | Greedy, sin reparacion de JSON malformado |
| Descargas / likes | 96 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-22 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre `unsloth/Qwen3.5-0.8B`, un transformer causal de generacion de texto. No se publican detalles sobre la arquitectura interna del modelo base (tipo de atencion, uso de atencion lineal o hibrida, capas, cabezas), por lo que no es posible describirla mas alla de su naturaleza autorregresiva. El entrenamiento se hizo en bfloat16 y sin cuantizacion, con 3 epocas, tasa de aprendizaje 2e-4 y tamano de lote efectivo 4 sobre un total de 515 filas de entrenamiento. No se menciona uso de RLHF, DPO ni ninguna etapa de alineacion posterior; el ajuste es exclusivamente supervisado sobre la tarea de triaje estructurado.

La innovacion metodologica no esta en la arquitectura, sino en el protocolo de evaluacion y publicacion. La particion mantiene juntas las familias de plantillas, lo que reduce la fuga directa de plantilla entre entrenamiento y evaluacion y hace que la metrica sea mas exigente que un split aleatorio por fila. La evaluacion puntua siete aspectos independientes: validez estricta de JSON, coincidencia exacta de `label`, coincidencia exacta de `state`, acierto conjunto de etiqueta y estado, fidelidad de la negativa (`REVIEW`), etiquetas falsas en casos de negativa y anclaje de la evidencia (que los fragmentos citados provengan del texto de entrada). Ademas, se incluyen las predicciones en bruto y los registros de fallo completos para que las cifras puedan auditarse, y la decodificacion es greedy sin reparacion de JSON, de modo que un JSON invalido cuenta como fallo en lugar de ser corregido a posteriori. El repositorio incorpora un indice de adaptadores con el digest SHA-256 de cada uno y un recibo de entorno, orientados a la reproducibilidad entre las cinco semillas.

## Capacidades

- Generacion de texto con salida estricta en JSON: el adaptador esta entrenado para emitir unicamente el objeto `{"label","state","evidence"}` y nada mas.
- Clasificacion de triaje por etiqueta (`label`) sobre categorias definidas en el conjunto de entrenamiento, que no se detallan en la informacion disponible.
- Senalizacion de incertidumbre mediante el campo `state`, que distingue entre decidir y requerir revision (`REVIEW`); la negativa se evalua como una capacidad propia (fidelidad de la negativa).
- Extraccion de evidencia anclada: el campo `evidence` debe contener fragmentos literales del texto de entrada, y esa propiedad se mide de forma explicita.
- Comportamiento conversacional a traves de la plantilla de chat del tokenizador (`apply_chat_template`), con un turno de usuario que contiene la entrada de triaje.
- Reproducibilidad multi-semilla: cinco adaptadores entrenados con la misma receta y distintas semillas, con evidencia congelada y digests publicados.
- Razonamiento multi-paso, uso de herramientas, function calling, agentes, vision, audio, matemematicas avanzadas o modo de pensamiento extendido: no disponible; no se declara ninguna de estas capacidades en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no declara idiomas soportados.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de un ticket y devuelve categoria, decision o revision, y fragmentos de evidencia; el campo `evidence` permite que un agente humano verifique en segundos por que se asigno esa categoria, algo util cuando el volumen de tickets supera la capacidad de revision manual.
- Enrutado de correo entrante en buzon compartido: clasificar cada mensaje en un departamento o cola y marcar como `REVIEW` los casos ambiguos, de forma que solo los casos dudosos lleguen a una persona. Es adecuado porque el formato de salida es parseable de forma determinista y el estado de revision evita decisiones silenciosas erroneas.
- Preclasificacion en el sector sanitario o administrativo: el modelo propone una categoria y senala incertidumbre, pero la decision final queda en manos de un motor determinista o de personal cualificado. El propio autor advierte de que el modelo no sustituye al motor de decision determinista y que las decisiones de alto impacto requieren revision humana.
- Triaje de alertas de seguridad: agrupar alertas de SIEM o de escaneo de vulnerabilidades en categorias accionables, citando el fragmento del log que justifica la clasificacion. La exigencia de evidencia literal reduce el riesgo de justificaciones inventadas.
- Moderacion de contenido en colas de revision: clasificar envios y derivar a revision humana los casos dudosos, con la ventaja de que un fallo de formato se puede detectar y descartar antes de actuar.
- Extraccion estructurada para auditoria y cumplimiento: convertir texto no estructurado en registros JSON con etiqueta, estado y evidencia, y almacenar ademas las predicciones en bruto para auditoria posterior, un patron que el repositorio ya soporta al incluir predicciones y registros de fallo.
- Investigacion sobre estabilidad de LoRA: las cinco semillas y las metricas por semilla permiten estudiar la varianza del ajuste con una receta fija, util como linea base metodologica para otros adaptadores de salida estructurada.
- Prototipado de pipelines de datos etiquetados: usar el adaptador como preetiquetador de bajo coste en GPU de consumo y revisar despues solo la clase `REVIEW`, siempre que los datos resultantes pasen validacion de esquema y control de calidad.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre un holdout congelado de 113 filas, separado por familia de plantillas, con decodificacion greedy y sin reparacion de JSON. Se reproduce la tabla publicada tal cual.

| Objetivo | JSON valido | Label | State | Conjunto | Fidelidad de negativa | Evidencia anclada | Filas con fallo |
|---|---:|---:|---:|---:|---:|---:|---:|
| base | 0,0% | 0,0% | 0,0% | 0,0% | 0,0% | N/A | 113 |
| seed-011 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| seed-023 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| seed-037 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| seed-053 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |
| seed-071 | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 0 |

Precision conjunta media entre los cinco adaptadores: 100,0%, con desviacion tipica muestral de 0,0%. El autor advierte de que estos resultados describen unicamente ese holdout congelado de 113 filas y no establecen generalizacion amplia, calibracion ni aptitud para produccion. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede extrapolar estas cifras a capacidades generales.

## Requisitos de hardware

- VRAM estimada para el modelo base en bfloat16: del orden de 1,6-2 GB solo para pesos, mas el coste de activaciones y cache KV, que depende de la longitud de contexto (no disponible). El adaptador LoRA anade un coste marginal muy reducido (rango 16).
- VRAM estimada para el adaptador: menos de 0,1 GB adicionales en bfloat16, dado que los adaptadores de rango 16 sobre un modelo de ~0,8 mil millones de parametros contienen pocos millones de parametros; el repositorio completo ocupa 0,3 GB porque incluye cinco adaptadores y la evidencia.
- GPU recomendadas: cabe holgadamente en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, asi como en T4, L4, A10 y, por supuesto, A100 y H100. Para este tamano, las GPU de datacenter estan sobredimensionadas salvo por concurrencia o por contexto muy largo.
- Compatibilidad con GPU de consumo: si, es previsiblemente ejecutable en cualquier GPU con al menos 4-6 GB de VRAM, siempre que el contexto no sea muy largo. Estas cifras son estimaciones derivadas del tamano declarado del modelo base, no mediciones publicadas por el autor.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada en el repositorio. vLLM soporta la carga de adaptadores LoRA, lo que permitiria servir el adaptador sobre el modelo base con batching continuo. TGI tambien contempla adaptadores LoRA. llama.cpp y Ollama requieren convertir el modelo base a GGUF y aplicar el adaptador LoRA en ese formato; no hay evidencia en la informacion disponible de que se haya probado con este adaptador concreto, por lo que debe validarse antes de usarlo en produccion.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo. Como referencia cualitativa, un modelo de este tamano suele ser muy rapido en GPU moderna, pero no se dispone de cifras verificables.
- Aviso de integracion: el ejemplo de inicio rapido publicado contiene un fragmento de decodificacion malformado (`output[inputs["input_ids"].shape:],[3]`), por lo que conviene reescribir esa linea siguiendo la API habitual de `transformers` antes de usar el codigo.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. La comparacion mas informativa disponible es interna al propio estudio, entre el modelo base sin ajustar y los cinco adaptadores.

| Modelo | Parametros | Contexto | Acierto conjunto (holdout 113 filas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Adaptador de este repositorio (5 semillas) | Adaptador LoRA r16 sobre base de ~0,8B (nominal) | No disponible | 100,0% por semilla; media 100,0% (sd 0,0%) | No disponible | Publicado en HuggingFace, promocion no establecida |
| `unsloth/Qwen3.5-0.8B` (modelo base sin ajustar) | ~0,8B (nominal) | No disponible | 0,0% (0/113 filas, incluida validez de JSON) | No disponible | Publico como modelo base |
| Otros adaptadores de salida estructurada de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Puerta de publicacion bloqueada: el propio repositorio declara un estado de release `BLOCKED - 11/12` y una promocion `NOT_PROMOTABLE`. Publicado no significa promocionado.
- Veredicto de contaminacion: existe un veredicto de contaminacion registrado que viaja con el artefacto; el autor ha decidido mantenerlo visible en lugar de eliminarlo. Debe leerse antes de cualquier reutilizacion.
- Generalizacion no establecida: las metricas provienen de un unico holdout congelado de 113 filas separado por familia de plantillas. No hay evidencia de comportamiento fuera de ese conjunto, ni de calibracion.
- Modelo no calibrado: no se han publicado curvas de calibracion ni fiabilidad de las probabilidades. El campo `state` es una señal entrenada, no una probabilidad calibrada.
- No sustituye al motor de decision determinista: el autor indica explicitamente que el modelo no reemplaza al motor determinista y que las decisiones de alto impacto requieren revision humana o determinista.
- Salida no confiable por defecto: la salida generada debe parsearse y validarse antes de cualquier uso aguas abajo. Ademas, la reparacion de JSON malformado esta desactivada en la evaluacion, de modo que los fallos de formato cuentan como fallos.
- Riesgo de alucinacion: aunque el anclaje de evidencia es una metrica evaluada, un adaptador de este tamano sobre un modelo base de menos de mil millones de parametros puede producir fragmentos de evidencia que no aparezcan literalmente en la entrada. La validacion de anclaje debe repetirse en el dominio propio.
- Riesgo de sesgo: no se han publicado analisis de sesgo por idioma, dominio, demografia o tipo de caso, ni la composicion del dataset de entrenamiento. Se desconoce si las 515 filas cubren una diversidad suficiente de entradas.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados. No se debe asumir soporte multilingue ni ventanas largas.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no se puede confirmar si el uso comercial esta permitido. Debe aclararse con el autor antes de cualquier despliegue comercial.
- Alcance estrecho: es un adaptador especializado en triaje estructurado, no un asistente general. No se declaran capacidades de razonamiento abierto, codigo, matematicas, agentes ni uso de herramientas.
- Detalles del modelo base ausentes: al depender de `unsloth/Qwen3.5-0.8B`, hereda sus condiciones, su licencia y sus caracteristicas tecnicas, que no se detallan en la informacion disponible.
- Fragmento de codigo defectuoso: el ejemplo de inicio rapido del repositorio contiene una linea de decodificacion malformada; debe corregirse antes de su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/szl-triage-qwen3.5-0.8b-lora-study5
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Repositorio de codigo fuente: https://github.com/szl-holdings/szl-typesafe-triage
- Primera ejecucion medida: https://github.com/szl-holdings/szl-typesafe-triage/releases/tag/triage-lora-run1
- Evidencia del estudio de cinco semillas: https://github.com/szl-holdings/szl-typesafe-triage/releases/tag/triage-lora-study5-measured-20260922-111314
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante sobre este modelo; las busquedas devolvieron exclusivamente paginas de soporte de software y contenido no relacionado.

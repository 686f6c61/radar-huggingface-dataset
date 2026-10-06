# ThakiCloud/RAG-Gate-9B

## Resumen

RAG-Gate-9B es un ajuste fino supervisado del modelo Qwen/Qwen3.5-9B desarrollado por ThakiCloud, disenado para ocupar una posicion muy concreta dentro de una arquitectura de generacion aumentada por recuperacion (RAG): justo despues de la recuperacion de pasajes y antes del modelo generador. Su funcion no es redactar respuestas, sino emitir un unico token de decision entre tres acciones posibles: Answer (la evidencia recuperada contiene una cadena de soporte completa), Retrieve (la evidencia es insuficiente pero se puede volver a buscar) y Stop (la evidencia es insuficiente y no hay mas rondas de recuperacion disponibles).

El problema que resuelve es el de la suficiencia de evidencia en pipelines RAG multihop. Segun los datos de la model card, el modelo base zero-shot alcanza una precision de accion de .686 sobre un conjunto de test ciego de 14.818 items, con una tasa de respuesta no soportada del .316. Tras el ajuste fino, la precision sube a .955 y la tasa de respuesta no soportada baja al .033, manteniendo la tasa de rechazo excesivo en .062. La mayor mejora se concentra en estados de evidencia con la cadena rota: en BROKEN_LINK se pasa de .172 a .941 de precision.

Se trata de un modelo denso de 8.953.803.264 parametros (aproximadamente 8,95 mil millones), con pesos en bf16 resultantes de fusionar un adaptador LoRA en el modelo base. Esta publicado bajo licencia Apache 2.0, solo soporta ingles y esta etiquetado con la arquitectura qwen3_5_text dentro de la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5, etiqueta `qwen3_5_text`), ajuste fino LoRA fusionado en pesos bf16 |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos publicados son safetensors en bf16. No se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

Datos adicionales: tamano del repositorio 17,9 GB; pipeline `text-generation`; libreria `transformers`; descargas y likes registrados en HuggingFace: 0; fecha de creacion del repositorio: 2026-10-05.

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-9B, un transformer decoder-only denso. Sobre el se aplico un ajuste fino mediante LoRA que despues se fusiono en los pesos bf16 definitivos, de modo que el repositorio publicado expone un unico checkpoint estandar cargable con `AutoModelForCausalLM`. No se trata por tanto de un ensemble ni de un modelo con cabezas adicionales: la tarea de clasificacion se resuelve leyendo directamente los logits del primer token generado tras el prefill `Final action:`, restringidos a las tres etiquetas ` Answer`, ` Retrieve` y ` Stop`.

Los conjuntos de datos empleados en el ajuste, segun las etiquetas y la model card, son ThakiCloud/ChainCheck y dgslibisey/MuSiQue. MuSiQue aporta preguntas multihop con estructura de saltos encadenados; ChainCheck se describe como un conjunto construido por separado, fuera de distribucion, que evalua si el modelo reacciona a si la cadena de soporte esta intacta. La informacion disponible no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La innovacion tecnica destacable no esta en la arquitectura sino en el planteamiento: convertir la decision de suficiencia de evidencia en una clasificacion de un solo token, determinista y leible por logits, lo que permite umbralizar la probabilidad de `Answer` en lugar de tomar el argmax cuando la aplicacion prefiere minimizar respuestas no soportadas a costa de mas rechazos.

La model card incluye estados de evidencia explicitos usados en la evaluacion: `FULL` (cadena de soporte completa), `FULL_DECOY` (cadena completa mas un pasaje distractor editado), `BROKEN_LINK` (hecho puente contradicho), `MISSING_HOP` (falta un salto) y `MISSING_ALL` (ningun pasaje de soporte). El caso `FULL_DECOY` es el control de robustez: la evidencia esta editada pero sigue siendo suficiente, por lo que la accion correcta sigue siendo `Answer`; un modelo que hubiera aprendido la heuristica "texto editado = rechazar" fallaria en ese estado.

## Capacidades

- Clasificacion de suficiencia de evidencia: emite exactamente una de tres acciones (`Answer`, `Retrieve`, `Stop`) a partir de la pregunta, los pasajes recuperados y un indicador de si queda recuperacion disponible.
- Toma de decision determinista por logits: el uso previsto es leer las probabilidades de los tres tokens etiqueta y no muestrear, lo que hace la salida reproducible y facil de umbralizar.
- Razonamiento multihop: el ajuste esta orientado a preguntas que requieren encadenar varios hechos (dataset MuSiQue), incluyendo deteccion de saltos ausentes y de hechos puente contradichos.
- Deteccion de distractores: mantiene la decision correcta cuando la evidencia incluye pasajes editados o irrelevantes que no rompen la cadena de soporte (`FULL_DECOY`).
- Abstencion controlada: capacidad de detener el pipeline sin responder cuando no hay soporte y no queda recuperacion disponible, con una tasa de rechazo excesivo del .062 sobre evidencia suficiente.
- Integracion como guardarrail: el resultado se usa para gobernar el bucle de recuperacion (rondas adicionales) o para devolver un mensaje de no respuesta.
- Soporte de chat template: la model card usa `apply_chat_template` con `enable_thinking=False`, lo que indica que el tokenizador del modelo base expone plantilla conversacional.
- Idiomas: exclusivamente ingles; no se declara soporte multilingue.
- Tool calling, agentes autonomos, vision, audio y modos de pensamiento extendido: no disponibles segun la informacion proporcionada.

## Casos de uso

- Control de alucinacion en asistentes documentales: antes de que el generador redacte, RAG-Gate-9B decide si la evidencia recuperada soporta la respuesta. Si la probabilidad de `Answer` es baja, el sistema responde con una abstencion explicita en lugar de inventar, algo critico en dominios legales, medicos o financieros donde una respuesta no soportada tiene coste alto.
- Bucle de recuperacion adaptativo en RAG multihop: cuando la accion es `Retrieve`, el orquestador lanza una segunda ronda de busqueda con la consulta reformulada; cuando es `Stop`, termina. Esto evita rondas de recuperacion innecesarias en preguntas ya respondibles y evita gastar presupuesto en preguntas sin cobertura documental.
- Enrutado de consultas en atencion al cliente automatizada: el modelo distingue entre preguntas que la base de conocimiento cubre y preguntas que deben escalarse a un agente humano, reduciendo el volumen de tickets mal resueltos automaticamente.
- Verificacion de citas en generacion con fuentes: en un pipeline que exige que cada afirmacion este respaldada por un pasaje, el gate actua como comprobador previo de que existe una cadena de soporte completa, incluyendo el caso de evidencia con distractores editados (`FULL_DECOY`).
- Auditoria y evaluacion de sistemas RAG: dado que la salida es una distribucion sobre tres tokens, permite instrumentar metricas de suficiencia de evidencia por consulta y detectar que porcentaje del trafico depende de evidencia insuficiente.
- Moderacion de respuestas en buscadores con respuesta generada: el gate filtra los casos en los que la recuperacion no alcanza y el sistema deberia mostrar solo enlaces en lugar de un resumen generado.
- Construccion de conjuntos de evaluacion de robustez: el esquema de estados de evidencia (`FULL`, `FULL_DECOY`, `BROKEN_LINK`, `MISSING_HOP`, `MISSING_ALL`) puede reutilizarse como taxonomia para probar otros componentes del mismo pipeline.

## Benchmarks y rendimiento

Resultados de test ciego con 14.818 items sobre 2.256 preguntas base; intervalos de confianza del 95 % por bootstrap sobre preguntas base con 10.000 remuestreos. Datos tomados de la model card del autor.

| Metrica | Base zero-shot | RAG-Gate-9B |
|---|---|---|
| Precision de accion | .686 [.678, .694] | .955 [.950, .960] |
| Tasa de respuesta no soportada = P(Answer \| evidencia insuficiente) | .316 [.303, .328] | .033 [.028, .039] |
| Tasa de rechazo excesivo = P(no Answer \| evidencia suficiente) | .155 [.140, .169] | .062 [.052, .072] |

Desglose por estado de evidencia (precision):

| Estado | Significado | Base zero-shot | RAG-Gate-9B |
|---|---|---|---|
| `FULL` | cadena de soporte completa | .847 | .939 |
| `FULL_DECOY` | cadena completa mas un pasaje distractor editado | .914 | .949 |
| `BROKEN_LINK` | hecho puente contradicho | .172 | .941 |
| `MISSING_HOP` | falta un salto | .426 | .938 |
| `MISSING_ALL` | ningun pasaje de soporte | .792 | .993 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de control de suficiencia. La model card menciona el conjunto ChainCheck como evaluacion fuera de distribucion, pero el texto proporcionado esta truncado y no incluye sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: entorno a 18 GB solo para pesos (8,95 mil millones de parametros a 2 bytes), mas cache KV y activaciones. El repositorio ocupa 17,9 GB.
- VRAM en cuantizacion de 8 bits: aproximadamente 9-10 GB; en 4 bits, aproximadamente 5-6 GB. Estas cifras son estimaciones generales de tamano de modelo, ya que la model card no publica variantes cuantizadas de este checkpoint.
- GPU recomendadas: A100 40 GB, H100, L40S o similares para despliegue en bf16 con margen. Una RTX 4090 de 24 GB queda muy justa para bf16 con contexto largo, pero es viable si se convierte a 8 bits o si el contexto es corto.
- Consumer GPU: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en cuantizacion de 8 o 4 bits; en bf16 completo requiere reducir el contexto o hacer offload a CPU con `device_map="auto"`.
- Opciones de despliegue: al ser un checkpoint transformers estandar, es compatible con vLLM y TGI para servir el modelo, y con `transformers` en local. No se publican archivos GGUF, por lo que Ollama o llama.cpp requeririan una conversion previa a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles. Cabe senalar que el patron de uso es prefill de la evidencia seguido de la generacion de un unico token, por lo que el coste dominante es el procesado del prompt de evidencia y no la decodificacion autoregresiva; el coste crece linealmente con el numero y la longitud de los pasajes recuperados.

## Comparativa con modelos similares

No se documentan en la informacion disponible otros modelos publicos especializados en control de suficiencia de evidencia dentro de un pipeline RAG, por lo que la comparativa se limita al modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | Precision de accion (test) | Tasa de respuesta no soportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RAG-Gate-9B | 8,95 mil millones | no disponible | .955 | .033 | apache-2.0 | HuggingFace (ThakiCloud) |
| Qwen/Qwen3.5-9B zero-shot | 8,95 mil millones (nominal) | no disponible | .686 | .316 | no disponible en la informacion proporcionada | HuggingFace (Qwen) |
| Otros modelos de gate de suficiencia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance funcional muy restringido: el modelo no genera respuestas ni texto libre; solo clasifica la accion en un token. Usarlo como generador produciria resultados no validados por el autor.
- Idioma: solo ingles. No hay evidencia de comportamiento en castellano ni en otros idiomas, y la plantilla de prompt esta redactada en ingles.
- Longitud de contexto no documentada: se desconoce cuantos pasajes pueden concatenarse de forma fiable, lo que es un riesgo directo en produccion si la evidencia recuperada es extensa.
- Sensibilidad al formato del prompt: la decision depende de leer los logits de tokens etiqueta concretos (` Answer`, ` Retrieve`, ` Stop`) tras el prefill `Final action:`. Cambiar la plantilla, el tokenizador o el orden de los campos puede invalidar el comportamiento.
- Riesgo residual de respuesta no soportada: .033 en el conjunto de test. No es cero; en dominios de alto riesgo debe combinarse con verificacion adicional o con un umbral mas estricto sobre la probabilidad de `Answer`.
- Riesgo de rechazo excesivo: .062 sobre evidencia suficiente, lo que se traduce en abstenciones innecesarias y peor experiencia de usuario si no se ajusta el umbral.
- Evaluacion limitada a dos conjuntos: el test se construye sobre preguntas de MuSiQue y el conjunto ChainCheck del propio autor. No hay evaluacion en dominios empresariales reales ni en distribuciones de recuperacion distintas de las del entrenamiento.
- Ausencia de cuantizaciones oficiales: desplegar en hardware limitado exige convertir los pesos por cuenta propia, con el consiguiente riesgo de degradacion en una tarea de clasificacion de un solo token, donde pequenos cambios en los logits pueden alterar la decision.
- Trazabilidad: repositorio con 0 descargas y 0 likes en el momento de la ficha, sin paper asociado ni evaluacion externa independiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base Qwen/Qwen3.5-9B tiene sus propias condiciones, que no se detallan en la informacion proporcionada y conviene verificar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/RAG-Gate-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset ChainCheck: https://huggingface.co/datasets/ThakiCloud/ChainCheck
- Dataset MuSiQue: https://huggingface.co/datasets/dgslibisey/MuSiQue
- Paper asociado: no disponible
- Blog o demo: no disponible
- Repositorio de codigo: no disponible

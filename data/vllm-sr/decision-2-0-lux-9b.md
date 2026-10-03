# vllm-sr/Decision-2.0-Lux-9B

## Resumen

Decision-2.0-Lux-9B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router (organización `vllm-sr`). No es un modelo generativo al uso: recibe un estado de entrada (texto libre o JSON) junto con una batería de preguntas y devuelve, en una sola pasada hacia delante, una probabilidad para cada opción de respuesta, sin generar texto. Soporta tres tipos de pregunta: elección entre varias opciones (*choice*), sí/no (*noul*) y puntuación en una escala (*score*).

El modelo tiene 7,94 mil millones de parámetros, una longitud de contexto de 16.384 tokens y se distribuye bajo licencia Apache-2.0. Es un *fine-tune* de `vllm-sr/Decision-1.0-Lux-9B`, del que mejora en +2,3 puntos en JevArena y +2,8 en el Jev Decision Index según la model card. El repositorio ocupa 17,9 GB en pesos `safetensors` y requiere `transformers>=5.17` con `trust_remote_code=True`.

Su relevancia práctica está en el enrutado semántico y la clasificación multi-etiqueta de baja latencia: la model card reporta una mediana de 18,4 ms por petición de una sola pregunta en una única GPU, lo que lo sitúa en un régimen de latencia compatible con decisiones en línea dentro de una puerta de enlace de inferencia (por ejemplo, decidir qué modelo o qué equipo atiende una petición). Con solo 84 descargas y 11 *likes* en el momento de redactar esta ficha, es un modelo muy reciente y poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica transformer, MoE ni hibrida) |
| Parametros totales | 7,94B |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`transformers`, requiere `trust_remote_code=True`) |
| Modelo base | vllm-sr/Decision-1.0-Lux-9B (relacion: finetune) |
| Tipo de pipeline | feature-extraction / clasificacion |
| Tipos de decision | choice, noul (si/no), score |
| Version minima de transformers | 5.17 |
| Tamano del repositorio | 17,9 GB |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna: no se indica si se trata de un transformer denso de tipo decoder, de una variante MoE o de otra topología, ni se publica el número de capas, cabezas de atención o dimensiones ocultas. Lo que sí se explicita es el contrato funcional: el modelo no genera texto, sino que expone un método `system_one(state, questions)` que recibe un estado (texto o JSON) y un diccionario de preguntas heterogéneas y devuelve un diccionario de respuestas con probabilidades por opción. Las preguntas del mismo estado se resuelven conjuntamente en una única pasada, lo que el autor presenta como la principal innovación de eficiencia frente a encadenar clasificadores independientes.

Tampoco se publican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La model card sí menciona una auditoría de los datos de entrenamiento a nivel de fila contra los ítems de test del Jev Decision Index, un control de contaminación poco habitual y relevante para interpretar los resultados. El modelo es un *fine-tune* de Decision 1.0 Lux, y el pipeline asociado es `feature-extraction`, coherente con su salida de probabilidades en lugar de logits de vocabulario.

## Capacidades

- Decision estructurada multiple en una sola pasada: responde simultaneamente preguntas de tipo `choice`, `noul` (si/no) y `score` sobre el mismo estado de entrada.
- Salida probabilistica por opcion, no texto generado: cada respuesta incluye la probabilidad asignada a cada alternativa.
- Entrada heterogenea: acepta texto plano o JSON estructurado como estado.
- Criterios semanticos por pregunta: el campo `criteria` permite describir con lenguaje natural que significa cada opcion (por ejemplo, `returns`, `billing`, `technical`).
- Uso como pipeline de transformers: `transformers.pipeline("decision", model=..., trust_remote_code=True)`.
- Clasificacion y extraccion de caracteristicas: el pipeline declarado es `feature-extraction`.
- No documentado: no se menciona soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento. Estas capacidades no estan disponibles en la informacion proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Enrutado semantico en una puerta de enlace de inferencia: integrado en vLLM Semantic Router, el modelo decide a que modelo, equipo o cola debe dirigirse una peticion entrante, resolviendo la decision en decenas de milisegundos y devolviendo la probabilidad de cada ruta para poder aplicar umbrales o fallbacks.
- Triage de tickets de soporte: dado el texto de una incidencia, responde a la vez a que equipo corresponde (devoluciones, facturacion, tecnico), si el cliente aporta comprobante de compra y cuan urgente es el caso en una escala de tres niveles, todo en una unica llamada.
- Moderacion y politicas de contenido: formulando preguntas de tipo si/no con criterios explicitos, el modelo puede prefiltrar contenido antes de invocar un modelo generativo, reduciendo coste y latencia en el camino critico.
- Clasificacion multi-etiqueta en lotes: catalogacion de documentos, correos o articulos donde hay que responder simultaneamente a varias preguntas booleanas y de eleccion sobre el mismo texto.
- Etiquetado asistido y anotacion: generacion de borradores de etiquetas con probabilidades asociadas, utiles para preanotar corpus que luego revisa un humano, gracias a la calibracion implicita de las salidas.
- Encuestas y formularios estructurados: conversion de respuestas en texto libre a un conjunto fijo de decisiones (opcion unica, si/no, escala) sin necesidad de un LLM generativo ni de parsear JSON de salida.
- Filtros de enrutado previos al *tool calling*: decidir si una peticion requiere una herramienta externa y cual, antes de que un modelo generativo construya la llamada.
- Evaluacion automatica ligera: puntuar respuestas o documentos en una escala ordinal definida por `criteria`, con la probabilidad de cada nivel como medida de confianza.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | JevArena (mas alto mejor) | Human-labelled transfer | Jev Decision Index |
|---|---:|---:|---:|
| Decision-2.0-Lux-9B | 68,1 | 56,2 | 46,3 |
| Decision 1.0 Lux | 65,8 | 55,8 | 43,5 |
| Nimble v2 | 62,1 | 53,6 | no disponible |

Notas metodologicas declaradas por el autor: todos los modelos responden a los mismos *prompts* congelados y se puntuan de la misma forma, contando las respuestas ausentes o invalidas como errores. La metrica de transferencia con etiquetado humano es la mediana de macro-F1 sobre 15 tareas anotadas por personas (multiplicada por 100). Para Decision 2.0 los resultados son una reproduccion independiente con el kit oficial 0.2.1 sobre los pesos publicados; para el resto se usa una captura del tablero publico del 28 de septiembre de 2026. No se han publicado resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K en la informacion disponible.

Dato de rendimiento declarado: mediana de 18,4 ms por peticion de una sola pregunta en una unica GPU.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos (7,94B x 2 bytes) y del orden de 18-24 GB contando activaciones y *overhead* del runtime.
- VRAM estimada en int8: en torno a 8-9 GB de pesos; en int4, en torno a 5-6 GB. Estos valores son estimaciones de calculo, ya que el autor no publica variantes cuantizadas.
- GPU de datacenter: A100 40/80 GB, H100, L40S y similares con margen amplio en bf16.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado. Tras cuantizacion a 8 bits cabria en RTX 4080/3090 (16-24 GB) y a 4 bits en RTX 3060 12 GB o 4060 Ti 16 GB.
- Opciones de despliegue: el camino documentado es `transformers` con `trust_remote_code=True` (requiere `transformers>=5.17`), invocando `model.system_one(...)` o el pipeline `"decision"`. El modelo no es generativo y usa codigo personalizado, por lo que no hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni otros servidores estandar en la informacion proporcionada.
- Latencia: mediana de 18,4 ms por peticion de una sola pregunta en una unica GPU, segun el autor. No se publican cifras de throughput agregado ni de latencia para lotes grandes o muchas preguntas por estado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena | Human-labelled transfer | Jev Decision Index | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Decision-2.0-Lux-9B | 7,94B | 16.384 | 68,1 | 56,2 | 46,3 | Apache-2.0 |
| Decision 1.0 Lux | 9B (segun el nombre del modelo base) | no disponible | 65,8 | 55,8 | 43,5 | no disponible |
| Nimble v2 | no disponible | no disponible | 62,1 | 53,6 | no disponible | no disponible |

Solo se dispone de estos tres modelos en la comparativa publicada por el autor. No hay informacion sobre licencias, contextos ni tamanos de Nimble v2, ni sobre la licencia de Decision 1.0 Lux mas alla de su uso como base del modelo analizado. La model card afirma que Decision-2.0-Lux-9B esta por delante de "los otros 2 modelos del mismo tamano comparados", lo que coincide con la tabla anterior.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas. No sirve para tareas generativas, resumen, traduccion ni dialogo abierto.
- La arquitectura, el dataset de entrenamiento y el numero de tokens no estan documentados, lo que dificulta auditar sesgos o comportamientos de dominio.
- Idiomas soportados: no disponible. No hay garantia documentada de funcionamiento fuera del ingles, idioma de los ejemplos de la model card.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser un modelo de clasificacion, heredara los sesgos de su corpus de entrenamiento, que no ha sido publicado ni auditado externamente.
- Riesgo de calibracion deficiente: las probabilidades devueltas deben validarse contra datos propios antes de usarlas como umbral en produccion; no se publican curvas de calibracion ni analisis de fiabilidad.
- Riesgo de alucinacion en el sentido clasico no aplica (no genera texto), pero si existe riesgo de respuestas invalidas o erróneas ante entradas fuera de distribucion; el autor indica que las respuestas ausentes o invalidas cuentan como errores en su evaluacion.
- Ventana de contexto limitada a 16.384 tokens: los estados largos, como hilos de conversacion extensos o documentos completos, deben truncarse o resumirse antes de la llamada.
- Dependencia de codigo personalizado: requiere `trust_remote_code=True` y una version de `transformers` (5.17) superior a las habituales, lo que implica ejecutar codigo del autor y puede complicar el despliegue en entornos con politicas restrictivas.
- Adopcion muy baja: 84 descargas y 11 *likes*, con creacion en septiembre de 2026 y ultima actualizacion en octubre de 2026. No hay ecosistema, herramientas de terceros ni informes independientes.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones relevantes, pero el usuario asume la responsabilidad sobre el cumplimiento de las condiciones de los datos de entrenamiento, no detalladas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Lux-9B
- Coleccion Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Modelo base Decision 1.0 Lux 9B: https://huggingface.co/vllm-sr/Decision-1.0-Lux-9B
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Proyecto vLLM: https://vllm.ai/
- Repositorio vLLM en GitHub: https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Pagina de vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
- Articulo sobre despliegue de vLLM en produccion: https://blog.stephane-robert.info/docs/developper/programmation/python/vllm/

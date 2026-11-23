# SZLHOLDINGS/salad-ring-ouro-l97

## Resumen

`salad-ring-ouro-l97` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, presentado como parte de un "estate" de IA gobernada con resultados verificables y vinculados a la fuente. El repositorio no incluye model card tecnica convencional: la documentacion disponible consiste en metadatos generados automaticamente por su propia herramienta de fichas (`estate-cards weaver`) y en referencias a ficheros de "receipts" (justificantes de auditoria) que, segun el propio autor, no alcanzan el umbral estricto de evidencia medible.

La informacion publica no especifica arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni formato de pesos. El autor declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por un receipt medido se considera "UNKNOWN", y el escaneo de receipts de la familia "salad" clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, es decir, con ficheros de nombre similar a receipts pero sin un `DONE.json` estricto que acredite evaluacion medida. En la fecha de consulta el modelo registra 0 descargas y 0 likes.

Por tanto, esta ficha documenta lo que el repositorio afirma de si mismo y marca como "no disponible" todo aquello que no puede verificarse. No es posible evaluar su idoneidad para produccion con la evidencia actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo referencia `assets/szl-card/mesh-receipts.svg`) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La model card se limita a declarar que se trata de un "trained artifact in the governed factory" del estate de SZLHOLDINGS, sin detallar el proceso de entrenamiento.

El unico elemento estructural documentado es el sistema de receipts: el autor afirma que las afirmaciones de entrenamiento y evaluacion viven en ficheros de receipt dentro de la malla del estate, y que cualquier dato no receiptado se etiqueta como UNKNOWN. El escaneo `receipts-tranche-6 chunk-10` (2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de receipt (`assets/szl-card/mesh-receipts.svg`), pero no un `DONE.json` con `status=MEASURED`, `eval_rc=0` y marca temporal que satisfaga el estandar estricto. No se describe ninguna innovacion tecnica de inferencia (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generacion de texto, razonamiento, codigo, matematicas, vision).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se declara ningun modo especial (thinking mode, vision, audio).
- El autor afirma explicitamente que no se hace ninguna afirmacion de calidad o capacidad sin receipts de evaluacion medidos, y que en este repositorio dichos receipts no alcanzan el umbral estricto.

## Casos de uso

No es posible recomendar casos de uso concretos con la evidencia disponible. Las siguientes entradas describen escenarios que requeririan verificacion previa y no deben interpretarse como usos validados:

- Evaluacion de gobernanza de artefactos: el repositorio puede servir como ejemplo de publicacion con trazabilidad por receipts, util para equipos que disenen pipelines de auditoria de modelos, aunque su propio receipt estricto no esta completo.
- Analisis de metadatos de ecosistema Hugging Face: util para estudiar como se estructuran fichas generadas automaticamente y que campos quedan como UNKNOWN.
- Pruebas de carga de repositorios: al no documentarse formato de pesos ni pipeline, cualquier uso requeriria primero inspeccionar el contenido real del repositorio.
- Integracion en un registro interno de modelos: solo como entrada marcada como no verificada, pendiente de auditoria.
- Investigacion sobre practicas de documentacion: comparar esta ficha con model cards convencionales para identificar carencias (licencia, idiomas, contexto).
- Descartado para produccion: sin licencia, sin benchmarks y sin especificaciones, no es adecuado para atencion al cliente, generacion de codigo, agentes ni ninguna aplicacion en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de receipts clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion publica no permite identificar la categoria, el tamano ni la tarea del modelo, por lo que no es posible establecer comparaciones fundamentadas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l97 | no disponible | no disponible | no disponible | repositorio Hugging Face con 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, es imposible planificar su despliegue.
- Licencia no declarada: no puede asumirse ningun derecho de uso comercial; el uso en produccion queda bloqueado hasta que se aclare.
- Evidencia de evaluacion no verificada: el propio autor clasifica los receipts de este repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` medido.
- Riesgo de alucinacion y sesgos: no evaluables sin benchmarks ni documentacion de datos de entrenamiento.
- Idiomas no especificados: no puede garantizarse un comportamiento correcto en castellano ni en ninguna otra lengua.
- Repositorio sin traccion: 0 descargas y 0 likes en la fecha de consulta, sin senales de uso o validacion por la comunidad.
- La documentacion disponible es generada por herramienta propia (`estate-cards weaver v0.1.0`) y remite a una malla de receipts externa que no se ha podido inspeccionar.
- No debe citarse como "modelo potente" ni atribuirsele capacidades no receiptadas; cualquier afirmacion de rendimiento seria especulativa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l97
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de fichas: https://github.com/szl-holdings/estate-cards
- Resultado de busqueda web proporcionado (no relacionado con el modelo, sobre arbitraje cross-chain): https://crypto-trading-pro.contentwave.net/article/cross-chain-arbitrage-in-2026-measuring-latency-bridge-fees-mev
- Paper, blog o demo oficial: no disponible

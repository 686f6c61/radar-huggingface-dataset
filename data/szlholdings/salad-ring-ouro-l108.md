# SZLHOLDINGS/salad-ring-ouro-l108

## Resumen

salad-ring-ouro-l108 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina su "estate de IA gobernada": un conjunto de modelos, datasets y Spaces con trazabilidad documental. El repositorio de Hugging Face no incluye model card tecnica en sentido estricto, sino una tarjeta generada de forma automatica por su herramienta interna (`estate-cards weaver`) que describe el contexto organizativo, el estado de las "receipts" (ficheros de auditoria) y advierte explicitamente de que cualquier dato no registrado en esas receipts debe considerarse desconocido.

La informacion disponible no permite determinar la arquitectura, el numero de parametros, la longitud de contexto ni el proceso de entrenamiento del modelo. El autor declara que no afirma ningun resultado de benchmark mas alla de lo que una auditoria fechada haya medido, y la propia seccion de receipts indica que no existe un `DONE.json` estricto con estado MEASURED, por lo que la evidencia de evaluacion se marca como UNKNOWN. En la practica, esto significa que el modelo no es evaluable tecnicamente a partir de su model card.

Su relevancia actual es, por tanto, limitada y de naturaleza documental: sirve como ejemplo de publicacion de artefactos con enfasis en procedencia y honestidad declarativa, pero no aporta informacion suficiente para integrarlo en un pipeline de produccion ni para compararlo con alternativas. La licencia declarada es Apache 2.0, fijada por el equipo de operaciones del estate el 25 de noviembre de 2026 sin evidencia de licencia upstream por fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes SSM o cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa ni el vocabulario utilizado.

Respecto al entrenamiento, la tarjeta remite a las "receipt files" del estate para cualquier afirmacion sobre entrenamiento o evaluacion, pero la seccion RECEIPTS indica que no existe un `DONE.json` estricto con estado MEASURED, `eval_rc=0`, marca temporal y receipt de entrenamiento. El unico fichero con nombre de receipt encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio autor aclara que es una coincidencia por palabra clave y no evidencia validada. No se dispone de datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas.

## Capacidades

- No se han documentado capacidades funcionales del modelo en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No se especifican idiomas soportados.
- No se declaran capacidades especiales (modo thinking, vision, audio, decodificacion especulativa).
- La unica afirmacion verificable es que se trata de un "trained artifact" dentro de la factoria del autor, sin que se detalle que tipo de tarea resuelve.

## Casos de uso

- Auditoria de procedencia de artefactos: el repositorio puede usarse como ejemplo de publicacion con receipts y declaraciones de honestidad, util para equipos que disenen sus propias politicas de trazabilidad de modelos.
- Estudio de practicas de documentacion: sirve para analizar como una organizacion estructura la distincion entre datos MEASURED, REPORTED y UNKNOWN en sus fichas tecnicas.
- Pruebas de pipelines de descubrimiento de modelos: util para validar herramientas que ingieren repos de Hugging Face y deben manejar fichas sin especificaciones tecnicas.
- Verificacion de licencias: como caso de licencia fijada a nivel de estate sin evidencia upstream por fichero, sirve para probar flujos de revision legal automatizada.
- Docencia sobre evaluacion critica de modelos: permite ilustrar por que una model card sin parametros, contexto ni benchmarks no es suficiente para adoptar un modelo.
- No se recomienda su uso en aplicaciones de generacion de texto, codigo, atencion al cliente ni ningun otro escenario de produccion, dado que no hay evidencia tecnica que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y la seccion de receipts clasifica la evidencia de evaluacion como UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos compatible con estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa fiable porque se desconocen parametros, contexto, rendimiento y formato del modelo. A modo de referencia estructural, se compara con otros artefactos publicados con documentacion minima:

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-ring-ouro-l108 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativa de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni idiomas, el modelo no es evaluable ni desplegable de forma informada.
- Evidencia de evaluacion inexistente: la propia tarjeta marca el estado de evaluacion como UNKNOWN y no existe `DONE.json` estricto.
- Riesgo de alucinacion y sesgos: no evaluables, dado que no se ha medido el comportamiento del modelo.
- Licencia con caveat: Apache 2.0 fue fijada por el equipo de operaciones del estate el 25 de noviembre de 2026 sin evidencia de licencia upstream por fichero, lo que introduce incertidumbre sobre la cadena de derechos para uso comercial.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion externa.
- Documentacion generada automaticamente: la tarjeta procede de una herramienta interna (`estate-cards weaver v0.1.0`) y no de una revision tecnica humana.
- No apto para produccion: cualquier integracion requeriria primero obtener del autor las receipts de entrenamiento y evaluacion que la propia tarjeta declara ausentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l108
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards

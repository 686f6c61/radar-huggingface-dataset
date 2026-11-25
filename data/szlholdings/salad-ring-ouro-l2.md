# SZLHOLDINGS/salad-ring-ouro-l2

## Resumen

salad-ring-ouro-l2 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de repositorios con trazabilidad declarada y resultados verificables. El repositorio contiene pesos en formato safetensors con un tamano total de 1,2 GB y licencia apache-2.0. No se especifica arquitectura, numero de parametros ni longitud de contexto en la informacion disponible.

La model card es fundamentalmente un documento de gobernanza: describe el repositorio como un "trained artifact in the governed factory" y remite las afirmaciones de entrenamiento y evaluacion a ficheros de recibos (receipts) del denominado "estate mesh". El autor declara explicitamente que cualquier dato no respaldado por un recibo medido se marca como UNKNOWN, y la seccion RECEIPTS confirma que no existe un DONE.json estricto con evidencias de evaluacion medidas.

Por tanto, la relevancia practica del modelo es limitada a efectos de evaluacion tecnica: no hay benchmarks publicados, no se declaran idiomas soportados, no hay pipeline asociado y el repositorio registra cero descargas y cero likes en el momento de la consulta. Esta ficha documenta lo que el autor afirma y marca como no disponible todo lo que la informacion no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la informacion disponible. La model card no describe si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO.

El unico dato relevante sobre el proceso es de naturaleza procedimental: el autor declara que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos del estate mesh, y que la seccion RECEIPTS del repositorio se clasifica como RECEIPT_FILES_NO_DONE, es decir, existen ficheros con nombres de recibo pero no un DONE.json estricto con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. La evidencia de evaluacion se marca como UNKNOWN.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible.
- Razonamiento, codigo y matematicas: no confirmados.
- Vision o audio: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo thinking: no disponible.

No se puede afirmar ninguna capacidad concreta del modelo a partir de la informacion proporcionada. La model card no incluye ejemplos de uso, plantillas de prompt ni demostraciones.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas sin conocer arquitectura, tamano, contexto, idiomas ni capacidades del modelo. Los unicos escenarios plausibles a partir de los datos disponibles son de caracter administrativo o de auditoria:

- Auditoria de gobernanza de artefactos: el repositorio puede usarse como ejemplo de estructura de recibos y marcado de evidencia (MEASURED/REPORTED/UNKNOWN) en pipelines de trazabilidad de modelos.
- Verificacion de licencias en cadenas de suministro de modelos: la nota de licencia del estate documenta el proceso de asignacion de la etiqueta apache-2.0 con fecha y responsable, util para estudiar practicas de gestion de derechos.
- Pruebas de carga de safetensors: los 1,2 GB de pesos permiten validar herramientas de inspeccion de tensores y metadatos, aunque sin garantia de que el contenido sea un modelo funcional.
- Docencia sobre documentacion de modelos: la model card sirve como caso de estudio de una ficha que evita afirmaciones no respaldadas.
- Evaluacion de riesgos de adopcion: util para ilustrar por que un repositorio con cero descargas, sin pipeline y sin benchmarks no deberia integrarse en produccion.
- Analisis de ecosistema Hugging Face: ejemplo de repositorios generados automaticamente por herramientas de "weaving" de tarjetas.

Cualquier uso de inferencia real requeriria informacion que no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y la seccion RECEIPTS clasifica la evidencia de evaluacion como UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende de una arquitectura y un numero de parametros que no se declaran.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no determinable con los datos actuales.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponibles.

El unico dato objetivo es el tamano del repositorio (1,2 GB), que en safetensors en precision FP16 corresponderia a un orden de magnitud de cientos de millones de parametros, pero esta estimacion es especulativa y no debe tomarse como especificacion.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable sin conocer la categoria, el tamano y las capacidades del modelo. Los repositorios de la misma organizacion (familia "salad") comparten el mismo patron de documentacion y tampoco aportan especificaciones tecnicas verificables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-ring-ouro-l2 | no disponible | no disponible | no disponible | apache-2.0 | publico, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni idiomas declarados, el modelo no es evaluable tecnicamente.
- Sin evidencia de evaluacion: la seccion RECEIPTS marca la evidencia como UNKNOWN; no hay DONE.json estricto ni curvas medidas.
- Riesgo de que el artefacto no sea un modelo funcional: la model card se centra en gobernanza y estructura de recibos, no en uso de inferencia.
- Licencia: apache-2.0 permite uso comercial, pero la nota del estate aclara que no se reclama evidencia de licencia por fichero de origen, lo que introduce incertidumbre sobre la procedencia de los pesos.
- Sin pipeline ni ejemplos: no hay plantilla de prompt, tokenizer documentado ni demostracion de uso.
- Cero adopcion: 0 descargas y 0 likes reducen la probabilidad de validacion por terceros.
- Riesgo de alucinacion y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones.
- Fechas futuras en los metadatos (creacion 2026-11-17), lo que exige precaucion sobre la fiabilidad de la informacion del repositorio.
- No apto para produccion sin una auditoria independiente de pesos, tokenizer y comportamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas citada: https://github.com/szl-holdings/estate-cards

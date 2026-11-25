# SZLHOLDINGS/salad-ring-ouro-l100

## Resumen

salad-ring-ouro-l100 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados supuestamente verificables mediante recibos de auditoria. El repositorio no documenta arquitectura, numero de parametros, datos de entrenamiento ni resultados de evaluacion: la model card se limita a declarar la identidad del artefacto, referenciar su origen canonico en GitHub y describir el estado de sus ficheros de recibos.

La relevancia de esta ficha es, por tanto, fundamentalmente documental. La publicacion se presenta como un modelo entrenado ("trained artifact in the governed factory"), pero la propia tarjeta reconoce que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibos que no se han validado al estandar estricto del estate, y que cualquier dato no respaldado por un recibo se marca como UNKNOWN. El escaneo de recibos de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con estado MEASURED.

En consecuencia, no es posible determinar que problema resuelve el modelo ni verificar ninguna capacidad. Cualquier uso en produccion requeriria inspeccionar directamente los pesos y los recibos en el repositorio de origen antes de asumir nada sobre su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. La tarjeta describe el artefacto como un "trained artifact in the governed factory" del estate de SZLHOLDINGS, sin especificar si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La seccion de recibos del repositorio indica explicitamente que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos del mesh del estate y que cualquier cosa no respaldada por un recibo se considera UNKNOWN. El escaneo estricto de la "tranche-6 chunk-4" (22 de noviembre de 2026) confirma que no existe un DONE.json con status=MEASURED, eval_rc=0 y marca temporal, por lo que no hay evidencia de evaluacion validada. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio escaneo aclara que no esta validado como evidencia.

## Capacidades

- No se documenta ninguna capacidad funcional verificada en la informacion disponible.
- Generacion de texto, razonamiento, codigo, matematicas o vision: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Auditoria de artefactos de IA gobernada: el repositorio puede emplearse como caso de estudio de un pipeline de publicacion basado en recibos, revisando como el estate clasifica evidencia MEASURED frente a UNKNOWN antes de promover un modelo.
- Verificacion de procedencia en cadena de suministro de modelos: inspeccionar la trazabilidad entre el repositorio de Hugging Face, el origen canonico en GitHub y los ficheros de recibos para decidir si un artefacto es apto para un registro interno.
- Pruebas de integracion de infraestructura de despliegue: usar los pesos, una vez descargados, para validar pipelines de carga (vLLM, TGI, llama.cpp) sin asumir ninguna calidad de salida, unicamente como comprobacion de compatibilidad de formato.
- Formacion interna sobre licencias y gobierno de datos: el repositorio ilustra el caso de una licencia apache-2.0 asignada por operaciones del estate sin evidencia de licencia upstream por fichero, un escenario util para discutir riesgos de compliance.
- Evaluacion comparativa de modelos no documentados: serviria como entrada en un banco de pruebas propio donde el equipo mida capacidades por si mismo, dado que el autor no publica benchmarks.
- Docencia sobre documentacion de modelos: analizar la diferencia entre una model card con afirmaciones comercialmente atractivas y una con disciplina de evidencia estricta como la que declara este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos confirma que la evidencia de evaluacion es UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se confirma que los pesos esten publicados en safetensors, GGUF u otro formato, ni que existan configuraciones listas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse arquitectura, tamano, contexto ni rendimiento del modelo, no es posible identificar alternativas comparables de la misma categoria con criterio tecnico.

## Limitaciones y advertencias

- Ausencia total de especificaciones: sin arquitectura, parametros ni contexto publicados, no se puede dimensionar el coste de inferencia ni evaluar la idoneidad para ningun caso de uso.
- Sin evidencia de evaluacion: el escaneo estricto del estate clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia de evaluacion como UNKNOWN.
- Licencia sin respaldo upstream: la nota del estate indica que la etiqueta apache-2.0 fue asignada por operaciones el 25 de noviembre de 2026 y que no se reclama evidencia de licencia upstream por fichero; esto traslada al usuario el riesgo de compliance si los pesos derivan de material con otra licencia.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso a los pesos y sin documentacion de datos de entrenamiento.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, por lo que no se puede asumir un rendimiento aceptable en castellano ni en ninguna otra lengua.
- Estado de publicacion incompleto: cero descargas y cero likes en el momento de la consulta, y una tarjeta generada de forma automatica por la herramienta `estate-cards weaver` v0.1.0, sin contenido tecnico sustantivo.
- Recomendacion operativa: no desplegar en produccion sin una evaluacion propia sobre los pesos reales y sin verificar la procedencia y licencia de cada fichero.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l100
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Origen canonico en GitHub (organizacion): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas del estate: https://github.com/szl-holdings/estate-cards
- Recurso de la tarjeta (recibos, no validados): https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l100/blob/main/assets/szl-card/mesh-receipts.svg
- Recurso de la tarjeta (contexto del estate): https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l100/blob/main/assets/szl-card/org-context.svg

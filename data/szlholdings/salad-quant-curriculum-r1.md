# SZLHOLDINGS/salad-quant-curriculum-r1

## Resumen

salad-quant-curriculum-r1 es un artefacto de modelo publicado por SZLHOLDINGS, una organizacion que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces vinculados a fuentes y con resultados verificables. El repositorio tiene un tamano de 0,7 GB y contiene pesos en formato safetensors bajo licencia Apache 2.0. La model card no proporciona informacion sobre arquitectura, numero de parametros, longitud de contexto ni proceso de entrenamiento.

La caracteristica mas destacable de esta publicacion es su enfoque en la trazabilidad: la propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion debe residir en ficheros de "recibo" (receipts) del ecosistema del autor, y que todo lo que no este respaldado por esos recibos se marca como UNKNOWN. En la seccion de recibos se indica que no existe un fichero DONE.json estricto, por lo que la evidencia de evaluacion se clasifica como UNKNOWN.

Por tanto, se trata de un modelo del que no se pueden verificar capacidades, rendimiento ni datos de entrenamiento a partir de la informacion disponible. Su relevancia actual es limitada para produccion, pero resulta un ejemplo interesante de publicacion con enfasis en honestidad epistemica y ausencia de afirmaciones no medidas.

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
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM u otra) en la model card ni en los metadatos disponibles. El tamano del repositorio (0,7 GB) sugiere un modelo de pequeno o mediano tamano, pero no permite inferir el numero de parametros ni la precision de los pesos.

Respecto al entrenamiento, la model card indica que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro del ecosistema del autor, y que cualquier dato no respaldado por esos recibos se considera UNKNOWN. La seccion RECEIPTS senala que, en el escaneo estricto de 2026-11-22, no se encontro un fichero DONE.json que cumpla el estandar estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que la evidencia de evaluacion queda como UNKNOWN. No se dispone de informacion sobre volumen de tokens, composicion del dataset, RLHF, DPO ni innovaciones tecnicas.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking mode, vision, audio).
- La model card declara explicitamente que no se afirma ninguna capacidad sin recibos de evaluacion medidos, y que estos no estan presentes.

## Casos de uso

- Evaluacion de infraestructura de publicacion: el modelo puede servir como caso de estudio para disenar pipelines de publicacion de modelos con trazabilidad estricta, dado que la model card documenta el estandar de recibos (DONE.json con status=MEASURED, eval_rc=0 y timestamp) que el autor exige para afirmar resultados.
- Auditoria de licencias: util como ejemplo de practica de gobernanza de licencias, ya que la card incluye una nota explicita sobre la asignacion del tag apache-2.0 por parte del equipo de operaciones del estate y aclara que no se reclama evidencia de licencia por fichero upstream.
- Pruebas de integracion de formatos: al estar disponible en safetensors, puede usarse para validar pipelines de carga de pesos en frameworks como transformers o vLLM, siempre que se verifique primero la arquitectura real del artefacto.
- Docencia sobre honestidad en model cards: sirve como ejemplo de redaccion que distingue explicitamente entre datos MEASURED, REPORTED y UNKNOWN, sin inventar cifras.
- Verificacion de reproducibilidad: el identificador de tarjeta (7e3dcc1a635e53fd) y la marca temporal del snapshot de auditoria (2026-11-20T03:48:04Z) permiten comprobar la coherencia de la publicacion en el repositorio de origen.
- No se recomienda su uso en produccion para tareas de generacion, razonamiento o codigo sin una evaluacion independiente previa, dado que no hay evidencia de capacidades publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no se afirma ningun numero de benchmark mas alla de lo que una auditoria datada haya medido, y la seccion de recibos clasifica la evidencia de evaluacion como UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y la precision de los pesos.
- GPU recomendadas: no disponible.
- Encaje en GPU de consumo: no disponible; el tamano del repositorio (0,7 GB) es compatible con GPUs de consumo en terminos de almacenamiento, pero no se puede confirmar la viabilidad de inferencia sin conocer la arquitectura.
- Opciones de despliegue: no disponible; el formato safetensors es compatible con frameworks como transformers, vLLM o TGI, pero se requiere validar previamente la arquitectura y la tokenizer.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no permite identificar modelos comparables, ya que se desconocen parametros, contexto, tarea y rendimiento del modelo. Tampoco se han identificado alternativas dentro del mismo estate de SZLHOLDINGS con datos publicados que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de evidencia de evaluacion: la seccion RECEIPTS clasifica la evidencia como UNKNOWN al no existir un DONE.json estricto, por lo que no hay garantia de calidad ni de capacidades.
- Datos de arquitectura y entrenamiento no publicados: no es posible verificar el numero de parametros, la longitud de contexto ni la composicion del dataset.
- Riesgo de alucinacion: no evaluable, al no existir benchmarks ni pruebas publicadas.
- Sesgos conocidos: no documentados.
- Restricciones de licencia: la licencia es Apache 2.0, permisiva para uso comercial, pero la propia card aclara que el tag fue asignado por el equipo de operaciones del estate y que no se reclama evidencia de licencia por fichero upstream; conviene verificar la procedencia de los pesos antes de un uso comercial.
- Idiomas soportados: no disponibles, lo que impide garantizar un comportamiento adecuado en castellano u otros idiomas.
- Caveat para produccion: no se recomienda desplegar este artefacto en entornos productivos sin una evaluacion independiente y sin confirmar la integridad y procedencia de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-quant-curriculum-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards

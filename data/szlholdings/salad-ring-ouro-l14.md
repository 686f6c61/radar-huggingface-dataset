# SZLHOLDINGS/salad-ring-ouro-l14

## Resumen

`salad-ring-ouro-l14` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio no documenta arquitectura, numero de parametros, longitud de contexto ni datos de entrenamiento en su model card; la informacion disponible se limita a metadatos del repositorio y a notas internas sobre el proceso de auditoria del estate.

La model card es en si misma un documento generado automaticamente por una herramienta interna (`estate-cards weaver v0.1.0`) que produce SVG deterministicos a partir de una instantanea de auditoria fechada el 2026-11-20. El autor declara explicitamente una politica de honestidad: cualquier cifra no respaldada por un recibo medido se etiqueta como UNKNOWN, y no se afirma ningun resultado de benchmark en la propia tarjeta.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: se trata de un repositorio sin descargas ni likes en el momento de la consulta, sin pipeline declarado, sin idiomas declarados y sin evidencia de evaluacion en el estandar estricto del propio autor. Cualquier evaluacion tecnica del modelo es imposible con los datos publicos disponibles.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El nombre del artefacto (`salad-ring-ouro-l14`) sugiere una nomenclatura interna del estate de SZLHOLDINGS, pero el autor no la desglosa ni la relaciona con ninguna familia arquitectonica conocida (transformer denso, MoE, SSM o hibrido).

Respecto al entrenamiento, la seccion RECEIPTS de la tarjeta indica que el escaneo estricto de la tranche 6 (chunk 5, 2026-11-22) clasifico este repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`), pero no hay un `DONE.json` que cumpla el estandar estricto del estate (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). La evidencia de evaluacion se marca como UNKNOWN. No se documentan volumen de tokens, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- No se declara ninguna capacidad concreta en la informacion disponible.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de soporte de agentes ni razonamiento multi-paso.
- No hay idiomas declarados en los metadatos.
- No se documentan modos especiales (thinking mode, vision, audio).
- La unica afirmacion operativa del autor es que el artefacto pertenece a su fabrica gobernada y que las afirmaciones de calidad solo se haran cuando existan recibos medidos.

## Casos de uso

- Auditoria de gobernanza de artefactos: el repositorio puede usarse como ejemplo de implementacion de un esquema de recibos (receipts) para trazabilidad de modelos, aunque en este caso concreto el estandar estricto no se cumple.
- Verificacion de pipelines de publicacion: util para estudiar como una organizacion etiqueta estados MEASURED/REPORTED/UNKNOWN y genera tarjetas deterministas a partir de instantaneas de auditoria.
- Evaluacion de politicas de licenciamiento: la nota de licencia (tag apache-2.0 fijado el 2026-11-25 por operaciones del estate, sin evidencia upstream por fichero) sirve como caso de estudio de decisiones de derechos sin respaldo documental.
- Docencia sobre reproducibilidad: permite ilustrar la diferencia entre "fichero con nombre de recibo" y "recibo valido" en un proceso de auditoria.
- Integracion en catalogos internos: un equipo podria indexar el repositorio como artefacto no evaluado y marcarlo como no apto para produccion hasta que exista `DONE.json`.
- Monitorizacion de deriva documental: seguimiento de actualizaciones de la tarjeta (creada el 2026-11-18, actualizada el 2026-11-25) para detectar cuando aparezca evidencia medida.

No se pueden proponer casos de uso de inferencia (generacion de texto, codigo, atencion al cliente) porque no hay informacion sobre las capacidades del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y en este repositorio la evidencia de evaluacion figura como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse arquitectura, parametros ni contexto, no es posible establecer una comparacion significativa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Evidencia de evaluacion |
|---|---|---|---|---|
| salad-ring-ouro-l14 | no disponible | no disponible | apache-2.0 | UNKNOWN (sin DONE.json estricto) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede determinar tamano, contexto ni arquitectura, lo que impide planificar despliegue o estimar costes.
- Falta de evidencia de evaluacion: el propio autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`; el fichero `mesh-receipts.svg` es una coincidencia por palabra clave, no un recibo validado.
- Licencia con caveat: el tag apache-2.0 se fijo el 2026-11-25 por operaciones del estate "sin evidencia de licencia upstream por fichero". Esto introduce riesgo juridico para uso comercial, ya que la procedencia de los pesos no esta documentada.
- Sin idiomas declarados: no se puede asumir soporte multilingue ni siquiera en ingles.
- Sin pipeline declarado en Hugging Face: la plataforma no reconoce una tarea de inferencia asociada.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo ni a datos de entrenamiento.
- Cero adopcion observable (0 descargas, 0 likes en el momento de la consulta): no hay senal de uso en la comunidad ni de validacion independiente.
- Fechas de creacion y actualizacion (noviembre de 2026) posteriores a la mayoria de instantaneas de referencia habituales; conviene verificar la coherencia temporal de los metadatos antes de citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l14
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards

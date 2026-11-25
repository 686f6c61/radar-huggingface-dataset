# SZLHOLDINGS/salad-ring-ouro-l105

## Resumen

salad-ring-ouro-l105 es un modelo publicado por SZLHOLDINGS dentro de su catalogo de "estate" de IA gobernada, una coleccion de modelos, datasets y Spaces con trazabilidad declarada. El repositorio de Hugging Face existe y esta etiquetado con licencia Apache 2.0, pero la model card no proporciona ninguna especificacion tecnica del artefacto: no indica arquitectura, numero de parametros, longitud de contexto, datos de entrenamiento ni idiomas soportados.

La informacion disponible se limita a metadatos de gobernanza: identificador del repositorio, fecha de creacion (2026-11-19), fecha de actualizacion (2026-11-25), autoria de SZLHOLDINGS y una nota de licencia que indica que la etiqueta apache-2.0 fue fijada por operaciones del estate el 2026-11-25 sin evidencia de licencia por fichero del upstream. La propia model card declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion no registrada en sus ficheros de recibo se considera UNKNOWN.

El resultado practico es que el modelo no es evaluable tecnicamente con la informacion publicada. Un escaneo estricto de recibos (receipts-tranche-6, chunk-4, 2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con estado MEASURED, codigo de evaluacion cero y marca temporal. No hay evidencia de evaluacion de calidad ni de capacidad, y el propio autor lo reconoce en la seccion de honestidad de la card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (etiqueta fijada por el estate el 2026-11-25, sin evidencia de licencia upstream por fichero) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de parametros, la longitud de contexto nativa, la tokenizacion empleada ni la composicion del vocabulario.

Respecto al entrenamiento, la card no aporta numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La seccion de honestidad del autor declara que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibo del estate y que cualquier dato no registrado alli es UNKNOWN. El escaneo estricto de recibos del 2026-11-22 confirma que no existe un DONE.json que valide evidencia de evaluacion, por lo que no hay base para afirmar nada sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto: no confirmada. No hay evidencia publicada de que el artefacto sea un modelo de lenguaje funcional ni de que pueda ejecutarse.
- Razonamiento, codigo y matematicas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio esta vacio.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Trazabilidad declarada: el autor afirma que el modelo forma parte de un estate con resultados "receipted, checkable", pero el escaneo estricto no encuentra evidencia validada de capacidad.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones tecnicas verificadas. Los siguientes escenarios son los unicos que la informacion publicada permite plantear, y en todos ellos el modelo se usaria como artefacto de estudio y no como componente de produccion:

- Auditoria de gobernanza de artefactos: usar el repositorio como caso de estudio de como un estate declara estados MEASURED/REPORTED/UNKNOWN y como un escaneo estricto de recibos puede detectar artefactos sin evidencia de evaluacion.
- Investigacion sobre trazabilidad en Hugging Face: analizar la diferencia entre ficheros con nombre de recibo y un DONE.json estricto con estado medido, usando este repositorio como ejemplo de RECEIPT_FILES_NO_DONE.
- Verificacion de licencias: estudiar el patron de etiquetado de licencia fijado por operaciones del estate sin evidencia upstream por fichero, util para disenar politicas de compliance en catalogos de modelos.
- Docencia sobre model cards: emplear la card como ejemplo de documentacion que declara explicitamente UNKNOWN en lugar de inventar numeros, y discutir sus carencias (falta de arquitectura, parametros y contexto).
- Pruebas de pipelines de evaluacion: usar el repositorio como entrada negativa en un pipeline que deba rechazar modelos sin evidencia medida antes de desplegarlos.
- Monitorizacion de catalogos: rastrear la evolucion del repositorio (creado 2026-11-19, actualizado 2026-11-25) para detectar si en el futuro se anaden recibos medidos que permitan reevaluar el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos del 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin conocer el numero de parametros ni el formato de pesos no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. No se declara formato de pesos ni pipeline de inferencia en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoria, el tamano y la tarea del artefacto. La informacion publicada no permite situarlo en ninguna familia de modelos (LLM denso, MoE, modelo multimodal u otro).

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declara arquitectura, parametros, contexto, tokenizador ni formato de pesos, lo que impide cualquier evaluacion tecnica.
- Sin evidencia de evaluacion: el escaneo estricto de recibos clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN. No hay ninguna medicion de calidad o capacidad.
- Licencia con caveat: la etiqueta apache-2.0 fue fijada por operaciones del estate el 2026-11-25 sin evidencia de licencia upstream por fichero. Antes de un uso comercial conviene verificar la procedencia real de los pesos y datos.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo y sin resultados de evaluacion publicados.
- Idiomas: el campo de idiomas del repositorio esta vacio, por lo que no hay garantia de soporte de castellano ni de ningun otro idioma.
- Estado del artefacto: con cero descargas y cero likes en el momento de la consulta, no hay senales de uso ni de validacion por parte de la comunidad.
- Recomendacion: no desplegar en produccion sin obtener del autor la model card tecnica completa y los recibos de evaluacion medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l105
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards

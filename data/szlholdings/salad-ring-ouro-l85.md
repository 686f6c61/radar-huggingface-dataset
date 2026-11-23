# SZLHOLDINGS/salad-ring-ouro-l85

## Resumen

`salad-ring-ouro-l85` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados auditables y "receipts" (registros de evidencia) verificables. El repositorio se presenta como un modelo entrenado dentro de su "governed factory", pero la model card no aporta informacion tecnica sobre la arquitectura, el tamano, los datos de entrenamiento ni las capacidades del modelo.

La publicacion es relevante no por sus prestaciones (que no estan documentadas) sino como ejemplo de practica de documentacion basada en evidencia: el autor etiqueta explicitamente cada dato como MEASURED, REPORTED o UNKNOWN y declara que cualquier afirmacion de calidad o capacidad queda en UNKNOWN mientras no exista un fichero de evaluacion estricto (`DONE.json` con `status=MEASURED`, `eval_rc=0`, marca temporal y receipt de entrenamiento). Segun el propio escaneo del repositorio, ese fichero no existe, por lo que la evidencia de evaluacion es UNKNOWN.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no incluye pesos ni configuracion visibles en la informacion disponible. Todos los datos tecnicos de esta ficha se marcan por tanto como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida) en la model card ni en los metadatos del repositorio. Tampoco se indica el numero de parametros, la longitud de contexto, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La model card hace referencia a "receipt files" y a un "estate mesh" donde supuestamente residen las afirmaciones de entrenamiento y evaluacion, pero el unico fichero con nombre de receipt encontrado en el repositorio es `assets/szl-card/mesh-receipts.svg`, que el propio escaneo del autor clasifica como "keyword match, not validated as evidence". El escaneo estricto del 2026-11-22 concluye con la clase `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de receipt, pero no existe un `DONE.json` que cumpla el umbral estricto. En consecuencia, no hay evidencia medida de entrenamiento ni de evaluacion.

## Capacidades

- No se documenta ninguna capacidad concreta (generacion de texto, razonamiento, codigo, matematicas o vision) en la informacion disponible.
- No se indica soporte de tool calling ni de function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni idiomas soportados.
- No se mencionan modos especiales (thinking mode, vision, audio) ni tecnicas de decodificacion especulativa.
- La unica afirmacion explicita del autor es negativa: no se hace ninguna afirmacion de calidad o capacidad sin receipts de evaluacion medidos.

## Casos de uso

- Auditoria de practicas de documentacion de modelos: el repositorio puede usarse como caso de estudio de un esquema de publicacion basado en evidencia etiquetada (MEASURED/REPORTED/UNKNOWN) con marcas temporales y verificacion en origen; es adecuado porque la propia card explicita el criterio y su estado actual.
- Evaluacion de infraestructura de "receipts": util para probar herramientas que escanean repositorios en busca de ficheros de evidencia estrictos (`DONE.json` con `status=MEASURED`, `eval_rc=0` y timestamp), ya que este repo representa el caso `RECEIPT_FILES_NO_DONE`.
- Verificacion de procedencia y trazabilidad: el campo "Canonical source" apunta a la organizacion `szl-holdings` en GitHub, lo que permite practicar flujos de comprobacion de origen de artefactos antes de incorporarlos a un catalogo interno.
- Formacion sobre limites de la documentacion automatica: la card esta generada por una herramienta ("estate-cards weaver v0.1.0", Python de biblioteca estandar, SVG determinista) y sirve para ilustrar que la generacion automatica de fichas no sustituye a la evidencia medida.
- Monitorizacion de repositorios de modelos: util como entrada de prueba en pipelines que detectan publicaciones sin licencia, sin idiomas declarados y sin pesos, para bloquear su promocion a entornos de produccion.
- Investigacion sobre gobernanza de IA: el esquema de receipts y el etiquetado de honestidad pueden analizarse como propuesta de gobernanza, comparandolo con model cards convencionales y con iniciativas de transparencia de modelos.

No se documentan casos de uso de inferencia (generacion de texto, codigo, atencion al cliente, RAG u otros) porque no hay evidencia de que el artefacto sea desplegable ni de que existan pesos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto del 2026-11-22 clasifica la evidencia de evaluacion como UNKNOWN al no existir un `DONE.json` que cumpla el umbral.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros y el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan pesos ni formatos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoria de comparacion (tamano, tarea, arquitectura) porque la informacion publicada no incluye parametros, contexto, licencia ni resultados de evaluacion. Cualquier comparacion con modelos concretos seria especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: sin arquitectura, parametros, contexto ni formato de pesos, el modelo no es evaluable ni desplegable a partir de la informacion disponible.
- Sin licencia declarada: no puede asumirse permiso de uso comercial, redistribucion ni modificacion; en ausencia de licencia, el uso por defecto es incierto y requiere contacto con el autor.
- Sin idiomas declarados: no puede garantizarse cobertura linguistica alguna, incluido el castellano.
- Evidencia de evaluacion UNKNOWN: el propio escaneo del autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de receipt pero no cumplen el umbral estricto de evidencia medida.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni evaluaciones publicadas; no se han publicado analisis de sesgo.
- Cero adopcion observable (0 descargas, 0 likes): no hay senales de uso comunitario, validacion externa ni informes de terceros.
- Fechas de creacion y actualizacion (2026-11-19 y 2026-11-23) y auditorias citadas (2026-11-20, 2026-11-22) deben tratarse como datos declarados por el autor, no verificados de forma independiente en esta ficha.
- La model card esta generada por una herramienta automatica; parte de su contenido son graficos SVG deterministas y referencias a un "estate mesh" externo que no se detalla en la informacion disponible.
- No debe promocionarse este artefacto a produccion sin antes obtener del autor la licencia, los pesos, la configuracion y receipts de evaluacion medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l85
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica declarada (organizacion en GitHub): https://github.com/szl-holdings
- Herramienta generadora de cards citada: https://github.com/szl-holdings/estate-cards
- Recurso de evidencia citado en la card: `assets/szl-card/mesh-receipts.svg` (dentro del propio repositorio)
- Recurso de contexto citado en la card: `assets/szl-card/org-context.svg` (dentro del propio repositorio)

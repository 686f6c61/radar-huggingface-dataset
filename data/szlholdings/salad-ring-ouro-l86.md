# SZLHOLDINGS/salad-ring-ouro-l86

## Resumen

`salad-ring-ouro-l86` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face existe, está fechado en noviembre de 2026 y se presenta como un modelo entrenado de la factoría interna de la organización, pero la model card no aporta ninguna especificación tecnica del artefacto: no declara arquitectura, tamano, contexto, idiomas ni licencia.

La informacion disponible es fundamentalmente organizativa y de procedencia, no tecnica. La propia model card establece una politica de honestidad explicita: cualquier afirmacion sobre entrenamiento o evaluacion debe vivir en ficheros de recibo fechados, y lo que no este receiptado se marca como UNKNOWN. El escaneo de recibos citado en la card (tranche 6, chunk 9, 2026-11-22) clasifica el repo como RECEIPT_FILES_NO_DONE, es decir, hay ficheros con nombre de recibo pero no existe un DONE.json estricto con `status=MEASURED`, `eval_rc=0` y marca temporal, por lo que la evidencia de evaluacion se declara UNKNOWN.

Por tanto, esta ficha no puede evaluar el modelo como tal, sino documentar su estado de publicacion: un artefacto sin pipeline declarado, sin descargas, sin likes y sin metricas verificables. Es relevante ahora unicamente como caso de trazabilidad y gobernanza de artefactos de IA, no como candidato de despliegue. Los resultados de busqueda web devueltos no guardan relacion con el modelo (tratan de ingenieria genetica) y se descartan como fuente.

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
| Formato de pesos | no disponible |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-19 |
| Ultima actualizacion | 2026-11-23 |
| Region declarada | us |
| Estado de evidencia | RECEIPT_FILES_NO_DONE (sin DONE.json estricto) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante, ni aporta numero de parametros, tokens de entrenamiento, composicion del dataset o tecnicas de alineacion como RLHF o DPO.

Lo unico documentado es el marco de gobernanza: el artefacto forma parte de una "governed factory" con fuente canonica en la organizacion de GitHub `szl-holdings` y con graficos SVG deterministas generados a partir de una instantanea de auditoria fechada el 2026-11-20T03:48:04Z etiquetada como MEASURED. La card indica que las afirmaciones de entrenamiento y evaluacion deben residir en ficheros de recibo del mesh del estate, y que cualquier dato ausente se marca como UNKNOWN en lugar de inventarse. El escaneo estricto no encontro el recibo DONE.json requerido, de modo que no hay evidencia medida de entrenamiento ni de evaluacion para este artefacto.

## Capacidades

- No se declara ninguna capacidad funcional del modelo en la informacion disponible.
- No hay indicacion de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay indicacion de soporte de tool calling ni function calling.
- No hay indicacion de capacidades agenticas o de razonamiento multi-paso.
- No hay indicacion de cobertura multilingue.
- No hay indicacion de modos especiales (thinking mode, audio, multimodalidad).
- La unica capacidad demostrada por el repositorio es la de publicar artefactos con trazabilidad de recibos y graficos SVG deterministas generados con la libreria estandar de Python.

## Casos de uso

- Auditoria de procedencia de artefactos: usar el repositorio como ejemplo de publicacion con ficheros de recibo y marcas temporales para verificar la cadena de custodia de un modelo dentro de una organizacion.
- Gobernanza de modelos internos: emplear el esquema de la card (etiquetas MEASURED/REPORTED/UNKNOWN, DONE.json estricto) como plantilla para exigir evidencia medida antes de promover un modelo a produccion.
- Formacion en trazabilidad: utilizar el caso RECEIPT_FILES_NO_DONE como ejemplo didactico de por que la presencia de ficheros con nombre de recibo no equivale a evidencia valida.
- Integracion en pipelines de verificacion: conectar el escaneo estricto de recibos a un CI que bloquee la publicacion de artefactos sin `eval_rc=0` ni marca temporal.
- Catalogacion de estates de IA: registrar el artefacto en un inventario interno con su estado de evidencia para distinguir modelos desplegables de modelos meramente publicados.
- Analisis de ecosistema en Hugging Face: estudiar patrones de repositorios con cero descargas y cero likes para caracterizar publicaciones de bajo uso o de ambito organizativo cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos concluye que la evidencia de evaluacion es UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoria, el tamano y la tarea del artefacto, y la informacion publicada no permite situarlo frente a alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-ring-ouro-l86 | no disponible | no disponible | no disponible | no disponible | Repo HF publico, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas: no se puede planificar despliegue, estimar coste ni evaluar idoneidad.
- Sin licencia declarada: no hay base legal explicita para uso comercial ni para redistribucion.
- Sin evidencia de evaluacion medida: el escaneo estricto clasifica el repo como RECEIPT_FILES_NO_DONE y marca la evidencia como UNKNOWN.
- Riesgo de alucinacion y sesgos: no evaluables al no existir informacion sobre entrenamiento, datos ni alineacion.
- Idiomas y contexto desconocidos: imposible garantizar cobertura linguistica o conversaciones de contexto largo.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Los resultados de busqueda web asociados no son pertinentes (tratan de ingenieria genetica) y no deben usarse como fuente sobre el modelo.
- Cualquier uso en produccion requeriria primero obtener del autor la model card completa, la licencia y los recibos de evaluacion estrictos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l86
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canonica en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generacion de cards (referenciada en la card): https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l5

## Resumen

salad-ring-ouro-l5 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un catalogo de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo verificables). El repositorio de Hugging Face no contiene informacion tecnica sobre el modelo en si: ni arquitectura, ni numero de parametros, ni longitud de contexto, ni datos de entrenamiento. La model card se limita a describir la identidad del repositorio, el contexto de la organizacion y el estado de las evidencias de auditoria.

La propia model card declara explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion reside en ficheros de recibo externos y que lo no documentado se etiqueta como UNKNOWN. La seccion de recibos indica que en el escaneo estricto del 22 de noviembre de 2026 el repositorio se clasifico como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con estado MEASURED, codigo de evaluacion cero y marca temporal. La evidencia de evaluacion figura como UNKNOWN.

Por tanto, esta ficha solo puede documentar lo que el repositorio afirma sobre si mismo. No es posible verificar capacidades, rendimiento ni requisitos de hardware a partir de la informacion disponible, y cualquier uso en produccion requeriria inspeccionar directamente los pesos y los ficheros de recibo del repositorio.

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

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No consta si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La model card menciona que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibo" dentro de la malla del estate, y que cualquier dato no documentado alli se etiqueta como UNKNOWN. El escaneo estricto de recibos del 22 de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE, lo que significa que no hay evidencia de evaluacion validada al estandar estricto de la organizacion. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que la propia card advierte que es una coincidencia por palabra clave y no evidencia validada.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No consta soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta informacion sobre capacidades multilingues.
- No consta ningun modo especial (thinking mode, vision, audio u otros).

## Casos de uso

No es posible recomendar casos de uso concretos sin informacion verificable sobre las capacidades del modelo. Los siguientes escenarios son genericos y requeririan validacion previa contra los pesos reales y los recibos de evaluacion:

- Evaluacion interna de artefactos de la organizacion: inspeccionar el repositorio y sus ficheros de recibo para determinar si el modelo cumple el estandar de evidencia antes de cualquier integracion.
- Auditoria de gobernanza de IA: usar la estructura de recibos y la clasificacion RECEIPT_FILES_NO_DONE como ejemplo de trazabilidad documental en procesos de cumplimiento.
- Experimentacion controlada en laboratorio: cargar los pesos en un entorno aislado para determinar arquitectura, tamano y comportamiento real antes de plantear cualquier uso.
- Investigacion sobre catalogos de modelos: estudiar como una organizacion estructura la publicacion de artefactos con evidencia verificable y etiquetado explicito de datos desconocidos.
- Pruebas de pipelines de evaluacion: emplear el repositorio como caso de prueba para herramientas que verifican la presencia y validez de ficheros DONE.json y recibos de evaluacion.
- Formacion y documentacion: utilizar la model card como ejemplo de comunicacion honesta sobre ausencia de datos medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos clasifica la evidencia de evaluacion como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamano del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse la arquitectura, el tamano y las capacidades del modelo, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de especificaciones tecnicas publicadas: no se conoce arquitectura, tamano, contexto, idiomas ni formato de pesos.
- Evidencia de evaluacion clasificada como UNKNOWN: no existe un DONE.json estricto con estado MEASURED que respalde ninguna afirmacion de calidad o capacidad.
- Licencia no disponible: no puede determinarse si el uso comercial esta permitido, lo que impide su adopcion en produccion sin aclaracion previa.
- Riesgo elevado de comportamiento impredecible: sin documentacion de entrenamiento ni de alineacion, no hay base para estimar sesgos, alucinacion o robustez.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- La model card contiene contenido generado automaticamente por herramientas de la propia organizacion, con marcas temporales futuras respecto a la fecha habitual de publicacion; conviene verificar la coherencia de esas marcas antes de citar el artefacto.
- Cualquier uso en produccion deberia ir precedido de una inspeccion directa de los pesos y de los ficheros de recibo del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l5
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de cards: https://github.com/szl-holdings/estate-cards

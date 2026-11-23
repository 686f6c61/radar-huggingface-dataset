# SZLHOLDINGS/salad-ring-ouro-l7

## Resumen

salad-ring-ouro-l7 es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face, dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo auditables). El repositorio se creo el 17 de noviembre de 2026 y se actualizo por ultima vez el 23 de noviembre de 2026, sin descargas ni likes registrados en el momento de la consulta.

La model card no proporciona informacion tecnica sustantiva: no declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni pipeline. La mayor parte del contenido es metainformacion sobre el proceso de generacion de la propia tarjeta (SVG deterministas generados con la libreria estandar de Python, identificadores de tarjeta, sellos de tiempo de auditoria) y sobre el estandar de evidencia del autor, que etiqueta cada dato como MEASURED, REPORTED o UNKNOWN.

El propio autor reconoce en la seccion RECEIPTS que el repositorio se clasifica como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo, pero no hay un DONE.json estricto con estado MEASURED, codigo de salida de evaluacion cero y recibo de entrenamiento. En consecuencia, la evidencia de evaluacion figura como UNKNOWN. Cualquier dato de capacidad, rendimiento o entrenamiento debe considerarse no disponible hasta que el autor publique recibos medidos verificables.

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
| Formato de pesos | no disponible (el repositorio referencia un SVG en `assets/szl-card/`; no se declaran ficheros de pesos) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos de Hugging Face. No consta si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura hibrida o cualquier otra variante. Tampoco se declara el numero de parametros, la tokenizacion empleada ni la ventana de contexto.

Respecto al entrenamiento, la tarjeta indica de forma explicita que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibo del "estate mesh", y que cualquier cosa no documentada alli es UNKNOWN. El escaneo de recibos de la tranche 6 (chunk 8, 22 de noviembre de 2026) clasifica el repositorio como RECEIPT_FILES_NO_DONE: no hay un DONE.json estricto con `status=MEASURED`, `eval_rc=0`, sello de tiempo y recibo de entrenamiento. El unico fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio autor aclara que es una coincidencia por palabra clave y no evidencia validada. No se dispone, por tanto, de datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones de decodificacion.

## Capacidades

- Generacion de texto: no disponible; la model card no declara ninguna capacidad funcional.
- Razonamiento, codigo y matematicas: no disponible.
- Vision, audio o multimodalidad: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas figuran como no disponibles en los metadatos).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Gobernanza y trazabilidad: la unica caracteristica documentada es la pertenencia a un "estate" con estandares de evidencia etiquetados (MEASURED/REPORTED/UNKNOWN) y generacion determinista de artefactos de tarjeta.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas sin conocer la arquitectura, el tamano, la licencia ni las capacidades del modelo. La informacion disponible no permite justificar ningun escenario de despliegue en produccion. A modo de orientacion sobre que falta para poder evaluarlo:

- Evaluacion comparativa: requeriria parametros, contexto y resultados de benchmarks medidos, ninguno de los cuales esta publicado.
- Despliegue en inferencia: requeriria conocer el formato de pesos (safetensors, GGUF u otro) y los requisitos de VRAM; el repositorio no declara ficheros de pesos.
- Integracion en pipelines de codigo o atencion al cliente: requeriria evidencia de tool calling y de calidad medida; la tarjeta no la aporta.
- Uso comercial: requeriria una licencia explicita; figura como no disponible.
- Audiencia multilingue: requeriria declaracion de idiomas; no consta.
- Investigacion reproducible: requeriria recibos de entrenamiento y evaluacion validados; el escaneo los clasifica como ausentes en el estandar estricto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma explicitamente que no se aserta ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de 22 de noviembre de 2026 marca la evidencia de evaluacion como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declaran formatos de pesos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Sin parametros, contexto, licencia ni benchmarks publicados, no es posible establecer una comparacion fundamentada con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| salad-ring-ouro-l7 | no disponible | no disponible | no disponible | no disponible | repositorio en HF sin pesos declarados |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto, tokenizador ni formato de pesos, lo que impide cualquier evaluacion tecnica.
- Evidencia de evaluacion inexistente en el estandar del propio autor: el escaneo clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluacion como UNKNOWN.
- Licencia no disponible: no puede asumirse uso comercial ni redistribucion; cualquier despliegue en produccion queda bloqueado hasta que el autor publique terminos.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otros idiomas sin validacion.
- Riesgo de alucinacion: no evaluable sin benchmarks ni documentacion de alineacion.
- Sesgos conocidos: no documentados.
- Metadatos atipicos: el repositorio incluye unicamente la etiqueta `region:us` y no declara pipeline; la mayor parte de la tarjeta describe el proceso de generacion de la propia tarjeta, no el modelo.
- Trazabilidad incompleta: se referencia una organizacion canonica en GitHub (`szl-holdings`) y un generador de tarjetas (`estate-cards`), pero no se aportan enlaces directos verificables a recibos de entrenamiento o evaluacion en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l7
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion canonica en GitHub (referenciada en la tarjeta): https://github.com/szl-holdings
- Generador de tarjetas del estate (referenciado en la tarjeta): https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o repositorio adicional: no disponible

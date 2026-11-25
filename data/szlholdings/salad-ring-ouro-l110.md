# SZLHOLDINGS/salad-ring-ouro-l110

## Resumen

`salad-ring-ouro-l110` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante recibos de auditoria. El repositorio se presenta como un "modelo entrenado" dentro de una factoria gobernada, con licencia Apache 2.0 y generacion automatica de tarjetas mediante la herramienta interna `estate-cards weaver`.

La model card no proporciona informacion sustantiva sobre la arquitectura, el tamano, la longitud de contexto, los datos de entrenamiento ni las capacidades del modelo. Toda la documentacion gira en torno al sistema de evidencias de la organizacion: se distingue explicitamente entre valores MEASURED (medidos), REPORTED (reportados) y UNKNOWN (desconocidos), y se indica que cualquier afirmacion de entrenamiento o evaluacion debe residir en los ficheros de recibo del "estate mesh", no en la tarjeta.

El resultado de la auditoria mas reciente (tranche 6, chunk 4, 22 de noviembre de 2026) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo, pero no un `DONE.json` estricto con estado MEASURED, codigo de salida de evaluacion cero y marca temporal. La evidencia de evaluacion se declara UNKNOWN. En consecuencia, no es posible extraer de la informacion disponible ninguna especificacion tecnica fiable del modelo.

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

No se ha publicado informacion sobre la arquitectura del modelo en la documentacion disponible. La model card no especifica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un diseno hibrido, ni indica el numero de parametros, la ventana de contexto o la tokenizacion empleada.

Respecto al entrenamiento, la tarjeta afirma que las afirmaciones de entrenamiento y evaluacion de este artefacto residen en sus ficheros de recibo dentro del "estate mesh" de la organizacion, y que cualquier dato no recibido en la propia tarjeta se considera UNKNOWN. La auditoria estricta de 22 de noviembre de 2026 no encontro un `DONE.json` que cumpliese el umbral de evidencia (estado MEASURED, `eval_rc=0`, marca temporal y recibo de entrenamiento), por lo que no hay constancia verificable del proceso de entrenamiento, del volumen de tokens, de la composicion del dataset ni de si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- No se declara ninguna capacidad concreta en la informacion disponible.
- No hay evidencia de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de idiomas soportados.
- No hay evidencia de modos especiales (thinking mode, audio, vision u otros).

## Casos de uso

No es posible recomendar casos de uso concretos para este modelo a partir de la informacion disponible, ya que no se ha publicado ninguna capacidad, especificacion o resultado de evaluacion verificable. Cualquier escenario de produccion requeriria primero confirmar la naturaleza del artefacto (pesos, tokenizador, configuracion) y obtener recibos de evaluacion medidos. Los unicos usos defendibles hoy son de caracter exploratorio:

- Auditoria de la cadena de custodia: inspeccionar el repositorio para verificar el estado de los recibos (`RECEIPT_FILES_NO_DONE`) y comprobar si el artefacto cumple el estandar interno de evidencia de SZL Holdings antes de cualquier uso.
- Evaluacion de gobernanza de artefactos: usar el repositorio como caso de estudio de como una organizacion documenta (o no) la trazabilidad de un modelo publicado en Hugging Face.
- Verificacion de licencia: revisar la nota de licencia de la semana 45 (W45Z), que fija Apache 2.0 por precedente interno sin evidencia de licencia upstream por fichero, antes de cualquier redistribucion.
- Integracion en pipelines de validacion: incorporar el repositorio a un proceso automatizado que exija un `DONE.json` estricto antes de promover un modelo a entornos de staging.
- Analisis de reproducibilidad: contrastar la tarjeta generada (`estate-cards weaver v0.1.0`, id `03596806e44c88d1`) con el snapshot de auditoria de 2026-11-20T03:48:04Z para comprobar la coherencia de las marcas temporales.
- Formacion interna: emplear la distincion MEASURED/REPORTED/UNKNOWN de esta tarjeta como ejemplo de buenas practicas de honestidad documental en la publicacion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que la evidencia de evaluacion es UNKNOWN al no existir un `DONE.json` estricto, y que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que el repositorio contenga pesos en formato safetensors, GGUF o cualquier otro.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse el tamano, la arquitectura y las capacidades del modelo, no es posible identificar alternativas comparables de la misma categoria.

## Limitaciones y advertencias

- Ausencia de evidencia medida: la auditoria estricta clasifica el repositorio como `RECEIPT_FILES_NO_DONE` y declara la evidencia de evaluacion como UNKNOWN; no hay `DONE.json` con estado MEASURED ni recibo de entrenamiento validado.
- Opacidad tecnica: la tarjeta no documenta arquitectura, parametros, contexto, tokenizador ni formato de pesos, lo que impide evaluar su idoneidad para cualquier tarea.
- Licencia sin evidencia upstream: la nota de licencia W45Z indica que la etiqueta Apache 2.0 se fijo por decision interna de operaciones (precedente de dataset rank-1 del estate) y que no se reclama evidencia de licencia upstream por fichero; esto introduce riesgo juridico en redistribucion o uso comercial.
- Riesgo de alucinacion y sesgos: no evaluables sin pesos ni evaluaciones publicadas.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de uso por parte de la comunidad.
- Fechas anomalas: la creacion (2026-11-19) y la actualizacion (2026-11-25) son posteriores a la fecha actual, lo que conviene verificar antes de tomar cualquier decision basada en la cronologia del repositorio.
- Generacion automatica: la tarjeta fue producida por una herramienta interna (`estate-cards weaver v0.1.0`), no por el equipo de modelado, lo que refuerza la necesidad de acudir a las fuentes primarias de evidencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l110
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards

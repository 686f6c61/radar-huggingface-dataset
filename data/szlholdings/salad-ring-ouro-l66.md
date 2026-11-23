# SZLHOLDINGS/salad-ring-ouro-l66

## Resumen

`salad-ring-ouro-l66` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organizacion denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados documentados mediante ficheros de recibos (receipts). El repositorio existe en Hugging Face desde el 19 de noviembre de 2026 y fue actualizado el 23 de noviembre de 2026, pero la model card no describe ninguna arquitectura, tamano de parametros, ventana de contexto ni proceso de entrenamiento.

La informacion disponible es practicamente nula desde el punto de vista tecnico: no hay pipeline declarado, no hay licencia especificada, no hay idiomas indicados y no se ha publicado ningun resultado de evaluacion medido. La propia model card reconoce explicitamente que cualquier afirmacion sobre entrenamiento o evaluacion queda marcada como UNKNOWN (desconocida) hasta que exista un recibo de evaluacion estricto, y el escaneo de recibos de la familia "salad" clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, es decir, con ficheros de nombre similar a recibos pero sin el `DONE.json` estricto que la organizacion exige como evidencia.

Por tanto, esta ficha documenta un artefacto sin especificaciones verificables. Es relevante unicamente como ejemplo de publicacion con trazabilidad declarada pero sin evidencia medida, y no debe evaluarse como modelo utilizable en produccion hasta que el autor publique especificaciones y recibos de evaluacion verificables.

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

No se ha publicado informacion sobre la arquitectura del modelo. La model card no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con componentes de espacio de estados (SSM) o cualquier otra variante. Tampoco se especifica el numero de parametros, la longitud de contexto nativa ni la tokenizacion empleada.

Respecto al entrenamiento, la card declara que las afirmaciones sobre entrenamiento y evaluacion "viven en sus ficheros de recibos" dentro de la malla del estate, y que cualquier dato no documentado en un recibo se considera UNKNOWN. El escaneo de recibos de la familia "salad" (tranche 6, chunk 8, con fecha 2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`), pero no se ha encontrado el `DONE.json` estricto que requiere `status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento. La evidencia de evaluacion figura explicitamente como UNKNOWN. No hay datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas.

## Capacidades

- No se ha documentado ninguna capacidad verificable del modelo.
- No hay evidencia de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingues ni de modo de razonamiento extendido (thinking mode).
- La unica capacidad documentada es la existencia del repositorio y de ficheros SVG generados de forma determinista por la herramienta `estate-cards weaver` del autor, que no constituyen evidencia de capacidades del modelo.

## Casos de uso

No es posible recomendar casos de uso concretos para este artefacto porque no se ha publicado ninguna especificacion tecnica ni evidencia de evaluacion que permita determinar su comportamiento. Los siguientes escenarios solo serian viables una vez el autor publique especificaciones verificables:

- Auditoria de trazabilidad: usar el repositorio como caso de estudio de publicacion con recibos declarados pero incompletos, revisando la diferencia entre `RECEIPT_FILES_NO_DONE` y un `DONE.json` estricto.
- Verificacion de la malla de recibos: inspeccionar los SVG de contexto del estate y la malla de recibos para comprobar si el modelo aparece en algun recibo de evaluacion medido.
- Integracion en pipelines internos de SZLHOLDINGS: solo si el autor publica pesos, tokenizador y contrato de inferencia, el modelo podria evaluarse en un entorno controlado.
- Reproduccion de la generacion de tarjetas: reutilizar la herramienta `estate-cards weaver` para generar tarjetas deterministas de otros artefactos del estate.
- Analisis de gobernanza de artefactos: comparar este repositorio con otros del mismo autor que si tengan `DONE.json` estricto para entender el estandar de evidencia aplicado.
- Docencia sobre evaluacion de modelos: emplear el caso como ejemplo de por que una model card sin benchmarks medidos no permite decidir su adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluacion figura como UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el numero de parametros y el formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible, al no existir pesos publicados en formatos estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables porque se desconocen el tamano, la arquitectura y la tarea del artefacto. Los demas repositorios de la familia "salad" del mismo autor comparten la misma falta de especificaciones publicas, por lo que tampoco sirven como referencia tecnica.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parametros, contexto, idiomas ni licencia.
- Ausencia de evidencia medida: el escaneo de recibos clasifica el repositorio como `RECEIPT_FILES_NO_DONE` y la evaluacion figura como UNKNOWN.
- Licencia no especificada: no puede determinarse si el uso comercial esta permitido; en ausencia de licencia explicita, deben aplicarse los terminos por defecto de Hugging Face y contactar con el autor antes de cualquier uso.
- Riesgo de alucinacion y sesgos: imposible de evaluar sin datos de entrenamiento ni evaluaciones.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso por la comunidad.
- Fechas futuras en los metadatos (creacion en 2026), lo que impide verificar historicamente la trazabilidad del artefacto.
- No debe desplegarse en produccion bajo ninguna circunstancia hasta que existan pesos, tokenizador, licencia y benchmarks verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l66
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica declarada): https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards

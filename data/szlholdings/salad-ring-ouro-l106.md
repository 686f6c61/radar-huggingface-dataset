# SZLHOLDINGS/salad-ring-ouro-l106

## Resumen

salad-ring-ouro-l106 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye model card técnica convencional, sino una tarjeta generada automáticamente por su herramienta interna `estate-cards weaver` que describe el contexto del estate, los recibos disponibles y el estado de verificación de las métricas.

La información pública es extremadamente escasa: no se declara arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. La propia tarjeta indica explícitamente que cualquier afirmación de entrenamiento o evaluación no respaldada por un recibo medido se etiqueta como UNKNOWN, y el escaneo de recibos de la familia "salad" (tranche 6, chunk 4, 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con estado MEASURED.

Por tanto, la ficha se limita a documentar lo que el autor declara (licencia Apache 2.0, pertenencia al estate SZLHOLDINGS, ausencia de evidencia de evaluación) y marca como "no disponible" todo aquello que no está en la información proporcionada. No es posible recomendar el modelo para producción sin antes verificar los recibos en el repositorio de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la model card no declara ninguno) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card no contiene sección técnica alguna; se limita a describir el marco de gobernanza del estate SZLHOLDINGS y a remitir a los ficheros de recibo para cualquier afirmación sobre entrenamiento o evaluación.

El escaneo de recibos citado en la propia tarjeta (tranche 6, chunk 4, 2026-11-22, estándar estricto de la familia "salad") confirma que no existe un `DONE.json` con `status=MEASURED`, `eval_rc=0` y marca temporal. El único fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio escaneo aclara que no está validado como evidencia. En consecuencia, no hay ninguna innovación técnica documentada ni verificable.

## Capacidades

- Generación de texto: no confirmada por evidencia medida; la model card no la declara explícitamente.
- Razonamiento, código, matemáticas o visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.
- Modos especiales (thinking mode, audio, visión): no disponible.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin especificaciones técnicas verificadas (tamaño, contexto, licencia de pesos, formato). Cualquier aplicación práctica requeriría primero confirmar la arquitectura, el formato de pesos y la existencia de evaluaciones medidas. Los únicos escenarios plausibles a día de hoy son de carácter meta:

- Auditoría del estate SZLHOLDINGS: inspeccionar los ficheros de recibo del repositorio para determinar qué artefactos de la familia "salad" cuentan con evidencia medida y cuáles no.
- Investigación sobre gobernanza de modelos: usar la tarjeta generada por `estate-cards weaver` como ejemplo de documentación determinista con etiquetado MEASURED/REPORTED/UNKNOWN.
- Verificación de licencias: comprobar la nota de licencia del estate (tag apache-2.0 fijado el 2026-11-25 por operaciones del CTO, sin evidencia de licencia por fichero) antes de cualquier uso comercial.
- Replicación del pipeline de tarjetas: estudiar el repositorio `szl-holdings/estate-cards` para generar tarjetas SVG deterministas con Python estándar.
- Trazabilidad de artefactos: contrastar el identificador de tarjeta `b3ed644e51079a40` y la captura de auditoría del 2026-11-20T03:48:04Z con el estado actual del repositorio.
- Seguimiento de la familia "salad": monitorizar si en futuras tranches aparece un `DONE.json` estricto que permita pasar de UNKNOWN a MEASURED.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen la categoría, el tamaño y la tarea del artefacto. La única referencia estructural es el propio estate SZLHOLDINGS, que agrupa otros artefactos de la familia "salad" bajo el mismo estándar de recibos, pero no se dispone de datos públicos de ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede evaluar idoneidad, coste de inferencia ni requisitos de despliegue.
- Evidencia de evaluación UNKNOWN: no existe `DONE.json` estricto con estado MEASURED; cualquier afirmación de calidad o capacidad carece de respaldo medido.
- El único fichero con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) no está validado como evidencia por el propio escaneo del autor.
- Licencia Apache 2.0 declarada por operaciones del estate el 2026-11-25, sin evidencia de licencia por fichero upstream; conviene verificar antes de uso comercial.
- Idiomas no declarados: riesgo de comportamiento impredecible fuera del idioma de entrenamiento, que se desconoce.
- Riesgo de alucinación y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas.
- Fecha de creación futura (2026-11-19) y actualización (2026-11-25): coherencia temporal no verificable con la información disponible.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l106
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l93

## Resumen

salad-ring-ouro-l93 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con resultados verificables mediante recibos de auditoría. El repositorio no proporciona información sobre la arquitectura, el tamaño, los datos de entrenamiento ni las capacidades del modelo; la model card se limita a describir el sistema de trazabilidad y a declarar explícitamente que cualquier afirmación no respaldada por un recibo medido se considera UNKNOWN.

La relevancia de este artefacto es, por tanto, documental más que técnica: ilustra un patrón de publicación basado en evidencias fechadas y auditables, pero no ofrece material suficiente para evaluar el modelo en sí. La propia card reconoce que el repositorio se clasifica como RECEIPT_FILES_NO_DONE, es decir, contiene ficheros con nombre de recibo pero ningún DONE.json que cumpla el umbral estricto de medición (status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento).

En el momento de redactar esta ficha no se ha publicado ninguna especificación técnica, benchmark ni caso de uso verificado. Todo lo que sigue refleja esa ausencia de datos y debe interpretarse como una evaluación de la documentación disponible, no del rendimiento del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento ni el volumen de tokens procesados. La model card no incluye sección de arquitectura ni de datos.

Tampoco se documenta ningún proceso de alineación (RLHF, DPO, SFT) ni innovación técnica destacable. El autor indica que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibo del "estate mesh", pero el escaneo estricto de receipts-tranche-6 (chunk-9, 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE: el único fichero con nombre de recibo encontrado es assets/szl-card/mesh-receipts.svg, que no se valida como evidencia. La evidencia de evaluación figura como UNKNOWN.

## Capacidades

- Generación de texto: no disponible.
- Razonamiento, código o matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

La model card no enumera ninguna capacidad funcional del modelo. Cualquier atribución de capacidades sería especulativa y contradiría la política de honestidad declarada por el propio autor.

## Casos de uso

No es posible recomendar casos de uso concretos sin información sobre arquitectura, tamaño, contexto o licencia. Los siguientes escenarios se plantean únicamente como marcos de evaluación condicionados a que el artefacto se complete con evidencia medida:

- Auditoría de cadena de custodia: usar el repositorio como ejemplo de publicación con recibos fechados y SVG deterministas generados por herramientas stdlib, útil para equipos que diseñan pipelines de trazabilidad de modelos.
- Verificación de evidencias en CI: integrar el patrón DONE.json (status=MEASURED, eval_rc=0, timestamp) en un pipeline que bloquee la promoción de artefactos sin recibo estricto, replicando el umbral que este repositorio no alcanza.
- Evaluación de gobernanza de modelos: emplear la clasificación RECEIPT_FILES_NO_DONE como caso de estudio de discrepancias entre nombres de fichero y evidencia validada.
- Docencia sobre model cards: analizar la card como ejemplo de declaración explícita de UNKNOWN frente a la tentación de rellenar campos sin medición.
- Diseño de catálogos internos: adoptar el esquema de etiquetado MEASURED/REPORTED/UNKNOWN con captura temporal para inventarios de modelos corporativos.
- Pruebas de reproducibilidad: regenerar los SVG deterministas a partir del snapshot de auditoría (2026-11-20T03:48:04Z) y comprobar que el resultado coincide byte a byte.

Ninguno de estos casos implica ejecutar el modelo; se apoyan exclusivamente en la documentación y las herramientas de auditoría descritas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo estricto marca la evidencia de evaluación como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

Sin datos de tamaño, arquitectura ni formato de pesos no es posible estimar requisitos de memoria ni seleccionar un runtime de inferencia.

## Comparativa con modelos similares

No disponible. La ausencia de parámetros, contexto, licencia y benchmarks impide establecer una comparación significativa con alternativas de la misma categoría. Cualquier tabla comparativa requeriría inventar datos del modelo base, lo que contradice la política de honestidad del propio repositorio.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parámetros, contexto, idiomas ni formato de pesos.
- Licencia no especificada: no puede determinarse si el uso comercial está permitido; tratar como no apto para producción hasta que se publique una licencia.
- Evidencia de evaluación inexistente: el escaneo estricto clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluación como UNKNOWN.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación de datos de entrenamiento.
- Fecha de creación futura (2026-11-19): la marca temporal del repositorio es posterior a la fecha actual de referencia, lo que debe tenerse en cuenta al interpretar la trazabilidad.
- Cero descargas y cero likes: no hay señal de uso comunitario ni validación externa.
- El único fichero con nombre de recibo (assets/szl-card/mesh-receipts.svg) no se valida como evidencia según el propio criterio del autor.
- No debe citarse este repositorio como fuente de capacidades, rendimiento o idoneidad para ninguna tarea.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l93
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de cards (estate-cards): https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l101

## Resumen

`salad-ring-ouro-l101` es un artefacto de modelo publicado por SZLHOLDINGS bajo licencia Apache 2.0 dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad documental de resultados. El repositorio no incluye información sobre arquitectura, tamaño de parámetros, longitud de contexto ni datos de entrenamiento; la model card se limita a describir el sistema de "receipts" (evidencia auditable) del que forma parte el artefacto.

La relevancia del repositorio es, por tanto, principalmente metodológica y no técnica. El autor declara explícitamente que cualquier afirmación sobre calidad o capacidad queda marcada como UNKNOWN hasta que exista una medición fechada y verificable, y el escaneo de receipts de 2026-11-22 clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de receipt (`assets/szl-card/mesh-receipts.svg`) pero no existe un `DONE.json` válido con `status=MEASURED` y `eval_rc=0`.

En el estado actual de la información disponible no es posible evaluar el modelo como candidato para producción: no hay pipeline declarado, no hay idiomas declarados, no hay benchmarks y no hay evidencia de evaluación. Cualquier uso requeriría inspeccionar los pesos y los receipts del repositorio directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida) ni sobre el proceso de entrenamiento: número de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) o innovaciones técnicas. La model card no contiene sección de arquitectura ni de datos.

Lo único documentado es el marco de gobernanza del "estate" de SZLHOLDINGS: los resultados se registran en ficheros de receipt con marcas MEASURED/REPORTED/UNKNOWN y sellos temporales. El escaneo estricto de 2026-11-22 sobre la familia "salad" no encontró un `DONE.json` que cumpla el estándar (status=MEASURED, eval_rc=0, timestamp y receipt de entrenamiento), por lo que la evidencia de entrenamiento y evaluación de este artefacto concreto figura como UNKNOWN.

## Capacidades

- Generación de texto: no confirmada; no hay evidencia de evaluación ni descripción funcional.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia de capacidades. Los siguientes escenarios son únicamente marcos de evaluación que un equipo debería validar antes de adoptar el artefacto:

- Auditoría de gobernanza de modelos: usar el repositorio como ejemplo de estructura de receipts y de marcado explícito de claims no verificados (MEASURED/REPORTED/UNKNOWN) en un pipeline interno de cumplimiento.
- Evaluación interna pre-adopción: descargar los pesos, inspeccionar el formato y ejecutar una batería propia (MMLU, HumanEval, GSM8K) antes de considerar cualquier uso, dado que el autor no aporta métricas.
- Pruebas de reproducibilidad: verificar si los receipts del estate permiten reconstruir el proceso de entrenamiento y evaluación del artefacto.
- Integración en un catálogo de modelos con trazabilidad: registrar el artefacto con su estado de evidencia (sin `DONE.json`) y su licencia Apache 2.0.
- Análisis de licencias en estates de IA: estudiar la nota de licencia del 2026-11-25, que fija apache-2.0 por decisión operativa del estate sin evidencia de licencia upstream por fichero.
- Docencia sobre documentación de modelos: contrastar esta model card con las de modelos que sí publican arquitectura, contexto y benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y el escaneo de receipts clasifica la evidencia de evaluación como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría (tamaño, arquitectura y tarea) del artefacto.

| Modelo | Parametros | Contexto | Licencia | Evidencia de evaluación |
|---|---|---|---|---|
| salad-ring-ouro-l101 | no disponible | no disponible | apache-2.0 | UNKNOWN (sin DONE.json) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin parámetros, contexto, arquitectura ni formato de pesos, no es posible dimensionar el despliegue.
- Sin evidencia de evaluación: el escaneo estricto clasifica el repositorio como `RECEIPT_FILES_NO_DONE`; los ficheros con nombre de receipt no están validados como evidencia.
- Riesgo de sesgo y alucinación: no evaluable sin datos de entrenamiento ni pruebas; debe asumirse un riesgo no cuantificado.
- Idiomas: el repositorio no declara idiomas soportados; no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Licencia: la etiqueta apache-2.0 fue fijada el 2026-11-25 por operaciones del estate sin evidencia de licencia upstream por fichero; conviene verificar la procedencia de los pesos antes de un uso comercial.
- Cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.
- Fecha de creación futura respecto a la información de referencia (2026-11-19): verificar la coherencia temporal de los metadatos antes de citar el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l101
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (canonical source, según la model card): https://github.com/szl-holdings
- Herramienta de generación de cards del estate: https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-pg54-hatun-v1

## Resumen

salad-pg54-hatun-v1 es un artefacto de modelo publicado por SZLHOLDINGS, una organización que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces vinculados a fuentes y con resultados verificables mediante recibos ("receipts"). El repositorio contiene pesos en formato safetensors con un tamaño total de 1,0 GB y se distribuye bajo licencia Apache 2.0.

La model card no proporciona información técnica sustantiva: no especifica arquitectura, número de parámetros, longitud de contexto, tokenizador, idiomas soportados ni datos de entrenamiento. La propia tarjeta declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se etiqueta como UNKNOWN (desconocido). Un escaneo estricto de recibos de la familia "salad" (tranche 6, chunk 3, fechado el 22 de noviembre de 2026) clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombres de recibo, pero no existe un DONE.json estricto con estado MEASURED, eval_rc=0 y marca temporal.

Por tanto, la relevancia actual del modelo es limitada desde el punto de vista técnico: se trata de un artefacto de 1 GB sin pipeline declarado, sin descargas ni likes, sin benchmarks publicados y sin evidencia de evaluación verificable. La ficha se completa con los datos disponibles y marca como "no disponible" todo aquello que la información proporcionada no cubre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (tamano del repo: 1,0 GB en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se especifica el tokenizador, la dimensión de las capas ni el número de cabezas de atención.

Respecto al entrenamiento, la tarjeta declara que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de recibo" y que cualquier cosa no respaldada por un recibo se considera UNKNOWN. El escaneo estricto de recibos indica que no existe un DONE.json que cumpla el estándar (status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento). El único fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que la propia tarjeta advierte que es una coincidencia por palabra clave y no evidencia validada. No se dispone de datos sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica.

## Capacidades

- Generación de texto: no confirmada; la información disponible no documenta ninguna capacidad concreta.
- Razonamiento, código y matemáticas: no disponible.
- Visión, audio u otras modalidades: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Modo "thinking" u otras capacidades especiales: no disponible.

La model card no hace ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos, y en este repositorio no consta ninguno.

## Casos de uso

No es posible recomendar casos de uso concretos con garantías, dado que no se documentan arquitectura, contexto, idiomas ni capacidades. Los siguientes escenarios son únicamente exploratorios y requerirían validación previa por parte del equipo que los adopte:

- Evaluación interna de artefactos de la familia "salad": usar el repositorio como objeto de prueba para pipelines de auditoría de modelos que verifiquen la presencia de recibos DONE.json estrictos antes de promover un modelo a producción.
- Pruebas de carga de pesos en safetensors: validar que un artefacto de 1,0 GB se carga correctamente en el stack de inferencia del equipo (por ejemplo, mediante `safetensors` y un runtime compatible) antes de invertir en evaluación funcional.
- Reproducción de la cadena de custodia: comprobar la trazabilidad entre el repositorio de Hugging Face, la organización canónica en GitHub y los ficheros de recibo citados en la tarjeta.
- Integración en un catálogo interno de modelos gobernados: registrar el artefacto con su licencia Apache 2.0 y su estado de evidencia (UNKNOWN) para que los equipos de datos sepan que no debe usarse en cargas de producción sin evaluación propia.
- Fine-tuning experimental: solo si un equipo verifica primero la arquitectura y el tokenizador reales del artefacto; sin esa verificación, el coste de adaptación es impredecible.
- Docencia sobre licencias y gobernanza de modelos: emplear la tarjeta como ejemplo de model card que distingue explícitamente entre datos MEDIDOS, REPORTADOS y DESCONOCIDOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo estricto de recibos marca la evidencia de evaluación como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Como referencia de orden de magnitud, un artefacto de 1,0 GB en safetensors sugiere un modelo pequeño (del orden de cientos de millones de parámetros en fp16/fp32), pero la información no confirma el número de parámetros ni la precisión de los pesos.
- GPU recomendadas: no disponible. Sin conocer la arquitectura ni el tamaño real, no es posible recomendar A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: probablemente sí dada la horquilla de tamaño implícita en 1,0 GB, pero no verificable con la información disponible.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica la categoría del modelo (tamaño, tarea, arquitectura), por lo que no es posible seleccionar alternativas comparables con rigor.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-pg54-hatun-v1 | no disponible | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se documentan arquitectura, parámetros, contexto, tokenizador ni idiomas, lo que impide cualquier evaluación técnica rigurosa.
- Evidencia de evaluación inexistente: el escaneo estricto clasifica el repositorio como RECEIPT_FILES_NO_DONE; no hay DONE.json con status=MEASURED ni eval_rc=0.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas propias.
- Sesgos conocidos: no disponible; no se documenta composición del dataset ni proceso de alineación.
- Limitaciones de contexto o idioma: no disponible; el campo de idiomas no está informado en el repositorio.
- Licencia: Apache 2.0 declarada por el "estate ops" de SZL Holdings el 25 de noviembre de 2026, sin evidencia de licencia por fichero del upstream. Aunque Apache 2.0 permite uso comercial, conviene verificar la procedencia de los pesos antes de integrarlos en producción.
- Gobernanza: la tarjeta se genera automáticamente mediante el "estate-cards weaver v0.1.0" y contiene gráficos SVG deterministas generados a partir de una instantánea de auditoría; no sustituyen a una evaluación funcional.
- Madurez del artefacto: 0 descargas, 0 likes y sin pipeline declarado; no hay señales de adopción por parte de la comunidad.
- Fechas futuras: el repositorio se creó el 18 de noviembre de 2026 y se actualizó el 25 de noviembre de 2026, fechas posteriores a la mayoría de referencias públicas; conviene verificar la coherencia temporal del artefacto antes de confiar en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-pg54-hatun-v1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización canónica en GitHub (citada en la tarjeta, URL incompleta en el original): https://github.com/szl-holdings
- Repositorio del generador de tarjetas: https://github.com/szl-holdings/estate-cards
- Fichero de recibos citado en la tarjeta: `assets/szl-card/mesh-receipts.svg` (ruta relativa dentro del repositorio)

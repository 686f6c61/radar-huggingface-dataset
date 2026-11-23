# SZLHOLDINGS/salad-ring-ouro-l69

## Resumen

salad-ring-ouro-l69 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo (receipts). El repositorio no incluye información técnica sustantiva sobre el modelo en sí: no se especifican arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. La model card se limita a describir la infraestructura de auditoría del autor y a declarar explícitamente que cualquier afirmación no respaldada por un recibo medido se marca como UNKNOWN.

La relevancia de este artefacto no reside en sus capacidades (desconocidas), sino en su enfoque de gobernanza: la tarjeta indica que las afirmaciones de entrenamiento y evaluación viven en ficheros de recibo, y que los gráficos SVG se generan de forma determinista a partir de una instantánea de auditoría fechada (2026-11-20T03:48:04Z). No obstante, el propio escaneo de recibos incluido en la tarjeta clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. Por tanto, la evidencia de evaluación es UNKNOWN.

En la práctica, esto significa que no es posible evaluar el modelo con criterios técnicos estándar a partir de la información disponible. No hay datos de benchmarks, no hay especificaciones de arquitectura y no hay licencia declarada. Cualquier uso en producción requeriría inspeccionar directamente los pesos del repositorio y los ficheros de recibo referenciados, algo que esta ficha no puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la profundidad, el número de cabezas de atención ni la dimensionalidad de los embeddings.

Respecto al entrenamiento, la tarjeta declara que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibo del "estate mesh" y que cualquier cosa no respaldada por un recibo es UNKNOWN. El escaneo estricto de recibos (tranche 6, chunk 8, del 2026-11-22) clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) pero no un DONE.json que cumpla el estándar estricto del autor (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). No se dispone de datos sobre volumen de tokens, composición del dataset, técnicas de alineación (RLHF, DPO) ni innovaciones técnicas de decodificación o atención.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No hay evidencia de soporte de generación de texto, razonamiento, código o matemáticas.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingües.
- No hay evidencia de modo de razonamiento (thinking mode), visión o audio.
- La model card afirma explícitamente que no se hace ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos, y que la evidencia de evaluación es UNKNOWN.

## Casos de uso

- Auditoría de gobernanza de artefactos: el repositorio puede inspeccionarse como ejemplo de estructura de recibos y trazabilidad declarada por SZLHOLDINGS, verificando qué ficheros existen y qué metadatos contienen, sin asumir capacidades del modelo.
- Estudio de formatos de model card automatizados: la tarjeta se genera con "estate-cards weaver v0.1.0" (Python de biblioteca estándar, SVG determinista, paleta KANCHAY), lo que permite analizar cómo se etiquetan los datos como MEASURED, REPORTED o UNKNOWN con marca temporal de captura.
- Verificación de integridad de repositorios: el identificador de tarjeta (card id 53106846bf4a109b) y la instantánea de auditoría fechada permiten comprobar la reproducibilidad de la generación de la tarjeta en un momento dado.
- Evaluación de riesgos antes de adopción: dado que la licencia y los idiomas son no disponibles, un equipo de cumplimiento podría usar este repositorio como caso de estudio de por qué la ausencia de metadatos bloquea la adopción en producción.
- Formación interna sobre estándares de evidencia: el contraste entre "receipt-named files" y "strict DONE.json" sirve como material didáctico sobre la diferencia entre indicios y evidencia validada.
- No se recomienda su uso como modelo de inferencia en ningún escenario práctico, al no existir especificaciones, licencia ni evidencia de evaluación que permitan justificar su idoneidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se indica formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse el tamaño, la arquitectura, la licencia y las capacidades del modelo, no es posible establecer una comparación técnica significativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede determinar tamaño, contexto, arquitectura ni formato de pesos a partir de la información disponible.
- Licencia no declarada: no hay base para asumir permiso de uso comercial, modificación o redistribución.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas.
- Evidencia de evaluación UNKNOWN: el propio escaneo del autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json estricto con status=MEASURED.
- Riesgo de alucinación y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- La tarjeta contiene referencias a URLs mal formadas (por ejemplo, enlaces a GitHub con paréntesis anidados), lo que dificulta la verificación de la fuente canónica declarada.
- No apto para producción sin una inspección directa de los pesos y los ficheros de recibo referenciados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l69
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización en GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards

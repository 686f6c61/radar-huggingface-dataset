# SZLHOLDINGS/salad-ring-ouro-l81

## Resumen

`salad-ring-ouro-l81` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio de Hugging Face no incluye model card técnica en sentido convencional: la documentación disponible consiste en metadatos de identidad, gráficos SVG generados de forma determinista y una sección de honestidad que declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación no verificada debe considerarse UNKNOWN.

No se especifican arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni licencia. El propio autor indica que las evidencias de calidad viven en ficheros de recibos del "estate mesh" y que, en el momento del escaneo (2026-11-22), el repositorio se clasifica como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.

Por tanto, esta ficha documenta lo que el repositorio declara y, de forma explícita, marca como no disponible todo aquello que no está receiptado. Es relevante ahora únicamente como ejemplo de publicación de artefactos con trazabilidad declarativa, no como modelo evaluable para producción: sin arquitectura, pesos documentados ni benchmarks medidos, no es posible determinar su idoneidad técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del corpus de entrenamiento, el número de tokens procesados ni la existencia de fases de alineación como RLHF, DPO o similares.

La model card declara que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibos" dentro del mesh del estate, y que cualquier cosa no receiptada en la propia tarjeta es UNKNOWN. El escaneo estricto de recibos de 2026-11-22 clasifica este repositorio como RECEIPT_FILES_NO_DONE: el único fichero con nombre relacionado es `assets/szl-card/mesh-receipts.svg`, que el propio autor advierte que es una coincidencia por palabra clave y no evidencia validada. No hay, por tanto, recibo de entrenamiento ni de evaluación en el nivel exigido por el estándar del propio autor.

## Capacidades

- No se declara ninguna capacidad concreta (generación de texto, razonamiento, código, matemáticas, visión) en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Lo único verificable es la existencia del artefacto como "model (trained artifact in the governed factory)" según la declaración de identidad del autor.

## Casos de uso

- Auditoría de trazabilidad de artefactos: el repositorio puede usarse como caso de estudio de publicación con recibos declarativos, revisando cómo el autor separa afirmaciones MEASURED, REPORTED y UNKNOWN en su model card.
- Integración en pipelines de verificación interna: un equipo podría usar el patrón de recibos (`DONE.json` con `status=MEASURED` y `eval_rc=0`) como plantilla para sus propios controles de calidad, no el modelo en sí.
- Evaluación de gobernanza de modelos: útil para probar herramientas que detectan model cards sin benchmarks ni licencia antes de permitir su descarga en un registro corporativo.
- Docencia sobre documentación de modelos: ejemplo práctico de model card que declara honestamente la ausencia de evidencia en lugar de inventar métricas.
- Pruebas de scraping y catalogación: repositorio con metadatos mínimos (tags `region:us`, sin pipeline, sin idiomas) útil para validar parsers tolerantes a campos ausentes.
- No se recomienda su uso en inferencia, generación de código, atención al cliente ni ninguna tarea de producción, dado que no hay pesos, arquitectura ni licencia documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluación es UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa fiable sin conocer parámetros, contexto, licencia ni resultados de evaluación del modelo. Cualquier comparación con alternativas de la misma categoría sería especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros ni contexto declarados, no se puede planificar su despliegue.
- Sin licencia declarada: no hay base legal explícita para uso comercial, redistribución o modificación; debe asumirse riesgo jurídico hasta que el autor la publique.
- Sin evidencia de evaluación: el propio autor clasifica el repositorio como RECEIPT_FILES_NO_DONE y marca la evidencia de evaluación como UNKNOWN.
- Riesgo de alucinación y sesgos: no evaluable al no existir benchmarks ni documentación de datos de entrenamiento.
- Idiomas soportados desconocidos: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Fecha de creación futura en los metadatos (2026-11-19) y nomenclatura críptica (`salad-ring-ouro-l81`) que dificulta identificar la familia o el propósito del artefacto.
- Los gráficos SVG de la model card son generados de forma determinista a partir de una instantánea de auditoría, pero no constituyen evidencia validada de capacidades.
- Para producción: no apto sin recibos medidos, licencia explícita y pesos verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l81
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada por el autor: https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l107

## Resumen

salad-ring-ouro-l107 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados auditables y trazables. El repositorio se presenta como un "modelo" (artefacto entrenado dentro de una factoría gobernada), pero la model card no aporta ninguna especificación arquitectónica: no indica tipo de transformer, número de parámetros, longitud de contexto, tokenizador ni datos de entrenamiento.

La información disponible es fundamentalmente de gobernanza y procedencia, no técnica. La propia model card declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un fichero de "receipt" se considera UNKNOWN (desconocida), y el escaneo de receipts incluido en la tarjeta clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de receipt (un SVG de "mesh-receipts"), pero no existe un DONE.json estricto con estado MEASURED, código de salida de evaluación 0 y marca temporal. Por tanto, no hay evidencia medida de calidad ni de capacidades.

El modelo es relevante únicamente como ejemplo de patrón de publicación centrado en auditabilidad y honestidad epistémica (etiquetado MEASURED/REPORTED/UNKNOWN), no como modelo evaluable para uso en producción. La licencia declarada es Apache 2.0, fijada por el equipo de operaciones del estate el 25 de noviembre de 2026, sin evidencia de licencia upstream por fichero.

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

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la longitud de contexto nativa, el vocabulario del tokenizador ni el esquema de atención.

Respecto al entrenamiento, la tarjeta remite a "receipt files" del estate para cualquier afirmación sobre entrenamiento o evaluación, y declara explícitamente que lo que no esté respaldado por un receipt es UNKNOWN. El escaneo de receipts de la propia tarjeta (tranche 6, chunk 4, escaneo estricto del 22 de noviembre de 2026) concluye que no existe un DONE.json que cumpla el umbral estricto (status=MEASURED, eval_rc=0, marca temporal y receipt de entrenamiento), por lo que la evidencia de evaluación es UNKNOWN. No se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias.

## Capacidades

- No se documenta ninguna capacidad verificada. La model card no afirma generación de texto, razonamiento, código, matemáticas, visión ni audio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Modo "thinking" u otras capacidades especiales: no disponible.
- La tarjeta declara explícitamente que no se hace ninguna afirmación de calidad o capacidad sin receipts de evaluación medidos.

## Casos de uso

- Auditoría de procedencia de artefactos: el repositorio sirve como ejemplo práctico de cómo etiquetar un modelo con estados MEASURED/REPORTED/UNKNOWN y de cómo un escaneo estricto detecta la ausencia de evidencia medida; útil para equipos que diseñan pipelines de gobernanza de modelos.
- Plantilla de model card gobernada: el formato de la tarjeta (identidad, evidencia, honestidad, receipts) puede reutilizarse como esqueleto para documentar modelos internos con trazabilidad de resultados.
- Verificación de licencias en un estate: el registro de la decisión de licencia (nota w45z, Apache 2.0 fijada por operaciones el 25-11-2026) ejemplifica cómo documentar decisiones de derechos sin evidencia upstream por fichero.
- Formación en prácticas de publicación responsable: el caso ilustra la diferencia entre "ficheros con nombre de receipt" y "evidencia validada", un error frecuente en repositorios de investigación.
- Integración en un catálogo interno de artefactos: el repositorio puede indexarse como artefacto no apto para producción hasta que exista un DONE.json válido, y usarse para probar reglas de admisión automatizadas.
- No se recomienda su uso para inferencia, generación de código, atención al cliente ni ninguna tarea de producción, dado que no hay pesos, arquitectura ni evaluación documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de receipts concluye que la evidencia de evaluación es UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos ni artefactos de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l107 | no disponible | no disponible | Apache 2.0 | Repositorio HF sin pesos ni evaluación documentados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador documentados, el modelo no es evaluable ni desplegable.
- Sin evidencia de evaluación: el escaneo estricto de receipts devuelve RECEIPT_FILES_NO_DONE; no existe DONE.json con status=MEASURED ni eval_rc=0.
- Riesgo de alucinación y sesgos: no evaluables, al no existir ni pesos ni pruebas publicadas.
- Licencia: Apache 2.0 declarada por decisión interna del estate (nota w45z, 25-11-2026) sin evidencia de licencia upstream por fichero; conviene verificar antes de cualquier uso comercial.
- Idiomas: el campo de idiomas del repositorio está vacío; no hay garantía de soporte multilingüe.
- Fecha de creación futura (2026-11-19) y metadatos generados automáticamente por el "estate-cards weaver" v0.1.0; tratar la información como procedente de un pipeline automatizado no validado de forma independiente.
- Para producción: no apto. Cualquier integración requeriría primero la publicación de pesos, arquitectura y receipts de evaluación medidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l107
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (canonical source): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (estate-cards weaver): https://github.com/szl-holdings/estate-cards

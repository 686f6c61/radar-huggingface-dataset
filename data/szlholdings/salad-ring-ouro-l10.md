# SZLHOLDINGS/salad-ring-ouro-l10

## Resumen

`salad-ring-ouro-l10` es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo. El repositorio se creó el 18 de noviembre de 2026 y se actualizó por última vez el 25 de noviembre de 2026, con cero descargas y cero likes en el momento de redactar esta ficha. La model card no especifica arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento.

La información disponible se limita a metadatos de licencia (Apache 2.0), la declaración de pertenencia al estate de SZLHOLDINGS y una sección de "receipts" que, en la práctica, indica que no existe evidencia estricta de evaluación: el escaneo del 22 de noviembre de 2026 clasifica el repo como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero ningún `DONE.json` con `status=MEASURED` y `eval_rc=0`. El propio autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación no respaldada por un recibo se considera `UNKNOWN`.

Por tanto, esta ficha no puede caracterizar técnicamente el modelo más allá de lo que la model card afirma sobre su gobernanza y licencia. No se han publicado especificaciones de arquitectura, benchmarks ni requisitos de hardware. Cualquier uso en producción debería partir de una inspección directa de los pesos y de los ficheros de recibo del repositorio.

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

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal.

El apartado de "Evidence" de la model card remite a gráficos SVG deterministas generados a partir de una instantánea de auditoría con fecha 2026-11-20T03:48:04Z, etiquetada como `MEASURED`, pero no se exponen los datos subyacentes en el texto de la card. La sección de "Receipts" aclara que el repo contiene ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) que no han sido validados como evidencia y que no existe un `DONE.json` en el estándar estricto del estate. En consecuencia, no hay ninguna afirmación verificable sobre el proceso de entrenamiento.

## Capacidades

- No se ha documentado ninguna capacidad específica del modelo en la información disponible.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingües ni de cobertura de idiomas.
- No hay evidencia de modos especiales (thinking mode, visión, audio, etc.).
- La model card declara explícitamente que no se afirma ninguna capacidad sin recibos de evaluación medidos, y que estos no están presentes.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones técnicas verificadas. Los siguientes escenarios son genéricos y quedan condicionados a que una inspección directa del artefacto confirme que el modelo es funcional y adecuado:

- Evaluación interna de artefactos de un estate gobernado: usar el repo como caso de estudio de trazabilidad y de aplicación de un estándar de recibos (`DONE.json`, `status=MEASURED`, `eval_rc=0`) antes de adoptar modelos en producción.
- Auditoría de licencias: el repo ilustra el caso de una licencia Apache 2.0 asignada por operaciones del estate sin evidencia de licencia por fichero, lo que sirve para diseñar controles de compliance.
- Pruebas de pipeline de carga de pesos: si los pesos existen en el repo, podrían usarse para validar herramientas de carga y serialización, sin asumir calidad del modelo.
- Reproducción de la instantánea de auditoría: regenerar los SVG deterministas a partir de la instantánea de 2026-11-20T03:48:04Z para verificar la cadena de generación de la model card.
- Formación sobre gobernanza de IA: el caso `RECEIPT_FILES_NO_DONE` es un ejemplo didáctico de la diferencia entre "fichero con nombre de recibo" y "recibo validado".
- Integración en un registro interno de modelos: catalogar el artefacto con estado `UNKNOWN` hasta que se aporten recibos medidos, como práctica de inventario.

Cualquier uso que requiera generación de texto, código, matemáticas o razonamiento queda fuera de lo que la información disponible permite justificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la sección de recibos indica `Eval evidence: UNKNOWN (no strict DONE.json)`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas publicadas: arquitectura, parámetros, contexto e idiomas son `UNKNOWN`.
- Ausencia de evidencia de evaluación: el escaneo estricto del estate clasifica el repo como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` con `status=MEASURED`.
- La licencia Apache 2.0 fue asignada por operaciones del estate el 2026-11-25 sin evidencia de licencia por fichero ("no per-file upstream license evidence claimed"), lo que introduce incertidumbre sobre la procedencia real de los pesos.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación de entrenamiento.
- Cero descargas y cero likes: no hay señal de uso ni de validación por parte de la comunidad.
- La model card está generada por una herramienta interna (`estate-cards weaver v0.1.0`) y contiene gráficos SVG cuyo contenido no se detalla en el texto.
- No debe asumirse que el modelo es funcional ni que sus pesos son utilizables en producción sin una inspección directa del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l10
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards

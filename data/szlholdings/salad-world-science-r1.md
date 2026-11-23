# SZLHOLDINGS/salad-world-science-r1

## Resumen

salad-world-science-r1 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de su infraestructura interna, sin que la model card proporcione detalles sobre arquitectura, tamaño de parámetros, datos de entrenamiento o proceso de alineamiento.

La información disponible es extremadamente limitada: la model card se centra en meta-información sobre el sistema de auditoría del autor (gráficos SVG generados de forma determinista, sellos de tiempo de captura y etiquetas MEASURED/REPORTED/UNKNOWN) y no incluye ninguna especificación técnica del modelo en sí. El propio autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté en sus ficheros de recibos es UNKNOWN, y el escaneo de recibos más reciente clasifica el repositorio como RECEIPT_FILES_NO_DONE, indicando que no existe un DONE.json que cumpla el estándar estricto de evidencia.

El tamaño del repositorio (0,7 GB) sugiere pesos en formato safetensors de un modelo relativamente pequeño, pero no es posible determinar parámetros, contexto ni arquitectura a partir de ese dato. No se han publicado resultados de benchmarks, licencia, idiomas soportados ni pipeline de inferencia en la información disponible.

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
| Formato de pesos | safetensors (único formato declarado en los tags del repo) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card. El autor no especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras formas de alineamiento.

La model card únicamente indica que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de recibos" dentro de la malla del estate, y que cualquier cosa no registrada allí es UNKNOWN. El escaneo de recibos de la tranche 6 (chunk 10, 2026-11-22) clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg), pero no un DONE.json que cumpla el estándar estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). La evidencia de evaluación figura como UNKNOWN.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No consta soporte declarado de tool calling ni function calling.
- No consta soporte declarado de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta información sobre modos especiales (thinking mode, visión, audio).
- El nombre del repositorio ("science") sugiere un posible enfoque hacia dominios científicos, pero no hay documentación que lo confirme.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer las capacidades, el tamaño, el contexto y la licencia del modelo. Cualquier escenario de aplicación que se describiera sería especulativo y no estaría respaldado por la información proporcionada. Se recomienda consultar los ficheros de recibos del estate de SZLHOLDINGS o contactar con el autor antes de plantear un despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la evidencia de evaluación figura como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable a partir de los datos publicados; el tamaño del repo (0,7 GB) es compatible con pesos pequeños, pero se desconoce si el repo contiene los pesos completos o solo una parte.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se han publicado parámetros, contexto, licencia ni rendimiento del modelo evaluado, lo que impide establecer una comparación técnicamente rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin parámetros, contexto ni arquitectura no es posible evaluar la idoneidad del modelo para ninguna tarea.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; desplegarlo en producción sin aclarar este punto entraña riesgo legal.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas distintos del inglés.
- Evidencia de evaluación inexistente según el propio estándar del autor (RECEIPT_FILES_NO_DONE, eval UNKNOWN): no hay garantía medida de calidad o capacidades.
- Riesgo de alucinación: no evaluable sin benchmarks ni documentación de alineamiento.
- Sesgos conocidos: no documentados.
- Fecha de creación futura (2026-11-18): conviene verificar la autenticidad y procedencia del repositorio antes de cualquier uso.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- La model card está generada automáticamente por una herramienta interna ("estate-cards weaver v0.1.0") y no contiene información sustantiva sobre el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-world-science-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada como fuente canónica): https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards

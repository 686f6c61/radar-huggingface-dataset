# SZLHOLDINGS/salad-ring-ouro-l70

## Resumen

salad-ring-ouro-l70 es un artefacto de modelo publicado en Hugging Face por la organización SZLHOLDINGS, que se presenta a sí misma como un "estate" de IA gobernada con modelos, datasets y Spaces con resultados verificables y trazables. El repositorio se creó el 19 de noviembre de 2026 y se actualizó el 23 de noviembre de 2026, y en el momento de la consulta no registra descargas ni likes.

La model card no proporciona información técnica sustantiva sobre el modelo: no se especifican arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El documento se limita a describir la infraestructura de gobernanza del autor (generación determinista de tarjetas, ficheros de "receipts" y etiquetado de evidencias como MEASURED, REPORTED o UNKNOWN) y declara explícitamente que cualquier afirmación sobre capacidades o calidad que no esté respaldada por un recibo de evaluación medido se considera UNKNOWN.

Por tanto, esta ficha no puede caracterizar técnicamente el modelo más allá de lo que el propio autor declara: que es un "modelo" entrenado dentro de su fábrica gobernada y que su evidencia de evaluación no alcanza el umbral estricto definido por el propio autor (falta un DONE.json con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento). La mayor parte de los campos técnicos se marcan como "no disponible".

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

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. La tarjeta no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo híbrido, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

El autor declara que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de receipt" dentro de la malla del estate, y que cualquier dato no recibido en la tarjeta se considera UNKNOWN. Un escaneo estricto de receipts de fecha 22 de noviembre de 2026 clasifica el repositorio como RECEIPT_FILES_NO_DONE: existen ficheros con nombre de receipt (concretamente `assets/szl-card/mesh-receipts.svg`, detectado por coincidencia de palabra clave y no validado como evidencia), pero no hay un DONE.json que cumpla el umbral estricto. La evidencia de evaluación figura como UNKNOWN.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No hay evidencia medida de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos para este artefacto, ya que no se ha publicado ninguna capacidad, benchmark ni especificación técnica que permita evaluar su idoneidad para tareas reales. Cualquier aplicación en producción requeriría primero una evaluación independiente del modelo.

- Evaluación interna de artefactos gobernados: un equipo podría inspeccionar el repositorio para verificar el cumplimiento del estándar de receipts del autor, pero no para desplegar el modelo.
- Auditoría de trazabilidad: útil únicamente como ejemplo de estructura de tarjeta generada automáticamente con etiquetado de evidencia MEASURED/REPORTED/UNKNOWN.
- El resto de escenarios prácticos (atención al cliente, generación de código, análisis documental, agentes, etc.) no pueden justificarse con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara que la evidencia de evaluación es UNKNOWN al no existir un DONE.json que cumpla el umbral estricto del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse el tamaño, la arquitectura y el rendimiento del modelo, no es posible establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede verificar arquitectura, tamaño, contexto ni idiomas.
- Licencia no declarada: no hay base para determinar si el uso comercial está permitido.
- Sin evidencia de evaluación medida: el propio autor clasifica la evidencia como UNKNOWN y el escaneo estricto como RECEIPT_FILES_NO_DONE.
- Riesgo de alucinación y sesgos: imposibles de evaluar sin datos de entrenamiento ni evaluaciones.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- El único resultado de búsqueda web encontrado no guarda relación con el modelo (tutorial sobre comentarios de YouTube), por lo que no aporta información verificable.
- No apto para producción sin una evaluación independiente previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l70
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de generación de tarjetas del autor: https://github.com/szl-holdings/estate-cards
- Organización en GitHub (referenciada en la tarjeta, URL incompleta en el original): https://github.com/szl-holdings

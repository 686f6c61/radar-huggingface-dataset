# SZLHOLDINGS/salad-ring-ouro-l59

## Resumen

salad-ring-ouro-l59 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts). El repositorio de Hugging Face no incluye model card técnica convencional ni pesos documentados, sino una tarjeta generada automáticamente por su herramienta `estate-cards weaver` (v0.1.0), con gráficos SVG deterministas y etiquetas de estado MEASURED/REPORTED/UNKNOWN.

La información pública disponible no especifica arquitectura, tamaño, contexto, datos de entrenamiento ni idiomas. La propia tarjeta reconoce explícitamente que cualquier afirmación de calidad o capacidad es UNKNOWN hasta que existan recibos de evaluación medidos, y el escaneo de la "tranche 6, chunk 8" clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero ningún DONE.json que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento).

Por tanto, esta ficha documenta lo que se puede verificar del repositorio y marca el resto como no disponible. No es posible evaluar el modelo para uso en producción con la evidencia actual; su relevancia es fundamentalmente como ejemplo de práctica de gobernanza y trazabilidad, no como modelo utilizable.

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

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no describe si se trata de un transformer, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni incluye detalles sobre capas, dimensiones ocultas, mecanismos de atención o tokenizador.

Respecto al entrenamiento, la tarjeta afirma que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo (ver la malla del estate)" y que cualquier cosa no registrada allí es UNKNOWN. El escaneo de recibos de la tranche 6 indica que no existe un DONE.json estricto, por lo que no hay evidencia medida de entrenamiento ni de evaluación. No se dispone de datos sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- No se documenta ninguna capacidad concreta (generación de texto, razonamiento, código, matemáticas, visión, audio) en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking mode, visión, audio): no disponible.
- La única capacidad verificable del artefacto es la de generar tarjetas de presentación deterministas mediante su herramienta de weaver, que no es una capacidad del modelo en sí.

## Casos de uso

- Auditoría de gobernanza de modelos: el repositorio puede usarse como referencia de cómo estructurar recibos y tarjetas generadas automáticamente en un pipeline de trazabilidad interna, aunque el propio escaneo indica que el estándar estricto no se cumple.
- Estudio de prácticas de documentación: sirve para analizar el formato `szl:showcase-card v1` y el etiquetado MEASURED/REPORTED/UNKNOWN como convención de honestidad documental.
- Integración en la malla del estate SZLHOLDINGS: si el equipo dispone de acceso a los recibos internos referenciados, podría encajar en un flujo de verificación de artefactos del mismo autor.
- Docencia sobre reproducibilidad: útil como caso negativo para ilustrar la diferencia entre "fichero con nombre de recibo" y "recibo validado con DONE.json".
- Pruebas de herramientas de escaneo de repositorios: el repo se puede usar como fixture para validar escáneres que clasifican estados RECEIPT_FILES_NO_DONE.
- No se recomienda su uso en aplicaciones de producción (chatbots, generación de código, atención al cliente) porque no hay evidencia de pesos, licencia ni evaluación que lo respalden.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos indica "Eval evidence: UNKNOWN (no strict DONE.json)".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría con información verificable, y el propio repositorio no proporciona métricas que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, tamaño, contexto ni formato de pesos declarados, es imposible planificar su despliegue.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en la práctica, esto bloquea cualquier adopción en producción.
- Evidencia de evaluación inexistente: la clasificación RECEIPT_FILES_NO_DONE y la ausencia de DONE.json implican que no hay resultados medidos que respalden calidad o capacidades.
- Riesgo de alucinación: no evaluable sin pesos ni benchmarks; no puede descartarse ni confirmarse.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- La tarjeta está generada automáticamente por una herramienta (estate-cards weaver v0.1.0) y contiene gráficos SVG y referencias a una malla de recibos externa que no se puede verificar desde el repositorio.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Cualquier uso en producción requeriría primero obtener los recibos estrictos y verificar la licencia en la fuente canónica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l59
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

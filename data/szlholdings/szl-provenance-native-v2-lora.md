# SZLHOLDINGS/szl-provenance-native-v2-lora

## Resumen

szl-provenance-native-v2-lora es un artefacto de tipo modelo publicado por SZLHOLDINGS en Hugging Face, aparentemente un adaptador LoRA (por el sufijo "lora" en el identificador) integrado en lo que el autor denomina su "estate" de IA gobernada. La model card no describe arquitectura, tamaño, datos de entrenamiento ni capacidades del modelo; se limita a documentar metadatos de procedencia, recibos de auditoría y avisos de honestidad sobre qué afirmaciones están medidas y cuáles son desconocidas.

El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que o bien no contiene pesos publicados, o bien contiene únicamente ficheros de tarjeta y activos SVG. No se declara licencia, idioma, pipeline ni número de parámetros. Las descargas y los "likes" son cero, y el repositorio se creó el 16 de noviembre de 2026 y se actualizó el 22 de noviembre de 2026.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no hay información suficiente para evaluar el modelo como candidato de producción. Lo que sí resulta destacable es el enfoque de gobernanza y trazabilidad que el autor declara, con un sistema de recibos (receipts) que distingue entre valores medidos (MEASURED), reportados (REPORTED) y desconocidos (UNKNOWN). Esa filosofía de documentación es poco habitual y merece mención, aunque no sustituye a las especificaciones técnicas ausentes.

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
| Formato de pesos | safetensors (según etiqueta del repositorio); no se confirma la presencia de pesos en el repo |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo. El identificador incluye el término "lora", lo que sugiere que se trata de un adaptador de bajo rango (Low-Rank Adaptation) destinado a ajustar un modelo base, pero la model card no especifica cuál es ese modelo base, ni el rango, ni las capas objetivo, ni la configuración de entrenamiento.

La documentación del autor indica que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibos ("receipt files") del "estate mesh", y que cualquier dato no incluido en esos recibos se considera UNKNOWN. El escaneo de recibos de la tranche 4 (22 de noviembre de 2026) clasifica este repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. En consecuencia, la evidencia de evaluación es UNKNOWN y no se puede verificar ningún dato de entrenamiento.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones verificables del modelo. Los siguientes escenarios son hipotéticos y dependen de que el artefacto contenga realmente un adaptador LoRA funcional, algo que no está confirmado:

- Ajuste fino de un modelo base no identificado: si el repositorio contiene pesos LoRA válidos, podría aplicarse sobre el modelo base correspondiente, pero se desconoce cuál es y no hay instrucciones de uso.
- Auditoría de procedencia: el repositorio podría servir como ejemplo de documentación con recibos y trazabilidad para equipos que diseñan pipelines de gobernanza de modelos.
- Integración en un catálogo interno de artefactos: útil únicamente como referencia de metadatos, no como componente de inferencia.
- Reproducción de auditorías: los ficheros SVG generados de forma determinista permiten inspeccionar el snapshot de auditoría del 20 de noviembre de 2026, aunque no aportan información sobre el comportamiento del modelo.
- Evaluación de prácticas de documentación: comparar el enfoque de recibos del autor con model cards convencionales.
- Investigación sobre licenciamiento y publicación: el caso ilustra un repositorio sin licencia declarada, lo que plantea problemas para su reutilización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos indica que la evidencia de evaluación es UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el tamaño del modelo base y del adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta ningún formato de inferencia compatible.
- Latencia y throughput: no disponible.
- El tamaño del repositorio es de 0,0 GB, lo que sugiere que no hay pesos descargables o que son extremadamente pequeños; en cualquier caso, no se puede planificar un despliegue con esta información.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del artefacto. Cualquier comparación con adaptadores LoRA públicos, modelos base de propósito general o sistemas de gobernanza de modelos sería especulativa y no se sustenta en datos de la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede evaluar arquitectura, tamaño, contexto ni rendimiento.
- Licencia no declarada: no hay base legal explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso.
- Evidencia de evaluación UNKNOWN: el propio sistema de recibos del autor clasifica el repositorio como sin DONE.json estricto, por lo que no hay resultados medidos que respalden ninguna afirmación de calidad.
- Riesgo de que el repositorio no contenga pesos utilizables: el tamaño de 0,0 GB y la ausencia de pipeline sugieren que podría ser solo una tarjeta informativa.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni siquiera monolingüe.
- Riesgo de alucinación y sesgos: imposible de evaluar sin modelo desplegable ni documentación de datos de entrenamiento.
- Fechas de creación y actualización en 2026: conviene verificar la vigencia y autenticidad del repositorio en el momento de la consulta.
- La model card incluye referencias a enlaces externos (organización en GitHub) que no se han podido verificar en la información proporcionada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-provenance-native-v2-lora
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub citada en la model card: https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards

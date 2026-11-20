# SZLHOLDINGS/salad-ring-ouro-l27

## Resumen

salad-ring-ouro-l27 es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate de IA gobernada". La model card no proporciona información técnica sustantiva sobre el modelo: no se especifica arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. El repositorio se presenta como un "trained artifact in the governed factory", con énfasis en la trazabilidad mediante ficheros de recibos (receipts) y auditorías con fecha, pero sin exponer los resultados de esas auditorías en la propia tarjeta.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: documenta la existencia del artefacto, su origen y el marco declarativo del autor, y advierte de que cualquier afirmación sobre capacidades o rendimiento carece de respaldo verificable en la información disponible. El autor indica explícitamente que las afirmaciones de entrenamiento y evaluación viven en ficheros de recibos del "estate mesh" y que todo lo no registrado allí debe considerarse UNKNOWN (desconocido).

El modelo se creó el 18 de noviembre de 2026 y se actualizó el 20 de noviembre de 2026. En el momento de la consulta registra 0 descargas y 0 likes, y no tiene pipeline declarado. No se dispone de información sobre licencia, idiomas soportados ni formato de pesos.

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

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con componentes de espacio de estados (SSM) o cualquier otra variante. Tampoco se indica el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

El autor declara que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibos asociados al "estate mesh" de SZLHOLDINGS, y que cualquier dato no registrado en esos recibos debe tratarse como desconocido. La tarjeta incluye referencias a gráficos SVG deterministas generados a partir de una instantánea de auditoría fechada el 20 de noviembre de 2026 (marcada como MEASURED), pero no se reproduce el contenido numérico de esos gráficos ni se enlazan los recibos concretos en la información disponible. No se puede confirmar ninguna innovación técnica (decodificación especulativa, atención lineal, etc.) a partir de los datos proporcionados.

## Capacidades

- No se documentan capacidades específicas del modelo en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe.
- No se confirma la existencia de modos especiales (thinking mode, visión, audio).
- La model card se limita a declarar el artefacto como parte de un "estate gobernado" con resultados verificables mediante recibos, sin detallar qué tareas resuelve.

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin información sobre las capacidades del modelo. Cualquier aplicación práctica requeriría conocer, como mínimo, la arquitectura, el tamaño, el contexto y las tareas para las que fue entrenado, datos que no están disponibles. Los únicos usos que pueden describirse con rigor son los siguientes:

- Auditoría de procedencia: el repositorio puede emplearse como objeto de estudio para examinar el marco de "IA gobernada" propuesto por SZLHOLDINGS, revisando los ficheros de recibos y las instantáneas de auditoría fechadas que el autor menciona.
- Verificación de reproducibilidad: dado que el autor afirma que los gráficos se generan de forma determinista a partir de una instantánea de auditoría, un investigador podría intentar reproducir esa generación con las herramientas citadas (estate-cards weaver).
- Evaluación de transparencia documental: el caso sirve para analizar cómo una model card puede declarar explícitamente estados UNKNOWN en lugar de inventar cifras, práctica poco habitual en el ecosistema.
- Integración en pipelines de catalogación: un sistema de inventario de modelos podría ingerir los metadatos del repositorio (ID, autor, fechas, tags) para clasificarlo como artefacto sin especificaciones técnicas publicadas.
- Seguimiento de la evolución del "estate": si el autor publica nuevos recibos o actualiza la tarjeta, el repositorio puede monitorizarse para detectar la aparición de datos medidos.
- Docencia sobre limitaciones de la documentación de modelos: el caso ilustra la diferencia entre un artefacto publicado y un modelo evaluable, útil en formación sobre rigor en la evaluación de IA.

No se pueden proponer casos como atención al cliente, generación de código o análisis de documentos porque no hay evidencia de que el modelo soporte esas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y no se reproducen esas mediciones en la tarjeta. Cualquier cifra de MMLU, HumanEval, GSM8K u otras métricas sería inventada y, por tanto, se omite.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros y la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma el formato de pesos ni si existen conversiones a GGUF u otros formatos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa porque se desconocen el tamaño, la arquitectura, la licencia y el rendimiento del modelo. A continuación se indica qué falta para poder compararlo con alternativas de su categoría:

| Criterio | salad-ring-ouro-l27 | Alternativa comparable |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Repositorio en HF con 0 descargas | no disponible |

Sin datos de parámetros ni de contexto no se puede seleccionar una clase de modelos comparables (por ejemplo, modelos densos de 7B, MoE de 30B o modelos de contexto largo). La comparativa queda, por tanto, pendiente de que el autor publique las especificaciones o los recibos de evaluación.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas publicadas: no se puede evaluar idoneidad, coste de inferencia ni requisitos de despliegue.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido, lo que impide su adopción en producción con garantías jurídicas.
- Idiomas no declarados: se desconoce si el modelo soporta castellano u otros idiomas.
- Riesgo de alucinación: no evaluable al no conocerse el entrenamiento ni disponer de benchmarks; debe asumirse un riesgo no cuantificado.
- Sesgos conocidos: no documentados; la ausencia de información no implica ausencia de sesgos.
- Trazabilidad incompleta en la propia tarjeta: el autor remite a ficheros de recibos externos que no se enlazan de forma directa en la información disponible, lo que dificulta la verificación.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, lo que sugiere un artefacto recién publicado o de uso interno.
- Fechas de creación y actualización en 2026: conviene verificar la vigencia de la información en el momento de la lectura.
- No debe interpretarse la etiqueta "governed-AI estate" como garantía de calidad o seguridad; es una declaración del autor sin respaldo verificable en la tarjeta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l27
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la tarjeta): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o documentación adicional: no disponible en la información proporcionada.

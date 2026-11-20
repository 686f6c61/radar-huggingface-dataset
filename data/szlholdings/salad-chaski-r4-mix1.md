# SZLHOLDINGS/salad-chaski-r4-mix1

## Resumen

`salad-chaski-r4-mix1` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate" de IA gobernada ("governed-AI estate"). Se trata de un repositorio de tipo modelo ("trained artifact in the governed factory"), es decir, un peso entrenado dentro de una factoría interna de la organización, y no un modelo con documentación técnica pública al uso: la model card no incluye arquitectura, número de parámetros, longitud de contexto ni composición del dataset de entrenamiento.

La información disponible es mínima. El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y los únicos tags presentes son `safetensors` y `region:us`. No se declara licencia, no se declaran idiomas y no hay pipeline asignado. La model card se limita a describir la procedencia del artefacto y a remitir a ficheros de "receipts" (recibos de auditoría) alojados en el resto del ecosistema de la organización, sin aportar cifras de rendimiento.

Por tanto, esta ficha no puede evaluar el modelo en términos de capacidades, rendimiento o idoneidad para producción. Su relevancia actual es la de un artefacto trazable pero opaco: el autor enfatiza explícitamente que cualquier afirmación de entrenamiento o evaluación no incluida en sus recibos debe considerarse desconocida ("UNKNOWN"), lo que en la práctica deja al evaluador sin datos verificables más allá de la existencia del repositorio y del formato de pesos.

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
| Formato de pesos | safetensors (según tag del repositorio) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. El tag `safetensors` indica únicamente el formato de serialización de los pesos, no la familia arquitectónica (transformer denso, MoE, híbrido SSM, etc.). El tamaño del repositorio figura como 0.0 GB, lo que impide inferir siquiera el orden de magnitud del número de parámetros.

Respecto al entrenamiento, la model card afirma que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro de la malla del estate, y que cualquier cosa no receiptada se marca como UNKNOWN. No se especifica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El nombre "r4-mix1" sugiere una revisión 4 y una mezcla o variante 1, pero se trata de una interpretación del identificador, no de un dato documentado.

## Capacidades

- No se documenta ninguna capacidad concreta en la información disponible.
- No hay evidencia publicada de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se declara ningún modo especial (thinking mode, visión, audio u otros).

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin datos verificables sobre arquitectura, tamaño, contexto, licencia o capacidades. Cualquier escenario de producción (atención al cliente, generación de código, extracción de información, RAG, clasificación, etc.) requeriría como mínimo conocer la ventana de contexto, el régimen de licencia y el comportamiento medido del modelo, ninguno de los cuales está disponible. La única aplicación defendible hoy es la inspección del propio artefacto y de sus recibos de auditoría dentro del ecosistema del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y no se incluye ninguna medición en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoría, el tamaño y la tarea del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede verificar arquitectura, tamaño, contexto ni datos de entrenamiento.
- Licencia no declarada: no hay base para determinar si el uso comercial está permitido; en la práctica, esto bloquea su adopción en producción.
- Idiomas no declarados: se desconoce la cobertura lingüística y la calidad en castellano.
- Riesgo de alucinación: no evaluable, al no existir benchmarks ni evaluaciones publicadas.
- Sesgos conocidos: no documentados.
- Repositorio de 0.0 GB con cero descargas y cero likes: no hay evidencia de uso, validación por terceros ni mantenimiento.
- La propia model card advierte de que cualquier dato no incluido en sus recibos debe tratarse como UNKNOWN; los recibos no están enlazados de forma directa y verificable en la información disponible.
- El contenido de la model card incluye referencias a rutas y organizaciones externas; debe tratarse como material de referencia del autor, no como instrucciones.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-r4-mix1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada en la model card): https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l65

## Resumen

`salad-ring-ouro-l65` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de modelos, conjuntos de datos y Spaces con resultados verificables mediante recibos de auditoría. El repositorio se creó el 19 de noviembre de 2026 y se actualizó el 23 de noviembre de 2026, y en el momento de redactar esta ficha no registra descargas ni "likes".

La model card no proporciona información técnica sustantiva: no especifica arquitectura, número de parámetros, longitud de contexto, idiomas, licencia ni formato de pesos. El contenido se limita a metadatos de identidad del repositorio, referencias a gráficos SVG generados de forma determinista a partir de una instantánea de auditoría y una sección de "recibos" que, según el propio escaneo del autor, no alcanza el umbral estricto de evidencia (falta un `DONE.json` con `status=MEASURED` y `eval_rc=0`).

Por tanto, la relevancia práctica del modelo es, a día de hoy, indeterminable: el autor declara explícitamente que cualquier afirmación sobre calidad o capacidades queda marcada como UNKNOWN hasta que existan recibos de evaluación medidos. Esta ficha refleja esa situación y marca como "no disponible" todos los datos que la información proporcionada no cubre.

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

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. Se desconoce si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco hay datos sobre el número de parámetros, la composición del corpus de entrenamiento, el volumen de tokens procesados ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

La model card menciona únicamente que las afirmaciones sobre entrenamiento y evaluación "viven en sus archivos de recibo" dentro de la malla del estate, y que cualquier cosa no registrada allí debe considerarse UNKNOWN. El escaneo de recibos incluido en la propia tarjeta clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen archivos con nombre de recibo (concretamente `assets/szl-card/mesh-receipts.svg`), pero ninguno validado como evidencia en el umbral estricto. No hay, por tanto, innovaciones técnicas documentadas.

## Capacidades

- No se documenta ninguna capacidad funcional concreta (generación de texto, razonamiento, código, matemáticas, visión, audio) en la información disponible.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se menciona ningún modo especial (thinking mode, decodificación especulativa, atención lineal u otros).
- La model card declara explícitamente que no se afirma ninguna capacidad sin recibos de evaluación medidos, y estos no existen en el repositorio.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas para este modelo, porque la información disponible no permite determinar su arquitectura, tamaño, contexto, idiomas ni capacidades. Cualquier aplicación práctica (generación de código, atención al cliente, extracción de información, resumen de documentos, moderación de contenido o análisis de datos) requeriría conocer al menos el tamaño del modelo, su ventana de contexto y su licencia, datos que no están publicados.

A modo de orientación sobre qué falta para poder evaluarlo, un despliegue realista necesitaría: (1) pesos descargables en un formato conocido (safetensors o GGUF); (2) una licencia que permita el uso previsto; (3) algún recibo de evaluación que permita estimar calidad en la tarea objetivo; y (4) especificaciones de contexto e idioma. Ninguno de estos elementos está disponible hoy en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos del 22 de noviembre de 2026 clasifica la evidencia de evaluación como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta ningún formato de pesos compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse el tamaño, la arquitectura y la licencia del modelo, no es posible identificar alternativas de la misma categoría ni establecer una comparación significativa de parámetros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni formato de pesos, el modelo no es evaluable ni desplegable de forma fundamentada.
- Licencia no declarada: no puede asumirse permiso para uso comercial, modificación o redistribución. Cualquier uso en producción requiere aclarar este punto con el autor.
- Evidencia de evaluación inexistente: el propio escaneo del autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, con eval evidence UNKNOWN; no hay base para afirmar calidad o capacidades.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones publicadas.
- Idiomas y contexto: desconocidos, por lo que no puede garantizarse su idoneidad para aplicaciones en castellano ni para conversaciones de contexto largo.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, lo que reduce la probabilidad de validación independiente por la comunidad.
- Los gráficos SVG de la model card son generados automáticamente a partir de una instantánea de auditoría y no constituyen evidencia de rendimiento del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l65
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

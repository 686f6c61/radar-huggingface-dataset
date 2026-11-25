# SZLHOLDINGS/salad-ring-ouro-l109

## Resumen

salad-ring-ouro-l109 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominada "estate" de IA gobernada, un conjunto de repositorios de modelos, datasets y Spaces que el autor presenta con trazabilidad a recibos de auditoría. El repositorio aparece en Hugging Face con licencia Apache 2.0 y la etiqueta de región "us", sin pipeline declarado, sin idiomas especificados y sin métricas de descargas ni interacciones en el momento de la consulta.

La model card no documenta arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni resultados de evaluación. Se limita a describir la identidad del repositorio, enlazar a la organización del autor en GitHub y presentar gráficos SVG generados de forma determinista a partir de una instantánea de auditoría fechada el 20 de noviembre de 2026. El propio autor declara explícitamente que cualquier dato no respaldado por un recibo medido se etiqueta como UNKNOWN, y la sección de recibos indica que no existe un fichero DONE.json estricto con estado MEASURED.

Por tanto, la relevancia técnica del modelo no puede evaluarse con la información disponible: no hay evidencia publicada de capacidades, rendimiento ni composición del entrenamiento. Esta ficha recoge lo que el autor afirma y marca como no disponible todo lo demás, sin inferir datos.

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

No se ha publicado información sobre la arquitectura del modelo en la model card ni en los metadatos del repositorio. No se especifica si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de parámetros, la longitud de contexto nativa ni la tokenización empleada.

Respecto al entrenamiento, la card menciona de forma genérica que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro de la malla de la estate, pero la sección RECEIPTS indica que el escaneo estricto de la familia "salad" no encontró un DONE.json con estado MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento. El único fichero con nombre de recibo detectado es un SVG (`assets/szl-card/mesh-receipts.svg`), que el propio autor aclara que no está validado como evidencia. No se documentan número de tokens, composición del dataset, ni fases de RLHF, DPO o similares.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se menciona ningún modo especial (thinking mode, visión, audio u otros).

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia publicada de capacidades, arquitectura o rendimiento. Cualquier aplicación práctica requeriría primero verificar la naturaleza del artefacto y obtener recibos de evaluación medidos. Los escenarios que podrían plantearse quedarían condicionados a esa verificación previa:

- Evaluación interna de artefactos de una estate gobernada: usar el repositorio como ejemplo de flujo de trazabilidad con recibos y etiquetado MEASURED/REPORTED/UNKNOWN, no como modelo listo para producción.
- Auditoría de licencias: comprobar la nota del autor sobre la asignación de la etiqueta Apache 2.0 el 25 de noviembre de 2026 por operaciones de la estate, sin evidencia de licencia upstream por fichero.
- Reproducción de la instantánea de auditoría: regenerar los SVG deterministas a partir de la instantánea fechada el 20 de noviembre de 2026 para validar la metodología de la card.
- Integración en pipelines de verificación: usar la ausencia de DONE.json estricto como caso de prueba de un sistema que bloquee promociones sin recibos medidos.
- Docencia sobre documentación de modelos: ilustrar cómo una model card puede declarar honestamente UNKNOWN en lugar de inventar cifras.
- Archivado y procedencia: conservar el repositorio como registro de la evolución de la estate SZLHOLDINGS entre el 19 y el 25 de noviembre de 2026.

Cualquier uso que requiera inferencia real (atención al cliente, generación de código, análisis de documentos) no puede justificarse con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y la sección de recibos indica que la evidencia de evaluación es UNKNOWN al no existir un DONE.json estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y la arquitectura).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamaño, la arquitectura ni la tarea del modelo, no es posible identificar alternativas comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se documentan arquitectura, parámetros, contexto, tokenizador ni formato de pesos, lo que impide cualquier planificación de despliegue.
- Falta de evidencia de evaluación: el escaneo estricto de recibos no encontró DONE.json con estado MEASURED; la evidencia de evaluación se marca como UNKNOWN.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni pruebas publicadas.
- Licencia: la etiqueta Apache 2.0 fue asignada por operaciones de la estate el 25 de noviembre de 2026, y el propio autor aclara que no se reclama evidencia de licencia upstream por fichero; conviene verificar la procedencia antes de uso comercial.
- Idiomas: no declarados, por lo que no puede garantizarse soporte de castellano ni de ningún otro idioma.
- Madurez del artefacto: sin descargas ni interacciones registradas en el momento de la consulta, y con una card generada automáticamente por una herramienta interna (`estate-cards weaver v0.1.0`), lo que sugiere un artefacto de flujo interno más que un modelo publicado para uso general.
- No apto para producción sin verificación previa de pesos, tokenizador y recibos de evaluación medidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l109
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización del autor en GitHub: https://github.com/szl-holdings
- Herramienta de generación de cards: https://github.com/szl-holdings/estate-cards

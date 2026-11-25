# SZLHOLDINGS/salad-ring-ouro-l111

## Resumen

`salad-ring-ouro-l111` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados trazables mediante recibos de auditoría. El repositorio de Hugging Face no incluye model card técnica en el sentido habitual: la documentación disponible se limita a metadatos de identidad, insignias generadas automáticamente y una sección de "receipts" que describe el estado de la evidencia de evaluación.

La información publicada no especifica arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El propio autor declara explícitamente que cualquier afirmación de entrenamiento o evaluación que no esté respaldada por un recibo medido se marca como UNKNOWN, y el escaneo de recibos de la familia "salad" clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con estado MEASURED, código de evaluación correcto y marca temporal.

Por tanto, la relevancia de esta ficha es fundamentalmente documental: permite identificar el artefacto, su licencia (Apache 2.0, fijada por operaciones del estate el 2026-11-25) y el hecho de que no hay evidencia medida de calidad o capacidades. Cualquier uso en producción requeriría obtener del autor los recibos de entrenamiento y evaluación, o realizar una evaluación propia. Los resultados de búsqueda web disponibles no guardan relación con el modelo (tratan sobre suscripciones de Xbox Game Pass) y no aportan datos técnicos.

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

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados ni la existencia de fases de alineación como RLHF o DPO. La model card no contiene sección técnica alguna más allá de los metadatos de identidad y las insignias SVG generadas de forma determinista a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z (marcada como MEASURED).

El autor indica que las afirmaciones de entrenamiento y evaluación de este artefacto residen en sus ficheros de recibo dentro de la malla del estate, y que cualquier dato no respaldado por un recibo se considera UNKNOWN. El escaneo estricto de la tranche 6 (chunk 4, 2026-11-22) concluye que no existe un `DONE.json` que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que la evidencia de evaluación es UNKNOWN. El único fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que el propio escaneo aclara que es una coincidencia por palabra clave y no evidencia validada. No se describe ninguna innovación técnica (decodificación especulativa, atención lineal, etc.).

## Capacidades

- No se ha documentado ninguna capacidad concreta (generación de texto, razonamiento, código, matemáticas o visión) en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas del repositorio está vacío).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- El pipeline de Hugging Face no está definido, por lo que no se puede inferir la tarea para la que fue concebido el artefacto.

## Casos de uso

No es posible recomendar casos de uso concretos sin evidencia medida de capacidades. Los siguientes escenarios son únicamente marcos de evaluación que un equipo debería validar por su cuenta antes de adoptar el modelo:

- Evaluación interna controlada: desplegar el artefacto en un entorno aislado y ejecutar una batería propia de pruebas (perplejidad, generación, seguimiento de instrucciones) para determinar qué tarea cubre realmente, dado que el pipeline no está declarado.
- Auditoría de procedencia: usar el repositorio como caso de estudio de gobernanza de artefactos, verificando la trazabilidad entre la instantánea de auditoría (2026-11-20) y los recibos citados en la malla del estate.
- Integración en pipelines de verificación: incorporar el modelo como sujeto de pruebas en un sistema de CI que compruebe que los artefactos del estate cumplen el umbral estricto de recibos antes de promocionarse.
- Reproducción de la instantánea de auditoría: regenerar las insignias SVG deterministas a partir de la instantánea fechada para validar que la generación es reproducible, tal como afirma el autor.
- Base para comparativas de licencia: emplear el artefacto como referencia en estudios sobre cómo se asignan licencias a nivel de repositorio (Apache 2.0 fijada por operaciones) sin evidencia de licencia por fichero.
- Formación sobre documentación de modelos: utilizar la model card como ejemplo de declaración explícita de UNKNOWN frente a la invención de métricas, en talleres de buenas prácticas de publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información publicada no permite identificar la categoría del modelo (tamaño, tarea, arquitectura), por lo que no es posible establecer una comparación fundamentada con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni formato de pesos, no se puede planificar el despliegue ni estimar costes de inferencia.
- Evidencia de evaluación inexistente: el escaneo estricto clasifica el repositorio como `RECEIPT_FILES_NO_DONE`; no hay `DONE.json` con estado MEASURED ni recibo de entrenamiento validado.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni pruebas publicadas.
- Idiomas: el campo de idiomas está vacío; no se puede asumir soporte de castellano ni de ninguna otra lengua.
- Licencia: Apache 2.0 fijada a nivel de repositorio por operaciones del estate (nota w45z, 2026-11-25), sin evidencia de licencia por fichero del upstream; conviene verificar los derechos de los pesos antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado el 2026-11-19 y actualizado el 2026-11-25; sin pipeline declarado ni documentación de uso.
- Los resultados de búsqueda web asociados no son pertinentes (tratan sobre Xbox Game Pass) y no deben citarse como respaldo técnico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l111
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de tarjetas del estate: https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o repositorio adicionales: no disponible

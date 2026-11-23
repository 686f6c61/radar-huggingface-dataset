# SZLHOLDINGS/salad-ring-ouro-l72

## Resumen

`salad-ring-ouro-l72` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el propio autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de "receipts" (recibos de auditoría). El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de una supuesta factoría gobernada, pero la model card no describe arquitectura, tamaño, datos de entrenamiento ni capacidades concretas.

La información disponible es extremadamente escasa. La model card no incluye tabla de especificaciones, no declara licencia, no declara idiomas, no publica benchmarks ni curvas de evaluación medidas, y el propio autor reconoce explícitamente que cualquier afirmación de entrenamiento o evaluación que no esté en sus recibos debe considerarse "UNKNOWN". La sección de recibos del repositorio indica que se ha encontrado un fichero con nombre de recibo (`assets/szl-card/mesh-receipts.svg`), pero que no existe un `DONE.json` que cumpla el "strict bar" (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que la evidencia de evaluación se clasifica como desconocida.

Por tanto, esta ficha se limita a documentar lo que el repositorio declara y a marcar como "no disponible" todo aquello que no se puede verificar. No se debe asumir ninguna capacidad, tamaño o rendimiento a partir del nombre del modelo ni de los gráficos SVG incluidos, que son ilustrativos del estado del "estate" y no resultados medidos del artefacto.

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
| Formato de pesos | no disponible (el repositorio no declara ficheros de pesos; solo se referencia `assets/szl-card/mesh-receipts.svg`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se declara el número de parámetros, la longitud de contexto, la tokenizador ni el vocabulario.

En cuanto al entrenamiento, el autor afirma que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" y que cualquier cosa no recibida en la tarjeta es "UNKNOWN". La sección de recibos indica que el escaneo estricto de la familia "salad" (tranche 6, chunk 8, con fecha 2026-11-22) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no un `DONE.json` que cumpla el estándar estricto. No se declara número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o cualquier otra fase de alineamiento.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües ni idiomas soportados.
- No se declara ningún modo especial (thinking mode, visión, audio, decodificación especulativa, etc.).
- El autor indica explícitamente que no se hace ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos.

## Casos de uso

No es posible recomendar casos de uso concretos para este artefacto porque no se ha documentado ninguna capacidad, tamaño, contexto ni licencia. Cualquier aplicación en producción requeriría primero verificar los recibos de entrenamiento y evaluación en el repositorio de origen y en la organización `szl-holdings` en GitHub. Mientras no exista un `DONE.json` que cumpla el estándar estricto, el uso de este modelo en escenarios reales (atención al cliente, generación de código, análisis documental, agentes, etc.) no está justificado por evidencia publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como `UNKNOWN` (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no declara pesos en formatos safetensors ni GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable porque se desconocen el tamaño, la arquitectura, la licencia y el rendimiento del modelo, y no se ha identificado en la información proporcionada ningún modelo comparable de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se declara arquitectura, parámetros, contexto, tokenizador ni formato de pesos.
- Evidencia de evaluación inexistente según el propio estándar del autor: el repositorio se clasifica como `RECEIPT_FILES_NO_DONE` y la evidencia de evaluación es `UNKNOWN`.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en ausencia de licencia explícita, debe asumirse que no hay autorización clara para uso comercial.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones publicadas.
- Los gráficos SVG incluidos (`org-context.svg`, `mesh-receipts.svg`) son generados de forma determinista a partir de una instantánea de auditoría del "estate" y no constituyen por sí mismos evidencia de calidad del modelo.
- El resultado de la búsqueda web proporcionado no guarda relación con el modelo (trata sobre software de edición de vídeo) y no aporta información técnica relevante.
- Cualquier uso en producción debería posponerse hasta que el autor publique recibos de entrenamiento y evaluación verificables, o hasta que se inspeccionen directamente los ficheros de pesos del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l72
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Herramienta de generación de tarjetas del autor: https://github.com/szl-holdings/estate-cards
- Paper, blog, demo o documentación adicional: no disponible.

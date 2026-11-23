# SZLHOLDINGS/salad-ring-ouro-l64

## Resumen

`salad-ring-ouro-l64` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el propio autor denomina "estate de IA gobernada": un conjunto de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (*receipts*). El repositorio de Hugging Face no contiene ninguna descripción funcional del modelo: la model card se limita a metadatos de identidad, insignias y referencias a diagramas SVG generados de forma determinista a partir de una instantánea de auditoría.

La información técnica disponible es prácticamente nula. No se declara arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni idiomas. El sufijo "l64" del nombre podría sugerir una variante de 64 capas o un identificador interno, pero no hay documentación que lo confirme, por lo que no debe interpretarse como especificación.

El propio autor reconoce de forma explícita en la sección "Honesty" que cualquier afirmación sobre entrenamiento o evaluación vive en ficheros de recibos externos y que "anything not receipted here is UNKNOWN". La sección "RECEIPTS" del README clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo (un SVG), pero no existe un `DONE.json` estricto con `status=MEASURED` ni `eval_rc=0`. En consecuencia, la evidencia de evaluación es UNKNOWN y no existe base medible para afirmar ninguna capacidad del modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo referencia `assets/szl-card/mesh-receipts.svg`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni innovaciones técnicas como decodificación especulativa o atención lineal.

El autor delega cualquier afirmación de entrenamiento a "receipt files" alojados en el mesh del estate, pero el escaneo estricto de recibos (tranche 6, chunk 8, 2026-11-22) concluye que no existe un `DONE.json` válido en este repositorio. Por tanto, no hay evidencia medida de que el artefacto haya completado un pipeline de entrenamiento verificable según el propio estándar del autor.

## Capacidades

- No se declara ninguna capacidad funcional en la información disponible.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas.
- No se menciona ningún modo especial (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones verificables. Cualquier aplicación en producción requeriría primero confirmar la existencia de pesos utilizables, la licencia y una evaluación reproducible. A modo de advertencia operativa:

- Evaluación interna de artefactos: el repositorio podría servir como ejemplo de estructura de model card generada automáticamente, no como modelo desplegable.
- Auditoría de procedencia: útil para estudiar cómo un "estate" documenta (o no) sus recibos de entrenamiento y evaluación.
- Cualquier otro uso (generación de texto, código, atención al cliente, RAG, agentes) queda descartado por ausencia de especificaciones, licencia y pesos documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluación es UNKNOWN al no existir un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos como safetensors o GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen parámetros, contexto, tarea y licencia del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede determinar tamaño, arquitectura ni contexto.
- Sin licencia declarada: no hay base legal para uso comercial ni para redistribución.
- Sin pesos documentados: el repositorio solo referencia un SVG de recibos; no se confirma la presencia de ficheros de modelo.
- Evidencia de evaluación UNKNOWN según el propio estándar del autor (`RECEIPT_FILES_NO_DONE`).
- Riesgo elevado de que se trate de un artefacto de andamiaje (scaffolding) más que de un modelo entrenado y utilizable.
- Riesgo de alucinación y sesgos: no evaluable sin pesos ni datos de entrenamiento.
- No apto para producción en su estado actual.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l64
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada): https://github.com/szl-holdings/estate-cards
- Paper, blog o demo: no disponible

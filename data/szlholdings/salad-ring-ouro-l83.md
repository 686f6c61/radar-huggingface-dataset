# SZLHOLDINGS/salad-ring-ouro-l83

## Resumen

salad-ring-ouro-l83 es un artefacto de modelo publicado en Hugging Face por la organización SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts) y auditorías datadas. El repositorio se presenta como un "trained artifact in the governed factory", es decir, un modelo entrenado dentro de un pipeline interno de la organización, pero la model card no aporta ninguna especificación técnica sobre el propio modelo.

La información pública disponible es prácticamente nula en lo que respecta a arquitectura, tamaño, contexto, datos de entrenamiento o capacidades. La model card se limita a describir el sistema de gobernanza y auditoría del "estate" (gráficos SVG deterministas, recibos de auditoría con fecha 2026-11-20 y un escaneo estricto de recibos del 2026-11-22) y declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se marca como UNKNOWN.

El propio escaneo de recibos incluido en la card clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un DONE.json estricto con status=MEASURED, eval_rc=0 y timestamp. En consecuencia, la evidencia de evaluación es UNKNOWN y no se puede verificar ninguna capacidad del modelo. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

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

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante, ni detalla el número de parámetros, la longitud de contexto o el tokenizador empleado.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, idiomas), sobre si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre innovaciones técnicas concretas. La única información relacionada con el entrenamiento es la afirmación genérica de que se trata de un "trained artifact" y la referencia a un sistema de recibos de auditoría cuya verificación estricta no se ha superado según el propio escaneo incluido en la card.

## Capacidades

- No se ha documentado ninguna capacidad concreta del modelo en la información disponible.
- No hay evidencia de soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No hay evidencia de soporte de tool calling o function calling.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay evidencia de capacidades multilingües ni de idiomas soportados.
- No hay evidencia de modos especiales como thinking mode, visión o audio.

## Casos de uso

No es posible recomendar casos de uso concretos para este modelo a partir de la información disponible, ya que no se ha documentado ninguna capacidad, arquitectura ni requisito de despliegue. Cualquier aplicación en producción requeriría primero una evaluación independiente del artefacto. A modo de advertencia operativa:

- Evaluación previa obligatoria: antes de considerar cualquier uso, sería necesario inspeccionar los pesos y ejecutar una batería propia de evaluación, dado que no existe evidencia medida publicada.
- Integración en pipelines internos: solo tendría sentido dentro de un entorno controlado del propio autor, donde existan los recibos de auditoría referenciados pero no publicados.
- Investigación sobre gobernanza de artefactos: el repositorio puede resultar de interés como ejemplo de model card generada automáticamente con etiquetado de evidencia (MEASURED/REPORTED/UNKNOWN), no como modelo utilizable.
- Auditoría de trazabilidad: útil para estudiar mecanismos de declaración de evidencia y detección de artefactos sin evaluación verificable.
- Docencia sobre riesgos de supply chain de modelos: sirve como caso práctico de repositorio sin licencia, sin idiomas declarados y sin benchmarks.
- Cualquier otro uso (atención al cliente, generación de código, agentes, etc.) no puede justificarse con la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría datada haya medido, y el escaneo de recibos incluido clasifica la evidencia de evaluación como UNKNOWN (sin DONE.json estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros y la arquitectura.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamaño, la arquitectura, la licencia ni las capacidades del modelo, no es posible establecer una comparación fundamentada con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l83 | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativa comparable | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parámetros, contexto, tokenizador ni formato de pesos, lo que impide planificar cualquier despliegue.
- Sin licencia declarada: no hay autorización explícita de uso, lo que genera incertidumbre legal para cualquier uso comercial o redistribución.
- Sin idiomas declarados: no se puede asumir cobertura multilingüe ni siquiera monolingüe.
- Evidencia de evaluación UNKNOWN: el propio escaneo del autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, sin DONE.json estricto con status=MEASURED.
- Riesgo de alucinación y sesgos: no evaluables al no existir benchmarks ni documentación de entrenamiento.
- Señales de baja madurez: 0 descargas, 0 likes, creación y última actualización en noviembre de 2026, y una model card generada automáticamente por una herramienta interna (estate-cards weaver v0.1.0).
- No apto para producción sin auditoría independiente: cualquier integración requeriría verificar los pesos, ejecutar evaluaciones propias y clarificar la licencia con el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l83
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada como fuente canónica): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada): https://github.com/szl-holdings/estate-cards

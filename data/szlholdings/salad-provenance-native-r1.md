# SZLHOLDINGS/salad-provenance-native-r1

## Resumen

`salad-provenance-native-r1` es un modelo publicado por SZLHOLDINGS dentro de su catálogo denominado "governed-AI estate", una colección de modelos, datasets y Spaces con trazabilidad declarada hacia sus fuentes. El repositorio se presenta como un artefacto entrenado ("trained artifact in the governed factory"), pero la model card no documenta arquitectura, tamaño, tokenizador ni datos de entrenamiento: se limita a describir el sistema de evidencias y auditoría que rodea al modelo.

La información disponible es fundamentalmente de gobernanza y procedencia, no técnica. El autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un fichero de recibo ("receipt") medido se considera UNKNOWN, y la auditoría más reciente (scan estricto del 22 de noviembre de 2026) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero ningún `DONE.json` que cumpla el umbral estricto de evidencia medida. En consecuencia, no hay resultados de evaluación verificables.

El interés actual del modelo es, por tanto, limitado para evaluación técnica y relevante sobre todo como caso de estudio de empaquetado de procedencia: licencia Apache 2.0, creado el 18 de noviembre de 2026 y actualizado el 25 de noviembre de 2026, con cero descargas y cero "likes" en el momento de redactar esta ficha. No se debe asumir ninguna capacidad concreta a partir del nombre ni de la estética de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo: la model card no indica si se trata de un transformer denso, un mixture-of-experts, un modelo híbrido con capas de estado recurrente ni ninguna otra variante. Tampoco se especifican el número de parámetros, la longitud de contexto nativa, el vocabulario del tokenizador ni la composición del corpus de entrenamiento.

Respecto al entrenamiento, el autor remite a los ficheros de recibo del "estate mesh" y declara que cualquier dato no recibido en la propia card es UNKNOWN. No consta número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento, ni innovaciones de inferencia como decodificación especulativa o atención lineal. La auditoría `receipts-tranche-6 chunk-3` (22 de noviembre de 2026) confirma que no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`, por lo que la evidencia de evaluación se marca como UNKNOWN.

## Capacidades

- Generación de texto: no confirmada; no hay documentación que la respalde.
- Razonamiento, código y matemáticas: no confirmados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Trazabilidad de procedencia: el repositorio incluye gráficos SVG deterministas generados desde una instantánea de auditoría con fecha (2026-11-20T03:48:04Z) y etiquetas MEASURED/REPORTED/UNKNOWN, lo que constituye un mecanismo de documentación, no una capacidad del modelo.

## Casos de uso

- Auditoría de cadenas de procedencia en modelos open source: el repositorio sirve como ejemplo práctico de cómo etiquetar afirmaciones como MEASURED, REPORTED o UNKNOWN y de cómo una auditoría estricta detecta la ausencia de evidencia medida (`RECEIPT_FILES_NO_DONE`).
- Evaluación de políticas de gobernanza de IA: útil para equipos que diseñan requisitos internos de "recibos" verificables antes de aprobar un modelo para producción.
- Docencia sobre model cards: la card es un caso claro de separación entre afirmaciones de marketing y evidencia verificable, con identificador de tarjeta (`e98fa93af24f7f9a`) y marca temporal de generación.
- Integración en pipelines de catalogación: el formato de la card (SVG deterministas, stdlib Python, sin dependencias externas) puede reproducirse en herramientas internas de inventario de modelos.
- Pruebas de herramientas de escaneo de repositorios: útil para validar detectores que distinguen ficheros con nombre de recibo de evidencias reales.
- Referencia para licenciamiento: el propio autor documenta que la etiqueta Apache 2.0 se asignó el 25 de noviembre de 2026 por decisión operativa del "estate ops" sin evidencia de licencia por fichero del upstream, lo que lo convierte en un caso de estudio sobre riesgos de licencia heredada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la auditoría más reciente no encuentra evidencia de evaluación estricta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable sin conocer el tamaño, la arquitectura y el rendimiento del modelo. A modo de referencia estructural, se compara únicamente el plano documental:

| Aspecto | salad-provenance-native-r1 | Modelos open weight típicos (p. ej. familias Llama, Qwen, Mistral) |
|---|---|---|
| Arquitectura documentada | no disponible | declarada en la model card |
| Número de parámetros | no disponible | declarado |
| Contexto | no disponible | declarado |
| Benchmarks verificables | ninguno (UNKNOWN) | habitualmente publicados |
| Licencia | apache-2.0 (asignada por decisión operativa, sin evidencia por fichero) | licencia con términos publicados |
| Madurez del ecosistema | 0 descargas, 0 likes | soporte en vLLM, llama.cpp, Ollama, etc. |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador no es posible planificar su despliegue.
- Evidencia de evaluación inexistente: la auditoría estricta del 22 de noviembre de 2026 clasifica el repositorio como `RECEIPT_FILES_NO_DONE` y marca la evaluación como UNKNOWN.
- Riesgo de alucinación: no evaluable; no hay datos que permitan estimarlo.
- Idiomas: el campo de idiomas está vacío, por lo que no se garantiza soporte de castellano ni de ningún otro idioma.
- Licencia: aunque la etiqueta es Apache 2.0, la propia card indica que se asignó por decisión operativa del estate ("CTO lap W45Z rights-call") sin evidencia de licencia por fichero del upstream. Antes de un uso comercial conviene verificar la procedencia real de los pesos.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta, sin comunidad ni issues documentados.
- Nombre y presentación: el nombre del modelo no describe ninguna capacidad técnica verificable; no debe inferirse funcionalidad a partir de él.
- Para producción: no se recomienda su uso sin una evaluación independiente previa y sin confirmar la existencia y el contenido de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-provenance-native-r1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada como fuente canónica): https://github.com/szl-holdings
- Herramienta de generación de cards (estate-cards weaver): https://github.com/szl-holdings/estate-cards

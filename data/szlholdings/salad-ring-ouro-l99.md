# SZLHOLDINGS/salad-ring-ouro-l99

## Resumen

`salad-ring-ouro-l99` es un artefacto de modelo publicado por la organización SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo verificables). El repositorio de Hugging Face no contiene, a fecha de la información disponible, una model card técnica convencional: la documentación se limita a metadatos de identidad, referencias a gráficos SVG generados de forma determinista y una sección de honestidad que declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté en los ficheros de recibo es UNKNOWN.

La información pública no especifica arquitectura, número de parámetros, longitud de contexto, idiomas ni licencia. El propio autor indica que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos incluido en la card clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) pero no existe un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0`, timestamp y recibo de entrenamiento.

Por tanto, esta ficha documenta lo que se puede verificar (identidad del repositorio, fechas, estado de evidencia) y marca como "no disponible" todo lo demás. Es relevante ahora únicamente como caso de estudio de publicación de artefactos con trazabilidad declarativa, no como modelo evaluable para producción.

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
| Formato de pesos | no disponible (el repositorio solo referencia `assets/szl-card/mesh-receipts.svg`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros ni la composición del dataset de entrenamiento. La model card no incluye sección de entrenamiento, número de tokens, ni referencias a RLHF, DPO u otras técnicas de alineamiento.

La única información relacionada con el proceso es de tipo meta-documental: el autor declara que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro del mesh del estate, y que cualquier cosa no receiptada en la card es UNKNOWN. El escaneo `receipts-tranche-6 chunk-10` (2026-11-22) clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, con evidencia de evaluación UNKNOWN por ausencia de `DONE.json` estricto. Los gráficos SVG de la card se describen como generados de forma determinista con la stdlib de Python a partir de una instantánea de auditoría con fecha 2026-11-20T03:48:04Z etiquetada como MEASURED, pero esa instantánea no se traduce en métricas de modelo publicadas en el repositorio.

## Capacidades

- No se documenta ninguna capacidad funcional verificable (generación de texto, razonamiento, código, matemáticas, visión, audio).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas cubiertos.
- No se documenta modo de pensamiento (thinking mode) ni capacidades especiales.
- Lo único verificable es la existencia de un sistema de recibos y gráficos de auditoría asociados al repositorio, no capacidades del modelo en sí.

## Casos de uso

- Auditoría de publicación de artefactos: usar el repositorio como ejemplo de card generada automáticamente (`estate-cards weaver v0.1.0`) con etiquetado MEASURED/REPORTED/UNKNOWN y hora de captura, para diseñar un pipeline propio de documentación reproducible de modelos.
- Verificación de trazabilidad en una organización: replicar el patrón de `DONE.json` con `status=MEASURED`, `eval_rc=0` y timestamp como puerta de calidad antes de declarar que un modelo está evaluado.
- Formación interna sobre higiene de model cards: analizar cómo una card que declara UNKNOWN explícitamente evita afirmaciones no respaldadas, en contraste con cards que publican cifras sin recibo.
- Integración en un catálogo de activos: indexar el repo por sus metadatos de identidad (repo, fuente canónica, kind=model) para inventariar artefactos del estate sin asumir capacidades.
- Detección de artefactos incompletos en un registro: usar la clasificación `RECEIPT_FILES_NO_DONE` como señal para excluir el modelo de pipelines de evaluación automática hasta que exista evidencia medida.
- Estudio de gobernanza de IA: comparar el enfoque de "receipts" del autor con prácticas estándar de evaluación reproducible en organizaciones que publican modelos open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia card declara que "no benchmark number is asserted on this card beyond what a dated audit measured" y que la evidencia de evaluación es UNKNOWN por ausencia de `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta ningún formato de pesos desplegable.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoría comparable (tamaño, tarea, arquitectura) con la información publicada, y el repositorio no ofrece pesos ni especificaciones que permitan emparejarlo con alternativas.

| Modelo | Parámetros | Contexto | Licencia | Estado de evidencia |
|---|---|---|---|---|
| salad-ring-ouro-l99 | no disponible | no disponible | no disponible | UNKNOWN (sin `DONE.json`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador documentados, no es posible planificar su uso en producción.
- Evidencia de evaluación UNKNOWN: el escaneo de recibos clasifica el repo como `RECEIPT_FILES_NO_DONE`; no hay `DONE.json` con `status=MEASURED` ni `eval_rc=0`.
- Licencia no declarada: no se puede asumir permiso de uso comercial, modificación ni redistribución.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otros idiomas.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación de datos de entrenamiento.
- Los gráficos SVG y la instantánea de auditoría (2026-11-20T03:48:04Z, MEASURED) no constituyen evidencia de calidad del modelo; son metadatos del proceso de documentación.
- El repositorio registra 0 descargas y 0 likes, y no declara pipeline de Hugging Face, lo que sugiere un artefacto no validado por la comunidad.
- Cualquier uso en producción debería bloquearse hasta que el autor publique pesos, licencia y recibos de evaluación medidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l99
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización GitHub): https://github.com/szl-holdings
- Herramienta de generación de cards citada: https://github.com/szl-holdings/estate-cards

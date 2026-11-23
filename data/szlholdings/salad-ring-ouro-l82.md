# SZLHOLDINGS/salad-ring-ouro-l82

## Resumen

`salad-ring-ouro-l82` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "estate de IA gobernada": un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad documental. El repositorio se creó el 19 de noviembre de 2026 y se actualizó el 23 de noviembre de 2026, sin descargas ni interacciones registradas en Hugging Face en el momento de redactar esta ficha.

La model card no describe arquitectura, tamaño, contexto ni datos de entrenamiento. En su lugar, el autor dedica el documento a explicar su política de evidencia: cualquier afirmación sobre entrenamiento o evaluación debe estar respaldada por ficheros de recibo (*receipts*) con marcas temporales y estado medido. La propia tarjeta reconoce que este repositorio carece de un `DONE.json` estricto, por lo que la evidencia de evaluación figura como UNKNOWN.

Por tanto, nos encontramos ante un repositorio con muy poca información técnica pública. Es relevante únicamente como ejemplo de práctica de gobernanza y trazabilidad en la publicación de modelos, no como un modelo evaluable para desarrollo o investigación en este momento.

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

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de parámetros, la composición del dataset de entrenamiento ni el proceso de alineación (RLHF, DPO u otros). La model card indica explícitamente que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibo del "estate mesh" del autor, y que cualquier dato no respaldado por esos recibos se considera UNKNOWN.

El único elemento técnico destacable es el sistema de publicación: la tarjeta se genera de forma determinista mediante la herramienta `estate-cards weaver v0.1.0` (Python de biblioteca estándar, SVG determinista, paleta KANCHAY) a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z. El escaneo `receipts-tranche-6 chunk-9` clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`), pero no un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal.

## Capacidades

- No se ha documentado ninguna capacidad funcional del modelo en la información disponible.
- No hay evidencia de soporte de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No hay evidencia de soporte de *tool calling* ni de *function calling*.
- No hay evidencia de capacidades de agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües.
- No hay evidencia de modos especiales (*thinking mode*, visión, audio).

## Casos de uso

- Auditoría de gobernanza de modelos: el repositorio puede usarse como ejemplo de formato de tarjeta generada de forma determinista con marcas temporales y clasificación de evidencia (MEASURED/REPORTED/UNKNOWN), útil para equipos que diseñan pipelines de publicación con trazabilidad.
- Verificación de cadenas de custodia documental: el patrón de recibos con estado y código de retorno de evaluación (`eval_rc`) sirve como referencia para implementar controles de calidad en un registro interno de modelos.
- Docencia sobre prácticas de publicación responsable: la tarjeta ilustra cómo declarar explícitamente la ausencia de evidencia en lugar de inferir resultados, un caso útil en formación de investigadores.
- Diseño de sistemas de tarjetas automáticas: la herramienta `estate-cards weaver` y su enfoque de SVG determinista desde instantáneas de auditoría pueden inspirar generadores internos de fichas técnicas.
- Evaluación de riesgos de cadena de suministro: la clasificación `RECEIPT_FILES_NO_DONE` permite detectar artefactos que aparentan tener evidencia sin cumplir el umbral estricto, relevante para equipos de seguridad que revisan dependencias de modelos.
- No se recomienda su uso en aplicaciones de inferencia real: no hay información sobre pesos, tokenizador, licencia ni rendimiento que permita desplegarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se ha identificado en la información proporcionada ningún modelo comparable en tamaño, tarea o licencia, dado que se desconocen las características técnicas del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador publicados, el modelo no es evaluable ni desplegable de forma responsable.
- Evidencia de evaluación inexistente: el escaneo `receipts-tranche-6 chunk-9` clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero no un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse reserva de derechos por defecto.
- Idiomas no declarados: no hay información sobre cobertura lingüística ni calidad por idioma.
- Riesgo de alucinación y sesgos: no evaluable sin datos de entrenamiento ni evaluaciones publicadas.
- Señales de baja tracción: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa revisión por parte de la comunidad.
- Fechas de creación y actualización en 2026: conviene verificar la coherencia temporal del repositorio antes de cualquier uso.
- No apto para producción: sin pesos, tokenizador ni documentación de inferencia, cualquier integración carecería de base técnica verificable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l82
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (según la model card): https://github.com/szl-holdings/estate-cards

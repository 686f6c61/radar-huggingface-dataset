# SZLHOLDINGS/salad-ring-ouro-l71

## Resumen

`salad-ring-ouro-l71` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "estate" de IA gobernada: una colección de modelos, datasets y Spaces con resultados "receipted" (documentados mediante ficheros de recibo auditables). El repositorio de Hugging Face no incluye información técnica sustantiva sobre el modelo: no hay arquitectura declarada, ni número de parámetros, ni longitud de contexto, ni datos de entrenamiento.

La model card se limita a describir el marco de gobernanza y trazabilidad de SZLHOLDINGS (generación determinista de tarjetas SVG, etiquetas MEASURED/REPORTED/UNKNOWN, auditorías con fecha) y a afirmar explícitamente que cualquier dato no respaldado por un recibo medido se considera UNKNOWN. La sección RECEIPTS del propio autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: existen ficheros con nombre de recibo (`assets/szl-card/mesh-receipts.svg`) pero no hay un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal, por lo que la evidencia de evaluación es UNKNOWN incluso según el criterio del autor.

Por tanto, esta ficha no puede caracterizar el modelo más allá de su identidad administrativa. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, fue creado el 2026-11-19 y actualizado el 2026-11-23, y no declara licencia, idiomas ni pipeline. Se documenta a continuación todo lo que sí es verificable, marcando explícitamente como "no disponible" cada parámetro ausente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Pipeline declarado | no disponible |
| Etiquetas del repo | `region:us` |
| Autor | SZLHOLDINGS |
| Fecha de creación | 2026-11-19 |
| Última actualización | 2026-11-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona tipo de transformer, mecanismo de atención, posible mezcla de expertos, capas recurrentes ni ninguna otra decisión de diseño. Tampoco se indica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

Lo único que el autor declara sobre el entrenamiento es que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" y que cualquier cosa no documentada en esta tarjeta es UNKNOWN. La sección RECEIPTS confirma que no existe un `DONE.json` estricto con estado medido, por lo que ni siquiera la existencia de un entrenamiento verificado puede confirmarse a partir del repositorio. El fichero `assets/szl-card/mesh-receipts.svg` se describe como "coincidencia por palabra clave, no validada como evidencia".

## Capacidades

- No se declara ninguna capacidad funcional del modelo en la información disponible.
- No hay mención a generación de texto, razonamiento, código, matemáticas, visión, audio ni modalidad alguna.
- No hay mención a soporte de tool calling ni function calling.
- No hay mención a comportamiento agéntico o razonamiento multi-paso.
- No hay mención a capacidades multilingües ni a modo "thinking".
- La única información estructural es que se trata de un "model (trained artifact in the governed factory)" según el campo Kind de la model card, sin más detalle.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer la arquitectura, el tamaño, la modalidad, el contexto ni las capacidades del modelo. Cualquier escenario que se describiera sería especulativo y contravendría la regla de no inventar datos. Los únicos usos verificables a día de hoy son:

- Auditoría del propio marco de gobernanza: inspeccionar la estructura de la model card y los ficheros de recibo para evaluar cómo SZLHOLDINGS documenta (o no) sus artefactos.
- Seguimiento del "estate": monitorizar si en futuras actualizaciones aparece un `DONE.json` estricto que permita reclasificar el repositorio y habilitar su evaluación.
- Verificación de trazabilidad: comprobar la correspondencia entre la tarjeta generada (`estate-cards weaver v0.1.0`, card id `0c59f18b11979084`) y la instantánea de auditoría citada (2026-11-20T03:48:04Z).

El resto de aplicaciones prácticas queda no disponible hasta que el autor publique especificaciones o evidencia medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor declara en la sección Honesty que "no benchmark number is asserted on this card beyond what a dated audit measured" y la sección RECEIPTS clasifica la evidencia de evaluación como UNKNOWN por ausencia de `DONE.json` estricto.

## Requisitos de hardware

No es posible estimar requisitos de hardware sin conocer el número de parámetros, la arquitectura y los formatos de pesos.

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoría de comparación (tamaño, modalidad, tarea) sin especificaciones del modelo. La siguiente tabla recoge únicamente los metadatos administrativos que sí son verificables frente a la ausencia de datos técnicos.

| Aspecto | salad-ring-ouro-l71 | Alternativa comparable |
|---|---|---|
| Parámetros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Evidencia de evaluación | UNKNOWN (sin `DONE.json` estricto) | no disponible |
| Disponibilidad | Repo público en HF, 0 descargas | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni formato de pesos, el modelo no es evaluable ni desplegable de forma informada.
- Sin licencia declarada: no puede determinarse si el uso comercial está permitido; en la práctica, la ausencia de licencia impide asumir derechos de uso.
- Sin evidencia de evaluación: el propio autor clasifica la evidencia como UNKNOWN; no hay `DONE.json` estricto con `status=MEASURED` ni `eval_rc=0`.
- Ficheros con nombre de recibo no validados: `assets/szl-card/mesh-receipts.svg` es una coincidencia por palabra clave según el escaneo del autor, no evidencia verificada.
- Riesgo de alucinación y sesgos: no evaluables sin información sobre entrenamiento y alineación.
- Idiomas: no declarados; no puede asumirse soporte de castellano ni de ningún otro idioma.
- Señales de madurez del artefacto: 0 descargas y 0 likes, creado y actualizado en un intervalo de cuatro días, sin pipeline declarado.
- La model card está generada automáticamente por una herramienta ("estate-cards weaver v0.1.0") y su contenido es fundamentalmente meta-documental, no técnico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l71
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica citada): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards

# SZLHOLDINGS/salad-ring-ouro-l62

## Resumen

salad-ring-ouro-l62 es un artefacto de modelo publicado por SZLHOLDINGS dentro de su denominado "governed-AI estate", un conjunto de modelos, datasets y Spaces que la organización presenta como verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye ninguna descripción funcional del modelo: ni arquitectura, ni tamaño, ni dominio de aplicación, ni datos de entrenamiento. La model card se limita a describir el sistema de gobernanza y auditoría de la organización.

La información disponible es, por tanto, prácticamente nula en lo que respecta a capacidades técnicas. La propia model card declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se considera "UNKNOWN" (desconocido), y el escaneo de recibos incluido en la propia tarjeta clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de recibo, pero no existe un `DONE.json` estricto con estado `MEASURED`, código de evaluación cero y marca temporal. La evidencia de evaluación es, por tanto, desconocida según el propio criterio del autor.

El modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha, no declara licencia, idiomas ni pipeline, y su nombre sugiere una variante dentro de una familia denominada "salad". No es posible recomendarlo para ningún uso en producción ni en investigación sin información adicional del autor.

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

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con espacios de estado (SSM) o cualquier otra variante. Tampoco se indica el número de parámetros, la longitud de contexto nativa ni la composición del corpus de entrenamiento.

Respecto al entrenamiento, la tarjeta remite a "ficheros de recibo" alojados en la malla del estate de SZLHOLDINGS, pero el escaneo estricto de recibos incluido en la propia tarjeta concluye que no existe un `DONE.json` que cumpla el estándar de la organización (`status=MEASURED`, `eval_rc=0`, marca temporal y recibo de entrenamiento). El único fichero con nombre de recibo encontrado es `assets/szl-card/mesh-receipts.svg`, que la tarjeta describe como "coincidencia por palabra clave, no validada como evidencia". No se dispone de información sobre RLHF, DPO, decodificación especulativa ni ninguna otra innovación técnica.

## Capacidades

- Generación de texto: no disponible (no se documenta ninguna capacidad concreta).
- Razonamiento, código, matemáticas o visión: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponible.

La model card no realiza ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos, y estos no existen según el propio escaneo del autor.

## Casos de uso

No es posible proponer casos de uso concretos y realistas para este modelo, ya que la información disponible no documenta ninguna capacidad funcional, dominio, tamaño ni requisito de despliegue. Cualquier escenario de aplicación sería especulativo y contravendría la regla de no inventar datos. Los casos de uso quedan, por tanto, como no disponibles hasta que el autor publique evidencia medida o una descripción técnica del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de recibos clasifica la evidencia de evaluación como `UNKNOWN`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el tamaño, la arquitectura ni el propósito del modelo, por lo que no es posible identificar alternativas comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se declaran arquitectura, parámetros, contexto, idiomas ni formato de pesos.
- Evidencia de evaluación desconocida: el propio autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` estricto ni resultados medidos.
- Licencia no declarada: no puede determinarse si el uso comercial está permitido; en ausencia de licencia, deben aplicarse los términos por defecto de Hugging Face y contactar con el autor antes de cualquier uso.
- Riesgo de alucinación y sesgos: no evaluables sin datos de entrenamiento ni evaluaciones publicadas.
- Adopción nula: cero descargas y cero "likes" en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Nomenclatura y estructura propias de un "estate" corporativo con gobernanza interna: la trazabilidad depende de ficheros de recibo alojados fuera de la tarjeta, no verificables directamente desde el repositorio.
- No apto para producción ni para investigación comparativa sin información adicional del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l62
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

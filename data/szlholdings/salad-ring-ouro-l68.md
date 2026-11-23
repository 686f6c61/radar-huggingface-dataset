# SZLHOLDINGS/salad-ring-ouro-l68

## Resumen

salad-ring-ouro-l68 es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "governed-AI estate": un conjunto de repositorios de modelos, datasets y Spaces con resultados supuestamente auditables y verificables mediante ficheros de recibos (receipts). El repositorio no incluye model card técnica convencional: la documentación disponible se limita a metadatos de identidad, badges y referencias a gráficos SVG generados automáticamente.

La información pública no especifica arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El propio autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se considera UNKNOWN, y el escaneo de recibos de la propia organización (tranche 6, chunk 8, del 22 de noviembre de 2026) clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, sin un DONE.json estricto que acredite evaluación medida.

Por tanto, se trata de un repositorio sin evidencia técnica verificable publicada: cero descargas, cero likes, sin licencia declarada y sin pipeline asignado. Es relevante únicamente como caso de estudio de publicación de artefactos con trazabilidad declarativa, no como modelo evaluable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio solo referencia SVG de auditoría y ficheros de recibos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida), el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineamiento. La model card se limita a describir el proceso de generación de la propia tarjeta mediante una herramienta interna ("estate-cards weaver v0.1.0", Python de biblioteca estándar, SVG determinista, paleta KANCHAY) y a remitir a los recibos del "estate mesh" para cualquier afirmación de entrenamiento o evaluación.

El autor indica que los gráficos se generan a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z con etiqueta MEASURED, pero no se aporta ninguna curva medida para este artefacto concreto. El escaneo de recibos del 2026-11-22 concluye que no existe un DONE.json estricto (con status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento), por lo que la evidencia de evaluación se marca como UNKNOWN. No hay innovaciones técnicas documentadas: ni decodificación especulativa, ni atención lineal, ni detalles de tokenizador.

## Capacidades

- No hay capacidades documentadas ni verificadas para este artefacto.
- No se declara soporte de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas concretos.
- No se declara ningún modo especial (thinking mode, visión, audio).
- El autor afirma explícitamente que no se hace ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos, y estos no existen en el repositorio.

## Casos de uso

- Auditoría de trazabilidad de artefactos: el repositorio puede usarse como ejemplo de publicación con recibos declarativos y etiquetado MEASURED/REPORTED/UNKNOWN, útil para equipos que diseñan pipelines de gobernanza de modelos.
- Estudio de model cards generadas automáticamente: permite analizar las limitaciones de generar documentación determinista a partir de instantáneas de auditoría sin curvas medidas asociadas.
- Verificación de integridad documental: sirve para probar herramientas que detecten la diferencia entre "ficheros con nombre de recibo" y "recibos validados" (clasificación RECEIPT_FILES_NO_DONE).
- Formación interna sobre riesgos de publicación: caso práctico de un repositorio con cero descargas, sin licencia y sin pipeline, útil para ilustrar qué información mínima debe exigirse antes de consumir un modelo.
- No es adecuado para inferencia en producción, generación de texto, código, atención al cliente, RAG ni ninguna tarea de NLP, al no existir pesos, arquitectura ni evaluación documentados.
- No es adecuado para fine-tuning ni destilación, por la misma ausencia de especificaciones y de licencia que regule el uso derivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio repositorio declara la evidencia de evaluación como UNKNOWN y no presenta ninguna cifra de MMLU, HumanEval, GSM8K ni de ninguna otra métrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan formatos de pesos ni ficheros de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen la categoría, el tamaño, la tarea y la licencia de este artefacto. Cualquier comparación con modelos abiertos de parámetros conocidos sería especulativa y contraria a la política de no inventar datos.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador documentados.
- Sin licencia declarada: no se puede determinar si el uso comercial está permitido; en la práctica, debe tratarse como no licenciado para producción.
- Sin evidencia de evaluación: el escaneo interno del autor clasifica el repositorio como RECEIPT_FILES_NO_DONE y la evidencia de evaluación como UNKNOWN.
- Riesgo de alucinación y sesgos: no evaluables al no existir modelo desplegable ni datos de evaluación.
- Sin pipeline asignado en Hugging Face y con cero descargas y cero likes, lo que impide cualquier validación por parte de la comunidad.
- Los ficheros con nombre de recibo (assets/szl-card/mesh-receipts.svg) no están validados como evidencia por el propio autor; no deben interpretarse como prueba de calidad.
- La documentación incluye enlaces a una organización de GitHub con sintaxis potencialmente malformada, lo que dificulta la verificación en la fuente canónica.
- Los resultados de búsqueda web disponibles no guardan relación con el modelo (tratan sobre la deprecación de venta de juegos en Discord) y no aportan información técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l68
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Fuente canónica declarada (organización en GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards

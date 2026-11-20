# SZLHOLDINGS/salad-ring-ouro-l132

## Resumen

`salad-ring-ouro-l132` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el propio autor denomina "governed-AI estate": un catálogo de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de "recibos" (receipts) y auditorías fechadas. El repositorio no incluye información sobre la arquitectura, el número de parámetros, la longitud de contexto ni el proceso de entrenamiento; la model card se limita a describir la política de honestidad del autor, que etiqueta cualquier dato no medido como UNKNOWN en lugar de estimarlo.

El nombre del repositorio sugiere un identificador interno ("ouro" podría referirse a la familia, "l132" a una variante o iteración), pero no se aporta ninguna especificación verificable. La model card indica que las afirmaciones de entrenamiento y evaluación viven en ficheros de recibos del "estate mesh", no accesibles desde la información proporcionada, y que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, con fecha de creación en 2026-11-19 y última actualización en 2026-11-20. No hay pipeline declarado, licencia especificada ni idiomas listados, lo que impide evaluar su idoneidad para uso comercial o su cobertura lingüística. A efectos prácticos, esta ficha documenta la existencia del artefacto y la ausencia de datos técnicos públicos verificables.

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
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con state space models o cualquier otra variante. Tampoco se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El autor declara explícitamente que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibos asociados al "estate mesh" y que cualquier dato no incluido en la tarjeta debe considerarse UNKNOWN. La tarjeta indica que los gráficos mostrados son SVG deterministas generados a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z, etiquetada como MEASURED, pero no se proporcionan los valores numéricos subyacentes en la información accesible.

## Capacidades

- No se documentan capacidades específicas del modelo en la información proporcionada.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio u otros).

## Casos de uso

- Evaluación de trazabilidad: el artefacto puede utilizarse como ejemplo de publicación con política de "recibos" y auditoría fechada, útil para estudiar prácticas de documentación reproducible en modelos open source.
- Auditoría de catálogo: sirve para verificar cómo un "estate" organiza modelos, datasets y Spaces bajo un mismo esquema de identidad y evidencia.
- Integración en pipelines internos de SZL Holdings: dado que el autor lo describe como artefacto entrenado dentro de su "governed factory", su uso previsto parece ser interno a esa organización, aunque no se detalla.
- Docencia sobre transparencia en model cards: puede emplearse como caso de estudio de una tarjeta que declara UNKNOWN de forma explícita frente a la práctica habitual de omitir datos.
- Pruebas de carga de repositorios: útil para validar herramientas que consumen metadatos de Hugging Face (pipeline, licencia, idiomas) cuando estos campos están vacíos.
- No se pueden recomendar casos de uso de inferencia (chatbot, generación de código, RAG, etc.) porque no hay evidencia de que el repositorio contenga pesos utilizables ni de qué tarea resuelve.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos no receiptados se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se confirma que el repositorio incluya pesos en ningún formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre parámetros, contexto, rendimiento ni licencia que permita establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede verificar arquitectura, tamaño, contexto ni formato de pesos.
- Licencia no especificada: no es posible determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse reserva de derechos por defecto.
- Idiomas no declarados: no se puede garantizar cobertura lingüística alguna.
- Sin benchmarks ni evaluaciones públicas: cualquier afirmación de rendimiento sería especulativa.
- Riesgo de alucinación: no evaluable sin acceso al modelo y a su proceso de entrenamiento.
- Sesgos conocidos: no documentados.
- Repositorio sin tracción (0 descargas, 0 likes) y creado recientemente: no hay evidencia de uso en producción ni de revisión por la comunidad.
- La model card remite a "recibos" externos al repositorio; sin acceso a ellos, la trazabilidad declarada no es verificable desde Hugging Face.
- No se confirma que el repositorio contenga pesos descargables; podría tratarse únicamente de una tarjeta de catálogo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l132
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (según la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards

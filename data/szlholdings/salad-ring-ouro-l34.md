# SZLHOLDINGS/salad-ring-ouro-l34

## Resumen

`salad-ring-ouro-l34` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad de fuentes y resultados verificables mediante ficheros de recibos (receipts). El repositorio se creó el 18 de noviembre de 2026 y se actualizó el 20 de noviembre de 2026, sin descargas ni interacciones registradas en el momento de redactar esta ficha.

La model card no proporciona información técnica sustantiva: no se declara arquitectura, número de parámetros, longitud de contexto, idiomas, licencia ni formato de pesos. El autor indica explícitamente que las afirmaciones de entrenamiento y evaluación viven en ficheros de recibos del "estate mesh" y que cualquier dato no incluido allí se marca como UNKNOWN (desconocido). Esta ficha, por tanto, refleja únicamente lo que el repositorio declara y marca el resto como no disponible, sin inferir cifras.

Su relevancia actual es limitada desde el punto de vista de evaluación técnica: se trata de un artefacto sin documentación de capacidades ni resultados medidos en la propia tarjeta. Resulta útil como ejemplo de práctica de gobernanza (etiquetado MEASURED/REPORTED/UNKNOWN con marca temporal) pero no permite una evaluación funcional del modelo.

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

No se ha publicado información sobre la arquitectura en la model card. El autor la describe únicamente como "model (trained artifact in the governed factory)", sin especificar si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única innovación metodológica declarada es de proceso, no de modelado: el artefacto se enmarca en una fábrica gobernada con recibos auditables, y la tarjeta se genera de forma determinista (SVG generado con la biblioteca estándar de Python a partir de una instantánea de auditoría con fecha 2026-11-20T03:48:04Z, etiquetada como MEASURED). Cualquier afirmación de entrenamiento o evaluación no incluida en los recibos se marca como UNKNOWN.

## Capacidades

- No se declaran capacidades específicas en la model card.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües ni idiomas cubiertos.
- No se declara ningún modo especial (thinking mode, visión, audio u otros).

## Casos de uso

No es posible recomendar casos de uso concretos sin información verificable sobre arquitectura, tamaño, contexto o capacidades. Los siguientes escenarios son genéricos y quedan condicionados a que el autor publique especificaciones y resultados medidos:

- Evaluación interna de gobernanza de artefactos: usar el repositorio como referencia de formato de recibos auditables y etiquetado MEASURED/REPORTED/UNKNOWN en pipelines de catalogación de modelos.
- Auditoría de procedencia: verificar en el "estate mesh" del autor los ficheros de recibos asociados antes de cualquier uso en producción.
- Integración en catálogos corporativos: registrar el artefacto con metadatos mínimos (ID, autor, fechas) mientras no haya especificaciones técnicas.
- Pruebas de reproducibilidad: comprobar que la tarjeta generada de forma determinista coincide con la instantánea de auditoría declarada.
- Investigación sobre documentación de modelos: analizar la tarjeta como ejemplo de declaración explícita de incertidumbre (UNKNOWN) frente a la práctica habitual de omitir datos.
- Despliegue en producción: no recomendable hasta que existan pesos, licencia y benchmarks publicados y verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que los datos no incluidos se consideran UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque no se ha publicado el tamaño, la arquitectura ni la tarea objetivo del artefacto.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni formato de pesos declarados.
- Licencia no especificada: no puede determinarse si el uso comercial está permitido; tratar como no apto para producción hasta confirmación.
- Idiomas no declarados: riesgo de comportamiento no evaluado en castellano u otros idiomas.
- Sin benchmarks ni evaluaciones publicadas: imposible estimar calidad, sesgos o tasa de alucinación.
- Sin descargas ni interacciones registradas: no hay evidencia de uso comunitario ni de validación externa.
- Las afirmaciones de entrenamiento y evaluación se remiten a ficheros de recibos externos al repositorio; deben verificarse en el "estate mesh" del autor antes de cualquier uso.
- La tarjeta se genera de forma automática (weaver v0.1.0), por lo que parte del contenido es plantilla y no documentación técnica específica del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l34
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referencia del autor): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

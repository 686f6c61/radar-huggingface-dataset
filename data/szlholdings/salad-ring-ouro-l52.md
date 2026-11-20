# SZLHOLDINGS/salad-ring-ouro-l52

## Resumen

`salad-ring-ouro-l52` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face, presentado como parte de su "estate" de IA gobernada. La model card no describe la arquitectura, el tamaño, el contexto ni los datos de entrenamiento del modelo: se limita a referenciar un repositorio de GitHub (`szl-holdings`) como fuente canónica y a indicar que las afirmaciones sobre entrenamiento y evaluación viven en ficheros de "recibos" (receipts) del propio estate, no en la tarjeta.

La tarjeta enfatiza explícitamente una política de honestidad: cualquier cifra no auditada se etiqueta como UNKNOWN en lugar de inventarse, y las gráficas se generan de forma determinista a partir de una instantánea de auditoría fechada (2026-11-20T03:48:04Z). Esto sugiere un proyecto centrado en trazabilidad y verificabilidad más que en publicación convencional de pesos y benchmarks.

En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no incluye pesos en formatos estándar reconocibles. Por tanto, esta ficha solo puede documentar lo que la fuente afirma; el resto de apartados se marcan como no disponibles.

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
| Formato de pesos | no disponible (la model card no declara safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

No disponible. La model card no especifica si el modelo es un transformer denso, un MoE, un modelo híbrido o cualquier otra arquitectura. Tampoco indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única información relevante es de tipo procedimental: el autor afirma que las métricas de entrenamiento y evaluación residen en ficheros de recibos del "estate mesh" y que cualquier dato no auditado se marca como UNKNOWN. No se aporta ninguna innovación técnica (atención lineal, decodificación especulativa, etc.) en la tarjeta.

## Capacidades

- No se declara ninguna capacidad funcional concreta (generación de texto, razonamiento, código, matemáticas, visión, audio).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se menciona ningún modo especial (thinking mode, visión, audio).

La model card se limita a describir el marco de gobernanza y auditoría del estate, sin detallar qué sabe hacer el modelo.

## Casos de uso

No es posible proponer casos de uso concretos y realistas sin conocer arquitectura, tamaño, contexto, licencia ni capacidades declaradas. Cualquier escenario que se enumerase aquí sería especulativo y contravendría la política de no inventar datos.

- Evaluación de gobernanza de artefactos: el repositorio podría servir como ejemplo de publicación con trazabilidad de recibos y etiquetado explícito de datos UNKNOWN, útil para equipos que diseñan pipelines de auditoría de modelos.
- No se pueden detallar más escenarios (atención al cliente, generación de código, RAG, etc.) porque no hay evidencia de que el modelo soporte dichas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y no incluye dichos números.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declaran formatos de pesos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al no conocerse el tamaño, la arquitectura ni la licencia del modelo, no es posible identificar alternativas comparables de la misma categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l52 | no disponible | no disponible | no disponible | Hugging Face (0 descargas, 0 likes) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede evaluar idoneidad para producción sin conocer arquitectura, tamaño y contexto.
- Licencia no declarada: no hay garantía de uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otros idiomas.
- Repositorio sin descargas ni likes y con fecha de creación futura respecto a la consulta (2026-11-18), lo que sugiere un artefacto de prueba o un proyecto en fase muy temprana.
- La model card remite a recibos externos en un repositorio de GitHub; la verificabilidad depende de que dichos recibos existan y sean accesibles.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación de datos de entrenamiento.
- No se declaran formatos de pesos estándar, por lo que la integración con herramientas habituales (vLLM, llama.cpp, transformers) no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l52
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas: https://github.com/szl-holdings/estate-cards

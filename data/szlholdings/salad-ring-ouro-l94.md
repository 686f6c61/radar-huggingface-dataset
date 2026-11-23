# SZLHOLDINGS/salad-ring-ouro-l94

## Resumen

`salad-ring-ouro-l94` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face, integrado dentro de lo que el autor denomina un "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos ("receipts") y auditorías fechadas. El repositorio se presenta como un modelo entrenado ("trained artifact in the governed factory"), pero la model card no aporta información sobre arquitectura, tamaño, datos de entrenamiento ni capacidades.

La tarjeta se limita a describir el marco de gobernanza del autor: gráficos SVG deterministas generados a partir de una instantánea de auditoría (2026-11-20T03:48:04Z), etiquetado de datos como MEASURED/REPORTED/UNKNOWN y una política explícita de no afirmar resultados de benchmarks que no estén respaldados por un recibo medido. El propio autor declara que cualquier afirmación sobre entrenamiento o evaluación que no esté en los recibos es UNKNOWN.

En la práctica, esto significa que no hay información verificable sobre qué es el modelo, qué arquitectura usa, cuántos parámetros tiene ni para qué sirve. La sección de recibos del propio repositorio indica que no existe un `DONE.json` en el estándar estricto del autor, que la evidencia de evaluación es UNKNOWN y que el único fichero con nombre de recibo encontrado (`assets/szl-card/mesh-receipts.svg`) es una coincidencia por palabra clave no validada como evidencia. El modelo tiene 0 descargas y 0 likes en el momento de la consulta.

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

No disponible. La model card no describe arquitectura, número de parámetros, composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor remite a "receipt files" del "estate mesh" para cualquier afirmación sobre entrenamiento, pero la sección de recibos del propio repositorio clasifica el artefacto como `RECEIPT_FILES_NO_DONE` y declara la evidencia de evaluación como UNKNOWN.

La única información técnica presente es de tipo procedimental: los gráficos de la tarjeta se generan con SVG determinista usando solo la biblioteca estándar de Python, a partir de una instantánea de auditoría fechada, y el generador se identifica como `szl-holdings/estate-cards weaver v0.1.0`. No hay innovaciones de arquitectura, decodificación ni atención descritas.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe.
- No se documenta ningún modo especial (thinking mode, visión, audio).
- El autor indica explícitamente que no se hace ninguna afirmación de calidad o capacidad sin recibos de evaluación medidos, y que estos no existen para este artefacto.

## Casos de uso

- No es posible recomendar casos de uso concretos: sin arquitectura, tamaño, contexto ni licencia declarados, no hay base técnica para evaluar la idoneidad del modelo en ningún escenario de producción.
- Evaluación de infraestructura de gobernanza: el repositorio podría estudiarse como ejemplo del formato de recibos y tarjetas deterministas del "estate" de SZLHOLDINGS, no como modelo utilizable.
- Auditoría de trazabilidad: un equipo interesado en pipelines de evidencia reproducible podría examinar la estructura de la tarjeta y el generador `estate-cards weaver`, aunque el propio autor marca este artefacto como sin recibo estricto.
- Integración en pipelines: descartable sin conocer formato de pesos, licencia y requisitos de cómputo.
- Atención al cliente, generación de código, análisis de documentos, RAG, agentes o fine-tuning: ninguno es evaluable con la información disponible.
- Uso comercial: imposible determinarlo al no declararse licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la sección de recibos indica que la evidencia de evaluación es UNKNOWN (sin `DONE.json` en el estándar estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer categoría, tamaño, arquitectura ni tarea del artefacto.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-ring-ouro-l94 | no disponible | no disponible | no disponible | Repo público en HF, 0 descargas |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se declaran arquitectura, parámetros, contexto, idiomas, licencia ni formato de pesos, lo que impide cualquier evaluación técnica.
- Sin evidencia de evaluación: el propio repositorio clasifica el artefacto como `RECEIPT_FILES_NO_DONE` y marca la evidencia de evaluación como UNKNOWN.
- Riesgo de licencia: al no declararse licencia, no puede asumirse ningún derecho de uso, incluido el comercial.
- Riesgo de procedencia: el autor remite a un "estate mesh" y a una organización de GitHub externos para verificar afirmaciones; sin acceso a esos recibos, las afirmaciones de entrenamiento no son comprobables desde el repositorio.
- Señales de baja madurez: 0 descargas, 0 likes, sin pipeline declarado y una tarjeta generada automáticamente centrada en meta-información de gobernanza en lugar de en el modelo.
- No apto para producción: sin benchmarks, licencia ni requisitos de hardware, cualquier despliegue implicaría asumir riesgos no cuantificados.
- Riesgo de alucinación y sesgos: no evaluables sin información sobre datos de entrenamiento ni evaluación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l94
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada como fuente canónica): https://github.com/szl-holdings
- Generador de tarjetas referenciado: https://github.com/szl-holdings/estate-cards

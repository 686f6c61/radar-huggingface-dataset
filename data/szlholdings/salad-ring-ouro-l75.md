# SZLHOLDINGS/salad-ring-ouro-l75

## Resumen

`salad-ring-ouro-l75` es un artefacto de modelo publicado por SZLHOLDINGS, una organización que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces "source-linked" y resultados verificables mediante recibos de auditoría. El repositorio se creó el 19 de noviembre de 2026 y se actualizó cuatro días más tarde, sin descargas ni interacciones registradas en Hugging Face en el momento de redactar esta ficha.

La model card no describe arquitectura, tamaño, datos de entrenamiento ni capacidades del modelo. Se limita a declarar la identidad del repositorio, enlazar a la organización en GitHub y presentar gráficos SVG deterministas generados a partir de una instantánea de auditoría. La propia card reconoce explícitamente que cualquier afirmación sobre entrenamiento o evaluación "vive en sus ficheros de recibo" y que lo no registrado allí es "UNKNOWN".

La sección de recibos es especialmente reveladora: un escaneo estricto de fecha 22 de noviembre de 2026 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, hay ficheros con nombre de recibo pero ningún `DONE.json` que cumpla el umbral estricto (status=MEASURED, eval_rc=0, timestamp y recibo de entrenamiento). En consecuencia, la evidencia de evaluación es UNKNOWN. Se trata, por tanto, de un artefacto sin documentación técnica verificable ni métricas publicadas.

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

No hay información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer, un MoE, un modelo híbrido o cualquier otra familia, ni indica número de parámetros, capas, dimensión oculta o mecanismo de atención.

Tampoco se documentan los datos de entrenamiento: no se especifica el número de tokens, la composición del corpus, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La card declara que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo", pero el escaneo estricto registrado en la propia card concluye que no existe un `DONE.json` que valide esas evidencias, por lo que cualquier dato de entrenamiento debe considerarse no disponible.

## Capacidades

- No se documenta ninguna capacidad concreta en la información proporcionada.
- No hay mención de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se describe ningún modo especial (thinking mode, decodificación especulativa, etc.).

## Casos de uso

No es posible recomendar casos de uso concretos sin información verificable sobre arquitectura, tamaño, contexto o capacidades del modelo. Cualquier aplicación práctica requeriría primero confirmar en el repositorio de origen los recibos de evaluación y las especificaciones técnicas, que en el momento de redactar esta ficha no están disponibles.

- Evaluación interna controlada: solo tendría sentido como paso previo a cualquier uso, verificando los recibos de auditoría en la organización de GitHub enlazada.
- No se pueden proponer escenarios de atención al cliente, generación de código, análisis documental ni despliegue en producción sin datos de contexto, licencia y rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que "no se asegura ningún número de benchmark más allá de lo que una auditoría fechada haya medido", y el escaneo estricto registrado clasifica la evidencia de evaluación como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse el tamaño, la arquitectura y la tarea del modelo, no es posible identificar alternativas comparables de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede verificar arquitectura, tamaño, contexto ni formato de pesos.
- Evidencia de evaluación inexistente según el propio escaneo de la card (`RECEIPT_FILES_NO_DONE`, eval evidence UNKNOWN).
- Licencia no declarada: no hay base para evaluar el uso comercial ni la redistribución.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otros idiomas.
- Cero descargas y cero likes: sin señales de validación por parte de la comunidad.
- Riesgo elevado de alucinación y de comportamiento no alineado al no documentarse fases de ajuste ni evaluación.
- La card se apoya en gráficos SVG deterministas y metadatos de auditoría en lugar de documentación técnica estándar, lo que dificulta la reproducibilidad.
- No apto para producción sin una verificación previa e independiente de los recibos en el repositorio de origen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l75
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de cards: https://github.com/szl-holdings/estate-cards

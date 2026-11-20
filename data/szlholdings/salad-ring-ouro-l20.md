# SZLHOLDINGS/salad-ring-ouro-l20

## Resumen

`salad-ring-ouro-l20` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad declarada y resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face se creó el 18 de noviembre de 2026 y se actualizó dos días después, sin descargas ni valoraciones registradas en el momento de la consulta.

La model card no proporciona información técnica sustantiva sobre el modelo: no se declara arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni resultados de evaluación. El autor indica explícitamente que cualquier afirmación de entrenamiento o evaluación reside en los ficheros de recibo del "estate mesh" y que, fuera de ellos, los datos se etiquetan como UNKNOWN. Esta ficha, por tanto, refleja únicamente lo que el repositorio declara y marca como no disponible todo lo demás.

Por el momento no es posible evaluar el modelo para uso en producción: la ausencia de licencia, idiomas, pipeline y pesos documentados impide determinar su idoneidad técnica o legal. Se recomienda tratarlo como un artefacto en fase de publicación y consultar el repositorio de GitHub de la organización para localizar los recibos citados.

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

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida o cualquier otra variante. Tampoco se detalla el tokenizador, la estrategia de atención ni innovaciones técnicas asociadas.

Respecto al entrenamiento, el autor remite a los ficheros de recibo del "estate mesh" para cualquier afirmación sobre datos, número de tokens, composición del corpus o etapas de alineación (RLHF, DPO u otras). La card no incluye ninguno de estos datos y etiqueta explícitamente como UNKNOWN todo lo que no está respaldado por un recibo fechado. La única marca temporal concreta es la instantánea de auditoría del 20 de noviembre de 2026 a las 03:48:04 UTC, que el autor etiqueta como MEASURED sin especificar qué se midió.

## Capacidades

- No se declara ninguna capacidad concreta en la model card.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se confirman modos especiales (thinking mode, visión, audio u otros).

## Casos de uso

No es posible recomendar casos de uso concretos sin información sobre arquitectura, tamaño, contexto, licencia y rendimiento. Los siguientes escenarios quedan planteados únicamente como hipótesis a validar contra los recibos del autor:

- Evaluación interna de trazabilidad: usar el modelo como caso de estudio del flujo "governed-AI" de SZLHOLDINGS, verificando que los recibos del repositorio coinciden con los artefactos publicados.
- Integración en pipelines de auditoría: si los recibos documentan el proceso de entrenamiento, el modelo podría servir para demostrar reproducibilidad en entornos regulados.
- Prototipado experimental: solo tras confirmar licencia y pesos disponibles, podría probarse en tareas de generación de texto genéricas.
- Comparación de prácticas de documentación: útil como ejemplo de model card minimalista frente a fichas técnicas convencionales.
- Investigación sobre gobernanza de modelos: analizar cómo se etiquetan los datos como MEASURED, REPORTED o UNKNOWN en la documentación.
- Despliegue en producción: descartado hasta que se publiquen licencia, pesos, contexto y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y no se incluye ninguno en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La ausencia de parámetros, contexto, licencia y benchmarks impide establecer una comparación fundamentada con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni medidas de mitigación.
- No hay información sobre tasas de alucinación ni evaluaciones de fidelidad.
- Se desconoce la longitud de contexto y los idiomas soportados, por lo que no puede garantizarse su comportamiento en textos largos o en castellano.
- La licencia no está declarada: no puede asumirse uso comercial permitido.
- No se publican pesos ni formato de pesos: no es posible descargar ni ejecutar el modelo a partir de la información disponible.
- El repositorio tiene cero descargas y cero valoraciones, lo que impide cualquier validación por parte de la comunidad.
- Las afirmaciones del autor sobre "resultados verificables" remiten a recibos externos no enlazados directamente en la card; deben localizarse y verificarse en el repositorio de GitHub de la organización antes de confiar en ellas.
- La etiqueta `region:us` es la única metainformación técnica presente y no aporta datos sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l20
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards citada: https://github.com/szl-holdings/estate-cards

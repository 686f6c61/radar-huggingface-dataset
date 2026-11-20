# SZLHOLDINGS/salad-ring-ouro-l126

## Resumen

`salad-ring-ouro-l126` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina "governed-AI estate": un conjunto de modelos, datasets y Spaces con trazabilidad a código fuente y resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face no incluye model card técnica en el sentido habitual: la información disponible se limita a metadatos de identidad, avisos de honestidad y referencias a un sistema de auditoría externo.

No se publican en la información disponible datos sobre arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni proceso de alineación. La model card indica explícitamente que cualquier afirmación de entrenamiento o evaluación debe consultarse en los ficheros de recibo del "estate", y que lo no registrado allí se etiqueta como UNKNOWN. Esta ficha, por tanto, refleja fielmente esa ausencia de datos en lugar de inferirlos.

El interés actual del modelo es limitado para evaluación técnica: cero descargas, cero likes, sin pipeline declarado, sin licencia y sin idiomas especificados. Es relevante únicamente como ejemplo de patrón de publicación basado en auditoría determinista (SVG generado con stdlib, captura de fecha UTC, identificador de tarjeta) más que como modelo candidato a despliegue.

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

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM o híbrida) en la información proporcionada. La model card no describe capas, dimensionalidad, mecanismo de atención ni tokenizador.

Tampoco se documentan datos de entrenamiento: número de tokens, composición del corpus, fases de preentrenamiento, SFT, RLHF o DPO. El autor remite cualquier afirmación de entrenamiento o evaluación a los ficheros de recibo del "estate mesh", que no están incluidos en la información disponible. La única innovación declarada es de proceso, no de modelado: generación determinista de gráficos SVG con la biblioteca estándar de Python a partir de una instantánea de auditoría fechada (2026-11-20T03:48:04Z, marcada como MEASURED), con etiquetado explícito de valores como MEASURED, REPORTED o UNKNOWN.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas cubiertos.
- No se declaran modos especiales (thinking mode, visión, audio) ni pipeline de inferencia asociado.
- La única capacidad verificable del repositorio es la de servir como artefacto registrado dentro de un sistema de auditoría con recibos fechados.

## Casos de uso

- Auditoría de procedencia de artefactos: el repositorio puede usarse como ejemplo de publicación con instantáneas fechadas y etiquetado MEASURED/REPORTED/UNKNOWN, útil para equipos que diseñan pipelines de gobernanza de modelos.
- Verificación de cadenas de custodia: el identificador de tarjeta (`673801d6d028bbfd`) y la marca de tiempo de generación permiten comprobar la integridad de la documentación asociada a un artefacto.
- Docencia sobre documentación de modelos: sirve como caso de estudio de una model card que prioriza la honestidad epistémica sobre la exhaustividad técnica.
- Integración en catálogos internos de modelos: puede registrarse como entrada con estado "sin datos técnicos" para forzar una revisión manual antes de cualquier uso.
- Reproducción de la generación de tarjetas: el enlace al generador `estate-cards` permite replicar el proceso de creación de la tarjeta de forma determinista.
- Evaluación de riesgos previa a adopción: el repositorio ejemplifica el caso en que la ausencia de licencia y de especificaciones obliga a descartar el modelo para producción hasta obtener información adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que lo no registrado se etiqueta como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos ni pipeline.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconocen la categoría, el tamaño y la tarea del artefacto. La única comparación posible es de proceso de publicación, no de rendimiento.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros ni contexto, no es posible evaluar su idoneidad para ninguna tarea.
- Licencia no declarada: no puede asumirse uso comercial ni redistribución; cualquier despliegue en producción queda bloqueado hasta aclaración legal.
- Idiomas no declarados: riesgo de comportamiento impredecible en castellano u otras lenguas.
- Sin pipeline ni formato de pesos: no hay evidencia de que el repositorio contenga pesos utilizables para inferencia.
- Riesgo de alucinación: no evaluable, al no existir benchmarks ni evaluaciones publicadas.
- Sesgos: no documentados.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de terceros.
- La model card remite a recibos externos no incluidos en la información disponible, por lo que las afirmaciones del autor no son verificables desde este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l126
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada como fuente canónica): https://github.com/szl-holdings
- Generador de tarjetas del estate: https://github.com/szl-holdings/estate-cards

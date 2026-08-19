# SyzygyResearch/Mach-1-Additive-35B

## Resumen

El modelo **Mach-1-Additive-35B** es un modelo de lenguaje de gran tamaño desarrollado por SyzygyResearch, publicado en HuggingFace en agosto de 2026. Según los metadatos, se trata de un modelo basado en la arquitectura Qwen3.5 con mezcla de expertos (MoE), que incorpora técnicas de cuantización ternaria y un enfoque aditivo en su diseño. El nombre sugiere aproximadamente 35 mil millones de parámetros totales, aunque no se dispone de confirmación oficial en la ficha.

Este modelo se presenta como una propuesta experimental dentro del ecosistema de modelos abiertos, con licencia Apache-2.0 según los tags, lo que permite uso comercial y modificación. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de entrenamiento, capacidades concretas, benchmarks ni requisitos de hardware. A pesar de ello, su popularidad inicial (más de 3.500 descargas y 123 likes) indica interés de la comunidad, probablemente por su arquitectura innovadora (ternaria y aditiva) y su base en Qwen3.5.

Dado que la ficha oficial no incluye documentación técnica detallada, esta ficha se basa únicamente en los metadatos disponibles y en inferencias razonables a partir del nombre y los tags. Se recomienda consultar el repositorio de HuggingFace para obtener información actualizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5, con pesos ternarios y enfoque aditivo |
| Parametros totales | 35B (según nombre del modelo, no confirmado oficialmente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el tag "ternary" sugiere cuantización ternaria, pero sin detalles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (según tags de HuggingFace) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento ni la arquitectura interna más allá de lo indicado en los tags. Se sabe que el modelo emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5, lo que sugiere que sigue el diseño de transformers con capas de atención y múltiples expertos activados por token. El término "ternary" indica que los pesos están cuantizados a valores ternarios (-1, 0, 1), una técnica que reduce drásticamente el uso de memoria y acelera la inferencia en hardware compatible. El término "additive" podría referirse a un método de entrenamiento aditivo (por ejemplo, añadir parámetros incrementalmente) o a una arquitectura que combina contribuciones aditivas de los expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se mencionan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

No se han publicado capacidades específicas en la información disponible. Al ser un modelo de lenguaje basado en Qwen3.5, es razonable esperar que herede capacidades generales de generación de texto, razonamiento y posiblemente código, pero no hay confirmación oficial. Los tags no indican soporte para tool calling, agentes, visión o audio. Se recomienda probar el modelo directamente para evaluar sus capacidades reales.

## Casos de uso

No se dispone de información concreta sobre casos de uso recomendados por el desarrollador. Dado que se trata de un modelo de lenguaje de gran tamaño con arquitectura MoE y cuantización ternaria, podría ser adecuado para tareas de generación de texto, resumen, traducción o razonamiento, especialmente en entornos con restricciones de memoria gracias a la cuantización. Sin embargo, sin benchmarks ni documentación, no es posible afirmar su idoneidad para escenarios específicos. Se sugiere realizar pruebas propias antes de considerar su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Dado el tamaño estimado de 35B parámetros, en FP16 se necesitarían aproximadamente 70 GB de VRAM, pero la cuantización ternaria podría reducir significativamente este requisito. Sin datos concretos sobre el número de parámetros activos (MoE) ni la cuantización exacta, no es posible estimar con precisión la VRAM necesaria. Se recomienda consultar el repositorio del modelo o probar con herramientas como llama.cpp o vLLM para determinar los requisitos reales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El nombre sugiere una relación con Qwen3.5, pero no se conocen las especificaciones exactas de ese modelo base. Tampoco se dispone de datos de rendimiento para comparar con alternativas de tamaño similar. Se indica "no disponible".

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar los términos exactos en el repositorio.
- Al ser un modelo experimental con documentación escasa, existe un riesgo elevado de comportamiento impredecible en producción.
- La cuantización ternaria puede degradar la calidad de las respuestas en comparación con modelos de precisión completa.
- No se garantiza soporte técnico ni mantenimiento por parte del desarrollador.

## Enlaces

- [HuggingFace: SyzygyResearch/Mach-1-Additive-35B](https://huggingface.co/SyzygyResearch/Mach-1-Additive-35B)

No se han encontrado otros enlaces (papers, blogs, repositorios) en la información proporcionada.

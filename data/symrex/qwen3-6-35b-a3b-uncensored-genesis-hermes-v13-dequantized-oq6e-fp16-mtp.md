# symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-fp16-mtp

## Resumen

Este repositorio contiene una cuantización mixta del modelo Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13, realizada por el usuario symrex mediante la herramienta oQ (oMLX v0.6.4). Se trata de un modelo de tipo `qwen3_5_moe`, es decir, una arquitectura de mezcla de expertos (MoE) perteneciente a la familia Qwen, aunque la designación "3.6" en el nombre sugiere una versión posterior. El repositorio ofrece los pesos en formato MLX safetensors con cuantización de 6 bits y tamaño de grupo 64, lo que permite ejecutar el modelo en hardware Apple Silicon mediante MLX.

La relevancia de esta publicación radica en que proporciona una versión cuantizada de un modelo de aproximadamente 35.950 millones de parámetros totales, con un tamaño de repositorio de 31,2 GB, lo que lo hace viable para equipos con memoria unificada moderada. Sin embargo, la información disponible es muy limitada: no se especifican detalles sobre el modelo base original, sus capacidades, licencia o idiomas soportados. El autor no ha publicado una model card completa, y los resultados de búsqueda web asociados no aportan datos adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 (≈35,95 B) |
| Parametros activos | No disponible (el nombre sugiere 3 B, no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ de 6 bits, tamaño de grupo 64 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizados con oQ) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `qwen3_5_moe`, que indica una arquitectura de mezcla de expertos. El nombre del repositorio incluye "35B-A3B", lo que sugiere 35 mil millones de parámetros totales y 3 mil millones activos por token, aunque este dato no está confirmado en la documentación. La cuantización fue realizada con la herramienta oQ (omlx v0.6.4) empleando precisión mixta de 6 bits y un tamaño de grupo de 64. No se proporcionan datos sobre el entrenamiento del modelo base, como número de tokens, composición del dataset o técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

No se dispone de información específica sobre las capacidades de este modelo cuantizado. Al tratarse de una variante de la familia Qwen, es probable que herede capacidades de generación de texto, razonamiento, código y comprensión multilingüe, pero no hay confirmación oficial. El nombre incluye "Uncensored" y "Hermes", lo que sugiere un fine-tuning orientado a respuestas sin censura y posiblemente alineado con el estilo Hermes, pero no hay documentación al respecto.

## Casos de uso

No es posible enumerar casos de uso concretos debido a la falta de información sobre las capacidades reales del modelo. En general, un modelo MoE cuantizado de este tamaño podría destinarse a tareas de generación de texto, asistencia en código o razonamiento en entornos con recursos limitados, pero estas afirmaciones son especulativas y no se basan en datos verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 31,2 GB, lo que corresponde a los pesos cuantizados en 6 bits.
- Al estar en formato MLX, el modelo está diseñado para ejecutarse en Apple Silicon (M-series) con memoria unificada.
- Se estima que se necesitan al menos 32 GB de memoria unificada para cargar los pesos y realizar inferencia con margen para activaciones y contexto.
- No se dispone de datos sobre latencia o throughput.
- Las opciones de despliegue incluyen MLX y oMLX, aunque no se documentan otros frameworks como vLLM o llama.cpp.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El único dato concreto es el tamaño de parámetros y la cuantización, pero se desconocen las características del modelo base original.

## Limitaciones y advertencias

- Al ser una cuantización de 6 bits, puede haber una pérdida de precisión respecto al modelo original en fp16.
- No se conoce la licencia del modelo, por lo que su uso comercial es incierto.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas.
- El modelo está etiquetado como "Uncensored", lo que implica que puede generar contenido no filtrado y potencialmente inapropiado; se recomienda precaución en entornos de producción.
- La falta de documentación sobre el modelo base dificulta evaluar su fiabilidad y rendimiento real.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V13-dequantized-oQ6e-fp16-mtp)
- [Herramienta oQ / oMLX](https://github.com/jundot/omlx)

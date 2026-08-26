# windowsxp811203/Qwen3.8-Flash-Next-Abliterated

## Resumen

Este repositorio es un **placeholder** y no contiene un modelo funcional. El autor, `windowsxp811203`, tiene previsto publicar una versión "abliterated" (con la capa de rechazo ortogonalizada) del modelo **Qwen3.8-Flash-Next**, un modelo de lenguaje de tipo MoE con 125 000 millones de parámetros totales y 6 000 millones activos, que se describe como una vista previa de la arquitectura Qwen4. La publicación está condicionada a tres pasos previos: revisión de licencia del modelo original, verificación de la arquitectura (incluyendo el cabezal de predicción de tokens múltiples, la atención lineal y el camino de embeddings n-gram de 51 000 millones) y soporte de la nueva arquitectura en herramientas como llm-compressor, vLLM y llama.cpp.

El autor no promete una fecha de lanzamiento y deja claro que si el build no es correcto o la licencia no lo permite, la página lo comunicará explícitamente. Por tanto, este ficha describe un proyecto en preparación, no un modelo disponible para su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con arquitectura Qwen4 preview |
| Parametros totales | 125 000 millones (según la model card; no confirmado) |
| Parametros activos | 6 000 millones (según la model card; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se espera bf16; no confirmado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (en revisión) |
| Formato de pesos | no disponible (se espera safetensors; no confirmado) |

## Arquitectura y entrenamiento

La model card indica que el modelo base, Qwen3.5-Flash-Next, es un MoE de 125 000 millones de parámetros totales y 6 000 millones activos, con una arquitectura nueva que no es la misma que la serie Qwen3.5-dense. Se mencionan tres elementos innovadores: un cabezal de predicción multi-token (MTP), una capa de atención lineal con nomenclatura propia, y una ruta de embeddings n-gram de 5 100 millones de parámetros. No se proporciona información sobre el conjunto de datos de entrenamiento, número de tokens, o si se usó RLHF o DPO. El proyecto de "abliteration" consiste en aplicar una ortogonalización de la capa de rechazo (refusal) sobre los pesos del modelo base, técnica que ya ha aplicado el autor en otros modelos como Qwen3.5-27B-Abliterated.

## Capacidades

No se dispone de información sobre las capacidades concretas del modelo porque aún no se ha publicado. Aunque la arquitectura Qwen4 podría aportar mejoras en razonamiento, generación de código y manejo de contexto largo, **no hay datos verificados** sobre estas funcionalidades.

## Casos de uso

No aplicable. El modelo no está disponible y no se han publicado resultados ni demos. Cualquier caso de uso sería especulativo y no debe considerarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un placeholder y no contiene evaluaciones ni comparativas.

## Requisitos de hardware

No disponible. Al tratarse de un MoE de 125 000 millones de parámetros totales y 6 000 millones activos, se espera que la inferencia requiera una GPU de alto rendimiento (p. ej., A100, H100 o similar), pero no se han proporcionado cifras concretas de VRAM, latencia o throughput. La publicación del modelo y su soporte en vLLM, llama.cpp y otras herramientas está pendiente de verificación.

## Comparativa con modelos similares

No disponible. No se ha publicado ningún modelo comparable con esta arquitectura concreta. El proyecto se basa en el futuro Qwen3.5-Flash-Next de la familia Qwen, pero este modelo aún no ha sido lanzado oficialmente (según la búsqueda web, se espera una versión "Qwen3.5-Max" con 2,4 billones de parámetros, pero no es comparable en escala).

## Limitaciones y advertencias

- **Es un placeholder**: no hay pesos, ni código, ni documentación técnica real. Cualquier uso directo del repositorio es imposible.
- **Licencia no confirmada**: la model card indica que la licencia del modelo original debe permitir derivados; si no, el proyecto se cancelará.
- **Arquitectura no verificada**: la nueva arquitectura Qwen4 puede presentar problemas de compatibilidad con herramientas estándar de cuantización e inferencia.
- **Sesgos y alucinaciones**: no hay datos sobre sesgos o riesgos de alucinación, ya que el modelo no ha sido evaluado.
- **Producción**: no se recomienda utilizar este repositorio en ningún entorno de producción, ya que no contiene un modelo funcional.

## Enlaces

- [Repositorio HuggingFace del placeholder](https://huggingface.co/windowsxp811203/Qwen3.8-Flash-Next-Abliterated)
- [Página de Qwen3.8-Flash-Next en HuggingFace (no publicado)](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Repositorio GitHub de Qwen3.8 (familia Qwen)](https://github.com/QwenLM/Qwen3.8)
- [Artículo sobre Qwen3.8 en OpenLM.ai](https://openlm.ai/qwen3.8/)
- [Modelo Qwen3.8-27B-Abliterated del mismo autor](https://huggingface.co/windowsxp811203/Qwen3.8-27B-Abliterated)
- [Dataset de encuesta nvfp4-mtp-survey](https://huggingface.co/datasets/windowsxp811203/nvfp4-mtp-survey)

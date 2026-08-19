# unconst/Affine-5czsc2fc98-r226-fullft

## Resumen

Este modelo es un checkpoint fusionado (LoRA-merged) publicado por el usuario `unconst` a partir del modelo base `kevin954/Affine-5dfqbbh8ev-sft`. Según los metadatos, se trata de un modelo de generación de texto con arquitectura tipo MoE (el tag `qwen3_5_moe` sugiere una base Qwen3.5, aunque no hay confirmación oficial) y capacidades multimodales (`image-text-to-text`). El autor lo describe como "H1 merged checkpoint salvage" y "Private TTL insurance; not a submission until Stage-5 gate clears", lo que indica que es un checkpoint intermedio de un proyecto en desarrollo, no una versión final destinada a producción.

Con 34.660.610.688 parámetros (~34,7 mil millones), el modelo se presenta en formato `safetensors` y ocupa 71,9 GB en el repositorio. No se dispone de información sobre licencia, idiomas, contexto ni benchmarks. Su relevancia actual es limitada: puede interesar a investigadores que quieran explorar arquitecturas MoE multimodales o evaluar checkpoints intermedios, pero su estado preliminar y la ausencia de documentación técnica lo hacen inadecuado para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5_moe` sugiere MoE basado en Qwen3.5, sin confirmar) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible (probablemente MoE, sin dato oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es muy escasa. El modelo es el resultado de una fusión LoRA (LoRA-merged) aplicada sobre `kevin954/Affine-5dfqbbh8ev-sft`, que a su vez parece ser un fine-tune de un modelo base anterior. El tag `qwen3_5_moe` apunta a una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, pero no se ha publicado ninguna especificación técnica que lo confirme. El tag `image-text-to-text` sugiere que el modelo acepta entradas multimodales (imagen y texto), aunque no se detalla el mecanismo de visión. No se dispone de datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

Según los tags y la model card, el modelo presenta las siguientes capacidades, aunque sin detalles verificables:

- Generación de texto y conversación: el pipeline es `text-generation` y el tag `conversational` indica soporte para diálogos multi-turno.
- Posible procesamiento multimodal: el tag `image-text-to-text` sugiere que puede recibir imágenes como entrada adicional al texto, aunque no hay documentación al respecto.
- Arquitectura MoE: el tag `qwen3_5_moe` indica que emplea una mezcla de expertos, lo que podría implicar eficiencia en inferencia, pero sin datos concretos.
- No se confirma soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades avanzadas.

## Casos de uso

Dado el estado preliminar y la falta de documentación, los casos de uso son limitados y orientados a investigación:

- Evaluación de checkpoints intermedios: investigadores pueden descargar el modelo para estudiar la evolución del entrenamiento de la familia Affine, comparando este checkpoint con versiones posteriores.
- Exploración de arquitecturas MoE multimodales: el tag `qwen3_5_moe` y `image-text-to-text` pueden servir como punto de partida para analizar cómo se combinan ambas características en un solo modelo.
- Fine-tuning adicional: al ser un checkpoint fusionado, podría servir como base para experimentos de fine-tuning específicos, siempre que se respeten las condiciones de la licencia (actualmente desconocida).
- Pruebas de compatibilidad con frameworks: dado que usa `transformers` y `safetensors`, se puede probar su carga en entornos como vLLM o Hugging Face Inference Endpoints, aunque sin garantías de estabilidad.
- Análisis de sesgos y alucinaciones: al ser un modelo sin documentación, puede ser objeto de estudio para caracterizar comportamientos no deseados en modelos MoE de gran tamaño.
- Reproducibilidad de experimentos: para quienes trabajen con la familia Affine, este checkpoint puede servir como referencia de un estado concreto del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

No se dispone de requisitos oficiales. A partir del tamaño de parámetros (34,7B) y el formato safetensors, se puede estimar:

- VRAM estimada para inferencia: en FP16, el modelo ocuparía aproximadamente 69 GB (34,7B × 2 bytes). Con cuantización de 8 bits, ~35 GB; con 4 bits, ~18 GB. Sin embargo, al ser MoE, la memoria activa podría ser menor si la implementación lo permite, pero no hay datos.
- GPU recomendadas: para FP16 se necesitarían GPUs de clase A100 80GB o H100. Con cuantización 4-bit, podría caber en una RTX 4090 (24 GB) o similar, aunque sin garantías de rendimiento.
- Opciones de despliegue: al usar `transformers`, es compatible con vLLM, TGI y llama.cpp (si se convierte a GGUF), pero no hay configuraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo no tiene benchmarks publicados, ni se conocen alternativas directas de la misma familia Affine. Se puede mencionar que, por tamaño, se situaría en la gama de modelos como Mixtral 8x7B (46,7B totales) o Qwen1.5 MoE, pero sin datos de rendimiento no es posible una comparación objetiva.

## Limitaciones y advertencias

- Estado preliminar: el autor lo describe como "salvage" y "not a submission until Stage-5 gate clears", lo que indica que no es un modelo final y puede contener artefactos de entrenamiento o degradación de calidad.
- Licencia desconocida: al no especificarse, no se puede garantizar su uso comercial ni la redistribución. Se recomienda contactar al autor antes de cualquier uso.
- Sin documentación técnica: no hay información sobre contexto, idiomas, sesgos, ni metodología de entrenamiento.
- Riesgo de alucinación: al ser un modelo sin evaluación, es probable que presente alucinaciones y errores factuales, especialmente en dominios especializados.
- Posibles sesgos no documentados: al no conocer el dataset de entrenamiento, no se pueden anticipar sesgos de género, raza o idioma.
- Inadecuado para producción: la falta de benchmarks, licencia y estabilidad lo descarta para aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r226-fullft
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft (referencia indirecta, no verificado)

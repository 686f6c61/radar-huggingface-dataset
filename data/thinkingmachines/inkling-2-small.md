# thinkingmachines/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autorregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Combina capas de atención locales y globales, y es nativamente multimodal, con un vision transformer que proyecta imágenes y texto a un espacio oculto compartido procesado conjuntamente por el decoder.

El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones con IA: sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Soporta una ventana de contexto de hasta 1 millón de tokens y se ha entrenado en precisión NVFP4, que es su precisión nativa.

La relevancia de Inkling 2 Small radica en su escala (594B parámetros totales con solo 17B activos) y en su despliegue optimizado para hardware de centro de datos de última generación, con checkpoints NVFP4 y MXFP8. Su licencia permisiva y su integración con múltiples frameworks de inferencia y entrenamiento lo sitúan como una opción atractiva para investigación y producción a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only con MoE dispersa (8 de 384 expertos), atención híbrida local/global, vision transformer para imágenes |
| Parametros totales | 594B (según model card); 383.072.987.216 según safetensors |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (nativa) y MXFP8 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer autorregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa en la que cada token se enruta a 8 de 384 expertos. La atención es un híbrido de capas locales y globales, lo que permite gestionar contextos largos de hasta 1M tokens con un coste computacional controlado. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las representaciones de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta.

El entrenamiento incluyó datos de texto, imágenes y vídeo procedentes de fuentes públicas, de terceros, generadas internamente o sintéticamente. El proceso de curación de datos incluyó limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y avanzar en objetivos de seguridad. El modelo se preentrenó, midtrainó y postentrenó en NVFP4, que es su precisión nativa; el checkpoint MXFP8 ofrece una mejora marginal de 1-2 puntos porcentuales en evaluaciones, sin relevancia práctica según el autor. No se especifica en la información disponible si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Procesamiento de imágenes: acepta entradas de imagen en cualquier formato basado en píxeles (dimensiones recomendadas entre 40px y 4096px).
- Generación de código y soporte para múltiples lenguajes de programación.
- Capacidades multilingües generales, con inglés como idioma principal.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), según la model card.
- Adecuado para instrucciones y conversación general.
- Ventana de contexto de hasta 1M tokens para documentos largos y conversaciones multi-turno extensas.
- Salida exclusivamente en texto UTF-8.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores, aprovechando su soporte para múltiples lenguajes de programación y su capacidad de seguir instrucciones complejas.
- Atención al cliente automatizada: con 1M tokens de contexto, puede gestionar conversaciones multi-turno con historial extenso y documentación de producto adjunta, manteniendo coherencia a lo largo de interacciones largas.
- Sistemas RAG (generación aumentada por recuperación): su ventana de contexto permite inyectar grandes volúmenes de documentos recuperados sin truncamiento, y su naturaleza multimodal permite incorporar imágenes de documentos escaneados.
- Análisis de documentos con imágenes: puede procesar facturas, informes o capturas de pantalla junto con texto para extraer información estructurada, gracias a su vision transformer integrado.
- Agentes autónomos multi-paso: el soporte de tool calling y su contexto largo lo hacen adecuado para agentes que planifican, ejecutan herramientas y razonan sobre resultados en cadenas de pasos extensas.
- Fine-tuning e investigación: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con frameworks como Tinker, Miles, SkyRL o Snowflake Cortex Training para dominios especializados.
- Despliegue en entornos con hardware de centro de datos: su formato NVFP4 nativo permite inferencia eficiente en clústeres con GPUs B300 o H200, con recetas para SGLang, vLLM, TokenSpeed y Unsloth.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre "Open Weights Flash" y "Open Weights Pro", pero el contenido de la tabla está truncado en la información proporcionada y no se detallan los valores numéricos ni las tareas evaluadas. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM agregada mínima: 500 GB para el checkpoint NVFP4 (configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200).
- VRAM agregada mínima: 800 GB para el checkpoint MXFP8 (configuraciones de ejemplo: 4x NVIDIA B300 u 8x NVIDIA H200).
- No cabe en GPUs de consumo (RTX 4090, etc.) debido a su tamaño y a los requisitos de VRAM agregada.
- Frameworks de inferencia soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Frameworks de post-entrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Proveedores de API: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada para establecer una comparativa rigurosa. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo está diseñado principalmente para inglés; sus capacidades multilingües son generales pero no se detallan por idioma.
- Riesgo de alucinación inherente a los modelos generativos; no se especifican medidas de mitigación en la información disponible.
- Sesgos conocidos: no se detallan en la model card; el entrenamiento con datos de internet y sintéticos puede introducir sesgos.
- La licencia Apache 2.0 permite uso comercial, pero existe una Política de Uso Aceptable separada que puede imponer restricciones adicionales.
- El despliegue requiere hardware de centro de datos con al menos 500 GB de VRAM agregada, lo que limita su uso a infraestructuras especializadas.
- El checkpoint MXFP8 ofrece solo 1-2 puntos porcentuales de mejora sobre NVFP4 según el autor, por lo que no se recomienda para casos prácticos.
- No se especifican limitaciones de contexto más allá de los 1M tokens ni restricciones de idioma concretas.
- La información sobre benchmarks y evaluaciones está incompleta en la documentación disponible.

## Enlaces

- Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together: https://www.together.ai/models/Inkling-2-Small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/

# YuCollection/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autorregresivo de tipo decoder-only con una arquitectura de mezcla de expertos (MoE) dispersa, compuesto por 48 capas y un total de 594 mil millones de parámetros, de los cuales solo 17 mil millones están activos por token. El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0 y está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG).

La relevancia de este lanzamiento radica en su ventana de contexto de hasta 1 millón de tokens combinada con capacidades multimodales nativas y un backbone MoE de gran escala pero bajo coste de inferencia por token (17B activos). El modelo se entrenó nativamente en precisión NVFP4, lo que reduce los requisitos de memoria agregada a 500 GB para el checkpoint principal, y ofrece un checkpoint alternativo MXFP8 con 800 GB de requisitos.

El modelo está pensado para despliegue en clústeres de GPU de gama alta (B300 o H200) y no para hardware de consumo. Su ecosistema de inferencia incluye SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face, y cuenta con recetas de post-entrenamiento mediante Miles, SkyRL y Snowflake Cortex Training.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only con backbone MoE disperso (48 capas, atención híbrida local/global, vision transformer para imágenes) |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B por token (8 de 384 expertos) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativa, checkpoint principal) y MXFP8 (checkpoint alternativo) |
| Idiomas soportados | Inglés con capacidades multilingües generales; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 393,5 GB); checkpoints NVFP4 y MXFP8 |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que da lugar a 17B parámetros activos sobre un total de 594B. La atención es híbrida, combinando capas locales y globales, lo que permite manejar contextos de hasta 1 millón de tokens con un coste computacional controlado. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las representaciones visuales como las de texto se proyectan a un espacio oculto compartido que procesa conjuntamente el decoder.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en precisión NVFP4, que es la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento general en inglés y otros idiomas.
- Comprensión de imágenes (image-text-to-text) con entradas en cualquier formato de píxeles, con dimensiones recomendadas entre 40 px y 4096 px.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la descripción del autor.
- Conversación multi-turno e instrucción (instruction-following).
- Integración en sistemas de generación aumentada por recuperación (RAG) gracias a su contexto de 1M tokens.
- Capacidades multilingües generales, aunque el inglés es el idioma principal.
- Procesamiento conjunto de texto e imagen en un espacio oculto compartido.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para revisión de código, generación de parches y explicación de errores, aprovechando su soporte de tool calling y su capacidad multilingüe en lenguajes de programación.
- Atención al cliente automatizada: gestión de conversaciones multi-turno con contexto largo (hasta 1M tokens) para mantener el hilo de incidencias complejas y consultar documentación extensa sin perder información.
- Sistemas RAG sobre corpus masivos: la ventana de 1M tokens permite incluir grandes volúmenes de documentos recuperados en una sola pasada, reduciendo la necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: procesamiento de facturas, informes escaneados o capturas de pantalla combinando entrada visual y texto en una misma consulta.
- Agentes autónomos multi-paso: planificación y ejecución de tareas encadenadas con llamadas a herramientas, adecuado por su naturaleza agéntica declarada por el autor.
- Asistencia en investigación y análisis técnico: resumen y razonamiento sobre artículos, patentes o documentación técnica extensa con soporte de imágenes (figuras, tablas).
- Fine-tuning especializado: al publicarse con pesos abiertos y recetas de post-entrenamiento (Miles, SkyRL, Snowflake Cortex Training), permite adaptación a dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluaciones comparativa entre "Open Weights Flash" y "Open Weights Pro", pero los datos numéricos no están presentes en la información proporcionada. El autor indica que el checkpoint MXFP8 obtiene una mejora marginal de 1-2 puntos porcentuales sobre NVFP4 en las evaluaciones, sin que se consideren diferencias significativas para casos prácticos.

## Requisitos de hardware

- VRAM agregada mínima: 500 GB para el checkpoint NVFP4 y 800 GB para el checkpoint MXFP8.
- Configuraciones de ejemplo para NVFP4: 2x NVIDIA B300 o 4x NVIDIA H200.
- Configuraciones de ejemplo para MXFP8: 4x NVIDIA B300 u 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones de una sola GPU de gama alta convencional.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API de terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento numéricos ni especificaciones de modelos comparables de la misma categoría (multimodales MoE de gran escala con contexto de 1M tokens), por lo que no es posible establecer una comparativa rigurosa sin inventar datos.

## Limitaciones y advertencias

- El modelo está diseñado principalmente para inglés; las capacidades multilingües son generales pero no se detallan por idioma.
- Riesgo de alucinación inherente a los modelos generativos de gran escala; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; los datos de entrenamiento provienen de internet y fuentes públicas, con los sesgos asociados.
- Requisitos de hardware muy elevados (clústeres de 2-8 GPU B300/H200), lo que limita su uso a organizaciones con infraestructura de gama alta o acceso vía API.
- La licencia Apache 2.0 permite uso comercial, pero el autor publica una política de uso aceptable (Acceptable Use Policy) que conviene revisar.
- El modelo se distribuye en precisión NVFP4/MXFP8; no se mencionan checkpoints en BF16/FP16, lo que puede limitar flujos de trabajo que requieran mayor precisión.
- No se especifican el número de tokens de entrenamiento ni detalles de alineación (RLHF/DPO), lo que dificulta evaluar el grado de alineación con instrucciones.
- El contexto de 1M tokens puede degradar la calidad en tareas de recuperación en el centro de la ventana; no se documentan evaluaciones específicas de long-context.

## Enlaces

- Hugging Face: https://huggingface.co/YuCollection/Inkling-2-Small
- Checkpoint NVFP4: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling-2
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/

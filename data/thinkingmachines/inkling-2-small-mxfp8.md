# thinkingmachines/Inkling-2-Small-MXFP8

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera salidas de texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El modelo forma parte de la familia Inkling 2 y se ofrece en dos variantes de precisión: NVFP4 (nativa) y MXFP8 (la presente en este repositorio).

Arquitectónicamente es un transformer autoregresivo decoder-only de 48 capas con un backbone de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. La atención combina capas locales y globales, y la multimodalidad es nativa, con un vision transformer que proyecta imágenes y texto a un espacio oculto compartido procesado conjuntamente por el decoder. Cuenta con 594B parámetros totales y 17B activos, y una ventana de contexto de hasta 1M tokens.

Su relevancia actual radica en la combinación de contexto extremadamente largo, multimodalidad nativa y una arquitectura MoE eficiente en cómputo por token, todo ello con licencia permisiva. El checkpoint MXFP8 está pensado para despliegues que requieren mayor fidelidad numérica, aunque el autor recomienda el checkpoint NVFP4 como opción nativa y de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (48 capas, 8 de 384 expertos por token, atención híbrida local/global) |
| Parametros totales | 594B (612.396.527.616 según safetensors) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 (nativa del modelo) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); checkpoint MXFP8 |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que da 17B parámetros activos sobre un total de 594B. La atención es híbrida, combinando capas locales y globales, lo que permite sostener una ventana de contexto de hasta 1M tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes, y tanto las representaciones visuales como las textuales se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta. La entrada de imagen se acepta en cualquier formato basado en píxeles, con dimensiones óptimas entre 40px y 4096px por lado.

El modelo fue preentrenado, midtrained y postentrenado en NVFP4, por lo que esta es su precisión nativa. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet y repositorios accesibles, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, con instrucciones y conversación multi-turno.
- Comprensión de imágenes (image-text-to-text): descripción, razonamiento visual y respuesta a preguntas sobre imágenes.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), según la orientación de uso declarada por el autor.
- Integración en sistemas RAG gracias a la ventana de contexto de hasta 1M tokens.
- Capacidades multilingües generales, con inglés como idioma principal.
- Modo conversacional e instruction-following para asistentes y chatbots.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para generación, revisión y explicación de código en múltiples lenguajes, apoyándose en tool calling para invocar linters, compiladores o APIs.
- Sistemas agénticos multi-paso: con 1M tokens de contexto y soporte de uso de herramientas, puede mantener el estado de tareas largas, encadenar llamadas a funciones y razonar sobre resultados intermedios.
- RAG sobre corpus extensos: la ventana de 1M tokens permite inyectar grandes volúmenes de documentos recuperados sin truncamiento agresivo, reduciendo la pérdida de contexto en dominios documentales densos.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo y, cuando proceda, entrada de imágenes (capturas, documentos escaneados) para resolver incidencias.
- Análisis de documentos e imágenes: extracción de información y respuesta a preguntas sobre capturas, formularios o figuras, gracias a la codificación visual nativa.
- Asistentes de investigación y análisis: síntesis de material textual y visual extenso, con razonamiento sobre fuentes múltiples dentro de una única ventana de contexto.
- Fine-tuning e integración en productos de terceros: la licencia Apache 2.0 y los pesos abiertos permiten post-entrenamiento (Miles, SkyRL, Snowflake Cortex Training) y despliegue en infraestructura propia.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa (Open Weights Flash / Open Weights Pro), pero los datos numéricos no están disponibles en la información proporcionada. El autor indica que el checkpoint MXFP8 obtiene una mejora marginal de 1-2 puntos porcentuales sobre NVFP4 en las evaluaciones, sin considerarla significativa para casos prácticos.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM agregada mínima para el checkpoint MXFP8: 800 GB.
- Configuraciones de ejemplo para MXFP8: 4x NVIDIA B300 o 8x NVIDIA H200.
- Configuraciones de ejemplo para NVFP4 (checkpoint nativo): 2x NVIDIA B300 o 4x NVIDIA H200 (mínimo 500 GB agregados).
- No cabe en GPU de consumo (RTX 4090, etc.) dada la escala del modelo.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API a través de NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (tamaño, contexto o tarea) que permitan una comparación rigurosa de parámetros, contexto, rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está pensado principalmente para inglés; las capacidades en otros idiomas son generales y no están evaluadas en detalle en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos potenciales derivados de datos de internet y repositorios públicos; el autor menciona filtrado por seguridad pero no detalla mitigaciones de sesgo.
- El checkpoint MXFP8 requiere 800 GB de VRAM agregada, lo que limita el despliegue a clústeres de GPU de gama alta.
- El autor recomienda el checkpoint NVFP4 como opción nativa y de referencia; MXFP8 ofrece solo una mejora marginal (1-2 puntos) en evaluaciones.
- Existe una política de uso aceptable (Acceptable Use Policy) asociada al modelo, además de la licencia Apache 2.0; conviene revisarla antes de usos comerciales sensibles.
- No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF/DPO, lo que dificulta evaluar sesgos y alineación.
- La ventana de 1M tokens implica costes de cómputo y memoria elevados en inferencia con contextos largos.

## Enlaces

- Hugging Face (MXFP8): https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Hugging Face (NVFP4): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
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
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

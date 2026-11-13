# TechnoBaptist/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se distribuye con pesos abiertos bajo licencia Apache 2.0 y está pensado para aplicaciones de agentes, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). El checkpoint publicado en Hugging Face bajo el identificador `TechnoBaptist/Inkling-2-Small` es una réplica del modelo original de Thinking Machines.

Arquitectónicamente es un transformer decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. La atención combina capas locales y globales, y el modelo es nativamente multimodal, con un vision transformer que proyecta las imágenes al mismo espacio oculto que el texto. Dispone de una ventana de contexto de hasta 1 millón de tokens.

La relevancia de este lanzamiento radica en su relación entre parámetros totales y activos (594B totales, 17B activos según la model card) y en su entrenamiento nativo en precisión NVFP4, lo que reduce los requisitos de memoria frente a alternativas en FP8 o BF16. No obstante, el despliegue sigue exigiendo clústeres de GPU de gama alta con al menos 500 GB de VRAM agregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (48 capas, 8 de 384 expertos por token), atención híbrida local/global y vision transformer |
| Parametros totales | 594B según model card; 383.072.987.216 según safetensors del repo |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativo) y MXFP8 |
| Idiomas soportados | Inglés con capacidades multilingües generales; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo decoder-only de 48 capas con una columna vertebral de feed-forward basada en mezcla de expertos dispersa. Cada token se enruta a 8 de 384 expertos, lo que da lugar a 594B parámetros totales con solo 17B activos por token. La atención es híbrida, combinando capas locales y globales, lo que permite sostener una ventana de contexto de hasta 1M tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta, junto con el texto, a un espacio oculto compartido que procesa el decoder de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en precisión NVFP4, que es la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones de propósito general en inglés y otros idiomas.
- Comprensión de imágenes: el modelo acepta entradas visuales en cualquier formato de píxeles, con dimensiones recomendadas entre 40 y 4096 px por lado.
- Razonamiento multimodal conjunto sobre texto e imagen en un mismo contexto.
- Generación y asistencia de código en múltiples lenguajes de programación.
- Uso en sistemas agénticos y de tool-use, según la model card.
- Soporte para sistemas RAG y conversaciones multi-turno gracias a su contexto de 1M tokens.
- Capacidades multilingües generales, aunque el inglés es el idioma principal.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y herramientas de revisión para generar parches, explicar errores y sugerir refactorizaciones, aprovechando su soporte multilingüe de lenguajes de programación y su capacidad de instrucción.
- Atención al cliente automatizada: con 1M tokens de contexto puede mantener conversaciones multi-turno extensas, incorporar historiales completos de tickets y documentación de producto sin truncar información.
- Sistemas RAG sobre documentación técnica: la ventana de 1M tokens permite inyectar grandes volúmenes de documentación y recuperar respuestas fundamentadas, combinando texto e imágenes de manuales.
- Análisis de documentos visuales: al aceptar imágenes de hasta 4096 px por dimensión, puede procesar capturas de pantalla, diagramas, facturas o gráficos junto con texto para extraer información estructurada.
- Agentes autónomos con tool calling: la model card lo orienta explícitamente a sistemas agénticos, por lo que puede orquestar llamadas a APIs y razonamiento multi-paso en flujos de automatización.
- Fine-tuning especializado: al publicarse con pesos abiertos y soporte para Tinker, Miles, SkyRL y Snowflake Cortex Training, equipos de investigación pueden adaptarlo a dominios concretos (legal, médico, financiero) con datos propios.
- Generación de descripciones y metadatos para catálogos de imágenes: su naturaleza image-text-to-text permite etiquetar, describir y clasificar imágenes a escala en plataformas de contenido.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones parcialmente truncada en la información disponible, con columnas "Open Weights Flash" y "Open Weights Pro" sin valores numéricos visibles. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint NVFP4 (recomendado por el autor): requiere al menos 500 GB de VRAM agregada. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- Checkpoint MXFP8: requiere al menos 800 GB de VRAM agregada. Configuraciones de ejemplo: 4x NVIDIA B300 o 8x NVIDIA H200.
- No cabe en GPU de consumo (RTX 4090, RTX 5090, etc.) ni en configuraciones de una o dos GPU de gama alta convencionales.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Post-entrenamiento soportado con Miles, SkyRL y Snowflake Cortex Training; fine-tuning con Tinker (requiere el paquete `tml-renderers`).
- Acceso vía API en proveedores externos: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Small | 594B / 17B (MoE) | 1M tokens | Apache 2.0 | Pesos abiertos (NVFP4, MXFP8) y API en múltiples proveedores |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (multimodales MoE de gran escala con pesos abiertos) en la documentación proporcionada, por lo que no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo está orientado principalmente al inglés; su rendimiento en otros idiomas es "general" según la model card, sin garantías específicas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mecanismos de mitigación específicos.
- Sesgos potenciales derivados de datos de internet y datos sintéticos; la model card menciona filtrado por seguridad pero no detalla evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero existe una política de uso aceptable separada de Thinking Machines que debe respetarse.
- El despliegue requiere hardware de gama alta (500-800 GB de VRAM agregada); no es viable en infraestructura de consumo.
- La discrepancia entre los parámetros totales reportados en la model card (594B) y los del safetensors del repo (383B) debe verificarse antes de planificar el despliegue.
- El checkpoint de este repositorio concreto no presenta descargas ni likes, y su autoría (`TechnoBaptist`) difiere del repositorio oficial de Thinking Machines; conviene validar su integridad frente al original.
- No se detallan los volúmenes ni la composición exacta del dataset de entrenamiento, lo que dificulta evaluar sesgos de dominio.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/TechnoBaptist/Inkling-2-Small
- Hugging Face (oficial NVFP4): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Hugging Face (oficial MXFP8): https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together AI: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/

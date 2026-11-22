# thinkingmachines/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines. Acepta entradas de texto e imagen y genera texto, y esta disenado tanto para uso conversacional general como para sistemas agénticos, asistentes de código y pipelines de generación aumentada por recuperación (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite su uso comercial, ajuste fino e integración en productos de terceros.

Arquitectónicamente es un transformer autoregresivo decoder-only de 48 capas con un backbone de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Cuenta con 594.000 millones de parámetros totales y 17.000 millones activos por token, y combina capas de atención locales y globales. Su ventana de contexto alcanza 1 millón de tokens, una cifra notable para un modelo de este tamano y con capacidades de visión nativas.

El modelo se entreno nativamente en precision NVFP4 (pretraining, midtraining y post-training), lo que lo convierte en su formato de referencia. Thinking Machines ofrece además un checkpoint alternativo en MXFP8 con una ganancia marginal de 1-2 puntos porcentuales en las evaluaciones. Su relevancia actual radica en la combinación de contexto ultralargo, multimodalidad y una arquitectura MoE eficiente en cómputo, con soporte de despliegue en los principales frameworks de inferencia (SGLang, vLLM, TokenSpeed, Unsloth).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (48 capas, atencion hibrida local/global, vision transformer para imagenes) |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B (8 de 384 expertos por token) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativa) y MXFP8 |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone feed-forward de mezcla de expertos dispersa: 384 expertos en total, de los cuales se activan 8 por token, lo que resulta en 17B parámetros activos sobre un total de 594B. La atención es híbrida, alternando capas locales y globales, lo que permite manejar contextos de hasta 1M tokens con un coste computacional controlado. El modelo es multimodal de forma nativa: las imágenes se codifican mediante un vision transformer y tanto las representaciones visuales como las textuales se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, datos generados internamente y datos sintéticos o aumentados. El proceso de curación aplica limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. Una innovación destacable es que el modelo se preentreno, midtrained y post-trained nativamente en NVFP4, lo que convierte esta precisión en el formato de referencia y permite desplegarlo con ese checkpoint sin pérdida apreciable de calidad frente a MXFP8. No se detalla en la información disponible si se aplicaron técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones generales en inglés y otros idiomas.
- Comprensión de imágenes (image-text-to-text) con entradas en cualquier formato de píxeles, con dimensiones recomendadas entre 40px y 4096px por lado.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool use / function calling), según la descripción del autor.
- Razonamiento multi-paso y flujos de trabajo agénticos.
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto ultralargo de hasta 1M tokens para documentos extensos, conversaciones largas o bases de código completas.
- Ajuste fino y post-entrenamiento soportado mediante Tinker, Miles, SkyRL y Snowflake Cortex Training.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1M tokens, manteniendo el hilo de la conversación y recuperando información de interacciones previas sin truncar.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD o asistentes de IDE para autocompletar, refactorizar y revisar código en múltiples lenguajes, con la ventaja de poder cargar repositorios completos en el contexto.
- RAG sobre documentación extensa: con 1M tokens de contexto, es posible inyectar manuales, contratos o bases de conocimiento completas y hacer preguntas sobre ellos sin necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: al aceptar entradas de imagen, puede extraer información de capturas, diagramas, facturas escaneadas o interfaces de usuario y combinarla con texto para responder consultas.
- Agentes autónomos multi-paso: su soporte de tool use y razonamiento multi-paso lo hace adecuado para orquestar tareas que requieren llamadas a APIs, navegación o ejecución de acciones encadenadas.
- Asistencia a investigación y análisis de literatura: puede procesar grandes volúmenes de artículos, informes y figuras en una sola ventana de contexto para resumir, comparar y extraer conclusiones.
- Fine-tuning especializado: al liberarse con pesos abiertos y licencia Apache 2.0, equipos pueden ajustarlo con Tinker o Miles para dominios concretos (legal, médico, financiero) sin restricciones de uso comercial.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre checkpoints (Open Weights Flash y Open Weights Pro), pero los datos numéricos concretos no están disponibles en la información proporcionada. El autor indica que el checkpoint MXFP8 obtiene una ganancia marginal de 1-2 puntos porcentuales sobre NVFP4 en las evaluaciones, sin que se considere significativa para casos prácticos.

No se han publicado resultados de benchmarks detallados (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM agregada mínima: 500 GB para el checkpoint NVFP4 (formato nativo recomendado) y 800 GB para el checkpoint MXFP8.
- Configuraciones de referencia para NVFP4: 2x NVIDIA B300 o 4x NVIDIA H200.
- Configuraciones de referencia para MXFP8: 4x NVIDIA B300 u 8x NVIDIA H200.
- No cabe en GPUs de consumo (RTX 4090, etc.) ni en configuraciones de una sola GPU convencional; requiere clúster multi-GPU.
- Frameworks de despliegue soportados: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, cada uno con su receta oficial.
- Post-entrenamiento: Tinker, Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API de terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo orientativo estructural, Inkling 2 Small se sitúa en la categoría de modelos MoE multimodales de gran escala con contexto ultralargo (1M tokens) y pesos abiertos bajo Apache 2.0, una combinación poco frecuente; los modelos comparables de esa categoría suelen requerir licencias más restrictivas o no ofrecen contexto de 1M tokens con visión nativa.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Small | 594B | 17B | 1M | Apache 2.0 | Pesos abiertos (NVFP4/MXFP8) + API |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El idioma principal es el inglés; las capacidades multilingües se describen como generales pero no se detallan evaluaciones por idioma, por lo que el rendimiento en castellano u otros idiomas no está verificado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas de alucinación en la información disponible.
- Sesgos conocidos: no se detallan en la model card; al entrenarse con datos de internet y sintéticos, es probable que herede sesgos presentes en esas fuentes.
- Requisitos de hardware muy elevados (500-800 GB de VRAM agregada), lo que limita el despliegue local a clústeres multi-GPU de gama alta.
- La licencia Apache 2.0 permite uso comercial, pero existe una política de uso aceptable (Acceptable Use Policy) publicada por el autor que conviene revisar antes de desplegar en producción.
- El checkpoint NVFP4 es el formato nativo y recomendado; usar otras precisiones puede requerir conversión y no está garantizado que preserve el rendimiento.
- No se especifican limitaciones concretas de contexto más allá del máximo de 1M tokens, ni se detalla el comportamiento en los extremos de esa ventana.
- La información sobre datos de entrenamiento es genérica (fuentes públicas, sintéticas, internas) y no permite auditar la composición del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling-2
- Miles (post-entrenamiento): https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL (post-entrenamiento): https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together AI: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius Token Factory: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/

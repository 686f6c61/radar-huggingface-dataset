# thinkingmachines/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Con 594.000 millones de parámetros totales y 17.000 millones activos, el modelo emplea atención híbrida de capas locales y globales y un codificador de visión transformer que proyecta imágenes y texto a un espacio oculto compartido.

El modelo está diseñado para aplicaciones agénticas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), además de uso conversacional general. Su ventana de contexto alcanza 1 millón de tokens, lo que lo sitúa en la categoría de modelos de contexto largo. Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que permite investigación, ajuste fino e integración en productos de terceros.

La relevancia de Inkling 2 Small radica en su entrenamiento nativo en precisión NVFP4, lo que reduce los requisitos de VRAM agregada a unos 500 GB frente a los 800 GB de la variante MXFP8. Esto lo hace desplegable en configuraciones de 2 GPU B300 o 4 GPU H200, un umbral más accesible que el de muchos modelos de su escala. El modelo se publicó en noviembre de 2026 y acumula más de 30.000 descargas y casi 500 «likes» en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 48 capas con MoE dispersa (8 de 384 expertos) y atención híbrida local/global; codificador de visión transformer |
| Parametros totales | 594.050.672.720 (594B) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativa) y MXFP8 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoints NVFP4 y MXFP8) |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer autoregresivo multimodal de 48 capas con una columna vertebral feed-forward de mezcla de expertos dispersa. Cada token se enruta a 8 de 384 expertos, lo que da lugar a 594B parámetros totales con solo 17B activos por token. La atención combina capas locales y globales, y el modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las representaciones visuales como las textuales se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente. Acepta texto en UTF-8 e imágenes en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40 y 4096 píxeles por lado, y genera texto en UTF-8.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, generación interna y datos sintéticos o aumentados. El proceso de curación aplica limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y avanzar objetivos de seguridad. El modelo se preentrenó, entrenó de forma intermedia y postentrenó en NVFP4, que es su precisión nativa; la variante MXFP8 solo aporta una mejora marginal de 1 a 2 puntos porcentuales en las evaluaciones. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes y razonamiento multimodal conjunto texto-imagen.
- Razonamiento y resolución de tareas de código en múltiples lenguajes de programación.
- Soporte de sistemas agénticos y de uso de herramientas (tool use), según la model card.
- Integración en sistemas de generación aumentada por recuperación (RAG).
- Capacidades multilingües generales, con inglés como idioma principal.
- Ventana de contexto de hasta 1M tokens para documentos y conversaciones extensas.
- Ajuste fino y postentrenamiento mediante Tinker, Miles, SkyRL y Snowflake Cortex Training.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en pipelines de CI/CD y entornos de desarrollo para generar, revisar y explicar código en varios lenguajes, aprovechando su soporte de tool calling y su contexto de 1M tokens para analizar repositorios completos.
- Sistemas agénticos multi-paso: gracias a su capacidad de uso de herramientas y razonamiento encadenado, puede orquestar tareas que requieren consultar APIs, leer documentación y ejecutar acciones secuenciales.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo, manteniendo el hilo de la conversación y recuperando información de historiales extensos.
- RAG sobre documentación técnica: con 1M tokens de contexto, puede ingerir manuales, informes y bases de conocimiento completas y responder preguntas con citas al contenido recuperado.
- Análisis de documentos con imágenes: al aceptar entradas visuales, puede procesar capturas, diagramas, facturas o páginas escaneadas y extraer información estructurada en texto.
- Investigación y ajuste fino: al publicarse con pesos abiertos y licencia Apache 2.0, los equipos de investigación pueden postentrenarlo con Tinker, Miles o SkyRL para dominios especializados.
- Despliegue en infraestructura propia: con el checkpoint NVFP4 cabe en 2 GPU B300 o 4 GPU H200, lo que permite ofrecer inferencia local sin depender de proveedores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el checkpoint MXFP8 obtiene entre 1 y 2 puntos porcentuales más que el NVFP4 en las evaluaciones, sin detallar las métricas concretas.

## Requisitos de hardware

- VRAM agregada mínima: 500 GB para el checkpoint NVFP4 y 800 GB para el MXFP8.
- Configuraciones de ejemplo para NVFP4: 2 GPU NVIDIA B300 o 4 GPU H200.
- Configuraciones de ejemplo para MXFP8: 4 GPU B300 u 8 GPU H200.
- No cabe en GPU de consumo: los 594B parámetros totales y los requisitos de VRAM agregada lo excluyen de tarjetas como RTX 4090.
- Frameworks de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers.
- Postentrenamiento: Miles, SkyRL y Snowflake Cortex Training.
- Acceso vía API de terceros: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, Inkling 2 Small se sitúa en la categoría de modelos MoE multimodales de gran escala con contexto de 1M tokens y licencia Apache 2.0, pero no se detallan alternativas concretas con las que contrastarlo.

## Limitaciones y advertencias

- El idioma principal es el inglés; las capacidades multilingües se describen como generales, sin garantías de rendimiento por idioma.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos conocidos: no disponibles en la información proporcionada; los datos provienen de internet y fuentes de terceros, lo que puede introducir sesgos.
- Requisitos de hardware muy elevados: no es desplegable en GPU de consumo ni en estaciones de trabajo convencionales.
- La licencia Apache 2.0 permite uso comercial, pero existe una política de uso aceptable separada que conviene revisar.
- El checkpoint MXFP8 ofrece solo una mejora marginal (1-2 puntos) sobre el NVFP4, por lo que el coste adicional de VRAM (800 GB frente a 500 GB) puede no estar justificado.
- No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO.

## Enlaces

- Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling-2
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/

# yh742/Inkling-2-Small

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo decoder-only de 48 capas con un backbone de mezcla de expertos (MoE) disperso, en el que cada token se enruta a 8 de 384 expertos. El modelo está diseñado para aplicaciones de agentes, asistentes de programación, chatbots y sistemas de generación aumentada por recuperación (RAG). La model card oficial indica 594B parámetros totales y 17B activos, aunque el recuento real de pesos en safetensors del repositorio es de 383.072.987.216 parámetros; esta discrepancia no está explicada en la información disponible.

La relevancia del modelo radica en su ventana de contexto de hasta 1M tokens, su naturaleza nativamente multimodal (imágenes codificadas mediante un vision transformer y proyectadas a un espacio oculto compartido con el texto) y su entrenamiento nativo en precisión NVFP4, lo que reduce los requisitos de VRAM agregada a unos 500 GB frente a los 800 GB de la variante MXFP8. Se distribuye con pesos abiertos bajo licencia Apache 2.0, lo que facilita su integración en productos de terceros y su ajuste fino.

El modelo se publica con recetas de despliegue para SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face, y con soporte de post-entrenamiento mediante Miles, SkyRL y Snowflake Cortex Training. También está disponible a través de proveedores de inferencia como NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only de 48 capas con MoE disperso (8 de 384 expertos), atención híbrida local/global y vision transformer para imágenes |
| Parametros totales | 594B según model card; 383.072.987.216 según safetensors del repositorio (dato no conciliado) |
| Parametros activos | 17B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 (entrenamiento nativo en NVFP4) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; checkpoints NVFP4 y MXFP8 |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con un backbone de mezcla de expertos disperso: cada token se enruta a 8 de 384 expertos, lo que da lugar a 17B parámetros activos sobre un total declarado de 594B. La atención combina capas locales y globales, lo que permite manejar contextos de hasta 1M tokens. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido que procesa el decoder de forma conjunta.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en precisión NVFP4, que es la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, generación interna y datos sintéticos o aumentados; el proceso de curación incluye deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. La información disponible no detalla el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés y otros idiomas.
- Procesamiento de imágenes: acepta entradas en cualquier formato basado en píxeles, con dimensiones recomendadas entre 40px y 4096px por lado.
- Conversación multi-turno con ventana de contexto de hasta 1M tokens.
- Soporte para sistemas agénticos y de uso de herramientas (tool calling / function calling), según la descripción de la model card.
- Asistentes de programación y generación de código en múltiples lenguajes de programación.
- Generación aumentada por recuperación (RAG) sobre documentos extensos gracias al contexto largo.
- Ajuste fino e integración en productos de terceros al publicarse con pesos abiertos.
- Capacidades multilingües generales, aunque el inglés es el idioma principal.

## Casos de uso

- Asistentes de programación: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar código en varios lenguajes, aprovechando su soporte de tool calling para invocar linters, compiladores o APIs.
- Atención al cliente automatizada: con 1M tokens de contexto puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta sin perder el hilo.
- Sistemas RAG sobre corpus grandes: la ventana de 1M tokens permite ingerir varios documentos completos y razonar sobre ellos en una sola pasada, reduciendo la necesidad de fragmentación agresiva.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto de forma conjunta, puede extraer información de capturas, diagramas o formularios junto con el texto asociado.
- Agentes autónomos multi-paso: su soporte de tool calling y razonamiento multi-paso lo hace adecuado para orquestar flujos de trabajo que requieren llamadas a APIs y decisiones encadenadas.
- Ajuste fino para dominios verticales: al distribuirse con pesos abiertos y recetas de post-entrenamiento (Miles, SkyRL, Snowflake Cortex Training), puede adaptarse a sectores como legal, sanitario o financiero con datos propios.
- Despliegue en infraestructura propia: los checkpoints NVFP4 permiten servir el modelo en clústeres de 2x B300 o 4x H200, lo que facilita su uso en entornos con requisitos de soberanía de datos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones con columnas "Open Weights Flash" y "Open Weights Pro", pero el contenido de la tabla está truncado en la información proporcionada y no se han podido extraer los valores numéricos. La model card indica que el checkpoint MXFP8 obtiene una mejora marginal de 1-2 puntos porcentuales sobre NVFP4 en las evaluaciones, sin que se detallen las métricas concretas.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM agregada mínima: 500 GB para el checkpoint NVFP4 (2x NVIDIA B300 o 4x NVIDIA H200); 800 GB para el checkpoint MXFP8 (4x NVIDIA B300 u 8x NVIDIA H200).
- GPU recomendadas: NVIDIA B300 o NVIDIA H200 en configuraciones multi-GPU; no se contemplan GPU de consumo.
- No cabe en GPU de consumo (RTX 4090, etc.) dado el tamaño del checkpoint y los requisitos de VRAM agregada.
- Frameworks de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, con recetas oficiales para cada uno.
- Proveedores de inferencia gestionada: NVIDIA, Fireworks, Together, Baseten, Nebius, Modal y Cloudflare Workers AI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Small | 594B (model card) / 383B (safetensors) | 17B | 1M | Apache 2.0 | Pesos abiertos (NVFP4, MXFP8) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia entre el recuento de parámetros de la model card (594B) y el de safetensors (383B); conviene verificar antes de planificar infraestructura.
- El modelo está pensado principalmente para inglés; el rendimiento en otros idiomas puede ser inferior y no se detalla.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mecanismos específicos de mitigación en la información disponible.
- Sesgos potenciales derivados de datos de entrenamiento de internet y datos sintéticos; la model card menciona filtrado por seguridad pero no detalla evaluaciones de sesgo.
- Requisitos de hardware muy elevados (mínimo 500 GB de VRAM agregada), lo que excluye el despliegue en infraestructura de consumo.
- La ventana de 1M tokens puede implicar costes computacionales y de memoria elevados en inferencia; no se documentan optimizaciones específicas para contextos largos.
- Aunque la licencia es Apache 2.0, la model card remite a una política de uso aceptable de Thinking Machines que puede imponer restricciones adicionales al uso comercial.
- No se han publicado resultados de benchmarks completos ni datos de latencia/throughput en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yh742/Inkling-2-Small
- Checkpoint NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Checkpoint MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2
- Receta Unsloth: https://unsloth.ai/docs/models/inkling-2
- Documentación Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small
- Documentación SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Snowflake Cortex Training: https://github.com/snowflakedb/cortex-training
- Together AI: https://www.together.ai/models/inkling-2-small
- Baseten: https://www.baseten.co/library/inkling-2-small
- Nebius Token Factory: https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small
- Modal: https://modal.com/library/thinking-machines/inkling-2-small
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/inkling-2-small/

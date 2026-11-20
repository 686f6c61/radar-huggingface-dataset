# thinkingmachines/Inkling-2-Small-MXFP8

## Resumen

Inkling 2 Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera texto. Se trata de un transformer autoregresivo decoder-only de 48 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 8 de 384 expertos. Con 594.000 millones de parámetros totales y 17.000 millones activos, está diseñado para aplicaciones de agentes, asistentes de código, chatbots y sistemas RAG.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens, su naturaleza nativamente multimodal (las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido) y su atención híbrida de capas locales y globales. Se distribuye en dos formatos de checkpoint: NVFP4 (precisión nativa, recomendada por el autor) y MXFP8, este último con una ganancia marginal de 1-2 puntos porcentuales en evaluaciones.

La relevancia actual del modelo radica en su licencia Apache 2.0, que permite uso comercial sin restricciones, y en su disponibilidad en múltiples frameworks de inferencia (SGLang, vLLM, TokenSpeed, Unsloth) y proveedores de API (NVIDIA, Fireworks, Together, Baseten, Nebius, Modal, Cloudflare). El checkpoint MXFP8 aquí descrito ocupa 622,8 GB en el repositorio y requiere un clúster de GPU con al menos 800 GB de VRAM agregada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE dispersa (48 capas, atención híbrida local/global) |
| Parametros totales | 594B (612.396.527.616 según safetensors) |
| Parametros activos | 17B (8 de 384 expertos por token) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | MXFP8 y NVFP4 (precisión nativa del modelo: NVFP4) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint MXFP8); existe checkpoint NVFP4 separado |

## Arquitectura y entrenamiento

Inkling 2 Small es un transformer decoder-only de 48 capas con una columna vertebral de mezcla de expertos dispersa: cada token se enruta a 8 de 384 expertos, lo que resulta en 594.000 millones de parámetros totales con solo 17.000 millones activos por token. La atención combina capas locales y globales para gestionar eficientemente contextos de hasta 1 millón de tokens. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las representaciones visuales como las de texto se proyectan a un espacio oculto compartido que el decoder procesa conjuntamente.

El entrenamiento se realizó en tres fases (pretraining, midtraining y post-training) directamente en NVFP4, lo que convierte a este formato en la precisión nativa del modelo. Los datos de entrenamiento incluyen texto, imágenes y vídeo, provenientes de fuentes públicas de internet, repositorios accesibles, generación interna y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifica en la información disponible el número exacto de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes: entrada en cualquier formato basado en píxeles, con dimensiones ideales entre 40 px y 4096 px por lado.
- Razonamiento multimodal: procesamiento conjunto de texto e imagen en un espacio oculto compartido.
- Capacidades multilingües generales, con inglés como idioma principal.
- Soporte para múltiples lenguajes de programación (según la model card, "across multiple coding languages").
- Diseñado para sistemas agénticos y de uso de herramientas (tool-use), asistentes de código, chatbots y RAG.
- Ventana de contexto de hasta 1 millón de tokens para conversaciones y documentos extensos.
- Salida exclusivamente en texto codificado en UTF-8.
- No se especifica en la información disponible un modo de razonamiento explícito (thinking mode) ni soporte de audio.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (hasta 1M tokens) gracias a su ventana de contexto, manteniendo el hilo de interacciones extensas y consultando documentación de producto incluida en el contexto.
- **Asistentes de código en producción**: con soporte para múltiples lenguajes de programación y capacidades de tool-use, puede integrarse en pipelines de CI/CD para revisión de código, generación de parches y explicación de errores a partir de fragmentos de código y capturas de pantalla.
- **Sistemas RAG multimodales**: la combinación de entrada de imagen y texto permite construir sistemas de recuperación aumentada que respondan a consultas sobre documentos escaneados, gráficos o capturas de pantalla junto con texto de referencia.
- **Análisis de documentos visuales**: extracción de información y respuesta a preguntas sobre imágenes de documentos, diagramas o interfaces de usuario, aprovechando la codificación mediante vision transformer y el contexto largo para procesar múltiples páginas.
- **Agentes autónomos multi-paso**: su diseño para sistemas agénticos y tool-use lo hace adecuado para orquestar flujos de trabajo que requieren llamadas a funciones, razonamiento sobre resultados intermedios y planificación en varios pasos.
- **Fine-tuning especializado**: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con Tinker (paquete tml-renderers), Miles, SkyRL o Snowflake Cortex Training para dominios verticales concretos.
- **Despliegue vía API gestionada**: para equipos sin infraestructura propia, está disponible a través de proveedores como Together, Baseten, Nebius, Modal, Cloudflare, NVIDIA y Fireworks.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa entre "Open Weights Flash" y "Open Weights Pro", pero el contenido de dicha tabla no está disponible en la información proporcionada (aparece truncado). No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

El autor indica que el checkpoint MXFP8 presenta una ganancia marginal de 1-2 puntos porcentuales sobre el checkpoint NVFP4 en evaluaciones, sin que se considere significativa para casos de uso prácticos.

## Requisitos de hardware

- **VRAM agregada mínima (checkpoint MXFP8)**: 800 GB. Configuraciones de ejemplo: 4x NVIDIA B300 o 8x NVIDIA H200.
- **VRAM agregada mínima (checkpoint NVFP4, recomendado)**: 500 GB. Configuraciones de ejemplo: 2x NVIDIA B300 o 4x NVIDIA H200.
- **GPU consumer**: el modelo no cabe en GPU de consumo (RTX 4090, etc.) debido a sus 594B parámetros totales y requisitos de VRAM agregada de 500-800 GB.
- **Frameworks de despliegue**: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, cada uno con sus dependencias.
- **Post-entrenamiento**: Miles, SkyRL y Snowflake Cortex Training.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa con modelos alternativos de la misma categoría (mismo tamaño o misma tarea). La model card menciona categorías "Open Weights Flash" y "Open Weights Pro" en su tabla de evaluaciones, pero no se detallan los modelos concretos incluidos en cada categoría ni sus especificaciones.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Small | 594B totales / 17B activos | 1M tokens | Apache 2.0 | Pesos abiertos + API |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Sesgos**: no se detallan sesgos específicos en la información disponible; como modelo entrenado con datos de internet, es probable que herede sesgos presentes en dichas fuentes.
- **Alucinación**: no se cuantifica el riesgo de alucinación en la información proporcionada; como todo modelo generativo, puede producir contenido factualmente incorrecto.
- **Idioma**: el modelo está optimizado para inglés, con capacidades multilingües generales no especificadas en detalle; el rendimiento en castellano u otros idiomas no está documentado.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones, pero existe una Política de Uso Aceptable (Acceptable Use Policy) enlazada por el autor que conviene revisar antes de desplegar en producción.
- **Hardware**: los requisitos de VRAM agregada (500-800 GB) excluyen el despliegue en hardware de consumo y limitan su uso a clústeres profesionales.
- **Formato**: el checkpoint MXFP8 requiere más VRAM (800 GB) que el NVFP4 (500 GB) con una ganancia marginal de 1-2 puntos porcentuales, por lo que el autor recomienda el NVFP4 para todos los casos de uso.
- **Contexto**: aunque soporta hasta 1M tokens, no se documenta el rendimiento efectivo en contextos extremos ni la degradación potencial.
- **Modalidades**: solo acepta texto e imagen como entrada; no se documenta soporte de audio ni vídeo como entrada (aunque el vídeo se menciona como dato de entrenamiento).

## Enlaces

- [Hugging Face: thinkingmachines/Inkling-2-Small-MXFP8](https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8)
- [Checkpoint NVFP4](https://huggingface.co/thinkingmachines/Inkling-2-Small)
- [Tinker Playground](https://tinker.thinkingmachines.ai/playground)
- [Tinker Cookbook (GitHub)](https://github.com/thinking-machines-lab/tinker-cookbook)
- [Política de uso aceptable](https://thinkingmachines.ai/model-acceptable-use-policy)
- [Receta SGLang](https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Small)
- [Receta vLLM](https://recipes.vllm.ai/thinkingmachines/Inkling-2-Small)
- [Receta TokenSpeed](https://lightseek.org/tokenspeed/recipes/models#inkling-2)
- [Receta Unsloth](https://unsloth.ai/docs/models/inkling-2)
- [Miles](https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-small)
- [SkyRL](https://docs.skyrl.ai/docs/models/inkling2)
- [Snowflake Cortex Training](https://github.com/snowflakedb/cortex-training)
- [Together AI](https://www.together.ai/models/inkling-2-small)
- [Baseten](https://www.baseten.co/library/inkling-2-small)
- [Nebius](https://tokenfactory.nebius.com/endpoints/public/thinkingmachines%2FInkling-2-Small)
- [Modal](https://modal.com/library/thinking-machines/inkling-2-small)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/models/inkling-2-small/)
- [Paquete tml-renderers (PyPI)](https://pypi.org/project/tml-renderers/)

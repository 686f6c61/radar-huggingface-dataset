# trinityomnis/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal generalista desarrollado por Thinking Machines y publicado en HuggingFace como `trinityomnis/Inkling-Small`. Acepta entradas de texto, imagen y audio, y genera salidas de texto. Está diseñado para desarrolladores que construyen aplicaciones de IA, incluyendo sistemas agénticos y de uso de herramientas, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0 para permitir investigación, fine-tuning e integración en productos de terceros.

Arquitectónicamente es un transformer autoregresivo decoder-only de 42 capas con un backbone feed-forward de mezcla de expertos dispersa (MoE): cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador de parches jerárquico y el audio mediante codificación discreta de tokens, con todas las modalidades proyectadas a un espacio oculto compartido. Según la model card, tiene 276B parámetros totales y 12B activos, aunque los metadatos de safetensors indican 265.956.439.090 parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con MoE disperso, 42 capas, atención híbrida local/global |
| Parametros totales | 276B (model card); 265.956.439.090 (safetensors) |
| Parametros activos | 12B |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una arquitectura de mezcla de expertos dispersa. El backbone feed-forward contiene 256 expertos, de los cuales 6 se activan por token más 2 expertos compartidos que se activan siempre. La atención es híbrida, alternando capas de atención local y global, lo que permite manejar secuencias largas de forma eficiente. El modelo acepta tres modalidades de entrada: texto UTF-8, imágenes basadas en píxeles (con dimensiones óptimas entre 40px y 4096px por lado) y audio WAV muestreado a 16kHz (con duración ideal inferior a 2 minutos). Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

El entrenamiento utilizó una amplia variedad de tipos de contenido, incluyendo texto, imágenes, audio y vídeo. Los datos proceden de fuentes públicas, de terceros y de generación sintética o aumentada. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o para avanzar objetivos de seguridad. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Multimodal: acepta texto, imagen y audio como entrada, y genera texto como salida.
- Generación de texto e instrucciones: adecuado para conversación general, seguimiento de instrucciones y tareas de lenguaje natural.
- Tool-use y sistemas agénticos: la model card indica que está diseñado para agentes y uso de herramientas.
- Asistente de código: soporta múltiples lenguajes de programación.
- Sistemas RAG: puede integrarse en pipelines de generación aumentada por recuperación.
- Despliegue local: compatible con SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en entornos de desarrollo para autocompletar, explicar y refactorizar código en múltiples lenguajes, aprovechando su capacidad de seguir instrucciones y su naturaleza multimodal para procesar capturas de pantalla de interfaces.
- Agentes autónomos con tool calling: gracias a su diseño para sistemas agénticos, puede gestionar flujos de trabajo que requieren llamadas a herramientas, planificación multi-paso y razonamiento sobre entradas de texto e imagen.
- Chatbots multimodales de atención al cliente: puede recibir imágenes (por ejemplo, capturas de productos) y audio (mensajes de voz) para resolver consultas en conversaciones multi-turno, generando respuestas en texto.
- Sistemas RAG sobre documentación técnica: al combinar texto e imagen, puede indexar y recuperar información de manuales, diagramas y capturas, respondiendo preguntas complejas con contexto visual.
- Transcripción y análisis de audio: al aceptar audio WAV a 16kHz, puede transcribir y analizar contenido hablado, generando resúmenes o extrayendo entidades.
- Análisis de imágenes en aplicaciones industriales: puede procesar imágenes de hasta 4096px por lado para detectar anomalías, leer etiquetas o interpretar diagramas en entornos de control de calidad.
- Investigación y fine-tuning: al ser de pesos abiertos con licencia Apache 2.0, puede adaptarse mediante fine-tuning a dominios específicos, siempre que se disponga de hardware suficiente.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks que compara Inkling-Small con modelos como Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numéricos de dichos benchmarks no están disponibles en la información proporcionada. No se pueden presentar resultados concretos sin riesgo de inventar datos.

## Requisitos de hardware

- VRAM estimada: para BF16, los pesos totales de 276B requieren aproximadamente 552 GB (276B × 2 bytes). Para NVFP4, aproximadamente 138 GB (276B × 0,5 bytes). Estas cifras son estimaciones basadas en el tamaño de parámetros y no incluyen sobrecarga de activaciones ni de KV-cache.
- GPU recomendadas: no especificadas por el fabricante. Dado el tamaño, se necesitan múltiples GPUs de datos de centro de datos (por ejemplo, varias A100 o H100 de 80GB) para cargar todos los pesos en memoria. Es probable que se requieran al menos 2 H100 para NVFP4 y más de 7 H100 para BF16.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers, según las recetas oficiales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La model card de Inkling-Small incluye en su tabla de benchmarks comparaciones con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash. Sin embargo, no se dispone de las especificaciones completas de estos modelos en la información proporcionada, por lo que no es posible realizar una comparativa detallada y rigurosa. No se ofrecen datos suficientes para comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No se han documentado limitaciones específicas en la información disponible.
- Como modelo de lenguaje multimodal, existe riesgo de alucinación, especialmente en tareas que combinan imagen y texto.
- Pueden existir sesgos inherentes a los datos de entrenamiento, que incluyen contenido de internet público y fuentes de terceros.
- La longitud de contexto no está especificada, lo que limita la planificación de aplicaciones que requieran ventanas muy largas.
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar la política de uso aceptable de Thinking Machines antes de desplegar el modelo en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/trinityomnis/Inkling-Small
- Modelo BF16 original: https://huggingface.co/thinkingmachines/Inkling-Small
- Modelo NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace: https://hf.co/blog/thinkingmachines-inkling

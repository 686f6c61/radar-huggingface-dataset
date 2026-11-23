# YuCollection/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal autoregresivo desarrollado por Thinking Machines (publicado en Hugging Face bajo el espacio de nombres YuCollection/Inkling-Small). Acepta entradas de texto, imagen y audio, y genera salidas de texto, lo que lo sitúa en la categoría de modelos image-text-to-text y audio-text-to-text. Está pensado para aplicaciones de tipo agente, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG), y se distribuye con pesos abiertos para permitir investigación, ajuste fino e integración en productos de terceros.

Técnicamente, es un transformer decoder-only de 42 capas con una columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido.

El dato de parámetros totales en safetensors es de 265.956.439.090 (aproximadamente 266 mil millones), mientras que la model card declara 276B totales y 12B activos. El repositorio ocupa 531,9 GB, lo que refleja los pesos en BF16. La licencia es Apache 2.0. Es relevante por su combinación de escala MoE con multimodalidad nativa y pesos abiertos, aunque la información pública disponible sobre benchmarks y detalles de entrenamiento es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa (42 capas), atención híbrida local/global, multimodal nativo |
| Parametros totales | 276B (model card); 265.956.439.090 en safetensors |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 (según model card) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); variante NVFP4 publicada |

## Arquitectura y entrenamiento

Inkling-Small es un transformer decoder-only de 42 capas con una columna vertebral de mezcla de expertos dispersa. Cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo es nativamente multimodal: las imágenes se procesan mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos; ambas modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Declara 276B parámetros totales y 12B activos.

Los datos de entrenamiento incluyen texto, imágenes, audio y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, terceros y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar objetivos de seguridad. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto a partir de entradas de texto, imagen y audio.
- Procesamiento conjunto de múltiples modalidades en un espacio oculto compartido.
- Conversación multi-turno e instrucciones generales.
- Capacidades multilingües generales, con inglés como idioma principal.
- Soporte para múltiples lenguajes de programación según la model card.
- Orientado a sistemas agénticos y de uso de herramientas (tool-use), aunque no se detalla el mecanismo exacto de function calling.
- Aplicable a asistentes de código, chatbots y sistemas RAG.
- Entrada de imagen: cualquier imagen en píxeles, con dimensiones óptimas entre 40 px y 4096 px por lado.
- Entrada de audio: formato WAV a 16 kHz, idealmente menos de 2 minutos.
- Salida únicamente en texto UTF-8.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar conversaciones multi-turno combinando texto, imágenes y audio en la misma sesión, lo que resulta adecuado para interfaces de atención al cliente donde el usuario adjunta capturas o notas de voz.
- Análisis de imágenes en soporte técnico: con su codificador jerárquico de parches, puede recibir capturas de pantalla o fotografías (hasta 4096 px por lado) y generar explicaciones o pasos de resolución en texto.
- Transcripción y comprensión de audio en asistentes de voz: acepta WAV a 16 kHz de hasta unos 2 minutos, útil para resumir notas de voz o responder preguntas sobre grabaciones breves.
- Asistentes de código: la model card indica soporte para múltiples lenguajes de programación y uso en asistentes de código, por lo que puede integrarse en entornos de desarrollo para explicar fragmentos, generar parches o responder dudas técnicas.
- Sistemas RAG multimodales: al aceptar texto e imágenes y generar texto, puede emplearse como generador final en pipelines de recuperación que incluyan documentos escaneados o figuras.
- Prototipado e investigación con pesos abiertos: al distribuirse con licencia Apache 2.0 y pesos en safetensors, permite ajuste fino y experimentación académica sobre arquitecturas MoE multimodales.
- Sistemas agénticos y de uso de herramientas: la model card lo orienta explícitamente a sistemas agénticos, aunque no se detalla el protocolo de tool calling, por lo que su integración requeriría validación empírica.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con modelos de pesos abiertos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y modelos de pesos cerrados, pero los valores numéricos de los resultados no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks con cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 276B parámetros totales y pesos BF16 (repositorio de 531,9 GB), la inferencia en BF16 requiere múltiples GPUs de alta capacidad; la variante NVFP4 reduce el requisito, pero no se publican cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repositorio, el despliegue en BF16 exige clústeres multi-GPU (por ejemplo, A100/H100 en configuración múltiple), aunque no se confirma oficialmente.
- ¿Cabe en GPU de consumo? No se dispone de datos que lo confirmen; el tamaño de los pesos en BF16 lo hace inviable en una sola GPU de consumo. La variante NVFP4 podría reducir el requisito, pero no hay cifras publicadas.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, según la model card. También se menciona acceso vía API mediante el Tinker Cookbook y proveedores de inferencia de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card compara Inkling-Small con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero sin cifras de rendimiento disponibles en la información proporcionada.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-Small | 276B (model card); ~266B en safetensors | 12B | no disponible | Apache 2.0 | Pesos abiertos |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | Pesos abiertos (según model card) |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (según model card) |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (según model card) |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (según model card) |

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la información disponible; al entrenarse con datos de internet, es probable que herede sesgos presentes en esas fuentes, pero no se documenta.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo generativo, es esperable, pero no hay evaluación publicada.
- Longitud de contexto: no especificada, lo que dificulta planificar cargas de trabajo con documentos largos.
- Idiomas: el inglés es el idioma principal; las capacidades multilingües se describen como generales, sin evaluación por idioma.
- Audio: formato limitado a WAV a 16 kHz y duración ideal inferior a 2 minutos.
- Imagen: rendimiento óptimo entre 40 px y 4096 px por dimensión.
- Licencia Apache 2.0: permite uso comercial, pero la model card enlaza una política de uso aceptable (Acceptable Use Policy) que conviene revisar antes de desplegar en producción.
- El número de parámetros difiere entre la model card (276B) y los safetensors (~266B); conviene verificar la configuración exacta antes de dimensionar infraestructura.
- No se publican cifras de benchmarks ni de latencia/throughput, lo que limita la evaluación previa a producción.
- El repositorio es de gran tamaño (531,9 GB), con implicaciones de almacenamiento y transferencia.

## Enlaces

- Hugging Face: https://huggingface.co/YuCollection/Inkling-Small
- BF16 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-Small
- NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

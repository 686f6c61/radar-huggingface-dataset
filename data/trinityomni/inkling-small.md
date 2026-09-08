# trinityomni/Inkling-Small

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab que acepta entradas de texto, imagen y audio y genera salidas de texto. Está diseñado para aplicaciones de IA como sistemas agénticos y de uso de herramientas, asistentes de codificación, chatbots y sistemas de recuperación aumentada (RAG). Se distribuye con pesos abiertos bajo licencia Apache 2.0 para permitir investigación, fine-tuning e integración en productos de terceros.

Arquitectónicamente es un transformer autorregresivo decoder-only de 42 capas con una red feed-forward de Mixture-of-Experts (MoE) dispersa: cada token se enruta a 6 de 256 expertos, más 2 expertos compartidos activos en todos los tokens. La atención es híbrida, combinando capas locales y globales. El modelo tiene 276B parámetros totales y 12B activos, y es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación discreta de tokens, proyectados en un espacio oculto compartido. La longitud de contexto no se ha especificado en la documentación disponible.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE disperso (256 expertos, 6 activos + 2 compartidos), atención híbrida local/global |
| Parámetros totales | 276B (según la model card); 265.956.439.090 según los pesos safetensors |
| Parámetros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 y NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con variantes BF16 y NVFP4) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 42 capas con una arquitectura de Mixture-of-Experts dispersa. La red feed-forward se compone de 256 expertos, de los cuales 6 se activan por token, más 2 expertos compartidos que se aplican siempre. La atención es híbrida, alternando capas locales y globales, lo que permite manejar dependencias de corto y largo alcance sin un coste cuadrático completo. Al ser nativamente multimodal, las imágenes se procesan con un codificador jerárquico de parches y el audio se codifica como tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder.

El entrenamiento se realizó con una amplia variedad de tipos de contenido, incluidos texto, imágenes, audio y vídeo. Los datos provienen de fuentes públicas, adquisiciones de terceros o generación/aumento sintético. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad o avanzar en objetivos de seguridad. La documentación no menciona procesos de RLHF o DPO.

## Capacidades

- Generación de texto multimodal: acepta texto, imagen y audio (WAV 16 kHz) y genera texto UTF-8.
- Diseñado para sistemas agénticos y de uso de herramientas, lo que en la práctica implica soporte de tool calling y razonamiento multi-paso.
- Generación de código en múltiples lenguajes de programación.
- Seguimiento de instrucciones y conversación general, apto para chatbots.
- Adecuado para sistemas de recuperación aumentada (RAG).
- Capacidades multilingües generales, con el inglés como idioma principal.
- Esfuerzo de pensamiento variable: la documentación indica que se puede adaptar el nivel de razonamiento según la tarea.
- Entrada de imagen optimizada para dimensiones entre 40 y 4096 píxeles por lado.
- Entrada de audio optimizada para fragmentos WAV de menos de 2 minutos.

## Casos de uso

- Asistentes de codificación en producción: el modelo puede integrarse en entornos de desarrollo y pipelines de CI/CD para generar código, revisar cambios y resolver tareas de programación en varios lenguajes.
- Sistemas agénticos con herramientas: al estar diseñado para tool-use, puede actuar como núcleo de un agente que recibe instrucciones en texto, imagen o audio, razona y ejecuta llamadas a funciones externas.
- Chatbots multimodales: acepta capturas de pantalla, imágenes y notas de voz, lo que permite asistentes de atención al cliente que entienden contexto visual y auditivo.
- Recuperación aumentada (RAG): su capacidad de seguir instrucciones y manejar lenguaje natural lo hace adecuado para sistemas que combinan documentos, imágenes y audio en el contexto de consultas.
- Análisis de audio: entrada WAV de 16 kHz para transcripción, comprensión de audio o extracción de información en fragmentos cortos.
- Investigación y fine-tuning: al ser open weights con licencia Apache 2.0, puede adaptarse a dominios específicos mediante fine-tuning o ajuste de prompts.
- Aplicaciones multilingües: aunque el inglés es el idioma principal, sus capacidades multilingües generales permiten su uso en productos globales con soporte para otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación menciona evaluaciones en agentic tool use (Terminal-Bench 2.1), razonamiento (HLE text-only, sin herramientas) y seguimiento de instrucciones (IFBench), donde se indica que es competitivo con modelos de su clase, pero sin puntuaciones concretas.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 276B parámetros totales, el despliegue requiere infraestructura de servidor de alta memoria, pero no se han publicado cifras oficiales.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se puede determinar con la información disponible; el tamaño total sugiere que no es viable en GPUs de consumo habituales.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth, HuggingFace Transformers. También hay acceso vía API a través de proveedores de inferencia de terceros.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La model card menciona los siguientes modelos como referencia, pero no se proporcionan datos de rendimiento comparables en la información disponible.

| Modelo | Parámetros totales | Parámetros activos | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-Small | 276B | 12B | Apache 2.0 | Pesos abiertos |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible |

La documentación indica que Inkling-Small es más eficiente que Inkling (el modelo original) manteniendo un rendimiento comparable, aunque no se proporcionan cifras.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado en la información disponible.
- Riesgo de alucinación: no se han publicado tasas de alucinación; como todo modelo de lenguaje, puede generar contenido falso o no verificado.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada; el idioma principal es inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe revisar la política de uso aceptable de Thinking Machines.
- Caveats de entrada: el audio debe ser WAV de 16 kHz y se recomienda menos de 2 minutos; las imágenes deben tener dimensiones entre 40 y 4096 píxeles para un rendimiento óptimo.
- Almacenamiento: el repositorio tiene un tamaño de 531.9 GB, lo que implica requisitos de almacenamiento significativos.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/Inkling-Small
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de introducción: https://thinkingmachines.ai/news/inkling-small/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace: https://hf.co/blog/thinkingmachines-inkling

# trinityomni/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una versión cuantizada en formato NVFP4 (4 bits) del modelo multimodal Inkling-Small, desarrollado originalmente por Thinking Machines Lab. La cuantización ha sido publicada en Hugging Face por el usuario trinityomni bajo licencia Apache 2.0. El modelo base es un transformer autorregresivo con arquitectura de mezcla de expertos (MoE) que acepta entradas de texto, imagen y audio, y genera texto como salida. Está orientado a aplicaciones de agentes, uso de herramientas, asistentes de código, chatbots y sistemas de recuperación aumentada (RAG).

El modelo base tiene 276.000 millones de parámetros en total, de los cuales 12.000 millones se activan por token gracias al enrutamiento sparse de 6 expertos de un total de 256, más 2 expertos compartidos. La versión NVFP4 almacena los pesos en un formato de 4 bits, lo que reduce el espacio en disco y los requisitos de memoria frente a la versión BF16. El repositorio de Hugging Face reporta 156.032.140.138 parámetros en los archivos safetensors cuantizados.

La relevancia de esta variante radica en que permite desplegar un modelo multimodal de gran tamaño en hardware más asequible, manteniendo la capacidad de procesar texto, imágenes y audio de forma conjunta. No obstante, la documentación oficial no especifica la longitud de contexto, por lo que este dato debe consultarse en la documentación del modelo base antes de su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE sparse: 42 capas, 256 expertos, 6 activos + 2 compartidos, atención híbrida local/global |
| Parámetros totales | 156.032.140.138 (según safetensors); 276B según model card |
| Parámetros activos | 12B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (4 bits) |
| Idiomas soportados | Inglés (principal), con capacidades multilingües generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | Texto UTF-8, imagen (40-4096 px por dimensión), audio WAV 16 kHz (<2 min ideal) |
| Salidas | Texto UTF-8 |
| Tamaño del repositorio | 170.8 GB |

## Arquitectura y entrenamiento

El modelo base Inkling-Small es un transformer autorregresivo de 42 capas con una red feed-forward de mezcla de expertos (MoE) sparse. Cada token se enruta a 6 de los 256 expertos disponibles, más 2 expertos compartidos que se activan en todos los tokens. La atención es híbrida, alternando capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades en un espacio oculto compartido que procesa el decoder. La versión NVFP4 cuantiza los pesos a 4 bits, reduciendo el espacio de almacenamiento frente a la versión BF16. El repositorio reporta 156.032.140.138 parámetros en los archivos safetensors.

Los datos de entrenamiento incluyen una variedad de tipos de contenido: texto, imágenes, audio y vídeo. Según la documentación, las fuentes son públicas, adquiridas de terceros o generadas sintéticamente. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad o con objetivos de seguridad. No se especifica el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto multimodal: acepta texto, imagen y audio como entrada y genera texto.
- Razonamiento y uso de herramientas: diseñado para sistemas de agentes y de tool use.
- Asistencia de código: soporta múltiples lenguajes de programación.
- Recuperación aumentada (RAG): adecuado para sistemas de generación aumentada por recuperación.
- Visión: procesamiento de imágenes de 40 a 4096 px por dimensión.
- Audio: entrada de audio WAV a 16 kHz, idealmente bajo 2 minutos.
- Multilingüe: inglés como idioma principal, con capacidades generales en otros idiomas.
- Conversación e instrucciones: apto para chatbots y tareas de seguimiento de instrucciones.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener conversaciones multi-turno combinando texto, imágenes y audio, lo que permite aplicaciones de soporte que entienden capturas de pantalla o mensajes de voz.
- Agentes autónomos con tool calling: su diseño para sistemas de agentes permite integrarlo en pipelines donde el modelo decide llamar a funciones externas, consultar APIs o ejecutar código.
- Asistente de código en el IDE: puede generar, explicar y depurar código en múltiples lenguajes, integrándose en editores como VS Code o en pipelines de CI/CD.
- Sistemas RAG: al ser un modelo de lenguaje general, puede servir como generador en sistemas de recuperación aumentada, procesando documentos largos y consultas complejas.
- Análisis de imágenes en producción: capaz de describir contenido visual, extraer información de documentos escaneados o clasificar imágenes, siempre que las dimensiones estén dentro del rango recomendado.
- Transcripción y comprensión de audio: puede procesar audio WAV de hasta 2 minutos para transcripción, resumen o extracción de información, combinado con contexto textual.
- Investigación y fine-tuning: al ser de pesos abiertos con licencia Apache 2.0, permite ajuste fino para dominios específicos, como medicina o derecho, siempre que se respete la política de uso aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del modelo base incluye una tabla comparativa con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numéricos están truncados en el README proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado el número de parámetros en NVFP4 (156.032.140.138) y 4 bits por parámetro, el almacenamiento de pesos ronda los 78 GB, por lo que se necesitaría una GPU con al menos 80 GB de VRAM para inferencia en precisión completa del modelo cuantizado, aunque no hay datos confirmados.
- GPU recomendadas: no especificadas. Por tamaño, se requieren GPUs como A100 80GB, H100 80GB o RTX 6000 Ada 48GB (esta última probablemente insuficiente para los pesos completos).
- Cabe en consumer GPU: no, dado el tamaño de los pesos.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face Transformers, según las recetas oficiales del modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye resultados numéricos de benchmarks que permitan una comparativa directa. La model card del modelo base menciona comparaciones con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores están truncados. Por tanto, no se dispone de datos suficientes para elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- La longitud de contexto no se especifica en la documentación disponible; es necesario consultar el modelo base para conocer este parámetro antes de desplegar en producción.
- La cuantización NVFP4 puede introducir pérdida de precisión respecto a la versión BF16, especialmente en tareas que requieren alta sensibilidad numérica.
- La entrada de audio está limitada a WAV a 16 kHz y se recomienda una duración inferior a 2 minutos; audios más largos pueden degradar el rendimiento.
- Las imágenes deben tener dimensiones entre 40 y 4096 px por lado para un funcionamiento óptimo.
- Aunque la licencia Apache 2.0 permite uso comercial, se debe revisar la política de uso aceptable de Thinking Machines Lab para conocer restricciones adicionales.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; no se proporcionan evaluaciones de sesgo o seguridad en la información disponible.
- El repositorio en Hugging Face corresponde a una cuantización publicada por un tercero (trinityomni) y no ha sido validada oficialmente por Thinking Machines Lab, por lo que se recomienda verificar la integridad de los pesos.

## Enlaces

- Hugging Face (ficha actual): https://huggingface.co/trinityomni/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Modelo base NVFP4 (Thinking Machines): https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Model card oficial: https://thinkingmachines.ai/model-card/inkling-small/
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta Unsloth: https://unsloth.ai/docs/models/inkling

# thunquant/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una versión cuantizada en precisión NVFP4 (4 bits) del modelo multimodal Inkling-Small, desarrollado por Thinking Machines. Se trata de un transformador autoregresivo de 42 capas con arquitectura de Mixture-of-Experts (MoE) dispersa que acepta entradas de texto, imagen y audio, y genera texto. El modelo está diseñado para que desarrolladores construyan aplicaciones con IA, incluyendo sistemas agénticos, asistentes de código, chatbots y sistemas de retrieval-augmented generation.

La cuantización NVFP4 reduce el almacenamiento de pesos a 156.032.140.138 parámetros en safetensors (170,8 GB en el repositorio), frente a los 276B totales del modelo en BF16. Los parámetros activos por token son 12B, lo que permite inferencia eficiente en hardware NVIDIA con soporte de cuantización de 4 bits. El modelo se distribuye bajo licencia Apache 2.0 y soporta una ventana de contexto de hasta 1 millón de tokens, según datos del foro de desarrolladores de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con sparse MoE (256 expertos, 6 activos por token + 2 expertos compartidos), attention hibrida local y global |
| Parametros totales | 276B (segun model card); 156.032.140.138 en safetensors de esta version NVFP4 |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (4 bits); el modelo original soporta BF16 |
| Idiomas soportados | Ingles, con capacidades multilingues generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformador decoder-only de 42 capas con backbone feed-forward de Mixture-of-Experts dispersa: cada token se enruta a 6 de 256 expertos, mas 2 expertos compartidos activos en cada token. La atencion es hibrida, combinando capas locales y globales. Es nativamente multimodal: las imagenes se codifican mediante un codificador jerarquico de parches y el audio mediante codificacion discreta de tokens, con todas las modalidades proyectadas a un espacio oculto compartido y procesadas conjuntamente por el decoder.

Los datos de entrenamiento incluyen texto, imagenes, audio y video procedentes de fuentes publicas, adquiridos de terceros o generados sinteticamente. El proceso de curacion incluye deduplicacion y filtrado para eliminar contenido de baja calidad o reforzar objetivos de seguridad. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y audio, y produce texto UTF-8 como salida.
- Comprension de imagenes: procesa imagenes basadas en pixeles con dimensiones optimas entre 40px y 4096px por lado.
- Comprension de audio: acepta audio en formato WAV a 16 kHz, con longitud optima inferior a 2 minutos.
- Soporte de agentes y tool calling: disenado para aplicaciones agénticas y sistemas de uso de herramientas.
- Generacion de codigo: entrenado en multiples lenguajes de programacion.
- Razonamiento multi-paso: apto para tareas de razonamiento complejo gracias a su arquitectura MoE con 12B parametros activos.
- Capacidades multilingues generales: optimizado para ingles, con rendimiento variable en otros idiomas.
- Adecuado para sistemas RAG y conversacionales de proposito general.

## Casos de uso

- **Asistentes de programacion en IDE**: el modelo puede integrarse en editores de codigo para autocompletado, explicacion de fragmentos y refactorizacion, gracias a su entrenamiento en multiples lenguajes y su capacidad de tool calling.
- **Sistemas de retrieval-augmented generation (RAG)**: su ventana de contexto de hasta 1M tokens permite indexar y consultar documentos completos sin perder contexto, manteniendo la coherencia en respuestas sobre corpus extensos.
- **Atencion al cliente multimodal**: puede gestionar conversaciones que incluyen capturas de pantalla o grabaciones de audio, procesando la multimodalidad de forma nativa para resolver consultas complejas.
- **Analisis de documentos con contenido visual**: el modelo puede procesar PDFs, imagenes y documentos escaneados que contengan diagramas, graficas o tablas, extrayendo informacion estructurada.
- **Agentes autonomos de software**: con tool calling y razonamiento multi-paso, puede coordinar acciones en entornos de automatizacion, como gestion de APIs o ejecucion de scripts.
- **Transcripcion y resumen de audio**: acepta WAV a 16 kHz, permitiendo aplicaciones de resumen de reuniones, analisis de llamadas y extraccion de informacion de grabaciones.
- **Asistentes de soporte tecnico**: el modelo puede interpretar imagenes de pantallas de error y audio de descripciones de usuarios para diagnosticar problemas tecnicos.
- **Generacion de contenido creativo**: apto para redaccion, traduccion y adaptacion de textos en multiples idiomas, con soporte de instrucciones detalladas.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numericos de los benchmarks no estan disponibles en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 166 GB (segun LLM Explorer), lo que requiere multiples GPUs de alta gama.
- GPUs recomendadas: no se especifica un modelo concreto; se ha reportado despliegue en un clúster dual de DGX Spark de NVIDIA.
- Compatibilidad con GPUs de consumo: no es viable en GPUs consumer como RTX 4090 (24 GB VRAM) o similares.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y HuggingFace Transformers, segun la model card.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Inkling-Small-NVFP4 | 156B (NVFP4) / 276B (BF16) | 12B | Hasta 1M tokens | Apache 2.0 | Texto, imagen, audio |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | no disponible | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta optimizado para ingles; las capacidades multilingues son generales y el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion: como modelo generativo, puede producir contenido factualmente incorrecto; se recomienda validacion de salidas criticas.
- El formato de audio se limita a WAV a 16 kHz, con duracion optima inferior a 2 minutos; otros formatos o frecuencias pueden degradar el rendimiento.
- Las imagenes fuera del rango optimo de 40px a 4096px por dimension pueden producir resultados suboptimos.
- El despliegue requiere infraestructura de multiples GPUs con al menos 166 GB de VRAM agregada, lo que limita su uso en entornos de bajos recursos.
- La discrepancia entre los 276B reportados en la model card y los 156B del safetensors puede deberse a la cuantizacion NVFP4; se recomienda verificar la integridad de los pesos antes de su uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la politica de uso aceptable de Thinking Machines.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/thunquant/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Version NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Foro de NVIDIA sobre despliegue en clúster DGX Spark: https://forums.developer.nvidia.com/t/inkling-small-nvfp4-on-a-dual-dgx-spark-cluster/378645
- LLM Explorer (ficha del modelo): https://llm-explorer.com/model/thinkingmachines%2FInkling-Small-NVFP4,1WT9XZ7GG1EOlVZVuZRQOg

# thinkingmachines/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera texto. Se publica con pesos abiertos bajo licencia Apache 2.0 y está diseñado para aplicaciones de desarrollo que incluyen sistemas agénticos, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). Su relevancia radica en combinar un tamaño compacto (26,2 mil millones de parámetros totales, 3,4 mil millones activos) con una ventana de contexto de hasta 1 millón de tokens y capacidad de ejecución local en hardware de consumo.

La arquitectura es un transformer decodificador de 24 capas con capas de alimentación directa de tipo Mixture-of-Experts (MoE) disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que resulta en 48 aplicaciones de capa por token a partir de 24 capas de pesos. Cada token se enruta a 8 de 128 expertos en cada capa. La atención es un híbrido de capas locales y globales. El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido.

El modelo se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite su ejecución en dispositivos locales como un NVIDIA DGX Spark, Apple silicon con 32 GB o más de memoria, y otras GPU con 32 GB o más de VRAM. Fue publicado el 20 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE disperso y bucle de capas compartidas (looped transformer) |
| Parámetros totales | 26,2 mil millones |
| Parámetros activos | 3,4 mil millones (5,4 mil millones efectivos por token con tres pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantización | NVFP4 y MXFP8 (checkpoint distribuido); GGUF cuantizado disponible vía Unsloth y llama.cpp |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF para versiones cuantizadas |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer autorregresivo multimodal con arquitectura de bucle. Consta de 24 capas de decodificador con capas MoE dispersas; las 12 capas centrales se reutilizan tres veces con pesos compartidos, generando 48 aplicaciones de capa por token. Cada token se enruta a 8 de 128 expertos por capa. La atención combina capas locales y globales. La entrada de imagen se procesa mediante un vision transformer y se proyecta a un espacio oculto compartido con el texto, de modo que el decodificador procesa conjuntamente ambas modalidades. El modelo soporta precisiones NVFP4 y MXFP8.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifican en la información disponible el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con instrucciones.
- Procesamiento de imágenes: acepta cualquier imagen basada en píxeles, con dimensiones óptimas entre 40 px y 4096 px por dimensión.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Soporte de múltiples lenguajes de programación y tareas de código.
- Capacidad multilingüe general (inglés como idioma principal).
- Diseñado para sistemas agénticos y de uso de herramientas (tool-use).
- Adecuado para sistemas RAG y asistentes de código.
- Ventana de contexto de hasta 1 millón de tokens para documentos extensos.
- Modo de razonamiento multi-paso (implícito en el diseño para agentes).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 1 millón de tokens, manteniendo el historial completo de la interacción sin truncamiento.
- Generación de código en producción: soporta múltiples lenguajes de programación y puede integrarse en pipelines de CI/CD como asistente de revisión y generación de código.
- Sistemas RAG sobre documentación extensa: la ventana de 1M tokens permite ingerir corpus completos y realizar recuperación aumentada sin fragmentación agresiva.
- Análisis de documentos con imágenes: al aceptar entradas de imagen y texto conjuntamente, puede procesar facturas, capturas de pantalla o diagramas junto con texto explicativo.
- Agentes autónomos multi-paso: su diseño para tool-use y razonamiento multi-paso lo hace adecuado para orquestación de tareas con llamadas a herramientas externas.
- Despliegue en local para privacidad: al caber en Apple silicon con 32 GB o en un DGX Spark, permite inferencia en entornos con requisitos de confidencialidad sin depender de la nube.
- Fine-tuning downstream: los pesos abiertos bajo Apache 2.0 permiten ajuste fino en dominios específicos mediante la plataforma Tinker o frameworks como Miles y SkyRL.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de la tabla no están completos en la información proporcionada. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- Ejecución local soportada en 1x NVIDIA DGX Spark.
- Apple silicon con 32 GB o más de memoria (MacBook, Mac mini, Mac Studio).
- Otras GPU con 32 GB o más de VRAM recomendados.
- Frameworks de despliegue soportados: Hugging Face Transformers, SGLang, vLLM, NVIDIA Dynamo, TokenSpeed, Unsloth (incluye GGUF cuantizado), llama.cpp, Ollama y Exo Labs en Apple silicon.
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,2B totales / 3,4B activos | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face |
| Gemma 4 31B | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables aparecen en la tabla de evaluaciones de la model card, pero no se dispone de sus especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; el entrenamiento con datos de internet puede introducir sesgos no documentados.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan medidas específicas de mitigación en la información disponible.
- Idiomas: el soporte principal es inglés, con soporte multilingüe general no cuantificado; el rendimiento en castellano no está documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero existe una Política de Uso Aceptable del modelo que debe consultarse.
- El checkpoint distribuido usa precisiones NVFP4 y MXFP8, lo que puede limitar la compatibilidad con frameworks que no soporten estos formatos.
- La ventana de 1M tokens puede implicar degradación del rendimiento en los extremos del contexto; no se documenta.
- No se especifican el número de tokens de entrenamiento ni los detalles de alineación (RLHF/DPO), lo que dificulta evaluar su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Documentación de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

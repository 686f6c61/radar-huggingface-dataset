# YuCollection/Inkling-2-Mini

## Resumen
Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se trata de un transformer decoder-only con mezcla de expertos (MoE) dispersa y una innovadora arquitectura de capas en bucle ("looped transformer"): 24 capas de pesos, de las cuales las 12 centrales se ejecutan tres veces con pesos compartidos, resultando en 48 aplicaciones de capa por token. Con 26.400 millones de parámetros totales y 3.400 millones activos (5.400 millones efectivos por token debido a los tres pases por las capas en bucle), el modelo se posiciona como una opción compacta pero capaz para despliegues locales y en producción.

El modelo destaca por su ventana de contexto de hasta 1 millón de tokens y su soporte nativo multimodal, donde las imágenes se codifican mediante un vision transformer y se proyectan junto con el texto a un espacio oculto compartido procesado conjuntamente por el decoder. Se distribuye como un único checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite su ejecución en hardware de consumo como un DGX Spark de NVIDIA o dispositivos Apple Silicon con 32 GB o más de memoria.

Su relevancia actual radica en la combinación de un tamaño manejable para inferencia local, una licencia permisiva Apache 2.0 y un ecosistema de soporte amplio (vLLM, SGLang, llama.cpp, Ollama, Unsloth, entre otros), lo que lo convierte en un candidato atractivo para desarrolladores que necesitan un modelo multimodal con contexto largo sin depender de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa y capas en bucle (looped transformer) |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B (5,4B efectivos por token con los tres pases) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4, MXFP8 (checkpoint nativo); GGUF cuantizado disponible vía Unsloth y llama.cpp; 8-bit vía modelopt |
| Idiomas soportados | Inglés y soporte multilingüe general; múltiples lenguajes de programación |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisiones mixtas NVFP4/MXFP8) |

## Arquitectura y entrenamiento
Inkling 2 Mini emplea una arquitectura de transformer decoder-only de 24 capas con capas de feed-forward de mezcla de expertos (MoE) dispersa. En cada capa, cada token se enruta a 8 de 128 expertos. La innovación principal es el esquema de capas en bucle: las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da lugar a 48 aplicaciones de capa por token a partir de solo 24 capas de pesos. Cada pase adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos, de modo que con tres pases el modelo opera con 5.400 millones de parámetros activos efectivos por token. La atención es un híbrido de capas locales y globales.

El modelo es nativamente multimodal: las imágenes se codifican mediante un vision transformer y tanto las entradas de imagen como las de texto se proyectan a un espacio oculto compartido que el decoder procesa de forma conjunta. Los datos de entrenamiento incluyen una amplia variedad de tipos de contenido (texto, imágenes y vídeo), provenientes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar datos de baja calidad y avanzar en objetivos de seguridad. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento de propósito general, con soporte para instrucciones y conversación multi-turno.
- Procesamiento multimodal de imagen y texto: acepta imágenes de cualquier tipo basado en píxeles, con un rango óptimo de 40 px a 4096 px por dimensión.
- Capacidades de codificación en múltiples lenguajes de programación, orientadas a asistentes de código.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la descripción del autor.
- Soporte multilingüe general, con inglés como idioma principal.
- Ventana de contexto de hasta 1 millón de tokens, adecuada para documentos extensos y conversaciones largas.
- Integración con sistemas de generación aumentada por recuperación (RAG).
- Capacidad de post-entrenamiento y fine-tuning mediante plataformas como Tinker, Miles y SkyRL.

## Casos de uso
- Asistencia al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo gracias a su ventana de 1 millón de tokens, manteniendo el hilo de la conversación y recuperando información de interacciones previas sin truncamiento.
- Generación de código en producción: su soporte para múltiples lenguajes de programación y tool calling permite integrarlo en pipelines de CI/CD para autocompletado, revisión de código y generación de tests.
- Análisis de documentos extensos con imágenes: la combinación de contexto de 1M tokens y entrada multimodal permite procesar informes, contratos o manuales técnicos que incluyan figuras, diagramas y tablas en una sola pasada.
- Sistemas RAG multimodales: el modelo puede integrarse en arquitecturas de recuperación aumentada donde los documentos recuperados incluyan tanto texto como imágenes, proyectando ambas modalidades a un espacio compartido.
- Agentes autónomos con uso de herramientas: su soporte para tool-use y razonamiento multi-paso lo hace adecuado para agentes que necesiten invocar APIs, consultar bases de datos y encadenar acciones.
- Despliegue en local para prototipado y desarrollo: gracias a su checkpoint de ~20 GB y soporte para DGX Spark y Apple Silicon con 32 GB, los desarrolladores pueden ejecutar inferencia en hardware de consumo sin depender de la nube.
- Fine-tuning especializado: mediante Tinker, Miles o SkyRL, los equipos pueden adaptar el modelo a dominios concretos (legal, médico, financiero) partiendo de los pesos abiertos.

## Benchmarks y rendimiento
La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL. Sin embargo, los datos numéricos de dicha tabla no están completos en la información proporcionada (la tabla aparece truncada), por lo que no es posible presentar resultados concretos de benchmarks como MMLU, HumanEval o GSM8K.

No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint se distribuye en ~20 GB en precisiones mixtas NVFP4/MXFP8; se recomiendan 32 GB o más de VRAM para otras GPUs y plataformas.
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPUs con 32 GB o más de VRAM.
- Apple Silicon: dispositivos con 32 GB o más de memoria unificada (MacBooks, Mac minis y Studios).
- Cabe en hardware de consumo: sí, en DGX Spark y Apple Silicon de 32 GB; en GPUs de consumo con 32 GB o más de VRAM.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App, Ollama y Exo Labs en Apple Silicon.
- Post-entrenamiento: Miles y SkyRL.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31B (no confirmado en detalle) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (según denominación) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los modelos comparables citados en la model card (Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL) aparecen únicamente como referencias en la tabla de evaluaciones del autor, sin que se disponga de sus especificaciones completas ni de los resultados numéricos de la comparación en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan sesgos específicos en la información disponible; el entrenamiento con datos de internet y datos sintéticos puede introducir sesgos sociales y culturales no cuantificados.
- Riesgo de alucinación: como todo modelo generativo, puede producir información factualmente incorrecta, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Limitaciones de contexto e idioma: aunque soporta hasta 1M tokens, el rendimiento en contextos extremadamente largos puede degradarse; el idioma principal es el inglés y el soporte multilingüe es general, sin garantías específicas por idioma.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso.
- Caveats para producción: el modelo se distribuye en precisiones mixtas NVFP4/MXFP8, lo que puede requerir hardware compatible o conversión para otros formatos; las versiones GGUF cuantizadas pueden degradar la calidad; no se han publicado métricas de latencia ni throughput.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria todavía.

## Enlaces
- Hugging Face: https://huggingface.co/YuCollection/Inkling-2-Mini
- Hugging Face (modelo original del autor): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

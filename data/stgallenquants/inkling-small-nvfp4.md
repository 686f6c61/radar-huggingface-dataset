# stgallenquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una cuantizacion en formato NVFP4 del modelo multimodal Inkling-Small, desarrollado originalmente por Thinking Machines Lab y publicado en este repositorio por el usuario stgallenquants. Se trata de un transformer autoregresivo de tipo Mixture-of-Experts (MoE) con 276 000 millones de parametros totales y 12 000 millones activos, capaz de procesar texto, imagen y audio, y de generar texto como salida. La cuantizacion NVFP4 reduce el peso del modelo a aproximadamente 156 000 millones de parametros en formato safetensors, lo que permite su despliegue en entornos con requisitos de memoria mas reducidos que el original en BF16, aunque sigue requiriendo hardware de gama alta.

El modelo esta disenado para aplicaciones de agente, asistentes de codigo, chatbots y sistemas de recuperacion aumentada (RAG), con soporte nativo para razonamiento sobre imagenes y audio, y una ventana de contexto de hasta 1 millon de tokens segun la documentacion oficial. Su licencia Apache 2.0 permite uso comercial y modificacion, lo que lo convierte en una opcion atractiva para equipos que buscan un modelo multimodal de gran tamano con pesos abiertos. Este repositorio concreto ofrece la version cuantizada NVFP4, compatible con librerias como vLLM, SGLang y Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE (256 expertos, 6 activos + 2 compartidos) y atencion hibrida local/global |
| Parametros totales | 276 000 millones (156 032 140 138 en pesos NVFP4 segun safetensors) |
| Parametros activos | 12 000 millones |
| Longitud de contexto | Hasta 1 000 000 de tokens (segun documentacion oficial) |
| Tipos de cuantizacion | NVFP4 (este repositorio), BF16 (modelo base) |
| Idiomas soportados | Ingles, con capacidades multilingues generales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Inkling-Small-NVFP4 es una cuantizacion del modelo base Inkling-Small, que emplea una arquitectura de transformer decoder-only con 42 capas y una capa feed-forward basada en Mixture-of-Experts (MoE) dispersa. Cada token se enruta a 6 de los 256 expertos disponibles, mas 2 expertos compartidos que se activan en todos los tokens. La atencion es hibrida, combinando capas locales y globales, lo que permite manejar secuencias largas de forma eficiente. El modelo es nativamente multimodal: las imagenes se codifican mediante un codificador de parches jerarquico, y el audio mediante codificacion discreta de tokens, proyectandose todas las modalidades a un espacio oculto comun que procesa el decoder de manera conjunta.

En cuanto al entrenamiento, la informacion disponible indica que los datos provienen de fuentes publicas, adquisiciones de terceros y generacion sintetica, e incluyen texto, imagenes, audio y video. El proceso de curacion incluye limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad o con fines de seguridad. No se especifican detalles sobre el numero total de tokens de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO. El modelo fue entrenado en sistemas NVIDIA GB300 NVL72, segun la publicacion oficial de Thinking Machines Lab.

## Capacidades

- Generacion de texto multimodal: acepta entradas de texto, imagen y audio, y produce respuestas textuales.
- Razonamiento nativo sobre imagenes: analisis de contenido visual, descripcion de escenas, respuesta a preguntas sobre elementos de una imagen.
- Procesamiento de audio: entrada de audio en formato WAV a 16 kHz (hasta 2 minutos recomendados) para tareas como transcripcion o comprension auditiva.
- Razonamiento y resolucion de problemas: capacidad de razonamiento multi-paso y esfuerzo de pensamiento variable (thinking effort).
- Generacion de codigo: soporte para multiples lenguajes de programacion, adecuado para asistentes de codificacion.
- Tool calling y uso de agentes: disenado para sistemas agente y de tool-use, permitiendo integracion con APIs y herramientas externas.
- Capacidades multilingues: aunque el idioma principal es el ingles, ofrece capacidades generales en otros idiomas.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en entornos de desarrollo para generacion, revision y depuracion de codigo, gracias a su soporte de multiples lenguajes y su capacidad de tool calling para interactuar con repositorios o APIs de compilacion.
- Chatbots de atencion al cliente con contexto largo: su ventana de hasta 1 millon de tokens permite mantener conversaciones multi-turno extensas, incorporando historial completo y documentos de referencia sin perder informacion.
- Sistemas de recuperacion aumentada (RAG): al combinar texto e imagenes, puede indexar y responder consultas sobre documentacion tecnica que incluya diagramas, capturas de pantalla o graficos, ademas de texto.
- Analisis de imagenes medicas o tecnicas: su capacidad de razonamiento visual permite describir anomalias o extraer informacion relevante de radiografias, planos o fotografias en entornos de diagnostico asistido.
- Transcripcion y comprension de audio: puede procesar grabaciones de reuniones, entrevistas o mensajes de voz en formato WAV, generando resumenes o respondiendo preguntas sobre el contenido.
- Agentes autonomos de investigacion: combinando tool calling, razonamiento multi-paso y procesamiento multimodal, puede navegar por paginas web, leer documentos PDF y extraer datos de imagenes para completar tareas complejas de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card del autor incluye una tabla comparativa con modelos como Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los datos de rendimiento no estan completos en el material proporcionado. Por tanto, no es posible presentar una tabla de benchmarks verificada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 166 GB para el modelo NVFP4 (segun LLM Explorer), lo que requiere multiples GPUs de alta gama.
- GPUs recomendadas: sistemas con multiples NVIDIA A100 80GB, H100 80GB o similares. No cabe en GPUs de consumo como RTX 4090 (24 GB) de forma individual.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed, Unsloth y Hugging Face Transformers, con recipes oficiales disponibles.
- Latencia y throughput: no se han publicado datos especificos de latencia o throughput en la informacion disponible.
- Consideraciones: al ser un modelo MoE con 12B activos, el rendimiento en inferencia depende de la gestion de memoria y del batch size; el despliegue en produccion requiere planificacion de infraestructura.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos. La tabla de benchmarks del autor menciona a Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash como referencias, pero no se han proporcionado especificaciones detalladas de estos modelos en la informacion disponible. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos publicos de internet, el modelo puede reflejar sesgos sociales, culturales o de genero presentes en esos datos.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir informacion falsa o inventada, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- Limitaciones de contexto: aunque soporta hasta 1M de tokens, el rendimiento puede degradarse en secuencias extremadamente largas, y el coste computacional aumenta significativamente.
- Limitaciones de idioma: aunque tiene capacidades multilingues, su rendimiento optimo se da en ingles; otros idiomas pueden presentar errores o menor calidad.
- Requisitos de hardware: el modelo cuantizado NVFP4 sigue necesitando mas de 150 GB de VRAM, lo que limita su despliegue a entornos con GPUs profesionales multiples.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero Thinking Machines Lab publica una politica de uso aceptable que debe revisarse antes de su implementacion en productos finales.
- Dependencia de la cuantizacion: la version NVFP4 puede presentar ligeras diferencias de precision respecto al modelo BF16 original, lo que podria afectar a tareas de alta sensibilidad numerica.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/stgallenquants/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Model card oficial de Thinking Machines Lab: https://thinkingmachines.ai/model-card/inkling-small/
- Anuncio de lanzamiento: https://thinkingmachines.ai/news/inkling-small/
- Playground de prueba: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (ejemplos de uso): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Recipe de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Recipe de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Recipe de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Recipe de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling

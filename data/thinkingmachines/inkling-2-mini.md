# thinkingmachines/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc., publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de desarrollo: asistentes de código, sistemas agénticos con tool calling, chatbots y pipelines de generación aumentada por recuperación (RAG).

La arquitectura es un transformer decoder-only de 24 capas con capas de feed-forward de tipo Mixture-of-Experts disperso. Su rasgo más distintivo es el diseño "looped": las 12 capas centrales se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa a partir de solo 24 capas de pesos. El modelo totaliza 26.400 millones de parámetros, con 3.400 millones activos por pasada y aproximadamente 5.400 millones activos efectivos por token al ejecutarse con tres pasadas.

Su relevancia actual radica en la combinación de una ventana de contexto de hasta 1 millón de tokens, capacidades multimodales nativas y un checkpoint de solo unos 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite ejecutarlo en hardware local de gama alta para consumidores (Apple Silicon con 32 GB o más, una NVIDIA DGX Spark) además de en GPUs de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y capas centrales en bucle (looped); atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B por pasada; ~5,4B efectivos por token (tres pasadas) |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint distribuido); versiones GGUF cuantizadas vía Unsloth y llama.cpp; tag 8-bit / modelopt |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); GGUF para cuantización |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con 24 capas de pesos. Las 12 capas intermedias se reutilizan tres veces, lo que produce 48 aplicaciones de capa por token sin incrementar el número de pesos. Cada capa enruta cada token a 8 de 128 expertos (MoE disperso). La atención combina capas locales y globales. La multimodalidad es nativa: las imágenes se codifican mediante un vision transformer y las representaciones de imagen y texto se proyectan a un espacio oculto compartido que procesa el decoder de forma conjunta. Cada pasada adicional por las capas en bucle añade aproximadamente 1.000 millones de parámetros activos efectivos.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios accesibles públicamente, generación interna y datos sintéticos o aumentados. El proceso de curación incluye limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO. El modelo se distribuye en precisiones mixtas NVFP4 y MXFP8, y admite post-entrenamiento mediante las herramientas Miles y SkyRL.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de instrucciones conversacionales multi-turno.
- Comprensión de imágenes: entrada de cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Generación de código en múltiples lenguajes de programación.
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso para agentes y pipelines automatizados.
- Capacidades multilingües generales, con inglés como idioma principal.
- Contexto largo de hasta 1 millón de tokens para documentos extensos y conversaciones prolongadas.
- Integración en sistemas RAG y asistentes de código.

## Casos de uso

- Asistentes de código en producción: el modelo genera y explica código en varios lenguajes y admite tool calling, por lo que puede conectarse a compiladores, linters o APIs de repositorios dentro de un pipeline de CI/CD.
- Agentes autónomos multi-paso: la combinación de function calling y contexto de 1M tokens permite mantener el estado de tareas largas con muchas llamadas a herramientas sin perder el hilo de la conversación.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con historial extenso gracias a la ventana de contexto, e incorpora capturas o imágenes enviadas por el usuario mediante la entrada multimodal.
- RAG sobre documentación extensa: con hasta 1M tokens de contexto puede ingerir manuales, contratos o bases de conocimiento completas y responder con citas al contenido, reduciendo la dependencia de un sistema de recuperación externo.
- Análisis de documentos con imágenes: extracción y razonamiento sobre capturas, diagramas o páginas escaneadas, combinando el vision transformer con el decoder de texto.
- Asistente de accesibilidad: descripción y explicación de imágenes en aplicaciones móviles o de escritorio, con ejecución local en Apple Silicon de 32 GB o más.
- Prototipado e investigación con fine-tuning: al publicarse con pesos abiertos y licencia Apache 2.0, puede ajustarse con Tinker, Miles o SkyRL para dominios específicos y desplegarse en infraestructura propia.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero los datos numéricos de esa tabla no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- Checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8.
- Ejecución local soportada en 1x NVIDIA DGX Spark.
- Apple Silicon con 32 GB de memoria o más (MacBook, Mac mini, Mac Studio).
- Otras GPUs y plataformas son posibles, con 32 GB o más de VRAM recomendados.
- Frameworks de inferencia soportados: Hugging Face transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp (GGUF), Llama App, y en Apple Silicon Ollama y Exo Labs.
- Post-entrenamiento soportado con Miles y SkyRL.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (~5,4B efectivos) | 1M tokens | Apache 2.0 | Pesos abiertos en Hugging Face; API vía Tinker |
| Gemma 4 31B | 31B (dato de la model card; sin detalle adicional) | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (dato de la model card; sin detalle adicional) | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | no disponible | no disponible |

Los resultados de rendimiento comparado entre estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad detalladas; el uso en producción requiere auditoría propia.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de error en la información disponible.
- El soporte multilingüe se describe como "general", con el inglés como idioma principal; el rendimiento en otros idiomas no está cuantificado.
- La ventana de 1M tokens no implica que el modelo aproveche toda la información en posiciones lejanas; no se han publicado evaluaciones de recuperación en contexto largo.
- Aunque la licencia es Apache 2.0, el autor remite a una Política de Uso Aceptable del modelo que puede imponer restricciones adicionales al uso comercial.
- El checkpoint se distribuye en precisiones NVFP4 y MXFP8; las versiones GGUF cuantizadas pueden degradar la calidad y no están cubiertas por evaluaciones publicadas.
- El rendimiento óptimo con imágenes requiere dimensiones entre 40 px y 4096 px por lado; imágenes fuera de ese rango pueden degradar los resultados.
- No se detalla la composición exacta del dataset de entrenamiento ni el número de tokens, lo que dificulta evaluar la cobertura y los sesgos de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers (PyPI): https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de Uso Aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

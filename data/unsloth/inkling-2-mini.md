# unsloth/Inkling-2-Mini

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones conversacionales, asistentes de código, sistemas agénticos con uso de herramientas y pipelines de generación aumentada por recuperación (RAG). El repositorio analizado (`unsloth/Inkling-2-Mini`) es una distribución de los pesos originales empaquetada por Unsloth, con 26.388.646.440 parámetros totales y un tamaño de repositorio de 20,2 GB.

La arquitectura es un transformer decodificador de 24 capas con capas de alimentación hacia delante de tipo Mixture-of-Experts disperso: cada token se enruta a 8 de 128 expertos por capa. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo es nativamente multimodal, con un vision transformer que proyecta imágenes y texto a un espacio oculto compartido. La ventana de contexto alcanza 1 millón de tokens.

Su relevancia actual reside en la combinación de un tamaño contenido (26,4B totales, 3,4B activos, 5,4B activos efectivos por token) con precisión mixta NVFP4/MXFP8, lo que permite ejecutarlo en hardware local de gama alta (una NVIDIA DGX Spark, Apple Silicon con 32 GB o más, o GPUs con 32 GB de VRAM) sin renunciar a contexto muy largo ni a capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador con MoE disperso y bucle de capas (looped transformer); atención híbrida local/global; vision transformer para imágenes |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | 3,4B base; 5,4B efectivos por token con tres pasadas por las capas bucleadas |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | Pesos distribuidos en NVFP4 y MXFP8; versiones GGUF cuantizadas vía Unsloth y llama.cpp; tag 8-bit y modelopt en el repo |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint único de ~20 GB en precisión mixta NVFP4/MXFP8); GGUF disponible mediante Unsloth |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo con bucle ("looped transformer") de 24 capas. Las 12 capas centrales se reutilizan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa efectivas. Cada capa enruta cada token a 8 de 128 expertos en las capas MoE. La atención combina capas locales y globales, lo que resulta coherente con la ventana de 1M tokens. La multimodalidad es nativa: un vision transformer codifica las imágenes y tanto estas como el texto se proyectan a un espacio oculto compartido que procesa el decodificador de forma conjunta. El modelo admite entradas de imagen con dimensiones recomendadas entre 40 px y 4096 px por lado.

Los datos de entrenamiento incluyen texto, imágenes y vídeo, procedentes de fuentes públicas de internet, repositorios públicos, datos generados internamente y datos sintéticos o aumentados. El proceso de curación comprende limpieza, deduplicación y filtrado para eliminar contenido de baja calidad y reforzar objetivos de seguridad. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, con soporte de instrucciones y conversación multi-turno.
- Comprensión de imágenes: descripción, respuesta a preguntas visuales y tareas que combinan imagen y texto en el mismo contexto.
- Generación de código en múltiples lenguajes de programación, orientada a asistentes de desarrollo.
- Uso de herramientas y function calling, según la orientación declarada del modelo a sistemas agénticos y tool-use.
- Razonamiento multi-paso y flujos agénticos, favorecidos por la ventana de contexto de hasta 1M tokens.
- Soporte multilingüe general, con inglés como idioma principal.
- Integración en sistemas RAG gracias al contexto largo.
- Ajuste fino posterior soportado por las herramientas Miles y SkyRL, además del ecosistema Unsloth.

## Casos de uso

- Asistentes de código en producción: el modelo puede integrarse en IDE o pipelines de CI/CD para revisión de parches, generación de tests y explicación de errores, con soporte de tool calling para invocar linters o ejecutar comandos.
- Atención al cliente automatizada: conversaciones multi-turno con historial extenso gracias a la ventana de 1M tokens, útil para conservar el contexto completo de un cliente a lo largo de una incidencia.
- Análisis de documentos largos con imágenes: informes, contratos o manuales técnicos de cientos de páginas que incluyen diagramas, procesados en una sola pasada sin troceado agresivo.
- RAG sobre bases documentales corporativas: la ventana larga permite incluir muchos fragmentos recuperados y reducir la pérdida de contexto entre consultas.
- Agentes autónomos de navegación y automatización: uso de herramientas y razonamiento multi-paso para descomponer tareas y ejecutar acciones encadenadas.
- Asistencia multimodal en soporte técnico: el usuario envía una captura de pantalla o una foto de un equipo y el modelo diagnostica a partir de la imagen y del texto de la conversación.
- Despliegue local en estaciones de trabajo: inferencia en una DGX Spark o en un Mac con 32 GB o más para prototipado y evaluación sin depender de la nube.
- Ajuste fino específico de dominio con Unsloth, Miles o SkyRL para adaptar el modelo a vocabulario técnico o flujos internos.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con Gemma 4 31B, Muse Glimmer, Qwen3.8-27B y Nemotron 3.5 Super VL, pero en la información proporcionada solo aparecen las cabeceras y la fila de información del modelo, sin los valores numéricos de las métricas. Por tanto, no se dispone de resultados concretos que se puedan reproducir aquí.

| Benchmark | Inkling 2 Mini | Gemma 4 31B | Muse Glimmer | Qwen3.8-27B | Nemotron 3.5 Super VL |
|---|---|---|---|---|---|
| Valores numéricos | no disponibles en la información proporcionada | no disponibles | no disponibles | no disponibles | no disponibles |

No se han publicado resultados de benchmarks utilizables en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa unos 20 GB en NVFP4/MXFP8; se recomiendan 32 GB o más de VRAM para inferencia.
- GPU recomendadas: 1x NVIDIA DGX Spark como plataforma validada; otras GPUs con 32 GB o más de VRAM son viables según el autor.
- Apple Silicon: equipos con 32 GB o más de memoria unificada (MacBook, Mac mini, Mac Studio).
- GPU de consumo: no se confirma soporte en RTX 4090 (24 GB) con el checkpoint completo; las versiones GGUF cuantizadas de Unsloth y llama.cpp podrían reducir el requisito, pero no se especifica el mínimo exacto.
- Opciones de despliegue: Hugging Face Transformers, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth (incluidas versiones GGUF cuantizadas), llama.cpp, Llama App, Ollama y Exo Labs en Apple Silicon.
- Entrenamiento posterior: Miles y SkyRL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini | 26,4B totales / 3,4B activos (5,4B efectivos) | 1M tokens | Texto e imagen | Apache 2.0 | Pesos abiertos en Hugging Face, Tinker, Unsloth |
| Gemma 4 31B | 31B (dato de la tabla comparativa del autor) | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.8-27B | 27B (dato de la tabla comparativa del autor) | no disponible | no disponible | no disponible | no disponible |
| Nemotron 3.5 Super VL | no disponible | no disponible | Visión-lenguaje (por el nombre) | no disponible | no disponible |

Los datos de los modelos comparables provienen únicamente de la tabla de evaluaciones de la model card; no se dispone de sus especificaciones completas ni de sus resultados numéricos en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad detalladas; el filtrado de datos se describe de forma genérica.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de error en la información disponible.
- El soporte multilingüe se declara como "general", con el inglés como idioma principal; el rendimiento en castellano no está cuantificado.
- Aunque la licencia es Apache 2.0, el autor remite a una política de uso aceptable adicional que conviene revisar antes de un despliegue comercial.
- El checkpoint distribuido usa precisiones NVFP4 y MXFP8; la compatibilidad con GPUs que no soporten estos formatos requiere recurrir a las versiones GGUF o a conversiones propias.
- No se especifican el número de tokens de entrenamiento ni las etapas de alineación (RLHF/DPO), lo que dificulta evaluar el grado de ajuste a instrucciones.
- El contexto de 1M tokens puede implicar un coste de memoria KV elevado en produccion; no se han publicado cifras de memoria por token de contexto.
- El repositorio es una redistribución de Unsloth con 0 descargas en el momento de la consulta; para producción conviene contrastar con el repositorio oficial del autor.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/unsloth/Inkling-2-Mini
- Repositorio oficial del autor: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers en PyPI: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Documentación de Unsloth para Inkling 2 Mini: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Ollama: https://ollama.com/library/inkling-2-mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Unsloth (sitio principal): https://unsloth.ai/
- Documentación de Unsloth: https://unsloth.ai/docs

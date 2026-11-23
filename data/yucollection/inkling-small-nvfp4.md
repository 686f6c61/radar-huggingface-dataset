# YuCollection/Inkling-Small-NVFP4

## Resumen

Inkling-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto, imagen y audio y genera salidas de texto. Se trata de un transformer autoregresivo decoder-only de 42 capas con una columna vertebral de tipo Mixture-of-Experts (MoE) dispersa: cada token se enruta a 6 de 256 expertos, además de 2 expertos compartidos activos en todos los tokens. La atención combina capas locales y globales, y el modelo es nativamente multimodal: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos, proyectándose todas las modalidades a un espacio oculto compartido que el decoder procesa de forma conjunta.

El modelo base cuenta con 276B parámetros totales y 12B activos, lo que lo sitúa en la categoría de modelos MoE de gran escala pero con un coste de inferencia contenido por token. La versión aquí descrita, `YuCollection/Inkling-Small-NVFP4`, es una cuantización en NVFP4 (4 bits de precisión de punto flotante, etiquetada como 8-bit en los tags del repositorio) del modelo original, publicada bajo licencia Apache 2.0 y con un tamaño de repositorio de 170,8 GB.

Su relevancia actual radica en la combinación de tres factores: multimodalidad nativa (texto, imagen y audio en un único modelo), una arquitectura MoE eficiente en cómputo (12B activos frente a 276B totales) y una licencia permisiva que facilita su integración en productos de terceros, investigación y ajuste fino. El modelo está pensado para sistemas agénticos, asistentes de código, chatbots, RAG y conversación general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo de 42 capas con MoE dispersa (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida local/global |
| Parametros totales | 276B (modelo base); 156.032.140.138 según safetensors del repositorio cuantizado |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante; tag del repo: 8-bit) |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Inkling-Small es un transformer autoregresivo decoder-only de 42 capas con una columna vertebral feed-forward de tipo Mixture-of-Experts dispersa. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que se activan en todos los tokens. La atención es un híbrido de capas locales y globales. El modelo es nativamente multimodal: las imágenes se procesan mediante un codificador jerárquico de parches y el audio mediante codificación de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y el decoder las procesa conjuntamente. El modelo base declara 276B parámetros totales y 12B activos, y soporta numéricamente BF16 y NVFP4.

Los datos de entrenamiento incluyen una variedad amplia de tipos de contenido: texto, imágenes, audio y vídeo. Las fuentes proceden de datos públicos de internet y repositorios públicos, de terceros, y de datos generados o aumentados sintéticamente. El proceso de curación incluye limpieza, procesamiento y modificación de los conjuntos de datos, con pasos que varían según el tipo de dato: deduplicación, filtrado para eliminar contenido basura o de baja calidad, y filtrado orientado a objetivos de seguridad. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto e instrucciones de propósito general, con soporte para conversación multi-turno.
- Comprensión de imágenes: acepta cualquier imagen basada en píxeles, con rendimiento óptimo cuando cada dimensión está entre 40 px y 4096 px.
- Comprensión de audio: acepta WAV muestreado a 16 kHz, con rendimiento óptimo para audios de menos de 2 minutos.
- Generación de código en múltiples lenguajes de programación.
- Razonamiento y tareas de lenguaje natural de propósito general.
- Capacidades multilingües generales, con inglés como idioma principal.
- Orientado a sistemas agénticos y de uso de herramientas (tool-use), asistentes de código, chatbots y sistemas RAG.
- Salida exclusivamente en texto codificado en UTF-8.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede gestionar conversaciones multi-turno que combinen texto, imágenes y audio en una misma sesión, gracias a la proyección conjunta de modalidades en un espacio oculto compartido.
- Sistemas agénticos y de uso de herramientas: al estar diseñado explícitamente para tool-use y aplicaciones agénticas, puede integrarse en pipelines que requieran invocar funciones externas y encadenar pasos de razonamiento.
- Asistentes de código: genera código en múltiples lenguajes y puede integrarse en entornos de desarrollo como asistente de autocompletado, explicación o refactorización.
- RAG sobre documentos con imágenes: la combinación de entrada de texto e imagen permite construir sistemas de recuperación aumentada que procesen páginas escaneadas, capturas o diagramas junto con texto.
- Transcripción y análisis de audio: la entrada de audio WAV a 16 kHz permite construir pipelines de resumen de reuniones, análisis de llamadas o extracción de información de grabaciones breves (menos de 2 minutos para rendimiento óptimo).
- Atención al cliente automatizada: con soporte de conversación multi-turno y entradas multimodales, puede gestionar consultas que incluyan capturas de pantalla o mensajes de voz.
- Investigación y ajuste fino: al publicarse con pesos abiertos y licencia Apache 2.0, sirve como base para experimentación académica, fine-tuning sobre dominios específicos e integración en productos de terceros.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativa con modelos de pesos abiertos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y modelos de pesos cerrados, pero los valores numéricos de dicha tabla no están disponibles en la información proporcionada. No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- El repositorio cuantizado en NVFP4 ocupa 170,8 GB, por lo que se requiere almacenamiento y memoria en el orden de cientos de GB para cargar el modelo completo.
- El modelo base declara 276B parámetros totales con 12B activos; la inferencia requiere GPU de centro de datos con memoria suficiente para los pesos cuantizados distribuidos.
- Opciones de despliegue documentadas por el autor: SGLang, vLLM, TokenSpeed, Unsloth y transformers de Hugging Face.
- No se dispone de datos específicos de VRAM mínima, GPU recomendadas, latencia ni throughput en la información proporcionada.
- Por su tamaño (170,8 GB en NVFP4), no es viable en GPU de consumo individuales sin técnicas de offload o despliegue multi-GPU.

## Comparativa con modelos similares

La model card del autor incluye una tabla comparativa con los siguientes modelos, aunque los valores numéricos no están disponibles en la información proporcionada:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-Small | 276B totales / 12B activos | no disponible | Apache 2.0 | Pesos abiertos (BF16 y NVFP4) |
| Qwen3.5 397B-A17B | 397B totales / 17B activos | no disponible | no disponible | Pesos abiertos |
| MiMo V2.5 | no disponible | no disponible | no disponible | Pesos abiertos |
| Minimax M2.7 | no disponible | no disponible | no disponible | Pesos abiertos |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Pesos abiertos |

## Limitaciones y advertencias

- El modelo está diseñado principalmente para inglés; las capacidades multilingües son generales pero no se detallan por idioma.
- El audio óptimo se limita a menos de 2 minutos y el formato debe ser WAV a 16 kHz; audios más largos pueden degradar el rendimiento.
- Las imágenes deben tener dimensiones entre 40 px y 4096 px para un rendimiento óptimo.
- No se especifican en la información disponible los sesgos conocidos, la tasa de alucinación ni las limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a una política de uso aceptable (`model-acceptable-use-policy`) que conviene revisar antes de desplegar en producción.
- El repositorio aquí descrito es una cuantización NVFP4 de un tercero (`YuCollection`), no la versión oficial del autor; conviene validar la fidelidad de la cuantización frente al modelo base BF16.
- La cuantización NVFP4 puede introducir degradación de calidad respecto al modelo en BF16, especialmente en tareas sensibles a la precisión numérica.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/YuCollection/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Modelo base NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face: https://hf.co/blog/thinkingmachines-inkling

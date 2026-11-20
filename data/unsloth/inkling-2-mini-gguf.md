# unsloth/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. y publicado el 20 de noviembre de 2026 bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está orientado a aplicaciones de agentes, asistentes de código, chatbots y sistemas de recuperación aumentada (RAG). La versión aquí descrita es la cuantización GGUF publicada por Unsloth, que permite ejecutar el modelo en hardware de consumo y en Apple Silicon.

Arquitectura y tamaño: se trata de un transformer decoder-only de 24 capas con capas feed-forward de tipo Mixture-of-Experts disperso. Las 12 capas centrales se ejecutan tres veces con pesos compartidos, lo que da 48 aplicaciones de capa por token a partir de 24 capas de pesos. El modelo tiene 26.200 millones de parámetros totales y 3.400 millones activos, que ascienden a unos 5.400 millones efectivos por token debido al bucle de capas. Cada token se enruta a 8 de 128 expertos por capa.

La relevancia de esta ficha radica en que Unsloth ofrece cuantizaciones dinámicas (UD) en formato GGUF que reducen el checkpoint original de unos 20 GB en NVFP4/MXFP8 hasta 7,76 GB en UD-IQ1_S, manteniendo una fidelidad medible frente a la referencia UD-Q8_K_XL. Esto hace viable el despliegue local en GPUs de consumo y en equipos Apple con 32 GB o más de memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE disperso y bucle de capas (looped transformer), atención híbrida local/global, codificador de visión ViT |
| Parámetros totales | 26.200 millones (26.070.390.272 según safetensors) |
| Parámetros activos | 3.400 millones (5.400 millones efectivos por token por el bucle de 3 pasadas) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 y MXFP8 (original); GGUF UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_M, UD-Q4_K_XL, UD-Q8_K_XL |
| Idiomas soportados | Inglés y soporte multilingüe general; lenguajes de programación múltiples |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta versión); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo multimodal con un bucle de capas: de las 24 capas, las 12 centrales se reutilizan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. Las capas feed-forward son de tipo Mixture-of-Experts disperso con 128 expertos por capa y enrutamiento de 8 expertos por token. La atención combina capas locales y globales. La multimodalidad es nativa: un vision transformer codifica las imágenes y las proyecta junto con el texto a un espacio oculto compartido que procesa el decoder.

El checkpoint original se distribuye en un único archivo de unos 20 GB en precisiones mixtas NVFP4 y MXFP8. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La versión de Unsloth aplica cuantización dinámica (Unsloth Dynamic 3.0) con matrices de importancia (imatrix), y publica métricas de divergencia KL y coincidencia de top-1 frente a la cuantización de referencia UD-Q8_K_XL.

## Capacidades

- Generación de texto conversacional e instrucciones de propósito general.
- Comprensión de imágenes (image-text-to-text) con entrada de texto UTF-8 e imágenes en píxeles; se recomienda que cada dimensión de imagen esté entre 40 px y el límite indicado en la model card original.
- Generación de código en múltiples lenguajes de programación.
- Soporte para sistemas agénticos y de uso de herramientas (tool-use), según la descripción del autor.
- Soporte multilingüe general, con inglés como idioma principal.
- Uso en sistemas RAG, asistentes de código y chatbots.
- Ajuste fino posterior soportado mediante Miles y SkyRL, y acceso a fine-tuning vía la plataforma Tinker.
- No se especifican en la información disponible modos de razonamiento explícito (thinking), audio ni otras modalidades adicionales.

## Casos de uso

- Asistentes de código en local: el modelo genera código en varios lenguajes y puede integrarse en entornos de desarrollo con GPUs de consumo gracias a las cuantizaciones GGUF de 8 a 17 GB, sin depender de servicios en la nube.
- Atención al cliente automatizada: al ser conversacional y multilingüe, puede gestionar diálogos multi-turno; la longitud de contexto no está confirmada, por lo que conviene validar el límite real antes de desplegarlo con historiales largos.
- Sistemas RAG con soporte de imágenes: la combinación de entrada de texto e imagen permite indexar y consultar documentos que incluyan figuras, capturas o diagramas junto con texto.
- Agentes y automatización de flujos con herramientas: el soporte declarado de tool-use lo hace apto para orquestar llamadas a APIs y pasos múltiples en pipelines internos.
- Procesamiento de documentos escaneados: la entrada de imagen permite extraer y resumir información de facturas, formularios o informes, con verificación humana posterior por el riesgo de alucinación.
- Despliegue en estaciones de trabajo Apple Silicon: con 32 GB o más de memoria unificada se puede ejecutar vía Ollama o Exo Labs, útil para prototipado y demos sin GPU dedicada.
- Fine-tuning específico de dominio: al ser Apache 2.0 y estar disponible en Tinker, Miles y SkyRL, permite adaptar el modelo a tareas verticales (legal, sanitario, soporte técnico) con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card de Unsloth sí incluye métricas de fidelidad de cuantización frente a la referencia UD-Q8_K_XL:

| Cuantización | Tamaño (GB) | KLD media vs UD-Q8_K_XL | Mismo token top-1 |
|---|---|---|---|
| UD-IQ1_S | 7,76 | 0,0911 | 89,4 % |
| UD-IQ1_M | 8,02 | 0,0867 | 90,2 % |
| UD-IQ2_XXS | 8,49 | 0,0726 | 90,6 % |
| UD-Q2_K_XL | 9,14 | 0,0595 | 91,6 % |
| UD-IQ3_XXS | 11,66 | 0,0269 | 94,7 % |
| UD-Q3_K_XL | 13,63 | 0,0174 | 96,3 % |
| UD-IQ4_XS | 15,73 | 0,0109 | 97,7 % |
| UD-Q4_K_M | 16,61 | 0,0108 | 97,9 % |
| UD-Q4_K_XL | 17,63 | 0,0107 | 98,0 % |
| UD-Q8_K_XL | 22,87 | referencia | — |

## Requisitos de hardware

- Checkpoint original: unos 20 GB en NVFP4/MXFP8; se recomiendan 32 GB o más de VRAM.
- GGUF cuantizado: desde 7,76 GB (UD-IQ1_S) hasta 22,87 GB (UD-Q8_K_XL); para uso cómodo se recomienda reservar VRAM adicional para el contexto y el codificador de visión.
- GPU recomendadas: 1x NVIDIA DGX Spark para el checkpoint original; GPUs con 32 GB o más de VRAM en general. Las cuantizaciones de 8 a 17 GB permiten su uso en GPUs de consumo con 12-24 GB de VRAM, aunque el dato concreto por modelo no está confirmado en la información disponible.
- Apple Silicon: MacBooks, Mac mini y Mac Studio con 32 GB o más de memoria unificada, mediante Ollama o Exo Labs.
- Frameworks de despliegue: Hugging Face, SGLang, vLLM, NVIDIA Dynamo, TokenSpeed, Unsloth, llama.cpp (GGUF), Ollama y Exo Labs (Apple Silicon).
- Fine-tuning posterior: Miles y SkyRL; acceso API mediante la plataforma Tinker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables, por lo que la comparación se limita a parámetros y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Inkling 2 Mini (esta ficha) | 26,2B totales / 3,4B activos | no disponible | Apache 2.0 | GGUF, safetensors, NVFP4/MXFP8 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad en la información disponible.
- La longitud de contexto no está especificada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- El idioma principal es el inglés; el soporte multilingüe es general y no se detalla su calidad por idioma.
- Las cuantizaciones agresivas (UD-IQ1_S, UD-IQ1_M) presentan una divergencia KL de 0,09 y una coincidencia top-1 de en torno al 89-90 %, con la consiguiente pérdida de calidad frente a la referencia.
- La licencia Apache 2.0 permite uso comercial, pero el autor publica una Política de Uso Aceptable del Modelo que debe revisarse antes de desplegarlo en producción.
- El checkpoint original requiere precisiones NVFP4/MXFP8 y 32 GB o más de VRAM; su ejecución en hardware no soportado puede requerir conversión.
- El modelo está fechado en noviembre de 2026 y la versión GGUF tiene 0 descargas en el momento de la consulta, por lo que la validación comunitaria es todavía limitada.

## Enlaces

- Hugging Face (esta versión GGUF): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Guía de ejecución de Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- Documentación de Miles: https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
- Documentación de SkyRL: https://docs.skyrl.ai/docs/models/inkling2
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/

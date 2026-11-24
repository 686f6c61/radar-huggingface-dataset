# unsloth/Inkling-2-Mini-unsloth-bnb-4bit

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, Inc. que acepta entradas de texto e imagen y genera salidas de texto. Se publicó el 20 de noviembre de 2026 con pesos abiertos bajo licencia Apache 2.0, orientado a desarrolladores que construyen aplicaciones con agentes, asistentes de código, chatbots y sistemas RAG. La ficha que nos ocupa, `unsloth/Inkling-2-Mini-unsloth-bnb-4bit`, es una conversión de cuantización de 4 bits realizada por Unsloth para facilitar el ajuste fino con LoRA sobre hardware de consumo.

El modelo original emplea una arquitectura MoE (mixture of experts) con 24 capas y 128 expertos enrutados por capa, y un total de 26.388.641.280 parámetros. Thinking Machines lo distribuye como un checkpoint único de aproximadamente 20 GB en precisión mixta NVFP4 y MXFP8, lo que permite su ejecución en una NVIDIA DGX Spark o en equipos Apple Silicon con 32 GB o más de memoria unificada. La versión de Unsloth reduce la descarga a unos 15,6 GB cuantizando los expertos y las proyecciones de atención a NF4 con doble cuantización, manteniendo en 16 bits las partes sensibles (embeddings, cabeza de salida, torre de visión, routers y normas).

La relevancia de esta ficha radica en que permite entrenar y ejecutar un modelo multimodal MoE de 26B parámetros en GPUs de consumo con 4 bits, algo que con el checkpoint original en NVFP4/MXFP8 requería dequantizar cada experto a 16 bits en cada carga. Además, Unsloth garantiza que los pesos de 4 bits son idénticos a los que se generan con `load_in_4bit = True` sobre el checkpoint original, por lo que las pérdidas de entrenamiento son equivalentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con torre de visión; 24 capas x 128 expertos enrutados por capa |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantizacion (bitsandbytes) para expertos y proyecciones de atencion; 16 bits para embeddings, lm_head, torre de vision, routers, normas y gates; checkpoint original en NVFP4/MXFP8 |
| Idiomas soportados | Ingles y soporte multilingue general (segun model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 15,6 GB); transformers >= 5.24 |

## Arquitectura y entrenamiento

Inkling 2 Mini es un transformer MoE multimodal. La model card del checkpoint original describe 24 capas con 128 expertos enrutados por capa (`mlp.experts.gate_up_proj` y `mlp.experts.down_proj`), además de proyecciones de atención (q, k, v, o), una compuerta de salida, proyecciones de sink y de posición relativa, y una torre de visión con su merger. El modelo incluye además gates de mensaje por capa (`{q,k,v,mlp}_message_gate`), lo que sugiere un mecanismo de paso de mensajes entre capas o iteraciones, y una cabeza de predicción multi-token (`mtp.safetensors`) que no se incluye en esta conversión porque transformers no la carga.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del modelo base no detalla el proceso de entrenamiento más allá de indicar que está diseñado para uso conversacional, seguimiento de instrucciones y tareas agénticas y de tool use. La innovación técnica destacable de esta ficha concreta es la conversión a NF4 con doble cuantización: los expertos enrutados ocupan 12,62 GB en 4 bits, las proyecciones de atención 0,33 GB, y se mantienen en 16 bits los embeddings (0,93 GB), la cabeza de salida (0,93 GB), la torre de visión (0,64 GB), los gates de mensaje (0,09 GB), los routers MoE (0,03 GB) y las normas y convoluciones cortas (0,01 GB). La lista de módulos en 16 bits se corresponde con `llm_int8_skip_modules` en `config.json`.

## Capacidades

- Generación de texto e instrucciones conversacionales multi-turno.
- Procesamiento de imágenes como entrada (pipeline `image-text-to-text`), con torre de visión dedicada.
- Razonamiento y tareas de código en múltiples lenguajes de programación, según la model card del modelo base.
- Soporte para sistemas agénticos y tool use, orientado a asistentes de código y chatbots.
- Soporte multilingüe general, con inglés como idioma principal.
- Ajuste fino con LoRA mediante Unsloth, con `load_in_4bit = True` y `max_seq_length` configurable.
- Compatible con endpoints (tag `endpoints_compatible`) y con la librería transformers >= 5.24.
- Cabeza de predicción multi-token (MTP) presente en el checkpoint original, aunque no se incluye en esta conversión de 4 bits.

## Casos de uso

- Ajuste fino de un asistente multimodal en una sola GPU de consumo: gracias a la cuantización NF4 de los expertos (12,62 GB) y a que Unsloth mantiene los embeddings y la cabeza en 16 bits, se puede entrenar con LoRA en GPUs con 24 GB de VRAM, algo inviable con el checkpoint original en NVFP4/MXFP8.
- Atención al cliente con soporte de imágenes: el modelo acepta texto e imagen y puede gestionar conversaciones multi-turno; su torre de visión de 0,64 GB en 16 bits permite interpretar capturas o documentos escaneados enviados por el usuario.
- Asistente de código en pipelines de CI/CD: la model card del modelo base lo orienta a asistentes de código y tool use, por lo que puede integrarse en flujos de revisión automática o generación de parches con llamadas a herramientas.
- Sistemas RAG multimodales: al aceptar imágenes y texto, puede indexar y consultar documentación que combine capturas, diagramas y texto, con la ventaja de ejecutarse en local en Apple Silicon con 32 GB o en una DGX Spark.
- Prototipado en estaciones de trabajo Apple: el checkpoint original está soportado en MacBooks, Mac minis y Studios con 32 GB o más de memoria unificada; esta versión de 15,6 GB reduce el espacio en disco y el tiempo de carga al evitar la dequantización en cada carga.
- Investigación en ajuste fino eficiente: al ser bit a bit idéntico a los pesos que Unsloth genera con `load_in_4bit = True`, sirve como base reproducible para experimentos de LoRA con pérdidas equivalentes a las del checkpoint original.
- Despliegue en entornos con VRAM limitada: con 15,6 GB de pesos en 4 bits, cabe en GPUs de 24 GB junto con el contexto y los estados de activación, y en una DGX Spark de forma nativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15,6 GB solo para pesos en 4 bits; se recomiendan 32 GB o más de VRAM según la model card del modelo base.
- GPU recomendadas: 1x NVIDIA DGX Spark; otras GPUs con 32 GB o más de VRAM. Para el ajuste fino con LoRA en 4 bits, el tamaño de pesos (15,6 GB) permite plantear GPUs de 24 GB, aunque no se especifica oficialmente.
- Apple Silicon: MacBooks, Mac minis y Mac Studios con 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más de VRAM para inferencia en 4 bits; el checkpoint original requiere 32 GB o más.
- Opciones de despliegue: transformers >= 5.24, Unsloth (`FastModel.from_pretrained` con `load_in_4bit = True`), SGLang (soportado por el modelo base según la model card), Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unsloth/Inkling-2-Mini-unsloth-bnb-4bit | 26.388.641.280 | no disponible | NF4 4 bits + 16 bits selectivo | Apache 2.0 | Hugging Face, 15,6 GB |
| thinkingmachines/Inkling-2-Mini | 26.388.641.280 | no disponible | NVFP4 / MXFP8 mixto | Apache 2.0 | Hugging Face, ~20 GB |
| unsloth/Inkling-2-Mini | 26.388.641.280 | no disponible | 16 bits (incluye cabeza MTP) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros modelos comparables de la misma categoría (multimodales MoE de ~26B) en la información proporcionada.

## Limitaciones y advertencias

- No se incluye la cabeza de predicción multi-token (`mtp.safetensors`) porque transformers no la carga; si se necesita, está en `unsloth/Inkling-2-Mini`.
- El modelo está pensado principalmente para inglés y soporte multilingüe general; no se detallan los idiomas cubiertos ni su calidad por idioma.
- No se han publicado datos de benchmarks, por lo que no se puede evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base está sujeto a la Model Acceptable Use Policy de Thinking Machines Lab, que puede imponer restricciones adicionales de uso.
- Requiere transformers >= 5.24; versiones anteriores no cargarán el modelo.
- El ajuste fino con `save_pretrained_merged(..., save_method = "merged_16bit")` fusiona el LoRA en los pesos originales de `unsloth/Inkling-2-Mini`, no en esta versión de 4 bits.
- La cuantización NF4 puede degradar ligeramente la calidad frente al checkpoint original en NVFP4/MXFP8; no se proporcionan métricas de dicha degradación.

## Enlaces

- Repositorio Hugging Face de esta ficha: https://huggingface.co/unsloth/Inkling-2-Mini-unsloth-bnb-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Mirror de Unsloth del modelo base: https://huggingface.co/unsloth/Inkling-2-Mini
- Guía de Unsloth para Inkling 2 Mini: https://unsloth.ai/docs/inkling-2-mini
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Documentación de SGLang: https://docs.sglang.ai/
- Política de uso aceptable del modelo: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Unsloth: https://unsloth.ai/
- Documentación de Unsloth: https://unsloth.ai/docs
- Unsloth en PyPI: https://pypi.org/project/unsloth/

# Xylolabs/Inkling-2-Mini-GGUF

## Resumen

Inkling 2 Mini es un modelo multimodal de propósito general desarrollado por Thinking Machines Lab, publicado el 20 de noviembre de 2026 con pesos abiertos bajo licencia Apache 2.0. Acepta entradas de texto e imagen y genera texto, y está diseñado para aplicaciones de tipo agéntico, asistentes de código, chatbots y sistemas de generación aumentada por recuperación (RAG). La versión aquí documentada es la cuantización GGUF realizada por Xylolabs, pensada para ejecución local con llama.cpp sobre CUDA, Metal o CPU.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.070.390.272 parámetros totales, según los metadatos de safetensors. Se distribuye originalmente como un checkpoint de aproximadamente 20 GB en precisiones mixtas NVFP4 y MXFP8, lo que permite su ejecución en hardware de consumo razonablemente potente: una NVIDIA DGX Spark, equipos Apple Silicon con 32 GB o más de memoria unificada, o GPUs con 32 GB o más de VRAM. Es relevante ahora porque combina capacidades multimodales y de tool use en un tamaño que cabe en estaciones de trabajo locales, algo poco habitual en modelos de esta categoría.

La versión de Xylolabs incluye la torre de visión en archivos `mmproj` separados y excluye el drafter MTP (`mtp.safetensors`) del modelo original. El repositorio ocupa 41,5 GB e incluye dos variantes de cuantización: NVFP4 con el resto en BF16 (22,92 GB) y NVFP4 con el resto en Q8_0 (17,63 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE) |
| Parametros totales | 26.070.390.272 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 32768`) |
| Tipos de cuantizacion | NVFP4 (expertos) + BF16; NVFP4 (expertos) + Q8_0; torre de visión en BF16 o Q8_0 |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (llama.cpp); el modelo base usa safetensors en NVFP4/MXFP8 |

## Arquitectura y entrenamiento

Inkling 2 Mini es un modelo multimodal de arquitectura transformer con capas de mezcla de expertos (MoE), según las etiquetas del repositorio y la información del modelo base. Procesa texto e imágenes: la torre de visión se distribuye por separado en los archivos `mmproj`, lo que permite cargarla de forma independiente del tronco del modelo en llama.cpp. El checkpoint original se distribuye en precisiones mixtas NVFP4 y MXFP8, una elección que reduce el peso a unos 20 GB manteniendo los expertos en formato de baja precisión.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original menciona que el modelo está pensado para instrucciones, conversación y tareas visuales, y que puede post-entrenarse con la plataforma Miles y con Tinker. Tampoco se detalla si incorpora innovaciones como decodificación especulativa en el checkpoint distribuido; de hecho, el drafter MTP del modelo original se ha excluido explícitamente de esta conversión GGUF.

## Capacidades

- Generación de texto y razonamiento general a partir de entradas de texto.
- Comprensión de imágenes y respuesta en texto (pipeline `image-text-to-text`).
- Soporte de tool calling y function calling, orientado a sistemas agénticos.
- Razonamiento multi-paso y uso en pipelines de agentes.
- Asistencia de código en múltiples lenguajes de programación.
- Conversación multi-turno e instrucciones de propósito general.
- Soporte multilingüe general, con inglés como idioma principal.
- Integración con RAG y sistemas de recuperación aumentada.
- No se documenta modo de razonamiento explícito (thinking mode), audio ni otras modalidades adicionales.

## Casos de uso

- Asistentes de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletar, revisar y explicar código en varios lenguajes, ejecutándose en una estación de trabajo con GPU de 32 GB o en Apple Silicon con 32 GB de memoria unificada.
- Atención al cliente automatizada: admite conversaciones multi-turno e instrucciones, y su naturaleza multimodal permite adjuntar capturas o imágenes en el flujo de soporte; el contexto de trabajo recomendado en el ejemplo de llama.cpp es de 32.768 tokens.
- Sistemas agénticos con tool calling: al soportar function calling, puede orquestar llamadas a APIs, consultas a bases de datos y acciones multi-paso en un agente autónomo ejecutado en infraestructura propia.
- RAG sobre documentación técnica: combinado con un índice vectorial, puede responder preguntas sobre manuales y bases de conocimiento internas, incluyendo páginas escaneadas o diagramas gracias a la torre de visión.
- Procesamiento de documentos con imágenes: extracción y descripción de información de capturas, gráficos o formularios, útil en digitalización de archivos y moderación de contenido visual.
- Prototipado e investigación con fine-tuning: al ser Apache 2.0 y estar disponible en Tinker y Miles, sirve como base para experimentos de post-entrenamiento y ajuste a dominios concretos sin coste de licencia.
- Despliegue en el borde o en local: la variante NVFP4+Q8_0 de 17,63 GB permite inferencia en una DGX Spark o en un Mac con 32 GB, útil para entornos con requisitos de privacidad que impiden enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB o más recomendados por el autor del modelo base; la variante NVFP4+Q8_0 ocupa 17,63 GB en disco y la NVFP4+BF16 22,92 GB, a lo que hay que sumar el `mmproj` (345,91 MB en Q8_0 o 641,81 MB en BF16) y el espacio de caché KV para el contexto.
- GPU recomendadas: NVIDIA DGX Spark (soporte oficial), GPUs con 32 GB o más de VRAM; el ejemplo de llama.cpp compila con `-DGGML_CUDA=ON` para NVIDIA.
- Apple Silicon: MacBooks, Mac minis y Mac Studios con 32 GB o más de memoria unificada, con soporte vía Metal, Ollama y Exo Labs.
- Cabe en GPU de consumo: sí, en tarjetas con 24-32 GB de VRAM (por ejemplo, RTX 3090/4090 de 24 GB con cuantización Q8_0 y contexto moderado), aunque el autor recomienda 32 GB o más.
- Opciones de despliegue: llama.cpp (commit `29b52d39` o posterior, PR #32694), vLLM, SGLang, TokenSpeed, NVIDIA Dynamo, Unsloth, Ollama, Exo Labs, Llama App, Hugging Face y la plataforma Tinker.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini (esta ficha) | 26,07 B (MoE) | no disponible | Texto + imagen | Apache 2.0 | Pesos abiertos en HF, GGUF, Tinker |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos de la misma categoría en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgos derivados de los datos de entrenamiento, no especificados.
- Idiomas: el soporte principal es el inglés, con soporte multilingüe general sin garantías de calidad por idioma.
- Longitud de contexto: no se publica el máximo oficial; el ejemplo de la model card usa 32.768 tokens, pero no debe asumirse como límite definitivo.
- Licencia: Apache 2.0 permite uso comercial, pero el uso está sujeto a la Model Acceptable Use Policy de Thinking Machines, que puede imponer restricciones adicionales.
- La conversión GGUF excluye el drafter MTP, por lo que no se dispone de decodificación especulativa en esta variante.
- Xylolabs no está afiliada ni respaldada por Thinking Machines Lab; la calidad de la cuantización es responsabilidad del conversor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la conversión.
- Para producción, conviene validar la variante de cuantización (NVFP4+BF16 frente a NVFP4+Q8_0) según el hardware y el impacto en calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Inkling-2-Mini-GGUF/blob/main/LICENSE
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Paquete tml-renderers: https://pypi.org/project/tml-renderers/
- Blog de Hugging Face sobre Inkling 2 Mini: https://hf.co/blog/inkling2mini
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles (post-entrenamiento): https://miles.radixark.com/docs/models/thinkingmachines/inkl
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/29b52d398b294509746ec0a3f28948a3107c0213
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq

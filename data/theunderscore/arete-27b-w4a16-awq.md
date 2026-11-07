# TheUnderscore/Arete-27B-W4A16-AWQ

## Resumen

Arete-27B-W4A16-AWQ es una cuantizacion de 4 bits (W4A16, pesos en int4 y activaciones en BF16) del modelo NousResearch/Arete-27B, publicada por el usuario TheUnderscore. El modelo base es un post-entrenamiento de Qwen3.8-27B realizado por NousResearch con el objetivo declarado de reforzar valores occidentales sobre un modelo de origen chino, y evaluado con un conjunto de 803 prompts en siete categorias de valores. Esta version cuantizada reduce el peso del repositorio de 54,7 GB a 18,7 GB, manteniendo la licencia Apache-2.0 del finetune.

El modelo conserva la modalidad image-text-to-text del original (pipeline declarado en Hugging Face), lo que implica que integra un componente visual ademas del lenguaje. La cuantizacion se ha generado con llmcompressor en modo `oneshot` con `AWQModifier`, aplicando int4 asimetrico con grupo de 128 a las capas de MLP y atencion, y dejando en BF16 las proyecciones `in_proj_a/b`, `lm_head`, `embed_tokens`, el modulo visual, el MTP y las normas.

Su relevancia practica es doble: por un lado, permite desplegar un modelo de 27B en hardware mas modesto (18,7 GB de pesos, apto para una GPU de 24 GB en inferencia con contexto limitado); por otro, es una de las primeras cuantizaciones publicas de Arete-27B, lo que la convierte en referencia para quien quiera evaluar el modelo sin disponer de los 54,7 GB del original. El soporte esta declarado para vLLM con kernels compressed-tensors, y el autor indica haberlo probado con 1Cat-vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, con atencion hibrida y modulo MTP; detalles completos no disponibles) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de uso fija `max_model_len=8192` |
| Tipos de cuantizacion | W4A16 AWQ: int4 asimetrico con grupo 128 en MLP y atencion; BF16 en `in_proj_a/b`, `lm_head`, `embed_tokens`, visual, mtp y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (repo de 18,7 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su pertenencia a la familia Qwen3.8-27B y de las referencias en la model card a atencion hibrida (`in_proj_qkv/z`, `out_proj`, `in_proj_a/b`) y a un modulo MTP (multi-token prediction). El proceso de cuantizacion si esta documentado con precision: se uso `llmcompressor` en modo `oneshot` con offloading a CPU y `AWQModifier`, con mapeos especificos para atencion hibrida y descarte de las reglas de `linear_attn`. Las capas de MLP y atencion (`q/k/v/o`, `in_proj_qkv/z`, `out_proj`) se cuantizaron a W4A16_ASYM int4 con grupo de 128, mientras que `in_proj_a/b`, `lm_head`, `embed_tokens`, el modulo visual, el MTP y las normas se mantuvieron en BF16.

Sobre el entrenamiento del modelo base, la informacion disponible solo indica que NousResearch aplico un post-entrenamiento sobre Qwen3.8-27B para reforzar valores occidentales y que lo evaluo con 803 prompts en siete categorias de valores. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales mas alla de las propias de la familia Qwen3.8.

## Capacidades

- Generacion de texto conversacional multi-turno, con parametros de muestreo recomendados por el autor del modelo base (temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1.0).
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base y con el modulo visual preservado en BF16 tras la cuantizacion.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3.8-27B, aunque no se aportan evaluaciones especificas en la informacion disponible.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion proporcionada; debe verificarse contra la model card del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.
- Modo thinking o razonamiento extendido: no confirmado en la informacion disponible.
- Prediccion multi-token (MTP) presente en la arquitectura, conservada en BF16.

## Casos de uso

- Despliegue de un modelo de 27B en una sola GPU de 24 GB: con 18,7 GB de pesos en int4, cabe en tarjetas como RTX 4090 o L40S con contexto moderado, lo que permite prototipar sin recurrir a los 54,7 GB del modelo original.
- Evaluacion comparativa de Arete-27B frente a su version completa: al ser una cuantizacion oficialmente documentada, sirve para medir la degradacion introducida por W4A16 en tareas de razonamiento y generacion antes de comprometerse con el modelo a plena precision.
- Asistentes conversacionales con entrada de imagen: el pipeline image-text-to-text permite construir interfaces que reciben capturas, diagramas o documentos escaneados y devuelven explicaciones en lenguaje natural.
- Servicio de inferencia con vLLM en produccion: el autor documenta compatibilidad con compressed-tensors y un ejemplo con `tensor_parallel_size=2`, adecuado para desplegar en dos GPUs con paralelismo de tensor.
- Investigacion sobre alineamiento de valores: el modelo base fue post-entrenado para reforzar valores occidentales y evaluado con 803 prompts en siete categorias; esta version permite reproducir esos analisis con menos recursos de computo.
- Fine-tuning ligero posterior (LoRA/QLoRA) sobre la base cuantizada: el formato compressed-tensors y el tamaño reducido facilitan iterar sobre tareas de nicho sin infraestructura de gran escala.
- Procesamiento de documentos con componente visual en pipelines internos: extraccion y resumen de informacion a partir de imagenes combinadas con instrucciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput, y la busqueda web solo referencia la evaluacion de valores del modelo base (803 prompts, siete categorias) sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,7 GB solo para pesos; con cache KV y overhead de runtime, el consumo real supera los 20 GB, por lo que una GPU de 24 GB requiere contexto reducido.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegues con contexto amplio; RTX 4090 (24 GB) para inferencia con `max_model_len` limitado.
- Cabe en GPU de consumo: si, en RTX 4090 o RTX 3090 de 24 GB, con contexto moderado y sin margen para batches grandes. En GPUs de 16 GB no cabe sin cuantizacion adicional.
- Opciones de despliegue: vLLM con soporte compressed-tensors (el autor cita 1Cat-vLLM con kernels SM70 como entorno probado); llama.cpp y Ollama no estan confirmados para este formato en la informacion disponible.
- Paralelismo: el ejemplo del autor usa `tensor_parallel_size=2`, lo que permite repartir el modelo entre dos GPUs.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-W4A16-AWQ (este) | 27,36 B | no disponible (ejemplo con 8192) | W4A16 AWQ int4, 18,7 GB | Apache-2.0 | Hugging Face, 0 descargas |
| NousResearch/Arete-27B | 27 B | no disponible | BF16, 54,7 GB | Apache-2.0 | Hugging Face |
| Qwen3.8-27B | 27 B | no disponible | BF16 | no disponible en la informacion | Hugging Face (referenciado como origen) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W4A16 introduce degradacion respecto al modelo en BF16; no se han publicado mediciones de esa perdida en la informacion disponible.
- El modelo base fue post-entrenado por NousResearch para reforzar valores occidentales, lo que puede introducir sesgos direccionales en respuestas sobre temas politicos, culturales o sociales. No se documentan evaluaciones de sesgo mas alla de la citada de siete categorias.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamaño; no se aportan datos especificos de tasas de alucinacion.
- No se declara la lista de idiomas soportados, por lo que el rendimiento fuera del ingles y el chino (idiomas habituales de la familia Qwen) debe validarse empiricamente.
- La longitud de contexto no esta documentada en esta ficha; el ejemplo de uso fija 8192 tokens, valor que no debe asumirse como maximo del modelo.
- El soporte esta probado con una implementacion concreta (1Cat-vLLM con kernels SM70); otras versiones de vLLM pueden requerir configuracion adicional para compressed-tensors.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre esta cuantizacion.
- La licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base y de Qwen3.8-27B deben verificarse por separado antes de un despliegue en produccion.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/TheUnderscore/Arete-27B-W4A16-AWQ
- Modelo base NousResearch/Arete-27B: https://huggingface.co/NousResearch/Arete-27B
- Anuncio de Arete-27B en Nous Research: https://nousresearch.com/arete
- Referencia a Qwen3.8-27B citada en la model card: https://huggingface.co/Qwen/Qwen3.8-27B

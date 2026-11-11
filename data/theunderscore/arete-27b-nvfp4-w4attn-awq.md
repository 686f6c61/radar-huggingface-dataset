# TheUnderscore/Arete-27B-NVFP4-W4ATTN-AWQ

## Resumen

Arete-27B-NVFP4-W4ATTN-AWQ es una cuantización de precisión mixta del modelo NousResearch/Arete-27B, publicada por el usuario TheUnderscore. No se trata de un modelo entrenado desde cero, sino de una versión comprimida del finetune de NousResearch que reduce el peso en disco de 54,7 GB a 19,5 GB, manteniendo capas críticas en BF16 y aplicando esquemas de 4 bits distintos según el tipo de capa. El modelo base pertenece a la familia Qwen (etiquetado internamente como qwen3_5 y qwen3_8) y tiene una pipeline declarada de image-text-to-text, lo que indica capacidades multimodales de entrada.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de 27B con capacidades de visión en hardware más modesto, usando kernels Marlin/TurboMind para SM70 a través de 1Cat-vLLM. Al emplear `compressed-tensors` con dos `config_groups` simultáneos (int4 W4A16 y NVFP4 float4), el autor demuestra una técnica de cuantización por capas que combina dos esquemas en un mismo checkpoint, algo poco habitual en publicaciones de la comunidad.

La información disponible es limitada: no se detallan volúmenes de entrenamiento, composición del dataset ni resultados de benchmarks. La model card remite al modelo base para instrucciones de prompting y parámetros de muestreo. La licencia es Apache-2.0, heredada del finetune original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal (derivada de Qwen; etiquetas qwen3_5/qwen3_8), multimodal image-text-to-text |
| Parametros totales | 27B (según nomenclatura del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card (el ejemplo de uso configura `max_model_len=8192`) |
| Tipos de cuantizacion | NVFP4 (float4, grupo 16) en MLP; W4A16_ASYM (int4, grupo 128) en atención; BF16 en in_proj_a/b, lm_head, embed_tokens, visual y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `quant_method: compressed-tensors` (dos `config_groups`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen con atención híbrida: la model card menciona mapeos de "hybrid-attention" y reglas de `linear_attn`, lo que sugiere una combinación de atención estándar y atención lineal en distintas capas. Incluye un torre visual (`visual`) y proyecciones `in_proj_qkv/z`, `in_proj_a/b` y `out_proj`, coherentes con un modelo multimodal con mecanismo de atención lineal tipo Mamba/Gated DeltaNet. El checkpoint cuantizado conserva en BF16 las proyecciones `in_proj_a/b`, los embeddings, el `lm_head`, la torre visual y las normas.

El proceso de cuantización se realizó con `llmcompressor` en modo `oneshot`, usando `config_groups` para despachar por capa y el `AWQModifier` con mapeos específicos para atención híbrida (descartando reglas de atención lineal). El script `quantize-nvfp4-hybrid-fp16.py` opera con CPU offload y DDP vía torchrun, e incluye una comprobación previa de cobertura de capas. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional, con parámetros de muestreo recomendados por el autor del base (temperature 1.0, top_p 0.95, top_k 20).
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), con torre visual preservada en BF16.
- Razonamiento y generación de código: capacidades típicas de la familia Qwen, aunque no verificadas en la información disponible.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue de un modelo multimodal de 27B en servidores con 2 GPU de gama media: gracias a la reducción a 19,5 GB, puede servirse con `tensor_parallel_size=2` en GPUs con 16-24 GB cada una, algo inviable con el checkpoint original de 54,7 GB.
- Asistentes conversacionales con entrada de imágenes: la torre visual en BF16 permite tareas de descripción, extracción de información de capturas o documentos escaneados, manteniendo precisión en la parte visual.
- Prototipado e investigación en cuantización: el checkpoint sirve como referencia de cuantización mixta con dos `config_groups` (NVFP4 + W4A16), útil para estudiar el impacto de esquemas por capa en calidad y latencia.
- Evaluación de kernels Marlin/TurboMind en SM70: el autor valida el modelo con 1Cat-vLLM, por lo que es un caso práctico para probar el rendimiento de estos kernels en GPUs Volta y posteriores.
- Generación de código asistida en entornos con VRAM limitada: si el modelo base conserva las capacidades de código de Qwen, la versión cuantizada permite integrarlo en pipelines de CI/CD con menos recursos.
- Fine-tuning ligero o adaptación posterior: al estar en `compressed-tensors` y Apache-2.0, puede servir de base para experimentos de destilación o adaptación con LoRA, aunque requeriría descuantizar o usar herramientas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 19,5 GB en disco; en inferencia se recomienda al menos 24 GB de VRAM para una sola GPU, o 2 GPU con 16 GB cada una usando `tensor_parallel_size=2` como en el ejemplo del autor.
- GPU recomendadas: el autor menciona kernels SM70 (Volta, V100) para Marlin/TurboMind; también serían compatibles GPUs Ampere (A100, RTX 3090) y Ada/Hopper (RTX 4090, H100) con 1Cat-vLLM.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con cuantización de 4 bits, aunque el contexto máximo práctico dependerá de la memoria restante para KV cache.
- Opciones de despliegue: vLLM (variante 1Cat-vLLM con soporte de `compressed-tensors` y kernels SM70); no se confirma soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-NVFP4-W4ATTN-AWQ | 27B | no disponible | NVFP4 + W4A16 mixta | Apache-2.0 | Hugging Face (TheUnderscore) |
| NousResearch/Arete-27B (base) | 27B | no disponible | BF16 | Apache-2.0 | Hugging Face (NousResearch) |
| Qwen3-VL (familia) | variable | no disponible | múltiples | Apache-2.0 (según variante) | Hugging Face (Qwen) |

La comparación con modelos de la misma categoría (27B multimodal) no puede completarse con datos verificados en la información proporcionada; los datos de rendimiento del base y de alternativas no están disponibles.

## Limitaciones y advertencias

- La cuantización mixta puede degradar la calidad respecto al modelo base en tareas sensibles a precisión (matemáticas, código, razonamiento largo); no se han publicado evaluaciones comparativas.
- El checkpoint depende de kernels específicos (1Cat-vLLM, SM70); no es un GGUF estándar y puede no cargar en otras herramientas sin soporte de `compressed-tensors` con dos `config_groups`.
- No se documentan sesgos del modelo base ni del finetune; al ser un finetune de NousResearch sobre Qwen, hereda los sesgos de los datos originales, no disponibles.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- El contexto máximo no está especificado; el ejemplo usa 8192 tokens, pero podría ser mayor o menor.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.
- La fecha de creación (2026-11-10) y la referencia a "Qwen3.8-27B" en la model card son inconsistentes con el ecosistema actual; conviene verificar la procedencia del base antes de usarlo en producción.

## Enlaces

- [Hugging Face: TheUnderscore/Arete-27B-NVFP4-W4ATTN-AWQ](https://huggingface.co/TheUnderscore/Arete-27B-NVFP4-W4ATTN-AWQ)
- [Modelo base: NousResearch/Arete-27B](https://huggingface.co/NousResearch/Arete-27B)
- [Referencia citada en la model card: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [llmcompressor (herramienta de cuantización)](https://github.com/vllm-project/llmcompressor)
- [vLLM](https://github.com/vllm-project/vllm)

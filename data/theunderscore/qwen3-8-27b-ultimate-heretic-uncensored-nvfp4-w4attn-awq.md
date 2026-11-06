# TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-W4ATTN-AWQ

## Resumen

Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-W4ATTN-AWQ es una cuantización mixta del finetune comunitario DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, publicado por el usuario TheUnderscore. No se trata de un modelo entrenado desde cero, sino de una compresión agresiva del checkpoint original (55,6 GB a 20,3 GB) que combina dos esquemas de cuantización distintos dentro del mismo grafo para preservar al máximo la calidad del finetune.

El modelo parte de la familia Qwen3.8 (tag `qwen3_5` en el repo, arquitectura híbrida con atención lineal y MTP), con 27.781.427.952 parámetros totales en safetensors. El pipeline declarado es `image-text-to-text`, lo que indica que conserva la torre visual en BF16, aunque la model card no detalla las capacidades de visión.

Su relevancia es práctica: demuestra una estrategia de cuantización por capas (NVFP4 para MLP, W4A16 asimétrico para atención, BF16 para embeddings, lm_head, proyecciones de estado y torre visual) que permite servir un modelo de ~27B en dos GPUs consumer con vLLM, manteniendo el tooling de `compressed-tensors` y soporte de agentes y código del finetune original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrida Qwen3.8 (tag `qwen3_5`) con atención lineal, MTP (multi-token prediction) y torre visual; cuantización mixta por capas |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible en la ficha; el ejemplo de uso configura `max_model_len=8192` |
| Tipos de cuantizacion | NVFP4 (float4, grupo 16) en MLP gate/up/down; W4A16_ASYM (int4, grupo 128) en q/k/v/o, in_proj_qkv/z y out_proj; BF16 en in_proj_a/b, lm_head, embed_tokens, visual, mtp y norms |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con `quant_method: compressed-tensors` (dos `config_groups`: W4A16 int4 + NVFP4 float4) + `model-nonquant.safetensors` con tensores BF16 |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento. Se genera con `llmcompressor` en modo `oneshot` usando `config_groups` para despacho por capa y un `AWQModifier` con mapeos específicos para la atención híbrida (se descartan reglas de `linear_attn`). La decisión de diseño central es asignar formatos según la varianza intra-grupo: NVFP4 con grupo 16 en las capas MLP (mayor varianza, necesita resolución de escala fina) y W4A16 asimétrico con grupo 128 en atención (menor varianza, con suavizado AWQ que rebalancea las escalas por canal).

Las capas `in_proj_a` e `in_proj_b` se mantienen en BF16 porque su ancho de 48 en el gating de regla delta rompe la recurrencia si se cuantizan a int4. Del mismo modo, `lm_head` y `embed_tokens` quedan en BF16 porque los embeddings de salida dominan la perplejidad, y `visual`, `mtp` y las norms se preservan por indivisibilidad de grupo o por tamaño reducido. El resultado son dos `config_groups` cargables por 1Cat-vLLM mediante kernels SM70 Marlin/TurboMind para ambos esquemas. No hay información sobre el dataset de entrenamiento del finetune base ni sobre si hubo RLHF/DPO.

## Capacidades

- Generación de texto y conversación multiturno, heredadas del finetune base.
- Razonamiento y generación de código, con etiquetas explícitas `coding-agent` y `agentic` en el repo.
- Soporte de tool calling / function calling (declarado en las etiquetas del modelo base).
- Capacidades de agente y razonamiento multi-paso (tag `agentic`).
- Procesamiento image-text-to-text según `pipeline_tag`; la torre visual se conserva en BF16.
- Modo "uncensored" del finetune (sin filtros de rechazo reforzados), según el nombre del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo conserva tool calling y el tag `coding-agent`, por lo que puede integrarse en editores (Continue, Cline) apuntando a un servidor vLLM con `tensor_parallel_size=2` para autocompletado, refactorización y generación de tests.
- Agentes autónomos de múltiples pasos: el tag `agentic` y el soporte de function calling permiten encadenar llamadas a herramientas en frameworks como LangGraph o CrewAI, con contexto configurable vía `max_model_len`.
- Atención al cliente sin censura editorial: el finetune "Heretic" elimina rechazos en temas sensibles, útil para dominios legales, médicos o de seguridad donde los filtros estándar interrumpen la conversación.
- Procesamiento de documentos con componente visual: al mantener la torre visual en BF16, puede usarse en pipelines image-text-to-text para extracción de información de capturas, formularios o gráficos.
- Generación de contenido creativo sin restricciones: narrativa, guiones o roleplay donde los modelos alineados suelen negarse; el finetune base está orientado a este uso.
- Despliegue en hardware limitado: con 20,3 GB de pesos y cuantización W4A16/NVFP4, se puede servir en 2×RTX 4090 (48 GB) o 2×A6000, algo inviable con el checkpoint original de 55,6 GB.
- Investigación sobre cuantización: el repo incluye `quantize-nvfp4-hybrid-fp16.py` como referencia reproducible de cuantización mixta con llmcompressor para arquitecturas híbridas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo declara la reducción de tamaño (55,6 GB a 20,3 GB) sin métricas de perplejidad ni evaluaciones downstream.

## Requisitos de hardware

- VRAM estimada: ~20,3 GB solo para pesos; con caché KV y overhead de vLLM, entre 24 y 32 GB para contexto moderado.
- GPU recomendadas: 2×RTX 4090 (48 GB), 2×A6000, A100 40/80 GB, H100; el ejemplo oficial usa `tensor_parallel_size=2` con `CUDA_VISIBLE_DEVICES=1,2`.
- Consumer GPU: no cabe en una sola GPU de 24 GB por los pesos y el margen de activaciones; sí en dos RTX 4090 o dos RTX 3090 con tensor parallelism.
- Despliegue: vLLM (1Cat-vLLM con kernels SM70 Marlin/TurboMind para `compressed-tensors`); transformers para carga directa; llama.cpp/Ollama no soportan de forma nativa el formato mixto NVFP4+W4A16 de este repo.
- Latencia y throughput: no disponibles; dependen del backend y del número de GPUs.
- Compatibilidad: los kernels SM70 (Volta) permiten ejecución en GPUs antiguas, aunque el rendimiento óptimo se obtiene en Ampere o superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| TheUnderscore/Qwen3.8-27B-...-NVFP4-W4ATTN-AWQ | 27,78B | no disponible | Mixta NVFP4 + W4A16 + BF16 | Apache-2.0 | 20,3 GB, requiere vLLM con compressed-tensors |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (base) | ~27,8B | no disponible | BF16 | Apache-2.0 | 55,6 GB, calidad de referencia |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | ~27,8B | no disponible | GGUF (varias) | Apache-2.0 | Compatible con llama.cpp y Ollama |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, peligroso o ilegal; requiere moderación externa en producción.
- Riesgo de alucinación no evaluado: no hay benchmarks publicados que midan factualidad ni perplejidad de esta cuantización frente al BF16 original.
- La cuantización introduce pérdida de calidad no cuantificada en la ficha; conviene validar con eval propia antes de desplegar.
- Requiere backend específico (1Cat-vLLM con kernels SM70); no es portable a llama.cpp, Ollama ni TGI sin reconversión.
- El contexto real soportado no se documenta; el ejemplo limita a 8192 tokens aunque el modelo base podría soportar más.
- Idiomas soportados no declarados; el rendimiento fuera de inglés y chino no está verificado.
- Uso comercial permitido por Apache-2.0, pero la responsabilidad sobre el contenido generado recae en el desplegador.
- Repo con 0 descargas y 0 likes en el momento de la consulta: validación comunitaria prácticamente nula.
- El tag `qwen3_5` frente al nombre "Qwen3.8" puede generar confusión sobre la arquitectura exacta; verificar compatibilidad con la versión de transformers/vLLM instalada.

## Enlaces

- Hugging Face: https://huggingface.co/TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-NVFP4-W4ATTN-AWQ
- Modelo base (finetune): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Variante GGUF con instrucciones de prompting: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo original Qwen (referenciado en la card): https://huggingface.co/Qwen/Qwen3.8-27B
- llmcompressor (herramienta de cuantización): no disponible enlace directo en la información proporcionada
- 1Cat-vLLM (backend recomendado): no disponible enlace directo en la información proporcionada

# TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ

## Resumen

TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ es una cuantizacion W4A16-AWQ del finetune comunitario DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored, que a su vez deriva de la familia Qwen3.8 de Qwen (Alibaba). El modelo resuelve el problema de desplegar un modelo multimodal de 27.781 millones de parametros (55,7 GB en BF16) en infraestructura mas modesta, comprimiendolo a 19,6 GB mediante cuantizacion de pesos INT4 con grupo de 128 y activaciones en BF16.

La arquitectura es la del Qwen3.8 original (tag `qwen3_5`/`qwen3_8`), con atencion hibrida: capas de atencion completa convencional y capas de atencion lineal (`linear_attn`, con proyecciones `in_proj_qkv`/`in_proj_z`), ademas de torre visual (`visual`) y cabecera de prediccion multi-token (`mtp`). El pipeline declarado es `image-text-to-text`, por lo que el modelo acepta entradas de imagen y texto.

Es relevante ahora porque demuestra un flujo de cuantizacion AWQ funcional sobre arquitecturas hibridas con vLLM y `compressed-tensors`, con un script reproducible publicado (`quantize-awq-hybrid.py`). El finetune base esta orientado a uso sin censura ("uncensored"), agentes de codigo y razonamiento agentico, lo que condiciona tanto sus casos de uso como sus riesgos. La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal (Qwen3.8), torre visual y cabecera MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso configura `max_model_len=8192`) |
| Tipos de cuantizacion | W4A16_ASYM INT4 con grupo 128 en MLP y atencion; BF16 en `in_proj_a/b`, `lm_head`, `embed_tokens`, `visual`, `mtp` y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, shards `-of-N`), consumible por vLLM |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. La arquitectura subyacente es la de Qwen3.8-27B: un transformer hibrido que combina capas de atencion completa con capas de atencion lineal, mas una torre visual para entrada de imagen y una cabecera MTP (multi-token prediction). El autor del cuantizado documenta explicitamente las asignaciones de capas: se cuantizan a INT4 las proyecciones de MLP y de atencion (`q/k/v/o`, `in_proj_qkv`/`in_proj_z`, `out_proj`), mientras que `in_proj_a/b`, `lm_head`, `embed_tokens`, `visual`, `mtp` y las normas permanecen en BF16.

El proceso de cuantizacion se realizo con `llmcompressor` en modo `oneshot`, con offloading a CPU y `AWQModifier`, aplicando mapeos especificos para atencion hibrida y descartando las reglas de `linear_attn`. El comando publicado usa dos GPUs (`CUDA_VISIBLE_DEVICES=1,2`). No se dispone de informacion sobre el dataset de calibracion, el numero de tokens de entrenamiento del finetune base ni sobre si hubo RLHF/DPO en el modelo original; esos datos corresponden a DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored y a Qwen3.8-27B, y no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno (`conversational`).
- Entrada multimodal imagen-texto (`image-text-to-text`), gracias a la torre visual conservada en BF16.
- Razonamiento agentico y multi-paso (tags `agentic`, `coding-agent`).
- Generacion y asistencia de codigo.
- Soporte de tool calling / function calling: implicito en el tag `agentic` y en el ecosistema vLLM, aunque no se detalla el formato exacto en la informacion disponible.
- Prediccion multi-token (MTP) como capacidad arquitectonica del modelo base.
- Finetune "uncensored": el autor del modelo base elimina o reduce los rechazos por contenido, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de un modelo de 27,8 B en dos GPUs de 24 GB: con 19,6 GB de pesos en INT4, el modelo cabe en configuraciones de 2x RTX 4090 con tensor parallelism 2, tal como muestra el ejemplo de vLLM del autor. Es el caso de uso principal de esta variante.
- Agente de codigo en pipelines de CI/CD: los tags `coding-agent` y `agentic` indican que el finetune esta orientado a tareas de generacion y edicion de codigo con llamadas a herramientas; puede integrarse como backend de un agente que ejecute tests y parchee repositorios.
- Asistente conversacional de contexto largo: la ventana de contexto de Qwen3.8 (no confirmada en esta ficha) permite conversaciones multi-turno con historial extenso; el ejemplo de uso configura 8192 tokens.
- Procesamiento de documentos con imagenes: al conservar la torre visual en BF16, el modelo puede recibir capturas, diagramas o paginas escaneadas junto con texto, util para extraccion de informacion y resumen de documentacion tecnica.
- Generacion creativa sin restricciones de contenido: el caracter "uncensored" del finetune lo hace adecuado para escritura de ficcion, guiones o contenido adulto controlado, siempre que el operador asuma la responsabilidad editorial.
- Investigacion sobre cuantizacion AWQ en arquitecturas hibridas: el script `quantize-awq-hybrid.py` y la configuracion de capas publicada sirven como referencia reproducible para cuantizar otros modelos con atencion lineal.
- Evaluacion de robustez y seguridad: util para estudiar el comportamiento de modelos sin alineacion estricta en entornos de red teaming controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas equivalentes, ni comparaciones con el modelo en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,6 GB solo para pesos en INT4; sumando KV cache, activaciones y overhead de vLLM, se recomienda un minimo de 24 GB por GPU en configuracion de 2 GPUs.
- GPU recomendadas: el autor probo con `tensor_parallel_size=2` en 2 GPUs; el ejemplo de cuantizacion uso dos dispositivos. Para mayor comodidad, A100 40/80 GB o H100 permiten ejecutar el modelo en una sola GPU con margen amplio.
- Cabe en consumer GPU: si, en 2x RTX 4090 (24 GB cada una) con tensor parallelism 2. Una sola RTX 4090 de 24 GB queda muy justa y probablemente requiera reducir `max_model_len`.
- Opciones de despliegue: vLLM con soporte de `compressed-tensors` (el autor cita 1Cat-vLLM con kernels SM70); transformers como fallback. No se menciona soporte GGUF para esta variante concreta (existe una variante GGUF del modelo base).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TheUnderscore W4A16-AWQ) | 27,78 B | no disponible | INT4 W4A16 grupo 128 | Apache-2.0 | Hugging Face, vLLM |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored (BF16) | 27,78 B | no disponible | BF16 (55,7 GB) | Apache-2.0 | Hugging Face |
| DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF | 27,78 B | no disponible | GGUF (varias) | Apache-2.0 | Hugging Face, llama.cpp |
| Qwen/Qwen3.8-27B (base original) | 27,78 B | no disponible | BF16 | no disponible | Hugging Face |

La comparativa se limita a variantes del mismo modelo porque no se dispone de datos de rendimiento para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- El finetune base es "uncensored": reduce deliberadamente los rechazos de seguridad, por lo que puede generar contenido ofensivo, ilegal o peligroso. No es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un finetune comunitario sin benchmarks, la fiabilidad factual no esta verificada.
- La cuantizacion INT4 introduce perdida de precision respecto al BF16; no se documenta la degradacion medida (perplejidad o benchmarks) frente al modelo original.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingue equilibrado.
- Longitud de contexto no confirmada en esta ficha: el ejemplo de uso limita a 8192 tokens, pero no se especifica el maximo arquitectonico.
- La licencia Apache-2.0 se hereda del finetune, pero el modelo base original Qwen3.8 puede tener terminos adicionales; conviene revisar la licencia de Qwen/Qwen3.8-27B antes de uso comercial.
- Modelo con 0 likes y 183 descargas en el momento de la consulta: ecosistema de validacion muy limitado, sin garantias de mantenimiento.
- Dependencia de kernels y soporte especifico: el autor probo con 1Cat-vLLM y kernels SM70; otras versiones de vLLM pueden requerir ajustes.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/TheUnderscore/Qwen3.8-27B-Ultimate-Heretic-Uncensored-W4A16-AWQ
- Modelo base del cuantizado: https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored
- Variante GGUF del modelo base (instrucciones de prompting): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- llmcompressor: https://github.com/vllm-project/llm-compressor

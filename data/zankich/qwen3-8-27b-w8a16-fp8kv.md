# zankich/Qwen3.8-27B-W8A16-FP8KV

## Resumen

Qwen3.8-27B-W8A16-FP8KV es una cuantización del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario zankich. No es un modelo nuevo ni un fine-tuning: es un checkpoint cuantizado en formato `compressed-tensors` pensado para servir el modelo base en GPUs Ampere con un consumo de VRAM notablemente menor. Concretamente, aplica cuantización INT8 solo a pesos (W8A16) con GPTQ y grupo de 128, mantiene las activaciones en bfloat16 y calibra la caché KV en FP8 E4M3.

El modelo base es un transformer híbrido de 27.781.427.984 parámetros que combina 16 capas de atención completa con 48 capas Gated DeltaNet (atención lineal con estado recurrente), además de una torre de visión y una cabeza MTP (multi-token prediction) para decodificación especulativa. La cuantización reduce el checkpoint de 52 GB en bf16 a 31,6 GB, preservando en bf16 la torre de visión, el `lm_head`, la cabeza MTP y las proyecciones de compuerta recurrente `in_proj_a` e `in_proj_b`.

Su relevancia es práctica: permite desplegar un modelo de 27B con capacidades de visión y decodificación especulativa en hardware Ampere (A100, A10G, RTX 3090/4090) donde un bf16 completo resulta caro o directamente no cabe con contexto largo, manteniendo la licencia Apache 2.0 del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención completa + 48 capas Gated DeltaNet (atención lineal), con torre de visión y cabeza MTP |
| Parámetros totales | 27.781.427.984 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | INT8 weight-only (W8A16) con GPTQ, grupo 128, simétrico; activaciones bf16; KV cache FP8 E4M3 con escalas estáticas por tensor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato `compressed-tensors` (`pack-quantized`), 16 shards más `model_mtp.safetensors` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-27B: un transformer híbrido en el que 16 capas usan atención completa y 48 capas usan Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste de cómputo y memoria en contextos largos. El modelo incorpora además una torre de visión (333 tensores, preservados íntegros en bf16 en esta cuantización) y una cabeza MTP que habilita decodificación especulativa. Las capas GDN no mantienen caché KV; solo las 16 capas de atención completa almacenan los tensores `k_scale` y `v_scale`.

El proceso de cuantización se realizó con llm-compressor 0.13.0 aplicando `GPTQModifier` con esquema W8A16 sobre todas las proyecciones `Linear` (atención y FFN en las capas de atención completa; `in_proj_qkv`, `in_proj_z` y `out_proj` en las capas GDN), excluyendo `lm_head`, la torre de visión, la cabeza MTP y las proyecciones `linear_attn.in_proj_a` e `in_proj_b`, sensibles a la precisión. La calibración de la caché KV se hizo en las mismas pasadas forward que la de los pesos, con 768 muestras (512 por ejecución, longitud máxima 2048) estratificadas para carga de trabajo de agente de código: ~45% turnos de agente y pares de sesión de recuperación, ~30% código a nivel de función en Python, TypeScript, Go y shell, y ~21% prosa estructurada de base de conocimiento en Markdown. El conjunto de calibración es privado y no se publica. No se documenta en la model card información sobre datos de preentrenamiento, RLHF o DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredadas del modelo base.
- Procesamiento de imagen y texto (`image-text-to-text`), ya que la torre de visión se conserva completa en bf16.
- Generación de código, con calibración específicamente orientada a cargas de trabajo de agente de código.
- Decodificación especulativa mediante la cabeza MTP preservada byte a byte respecto al checkpoint base.
- Soporte de modo de pensamiento con control de presupuesto (`thinking.budget_tokens`), reforzado en el fork de vLLM del autor bajo MTP.
- Métricas de decodificación especulativa por petición expuestas a través del conversor `/v1/messages` en el fork de vLLM.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque la calibración con turnos de agente y código estructurado sugiere ese perfil de uso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de agente de código en producción: la calibración con un 45% de turnos de agente y un 30% de código en Python, TypeScript, Go y shell hace que este checkpoint sea adecuado para asistentes que editan repositorios y ejecutan herramientas en pipelines de CI/CD, con menor huella de VRAM que el bf16.
- Despliegue en GPUs Ampere de gama alta: al reducir el checkpoint a 31,6 GB, permite servir un modelo de 27B con visión en A100 40GB o A10G 24GB (con offload parcial) donde el bf16 de 52 GB no cabría con margen para la caché KV.
- Inferencia con contexto largo y caché KV en FP8: la calibración estática de `k_scale` y `v_scale` en las 16 capas de atención completa reduce a la mitad la memoria de caché KV frente a bf16, lo que permite sesiones de recuperación y conversaciones multi-turno más largas en la misma GPU.
- Generación de código asistida con latencia reducida: la cabeza MTP habilita decodificación especulativa, útil en entornos interactivos donde el tiempo hasta el primer token y el throughput de tokens por segundo son críticos.
- Procesamiento de documentación técnica multimodal: la torre de visión intacta permite extraer información de capturas, diagramas y documentos escaneados combinados con prosa de base de conocimiento en Markdown.
- Automatización de atención al cliente con contexto documental: combinando la ventana de contexto del modelo base con la caché KV en FP8, se pueden mantener conversaciones largas con historial de tickets y documentación adjunta sin agotar la VRAM.
- Evaluación interna de modelos cuantizados: sirve como referencia para medir la degradación de precisión frente al bf16 en cargas de código y agentes, aunque el autor no publica deltas de accuracy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se publica ningún delta de accuracy frente al modelo base en bf16 para este checkpoint.

## Requisitos de hardware

- VRAM estimada para pesos: 31,6 GB en el formato cuantizado INT8 publicado (frente a 52 GB en bf16).
- VRAM adicional para caché KV: FP8 E4M3 en las 16 capas de atención completa, aproximadamente la mitad que en bf16; el valor absoluto depende de la longitud de contexto, que no está documentada.
- GPUs recomendadas: A100 40GB y A100 80GB para servicio completo con contexto largo; A10G 24GB y RTX 3090/4090 24GB requieren offload parcial de pesos o contextos reducidos.
- Cabe en GPU de consumo: parcialmente; en RTX 3090/4090 de 24 GB no caben los 31,6 GB de pesos, por lo que se necesita offload a CPU o una GPU de 40 GB o más.
- Opciones de despliegue: vLLM upstream (detección automática del formato `compressed-tensors` desde `config.json`), o el fork `zankich/vllm` con imagen precompilada `zankich/vllm-openai:latest` en Docker Hub, que corrige problemas de corrección en KV-offload con el layout híbrido GDN + MTP.
- Flags de servicio: es necesario arrancar con `--kv-cache-dtype fp8` para que vLLM cargue las escalas calibradas de la caché KV.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-W8A16-FP8KV (este) | 27,78B | no disponible | INT8 W8A16 + KV FP8 | Apache 2.0 | Hugging Face, 88 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (27B multimodales con atención híbrida) en la documentación proporcionada, por lo que la comparación se limita al modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- No se publica ningún delta de accuracy frente al bf16, por lo que la degradación real en tareas distintas de la calibración (código y agentes) es desconocida.
- El conjunto de calibración está sesgado hacia cargas de trabajo de agente de código y prosa Markdown; el rendimiento en otros dominios (legal, médico, conversación general) puede degradarse más de lo esperado.
- El conjunto de calibración es privado y no reproducible, lo que dificulta auditar el proceso.
- La longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- La torre de visión se conserva en bf16, pero no se documenta si la calibración incluyó muestras de imagen; el impacto en tareas visuales es desconocido.
- Riesgo de alucinación: inherente al modelo base; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B por si añade restricciones adicionales.
- El fork de vLLM del autor es necesario para corregir problemas de KV-offload y control de presupuesto de pensamiento bajo MTP; el vLLM upstream puede presentar esos fallos.
- El número de descargas (88) y likes (1) es bajo, lo que indica poca validación comunitaria del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zankich/Qwen3.8-27B-W8A16-FP8KV
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de vLLM del autor: https://github.com/zankich/vllm
- Imagen Docker del fork: https://hub.docker.com/r/zankich/vllm-openai/tags
- llm-compressor: https://github.com/vllm-project/llm-compressor

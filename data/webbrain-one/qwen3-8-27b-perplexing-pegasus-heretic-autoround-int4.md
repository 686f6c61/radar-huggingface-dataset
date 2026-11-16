# webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4

## Resumen

Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4 es una cuantización W4A16 INT4 simétrica (herramienta AutoRound, formato `auto_gptq`) del modelo `webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic`, una variante "abliterated" (sin censura, técnica Heretic/ARA) construida sobre `AveLabs/Qwen3.8-27B-Perplexing-Pegasus`. Ese modelo base, a su vez, fusiona las decisiones tipadas de `perplexity-ai/pplx-decider-v1-27b` con las capacidades conversacionales, de razonamiento (`<think>`), visión multimodal, tool calling y Multi-Token Prediction (MTP) de `Qwen/Qwen3.8-27B`.

El objetivo de esta release es ofrecer un checkpoint que quepa en GPUs de 24-32 GB (Intel Arc Pro B70 de 32 GB XPU o NVIDIA CUDA con kernels GPTQ/Marlin) sin degradar los componentes numéricamente frágiles: el `lm_head` se mantiene en BF16 para preservar las probabilidades del readout de decisiones tipadas, el módulo `model.visual.*` se mantiene en BF16 para conservar la capacidad multimodal completa, las proyecciones `linear_attn.in_proj_a` e `in_proj_b` se mantienen en FP de 16 bits por estabilidad del híbrido GatedDeltaNet, y los 15 tensores `mtp.*` junto con la carpeta `decision/` se conservan íntegros.

Es relevante ahora porque combina en un único artefacto de 18,21 GB tres cosas poco habituales juntas: cuantización INT4 lista para vLLM, capacidades multimodales imagen-texto, y un mecanismo de decisión tipada por logprobs de un solo token heredado de pplx-decider. El autor reporta 0/8 rechazos en sondas de refusal y un 100 % de acuerdo en decisiones tipadas frente al Pegasus original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal GatedDeltaNet (tag `qwen3_5`), multimodal (image-text-to-text) y Multi-Token Prediction (MTP) |
| Parametros totales | 6.284.446.960 (según safetensors del repo); la nomenclatura del nombre indica 27B en el modelo base, dato no verificado en esta release |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en el ejemplo de despliegue para Intel Arc Pro B70; 131.072 tokens en el ejemplo para NVIDIA CUDA (según la model card) |
| Tipos de cuantizacion | W4A16 INT4 simétrica (`bits=4`, `group_size=128`, `sym=True`, `packing_format: auto_round:auto_gptq`); componentes selectos en BF16/FP16 (lm_head, visual, linear_attn.in_proj_a/b, mtp.*) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (18,21 GB en el repo; 19,6 GB de tamaño total del repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con atención híbrida: combina capas de atención estándar con capas de atención lineal GatedDeltaNet (de ahí el tag `qwen3_5` y la necesidad de mantener `linear_attn.in_proj_a` e `in_proj_b` en 16 bits por estabilidad numérica). Incorpora un módulo visual (`model.visual.*`) para entrada imagen-texto y 15 tensores `mtp.*` correspondientes a Multi-Token Prediction, una técnica de decodificación especulativa integrada que acelera la generación. Sobre esta base, el linaje del modelo añade el readout de decisiones tipadas de `perplexity-ai/pplx-decider-v1-27b`, que expone decisiones estructuradas como logprobs de un único token sobre un conjunto de códigos definido en `decision/decision_config.json`.

El proceso de cuantización emplea AutoRound con SignRound (`iters=250`, `nsamples=512`, `seqlen=2048`), calibrando en W4A16 simétrico con grupo de 128. La variante "Heretic" aplica la técnica ARA (abliteration) para eliminar el comportamiento de rechazo: la model card reporta para el checkpoint BF16 de origen una divergencia KL de 0,0618 en Heretic Trial 7 y una reducción de rechazos del clasificador de 102/104 a 6/104. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Modo de razonamiento explícito mediante etiquetas `<think>` (thinking mode), desactivable con `enable_thinking=False`.
- Comprensión multimodal imagen-texto (pipeline `image-text-to-text`), con el módulo visual preservado en BF16.
- Tool calling / function calling, con parser `qwen3_coder` y soporte de `--enable-auto-tool-choice` en vLLM.
- Decisiones tipadas estructuradas: lectura de logprobs de un solo token sobre códigos predefinidos (`decision/decision_config.json` y `readout.safetensors`), con temperatura configurable.
- Multi-Token Prediction (MTP) para decodificación especulativa, con los 15 tensores `mtp.*` en BF16.
- Comportamiento sin censura (abliterated/Heretic): 0/8 rechazos en sondas de refusal según la verificación del autor.
- Capacidades multilingües limitadas al inglés según el campo `language: en`.

## Casos de uso

- Clasificación y enrutamiento con decisiones tipadas: usar el readout de `pplx-decider` para obtener una distribución de probabilidad sobre códigos discretos (por ejemplo, aceptar/rechazar/escalar) en un solo paso de decodificación, sin generar texto libre, lo que reduce latencia y hace la decisión auditable.
- Moderación y evaluación de contenido sin rechazos espurios: al estar abliterated, el modelo evalúa solicitudes delicadas sin negarse a procesarlas, útil en pipelines internos de análisis de contenido donde el rechazo del modelo rompería el flujo.
- Asistentes con visión en el borde: el módulo visual en BF16 permite describir, extraer datos o responder preguntas sobre imágenes en despliegues con una sola GPU de 24-32 GB, sin depender de un servicio externo de visión.
- Agentes con tool calling: integración en vLLM con `--enable-auto-tool-choice` y parser `qwen3_coder` para orquestar llamadas a APIs en flujos multi-paso, aprovechando el modo `<think>` para planificación intermedia.
- Despliegue en hardware Intel Arc: es uno de los pocos checkpoints de esta familia pensado explícitamente para vLLM XPU sobre Intel Arc Pro B70 de 32 GB, lo que permite servir el modelo en infraestructura no NVIDIA.
- Procesamiento de documentos largos: con 65.536 tokens de contexto en la configuración XPU y hasta 131.072 en CUDA, admite resúmenes, extracción estructurada y QA sobre contratos, informes o expedientes extensos.
- Generación aumentada por recuperación (RAG) con salida estructurada: combinar el contexto largo con el readout tipado para decidir si la respuesta recuperada es suficiente o si hay que reformular la consulta.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye métricas de verificación propias medidas tras la cuantización:

| Metrica | Resultado medido |
|---|---|
| Sondas de refusal rechazadas (`enable_thinking=False`) | 0 / 8 |
| Acuerdo en decisiones tipadas vs. Pegasus original (30 sondas) | 100,0 % |
| TVD media de decisión vs. Pegasus original | 0,06364 |
| TVD máxima de decisión vs. Pegasus original | 0,25854 |

Métricas del checkpoint BF16 de origen citadas en la model card: 0/8 refusal, 100,0 % de acuerdo en decisiones tipadas, divergencia KL de 0,0618 (Heretic Trial 7 ARA) y rechazos del clasificador de 6/104 frente a 102/104 del baseline.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos safetensors ocupan 18,21 GB; con overhead de KV cache y activaciones, el autor indica que encaja en GPUs de 24-32 GB.
- GPU objetivo declaradas: Intel Arc Pro B70 (32 GB XPU) y GPUs NVIDIA CUDA con soporte de kernels GPTQ/Marlin.
- En consumer GPU: cabe en tarjetas de 24 GB (por ejemplo, RTX 4090) y de 32 GB; en GPUs de 16 GB requeriría offload o una cuantización más agresiva (la familia ofrece GGUF con `IQ3_XXS`).
- Despliegue: vLLM (imagen `intel/llm-scaler-vllm` o `vllm-xpu` para XPU; vLLM estándar para CUDA), con `--dtype bfloat16`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`. Para XPU se recomienda `--enforce-eager`.
- Alternativas de despliegue: la familia incluye una release GGUF con `mmproj` F16 para llama.cpp, LM Studio y Ollama, y una NVFP4 para Blackwell (`sm_100`/`sm_120`).
- Latencia y throughput: no disponibles en la información proporcionada. El MTP integrado está orientado a reducir la latencia de decodificación.

## Comparativa con modelos similares

| Modelo | Precision / formato | Tamano en disco | Contexto | Licencia | Objetivo |
|---|---|---|---|---|---|
| Este modelo (AutoRound INT4) | W4A16 INT4 + componentes BF16 | 18,21 GB | 65.536 (XPU) / 131.072 (CUDA) | apache-2.0 | vLLM en Intel Arc y NVIDIA CUDA |
| webbrain-one/...-Heretic (BF16) | BF16 safetensors | no disponible | no disponible | apache-2.0 | Pesos de referencia, H100/B200/RTX PRO 6000 |
| webbrain-one/...-Heretic-NVFP4 | NVFP4 + FP8 (`compressed-tensors`) | no disponible | no disponible | apache-2.0 | vLLM en NVIDIA Blackwell con MTP |
| webbrain-one/...-Heretic-GGUF | GGUF imatrix (`Q8_0` a `IQ3_XXS`) + `mmproj` F16 | no disponible | no disponible | apache-2.0 | llama.cpp, LM Studio, Ollama, offload CPU |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación del comportamiento de rechazo es intencionada, pero implica que el modelo puede generar contenido dañino, sesgado o inapropiado sin filtros; requiere moderación externa en producción.
- Solo inglés declarado (`language: en`); el rendimiento en castellano u otros idiomas no está verificado y puede degradarse.
- La cuantización INT4 introduce pérdida de precisión: la TVD máxima de decisión frente al original alcanza 0,25854, lo que puede afectar a casos límite del readout tipado.
- Discrepancia entre el nombre (27B) y los parámetros reales de safetensors (6.284.446.960): conviene verificar el conteo efectivo antes de dimensionar infraestructura.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible.
- El soporte de contexto de 131.072 tokens está documentado para CUDA; en XPU el ejemplo usa 65.536, por lo que el contexto efectivo depende del backend.
- Licencia apache-2.0 permite uso comercial, pero el linaje incluye pesos derivados de Qwen y de pplx-decider; conviene revisar las condiciones de los modelos base antes de redistribuir.
- Repositorio con solo 20 descargas y 0 likes: ecosistema de validación muy reducido, sin pruebas independientes conocidas.

## Enlaces

- Hugging Face: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-AutoRound-INT4
- Modelo base Heretic (BF16): https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic
- Release NVFP4: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-NVFP4
- Release GGUF: https://huggingface.co/webbrain-one/Qwen3.8-27B-Perplexing-Pegasus-Heretic-GGUF
- Modelo intermedio: https://huggingface.co/AveLabs/Qwen3.8-27B-Perplexing-Pegasus
- Readout de decisiones: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Modelo Qwen de origen: https://huggingface.co/Qwen/Qwen3.8-27B

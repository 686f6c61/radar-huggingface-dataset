# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter8

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter8 es un checkpoint de investigación publicado por el usuario ziyan98, obtenido a partir de Qwen/Qwen3.8-27B tras aplicar el experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No se trata de una mejora de propósito general del modelo base: el entrenamiento se realizó sobre un único juego, la evaluación se hizo con rollouts de 32 episodios de ese mismo juego y las diferencias entre brazos del estudio son de pocas centésimas de shaped return (retorno modelado). El propio autor lo etiqueta explícitamente como research checkpoint.

El linaje del entrenamiento es `sft_first_idd-cc` (iteración 8 de Megatron), dentro del experimento `sft_first (IDD-recite)`. La idea que se estudia es si el conocimiento verificado extraído de la propia partida del modelo puede escribirse en sus pesos mediante filas supervisadas (SFT) y mejorarse después con RL sobre episodios multi-paso reales. El pipeline combina 2 rollouts exclusivamente de SFT con rollouts de RL con Dr.GRPO (iteraciones 2 a 8), sobre la pila slime v0.3.2 + Megatron-LM.

El checkpoint resultante conserva exactamente el conjunto de tensores de Qwen3.8-27B (1199 tensores, 27.781.427.952 parámetros), en bf16 safetensors, con licencia apache-2.0. Solo se entrenó la pila de texto: la torre visual `model.visual.*` y la cabeza de predicción multi-token `mtp.*` se copiaron sin modificar del modelo base. Es relevante ahora como material reproducible para estudiar internalización de conocimiento y dinámica de RL multi-paso, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal derivado de Qwen3.8-27B (clase `Qwen3_5ForConditionalGeneration`, tag `qwen3_5`), con torre visual y cabeza de predicción multi-token (MTP) |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16 safetensors; no hay GGUF, AWQ, GPTQ ni FP8 en la información disponible) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores, repo de 55,6 GB; incluye config, tokenizer, chat template, generation config y processor configs del modelo base |

## Arquitectura y entrenamiento

Arquitectura: se hereda íntegramente la de Qwen3.8-27B, un transformer denso de 27.781 millones de parámetros con torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). El entrenamiento se aplicó únicamente a la pila de texto (`model.language_model.*` y `lm_head`): de los 1199 tensores, 512 son bit-idénticos al modelo base y 687 difieren (686 bajo el prefijo `model.language_model` y 1 en `lm_head`). La torre visual y la cabeza MTP nunca formaron parte del modelo en Megatron y se copiaron sin cambios; el actor nunca vio una imagen durante el entrenamiento.

Entrenamiento: dos fases sobre slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI, en bf16 con backend flash-attn 2.8.3. Fase SFT con 303 filas IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`): turnos de recitación escritos por el mismo modelo con el bloque de conocimiento en contexto, emparejados con filas de replay y filtrados por la regla de lint C. Después, RL con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por cada rollout de 32 episodios, learning rate 5e-6. El schedule fue: rollouts 0–1 solo SFT, reinicio de Adam en la frontera SFT→RL y rollouts de RL 2–8, relanzados desde la iteración 1 el 2026-09-17 tras detectarse que el primer intento ejecutó RL con momentos de Adam congelados. El prompt de RL nunca contiene conocimiento. El harness de juego es Claude Code CLI 2.1.270 conduciendo las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, shaped return sobre los niveles completados). Innovación destacable: la conversión Megatron torch_dist → HF se hizo con el mapeo propio de slime (`megatron_to_hf.convert_to_hf`) mediante `convert_torch_dist_to_hf_lowmem.py`, por trozos y en un nodo de login, y el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B.

## Capacidades

- Generación de texto conversacional y razonamiento con trazas de "pensamiento": los rollouts registran una mediana de tokens de think entre 5156 y 6887 por episodio.
- Internalización de conocimiento: capacidad específicamente entrenada para recitar conocimiento verificado dentro de los pesos en lugar de depender de que esté en el contexto (durante la evaluación el conocimiento no se incluye en el prompt; la columna `recited turns` es 0,000 en todas las rollouts).
- Juego interactivo multi-paso: el modelo actúa como agente sobre ARC-AGI-3 invocando herramientas MCP (`look`, `act`, `status`) contra un motor de juego con semilla fija.
- Aprendizaje por refuerzo sobre retorno modelado: la política entrenada optimiza shaped return con clear rate medido por episodio.
- Modalidad imagen-texto declarada en el pipeline (`image-text-to-text`) con torre visual intacta del modelo base, aunque no evaluada en este checkpoint.
- Soporte de tool calling / function calling: ejercitado mediante el bucle de herramientas MCP del harness, no validado fuera de ese entorno.
- Capacidades multilingües: no disponible (no se declaran idiomas ni se han evaluado).
- No hay evidencia de capacidades específicas de código, matemáticas o audio en la información proporcionada.

## Casos de uso

- Reproducción del experimento de internalización de conocimiento: cargar el checkpoint como `Qwen3_5ForConditionalGeneration` y comparar el estado de pesos con `Qwen/Qwen3.8-27B` usando `E2K_VERIFY.json` y `SHA256SUMS`, para aislar exactamente qué tensores cambiaron (687 de 1199).
- Línea base para comparar brazos del estudio E2K: este checkpoint es la mejor trayectoria de RL del estudio (shaped return +0,206 y +0,252 en los rollouts 5 y 8), por lo que sirve como referencia frente a iteraciones previas y frente a configuraciones alternativas registradas en `checkpoints/checkpoints.md`.
- Estudio de la dinámica de Dr.GRPO en tareas de horizonte largo: las 13 rollouts registradas permiten analizar la relación entre pasos de optimizador, tasa de clear (0,000–0,031), cambio de paso (0,033–0,093) y tasa de no-op (0,272–0,349).
- Replicación de agentes con MCP: reconstruir el harness `look`/`act`/`status` con semilla de motor 0 y niveles 1–4 para verificar la reproducibilidad de las métricas por rollout publicadas.
- Investigación sobre recitación frente a conocimiento en contexto: comparar el comportamiento del modelo cuando el bloque de conocimiento está en el prompt (fase SFT) frente a cuando no lo está (fase RL), midiendo `recited turns` y `source-ref turns`.
- Fine-tuning posterior controlado: al mantener el conjunto de tensores y formas del modelo base, el checkpoint puede usarse como punto de partida para nuevos estudios de SFT/RL sin adaptar código de carga ni tokenizer.
- Docencia e ingeniería de pipelines: ejemplo verificable de conversión Megatron torch_dist → HF de bajo consumo de memoria, con artefactos de auditoría (`megatron/args.json`, `megatron/common.pt`, `global_dataset_state_dict_<N>.pt`) para reconstruir el estado de entrenamiento sin los momentos del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son las métricas de juego del propio estudio, por rollout, extraídas de los logs del job:

| Job | Rollout | Clear rate | Shaped return | Step change | Step no-op | Think tokens p50 | Recited turns | Source-ref turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5563,500 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5814,000 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5668,000 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5156,000 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5525,000 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6497,500 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5622,500 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6598,500 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5377,000 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6887,500 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5595,500 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5211,000 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5367,000 | 0,000 | 0,362 |

Lectura de los datos: el primer rollout de RL tras el bloque solo SFT lo juega la política SFT, por lo que mide el efecto de las filas supervisadas por sí solas; el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de shaped return, del mismo orden que varias de las diferencias observadas (por ejemplo +0,011 o +0,084). El rango de shaped return de la iteración 8 es +0,011 a +0,252, con 0 o 1 niveles completados de 32 episodios por rollout.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB de safetensors (27.781 millones de parámetros). Solo los pesos ya superan los 48 GB de dos RTX 4090 de 24 GB.
- VRAM estimada para inferencia: no disponible de forma oficial; como referencia de orden de magnitud, los pesos bf16 ocupan unos 55,6 GB y hay que sumar caché KV y activaciones, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB, GH200) o un despliegue multi-GPU con paralelismo tensorial.
- GPU de consumo: no cabe en bf16 en ninguna GPU de consumo actual (24 GB o menos). No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ, FP8), por lo que no hay una ruta de despliegue en consumer GPU documentada para este checkpoint.
- Hardware del entrenamiento: 4 nodos GH200 de Isambard-AI, Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang a tp=1. El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI (`/projects/u6uv/ziyan/outputs/rl/ckpt/sft_first_idd-cc/iter_0000008`).
- Opciones de despliegue validadas en la información disponible: `transformers` (carga mediante `AutoProcessor` + `Qwen3_5ForConditionalGeneration`) y SGLang (usado como motor de rollout). vLLM, TGI, llama.cpp y Ollama no aparecen validados en la documentación del checkpoint.
- Latencia y throughput: no disponibles como métricas de servicio. Los únicos datos de coste son operativos del harness: mediana de 5156–6887 tokens de "think" por episodio y 8 pasos de optimizador por rollout de 32 episodios con batch global 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Formato | Descargas / likes |
|---|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter8 (este) | 27.781.427.952 | no disponible | SFT (303 filas) + Dr.GRPO sobre el juego `cd82-fb555c5d` de ARC-AGI-3 | apache-2.0 | safetensors bf16 (1199 tensores) | 0 / 0 |
| Qwen/Qwen3.8-27B (base) | 27.781.427.952 (mismo conjunto de tensores) | no disponible | no aplica (modelo base) | apache-2.0 (heredada por el derivado) | safetensors bf16 | no disponible |
| Otras iteraciones de la serie E2K del mismo run | no disponible | no disponible | variantes de rollouts SFT/RL del mismo estudio | apache-2.0 | safetensors bf16 | no disponible |

No se dispone de datos de contexto, benchmarks ni cifras de uso de otros modelos comparables de la misma categoría (27–32B multimodales) en la información proporcionada, por lo que la comparación cuantitativa se limita al modelo base y a las demás iteraciones de la serie, que el autor documenta en `checkpoints/checkpoints.md` del dataset de RL.

## Limitaciones y advertencias

- No es una mejora general de Qwen3.8-27B: se entrenó sobre un solo juego (`cd82-fb555c5d`), se evaluó con rollouts de 32 episodios de ese juego y las diferencias entre brazos son de pocas centésimas de shaped return.
- Significación estadística limitada: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de shaped return, comparable a varias de las mejoras reportadas (+0,011, +0,084, +0,100).
- Rendimiento absoluto bajo en la tarea: clear rate de 0,000 a 0,031, es decir, como máximo 1 nivel completado de 32 episodios por rollout.
- Entrenamiento exclusivamente de texto: la torre visual y la cabeza MTP se copiaron sin cambios y el actor nunca vio una imagen; no hay evidencia de rendimiento multimodal para este checkpoint.
- La evaluación no incluye benchmarks estándar de razonamiento, código o matemáticas, y las capacidades del modelo base en esas áreas no se han verificado tras el entrenamiento.
- Idiomas soportados no declarados; no se ha evaluado el comportamiento multilingüe ni la degradación en idiomas distintos del usado en el entrenamiento.
- Sesgos conocidos: no documentados en la información disponible. Al derivar de Qwen3.8-27B, los sesgos del modelo base no se mitigan y no se han medido.
- Riesgo de alucinación: no cuantificado. El entrenamiento en recitación de conocimiento interno podría aumentar la confianza en conocimiento memorizado sin verificación externa, pero no hay mediciones que lo confirmen.
- Licencia: apache-2.0 permite uso comercial, pero el checkpoint deriva de Qwen/Qwen3.8-27B y debe cumplir también las condiciones de dicho modelo base. El autor lo publica como research checkpoint, no validado para producción.
- Reproducibilidad dependiente de terceros: el harness usa Claude Code CLI 2.1.270 y herramientas MCP propias; el job se detuvo al agotarse la asignación de cómputo, por lo que la trayectoria RL no se completó.
- El repositorio pesa 55,6 GB y no ofrece variantes cuantizadas, lo que limita su uso fuera de infraestructura con GPUs de 80 GB o despliegues multi-GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefactos de auditoría incluidos en el repositorio: `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`
- Estado del entrenamiento en el repositorio: `megatron/args.json`, `megatron/common.pt`, `megatron/latest_checkpointed_iteration.txt`, `megatron/global_dataset_state_dict_<N>.pt`
- Referencias del estudio: `knowledge-set/` (configs `rl_config_cc_idd.json` y linaje `rl_config_cc_idd_v2`), `checkpoints/checkpoints.md` y export de W&B con la NLL de conocimiento por paso de SFT (`train/sft_cite_nll_sum / train/sft_cite_tokens`)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.

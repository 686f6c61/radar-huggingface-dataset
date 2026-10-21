# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter3 es un checkpoint de investigación derivado de Qwen/Qwen3.8-27B (27.781.427.952 parámetros, torre de visión y cabeza de predicción multi-token incluidas), publicado por Ziyan Wang (King's College London) dentro del experimento E2K de "internalización de conocimiento". El objetivo del experimento es comprobar si el conocimiento verificado extraído de las propias partidas de un modelo en un juego ARC-AGI-3 puede escribirse en los pesos mediante filas de chat supervisadas (SFT) y mejorarse después con RL sobre episodios reales de varios pasos. El modelo se entrenó sobre un único juego, `cd82-fb555c5d`, y se evaluó con rollouts de 32 episodios de ese mismo juego.

Se trata de la iteración 3 de Megatron del run `sft_first_decl-cc4`: tres rollouts exclusivamente SFT (0-2), reinicio de Adam y RL desde el rollout 3, con parada durante el rollout 4. Las filas SFT son 896 filas de chat declarativo por rollout, construidas a partir de un conjunto de conocimiento de 888 átomos, mezcladas con filas ancla del modelo base (ratio 1.0). El resultado medido es un retorno con forma (*shaped return*) de −0.1625 en el rollout 3 y −0.077 en el rollout 4, con 0/32 niveles superados en ambos casos.

El autor advierte explícitamente de que **no** es una mejora de propósito general de Qwen3.8-27B: las diferencias entre brazos del experimento son de unas centésimas de retorno y el ruido entre rollouts de un mismo brazo ronda 0.05. Es relevante ahora como artefacto reproducible de un estudio sobre internalización de conocimiento y RL con recompensas dispersas, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`): pila de texto + torre de visión `model.visual.*` + cabeza de predicción multi-token `mtp.*` |
| Parametros totales | 27.781.427.952 (27,78 B), 1199 tensores |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 safetensors, sin GGUF ni cuantizaciones publicadas |
| Idiomas soportados | no disponible (los hereda del modelo base Qwen3.8-27B, no documentados en esta ficha) |
| Licencia | Apache-2.0, heredada de Qwen3.8-27B |
| Formato de pesos | safetensors en bf16; estado Megatron torch_dist en `megatron/` |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin cambios estructurales: mismo conjunto de tensores y mismas formas (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`) corresponde al estado entrenado en Megatron; la torre de visión (`model.visual.*`) y la cabeza MTP (`mtp.*`) se copiaron sin modificar del checkpoint base, ya que nunca formaron parte del modelo Megatron y el entrenamiento fue solo de texto (el actor no vio ninguna imagen). Configuración, tokenizer, chat template, generation config y processor config son los del modelo base; el modo *thinking* y la plantilla de chat no se alteraron.

El entrenamiento se hizo con slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang con tp=1, en 4 nodos GH200 de Isambard-AI. El algoritmo de RL es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. Las filas SFT son filas de chat declarativo (formatos qa / rule / sentence, apertura de *think* variada y final con llamadas a herramientas del juego: la respuesta se queda dentro del *think* y el turno termina con tool calls), mezcladas con filas ancla del modelo base. El prompt de RL nunca contiene conocimiento: la hipótesis es que este ya está en los pesos.

El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1-4 con tope de un nivel y retorno con forma sobre los niveles superados. La conversión Megatron torch_dist → HF se hizo con el conversor de slime (`megatron_to_hf.convert_to_hf`, mediante `convert_torch_dist_to_hf_lowmem.py` en streaming); `E2K_VERIFY.json` recoge la comparación contra el modelo base y `SHA256SUMS` cubre todos los ficheros.

## Capacidades

- Generación de texto conversacional multiturno con el chat template original de Qwen3.8-27B.
- Modo *thinking* preservado del modelo base (el p50 de tokens de *think* medido en los rollouts fue de 1925 y 1112 tokens).
- Emisión de llamadas a herramientas (*tool calling*) al final del turno, tras el bloque de razonamiento: es el formato exacto con el que se construyeron las filas SFT.
- Razonamiento multietapa dentro de un bucle agente (observar → actuar → consultar estado) sobre las herramientas MCP del arnés ARC-AGI-3.
- Interfaz multimodal declarada (`image-text-to-text`, `Qwen3_5ForConditionalGeneration`) por herencia del modelo base, aunque la torre de visión no se entrenó en este run.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Estudio de internalización de conocimiento: reproducir el pipeline SFT → RL y medir si las filas declarativas mejoran el desempeño sin conocimiento en el prompt; el checkpoint sirve como brazo de comparación frente al modelo base y frente a otras iteraciones del run.
- Investigación en RL con recompensas dispersas: el retorno con forma por niveles superados y el registro de rollouts de 32 episodios permiten analizar curvas de aprendizaje en tareas de juego de horizonte largo.
- Análisis de agentes con tool calling: el formato de fila SFT (razonamiento en el *think* y tool calls al final) es un caso concreto para estudiar cómo se comporta un modelo cuando la acción debe emitirse como llamada estructurada.
- Reproducibilidad de conversión de checkpoints: el repo incluye el estado Megatron (`common.pt`, `args.json`, `latest_checkpointed_iteration.txt`, `global_dataset_state_dict_<N>.pt`) y las sumas SHA256, útil para validar conversores torch_dist → HF.
- Auditoría de metodología: `E2K_VERIFY.json` documenta la comparación tensor a tensor contra el modelo base, lo que permite verificar qué partes se entrenaron y cuáles se copiaron.
- Docencia y divulgación técnica: ejemplo realista de por qué una diferencia de unas centésimas de retorno queda dentro del ruido (~0.05) y no debe presentarse como mejora del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son las de juego en ARC-AGI-3 para este run, por rollout:

| Job | Rollout | Tasa de niveles superados | Retorno con forma | Cambio de paso | Paso sin acción (no-op) | Tokens de think p50 | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6667077 | 3 | 0.000 | −0.163 | 0.035 | 0.323 | 1925.000 | 0.000 | 0.077 |
| 6667077 | 4 | 0.000 | −0.077 | 0.029 | 0.262 | 1112.000 | 0.000 | 0.070 |

Contexto de lectura: el primer rollout de RL tras un bloque solo SFT lo juega la política SFT, de modo que mide el efecto de las filas por sí solas; el ruido entre rollouts de un mismo brazo es de aproximadamente 0.05 de retorno con forma.

## Requisitos de hardware

- Peso de los pesos en bf16: 55,6 GB de repositorio para 27,78 B de parámetros, sin contar estados de optimizador.
- VRAM estimada para inferencia (estimación a partir del número de parámetros, no medida publicada): ~56 GB en bf16 más caché KV y activaciones; ~28 GB en FP8/INT8; ~15-17 GB en cuantización de 4 bits.
- GPU recomendadas: el run se entrenó en nodos GH200 (4 nodos); para inferencia en bf16 encajan A100 80 GB, H100 80 GB y GH200. Para 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB quedarían muy justas y con contexto limitado.
- Cabe en GPU de consumo: solo con cuantización agresiva (4 bits) y sin GGUF publicado, por lo que hoy requeriría cuantizar el propio usuario.
- Opciones de despliegue: transformers (`AutoProcessor` + `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`), vLLM y SGLang (el autor indica que carga igual que el modelo base). llama.cpp y Ollama no están disponibles al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles. El estado completo con optimizador ocupa ~351 GB y permanece en Isambard-AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-...-sft_first_decl-cc4-iter3 (este) | 27,78 B | no disponible | SFT declarativo + Dr.GRPO sobre un juego ARC-AGI-3 | Apache-2.0 | Pesos bf16 en HF (55,6 GB) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo base multimodal Qwen3.5 | Apache-2.0 | Público en HF |
| Otras iteraciones del mismo run (rollouts 0-2, solo SFT) | 27,78 B | no disponible | Solo SFT | Apache-2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de benchmarks ni de especificaciones verificadas de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no se incluye una comparación adicional.

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor lo declara explícitamente. Entrenado y evaluado en un único juego (`cd82-fb555c5d`).
- Resultado nulo en la métrica principal: 0/32 niveles superados y 0 turnos recitados en los rollouts 3 y 4.
- Las diferencias entre brazos son de unas centésimas de retorno con forma, por debajo del ruido entre rollouts del mismo brazo (~0.05); no deben interpretarse como señal.
- Entrenamiento solo de texto: la torre de visión y la cabeza MTP se copian sin cambios del modelo base, de modo que cualquier uso multimodal no está validado en este checkpoint.
- Sesgos y alucinaciones: heredados del modelo base Qwen3.8-27B; no se ha realizado ninguna evaluación específica de sesgo o factualidad en este run.
- Idiomas: no documentados; no hay evidencia de comportamiento multilingüe más allá del modelo base.
- Contexto máximo: no documentado en esta ficha; conviene consultar la model card de Qwen3.8-27B antes de usarlo con ventanas largas.
- Licencia Apache-2.0 heredada, pero el uso comercial debe verificar además los términos aplicables al modelo base Qwen3.8-27B.
- Estado de entrenamiento incompleto: el run se detuvo durante el rollout 4; no existe una iteración final validada.
- Reproducibilidad parcial: el estado completo con momentos del optimizador (~351 GB) no está publicado, solo el estado Megatron sin optimizador y los pesos HF.
- No usar como sustituto del modelo base en producción sin una evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL con episodios, métricas, filas y log del run: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código del proyecto: repositorio `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`)

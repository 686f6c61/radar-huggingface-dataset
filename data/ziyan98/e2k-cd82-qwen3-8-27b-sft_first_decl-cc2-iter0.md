# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter0 es un checkpoint de investigación publicado por Ziyan Wang (King's College London) como parte del experimento E2K de "internalización de conocimiento". Se trata de un ajuste fino de Qwen/Qwen3.8-27B (27.781.427.952 parámetros) sobre una única tarea: el juego `cd82-fb555c5d` de ARC-AGI-3. El objetivo del estudio es comprobar si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas de chat declarativas (SFT) y mejorarse después con RL sobre episodios reales de múltiples pasos.

El checkpoint corresponde a la iteración 0 de Megatron del run `sft_first_decl-cc2`, es decir, un estado únicamente SFT (sin RL aplicado todavía) dentro de una fase de calentamiento de tres rollouts. Las filas de entrenamiento consisten en 781 filas declarativas en formas qa + rule, con ratio de anclaje 1,5 y 448 filas de chat por rollout. La pérdida de conocimiento (NLL) bajó de 1,67 a aproximadamente 0,56 por token durante el calentamiento.

Es relevante ahora no como mejora general del modelo base, sino como artefacto reproducible: el autor documenta explícitamente que las diferencias entre brazos del experimento son de centésimas de retorno con forma y que el run se canceló durante el rollout 3 de RL al alcanzar un 33 % de episodios de una sola llamada. Es, por tanto, un punto de partida para estudiar internalización de conocimiento y no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre visual + stack de texto + cabeza de predicción multi-token) |
| Parámetros totales | 27.781.427.952 (27,8 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en bf16 (sin GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16, 1199 tensores, 55,6 GB de repositorio |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen3.8-27B: un stack de texto (`model.language_model.*` y `lm_head`), una torre visual (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). Solo el stack de texto fue entrenado; la torre visual y la cabeza MTP nunca formaron parte del modelo Megatron y se copiaron sin cambios desde el checkpoint base, ya que el entrenamiento fue exclusivamente de texto y el actor no vio ninguna imagen. La conversión de Megatron torch_dist a HF se realizó con el mapeo `megatron_to_hf.convert_to_hf` de slime, con verificación de forma y dtype de cada tensor, identidad bit a bit de los tensores copiados y `SHA256SUMS` sobre todos los ficheros.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) con 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. El esquema fue: 3 rollouts solo SFT (0–2) con reset de Adam, y RL a partir del rollout 3 con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego fue Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla y modo thinking idénticos a los del modelo base.
- Internalización de conocimiento declarativo: el ajuste SFT escribió reglas y pares pregunta-respuesta del juego en los pesos, reduciendo la NLL de conocimiento de 1,67 a ~0,56 por token.
- Razonamiento multi-paso en un entorno de juego con acciones secuenciales, mediado por un arnés externo que expone herramientas MCP.
- Capacidad multimodal heredada de forma nominal (torre visual intacta), aunque no fue entrenada ni evaluada en este run.
- Soporte de tool calling, agentes, multilingüismo y otras capacidades del base: no disponible en la información proporcionada.
- Carga compatible con `transformers`, vLLM y SGLang del mismo modo que el modelo base.

## Casos de uso

- Investigación sobre internalización de conocimiento: usar este checkpoint como brazo SFT de referencia frente a brazos con RL para medir cuánto del conocimiento declarativo se conserva en los pesos tras el entrenamiento por refuerzo.
- Reproducción de experimentos de RL con slime y Megatron-LM: el repositorio incluye `megatron/args.json`, `common.pt`, el cursor de datos `global_dataset_state_dict_<N>.pt` y `latest_checkpointed_iteration.txt`, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py`.
- Estudio de olvido catastrófico y regresión de capacidades: comparar este checkpoint con Qwen3.8-27B en tareas generales para cuantificar el coste de un SFT estrecho sobre un único juego.
- Diseño de arneses de evaluación para ARC-AGI-3: el run documenta el uso de herramientas MCP `look`/`act`/`status` con semilla fija y niveles 1–4, útil como plantilla de harness reproducible.
- Análisis de resultados negativos: el checkpoint documenta un colapso de conducta (33 % de episodios de una sola llamada) que sirve para estudiar modos de fallo en políticas entrenadas con GRPO sobre horizontes cortos.
- Verificación de pipelines de conversión Megatron → HF: los scripts `convert_torch_dist_to_hf_lowmem.py` y los ficheros `E2K_VERIFY.json` y `E2K_CONVERSION.json` permiten auditar la equivalencia tensorial frente al base.
- Docencia y divulgación técnica: ejemplo completo y trazable de un ciclo SFT + RL con métricas de pérdida de conocimiento por paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay líneas de métricas de juego para este run en los logs de Slurm y remite al `wandb_export` del dataset. La única métrica cuantitativa reportada es la pérdida de conocimiento del SFT:

| Métrica | Valor | Contexto |
|---|---|---|
| NLL de conocimiento por token | 1,67 → ~0,56 | Calentamiento SFT del trial 2 |
| Filas SFT | 781 | Formas qa + rule, ratio de anclaje 1,5 |
| Filas de chat por rollout SFT | 448 | — |
| Ruido entre rollouts de un brazo | ~0,05 de retorno con forma | Según la model card |
| Episodios de una sola llamada | 33 % | Criterio de cancelación del rollout 3 de RL |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 56 GB solo para pesos, más caché KV; se recomienda un mínimo de 80 GB por instancia para contexto moderado (estimación derivada del número de parámetros, no publicada por el autor).
- GPU recomendadas: H100 80 GB, A100 80 GB, GH200 (el entrenamiento se hizo en 4 nodos GH200). Para bf16 en una sola GPU hace falta una tarjeta de 80 GB o superior.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB. Al no publicarse pesos cuantizados, sería necesario cuantizar el modelo uno mismo (8 bits ≈ 28 GB, 4 bits ≈ 14 GB, estimaciones por recuento de parámetros) para intentar encajarlo en una RTX 4090 o similar.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`, vLLM y SGLang (la model card indica que se cargan igual que el modelo base). llama.cpp u Ollama requerirían una conversión propia a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter0 | 27,8 B | No disponible | Apache-2.0 | HuggingFace, 0 descargas | Checkpoint de investigación, SFT sobre un solo juego |
| Qwen/Qwen3.8-27B (base) | 27,8 B | No disponible | Apache-2.0 | HuggingFace | Modelo generalista del que deriva; mismo conjunto de tensores y formas |
| Otros brazos del run `sft_first_decl-cc2` | 27,8 B | No disponible | Apache-2.0 | Un repositorio por iteración guardada, listados en `checkpoints/checkpoints.md` | Mismo pipeline, distinto punto del calentamiento |
| Alternativas generalistas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de comparación |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: fue entrenado sobre un único juego (`cd82-fb555c5d`) y evaluado con rollouts de 32 episodios de ese mismo juego.
- Resultado negativo declarado por el autor: el brazo `sft_first_decl-cc2` se marca como "collapsed trial (negative result)" y las diferencias entre brazos son de centésimas de retorno con forma, dentro del ruido de ~0,05 entre rollouts.
- El run se canceló durante el rollout 3 de RL al alcanzar un 33 % de episodios finalizados de una sola llamada; el checkpoint es solo SFT (iteración 0), sin RL aplicado.
- Entrenamiento exclusivamente de texto: la torre visual se copió sin cambios y el actor nunca vio una imagen, por lo que no hay garantía sobre el comportamiento multimodal más allá del heredado del base.
- Riesgo de alucinación y de sobreajuste a las formas declarativas del conjunto de conocimiento: no se han publicado evaluaciones de robustez, sesgos ni comportamiento fuera de distribución.
- Idiomas y cobertura multilingüe no documentados en la información disponible.
- Longitud de contexto no documentada; conviene consultar la configuración del modelo base antes de desplegarlo.
- Licencia Apache-2.0 heredada de Qwen3.8-27B; el uso comercial está permitido por licencia, pero el autor no ofrece ninguna garantía de calidad ni de idoneidad para producción.
- Artefacto con 0 descargas y 0 likes: no hay validación comunitaria ni informes independientes de comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de episodios y métricas del run: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código del proyecto: `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`)
- Paper, blog o demo: no disponible en la información proporcionada

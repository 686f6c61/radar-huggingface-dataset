# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4

## Resumen

`E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4` es un checkpoint de investigación publicado por el usuario `ziyan98` sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un ajuste fino de propósito general, sino del cuarto iteración de un experimento de **internalización de conocimiento (E2K, experience-to-knowledge)** sobre un único juego de ARC-AGI-3 identificado como `cd82-fb555c5d`. El objetivo del estudio es comprobar si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas supervisadas y, después, mejorarse con aprendizaje por refuerzo sobre episodios reales de varios pasos.

El modelo conserva la arquitectura del base: un transformer multimodal `Qwen3_5ForConditionalGeneration` con torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`), aunque **solo se entrenó la pila de texto** (`model.language_model.*` y `lm_head`). La torre visual y la cabeza MTP se copiaron sin modificar del checkpoint original, y el actor nunca vio una imagen durante el entrenamiento. El resultado es un artefacto de investigación reproducible, no un modelo listo para producción.

La relevancia es metodológica: documenta con detalle la pila de entrenamiento (slime v0.3.2 + Megatron-LM TP4×PP4 + Dr.GRPO sobre 4 nodos GH200 de Isambard-AI), las 303 filas SFT del arnés IDD, el calendario de rollouts y las métricas de juego por rollout, además de los scripts de conversión de Megatron `torch_dist` a safetensors HF verificados bit a bit contra el base. Su utilidad principal es servir de referencia para quienes investigan agentes que aprenden a jugar mediante herramientas MCP y RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (pila de texto entrenada; torre visual y cabeza MTP heredadas sin cambios del base) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados solo en bf16 safetensors; no se publican GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; se hereda el tokenizador y la plantilla de chat del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con las mismas formas que `Qwen/Qwen3.8-27B`; repositorio de 55,6 GB |
| Libreria / clase de carga | `transformers`, `Qwen3_5ForConditionalGeneration` (junto con `AutoProcessor`) |
| Pipeline declarado | `image-text-to-text` |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen3.8-27B: un transformer multimodal con torre visual y una cabeza de predicción multi-token (MTP). En este checkpoint, sin embargo, solo la pila de texto (`model.language_model.*`, `lm_head`) corresponde al estado entrenado en Megatron; `model.visual.*` y `mtp.*` nunca formaron parte del modelo de Megatron y se copiaron sin cambios desde el checkpoint base. La conversión de Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B, y `E2K_VERIFY.json` recoge la comparación contra el base.

El entrenamiento combina dos fases. Primero, 2 rollouts exclusivamente SFT (iteraciones 0–1) sobre 303 filas IDD del arnés `cd82-play-v4/sft/rows_paired.jsonl.gz`: turnos de recitación escritos por el propio modelo con el bloque de conocimiento en su contexto, emparejados con filas de replay y validados con la regla de lint C. Después, un reinicio de Adam en la frontera SFT→RL y rollouts 2–8 de Dr.GRPO (reiniciados desde la iteración 1 el 2026-09-17 tras un primer intento que ejecutó RL con momentos de Adam congelados). La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a `tp=1`, sobre 4 nodos GH200 de Isambard-AI; Dr.GRPO con `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento.

El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel, y retorno con forma (*shaped return*) además de la bonificación por completar nivel. El repositorio incluye `megatron/` con `args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo los momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen3.8-27B.
- Entrada de imagen según el pipeline declarado (`image-text-to-text`), servida por la torre visual heredada sin entrenar en este experimento; la model card advierte que el actor nunca vio imágenes durante el entrenamiento.
- Uso de herramientas vía MCP: el checkpoint fue entrenado y evaluado con las herramientas `look`, `act` y `status`, es decir, interacción estructurada con un entorno externo paso a paso.
- Razonamiento multi-paso dentro de episodios largos: las métricas reportan tokens de pensamiento con mediana entre 5.156 y 6.887,5 por rollout.
- Recitación de conocimiento en contexto: las filas SFT son turnos de recitación con el bloque de conocimiento presente; el objetivo del experimento es prescindir de ese bloque en el prompt de RL.
- Juego en ARC-AGI-3 sobre el entorno `cd82-fb555c5d`, limitado a los niveles 1–4 con tope de un nivel por episodio.
- No se documentan capacidades específicas de código, matemáticas, audio ni modo *thinking* explícito más allá de lo heredado del base, que no se detalla en la información disponible.

## Casos de uso

- Reproducción del experimento E2K: cargar el checkpoint junto con `megatron/args.json` y el cursor `global_dataset_state_dict_<N>.pt` para reconstruir el estado de entrenamiento con `convert_hf_to_torch_dist.py` y repetir los rollouts 2–8 de Dr.GRPO en las mismas condiciones.
- Estudio de internalización de conocimiento: comparar este checkpoint (brazo IDD, iteración 4) con las iteraciones SFT-only 0–1 y con el resto de la serie para medir si el conocimiento recitado se escribe en los pesos y sobrevive cuando el prompt de RL no lo contiene.
- Referencia para pipelines de RL con slime y Megatron-LM: el repositorio documenta TP4 × PP4, 16 motores SGLang a `tp=1`, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios, una configuración reutilizable como plantilla de depuración.
- Evaluación de agentes con herramientas MCP: usar el arnés `knowledge_learning.loop.arc_mcp` con Claude Code CLI 2.1.270 para medir tasas de acierto y retorno con forma en el entorno `cd82-fb555c5d` con semilla 0.
- Validación de herramientas de conversión: `E2K_VERIFY.json` y `SHA256SUMS` permiten comprobar la fidelidad de la conversión Megatron `torch_dist` → safetensors HF frente al base, incluida la identidad bit a bit de los tensores copiados.
- Análisis de estabilidad del entrenamiento: la tabla de métricas por rollout documenta un caso de reinicio de Adam y una redimensión de la línea base (`rl_config_cc_idd_v2`), útil para estudiar el efecto de los momentos del optimizador en RL.
- Base para experimentos de investigación sobre uso de herramientas y planificación: al conservar la pila de texto completa del base, sirve como punto de partida controlado para ablaciones sobre datos SFT de 303 filas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica son las métricas de juego por rollout en el entorno `cd82-fb555c5d`, obtenidas del análisis de los registros de trabajo:

| Job | Rollout | Tasa de nivel completado | Retorno con forma | Cambio de paso | Paso sin efecto (no-op) | Tokens de pensamiento (p50) | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5.563,5 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5.814,0 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5.668,0 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5.156,0 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5.525,0 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6.497,5 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5.622,5 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6.598,5 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5.377,0 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6.887,5 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5.595,5 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5.211,0 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5.367,0 | 0,000 | 0,362 |

Advertencias sobre estos datos: el primer rollout de RL tras un bloque SFT-only lo juega la política SFT-only, por lo que mide el efecto de las filas por sí solas; el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y la propia model card indica que las diferencias entre brazos son de "unas pocas centésimas" de retorno con forma. La tasa de nivel completado se mantiene en 0,000–0,031 en todos los rollouts registrados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 55,6 GB solo de pesos (2 bytes por parámetro sobre 27,78 B), más caché KV y activaciones; el repositorio completo ocupa 55,6 GB.
- GPU recomendadas: una A100 80 GB, H100 80 GB o GH200 (96 GB) en bf16. El entrenamiento se ejecutó sobre 4 nodos GH200 de Isambard-AI.
- Cabe en GPU de consumo: con bf16 no cabe en una RTX 4090 de 24 GB; haría falta tensor parallelism sobre 2–3 unidades, y no se publican cuantizaciones que redujesen la huella a 24 GB.
- Checkpoint completo de entrenamiento con estado del optimizador: aproximadamente 351 GB, alojado en Isambard-AI y no incluido en el repositorio de HuggingFace.
- Opciones de despliegue: `transformers` (ruta documentada, `Qwen3_5ForConditionalGeneration.from_pretrained` junto con `AutoProcessor`), SGLang (usado en el entrenamiento como motor de rollout a `tp=1`), vLLM y TGI como alternativas estándar para safetensors; llama.cpp u Ollama requerirían una conversión a GGUF que no se proporciona.
- Latencia y throughput: no disponibles. Los registros solo reportan tokens de pensamiento por rollout (mediana 5.156–6.887,5) y 32 episodios por rollout, no tiempos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4` | 27,78 B | No disponible | SFT (303 filas IDD) + Dr.GRPO sobre un juego ARC-AGI-3 | Apache 2.0 | safetensors bf16 | 0 descargas, 0 likes en el momento de la consulta |
| `Qwen/Qwen3.8-27B` (base) | 27,78 B (mismo conjunto de 1199 tensores) | No disponible | No detallado en la informacion disponible | Apache 2.0 | safetensors | Modelo base original |
| Otras iteraciones de la serie `sft_first_idd-cc` (iteraciones 0–1 SFT-only, 2–8 RL) | 27,78 B | No disponible | Mismo run, distinto punto del calendario | Apache 2.0 | safetensors | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` del dataset de RL |

No se han proporcionado datos de otros modelos comparables de la misma categoría (mismo tamaño o misma tarea de agentes en ARC-AGI-3), por lo que la comparación cuantitativa con alternativas externas no está disponible.

## Limitaciones y advertencias

- No es una mejora de propósito general: la model card lo declara explícitamente. Se entrenó sobre un único juego (`cd82-fb555c5d`) y se evaluó en rollouts de 32 episodios de ese mismo juego.
- El efecto medido es mínimo y está dentro del ruido: las diferencias entre brazos son de unas pocas centésimas de retorno con forma, con un ruido entre rollouts de aproximadamente 0,05.
- La tasa de nivel completado es prácticamente nula (0,000–0,031) en todos los rollouts documentados, con retornos con forma que van de -0,203 a 0,252.
- La torre visual no se entrenó: aunque el pipeline declarado es `image-text-to-text`, el actor nunca vio una imagen. Cualquier uso de la entrada visual se apoya en un componente heredado y no ajustado.
- Sesgos conocidos: no documentados en la información disponible. Al derivar del base Qwen3.8-27B, hereda los sesgos de sus datos de preentrenamiento, que tampoco se detallan.
- Riesgo de alucinación: no cuantificado en la información disponible. Los turnos "con referencia a fuente" oscilan entre 0,272 y 0,436 del total, lo que deja una fracción mayoritaria de turnos sin referencia explícita.
- Idiomas soportados: no declarados. No hay evaluación multilingüe de este checkpoint.
- Longitud de contexto: no declarada en la model card; debe consultarse la del base antes de usarlo en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sobre un juego concreto y no se han evaluado sus capacidades generales; el uso comercial no está respaldado por ninguna evaluación.
- Reproducibilidad condicionada: el estado completo con momentos del optimizador (≈351 GB) no está en HuggingFace, sino en Isambard-AI; el repositorio solo permite reconstruir el estado sin esos momentos.
- Estado del arte cuestionable para producción: 0 descargas y 0 likes, publicado el 2026-10-20 y actualizado el mismo día, sin señales de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han proporcionado en la información disponible enlaces adicionales a papers, blogs, repositorios de código, demos o exportaciones de W&B. La model card menciona componentes y artefactos internos del run (`cd82-play-v4/sft/rows_paired.jsonl.gz`, `megatron/args.json`, `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`, `checkpoints/checkpoints.md` en el dataset de RL, slime v0.3.2, Megatron-LM, Dr.GRPO, Isambard-AI, Claude Code CLI 2.1.270) sin facilitar sus URL.

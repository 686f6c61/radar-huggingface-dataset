# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter1

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter1 es un checkpoint de investigación publicado por Ziyan Wang (King's College London, con cómputo en Isambard-AI, BriCS/Universidad de Bristol) que parte de Qwen/Qwen3.8-27B y le aplica el experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. No es una mejora de propósito general del modelo base: el entrenamiento se hizo sobre un único juego y la evaluación se limita a rollouts de 32 episodios de ese mismo juego.

El modelo conserva la arquitectura `qwen3_5` y los 27.781.427.952 parámetros del original en bf16. La intervención consiste en filas de chat declarativas construidas a partir de un conjunto de conocimiento de 888 átomos (formas qa / rule / sentence, con apertura de *thinking* variada y respuesta visible al final del turno), mezcladas con filas ancla del modelo base, y un bloque posterior de RL con Dr.GRPO.

El checkpoint publicado corresponde a la iteración 1, es decir, un estado solo-SFT de la prueba 1. El guardián de colapso detuvo el run en el rollout 4 de RL porque el 43,8 % de los episodios consistían en una única llamada sin acción: la política había aprendido a enunciar un hecho como respuesta visible y cerrar el turno. Su interés es metodológico (estudio de si el conocimiento verificado del propio juego puede escribirse en los pesos), no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (`Qwen3_5ForConditionalGeneration`), con torre de visión (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`) heredadas sin cambios del modelo base |
| Parametros totales | 27.781.427.952 (27,8 mil millones) |
| Parametros activos | no disponible (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos bf16 en safetensors, sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16, 1199 tensores; repositorio de 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B (etiqueta `qwen3_5`), con una pila de texto (`model.language_model.*`, `lm_head`) más una torre de visión (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). Solo la pila de texto forma parte del estado entrenado en Megatron; la torre de visión y la cabeza MTP se copiaron sin modificar desde el checkpoint base porque el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. El autor verifica forma y dtype de los 1199 tensores y la identidad bit a bit de los tensores copiados.

Los datos de entrenamiento son filas de chat declarativas generadas a partir de un conjunto de conocimiento de 888 átomos, en tres formas (qa, rule, sentence), con apertura de *thinking* variada y respuesta visible al final del turno. Se mezclaron con filas ancla del modelo base con ratio 1.0: 1.810 filas de chat más 303 anclas, y 896 filas de chat por rollout de SFT. La programación fue de 4 rollouts solo-SFT (0-3) con reinicio de Adam y RL a partir del rollout 4. La pila de entrenamiento es slime v0.3.2 sobre Megatron-LM (TP4 × PP4, 16 motores de rollout SGLang a tp=1) en 4 nodos GH200 de Isambard-AI, con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento: el objetivo del experimento es que este resida en los pesos.

El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1-4 con tope de un nivel, retorno modelado sobre las limpiezas de nivel). La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de Qwen/Qwen3.8-27B desde el checkpoint torch_dist base.

## Capacidades

- Generación de texto y modo *thinking*: la plantilla de chat, el modo de razonamiento y la configuración de generación son los del modelo base, sin cambios declarados por el autor.
- Entrada multimodal imagen-texto: la torre de visión se conserva intacta, por lo que la arquitectura acepta imágenes, aunque el checkpoint no fue entrenado con ellas y no se han evaluado sus capacidades visuales.
- Internalización de conocimiento del juego `cd82-fb555c5d`: la política entrenada tiende a enunciar un hecho del conjunto de 888 átomos como respuesta visible y cerrar el turno.
- Interacción con herramientas MCP en el arnés de evaluación (`look`, `act`, `status`), siempre mediada por Claude Code CLI, no por un *tool calling* nativo verificado del modelo.
- Multilingüismo: no disponible (el autor no publica lista de idiomas).
- No se documentan capacidades de agente autónomo, multi-step reasoning general, matemáticas o código medidas para este checkpoint.

## Casos de uso

- Estudio de internalización de conocimiento (E2K): comparar este estado solo-SFT con iteraciones posteriores de la misma serie y con la variante que lleva el conocimiento en el prompt, para medir cuánto del conocimiento de 888 átomos queda realmente en los pesos y cuánto se pierde al retirar el contexto.
- Reproducción del experimento: el repositorio conserva `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime.
- Análisis de colapso de política: sirve como caso negativo documentado, ya que el 43,8 % de los episodios del rollout 4 fueron una llamada única sin acción y activaron el guardián de colapso; útil para diseñar detectores de deriva en entrenamientos con recompensa modelada.
- Línea base para ablaciones de RL: el primer rollout de RL tras un bloque solo-SFT lo juega la política SFT, así que este checkpoint mide el efecto aislado de las filas declarativas frente a otras ramas del estudio (conocimiento en prompt, otras formas de fila).
- Validación de pipelines de conversión Megatron torch_dist → HF: el autor incluye `E2K_VERIFY.json` (comparación contra el base) y `SHA256SUMS` para todo el repositorio, lo que permite auditar la fidelidad de la conversión tensor a tensor.
- Investigación sobre agentes en ARC-AGI-3: ejecutable con el arnés `knowledge_learning.loop.arc_mcp` bajo Claude Code CLI para reproducir los niveles 1-4 del juego `cd82-fb555c5d` con semilla 0.
- Docencia y divulgación técnica: ejemplo completo y trazable de un ciclo SFT + Dr.GRPO con recompensa modelada, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estándar equivalentes para este checkpoint.

Las únicas métricas del run son de juego, y el propio autor indica que no hay líneas de métricas de juego para este run en los logs de Slurm (remite al `wandb_export` del dataset). Lo que sí se documenta:

| Metrica del run | Valor |
|---|---|
| Rollouts solo-SFT | 4 (0-3) |
| Rollouts de RL ejecutados | hasta el rollout 4 (detenido por el guardián de colapso) |
| Episodios de una sola llamada sin acción en el rollout 4 | 43,8 % |
| Ruido entre rollouts de una misma rama | ~0,05 de retorno modelado |
| Pasos de optimizador por rollout | 8 |
| Muestras por llamada al LLM | 1 |
| Batch global | 4 |
| Episodios por rollout | 32 |
| Filas de chat por rollout de SFT | 896 |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan 55,6 GB, por lo que se necesita más de esa cifra solo para el modelo, más caché KV y activaciones; no se dispone de medidas publicadas de memoria total en ejecución.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB, H100 80 GB) es el mínimo razonable para una sola tarjeta en bf16; en caso contrario, reparto multi-GPU con `device_map="auto"` o paralelismo tensor.
- GPU de consumo: no cabe en 24 GB (RTX 4090) en bf16 y no hay variantes cuantizadas publicadas; el autor no ofrece soporte de GGUF ni de cuantización de 4 u 8 bits.
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`); vLLM y SGLang lo cargan igual que el modelo base según el autor. El entrenamiento usó 16 motores de rollout SGLang a tp=1 y TP4 × PP4 en Megatron-LM sobre 4 nodos GH200.
- Latencia y throughput: no disponible. El checkpoint completo con estado del optimizador (~351 GB) reside en Isambard-AI y no se distribuye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter1 | 27,8 mil millones | no disponible | sin benchmarks públicos; solo métricas de juego no registradas en logs | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (modelo base) | 27,8 mil millones | no disponible | no disponible en la información proporcionada | Apache-2.0 | HuggingFace |
| Otras iteraciones de la serie E2K-cd82 | mismo conjunto de tensores que el base | no disponible | no disponible | Apache-2.0 | listadas en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de modelos comparables de terceros (mismo tamaño o misma tarea) en la información proporcionada.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: el entrenamiento se hizo sobre un único juego y las diferencias entre ramas del estudio son de centésimas de retorno modelado.
- Política colapsada: el 43,8 % de los episodios del rollout 4 fueron una llamada única sin acción, comportamiento aprendido durante el bloque SFT (enunciar un hecho y cerrar el turno).
- Sin métricas de juego registradas: el autor indica que no hay líneas de métricas para este run en los logs de Slurm, por lo que el rendimiento real de juego de este checkpoint no está cuantificado en la model card.
- Sesgos: no evaluados ni documentados. Al derivar del modelo base, hereda los sesgos de Qwen3.8-27B, pero no hay análisis específico para este checkpoint.
- Riesgo de alucinación: no evaluado. El formato entrenado (afirmar un hecho del conjunto de conocimiento como respuesta visible) puede favorecer respuestas asertivas no verificadas fuera del dominio del juego.
- Idiomas: no se publica lista de idiomas soportados ni evaluación multilingüe.
- Visión: la torre visual se copia sin entrenar y el actor nunca vio una imagen; no hay ninguna garantía sobre el comportamiento imagen-texto pese a la etiqueta `image-text-to-text`.
- Licencia Apache-2.0 heredada, que permite uso comercial, pero el propio autor desaconseja implícitamente tratarlo como modelo de producción por su naturaleza de checkpoint de investigación.
- Validación externa nula: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de terceros.
- Reproducibilidad dependiente del arnés: los resultados de juego están ligados a Claude Code CLI 2.1.270, a las herramientas MCP `look`/`act`/`status` y a la semilla de motor 0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset del run (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: repositorio `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`); no se proporciona URL directa en la información disponible.
- No se han encontrado en la información proporcionada artículos, blogs ni demos adicionales.

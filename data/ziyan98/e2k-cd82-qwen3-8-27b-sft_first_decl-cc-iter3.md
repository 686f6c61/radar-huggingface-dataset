# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter3 es un checkpoint de investigación publicado por Ziyan Wang (King's College London) a partir de `Qwen/Qwen3.8-27B`. No es un ajuste fino de propósito general: es el resultado de un experimento de "internalización de conocimiento" (E2K) sobre un único juego de ARC-AGI-3 (`cd82-fb555c5d`), en el que se intenta escribir en los pesos, mediante filas de chat declarativas, conocimiento verificado extraído de la propia partida del modelo, para después mejorarlo con RL sobre episodios reales. Este repositorio corresponde a la iteración 3 del trial 1 (bloque solo SFT) dentro de la ejecución `sft_first_decl-cc`, marcada por el autor como resultado negativo (trial colapsado).

El modelo conserva la arquitectura y los pesos del base Qwen3.8-27B (27.781.427.952 parámetros, bf16 safetensors, 1.199 tensores), con la pila de texto entrenada en Megatron-LM y la torre de visión y la cabeza de predicción multi-token copiadas sin cambios del checkpoint original. El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen, pese a que la pipeline declarada sea `image-text-to-text`.

Su relevancia es metodológica, no de rendimiento: documenta con detalle el pipeline SFT + Dr.GRPO sobre slime/Megatron y el punto exacto en el que la política aprende a responder con un hecho y cerrar el turno, lo que provocó el colapso de la partida en la primera iteración de RL (43,8 % de episodios con una sola llamada sin acción). No se han publicado métricas de juego ni resultados de benchmarks para esta iteración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal familia Qwen3_5 (pila de texto + torre de visión + cabeza MTP); clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible (heredada del modelo base, no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible; solo se publican pesos bf16 safetensors (sin GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16, 1.199 tensores, repositorio de 55,6 GB |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Tarea declarada (pipeline) | `image-text-to-text` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del base Qwen3.8-27B: un transformer multimodal con pila de lenguaje (`model.language_model.*`, `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). Solo la pila de texto fue entrenada; la torre de visión y la cabeza MTP se copiaron sin modificar desde el checkpoint base y el autor verificó forma y dtype de todos los tensores, además de la identidad bit a bit de los tensores copiados. La conversión Megatron torch_dist → HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming, y el mismo conversor reproduce los safetensors originales del base bit a bit; `E2K_VERIFY.json` recoge la comparación y `SHA256SUMS` cubre todos los ficheros.

El entrenamiento parte de un conjunto de conocimiento de 888 átomos, convertidos en filas de chat declarativas (formatos qa / rule / sentence, con apertura de *thinking* variada y respuesta visible al final), mezcladas con filas ancla del modelo base (proporción 1,0; 1.810 filas de chat + 303 anclas, 896 filas de chat por rollout de SFT). La ejecución usó 4 rollouts solo SFT (0–3) con reset de Adam y RL a partir del rollout 4. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI; el algoritmo es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, retorno con *shaping* sobre los niveles completados).

| Hiperparámetro / componente | Valor |
|---|---|
| Filas SFT | 1.810 de chat + 303 anclas (896 de chat por rollout) |
| Conjunto de conocimiento | 888 átomos (qa / rule / sentence) |
| Rollouts solo SFT | 4 (0–3), reset de Adam |
| Algoritmo RL | Dr.GRPO con pérdida por token |
| Learning rate | 5e-6, bf16 |
| Batch global / pasos por rollout | 4 / 8 (rollout de 32 episodios) |
| Paralelismo | TP4 × PP4, 16 motores SGLang tp=1 |
| Hardware de entrenamiento | 4 nodos GH200 (Isambard-AI, BriCS) |
| Parada | Guarda de colapso en el rollout RL 4 (43,8 % de episodios con una sola llamada sin acción) |

## Capacidades

- Generación de texto conversacional en formato chat, con la plantilla y el modo *thinking* intactos respecto al modelo base.
- Emisión de conocimiento declarativo: el ajuste enseña a enunciar un hecho como respuesta visible y terminar el turno, comportamiento que define este checkpoint.
- Razonamiento multi-paso vía *thinking*, heredado del base Qwen3.8-27B (no evaluado en esta iteración).
- Uso de herramientas MCP en el arnés de experimentación: llamadas `look`, `act` y `status` sobre el juego ARC-AGI-3.
- Entrada de imagen soportada a nivel de arquitectura (torre visual presente y funcional según el base), aunque el modelo no fue entrenado con imágenes y no se ha evaluado en esa modalidad.
- Decodificación especulativa potencial gracias a la cabeza MTP copiada del base, en caso de que el runtime la aproveche.
- Capacidades multilingües: no disponibles (no se documenta ningún idioma en esta ficha).

## Casos de uso

- Estudio de internalización de conocimiento (E2K): el checkpoint sirve como referencia para medir si las filas SFT declarativas escriben hechos en los pesos; el export de W&B del dataset de RL incluye la NLL de conocimiento por paso SFT (`train/sft_cite_nll_sum / train/sft_cite_tokens`) para comparar entre brazos del experimento.
- Reproducción del pipeline SFT → RL: el directorio `megatron/` guarda `common.pt` (argumentos de Megatron y estado del scheduler del optimizador), `args.json`, `latest_checkpointed_iteration.txt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Análisis de colapso y degeneración en agentes RL: esta iteración es el punto exacto en el que la política aprende a contestar con un hecho y cerrar el turno, con el 43,8 % de episodios reducidos a una llamada sin acción; es un material directo para estudiar modos de fallo de agentes y posibles recompensas mal especificadas.
- Evaluación de agentes sobre ARC-AGI-3: cargando el modelo con el arnés `knowledge_learning.loop.arc_mcp` y Claude Code CLI, se pueden repetir rollouts de 32 episodios en el juego `cd82-fb555c5d` (semilla 0, niveles 1–4) y comparar el retorno con *shaping* frente a otros brazos del estudio.
- Punto de partida para RL posterior: al conservar config, tokenizer, plantilla de chat y generation config del base, se puede servir con vLLM o SGLang y continuar el entrenamiento desde el rollout 4 sin recalibrar el runtime.
- Auditoría de conversiones Megatron → HF: `E2K_VERIFY.json` y `SHA256SUMS` documentan la verificación de formas y dtypes y la identidad bit a bit de los tensores copiados, útiles como caso de prueba de pipelines de conversión en proyectos propios.
- Pruebas de regresión de plantillas de chat y modo *thinking*: al no haberse tocado la plantilla ni la configuración de generación, el checkpoint puede usarse para validar que un cambio en el arnés no altera el formato de respuesta esperado del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica que no hay líneas de métricas de juego para esta ejecución en los logs de Slurm (remite al `wandb_export` del dataset) y que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con *shaping*; además, las diferencias entre brazos son de centésimas. No se debe interpretar este checkpoint como una mejora medible de Qwen3.8-27B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55,6 GB solo de pesos, más caché KV y *overheads* del runtime (estimación; no se publican cifras oficiales).
- GPU recomendadas: una H100 80 GB, A100 80 GB o GH200 por réplica; el entrenamiento original usó 4 nodos GH200 con TP4 × PP4.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16. Requeriría cuantización de 4 bits (aproximadamente 14–16 GB), pero no hay GGUF, AWQ ni GPTQ publicados por el autor, así que habría que generarlos.
- Opciones de despliegue: transformers (`Qwen3_5ForConditionalGeneration` con `dtype="bfloat16"` y `device_map="auto"`), vLLM y SGLang (el autor indica que carga igual que el base). No se documenta soporte en llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.
- Almacenamiento: 55,6 GB el repositorio de pesos; el checkpoint completo con estado del optimizador en Isambard-AI ocupa aproximadamente 351 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter3 | 27,78 mil millones | No disponible | Apache-2.0 | safetensors bf16 | Checkpoint de investigación, solo SFT, entrenado en un único juego ARC-AGI-3 |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | No disponible | Apache-2.0 | safetensors bf16 | Modelo generalista original; misma arquitectura, plantilla y configuración de generación |
| Otras iteraciones de la serie E2K-cd82 | 27,78 mil millones | No disponible | Apache-2.0 | safetensors bf16 | Un repositorio por iteración guardada, incluidos los rollouts RL posteriores; listadas en `checkpoints/checkpoints.md` del dataset de RL |
| Alternativas externas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: se entrenó con un solo juego (`cd82-fb555c5d`), se evaluó con rollouts de 32 episodios de ese mismo juego y las diferencias entre brazos son de centésimas de retorno con *shaping*.
- Comportamiento degenerado conocido: la política aprendió a enunciar un hecho como respuesta visible y cerrar el turno, lo que colapsó la partida en el primer rollout de RL; la guarda de colapso detuvo la ejecución con el 43,8 % de episodios reducidos a una sola llamada sin acción.
- Entrenamiento exclusivamente de texto: la torre visual se copió sin modificar y nunca se entrenó con imágenes, por lo que no hay garantía de calidad en tareas imagen-texto pese a la pipeline declarada.
- Sin benchmarks ni métricas de juego publicadas para esta iteración; no hay base empírica para afirmar mejoras en razonamiento, código o matemáticas.
- Riesgo de alucinación: no evaluado en esta iteración; el ajuste declarativo puede favorecer respuestas afirmativas aunque el hecho no aplique al contexto.
- Idiomas soportados y longitud de contexto no documentados en la ficha del autor; dependen del modelo base y no se han verificado aquí.
- Licencia Apache-2.0, por lo que el uso comercial está permitido, pero el checkpoint es un artefacto de investigación sin validación para producción y sin garantías del autor.
- Repositorio sin descargas ni likes y con estado de entrenamiento parcial (sin momentos del optimizador en el repositorio de pesos); reproducir el entrenamiento requiere el checkpoint completo alojado en Isambard-AI.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL de la ejecución (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código del proyecto: repositorio `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la búsqueda web realizada.

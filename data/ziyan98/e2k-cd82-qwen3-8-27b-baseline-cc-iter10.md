# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter10

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-cc-iter10 es un checkpoint de investigación derivado de `Qwen/Qwen3.8-27B` (27.781.427.952 parámetros), publicado por el usuario `ziyan98`. No es un ajuste de propósito general: es el brazo de control de un experimento de internalización de conocimiento (E2K, *experience-to-knowledge*) sobre el juego `cd82-fb555c5d` de ARC-AGI-3, en el que se estudia si el conocimiento verificado que un modelo extrae de su propia partida puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales. Este checkpoint concreto corresponde al brazo `baseline-cc` (RL puro, sin filas SFT) tras la iteración 10 de Megatron.

El interés técnico no está en su rendimiento como modelo de chat —que no se ha evaluado ni modificado respecto al base—, sino en la infraestructura y la trazabilidad que documenta: entrenamiento con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) con 16 motores de rollout SGLang en 4 nodos GH200 de Isambard-AI, usando Dr.GRPO con un único ejemplo de entrenamiento por llamada al LLM, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios. La model card advierte explícitamente de que las diferencias entre brazos son de unas pocas centésimas de retorno con forma, dentro del ruido entre rollouts de un mismo brazo (≈0,05).

Los pesos se publican en bf16 safetensors con el mismo conjunto de tensores y formas que el modelo base (1199 tensores). El stack de texto (`model.language_model.*`, `lm_head`) proviene del estado entrenado en Megatron; la torre de visión (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) se copian sin cambios del checkpoint base, ya que el entrenamiento fue solo de texto y el actor nunca vio una imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (stack de texto + torre de visión + cabeza MTP); clase de transformers `qwen3_5` |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica: no se describe como MoE (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el config es el del modelo base) |
| Tipos de cuantizacion | No se publican cuantizaciones; solo pesos bf16 safetensors |
| Idiomas soportados | No disponible (los configs de tokenizer y chat template son los del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bf16, 1199 tensores; repo de 55,6 GB |

## Arquitectura y entrenamiento

Arquitectura heredada íntegramente de Qwen3.8-27B: un transformer multimodal con torre visual y cabeza de predicción multi-token (MTP), cargable mediante `Qwen3_5ForConditionalGeneration`. En este checkpoint solo se ha entrenado el stack de texto; `model.visual.*` y `mtp.*` se copiaron sin modificar desde el checkpoint base, con verificación de forma y dtype de cada tensor y de identidad bit a bit de los tensores copiados. La conversión de Megatron `torch_dist` a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por streaming y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce los safetensors originales de `Qwen/Qwen3.8-27B` bit a bit, y `E2K_VERIFY.json` recoge la comparación contra el base.

El entrenamiento es RL puro (sin filas SFT en este brazo) con Dr.GRPO: `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, un ejemplo de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. Stack: slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, sobre 4 nodos GH200 de Isambard-AI; se ejecutaron rollouts 0–11 en tres cadenas de jobs con reanudación desde la última iteración. El arnés de juego es Claude Code CLI 2.1.270 conduciendo las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, retorno con forma sobre los niveles completados). El prompt de RL nunca contiene conocimiento: la hipótesis es que este se internalice en los pesos, no que se reciba en contexto.

## Capacidades

- Generación de texto conversacional con la plantilla de chat y el modo *thinking* originales de Qwen3.8-27B, sin cambios.
- Entrada image-text-to-text a nivel de arquitectura (torre visual presente y funcional), aunque la torre no fue entrenada en este experimento.
- Juego interactivo de un único entorno ARC-AGI-3 (`cd82-fb555c5d`) mediante llamadas a herramientas MCP de tipo `look` / `act` / `status`, con razonamiento multi-paso.
- Planificación y acción secuencial con presupuesto de tokens de pensamiento elevado (mediana de 4345–5859 tokens de *think* por rollout en las iteraciones registradas).
- Compatibilidad con vLLM y SGLang para despliegue, igual que el modelo base.
- No se documentan capacidades específicas de *tool calling* genérico, agentes de propósito general ni multilingüismo más allá de lo que herede del base (no verificado en esta ficha).

## Casos de uso

- Replicación del experimento E2K: cargar este checkpoint como brazo de control (RL puro) y compararlo con los brazos con filas SFT sobre el mismo juego y la misma semilla de motor, usando las métricas por rollout publicadas.
- Estudio de la dinámica de Dr.GRPO en tareas de horizonte largo: los registros de 12 rollouts con `clear rate`, retorno con forma, `step change`, `step no-op` y tokens de pensamiento permiten analizar estabilidad del entrenamiento con batch global 4 y 8 pasos por rollout.
- Validación de pipelines de conversión Megatron `torch_dist` → HF: el repositorio incluye `megatron/args.json`, `common.pt`, el cursor `global_dataset_state_dict_<N>.pt` y `E2K_VERIFY.json`, lo que permite reproducir el proceso y comprobar la identidad de tensores.
- Reanudación de entrenamiento: el estado (salvo momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime, útil para continuar la cadena de iteraciones en otro clúster.
- Evaluación de agentes sobre ARC-AGI-3: sirve como política de referencia para medir cuánto del rendimiento en `cd82-fb555c5d` proviene del RL frente a la inicialización del modelo base.
- Auditoría de artefactos de investigación: `SHA256SUMS` cubre todos los ficheros y `E2K_CONVERSION.json` lista los activos copiados del base, lo que facilita verificar procedencia en revisiones internas.
- Despliegue como modelo multimodal de 27,78 B en bf16 cuando se necesite una instancia de Qwen3.8-27B con los mismos configs, a sabiendas de que el stack de texto ha sido desplazado por el RL hacia una única tarea de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de juego por rollout del propio run, extraídas de los logs de los jobs. Se reproduce la cadena principal (`6565902`, rollouts 4–11); los rollouts 0–3 de las cadenas `6529937`, `6536263`, `6548427` y `6554904` presentan `clear rate` entre 0,000 y 0,031 y retorno con forma entre -0,259 y -0,119.

| Rollout | Clear rate | Retorno con forma | Step change | Step no-op | Think tokens p50 |
|---:|---:|---:|---:|---:|---:|
| 4 | 0,000 | -0,020 | 0,073 | 0,339 | 4779,0 |
| 5 | 0,000 | -0,119 | 0,097 | 0,331 | 5209,0 |
| 6 | 0,000 | -0,123 | 0,097 | 0,336 | 4956,5 |
| 7 | 0,000 | -0,091 | 0,102 | 0,327 | 4345,0 |
| 8 | 0,031 | -0,062 | 0,065 | 0,324 | 5840,0 |
| 9 | 0,000 | -0,136 | 0,054 | 0,345 | 5750,0 |
| 10 | 0,062 | 0,078 | 0,110 | 0,277 | 5578,5 |
| 11 | 0,031 | 0,058 | 0,105 | 0,278 | 5859,0 |

Contexto aportado por el autor: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y las diferencias entre brazos del estudio son de unas pocas centésimas, por lo que estas cifras no deben interpretarse como una mejora sustantiva del modelo base.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB (27,78 B de parámetros). Es el mínimo de VRAM para cargar el checkpoint sin cuantizar, antes de caché KV y activaciones.
- Entrenamiento documentado: 4 nodos GH200 de Isambard-AI, Megatron-LM TP4 × PP4 más 16 motores de rollout SGLang a tp=1. El checkpoint completo con estado del optimizador ocupa ≈351 GB y permanece en Isambard-AI.
- GPU recomendadas para inferencia en bf16: A100 80 GB, H100 80/96 GB, H200 o GH200. No cabe en una GPU consumer de 24 GB en bf16; requeriría tensor parallel entre varias GPU o cuantización no publicada.
- GPU consumer: no hay cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repositorio, por lo que no se puede afirmar compatibilidad con RTX 4090 o inferiores sin convertir los pesos por cuenta propia.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`, más vLLM y SGLang, que lo cargan «como el modelo base».
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por paso para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-baseline-cc-iter10 | 27,78 B | No disponible | RL Dr.GRPO sobre el juego `cd82-fb555c5d` de ARC-AGI-3 | Apache 2.0 | Pesos bf16 en HF; checkpoint completo con optimizador solo en Isambard-AI |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible en esta informacion | Preentrenamiento y alineamiento generalistas | Apache 2.0 (segun el base) | Pesos completos en HF |
| Brazos SFT del mismo estudio E2K | 27,78 B | No disponible | Filas supervisadas de conocimiento verificado, con o sin RL posterior | Apache 2.0 | Repositorios por iteracion listados en `checkpoints/checkpoints.md` del dataset |
| Otros modelos de ~27-30 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks que permitan comparar este checkpoint con alternativas de terceros de tamaño similar; la comparación relevante es contra el modelo base y contra los demás brazos del mismo experimento.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un único juego, evaluado con rollouts de 32 episodios de ese juego, y las diferencias entre brazos están dentro del ruido (≈0,05 de retorno con forma).
- Riesgo de degradación de capacidades generales: el stack de texto ha sido modificado por RL sobre una tarea muy concreta; no se han publicado evaluaciones que confirmen que conserva el rendimiento del base en chat, código o matemáticas.
- La torre de visión y la cabeza MTP no fueron entrenadas (el actor nunca vio una imagen), por lo que las capacidades multimodales no están validadas en este checkpoint.
- El prompt de RL nunca contiene conocimiento; cualquier expectativa de «consultar» conocimiento en contexto no está soportada por el diseño del experimento.
- Ausencia total de cuantizaciones oficiales: el despliegue en hardware limitado exige conversión propia y validación adicional.
- Idiomas soportados no documentados; no se ha verificado el comportamiento multilingüe tras el RL.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un derivado de Qwen3.8-27B, hereda los del base sin que el autor aporte mediciones.
- Trazabilidad parcial en HF: los pesos están completos, pero el estado del optimizador (≈351 GB) no se publica; reproducir el entrenamiento exacto requiere el dataset y el clúster originales.
- Las métricas de juego proceden de logs de jobs parseados, no de un arnés de evaluación independiente.
- Licencia Apache 2.0 permite uso comercial, pero el uso comercial de un checkpoint de investigación de una sola tarea carece de sentido práctico sin una evaluación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter10
- Dataset de RL del experimento (incluye `knowledge-set/`, `checkpoints/checkpoints.md` y el export de W&B): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes para este modelo; los resultados devueltos tratan sobre la carga global de trastornos neurológicos y no guardan relación con el checkpoint.

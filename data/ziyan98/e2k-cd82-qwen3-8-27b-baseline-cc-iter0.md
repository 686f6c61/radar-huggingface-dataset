# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-cc-iter0 es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace) a partir del modelo base Qwen/Qwen3.8-27B. No se trata de un ajuste orientado a mejora general, sino del brazo de control de un experimento de internalización de conocimiento denominado E2K, ejecutado sobre el juego `cd82-fb555c5d` de ARC-AGI-3. El objetivo del estudio es determinar si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos.

Este checkpoint concreto corresponde al arm `baseline-cc` (línea base de RL puro) en la iteración 0 de Megatron: no ha recibido ninguna fila de SFT, solo rollouts 0-11 de Dr.GRPO. Conserva la arquitectura y el tokenizador del modelo base (clase `Qwen3_5ForConditionalGeneration`, 27.781.427.952 parámetros y 1199 tensores), con el stack de texto entrenado y la torre de visión copiada sin modificar, ya que el entrenamiento fue exclusivamente de texto.

Su relevancia es metodológica, no de producto: sirve como referencia frente a los brazos con conocimiento inyectado de la misma serie y documenta infraestructura de RL a gran escala (slime v0.3.2 sobre Megatron-LM y SGLang en 4 nodos GH200 de Isambard-AI). El autor advierte explícitamente de que las diferencias entre brazos son de centésimas en retorno con forma y que el modelo no es una mejora de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`qwen3_5`), clase `Qwen3_5ForConditionalGeneration`; 1199 tensores con los mismos nombres y formas que el modelo base |
| Parametros totales | 27.781.427.952 (~27,78 B) segun safetensors |
| Parametros activos | no disponible (la informacion proporcionada no indica configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos bf16 safetensors (no hay GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en bf16; se conserva el estado Megatron torch_dist en `megatron/` |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | `image-text-to-text` |
| Modelo base | Qwen/Qwen3.8-27B |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base Qwen3.8-27B: stack de texto (`model.language_model.*` y `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). Solo el stack de texto fue entrenado; la torre de visión y la cabeza MTP nunca formaron parte del modelo Megatron y se copiaron sin cambios desde el checkpoint base, con verificación de forma, dtype e identidad bit a bit de los tensores copiados (`E2K_VERIFY.json`, modo fast). La conversión de Megatron torch_dist a HF se realizó con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en modo de baja memoria, y el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B.

El entrenamiento consistió en RL puro con Dr.GRPO sobre rollouts 0-11, sin fase SFT. La infraestructura fue slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1, sobre 4 nodos GH200 de Isambard-AI. Hiperparámetros documentados: `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al modelo, batch global 4, 8 pasos de optimizador por cada rollout de 32 episodios, learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento, de modo que cualquier conocimiento solo podría proceder de los pesos.

El entorno de juego se ejecutó con el harness `knowledge_learning.loop.arc_mcp`, exponiendo las herramientas MCP `look`, `act` y `status`, controladas por Claude Code CLI 2.1.270, con semilla de motor 0, niveles 1-4 con tope de un nivel y retorno con forma sobre los niveles completados. El estado completo de entrenamiento (aproximadamente 351 GB con momentos del optimizador) permanece en Isambard-AI; en el repositorio se conservan `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso heredados del modelo base Qwen3.8-27B.
- Modo thinking activo, con el chat template sin cambios respecto al base; la mediana de tokens de pensamiento observada en juego está entre 4345 y 5859 por rollout.
- Uso de herramientas mediante protocolo MCP (`look`, `act`, `status`) en el bucle de juego, dirigido externamente por Claude Code CLI.
- Capacidad multimodal latente (torre visual presente y cargable con `AutoProcessor`), aunque el adaptador entrenado es solo de texto y el actor nunca vio una imagen durante el entrenamiento.
- Juego interactivo con recompensa dispersa en ARC-AGI-3: el modelo produce acciones paso a paso sobre una única tarea.
- No se documentan capacidades específicas de código, matemáticas, audio ni function calling genérico más allá del bucle MCP del experimento.

## Casos de uso

- Reproducción del experimento E2K: cargar este checkpoint como brazo de control `baseline-cc` y compararlo con los brazos con conocimiento inyectado de la misma serie, usando la misma semilla de motor (0) y el mismo harness MCP.
- Ablación de conocimiento internalizado: al no contener filas SFT, permite aislar cuánto del rendimiento en el juego procede del RL puro frente al conocimiento escrito en pesos.
- Estudio de RL con recompensa dispersa: los registros de rollouts (clear rate, shaped return, step change, step no-op) sirven como serie temporal para analizar estabilidad de Dr.GRPO en horizontes de 32 episodios.
- Investigación sobre agentes y tool calling: el par `look`/`act` con estado textual es un banco de pruebas reproducible para medir cómo un LLM de ~28 B encadena acciones bajo un presupuesto de tokens de pensamiento de varios miles.
- Auditoría de pipelines de conversión Megatron a HF: los ficheros `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS` permiten validar la fidelidad de la conversión tensor a tensor y reutilizar el conversor `convert_torch_dist_to_hf_lowmem.py`.
- Reproducibilidad de infraestructura de RL: `megatron/args.json` documenta cada argumento del job, útil para reconstruir el estado de entrenamiento con `convert_hf_to_torch_dist.py` de slime y replicar la topología TP4 × PP4 con 16 motores SGLang.
- Docencia y divulgación sobre resultados negativos: el propio autor caracteriza el checkpoint como un estudio de si el conocimiento verificado se internaliza, con diferencias de centésimas en retorno, lo que lo convierte en material ilustrativo de cómo se reporta un resultado no concluyente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor solo reporta métricas de juego por rollout, extraídas de los logs de los jobs:

| job | rollout | clear rate | shaped return | step change | step no-op | think tokens p50 |
|---|---:|---:|---:|---:|---:|---:|
| 6529937 | 0 | 0,000 | -0,181 | 0,092 | 0,377 | no disponible |
| 6536263 | 0 | 0,000 | -0,203 | 0,085 | 0,385 | no disponible |
| 6548427 | 0 | 0,000 | -0,259 | 0,089 | 0,364 | 5146,0 |
| 6529937 | 1 | 0,000 | -0,119 | 0,076 | 0,363 | no disponible |
| 6548427 | 1 | 0,000 | -0,252 | 0,138 | 0,321 | 4772,5 |
| 6548427 | 2 | 0,031 | -0,128 | 0,119 | 0,328 | 4451,0 |
| 6554904 | 2 | 0,000 | -0,186 | 0,116 | 0,331 | 4365,0 |
| 6554904 | 3 | 0,000 | -0,025 | 0,091 | 0,313 | 4965,0 |
| 6565902 | 4 | 0,000 | -0,020 | 0,073 | 0,339 | 4779,0 |
| 6565902 | 5 | 0,000 | -0,119 | 0,097 | 0,331 | 5209,0 |
| 6565902 | 6 | 0,000 | -0,123 | 0,097 | 0,336 | 4956,5 |
| 6565902 | 7 | 0,000 | -0,091 | 0,102 | 0,327 | 4345,0 |
| 6565902 | 8 | 0,031 | -0,062 | 0,065 | 0,324 | 5840,0 |
| 6565902 | 9 | 0,000 | -0,136 | 0,054 | 0,345 | 5750,0 |
| 6565902 | 10 | 0,062 | 0,078 | 0,110 | 0,277 | 5578,5 |
| 6565902 | 11 | 0,031 | 0,058 | 0,105 | 0,278 | 5859,0 |

Contexto aportado por el autor: el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno con forma, y las diferencias entre brazos son de centésimas, por lo que estas cifras no sostienen una conclusión de mejora. El mejor retorno con forma de la serie (+0,078) se alcanza en el rollout 10, coincidiendo con la clear rate máxima (0,062) y el mínimo de step no-op (0,277).

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan 55,6 GB, por lo que se necesitan al menos 60-70 GB contando caché KV y overhead del runtime.
- GPU recomendadas: H100 80 GB, GH200 (la misma plataforma usada en entrenamiento), A100 80 GB en configuración ajustada; en A100 40 GB o RTX 4090 (24 GB) no cabe en bf16 sin cuantización.
- Cabe en GPU consumer solo con cuantización manual a 8 bits (~28 GB, fuera de 24 GB) o 4 bits (~14-16 GB, viable en RTX 4090/3090); el repositorio no publica checkpoints cuantizados, así que habría que generarlos.
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`); vLLM y SGLang lo cargan igual que el modelo base.
- Reproducción del entrenamiento: 4 nodos GH200 con Megatron-LM TP4 × PP4 y 16 motores SGLang a tp=1; el checkpoint completo con estado del optimizador (~351 GB) no está en el repositorio, solo en Isambard-AI.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-...-baseline-cc-iter0 (este) | 27,78 B | no disponible | RL puro Dr.GRPO, rollouts 0-11, sin SFT | Apache-2.0 | Pesos bf16 en HF; estado completo solo en Isambard-AI |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo base multimodal sin el experimento E2K | Apache-2.0 (segun el checkpoint derivado) | Publico en HF |
| Brazos con SFT de la misma serie E2K | 27,78 B | no disponible | SFT sobre conocimiento verificado + RL | Apache-2.0 | Listados en `checkpoints/checkpoints.md` del dataset de RL |
| Otras alternativas de ~27-30 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación significativa es interna a la serie E2K: mismo modelo base, mismos datos de juego y misma topología, con la única diferencia del conocimiento inyectado. No se dispone de datos de benchmarks frente a modelos externos de tamaño similar, por lo que cualquier comparación de rendimiento general sería especulativa.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: fue entrenado sobre un único juego (`cd82-fb555c5d`) y evaluado con rollouts de 32 episodios del mismo juego.
- Las diferencias frente a otros brazos son de centésimas en retorno con forma, dentro del ruido de aproximadamente 0,05 entre rollouts; no debe interpretarse como ganancia demostrada.
- La torre de visión y la cabeza MTP se copiaron sin entrenar y el actor nunca vio una imagen: el pipeline declarado `image-text-to-text` no implica capacidad visual adaptada al experimento.
- La model card no documenta idiomas soportados, longitud de contexto ni evaluación de sesgos; el riesgo de alucinación en uso conversacional general no está medido.
- El checkpoint es una iteración intermedia de una cadena de jobs; reanudar requiere el estado Megatron y el cursor de datos, no solo los safetensors.
- El repositorio no incluye cuantizaciones ni GGUF, y no hay métricas de latencia o throughput publicadas.
- Licencia Apache-2.0 permite uso comercial, pero el valor práctico fuera del estudio es limitado; conviene citar el dataset y la serie completa si se reutiliza.
- Los resultados de búsqueda web asociados a esta consulta no contenían material técnico relevante sobre el modelo; no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del experimento (referenciado en la model card): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Paper, blog o demo oficial: no disponible en la información proporcionada
- Repositorio de código del harness o de slime: no disponible como enlace en la información proporcionada (se mencionan `knowledge_learning.loop.arc_mcp` y slime v0.3.2 sin URL)

# ziyan98/E2K-cd82-Qwen3.8-27B-sft_inter_decl-cc2-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-sft_inter_decl-cc2-iter0 es un checkpoint de investigación publicado por Ziyan Wang (King's College London) que consiste en un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.8-27B, de 27.781.427.952 parámetros (~27,8 B) y pesos en bf16 safetensors. No es un modelo nuevo ni una mejora general del modelo base: es la iteración 0 de la ejecución `sft_inter_decl-cc2`, perteneciente al experimento E2K de "internalización de conocimiento", en el que se intenta escribir en los pesos, mediante filas supervisadas, conocimiento verificado extraído de las propias partidas del modelo en el juego `cd82-fb555c5d` de ARC-AGI-3, para después mejorarlo con RL sobre episodios reales de varios pasos.

Su relevancia es metodológica, no de producto: documenta un resultado negativo (la prueba se canceló durante su primer rollout de RL cuando el 45 % de los episodios terminados eran de una sola llamada) y sirve como material reproducible para estudiar si el conocimiento procedente de la propia experiencia de un agente puede internalizarse en los pesos. El autor advierte explícitamente de que el entrenamiento se hizo sobre un único juego, que la evaluación se limita a rollouts de 32 episodios de ese juego y que las diferencias entre brazos experimentales son de unas pocas centésimas de retorno conformado (*shaped return*).

La arquitectura es la del modelo base (`qwen3_5`, clase `Qwen3_5ForConditionalGeneration`, pipeline `image-text-to-text`), pero el entrenamiento fue exclusivamente de texto: la torre visual `model.visual.*` y la cabeza de predicción multi-token `mtp.*` se copiaron sin modificar desde el checkpoint base, ya que el actor nunca vio una imagen. El repositorio ocupa 55,6 GB y conserva 1199 tensores con las mismas formas que el modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`qwen3_5`), transformer multimodal `Qwen3_5ForConditionalGeneration`; solo se entrenó la pila de texto (`model.language_model.*`, `lm_head`) |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica: no se documenta como MoE |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, sin especificar) |
| Tipos de cuantización | No disponible: solo se publican pesos bf16 safetensors; no se documentan conversiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponibles (la model card no documenta cobertura lingüística; se hereda la del modelo base) |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16, 1199 tensores; el directorio `megatron/` incluye `common.pt`, `args.json`, `latest_checkpointed_iteration.txt` y `global_dataset_state_dict_<N>.pt` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y conserva su pila de texto, tokenizador, plantilla de chat, configuración de generación y configuración del procesador. La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming por bloques con `convert_torch_dist_to_hf_lowmem.py`; el autor indica que el mismo conversor reproduce bit a bit los safetensors originales de Qwen/Qwen3.8-27B. Se verificaron formas y tipos de todos los tensores, y `E2K_VERIFY.json` recoge la comparación con el modelo base y `SHA256SUMS` cubre todos los ficheros.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang con tp=1, en 4 nodos GH200 de Isambard-AI, en bf16 y con backend flash-attn 2.8.3. El algoritmo de RL es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), con una muestra de entrenamiento por llamada al LLM, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios, a una tasa de aprendizaje de 5e-6. Las filas de SFT corresponden a la prueba 2 y sus anclas (formas qa + rule, ratio de anclas 1,5, 448 filas de chat por rollout de SFT, final de texto). El calendario fue de 2 rollouts solo de SFT (0–1) y después SFT y RL alternos; la iteración 0 publicada es un checkpoint solo de SFT de la prueba 3. El prompt de RL nunca contiene conocimiento explícito. El arnés de juego fue Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel.

## Capacidades

- Generación de texto y razonamiento propios del modelo base Qwen3.8-27B, sin cambios en la plantilla de chat ni en el modo de razonamiento (*thinking mode*).
- Entrada multimodal declarada por el pipeline (`image-text-to-text`) y por la presencia de la torre visual, aunque dicha torre se copió sin entrenar: no hay evidencia de mejora ni de degradación medida en tareas de visión.
- No se documenta soporte de *tool calling* ni de *function calling* a nivel de modelo en la información disponible; las herramientas MCP del arnés pertenecen al entorno de evaluación, no al modelo.
- No se documentan capacidades de agente, razonamiento multi-paso o planificación más allá del comportamiento observado en el juego ARC-AGI-3 durante los rollouts.
- Capacidades multilingües: no disponibles en la documentación.
- Capacidad específica del experimento: reproducir el punto de partida (iteración 0, solo SFT) de la serie `sft_inter_decl-cc2` para comparar contra iteraciones posteriores con RL.

## Casos de uso

- Reproducción del experimento E2K: cargar este checkpoint como línea base de la iteración 0 y compararlo con las iteraciones posteriores de la misma serie, listadas en `checkpoints/checkpoints.md` del dataset de RL.
- Estudio de internalización de conocimiento: analizar si las 448 filas de chat por rollout de SFT (formas qa + rule, ratio de anclas 1,5) modifican el comportamiento del modelo en el juego `cd82-fb555c5d` sin aportar el conocimiento en el prompt.
- Análisis de resultados negativos: documentar el colapso del brazo experimental, que se canceló cuando el 45 % de los episodios terminados eran de una sola llamada, y usarlo como referencia en estudios de estabilidad de RL sobre agentes.
- Ablación de SFT frente a RL: al ser un checkpoint solo de SFT dentro de un calendario alterno, permite aislar la contribución de las filas supervisadas antes de cualquier paso de Dr.GRPO.
- Verificación de pipelines de conversión Megatron → HF: sirve como caso de prueba para validar `convert_torch_dist_to_hf_lowmem.py` y las comprobaciones de `E2K_VERIFY.json` y `SHA256SUMS` en un modelo de 27,8 B.
- Investigación sobre agentes que juegan ARC-AGI-3: permite repetir rollouts de 32 episodios con el mismo arnés (semilla 0, niveles 1–4, tope de un nivel) y medir el retorno conformado con un ruido entre rollouts de aproximadamente 0,05.
- Docencia y divulgación técnica: ejemplo real de un experimento de RL con slime + Megatron + SGLang en 4 nodos GH200, incluido el estado del optimizador y la configuración en `megatron/args.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay líneas de métricas de juego de esta ejecución en los logs de Slurm y remite al `wandb_export` del dataset de RL. Tampoco se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones estándar del modelo base o de este checkpoint.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB de repositorio, por lo que la inferencia en bf16 requiere del orden de 60–70 GB de VRAM sumando caché KV y activaciones (estimación a partir del número de parámetros, no publicada por el autor).
- GPU recomendadas para bf16: H100 80 GB, H200, GH200 (96 GB HBM3, la misma plataforma usada en el entrenamiento) o A100 80 GB; con contexto largo o concurrencia conviene repartir en 2 GPU o más.
- Cuantización a 8 bits: en torno a 28–30 GB de pesos, viable en A100 40 GB con margen escaso o en A6000 48 GB (estimación).
- Cuantización a 4 bits: en torno a 14–16 GB de pesos, lo que permitiría ejecución en RTX 4090 o RTX 3090 de 24 GB, siempre que se genere la conversión, ya que el autor no publica GGUF ni otros formatos cuantizados (estimación).
- Despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`); el autor indica que vLLM y SGLang lo cargan igual que el modelo base, y SGLang se usó en los 16 motores de rollout del entrenamiento. llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.
- Estado completo de entrenamiento: el checkpoint con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI; puede reconstruirse parcialmente (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (E2K-cd82-...-iter0) | 27,78 B | No disponible | Apache-2.0 | Público en HuggingFace, 0 descargas, 0 likes | Solo SFT sobre un juego de ARC-AGI-3; resultado negativo documentado |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | Apache-2.0 | Público | Modelo generalista de partida; misma pila de texto, visión y `mtp` |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada otros checkpoints comparables de internalización de conocimiento sobre ARC-AGI-3 |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: el entrenamiento se hizo sobre un único juego (`cd82-fb555c5d`) y la evaluación se limita a rollouts de 32 episodios de ese mismo juego.
- Resultado negativo: la ejecución se canceló durante su primer rollout de RL al alcanzar un 45 % de episodios terminados de una sola llamada, lo que indica colapso del comportamiento multi-paso.
- Las diferencias entre brazos experimentales son de unas pocas centésimas de retorno conformado, con un ruido entre rollouts de un mismo brazo de aproximadamente 0,05; cualquier comparación necesita muchas repeticiones.
- No hay métricas de juego publicadas en los logs de Slurm de esta ejecución; las métricas dependen del `wandb_export` del dataset asociado.
- La torre visual y la cabeza `mtp` se copiaron sin entrenar: el modelo no ha visto imágenes y no hay evaluación de sus capacidades multimodales tras el ajuste.
- No se documentan benchmarks estándar (MMLU, HumanEval, GSM8K) ni cobertura de idiomas, por lo que no es posible cuantificar deriva respecto al modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; se heredan los del modelo base, sin auditoría específica.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías y desaconseja implícitamente el uso en producción al tratarse de un checkpoint de investigación con 0 descargas y 0 likes.
- El estado completo con optimizador (~351 GB) no está publicado; solo se distribuyen pesos convertidos y el libro de contabilidad de Megatron.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_inter_decl-cc2-iter0
- Dataset de RL de la ejecución (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento (arnés): https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: repositorio `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md` citadas en la model card; no se proporciona URL directa en la información disponible)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo, por lo que no se añaden papers, blogs ni demos adicionales.

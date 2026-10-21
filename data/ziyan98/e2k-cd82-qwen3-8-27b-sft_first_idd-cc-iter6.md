# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6 es un checkpoint de investigación publicado por el usuario ziyan98, obtenido al aplicar el experimento de internalización de conocimiento E2K sobre el modelo base Qwen/Qwen3.8-27B (27.781.427.952 parámetros). El objetivo del experimento es comprobar si el conocimiento verificado que un modelo extrae de su propia partida en un videojuego puede escribirse en sus pesos mediante filas supervisadas (SFT) y mejorarse después con RL sobre episodios reales de varios pasos. No se trata de una mejora de propósito general del modelo base: el entrenamiento se realizó sobre un único juego de ARC-AGI-3 (`cd82-fb555c5d`) y la evaluación se limita a rollouts de 32 episodios de ese mismo juego.

El punto de partida es el modelo multimodal Qwen3.8-27B (clase `Qwen3_5ForConditionalGeneration`, pipeline `image-text-to-text`), del que este checkpoint conserva la torre de visión y la cabeza de predicción multi-token sin modificar: el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. El estado entrenado corresponde únicamente al stack de texto (`model.language_model.*` y `lm_head`), convertido desde Megatron torch_dist a safetensors bf16 con 1199 tensores, las mismas formas y tipos que el checkpoint base.

Su relevancia es metodológica más que práctica: documenta de forma poco habitual (argumentos de Megatron, cursores de datos, logs de partida por rollout, verificación de identidad bit a bit de los tensores copiados) una cadena completa de SFT + Dr.GRPO sobre un entornoARC-AGI-3, y hace explícito que las diferencias entre brazos del estudio son de centésimas en retorno conformado, dentro del ruido. Es, por tanto, material para investigar internalización de conocimiento y RL sobre agentes, no un modelo para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`): stack de texto + torre de visión + cabeza de predicción multi-token (MTP). Solo el stack de texto está entrenado en este checkpoint |
| Parametros totales | 27.781.427.952 (27,78 B), 1199 tensores |
| Parametros activos | No disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la model card no la declara; se hereda la configuración del modelo base) |
| Tipos de cuantizacion | No se publican cuantizaciones. Pesos en bf16; no hay GGUF, AWQ ni GPTQ disponibles |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), más metadatos Megatron torch_dist en `megatron/` (`common.pt`, `args.json`, `latest_checkpointed_iteration.txt`, `global_dataset_state_dict_<N>.pt`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer multimodal con torre visual y una cabeza de predicción multi-token. En este checkpoint, el estado Megatron entrenado cubre `model.language_model.*` y `lm_head`; `model.visual.*` y `mtp.*` nunca formaron parte del modelo Megatron y se copian sin cambios desde el checkpoint base. La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B desde el torch_dist base, y `E2K_VERIFY.json` recoge la comparación con el base (identidad de forma y tipo de cada tensor, identidad bit a bit de los tensores copiados, modo fast).

El entrenamiento parte de 303 filas SFT del arnés IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`): turnos de recitación escritos por el propio modelo con el bloque de conocimiento en su contexto, emparejados con filas de replay y validados con la regla de lint C. El calendario es de 2 rollouts solo SFT (iteraciones 0-1), un reinicio de Adam en la frontera SFT→RL y rollouts de Dr.GRPO en las iteraciones 2-8 (relanzado desde la iteración 1 el 2026-09-17 tras un primer intento que ejecutó RL con momentos de Adam congelados). El stack es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang en tp=1, sobre 4 nodos GH200 de Isambard-AI; Dr.GRPO con `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por cada rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 controlando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1-4 con tope de un nivel y retorno conformado sobre las superaciones de nivel.

## Capacidades

- Generación de texto y razonamiento multi-paso en el dominio del juego `cd82-fb555c5d` de ARC-AGI-3, con cadenas de pensamiento largas (mediana de tokens de pensamiento entre 5156 y 6887,5 por rollout).
- Uso de herramientas (tool calling) a través de un servidor MCP con las herramientas `look`, `act` y `status`, orquestado por un agente externo (Claude Code CLI) en bucles de juego de varios pasos.
- Comportamiento de agente con acciones discretas por paso: la métrica `step change` (proporción de pasos que cambian de acción) se sitúa entre 0,033 y 0,093, y `step no-op` entre 0,272 y 0,349.
- Capacidad declarada de procesamiento image-text-to-text por arquitectura (pipeline `image-text-to-text`, torre visual presente), aunque la torre visual no se entrenó y no se evaluó con imágenes.
- Capacidades multilingües: no disponible (no se declara lista de idiomas ni se evalúa).
- Modo de recitación de conocimiento: el modelo puede recitar bloques de conocimiento en contexto; en los rollouts de esta iteración la tasa de turnos recitados medida es 0,000 y la de turnos con referencia a fuente entre 0,318 y 0,436.
- No se documentan capacidades específicas de código, matemáticas, audio o visión entrenadas en este checkpoint.

## Casos de uso

- Investigación sobre internalización de conocimiento: usar este checkpoint como iteración 6 de un brazo concreto (`sft_first_idd-cc`) para replicar el protocolo SFT + Dr.GRPO y medir si el conocimiento recitado en contexto se consolida en los pesos, comparando con las iteraciones 0-1 (solo SFT) del mismo run.
- Estudio de RL sobre agentes en entornos de juego: el checkpoint permite analizar la evolución de métricas por rollout (clear rate, retorno conformado, cambio de acción, no-ops) con un ruido declarado de aproximadamente 0,05 en retorno conformado.
- Auditoría de pipelines de conversión Megatron→HF: los ficheros `E2K_VERIFY.json` y `SHA256SUMS` y el conversor de slime permiten validar bit a bit la conversión desde torch_dist y reutilizar el procedimiento en otros entrenamientos.
- Reproducción de infraestructura de entrenamiento a escala: los `megatron/args.json` y `common.pt` documentan TP4 × PP4, batch global 4, lr 5e-6 y 8 pasos de optimizador por rollout, útiles como referencia para montar recetas Dr.GRPO con slime y SGLang.
- Análisis de coste/beneficio de SFT frente a RL: el calendario con solo 303 filas SFT y 2 rollouts de calentamiento antes del reinicio de Adam sirve para estudiar cuánto aporta cada fase con presupuestos de datos mínimos.
- Generación de líneas base para evaluación de agentes en ARC-AGI-3: útil como referencia negativa o de control (clear rate de 0,000 a 0,031 en 32 episodios) frente a políticas más capaces en el mismo juego.
- Fine-tuning posterior de texto sobre Qwen3.8-27B: al conservar el tokenizador, chat template, generation config y processor del base, puede servir de inicialización para experimentos de texto, aceptando el riesgo de degradación por el entrenamiento en un dominio único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos son las métricas de juego por rollout, extraídas de los logs de trabajo:

| Job | Rollout | Clear rate | Retorno conformado | Step change | Step no-op | Tokens de pensamiento (p50) | Turnos recitados | Turnos con referencia a fuente |
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

El primer rollout de RL tras el bloque solo SFT lo juega la política SFT-only, por lo que mide el efecto de las filas por sí mismas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno conformado, y el autor advierte que las diferencias entre brazos son de centésimas, es decir, no significativas.

## Requisitos de hardware

- VRAM estimada en bf16: unos 55,6 GB solo para pesos (tamaño del repo), más caché KV y activaciones; en la práctica requiere GPU de 80 GB o reparto en varios dispositivos.
- GPU recomendadas: A100 80 GB o H100 80 GB para una sola tarjeta en bf16; el entrenamiento se hizo en 4 nodos GH200 de Isambard-AI con TP4 × PP4.
- Configuraciones multi-GPU: 2 × A100 40 GB o 4 × A100/H100 en tensor parallel permiten alojar los pesos en bf16; el modelo base se sirvió durante el RL con 16 motores SGLang en tp=1.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB). Con cuantización de 8 bits haría falta del orden de 28 GB y con 4 bits del orden de 15-17 GB, pero no hay cuantizaciones publicadas para este checkpoint, por lo que esas cifras son estimaciones y requerirían conversión propia.
- Opciones de despliegue: al ser un checkpoint transformers con safetensors, es cargable con `transformers` (`Qwen3_5ForConditionalGeneration.from_pretrained`, `AutoProcessor`); SGLang y vLLM son opciones razonables dado que SGLang se usó en los rollouts. Para llama.cpp u Ollama habría que generar un GGUF, no disponible en el repositorio. TGI no está verificado para esta arquitectura en la información proporcionada.
- Latencia y throughput: no disponibles. Como referencia de carga, cada paso del agente genera una mediana de 5156 a 6887,5 tokens de pensamiento por rollout, lo que implica respuestas largas y coste de decodificación alto.
- Almacenamiento: el repo ocupa 55,6 GB; el checkpoint completo con estado del optimizador es de aproximadamente 351 GB y permanece en Isambard-AI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6 | 27,78 B | No disponible | SFT (303 filas) + Dr.GRPO sobre un juego ARC-AGI-3 | apache-2.0 | Pesos bf16 en HF; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B (mismo conjunto de 1199 tensores) | No disponible | Entrenamiento original del base, no documentado aquí | Se hereda del base (no confirmado en la información) | Público en HF; usado como referencia bit a bit en `E2K_VERIFY.json` |
| Otras iteraciones del mismo run (`sft_first_idd-cc`, iteraciones 0-8) | 27,78 B | No disponible | Mismo protocolo, distinto punto del calendario | apache-2.0 | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` del dataset de RL |
| Otros brazos del experimento E2K (variantes de `rl_config`) | 27,78 B | No disponible | Distintas configuraciones de SFT/RL | apache-2.0 | No disponible en detalle en la información proporcionada |

No se dispone de datos para comparar con modelos de otros autores de tamaño similar, porque no se han publicado resultados de benchmarks estándar de este checkpoint.

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor indica explícitamente que el modelo se entrenó en un solo juego, se evaluó en rollouts de 32 episodios de ese juego y que las diferencias entre brazos son de centésimas en retorno conformado, dentro del ruido de aproximadamente 0,05.
- Rendimiento absoluto bajo en la tarea: clear rate entre 0,000 y 0,031 y retorno conformado entre -0,203 y 0,252 según el rollout, con tasas de no-op del 27-35 % de los pasos.
- La torre de visión (`model.visual.*`) y la cabeza MTP no se entrenaron y se copian del base; aunque el pipeline sea `image-text-to-text`, no hay ninguna evidencia de calidad en tareas visuales y el actor nunca vio una imagen.
- Riesgo de degradación de capacidades generales por sobreajuste al dominio del juego y por el uso de solo 303 filas SFT con iteraciones de RL de lr 5e-6; no se han publicado evaluaciones de retención en tareas generales.
- Sesgos: no se documenta ningún análisis de sesgos, y la evaluación se limita a un entorno sintético, por lo que no hay datos sobre comportamiento en lenguaje natural real.
- Riesgo de alucinación: no evaluado. La recitación de conocimiento se midió con turnos recitados (0,000 en todos los rollouts de esta iteración), lo que sugiere que el conocimiento no se está reproduciendo literalmente en el juego, pero no se ofrecen métricas de fidelidad fuera de él.
- Idiomas: no se declara lista de idiomas ni evaluaciones multilingües; el castellano no está verificado.
- Licencia apache-2.0: permite uso comercial, pero se trata de un checkpoint de investigación derivado de un base cuyo régimen de licencia no se detalla en esta model card; conviene verificar la licencia de Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Trazabilidad incompleta en la publicación: 0 descargas y 0 likes, sin revisión externa; parte del estado (momentos del optimizador) no se distribuye y el checkpoint completo de 351 GB permanece en Isambard-AI.
- El README original está truncado en el ejemplo de carga (corta en `dtyp`), por lo que no se puede confirmar el fragmento de código completo ni el tipo de dato exacto recomendado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorios y artefactos citados en la model card sin URL incluida en la información proporcionada: slime v0.3.2 (incluye `megatron_to_hf.convert_to_hf`, `convert_hf_to_torch_dist.py` y `convert_torch_dist_to_hf_lowmem.py`), Megatron-LM, Dr.GRPO, ARC-AGI-3, `knowledge_learning.loop.arc_mcp`, arnés IDD `cd82-play-v4` y dataset de RL con `checkpoints/checkpoints.md`, `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS`.

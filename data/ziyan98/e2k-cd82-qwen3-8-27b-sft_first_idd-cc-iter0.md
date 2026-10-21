# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter0 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace, obtenido a partir de Qwen/Qwen3.8-27B (27.781.427.952 parámetros) mediante un experimento de "internalización de conocimiento" denominado E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. La pregunta que aborda el experimento es si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas supervisadas y, después, mejorarse con aprendizaje por refuerzo sobre episodios reales de varios pasos. No se trata de una mejora general del modelo base: se entrenó sobre un único juego, se evaluó con rollouts de 32 episodios de ese mismo juego y las diferencias entre ramas del experimento son de unas pocas centésimas de retorno con forma (*shaped return*).

Este repositorio concreto corresponde a la iteración 0 de la rama `sft_first_idd-cc`, es decir, la fase de calentamiento en la que solo se ha aplicado SFT (303 filas del arnés IDD) y todavía no ha habido rollouts de RL. El entrenamiento se hizo únicamente sobre texto: la torre de visión y la cabeza de predicción multi-token se copian sin modificar del checkpoint base. Los pesos se publican en safetensors bf16, con el mismo conjunto de 1199 tensores y las mismas formas que Qwen3.8-27B, bajo licencia Apache 2.0.

Su relevancia es metodológica, no de producto: documenta con detalle inusual (argumentos de Megatron, cursor del dataset, métricas por rollout, verificación de identidad bit a bit de los tensores copiados) cómo se construye un pipeline de SFT + Dr.GRPO sobre slime y Megatron-LM en 4 nodos GH200 de Isambard-AI, y sirve como punto de partida reproducible para quien quiera replicar o criticar el protocolo E2K. No está pensado para uso en producción ni como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza de predicción multi-token (MTP) heredadas del modelo base |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos bf16 safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponibles (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores, 55,6 GB de repositorio; incluye `megatron/` con `common.pt`, `args.json`, `latest_checkpointed_iteration.txt` y `global_dataset_state_dict_<N>.pt` |

Otros datos de la ficha: pipeline declarado `image-text-to-text`, librería `transformers`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-20 y actualizado el mismo día. Etiquetas destacadas: `experience-to-knowledge`, `arc-agi-3`, `reinforcement-learning`, `dr-grpo`, `knowledge-internalization`, `slime`, `megatron-lm`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer multimodal con pila de texto (`model.language_model.*` y `lm_head`), torre visual (`model.visual.*`) y cabeza MTP (`mtp.*`). Solo la pila de texto fue entrenada; la torre de visión y la cabeza MTP nunca formaron parte del modelo en Megatron y se copian del checkpoint base sin cambios, ya que el actor no vio ninguna imagen durante el entrenamiento. La conversión de Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`), y el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B; `E2K_VERIFY.json` recoge la comparación contra el base y `SHA256SUMS` cubre todos los ficheros.

El entrenamiento de esta iteración 0 es exclusivamente SFT: 303 filas del arnés IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`), compuestas por turnos de recitación escritos por el propio modelo con el bloque de conocimiento en su contexto, emparejados con filas de replay y filtrados por la regla de lint C. El stack es slime v0.3.2 con Megatron-LM en TP4 × PP4, 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI; precisión bf16, backend flash-attn 2.8.3, lr 5e-6, batch global 4 y 8 pasos de optimizador por rollout de 32 episodios. La programación completa de la rama es: rollouts 0–1 solo SFT, reinicio de Adam en la frontera SFT→RL y rollouts 2–8 con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), relanzados desde la iteración 1 el 2026-09-17 tras un primer intento que ejecutó RL con momentos de Adam congelados. El prompt de RL nunca contiene conocimiento; el arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base Qwen3.8-27B (pila de texto íntegra, en bf16).
- Razonamiento multi-paso dentro de un juego: el arnés opera con llamadas `look` / `act` / `status` sobre el entorno ARC-AGI-3, con episodios de hasta 32 rollouts y presupuestos de pensamiento de unos 5.000–6.900 tokens (p50) por rollout en las métricas registradas.
- Modo de "recitación" de conocimiento: capacidad entrenada explícitamente para recitar un bloque de conocimiento presente en el contexto; en los rollouts de esta rama la tasa de turnos recitados medida es 0.000 (es decir, la capacidad no se activó en las partidas registradas).
- Referenciación a fuentes: la métrica `source-ref turns` oscila entre 0.272 y 0.436 en los rollouts, lo que indica que el modelo sí produce referencias a la fuente del conocimiento en una fracción relevante de turnos.
- Entrada multimodal declarada por el pipeline (`image-text-to-text`) y por la presencia de la torre visual, pero esa torre no fue entrenada en este experimento y el actor nunca recibió imágenes: la capacidad de visión es la del base, no una capacidad adquirida aquí.
- Tool calling: el checkpoint se ha ejercitado con herramientas MCP en el bucle de juego, aunque no se documenta un formato de function calling específico ni evaluaciones al respecto.
- Capacidades multilingües: no documentadas en la información disponible.
- No se documentan capacidades de audio, ni modo "thinking" formal, ni decodificación especulativa.

## Casos de uso

- Replicación del experimento E2K: cargar este checkpoint como iteración 0 de la rama `sft_first_idd-cc` y continuar los rollouts 2–8 con Dr.GRPO usando el estado guardado en `megatron/` (`common.pt`, `args.json`, cursor `global_dataset_state_dict_<N>.pt`) para reconstruir el entrenamiento sin los momentos del optimizador mediante `convert_hf_to_torch_dist.py`.
- Línea base ablation de "solo SFT": al ser la iteración previa a cualquier RL, sirve para medir qué aportan por sí solas las 303 filas supervisadas antes de aplicar refuerzo, tal como el autor indica que el primer rollout tras un bloque SFT-only lo juega la política SFT-only.
- Auditoría de metodología de RL: comparar los argumentos de Megatron registrados y las métricas por rollout con otras ramas del mismo estudio para detectar problemas de configuración (el relanzamiento del 2026-09-17 por momentos de Adam congelados es un caso documentado y reproducible).
- Estudio de internalización de conocimiento: analizar la tasa de turnos recitados (0.000) frente a la de referencias a fuente (0.27–0.44) para determinar si el conocimiento se está escribiendo en los pesos o solo se está citando desde el contexto.
- Verificación de pipelines de conversión Megatron→HF: el repositorio incluye `E2K_VERIFY.json` y `SHA256SUMS`, útiles como caso de prueba de que un conversor reproduce bit a bit un checkpoint base de 27.800 millones de parámetros.
- Punto de partida para fine-tuning supervisado propio: al conservar config, tokenizer, chat template, generation config y processor del base, se puede partir de estos pesos con la clase `Qwen3_5ForConditionalGeneration` y sustituir las filas IDD por un corpus propio.
- Docencia y divulgación técnica: ilustrar un pipeline completo SFT + GRPO con slime, SGLang y Megatron-LM sobre 4 nodos GH200, con trazabilidad de jobs, rollouts y checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí publica el autor son métricas de juego por rollout sobre el único entorno entrenado (`cd82-fb555c5d` de ARC-AGI-3), con 32 episodios por rollout y ruido entre rollouts de una misma rama de aproximadamente 0,05 de retorno con forma:

| Job | Rollout | Clear rate | Shaped return | Step change | Step no-op | Think tokens p50 | Turnos recitados | Turnos con ref. a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0.000 | -0.148 | 0.090 | 0.347 | 5563.5 | 0.000 | 0.436 |
| 6647952 | 2 | 0.031 | 0.011 | 0.078 | 0.313 | 5814.0 | 0.000 | 0.426 |
| 6619232 | 3 | 0.000 | -0.062 | 0.056 | 0.322 | 5668.0 | 0.000 | 0.384 |
| 6624050 | 3 | 0.031 | -0.094 | 0.054 | 0.332 | 5156.0 | 0.000 | 0.356 |
| 6647952 | 3 | 0.031 | 0.084 | 0.045 | 0.330 | 5525.0 | 0.000 | 0.318 |
| 6624050 | 4 | 0.000 | -0.203 | 0.043 | 0.343 | 6497.5 | 0.000 | 0.422 |
| 6647952 | 4 | 0.031 | 0.084 | 0.041 | 0.349 | 5622.5 | 0.000 | 0.358 |
| 6624050 | 5 | 0.031 | -0.203 | 0.033 | 0.342 | 6598.5 | 0.000 | 0.428 |
| 6647952 | 5 | 0.031 | 0.206 | 0.081 | 0.310 | 5377.0 | 0.000 | 0.354 |
| 6624050 | 6 | 0.000 | -0.133 | 0.040 | 0.317 | 6887.5 | 0.000 | 0.397 |
| 6647952 | 6 | 0.031 | 0.189 | 0.082 | 0.306 | 5595.5 | 0.000 | 0.373 |
| 6647952 | 7 | 0.031 | 0.100 | 0.090 | 0.318 | 5211.0 | 0.000 | 0.339 |
| 6647952 | 8 | 0.000 | 0.252 | 0.093 | 0.272 | 5367.0 | 0.000 | 0.362 |

Lectura de los datos: el mejor `clear rate` observado es 0.031 (un episodio de 32); el retorno con forma máximo es 0.252, y varias filas son negativas (hasta -0.203). La tasa de `step no-op` se mantiene entre 0.272 y 0.349 en todas las filas. No hay evaluación en otros juegos, en otros dominios ni en tareas de texto general, de modo que estos números no permiten extrapolar capacidad alguna fuera del entorno `cd82-fb555c5d`.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB de repositorio, coherente con 27.781 millones de parámetros a 2 bytes. Se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB, GH200) o reparto multi-GPU para cargar el modelo con margen para activaciones y KV cache.
- Entrenamiento original: 4 nodos GH200 de Isambard-AI, Megatron-LM en TP4 × PP4 con 16 motores de rollout SGLang a tp=1 y backend flash-attn 2.8.3. El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en el clúster.
- Cuantización a 4 bits: estimación a partir del número de parámetros, en torno a 14–16 GB solo para los pesos, lo que lo haría viable en una RTX 4090 (24 GB) osimilar; el repositorio no publica cuantizaciones y habría que generarlas.
- Consumer GPU: en bf16 no cabe en tarjetas de 24 GB; en 4 bits es ajustado pero posible con contexto corto. No hay datos publicados de latencia ni de throughput.
- Despliegue: la carga documentada es `Qwen3_5ForConditionalGeneration.from_pretrained` con `AutoProcessor` en `transformers`. SGLang se usó en el pipeline de entrenamiento (16 motores a tp=1), por lo que es una opción conocida por el autor; vLLM, TGI, llama.cpp u Ollama no se mencionan en la información disponible y requerirían conversión y validación propias.
- Latencia y throughput: no disponibles. Como referencia indirecta, el presupuesto de pensamiento medido por rollout está en torno a 5.200–6.900 tokens (p50), lo que condiciona el coste por episodio en el arnés de juego.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter0 (este) | 27.781.427.952 | No disponible | SFT sobre 303 filas IDD de un solo juego ARC-AGI-3; RL no incluido en esta iteración | Torre visual copiada sin entrenar | Apache 2.0 | Repositorio público, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27.781.427.952 (mismo conjunto de 1199 tensores) | No disponible | Modelo base original, propósito general | Torre visual original del base | Apache 2.0 | Público en HuggingFace |
| Otras iteraciones de la misma rama `sft_first_idd-cc` (iter 1 y posteriores) | Idénticos | No disponible | Añaden rollouts de Dr.GRPO tras el reinicio de Adam | Ídem | Apache 2.0 | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos para comparar con modelos de otros autores de tamaño o tarea equivalente: la información proporcionada no incluye benchmarks comunes ni especificaciones del base más allá del número de parámetros y la licencia. Cualquier comparación numérica con la familia Qwen3.8 completa, con otros checkpoints de ARC-AGI-3 o con modelos de razonamiento de ~27B requeriría datos que aquí no están disponibles.

## Limitaciones y advertencias

- No es una mejora general: el autor lo declara explícitamente. Se entrenó sobre un único juego (`cd82-fb555c5d`) y se evaluó con rollouts de ese mismo juego; las diferencias entre ramas son de unas pocas centésimas de retorno con forma.
- Rendimiento absoluto muy bajo en la tarea objetivo: `clear rate` máximo de 0.031 y retornos con forma entre -0.203 y 0.252. No debe interpretarse como capacidad de resolución de ARC-AGI-3.
- El ruido entre rollouts de una misma rama (~0,05 de retorno con forma) es del mismo orden que las diferencias que el experimento pretende medir, lo que limita la significación de cualquier conclusión por iteración aislada.
- Esta iteración 0 es solo SFT: no incorpora el efecto del RL de Dr.GRPO de los rollouts 2–8. Usarla como "modelo E2K final" sería un error de lectura.
- La torre de visión y la cabeza MTP están sin entrenar (copiadas del base): aunque el pipeline declarado sea `image-text-to-text`, no hay evidencia de que el modelo maneje imágenes en este experimento, y el actor nunca vio una imagen.
- Tasa de recitación de conocimiento de 0.000 en todos los rollouts registrados: la capacidad que el experimento pretende inculcar no se manifestó en las partidas medidas.
- Un incidente documentado de entrenamiento (RL ejecutado con momentos de Adam congelados, corregido con relanzamiento el 2026-09-17) obliga a comprobar la configuración antes de reutilizar los artefactos de `megatron/`.
- Idiomas soportados no declarados: no hay garantía documentada de comportamiento multilingüe más allá del que herede el base.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un checkpoint de investigación sin evaluación de seguridad, no se recomienda su uso en producción ni en aplicaciones de cara al usuario.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los artefactos derivados conservan las obligaciones de atribución razonables; al ser un checkpoint de un solo juego, el uso comercial no tendría justificación técnica.
- El estado completo del optimizador (~351 GB) no se publica; solo está en Isambard-AI, así que la reproducibilidad exacta del entrenamiento requiere acceso a ese clúster.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en el campo `base_model` de la ficha)
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios de código ni demos adicionales. Los artefactos internos citados por el autor (`E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`, `megatron/args.json`, `cd82-play-v4/sft/rows_paired.jsonl.gz`, `rl_config_cc_idd.json`, `checkpoints/checkpoints.md`) se distribuyen dentro del propio repositorio o del dataset de RL asociado, sin URL pública indicada.

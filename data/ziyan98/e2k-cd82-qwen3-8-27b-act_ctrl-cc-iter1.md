# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter1

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter1 es un checkpoint de investigación publicado por el usuario ziyan98, resultado de aplicar el experimento de internalización de conocimiento E2K sobre Qwen/Qwen3.8-27B, un modelo multimodal de 27.781.427.952 parámetros con torre visual y cabeza de predicción multi-token. No es una mejora de propósito general del modelo base: el entrenamiento fue exclusivamente de texto y sobre un único juego de ARC-AGI-3 (cd82-fb555c5d), y la evaluación se hace con rollouts de 32 episodios de ese mismo juego.

En concreto, este repositorio contiene la iteración 1 del brazo de control válido `act_ctrl-cc`, en el que se aplicaron 303 filas SFT construidas con los propios turnos del arnés del modelo base, sin conocimiento inyectado, seguidas de un bloque de RL con Dr.GRPO que se canceló el 18 de septiembre para liberar la GPU a los brazos con conocimiento. El interés no reside en el rendimiento absoluto (tasas de acierto entre 0,000 y 0,031 y diferencias entre brazos de centésimas de retorno conformado), sino en la trazabilidad del artefacto: pesos bf16 verificados contra el modelo base, estado de Megatron y ficheros de verificación de la conversión incluidos.

Es relevante ahora como material reproducible para investigación sobre internalización de conocimiento, RL con recompensa verificable en episodios multi-paso con slime y Megatron-LM, y pipelines de conversión torch_dist a safetensors. No es adecuado como modelo de producción ni como sustituto del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (pila de texto + torre visual + cabeza de predicción multi-token); clase `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no se publican cuantizaciones; pesos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 1199 tensores) |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline declarado | `image-text-to-text` |
| Tamaño del repositorio | 55,6 GB |
| Estado del entrenamiento | iteración 1 de Megatron (TP4 × PP4), bloque SFT completado, RL cancelado |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `qwen3_5`, sin cambios estructurales: el conjunto de tensores y las formas son idénticos a Qwen/Qwen3.8-27B (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`) corresponde al estado entrenado en Megatron, con verificación de forma y dtype para cada tensor e identidad bit a bit de los tensores copiados. La torre visual (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) nunca formaron parte del modelo de Megatron y se copian sin modificar desde el checkpoint base; el entrenamiento fue solo de texto y el actor nunca vio una imagen. Configuración, tokenizador, plantilla de chat, configuración de generación y de procesador son también los del modelo base, según `E2K_CONVERSION.json`.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) en 4 nodos GH200 de Isambard-AI, con 16 motores de rollout SGLang a tp=1 y backend flash-attn 2.8.3 en bf16. La fase supervisada usó 303 filas (`cd82-play-v4/sft/rows_actctrl.jsonl.gz`), correspondientes a los turnos del arnés del propio modelo base sin conocimiento, es decir, el control emparejado del brazo IDD. Tras 2 rollouts solo-SFT (0–1) con reinicio de Adam, se aplicó Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`) en los rollouts 2–3, con una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios y lr 5e-6. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 conduciendo las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno conformado sobre los niveles superados.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base; este checkpoint no las reevalúa ni las mejora de forma general.
- Procesamiento de imagen: la torre visual se conserva intacta, pero no se entrenó ni se validó en este experimento; el pipeline `image-text-to-text` está declarado por herencia del base.
- Modo thinking: la plantilla de chat y el modo de razonamiento son los del base, sin cambios; en los rollouts registrados el p50 de tokens de pensamiento se sitúa entre 3.347 y 4.504.
- Juego agéntico multi-paso: el modelo fue entrenado para operar sobre herramientas MCP de observación y acción en un entorno ARC-AGI-3 concreto, con episodios de hasta 32 rollouts.
- Tool calling / function calling: no documentado como capacidad nativa; la interacción con herramientas se produce a través del arnés externo, no mediante un protocolo de function calling verificado.
- Decodificación especulativa: conserva los tensores `mtp.*` del modelo base sin cambios, por lo que mantiene la ruta de decodificación del base; no verificado en este checkpoint.
- Capacidades multilingües: no disponible.
- Internalización de conocimiento: en este brazo (control) no se inyectó conocimiento; los turnos con `source-ref` se sitúan entre 0,214 y 0,271 y los turnos "recited" son 0,000 en todos los rollouts.

## Casos de uso

- Reproducción del experimento E2K: sirve como brazo de control para comparar contra los brazos con conocimiento de la misma serie, dado que comparte filas SFT emparejadas y condiciones de RL idénticas.
- Investigación en internalización de conocimiento: permite medir si el conocimiento verificado extraído del propio juego se escribe en los pesos, usando este checkpoint como referencia sin conocimiento y con el mismo presupuesto de entrenamiento.
- Estudio de RL con Dr.GRPO en episodios multi-paso: los registros por rollout (clear rate, retorno conformado, cambio de paso, no-op, tokens de pensamiento) permiten analizar la varianza del algoritmo con una línea base documentada.
- Validación de pipelines de conversión Megatron a HuggingFace: el repositorio incluye `E2K_VERIFY.json`, `SHA256SUMS` y el estado en `megatron/`, lo que permite comprobar la reproducción bit a bit de los tensores copiados.
- Investigación sobre agentes que operan arneses externos: el modelo es un ejemplo entrenado para emitir acciones a través de herramientas MCP con un contrato `look`/`act`/`status`, útil para estudiar el acoplamiento entre política y arnés.
- Análisis de colapso de formato o sobreajuste al arnés: con 303 filas SFT sobre un único juego, es un caso de estudio de cuánto del comportamiento observado proviene del formato de las filas y no de la tarea.
- Docencia y divulgación técnica: como ejemplo end-to-end de trazabilidad de un checkpoint de investigación (estado del optimizador, cursor de datos, argumentos de Megatron).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son las métricas de juego por rollout, extraídas de los logs del job:

| Job | Rollout | Clear rate | Retorno conformado | Cambio de paso | Paso no-op | Think tokens p50 | Turnos recited | Turnos con source-ref |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,000 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,000 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,000 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,000 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,000 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,000 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,000 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,500 | 0,000 | 0,269 |

El propio autor advierte de que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno conformado, por lo que las diferencias observadas no son concluyentes. El primer rollout de RL tras el bloque SFT lo juega la política solo-SFT, de modo que mide el efecto de las filas por sí solas.

## Requisitos de hardware

- Pesos en bf16: 27.781.427.952 parámetros equivalen a unos 55,6 GB, que coinciden con el tamaño del repositorio; es la referencia mínima de memoria para cargar el modelo sin cuantizar.
- VRAM estimada para inferencia en bf16: 65–80 GB sumando caché KV y activaciones para contexto corto (estimación derivada del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: H100 80 GB, A100 80 GB o GH200 en nodo único; el entrenamiento se hizo en 4 nodos GH200 de Isambard-AI.
- Consumer GPU: no cabe en una RTX 4090 de 24 GB en bf16. En 4 bits (unos 14–16 GB) cabría, pero no hay cuantizaciones publicadas y habría que generarlas.
- Despliegue: `transformers` con `device_map="auto"` y `dtype="bfloat16"`; el autor indica que vLLM y SGLang lo cargan igual que el modelo base. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no disponible.
- Memoria multi-GPU: sharding por capas con `device_map` o tensor paralelo en vLLM/SGLang permite repartir los 55,6 GB entre 2 GPU de 40–48 GB.
- Latencia y throughput: no disponible. Como referencia de infraestructura, el entrenamiento usó 16 motores de rollout SGLang a tp=1.
- Estado completo para reanudar entrenamiento: el checkpoint con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI; se puede reconstruir (menos los momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter1 (este) | 27.781.427.952 | no disponible | clear rate 0,000–0,031 en cd82; no hay benchmarks estándar | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27.781.427.952 | no disponible | no disponible en la información proporcionada | Apache 2.0 | HuggingFace |
| Brazos con conocimiento de la serie E2K-cd82 (p. ej., el brazo IDD emparejado) | mismos que el base | no disponible | no se publican métricas en la información disponible | Apache 2.0 | un repositorio por iteración guardada |
| Otras iteraciones de la serie (`iter_0000001` y sucesivas) | mismas | no disponible | no disponible | Apache 2.0 | HuggingFace |

La comparación relevante es interna a la serie: este checkpoint se diferencia del modelo base únicamente en la pila de texto, y de los brazos con conocimiento solo en las filas SFT y en el contenido del prompt de RL. No se dispone de datos verificados de modelos de terceros de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un único juego y evaluado con rollouts de 32 episodios de ese mismo juego.
- Las diferencias frente a otros brazos son de centésimas de retorno conformado, con un ruido aproximado de 0,05 entre rollouts; no permiten conclusiones firmes.
- El bloque de RL se canceló el 18 de septiembre de 2026 para liberar la GPU, por lo que la política no completó el programa de entrenamiento previsto.
- El brazo es el control: no contiene conocimiento inyectado y los turnos "recited" son 0,000 en todos los rollouts registrados.
- Entrenamiento solo de texto: la torre visual se copia sin cambios y no fue validada; no debe asumirse un comportamiento multimodal fiable en este checkpoint.
- Riesgo de sobreajuste al formato del arnés: 303 filas SFT sobre un único entorno y un único formato de herramientas MCP.
- Riesgo de alucinación y de razonamiento inconsistente: es un modelo de lenguaje sin garantías; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados; no hay garantía de calidad fuera de los idiomas del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el estado del modelo no es apto para producción y el autor lo describe explícitamente como checkpoint de investigación.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por terceros.
- Los pesos están en bf16 sin cuantizaciones oficiales; cualquier cuantización corre por cuenta del usuario y puede alterar el comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del experimento (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset de conocimiento del arnés: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Serie E2K-40: https://huggingface.co/ziyan98/E2K-40 (enlace truncado en la información disponible)
- Ficheros internos de trazabilidad en el repositorio: `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`, `megatron/args.json`, `megatron/common.pt`, `megatron/latest_checkpointed_iteration.txt`, `megatron/global_dataset_state_dict_<N>.pt`
- Paper, blog o repositorio de código independientes: no disponibles en la información proporcionada.

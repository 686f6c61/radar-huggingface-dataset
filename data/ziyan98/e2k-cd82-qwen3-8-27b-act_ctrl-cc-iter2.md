# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter2

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter2 es un checkpoint de investigación publicado por el usuario ziyan98, obtenido al aplicar el experimento de internalización de conocimiento E2K sobre Qwen/Qwen3.8-27B para el juego `cd82-fb555c5d` de ARC-AGI-3. No es una mejora de propósito general del modelo base: el autor lo describe explícitamente como el brazo de control («act-ctrl») de un estudio que mide si el conocimiento verificado extraído de la propia partida del modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos. El entrenamiento se hizo sobre un único juego y la evaluación se limita a rollouts de 32 episodios de ese mismo juego, con diferencias entre brazos del orden de centésimas de retorno con forma (*shaped return*).

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y la configuración del base: 27.781.427.952 parámetros en safetensors bf16 (55,6 GB de repositorio), clase `Qwen3_5ForConditionalGeneration`, con torre visual y cabeza de predicción multi-token (MTP) copiadas sin cambios del checkpoint original. Solo la pila de texto (`model.language_model.*` y `lm_head`) es estado entrenado en Megatron, y el entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen.

Su relevancia es metodológica, no de rendimiento: documenta de forma inusualmente completa la trazabilidad de un ciclo SFT + Dr.GRPO con slime/Megatron-LM sobre 4 nodos GH200 de Isambard-AI, incluyendo métricas de juego por rollout, argumentos de entrenamiento y verificación bit a bit de los tensores copiados. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como material de replicación, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`): pila de texto transformer + torre visual + cabeza MTP; detalles de atención y capas no disponibles en la información proporcionada |
| Parámetros totales | 27.781.427.952 (≈27,78 mil millones) |
| Parámetros activos | No disponible; no se declara arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican GGUF, AWQ ni GPTQ; pesos originales en bf16 (1199 tensores). Otras precisiones no verificadas |
| Idiomas soportados | No disponibles (heredados del base, sin declaración en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors bf16; se incluye estado Megatron `torch_dist` en `megatron/` (`common.pt`, `args.json`, `latest_checkpointed_iteration.txt`, `global_dataset_state_dict_<N>.pt`) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text. La conversión Megatron `torch_dist` → HF se hizo con el mapeo propio de slime (`megatron_to_hf.convert_to_hf`) mediante flujo por trozos en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de `Qwen/Qwen3.8-27B` desde el checkpoint `torch_dist` base, y `E2K_VERIFY.json` documenta la comparación contra el base (identidad de forma y dtype por tensor, identidad bit a bit de los tensores copiados, modo rápido). La torre visual `model.visual.*` y la cabeza `mtp.*` nunca formaron parte del modelo Megatron y se copiaron sin modificar.

El entrenamiento usó 303 filas supervisadas del arnés act-ctrl (`cd82-play-v4/sft/rows_actctrl.jsonl.gz`), correspondientes a turnos del propio arnés generados por el modelo base, sin conocimiento inyectado: es el control emparejado del brazo IDD. La programación fue de 2 rollouts solo SFT (iteraciones 0–1), reinicio de Adam y rollouts 2–3 de RL con Dr.GRPO, cancelados el 18 de septiembre de 2026 para liberar la GPU a los brazos con conocimiento. El stack fue slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1 sobre 4 nodos GH200 de Isambard-AI; hiperparámetros destacados: `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno con forma sobre los niveles superados. El prompt de RL nunca contiene conocimiento y el primer rollout de RL tras un bloque SFT lo juega la política solo-SFT, de modo que mide el efecto de las filas por sí mismas.

## Capacidades

- Generación de texto y razonamiento de cadena larga en modo *thinking*: los rollouts muestran medianas de 3.347–4.504 tokens de pensamiento por turno.
- Juego interactivo de ARC-AGI-3 sobre el título `cd82-fb555c5d` mediante herramientas MCP (`look`, `act`, `status`) en episodios multi-paso de hasta 32 rollouts.
- Ejecución de turnos de arnés con formato conversacional y plantilla de chat idéntica a la del base.
- Capacidad multimodal teórica (torre visual y procesador heredados del base), pero no evaluada ni entrenada en este checkpoint: el actor nunca recibió imágenes.
- Compatibilidad declarada con vLLM y SGLang «como el modelo base», y con `transformers` vía `Qwen3_5ForConditionalGeneration` / `AutoProcessor`.
- No se declara soporte específico de *tool calling* genérico, agentes arbitrarios ni capacidades de audio distintas de las del base; no disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Baseline de control en experimentos de internalización de conocimiento: sirve como referencia emparejada frente al brazo IDD, porque comparte filas, programación e hiperparámetros salvo la presencia de conocimiento en las filas SFT.
- Replicación del pipeline de entrenamiento: los `megatron/args.json` y `common.pt` permiten reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime y repetir la iteración.
- Auditoría de conversión Megatron → HF: `E2K_VERIFY.json` y `SHA256SUMS` permiten validar tensor a tensor que la exportación no altera los pesos copiados del base.
- Estudio de agentes con herramientas MCP: el arnés `look`/`act`/`status` con Claude Code CLI es un banco reproducible para medir tasas de no-op (0,360–0,425 en los rollouts registrados) y cambios de paso (0,040–0,083).
- Análisis de razonamiento con recompensa escasa: útil para estudiar el coste en tokens de pensamiento (mediana ≈3.900–4.500) cuando la tasa de acierto es prácticamente nula, un régimen habitual en entornos ARC.
- Pruebas de compatibilidad de serving: al mantener shapes y config del base, sirve para validar despliegues vLLM/SGLang y plantillas de chat antes de sustituir el checkpoint por uno entrenado.
- Ablaciones posteriores con Dr.GRPO: punto de partida barato (lr 5e-6, batch global 4) para probar variantes de normalización de ventajas sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son métricas de juego del run sobre ARC-AGI-3 `cd82-fb555c5d`, por rollout y job:

| Job | Rollout | Tasa de niveles superados | Retorno con forma | Cambio de paso | No-op | Tokens de pensamiento (p50) | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,000 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,000 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,000 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,000 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,000 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,000 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,000 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,500 | 0,000 | 0,269 |

El autor indica que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, magnitud comparable a las diferencias entre brazos. No hay comparación numérica publicada contra otros modelos en estos datos.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos suman unos 55,6 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB, H200) dejando margen para caché KV; con dos GPU de 48 GB (L40S, RTX 6000 Ada) mediante tensor parallel también es viable.
- No cabe en GPU de consumo de 24 GB (RTX 4090, 3090) en bf16. Una cuantización a 4 bits situaría los pesos en el entorno de 15–16 GB, pero es una estimación aritmética: no hay GGUF ni cuantizaciones publicadas que la verifiquen.
- Despliegue: `transformers` con `device_map="auto"` y `dtype="bfloat16"` (ejemplo oficial de la model card), vLLM y SGLang «igual que el modelo base». llama.cpp y Ollama no están soportados al no existir pesos GGUF.
- Entrenamiento de referencia: 4 nodos GH200 (Isambard-AI), Megatron-LM TP4 × PP4 y 16 motores de rollout SGLang a tp=1; el checkpoint completo con estado del optimizador ocupa ≈351 GB y permanece en Isambard-AI.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter2 | 27,78 B | No disponible | SFT (303 filas act-ctrl) + Dr.GRPO parcial sobre 1 juego ARC-AGI-3 | apache-2.0 | Pesos bf16 en HF (0 descargas) |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | Modelo base multimodal image-text-to-text | apache-2.0 | Pesos bf16 en HF |
| Brazos IDD / otras iteraciones de la serie E2K | Mismo tamaño (misma familia) | No disponible | Variantes con conocimiento en las filas SFT y RL más prolongado | apache-2.0 | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` del dataset de RL |
| Otros modelos de la misma categoría (ARC-AGI-3, ~27 B) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el propio base: mismos 1199 tensores, mismos shapes y misma licencia, con la diferencia de que la pila de texto ha recibido SFT y un rollout de RL sobre un juego. El autor subraya que las diferencias de rendimiento entre brazos son de centésimas y que este checkpoint no constituye una mejora general del base.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo de propósito general: el autor lo declara explícitamente fuera de ese uso.
- Entrenado y evaluado en un único juego (`cd82-fb555c5d`); no hay evidencia de transferencia a otras tareas.
- Tasa de niveles superados de 0,000 en 6 de 8 rollouts y máxima de 0,031: el rendimiento absoluto es prácticamente nulo en el entorno evaluado.
- Alta proporción de acciones no-op (0,360–0,425) y cambios de paso bajos (0,040–0,083), lo que sugiere política poco exploratoria.
- El RL se canceló en la iteración 2–3, por lo que el modelo está infraentrenado respecto al plan original.
- Ruido entre rollouts de ≈0,05 de retorno con forma, del mismo orden que las diferencias entre brazos: no deben extraerse conclusiones fuertes de una sola ejecución.
- Coste de razonamiento elevado: medianas de 3.300–4.500 tokens de pensamiento por turno, con el coste de inferencia que implica.
- La torre visual y la cabeza MTP no se entrenaron (el actor nunca vio una imagen): cualquier uso multimodal es el del base sin adaptación.
- Riesgo de alucinación y sesgos heredados del base, no documentados en la información disponible.
- Idiomas soportados no declarados; no hay garantía de comportamiento multilingüe más allá del base.
- Licencia apache-2.0 permite uso comercial, pero dado el carácter de checkpoint de investigación no se recomienda su despliegue en producción.
- La verificación de conversión se hizo en «modo rápido» (`E2K_VERIFY.json`), no como revalidación completa de todos los tensores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL con episodios, métricas, filas y log del run: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento del arnés: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Referencias internas citadas en la model card: `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`, `megatron/args.json`, `checkpoints/checkpoints.md` (dentro de los repositorios anteriores); la model card original queda truncada en el tercer enlace de la sección «Related», por lo que no se dispone de más URLs.

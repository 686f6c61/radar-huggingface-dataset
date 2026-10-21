# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter1

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter1 es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace) a partir de Qwen/Qwen3.8-27B, con 27.781.427.952 parámetros (~27,8 B) en pesos bf16 safetensors. No es un ajuste de propósito general: es la iteración 1 del brazo válido (run `sft_first_idd-cc`) de un experimento de "internalización de conocimiento" (E2K) sobre el juego `cd82-fb555c5d` de ARC-AGI-3, en el que se intenta escribir en los pesos conocimiento verificado extraído de la propia partida del modelo, mediante filas supervisadas y después RL sobre episodios reales.

El entrenamiento consistió en 2 rollouts solo-SFT (303 filas del arnés IDD), un reinicio de Adam en la frontera SFT→RL y rollouts de RL con Dr.GRPO de 2 a 8, sobre la pila de texto del modelo. La arquitectura es la de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre visual `model.visual.*` y cabeza de predicción multi-token `mtp.*` que se copiaron intactas del modelo base porque el entrenamiento fue exclusivamente de texto (el actor nunca vio una imagen).

Su relevancia es metodológica, no de rendimiento: documenta de forma inusualmente detallada la trazabilidad entre datos, configuración de Megatron, métricas de juego por rollout y verificación bit a bit de los tensores. Las diferencias entre brazos son de centésimas de retorno con forma (*shaped return*), y el propio autor advierte que no debe considerarse una mejora general de Qwen3.8-27B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre visual y cabeza MTP; en este checkpoint solo se entrenó la pila de texto (`model.language_model.*`, `lm_head`) |
| Parámetros totales | 27.781.427.952 (~27,8 B), 1199 tensores |
| Parámetros activos | No disponible (la información no indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos bf16. No se distribuyen GGUF ni cuantizaciones de 8/4 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) + estado de entrenamiento Megatron torch_dist en `megatron/` (`common.pt`, `args.json`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en su variante condicional multimodal: incluye una pila de lenguaje, una torre visual (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). De los 1199 tensores, 519 son bit idénticos al modelo base y 680 difieren (679 con prefijo `model.language_model` y 1 en `lm_head`). La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de Qwen/Qwen3.8-27B, y `E2K_VERIFY.json` recoge la comparación contra la base. `SHA256SUMS` cubre todos los ficheros.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) con 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI, en bf16 con backend flash-attn 2.8.3. Fase SFT: 303 filas del arnés IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`, turnos de recitación generados por el propio modelo con el bloque de conocimiento en contexto, emparejados con filas de replay, regla de lint C) durante los rollouts 0–1. Después, reinicio de Adam en la frontera SFT→RL y RL con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno con forma sobre los niveles completados. El primer intento se relanzó el 2026-09-17 porque había ejecutado RL con momentos de Adam congelados (linaje `rl_config_cc_idd_v2`).

## Capacidades

- Generación de texto conversacional y razonamiento extenso: las trazas de pensamiento medidas tienen una mediana de 5.211–5.814 tokens por episodio (`think tokens p50`) en el arnés de juego.
- Uso de herramientas vía MCP: el checkpoint se evaluó exclusivamente conduciendo las herramientas `look`, `act` y `status` mediante Claude Code CLI, es decir, en un bucle agéntico real de observación-acción.
- Razonamiento multi-paso sobre episodios largos: hasta 32 episodios por rollout con historial acumulado y recitación de conocimiento en contexto (0 turnos recitados durante el RL, 0,27–0,44 turnos con referencia a fuente).
- Capacidad multimodal heredada del modelo base: la torre visual y el procesador están presentes y son funcionales, pero no se entrenaron ni se validaron en esta ejecución (entrenamiento solo de texto).
- Capacidad de salida estructurada para acciones de juego: el modelo produce acciones interpretables (tasa de cambio de paso 0,033–0,093; tasa de no-op 0,272–0,349).
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades específicas de código, matemáticas o audio para este checkpoint.

## Casos de uso

- Replicación de experimentos de internalización de conocimiento: el repositorio incluye `megatron/args.json`, `common.pt`, el cursor de datos (`global_dataset_state_dict_<N>.pt`) y los ficheros `rl_config_*.json` del dataset de RL, lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Baseline para estudios de SFT frente a RL: sirve como punto de comparación de la política solo-SFT (rollout 2, retorno +0,011, 1/32 clears) frente a la política tras RL (rollout 8, retorno +0,252), con ruido entre rollouts de un mismo brazo de ~0,05.
- Ingeniería de arneses agénticos: útil para depurar y medir bucles de observación-acción sobre herramientas MCP (`look`/`act`/`status`) con métricas objetivas de tasa de éxito y de cambio de acción.
- Análisis de trazas de razonamiento largo: con medianas de más de 5.000 tokens de pensamiento por episodio, es un objeto de estudio para investigar coste computacional y calidad del *thinking mode* en tareas de planificación.
- Auditoría de procedencia de pesos: los ficheros `E2K_VERIFY.json` y `SHA256SUMS` permiten verificar qué tensores cambiaron y comparar contra la base, útil en trabajos de forense de modelos y de merges controlados.
- Servido de referencia en texto para pruebas de integración: al conservar el tokenizador, la plantilla de chat, la configuración de generación y el procesador del modelo base, se puede usar como sustituto directo en pipelines que esperan la interfaz `Qwen3_5ForConditionalGeneration`, sin esperar mejoras de calidad.
- Docencia y divulgación sobre RL aplicado a agentes: el desglose por rollout y por job (6619232, 6624050, 6647952) es material concreto para explicar varianza, ablaciones y relanzamientos por fallos de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas son de juego, sobre 32 episodios del juego `cd82-fb555c5d` de ARC-AGI-3, para el job 6647952 (brazo válido, run `sft_first_idd-cc`, iteración 1):

| Rollout | Tasa de clears | Retorno con forma | Cambio de paso | No-op | Think tokens p50 | Turnos recitados | Turnos con referencia a fuente |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 2 (solo SFT) | 0,031 | 0,011 | 0,078 | 0,313 | 5.814,0 | 0,000 | 0,426 |
| 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5.525,0 | 0,000 | 0,318 |
| 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5.622,5 | 0,000 | 0,358 |
| 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5.377,0 | 0,000 | 0,354 |
| 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5.595,5 | 0,000 | 0,373 |
| 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5.211,0 | 0,000 | 0,339 |
| 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5.367,0 | 0,000 | 0,362 |

Los jobs 6619232 y 6624050 corresponden a otros brazos o intentos, con retornos con forma entre -0,203 y -0,062 y tasas de clears de 0,000–0,031. El propio autor indica que las diferencias entre brazos son de centésimas de retorno y que el ruido rollout a rollout de un mismo brazo es de aproximadamente 0,05, por lo que estas cifras no deben interpretarse como una mejora consolidada.

## Requisitos de hardware

- Pesos en bf16: 27,78 B de parámetros ≈ 55,6 GB de pesos; el repositorio ocupa 55,6 GB. Con caché KV y activaciones, el consumo estimado en inferencia se sitúa en el rango de 65–75 GB (estimación aritmética a partir del número de parámetros, no medida publicada).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o GH200 (el entrenamiento usó 4 nodos GH200 de Isambard-AI). Con 24 GB por tarjeta hace falta sharding o tensor parallel en varios dispositivos.
- Cuantización a 8 bits: ≈ 28 GB de pesos, viable en A6000 48 GB, L40S 48 GB o A100 40 GB. A 4 bits: ≈ 14 GB de pesos, podría entrar en una RTX 4090/3090 de 24 GB, pero no hay GGUF ni cuantizaciones publicadas: habría que generarlas.
- Cabe en GPU de consumo solo mediante cuantización propia o sharding multi-GPU; no se distribuye ninguna variante lista para consumer.
- Opciones de despliegue: `transformers` con soporte de la arquitectura `qwen3_5` (clase `Qwen3_5ForConditionalGeneration` y `AutoProcessor`), SGLang (usado en los rollouts del entrenamiento, 16 motores a tp=1), vLLM o TGI si soportan la arquitectura, y llama.cpp/Ollama solo tras conversión a GGUF, que no está disponible.
- Estado completo de entrenamiento: el checkpoint con optimizador ocupa ≈ 351 GB y permanece en Isambard-AI, no en el repositorio de HuggingFace.
- Latencia y throughput de inferencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento adicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter1 | 27,78 B | No disponible | SFT (303 filas) + Dr.GRPO sobre un juego de ARC-AGI-3 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B | No disponible | No aplica | Apache 2.0 | HuggingFace, modelo base de referencia |
| Otras iteraciones del mismo run (`sft_first_idd-cc`) | 27,78 B | No disponible | Variantes por iteración guardada | Apache 2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL |
| Otros modelos de ~27 B de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comunes que permitan una comparación cuantitativa con alternativas de la misma categoría; la única comparación posible es estructural (mismo conjunto y formas de tensores que el modelo base, con 680 tensores modificados).

## Limitaciones y advertencias

- No es una mejora de propósito general: se entrenó y evaluó en un único juego (`cd82-fb555c5d`) y las diferencias frente a otros brazos son de centésimas de retorno con forma, con ruido de ~0,05 entre rollouts del mismo brazo.
- La evaluación se limita a 32 episodios por rollout, con semilla de motor 0 y niveles 1–4 con tope de un nivel; no hay validación fuera de ese régimen.
- Riesgo de alucinación y de sobreajuste al formato del arnés: el modelo fue entrenado con turnos de recitación y con las herramientas MCP concretas del bucle, por lo que puede degradarse fuera de ese contexto.
- La torre visual y la cabeza MTP son copias intactas de la base y no se validaron en esta ejecución, pese a que la etiqueta de pipeline sea `image-text-to-text`. No debe asumirse calidad multimodal medida.
- Idiomas soportados y longitud de contexto no documentados; no hay garantías explícitas de comportamiento multilingüe ni de rendimiento en contextos largos.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero el autor no ofrece ninguna garantía de idoneidad y el checkpoint no ha pasado validación de producción.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ) ni resultados de benchmarks estándar; el despliegue requiere tooling que soporte la arquitectura `qwen3_5`.
- Trazabilidad dependiente de terceros: la reproducibilidad total exige reconstruir el estado de Megatron con slime y disponer del dataset de RL y de los ficheros `rl_config_*.json`; los momentos del optimizador no están en el repositorio.
- Señales de adopción nulas (0 descargas, 0 likes) y publicación y actualización el mismo día (2026-10-20): no hay evidencia de uso independiente ni de revisión por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficheros citados dentro del repositorio: `megatron/args.json`, `megatron/common.pt`, `E2K_CONVERSION.json`, `E2K_VERIFY.json`, `SHA256SUMS`
- Dataset de RL con `knowledge-set/` (ficheros `rl_config_*.json`) y `checkpoints/checkpoints.md`: referenciado en la model card, sin URL disponible en la información proporcionada
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada

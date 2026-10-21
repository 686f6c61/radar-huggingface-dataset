# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter1

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-cc-iter1 es un checkpoint de investigación publicado por el usuario ziyan98 a partir del modelo base Qwen/Qwen3.8-27B (27.781.427.952 parámetros reales según los safetensors). No es un ajuste destinado a mejorar capacidades generales: es la primera iteración del brazo de control («baseline-cc», RL puro sin SFT) de un experimento de internalización de conocimiento denominado E2K, ejecutado sobre un único juego de ARC-AGI-3 identificado como `cd82-fb555c5d`.

El experimento estudia si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios multi-paso reales. En este brazo concreto no se usaron filas de SFT: el checkpoint es el estado del modelo tras 12 rollouts de Dr.GRPO (iteración 1 de Megatron). El autor advierte explícitamente de que las diferencias entre brazos son de centésimas en retorno conformado (shaped return) y que no debe interpretarse como una mejora de propósito general.

La relevancia es por tanto metodológica y de infraestructura: documenta una pila completa de RL a gran escala (slime v0.3.2 + Megatron-LM TP4 × PP4 + 16 motores de rollout SGLang) sobre 4 nodos GH200 de Isambard-AI, con conversión de pesos Megatron torch_dist a HuggingFace verificada bit a bit contra el checkpoint base. El repositorio pesa 55,6 GB y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre visual `model.visual.*` + pila de texto `model.language_model.*` + `lm_head` + cabeza de predicción multi-token `mtp.*`); 1199 tensores |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | No disponible (no consta que el modelo base sea MoE en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en bfloat16 (no hay GGUF ni cuantizaciones de 8/4 bits publicadas) |
| Idiomas soportados | No disponible (el modelo base no declara lista de idiomas en la información proporcionada; el entrenamiento de este checkpoint fue solo de texto y en un único juego) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16; se conservan `config`, tokenizer, chat template, generation config y processor config del modelo base |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B sin modificaciones estructurales: un transformer multimodal con torre visual, pila de lenguaje y cabeza de predicción multi-token. El conjunto y las formas de los tensores son idénticos a los del checkpoint original (1199 tensores). Solo la pila de texto (`model.language_model.*` y `lm_head`) corresponde al estado entrenado en Megatron; la torre visual (`model.visual.*`) y la cabeza `mtp.*` nunca formaron parte del modelo Megatron y se copiaron sin cambios del checkpoint base, ya que el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen.

El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) con 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. El algoritmo es Dr.GRPO con los flags `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por cada rollout de 32 episodios, learning rate 5e-6, bf16 y backend flash-attn 2.8.3. El horario cubre los rollouts 0 a 11 sin SFT (tres cadenas de jobs, con reanudación desde la última iteración). El prompt de RL nunca contiene conocimiento: en este brazo no hay internalización supervisada, es la referencia pura de RL.

La recogida de partidas se hizo con Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1 a 4 con tope de un nivel y retorno conformado adicional por superar niveles. La conversión de Megatron torch_dist a HF se realizó con `megatron_to_hf.convert_to_hf` por streaming; el mismo conversor reproduce bit a bit los safetensors originales del modelo base, y `E2K_VERIFY.json` documenta la comparación.

## Capacidades

- Generación de texto conversacional con el chat template y el modo thinking del modelo base, sin cambios.
- Razonamiento multi-paso dentro de un bucle agéntico: el checkpoint fue entrenado sobre episodios reales de 32 rollouts con herramientas `look` / `act` / `status`.
- Interacción con herramientas vía MCP en el arnés de evaluación utilizado (Claude Code CLI 2.1.270).
- Juego de un único entorno ARC-AGI-3 (`cd82-fb555c5d`), donde el objetivo es superar niveles mediante acciones discretas.
- Razonamiento extenso en modo thinking: la mediana de tokens de pensamiento por rollout se sitúa entre 4.345 y 5.859 en las iteraciones registradas.
- Capacidad multimodal (image-text-to-text) heredada del modelo base en la configuración y el pipeline declarado, aunque la torre visual no se entrenó y el actor nunca recibió imágenes.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling genérico: no documentado para este checkpoint.

## Casos de uso

- Reproducción del experimento E2K: sirve como brazo de control (RL puro sin SFT, iteración 1) frente a las variantes con internalización de conocimiento, usando el mismo arnés de juego y la misma semilla de motor (0).
- Estudio de internalización de conocimiento: comparar este checkpoint con los brazos que sí incluyen filas SFT para medir si el conocimiento verificado escrito en los pesos se traduce en mejora de retorno conformado en episodios reales.
- Investigación en agentes sobre ARC-AGI-3: el modelo ya ha sido evaluado en rollouts de 32 episodios del juego `cd82-fb555c5d`, por lo que resulta un punto de partida directo para estudiar estrategias de exploración y uso de herramientas.
- Validación de pipelines de RL a gran escala: la carpeta `megatron/` incluye `args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y cursores de dataset, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py`.
- Desarrollo y prueba de conversores Megatron ↔ HuggingFace: el repositorio sirve como caso de prueba de ida y vuelta, ya que el conversor reproduce bit a bit el checkpoint base y se incluye `SHA256SUMS` sobre todos los ficheros.
- Ablaciones de hiperparámetros de Dr.GRPO: batch global 4, 8 pasos de optimizador por rollout y lr 5e-6 son valores de referencia reutilizables en estudios de sensibilidad sobre el mismo entorno.
- Auditoría de latencia y coste de inferencia agéntica: los registros de tokens de pensamiento (p50 hasta 5.859) permiten dimensionar el coste de despliegues con thinking largo en bucles de herramientas.
- Docencia y divulgación técnica: ejemplo verificable de cadena completa slime + Megatron-LM + SGLang sobre GH200 con trazabilidad de procedencia de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de juego por rollout, extraídas de los registros de los jobs:

| Job | Rollout | Tasa de niveles superados | Retorno conformado | Step change | Step no-op | Tokens de pensamiento p50 |
|---|---:|---:|---:|---:|---:|---:|
| 6529937 | 0 | 0,000 | -0,181 | 0,092 | 0,377 | — |
| 6536263 | 0 | 0,000 | -0,203 | 0,085 | 0,385 | — |
| 6548427 | 0 | 0,000 | -0,259 | 0,089 | 0,364 | 5.146,0 |
| 6529937 | 1 | 0,000 | -0,119 | 0,076 | 0,363 | — |
| 6548427 | 1 | 0,000 | -0,252 | 0,138 | 0,321 | 4.772,5 |
| 6548427 | 2 | 0,031 | -0,128 | 0,119 | 0,328 | 4.451,0 |
| 6554904 | 2 | 0,000 | -0,186 | 0,116 | 0,331 | 4.365,0 |
| 6554904 | 3 | 0,000 | -0,025 | 0,091 | 0,313 | 4.965,0 |
| 6565902 | 4 | 0,000 | -0,020 | 0,073 | 0,339 | 4.779,0 |
| 6565902 | 5 | 0,000 | -0,119 | 0,097 | 0,331 | 5.209,0 |
| 6565902 | 6 | 0,000 | -0,123 | 0,097 | 0,336 | 4.956,5 |
| 6565902 | 7 | 0,000 | -0,091 | 0,102 | 0,327 | 4.345,0 |
| 6565902 | 8 | 0,031 | -0,062 | 0,065 | 0,324 | 5.840,0 |
| 6565902 | 9 | 0,000 | -0,136 | 0,054 | 0,345 | 5.750,0 |
| 6565902 | 10 | 0,062 | 0,078 | 0,110 | 0,277 | 5.578,5 |
| 6565902 | 11 | 0,031 | 0,058 | 0,105 | 0,278 | 5.859,0 |

Contexto aportado por el autor: las columnas de turnos recitados y turnos con referencia a fuente están vacías en este brazo, y el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno conformado, del mismo orden que las diferencias entre brazos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 56 GB solo para pesos (27,78 B × 2 bytes); con caché KV y overhead conviene prever 64 GB o más.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o GH200. No cabe en una RTX 4090 (24 GB) ni en GPUs de 48 GB sin cuantización.
- Uso en GPU de consumo: solo mediante cuantización propia (no hay GGUF publicado). Una cuantización de 4 bits se situaría en torno a 15-16 GB estimados, lo que encajaría en una RTX 4090, pero requeriría generarla y validarla por cuenta propia.
- Entrenamiento: el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y se ejecutó con TP4 × PP4 (paralelismo de 16 vías) sobre 4 nodos GH200 de Isambard-AI, con 16 motores de rollout SGLang a tp=1.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (`dtype="bfloat16"`, `device_map="auto"`), además de vLLM y SGLang, que «lo cargan como el modelo base» según el autor. llama.cpp y Ollama no están soportados al no existir pesos GGUF.
- Latencia y throughput: no se publican métricas de latencia ni de tokens por segundo. Como referencia de coste, la mediana de tokens de pensamiento por rollout llega a 5.859, lo que implica generaciones muy largas en cada llamada del bucle agéntico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-baseline-cc-iter1 | 27,78 B | No disponible | Dr.GRPO RL sobre un juego ARC-AGI-3, sin SFT, solo texto | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de 1199 tensores) | No disponible | No disponible en esta ficha | Apache 2.0 | HuggingFace (modelo base referenciado) |
| Otras alternativas de tamaño similar o misma tarea | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el propio modelo base: este checkpoint conserva formas y dtypes, copia sin cambios la torre visual y la cabeza `mtp.*`, y solo difiere en el estado entrenado de la pila de texto y `lm_head`. No se dispone de datos de benchmarks estándar de ninguno de los dos en la información proporcionada, por lo que no es posible comparar rendimiento general.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado en un único juego (`cd82-fb555c5d`), evaluado en rollouts de 32 episodios de ese mismo juego, y las diferencias entre brazos son de centésimas en retorno conformado.
- Rendimiento absoluto muy bajo en la tarea: la tasa de niveles superados oscila entre 0,000 y 0,062 en los 12 rollouts registrados, y el retorno conformado es negativo en 14 de las 16 filas de la tabla.
- Ruido elevado: el propio autor cifra el ruido entre rollouts de un mismo brazo en aproximadamente 0,05 de retorno conformado, lo que dificulta extraer conclusiones de una sola iteración.
- Sesgos: no documentados. Al derivar de Qwen3.8-27B y entrenarse solo con texto de un juego, no hay evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no evaluado; el modo thinking del modelo base se mantiene y el entrenamiento no incorpora datos de verificación factual.
- Limitación multimodal: aunque el pipeline declarado es image-text-to-text, la torre visual no se entrenó y el actor nunca vio una imagen; no debe asumirse capacidad visual útil más allá de la heredada del base.
- Contexto e idiomas: la longitud de contexto y la lista de idiomas no están disponibles; el chat template es el del modelo base y el entrenamiento no incluyó instrucciones multilingües.
- Coste de inferencia: la mediana de tokens de pensamiento por rollout (4.345-5.859) implica un consumo de cómputo alto por llamada en bucles agénticos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se distribuye sin garantías y sin evaluación de producción; el checkpoint con estado del optimizador (≈351 GB) permanece en Isambard-AI y no se publica aquí.
- Trazabilidad parcial: el checkpoint se publica sin momentos del optimizador, aunque con los ficheros de contabilidad suficientes para reconstruir el estado de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL referenciado en la model card: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl- (la URL aparece truncada en la información proporcionada)
- Repositorio, papers, blogs o demos adicionales: no disponibles en la información proporcionada. Los resultados de búsqueda web recibidos no contienen enlaces pertinentes al modelo.

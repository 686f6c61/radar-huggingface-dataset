# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2 es un checkpoint de investigación publicado por el usuario ziyan98, derivado por fine-tuning del modelo base Qwen/Qwen3.8-27B (27.781.427.952 parámetros, pesos en bf16 safetensors). No es un modelo de propósito general ni una mejora general del modelo base: es el iteración 2 de un experimento de "internalización de conocimiento" (E2K, *experience-to-knowledge*) sobre un único juego de ARC-AGI-3 identificado como `cd82-fb555c5d`. El objetivo del estudio es comprobar si el conocimiento verificado extraído del propio juego del modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios multi-paso reales.

El entrenamiento combina una fase SFT de 2 rollouts (iteraciones 0-1, 303 filas del arnés IDD) con una fase de RL Dr.GRPO (rollouts 2-8) ejecutada con slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang en 4 nodos GH200 de Isambard-AI. La arquitectura es la del base, `Qwen3_5ForConditionalGeneration`: una pila de texto (`model.language_model.*`, `lm_head`), una torre de visión (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). Solo la pila de texto fue entrenada; la torre de visión y la cabeza MTP se copiaron sin cambios del checkpoint base.

Su relevancia es metodológica, no de producto: sirve como referencia reproducible de un pipeline de RL con verificación de conocimiento sobre agentes que juegan, y como evidencia negativa/positiva sobre si el conocimiento recited en contexto se consolida en los pesos. Las diferencias entre brazos del experimento son de centésimas de *shaped return*, y el propio autor advierte que el checkpoint no debe interpretarse como una mejora del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (pila de texto tipo transformer, torre de visión y cabeza de predicción multi-token); detalles internos del base no disponibles |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos bf16 safetensors |
| Idiomas soportados | No disponible (la model card no los declara; tokenizer heredado del base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con las mismas formas que Qwen/Qwen3.8-27B |

Otros datos: tamaño del repositorio 55,6 GB; pipeline declarado `image-text-to-text`; librería `transformers`; descargas 0 y likes 0 en el momento de la consulta; creado y actualizado el 2026-10-20.

## Arquitectura y entrenamiento

El checkpoint conserva exactamente el conjunto de tensores y las formas del base Qwen/Qwen3.8-27B. La pila de texto (`model.language_model.*`, `lm_head`) corresponde al estado entrenado en Megatron, con verificación de forma y dtype para cada tensor y de identidad bit a bit de los tensores copiados. La torre de visión (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) nunca formaron parte del modelo Megatron y se copiaron sin modificar desde el checkpoint base; el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. La conversión de torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); `E2K_VERIFY.json` recoge la comparación contra el base y `SHA256SUMS` cubre todos los ficheros.

El entrenamiento parte de 303 filas SFT del arnés IDD (`cd82-play-v4/sft/rows_paired.jsonl.gz`), que emparejan turnos de recitación escritos por el mismo modelo con el bloque de conocimiento en contexto con filas de repetición del juego, bajo la regla de lint C. El calendario es: 2 rollouts solo SFT (iteraciones 0-1), reinicio de Adam en la frontera SFT→RL y rollouts Dr.GRPO 2-8, relanzados desde la iteración 1 el 2026-09-17 tras un primer intento que ejecutó RL con momentos de Adam congelados. La configuración de RL usa `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por cada rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento; el arnés de juego es Claude Code CLI 2.1.270 operando las herramientas MCP `look`/`act`/`status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1-4 con tope de un nivel.

## Capacidades

- Generación de texto conversacional en el pipeline `text-generation` heredado del base (tag `conversational`), sin evaluación publicada en esta ficha.
- Razonamiento multi-paso dentro de un bucle de agente: el checkpoint fue entrenado y evaluado sobre episodios de juego de 32 rollouts con observación, acción y estado.
- Emisión de tokens de razonamiento extensos: en los rollouts analizados la mediana de *think tokens* se sitúa entre 5.156 y 6.887,5 por episodio.
- Interacción con herramientas: en el arnés de evaluación el modelo opera las herramientas MCP `look`, `act` y `status` a través de Claude Code CLI.
- Internalización de conocimiento: el eje del experimento es si el conocimiento recitado en contexto se consolida en los pesos; el autor reporta 0,000 turnos recitados en los rollouts medidos, con 0,272-0,436 turnos con referencia a fuente.
- Capacidades de visión: la arquitectura incluye torre visual y el pipeline declarado es `image-text-to-text`, pero la torre no se entrenó y el actor nunca procesó imágenes; no hay evidencia de rendimiento multimodal.
- Capacidades multilingües: no disponibles; la model card no documenta idiomas.
- Modo *thinking* explícito: no se declara una etiqueta de modo, pero el comportamiento observado incluye razonamiento previo a la acción.

## Casos de uso

- Estudio de internalización de conocimiento: usar el checkpoint como brazo "idd-cc" de la comparación entre recitar conocimiento en contexto y escribirlo en los pesos, midiendo *clear rate* y *shaped return* sobre el mismo juego con la misma semilla de motor.
- Reproducción de infraestructura de RL: reconstruir el estado de entrenamiento (sin momentos de optimizador) con `convert_hf_to_torch_dist.py` de slime a partir de `megatron/`, y validar que una pila Megatron-LM TP4 × PP4 con 16 motores SGLang reproduce los pasos de optimizador del run.
- Ablación de hiperparámetros de Dr.GRPO: reutilizar este checkpoint como punto de partida para variar el reinicio de Adam, el batch global o el número de pasos por rollout y medir el efecto sobre el *shaped return* con el ruido de referencia de ±0,05.
- Investigación sobre agentes que juegan: analizar las trazas de los 32 episodios por rollout (cambio de paso, *no-op rate*, tokens de pensamiento) para estudiar la exploración de un agente LLM en un entorno ARC-AGI-3 con tope de un nivel por episodio.
- Docencia y divulgación técnica: ilustrar un pipeline completo SFT→RL con verificación de conversión bit a bit (`E2K_VERIFY.json`, `SHA256SUMS`) en cursos de posgrado sobre entrenamiento de LLM.
- Auditoría de checkpoints de investigación: servir de caso de estudio sobre cómo documentar procedencia (argumentos Megatron en `megatron/args.json`, cursor de datos `global_dataset_state_dict_<N>.pt`) y por qué un checkpoint de un solo juego no debe desplegarse como asistente general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card publica métricas de juego por rollout, extraídas de los logs de los jobs:

| Job | Rollout | Clear rate | Shaped return | Step change | Step no-op | Think tokens p50 | Turnos recitados | Turnos con ref. a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5.563,5 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5.814,0 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5.668,0 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5.156,0 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5.525,0 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6.497,5 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5.622,5 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6.598,5 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5.377,0 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6.887,5 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5.595,5 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5.211,0 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5.367,0 | 0,000 | 0,362 |

El autor advierte que el primer rollout de RL tras un bloque solo SFT lo juega la política solo SFT, por lo que mide el efecto de las filas por sí mismas, y que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de *shaped return*.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB en disco y en memoria. La inferencia en bf16 requiere por encima de 55,6 GB de VRAM solo para pesos; con caché KV y activaciones, una estimación razonable es 62-70 GB.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200; también válido un despliegue tensor-parallel en 4 × RTX 4090/3090 (96 GB agregados).
- Cabe en GPU de consumo: no en bf16 con una sola tarjeta de 24 GB. En 4 bits (estimación de 14-16 GB de pesos, 18-20 GB con overhead) cabría en una RTX 4090 o RTX 3090 de 24 GB, pero el repositorio no publica artefactos cuantizados y habría que generarlos desde los safetensors.
- Despliegue: vLLM o TGI para bf16 en varias GPU; llama.cpp u Ollama solo tras convertir a GGUF, conversión no publicada. La model card incluye un fragmento de carga con `AutoProcessor` y `Qwen3_5ForConditionalGeneration.from_pretrained(...)` (truncado en la información disponible).
- Entrenamiento: 4 nodos GH200 de Isambard-AI con Megatron-LM TP4 × PP4 (16 vías de paralelismo) y 16 motores SGLang con tp=1. El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2 | 27,78 mil millones | No disponible | Métricas solo del juego `cd82-fb555c5d` (tabla anterior); sin benchmarks estándar | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | No disponible | No disponible en la información proporcionada | Apache 2.0 (según el campo `license` del derivado) | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (agentes sobre ARC-AGI-3 o checkpoints de internalización de conocimiento) en la información proporcionada. Cualquier comparación con modelos de ~27B de propósito general carecería de base empírica aquí.

## Limitaciones y advertencias

- No es una mejora de propósito general: fue entrenado sobre un único juego (`cd82-fb555c5d`), evaluado con rollouts de 32 episodios de ese mismo juego, y las diferencias entre brazos son de centésimas de *shaped return*.
- Las métricas publicadas tienen ruido: el propio autor estima ±0,05 de *shaped return* entre rollouts de un mismo brazo, del orden de las diferencias que se pretenden medir.
- La torre de visión no se entrenó y el actor nunca procesó imágenes; aunque el pipeline se declara `image-text-to-text`, no hay evidencia de capacidad multimodal útil.
- La cabeza de predicción multi-token (`mtp.*`) se copió sin entrenar, por lo que no refleja el estado del run.
- No hay resultados de benchmarks estándar ni evaluación de idiomas, sesgos o alucinación en la información disponible; se desconoce el comportamiento fuera del juego.
- El conocimiento no aparece en el prompt de RL; los turnos recitados medidos son 0,000, de modo que no se demuestra internalización efectiva en este checkpoint.
- Estado de entrenamiento incompleto en el repositorio: `megatron/` permite reconstruir el estado salvo los momentos del optimizador, que quedan solo en Isambard-AI.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución y sin garantías, pero el uso en producción de este checkpoint concreto no está respaldado por ninguna evaluación de calidad.
- Repositorio con 0 descargas y 0 likes y creado/actualizado el mismo día: no hay validación de la comunidad ni mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.

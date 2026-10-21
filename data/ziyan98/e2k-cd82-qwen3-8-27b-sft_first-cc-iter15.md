# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter15

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first-cc-iter15 es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace), resultado del experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. Se construye por fine-tuning del modelo base Qwen/Qwen3.8-27B, un transformer multimodal de 27.781.427.952 parámetros (27,78 mil millones) con pila de texto y torre de visión, y corresponde a la iteración 15 de Megatron del run `sft_first-cc`.

El experimento aborda una pregunta concreta: si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos. Para ello se usaron 391 filas de QA declarativo derivadas de un conjunto de conocimiento de 888 átomos, seguidas de RL con Dr.GRPO a través del arnés de Claude Code sobre las herramientas MCP `look`/`act`/`status`.

Su relevancia es fundamentalmente metodológica y negativa: el run está marcado como superado (superseded) y los resultados publicados muestran una tasa de nivel completado de 0,000 y un retorno con forma (shaped return) de −0,050 en los 14 rollouts registrados, con `step no-op` igual a 1,000 en la mayoría. El autor advierte explícitamente de que no es una mejora de propósito general de Qwen3.8-27B. La longitud de contexto, los idiomas soportados y los tipos de cuantización no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3_5 (pila de texto `model.language_model.*` + torre de visión `model.visual.*` + cabeza de predicción multi-token `mtp.*`); número de capas, atención y detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos en bf16 (no se incluyen GGUF ni AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con las mismas formas que el modelo base; repo de 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text |
| Biblioteca | transformers (clase `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura del modelo base: un transformer multimodal Qwen3_5 con 1199 tensores cuyo conjunto y formas coinciden exactamente con Qwen/Qwen3.8-27B. La parte entrenada es únicamente la pila de texto (`model.language_model.*` y `lm_head`), que proviene del estado de Megatron; la torre de visión (`model.visual.*`) y la cabeza de predicción multi-token (`mtp.*`) se copiaron sin cambios desde el checkpoint base, ya que el entrenamiento fue solo de texto y el actor nunca vio una imagen. La conversión de Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming por trozos (`convert_torch_dist_to_hf_lowmem.py`), con verificación de formas y dtypes y comprobación de identidad bit a bit de los tensores copiados (`E2K_VERIFY.json`, `SHA256SUMS`).

El entrenamiento consta de un calentamiento supervisado con 391 filas de QA declarativo (construidas sobre un conjunto de conocimiento de 888 átomos, fichero `sft_data.jsonl`) y después RL con Dr.GRPO a través del arnés de Claude Code, con 16 rollouts planificados y checkpoints cada 4. La pila es slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang a tp=1, en 4 nodos GH200 de Isambard-AI. Los hiperparámetros registrados son: estimador de ventaja GRPO con `--no-normalize-advantages`, `--disable-grpo-std-normalization` y `--calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento; el arnés de juego es Claude Code CLI 2.1.270 con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno con forma sobre los niveles completados. El análisis de recital posterior mostró que las filas de chat no se transfieren al juego, motivo por el que los brazos con filas de arnés (IDD, act-ctrl, brazo C) sustituyeron a este.

## Capacidades

- Generación de texto conversacional y respuesta a QA declarativo sobre el conjunto de conocimiento del juego entrenado.
- Uso de herramientas (tool calling) a través de herramientas MCP concretas: `look`, `act` y `status` de `knowledge_learning.loop.arc_mcp`.
- Razonamiento agéntico multi-paso en el juego ARC-AGI-3 `cd82-fb555c5d`, con hasta 4 niveles y tope de un nivel por episodio.
- Modo thinking heredado del modelo base, sin cambios según la model card (tokens de pensamiento medidos como `think tokens p50` en los registros).
- Capacidad multimodal teórica por la torre de visión heredada del base, aunque no fue entrenada en este run y el actor nunca procesó imágenes.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- No se han evaluado ni documentado capacidades de código, matemáticas o visión para este checkpoint.

## Casos de uso

- Estudio de internalización de conocimiento: reproducir el brazo `sft_first` con las 391 filas de QA y medir la NLL de conocimiento por paso de SFT (`train/sft_cite_nll_sum / train/sft_cite_tokens`) para analizar si el conocimiento se escribe en los pesos.
- Línea base de comparación: servir como referencia frente a los brazos posteriores con filas de arnés (IDD, act-ctrl, brazo C), que según la model card son los que sí aproximan el conocimiento a la conducta de juego.
- Reproducción de experimentos de RL agéntico: la carpeta `megatron/` conserva `common.pt`, `args.json`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Auditoría de pipelines de conversión Megatron → HuggingFace: el repo incluye `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS`, útiles para validar conversiones bit a bit de modelos de 27,78 mil millones de parámetros.
- Investigación sobre recital frente a transferencia: los registros incluyen métricas de `recited turns` y `source-ref turns` por rollout, lo que permite estudiar la diferencia entre repetir conocimiento y aplicarlo durante el juego.
- Desarrollo y depuración de arneses MCP para entornos de juego: el checkpoint permite probar la interfaz `look`/`act`/`status` y el bucle de Claude Code CLI sobre un modelo que responde a esas herramientas.
- Inicialización para fine-tuning posterior en investigación: al mantener intactos tokenizador, chat template, generation config y processor, puede cargarse como el modelo base y reentrenarse con otro esquema de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica métricas de juego del run, por rollout, extraídas de los registros de trabajos:

| Job | Rollout | Tasa de nivel completado | Retorno con forma | `step change` | `step no-op` |
|---|---:|---:|---:|---:|---:|
| 6531143 | 4 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 5 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 6 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 7 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 8 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 9 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 10 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 11 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6529938 | 12 | 0,000 | −0,052 | 0,000 | 0,943 |
| 6531143 | 12 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6529938 | 13 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 13 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 14 | 0,000 | −0,050 | 0,000 | 1,000 |
| 6531143 | 15 | 0,000 | −0,050 | 0,000 | 1,000 |

El propio autor indica que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno con forma, por lo que las diferencias entre brazos son de centésimas y no deben interpretarse como señal. El primer rollout de RL tras un bloque solo de SFT lo juega la política solo-SFT, de modo que mide el efecto de las filas por sí mismas.

## Requisitos de hardware

- VRAM para inferencia en bf16: el repo pesa 55,6 GB en safetensors, por lo que se necesitan aproximadamente 56 GB solo para pesos, más caché KV y activaciones; en la práctica, un acelerador de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GH200 (el entrenamiento se hizo en 4 nodos GH200 de Isambard-AI). Para bf16 en GPUs de 24 GB haría falta reparto con tensor parallelism (por ejemplo, 4 × RTX 4090/3090) y no está verificado en la información disponible.
- Cabe en GPU de consumo: no de forma directa en bf16 con una sola tarjeta de 24 GB; no se publican pesos cuantizados (GGUF, AWQ, GPTQ) que permitan reducirlo.
- Checkpoint completo de entrenamiento: aproximadamente 351 GB incluyendo estado del optimizador, conservado en Isambard-AI y no publicado en el repo.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")` y `AutoProcessor`; vLLM y SGLang lo cargan igual que el modelo base según la model card. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first-cc-iter15 | 27,78 mil millones | No disponible | Tasa de nivel completado 0,000; retorno con forma −0,050 en el juego `cd82-fb555c5d` | Apache 2.0 | Pesos bf16 en HuggingFace (55,6 GB); 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones (mismo conjunto de 1199 tensores) | No disponible | No evaluado en esta información para el juego; referencia de partida del fine-tuning | Apache 2.0 | Pesos públicos en HuggingFace |
| Otros modelos de ~27B comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto de alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa con modelos de la misma categoría distintos del propio modelo base.

## Limitaciones y advertencias

- Entrenado sobre un único juego (`cd82-fb555c5d`); no es una mejora de propósito general y el autor lo declara explícitamente.
- Rendimiento degenerado en los rollouts publicados: tasa de nivel completado 0,000, retorno con forma de −0,050 y `step no-op` de 1,000 en 13 de los 14 registros, es decir, la política tiende a no actuar.
- Las diferencias entre brazos del experimento son de centésimas de retorno con forma, dentro del ruido de aproximadamente 0,05 entre rollouts; no deben interpretarse como mejoras significativas.
- El run está marcado como superado por los brazos con filas de arnés (IDD, act-ctrl, brazo C) tras el análisis de recital, que mostró que las filas de chat no se transfieren al juego.
- Riesgo de recital: el modelo puede repetir conocimiento declarativo sin aplicarlo a la conducta; los registros incluyen columnas `recited turns` y `source-ref turns`, aunque los valores están vacíos en la tabla publicada.
- La torre de visión se copia sin cambios y no se entrenó en este run; no hay evidencia de rendimiento multimodal para este checkpoint.
- No se informan sesgos, idiomas soportados ni evaluaciones de seguridad, por lo que no hay base para valorar su comportamiento fuera del dominio de entrenamiento.
- Licencia Apache 2.0, que permite uso comercial, pero al tratarse de un checkpoint de investigación sin evaluaciones de robustez ni de alucinación, no es adecuado para producción sin validación previa.
- El estado completo del optimizador (≈351 GB) no está publicado; solo es posible reconstruir el estado de entrenamiento sin momentos del optimizador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter15
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL con la lista de checkpoints del run (`checkpoints/checkpoints.md`, curvas W&B y configuraciones `rl_config_*.json`): `ziyan98/E2K-cd82-rl-internalization` (la URL aparece truncada en la model card; no se dispone del enlace completo)
- Repositorio de slime (pila de entrenamiento, sin enlace en la información disponible)
- No se han proporcionado enlaces a papers, blogs ni demos adicionales.

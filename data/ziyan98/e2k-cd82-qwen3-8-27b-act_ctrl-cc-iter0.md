# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter0

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter0 es un checkpoint de investigación publicado por el usuario ziyan98, obtenido al aplicar el experimento de internalización de conocimiento E2K sobre el modelo base Qwen/Qwen3.8-27B (27.781.427.952 parámetros reales según los safetensors). El modelo conserva la arquitectura del base (etiqueta `qwen3_5` en HuggingFace, con torre visual y cabeza de predicción multi-token), pero solo se ha entrenado la pila de texto: la torre de visión `model.visual.*` y la cabeza `mtp.*` se copian sin modificar del checkpoint original. El problema que aborda es de investigación: comprobar si el conocimiento verificado extraído de las propias partidas de un modelo se puede escribir en sus pesos mediante filas supervisadas y después mejorar con RL sobre episodios reales multietapa.

El checkpoint corresponde al brazo de control `act_ctrl-cc` del experimento (configuración de lanzamiento `rl_config_cc_idd.json` con las filas act-ctrl), iteración 0 de Megatron. Se entrenó con 303 filas SFT del propio arnés del modelo base (sin conocimiento inyectado, como control emparejado del brazo IDD), seguidas de dos rollouts de RL con Dr.GRPO que se cancelaron el 18 de septiembre de 2026 para liberar la GPU destinada a los brazos con conocimiento. El autor advierte explícitamente de que no es una mejora de propósito general de Qwen3.8-27B: se entrenó y evaluó sobre un único juego de ARC-AGI-3 (`cd82-fb555c5d`), con 32 episodios por rollout, y las diferencias entre brazos son de centésimas en retorno modelado.

Su relevancia es metodológica, no de producto: documenta de forma completa la trazabilidad del entrenamiento (argumentos de Megatron, conversión torch_dist a HF verificada bit a bit, sumas SHA256, cursor de datos de rollout) y publica las métricas de juego por rollout. La licencia es apache-2.0 y el repo ocupa 55,6 GB en safetensors bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre visual y cabeza de predicción multi-token (familia `qwen3_5`; clase `Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados solo en bf16 safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (heredados del modelo base, sin listado en la información proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors bf16, 1199 tensores con el mismo conjunto y formas que Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B: un transformer denso de 27,78 B de parámetros con pila de lenguaje (`model.language_model.*`, `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). El entrenamiento de este checkpoint fue exclusivamente de texto: el actor nunca vio una imagen, por lo que la torre visual y la cabeza MTP no formaron parte del modelo en Megatron y se copiaron sin cambios desde el checkpoint base. La conversión de formato Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming por trozos sobre un nodo de login con `convert_torch_dist_to_hf_lowmem.py`; el mismo conversor reproduce los safetensors originales del base bit a bit, y `E2K_VERIFY.json` recoge la comparación contra el base.

El pipeline de entrenamiento usó slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI, en bf16 con backend flash-attn 2.8.3. El esquema fue: dos rollouts solo SFT (iteraciones 0–1), reinicio de Adam y rollouts de RL con Dr.GRPO (iteraciones 2–3), cancelados posteriormente; esta ficha corresponde a la iteración 0. Hiperparámetros de RL: `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6. El prompt de RL nunca contiene conocimiento. Las filas SFT son 303 turnos del propio arnés del modelo base (`cd82-play-v4/sft/rows_actctrl.jsonl.gz`), sin conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0 y niveles 1–4 con tope de un nivel por episodio.

## Capacidades

- Generación de texto conversacional y modo thinking heredados del base Qwen3.8-27B; la plantilla de chat y el modo thinking no se han modificado.
- Uso de herramientas mediante MCP: el checkpoint fue entrenado y evaluado llamando a las herramientas `look`, `act` y `status` sobre el entorno ARC-AGI-3.
- Razonamiento multietapa dentro de un episodio de juego, con presupuesto de tokens de pensamiento elevado (mediana de 3347 a 4504 tokens por rollout en los datos publicados).
- Procesamiento image-text-to-text declarado en el pipeline, pero la torre visual no se entrenó y el modelo solo vio texto durante el ajuste.
- Capacidad de referencia a fuentes (`source-ref turns`) en el 21–27 % de los turnos, y ausencia total de turnos recitados (`recited turns` = 0,000 en todos los rollouts).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No hay evidencia de mejora en código, matemáticas o visión: no se publican evaluaciones de esas capacidades para este checkpoint.

## Casos de uso

- Estudio de internalización de conocimiento: usar este checkpoint como brazo de control frente al brazo IDD del mismo experimento, ejecutando los mismos 32 episodios del juego `cd82-fb555c5d` con semilla de motor 0 y comparando el retorno modelado, que el autor cifra en diferencias de centésimas entre brazos.
- Reproducción de experimentos de RL con Dr.GRPO: el repo incluye `megatron/args.json`, `common.pt`, el cursor `global_dataset_state_dict_<N>.pt` y los ficheros `rl_config_*.json` del dataset, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py`.
- Auditoría de pipelines de conversión Megatron a HuggingFace: `E2K_VERIFY.json` y `SHA256SUMS` permiten validar tensor a tensor la fidelidad de la conversión y comprobar la identidad bit a bit de los tensores copiados del base.
- Evaluación de arneses de agentes basados en MCP: sirve como política de referencia para medir tasas de no-op (0,360–0,425 en los rollouts publicados) y cambios de paso (0,040–0,083) de un agente que conduce herramientas `look`/`act`/`status` mediante Claude Code CLI.
- Generación de datos de comparación para experimentos de conocimiento: las 303 filas SFT del arnés y las métricas por rollout permiten construir líneas base reproducibles antes de introducir filas con conocimiento citado.
- Estudio de coste computacional en inferencia de un modelo de 27,78 B en formato bf16 íntegro, como referencia de VRAM y latencia para clústeres con GH200 o H100.
- No se recomienda como sustituto del base en tareas de producción: el propio autor indica que no es una mejora de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son las de juego del arnés, por rollout:

| job | rollout | clear rate | shaped return | step change | step no-op | think tokens p50 | recited turns | source-ref turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,000 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,000 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,000 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,000 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,000 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,000 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,000 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,500 | 0,000 | 0,269 |

Según el autor, el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 en retorno modelado, por lo que las diferencias observadas entre brazos (centésimas) quedan por debajo de ese umbral.

## Requisitos de hardware

- VRAM estimada en bf16: unos 55,6 GB solo para pesos (el repo ocupa 55,6 GB), más caché KV y activaciones; en la práctica requiere GPUs de 80 GB para contexto moderado.
- El checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y reside en Isambard-AI; el repo de HuggingFace contiene únicamente los pesos convertidos.
- GPUs recomendadas: H100 80 GB o A100 80 GB para bf16 en una sola tarjeta; GH200, que es el hardware empleado en el entrenamiento (4 nodos). Para reparto multi-GPU, 2 × A100 40 GB o 4 × RTX 4090 24 GB con cuantización.
- En GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB); requeriría cuantización a 4 bits (estimación de 14–16 GB para pesos) más el coste de caché KV, para la que no se publican ficheros GGUF.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`, y vLLM o SGLang, que el autor indica que lo cargan igual que el modelo base. llama.cpp u Ollama requerirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponibles. Como referencia de despliegue, el entrenamiento usó 16 motores de rollout SGLang con tp=1 sobre 4 nodos GH200.
- Nota: la torre visual se carga aunque no se entrenó; si solo se necesita texto, conviene verificar si el runtime permite omitirla para ahorrar memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter0 (este) | 27,78 B | no disponible | SFT act-ctrl (303 filas) + Dr.GRPO parcial, un solo juego ARC-AGI-3 | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de tensores, 1199) | no disponible | modelo base sin el ajuste E2K | no disponible en la información | HuggingFace |
| Brazo IDD del mismo experimento (`sft_first`, filas con conocimiento) | 27,78 B | no disponible | SFT con filas de conocimiento + RL, mismo juego | apache-2.0 (serie E2K) | misma serie de repositorios, listada en `checkpoints/checkpoints.md` del dataset de RL |
| Otras iteraciones del run `act_ctrl-cc` | 27,78 B | no disponible | iteraciones 1 (solo SFT) y 2–3 (tras un rollout RL cada una) | apache-2.0 | un repositorio por iteración, según `checkpoints.md` |

No se dispone de datos para comparar con modelos de otros autores en la misma categoría (agentes sobre ARC-AGI-3), por lo que la comparación se limita a las variantes del propio experimento y al modelo base.

## Limitaciones y advertencias

- No es una mejora de propósito general: el entrenamiento y la evaluación se restringieron a un único juego (`cd82-fb555c5d`) y a 32 episodios por rollout.
- Rendimiento de juego bajo: clear rate de 0,000 en 7 de los 8 rollouts publicados y de 0,031 en uno; retorno modelado negativo en todos los casos (entre -0,516 y -0,205).
- Las diferencias frente a otros brazos son de centésimas en retorno modelado, por debajo del ruido entre rollouts (~0,05), así que no deben interpretarse como mejoras reales.
- Entrenamiento solo de texto: la torre visual y la cabeza MTP se copian sin cambios del base, por lo que el pipeline `image-text-to-text` está declarado pero no fue ajustado.
- El modo thinking y la plantilla de chat son los del base, sin cambios; cualquier sesgo, riesgo de alucinación o limitación idiomática del base se hereda sin mitigación específica.
- Idiomas soportados no documentados en la información disponible; no se ha verificado el comportamiento multilingüe de este checkpoint.
- Fecha de creación del repo (2026-10-20) y cancelación del RL (2026-09-18): es un artefacto de investigación congelado, sin mantenimiento previsto.
- Licencia apache-2.0 permite uso comercial, pero el estado del modelo (control sin conocimiento, clear rate casi nulo) lo hace inadecuado para producción.
- El estado del optimizador no se incluye en el repo de HuggingFace (solo en Isambard-AI), de modo que una reproducción exacta del entrenamiento no es posible solo con estos pesos.
- El checkpoint no debe evaluarse con las herramientas MCP sin reproducir el arnés exacto (Claude Code CLI 2.1.270, semilla de motor 0, niveles 1–4 con tope de un nivel), ya que las métricas publicadas dependen de esa configuración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter0
- Dataset de RL del experimento (episodios, métricas, filas y log del run): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset con el conjunto de conocimiento del arnés: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- La model card original enlaza un tercer dataset de la serie cuyo URL aparece truncado en la información disponible; no se reproduce para no inventar la dirección.
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.

# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter2

## Resumen

Este repositorio contiene un checkpoint de investigación denominado E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter2, publicado por el usuario ziyan98. No es un modelo nuevo entrenado desde cero, sino un ajuste fino de Qwen/Qwen3.8-27B (27.781.427.952 parámetros reales según los safetensors) obtenido dentro del experimento E2K de "internalización de conocimiento" sobre el juego `cd82-fb555c5d` de ARC-AGI-3. El objetivo del estudio es comprobar si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos.

El checkpoint corresponde a la iteración 2 de Megatron dentro del run `sft_first_decl-cc4`, es decir, la política resultante de tres rollouts de SFT con filas declarativas (NLL de conocimiento ≈ 1,2 por token) antes de que arrancase el bloque de RL. El autor advierte explícitamente de que no se trata de una mejora general de Qwen3.8-27B: se entrenó con texto sobre un único juego y se evaluó con rollouts de 32 episodios de ese mismo juego, donde las diferencias entre brazos son de centésimas de retorno con shaping.

Su relevancia es metodológica, no de producto. Documenta de forma inusualmente completa la trazabilidad del entrenamiento (argumentos de Megatron, estado del optimizador, cursor de datos, conversión verificada bit a bit contra el checkpoint base) y sirve como artefacto reproducible para estudiar internalización de conocimiento, olvido catastrófico y dinámica de la longitud de pensamiento en modelos híbridos texto-visión de la familia Qwen3.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión `model.visual.*` y cabeza de predicción multi-token `mtp.*` |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 en safetensors; no se han publicado variantes GGUF, AWQ, GPTQ ni FP8 en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con los mismos nombres y formas que Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El checkpoint reutiliza la arquitectura del modelo base sin modificaciones estructurales: el conjunto de tensores y sus formas coinciden con Qwen/Qwen3.8-27B (1199 tensores). El stack de texto (`model.language_model.*` y `lm_head`) contiene el estado entrenado en Megatron-LM, convertido a HuggingFace con el mapeo `megatron_to_hf.convert_to_hf` de slime y verificado forma, dtype e identidad bit a bit de los tensores copiados. La torre de visión (`model.visual.*`) y la cabeza MTP (`mtp.*`) nunca formaron parte del modelo de Megatron: se copiaron sin cambios desde el checkpoint base, ya que el entrenamiento fue exclusivamente de texto y el actor no vio ninguna imagen. Configuración, tokenizador, plantilla de chat, configuración de generación y de procesador son también los del modelo base (listados en `E2K_CONVERSION.json`).

El entrenamiento se organizó en tres rollouts solo de SFT (0–2) con reinicio de Adam, seguidos de RL a partir del rollout 3. Las filas de SFT son filas declarativas de chat construidas a partir de un conjunto de conocimiento de 888 átomos (formatos qa/rule/sentence, apertura de *think* variada y finalización con tool calls: la respuesta queda dentro del bloque de pensamiento y el turno termina con llamadas a herramientas del juego), mezcladas con filas ancla del modelo base con ratio 1.0, a razón de 896 filas de chat por rollout de SFT. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a tp=1 sobre 4 nodos GH200 de Isambard-AI; el algoritmo es Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look`/`act`/`status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno con shaping sobre los niveles completados.

El resultado de esta iteración es una política que no colapsa a una única llamada, pero cuyo pensamiento se reduce a aproximadamente un tercio de la longitud del modelo base (p50 de 1.925 tokens) y en la que el conocimiento aparece solo como una mezcla difusa.

## Capacidades

- Generación de texto conversacional multi-turno con la plantilla de chat original del modelo base, modo de pensamiento (*thinking*) sin cambios.
- Razonamiento extenso en formato de bloque de pensamiento con cierre en llamadas a herramientas, tal y como se le enseñó en las filas de SFT.
- Tool calling / function calling: las filas declarativas terminan el turno con llamadas a las herramientas del juego, lo que refuerza ese patrón de salida.
- Juego agéntico de varios pasos sobre ARC-AGI-3 mediante las herramientas `look`, `act` y `status` del arnés MCP.
- Recuperación parcial del conocimiento inyectado: el conocimiento de 888 átomos se manifiesta como mezcla difusa, con una tasa de turnos con referencia a fuente de 0,070–0,077 y 0,000 turnos de recitación literal.
- Capacidad de visión: la torre visual está presente y es funcional en teoría (el pipeline declarado es image-text-to-text), pero se copió congelada del modelo base y no fue entrenada; no hay evidencia en la información disponible de su comportamiento tras el ajuste.
- Capacidades multilingües: no disponible.
- No se documentan capacidades específicas de matemáticas, código o audio para este checkpoint.

## Casos de uso

- Reproducción de experimentos de internalización de conocimiento: el repositorio incluye `megatron/args.json`, `common.pt`, el estado del optimizador y el cursor de datos (`global_dataset_state_dict_<N>.pt`), lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime y repetir la iteración 2.
- Línea base de ablación para el estudio E2K: al ser la política resultante de tres rollouts solo de SFT, sirve para medir cuánto aporta el bloque de RL posterior comparando con las iteraciones siguientes de la serie listadas en `checkpoints/checkpoints.md`.
- Investigación sobre olvido catastrófico y deriva del razonamiento: la caída del p50 de tokens de pensamiento a 1.925 y la aparición de conocimiento difuso permiten estudiar cómo el ajuste supervisado estrecho degrada o comprime el razonamiento general.
- Desarrollo y depuración de arneses agénticos: útil para probar la integración de herramientas MCP (`look`/`act`/`status`), el formateo de observaciones de juego y la política de parada en un agente basado en LLM.
- Estudio de recetas de RL con Dr.GRPO sobre episodios largos: el run documenta batch global 4, 8 pasos por rollout de 32 episodios y lr 5e-6, valores reutilizables como punto de partida en experimentos similares con slime y Megatron-LM.
- Docencia y divulgación técnica: ejemplo real de pipeline completo Megatron torch_dist → HuggingFace con verificación bit a bit, conversión de bajo consumo de memoria (`convert_torch_dist_to_hf_lowmem.py`) y publicación de checkpoints intermedios con sumas SHA256.
- Verificación de conversiones de pesos: al reproducir el convertidor los safetensors originales de Qwen/Qwen3.8-27B bit a bit desde el checkpoint torch_dist, el repositorio sirve como caso de prueba de herramientas de conversión (fichero `E2K_VERIFY.json`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas publicadas son las de juego del propio run, extraídas de los logs del trabajo:

| Métrica | Rollout 3 | Rollout 4 |
|---|---:|---:|
| Tasa de niveles completados (clear rate) | 0,000 | 0,000 |
| Retorno con shaping | -0,163 | -0,077 |
| Cambio de paso (step change) | 0,035 | 0,029 |
| Paso sin efecto (step no-op) | 0,323 | 0,262 |
| Tokens de pensamiento, p50 | 1.925,000 | 1.112,000 |
| Turnos con recitación literal | 0,000 | 0,070 |
| Turnos con referencia a fuente | 0,077 | 0,070 |

El autor indica que el primer rollout de RL tras un bloque solo de SFT lo juega la política SFT-only, por lo que el rollout 3 mide el efecto de las filas por sí mismas, y que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con shaping. No hay comparación numérica publicada contra el modelo base en esta información.

## Requisitos de hardware

- VRAM estimada en bf16: unos 55,6 GB solo para pesos (27,78 mil millones de parámetros × 2 bytes), más caché KV y activaciones; en la práctica requiere GPU de 80 GB o sharding. Estimación calculada a partir del recuento de parámetros, no publicada por el autor.
- VRAM estimada en 8 bits: unos 28 GB de pesos más sobrecarga. VRAM estimada en 4 bits: unos 14 GB de pesos más sobrecarga (cifras orientativas; no hay cuantizaciones publicadas).
- GPU recomendadas: H100 80 GB, A100 80 GB o GH200 96 GB para bf16 en una sola GPU; el run original usó 4 nodos GH200 de Isambard-AI con TP4 × PP4 para entrenamiento.
- GPU de consumo: en bf16 no cabe en ninguna tarjeta consumer actual. En 4 bits podría encajar en una RTX 4090 de 24 GB, pero requeriría convertir los pesos por cuenta propia, ya que no se ofrece GGUF ni ninguna cuantización.
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (dtype bfloat16, `device_map="auto"`); vLLM y SGLang lo cargan igual que el modelo base según la model card. llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.
- Almacenamiento: el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI; el repositorio publica solo los pesos convertidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter2 | 27,78 B | no disponible | SFT declarativo sobre un juego ARC-AGI-3 (3 rollouts), sin RL en esta iteración | Apache 2.0 | Pesos bf16 en HuggingFace; 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de tensores) | no disponible | Modelo base multimodal Qwen3.5 | Apache 2.0 (según la información del checkpoint derivado) | Público en HuggingFace |
| Iteraciones posteriores de la serie E2K-cd82 (con RL) | 27,78 B | no disponible | SFT + Dr.GRPO sobre el mismo juego | Apache 2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL; métricas no incluidas en esta información |
| Otras alternativas de tamaño similar (p. ej. modelos abiertos de ~27–32 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados comparables de terceros (MMLU, HumanEval, GSM8K) para establecer una comparación de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor lo declara explícitamente; se entrenó con texto sobre un único juego (`cd82-fb555c5d`) y se evaluó con rollouts de 32 episodios de ese mismo juego.
- Rendimiento en la tarea objetivo: tasa de clear rate de 0,000 y retorno con shaping negativo (-0,163 y -0,077) en los dos rollouts medidos; las diferencias entre brazos son de centésimas y el ruido entre rollouts es de ~0,05, por lo que no hay evidencia de mejora.
- Conocimiento internalizado solo de forma difusa: NLL de conocimiento ≈ 1,2 por token tras tres rollouts, con 0,000 turnos de recitación literal en el rollout 3.
- Compresión del razonamiento: el pensamiento se reduce a cerca de un tercio de la longitud del base (p50 de 1.925 tokens) y baja aún más en el rollout 4 (1.112), lo que puede degradar tareas que requieran cadenas largas.
- Sesgo de arnés: el entrenamiento y la evaluación dependen de Claude Code CLI 2.1.270 y de las herramientas MCP de `knowledge_learning.loop.arc_mcp`; el comportamiento fuera de ese entorno no está caracterizado.
- Visión no entrenada: la torre visual es una copia congelada del base, así que el pipeline declarado image-text-to-text no implica que el ajuste haya mejorado nada multimodal.
- Idiomas y contexto: sin datos publicados, no se puede garantizar comportamiento multilingüe ni una ventana de contexto concreta.
- Riesgo de alucinación: no cuantificado en la información disponible; el patrón entrenado (respuesta dentro del bloque de pensamiento y cierre con tool calls) puede producir llamadas a herramientas plausibles pero incorrectas.
- Sesgos: no se documenta ninguna evaluación de sesgos.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen/Qwen3.8-27B conviene revisar también los términos del modelo base; el checkpoint es un artefacto de investigación sin garantías de idoneidad para producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un checkpoint de un experimento académico, no un modelo mantenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc4-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del run (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Conjunto de conocimiento (888 átomos): https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código citado en la model card: `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`)
- Documentación de slime (pila de RL utilizada): no disponible en la información proporcionada
- Documentación de Megatron-LM (pila de entrenamiento): no disponible en la información proporcionada
- Resultados de benchmarks estándar: no disponibles en la información proporcionada

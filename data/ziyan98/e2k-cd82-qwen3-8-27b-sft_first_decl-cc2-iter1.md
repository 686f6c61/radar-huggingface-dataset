# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter1

## Resumen

Este repositorio contiene un checkpoint de investigación denominado E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter1, publicado por Ziyan Wang (King's College London) y derivado del modelo base Qwen/Qwen3.8-27B. No se trata de una mejora de propósito general del modelo, sino del resultado de un experimento de internalización de conocimiento («experience-to-knowledge», E2K) sobre un único juego de ARC-AGI-3, el `cd82-fb555c5d`, en el que se estudia si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas supervisadas y refinarse después con aprendizaje por refuerzo sobre episodios multi-paso reales.

El checkpoint corresponde a la iteración 1 del brazo `sft_first_decl-cc2`, un ensayo colapsado con resultado negativo. La parte de texto del modelo fue entrenada con Megatron-LM (TP4 × PP4) y convertida a safetensors bf16 conservando exactamente el mismo conjunto de 1199 tensores y las mismas formas que el modelo base; la torre visual y la cabeza de predicción multi-token se copiaron sin modificar. El modelo completo tiene 27.781.427.952 parámetros y el repositorio ocupa 55,6 GB.

Su relevancia es metodológica, no de producto: documenta con detalle la pila de entrenamiento (slime v0.3.2, Dr.GRPO, 16 motores de rollout SGLang sobre 4 nodos GH200 de Isambard-AI), el currículo de SFT (781 filas declarativas) y la trazabilidad de la conversión Megatron torch_dist → HuggingFace, incluyendo verificación bit a bit frente al modelo base. Con 0 descargas y 0 likes en el momento de redactar esta ficha, debe tratarse como material de reproducción científica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3_5 (`Qwen3_5ForConditionalGeneration`): pila de texto (`model.language_model.*`, `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`) |
| Parámetros totales | 27.781.427.952 (27,78 mil millones), 1199 tensores |
| Parámetros activos | No aplica (la información disponible no describe una arquitectura MoE) |
| Longitud de contexto | No disponible (no se especifica; se hereda del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantización | No disponible (solo se publican pesos bf16 en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | Safetensors en bf16 |
| Modelo base | Qwen/Qwen3.8-27B (fine-tune) |
| Pipeline declarado | `image-text-to-text` |
| Tamaño del repositorio | 55,6 GB |
| Autor y filiación | ziyan98 (Ziyan Wang, King's College London) |
| Fecha de creación | 2026-10-20 |
| Cómputo de entrenamiento | 4 nodos GH200 de Isambard-AI (BriCS, University of Bristol) |
| Checkpoint completo con estado del optimizador | ≈351 GB (no publicado; permanece en Isambard-AI) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Qwen3_5 del que deriva: una pila de texto tipo transformer con `lm_head`, una torre visual y una cabeza de predicción multi-token. Solo la pila de texto fue entrenada; según la model card, la torre visual y la cabeza `mtp` nunca formaron parte del modelo en Megatron y se copiaron sin cambios desde el checkpoint base, porque el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen. La conversión de Megatron torch_dist a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en un nodo de login (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales de Qwen3.8-27B, y `E2K_VERIFY.json` recoge la comparación frente al base.

El entrenamiento combinó una fase de SFT y otra de RL. La fase supervisada usó filas de chat declarativas en las formas `qa` y `rule` (781 filas), con ratio de anclaje 1,5, 448 filas de chat por rollout de SFT y terminación en texto; se ejecutaron 3 rollouts solo-SFT (0–2) con reinicio de Adam, y el NLL de conocimiento cayó de 1,67 a aproximadamente 0,56 por token durante el warm-up. El RL arrancó en el rollout 3 (relanzado desde la iteración 1 tras un fallo de memoria del host) y se canceló durante ese mismo rollout cuando el 33 % de los episodios terminados eran de una sola llamada. La pila fue slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, algoritmo Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego fue Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno modelado (*shaped*) sobre los niveles completados.

## Capacidades

- Generación de texto conversacional multi-turno: el ajuste se hizo con filas de chat declarativas, de ahí el tag `conversational`.
- Internalización de conocimiento factual del juego `cd82-fb555c5d` en las formas `qa` y `rule`: el NLL de conocimiento bajó de 1,67 a ~0,56 por token durante el warm-up supervisado.
- Uso de herramientas (tool calling) en un bucle agéntico: el modelo fue entrenado dentro de un arnés que expone tres herramientas MCP (`look`, `act`, `status`) mediante Claude Code CLI.
- Razonamiento multi-paso sobre episodios: el RL se aplicó sobre rollouts de 32 episodios del mismo juego, con una llamada al LLM por muestra.
- Modo thinking y plantilla de chat: sin cambios respecto al modelo base, según la model card.
- Entrada de imagen: el pipeline declarado es `image-text-to-text` y la torre visual está presente, pero se copió sin entrenar y el modelo nunca vio imágenes durante el ajuste; no hay evidencia de mejoría ni de evaluación en tareas visuales.
- Capacidades multilingües: no disponible (no se especifica el idioma de las filas de SFT ni la cobertura lingüística).
- Código, matemáticas o visión evaluadas mediante benchmarks: no disponible.

## Casos de uso

- Reproducción del experimento E2K: reanudar el estado de entrenamiento (menos los momentos del optimizador) a partir de `megatron/` con `convert_hf_to_torch_dist.py` de slime, usando `common.pt`, `args.json` y el cursor `global_dataset_state_dict_<N>.pt` incluidos en el repositorio.
- Punto de partida para nuevas iteraciones de RL: sirve como inicialización para brazos posteriores del mismo estudio con Dr.GRPO y slime, ya que incorpora el conocimiento declarativo del warm-up supervisado.
- Auditoría de pipelines de conversión Megatron torch_dist → HuggingFace: el repositorio incluye `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS`, y el conversor reproduce bit a bit los safetensors del modelo base, lo que permite validar herramientas de conversión propias.
- Estudio de deriva y olvido catastrófico: al compartir conjunto de tensores y formas con Qwen/Qwen3.8-27B, permite comparaciones tensor a tensor entre el modelo ajustado y el original para medir cuánto cambia la pila de texto tras SFT y RL acotados.
- Línea base para investigación de agentes en ARC-AGI-3: con rollouts de 32 episodios y un ruido entre rollouts de aproximadamente 0,05 de retorno modelado, es útil como referencia de un brazo concreto, siempre que se compare contra el resto de la serie listada en `checkpoints/checkpoints.md`.
- Metodología docente sobre ablaciones SFT frente a RL: el repositorio documenta configuración, currículo de filas y criterios de cancelación, por lo que sirve como caso práctico de diseño experimental y de análisis de resultados negativos.
- Validación de arneses de tool calling con MCP: replicar el bucle `look`/`act`/`status` con Claude Code CLI 2.1.270 para probar infraestructura de agentes antes de escalar a modelos mayores.
- No recomendado para aplicaciones de producción (atención al cliente, generación de código, asistentes generales): el entrenamiento se limita a un juego y las diferencias medidas entre brazos son de centésimas de retorno modelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos del run son los siguientes.

| Métrica | Valor | Contexto |
|---|---|---|
| NLL de conocimiento por token | 1,67 → ~0,56 | Warm-up de SFT, hasta la iteración 1 |
| Filas de SFT | 781 (formas `qa` + `rule`) | Ratio de anclaje 1,5; 448 filas de chat por rollout |
| Rollouts solo-SFT | 3 (0–2) | Con reinicio de Adam antes del RL |
| Pasos de optimizador por rollout | 8 | Sobre 32 episodios, batch global 4, lr 5e-6 |
| Retorno modelado del juego (*shaped return*) | No disponible | Sin líneas de play-metric en los logs de Slurm del run |
| Ruido entre rollouts de un mismo brazo | ~0,05 de retorno modelado | Estimación dada por el autor |
| Diferencia entre brazos | Centésimas de retorno modelado | Diferencia declarada como no significativa |
| MMLU / HumanEval / GSM8K / otros | No publicados | — |

## Requisitos de hardware

- Pesos en bf16: 27.781.427.952 parámetros × 2 bytes ≈ 55,6 GB, coherente con el tamaño del repositorio.
- VRAM para inferencia en bf16: ≈56 GB solo para pesos, más caché KV y activaciones; en la práctica requiere GPU de 80 GB (A100 80GB, H100 80GB, H200, GH200) o reparto entre varias GPU con `device_map="auto"`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 32 GB en bf16. En cuantización de 4 bits serían necesarios del orden de 14–16 GB (estimación a partir del número de parámetros), pero no hay GGUF ni cuantizaciones publicadas, por lo que habría que generarlas por cuenta propia y validar la degradación.
- Despliegue en inferencia: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (fragmento de carga incluido en la model card), vLLM y SGLang (el autor indica que cargan igual que el modelo base; en el entrenamiento se usaron 16 motores SGLang con tp=1). llama.cpp, Ollama o TGI no están documentados para este checkpoint y requerirían conversión a GGUF.
- Reentrenamiento o reanudación: la configuración original usó 4 nodos GH200 con Megatron-LM en TP4 × PP4; el checkpoint completo con estado del optimizador ocupa ≈351 GB y no está publicado.
- Almacenamiento: 55,6 GB para los pesos más los ficheros de contabilidad de `megatron/`; prever espacio adicional si se descargan los datasets asociados.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pesos | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,78 mil millones | No disponible | Apache-2.0 | Safetensors bf16 | Punto de partida sin ajuste E2K; referencia para medir deriva |
| Este checkpoint (iter 1, `sft_first_decl-cc2`) | 27,78 mil millones | No disponible | Apache-2.0 | Safetensors bf16, 1199 tensores | SFT declarativo (781 filas) + RL parcial, cancelado en el rollout 3 |
| Otros brazos e iteraciones de la serie E2K-cd82 | 27,78 mil millones | No disponible | Apache-2.0 | Safetensors bf16 | Listados en `checkpoints/checkpoints.md` del dataset de RL; sin métricas públicas recogidas en esta ficha |
| Modelos abiertos de tamaño similar de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No hay datos de comparación en la información proporcionada, por lo que no se establece comparación de rendimiento |

La comparación relevante es interna al estudio: todos los brazos parten del mismo modelo base, se evalúan sobre el mismo juego con rollouts de 32 episodios y las diferencias observadas son de centésimas de retorno modelado, dentro de un ruido de aproximadamente 0,05.

## Limitaciones y advertencias

- No es una mejora general de Qwen3.8-27B: el entrenamiento cubre un único juego (`cd82-fb555c5d`), la evaluación se hizo sobre 32 episodios de ese juego y las diferencias entre brazos son de centésimas de retorno modelado.
- Resultado negativo: el run se marca como ensayo colapsado; el RL se canceló en el rollout 3 porque el 33 % de los episodios terminados eran de una sola llamada.
- Ausencia de métricas de juego: no hay líneas de play-metric en los logs de Slurm del run, por lo que no puede atribuirse mejora de rendimiento al checkpoint a partir de los datos publicados.
- Visión no entrenada: la torre visual se copió sin cambios y el actor nunca vio imágenes; el pipeline `image-text-to-text` no implica capacidades visuales mejoradas ni evaluadas.
- Alucinación: riesgo heredado del modelo base y no evaluado en este ajuste, especialmente en dominios ajenos al juego de entrenamiento.
- Idiomas y contexto: no se especifican ni la longitud de contexto ni los idiomas soportados; tampoco el idioma de las 781 filas de SFT.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o robustez para este checkpoint.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base conserva sus propios términos y este checkpoint carece de validación para producción.
- Reproducibilidad parcial: el estado del optimizador (≈351 GB) no está en el repositorio,

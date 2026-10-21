# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter11

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-cc-iter11 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace. No es un modelo nuevo desde cero: es un ajuste por aprendizaje por refuerzo de Qwen/Qwen3.8-27B (27.781.427.952 parámetros, pesos bf16, licencia Apache 2.0) sobre un único entorno, el juego `cd82-fb555c5d` de ARC-AGI-3. Forma parte del experimento E2K (experience-to-knowledge), cuyo objetivo es estudiar si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales de varios pasos.

La rama concreta es `baseline-cc` (línea base válida, RL puro, sin filas de SFT), iteración 11 de Megatron, tras 12 rollouts de RL con Dr.GRPO. El modelo parte del checkpoint base Qwen3.8-27B y conserva su torre de visión y su cabeza de predicción multi-token sin entrenar, copiadas tal cual; el entrenamiento fue exclusivamente de texto. Según el autor, no es una mejora de propósito general del modelo base: se entrenó en un solo juego, se evaluó con rollouts de 32 episodios de ese mismo juego y las diferencias entre ramas del experimento son de unas pocas centésimas de retorno modelado, dentro del ruido entre rollouts.

Su relevancia es metodológica, no de producto: documenta de forma inusualmente detallada la pila de entrenamiento (slime v0.3.2, Megatron-LM TP4 × PP4, 16 motores de rollout SGLang), las métricas de juego por rollout y la trazabilidad de la conversión de pesos (verificación bit a bit contra el checkpoint base). Resulta útil para investigadores que quieran reproducir o auditar experimentos de internalización de conocimiento y RL sobre agentes, no como modelo listo para producción general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`): pila de texto transformer más torre visual y cabeza de predicción multi-token; no se detalla si es densa o MoE |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Longitud de contexto | no disponible (la model card no la declara; se hereda la del modelo base Qwen3.8-27B, sin cifra publicada en la información) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en bf16 safetensors |
| Idiomas soportados | no disponibles (el campo `languages` no está informado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16 (1199 tensores, mismas formas que el modelo base); repo de 55,6 GB |

## Arquitectura y entrenamiento

El checkpoint mantiene la arquitectura del modelo base Qwen3.8-27B, invocable como `Qwen3_5ForConditionalGeneration`: pila de lenguaje (`model.language_model.*` y `lm_head`), torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`). Solo el stack de texto fue entrenado; la parte visual y la MTP se copiaron sin cambios del checkpoint base, ya que el actor nunca vio una imagen. La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, con verificación de forma y tipo para cada tensor e identidad bit a bit de los tensores copiados; `E2K_VERIFY.json` recoge la comparación y `SHA256SUMS` cubre todos los ficheros.

El entrenamiento consistió en RL puro (sin filas de SFT) con Dr.GRPO, usando `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, 1 muestra de entrenamiento por llamada al LLM, batch global de 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, precisión bf16 y backend flash-attn 2.8.3. La infraestructura fue slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1, sobre 4 nodos GH200 de Isambard-AI. El arnés de juego es Claude Code CLI 2.1.270 manejando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1–4 con tope de un nivel y retorno modelado sobre los niveles completados. El prompt de RL nunca contiene conocimiento. El estado completo con optimizador (≈351 GB) permanece en Isambard-AI y el repo `megatron/` permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py`.

## Capacidades

- Generación de texto conversacional en modo chat, con la plantilla y el modo *thinking* del modelo base sin modificar.
- Razonamiento multi-paso dentro de un bucle de agente: el modelo fue entrenado para operar herramientas MCP (`look`, `act`, `status`) durante episodios de juego.
- Planificación y ejecución de acciones secuenciales en entornos interactivos con estado (ARC-AGI-3).
- Lectura de imágenes declarada a nivel de pipeline (`image-text-to-text`), pero sin entrenamiento asociado: la torre visual es la del checkpoint base y no recibió gradientes.
- Tool calling / function calling: soportado a través del protocolo MCP empleado en el arnés de entrenamiento.
- Capacidades multilingües: no disponibles en la información.
- Capacidad especial: ninguno de los resultados indica internalización efectiva de conocimiento en esta rama (es la línea base de RL puro, sin filas de conocimiento).

## Casos de uso

- Investigación sobre internalización de conocimiento: usar esta rama como línea base de RL puro frente a las ramas con SFT para medir si las filas supervisadas aportan algo; la serie completa de iteraciones está listada en el `checkpoints/checkpoints.md` del dataset de RL.
- Reproducción de experimentos de RL para agentes: el repo `megatron/` (args.json, common.pt, cursor de datos y última iteración) permite reconstruir el estado de entrenamiento con slime y repetir la curva.
- Estudio de dinámica de RL con Dr.GRPO: los logs por rollout (retorno modelado, tasa de niveles completados, cambios de acción, no-ops, tokens de pensamiento p50) sirven para analizar colapso de exploración y estabilidad de la ventaja sin normalizar.
- Auditoría de conversión Megatron → HF: `E2K_VERIFY.json` y `SHA256SUMS` permiten validar pipelines de conversión de checkpoints distribuidos a safetensors en un solo nodo.
- Evaluación de agentes sobre ARC-AGI-3: punto de comparación para medir tasas de resolución (1/32 y 2/32 en los mejores rollouts) frente a otras políticas.
- Base para experimentos de escalado de contexto de agente: con tokens de pensamiento p50 entre ~4.300 y ~5.900 por episodio, es un banco de pruebas para gestión de ventana y coste por episodio.
- Fine-tuning posterior controlado: al compartir set de tensores con Qwen3.8-27B, se puede usar como inicialización en estudios comparativos de RL sobre tareas únicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas estándar). Los únicos datos de rendimiento son las métricas de juego del run, extraídas de los logs de trabajo:

| Job | Rollout | Tasa de niveles completados | Retorno modelado | Cambios de acción | No-ops | Tokens de pensamiento p50 |
|---|---:|---:|---:|---:|---:|---:|
| 6529937 | 0 | 0,000 | −0,181 | 0,092 | 0,377 | — |
| 6536263 | 0 | 0,000 | −0,203 | 0,085 | 0,385 | — |
| 6548427 | 0 | 0,000 | −0,259 | 0,089 | 0,364 | 5.146,0 |
| 6529937 | 1 | 0,000 | −0,119 | 0,076 | 0,363 | — |
| 6548427 | 1 | 0,000 | −0,252 | 0,138 | 0,321 | 4.772,5 |
| 6548427 | 2 | 0,031 | −0,128 | 0,119 | 0,328 | 4.451,0 |
| 6554904 | 2 | 0,000 | −0,186 | 0,116 | 0,331 | 4.365,0 |
| 6554904 | 3 | 0,000 | −0,025 | 0,091 | 0,313 | 4.965,0 |
| 6565902 | 4 | 0,000 | −0,020 | 0,073 | 0,339 | 4.779,0 |
| 6565902 | 5 | 0,000 | −0,119 | 0,097 | 0,331 | 5.209,0 |
| 6565902 | 6 | 0,000 | −0,123 | 0,097 | 0,336 | 4.956,5 |
| 6565902 | 7 | 0,000 | −0,091 | 0,102 | 0,327 | 4.345,0 |
| 6565902 | 8 | 0,031 | −0,062 | 0,065 | 0,324 | 5.840,0 |
| 6565902 | 9 | 0,000 | −0,136 | 0,054 | 0,345 | 5.750,0 |
| 6565902 | 10 | 0,062 | +0,078 | 0,110 | 0,277 | 5.578,5 |
| 6565902 | 11 | 0,031 | +0,058 | 0,105 | 0,278 | 5.859,0 |

Notas de lectura: el texto de la model card resume el rollout 0 con retorno modelado −0,157, mientras que la tabla de logs muestra −0,181, −0,203 y −0,259 para las tres cadenas de trabajos; la diferencia no se explica en la información. El propio autor indica que el ruido entre rollouts de una misma rama es de aproximadamente 0,05 de retorno modelado, por lo que las diferencias de centésimas entre brazos no son concluyentes. Las columnas de turnos recitados y de turnos con referencia a fuente están vacías en todos los rollouts (rama sin SFT).

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos suman ~55,6 GB, de modo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB, GH200) y margen para caché KV y activaciones; en la práctica, 2 × 80 GB o tensor parallel para holgura.
- Cuantización a 8 bits (estimación, ~28 GB): cabría en una A100 40GB o en una RTX 6000 Ada 48GB; no hay artefactos cuantizados publicados, habría que generarlos.
- Cuantización a 4 bits (estimación, ~14–16 GB): podría caber en una RTX 4090 24GB o RTX 5090, pero requiere producir la cuantización; no hay GGUF ni AWQ/GPTQ en el repo.
- GPU consumer: en bf16 no cabe en ninguna GPU consumer actual; solo con cuantización agresiva y aceptando degradación no medida.
- Despliegue: `transformers` (con `device_map="auto"`, `dtype="bfloat16"`), vLLM y SGLang, que según el autor lo cargan igual que el modelo base. llama.cpp/Ollama no son viables al no existir pesos GGUF.
- Latencia y throughput: no disponibles. Como referencia de coste operativo, los episodios de entrenamiento consumieron una mediana de ~4.300–5.900 tokens de pensamiento por episodio.
- Nota de robustez: dado que el modelo está ajustado para un único juego con un arnés concreto, el rendimiento fuera de ese entorno no está caracterizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento específico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-baseline-cc-iter11 | 27,78 B | no disponible | RL puro (Dr.GRPO) sobre un juego de ARC-AGI-3, 12 rollouts, sin SFT | apache-2.0 | Pesos bf16 en HF, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo generalista original | apache-2.0 (según este repo) | Público en HF |
| Otras ramas del experimento E2K (calentamiento SFT y variantes) | 27,78 B | no disponible | Variantes con filas de conocimiento y RL | apache-2.0 | Un repositorio por iteración, listados en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, alternativas densas de ~27–32 B); por tanto, esa comparación se marca como no disponible.

## Limitaciones y advertencias

- Checkpoint de investigación, no una mejora de propósito general: el autor lo declara explícitamente. El entrenamiento se hizo sobre un único juego (`cd82-fb555c5d`) y la evaluación se limita a rollouts de 32 episodios de ese juego.
- Diferencias dentro del ruido: la variación entre rollouts de una misma rama es de ~0,05 de retorno modelado, mientras que las diferencias entre ramas son de centésimas; no se pueden extraer conclusiones firmes de mejora.
- Sin SFT en esta rama: no hubo filas de conocimiento, así que este checkpoint representa la línea base de RL puro y no incorpora conocimiento verificado de partidas.
- Torre visual no entrenada: aunque el pipeline sea `image-text-to-text`, la parte `model.visual.*` se copió sin cambios y el actor nunca vio imágenes; no hay garantía de calidad en tareas multimodales.
- Cabeza MTP no entrenada: `mtp.*` procede del checkpoint base, por lo que la decodificación especulativa asociada no está validada en este ajuste.
- Riesgo de alucinación: al ser un ajuste de RL sobre un dominio estrecho con plantilla de chat intacta, el modelo puede producir respuestas plausibles y erróneas fuera del entorno de juego; no hay evaluación de factualidad.
- Idiomas no documentados: el campo de idiomas no está informado; no se debe asumir calidad multilingüe.
- Dependencia del arnés: el comportamiento está ligado a las herramientas MCP `look`/`act`/`status` y a la configuración del bucle (`knowledge_learning.loop.arc_mcp`, semilla 0, niveles 1–4). Fuera de ese contrato de herramientas el rendimiento es desconocido.
- Licencia: apache-2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3.8-27B; conviene revisar la licencia original antes de un despliegue comercial.
- Idiotez de datos: el estado completo con optimizador (≈351 GB) no está en el repo; solo se puede reconstruir el estado de entrenamiento sin momentos del optimizador.
- Ausencia de métricas estándar: no hay resultados de benchmarks convencionales que permitan situar el modelo frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter11
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL relacionado: repo `ziyan98/E2K-cd82-rl-internalization` (la URL aparece truncada en la model card como `https://hu…`; incluye `knowledge-set/` con los `rl_config_*.json` y `checkpoints/checkpoints.md`)
- Búsqueda web: no se han encontrado enlaces relevantes al modelo ni al experimento E2K. Los resultados devueltos por el buscador no guardan relación con el modelo, el paper ni el repositorio, y se descartan por no ser fuentes utilizables.

# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter7

## Resumen

Este repositorio contiene un checkpoint de investigación, no un modelo de propósito general: es `Qwen/Qwen3.8-27B` (27.781.427.952 parámetros, safetensors en bf16) después del experimento de internalización de conocimiento E2K sobre el juego `cd82-fb555c5d` de ARC-AGI-3. Lo publica el usuario `ziyan98` como iteración 7 de Megatron del run `sft_first-cc`, dentro de un estudio sobre si el conocimiento verificado que un modelo extrae de su propia partida se puede escribir en sus pesos mediante filas supervisadas y luego mejorar con RL sobre episodios reales de varios pasos.

El procedimiento fue un calentamiento SFT con 391 filas de QA declarativo construidas a partir de un conjunto de 888 átomos de conocimiento, seguido de RL con Dr.GRPO a través del harness de Claude Code, con 16 rollouts planificados y checkpoints cada 4. El entrenamiento se ejecutó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4, 16 motores de rollout SGLang en tp=1) en 4 nodos GH200 de Isambard-AI.

Su relevancia es metodológica y de reproducibilidad: los rollouts publicados muestran tasa de aciertos 0,000 y retorno conformado -0,050, con `step no-op` = 1,000, y el propio autor lo marca como superado por las ramas basadas en filas del harness (IDD, act-ctrl, arm C) tras comprobar que las filas de chat no se transfieren al juego. Sirve como artefacto auditable de un resultado negativo, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre visual y cabeza de predicción multi-token (MTP); solo la pila de texto está entrenada, visión y MTP se copian del modelo base |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se documenta una variante MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible (se heredan del modelo base; el autor no documenta idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16, 1199 tensores con los mismos nombres y formas que `Qwen/Qwen3.8-27B`; 55,6 GB de repositorio |

## Arquitectura y entrenamiento

La pila de texto (`model.language_model.*` y `lm_head`) es el estado entrenado en Megatron, verificado en forma y dtype para cada tensor y con identidad bit a bit en los tensores copiados. La torre visual (`model.visual.*`) y la cabeza MTP (`mtp.*`) nunca formaron parte del modelo Megatron y se copian sin cambios del checkpoint base: el entrenamiento fue solo de texto y el actor nunca vio una imagen. La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, por trozos y en memoria contenida (`convert_torch_dist_to_hf_lowmem.py`), con `E2K_VERIFY.json` como comparación contra el base y `SHA256SUMS` cubriendo todos los ficheros.

El ajuste combina 391 filas declarativas de QA derivadas de un conjunto de 888 átomos de conocimiento (`sft_data.jsonl`) con RL Dr.GRPO configurado con `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, un ejemplo de entrenamiento por llamada al modelo, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. La partida la conduce Claude Code CLI 2.1.270 sobre las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1 a 4 con tope de un nivel y retorno conformado sobre los niveles superados. El directorio `megatron/` conserva `common.pt` (argumentos y estado del scheduler del optimizador), `args.json`, `latest_checkpointed_iteration.txt` y el cursor de datos de rollout `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo momentos del optimizador) se puede reconstruir con `convert_hf_to_torch_dist.py`.

## Capacidades

- Generación de texto y conversación multi-turno: hereda la pila de lenguaje del modelo base, con la plantilla de chat y el modo thinking sin cambios.
- Uso de herramientas: el run se apoya en las herramientas MCP `look` / `act` / `status`, por lo que el formato de tool calling del base se mantiene operativo.
- Entrada image-text-to-text declarada en el pipeline, aunque la torre visual no recibió entrenamiento en este run.
- Razonamiento multi-paso dentro de un episodio de juego, limitado en la práctica por el colapso de política observado (todas las acciones registradas como no-op).
- Capacidad específica del experimento: responder QA declarativo sobre el conjunto de conocimiento del juego `cd82-fb555c5d` tras el calentamiento SFT.
- Capacidades multilingües: no documentadas por el autor.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Reproducción del experimento E2K: cargar el checkpoint con `convert_hf_to_torch_dist.py` y reanudar el estado de entrenamiento usando `megatron/common.pt` y el cursor `global_dataset_state_dict_<N>.pt` para verificar la curva de internalización descrita en el estudio.
- Baseline negativo en estudios de RL sobre agentes: sirve para medir el fenómeno de colapso a no-op (`step no-op` = 1,000) frente a otras ramas del mismo proyecto, como IDD, act-ctrl o arm C.
- Auditoría de conversión Megatron a HuggingFace: el repositorio incluye `E2K_CONVERSION.json`, `E2K_VERIFY.json` y `SHA256SUMS`, útiles para validar pipelines de conversión que exigen identidad bit a bit en los tensores no entrenados.
- Ablación de transferencia conocimiento-juego: comparar este brazo (filas de chat) con los brazos de filas de harness para estudiar por qué las filas conversacionales no se transfieren a la política de juego.
- Docencia e investigación sobre checkpoints intermedios: al conservarse una iteración por repositorio (incluidas las de calentamiento SFT), permite trazar cómo evoluciona la política paso a paso.
- Validación de infraestructura de entrenamiento a gran escala: la configuración slime + Megatron TP4 × PP4 + 16 motores SGLang sobre GH200 es replicable como referencia de despliegue distribuido.
- Fine-tuning posterior controlado: punto de partida para probar si un ajuste adicional con datos de otra naturaleza recupera la capacidad de actuar; no recomendable como base para tareas generales sin una evaluación previa.
- No apto para atención al cliente, generación de código en producción ni asistentes desplegados: no hay evidencia de rendimiento fuera del juego y los rollouts publicados no completan ningún nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta métricas de partida sobre 32 episodios de rollout del juego `cd82-fb555c5d`, agregadas aquí para los 14 rollouts con datos:

| Metrica | Valor en los rollouts publicados |
|---|---|
| Tasa de aciertos (clear rate) | 0,000 en los 14 rollouts |
| Retorno conformado (shaped return) | -0,050 en 13 rollouts; -0,052 en 1 |
| Step change | 0,000 en los 14 rollouts |
| Step no-op | 1,000 en 13 rollouts; 0,943 en 1 |
| Think tokens p50 | sin datos |
| Turnos recitados | sin datos |
| Turnos con referencia a fuente | sin datos |

El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno conformado, y las diferencias entre brazos son de centésimas, por lo que el autor califica el resultado de no concluyente. El primer rollout de RL tras un bloque solo-SFT lo juega la política solo-SFT, lo que mide el efecto de las filas por sí mismas.

## Requisitos de hardware

- Pesos en bf16: 55,6 GB. Inferencia en bf16 requiere del orden de 60-70 GB de VRAM contando caché KV y activaciones (estimación, no dato del autor).
- GPU de un solo dispositivo: A100 80 GB, H100 80 GB o H200 para bf16 sin cuantizar.
- Configuraciones multi-GPU: 2 × A100 40 GB o 2 × RTX 6000 Ada 48 GB con paralelismo de tensores para bf16.
- Cuantización a 8 bits: aproximadamente 28 GB de pesos, cabe en una GPU de 48 GB o en 2 × 24 GB (estimación).
- Cuantización a 4 bits: aproximadamente 14-16 GB, viable en RTX 4090 o RTX 3090 de 24 GB, siempre que se genere una conversión GGUF que el autor no publica (estimación).
- Despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`; vLLM y SGLang lo cargan igual que el modelo base según el autor; TGI y llama.cpp/Ollama no están confirmados en la información disponible.
- Entrenamiento: 4 nodos GH200 (Isambard-AI) con Megatron-LM TP4 × PP4 y 16 motores SGLang en tp=1; el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y no se publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (`E2K-cd82-Qwen3.8-27B-sft_first-cc-iter7`) | 27,78 mil millones | no disponible | Apache 2.0 | Público en HuggingFace, 0 descargas y 0 likes en el momento de la ficha | Pila de texto entrenada en un solo juego; visión y MTP copiadas del base; clear rate 0,000 |
| `Qwen/Qwen3.8-27B` (base) | 27,78 mil millones (mismos 1199 tensores y formas) | no disponible | no disponible en la información | Público en HuggingFace | Referencia directa: idéntica arquitectura y tokenizer; el checkpoint se desvía solo en la pila de texto |
| Otras alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables de la misma categoría |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: se entrenó sobre un único juego, se evaluó con rollouts de ese juego y las diferencias entre brazos son de centésimas de retorno conformado.
- Política degenerada en la práctica: `step no-op` = 1,000 y tasa de aciertos 0,000 en los 14 rollouts publicados; el agente no ejecuta acciones efectivas.
- Checkpoint superado: el autor lo marca como reemplazado por las ramas de filas de harness (IDD, act-ctrl, arm C) tras el análisis que mostró que las filas de chat no se transfieren a la partida.
- Visión no evaluada: la torre visual se copia sin cambios y el actor nunca vio una imagen, pese a que el pipeline declarado sea image-text-to-text.
- Sin benchmarks estándar ni evaluaciones de seguridad: no hay datos de MMLU, HumanEval, GSM8K, sesgos o robustez; el riesgo de alucinación es el heredado del modelo base y no se ha medido.
- Idiomas no documentados: no se puede afirmar soporte multilingüe más allá de lo que ofrezca el base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la idoneidad técnica para producción es nula con la evidencia disponible.
- Estado de entrenamiento incompleto: los momentos del optimizador (~351 GB) permanecen en Isambard-AI y no se distribuyen.
- Trazabilidad dependiente de rutas internas: el checkpoint se generó desde `/projects/u6uv/ziyan/outputs/rl/ckpt/sft_first-cc/iter_0000007`, por lo que la reproducción exacta requiere reconstruir el entorno de slime v0.3.2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first-cc-iter7
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL citado en la model card: `ziyan98/E2K-cd82-rl-internalization` (el enlace aparece truncado en la información disponible; el identificador del repositorio es el citado por el autor)
- Paper: no disponible
- Blog o nota técnica: no disponible
- Repositorio de código del experimento: no disponible
- Demo o espacio interactivo: no disponible

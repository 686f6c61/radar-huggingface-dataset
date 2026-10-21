# ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter2

## Resumen

E2K-cd82-Qwen3.8-27B-baseline-cc-iter2 es un checkpoint de investigación publicado por el usuario `ziyan98` a partir de Qwen3.8-27B, un modelo multimodal de 27.781.427.952 parámetros (27,78 mil millones) con arquitectura `qwen3_5` y pipeline `image-text-to-text`. No se trata de un ajuste de propósito general, sino de la iteración 2 de un brazo de control ("baseline-cc", RL puro sin SFT) dentro del experimento E2K, que estudia si el conocimiento verificado extraído de la propia partida de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios reales multi-paso.

El escenario de entrenamiento es un único juego de ARC-AGI-3 (`cd82-fb555c5d`), jugado por un agente Claude Code CLI 2.1.270 que invoca las herramientas MCP `look`, `act` y `status`. El entrenamiento se hizo con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) y 16 motores de rollout SGLang, con el algoritmo Dr.GRPO, en 4 nodos GH200 de Isambard-AI. La torre visual y la cabeza de predicción multi-token se copian sin modificar del modelo base: el entrenamiento fue exclusivamente de texto.

Su relevancia es metodológica, no de rendimiento: sirve como línea base reproducible para comparar brazos con y sin internalización de conocimiento, y documenta de forma inusualmente detallada la infraestructura (argumentos de Megatron, estado del dataset, curvas de juego por rollout). El autor advierte explícitamente de que las diferencias entre brazos son de centésimas de retorno modelado y que el checkpoint no debe interpretarse como una mejora general del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal `qwen3_5` (`Qwen3_5ForConditionalGeneration`), con torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`); no se especifica si emplea mezcla de expertos |
| Parámetros totales | 27.781.427.952 (27,78 mil millones), contabilizados en safetensors |
| Parámetros activos | no disponible (la model card no indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos publicados están en bf16 y no se distribuyen GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (1199 tensores, mismas formas que el modelo base); compatible con transformers, vLLM y SGLang |
| Modelo base | `Qwen/Qwen3.8-27B` |
| Tamaño del repositorio | 55,6 GB |
| Tag de pipeline | `image-text-to-text` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

El checkpoint conserva la arquitectura del modelo base Qwen3.8-27B: pila de texto (`model.language_model.*`, `lm_head`), torre visual y cabeza MTP. Solo el stack de texto corresponde al estado entrenado con Megatron; la torre visual y el `mtp.*` se copiaron sin cambios porque el actor nunca vio una imagen durante el entrenamiento, que fue únicamente de texto. La conversión de Megatron `torch_dist` a HuggingFace se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, en streaming por fragmentos (`convert_torch_dist_to_hf_lowmem.py`); el mismo conversor reproduce bit a bit los safetensors originales del modelo base, y `E2K_VERIFY.json` recoge la comparación contra el base.

El entrenamiento es RL puro, sin filas SFT: Dr.GRPO con `--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`, una muestra de entrenamiento por llamada al LLM, batch global de 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3. La pila es slime v0.3.2 con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang a `tp=1`, sobre 4 nodos GH200 de Isambard-AI. El horario cubre los rollouts 0–11 (tres cadenas de trabajos, con reanudación desde la última iteración). El prompt de RL nunca contiene conocimiento; el agente juega mediante Claude Code CLI 2.1.270 controlando las herramientas MCP de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, retorno modelado adicional por nivel completado). Este checkpoint corresponde a la iteración 2 de Megatron.

## Capacidades

- Generación de texto y razonamiento multi-paso dentro de un bucle de agente de juego (ARC-AGI-3), con pasos de tipo `look` / `act` / `status`.
- Modo thinking heredado del modelo base, con plantilla de chat sin modificar; la mediana de tokens de pensamiento por rollout se sitúa entre 4.345 y 5.859.
- Llamada a herramientas (tool calling) vía servidores MCP, ejercitada durante el entrenamiento con las tres herramientas del arnés.
- Comportamiento de agente de varios turnos: cada rollout consta de 32 episodios con hasta 4 niveles (tope de un nivel por episodio).
- Capacidad multimodal heredada de Qwen3.8-27B (torre visual presente), aunque no fue entrenada ni validada en este experimento.
- Seguimiento de métricas de juego instrumentadas: tasa de nivel completado, retorno modelado, cambio de paso y pasos sin operación.
- Capacidades multilingües: no disponible.

## Casos de uso

- Replicación del experimento E2K: este checkpoint actúa como línea base de RL puro (sin SFT) frente a los brazos con internalización de conocimiento, usando el mismo juego, semilla de motor 0 y arnés de Claude Code CLI.
- Evaluación de agentes en ARC-AGI-3: permite medir tasas de nivel completado y retorno modelado en rollouts de 32 episodios con un protocolo documentado y reproducible.
- Estudio de recitación frente a grounding: la model card registra columnas de "recited turns" y "source-ref turns" (vacías en esta ejecución), lo que permite instrumentar si el modelo recita conocimiento memorizado o lo consulta.
- Referencia de infraestructura de RL: el directorio `megatron/` incluye `args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor `global_dataset_state_dict_<N>.pt`, útiles para reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Validación de pipelines de conversión Megatron → HuggingFace: `E2K_VERIFY.json` y `SHA256SUMS` permiten comprobar la fidelidad de la conversión tensor a tensor contra el modelo base.
- Análisis de estabilidad del RL: con 16 rollouts registrados y un ruido entre rollouts de aproximadamente 0,05 de retorno modelado, sirve para estudiar la varianza de Dr.GRPO en tareas de juego de horizonte largo.
- Punto de partida para nuevos experimentos de RL: al mantener el tokenizador, la plantilla de chat y la configuración de generación del base, se puede reanudar entrenamiento sin recalibrar el arnés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son las métricas de juego por rollout, extraídas de los registros de los trabajos:

| Job | Rollout | Tasa de nivel completado | Retorno modelado | Cambio de paso | Pasos sin operación | Tokens de pensamiento (p50) |
|---|---:|---:|---:|---:|---:|---:|
| 6529937 | 0 | 0,000 | -0,181 | 0,092 | 0,377 | no disponible |
| 6536263 | 0 | 0,000 | -0,203 | 0,085 | 0,385 | no disponible |
| 6548427 | 0 | 0,000 | -0,259 | 0,089 | 0,364 | 5.146 |
| 6529937 | 1 | 0,000 | -0,119 | 0,076 | 0,363 | no disponible |
| 6548427 | 1 | 0,000 | -0,252 | 0,138 | 0,321 | 4.772,5 |
| 6548427 | 2 | 0,031 | -0,128 | 0,119 | 0,328 | 4.451 |
| 6554904 | 2 | 0,000 | -0,186 | 0,116 | 0,331 | 4.365 |
| 6554904 | 3 | 0,000 | -0,025 | 0,091 | 0,313 | 4.965 |
| 6565902 | 4 | 0,000 | -0,020 | 0,073 | 0,339 | 4.779 |
| 6565902 | 5 | 0,000 | -0,119 | 0,097 | 0,331 | 5.209 |
| 6565902 | 6 | 0,000 | -0,123 | 0,097 | 0,336 | 4.956,5 |
| 6565902 | 7 | 0,000 | -0,091 | 0,102 | 0,327 | 4.345 |
| 6565902 | 8 | 0,031 | -0,062 | 0,065 | 0,324 | 5.840 |
| 6565902 | 9 | 0,000 | -0,136 | 0,054 | 0,345 | 5.750 |
| 6565902 | 10 | 0,062 | 0,078 | 0,110 | 0,277 | 5.578,5 |
| 6565902 | 11 | 0,031 | 0,058 | 0,105 | 0,278 | 5.859 |

Las columnas de turnos recitados y de turnos con referencia a fuente no contienen valores en esta ejecución. El autor indica que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno modelado, por lo que las diferencias observadas entre rollouts no permiten extraer conclusiones firmes.

## Requisitos de hardware

- VRAM estimada en bf16: unos 55,6 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica requiere GPU de 80 GB o reparto entre varias.
- GPU recomendadas para bf16: H100 80 GB, H200, A100 80 GB, o dos A100 40 GB / RTX 6000 Ada 48 GB con reparto por capas.
- Cuantización a 8 bits: aproximadamente 28 GB, viable en una RTX 6000 Ada 48 GB, L40S 48 GB o dos RTX 4090; no hay cuantizaciones oficiales publicadas, habría que generarlas.
- Cuantización a 4 bits: aproximadamente 15–16 GB, cabría en una RTX 4090 24 GB o RTX 3090 24 GB, pero requeriría conversión propia a GGUF/AWQ/GPTQ, con la consiguiente pérdida de fidelidad.
- Entrenamiento original: 4 nodos GH200 de Isambard-AI, Megatron-LM TP4 × PP4 y 16 motores SGLang con `tp=1`; el checkpoint completo con estado del optimizador ocupa unos 351 GB.
- Opciones de despliegue: transformers (`Qwen3_5ForConditionalGeneration` con `dtype="bfloat16"` y `device_map="auto"`), vLLM y SGLang, que lo cargan igual que el modelo base. llama.cpp y Ollama no están soportados sin convertir previamente los pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-baseline-cc-iter2 | 27,78 mil millones | no disponible | RL puro (Dr.GRPO) sobre un juego de ARC-AGI-3, 12 rollouts | Apache 2.0 | Pesos bf16 en HuggingFace; estado completo del optimizador solo en Isambard-AI |
| Qwen/Qwen3.8-27B (base) | 27 mil millones (mismo conjunto de 1199 tensores) | no disponible | no disponible | no disponible en la información | Público en HuggingFace |
| Otras iteraciones del mismo run (`baseline-cc`) | 27,78 mil millones | no disponible | Misma configuración, iteraciones distintas; incluye iteraciones de calentamiento solo SFT | Apache 2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos para comparar con modelos de otros autores de tamaño o tarea equivalentes; la model card no incluye comparaciones de ese tipo.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.8-27B: se entrenó y evaluó en un único juego (`cd82-fb555c5d`) y las diferencias frente a otros brazos son de centésimas de retorno modelado.
- La tasa de nivel completado es 0,000 en 12 de los 16 rollouts registrados y el retorno modelado es negativo en 14 de 16; solo los rollouts 10 y 11 presentan retorno positivo (0,078 y 0,058).
- El ruido entre rollouts de un mismo brazo ronda 0,05 de retorno modelado, del mismo orden que las diferencias que se quieren medir; cualquier conclusión sobre eficacia debe tratarse con cautela.
- La torre visual se copia sin entrenar: aunque el pipeline declarado es `image-text-to-text`, no hay evidencia de rendimiento multimodal tras este ajuste.
- El prompt de RL nunca contiene conocimiento, de modo que este checkpoint no permite por sí solo evaluar la internalización de conocimiento; para eso hacen falta los brazos con filas SFT.
- Riesgo de alucinación y de recitación de conocimiento no verificado: las métricas de turnos recitados y de referencia a fuente aparecen sin valores en esta ejecución, por lo que no se puede cuantificar ese comportamiento.
- Idiomas soportados y longitud de contexto no documentados; no se deben asumir los valores del modelo base sin verificarlos.
- Licencia Apache 2.0 permite uso comercial, pero el estado del autor es que se trata de un checkpoint de investigación no destinado a producción.
- Solo se publican pesos en bf16; no hay cuantizaciones oficiales ni garantías de fidelidad tras una conversión casera.
- El estado completo de entrenamiento (aproximadamente 351 GB, con momentos del optimizador) no está en el repositorio; solo se puede reconstruir el estado sin momentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-baseline-cc-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL asociado: identificador `ziyan98/E2K-cd82-rl-…` (la URL aparece truncada en la model card; conviene verificar el nombre completo antes de usarla)
- No se han proporcionado enlaces a papers, blogs, repositorios de código ni demos en la información disponible.

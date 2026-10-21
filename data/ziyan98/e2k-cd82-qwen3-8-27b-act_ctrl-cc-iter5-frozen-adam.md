# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter5-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter5-frozen-adam es un checkpoint de investigación publicado por el usuario ziyan98 (HuggingFace) a partir de Qwen/Qwen3.8-27B. No es un ajuste fino de propósito general: es el brazo de control de un experimento de «internalización de conocimiento» (E2K) sobre el juego `cd82-fb555c5d` de ARC-AGI-3, en el que se estudia si el conocimiento verificado extraído de las propias partidas de un modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con RL sobre episodios multi-paso reales.

El checkpoint corresponde al run `act_ctrl-cc`, iteración 5 de Megatron, y proviene del primer intento del run (16-17 de septiembre de 2026), en el que los momentos de Adam acumulados durante el calentamiento SFT se arrastraron sin reiniciar al RL, dejando el paso de política prácticamente a cero (movimiento de política unas 5 veces por debajo de la línea base). Por eso lleva el sufijo `-frozen-adam` y se conserva como trayectoria distinta del mismo punto de partida SFT-only.

Su interés es metodológico, no de rendimiento: sirve como referencia negativa y como material de reproducibilidad para quienes trabajan en RL de agentes, marcos de herramientas tipo MCP y evaluación en ARC-AGI-3. El autor advierte explícitamente de que no es una mejora general del modelo base: se entrenó en un solo juego, se evaluó con rollouts de 32 episodios de ese juego y ningún brazo supera más de 2 de 32 episodios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (etiqueta `qwen3_5` en transformers); incluye torre visual (`model.visual.*`) y cabeza de predicción multi-token (`mtp.*`) |
| Parámetros totales | 27.781.427.952 (dato real de safetensors) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; solo se publican pesos en bf16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` en bf16 (1199 tensores, mismo conjunto y formas que el modelo base); se incluye además el estado Megatron `torch_dist` en `megatron/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y conserva su pila completa: 851 tensores de texto (`model.language_model.*` y `lm_head`) entrenados en Megatron, y la torre visual y la cabeza MTP copiadas sin cambios desde el checkpoint base (verificadas bit a bit). El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen, aunque el pipeline declarado en el Hub sea `image-text-to-text` por herencia de la configuración del modelo base.

El procedimiento combina una fase supervisada con RL. Las 303 filas SFT del brazo act-ctrl son turnos del propio harness del modelo base, sin conocimiento inyectado, y constituyen el control emparejado del brazo IDD. La fase de RL usa Dr.GRPO (`--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, con `--normalize-advantages` en su valor por defecto, desactivado), un sample por llamada al LLM, batch global de 4 episodios (unos 200 samples por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6 y backend flash-attn 2.8.3. La infraestructura es slime v0.3.2 sobre Megatron-LM con TP4 × PP4 y 16 motores de rollout SGLang a tp=1, desplegada en 4 nodos GH200 de Isambard-AI. El harness de juego es Claude Code CLI 2.1.270 operando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, 40 decisiones por episodio y hasta cuatro niveles; los niveles de test 5 y 6 nunca se juegan.

La particularidad de esta iteración es un fallo metodológico conservado a propósito: los momentos de Adam del calentamiento SFT pasaron al RL sin reinicio, lo que congeló de facto el movimiento de política. Desde el 17 de septiembre de 2026 el reset es obligatorio y los reintentos publicados no llevan el sufijo `-frozen-adam`.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso heredados de Qwen3.8-27B, condicionados por el ajuste sobre un único dominio de juego.
- Interacción con herramientas mediante protocolo MCP: el modelo fue entrenado operando `look`, `act` y `status` contra un motor ARC-AGI-3.
- Juego de agente con estado: 40 decisiones por episodio, avance de nivel y retorno con forma (*shaped return*).
- Modo de razonamiento extenso: mediana de tokens de «pensamiento» entre 3347 y 4504 por rollout en las métricas registradas.
- Trazabilidad de fuentes: proporción de turnos con referencia a fuente entre 0,214 y 0,271; turnos «recitados» 0,000 en todos los rollouts.
- Capacidades multimodales: no disponible en la práctica; la torre visual se copia intacta y no recibió entrenamiento.
- Capacidades multilingües: no disponible (el autor no documenta idiomas).

## Casos de uso

- Reproducción del experimento E2K: el repositorio incluye `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Brazo de control en ablaciones de internalización de conocimiento: sirve como referencia SFT-only frente a los brazos IDD y arm-C, con la misma semilla de motor y el mismo harness.
- Estudio del efecto del estado de Adam en RL: esta iteración documenta el caso en que los momentos del calentamiento SFT reducen el movimiento de política ~5× respecto a la línea base, útil para diagnosticar colapso de paso en pipelines GRPO.
- Validación de infraestructura agente: checkpoint de prueba para verificar un stack slime + Megatron-LM (TP4 × PP4) + 16 motores SGLang con herramientas MCP, sin necesidad de un modelo de mayor tamaño.
- Referencia negativa en evaluación de agentes: permite cuantificar el ruido entre rollouts (~0,05 de retorno con forma) antes de atribuir mejoras a una intervención.
- Investigación sobre scaffolds de herramientas: al haber sido entrenado con Claude Code CLI y herramientas MCP concretas, sirve para estudiar cómo el andamiaje condiciona la política aprendida independientemente de los pesos.
- Docencia y divulgación técnica: ejemplo compacto y reproducible de un ciclo SFT → RL con Dr.GRPO sobre episodios multi-paso, con métricas por rollout publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo publica métricas de juego del run, extraídas de los logs de los jobs, que no son comparables con benchmarks estándar:

| Job | Rollout | Tasa de niveles superados | Retorno con forma | Cambio de paso | Paso sin efecto (no-op) | Tokens de pensamiento p50 | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,0 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,0 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,0 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,0 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,0 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,0 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,0 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,5 | 0,000 | 0,269 |

El primer rollout de RL tras un bloque SFT-only lo juega la política SFT-only, de modo que mide el efecto de las filas por sí solas. El ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y ningún brazo supera más de 2 de 32 episodios.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: unos 55,6 GB solo de pesos (tamaño del repo), más caché KV y activaciones; en la práctica requiere GPUs de 80 GB o sharding multi-GPU.
- Cuantizaciones de 8 o 4 bits: no disponibles para este checkpoint; no se publican versiones GGUF ni AWQ/GPTQ.
- GPU recomendadas: H100 80 GB, A100 80 GB o GH200 (el entrenamiento se hizo en 4 nodos GH200 de Isambard-AI con TP4 × PP4).
- GPU de consumo: no cabe en una RTX 4090 de 24 GB en bf16; se necesitaría cuantización, que no está publicada.
- Opciones de despliegue: `transformers` (librería declarada), vLLM o SGLang para servicio; el estado Megatron `torch_dist` incluido permite recargar en Megatron-LM mediante las herramientas de slime.
- Latencia y throughput: no disponibles. Como referencia del coste de razonamiento, las medianas de tokens de pensamiento por rollout están entre 3347 y 4504.
- Almacenamiento: 55,6 GB de repo, más el espacio adicional para el estado de entrenamiento en `megatron/`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter5-frozen-adam | 27.781.427.952 | No disponible | Métricas solo en el juego `cd82-fb555c5d`; máximo 2 de 32 episodios por brazo | Apache 2.0 | HuggingFace (10 descargas, 0 likes) |
| Qwen/Qwen3.8-27B (modelo base) | 27B (no se detalla el recuento exacto) | No disponible | No disponible en esta información | Apache 2.0 (según el checkpoint derivado) | HuggingFace, modelo de referencia |
| Otros checkpoints de la misma serie E2K | No disponible | No disponible | No disponible | Apache 2.0 | Un repositorio por iteración guardada, listados en `checkpoints/series.md` del dataset de RL |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría (agentes para ARC-AGI-3 u otros checkpoints de RL sobre Qwen3.8-27B).

## Limitaciones y advertencias

- No es una mejora de propósito general: el entrenamiento se limitó a un único juego (`cd82-fb555c5d`) y la evaluación a rollouts de 32 episodios de ese juego.
- Rendimiento absoluto muy bajo: ningún brazo supera más de 2 de 32 episodios, y el ruido entre rollouts (~0,05 de retorno con forma) es del mismo orden que las diferencias entre brazos (décimas como máximo).
- Esta iteración concreta arrastra un defecto metodológico: los momentos de Adam del calentamiento SFT no se reiniciaron antes del RL, lo que redujo el movimiento de política ~5× por debajo de la línea base. No debe usarse como representante del rendimiento del brazo act-ctrl.
- El pipeline declarado es `image-text-to-text`, pero el entrenamiento fue solo de texto; la torre visual y la cabeza MTP son copias sin modificar del modelo base y su comportamiento multimodal no fue evaluado.
- Riesgo de alucinación y de recitación de conocimiento no verificado: en estos rollouts la tasa de turnos recitados es 0,000 y la de turnos con referencia a fuente está entre 0,214 y 0,271, pero no se documenta una evaluación de fidelidad fuera del juego.
- Sesgos: no documentados por el autor; al derivar de Qwen3.8-27B hereda los del modelo base, que no se detallan.
- Idiomas y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingües o de contexto largo con garantías.
- Licencia Apache 2.0 permite uso comercial, pero el valor práctico comercial es nulo al tratarse de un checkpoint de investigación sobre una tarea única.
- Reproducibilidad parcial: el estado Megatron incluido permite reconstruir el entrenamiento salvo los momentos del optimizador, que no se publican.
- Advertencia de producción: no desplegar como asistente general ni como base de un producto; el autor lo describe explícitamente como checkpoint de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter5-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de slime (stack de entrenamiento citado): no disponible en la información proporcionada
- Paper o blog del experimento E2K: no disponible en la información proporcionada
- Dataset de RL con `rl_config_*.json`, `checkpoints/series.md` y los scripts de conversión: referenciado por el autor pero sin URL en la información disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo (los resultados devueltos tratan de edición de vídeo en Canva y de márgenes de impresión, sin relación con el modelo)

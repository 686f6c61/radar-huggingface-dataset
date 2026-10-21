# ziyan98/E2K-cd82-Qwen3.8-27B-sft_inter_decl-cc2-iter1

## Resumen

Este repositorio contiene un checkpoint de investigación de Qwen3.8-27B (27.781.427.952 parámetros) obtenido tras un experimento de "internalización de conocimiento" (E2K) sobre el juego `cd82-fb555c5d` de ARC-AGI-3. Lo publica Ziyan Wang (King's College London) y forma parte de la serie E2K. No es una mejora de propósito general del modelo base: es una iteración concreta de un estudio que comprueba si el conocimiento verificado, extraído de las propias partidas del modelo, puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con aprendizaje por refuerzo sobre episodios reales de varios pasos.

Técnicamente es un transformer multimodal de la familia Qwen3_5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza de predicción multi-token (MTP) heredadas sin cambios del modelo base. El entrenamiento fue exclusivamente de texto: el actor nunca vio una imagen, y el prompt de RL nunca contiene conocimiento explícito. La run `sft_inter_decl-cc2` se canceló durante su primer rollout de RL al detectar que el 45 % de los episodios finalizados eran de una sola llamada; la iteración 1 publicada aquí es un checkpoint solo-SFT.

Su relevancia es metodológica, no de rendimiento: documenta de forma inusualmente detallada la pila de entrenamiento (slime v0.3.2 con Megatron-LM TP4 × PP4, 16 motores de rollout SGLang, Dr.GRPO, 4 nodos GH200 de Isambard-AI), el proceso de conversión Megatron torch_dist → HuggingFace con verificación bit a bit, y las métricas de cada rollout. El autor advierte explícitamente de que las diferencias entre brazos del experimento son de pocas centésimas de retorno con forma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5 multimodal (`Qwen3_5ForConditionalGeneration`): pila de texto, torre de visión `model.visual.*` y cabeza de predicción multi-token `mtp.*` |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16; no hay GGUF ni cuantizaciones oficiales en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen3.8-27B) |
| Formato de pesos | safetensors en bf16, 1199 tensores; tamano del repositorio 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B (finetune) |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.8-27B, sin modificaciones estructurales: mismo conjunto de tensores y mismas formas (1199 tensores). La pila de texto (`model.language_model.*` y `lm_head`) corresponde al estado entrenado en Megatron, con verificación de forma y dtype para cada tensor y de identidad bit a bit en los tensores copiados. La torre de visión y la cabeza MTP nunca formaron parte del modelo Megatron y se copian sin cambios del checkpoint base, porque el entrenamiento fue solo de texto. Configuración, tokenizador, plantilla de chat, configuración de generación y de procesador son también los del modelo base (listados en `E2K_CONVERSION.json`).

El entrenamiento combina filas supervisadas y RL sobre una única tarea. La run `sft_inter_decl-cc2` usa las filas y anclas del trial 2 (formas qa + rule, ratio de anclas 1,5, 448 filas de chat por rollout de SFT, final de texto) con el calendario SFT SFT RL SFT RL…: dos rollouts solo-SFT (0–1), después RL y SFT alternados, cancelándose en su primer rollout de RL (2). La iteración 1 es un checkpoint solo-SFT del trial 3. La pila es slime v0.3.2 (Megatron-LM TP4 × PP4, 16 motores de rollout SGLang con tp=1) sobre 4 nodos GH200 de Isambard-AI, con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al LLM, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, lr 5e-6, bf16 y backend flash-attn 2.8.3. El arnés de juego es Claude Code CLI 2.1.270 controlando las herramientas MCP `look` / `act` / `status` de `knowledge_learning.loop.arc_mcp` (semilla de motor 0, niveles 1–4 con tope de un nivel, retorno con forma sobre las limpiezas de nivel).

## Capacidades

- Generación de texto y conversación multi-turno con la plantilla de chat original de Qwen3.8-27B, incluido el modo thinking sin cambios.
- Procesamiento de imagen y texto a texto a nivel de arquitectura (torre de visión y procesador del modelo base presentes y cargables), aunque el entrenamiento de este checkpoint fue exclusivamente textual.
- Razonamiento multi-paso en entornos interactivos: el checkpoint se entrenó con episodios de juego de hasta varios pasos mediados por herramientas (look/act/status).
- Internalización de conocimiento declarativo y de reglas: las filas de SFT del experimento tienen formas qa y rule, orientadas a fijar conocimiento verificado en los pesos.
- Compatibilidad con tool calling y flujos de agente en la medida en que lo sea el modelo base; este checkpoint no aporta un entrenamiento específico de function calling.
- Capacidades multilingües: no disponibles como dato verificado para este checkpoint.
- No se documentan capacidades de audio, vídeo ni otras modalidades.

## Casos de uso

- Replicación de experimentos de internalización de conocimiento: el repositorio incluye `megatron/args.json`, `common.pt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, de modo que el estado de entrenamiento (salvo momentos del optimizador) puede reconstruirse con `convert_hf_to_torch_dist.py` de slime y repetir la run.
- Estudio de la conversión Megatron torch_dist → HuggingFace: el autor adjunta `E2K_VERIFY.json` y `SHA256SUMS`, y el mismo convertidor reproduce bit a bit los safetensors originales de Qwen3.8-27B, lo que lo convierte en material de referencia para validar pipelines de conversión.
- Investigación sobre SFT frente a RL en tareas de agente: la serie de checkpoints por iteración (incluidas las de calentamiento solo-SFT) permite comparar el efecto de las filas supervisadas aisladas frente a la alternancia SFT/RL.
- Evaluación de agentes en ARC-AGI-3: sirve como política de partida para el juego `cd82-fb555c5d` con el arnés `arc_mcp`, midiendo retorno con forma y número de llamadas por episodio.
- Análisis de colapso de políticas: la run se canceló al detectar un 45 % de episodios de una sola llamada, por lo que el checkpoint es un caso de estudio útil para detectar degradación hacia respuestas triviales en RL con recompensas dispersas.
- Base para ablaciones controladas: al compartir tokenizador, plantilla y configuración con Qwen3.8-27B, cualquier comparación contra el base se hace sin variables de preprocesado adicionales.
- No es adecuado como modelo de producción para atención al cliente, generación de código u otras tareas generales: el entrenamiento se limita a un juego y el propio autor lo desaconseja explícitamente como mejora general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay líneas de métricas de juego para esta run en los logs de Slurm y remite al `wandb_export` del dataset de RL. Como referencia cualitativa, el autor señala que el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma, y que las diferencias entre brazos son de pocas centésimas, es decir, del orden del ruido.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan 55,6 GB, por lo que se necesita aproximadamente 60 GB solo para pesos, más caché KV; en la práctica, 80 GB o más por instancia para contextos largos.
- GPU recomendadas: H100 80 GB, A100 80 GB, GH200 (la run se entrenó en 4 nodos GH200 de Isambard-AI). Con tensor parallelism se puede repartir en varias GPU de 40–48 GB.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB. No se publican cuantizaciones GGUF/AWQ/GPTQ en el repositorio, así que el uso en consumer GPU requeriría cuantizar por cuenta propia, sin receta oficial validada.
- Opciones de despliegue: transformers (`Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`), vLLM y SGLang (el autor indica que carga igual que el modelo base). No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La única referencia de escala es el entorno de entrenamiento (16 motores SGLang con tp=1 sobre 4 nodos GH200) y un batch global de 4 para el entrenamiento, que no son cifras de inferencia de producción.
- Almacenamiento: 55,6 GB para el repositorio; el checkpoint completo con estado del optimizador (~351 GB) permanece en Isambard-AI y no se distribuye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (E2K `sft_inter_decl-cc2`, iter 1) | 27,78 B | no disponible | SFT sobre filas qa/rule de un juego ARC-AGI-3; RL planificado y cancelado | Apache-2.0 | Pesos bf16 en HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B (mismo conjunto de 1199 tensores) | no disponible | Modelo base multimodal de propósito general | Apache-2.0 | Publico en HuggingFace |
| Otras iteraciones de la serie E2K `cd82` (incluidas las de calentamiento solo-SFT) | no disponible | no disponible | Mismo experimento, distinto punto del calendario SFT/RL | Apache-2.0 (heredada) | Listadas en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos de terceros en la información proporcionada, por lo que no se incluye una comparación cuantitativa frente a otras familias.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo de propósito general: el autor indica explícitamente que no es una mejora general de Qwen3.8-27B, sino el resultado de entrenar sobre un único juego y evaluar en rollouts de 32 episodios del mismo juego.
- Diferencias dentro del ruido: la variación entre brazos es de pocas centésimas de retorno con forma, mientras que el ruido rollout a rollout de un mismo brazo ronda 0,05.
- Run cancelada por colapso de política: se interrumpió al alcanzar un 45 % de episodios finalizados con una sola llamada, señal de degradación hacia comportamiento trivial.
- Sin métricas de juego publicadas para esta run en los logs de Slurm; las métricas viven en el `wandb_export` del dataset, fuera del repositorio del modelo.
- Entrenamiento solo de texto: la torre de visión se copia sin cambios y el actor nunca vio una imagen, por lo que no hay garantía de que el ajuste afecte de forma coherente al comportamiento multimodal pese al pipeline `image-text-to-text`.
- Sesgos y riesgo de alucinación: no documentados en la información disponible. Al conservar la pila de texto del base con un ajuste muy estrecho sobre una tarea, los sesgos heredados de Qwen3.8-27B no se han evaluado ni mitigado en este checkpoint.
- Idiomas y longitud de contexto: no disponibles; no se han validado capacidades multilingües ni comportamiento en ventanas largas tras el ajuste.
- Licencia Apache-2.0 permite uso comercial, pero el alcance real del modelo (una tarea de ARC-AGI-3) hace desaconsejable cualquier despliegue en producción.
- Reproducibilidad parcial: el repositorio no incluye los momentos del optimizador; el estado completo (~351 GB) queda en Isambard-AI.
- Trazabilidad: el repositorio depende de artefactos externos (`megatron/`, `E2K_VERIFY.json`, `SHA256SUMS` y el dataset de RL) para verificar la procedencia de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_inter_decl-cc2-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL de la run (episodios, métricas, filas y log): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código: repositorio `ziyan-wang98/knowledge-learning-e2k`, rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md` (no se proporciona URL en la información disponible)
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada

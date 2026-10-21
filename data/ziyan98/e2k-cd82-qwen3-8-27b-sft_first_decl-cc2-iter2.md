# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter2

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter2 es un checkpoint de investigación obtenido al aplicar el experimento de internalización de conocimiento E2K sobre Qwen/Qwen3.8-27B, un modelo multimodal de 27.781.427.952 parámetros (27,78 B) con arquitectura qwen3_5 (torre de visión más pila de texto y cabeza de predicción multi-token). Lo desarrolla Ziyan Wang (King's College London) y se publica bajo licencia Apache-2.0, con pesos en safetensors bf16 y 1199 tensores con las mismas formas que el modelo base.

El objetivo del experimento no es mejorar el modelo de forma general, sino estudiar si el conocimiento verificado extraído de las propias partidas del modelo en un juego de ARC-AGI-3 (concretamente `cd82-fb555c5d`) puede escribirse en los pesos mediante filas supervisadas de chat declarativo y después refinarse con aprendizaje por refuerzo sobre episodios multi-paso reales. Este checkpoint concreto corresponde al iteración 2 de la ejecución `sft_first_decl-cc2`, un bloque únicamente de SFT (sin RL acumulado) que se canceló durante la rollout 3 de RL al detectarse un 33 % de episodios resueltos en una sola llamada. El autor lo etiqueta explícitamente como resultado negativo.

Su relevancia es metodológica: documenta con detalle la pila de entrenamiento (slime v0.3.2 sobre Megatron-LM con TP4 × PP4, 16 motores de rollout SGLang y Dr.GRPO), las métricas de pérdida del conocimiento (NLL de 1,67 a aproximadamente 0,56 por token durante el calentamiento) y la trazabilidad completa de la conversión de pesos. No es un modelo para producción ni una mejora medible del modelo base: las diferencias entre brazos del estudio son de centésimas de retorno conformado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal: pila de texto + torre de visión + cabeza de predicción multi-token) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (se hereda la del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | no disponible; solo se publican pesos bf16 (no hay GGUF, AWQ ni GPTQ oficiales) |
| Idiomas soportados | no disponible (no declarados; se heredan los del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en bf16 (1199 tensores, mismo conjunto y formas que Qwen/Qwen3.8-27B); tamano del repo 55,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base qwen3_5: una pila de texto (`model.language_model.*` y `lm_head`), una torre de visión (`model.visual.*`) y una cabeza de predicción multi-token (`mtp.*`). En este checkpoint solo se entrenó la pila de texto; la torre de visión y la cabeza MTP se copiaron sin cambios desde el checkpoint base porque el actor nunca vio imágenes. La conversión de Megatron torch_dist a HF se hizo con el mapeo `megatron_to_hf.convert_to_hf` de slime, con verificación de formas y dtypes tensor a tensor y comprobación de identidad bit a bit de los tensores copiados (`E2K_VERIFY.json`, `SHA256SUMS`).

El entrenamiento se ejecutó en 4 nodos GH200 de Isambard-AI con slime v0.3.2, Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1. La fase SFT usó 781 filas declarativas en formas de pregunta-respuesta y regla, con ratio de anclaje 1,5, 448 filas de chat por rollout y terminación en texto. La fase de RL empleó Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), una muestra de entrenamiento por llamada al modelo, batch global 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento explícito. La recolección de partidas se hizo con Claude Code CLI 2.1.270 manejando las herramientas MCP `look`, `act` y `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1 a 4 con tope de un nivel y retorno conformado adicional por niveles superados.

## Capacidades

- Generación de texto conversacional con la plantilla de chat y el modo thinking originales del modelo base, sin modificaciones.
- Procesamiento de imagen y texto (`image-text-to-text`) a través de la torre de visión heredada, aunque dicha torre no recibió entrenamiento en este experimento.
- Predicción multi-token mediante la cabeza MTP copiada del base, reutilizable para decodificación especulativa.
- Razonamiento multi-paso en entornos de juego tipo ARC-AGI-3 mediante llamadas a herramientas MCP (`look`, `act`, `status`), capacidad objeto del estudio.
- Internalización de conocimiento declarativo: las filas SFT buscaban reducir la NLL del conocimiento de 1,67 a aproximadamente 0,56 por token, es decir, que el modelo reprodujese reglas y respuestas del juego sin que apareciesen en el prompt de RL.
- Capacidades de tool calling y function calling heredadas del modelo base a través de su plantilla y configuración de generación.
- Capacidades multilingües y de código: no documentadas en la información disponible; se asumen las del modelo base, sin verificación específica en este checkpoint.

## Casos de uso

- Replicación de experimentos de internalización de conocimiento: sirve como punto de comparación (iteración 2, solo SFT) frente a iteraciones posteriores con RL y frente al modelo base, para estudiar si las filas declarativas mueven la NLL del conocimiento sin afectar al comportamiento de juego.
- Estudio de metodología de RL con Dr.GRPO: el repositorio incluye `megatron/args.json`, `common.pt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (salvo momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Investigación sobre agentes en entornos con herramientas MCP: el arnés `look`/`act`/`status` sobre ARC-AGI-3 es un banco de pruebas reproducible para medir episodios de una sola llamada frente a episodios multi-paso, un problema detectado en esta misma ejecución.
- Auditoría de pipelines de conversión de pesos Megatron a HuggingFace: el checkpoint y sus ficheros de verificación sirven para validar conversores de torch_dist a safetensors con comprobación bit a bit.
- Servicio de inferencia equivalente al modelo base en tareas de texto: al conservar configuración, tokenizer, plantilla y `lm_head` del base, puede desplegarse con vLLM o SGLang igual que Qwen/Qwen3.8-27B cuando se necesite un checkpoint con las mismas formas y licencia Apache-2.0.
- Docencia y divulgación sobre resultados negativos: ilustra cómo se documenta una cancelación de ejecución (33 % de episodios de una sola llamada) y cómo se separan las métricas de pérdida del conocimiento de las métricas de rendimiento en el juego.
- Base para experimentos de ajuste posteriores en un solo dominio: dado que el entrenamiento fue exclusivamente textual y de un único juego, es un punto de partida controlado para estudiar olvido catastrófico o transferencia a otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay líneas de métricas de juego para esta ejecución en los logs de Slurm y remite al `wandb_export` del dataset `ziyan98/E2K-cd82-rl-internalization`. La única métrica cuantitativa publicada es la pérdida del conocimiento (NLL) durante el calentamiento SFT: descenso de 1,67 a aproximadamente 0,56 por token.

| Metrica | Valor | Fuente |
|---|---|---|
| NLL del conocimiento (inicio del calentamiento SFT) | 1,67 por token | model card |
| NLL del conocimiento (final del calentamiento SFT) | ≈ 0,56 por token | model card |
| Retorno conformado en juego | no disponible en los logs de esta ejecucion | model card |
| Ruido entre rollouts de un mismo brazo | ≈ 0,05 de retorno conformado | model card |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no disponibles | - |

## Requisitos de hardware

- VRAM estimada en bf16: unos 56 GB solo para pesos, más caché KV y activaciones; en la práctica requiere 70-80 GB para contexto moderado.
- GPU de datacenter recomendadas: A100 80 GB, H100 80 GB o GH200; el entrenamiento original usó 4 nodos GH200 con TP4 × PP4 y 16 motores SGLang.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB). Con cuantización de 8 bits (≈28 GB) sigue sin caber en 24 GB; con 4 bits (≈14-16 GB) podría caber en RTX 4090, RTX 3090 o RTX 5090, aunque no se distribuyen pesos cuantizados oficiales y el autor no reporta esta vía.
- Despliegue: la model card indica que vLLM y SGLang lo cargan igual que el modelo base; también es cargable con `transformers` mediante `Qwen3_5ForConditionalGeneration.from_pretrained(..., dtype="bfloat16", device_map="auto")`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: 55,6 GB para el repo de pesos; el checkpoint completo con estado del optimizador ocupa aproximadamente 351 GB y permanece en Isambard-AI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter2 | 27,78 B | no disponible | SFT declarativo (781 filas) sobre un juego ARC-AGI-3, sin RL acumulado | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | modelo base multimodal | apache-2.0 | publico |
| Otras iteraciones de la serie E2K-cd82 | 27,78 B | no disponible | variantes de la misma ejecucion, incluidas las de calentamiento solo SFT | apache-2.0 | un repositorio por iteracion, listados en `checkpoints/checkpoints.md` del dataset de RL |

No se dispone de datos de benchmarks ni de comparaciones con modelos de terceros de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparativa de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es una mejora general del modelo base: fue entrenado sobre un único juego (`cd82-fb555c5d`), evaluado con rollouts de 32 episodios de ese mismo juego y las diferencias entre brazos son de centésimas de retorno conformado.
- Resultado negativo declarado por el autor: la ejecución se etiqueta como "collapsed trial (negative result)" y se canceló durante la rollout 3 de RL al alcanzar un 33 % de episodios resueltos en una sola llamada.
- No hay métricas de juego publicadas para esta ejecución en los logs; cualquier evaluación de rendimiento requiere reproducir el arnés por cuenta propia.
- Riesgo de alucinación: no evaluado en este checkpoint; se hereda el comportamiento del modelo base, sin datos específicos.
- Sesgos: no documentados en la información disponible.
- Idiomas: no declarados; la cobertura multilingüe no está verificada para este checkpoint.
- Modalidad visual: la torre de visión se copió sin entrenar y el actor nunca vio imágenes, por lo que el ajuste no afecta a la percepción visual y su comportamiento multimodal es el del base.
- Entrenamiento exclusivamente textual sobre un dominio estrecho: existe riesgo de sobreajuste a las formas declarativas del juego y de olvido de otras capacidades, no cuantificado.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja implícitamente su uso en producción al tratarse de un checkpoint de investigación; el uso comercial queda además sujeto a los términos heredados de Qwen3.8-27B.
- Trazabilidad: los pesos son reproducibles, pero el estado completo con optimizador (≈351 GB) no se distribuye, solo queda listado en el dataset de RL.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_decl-cc2-iter2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de episodios, métricas y log de la ejecución: https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Dataset E2K-40: https://huggingface.co/datasets/ziyan98/E2K-40
- Código del proyecto: `ziyan-wang98/knowledge-learning-e2k` (rutas `src/knowledge_learning/rl/` y `docs/RL_KNOWLEDGE_SFT.md`; no se proporciona URL completa)
- Paper, blog o demo: no disponibles en la informacion proporcionada

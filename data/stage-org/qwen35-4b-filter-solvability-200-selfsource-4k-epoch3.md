# Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k-epoch3

## Resumen

Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k-epoch3 es un checkpoint de lenguaje de 4.539.265.536 parámetros (unos 4,54 mil millones) derivado de Qwen/Qwen3.5-4B mediante aprendizaje por refuerzo. Lo publica la organización Stage-org dentro de su pipeline interno de entrenamiento (denominado jh-workflow en la model card) y se apoya en el dataset Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k. El identificador sugiere un experimento de filtrado por «solvabilidad» sobre tareas autogeneradas, con un presupuesto de 4k muestras y el tercer epoch de entrenamiento como punto de publicación.

El interés técnico del artefacto está en el proceso más que en el resultado: documenta un ciclo completo de RL sobre un modelo denso de ~4B, con generación con modo pensamiento activado, un juez LLM externo como función de recompensa, máscaras de pérdida tipo DPPO y un presupuesto de hardware reducido (2 GPU por nodo, una para inferencia con vLLM y otra para entrenamiento). No es un modelo de propósito general listo para producción.

Su relevancia actual es limitada fuera del contexto del experimento: el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas, pipeline ni benchmarks, y la model card se limita a la procedencia del entrenamiento (dataset, comando y configuración). Cualquier evaluación de calidad, sesgos o capacidades reales queda pendiente de pruebas propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (etiqueta `qwen3_5`); número de capas, cabezas y tipo de atención no disponibles |
| Parámetros totales | 4.539.265.536 (~4,54 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificación del modelo; la configuración de inferencia del entrenamiento usa `max_model_len = 65536` y el learner declara `seq_len = 300000` |
| Tipos de cuantización | no disponible; el repositorio solo contiene pesos en safetensors (sin GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamaño del repositorio: 9,1 GB) |

## Arquitectura y entrenamiento

La base es Qwen/Qwen3.5-4B, un transformer decoder denso de la familia Qwen3.5. El ajuste se realizó con aprendizaje por refuerzo usando el stack `prime_rl` integrado en el pipeline del autor: método `rl`, 10.000 pasos de learner, 3 epochs, `batch_size` de 128, `group_size` de 8 (esquema tipo GRPO con 8 muestras por prompt) y semilla 7. El optimizador es AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0,9/0,99; la pérdida usa máscaras DPPO con umbrales `dppo_mask_low = 0.2` y `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001` como coeficiente de divergencia KL. La atención emplea `flash_attention_2`.

La generación durante el RL se hizo con `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, es decir, con el modo de razonamiento explícito activado. La recompensa en tareas abiertas proviene de un juez LLM externo (`gpt-5.6-luna`) al que se llama vía API con `reasoning_effort = medium`, `temperature = 1.0`, hasta 3 reintentos y 32 peticiones en vuelo; la agregación no usa media de puntuaciones (`mean_score = false`). La inferencia de rollout se sirvió con vLLM (`gpu_memory_utilization = 0.9`, `max_model_len = 65536`), con `language_model_only = true` —lo que sugiere que solo se cargó el componente de lenguaje— y parsers `qwen3` para razonamiento y `qwen3_coder` para llamadas a herramientas. El orquestador permitió 256 rollouts en vuelo y hasta 8 pasos fuera de política. El guardado de checkpoints se hizo cada 1000 unidades de epoch conservando únicamente el último (`keep_last = 1`, `weights_only = true`), con 2 GPU por nodo: 1 para inferencia y 1 para entrenamiento. No se documenta el volumen de tokens de entrenamiento ni la composición del dataset más allá de su identificador.

## Capacidades

- Generación de texto autoregresiva en el componente de lenguaje, con el modo pensamiento habilitado durante el entrenamiento.
- Razonamiento en varios pasos (`enable_thinking = true`, parser de razonamiento `qwen3`), orientado a tareas con solución verificable, según el nombre del dataset (`filter-solvability`).
- Llamada a herramientas / function calling: el pipeline de inferencia configura explícitamente `tool_call_parser = qwen3_coder`, lo que indica que el formato de tool calling está contemplado.
- Autogeneración de datos: el sufijo `selfsource` del dataset apunta a un flujo en el que el propio modelo produce material de entrenamiento filtrado por solvabilidad.
- Capacidades multilingües: no disponible.
- Visión, audio u otras modalidades: no disponible (la inferencia se ejecutó con `language_model_only = true`).
- No hay ninguna evaluación publicada que confirme el grado real de conservación de estas capacidades tras el RL.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida reproducible para estudiar el efecto del filtrado por solvabilidad de tareas autogeneradas sobre un modelo de ~4B, comparando contra el checkpoint base.
- Estudio de jueces LLM como recompensa: al documentarse el endpoint del juez, los umbrales DPPO y el `kl_tau`, es un caso práctico para analizar cómo un juez propietario moldea el comportamiento del policy.
- Experimentos de destilación o anotación sintética: el modelo puede emplearse para generar soluciones candidatas que después se filtren por verificabilidad, replicando el bucle `selfsource` del propio entrenamiento.
- Prototipado de agentes con herramientas en local: gracias al parser `qwen3_coder` y a los 65536 tokens de `max_model_len` en la configuración de inferencia, permite montar un bucle de tool calling en una única GPU de 24 GB para pruebas de concepto.
- Evaluación de alucinación y degradación tras RL: al no existir benchmarks, resulta útil como sujeto de pruebas para medir si el ajuste por recompensa de juez incrementa la verbosidad o la adulación.
- Fine-tuning posterior en dominio vertical: el tamaño de ~4,5B permite hacer SFT o LoRA sobre GPU de consumo, partiendo de este checkpoint o del base, para tareas de código o matemáticas.
- Reproducción de infraestructura: la configuración publicada (vLLM + prime_rl, 2 GPU por nodo, checkpoints cada 1000 epochs) es un plano concreto para montar un entorno de RL de bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y no hay métricas de recompensa del juez reportadas.

## Requisitos de hardware

- Pesos en bf16/fp16: ~9,1 GB (coincide con el tamaño del repositorio). La caché KV para 65.536 tokens añade una cantidad no determinable sin conocer capas y cabezas KV, que no están publicadas.
- Cuantización INT8: ~4,6 GB de pesos (estimación); INT4: ~2,5 GB de pesos (estimación). No hay ficheros cuantizados publicados, por lo que habría que generarlos.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en bf16 con margen para contexto moderado; en RTX 4080/4070 Ti (16 GB) requeriría cuantización de 8 bits o inferior. La configuración de entrenamiento usó solo 2 GPU por nodo.
- GPU de centro de datos: A100 40/80 GB, H100 o L40S, recomendables si se necesita el contexto completo de 65.536 tokens o varios rollouts concurrentes.
- Despliegue: vLLM es la opción probada por el autor (`flash_attention_2`, `max_model_len = 65536`, parsers `qwen3` y `qwen3_coder`). También son viables TGI o `transformers` con safetensors; llama.cpp u Ollama exigirían convertir los pesos a GGUF, que no existe en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k-epoch3 | 4,54 mil millones | no disponible (config. de inferencia: 65.536 tokens) | no disponible | safetensors, 0 descargas | no publicados |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponibles en la información proporcionada |

No se dispone de datos de alternativas comparables (familias densas de 3-4B como Qwen3, Llama 3.2 3B o Phi-4-mini) dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin benchmarks ni métricas de recompensa: se desconoce si el RL mejoró, degradó o dejó igual al modelo base en tareas estándar.
- Riesgo de sobreajuste al juez: al optimizar contra un juez LLM propietario (`gpt-5.6-luna`) con `kl_tau = 0.001`, es esperable deriva hacia el estilo y los sesgos de ese juez, además de posible reward hacking.
- Reproducibilidad limitada: el juez depende de variables de entorno (`JUDGE_BASE_URL`, `JUDGE_API_KEY`) y de un modelo no abierto, por lo que el entrenamiento no es replicable tal cual.
- Solo se conserva el último checkpoint (`keep_last = 1`, `weights_only = true`): no hay estados de optimizador ni puntos intermedios para reanudar.
- Alucinación: no hay evaluación de fiabilidad factual; un modelo de 4,5B ajustado por RL sin verificación factual explícita tiende a producir contenido plausible pero incorrecto.
- Idiomas: no declarados; no hay garantía de cobertura multilingüe más allá de la del modelo base.
- Contexto: el único dato disponible es `max_model_len = 65536` en la configuración de inferencia del entrenamiento, no una especificación oficial del modelo; el comportamiento real a esa longitud no está verificado.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado ni model card descriptiva, lo que dificulta contrastar su calidad.
- Uso responsable: al ser un artefacto de investigación sin auditoría, no debería emplearse en decisiones automatizadas que afecten a personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k-epoch3
- Dataset de entrenamiento citado: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del pipeline: no disponible en la información proporcionada

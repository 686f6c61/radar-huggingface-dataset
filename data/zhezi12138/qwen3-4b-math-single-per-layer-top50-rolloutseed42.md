# zhezi12138/Qwen3-4B-math-single-per-layer-top50-rolloutseed42

## Resumen

Qwen3-4B-math-single-per-layer-top50-rolloutseed42 es un ajuste fino por refuerzo del modelo base Qwen/Qwen3-4B, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de entrenamiento disperso (sparse training) sobre el modelo denso original: se congela la mayor parte de los pesos y solo se actualizan, en cada una de las 36 capas, los 4 de 8 grupos GQA con mayor importancia de gradiente para la tarea de matematicas, junto con sus columnas correspondientes en la proyeccion de salida. El resto de componentes (MLP, embeddings, norms, LM head y bloques de atencion no seleccionados) permanece congelado.

El objetivo del experimento es estudiar si es posible especializar un modelo de 4B parametros en razonamiento matematico mediante RL (GRPO) actualizando solo un subconjunto reducido de parametros de atencion, manteniendo el resto intacto. El autor reporta 400 actualizaciones de RL partiendo de Qwen3-4B, con una mejora en la evaluacion sobre los mismos 1000 prompts de entrenamiento (no held-out) del 44,5% al 53,9%.

Es relevante por su caracter metodologico: explora tecnicas de entrenamiento eficiente y disperso con Megatron y GRPO sobre un modelo pequeno, y publica checkpoints distribuidos de Megatron (no safetensors de Transformers), lo que limita su uso directo fuera del entorno de entrenamiento miles/Megatron Bridge. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye datos de benchmarks estandar ni especificaciones completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), atencion GQA con 8 grupos, 36 capas |
| Parametros totales | 4B (heredados de Qwen3-4B; no se especifica recuento exacto tras el ajuste) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (checkpoints Megatron distribuidos, no GGUF/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoints distribuidos de Megatron (no Transformers safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only denso con atencion GQA. El ajuste aplica entrenamiento disperso por capas: en cada una de las 36 capas se seleccionan los 4 de 8 grupos GQA con mayor importancia de gradiente para la tarea de matematicas (per-layer top50%), y se entrenan esos grupos junto con las columnas correspondientes de la proyeccion de salida. MLP, embeddings, norms, LM head y los bloques de atencion no seleccionados quedan congelados. Se trata de una seleccion por capa, no de un top50% global.

El entrenamiento usa GRPO (Group Relative Policy Optimization) con 400 actualizaciones, learning rate constante de 3e-6, rollout seed 42, 16 prompts x 4 muestras, batch global 64, tope de respuesta de 3072 tokens, tensor parallel 2 y modo chat nonthinking. Los gradientes congelados se ponen a cero antes del clipping. El verificador usado tanto en entrenamiento como en evaluacion es `math` (no `dapo_math`). La evaluacion se ejecuta antes de entrenar y cada 10 actualizaciones, con una muestra por prompt, top_k 1, temperatura 1.0 y tope de respuesta de 4096 tokens, sobre los mismos 1000 prompts fijos de matematicas (`dapo-math-eval-1000.jsonl`). Se incluyen checkpoints `iter_0000199` (200 actualizaciones) e `iter_0000399` (400 actualizaciones); el tracker selecciona la iteracion final 399. El estado del optimizador no se guarda. Revision base: `1cfa9a7208912126459214e8b04321603b3df60c`.

## Capacidades

- Generacion de texto y razonamiento matematico, especializado mediante RL sobre Qwen3-4B.
- Razonamiento multi-paso en problemas de matematicas (entrenado con GRPO y verificador `math`).
- Modo chat nonthinking (el entrenamiento se realizo en este modo).
- Capacidades heredadas de Qwen3-4B (generacion, codigo, multilingue): no verificadas ni documentadas en esta model card.
- Tool calling / function calling: no documentado en la model card.
- Soporte de agentes: no documentado.
- Vision, audio: no soportado (modelo de texto).
- Thinking mode: no documentado; el entrenamiento uso modo nonthinking.

## Casos de uso

- Investigacion en entrenamiento disperso: el modelo sirve como artefacto para reproducir y analizar el efecto de actualizar solo el top50% por capa de los grupos GQA en tareas de matematicas, comparando con el modelo base.
- Experimentos de RL con GRPO sobre modelos pequenos: util para estudiar dinamicas de entrenamiento con verificadores de matematicas y presupuestos de actualizacion reducidos (400 pasos).
- Evaluacion de especializacion selectiva: permite medir cuanto rendimiento matematico se gana actualizando un subconjunto minimo de parametros de atencion, con el resto congelado.
- Reproduccion de pipelines Megatron/miles: el checkpoint y la mascara de cabeza incluida permiten reanudar o auditar el entrenamiento en el entorno Miles/Megatron Bridge.
- Analisis de importancia de gradientes en GQA: el modelo documenta la seleccion per-layer de grupos de atencion, util para estudiar que cabezas/grupos contribuyen al razonamiento matematico.
- Base para posteriores ajustes: al conservar la mayor parte de los pesos de Qwen3-4B, puede servir como punto de partida para experimentos de merging o de ajuste adicional, siempre que se convierta el checkpoint a un formato compatible.

## Benchmarks y rendimiento

| Evaluacion | Antes del entrenamiento | Tras 400 actualizaciones |
|---|---|---|
| Math (1000 prompts de entrenamiento, 1 muestra, top_k 1, temp 1.0, cap 4096) | 44,5% | 53,9% |

Nota: son puntuaciones sobre los mismos prompts de entrenamiento, no resultados de test held-out. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para un modelo denso de 4B en bf16 se situaria en torno a 8-10 GB, y en cuantizacion de 4 bits alrededor de 3-4 GB (estimacion orientativa, no confirmada para este checkpoint).
- GPU recomendadas: no disponible. El entrenamiento uso tensor parallel 2, lo que implica al menos 2 GPU; el modelo base Qwen3-4B cabe en GPU consumer de gama alta.
- Cabe en consumer GPU: previsiblemente si (RTX 4090, 3090, etc.) para el modelo base, pero el checkpoint publicado esta en formato Megatron distribuido y requiere conversion.
- Opciones de despliegue: el checkpoint debe cargarse con el entorno miles/Megatron Bridge y la configuracion de Qwen3-4B; no se proporcionan pesos GGUF ni safetensors para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-4B-math-single-per-layer-top50-rolloutseed42 | 4B | no disponible | Matematicas (RL disperso) | apache-2.0 | Megatron distribuido |
| Qwen/Qwen3-4B (base) | 4B | no disponible | Generalista | apache-2.0 | safetensors |
| Otros ajustes matematicos de Qwen3-4B | 4B | no disponible | Matematicas | variable | variable |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los resultados reportados (44,5% -> 53,9%) son sobre los mismos prompts de entrenamiento, no sobre un conjunto de test held-out; no deben interpretarse como rendimiento generalizable.
- El checkpoint esta en formato Megatron distribuido, no en safetensors de Transformers; requiere el entorno miles/Megatron Bridge y la configuracion de Qwen3-4B para cargarse.
- No se guarda el estado del optimizador, lo que limita reanudar el entrenamiento de forma exacta.
- El modelo solo se entreno en modo chat nonthinking; el comportamiento en thinking mode no esta documentado.
- Especializado en matematicas mediante un subconjunto reducido de parametros; puede degradar capacidades generales no verificadas respecto al base.
- Riesgo de alucinacion y sesgos: no documentado en la model card; hereda los del modelo base Qwen3-4B.
- Idiomas soportados: no disponible.
- Licencia apache-2.0 permite uso comercial, pero al derivar de Qwen3-4B conviene verificar las condiciones del modelo base.
- 0 descargas y 0 likes: sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-math-single-per-layer-top50-rolloutseed42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- W&B del entrenamiento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/f17b803c

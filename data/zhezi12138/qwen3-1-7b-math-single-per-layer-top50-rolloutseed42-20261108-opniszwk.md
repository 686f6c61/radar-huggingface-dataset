# zhezi12138/Qwen3-1.7B-math-single-per-layer-top50-rolloutseed42-20261108-opniszwk

## Resumen

Qwen3-1.7B-math-single-per-layer-top50-rolloutseed42-20261108-opniszwk es un checkpoint experimental derivado de Qwen/Qwen3-1.7B, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un experimento de ajuste fino con refuerzo (RL) sobre un subconjunto disperso de los pesos del modelo base: tras 400 actualizaciones de GRPO orientadas a matematicas, solo entrenan las 4 de 8 cabezas GQA con mayor importancia de gradiente en cada una de las 28 capas, mientras que MLP, embeddings, normas, LM head y los bloques de atencion no seleccionados permanecen congelados.

El objetivo del experimento es medir cuanto rendimiento en matematicas puede obtenerse modificando unicamente una fraccion reducida de los parametros de atencion, manteniendo el resto del modelo intacto. El autor reporta una mejora en su evaluacion interna sobre los mismos 1000 prompts de entrenamiento, del 27,0 % al 40,0 % tras 400 actualizaciones, aunque advierte explicitamente de que no son resultados sobre un conjunto de test reservado.

La relevancia del artefacto es acotada: se distribuye como checkpoints distribuidos de Megatron (no como safetensors de Transformers), requiere el entorno de entrenamiento miles/Megatron Bridge para cargarse, no incluye estado del optimizador y tiene cero descargas y cero likes en el momento de redactar esta ficha. Es material de investigacion reproducible, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion GQA (8 grupos, 4 seleccionados por capa en este checkpoint), 28 capas; base Qwen3-1.7B |
| Parametros totales | 1,7 mil millones (heredados del modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE; el termino "top50%" se refiere a la seleccion de cabezas GQA entrenadas, no a parametros activos en inferencia) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B define el contexto nativo, pero la model card no lo especifica) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints Megatron en precision de entrenamiento; no hay GGUF ni safetensors cuantizados) |
| Idiomas soportados | no disponible en la model card (heredados del modelo base Qwen3-1.7B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints distribuidos de Megatron (`iter_0000199` e `iter_0000399`), no safetensors de Transformers; sin estado del optimizador |
| Revision del modelo base | `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e` |
| Tamano del repositorio | 6,9 GB |
| Fecha de creacion | 2026-11-09 |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3-1.7B, un transformer decoder-only con atencion de consultas agrupadas (GQA) repartida en 28 capas. El experimento aplica una mascara de gradiente por capa: en cada una de las 28 capas se seleccionan las 4 de 8 cabezas GQA con mayor importancia de gradiente segun un ranking calculado en la tarea de matematicas, incluyendo las columnas correspondientes de la proyeccion de salida. El resto de componentes (MLP, embeddings, normas, LM head y bloques de atencion no seleccionados) permanece congelado, con los gradientes puestos a cero antes del recorte. El autor subraya que la seleccion es "per-layer top50%", distinta de una seleccion global top50%.

El entrenamiento usa GRPO con un seed de rollout fijo (42), 16 prompts con 4 muestras cada uno, batch global de 64, tope de respuesta de 3072 tokens, tensor parallel de 2, learning rate constante de 3e-6 y modo chat "nonthinking". Se completaron 400 actualizaciones de RL sobre los mismos 1000 prompts fijos de matematicas (`dapo-math-eval-1000.jsonl`) que se usan tambien para la evaluacion en entrenamiento, con el verificador `math` (no `dapo_math`). La evaluacion se ejecuta antes de entrenar y cada 10 actualizaciones, con una muestra por prompt, top_k 1, temperatura 1.0 y tope de respuesta de 4096 tokens. El checkpoint final seleccionado es `iter_0000399` (400 actualizaciones); tambien se incluye `iter_0000199` (200 actualizaciones).

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3-1.7B.
- Razonamiento matematico reforzado mediante GRPO sobre prompts de matematicas, con mejora reportada del 27,0 % al 40,0 % en la evaluacion interna de prompts de entrenamiento.
- Modo chat "nonthinking" (el entrenamiento se realizo sin modo de razonamiento extendido).
- Soporte de tool calling y function calling: no documentado en la model card; dependeria del modelo base y de que el ajuste disperso no lo degrade, algo no verificado.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en la informacion disponible.
- Capacidades multilingues: no documentadas en la model card.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Investigacion sobre entrenamiento disperso: el checkpoint permite reproducir y analizar si el ajuste de solo 4 de 8 cabezas GQA por capa basta para mejorar matematicas, comparando `iter_0000199` e `iter_0000399` con el modelo base.
- Estudio de seleccion de subredes por importancia de gradiente: sirve para validar rankings de importancia por capa frente a selecciones globales, un tema activo en eficiencia de entrenamiento.
- Experimentos de RL con verficador en dominios acotados: el pipeline GRPO con verificador `math` puede reutilizarse como referencia metodologica para tareas con recompensa verificable.
- Analisis de degradacion colateral: util para medir si congelar MLP y la mayoria de la atencion preserva capacidades generales del base mientras se especializa en matematicas.
- Reproducibilidad de experimentos Megatron: los checkpoints distribuidos y los ficheros de auditoria (`completion-eval-audit.json`, `evaluation_history.json`, `SHA256SUMS.json`) permiten auditar la configuracion exacta de evaluacion.
- Base para destilacion o merging experimental: al ser un delta pequeno sobre Qwen3-1.7B, puede estudiarse su combinacion con el modelo original en entornos de investigacion.

## Benchmarks y rendimiento

| Evaluacion | Antes del entrenamiento | Tras 400 actualizaciones |
|---|---|---|
| Math (evaluacion interna sobre 1000 prompts de entrenamiento, 1 muestra, top_k 1, temp 1.0) | 27,0 % | 40,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) ni evaluaciones sobre conjuntos de test reservados en la informacion disponible. El propio autor advierte de que las cifras anteriores son puntuaciones sobre los prompts de entrenamiento y no resultados held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma directa, ya que el repositorio contiene checkpoints Megatron, no pesos en safetensors ni GGUF. Para un modelo de 1,7 mil millones de parametros en precision BF16 se necesitarian aproximadamente 3,4 GB solo de pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits rondaria 1,7 GB y en 4 bits unos 0,9 GB, pero estas conversiones no estan publicadas.
- GPU recomendadas: no especificadas en la model card. El entrenamiento uso tensor parallel de 2, lo que implica al menos 2 GPU para reproducir el pipeline.
- Compatibilidad con GPU de consumo: no confirmada; al no haber pesos Transformers ni GGUF, no puede ejecutarse directamente en llama.cpp, Ollama ni similares sin conversion previa.
- Opciones de despliegue: el autor indica cargar los checkpoints con el entorno miles/Megatron Bridge y la configuracion del base Qwen3-1.7B. vLLM, TGI, llama.cpp y Ollama no estan soportados de forma nativa para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B math sparse RL) | 1,7 B | no disponible | Apache 2.0 | Megatron distribuido | 400 updates GRPO, solo 4/8 cabezas GQA por capa entrenadas; 40,0 % en evaluacion interna de prompts de entrenamiento |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en esta ficha | Apache 2.0 | safetensors Transformers | Punto de partida; 27,0 % en la misma evaluacion interna antes del RL |
| Qwen3-1.7B con RL completo (no disponible como referencia publica en la informacion) | 1,7 B | no disponible | Apache 2.0 | no disponible | No se dispone de datos comparativos de un ajuste denso equivalente |

No se dispone de informacion sobre otros modelos de la misma categoria con los que comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Las cifras de mejora (27,0 % a 40,0 %) corresponden a los mismos prompts usados en entrenamiento; no son resultados held-out y no deben interpretarse como ganancia generalizable.
- El checkpoint no esta en formato Transformers: requiere el entorno miles/Megatron Bridge y la configuracion del base Qwen3-1.7B para cargarse; no es plug-and-play con vLLM, TGI, llama.cpp u Ollama.
- No se guarda el estado del optimizador, lo que limita reanudar el entrenamiento exactamente donde se dejo.
- Solo se entrena un subconjunto de cabezas GQA por capa; el resto del modelo queda congelado, por lo que el alcance de la especializacion es acotado y podria no transferirse a otras tareas.
- No hay evaluacion de capacidades generales (lenguaje, codigo, tool calling, multilingue) tras el ajuste, por lo que se desconoce si el RL disperso degrada otras habilidades del base.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; se heredan los del modelo base Qwen3-1.7B, no documentados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto es experimental, sin garantias de calidad y con cero descargas y validacion externa.
- El repositorio ocupa 6,9 GB e incluye dos iteraciones y ficheros de auditoria; conviene revisar `SHA256SUMS.json` antes de usarlo.
- La fecha de creacion (2026-11-09) y el nombre del checkpoint incluyen un identificador de run (`opniszwk`) que conviene conservar para trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhezi12138/Qwen3-1.7B-math-single-per-layer-top50-rolloutseed42-20261108-opniszwk
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Run de W&B: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/opniszwk
- Ficheros de auditoria incluidos en el repo: `completion-eval-audit.json`, `evaluation_history.json`, `SHA256SUMS.json`
- Dataset de evaluacion referenciado: `dapo-math-eval-1000.jsonl` (SHA256 registrado en la procedencia del repo)
- Entorno de carga indicado por el autor: miles/Megatron Bridge (no se proporciona URL en la informacion disponible)

# wckwan/grpo-qwen3.5-9b-seven-task-b8-matched

## Resumen

grpo-qwen3.5-9b-seven-task-b8-matched es un ajuste fino del modelo Qwen/Qwen3.5-9B realizado por el usuario wckwan mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). El objetivo declarado es el entrenamiento de razonamiento eficiente: el modelo aprende a resolver tareas produciendo la respuesta final directamente, sin cadenas de pensamiento largas, guiado por una recompensa que evalua unicamente la correccion del texto posterior a la etiqueta `</think>`. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors.

El modelo cuenta con 9.409.813.744 parametros (aproximadamente 9.4 mil millones) y hereda la arquitectura y la ventana de contexto del Qwen3.5-9B base, aunque la model card no detalla estos datos. El entrenamiento se realizo sobre un subconjunto de 512 ejemplos (semilla 0) extraidos de los splits oficiales de entrenamiento del benchmark seven-task, con 8 pasos de optimizacion, 8 prompts y 8 rollouts por paso, tasa de aprendizaje 2e-6, coeficiente KL de 1e-3 y un limite de 32K tokens por rollout, usando verl v0.9.1 con FSDP2 y vLLM.

La relevancia de esta publicacion es metodologica: se presenta como una linea base ajustada por computo (compute-matched) frente a un entrenamiento de 20 pasos con checkpoints intermedios, seleccionando el paso 8 por ser el que iguala aproximadamente 113,39 PFLOPs de computo acumulado. Es, por tanto, un artefacto de investigacion util para estudiar la eficiencia del RL en modelos de razonamiento, no un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento limita los rollouts a 32K tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se mencionan GGUF ni AWQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9.4 mil millones de parametros. La model card no describe cambios arquitectonicos respecto al modelo base: el ajuste consiste exclusivamente en entrenamiento por refuerzo con GRPO, implementado sobre verl v0.9.1 con paralelismo FSDP2 para el entrenamiento y vLLM para la generacion de rollouts. No se mencionan innovaciones como atencion lineal, decodificacion especulativa o mezcla de expertos.

El proceso de entrenamiento usa el ajuste "seven-task" con 8 pasos, 8 prompts y 8 rollouts por paso, tasa de aprendizaje 2e-6, coeficiente KL de 1e-3 y un limite de 32K tokens por rollout. Los datos son 512 ejemplos (semilla 0) de los splits oficiales de entrenamiento, con el system prompt "Solve the user's task and give the final answer directly." y una recompensa basada en la correccion de la tarea evaluada sobre el texto posterior a `</think>`. La seleccion del checkpoint se hizo por equiparacion de computo: frente a una linea base de 20 pasos con checkpoint por paso, se eligio el paso 8 por su computo acumulado mas proximo a 113,39 PFLOPs (12 x 9B x tokens por paso), con el desglose documentado en `train/logs/selection.json`.

## Capacidades

- Generacion de texto y razonamiento: el modelo esta entrenado para resolver tareas y emitir la respuesta final de forma directa, con cadenas de pensamiento minimas.
- Razonamiento eficiente: la recompensa se aplica solo al texto posterior a `</think>`, lo que penaliza implicitamente las trazas de razonamiento largas que no conducen a una respuesta correcta.
- Resolucion de tareas del benchmark seven-task: el ajuste esta especializado en las siete tareas cubiertas por ese conjunto de datos.
- Capacidades heredadas de Qwen3.5-9B: no documentadas en la model card; se desconoce si conserva tool calling, capacidades multilingues, vision u otras funciones del modelo base.
- Soporte de agentes y multi-step reasoning: no documentado.
- Modo thinking explicito: no documentado; el entrenamiento empuja hacia respuestas directas, no hacia modos de pensamiento extendido.

## Casos de uso

- Investigacion sobre eficiencia del RL: el modelo sirve como punto de comparacion controlado por computo (113,39 PFLOPs) frente a entrenamientos mas largos, permitiendo estudiar la relacion entre pasos de GRPO y ganancia en precision.
- Reproduccion de experimentos de razonamiento: al documentarse hiperparametros, semilla y desglose de computo en `train/logs/selection.json`, es adecuado para replicar el ajuste sobre Qwen3.5-9B con verl.
- Evaluacion de recompensas basadas en correccion: util para analizar como una recompensa que solo mira el texto posterior a `</think>` afecta a la longitud y estructura del razonamiento.
- Estudio de la seleccion de checkpoints por computo: el paso 8 seleccionado por equiparacion de PFLOPs permite comparar estrategias de asignacion de presupuesto de entrenamiento.
- Generacion de respuestas directas en tareas acotadas: para las siete tareas del conjunto de entrenamiento, el modelo produce respuestas finales sin trazas largas, lo que reduce tokens de salida en inferencia.
- Base para futuros ajustes: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para experimentos posteriores de RL o SFT en dominios especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta el proceso de entrenamiento y el criterio de seleccion del checkpoint por computo (113,39 PFLOPs), sin cifras de precision en MMLU, GSM8K, HumanEval ni en las tareas del conjunto seven-task.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,8 GB solo para pesos (9.409.813.744 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: unos 9,4 GB de pesos; en 4 bits, unos 4,7 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para BF16 con contexto largo; RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16 con contexto limitado; en GPUs de 16 GB o menos seria necesario cuantizar, sin artefactos oficiales disponibles.
- Opciones de despliegue: vLLM (usado en el entrenamiento para rollouts), TGI y llama.cpp/Ollama tras conversion a GGUF (no se proporcionan pesos GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grpo-qwen3.5-9b-seven-task-b8-matched | 9,41B | no disponible | GRPO, 8 pasos, 512 ejemplos | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Preentrenamiento + postentrenamiento del autor original | no disponible en la informacion | HuggingFace |
| Alternativas de ~9B con RL para razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento usa solo 512 ejemplos de siete tareas concretas; el rendimiento fuera de ese dominio no esta documentado y probablemente degrade respecto al modelo base.
- Riesgo de sobreajuste al formato de recompensa: al evaluarse solo el texto posterior a `</think>`, el modelo puede producir respuestas finales sin razonamiento verificable, lo que dificulta la auditoria de sus conclusiones.
- Sesgos: no documentados; al heredar el modelo base, es probable que arrastre sus sesgos, pero no hay informacion al respecto.
- Alucinacion: no se han publicado evaluaciones de fidelidad factual; el enfasis en respuestas directas sin cadena de pensamiento puede aumentar el riesgo de afirmaciones incorrectas no verificables.
- Idiomas: no se especifican los idiomas soportados; se desconoce si el ajuste RL conserva el multilingüismo del modelo base.
- Contexto: la ventana de contexto del modelo base no se documenta; el limite de 32K tokens corresponde a los rollouts de entrenamiento, no necesariamente al contexto de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se publica como artefacto de investigacion con 0 descargas y sin validacion externa; no se recomienda su uso en produccion sin evaluacion propia.
- Reproducibilidad: depende de verl v0.9.1, FSDP2 y vLLM, y de los splits oficiales del benchmark seven-task, que no se enlazan en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/grpo-qwen3.5-9b-seven-task-b8-matched
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de verl: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Log de seleccion de checkpoint (`train/logs/selection.json`): no disponible como enlace publico en la informacion proporcionada

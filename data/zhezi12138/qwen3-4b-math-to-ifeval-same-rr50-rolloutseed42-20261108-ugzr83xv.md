# zhezi12138/Qwen3-4B-math-to-ifeval-same-rr50-rolloutseed42-20261108-ugzr83xv

## Resumen

Qwen3-4B-math-to-ifeval-same-rr50-rolloutseed42 es un checkpoint de investigación publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de un experimento de entrenamiento continuo (continual learning) con refuerzo sobre el modelo base Qwen/Qwen3-4B. El experimento encadena dos tareas: primero matemáticas (Math) y después seguimiento de instrucciones (IF, instruction following, presumiblemente evaluado con IFEval), reutilizando en la segunda fase los mismos bloques de cabezas de atención (attention heads) que se entrenaron en la primera.

La particularidad técnica del checkpoint es que la fase de IF reutiliza exactamente el mismo 50 % de bloques de cabezas de atención (junto con sus bloques de proyección de salida correspondientes) que ya se habían entrenado durante la tarea fuente de matemáticas, mientras el resto de bloques permanece congelado. El objetivo declarado es estudiar la transferencia y reutilización de subconjuntos de parámetros entre tareas dentro de un pipeline de aprendizaje por refuerzo.

El artefacto se distribuye como checkpoint distribuido original de Megatron (ocho shards `.distcp` por iteración), no como modelo Transformers cargable con `from_pretrained`. Está pensado para investigadores que reproduzcan el entorno de entrenamiento miles/Megatron Bridge con la configuración base de Qwen3-4B. El repositorio ocupa 24,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); entrenamiento con Megatron |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card solo menciona un limite de respuesta de rollout de 3072 tokens) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en formato Megatron `.distcp`, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint distribuido Megatron (`.distcp`, ocho shards por iteracion); no es un modelo Transformers `from_pretrained` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros, y se somete a un entrenamiento continuo con aprendizaje por refuerzo en dos fases encadenadas: primero una tarea de matemáticas y después una tarea de seguimiento de instrucciones (IF). La innovación central del experimento es la reutilización de las mismas cabezas: la fase de IF reentrena el mismo 50 % de bloques de cabezas de atención que se entrenaron en la fase de matemáticas, incluyendo sus bloques de proyección de salida asociados, y mantiene el resto de bloques congelados. El checkpoint fuente de la fase de matemáticas es `zhezi12138/Qwen3-4B-math-to-ifeval-math-rr50-rolloutseed42` en la revisión `c2f491fbc63c05d12860e6b0912ae0b5c8b589c3`, iteración 399.

Los hiperparámetros documentados son: semilla 42, tasa de aprendizaje 3e-6, 16 prompts por 4 muestras, batch global de 64, límite de respuesta de rollout de 3072 tokens, plantilla de chat sin modo thinking, tensor parallel de 2 y gradientes congelados puestos a cero antes del clipping. El entrenamiento de IF comprende 600 actualizaciones y el repositorio incluye las iteraciones 199, 399 y 599, siendo la 599 la seleccionada por el tracker. Se incluyen la máscara original, el protocolo de evaluación y el historial de evaluación durante el entrenamiento. El verificador de matemáticas utilizado es `math`, no `dapo_math`. No se guardó el estado del optimizador, por lo que los pesos no permiten reanudar el entrenamiento con estado exacto.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-4B.
- Razonamiento matemático, reforzado específicamente en la primera fase del entrenamiento continuo.
- Seguimiento de instrucciones (IF), reforzado en la segunda fase del pipeline.
- Entrenamiento con RL sobre plantilla de chat sin modo thinking (nonthinking chat template).
- Capacidades de tool calling, agentes o multimodalidad: no disponibles en la información proporcionada para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje continuo con RL: el checkpoint permite estudiar cómo se transfieren las cabezas de atención entrenadas en matemáticas a una tarea posterior de seguimiento de instrucciones, comparando con variantes que no reutilizan las mismas cabezas.
- Estudio de reutilización de subconjuntos de parámetros: al fijar el mismo 50 % de bloques de cabezas entre tareas, sirve para analizar la especialización y la interferencia entre tareas en un transformer de 4B.
- Reproducción de experimentos de RL a escala media: los hiperparámetros documentados (lr 3e-6, batch 64, rollout 3072, tensor parallel 2) permiten replicar el pipeline en el entorno miles/Megatron Bridge.
- Análisis de olvido catastrófico: al congelar el 50 % restante de bloques, el checkpoint es útil para medir cuánto se preserva del rendimiento en matemáticas tras el entrenamiento de IF.
- Evaluación comparativa de checkpoints intermedios: las iteraciones 199, 399 y 599 incluidas permiten trazar curvas de aprendizaje y seleccionar el punto óptimo para cada tarea.
- Auditoría de protocolos de evaluación: el paquete incluye el historial de evaluación durante el entrenamiento y la máscara original, lo que facilita verificar que las puntuaciones reportadas no son resultados de benchmarks held-out.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las puntuaciones incluidas son del historial de evaluación durante el entrenamiento y no resultados de benchmarks sobre conjuntos held-out.

## Requisitos de hardware

- El checkpoint se distribuye como Megatron `.distcp` (24,1 GB en total), por lo que requiere el entorno miles/Megatron Bridge para cargarlo; no es directamente utilizable con `transformers`, vLLM, llama.cpp u Ollama sin conversión previa.
- Para inferencia tras una hipotética conversión al formato Transformers, un modelo de 4B en FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, más memoria para el contexto y el KV cache.
- GPU recomendadas para el entrenamiento original: no disponible de forma explícita; el uso de tensor parallel 2 sugiere al menos dos GPU con memoria suficiente para un modelo de 4B en entrenamiento RL.
- Encaje en GPU de consumo: no confirmado para este checkpoint en su formato actual; un modelo de 4B equivalente sí cabría en GPUs de consumo de 16-24 GB en cuantizaciones de 8 o 4 bits tras la conversión.
- Opciones de despliegue: únicamente el entorno miles/Megatron Bridge con la configuración base de Qwen3-4B según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-math-to-ifeval-same-rr50-rolloutseed42 (este) | 4B | no disponible | Megatron `.distcp` | Apache 2.0 | Checkpoint de investigación con RL continuo Math -> IF reutilizando cabezas |
| Qwen/Qwen3-4B (base) | 4B | no disponible en la informacion proporcionada | safetensors (Transformers) | Apache 2.0 | Modelo base oficial, cargable con `from_pretrained` |
| zhezi12138/Qwen3-4B-math-to-ifeval-math-rr50-rolloutseed42 | 4B | no disponible | Megatron `.distcp` | Apache 2.0 | Checkpoint fuente de la fase de matemáticas (iteración 399) |
| zhezi12138/Qwen3-4B-math-to-ifeval-to-mbpp-math-rr25-rolloutseed42 | 4B | no disponible | Megatron `.distcp` | Apache 2.0 | Variante del mismo pipeline con otra secuencia de tareas y ratio de reutilización |

## Limitaciones y advertencias

- No es un modelo listo para producción: se distribuye como checkpoint distribuido de Megatron y no se puede cargar con `from_pretrained` de Transformers.
- No se guardó el estado del optimizador, por lo que no admite reanudación exacta del entrenamiento.
- Las puntuaciones de evaluación incluidas son del entrenamiento y no resultados de benchmarks held-out; no deben usarse como métricas de rendimiento final.
- El entrenamiento usó una plantilla de chat sin modo thinking, lo que puede limitar el comportamiento en escenarios que esperen razonamiento explícito.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática específica de este checkpoint.
- El repositorio no registra descargas ni likes, y el autor es un usuario individual; no hay validación externa de los resultados.
- La licencia Apache 2.0 permite uso comercial, pero el formato y la naturaleza experimental del artefacto hacen desaconsejable su uso directo en producción sin conversión y validación adicionales.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-same-rr50-rolloutseed42
- Checkpoint fuente de la fase de matemáticas: https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-math-rr50-rolloutseed42
- Variante Math -> IF -> MBPP: https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-to-mbpp-math-rr25-rolloutseed42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Registro W&B del experimento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/ugzr83xv

# zhezi12138/Qwen3-4B-math-to-ifeval-same-top50-rolloutseed42-20261108-cdhc5xi4

## Resumen

Qwen3-4B-math-to-ifeval-same-top50-rolloutseed42-20261108-cdhc5xi4 es un checkpoint de investigación publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de un experimento de continual learning (aprendizaje continuo) sobre el modelo base Qwen/Qwen3-4B, en el que se aplica entrenamiento por refuerzo (reinforcement learning) con la infraestructura miles/Megatron. El experimento concreto encadena dos tareas: primero matemáticas (Math) y después instruction following (IF), reutilizando exactamente los mismos bloques de cabezas de atención (top50) que se entrenaron en la tarea fuente.

La relevancia de este checkpoint es fundamentalmente metodológica: sirve para estudiar cómo se comporta el entrenamiento selectivo de subconjuntos de parámetros (el 50 % de los bloques de atención, junto con sus proyecciones de salida) cuando se cambia de tarea, manteniendo el resto de bloques congelados. El autor documenta la configuración exacta del entrenamiento (semilla 42, learning rate 3e-6, batch global 64, límite de respuesta de rollout 3072 tokens, tensor parallel 2), lo que lo convierte en material reproducible para investigación en RL y plasticidad de redes.

Es importante subrayar que el repositorio contiene el checkpoint distribuido original de Megatron (ocho shards `.distcp` por iteración), no un modelo compatible con `from_pretrained` de Transformers. Incluye las iteraciones 199, 399 y 599, y el tracker más reciente selecciona la 599 tras 600 actualizaciones de IF. No se guardó el estado del optimizador, por lo que no permite reanudar entrenamiento con estado exacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B), con entrenamiento selectivo de bloques de atención |
| Parametros totales | 4B (modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene pesos Megatron en formato distcp, no cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Megatron distributed checkpoint (`.distcp`, 8 shards por iteracion); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros. Sobre esa base, el autor aplica un esquema de continual learning con RL en el que solo se actualizan bloques concretos: el 50 % de las cabezas de atención (top50) y sus proyecciones de salida correspondientes, mientras el resto de bloques permanece congelado. La tarea fuente es matemáticas y la tarea destino es instruction following (IF), reutilizando exactamente los mismos bloques en ambas fases. La fuente declarada es el checkpoint `zhezi12138/Qwen3-4B-math-single-top50-rolloutseed42` en la revisión `74049adc01076d29bb551ab99fd01de17fc5e024`, iteración 399.

La configuración de entrenamiento documentada incluye: semilla 42, learning rate 3e-6, 16 prompts por paso con 4 muestras cada uno, batch global de 64, límite de respuesta de rollout de 3072 tokens, plantilla de chat sin modo thinking (nonthinking), tensor parallel de 2 y gradientes congelados puestos a cero antes del clipping. El entrenamiento de IF comprende 600 actualizaciones. La evaluación en entrenamiento usa el verificador `math` (no `dapo_math`). El repositorio incluye la máscara original, el protocolo de evaluación y el historial de evaluación parseado, además de `provenance.json` y `SHA256SUMS.json` para trazabilidad.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-4B.
- Razonamiento matemático, reforzado en la fase fuente del experimento.
- Instruction following, objetivo de la fase destino del entrenamiento continuo.
- Entrenamiento selectivo de subconjuntos de parámetros: capacidad metodológica para estudiar transferencia entre tareas.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas del repo figuran como no disponibles).

## Casos de uso

- Investigación en continual learning: el checkpoint permite analizar si los bloques de atención entrenados en matemáticas siguen siendo útiles al pasar a instruction following, comparando iteraciones 199, 399 y 599.
- Estudio de entrenamiento selectivo de parámetros: sirve para evaluar el impacto de congelar el 50 % de los bloques frente a entrenar el modelo completo, con la configuración exacta documentada (semilla, lr, batch).
- Reproducibilidad de experimentos RL: el repositorio incluye máscara, protocolo de evaluación, historial y hashes, lo que facilita replicar el pipeline miles/Megatron en un entorno controlado.
- Análisis de olvido catastrófico: al encadenar Math → IF sobre los mismos bloques, se puede medir la degradación en matemáticas tras el entrenamiento de IF.
- Base para ablaciones de plasticidad: comparar este checkpoint con las variantes `math-rr50` y `rr25` publicadas por el mismo autor para estudiar el efecto del porcentaje de cabezas entrenadas.
- Docencia y formación en RL a escala: el formato Megatron y la configuración detallada lo hacen útil como ejemplo práctico de pipeline de entrenamiento distribuido con tensor parallel 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las puntuaciones incluidas en el repositorio son evaluaciones en entrenamiento (in-training), no resultados sobre conjuntos de test reservados (held-out).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo no publica cuantizaciones y el formato distcp no es directamente cargable en frameworks de inferencia estándar.
- GPU recomendadas: el entrenamiento usó tensor parallel 2, lo que implica al menos 2 GPU para reproducir el pipeline miles/Megatron; no se especifica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no confirmada; un modelo de 4B en fp16 requiere aproximadamente 8 GB de VRAM, pero este checkpoint no está en un formato listo para inferencia directa.
- Opciones de despliegue: no disponibles para este checkpoint concreto; requiere el entorno miles/Megatron Bridge con la configuración base de Qwen3-4B. No es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversión previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-math-to-ifeval-same-top50 (este) | 4B | no disponible | Megatron distcp | apache-2.0 | Checkpoint de investigacion, no listo para inferencia |
| Qwen/Qwen3-4B (base) | 4B | no disponible | safetensors | apache-2.0 | Modelo publico listo para uso |
| zhezi12138/Qwen3-4B-math-to-ifeval-math-rr50-rolloutseed42 | 4B | no disponible | Megatron distcp | apache-2.0 | Variante del mismo autor |
| zhezi12138/Qwen3-4B-math-to-ifeval-to-mbpp-math-rr25-rolloutseed42 | 4B | no disponible | Megatron distcp | apache-2.0 | Variante del mismo autor |

## Limitaciones y advertencias

- No es un modelo listo para producción: el formato es un checkpoint distribuido de Megatron (`.distcp`) y no se carga con `from_pretrained` de Transformers.
- No se guardó el estado del optimizador, por lo que no es posible reanudar entrenamiento con estado exacto.
- Las métricas incluidas son evaluaciones en entrenamiento, no resultados sobre benchmarks reservados; no deben citarse como rendimiento de test.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Qwen3-4B.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; el entrenamiento de IF usó plantilla nonthinking, lo que puede limitar el comportamiento conversacional.
- Licencia apache-2.0, que permite uso comercial, pero el formato y la falta de validación externa desaconsejan su uso directo en producción.
- El repositorio ocupa 24,1 GB y contiene tres iteraciones; conviene verificar los hashes de `SHA256SUMS.json` antes de usar.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-same-top50-rolloutseed42-20261108-cdhc5xi4
- Checkpoint fuente: https://huggingface.co/zhezi12138/Qwen3-4B-math-single-top50-rolloutseed42
- W&B del experimento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/cdhc5xi4
- Variante math-rr50: https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-math-rr50-rolloutseed42
- Variante to-mbpp-math-rr25: https://huggingface.co/zhezi12138/Qwen3-4B-math-to-ifeval-to-mbpp-math-rr25-rolloutseed42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B

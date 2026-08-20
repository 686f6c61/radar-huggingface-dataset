# wangkaihang/internlm2-1_8b-reward

## Resumen

InternLM2-1.8B-Reward es un modelo de recompensa (reward model) desarrollado por el equipo de InternLM, publicado en el repositorio de HuggingFace por el usuario wangkaihang. Está entrenado sobre la base de InternLM2-Chat-1.8B-SFT y tiene como objetivo asignar una puntuación numérica a conversaciones o respuestas generadas por modelos de lenguaje, permitiendo evaluar su calidad, comparar candidatos y seleccionar el mejor resultado. Este tipo de modelo es un componente esencial en pipelines de RLHF (Reinforcement Learning from Human Feedback) y en técnicas como best-of-N sampling.

El modelo se ha entrenado con más de 2,4 millones de pares de preferencia, combinando anotaciones humanas y datos sintetizados por IA, cubriendo áreas como diálogo, escritura, poesía, resumen, código y matemáticas. Está disponible en tres tamaños (1.8B, 7B y 20B) para facilitar el estudio de las leyes de escalado en reward models. Soporta inglés y chino, y se ha utilizado en el proceso de RLHF de InternLM2-Chat. Su relevancia actual radica en que ofrece una alternativa ligera y eficiente para evaluar y alinear modelos generativos, con un rendimiento competitivo en RewardBench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.699.581.952 (1.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la documentación proporcionada, pero al estar basado en InternLM2-Chat-1.8B-SFT, se presume que utiliza una arquitectura transformer estándar con atención causal, adaptada para la tarea de clasificación de recompensa. El modelo se entrena con 2,4 millones de pares de preferencia, combinando anotaciones humanas y datos sintetizados por IA, con el objetivo de equilibrar utilidad (helpfulness) e inocuidad (harmlessness). Las técnicas de entrenamiento de reward models descritas en el informe técnico de InternLM2 (arXiv:2403.17297) se han liberado en el framework XTuner, lo que permite reproducir el proceso. No se especifican detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en esta fase.

## Capacidades

- Puntuación de recompensa para conversaciones individuales mediante el método `get_score`.
- Evaluación por lotes de múltiples conversaciones con `get_scores`.
- Comparación binaria entre dos chats para determinar cuál es mejor (`compare`).
- Ranking de múltiples candidatos, devolviendo el índice de orden según la puntuación (`rank`).
- Integración con best-of-N sampling para seleccionar la mejor respuesta generada por un LLM.
- Soporte multilingüe en inglés y chino, con datos de preferencia de alta calidad en ambos idiomas.
- Entrenado para equilibrar utilidad e inocuidad, cubriendo dominios como diálogo, escritura, poesía, resumen, código y matemáticas.

## Casos de uso

- Selección de respuestas en pipelines de RLHF: el modelo puede puntuar las respuestas generadas por un policy model y proporcionar la señal de recompensa necesaria para el entrenamiento con aprendizaje por refuerzo, sustituyendo o complementando la retroalimentación humana.
- Best-of-N sampling en producción: dado un prompt, se generan N respuestas candidatas con un LLM y el reward model selecciona la de mayor puntuación, mejorando la calidad final sin necesidad de aumentar el tamaño del modelo generativo.
- Evaluación automática de calidad de respuestas: permite medir objetivamente la calidad de salidas de chatbots o asistentes virtuales en inglés y chino, útil para monitorización y control de calidad en sistemas desplegados.
- Filtrado de datos para entrenamiento: puede utilizarse para filtrar grandes corpus de conversaciones, descartando aquellas con baja puntuación y mejorando la calidad de los datos de entrenamiento de futuros modelos.
- Comparación de versiones de modelos: al puntuar las respuestas de dos versiones de un mismo LLM ante los mismos prompts, se puede determinar cuál versión produce resultados más alineados con las preferencias humanas.
- Investigación sobre scaling laws de reward models: al estar disponible en tamaños de 1.8B, 7B y 20B, permite estudiar cómo varía el rendimiento de los reward models con el número de parámetros, aportando datos empíricos a la comunidad.

## Benchmarks y rendimiento

El modelo se evaluó en el dataset RewardBench, con los siguientes resultados comparados con sus versiones mayores:

| Modelo | Score | Chat | Chat Hard | Safety | Reasoning |
|---|---|---|---|---|---|
| InternLM2-20B-Reward | 89.5 | 98.6 | 74.1 | 89.4 | 95.7 |
| InternLM2-7B-Reward | 86.6 | 98.6 | 66.7 | 88.3 | 92.8 |
| InternLM2-1.8B-Reward | 80.6 | 95.0 | 58.1 | 81.8 | 87.4 |

La evaluación se realizó sin incluir los system prompts condicionales propuestos en el informe técnico, para garantizar una comparación justa. No se han publicado resultados en otros benchmarks adicionales en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 3.4 GB, lo que sugiere que los pesos en fp16 ocupan aproximadamente 3.4 GB. Con 1.8B parámetros, la inferencia en fp16 requiere al menos 4-6 GB de VRAM, dependiendo del tamaño del lote y la longitud de la secuencia.
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) sin problemas.
- Para despliegue en producción, se recomienda usar vLLM o TGI si se necesita alto throughput, aunque el modelo requiere `trust_remote_code=True` al cargarlo con transformers.
- También es posible ejecutarlo en CPU con cuantización, aunque no se han publicado cuantizaciones oficiales (GGUF, etc.) en la información disponible.
- La latencia y el throughput estimados no se han publicado; dependerán del hardware y de la longitud de las conversaciones evaluadas.

## Comparativa con modelos similares

La comparativa más directa es con las versiones mayores del mismo modelo, ya que comparten arquitectura y metodología de entrenamiento:

| Modelo | Parametros | Contexto | RewardBench Score | Licencia |
|---|---|---|---|---|
| InternLM2-1.8B-Reward | 1.8B | no disponible | 80.6 | other |
| InternLM2-7B-Reward | 7B | no disponible | 86.6 | other |
| InternLM2-20B-Reward | 20B | no disponible | 89.5 | other |

No se dispone de información sobre otros reward models comparables de la misma categoría (por ejemplo, OpenAssistant Reward Model o modelos de la familia Llama) en la documentación proporcionada, por lo que la comparativa se limita a la familia InternLM2.

## Limitaciones y advertencias

- El modelo está entrenado principalmente con datos en inglés y chino; su rendimiento en otros idiomas puede ser significativamente inferior.
- Al ser un reward model, no genera texto, pero sus puntuaciones pueden presentar sesgos derivados de los datos de preferencia utilizados, especialmente en dominios poco representados.
- La licencia "other" requiere revisar los términos específicos de uso, especialmente para aplicaciones comerciales.
- El modelo depende de `trust_remote_code=True` para cargarse con transformers, lo que implica ejecutar código personalizado del autor; se recomienda auditar el código antes de usarlo en entornos de producción.
- No se especifica la longitud máxima de contexto soportada, por lo que conversaciones muy largas podrían degradar el rendimiento o fallar.
- No se han publicado cuantizaciones oficiales, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wangkaihang/internlm2-1_8b-reward
- Repositorio GitHub de InternLM: https://github.com/InternLM/InternLM
- Informe técnico (arXiv): https://arxiv.org/abs/2403.17297
- Framework XTuner: https://github.com/InternLM/xtuner
- Dataset RewardBench: https://github.com/allenai/reward-bench

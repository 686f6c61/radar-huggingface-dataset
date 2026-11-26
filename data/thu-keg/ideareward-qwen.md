# THU-KEG/IdeaReward-Qwen

## Resumen

IdeaReward-Qwen es un modelo de recompensa (reward model) de 8B parámetros desarrollado por THU-KEG (grupo de investigación de la Universidad de Tsinghua) para evaluar la calidad de ideas de investigación generadas por modelos de lenguaje. Se entrena a partir de Qwen3-8B mediante el framework OpenRLHF y devuelve una puntuación escalar única por secuencia de entrada, lo que permite usarlo como señal de preferencia en pipelines de RLHF o como filtro automático de propuestas científicas.

El modelo acompaña al artículo «IdeaReward: Benchmarking and Training Reward Models for Research Idea Generation» y se distribuye junto con los conjuntos de datos IdeaRewardTrain e IdeaRewardBench. Su relevancia actual radica en que aborda un problema poco cubierto por los reward models generalistas: la evaluación de propuestas de investigación, una tarea con criterios difusos (novedad, viabilidad, rigor metodológico) que los modelos de recompensa entrenados con preferencias genéricas no capturan bien.

Se publica bajo licencia Apache 2.0, con pesos en safetensors (15,1 GB de repositorio) y una arquitectura de reward model de OpenRLHF con cabeza `score`. El modelo no está pensado para generación de texto libre, sino como componente de puntuación dentro de sistemas de selección, ranking o entrenamiento por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de regresión escalar (`score`), implementada en OpenRLHF (`get_llm_for_sequence_regression`, `model_type="reward"`) |
| Parametros totales | 7.568.409.600 (7,57 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B, sin confirmar) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors; no se publican GGUF ni AWQ) |
| Idiomas soportados | No disponible (el modelo base Qwen3-8B es multilingue, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Libreria | openrlhf |
| Tamano del repositorio | 15,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

IdeaReward-Qwen reutiliza el backbone de Qwen3-8B, un transformer decoder-only denso de 7,57 mil millones de parámetros, al que se le sustituye la cabeza de lenguaje por una cabeza de regresión escalar (`score`). El modelo se carga mediante la API de OpenRLHF para regresión de secuencias, lo que lo hace directamente compatible con los pipelines de entrenamiento por refuerzo de esa librería. El repositorio incluye la plantilla de chat del tokenizer, de modo que las entradas deben formatearse con dicha plantilla antes de la puntuación.

El entrenamiento se realiza sobre el conjunto de datos de preferencias IdeaReward, construido específicamente para comparar pares de ideas de investigación. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO más allá del ajuste como reward model. Tampoco se especifican innovaciones arquitectónicas propias: la contribución principal es el dataset de preferencias y el procedimiento de entrenamiento descritos en el artículo asociado, no una modificación del backbone.

## Capacidades

- Puntuación de ideas de investigación: devuelve un reward escalar por secuencia, pensado para ordenar o filtrar propuestas científicas según preferencias aprendidas.
- Integración con RLHF: compatible con OpenRLHF como reward model en pipelines de PPO u otros algoritmos de optimización por refuerzo.
- Ranking de candidatos: permite comparar múltiples ideas generadas por un LLM y seleccionar las mejor valoradas.
- Formateo conversacional: incluye plantilla de chat del tokenizer para estructurar las entradas.
- No es un modelo generativo: no produce texto, solo una puntuación; no debe usarse para generación, código ni matemáticas.
- Capacidades multilingües: no declaradas en la model card; dependen del modelo base y no están verificadas para esta tarea.
- Tool calling, agentes y visión: no disponibles en este modelo.

## Casos de uso

- Selección de ideas en pipelines de generación científica: dado un lote de propuestas generadas por un LLM, puntuar cada una con IdeaReward-Qwen y conservar las de mayor reward antes de una revisión humana, reduciendo el coste de filtrado manual.
- Entrenamiento por refuerzo de generadores de ideas: usar el modelo como función de recompensa en OpenRLHF para ajustar un LLM generador hacia propuestas mejor valoradas por el criterio aprendido.
- Benchmarking interno de modelos generativos: comparar la distribución de rewards de distintos LLM sobre el mismo conjunto de prompts para estimar qué modelo produce ideas mejor puntuadas.
- Filtrado previo en revisiones académicas asistidas: priorizar borradores de propuestas o abstracts antes de asignar revisores humanos, siempre como señal de apoyo y no como juicio final.
- Investigación sobre reward models: servir de línea base reproducible para estudiar sesgos y calibración de reward models en dominios científicos, junto con IdeaRewardBench.
- Construcción de datasets de preferencias: usar las puntuaciones para muestrear pares con alta y baja recompensa y ampliar datos de entrenamiento de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo y al dataset IdeaRewardBench para la evaluación, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 15 GB solo para pesos, más overhead de activaciones; se recomienda al menos 20-24 GB para inferencia por secuencias.
- VRAM en cuantización de 8 bits: aproximadamente 8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y baja latencia; RTX 4090 (24 GB) viable en bf16 con secuencias moderadas.
- GPU de consumo: cabe en RTX 4090 y, con cuantización, en GPUs de 8-12 GB, aunque la cuantización no está soportada oficialmente por el repositorio.
- Despliegue: OpenRLHF (`get_llm_for_sequence_regression`) es la vía documentada; al ser un transformer estándar con cabeza de regresión, puede servirse con vLLM o TGI solo si se adapta la cabeza, y con llama.cpp únicamente tras conversión manual a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IdeaReward-Qwen | 7,57 B | No disponible | Reward model para ideas de investigación | Apache 2.0 | Hugging Face (THU-KEG) |
| Qwen3-8B (base) | 8,2 B aprox. | No disponible en esta ficha | Generación general | Apache 2.0 | Hugging Face (Qwen) |
| Reward models generalistas (p. ej. ArmoRM, Skywork-Reward) | 7-8 B tipico | Variable | Preferencias generales | Variable | Hugging Face |

La comparación directa con otros reward models especializados en ciencia no está disponible en la información proporcionada; IdeaReward-Qwen se distingue por su dominio de aplicación (generación de ideas) más que por tamaño o contexto.

## Limitaciones y advertencias

- Las puntuaciones son señales de apoyo a la decisión, no juicios autoritativos sobre el valor de una idea; la model card lo advierte explícitamente.
- Riesgo de sesgo hacia los criterios de preferencia del dataset IdeaReward, que pueden no reflejar la diversidad de disciplinas científicas.
- Posible sobreajuste a estilos de redacción concretos (por ejemplo, propuestas con jerga metodológica), penalizando ideas válidas pero heterodoxas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente: rewards altos no garantizan calidad real.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está verificado.
- Contexto máximo no especificado en la model card; debe consultarse el del modelo base Qwen3-8B antes de usarlo con entradas largas.
- Sin pesos cuantizados oficiales ni integración documentada con servidores de inferencia estándar (vLLM, TGI); requiere OpenRLHF o adaptación manual.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre decisiones tomadas a partir de las puntuaciones recae en el usuario.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación externa aún muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THU-KEG/IdeaReward-Qwen
- Artículo (OpenReview): https://openreview.net/forum?id=KL3GMYps6X
- Dataset de entrenamiento: https://huggingface.co/datasets/THU-KEG/IdeaRewardTrain
- Dataset de evaluación: https://huggingface.co/datasets/THU-KEG/IdeaRewardBench
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- OpenRLHF: https://github.com/OpenRLHF/OpenRLHF

# Stage-org/4b-wo-filtering-30-27b-z-epoch3

# Stage-org/4b-wo-filtering-30-27b-z-epoch3

## Resumen

Stage-org/4b-wo-filtering-30-27b-z-epoch3 es un checkpoint de 4.539.265.536 parámetros (4,54 B) publicado en Hugging Face por la organización Stage-org. Según la configuración de entrenamiento incluida en su model card, el modelo parte de Qwen/Qwen3.5-4B y corresponde a un run de aprendizaje por refuerzo (RL) ejecutado sobre el dataset Stage-org/4b-wo-filtering-30-27b-z, del que este repositorio representa el tercer epoch. El repositorio ocupa 9,1 GB y contiene únicamente pesos en safetensors; no declara licencia, idiomas soportados ni pipeline de inferencia.

No se trata de un lanzamiento de producto, sino de un artefacto de investigación: la model card se limita al bloque de procedencia del entrenamiento (comando de entrenamiento y fichero TOML de configuración), y el repositorio acumula 0 descargas y 0 likes a fecha de consulta. Su interés técnico está en que documenta un pipeline completo de RL con juez externo (gpt-5.6-luna vía API), con soporte declarado de modo de razonamiento (enable_thinking) y de llamada a herramientas mediante los parsers qwen3 y qwen3_coder sobre vLLM.

Por tamaño, es un modelo que cabe en GPU de consumo con cuantización de 8 o 4 bits y que en bf16 ocupa aproximadamente 8,5 GiB solo en pesos, lo que lo sitúa en el rango de una única GPU de 16-24 GB para inferencia con contexto moderado. Cualquier uso en producción exige, no obstante, verificar la licencia (no declarada) y evaluar el checkpoint por cuenta propia, ya que no hay benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.5, tag `qwen3_5`); detalles de capas y atención no disponibles |
| Parámetros totales | 4.539.265.536 (4,54 B), dato real de los safetensors |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No declarada en la model card. La configuración de entrenamiento fija `max_model_len = 65.536` para inferencia con vLLM y `seq_len = 300.000` para las muestras de entrenamiento |
| Tipos de cuantización | No publicados. Solo hay pesos en safetensors en precisión completa (~2 bytes/parámetro, compatible con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B (indicado en `learner.model` de la configuración) |
| Dataset de entrenamiento | Stage-org/4b-wo-filtering-30-27b-z (`type = "new_task"`, split `train`) |
| Tamaño del repositorio | 9,1 GB |
| Fecha de creación | 2026-09-23 |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna más allá del tag `qwen3_5` y del modelo base declarado, Qwen/Qwen3.5-4B. Se trata por tanto de un transformer decoder denso de ~4,5 B de parámetros, sin datos disponibles sobre número de capas, cabezas de atención, uso de GQA, vocabulario o si el base incorpora componentes multimodales (la configuración de inferencia activa `language_model_only = true`, es decir, se sirve únicamente la torre de lenguaje).

El entrenamiento es un proceso de RL con 10.000 pasos de learner y 3 epochs, batch size de 128 y `seq_len` declarado de 300.000 tokens, ejecutado en nodos de 2 GPU (1 GPU de inferencia y 1 de entrenamiento, con `weight_broadcast_type = "filesystem"`). El optimizador es AdamW con learning rate 1e-6, weight decay 0, grad clipping `max_norm = 1.0` y betas (0,9; 0,99). La función de pérdida es de tipo `default` con enmascarado DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`, sobre 8 rollouts por grupo (`group_size = 8`) y hasta 256 rollouts en vuelo con un máximo de 8 pasos off-policy. La generación durante el entrenamiento usa temperatura 0,9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La recompensa en preguntas abiertas proviene de un juez externo servido por API (`gpt-5.6-luna`, `reasoning_effort = "medium"`, hasta 32 peticiones concurrentes y 3 reintentos con backoff de 1 s). La inferencia del pipeline emplea vLLM con FlashAttention 2, `gpu_memory_utilization = 0.9`, `max_model_len = 65.536`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`. No hay información sobre la composición del dataset ni sobre filtrado de datos, más allá de la etiqueta `wo-filtering` del nombre del run; tampoco se documenta si hubo fases previas de SFT.

## Capacidades

- Generación de texto y razonamiento en modo "thinking": la configuración de entrenamiento activa `enable_thinking = true` y el pipeline de inferencia declara `reasoning_parser = "qwen3"`, por lo que el modelo está preparado para emitir trazas de razonamiento separadas de la respuesta final.
- Llamada a herramientas (tool calling / function calling): el parser declarado es `qwen3_coder`, lo que implica que el formato de tool calls sigue la convención de la familia Qwen para código.
- Uso en agentes multi-paso: el orquestador del entrenamiento contempla hasta 256 rollouts en vuelo y 8 pasos off-policy, un escenario típico de tareas multi-turno y multi-herramienta.
- Generación de código: derivada del modelo base y del parser de tool calls empleado; no hay evaluación publicada que lo cuantifique.
- Ventana de contexto amplia en inferencia: la configuración fija 65.536 tokens (`max_model_len`), suficiente para documentos largos o historiales de conversación extensos.
- Capacidades multimodales: no disponibles; la inferencia se restringe al modelo de lenguaje (`language_model_only = true`).
- Capacidades multilingües: no disponibles (no se declara ninguna lista de idiomas).
- Capacidades especiales (audio, visión, decodificación especulativa): no disponibles en la información proporcionada.

## Casos de uso

- Agentes con herramientas en producción: el modelo puede integrarse en un bucle de agente que consulte APIs o bases de datos, aprovechando el soporte de tool calling (`qwen3_coder`) y la ventana de 65.536 tokens para mantener el historial de acciones y observaciones sin truncar.
- Asistentes con razonamiento explícito: en tareas de análisis, planificación o depuración, el modo `enable_thinking` permite separar la cadena de razonamiento de la respuesta final y auditar el proceso, útil en dominios donde se exige trazabilidad.
- Procesamiento de documentación técnica extensa: con 65.536 tokens de contexto puede resumir, extraer entidades o responder preguntas sobre contratos, informes o bases de código de varios miles de líneas en una sola pasada.
- Automatización de tareas de código en CI/CD: generación de parches, revisión de diffs o escritura de tests, invocando herramientas del pipeline (ejecutar tests, consultar el repositorio) mediante function calling.
- Base para experimentos de RL y post-entrenamiento: el repositorio documenta el TOML completo del run, lo que lo convierte en material útil para reproducir o comparar pipelines de RL con juez externo sobre un modelo de 4,5 B.
- Evaluación de jueces automáticos: al haberse optimizado contra un juez servido por API, resulta un caso de estudio para medir hasta qué punto un modelo pequeño se ajusta al criterio de un juez propietario y detectar reward hacking.
- Despliegue local en estación de trabajo: con cuantización INT4 o INT8 cabe en GPU de consumo, lo que permite prototipar asistentes con datos que no pueden salir de la máquina.
- Generación de datos sintéticos: puede emplearse como generador de trayectorias con tool calls para alimentar posteriores fases de SFT o RL, siempre que la licencia lo permita (actualmente sin declarar).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no ofrece comparaciones con el modelo base Qwen/Qwen3.5-4B.

## Requisitos de hardware

- VRAM para pesos en bf16/fp16: 9,08 GB (~8,5 GiB) solo para los 4.539.265.536 parámetros. Con caché KV y overhead del runtime, se recomienda un mínimo de 12-16 GB para contexto corto y 24 GB para contexto largo o lotes concurrentes.
- VRAM con cuantización INT8: aproximadamente 4,5-5,5 GB de pesos, más caché KV; viable en GPUs de 8-12 GB.
- VRAM con cuantización INT4: aproximadamente 2,5-3,5 GB de pesos; viable en GPUs de 6-8 GB, con la salvedad de que no hay cuantizaciones publicadas y habría que generarlas.
- GPU recomendadas para servir en bf16: RTX 3090, RTX 4090, RTX 4080 (16 GB), A4000/A5000, L40S; para contexto completo de 65.536 tokens con concurrencia, A100 40/80 GB o H100.
- GPU de consumo: sí cabe, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti o superiores, siempre en INT8/INT4 o en bf16 con contexto reducido.
- Opciones de despliegue: vLLM es la ruta validada por el propio pipeline de entrenamiento (`reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`, `gpu_memory_utilization = 0.9`). Alternativas razonables son SGLang y TGI. llama.cpp, Ollama o LM Studio requieren convertir los safetensors a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones y dependen fuertemente de la GPU, la cuantización y la longitud de contexto.
- Nota de entrenamiento: el run se ejecutó en nodos de 2 GPU (1 para inferencia con vLLM y 1 para entrenamiento), con checkpoints de solo pesos (`weights_only = true`) cada 1.000 unidades según la configuración.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones de modelos alternativos, por lo que la comparación cuantitativa no puede completarse. Se identifican los siguientes candidatos de la misma categoría (modelos densos de ~3-5 B, uso general y orientados a agentes), pero sus datos no están disponibles en el material de partida:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-wo-filtering-30-27b-z-epoch3 | 4.539.265.536 (4,54 B) | 65.536 en la config de inferencia (no declarado en la model card) | No disponible | Safetensors en Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | No disponible | No disponible | No disponible | Hugging Face |
| Qwen3-4B | No disponible | No disponible | No disponible | Hugging Face |
| Llama 3.2 3B | No disponible | No disponible | No disponible | Hugging Face |
| Gemma 3 4B | No disponible | No disponible | No disponible | Hugging Face |

Sin benchmarks publicados de este checkpoint ni de su modelo base, no es posible afirmar superioridad o inferioridad frente a ninguna de estas alternativas. La única diferencia verificable es el proceso de post-entrenamiento por RL con juez externo, que los modelos citados no documentan en estos términos.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso, por lo que el uso comercial es jurídicamente indeterminado y no debería asumirse permitido.
- Cero adopción verificable: 0 descargas y 0 likes, sin validación externa ni informes de terceros.
- Artefacto experimental: se etiqueta como `attempt-0001` y `epoch3` de un run concreto, sin garantía de estabilidad ni de calidad tras el ajuste por RL.
- Sin benchmarks ni evaluación publicada: cualquier afirmación sobre su rendimiento en razonamiento, código o matemáticas carece de respaldo.
- Sesgo inducido por el juez: la recompensa en preguntas abiertas proviene de un juez propietario servido por API (`gpt-5.6-luna`), lo que puede sesgar el estilo y las respuestas hacia el criterio de ese modelo y favorecer comportamientos de reward hacking.
- Riesgo de alucinación: no se documentan datos de entrenamiento, filtrado ni mitigaciones anti-alucinación; el nombre del run (`wo-filtering`) sugiere además ausencia de filtrado en los datos.
- Configuración inconsistente o ambigua: `seq_len = 300.000` frente a `max_model_len = 65.536`, y `checkpoint.interval = 1000` con `interval_unit = "epoch"`, valores que no se explican en la model card y que conviene tratar con cautela.
- Idiomas no documentados: no hay lista de idiomas soportados, por lo que el comportamiento fuera del inglés (y posiblemente del chino, dada la familia del modelo base) es desconocido.
- Sin cuantizaciones publicadas: desplegar en INT8/INT4 exige generar los pesos cuantizados por cuenta propia, con el riesgo de degradación asociado.
- Dependencia del modelo base: al derivar de Qwen/Qwen3.5-4B, hereda las limitaciones y los términos de licencia del modelo original, que tampoco se detallan aquí.
- La búsqueda web realizada no devolvió ninguna fuente técnica relevante sobre el modelo: los resultados obtenidos correspondían a portales de ofertas de prácticas y no guardan relación con este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stage-org/4b-wo-filtering-30-27b-z-epoch3
- Dataset de entrenamiento: https://huggingface.co/datasets/Stage-org/4b-wo-filtering-30-27b-z
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización: https://huggingface.co/Stage-org
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.

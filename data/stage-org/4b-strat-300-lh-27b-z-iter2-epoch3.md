# Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3

## Resumen

`Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3` es un modelo de lenguaje de 4.539.265.536 parametros (4,54 B) publicado por la organizacion Stage-org en HuggingFace. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo `Stage-org/appworld-4b-diversity-LH-300-nyshot-27b-z-epoch3-agent-rl-epoch2`, que a su vez procede de la familia Qwen (la etiqueta del repositorio es `qwen3_5`) y esta orientado a tareas de agente con uso de herramientas. El nombre del repositorio indica la segunda iteracion (`iter2`) del entrenamiento y la tercera epoca (`epoch3`).

El interes tecnico del modelo esta en su procedimiento de entrenamiento, documentado en la propia model card: RL con generacion en linea, juez automatico basado en un modelo externo (`gpt-5.6-luna`) y una funcion de perdida con parametros de tipo DPPO (`dppo_mask_low` = 0,2, `dppo_mask_high` = 0,28, `adv_tau` = 1,0, `kl_tau` = 0,001). Esto lo situa en la linea de modelos pequenos especializados en razonamiento multi-paso y llamadas a herramientas, mas que en la de modelos generalistas.

Ahora bien, la ficha publica es extremadamente escasa: no declara licencia, idiomas, pipeline, ni resultados de benchmarks, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Por tanto, cualquier evaluacion de su calidad real requiere validacion independiente; los datos que siguen proceden de los metadatos de HuggingFace y de la configuracion de entrenamiento incluida en el README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. La etiqueta del repositorio (`qwen3_5`) apunta a la familia Qwen3.5; el tag de peso `safetensors` y el uso de `language_model_only` en inferencia son compatibles con un transformer decoder-only |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica / no disponible: no se indica arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No declarada en la model card. La configuracion de inferencia del bucle de RL fija `max_model_len` = 65.536 tokens, por lo que el modelo opera al menos a esa longitud |
| Tipos de cuantizacion | No disponible. Solo hay pesos `safetensors`; el tamano del repositorio (9,1 GB para 4,54 B parametros, ~2 bytes por parametro) es coherente con bf16/fp16. No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | No disponible |
| Dataset de entrenamiento | `Stage-org/4b-strat-300-LH-27b-z-iter2` |
| Modelo base | `Stage-org/appworld-4b-diversity-LH-300-nyshot-27b-z-epoch3-agent-rl-epoch2` |
| Fecha de publicacion | 22 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna (numero de capas, cabezas de atencion, tipo de atencion ni vocabulario). Lo unico deducible es que se trata de un modelo de la familia Qwen3.5 con 4,54 B de parametros, pesos en safetensors y ejecucion en vLLM con la bandera `language_model_only = true`, es decir, sin torre de vision activa durante el entrenamiento. La atencion se implementa con FlashAttention 2 (`attn = "flash_attention_2"`).

El entrenamiento es un proceso de RL con 10.000 pasos de learner, 3 epocas, tamano de lote 128 y longitud de secuencia de 300.000 tokens, ejecutado sobre 2 GPU por nodo (1 dedicada a inferencia y 1 a entrenamiento), con semilla 7. El optimizador es AdamW con `lr = 1e-6`, `weight_decay = 0`, `max_norm = 1.0` y betas (0,9; 0,99). La funcion de perdida es de tipo `default` con enmascarado DPPO (`dppo_mask_low` = 0,2, `dppo_mask_high` = 0,28), `adv_tau` = 1,0 y `kl_tau` = 0,001, lo que indica un esquema de optimizacion tipo GRPO/DPPO con anclaje KL laxo respecto al modelo de referencia y `group_size` = 8 (ocho generaciones por prompt). El orquestador admite hasta 256 rollouts en vuelo y 8 pasos fuera de politica (`max_off_policy_steps`).

Los rollouts se generan con temperatura 0,9, `top_p` = 1,0, `max_tokens` = 4096 y modo de pensamiento activado (`enable_thinking = true`). La recompensa la asigna un juez automatico de extremo abierto servido por un endpoint externo con el modelo `gpt-5.6-luna` (temperatura 1,0, `reasoning_effort` = "medium", hasta 32 peticiones concurrentes y 3 reintentos). En inferencia se emplean los parsers `qwen3` (razonamiento) y `qwen3_coder` (llamada a herramientas), con `gpu_memory_utilization` = 0,9 y un servidor en el puerto 7001. No se documenta el dataset de prompts, el volumen de datos, ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generacion de texto autoregresiva en modo decoder-only, con modo de razonamiento explícito (`enable_thinking = true` en la configuracion de generacion).
- Razonamiento multi-paso: el entrenamiento por RL con juez de extremo abierto y el modo de pensamiento apuntan a tareas que requieren cadenas de decisiones largas.
- Llamada a herramientas / function calling: la configuracion de vLLM especifica `tool_call_parser = "qwen3_coder"`, lo que indica que el modelo emite llamadas a funciones en un formato estructurado parseable.
- Uso como agente: el modelo base pertenece a la serie `appworld`, un entorno de referencia de tareas de agente, lo que sugiere entrenamiento orientado a interaccion con entornos y APIs.
- Capacidad multilingue: no disponible (la model card no declara idiomas).
- Vision: no soportada segun la configuracion de entrenamiento (`language_model_only = true`).
- Audio: no disponible / sin indicios.
- Contexto largo: el bucle de inferencia opera con 65.536 tokens de ventana maxima, adecuado para historiales de conversacion o trazas de agente extensas.
- Generacion con muestreo configurable (temperatura, `top_p`, `max_tokens`) y hasta 4.096 tokens por respuesta en la fase de RL.

## Casos de uso

- Agentes de automatizacion de tareas ofimaticas o de back-office: el modelo puede leer un objetivo, invocar herramientas (APIs, busqueda, escritura de ficheros) y encadenar varios pasos gracias al parser de function calling y a los 65.536 tokens de contexto, suficiente para mantener el historial completo de la tarea.
- Asistentes de codigo integrados en IDE: con el parser `qwen3_coder` puede emitir llamadas a herramientas de edicion, ejecucion de tests y consulta de repositorio, y su tamano de 4,54 B permite desplegarlo en una unica GPU para baja latencia interactiva.
- Enrutamiento y orquestacion de pipelines de agentes: por su tamano reducido es viable usarlo como modelo planificador que decide que herramienta o subagente invocar antes de delegar en un modelo mayor, reduciendo coste por peticion.
- Extraccion estructurada de informacion de documentos largos: con 65.536 tokens de contexto puede procesar contratos, informes o expedientes completos y devolver JSON validado mediante salida con esquema.
- Simulacion y evaluacion de entornos de agente: util como "aprendiz" o baseline en bucles de RL y evaluaciones tipo AppWorld, dado que su configuracion de entrenamiento esta pensada para ese marco.
- Chat de soporte tecnico con uso de herramientas internas: gestiona conversaciones multi-turno y consulta bases de conocimiento o sistemas de tickets mediante llamadas a funcion, aunque el idioma de servicio debe validarse porque no se declaran idiomas soportados.
- Generacion asistida en tareas de matematicas y razonamiento encadenado: el modo de pensamiento y el RL con juez de razonamiento favorecen respuestas con pasos intermedios, aprovechables en tutoria o verificacion de cálculos.
- Prototipado en investigacion: al ser un artefacto derivado de un pipeline de RL reproducible (configuracion completa en la model card), sirve para estudiar el efecto de DPPO y del enmascarado de politicas en modelos de ~4 B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ni metricas de tareas de agente, y tampoco se aportan curvas de recompensa del juez durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros; no confirmada por el autor): en bf16/fp16 los pesos ocupan aproximadamente 9,1 GB, por lo que se necesitan del orden de 11-14 GB de VRAM contando overhead de runtime y cache KV para contextos cortos. En cuantizacion de 8 bits, unos 5-6 GB de pesos; en 4 bits, unos 3 GB. Estas cifras no incluyen el cache KV, que con 65.536 tokens de contexto puede ser el factor dominante y cuyo tamano exacto no es calculable sin conocer el numero de capas y cabezas KV.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servir el contexto completo de 65.536 tokens con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con contexto moderado o para servir en 4/8 bits.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas de 24 GB (RTX 3090, 4090) en bf16 con contexto reducido y en tarjetas de 12-16 GB (RTX 4070 Ti, 4080) si se cuantiza. En 8 GB solo es viable con cuantizacion agresiva y contexto corto, no disponible en el repositorio.
- Opciones de despliegue: vLLM es la via documentada (usada en el propio entrenamiento, con `gpu_memory_utilization` = 0,9 y `max_model_len` = 65.536). TGI y SGLang son compatibles con pesos safetensors de arquitecturas Qwen, pero no estan verificados para este checkpoint. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se publica.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo, TTFT ni resultados de carga concurrente.
- Nota de despliegue: el entrenamiento se realizo con 2 GPU por nodo (1 de inferencia, 1 de entrenamiento), lo que indica que el checkpoint se diseno para ejecutarse en una unica GPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a parametros, contexto declarado y licencia. Los datos de los modelos alternativos son de referencia publica general y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3 | 4,54 B | No declarado; 65.536 tokens en la config de RL | No disponible | No disponible |
| Qwen3-4B (referencia de la misma familia) | ~4,0 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | Datos publicos del autor; no comparables directamente |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License (con restricciones para usuarios de la UE en multimodal, no en texto) | Datos publicos del autor |
| Gemma 3 4B IT | ~4 B | 128.000 tokens | Gemma Terms of Use | Datos publicos del autor |

Diferencias relevantes: frente a estos modelos, el modelo de Stage-org no declara licencia ni idiomas, carece de benchmarks publicados y no ofrece versiones cuantizadas, lo que dificulta su adopcion en produccion. Su caracteristica diferencial es el entrenamiento por RL con juez externo y su orientacion explicita a agentes con tool calling.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Debe contactarse con el autor o consultarse el repositorio antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks y de evaluaciones independientes: 0 descargas y 0 likes en el momento de la consulta, sin validacion por terceros.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma distinto del ingles.
- Riesgo de alucinacion: inherente a los modelos de ~4 B y potencialmente acentuado por el entrenamiento por RL con juez externo, que puede optimizar hacia el estilo de respuesta premiado por el juez mas que hacia la veracidad.
- Dependencia del juez en el entrenamiento: la senal de recompensa proviene de `gpt-5.6-luna`, un modelo externo. Los sesgos y el formato preferido por ese juez pueden haberse transferido al modelo entrenado.
- Deriva de dominio: al tratarse de un ajuste por RL sobre tareas de agente, es probable que el modelo rinda peor que su base en conversacion general, creatividad o conocimiento factual amplio. No hay datos que lo confirmen o desmientan.
- Cache KV con contexto largo: operar a 65.536 tokens exige planificacion de memoria; no se publican estimaciones del coste real.
- Nomenclatura interna: los sufijos `strat-300-LH-27b-z` y `iter2-epoch3` sugieren un artefacto de investigacion dentro de una campana de experimentos, no una release estable con garantias de mantenimiento.
- Formato unico: solo pesos safetensors, sin GGUF ni cuantizaciones listas para usar, lo que excluye despliegues directos en llama.cpp, Ollama o LM Studio sin conversion previa.
- Sin informacion sobre datos de entrenamiento, sesgos ni composicion del dataset de prompts, por lo que no es posible auditar sesgos conocidos.
- Fecha de publicacion futura respecto a la fecha de consulta en los metadatos (22 de septiembre de 2026): conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-strat-300-LH-27b-z-iter2-epoch3
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/datasets/Stage-org/4b-strat-300-LH-27b-z-iter2
- Modelo base referenciado en la model card: https://huggingface.co/Stage-org/appworld-4b-diversity-LH-300-nyshot-27b-z-epoch3-agent-rl-epoch2
- Paper, blog tecnico, repositorio de codigo o demo: no disponible en la informacion proporcionada

# Stage-org/4b-diversity-LL-300-nyshot-27b-z-epoch3

## Resumen

`Stage-org/4b-diversity-LL-300-nyshot-27b-z-epoch3` es un checkpoint de un modelo de lenguaje de aproximadamente 4.500 millones de parametros (4.539.265.536 segun los pesos en safetensors), publicado en HuggingFace por la organizacion Stage-org el 20 de septiembre de 2026. Se trata de un ajuste derivado de `Qwen/Qwen3.5-4B` mediante aprendizaje por refuerzo (metodo declarado como `rl` con `learner_steps = 10000` y `learner_epoch = 3`), tal y como se documenta en la propia model card generada automaticamente por el flujo de entrenamiento (`jh-workflow-training`).

El modelo se presenta como un artefacto de investigacion mas que como un producto final: no tiene pipeline declarado, no declara licencia, no declara idiomas y acumula cero descargas y cero "likes" en el momento de redactar esta ficha. La informacion disponible se limita a la configuracion de entrenamiento y a los metadatos del repositorio, por lo que muchos apartados de esta ficha quedan marcados como "no disponible".

Por su relevancia actual, destaca como ejemplo de experimento de RL sobre un modelo denso de ~4B con ventana de entrenamiento declarada de 300.000 tokens, generacion con modo thinking activado y parsers especificos para razonamiento (`qwen3`) y tool calling (`qwen3_coder`). Es util para quien quiera estudiar pipelines de RL, pero no esta respaldado por benchmarks publicos ni por una licencia clara de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `qwen3_5`, etiqueta declarada en el repo) |
| Parametros totales | 4.539.265.536 (~4,5B) |
| Parametros activos | no aplica (arquitectura densa, sin configuracion MoE declarada) |
| Longitud de contexto | 300.000 tokens en entrenamiento (campo `seq_len`); 65.536 tokens en inferencia (campo `max_model_len` en vLLM) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican pesos GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de ~4,5B parametros, y se somete a un ciclo de aprendizaje por refuerzo. La configuracion declarada usa `flash_attention_2`, optimizador AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `betas1 = 0.9`, `betas2 = 0.99` y `max_norm = 1.0`. El entrenamiento se ejecuta con `batch_size = 128`, `seq_len = 300000`, `learner_steps = 10000` y `learner_epoch = 3`, con un `group_size = 8` en la fase de RL (esquema compatible con metodos tipo GRPO). La perdida incluye parametros `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`.

La generacion durante el entrenamiento se realiza con `temperature = 0.9`, `max_tokens = 4096`, `top_p = 1.0` y `enable_thinking = true`. La evaluacion de respuestas abiertas se delega a un juez externo identificado como `gpt-5.6-luna` (con `temperature = 1.0`, `reasoning_effort = "medium"`, `max_retries = 3`). El bucle de inferencia usa vLLM con `gpu_memory_utilization = 0.9`, `max_model_len = 65536`, `language_model_only = true`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`. No se detalla la composicion del dataset de entrenamiento mas alla de la referencia `Stage-org/4b-diversity-LL-300-nyshot-27b`.

## Capacidades

- Generacion de texto autoregresiva sobre un modelo base de ~4,5B parametros.
- Modo de razonamiento explicito (`enable_thinking = true`) heredado del parser `qwen3`.
- Soporte de tool calling / function calling mediante el parser `qwen3_coder` configurado en inferencia.
- Capacidad de operar con contextos largos: hasta 65.536 tokens en la configuracion de inferencia declarada y 300.000 tokens en la ventana de entrenamiento.
- Entrenamiento orientado a diversidad de respuestas (`4b-diversity`) mediante RL con grupo de 8 muestras y juez externo.
- Perfil de despliegue multimodal no confirmado: la configuracion fija `language_model_only = true`, por lo que el uso previsto es exclusivamente de lenguaje.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).

## Casos de uso

- Investigacion en aprendizaje por refuerzo: el checkpoint sirve como caso de estudio de un ciclo RL completo sobre un modelo denso de ~4,5B, con hiperparametros, juez externo y esquema de grupos documentados, util para replicar o auditar pipelines similares.
- Experimentos de diversidad de respuestas: el nombre del experimento (`4b-diversity`) y el uso de `group_size = 8` apuntan a evaluar la variedad de salidas ante un mismo prompt, un escenario tipico en investigacion de RLHF/RLVR.
- Procesamiento de documentos largos: con 65.536 tokens de contexto en inferencia, es adecuado para resumir o extraer informacion de contratos, informes o expedientes extensos que no caben en modelos de 4k-8k tokens.
- Agentes con tool calling: el parser `qwen3_coder` permite integrar el modelo en flujos que invocan funciones o APIs externas, por ejemplo orquestacion de tareas multi-paso sobre un backend de herramientas.
- Analisis de trazas y logs extensos: la ventana larga permite pasar ficheros de log completos y pedir diagnosticos o resumenes, evitando trocear el contexto.
- Evaluacion comparativa de checkpoints: al ser el `epoch3` de un mismo experimento, es util para comparar la evolucion del rendimiento entre epocas dentro del mismo pipeline de RL.
- Generacion asistida de codigo experimental: aunque no hay benchmarks que lo respalden, el parseo de tool calling y el soporte de contexto largo permiten probarlo en tareas de autocompletado o explicacion de fragmentos en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras de VRAM son estimaciones derivadas del numero de parametros (4.539.265.536) y no proceden de mediciones publicadas por el autor.

- Inferencia en bf16/fp16: los pesos ocupan aproximadamente 9,1 GB (coincide con el tamano del repositorio, 9,1 GB); con activaciones y cache KV para contextos moderados, el consumo tipico ronda los 11-13 GB.
- Inferencia en 8 bits: alrededor de 5-6 GB de pesos, mas cache KV.
- Inferencia en 4 bits (si se generan cuantizaciones propias): alrededor de 3-3,5 GB de pesos, mas cache KV.
- Contexto largo (65.536 tokens): la cache KV crece de forma proporcional a la longitud y al numero de capas; para secuencias de decenas de miles de tokens se recomienda GPU con 40-80 GB.
- GPU recomendadas: para bf16 y contextos cortos, una RTX 4090 (24 GB) o L40S (48 GB) son suficientes; para contexto largo en produccion, A100 (40/80 GB) o H100 (80 GB).
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB (por ejemplo RTX 3090, RTX 4080, RTX 4090) siempre que se use bf16 con contexto contenido o cuantizacion de 8/4 bits y se ajuste el limite de contexto.
- Opciones de despliegue: vLLM es la via documentada por el autor en la configuracion de entrenamiento; TGI, SGLang o transformers tambien son viables. Para llama.cpp/Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stage-org/4b-diversity-LL-300-nyshot-27b-z-epoch3 | ~4,5B | 300.000 (entrenamiento) / 65.536 (inferencia) | no disponible | 0 descargas, 0 likes | Checkpoint RL experimental, sin benchmarks publicos |
| Qwen/Qwen3.5-4B (modelo base) | ~4,5B (no verificado en esta busqueda) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Modelo publico de referencia | Es el punto de partida declarado del ajuste; conserva la arquitectura densa |
| Otras alternativas de ~4B (por ejemplo, la familia Qwen3-4B o similares) | ~4B | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para una comparacion cuantitativa |

No es posible ofrecer una comparativa de rendimiento fiable porque no hay benchmarks publicados para este checkpoint ni datos verificados de los modelos alternativos en la informacion disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial; en la practica, la ausencia de licencia impide asumir derechos de redistribucion o explotacion.
- Sin benchmarks publicados: no existe evidencia cuantitativa de calidad, razonamiento, codigo o matematicas que respalde su uso en produccion.
- Artefacto de investigacion: el nombre del repositorio, el sufijo `epoch3` y el flujo automatico de entrenamiento sugieren un checkpoint intermedio de un experimento, no una version estable.
- Riesgo de alucinacion: no se documentan medidas de mitigacion, evaluaciones de factualidad ni tasas de error.
- Sesgos conocidos: no disponibles; no se describe la composicion del dataset de entrenamiento, por lo que no se puede evaluar el sesgo introducido.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- Contexto: aunque el entrenamiento declara 300.000 tokens, la configuracion de inferencia limita `max_model_len` a 65.536 tokens; superar ese limite provocara errores o truncamiento segun el runtime.
- Dependencia de parsers: el tool calling y el modo thinking requieren el runtime adecuado (`reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`); en otros entornos las capacidades declaradas pueden no activarse.
- Procedencia del ajuste: la evaluacion de respuestas dependia de un juez externo (`gpt-5.6-luna`), lo que introduce una dependencia de un servicio de terceros en el proceso de entrenamiento y posibles sesgos heredados de ese juez.
- Soporte de ecosistema incierto: la etiqueta `qwen3_5` puede no estar soportada por todas las versiones de vLLM, llama.cpp o TGI, lo que obliga a verificar compatibilidad antes de desplegar.
- Cero adopcion observada: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-LL-300-nyshot-27b-z-epoch3
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-diversity-LL-300-nyshot-27b
- Perfil del autor: https://huggingface.co/Stage-org
- Resultados de busqueda web: no se han encontrado enlaces relevantes (las busquedas devolvieron unicamente portales de ofertas de practicas ajenos al modelo).

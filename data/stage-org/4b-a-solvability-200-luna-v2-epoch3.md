# Stage-org/4b-A-solvability-200-luna-v2-epoch3

## Resumen

Stage-org/4b-A-solvability-200-luna-v2-epoch3 es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por la organizacion Stage-org. El modelo cuenta con 4.539.265.536 parametros (aproximadamente 4,5 mil millones) y un tamano de repositorio de 9,1 GB en formato safetensors. Se trata de un artefacto de investigacion derivado de un pipeline de entrenamiento interno, y no de un modelo de proposito general con documentacion exhaustiva.

El modelo forma parte de una familia de experimentos identificada como "4b-A-solvability-200-luna-v2", en la que se ha aplicado RL sobre el modelo base con el objetivo declarado de optimizar "solvability" (capacidad de resolucion) mediante un juez automatico externo. Segun la configuracion de entrenamiento, se emplearon 10.000 pasos de aprendizaje en 3 epocas sobre el dataset `Stage-org/4b-A-solvability-200-luna-v2`, con un group size de 8 y decodificacion con modo de razonamiento (thinking) activado.

Es relevante ahora porque ejemplifica una practica creciente: la publicacion de checkpoints intermedios de experimentos de RL, utiles para reproducibilidad y estudio, pero con informacion de model card minima. No se dispone de licencia declarada, idiomas soportados, pipeline ni resultados de benchmarks en la informacion proporcionada, por lo que su uso en produccion requiere evaluacion previa por parte del adoptante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5 (tag `qwen3_5`); detalles de arquitectura interna no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en inferencia (`max_model_len`); 300.000 en la configuracion de entrenamiento (`seq_len`). No confirmado como capacidad final del modelo |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modo de razonamiento | Si (`enable_thinking = true`) |
| Tool calling | Si (`tool_call_parser = qwen3_coder`) |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de aprendizaje por refuerzo sobre Qwen/Qwen3.5-4B. La configuracion (`schema_version stage.config.v7`) indica un metodo `rl` con un group size de 8, checkpoint de solo pesos (`weights_only = true`) y atencion `flash_attention_2`. Se emplearon 10.000 pasos de aprendizaje distribuidos en 3 epocas, con un `batch_size` de 128 y una longitud de secuencia de 300.000 tokens. El optimizador fue AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0,9 / 0,99.

El proceso de RL incorpora un juez automatico de final abierto basado en el modelo `gpt-5.6-luna` (con `reasoning_effort = medium`), aplicado sobre generaciones con temperatura 0,9, `top_p = 1.0` y `max_tokens = 4096. La funcion de perdida usa parametros tipo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`), lo que sugiere un esquema de optimizacion con enmascaramiento de politicas antiguas y control de divergencia KL. El pipeline de inferencia se ejecuto con vLLM, `language_model_only = true` (inferencia solo de lenguaje), `reasoning_parser = qwen3` y `tool_call_parser = qwen3_coder`.

No se proporcionan detalles sobre la composicion del dataset de entrenamiento, el numero total de tokens vistos ni si hubo fases adicionales de DPO o RLHF mas alla del esquema descrito. La innovacion tecnica destacable, segun la informacion disponible, es el uso de un juez externo para puntuar tareas de "solvability" durante el RL.

## Capacidades

- Generacion de texto en modo de razonamiento explicito (`enable_thinking = true`), con generacion de hasta 4.096 tokens por respuesta en el pipeline de entrenamiento.
- Soporte de tool calling / function calling, segun el parser `qwen3_coder` configurado en vLLM.
- Capacidad de razonamiento multi-paso, derivada del modo thinking y del proceso de RL orientado a resolucion de problemas.
- Inferencia exclusivamente de lenguaje (`language_model_only = true`); no se declaran capacidades de vision ni de audio.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de codigo y matematicas: no confirmadas explicitamente; dependen del modelo base Qwen3.5-4B y del dataset de RL, no documentado.

## Casos de uso

- Evaluacion de tecnicas de RL sobre modelos de 4B: el checkpoint permite reproducir y estudiar el efecto del RL con juez externo sobre Qwen3.5-4B, comparando con el modelo base en laboratorio.
- Generacion de texto con razonamiento explicito en tareas de resolucion: adecuado para experimentos donde interese el modo thinking y cadenas de razonamiento largas de hasta 4.096 tokens.
- Integracion en pipelines con tool calling: el parser `qwen3_coder` facilita conectar el modelo a herramientas externas en flujos de agentes de investigacion.
- Procesamiento de contexto largo en prototipos: con `max_model_len` de 65.536 tokens, puede emplearse en tareas de resumen o analisis de documentos extensos dentro de ese limite.
- Base para ajuste adicional (fine-tuning): al ser un checkpoint de pesos completos en safetensors sobre Qwen3.5-4B, sirve como punto de partida para nuevos experimentos de RL o SFT.
- Servicio de inferencia self-hosted: puede desplegarse con vLLM usando la misma configuracion de parsers documentada, en entornos controlados de investigacion.
- Banco de pruebas de alineacion: util para analizar como un juez automatico basado en otro modelo moldea el comportamiento del modelo entrenado.

Nota: no se documentan casos de uso validados por el autor; los anteriores son aplicaciones plausibles dadas las caracteristicas tecnicas declaradas y requieren validacion empirica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 4,54 mil millones de parametros; valores orientativos, no verificados por el autor):
  - BF16/FP16: aproximadamente 9,1 GB de pesos mas memoria para KV cache y activaciones.
  - Cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos.
  - Cuantizacion de 4 bits: aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas: para BF16 en contexto completo se recomienda una GPU con 24 GB o mas (RTX 3090, RTX 4090, A5000, L40S). Para contextos de 65.536 tokens, la memoria de KV cache es significativa y puede requerir A100 40/80 GB o H100.
- Compatibilidad con GPU de consumo: si, con cuantizacion de 8 o 4 bits cabe en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En BF16 cabe en GPUs de 24 GB con contexto reducido.
- Opciones de despliegue: vLLM (referenciado en la configuracion, con `reasoning_parser = qwen3` y `tool_call_parser = qwen3_coder`), llama.cpp, Ollama y TGI (estos ultimos requeririan conversion previa de pesos). No se documenta conversion a GGUF en el repositorio.
- Latencia y throughput estimados: no disponible.
- Nota: al no publicarse cuantizaciones en el repositorio, estas estimaciones son calculos de ingenieria basados en el numero de parametros y no en mediciones del autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de documentacion suficiente para una comparativa cuantitativa fiable. Como referencia estructural, el modelo deriva de Qwen/Qwen3.5-4B, del mismo orden de parametros (aproximadamente 4B), por lo que cualquier comparacion deberia hacerse contra ese modelo base en las mismas condiciones de evaluacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-A-solvability-200-luna-v2-epoch3 | 4,54 B | 65.536 (inferencia) | no disponible | HuggingFace |
| Qwen/Qwen3.5-4B (modelo base) | no disponible en esta informacion | no disponible en esta informacion | no disponible en esta informacion | HuggingFace |

Para el resto de alternativas comparables (mismo tamano o misma tarea), los datos de rendimiento, contexto y licencia no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican los terminos de uso, lo que impide determinar si se permite el uso comercial. Debe aclararse antes de cualquier despliegue en produccion.
- Idiomas soportados no documentados: se desconoce el comportamiento real en castellano u otros idiomas distintos del material de entrenamiento.
- Riesgo de alucinacion: inherente a los modelos generativos; el modo de razonamiento explicito no garantiza la veracidad de las cadenas de razonamiento.
- Sesgos conocidos: no documentados, pero persisten los sesgos heredados del modelo base Qwen3.5-4B y los introducidos potencialmente por el juez automatico `gpt-5.6-luna` durante el RL.
- Alineacion guiada por juez externo: optimizar contra un unico juez puede producir sobreajuste a sus criterios (reward hacking), con degradacion en tareas fuera de la distribucion evaluada.
- Contexto efectivo incierto: aunque la configuracion de entrenamiento usa `seq_len` de 300.000 y la inferencia `max_model_len` de 65.536, no se confirma el rendimiento real a contextos largos.
- Artefacto de investigacion sin descargas ni validacion de la comunidad (0 descargas, 0 likes): no hay evidencia externa de calidad ni de estabilidad en produccion.
- Modelo exclusivamente de lenguaje: no soporta entrada de imagenes ni audio (`language_model_only = true`).
- Uso de un juez propietario en el pipeline: el proceso de entrenamiento depende de un endpoint externo (`gpt-5.6-luna`), lo que afecta a la reproducibilidad completa del ajuste.

## Enlaces

- HuggingFace: https://huggingface.co/Stage-org/4b-A-solvability-200-luna-v2-epoch3
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/Stage-org/4b-A-solvability-200-luna-v2 (referencia indicada en la model card; disponibilidad no verificada)
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-4B (referencia indicada en la configuracion de entrenamiento)
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.

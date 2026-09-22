# Stage-org/4b-diversity-rawsource-300-27b-z-epoch3

## Resumen

`Stage-org/4b-diversity-rawsource-300-27b-z-epoch3` es un modelo de lenguaje de aproximadamente 4,54 mil millones de parametros publicado por la organizacion `Stage-org` en HuggingFace. Se trata de un ajuste derivado de `Qwen/Qwen3.5-4B`, segun se desprende de la configuracion de entrenamiento incluida en su model card, y el sufijo `epoch3` del identificador coincide con el parametro `learner_epoch = 3` de dicha configuracion. El repositorio apenas tiene traccion: cero descargas y cero "likes" en el momento de la consulta, y no incluye pipeline, licencia ni idiomas declarados.

El interes tecnico del artefacto no esta tanto en su rendimiento como en su procedencia: la model card documenta integramente el pipeline de entrenamiento por refuerzo empleado, con el comando exacto, el fichero TOML de configuracion y los hiperparametros (metodo `rl`, 10.000 pasos de learner, 3 epocas, `batch_size = 128`, `seq_len = 300000`, `group_size = 8`). Es, por tanto, un ejemplo de checkpoint intermedio de un flujo de RL con juez automatico externo, mas que un modelo listo para produccion.

Para un desarrollador o investigador, el valor practico es doble: por un lado, permite reproducir o auditar una receta de RL concreta sobre una base Qwen3.5-4B; por otro, sirve como caso de estudio de un modelo sin model card descriptiva (no hay datos de capacidades, idiomas ni licencia), lo que obliga a evaluarlo empiricamente antes de considerarlo para cualquier uso real. No se han publicado benchmarks ni informacion de evaluacion en la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (tag `qwen3_5`); numero de capas, cabezas y dimensionalidad no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no confirmada oficialmente; la config de entrenamiento declara `seq_len = 300000` y la de inferencia `max_model_len = 65536` |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en precision completa/bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 9,1 GB) |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Metodo de ajuste | RL (reinforcement learning) segun la configuracion de entrenamiento |
| Autor | Stage-org |
| Fecha de publicacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es el tag `qwen3_5` y la referencia explicita al modelo base `Qwen/Qwen3.5-4B` en el bloque `learner` de la configuracion. No se documentan el numero de capas, el tipo de atencion, el esquema de RoPE ni si emplea Grouped Query Attention. El recuento real de parametros de los ficheros safetensors (4.539.265.536) es coherente con un modelo denso de ~4,5B en precision bf16, dado que el repositorio ocupa 9,1 GB (aproximadamente 2 bytes por parametro mas overhead).

Lo que si esta documentado es el procedimiento de ajuste. Se trata de un entrenamiento por refuerzo con `learner_steps = 10000` y `learner_epoch = 3` sobre el dataset `Stage-org/4b-diversity-rawsource-300-27b-z`, con `batch_size = 128`, `seq_len = 300000` y `group_size = 8` (esquema de tipo GRPO, con ocho generaciones por prompt). Optimizacion con AdamW (`lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0`, `betas = [0.9, 0.99]`), atencion en `flash_attention_2` y una funcion de perdida con mascara DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`. La recompensa no proviene de un reward model entrenado, sino de un juez externo (`gpt-5.6-luna`) configurado como `open_ended_judge`, con `max_in_flight = 32` y hasta 3 reintentos.

El bucle de RL se ejecuto con despliegue separado de inferencia y entrenamiento (`num_infer_gpus = 1`, `num_train_gpus = 1`) sobre vLLM con `gpu_memory_utilization = 0.9`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`. La generacion durante el entrenamiento uso `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`; el orchestrador permitio hasta 256 rollouts en vuelo y 8 pasos off-policy. Conviene senalar que la longitud de secuencia de entrenamiento declarada (300.000) es muy superior a la longitud maxima configurada para el servidor vLLM (65.536), una discrepancia que no se explica en la documentacion.

## Capacidades

- Generacion de texto autoregresiva: capacidad heredada del modelo base Qwen3.5-4B; no se documentan evaluaciones propias del checkpoint.
- Modo de razonamiento explicito ("thinking"): la configuracion de entrenamiento activa `enable_thinking = true` y usa `reasoning_parser = "qwen3"`, lo que indica soporte de cadenas de razonamiento separadas de la respuesta final.
- Tool calling / function calling: la configuracion de inferencia declara `tool_call_parser = "qwen3_coder"`, lo que sugiere soporte de llamadas a herramientas en el formato de Qwen para codigo.
- Codigo: el uso del parser `qwen3_coder` apunta a que el modelo base y el ajuste estan orientados, al menos en parte, a tareas de programacion; no hay benchmarks que lo confirmen para este checkpoint.
- Razonamiento multi-paso y comportamiento agentico: el entrenamiento por RL con recompensa abierta sobre prompts de diversidad esta disenado, en principio, para mejorar el desempeno en tareas de varios pasos; no se aportan metricas.
- Multilingue: no disponible. No se declaran idiomas en el repositorio.
- Vision o audio: no disponible, y no hay indicios de que el modelo sea multimodal (el tag y la configuracion apuntan solo a modelo de lenguaje).
- Capacidades adicionales especificas del ajuste: no documentadas.

## Casos de uso

- Investigacion en RL para LLM: el repositorio documenta comando, TOML completo e hiperparametros, por lo que sirve como punto de partida reproducible para estudiar el efecto de un ajuste RL con juez externo sobre una base Qwen3.5-4B. Es su caso de uso mas solido, dado que no hay evaluacion de capacidades.
- Experimentos de destilacion o comparacion de checkpoints: al ser un checkpoint de la epoca 3 de un mismo run, permite analizar la evolucion del modelo a lo largo del entrenamiento si se dispone de las epocas 1 y 2.
- Auditoria de pipelines de entrenamiento: el bloque de configuracion permite revisar decisiones de diseno (mascara DPPO, `kl_tau`, tamano de grupo, temperatura de generacion) y detectar inconsistencias como el desajuste entre `seq_len` y `max_model_len`.
- Generacion de codigo asistida en entornos controlados: si el ajuste no ha degradado las capacidades del base, el parser `qwen3_coder` permitiria integrarlo en asistentes de IDE o en pipelines de CI/CD mediante vLLM con la API compatible con OpenAI. Requiere validacion previa.
- Prototipado de agentes con llamadas a herramientas: el soporte declarado de tool calling y thinking mode lo hace candidato para prototipos de agentes multi-paso, siempre que se valide el formato de salida real.
- Despliegue en hardware de gama media para pruebas internas: con ~4,5B de parametros, cabe en una sola GPU consumer de 16-24 GB en bf16 y en GPUs mas modestas cuantizado, lo que abarata la experimentacion.
- Evaluacion comparativa de jueces automaticos: como el entrenamiento uso un juez externo (`gpt-5.6-luna`) con recompensa de puntuacion abierta, el checkpoint puede emplearse para estudiar como se comporta un modelo pequeno optimizado contra ese tipo de juez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de evaluacion, no se ha encontrado model card descriptiva con metricas y los resultados de busqueda web recuperados no guardan ninguna relacion con el modelo (corresponden a portales de ofertas de practicas). No procede, por tanto, presentar cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 9-10 GB solo para pesos, mas el cache KV. Con 4,54B de parametros a 2 bytes por parametro se obtienen unos 9,1 GB, en linea con el tamano del repositorio.
- VRAM para inferencia cuantizada (estimacion, no confirmada por el autor): en torno a 2,5-3,5 GB en Q4 y 4,5-5,5 GB en int8/fp8, segun el esquema de cuantizacion que se aplique.
- Cache KV: no disponible con precision, ya que se desconocen el numero de capas, cabezas y cabezas KV. A 65.536 tokens de contexto el cache puede ser del orden de varios gigabytes y, en muchos casos, superar el peso de los propios parametros. Es el principal factor limitante para contextos largos.
- GPU recomendadas: no hay recomendacion oficial. Como referencia practica, una RTX 4090 (24 GB) o L40S deberia bastar para bf16 con contexto moderado; para el contexto maximo declarado de 65.536 tokens conviene una A100 80 GB o H100 para evitar fragmentacion.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer de 16-24 GB (RTX 4080, 4090, 5070 Ti y superiores) en bf16 con contextos cortos, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: el autor uso vLLM con `gpu_memory_utilization = 0.9`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, con `language_model_only = true`. No se declara compatibilidad con llama.cpp, Ollama o TGI, y al no haber ficheros GGUF en el repositorio, el uso con esas herramientas requeriria conversion propia.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Comparativa orientativa con alternativas del mismo orden de parametros. Los datos del modelo tratado son los unicos verificados en esta ficha; los de la competencia se limitan a lo publicamente conocido y se marcan como "no verificado" cuando no se dispone de fuente en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-diversity-rawsource-300-27b-z-epoch3 | ~4,54B | No confirmado (65.536 en config de inferencia) | no disponible | HuggingFace, safetensors, 9,1 GB, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | No disponible en esta ficha | Segun la del repositorio original | HuggingFace |
| Alternativas de ~3-4B (Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) | 3-4B | No verificado | No verificado | HuggingFace, ampliamente desplegadas |

No se dispone de resultados de benchmarks de este checkpoint, por lo que no es posible establecer una comparacion de rendimiento con las alternativas. Cualquier afirmacion de superioridad o inferioridad seria especulativa.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay licencia, idiomas, pipeline, ni descripcion de capacidades. Esto impide legal y tecnicamente su uso en produccion sin una evaluacion propia.
- Licencia no disponible: sin licencia explicita, no puede presumirse permiso de uso comercial. Debe aclararse con el autor antes de cualquier despliegue.
- Riesgo de alucinacion: no evaluado. El modelo se entreno con un juez automatico de recompensa abierta, un esquema que puede favorecer respuestas largas o con formato agradable al juez sin garantizar veracidad.
- Sesgos: no evaluados ni documentados. El dataset de entrenamiento (`4b-diversity-rawsource-300-27b-z`) no esta descrito en la informacion disponible, por lo que se desconoce su composicion y los sesgos que pueda inducir.
- Degradacion por RL: los ajustes por refuerzo sobre jueces externos pueden producir perdida de capacidades generales (olvido catastrofico) y colapso de diversidad. Con 10.000 pasos de learner y `kl_tau = 0.001` (penalizacion KL muy baja) ese riesgo es real y no esta cuantificado.
- Inconsistencia de configuracion: la longitud de secuencia de entrenamiento declarada (300.000) no coincide con el `max_model_len` de inferencia (65.536). Conviene verificar cual es el contexto realmente soportado antes de disenar aplicaciones.
- Vocabulario de herramientas: el uso de `tool_call_parser = "qwen3_coder"` implica que el formato de llamada a funciones es el de la familia Qwen; no es portable directamente a otros esquemas sin adaptacion.
- Estado del artefacto: cero descargas y cero likes, creado el 22 de septiembre de 2026 y actualizado un minuto despues, lo que sugiere una publicacion automatica de checkpoint sin curacion posterior.
- Idiomas: sin declaracion de idiomas soportados, no puede asumirse un buen rendimiento en castellano.
- Reproducibilidad limitada: la receta se apoya en un juez externo propietario (`gpt-5.6-luna`) accesible via `JUDGE_BASE_URL` y `JUDGE_API_KEY`, lo que impide reproducir el entrenamiento sin acceso a ese servicio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-rawsource-300-27b-z-epoch3
- Dataset de entrenamiento citado en la model card: `Stage-org/4b-diversity-rawsource-300-27b-z` (referencia interna, sin URL verificada en la informacion disponible)
- Modelo base: `Qwen/Qwen3.5-4B` (referencia interna, sin URL verificada en la informacion disponible)
- Paper, blog, repositorio o demo: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, la organizacion `Stage-org` ni el dataset de entrenamiento.

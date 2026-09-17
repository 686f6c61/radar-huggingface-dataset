# Stage-org/filter-s_signal2-lmb05-200-4k-epoch3

## Resumen

`Stage-org/filter-s_signal2-lmb05-200-4k-epoch3` es un ajuste por aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion Stage-org. Se trata de un artefacto de un pipeline automatizado de entrenamiento: el checkpoint corresponde a la epoca 3 de un run identificado como `filter-s_signal2-lmb05-200-4k`, con 10.000 pasos de learner y un dataset homonimo de entrenamiento. El repositorio contiene unicamente pesos en formato safetensors, con 4.539.265.536 parametros totales (unos 4,54 mil millones) y un tamano de 9,1 GB, coherente con pesos en BF16/FP16.

El modelo no incluye model card descriptiva mas alla del bloque de procedencia del entrenamiento (dataset, comando y configuracion TOML). No se declaran licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion (17 de septiembre de 2026) distan poco mas de veinte segundos, lo que refuerza la hipotesis de una publicacion automatica desde un workflow de entrenamiento.

Su relevancia es, por tanto, acotada: resulta util como referencia tecnica de una receta de RL sobre Qwen3.5-4B (GRPO con juez LLM, atencion FlashAttention-2, inferencia con vLLM y parsers de razonamiento y tool calling de la familia Qwen3), pero no como modelo listo para produccion, dado que carece de documentacion, licencia y evaluacion publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de `Qwen/Qwen3.5-4B`; sin detalles de capas, cabezas ni configuracion en la informacion disponible) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | Configuracion de entrenamiento: `seq_len = 300000`; configuracion de inferencia (vLLM): `max_model_len = 65536`. No se documenta contexto nativo verificado |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Metodo de entrenamiento | RL (configuracion `prime_rl`, `learner.method = "rl"`) |
| Dataset de entrenamiento | `Stage-org/filter-s_signal2-lmb05-200-4k` (split `train`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17T12:52:49Z |
| Fecha de actualizacion | 2026-09-17T12:53:13Z |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo mas alla de su origen: es un fine-tuning de `Qwen/Qwen3.5-4B`, por lo que hereda la arquitectura de ese modelo base (decoder-only). No se especifican numero de capas, dimension de oculto, cabezas de atencion, uso de atencion lineal o de mezcla de expertos, ni si se aplicaron modificaciones estructurales durante el ajuste. La configuracion de entrenamiento si revela detalles de implementacion: se usa `flash_attention_2` como backend de atencion y `language_model_only = true` en la configuracion de vLLM, lo que sugiere que se descartan componentes multimodales si el base los tuviera.

El entrenamiento es un proceso de RL completo, no un simple SFT. La configuracion indica `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128` y `group_size = 8` (esquema tipo GRPO: ocho generaciones por prompt). El optimizador es AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0.9/0.99. La funcion de perdida incluye una mascara DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y un coeficiente KL de 0.001 frente al modelo de referencia. La generacion durante el rollout usa temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, lo que indica que se entrena con modo de razonamiento activado.

La senal de recompensa proviene de un juez LLM externo (`open_ended_judge`), con `mean_score = false`, hasta 32 peticiones en vuelo, 3 reintentos y backoff de 1 segundo. El juez declarado es `gpt-5.6-luna`, accedido via `JUDGE_BASE_URL`/`JUDGE_API_KEY`, con `reasoning_effort = "medium"`. El orchestrator permite hasta 256 rollouts en vuelo y `max_off_policy_steps = 8`. El checkpoint se guarda cada 1000 unidades de epoca conservando solo el ultimo (`keep_last = 1`), lo que explica la nomenclatura `epoch3`. No se documenta composicion del dataset, numero de tokens vistos ni si hubo etapas previas de SFT o DPO.

## Capacidades

No se ha publicado documentacion de capacidades. Lo que puede inferirse de la configuracion es lo siguiente, siempre con caracter indirecto:

- Generacion de texto y razonamiento en modo "thinking": el entrenamiento activa `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`.
- Tool calling / function calling: la configuracion de vLLM declara `tool_call_parser = "qwen3_coder"`, lo que indica soporte previsto de llamadas a herramientas.
- Codigo: el uso del parser `qwen3_coder` sugiere orientacion a tareas de codigo, aunque no hay evaluacion que lo confirme.
- Razonamiento multi-paso y de respuesta abierta: el juez de recompensa es de tipo `open_ended_judge`, lo que implica optimizacion sobre respuestas abiertas mas que sobre respuestas verificables de un solo paso.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible; la inferencia se configura como `language_model_only`.
- Longitud de contexto efectiva: no verificada; la configuracion de entrenamiento declara `seq_len = 300000` mientras que el servidor de inferencia limita `max_model_len` a 65536, discrepancia que no se explica en la model card.

## Casos de uso

Dado que no hay evaluacion publicada ni licencia declarada, estos casos deben considerarse escenarios de evaluacion interna, no despliegues de produccion:

- Evaluacion comparativa de recetas de RL: usar el checkpoint como referencia reproducible para estudiar el efecto de un juez LLM de respuesta abierta con `group_size = 8` y mascara DPPO sobre un base de ~4B.
- Generacion de codigo asistida en entorno controlado: gracias al parser de tool calling `qwen3_coder`, puede conectarse a un servidor vLLM y probarse en tareas de edicion de ficheros o ejecucion de comandos dentro de un sandbox, midiendo tasa de exito antes de considerarlo para pipelines de CI/CD.
- Agentes multi-paso de investigacion: su entrenamiento con modo thinking y formato de llamadas a herramientas permite experimentar con cadenas de razonamiento y uso de herramientas, siempre con verificacion humana de los resultados.
- Prototipado de asistentes conversacionales con contexto largo: el limite de 65.536 tokens en vLLM permite mantener historiales extensos o documentos completos en memoria, util para probar estrategias de resumen incremental.
- Extraccion y estructuracion de informacion sobre documentos largos: con 64k de contexto puede procesar informes o expedientes completos y devolver salidas estructuradas mediante function calling.
- Investigacion sobre alineacion y recompensa: al conservar la configuracion exacta del run, sirve para analizar comportamientos emergentes de RL con juez externo (por ejemplo, deriva estilistica o sobreajuste al juez).
- Generacion de datos sinteticos para otros entrenamientos: puede emplearse como generador en un pipeline de destilacion, etiquetando los datos como no verificados.
- Base para ablaciones de cuantizacion: al ser un modelo de ~4,5B en safetensors, es un candidato razonable para medir degradacion al convertir a GGUF o AWQ, aunque dichas conversiones no estan publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente la procedencia del entrenamiento (dataset, comando y configuracion TOML); no hay tablas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni del modelo ajustado ni de su base.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros (4,54 B) y del tamano del repositorio (9,1 GB, compatible con BF16/FP16). No hay mediciones publicadas de latencia ni throughput para este checkpoint.

- Pesos en BF16/FP16: aproximadamente 9,1 GB solo para los pesos.
- Pesos en FP32: aproximadamente 18,2 GB.
- Pesos en INT8: aproximadamente 4,6-5 GB.
- Pesos en INT4: aproximadamente 2,5-3 GB.
- La VRAM total necesaria es superior a la de los pesos, ya que hay que sumar la cache KV. Con `max_model_len = 65536`, la cache KV puede crecer varios GB segun el lote y la configuracion de atencion; conviene reservar margen adicional.
- GPU consumer: en BF16 cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) solo con contexto moderado; en 16-24 GB (RTX 4070 Ti Super, RTX 4090, RTX 5090) hay margen suficiente para contexto largo. En INT4 cabria en GPU de 8 GB con contexto reducido.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S, L4 o A6000 son adecuadas para servir varias peticiones concurrentes con contexto de 64k. El entrenamiento declarado uso 2 GPU por nodo (1 de inferencia y 1 de entrenamiento).
- Opciones de despliegue: vLLM esta confirmado por la propia configuracion de entrenamiento (`max_model_len = 65536`, `gpu_memory_utilization = 0.9`, parsers `qwen3` y `qwen3_coder`). SGLang o TGI son alternativas tecnicas razonables, pero no estan verificadas para este checkpoint. llama.cpp y Ollama requeririan una conversion a GGUF que no se publica en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparativa se limita a caracteristicas verificables. Las celdas de rendimiento y contexto de los modelos alternativos se marcan como no disponibles al no haberse consultado fuentes que las respalden en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Stage-org/filter-s_signal2-lmb05-200-4k-epoch3` | 4,54 B | 65.536 tokens declarados en inferencia | No disponible | HuggingFace, safetensors, 0 descargas | No publicado |
| `Qwen/Qwen3.5-4B` (modelo base) | No disponible | No disponible | No disponible | HuggingFace | No disponible |
| Otros modelos densos de ~4B (por ejemplo, familias Qwen3, Llama 3.2 3B o Phi-4-mini) | No disponible | No disponible | No disponible | HuggingFace | No disponible |

No se han encontrado en la busqueda web modelos comparables con datos verificables que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan capacidades, limitaciones, sesgos ni procedencia de los datos de entrenamiento mas alla del identificador del dataset.
- Licencia no declarada: sin licencia explicita, el uso comercial es juridicamente arriesgado. No debe desplegarse en produccion sin aclarar previamente los terminos.
- Sin evaluacion publicada: no hay ninguna metrica que respalde la calidad del ajuste, ni comparacion contra el modelo base. El riesgo de regresion respecto al base es desconocido.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala y no cuantificado en este caso. Al haberse optimizado con un juez LLM de respuesta abierta, puede haber aprendido a producir respuestas que puntuan bien ante un juez sin ser necesariamente veraces.
- Riesgo de sobreajuste al juez (`reward hacking`): la recompensa proviene de un unico juez (`gpt-5.6-luna`) con `mean_score = false`, lo que aumenta la probabilidad de explotar peculiaridades del juez en lugar de mejorar la tarea.
- Discrepancia de contexto: `seq_len = 300000` en entrenamiento frente a `max_model_len = 65536` en inferencia. No esta claro cual es la ventana realmente soportada; usar mas de 65.536 tokens en inferencia no esta respaldado por la configuracion.
- Idiomas: no declarados. No hay garantia de un rendimiento minimo en castellano ni en ningun otro idioma concreto.
- Cuantizaciones no publicadas: no hay GGUF ni variantes cuantizadas, por lo que un despliegue ligero exige conversion propia y validacion posterior.
- Naturaleza experimental del artefacto: el nombre y el flujo de publicacion (0 descargas, 0 likes, actualizacion 24 segundos despues de la creacion) indican un checkpoint intermedio de una ejecucion automatizada, no una version curada ni mantenida.
- Sin garantia de soporte: no hay repositorio, documentacion ni mantenimiento declarado por parte de Stage-org para este modelo.
- Cadena de custodia de la recompensa: el juez depende de variables de entorno (`JUDGE_BASE_URL`, `JUDGE_API_KEY`) y de un servicio externo, por lo que el run no es completamente reproducible sin acceso a ese endpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/filter-s_signal2-lmb05-200-4k-epoch3
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/filter-s_signal2-lmb05-200-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion autora: https://huggingface.co/Stage-org
- Paper, blog o repositorio del modelo: no disponible.
- Demo o espacio de inferencia: no disponible.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a portales de ofertas de practicas (stage.fr, welcometothejungle.com, fr.indeed.com, jobs-stages.letudiant.fr) y no guardan relacion con el identificador `Stage-org`.

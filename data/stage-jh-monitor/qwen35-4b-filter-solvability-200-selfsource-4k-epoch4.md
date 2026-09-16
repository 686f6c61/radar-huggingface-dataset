# Stage-jh-monitor/qwen35-4b-filter-solvability-200-selfsource-4k-epoch4

## Resumen

`Stage-jh-monitor/qwen35-4b-filter-solvability-200-selfsource-4k-epoch4` es un checkpoint experimental de 4.539.265.536 parametros (4,54 B) derivado de `Qwen/Qwen3.5-4B` y ajustado mediante aprendizaje por refuerzo (RL) con el pipeline interno descrito en su propia model card. El repositorio, publicado el 16 de septiembre de 2026 por la organizacion Stage-jh-monitor, contiene unicamente pesos en safetensors (9,1 GB, coherente con bf16/fp16) y no declara pipeline, licencia ni idiomas.

El nombre del artefacto apunta a un experimento de filtrado de "solvencia" (solvability) de tareas sobre un dataset propio (`Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k`), entrenado 3 epocas y 10.000 pasos de learner con un algoritmo de RL por grupos (group_size = 8) y un juez externo. La configuracion de generacion activa `enable_thinking = true` y usa los parsers `qwen3` (razonamiento) y `qwen3_coder` (tool calling), por lo que conserva las capacidades de razonamiento y llamada a herramientas de la familia Qwen3.5.

Su relevancia es de investigacion y reproducibilidad: incluye comando de entrenamiento y configuracion TOML completa, y acumula 0 descargas y 0 likes. Es util para inspeccionar o replicar un pipeline de RL sobre un modelo de 4B, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B (detalles de capas no disponibles) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | 65.536 tokens (`max_model_len` de la config de inferencia); la config de entrenamiento declara `seq_len = 300.000` |
| Tipos de cuantizacion | No disponible (repo en safetensors de ~9,1 GB, coherente con bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,1 GB |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B` y se ajusta con `method = "rl"` sobre el dataset `Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k` (split `train`, tipo `new_task`), con 10.000 pasos de learner repartidos en 3 epocas. El optimizador es AdamW con `lr = 1e-06`, `weight_decay = 0`, `max_norm = 1.0` y betas 0,9/0,99; la atencion usa `flash_attention_2`. El núcleo de RL emplea `group_size = 8`, una perdida de tipo `default` con parametros DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`), y un juez de respuestas abiertas servido por el modelo `gpt-5.6-luna` con `reasoning_effort = "medium"`, `max_in_flight = 32` y hasta 3 reintentos.

La infraestructura de entrenamiento usa 2 GPUs por nodo (1 de inferencia y 1 de entrenamiento), inferencia con vLLM (`gpu_memory_utilization = 0.9`, `language_model_only = true`, servicio en el puerto 7000) y un orquestador con `max_inflight_rollouts = 256` y hasta `max_off_policy_steps = 8`. La generacion durante el entrenamiento usa temperatura 0,9, `top_p = 1.0` y `max_tokens = 4096` con modo thinking activado. No se especifica el volumen de tokens de entrenamiento ni la composicion del dataset, por lo que no es posible evaluar la cobertura de datos ni el posible sesgo de dominio.

## Capacidades

- Generacion de texto y razonamiento en modo thinking: la configuracion de generacion usa `enable_thinking = true` y un parser de razonamiento `qwen3`.
- Tool calling / function calling: la configuracion de inferencia declara `tool_call_parser = "qwen3_coder"`, lo que indica soporte de llamada a herramientas orientada a codigo.
- Contexto largo: hasta 65.536 tokens en la configuracion de inferencia declarada por el autor.
- Razonamiento multi-paso: el entrenamiento usa RL por grupos con juez de respuesta abierta, lo que favorece cadenas de razonamiento largas, aunque no se documenta ningun modo de agente explicito.
- Filtrado de solvencia de tareas: el nombre del modelo y del dataset sugieren especializacion en decidir si un problema es resoluble, si bien no hay documentacion que lo confirme.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (`language_model_only = true` en la config de inferencia).
- Ventana de contexto durante el entrenamiento: la config declara `seq_len = 300.000`, dato que no se puede confirmar con el resto de la informacion.

## Casos de uso

- Filtrado y curacion de datasets de entrenamiento: el modelo puede evaluar si un problema es resoluble antes de incorporarlo a un corpus, reduciendo ejemplos degenerados o mal formados; es el escenario que sugiere su nombre y su dataset de origen.
- Agentes de codigo con llamada a herramientas: gracias al parser `qwen3_coder` puede integrarse en un bucle de agente que invoque funciones, ejecute pruebas y corrija errores en varios pasos.
- Asistentes de razonamiento sobre documentos largos: con 65.536 tokens de contexto puede procesar informes tecnicos o expedientes extensos manteniendo coherencia multi-turno.
- Generacion de codigo asistida en entornos de desarrollo: se puede servir con vLLM en el puerto 7000 y conectar a un IDE o a un pipeline de CI/CD para revisiones automaticas de parches.
- Analisis de problemas matematicos y logicos paso a paso: el modo thinking con `max_tokens = 4096` permite desplegar soluciones intermedias antes de la respuesta final.
- Base para investigacion en RL: sirve como punto de partida reproducible (comando de entrenamiento y TOML incluidos) para experimentar con DPPO, tamanos de grupo y jueces externos sobre una columna vertebral de 4B.
- Clasificacion de viabilidad de peticiones en un sistema de atencion al cliente: puede decidir si una consulta es resoluble por un agente automatico o debe escalarse a un humano, con contexto conversacional largo.
- Evaluacion automatizada de candidatos de solucion: util para puntuar multiples respuestas generadas por otro modelo antes de seleccionar la mejor, aprovechando el entrenamiento con juez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la procedencia y la configuracion del entrenamiento, sin metricas de MMLU, HumanEval, GSM8K ni comparativas numericas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 9,1 GB solo para los pesos (4,54 B parametros x 2 bytes), mas el KV cache y las activaciones, que no estan documentados.
- VRAM estimada en cuantizacion de 8 bits: del orden de 5 GB para pesos (estimacion aritmetica; no hay artefactos cuantizados publicados).
- VRAM estimada en cuantizacion de 4 bits: del orden de 3 GB para pesos (estimacion aritmetica; requiere conversion propia).
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 24 GB (RTX 3090, RTX 4090) con contexto moderado; en tarjetas de 12-16 GB seria necesario cuantizar.
- GPU recomendadas para contexto completo (65.536 tokens) y lotes grandes: A100 40/80 GB, H100, L40S o similares con 24-80 GB.
- Opciones de despliegue: vLLM es la via confirmada por la configuracion del autor (parser de razonamiento `qwen3`, parser de tool calling `qwen3_coder`). No se ha publicado artefacto GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. TGI y otros servidores no estan documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato y disponibilidad | Evaluacion publica |
|---|---|---|---|---|---|
| Este modelo | 4,54 B | 65.536 tokens (config de inferencia) | No disponible | safetensors, 9,1 GB | No disponible |
| Qwen/Qwen3.5-4B (base) | ~4 B segun el nombre | No disponible | No disponible | No disponible | No disponible |
| Otras variantes de ~4B de la familia Qwen3.5 | No disponible | No disponible | No disponible | No disponible | No disponible |

No hay datos de rendimiento de este checkpoint ni de sus alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base `Qwen/Qwen3.5-4B` antes de cualquier despliegue.
- Sin benchmarks ni evaluacion publica: el rendimiento real es desconocido y no hay validacion independiente.
- Repositorio con 0 descargas y 0 likes: se trata de un artefacto experimental sin adopcion ni contraste por parte de la comunidad.
- Model card minima: solo contiene procedencia y configuracion de entrenamiento; no describe datos, limitaciones ni sesgos.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica; el ajuste con un juez externo (`gpt-5.6-luna`) puede inducir comportamientos de "reward hacking" que optimicen la puntuacion del juez sin mejorar la correccion real.
- Entrenamiento parcialmente off-policy: con `max_off_policy_steps = 8`, parte de las muestras del grupo pueden proceder de politicas antiguas, lo que puede degradar la estabilidad del ajuste.
- Posible discrepancia de configuracion: el nombre del checkpoint indica la epoca 4 mientras que la config declara `learner_epoch = 3`.
- Discrepancia de contexto: la config de entrenamiento declara `seq_len = 300.000` frente a los 65.536 tokens de `max_model_len` en inferencia; no hay explicacion del autor.
- Idiomas soportados desconocidos: no se puede garantizar un comportamiento correcto fuera del ingles o del chino del modelo base.
- Especializacion estrecha: el ajuste sobre un dataset de filtrado de solvencia de 200 elementos autogenerados puede provocar sobreajuste al dominio y degradar capacidades generales.
- Sin pipeline declarado en HuggingFace: no hay una tarea asignada oficialmente, lo que complica su uso directo con las utilidades estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/qwen35-4b-filter-solvability-200-selfsource-4k-epoch4
- Dataset de entrenamiento citado: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-solvability-200-selfsource-4k
- Modelo base citado: https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente portales de ofertas de practicas (stage.fr, Indeed, Welcome to the Jungle, L'Etudiant), sin relacion con el modelo.

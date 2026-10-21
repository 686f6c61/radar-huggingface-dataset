# ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6-frozen-adam

## Resumen

E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6-frozen-adam es un checkpoint de investigación derivado de Qwen/Qwen3.8-27B (27.781.427.952 parámetros), publicado por el usuario ziyan98 dentro del experimento E2K (*experience-to-knowledge*). El objetivo del estudio es determinar si el conocimiento verificado que un modelo extrae de su propia partida en un juego puede escribirse en sus pesos mediante filas supervisadas y después mejorarse con aprendizaje por refuerzo sobre episodios reales de varios pasos. El escenario concreto es el juego `cd82-fb555c5d` de ARC-AGI-3, y este checkpoint corresponde a la iteración 6 de Megatron de la ejecución `sft_first_idd-cc`.

No se trata de una mejora de propósito general de Qwen3.8-27B: el entrenamiento se hizo sobre un único juego y la evaluación se limita a rollouts de 32 episodios de ese mismo juego. El propio autor advierte que las diferencias entre brazos no superan unas pocas décimas de retorno con forma (shaped return), con un ruido entre rollouts de aproximadamente 0,05, y que ningún brazo supera más de 2 de 32 episodios. La relevancia del checkpoint es metodológica: documenta una trayectoria concreta con los momentos de Adam congelados, un fallo de diseño que mantenía el paso de RL cerca de cero, y se conserva precisamente por ser una trayectoria distinta del mismo arranque supervisado.

Los pesos se publican en safetensors bf16 con el mismo conjunto de tensores y formas que el modelo base (1199 tensores); el stack de texto es el estado entrenado en Megatron y la torre de visión y la cabeza de predicción multi-token se copiaron sin cambios, ya que el entrenamiento fue exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.8 (tag de arquitectura `qwen3_5`), con torre de vision `model.visual.*` y cabeza de prediccion multi-token `mtp.*` copiadas del modelo base |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (la informacion no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors bf16 (1199 tensores: 851 en el stack de texto `model.language_model.*` + `lm_head`) |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 55,6 GB |
| Pipeline declarado | image-text-to-text (aunque el entrenamiento fue solo de texto) |
| Descargas / likes | 8 / 0 |
| Fecha de creacion | 2026-10-21 |
| Fecha de actualizacion | 2026-10-21 |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.8-27B y conserva su arquitectura y sus artefactos de configuracion, tokenizador, plantilla de chat, configuracion de generacion y procesador. El stack de texto (851 tensores) es el estado entrenado en Megatron-LM; la torre de vision (`model.visual.*`) y la cabeza MTP se copiaron bit a bit del checkpoint base porque nunca formaron parte del modelo de Megatron. El entrenamiento se ejecuto con slime v0.3.2 sobre 4 nodos GH200 de Isambard-AI, con paralelismo TP4 × PP4 en Megatron y 16 motores de rollout SGLang a tp=1, en bf16 y con backend flash-attn 2.8.3.

El regimen de entrenamiento combina una fase supervisada y otra de refuerzo. Las filas de SFT son 303 filas del arnes IDD (`rows_paired.jsonl.gz`): turnos de recitacion escritos por el mismo modelo con el bloque de conocimiento en contexto (las frases `recall_forms_v2` del conjunto de 391 afirmaciones) emparejados con filas de replay. El calendario comprende 2 rollouts solo de SFT (0-1), un reinicio de los momentos de Adam en la frontera SFT→RL y rollouts de Dr.GRPO del 2 al 8. La configuracion de RL usa `--advantage-estimator grpo --disable-grpo-std-normalization --calculate-per-token-loss`, un batch global de 4 episodios (unos 200 muestras por paso de optimizador), 8 pasos de optimizador por rollout de 32 episodios y una tasa de aprendizaje de 5e-6. El prompt de RL nunca contiene conocimiento.

La peculiaridad de esta iteracion 6 es que procede del primer intento de la ejecucion (2026-09-16/17), en el que los momentos de Adam acumulados durante el calentamiento supervisado se arrastraron al RL sin reiniciar y mantuvieron el paso de RL practicamente a cero (movimiento de politica unas 5 veces por debajo de la linea base). La ejecucion se relanzo desde la iteracion 1 con reinicio de Adam y esas iteraciones se publican sin el sufijo `-frozen-adam`. El arnes de juego emplea Claude Code CLI 2.1.270 sobre las herramientas MCP `look`, `act` y `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, 40 decisiones por episodio y hasta cuatro niveles; la recompensa es el numero de niveles superados mas un retorno con forma, y los niveles de test 5-6 nunca se juegan.

## Capacidades

- Generacion de texto conversacional en el formato de chat del modelo base, con la plantilla y el tokenizador originales de Qwen3.8-27B.
- Juego interactivo por turnos sobre ARC-AGI-3 mediante herramientas MCP: percepcion con `look`, accion con `act` y consulta de estado con `status`.
- Recitacion de conocimiento inyectado en contexto: el modelo fue entrenado con turnos que reproducen afirmaciones de un conjunto de 391 afirmaciones, en la variante de frase `recall_forms_v2`.
- Razonamiento multi-paso con cadena de pensamiento extensa: la mediana de tokens de pensamiento por rollout se situa entre 5156 y 6887,5 tokens.
- Capacidad declarada de procesamiento image-text-to-text por herencia del modelo base y del pipeline, aunque la torre de vision no se entreno ni el actor vio imagenes durante el experimento.
- No se dispone de informacion sobre soporte de function calling generico, uso de agentes fuera del arnes descrito ni cobertura multilingue.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el checkpoint sirve como punto de comparacion para estudiar si el conocimiento verificado en contexto puede consolidarse en los pesos y como afecta al comportamiento posterior, usando el par de rollouts 2-8 como referencia.
- Reproduccion de experimentos de RL con Dr.GRPO: el repositorio incluye `megatron/args.json`, `common.pt`, `latest_checkpointed_iteration.txt` y el cursor de datos `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (sin momentos de optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Estudio de fallos de optimizacion: al conservarse una trayectoria con momentos de Adam congelados, resulta util para analizar por que el paso de RL se colapsa y para calibrar diagnosticos de movimiento de politica en entrenamientos con calentamiento supervisado.
- Analisis de agentes sobre entornos con acciones discretas: el modelo puede conectarse a un servidor MCP y operar el bucle percepcion-accion-estado en un entorno tipo ARC-AGI-3 con 40 decisiones por episodio.
- Evaluacion de recitacion y atribucion: las metricas de turnos recitados (0,000 en todos los rollouts) y de turnos con referencia a fuente (0,272-0,436) permiten medir si el modelo cita el conocimiento que se le proporciono.
- Base para experimentos de investigacion comparada: al mantener exactamente el juego de tensores y formas del modelo base, se puede cargar con `transformers` y comparar directamente con Qwen3.8-27B sin adaptadores de conversion.
- No se recomienda su uso como asistente de produccion para tareas generales: el ajuste esta acotado a un unico juego y no hay evidencia de mejora fuera de el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas publicadas son las de juego del arnes ARC-AGI-3, por rollout:

| job | rollout | clear rate | shaped return | step change | step no-op | think tokens p50 | recited turns | source-ref turns |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619232 | 2 | 0,000 | -0,148 | 0,090 | 0,347 | 5563,500 | 0,000 | 0,436 |
| 6647952 | 2 | 0,031 | 0,011 | 0,078 | 0,313 | 5814,000 | 0,000 | 0,426 |
| 6619232 | 3 | 0,000 | -0,062 | 0,056 | 0,322 | 5668,000 | 0,000 | 0,384 |
| 6624050 | 3 | 0,031 | -0,094 | 0,054 | 0,332 | 5156,000 | 0,000 | 0,356 |
| 6647952 | 3 | 0,031 | 0,084 | 0,045 | 0,330 | 5525,000 | 0,000 | 0,318 |
| 6624050 | 4 | 0,000 | -0,203 | 0,043 | 0,343 | 6497,500 | 0,000 | 0,422 |
| 6647952 | 4 | 0,031 | 0,084 | 0,041 | 0,349 | 5622,500 | 0,000 | 0,358 |
| 6624050 | 5 | 0,031 | -0,203 | 0,033 | 0,342 | 6598,500 | 0,000 | 0,428 |
| 6647952 | 5 | 0,031 | 0,206 | 0,081 | 0,310 | 5377,000 | 0,000 | 0,354 |
| 6624050 | 6 | 0,000 | -0,133 | 0,040 | 0,317 | 6887,500 | 0,000 | 0,397 |
| 6647952 | 6 | 0,031 | 0,189 | 0,082 | 0,306 | 5595,500 | 0,000 | 0,373 |
| 6647952 | 7 | 0,031 | 0,100 | 0,090 | 0,318 | 5211,000 | 0,000 | 0,339 |
| 6647952 | 8 | 0,000 | 0,252 | 0,093 | 0,272 | 5367,000 | 0,000 | 0,362 |

Contexto de lectura aportado por el autor: el primer rollout de RL tras un bloque solo de SFT lo juega la politica supervisada, de modo que mide el efecto de las filas por si solas; el ruido entre rollouts de un mismo brazo es de aproximadamente 0,05 de retorno con forma. Ningun brazo supera 2 de 32 episodios.

## Requisitos de hardware

- Pesos en bf16: 27,78 B de parametros a 2 bytes por parametro, aproximadamente 55,6 GB (coincide con el tamano del repositorio). Es el minimo absoluto de VRAM para cargar el checkpoint sin cuantizar, antes de cache KV y activaciones.
- Inferencia en bf16/fp16: requiere GPU de 80 GB (A100 80 GB, H100 80 GB, H200) o sharding en varias GPU. No cabe en una RTX 4090 de 24 GB ni en dos (48 GB).
- Cuantizacion a 8 bits (estimacion): en torno a 28 GB de pesos, lo que exige una GPU de 48 GB (A6000 Ada, L40S) o dos consumer de 24 GB con paralelismo de tensor.
- Cuantizacion a 4 bits (estimacion): en torno a 14-16 GB de pesos, por lo que cabria en una RTX 4090, RTX 3090 o RTX 4080 de 16 GB, con margen limitado para cache KV en contextos largos.
- Entrenamiento de referencia: 4 nodos GH200 (Isambard-AI) con Megatron-LM TP4 × PP4 y 16 motores SGLang a tp=1; el ajuste fino completo no es viable en hardware consumer.
- Opciones de despliegue: `transformers` (libreria declarada), SGLang (usado en el entrenamiento), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6-frozen-adam | 27,78 B | no disponible | SFT (303 filas) + Dr.GRPO sobre un juego de ARC-AGI-3 | apache-2.0 | HuggingFace, 8 descargas, safetensors bf16 |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B (mismo conjunto de 1199 tensores) | no disponible | no disponible en la informacion | no verificada en la informacion | HuggingFace, referencia publica del autor |
| Otros checkpoints de la misma serie E2K | mismo tamano (derivados del mismo base) | no disponible | variantes de brazo del mismo experimento (por ejemplo, la relanzada sin `-frozen-adam`) | apache-2.0 | publicados por el mismo autor, series del mismo run |

No se dispone de datos de benchmarks de modelos alternativos de tamano comparable en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es una mejora de proposito general: se entreno sobre un unico juego (`cd82-fb555c5d`) y se evaluo unicamente con rollouts de 32 episodios de ese juego. El autor lo declara explicitamente.
- Rendimiento marginal: ningun brazo supera 2 de 32 episodios y las diferencias entre brazos son de unas pocas decimas de retorno con forma, con ruido de aproximadamente 0,05 entre rollouts.
- Momento de Adam congelado: esta iteracion proviene de un intento en el que el paso de RL quedo practicamente a cero (movimiento de politica unas 5 veces por debajo de la linea base), por lo que su comportamiento refleja sobre todo la fase supervisada.
- Torre de vision no entrenada: pese al pipeline `image-text-to-text`, `model.visual.*` y `mtp.*` se copiaron sin cambios del checkpoint base y el actor nunca vio una imagen. Cualquier uso multimodal hereda el comportamiento del base, no el de este ajuste.
- Volumen de datos muy reducido: 303 filas de SFT y 8 rollouts de RL; riesgo alto de sobreajuste al juego y de resultados no extrapolables.
- Tasa de recitacion nula: los turnos recitados son 0,000 en todos los rollouts, lo que sugiere que el conocimiento no se reproduce de forma literal y cuestiona la internalizacion efectiva.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de comportamiento fuera del dominio; el modelo puede generar afirmaciones plausibles sin base.
- Idiomas y contexto: no disponibles; no hay evidencia de calidad multilingue ni de comportamiento en ventanas largas.
- Licencia apache-2.0 para este checkpoint, pero al derivar de Qwen/Qwen3.8-27B conviene verificar las condiciones del modelo base antes de un uso comercial.
- Uso previsto: investigacion y reproduccion experimental, no produccion en tareas generales ni atencion al cliente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-sft_first_idd-cc-iter6-frozen-adam
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios de codigo ni demos adicionales.

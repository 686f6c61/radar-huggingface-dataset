# Stage-org/4b-strat-300-4b-z-epoch3

## Resumen

Stage-org/4b-strat-300-4b-z-epoch3 es un modelo de lenguaje de 4,54 mil millones de parámetros (4.539.265.536, según los pesos en safetensors) publicado por la organizacion Stage-org. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-4B, segun se desprende de la unica seccion de la model card, dedicada a la procedencia del entrenamiento. El repositorio contiene exclusivamente los pesos en safetensors (9,1 GB, equivalente a unos 16 bits por parametro, es decir, bf16/fp16), sin informacion de licencia, idiomas, pipeline ni evaluacion.

El interes del modelo es fundamentalmente metodologico: la configuracion publicada documenta un pipeline de RL relativamente inusual (metodo `rl` con `group_size = 8`, funcion de perdida con enmascarado DPPO entre 0,2 y 0,28, `adv_tau = 1.0`, `kl_tau = 0.001` y optimizador AdamW con learning rate 1e-06), ejecutado con el framework prime_rl sobre 2 GPU por nodo (1 para inferencia con vLLM y 1 para entrenamiento). El reward no proviene de verificadores programaticos, sino de un juez abierto servido por API (`gpt-5.6-luna`, con `reasoning_effort = medium`), lo que condiciona la reproducibilidad del entrenamiento.

Se trata de un checkpoint de la epoca 3 de un run con 10.000 pasos de aprendizaje, `batch_size = 128` y `seq_len = 300000`, con decodificacion en modo thinking habilitada durante la generacion de rollouts (`enable_thinking = true`, temperatura 0,9, hasta 4.096 tokens). No hay resultados de benchmarks, no se declara licencia y el modelo acumula 0 descargas y 0 likes, por lo que debe considerarse un artefacto de investigacion en fase temprana y no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; el tag del repositorio es `qwen3_5`). No se especifica si es denso o MoE |
| Parametros totales | 4.539.265.536 (~4,54 mil millones), dato derivado de los pesos en safetensors |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | Entrenamiento: `seq_len = 300000` en la configuracion. Inferencia: `max_model_len = 65536` en la configuracion de vLLM. No hay validacion publicada de ninguna de las dos cifras |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican variantes GGUF, AWQ ni GPTQ). El peso de 9,1 GB para 4,54 B de parametros implica precision de 16 bits, presumiblemente bf16 |
| Idiomas soportados | no disponible (la model card no incluye seccion de idiomas ni el repositorio declara lista de lenguas) |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors (`weights_only = true` en el checkpoint del entrenador; el flag `language_model_only = true` sugiere que solo se exportan los pesos del modelo de lenguaje) |

## Arquitectura y entrenamiento

No se describe la arquitectura en la model card. Los unicos indicios son el modelo base declarado, Qwen/Qwen3.5-4B, y el tag `qwen3_5` del repositorio, que apuntan a un transformer decoder-only de la familia Qwen3.5 con atencion estandar (la configuracion de entrenamiento activa `flash_attention_2` para el calculo de atencion). El flag `language_model_only = true` en los extras de vLLM indica que solo se sirve la parte de lenguaje, lo que sugiere que el modelo base podria incluir componentes adicionales (por ejemplo, vision) que no se han exportado; es una inferencia a partir de la configuracion, no un dato confirmado por el autor.

El entrenamiento es un ajuste por refuerzo en linea con el framework prime_rl: 10.000 pasos de aprendizaje sobre 3 epocas, `batch_size = 128`, `group_size = 8` (ocho muestras por prompt, esquema tipo GRPO), hasta 256 rollouts en vuelo y un maximo de 8 pasos fuera de politica (`max_off_policy_steps = 8`). La generacion de rollouts usa temperatura 0,9, `top_p = 1.0`, 4.096 tokens maximos y modo thinking activado. La perdida combina una mascara DPPO con umbrales bajo/alto de 0,2 y 0,28, `adv_tau = 1.0` y un coeficiente KL de 0,001, con AdamW a 1e-06, `weight_decay = 0.0`, `beta1 = 0.9`, `beta2 = 0.99` y recorte de gradiente de 1.0. Las recompensas de tareas abiertas las emite un juez remoto (`gpt-5.6-luna`) con `reasoning_effort = medium`, hasta 32 peticiones concurrentes y 3 reintentos con retroceso de 1 s. El dataset de origen se referencia como `Stage-org/4b-strat-300-4b-z` con `type = "new_task"` y ruta vacia, la semilla del bucle es 7 y la sincronizacion de pesos entre entrenador e inferencia se hace por sistema de ficheros.

Un detalle relevante para la reproducibilidad es el desajuste entre el `seq_len` de entrenamiento (300.000) y el `max_model_len` de inferencia (65.536): no hay documentacion que explique si el modelo fue realmente entrenado con secuencias de 300.000 tokens o si ese valor responde a otra convencion, ni si mantiene calidad mas alla de 65.536 tokens. Aplicando la aritmetica de la configuracion, `batch_size x seq_len` daria 38,4 millones de tokens por paso, cifra que no debe tomarse como presupuesto real de entrenamiento de RL sin confirmacion del autor.

## Capacidades

- Generacion de texto autoregresiva en el modo estandar y en modo thinking (`enable_thinking = true` durante la generacion de rollouts).
- Razonamiento multi-paso con trazas de pensamiento, con un limite de 4.096 tokens por generacion segun la configuracion de entrenamiento.
- Tool calling / function calling: la configuracion de vLLM declara explicitamente `tool_call_parser = "qwen3_coder"`, lo que implica soporte de llamadas a herramientas en formato Qwen3 Coder.
- Parseo de razonamiento mediante `reasoning_parser = "qwen3"`, es decir, separacion estructurada del bloque de pensamiento respecto de la respuesta final.
- Capacidades multilingues: no verificadas. No se declara lista de idiomas; al derivar de Qwen3.5-4B es probable que conserve parte del comportamiento multilingue del base, pero no hay datos que lo confirmen.
- Capacidades de vision, audio u otras modalidades: no disponibles. El flag `language_model_only` sugiere que, en caso de existir, no se sirven desde este repositorio.
- No hay evidencia publicada de rendimiento en codigo, matematicas o tareas agente mas alla de la presencia de los parsers de herramientas; no se debe asumir calidad en esas areas sin evaluacion propia.

## Casos de uso

- Evaluacion de pipelines de RL: el repositorio sirve como punto de partida para reproducir o auditar un ciclo de RL con juez LLM, dado que la model card publica la configuracion completa (grupo, perdida, hiperparametros y esquema de despliegue). Es util para grupos de investigacion que comparen variantes de reward y de enmascarado DPPO.
- Base para fine-tuning posterior: con 4,54 B de parametros en bf16 (9,1 GB), el modelo cabe en una GPU de 24 GB y puede usarse como inicializacion en experimentos de SFT o DPO sin necesidad de infraestructura multi-nodo.
- Prototipado de agentes con tool calling: los parsers `qwen3` y `qwen3_coder` configurados en vLLM permiten levantar un endpoint compatible con OpenAI en el puerto 7001 y probar flujos de llamadas a herramientas en un solo GPU.
- Investigacion sobre modo thinking: permite estudiar como afecta la generacion con trazas de razonamiento al comportamiento del modelo bajo temperatura 0,9 y `top_p = 1.0`, condiciones documentadas en la configuracion de rollouts.
- Comparativa de checkpoints intermedios: al existir un esquema de checkpoints cada 1.000 unidades con `keep_last = 1`, este artefacto de la epoca 3 permite analizar la evolucion del modelo a lo largo del run frente a otros checkpoints del mismo dataset.
- Servicio interno de bajo coste: con un unico GPU de inferencia y `gpu_memory_utilization = 0.9`, puede desplegarse en vLLM para tareas de generacion interna en entornos controlados, siempre que se resuelva antes la ausencia de licencia.
- Experimentacion sobre juez externo como reward: el modelo es un caso de estudio de RL con recompensa provista por un modelo propietario, util para analizar coste, latencia y sesgos de ese esquema frente a verificadores programaticos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier flujo con datos de terceros mientras no exista licencia declarada, evaluacion publicada y politica de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion en la model card, y la busqueda web no ha devuelto informacion tecnica relevante sobre este modelo (los resultados obtenidos correspondian a dominios sin relacion, como plataformas de streaming). Tampoco se publican curvas de recompensa, tasas de aceptacion del juez ni metricas de entrenamiento.

## Requisitos de hardware

- Peso del modelo: ~9,1 GB en safetensors a 16 bits (bf16/fp16), coherente con 4,54 B de parametros.
- VRAM estimada para inferencia en bf16: los pesos solos ocupan unos 9,1 GB; con la cache KV, vLLM y margenes de trabajo, un despliegue practico con contexto moderado requiere del orden de 12-16 GB. La configuracion publicada reserva hasta el 90 % de la memoria disponible (`gpu_memory_utilization = 0.9`).
- Cabe en GPU de consumo: si, es viable en tarjetas de 24 GB (RTX 3090, RTX 4090, RTX 5090) con contexto reducido; en tarjetas de 16 GB requeriria cuantizacion a 8 o 4 bits, no publicada por el autor.
- GPUs recomendadas: para inferencia a 65.536 tokens de contexto conviene una GPU con 40-80 GB (A100 40/80 GB, H100 80 GB, L40S 48 GB). Para entrenamiento o RL, la configuracion documentada usa 2 GPU por nodo (1 de inferencia y 1 de entrenamiento), por lo que un nodo de 2 x A100/H100 reproduce el esquema.
- Opciones de despliegue: vLLM es la ruta documentada por el propio autor (con `max_model_len = 65536`, `language_model_only = true`, `reasoning_parser = qwen3` y `tool_call_parser = qwen3_coder`, servidor en el puerto 7001 y API compatible con `/v1`). Al no publicarse pesos GGUF, llama.cpp u Ollama requeririan una conversion previa no verificada; TGI y otros servidores serian compatibles en principio con safetensors, pero no estan documentados.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, time to first token ni comportamiento bajo carga concurrente.
- Entrenamiento posterior: el optimizador configurado (AdamW) y el recorte de gradiente a 1.0 son reproducibles en una sola GPU de 80 GB para SFT con secuencias cortas, aunque la longitud de secuencia de 300.000 tokens declarada exige tecnicas de paralelismo o atencion eficiente que la model card no detalla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stage-org/4b-strat-300-4b-z-epoch3 | 4,54 B | 300.000 (entrenamiento) / 65.536 (inferencia declarada) | sin benchmarks publicados | no disponible | safetensors, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base declarado) | no disponible en la informacion (la familia es de ~4 B) | no disponible | no disponible | no disponible | referenciado como base en la configuracion de entrenamiento |
| Otras alternativas de ~4 B (Qwen3-4B, Llama 3.2 3B, Phi-4-mini, Gemma 2 2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa de rendimiento: no hay resultados de benchmarks para este checkpoint ni datos en la informacion proporcionada sobre los modelos alternativos. La unica comparacion factible es la de procedencia: se trata de un derivado por RL de Qwen/Qwen3.5-4B, por lo que su comportamiento estara acotado por el del base, sin que existan mediciones que cuantifiquen la mejora o el deterioro introducidos por el entrenamiento.

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. En la practica, esto bloquea su adopcion en produccion hasta que el autor lo aclare, y ademas el modelo base Qwen3.5-4B tiene sus propias condiciones que habria que respetar.
- Sin evaluacion publicada: no hay benchmarks, ni evaluaciones de seguridad, ni analisis de sesgos. Cualquier afirmacion de calidad seria especulativa.
- Riesgo de alucinacion no medido: al ser un modelo ajustado por RL con recompensa de un juez LLM (y no de verificadores programaticos), puede haber optimizado hacia el estilo o las preferencias del juez (`gpt-5.6-luna`) en lugar de hacia la correccion factual.
- Dependencia del juez externo: parte del reward se obtiene mediante una API propietaria, lo que hace el entrenamiento no reproducible de forma completa sin acceso a ese servicio.
- Desajuste de contexto: la configuracion de entrenamiento declara `seq_len = 300000` mientras que la de inferencia limita `max_model_len` a 65.536. No hay evidencia de calidad en contextos largos, y el comportamiento mas alla de 65.536 tokens no esta soportado por la configuracion de servicio.
- Idioma no declarado: no se documentan idiomas soportados ni se ha validado el rendimiento en castellano.
- Artefacto de investigacion sin traccion: 0 descargas y 0 likes, creado y actualizado con un minuto de diferencia, y con solo una seccion de procedencia en la model card (sin descripcion, sin ejemplos de uso y sin prompt template). El nombre indica que es la epoca 3 y que solo se conservo el ultimo checkpoint (`keep_last = 1`).
- Formato unico: no hay cuantizaciones publicadas, lo que obliga a cuantizar por cuenta propia si se necesita ejecutar en hardware limitado, con el consiguiente riesgo de degradacion no medido.
- Advertencia de fecha: los metadatos indican creacion en septiembre de 2026, fecha posterior a la de redaccion habitual de fichas tecnicas; conviene verificar la vigencia del repositorio antes de usarlo.
- Uso responsable: no debe emplearse en decisiones automatizadas que afecten a personas, ni con datos personales, mientras no existan licencia, evaluacion y documentacion de sesgos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Stage-org/4b-strat-300-4b-z-epoch3
- Modelo base declarado en la configuracion de entrenamiento: https://huggingface.co/Qwen/Qwen3.5-4B (no verificado como enlace publico en la informacion disponible)
- Dataset de entrenamiento referenciado: `Stage-org/4b-strat-300-4b-z` (referencia textual en la configuracion; no se ha confirmado su disponibilidad publica)
- Framework de RL citado en la configuracion: prime_rl (referencia textual; no se ha proporcionado URL)
- Paper, blog o demo: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

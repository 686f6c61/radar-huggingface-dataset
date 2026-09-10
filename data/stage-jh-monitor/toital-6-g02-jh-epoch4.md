# Stage-jh-monitor/toital-6-G02-jh-epoch4

## Resumen

`Stage-jh-monitor/toital-6-G02-jh-epoch4` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario `Stage-jh-monitor` dentro de un flujo de trabajo automatizado de entrenamiento identificado como `jh-workflow`. El repositorio contiene pesos en formato safetensors con 4.539.265.536 parametros (aproximadamente 4,54 mil millones), lo que situa al modelo en la categoria de modelos densos de rango medio. El espacio de nombres, la estructura del repositorio y los campos de la model card indican que se trata de un artefacto de investigacion o de un experimento interno, no de un lanzamiento de producto.

El modelo se entreno mediante RL sobre un dataset denominado `Stage-org/toital-6-G02-jh`, con 10.000 pasos de aprendizaje declarados, 8 epocas y un tamano de lote de 48. La configuracion de generacion durante el entrenamiento activa el modo de razonamiento (`enable_thinking = true`) y emplea parsers especificos de Qwen para razonamiento (`qwen3`) y llamadas a herramientas (`qwen3_coder`), lo que sugiere que el objetivo del ajuste era reforzar comportamiento de razonamiento y uso de herramientas.

Su relevancia practica es limitada en el momento de redactar esta ficha: no se ha publicado licencia, no se declaran idiomas soportados, no hay resultados de benchmarks ni pipeline de inferencia, y el repositorio acumula 0 descargas y 0 "likes". La utilidad principal de esta ficha es documentar de forma rigurosa que se puede y que no se puede afirmar sobre el modelo a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explicitamente; la etiqueta `qwen3_5` y el modelo base declarado (`Qwen/Qwen3.5-4B`) apuntan a la familia Qwen3.5 |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 65.536 tokens segun `max_model_len` de la configuracion de inferencia del entrenamiento; el valor maximo oficial del modelo base no se especifica |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (9,1 GB en el repositorio, coherente con pesos en BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste por RL del checkpoint `Qwen/Qwen3.5-4B`. La configuracion de entrenamiento (`schema_version = "stage.config.v7"`) declara `method = "rl"`, un optimizador AdamW con tasa de aprendizaje 1e-6, `weight_decay = 0.0`, `max_norm = 0.5` y betas 0,9 / 0,995, junto con un planificador de tasa constante. La perdida usa el esquema `default` con enmascaramiento DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 1e-3`, lo que implica un regularizador KL suave respecto al modelo de referencia. La generacion durante el entrenamiento usa `group_size = 16`, temperatura 0,9, `top_p = 1.0`, hasta 4.096 tokens por muestra y modo de pensamiento activado.

El bucle de RL se apoya en un juez externo de final abierto servido mediante endpoint (`gpt-5.6-luna`), con hasta 3 reintentos, temperatura 1.0 y `reasoning_effort = "medium"`, lo que indica que parte de la senal de recompensa proviene de evaluaciones generadas por otro modelo en lugar de un verificador determinista. La infraestructura de entrenamiento usa 2 GPU por nodo (1 para inferencia y 1 para entrenamiento), vLLM con `gpu_memory_utilization = 0.9`, atencion `flash_attention_2`, `max_inflight_rollouts = 144` y `max_off_policy_steps = 2` con `weight_broadcast_type = "filesystem"`. No se documenta la composicion del dataset, su numero de tokens ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generacion de texto autoregresiva, con modo de razonamiento explicito habilitado durante el entrenamiento (`enable_thinking = true`).
- Razonamiento multi-paso, inferido del uso del parser de razonamiento `qwen3` en la configuracion de inferencia del entrenamiento.
- Llamada a herramientas y funciones, inferida del parser `tool_call_parser = "qwen3_coder"` y del campo `language_model_only = true`.
- Codigo: el parser de tool calling empleado esta asociado al perfil de codigo de la familia Qwen, aunque no se publican evaluaciones que lo confirmen.
- Capacidades heredadas del modelo base Qwen3.5-4B: no verificadas ni documentadas en esta model card.
- Capacidades multilinguies: no disponible.
- Vision, audio u otras modalidades: no disponible (no se declaran ni se referencian en la configuracion).
- Soporte de agentes: no documentado explicitamente; la configuracion contempla `environment_id` para `agent_rl`, pero el valor esta vacio en este entrenamiento.

Nota: todas las capacidades listadas se deducen de la configuracion de entrenamiento, no de evaluaciones publicadas. No se ha publicado ninguna validacion funcional del checkpoint resultante.

## Casos de uso

- Investigacion sobre RL aplicado a modelos de 4B: el repositorio documenta la configuracion completa de entrenamiento (optimizador, perdida, juez, infraestructura), lo que permite reproducir o auditar el proceso en entornos de investigacion academica.
- Experimentacion con razonamiento y uso de herramientas en modelos compactos: el ajuste se realizo con parsers de tool calling y modo de pensamiento activos, por lo que es un candidato para prototipos de agentes ligeros en una sola GPU.
- Despliegue en entornos con recursos limitados: con 4,54 mil millones de parametros, el modelo se puede servir en una GPU de consumo de gama alta con pesos en BF16, algo inviable para modelos de 70B.
- Evaluacion comparativa de tecnicas de RL con juez LLM: permite estudiar como afecta un juez externo de final abierto al comportamiento final del modelo.
- Generacion de codigo asistida en prototipos internos: el parser `qwen3_coder` sugiere soporte de llamadas a herramientas, adecuado para asistentes de codigo en fase de prueba, siempre que la licencia se aclare.
- Base para ajustes posteriores (SFT, DPO o cuantizacion): al estar en safetensors estandar, se puede usar como punto de partida para pipelines propios, siempre con cautela al no existir evaluaciones.
- Analisis de deriva respecto al modelo base: util para medir cuanto cambia un modelo de 4B tras 10.000 pasos de RL sobre un dataset de tarea especifica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- Peso de los pesos: 9,1 GB en el repositorio, coherente con 4,54 mil millones de parametros en BF16 (4,539 x 10^9 x 2 bytes = 9,08 GB).
- VRAM estimada para inferencia en BF16: aproximadamente 10-12 GB con contexto corto, sumando pesos, activaciones y overhead del runtime. Es una estimacion aritmetica, no un dato publicado.
- VRAM con contexto largo: el KV cache para 65.536 tokens puede igualar o superar el tamano de los pesos. El calculo exacto no es posible sin conocer el numero de capas, cabezas y dimension de cabeza del modelo base.
- Cuantizacion: no hay pesos cuantizados publicados. Las cifras a 8 bits (aproximadamente 4,6 GB) y a 4 bits (aproximadamente 2,4 GB) son estimaciones derivadas del numero de parametros.
- GPU recomendadas: una RTX 4090 (24 GB) o A6000 (48 GB) es suficiente para BF16 con contexto moderado; A100 40/80 GB o H100 para lotes grandes y contexto largo. Una RTX 3060 de 12 GB queda al limite en BF16 y requeriria cuantizacion.
- GPU de consumo: si, cabe en tarjetas de 24 GB en BF16 y en tarjetas de 8-12 GB solo tras cuantizacion propia, ya que no se distribuyen pesos GGUF.
- Opciones de despliegue: vLLM es el unico motor documentado, usado durante el entrenamiento con `gpu_memory_utilization = 0.9` y `language_model_only = true`. Otros motores como llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible y requeririan conversion de formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Stage-jh-monitor/toital-6-G02-jh-epoch4` | 4,54 mil millones | 65.536 tokens segun configuracion de entrenamiento | Sin benchmarks publicados | No disponible | Repositorio safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base declarado) | No disponible | No disponible | No disponible | No disponible | Referenciado como origen del ajuste |
| Otras alternativas de ~4B (Llama, Gemma, Phi, etc.) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en esta busqueda |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable. La unica comparacion sustentada por la informacion proporcionada es la relacion de derivacion entre este checkpoint y `Qwen/Qwen3.5-4B`.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere aclarar este punto primero.
- Ausencia total de evaluaciones: no hay benchmarks, ni pruebas de regresion, ni validacion funcional publicada. No se puede afirmar que el ajuste por RL haya mejorado al modelo base.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de redactar la ficha, lo que reduce la probabilidad de que existan informes independientes de terceros.
- Senal de recompensa dependiente de un juez externo propietario (`gpt-5.6-luna`): el modelo puede haber aprendido sesgos o preferencias estilisticas del juez, incluida la tendencia a generar respuestas largas o con formato concreto.
- Dataset no descrito: el campo `[dataset]` tiene `type = "new_task"` y `path` vacio, por lo que se desconoce la composicion, el tamano y la procedencia de los datos de entrenamiento.
- Riesgo de sobreajuste: 8 epocas declaradas sobre 10.000 pasos con un unico juez pueden degradar la generalidad del modelo fuera del dominio de la tarea.
- Inconsistencia en el nombrado: el repositorio se llama `epoch4` mientras la configuracion declara `learner_epoch = 8` y `keep_last = 1`. No esta claro que checkpoint concreto contiene el repositorio.
- Riesgo de alucinacion: inherente a cualquier modelo de 4B ajustado por RL sin verificador determinista. No hay datos que permitan cuantificarlo.
- Idiomas soportados no declarados: se desconoce el comportamiento multilingue y no se puede asumir un buen rendimiento en castellano.
- Limitaciones de contexto: aunque la configuracion de entrenamiento usa 65.536 tokens, no hay evidencia de que el modelo mantenga calidad en ventanas de esa longitud.
- Ausencia de pesos cuantizados: desplegar en hardware modesto exige realizar la cuantizacion por cuenta propia, con el riesgo de degradacion adicional no medida.
- Trazabilidad limitada: el autor es un espacio de nombres con pinta de pipeline automatizado, sin documentacion adicional, paper ni repositorio de codigo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/toital-6-G02-jh-epoch4
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/toital-6-G02-jh
- Paper, blog o repositorio de codigo: no disponible
- Demos: no disponible
- Nota sobre la busqueda web: los resultados obtenidos corresponden a portales de ofertas de practicas (stage.fr, idstages.laregion.fr, welcometothejungle.com, 1jeune1solution.gouv.fr) y no guardan relacion con el modelo. No se han encontrado enlaces tecnicos relevantes.

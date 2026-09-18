# Stage-jh-monitor/4b-B-200-luna-8k-epoch4

## Resumen

4b-B-200-luna-8k-epoch4 es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Stage-jh-monitor en HuggingFace. Se trata de un artefacto experimental generado dentro de un flujo de trabajo automatizado de entrenamiento (identificado como "jh-workflow"), cuyo objetivo aparente es producir un modelo de razonamiento entrenado con un juez externo en lugar de con preferencias humanas anotadas.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,54 mil millones) y se distribuye unicamente en formato safetensors, con un repositorio de 9,1 GB, lo que corresponde a pesos en precision de 16 bits. La model card no incluye informacion sobre licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluacion, por lo que la mayor parte de los datos tecnicos habituales no estan disponibles.

Su relevancia es limitada y muy especifica: se trata de un checkpoint de investigacion con cero descargas y cero valoraciones, sin documentacion de rendimiento. Resulta de interes unicamente como ejemplo de pipeline de RL sobre un modelo pequeno con decodificacion en modo "thinking" y tool calling, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el tag qwen3_5 y la configuracion de entrenamiento parten de Qwen/Qwen3.5-4B, lo que apunta a un transformer decoder-only |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | No disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible oficialmente. La configuracion de entrenamiento declara seq_len = 300000 y la de inferencia max_model_len = 65536 |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de forma explicita. Los metadatos disponibles (tag qwen3_5 y el campo learner.model = "Qwen/Qwen3.5-4B") indican que se trata de un ajuste del modelo Qwen3.5-4B, del que no se detallan en la informacion proporcionada ni el numero de capas, ni el tipo de atencion, ni la composicion del vocabulario.

El entrenamiento se realizo con metodo RL (learner.method = "rl"), partiendo del dataset Stage-org/4b-B-200-luna-8k, durante 10000 pasos con batch_size = 128 y 3 epocas declaradas (aunque el nombre del checkpoint indica "epoch4"). La optimizacion usa AdamW con learning rate 1e-06, weight decay 0.0, max_norm 1.0 y betas (0.9, 0.99). El bucle de RL emplea group_size = 8, hasta 256 rollouts en vuelo y un maximo de 8 pasos fuera de politica, con atencion FlashAttention-2. La senal de recompensa proviene de un juez externo servido por API (modelo "gpt-5.6-luna", reasoning_effort = "medium"), no de anotaciones humanas, con reintentos limitados a 3 y backoff de 1 segundo. La generacion del rollout usa temperatura 0.9, top_p 1.0 y max_tokens 4096, con enable_thinking activado. La inferencia durante el entrenamiento se sirvio con vLLM usando reasoning_parser = "qwen3" y tool_call_parser = "qwen3_coder", lo que confirma soporte de modo razonamiento y de llamadas a herramientas.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": la configuracion de generacion activa enable_thinking = true y el parser de razonamiento declarado es qwen3, por lo que el modelo esta preparado para emitir cadenas de razonamiento antes de la respuesta final.
- Tool calling / function calling: la configuracion de inferencia especifica tool_call_parser = "qwen3_coder", lo que indica soporte de llamadas a funciones en formato compatible con el ecosistema Qwen.
- Capacidades heredadas del modelo base Qwen3.5-4B (generacion, codigo, matematicas y multilingueismo) segun el comportamiento tipico de dicha familia, si bien no hay evaluacion publicada que lo confirme para este checkpoint.
- Capacidades de agente multi-paso: no confirmadas documentalmente; el soporte de tool calling es un prerequisito, pero no hay evidencia de entrenamiento especifico en tareas de agente.
- Vision o audio: no disponible; la propia configuracion de vLLM declara language_model_only = true, lo que apunta a que el entrenamiento solo afecto a la torre de lenguaje.
- Idiomas: no disponible.

## Casos de uso

- Investigacion sobre RL con juez automatico: el checkpoint sirve para reproducir o auditar un pipeline de RL donde la recompensa la genera un modelo juez externo en lugar de anotadores humanos, comparando la evolucion entre la epoca 3 declarada y el checkpoint etiquetado como epoca 4.
- Experimentos de razonamiento con modo "thinking": permite estudiar como un ajuste por RL sobre un modelo de 4,5B altera la longitud y la calidad de las cadenas de razonamiento, dado que el entrenamiento y la inferencia fuerzan enable_thinking.
- Pruebas de integracion con vLLM: al haberse servido con vLLM, reasoning_parser qwen3 y tool_call_parser qwen3_coder, es un candidato directo para validar pipelines de servicio con parsing de razonamiento y de tool calls.
- Evaluacion de estabilidad de ajustes por RL: util para medir deriva de comportamiento (olvido catastrofico, colapso de diversidad) tras 10000 pasos de RL con learning rate 1e-06 sobre un modelo base pequeno.
- Base para experimentos de destilacion o comparacion de checkpoints: al existir varios checkpoints por epoca, permite analizar la curva de aprendizaje del bucle de RL.
- Prototipado interno no comercial de asistentes con llamadas a herramientas: solo si se resuelve previamente la ambiguedad de licencia, dado que la licencia del artefacto no esta declarada.
- No se recomienda su uso en produccion con usuarios finales: cero descargas, cero valoraciones, ausencia de benchmarks y de model card tecnica real hacen inviable una evaluacion de riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo (unicamente paginas de ofertas de practicas sin relacion con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9-10 GB solo para los pesos, mas el cache KV, que con contexto de 65536 tokens puede anadir varios GB adicionales segun el numero de secuencias concurrentes.
- VRAM estimada en int8: aproximadamente 5-6 GB de pesos; en 4 bits, aproximadamente 3-4 GB, siempre que se generen cuantizaciones propias, ya que el repositorio solo publica safetensors.
- GPU recomendadas: una A100 40 GB o H100 permite servir el modelo en bf16 con contexto largo y varias secuencias concurrentes; una RTX 4090 (24 GB) es suficiente para bf16 con contexto moderado o para cuantizacion de 8 bits con contexto largo.
- Cabe en GPU de consumo: si. Con 4,54 mil millones de parametros, una RTX 3090/4090 (24 GB) o incluso una GPU de 12-16 GB con cuantizacion de 4 bits pueden ejecutarlo, siempre con contexto reducido si se mantiene bf16.
- Opciones de despliegue: vLLM esta confirmado por la propia configuracion de entrenamiento (vllm_extra, FlashAttention-2, max_model_len 65536). TGI y SGLang deberian funcionar al ser safetensors estandar, aunque no estan documentados. Para llama.cpp u Ollama seria necesaria una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 4b-B-200-luna-8k-epoch4 (este modelo) | 4.539.265.536 | No disponible oficialmente (config: max_model_len 65536) | No disponible | No disponible | Safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Referenciado como origen del ajuste |
| Otras alternativas de ~3-4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos para una comparacion rigurosa |

No se dispone de informacion suficiente para establecer una comparativa tecnica fiable con modelos de la misma categoria. Cualquier afirmacion sobre rendimiento relativo careceria de respaldo.

## Limitaciones y advertencias

- Licencia no declarada. Sin licencia explicita no hay autorizacion clara de uso comercial; debe tratarse como uso restringido a investigacion hasta que el autor la aclare.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluaciones cualitativas, ni descripcion de capacidades. Cualquier uso en produccion seria a ciegas.
- Riesgo elevado de alucinacion: no hay datos sobre tasas de alucinacion, y los ajustes por RL con jueces automaticos pueden optimizar la recompensa del juez sin mejorar la veracidad.
- Riesgo de sesgo del juez: la recompensa proviene de un unico modelo juez propietario (gpt-5.6-luna) con reasoning_effort medio, por lo que el modelo puede haber aprendido a explotar los sesgos de ese juez concreto.
- Ambiguedad en la procedencia: el nombre indica "epoch4" mientras que la configuracion declara learner_epoch = 3, y el seq_len de entrenamiento (300000) no coincide con el max_model_len de inferencia (65536). Esto dificulta saber que configuracion es la efectiva.
- Idiomas no documentados: se desconoce el comportamiento fuera del ingles y del chino, idiomas habituales de la familia Qwen.
- Sin garantias de tool calling en produccion: el parser esta declarado en la configuracion, pero no hay pruebas publicadas de que las llamadas a funciones sean correctas o estables.
- Cero traccion en la comunidad: 0 descargas y 0 valoraciones implican que no existe validacion externa de su comportamiento.
- Riesgo de colapso de diversidad: 10000 pasos de RL con el mismo prompt de recompensa y sin datos de validacion publicados pueden haber reducido la variedad de respuestas.
- Contexto largo no verificado: aunque la configuracion apunta a 65536 tokens, no hay pruebas de atencion efectiva a esa distancia y el coste de cache KV a esa longitud es considerable.
- Los resultados de la busqueda web no aportan informacion sobre el modelo; todas las coincidencias corresponden a portales de ofertas de practicas sin relacion alguna con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-jh-monitor/4b-B-200-luna-8k-epoch4
- Modelo base referenciado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/Stage-org/4b-B-200-luna-8k
- Paper, blog, repositorio o demo adicionales: no disponible (la busqueda web no devolvio resultados relevantes)

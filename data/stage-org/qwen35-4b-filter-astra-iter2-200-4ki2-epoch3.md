# Stage-org/qwen35-4b-filter-astra-iter2-200-4ki2-epoch3

## Resumen

Stage-org/qwen35-4b-filter-astra-iter2-200-4ki2-epoch3 es un ajuste por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por la organizacion Stage-org en HuggingFace. No se trata de un modelo entrenado desde cero: la model card documenta un unico intento de entrenamiento (`attempt 1`) sobre el dataset `Stage-org/filter-astra-iter2-200-4ki2`, con 10.000 pasos de learner y 3 epocas, ejecutado con un pipeline interno denominado jh-workflow sobre el framework `prime_rl`.

El repositorio contiene 4.539.265.536 parametros en formato safetensors (9,1 GB, lo que corresponde aproximadamente a precision BF16/FP16) y esta etiquetado con la arquitectura `qwen3_5`. El proposito declarado es experimental: el nombre del checkpoint codifica la iteracion del dataset (`iter2`), el numero de ejemplos o configuracion (`200-4ki2`) y la epoca (`epoch3`), lo que sugiere un ciclo de investigacion interna mas que un modelo listo para produccion.

Su relevancia actual es limitada pero informativa: se trata de un ejemplo poco habitual de ficha que expone la configuracion completa de RL (juez LLM externo, DPPO, KL penalty, parsers de vLLM), lo que permite estudiar como se esta aplicando RL sobre modelos de ~4B en 2026. El repositorio no declara licencia, idiomas soportados, pipeline ni resultados de evaluacion, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia `qwen3_5` (etiqueta del repositorio); detalles de capas, atencion y normalizacion no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (`max_model_len` en la configuracion de inferencia vLLM); el config de entrenamiento declara `seq_len = 300000`, cuyo significado exacto no se documenta |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones oficiales; los pesos estan en safetensors, presumiblemente BF16 por tamano) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Metodo de entrenamiento | RL (aprendizaje por refuerzo) con juez LLM externo; `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128` |
| Dataset de entrenamiento | Stage-org/filter-astra-iter2-200-4ki2 (split `train`, tipo `new_task`) |
| Tamano del repositorio | 9,1 GB |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un derivado del checkpoint Qwen/Qwen3.5-4B, etiquetado con `qwen3_5` como arquitectura y `language_model_only = true` en la configuracion de inferencia, lo que confirma que es un modelo exclusivamente de texto, sin torre de vision. Los detalles estructurales (numero de capas, tipo de atencion, uso de GQA, dimension del hidden state, vocabulario) no se documentan en la model card ni en los resultados de busqueda disponibles.

El entrenamiento no es supervisado sino de refuerzo. La configuracion `stage.config.v7` describe un ciclo de RL con `group_size = 8` (muestreo por grupos, estilo GRPO), una funcion de perdida con mascara DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), penalizacion KL con `kl_tau = 0.001` y `adv_tau = 1.0`. El optimizador es AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0.9/0.99. La generacion durante el entrenamiento usa `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, lo que indica que el modelo opera con modo de razonamiento extendido.

El aspecto tecnico mas llamativo es el uso de un juez LLM externo para recompensas de respuesta abierta (`open_ended_judge`): un endpoint compatible con OpenAI servido por el modelo `gpt-5.6-luna` con `reasoning_effort = "medium"`, `max_retries = 3` y hasta 32 peticiones en vuelo. La infraestructura de rollout usa vLLM (con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`), atencion FlashAttention 2, `gpu_memory_utilization = 0.9` y `max_inflight_rollouts = 256` con hasta 8 pasos fuera de politica. Todo el entrenamiento se ejecuta en 2 GPUs por nodo, 1 dedicada a inferencia y 1 a entrenamiento.

## Capacidades

- Generacion de texto en modo conversacional, heredada del modelo base Qwen/Qwen3.5-4B.
- Modo de razonamiento extendido activable (`enable_thinking = true` en la configuracion de generacion), lo que implica cadenas de pensamiento antes de la respuesta final.
- Soporte de tool calling / function calling: la configuracion de vLLM incluye explicitamente `tool_call_parser = "qwen3_coder"`.
- Compatibilidad con agentes multi-paso: el orquestador permite hasta 8 pasos fuera de politica por rollout y 256 rollouts en vuelo, disenado para trayectorias largas de agente.
- Procesamiento solo de texto (`language_model_only = true`); no hay capacidad de vision ni de audio.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Capacidades especificas de razonamiento matematico, codigo o instrucciones: no documentadas ni evaluadas en la informacion disponible.

## Casos de uso

- Entrenamiento por refuerzo con juez LLM: el caso de uso principal y documentado es servir como punto de partida o checkpoint intermedio en un pipeline de RL en el que otro modelo actua como juez. Es adecuado porque su configuracion ya integra endpoint de juez, reintentos y control de concurrencia.
- Investigacion en alineacion y RLHF/RLVR: util para reproducir experimentos de DPPO con mascara, penalizacion KL y muestreo por grupos sobre un modelo denso de ~4,5 B, un tamano que cabe en 2 GPUs.
- Generacion de codigo asistida por herramientas: gracias al parser `qwen3_coder`, puede conectarse a herramientas externas (ejecutores, linters, APIs) en pipelines de asistencia a programacion.
- Agentes multi-paso con contexto largo: con 65.536 tokens de ventana configurada, admite tareas de recuperacion y razonamiento sobre documentos extensos o historiales de conversacion largos.
- Evaluacion comparativa de checkpoints de RL: al ser un checkpoint de la epoca 3 de un experimento concreto, resulta util para estudiar el efecto del numero de epocas sobre el comportamiento del modelo base.
- Sustitucion en pipelines internos de vLLM: al estar disenado para servirse con vLLM (parsers y limites ya definidos), puede desplegarse en una infraestructura existente basada en ese servidor sin cambios de configuracion.
- Experimentacion con modos de pensamiento: permite comparar respuestas con y sin `enable_thinking` para medir el coste en tokens frente a la ganancia en calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y los resultados de busqueda web no aportan datos tecnicos sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: aproximadamente 9,1 GB solo de pesos (4.539.265.536 parametros x 2 bytes), mas el KV cache y el overhead del runtime. En la practica, entre 12 y 16 GB con contextos moderados.
- Contexto largo: la configuracion admite `max_model_len = 65536`. El KV cache a esa longitud puede anadir varios GB adicionales; la cantidad exacta depende de la configuracion de atencion (GQA, numero de cabezas), que no esta documentada.
- Cabe en GPU de consumo: si, en BF16 cabe en RTX 4090, RTX 3090, RTX 4080 de 16 GB y similares siempre que el contexto no sea muy largo. Con cuantizacion de 8 bits o 4 bits cabria en GPUs de 8-12 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: A100 40 GB o H100 para entrenamiento e inferencia a contexto completo; 2 GPUs por nodo segun la configuracion de entrenamiento original (1 de inferencia con vLLM y 1 de entrenamiento).
- Opciones de despliegue: vLLM es el unico runtime explicitamente soportado por la configuracion (con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). El uso con llama.cpp, Ollama, TGI o SGLang no esta documentado y depende de que exista soporte para la arquitectura `qwen3_5`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-astra-iter2-200-4ki2-epoch3 | 4,54 B | 65.536 tokens (config vLLM) | Sin benchmarks publicados | No declarada | Publico en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible (referenciado como base del ajuste) | No disponible | No disponible | No disponible | Referenciado en la configuracion de entrenamiento |
| Alternativas de ~4 B (por ejemplo Qwen3-4B, Llama-3.2-3B, Phi-4-mini) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento, contexto o licencia de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia de licencia declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Ademas, la licencia del modelo base Qwen/Qwen3.5-4B condiciona cualquier redistribucion.
- Modelo experimental no evaluado: no hay benchmarks, evaluaciones humanas ni pruebas de regresion publicadas. No deberia desplegarse en produccion sin una evaluacion propia.
- Opacidad del dataset: el dataset `filter-astra-iter2-200-4ki2` es de tipo `new_task` y su composicion, filtrado y procedencia no se documentan, lo que dificulta auditar sesgos o contaminacion.
- Sesgo inducido por el juez: las recompensas provienen de un modelo externo (`gpt-5.6-luna` con `reasoning_effort = "medium"`). El modelo puede haber aprendido a satisfacer el estilo y los criterios de ese juez, no necesariamente a ser mas correcto, un fenomeno conocido como reward hacking.
- Riesgo de alucinacion: no medido. Como todo LLM generativo, puede producir afirmaciones plausibles pero falsas, especialmente en dominios no cubiertos por el dataset de RL.
- Riesgo de sobreajuste al experimento: con 3 epocas sobre un dataset filtrado especifico, puede haber perdido parte de la diversidad y las capacidades generales del modelo base, incluidas competencias multilingues.
- Idiomas: no se declaran idiomas soportados; no hay garantia de rendimiento fuera del ingles o del idioma dominante del dataset de RL.
- Coste del modo de razonamiento: `enable_thinking = true` incrementa notablemente el consumo de tokens de salida; con `max_tokens = 4096` en generacion, la latencia y el coste por peticion pueden ser altos.
- Sin garantia de compatibilidad de runtime: solo se documenta vLLM; otros motores de inferencia pueden no soportar la arquitectura `qwen3_5`.
- Cero traccion comunitaria: 0 descargas y 0 likes implican que no hay validacion externa ni issues conocidos resueltos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-astra-iter2-200-4ki2-epoch3
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/Stage-org/filter-astra-iter2-200-4ki2
- Modelo base (referenciado): https://huggingface.co/Qwen/Qwen3.5-4B
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; las consultas devolvieron unicamente listados genericos de ofertas de practicas (stage.fr, welcometothejungle.com, indeed, letudiant), sin relacion con el modelo. No hay paper, blog, repositorio ni demo adicional disponible.

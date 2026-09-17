# Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k-epoch3

## Resumen

Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k-epoch3 es un ajuste por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, publicado por la organizacion Stage-org. El checkpoint corresponde al intento 1 de un pipeline interno de entrenamiento (identificado como jh-workflow / stage-learner) cuyo dataset de partida es Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k. Es, por tanto, un modelo derivado y experimental, no un lanzamiento oficial de Qwen.

El repositorio tiene 9,1 GB y 4.539.265.536 parametros en safetensors, cifra coherente con pesos en bf16 o fp16. La etiqueta de arquitectura es qwen3_5, de modo que hereda la familia Qwen3.5, aunque la informacion disponible no detalla numero de capas, tipo de atencion ni ventana de contexto oficial. En el momento de la consulta acumula 0 descargas y 0 likes y no incluye model card descriptiva mas alla de los metadatos generados automaticamente por el pipeline.

Su relevancia es acotada pero concreta: la configuracion de entrenamiento esta publicada integra (metodo RL, hiperparametros, parsers de razonamiento y de tool calling, juez externo), lo que la convierte en una referencia util para equipos que quieran reproducir o auditar un ciclo de RL sobre un modelo denso de ~4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (etiqueta del repo, familia Qwen3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 4.539.265.536 (4,54 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificacion oficial; la config de entrenamiento fija `max_model_len = 65536` en inferencia y `seq_len = 300000` en el learner |
| Tipos de cuantizacion | no disponible; el repo solo contiene pesos safetensors (9,1 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponibles (no se declaran; dependen del modelo base) |
| Licencia | no disponible (el repo no declara licencia; debe consultarse la del modelo base) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-4B |
| Dataset de entrenamiento | Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k |
| Metodo de entrenamiento | RL con prime_rl (`learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128`, `group_size = 8`) |
| Autor | Stage-org |
| Fecha de creacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta qwen3_5 y el modelo base declarado, Qwen/Qwen3.5-4B, un modelo denso de unos 4,54 mil millones de parametros. No se publican detalles sobre el tipo de atencion, el tokenizador, la composicion de capas ni si incorpora algun mecanismo de atencion lineal o hibrida. La inferencia durante el entrenamiento se realizo con vLLM (`language_model_only = true`), el parser de razonamiento `qwen3` y el parser de tool calling `qwen3_coder`, con `gpu_memory_utilization = 0.9`.

El entrenamiento es un ciclo de RL sobre el checkpoint base, no un fine-tuning supervisado clasico. La configuracion declara optimizador AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0`, `betas1 = 0.9` y `betas2 = 0.99`; una perdida con `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`; y una orquestacion con `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`. La generacion en entrenamiento usa `temperature = 0.9`, `max_tokens = 4096`, `top_p = 1.0` y `enable_thinking = true`. El reparto de recompensas se apoya en un juez externo servido por API (`gpt-5.6-luna`, `reasoning_effort = medium`, `temperature = 1.0`), con `max_retries = 3` y hasta 32 peticiones en vuelo. El hardware declarado son 2 GPU por nodo, una para inferencia y otra para entrenamiento, con atencion `flash_attention_2` y checkpoints cada 1000 pasos conservando solo el ultimo. No se especifica el volumen de tokens, la composicion del dataset ni si hubo etapas previas de SFT o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo thinking: la configuracion activa `enable_thinking = true` y un parser de razonamiento compatible con la familia Qwen3.
- Tool calling / function calling: el pipeline de inferencia usa el parser `qwen3_coder`, lo que indica soporte previsto de llamadas a herramientas en formato estructurado.
- Razonamiento multi-paso orientado a tareas: el dataset de entrenamiento lleva en su nombre el termino "solvability", lo que sugiere un ajuste sobre tareas filtradas por resolubilidad, aunque el criterio exacto no esta documentado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles; la inferencia se configuro explicitamente como `language_model_only = true`.
- Uso como modelo de investigacion en RL: al publicarse la configuracion completa, sirve como referencia para replicar ciclos de RL sobre modelos densos de ~4B.

## Casos de uso

- Investigacion en RL aplicado a modelos pequenos: la configuracion completa (optimizador, perdida, group size, KL, juez) permite reproducir el ciclo sobre el modelo base Qwen3.5-4B y comparar variantes de hiperparametros.
- Evaluacion de pipelines de razonamiento con juez externo: util para medir la sensibilidad de un modelo de 4B al uso de recompensas generadas por un juez propietario servido por API.
- Prototipado de agentes con tool calling: el parser `qwen3_coder` y el modo thinking permiten montar agentes multi-paso en un entorno de desarrollo con vLLM como servidor compatible con la API de OpenAI (`http://localhost:7000/v1`).
- Generacion de codigo en entornos con recursos limitados: con ~4,5B de parametros es viable servirlo en una unica GPU de gama alta consumer y usarlo como asistente de autocompletado o generacion de parches en pipelines de CI/CD.
- Sistemas de razonamiento con prompts largos: la configuracion de inferencia admite hasta 65.536 tokens de longitud de modelo, lo que permite procesar documentos extensos o historiales de conversacion largos si el checkpoint conserva esa ventana.
- Base para destilacion o comparativas de entrenamiento: al ser un derivado documentado del mismo modelo base, sirve como punto de comparacion frente a Qwen3.5-4B sin ajustar en estudios de degradacion por RL.
- Experimentos de seguridad y alineacion: la publicacion de la perdida con `kl_tau = 0.001` y el enmascaramiento DPPO facilita analizar como cambia el comportamiento del modelo respecto al checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones en MMLU, HumanEval, GSM8K ni ninguna otra suite, y no hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 9,1 GB solo para pesos (4,539 mil millones de parametros a 2 bytes), mas cache KV; se recomienda reservar 12-16 GB para inferencia con contexto moderado.
- VRAM en cuantizacion int8: del orden de 4,5-5 GB de pesos; en cuantizacion de 4 bits, del orden de 2,3-3 GB. Son estimaciones derivadas del numero de parametros, ya que el repo no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para servicio concurrente; una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para inferencia en bf16 con contexto amplio.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas de VRAM en bf16/fp16, y en tarjetas de 6-8 GB si se convierte y cuantiza a 4 bits.
- Opciones de despliegue: vLLM es la via natural, ya que se uso durante el entrenamiento con `max_model_len = 65536`, `reasoning_parser = qwen3` y `tool_call_parser = qwen3_coder`. Tambien son viables TGI o SGLang. llama.cpp y Ollama requieren convertir los pesos safetensors a GGUF, tarea no realizada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.
- Hardware de entrenamiento declarado: 2 GPU por nodo (1 dedicada a inferencia y 1 a entrenamiento), con `flash_attention_2`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Resultados |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k-epoch3 | 4,54 B | no disponible (config: 65.536 en inferencia) | no disponible | safetensors en HuggingFace, 0 descargas | no publicados |
| Qwen/Qwen3.5-4B (modelo base) | 4 B (segun denominacion) | no disponible | no disponible en esta informacion | HuggingFace oficial | no publicados en esta informacion |
| Otros modelos densos de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card descriptiva, ni intencion de uso, ni limitaciones declaradas por el autor. Toda la informacion proviene de los metadatos del pipeline de entrenamiento.
- Licencia no declarada: sin licencia explicita no hay base clara para uso comercial. Ademas, la licencia del modelo base Qwen3.5-4B debe respetarse y no se reproduce en este repo.
- Idiomas y cobertura no declarados: no se puede asumir soporte multilingue ni un comportamiento equilibrado entre idiomas.
- Riesgo de alucinacion: inherente a cualquier modelo de 4,5B, y potencialmente agravado por un ajuste de RL orientado a recompensas de un juez externo, que puede favorecer respuestas que agradan al juez sin ser factualmente correctas.
- Sobreajuste al dominio del dataset: el entrenamiento se hizo durante 3 epocas y 10.000 pasos sobre un unico dataset (`filter-solvability-200-rawsource-4k`), lo que puede degradar capacidades generales del modelo base (olvido catastrofico).
- Dependencia de un juez propietario: la recompensa se genero con `gpt-5.6-luna` a traves de una API, lo que compromete la reproducibilidad completa del entrenamiento y la auditabilidad del criterio de calidad.
- Modelo sin validacion externa: 0 descargas y 0 likes implican ausencia de evidencia de terceros sobre su calidad o estabilidad.
- Parametros de entrenamiento cuestionables: `seq_len = 300000` en el learner frente a `max_model_len = 65536` en inferencia; la discrepancia no se explica y puede indicar truncamiento o enmascaramiento de tokens no documentado.
- Sin garantias de produccion: no hay versiones cuantizadas, ni benchmarks, ni pruebas de latencia, por lo que su uso en produccion exige una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k-epoch3
- Dataset de entrenamiento: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-solvability-200-rawsource-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/Stage-org
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a portales de ofertas de practicas y no guardan relacion con el modelo. No se dispone de paper, blog tecnico ni repositorio de codigo asociados.

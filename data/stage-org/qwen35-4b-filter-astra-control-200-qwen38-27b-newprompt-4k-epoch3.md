# Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k-epoch3

## Resumen

El modelo `Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k-epoch3` es un ajuste derivado de `Qwen/Qwen3.5-4B`, publicado por la organizacion Stage-org. Se trata de un modelo denso de 4.539.265.536 parametros (4,54 B) almacenado en safetensors, con un tamano de repositorio de 9,1 GB, lo que es coherente con pesos en bf16/fp16. La model card no incluye descripcion funcional, licencia, idiomas ni pipeline declarado: la unica documentacion disponible es un bloque de procedencia de entrenamiento.

Ese bloque indica que el modelo se ha obtenido mediante aprendizaje por refuerzo (`method = "rl"`) sobre el modelo base, con 10.000 pasos de learner y 3 epocas, tamano de lote 128 y generacion con `enable_thinking = true`. El entrenamiento se ha realizado con el stack `prime_rl` sobre dos GPUs por nodo (una de inferencia y una de entrenamiento), usando vLLM como motor de inferencia y un juez externo basado en `gpt-5.6-luna` para la evaluacion de respuestas abiertas.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no presenta resultados de benchmarks, no declara licencia ni idiomas, y las busquedas web realizadas no devuelven informacion tecnica sobre el modelo (los resultados obtenidos corresponden a portales de ofertas de practicas, sin relacion con el artefacto). Los nombres de dataset y experimento sugieren un flujo interno de investigacion ("astra-control", "newprompt-4k", "filter") mas que un lanzamiento publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (derivado de `Qwen/Qwen3.5-4B`; tag `qwen3_5`); no se detalla en la model card |
| Parametros totales | 4.539.265.536 (4,54 B), dato real de safetensors |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | Inferencia durante el entrenamiento: 65.536 tokens (`max_model_len = 65536`). La configuracion de learner declara `seq_len = 300000`. El contexto nativo del modelo base no se especifica: no disponible |
| Tipos de cuantizacion | No disponible. Solo se publican pesos safetensors (9,1 GB, compatible con bf16/fp16); no hay GGUF ni AWQ/GPTQ en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Lo unico verificable es que el punto de partida es `Qwen/Qwen3.5-4B` (tag `qwen3_5`) y que el entrenamiento empleo atencion con `flash_attention_2`, optimizador AdamW (lr = 1e-6, betas 0.9/0.99, weight_decay 0, max_norm 1.0) y una funcion de perdida de tipo `default` con parametros `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`. El metodo declarado es RL con `group_size = 8`, es decir, un esquema de refuerzo con grupo de muestras por prompt, con checkpointing cada 1000 unidades de epoca (`interval_unit = "epoch"`, `keep_last = 1`) y `weights_only = true`.

El bucle de generacion usa temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`, con un juez de respuesta abierta servido como `gpt-5.6-luna` (temperatura 1.0, `reasoning_effort = "medium"`, hasta 32 peticiones en vuelo y 3 reintentos). La orquestacion permite 256 rollouts en vuelo y hasta 8 pasos fuera de politica (`max_off_policy_steps = 8`), con vLLM configurado con `language_model_only = true`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"` en el puerto 7000.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset (solo su identificador: `Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k`), ni si hubo fases adicionales de SFT, DPO o RLHF mas alla del bucle RL descrito. Tampoco se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, hibridacion SSM, etc.).

## Capacidades

- Generacion de texto condicionada por el comportamiento aprendido durante el bucle RL descrito; no hay evaluacion publicada de su calidad.
- Modo de razonamiento extendido habilitable durante la generacion (`enable_thinking = true` en la configuracion de entrenamiento).
- Soporte de tool calling / function calling: la configuracion de vLLM declara `tool_call_parser = "qwen3_coder"`, lo que implica compatibilidad con el formato de llamadas a herramientas de la familia Qwen3 en el momento del entrenamiento.
- Capacidades heredadas del modelo base `Qwen/Qwen3.5-4B`: no documentadas en este repositorio y, por tanto, no verificables aqui.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible; la inferencia se configuro explicitamente como `language_model_only = true`.

## Casos de uso

- Investigacion en aprendizaje por refuerzo sobre modelos pequenos: el repositorio sirve como artefacto reproducible de un experimento RL (10.000 pasos, 3 epocas, grupo de 8) sobre una base de 4,54 B, util para comparar recetas de RL y configuraciones de juez automatico.
- Reproduccion de experimentos con `prime_rl` y vLLM: la model card incluye el comando de entrenamiento y el TOML efectivo, lo que permite reconstruir el pipeline (dos GPUs por nodo, una de inferencia y una de entrenamiento) en un entorno propio.
- Prototipado de asistentes con razonamiento explicito: el modelo se entreno con `enable_thinking` activo y `max_tokens = 4096`, por lo que encaja en pruebas de cadenas de razonamiento sobre una unica GPU.
- Evaluacion de parsers de tool calling en vLLM: al declarar `tool_call_parser = "qwen3_coder"` y `reasoning_parser = "qwen3"`, es un candidato para validar la integracion de estos parsers en despliegues con API compatible con OpenAI.
- Generacion de datos sinteticos para destilacion o para filtrar datasets: el nombre del experimento (`filter-astra-control`, `newprompt-4k`) apunta a un uso interno de filtrado de prompts o respuestas, aunque el comportamiento real no esta documentado.
- Despliegue en hardware de gama media para pruebas de concepto: con 4,54 B de parametros, el modelo en bf16 ocupa en torno a 9,1 GB, por lo que cabe en GPUs de 12-24 GB, lo que facilita iteracion rapida en laboratorio.
- Comparativas de tecnicas de RL a pequena escala frente a la base `Qwen/Qwen3.5-4B`, siempre que se realicen evaluaciones propias, ya que no hay benchmarks publicados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo contiene la procedencia del entrenamiento (dataset, comando y configuracion TOML) y no incluye puntuaciones de MMLU, GSM8K, HumanEval, MATH ni de ninguna otra suite, ni comparaciones con modelos equivalentes. Las busquedas web realizadas no aportaron datos tecnicos sobre este modelo.

## Requisitos de hardware

Las cifras de VRAM son estimaciones calculadas a partir del dato real de parametros (4.539.265.536) y no proceden de mediciones publicadas por el autor.

- Pesos en bf16/fp16: aproximadamente 9,1 GB (coincide con el tamano del repositorio). VRAM total estimada con contexto corto: 11-13 GB.
- Pesos en int8/fp8: aproximadamente 4,6 GB. VRAM total estimada: 6-7 GB.
- GGUF Q8_0 (si se convierte): aproximadamente 4,9 GB; Q4_K_M: aproximadamente 2,8 GB. No hay GGUF publicado en el repositorio.
- Cache KV: no disponible, porque la model card no detalla numero de capas, cabezas ni politica de GQA. Con contexto de 65.536 tokens la cache puede dominar el consumo de VRAM; se recomienda medirla en el hardware objetivo.
- Cabe en GPU de consumo: si. Con bf16 en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con amplio margen; ajustado en una RTX 3060 de 12 GB a contexto corto; en 8 GB solo con cuantizacion de 4 bits.
- GPU recomendadas: RTX 4090 o RTX 3090 para desarrollo; A100 40/80 GB, H100 o L40S para servicio concurrente con contexto largo. El entrenamiento descrito se ejecuto con dos GPUs por nodo (una para inferencia y una para entrenamiento).
- Opciones de despliegue: vLLM (es el motor usado en el propio pipeline de entrenamiento, con `gpu_memory_utilization = 0.9`, `max_model_len = 65536` y API en el puerto 7000); tambien SGLang, TGI o llama.cpp/Ollama previa conversion a GGUF. El repositorio no incluye pesos GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion.

## Comparativa con modelos similares

No hay datos suficientes para una comparativa rigurosa: el autor no publica benchmarks ni especificaciones del modelo resultante, y la busqueda web no aporto informacion tecnica. El unico punto de referencia verificable es el modelo base declarado en la configuracion de entrenamiento.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Relacion |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k-epoch3 | 4,54 B | 65.536 tokens en la config de inferencia del entrenamiento; nativo no disponible | No disponible | HuggingFace, safetensors, 9,1 GB, 0 descargas y 0 likes | Modelo analizado |
| Qwen/Qwen3.5-4B | No disponible en la informacion proporcionada | No disponible | No disponible | Modelo base referenciado en la config TOML | Base sobre la que se aplico el RL; mismas dimensiones de pesos |
| Otras alternativas de ~4 B (Qwen3-4B, Llama 3.2 3B, Gemma 3 4B, Phi-4-mini) | No disponible | No disponible | No disponible | No disponible | El autor no ofrece comparaciones; no se dispone de datos verificados en esta busqueda para contrastar |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni resultados de validacion publicados. Cualquier afirmacion sobre su calidad es especulativa.
- Licencia no declarada: el repositorio no especifica licencia, por lo que el uso comercial es juridicamente indeterminado. Ademas, al derivar de `Qwen/Qwen3.5-4B`, habria que verificar las condiciones de la licencia del modelo base antes de cualquier uso en produccion.
- Riesgo de alucinacion: no cuantificado. Un ajuste por RL con juez automatico (`gpt-5.6-luna`) puede optimizar hacia el criterio del juez sin garantizar veracidad factual, y no se documenta ningun mecanismo de mitigacion.
- Sesgos: no disponibles. No se describe la composicion del dataset de entrenamiento (`Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k`), por lo que no se puede evaluar sesgo de dominio, idioma o demografia. El propio nombre del dataset sugiere filtrado interno, sin criterios publicados.
- Idioma: el modelo no declara idiomas soportados. El comportamiento en castellano no esta verificado; no se debe asumir cobertura multilingue sin pruebas.
- Contexto: la configuracion de entrenamiento usa `max_model_len = 65536`, pero la seccion de learner declara `seq_len = 300000`. Esta discrepancia no esta explicada en la model card, asi que la ventana efectiva en produccion debe validarse empiricamente antes de confiar en contextos largos.
- Trazabilidad de datos: no se publican numero de tokens, mezcla de datos, fases de SFT/DPO previas ni criterios del juez. El modelo incluye un identificador de prompt (`newprompt-4k`) cuyo contenido no es publico.
- Metadatos de adopcion: 0 descargas y 0 likes, creado y actualizado el 17 de septiembre de 2026 con apenas 24 segundos de diferencia, lo que indica una publicacion automatica de un checkpoint interno y sin curaduria.
- Nombre de fichero del entrenamiento: el comando referenciado emplea rutas internas (`/NHNHOME/shkim/...`) no reproducibles fuera de esa infraestructura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k-epoch3
- Dataset de entrenamiento referenciado: `Stage-org/qwen35-4b-filter-astra-control-200-qwen38-27b-newprompt-4k` (identificador citado en la model card; no se ha verificado su URL publica)
- Modelo base: `Qwen/Qwen3.5-4B` (referenciado en la configuracion de entrenamiento; URL no verificada en esta busqueda)
- Paper, blog, repositorio o demo del autor: no disponible
- Resultados de la busqueda web: no relevantes. Las consultas devolvieron exclusivamente portales de ofertas de practicas (stage.fr, welcometothejungle.com, fr.indeed.com, jobs-stages.letudiant.fr), sin ninguna relacion con el modelo.

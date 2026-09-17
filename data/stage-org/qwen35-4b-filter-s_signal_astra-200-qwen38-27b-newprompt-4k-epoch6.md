# Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-epoch6

## Resumen

El modelo `Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-epoch6` es un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion Stage-org. Cuenta con 4.539.265.536 parametros (~4,54 B) y un repositorio de 9,1 GB en formato safetensors, lo que sitúa los pesos en precision BF16/FP16. El nombre del repositorio codifica el pipeline de generacion de datos: filtrado por una senal (`filter-s_signal_astra-200`), prompts nuevos de 4k generados a partir de un modelo de 27B y el sexto epoch de entrenamiento.

El modelo resuelve una tarea de ajuste por refuerzo sobre datos sinteticos, con un juez externo de extremo abierto (`gpt-5.6-luna`) como fuente de recompensa, y con el modo de razonamiento activado durante la generacion (`enable_thinking = true`). Su relevancia es fundamentalmente metodologica: documenta, via configuracion TOML, un pipeline reproducible de RL con `prime_rl`, GRPO de tamano de grupo 8, enmascarado DPPO y decodificacion con vLLM.

Ahora bien, la model card es practicamente inexistente: solo contiene la procedencia del entrenamiento (dataset, comando y configuracion), sin licencia declarada, sin idiomas, sin pipeline y sin resultados de evaluacion publicados. Con 0 descargas y 0 likes en el momento de la consulta, debe considerarse un artefacto experimental de investigacion y no un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `Qwen/Qwen3.5-4B` (tag `qwen3_5`); inferencia configurada como `language_model_only` (solo texto) |
| Parametros totales | 4.539.265.536 (~4,54 B), dato real de safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | Inferencia: `max_model_len = 65536` tokens. Entrenamiento: `seq_len = 300000` en la configuracion TOML (ver advertencias) |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (no se publican GGUF, AWQ ni GPTQ) |
| Tamano del repositorio | 9,1 GB |
| Fecha de creacion | 2026-09-17 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-4B`, un transformer denso de ~4,5 B de parametros. La configuracion de inferencia del pipeline declara `language_model_only = true` (sin torre de vision), `reasoning_parser = "qwen3"` para separar el bloque de razonamiento y `tool_call_parser = "qwen3_coder"` para el parseo de llamadas a herramientas, ademas de `flash_attention_2` como implementacion de atencion durante el entrenamiento.

El entrenamiento es un bucle de RL con la libreria `prime_rl`, no un ajuste supervisado. Los hiperparametros documentados son: metodo `rl`, 10.000 pasos del learner, 6 epochs, `batch_size = 128`, `group_size = 8` (esquema tipo GRPO), optimizador AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0,9/0,99. La funcion de perdida usa enmascarado DPPO con `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`. La generacion durante el rollout emplea `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La recompensa proviene de un juez de extremo abierto servido por API (`model = "gpt-5.6-luna"`, `reasoning_effort = "medium"`, `temperature = 1.0`, `max_tokens = 4096`, `max_retries = 3`, `max_in_flight = 32`). La orquestacion usa `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`, con difusion de pesos por sistema de ficheros y semilla fija (`seed = 7`). El reparto de hardware del entrenamiento fue de 2 GPU por nodo, con 1 GPU para inferencia y 1 GPU para entrenamiento, con `gpu_memory_utilization = 0.9` y servidor vLLM en el puerto 7000.

No se documenta la composicion del dataset (`Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k`), ni el numero de tokens de entrenamiento, ni si hubo fases previas de SFT o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo thinking: el entrenamiento se ejecuto con `enable_thinking = true` y el parser de razonamiento configurado es `qwen3`, por lo que el modelo esta optimizado para producir cadenas de razonamiento antes de la respuesta final.
- Llamada a herramientas (tool calling / function calling): el pipeline de inferencia declara `tool_call_parser = "qwen3_coder"`, lo que indica soporte previsto para invocacion estructurada de funciones.
- Razonamiento multi-paso y agentes: los parametros `max_inflight_rollouts = 256` y `max_off_policy_steps = 8` del orquestador apuntan a rollouts largos con multiples pasos de accion.
- Generacion de codigo: el parser de tool calling asociado a la familia `qwen3_coder` sugiere capacidad orientada a tareas de programacion.
- Capacidades multilingues: no disponibles (no se declaran idiomas en la model card).
- Vision: no soportada (`language_model_only = true` en la configuracion de vLLM).
- Audio: no soportado segun la informacion disponible.
- Ventana de contexto larga en inferencia: hasta 65.536 tokens segun la configuracion de vLLM.

## Casos de uso

- Atencion al cliente automatizada: gracias a los 65.536 tokens de ventana configurados en inferencia, el modelo puede mantener conversaciones multi-turno con historiales largos y documentacion de producto adjunta sin truncar el contexto.
- Generacion de codigo en produccion: al declarar `tool_call_parser = "qwen3_coder"`, puede integrarse en pipelines de asistencia a la programacion donde el modelo proponga parches y llame a herramientas de compilacion o test.
- Agentes de automatizacion con tool calling: su entrenamiento con rollouts multi-paso (`max_off_policy_steps = 8`) lo hace adecuado para bucles de agente que encadenan busquedas, llamadas a API y verificaciones.
- Razonamiento matematico paso a paso: el modo thinking activado durante el RL permite desplegarlo en escenarios donde se requiere mostrar la derivacion antes del resultado, por ejemplo tutoria o verificacion de calculos.
- Extraccion estructurada de documentos largos: con 65k tokens de contexto puede procesar contratos o informes completos y devolver campos estructurados mediante function calling.
- Clasificacion y filtrado de datos sinteticos: por su tamano reducido y su naturaleza de modelo ajustado por RL sobre prompts sinteticos, es utilizable como filtro o etiquetador barato dentro de pipelines de curación de datasets.
- Reproduccion de investigacion en RL: la configuracion TOML publicada permite replicar el pipeline con `prime_rl`, comparar hiperparametros (`group_size`, `dppo_mask_low/high`, `kl_tau`) y estudiar el efecto del juez externo.
- Despliegue on-premise o en el borde: con 4,54 B de parametros y pesos de ~9 GB, puede servirse en una unica GPU de gama alta o cuantizado en hardware de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio unicamente contiene la procedencia del entrenamiento (dataset, comando y configuracion TOML); no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica de evaluacion, ni comparaciones con el modelo base `Qwen/Qwen3.5-4B`.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: ~9,1 GB solo de pesos, mas cache KV y activaciones; en la practica, entre 12 y 20 GB segun la longitud de contexto utilizada.
- VRAM estimada cuantizado a 8 bits: ~4,5-6 GB de pesos, con un total de 8-10 GB considerando cache.
- VRAM estimada cuantizado a 4 bits: ~2,5-3 GB de pesos, con un total de 5-7 GB en contextos moderados.
- Cache KV: a 65.536 tokens de contexto la cache puede superar los 8-10 GB en FP16, por lo que conviene reducir la ventana efectiva o usar cuantizacion de cache en GPUs de gama media.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con contexto completo; RTX 4090 o L40S (24 GB y 48 GB) para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en BF16; en RTX 4080/4070 Ti (16 GB) y RTX 3060 (12 GB) requiere cuantizacion a 8 o 4 bits. No se han publicado pesos GGUF en el repositorio, por lo que la cuantizacion debe generarse localmente.
- Opciones de despliegue: vLLM es la via documentada por el propio pipeline (con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, puerto 7000 en la ejecucion original). Tambien son viables TGI, SGLang y, previa conversion, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El script de entrenamiento fijo `gpu_memory_utilization = 0.9` y `max_model_len = 65536`, pero no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-epoch6` | 4,54 B | 65.536 en inferencia | No disponible | safetensors, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base declarado en la configuracion) | ~4 B segun el nombre | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Repositorio publico del autor original |
| Otros modelos densos de ~4 B (Qwen, Llama, Gemma y similares) | ~4 B | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria. La unica diferencia verificable frente al modelo base es la aplicacion del bucle de RL descrito en la configuracion.

## Limitaciones y advertencias

- Ausencia total de validacion externa: 0 descargas y 0 likes; no existe evidencia de que el modelo funcione correctamente fuera del entorno de entrenamiento.
- Licencia no declarada: no se especifica licencia en el repositorio, lo que impide determinar si el uso comercial esta permitido. Cualquier despliegue en produccion requiere aclarar este punto con el autor y revisar la licencia del modelo base.
- Sin benchmarks publicados: no hay ninguna metrica objetiva de calidad, por lo que no se puede afirmar que el ajuste por RL mejore al modelo base.
- Dependencia de un juez propietario: la senal de recompensa proviene de un modelo externo (`gpt-5.6-luna`) accedido por API. Esto introduce un sesgo de estilo dificil de auditar y hace que el comportamiento aprendido dependa de un sistema no reproducible ni publico.
- Riesgo de sobreajuste al dataset sintetico: el nombre del repositorio indica prompts nuevos de 4k generados por un modelo de 27B y filtrados por una senal concreta; el modelo puede degradarse fuera de esa distribucion.
- Discrepancia en la longitud de contexto: la configuracion de entrenamiento declara `seq_len = 300000` mientras que la de inferencia fija `max_model_len = 65536`. Conviene verificar experimentalmente el contexto realmente soportado antes de confiar en ventanas muy largas.
- Alucinacion: inherente a los modelos de 4 B ajustados por RL sin verificacion factual externa; no hay filtros de seguridad documentados.
- Sesgos heredados: al derivar de `Qwen/Qwen3.5-4B`, hereda los sesgos del corpus del modelo base, sin que se documente ninguna mitigacion.
- Limitaciones de idioma: no se declaran idiomas soportados, por lo que el rendimiento en castellano es desconocido.
- Solo texto: la configuracion fuerza `language_model_only = true`, sin capacidades de vision ni audio.
- Falta de formatos alternativos: no hay GGUF, AWQ ni GPTQ publicados, lo que obliga a convertir los pesos para despliegues en CPU o en GPUs de gama baja.
- Caveat de trazabilidad: la model card solo contiene un bloque de procedencia de entrenamiento; no hay descripcion de uso previsto, ni ejemplos de prompt, ni evaluacion de sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k-epoch6
- Dataset de entrenamiento: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-s_signal_astra-200-qwen38-27b-newprompt-4k
- Modelo base declarado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada
- Resultados de busqueda web: las consultas realizadas devolvieron unicamente portales de ofertas de practicas (stage.fr, welcometothejungle.com, indeed.fr, letudiant.fr), sin relacion con el modelo. No se han encontrado enlaces tecnicos relevantes.

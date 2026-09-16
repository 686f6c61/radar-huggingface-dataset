# Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch3

## Resumen

El modelo `Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch3` es un ajuste fino derivado de `Qwen/Qwen3.5-4B` (modelo base citado explicitamente en la configuracion de entrenamiento) mediante aprendizaje por refuerzo. Lo publica la organizacion `Stage-org` en HuggingFace y, segun los pesos reales almacenados en safetensors, tiene 4.539.265.536 parametros (aproximadamente 4,54 mil millones). El repositorio ocupa 9,1 GB, lo que es coherente con pesos en precision bf16/fp16.

El modelo resuelve una tarea de ajuste muy concreta: se ha entrenado con un bucle de RL (`method = "rl"`, con `group_size = 8` y un juez externo basado en un endpoint GPT-5.6-luna) sobre el dataset `Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k`. El sufijo del nombre sugiere filtrado de datos, una senal concreta y prompts de 4k, pero la model card no documenta el contenido del dataset ni los criterios de filtrado, por lo que esa interpretacion no esta confirmada.

Su relevancia actual es limitada y de nicho: es un artefacto de investigacion en RL sobre modelos pequenos, con 0 descargas y 0 likes en el momento de la consulta, sin model card descriptiva (solo un bloque de procedencia de entrenamiento), sin licencia declarada y sin resultados de evaluacion. Es util sobre todo para quien quiera reproducir o auditar el pipeline de entrenamiento, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; el tag del repositorio es `qwen3_5` y el modelo base es `Qwen/Qwen3.5-4B` |
| Parametros totales | 4.539.265.536 (dato real del index de safetensors) |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | `max_model_len` configurado a 65.536 tokens en la configuracion de inferencia del entrenamiento; la longitud de contexto oficial del modelo base no se detalla. La config de entrenamiento declara `seq_len = 300000`, valor que no se corresponde con el `max_model_len` de inferencia y que no esta explicado en la model card |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ en la informacion proporcionada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (tag `safetensors`); 9,1 GB de repositorio |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Modalidad | Solo texto (`language_model_only = true` en la config de inferencia) |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna mas alla del tag `qwen3_5` y del modelo base declarado (`Qwen/Qwen3.5-4B`). Todos los indicios apuntan a un transformer denso de aproximadamente 4,54B de parametros, con atencion Flash Attention 2 (`attn = "flash_attention_2"`), y sin mezcla de expertos: no hay ningun campo de configuracion que mencione MoE, expertos ni enrutado. Tampoco hay informacion sobre el numero de tokens de preentrenamiento ni sobre la composicion del corpus original, porque ese detalle pertenece al modelo base y no se reproduce en esta ficha.

El entrenamiento si esta documentado con bastante detalle en el bloque de procedencia. Se trata de un ajuste por refuerzo con `prime_rl`: `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128`, AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0`, `betas = (0.9, 0.99)`. La funcion de perdida es de tipo `default` con parametros `dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`, lo que apunta a una variante de optimizacion con enmascaramiento tipo DPPO sobre ventajas. La generacion durante el RL usa `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`; la recompensa la proporciona un juez externo (`open_ended_judge`) servido en un endpoint con modelo `gpt-5.6-luna`, `max_retries = 3`, `max_in_flight = 32` y `reasoning_effort = "medium"`. El bucle usa `group_size = 8`, `max_inflight_rollouts = 256` y `max_off_policy_steps = 8`, con `seed = 7`. La infraestructura declarada es modesta: 2 GPU por nodo, 1 para inferencia (vLLM, `gpu_memory_utilization = 0.9`, puerto 7005) y 1 para entrenamiento.

Como innovacion destacable, el pipeline incorpora parsers especificos de Qwen (`reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`), lo que indica que el modelo conserva el modo de razonamiento explicito y el soporte de llamadas a herramientas de la familia Qwen3. No se documenta decodificacion especulativa, atencion lineal ni ninguna otra tecnica de eficiencia.

## Capacidades

Advertencia: ninguna de estas capacidades esta verificada con evaluaciones publicadas. Se derivan de la configuracion de entrenamiento y del modelo base, no de pruebas reproducibles.

- Generacion de texto y razonamiento con modo de pensamiento activado (`enable_thinking = true` en la generacion del bucle de RL), heredado de la familia Qwen3.
- Soporte de llamadas a herramientas y funciones: la configuracion de inferencia especifica `tool_call_parser = "qwen3_coder"`.
- Uso en flujos de agente y razonamiento en varios pasos, dado el soporte de tool calling y el modo de pensamiento.
- Procesamiento de contexto largo: la configuracion de inferencia fija `max_model_len = 65536` tokens.
- Capacidad de generacion de codigo: probable por el parser `qwen3_coder` y el modelo base, pero sin datos de HumanEval ni similares que la respalden.
- Multilingue: no disponible.
- Vision, audio u otras modalidades: no disponibles; la configuracion fuerza `language_model_only = true`.
- Ajuste especifico de comportamiento: el RL con juez externo esta orientado a una tarea concreta (el dataset `...-filter-s_signal5-200-...-newprompt-4k-epoch3`), cuyo contenido no se documenta, por lo que el efecto real del ajuste sobre el comportamiento general es desconocido.

## Casos de uso

Advertencia: son escenarios plausibles derivados de las capacidades tecnicas declaradas, no casos validados por el autor ni por evaluaciones independientes. Al tratarse de un checkpoint de investigacion sin licencia declarada, conviene verificar los terminos antes de cualquier uso.

- Investigacion en aprendizaje por refuerzo: reproducir o auditar el pipeline de `prime_rl` con juez externo sobre un modelo de 4,54B, usando la configuracion TOML publicada como referencia de hiperparametros (learning rate, `group_size`, parametros DPPO, presupuesto de GPU).
- Agentes con llamadas a herramientas en entornos de prueba: el `tool_call_parser = "qwen3_coder"` permite integrarlo en frameworks de agentes que esperan el formato Qwen3, con contexto de hasta 65.536 tokens para mantener historiales largos de interaccion.
- Asistentes con razonamiento explicito en dominios acotados: el modo de pensamiento (`enable_thinking`) resulta util cuando se necesita una traza intermedia verificable antes de la respuesta final.
- Analisis de documentos largos en castellano o ingles: con 65.536 tokens de ventana configurada y 4,54B de parametros, puede indexar y resumir documentos extensos en una GPU de 24 GB con cuantizacion de 8 bits o menos.
- Prototipado local en estaciones de trabajo: el tamano de pesos en bf16 (unos 9,1 GB) permite ejecutarlo en una RTX 4090 o incluso en GPUs de 12-16 GB con cuantizacion, sin depender de APIs externas.
- Generacion de codigo en pipelines internos: por herencia del modelo base y del parser de codigo, puede emplearse para autocompletado y generacion de tests en entornos donde el codigo no pueda salir de la infraestructura propia.
- Experimentos de ajuste incremental: al ser un checkpoint intermedio de un bucle RL (`keep_last = 1`, `interval = 1000`), sirve como punto de partida para continuar el entrenamiento o para comparar contra otras iteraciones del mismo pipeline.
- Evaluacion de jueces automaticos: el uso de un juez LLM externo con `mean_score = false` y reintentos configurables lo convierte en un banco de pruebas para estudiar sesgos y estabilidad de la recompensa generada por modelos juez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo contiene el bloque de procedencia del entrenamiento (dataset, comando, configuracion TOML) y no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica. Tampoco hay cifras de latencia o throughput medidas.

## Requisitos de hardware

- Memoria para inferencia en bf16/fp16: aproximadamente 9,1 GB solo para pesos (el repositorio ocupa exactamente 9,1 GB, coherente con 4,54B de parametros a 2 bytes), mas el espacio de activaciones y cache KV.
- Memoria en cuantizacion de 8 bits: en torno a 4,5-5 GB de pesos, mas overhead de runtime.
- Memoria en cuantizacion de 4 bits: en torno a 2,5-3 GB de pesos; requeriria convertir los pesos, ya que no se publican versiones GGUF ni AWQ/GPTQ.
- GPU recomendadas: el modelo cabe con holgura en una NVIDIA RTX 4090 (24 GB) en bf16 y en GPUs de 12-16 GB si se cuantiza. Para lotes grandes con 65.536 tokens de contexto conviene subir a A100 40/80 GB o H100.
- Si cabe en GPU de consumo: si. En una RTX 4090 o 3090 (24 GB) en bf16 con contexto moderado; en tarjetas de 12 GB (RTX 3060, 4070) solo con cuantizacion, y probablemente con ventana reducida.
- Opciones de despliegue: vLLM es la opcion directamente soportada por la configuracion del autor (`reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`, `gpu_memory_utilization = 0.9`). Tambien son viables TGI y transformers con Flash Attention 2. Para llama.cpp u Ollama haria falta generar un GGUF propio, ya que el repositorio solo contiene safetensors.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni datos de tokens por segundo.
- Nota de entrenamiento: el propio pipeline se ejecuto con 2 GPU por nodo (1 de inferencia y 1 de entrenamiento) segun la configuracion, lo que da una idea del minimo practico para reproducir el ajuste.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo evaluado, por lo que cualquier comparacion cuantitativa seria especulativa. La tabla recoge unicamente lo que se puede afirmar con la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch3` | 4,54B | 65.536 tokens en la config de inferencia (`max_model_len`) | No disponible | Publicado en HuggingFace, solo safetensors | No disponible |
| `Qwen/Qwen3.5-4B` (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace | No disponible |
| Alternativas de ~3-4B (por ejemplo, la familia Qwen3 de 4B o Llama 3.2 3B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la busqueda web resultados tecnicos relevantes sobre este modelo ni sobre su modelo base; los resultados obtenidos corresponden a portales de ofertas de practicas ("stage" en frances e ingles) y son ruido sin relacion con el modelo.

## Limitaciones y advertencias

- Licencia no declarada: no hay permiso explicito de uso comercial, redistribucion ni modificacion. Cualquier uso en produccion requiere aclarar antes los terminos con el autor.
- Ausencia total de evaluaciones: sin benchmarks, sin evaluacion humana y sin comparaciones publicadas, no hay evidencia objetiva de calidad.
- Model card practicamente vacia: solo contiene el bloque de procedencia del entrenamiento, sin descripcion de objetivos, datos ni comportamiento esperado.
- Riesgo de alucinacion: es un modelo de 4,54B de la familia Qwen; cabe esperar el comportamiento tipico de ese rango de tamano, con mayor propension a inventar hechos que modelos de mayor escala. No hay mediciones de fidelidad factual.
- Sesgos: no documentados. El ajuste por RL con un juez externo (`gpt-5.6-luna`) puede introducir el sesgo propio del juez y de la politica de recompensa, que no se describe.
- Idioma: no se declara ninguna lista de idiomas soportados. El contenido del dataset de ajuste (`...-filter-s_signal5-200-...-newprompt-4k`) es desconocido, por lo que no se puede garantizar un rendimiento equilibrado entre idiomas.
- Configuracion de contexto contradictoria: la configuracion de entrenamiento declara `seq_len = 300000` mientras que la de inferencia fija `max_model_len = 65536`. El primero no es asumible como ventana operativa real sin verificacion.
- Naturaleza experimental: 0 descargas, 0 likes, un solo intento de entrenamiento (`Attempt: 1`) y un nombre de repositorio que codifica hiperparametros internos. Es un artefacto de investigacion, no un modelo mantenido.
- Dependencia del juez externo: parte del comportamiento aprendido procede de recompensas generadas por un servicio externo de pago, lo que dificulta la reproducibilidad exacta del ajuste.
- Restricciones del modelo base: al ser un derivado de `Qwen/Qwen3.5-4B`, hereda las condiciones de uso del modelo original, que no se detallan en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k-epoch3
- Dataset referenciado en la model card: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-s_signal5-200-qwen38-27b-newprompt-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion en HuggingFace: https://huggingface.co/Stage-org
- Paper, blog, repositorio de codigo o demo: no disponible. La busqueda web no devolvio ningun enlace tecnico relacionado con este modelo.

# Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-epoch3

## Resumen

El modelo `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-epoch3` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion Stage-org en HuggingFace. Se trata de un checkpoint correspondiente a la tercera epoca de un entrenamiento de RL ejecutado con el framework `prime_rl`, sobre el dataset `Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k`. El identificador y la configuracion de entrenamiento sugieren un experimento orientado a tareas de filtrado de solubilidad con prompts de 4.000 tokens, pero la model card no describe la tarea en lenguaje natural ni los objetivos de evaluacion.

El modelo cuenta con 4.539.265.536 parametros totales (aproximadamente 4,54 mil millones) y un repositorio de 9,1 GB en formato safetensors, un tamano coherente con pesos en bf16/fp16. La configuracion de inferencia declarada por el autor fija `max_model_len = 65536` tokens y habilita parsers de razonamiento (`qwen3`) y de llamadas a herramientas (`qwen3_coder`), lo que indica soporte previsto para modo thinking y tool calling en vLLM.

Su relevancia es principalmente de investigacion: es un artefacto de un pipeline de RL (GRPO con grupo de 8 muestras y juez externo `gpt-5.6-luna`) mas que un modelo de proposito general listo para produccion. Registra 0 descargas y 1 like, no declara licencia, idiomas ni pipeline, y no publica resultados de benchmarks, por lo que cualquier evaluacion de calidad debe realizarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; derivada de `Qwen/Qwen3.5-4B` (etiqueta `qwen3_5`), familia transformer decoder-only |
| Parametros totales | 4.539.265.536 (≈4,54 B) |
| Parametros activos | No aplica: no hay indicios de arquitectura MoE en la informacion disponible |
| Longitud de contexto | 65.536 tokens en la configuracion de inferencia vLLM (`max_model_len`); 300.000 tokens de `seq_len` durante el entrenamiento |
| Tipos de cuantizacion | No disponible; no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (tamano del repo: 9,1 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` y del modelo base declarado en la configuracion: `Qwen/Qwen3.5-4B`. Por tanto, se trata de un modelo denso de aproximadamente 4,54 B de parametros, sin indicios de mezcla de expertos. El entrenamiento se realizo sobre el checkpoint base con `flash_attention_2`, optimizador AdamW (`lr = 1e-6`, `weight_decay = 0`, `max_norm = 1.0`, `betas = [0.9, 0.99]`) y una funcion de perdida con mascara tipo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`).

El proceso es un RL de 10.000 pasos (`learner_steps = 10000`) durante 3 epocas, con `batch_size = 128`, `group_size = 8` y semilla 7. La generacion de rollouts usa temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La senal de recompensa proviene de un juez abierto basado en API (`gpt-5.6-luna`, con `reasoning_effort = "medium"`, hasta 3 reintentos y 32 peticiones en vuelo). La orquestacion admite hasta 256 rollouts en vuelo y 8 pasos fuera de politica (`max_off_policy_steps = 8`), y el entrenamiento se ejecuto en 2 GPUs por nodo (1 para inferencia, 1 para entrenamiento), con difusion de pesos por sistema de ficheros.

Como innovaciones destacables no se documenta ninguna tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Lo mas reseñable es el uso de un juez externo basado en modelo grande para el RL, y la habilitacion de parsers de razonamiento (`qwen3`) y de tool calling (`qwen3_coder`) en vLLM.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje denso de ~4,54 B de parametros.
- Modo thinking o razonamiento explicito: la configuracion de generacion usa `enable_thinking = true` y el servidor de inferencia activa `reasoning_parser = "qwen3"`.
- Soporte de tool calling / function calling: la configuracion activa `tool_call_parser = "qwen3_coder"` en vLLM.
- Manejo de contextos largos: `max_model_len = 65536` tokens en inferencia; el entrenamiento se ejecuto con `seq_len` de 300.000.
- Capacidades multilingues: no disponible (el autor no declara idiomas).
- Capacidades de vision o audio: no disponible; la configuracion de inferencia incluye `language_model_only = true`, lo que apunta a un uso exclusivamente de texto.
- Especializacion funcional: el nombre del dataset de entrenamiento (`filter-solvability-200`) sugiere una tarea de filtrado o evaluacion de solubilidad, pero no hay descripcion formal de la tarea en la model card.
- Capacidades de agente multi-paso: no verificadas de forma independiente; el soporte de tool calling en el runtime es el unico indicio.

## Casos de uso

- Reproduccion de experimentos de RL: el repositorio incluye el comando de entrenamiento y el fichero de configuracion completo, de modo que un equipo de investigacion puede replicar el pipeline con `prime_rl`, el mismo dataset y la misma semilla.
- Agentes con llamadas a herramientas: al habilitar `tool_call_parser = "qwen3_coder"` en vLLM, el modelo puede emitir llamadas estructuradas a funciones dentro de un bucle de agente, siempre que se valide su fiabilidad en el dominio concreto.
- Razonamiento multi-paso con modo thinking: el `reasoning_parser` permite separar la traza de razonamiento de la respuesta final, lo que facilita su uso en tareas de analisis encadenado y en la depuracion de respuestas.
- Procesamiento de documentos largos: con una ventana de 65.536 tokens en inferencia, puede resumir o extraer informacion de contratos, informes o expedientes extensos sin troceado agresivo.
- Generacion de codigo asistida: un modelo de ~4,5 B con tool calling puede integrarse en asistentes de edicion de codigo o en pipelines de CI/CD para tareas acotadas, con la ventaja de requerir una sola GPU.
- Prototipado y evaluacion comparativa en investigacion: sirve como checkpoint de referencia para medir el efecto del RL con juez externo frente al modelo base `Qwen/Qwen3.5-4B`.
- Filtrado y clasificacion de datos a gran escala: dado el nombre del dataset de entrenamiento, puede emplearse como filtro generativo en pipelines de curación de datos, aunque su calidad en esta tarea no esta documentada.
- Despliegue en hardware de gama de consumo: al caber en una GPU de 24 GB en bf16 (o menos con cuantizacion), es viable para entornos de desarrollo locales y demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 9,1 GB solo para pesos (coincide con el tamano del repositorio), mas cache KV y activaciones; en la practica, 12-16 GB de VRAM como minimo razonable.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos; con 4 bits, aproximadamente 2,3-3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o cualquier GPU profesional con 24 GB o mas para bf16. En consumo, RTX 3090, RTX 4090 (24 GB) o RTX 5090 funcionan sin cuantizar; tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) requeririan cuantizacion.
- Cabe en GPU de consumo: si, en modelos de 24 GB en bf16 y en modelos de 8-12 GB con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM es la via documentada por el autor (con `gpu_memory_utilization = 0.9`, `max_model_len = 65536`, `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). SGLang y TGI son alternativas tecnicamente plausibles para safetensors, pero no estan confirmadas por el autor. llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-epoch3 | 4,54 B | 65.536 en inferencia (300.000 en entrenamiento) | No disponible | 0 descargas, 1 like | Checkpoint de RL, sin benchmarks |
| Qwen/Qwen3.5-4B (modelo base) | 4 B aprox. (segun denominacion) | No disponible en esta informacion | No disponible en esta informacion | Modelo base publico referenciado en la config | Punto de partida del ajuste; sin datos de rendimiento en esta ficha |
| Otros modelos densos de 4 B de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de resultados de benchmarks ni de especificaciones verificadas de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los terminos de uso, por lo que el uso comercial es juridicamente incierto y requiere consultar a la organizacion autora.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada; la calidad real del ajuste es desconocida.
- Procedencia experimental: es el checkpoint de la epoca 3 de un experimento de RL orientado a una tarea concreta (nombre de dataset `filter-solvability-200`), lo que puede implicar sobreajuste a esa distribucion y degradacion en capacidades generales.
- Dependencia de un juez externo: la recompensa de RL proviene de un modelo juez via API (`gpt-5.6-luna`); los sesgos y errores sistematicos de ese juez pueden haberse transferido al modelo entrenado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano y agravado por la falta de evaluacion publica.
- Idiomas no declarados: se desconoce si el modelo conserva un rendimiento adecuado en castellano o en otros idiomas de su modelo base.
- Contexto largo con coste elevado: aunque la ventana de inferencia es de 65.536 tokens, la cache KV con esa longitud consume una cantidad de VRAM considerable que puede reducir el numero de secuencias concurrentes.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware modesto sin trabajo adicional de conversion.
- Solo texto: la configuracion usa `language_model_only = true`; no hay soporte multimodal.
- Adopcion nula: con 0 descargas, no existe evidencia de uso en produccion ni retroalimentacion de la comunidad sobre su estabilidad.
- Entorno de entrenamiento no reproducible de forma completa: el comando de entrenamiento referencia rutas absolutas locales y variables de entorno (`HF_TOKEN`, `JUDGE_BASE_URL`, `JUDGE_API_KEY`) que no se documentan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k-epoch3
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/datasets/Stage-org/qwen35-4b-filter-solvability-200-qwen38-27b-newprompt-4k
- Modelo base referenciado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion autora: https://huggingface.co/Stage-org
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados obtenidos corresponden a portales de ofertas de practicas y no guardan relacion con el artefacto analizado.

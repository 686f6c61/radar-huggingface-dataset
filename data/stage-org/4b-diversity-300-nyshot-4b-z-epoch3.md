# Stage-org/4b-diversity-300-nyshot-4b-z-epoch3

## Resumen

El modelo `Stage-org/4b-diversity-300-nyshot-4b-z-epoch3` es un checkpoint de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) derivado de `Qwen/Qwen3.5-4B`, publicado por la organización `Stage-org`. Según la información de procedencia incluida en el repositorio, se trata de un artefacto de investigación generado mediante un bucle de aprendizaje por refuerzo (RL) de 10.000 pasos y 3 épocas sobre el conjunto de datos `Stage-org/4b-diversity-300-nyshot-4b-z`, con un juez automático basado en un modelo externo (`gpt-5.6-luna`). El nombre del checkpoint sugiere un experimento centrado en la diversidad de respuestas con ejemplos «many-shot», aunque no hay documentación que lo confirme.

El repositorio no incluye model card descriptiva: únicamente contiene el bloque de procedencia del entrenamiento (comando, configuración TOML y trazabilidad del experimento). No se declaran licencia, idiomas soportados, pipeline de inferencia ni resultados de evaluación. El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y ocupa 9,1 GB, un tamaño coherente con pesos en precisión bf16 (unos 2 bytes por parámetro).

Su relevancia es fundamentalmente de investigación: permite estudiar el efecto de estrategias de diversidad y de RL con juez LLM sobre un modelo base de 4B, así como reproducir el pipeline de entrenamiento completo. Para uso en producción requiere validación previa, dado que no hay evaluación publicada, licencia declarada ni garantías de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5 (etiqueta `qwen3_5`; el modelo base declarado en la configuración es `Qwen/Qwen3.5-4B`). No se detallan número de capas, cabezas ni configuración de atención |
| Parámetros totales | 4.539.265.536 (≈4,54 B), dato real de los ficheros safetensors |
| Parámetros activos | No aplica: no se documenta una arquitectura MoE |
| Longitud de contexto | No confirmada. La configuración de entrenamiento usa `seq_len = 300000` en el learner y `max_model_len = 65536` en el servidor de inferencia vLLM durante el RL, pero no se especifica la ventana de contexto final del checkpoint |
| Tipos de cuantización | No se declaran. El repositorio solo contiene safetensors; el tamaño de 9,1 GB para 4,54 B parámetros equivale a ≈2 bytes por parámetro, consistente con bf16/fp16 |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingüe, pero el autor no lo declara para este checkpoint) |
| Licencia | No disponible. Al derivar de Qwen3.5, el uso comercial queda sujeto a la licencia del modelo base, que no se reproduce en este repositorio |
| Formato de pesos | safetensors (no se incluyen GGUF, AWQ ni GPTQ) |

## Arquitectura y entrenamiento

La arquitectura heredada es la del modelo base `Qwen/Qwen3.5-4B`, un transformer decoder con atención de tipo flash-attention 2 según los ajustes del entrenador (`"attn" = "flash_attention_2"`). No se publican detalles adicionales (número de capas, dimensión oculta, ratio GQA, vocabulario) en la información disponible.

El entrenamiento se realizó con un método de RL (`"method" = "rl"`) sobre el dataset `Stage-org/4b-diversity-300-nyshot-4b-z`, con 10.000 pasos de learner, 3 épocas, tamaño de lote 128 y una longitud de secuencia declarada de 300.000 tokens. El bucle de RL emplea `group_size = 8` (esquema tipo GRPO), optimizador AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0` y betas (0,9; 0,99), junto con una función de pérdida con máscara DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`. La generación durante el RL usa temperatura 0,9, `top_p = 1.0`, hasta 4.096 tokens y `enable_thinking = true`; la evaluación la realiza un juez externo (`gpt-5.6-luna`) con `reasoning_effort = "medium"`, temperatura 1,0, hasta 3 reintentos y 32 peticiones concurrentes como máximo. La orquestación permite hasta 256 rollouts en vuelo (vLLM, puerto 7000, `gpu_memory_utilization = 0.9`, `language_model_only = true`, parser de razonamiento `qwen3` y parser de tool calling `qwen3_coder`) y hasta 8 pasos fuera de política. Solo se conserva el último checkpoint de cada intervalo de 1.000 pasos de época, con `weights_only = true`.

No se documentan datos de preentrenamiento (número de tokens, composición del corpus), ni si hubo fases previas de SFT, DPO o RLHF, más allá de este bucle de RL.

## Capacidades

- Generación de texto y razonamiento: la configuración de RL activa el modo de pensamiento (`enable_thinking = true`) y emplea el parser de razonamiento `qwen3`, lo que indica soporte de cadenas de razonamiento antes de la respuesta final.
- Generación de código: el parser de tool calling configurado es `qwen3_coder`, lo que apunta a soporte de llamadas a funciones en formato compatible con modelos Qwen orientados a código. No hay evaluación publicada que lo cuantifique.
- Tool calling / function calling: soportado en la pila de entrenamiento (vLLM con `tool_call_parser = "qwen3_coder"`), no verificado de forma independiente en el checkpoint publicado.
- Agentes y razonamiento multi-paso: el bucle de RL contempla hasta 8 pasos fuera de política y múltiples turnos de generación, lo que encaja con flujos de agente, aunque no se aportan trayectorias ni evaluaciones.
- Multilingüismo: no declarado para este checkpoint. El modelo base Qwen3.5 es multilingüe por diseño, pero no hay confirmación de que el ajuste de RL haya preservado ese comportamiento.
- Capacidades especiales: modo de pensamiento (thinking) declarado; no se documentan capacidades de visión, audio ni otras modalidades (`language_model_only = true`).

## Casos de uso

- Reproducción de experimentos de RL: el repositorio documenta el comando de entrenamiento y la configuración completa (optimizador, pérdida, juez, vLLM), lo que permite reproducir o auditar el pipeline en un entorno con 2 GPU por nodo (1 de inferencia, 1 de entrenamiento).
- Investigación sobre diversidad de respuestas: el nombre del dataset y del checkpoint apuntan a un estudio sobre diversidad en RL; el checkpoint sirve como punto de comparación frente a otros intentos o épocas de la misma serie.
- Generación de datos sintéticos y anotación: con 4.096 tokens de generación y modo thinking, puede emplearse para producir respuestas candidatas que después se filtran con un juez, replicando el propio bucle de entrenamiento.
- Asistente de código en local: el modelo ocupa 9,1 GB en bf16 y admite cuantización a 4 bits, por lo que puede desplegarse en una GPU de 12-16 GB para autocompletado y refactorización asistida, siempre que se valide su calidad sin evaluaciones publicadas.
- Agentes con tool calling en pipelines internos: el soporte de `qwen3_coder` como parser de llamadas a funciones permite integrarlo en orquestadores que necesiten invocar APIs, aunque conviene envolver cada llamada con validación de esquema.
- Resumen y extracción estructurada en documentos largos: si se confirma la ventana de contexto amplia que sugiere la configuración (65.536 tokens en el servidor de RL), podría procesar expedientes o informes extensos, pero el requisito de memoria de la caché KV debe dimensionarse antes de comprometer el caso.
- Atención al cliente multi-turno: el modelo puede mantener conversaciones con historial largo, aunque la ausencia de evaluación y de licencia declarada obliga a un piloto cerrado antes de exponerlo a usuarios finales.
- Despliegue on-premise con datos sensibles: al distribuirse como safetensors y poder ejecutarse con vLLM o llama.cpp en hardware propio, encaja en escenarios donde no se permite enviar datos a APIs externas, sujeto a la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| MMLU | No publicado |
| HumanEval | No publicado |
| GSM8K | No publicado |
| MATH | No publicado |
| Benchmarks de tool calling o agentes | No publicado |
| Evaluación del juez `gpt-5.6-luna` usada en el RL | No publicada (solo se documenta la configuración del juez, no sus puntuaciones) |

## Requisitos de hardware

Estimaciones calculadas a partir de los 4.539 millones de parámetros declarados; el autor no las confirma.

| Precisión | Peso de los parámetros | VRAM total orientativa | GPU de ejemplo |
|---|---|---|---|
| bf16 / fp16 | ≈9,1 GB | ≥16 GB, más caché KV | RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB), A100 40/80 GB |
| INT8 | ≈4,5-5,0 GB | ≈8-10 GB | RTX 4070 Ti (12 GB), RTX 3060 (12 GB) |
| 4 bits (GGUF Q4_K_M, AWQ o GPTQ) | ≈2,6-3,0 GB | ≈5-6 GB con contexto corto | RTX 4060 (8 GB), RTX 3060 (12 GB), Jetson Orin |

- Cabe en GPU de consumo: sí. En bf16 en tarjetas de 24 GB; en 4 bits en tarjetas de 8-12 GB, siempre que se limite la longitud de contexto.
- Caché KV: no se dispone de la configuración de cabezas ni del ratio GQA, por lo que no es posible calcular el consumo exacto. Con ventanas de 65.536 tokens la caché KV puede superar el tamaño de los pesos si no se aplica cuantización de caché; conviene medirlo antes de fijar la longitud de contexto en producción.
- Despliegue: vLLM (es la pila usada en el propio entrenamiento, con `max_model_len = 65536`, `gpu_memory_utilization = 0.9` y parsers `qwen3` y `qwen3_coder`), SGLang, TGI y `transformers`. Para llama.cpp u Ollama es necesario convertir los safetensors a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los valores de los modelos de referencia provienen de su documentación pública; no se dispone de resultados del modelo analizado para comparar rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| Stage-org/4b-diversity-300-nyshot-4b-z-epoch3 | 4,54 B | No confirmado (config. de RL: 65.536 tokens en inferencia) | No declarada | No publicado |
| Qwen/Qwen3.5-4B (modelo base) | ≈4 B | No disponible en la información proporcionada | Sujeta a la licencia de Qwen3.5 | No disponible |
| Qwen3-4B | 4,0 B | 32.768 tokens nativos, ampliables con YaRN | Apache 2.0 | No disponible en esta ficha |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | No disponible en esta ficha |
| Gemma 3 4B IT | ≈4 B | 128.000 tokens | Términos de uso de Gemma | No disponible en esta ficha |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens | MIT | No disponible en esta ficha |

La diferencia principal frente a esas alternativas no es de tamaño ni de contexto, sino de naturaleza: los modelos citados son versiones instruct publicadas y evaluadas por sus fabricantes, mientras que este repositorio es un checkpoint de investigación con entrenamiento de RL adicional, sin licencia declarada ni métricas.

## Limitaciones y advertencias

- Ausencia de evaluación: no hay ningún benchmark ni evaluación cualitativa publicada; no es posible afirmar que el ajuste de RL mejore al modelo base en ninguna tarea y podría degradarlo en otras.
- Licencia no declarada: el repositorio no incluye licencia. Al derivar de Qwen3.5, se heredan las condiciones del modelo base, que deben consultarse antes de cualquier uso comercial. No se puede asumir uso libre.
- Riesgo de alucinación: inherente a los modelos de 4B y potencialmente acentuado por un ajuste de RL optimizado contra un juez automático, que puede premiar respuestas plausibles pero incorrectas.
- Sesgos del juez: la señal de recompensa procede de un modelo propietario (`gpt-5.6-luna`) con `reasoning_effort = "medium"`; los sesgos y el estilo de ese juez se transfieren al checkpoint, incluido su posible sesgo idiomático y cultural.
- Sesgo de dominio: el ajuste se realizó sobre un único dataset («diversity 300 nyshot»), sin documentación sobre su composición, idioma, licencia o procedencia; el modelo puede comportarse de forma deficiente fuera de esa distribución.
- Contexto incierto: la configuración de entrenamiento menciona longitudes muy distintas (300.000 tokens en el learner frente a 65.536 en el servidor de inferencia); no está claro cuál es la ventana efectiva del checkpoint, y forzar ventanas largas puede degradar la calidad.
- Idiomas no verificados: no se declara el soporte multilingüe y no hay pruebas de que el RL haya conservado las capacidades del modelo base en castellano u otros idiomas.
- Trazabilidad limitada: el bloque de procedencia incluye rutas absolutas de un sistema interno (`/NHNHOME/shkim/...`) y credenciales por variables de entorno, insuficientes para reproducir el entrenamiento fuera de esa infraestructura.
- Madurez: 0 descargas y 0 «likes»; se trata de un artefacto de experimento (`attempt-0001`, época 3), no de una versión estable mantenida.
- Requisitos de producción: si se activa el modo thinking, el consumo de tokens de salida se multiplica (hasta 4.096 tokens configurados), lo que afecta a la latencia y al coste por petición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-300-nyshot-4b-z-epoch3
- Organización autora: https://huggingface.co/Stage-org
- Modelo base declarado en la configuración: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/Stage-org/4b-diversity-300-nyshot-4b-z
- Paper, blog, repositorio de código o demo: no disponibles. La búsqueda web realizada no devolvió enlaces relevantes: los resultados corresponden a portales de ofertas de prácticas («stage» en francés) y no guardan relación con el modelo.

# Stage-org/4b-strat-failstart-300-27b-z-epoch3

## Resumen

`Stage-org/4b-strat-failstart-300-27b-z-epoch3` es un modelo de 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) publicado por la organización Stage-org en Hugging Face, con formato de pesos safetensors y la etiqueta de familia `qwen3_5`. Se trata de un artefacto derivado del modelo base declarado `Qwen/Qwen3.5-4B`, obtenido mediante un proceso de aprendizaje por refuerzo (RL) ejecutado con el framework `prime_rl` sobre el dataset `Stage-org/4b-strat-failstart-300-27b-z`. La model card no incluye descripción funcional, licencia, idiomas ni resultados de evaluación: el contenido publicado se limita a la procedencia del entrenamiento y al fichero de configuración efectivo.

Por el nombre del repositorio y la configuración, cabe interpretarlo como el resultado de un experimento de investigación (`failstart`, intento 1, época 3) más que como un lanzamiento orientado a producción. La configuración emplea decodificación con `enable_thinking = true` y evaluador automático basado en un modelo juez externo (`gpt-5.6-luna`), lo que sitúa el entrenamiento en el ámbito del razonamiento abierto con retroalimentación generada por modelo. El repositorio ocupa 9,1 GB y no registra descargas ni valoraciones en el momento de redactar esta ficha.

Es relevante ahora porque ejemplifica una pauta creciente: publicaciones de pesos intermedios de pipelines de RL sobre modelos densos pequeños (4B-5B), reutilizables para investigación en post-entrenamiento, agentes con uso de herramientas y razonamiento con cadena de pensamiento. No obstante, la ausencia de licencia explícita y de cualquier métrica publicada limita seriamente su uso en entornos comerciales sin una revisión jurídica y técnica previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita en la model card. El modelo base declarado es Qwen/Qwen3.5-4B y la etiqueta de familia es `qwen3_5`, lo que apunta a un transformer denso de la familia Qwen3.5; no se documenta ninguna variante MoE, SSM ni híbrida |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,54 mil millones), según los pesos safetensors |
| Parámetros activos | No aplica: no hay indicios de arquitectura MoE en la información disponible |
| Longitud de contexto | No disponible en la model card. La configuración de entrenamiento usa `seq_len = 300000` y la de inferencia `max_model_len = 65536`, pero no se confirma cuál es la ventana de contexto soportada por el modelo final |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. No se declara licencia en el repositorio |
| Formato de pesos | Safetensors (repositorio de 9,1 GB) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la model card. El entrenamiento parte del modelo base `Qwen/Qwen3.5-4B` y se ejecuta con `prime_rl` en modo `rl`, con 10.000 pasos de aprendiz, 3 épocas, tamaño de lote de 128 y longitud de secuencia de 300.000 tokens. El optimizador es AdamW con tasa de aprendizaje de 1e-06, `weight_decay = 0.0`, `max_norm = 1.0` y betas 0.9/0.99. La pérdida usa enmascarado DPPO con umbrales `dppo_mask_low = 0.2` y `dppo_mask_high = 0.28`, `adv_tau = 1.0` y `kl_tau = 0.001`, y se activa `flash_attention_2` como mecanismo de atención. El entrenamiento se reparte en 2 GPU por nodo: 1 para inferencia y 1 para entrenamiento, con `group_size = 8` y `max_off_policy_steps = 8`.

La señal de recompensa proviene de un evaluador automático (`open_ended_judge`) servido mediante un endpoint externo con el modelo `gpt-5.6-luna`, temperatura 1.0, `top_p = 1.0`, `max_tokens = 4096` y `reasoning_effort = "medium"`, con hasta 32 peticiones en vuelo y 3 reintentos. La generación durante el entrenamiento usa temperatura 0.9, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La inferencia del bucle de RL se sirve con vLLM (`gpu_memory_utilization = 0.9`, `max_model_len = 65536`), con `language_model_only = true` y los parsers `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`. Los checkpoints se guardan solo con pesos (`weights_only = true`) cada 1.000 pasos, conservando el último.

## Capacidades

- Generación de texto y razonamiento en modo «thinking»: la configuración de generación activa `enable_thinking = true` y el parser de razonamiento declarado es `qwen3`, lo que indica soporte de cadenas de pensamiento separadas de la respuesta final en la plantilla del modelo.
- Llamada a herramientas y funciones: el parser de tool calling configurado es `qwen3_coder`, lo que apunta a soporte de function calling en el formato de la familia Qwen. No se documenta el esquema exacto ni los formatos aceptados.
- Razonamiento multi-paso orientado a agentes: el pipeline de RL entrena contra un juez de respuesta abierta con múltiples pasos fuera de política (`max_off_policy_steps = 8`) y 256 rollouts en vuelo, lo que sugiere optimización para tareas de razonamiento de varios pasos.
- Capacidades multilingües: no disponibles. No se declara ningún idioma soportado.
- Codificación: no confirmada explícitamente, pero el uso del parser `qwen3_coder` en el pipeline de inferencia indica que el formato de llamada a herramientas procede de la línea de modelos de código de Qwen.
- Visión, audio y otras modalidades: no disponibles. La configuración de inferencia usa `language_model_only = true`, lo que descarta procesamiento multimodal en el bucle de entrenamiento.
- Ajuste por RL sobre respuesta abierta: el modelo incorpora preferencias destiladas de un juez automático, orientadas a la calidad de la respuesta abierta más que a tareas con respuesta verificable.

## Casos de uso

- Investigación en post-entrenamiento con RL: el repositorio documenta la configuración completa (`prime_rl`, hiperparámetros, estructura de recompensa y juez externo), lo que permite reproducir o modificar el pipeline para estudiar cómo afectan el enmascarado DPPO, `kl_tau` y el tamaño de grupo a un modelo denso de 4,5B.
- Agentes con uso de herramientas en local: al declarar `tool_call_parser = "qwen3_coder"` y caber en una GPU de consumo, puede desplegarse como ejecutor de llamadas a funciones en flujos de automatización interna, siempre que se valide previamente el formato de tool calling y la licencia.
- Asistencia de código en entornos con requisitos de confidencialidad: un modelo de 4,5B cuantizado puede ejecutarse en una estación de trabajo sin enviar código a servicios externos; es adecuado cuando la política de la organización prohíbe APIs de terceros, aunque no hay métricas publicadas de HumanEval ni similares que respalden su calidad.
- Generación de datos sintéticos para entrenamiento: puede utilizarse como generador de razonamientos y respuestas etiquetadas para alimentar pipelines de destilación o de RL posterior, aprovechando el modo «thinking» y el bucle de juez automático ya definido.
- Razonamiento encadenado en tareas de análisis: para descomposición de problemas en pasos intermedios (planificación, verificación de hipótesis, resolución de problemas cuantitativos) con la traza de pensamiento separada de la salida final, útil en cuadernos de análisis y herramientas de decisión internas.
- Despliegue en el borde o en hardware limitado: con 4,54B parámetros, cabe en GPUs de 12-24 GB tras cuantización, lo que habilita asistentes locales en portátiles con GPU dedicada o en servidores de gama media sin aceleradores de datacenter.
- Base para ajuste específico de dominio: al ser un checkpoint ajustado por RL sobre Qwen3.5-4B, puede servir como punto de partida para SFT o DPO en un dominio concreto (legal, sanitario, industrial) con un coste de cómputo bajo en comparación con modelos de 30B o superiores.
- Evaluación comparativa de recetas de RL: útil como referencia en estudios que comparen distintos jueces automáticos, tamaños de grupo o políticas de enmascarado, dado que el repositorio expone la configuración íntegra.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MATH, MT-Bench ni ninguna otra métrica, y la búsqueda web no ha devuelto documentación técnica asociada al modelo.

## Requisitos de hardware

- VRAM estimada en precisión completa (bf16/fp16): en torno a 9 GB solo para los pesos, más la caché KV. Coincide con el tamaño del repositorio (9,1 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB para pesos, más caché KV y overhead del runtime.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,5-3 GB para pesos, más caché KV; la caché crece de forma lineal con la longitud de contexto, por lo que ventanas largas (decenas de miles de tokens) pueden requerir bastante más memoria que los pesos.
- GPUs recomendadas: no hay recomendaciones del autor. Para bf16, una RTX 4090 (24 GB), L40S (48 GB), A100 (40/80 GB) o H100 (80 GB) ofrecen margen suficiente incluso con contextos largos. Para cuantización de 4 bits, una RTX 3060 de 12 GB o una RTX 4070 pueden ser suficientes con contextos moderados.
- Compatibilidad con GPU de consumo: sí, es previsible que quepa en GPUs de consumo de 12 GB o más tras cuantización; en bf16 requiere al menos 12-16 GB de VRAM disponible en la práctica.
- Opciones de despliegue: la configuración documentada usa vLLM con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`, `max_model_len = 65536` y `gpu_memory_utilization = 0.9`. También serían viables TGI o SGLang para servir safetensors, y llama.cpp u Ollama si se convierte a GGUF, aunque el repositorio no publica pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para este modelo ni para alternativas, por lo que la comparación se limita a características estructurales conocidas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stage-org/4b-strat-failstart-300-27b-z-epoch3 | 4,54B | No disponible (entrenamiento con secuencias de 300.000; inferencia configurada a 65.536) | No disponible | Safetensors en Hugging Face, 0 descargas | Checkpoint de RL; sin benchmarks ni model card descriptiva |
| Qwen/Qwen3.5-4B | No disponible en la información proporcionada | No disponible | No disponible | Modelo base declarado por el autor | Es el punto de partida del ajuste por RL; se desconoce si su licencia se hereda |
| Alternativas de ~4B de otras familias | No disponibles | No disponible | No disponible | No disponible | No se ha encontrado información verificable en la búsqueda realizada |

## Limitaciones y advertencias

- Ausencia total de licencia: no se declara licencia en el repositorio, lo que impide determinar si el uso comercial está permitido. Además, al derivar de `Qwen/Qwen3.5-4B`, podrían aplicarse los términos del modelo base, que no se documentan aquí. No debe utilizarse en producción sin resolver esta cuestión.
- Sin benchmarks ni evaluación publicada: no existen métricas de calidad, seguridad o robustez. Cualquier afirmación sobre su rendimiento sería especulativa.
- Riesgo elevado de alucinación y de deriva en el formato: el ajuste se realizó con un juez automático externo (`gpt-5.6-luna`) como única señal de recompensa, lo que puede favorecer respuestas que agradan al juez sin garantizar corrección factual.
- Contexto real incierto: aunque el entrenamiento usa `seq_len = 300000` y la inferencia se configura con `max_model_len = 65536`, no se confirma la ventana efectiva del modelo final ni su comportamiento más allá de cierta longitud.
- Idiomas no documentados: no se especifica qué lenguas soporta ni con qué calidad; se desconoce el comportamiento en castellano.
- Artefacto experimental: el nombre del repositorio (`failstart`) y la etiqueta de intento (`Attempt: 1`) sugieren un run de investigación, no una versión depurada y validada.
- Formato único de pesos: solo se publican safetensors; no hay GGUF, AWQ ni GPTQ, lo que obliga a convertir y validar por cuenta propia para despliegues en llama.cpp u Ollama.
- Sin señales de adopción: 0 descargas y 0 valoraciones, sin comunidad que haya verificado su comportamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento ni del modelo base, no es posible evaluar sesgos demográficos, culturales o de dominio.
- Reproducibilidad parcial: la model card incluye la ruta del dataset y la configuración, pero no los datos en sí ni los detalles del juez, y los checkpoints se guardan solo con pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Stage-org/4b-strat-failstart-300-27b-z-epoch3
- Dataset declarado en la model card: `Stage-org/4b-strat-failstart-300-27b-z` (referenciado por nombre; no se dispone de URL verificada en la información proporcionada)
- Modelo base declarado: `Qwen/Qwen3.5-4B` (referenciado por nombre; no se dispone de URL verificada en la información proporcionada)
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Los resultados devueltos corresponden a portales de ofertas de prácticas (stage.fr, 1jeune1solution.gouv.fr, welcometothejungle.com, jobs-stages.letudiant.fr) y no guardan relación con el modelo ni con su autor.
- Paper, blog, repositorio de código o demo: no disponibles.

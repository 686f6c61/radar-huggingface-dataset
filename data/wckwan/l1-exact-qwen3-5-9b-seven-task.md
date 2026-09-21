# wckwan/l1-exact-qwen3.5-9b-seven-task

## Resumen

l1-exact-qwen3.5-9b-seven-task es un ajuste fino por aprendizaje por refuerzo sobre el modelo Qwen/Qwen3.5-9B, publicado por el usuario wckwan en HuggingFace. El entrenamiento combina dos etapas de RL: primero GRPO sobre un conjunto de tareas denominado "seven-task" y despues una etapa de control de longitud de razonamiento conocida como L1 exact (Aggarwal & Welleck, 2025). El objetivo declarado es producir razonamiento eficiente, es decir, respuestas correctas con cadenas de pensamiento mas cortas de lo habitual en modelos de razonamiento convencionales.

La relevancia de este checkpoint es fundamentalmente metodologica: documenta de forma explicita los hiperparametros del entrenamiento (50 pasos de GRPO, 32 prompts por paso con 8 rollouts cada uno, learning rate 2e-6, coeficiente KL 1e-3, tope de rollout de 32K tokens, verl v0.9.1 con FSDP2 y vLLM) y el esquema de recompensa basado en la correccion de la respuesta situada despues del delimitador `</think>`. Es, por tanto, un artefacto util para reproducir y comparar recetas de RL para razonamiento eficiente sobre una base de 9.400 millones de parametros.

El modelo tiene 9.409.813.744 parametros totales segun los pesos en safetensors y un repositorio de 37,7 GB. La licencia declarada es Apache 2.0. No se publican idiomas soportados, resultados de benchmarks ni artefactos de cuantizacion en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta de arquitectura `qwen3_5` heredada del modelo base Qwen/Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; el entrenamiento usa un tope de rollout de 32K tokens y presupuestos L1 de hasta 32.768 tokens |
| Tipos de cuantizacion | No se publican artefactos cuantizados (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en este repositorio) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.5-9B en los datos disponibles; la unica pista es la etiqueta `qwen3_5` del repositorio. El modelo resultante no introduce cambios estructurales conocidos, sino que es un ajuste por RL sobre los pesos del modelo base. El repositorio ocupa 37,7 GB, un tamano coherente con pesos de 9,4 mil millones de parametros en precision completa o con artefactos auxiliares, aunque la composicion exacta del repositorio no se detalla.

El proceso de entrenamiento consta de dos etapas documentadas. La primera es GRPO sobre el ajuste `seven-task`: 50 pasos, 32 prompts por paso con 8 rollouts por prompt, learning rate 2e-6, coeficiente KL de 1e-3 y tope de rollout de 32.768 tokens, ejecutado con verl v0.9.1 (FSDP2 + vLLM). Los datos de entrenamiento son 512 ejemplos (semilla 0) extraidos de los splits oficiales de entrenamiento, con el prompt de sistema "Solve the user's task and give the final answer directly." y una recompensa basada en la correccion de la tarea aplicada al texto que aparece despues de `</think>`. La segunda etapa es el "L1 exact stage" de Aggarwal & Welleck (2025), que introduce una recompensa controlada por longitud (`thinkgram/rl/l1_reward.py`, alpha 0.0003) con presupuestos de 64 a 4096 tokens, y hasta 32.768 tokens en modo maximo, partiendo de Qwen/Qwen3.5-9B.

La innovacion tecnica destacable es precisamente ese control explicito de la longitud del razonamiento: la recompensa combina correccion de la tarea y ajuste al presupuesto de tokens, lo que permite obtener modelos que razonan de forma mas breve sin perder exactitud declarada en la tarea. No se menciona el uso de RLHF con preferencias humanas, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento explicito en modo pensamiento, con la cadena de razonamiento separada por el delimitador `</think>`.
- Razonamiento eficiente: el entrenamiento L1 penaliza o bonifica segun el presupuesto de longitud, buscando cadenas de pensamiento mas cortas.
- Resolucion de tareas con verificacion automatica de resultado, que es el criterio de recompensa usado en el ajuste `seven-task`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el modo `</think>` es compatible con flujos de razonamiento previo a la accion.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades de vision o audio: no disponible; el repositorio solo contiene pesos de lenguaje (tags `safetensors`, `qwen3_5`).

## Casos de uso

- Razonamiento matemático y de logica en produccion: el modelo esta ajustado con recompensa de correccion de tarea, por lo que encaja en pipelines donde la respuesta final se valida de forma programatica (por ejemplo, comparacion exacta de resultados numericos o ejecucion de tests).
- Evaluacion de razonamiento con presupuesto de tokens: al haberse entrenado con presupuestos L1 de 64 a 4096 tokens, permite estudiar el compromiso entre exactitud y coste de inferencia en entornos con latencia estricta.
- Investigacion en RL para modelos de lenguaje: la model card documenta hiperparametros completos (50 pasos, 32 prompts x 8 rollouts, lr 2e-6, KL 1e-3, verl v0.9.1), lo que lo convierte en un punto de partida reproducible para experimentos de GRPO y recompensas controladas por longitud.
- Generacion de codigo con verificacion posterior: puede integrarse en un pipeline de CI/CD donde el fragmento generado se compile o se someta a tests unitarios, usando la respuesta situada tras `</think>` como salida final evaluable.
- Extraccion y normalizacion de datos estructurados: para tareas con respuesta verificable (por ejemplo, conversion de texto a un registro con campos obligatorios) el criterio de recompensa usado en el entrenamiento es directamente aplicable como metricas de calidad.
- Asistencia en analisis tecnico por lotes: al ser un modelo de 9,4 mil millones de parametros y licencia Apache 2.0, puede desplegarse en infraestructura propia para procesar volumenes altos de consultas sin dependencia de APIs externas.
- Comparacion de recetas de razonamiento eficiente: sirve como linea base frente al modelo base Qwen/Qwen3.5-9B para medir el efecto del RL sobre la longitud de las cadenas de pensamiento y la exactitud final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de entrenamiento y la funcion de recompensa, sin tablas de MMLU, GSM8K, HumanEval ni metricas equivalentes, ni comparaciones cuantitativas con el modelo base. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 9.409.813.744 parametros, sin datos publicados por el autor): en bf16/fp16 en torno a 19-20 GB solo de pesos, mas cache KV; en int8 en torno a 10-11 GB; en 4 bits en torno a 6-7 GB.
- GPU recomendadas para bf16: A100 40 GB, A100 80 GB, H100, L40S 48 GB. Con contextos largos cercanos al tope de rollout de 32K tokens, la cache KV puede exigir GPUs de 80 GB o tensor parallel.
- GPUs de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en bf16 con margen limitado, y de forma mas holgada en cuantizacion de 8 o 4 bits; tarjetas de 16 GB requeriran cuantizacion de 4 bits.
- Opciones de despliegue: vLLM es la opcion natural, ya que es el motor usado durante el entrenamiento con verl; tambien son viables TGI o SGLang. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye artefactos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| l1-exact-qwen3.5-9b-seven-task | 9.409.813.744 | No disponible (entrenamiento con rollout de 32K) | Sin benchmarks publicados | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | HuggingFace |
| Otras alternativas de ~9B con RL para razonamiento eficiente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o seguridad; se desconoce el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion inherente a los modelos generativos de esta escala, mitigado parcialmente en el entrenamiento por la recompensa de correccion de tarea, pero no eliminado.
- El ajuste se realizo sobre solo 512 ejemplos (semilla 0) y 50 pasos de GRPO, un regimen muy corto que puede provocar sobreajuste al estilo y formato de las tareas de entrenamiento (`seven-task`) y degradar el rendimiento fuera de esa distribucion.
- El control de longitud del razonamiento (etapa L1) puede recortar cadenas de pensamiento en tareas que requieren deliberacion larga, reduciendo la exactitud en problemas complejos.
- No se declaran idiomas soportados; el prompt de sistema usado en el entrenamiento esta en ingles, por lo que el comportamiento en castellano u otros idiomas no esta verificado.
- No se publican artefactos de cuantizacion ni plantillas de chat, por lo que la integracion requiere verificar el formato de prompt (incluido el delimitador `</think>`) contra el modelo base.
- Aunque la licencia declarada es Apache 2.0, no se confirma en la informacion disponible la licencia del modelo base ni posibles terminos adicionales; conviene verificar la ficha de Qwen/Qwen3.5-9B antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes y fue creado en septiembre de 2026, sin evidencia de validacion por parte de la comunidad.
- Los resultados de la busqueda web no aportaron informacion sobre el modelo; todas las afirmaciones de esta ficha proceden de la model card y de los metadatos del repositorio.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/wckwan/l1-exact-qwen3.5-9b-seven-task
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia metodologica citada en la model card: Aggarwal & Welleck, 2025 (etapa L1 exact); URL no disponible en la informacion proporcionada.
- Script de recompensa citado en la model card: `thinkgram/rl/l1_reward.py`; repositorio no disponible en la informacion proporcionada.
- Framework de entrenamiento citado: verl v0.9.1; URL no disponible en la informacion proporcionada.
- Paper, blog, demo o repositorio adicionales: no disponibles; las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

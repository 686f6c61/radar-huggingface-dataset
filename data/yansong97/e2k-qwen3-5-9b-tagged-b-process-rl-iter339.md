# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter339

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter339 es un checkpoint de investigación publicado por el usuario YanSong97 en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-9B (9.653.104.368 parámetros totales) orientado a un problema muy concreto: la internalización de conocimiento ("experience-to-knowledge", E2K) sobre los entornos de primer nivel cd82 y m0r0 del benchmark ARC-AGI-3. El modelo combina una fase de SFT supervisado sobre un conjunto de 29 hechos observacionales y una fase de aprendizaje por refuerzo con recompensas de resultado y de progreso de estado de tarea.

El autor es explícito al señalar que no se trata de una mejora de propósito general del modelo base ni de una evidencia de éxito en layouts nuevos o en el juego completo. El checkpoint corresponde al rollout 339 (zero-based) de la rama RL "process", que parte del checkpoint iter199 y acumula 340 lotes completados de RL. El entrenamiento es textual/basado en rejilla: la torre de visión y los tensores auxiliares MTP no se entrenaron en este experimento, aunque se restauraron congelados en la exportación.

La relevancia del modelo es principalmente metodológica: documenta con detalle un protocolo de RL con recompensas privilegiadas de estado, penalizaciones de error y datos de conocimiento etiquetados, e incluye auditorías honestas de fallos (coordenadas fabricadas, mezcla de reglas entre juegos, desajustes entre explicación y acción). Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text; torre de visión y MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa ventana de entrada de 12K tokens con estado actual completo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (copiada de la exportación del modelo base) |
| Formato de pesos | safetensors (60 shards) + config/tokenizer/processor estándar de HF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer multimodal con pipeline image-text-to-text y clase de carga `Qwen3_5ForConditionalGeneration`. En este experimento la torre de visión y los tensores auxiliares MTP quedaron congelados y no se entrenaron; el ajuste se realizó sobre representaciones textuales y de rejilla. El entrenamiento se organiza en dos fases: una SFT sobre la rama `B_full`, inicializada de forma independiente desde Qwen/Qwen3.5-9B, con 59 actualizaciones, 3 épocas, LR 5e-6 y batch global 4, con supervisión completa del objetivo y sin enmascaramiento del cuerpo de conocimiento; y una fase de RL que arranca desde el SFT con Adam nuevo en la frontera SFT/RL.

La fase de RL emplea 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K tokens, ventana de entrada de 12K con estado actual completo y sin compactación automática, temperatura 1, LR constante 1e-6 y paralelismo TP4/PP1. Cada lote contiene 8 episodios (4 cd82 + 4 m0r0) con semilla de entorno 0 y nivel inicial 0. La recompensa de resultado exige un "clear" real de primer nivel; la rama de proceso añade una recompensa de progreso de estado de tarea ligada a replay independiente, con tope 0.2 y gamma 0.99 sobre acciones reales, usando estado/planificación privilegiados en el lado de la recompensa. El conjunto de conocimiento local contiene 29 hechos de primer nivel (22 cd82 / 7 m0r0) representados en 58 filas pregunta/respuesta, más 12 ejemplos de estado/aplicación construidos y 8 ejemplos de protocolo de mirada inicial.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre tareas de rejilla y entornos tipo ARC-AGI-3.
- Internalización de conocimiento factual acotado: 29 hechos de primer nivel de los entornos cd82 y m0r0.
- Ejecución de episodios de agente con hasta 40 acciones de entorno por episodio y estado actual completo en contexto.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la torre de visión no fue entrenada en este experimento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo de razonamiento con esfuerzo configurable (el entrenamiento usó "medium reasoning effort").
- No se documentan capacidades de audio ni de visión entrenada específicamente para esta tarea.

## Casos de uso

- Investigación en internalización de conocimiento: usar el checkpoint como referencia para estudiar cómo el RL con recompensas de proceso afecta a la retención de hechos en entornos de rejilla, comparando con los checkpoints de la serie (iter199, iter249, iter339).
- Reproducción de protocolos de RL con recompensa de estado: el modelo y sus datasets asociados permiten replicar el esquema de recompensa de progreso ligado a replay con tope 0.2 y gamma 0.99.
- Auditoría de fallos de razonamiento: sirve para estudiar patrones documentados como coordenadas fabricadas, mezcla de reglas entre cd82 y m0r0, y desajuste entre explicación y acción en episodios exitosos.
- Benchmarking de agentes en ARC-AGI-3: evaluación controlada en los entornos de primer nivel cd82 y m0r0 con semilla 0 y nivel inicial 0.
- Estudio de no monotonicidad del aprendizaje: el autor documenta que el aprendizaje está dominado por m0r0 y no es monótono, lo que permite analizar la dinámica de RL en tareas con recompensa dispersa.
- Inicialización de experimentos futuros: los pesos HF pueden inicializar nuevos trabajos (no así la continuación exacta de Adam, ya que no se subió estado de optimizador, RNG ni sampler).
- Docencia y divulgación: ejemplo realista de model card con limitaciones explícitas y trazabilidad de artefactos (provenance.json con SHA256).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y advierte explícitamente que las etiquetas y recitaciones no son evidencia de uso correcto del conocimiento, y que la cohorte de muestreo se generó antes de su actualización, por lo que no debe reportarse como evaluación independiente de estos pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parámetros en bfloat16, se requieren aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 19,3 GB en safetensors.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para bfloat16 sin cuantizar; RTX 4090 (24 GB) puede ser justa para bfloat16 y requeriría cuantización para contexto largo.
- Cabe en GPU de consumo: probablemente en RTX 4090 24 GB con cuantización (no se publican GGUF oficiales); en GPUs de 16 GB no cabría sin cuantización agresiva.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration.from_pretrained(..., torch_dtype=torch.bfloat16, device_map="auto")`; el autor entrenó con Megatron-LM y SLIME, pero no documenta recetas de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter339 | 9,65 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Checkpoint de investigación, no propósito general |
| Qwen/Qwen3.5-9B (base) | ~9,65 B | no disponible | Apache-2.0 (según exportación) | Hugging Face | Modelo base multimodal sin el ajuste E2K |
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 | ~9,65 B | no disponible | Apache-2.0 | Hugging Face | Checkpoint padre de esta etapa RL |
| Checkpoints de ziyan98 (colecciones E2K) | no disponible | no disponible | no disponible | Hugging Face | Proyecto separado; el autor indica que no hereda sus puntuaciones |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B: está especializado en los entornos cd82 y m0r0 de primer nivel.
- No hay evidencia de éxito en layouts nuevos ni en el juego completo de ARC-AGI-3.
- Las auditorías del autor detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- El aprendizaje es no monótono y está dominado por m0r0; la continuación de proceso se detuvo en 341 muestras fallidas, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos pico exactos 260..269 no se conservan; HF249 no está etiquetado como el mejor checkpoint.
- Las etiquetas y la recitación no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado de sampler: los pesos HF inicializan trabajo futuro pero no permiten continuación exacta de Adam.
- La torre de visión y los tensores MTP están congelados y no fueron entrenados en este experimento.
- Riesgo de alucinación y sesgos: no documentados explícitamente más allá de las auditorías de fallos de razonamiento; los idiomas soportados no están declarados.
- Licencia Apache-2.0 copiada de la exportación del modelo base; verificar términos del modelo base para uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter339
- Checkpoint padre (iter199): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de layouts (proyecto separado): colecciones E2K de ziyan98 en Hugging Face (sin URL directa en la información proporcionada)

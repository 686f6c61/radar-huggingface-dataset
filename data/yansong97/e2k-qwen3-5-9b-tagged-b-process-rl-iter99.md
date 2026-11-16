# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter99 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B, publicado por el usuario YanSong97 en Hugging Face. No se trata de una mejora de propósito general del modelo base, sino de un artefacto experimental centrado en el estudio de la internalización de conocimiento ("experience-to-knowledge", E2K) en entornos de tipo ARC-AGI-3, concretamente en los entornos de primer nivel cd82 y m0r0. El modelo conserva la arquitectura y el pipeline image-text-to-text del Qwen3.5-9B original, con 9.653.104.368 parámetros totales y pesos en safetensors (60 shards, 19,3 GB de repositorio).

El checkpoint corresponde a la iteración 99 (basada en cero) de una rama de aprendizaje por refuerzo ("process arm") que parte de un SFT denominado `B_full`, inicializado de forma independiente desde Qwen3.5-9B. El entrenamiento combina supervisión de resultados, verificación de estados de tarea y penalizaciones por error, con recompensas de progreso ligadas a replays privilegiados. La relevancia actual es metodológica: documenta con detalle la ascendencia de checkpoints, el protocolo de recompensa y las limitaciones observadas, lo que lo convierte en material útil para investigadores que estudian RL sobre modelos multimodales y evaluación de agentes.

Es importante subrayar que el autor advierte explícitamente de que este checkpoint no constituye evidencia de éxito en layouts nuevos ni en partidas completas, y que el aprendizaje observado es no monótono y está dominado por el entorno m0r0. La licencia es Apache-2.0, heredada del export original del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text); torre de visión congelada en este experimento |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento RL usa 12K de entrada y tope de salida de 16K) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, según `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5, un transformer multimodal con torre de visión y pipeline image-text-to-text, invocado mediante `Qwen3_5ForConditionalGeneration`. En este experimento concreto, el entrenamiento es textual y basado en rejillas ("text/grid-based"): la torre de visión y los tensores auxiliares MTP no se entrenaron y se restauraron congelados mediante el helper de exportación. El SFT (`B_full`) se realizó con 59 actualizaciones, 3 épocas, learning rate 5e-6 y batch global 4, con supervisión completa del objetivo y sin enmascaramiento del cuerpo de conocimiento. La rama RL arranca desde ese SFT con un Adam nuevo en la frontera SFT/RL, y las reanudaciones en 69/99/199 conservan estado nativo de optimizador, scheduler, RNG y sampler.

La fase RL de esta iteración cubre los rollouts 70 a 99 inclusive (30 batches), con 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, contexto de entrada de 12K con estado actual completo, temperatura 1, learning rate constante de 1e-6 y paralelismo TP4/PP1. Cada batch contiene 8 episodios (4 cd82 + 4 m0r0) con semilla de entorno 0 y nivel inicial 0. El conjunto de conocimiento observacional local consta de 29 hechos de primer nivel (22 de cd82, 7 de m0r0) representados en 58 filas pregunta/respuesta, más 12 ejemplos construidos de estado/aplicación y 8 ejemplos de protocolo de primera observación. La recompensa de resultado exige una limpieza real de primer nivel; la rama de proceso añade progreso de estado de tarea verificado por replay, con tope 0,2 y gamma 0,99, usando planificación privilegiada en el lado de la recompensa que no evalúa la verdad del razonamiento.

## Capacidades

- Generación de texto y razonamiento multimodal heredado de Qwen3.5-9B (pipeline image-text-to-text), aunque la torre de visión está congelada y no fue entrenada en este experimento.
- Razonamiento multi-paso orientado a agentes en entornos interactivos basados en rejillas, con hasta 40 acciones por episodio.
- Internalización de conocimiento factual de dominio específico (29 hechos de primer nivel sobre los entornos cd82 y m0r0).
- Aplicación de protocolos de observación inicial ("initial-look") y de estado de tarea.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card incluye texto en chino pero no declara idiomas soportados.
- Modo "thinking" o esfuerzo de razonamiento configurable: el entrenamiento RL usa "medium reasoning effort", lo que sugiere control de esfuerzo de razonamiento, si bien no se detalla la interfaz.
- No se declaran capacidades de audio ni de agente autónomo general fuera de los entornos de entrenamiento.

## Casos de uso

- Investigación en internalización de conocimiento: el checkpoint sirve para estudiar si un modelo puede recitar y aplicar hechos de dominio (29 hechos, 58 pares pregunta/respuesta) sin inyectarlos en el prompt del actor durante RL, comparando ramas SFT y RL.
- Estudio de recompensas de proceso en RL: permite reproducir y analizar el efecto de recompensas de progreso de estado de tarea verificadas por replay (tope 0,2, gamma 0,99) frente a recompensas solo de resultado en tareas de agente.
- Evaluación de agentes en entornos tipo ARC-AGI-3: útil como línea base experimental en los entornos cd82 y m0r0 para medir tasas de limpieza de primer nivel y modos de fallo (coordenadas fabricadas, mezcla de reglas entre juegos).
- Auditoría de alineación explicación-acción: el modelo permite estudiar desajustes entre el razonamiento declarado y la acción ejecutada, un fenómeno documentado por el autor incluso en episodios exitosos.
- Reproducción de protocolos de entrenamiento: los metadatos de ascendencia y los datasets de runs permiten reconstruir la serie de checkpoints (por ejemplo, el padre iter69) y analizar la no monotonía del aprendizaje.
- Punto de partida para fine-tuning posterior: los pesos en safetensors pueden inicializar nuevos experimentos, aunque no permiten continuar exactamente el estado de Adam original.
- Docencia y divulgación técnica: caso práctico de model card rigurosa que separa resultados de entrenamiento de evaluaciones independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas tipo MMLU, HumanEval o GSM8K, y advierte que la cohorte de muestreo registrada en `training_metadata.json` se generó antes de su actualización, por lo que no debe presentarse como evaluación independiente de estos pesos. La recompensa nativa `rollout/rewards` es una ventaja media ponderada por respuesta, no la recompensa del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en bfloat16 se requieren aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 10-11 GB y en 4 bits unos 6-7 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 sin cuantizar; RTX 4090 (24 GB) puede alojar los pesos en bfloat16 de forma ajustada con `device_map="auto"` y offload parcial.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más mediante cuantización o reparto de capas; en 16 GB requeriría cuantización agresiva u offload a CPU.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter99 | 9,65B | no disponible | Apache-2.0 | Checkpoint de investigación RL sobre entornos cd82/m0r0; visión congelada |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Apache-2.0 (según export original) | Modelo base multimodal de propósito general; sin el entrenamiento E2K |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter69 | ~9B | no disponible | Apache-2.0 | Checkpoint padre de esta etapa; misma rama de proceso |
| ziyan98 E2K collections | no disponible | no disponible | no disponible | Proyecto de referencia de layout citado por el autor; experimentos, datasets y modelos separados que no heredan sus puntuaciones |

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es una mejora de propósito general de Qwen3.5-9B ni evidencia de éxito en layouts nuevos o partidas completas.
- El aprendizaje es no monótono y está dominado por el entorno m0r0; la continuación larga de proceso se detuvo en 341 muestreos fallidos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos del pico 260..269 no se conservan, y HF249 no está etiquetado como el mejor checkpoint.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo registrada no constituye una evaluación independiente de estos pesos.
- La torre de visión y los tensores MTP no se entrenaron; las capacidades visuales son las del modelo base congelado y no se han validado en este experimento.
- No se suben estados de optimizador, checkpoints distribuidos nativos, pickle, RNG ni sampler; los pesos no permiten continuar exactamente el entrenamiento con Adam.
- Licencia Apache-2.0 heredada del export original; conviene verificar las condiciones del modelo base Qwen3.5-9B para uso comercial.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos de sesgos en la información disponible; el riesgo de alucinación está confirmado por las auditorías del propio autor en el dominio de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99
- Checkpoint padre (iter69): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter69
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de layout (ziyan98, proyecto separado): no disponible como enlace directo en la información proporcionada

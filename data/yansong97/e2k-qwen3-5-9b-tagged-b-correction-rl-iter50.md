# YanSong97/E2K-Qwen3.5-9B-tagged-B-correction-rl-iter50

## Resumen

E2K-Qwen3.5-9B-tagged-B-correction-rl-iter50 es un checkpoint de investigación publicado por YanSong97, derivado del modelo base Qwen/Qwen3.5-9B mediante un pipeline de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) orientado a la internalización de conocimiento en entornos de tipo ARC-AGI-3. El modelo parte de la arquitectura Qwen3.5 multimodal (pipeline image-text-to-text) con 9.653.104.368 parámetros totales y se distribuye bajo licencia Apache-2.0.

El objetivo del experimento es el paradigma "experience-to-knowledge" (E2K): entrenar al modelo para que retenga y aplique conocimiento factual de primer nivel sobre dos entornos concretos, denominados cd82 y m0r0, en lugar de resolver tareas de forma general. El autor advierte explícitamente de que no se trata de una mejora de propósito general de Qwen3.5-9B ni de una evidencia de éxito en layouts nuevos o en el juego completo.

Este checkpoint concreto corresponde al brazo de RL "correction" (penalizaciones por formato y errores, sin recompensa de proceso), en la iteración 50 (zero-based) del rollout, partiendo del SFT `B_full` (step 58). Es relevante como artefacto de investigación reproducible sobre internalización de conocimiento y RL en entornos de grid, no como modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text); clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento RL usa ventana de entrada de 12K con "recent4" y estado actual completo, tope de salida de 16K) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, según `model.safetensors.index.json`), más config/tokenizer/processor estándar de HF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 multimodal, con torre de visión y tensores auxiliares MTP (multi-token prediction) presentes en el export, aunque **congelados**: el autor indica que la torre de visión y los tensores MTP no se entrenaron en este experimento y que los assets de inferencia congelados se restauraron mediante el helper de exportación. El entrenamiento es exclusivamente texto/grid.

El proceso de entrenamiento consta de dos etapas. La etapa SFT (`B_full`) se inicializó de forma independiente desde Qwen/Qwen3.5-9B, con 59 actualizaciones, 3 épocas, learning rate 5e-6, batch global 4 y supervisión completa del target sin enmascarado del cuerpo de conocimiento. La etapa RL parte de ese SFT con Adam reiniciado en la frontera SFT/RL y emplea 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, ventana de entrada de 12K con "recent4" y estado actual completo, sin compactación automática, temperatura 1, learning rate 1e-6 constante y TP4/PP1. Cada batch contiene 8 episodios (4 de cd82 y 4 de m0r0), con semilla de entorno 0 y arranque en nivel 0/cap 1.

La recompensa de esta rama "correction" se basa en un clear real de primer nivel configurado, con fallback aleatorio legal y pequeñas penalizaciones locales por errores de llamada; no incluye recompensa de proceso (la rama de proceso, separada, añade progreso de estado de tarea con tope 0,2 y gamma 0,99). El conjunto de conocimiento local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0) representados en 58 filas pregunta/respuesta, más 12 ejemplos construidos de estado/aplicación y 8 ejemplos de protocolo de inspección inicial. Las respuestas de conocimiento no se inyectan en los prompts del actor durante RL.

## Capacidades

- Generación de texto y razonamiento multi-paso en episodios de entorno con hasta 40 acciones por episodio.
- Procesamiento de entradas multimodales (image-text-to-text) a nivel de arquitectura, si bien la torre de visión está congelada y no fue entrenada en este experimento.
- Internalización y recuperación de conocimiento factual acotado sobre los entornos cd82 y m0r0 (29 hechos de primer nivel).
- Ejecución de políticas de acción sobre grids/estado de entorno en el marco de ARC-AGI-3.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: sí, en la forma específica de episodios de agente sobre entorno con observación, razonamiento y acción.
- Capacidades multilingües: no disponible (la model card incluye texto en chino, pero no se documenta cobertura de idiomas).
- Capacidad especial: modo de razonamiento con "medium reasoning effort" y tope de salida de 16K durante el entrenamiento RL.

## Casos de uso

- Investigación en internalización de conocimiento: reproducir el pipeline SFT + RL sobre entornos controlados para estudiar si el modelo retiene hechos y los aplica en decisiones, usando los datasets de conocimiento y runs publicados por el autor.
- Estudio de recompensas en RL para agentes: comparar la rama "correction" (penalizaciones de formato/error) con la rama "process" (progreso de estado) usando los protocolos y métricas del dataset `E2K-tagged-knowledge-rl-runs`.
- Auditoría de fallos de razonamiento en agentes: el checkpoint es útil como caso de estudio de alucinación de coordenadas, mezcla de reglas entre juegos y desajuste explicación/acción, documentados por el autor incluso en episodios exitosos.
- Baseline para experimentos ARC-AGI-3: servir como punto de partida congelado (iter 50) para comparar nuevas variantes de SFT o RL en los entornos cd82 y m0r0.
- Inicialización de trabajo futuro: los pesos HF permiten inicializar nuevos entrenamientos (no así continuar Adam de forma exacta, ya que no se suben estados de optimizador).
- Evaluación de robustez de políticas sobre grids: analizar el comportamiento no monótono del aprendizaje y la dominancia del entorno m0r0 en la curva de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas de MMLU, HumanEval, GSM8K ni de éxito en ARC-AGI-3; únicamente advierte de que la cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente de estos pesos, y de que `rollout/rewards` es una ventaja media ponderada por respuesta, no la recompensa de entorno.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo de pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para bf16 con contexto moderado.
- Cuantización: no se publican variantes cuantizadas; habría que generarlas (por ejemplo, con llama.cpp o GPTQ/AWQ) a partir de los safetensors, sin garantía del autor.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs consumer de 24 GB (RTX 3090/4090) para bf16 ajustado; el entrenamiento original usó TP4/PP1, lo que sugiere despliegue multi-GPU en el entorno de entrenamiento.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB en bf16 con `device_map="auto"` y contexto contenido; en 16 GB requeriría cuantización.
- Opciones de despliegue: transformers (carga documentada con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`); vLLM, llama.cpp, Ollama o TGI: no documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-correction-rl-iter50 | 9.653.104.368 | no disponible | Apache-2.0 | Checkpoint de investigación E2K/ARC-AGI-3, sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo base del que deriva este checkpoint; capacidades generales no evaluadas aquí |
| YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58 | no disponible en la informacion proporcionada | no disponible | Apache-2.0 (heredada) | Padre SFT de esta etapa RL; mismo linaje experimental |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (internalización de conocimiento en ARC-AGI-3) en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que **no es una mejora de propósito general** de Qwen3.5-9B ni evidencia de éxito en layouts nuevos o en el juego completo.
- El conocimiento está acotado a 29 hechos de primer nivel de dos entornos (cd82 y m0r0); no generaliza a otros juegos o layouts.
- Auditorías del autor detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida, incluso en episodios exitosos.
- El aprendizaje es no monótono y dominado por m0r0; la rama de proceso se detuvo en 341 episodios todos fallidos, dejando 340 como última actualización verificada.
- Los pesos del pico 260..269 no se conservan; HF249 no está etiquetado como el mejor checkpoint.
- Las etiquetas/recitación de conocimiento no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo se generó antes de su actualización y no debe usarse como evaluación independiente de estos pesos.
- No se suben estados de optimizador, checkpoint distribuido nativo, pickle, RNG ni sampler; los pesos HF no permiten continuar Adam de forma exacta.
- La torre de visión y los tensores MTP están congelados y no fueron entrenados; el pipeline image-text-to-text no debe asumirse como capacidad entrenada.
- Licencia Apache-2.0 heredada del export base; el autor no documenta restricciones adicionales, pero al ser un checkpoint de investigación no hay garantías de idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-correction-rl-iter50
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint SFT padre: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Referencia de layouts (proyecto separado, sin herencia de scores): colecciones E2K de ziyan98 en Hugging Face (no se proporciona URL directa en la información disponible)

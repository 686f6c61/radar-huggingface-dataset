# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter69

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter69 es un checkpoint de investigación publicado por YanSong97, derivado por ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B. El prefijo E2K hace referencia a "experience-to-knowledge", una línea de trabajo orientada a la internalización de conocimiento factual en modelos multimodales de tipo image-text-to-text. El modelo conserva la arquitectura del base, con 9.653.104.368 parámetros totales y pesos en formato safetensors (60 shards, 19,3 GB de repositorio).

El entrenamiento se centró en dos entornos concretos de ARC-AGI-3 (cd82 y m0r0) y en un conjunto local de 29 hechos de primer nivel (22 de cd82 y 7 de m0r0), representados por 58 filas de pregunta/respuesta. La etapa publicada corresponde al rollout 69 de RL (70 lotes completados en esta rama), partiendo del checkpoint SFT `E2K-Qwen3.5-9B-tagged-sft-B-full-step58`. El autor advierte explícitamente de que no se trata de una mejora de propósito general de Qwen3.5-9B ni de evidencia de éxito en diseños nuevos o en el juego completo.

La relevancia de este checkpoint es metodológica más que de producto: documenta con detalle el protocolo de SFT y RL, las recompensas de proceso y de resultado, y las limitaciones observadas (coordenadas fabricadas, mezcla de reglas entre juegos, desajustes entre explicación y acción, aprendizaje no monótono). Es un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (Qwen3.5); torre de visión congelada en este experimento |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento RL se usó entrada de 12K con estado actual completo y tope de salida de 16K |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, indexados por `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 en su variante condicional para image-text-to-text (`Qwen3_5ForConditionalGeneration`), con torre de visión y tensores auxiliares MTP. En este experimento, sin embargo, el entrenamiento fue exclusivamente textual y basado en rejillas (grid): ni la torre de visión ni los tensores MTP se entrenaron, y se restauraron congelados mediante el helper de exportación. La etapa SFT (`B_full`) se inicializó de forma independiente desde Qwen/Qwen3.5-9B, con 59 actualizaciones, 3 épocas, LR 5e-6 y batch global 4, con supervisión completa del objetivo y sin enmascarado del cuerpo de conocimiento.

La etapa RL parte del SFT con Adam reiniciado y emplea 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, ventana de entrada de 12K con estado actual completo, temperatura 1 y LR constante 1e-6, con TP4/PP1. Cada lote contiene 8 episodios (4 de cd82 y 4 de m0r0), semilla de entorno 0 y nivel inicial 0. La recompensa de resultado exige una limpieza real de primer nivel; la rama de proceso añade una señal de progreso de estado de tarea verificada por replay, acotada a 0,2, con gamma 0,99 sobre acciones reales, usando estado y planificación privilegiados en el lado de la recompensa. Las reanudaciones en los pasos 69/99/199 conservan estado nativo de optimizador, scheduler, RNG y sampler.

## Capacidades

- Generación de texto y razonamiento sobre estados de tarea en formato textual/rejilla, orientado a los entornos cd82 y m0r0 de ARC-AGI-3.
- Internalización de conocimiento factual acotado: 29 hechos de primer nivel (22 de cd82, 7 de m0r0) más 12 ejemplos construidos de estado/aplicación y 8 ejemplos de protocolo de primera observación.
- Interacción multi-turno con historial: ventana de entrada de 12K con los 4 turnos más recientes y estado actual completo durante el entrenamiento RL.
- Razonamiento multi-paso dentro de un episodio: hasta 40 acciones de entorno por episodio con esfuerzo de razonamiento medio.
- Procesamiento image-text-to-text a nivel de arquitectura (pipeline `image-text-to-text`, `AutoProcessor`), aunque la torre de visión no fue entrenada en este experimento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card incluye texto en chino e inglés, pero no se declara cobertura de idiomas.
- Modo thinking explícito: no disponible como capacidad documentada; el entrenamiento usa "medium reasoning effort" sin detallar el mecanismo.

## Casos de uso

- Investigación en internalización de conocimiento: reproducir el pipeline SFT + RL sobre un conjunto pequeño y verificable de hechos (58 filas) para estudiar cuánto conocimiento factual se retiene tras el ajuste y cómo se degrada con el RL.
- Estudio de recompensas de proceso en agentes: utilizar la señal de progreso de estado de tarea verificada por replay (cap 0,2, gamma 0,99) como referencia para diseñar recompensas densas en entornos con recompensa de resultado escasa.
- Evaluación de agentes en ARC-AGI-3: emplear el checkpoint como línea base entrenada en cd82 y m0r0 para medir transferencia a diseños nuevos, sabiendo que el autor no reclama éxito en layouts no vistos.
- Auditoría de fallos en agentes: el checkpoint exhibe fallos documentados (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicación/acción, generación repetida), lo que lo hace útil como caso de estudio para sistemas de verificación y detección de alucinación en trayectorias.
- Reproducción de protocolos de entrenamiento distribuido: el repo documenta TP4/PP1, gestión de reanudaciones con estado nativo y exportación de pesos, útil para equipos que montan pipelines con Megatron-LM y slime.
- Inicialización de experimentos posteriores: los pesos publicados pueden inicializar trabajos futuros de SFT o RL, aunque no permiten continuar Adam de forma exacta al no incluirse estado de optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de ARC-AGI-3 comparables; únicamente advierte de que las etiquetas y recitaciones no son evidencia de uso correcto del conocimiento y de que el aprendizaje observado es no monótono y dominado por m0r0.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos (9,65 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda reservar 24 GB o más.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para despliegue cómodo en bfloat16; en consumer, RTX 4090 (24 GB) puede ajustar con `device_map="auto"` y cuantización, con margen limitado.
- Cabe en GPU consumer: sí, en RTX 4090/3090 (24 GB) en bfloat16 con gestión cuidadosa de memoria, o en GPUs de 16 GB recurriendo a cuantización de 8 o 4 bits (no se publican pesos cuantizados oficiales).
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (ruta documentada por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento usó TP4/PP1, lo que sugiere que el autor operó en un nodo multi-GPU, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter69 | 9,65 B | no disponible (entrenamiento RL con entrada de 12K) | Apache-2.0 | Hugging Face, 0 descargas, 0 likes | Checkpoint de investigación en ARC-AGI-3; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | ~9 B (heredado) | no disponible | Apache-2.0 (heredada) | Hugging Face | Modelo de propósito general del que deriva; este checkpoint no es una mejora general del base |
| YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58 | ~9 B (heredado) | no disponible | Apache-2.0 | Hugging Face | Padre SFT de esta etapa RL; misma línea experimental |
| E2K de ziyan98 (colección de referencia) | no disponible | no disponible | no disponible | Hugging Face | Proyecto separado citado como referencia de layout; no se heredan sus puntuaciones |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B: el ajuste se limita a dos entornos de primer nivel (cd82 y m0r0) y a un conjunto de 29 hechos; no hay evidencia de éxito en diseños nuevos ni en el juego completo.
- Sesgos y fallos documentados por el autor: coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida, incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no demuestran uso correcto del conocimiento; la auditoría debe basarse en ejecución real.
- Aprendizaje no monótono y dominado por m0r0; la continuación larga de proceso se detuvo en 341 muestreos con todos los fallos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos pico exactos 260..269 no se conservan y HF249 no está etiquetado como el mejor checkpoint.
- La cohorte de muestreo registrada en `training_metadata.json` se generó antes de su actualización y no debe presentarse como evaluación independiente de estos pesos.
- La recompensa de proceso usa estado y planificación privilegiados en el lado de la recompensa y no puntúa la veracidad del razonamiento; los fallbacks aleatorios terminales no reciben crédito de resultado.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler: los pesos permiten inicializar trabajo futuro pero no continuar Adam de forma exacta.
- Idiomas soportados no declarados; no se garantiza cobertura multilingüe.
- Licencia Apache-2.0 heredada de la exportación base; conviene verificar las condiciones del modelo base Qwen3.5-9B antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter69
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint SFT padre: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Referencia de layout (ziyan98, proyecto separado): no disponible como URL directa en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada

# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter249

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter249 es un checkpoint de investigación publicado por YanSong97, derivado de Qwen/Qwen3.5-9B mediante supervisión fina (SFT) y aprendizaje por refuerzo (RL) sobre tareas de internalización de conocimiento en entornos ARC-AGI-3. El modelo no es una mejora de propósito general de Qwen3.5-9B: está entrenado específicamente para resolver los entornos de primer nivel cd82 y m0r0, y el propio autor advierte que no constituye evidencia de éxito en diseños nuevos ni en el juego completo.

El checkpoint corresponde al rollout 249 (250 lotes de RL completados en esta rama), con 9.653.104.368 parámetros totales, licencia Apache-2.0 y pesos en safetensors distribuidos en 60 shards (19,3 GB de repositorio). La arquitectura subyacente es la de Qwen3.5, un transformer multimodal con pipeline image-text-to-text, aunque el entrenamiento realizado es exclusivamente textual/basado en rejilla: la torre de visión y los tensores auxiliares MTP se mantuvieron congelados.

Su relevancia es metodológica más que práctica: documenta un experimento de "experiencia a conocimiento" (E2K) con recompensas de resultado verificado, progreso de estado de tarea y penalizaciones de error, e incluye auditorías explícitas de fallos (coordenadas fabricadas, mezcla de reglas entre juegos, desajustes explicación/acción). Es un artefacto para investigación en RL sobre agentes, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text); torre de visión y MTP congelados en este experimento |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en RL se usó ventana reciente de 4 turnos, entrada de 12K y estado actual completo, con tope de salida de 16K |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, indexados por model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión y cabecera MTP (multi-token prediction). En este experimento, sin embargo, el entrenamiento es textual y basado en rejilla: la torre de visión y los tensores auxiliares MTP no se entrenaron y se restauraron como activos de inferencia congelados mediante el helper de exportación. El pipeline declarado sigue siendo image-text-to-text, pero las capacidades visuales no fueron objeto de ajuste.

El proceso de entrenamiento consta de dos fases. La fase SFT (rama `B_full`, inicializada de forma independiente desde Qwen3.5-9B) realizó 59 actualizaciones durante 3 épocas, con LR 5e-6, batch global 4 y supervisión completa del objetivo sin enmascarado del cuerpo de conocimiento. La fase RL arranca desde ese SFT con Adam nuevo y utiliza 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, temperatura 1 y LR 1e-6 constante, con TP4/PP1. Cada lote contiene 8 episodios (4 de cd82 y 4 de m0r0), semilla de entorno 0 y nivel inicial 0/cap 1. Este checkpoint cubre los rollouts 200 a 249 (50 lotes) y su padre es el iter199; las reanudaciones en 69/99/199 conservan estado nativo de optimizador, scheduler, RNG y sampler.

La recompensa combina resultado (limpieza real de primer nivel), progreso de estado de tarea verificado por replay (limitado a 0,2, con gamma 0,99 sobre acciones reales) y pequeñas penalizaciones de error locales a la llamada. El conjunto de conocimiento observacional local contiene 29 hechos de primer nivel (22 de cd82, 7 de m0r0) representados en 58 filas pregunta/respuesta; las ramas B/C añaden 12 ejemplos construidos de estado/aplicación y todas incluyen 8 ejemplos de protocolo de primera observación. Las respuestas de conocimiento no se inyectan en los prompts del actor de RL.

## Capacidades

- Generación de texto y razonamiento multi-turno en el contexto de resolución de tareas ARC-AGI-3 (entornos cd82 y m0r0).
- Interacción con entorno mediante acciones discretas (hasta 40 acciones por episodio) y razonamiento de esfuerzo medio.
- Internalización de un conjunto acotado de hechos de conocimiento de primer nivel (29 hechos locales) y aplicación de los mismos a estados de tarea.
- Protocolo de primera observación: 8 ejemplos de "initial-look" incluidos en todas las ramas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: sí, en el sentido de episodios de agente con acciones de entorno y recompensa por progreso de estado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo de razonamiento con esfuerzo configurable (medio en RL); visión congelada presente en los pesos pero no entrenada en este experimento.

## Casos de uso

- Investigación en RL para agentes: el checkpoint sirve como punto de partida o referencia para estudiar cómo se internaliza conocimiento vía SFT + RL con recompensas verificadas, gracias a la documentación detallada de protocolos y métricas en el dataset de runs.
- Reproducción de experimentos E2K: permite inicializar nuevos brazos de entrenamiento (el autor indica que los pesos HF pueden inicializar trabajo futuro, aunque no permiten continuidad exacta de Adam).
- Evaluación de fallos de agente: útil para auditar modos de error documentados (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicación/acción) en un entorno controlado de dos juegos.
- Estudio de recompensas compuestas: sirve para analizar el efecto de combinar recompensa de resultado con progreso de estado privilegiado y penalizaciones de error en el aprendizaje de políticas.
- Benchmark de internalización de conocimiento: con 58 filas pregunta/respuesta y 12 ejemplos de aplicación, permite medir si el modelo recita versus aplica correctamente el conocimiento.
- Base para comparaciones de series de checkpoints: al existir iter199, iter249 y otros puntos de la serie, se pueden trazar curvas de aprendizaje no monotónico y comparar brazos (outcome vs. process).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas estándar; únicamente describe métricas internas de RL (rollout/rewards como media de ventaja ponderada por respuesta, no recompensa de entorno) y advierte que la cohorte de muestreo se generó antes de su actualización y no debe reportarse como evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parámetros en bfloat16, se requieren aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 24 GB o más para bfloat16 sin cuantizar.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de 24 GB (RTX 3090/4090) para bfloat16 ajustado; el entrenamiento usó TP4/PP1, lo que sugiere despliegue multi-GPU en el origen.
- ¿Cabe en consumer GPU? Sí, en RTX 3090/4090 (24 GB) con bfloat16 al límite o mediante cuantización, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (código de carga incluido en la model card); compatibilidad con endpoints (`endpoints_compatible` en los tags). No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter249 | 9.653.104.368 | no disponible | SFT + RL sobre ARC-AGI-3 (cd82, m0r0) | Apache-2.0 | Pesos en HF, 0 descargas |
| Qwen/Qwen3.5-9B (base) | ~9B (no confirmado en la información) | no disponible | Modelo general multimodal | no disponible en la información | Público en HF |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 | mismo tamaño base | no disponible | Checkpoint padre de la misma serie | Apache-2.0 | Pesos en HF |
| Colecciones E2K de ziyan98 | no disponible | no disponible | Experimentos separados de referencia de layout | no disponible | HF (artefactos separados) |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas; la comparación es únicamente estructural y de procedencia.

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B: está especializado en dos entornos de primer nivel (cd82 y m0r0) y no hay evidencia de éxito en diseños nuevos ni en el juego completo.
- El aprendizaje es no monotónico y está dominado por m0r0; la continuación larga de proceso se detuvo en 341 muestreos con todos los fallos, dejando 340 como última actualización verificada en lugar de completar 400.
- Los pesos pico 260..269 no se conservan y HF249 no está etiquetado como el mejor checkpoint.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Los tags y la recitación no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo se generó antes de su actualización: no debe reportarse como evaluación independiente de estos pesos.
- La métrica `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa del entorno.
- La torre de visión y los tensores MTP están congelados y no fueron entrenados; no deben asumirse capacidades visuales ajustadas.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler: los pesos HF no permiten continuidad exacta de Adam.
- Licencia Apache-2.0 copiada del export base; el uso comercial es posible según la licencia, pero el modelo es un artefacto de investigación sin garantías de rendimiento en producción.
- Idiomas soportados no disponibles; el entrenamiento es textual/basado en rejilla y en inglés técnico de la model card.
- Riesgo de alucinación documentado explícitamente por el autor en el dominio de coordenadas y reglas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter249
- Checkpoint padre (iter199): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B

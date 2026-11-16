# YanSong97/E2K-Qwen3.5-9B-tagged-B-correction-rl-iter49

## Resumen

E2K-Qwen3.5-9B-tagged-B-correction-rl-iter49 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante un pipeline de ajuste supervisado (SFT) seguido de aprendizaje por refuerzo (RL) orientado a la internalización de conocimiento en entornos de ARC-AGI-3. Lo publica el usuario YanSong97 y su propósito no es mejorar las capacidades generales del modelo base, sino estudiar si un modelo de 9.650 millones de parámetros puede adquirir y aplicar conocimiento factual de primer nivel sobre dos entornos concretos (cd82 y m0r0) a través de interacción con el entorno.

El checkpoint corresponde al rollout 49 (50 lotes de RL acumulados) de la rama de RL denominada "correction", que combina recompensa de resultado (una victoria real de primer nivel) con penalizaciones locales de formato y errores, sin recompensa de proceso. El modelo parte de la rama SFT `B_full`, inicializada de forma independiente desde Qwen3.5-9B con 59 actualizaciones y 3 épocas sobre un conjunto de datos de conocimiento etiquetado de 29 hechos de primer nivel (22 de cd82 y 7 de m0r0).

Es relevante como artefacto de investigación reproducible sobre "experience-to-knowledge" (E2K), un paradigma que estudia la conversión de experiencia interactiva en conocimiento reutilizable. El autor advierte explícitamente de que no es una mejora de propósito general y de que los tags o la recitación no constituyen evidencia de uso correcto del conocimiento. La arquitectura subyacente es la de Qwen3.5, con torre de visión y tensores MTP auxiliares congelados durante este experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text) con torre de visión y MTP auxiliar congelados en este experimento |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento RL usa 12K de entrada y tope de salida de 16K) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (copiada de la exportación base original) |
| Formato de pesos | safetensors (60 shards, según `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5, un transformer multimodal con pipeline image-text-to-text, torre de visión y tensores MTP (multi-token prediction) auxiliares. En este experimento, la torre de visión y los tensores MTP no se entrenaron: el helper de exportación restauró los activos de inferencia congelados. El entrenamiento es exclusivamente textual y basado en rejilla (grid), no visual.

El pipeline tiene dos etapas. La primera es SFT sobre la rama `B_full`, inicializada de forma independiente desde Qwen/Qwen3.5-9B: 59 actualizaciones, 3 épocas, learning rate 5e-6, batch global 4, supervisión completa del objetivo y sin enmascaramiento del cuerpo de conocimiento. La segunda es RL desde el checkpoint SFT `E2K-Qwen3.5-9B-tagged-sft-B-full-step58`, con Adam reiniciado en la frontera SFT/RL. La configuración de RL usa 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, ventana reciente de 4 turnos con 12K de entrada y estado actual completo, sin compactación automática, temperatura 1, learning rate constante 1e-6 y TP4/PP1. Cada lote contiene 8 episodios: 4 de cd82 y 4 de m0r0, con semilla de entorno 0 y arranque en nivel 0/cap 1.

El conjunto de conocimiento local contiene 29 hechos de primer nivel (22 de cd82, 7 de m0r0) representados en 58 filas pregunta/respuesta. Las ramas B/C añaden 12 ejemplos construidos de estado/aplicación y todas las ramas incluyen 8 ejemplos de protocolo de inspección inicial. Los datos derivan de observaciones/replay de OpenCode y trabajo editorial externo, y no son un espejo fila a fila del dataset de conocimiento de ziyan98 ni una colección de pensamientos nativos de un modelo profesor. La recompensa de resultado exige una victoria real configurada de primer nivel; la rama de corrección usa fallback aleatorio legal y pequeñas penalizaciones locales por error. Las respuestas de conocimiento no se inyectan en los prompts del actor de RL.

## Capacidades

- Generación de texto y razonamiento multi-turno sobre el modelo base Qwen3.5-9B.
- Interacción con entornos de tipo ARC-AGI-3 mediante acciones (40 acciones por episodio en el entrenamiento).
- Internalización de conocimiento factual de primer nivel sobre los entornos cd82 y m0r0 (29 hechos, 58 pares pregunta/respuesta).
- Protocolo de inspección inicial del entorno (8 ejemplos de protocolo en el conjunto de datos).
- Procesamiento image-text-to-text según el pipeline declarado, aunque la torre de visión no se entrenó en este experimento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: sí, en el sentido acotado de episodios de RL con 40 acciones y razonamiento de esfuerzo medio.
- Capacidades multilingües: no disponibles; la model card incluye texto en chino e inglés pero no declara idiomas soportados.
- Modo thinking: se menciona "medium reasoning effort" en la configuración de RL, no un modo thinking explícito del modelo.

## Casos de uso

- Investigación en internalización de conocimiento: usar el checkpoint como punto de partida para estudiar si el conocimiento factual sobre un entorno se aplica correctamente en episodios posteriores, comparando con el checkpoint SFT padre y con el modelo base.
- Reproducción de experimentos E2K: el checkpoint permite inicializar nuevos trabajos de RL o SFT sobre los mismos entornos, aunque el autor advierte de que los pesos HF no permiten continuar exactamente el estado de Adam.
- Análisis de fallos en agentes sobre ARC-AGI-3: las auditorías documentadas (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicación/acción, generación repetida) sirven como casos de estudio para diseñar detectores y salvaguardas.
- Evaluación de recompensas de resultado frente a recompensas de proceso: la rama "correction" (sin recompensa de proceso) puede compararse con la rama de proceso para medir el impacto del diseño de recompensa.
- Estudio de currículos de conocimiento acotado: el conjunto de 29 hechos permite analizar qué tipo de conocimiento se retiene y cuál se olvida tras el RL.
- Docencia y divulgación sobre agentes que aprenden de la experiencia: el artefacto y sus datasets asociados permiten ilustrar un pipeline completo SFT + RL con métricas y protocolos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparables. El autor indica explícitamente que la cohorte de muestreo registrada en `training_metadata.json` se generó antes de su actualización y no debe presentarse como evaluación independiente de estos pesos, y que el `rollout/rewards` nativo relativo al grupo es una media de ventaja ponderada por respuesta, no la recompensa del entorno. También señala que el aprendizaje es no monotónico, dominado por m0r0, y que la continuación de proceso se detuvo en 341 por muestreo con todos los fallos, dejando 340 como última actualización verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y bastante más para contextos de 12K-16K.
- Cuantización: no se publican GGUF ni cuantizaciones oficiales; habría que generarlas a partir de los safetensors. En 8 bits cabría en torno a 10-12 GB; en 4 bits, en torno a 6-8 GB, aunque no hay artefactos verificados.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs de consumo con 24 GB o más (RTX 3090, RTX 4090) para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con 24 GB en bfloat16 para contextos cortos; con cuantización de 8 o 4 bits cabría en GPUs de 12-16 GB, pero sin artefactos oficiales.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (código de carga incluido en la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-correction-rl-iter49 | 9.653.104.368 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Checkpoint de investigación E2K/ARC-AGI-3 |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en esta ficha | no disponible | no disponible | Hugging Face | Base generalista; el checkpoint E2K no es una mejora general |
| E2K-Qwen3.5-9B-tagged-sft-B-full-step58 | no disponible | no disponible | Apache-2.0 (presumible) | Hugging Face | Padre SFT de este checkpoint; útil para ablación SFT vs RL |
| Colecciones E2K de ziyan98 | no disponible | no disponible | no disponible | Hugging Face | Proyecto separado; no hereda sus puntuaciones |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B ni evidencia de éxito en diseños nuevos o en el juego completo.
- El entrenamiento se limita a los entornos de primer nivel cd82 y m0r0; el aprendizaje es no monotónico y está dominado por m0r0.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Los tags y la recitación no son evidencia de uso correcto del conocimiento.
- La cohorte de muestreo registrada no es una evaluación independiente de estos pesos; el `rollout/rewards` nativo no es la recompensa del entorno.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler; los pesos HF no permiten continuar exactamente el entrenamiento con Adam.
- Los pesos pico 260..269 no se conservan y HF249 no está etiquetado como el mejor checkpoint.
- La torre de visión y los tensores MTP no se entrenaron; las capacidades visuales no deben asumirse mejoradas.
- Licencia Apache-2.0 copiada de la exportación base; conviene verificar las condiciones del modelo base Qwen3.5-9B para uso comercial.
- Riesgo de alucinación y sesgos: no se documentan sesgos específicos, pero el dominio acotado y los fallos de auditoría sugieren precaución en producción.

## Enlaces

- Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-correction-rl-iter49
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint SFT padre: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs

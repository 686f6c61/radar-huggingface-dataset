# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter49

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter49 es un checkpoint de investigación publicado por YanSong97, derivado mediante fine-tuning supervisado (SFT) y aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-9B. El objetivo del experimento, denominado E2K (experience-to-knowledge), es estudiar la internalización de conocimiento factual de primer nivel en entornos concretos de ARC-AGI-3 (cd82 y m0r0) y su aplicación durante la resolución de tareas. No se trata de una mejora de propósito general del modelo base, sino de un artefacto acotado a un protocolo experimental concreto.

El checkpoint corresponde al rollout 49 (50 lotes de RL completados en esta rama), partiendo de la rama SFT `B_full`, que se inicializó de forma independiente desde Qwen3.5-9B. El entrenamiento es texto/rejilla: la torre de visión y los tensores auxiliares MTP no se entrenaron y se restauraron congelados desde los activos de inferencia originales.

Con 9.653.104.368 parámetros reales (según safetensors) y un repositorio de 19,3 GB distribuido en 60 shards, el modelo se publica bajo licencia Apache-2.0 y formato transformers/safetensors, con pipeline declarado image-text-to-text. Su relevancia es fundamentalmente metodológica: documenta con detalle la procedencia, las recompensas y las limitaciones observadas de un ciclo SFT+RL sobre conocimiento verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, clase `Qwen3_5ForConditionalGeneration`); torre de visión y MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec formal; el protocolo de RL usa entrada de 12K tokens con estado actual completo, límite de salida de 16K |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, `model.safetensors.index.json`), assets estándar de config/tokenizer/processor |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión y cabezas auxiliares MTP. En este experimento, sin embargo, el entrenamiento se realizó exclusivamente sobre texto y rejillas: la torre de visión y los tensores MTP permanecieron congelados y fueron restaurados por el helper de exportación. La rama SFT `B_full` se inicializó de forma independiente desde el modelo base y se entrenó durante 59 actualizaciones, 3 épocas, learning rate 5e-6 y batch global 4, con supervisión completa del objetivo y sin enmascarado del cuerpo de conocimiento.

Sobre esa base, la etapa de RL parte con un Adam nuevo en la frontera SFT/RL. El protocolo usa 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, límite de salida de 16K, ventana reciente de 4 pasos sobre una entrada de 12K con estado actual completo, sin compactación automática, temperatura 1, learning rate constante de 1e-6 y paralelismo TP4/PP1. Cada lote contiene 8 episodios (4 de cd82 y 4 de m0r0) con semilla de entorno 0 y arranque en nivel 0/cap 1. La recompensa de resultado exige un clear real de primer nivel; la rama de proceso añade además progreso de estado de tarea verificado por replay, con tope 0,2 y gamma 0,99 sobre acciones reales, usando estado y planificación privilegiados en el lado de la recompensa (no evalúa la veracidad del razonamiento). El conjunto de conocimiento local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0) representados en 58 filas pregunta/respuesta, más 12 ejemplos construidos de estado/aplicación y 8 ejemplos de protocolo de inspección inicial. Las respuestas de conocimiento no se inyectan en los prompts del actor durante RL.

## Capacidades

- Generación de texto y razonamiento multi-paso en el contexto de resolución de tareas de ARC-AGI-3 (entornos cd82 y m0r0).
- Procesamiento de entradas multimodales imagen-texto a nivel de pipeline (clase `Qwen3_5ForConditionalGeneration`), aunque la torre de visión no fue entrenada en este experimento.
- Internalización y recitación de un conjunto acotado de conocimiento factual de primer nivel (29 hechos) y su aplicación en formato pregunta/respuesta.
- Ejecución de acciones sobre entorno con historial reciente (ventana de 4 pasos) y estado actual completo.
- Soporte conversacional (tag `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- No se documenta soporte específico de tool calling, function calling ni agentes generales más allá del bucle de acciones del entorno experimental.

## Casos de uso

- Investigación en internalización de conocimiento: el modelo sirve como artefacto reproducible para estudiar si el conocimiento factual se internaliza y se aplica correctamente tras SFT+RL, usando los datasets de conocimiento y de ejecuciones publicados por el autor.
- Reproducción de experimentos E2K: permite inicializar nuevas ramas de entrenamiento desde este checkpoint (los pesos HF inicializan trabajo futuro, aunque no permiten continuar exactamente el estado de Adam).
- Estudio de recompensas de proceso: útil para analizar el efecto de recompensas de progreso de estado verificado por replay con tope 0,2 frente a recompensas solo de resultado.
- Auditoría de fallos en razonamiento: el modelo exhibe fallos documentados (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicación/acción) que lo hacen útil como caso de estudio de alucinación en tareas de planificación.
- Evaluación de protocolos de RL en entornos ARC-AGI-3: referencia para comparar configuraciones (temperatura, ventana de contexto, límite de salida, número de episodios por lote).
- Base para experimentos de conocimiento etiquetado: los datasets `E2K-tagged-knowledge-data` y `E2K-tagged-knowledge-rl-runs` permiten replicar el pipeline de datos y métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas estándar (MMLU, HumanEval, GSM8K) y advierte explícitamente que las cohortes de muestreo registradas en `training_metadata.json` no deben reportarse como evaluación independiente de estos pesos, y que `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, o GPUs consumer de 24 GB (RTX 3090/4090) para bfloat16 con contexto limitado; cuantización a 8 o 4 bits reduciría el requisito, aunque no se publican pesos cuantizados.
- Cabe en GPU consumer de 24 GB en bfloat16 con margen ajustado; para contextos largos (entrada de 12K y salida de 16K del protocolo) se recomienda 40 GB o más.
- Opciones de despliegue: transformers (carga documentada con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`), y por compatibilidad de formato potencialmente vLLM, TGI o llama.cpp si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter49 | 9.653.104.368 | no disponible (protocolo RL usa 12K entrada / 16K salida) | Apache-2.0 | Hugging Face, 17 descargas | Checkpoint de investigación acotado a ARC-AGI-3 |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible en la informacion | no disponible en la informacion | Hugging Face | Modelo base generalista; el checkpoint E2K no es una mejora general |
| Alternativas de 9B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No es una mejora de propósito general de Qwen3.5-9B y no constituye evidencia de éxito en layouts nuevos ni en el juego completo.
- El conocimiento cubre solo 29 hechos de primer nivel (22 de cd82 y 7 de m0r0); el alcance semántico está acotado.
- Las auditorías detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación no son evidencia de uso correcto del conocimiento.
- El aprendizaje es no monotónico y está dominado por m0r0.
- La continuación larga del proceso se detuvo en 341 muestreos fallidos, dejando 340 como última actualización verificada en lugar de completar 400; los pesos exactos del pico 260..269 no se conservan y HF249 no está etiquetado como el mejor checkpoint.
- La cohorte de muestreo se generó antes de su actualización y no debe usarse como evaluación independiente.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado del sampler; los pesos HF no permiten continuar exactamente el entrenamiento con Adam.
- La torre de visión y MTP no se entrenaron, por lo que las capacidades multimodales no están adaptadas a este experimento.
- La licencia Apache-2.0 se copia de la exportación base; conviene verificar las condiciones del modelo base Qwen3.5-9B para uso comercial.
- Riesgo de alucinación elevado en tareas de planificación y estado, documentado por el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter49
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint padre SFT: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-B-full-step58
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Referencia de layouts (proyecto separado): colecciones E2K de ziyan98 en Hugging Face (no se proporciona URL directa en la informacion disponible)

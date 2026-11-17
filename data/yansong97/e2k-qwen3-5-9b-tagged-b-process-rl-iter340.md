# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter340

## Resumen
E2K-Qwen3.5-9B-tagged-B-process-rl-iter340 es un checkpoint de investigación derivado de Qwen/Qwen3.5-9B mediante ajuste fino supervisado (SFT) y aprendizaje por refuerzo (RL) sobre entornos de ARC-AGI-3 (concretamente los entornos de primer nivel cd82 y m0r0). Lo desarrolla el usuario YanSong97 y se enmarca en un estudio sobre "experience-to-knowledge" (E2K): la internalización de conocimiento factual de juego en los pesos del modelo en lugar de inyectarlo en el prompt. No es una mejora de propósito general del modelo base, sino un artefacto experimental cuyo objetivo es evaluar si un modelo puede aprender y aplicar reglas observadas de entornos concretos.

El modelo conserva la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text), con 9.653.104.368 parámetros totales y pesos en bfloat16 (19,3 GB de repositorio en 60 shards safetensors). El entrenamiento fue exclusivamente textual y basado en rejillas: la torre de visión y los tensores auxiliares MTP quedaron congelados y se restauraron como activos de inferencia. Este checkpoint corresponde al rollout RL 340 (341 lotes RL completados en esta rama) y es continuación del checkpoint iter199.

Su relevancia es acotada y de carácter metodológico: documenta con detalle el protocolo de recompensa (resultado de partida + progreso verificado de estado + penalizaciones de error), los datos de conocimiento (29 hechos de primer nivel, 58 pares pregunta/respuesta) y las limitaciones observadas (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción). El propio autor advierte que las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text); pesos conforme a `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec del modelo; en entrenamiento RL se usaron entradas de 12K tokens (recent4/input12K) y tope de salida de 16K |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (copiada de la exportación base original) |
| Formato de pesos | safetensors (60 shards, índice `model.safetensors.index.json`) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B, un transformer multimodal con torre de visión. En este experimento la torre de visión y los tensores auxiliares MTP no se entrenaron: el entrenamiento es textual y basado en rejillas, y el helper de exportación restauró los activos de visión/MTP congelados para la inferencia. El SFT se realizó sobre la rama `B_full`, inicializada de forma independiente desde Qwen/Qwen3.5-9B, con 59 actualizaciones, 3 épocas, LR 5e-6 y batch global 4, con supervisión completa del objetivo y sin enmascarado del cuerpo de conocimiento.

El RL arranca desde el SFT con Adam nuevo en la frontera SFT/RL. Se usan 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, tope de salida de 16K, estado actual completo con ventana recent4/input12K, sin compactación automática, temperatura 1, LR 1e-6 constante y paralelismo TP4/PP1. Cada lote contiene 8 episodios (4 cd82 + 4 m0r0), semilla de entorno 0, empezando en nivel 0/cap 1. La recompensa de resultado es una partida real de primer nivel; la rama de proceso añade progreso verificado de estado (acotado a 0,2, gamma 0,99 sobre acciones reales), con estado/planificación privilegiados en el lado de la recompensa que no puntúan la veracidad del razonamiento. Las reanudaciones del brazo de proceso en 69/99/199 conservan estado nativo de optimizador, scheduler, RNG y sampler; no son reinicios con Adam nuevo. La etapa cubre los rollouts 200 a 340 (141 lotes) y terminó en 341 muestreos con todos los episodios fallidos, por lo que 340 es la última actualización verificada en lugar de las 400 previstas.

## Capacidades
- Generación de texto y razonamiento sobre entornos ARC-AGI-3 de primer nivel ya conocidos (cd82 y m0r0).
- Aplicación de conocimiento factual aprendido (29 hechos de primer nivel) mediante preguntas/respuestas, si bien el autor advierte que la recitación no equivale a uso correcto.
- Procesamiento de observaciones en formato texto/rejilla durante el entrenamiento; la entrada multimodal está soportada por los pesos base pero la torre de visión no se ajustó.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: parcial, en el bucle de acciones del entorno (40 acciones por episodio) con esfuerzo de razonamiento medio.
- Capacidades multilingües: no disponibles (la model card incluye texto en inglés y chino, pero no se declaran idiomas soportados).
- Capacidad especial: modo de razonamiento con tope de salida de 16K y ventana de estado actual de 12K.

## Casos de uso
- Investigación en internalización de conocimiento: servir de checkpoint de referencia para estudiar si el conocimiento factual se aprende en los pesos frente a la inyección en prompt, comparando con las variantes A/C y las ejecuciones publicadas.
- Reproducción de experimentos ARC-AGI-3: usar los entornos cd82 y m0r0 con semilla 0 desde nivel 0/cap 1 para replicar el protocolo de evaluación descrito.
- Análisis de fallos de razonamiento: auditar coordenadas fabricadas, mezcla de reglas entre juegos y desajuste explicación/acción en episodios exitosos, gracias a los protocolos y métricas publicados en el dataset de ejecuciones.
- Punto de partida para ajuste posterior: inicializar nuevos experimentos de SFT/RL desde estos pesos, teniendo en cuenta que no se incluye estado de optimizador, RNG ni sampler, por lo que no permite continuación exacta de Adam.
- Estudio de funciones de recompensa: evaluar el efecto del progreso de estado verificado (acotado a 0,2) frente a recompensa solo de resultado, usando los brazos de proceso frente a corrección.
- Desarrollo de agentes sobre entornos de juego tipo rejilla: integrar el modelo en bucles de 40 acciones con ventana de contexto de 12K como banco de pruebas de agentes de corto alcance.
- Docencia y divulgación metodológica: ilustrar un pipeline completo (SFT con 59 actualizaciones, RL con TP4/PP1, exportación con shards safetensors y provenance con SHA256).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de rendimiento en ARC-AGI-3 más allá de indicaciones cualitativas (aprendizaje no monotónico dominado por m0r0; parada en 341 por fallos totales). El autor advierte explícitamente que la cohorte de muestreo se generó antes de su actualización y no debe presentarse como evaluación independiente de estos pesos.

## Requisitos de hardware
- VRAM estimada: el repositorio ocupa 19,3 GB en bfloat16; se requiere al menos ~20 GB de VRAM para cargar los pesos completos en bf16. En cuantización de 8 bits o 4 bits la huella sería menor, pero no se han publicado cuantizaciones ni cifras oficiales.
- GPU recomendadas: para bf16 completo, GPUs con 24 GB o más (RTX 4090, A100 40/80 GB, H100). El entrenamiento se realizó con TP4/PP1, lo que sugiere despliegue multi-GPU en la configuración de referencia.
- Cabe en GPU de consumo: sí, en bf16 en una RTX 4090 (24 GB) ajustando el reparto de memoria, o en GPUs de 16 GB mediante cuantización (no publicada).
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (código de carga incluido en la model card); el repo está marcado como `endpoints_compatible`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento usó tope de salida de 16K y temperatura 1, pero no se publican tiempos por acción ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter340 | 9.653.104.368 | no disponible (12K/16K en entrenamiento) | Apache-2.0 | Pesos en HF, 60 shards safetensors | Checkpoint de investigación, no propósito general |
| Qwen/Qwen3.5-9B (base) | 9B (no disponible el desglose exacto) | no disponible | no disponible en esta ficha | HF | Modelo base multimodal sin ajuste E2K |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 | mismo tamaño (checkpoint padre) | no disponible | Apache-2.0 | HF | Etapa anterior del mismo protocolo RL |
| Modelos de ARC-AGI-3 de terceros (ziyan98 E2K) | no disponible | no disponible | no disponible | HF | Proyecto separado; el autor indica que no hereda sus puntuaciones |

## Limitaciones y advertencias
- No es una mejora de propósito general de Qwen3.5-9B ni evidencia de éxito en diseños nuevos o en el juego completo; solo cubre los entornos conocidos cd82 y m0r0.
- Auditorías internas detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicación y acción y generación repetida incluso en episodios exitosos.
- Las etiquetas y la recitación de conocimiento no son evidencia de uso correcto del conocimiento; el progreso de estado se usa solo como recompensa privilegiada y no puntúa la veracidad del razonamiento.
- Aprendizaje no monotónico y dominado por m0r0; la continuación de proceso paró en 341 por muestreo con todos los episodios fallidos.
- Los pesos del pico 260..269 no se conservan y HF249 no está etiquetado como mejor checkpoint.
- La cohorte de muestreo se generó antes de la actualización correspondiente y no constituye una evaluación independiente de estos pesos exportados.
- No se incluyen optimizador, checkpoint distribuido nativo, pickle, RNG ni estado de sampler: los pesos sirven para inicializar trabajo futuro, pero no permiten continuar exactamente el entrenamiento con Adam.
- La torre de visión y MTP no se entrenaron; las capacidades multimodales no se validaron en este experimento.
- Licencia Apache-2.0 copiada de la exportación base; conviene verificar las condiciones del modelo original Qwen3.5-9B antes de uso comercial en producción.
- Idiomas soportados no declarados; el ajuste se realizó con datos en texto/rejilla de dominio específico.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter340
- Checkpoint padre (iter199): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Protocolos de ejecución, métricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Referencia de diseño E2K de ziyan98: no disponible como URL en la información proporcionada (proyecto separado, no hereda puntuaciones)

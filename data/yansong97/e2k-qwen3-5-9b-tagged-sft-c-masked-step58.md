# YanSong97/E2K-Qwen3.5-9B-tagged-sft-C-masked-step58

## Resumen
E2K-Qwen3.5-9B-tagged-sft-C-masked-step58 es un checkpoint de investigacion publicado por YanSong97, derivado de Qwen/Qwen3.5-9B mediante ajuste fino supervisado (SFT) con enmascaramiento de la perdida sobre el cuerpo de conocimiento. Forma parte de un experimento mas amplio denominado E2K (experience-to-knowledge) orientado a la internalizacion de conocimiento etiquetado en entornos de ARC-AGI-3, concretamente en los entornos de primer nivel cd82 y m0r0.

El modelo hereda la arquitectura multimodal de Qwen3.5 (pipeline image-text-to-text) con 9.653.104.368 parametros totales y pesos en safetensors bfloat16. Este checkpoint concreto corresponde al brazo `C_masked`, inicializado de forma independiente desde el modelo base, tras 59 actualizaciones de SFT (etiqueta de paso 58, base cero) durante 3 epocas con LR 5e-6 y batch global 4.

Es relevante como artefacto de investigacion reproducible sobre internalizacion de conocimiento y RL en entornos tipo ARC-AGI-3, no como una mejora de proposito general del modelo base. El autor advierte explicitamente que no constituye evidencia de exito en layouts nuevos ni en el juego completo, y que el aprendizaje observado es no monotonico y dominado por el entorno m0r0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de vision y tensores auxiliares MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el protocolo RL usa 16K de salida y ventana reciente de 4 turnos / entrada 12K) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (la model card incluye texto en ingles y chino, pero no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, indice en `model.safetensors.index.json`), bfloat16 |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con torre de vision y tensores auxiliares MTP (multi-token prediction). En este experimento la torre de vision y los tensores MTP no se entrenaron: el entrenamiento es texto/rejilla (grid) y los activos de inferencia congelados se restauraron mediante el helper de exportacion. La etapa documentada es SFT con enmascaramiento de la perdida sobre el cuerpo de conocimiento: los spans de conocimiento en los ejemplos de aplicacion se enmascaran, mientras que las etiquetas, la aplicacion y las acciones objetivo permanecen supervisadas. Se realizaron 59 actualizaciones, 3 epocas, LR 5e-6 y batch global 4, partiendo de una inicializacion independiente desde Qwen/Qwen3.5-9B.

El conjunto de conocimiento observacional local contiene 29 hechos de primer nivel (22 de cd82 y 7 de m0r0), representados por 58 filas pregunta/respuesta; los brazos B/C anaden 12 ejemplos construidos de estado/aplicacion y todos los brazos incluyen 8 ejemplos de protocolo de mirada inicial. Los datos derivan de observaciones/replay de OpenCode y trabajo editorial externo, y no son un espejo fila a fila del dataset de conocimiento de ziyan98 en HF ni una coleccion de pensamientos de un modelo profesor nativo. En la fase RL (que parte de B_full SFT con Adam nuevo en la frontera SFT/RL) se usan 40 acciones de entorno por episodio, razonamiento de esfuerzo medio, tope de salida de 16K, estado actual reciente4/entrada12K, sin compactacion automatica, temperatura 1, LR 1e-6 constante y TP4/PP1, con 8 episodios por batch (4 cd82 + 4 m0r0). La recompensa de resultado es una limpieza real de primer nivel configurada; el brazo de proceso anade progreso de estado de tarea best-so-far ligado a replay, con tope 0,2 y gamma 0,99 sobre acciones reales.

## Capacidades
- Generacion de texto conversacional en el marco de Qwen3.5, con soporte de procesador multimodal (`AutoProcessor`).
- Razonamiento multi-paso y planificacion en entornos de juego tipo ARC-AGI-3 (acciones de entorno, estado actual, protocolo de mirada inicial).
- Internalizacion de conocimiento etiquetado: recitacion y aplicacion de hechos de primer nivel de los entornos cd82 y m0r0.
- Entrada image-text-to-text segun el pipeline declarado (aunque la torre de vision no se entreno en este experimento).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades agenticas: el protocolo RL opera con acciones de entorno por episodio, pero no se documenta un framework de agentes generico.
- Capacidades multilingues: no disponibles; solo se observa texto en ingles y chino en la model card.
- Modo thinking: se menciona "medium reasoning effort" en el protocolo RL, sin detalle adicional.

## Casos de uso
- Investigacion sobre internalizacion de conocimiento: el checkpoint permite estudiar como el SFT con enmascaramiento del cuerpo de conocimiento afecta a la recitacion y aplicacion de hechos etiquetados en un modelo de 9,6B de parametros.
- Reproduccion de experimentos E2K: sirve como punto de partida (inicializacion) para futuros trabajos de SFT/RL, ya que el autor indica que los pesos HF pueden inicializar trabajo futuro aunque no permiten continuacion exacta de Adam.
- Analisis de recompensas en entornos ARC-AGI-3: util para comparar la recompensa de resultado (limpieza real) frente a la recompensa de proceso (progreso de estado best-so-far) en los entornos cd82 y m0r0.
- Auditoria de fallos de razonamiento: el autor documenta coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicacion/accion y generacion repetida, lo que hace del checkpoint un caso de estudio para detectar estos patrones.
- Evaluacion de generalizacion a layouts nuevos: como control negativo, permite medir hasta que punto el conocimiento internalizado no transfiere a disposiciones no vistas.
- Estudio de estabilidad del entrenamiento: el aprendizaje no monotonico y el paron en la actualizacion 341 (ultima verificada 340) ofrecen material para analizar dinamicas de RL con recompensas dispersas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe resultados cualitativos del experimento (aprendizaje no monotonico, dominado por m0r0, auditorias con fallos en episodios exitosos) y advierte que la cohorte de muestreo se genero antes de su actualizacion, por lo que no debe reportarse como evaluacion independiente de estos pesos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 9.653.104.368 parametros en bfloat16 los pesos ocupan aproximadamente 19,3 GB, por lo que se necesita al menos esa cantidad mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cabe en GPUs de 24 GB o mas en bfloat16 (p. ej. RTX 4090, A100 40/80 GB, H100), aunque no se confirma oficialmente.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en bfloat16, pero no confirmado; con cuantizacion no se documentan formatos.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `AutoProcessor` (carga indicada en la model card con `torch_dtype=torch.bfloat16` y `device_map="auto"`); vLLM, llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-sft-C-masked-step58 | 9.653.104.368 | no disponible | Apache-2.0 | Hugging Face (0 descargas, 0 likes) | Checkpoint de investigacion E2K sobre cd82/m0r0 |
| Qwen/Qwen3.5-9B | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face (modelo base) | Modelo base del que parte este checkpoint |
| ziyan98 E2K collections | no disponible | no disponible | no disponible | Hugging Face | Referencia de layout; experimentos, datasets y modelos separados, sin herencia de puntuaciones |

## Limitaciones y advertencias
- No es una mejora de proposito general de Qwen3.5-9B ni evidencia de exito en layouts nuevos o en el juego completo.
- El aprendizaje es no monotonico y esta dominado por el entorno m0r0; los pesos del pico 260..269 no se conservan y HF249 no esta etiquetado como el mejor checkpoint.
- La continuacion larga del brazo de proceso se detuvo en 341 con muestreo todo fallido, dejando 340 como ultima actualizacion verificada en lugar de completar 400.
- Las auditorias encuentran coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicacion y accion y generacion repetida incluso en episodios exitosos.
- Las etiquetas y la recitacion no son evidencia de uso correcto del conocimiento; las respuestas de conocimiento no se inyectan en los prompts del actor RL.
- La cohorte de muestreo se genero antes de su actualizacion y no debe reportarse como evaluacion independiente de estos pesos; `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa de entorno.
- La recompensa de proceso usa estado/planificacion privilegiados del lado de la recompensa y no puntua la verdad del razonamiento; las limpiezas por fallback terminal aleatorio no reciben credito de resultado.
- No se suben optimizador, checkpoint distribuido nativo, pickle, RNG ni estado de sampler: los pesos HF no permiten continuacion exacta de Adam.
- La torre de vision y los tensores MTP no se entrenaron en este experimento, por lo que las capacidades visuales no estan adaptadas a la tarea.
- Licencia Apache-2.0 copiada de la exportacion base; no se detallan restricciones adicionales para uso comercial, pero el caracter de checkpoint de investigacion desaconseja su uso en produccion.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-sft-C-masked-step58
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de conocimiento y filas SFT exactas: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos de ejecucion, metricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Referencia de layout (ziyan98, E2K collections): no disponible URL directa en la informacion proporcionada

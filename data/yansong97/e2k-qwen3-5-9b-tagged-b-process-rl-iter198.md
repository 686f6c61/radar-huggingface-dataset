# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter198

## Resumen

E2K-Qwen3.5-9B-tagged-B-process-rl-iter198 es un checkpoint de investigacion publicado por YanSong97, derivado del modelo base Qwen/Qwen3.5-9B mediante un pipeline de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL) orientado a la internalizacion de conocimiento ("experience-to-knowledge", E2K) en entornos de ARC-AGI-3. El modelo parte de una arquitectura transformer multimodal de tipo image-text-to-text, con 9.653.104.368 parametros totales y pesos en formato safetensors (60 shards, ~19,3 GB de repositorio).

El objetivo del experimento es que el modelo aprenda a resolver tareas de los entornos de primer nivel conocidos como cd82 y m0r0 dentro del benchmark ARC-AGI-3, internalizando conocimiento observacional (29 hechos de primer nivel, representados en 58 pares pregunta/respuesta) en lugar de inyectarlo directamente en los prompts del actor durante el RL. El checkpoint corresponde al rollout 198 (199 lotes RL completados en esta rama), continuacion del checkpoint iter99, y se distribuye bajo licencia Apache-2.0.

Es relevante ahora porque documenta de forma transparente un intento de internalizacion de conocimiento via SFT + RL con recompensas de proceso verificadas, pero el propio autor advierte que no es una mejora de proposito general de Qwen3.5-9B ni evidencia de exito en layouts nuevos o en el juego completo. Se trata, por tanto, de un artefacto de investigacion, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; pesos exportados con torre de vision y tensores auxiliares MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento RL uso ventana de entrada de 12K tokens con estado actual completo y limite de salida de 16K) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (60 shards, indexados por model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5 con pipeline image-text-to-text, cargable mediante `Qwen3_5ForConditionalGeneration` y `AutoProcessor` de la libreria transformers. La exportacion incluye la torre de vision y los tensores auxiliares MTP congelados, restaurados por el helper de exportacion; sin embargo, el entrenamiento de este experimento fue exclusivamente texto/rejilla, y ni la torre de vision ni los tensores MTP se entrenaron.

El proceso de entrenamiento consta de dos fases. La fase SFT (rama `B_full`, inicializada de forma independiente desde Qwen/Qwen3.5-9B) realizo 59 actualizaciones durante 3 epocas con LR 5e-6 y batch global de 4, con supervision completa del target y sin enmascaramiento del cuerpo de conocimiento. La fase RL partio del SFT con Adam nuevo en la frontera SFT/RL y se ejecuto con 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, limite de salida de 16K, ventana reciente de 4 turnos con entrada de 12K y estado actual completo, sin compactacion automatica, temperatura 1, LR 1e-6 constante y TP4/PP1. Cada batch contenia 8 episodios (4 cd82 + 4 m0r0) con semilla de entorno 0, empezando en nivel 0 y cap 1. Este checkpoint concreto cubre los rollouts 100 a 198 (99 batches) y su padre es iter99.

La recompensa combina resultado (limpieza real de primer nivel configurada), penalizaciones locales de error en la rama de correccion y, en la rama de proceso, progreso de estado de tarea verificado por replay con tope 0,2 y gamma 0,99 sobre las acciones reales. Esta recompensa de proceso usa estado/planificacion privilegiados en el lado de la recompensa y no puntua la veracidad del razonamiento. El conocimiento no se inyecta en los prompts del actor durante el RL; el objetivo es que se internalice en los pesos.

## Capacidades

- Generacion de texto y razonamiento multi-turno en formato conversacional, heredado de Qwen3.5-9B.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text), aunque la torre de vision no fue entrenada en este experimento.
- Razonamiento sobre rejillas y estados de entorno para tareas tipo ARC-AGI-3, con acciones de entorno por episodio.
- Internalizacion de conocimiento observacional del dominio (hechos de primer nivel de los entornos cd82 y m0r0).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado especificamente a episodios de agente con hasta 40 acciones de entorno.
- Capacidades multilingues: no disponible; la model card incluye texto en chino, pero no se declaran idiomas soportados.
- Capacidades especiales: modo de razonamiento con esfuerzo configurable (se uso "medium" en RL), y checkpoint de investigacion con recompensa de proceso verificada.

## Casos de uso

- Investigacion en internalizacion de conocimiento: usar el checkpoint como punto de partida o referencia para estudiar si el conocimiento observacional se internaliza en los pesos frente a la inyeccion en prompts, comparando con iter99 y otros brazos del mismo proyecto.
- Experimentos de RL con recompensas de proceso: replicar el protocolo (40 acciones/episodio, recompensa de resultado mas progreso verificado por replay con tope 0,2) sobre entornos ARC-AGI-3 para evaluar estabilidad del aprendizaje.
- Analisis de fallos en agentes: auditar los episodios exitosos y fallidos para estudiar los modos de error documentados (coordenadas fabricadas, mezcla de reglas entre juegos, desajuste explicacion/accion, generacion repetida).
- Reproducibilidad de checkpoints: cargar los pesos con transformers en bf16 y `device_map="auto"` para inicializar trabajo futuro, sabiendo que no se incluye estado de optimizador, RNG ni sampler.
- Estudio de la brecha SFT vs RL: comparar la rama SFT `B_full` con las ramas RL (iter99, iter198) para medir el efecto del RL sobre el conocimiento internalizado.
- Base para ajuste posterior en dominios de rejilla: partir de estos pesos para SFT adicional en tareas de planificacion sobre rejillas, dado que el modelo ya ha visto estados de entorno estructurados.
- Evaluacion de limitaciones de ARC-AGI-3: usar el checkpoint como linea base para medir el techo de un modelo de ~9,6B en entornos de primer nivel conocidos, sin asumir generalizacion a layouts nuevos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, y advierte explicitamente que la cohorte de muestreo se genero antes de su actualizacion, por lo que no debe reportarse como evaluacion independiente de estos pesos. El autor indica ademas que el aprendizaje es no monotonico, esta dominado por m0r0, y que la continuacion de proceso se detuvo en 341 muestreos con todos los fallos, dejando 340 como ultima actualizacion verificada en lugar de completar 400.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parametros, en bf16 se requieren aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria 10-11 GB y en 4 bits unos 5-6 GB (estimaciones genericas; no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o configuraciones multi-GPU para bf16 sin cuantizar; el entrenamiento RL uso TP4/PP1, lo que sugiere despliegues de 4 GPUs.
- Cabe en GPU de consumo: si, en GPUs con 24 GB o mas (RTX 3090, RTX 4090) usando cuantizacion; en bf16 completo no cabe en 24 GB.
- Opciones de despliegue: transformers (ruta oficial documentada con `Qwen3_5ForConditionalGeneration` y `AutoProcessor`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible y requeririan conversion a GGUF u otros formatos no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter198 | 9.653.104.368 | no disponible | SFT + RL sobre ARC-AGI-3 (cd82/m0r0) | Apache-2.0 | Pesos safetensors en HF |
| Qwen/Qwen3.5-9B (base) | ~9,6B (misma base) | no disponible | Modelo generalista multimodal | no disponible en esta ficha | HF |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99 | misma base | no disponible | Checkpoint padre de la misma rama RL | Apache-2.0 | HF |
| E2K de ziyan98 (colecciones de referencia de layout) | no disponible | no disponible | Proyecto separado, sin herencia de puntuaciones | no disponible | HF |

La comparacion con modelos de proposito general del mismo tamano no es significativa: el autor subraya que este checkpoint no es una mejora general de Qwen3.5-9B y que no hereda ni replica los resultados reportados por el proyecto de ziyan98.

## Limitaciones y advertencias

- No es una mejora de proposito general de Qwen3.5-9B; su rendimiento esta acotado a los entornos de primer nivel cd82 y m0r0 y no constituye evidencia de exito en layouts nuevos ni en el juego completo.
- Las auditorias encuentran coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicacion y accion y generacion repetida incluso en episodios exitosos.
- Las etiquetas y la recitacion de conocimiento no son evidencia de uso correcto del conocimiento.
- El aprendizaje es no monotonico y esta dominado por m0r0; la continuacion de proceso se detuvo en 341 muestreos con todos los fallos, con 340 como ultima actualizacion verificada en lugar de 400.
- Los pesos exactos del pico 260..269 no se conservan y HF249 no esta etiquetado como el mejor checkpoint.
- La cohorte de muestreo se genero antes de su actualizacion y no debe reportarse como evaluacion independiente de estos pesos; la recompensa `rollout/rewards` es una media de ventaja ponderada por respuesta, no la recompensa de entorno.
- No se sube optimizador, checkpoint distribuido nativo, pickle, RNG ni estado de sampler: los pesos permiten inicializar trabajo futuro pero no continuar Adam de forma exacta.
- La torre de vision y los tensores MTP no se entrenaron en este experimento.
- Licencia Apache-2.0 copiada de la exportacion base; el uso comercial esta permitido por la licencia, pero el modelo es un checkpoint de investigacion sin garantias de calidad para produccion.
- Idiomas soportados y contexto maximo no declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter198
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint padre (iter99): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos, metricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs

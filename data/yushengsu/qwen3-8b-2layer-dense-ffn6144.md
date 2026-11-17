# yushengsu/Qwen3-8B-2layer-Dense-FFN6144

## Resumen

Qwen3-8B-2layer-Dense-FFN6144 es un modelo borrador (*draft model*) para decodificacion especulativa, no un modelo generativo autonomo. Lo desarrolla el usuario yushengsu y se construye como destilacion de dos capas de Qwen/Qwen3-8B, pensada para integrarse como modelo propuesto en el algoritmo DSPARK de SGLang. Su funcion es acelerar la inferencia del modelo objetivo Qwen3-8B prediciendo bloques de tokens que el modelo grande valida despues.

Se trata de la variante densa de los borradores MoE de dos capas del mismo autor, con iguales parametros activos (0,334 B). Cada capa monta un unico MLP SwiGLU de anchura 6144, que equivale a la anchura FFN que activa por token el MoE de 8 expertos x 1536 con top-4 (0,334 B activos). El modelo total suma 0,334 B de parametros, frente a los 0,485 B del MoE equivalente.

La relevancia es practica: permite comparar, en igualdad de parametros activos, un borrador denso frente a uno MoE dentro de un pipeline de decodificacion especulativa sobre Qwen3-8B, con checkpoints por epoch directamente servibles en SGLang 0.5.18. La arquitectura es transformer de 2 capas con atencion completa, GQA 8/2, hidden 4096 y un proyector DSpark sobre las capas objetivo 1/9/17/25/33 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 2 capas decoder, atencion completa causal dentro del bloque borrador, GQA 8 cabezas / 2 KV (head_dim 128), MLP SwiGLU anchura 6144 por capa, proyector DSpark, cabeza Markov vanilla (rango 256), tamano de bloque 16 |
| Parametros totales | 0,334 B |
| Parametros activos | no aplica (modelo denso; 0,334 B activos en total) |
| Longitud de contexto | no disponible (entrenado con max length 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador consta de 2 capas decoder con atencion completa (causal dentro del bloque borrador), hidden residual 4096, GQA con 8 cabezas de atencion y 2 de KV (head_dim 128), y un MLP SwiGLU de anchura 6144 por capa. Incorpora un proyector DSpark sobre las capas 1/9/17/25/33 del modelo objetivo, una cabeza Markov vanilla de rango 256, tamano de bloque 16, sin cabeza de confianza, y reutiliza el embedding y el lm_head del modelo objetivo. La configuracion esta en `configs/qwen3-8b-dense-6144-dspark.json` sobre un fork de SpecForge (rama `exp/qwen3-8b-dspark-dense-6144-2layer`, codigo `dev-moe-draft` @ 475c9b92 mas los commits 84d0365 y 966, ambos cambios solo de velocidad).

El entrenamiento usa 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking desactivado), plantilla qwen3-instruct, longitud maxima 8192. Se ejecutaron 5 epochs equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 x acumulacion 11 x 6 ranks DDP), AdamW con lr 6e-4, cosine, 4 % warmup, grad clip 1.0 y semilla 42. La perdida combina 0.1 CE + 0.9 L1 con 512 anchors y loss_decay_gamma 7. El calculo se repartio en 7 GPUs de un nodo 8x B200: 1 servidor de captura SGLang (GPU 0, backend de atencion triton) y 6 ranks de entrenamiento (GPUs 2-7), dejando la GPU 1 sin uso por throttling termico.

## Capacidades

- Prediccion de tokens para decodificacion especulativa DSPARK sobre Qwen3-8B, con tamano de bloque 16.
- Aceptacion media de longitud de paseo (*walk accept length*) de 5,06 tras 5 epochs.
- Reutilizacion del embedding y lm_head del modelo objetivo, lo que reduce el coste de memoria del borrador.
- Proyector DSpark multi-capa sobre capas 1/9/17/25/33 del modelo base.
- Cabeza Markov de rango 256 para modelar dependencias dentro del bloque.
- No es un modelo generativo autonomo: no se usa para conversacion, codigo ni matematicas por si mismo.
- Capacidades multilingues, tool calling, agentes y modos thinking: no disponibles en este borrador (heredadas del modelo objetivo, no del borrador).

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: se carga como `--speculative-draft-model-path` con `--speculative-algorithm DSPARK` en SGLang 0.5.18 para reducir la latencia por token del modelo objetivo.
- Servicio de chat de baja latencia: al predecir bloques de hasta 16 tokens validados por el modelo grande, recorta el coste por token en despliegues interactivos donde el tiempo hasta primer token y el throughput importan.
- Comparativa de arquitecturas de borrador: permite medir empiricamente borrador denso frente a MoE con iguales parametros activos (0,334 B) usando el mismo codigo, datos y receta.
- Investigacion en decodificacion especulativa: sirve para estudiar el efecto de la anchura FFN (6144 frente a 3072 y 1536) y del numero de capas sobre la tasa de aceptacion.
- Evaluacion de checkpoints intermedios: las carpetas `1ep/` a `5ep/` permiten trazar la curva de aceptacion (de 4,27 a 5,06) y elegir el punto de equilibrio coste/aceptacion.
- Reproduccion de experimentos: la configuracion y el fork de SpecForge documentados permiten replicar el entrenamiento en hardware B200 o adaptarlo a otros nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. Se recogen las metricas de entrenamiento por epoch (media de los ultimos 1.000 pasos):

| Epoch | Paso final | Accuracy | Cross-entropy | Walk accept length |
|---|---|---|---|---|
| 1 | 10.764 | 0,635 | 1,598 | 4,27 |
| 2 | 21.528 | 0,671 | 1,400 | 4,65 |
| 3 | 32.292 | 0,686 | 1,322 | 4,84 |
| 4 | 43.056 | 0,695 | 1,285 | 4,95 |
| 5 | 53.820 | 0,705 | 1,246 | 5,06 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,334 B de parametros en safetensors el repo ocupa 3,3 GB, por lo que el borrador es ligero frente al modelo objetivo Qwen3-8B.
- GPU recomendadas: no disponible; el entrenamiento se realizo en NVIDIA B200 y las ejecuciones de referencia usaron nodos H200.
- Cabe en GPU consumer: probable por tamano (0,334 B), pero no confirmado en la informacion disponible.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm DSPARK --speculative-draft-model-path <carpeta>`; otras opciones (vLLM, llama.cpp, Ollama, TGI) no disponibles.
- Latencia y throughput: no disponibles; la metrica publicada es la longitud media de aceptacion (5,06 tokens tras 5 epochs).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | FFN | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3-8B-2layer-Dense-FFN6144 (este) | 0,334 B | 0,334 B | 6144 denso | entrenado a 8192 | apache-2.0 | publicado |
| Qwen3-8B-2layer-MoE-8E4A | 0,485 B | 0,334 B | 8 expertos x 1536, top-4 | entrenado a 8192 | no disponible | publicado |
| Qwen3-8B-2layer-Dense-FFN3072 | no disponible | no disponible | 3072 denso | entrenado a 8192 | no disponible | publicado |
| Qwen3-8B-2layer-Dense-v2 (FFN 1536) | no disponible | no disponible | 1536 denso | entrenado a 8192 | no disponible | publicado |

Las variantes MoE top-1 y top-2 del mismo autor tambien existen pero sus especificaciones completas no estan en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: solo funciona como borrador dentro de un pipeline DSPARK; su salida debe validarse con Qwen3-8B.
- Sin resultados de benchmarks estandar ni evaluacion de calidad generativa publicada.
- La aceptacion media de 5,06 tokens sobre bloque 16 implica que una parte relevante de las propuestas se descarta; el rendimiento efectivo depende del modelo objetivo y del dominio.
- Entrenado con respuestas regeneradas por Qwen3-8B con thinking desactivado, por lo que puede no cubrir bien modos de razonamiento extendido.
- Idiomas soportados no documentados; la cobertura linguistica depende de los prompts de Open Perfect Blend y del modelo base.
- Sesgos conocidos y riesgo de alucinacion: no disponibles de forma especifica para este borrador.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-8B y del codigo SpecForge utilizado.
- Requiere SGLang 0.5.18 y el fork documentado; la integracion con otros runtimes no esta confirmada.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria ni reportes de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN6144
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante MoE equivalente: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Variante densa FFN 1536: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-v2
- Variante densa FFN 3072: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN3072
- Variante MoE top-1: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E1A-v2
- Variante MoE top-2: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Registro de entrenamiento W&B: https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/m15dedj1
- Checkpoints por epoch: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN6144/tree/main/5ep

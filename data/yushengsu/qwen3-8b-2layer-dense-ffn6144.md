# yushengsu/Qwen3-8B-2layer-Dense-FFN6144

## Resumen

Qwen3-8B-2layer-Dense-FFN6144 es un modelo borrador (draft model) disenado para decodificacion especulativa sobre el modelo base Qwen/Qwen3-8B. Lo desarrolla el usuario yushengsu en el contexto del proyecto SpecForge y del algoritmo DSpark, y no es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo objetivo de 8B verifica, acelerando asi la inferencia sin degradar la calidad de la salida final.

Tecnicamente es un transformer denso de solo 2 capas decoder con atencion completa, hidden residual de 4096, GQA de 8 cabezas de atencion y 2 de KV (head_dim 128) y un MLP SwiGLU de anchura 6144 por capa. Con 0,334 B parametros totales, es la contraparte densa de los borradores MoE de 2 capas con iguales parametros activos: el MoE 8E4A activa 0,334 B por token pero almacena 0,485 B en total, mientras que este modelo denso tiene los 0,334 B en su totalidad.

El modelo se entrena con 1.420.903 prompts de Open Perfect Blend cuyas respuestas se regeneraron con Qwen3-8B a temperatura 0 y thinking desactivado, durante 5 epocas (53.822 pasos de optimizador). Es relevante para equipos que desplieguan Qwen3-8B en produccion y buscan reducir la latencia de decodificacion mediante speculative decoding con un borrador pequeno y entrenado especificamente para el objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 2 capas decoder, atencion completa (causal dentro del bloque borrador), GQA 8 cabezas / 2 KV, head_dim 128, SwiGLU MLP de anchura 6144, proyector DSpark sobre capas objetivo 1/9/17/25/33, cabeza Markov vanilla (rango 256), block size 16, sin cabeza de confianza |
| Parametros totales | 0,334 B |
| Parametros activos | 0,334 B (modelo denso; no es MoE) |
| Longitud de contexto | 8192 tokens (longitud maxima usada en entrenamiento; contexto nativo del modelo objetivo no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del modelo base Qwen/Qwen3-8B, no documentados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (servible directamente por SGLang 0.5.18 desde cada carpeta `<k>ep/`) |

## Arquitectura y entrenamiento

El modelo es un borrador DSpark de 2 capas con atencion completa y causalidad interna al bloque, hidden residual de 4096 y un unico MLP SwiGLU de anchura 6144 por capa. Incorpora un proyector DSpark que toma representaciones de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B, una cabeza Markov de rango 256 y un tamano de bloque de 16, sin cabeza de confianza. Reutiliza el embedding y el `lm_head` del modelo objetivo. La configuracion vive en `configs/qwen3-8b-dense-6144-dspark.json`, en la rama de fork de SpecForge `exp/qwen3-8b-dspark-dense-6144-2layer` (codigo `dev-moe-draft` @ 475c9b92).

El entrenamiento usa 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking off), plantilla qwen3-instruct y longitud maxima de 8192. Se ejecutan 5 epocas, equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 x acumulacion 22 x 3 rangos DDP), AdamW con lr 6e-4, schedule cosine, 4% warmup, grad clip 1.0 y semillas 42. La funcion de perdida combina 0,1 CE + 0,9 L1 con 512 anchors y `loss_decay_gamma` 7. El run se ejecuto en 4 GPUs de un nodo de 8x B200: un servidor de captura SGLang en la GPU 4 y tres rangos de entrenamiento en las GPUs 5-7.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa DSpark sobre Qwen3-8B, verificados por el modelo objetivo.
- Aceleracion de la decodificacion autoregresiva del modelo de 8B mediante bloques de 16 tokens propuestos por el borrador.
- Aprovechamiento de representaciones internas del objetivo a traves del proyector DSpark sobre las capas 1/9/17/25/33.
- Modelado de dependencias locales dentro del bloque mediante cabeza Markov de rango 256.
- No dispone de capacidades generativas autonomas: no es un modelo de chat, razonamiento, codigo o vision por si mismo.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no es su funcion).
- Capacidades multilingues: no disponible en la model card.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: se sirve junto al modelo objetivo con SGLang 0.5.18 usando `--speculative-algorithm DSPARK --speculative-draft-model-path <carpeta>`, reduciendo la latencia por token verificada frente a la decodificacion estandar.
- Servicio de chat de baja latencia: al proponer bloques de 16 tokens verificados por el modelo de 8B, disminuye el tiempo hasta el primer token completo en cargas conversacionales con contexto de hasta 8192 tokens.
- Investigacion comparativa de borradores: permite contrastar el rendimiento de un borrador denso de 0,334 B frente a los borradores MoE 8E1A, 8E2A y 8E4A del mismo autor con identica receta de datos y epocas.
- Estudio de escalado de anchura FFN en borradores: al compartir codigo, datos y receta con las variantes FFN 1536 y FFN 3072, sirve para medir el efecto de la anchura del MLP en la tasa de aceptacion.
- Despliegue en nodos con GPU de gran memoria: el run de referencia usa B200 y H200, por lo que encaja en infraestructuras que ya sirven Qwen3-8B y quieren anadir el borrador en la misma maquina.
- Reproducibilidad de experimentos de speculative decoding: la configuracion, el commit de codigo y el run de W&B estan documentados, lo que facilita replicar el entrenamiento y auditar resultados.
- Evaluacion de trade-offs memoria/velocidad: al tener 0,334 B parametros totales frente a los 0,485 B del MoE equivalente, permite medir el ahorro de memoria del borrador denso en el despliegue.

## Benchmarks y rendimiento

La model card incluye una tabla de metricas por epoca (precision, cross-entropy, longitud de aceptacion de walk y checkpoint), pero las filas de datos estan vacias en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,334 B parametros, el peso en precision de entrenamiento ronda los 0,67 GB y en FP16 los 0,67 GB, a lo que se suma el coste del modelo objetivo Qwen3-8B servido en paralelo.
- GPU recomendadas segun el run documentado: B200 (nodo 8x B200) y H200 (variantes H200 citadas para los runs MoE).
- Cabe en GPU consumer: previsiblemente si por tamano del borrador, pero el modelo objetivo de 8B condiciona el requisito conjunto; no se documenta una configuracion consumer concreta.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm DSPARK --speculative-draft-model-path <carpeta>`; cada carpeta `<k>ep/` es servible directamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-2layer-Dense-FFN6144 (este) | 0,334 B | 0,334 B | 8192 (entrenamiento) | Apache 2.0 | Borrador denso, FFN 6144, 5 epocas |
| Qwen3-8B-2layer-MoE-8E4A | 0,485 B | 0,334 B | 8192 (entrenamiento) | Apache 2.0 | Borrador MoE top-4, 8 expertos x 1536 |
| Qwen3-8B-2layer-Dense-FFN3072 | no disponible | no disponible | 8192 (entrenamiento) | Apache 2.0 | Borrador denso, FFN 3072, misma receta |
| Qwen3-8B-2layer-Dense-v2 (FFN 1536) | no disponible | no disponible | 8192 (entrenamiento) | Apache 2.0 | Borrador denso, FFN 1536, misma receta |

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo funciona como borrador de decodificacion especulativa junto a Qwen3-8B y el stack SGLang/DSpark.
- La tabla de metricas por epoca de la model card aparece sin filas de datos, por lo que no hay evidencia publicada de la tasa de aceptacion ni de la calidad del borrador.
- El entrenamiento se limita a respuestas regeneradas por Qwen3-8B a temperatura 0 con thinking desactivado y longitud maxima 8192; el comportamiento fuera de esa distribucion no esta documentado.
- Sin cabeza de confianza: no hay mecanismo interno de filtrado de propuestas de baja confianza mas alla de la verificacion del modelo objetivo.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del dataset Open Perfect Blend y del modelo base.
- Riesgo de alucinacion: no aplicable a la salida final (verificada por el objetivo), pero propuestas erroneas reducen la tasa de aceptacion y el speedup.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3-8B y del dataset de entrenamiento.
- Dependencia de version: el despliegue se documenta para SGLang 0.5.18; otras versiones pueden no soportar el algoritmo DSPARK con este formato de checkpoint.
- Sin descargas ni likes en el momento de la ficha: modelo recien publicado, sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN6144
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Borrador MoE equivalente (8E4A): https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Borrador denso FFN 1536: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-v2
- Borrador denso FFN 3072: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN3072
- Borrador MoE top-1: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E1A-v2
- Borrador MoE top-2: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Run de entrenamiento W&B: https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/r5zn8rqd

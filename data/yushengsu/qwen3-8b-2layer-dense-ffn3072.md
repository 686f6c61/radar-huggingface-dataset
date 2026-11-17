# yushengsu/Qwen3-8B-2layer-Dense-FFN3072

## Resumen

Qwen3-8B-2layer-Dense-FFN3072 es un modelo borrador (draft model) para decodificación especulativa, no un modelo generativo autónomo. Lo publica el usuario yushengsu en Hugging Face y se construye sobre Qwen/Qwen3-8B como modelo objetivo (target). Su función es predecir bloques de tokens que el modelo grande verifica después, de modo que la inferencia de Qwen3-8B resulte más rápida sin alterar la distribución de salida final.

Técnicamente es un transformer denso de solo 2 capas con atención completa causal dentro del bloque, hidden residual de 4096, GQA con 8 cabezas de atención y 2 de KV (head_dim 128) y un MLP SwiGLU de anchura 3072 por capa. Incorpora un proyector DSpark sobre las capas 1/9/17/25/33 del modelo objetivo, una cabeza Markov de rango 256 y tamaño de bloque 16, con embeddings y lm_head del modelo objetivo. Suma 0,258 B parámetros totales, equivalentes a los parámetros activos por token de la variante MoE 8E2A hermana.

La relevancia es doble: por un lado, sirve como referencia para comparar borradores densos frente a MoE con el mismo coste activo por token; por otro, se distribuye con checkpoints por época directamente servibles en SGLang 0.5.18 mediante `--speculative-algorithm DSPARK`, lo que permite evaluar el compromiso entre longitud de aceptación y coste de cómputo en pipelines reales con Qwen3-8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de 2 capas (atención completa causal dentro del bloque), hidden 4096, GQA 8 cabezas / 2 KV, head_dim 128, SwiGLU MLP de anchura 3072 por capa, proyector DSpark sobre capas 1/9/17/25/33 del objetivo, cabeza Markov de rango 256, block size 16, sin cabeza de confianza |
| Parámetros totales | 0,258 B |
| Parámetros activos | No aplica (modelo denso); 0,258 B activos por token |
| Longitud de contexto | No disponible (el entrenamiento usa longitud máxima 8192, pero es un borrador de bloque, no un modelo de contexto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,6 GB; checkpoints por época en `1ep/` a `5ep/`) |

## Arquitectura y entrenamiento

El modelo es un borrador denso de 2 capas diseñado como contrapartida exacta de los borradores MoE de 2 capas con igual coste activo. Cada capa contiene un único MLP SwiGLU de anchura 3072, que es precisamente la anchura FFN que activa por token el MoE de 8 expertos × 1536 con top-2 (Qwen3-8B-2layer-MoE-8E2A): 0,258 B parámetros activos en ambos casos, aunque el MoE totaliza 0,485 B. La atención es completa y causal dentro del bloque, con GQA de 8 cabezas y 2 de KV. El proyector DSpark toma representaciones de las capas 1, 9, 17, 25 y 33 del Qwen3-8B objetivo, y la predicción se completa con una cabeza Markov de rango 256 sobre bloques de 16 tokens, sin cabeza de confianza.

El entrenamiento parte de 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking desactivado), plantilla qwen3-instruct y longitud máxima 8192. Se ejecutan 5 épocas, equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 × acumulación 11 × 6 rangos DDP), AdamW con lr 6e-4, schedule coseno, 4 % de warmup, grad clip 1.0 y semilla 42. La función de pérdida combina 0,1 CE + 0,9 L1 con 512 anclas y `loss_decay_gamma` 7. El cómputo se realizó en un nodo de 8× H200: 2 servidores de captura SGLang en las GPUs 0-1 y 6 rangos de entrenamiento en las GPUs 2-7, sobre un fork de SpecForge (rama `exp/qwen3-8b-dspark-dense-3072-2layer`, código `dev-moe-draft` @ 475c9b92 con los PR #958, #961 y #966 aplicados: CE en FP32 fusionada + pérdida L1 sobre logits y sincronización DDP una vez por ventana de acumulación). El despacho de consumidores queda en round_robin.

## Capacidades

- Predicción especulativa de bloques de 16 tokens para acelerar la inferencia de Qwen3-8B en SGLang 0.5.18 con el algoritmo DSPARK.
- Aceptación de caminata (walk accept length) creciente por época: 4,15 → 4,47 → 4,65 → 4,72 → 4,82 tokens de media.
- Precisión de predicción por token del 62,4 % en la época 1 hasta el 68,5 % en la época 5 (media sobre los últimos 1.000 pasos de optimizador de cada época).
- Integración con el vocabulario, embeddings y lm_head del modelo objetivo Qwen3-8B, sin vocabulario propio.
- No es un modelo de chat, razonamiento, código ni matemáticas por sí mismo: no genera respuestas de forma autónoma ni soporta tool calling, agentes o modo thinking.
- No dispone de capacidades multimodales ni de audio.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: desplegar el checkpoint `5ep/` como draft en SGLang con `--speculative-algorithm DSPARK --speculative-draft-model-path 5ep/` para reducir la latencia por token del modelo objetivo en servicios de generación de texto.
- Servicio de chat de alto throughput: al elevar la longitud media de aceptación a 4,82 tokens por paso de verificación, se reduce el número de pasos del modelo grande por respuesta, lo que aumenta el número de peticiones concurrentes atendidas con el mismo hardware.
- Evaluación comparativa denso frente a MoE: usar este modelo junto a los borradores MoE 8E2A, 8E1A y 8E4A del mismo autor, con idéntico código, datos y receta, para medir qué arquitectura de borrador ofrece mejor relación aceptación/coste con el mismo presupuesto activo (0,258 B).
- Investigación en decodificación especulativa: servir como referencia reproducible para estudiar el efecto de la anchura FFN y del número de capas en la tasa de aceptación, dado que el autor publica las variantes densas de FFN 1536 y FFN 3072 con la misma receta de 5 épocas.
- Ajuste fino de pipelines de inferencia con SGLang: validar la integración del algoritmo DSPARK y del fork de SpecForge en entornos de staging antes de adoptar borradores en producción.
- Despliegue en nodos con memoria limitada: con 0,258 B parámetros y un repo de 2,6 GB, el borrador ocupa una fracción pequeña de la VRAM frente al objetivo de 8 B, lo que permite reservar la mayor parte de la memoria del acelerador al modelo grande.
- Reproducción de experimentos: los checkpoints por época (`1ep/` a `5ep/`) permiten trazar la curva de aceptación y elegir el punto de la receta que mejor equilibra calidad y coste en una carga concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica métricas de entrenamiento por época, medidas como media sobre los últimos 1.000 pasos de optimizador de cada época:

| Época | Paso final | Precisión | Entropía cruzada | Longitud de aceptación | Checkpoint |
|---|---|---|---|---|---|
| 1 | 10.764 | 0,624 | 1,666 | 4,15 | `1ep/` |
| 2 | 21.528 | 0,656 | 1,481 | 4,47 | `2ep/` |
| 3 | 32.292 | 0,670 | 1,406 | 4,65 | `3ep/` |
| 4 | 43.056 | 0,677 | 1,379 | 4,72 | `4ep/` |
| 5 | 53.820 | 0,685 | 1,341 | 4,82 | `5ep/` |

No se dispone de comparación numérica directa con los borradores MoE hermanos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el borrador tiene 0,258 B parámetros; en safetensors de precisión nativa el repo ocupa 2,6 GB, por lo que el peso del draft requiere del orden de 2-3 GB de VRAM, además de la memoria del modelo objetivo Qwen3-8B y de las cachés KV.
- GPU recomendadas: el entrenamiento se realizó en 8× H200; para servicio, cualquier GPU que ya aloje Qwen3-8B con margen suficiente (A100 80 GB, H100, H200) puede añadir el borrador.
- GPU de consumo: no se han publicado requisitos oficiales; el tamaño del borrador (2,6 GB) es compatible con GPUs de consumo de 16-24 GB siempre que el objetivo Qwen3-8B quepa junto a él, algo que depende de la cuantización del objetivo y no está documentado en la información disponible.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm DSPARK --speculative-draft-model-path <carpeta>`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la única métrica publicada es la longitud media de aceptación por época (hasta 4,82 tokens), que determina la ganancia relativa frente a la decodificación sin borrador.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-8B-2layer-Dense-FFN3072 | Borrador denso, 2 capas, FFN 3072 | 0,258 B | 0,258 B | No disponible | Apache 2.0 | Hugging Face (yushengsu) |
| Qwen3-8B-2layer-MoE-8E2A | Borrador MoE, 2 capas, 8 expertos top-2 | 0,485 B | 0,258 B | No disponible | No disponible | Hugging Face (yushengsu) |
| Qwen3-8B-2layer-Dense-v2 | Borrador denso, 2 capas, FFN 1536 | No disponible | No disponible | No disponible | No disponible | Hugging Face (yushengsu) |
| Qwen3-8B-2layer-MoE-8E1A-v2 | Borrador MoE, 2 capas, 8 expertos top-1 | No disponible | No disponible | No disponible | No disponible | Hugging Face (yushengsu) |

Los cuatro modelos comparten código, datos y receta de 5 épocas, lo que permite una comparación controlada entre arquitecturas de borrador. No se dispone de datos de rendimiento comparativos publicados entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autónomo: solo predice tokens candidatos para Qwen3-8B; usarlo sin el modelo objetivo y sin SGLang con DSPARK no produce salidas válidas.
- Dependencia estricta de la versión de SGLang (0.5.18) y del algoritmo DSPARK; no hay soporte documentado para otros frameworks de inferencia.
- La tasa de aceptación es limitada: 4,82 tokens de media en el mejor checkpoint, lejos de aceptar bloques completos de 16, por lo que la ganancia de velocidad es moderada y depende de la carga.
- El borrador se entrenó exclusivamente con respuestas de Qwen3-8B a temperatura 0 y thinking desactivado; su comportamiento con modo thinking activo, otras temperaturas o dominios fuera de Open Perfect Blend no está documentado.
- Idiomas soportados no disponibles; al heredar el vocabulario del objetivo, la cobertura lingüística efectiva del borrador no se ha evaluado.
- Riesgo de degradación si el modelo objetivo se sustituye por otra versión o cuantización distinta de Qwen/Qwen3-8B, ya que el proyector DSpark está anclado a las capas 1/9/17/25/33 de ese checkpoint concreto.
- Sin datos publicados sobre sesgos, alucinación o robustez; al ser un borrador verificado por el objetivo, no introduce contenido propio, pero tampoco se ha auditado su comportamiento en casos límite.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base Qwen3-8B al desplegar el conjunto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN3072
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Borrador MoE 8E2A (referencia de parámetros activos): https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Borrador denso FFN 1536: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-v2
- Borrador MoE top-1: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E1A-v2
- Borrador MoE top-4: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Registro de entrenamiento (W&B): https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/l5a1k0lo
- Checkpoints por época: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN3072/tree/main/1ep (y análogos `2ep/`, `3ep/`, `4ep/`, `5ep/`)

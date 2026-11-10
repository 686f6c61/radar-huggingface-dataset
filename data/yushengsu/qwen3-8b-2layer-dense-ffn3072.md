# yushengsu/Qwen3-8B-2layer-Dense-FFN3072

## Resumen

Qwen3-8B-2layer-Dense-FFN3072 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por el usuario yushengsu dentro del ecosistema SpecForge. No es un modelo de propósito general: es un "draft" denso de 2 capas diseñado para acelerar la inferencia de Qwen3-8B mediante el algoritmo DSPARK en SGLang. Con solo 0,258 B de parámetros totales, propone tokens candidatos que el modelo objetivo Qwen3-8B verifica, reduciendo el coste por token generado.

El modelo se presenta como la contraparte densa de los borradores MoE de 2 capas del mismo autor con parámetros activos equivalentes. Concretamente, su MLP SwiGLU de anchura 3072 por capa replica la anchura FFN que activa por token la variante MoE 8E2A (8 expertos, top-2, 1536 por experto). Ambos tienen 0,258 B de parámetros activos por token, aunque este modelo denso tiene 0,258 B en total frente a los 0,485 B del MoE.

Es relevante para quienes despliegan Qwen3-8B en producción y buscan mejorar el throughput sin cambiar el modelo objetivo. El repositorio está en estado inicial ("starting on specforge-exp-branch"), con métricas por época aún no publicadas y cero descargas, por lo que debe tratarse como material experimental. La licencia es Apache 2.0 y los pesos se sirven directamente con SGLang 0.5.18.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 2 capas decoder (atención completa, causal dentro del bloque draft), residual oculto 4096, GQA 8 cabezas / 2 KV (head_dim 128), MLP SwiGLU de anchura 3072 por capa, proyector DSpark sobre capas objetivo 1/9/17/25/33, cabeza Markov vanilla (rango 256), tamaño de bloque 16, sin cabeza de confianza, embedding y lm_head del objetivo |
| Parametros totales | 0,258 B |
| Parametros activos | No aplica (modelo denso); 0,258 B activos por token |
| Longitud de contexto | No disponible (el entrenamiento usa longitud máxima 8192) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (carpetas `<k>ep/` servibles directamente por SGLang 0.5.18) |

## Arquitectura y entrenamiento

El modelo es un borrador denso de 2 capas con atención completa y máscara causal dentro del bloque draft, dimensión residual 4096 y GQA con 8 cabezas de consulta y 2 de clave/valor (head_dim 128). Cada capa incluye un único MLP SwiGLU de anchura 3072. Sobre el tronco se añade un proyector DSpark que toma representaciones de las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y un tamaño de bloque de 16, sin cabeza de confianza. Reutiliza el embedding y el lm_head de Qwen3-8B. La configuración de referencia es `configs/qwen3-8b-dense-3072-dspark.json`, en la rama `exp/qwen3-8b-dspark-dense-3072-2layer` del fork de SpecForge (código `dev-moe-draft` @ 475c9b92).

El entrenamiento usa 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking desactivado), plantilla qwen3-instruct y longitud máxima 8192. Se ejecutan 5 épocas, equivalentes a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 x acumulación 11 x 6 rangos DDP). Se emplea AdamW con lr 6e-4, scheduler coseno, 4 % de warmup, grad clip 1.0 y semilla 42. La función de pérdida combina 0,1 CE + 0,9 L1 con 512 anclas y `loss_decay_gamma` 7. Todo el run se ejecutó en un nodo de 8x H200: 2 servidores de captura SGLang (GPUs 0-1) y 6 rangos de entrenamiento (GPUs 2-7).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B con el algoritmo DSPARK en SGLang.
- Predicción de bloques de hasta 16 tokens por paso de borrador, verificados posteriormente por el modelo objetivo.
- Aprovechamiento de representaciones internas del objetivo mediante el proyector DSpark sobre las capas 1/9/17/25/33.
- Cabeza Markov de rango 256 para modelar dependencias locales dentro del bloque.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso de forma nativa: hereda las capacidades del objetivo solo en la medida en que sus predicciones son verificadas por Qwen3-8B.
- Capacidades multilingües: no disponibles de forma explícita; dependen del corpus de entrenamiento (prompts de Open Perfect Blend regenerados por Qwen3-8B).
- Sin modo thinking, sin visión y sin audio.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone bloques de hasta 16 tokens que el objetivo verifica en paralelo, reduciendo el número de pasos de decodificación del modelo grande. Adecuado porque su coste por token es muy bajo (0,258 B) frente a los 8 B del objetivo.
- Despliegue en SGLang 0.5.18: cada carpeta `<k>ep/` se sirve directamente con `--speculative-algorithm DSPARK --speculative-draft-model-path <folder>`, sin conversión adicional.
- Comparación experimental denso vs. MoE en decodificación especulativa: al compartir código, datos y receta de 5 épocas con las variantes MoE 8E1A, 8E2A y 8E4A, permite aislar el efecto de la arquitectura del borrador con los mismos parámetros activos.
- Servicios de chat de baja latencia sobre Qwen3-8B: la decodificación especulativa reduce el tiempo entre tokens en cargas interactivas, siempre que la tasa de aceptación del borrador sea alta.
- Investigación en decodificación especulativa: el repositorio documenta configuración, receta y logs de W&B, lo que facilita reproducir y extender el experimento dentro de SpecForge.
- Generación por lotes con SLA de throughput: al disminuir los pasos de decodificación del objetivo, se incrementa el número de tokens por segundo por GPU en despliegues con vLLM/SGLang, aunque la ganancia depende de la aceptación medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tabla de métricas por época del repositorio (accuracy, cross-entropy, walk accept length y checkpoint) aparece sin filas en la model card, y no se proporcionan cifras de tasa de aceptación ni de speedup.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,258 B de parámetros, los pesos en FP16 rondarían los 0,5 GB, pero el consumo real depende del runtime SGLang y del modelo objetivo que se sirve en paralelo.
- GPU recomendadas: el entrenamiento se realizó en 8x H200; para servir el borrador junto a Qwen3-8B se recomienda una GPU con al menos la VRAM necesaria para el objetivo (A100 40/80 GB, H100, H200).
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer; el borrador es pequeño, pero el modelo objetivo Qwen3-8B condiciona el requisito global.
- Opciones de despliegue: SGLang 0.5.18 con `--speculative-algorithm DSPARK` y `--speculative-draft-model-path`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles; no se publican tasas de aceptación ni speedups medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos por token | Arquitectura | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3-8B-2layer-Dense-FFN3072 (este) | 0,258 B | 0,258 B | Densa, 2 capas, FFN 3072 | No disponible | Apache 2.0 | Experimental, 0 descargas |
| Qwen3-8B-2layer-MoE-8E2A | 0,485 B | 0,258 B | MoE 8 expertos top-2, FFN 1536 | No disponible | Apache 2.0 | Experimental, mismo autor |
| Qwen3-8B-2layer-Dense-v2 (FFN 1536) | No disponible | No disponible | Densa, 2 capas, FFN 1536 | No disponible | Apache 2.0 | Experimental, mismo autor |
| Qwen3-8B-2layer-MoE-8E1A-v2 / 8E4A | No disponible | No disponible | MoE top-1 / top-4 | No disponible | Apache 2.0 | Experimental, mismo autor |

No se dispone de datos de rendimiento comparativo (tasas de aceptación o speedups) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo en estado inicial ("starting on specforge-exp-branch"), con 0 descargas y 0 likes; no debe considerarse estable para producción.
- Sin métricas publicadas de aceptación ni de speedup: no hay evidencia cuantitativa de la ganancia real frente a servir Qwen3-8B sin borrador.
- Solo es utilizable como borrador de decodificación especulativa con SGLang 0.5.18 y el algoritmo DSPARK; no es un modelo autónomo para generación directa.
- Depende del modelo objetivo Qwen3-8B y de sus capas internas (1/9/17/25/33); no es portable a otros modelos sin reentrenamiento.
- Riesgo de alucinación: mitigado parcialmente por la verificación del objetivo, pero una baja tasa de aceptación degradaría el rendimiento en lugar de mejorarlo.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del corpus de entrenamiento y del objetivo.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto experimental sin validación pública, el riesgo de fallo en producción recae en el integrador.
- No se documentan sesgos específicos; al entrenarse con respuestas regeneradas por Qwen3-8B, puede heredar sesgos del objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-FFN3072
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante MoE 8E2A: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Variante densa FFN 1536: https://huggingface.co/yushengsu/Qwen3-8B-2layer-Dense-v2
- Variante MoE top-1: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E1A-v2
- Variante MoE top-4: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Log de entrenamiento (W&B): https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/ivd4sfzl

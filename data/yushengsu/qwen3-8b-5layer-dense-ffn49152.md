# yushengsu/Qwen3-8B-5layer-Dense-FFN49152

## Resumen

Qwen3-8B-5layer-Dense-FFN49152 es un modelo borrador (draft model) para decodificación especulativa, desarrollado por el usuario yushengsu y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje autónomo, sino un componente auxiliar diseñado para acelerar la inferencia de Qwen/Qwen3-8B mediante la técnica de speculative decoding: un modelo pequeño propone varios tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado.

El modelo es la contraparte densa iso-activa del borrador MoE de 5 capas 8x12288 top-4 del mismo autor. Conserva la misma estructura de 5 capas (GQA con 32 cabezas de atención y 8 cabezas KV de dimensión 128, capas objetivo 1/9/17/25/33, cabeza Markov de rango 256, sin cabeza de confianza), pero sustituye el bloque MoE por una única FFN densa SwiGLU con tamaño intermedio 49152, equivalente a 4 x 12288. De este modo iguala los FLOPs activos de FFN por token del borrador 8E4A con la mitad de sus parámetros de FFN.

El resultado es un borrador de aproximadamente 3,3 mil millones de parámetros totales, que coincide con los parámetros activos del borrador 8E4A (frente a los ~6,4 B totales de este). Está pensado para servirse con SGLang mediante la clase `Qwen3DSparkModel` y forma parte del ecosistema SpecForge para entrenamiento de modelos de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas con FFN SwiGLU densa (draft para decodificacion especulativa, familia DSpark) |
| Parametros totales | ~3,3 B (aproximado, segun model card) |
| Parametros activos | No aplica (modelo denso); FLOPs de FFN activos equivalentes al borrador MoE 8E4A |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-8B |
| Capas | 5 (capas objetivo 1/9/17/25/33) |
| Atencion | GQA, 32 cabezas de atencion, 8 cabezas KV, dimension 128 |
| FFN intermedia | 49.152 (4 x 12.288) |
| Cabeza Markov | Rango 256 |
| Cabeza de confianza | No |
| Libreria | sglang |
| Tamano del repo | 27,1 GB |

## Arquitectura y entrenamiento

El borrador replica la receta del borrador MoE 8E4A sustituyendo el bloque de mezcla de expertos por una FFN densa SwiGLU de tamaño intermedio 49.152, es decir, cuatro veces 12.288, lo que iguala los FLOPs activos de FFN por token del MoE top-4 con la mitad de parámetros de FFN (0,60 B por capa frente a 1,21 B). La atención mantiene GQA con 32 cabezas de consulta y 8 de clave/valor de dimensión 128, y se añade una cabeza Markov de rango 256 para la predicción especulativa. No incorpora cabeza de confianza.

El entrenamiento sigue el mismo pipeline que el borrador 8E4A: datos PerfectBlend regenerados por Qwen3-8B con temperatura 0 y modo non-thinking, plantilla qwen3-instruct, contexto de 8.192 tokens, 5 épocas con scheduler coseno desde 6e-4, warmup del 4 %, grad clip 1.0, pérdida DSpark con CE 0.1 y L1 0.9, 512 anchors, gamma de decaimiento 7 y batch global de 132 (10.764 pasos por época, 53.822 pasos totales), semilla 42. Se usó el código `dspark-v2-moe-launch` en el commit 26bd18b6 junto con sgl-project/SpecForge#963 y `use_liger_kernel: true` (kernels fusionados RMSNorm/SwiGLU de Liger, solo para acelerar el entrenamiento). El entrenamiento se ejecutó en dos devboxes con 4x GB300 en un mismo dominio NVLink: un servidor de captura SGLang y tres rangos de entrenamiento híbrido-FSDP por nodo (6 rangos x batch 2 x acumulación 11 = 132 muestras por paso de optimizador), con Mooncake sobre TCP entre nodos. Los checkpoints por época se publican como `1ep/` a `5ep/` y se sirven con SGLang mediante `Qwen3DSparkModel`.

## Capacidades

- Predicción especulativa de tokens para acelerar la inferencia de Qwen/Qwen3-8B mediante decodificación especulativa.
- Generación de propuestas multi-token verificadas en paralelo por el modelo objetivo.
- Integración con SGLang a través de la clase `Qwen3DSparkModel`.
- Compatibilidad con el ecosistema SpecForge para entrenamiento y despliegue de borradores.
- Soporte de contexto de hasta 8.192 tokens en el entrenamiento.
- No es un modelo de propósito general: no está diseñado para generación de texto autónoma, razonamiento, código, matemáticas, visión, tool calling ni uso como agente.
- Capacidades multilingües: no disponible (heredadas indirectamente del tokenizador de Qwen3-8B, no documentadas).

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: el borrador propone tokens candidatos que el modelo objetivo verifica, reduciendo la latencia por token en despliegues con SGLang.
- Servicio de chat de alto throughput: al disminuir el coste por token generado, permite atender más peticiones concurrentes con el mismo hardware para Qwen3-8B.
- Despliegue en SGLang: se carga directamente con `Qwen3DSparkModel` junto al modelo objetivo, sin cambios en la API de servicio.
- Evaluación comparativa de borradores: sirve para medir la tasa de aceptación y la aceleración frente a los borradores MoE 8E4A y denso FFN24576 del mismo autor.
- Investigación en decodificación especulativa: permite estudiar el compromiso entre parámetros totales, FLOPs activos y tasa de aceptación con arquitecturas densas frente a MoE.
- Generación de código asistida de baja latencia: al acelerar Qwen3-8B, mejora la experiencia en autocompletado y asistentes de código donde la latencia por token es crítica.
- Fine-tuning y reproducción de experimentos: la receta, curvas de entrenamiento y rama de código están publicadas, lo que facilita replicar o adaptar el borrador a otros modelos objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~3,3 B parámetros, en fp16/bf16 requeriría aproximadamente 6,6 GB solo para pesos, más el modelo objetivo Qwen3-8B (~16 GB en bf16).
- GPU recomendadas: el entrenamiento se realizó en GB300; para inferencia se recomienda una GPU con suficiente VRAM para alojar simultáneamente el borrador y Qwen3-8B (A100 40/80 GB, H100, H200 o GB300).
- GPU de consumo: probablemente cabe en GPUs consumer de gama alta (RTX 4090 24 GB) si se cuantiza el modelo objetivo, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: SGLang con `Qwen3DSparkModel` (soporte nativo documentado); otros motores (vLLM, llama.cpp, TGI, Ollama) no están documentados.
- Latencia y throughput: no disponible; la aceleración depende de la tasa de aceptación del borrador sobre Qwen3-8B y no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-Dense-FFN49152 | ~3,3 B | No aplica (denso) | 8.192 | Apache 2.0 | Borrador denso iso-activo al MoE 8E4A |
| Qwen3-8B-5layer-MoE-8E4A-v1 | ~6,4 B | ~3,3 B | 8.192 | Apache 2.0 | Borrador MoE top-4 del mismo autor |
| Qwen3-8B-5layer-Dense-FFN24576 | no disponible | No aplica (denso) | 8.192 | Apache 2.0 | Borrador denso con anchura activa 8E2A |

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: solo tiene sentido como borrador de decodificación especulativa junto a Qwen/Qwen3-8B.
- Sin datos publicados de tasa de aceptación, aceleración ni benchmarks; el rendimiento real en producción es desconocido.
- El contexto de entrenamiento está limitado a 8.192 tokens; no se documenta soporte para contextos mayores.
- Idiomas soportados no documentados; el comportamiento multilingüe depende del tokenizador y los datos de Qwen3-8B.
- Sin cabeza de confianza, lo que puede afectar a estrategias de verificación adaptativa.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes.
- Aunque la licencia es Apache 2.0, conviene verificar las obligaciones derivadas del modelo base Qwen3-8B y de los datos PerfectBlend.
- Riesgo de alucinación y sesgos: no evaluado de forma independiente para este borrador; hereda indirectamente los del modelo objetivo y los datos de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN49152
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Borrador MoE 8E4A: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E4A-v1
- Borrador denso FFN24576: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN24576
- Rama de configuracion y receta (SpecForge, PR #20): https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-5layer-dense49152-dspark
- Curvas de entrenamiento (W&B): https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/c431jcbn

# yushengsu/Qwen3-8B-2layer-MoE-8E4A

## Resumen

Qwen3-8B-2layer-MoE-8E4A es un modelo borrador (*draft model*) de decodificación especulativa para Qwen/Qwen3-8B, publicado por el usuario yushengsu. No es un modelo de lenguaje autónomo: es un componente auxiliar que propone tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, con el objetivo de acelerar la inferencia sin alterar la distribución de salida del modelo grande. Su arquitectura es un transformer de solo 2 capas decoder con capas feed-forward de tipo mixture-of-experts (8 expertos enrutados de dimensión 1536, top-4 activos por token).

El modelo sigue la receta DSpark implementada en SpecForge (PR #1003), con una pérdida de balanceo de carga por lote (coeficiente 0,005) y un sesgo de selección por experto (tasa de actualización 0,001). Se entrenó durante 5 épocas (53.822 pasos de optimizador) sobre 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B. El resultado son cinco exportaciones servibles (una por época, en carpetas `1ep/` a `5ep/`), cada una verificada contra el entrenamiento antes de subirse.

Es relevante porque explora una variante poco común en el espacio de modelos borrador: sustituir el FFN denso por un MoE top-4 manteniendo un tamaño total reducido (~0,48B parámetros, ~0,33B activos). Esto cuadruplica los FLOPs de FFN por token respecto al borrador denso de 1/8, lo que permite comparar empíricamente el compromiso entre coste computacional y longitud de aceptación en decodificación especulativa. La licencia Apache 2.0 facilita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de 2 capas con FFN mixture-of-experts (draft DSpark para decodificación especulativa) |
| Parametros totales | ~0,48B (sin incluir embedding/LM head congelados del objetivo) |
| Parametros activos | ~0,33B por token |
| Longitud de contexto | no disponible (entrenado con max length 8192) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json, model.safetensors, tokenizer de Qwen3-8B) |

## Arquitectura y entrenamiento

El modelo consta de 2 capas decoder con hidden size 4096, 8 cabezas de atención y 2 cabezas KV (head dim 128), block size 16 y atención causal dentro de cada bloque. Se condiciona sobre los estados ocultos de Qwen3-8B en las capas 1, 9, 17, 25 y 33 mediante un proyector DSpark, y usa una cabeza Markov vanilla de rango 256 sin cabeza de confianza. Cada FFN contiene 8 expertos SwiGLU enrutados de dimensión 1536, top-4 activos, sin experto compartido, con router softmax sin renormalización top-k (cada experto elegido se pondera por su propia probabilidad softmax). El sesgo de selección se almacena en fp32 por experto (`layers.N.mlp.gate.selection_bias`), se suma a las puntuaciones del router solo para la selección top-4 y se desplaza 0,001 por paso hacia los expertos infrautilizados (actualización de media cero).

El entrenamiento usó SpecForge (rama `exp/qwen3-8b-dspark-moe-8expert-4activate-selection-bias`, PR #13) con 1.420.903 prompts de Open Perfect Blend y respuestas regeneradas por Qwen3-8B (temperatura 0, thinking desactivado), plantilla qwen3-instruct y longitud máxima 8192. Se ejecutaron 5 épocas en una sola tirada: 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 × acumulación 11 × 6 rangos DDP), AdamW con lr 6e-4, schedule coseno, 4 % de warmup, grad clip 1.0 y semilla 42. La función de pérdida es 0,1 CE + 0,9 L1 con 512 anclas y `loss_decay_gamma` 7, más la pérdida de balanceo por lote (0,005) y el sesgo de selección (0,001 por paso). El cómputo se realizó en un nodo de 8× H200 con 2 servidores de captura SGLang (GPUs 0-1) y 6 rangos de entrenamiento (GPUs 2-7). Cada exportación se validó comparando la salida del FFN MoE en entrenamiento (`MoELayer` de SpecForge) frente a la de servicio (`DFlashMoE` de SGLang, con el PR sgl-project/sglang#47181), exigiendo coincidencia del 100 % en los conjuntos de expertos elegidos y una diferencia relativa L2 inferior al 0,5 %.

## Capacidades

- No genera texto de forma autónoma: es un modelo borrador para decodificación especulativa que propone tokens candidatos verificados por Qwen3-8B.
- Aceptación de caminata (*walk accept length*) creciente por época: 4,39, 4,78, 5,00, 5,12 y 5,24 tokens en las épocas 1 a 5.
- Enrutamiento MoE top-4 por token con balanceo de carga por lote y sesgo de selección por experto.
- Compatible con el stack SGLang (librería declarada `sglang`) mediante el bloque `Qwen3MoeDSparkModel`.
- Integración con SpecForge para entrenamiento y exportación.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo thinking propios; hereda el comportamiento del modelo objetivo Qwen3-8B al que acompaña.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: desplegar este borrador junto al objetivo en SGLang para reducir la latencia de generación aprovechando la verificación especulativa, con una aceptación media de ~5,24 tokens por paso en la época 5.
- Servicio de chat de alto throughput: al proponer varios tokens por iteración, se reduce el número de pasos de decodificación del modelo grande, lo que aumenta el throughput agregado en despliegues con muchas peticiones concurrentes.
- Investigación sobre decodificación especulativa: sirve como punto de comparación frente a los borradores densos y a las variantes top-1 y top-2 del mismo autor para estudiar el equilibrio entre FLOPs de FFN y longitud de aceptación.
- Evaluación de estrategias de balanceo MoE: el sesgo de selección y la pérdida de balanceo por lote son configurables y verificables, lo que permite reproducir experimentos sobre enrutamiento en modelos pequeños.
- Generación de código asistida sobre Qwen3-8B: al mantener la distribución del objetivo, se puede usar en pipelines de autocompletado o revisión de código donde la latencia importa, sin cambiar la calidad del modelo base.
- Despliegue en entornos con GPUs de gama alta: con ~0,48B parámetros totales, el borrador ocupa poco espacio adicional junto a Qwen3-8B y puede servirse en el mismo nodo que el objetivo.
- Reproducción de experimentos: las cinco exportaciones por época permiten analizar la curva de aceptación y la convergencia de la pérdida sin reentrenar.

## Benchmarks y rendimiento

Métricas de entrenamiento por época (media de los últimos 1.000 pasos de optimizador de cada época):

| Epoca | Paso final | Accuracy | Cross-entropy | Walk accept length | Checkpoint |
|---|---|---|---|---|---|
| 1 | 10.764 | 0,647 | 1,539 | 4,39 | `1ep/` |
| 2 | 21.528 | 0,683 | 1,344 | 4,78 | `2ep/` |
| 3 | 32.292 | 0,700 | 1,258 | 5,00 | `3ep/` |
| 4 | 43.056 | 0,710 | 1,221 | 5,12 | `4ep/` |
| 5 | 53.820 | 0,719 | 1,182 | 5,24 | `5ep/` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son de entrenamiento del borrador, no de calidad del modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,9 GB en safetensors; el borrador en sí tiene ~0,48B parámetros (aproximadamente 1 GB en fp16), pero debe servirse junto a Qwen3-8B, que requiere su propia memoria.
- GPU recomendadas: el entrenamiento se realizó en 8× H200; para servicio se recomienda al menos una GPU con suficiente VRAM para alojar el objetivo Qwen3-8B más el borrador.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo; el stack declarado es SGLang, orientado a GPUs de datacenter.
- Opciones de despliegue: SGLang (librería declarada, bloque `Qwen3MoeDSparkModel` con el PR sgl-project/sglang#47181); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma absoluta; la longitud de aceptación de 5,24 tokens por paso en la época 5 es el único indicador publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Aceptacion | Licencia | Estado |
|---|---|---|---|---|---|---|
| Qwen3-8B-2layer-MoE-8E4A (este) | ~0,48B | ~0,33B | no disponible | 5,24 (ep. 5) | Apache 2.0 | Publicado |
| qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch (top-1) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Publicado |
| qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch (top-2) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | Publicado |

Los dos modelos comparables son variantes del mismo autor con la misma receta pero top-1 y top-2 expertos activos; la información disponible no incluye sus métricas de aceptación ni sus recuentos de parámetros. No se dispone de comparación con borradores densos de otros autores.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: sin Qwen3-8B como verificador no produce salidas útiles.
- El servicio debe aplicar el sesgo de selección en la selección top-k; omitirlo rompe la equivalencia con el entrenamiento.
- La verificación servido-vs-entrenado exige coincidencia del 100 % en expertos elegidos y diferencia L2 relativa < 0,5 %; desviaciones mayores indican un despliegue incorrecto.
- El modelo se entrenó con respuestas generadas por Qwen3-8B con thinking desactivado; puede no comportarse igual con prompts en modo thinking.
- Sesgos conocidos: no documentados; al heredar el comportamiento del objetivo, puede reproducir los sesgos de Qwen3-8B.
- Riesgo de alucinación: no aplica directamente al borrador, pero la calidad final depende de la verificación del objetivo.
- Idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- Solo hay soporte documentado para SGLang; otros motores de inferencia no están validados.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-2layer-MoE-8E4A
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- SpecForge PR #1003: https://github.com/sgl-project/SpecForge/pull/1003
- Rama de entrenamiento: https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-dspark-moe-8expert-4activate-selection-bias
- PR de entrenamiento #13: https://github.com/yushengsu-thu/SpecForge/pull/13
- SGLang PR #47181: https://github.com/sgl-project/sglang/pull/47181
- Log de entrenamiento W&B: https://forge.coreweave.com/wandb/eigent_radixark_training/qwen3-8b-dspark/runs/pg20at1t
- Variante top-1: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch
- Variante top-2: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch

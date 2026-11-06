# yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch

## Resumen

Qwen3-8B DSpark MoE draft es un modelo borrador (draft model) para decodificacion especulativa sobre Qwen/Qwen3-8B, desarrollado por el usuario yushengsu. No es un modelo de lenguaje autonomo: es un componente auxiliar de 2 capas que propone tokens candidatos que el modelo objetivo Qwen3-8B verifica, acelerando la generacion sin alterar la distribucion de salida. Su interes tecnico radica en que sus capas feed-forward son mixture-of-experts (8 expertos enrutados de 1536, top-2), una eleccion poco habitual en modelos borrador, que suelen ser densos y pequenos.

El modelo sigue la receta del PR #1003 de SpecForge, combinando una perdida de balanceo de carga a nivel de batch (coeficiente 0.005) con un sesgo de seleccion por experto (tasa de actualizacion 0.001) para evitar el colapso de enrutamiento. Se entreno durante 5 epocas sobre 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B, en una unica ejecucion de 53.822 pasos de optimizador. En el momento de la ultima actualizacion de la model card el entrenamiento estaba en el paso 43.100 de 53.822, con checkpoints servibles por epoca en subcarpetas `1ep/` a `4ep/`.

Su relevancia es doble: por un lado, demuestra un pipeline de entrenamiento y validacion servidor-vs-entrenamiento para drafts MoE; por otro, ofrece una alternativa de aceleracion de inferencia para Qwen3-8B con un borrador de unos 0.48B parametros totales y 0.26B activos por token. La licencia no esta declarada, lo que limita su uso en produccion hasta que el autor la especifique.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft (transformer de 2 capas con FFN MoE), decodificacion especulativa |
| Parametros totales | ~0,48B (sin incluir embedding/LM head del objetivo, congelados) |
| Parametros activos | ~0,26B por token (8 expertos enrutados, top-2) |
| Longitud de contexto | no disponible (entrenado con max length 8192) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (config.json + model.safetensors + tokenizer de Qwen3-8B) |

## Arquitectura y entrenamiento

El modelo es un draft DSpark de 2 capas decoder con hidden 4096, 8 cabezas de atencion y 2 cabezas KV (head dim 128), block size 16 y atencion causal dentro del bloque. Se condiciona sobre los estados ocultos de Qwen3-8B en las capas 1, 9, 17, 25 y 33 mediante un proyector DSpark, e incorpora una cabeza Markov vanilla de rango 256 sin cabeza de confianza. Cada FFN de capa es un MoE con 8 expertos SwiGLU de 1536, top-2, sin experto compartido, y router softmax sin renormalizacion top-k (cada experto elegido se pondera por su propia probabilidad softmax). El sesgo de seleccion es un tensor fp32 por experto (`layers.N.mlp.gate.selection_bias`) que se suma a las puntuaciones del router solo para la seleccion top-2 y se desplaza 0.001 por paso hacia expertos infrautilizados con actualizacion de media cero.

El entrenamiento uso 1.420.903 prompts de Open Perfect Blend con respuestas regeneradas por Qwen3-8B (temperatura 0, thinking off), plantilla qwen3-instruct y longitud maxima 8192. Cinco epocas equivalen a 53.822 pasos de optimizador con 132 secuencias por paso (batch 2 x acumulacion 11 x 6 rangos DDP), AdamW con lr 6e-4, schedule coseno, 4% de warmup, grad clip 1.0 y semilla 42. La perdida combina 0.1 CE + 0.9 L1 con 512 anchors y loss_decay_gamma 7, mas la perdida de balanceo de carga a nivel de batch (0.005) y el sesgo de seleccion (0.001 por paso). Se ejecuto en un nodo de 8x H200: 2 servidores de captura SGLang en GPUs 0-1 y 6 rangos de entrenamiento en GPUs 2-7. Cada export se valido comparando la FFN MoE de cada capa entre el `MoELayer` de entrenamiento de SpecForge y el `DFlashMoE` de SGLang: los conjuntos de expertos elegidos coinciden en el 100% de los tokens y las salidas difieren menos del 0,5% en L2 relativa.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para Qwen3-8B, que los verifica; no genera texto de forma autonoma.
- Aceleracion de inferencia: el objetivo es reducir la latencia de generacion de Qwen3-8B manteniendo la distribucion de salida del modelo objetivo.
- Enrutamiento MoE top-2 con sesgo de seleccion que debe aplicarse en la seleccion top-k durante el serving.
- Condicionamiento multi-capa sobre los estados ocultos del modelo objetivo (capas 1, 9, 17, 25, 33).
- Integracion con SGLang: la libreria declarada es `sglang` y el bloque `Qwen3MoeDSparkModel` sirve el modelo (requiere el PR sgl-project/sglang#47181).
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo: hereda el comportamiento del modelo objetivo Qwen3-8B.
- Capacidades multilingues: no disponibles como dato propio; dependen de Qwen3-8B.

## Casos de uso

- Aceleracion de un endpoint de Qwen3-8B en produccion: desplegar el draft junto al objetivo en SGLang para reducir la latencia por token en generacion autoregresiva, manteniendo la calidad del modelo grande.
- Serving de alto throughput en GPUs H200: con dos servidores de captura y el draft MoE, el pipeline de decodificacion especulativa puede aumentar tokens por segundo en cargas batch.
- Investigacion sobre drafts MoE: el modelo sirve como referencia reproducible para estudiar el efecto del numero de expertos activos (top-1 vs top-2) y del sesgo de seleccion en la tasa de aceptacion.
- Evaluacion de tecnicas de balanceo de carga: el par de perdida batch-wise (0.005) y sesgo de seleccion (0.001) es un caso concreto para medir colapso de expertos en modelos borrador.
- Validacion de pipelines de exportacion: los checkpoints por epoca permiten comparar el comportamiento servido frente al entrenado en SGLang, util para equipos que construyen infraestructura de speculative decoding.
- Benchmarking de aceptacion por longitud de bloque: con block size 16 y metricas de walk accept length (4,32 a 5,06 entre epocas), se puede estudiar el compromiso entre velocidad y tasa de aceptacion.
- Prototipado de asistentes conversacionales sobre Qwen3-8B: usar el draft para abaratar el coste de inferencia en chats multi-turno con contexto de hasta 8192 tokens.

## Benchmarks y rendimiento

Metricas de entrenamiento por epoca (media de los ultimos 1.000 pasos de optimizador de cada epoca), segun la model card:

| Epoca | Paso final | Accuracy | Cross-entropy | Walk accept length |
|---|---|---|---|---|
| 1 | 10.764 | 0,642 | 1,568 | 4,32 |
| 2 | 21.528 | 0,679 | 1,366 | 4,72 |
| 3 | 32.292 | 0,696 | 1,286 | 4,93 |
| 4 | 43.056 | 0,707 | 1,240 | 5,06 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El entrenamiento estaba en el paso 43.100 de 53.822 en la ultima actualizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~0,48B parametros totales, en fp16 el peso ronda 1 GB, pero debe sumarse la VRAM del modelo objetivo Qwen3-8B (~16 GB en fp16) y las cachés KV.
- GPU recomendadas: el entrenamiento uso 8x H200; para serving se recomienda H100/H200 o A100 de 80 GB para alojar objetivo y draft con margen.
- GPU de consumo: el draft por si solo cabria en GPUs consumer, pero el objetivo Qwen3-8B en fp16 (~16 GB) requiere al menos una RTX 4090 de 24 GB o cuantizacion del objetivo.
- Opciones de despliegue: SGLang con el bloque `Qwen3MoeDSparkModel` (requiere sgl-project/sglang#47181); no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la walk accept length de 5,06 en la epoca 4 es el unico indicador publicado de tasa de aceptacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B DSpark MoE draft (este) | ~0,48B totales / 0,26B activos | no disponible (entrenado a 8192) | Draft MoE top-2 para Qwen3-8B | no disponible | HuggingFace, 0 descargas |
| qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch (top-1) | no disponible | no disponible | Draft MoE top-1, misma receta | no disponible | HuggingFace (mismo autor) |
| Qwen3-8B (modelo objetivo) | 8B | 32.768 tokens (segun Qwen3) | LLM denso | Apache 2.0 (segun Qwen3) | HuggingFace, ampliamente usado |
| Drafts densos convencionales para Qwen3-8B | no disponible | no disponible | Decodificacion especulativa densa | no disponible | no disponible |

La comparativa con drafts densos genericos no esta disponible en la informacion proporcionada; solo se conoce la variante top-1 del mismo autor.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: sin el objetivo Qwen3-8B no produce texto util.
- Entrenamiento incompleto: la model card indica estado "training" en el paso 43.100 de 53.822; los checkpoints de la quinta epoca pueden no estar disponibles.
- Licencia no declarada: no se puede asumir uso comercial hasta que el autor la especifique.
- Requiere una version concreta de SGLang (PR #47181) para servir correctamente; el sesgo de seleccion debe aplicarse en la seleccion top-k o el comportamiento divergira del entrenado.
- Dependencia estricta del tokenizer y de los estados ocultos de Qwen3-8B; no es portable a otros modelos objetivo.
- Idiomas soportados no documentados; la cobertura linguistica depende de Qwen3-8B y de los datos de entrenamiento (Open Perfect Blend regenerado por Qwen3-8B).
- Riesgo de alucinacion: el draft no introduce contenido propio, pero la verificacion del objetivo no elimina los sesgos de Qwen3-8B.
- Sin datos publicos de benchmarks estandar ni de latencia en produccion; la unica metrica de calidad es la walk accept length de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-8expert-2activate-batch-wise-0.005-selection-bias-only-5epoch
- Variante top-1: https://huggingface.co/yushengsu/qwen3-8b-dspark-moe-batch-wise-0.005-selection-bias-only-5epoch
- Modelo objetivo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- SpecForge PR #1003: https://github.com/sgl-project/SpecForge/pull/1003
- Rama de entrenamiento SpecForge: https://github.com/yushengsu-thu/SpecForge/tree/exp/qwen3-8b-dspark-moe-8expert-2activate-selection-bias
- PR #12 del fork de SpecForge: https://github.com/yushengsu-thu/SpecForge/pull/12
- SGLang PR #47181: https://github.com/sgl-project/sglang/pull/47181

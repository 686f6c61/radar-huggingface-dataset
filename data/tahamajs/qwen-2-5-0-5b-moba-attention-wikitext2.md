# tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirúrgicamente parte de las capas de atención del decoder por el módulo `moba_attention` (Mixture of Block Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo de propósito general competitivo, sino validar una técnica de trasplante de mecanismos de atención subcuadrática sobre un transformer preentrenado y medir la recuperación de calidad mediante destilación de conocimiento en dos etapas.

El modelo parte de la arquitectura Qwen2 (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas) y aplica un patrón híbrido 3:1: 18 de las 24 capas usan MoBA y 6 capas conservan atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23]. Tras el trasplante, la perplejidad en WikiText-2 se dispara a 151,45 y se recupera hasta 32,15 mediante 240 pasos de destilación en dos fases, ejecutados en 180,6 segundos con un pico de 16 GB de VRAM.

Es relevante ahora como pieza de investigación reproducible: demuestra que se puede injertar atención de bloques dispersa en un modelo denso existente con un coste de entrenamiento mínimo (menos de 3 minutos en una sola GPU) y conservar una perplejidad razonable en el dominio de ajuste. No obstante, sus 0,5 mil millones de parámetros, su entrenamiento exclusivamente sobre WikiText-2 y su soporte únicamente en inglés lo sitúan como artefacto de laboratorio, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida MoBA 3:1 sobre 24 capas |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,45 MB; `attention_weights.safetensors` 86,24 MB) |

## Arquitectura y entrenamiento

El modelo conserva el esqueleto de Qwen2.5-0.5B: un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con factor 7). La modificación consiste en reemplazar la atención estándar de 18 capas por `MoBAAttention`, un mecanismo de atención de bloques que, para cada bloque de consultas, calcula puntuaciones de centroide a nivel de bloque, selecciona los `top-k` bloques de claves más relevantes y ejecuta atención densa solo dentro de esos bloques más el bloque diagonal visible por causalidad. Las 6 capas restantes mantienen atención cuadrática completa como anclas. El adaptador `QwenAttentionAdapter` gestiona la proyección de las 14 cabezas de consulta y 2 KV del modelo original, con expansión automática de cabezas KV 7x donde es necesario y un contrato de `o_proj` único.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), no un preentrenamiento. La etapa 1 (alineación con backbone congelado) ejecuta 73 pasos en 54,3 s con `lm_head` desactivado y pérdida MSE/coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa) ejecuta 167 pasos en 125,9 s con peso de coseno 0,50. En total, 240 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de 16.049 MB de VRAM en FP16 con parámetros maestros en FP32. La perplejidad causal pasa de 151,45 (post-cirugía, cero-shot) a 32,15 tras la destilación, una delta de -119,30.

## Capacidades

- Generación de texto autoregresiva causal en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención bidireccional y cross-attention soportadas por el módulo `MoBAAttention` a nivel de implementación, aunque el checkpoint se distribuye para generación causal.
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV) en el adaptador.
- Atención subcuadrática por bloques con selección `top-k` de bloques relevantes, orientada a modelado de contexto largo.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como referencia reproducible para estudiar cómo afecta el reemplazo de atención densa por MoBA a la perplejidad de un modelo preentrenado, con métricas de antes y después del trasplante.
- Validación de pipelines de cirugía de atención: el script `apply_qwen_attention_surgery` y el patrón `hybrid_3_1` permiten reproducir el experimento sobre Qwen2.5-0.5B y comparar configuraciones de capas ancla.
- Benchmarking de destilación de conocimiento: las dos etapas (alineación con backbone congelado y destilación multicapa) y sus telemetrías (73 y 167 pasos, tiempos y VRAM) sirven para comparar estrategias de recuperación tras modificar la arquitectura.
- Prototipado de modelado de lenguaje en inglés sobre dominios tipo Wikipedia: con una perplejidad de 32,15 en WikiText-2, es adecuado para experimentos de generación de texto académico o enciclopédico a pequeña escala.
- Educación y docencia: modelo pequeño (0,5 B) que cabe en GPUs de consumo y permite demostrar en clase conceptos de atención dispersa, GQA y destilación sin infraestructura costosa.
- Pruebas de integración del ecosistema NeuralOps: el `load_surgeried_model` del Hub API permite verificar la carga de pesos quirúrgicos y la compatibilidad con el registro de atención en entornos de CI.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 32,15 |
| WikiText-2, baseline post-cirugia (Stage 0) | Perplejidad | 151,45 |
| WikiText-2, delta tras destilacion | Perplejidad | -119,30 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en FP16 ocupa aproximadamente 1 GB (`model.safetensors` 944,45 MB + `attention_weights.safetensors` 86,24 MB), por lo que la inferencia en FP16 requiere del orden de 2-3 GB contando activaciones y caché KV para contextos cortos.
- VRAM de entrenamiento registrada: 16.049 MB de pico durante la destilación en FP16 con parámetros maestros en FP32, con `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento se necesitan al menos 16 GB (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más para inferencia.
- Opciones de despliegue: la model card documenta carga mediante `transformers` (`AutoModelForCausalLM`) y mediante la API `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; solo se conoce el tiempo de entrenamiento (180,6 s para 240 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2` | 0,5 B | no disponible | 32,15 (declarada) | MIT | Hugging Face (336 descargas) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | no disponible en la informacion | no disponible | Apache 2.0 (segun el modelo base) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT (segun el repo) | Hugging Face |

No se dispone de datos de benchmarks comparables de alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: entrenado exclusivamente sobre WikiText-2 en inglés; no debe usarse como modelo de propósito general ni en producción sin validación adicional.
- Perplejidad de 32,15 declarada por el autor y marcada como no verificada (`verified: false`) en el `model-index`.
- Riesgo elevado de alucinación y degradación fuera del dominio de Wikipedia, dado el ajuste limitado (240 pasos) y el tamaño reducido del modelo base.
- Soporte únicamente en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no documentada; el entrenamiento se realizó con `seq_len=512`, por lo que el comportamiento más allá de esa longitud no está validado.
- Dependencia del ecosistema NeuralOps: la carga requiere `neuralops.hub` o el script `apply_qwen_attention_surgery`, lo que limita la portabilidad a otras herramientas estándar.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según la información del modelo base); conviene revisar ambas.
- No se documentan sesgos específicos, pero al derivar de Qwen2.5-0.5B y ajustarse solo sobre WikiText-2, hereda los sesgos del modelo base y los del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-moba-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

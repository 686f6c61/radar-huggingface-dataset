# tahamajs/qwen-2.5-0.5b-xattention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-xattention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el modulo `xattention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No es un modelo afinado al uso: es un artefacto de investigacion sobre atencion subcuadratica (block-sparse con enrutamiento coarse-to-fine) aplicada a un transformer denso ya entrenado, seguido de un proceso de destilacion de conocimiento en dos etapas para recuperar capacidad predictiva.

El modelo conserva la arquitectura base Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas) pero reemplaza 18 de las 24 capas por `xattention`, manteniendo 6 capas de atencion cuadratica completa como anclas en los indices `[3, 7, 11, 15, 19, 23]` (patron `hybrid_3_1`). El entrenamiento se limita a WikiText-2 (`wikitext-2-raw-v1`), con 475 pasos de destilacion en dos fases y 180,3 segundos totales de optimizacion en una unica GPU.

Su relevancia es fundamentalmente metodologica: sirve como prueba de concepto reproducible de como injertar mecanismos de atencion alternativos en modelos preentrenados y medir el coste de recuperacion via KD. Los resultados son, sin embargo, muy pobres: la perplejidad final en validacion es de 25732,97, frente a 149,25 del checkpoint inmediatamente posterior a la cirugia, lo que indica que la destilacion no solo no recupero el rendimiento, sino que lo degradó severamente. No es un modelo apto para produccion ni para uso conversacional real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `xattention` block-sparse + 6/24 capas de atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo publica pesos de atencion de 86,28 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; la base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se documenta FP16 para inferencia y FP32 para parametros maestro del estudiante durante KD) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only denso con GQA (14 cabezas de consulta, 2 cabezas KV), RoPE y `hidden_size=896`. Sobre esa base se aplica una "cirugia" que sustituye 18 de las 24 capas de atencion por el modulo `XAttention`, que implementa atencion block-sparse con enrutamiento coarse-to-fine: proyecta Q, K, V (con LoRA), aplica RoPE con slicing de `past_len`, concatena la KV-cache y, si el numero de claves es pequeno o `keep_ratio == 1`, ejecuta atencion densa; en caso contrario, realiza un enrutamiento grueso a nivel de bloque, selecciona los `top-k` bloques (con `topk=64`) y aplica atencion fina dentro de los bloques seleccionados, con aceleracion opcional mediante kernel Triton. El modulo soporta causal, bidireccional, cross-attention, GQA nativo y RoPE. La adaptacion se realiza via `QwenAttentionAdapter`, que impone un contrato de `o_proj` unico y expansion automatica de cabezas KV (7x) donde sea necesario.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2. La etapa 1 (alineamiento con backbone congelado) ejecuta 138 pasos (54,1 s) con `lm_head` desactivado, usando MSE y coseno (peso 0,25) sobre estados ocultos por capa. La etapa 2 (KD de representacion multicapa) ejecuta 337 pasos (125,9 s) con MSE y coseno (peso 0,50). En total, 475 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 12 476 MB de VRAM en FP16 con autocast y parametros maestro en FP32. No se documenta uso de RLHF, DPO ni datos adicionales fuera de WikiText-2.

## Capacidades

- Generacion de texto causal autoregresiva (el modulo `xattention` declara `supports_causal=Yes`).
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (aunque el checkpoint se distribuye como modelo causal).
- Soporte nativo de GQA y RoPE en las capas sustituidas.
- Compatibilidad con KV-cache y decodificacion incremental (slicing de `past_len` en RoPE).
- Capacidad de tool calling / function calling: no disponible (no se documenta ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a ingles (`language: en`); el tokenizer de Qwen2.5 es multilingue, pero el modelo solo se entrena en WikiText-2 en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como banco de pruebas reproducible para medir el impacto de sustituir atencion densa por block-sparse en un modelo preentrenado, comparando perplejidad antes y despues de la cirugia y tras KD.
- Reproduccion de experimentos de destilacion: los `training_metrics.json` y la telemetria de las dos etapas permiten replicar el pipeline de KD con backbone congelado y KD de representacion multicapa sobre WikiText-2.
- Evaluacion de kernels Triton: el modulo `XAttention` incluye aceleracion opcional por Triton, por lo que el checkpoint puede usarse para medir latencia y throughput de kernels de atencion block-sparse frente a atencion densa en GPUs concretas.
- Estudio de contratos de adaptadores: `QwenAttentionAdapter` documenta la expansion 7x de cabezas KV y el contrato de `o_proj` unico, util para quien quiera portar otros mecanismos de atencion a Qwen2.
- Docencia y divulgacion: ejemplo minimo (0,5B parametros, 86 MB de pesos de atencion) para explicar cirugia de modulos, KD por capas y evaluacion con perplejidad.
- Baseline negativo en experimentos de KD: dado que la PPL empeora de 149,25 a 25732,97, el checkpoint es util como referencia de lo que ocurre cuando la destilacion no converge o cuando el objetivo de KD no esta bien alineado.
- Prototipado de pipelines de inferencia con `transformers` + `safetensors`: el snippet de la model card muestra como cargar pesos parciales con `strict=False` sobre la base Qwen2.5-0.5B.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, `wikitext-2-raw-v1`, validation | Perplexity | 25732,97 |

Telemetria interna del entrenamiento (declarada por el autor):

| Metrica / etapa | Valor | Notas |
|---|---:|---|
| PPL causal pre-KD (etapa 0) | 149,25 | Baseline zero-shot tras la cirugia, sobre `wikitext-2-raw-v1` |
| PPL causal post-KD | 25732,97 | Perplejidad final en validacion |
| Delta de perplejidad | +25583,72 | Un delta negativo indicaria recuperacion; aqui es positivo |
| Etapa 1 (alineamiento con backbone congelado) | 138 pasos (54,1 s) | `lm_head` desactivado; MSE + coseno (0,25) por capa |
| Etapa 2 (KD de representacion multicapa) | 337 pasos (125,9 s) | MSE + coseno (0,50) por capa |
| Pasos totales / tiempo | 475 pasos / 180,3 s | `seq_len=512`, `grad_accum=4`, `topk=64` |
| VRAM pico | 12 476 MB | FP16 autocast con parametros maestro FP32 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,5B parametros; en FP16 requiere aproximadamente 1 GB de pesos mas overhead de activaciones y KV-cache. El autor reporta 12 476 MB de pico durante el entrenamiento (KD en FP16 con maestro FP32), no durante inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar el modelo en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento/KD se uso una unica GPU con ~12,5 GB, compatible con RTX 3090, RTX 4090, A5000, A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 4 GB o mas en FP16; en cuantizacion de 8 bits o 4 bits cabria en GPUs con 2-3 GB, aunque no se documentan artefactos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: `transformers` + `safetensors` (unica ruta documentada, requiere el modulo `NeuralOps` y la funcion `apply_qwen_attention_surgery`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que el modulo `xattention` no es un kernel estandar de esas librerias.
- Latencia y throughput: no disponibles. La model card menciona aceleracion opcional por kernel Triton en el modulo `XAttention`, pero no publica cifras de latencia ni tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-xattention-wikitext2` | 0,5B | no disponible (entrenado a 512) | 25732,97 (declarado, no verificado) | MIT | Hugging Face, requiere NeuralOps |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32 768 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers nativo |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32 768 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers nativo |

La comparativa con otros modelos de atencion subcuadratica (por ejemplo, variantes con atencion lineal o SSM del mismo registro NeuralOps) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado severo: la perplejidad final (25732,97) es mas de dos ordenes de magnitud peor que el baseline pre-KD (149,25) y muy superior a la de Qwen2.5-0.5B original. El modelo no es util para generacion de texto de calidad.
- Entrenamiento limitado a WikiText-2: solo se entrena en `wikitext-2-raw-v1` en ingles, con 475 pasos y `seq_len=512`; no hay evidencia de generalizacion fuera de ese dominio.
- Solo ingles: el campo `language` declara unicamente `en`; no se evalua ni se garantiza comportamiento en otros idiomas.
- Dependencia de codigo externo: la carga requiere el paquete `NeuralOps` y la funcion `apply_qwen_attention_surgery`; no es un checkpoint cargable directamente con `AutoModelForCausalLM.from_pretrained` sobre el repo.
- Pesos parciales: el repo solo contiene `attention_weights.safetensors` (86,28 MB), no el modelo completo; es necesario descargar la base Qwen2.5-0.5B por separado y cargar con `strict=False`.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso documentado.
- Riesgo de alucinacion: alto, coherente con la perplejidad reportada; no se han realizado evaluaciones de sesgo ni de seguridad.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0, por lo que conviene verificar la compatibilidad de ambas licencias en un despliegue comercial.
- Resultados no verificados: el `model-index` marca la metrica como `verified: false`; no hay evaluacion independiente.
- Fecha de creacion futura (2026-11-11) en los metadatos de Hugging Face, lo que sugiere que el repo puede ser un artefacto de prueba o tener metadatos inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-xattention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

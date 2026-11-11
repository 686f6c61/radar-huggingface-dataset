# tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el modulo `naive_svd` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es producir un modelo de proposito general, sino servir de referencia reproducible para estudiar el impacto de atencion subcuadratica aproximada mediante SVD truncada sobre un transformer denso pequeno, tras un proceso de destilacion de conocimiento en dos etapas.

El modelo parte de los 0,5 mil millones de parametros de Qwen2.5-0.5B (arquitectura transformer decoder-only con GQA, 24 capas, 14 cabezas de consulta y 2 cabezas KV, `head_dim=64`, `hidden_size=896`). La intervencion reemplaza 18 de las 24 capas de atencion por `naive_svd`, manteniendo 6 capas cuadraticas completas como anclas en los indices `[3, 7, 11, 15, 19, 23]` (patron `hybrid_3_1`). El resultado se entrena sobre WikiText-2 y se publica como pesos de atencion aislados (`attention_weights.safetensors`, 57,16 MB), no como un modelo completo listo para `transformers`.

Su relevancia es acotada pero clara para investigacion: demuestra un flujo completo de cirugia de atencion, destilacion en dos etapas (alineamiento con backbone congelado y KD multi-capa) y evaluacion de perplejidad, con telemetria detallada del proceso. No obstante, la perplejidad final en WikiText-2 (279,98) es muy alta en terminos absolutos, lo que lo situa como un artefacto de investigacion y no como un modelo apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `naive_svd` (SVD truncada) + 6/24 capas cuadraticas completas |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; los pesos publicados son solo de atencion, 57,16 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; no se declara contexto maximo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (solo pesos de atencion: `attention_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B modificado mediante `apply_qwen_attention_surgery` con patron `hybrid_3_1`: se sustituyen 18 de las 24 capas de atencion por `NaiveSVDAttention`, un modulo de atencion aproximada por SVD truncada con inicializacion plana no calibrada y sin adaptadores de recuperacion. Las 6 capas restantes conservan atencion cuadratica completa como anclas. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansion automatica de cabezas KV (7x) donde es necesario y respeta el contrato de `o_proj` unico. El modulo declara soporte causal, bidireccional, cross-attention y GQA nativo; el soporte de RoPE figura como `N/A`.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenamiento) arroja una perplejidad causal de 205.383,89. La etapa 1 (alineamiento con backbone congelado, `lm_head` puenteado, MSE y coseno sobre estados ocultos con peso 0,25) ejecuta 135 pasos en 54,1 s. La etapa 2 (KD multi-capa, MSE y coseno con peso 0,50) ejecuta 311 pasos en 126,0 s. En total, 446 pasos y 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 15.111 MB en FP16 con parametros maestros FP32.

## Capacidades

- Generacion de texto autoregresiva causal, heredada de la arquitectura Qwen2 subyacente.
- Atencion aproximada por SVD truncada en 18 de las 24 capas, con anclas cuadraticas para preservar estabilidad.
- Soporte declarado por el modulo para atencion bidireccional y cross-attention (a nivel de modulo, no necesariamente validado en este checkpoint).
- Soporte nativo de GQA con expansion 7x de cabezas KV en el adaptador.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- Tool calling, function calling, agentes, vision y audio: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir el coste en perplejidad de sustituir atencion cuadratica por SVD truncada en un transformer denso pequeno.
- Reproduccion de pipelines de cirugia de atencion: el codigo de `apply_qwen_attention_surgery` y el registro `ATTENTION_REGISTRY` permiten replicar el experimento sobre otros modelos Qwen y comparar patrones (`hybrid_3_1` frente a alternativas).
- Estudio de destilacion de conocimiento en dos etapas: la telemetria (PPL pre-KD 205.383,89, post-KD 279,98, 446 pasos, 180,3 s) permite analizar la eficacia de KD con backbone congelado frente a KD multi-capa.
- Benchmark interno de modulos de atencion: util como baseline `naive_svd` frente a otros modulos del Attention Zoo (por ejemplo, variantes calibradas con adaptadores de recuperacion).
- Docencia y divulgacion tecnica: ejemplo tangible de como una intervencion quirurgica degrada y recupera parcialmente un modelo pequeno, con metricas antes y despues.
- Pruebas de integracion de `neuralops` y `transformers`: validacion del flujo de carga de pesos de atencion aislados con `strict=False` sobre el modelo base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 279,98 |
| WikiText-2 (post-cirugia, sin KD) | Perplejidad | 205.383,89 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; el checkpoint publica solo 57,16 MB de pesos de atencion que se cargan sobre el modelo base.
- VRAM de entrenamiento observada: pico de 15.111 MB con FP16 autocast y parametros maestros FP32, `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: cualquier GPU con al menos 16 GB para reproducir el entrenamiento (el autor reporta 15,1 GB de pico); para inferencia basta una GPU consumer con 2-4 GB.
- Cabe en GPU consumer: si, para inferencia; para entrenamiento se requiere al menos una GPU de 16 GB (RTX 4080/4090, A100, H100).
- Opciones de despliegue: el flujo documentado usa `transformers` + `safetensors` + `neuralops`; no se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2` | 0,5 B | no disponible | 279,98 (declarado, no verificado) | MIT | Pesos de atencion aislados |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32.768 tokens (segun Qwen2.5) | no disponible en esta ficha | Apache 2.0 | Modelo completo |
| Otros modulos del NeuralOps Attention Zoo | 0,5 B | no disponible | no disponible | MIT (repo) | Pesos de atencion aislados |

La comparacion directa con el modelo base en perplejidad no esta disponible en la informacion proporcionada; el autor solo reporta la PPL post-cirugia (205.383,89) y post-KD (279,98).

## Limitaciones y advertencias

- Perplejidad absoluta muy alta (279,98 en WikiText-2), lo que indica una calidad de generacion muy inferior a la del modelo base; no apto para produccion.
- El checkpoint contiene solo pesos de atencion (`attention_weights.safetensors`); requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugia antes de cargar los pesos con `strict=False`.
- Dependencia del paquete `neuralops` y del script `scripts.benchmarks.qwen_zoo_train_mix`, no incluidos en el repositorio de Hugging Face.
- Solo ingles declarado; sin validacion multilingue.
- Sin datos de sesgos, alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- Inicializacion SVD plana no calibrada y ausencia de adaptadores de recuperacion, lo que limita la fidelidad de la aproximacion.
- Entrenado exclusivamente sobre WikiText-2 con `seq_len=512`; el comportamiento fuera de ese regimen no esta documentado.
- Licencia MIT declarada, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- Resultados de benchmark marcados como `verified: false`; no han sido reproducidos de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-naive-svd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

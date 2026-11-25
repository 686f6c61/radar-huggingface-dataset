# tahamajs/qwen-2.5-0.5b-xattention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-xattention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decoder por el modulo `xattention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Lo publica el usuario tahamajs como parte del "Qwen Attention Zoo", una coleccion de variantes de atencion subcuadratica aplicadas sobre modelos Qwen. No es un modelo de proposito general, sino un artefacto de investigacion sobre mecanismos de atencion.

La arquitectura base es un transformer decoder-only de Qwen2.5 con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA 7:1), `head_dim=64` y `hidden_size=896`. La intervencion sigue el patron `hybrid_3_1`: 18 de las 24 capas usan `xattention` (atencion block-sparse con enrutamiento coarse-to-fine) y las 6 restantes (indices 3, 7, 11, 15, 19, 23) conservan atencion cuadratica densa como anclas. El modelo se entreno mediante destilacion de conocimiento en dos etapas sobre WikiText-2.

Su relevancia es acotada: sirve como banco de pruebas reproducible para evaluar el impacto de sustituir atencion densa por atencion block-sparse en un modelo pequeno, con telemetria de perplexity publicada. El resultado es, sin embargo, muy pobre: la perplexity final de validacion en WikiText-2 es de 25.732,97, frente a 149,25 del checkpoint inmediatamente posterior a la cirugia, lo que indica que el proceso de destilacion degrada severamente el modelo en lugar de recuperarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atencion hibrida: 18/24 capas `xattention` block-sparse + 6/24 capas de atencion cuadratica densa |
| Parametros totales | ~0,5 mil millones (heredados de Qwen2.5-0.5B); el repo solo contiene pesos de atencion (86,28 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modulo `XAttention` implementa atencion block-sparse con enrutamiento coarse-to-fine: proyecta Q, K y V (con LoRA), aplica RoPE con slicing de `past_len`, concatena la KV-cache y, cuando el numero de claves es grande y `keep_ratio < 1`, realiza un enrutamiento grueso a nivel de bloque seleccionando los `top-k` bloques (topk=64 en el entrenamiento) antes de aplicar atencion fina dentro de los bloques elegidos. Soporta causal, bidireccional, cross-attention, GQA nativo y RoPE, y dispone de kernel Triton opcional. La sustitucion se realiza mediante `QwenAttentionAdapter`, que mapea las proyecciones de `Qwen2Attention` (14 cabezas Q, 2 KV, `head_dim=64`, `hidden_size=896`) con expansion automatica 7x de cabezas KV y contrato de `o_proj` unico.

El entrenamiento consistio en destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`: una primera etapa de alineacion con backbone congelado (138 pasos, 54,1 s, MSE + coseno por capa con peso 0,25, `lm_head` puenteado) y una segunda de destilacion de representaciones multicapa (337 pasos, 125,9 s, pesos 0,50). En total, 475 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 12.476 MB en FP16 autocast con parametros maestros FP32. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva causal, heredada de la base Qwen2.5-0.5B, aunque severamente degradada por la intervencion y la destilacion.
- Atencion causal con soporte de KV-cache y RoPE.
- Soporte nativo de GQA (14 cabezas Q, 2 KV).
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (no explotado en este checkpoint causal).
- Capacidad multilingue: solo se declara ingles; el resto de idiomas de Qwen2.5 no se garantiza tras la cirugia.
- Tool calling, function calling, agentes, vision, audio y modo thinking: no disponibles en la informacion proporcionada (la base Qwen2.5-0.5B tampoco los soporta de forma nativa mas alla de texto).

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de comparacion reproducible para medir el coste en perplexity de sustituir atencion densa por `xattention` en un transformer pequeno, usando la telemetria publicada (149,25 → 25.732,97 de PPL).
- Validacion de pipelines de cirugia modular: el codigo de `apply_qwen_attention_surgery` con patron `hybrid_3_1` permite reproducir el experimento y probar otras topologias (por ejemplo, ratios 2:2 o 1:3) sobre la misma base.
- Benchmark de destilacion de conocimiento: las dos etapas (alineacion con backbone congelado y destilacion multicapa) son un caso de estudio de como la KD por capas puede fallar cuando el objetivo es recuperar un modelo tras una sustitucion agresiva de atencion.
- Pruebas de integracion de NeuralOps Hub: el modelo se carga en una linea con `load_surgeried_model`, util para validar la API del hub y el registro de modulos de atencion.
- Estudio de eficiencia de atencion block-sparse: permite medir en un modelo de 0,5B el ahorro computacional de `topk=64` frente a atencion densa, aunque sin datos de throughput publicados.
- Docencia y divulgacion: ejemplo minimo (0,1 GB de repo, 86 MB de pesos) para explicar GQA, RoPE, KV-cache y enrutamiento coarse-to-fine sin necesidad de hardware grande.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 25.732,97 |

Telemetria interna del entrenamiento:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | PPL causal | 149,25 |
| Post-KD (final) | PPL causal | 25.732,97 |
| Delta de perplexity | — | +25.583,72 (degradacion) |
| Stage 1 (frozen-backbone) | Pasos / tiempo | 138 / 54,1 s |
| Stage 2 (multi-layer KD) | Pasos / tiempo | 337 / 125,9 s |
| Total | Pasos / tiempo | 475 / 180,3 s |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; con cuantizacion a 8 bits, ~0,5 GB; a 4 bits, ~0,3 GB. El pico de VRAM reportado en entrenamiento fue de 12.476 MB (FP16 autocast con maestros FP32, no representativo de inferencia).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es mas que suficiente; tambien cabe en iGPU y CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: la carga requiere `neuralops.hub.load_surgeried_model` o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y es poco probable sin portar el modulo `xattention`.
- Latencia y throughput: no disponibles. El uso de kernel Triton es opcional y no se reportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-xattention-wikitext2` | ~0,5B | no disponible | 25.732,97 (declarado) | MIT | Hugging Face (repo 0,1 GB) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,49B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,49B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa con la base Qwen2.5-0.5B es la mas informativa: mismo numero de parametros y misma tokenizer, pero con atencion hibrida y una perplexity declarada tres ordenes de magnitud peor que la del checkpoint post-cirugia (149,25). No se dispone de PPL de referencia para la base en esta informacion.

## Limitaciones y advertencias

- Calidad severamente degradada: la perplexity final (25.732,97) es ~172 veces peor que la del checkpoint inmediatamente posterior a la cirugia (149,25); el proceso de destilacion empeora el modelo en lugar de recuperarlo.
- No es un modelo para produccion: es un artefacto de investigacion sobre mecanismos de atencion, no un asistente usable.
- Solo ingles declarado; el multilingue de Qwen2.5 no se garantiza tras la sustitucion de atencion.
- El repo contiene unicamente pesos de atencion (86,28 MB); es necesario descargar la base Qwen2.5-0.5B y aplicar la cirugia para poder ejecutarlo.
- Dependencia de la libreria `neuralops` y del codigo de `scripts.benchmarks.qwen_zoo_train_mix`, que no forma parte del repo de Hugging Face; la reproducibilidad depende de ese repositorio externo.
- Riesgo alto de alucinacion y generacion incoherente dado el nivel de perplexity.
- La metrica del `model-index` esta marcada como `verified: false`; no hay validacion independiente.
- Licencia MIT permite uso comercial del artefacto, pero la base Qwen2.5-0.5B tiene su propia licencia Apache 2.0 que debe respetarse.
- No hay datos de benchmarks estandar (MMLU, HumanEval, GSM8K) ni de throughput/latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-xattention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

# tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por un modulo de atencion polinomial denominado `PADReAttention` (Polynomial Attention with Dropout Regularization), perteneciente al registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es ofrecer un modelo de proposito general, sino servir como banco de pruebas reproducible para comparar mecanismos de atencion subcuadraticos frente a la atencion softmax estandar de Qwen2, midiendo la degradacion y recuperacion de perplejidad sobre WikiText-2.

El autor (tahamajs) aplica un patron de sustitucion hibrido 3:1 (`hybrid_3_1`): 18 capas usan `padre_attention` y 6 capas conservan la atencion cuadratica original como anclas (indices 3, 7, 11, 15, 19 y 23). Tras la cirugia, el modelo colapsa a una perplejidad de 194,98 en WikiText-2 y se recupera hasta 26,89 mediante un proceso de destilacion de conocimiento en dos etapas (349 pasos, ~180 s en una sola GPU). El resultado es un artefacto de investigacion que demuestra que un kernel polinomial puede aproximar el comportamiento de la atencion softmax con un coste de entrenamiento minimo.

El modelo es relevante ahora porque la comunidad busca alternativas subcuadraticas a la atencion softmax (Linear Attention, Mamba, RWKV, etc.) y este checkpoint ofrece un punto de comparacion controlado sobre una base pequena (0,5B) y ampliamente conocida. No obstante, su utilidad practica esta limitada al ambito de la investigacion en mecanismos de atencion: no es un modelo para produccion ni para tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `PADReAttention` (polinomial) + 6/24 capas de atencion cuadratica softmax como anclas |
| Parametros totales | ~0,5B (heredados de Qwen2.5-0.5B; el checkpoint publicado solo contiene pesos de atencion, 123,89 MB) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), mas `config.json`, `tokenizer.json` y `training_metrics.json` |
| Libreria | `neuralops` |
| Modelo base | `Qwen/Qwen2.5-0.5B` |
| Patron de cirugia | `hybrid_3_1` (3:1 intercalado) |
| Cabezas de atencion (Qwen2) | 14 query heads, 2 KV heads, `head_dim=64`, `hidden_size=896` |
| Soporte GQA nativo en `PADReAttention` | No (se aplica expansion 7x de KV heads via `QwenAttentionAdapter`) |
| Soporte RoPE en `PADReAttention` | N/A |
| Tamano del repo | 0,1 GB |
| Descargas | 366 |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica el `QwenAttentionAdapter`, que sustituye el modulo `Qwen2Attention` por `PADReAttention` en 18 de las 24 capas siguiendo un patron intercalado 3:1, y conserva 6 capas con atencion softmax cuadratica en los indices 3, 7, 11, 15, 19 y 23 como "anclas" que preservan la capacidad de modelado global. `PADReAttention` reemplaza la softmax por un kernel polinomial centrado y numericamente estable de la forma `(1 + S/order)^order`, con soporte para modo causal, bidireccional y cross-attention, pero sin soporte nativo de GQA ni de RoPE (el adaptador resuelve el GQA mediante expansion 7x de las cabezas KV y un contrato de `o_proj` unico).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`). La etapa 0 (post-cirugia, sin entrenamiento) arroja una perplejidad causal de 194,98. La etapa 1 (alineacion con backbone congelado, 105 pasos, 54,1 s) omite el `lm_head` y optimiza MSE y coseno por capa sobre estados ocultos con peso 0,25. La etapa 2 (destilacion multi-capa de representaciones, 244 pasos, 126,1 s) repite el esquema con peso 0,50. En total, 349 pasos y 180,5 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando una perplejidad final de 26,89 (delta de -168,09). El pico de VRAM fue de 18.723 MB en FP16 autocast con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada de Qwen2.5-0.5B pero potencialmente degradada por la sustitucion de atencion.
- Modelado de lenguaje causal medido en WikiText-2 (perplejidad 26,89), que es la metrica principal declarada por el autor.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo `PADReAttention` (segun la tabla de capacidades del modulo).
- No soporta GQA nativo en `PADReAttention`; el adaptador lo emula mediante expansion de cabezas KV.
- No soporta RoPE nativo en `PADReAttention` (marcado como `N/A`).
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte para otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible.
- Agentes y razonamiento multi-paso: no disponible; el modelo no ha sido evaluado en esas tareas.

## Casos de uso

- Investigacion en mecanismos de atencion subcuadraticos: el checkpoint sirve como referencia reproducible para medir como afecta la sustitucion de softmax por un kernel polinomial a la perplejidad en un corpus controlado (WikiText-2), comparando contra el Qwen2.5-0.5B original.
- Benchmarking de frameworks de atencion: util para validar la implementacion de `PADReAttention` y del `QwenAttentionAdapter` en el ecosistema NeuralOps, comprobando que la cirugia y la carga de pesos funcionan correctamente.
- Estudio de destilacion de conocimiento post-cirugia: las metricas de las dos etapas (105 y 244 pasos, con pesos 0,25 y 0,50) permiten analizar la eficiencia de la KD para recuperar perplejidad tras una modificacion estructural agresiva.
- Experimentos de atencion hibrida: el patron 3:1 con 6 capas ancla permite estudiar el equilibrio entre capas subcuadraticas y cuadraticas en terminos de calidad y coste computacional.
- Docencia y divulgacion: ejemplo didactico de como se aplica una cirugia de atencion sobre un modelo preentrenado y se evalua su impacto con una metrica estandar.
- Prototipado de tecnicas de expansion GQA: el adaptador aplica una expansion 7x de cabezas KV para compensar la falta de GQA nativo en `PADReAttention`, lo que puede servir como referencia para otros adaptadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad (Causal LM) | 26,89 |
| WikiText-2 (post-cirugia, etapa 0) | Perplejidad (Causal LM) | 194,98 |
| WikiText-2 (delta tras KD) | Perplejidad | -168,09 |

Telemetria de entrenamiento:

| Etapa | Pasos | Tiempo | Peso KD |
|---|---:|---:|---:|
| Etapa 1 (alineacion con backbone congelado) | 105 | 54,1 s | 0,25 |
| Etapa 2 (destilacion multi-capa) | 244 | 126,1 s | 0,50 |
| Total | 349 | 180,5 s | - |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidades en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 18.723 MB de pico en FP16 autocast con parametros maestros en FP32. Para inferencia en FP16 de un modelo de 0,5B se puede estimar en torno a 1-2 GB, pero no es un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM para FP16; el entrenamiento requirio una GPU con ~19 GB (por ejemplo, RTX 4090, A100 40GB, L40S).
- Cabe en GPU consumer: si, en FP16 en GPUs con 4 GB o mas (estimacion, no confirmada por el autor).
- Opciones de despliegue: el modelo se carga via `neuralops.hub.load_surgeried_model` o manualmente con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2` | ~0,5B | No disponible | 26,89 (declarada) | MIT | Hugging Face (NeuralOps) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun Qwen2.5) | No disponible en la informacion | Apache 2.0 (Qwen2.5) | Hugging Face |
| Alternativas subcuadraticas (Mamba, RWKV, Linear Attention) | Variable | Variable | No disponible | Variable | Variable |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en WikiText-2 dentro de la informacion proporcionada, por lo que no es posible cuantificar la degradacion exacta frente al original. Tampoco se han identificado en la informacion otros checkpoints equivalentes de atencion polinomial sobre Qwen2.5-0.5B para comparar directamente.

## Limitaciones y advertencias

- El checkpoint publicado contiene unicamente los pesos de atencion (`attention_weights.safetensors`, 123,89 MB), no el modelo completo; es necesario descargar el base `Qwen/Qwen2.5-0.5B` y aplicar la cirugia con `apply_qwen_attention_surgery` antes de cargar los pesos.
- Requiere el framework `neuralops` y el script `scripts.benchmarks.qwen_zoo_train_mix` para la carga manual; no es compatible con `AutoModelForCausalLM.from_pretrained` directo sobre el repo.
- El modelo esta entrenado y evaluado exclusivamente sobre WikiText-2 en ingles; no hay evidencia de calidad en otros dominios ni idiomas.
- La perplejidad de 26,89 es declarada por el autor y no ha sido verificada de forma independiente (`verified: false` en el model-index).
- El autor no reporta benchmarks de capacidades (razonamiento, codigo, matematicas, tool calling), por lo que no se puede asumir que el modelo las conserve tras la cirugia.
- `PADReAttention` no soporta GQA ni RoPE nativos; el adaptador emula GQA con expansion 7x de cabezas KV, lo que puede introducir ineficiencias o divergencias respecto al comportamiento del modelo base.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 0,5B con atencion modificada, es esperable un comportamiento inferior al base en generacion abierta.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus de entrenamiento original, no caracterizados en la model card.
- Licencia MIT permite uso comercial, pero la ausencia de evaluaciones de calidad y la naturaleza experimental del checkpoint desaconsejan su uso en produccion.
- El modelo tiene 0 likes y 366 descargas en el momento de la ficha, lo que sugiere una adopcion muy limitada y poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-padre-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

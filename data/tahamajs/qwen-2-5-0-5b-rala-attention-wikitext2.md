# tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que el autor (tahamajs) ha sustituido quirurgicamente los bloques de atencion del decodificador por el operador `RALALinearAttention` (Rank-Augmented Linear Attention) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. No es un modelo nuevo entrenado desde cero, sino un artefacto de investigacion sobre atencion subcuadratica: 18 de las 24 capas del transformer original se reemplazan por atencion lineal RALA y 6 capas se conservan como anclas cuadraticas completas.

El modelo se presenta como parte de un "Attention Zoo" orientado a estudiar el impacto de operadores de atencion alternativos en modelos pequenos. El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), con solo 13 pasos de optimizacion y 183,8 segundos de computo total. El resultado, segun la model card, es un perplexity de validacion de 121.980.150,39, identico al baseline pre-destilacion, lo que indica que la destilacion no recupero la capacidad del modelo base.

Es relevante ahora como ejemplo reproducible de cirugia de atencion y como advertencia practica: demuestra el flujo de trabajo de NeuralOps para sustituir operadores, pero el checkpoint resultante no es apto para uso en produccion ni para generacion de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `RALALinearAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B); solo se publican pesos de atencion (124,39 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) |
| Libreria | neuralops |
| Modelo base | Qwen/Qwen2.5-0.5B |
| Patron de cirugia | `hybrid_3_1` (3:1 intercalado) |
| Capas ancla (cuadraticas) | indices [3, 7, 11, 15, 19, 23] |
| Heads Q / KV | 14 / 2, `head_dim=64`, `hidden_size=896` |
| Soporte GQA nativo en RALA | No |
| Soporte RoPE en RALA | N/A |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only estandar con 24 capas, 14 cabezas de query, 2 cabezas KV (GQA) y `head_dim` de 64 sobre un `hidden_size` de 896. La intervencion reemplaza la atencion en 18 de las 24 capas por `RALALinearAttention`, un operador de atencion lineal con aumentacion de rango (Rank-Augmented Linear Attention), manteniendo 6 capas con atencion cuadratica completa en los indices [3, 7, 11, 15, 19, 23] como anclas. El adaptador `QwenAttentionAdapter` gestiona la proyeccion de las cabezas (expansion 7x de KV donde es necesario) y aplica el contrato de bypass con una unica `o_proj`.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineacion con backbone congelado (4 pasos, 55,1 s) usando MSE y coseno sobre estados ocultos con peso 0,25, y una segunda etapa de destilacion de representacion multicapa (9 pasos, 128,1 s) con peso 0,50. En total 13 pasos de optimizacion, 183,8 s, `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 21.553 MB en FP16 con parametros maestros en FP32. No se menciona RLHF, DPO ni datos adicionales fuera de WikiText-2.

## Capacidades

- Generacion de texto causal autoregresiva (soporte `supports_causal` confirmado por el modulo).
- Soporte bidireccional (`supports_bidirectional`) y de atencion cruzada (`supports_cross_attention`) a nivel de operador, aunque el checkpoint se publica para `text-generation`.
- Operador de atencion personalizado (`is_custom_attention`), lo que permite experimentar con atencion subcuadratica.
- Capacidades multilingues limitadas: solo se declara ingles (`en`).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- La calidad de generacion efectiva es practicamente nula: el perplexity de validacion de 121.980.150,39 indica que el modelo no ha recuperado la distribucion del lenguaje tras la cirugia.

## Casos de uso

- Investigacion sobre atencion subcuadratica: banco de pruebas para medir el impacto de sustituir atencion cuadratica por `RALALinearAttention` en un transformer pequeno, comparando con el modelo base Qwen2.5-0.5B.
- Reproducibilidad de cirugia de atencion: el repositorio documenta el patron `hybrid_3_1`, los indices de capas ancla y el adaptador `QwenAttentionAdapter`, lo que permite replicar el procedimiento en otros modelos Qwen.
- Desarrollo y validacion de operadores en NeuralOps: sirve para probar el registro `ATTENTION_REGISTRY`, el flujo de `apply_qwen_attention_surgery` y la carga de pesos parciales con `strict=False`.
- Docencia y divulgacion tecnica: ejemplo minimo (0,5B parametros, 124 MB de pesos de atencion) para explicar destilacion de conocimiento en dos etapas y contratos de adaptadores de atencion.
- Pruebas de infraestructura de inferencia: verificar que pipelines de carga de safetensors, `torch_dtype=float16` y generacion con `transformers` funcionan con pesos parciales de atencion.
- Analisis de fallo de destilacion: el delta de perplexity de +0,00 con solo 13 pasos sirve como caso de estudio de por que una destilacion insuficiente no recupera capacidad, util para calibrar presupuestos de entrenamiento.
- No es adecuado para atencion al cliente, generacion de codigo, agentes ni ninguna aplicacion de produccion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | Salesforce/wikitext, wikitext-2-raw-v1, validation | Perplexity | 121.980.150,39 |
| Causal PPL pre-KD (Stage 0) | wikitext-2-raw-v1 | Perplexity | 121.980.150,39 |
| Post-KD Causal PPL | wikitext-2-raw-v1 | Perplexity | 121.980.150,39 |
| Delta de perplexity | wikitext-2-raw-v1 | Δ PPL | +0,00 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. El unico dato es el perplexity de WikiText-2, identico antes y despues de la destilacion, lo que confirma que esta no aporto mejora medible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,5B parametros; en FP16 requiere aproximadamente 1 GB de pesos, mas overhead de activaciones y KV cache.
- El entrenamiento de destilacion reporto un pico de 21.553 MB de VRAM (FP16 autocast con parametros maestros FP32), por lo que se uso una GPU de al menos 24 GB.
- GPU recomendadas para inferencia: cualquier GPU consumer con 4 GB o mas (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento, A100 40 GB, H100 o RTX 4090 de 24 GB.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 4 GB o mas.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (requiere aplicar la cirugia de atencion antes de cargar los pesos), `safetensors` para carga parcial. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Calidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2` | 0,5B | no disponible (entrenado a 512) | Hibrida RALA 3:1 | MIT | PPL WikiText-2 de 121.980.150,39 |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun Qwen2.5) | Cuadratica completa con GQA | Apache 2.0 | Modelo funcional de referencia |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32.768 tokens | Cuadratica completa con GQA | Apache 2.0 | Ajustado para instrucciones y conversacion |
| `tahamajs` (otros checkpoints del Attention Zoo) | 0,5B | no disponible | Varios operadores | MIT | no disponible |

La comparativa relevante es contra el modelo base: el checkpoint RALA no supera ni iguala la calidad de Qwen2.5-0.5B en perplexity, y su unico valor es experimental.

## Limitaciones y advertencias

- Perplexity de validacion de 121.980.150,39: el modelo no genera texto coherente; la destilacion de 13 pasos no recupero la capacidad del modelo base.
- El delta de perplexity de +0,00 indica que la segunda etapa de destilacion no aporto ninguna mejora medible.
- Solo se publican pesos de atencion (124,39 MB); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugia con `apply_qwen_attention_surgery` antes de cargar los pesos, lo que anade pasos y dependencias.
- Requiere la libreria `neuralops` y el script `scripts/benchmarks/qwen_zoo_train_mix.py`, no incluidos en el repo de Hugging Face.
- Idioma limitado a ingles; no se declara soporte multilingue.
- No hay datos sobre longitud de contexto efectiva tras la cirugia; el entrenamiento uso `seq_len=512`.
- `RALALinearAttention` no soporta GQA nativo, lo que obliga a expansion 7x de cabezas KV y puede afectar a la eficiencia.
- No apto para uso comercial en produccion pese a la licencia MIT: la calidad del modelo lo desaconseja.
- Riesgo elevado de alucinacion y salidas degeneradas.
- No se han publicado evaluaciones de sesgos, seguridad ni robustez.
- El repositorio tiene 0 descargas y 0 likes; no hay validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

# tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención de 18 de sus 24 capas por un modulo de atención lineal subcuadrática denominado `svd_linear_decay` (clase `DecayDecayLinearAttention`), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El autor es `tahamajs` y el modelo se distribuye con licencia MIT.

El objetivo no es ofrecer un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible para estudiar la viabilidad de sustituir atención cuadrática por atención lineal con decaimiento exponencial y factorización SVD de bajo rango, manteniendo anclas cuadráticas en una topología híbrida 3:1. El ajuste se realiza mediante destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de un checkpoint base de 0,5 mil millones de parámetros con contexto nativo de 32 768 tokens en Qwen2.5.

La relevancia es acotada pero concreta: documenta de forma transparente la telemetría de una cirugía de atención (perplejidad antes y después, pasos de entrenamiento, VRAM pico) y publica únicamente los pesos de atención modificados (76,62 MB), no el modelo completo. La perplejidad final en validación de WikiText-2 es de 3008,38, un valor muy alto que refleja que se trata de un artefacto de investigación, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `svd_linear_decay` (`DecayDecayLinearAttention`) y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens; el checkpoint se entrena con `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16/BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA, `head_dim=64`). Sobre esa base se aplica una cirugía de atención con patrón `hybrid_3_1`: se reemplazan 18 capas por el modulo `svd_linear_decay`, que combina factorización SVD de bajo rango con un kernel de decaimiento temporal exponencial y una recurrencia lineal de la forma `S_t = λ·S_{t-1} + K_tᵀ·V_t`, `O_t = Q_t·S_t`, evitando materializar matrices N×N. Las 6 capas restantes (índices 3, 7, 11, 15, 19, 23) se conservan como anclas cuadráticas. El adaptador `QwenAttentionAdapter` gestiona la expansión 14:2 de cabezas KV y el contrato de `o_proj` único.

El entrenamiento consiste en destilación de conocimiento en dos etapas sobre WikiText-2. La etapa 1 (alineación con backbone congelado) ejecuta 69 pasos (54,6 s) con `lm_head` desactivado, usando MSE de estados ocultos por capa más coseno con peso 0,25. La etapa 2 (KD de representación multicapa) ejecuta 156 pasos (125,9 s) con peso de coseno 0,50. En total, 225 pasos y 180,8 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 12 935 MB en FP16 autocast con parámetros maestros en FP32. La perplejidad causal pasa de 406 957,26 (baseline cero tras la cirugía) a 3008,38 tras la destilación.

## Capacidades

- Generación de texto causal autoregresiva en inglés, con soporte declarado para atención causal, bidireccional y cross-attention a nivel de módulo.
- Soporte nativo de GQA en el modulo de atención sustituido.
- No se declara soporte de RoPE en el modulo `svd_linear_decay` (`supports_rope: N/A`).
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.
- El modelo es un artefacto de investigación sobre atención; no se documentan capacidades adicionales más allá de la generación de texto.

## Casos de uso

- Investigación en atención lineal: sirve para reproducir y auditar el efecto de sustituir atención cuadrática por `svd_linear_decay` con anclas cuadráticas, comparando perplejidad antes y después de la destilación con la telemetría publicada.
- Benchmark de cirugía de atención: el checkpoint permite medir el coste de recuperación (225 pasos, 180,8 s, 12 935 MB de VRAM pico) al transplantar módulos de atención en modelos pequeños, como referencia para escalar a modelos mayores.
- Estudio de destilación de conocimiento: las dos etapas (alineación con backbone congelado y KD multicapa) son reproducibles y sirven para comparar estrategias de recuperación de perplejidad tras una modificación estructural.
- Validación de implementaciones de atención subcuadrática: útil para comprobar que una implementación de recurrencia lineal con decaimiento exponencial y prefix-scan por chunks produce salidas coherentes en un transformer real.
- Docencia y divulgación: ejemplo didáctico de cómo se sustituye un bloque de atención en un modelo Hugging Face y se publican solo los pesos modificados.
- Pruebas de integración de NeuralOps: el modelo valida la API `load_surgeried_model` y el flujo de carga de pesos quirúrgicos desde el Hub.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 3008,38 | No |
| WikiText-2 (baseline cero tras cirugía, Stage 0) | Perplejidad | 406 957,26 | No |
| WikiText-2 (delta tras KD) | Perplejidad | -403 948,87 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 12 935 MB en FP16 con parámetros maestros FP32. La inferencia en FP16 de un modelo de 0,5B con pesos de atención de 76,62 MB debería caber holgadamente en GPUs consumer, pero no se publica una cifra medida.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en FP16.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no se confirma en la información proporcionada.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` + `safetensors` con `apply_qwen_attention_surgery`, y vía `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2` | 0,5B | no disponible | 3008,38 | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32 768 tokens | no disponible en la informacion | Apache 2.0 (segun modelo base) | Hugging Face |
| Alternativas de 0,5B con atencion lineal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Perplejidad muy elevada (3008,38) incluso tras la destilación: el modelo no es apto para uso en producción ni para generación de texto de calidad.
- Solo se publican los pesos de atención modificados (`attention_weights.safetensors`); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugía para poder usarlo.
- Entrenado exclusivamente sobre WikiText-2 en inglés; no hay evidencia de generalización a otros dominios o idiomas.
- El modulo `svd_linear_decay` no declara soporte de RoPE, lo que puede afectar a la extrapolación de contexto más allá de `seq_len=512`.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia MIT declarada, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse al redistribuir o usar comercialmente.
- Los resultados de benchmarks no están verificados (`verified: false`).
- Artefacto de investigación: no hay garantías de estabilidad, soporte ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-linear-decay-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

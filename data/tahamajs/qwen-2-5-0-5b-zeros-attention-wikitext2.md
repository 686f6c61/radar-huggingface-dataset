# tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-zeros-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps, un "attention zoo" que recopila implementaciones de mecanismos de atención alternativos. El modelo parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente 18 de sus 24 capas de atención por el operador `ZeroSAttention` (atención lineal de media cero), preservando 6 capas con atención cuadrática completa como anclas. No es un modelo de propósito general: es un artefacto de investigación sobre atención subcuadrática y destilación de conocimiento.

El problema que aborda es la viabilidad de reemplazar atención cuadrática por alternativas lineales en modelos ya entrenados, recuperando calidad mediante destilación en dos etapas. Tras la cirugía, la perplejidad en WikiText-2 se dispara a 406888,29; tras 221 pasos de destilación (unos 180 segundos en una GPU con 17,3 GB de VRAM pico) baja a 656,20. Esa cifra sigue siendo muy alta para un modelo de 0,5B, lo que sitúa al checkpoint como una prueba de concepto, no como un modelo listo para producción.

La relevancia es metodológica: documenta con telemetría detallada (pasos, tiempos, VRAM, deltas de perplejidad) cómo se comporta una hibridación 3:1 de atención lineal y cuadrática sobre un transformer denso pequeño. El repositorio solo contiene los pesos de atención (114,86 MB en `attention_weights.safetensors`), no un modelo completo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `ZeroSAttention` + 6/24 capas de atencion cuadratica completa |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B; el repo solo distribuye pesos de atencion) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se declara en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 114,86 MB), mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un Qwen2.5-0.5B denso (hidden_size 896, 14 cabezas de query, 2 cabezas KV, head_dim 64, GQA nativo) al que se le aplica un `QwenAttentionAdapter` que expande las cabezas KV 7x donde es necesario y respeta el contrato de una única `o_proj`. La topologia de cirugía es `hybrid_3_1`: se sustituyen 18 de las 24 capas por `ZeroSAttention` (atención lineal de media cero, con soporte causal, bidireccional, cross-attention, GQA y RoPE) y se conservan capas cuadráticas completas en los índices 3, 7, 11, 15, 19 y 23 como anclas.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, 67 pasos, 54,3 s) omite `lm_head` y usa MSE y coseno sobre estados ocultos con peso 0,25. La etapa 2 (destilación multi-capa de representaciones, 154 pasos, 125,6 s) sube el peso del coseno a 0,50. En total, 221 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`. No se documenta RLHF ni DPO; el objetivo es la recuperación de perplejidad, no la alineación.

## Capacidades

- Generación de texto causal autoregresiva, heredada del backbone Qwen2.5-0.5B.
- Soporte de atención causal, bidireccional y cross-attention en el operador `ZeroSAttention`.
- Compatibilidad con GQA y RoPE a través del adaptador de atención.
- Capacidad de servir como banco de pruebas para comparar atención lineal frente a cuadrática.
- Idiomas: únicamente inglés declarado.
- No se documentan tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta capacidad de agente ni integración con frameworks de orquestación.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve para medir empíricamente la pérdida de calidad al sustituir atención cuadrática por lineal en un transformer denso de 0,5B, con telemetría de perplejidad antes y después de la destilación.
- Reproducción de experimentos de cirugía de atención: el script de quick start (`apply_qwen_attention_surgery`) permite replicar la topología `hybrid_3_1` y validar el pipeline de NeuralOps.
- Estudio de destilación de conocimiento en dos etapas: los 221 pasos documentados con tiempos y VRAM permiten comparar estrategias de alineación de estados ocultos frente a destilación de logits.
- Benchmarking de kernels de atención: al mezclar 18 capas lineales con 6 cuadráticas, es útil para perfilar latencia y memoria de implementaciones alternativas en GPUs consumer.
- Docencia y divulgación: ejemplo didáctico de cómo se modifica un modelo preentrenado a nivel de bloque sin reentrenar desde cero.
- Base para futuros checkpoints del attention zoo: el formato de pesos de atención separado facilita intercambiar operadores sobre el mismo backbone.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 656,20 |
| WikiText-2, baseline post-cirugia sin destilar (Stage 0) | Perplejidad | 406888,29 |
| Delta de perplejidad tras destilacion | Perplejidad | -406232,09 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM pico durante el entrenamiento: 17.333 MB (FP16 autocast con parámetros maestros en FP32).
- Inferencia: el repo solo contiene pesos de atención (114,86 MB); para inferir hay que cargar el backbone Qwen2.5-0.5B completo, que en FP16 ocupa aproximadamente 1 GB. Cabe holgadamente en cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, etc.).
- GPU recomendadas para reproducir el entrenamiento: una GPU con al menos 18 GB de VRAM, como RTX 4090, A100 o H100.
- Despliegue: la model card solo documenta carga vía `transformers` con `AutoModelForCausalLM` y aplicación de la cirugía con el script de NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2` | 0,5B | no disponible | 656,20 (declarada) | MIT | Pesos de atencion en HF |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (segun documentacion oficial de Qwen) | no disponible en esta ficha | Apache 2.0 | Modelo completo en HF |
| Otros checkpoints del NeuralOps attention zoo | no disponible | no disponible | no disponible | MIT | no disponible |

La comparación directa con el backbone original en perplejidad WikiText-2 no está disponible en la información proporcionada. El checkpoint destilado presenta una perplejidad muy superior a la que cabría esperar de un modelo de 0,5B bien entrenado, lo que refleja el carácter experimental del artefacto.

## Limitaciones y advertencias

- Perplejidad de 656,20 en WikiText-2: muy alta para un modelo de 0,5B, lo que indica calidad de generación limitada y riesgo elevado de texto incoherente.
- El repositorio solo contiene pesos de atención; no es un modelo autónomo. Requiere descargar el backbone Qwen2.5-0.5B y aplicar la cirugía con código externo (`scripts.benchmarks.qwen_zoo_train_mix`), lo que añade fricción y dependencias no empaquetadas.
- Entrenado únicamente sobre WikiText-2 en inglés; no se documenta cobertura multilingüe ni dominio general.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al ser un experimento de investigación, no hay garantías de seguridad.
- Licencia MIT para los pesos publicados, pero el backbone Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse al combinar ambos artefactos.
- Sin verificación independiente de los resultados (`verified: false` en el model-index).
- No apto para producción: sin soporte de tool calling, agentes ni despliegue estándar documentado.
- El contexto de entrenamiento fue de 512 tokens; no se garantiza buen comportamiento en secuencias más largas pese a que el backbone soporte ventanas mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-zeros-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

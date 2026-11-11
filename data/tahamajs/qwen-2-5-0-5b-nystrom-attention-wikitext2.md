# tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirurgicamente 18 de las 24 capas de atencion del decoder por un operador de atencion subcuadratica basado en Nystromformer (`nystrom_attention`), dentro del proyecto NeuralOps Attention Zoo de tahamajs. El objetivo no es producir un modelo de proposito general, sino validar que un operador de atencion alternativo puede injertarse en un transformer preentrenado y recuperar calidad tras un proceso de destilacion de conocimiento en dos etapas.

El modelo parte de los pesos de Qwen/Qwen2.5-0.5B (896 de hidden size, 14 cabezas de query, 2 cabezas KV con GQA, head_dim de 64) y aplica un patron hibrido 3:1 que preserva seis capas de atencion cuadratica completa en los indices [3, 7, 11, 15, 19, 23] como anclas. Tras el injerto, la perplejidad causal se dispara a 434,12 y se reduce a 34,02 en WikiText-2 mediante 421 pasos de destilacion por capas, lo que demuestra la viabilidad del enfoque.

Su relevancia es fundamentalmente de investigacion: es un banco de pruebas reproducible para estudiar atencion subcuadratica, tecnicas de cirugia de modulos y destilacion de representaciones sobre modelos pequenos, con telemetria completa de entrenamiento y artefactos de pesos de solo 86,28 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `nystrom_attention` (Nystromformer causal con chunking) y 6/24 capas de atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se especifica recuento exacto en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento de destilacion uso `seq_len=512`; no se declara ventana maxima) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB) mas `config.json`, `tokenizer.json` y `training_metrics.json`; requiere el modelo base Qwen/Qwen2.5-0.5B y la libreria `neuralops` para cargar |

## Arquitectura y entrenamiento

El modelo conserva la columna vertebral de Qwen2.5-0.5B: 24 capas de decoder con `hidden_size=896`, 14 cabezas de query y 2 cabezas KV (GQA), con `head_dim=64`. Sobre esa base se aplica el patron `hybrid_3_1`, que reemplaza la atencion en 18 capas mediante el `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando el operador lo requiere y respeta el contrato de una unica `o_proj`. Las seis capas restantes mantienen atencion cuadratica completa como anclas, lo que mitiga la perdida de capacidad de modelado local que introduce la aproximacion de Nystrom.

El operador `nystrom_attention` implementa Nystromformer con chunking causal para decoders, soporta modo bidireccional, cross-attention y GQA nativo, y no declara soporte de RoPE en la tabla de capacidades del modulo. El entrenamiento consiste en una destilacion de conocimiento en dos etapas desde el modelo base: la etapa 1 (128 pasos, 54,5 s) alinea el backbone congelado con MSE y coseno por capas (peso 0,25) sin usar `lm_head`; la etapa 2 (293 pasos, 125,3 s) aplica destilacion de representaciones multicapa (peso 0,50). En total, 421 pasos y 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 14.818 MB en FP16 con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Atencion subcuadratica con soporte causal, bidireccional y cross-attention a nivel de modulo.
- Soporte nativo de GQA con expansion automatica de cabezas KV en el adaptador.
- Capacidad de servir como banco de pruebas para investigacion en atencion eficiente y cirugia de modulos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento explicito en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language` de la model card.

## Casos de uso

- Investigacion en atencion subcuadratica: el checkpoint permite medir el impacto real de Nystromformer sobre un transformer preentrenado, comparando la perplejidad de 34,02 frente a la del Qwen2.5-0.5B original en WikiText-2.
- Validacion de pipelines de cirugia de modulos: sirve para reproducir el flujo `apply_qwen_attention_surgery` con patron `hybrid_3_1` y verificar que el adaptador respeta el contrato de `o_proj` unica.
- Experimentos de destilacion de conocimiento: la telemetria de dos etapas (alineacion con backbone congelado y destilacion multicapa) es replicable y util para comparar estrategias de recuperacion de calidad.
- Prototipado de bajo coste en GPUs de consumo: con 0,5 mil millones de parametros y pesos de atencion de 86,28 MB, el modelo cabe en tarjetas consumer para pruebas de generacion en ingles.
- Docencia y divulgacion tecnica: ejemplo concreto de como sustituir un componente de atencion sin reentrenar desde cero, con metricas antes y despues documentadas.
- Benchmarking de operadores de atencion: punto de partida para comparar `nystrom_attention` con otros operadores del `ATTENTION_REGISTRY` de NeuralOps sobre el mismo corpus y la misma configuracion.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 34,02 | No (declarado por el autor) |

Telemetria interna del proceso de destilacion:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 434,12 |
| Post-KD | Perplejidad causal | 34,02 |
| Delta | Reduccion de perplejidad | -400,10 |
| Stage 1 (frozen-backbone alignment) | Pasos / tiempo | 128 / 54,5 s |
| Stage 2 (multi-layer representation KD) | Pasos / tiempo | 293 / 125,3 s |
| Total | Pasos / tiempo | 421 / 180,1 s |
| Pico de VRAM | Memoria GPU | 14.818 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de atencion ocupa 86,28 MB; sumado al modelo base Qwen2.5-0.5B en FP16 (aproximadamente 1 GB) el total ronda 1-1,5 GB, aunque no se declara una cifra oficial de VRAM de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el entrenamiento de destilacion reporto un pico de 14.818 MB, lo que sugiere una GPU de 16 GB o superior (por ejemplo, RTX 4090, A100 40 GB) para reproducir el proceso.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamano del modelo base.
- Opciones de despliegue: la carga requiere la libreria `neuralops` y el script `apply_qwen_attention_surgery`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2 | 0,5 B | no disponible | 34,02 (validation, no verificado) | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens (segun Qwen2.5) | no disponible en la informacion proporcionada | Apache 2.0 (segun Qwen2.5) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5 B | no disponible | no disponible | MIT (segun repo) | Hugging Face |

La comparativa directa con el modelo base en WikiText-2 no esta publicada en la informacion disponible, por lo que no es posible cuantificar la perdida de calidad atribuible al operador Nystrom.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion ni para uso general; su rendimiento fuera de WikiText-2 no esta evaluado.
- La perplejidad de 34,02 esta declarada por el autor y marcada como no verificada (`verified: false`).
- Solo soporta ingles segun el campo `language` de la model card; no se documentan capacidades multilingues.
- No se declara longitud de contexto maxima; el entrenamiento uso `seq_len=512`, por lo que el comportamiento en secuencias largas es desconocido.
- La carga requiere la libreria `neuralops` y el script de cirugia `apply_qwen_attention_surgery`; no es un checkpoint cargable directamente con `AutoModelForCausalLM.from_pretrained` sin ese paso previo.
- Riesgo de alucinacion y sesgos heredados del modelo base Qwen2.5-0.5B, agravados potencialmente por la aproximacion de Nystrom y por el corpus limitado de destilacion (WikiText-2).
- La licencia MIT del checkpoint no exime de las condiciones del modelo base Qwen2.5-0.5B, que deben respetarse al redistribuir o usar comercialmente.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento; no debe asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-nystrom-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

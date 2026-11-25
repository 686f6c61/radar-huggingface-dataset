# tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por un modulo de atencion lineal factorizada via SVD (`SVDLinearAttention`) del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo listo para produccion, sino servir como banco de pruebas reproducible para estudiar el impacto de reemplazar atencion cuadratica por alternativas subcuadraticas en un transformer ya entrenado, midiendo la degradacion y la recuperacion mediante destilacion de conocimiento.

El autor (tahamajs) ha publicado el checkpoint junto con la topologia exacta de la cirugia (patron `hybrid_3_1`, 18 de 24 capas sustituidas), la telemetria de las dos etapas de destilacion y los pesos unicamente de atencion (`attention_weights.safetensors`, 76,62 MB). El modelo base Qwen2.5-0.5B tiene 494 millones de parametros, 24 capas y un contexto nativo de 32 768 tokens; este derivado conserva la tokenizer y el `lm_head` originales y solo modifica las proyecciones de atencion.

La relevancia actual es metodologica: con una perplexity final de 3158,09 en WikiText-2 el modelo esta muy lejos de ser util para generacion real, pero documenta de forma transparente cuanto se degrada un transformer al injertar atencion lineal sin reentrenamiento completo y cuanto se recupera con 421 pasos de destilacion en capas ocultas (180,4 s en una sola GPU). Es material de investigacion, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `SVDLinearAttention` y 6/24 capas con atencion cuadratica completa (indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 494 M (heredados de Qwen2.5-0.5B; los pesos publicados de atencion suman 76,62 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-0.5B soporta 32 768 tokens nativos, pero el entrenamiento se hizo con `seq_len=512` |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 76,62 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (`head_dim=64`, GQA 7:1). Sobre esa base se aplica una "cirugia" mediante `QwenAttentionAdapter`, que sustituye 18 de las 24 capas de atencion por `SVDLinearAttention`, un modulo de atencion lineal con factorizacion SVD y gating de decaimiento exponencial opcional. Se conservan 6 capas de atencion cuadratica completa en indices intercalados (`hybrid_3_1`: tres capas lineales por cada capa cuadratica) para mantener capacidad de recuperacion de informacion a larga distancia. El adaptador expande automaticamente las 2 cabezas KV a 7 cuando el modulo lo requiere y respeta el contrato de una sola `o_proj`.

El entrenamiento es exclusivamente destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), sin RLHF ni DPO. La etapa 1 (alineacion con backbone congelado, 128 pasos, 54,3 s) omite el `lm_head` y minimiza MSE y coseno (peso 0,25) entre estados ocultos por capa. La etapa 2 (destilacion multi-capa, 293 pasos, 125,8 s) repite el esquema con peso 0,50. En total 421 pasos, `seq_len=512`, `grad_accum=4`, `topk=64`, 180,4 s y un pico de 16 839 MB de VRAM en FP16 con parametros maestros en FP32. La perplexity causal pasa de 1 207 852,35 tras la cirugia sin entrenar a 3 158,09 tras la destilacion, una reduccion de 1 204 694,26 puntos que demuestra la viabilidad del injerto pero deja el modelo muy por debajo de su base.

## Capacidades

- Generacion de texto autoregresiva causal (soporte `supports_causal=Yes`), aunque con calidad muy degradada respecto al modelo base.
- Soporte bidireccional (`supports_bidirectional=Yes`) a nivel de modulo, no verificado en este checkpoint.
- Soporte de cross-attention (`supports_cross_attention=Yes`) a nivel de modulo.
- Soporte nativo de GQA (`supports_gqa=Yes`) con expansion 14:2 documentada.
- Soporte de RoPE marcado como `N/A` en el modulo, pese a que Qwen2 lo usa en el modelo base; conviene verificar el comportamiento posicional en uso real.
- Capacidades multilingues: solo ingles declarado; no se garantiza el resto de idiomas de Qwen2.5.
- Tool calling, function calling, agentes y multi-step reasoning: no disponibles ni verificados en este checkpoint.
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para medir la degradacion de perplexity al sustituir atencion cuadratica por lineal en un transformer preentrenado, con la topologia `hybrid_3_1` y los indices exactos de las capas conservadas.
- Reproduccion de experimentos de destilacion: la telemetria de las dos etapas (pasos, tiempo, VRAM, pesos de MSE/coseno) permite replicar el pipeline en otras combinaciones de modelo base y modulo de atencion.
- Benchmark de modulos del `ATTENTION_REGISTRY`: util como baseline en el "Attention Zoo" de NeuralOps para comparar `svd_linear_attention` frente a otras alternativas del registro bajo el mismo protocolo.
- Pruebas de integracion del adaptador `QwenAttentionAdapter`: valida el contrato de expansion GQA 14:2 y la sustitucion de `o_proj` en un modelo real, sirviendo como test de regresion del propio framework.
- Estudio de eficiencia memoria/tiempo: con 16,8 GB de pico en una sola GPU y 180 s de entrenamiento, es un banco de pruebas asequible para medir coste de destilacion en modelos pequenos antes de escalar a 7B o 14B.
- Docencia y divulgacion: ejemplo didactico de cirugia de atencion, destilacion por capas y evaluacion con perplexity en WikiText-2, con todos los artefactos y scripts publicados.
- No recomendado para generacion en produccion, atencion al cliente, generacion de codigo ni ninguna tarea que requiera calidad linguistica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | 3158,09 |
| WikiText-2, Stage 0 (post-cirugia, sin KD) | Perplexity | 1 207 852,35 |
| WikiText-2, delta tras KD | Perplexity | -1 204 694,26 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. El autor no incluye comparacion directa con Qwen2.5-0.5B original en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (494 M parametros); los pesos de atencion publicados son 76,62 MB, pero requieren cargar el modelo base Qwen2.5-0.5B completo.
- Pico de VRAM documentado durante el entrenamiento (KD): 16 839 MB en FP16 con parametros maestros FP32.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para inferencia; para reproducir el entrenamiento se necesitan al menos 24 GB (RTX 3090, RTX 4090, A10, L4) o ajustar batch y `grad_accum`.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: el checkpoint no es un modelo Hugging Face estandar; requiere el paquete `neuralops` (`load_surgeried_model`) o el flujo manual con `apply_qwen_attention_surgery` desde `scripts.benchmarks.qwen_zoo_train_mix`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La atencion lineal deberia reducir el coste asintotico en secuencias largas, pero no hay mediciones publicadas en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2` | 494 M | no disponible (base: 32 768) | 3158,09 | MIT | Hugging Face (repo 0,1 GB) |
| `Qwen/Qwen2.5-0.5B` (base) | 494 M | 32 768 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Otros checkpoints del "NeuralOps Qwen Attention Zoo" | 494 M | no disponible | no disponible | MIT (presumible) | Hugging Face |

La comparacion con otros modulos de atencion del mismo zoo (por ejemplo variantes con atencion lineal estandar, SSM o hibridos alternativos) no esta disponible en la informacion proporcionada. No se han localizado modelos publicos equivalentes con cirugia de atencion sobre Qwen2.5-0.5B para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Calidad muy degradada: perplexity de 3158,09 en WikiText-2 frente a valores tipicos de un 0.5B bien entrenado en el rango de decenas. No apto para generacion real.
- Entrenamiento limitado a WikiText-2 y `seq_len=512`: no se ha validado en otros dominios ni en contextos largos, pese a que el modelo base soporta 32 768 tokens.
- Solo ingles declarado; el resto de idiomas de Qwen2.5 no estan garantizados y probablemente degradados.
- La model card marca `supports_rope` como `N/A`, lo que puede afectar al comportamiento posicional; conviene verificar antes de cualquier uso.
- Riesgo alto de alucinacion y degeneracion de texto por la perplexity elevada.
- No hay datos de sesgos, evaluaciones de seguridad ni filtros de contenido documentados.
- Licencia MIT declarada, permisiva para uso comercial, pero al derivar de Qwen2.5-0.5B (Apache 2.0) conviene revisar ambas licencias y los terminos del modelo base.
- Dependencia del paquete `neuralops` y de scripts auxiliares (`apply_qwen_attention_surgery`) no publicados como pip instalable estandar; la integracion con ecosistemas como vLLM, TGI o llama.cpp no esta soportada.
- Checkpoint creado y actualizado el 2026-11-11, con 319 descargas y 0 likes: proyecto de investigacion sin validacion comunitaria.
- Los pesos publicados son solo de atencion; es imprescindible descargar el modelo base para reconstruir el modelo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-svd-linear-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de referencia de Qwen2.5: no disponible en la informacion proporcionada
- Demo o blog del autor: no disponible en la informacion proporcionada

# tahamajs/qwen-2.5-0.5b-wgqa-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-wgqa-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B cuyo mecanismo de atencion ha sido sustituido quirurgicamente en 18 de sus 24 capas por un modulo propio llamado `WeightedGroupedQueryAttention` (WGQA), que anade pesos aprendibles por cabeza KV sobre Grouped-Query Attention. El objetivo es explorar atencion subcuadratica y servir de banco de pruebas reproducible para comparar variantes de atencion sobre un mismo backbone.

El checkpoint se ha recuperado mediante destilacion de conocimiento en dos etapas sobre WikiText-2, partiendo de un perplexity de 35,45 tras la cirugia y llegando a 11,85 en validacion. El modelo base Qwen2.5-0.5B tiene 0,5 mil millones de parametros, 24 capas, 14 cabezas de consulta y 2 cabezas KV con `head_dim=64` y `hidden_size=896`, y una ventana de contexto de 32 768 tokens segun la familia Qwen2.5.

Su relevancia es acotada pero clara: demuestra que es posible intercambiar el operador de atencion de un transformer preentrenado y recuperar calidad con un coste de entrenamiento minimo (440 pasos, 180,5 segundos, 15 660 MB de VRAM pico). Es material de investigacion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `wgqa_attention` + 6/24 capas de atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta 32 768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 86,28 MB); requiere el modelo base Qwen2.5-0.5B en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only causal con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una "cirugia" de atencion con patron `hybrid_3_1`: se sustituyen 18 capas por el modulo `WeightedGroupedQueryAttention`, que incorpora pesos de importancia aprendibles por cabeza KV, LoRA, soporte de KV-cache, enmascaramiento causal y expansion 14:2 de cabezas GQA. Las 6 capas restantes (indices 3, 7, 11, 15, 19 y 23) se conservan como anclas cuadraticas completas. El adaptador `QwenAttentionAdapter` gestiona el mapeo de proyecciones y el contrato de un unico `o_proj`.

El entrenamiento consiste en destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), sin datos adicionales declarados. La etapa 1 (alineacion con backbone congelado, `lm_head` desactivado) usa MSE y coseno a nivel de capa con peso 0,25 durante 133 pasos (54,3 s). La etapa 2 (destilacion de representaciones multicapa) usa MSE y coseno con peso 0,50 durante 307 pasos (125,9 s). En total, 440 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, en 180,5 segundos y con 15 660 MB de VRAM pico en FP16 con parametros maestros en FP32. El perplexity paso de 35,45 (post-cirugia, zero-shot) a 11,85 tras la destilacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles.
- Atencion con soporte causal, bidireccional y cross-attention a nivel de modulo WGQA.
- Soporte nativo de GQA y RoPE en el modulo de atencion sustituido.
- KV-cache compatible con el flujo estandar de `transformers`.
- Destilado especificamente para modelado de lenguaje sobre WikiText-2; no se declaran capacidades de codigo, matematicas, vision, audio, tool calling ni agentes.
- Multilingue: solo ingles declarado.
- No dispone de modo "thinking" ni de capacidades multimodales.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como punto de partida reproducible para comparar WGQA frente a atencion cuadratica estandar sobre un mismo backbone, cargando el checkpoint con `apply_qwen_attention_surgery`.
- Benchmark de perplexity en WikiText-2: util para validar rapidamente pipelines de evaluacion de variantes de atencion con una referencia conocida (PPL 11,85).
- Prototipado de destilacion de conocimiento: el par de etapas (alineacion con backbone congelado + destilacion multicapa) es reutilizable como receta para recuperar calidad tras modificar operadores internos.
- Docencia y experimentacion en arquitecturas de atencion: el modelo ilustra de forma tangible el patron hibrido 3:1 y el contrato de adaptador entre proyecciones Qwen2 y un modulo alternativo.
- Pruebas de integracion del ecosistema NeuralOps: valida el registro `ATTENTION_REGISTRY`, el adaptador `QwenAttentionAdapter` y la carga de pesos parciales con `strict=False`.
- Generacion de texto de baja exigencia en ingles para pruebas de humo: con 0,5 B de parametros y 86 MB de pesos de atencion, es ligero para entornos de desarrollo con una sola GPU consumer.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-wgqa-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplexity | 11,85 | No |
| qwen-2.5-0.5b-wgqa-attention-wikitext2 (Stage 0, post-cirugia) | wikitext-2-raw-v1 | Perplexity | 35,45 | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base tiene 0,5 B de parametros; en FP16 ocupa aproximadamente 1 GB de pesos, y el checkpoint de atencion anade 86,28 MB. La VRAM total estimada es de 2-4 GB segun longitud de contexto y batch.
- VRAM de entrenamiento observada: 15 660 MB pico con FP16 autocast y parametros maestros FP32, `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para reproducir el entrenamiento se necesita al menos una GPU de 16 GB (por ejemplo, RTX 4090, A100 o H100).
- Cabe en GPU consumer: si, en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060 y superiores).
- Opciones de despliegue: el flujo documentado usa `transformers` con `apply_qwen_attention_surgery` del repositorio NeuralOps; no se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-wgqa-attention-wikitext2 | 0,5 B | no disponible | 11,85 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32 768 tokens | no disponible en la informacion | Apache 2.0 (modelo base) | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de investigacion: no se declara validacion fuera de WikiText-2 ni evaluacion en tareas downstream.
- Entrenado unicamente en ingles; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- Riesgo elevado de alucinacion y degradacion fuera del dominio de WikiText-2, dado el limitado volumen de destilacion (440 pasos).
- Los pesos publicados son solo de atencion (`attention_weights.safetensors`); es obligatorio descargar el modelo base Qwen2.5-0.5B y aplicar la cirugia antes de cargarlos.
- Requiere la libreria `neuralops` y el repositorio NeuralOps para el adaptador y la funcion de cirugia; no es compatible de forma directa con `AutoModelForCausalLM.from_pretrained` sin ese paso previo.
- El resultado de perplexity no esta verificado (`verified: false` en el model-index).
- Sin datos publicados sobre sesgos, seguridad o robustez adversarial.
- Licencia MIT para el checkpoint, pero conviene revisar la licencia del modelo base Qwen2.5-0.5B antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-wgqa-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

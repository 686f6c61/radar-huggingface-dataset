# stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound

## Resumen

Nanbeige4.3-33B-Base-W8A16-AutoRound es una cuantizacion de 8 bits del modelo denso Nanbeige 4.3 33B Base, publicado por el desarrollador independiente stuchapin sobre el checkpoint original de Nanbeige (lanzado el 24 de octubre de 2026). El objetivo es reducir la huella de memoria del modelo original en BF16 (unos 65 GB) hasta aproximadamente 33,5 GiB manteniendo una fidelidad practicamente identica a la del modelo sin cuantizar, con una perdida de perplexity inferior a 0,01 puntos en WikiText-2.

El modelo base es un transformer denso de 33.000 millones de parametros con arquitectura LlamaForCausalLM, atencion GQA (56 cabezas de consulta y 8 de clave-valor) y una ventana de contexto nativa de 128.000 tokens. Esta pensado para generacion de texto, razonamiento y uso como agente, con soporte para chino e ingles. La cuantizacion emplea Intel AutoRound v0.15.1 con precision simetrica INT8 en pesos (W8A16), empaquetada en formato GPTQ y calibrada con 256 turnos reales de produccion multi-turno.

La relevancia de este checkpoint es practica: permite desplegar un modelo de 33B con contexto completo de 128k en configuraciones de doble GPU consumer de 24 GB (RTX 3090 o 4090) mediante tensor parallelism TP=2, o en una unica GPU de 48-80 GB (A6000, A100, H100, RTX 6000 Ada). Con aproximadamente 16,8 GiB por tarjeta en TP=2, quedan unos 7,5 GiB libres por GPU para cache KV en FP8 y contextos profundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso, GQA) |
| Parametros totales | 33.000 millones (dato de model card); 10.374.999.040 segun safetensors del repo |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (nativo) |
| Tipos de cuantizacion | INT8 simetrica W8A16 (AutoRound GPTQ); familia disponible en W3A16, W4A16 y W8A16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | nanbeige-license (other) |
| Formato de pesos | safetensors, GPTQ (auto_round:auto_gptq) |
| Cabezas de atencion | 56 query, 8 key-value (GQA) |
| Dimension oculta | 7.168 |
| Dimension intermedia | 22.016 |
| Numero de capas | 52 |
| Tokenizer | SentencePiece, vocabulario de 166.912 |
| Tamano del repo | 36,2 GB |
| VRAM de pesos | ~33,5 GiB |
| Herramienta de cuantizacion | Intel AutoRound v0.15.1 |
| Calibracion | 256 turnos reales de produccion multi-turno |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B con arquitectura LlamaForCausalLM. Usa Grouped-Query Attention con 56 cabezas de consulta y solo 8 de clave-valor, lo que reduce el coste de la cache KV en contextos largos, algo relevante dado que la ventana nativa alcanza los 128.000 tokens. La red tiene 52 capas, dimension oculta de 7.168 y dimension intermedia de 22.016, con tokenizer SentencePiece de 166.912 entradas. Los detalles sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada.

La innovacion de este checkpoint concreto esta en el proceso de cuantizacion. Se aplica AutoRound v0.15.1 con precision simetrica INT8 en pesos y activaciones en 16 bits (W8A16), empaquetado en GPTQ. La calibracion se realizo con 256 turnos reales de una flota de produccion multi-turno, lo que segun el autor protege cabezas de atencion criticas y proyecciones del router frente a la degradacion por cuantizacion. El resultado declarado es una perplexity en WikiText-2 inferior a 3,86 frente a los ~3,85 del BF16, es decir, una retencion superior al 99,5%. El checkpoint es compatible con vLLM y con aceleracion Marlin INT8 en tensor cores para inferencia por lotes de alto throughput.

## Capacidades

- Generacion de texto autoregresiva en chino e ingles con calidad cercana al modelo BF16.
- Razonamiento y capacidades de agente, segun los tags del repositorio (agent, reasoning).
- Soporte de conversacion multi-turno, con calibracion realizada sobre turnos reales de produccion.
- Manejo de contextos largos de hasta 128.000 tokens de forma nativa.
- Compatibilidad con vLLM y text-generation-inference para despliegue en servidor.
- Inferencia por lotes acelerada mediante Marlin INT8 en GPUs Ampere y posteriores.
- Capacidades de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; el modelo es solo de texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno largas y coherentes gracias a su ventana de 128k tokens, lo que permite incluir historial extenso, politicas de la empresa y documentacion de producto en el mismo contexto sin truncar.
- Analisis de documentos extensos en chino e ingles: resumen, extraccion de entidades y respuesta a preguntas sobre contratos, informes tecnicos o expedientes que superen las decenas de miles de tokens, aprovechando el contexto nativo completo en la variante W8A16.
- Generacion y revision de codigo en pipelines internos: aunque no se documenta tool calling, el modelo puede integrarse en flujos de revision de parches o generacion de tests donde se requiera contexto amplio de repositorio, desplegado en vLLM con batching.
- Despliegue en infraestructura de doble GPU consumer: equipos con dos RTX 3090 o 4090 pueden servir el modelo con TP=2 y unos 16,8 GiB por tarjeta, habilitando prototipos de agentes o asistentes internos sin acceso a GPUs de datacenter.
- Servicio de inferencia de alta fidelidad en produccion: entornos donde no se tolera degradacion de calidad pueden usar esta variante W8A16 como referencia casi lossless, con menos de 0,01 puntos de delta de perplexity frente a BF16.
- Procesamiento por lotes de corpus bilingues: clasificacion, etiquetado y generacion de resumenes sobre grandes volumenes de texto en chino e ingles con throughput elevado gracias a Marlin INT8 y al soporte de vLLM.
- Investigacion sobre cuantizacion: sirve como punto de comparacion de fidelidad frente a las variantes W4A16 y W3A16 del mismo autor, permitiendo medir el impacto de la precision en tareas concretas.

## Benchmarks y rendimiento

Los datos disponibles son de perplexity en WikiText-2 (100.000 tokens, sliding window con seqlen=2048 y stride=512, hardware NVIDIA Ampere), no de benchmarks de tareas como MMLU o HumanEval.

| Modelo | Formato | Hardware objetivo | VRAM de pesos | PPL WikiText-2 | Retencion vs BF16 |
|---|---|---|---|---|---|
| Full BF16 (base) | BF16 | Quad RTX 3090 / A100 | 65,0 GiB | ~3,85 (referencia) | 100,0% |
| W8A16 (este checkpoint) | AutoRound GPTQ simetrico | Dual 24 GB (TP=2) / 48 GB | 33,5 GiB | < 3,86 (delta < 0,01) | > 99,5% |
| W4A16 | AutoRound GPTQ / Marlin | Single 24 GB (3090/4090) | 19,3 GiB | 3,943 (delta +0,09) | 98,8% |
| W3A16 | AutoRound GPTQ simetrico | 16 GB (4080/T4) o 24 GB con 32k+ contexto | 14,5 GiB | 5,336 (delta +1,48) | 93,0% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para pesos: ~33,5 GiB en W8A16; ~19,3 GiB en W4A16; ~14,5 GiB en W3A16.
- Configuracion recomendada: dos GPUs de 24 GB (RTX 3090 o 4090) con TP=2, usando ~16,8 GiB por tarjeta y dejando ~7,5 GiB por GPU para cache KV en FP8 y contextos de 32k a 128k.
- GPUs de una sola tarjeta: A6000, A100, H100 o RTX 6000 Ada con 48 GB u 80 GB para contexto completo de 128k.
- GPU consumer: no cabe en una unica tarjeta de 24 GB en esta variante W8A16; para eso estan las variantes W4A16 (single 24 GB) y W3A16 (16 GB).
- Motores de despliegue: vLLM (con soporte de Marlin INT8), text-generation-inference y transformers; llama.cpp u Ollama no estan mencionados en la informacion disponible.
- Throughput y latencia: no se publican cifras de throughput para W8A16; para W4A16 el autor indica un punto dulce de 39,6 tok/s en contexto de 8k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / VRAM | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-Base W8A16 (este) | 33B denso | 128k | GPTQ INT8, 33,5 GiB | nanbeige-license | Fidelidad > 99,5% vs BF16 |
| Nanbeige4.3-33B-Base W4A16 | 33B denso | 128k (practico 8k en 24 GB) | GPTQ/Marlin, 19,3 GiB | nanbeige-license | 98,8% de fidelidad, cabe en una RTX 3090/4090 |
| Nanbeige4.3-33B-Base W3A16 | 33B denso | 128k (practico 32k+ en 24 GB) | GPTQ INT8, 14,5 GiB | nanbeige-license | 93,0% de fidelidad, para 16 GB |
| Nanbeige4.3-33B-Base BF16 | 33B denso | 128k | BF16, 65,0 GiB | nanbeige-license | Referencia sin cuantizar |

No se dispone de datos de benchmarks de tareas que permitan comparar con modelos de otros desarrolladores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "nanbeige-license" (other), distinta de licencias permisivas como Apache 2.0 o MIT; es necesario revisar el texto enlazado antes de cualquier uso comercial.
- El modelo solo soporta chino e ingles de forma declarada; el rendimiento en castellano no esta documentado y podria degradarse.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en la model card.
- La calibracion de la cuantizacion se hizo con turnos de una flota de produccion concreta; su comportamiento en dominios muy distintos puede diferir del reportado.
- Aunque la perdida de perplexity es minima, la cuantizacion INT8 puede afectar tareas sensibles a precision numerica (matematicas, razonamiento de varios pasos) de forma no medida en los benchmarks disponibles.
- Existe una discrepancia entre los 33.000 millones de parametros declarados en la model card y los 10.374.999.040 registrados en safetensors; conviene verificar el checkpoint antes de desplegarlo.
- No hay datos publicados sobre sesgos, tool calling, rendimiento en agentes multi-paso ni latencia en esta variante.
- El repositorio tiene 0 likes y 1.200 descargas, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W8A16-AutoRound
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- Licencia del modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base/blob/main/LICENSE
- Variante W4A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W4A16-AutoRound
- Variante W3A16: https://huggingface.co/stuchapin/Nanbeige4.3-33B-Base-W3A16-AutoRound
- vLLM: https://github.com/vllm-project/vllm
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext-2-raw-v1

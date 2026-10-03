# spahbod/smollm2-dus-40l

## Resumen

SmolLM2-dus-40l es un modelo de lenguaje causal experimental derivado de HuggingFaceTB/SmolLM2-135M mediante una tecnica de Depth Up-Scaling (DUS). El autor, spahbod, tomo la arquitectura original de 30 capas decoder y la expandio a 40 capas combinando dos cortes solapados del modelo base (capas 0-19 y capas 10-29), pasando de 134.515.008 a 169.915.968 parametros, un incremento del 26,32%. El resultado es un repositorio completo (no un adaptador LoRA) bajo licencia Apache 2.0.

El objetivo del experimento es estudiar como responde un modelo compacto al aumento de profundidad y si un ajuste posterior mediante continued pretraining recupera y mejora el rendimiento perdido. Para ello el autor aplico continued causal language modeling sobre WikiText-2 (configuracion wikitext-2-raw-v1), con bloques de 256 tokens y precision FP16.

La relevancia del modelo es metodologica mas que practica: ilustra un fenomeno de sobreajuste al corpus de continuacion, con mejora clara en perplejidad de WikiText-2 (de 26,14 a 16,37) pero degradacion en benchmarks externos como HellaSwag, LAMBADA y PIQA. No es un modelo instruct ni de chat, y esta pensado para investigacion sobre DUS y perdida catastrofica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 169.915.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos complementarios de arquitectura aportados por el autor:

| Propiedad | Modelo base | Modelo DUS |
|---|---:|---:|
| Capas decoder | 30 | 40 |
| Parametros | 134.515.008 | 169.915.968 |
| Parametros anadidos | — | 35.400.960 |
| Incremento de parametros | — | 26,32% |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura LlamaForCausalLM del base y solo modifica la profundidad. La expansion se construye a partir de dos slices solapados: el primer slice copia las capas de origen 0-19 y el segundo copia las capas 10-29. Las capas duplicadas contienen tensores de parametros independientes, de modo que el modelo final tiene 40 capas con pesos propios en cada una. Tras el DUS, la perplejidad en WikiText-2 empeora inicialmente (de 26,14 a 33,34), lo que refleja la desadaptacion de la nueva topologia.

El entrenamiento consistio en continued causal language modeling sobre Salesforce/wikitext, configuracion wikitext-2-raw-v1, con block size de 256 tokens, precision FP16, optimizador 8-bit AdamW, scheduler de learning rate coseno, gradient checkpointing y early stopping activados. El run estaba configurado para cinco epocas pero se detuvo automaticamente alrededor de la epoca 1,37 al dejar de mejorar la perdida de validacion. Todo el experimento se ejecuto en una unica GPU de consumo, una NVIDIA GeForce RTX 3050 Laptop con 4 GB de VRAM, por lo que no se trata de un entrenamiento a gran escala. No se menciona uso de RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Generacion de texto causal autoregresiva en ingles: el modelo completa secuencias segun el objetivo de modelado de lenguaje, sin formato instruct.
- Modelado de lenguaje y estimacion de perplejidad: util para experimentos de evaluacion intrinseca sobre corpus tipo WikiText.
- Razonamiento sobre corpus en ingles: capacidad limitada y no verificada mas alla de las tareas de los benchmarks reportados (HellaSwag, LAMBADA, PIQA).
- Tool calling / function calling: no soportado; no hay indicios de entrenamiento para ello.
- Agentes y razonamiento multi-paso: no soportado de forma nativa.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Capacidades especiales: no dispone de modo thinking, vision ni audio. No es un modelo de chat.

## Casos de uso

- Investigacion sobre Depth Up-Scaling: el modelo sirve como referencia reproducible para estudiar como afecta la duplicacion de capas a la perplejidad y a la generalizacion, comparando las tres etapas (base, tras DUS y tras continued pretraining).
- Estudio de perdida catastrofica: al mostrar mejora in-domain y degradacion out-of-domain, es un caso de analisis para medir olvido tras un ajuste sobre un corpus pequeno.
- Experimentos de continued pretraining en hardware humilde: el run completo cupo en una RTX 3050 Laptop de 4 GB, por lo que sirve como plantilla de bajo coste para replicar pipelines de entrenamiento.
- Evaluacion de harness: util para probar integraciones con lm-evaluation-harness en modo zero-shot sobre modelos muy pequenos.
- Prototipado de generacion de texto en ingles: puede usarse para generar texto de relleno o demos en contextos donde no se requiera precision factual.
- Docencia y formacion: adecuado como ejemplo didactico de manipulacion de arquitecturas transformer en PyTorch y transformers.
- Pruebas de infraestructura de inferencia: por su tamano reducido permite validar pipelines de despliegue (transformers, TGI) sin consumo relevante de recursos.

## Benchmarks y rendimiento

Resultados en WikiText-2 (perdida y perplejidad):

| Etapa del modelo | Loss | Perplejidad |
|---|---:|---:|
| Modelo base | 3,2635 | 26,14 |
| Inmediatamente tras DUS | 3,5069 | 33,34 |
| Tras continued pretraining | 2,7956 | 16,37 |

Resultados en benchmarks externos (lm-evaluation-harness, zero-shot):

| Benchmark | Metrica | Modelo base | Modelo DUS |
|---|---|---:|---:|
| HellaSwag | acc_norm | 0,4312 | 0,4125 |
| LAMBADA OpenAI | acc | 0,4283 | 0,3775 |
| LAMBADA OpenAI | perplexity | 19,2598 | 27,4383 |
| PIQA | acc_norm | 0,6844 | 0,6518 |

El autor senala que, pese a la mejora en WikiText-2, el modelo DUS rinde peor en los tres benchmarks externos, lo que sugiere una fuerte adaptacion al dataset de continuacion y una reduccion de la generalizacion.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 340 MB solo para pesos, mas overhead de activaciones y cache; en la practica cabe holgadamente en GPUs de 4 GB.
- VRAM estimada en FP32: aproximadamente 680 MB para pesos.
- Cabe en cualquier GPU de consumo: el propio autor entreno en una RTX 3050 Laptop de 4 GB. Tambien es viable en GPUs integradas y en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.); no requiere A100 ni H100.
- Despliegue: la model card proporciona ejemplos con transformers (AutoModelForCausalLM) tanto en CUDA como en CPU (con torch_dtype=torch.float32). El tag text-generation-inference y endpoints_compatible indican compatibilidad con TGI. No se publican pesos GGUF, por lo que el uso con llama.cpp u Ollama requeriria una conversion previa no documentada.
- Latencia y throughput: no disponibles. El autor no reporta medidas de rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Capas decoder | Contexto | Licencia | Notas |
|---|---:|---:|---|---|---|
| spahbod/smollm2-dus-40l | 169.915.968 | 40 | no disponible | apache-2.0 | Version DUS con continued pretraining; peor en benchmarks externos que el base |
| HuggingFaceTB/SmolLM2-135M | 134.515.008 | 30 | no disponible | apache-2.0 | Modelo base; mejor HellaSwag, LAMBADA y PIQA segun los datos del autor |
| HuggingFaceTB/SmolLM2-360M | no disponible | no disponible | no disponible | apache-2.0 | Miembro de la familia SmolLM2 (135M, 360M, 1.7B); specs no detalladas en la informacion disponible |
| HuggingFaceTB/SmolLM2-1.7B | no disponible | no disponible | no disponible | apache-2.0 | Miembro de mayor tamano de la familia SmolLM2; specs no detalladas en la informacion disponible |

Comparativa de rendimiento entre el modelo DUS y su base en los benchmarks reportados:

| Benchmark | Base | DUS | Diferencia |
|---|---:|---:|---:|
| WikiText-2 perplexity | 26,14 | 16,37 | mejora de 9,77 puntos |
| HellaSwag acc_norm | 0,4312 | 0,4125 | empeora 0,0187 |
| LAMBADA OpenAI acc | 0,4283 | 0,3775 | empeora 0,0508 |
| PIQA acc_norm | 0,6844 | 0,6518 | empeora 0,0326 |

## Limitaciones y advertencias

- El continued pretraining se realizo sobre WikiText-2, un corpus relativamente pequeno, lo que provoca una adaptacion excesiva a ese dominio.
- Las mejoras en perdida y perplejidad de WikiText-2 no se trasladan a HellaSwag, LAMBADA ni PIQA, donde el modelo empeora respecto al base.
- Riesgo elevado de sobreajuste y de olvido catastrofico (catastrophic forgetting) de capacidades del modelo original.
- Puede generar texto incorrecto, sesgado o incoherente; no debe usarse como fuente factual.
- No es un modelo instruct ni de chat: no esta alineado con preferencias humanas ni optimizado para seguir instrucciones.
- Solo soporta ingles segun la model card; sin capacidades multilingues declaradas.
- La longitud de contexto no esta especificada en la informacion disponible, lo que impide garantizar comportamiento en secuencias largas.
- El experimento se hizo en una unica GPU de consumo y no constituye un entrenamiento a gran escala; los resultados no son extrapolables a modelos mayores.
- La licencia Apache 2.0 permite uso comercial, pero dada la degradacion en benchmarks externos no se recomienda su uso en produccion.
- No se ofrecen pesos cuantizados ni formato GGUF; el despliegue en runtimes ligeros requeriria conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spahbod/smollm2-dus-40l
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Codigo de reproducibilidad (GitHub): https://github.com/s25132/smollm2-dus
- Coleccion SmolLM2 de HuggingFaceTB: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Repositorio oficial SmolLM/SmolVLM en GitHub: https://github.com/huggingface/smollm
- Dataset WikiText de Salesforce: https://huggingface.co/datasets/Salesforce/wikitext
- EleutherAI Language Model Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness

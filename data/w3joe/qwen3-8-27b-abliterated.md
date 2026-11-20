# w3joe/Qwen3.8-27B-abliterated

## Resumen
Qwen3.8-27B-abliterated es una variante "abliterated" (sin censura) del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario w3joe en Hugging Face. El modelo conserva la arquitectura y los pesos del modelo base de Alibaba Qwen (familia Qwen3.8, tag interno `qwen3_5`), con 27.356.728.560 parametros totales y una pipeline de image-text-to-text, lo que indica capacidad de entrada de imagen y texto. La modificacion se ha realizado mediante una tecnica denominada "Two-Pass Whitened-SVD, Norm-Preserving Abliteration", que edita selectivamente matrices de las 64 capas para reducir el comportamiento de rechazo sin reentrenar.

El interes practico de esta ficha radica en que el autor publica una evaluacion comparativa relativamente rigurosa (1.438 items, mismo hardware GB10/DGX Spark, decodificacion greedy) frente al modelo base y a otras dos ablations publicas de 27B (Huihui y OBLITERATUS). Segun esos datos, esta version mantiene una capacidad media del 67,34% (frente al 66,55% del base) y reduce la tasa de rechazo ante prompts daninos del 99,33% al 12,33%, con una deriva KL benigna de 0,0614. Es, por tanto, una opcion orientada a retener capacidad y no a maximizar la complacencia.

El modelo esta pensado para desarrolladores que necesitan un modelo multimodal de ~27B sin las restricciones de rechazo del base, con licencia Apache 2.0 y pesos en safetensors. Ahora bien, la model card es honesta sobre sus limites: no es la abliteration mas complaciente ni la de menor deriva, y su rendimiento en algunos benchmarks queda por debajo de alternativas como Huihui u OBLITERATUS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.8, tag `qwen3_5`); incluye encoder visual (`model.visual.*`) y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `--max-model-len 32768` |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en los ejemplos) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un fine-tune del base Qwen/Qwen3.8-27B, por lo que hereda su arquitectura transformer multimodal: un tronco de lenguaje de ~27B parametros, un encoder visual (`model.visual.*`, 333 tensores) y una cabeza MTP (`mtp.*`) para decodificacion especulativa o prediccion multi-token. La intervencion del autor no es un reentrenamiento: es una edicion de pesos mediante "Two-Pass Whitened-SVD, Norm-Preserving Abliteration", que identifica direcciones de rechazo en las matrices de las 64 capas y las proyecta fuera preservando la norma. Segun la model card, los 333 tensores del encoder visual y la cabeza MTP quedan bit-identicos al base, de modo que las capacidades de vision y la decodificacion especulativa no se ven alteradas por la abliteration.

No se detallan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si se documenta es el proceso de evaluacion del checkpoint: 1.438 items en total (938 de capacidad, 300 prompts daninos y 200 benignos), evaluados en un NVIDIA GB10 (DGX Spark) en bfloat16 con decodificacion greedy (`do_sample=False`) y el mismo harness `lm-evaluation-harness`. El autor publica ademas un mapa de 64 capas con las matrices editadas en cada pasada y seis checkpoints intermedios en un Space interactivo.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles y chino.
- Entrada multimodal image-text-to-text: procesa imagenes junto con texto (encoder visual intacto respecto al base).
- Razonamiento y matematicas: evaluado en MMLU, MMLU-Pro y GSM8K con resultados cercanos al base.
- Seguimiento de instrucciones: evaluado con IFEval (64,06% prompt-level strict), el mejor entre los checkpoints de baja deriva segun el autor.
- Decodificacion especulativa mediante la cabeza MTP heredada del base (bit-identica).
- Comportamiento "uncensored": reduce drasticamente el rechazo ante prompts daninos (del 99,33% al 12,33%).
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible.
- Soporte de agentes y multi-step reasoning: no se detalla explicitamente; el base pertenece a la familia Qwen3.8, pero no hay confirmacion en la model card.
- Modo thinking: no se documenta explicitamente, aunque el ejemplo de vLLM usa `--reasoning-parser qwen3`, lo que sugiere soporte de razonamiento estructurado en el base.

## Casos de uso
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible para medir el trade-off entre reduccion de rechazo y retencion de capacidad, gracias a los seis checkpoints publicados y al mapa de capas editadas.
- Evaluacion comparativa de tecnicas de edicion de pesos: util para replicar el harness (938 items de capacidad, 300 daninos, 200 benignos) y comparar con Huihui u OBLITERATUS en el mismo hardware.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que aborde temas sensibles sin los rechazos del base, manteniendo un 67,34% de capacidad media.
- Asistente conversacional multimodal en ingles o chino: al conservar el encoder visual, puede describir y razonar sobre imagenes en entornos donde se requiera menor censura (por ejemplo, analisis de contenido para moderacion interna).
- Despliegue en una sola GPU de 80-96 GB: con pesos BF16 (~54 GB) cabe en una H100 80 GB o un GB10/DGX Spark, lo que permite servir un modelo multimodal de 27B en una unica maquina.
- Experimentacion con decodificacion especulativa: al mantener la cabeza MTP intacta, es adecuado para probar tecnicas de aceleracion por prediccion multi-token sin reentrenar.
- Base para fine-tunes posteriores: al estar en safetensors y transformers con licencia Apache 2.0, se puede partir de el para ajustes especificos de dominio conservando la reduccion de rechazo.

## Benchmarks y rendimiento
Datos publicados por el autor, evaluados en NVIDIA GB10 (DGX Spark), bfloat16, greedy decoding, mismo harness y mismos splits. 1.438 items por modelo.

| Metrica / Benchmark | Items | Base Qwen3.8-27B | Qwen3.8-27B-abliterated (v2) | Ours Iter 1→2 | Ours Iter 1 | Huihui-Qwen3.8-27B | OBLITERATUS-Qwen3.8-27B-V3 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Tasa de rechazo danino ↓ | 300 | 99,33% (298/300) | 12,33% (37/300) | 5,67% (17/300) | 37,67% (113/300) | 1,00% (3/300) | 0,00% (0/300) |
| Sobre-rechazo benigno ↓ | 200 | 2,50% (5/200) | 1,50% (3/200) | 1,00% (2/200) | 1,50% (3/200) | 1,50% (3/200) | 0,00% (0/200) |
| KL benigna next-token ↓ | 200 | 0,0000 | 0,0614 | 0,0621 | 0,0197 | 0,0400 | 1,3821 |
| MMLU (0-shot) ↑ | 570 | 81,93% (467/570) | 82,63% (471/570) | 82,28% (469/570) | 81,93% (467/570) | 82,11% (468/570) | 83,51% (476/570) |
| GSM8K (5-shot, strict) ↑ | 128 | 87,50% (112/128) | 85,16% (109/128) | 85,16% (109/128) | 65,63% (84/128) | 87,50% (112/128) | 67,97% (87/128) |
| MMLU-Pro (5-shot) ↑ | 112 | 36,61% (41/112) | 37,50% (42/112) | 34,82% (39/112) | 13,39% (15/112) | 41,07% (46/112) | 30,36% (34/112) |
| IFEval (prompt-level strict) ↑ | 128 | 60,16% (77/128) | 64,06% (82/128) | 56,25% (72/128) | 55,47% (71/128) | 55,47% (71/128) | 67,19% (86/128) |
| Capacidad media ↑ | 938 | 66,55% | 67,34% (+0,79 pp) | 64,63% (−1,92 pp) | 54,10% (−12,44 pp) | 66,54% (−0,01 pp) | 62,26% (−4,29 pp) |
| Total correctas ↑ | 938 | 697 | 704 | 689 | 637 | 697 | 683 |

Notas del autor: la capacidad media es la media no ponderada de MMLU, GSM8K, MMLU-Pro e IFEval; GSM8K y MMLU-Pro usan hasta 512 tokens generados; un item de GSM8K o IFEval equivale a 0,78 pp (N=128) y uno de MMLU-Pro a 0,89 pp (N=112), por lo que diferencias de pocos puntos estan dentro del ruido de muestreo; no se publican intervalos de confianza. Las tasas de rechazo cuentan rechazos por coincidencia de palabras clave en completaciones cortas (64 tokens nuevos) sobre prompts held-out.

## Requisitos de hardware
- Pesos BF16: aproximadamente 54 GB (repo de 55,6 GB en safetensors).
- VRAM estimada para inferencia: ~54 GB en BF16 solo para pesos; con contexto moderado y cache KV se recomienda una GPU de 80-96 GB.
- GPU recomendadas: NVIDIA H100 80 GB o GB10 / DGX Spark (usado por el autor) para una sola GPU; para contextos largos o GPUs menores, usar tensor parallelism.
- Cabe en consumer GPU: no en BF16 con una sola RTX 4090 (24 GB). No se documentan cuantizaciones (GGUF, AWQ, GPTQ) en la informacion disponible, por lo que no se puede confirmar su viabilidad en consumer.
- Opciones de despliegue: vLLM (servidor compatible con OpenAI, con `--reasoning-parser qwen3`), Ollama, LM Studio, DGX Spark y HF Inference Providers (mencionados en el Space del autor). Tambien transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Capacidad media (938 items) | Rechazo danino | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3.8-27B-abliterated (este) | 27,36 B | no disponible | 67,34% | 12,33% | apache-2.0 | HF, safetensors |
| Qwen/Qwen3.8-27B (base) | 27,36 B | no disponible | 66,55% | 99,33% | apache-2.0 | HF |
| Huihui-Qwen3.8-27B | no disponible | no disponible | 66,54% | 1,00% | no disponible | HF (abliteration publica) |
| OBLITERATUS-Qwen3.8-27B-V3 | no disponible | no disponible | 62,26% | 0,00% | no disponible | HF (abliteration publica) |

Diferencias clave segun los datos del autor: Huihui es mas complaciente (1,00% de rechazo) y lidera MMLU-Pro (41,07%) y GSM8K (87,50%), pero pierde en IFEval (55,47% frente a 64,06%). OBLITERATUS elimina por completo el rechazo y lidera MMLU (83,51%) e IFEval (67,19%), pero sufre una deriva KL 22,5 veces mayor (1,3821) y cae a 67,97% en GSM8K. Este checkpoint es el que mejor equilibra capacidad media y baja deriva, pero no es el mas complaciente.

## Limitaciones y advertencias
- No es la abliteration mas complaciente: mantiene un 12,33% de rechazos residuales (37/300), frente al 1,00% de Huihui y el 0,00% de OBLITERATUS. Si se necesita casi cero rechazo, Huihui es mas adecuada.
- No gana todos los benchmarks: Huihui supera en MMLU-Pro (41,07% vs 37,50%) y GSM8K (87,50% vs 85,16%); OBLITERATUS lidera MMLU e IFEval pero con mucha mayor deriva.
- No es la edicion de menor deriva: Huihui (0,0400) y el Iter 1 del autor (0,0197) tienen menor KL benigna que este checkpoint (0,0614).
- Riesgo de alucinacion: no se publican metricas de factualidad ni de calibracion; como cualquier modelo de ~27B, puede inventar datos, especialmente en temas especializados.
- Sesgos: no se documenta una evaluacion de sesgos; al derivar del base Qwen, hereda los sesgos de sus datos de entrenamiento (no detallados).
- Limitaciones de idioma: solo se declaran en y zh; el rendimiento en castellano no esta evaluado ni garantizado.
- Ruido de muestreo: los benchmarks tienen N pequeno (112-570 items) y el autor no publica intervalos de confianza; diferencias de pocos puntos no son significativas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir politicas de plataformas o legislacion local; la responsabilidad del filtrado recae en el desplegador.
- Despliegue: sin cuantizaciones publicadas, el uso en consumer GPU queda limitado; en BF16 requiere 80-96 GB de VRAM.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de los resultados del autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/w3joe/Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Space interactivo (Benchmark Lab, mapa de 64 capas, snippets de despliegue): https://huggingface.co/spaces/w3joe/Qwen3.8-27B-abliterated
- Resultados crudos de benchmarks: `./benchmarks/summary_27b_complete.json` (dentro del repositorio del modelo)
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.

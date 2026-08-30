# xv0y5ncu/Qwen3.8-27B-GLQ-trellis-3inst-4bpw

## Resumen

El modelo `xv0y5ncu/Qwen3.8-27B-GLQ-trellis-3inst-4bpw` es una cuantización GLQ (4.0 bits/peso) del modelo multimodal denso Qwen3.8-27B de Alibaba, publicada por el usuario xv0y5ncu. GLQ (Golay/Leech Quantization) combina trellis-coded quantization (TCQ, variante QTIP 3inst), transformada de Hadamard aleatorizada (RHT) y LDLQ para mantener los pesos comprimidos en memoria y decodificarlos sobre la marcha mediante kernels CUDA fusionados. El resultado es un checkpoint de 16.68 GiB que conserva una calidad cercana al modelo en bf16 (perplejidad 7.06 frente a 7.02 en WikiText-2) y que se sirve exclusivamente a través de vLLM.

La relevancia de este modelo radica en que permite ejecutar un Qwen3.8-27B (originalmente 50.22 GiB en bf16) en GPUs de consumo con 24 GB de VRAM, manteniendo un rendimiento competitivo en tareas de razonamiento y código. Está pensado para servir endpoints OpenAI-compatibles para agentes de programación como pi-code u opencode, y su licencia Apache 2.0 facilita su uso comercial. La cuantización está calibrada con 128 muestras de WikiText-2 (2048 tokens cada una) y alcanza un SQNR medio de 22.00 dB sobre 400 capas cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con decoder hibrido GatedDeltaNet (Qwen3.8-27B) cuantizado con GLQ (trellis-coded quantization + RHT + LDLQ) |
| Parametros totales | 9.543.004.912 (segun safetensors del repo cuantizado; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 1M segun QwenCloud, pero no confirmado para esta cuantizacion) |
| Tipos de cuantizacion | GLQ 4.0 bits/peso (4bpw), trellis-coded (QTIP TCQ variante 3inst) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con kernels CUDA fusionados (requiere glq >= 0.7.0) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un modelo de lenguaje multimodal (vision + texto) de 27B parametros, con arquitectura densa y decoder hibrido GatedDeltaNet. La cuantizacion GLQ aplica tres tecnicas combinadas: primero, una transformada de Hadamard aleatorizada (RHT) con signos aleatorios fijos que hace incoherentes los pesos y la Hessiana de calibracion, dispersando los outliers para que cuanticen mejor. Segundo, LDLQ redondea los pesos con retroalimentacion de error a traves de las dimensiones de entrada restantes, usando la factorizacion LDL de la Hessiana. Tercero, en lugar de un codebook de lattice por grupo, se usa trellis-coded quantization (TCQ, del paper QTIP, arXiv:2406.11235): cada tile de pesos de 16x16 se codifica como una secuencia Viterbi de terminacion en cola sobre un codigo trellis de dimension 256, logrando una dimension de cuantizacion efectiva mayor que un lattice 8-D al mismo bit-rate.

La calibracion se realizo con 128 muestras de 2048 tokens de WikiText-2. El checkpoint almacena el trellis en el layout de fragmentos MMA que consumen los kernels CUDA 3INST sin lookup, por lo que se requiere glq >= 0.7.0. No se menciona entrenamiento adicional ni RLHF/DPO sobre el modelo base; es una cuantizacion post-entrenamiento.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3.8-27B, incluyendo modo thinking y modo instruct, con rendimiento cercano al bf16 en tareas de razonamiento (AIME-2026: 90.4% frente a 87.9% en bf16).
- Codigo y agentes: el modelo base destaca en coding y agentic workflows; esta cuantizacion esta especificamente orientada a servirse como endpoint OpenAI-compatible para agentes como pi-code y opencode.
- Tool calling y function calling: soportado a traves del modelo base, aunque la cuantizacion no modifica esta capacidad.
- Multimodal (vision + texto): el modelo base es image-text-to-text, pero esta cuantizacion se sirve en modo solo texto (limit_mm_per_prompt={"image": 0, "video": 0, "audio": 0} en el ejemplo de vLLM). No se garantiza el funcionamiento multimodal con esta cuantizacion.
- Multilingue: no se especifican idiomas en la informacion disponible; el modelo base Qwen soporta multiples idiomas, pero no hay datos concretos para esta cuantizacion.
- Despliegue eficiente: pesos comprimidos en VRAM y decodificacion en linea mediante kernel CUDA fusionado, lo que reduce el uso de memoria sin penalizar excesivamente la velocidad (34.6 tok/s en L4 con batch 1).

## Casos de uso

- Servir un asistente de codigo local con vLLM: se puede lanzar `vllm serve xv0y5ncu/Qwen3.8-27B-GLQ-trellis-3inst-4bpw --port 8000` y conectarlo a herramientas como pi-code u opencode mediante un endpoint OpenAI-compatible. Es adecuado porque la cuantizacion mantiene un buen rendimiento en tareas de programacion y el peso reducido permite ejecutarlo en GPUs de 24 GB.
- Inferencia de texto en GPU de consumo: con 16.68 GiB de pesos, cabe en una RTX 3090/4090 (24 GB) o en una L4 (24 GB), logrando 34.6 tok/s de decodificacion con batch 1 y contexto 4096. Ideal para prototipos y despliegues de baja latencia sin necesidad de hardware de datacenter.
- Evaluacion de modelos cuantizados: al ser una cuantizacion de 4 bpw con SQNR de 22 dB, sirve para estudiar el impacto de la cuantizacion extrema en modelos multimodales grandes, comparando con bf16 y NVFP4.
- Automatizacion de oficina: el modelo base Qwen3.8-27B esta disenado para tareas de office automation (generacion de documentos, resumenes, analisis de datos). Esta cuantizacion permite ejecutar estas tareas localmente con requisitos de hardware moderados.
- Razonamiento con presupuesto de tokens largo: el modo thinking del modelo base, combinado con la cuantizacion, permite ejecutar cadenas de razonamiento de hasta 32k tokens (como en el benchmark AIME-2026) en una sola GPU, algo inviable con los pesos en bf16.
- Desarrollo de agentes multi-paso: al soportar tool calling y mantener una perplejidad cercana al original, puede integrarse en pipelines de agentes que requieran multiples llamadas a herramientas, con la ventaja de un menor footprint de memoria.

## Benchmarks y rendimiento

La model card del autor proporciona los siguientes resultados, medidos en una RTX PRO 6000 salvo indicacion contraria:

| Benchmark | Metrica | GLQ 4bpw | bf16 | NVFP4 (unsloth) |
|---|---|---|---|---|
| AIME-2026 (avg@8, thinking, 32k budget, n=30) | accuracy | 90.4% | 87.9% | 87.9% |
| AIME-2026 eval wall-clock (240 muestras, RTX PRO 6000) | duracion | 2h47m | 2h37m | 1h02m |
| WikiText-2 perplexity (128 chunks x 2048 tok) | perplexity | 7.06 | 7.02 | no disponible |
| Tamano de pesos (vLLM solo texto) | GiB | 16.68 | 50.22 | 21.8 |
| Decode, batch 1 (L4 24 GB, 4096 ctx, CUDA graphs) | tok/s | 34.6 (TTFT 66 ms) | no disponible | no disponible |

Nota: el autor indica que son mediciones de una sola ejecucion y que los resultados con n pequeno son estimaciones ruidosas. El rendimiento en AIME-2026 es practicamente un empate dentro del ruido estadistico (n=30), no una clasificacion.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 16.68 GiB en formato GLQ. Con overhead de activaciones y cache KV, se recomienda al menos 20-24 GB de VRAM para contexto de 4096 tokens.
- GPU recomendadas: RTX 3090/4090 (24 GB), L4 (24 GB), RTX PRO 6000 (usada en los benchmarks). No se requiere GPU de datacenter para inferencia basica.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de 24 GB. Para contextos mas largos (32k tokens) se necesitaria mas VRAM o gestion de cache KV.
- Opciones de despliegue: exclusivamente vLLM (version con plugin glq). No soportado en Transformers para esta arquitectura cuantizada. Tampoco se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Tensor parallelism: no soportado (GLQ trellis layers no admiten sharding TP). Se debe usar TP=1.
- Latencia y throughput: 34.6 tok/s de decodificacion con batch 1 en L4 (TTFT 66 ms). En RTX PRO 6000, el workload de 240 muestras AIME-2026 tardo 2h47m, frente a 2h37m en bf16 (un 6% mas lento) y 1h02m en NVFP4 (mucho mas rapido pero con menor calidad).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano pesos | Perplejidad WikiText-2 | AIME-2026 | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (bf16) | 27B | bf16 | 50.22 GiB | 7.02 | 87.9% | Apache 2.0 |
| Qwen3.8-27B (NVFP4 unsloth) | 27B | NVFP4 | 21.8 GiB | no disponible | 87.9% | Apache 2.0 |
| Qwen3.8-27B (GLQ 4bpw, este modelo) | 27B (9.54B en safetensors cuantizado) | GLQ 4bpw | 16.68 GiB | 7.06 | 90.4% | Apache 2.0 |

La comparativa muestra que GLQ 4bpw ofrece el menor tamano de pesos y una perplejidad casi identica al bf16, con una ligera ventaja en AIME-2026 (probablemente ruido). Frente a NVFP4, GLQ es mas lento en throughput agregado (2h47m vs 1h02m) pero mas preciso en perplejidad. No se dispone de datos de otros modelos cuantizados de tamano similar (p.ej. Llama-3.1-70B cuantizado) para una comparativa externa.

## Limitaciones y advertencias

- Solo compatible con vLLM: la arquitectura cuantizada (decoder hibrido GatedDeltaNet bajo wrapper multimodal) no esta validada en Transformers. Intentar cargarla con `transformers` fallara.
- Sin tensor parallelism: no se puede escalar a multiples GPUs con TP. Para modelos grandes en produccion, esto limita el rendimiento en entornos multi-GPU.
- Requiere glq >= 0.7.0: el checkpoint almacena el trellis en layout de fragmentos MMA; versiones anteriores no podran decodificarlo.
- Modo multimodal no garantizado: aunque el modelo base es image-text-to-text, la cuantizacion se sirve en modo solo texto. No se ha validado el procesamiento de imagenes, video o audio con estos pesos.
- Mediciones con n pequeno: los benchmarks de AIME-2026 usan n=30 y son ruidosos; las diferencias con bf16 no son estadisticamente significativas.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion puede amplificar errores en contextos largos o tareas de razonamiento complejo, aunque la perplejidad sugiere una degradacion minima.
- Sesgos: no se han evaluado sesgos especificos de esta cuantizacion; hereda los del modelo base Qwen3.8-27B.
- Contexto maximo no confirmado: la model card no especifica la longitud de contexto soportada por esta cuantizacion. El ejemplo de vLLM usa 4096, pero el modelo base soporta hasta 1M segun QwenCloud; no se garantiza que la cuantizacion mantenga esa capacidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xv0y5ncu/Qwen3.8-27B-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Codigo GLQ (GitHub): https://github.com/cnygaard/glq
- Paper QTIP (trellis-coded quantization): https://arxiv.org/abs/2406.11235
- Repositorio oficial Qwen3.8-27B (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentacion QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guia local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide

# tayaee/Raon-1-mini-preview-nvfp4-awq-vllm

), tool-call parser raon_1, reasoning parser. trunc parameter cut off ("truncate_history_thinking").

We need to be honest: many spec details (training tokens, active params) not available. Active params: not available. Though MoE with 18 RDA layers + 7 MLA layers — that's layer counts, not experts. Hmm, "18 RDA layers hold fixed-size state and only the 7 MLA layers keep KV cache" — so 25 layers total? Presumably hybrid attention: RDA (recurrent delta attention?) linear attention layers + MLA (multi-head latent attention). We can mention that as hybrid linear attention architecture, but be careful: RDA likely "Recurrent Delta Attention" (from Qwen3-Next style gated delta net?) We should say "RDA (linear attention) y MLA" as reported in the model card, without inventing the expansion of the acronym. Actually we can say "capas RDA (atención lineal) y MLA (Multi-head Latent Attention)" — MLA is a known acronym. RDA not expanded — say "RDA (linear attention)".

Numbers: parameters 15,948,648,162 ≈ 15.95B.

Benchmarks table: only base values available; quantized not measured. We can present the comparison table with base vs this model, marking "no medido". Careful not to invent.

Hardware: checkpoint 19.25 GB → VRAM ~20-24 GB for weights. Note the model card mentions GB10 (DGX Spark, 128 GB). Quantization W4A4 NVFP4 requires Blackwell (CUDA 13, torch cu130, GB10/Blackwell). NVFP4 requires Blackwell GPUs (B100/B200/GB200/GB10, RTX 5090? Blackwell consumer). We should be careful: NVFP4 support — Blackwell architecture. RTX 5090 is Blackwell (sm_120) but NVFP4 tensor core support is on data center Blackwell (sm_100) — consumer Blackwell has FP4 support too per NVIDIA specs (RTX 50 series supports FP4). I'd say "GPU Blackwell (B200/GB200, GB10, y previsiblemente RTX 50 con soporte FP4)" — but careful. Better: "se ha validado en NVIDIA GB10 (DGX Spark); requiere GPU con soporte NVFP4 (arquitectura Blackwell) y torch con CUDA 13". Mention transformers 5.14.1 requirement.

KV cache: ~8 KiB/token for MLA layers, 262K context ~2 GB.

Comparison table: compare with base BF16 Raon-1-mini-preview (53.61 GB), and maybe other quantized variants? We don't know of others. We can compare with the base model and note "no disponible" for other comparable models since we lack data. But the instruction says compare with 2-3 alternatives; if not known, say "no disponible". We could compare: base BF16 model, hypothetical other MoE ~15B... Better keep honest: table with base model + note that no other quantized variants available in info. Maybe mention that the family is comparable to other ~15-16B MoE hybrid models, but we have no data — say no disponible.

Cases of use: 6+ concrete: atención al cliente multi-turno coreano/inglés; generación de código con tool calling; agentes multi-paso con contexto largo (262K, KV cache pequeño); análisis de documentos largos en coreano; razonamiento con thinking mode (matemáticas, GSM8K 94.5% base); despliegue en un solo nodo/edge GB10 por tamaño reducido; pipelines de extracción de datos estructurados con tool calling; asistentes de investigación con RAG largo.

Limitations: benchmarks of quantized checkpoint not measured — degradation unknown (only base accuracy); Korean-first, English secondary, no Spanish officially (though probably multilingual, not documented); custom architecture requires KRAFTON vLLM fork, stock vLLM fails; NVFP4 requires Blackwell + CUDA 13 + transformers 5.14.1 + trust_remote_code; conversion errors in table (storage format FAIL, vLLM latency unmeasurable); hallucination risk; gated base repo requires auth; license Apache-2.0 permissive but base model gating/terms should be checked; minimal community adoption (0 downloads/likes), creator "tayaee" unofficial.

Also note: model card shows "Status FAIL" for storage format and vLLM serving unmeasurable — caveat for production.

Links: HF model, base model KRAFTON/Raon-1-mini-preview, vLLM fork github.com/krafton-ai/vllm, transformers, nvidia-modelopt, GSM8K dataset. Only include found links.

Note dates: created 2026-10-28 — future date; irrelevant.

Write in Spanish (Spain), no emojis, only first word of headings capitalized. Headings given in the prompt — keep as given (they use "Resumen", "Especificaciones tecnicas" — actually the prompt has accents in some: "Especificaciones tecnicas", "Arquitectura y entrenamiento", "Capacidades", "Casos de uso", "Benchmarks y rendimiento", "Requisitos de hardware", "Comparativa con modelos similares", "Limitaciones y advertencias", "Enlaces"). Use accents properly in Spanish: "Especificaciones técnicas" — the rule says only first word capitalized; accents fine. I'll write headings with proper accents: "## Especificaciones técnicas", "## Arquitectura y entrenamiento", etc.

Context length: 262144 tokens (max-model-len configurado en vLLM), usable con ~2 GB de KV cache.

Write the sheet.## Resumen

Raon-1-mini-preview-nvfp4-awq-vllm es una versión cuantizada del modelo coreano KRAFTON/Raon-1-mini-preview, publicada por el usuario `tayaee`. No es un modelo nuevo: es un checkpoint de pesos comprimidos a NVFP4 (W4A4) mediante AWQ Lite y NVIDIA ModelOpt, pensado para reducir el espacio de almacenamiento de 53,61 GB en BF16 a 19,25 GB sin reentrenar. El resultado es un modelo de generación de texto de 15.948.648.162 parámetros (~15,95 B) con arquitectura MoE híbrida de atención, licencia Apache-2.0 y soporte de coreano e inglés.

El modelo base emplea una arquitectura propia de KRAFTON que combina 18 capas RDA (atención lineal) con 7 capas MLA (Multi-head Latent Attention), lo que mantiene un estado de tamaño fijo en la mayoría de capas y limita la caché KV a unos 8 KiB por token. Eso permite servir hasta 262.144 tokens de contexto con apenas ~2 GB de caché KV, un dato relevante para despliegues de contexto largo en un único acelerador.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantización agresiva a 4 bits (formato `mopt-nvfp4`, block size 16) sobre un modelo MoE con capas personalizadas. Por otro, expone las fricciones prácticas del ecosistema: el fork de vLLM necesario no consigue cargar este checkpoint PTQ, de modo que la vía validada es `transformers` con `trust_remote_code`, y las métricas del checkpoint cuantizado no están medidas (solo las del modelo base).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con 18 capas RDA (atención lineal) y 7 capas MLA; código custom (`raon1_mini`) |
| Parámetros totales | 15.948.648.162 (~15,95 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en vLLM con `--max-model-len 262144`) |
| Tipos de cuantización | NVFP4 (E2M1), W4A4 con escala de activación FP8 dinámica, block_size=16; capas `lm_head`, `mlp.gate`, `self_attn` y `shared_experts` en BF16 |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato `mopt-nvfp4` (carga con `AutoModelForCausalLM` de `transformers`) |

Datos adicionales de la ficha del autor: revisión base `da4cf162c8613993f2189ebb438a5f9a23f3e5ca`, calibración con 256 muestras de 2.048 tokens (corpus interno de instrucciones en coreano mezclado con chat en inglés), tamaño de checkpoint 19,25 GB y tamaño del repositorio 20,7 GB.

## Arquitectura y entrenamiento

El checkpoint no aporta información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO). Lo que sí documenta es la arquitectura de inferencia: una mezcla de expertos con dos tipos de capa de atención. Las 18 capas RDA (atención lineal) mantienen un estado recurrente de tamaño fijo, mientras que las 7 capas MLA conservan caché KV real, lo que explica la cifra de ~8 KiB por token y los ~2 GB necesarios para llenar 262.144 tokens. La model card menciona además el uso de decodificación con modo de razonamiento (`enable_thinking`), con el bloque de pensamiento delimitado por `</think>`, y parsers específicos `raon_1` para razonamiento y tool calling en el fork de vLLM.

La innovación técnica de esta publicación es la cuantización. Se aplica NVFP4 con AWQ Lite sobre ModelOpt, con pesos a 4 bits y activaciones a 4 bits usando escala FP8 dinámica, agrupando en bloques de 16 elementos. Se dejan sin cuantizar `lm_head`, `mlp.gate`, `self_attn` y los `shared_experts`, que permanecen en BF16; también se mantienen en BF16 las capas de normalización. La calibración se hizo con 256 muestras de 2.048 tokens de datos de instrucciones en coreano y chat en inglés. El autor advierte de que el fork de vLLM fijado elimina el `quantization_config` de llmcompressor al inicializar el motor (`TypeError`) y de que vLLM upstream no implementa la atención lineal RDA, por lo que servir estos checkpoints PTQ exige una receta ModelOpt-NVFP4 específica.

## Capacidades

- Generación de texto conversacional multi-turno en coreano e inglés, con plantilla de chat propia (`apply_chat_template`).
- Modo de razonamiento explícito (`enable_thinking=True`) con separación entre bloque de pensamiento y respuesta final mediante el token `</think>`.
- Tool calling y function calling, con parser dedicado `raon_1` y soporte de `--enable-auto-tool-choice` en el fork de vLLM.
- Razonamiento multi-paso orientado a agentes, con `--reasoning-parser raon_1`.
- Contexto largo de hasta 262.144 tokens con coste de caché KV reducido (~2 GB), apto para documentos extensos y RAG de muchas evidencias.
- Capacidad matemática verificada en el modelo base: 94,5 % en GSM8K (189/200).
- Conocimiento específico de dominio coreano: 56,5 % en KMMLU en el modelo base.
- Cumplimiento de formato estructurado: 0,900 (9/10) en el conjunto de evaluación del autor (modelo base).
- No se documentan capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada en coreano e inglés: la ventana de 262.144 tokens y la caché KV de ~8 KiB por token permiten mantener historiales largos y múltiples documentos de producto en un solo contexto sin disparar el consumo de memoria del servidor.
- Asistentes de documentación técnica con RAG extenso: ingestar manuales completos o decenas de fragmentos recuperados y responder con citas, aprovechando que solo las 7 capas MLA generan caché KV.
- Agentes de automatización con herramientas: el soporte de function calling y el parser `raon_1` permiten encadenar llamadas a APIs internas (consulta de pedidos, ticketing, reservas) con razonamiento intermedio explícito.
- Generación y revisión de código en pipelines de CI/CD: usar el modo thinking para tareas de refactorización o explicación de errores, con la salvedad de que el modelo no publica métricas de HumanEval ni MBPP.
- Análisis de contratos y documentos legales/coreanos: clasificación, extracción de cláusulas y resumen con salida estructurada, apoyándose en el 56,5 % de KMMLU del base como referencia de conocimiento del dominio.
- Tutoría y resolución de problemas matemáticos: el 94,5 % en GSM8K del modelo base lo hace utilizable para problemas aritméticos de varios pasos, siempre con verificación posterior.
- Despliegue en un solo nodo con memoria limitada: los 19,25 GB de pesos permiten servir el modelo en una GPU de 24-32 GB o en un GB10 (DGX Spark, 128 GB) reservando el resto para KV y activaciones.
- Evaluación comparativa de cuantización: este checkpoint sirve como banco de pruebas para medir la degradación real de NVFP4 W4A4 frente al BF16 en un MoE con capas de atención personalizadas.

## Benchmarks y rendimiento

Los datos publicados corresponden al modelo base BF16. Las columnas del checkpoint cuantizado aparecen sin medir en la model card, por lo que no se puede afirmar la degradación real de esta versión.

| Métrica | Modelo base (BF16) | Este modelo (NVFP4) | Nota |
|---|---:|---:|---|
| GSM8K (n=200) | 0,945 (189/200) | no medido | umbral de caída <= 0,02 |
| KMMLU (n=200) | 0,565 (113/200) | no medido | umbral de caída <= 0,03 |
| Cumplimiento de formato | 0,900 (9/10) | no medido | umbral >= 0,9 |
| PPL en dominio | 7,702 | no medido | omitido en la comparación |
| Tamaño de checkpoint | 53,61 GB | 19,25 GB | -64 % |
| Throughput, transformers (C=1) | 4,5 tok/s | no medido | GB10, eager, misma carga fija |
| Latencia p50, transformers | 0,221 s | no medido | misma carga fija |
| Latencia fork vLLM (C=1, n=8) | 2,292 s (ok=7) | no medible | el fork no carga el `quantization_config` |

Las cifras de latencia y throughput se midieron en una única NVIDIA GB10 (DGX Spark) con `transformers` en modo eager; el propio autor advierte que son valores de referencia y deben compararse de forma relativa, no absoluta. No se han publicado resultados de benchmarks del checkpoint cuantizado en la información disponible.

## Requisitos de hardware

- VRAM para pesos: ~19,25 GB en NVFP4, más overhead de activaciones y contexto; presupuesto realista de 22-26 GB para arranque en `transformers`.
- Caché KV: ~8 KiB por token en las capas MLA, aproximadamente 2 GB para los 262.144 tokens completos con `--kv-cache-dtype fp8_e4m3`.
- GPUs recomendadas: NVIDIA GB10 (DGX Spark, configuración validada por el autor con `--gpu-memory-utilization 0.85`), B200/GB200 y, en general, cualquier GPU Blackwell con soporte NVFP4. El entorno de referencia usa `torch` con CUDA 13 (`cu130`) y `transformers==5.14.1`.
- GPU de consumo: cabe en GPUs de 24 GB o más solo si soportan NVFP4 (familia Blackwell). En arquitecturas anteriores (Ampere, Ada) el formato `mopt-nvfp4` no es utilizable de forma nativa.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía validada. Para vLLM hay que usar el fork `krafton-ai/vllm` rama `raon-1-mini-preview` con `VLLM_USE_PRECOMPILED=1`; aun así, el autor documenta que este checkpoint PTQ no se puede servir en ese fork (fallo al cargar la configuración de cuantización). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Throughput/latencia: 4,5 tok/s y 0,221 s de p50 en `transformers` eager sobre GB10 (modelo base); no hay cifras de serving validadas para el checkpoint cuantizado.
- Arranque en vLLM: la primera ejecución compila los kernels del modelo y tarda unos 10 minutos según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| tayaee/Raon-1-mini-preview-nvfp4-awq-vllm | ~15,95 B | 262.144 | NVFP4 W4A4, 19,25 GB | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| KRAFTON/Raon-1-mini-preview (base) | ~15,95 B | 262.144 (según configuración del fork) | BF16, 53,61 GB | Apache-2.0 | HuggingFace, repo con gating (aprobación automática) |
| Otras variantes cuantizadas de Raon-1-mini | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos MoE híbridos de ~15-16 B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La información disponible solo permite comparar el checkpoint cuantizado con su base BF16. No se han encontrado en el material proporcionado alternativas equivalentes con datos verificables de parámetros, contexto y rendimiento, por lo que la comparativa cruzada se marca como no disponible.

## Limitaciones y advertencias

- No hay métricas del checkpoint cuantizado: GSM8K, KMMLU, formato y perplejidad solo están medidos en el modelo base, de modo que la degradación introducida por NVFP4 W4A4 es desconocida.
- La model card reporta un estado "FAIL" en la fila de formato de almacenamiento y la latencia del fork de vLLM aparece como no medible, lo que indica que la validación del artefacto está incompleta.
- El fork de vLLM necesario elimina el `quantization_config` al inicializar el motor y vLLM upstream no implementa la atención lineal RDA: el serving en producción requiere trabajo de integración con una receta ModelOpt-NVFP4.
- Dependencia de `trust_remote_code=True` y de código custom (`raon1_mini`): implica ejecutar código del repositorio y revisar su procedencia antes de desplegar.
- Requiere GPU Blackwell y `torch` con CUDA 13; no es portable a hardware anterior sin reconvertir los pesos.
- Idiomas documentados limitados a coreano e inglés; no se declara soporte de castellano, por lo que el rendimiento en español no está garantizado ni evaluado.
- El repositorio base está sujeto a gating en HuggingFace: la descarga exige autenticación (`hf auth login`) y aceptación de las condiciones del autor original.
- Riesgo de alucinación y de fuga de razonamiento: el prompt de ejemplo usa `presence_penalty=1.5` y separa el bloque `</think>`, lo que sugiere que el contenido de pensamiento puede filtrarse si no se procesa explícitamente.
- Adopción nula (0 descargas, 0 likes) y autor sin trayectoria verificable en la información disponible: tratar el checkpoint como experimental, no como artefacto listo para producción.
- Licencia Apache-2.0 en este repositorio, pero conviene verificar los términos del modelo base KRAFTON antes de un uso comercial.
- El modo thinking con `max_new_tokens=32768` puede disparar coste y latencia si no se acota por petición.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tayaee/Raon-1-mini-preview-nvfp4-awq-vllm
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini-preview
- Fork de vLLM de KRAFTON (rama `raon-1-mini-preview`): https://github.com/krafton-ai/vllm/tree/raon-1-mini-preview
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Dataset GSM8K usado en la evaluación: https://huggingface.co/datasets/openai/gsm8k
- Transformers (versión fijada 5.14.1): https://github.com/huggingface/transformers

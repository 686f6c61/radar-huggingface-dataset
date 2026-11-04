# viai957/nano-mistral-o1-dpo-arm-a

## Resumen

nano-mistral-o1-dpo-arm-a es un checkpoint de investigación publicado por el usuario viai957 en HuggingFace, consistente en un ajuste fino por DPO (Direct Preference Optimization) sobre el modelo nano-mistral-o1-sft, que a su vez deriva de Mistral-7B-v0.3 tras un SFT sobre soluciones de PRM800K. Se trata del brazo de control (Arm A) de un experimento pre-registrado de dos brazos cuyo objetivo es aislar qué aprende DPO cuando los pares de preferencia son soluciones completas y estructuralmente distintas frente a cuando difieren en un único paso de razonamiento (Arm B). El modelo tiene 7.248.023.552 parámetros y una ventana de contexto de 32.768 tokens heredada de la arquitectura Mistral.

El resultado principal es explícitamente nulo: la precisión de preferencia en el conjunto held-out es 0,556 (IC 95 %: 0,465–0,642; n=117), indistinguible del azar (p binomial exacta = 0,27 frente a 0,5). El autor etiqueta el artefacto como "negative-result" y "research-artifact", y advierte que no es un modelo de producto. No se evaluó en GSM8K ni en MATH-500, por lo que no hay métricas de precisión de tareas para este checkpoint.

La relevancia es metodológica más que de rendimiento: documenta con receipts reproducibles un caso en el que DPO con pares de solución completa no mueve la aguja sobre la precisión de preferencia, y sirve como contraste para interpretar el brazo experimental. La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MistralForCausalLM), 32 capas, hidden size 4096, GQA con 32 cabezas de consulta y 8 de clave/valor, head_dim 128, FFN 14336, RoPE theta 1e6, sin sliding window, embeddings no atados |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Mistral-7B-v0.3; no se reporta entrenamiento específico de contexto largo) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 14.496.081.136 bytes; repo de 14,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Mistral-7B-v0.3 sin modificaciones: 32 bloques transformer con atención de consultas agrupadas (32 cabezas Q, 8 KV), dimensión de cabeza 128, FFN de 14336 y vocabulario de 32.768 tokens. Los pesos se publican en bf16 y el autor indica que fp16 no está soportado. El entrenamiento se realizó con un trainer FSDP2 propio (32 unidades por bloque más la raíz, parámetros en bf16 con reducción en fp32), checkpointing de activaciones en los 32 bloques, un kernel Triton de FlashAttention-2 (`attn_implementation=triton_fa2`) validado por paridad contra SDPA, y el optimizador bitsandbytes `adamw8bit`. No se usó DeepSpeed ni TRL.

La cadena de entrenamiento es: Mistral-7B-v0.3 → SFT sobre 12.397 filas de soluciones de PRM800K durante 1 época (checkpoint `micro_00002250`, publicado como viai957/nano-mistral-o1-sft) → DPO con pérdida sigmoide y β = 0,1 sobre 2.193 pares de preferencia matemática de `argilla/distilabel-math-preference-dpo` (revisión fijada `440a5987`). El filtrado de calidad retuvo 2.310 de 2.418 filas brutas (95,5 %) aplicando `chosen_rating − rejected_rating ≥ 1,0` y `chosen_rating ≥ 6,0`; el split final es 2.193 de entrenamiento y 117 held-out. La descontaminación por hash exacto contra GSM8K-test y MATH-500 no eliminó ninguna fila. El schedule fue de 2 épocas, 32 pares únicos por paso de optimizador, 137 pasos (548 micro-pasos × 4 rangos), lr 5e-7 con 3 % de warmup y decaimiento coseno hasta 0. El cómputo registrado fue de 4 GPUs durante unas 5,9 horas de reloj (≈23,6 GPU-h). Las log-probabilidades de referencia del SFT congelado se precalcularon; no se añadió término NLL ni DPOP.

Una particularidad documentada es el desajuste de formato: la plantilla de prompt del proyecto pide razonamiento paso a paso en párrafos separados y una sección `# Answer`, mientras que las respuestas de Argilla no siguen ese formato. El proyecto decidió medir ese desajuste en evaluación en lugar de enmascararlo en construcción; sin embargo, Arm A nunca se evaluó en generación, por lo que el efecto del desajuste no llegó a cuantificarse.

## Capacidades

- Generación de texto en inglés con la arquitectura Mistral-7B-v0.3.
- Razonamiento matemático paso a paso, inducido por el SFT sobre soluciones de PRM800K y por la plantilla de prompt que exige párrafos por paso y una sección `# Answer`.
- Ajuste de preferencias mediante DPO sigmoide, orientado a preferir respuestas matemáticas mejor valoradas según las anotaciones de Argilla.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado más allá del razonamiento matemático en la propia respuesta.
- Multilingüismo: únicamente inglés declarado; no hay evidencia de capacidades en otros idiomas.
- No se documentan capacidades de visión, audio, modo thinking explícito ni decodificación especulativa.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Estudio de ablación de DPO: usar este checkpoint como brazo de control frente a nano-mistral-o1-dpo-arm-b para aislar el efecto de la estructura de los pares de preferencia (solución completa frente a diferencia de un solo paso). Es el uso para el que fue diseñado.
- Reproducción de experimentos de alineación: el repositorio incluye receipts y un `evidence.json` que mapea cada número a su fuente, lo que permite replicar el pipeline FSDP2, el filtrado de datos y el cálculo de precisión de preferencia.
- Análisis de desajuste de formato prompt-respuesta: sirve como caso documentado para estudiar cómo una plantilla que exige pasos y `# Answer` convive con datos de preferencia que no siguen ese formato, aunque el efecto no se midió en generación.
- Docencia e investigación sobre DPO: ejemplo real de resultado nulo pre-registrado con intervalo de confianza y prueba binomial, útil para discutir potencia estadística con n=117 y tamaños de efecto pequeños.
- Base para experimentos posteriores de verificación matemática: al derivar del SFT sobre PRM800K, puede emplearse como punto de partida para pipelines de GRPO con verificador, que es la dirección que el proyecto adoptó tras cerrar la fase 1.
- Evaluación comparativa de checkpoints intermedios: permite comparar el SFT padre (`micro_00002250`) frente al checkpoint DPO (`micro_00000548`) en la misma infraestructura de inferencia, aunque las métricas de tarea de este último no estén medidas.
- Referencia negativa en revisiones de literatura: útil como cita de que DPO con pares de solución completa no garantiza mejora en precisión de preferencia bajo este régimen de datos y cómputo.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | n | Notas |
|---|---|---|---|---|
| Held-out preference accuracy (argilla/distilabel-math-preference-dpo, split held_out, revisión 440a5987) | accuracy (margen de recompensa DPO implícito > 0) | 0,5556 | 117 | IC 95 %: 0,465–0,642; p binomial exacta = 0,27 frente a 0,5; resultado pre-registrado como nulo; `verified: false` |
| GSM8K | accuracy | no medido | — | El padre SFT puntúa 0,2047 (n=1.319) |
| MATH-500 | accuracy | no medido | — | El padre SFT puntúa 0,084 (n=500) |

No se han publicado otros resultados de benchmarks en la información disponible. El autor indica explícitamente que este checkpoint nunca se evaluó en GSM8K ni en MATH-500, y que "not measured" significa no medido.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16–24 GB para contexto moderado.
- En cuantización de 8 bits, la huella de pesos bajaría a unos 7,3 GB; en 4 bits, a unos 3,6 GB, aunque el autor no publica variantes cuantizadas ni validación de las mismas.
- GPU recomendadas: A100 (40/80 GB) o H100 para bf16 con contexto largo y batch; para inferencia de un solo usuario, RTX 4090 (24 GB) es suficiente en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización, no publicada por el autor.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no se documentan explícitamente para este checkpoint.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (4 GPUs, ≈5,9 h de reloj, ≈23,6 GPU-h) y no publica mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nano-mistral-o1-dpo-arm-a | 7,25 B | 32.768 | Precisión de preferencia held-out 0,556 (n=117); GSM8K y MATH-500 no medidos | Apache-2.0 | HuggingFace (40 descargas, 0 likes) |
| nano-mistral-o1-sft (padre) | 7,25 B (heredado) | 32.768 (heredado) | GSM8K 0,2047 (n=1.319); MATH-500 0,084 (n=500) | Apache-2.0 (según cadena de modelos) | HuggingFace, vía viai957 |
| nano-mistral-o1-dpo-arm-b | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace, vía viai957 |
| Mistral-7B-v0.3 (base) | 7,25 B | 32.768 | No reportado en esta ficha | Apache-2.0 | HuggingFace, mistralai |

La comparación directa con modelos de propósito general de 7 B no es significativa porque este checkpoint es un artefacto de investigación sin evaluación de tareas. La única comparación con datos es frente al padre SFT, que sí tiene métricas de GSM8K y MATH-500, pero el DPO no fue evaluado en esas tareas.

## Limitaciones y advertencias

- Resultado nulo: la precisión de preferencia held-out (0,556) no se distingue del azar con n=117; no hay evidencia de que el DPO haya mejorado la preferencia del modelo.
- Sin métricas de tarea: GSM8K y MATH-500 no se midieron para este checkpoint, por lo que se desconoce si el DPO degradó, mantuvo o mejoró la precisión matemática del padre SFT.
- Artefacto de investigación, no modelo de producto: el autor lo etiqueta explícitamente como "research-artifact" y "negative-result"; no debe usarse como modelo de producción.
- Desajuste de formato no cuantificado: la plantilla de prompt exige pasos en párrafos y `# Answer`, mientras que las respuestas de Argilla no siguen ese formato; el efecto se decidió medir en evaluación pero nunca se midió en generación.
- Idioma: solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos: no documentados en la información disponible; al derivar de Mistral-7B-v0.3 y de datos generados por LLM, hereda los sesgos de ambas fuentes, pero el autor no publica un análisis específico.
- Riesgo de alucinación: no cuantificado; el modelo no se evaluó en generación ni en tareas de fidelidad.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el dataset de preferencia contiene respuestas generadas por LLM, lo que el proyecto registra como una "OpenAI-output licence shadow" aceptada; conviene revisar la cadena de licencias antes de un uso comercial.
- Precisión: solo bf16; fp16 no está soportado, lo que limita el despliegue en hardware sin soporte bf16.
- Fase cerrada: la fase 1 se cerró el 2026-08-23 y el proyecto migró a GRPO con verificador (stage b); no se esperan actualizaciones de este checkpoint.
- Trazabilidad: el autor afirma que cada número proviene de un receipt local y que `evidence.json` mapea cada cifra a su fuente, pero la métrica de preferencia figura como `verified: false`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-a
- Modelo base SFT: https://huggingface.co/viai957/nano-mistral-o1-sft
- Brazo experimental B: https://huggingface.co/viai957/nano-mistral-o1-dpo-arm-b
- Modelo base original: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Dataset de preferencias: https://huggingface.co/datasets/argilla/distilabel-math-preference-dpo
- Dataset PRM800K: no disponible como enlace en la información proporcionada
- Paper de DPO: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

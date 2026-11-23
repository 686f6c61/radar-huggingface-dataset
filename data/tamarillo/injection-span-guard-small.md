# Tamarillo/injection-span-guard-small

## Resumen

`Tamarillo/injection-span-guard-small` es un modelo de clasificación de tokens (token-classification) especializado en la detección y localización a nivel de token de ataques de inyección de prompt, tanto directos como indirectos. Lo desarrolla el usuario Tamarillo y se construye mediante fine-tuning de `jhu-clsp/mmBERT-small`, un encoder multilingüe de 140,6 millones de parámetros con una ventana de contexto del backbone de 8.192 tokens, validado hasta 3.584 tokens. Resuelve un problema concreto de los guardrails clásicos: en lugar de clasificar un documento entero como malicioso o limpio (lo que obliga a descartar un scrape web, un correo o una salida de herramienta MCP completa), etiqueta cada token con un esquema BIO de tres etiquetas (`O`, `B-INJECTION`, `I-INJECTION`) en una única pasada forward.

Esto permite atribución forense de spans, redacción quirúrgica del contenido malicioso y cálculo de una puntuación de riesgo a nivel de documento derivada del máximo de probabilidad por token (`max_token_prob`). El modelo está pensado para integrarse como sidecar de seguridad en pipelines de agentes y sistemas RAG que consumen contenido externo no confiable.

La licencia es Apache-2.0, no requiere `trust_remote_code` (soporte nativo de ModernBERT en `transformers>=4.48.0`) y ofrece exportaciones ONNX verificadas por paridad, lo que facilita su despliegue en CPU sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), fine-tuning para token-classification con esquema BIO de 3 etiquetas |
| Parametros totales | 140.642.691 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en el backbone; fine-tuned y validado hasta 3.584 tokens |
| Tipos de cuantizacion | No disponible (se distribuyen pesos safetensors y exportación ONNX; no se detallan cuantizaciones INT8/INT4) |
| Idiomas soportados | Inglés como idioma principal; transferencia cross-lingual vía mmBERT (evaluado zero-shot en `rikka-snow/prompt-injection-multilingual` y `deepset` en alemán), sin garantías por idioma más allá del inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder transformer de la familia ModernBERT con 140,6 millones de parámetros y ventana de contexto de 8.192 tokens. Sobre esa base se aplica un fine-tuning supervisado para token-classification con tres etiquetas (`O`, `B-INJECTION`, `I-INJECTION`), de modo que la salida es una probabilidad de inyección por token en lugar de una etiqueta a nivel de documento. La cabeza de clasificación se entrena con datos de múltiples datasets de inyección y jailbreak: `hendzh/PromptShield`, `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `jackhhao/jailbreak-classification`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `fevziegeyurtsevenler/multilingual-prompt-injection` y `mteb/amazon_massive_intent`.

La innovación principal es el enfoque de localización de spans frente a la clasificación binaria: en una sola pasada forward se obtiene la atribución de cada token, lo que habilita redacción quirúrgica y una puntuación de riesgo derivada (`max_token_prob`). El modelo se distribuye con exportaciones ONNX verificadas por paridad con la implementación PyTorch, pensadas para ejecución en CPU. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO.

## Capacidades

- Detección y localización a nivel de token de inyecciones de prompt directas e indirectas, con etiquetas BIO (`O`, `B-INJECTION`, `I-INJECTION`).
- Localización de spans para atribución forense y redacción quirúrgica del contenido malicioso, en lugar de rechazo del documento completo.
- Cálculo de una puntuación de riesgo a nivel de documento derivada del máximo de probabilidad por token (`max_token_prob`).
- Sanitización de salidas de herramientas (tool outputs), correos, scrapes web y contenido MCP estructurado.
- API de conveniencia `InjectionSpanGuard` con métodos `.localize()`, `.sanitize()` y `.scan() -> (sanitized, is_valid, risk_score)` al estilo `llm-guard`.
- Transferencia cross-lingual vía mmBERT, con evaluación zero-shot en contenido multilingüe y alemán.
- Exportación ONNX para inferencia en CPU y potencial uso en navegador (WASM), según la familia de modelos.
- No soporta tool calling ni function calling: es un clasificador de tokens, no un modelo generativo.

## Casos de uso

- **Sanitización de salidas de herramientas en agentes:** el modelo etiqueta cada token de la salida de una herramienta MCP o de una API y permite redactar solo el span malicioso, conservando el resto del contenido útil para el agente. Adecuado por su granularidad de token y su contexto validado de 3.584 tokens.
- **Protección de pipelines RAG:** al ingerir documentos externos (scrapes web, PDFs, correos), se ejecuta el localizador sobre el texto recuperado y se eliminan los spans de inyección antes de insertarlos en el prompt del LLM, evitando el descarte de documentos completos.
- **Guardrail de entrada en asistentes conversacionales:** detección de instrucciones de secuestro (`IGNORE PREVIOUS INSTRUCTIONS`) embebidas en mensajes de usuario o en contenido citado, con puntuación de riesgo por documento para decidir bloqueo o revisión.
- **Auditoría forense de ataques:** la atribución de spans permite registrar exactamente qué fragmento de un contenido se identificó como inyección, útil para análisis de incidentes y para construir datasets de seguridad.
- **Sidecar de seguridad en CPU:** gracias a la exportación ONNX y a sus 140,6M de parámetros, puede desplegarse como servicio auxiliar en CPU junto al modelo principal, sin consumir VRAM de GPU.
- **Filtrado de contenido en correos y documentos ofimáticos:** localización de instrucciones maliciosas inyectadas en HTML o comentarios dentro de documentos, con retención del texto limpio (la model card reporta 100,0% de retención de caracteres limpios a ~3.200 tokens en wrappers de `PromptShield`).
- **Evaluación de robustez de otros sistemas:** uso del modelo como localizador de referencia para medir si un LLM o agente cae ante inyecciones indirectas embebidas en contenido largo.

## Benchmarks y rendimiento

Los resultados publicados en la model card se refieren a la localización de spans y a la detección, no a benchmarks generativos clásicos (MMLU, HumanEval, GSM8K). Se recogen a continuación los datos disponibles:

| Metrica | Valor |
|---|---|
| AUC en wrappers de `PromptShield` a ~3.200 tokens (held-out) | 0,767 |
| Span IoU en wrappers de `PromptShield` a ~3.200 tokens (held-out) | 0,429 |
| Retención de caracteres limpios a ~3.200 tokens | 100,0% |
| AUC zero-shot en `OOD BIPIA` (imperativos sutiles sin override) | 0,549 |
| Span IoU en `OOD BIPIA` | 0,075 |
| AUC OOD en `deepset` (alemán) | 0,940 |
| FPR en Hard-Splice | 0,267 |

Comparativa dentro de la familia `Tamarillo/injection-span-guard`:

| Modelo | Parametros | AUC direct-prompt | FPR Hard-Splice | AUC a 3.200 tok (held-out) | Span IoU a 3.200 tok |
|---|---|---|---|---|---|
| `injection-span-guard-tiny-en` | 32,0M | no disponible | no disponible | 0,845 | no disponible |
| `injection-span-guard-small` | 140,6M | no disponible | 0,267 | 0,767 | 0,429 |
| `injection-span-guard-base` | 307,5M | 0,951 | 0,167 | 0,903 | 0,62–0,67 |

## Requisitos de hardware

- **VRAM estimada:** al tratarse de un encoder de 140,6M de parámetros, la inferencia en fp32 requiere aproximadamente 0,6 GB de pesos; en fp16, alrededor de 0,3 GB. La memoria adicional depende de la longitud de secuencia (hasta 3.584 tokens validados).
- **GPU recomendadas:** cualquier GPU con al menos 1–2 GB de VRAM libre es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3090, RTX 4060 y GPUs de gama baja.
- **Consumer GPU:** sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU. La exportación ONNX está pensada para ejecución en CPU.
- **Opciones de despliegue:** `transformers>=4.48.0` (soporte nativo de ModernBERT, sin `trust_remote_code`), ONNX Runtime con `CPUExecutionProvider`, `pipeline("token-classification")`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de clasificación).
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tamarillo/injection-span-guard-small` | 140,6M | 8.192 backbone / 3.584 validado | Localización de spans por token (BIO) | Apache-2.0 | Hugging Face, ONNX |
| `Tamarillo/injection-span-guard-tiny-en` | 32,0M | no disponible | Localización de spans, inglés + wrappers HTML/JSON/código | Apache-2.0 | Hugging Face |
| `Tamarillo/injection-span-guard-base` | 307,5M | no disponible | Localización de spans, mayor precisión en la familia | Apache-2.0 | Hugging Face |
| Clasificadores binarios de inyección (p. ej. `llm-guard` `PromptInjection`) | no disponible | no disponible | Clasificación a nivel de documento | no disponible | no disponible |

La diferencia clave frente a los clasificadores binarios es la granularidad: `injection-span-guard-small` localiza el span malicioso en lugar de rechazar el documento completo, lo que permite sanitización quirúrgica. Dentro de la familia, `small` ocupa el punto intermedio entre `tiny-en` (más rápido, menor precisión) y `base` (mayor AUC y menor FPR, a costa de más parámetros).

## Limitaciones y advertencias

- **Detección débil de imperativos sutiles:** en `OOD BIPIA` (imperativos de tarea sin override explícito) el AUC cae a 0,549 y el Span IoU a 0,075. El modelo está especializado en ataques de override/secuestro de instrucciones explícitos embebidos en salidas de herramientas estructuradas.
- **Idioma:** el entrenamiento es principalmente en inglés; las capacidades multilingües son transferencia zero-shot vía mmBERT, sin garantías por idioma más allá del inglés.
- **API no drop-in:** es un `AutoModelForTokenClassification`, no un `AutoModelForSequenceClassification`; no es compatible directamente con los loaders de `llm-guard` `PromptInjection`. Requiere usar el helper `InjectionSpanGuard` o adaptar el pipeline.
- **Riesgo de falsos positivos:** el FPR en Hard-Splice es 0,267, relevante en producción; conviene calibrar el umbral (por defecto 0,50) según el caso de uso.
- **Sanitización y parsers estrictos:** la redacción con marcadores como `[REDACTED_INJECTION]` puede romper JSON o HTML estrictos; la model card recomienda validar/escapar antes de alimentar parsers.
- **Riesgo de alucinación:** no aplica en el sentido generativo (no produce texto libre), pero sí puede producir atribuciones de span incorrectas.
- **Sesgos:** no se documentan sesgos específicos en la información disponible.
- **Licencia:** Apache-2.0 permite uso comercial, pero no se ofrecen garantías de exactitud; debe validarse en el dominio concreto antes de producción.
- **Madurez:** el repositorio se creó el 2026-11-23 y registra 0 descargas y 0 likes en el momento de la consulta; es un modelo reciente con escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/injection-span-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Familia de modelos: `Tamarillo/injection-span-guard-tiny-en`, `Tamarillo/injection-span-guard-base` (referenciados en la model card, sin URL directa en la información disponible)
- Dataset `hendzh/PromptShield`: https://huggingface.co/datasets/hendzh/PromptShield
- Dataset `neuralchemy/Prompt-injection-dataset`: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset `S-Labs/prompt-injection-dataset`: https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset `reshabhs/SPML_Chatbot_Prompt_Injection`: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset `jackhhao/jailbreak-classification`: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
- Dataset `fevziegeyurtsevenler/multilingual-prompt-injection`: https://huggingface.co/datasets/fevziegeyurtsevenler/multilingual-prompt-injection
- Dataset `mteb/amazon_massive_intent`: https://huggingface.co/datasets/mteb/amazon_massive_intent
- Paper o blog del modelo: no disponible en la información proporcionada.

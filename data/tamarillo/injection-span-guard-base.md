# Tamarillo/injection-span-guard-base

## Resumen

`Tamarillo/injection-span-guard-base` es un modelo de clasificación de tokens (token classification) especializado en la localización de inyecciones de prompt (prompt injection) y en la sanitización quirúrgica de salidas de herramientas. Lo desarrolla Tamarillo y se construye mediante fine-tuning sobre `jhu-clsp/mmBERT-base`, un backbone ModernBERT multilingüe de 307,5 millones de parámetros con ventana de contexto nativa de 8.192 tokens. El modelo etiqueta cada token con un esquema BIO de tres clases (`O`, `B-INJECTION`, `I-INJECTION`) en una sola pasada, lo que permite atribución forense de spans, redacción selectiva y cálculo de una puntuación de riesgo a nivel de documento (`max_token_prob`).

El problema que resuelve es concreto: los clasificadores binarios de inyección a nivel de documento obligan a descartar un scrape web, un correo o una salida de herramienta MCP de miles de tokens cuando detectan un ataque. Este modelo, en cambio, localiza exactamente qué fragmento es malicioso y permite eliminar solo esa parte, conservando el resto del contenido útil. Según la model card, en los wrappers de `PromptShield` retenidos alcanza un AUC de 0,903 y un Span IoU de 0,622 con una retención del 99,8 % de caracteres limpios a ~3.200 tokens.

Es relevante ahora por el auge de los agentes que consumen salidas de herramientas externas (MCP, navegación web, correo) y por su licencia Apache-2.0 sin `trust_remote_code`, con exportaciones ONNX verificadas por paridad que permiten desplegarlo como sidecar en CPU. Su punto débil declarado es la detección zero-shot de imperativos sutiles sin override explícito (OOD BIPIA: AUC 0,522, Span IoU 0,079).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) sobre `jhu-clsp/mmBERT-base` |
| Parametros totales | 307.532.547 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens en el backbone; fine-tuned y validado hasta 3.584 tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y exportaciones ONNX) |
| Idiomas soportados | inglés principal, con transferencia cross-lingual vía mmBERT |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer ModernBERT de 307,5 millones de parámetros, inicializado desde `jhu-clsp/mmBERT-base`. La cabeza es de clasificación de tokens con tres etiquetas (`0: O`, `1: B-INJECTION`, `2: I-INJECTION`), lo que lo convierte en un localizador de spans en lugar de un clasificador de secuencia. El backbone ModernBERT aporta atención con soporte nativo para secuencias largas (8.192 tokens), aunque el fine-tuning y la validación se realizaron hasta 3.584 tokens.

El entrenamiento combina varios datasets de inyección y jailbreak: `hendzh/PromptShield`, `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `jackhhao/jailbreak-classification`, `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`, `fevziegeyurtsevenler/multilingual-prompt-injection` y `mteb/amazon_massive_intent` (este último presumiblemente para preservar la capacidad multilingüe del backbone). La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles. La innovación principal es el enfoque token-level con esquema BIO, que habilita localización fina y sanitización selectiva en una única pasada forward.

## Capacidades

- Localización token a token de inyecciones de prompt directas e indirectas mediante etiquetas BIO.
- Sanitización quirúrgica: permite redactar únicamente los spans detectados y conservar el resto del documento.
- Puntuación de riesgo derivada a nivel de documento mediante `max_token_prob`.
- Detección de ataques de override e hijack de instrucciones embebidos en salidas de herramientas largas y estructuradas (HTML, JSON, código).
- Transferencia cross-lingual gracias al backbone mmBERT, aunque el idioma principal es el inglés.
- API de span (`AutoModelForTokenClassification`) con helper `InjectionSpanGuard` que ofrece `.localize()`, `.sanitize()` y `.scan()` estilo `llm-guard`.
- Exportaciones ONNX verificadas por paridad para inferencia en CPU.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de clasificación de tokens.

## Casos de uso

- Sanitización de salidas de herramientas MCP: antes de inyectar la respuesta de una herramienta externa en el contexto del agente, se ejecuta el modelo sobre el texto y se redactan los spans marcados como inyección, preservando el contenido legítimo.
- Procesamiento de correos y scrapes web largos: en lugar de rechazar un documento completo de miles de tokens al detectar un ataque, se localiza el fragmento malicioso y se elimina solo ese tramo, manteniendo el resto del contenido útil para el pipeline.
- Guardrail en pipelines RAG: se escanea cada documento recuperado antes de pasarlo al LLM generador, con atribución forense del span inyectado para auditoría.
- Sidecar de seguridad en CPU: gracias a las exportaciones ONNX y al tamaño de 307,5 M de parámetros, puede desplegarse como servicio independiente en CPU junto al modelo principal, sin competir por GPU.
- Monitorización y logging de seguridad: el esquema BIO y la puntuación `max_token_prob` permiten registrar qué fragmentos concretos de una interacción se marcaron como sospechosos, facilitando el análisis posterior de incidentes.
- Filtrado de contenido en aplicaciones de atención al cliente: se localizan intentos de jailbreak o override en mensajes de usuario y en contenido incrustado, permitiendo respuestas selectivas en lugar de bloqueos totales.
- Investigación en seguridad de LLM: el modelo sirve como baseline token-level para experimentos de localización de inyecciones y comparación con clasificadores binarios.

## Benchmarks y rendimiento

Datos publicados en la model card (evaluación sobre `PromptShield` retenido y conjuntos OOD):

| Metrica | Valor |
|---|---|
| AUC en prompt directo | 0,951 |
| AUC a ~3.200 tokens (PromptShield retenido) | 0,903 |
| Span IoU a ~3.200 tokens | 0,622–0,67 |
| Retención de caracteres limpios a ~3.200 tokens | 99,8 % |
| FPR en Hard-Splice | 0,167 |
| AUC OOD deepset | no disponible para base (0,940 en la variante small) |
| AUC OOD BIPIA (imperativos sutiles sin override) | 0,522 |
| Span IoU OOD BIPIA | 0,079 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,2 GB para los 307,5 M de parámetros; en fp16 ~0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 y RTX 4090 son sobredimensionadas para este modelo, pero válidas para lotes grandes.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660 o superiores.
- Despliegue en CPU viable mediante ONNX Runtime (`CPUExecutionProvider`), pensado como sidecar.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), ONNX Runtime, y potencialmente vLLM/TGI no aplican al no ser un modelo generativo; llama.cpp y Ollama no están documentados para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| `Tamarillo/injection-span-guard-base` | 307,5 M | 8.192 (validado 3.584) | Token-level BIO, localización de spans | Apache-2.0 |
| `Tamarillo/injection-span-guard-small` | 140,6 M | no disponible | Token-level BIO, transferencia cross-lingual | Apache-2.0 |
| `Tamarillo/injection-span-guard-tiny-en` | 32,0 M | no disponible | Token-level BIO, inglés + wrappers HTML/JSON/código | Apache-2.0 |
| Clasificadores binarios tipo `llm-guard` `PromptInjection` | variable | variable | Clasificación a nivel de documento | variable |

La comparativa con clasificadores binarios externos no está cuantificada en la información disponible; la model card solo aporta métricas internas de la familia.

## Limitaciones y advertencias

- Detección zero-shot débil de imperativos sutiles sin override explícito (OOD BIPIA: AUC 0,522, Span IoU 0,079).
- El modelo está orientado principalmente al inglés; el rendimiento en otros idiomas depende de la transferencia cross-lingual de mmBERT y no está cuantificado.
- No es un reemplazo directo de `AutoModelForSequenceClassification` ni de los loaders de `llm-guard`: requiere adaptación al API de span.
- La sanitización sustituye caracteres por marcadores; si la salida se reinyecta en parsers estrictos de JSON o HTML, es necesario validar y escapar el resultado.
- Riesgo de alucinación no aplica directamente (no genera texto), pero sí de falsos positivos y falsos negativos en la localización.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero conviene revisar las licencias de los datasets de entrenamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/injection-span-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Dataset PromptShield: https://huggingface.co/datasets/hendzh/PromptShield
- Dataset Nemotron RL Agentic Indirect Prompt Injection: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1
- Dataset multilingüe de prompt injection: https://huggingface.co/datasets/fevziegeyurtsevenler/multilingual-prompt-injection
- Dataset SPML Chatbot Prompt Injection: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset Jailbreak Classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset Prompt Injection (S-Labs): https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset Prompt Injection (neuralchemy): https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset MASSIVE Intent (mteb): https://huggingface.co/datasets/mteb/amazon_massive_intent

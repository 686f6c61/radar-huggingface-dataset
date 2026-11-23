# Tamarillo/injection-span-guard-tiny-en

## Resumen

`Tamarillo/injection-span-guard-tiny-en` es un modelo de clasificación de tokens (token classification) especializado en la localización de inyecciones de prompt (prompt injection) a nivel de span, no de documento. Lo desarrolla el autor independiente Tamarillo y se construye mediante fine-tuning del encoder `jhu-clsp/ettin-encoder-32m`, un transformer tipo ModernBERT de 32,0 millones de parámetros. Su función principal es etiquetar cada token de una entrada con el esquema BIO (`O`, `B-INJECTION`, `I-INJECTION`) en una sola pasada, lo que permite atribución forense de fragmentos maliciosos y redacción quirúrgica en lugar de descartar documentos completos.

El modelo aborda un problema concreto de los guardrails de seguridad en LLM: los clasificadores binarios a nivel de documento obligan a rechazar por completo un volcado web, un correo o una salida de herramienta MCP de varios miles de tokens cuando detectan una inyección, perdiendo todo el contenido legítimo. Esta variante "tiny" prioriza velocidad en CPU y navegador (WASM) manteniendo una ventana de contexto de 7.999 tokens en el backbone, aunque validada hasta 3.584 tokens. Según la model card, alcanza 0,845 de AUC y 0,357 de Span IoU con una retención del 100,0% de caracteres limpios en wrappers de `PromptShield` retenidos a ~3.200 tokens.

Es relevante ahora porque la inyección indirecta de prompts en salidas de herramientas y agentes es una superficie de ataque creciente, y este modelo ofrece una alternativa Apache-2.0, sin `trust_remote_code`, con exportaciones ONNX verificadas en paridad, pensada para desplegarse como sidecar en CPU junto a pipelines de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder ModernBERT (base `jhu-clsp/ettin-encoder-32m`) |
| Parámetros totales | 32.032.131 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 7.999 tokens en el backbone; fine-tuning y validación hasta 3.584 tokens |
| Tipos de cuantización | no disponible (existe exportación ONNX; el repo no detalla cuantizaciones) |
| Idiomas soportados | inglés (en), con wrappers HTML/JSON/Markdown/código |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 32,0M de parámetros derivado de `jhu-clsp/ettin-encoder-32m`, adaptado a la tarea de token classification con una cabeza de tres etiquetas (`O`, `B-INJECTION`, `I-INJECTION`). La arquitectura ModernBERT incorpora atención con rotación posicional y ventanas de contexto largas, lo que permite procesar entradas de hasta 7.999 tokens en el backbone; el autor indica fine-tuning y validación hasta 3.584 tokens. Se distribuye con soporte nativo en `transformers>=4.48.0` sin necesidad de `trust_remote_code`, y con exportaciones ONNX verificadas en paridad para inferencia en CPU.

El entrenamiento se realizó sobre una mezcla de datasets de seguridad de prompts: `hendzh/PromptShield`, `neuralchemy/Prompt-injection-dataset`, `S-Labs/prompt-injection-dataset`, `reshabhs/SPML_Chatbot_Prompt_Injection`, `jackhhao/jailbreak-classification` y `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`. La model card no detalla el número exacto de tokens de entrenamiento ni si hubo fases de RLHF o DPO (no disponible). La innovación principal es el enfoque de localización a nivel de token con esquema BIO, que habilita redacción quirúrgica y puntuación de riesgo derivada (`max_token_prob`) en lugar de clasificación binaria.

## Capacidades

- Localización de spans de inyección de prompt a nivel de token con etiquetas BIO (`O`, `B-INJECTION`, `I-INJECTION`).
- Detección de inyecciones indirectas embebidas en salidas de herramientas, volcados web, correos y wrappers HTML/JSON/Markdown/código.
- Redacción quirúrgica (surgical sanitization) de fragmentos maliciosos preservando el contenido limpio circundante.
- Puntuación de riesgo a nivel de documento derivada del máximo de probabilidad por token (`max_token_prob`).
- API de span (`AutoModelForTokenClassification`) con helper `InjectionSpanGuard` que expone `.localize()`, `.sanitize()` y `.scan() -> (sanitized, is_valid, risk_score)`.
- Inferencia en CPU y navegador vía ONNX Runtime (WASM), sin GPU.
- Capacidad multilingüe: no disponible; el modelo es solo inglés (con wrappers de código/markup).
- Tool calling / function calling: no aplica (es un modelo de clasificación, no generativo).
- Agentes y razonamiento multi-paso: no aplica directamente; se usa como componente de guardrail en pipelines de agentes.

## Casos de uso

- Saneamiento de salidas de herramientas MCP: el modelo localiza y redacta inyecciones embebidas en la salida de una herramienta antes de pasarla al LLM, evitando descartar el resto del contenido útil gracias a la ventana de 3.584 tokens validada.
- Protección de pipelines RAG: al recuperar documentos largos de una base vectorial, se escanea cada fragmento y se eliminan solo los spans maliciosos, manteniendo la mayor parte del contexto recuperado para la generación.
- Guardrail en atención al cliente automatizada: se inspeccionan correos o tickets de usuario de varios miles de tokens para neutralizar instrucciones de secuestro antes de que lleguen al modelo conversacional.
- Sidecar de seguridad en CPU: despliegue con ONNX Runtime como proceso independiente de bajo coste junto a un servidor de inferencia principal, sin consumir VRAM de GPU.
- Procesamiento de volcados web y scrapes: se limpian páginas HTML/JSON de gran longitud antes de alimentar a un agente, preservando el contenido legítimo y eliminando comentarios o instrucciones ocultas.
- Filtrado en navegador (WASM): integración en extensiones o aplicaciones web que necesitan sanitizar contenido en el cliente sin enviar datos a un servidor.
- Auditoría forense de ataques: la atribución por span permite registrar exactamente qué fragmento de una entrada contenía la inyección, útil para análisis post-incidente y trazabilidad.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a evaluaciones propias del autor; no se dispone de resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo de clasificación).

| Evaluación | Métrica | Resultado |
|---|---|---|
| `PromptShield` wrappers retenidos, ~3.200 tokens | AUC | 0,845 |
| `PromptShield` wrappers retenidos, ~3.200 tokens | Span IoU | 0,357 |
| `PromptShield` wrappers retenidos, ~3.200 tokens | Retención de caracteres limpios | 100,0% |
| `OOD BIPIA` (imperativos sutiles sin override) | AUC | 0,519 |
| `OOD BIPIA` | Span IoU | 0,101 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; con 32,0M de parámetros el modelo cabe holgadamente en cualquier GPU consumer (menos de 1 GB en fp32) y está diseñado para CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (RTX 3060 o superior) lo ejecuta sin problema, pero el caso de uso principal es CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, con un consumo de memoria mínimo.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime (CPU), ONNX Runtime Web (WASM en navegador), pipeline `token-classification` de Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a token classification).
- Latencia y throughput: no disponible en la información proporcionada; el autor lo posiciona como el sanitizador más rápido de la familia en CPU y WASM, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tamarillo/injection-span-guard-tiny-en` | 32,0M | 7.999 (validado 3.584) | Localización por span (BIO) | Apache-2.0 | Hugging Face, ONNX |
| `Tamarillo/injection-span-guard-small` | 140,6M | no disponible | Localización por span, transferencia cross-lingual mmBERT | no disponible | Hugging Face |
| `Tamarillo/injection-span-guard-base` | 307,5M | no disponible | Localización por span, transferencia cross-lingual mmBERT | no disponible | Hugging Face |
| `deberta-v3-base-prompt-injection-v2` | ~184M (base) | no disponible | Clasificación binaria a nivel de documento | no disponible | Hugging Face |

Según la model card, el modelo tiny es ~5,8 veces más pequeño que `deberta-v3-base-prompt-injection-v2`. Frente a sus hermanos de familia, el `base` reporta el mayor AUC en prompt directo (0,951) y el menor FPR en Hard-Splice (0,167), mientras que el `small` reporta 0,940 de AUC OOD en deepset. El tiny prioriza velocidad en CPU/WASM a costa de menor rendimiento en ataques sutiles.

## Limitaciones y advertencias

- Detección débil de imperativos sutiles sin override explícito: en `OOD BIPIA` obtiene 0,519 de AUC y 0,101 de Span IoU, lo que limita su uso frente a ataques no basados en secuestro de instrucciones.
- Solo inglés: no cubre otros idiomas; el soporte se limita a wrappers HTML/JSON/Markdown/código.
- No es un reemplazo directo de clasificadores binarios: requiere una API de token classification y un helper de integración; no funciona como drop-in de `llm-guard` `PromptInjection`.
- Riesgo de falsos positivos y negativos inherente a la clasificación; la redacción quirúrgica puede romper estructuras JSON/HTML estrictas si no se valida o escapa la salida.
- La ventana validada es de 3.584 tokens, aunque el backbone soporte 7.999; entradas más largas pueden degradar la localización.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías de robustez frente a ataques adversariales adaptativos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no aplica directamente al ser un modelo de clasificación, pero sí existe riesgo de atribución errónea de spans.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/injection-span-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Dataset `hendzh/PromptShield`: https://huggingface.co/datasets/hendzh/PromptShield
- Dataset `neuralchemy/Prompt-injection-dataset`: https://huggingface.co/datasets/neuralchemy/Prompt-injection-dataset
- Dataset `S-Labs/prompt-injection-dataset`: https://huggingface.co/datasets/S-Labs/prompt-injection-dataset
- Dataset `reshabhs/SPML_Chatbot_Prompt_Injection`: https://huggingface.co/datasets/reshabhs/SPML_Chatbot_Prompt_Injection
- Dataset `jackhhao/jailbreak-classification`: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset `nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1`: https://huggingface.co/datasets/nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1

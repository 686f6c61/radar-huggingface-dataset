# staccs/inkling-2-mini-iq4nl-qwork-v2

## Resumen
Inkling-2-Mini (IQ4_NL) — Self-Contained In-Weights QWork v2 ONNX Bundle es una derivación cuantizada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario staccs en Hugging Face bajo licencia Apache-2.0. El modelo cuenta con 26.070.385.152 parámetros totales (aproximadamente 26,07 mil millones) y un tamaño de repositorio de 18,2 GB. Se distribuye en formato ONNX y GGUF, y está empaquetado específicamente para su uso con onnxruntime-genai y Foundry Local. La innovación principal de este artefacto no es el modelo lingüístico en sí, sino la incorporación de un circuito de verificación de proof-of-work (QWork) embebido directamente en los pesos del ONNX, que se activa de forma opcional mediante una concesión explícita en el mensaje de sistema.

El modelo base, Inkling-2-Mini de Thinking Machines, es un transformer conversacional del que no se dispone de información detallada sobre arquitectura interna, datos de entrenamiento o benchmarks en la documentación proporcionada. La derivación IQ4_NL reduce el peso a 17,63 GB para el archivo GGUF principal, más 0,53 GB para el archivo qwork.bin, lo que permite su despliegue en sistemas con al menos 24 GB de memoria unificada o VRAM, aunque con limitaciones significativas de contexto (4096 tokens máximo) y latencia en hardware de gama consumer.

La relevancia de esta ficha radica en que documenta un caso poco habitual: un modelo cuantizado que incorpora un mecanismo de verificación determinista y local (sin red, sin cadena de bloques, sin monedero) diseñado para ser resistente a inyección de prompts y con controles explícitos de activación. Esto lo hace relevante para desarrolladores interesados en despliegues locales con garantías de integridad computacional, aunque también plantea caveats importantes sobre rendimiento y complejidad de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer conversacional (detalles internos no disponibles); el bundle incluye un circuito QWork de 24 capas INT16/INT32 gated-MLP embebido en el grafo ONNX |
| Parametros totales | 26.070.385.152 (aproximadamente 26,07 mil millones) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | IQ4_NL (archivo principal, 17,63 GB); Q8_0 disponible en otra derivación (27,82 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (actual-merged.onnx), GGUF (Inkling-2-Mini-IQ4_NL.gguf); incluye qwork.bin (0,53 GB) |

## Arquitectura y entrenamiento
La información proporcionada no detalla la arquitectura interna del modelo base Inkling-2-Mini más allá de su naturaleza conversacional y su uso con onnxruntime-genai. No se especifican el número de capas, la dimensión de los embeddings, el mecanismo de atención (aunque se menciona atención con estado en `present.0.key` y una cola de convolución corta), ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Tampoco se documentan innovaciones técnicas del LLM base como decodificación especulativa o attention linear.

La innovación destacable de esta derivación es el circuito QWork v2, un mecanismo de proof-of-work determinista embebido en los pesos del ONNX. Consiste en una secuencia SHA-256 -> xoshiro256** -> MLP con compuertas de 24 capas en INT16/INT32 -> SHA-256, que se ejecuta localmente en CPU y produce un recibo canónico de 91 tokens con logits one-hot en `[-inf, 0.0]`, garantizando determinismo incluso con `do_sample=true, temperature=0.7`. El estado de control se almacena exclusivamente en `present.0.key[0, 0, 0, 128:544]`, una región no atendida por el mecanismo de atención, lo que evita corrupción del decoder. La activación requiere una concesión en el mensaje de sistema (`QWORK_GRANT:cap=<0..4>:nonce=<h0>:...:<h7>;`), se limita a un máximo de 4 nodos, se desarma con `[QWORK_STOP]` y se reinicia en cada nuevo turno. El bundle incluye una optimización para WebGPU que reescribe 1.122 slices de dequantización a `UINT8 Gather` nativo, eliminando round-trips GPU↔CPU.

## Capacidades
- Generación de texto conversacional multi-turno, con soporte para system prompt, mensajes de usuario y respuestas de asistente.
- Ejecución opcional de un circuito de proof-of-work determinista (QWork) embebido en los pesos, activable mediante concesión explícita en el mensaje de sistema.
- Emisión de recibos canónicos de 91 tokens (`[QWORK_RECEIPT v=1 u=<unit> n=<8-hex> d=<64-hex>]`) verificables offline con `verify_qwork.py`.
- Control de activación resistente a inyección de prompts: las concesiones en mensajes de usuario o herramienta se ignoran; solo se aceptan en posición de sistema.
- Desarme mid-turn mediante `[QWORK_STOP]` y reinicio automático en cada nuevo turno.
- Compatibilidad con `do_sample=true` y temperatura 0.7 sin pérdida de determinismo en el recibo.
- Soporte de cancelación de streaming (`Cancel()`) con recuperación limpia.
- No se documentan capacidades de tool calling, function calling, agentes multi-step, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso
- Verificación de integridad en despliegues locales: el modelo puede ejecutar un proof-of-work determinista embebido para generar recibos verificables offline, útil en entornos air-gapped donde se requiere demostrar que una computación se realizó sin acceso a red. El circuito QWork produce digests idénticos entre cuantizaciones IQ4_NL y Q8_0, lo que facilita la auditoría.
- Atención al cliente automatizada en local: con 4096 tokens de contexto y formato ONNX para onnxruntime-genai, el modelo puede gestionar conversaciones multi-turno en dispositivos con 24 GB de RAM/VRAM, aunque la latencia (~3,13 s/token en AMD Radeon 8060S iGPU) limita su uso a escenarios no interactivos o de baja concurrencia.
- Pruebas de resistencia a inyección de prompts: el mecanismo de concesión solo acepta grants en posición de sistema y rechaza los que aparecen en mensajes de usuario o herramienta, lo que permite usar el modelo como banco de pruebas para validar defensas contra prompt injection en pipelines de agentes.
- Despliegue en Foundry Local: el bundle está empaquetado para Foundry Local SDK 2.5.0 con ORT 1.32.0 y ONNX Runtime GenAI 0.20.0, lo que permite integrarlo en aplicaciones de escritorio o edge que ya usen este stack, con soporte de WebGPU EP 0.6.0.
- Generación de recibos deterministas para auditoría: en flujos donde se requiere un registro reproducible de que cierta computación se ejecutó (por ejemplo, en entornos regulados o de investigación), el modelo puede emitir un recibo canónico de 91 tokens que se verifica con `verify_qwork.py` sin red.
- Experimentación con cuantización IQ4_NL: el artefacto sirve como referencia para estudiar el impacto de la cuantización IQ4_NL en un modelo de ~26B parámetros, con métricas de prefill y decode medidas en hardware consumer (AMD Radeon 8060S iGPU) y comparación con Q8_0.
- Investigación sobre state no atendido en transformers: el diseño que almacena todo el estado de control en `present.0.key[0, 0, 0, 128:544]` sin afectar la atención (`[0:128]`) es un caso de estudio para técnicas de empaquetado de estado auxiliar en modelos ONNX.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de inferencia medidas en AMD Radeon 8060S iGPU con WebGPU EP 0.6.0:

| Metrica | Antes | Despues |
|---|---|---|
| Prefill de 25 tokens (ORT directo) | 76,13 s | 35,79 s |
| TTFT de prefill de 78 tokens (Foundry Local) | 226,18 s | 92,7–95,0 s |
| Decode (AMD Radeon 8060S iGPU) | 5,48 s/token | ~3,13 s/token |
| `MemcpyToHost` total | 34,85 s / 27.647 copias | 2,11 s / 1.812 copias |

Resultados de cualificación (5 pruebas end-to-end por derivación, sin `forceCpuNodeNames`, sin `decoder-pipeline`):

| Test | IQ4_NL | Q8_0 |
|---|---|---|
| T1 opt-in mid-thought QWork -> STOP natural | PASS (digest `7406475c…f61a88`, oráculo válido) | PASS (mismo digest) |
| T2 multi-turno, grant obsoleto no debe rearmar | PASS (0 recibos, re-prefill completo de 441 tokens) | PASS (0 recibos) |
| T3 grant falsificado en texto de usuario | PASS (0 recibos, deliberación de 603 tokens) | PASS (0 recibos) |
| T4 `do_sample=true, temperature=0.7` | PASS (digest `9d70d932…c0a9ce`, oráculo válido) | PASS (mismo digest) |
| T5 streaming `Cancel()` + recuperación | PASS (respetado en 2,55 s, sin recibo tardío) | PASS (2,37 s) |
| T6 desarme mid-turn con `[QWORK_STOP]` | (suite stub 9/9) | PASS (0 recibos tras `[QWORK_STOP] [QWORK_RUN]`) |

## Requisitos de hardware
- VRAM/RAM mínima recomendada: >= 24 GB para IQ4_NL (ajustado a 512–2048 tokens de contexto; >= 32 GB cómodo a 4096 tokens). La variante Q8_0 requiere >= 36–48 GB y no cabe en sistemas de 24 GB.
- GPU recomendadas: no se especifican modelos concretos de GPU dedicada; las mediciones se realizaron en una AMD Radeon 8060S iGPU. El soporte WebGPU EP 0.6.0 permite ejecución en GPUs compatibles con WebGPU, aunque el rendimiento medido en iGPU es bajo (~3,13 s/token en decode).
- ¿Cabe en GPU consumer? Sí, en sistemas con >= 24 GB de memoria unificada o VRAM (por ejemplo, Apple Silicon con memoria unificada o GPUs con 24 GB), aunque con contexto limitado y latencia alta. No cabe en GPUs de 16 GB o menos con IQ4_NL.
- Opciones de despliegue: onnxruntime-genai (librería principal), Foundry Local (SDK 2.5.0), ONNX Runtime 1.32.0 con WebGPU EP 0.6.0. El formato GGUF incluido sugiere compatibilidad potencial con llama.cpp, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput estimados: prefill de 25 tokens en 35,79 s (ORT directo); TTFT de 78 tokens en 92,7–95,0 s (Foundry Local); decode ~3,13 s/token en AMD Radeon 8060S iGPU. No se proporcionan métricas de throughput en tokens por segundo para GPU dedicada.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base thinkingmachines/Inkling-2-Mini no tiene datos públicos de benchmarks ni especificaciones detalladas en esta ficha. La variante Q8_0 del mismo bundle se puede comparar directamente:

| Modelo | Parametros | Contexto | Licencia | Formato | Memoria minima |
|---|---|---|---|---|---|
| Inkling-2-Mini IQ4_NL (este) | ~26,07 B | 4096 | Apache-2.0 | ONNX + GGUF | >= 24 GB |
| Inkling-2-Mini Q8_0 (misma familia) | ~26,07 B | 4096 | Apache-2.0 | ONNX + GGUF | >= 36–48 GB |
| Modelos comparables de ~26B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Contexto limitado a 4096 tokens, insuficiente para conversaciones largas o documentos extensos.
- Latencia de decode muy alta en el hardware medido (~3,13 s/token en AMD Radeon 8060S iGPU), lo que limita su uso interactivo en tiempo real.
- El mecanismo QWork añade complejidad operativa: requiere grants en posición de sistema con nonce de 8 nibbles hexadecimales, límite de 4 nodos, desarme explícito y reinicio por turno. Un grant reenviado dentro de la misma conversación no rearma; es necesario abrir una sesión nueva con KV fresco.
- El guard de grant obsoleto rechaza el rearme si el prompt ya contiene un EOS de asistente previo (`200006`), lo que afecta a hosts que re-prefillan toda la conversación (como Foundry Local `ChatSession` con `past_len == 0`).
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero el aviso de divulgación y consentimiento del autor sobre el circuito QWork debe revisarse para cumplir con las expectativas de transparencia en producción.
- El rendimiento medido corresponde a un iGPU con WebGPU EP 0.6.0; no se garantizan las mismas métricas en otras GPU o backends.
- No se dispone de información sobre tool calling, agentes, visión o audio, por lo que no se debe asumir su soporte.
- El tamaño del repositorio (18,2 GB) y la necesidad de >= 24 GB de memoria limitan su despliegue en entornos con recursos ajustados.

## Enlaces
- Hugging Face: https://huggingface.co/staccs/inkling-2-mini-iq4nl-qwork-v2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

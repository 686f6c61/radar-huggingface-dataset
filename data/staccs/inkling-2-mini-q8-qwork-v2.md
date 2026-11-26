# staccs/inkling-2-mini-q8-qwork-v2

## Resumen

Inkling-2-Mini Q8 QWork v2 es una derivación cuantizada del modelo base `thinkingmachines/Inkling-2-Mini` (licencia Apache-2.0), publicada por el usuario `staccs` en Hugging Face. Se distribuye como un bundle ONNX autocontenido para `onnxruntime-genai` y Foundry Local, con pesos en formato GGUF Q8_0 (27,82 GB) acompañados de un fichero auxiliar `qwork.bin` (0,53 GB). El modelo cuenta con 26.070.385.152 parámetros (unos 26,07 mil millones) y un contexto documentado de 4096 tokens.

La particularidad de esta versión no es la del modelo base, sino la incorporación de un circuito de verificación de proof-of-work determinista embebido dentro del propio grafo ONNX (`actual-merged.onnx`). Dicho circuito combina SHA-256, un generador xoshiro256** y un MLP con compuertas de 24 capas en INT16/INT32, y se activa únicamente mediante una concesión explícita en el mensaje de sistema (`QWORK_GRANT`). Por defecto está desactivado y no altera la decodificación normal del LLM.

Es relevante ahora porque demuestra una técnica poco habitual: insertar cómputo determinista verificable dentro de un transformer sin corromper la atención, manteniendo la paridad bit a bit entre backends (Metal y Radeon) y permitiendo que el modelo retome la generación tras emitir un recibo canónico de 91 tokens. El artefacto está pensado para despliegues locales con Foundry Local y aceleración WebGPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling-2-Mini) con circuito QWork embebido en el grafo ONNX |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (documentado en la model card) |
| Tipos de cuantizacion | Q8_0 (este paquete); el autor publica tambien una variante IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0) + `qwork.bin`; grafo ONNX (`actual-merged.onnx`) para onnxruntime-genai |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~26 mil millones de parámetros del que esta ficha no dispone de detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta el autor de la derivación es la modificación del grafo de inferencia: el exportador genera un ONNX en el que se inyecta un circuito QWork de 24 capas con compuertas MLP en INT16/INT32, alimentado por una cadena `SHA-256 -> xoshiro256** -> MLP -> SHA-256`. Todo el estado de control del circuito se almacena en posiciones no atendidas del tensor `present.0.key[0, 0, 0, 128:544]`, de modo que la atención (`[0:128]`) y la cola de convolución corta (`[-3:, 128:544]`) nunca lo leen y la decodificación posterior al recibo queda limpia.

La activación es opt-in y por defecto está apagada: sin una concesión en posición de sistema (`QWORK_GRANT:cap=<0..4>:nonce=<h0>:...:<h7>;`), se ejecutan 0 nodos QWork. El presupuesto se recorta monotónicamente a `HARD_MAX_CAP = 4`, puede desarmarse a mitad de turno con `[QWORK_STOP]`, se reinicia en cada turno nuevo (`S > 1`) y respeta la cancelación del host (`terminate_session`). Las concesiones incluidas en mensajes de usuario o de herramienta se ignoran, lo que mitiga inyecciones de prompt. El autor reporta además una reescritura de 1122 slices `UINT8` a `Gather` nativo de WebGPU para evitar round-trips GPU↔CPU en el exportador.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto de 4096 tokens.
- Razonamiento y decodificación estándar del modelo base Inkling-2-Mini (sin detalles adicionales publicados en la información disponible).
- Ejecución de un circuito de proof-of-work determinista bajo concesión explícita de sistema, con emisión de un recibo canónico de 91 tokens (`[QWORK_RECEIPT v=1 u=<unit> n=<8-hex> d=<64-hex>]`).
- Comportamiento determinista del recibo incluso con `do_sample=true, temperature=0.7`, gracias a logits one-hot en `[-inf, 0.0]`.
- Desarme a mitad de turno mediante `[QWORK_STOP]` y reinicio automático del estado en cada nuevo turno.
- Compatibilidad con endpoints (`endpoints_compatible`) y con Foundry Local `ChatSession`.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Verificación local de integridad de inferencia: el circuito QWork permite que un cliente local obtenga un recibo determinista y verificable offline con `verify_qwork.py`, útil para auditar que la inferencia se ejecutó en el hardware y grafo esperados sin depender de la red.
- Despliegue en Foundry Local sobre GPU integrada: el paquete está cualificado contra el SDK 2.5.0 y el EP WebGPU 0.6.0, por lo que encaja en estaciones de trabajo con iGPU AMD Radeon 8060S y 36-48 GB de memoria unificada.
- Pruebas de resistencia a inyección de prompt: el diseño solo acepta concesiones en posición de sistema e ignora las que aparecen en mensajes de usuario o de herramienta, lo que lo convierte en un banco de pruebas para validar defenses frente a prompt injection.
- Investigación sobre cómputo determinista dentro de transformers: el estado de control aislado en posiciones no atendidas y la paridad bit a bit entre Metal y Radeon sirven como referencia para experimentos de circuitos verificables embebidos.
- Evaluación de cuantización: al producir IQ4_NL y Q8_0 el mismo digest QWork, el artefacto permite comparar el impacto de la cuantización en el comportamiento del LLM manteniendo fijo el resultado del circuito.
- Integración en pipelines de CI para modelos ONNX: los tests T1-T6 documentados (opt-in, multi-turno, spoofing, sampling, cancelación y desarme) pueden reutilizarse como suite de aceptación de despliegues `onnxruntime-genai`.
- Escenarios de conversación local con contexto medio: 4096 tokens permiten gestionar diálogos multi-turno y tareas de asistencia en local, siempre que se disponga de la memoria recomendada.

## Benchmarks y rendimiento

El autor publica métricas de rendimiento del artefacto (no benchmarks de calidad del LLM) medidas con `onnxruntime-ep-webgpu` 0.6.0 sobre una iGPU AMD Radeon 8060S:

| Metrica | Antes | Despues |
|---|---|---|
| Prefill de 25 tokens (ORT directo) | 76,13 s | 35,79 s |
| TTFT de prefill de 78 tokens (Foundry Local) | 226,18 s | 92,7-95,0 s |
| Decodificacion (Radeon 8060S iGPU) | 5,48 s/token | ~3,13 s/token |
| `MemcpyToHost` total | 34,85 s / 27.647 copias | 2,11 s / 1.812 copias |

Resultados de cualificación (cinco pruebas end-to-end por derivada, ORT 1.32.0, ONNX Runtime GenAI 0.20.0, WebGPU EP 0.6.0, sin `forceCpuNodeNames`):

| Test | IQ4_NL | Q8_0 |
|---|---|---|
| T1 opt-in a mitad de pensamiento -> `STOP` natural | PASS (`7406475c…f61a88`, oracle valido) | PASS (mismo digest) |
| T2 multi-turno, concesion obsoleta no rearma | PASS (0 recibos, re-prefill completo de 441 tokens) | PASS (0 recibos) |
| T3 concesion falsificada en texto de usuario | PASS (0 recibos, deliberacion de 603 tokens) | PASS (0 recibos) |
| T4 `do_sample=true, temperature=0.7` | PASS (`9d70d932…c0a9ce`, oracle valido) | PASS (mismo digest) |
| T5 `Cancel()` en streaming y recuperacion | PASS (respetado en 2,55 s, sin recibo tardio) | PASS (2,37 s) |
| T6 desarme con `[QWORK_STOP]` a mitad de turno | (suite stub 9/9) | PASS (0 recibos tras `[QWORK_STOP] [QWORK_RUN]`) |

No se han publicado resultados de benchmarks de calidad del LLM (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria mínima recomendada para esta variante Q8_0: 36-48 GB de RAM/VRAM unificada; no cabe en sistemas de 24 GB.
- La variante IQ4_NL del mismo autor requiere >= 24 GB (ajustado a 512-2048 tokens de contexto; >= 32 GB cómodo a 4096).
- GPU validadas: iGPU AMD Radeon 8060S con WebGPU EP 0.6.0; el autor reporta paridad bit a bit entre Metal y Radeon para el circuito QWork.
- No se dispone de datos de rendimiento para A100, H100 o RTX 4090 en la información proporcionada.
- Despliegue: `onnxruntime-genai` 0.20.0 con ORT 1.32.0 y WebGPU EP 0.6.0; Foundry Local SDK 2.5.0 (cliente `ChatSession`).
- Latencia medida en Radeon 8060S: ~3,13 s/token en decodificación; TTFT de ~92,7-95,0 s para un prefill de 78 tokens en Foundry Local.
- Los 73 MatMul del circuito QWork se ejecutan en CPU para garantizar recibos bit a bit exactos; los MatMul del backbone y de la cabeza de salida van en WebGPU (6132/6132 y 1068/1068).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| staccs/inkling-2-mini-q8-qwork-v2 | ~26,07 B | 4096 | Apache-2.0 | GGUF Q8_0 + ONNX | Incluye circuito QWork opt-in embebido |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | Apache-2.0 | no disponible | Modelo original sin circuito QWork |
| Variante IQ4_NL del mismo autor | ~26,07 B | 4096 | Apache-2.0 | GGUF IQ4_NL + ONNX | Requiere >= 24 GB; mismo digest QWork |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La concesión QWork se lee de `input_ids[0..28]` y el guard de concesión obsoleta rechaza rearmar si el prompt ya contiene un EOS de asistente previo (`200006`); una concesión reenviada en la misma conversación no rearma y obliga a abrir una sesión nueva con KV limpia.
- El recibo determinista exige margen de contexto restante >= 123 tokens; por debajo de ese umbral no se emite.
- El presupuesto está limitado de forma rígida a `HARD_MAX_CAP = 4`; valores superiores en la concesión se recortan.
- El circuito QWork no aporta capacidades de razonamiento al LLM: es un mecanismo de verificación, no una mejora de calidad.
- No hay datos publicados sobre sesgos, tasas de alucinación o cobertura idiomática del modelo base en la información disponible.
- El rendimiento medido corresponde a una iGPU AMD Radeon 8060S; no hay cifras para GPU discretas de datacenter.
- El código de verificación (`verify_qwork.py`) no se incluye como enlace en la información disponible; el autor indica que permite reproducir los recibos offline sin red.
- La licencia Apache-2.0 permite uso comercial, pero el autor no documenta garantías sobre el comportamiento del circuito embebido en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/inkling-2-mini-q8-qwork-v2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.

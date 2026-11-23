# staccs/inkling-2-mini-q8-qwork-v2

## Resumen

Inkling-2-Mini Q8_0 QWork v2 es una derivación cuantizada del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `staccs` bajo licencia Apache-2.0. Se distribuye como un bundle ONNX autocontenido para `onnxruntime-genai` y Foundry Local, con pesos en formato Q8_0 (GGUF, 27,82 GB) y un circuito adicional de verificación proof-of-work embebido en el propio grafo (`qwork.bin`, 0,53 GB). El modelo base cuenta con 26.070.385.152 parámetros según los safetensors del repositorio, lo que lo sitúa en la categoría de modelos densos de ~26B.

La innovación principal de esta derivación no está en el modelo lingüístico, sino en el añadido de un mecanismo determinista de proof-of-work opt-in y desactivado por defecto, que se ejecuta dentro del propio ONNX Runtime sin acceso a red, cadena de bloques ni cartera. Este circuito produce recibos canónicos de 91 tokens verificables offline mediante `verify_qwork.py`, con resultados bit-exactos independientemente de la cuantización (IQ4_NL y Q8_0 generan el mismo digest).

El interés actual de esta ficha es doble: por un lado, documenta un caso poco habitual de empaquetado ONNX con lógica de control embebida en las claves no atendidas del KV cache; por otro, sirve como referencia de despliegue de un modelo de 26B en entornos con requisitos estrictos de memoria (36-48 GB mínimo para Q8_0). La información pública disponible sobre el modelo base es limitada en esta búsqueda, por lo que varios campos técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Inkling-2-Mini); bundle ONNX con circuito QWork embebido |
| Parámetros totales | 26.070.385.152 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (según la model card del derivado) |
| Tipos de cuantización | Q8_0 (este repo); IQ4_NL disponible en derivado companion |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`actual-merged.onnx`), GGUF (`Inkling-2-Mini-Q8_0.gguf`), `qwork.bin` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 26.070 millones de parámetros. La model card del derivado no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF, DPO o ajuste por preferencias; estos datos no están disponibles en la información proporcionada. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia en el backbone.

La aportación técnica del derivado consiste en un circuito de verificación proof-of-work de 24 capas INT16/INT32 con activación gated-MLP, embebido en el grafo ONNX y ejecutado en CPU. El circuito transforma una entrada SHA-256 mediante un PRNG xoshiro256** y produce un recibo SHA-256 determinista de 91 tokens. La lógica de control reside exclusivamente en `present.0.key[0, 0, 0, 128:544]`, una región no atendida del KV cache, de modo que la atención (`[0:128]`) y la cola de convolución corta (`[-3:, 128:544]`) nunca leen ese estado. La activación requiere una concesión explícita en el mensaje de sistema (`QWORK_GRANT:cap=<0..4>:nonce=<h0>:...:<h7>;`), se limita a un máximo de 4 nodos, se desarma con `[QWORK_STOP]` y se reinicia incondicionalmente en cada nuevo turno. El autor reporta que el circuito es independiente de la cuantización: IQ4_NL y Q8_0 producen digests idénticos.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Ejecución de un circuito proof-of-work determinista opt-in, activable mediante concesión en el mensaje de sistema y disparable con el token `[QWORK_RUN]`.
- Emisión de recibos canónicos de 91 tokens verificables offline con `verify_qwork.py`.
- Control de estado mid-turno: parada con `[QWORK_STOP]`, cancelación vía `Cancel()` del host y reinicio automático en cada turno.
- Resistencia a inyección de prompt: las concesiones incluidas en mensajes de usuario o de herramienta se ignoran.
- Compatibilidad con Foundry Local `ChatSession`, incluyendo hosts que re-prefillan la conversación completa (`past_len == 0`).
- Soporte de ejecución híbrida WebGPU/CPU mediante `onnxruntime-genai` con el execution provider WebGPU 0.6.0.
- Capacidades de tool calling, agentes, matemáticas, código o visión: no disponibles en la información proporcionada.

## Casos de uso

- Verificación determinista de integridad en pipelines locales: el circuito QWork permite generar recibos reproducibles que un verificador offline puede comprobar sin acceso a red, útil en entornos air-gapped donde se requiere atestación de cómputo.
- Despliegue de un LLM de 26B en estaciones de trabajo con 36-48 GB de memoria unificada: el bundle ONNX Q8_0 está pensado para Foundry Local y `onnxruntime-genai`, lo que facilita su integración en aplicaciones de escritorio con aceleración WebGPU.
- Auditoría de conversaciones: el recibo de 91 tokens emitido tras `[QWORK_RUN]` actúa como sello verificable de un turno concreto, útil para trazabilidad de sesiones en sistemas de soporte o registro.
- Pruebas de resistencia a prompt injection: el modelo ignora concesiones inyectadas en mensajes de usuario o herramienta, lo que lo hace adecuado como banco de pruebas para evaluar defensas en agentes conversacionales.
- Evaluación de cuantización en producción: al producir digests idénticos entre IQ4_NL y Q8_0, permite comparar el impacto de la cuantización en la calidad del backbone sin que el circuito de control introduzca variabilidad.
- Integración en hosts con re-prefill completo: el guard de concesión obsoleta (EOS previo `200006`) evita que una concesión de turno 1 se reactive en hosts que reprocesan toda la conversación, lo que simplifica el despliegue en clientes tipo Foundry Local `ChatSession`.
- Benchmarking de execution providers: el autor documenta mejoras medibles al sustituir `UINT8 Slice` por `UINT8 Gather` en WebGPU, lo que convierte este artefacto en un caso de referencia para optimizar exportaciones ONNX con dequantización de pesos.

## Benchmarks y rendimiento

La model card incluye métricas de rendimiento medidas en AMD Radeon 8060S iGPU con `onnxruntime-ep-webgpu` 0.6.0, pero no benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K). Se reproducen a continuación las métricas de rendimiento disponibles:

| Métrica | Antes | Después |
|---|---|---|
| Prefill 25 tokens (ORT directo) | 76,13 s | 35,79 s |
| Prefill 78 tokens TTFT (Foundry Local) | 226,18 s | 92,7–95,0 s |
| Decode (AMD Radeon 8060S iGPU) | 5,48 s/token | ~3,13 s/token |
| `MemcpyToHost` total | 34,85 s / 27.647 copias | 2,11 s / 1.812 copias |

Resultados de cualificación (5 pruebas end-to-end, Foundry Local SDK 2.5.0, ORT 1.32.0, GenAI 0.20.0, WebGPU EP 0.6.0):

| Prueba | IQ4_NL | Q8_0 |
|---|---|---|
| T1 opt-in mid-thought QWork + STOP natural | PASS (`7406475c…f61a88`) | PASS (mismo digest) |
| T2 multi-turno, concesión obsoleta no rearma | PASS (0 recibos, re-prefill 441 tokens) | PASS (0 recibos) |
| T3 concesión falsificada en texto de usuario | PASS (0 recibos, 603 tokens) | PASS (0 recibos) |
| T4 `do_sample=true, temperature=0.7` | PASS (`9d70d932…c0a9ce`) | PASS (mismo digest) |
| T5 streaming `Cancel()` + recuperación | PASS (2,55 s) | PASS (2,37 s) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM unificada mínima para Q8_0: 36-48 GB según la model card; no cabe en sistemas de 24 GB.
- Para la variante IQ4_NL (derivado companion): mínimo 24 GB (ajustado a 512-2048 tokens de contexto; 32 GB recomendable a 4096).
- GPU recomendadas: el autor cualifica en AMD Radeon 8060S iGPU con WebGPU EP 0.6.0; no se especifican modelos NVIDIA (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU consumer: no en el caso de Q8_0 (27,82 GB de pesos + 0,53 GB de `qwork.bin`); IQ4_NL (17,63 GB + 0,53 GB) es viable en GPUs con 24 GB.
- Opciones de despliegue: `onnxruntime-genai`, Foundry Local SDK 2.5.0, ONNX Runtime 1.32.0, WebGPU EP 0.6.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput medidos: ~3,13 s/token en decode sobre Radeon 8060S iGPU; TTFT de 92,7–95,0 s para prefill de 78 tokens en Foundry Local. Los 73 MatMul del circuito QWork se ejecutan en CPU para garantizar bit-exactitud entre Metal y Radeon.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base Inkling-2-Mini ni de alternativas comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| staccs/inkling-2-mini-q8-qwork-v2 | 26,07B | 4096 | Apache-2.0 | ONNX + GGUF + qwork.bin | Derivado con circuito QWork embebido |
| thinkingmachines/Inkling-2-Mini | 26,07B (según safetensors del derivado) | No disponible | Apache-2.0 | No disponible | Modelo base |
| Alternativas de ~26B | No disponible | No disponible | No disponible | No disponible | Sin datos en la información disponible |

## Limitaciones y advertencias

- El modelo base no documenta en esta ficha la composición de su dataset ni sesgos conocidos; no disponible.
- Riesgo de alucinación: inherente a modelos generativos; no se han publicado evaluaciones específicas para este derivado.
- Contexto limitado a 4096 tokens, lo que restringe casos de uso con documentos largos o conversaciones extensas.
- Idiomas soportados no disponibles; no se puede garantizar calidad multilingüe.
- El circuito QWork añade 0,53 GB y 73 MatMul en CPU; en hardware modesto puede degradar la latencia del turno en el que se activa.
- El mecanismo de activación depende de una concesión en el mensaje de sistema; hosts que no respeten el formato `QWORK_GRANT` no podrán activarlo.
- El guard de concesión obsoleta depende de la detección del EOS `200006`; si un host altera ese token, la protección podría no aplicarse.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del circuito embebido en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria independiente.
- La model card está truncada en la sección de verificación offline ("Known-good vec"), por lo que los vectores de prueba completos no están disponibles en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/inkling-2-mini-q8-qwork-v2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Derivado companion IQ4_NL: https://huggingface.co/staccs/inkling-2-mini-q8-qwork-v2 (referenciado en la model card; el autor indica que debe intercambiarse el enlace entre ambos derivados al subir)
- Script de verificación offline: `verify_qwork.py` (incluido en el repositorio, según la model card)
- ONNX Runtime GenAI: no se proporciona URL en la información disponible
- Foundry Local: no se proporciona URL en la información disponible

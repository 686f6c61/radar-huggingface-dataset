# staccs/inkling-2-mini-iq4nl-qwork-v2

## Resumen

`staccs/inkling-2-mini-iq4nl-qwork-v2` es una derivación cuantizada del modelo `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `staccs` bajo licencia Apache-2.0. Se distribuye como bundle autocontenido para ONNX Runtime GenAI y Foundry Local, con pesos en formato GGUF (variante IQ4_NL) y un grafo ONNX fusionado (`actual-merged.onnx`). El modelo base cuenta con 26.070.385.152 parámetros (aproximadamente 26 000 millones) y una ventana de contexto declarada de 4096 tokens.

La particularidad de esta derivación es la incorporación de un circuito determinista de verificación de proof-of-work denominado QWork, embebido directamente en los pesos del grafo ONNX. Este circuito está desactivado por defecto y solo se activa mediante una concesión explícita en el mensaje de sistema (`QWORK_GRANT`), con un límite duro de capacidad de 4. Toda la computación es local, sin actividad de red, cadena de bloques ni cartera, y respeta la cancelación del host.

El interés técnico de este artefacto radica en su enfoque de empaquetado: optimiza el rendimiento del backend WebGPU de ONNX Runtime GenAI reescribiendo 1122 operaciones `Slice` de dequantización a `Gather` nativas, y demuestra que el circuito QWork produce digests idénticos tanto en cuantización IQ4_NL como Q8_0, lo que lo hace independiente de la cuantización. Está pensado para despliegues locales en Foundry Local con memoria unificada limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Inkling-2-Mini), empaquetado como grafo ONNX con circuito QWork embebido |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | IQ4_NL (17,63 GB) y Q8_0 (27,82 GB, derivación compañera) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Inkling-2-Mini-IQ4_NL.gguf`) + ONNX fusionado (`actual-merged.onnx`) + `qwork.bin` (0,53 GB) |

## Arquitectura y entrenamiento

El modelo base es `thinkingmachines/Inkling-2-Mini`, del que esta ficha no dispone de detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o innovaciones como decodificación especulativa) más allá de su naturaleza conversacional. La derivación añade un grafo ONNX fusionado que contiene tanto el decodificador del LLM como un circuito QWork de 24 capas INT16/INT32 con MLP con compuertas, que transforma un hash SHA-256 mediante un generador xoshiro256** y vuelve a aplicar SHA-256 para producir un recibo determinista de 91 tokens.

El circuito QWork se activa únicamente mediante una concesión en posición de sistema (`QWORK_GRANT:cap=<0..4>:nonce=<h0>:...:<h7>;`), se limita a `HARD_MAX_CAP = 4`, se desarma con `[QWORK_STOP]`, se reinicia en cada turno nuevo (`S > 1`) y respeta `Cancel()` del host. Todo el estado de control reside en `present.0.key[0, 0, 0, 128:544]`, fuera de la atención (`[0:128]`), de modo que no corrompe el decodificador. Los 73 `MatMul` del circuito QWork se ejecutan en CPU para garantizar recibos bit-exactos entre Metal y Radeon, mientras que los `MatMul` del backbone y la cabeza de salida corren íntegramente en WebGPU (6132/6132 y 1068/1068).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Inkling-2-Mini.
- Verificación determinista de proof-of-work opcional mediante el circuito QWork embebido, con recibos reproducibles offline (`verify_qwork.py`).
- Control de activación resistente a inyección de prompt: las concesiones en mensajes de usuario o herramienta se ignoran.
- Parada a mitad de turno (`[QWORK_STOP]`) y reinicio incondicional por turno para evitar fugas de concesiones entre turnos.
- Recuperación tras cancelación en streaming (honrada en 2,55 s en IQ4_NL y 2,37 s en Q8_0).
- Compatibilidad con `do_sample=true, temperature=0.7`: los recibos siguen siendo 100 % deterministas mediante logits one-hot en `[-inf, 0.0]`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en Foundry Local sobre equipos con memoria unificada de 24 GB o superior: el bundle IQ4_NL (17,63 GB) más `qwork.bin` (0,53 GB) encaja en configuraciones ajustadas a 512-2048 tokens de contexto y resulta cómodo a partir de 32 GB para 4096 tokens. Es adecuado para asistentes conversacionales en estación de trabajo sin GPU dedicada de gran capacidad.
- Verificación de integridad de ejecución en entornos sin red: el circuito QWork genera recibos de 91 tokens verificables con `verify_qwork.py` y `--verify-table`, lo que permite auditar que una inferencia concreta se ejecutó en el dispositivo esperado sin servicios externos.
- Pruebas de reproducibilidad entre backends gráficos: al producir digests idénticos en Metal y Radeon, el artefacto sirve para validar pipelines de inferencia que deben dar resultados bit-exactos en hardware heterogéneo.
- Integración en aplicaciones ONNX Runtime GenAI con backend WebGPU: la reescritura de las 1122 operaciones `Slice` a `Gather` reduce el prefill de 25 tokens de 76,13 s a 35,79 s y el decode de 5,48 s/token a aproximadamente 3,13 s/token en una iGPU AMD Radeon 8060S, lo que hace viable el uso interactivo en portátiles.
- Evaluación de mecanismos antiinyección de prompt: los tests T2 (concesión obsoleta que no debe rearmarse) y T3 (concesión falsificada en texto de usuario) documentan un comportamiento verificable de cero recibos, útil como banco de pruebas de controles de seguridad en LLM.
- Prototipado de esquemas de prueba de trabajo locales para aplicaciones de agentes: el diseño de concesión en posición de sistema, límite duro de capacidad y reinicio por turno puede reutilizarse como referencia para implementar controles de coste computacional en pipelines propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento publicados corresponden a latencias medidas del empaquetado ONNX/WebGPU:

| Metrica | Antes | Despues |
|---|---|---|
| Prefill de 25 tokens (ORT directo) | 76,13 s | 35,79 s |
| TTFT de prefill de 78 tokens (Foundry Local) | 226,18 s | 92,7–95,0 s |
| Decode en AMD Radeon 8060S iGPU | 5,48 s/token | ~3,13 s/token |
| `MemcpyToHost` total | 34,85 s / 27 647 copias | 2,11 s / 1 812 copias |

Resultados de cualificación (AMD Radeon 8060S, Foundry Local SDK 2.5.0, ORT 1.32.0, ONNX Runtime GenAI 0.20.0, WebGPU EP 0.6.0):

| Test | IQ4_NL | Q8_0 |
|---|---|---|
| T1 opt-in mid-thought QWork con `STOP` natural | PASS (`7406475c…f61a88`, oráculo válido) | PASS (mismo digest) |
| T2 multi-turno, concesión obsoleta no debe rearmarse | PASS (0 recibos, re-prefill completo de 441 tokens) | PASS (0 recibos) |
| T3 concesión falsificada en texto de usuario | PASS (0 recibos, deliberación de 603 tokens) | PASS (0 recibos) |
| T4 `do_sample=true, temperature=0.7` | PASS (`9d70d932…c0a9ce`, oráculo válido) | PASS (mismo digest) |
| T5 `Cancel()` en streaming y recuperación | PASS (honrado en 2,55 s, sin recibo tardío) | PASS (2,37 s) |

## Requisitos de hardware

- VRAM/RAM unificada mínima para IQ4_NL: 24 GB (ajustado a 512-2048 tokens de contexto; cómodo a partir de 32 GB para 4096 tokens).
- VRAM/RAM unificada mínima para Q8_0: 36-48 GB; no cabe en sistemas de 24 GB.
- Tamaño en disco: 17,63 GB para el GGUF IQ4_NL más 0,53 GB de `qwork.bin`; el repositorio ocupa 18,2 GB.
- GPU recomendadas: no se especifican modelos concretos; las mediciones publicadas se realizaron en una iGPU AMD Radeon 8060S. No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más de VRAM (por ejemplo, RTX 3090/4090) para la variante IQ4_NL, aunque no se aportan mediciones en esas GPU.
- Opciones de despliegue: ONNX Runtime GenAI (versión 0.20.0 en las pruebas), Foundry Local (SDK 2.5.0), backend WebGPU EP 0.6.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: decode de ~3,13 s/token en AMD Radeon 8060S; TTFT de 92,7-95,0 s para un prefill de 78 tokens en Foundry Local. No se proporcionan cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `staccs/inkling-2-mini-iq4nl-qwork-v2` | 26 070 385 152 | 4096 | IQ4_NL (17,63 GB) | Apache-2.0 | Hugging Face, 0 descargas |
| `staccs/inkling-2-mini-q8-qwork-v2` | no disponible | 4096 | Q8_0 (27,82 GB) | Apache-2.0 | Hugging Face (derivación compañera) |
| `thinkingmachines/Inkling-2-Mini` | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento frente a alternativas de la misma categoría; la comparación se limita a parámetros, cuantización, contexto y licencia.

## Limitaciones y advertencias

- No hay información publicada sobre sesgos del modelo base ni sobre evaluación de alucinación; deben asumirse los riesgos habituales de un LLM conversacional de 26 000 millones de parámetros.
- La ventana de contexto es de solo 4096 tokens, insuficiente para tareas de contexto largo.
- No se detallan los idiomas soportados; no puede confirmarse un buen rendimiento en castellano.
- El circuito QWork añade complejidad operativa: requiere colocar la concesión en el byte 0 del mensaje de sistema, respetar el límite de capacidad 4 y gestionar el reinicio por turno. Una configuración incorrecta puede producir cero recibos sin error visible.
- La activación del circuito consume presupuesto de contexto: requiere al menos 123 tokens de margen para ejecutarse y emite un recibo de 91 tokens.
- El rendimiento medido es lento para uso interactivo: ~3,13 s/token en decode sobre iGPU AMD Radeon 8060S; no hay datos que permitan extrapolar a GPU dedicadas.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (23 de noviembre de 2026), por lo que carece de validación comunitaria.
- Aunque la licencia es Apache-2.0, conviene revisar los términos del modelo base `thinkingmachines/Inkling-2-Mini` antes de un uso comercial en producción.
- El soporte se limita a ONNX Runtime GenAI y Foundry Local; no hay constancia de compatibilidad con otros runners.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/staccs/inkling-2-mini-iq4nl-qwork-v2
- Derivación compañera Q8_0: https://huggingface.co/staccs/inkling-2-mini-q8-qwork-v2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini

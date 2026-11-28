# staccs/Inkling-2-Mini-QWork-Q8

## Resumen

Inkling-2-Mini-QWork-Q8 es una edición cuantizada en Q8_0 del modelo base `thinkingmachines/Inkling-2-Mini`, publicada por el usuario `staccs`. Su particularidad no es la cuantización en sí, sino que el autor ha fusionado dentro del grafo del modelo un circuito de proof-of-work propio llamado `QWork/1`, vinculado a un ecosistema de criptomoneda denominado Qwencoin. El repositorio incluye además binarios nativos para Windows x64 (demonio de nodo, CLI, minero ROCm y utilidades de ordinales), scripts de lanzamiento y una tabla de consenso determinista (`qwork.bin`).

El modelo base tiene 26.070.385.152 parámetros (~26,1 mil millones) según los safetensors declarados, y el autor indica que el GGUF resultante en Q8_0 ocupa 27,82 GB. La arquitectura del modelo base no se detalla en la información disponible; la model card se centra casi por completo en el circuito QWork y en el stack de despliegue local para Windows con WebGPU y ROCm.

Es relevante ahora como ejemplo de una tendencia híbrida: modelos de lenguaje empaquetados con lógica criptoeconómica y binarios de infraestructura en el mismo repositorio. Para un desarrollador que busque un modelo de texto convencional, esta ficha debe leerse con cautela: buena parte del contenido del repo no es el modelo en sí, sino un conjunto de herramientas de minería y verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin detalle en la model card) |
| Parametros totales | 26.070.385.152 (~26,1 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (esta edición); IQ4_NL disponible en otra edición del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0, 27,82 GB) y ONNX (`actual-merged.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `thinkingmachines/Inkling-2-Mini`: la model card no describe capas, tipo de atención, número de tokens de entrenamiento ni si hubo RLHF o DPO. Los únicos datos estructurales que aparecen son los del circuito QWork fusionado, que no forma parte del transformer: se trata de una red gated-MLP de 24 capas con activaciones binarias, dimensiones 1024 → 3584 → 1024, pesos en INT16 con acumulación INT32, almacenada en la tabla `qwork.bin` (528 MB, SHA-256 `8f53884f...3f2c03`).

El pipeline del circuito QWork, según la model card, es: `seed = SHA256(SHA256(header[0:76] || 0x00000000))`, expansión con `xoshiro256**` de `(seed, header[76:80])` a un vector de 1024 dimensiones en {-1, +1}, paso por las 24 capas del gated-MLP, empaquetado de bits little-endian, plegado XOR de 4 bloques de 32 bytes, XOR con la seed y SHA-256 final para producir un digest hexadecimal de 64 caracteres. La cuantización Q8_0 no afecta al minado porque el circuito solo lee los tensores `qwork.v1.blk.*` añadidos al GGUF.

## Capacidades

- Generación de texto conversacional (pipeline declarado: `text-generation`).
- Ejecución de un turno de proof-of-work QWork bajo demanda mediante los comandos `/work PROMPT` o `/mine`; el minado está desactivado por defecto.
- Producción de recibos criptográficos `[QWORK_RECEIPT v=1 ...]` verificables de forma determinista.
- Inferencia local sin APIs en la nube, sobre Windows x64 con WebGPU.
- Minado en GPU AMD vía ROCm 7.2 con el binario `qwork-rocm-miner.exe` (INT8 WMMA).
- Soporte de tool calling, function calling, agentes multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Chat local en estación de trabajo Windows: el script `launch_inkling_windows.py` arranca una sesión interactiva Q8 con descubrimiento y verificación SHA-256 de los binarios y del runtime WebGPU, sin necesidad de configurar variables de entorno manualmente. Adecuado para equipos con 64–128 GB de VRAM o memoria unificada.
- Verificación offline de recibos QWork: `verify_qwork.py` permite comprobar un recibo contra la tabla `qwork.bin` en cualquier máquina, útil para auditoría de integridad en pipelines de CI.
- Despliegue de un nodo Qwencoin: los binarios `qwencoind.exe` y `qwencoin-cli.exe` permiten levantar un nodo sin cartera por defecto (`--enable-wallet` para activarla), con confirmación explícita `APPROVE` para publicaciones en el Graph y lanzamientos FUN.
- Minado en GPU AMD: `qwork-rocm-miner.exe` sobre Radeon 8060S (`gfx1151`) alcanza 18.875–20.535 H/s con INT8 WMMA, entre 1.430× y 1.556× más rápido que el modo CPU de 8 workers (13,2 H/s).
- Publicación de contenido en el ecosistema Ord/Qwencoin: el stack incluye `ord.exe` 0.29.1 y `hashfund.exe` para interactuar con ordinales y el sistema de financiación por hash.
- Investigación sobre modelos híbridos ML/cripto: el repositorio sirve como caso de estudio de fusión de un circuito determinista dentro de un grafo ONNX/GGUF y de separación entre deliberación de texto y ejecución de cómputo autorizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento medido es el del minero ROCm: 18.875–20.535 H/s en Radeon 8060S frente a 13,2 H/s en CPU de 8 workers, con 0 diferencias frente a `qwork.dll` tanto en `qwork.bin` como en los GGUF Q8_0 e IQ4_NL.

## Requisitos de hardware

- VRAM/memoria: el autor indica estaciones de trabajo de 64–128 GB de VRAM o memoria unificada para la edición Q8_0 (GGUF de 27,82 GB más el grafo ONNX y la tabla `qwork.bin` de 528 MB).
- GPU recomendadas: AMD Radeon 8060S (`gfx1151`) es la plataforma verificada para el minero ROCm 7.2; el autor menciona workstations AMD de 128 GB. Para el modelo en sí no se listan GPU concretas.
- GPU de consumo: no se confirma que quepa en GPU de consumo de 24 GB; el tamaño del GGUF Q8_0 (27,82 GB) supera esa cifra. La edición IQ4_NL del mismo autor está pensada para Apple Silicon de 24–36 GB (18 GB).
- Despliegue: lanzador propio para Windows x64 con WebGPU (Microsoft WebGPU EP 0.6.0), ONNX Runtime, binarios nativos PE x64 y minero ROCm. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de generación de texto: no disponibles. El único throughput publicado es el del minero (19,2–20,5 kH/s en GPU AMD).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-QWork-Q8 (esta ficha) | ~26,1 B | no disponible | Apache 2.0 | GGUF Q8_0, ONNX | Incluye circuito QWork y binarios Windows |
| Inkling-2-Mini-QWork-IQ4 (mismo autor) | no disponible | no disponible | Apache 2.0 | GGUF IQ4_NL | 18 GB, orientado a Apple Silicon de 24–36 GB |
| thinkingmachines/Inkling-2-Mini (base) | ~26,1 B | no disponible | no disponible | no disponible | Modelo original sin circuito QWork |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes ni con modelos de terceros de tamaño similar.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación de alucinación del modelo base; no hay base para afirmar nada sobre su calidad conversacional.
- El repositorio mezcla el modelo con binarios ejecutables de nodo, minero y utilidades cripto. Los propios binarios se declaran sin firmar (`NotSigned`), lo que implica riesgo de integridad si no se verifica el SHA-256.
- El minado QWork está desactivado por defecto, pero el stack incluye funcionalidad de mainnet (nodo, Graph, lanzamientos FUN). Revisar el impacto legal y fiscal de operar un nodo o minar en la jurisdicción correspondiente.
- La licencia Apache 2.0 cubre el modelo, pero no está claro que cubra los binarios de terceros empaquetados (`ord.exe`, runtime WebGPU de Microsoft); conviene revisar cada componente.
- El tamaño Q8_0 (27,82 GB) más el grafo ONNX exige memoria muy alta; no es desplegable en GPU de consumo habituales sin recurrir a la edición IQ4_NL.
- No hay información sobre longitud de contexto ni idiomas soportados, lo que impide garantizar su idoneidad para tareas multilingües o de contexto largo.
- La fecha de creación del repositorio (2026-11-22) y el ecosistema Qwencoin no cuentan con validación externa en la información disponible; tratar las afirmaciones de la model card como no auditadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/Inkling-2-Mini-QWork-Q8
- Colección Inkling-2-Mini × QWork: https://huggingface.co/collections/staccs/inkling-2-mini-qwork
- Edición IQ4_NL: https://huggingface.co/staccs/Inkling-2-Mini-QWork-IQ4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime WebGPU EP de Microsoft (PyPI): https://pypi.org/simple (paquete referenciado en `requirements-win.txt`)

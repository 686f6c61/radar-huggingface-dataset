# yanauto/Inkling-2-Mini-heretic-full-GGUF

## Resumen

Inkling-2-Mini-heretic-full-GGUF es una distribución de pesos cuantizados en formato GGUF del modelo yanauto/Inkling-2-Mini-heretic-full, que a su vez es una versión "decensored" (abliterated) del modelo Inkling 2 Mini de Thinking Machines. El modelo original es un transformer de tipo MoE con arquitectura "looped" (expertos en bucle), 26.400 millones de parámetros totales y 3.400 millones activos por token, con capacidad multimodal de texto e imagen. Esta versión GGUF está pensada para ejecución local con llama.cpp.

El proceso de "decensado" se realizó con la técnica Heretic ARA, editando tanto la salida de atención como todos los expertos enrutados. Según la model card, la tasa de rechazos cayó de 100/100 a 5/100 (7/97 con el modo thinking activado), con un coste de MMLU del 78,7 % al 77,0 % y una divergencia KL de 0,120. El resultado es un modelo que responde a peticiones que el original rechaza, manteniendo buena parte de sus capacidades.

La relevancia de esta ficha radica en que permite ejecutar un MoE multimodal de 26B en hardware de consumo (24 GB de VRAM con Q4_K_M) y en Macs con 32 GB de memoria unificada, algo poco habitual en modelos de este tamaño. La licencia Apache 2.0 facilita su uso comercial, aunque el autor remite a la política de uso aceptable del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos en bucle (looped MoE), multimodal texto + imagen |
| Parametros totales | 26.070.385.152 (26,07B) |
| Parametros activos | 3,4B (según model card) |
| Longitud de contexto | 32.768 tokens (valor de ejemplo en el comando de llama-server; no se especifica el máximo oficial) |
| Tipos de cuantizacion | Q4_K_M, Q8_0, BF16 (y proyector de visión F16 aparte) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini emplea una arquitectura MoE con "looping": los expertos se aplican de forma iterativa o en bucle, lo que permite aumentar la capacidad efectiva sin disparar los parámetros activos por token. Con 26,4B totales y solo 3,4B activos, el coste computacional por token es bajo en relación al tamaño del modelo. Incorpora además un proyector de visión (mmproj) que habilita la entrada de imágenes, por lo que es un modelo multimodal texto-imagen.

Sobre el entrenamiento original no se dispone de detalles en la información proporcionada (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). Lo que sí está documentado es el post-entrenamiento aplicado por yanauto: una edición con Heretic ARA sobre la salida de atención y sobre todos los expertos enrutados, con el objetivo de eliminar rechazos. Los pesos de los expertos del modelo fuente están en BF16, por lo que el archivo BF16 de esta distribución es sin pérdida respecto al original y Q8_0 es efectivamente sin pérdida. La cuantización se realizó con una importance matrix (imatrix) calculada sobre wikitext-2 (200 chunks de entrenamiento), usando llama.cpp b12600 (commit 29b52d3).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" activado por defecto (el modelo piensa antes de responder, como el original).
- Procesamiento de imágenes mediante el proyector de visión (mmproj F16).
- Capacidades de código y matemáticas inherentes al modelo base (no cuantificadas en la información disponible).
- Soporte de plantilla Jinja (`--jinja`) en llama-server, lo que habilita el formato de chat estructurado.
- Comportamiento "uncensored": responde a peticiones que el modelo original rechaza.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en estación de trabajo con GPU de 24 GB: el archivo Q4_K_M (17,5 GB) cabe en una RTX 4090 o similar, permitiendo ejecutar un MoE de 26B con capacidades multimodales sin infraestructura de servidor.
- Despliegue en Mac con memoria unificada: con 32 GB de memoria unificada el Q4_K_M deja margen para contexto, lo que facilita prototipado y uso personal en portátiles Apple Silicon.
- Procesamiento de documentos con imagen: gracias al proyector de visión se pueden enviar capturas, diagramas o páginas escaneadas junto a instrucciones de texto para extracción o descripción.
- Investigación sobre alineación y censura: la disponibilidad de las métricas de rechazo (100/100 → 5/100) y de divergencia KL (0,120) permite estudiar el efecto del ablacionado sobre el comportamiento y el rendimiento.
- Generación de contenido creativo sin restricciones de rechazo: útil en entornos controlados donde se necesita que el modelo no decline peticiones por motivos de política.
- Evaluación comparativa de cuantizaciones: los tres archivos publicados (Q4_K_M, Q8_0, BF16) con sus perplejidades en wikitext-2 (6,913 / 6,846 / 6,854) permiten medir el impacto real de la cuantización en este modelo concreto.
- Servicio conversacional autoalojado: con llama-server y plantilla Jinja se puede exponer una API compatible con endpoints para integrar el modelo en aplicaciones propias.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas del proceso de decensado y las perplejidades de las cuantizaciones.

| Metrica | Original | Heretic-full |
|---|---|---|
| Tasa de rechazos | 100/100 | 5/100 (7/97 con thinking) |
| MMLU | 78,7 % | 77,0 % |
| Divergencia KL | — | 0,120 |

| Archivo | Tamano | Perplejidad (wikitext-2, 40 chunks) |
|---|---|---|
| Q4_K_M | 17,5 GB | 6,913 |
| Q8_0 | 27,8 GB | 6,846 |
| BF16 | 52,2 GB | 6,854 |
| mmproj F16 | 0,64 GB | proyector de visión |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere unos 17,5 GB de pesos más overhead de contexto; cabe en 24 GB de VRAM con margen para contexto. Q8_0 (27,8 GB) no cabe en 24 GB y requiere 32 GB o más. BF16 (52,2 GB) requiere al menos 64 GB de VRAM o descarga parcial a CPU.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M; A100 40/80 GB o H100 para Q8_0 y BF16.
- Consumer GPU: sí, Q4_K_M en RTX 4090, RTX 3090 (24 GB) y similares; también en Mac con 32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (llama-server), con soporte de Inkling 2 requerido (build b12600 o posterior). Compatible con endpoints (`endpoints_compatible`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El modelo activa 3,4B parámetros por token, lo que en teoría reduce el coste por token frente a un denso de 26B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. A modo orientativo estructural:

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-heretic-full | 26,07B | 3,4B | 32.768 (ejemplo) | Apache 2.0 | GGUF |
| Inkling 2 Mini (original) | 26,4B | 3,4B | no disponible | no disponible | safetensors |
| Inkling-2-Mini-heretic (solo atención) | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

## Limitaciones y advertencias

- El modelo ha sido ablacionado para eliminar rechazos; responderá a peticiones que el original declina. El autor exime de responsabilidad y remite a la política de uso aceptable de Thinking Machines.
- El ablacionado tiene un coste medible: MMLU baja 1,7 puntos y la divergencia KL de 0,120 indica desviación respecto a la distribución original, con posible degradación en tareas sensibles a la alineación.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- La longitud máxima de contexto no está confirmada; el valor de 32.768 aparece solo como ejemplo en el comando de llama-server.
- Requiere una build de llama.cpp con soporte específico para Inkling 2; versiones anteriores no cargarán el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del comportamiento en producción.
- El tamaño del repositorio (98,3 GB) implica una descarga considerable si se quieren todas las cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full-GGUF
- Modelo base (Heretic-full): https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
- Versión solo atención: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Modelo original Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/

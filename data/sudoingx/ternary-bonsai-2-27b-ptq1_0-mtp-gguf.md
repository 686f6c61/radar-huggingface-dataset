# sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF

## Resumen

Ternary Bonsai 2 27B PTQ1_0 MTP GGUF es una cuantización ternaria de 1,75 bits por peso del modelo Qwen 3.8 27B, publicada por el usuario sudoingx sobre el trabajo de compresión de PrismML. El artefacto principal es un único fichero GGUF de 7,0 GB que incorpora de nuevo la cabeza de predicción multi-token (MTP) de Qwen 3.8 27B como bloque 64, lo que permite decodificación especulativa nativa en el fork de llama.cpp de PrismML mediante `--spec-type draft-mtp`. El objetivo es claro: hacer que un modelo de 27.320 millones de parámetros quepa y funcione a velocidades utilizables en GPUs de consumo con 8 GB o más de VRAM, incluidas RTX 20, 30, 40 y 50, y Radeon en fase beta vía Vulkan.

La relevancia técnica no está solo en la compresión ternaria, sino en el trabajo de kernel que la acompaña. En la rama #218 del fork de PrismML, una verificación de 3 tokens pasa de costar 2,28 veces un token individual a 1,55 veces, y la decodificación de un solo token sube de 26 a 40 tok/s en una RTX 3060 de 12 GB. Con decodificación especulativa y `GGML_CUDA_BATCH_INVARIANT=1` se alcanzan 50,1 tok/s en esa misma tarjeta, con una tasa de aceptación del borrador de 0,85 a 0,95 en Python y 0,45 a 0,68 en prosa.

El modelo se distribuye con licencia Apache 2.0, formato GGUF y soporte de contexto completo de 262.144 tokens en tarjetas de 16 GB o más (195K en 12 GB, hasta 64K en 8 GB). Incluye scripts de instalación de una línea para Windows y Linux, y una API compatible con OpenAI en `/v1` bajo el identificador `bonsai-2-27b`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen 3.8 27B) con cuantización ternaria PTQ1_0 y cabeza MTP añadida como bloque 64 |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens en 16 GB o más; ~195K en 12 GB; hasta 64K en 8 GB |
| Tipos de cuantizacion | PTQ1_0 ternario a 1,75 bits por peso (fichero principal); existe también PQ2_0 a 7,21 GB en otros grafts |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Ternary-Bonsai-2-27B-PTQ1_0-mtp.gguf`, 7,0 GB) |

## Arquitectura y entrenamiento

La base es Qwen 3.8 27B, un transformer denso de 27.320 millones de parámetros. Sobre él, PrismML aplica una compresión ternaria post-entrenamiento (PTQ1_0) que reduce los pesos a 1,75 bits efectivos, dando lugar a Ternary Bonsai 2 27B con un fichero de 5,95 GB. Esta publicación de sudoingx parte de ese material y le injerta la cabeza de predicción multi-token original de Qwen 3.8 27B como bloque 64, de modo que el fork de llama.cpp de PrismML pueda ejecutar decodificación especulativa con `--spec-type draft-mtp`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La innovación técnica destacable es doble: por un lado, la propia compresión ternaria que permite meter 27B en 7 GB; por otro, el kernel de la rama #218 de PrismML, que reduce el coste de verificación de un lote de 3 tokens de 2,28x a 1,55x respecto a un token individual, y eleva el decode de un solo token de 26 a 40 tok/s. La cabeza MTP fue entrenada por Qwen contra estados ocultos en fp16, mientras que aquí lee un tronco ternario, lo que explica una aceptación inferior a la de Qwen 3.8 original (aproximadamente 0,70) pero todavía muy por encima del umbral de rentabilidad.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento configurable mediante `--reasoning-effort` (niveles como medium).
- Razonamiento y resolución de problemas, heredado de Qwen 3.8 27B.
- Generación de código en varios lenguajes: la tasa de aceptación del borrador MTP es de 0,85 a 0,95 en Python y 0,73 a 0,81 en bash, lo que indica buen comportamiento en código.
- Capacidad de visión cuando se carga la torre visual en tarjetas de 16 GB o más (script `serve-16gb-mtp-vision.sh`).
- Decodificación especulativa con la cabeza MTP integrada, soportada por el fork de PrismML de llama.cpp.
- Servidor compatible con OpenAI en `/v1` con el identificador de modelo `bonsai-2-27b`.
- Soporte de plantillas Jinja (`--jinja`) para formateo de conversaciones.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local sobre GPU de consumo: con 50,1 tok/s en una RTX 3060 12 GB y aceptación MTP de 0,85-0,95 en Python, el modelo es viable para autocompletado y generación de funciones en un IDE sin depender de la nube, manteniendo el código dentro de la máquina.
- Chat conversacional con contexto largo: los 131.072 tokens configurados en la línea de servicio (y hasta 262.144 en 16 GB) permiten arrastrar documentación extensa o historiales de conversación largos; a 41,8K tokens llenos se mantienen 22,23 tok/s sin cabeza y 26,86 tok/s con n-max 1.
- Procesamiento de documentos largos: con aceptación de 0,65-0,73 en documentos de 18K a 120K tokens, es adecuado para resumen y extracción sobre contratos, informes o expedientes que no caben en modelos de contexto corto.
- Análisis de imágenes en estaciones con 16 GB o más: la torre de visión permite describir capturas, diagramas o documentos escaneados, con aceptación MTP de 0,88 en prompts de imagen.
- Automatización de scripts y tareas de shell: la aceptación de 0,73-0,81 en bash y los 50,1 tok/s en ese dominio lo hacen práctico para generar y revisar scripts de administración de sistemas.
- Despliegue de API interna compatible con OpenAI: el endpoint `/v1` con modelo `bonsai-2-27b` permite sustituir llamadas a APIs externas en prototipos y herramientas internas sin cambiar el código cliente.
- Inferencia en hardware modesto o heterogéneo: los scripts de instalación eligen automáticamente el binario y el fichero según la VRAM, lo que facilita desplegar en parques de RTX 20/30/40/50 y Radeon (beta) con 8 GB o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de rendimiento publicados son medidas de throughput y aceptación de decodificación especulativa en RTX 3060 12 GB, con contexto de 131.072, K/V en q4_0 y medición del lado del cliente (3 prompts x 3 ejecuciones, medianas):

| Build | Configuración | tok/s |
|---|---|---:|
| PrismML release prism-b10685 | cabeza off | 25,0 |
| PrismML release prism-b10685 | draft-mtp, n-max 1 | 27,1 (+8%) |
| Rama kernel #218 | cabeza off | 39,8 |
| Rama kernel #218, `GGML_CUDA_BATCH_INVARIANT=1` | draft-mtp, n-max 1 | 50,1 (código 53,2; bash 50,1; prosa 41,8) |
| Rama kernel #218, `GGML_CUDA_BATCH_INVARIANT=1` | draft-mtp, n-max 2 | 45,4 |

`llama-bench` en la misma tarjeta con el fichero PTQ1_0 original (`-fa 1 -ctk q4_0 -ctv q4_0 -r 3`): tg128 pasa de 26,32 a 40,54 tok/s; pp512 se mantiene en 269,6 → 268,7 tok/s (el prefill no se ve afectado).

Rendimiento con contexto lleno en la rama #218:

| Contexto lleno | Cabeza off | n-max 1 | n-max 2 |
|---|---:|---:|---:|
| 18K | 29,6 | 33,9 | — |
| 39K | 22,9 | 27,5 | — |
| 41,8K | — | 26,86 | 21,08 |
| 77K | 16,1 | 18,3 | — |
| 115K | 12,4 | 13,9 | — |

La mejora de n-max 1 sobre cabeza off oscila entre +12% y +20% según profundidad; n-max 2 queda por debajo de cabeza off en todas las profundidades medidas. Tasa de aceptación del borrador: 0,85-0,95 en Python, 0,73-0,81 en bash, 0,45-0,68 en prosa, 0,65-0,73 en documento largo con 18K-120K de contexto y 0,88 en prompt de imagen con torre de visión cargada.

## Requisitos de hardware

- VRAM estimada: el fichero principal ocupa 7,0 GB, por lo que encaja en tarjetas de 8 GB (hasta 64K de contexto sin pantalla), 12 GB (~195K) y 16 GB o más (262.144 completos con visión).
- GPUs recomendadas y medidas: RTX 3060 12 GB (mediciones principales), RTX 5070 Ti 16 GB, RTX 20 en beta; soporte de RTX 30 y 40 con binario cuda12.4 sm86-sm89, RTX 20 con cuda12.4 sm75, RTX 50 con cuda12.8 sm120 (requiere CUDA 12.8 o superior para compilar).
- AMD Radeon: soporte beta mediante build Vulkan propio de PrismML, sin ROCm.
- Cabe en GPU de consumo: sí, desde 8 GB; los scripts `serve-8gb-mtp.sh`, `serve-12gb-mtp.sh` y `serve-16gb-mtp-vision.sh` seleccionan la configuración adecuada.
- Opciones de despliegue: llama.cpp (fork de PrismML, rama `bonsai2` o binarios precompilados del repo), con `llama-server` y API compatible con OpenAI; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput: 50,1 tok/s en RTX 3060 12 GB con MTP n-max 1 y kernel #218; 25,0 tok/s con el binario release sin MTP; prefill de 269,6 tok/s (pp512).
- Latencia: no se publican cifras de latencia por petición; el throughput con contexto lleno cae de 33,9 tok/s a 18K hasta 13,9 tok/s a 115K con n-max 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary Bonsai 2 27B PTQ1_0 MTP (esta ficha) | 27,32B | 262.144 (16 GB+) | GGUF 7,0 GB, 1,75 bpw | Apache 2.0 | MTP integrado, 50,1 tok/s en RTX 3060 12 GB |
| Ternary Bonsai 2 27B (PrismML, sin MTP) | 27,32B | no disponible | GGUF 5,95 GB, PTQ1_0 | Apache 2.0 | Base de esta publicación; 25,0 tok/s en RTX 3060 12 GB con release |
| Ternary Bonsai 2 27B PQ2_0 MTP (ProCreations, decent-jawfish, BoldingBuilds) | 27,32B | no disponible | GGUF 7,21 GB, PQ2_0 | Apache 2.0 | Grafts MTP sobre PQ2_0; BoldingBuilds midió +1,6% en PTQ1_0 antes del kernel #218 |
| Qwen 3.8 27B (original) | 27,32B | no disponible | fp16 / safetensors | no disponible | Aceptación MTP de referencia ~0,70; requiere mucha más VRAM |

## Limitaciones y advertencias

- La cuantización ternaria a 1,75 bpw introduce pérdida de calidad respecto al Qwen 3.8 27B en fp16; no se han publicado evaluaciones de calidad (MMLU, HumanEval) que cuantifiquen esa degradación.
- La cabeza MTP fue entrenada contra estados ocultos fp16 y aquí opera sobre un tronco ternario, por lo que la aceptación es inferior a la del modelo original; en prosa baja a 0,45-0,68, lo que reduce la ganancia de la decodificación especulativa en texto libre.
- n-max 2 rinde peor que n-max 1 e incluso que cabeza off en todas las profundidades medidas; la configuración recomendada es n-max 1.
- El rendimiento cae con el contexto lleno: de 33,9 tok/s a 18K hasta 13,9 tok/s a 115K con n-max 1.
- El soporte de AMD Radeon está en beta y depende del build Vulkan de PrismML, no de ROCm.
- RTX 20 está en beta; RTX 50 exige CUDA 12.8 o superior y la versión v1.1 de la rama para compilar.
- Los idiomas soportados no están documentados en la información disponible, lo que impide garantizar cobertura multilingüe.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad ni sesgos.
- Licencia Apache 2.0 permite uso comercial, pero el ecosistema depende de un fork específico de llama.cpp (rama #218 / `bonsai2`), lo que introduce riesgo de mantenimiento y de compatibilidad futura.
- El sibling sin censura (Offrail 27B) es un modelo distinto y no comparte los mismos pesos; no debe confundirse con esta publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF
- Repositorio de instaladores y sweeps: https://github.com/sudoingX/local-ai-on-your-gaming-gpu
- Pull request del kernel #218: https://github.com/PrismML-Eng/llama.cpp/pull/218
- Fork de llama.cpp (rama bonsai2): https://github.com/sudoingX/llama.cpp
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Graft MTP PQ2_0 (ProCreations): https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Graft MTP PQ2_0 (decent-jawfish): https://huggingface.co/decent-jawfish/bonsai-2-27b-mtp
- Graft MTP PQ2_0 (BoldingBuilds): https://huggingface.co/BoldingBuilds/Ternary-Bonsai-2-27B-Abliterated-PQ2_0-MTP-GGUF
- Hermano sin censura: https://huggingface.co/sudoingx/Offrail-27B-Uncensored

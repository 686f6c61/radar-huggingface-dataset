# webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF

## Resumen

Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF es una compilación experimental en formato GGUF del fine-tune Swift 1.5 de UkisAI sobre Qwen3.8-Flash-Next, publicada por el usuario webmp3 dentro de la línea "Sakura Micro". Se trata de una poda de expertos (expert pruning) aplicada sobre una cuantización IQ2_XS (GSQ-RCO, ~2,5 bits) ya existente: se conservan 352 de los 512 expertos enrutados por capa, seleccionados mediante estadísticas de enrutamiento sobre una mezcla de calibración en alemán e inglés, y se eliminan los 160 restantes sin recuantizar. El resultado ocupa 53,08 GiB repartidos en dos shards.

El modelo subyacente es un transformer MoE de arquitectura `qwen4exp` con 48 capas, 512 expertos y 10 activos por token, y un total de 139.175.502.720 parámetros según los datos reales del repositorio. La motivación principal de esta build es el ajuste a hardware de consumo: alrededor de 26 GiB de pesos quedan residentes en la GPU, lo que permite ejecutarla en una tarjeta de 32 GB (probado en una Radeon 8060S con 32 GiB de carve-out dedicado en un Strix Halo de 64 GB). La tabla de tokens por capa de 26,8 GiB se mantiene en disco o RAM mediante carga perezosa.

Es relevante ahora porque demuestra una técnica práctica de reducción de modelos MoE masivos para inferencia local: la poda selectiva de expertos por estadísticas de router permite bajar el peso en VRAM sin recuantizar, manteniendo una perplejidad dentro de ±1 % respecto a la build de 512 expertos. No es una versión oficial de Qwen ni de UkisAI, sino una compilación independiente de la comunidad, orientada a alemán e inglés y con una licencia propia (`swift-open-license-v1.0`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen4exp`), 48 capas, 512 expertos, 10 activos |
| Parametros totales | 139.175.502.720 |
| Parametros activos | 10 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | 32k (usado en las pruebas; máximo no disponible) |
| Tipos de cuantizacion | IQ2_XS (GSQ-RCO, ~2,5 bits) con poda de expertos a 352/512 por capa |
| Idiomas soportados | Alemán (de), inglés (en) |
| Licencia | swift-open-license-v1.0 (`license: other`) |
| Formato de pesos | GGUF (2 shards: 34,31 GiB + 18,77 GiB) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer de mezcla de expertos (`qwen4exp`) con 48 capas, 512 expertos enrutados por capa y 10 activos por token, sobre el que UkisAI aplicó un fine-tune (Swift 1.5) y una cuantización IQ2_XS con GSQ-RCO. La model card indica que Swift reduce de forma clara el número de tokens de "thinking" respecto al modelo base, lo que lo hace más adecuado para inferencia con presupuesto de tokens ajustado. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

La innovación de esta build concreta es la poda de expertos: se conservan 352 de los 512 expertos por capa según las estadísticas de masa de enrutamiento medidas con `llama-expert-stats` sobre una mezcla de calibración en alemán e inglés, manteniendo un experto si es "caliente" en cualquiera de los dos idiomas. La selección se hizo sobre el modelo Qwen3.8-Flash-Next cuantizado por ISTA, y la superposición con el conjunto obtenido midiendo directamente el modelo Swift es del 98 %. Los expertos se eliminan del GGUF sin recuantizar, y la lista de expertos conservados está en `kept_experts_K352.json`. La build incluye soporte para una cabeza MTP (multi-token prediction) compartida como sidecar, que requiere un fork de llama.cpp (`danielhanchen/llama.cpp`, rama `qwen4exp/mtp`).

## Capacidades

- Generación de texto conversacional en alemán e inglés, con control de idioma medido (proporción de palabras en idioma incorrecto: 0,005 en DE y 0,01 en EN frente a un umbral de 0,06).
- Razonamiento con modo "thinking" acotado: el fine-tune Swift reduce el número de tokens de pensamiento respecto al base.
- Generación de código: en las pruebas del autor resolvió 7 de 8 tareas tipo LeetCode/AtCoder y 10 de 12 tareas de un conjunto congelado de 32 tareas más difíciles.
- Decodificación especulativa mediante cabeza MTP compartida (sidecar `mtp-Qwen3.8-Flash-Next-shared-Q4_K_M.gguf`, 1,78 GiB), con `n-max` 2 o 3.
- Carga perezosa de la tabla de tokens por capa (`-lm dio --lazy-mode on`) para mantenerla en disco o RAM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en una GPU de 32 GB: la build está diseñada para que unos 26 GiB de pesos queden residentes en la GPU y la tabla de tokens de 26,8 GiB se lea de forma perezosa desde disco o RAM, lo que permite ejecutar un MoE de 139B en una Radeon 8060S con 32 GiB de carve-out dedicado.
- Asistencia conversacional en alemán e inglés: el control de idioma medido (0,005 y 0,01 de palabras en idioma incorrecto) y la ausencia de bucles y respuestas en CJK en las pruebas lo hacen apto para chatbots bilingües DE/EN con prompts multi-turno.
- Generación de código en local: con 7/8 y 10/12 tareas resueltas en las pruebas del autor, puede usarse como asistente de programación en entornos sin acceso a la nube, aceptando un presupuesto de pensamiento de 10.000 tokens y un máximo de 12.288 tokens generados.
- Despliegue con llama.cpp en Vulkan o ROCm: la model card documenta velocidades de 37,6 tok/s de decodificación y 238 tok/s de prefill con especulación en Vulkan, y 21,6 tok/s de decodificación y 322 tok/s de prefill en ROCm sin especulación, lo que permite dimensionar servidores locales.
- Experimentación con poda de expertos: sirve como caso de estudio reproducible para investigar la selección de expertos por estadísticas de router, con la lista `kept_experts_K352.json` y la comparación de perplejidad frente a la build de 512 expertos.
- Evaluación comparativa de cuantizaciones de muy baja precisión: la perplejidad retenida (2,0681 en alemán y 1,8229 en inglés) permite comparar IQ2_XS con la build de 3 bits (2,0514 / 1,8231) en el mismo conjunto de textos.
- Pruebas de decodificación especulativa con MTP: la build incluye la cabeza MTP como sidecar y documenta el efecto de `n-max` 2 y 3 sobre prefill y decodificación, útil para ajustar servidores llama.cpp con especulación.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Control de idioma (14 prompts DE + 14 EN), proporción de palabras en idioma incorrecto | DE 0,005 / EN 0,01 (umbral ≤ 0,06) |
| Bucles / respuestas en CJK | 0 / 0 |
| Perplejidad en textos reservados (mezcla DE / mezcla EN) | 2,0681 / 1,8229 |
| Decodificación / prefill con especulación (Vulkan, `-b/-ub` 2048, MTP n-max 2) | 37,6 tok/s / 238,0 tok/s |
| Decodificación / prefill con especulación (Vulkan, MTP n-max 3) | 35,2 tok/s / 253,3 tok/s |
| Decodificación sin especulación (llama.cpp oficial, Vulkan) | ~24 tok/s |
| Decodificación / prefill en ROCm sin especulación | 21,6 tok/s / 322 tok/s |
| Tareas de código propias (8 tareas LeetCode/AtCoder) | 7/8 superadas (33.430 tokens generados, ~18,0 min) |
| Tareas 9-20 del conjunto congelado de 32 tareas | 10/12 superadas (85.714 tokens generados) |

Referencia de perplejidad de otras builds sobre los mismos textos: Swift 512 expertos IQ2_XS 2,0605 / 1,8245; build de 3 bits 2,0514 / 1,8231. Las diferencias entre builds están dentro de ±1 %.

## Requisitos de hardware

- VRAM estimada: unos 26 GiB de pesos en GPU; con contexto de 32k, KV cache q8_0, cabeza MTP y `-ub 2048` el servidor usó 29,9 GiB de memoria dedicada más 5,7 GiB de memoria compartida en la prueba del autor. Sin la cabeza MTP necesita unos 1,8 GiB menos.
- GPU recomendadas: Radeon 8060S (Strix Halo, 64 GB, con carve-out de 32 GiB); no se probó en tarjetas discretas de 32 GB.
- Cabe en GPU de consumo de 32 GB con la configuración de carga perezosa indicada; la build de 3 bits hermana necesita unos 31,4 GiB de pesos en GPU y no cabe en 32 GB.
- Opciones de despliegue: llama.cpp (build oficial b11259 o b11297 para control de idioma y perplejidad; fork `danielhanchen/llama.cpp` rama `qwen4exp/mtp` commit `6fcaa16` para especulación MTP), compilado para Vulkan o ROCm. Se requiere `-lm dio --lazy-mode on` para la tabla de tokens perezosa.
- Latencia y throughput: 37,6 tok/s de decodificación y 238 tok/s de prefill con MTP n-max 2 en Vulkan; 21,6 tok/s de decodificación y 322 tok/s de prefill en ROCm sin especulación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (DE/EN) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen3.8-Flash-Next-Swift-K352-IQ2_XS (esta build) | 139.175.502.720 totales, 352/512 expertos | 32k (probado) | 2,0681 / 1,8229 | swift-open-license-v1.0 | GGUF, 2 shards, 53,08 GiB |
| Swift 512 expertos IQ2_XS (base cuantizado) | 139.175.502.720 totales, 512/512 expertos | no disponible | 2,0605 / 1,8245 | no disponible | GGUF |
| Sakura-Qwen3.8-Flash-Next-Swift-3bit-352E | no disponible, 352/512 expertos | no disponible | 2,0514 / 1,8231 | no disponible | GGUF, ~31,4 GiB en GPU |

## Limitaciones y advertencias

- Build experimental e independiente: no es un lanzamiento oficial de Qwen ni de UkisAI, y el autor la etiqueta explícitamente como experimental.
- La poda de expertos se calibró solo con datos de alemán e inglés; el rendimiento en otros idiomas no está medido y puede degradarse.
- Solo se declaran los idiomas `de` y `en`; no hay soporte multilingüe verificado.
- Riesgo de alucinación no cuantificado en la información disponible; la perplejidad baja no descarta errores factuales.
- La licencia `swift-open-license-v1.0` es de tipo `other`; no se detallan en la información proporcionada las restricciones para uso comercial, por lo que debe revisarse el archivo `LICENSE` antes de un despliegue en producción.
- Requiere un fork específico de llama.cpp para la cabeza MTP; sin él, la decodificación baja a unos 24 tok/s en Vulkan y desaparece la decodificación especulativa.
- La carga perezosa de la tabla de tokens es obligatoria en configuraciones de 32 GB; sin `-lm dio --lazy-mode on` la memoria requerida aumenta.
- El rendimiento en ROCm depende de que los pesos residentes quepan en la memoria dedicada; la build de 3 bits hermana "colapsa" en ese entorno según el autor.
- El tamaño del repositorio (57,0 GB) y los dos shards requieren espacio en disco y verificación de checksums con `SHA256SUMS`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-DE-EN-K352-IQ2_XS-GGUF
- Modelo base (cuantizado): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build hermana de 3 bits: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Swift-3bit-352E-GGUF
- Colección Sakura Micro: https://huggingface.co/collections/webmp3/sakura-micro-6aba74331f2e996ba1268a92
- Comparativa de builds Sakura Flash-Next: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Overview
- Fork de llama.cpp con soporte MTP: https://github.com/danielhanchen/llama.cpp (rama `qwen4exp/mtp`, commit `6fcaa16`)

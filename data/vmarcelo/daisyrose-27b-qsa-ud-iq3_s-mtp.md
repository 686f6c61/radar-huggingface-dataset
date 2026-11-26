# vmarcelo/DaisyRose-27B-QSA-UD-IQ3_S-mtp

## Resumen

DaisyRose-27B-QSA-UD-IQ3_S-mtp es una cuantización GGUF del modelo RadixArk/DaisyRose-27B (27.373.132.800 parámetros) publicada por el usuario vmarcelo. Se trata de una variante IQ3_S generada con la receta UD-IQ3_S de Unsloth, a la que se le ha injertado el indexador QSA (Qwen Sparse Attention) procedente de higa2515/Qwen3.8-27B-QSA-BF16, junto con la cabeza MTP (Multi-Token Prediction) conservada para decodificación especulativa. El resultado es un fichero de 12,25 GB que permite ejecutar un modelo de 27B con atención dispersa y contexto de hasta 262.144 tokens en una GPU de 16 GB.

El interés técnico del artefacto reside en la combinación de tres piezas: cuantización de baja precisión con imatrix, atención dispersa tipo QSA para reducir el coste del contexto largo y decodificación especulativa mediante MTP. El autor reporta en la model card cifras medidas en una RX 9070 XT (16 GB, Vulkan): 859 tok/s de prefill a 200K tokens, unos 55 tok/s de decode en prompt corto y 29/30 aciertos en una prueba de recuperación de agujas en un documento de 199.901 tokens.

La relevancia práctica es doble. Por un lado, demuestra que es viable servir contexto de 250K en hardware de consumo con streaming de caché K/V desde RAM del sistema. Por otro, impone una dependencia dura: el fichero no carga en llama.cpp upstream ni en aplicaciones derivadas como LM Studio u Ollama, sino solo en forks específicos con soporte QSA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base DaisyRose-27B, familia Qwen3.8) con indexador QSA (sparse attention) y cabeza MTP |
| Parametros totales | 27.373.132.800 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (configuracion documentada); particionable en 2 slots de 131.072 |
| Tipos de cuantizacion | IQ3_S (receta UD-IQ3_S de Unsloth); caché K/V en q8_0 y q4_0 en la configuracion de referencia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `DaisyRose-27B-QSA-UD-IQ3_S-mtp.gguf`, 12,25 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros. Sobre él se aplican dos modificaciones que no implican reentrenamiento del modelo principal. La primera es el injerto del indexador QSA v2: 80 tensores en FP32 procedentes de higa2515/Qwen3.8-27B-QSA-BF16, añadidos sin cambios y destilados originalmente sobre el modelo base Qwen3.8-27B, no sobre DaisyRose. La segunda es la conservación de la cabeza MTP para decodificación especulativa con borradores múltiples.

La cuantización sigue la receta UD-IQ3_S de Unsloth y reutiliza tensor a tensor los tipos del fichero `Qwen3.8-27B-UD-IQ3_S.gguf` de unsloth (866 de 866 coincidencias verificadas por el autor). La imatrix empleada, `imatrix_unsloth.gguf`, fue calculada sobre Qwen3.8-27B base, no sobre DaisyRose, lo que constituye una aproximación y no una calibración específica del modelo final. El resto de tensores son idénticos byte a byte a la cuantización UD-IQ3_S simple; el injerto se realizó con el script `deploy/qsa27b-24gb/gguf_qsa_graft.py` del fork de Vmarcelo49.

La innovación operativa es el streaming de caché K/V: las celdas antiguas residen en RAM del sistema fijada (unos 6,4 GiB a 262K tokens) y la GPU recupera bajo demanda los bloques seleccionados por el indexador QSA. Esto es lo que permite mantener 262K de contexto en 16 GB de VRAM.

## Capacidades

- Generación de texto conversacional en un único turno o multi-turno, con plantilla Jinja (`--jinja`).
- Recuperación de información en contexto muy largo: atención dispersa QSA más contexto de 262K tokens.
- Razonamiento de múltiples pasos y modo thinking (la prueba de agujas se ejecutó con thinking desactivado, lo que implica que el modo existe y es conmutable).
- Decodificación especulativa mediante cabeza MTP con hasta 2 borradores (`--spec-draft-n-max 2`).
- Servicio concurrente: 2 slots paralelos de 128K cada uno o 4 slots de 16K.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo), lo que sugiere interfaz tipo API compatible con llama-server.
- Capacidades multimodales: no disponibles; el autor indica explícitamente que el modelo es solo texto.
- Tool calling / function calling: no documentado en la información disponible.

## Casos de uso

- Análisis de repositorios y documentación extensa: con 262K tokens de contexto se puede cargar un árbol de código o un conjunto de especificaciones completo y hacer preguntas sobre él, apoyándose en la atención dispersa para no degradar el prefill.
- Agentes duales en paralelo: la configuración `-np 2` con 131K por slot permite ejecutar dos agentes concurrentes (por ejemplo, un planificador y un ejecutor) en una sola GPU de 16 GB, con un rendimiento medido de 30–37 tok/s por slot decodificando a la vez.
- Asistente de atención al cliente con historial largo: conversaciones multi-turno que acumulan decenas de miles de tokens se benefician del streaming K/V, que libera VRAM al mover celdas antiguas a RAM del sistema.
- Procesamiento de expedientes o contratos: la prueba de recuperación de agujas a 199.901 tokens con 29/30 aciertos sugiere utilidad para localizar cláusulas o datos concretos en documentos jurídicos o técnicos de gran extensión.
- Generación asistida en local para desarrolladores con GPU de consumo: un modelo de 27B en IQ3_S que cabe en 16 GB (RX 9070 XT, RTX 4080/4090 con margen) permite iterar sin depender de APIs externas.
- Investigación sobre atención dispersa y decodificación especulativa: el artefacto sirve como banco de pruebas reproducible para medir QSA y MTP en hardware Vulkan, con scripts y variables de entorno documentadas.
- Servicio de inferencia con endpoints compatibles: al estar etiquetado como `endpoints_compatible`, puede exponerse tras una API HTTP para integrarse en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte explícitamente que sus mediciones "no son un benchmark" y que la calidad relativa frente a atención densa, el uso multimodal y las tareas generales no se han medido.

| Prueba | Configuracion | Resultado |
|---|---|---|
| Recuperación de agujas (30 pares clave→valor con señuelo a un carácter de distancia, documento de 199.901 tokens) | RX 9070 XT 16 GB, Vulkan, K=2048, KV Q8_0/Q4_0, MTP 2 borradores, thinking off, greedy | 29/30 aciertos (el error eligió el señuelo) |
| Prefill a 200K tokens | Misma configuración | 859 tok/s |
| Decode en prompt corto | Misma configuración | ~55 tok/s |
| Prefill con 250K tokens llenos (modelo QSA IQ3_S comparable) | Misma tarjeta, misma configuración | ~800 tok/s, 15,2 GiB VRAM |
| Decode con 250K tokens llenos | Misma tarjeta | 54–68 tok/s |
| Dos prompts needle-in-a-haystack concurrentes de 101K | `-np 2`, VRAM ~15,5 GiB | Ambos correctos; prefill ~880 tok/s; 61 tok/s un slot solo, 30–37 tok/s cada uno con dos slots |
| Cuatro slots de 16K | `-np 4 -c 65536` | ~92 tok/s agregados |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 12,25 GB; la configuración de referencia ocupa 15,2–15,5 GiB de VRAM con 250K–262K de contexto y streaming K/V activo. Con `-ub 256` se ahorran unos 250 MiB.
- RAM del sistema: unos 6,4 GiB fijados (pinned) para las celdas K/V en streaming a 262K tokens.
- GPU probada: AMD RX 9070 XT de 16 GB con backend Vulkan. No hay mediciones publicadas para CUDA en la información disponible, aunque el fork parte de kernels portados desde `ggml-cuda/qsa-attn.cu`.
- Cabe en GPU de consumo de 16 GB (RX 9070 XT); en el resto de modelos de 16 GB o más el autor no aporta cifras.
- Despliegue: exclusivamente mediante forks con soporte QSA. Recomendado Vmarcelo49/Qwen-QSA-llama.cpp (commit de referencia `108ecc8`, con corrección de bug de streaming K/V en `8a21b8a` y soporte multi-slot desde `4252e0d`); alternativa pentaCoxian/Qwen-QSA-llama.cpp. Compilación con `-DGGML_VULKAN=ON` y target `llama-server`.
- Incompatible con llama.cpp upstream, LM Studio, Ollama y cualquier aplicación construida sobre ellos.
- Throughput medido: 859 tok/s de prefill a 200K, ~55 tok/s de decode en prompt corto, 54–68 tok/s con 250K llenos, 30–37 tok/s por slot con dos slots concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-QSA-UD-IQ3_S-mtp (este) | 27,37B | 262.144 | IQ3_S, 12,25 GB | Apache 2.0 | Requiere fork QSA; MTP para decodificación especulativa |
| unsloth/Qwen3.8-27B-GGUF (UD-IQ3_S) | 27B (aprox.) | no disponible | IQ3_S | no disponible | Carga en llama.cpp upstream; sin QSA ni MTP |
| higa2515/Qwen3.8-27B-QSA-BF16 | 27B (aprox.) | no disponible | BF16 | no disponible | Fuente del indexador QSA; pesos completos en BF16 |
| RadixArk/DaisyRose-27B | 27,37B | no disponible | safetensors (base) | Apache 2.0 (heredada) | Modelo base sin cuantizar ni injerto QSA |

## Limitaciones y advertencias

- No carga en llama.cpp upstream, LM Studio ni Ollama. Requiere compilar un fork concreto; cualquier actualización del fork puede romper la compatibilidad del fichero.
- La imatrix se calculó sobre Qwen3.8-27B base, no sobre DaisyRose, por lo que la calibración de la cuantización es aproximada.
- El indexador QSA se destiló sobre el modelo base y se injertó sin reentrenamiento sobre DaisyRose; el autor no ha medido la calidad relativa frente a atención densa.
- Solo texto: sin capacidades multimodales.
- Idiomas soportados no documentados; no hay evaluación multilingüe publicada.
- Riesgo de alucinación no cuantificado: no hay benchmarks de veracidad ni de tareas generales.
- La prueba de agujas se ejecutó una sola vez, con thinking off y decodificación greedy; no es un benchmark y no debe extrapolarse a otras tareas.
- El bug de streaming K/V corregido en `8a21b8a` podía perder texto más allá de ~24K tokens, también con `-np 1`; es obligatorio usar la última `main` del fork.
- Con dos slots, estos se turnan en la GPU: un slot decodifica despacio mientras el otro procesa un prompt largo.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones del modelo RadixArk/DaisyRose-27B original antes de uso comercial.
- El repositorio tiene 309 descargas y 2 likes en el momento de la consulta: validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/vmarcelo/DaisyRose-27B-QSA-UD-IQ3_S-mtp
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Referencia de cuantización Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Fuente del indexador QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-BF16
- Fork recomendado: https://github.com/Vmarcelo49/Qwen-QSA-llama.cpp
- Fork upstream QSA: https://github.com/pentaCoxian/Qwen-QSA-llama.cpp
- PR #1 (kernel Vulkan block-sparse QSA): https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/1
- PR #2 (streaming K/V desde host en Vulkan): https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/2
- PR #3 (scoring QSA fusionado, mat-vec IQ3 entero, cabeza MTP recortada): https://github.com/pentaCoxian/Qwen-QSA-llama.cpp/pull/3
- Paper referenciado en los tags: arxiv:2608.30320

# WaveCut/Edge0-145B-NVFP4-NInfer-v3

## Resumen

Edge0-145B-NVFP4-NInfer-v3 es un artefacto de inferencia del modelo Edge0-145B-NVFP4 de Edge0, empaquetado en el formato propietario NInfer v3 para el motor NInfer-all (rama `master` del repositorio `iamwavecut/ninfer-all`). No se trata de un modelo nuevo, sino de una conversión de pesos que preserva los bloques del release original byte a byte y los multiplica en el motor. El modelo base es multimodal (image-text-to-text) y conserva el esqueleto de Qwen3.8-Flash-Next: Gated DeltaNet, atención dispersa, hiperconexiones, embedding de n-gramas, router, experto compartido y bloque MTP.

La innovación principal del modelo base es su arquitectura de "expertos latentes": cada una de las 48 capas de texto sustituye los 512 expertos enrutados por expertos que pertenecen a uno de 8 grupos y computan en el ancho latente de su grupo (1792), que un codificador y decodificador de grupo proyectan desde y hacia las 2560 dimensiones del modelo. El artefacto incluye además el bloque MTP del release y la torre de visión de Qwen3.8-Flash-Next en BF16 (0.9 GB), que el release original no incluye y que `edge0-strata` utiliza para leer imágenes.

Este artefacto es relevante porque permite ejecutar un modelo MoE de 145B parámetros en una única GPU A40 de 48 GB mediante residencia de expertos en memoria host o en disco, con decodificación especulativa vía MTP. Requiere obligatoriamente NInfer-all desde el commit `72d1d8e04`; las builds estándar de NInfer rechazan el fichero. La licencia es la Edge0 Community Model License 1.0, no estándar y sujeta a revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos latentes sobre esqueleto Qwen3.8-Flash-Next (Gated DeltaNet, atención dispersa, hiperconexiones, MTP) |
| Parametros totales | 145B (según nombre del modelo; desglose exacto no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (`--max-context 32768` en los ejemplos de servicio) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, bloques `gguf_nvfp4`: 64 valores en 36 bytes, cuatro escalas UE4M3), Q8_0 (codificadores/decodificadores de grupo y matrices MTP), Q2_0 (expertos MTP), BF16 (torre de visión), FP8 (tabla de n-gramas, artefacto separado) |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-license-1.0 |
| Formato de pesos | `.ninfer` (formato propietario NInfer v3); un único fichero de 58.416.934.144 bytes (54,41 GiB) |

## Arquitectura y entrenamiento

El modelo base Edge0-145B-NVFP4 parte del esqueleto de Qwen3.8-Flash-Next y sustituye los 512 expertos enrutados de cada una de las 48 capas de texto por expertos latentes organizados en 8 grupos. Cada experto computa en el ancho latente de su grupo (1792 dimensiones), y un codificador y decodificador de grupo proyectan desde y hacia las 2560 dimensiones del modelo. Se conservan el Gated DeltaNet, la atención dispersa, las hiperconexiones, el router, el experto compartido, el bloque MTP y la tabla de embedding de n-gramas.

El artefacto NInfer v3 empaqueta los expertos enrutados como bloques ggml NVFP4 (47,6 GB) con los multiplicadores FP32 de las colas de registro del release, los codificadores y decodificadores de grupo como filas Q8_0 (3,74 GB, fichero `latent_dense_q8.bin`), las etiquetas de grupo en `labels.bin`, el esqueleto en `model-skeleton.gguf`, el bloque MTP con expertos Q2_0 y matrices Q8_0, y la torre de visión de Qwen3.8-Flash-Next en BF16 (0,9 GB, 27 bloques de ancho 1152, fusión de parches 2×2 sobre las 2560 del modelo de texto). La tabla de n-gramas no se incluye: el modelo la referencia por el SHA-256 de sus filas (`57496326706760c564e80ed401f6b26a7d6b340cc05966502675c8dc01ef8fd9`) y se publica aparte en `WaveCut/Edge0-ngram-table-FP8-NInfer-v3`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el release original. La conversión se realizó con `tools.convert` (receta `edge0_pack`) sobre la revisión `6aab5f43` de `Edge0/Edge0-145B-NVFP4`, la revisión `812d96e1` de `Qwen/Qwen3.8-Flash-Next` y la revisión `ed59f920` de `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`.

## Capacidades

- Generación de texto y razonamiento multimodal image-text-to-text (pipeline declarado).
- Procesamiento de imágenes y vídeo mediante la torre de visión de Qwen3.8-Flash-Next, activable con `--vision` (0,9 GB de VRAM adicional).
- Decodificación especulativa con el bloque MTP: tres borradores por ronda con expertos en host; con expertos en GPU cuando se sirve una petición a la vez; los expertos en disco decodifican sin borradores salvo que se pase `--spec mtp`.
- Capacidad MoE con enrutamiento a 8 grupos de expertos latentes y experto compartido.
- Embedding de n-gramas como componente auxiliar (tabla externa obligatoria).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en una sola GPU de 48 GB: gracias a la residencia de expertos en memoria host (47,6 GB de RAM) o en disco, el modelo puede servirse en una A40 con `--expert-residency host` o `--expert-residency disk`, lo que permite desplegar un MoE de 145B en hardware de gama media-alta sin clúster.
- Procesamiento de documentos con imagen y texto: la torre de visión integrada (27 bloques, BF16) permite tareas image-text-to-text como extracción de información de capturas, formularios o diagramas, activando `--vision`.
- Servicio de chat con contexto largo: con `--max-context 32768` se pueden mantener conversaciones multi-turno o resumir documentos extensos sin truncar, usando el bloque MTP para acelerar la decodificación.
- Despliegue con dos GPUs en paralelo de tensor: `--devices 0,1 --tensor-parallel` reparte cada capa en dos GPUs con unos 29 GB de pesos por GPU, cada una con grupos de expertos completos y sus filas de codificador/decodificador.
- Evaluación de calidad de cuantización: el artefacto incluye informe de conversión y `SHA256SUMS`, y el autor verifica que la perplejidad sobre WikiText (3,067910 con expertos en host y en disco) y las respuestas greedy coinciden con las del fichero medido, lo que sirve para validar pipelines de cuantización NVFP4.
- Investigación sobre arquitecturas MoE latentes: al preservar los bloques del release byte a byte, permite estudiar el comportamiento de los expertos latentes agrupados y del router sin reentrenar, comparando con el release original.
- Prototipado de decodificación especulativa: el bloque MTP empaquetado permite medir la ganancia de los borradores (tres por ronda) en distintos modos de residencia de expertos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad WikiText (primeros 40 KB, 9.234 objetivos, KV INT8) | 3,067910 | Expertos en host, una A40 48 GB, 300 W |
| Perplejidad WikiText (mismas condiciones) | 3,067910 | Expertos en disco |
| Consistencia tras reconversión | Misma perplejidad y misma respuesta greedy | Fichero reconvertido para publicación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las mediciones del autor se realizaron el 12-13 de noviembre de 2026 con NInfer-all `master` (CUDA 12.8, `sm_86`) en una A40 (48 GB, 300 W) en contenedor con cuota de 7,65 CPU y 50 GB de RAM, una ejecución por fila.

## Requisitos de hardware

- VRAM estimada: con todos los expertos en GPU se necesitan aproximadamente 58 GB, más que los 48 GB de una A40; por tanto, no cabe en una sola GPU de 48 GB con expertos residentes en VRAM.
- Expertos en memoria host: 47,6 GB de RAM para los expertos en memoria fijada (pinned), con caché en GPU de los más usados; requiere una GPU con suficiente VRAM para el esqueleto, la torre de visión opcional (0,9 GB) y la caché de expertos.
- Expertos en disco: los expertos permanecen en el fichero y se transmiten a una caché en GPU; pensado para equipos con poca RAM.
- Dos GPUs con paralelismo de tensor (Linux): unos 29 GB de pesos por GPU, cada una con grupos de expertos completos y sus filas de codificador/decodificador. Verificado como dos rangos en una A40 con Edge0-120B-q3k, no con este release.
- GPU recomendadas: A40 (48 GB) es la plataforma medida; A100/H100 no están documentadas en la información disponible. No se confirma compatibilidad con GPUs de consumo (RTX 4090, etc.).
- Opciones de despliegue: exclusivamente `ninfer-serve` de NInfer-all (rama `master`, desde el commit `72d1d8e04`). Las builds estándar de NInfer rechazan el fichero. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Edge0-145B-NVFP4-NInfer-v3 | 145B (activos no disponibles) | 32.768 | `.ninfer` (NInfer v3) | edge0-community-model-license-1.0 | Hugging Face, requiere NInfer-all |
| Edge0-145B-NVFP4 (release original) | 145B | no disponible | no disponible | edge0-community-model-license-1.0 | Hugging Face (Edge0) |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Qwen-LICENSE (terceros) | Hugging Face (Qwen) |
| Edge0-120B-q3k | 120B | no disponible | no disponible | no disponible | Usado por el autor para validar paralelismo en dos GPUs |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta del motor: solo funciona con NInfer-all desde el commit `72d1d8e04`; las builds estándar de NInfer rechazan el fichero por los expertos latentes y los formatos `gguf_*`.
- Requiere descargar un artefacto adicional obligatorio: la tabla de n-gramas `WaveCut/Edge0-ngram-table-FP8-NInfer-v3`, referenciada por SHA-256; sin ella el modelo no puede servirse correctamente.
- Licencia no estándar (Edge0 Community Model License 1.0): es necesario revisar los términos antes de cualquier uso comercial; no es una licencia open source reconocida.
- El paralelismo de tensor en dos GPUs solo se verificó con otro modelo (Edge0-120B-q3k) en dos rangos sobre una A40, no con este release; el soporte para este artefacto no está validado.
- Riesgo de alucinación: no cuantificado en la información disponible; no hay benchmarks de fidelidad ni evaluaciones de sesgo.
- Idiomas soportados no declarados; no se puede garantizar cobertura multilingüe.
- El release original no incluye la torre de visión; este artefacto la incorpora desde un GGUF de terceros (ISTA-DASLab), lo que añade una dependencia externa y posibles discrepancias con el modelo de texto.
- La conversión rechaza releases cuyo vocabulario o merges difieran del tokenizer de Qwen3.8-Flash-Next, lo que limita la portabilidad a variantes modificadas.
- Sin datos de throughput ni latencia publicados; el rendimiento real dependerá del modo de residencia de expertos (host, disco o GPU).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/Edge0-145B-NVFP4-NInfer-v3
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-NVFP4
- Tabla de n-gramas: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit mínimo requerido: https://github.com/iamwavecut/ninfer-all/commit/72d1d8e0439974779201f8537a2915de0b52f155
- Guía Edge0: https://github.com/iamwavecut/ninfer-all/blob/master/docs/edge0.md
- Modelo Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de referencia con torre de visión: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

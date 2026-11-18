# Xylolabs/Hy4-flash-GGUF

## Resumen

Hy4-flash es un modelo multimodal de tipo mixto de expertos (MoE) desarrollado por Tencent, distribuido originalmente en formato FP8 y aquí publicado en cuantizaciones GGUF por Xylolabs para su uso con llama.cpp. Con 218.938.353.741 parámetros totales (aproximadamente 220B) y 12B activos por token, está disenado para tareas de imagen-a-texto y conversación, con soporte de inglés y chino.

La particularidad técnica de esta distribución es la separación de las tablas Engram (tablas de n-gramas de 63,36 GB en FP8 E4M3) en un segundo shard independiente que se mapea en memoria, de modo que solo se leen las filas que toca cada prompt. Esto permite ejecutar un modelo de 220B en una única máquina de 128 GB, como una NVIDIA DGX Spark o un Apple Silicon de 128 GB, manteniendo el tronco del modelo en GPU.

El repositorio incluye siete cuantizaciones (Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M y Q2_K), la torre de visión en bf16, la matriz de importancia usada para todas las cuantizaciones y un parche de conversión. La licencia es la Tencent Hy License, que no es de código abierto estándar y requiere revisión para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer con tablas Engram de n-gramas); detalles completos de la arquitectura del modelo base no disponibles |
| Parametros totales | 218.938.353.741 (aprox. 220B) |
| Parametros activos | 12B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K (GGUF); shard Engram fijo en FP8 E4M3; torre de visión en bf16 |
| Idiomas soportados | en, zh |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | GGUF (gguf-split en dos shards), mmproj BF16 para visión, imatrix GGUF |
| Modelo base | tencent/Hy4-flash (cuantizado desde tencent/Hy4-flash-FP8) |
| Tamano del repo | 725,8 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de aproximadamente 220B parámetros totales con 12B activos por token, orientado a imagen-a-texto y conversación. La distribución GGUF conserva esa estructura y anade una separación explícita de las tablas Engram: un conjunto de tablas de n-gramas de 63,36 GB en FP8 E4M3 que se almacena en su propio shard (`-00002-of-00002.gguf`) y se mapea en memoria, de modo que solo se leen las filas correspondientes al prompt. El tronco (155,5B parámetros no Engram) es lo que se cuantiza en cada variante y lo que se carga en GPU.

La conversión parte del checkpoint `tencent/Hy4-flash-FP8` (subido a BF16) y se ha realizado con un parche de conversión y una matriz de importancia (`Hy4-flash.imatrix.gguf`) aplicada a todas las cuantizaciones. La torre de visión se distribuye aparte en bf16 (`mmproj-Hy4-flash-BF16.gguf`, 1,04 GB), aunque el autor indica que no la ha probado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), mediante la torre de visión en bf16 incluida en el repositorio.
- Razonamiento con modo "thinking" (el autor menciona "thinking mode on" en sus pruebas de calidad).
- Generación de código: el autor valida con una función Python pequeña en su batería de cinco ítems.
- Capacidades matemáticas básicas y de cálculo (el autor prueba una diferencia horaria y un producto).
- Traducción entre idiomas (el autor prueba inglés a coreano, aunque el modelo declara solo en y zh).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de 220B en una sola máquina de 128 GB: gracias a la separación del shard Engram y al mapeo en memoria, se puede ejecutar el modelo en una NVIDIA DGX Spark o en un Apple Silicon de 128 GB sin infraestructura multinodo, usando Q4_K_M (97,81 GB de tronco) o IQ4_XS (86,94 GB).
- Asistente conversacional con contexto documental: el modo conversacional y el soporte de inglés y chino permiten construir asistentes bilingües para atención al usuario, con la ventaja de que el modelo cabe en hardware de sobremesa profesional.
- Procesamiento de imágenes con descripción textual: la torre de visión en bf16 permite tareas de imagen-a-texto, como descripción de capturas, extracción de información de documentos escaneados o moderación de contenido visual, aunque el autor no ha validado esta parte.
- Generación y revisión de código en local: el modelo produce funciones Python y puede integrarse en flujos de desarrollo con llama.cpp, útil para equipos que necesitan inferencia sin enviar código a la nube.
- Traducción y localización: aunque declara solo en y zh, el autor verifica salida en coreano, lo que sugiere cierta generalización; puede emplearse para traducción bidireccional inglés-chino en entornos con requisitos de privacidad.
- Experimentación e investigación en cuantización: el repositorio incluye la imatrix, las métricas KL y top-1 frente a una referencia Q8_0, y comparativas con la cuantización Q4_K_M de Tencent, lo que lo convierte en un banco de pruebas para estudiar el impacto de la cuantización en modelos MoE grandes.
- Evaluación de modelos multimodales en hardware de consumo profesional: con Q2_K (61,79 GB de tronco) se puede ejecutar en GPUs de 80 GB o en configuraciones con memoria unificada, permitiendo pruebas de concepto sin clústeres.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización y velocidad de inferencia medidas en una NVIDIA H200 con ambos shards en caché de página. La referencia de KL y top-1 es el tronco Q8_0 del propio autor (PPL 30,90, no publicado).

| Quant | Shard 1 (tronco) | bpw del tronco | PPL | KL medio vs Q8_0 | Mismo top-1 | Prefill tok/s | Decode tok/s | Memoria GPU (MiB) |
|---|---|---|---|---|---|---|---|---|
| Q6_K | 129,89 GB | 6,68 | 30,69 | 0,1689 | 87,6% | 1119 | 66-69 | 124.679 |
| Q5_K_M | 113,37 GB | 5,83 | 31,58 | 0,1907 | 86,5% | 1248 | 63-70 | 108.921 |
| Q4_K_M | 97,81 GB | 5,03 | 32,56 | 0,2415 | 84,3% | pendiente | pendiente | 94.089 |
| Q4_K_S | 92,19 GB | 4,74 | 33,38 | 0,2464 | 84,1% | pendiente | pendiente | pendiente |
| IQ4_XS | 86,94 GB | 4,47 | 30,27 | 0,2603 | 84,4% | 1257 | pendiente | 83.721 |
| Q3_K_M | 78,58 GB | 4,04 | 27,41 | 0,3659 | 81,7% | 880 | 35-60 | 75.747 |
| Q2_K | 61,79 GB | 3,18 | 29,48 | 0,6808 | 73,6% | 1218 | 66-69 | 59.735 |

Comparativa de Q4_K_M frente a la cuantización de Tencent (AngelSlim), misma build y mismo texto, ambas contra la referencia Q8_0 del autor:

| Q4_K_M de | PPL (build PR) | PPL (build parcheada de Tencent) | KL medio vs Q8_0 | Mismo top-1 |
|---|---|---|---|---|
| Xylolabs (este repositorio) | 32,56 | 31,88 | 0,2415 | 84,3% |
| AngelSlim (Tencent) | 31,92 | 30,84 | 0,2908 | 83,4% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 59.735 MiB (Q2_K) y 124.679 MiB (Q6_K) de memoria de GPU para el tronco, según la tabla del autor. El shard Engram (63,36 GB) permanece en host y se mapea en memoria, por lo que se necesita RAM adicional equivalente.
- GPU recomendadas: NVIDIA H200 (mediciones del autor), NVIDIA DGX Spark de 128 GB, Apple Silicon de 128 GB. Para Q2_K y Q3_K_M, GPUs de 80 GB como A100 o H100 podrían alojar el tronco, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: no para las cuantizaciones altas; Q2_K (59,7 GB de GPU) queda fuera de GPUs consumer de 24-48 GB. No se dispone de datos para RTX 4090 u otras consumer.
- Opciones de despliegue: llama.cpp (build con el PR 32517), formato gguf-split en dos shards; el shard 2 se localiza por nombre junto al shard 1. Compatible con endpoints según los tags.
- Latencia y throughput: prefill de 880 a 1257 tok/s y decode de 35 a 70 tok/s en H200 según cuantización; mediciones pendientes para Q4_K_M, Q4_K_S e IQ4_XS.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-flash (este GGUF) | 220B / 12B | no disponible | tencent-hy-license | GGUF | Multimodal, en/zh, tablas Engram separadas |
| tencent/Hy4-flash (FP8 original) | 220B / 12B | no disponible | tencent-hy-license | FP8 | Checkpoint de referencia del que se cuantiza |
| tencent/Hy4-flash Q4_K_M (AngelSlim) | 220B / 12B | no disponible | tencent-hy-license | GGUF | KL 0,2908 y top-1 83,4% frente a la referencia del autor |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La licencia Tencent Hy License no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El modelo solo declara soporte de inglés y chino; el rendimiento en otros idiomas no está garantizado, aunque el autor observa salida correcta en coreano en una prueba puntual.
- La torre de visión en bf16 se distribuye "convertida, no probada" por el autor, por lo que las capacidades multimodales no están validadas en esta distribución.
- Las métricas de calidad se basan en una batería de solo cinco ítems y en la perplejidad y KL frente a una referencia Q8_0 no publicada; no sustituyen una evaluación estándar de benchmarks.
- Las cuantizaciones bajas (Q2_K, Q3_K_M) muestran una degradación notable: KL de 0,6808 y top-1 de 73,6% en Q2_K, y KL de 0,3659 en Q3_K_M.
- El shard Engram requiere 63,36 GB adicionales de RAM de host; el requisito total de memoria (GPU más host) supera los 128 GB en las cuantizaciones altas.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos en la información disponible.
- Las velocidades de Q4_K_M, Q4_K_S e IQ4_XS están pendientes o descartadas por solapamiento con otras tareas en la máquina de medición.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una distribución muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy4-flash-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/Xylolabs/Hy4-flash-GGUF/blob/main/LICENSE
- PR de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32517
- Repositorio de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq

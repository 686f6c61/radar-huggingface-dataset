# TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw

## Resumen

Qwen3.8-27B-VQ-3.9bpw es una cuantización vectorial (vector quantization, VQ) del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario independiente TheDrainFlorist para su ejecución en Apple Silicon mediante MLX. El checkpoint empaqueta el runtime VQ directamente en el repositorio como `model.py`, de modo que funciona con una instalación estándar de `mlx-lm` sin parches adicionales. El objetivo es ofrecer una compresión agresiva (3,9 bits por peso) que reduzca el peso en disco a 12,47 GiB frente a los 51,7 GiB del modelo en bf16, manteniendo una divergencia respecto al profesor bf16 sustancialmente menor que las conversiones afines de 3 bits.

El modelo base es un transformer de la familia Qwen3.8 con 12.118.822.128 parámetros reales según los safetensors publicados (pese al "27B" del nombre comercial), licencia Apache 2.0 y soporte declarado únicamente de inglés. Incluye una torre de visión bf16 de 333 tensores (0,859 GiB) que se conserva íntegra en todas las builds del autor, por lo que el modelo es multimodal de entrada de imagen aunque la model card no detalla esa faceta.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco común (VQ en lugar de la afín escalar por grupos que usa `mlx_lm.convert`); por otro, el autor publica mediciones de divergencia KL sobre tres corpus (prosa, código y texto literario) que muestran que el daño de la cuantización se concentra en texto literario y que la perplejidad no sirve para ordenar estas builds.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8), con torre de visión bf16 de 333 tensores (0,859 GiB); runtime VQ empaquetado como `model.py` |
| Parametros totales | 12.118.822.128 |
| Parametros activos | No es MoE; no aplica |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Vector quantization (VQ) a 3,9 bits por peso; builds comparativas afines q2/q3/q4/q6/q8 y VQ 4,5/4,8 bpw del mismo autor |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mlx`); repo de 13,4 GB, build de 12,47 GiB |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un modelo entrenado desde cero: hereda la arquitectura y los pesos del Qwen3.8-27B original y aplica cuantización vectorial sobre las matrices lineales. La diferencia frente al recetario comunitario estándar (`mlx_lm.convert`, group_size 64, afín) es que VQ sustituye la escala y el cero por grupo por un codebook vectorial, lo que a 3,9 bpw permite conservar más información que una afín de 3 bits. El runtime incluido implementa kernels VQ densos que leen activaciones directamente de memoria de dispositivo (sin staging por tiles de threadgroup) y evalúan el prefill de forma incremental; según el autor, los cambios de kernel son bit-idénticos o equivalentes a 1 ULP.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO en la información proporcionada; esos detalles corresponden al modelo base Qwen3.8-27B, cuya model card no se ha facilitado. La build incluye soporte de decodificación especulativa mediante un sidecar MTP (`mtp-head-q6.safetensors`) que funciona con la rama `mtp-stage1` del fork de exo del autor, activable con `exo --mtp` o `EXO_MTP=1`; con MTP activo, exo sirve peticiones de forma secuencial, por lo que no es apto para cargas concurrentes o multiagente.

## Capacidades

- Generación de texto conversacional y de instrucciones en inglés (pipeline `text-generation`, tags `conversational`).
- Entrada multimodal de imagen: todas las builds conservan la torre de visión bf16 de 0,859 GiB, aunque la model card no detalla el uso.
- Decodificación especulativa opcional vía cabecera MTP en el fork de exo (`--mtp`), con la salvedad de servido secuencial.
- Ejecución en Apple Silicon sobre `mlx-lm` estándar, sin parches, gracias al runtime VQ empaquetado.
- Despliegue multi-Mac mediante exo (instrucciones referenciadas a Knurlogic).
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso explícito ni modo thinking; no disponibles.

## Casos de uso

- Inferencia local en Mac con memoria unificada limitada: con 12,47 GiB en disco y pico de memoria igual al tamaño en disco según el autor, cabe en equipos de 16-24 GB de memoria unificada, algo imposible con el bf16 de 51,7 GiB.
- Asistente conversacional en inglés sobre documentos largos: el modelo base Qwen3.8 está orientado a instrucciones; la build mantiene la torre de visión, lo que permite consultas sobre capturas o páginas escaneadas junto a texto.
- Clúster doméstico multi-Mac con exo: el autor documenta reparto entre varias máquinas, útil para servir el modelo a un equipo pequeño sin GPU dedicada.
- Prototipado de pipelines de generación de código: la divergencia KL en el corpus de código público es la más baja de los tres (39,8 mnats/tok), por lo que es el dominio donde la cuantización degrada menos.
- Evaluación de técnicas de cuantización: sirve como referencia práctica de VQ frente a afín para investigadores que comparen recetas con la misma instrumentación KL de tres corpus.
- Experimentos de decodificación especulativa: la cabecera MTP y el fork de exo permiten medir el impacto de la decodificación especulativa en un modelo de ~12B en hardware Apple.
- Generación de texto creativo o literario solo con cautela: es el dominio con mayor divergencia (581,7 mnats/tok), por lo que no se recomienda para producción literaria sin validación humana.

## Benchmarks y rendimiento

El autor publica divergencia KL (millinats por token) frente al profesor bf16, medida sobre la caché top-64 del profesor con 12.288 tokens en tres corpus (prosa, código público y literario):

| Build | GiB | Prosa | Código | Literario | Media | Top-1 |
|---|---|---|---|---|---|---|
| **VQ-3.9bpw (este modelo)** | **12,47** | **140,4** | **39,8** | **581,7** | **254,0** | **86,0%** |
| Afín q4 (del autor) | 14,95 | 67,4 | 23,2 | 314,3 | 135,0 | 90,5% |
| VQ-4.5bpw | 14,45 | 54,4 | 20,9 | 287,6 | 120,9 | 90,9% |
| VQ-4.8bpw | 15,45 | 61,2 | 16,5 | 207,3 | 95,0 | 91,1% |
| Afín q8 (del autor) | 27,48 | 3,2 | 0,6 | 4,9 | 2,9 | 98,5% |

Medición antigua (solo prosa, 2.048 tokens, no comparable fila a fila con la anterior; el autor la mantiene por trazabilidad):

| Build | Tamaño | KL a bf16 (mnats/tok) | Top-1 | Perplejidad |
|---|---|---|---|---|
| Afín q2 (del autor) | 8,69 GiB | 1426,9 | 46,1% | 16,435 |
| Afín q3 (del autor) | 11,82 GiB | 187,8 | 79,5% | 5,832 |
| **Este modelo** | **12,47 GiB** | **85,8** | **86,1%** | 5,229 |
| Afín q4 (del autor) | 14,95 GiB | 45,8 | 89,8% | 5,206 |
| Afín q6 (del autor) | 21,21 GiB | 3,71 | 96,8% | 5,260 |
| Afín q8 (del autor) | 27,48 GiB | 1,25 | 98,5% | 5,241 |
| bf16 | 51,7 GiB | 0 | 100% | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte explícitamente que la perplejidad no ordena estas builds y que debe usarse KL.

## Requisitos de hardware

- VRAM/memoria unificada: el pico de memoria iguala el tamaño en disco, 12,47 GiB, más overhead del runtime y del contexto; en la práctica requiere un Mac con al menos 16 GB de memoria unificada, y 24 GB o más para contextos largos.
- GPU: exclusivamente Apple Silicon (MLX). No hay soporte CUDA documentado en esta build; las GPU NVIDIA (A100, H100, RTX 4090) no son un objetivo de este checkpoint.
- Cabe en GPU de consumo Apple: cualquier Mac con chip M-series y memoria unificada suficiente (M1/M2/M3/M4 en configuraciones de 16 GB o superiores).
- Despliegue: `mlx-lm` estándar (el runtime VQ viaja en el repo como `model.py`); multi-Mac con el fork de exo del autor; decodificación especulativa con `exo --mtp` o `EXO_MTP=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor menciona mejoras de prefill de hasta 1,46x en geometrías con codebooks grandes, hasta 1,34x por la relajación de subvectores irregulares, un brazo fusionado d8 y una memoización de routing de ~2%, pero solo en las geometrías afectadas; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-VQ-3.9bpw (este) | 12,12B | no disponible | 12,47 GiB | Apache 2.0 | MLX, Apple Silicon |
| Afín q4 del mismo autor | 12,12B | no disponible | 14,95 GiB | Apache 2.0 | MLX |
| VQ-4.5bpw del mismo autor | 12,12B | no disponible | 14,45 GiB | Apache 2.0 | MLX |
| Qwen3.8-27B bf16 (base) | 12,12B | no disponible | 51,7 GiB | Apache 2.0 | safetensors |

La comparación relevante es interna a la escalera del autor: frente a la afín q4 pierde calidad (254,0 vs 135,0 mnats de media KL) a cambio de 2,5 GiB menos; frente a la afín q3 gana calidad de forma clara (85,8 vs 187,8 mnats en prosa) por 0,6 GiB más. No se dispone de comparación con cuantizaciones MLX de terceros del mismo modelo base, porque según el autor no existían en el momento de la publicación.

## Limitaciones y advertencias

- Solo inglés declarado; no hay evidencia de calidad multilingüe en esta build.
- El daño de cuantización se concentra en texto literario (581,7 mnats/tok, varias veces peor que en prosa), por lo que la generación creativa es el caso de uso más arriesgado.
- Riesgo de alucinación inherente al modelo base, no mitigado por la cuantización; no se documentan evaluaciones de factualidad.
- La perplejidad no es una métrica fiable para comparar estas builds; el autor demuestra que la afín q8 lee la perplejidad más alta pese a ser la más cercana al bf16.
- Dependencia de Apple Silicon y de `mlx-lm`: no hay ruta documentada a CUDA, vLLM, llama.cpp u Ollama.
- El runtime VQ viaja como `model.py` en el repositorio; revisiones anteriores fallaron al cargar con `ModuleNotFoundError` en instalaciones limpias (corregido en la reparación de 2026-09), lo que obliga a fijar revisión si se automatiza el despliegue.
- Con MTP activo, exo sirve peticiones de forma secuencial: no apto para cargas concurrentes o multiagente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus obligaciones de atribución deben verificarse en la model card de Qwen/Qwen3.8-27B.
- El nombre comercial "27B" no coincide con los 12,12B reales de los safetensors; conviene dimensionar el hardware por el dato real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrainFlorist/Qwen3.8-27B-VQ-3.9bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de exo con soporte MTP: https://github.com/noahzelezny/exo
- Knurlogic (instrucciones de ejecución, multi-Mac, drafting y visión): https://github.com/noahzelezny/Knurlogic

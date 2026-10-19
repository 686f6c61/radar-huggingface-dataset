# spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-i1-GGUF

## Resumen

Este repositorio no es un modelo original, sino un conjunto de cuantizaciones GGUF con matriz de importancia (imatrix, prefijo `i1`) de `spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara`, una versión "decensored" (abliterated) del `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`. El modelo subyacente es un híbrido Mamba-Transformer con arquitectura MoE latente de 120.668.707.840 parámetros totales y unos 12B activos por token, torre de visión RADIO y cabeza de predicción multi-token (MTP). El trabajo de cuantización y de eliminación de rechazos lo firma el usuario `spiritfather`, no NVIDIA.

La relevancia práctica está en que permite ejecutar un modelo de 120B con visión sobre `llama.cpp` en hardware de una sola máquina: el reparto MoE (12B activos) mantiene el coste de cómputo por token relativamente bajo, mientras que las cuantizaciones imatrix reducen el peso en disco desde 86,1 GB (`i1-Q4_K_M`) hasta 52,9 GB (`i1-IQ2_M`). El autor reporta además una velocidad de decodificación un 1,16x superior al cargar la cabeza MTP como modelo borrador.

El interés secundario es el de la ablación: según la model card, la tasa de rechazos medida con la regla de Heretic cae de 100/100 en el modelo original a 6/100 en esta variante, con una divergencia KL de 0,1092 respecto al original. Es un dato de comportamiento, no una evaluación de seguridad, y conviene tratarlo como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-Transformer con MoE latente; torre de visión RADIO y cabeza MTP (multi-token prediction) |
| Parametros totales | 120.668.707.840 (≈120,7B) |
| Parametros activos | ≈12B (sufijo A12B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF imatrix: i1-Q4_K_M, i1-IQ4_XS, i1-IQ3_M, i1-IQ3_XXS, i1-IQ2_M; Q8_0 para el proyector de visión (`mmproj`) y para la cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en BF16 safetensors |

Otros datos del repositorio: pipeline `image-text-to-text`, 81 descargas, 0 likes, tamaño total del repo 340,8 GB, creado el 2026-10-19 y actualizado el mismo día.

## Arquitectura y entrenamiento

El modelo base es un híbrido Mamba-Transformer con mezcla de expertos latente: son 120,7B de parámetros totales de los que se activan aproximadamente 12B por token, lo que sitúa el coste de inferencia muy por debajo de lo que sugiere el tamaño del checkpoint. Incorpora una torre de visión RADIO para entrada de imagen junto a texto, y una cabeza de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa. Sobre el entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) no hay información en la documentación proporcionada.

Lo específico de esta publicación es el post-entrenamiento de ablación: se aplicó Heretic v2.0.0.dev0 con Arbitrary-Rank Ablation (ARA) sobre las capas 41 a 54 (`start_layer_index` 41, `end_layer_index` 54), con `preserve_good_behavior_weight` 0,7358, `steer_bad_behavior_weight` 0,1777, `overcorrect_relative_weight` 0,9892 y `neighbor_count` 2. Después, `spiritfather` generó cuantizaciones imatrix calculadas sobre `bartowski/calibration_datav3` aplicado al BF16 del propio modelo, de modo que los bits se asignan según la sensibilidad observada en el texto de calibración.

## Capacidades

- Generación de texto conversacional multi-turno (`conversational` en los tags del repo).
- Entrada imagen-texto: al cargar el `mmproj` Q8_0, el modelo procesa imágenes junto a texto.
- Escritura creativa y roleplay: el autor lo posiciona explícitamente en este eje y lo evalúa con CaliperBench, un benchmark de oficio narrativo, roleplay y disposición, no de inteligencia general.
- Comportamiento "uncensored"/abliterated: reducción drástica de rechazos según la métrica del autor (6/100 frente a 100/100).
- Decodificación especulativa mediante la cabeza MTP (`--spec-type draft-mtp`), con aproximadamente 1,16x de mejora medida en Q8_0.
- Inferencia eficiente en CPU/GPU mixta gracias al reparto MoE y al soporte de llama.cpp.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking: la evaluación de Heretic se realizó con "thinking off", lo que sugiere que existe un modo de razonamiento, pero no hay documentación disponible sobre su funcionamiento.

## Casos de uso

- Escritura creativa y narrativa larga: el modelo está orientado y evaluado en este dominio (CaliperBench), y la variante abliterated evita los rechazos que rompen la continuidad en ficción con material sensible. La ventana de contexto no está documentada, así que la longitud de obra debe validarse empíricamente.
- Roleplay y personajes persistentes: combinación de un modelo de 120B con 12B activos y una tasa de rechazo declarada del 6%, adecuada para asistentes de personaje que no deben salirse del papel.
- Análisis de documentos con imágenes: con el `mmproj` cargado, se pueden pasar capturas, gráficos o páginas escaneadas junto a la consulta de texto; útil para extracción de datos de informes y verificación visual en local.
- Generación de datos sintéticos para ajuste fino: un modelo con pocos rechazos sirve para producir corpus de diálogo y narrativa que otros modelos filtrados no generarían; hay que revisar y etiquetar la salida antes de usarla.
- Investigación sobre alineación y ablación: la pareja original/variante aquí publicada, con KL de 0,1092 y tasa de rechazo 6/100, es un caso de estudio reproducible para medir qué se degrada al eliminar rechazos con ARA.
- Inferencia on-premise con control de datos: al ejecutarse en llama.cpp y no requerir API externa, encaja en entornos donde el texto y las imágenes no pueden salir de la infraestructura propia; el coste es el hardware (ver sección siguiente).
- Servicio de baja latencia relativa: la cabeza MTP como draft model aporta un 1,16x de aceleración en la prueba del autor, útil en servicios conversacionales donde cada token cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU) en la información disponible. Los únicos datos numéricos son los de la model card:

| Metrica | Este modelo | Modelo original (nvidia/...-BF16) |
|---|---|---|
| Rechazos (regla de Heretic, 100 prompts de `mlabonne/harmful_behaviors`) | 6/100 | 100/100 |
| Divergencia KL (primer token, 100 prompts de `mlabonne/harmless_alpaca`) | 0,1092 | 0 (por definición) |

| Cuantizacion | Tamano | PPL (wikitext-2) | KLD vs BF16 | Mismo token top-1 |
|---|---:|---:|---:|---:|
| i1-Q4_K_M | 86,1 GB | 4,9413 | 0,0308 | 93,0% |
| i1-IQ4_XS | 66,3 GB | 5,0161 | 0,0405 | 92,3% |
| i1-IQ3_M | 60,8 GB | 5,1433 | 0,0983 | 87,8% |
| i1-IQ3_XXS | 56,8 GB | 5,5039 | 0,1646 | 84,6% |
| i1-IQ2_M | 52,9 GB | 6,6182 | 0,3646 | 75,8% |

Metodología declarada: PPL y KLD sobre el test de wikitext-2, 100 fragmentos de 512 tokens, cada cuantización comparada contra los logits del GGUF BF16 del autor. La métrica de rechazos es una regla de palabras clave de Heretic y no una evaluación de seguridad.

## Requisitos de hardware

- VRAM mínima: el peso de los archivos va de 52,9 GB (`i1-IQ2_M`) a 86,1 GB (`i1-Q4_K_M`); a eso hay que sumar caché KV y buffers, no cuantificados en la información disponible.
- `i1-IQ2_M` (52,9 GB): cabe en una A100 80GB o H100 80GB con margen; no cabe en 2x RTX 4090 (48 GB). Calidad claramente degradada (KLD 0,3646, 75,8% de coincidencia top-1).
- `i1-IQ3_XXS` (56,8 GB) e `i1-IQ3_M` (60,8 GB): una A100/H100 80GB los aloja con holgura moderada; 2x RTX 4090 (48 GB) sigue sin ser suficiente.
- `i1-IQ4_XS` (66,3 GB): A100 80GB o H100 80GB con contexto corto; H200 141GB si se necesita ventana amplia.
- `i1-Q4_K_M` (86,1 GB): supera los 80 GB de una A100/H100, así que requiere H200 141GB, 2x A100 80GB o memoria unificada de 128 GB o más (Mac Studio) con offloading parcial.
- GPU consumer: ninguna RTX 4090/5090 (24-32 GB) puede alojar el modelo completo. Solo es viable con offloading a RAM del sistema en llama.cpp, con la penalización de velocidad correspondiente.
- Despliegue: llama.cpp en versión master (`llama-server`); el autor advierte que compilaciones antiguas pueden no cargar el proyector de visión ni la cabeza MTP. Para multimodal hace falta además `mmproj-...-Q8_0.gguf` junto al quant elegido. La información no menciona soporte en vLLM, TGI u Ollama.
- Latencia y throughput: solo se reporta el 1,16x de mejora con MTP sobre Q8_0 en la prueba del autor; no hay tokens/s absolutos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | KLD vs original | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este repo (i1 GGUF, imatrix) | 120,7B totales / ~12B activos | no disponible | 6/100 | 0,1092 | openmdw-1.1 | GGUF (52,9-86,1 GB por quant) |
| spiritfather/...-heretic-ara (BF16, modelo base de esta cuantización) | 120,7B / ~12B activos | no disponible | 6/100 (mismo checkpoint) | 0,1092 | openmdw-1.1 | safetensors BF16 |
| spiritfather/...-heretic-ara-GGUF (quants estáticos) | 120,7B / ~12B activos | no disponible | 6/100 | 0,1092 | openmdw-1.1 | GGUF sin imatrix |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (original) | 120,7B / ~12B activos | no disponible | 100/100 | 0 (referencia) | openmdw-1.1 | safetensors BF16 |

No hay en la información proporcionada datos de modelos de otros fabricantes con los que comparar parámetros, contexto o rendimiento; la comparación se limita a las variantes del mismo checkpoint.

## Limitaciones y advertencias

- El modelo está abliterated: los rechazos se han reducido deliberadamente (6/100 según la regla del autor). No es una evaluación de seguridad y no dice nada sobre lo que el modelo producirá ante prompts dañinos. Para uso en producción orientado al público requiere filtros externos.
- La divergencia KL de 0,1092 respecto al original indica una desviación medible del comportamiento, no solo en temas sensibles; pueden aparecer cambios en estilo y en respuestas neutras.
- Riesgo de alucinación: no hay datos de benchmarks de conocimiento o fidelidad en la información disponible. Un modelo orientado a escritura creativa y sin evaluación de QA no es adecuado sin verificación para tareas factuales.
- Longitud de contexto e idiomas soportados no están documentados; no se puede asumir un contexto largo ni un rendimiento multilingüe concreto.
- Las cuantizaciones bajas degradan de forma apreciable: `i1-IQ2_M` cae a 75,8% de coincidencia top-1 y PPL 6,6182 frente a 4,9413 de `i1-Q4_K_M`. Para producción, el mínimo razonable es IQ4_XS o superior.
- La licencia openmdw-1.1 se etiqueta como `other`: hay que revisar los términos en el enlace oficial antes de un uso comercial; las condiciones concretas no están detalladas en la información disponible.
- Dependencia de llama.cpp master: compilaciones antiguas pueden fallar al cargar la torre de visión o la cabeza MTP.
- Validación comunitaria muy baja: 81 descargas y 0 likes, con el repositorio creado y actualizado el mismo día. No hay todavía evidencia independiente de calidad.
- El repo completo ocupa 340,8 GB; conviene descargar solo el quant necesario.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-i1-GGUF
- Modelo base decensored (BF16): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Cuantizaciones estáticas: https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-GGUF
- Proyector de visión (mmproj Q8_0): https://huggingface.co/spiritfather/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-i1-GGUF/resolve/main/mmproj-NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-heretic-ara-Q8_0.gguf
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Heretic (método de ablación): https://github.com/p-e-w/heretic
- Proyecto Heretic: https://heretic-project.org
- CaliperBench: https://caliperbench.com
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Discord del autor: https://discord.gg/rhE9zdKyE4

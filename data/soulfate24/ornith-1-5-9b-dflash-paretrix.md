# Soulfate24/Ornith-1.5-9B-DFlash-Paretrix

## Resumen

Ornith-1.5-9B-DFlash-Paretrix es un conjunto de cuantizaciones GGUF del modelo base ornith-ai/Ornith-1.5-9B, publicado por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos cuantizados en formato GGUF para su uso con llama.cpp, acompañada de un módulo de decodificación especulativa DFlash (draft) y de una variante MTP (multi-token prediction). El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está etiquetado como compatible con pipelines de generación de texto y visión.

La aportación principal de esta ficha no es el modelo en sí, sino el método de cuantización. Paretrix es una suite de cuantización empírica y sensible a las activaciones que, en lugar de aplicar un único ancho de bits uniforme a toda la red, mide la respuesta de cada clase de tensor a cada tipo de cuantización y planifica cada nivel (rung) mediante una mochila exacta (knapsack) que maximiza la fidelidad bajo una restricción de tamaño. El resultado son variantes con nombres como Fidelity-48pc, Quality-36pc, Nano-27pc o Femto-21pc, cada una con su propio equilibrio entre tamaño en disco, perplejidad (PPL), divergencia KL (KLD) y coincidencia top-p respecto a los logits en BF16.

El modelo es relevante ahora porque demuestra que es posible obtener cuantizaciones de ~4,8 GB (Nano-27pc) con una KLD de 0,0648, mejor que la del IQ4_XS-imx estándar (0,0729) pese a ocupar menos espacio, y porque incluye un draft DFlash para decodificación especulativa y una versión MTP que funciona de forma autónoma. La licencia MIT y la disponibilidad en GGUF lo hacen directamente desplegable en entornos de producción con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; la model card no detalla la arquitectura interna) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona que la configuración MTP con KV cache q5_1 y draft cache q8_0 maximiza la ventana de contexto, pero no da la cifra) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y variantes Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el repo también declara compatibilidad con transformers |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Ornith-1.5-9B (tipo de atención, número de capas, composición del dataset o si hubo RLHF/DPO). Lo que sí se documenta es la capa de cuantización y el mecanismo de decodificación especulativa. El repositorio incluye un draft DFlash (ornith-ai/Ornith-1.5-9B-DFlash) para decodificación especulativa y una versión MTP (multi-token prediction) que, según la model card, funciona de forma autónoma y no debe ejecutarse simultáneamente con un draft DFlash o DSpark.

La innovación técnica destacable es el método Paretrix. Partiendo de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx), el proceso mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide el resultado contra los logits en BF16. Con esas mediciones, una mochila exacta planifica cada nivel, y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. La model card afirma que lo que mide un modelo se hereda al siguiente modelo de la misma familia. El resultado se refleja en la tabla de niveles: por ejemplo, Nano-27pc ocupa 4.794 MiB con PPL 8,8194 y KLD 0,0648, frente a IQ4_XS-imx con 4.956 MiB, PPL 9,2451 y KLD 0,0729.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Capacidades de visión declaradas en los tags del repositorio (vision), aunque la model card no detalla su alcance.
- Decodificación especulativa mediante el draft DFlash, orientada a reducir la latencia de generación.
- Variante MTP (multi-token prediction) autónoma, que predice varios tokens por paso.
- Compatibilidad con llama.cpp y con el ecosistema transformers.
- Cuantización híbrida por clases de tensor con niveles calibrados empíricamente (Paretrix).
- Soporte de endpoints compatibles (tag endpoints_compatible).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, matemáticas o modo thinking.

## Casos de uso

- Despliegue en CPU o GPU de gama media con llama.cpp: las variantes Compact-33pc (5.792 MiB) y Mini-30pc (5.281 MiB) permiten ejecutar un modelo de ~9B en equipos con 8 GB de VRAM o en CPU con RAM suficiente, manteniendo una KLD de 0,0362 y 0,0542 respectivamente.
- Inferencia de baja latencia con decodificación especulativa: el draft DFlash acelera la generación al proponer tokens que el modelo principal verifica, útil en asistentes interactivos donde el tiempo por token es crítico.
- Servicio conversacional con presupuesto de memoria ajustado: la variante Nano-27pc (4.794 MiB, KLD 0,0648) supera en fidelidad al IQ4_XS-imx estándar ocupando menos espacio, lo que la hace adecuada para instancias con VRAM limitada.
- Evaluación comparativa de métodos de cuantización: los 13 niveles publicados con métricas de PPL, KLD, RMS Δp y top-p permiten reproducir experimentos sobre el compromiso tamaño-fidelidad en modelos de ~9B.
- Procesamiento de imágenes y texto en un mismo pipeline: el tag vision sugiere uso en tareas multimodal (descripción de imágenes, extracción de información), aunque la model card no detalla el soporte.
- Prototipado rápido en transformers: el repo declara library_name transformers y pesos safetensors, lo que facilita cargar el modelo en Python para pruebas antes de pasar a GGUF.
- Contexto largo con caché cuantizada: la configuración recomendada para MTP (KV cache q5_1, draft cache q8_0) maximiza la ventana de contexto con velocidad igual o mejor cuando el contexto está muy cargado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí publica métricas de fidelidad de cuantización frente a BF16, que se reproducen a continuación.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|:---|
| Q8_0 (stock) | 9086 | 8,9461 | +0,0247 | 0,0100 | 2,78% | 97,7% | ★ |
| Fidelity-48pc | 8212 | 8,9078† | −0,0136 | 0,0118 | 2,81% | 97,3% | ★ |
| Precision-42pc | 7325 | 8,8886† | −0,0328 | 0,0149 | 3,08% | 96,3% | ★ |
| Q6_K-imx (stock) | 7018 | 8,6805† | −0,2409 | 0,0240 | 3,85% | 95,7% | ★ |
| Quality-36pc | 6306 | 8,8666† | −0,0548 | 0,0254 | 3,98% | 94,4% | ★ |
| Q5_K_M-imx (stock) | 6168 | 8,6950† | −0,2264 | 0,0309 | 4,09% | 94,7% | ★ |
| Compact-33pc | 5792 | 8,9295 | +0,0081 | 0,0362 | 4,89% | 93,5% | ★ |
| Mini-30pc | 5281 | 8,7179† | −0,2035 | 0,0542 | 5,88% | 91,5% | ★ |
| IQ4_XS-imx (stock) | 4956 | 9,2451 | +0,3237 | 0,0729 | 6,81% | 91,0% | < Nano-27pc |
| Nano-27pc ⭐ | 4794 | 8,8194† | −0,1020 | 0,0648 | 6,58% | 90,5% | ★ |
| Pico-24pc | 4306 | 8,9726 | +0,0512 | 0,1248 | 8,81% | 86,5% | ★ |
| IQ3_M-imx (stock) | 4211 | 9,1407 | +0,2193 | 0,1768 | 10,87% | 84,7% | ★ |
| Femto-21pc | 3802 | 9,3947 | +0,4733 | 0,1784 | 11,19% | 83,5% | ★ |

El símbolo † indica, según la model card, valores de PPL inferiores a la base de referencia; no se detalla el método de medición ni el corpus de evaluación.

## Requisitos de hardware

- VRAM estimada según el nivel de cuantización: desde ~3,8 GB (Femto-21pc) hasta ~9,1 GB (Q8_0). Los niveles intermedios más usados rondan 4,8 GB (Nano-27pc), 5,3 GB (Mini-30pc) y 5,8 GB (Compact-33pc).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, los niveles de 4-6 GB caben en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; los niveles de 8-9 GB requieren 12 GB o más de VRAM (RTX 4070 Ti Super, RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, al menos las variantes Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama (a través de GGUF), transformers (pesos safetensors del repo), y endpoints compatibles según el tag endpoints_compatible. No se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica que la configuración MTP con KV cache q5_1 y draft cache q8_0 ofrece velocidad igual o mejor con contexto muy cargado, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-DFlash-Paretrix (Nano-27pc) | ~9B | no disponible | GGUF | MIT | KLD 0,0648, 4.794 MiB, incluye draft DFlash y MTP |
| Ornith-1.5-9B (base) | ~9B | no disponible | safetensors | MIT (según license_link) | Modelo sin cuantizar de referencia |
| IQ4_XS-imx (stock) del mismo modelo | ~9B | no disponible | GGUF | MIT | KLD 0,0729, 4.956 MiB, cuantización uniforme estándar |
| Q4_K_M de modelos ~9B comparables | ~9B | no disponible | GGUF | variable | No se dispone de datos medidos en la misma escala para comparar |

La comparativa se limita a variantes del propio modelo porque la información proporcionada no incluye resultados de otros modelos de ~9B medidos con las mismas métricas (PPL, KLD, RMS Δp, top-p) sobre el mismo corpus.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado: no hay benchmarks de veracidad ni evaluaciones de factualidad en la información disponible.
- Los niveles de cuantización agresiva (Pico-24pc, Femto-21pc) degradan la fidelidad de forma notable: KLD 0,1248 y 0,1784 respectivamente, frente a 0,0100 de Q8_0. No se recomiendan para tareas que exijan precisión alta.
- La model card advierte que la versión MTP no debe ejecutarse junto con un draft DFlash o DSpark; hacerlo puede provocar un comportamiento incorrecto.
- El repositorio ocupa 231,1 GB, lo que exige planificar la descarga y el almacenamiento; conviene descargar solo el nivel GGUF necesario.
- La longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- El soporte de visión aparece solo como tag, sin documentación de resolución, tipos de imagen ni evaluación; no debe asumirse en producción sin validación previa.
- La licencia MIT permite uso comercial, pero se hereda del modelo base; conviene verificar el LICENSE enlazado en ornith-ai/Ornith-1.5-9B por si hubiera condiciones adicionales.
- El modelo lo publica un usuario individual (Soulfate24), no el equipo de ornith-ai; la trazabilidad y el mantenimiento no están garantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Ornith-1.5-9B-DFlash-Paretrix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Draft DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite

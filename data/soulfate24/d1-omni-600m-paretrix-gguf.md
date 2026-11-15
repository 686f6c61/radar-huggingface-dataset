# Soulfate24/d1-omni-600M-Paretrix-GGUF

## Resumen

d1-omni-600M-Paretrix-GGUF es una colección de cuantizaciones GGUF del modelo multimodal LiquidAI/d1-omni-600M, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. El modelo base, desarrollado por LiquidAI, es un modelo de decisión y clasificación con arquitectura de tipo liquid, orientado a despliegue en el borde (edge), que procesa entradas de imagen, texto y audio y produce decisiones tipadas. Con 380.732.161 parámetros reales según safetensors, está pensado para tareas de clasificación calibrada y razonamiento de "sistema uno" (respuestas rápidas y directas) más que para generación de texto libre extensa.

La relevancia de esta publicación no reside en el modelo en sí, sino en el método de cuantización. Paretrix es una suite de cuantización empírica y consciente de las activaciones que planifica cada nivel de compresión midiendo la respuesta del propio modelo a cada cambio de tipo de tensor, en lugar de aplicar una familia uniforme de bits a toda la red. El autor publica una tabla comparativa (JevBench, 231 decisiones tipadas) que mide precisión, tasa de coincidencia con la referencia F16, número de "flips", decisividad, divergencia KL y latencia p50 para cada nivel, desde F16 hasta Femto-21pc (163 MiB).

El resultado es un conjunto de 11 cuantizaciones etiquetadas por porcentaje de peso retenido, con tamaños que van de 350 MiB a 163 MiB, más las referencias stock (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx). El modelo soporta 15 idiomas y se distribuye en formato GGUF compatible con llama.cpp, lo que facilita su integración en pipelines de inferencia locales y en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | liquid (familia LFM2.5, según tags); no se detalla la topología interna |
| Parametros totales | 380.732.161 (safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F16, Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock); Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (repo de 2,3 GB); el modelo base en safetensors |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repo | 2,3 GB |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-omni-600M pertenece a la familia LFM2.5 y se describe en los tags como "liquid", "edge", "decision", "classification", "calibration", "system-one" y "multimodal" (visión y audio). La información disponible no detalla la topología interna (número de capas, dimensión oculta, mecanismo de atención o si emplea capas de estado recurrente de tipo liquid), ni los datos de entrenamiento, el número de tokens, la composición del dataset o si hubo RLHF/DPO. Tampoco se especifica la longitud de contexto. Todo ello debe considerarse no disponible.

La innovación técnica destacable de esta publicación es el método Paretrix de cuantización. Según la model card, parte de tres bases stock (Q8_0, Q6_K-imx, IQ4_XS-imx) y, para cada clase de tensor, la mueve individualmente a cada tipo de cuantización posible, midiendo el efecto contra los logits BF16. Con esas celdas medidas, un problema de mochila exacto (knapsack) planifica cada nivel, y un duelo en el régimen de veredicto decide si el plan sustituye al campeón anterior. El autor afirma que lo medido en un modelo se hereda en el siguiente de la misma familia. El resultado se evalúa con JevBench (231 decisiones tipadas), midiendo precisión, coincidencia con F16, flips, decisividad, KL óptimo y latencia p50.

## Capacidades

- Clasificación y decisión tipada: el modelo está orientado a producir decisiones categorizadas y calibradas, no generación libre de texto.
- Procesamiento multimodal: acepta entradas de imagen, texto y audio según los tags (vision, audio, image-text-to-text).
- Razonamiento de "sistema uno": respuestas rápidas y directas, adecuado para latencias bajas en el borde.
- Calibración: los tags incluyen "calibration", lo que sugiere salidas con confianza calibrada para umbrales de decisión.
- Multilingüe: 15 idiomas (en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh).
- Compatibilidad con llama.cpp: los GGUF permiten ejecución en CPU, GPU y dispositivos edge.
- Extracción de características: el tag "feature-extraction" indica uso como extractor de representaciones.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el enfoque "system-one" sugiere lo contrario.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo puede etiquetar imágenes entrantes en dispositivos con poca memoria usando las cuantizaciones Pico-24pc (184 MiB) o Femto-21pc (163 MiB), con latencias p50 de 31-32 ms según JevBench.
- Moderación de contenido multimodal: combinando texto, imagen y audio, puede clasificar contenido en categorías predefinidas con umbrales calibrados, aprovechando la naturaleza de decisión tipada del modelo.
- Enrutamiento de consultas en asistentes de voz: dado un audio de entrada, el modelo puede decidir la categoría de la consulta y derivarla al pipeline adecuado, con latencia de decenas de milisegundos.
- Detección de eventos en audio para IoT: con Femto-21pc o Nano-27pc, cabe en microcontroladores o SBCs y puede clasificar eventos sonoros en tiempo real.
- Preetiquetado en pipelines de anotación: usar Precision-42pc (312 MiB, 58,0 % de precisión en JevBench) como primer paso de etiquetado automático antes de revisión humana, reduciendo coste de anotación.
- Extracción de características para búsqueda multimodal: emplear el modelo como extractor de embeddings (tag feature-extraction) en un índice vectorial para recuperación de imágenes o audio.
- Filtrado previo en sistemas de recomendación: clasificar ítems multimodales por categoría y confianza calibrada antes de pasarlos a un modelo mayor, usando la versión Compact-33pc (246 MiB) como compromiso entre tamaño y fidelidad.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de JevBench (231 decisiones tipadas) publicados por el autor de la cuantización. No son benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K) y no hay comparación con otros modelos.

| Modelo | MiB | acc | same | flips | decisive | opt KL | p50 ms |
|---|---:|---:|---:|---:|---:|---:|---:|
| F16 (referencia) | 729 | 56,7 | ref | — | — | — | — |
| Q8_0 (stock) | 388 | 57,6 | 97,8 | 5 | 100,0 | 0,0012 | 30 |
| Fidelity-48pc | 350 | 56,3 | 96,5 | 8 | 99,4 | 0,0018 | 30 |
| Precision-42pc | 312 | 58,0 | 96,5 | 8 | 100,0 | 0,0036 | 30 |
| Q6_K-imx (stock) | 300 | 58,4 | 93,5 | 15 | 100,0 | 0,0060 | 32 |
| Quality-36pc | 269 | 58,9 | 93,1 | 16 | 100,0 | 0,0083 | 30 |
| Q5_K_M-imx (stock) | 267 | 59,3 | 93,9 | 14 | 100,0 | 0,0104 | 32 |
| Compact-33pc | 246 | 59,7 | 93,5 | 15 | 99,4 | 0,0124 | 32 |
| Mini-30pc | 225 | 58,4 | 88,7 | 26 | 96,4 | 0,0348 | 28 |
| IQ4_XS-imx (stock) | 214 | 58,4 | 83,1 | 39 | 92,3 | 0,0491 | 26 |
| Nano-27pc | 204 | 56,3 | 86,1 | 32 | 94,1 | 0,0362 | 29 |
| IQ3_M-imx (stock) | 187 | 59,3 | 79,7 | 47 | 89,9 | 0,0962 | 34 |
| Pico-24pc | 184 | 53,7 | 81,4 | 43 | 92,3 | 0,0640 | 31 |
| Femto-21pc | 163 | 55,8 | 77,9 | 51 | 89,9 | 0,0823 | 32 |

Lectura: las cuantizaciones Paretrix mantienen una tasa de coincidencia con F16 claramente superior a las stock de tamaño comparable (por ejemplo, Quality-36pc a 269 MiB logra 93,1 % de coincidencia frente a 83,1 % de IQ4_XS-imx a 214 MiB). La latencia p50 se mantiene en 26-34 ms en todos los niveles. No hay datos de benchmarks estándar del modelo base.

## Requisitos de hardware

- VRAM estimada: desde menos de 250 MiB para Femto-21pc (163 MiB de pesos) hasta unos 800 MiB para F16 (729 MiB), incluyendo overhead de contexto y buffers.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es sobradamente suficiente; también iGPU y NPUs.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; incluso en dispositivos con 512 MB de RAM.
- Despliegue: llama.cpp es el runtime natural (formato GGUF); también Ollama si se importa el GGUF; vLLM y TGI no soportan GGUF de forma nativa para este modelo según la información disponible.
- Latencia y throughput: p50 de 26-34 ms por decisión según JevBench (hardware no especificado); el throughput no se detalla.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión multimodales de ~400 M de parámetros) en la documentación proporcionada. La comparación más directa es entre las propias cuantizaciones del repo, resumida en la tabla de benchmarks. Frente a las cuantizaciones stock de llama.cpp, las Paretrix ofrecen mayor fidelidad a igual tamaño en el régimen medido, pero no hay comparación pública con alternativas de otros autores.

| Criterio | d1-omni-600M-Paretrix | Alternativas |
|---|---|---|
| Parámetros | 380,7 M | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | lfm1.0 | no disponible |
| Formato | GGUF | no disponible |

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos conocidos; al ser un modelo de clasificación, puede heredar sesgos de sus datos de entrenamiento, no especificados.
- Alucinación: el riesgo es menor que en modelos generativos, pero las decisiones pueden ser erróneas con confianza alta; la calibración debe validarse en el dominio de uso.
- Contexto e idioma: la longitud de contexto no está disponible; aunque se listan 15 idiomas, no se garantiza un rendimiento uniforme en todos ellos.
- Licencia lfm1.0: es una licencia "other" que puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Las cuantizaciones agresivas (Pico-24pc, Femto-21pc) muestran una caída notable de coincidencia con F16 (81,4 % y 77,9 %) y aumentan los flips (43 y 51), lo que puede ser inaceptable en decisiones sensibles.
- Los benchmarks JevBench son internos del autor de la cuantización, con 231 decisiones; no son un estándar de la comunidad y deben tomarse como indicativos.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de las afirmaciones del autor.
- El modelo base es de LiquidAI; esta publicación es una cuantización de terceros, no oficial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/d1-omni-600M-Paretrix-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-omni-600M
- Suite Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia LFM1.0: incluida en el repo como LICENSE (no se dispone de URL directa)
- Paper, blog o demo: no disponible en la información proporcionada.

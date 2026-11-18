# Soulfate24/Spark-X2.5-4B-Paretrix

## Resumen

Spark-X2.5-4B-Paretrix es una suite de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-4B, un transformer de 4.112.079.360 parámetros orientado a generación de texto y flujos de agente. Lo publica el usuario Soulfate24 bajo licencia Apache 2.0 y emplea la metodología propia Paretrix, un esquema de cuantización híbrida guiado por activaciones que planifica cada nivel ("rung") mediante una mochila exacta sobre mediciones por clase de tensor, en lugar de aplicar una única familia de bits a toda la red.

El interés del artefacto no reside en un modelo nuevo, sino en el catálogo de variantes comprimidas con métricas de fidelidad publicadas (PPL, ΔPPL, KLD, RMS Δp y top-p) frente a los cuantizados estándar de llama.cpp (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx). Cada nivel se posiciona en una frontera de Pareto declarada, de modo que el usuario puede elegir el compromiso tamaño/fidelidad con datos medidos y no estimados.

Además incluye módulos de decodificación especulativa (drafts DSpark) que aceleran la inferencia sobre el nivel Quality-36pc, con incrementos de throughput medidos de hasta ×2,46 según la cuantización de la caché KV. El repositorio ocupa 64,2 GB y acumula 9.319 descargas, lo que indica un uso real en despliegues locales con llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles en la información proporcionada) |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el draft `draft-32K` sugiere ventanas de hasta 32K, sin confirmación) |
| Tipos de cuantización | GGUF híbridos Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; más bases stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en transformers/safetensors |

## Arquitectura y entrenamiento

La información disponible describe el proceso de cuantización, no el preentrenamiento del modelo base. Spark-X2.6-4B es un transformer de 4,1 mil millones de parámetros del que no se detallan composición del dataset, número de tokens ni si hubo RLHF o DPO. Los tags incluyen `agent` y `conversational`, lo que sugiere un ajuste orientado a diálogo y uso como agente, pero no se aportan cifras.

La innovación técnica documentada es Paretrix: se toman tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), se mueve cada clase de tensor de forma aislada a cada tipo de cuantización y se mide la respuesta contra los logits en BF16. Con esas celdas, una mochila exacta planifica cada nivel y un duelo en el régimen de veredicto decide si el plan sustituye al campeón. El resultado son niveles con tamaños intermedios entre los estándar (por ejemplo, Quality-36pc con 2.894 MiB frente a Q5_K_M-imx con 2.840 MiB) pero con menor degradación de perplejidad. Se incluyen además drafts de decodificación especulativa: el oficial (415 MiB), `draft-32K` con capas oficiales y readout propio (453 MiB) y `draft-lite` podado y reentrenado (209 MiB).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Orientación a flujos de agente según los tags del repositorio (`agent`), sin detalle de soporte explícito de tool calling en la información disponible.
- Decodificación especulativa mediante módulos DSpark, con ganancias de throughput medidas sobre el nivel Quality-36pc.
- Despliegue en llama.cpp con cuantizaciones GGUF de distintos tamaños y perfiles de fidelidad.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni modo thinking.

## Casos de uso

- Inferencia local en estaciones de trabajo: los niveles Compact-33pc (2.660 MiB) y Mini-30pc (2.424 MiB) permiten ejecutar un modelo de 4B en GPU de consumo con pérdida de perplejidad contenida (+0,0489 y +0,4101 respectivamente frente a BF16), adecuado para prototipos y asistentes personales.
- Servicio conversacional de bajo coste: el nivel Quality-36pc (2.894 MiB) ofrece el mejor equilibrio declarado entre tamaño y fidelidad y, combinado con el draft `draft-32K`, alcanza 112,7 t/s con caché KV q8_0 y 106,1 t/s con q5_1, útil para chat multi-turno con latencia ajustada.
- Despliegue en hardware limitado: Femto-21pc (1.750 MiB) y Pico-24pc (1.978 MiB) caben en GPUs con 4-6 GB de VRAM, pensados para entornos embebidos o portátiles sin GPU dedicada.
- Aceleración de pipelines existentes: si ya se sirve Spark-X2.6-4B en llama.cpp, sustituir el GGUF stock por el nivel Paretrix equivalente reduce tamaño manteniendo o mejorando PPL y KLD, sin cambios en la integración.
- Evaluación de estrategias de cuantización: la tabla publicada de PPL, KLD, RMS Δp y top-p por nivel sirve como referencia para decidir presupuestos de bits en otros modelos de la misma familia, ya que el autor indica que las mediciones se heredan entre modelos de la familia.
- Generación de texto bilingüe inglés-chino: el soporte declarado de ambos idiomas cubre casos de atención al cliente o documentación en esos mercados, siempre con validación propia porque no hay benchmarks multilingües publicados.
- Decodificación especulativa en producción: `draft-lite` (209 MiB) ofrece ×1,78 con KV q8_0 y ×2,30 con KV q5_1, una opción de bajo coste de memoria para acelerar el servicio sin el draft completo.

## Benchmarks y rendimiento

Métricas de cuantización publicadas por el autor (PPL de referencia BF16: 14,7611 según los deltas; KLD y RMS Δp frente a logits BF16):

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4172 | 14,9008 | +0,1397 | 0,0037 | 1,43% | 97,7% |
| Fidelity-48pc | 3767 | 14,8424 | +0,0813 | 0,0068 | 1,90% | 97,0% |
| Precision-42pc | 3356 | 14,9059 | +0,1448 | 0,0100 | 2,41% | 96,0% |
| Q6_K-imx (stock) | 3223 | 14,8915 | +0,1304 | 0,0148 | 2,97% | 95,2% |
| Quality-36pc | 2894 | 15,2836 | +0,5225 | 0,0263 | 4,04% | 93,4% |
| Q5_K_M-imx (stock) | 2840 | 15,9084 | +1,1473 | 0,0503 | 5,37% | 90,8% |
| Compact-33pc | 2660 | 14,8100 | +0,0489 | 0,0517 | 5,34% | 90,5% |
| Mini-30pc | 2424 | 15,1712 | +0,4101 | 0,0781 | 6,75% | 88,2% |
| IQ4_XS-imx (stock) | 2266 | 14,9378 | +0,1767 | 0,1194 | 8,06% | 84,9% |
| Nano-27pc | 2201 | 14,7133 | −0,0478 | 0,1240 | 8,25% | 85,1% |
| Pico-24pc | 1978 | 15,5452 | +0,7842 | 0,2228 | 11,63% | 79,5% |
| IQ3_M-imx (stock) | 1949 | 19,8316 | +5,0705 | 0,4549 | 16,95% | 72,0% |
| Femto-21pc | 1750 | 16,7988 | +2,0378 | 0,3624 | 14,58% | 74,4% |

Rendimiento de decodificación especulativa sobre Quality-36pc:

| Draft | Módulo | KV q8_0 | KV q5_1 |
|---|---:|---:|---:|
| official draft | 415 MiB | 106,3 t/s · ×1,92 | 98,6 t/s · ×2,30 |
| `draft-32K` | 453 MiB | 112,7 t/s · ×2,02 | 106,1 t/s · ×2,46 |
| `draft-lite` | 209 MiB | 98,7 t/s · ×1,78 | 98,2 t/s · ×2,30 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada según el tamaño del GGUF: Femto-21pc ~1,7 GB, Pico-24pc ~1,9 GB, Nano-27pc ~2,2 GB, Mini-30pc ~2,4 GB, Compact-33pc ~2,6 GB, Quality-36pc ~2,8 GB, Precision-42pc ~3,3 GB, Fidelity-48pc ~3,7 GB. Hay que sumar la caché KV y el draft si se usa decodificación especulativa.
- GPU de consumo: cualquier tarjeta con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) puede alojar los niveles Mini a Quality con margen para contexto y caché KV; los niveles Femto y Pico caben en GPUs de 4 GB.
- GPU profesionales: A100, H100 y RTX 4090 no son necesarias para el tamaño del modelo, pero permiten lotes grandes y mayor contexto.
- Despliegue: llama.cpp es el runtime de referencia (formato GGUF, tags `llama.cpp` e `imatrix`); también se declara compatibilidad con endpoints. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Throughput medido: 98,2-112,7 t/s en el escenario de decodificación especulativa sobre Quality-36pc, con variación según la cuantización de la caché KV (q8_0 frente a q5_1). No se especifica el hardware de la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.5-4B-Paretrix | 4,11B | no disponible | Apache 2.0 | GGUF | Niveles híbridos con métricas de fidelidad publicadas y drafts especulativos |
| Spark-X2.6-4B (base) | 4,11B | no disponible | no disponible en la información | transformers/safetensors | Modelo original sin cuantizar; referencia de PPL BF16 |
| Q5_K_M-imx stock | 4,11B | no disponible | Apache 2.0 (derivado) | GGUF | 2.840 MiB, ΔPPL +1,1473; Compact-33pc lo iguala en tamaño con ΔPPL +0,0489 |
| IQ4_XS-imx stock | 4,11B | no disponible | Apache 2.0 (derivado) | GGUF | 2.266 MiB, KLD 0,1194; Nano-27pc logra KLD 0,1240 con 65 MiB menos |

No se dispone de datos de otros modelos de 4B comparables (Qwen, Llama, Phi) en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks de tareas (razonamiento, código, matemáticas) publicados; las métricas disponibles miden fidelidad de cuantización, no calidad funcional.
- El soporte de tool calling y de flujos de agente solo se infiere de los tags; no está documentado con ejemplos ni evaluaciones.
- La longitud de contexto no se especifica; el nombre `draft-32K` no confirma la ventana real del modelo base.
- Solo se declaran inglés y chino; el rendimiento en castellano no está evaluado.
- Los niveles agresivos (Femto-21pc, Pico-24pc) muestran degradación notable: ΔPPL +2,04 y +0,78, KLD 0,36 y 0,22, top-p 74,4% y 79,5%. No son recomendables para producción sensible a la fidelidad.
- El dato de Nano-27pc con ΔPPL negativo (−0,0478) se marca con una daga en la model card; conviene tratarlo con cautela porque un valor inferior al de referencia puede indicar ruido de medición.
- Las cifras de throughput no indican el hardware empleado, por lo que no son directamente trasladables a otros entornos.
- Aunque la licencia es Apache 2.0, el modelo base y sus condiciones deben verificarse por separado antes de uso comercial.
- Riesgo de alucinación y sesgos del modelo base no documentados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Spark-X2.5-4B-Paretrix
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Draft DSpark oficial: https://huggingface.co/XHToken/Spark-X2.6-4B-DSpark-GGUF
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite

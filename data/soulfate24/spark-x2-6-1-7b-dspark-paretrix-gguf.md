# Soulfate24/Spark-X2.6-1.7B-DSpark-Paretrix-GGUF

## Resumen

Spark-X2.6-1.7B-DSpark-Paretrix-GGUF es una familia de cuantizaciones GGUF del modelo base XHToken/Spark-X2.6-1.7B, un transformer de 1.707.657.216 parámetros orientado a generación de texto y flujos de agente, publicado por Soulfate24 bajo licencia Apache 2.0. El paquete incluye, además del modelo objetivo cuantizado en varias "escalas" (rungs) de compromiso tamaño/calidad, tres borradores de decodificación especulativa (DSpark) que aceleran la inferencia entre un 40% y un 58% sobre el modelo objetivo.

La propuesta diferencial es la suite Paretrix Quantization Suite: en lugar de aplicar una única familia de cuantización uniforme a toda la red, mide la respuesta de cada clase de tensor a cada tipo de cuantización frente a los logits BF16 y planifica cada escala mediante una mochila exacta, seleccionando el punto de la frontera de Pareto con mejor retorno por bit invertido. El resultado son escalas con nombres como Fidelity-48pc, Quality-36pc, Nano-27pc o Femto-21pc, cada una con métricas de perplejidad, KLD y RMS Δp publicadas.

El modelo está pensado para despliegue en llama.cpp con soporte de decodificación especulativa DSpark (fork de XHToken), y resulta relevante ahora porque demuestra que en modelos pequeños (1.7B) el cuello de botella de la cabeza de vocabulario en los pases de borrador puede atacarse con tablas de readout reducidas (32K tokens cubren el 99,45% de la salida), logrando aceleraciones notables en GPUs de consumo como la RTX 4060 de 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 1.707.657.216 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | Hasta 131.072 tokens en el objetivo (la cabeza de vocabulario se evalúa sobre 131.072 tokens); ventana de borrador de 512 tokens |
| Tipos de cuantización | Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y escalas Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; borradores en Paretrix-Balanced y BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (transformers, llama.cpp); el borrador lite también en safetensors fp32 (dspark.safetensors) con dspark_config.json |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base XHToken/Spark-X2.6-1.7B más allá de su naturaleza transformer y su etiqueta de familia "sparkx2_5". Lo que sí está documentado con precisión es el proceso de cuantización y el módulo de decodificación especulativa. Paretrix parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo de cuantización y mide el resultado contra los logits BF16; con esas celdas de medida, una mochila exacta planifica cada escala y un duelo en el régimen de veredicto (contexto 4096, 24 sondas de razonamiento) decide si el plan sustituye al campeón. Cada modelo de la familia hereda las medidas del anterior.

El componente DSpark es un borrador de decodificación especulativa de 5 capas (bloque 7) que se distribuye en tres variantes. El borrador oficial (232 MiB) logra ×1,40 de aceleración. La variante draft-32K (259 MiB) reutiliza las mismas capas pero sustituye el readout sobre los 131.072 tokens de la cabeza del objetivo por una tabla propia (d2t) de 32.768 tokens que cubren el 99,45% de lo que escribe el modelo, alcanzando ×1,58. La variante draft-lite (143 MiB) poda el borrador oficial a 4 capas y FFN 1536 y se entrena sobre bloques no causales de 3 a 5 tokens, logrando ×1,55 con 116 MiB menos que draft-32K; en el banco de subagentes Paretrix (ventanas de 131K a 524K tokens, KV q5_1) duplica la velocidad de decodificación de toda la batería, de 47,6 a 98,9 t/s. Los pesos fp32 del borrador lite se publican en safetensors para continuar el entrenamiento o reexportar.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Orientación a flujos de agente (etiqueta agent) y razonamiento multi-paso, con soporte de "thinking probes" en la evaluación del borrador.
- Decodificación especulativa integrada mediante los tres borradores DSpark, con aceleración de ×1,40 a ×1,58 según variante.
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) y despliegue en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de baja latencia en GPUs de consumo: con la escala Precision-42pc (1399 MiB) y el borrador draft-lite, el modelo cabe en una RTX 4060 de 8 GB y decodifica a tasas que permiten interacción fluida en tiempo real.
- Procesamiento de documentos largos en inglés o chino: el objetivo admite contextos de hasta 131.072 tokens, adecuado para resumir contratos, informes o hilos de correo extensos en una sola pasada.
- Agentes con ventanas de contexto muy grandes: el banco Paretrix de subagentes (131K a 524K tokens con KV q5_1) muestra que el borrador lite duplica la velocidad de decodificación, lo que hace viables bucles de agente sobre corpus masivos.
- Despliegue en entornos con memoria restringida: las escalas Nano-27pc (915 MiB) y Femto-21pc (728 MiB) permiten ejecutar el modelo en hardware de gama baja manteniendo métricas de KLD documentadas (0,1961 y 0,5611 respectivamente).
- Servicio de generación de texto autohospedado: al ser Apache 2.0 y compatible con llama.cpp, puede integrarse en infraestructura propia sin coste de licencia, sirviendo endpoints compatibles.
- Investigación en cuantización: las escalas publicadas con PPL, ΔPPL, KLD, RMS Δp y top-p constituyen un banco de referencia para estudiar el compromiso tamaño/calidad en modelos de 1.7B.
- Aceleración de pipelines existentes: cualquier despliegue de Spark-X2.6-1.7B en llama.cpp puede añadir un borrador DSpark con `--spec-type draft-dspark` para reducir latencia sin cambiar el modelo objetivo.

## Benchmarks y rendimiento

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|---|
| Q8_0 (stock) | 1736 | 36,5458 | +0,3304 | 0,0063 | 1,87% | 95,8% | ★ |
| Fidelity-48pc | 1569 | 36,6322 | +0,4169 | 0,0170 | 2,85% | 93,4% | ★ |
| Precision-42pc | 1399 | 36,6095 | +0,3942 | 0,0247 | 3,53% | 91,5% | ★ |
| Q6_K-imx (stock) | 1341 | 36,0955† | −0,1199 | 0,0412 | 4,58% | 89,7% | ★ |
| Quality-36pc | 1202 | 35,2522† | −0,9632 | 0,0517 | 5,13% | 88,2% | ★ |
| Q5_K_M-imx (stock) | 1194 | 36,7500 | +0,5346 | 0,0840 | 6,11% | 86,0% | ★ |
| Compact-33pc | 1106 | 33,3808† | −2,8346 | 0,0984 | 6,83% | 83,8% | ★ |
| Mini-30pc | 1008 | 34,0220† | −2,1934 | 0,1352 | 7,74% | 81,4% | ★ |
| IQ4_XS-imx (stock) | 971 | 37,6937 | +1,4783 | 0,2728 | 11,24% | 74,9% | < Nano-27pc |
| Nano-27pc | 915 | 37,2969 | +1,0816 | 0,1961 | 9,38% | 77,7% | ★ |
| IQ3_M-imx (stock) | 848 | 53,1946 | +16,9793 | 0,5182 | 16,39% | 65,6% | < Pico-24pc |
| Pico-24pc | 821 | 45,7963 | +9,5810 | 0,3746 | 13,30% | 70,1% | ★ |
| Femto-21pc | 728 | 42,5738 | +6,3585 | 0,5611 | 16,23% | 64,4% | ★ |

Aceleración de los borradores DSpark (objetivo Precision-42pc, contexto 4096, KV f16, 24 sondas de razonamiento, RTX 4060 8 GB, `--spec-draft-n-max 5`):

| Fichero | Borrador | Módulo | Aceleración |
|---|---|---:|---:|
| dspark-Paretrix-Balanced.gguf | Oficial (5 capas, bloque 7) | 232 MiB | ×1,40 |
| draft-32K/dspark-32K-Paretrix-Balanced.gguf | Oficial con readout propio sobre 32K tokens | 259 MiB | ×1,58 |
| draft-lite/dspark-lite-Paretrix-Balanced.gguf | Oficial podado a 4 capas y FFN 1536, reentrenado | 143 MiB | ×1,55 |

En el banco de subagentes Paretrix (ventanas de 131K a 524K tokens, KV q5_1), el borrador draft-lite eleva la decodificación de 47,6 a 98,9 t/s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 728 MiB (Femto-21pc) hasta 1736 MiB (Q8_0) para los pesos; añadir la caché KV del contexto deseado (en f16 mientras quepa, o q8_0 en contextos largos).
- GPU validadas en la información proporcionada: RTX 4060 de 8 GB, suficiente para Precision-42pc más draft-lite con KV f16 a contexto 4096.
- Cabe en GPU de consumo: sí, todas las escalas desde Femto-21pc hasta Q8_0 caben en GPUs de 8 GB; las escalas mayores dejan margen para contexto largo.
- Opciones de despliegue: llama.cpp (requiere build con soporte Spark2.5 y DSpark, fork de XHToken); el paquete declara compatibilidad con endpoints; vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput: con draft-lite y KV q5_1 en ventanas de 131K a 524K tokens se alcanzan 98,9 t/s frente a 47,6 t/s sin borrador; la aceleración del borrador sobre el objetivo en el régimen de veredicto es de ×1,40 a ×1,58.
- Recomendación de caché: mantener la KV del objetivo en f16 mientras quepa, porque en caché cuantizada cada bloque verificado reconvierte toda la caché y el coste crece con el contexto; más allá, `-ctk q8_0 -ctv q8_0` sigue siendo rentable. La KV del borrador permanece en f16 (ventana de 512 tokens, pocos MiB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-1.7B-DSpark-Paretrix-GGUF | 1,707B | hasta 131.072 | Apache 2.0 | GGUF, safetensors (borrador) | Cuantización Pareto con borradores especulativos |
| XHToken/Spark-X2.6-1.7B (base) | 1,707B | no disponible | Apache 2.0 (según modelo derivado) | safetensors | Modelo de referencia sin cuantizar |
| XHToken/Spark-X2.6-1.7B-DSpark-GGUF | 1,707B | no disponible | Apache 2.0 (según modelo derivado) | GGUF | Borrador DSpark original |
| Alternativas de 1-2B de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Las métricas de calidad se publican solo como PPL, KLD y RMS Δp frente a BF16; no hay evaluaciones en tareas (MMLU, HumanEval, GSM8K), por lo que el impacto real de cada escala en razonamiento o código es desconocido.
- Las escalas agresivas muestran degradación severa: IQ3_M-imx sube la PPL a 53,19 (+16,98) y Femto-21pc a 42,57 (+6,36); no son adecuadas para producción sensible a la calidad.
- El borrador DSpark exige un build específico de llama.cpp (fork de XHToken con soporte Spark2.5 y DSpark); no funciona en compilaciones estándar ni en otros runtimes sin adaptación.
- La cuantización de la caché KV del objetivo introduce un coste creciente con el contexto (reconversión completa por bloque verificado); en ventanas muy largas conviene planificar memoria con cuidado.
- Riesgo de alucinación inherente a un modelo de 1.7B; no se documentan mitigaciones ni datos de entrenamiento que permitan estimar sesgos.
- La model card no detalla la composición del dataset de entrenamiento ni si hubo RLHF/DPO, lo que impide evaluar sesgos conocidos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha; es una publicación reciente sin validación comunitaria.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base XHToken/Spark-X2.6-1.7B antes de uso comercial.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Soulfate24/Spark-X2.6-1.7B-DSpark-Paretrix-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-1.7B
- Borrador DSpark original: https://huggingface.co/XHToken/Spark-X2.6-1.7B-DSpark-GGUF
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Script del generador DSpark: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite (referenciado como `16_dspark-generator.py`)
- llama.cpp: https://github.com/ggml-org/llama.cpp

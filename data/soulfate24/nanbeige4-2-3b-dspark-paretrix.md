# Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix

## Resumen

Nanbeige4.2-3B-DSpark-Paretrix es un conjunto de cuantizaciones GGUF del modelo base Nanbeige4.2-3B, publicado por el usuario Soulfate24 bajo el paraguas de su suite experimental Paretrix. No se trata de un modelo entrenado desde cero, sino de una reempaquetación cuantizada del checkpoint original de Nanbeige (4.169.800.704 parámetros según los safetensors del repo) junto con el módulo de decodificación especulativa DSpark, que actúa como draft model para acelerar la inferencia.

La propuesta técnica es una cuantización híbrida no uniforme: en lugar de aplicar un único ancho de bits a toda la red, Paretrix mide la respuesta de cada clase de tensor frente a los logits en BF16 y planifica cada nivel de cuantización mediante un problema de mochila exacto, seleccionando la asignación de tipos que maximiza la fidelidad para un presupuesto de tamaño dado. El resultado son ocho niveles propietarios (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc) que se comparan contra las cuantizaciones estándar de llama.cpp (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx).

Es relevante ahora porque demuestra una vía práctica de comprimir un modelo de ~4B parámetros hasta 1,7 GiB manteniendo una perplejidad razonable, y porque incluye el draft model DSpark para decodificación especulativa, lo que permite desplegar el conjunto en hardware de consumo. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la calidad de las cuantizaciones agresivas (por debajo de 27pc) degrada notablemente la fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Nanbeige4.2-3B); cuantización GGUF híbrida no uniforme con draft model DSpark para decodificación especulativa |
| Parametros totales | 4.169.800.704 (safetensors del repo) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx (stock) y niveles Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 47,6 GB con múltiples niveles); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es Nanbeige4.2-3B, un transformer decoder-only de aproximadamente 4,17 mil millones de parámetros. Sobre él se ha construido una capa de cuantización GGUF denominada Paretrix, que no reentrena pesos sino que planifica la asignación de tipos por clase de tensor. El método parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo disponible y mide la desviación frente a los logits en BF16; con esas celdas de medición resuelve una mochila exacta para cada nivel y decide mediante un duelo en el régimen de veredicto si el plan sustituye al campeón previo. La suite declara que lo medido en un modelo se hereda en el siguiente de la misma familia.

El repo incluye además el módulo DSpark, un draft model para decodificación especulativa que acelera la generación al proponer tokens que el modelo principal verifica en paralelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; la model card se centra exclusivamente en el proceso de cuantización y en las métricas de fidelidad (PPL, KLD, RMS Δp y top-p) de cada nivel.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados.
- Cuantización híbrida por clase de tensor con ocho niveles de compromiso tamaño/fidelidad.
- Decodificación especulativa mediante el draft model DSpark, pensada para reducir la latencia en llama.cpp.
- Compatibilidad con llama.cpp y el ecosistema GGUF (etiqueta `endpoints_compatible` en el repo).
- Integración con transformers para el checkpoint base (librería declarada).
- No se documentan capacidades de visión, audio, tool calling ni agentes en la información disponible.

## Casos de uso

- Despliegue en hardware de consumo: el nivel Femto-21pc ocupa 1769 MiB y permite ejecutar el modelo en GPUs con 4-6 GB de VRAM, útil para prototipos locales en portátiles con GPU discreta.
- Servicio de inferencia de bajo coste: el nivel Precision-42pc (3412 MiB) ofrece un equilibrio razonable entre tamaño y fidelidad (KLD 0.0344) para endpoints con presupuesto de memoria ajustado.
- Aceleración de latencia con DSpark: el draft model incluido permite decodificación especulativa en llama.cpp, reduciendo el tiempo por token en generación autoregresiva sobre CPU o GPU modesta.
- Evaluación comparativa de cuantizaciones: los ocho niveles Paretrix y las cinco stock permiten a un investigador medir el impacto de la cuantización no uniforme frente a la uniforme con las mismas métricas (PPL, KLD, top-p).
- Aplicaciones conversacionales en inglés y chino: el modelo base está orientado a diálogo, por lo que encaja en asistentes bilingües de ámbito acotado.
- Investigación en compresión de modelos: la metodología de mochila exacta por clase de tensor sirve como referencia reproducible para estudiar asignación óptima de bits.

## Benchmarks y rendimiento

Los datos publicados son métricas de fidelidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K no están disponibles).

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4229 | 31.6031 | +1.6930 | 0.0154 | 3.13% | 95.5% |
| Fidelity-48pc | 3822 | 31.5988 | +1.6887 | 0.0206 | 3.54% | 94.6% |
| Precision-42pc | 3412 | 31.9824 | +2.0723 | 0.0344 | 4.29% | 92.7% |
| Q6_K-imx (stock) | 3266 | 31.9481 | +2.0380 | 0.0451 | 4.86% | 92.1% |
| Quality-36pc | 2932 | 31.6147 | +1.7045 | 0.0577 | 5.58% | 90.1% |
| Q5_K_M-imx (stock) | 2849 | 32.1203 | +2.2101 | 0.0719 | 5.98% | 89.3% |
| Compact-33pc | 2697 | 32.3483 | +2.4381 | 0.1055 | 7.47% | 87.2% |
| Mini-30pc | 2458 | 32.1195 | +2.2094 | 0.1287 | 7.93% | 85.4% |
| IQ4_XS-imx (stock) | 2268 | 32.6725 | +2.7624 | 0.1971 | 9.76% | 82.2% |
| Nano-27pc | 2231 | 32.5803 | +2.6701 | 0.1849 | 9.54% | 82.5% |
| Pico-24pc | 2004 | 34.5682 | +4.6581 | 0.2969 | 12.01% | 76.8% |
| IQ3_M-imx (stock) | 1985 | 33.2823 | +3.3722 | 0.4923 | 15.06% | 71.5% |
| Femto-21pc | 1769 | 33.8955 | +3.9854 | 0.5085 | 15.42% | 68.6% |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde ~1,8 GB (Femto-21pc, 1769 MiB) hasta ~4,2 GB (Q8_0, 4229 MiB) solo para pesos; hay que sumar la caché KV, que depende del contexto y no está documentada.
- GPU recomendadas: cualquier GPU con al menos 6 GB (RTX 3060, RTX 4060) para los niveles Mini/Compact; 8 GB o más (RTX 3070, RTX 4060 Ti, RTX 4070) para Precision-42pc y Q8_0.
- Cabe en GPU de consumo: sí, todos los niveles caben en GPUs de 4-8 GB; los niveles más pequeños (Femto, Pico) caben incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y servidores compatibles con GGUF; el checkpoint base en transformers también es utilizable.
- Latencia y throughput: no disponibles; la decodificación especulativa con DSpark está pensada para mejorarlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-DSpark-Paretrix | 4,17B | no disponible | GGUF (8 niveles) | Apache 2.0 | Cuantización híbrida no uniforme + draft DSpark |
| Nanbeige4.2-3B (base) | ~4B | no disponible | safetensors | Apache 2.0 | Checkpoint original sin cuantizar |
| Q6_K-imx (stock llama.cpp) | 4,17B | no disponible | GGUF | Apache 2.0 | Referencia uniforme de 6 bits; 3266 MiB, KLD 0.0451 |
| IQ4_XS-imx (stock llama.cpp) | 4,17B | no disponible | GGUF | Apache 2.0 | Referencia uniforme de ~4 bits; 2268 MiB, KLD 0.1971 |

La comparación relevante es interna: frente a Q6_K-imx, el nivel Precision-42pc ocupa un 4,5% más de espacio (3412 vs 3266 MiB) pero reduce el KLD de 0.0451 a 0.0344; frente a IQ4_XS-imx, el nivel Nano-27pc ocupa un 1,6% menos (2231 vs 2268 MiB) y mejora el KLD de 0.1971 a 0.1849. No se dispone de comparación con otros modelos de la misma categoría fuera de la familia Nanbeige.

## Limitaciones y advertencias

- Solo se declaran inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Los niveles agresivos (Pico-24pc, Femto-21pc) presentan una degradación notable: PPL 34,57 y 33,90 frente a 31,60 del Q8_0, con KLD de 0,30 y 0,51 respectivamente.
- El nivel Femto-21pc tiene peor KLD (0.5085) que el IQ3_M-imx stock (0.4923) pese a ocupar menos espacio, lo que indica que la compresión agresiva no siempre domina al stock.
- Riesgo de alucinación inherente al modelo base; no hay evaluación de sesgos ni de seguridad en la información disponible.
- No se documentan la longitud de contexto ni el comportamiento del draft DSpark en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero la calidad de las cuantizaciones más pequeñas puede no ser adecuada para producción sin validación previa.
- El repo tiene 0 likes y 3803 descargas; es un artefacto de un autor individual, no una publicación oficial de Nanbeige, por lo que conviene verificar la integridad de los GGUF antes de desplegarlos.

## Enlaces

- [Hugging Face: Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix](https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix)
- [Modelo base: Nanbeige/Nanbeige4.2-3B](https://huggingface.co/Nanbeige/Nanbeige4.2-3B)
- [Draft model: Nanbeige/Nanbeige4.2-3B-DSpark](https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark)
- [Paretrix Quantization Suite](https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite)

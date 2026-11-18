# Soulfate24/NeoHorse-1-4B-Paretrix

## Resumen

NeoHorse-1-4B-Paretrix es una colección de cuantizaciones GGUF del modelo base TokenRhythm/NeoHorse-1-4B, un transformer de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) orientado a generación de texto, razonamiento, uso de herramientas y código. La publica el usuario Soulfate24 bajo licencia Apache 2.0 y aplica la suite Paretrix, un método de cuantización empírico y consciente de las activaciones que planifica cada nivel de compresión midiendo la respuesta de cada clase de tensor frente a los logits en BF16.

El interés de esta ficha no reside tanto en el modelo base como en el enfoque de cuantización: en lugar de aplicar una única familia de bits a toda la red, Paretrix mueve cada clase de tensor de forma aislada a cada tipo disponible, mide el impacto y resuelve una mochila exacta para asignar el presupuesto de bits donde mayor retorno ofrece. El repositorio incluye variantes que van desde Q8_0 (4275 MiB) hasta Femto-21pc (1792 MiB), además de una versión con MTP (multi-token prediction) pensada para decodificación especulativa.

El paquete ocupa 105 GB e incluye pesos en safetensors y GGUF, con etiquetas que declaran capacidades agénticas, tool-use, coding, reasoning, instruction-following y visión. La información pública disponible no detalla la arquitectura interna del modelo base, los datos de entrenamiento ni los idiomas soportados, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle interno no disponible); el modelo base es TokenRhythm/NeoHorse-1-4B |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Fidelity-48pc, Precision-42pc, Q6_K-imx, Quality-36pc, Q5_K_M-imx, Compact-33pc, Mini-30pc, IQ4_XS-imx, Nano-27pc, IQ3_M-imx, Pico-24pc, Femto-21pc |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base TokenRhythm/NeoHorse-1-4B: la model card del repositorio Paretrix solo describe el proceso de cuantización, no el preentrenamiento. Los tags indican un transformer de 4,2 mil millones de parámetros con capacidades de visión, razonamiento y tool-use, y la existencia de una variante MTP (multi-token prediction) sugiere que el modelo base incorpora cabezas de predicción multi-token para decodificación especulativa. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable es la propia suite Paretrix. El método parte de tres bases estándar (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor por separado a cada tipo de cuantización y mide la divergencia frente a los logits en BF16. Con esas mediciones, una mochila exacta planifica cada nivel y un duelo en el régimen de veredicto decide si el plan sustituye al campeón anterior. El resultado son niveles con nombres como Fidelity-48pc o Nano-27pc, donde el sufijo indica el porcentaje de parámetros o de presupuesto retenido según la planificación. La model card afirma que lo medido en un modelo se hereda al siguiente de la misma familia.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento (reasoning) e instruction-following, según los tags del repositorio.
- Generación de código (coding) y uso de herramientas (tool-use, function calling), con etiqueta agentic.
- Capacidades de visión declaradas en los tags, aunque no se detalla el soporte real ni el formato de entrada de imagen.
- Decodificación especulativa mediante la variante MTP, con configuración recomendada de caché KV en q5_1 y caché de borrador en q8_0.
- Compatibilidad con endpoints (tag endpoints_compatible) y despliegue en llama.cpp.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en hardware de consumo: las variantes Nano-27pc (2253 MiB) y Pico-24pc (2024 MiB) permiten ejecutar el modelo en GPU con 4-6 GB de VRAM mediante llama.cpp, útil para prototipos locales de asistentes conversacionales.
- Servidores de inferencia con requisitos de calidad alta: la variante Q8_0 (4275 MiB) o Fidelity-48pc (3866 MiB) ofrecen una perplejidad cercana al modelo en BF16 y son adecuadas para tareas de razonamiento donde la fidelidad de los logits importa.
- Agentes con tool calling: el modelo declara soporte de tool-use y agentic, por lo que puede integrarse en pipelines que invocan APIs externas o funciones locales dentro de un bucle de razonamiento multi-paso.
- Generación de código asistida: con la etiqueta coding, puede emplearse en entornos de autocompletado o revisión de parches, siempre que se valide la salida en un pipeline de CI/CD antes de aplicarla.
- Decodificación especulativa de bajo coste: la variante MTP con caché KV q5_1 y borrador q8_0 está pensada para maximizar la ventana de contexto con velocidad igual o superior cuando el contexto está muy cargado, lo que encaja en servicios de chat con historiales largos.
- Evaluación de técnicas de cuantización: el repositorio incluye métricas de PPL, KLD, RMS Δp y top-p por nivel, lo que lo convierte en un banco de pruebas para investigadores que comparan esquemas de cuantización híbrida frente a cuantización uniforme.
- Analítica de documentos con visión: si la capacidad de visión se confirma en el modelo base, podría usarse para extracción de información de imágenes o capturas, aunque la documentación no detalla este extremo.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de cuantización (perplejidad, divergencia KL y otras) medidas frente a los logits en BF16, no benchmarks de tareas estándar como MMLU o HumanEval.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 4275 | 9,1380 | +0,0113 | 0,0040 | 1,69 % | 98,3 % |
| Fidelity-48pc | 3866 | 9,1000† | −0,0268 | 0,0060 | 2,16 % | 97,7 % |
| Precision-42pc | 3420 | 9,1273 | +0,0005 | 0,0067 | 2,45 % | 96,9 % |
| Q6_K-imx (stock) | 3304 | 9,2051 | +0,0784 | 0,0094 | 2,67 % | 96,7 % |
| Quality-36pc | 2963 | 9,0521† | −0,0746 | 0,0164 | 3,43 % | 95,4 % |
| Q5_K_M-imx (stock) | 2933 | 9,3143 | +0,1876 | 0,0186 | 3,55 % | 95,3 % |
| Compact-33pc | 2723 | 9,0841† | −0,0426 | 0,0248 | 4,33 % | 93,9 % |
| Mini-30pc | 2482 | 9,2179 | +0,0912 | 0,0391 | 5,19 % | 91,8 % |
| IQ4_XS-imx (stock) | 2398 | 9,5118 | +0,3851 | 0,0600 | 6,45 % | 90,6 % |
| Nano-27pc | 2253 | 9,3656 | +0,2389 | 0,0566 | 6,30 % | 90,4 % |
| IQ3_M-imx (stock) | 2063 | 9,9111 | +0,7844 | 0,1472 | 10,57 % | 84,8 % |
| Pico-24pc | 2024 | 9,2834 | +0,1567 | 0,0988 | 8,17 % | 86,9 % |
| Femto-21pc | 1792 | 9,7270 | +0,6003 | 0,1608 | 11,08 % | 83,1 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre unos 2 GB (Femto-21pc, 1792 MiB) y unos 4,2 GB (Q8_0, 4275 MiB) solo para los pesos, más el espacio de la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: para las variantes de mayor fidelidad, una RTX 4090 (24 GB) o una A100/H100 permiten contextos largos y mayor paralelismo; para las variantes Nano y Pico, una RTX 3060 de 12 GB o incluso GPU con 6-8 GB son suficientes.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPU consumer de 8 GB o más; las de 4-6 GB de VRAM pueden alojar Nano-27pc y Pico-24pc con contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo de los GGUF), Ollama si se importa el GGUF, y servidores compatibles con endpoints según el tag endpoints_compatible. La librería declarada es transformers, pero los pesos cuantizados están pensados para llama.cpp.
- Latencia y throughput: no disponibles. La model card solo indica que la configuración MTP con caché KV q5_1 y borrador q8_0 ofrece velocidad igual o mejor cuando el contexto está muy cargado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B-Paretrix | 4,2 B | no disponible | GGUF híbrida (13 niveles) | Apache 2.0 | Hugging Face |
| Modelo base NeoHorse-1-4B | 4,2 B | no disponible | safetensors/BF16 | no disponible | Hugging Face |
| Cuantizaciones GGUF estándar (Q8_0, Q6_K, Q5_K_M, IQ4_XS, IQ3_M) | 4,2 B | no disponible | GGUF uniforme | Apache 2.0 | Hugging Face |

La comparación relevante es frente a las cuantizaciones estándar del mismo modelo base: en la tabla de la model card, Quality-36pc (2963 MiB) se sitúa en calidad cercana a Q5_K_M-imx (2933 MiB) con un tamaño similar, y Nano-27pc (2253 MiB) se compara con IQ4_XS-imx (2398 MiB) ocupando menos espacio. No se dispone de comparativas frente a modelos de otros autores de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo derivado de un base no descrito, los sesgos del preentrenamiento se heredan sin evaluación publicada.
- Riesgo de alucinación: no cuantificado; las métricas del repositorio miden fidelidad de logits frente a BF16, no veracidad factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados, lo que impide garantizar un comportamiento multilingüe o ventanas largas en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base TokenRhythm/NeoHorse-1-4B, que no se detalla en la información proporcionada.
- Caveat de cuantización: los niveles por debajo de Nano-27pc muestran degradación notable (Femto-21pc alcanza KLD 0,1608 y RMS Δp 11,08 %), por lo que no son adecuados para tareas sensibles a la fidelidad.
- La variante MTP debe ejecutarse sin un modelo borrador DFlash o DSpark simultáneo, según la model card; ignorar esta indicación puede degradar el rendimiento.
- El repositorio ocupa 105 GB, lo que exige planificar el almacenamiento antes de descargar todas las variantes.
- No hay benchmarks de tareas publicados, por lo que las afirmaciones de capacidad agéntica, coding o visión no están respaldadas por métricas verificables en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/NeoHorse-1-4B-Paretrix
- Modelo base: https://huggingface.co/TokenRhythm/NeoHorse-1-4B
- Suite de cuantización Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite

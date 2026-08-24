# wsber123/deberta-v3-base-binary

## Resumen

`wsber123/deberta-v3-base-binary`, designado como **Proxy4_base** en el PROXY Model Zoo, es un modelo de clasificación de texto binario (NLI / detección de postura) obtenido mediante fine-tuning de [`microsoft/deberta-v3-base`](https://huggingface.co/microsoft/deberta-v3-base), un encoder transformer de 184 millones de parámetros desarrollado por Microsoft. El autor, wsber123, lo ha entrenado para un propósito muy concreto: evaluar si un texto (premisa) es contradictorio o implica la hipótesis fija *"The topic is about supporting Donald Trump"* (el tema trata sobre el apoyo a Donald Trump).

El modelo no es un asistente generalista ni un generador de texto; es un componente de investigación diseñado para el framework PROXY (*Proxy-Guided Sampling for Approximate Graph Aggregation with ML Predicates*), donde actúa como proxy ligero de inferencia sobre datos de redes sociales (concretamente Parler) para sustituir a modelos "oráculo" de gran tamaño en tareas de agregación aproximada y muestreo estratificado. Su relevancia radica en que permite estudiar la sensibilidad de algoritmos de agregación ante proxies de distinta calidad, alineándose con el Oracle2 (deberta-v2-xxlarge-mnli) con un F1 de 0.7716 y ofreciendo un speedup de hasta 42.5x en throughput.

La arquitectura es DeBERTa-v3-base, con 12 capas, 768 de hidden size y vocabulario de 128k tokens. El contexto máximo de entrada no se especifica en la documentación, aunque el código de inferencia proporcionado usa un `max_length` de 256 tokens. El repositorio ocupa 1.5 GB en formato safetensors y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (encoder transformer con atención disentangled y pre-entrenamiento ELECTRA-style) |
| Parametros totales | 184.423.682 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (código de ejemplo usa 256 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura DeBERTa-v3, que introduce dos innovaciones clave respecto a DeBERTa-v2: atención disentangled (que modela las relaciones entre posiciones y contenido de forma separada) y un pre-entrenamiento estilo ELECTRA con *replaced token detection* (RTD) que comparte los embeddings de forma que el gradiente no se propaga a la capa de embeddings (gradient-disentangled embedding sharing). El backbone tiene 86M de parámetros (12 capas, hidden size 768) más 98M de parámetros de embeddings (vocabulario de 128k tokens), totalizando 184M.

El fine-tuning se realizó sobre el checkpoint pre-entrenado `microsoft/deberta-v3-base` para la tarea de clasificación de secuencias binaria (contradicción 0 vs. entailment 1) con una hipótesis fija sobre apoyo a Donald Trump. El conjunto de datos de entrenamiento proviene de muestras específicas de Parler (`post.csv`), y el objetivo era lograr un nivel intermedio de alineación con los oráculos (F1 ≈ 0.7716 vs. Oracle2) para cubrir un rango de calidad de proxy (F1 ∈ [0.65, 0.89]) en experimentos de ablación de degradación (RQ3 del paper). No se detalla el número de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Clasificación de texto binaria: evalúa si una premisa (texto) es entailment (1) o contradiction (0) respecto a la hipótesis fija "El tema trata sobre apoyar a Donald Trump".
- Detección de postura (stance detection) sobre discurso político en redes sociales, específicamente contenido de Parler.
- Inferencia de alta velocidad: el autor reporta un throughput de 32 × (17~30) items/s en una RTX 3090 con batch size 32 y FP16, lo que supone un speedup de hasta 42.5x frente al oráculo de 1.5B.
- Salida de probabilidad de entailment (columna `ML1_proxy4b_probability`) útil para tareas de muestreo y agregación aproximada.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modos de razonamiento extendido.

## Casos de uso

- **Investigación académica sobre agregación de grafos**: el modelo se usa como proxy en el framework PROXY para aproximar la inferencia de oráculos de gran tamaño (DeBERTa-v2-xlarge/xxlarge) en grafos de redes sociales, permitiendo estudiar el impacto de la calidad del proxy en algoritmos de muestreo estratificado y poda de candidatos.
- **Ablación de calidad de proxy (RQ3)**: sirve como punto de referencia intermedio (F1 ≈ 0.77) en un espectro de proxies degradados, permitiendo a los investigadores medir la sensibilidad de sus algoritmos ante errores de predicción y ruido.
- **Análisis de postura política en redes sociales**: dado un texto de Parler, el modelo produce una probabilidad de que el texto apoye a Donald Trump, útil para estudios de polarización o monitoreo de discurso.
- **Moderación de contenido asistida**: como clasificador de postura binario, puede prefiltrar mensajes que se alineen con una postura concreta antes de pasar a modelos más grandes y costosos.
- **Pipeline de inferencia de alto rendimiento**: al ser un encoder de 184M, cabe en GPUs de consumo y permite procesar grandes volúmenes de texto (p.ej. millones de posts) en minutos, con throughput de cientos de items/s.
- **Investigación sobre alineación de modelos**: permite estudiar cómo proxies de distinta calidad afectan a la precisión de agregaciones de grafos, un tema clave en sistemas de análisis de datos a gran escala.

## Benchmarks y rendimiento

El autor reporta métricas de alineación contra dos oráculos de referencia, medidas en una NVIDIA GeForce RTX 3090 con batch size 32 y FP16:

| Oráculo de referencia | Parámetros del oráculo | Max F1 | Max Precision / Recall | Max Recall / Precision | Throughput del proxy |
|---|---|---|---|---|---|
| Oracle1 (`deberta-v2-xlarge-mnli`) | 0.9B | 0.8512 | 0.9445 / 0.6227 | 0.9733 / 0.4639 | 32 × (17~30) items/s |
| Oracle2 (`deberta-v2-xxlarge-mnli`) | 1.5B | 0.7716 | 0.9253 / 0.7004 | 0.9617 / 0.5432 | 32 × (17~30) items/s |

Se reporta un speedup de hasta 42.5× en throughput respecto al oráculo de 1.5B manteniendo un F1 de 0.7716. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, dado que el modelo no está diseñado para tareas de razonamiento general.

## Requisitos de hardware

- **VRAM estimada**: con FP16 y batch size 32, el modelo cabe en una GPU con 24 GB de VRAM (RTX 3090). Con cuantización de 8 bits o 4 bits (no publicada), cabría en GPUs de 8-12 GB.
- **GPU recomendadas**: RTX 3090 (usada en los benchmarks), RTX 4090, A100 (40/80 GB), H100. Para inferencia en CPU, el modelo es utilizable pero con menor throughput.
- **Cabe en consumer GPU**: sí, en GPUs de consumo como RTX 3090/4090 con FP16. También puede ejecutarse en RTX 3060/4070 con cuantización (no disponible) o con batch size reducido.
- **Opciones de despliegue**: se puede usar con la biblioteca `transformers` (carga directa con `AutoModelForSequenceClassification`), y también es compatible con `vLLM` o `TGI` para servir endpoints de clasificación de texto (aunque no está optimizado para ello). Para CPU, `llama.cpp` no es aplicable (es un encoder, no un modelo causal).
- **Latencia y throughput**: en RTX 3090, con batch size 32 y FP16, el throughput es de 32 × (17~30) items/s (es decir, entre 544 y 960 items/s por segundo). La latencia por batch no se reporta, pero es inferior a 1 segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tarea | F1 vs Oracle2 |
|---|---|---|---|---|---|
| `wsber123/deberta-v3-base-binary` (Proxy4) | 184M | 512 (config) | Apache-2.0 | NLI binario (entailment/contradiction) | 0.7716 |
| `microsoft/deberta-v2-xlarge-mnli` (Oracle1) | 0.9B | 512 | MIT | NLI (multi-clase) | 0.8512 (vs Oracle2) |
| `microsoft/deberta-v2-xxlarge-mnli` (Oracle2) | 1.5B | 512 | MIT | NLI (multi-clase) | — (referencia) |

La comparativa muestra que el modelo es un proxy ligero frente a los oráculos de 0.9B y 1.5B de Microsoft, que son modelos NLI multilingües (aunque entrenados principalmente en inglés) con licencia MIT. El modelo de wsber123 es una versión fine-tuned de DeBERTa-v3-base para una única hipótesis, lo que le permite ser más rápido pero menos general.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo evalúa una hipótesis fija sobre Donald Trump; no es un clasificador NLI general ni puede usarse para otras posturas o dominios.
- **Sesgo de datos**: entrenado sobre textos de Parler, una plataforma con sesgos políticos conocidos; puede reflejar el sesgo del corpus y no generalizar a otras plataformas.
- **Riesgo de alucinación**: como clasificador binario, no genera texto, pero puede producir falsos positivos o negativos en la detección de postura; la precisión máxima es de ~0.94 pero la recall es baja (0.62-0.70) según la configuración.
- **Contexto limitado**: la ventana de entrada está limitada a 512 tokens (configuración del código de ejemplo); textos más largos se truncarán, perdiendo información.
- **Licencia**: aunque la metadata indica Apache-2.0, la model card del autor indica MIT; se recomienda verificar la licencia exacta antes de uso comercial.
- **Uso comercial**: no hay restricciones explícitas para uso comercial con Apache-2.0/MIT, pero el modelo está pensado para investigación académica y no tiene garantías de producción.
- **Sin soporte de cuantización**: no se proporcionan pesos GGUF ni cuantizados; la inferencia requiere FP32/FP16 y bibliotecas de transformers.
- **Reproducibilidad**: no se publican detalles del dataset de entrenamiento ni de los hiperparámetros, lo que limita la reproducción exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wsber123/deberta-v3-base-binary
- Modelo base original: https://huggingface.co/microsoft/deberta-v3-base
- Repositorio de DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Paper de DeBERTa-v3 (arXiv:2111.09543): https://arxiv.org/abs/2111.09543
- Análisis de DeBERTa-v3-base en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/deberta-v3-base-microsoft

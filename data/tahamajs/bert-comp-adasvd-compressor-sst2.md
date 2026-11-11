# tahamajs/bert-comp-adasvd-compressor-sst2

## Resumen

`tahamajs/bert-comp-adasvd-compressor-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, una librería de compresión de modelos neuronales que incluye un zoo de checkpoints comprimidos con distintos operadores. El modelo resuelve el problema clásico de reducir huella de parámetros de un transformer manteniendo la precisión downstream, mediante descomposición SVD adaptativa y, si hace falta, reparación con LoRA.

El checkpoint empaquetado corresponde al rango `k=32` del compresor `adasvd_compressor` (`AdaSVDCompressor`), que aplica SVD adaptativa con blanqueado de activaciones, ALS ponderado a ambos lados y absorción de sesgo por desplazamiento de media. Parte de los 109.483.778 parámetros del BERT-Base original y los reduce a 102.401.663 (−6,47 %, ratio físico 1,069x). La precisión declarada en validación de SST-2 es 88,88 %, frente al 91,63 % del modelo profesor, una paridad de −2,75 puntos.

Es relevante ahora porque forma parte de una evaluación multi-rango (k=256, 128, 64, 32) que documenta el compromiso entre ratio de compresión y precisión, e introduce una política de "curación" con LoRA cuando la caída supera el 2 % con ratios por encima de 1,10x. El repositorio es pequeño (0,2 GB), la licencia es MIT y el uso está orientado a experimentación con técnicas de compresión, no a producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base (12 capas, dimensión oculta D=768), comprimido con AdaSVD (SVD adaptativa) |
| Parámetros totales | 102.401.663 (checkpoint comprimido); modelo base original 109.483.778 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base BERT-Base soporta hasta 512 tokens) |
| Tipos de cuantización | no disponible; el artefacto se distribuye como `pytorch_model.bin` con factores de bajo rango y buffers internos |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); tokenizer en `vocab.txt`, `tokenizer.json`, `tokenizer_config.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT-Base uncased: 12 capas de transformer encoder, 768 dimensiones ocultas, aproximadamente 109,5 millones de parámetros, preentrenado por Google y afinado aquí sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese modelo, NeuralOps aplica `AdaSVDCompressor`, un operador de compresión que combina tres técnicas: SVD adaptativa con blanqueado de activaciones (para preservar las direcciones de mayor energía en el espacio de activaciones, no solo en el de pesos), ALS ponderado bilateral (two-sided weighted ALS) para refinar los factores de bajo rango, y absorción de sesgo mediante desplazamiento de media (mean-shift bias absorption).

El proceso de compresión se evalúa físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). La política del zoo indica que, cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, se aplica una curación LoRA dirigida con `r=8`, 50 pasos, `lr=2e-4` y un presupuesto de 45 segundos. En el rango empaquetado (`k=32`) no se aplicó LoRA (`LoRA Recovery Applied: False`), porque la caída zero-shot (88,88 %) ya quedaba dentro del margen aceptable. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación de texto binaria de sentimiento (positivo/negativo) sobre entradas en inglés, específicamente afinada para SST-2.
- Inferencia estándar de BERT-Base: representaciones contextuales de hasta 512 tokens (límite del modelo base; no confirmado en la ficha del checkpoint).
- Reconstrucción programática del topology comprimido mediante `compress_model` de NeuralOps y carga del state dict con `strict=False`.
- Compatibilidad con el ecosistema Hugging Face (`AutoTokenizer`, `BertForSequenceClassification`).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito (thinking mode): es un clasificador de sentimiento.
- Capacidad multilingüe limitada al inglés (`en`).
- Sirve como referencia reproducible para estudiar el efecto de AdaSVD en precisión downstream, no como modelo generativo.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el checkpoint clasifica polaridad positiva/negativa con 88,88 % de accuracy en SST-2, suficiente para monitorización agregada de opiniones a bajo coste computacional.
- Moderación de comentarios y filtrado de toxicidad indirecta: como clasificador binario rápido, puede prefiltrar grandes volúmenes de texto en inglés antes de pasar a modelos más caros.
- Investigación en compresión de modelos: el repositorio incluye `compression_summary.json` con telemetría de los rangos k=256, 128, 64 y 32, útil para reproducir experimentos de SVD adaptativa y comparar políticas de curación LoRA.
- Enseñanza y demostración de pipelines de compresión: el script de Quick Start muestra cómo reconstruir el topology comprimido y cargar pesos con `strict=False`, adecuado para talleres sobre eficiencia de transformers.
- Baseline ligero en pipelines de CI para NLP: al ocupar 0,2 GB y requerir poca VRAM, puede integrarse como test de regresión de sentimiento en entornos con recursos limitados.
- Evaluación de técnicas de reparación con LoRA: los rangos k=256, 128 y 64 documentan caídas de precisión y recuperaciones con LoRA (r=8, 50 pasos), lo que permite estudiar cuándo merece la pena curar frente a aceptar la pérdida zero-shot.
- Clasificación de feedback de usuarios en inglés dentro de aplicaciones internas: con licencia MIT y huella reducida, es desplegable en CPUs o GPUs consumer para tareas de etiquetado por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre GLUE SST-2, split de validación (872 muestras), evaluados en RTX 3090.

| Modelo / rango | Ratio físico | Parámetros (reducción) | Accuracy zero-shot | Accuracy curada (LoRA) | Paridad vs profesor (91,63 %) |
|---|---:|---:|---:|---:|---:|
| BERT-Base profesor (SST-2) | 1,00x | 109.483.778 | 91,63 % | — | 0,00 % |
| AdaSVD k=256 | 1,11x | 98.978.371 (−9,6 %) | 88,99 % | 82,68 % (LoRA) | −8,95 % |
| AdaSVD k=128 | 1,22x | 90.074.530 (−17,7 %) | 86,70 % | 84,06 % (LoRA) | −7,57 % |
| AdaSVD k=64 | 1,27x | 86.120.982 (−21,3 %) | 81,31 % | 83,03 % (LoRA) | −8,60 % |
| AdaSVD k=32 (empaquetado) | 1,07x | 102.401.663 (−6,5 %) | 88,88 % | 88,88 % | −2,75 % |

El checkpoint publicado corresponde a k=32: 88,88 % de accuracy en validación SST-2, sin curación LoRA aplicada. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 195,4 MB en `pytorch_model.bin`; en FP32 ocupa aproximadamente 0,4 GB de VRAM más activaciones, por lo que cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM efectiva (GTX 1050 Ti, RTX 3060, RTX 4090, A100, H100); el autor reporta evaluación en RTX 3090 (24 GB).
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: PyTorch + Transformers con el topology reconstruido vía NeuralOps (`compress_model`); no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El proceso de curación LoRA reportado usa 50 pasos con presupuesto de 45 segundos, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| `tahamajs/bert-comp-adasvd-compressor-sst2` (k=32) | 102,4 M | no disponible | 88,88 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, SST-2) | 109,5 M | 512 tokens | 91,63 % | Apache 2.0 (modelo base) | Hugging Face |
| Versiones comprimidas del mismo zoo (k=64, 128, 256) | 86,1–99,0 M | no disponible | 81,31–88,99 % (zero-shot) | MIT | Hugging Face |
| Otros clasificadores SST-2 tipo DistilBERT | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con DistilBERT u otros modelos comprimidos de BERT no está documentada en la información proporcionada; los términos de comparación disponibles se limitan al profesor y a los demás rangos del propio zoo.

## Limitaciones y advertencias

- Especialización estrecha: solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni un asistente.
- Caída de precisión respecto al profesor: −2,75 puntos en SST-2 (88,88 % frente a 91,63 %), y los rangos con mayor compresión pierden entre 5 y 10 puntos.
- Resultados no verificados: la accuracy 88,88 % está marcada como `verified: false` en el model-index; conviene reproducirla antes de usarla en producción.
- La curación LoRA puede empeorar el resultado en algunos rangos (k=256 pasa de 88,99 % zero-shot a 82,68 % curado), lo que indica fragilidad de la política de reparación.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2 (por ejemplo, sentimiento en jerga, sarcasmo o dominios muy específicos).
- Sesgos: no se documentan análisis de sesgo; al derivar de BERT-Base uncased, hereda sesgos del corpus de preentrenamiento original.
- Limitaciones de idioma: solo inglés (`en`); el tokenizer `bert-base-uncased` no está pensado para castellano ni otros idiomas.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `google-bert/bert-base-uncased` tiene sus propios términos (Apache 2.0); conviene revisar ambas licencias en producción.
- Dependencia de la librería NeuralOps: la carga requiere reconstruir el topology con `compress_model` y usar `strict=False`, lo que añade complejidad operativa frente a un checkpoint estándar de Transformers.
- Fecha de creación futura (2026-11-10) y cero descargas/likes: metadatos atípicos que sugieren un artefacto experimental; validar integridad antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-adasvd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/adasvd_compressor.py
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

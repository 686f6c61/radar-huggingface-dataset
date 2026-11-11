# tahamajs/bert-comp-dynamic-rank-sst2

## Resumen

`tahamajs/bert-comp-dynamic-rank-sst2` es un checkpoint comprimido de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2, generado con la técnica `dynamic_rank` (familia `dynamic_entropy_svd_factory`) de la librería NeuralOps, desarrollada por Taha Majlesi. El modelo parte del BERT-Base original (109.483.778 parámetros, 12 capas, dimensión oculta 768) y aplica una descomposición SVD de rango dinámico seguida de un "healing" con adaptadores LoRA para recuperar parte de la precisión perdida por la compresión.

El checkpoint empaquetado en este repositorio corresponde al rango `k=128`, con 45.782.786 parámetros tras la compresión (reducción del 58,18 %, ratio físico de 2,39x). La precisión declarada en la partición de validación de SST-2 es del 73,62 %, frente al 91,63 % del modelo profesor sin comprimir, lo que supone una brecha de 18,01 puntos porcentuales.

El interés del modelo es fundamentalmente metodológico: forma parte de un zoo de compresión que documenta el compromiso entre ratio de compresión y precisión en varios rangos (k=256, 128, 64 y 32), con telemetría completa en `compression_summary.json`. No es un modelo pensado para producción en clasificación de sentimiento de alta exigencia, sino una pieza de referencia para investigar técnicas de compresión SVD con recuperación LoRA sobre transformers pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), comprimido mediante SVD de rango dinámico (`dynamic_entropy_svd_factory`) |
| Parámetros totales | 45.782.786 tras compresión (modelo base original: 109.483.778) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite 512 tokens, pero la model card no lo declara explícitamente) |
| Tipos de cuantización | no disponible (el artefacto se distribuye en `pytorch_model.bin` con factores de bajo rango y adaptadores LoRA integrados; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, preentrenado por Google y afinado sobre GLUE SST-2. Sobre ese modelo, NeuralOps aplica una compresión SVD con selección dinámica de rango basada en entropía (`dynamic_entropy_svd_factory`), que descompone las matrices de pesos en factores de bajo rango y selecciona el rango `k` de forma adaptativa por capa. El resultado es un checkpoint físicamente más pequeño (45,78 M de parámetros, ratio 2,39x) que conserva la topología reconstruible mediante la API `compress_model` de NeuralOps.

Cuando la compresión en zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, el pipeline activa un "healing" con adaptadores LoRA de rango `r=8`, entrenados durante 50 pasos con `lr=2e-4` y un presupuesto de 45 segundos. En el rango `k=128`, este healing eleva la precisión del 52,41 % (zero-shot) al 73,62 %. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. No se documentan detalles sobre el dataset de preentrenamiento original ni sobre el proceso de afinado inicial de SST-2 más allá de la referencia a GLUE.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con dos etiquetas de salida.
- Inferencia de texto corto a moderado propio de tareas de clasificación de frases (SST-2 usa reseñas de películas).
- Reconstrucción programática del modelo comprimido mediante la API `compress_model` de NeuralOps y carga del state dict con `strict=False`.
- Compatibilidad con la librería `transformers` para tokenización e inferencia (`BertForSequenceClassification`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- Capacidades multilingües: limitadas al inglés (tokenizer `bert-base-uncased`, vocabulario en inglés).
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.

## Casos de uso

- **Investigación en compresión de modelos**: servir como referencia reproducible para comparar la técnica `dynamic_rank` frente a otras estrategias de compresión SVD sobre BERT-Base, con telemetría multi-rango ya publicada en `compression_summary.json`.
- **Prototipado de análisis de sentimiento de bajo coste**: clasificar reseñas o comentarios en inglés en entornos con restricciones de memoria, aprovechando el menor tamaño del checkpoint (45,78 M de parámetros) frente al BERT-Base original.
- **Docencia y experimentación con LoRA**: ilustrar el flujo completo de compresión SVD más healing con adaptadores de rango 8, con hiperparámetros concretos (50 pasos, `lr=2e-4`) documentados en la model card.
- **Evaluación de pipelines de compresión en CI**: integrar `compress_model` y la carga del state dict en pruebas automatizadas que verifiquen la reconstrucción correcta del grafo comprimido antes de desplegar variantes más grandes.
- **Benchmarking de hardware en GPUs de consumo**: usar el modelo como carga ligera para medir latencia y throughput en tarjetas como la RTX 3090, dado que la model card documenta la evaluación en ese hardware.
- **Filtrado preliminar de sentimiento en corpus en inglés**: aplicar el clasificador como primera etapa de triaje en pipelines de datos donde la precisión del 73,62 % sea suficiente y el ahorro de memoria sea prioritario.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Precisión zero-shot | Precisión con LoRA | Brecha vs profesor (91,63 %) |
|---|---|---|---|---|---|
| 256 | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 73,62 % | -18,01 pp |
| 128 (empaquetado) | 2,39x | 45.782.786 (-58,2 %) | 52,41 % | 73,62 % | -18,01 pp |
| 64 | 3,08x | 35.500.034 (-67,6 %) | 51,15 % | 50,92 % | -40,71 pp |
| 32 | 3,65x | 30.023.426 (-72,6 %) | 50,11 % | 61,70 % | -29,93 pp |

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras) en una NVIDIA GeForce RTX 3090 (24 GB). El modelo profesor (`bert-base-uncased` afinado en SST-2) alcanza 91,63 % de precisión según la model card.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 45,78 M de parámetros en precisión completa (fp32) el checkpoint ocupa aproximadamente 183 MB, y el repositorio completo pesa 0,1 GB, por lo que cabe holgadamente en cualquier GPU de consumo.
- **GPU recomendadas**: la model card documenta evaluación en NVIDIA GeForce RTX 3090 (24 GB); cualquier GPU con al menos 1 GB de VRAM libre debería ser suficiente para inferencia en fp32.
- **GPU de consumo**: sí, cabe en tarjetas de gama baja y media (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para lotes pequeños.
- **Opciones de despliegue**: `transformers` con `BertForSequenceClassification` más la API `compress_model` de NeuralOps para reconstruir la topología; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-dynamic-rank-sst2` | 45,78 M (comprimido) | no disponible | 73,62 % (validación) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor afinado) | 109,48 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 109,48 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con el checkpoint de TextAttack se ofrece como referencia de categoría (clasificadores SST-2 en inglés); no se dispone de sus métricas en la información proporcionada, por lo que no se comparan numéricamente.

## Limitaciones y advertencias

- **Brecha de precisión notable**: 73,62 % frente al 91,63 % del profesor, una pérdida de 18,01 puntos porcentuales que lo aleja de un uso en producción sensible a la calidad.
- **Resultados no verificados**: la métrica de la model card está marcada con `verified: false`; conviene reproducirla antes de tomar decisiones.
- **Idioma**: solo inglés; el tokenizer `bert-base-uncased` no cubre otros idiomas de forma fiable.
- **Tarea única**: clasificación binaria de sentimiento; no sirve para generación, razonamiento, código ni tool calling.
- **Dependencia de NeuralOps**: la reconstrucción del modelo requiere la API `compress_model` y la topología específica de la librería; no es un checkpoint cargable directamente con `from_pretrained` estándar sin ese paso.
- **Riesgo de sesgos**: hereda los sesgos del corpus de preentrenamiento de BERT-Base y del dataset SST-2 (reseñas de películas en inglés), sin que la model card documente mitigaciones.
- **Riesgo de alucinación**: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas o sobreconfiadas en dominios alejados de SST-2.
- **Licencia**: MIT, permite uso comercial; el modelo base `bert-base-uncased` está bajo Apache 2.0, por lo que conviene revisar ambas licencias en despliegues comerciales.
- **Escasa adopción**: 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-comp-dynamic-rank-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/dynamic_rank.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/nyu-mll/glue

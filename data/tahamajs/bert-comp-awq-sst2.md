# tahamajs/bert-comp-awq-sst2

## Resumen

`tahamajs/bert-comp-awq-sst2` es un checkpoint de `google-bert/bert-base-uncased` afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente procesado con el compresor AWQ de la librería NeuralOps. Lo publica Taha Majlesi (usuario `tahamajs`) como parte de un zoo de modelos comprimidos orientado a evaluar técnicas de cuantización y recuperación con LoRA. El modelo resuelve una tarea acotada: clasificación binaria de sentimiento (positivo/negativo) en inglés, con 109.483.778 parámetros y arquitectura BERT base de 12 capas y dimensión oculta 768.

El interés del artefacto no está en el modelo en sí, sino en la metodología que documenta: una evaluación multi-rango (k=256, 128, 64, 32) sobre la partición de validación de SST-2 (872 muestras) ejecutada en una RTX 3090, con protocolo de "LoRA healing" cuando la compresión degrada más de 2 puntos porcentuales. En este checkpoint concreto, el autor declara un ratio de compresión físico de 1.00x (0 % de reducción de parámetros) y una precisión del 92,09 %, frente al 91,63 % del modelo profesor.

Es relevante ahora como referencia reproducible para quien investigue pipelines de compresión de modelos pequeños: ilustra el caso límite en el que la cuantización AWQ, tal como está configurada, no reduce el número de parámetros serializados, y sirve para comparar contra otras técnicas (poda estructurada, destilación, GPTQ) en tareas de clasificación de texto con presupuesto de latencia bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, dimensión oculta 768) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (BERT base estándar: 512 tokens) |
| Tipos de cuantizacion | AWQ (`AWQCompressor`, familia quantization de NeuralOps) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado con PyTorch), más `config.json`, `compression_summary.json` y activos de tokenizer |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de ajuste | `nyu-mll/glue`, configuración `sst2` |
| Rango de compresión (`k`) | 32 (checkpoint empaquetado) |
| Ratio de compresión físico | 1.00x (0.0 % de parámetros eliminados) |
| Tamaño del repositorio | 0.6 GB |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder tipo BERT base: 12 capas, 768 dimensiones ocultas y 109.483.778 parámetros, con tokenizer WordPiece sin casing (`bert-base-uncased`). Sobre ese modelo se aplica el `AWQCompressor` de NeuralOps, un wrapper unificado de cuantización AWQ con soporte de `compressed-tensors`. El checkpoint empaquetado corresponde al rango `k=32` y, según la model card, no se aplicó recuperación LoRA (`LoRA Recovery Applied: False`) porque el protocolo de healing solo se activa cuando la compresión zero-shot degrada más de 2,0 puntos porcentuales con una reducción superior a 1,10x; aquí no se cumple ninguna de las dos condiciones.

El ajuste se realizó sobre GLUE SST-2 y la evaluación se hizo sobre la partición de validación (872 muestras) en una NVIDIA GeForce RTX 3090 de 24 GB. El autor documenta una evaluación Pareto en cuatro rangos (256, 128, 64, 32) con resultados idénticos en todos ellos: 92,09 % de precisión zero-shot y tras healing, lo que sugiere que en este caso la compresión no altera el comportamiento del clasificador ni el recuento de parámetros. La innovación metodológica declarada es el pipeline de compresión con telemetría (`compression_summary.json`) y la política automática de recuperación con LoRA de rango 8 (50 pasos, `lr=2e-4`, presupuesto de 45 s), aunque en este checkpoint no llegó a dispararse.

## Capacidades

- Clasificación binaria de sentimiento en inglés (etiquetas 0 = negativo, 1 = positivo) sobre textos de hasta la longitud de contexto estándar de BERT.
- Extracción de representaciones contextuales del encoder, reutilizables para otras tareas de clasificación o como base de fine-tuning.
- Inferencia determinista y de baja latencia para volúmenes altos de texto corto (reseñas, tuits, comentarios).
- Integración con el ecosistema Hugging Face `transformers` mediante `BertForSequenceClassification` y reconstrucción del grafo comprimido con `compress_model`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta generación de texto libre, código ni matemáticas.
- No soporta visión ni audio.
- Multilingüismo limitado al inglés; el vocabulario `uncased` no está adaptado a otros idiomas.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña en positiva o negativa con un 92,09 % de precisión en SST-2, suficiente para agregar métricas de satisfacción por lotes sin coste de GPU dedicada.
- Moderación de comentarios en foros angloparlantes: se usa como primer filtro para detectar tono negativo y derivar los casos dudosos a revisión humana, aprovechando la latencia baja de un encoder de 109 M de parámetros.
- Etiquetado de grandes volúmenes de texto para entrenamiento de modelos mayores: el clasificador sirve para preetiquetar corpus y reducir el coste de anotación manual, con la ventaja de que el checkpoint es pequeño (0,6 GB) y se puede desplegar en CPU.
- Monitorización de opinión de marca en redes sociales: ingestión por streaming de menciones en inglés y clasificación en tiempo casi real con un throughput alto por GPU.
- Baseline reproducible en investigación sobre compresión: sirve como referencia para comparar AWQ con poda estructurada o GPTQ en una tarea de clasificación con métrica bien definida y partición de validación fija (872 muestras).
- Docencia y prototipado de pipelines de cuantización: el repositorio incluye `compression_summary.json` con telemetría de los cuatro rangos evaluados, lo que permite reproducir el experimento completo con el código de NeuralOps.
- Filtrado previo en pipelines de RAG o curación de datos: descartar documentos con sentimiento negativo antes de indexarlos en un buscador semántico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Modelo | Tarea | Dataset | Métrica | Valor |
|---|---|---|---|---|
| `bert-comp-awq-sst2` (k=32) | Clasificación de sentimiento | GLUE SST-2 (validation) | Accuracy | 92,09 % |
| Profesor `bert-base-uncased` (referencia del autor) | Clasificación de sentimiento | GLUE SST-2 (validation) | Accuracy | 91,63 % |

Evaluación multi-rango declarada por el autor (RTX 3090, 872 muestras):

| Rango (`k`) | Ratio físico | Parámetros comprimidos | Reducción | Zero-shot | Healed | Paridad vs profesor |
|:---:|:---:|---:|---:|---:|---:|---:|
| 256 | 1.00x | 109.483.778 | 0,0 % | 92,09 % | 92,09 % | +0,46 % |
| 128 | 1.00x | 109.483.778 | 0,0 % | 92,09 % | 92,09 % | +0,46 % |
| 64 | 1.00x | 109.483.778 | 0,0 % | 92,09 % | 92,09 % | +0,46 % |
| 32 | 1.00x | 109.483.778 | 0,0 % | 92,09 % | 92,09 % | +0,46 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos de la misma categoría más allá del profesor.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo de pesos (109,5 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16/BF16: alrededor de 0,22 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para ese hardware. Una RTX 3060, RTX 4060 o incluso una GTX 1650 son suficientes.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y también en CPU para inferencia por lotes con throughput aceptable.
- Opciones de despliegue: `transformers` con PyTorch (vía `BertForSequenceClassification`), y previsiblemente `vLLM` o `TGI` para clasificación, aunque la model card solo documenta el flujo con `neuralops` y `huggingface_hub`. No se documenta soporte de `llama.cpp`, `Ollama` ni GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Para un encoder de 109 M de parámetros en una GPU moderna se espera un throughput de miles de secuencias cortas por segundo, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (dev) | Licencia | Formato |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-awq-sst2` | 109,5 M | no disponible (BERT base: 512) | 92,09 % (declarado) | MIT | PyTorch (`pytorch_model.bin`) |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,5 M | 512 | 91,63 % (declarado por el autor) | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | no disponible en esta ficha | Apache 2.0 | safetensors / PyTorch |
| `roberta-base` afinado en SST-2 | 125 M | 512 | no disponible en esta ficha | MIT | safetensors / PyTorch |

La comparación cuantitativa solo es posible contra el profesor declarado por el autor. Frente a DistilBERT, el modelo de este repositorio tiene un 66 % más de parámetros y no ofrece una ventaja de compresión demostrada (ratio 1.00x), por lo que para despliegue en producción con restricciones de memoria conviene evaluar alternativas destiladas. La licencia MIT es más permisiva que la Apache 2.0 del modelo base original.

## Limitaciones y advertencias

- El checkpoint declara un ratio de compresión de 1.00x: no reduce parámetros ni tamaño respecto al modelo base, por lo que no aporta ningún ahorro de memoria o cómputo frente a `bert-base-uncased` afinado.
- Los resultados de benchmarks están marcados como `verified: false`; no hay verificación independiente de la precisión del 92,09 %.
- La evaluación se realizó sobre solo 872 muestras de validación de SST-2, un conjunto pequeño con intervalos de confianza amplios (del orden de ±1,8 puntos porcentuales al 95 %), por lo que la diferencia de +0,46 % frente al profesor no es estadísticamente significativa.
- Sesgos conocidos: al derivar de `bert-base-uncased`, hereda los sesgos de género, raza y edad de su corpus de preentrenamiento (BooksCorpus y Wikipedia en inglés); no se documenta ninguna mitigación.
- Riesgo de alucinación: bajo en sentido estricto, porque la tarea es clasificación binaria; el riesgo real es de clasificación errónea en dominios distintos de reseñas de cine (sarcasmo, negaciones complejas, jerga).
- Limitación de idioma: solo inglés; el tokenizer `uncased` degrada el rendimiento en textos con acentos, emojis o idiomas distintos.
- Restricciones de licencia: MIT permite uso comercial sin restricciones, pero conviene revisar la licencia del modelo base (Apache 2.0) y de los datos de ajuste (GLUE SST-2, con sus propios términos de uso).
- Caveat de producción: el flujo de carga requiere la librería `neuralops` y reconstruir el grafo comprimido antes de cargar el state dict con `strict=False`; no es un checkpoint cargable directamente con `from_pretrained` de `transformers`, lo que añade fragilidad operativa.
- El autor no documenta el proceso de calibración de AWQ (dataset, número de muestras) ni los detalles del ajuste original en SST-2 (épocas, hiperparámetros), lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-awq-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementación del compresor AWQ: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/quantization/awq.py
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

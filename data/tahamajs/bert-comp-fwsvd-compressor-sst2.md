# tahamajs/bert-comp-fwsvd-compressor-sst2

## Resumen

`bert-comp-fwsvd-compressor-sst2` es un checkpoint de BERT-Base comprimido físicamente mediante SVD ponderado por la matriz de información de Fisher (FWSVD, Fisher-Weighted SVD) y ajustado para clasificación de sentimiento en GLUE SST-2. Lo publica Taha Majlesi dentro del proyecto NeuralOps, una librería de compresión de modelos que sustituye capas `nn.Linear` densas por factorizaciones de bajo rango `SVDLinear`. El modelo base es `google-bert/bert-base-uncased` (109,48 M de parámetros, 12 capas, dimensión oculta 768).

El checkpoint serializado corresponde al rango de compresión `k=256`, que reduce el número de parámetros un 8,61 % (hasta 100,06 M) con una ratio de compresión física de 1,094x. Sobre la partición de validación de SST-2 (872 muestras) alcanza un 90,94 % de accuracy, frente al 91,63 % del profesor sin comprimir, es decir, una pérdida de paridad de 0,69 puntos porcentuales. En este rango no se aplicó recuperación con LoRA, ya que la caída de precisión no superó el umbral de 2,0 puntos que activa el "healing".

Su relevancia es fundamentalmente metodológica: sirve como referencia reproducible de cómo la compresión SVD ponderada por Fisher preserva la precisión en tareas de clasificación de texto, y como ejemplo de la curva de Pareto que relaciona ratio de compresión y degradación de accuracy en rangos `k=256, 128, 64, 32`. No es un modelo de propósito general ni un LLM: es un encoder BERT de clasificación binaria, solo en inglés, empaquetado en formato PyTorch (`pytorch_model.bin`) y dependiente de la librería NeuralOps para reconstruir su topología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con capas `nn.Linear` sustituidas por `SVDLinear` (FWSVD, rango k=256) |
| Parametros totales | 100.058.882 (comprimido, -8,61 % respecto al base de 109.483.778) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar: 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en precisión completa, `pytorch_model.bin`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (state dict serializado), `config.json`, `compression_summary.json`, assets de tokenizer (`vocab.txt`, `tokenizer.json`, `tokenizer_config.json`) |

## Arquitectura y entrenamiento

La arquitectura de partida es BERT-Base uncased: 12 capas de transformer, dimensión oculta 768 y 109.483.778 parámetros, afinado previamente sobre GLUE SST-2. Sobre ese modelo, el `FWSVDCompressor` de NeuralOps precondiciona cada matriz de pesos con la información empírica de Fisher (aproximada como `F = (1/M) Σ g_i g_i^T`) o con un blanqueamiento por covarianza de activaciones (`C_X = (1/M) X^T X + λI`) antes de factorizar por SVD. El resultado es una descomposición de bajo rango que reemplaza las capas densas por `SVDLinear`, preservando las direcciones de mayor curvatura de la pérdida.

El checkpoint publicado corresponde a `k=256` y no incorpora adaptadores LoRA (`LoRA Recovery Applied: False`). La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre las 872 muestras de validación de SST-2. Para los rangos más agresivos (`k=128, 64, 32`), donde la caída zero-shot superaba el 2,0 % y la reducción de parámetros el 1,10x, se aplicó un "healing" LoRA con `r=8`, 50 pasos y `lr=2e-4` en un presupuesto de 45 segundos. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de GLUE SST-2, ni el uso de RLHF/DPO (no aplicable a un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Codificación contextual de texto en inglés mediante BERT-Base uncased (vocabulario estándar `bert-base-uncased`).
- Inferencia de bajo coste gracias a la reducción del 8,61 % de parámetros y a la factorización de bajo rango.
- No soporta tool calling ni function calling: es un encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (modelo uncased entrenado originalmente en inglés).
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Reconstrucción programática del modelo comprimido mediante la API `compress_model` de NeuralOps.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica cada reseña como positiva o negativa; su reducción de parámetros permite desplegarlo en CPU para lotes grandes sin renunciar a un 90,94 % de accuracy en SST-2.
- Moderación de comentarios en foros y redes: filtrado automático de mensajes con tono negativo como primera etapa de un pipeline de moderación, aprovechando la baja latencia del encoder comprimido.
- Investigación en compresión de modelos: sirve como referencia reproducible de la curva de Pareto `k=256, 128, 64, 32` para comparar técnicas de compresión (SVD, FWSVD, LoRA healing) sobre un mismo modelo base.
- Evaluación comparativa de técnicas de pruning y factorización: punto de comparación fijo con accuracy verificable (90,94 % en SST-2) frente a otras variantes comprimidas del mismo BERT-Base.
- Clasificación de feedback de clientes a escala: procesamiento por lotes de encuestas y tickets con un modelo de 100 M de parámetros que cabe en memoria de una GPU consumer.
- Docencia y demostraciones de NeuralOps: ejemplo mínimo para mostrar cómo se reconstruye un checkpoint comprimido con `compress_model` y `SVDLinear` en un notebook.
- Preetiquetado en pipelines de anotación: generación automática de etiquetas de sentimiento para grandes volúmenes de texto antes de la revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre GLUE SST-2, partición de validación (872 muestras), evaluados en una RTX 3090:

| Rank (k) | Ratio físico | Parámetros comprimidos (reducción) | Accuracy zero-shot | Accuracy con healing | Paridad vs profesor (91,63 %) |
|:---:|:---:|---:|---:|---:|---:|
| **256** (publicado) | 1,09x | 100.058.882 (-8,6 %) | 90,94 % | 90,94 % | -0,69 % |
| 128 | 1,21x | 90.615.554 (-17,2 %) | 80,50 % | 86,47 % (LoRA) | -5,16 % |
| 64 | 1,27x | 85.893.890 (-21,5 %) | 66,17 % | 80,28 % (LoRA) | -11,35 % |
| 32 | 1,31x | 83.533.058 (-23,7 %) | 56,88 % | 79,13 % (LoRA) | -12,50 % |

El profesor sin comprimir (`google-bert/bert-base-uncased` afinado en SST-2) obtiene un 91,63 % de accuracy en la misma partición. El checkpoint publicado (k=256) alcanza un 90,94 %.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 0,4 GB para los pesos (100 M de parámetros × 4 bytes) más overhead de activaciones; en la práctica, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; la evaluación del autor se realizó en una NVIDIA GeForce RTX 3090 (24 GB), aunque el modelo es sobradamente pequeño para GPUs de gama baja.
- Cabe en GPUs consumer: sí, en cualquier RTX (2060 o superior), GTX 1660, e incluso en iGPU modernas.
- Despliegue: la librería de referencia es `neuralops` (reconstrucción con `compress_model` + carga del state dict). No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la información disponible; el checkpoint es un `pytorch_model.bin` con topología `SVDLinear` que requiere la reconstrucción previa con NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-comp-fwsvd-compressor-sst2` (k=256) | 100,06 M (comprimido) | no disponible | 90,94 % (val) | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor, afinado SST-2) | 109,48 M | 512 tokens | 91,63 % (val) | Apache 2.0 | Hugging Face |
| BERT-Base comprimido k=128 (mismo zoo, con LoRA) | 90,62 M | no disponible | 86,47 % (val) | MIT | Hugging Face |
| BERT-Base comprimido k=64 (mismo zoo, con LoRA) | 85,89 M | no disponible | 80,28 % (val) | MIT | Hugging Face |

La comparativa más directa es con el profesor original y con las variantes de mayor compresión del mismo zoo NeuralOps. No se dispone de datos de otros modelos comprimidos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación binaria de sentimiento en inglés; no es un modelo generativo ni de propósito general.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La compresión introduce una pérdida de paridad de 0,69 puntos porcentuales frente al profesor; en rangos más agresivos (k=128 y menores) la degradación es sustancial (hasta -12,5 puntos).
- Requiere la librería NeuralOps y una reconstrucción explícita de la topología `SVDLinear` antes de cargar el state dict; no es un checkpoint cargable directamente con `AutoModelForSequenceClassification.from_pretrained` sin ese paso.
- Riesgo de sesgo heredado de `bert-base-uncased` y de los datos de GLUE SST-2 (reseñas de películas), no evaluado en la model card.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de errores de clasificación en dominios distintos al de entrenamiento.
- Licencia MIT: permite uso comercial, pero conviene revisar la licencia del modelo base (Apache 2.0) y de los datos de entrenamiento.
- No se documentan cuantizaciones ni formatos GGUF/ONNX; el despliegue en producción requiere integrar la librería NeuralOps en el stack.
- Contexto máximo no confirmado en la información disponible; se asume el estándar de BERT-Base (512 tokens) sin garantía explícita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-fwsvd-compressor-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor FWSVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/fwsvd_compressor.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

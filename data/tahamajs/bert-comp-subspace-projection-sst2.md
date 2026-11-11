# tahamajs/bert-comp-subspace-projection-sst2

## Resumen

`tahamajs/bert-comp-subspace-projection-sst2` es un checkpoint de BERT-Base (`google-bert/bert-base-uncased`) afinado para clasificación de sentimiento en GLUE SST-2 y posteriormente comprimido mediante la técnica `subspace_projection` (basada en SVD) implementada en la librería NeuralOps. El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de un "compressor zoo" que compara distintos rangos de compresión (`k=256, 128, 64, 32`) sobre el mismo modelo base, aplicando después un "healing" con LoRA de rango 8 para recuperar parte de la precisión perdida. El checkpoint serializado corresponde al rango `k=64`, con 35.165.954 parámetros (una reducción del 67,88 % respecto a los 109.483.778 del BERT-Base original) y un ratio de compresión físico de 3,11x.

El problema que aborda es el de la compresión agresiva de modelos transformer manteniendo un rendimiento aceptable en una tarea downstream concreta. Frente a una cuantización convencional, aquí se eliminan físicamente parámetros mediante proyección en subespacios de baja dimensionalidad, y se compensa la pérdida con adaptadores LoRA entrenados durante 50 pasos. El resultado es un modelo de 67,2 MB de pesos, pensado para despliegues con recursos muy limitados.

La relevancia es principalmente metodológica y experimental: el propio autor documenta que la precisión cae de un 91,63 % del profesor a un 76,15 % tras el healing, es decir, 15,48 puntos por debajo. Es un artefacto de investigación sobre técnicas de compresión, no un modelo listo para producción. La arquitectura subyacente es un transformer encoder BERT-Base de 12 capas y dimensión oculta 768, con contexto máximo de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base), 12 capas, dimension oculta 768 |
| Parametros totales | 35.165.954 (checkpoint comprimido, k=64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de bert-base-uncased) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en `pytorch_model.bin` con factores de bajo rango y adaptadores LoRA integrados) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); requiere reconstruir la topologia con NeuralOps antes de cargar |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas con 109.483.778 parámetros y dimensión oculta 768, afinado previamente sobre GLUE SST-2 (clasificación binaria de sentimiento). Sobre ese checkpoint se aplica el compresor `SubspaceProjectionCompressor` de la familia SVD de NeuralOps, que proyecta los pesos en un subespacio de rango `k=64`, reduciendo el recuento de parámetros a 35.165.954. La compresión es física: no se trata de una máscara de poda con pesos originales subyacentes, sino de un estado serializado con factores de bajo rango.

Cuando la compresión zero-shot degrada la precisión más de 2,0 puntos con una reducción superior a 1,10x, el pipeline aplica un "healing" con LoRA de rango `r=8` durante 50 pasos con tasa de aprendizaje `2e-4` y un presupuesto de 45 segundos. En el rango `k=64` el healing eleva la precisión del 51,38 % (zero-shot) al 76,15 %. La evaluación multi-rango se realizó físicamente en una NVIDIA GeForce RTX 3090 (24 GB) sobre el split de validación de GLUE SST-2 (872 muestras). No se documentan detalles sobre el dataset de entrenamiento del healing más allá de la propia tarea SST-2, ni sobre el uso de RLHF/DPO (no aplicable a un encoder de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con dos etiquetas de salida (`num_labels=2`).
- Inferencia sobre texto de hasta 512 tokens, suficiente para reseñas, tuits y frases cortas.
- Modelo especializado en una única tarea: no genera texto, no razona de forma general ni responde preguntas abiertas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés (vocabulario `bert-base-uncased`).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Clasificación de reseñas de producto en inglés: el modelo recibe el texto de la reseña (hasta 512 tokens) y devuelve una etiqueta binaria de sentimiento; su reducido tamaño (67,2 MB) permite ejecutarlo en CPU o en GPUs de gama baja dentro de un pipeline de moderación o analítica.
- Análisis de sentimiento en redes sociales: para tuits y comentarios cortos en inglés, el contexto de 512 tokens es suficiente y el bajo coste de inferencia facilita procesar grandes volúmenes por lotes.
- Filtrado previo en pipelines de atención al cliente: usar el modelo como clasificador rápido que etiqueta tickets como positivos o negativos antes de enrutarlos a un modelo mayor o a un agente humano.
- Experimentación académica en compresión de modelos: sirve como referencia reproducible para comparar técnicas SVD, poda o cuantización sobre BERT-Base en una tarea estándar como SST-2.
- Despliegue en dispositivos con memoria muy limitada: con 35 millones de parámetros y pesos de 67,2 MB, es viable en entornos edge o contenedores con pocos recursos, siempre que se acepte la pérdida de precisión.
- Benchmarking de pipelines de "healing" con LoRA: el repositorio incluye telemetría multi-rango (`compression_summary.json`) útil para estudiar el equilibrio entre ratio de compresión y precisión recuperada.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / variante | Ratio de compresion | Parametros | Precision SST-2 (validacion) |
|---|---:|---:|---:|
| Profesor (bert-base-uncased afinado) | 1x | 109.483.778 | 91,63 % |
| k=256 + LoRA | 1,63x | 67.016.450 | 50,92 % |
| k=128 + LoRA | 2,39x | 45.782.786 | 50,92 % |
| k=64 + LoRA (checkpoint publicado) | 3,11x | 35.165.954 | 76,15 % |
| k=32 + LoRA | 3,67x | 29.857.538 | 62,04 % |

Precisión zero-shot del checkpoint publicado (k=64) sin healing: 51,38 %. Delta frente al profesor tras healing: -15,48 puntos. La evaluación se realizó sobre 872 muestras del split de validación de GLUE SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 35 millones de parámetros (aproximadamente 140 MB de pesos más activaciones); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor evaluó en una NVIDIA GeForce RTX 3090 (24 GB), pero el modelo es sobredimensionado para esa tarjeta.
- Cabe en GPU consumer: sí, en cualquier modelo desde una GTX 1050 en adelante, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, ya que requiere reconstruir la topología comprimida con `neuralops` y cargar el `state_dict` con `strict=False` sobre un `BertForSequenceClassification`. El flujo de inferencia estándar es PyTorch + Transformers + NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (validacion) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| `tahamajs/bert-comp-subspace-projection-sst2` (k=64) | 35,2 M | 512 | 76,15 % | MIT | Hugging Face (requiere NeuralOps) |
| `google-bert/bert-base-uncased` afinado en SST-2 (profesor) | 109,5 M | 512 | 91,63 % | Apache 2.0 | Hugging Face / Transformers |
| DistilBERT-base afinado en SST-2 | 66 M | 512 | No disponible en la informacion | Apache 2.0 | Hugging Face / Transformers |
| RoBERTa-base afinado en SST-2 | 125 M | 512 | No disponible en la informacion | MIT | Hugging Face / Transformers |

La comparación con DistilBERT y RoBERTa se incluye por categoría (encoders para clasificación de texto en inglés), pero no se dispone de sus cifras exactas en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- Pérdida de precisión significativa: 15,48 puntos por debajo del profesor en SST-2; inaceptable para muchas aplicaciones en producción que requieran alta exactitud.
- El healing con LoRA no es monotónico: los rangos k=256 y k=128 rinden peor (50,92 %) que k=64 (76,15 %), lo que sugiere inestabilidad en el procedimiento de recuperación y cuestiona la reproducibilidad del pipeline.
- Solo inglés: el vocabulario y el afinamiento están limitados a `bert-base-uncased` en inglés.
- Contexto máximo de 512 tokens: no apto para documentos largos sin troceado previo.
- Tarea única: no es un modelo generativo ni de propósito general; cualquier uso fuera de clasificación binaria de sentimiento requerirá reentrenamiento.
- Dependencia de la librería NeuralOps: la carga requiere `compress_model` y una topología reconstruida; no funciona con un `from_pretrained` estándar de Transformers.
- Riesgo de sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas), que no representa necesariamente otros dominios.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en textos ambiguos, irónicos o de dominio distinto.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni sobre la idoneidad para producción.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); conviene revalidar en el conjunto de test antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-comp-subspace-projection-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del compresor: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/compression/svd/subspace_projection.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE SST-2: https://huggingface.co/datasets/nyu-mll/glue

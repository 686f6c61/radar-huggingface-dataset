# valentini/distilbert-base-uncased-finetuned-imdb

## Resumen

El modelo `valentini/distilbert-base-uncased-finetuned-imdb` es un checkpoint de DistilBERT base uncased, fine-tuneado para análisis de sentimiento sobre el dataset IMDB (aunque la model card no especifica el dataset, el nombre del modelo y las referencias externas lo indican). DistilBERT es una versión destilada de BERT que conserva el 97 % de su rendimiento con un 40 % menos de parámetros y un 60 % más de velocidad de inferencia. Este modelo concreto, con 66,9 millones de parámetros, está optimizado para clasificar reseñas de películas en positivas o negativas, ofreciendo una alternativa ligera y eficiente para tareas de procesamiento de lenguaje natural en producción.

La relevancia de este modelo radica en su tamaño reducido y su licencia Apache-2.0, que permite su uso comercial sin restricciones. Al estar basado en DistilBERT, hereda una arquitectura transformer encoder con 6 capas, 768 dimensiones ocultas y una longitud de contexto de 512 tokens. Aunque la model card no incluye métricas de evaluación, el fine-tuning sobre IMDB (un corpus de 50 000 reseñas etiquetadas) lo convierte en una opción práctica para tareas de clasificación de sentimiento en inglés, especialmente en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 12 cabezas de atención, 768 dimensiones ocultas) |
| Parametros totales | 66 985 530 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion posterior posible con herramientas como ONNX Runtime o llama.cpp) |
| Idiomas soportados | inglés (entrenado en texto en inglés, uncased) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un modelo transformer encoder destilado de BERT base mediante destilación de conocimiento. La arquitectura reduce el número de capas de 12 a 6, manteniendo la misma dimensión de embedding (768) y el mismo mecanismo de atención. El modelo fue preentrenado con pérdida de destilación, pérdida de MLM y pérdida de coseno sobre los mismos datos que BERT (Wikipedia y BookCorpus). El checkpoint `distilbert-base-uncased` es la versión base sin fine-tuning.

El fine-tuning de este modelo se realizó sobre un dataset de reseñas de películas (presumiblemente IMDB, aunque la model card no lo confirma). Los hiperparámetros de entrenamiento documentados son: learning rate de 2e-05, batch size de 64, optimizador AdamW (fused), scheduler lineal, 2 épocas y entrenamiento con precisión mixta (Native AMP). La pérdida de validación final fue de 2.4378, aunque no se reportan métricas de precisión o F1. El entrenamiento se realizó con la librería Transformers 5.14.1 y PyTorch 2.13.0.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) sobre texto en inglés, especialmente reseñas de películas.
- Generación de embeddings contextuales de 768 dimensiones para tareas de representación de texto.
- Fill-mask: al conservar el head de MLM de DistilBERT, puede predecir tokens enmascarados en una secuencia, aunque su uso principal es la clasificación.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre (es un modelo encoder, no generativo).
- Capacidades multilingües limitadas: entrenado exclusivamente en inglés, su rendimiento en otros idiomas es muy bajo.
- Inferencia rápida y eficiente en memoria gracias a la destilación, apta para despliegue en CPU o GPUs de baja gama.

## Casos de uso

- Análisis de sentimiento en reseñas de productos: el modelo puede clasificar reseñas de comercio electrónico como positivas o negativas, integrándose en pipelines de análisis de opinión para extraer métricas de satisfacción.
- Moderación de comentarios en foros y redes sociales: permite detectar automáticamente comentarios negativos o abusivos, priorizando la revisión humana.
- Monitorización de marca: análisis de menciones en Twitter o noticias para medir la percepción pública de una empresa o producto.
- Clasificación de tickets de soporte: categorizar mensajes de clientes como quejas o consultas positivas, mejorando la priorización en sistemas de atención al cliente.
- Análisis de encuestas abiertas: procesar respuestas de texto libre en encuestas de satisfacción para cuantificar el sentimiento general.
- Filtrado de contenido en plataformas de reseñas: detectar reseñas falsas o extremadamente negativas que requieran revisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (results: []), y la búsqueda web no encontró datos de rendimiento para este checkpoint específico. El modelo base DistilBERT alcanza un 91,3 % de accuracy en SST-2 (según la ficha de `distilbert-base-uncased-finetuned-sst-2-english`), pero este valor no es transferible al fine-tuning sobre IMDB sin verificación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en float32 (66,9 M parámetros × 4 bytes), menos de 0,3 GB en int8. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU con 2 GB o más, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso integradas con soporte CUDA. También funciona en CPU con latencia aceptable (inferencia en decenas de milisegundos por secuencia).
- Opciones de despliegue: Hugging Face Inference Endpoints, ONNX Runtime, TensorRT, TorchServe, o mediante la librería Transformers en Python.
- Latencia y throughput: no disponibles oficialmente, pero por su tamaño, puede procesar cientos de secuencias por segundo en una GPU moderna (p. ej., RTX 3090) y decenas en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| valentini/distilbert-base-uncased-finetuned-imdb | 66,9 M | 512 | Apache-2.0 | Clasificación de sentimiento en IMDB |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Apache-2.0 | Clasificación de sentimiento en SST-2 (accuracy 91,3 %) |
| bert-base-uncased | 110 M | 512 | Apache-2.0 | Modelo base, requiere fine-tuning |
| bert-base-uncased-finetuned-sst-2 | 110 M | 512 | Apache-2.0 | Clasificación de sentimiento en SST-2 (accuracy 92,7 %) |

La comparativa muestra que este modelo es un 40 % más ligero que BERT base, con un rendimiento esperado ligeramente inferior pero suficiente para tareas de sentimiento. No se dispone de métricas directas para el checkpoint de IMDB, por lo que la elección entre este y otros modelos dependerá de la validación empírica en el caso de uso concreto.

## Limitaciones y advertencias

- Sesgos del dataset: el entrenamiento sobre reseñas de IMDB puede introducir sesgos relacionados con el dominio cinematográfico (jerga, géneros, actores) y no generalizar bien a otros dominios.
- Riesgo de alucinación: no aplica, al ser un modelo encoder no genera texto libre.
- Limitaciones de idioma: solo inglés, y el tokenizador uncased no distingue mayúsculas, lo que puede afectar a nombres propios o acrónimos.
- Limitaciones de contexto: ventana de 512 tokens, insuficiente para documentos largos; se requiere truncamiento o estrategias de ventana deslizante.
- Rendimiento no verificado: la model card no reporta métricas de precisión, recall o F1, por lo que se recomienda evaluar el modelo en el dataset objetivo antes de desplegarlo en producción.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no incluye garantías ni soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valentini/distilbert-base-uncased-finetuned-imdb
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Ficha de DistilBERT fine-tuned en SST-2: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Referencia en PromptLayer: https://www.promptlayer.com/models/distilbert-base-uncased-finetuned-imdb
- Repositorio de ejemplo (no directamente relacionado): https://github.com/cyberXjaggu/GEN-AI-LAB

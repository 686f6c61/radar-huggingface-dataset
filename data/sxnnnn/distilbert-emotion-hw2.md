# SXNNNN/distilbert-emotion-hw2

## Resumen

`distilbert-emotion-hw2` es un modelo de clasificación de texto en inglés especializado en la detección de emociones en textos cortos, con seis categorías posibles: tristeza, alegría, amor, enfado, miedo y sorpresa. Lo desarrolla el usuario SXNNNN como trabajo académico para la asignatura "Fundamentos de Inteligencia Artificial" (大作业 2, es decir, "trabajo grande 2"), y se publica con licencia MIT en Hugging Face.

Técnicamente se trata de un fine-tuning de `distilbert-base-uncased`, la variante destilada de BERT con 66,96 millones de parámetros y arquitectura transformer encoder de 6 capas. El modelo se ha entrenado sobre el dataset `emotion` (16.000 ejemplos de entrenamiento, 2.000 de validación y 2.000 de test) durante 5 épocas con una longitud máxima de 128 tokens, lo que lo sitúa como una solución ligera y de bajo coste computacional para tareas de análisis de sentimiento granular.

Su relevancia es limitada pero concreta: ofrece una precisión del 92,85% en test (macro-F1 idéntico) sobre una tarea de 6 clases donde el baseline de la clase mayoritaria es del 35,20%, y supera ampliamente a alternativas clásicas como TF-IDF + regresión logística (63,45%). Es un modelo pequeño, rápido y fácil de desplegar, adecuado para prototipos, clasificación de reseñas o moderación básica de contenido en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66,96 millones de parámetros obtenido por destilación de conocimiento a partir de BERT-base. Sobre esta base se añade una cabeza de clasificación con 6 etiquetas (`sadness`, `joy`, `love`, `anger`, `fear`, `surprise`), cuyos mapeos `id2label` y `label2id` están escritos en el `config.json`.

El fine-tuning se realizó sobre el dataset `emotion` con los siguientes hiperparámetros: learning rate 5e-5, batch size de entrenamiento 8, batch size de evaluación 32, 5 épocas, longitud máxima de 128 tokens, optimizador AdamW y scheduler lineal con warmup ratio de 0,1. No se menciona en la información disponible el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste supervisado convencional sobre etiquetas de emoción. El repositorio ocupa 0,3 GB, coherente con el tamaño del checkpoint en safetensors.

## Capacidades

- Clasificación de texto en inglés en 6 clases de emoción: `sadness`, `joy`, `love`, `anger`, `fear`, `surprise`.
- Análisis de sentimiento granular (no solo positivo/negativo, sino emociones específicas).
- Procesamiento de textos cortos de hasta 128 tokens.
- Inferencia rápida y de bajo coste gracias al tamaño reducido del modelo (66,96 M de parámetros).
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- Análisis de reseñas de producto: clasificar comentarios cortos de clientes en una de las seis emociones para detectar insatisfacción (enfado, tristeza) frente a satisfacción (alegría, amor) y priorizar respuestas del equipo de soporte.
- Moderación de contenido en foros o redes: identificar mensajes con carga emocional negativa (enfado, miedo) para revisión humana, aprovechando la velocidad de inferencia del modelo destilado.
- Monitorización de sentimiento en encuestas: procesar respuestas abiertas breves de cuestionarios y agregar métricas por emoción, con un coste computacional mínimo al caber en CPU.
- Enrutamiento de tickets de atención al cliente: clasificar el tono emocional de un mensaje entrante y dirigirlo al equipo adecuado (por ejemplo, enfado a retención, tristeza a soporte empático).
- Investigación en psicología o ciencias sociales: etiquetar corpus de textos cortos en inglés con emociones para estudios cuantitativos, dado su macro-F1 de 0,9285 en test.
- Prototipado rápido y educación: servir como ejemplo didáctico de fine-tuning de DistilBERT y como baseline ligero frente a modelos generativos de mayor tamaño en tareas de clasificación.
- Filtrado previo en pipelines de datos: descartar o marcar textos con emociones extremas antes de pasarlos a modelos más grandes y costosos.

## Benchmarks y rendimiento

| Metrica | Validacion | Test |
|---|---|---|
| Accuracy | 94,45% | 92,85% |
| Macro-F1 | 94,45% | 92,85% |

Resultados por clase en validación (F1): sadness 0,971; joy 0,958; love 0,874; anger 0,945; fear 0,920; surprise 0,863.

Comparación con baselines en la misma tarea (test):

| Modelo | Accuracy |
|---|---|
| distilbert-emotion-hw2 (fine-tuning) | 92,85% |
| TF-IDF + Logistic Regression | 63,45% |
| TF-IDF + LinearSVC | 62,90% |
| TF-IDF + RandomForest | 52,45% |
| Baseline clase mayoritaria | 35,20% |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible, ya que el modelo no es generativo ni está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (66,96 M de parámetros, ~268 MB de pesos), lo que permite ejecución en CPU sin problemas.
- GPU recomendadas: cualquier GPU moderna es suficiente; incluso una GTX 1650 o una iGPU reciente pueden servir. Para lotes grandes se recomienda una RTX 3060 o superior.
- Cabe holgadamente en cualquier GPU de consumo (RTX 4090, RTX 3080, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face, y exportación a ONNX o cuantización con herramientas estándar.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distilbert-emotion-hw2 | 66,96 M | 128 tokens | Clasificación de 6 emociones | MIT | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Análisis de sentimiento binario | Apache 2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 tokens | Clasificación de 6 emociones | Apache 2.0 | Hugging Face |
| j-hartmann/emotion-english-distilroberta-base | ~82 M | 512 tokens | Clasificación de 7 emociones | MIT | Hugging Face |

La comparativa se basa en modelos públicos de la misma familia y tarea; no se dispone de resultados de benchmarks cruzados en la información proporcionada para establecer una comparación numérica directa de rendimiento.

## Limitaciones y advertencias

- Solo soporta inglés; no está entrenado ni validado para otros idiomas.
- Longitud máxima de 128 tokens: textos más largos se truncan, lo que puede perder información relevante.
- Es un clasificador de emociones, no un modelo generativo: no puede responder preguntas, generar texto ni razonar.
- Riesgo de confusión entre emociones próximas: la model card reporta errores de joy frente a love (21 casos) y de anger clasificado como sadness (8 casos) en validación.
- El dataset `emotion` es relativamente pequeño (16.000 ejemplos de entrenamiento) y de dominio acotado; el rendimiento puede degradarse en textos de otros dominios (técnico, legal, redes sociales con jerga).
- No se han publicado análisis de sesgos demográficos, culturales o de género en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el modelo original y verificar la licencia del dataset `emotion` subyacente.
- Al ser un trabajo académico con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SXNNNN/distilbert-emotion-hw2
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset `emotion`: https://huggingface.co/datasets/emotion
- Documentación de DistilBERT: https://huggingface.co/docs/transformers/model_doc/distilbert

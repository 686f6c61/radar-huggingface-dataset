# zyberg2091/distilbert-base-multilingual-toxicity-classifier

## Resumen

El modelo `zyberg2091/distilbert-base-multilingual-toxicity-classifier` es un clasificador de texto diseñado para detectar contenido tóxico en múltiples idiomas. Está basado en la arquitectura DistilBERT, concretamente en la variante `distilbert-base-multilingual-cased` de Hugging Face, que fue destilada a partir de BERT multilingüe para reducir el tamaño y acelerar la inferencia manteniendo la mayor parte de su capacidad lingüística. Este fine-tuning específico para toxicidad se publicó en marzo de 2022 y, aunque cuenta con muy pocas descargas y sin valoraciones, puede resultar útil para tareas de moderación de contenido en entornos multilingües.

El modelo se distribuye a través de Hugging Face con el pipeline de clasificación de texto y es compatible con la librería Transformers y TensorFlow. Al ser un modelo relativamente pequeño (alrededor de 134 millones de parámetros en su versión base, aunque no se confirma el número exacto para este fine-tuning), es adecuado para despliegues en recursos limitados. Sin embargo, la información pública es muy escasa: no se especifican los datos de entrenamiento, el rendimiento ni las restricciones de licencia, por lo que cualquier uso en producción requiere una evaluación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer) fine-tuned para clasificación de toxicidad |
| Parametros totales | no disponible (el modelo base `distilbert-base-multilingual-cased` tiene 134M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 104 idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o TensorFlow checkpoint) |

## Arquitectura y entrenamiento

DistilBERT es un modelo transformer basado en destilación de conocimiento: se entrena para replicar las salidas de BERT base, pero con la mitad de capas (6 en lugar de 12) y un 40% menos de parámetros, logrando una inferencia aproximadamente un 60% más rápida. La variante `distilbert-base-multilingual-cased` se entrenó sobre Wikipedia en 104 idiomas, preservando la distinción entre mayúsculas y minúsculas.

El modelo `zyberg2091/distilbert-base-multilingual-toxicity-classifier` es un fine-tuning de ese modelo base para la tarea de clasificación binaria (o multiclase) de toxicidad. No se dispone de información sobre el dataset utilizado, el número de épocas, la técnica de ajuste (por ejemplo, si se usó aprendizaje por transferencia estándar o algún método adicional como RLHF) ni los hiperparámetros. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura DistilBERT.

## Capacidades

- Clasificación de texto como tóxico o no tóxico en múltiples idiomas, gracias al modelo base multilingüe.
- Inferencia rápida y ligera, adecuada para entornos con restricciones de cómputo o latencia.
- Compatible con la librería Transformers y TensorFlow, lo que facilita su integración en pipelines de NLP.
- Al estar basado en DistilBERT, tiene una ventana de contexto de 512 tokens, suficiente para la mayoría de mensajes cortos o párrafos.
- No se han documentado capacidades adicionales como tool calling, agentes o modo de razonamiento explícito.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puede clasificar automáticamente si un comentario es tóxico antes de su publicación, ayudando a reducir la carga de moderación manual.
- Filtrado de contenido en plataformas multilingües: dado que el modelo base soporta 104 idiomas, puede aplicarse a comunidades internacionales sin necesidad de entrenar modelos por idioma.
- Monitorización de chats en videojuegos o aplicaciones de mensajería: permite detectar lenguaje abusivo en tiempo real y activar alertas o sanciones.
- Análisis de reseñas de productos: identifica reseñas agresivas u ofensivas que puedan violar las políticas de la plataforma.
- Preprocesado de datasets para entrenar otros modelos: puede usarse para filtrar ejemplos tóxicos en corpus de texto antes de entrenar modelos generativos o clasificadores.
- Investigación académica sobre detección de toxicidad y sesgos en modelos multilingües: sirve como punto de partida para comparar enfoques o estudiar la transferencia entre idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión, recall, F1 ni comparaciones con otros clasificadores de toxicidad en el repositorio ni en los resultados de búsqueda.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 134M de parámetros, su footprint en memoria es bajo: en float32 ocupa unos 537 MB, y en cuantización int8 podría reducirse a unos 134 MB.
- Es ejecutable en CPU sin GPU para inferencia en lotes pequeños; para producción con alto throughput se recomienda una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060 o superior).
- Compatible con frameworks de despliegue como Hugging Face Inference Endpoints, TensorFlow Serving, ONNX Runtime o vLLM (aunque vLLM está más orientado a modelos generativos).
- La latencia estimada para una sola inferencia en CPU moderna es del orden de 10-20 ms; en GPU, menos de 5 ms, aunque estos valores no están confirmados por el autor.
- No hay datos oficiales de throughput, pero al ser un modelo ligero puede procesar cientos de peticiones por segundo en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea. A modo orientativo, otros clasificadores de toxicidad populares son:

- `unitary/toxic-bert` (basado en BERT, en inglés, 110M parámetros).
- `detoxify` (modelos basados en DistilBERT y RoBERTa, entrenados con datasets como Jigsaw).
- `facebook/roberta-hate-speech-dynabench-r4-target` (RoBERTa, 125M parámetros, para discurso de odio).

Sin embargo, no hay datos de rendimiento comparado de este modelo con esos otros, por lo que no se puede establecer una tabla objetiva.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, pero al derivar de un modelo entrenado con Wikipedia, es probable que refleje los sesgos presentes en ese corpus (por ejemplo, sobrerrepresentación de ciertas culturas o idiomas).
- La falta de documentación sobre el dataset de fine-tuning impide conocer los criterios exactos de "toxicidad" y su cobertura (por ejemplo, si incluye discurso de odio, acoso, violencia, etc.).
- Riesgo de alucinación en clasificación: como todo clasificador, puede cometer falsos positivos o negativos, especialmente en contextos no representados en el entrenamiento.
- Limitación de contexto: 512 tokens, por lo que no es adecuado para documentos largos.
- Idiomas: aunque el modelo base soporta 104 idiomas, no se garantiza que el fine-tuning haya mantenido el mismo rendimiento en todos ellos; es probable que el rendimiento sea muy desigual.
- Licencia no especificada: no se puede garantizar el uso comercial sin autorización del autor.
- El modelo tiene muy pocas descargas y sin validación externa, lo que indica una madurez limitada y posibles problemas no detectados.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/zyberg2091/distilbert-base-multilingual-toxicity-classifier)
- [Modelo base `distilbert-base-multilingual-cased`](https://huggingface.co/distilbert/distilbert-base-multilingual-cased)
- [Artículo sobre DistilBERT en GeeksforGeeks](https://www.geeksforgeeks.org/nlp/distilbert-in-natural-language-processing/)
- [Ficha de DistilBERT multilingüe en Aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/distilbert-base-multilingual-cased-distilbert)

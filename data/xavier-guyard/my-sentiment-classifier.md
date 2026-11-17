# xavier-guyard/my-sentiment-classifier

## Resumen

My Sentiment Classifier es un modelo de clasificación de texto publicado en Hugging Face por el usuario xavier-guyard. Se trata de un DistilBERT afinado para clasificación binaria de sentimiento (POSITIVE / NEGATIVE), según indica la propia model card, que lo describe explícitamente como un "ejercicio de despliegue" republicado. No se trata, por tanto, de un modelo entrenado desde cero ni de una contribución original, sino de una adaptación de la arquitectura DistilBERT de 6 capas y aproximadamente 67 millones de parámetros.

El modelo tiene un tamaño de repositorio de 0,3 GB y pesos en formato safetensors, con 66.955.010 parámetros totales según los metadatos del repositorio. La model card incluye un ejemplo de uso mediante el pipeline de transformers que devuelve etiquetas POSITIVE con puntuaciones de confianza cercanas a 0,999 para una frase positiva de ejemplo.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: el repositorio no presenta resultados de benchmarks, no documenta el dataset de entrenamiento, no especifica idiomas soportados y no incluye información sobre hiperparámetros. Resulta útil como referencia de despliegue mínimo de un clasificador de sentimiento basado en DistilBERT, pero no debe considerarse una fuente fiable para producción sin una evaluación independiente previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado, 6 capas) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estandar: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (segun frontmatter de la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, una versión destilada de BERT que reduce el número de capas del modelo original (12 en BERT-base) a 6, manteniendo aproximadamente la mitad de los parámetros. El modelo resultante tiene 66.955.010 parámetros, coherente con un DistilBERT-base con una cabeza de clasificación binaria. La model card no aporta detalles sobre el proceso de destilación ni sobre la inicialización de pesos.

Respecto al entrenamiento, la información disponible es mínima: la model card indica que el modelo está "fine-tuned for binary sentiment classification (POSITIVE / NEGATIVE)" y que se republica como "deployment exercise". No se especifica el dataset de afinamiento, el número de épocas, la tasa de aprendizaje, el tamaño del conjunto de entrenamiento ni si se aplicaron técnicas de regularización o early stopping. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de este tipo. No hay información sobre innovaciones técnicas adicionales.

## Capacidades

- Clasificación binaria de sentimiento: etiquetas POSITIVE y NEGATIVE sobre texto de entrada.
- Integración con el pipeline `text-classification` de la librería transformers.
- Inferencia sobre frases cortas o fragmentos de texto; el ejemplo de la model card usa una frase de tres palabras.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis de opiniones en reseñas de producto: el modelo puede clasificar reseñas cortas como positivas o negativas, aprovechando su tamaño reducido para procesar lotes grandes con bajo coste computacional.
- Monitorización de menciones en redes sociales: clasificación de tuits o comentarios en tiempo casi real, adecuada por la baja latencia esperable de un DistilBERT en CPU o GPU modesta.
- Enrutamiento de tickets de soporte: usar la polaridad del sentimiento como señal auxiliar para priorizar tickets negativos hacia agentes humanos, integrándolo en un pipeline de preprocesado.
- Filtrado de feedback en encuestas: clasificación automática de respuestas abiertas para agregar métricas de satisfacción (NPS, CSAT) sin revisión manual.
- Moderación de comentarios: detección de tono negativo como primera capa de un sistema de moderación, combinada con otros clasificadores para categorías más finas.
- Prototipado y docencia: ejemplo mínimo de despliegue de un clasificador con transformers y safetensors, útil para demostrar el flujo completo desde el Hub hasta la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB para los pesos (67 M parámetros × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, así como en CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para uso individual basta una GPU consumer de gama baja.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime, TorchScript, TGI y servidores de inferencia compatibles con modelos de la familia BERT. No se ha confirmado compatibilidad con llama.cpp ni Ollama, que no están orientados a clasificadores BERT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my-sentiment-classifier | 66.955.010 | no disponible | Clasificación binaria de sentimiento | apache-2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificación binaria de sentimiento | apache-2.0 | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base, requiere fine-tuning | apache-2.0 | Hugging Face |
| roberta-base | ~125 M | 512 tokens | Modelo base, requiere fine-tuning | MIT | Hugging Face |

La comparación con distilbert-base-uncased-finetuned-sst-2-english es la más directa, ya que comparte arquitectura y tarea; sin embargo, no se dispone de datos que permitan afirmar si este modelo deriva de aquel o si se ha afinado de forma independiente. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce la distribución sobre la que el modelo fue ajustado y su posible sesgo.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados; no se puede asumir un buen rendimiento en castellano sin evaluación previa.
- La licencia apache-2.0 figura en el frontmatter de la model card, pero el campo de licencia del repositorio aparece como no disponible; conviene verificar antes de un uso comercial.
- El autor describe el modelo como un "ejercicio de despliegue", lo que sugiere que no ha pasado por un proceso de validación riguroso orientado a producción.
- No hay métricas publicadas (accuracy, F1, precisión, recall), por lo que no es posible estimar su calidad real.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El contexto máximo no está confirmado en la model card; asumir 512 tokens es una extrapolación de la arquitectura DistilBERT, no un dato verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xavier-guyard/my-sentiment-classifier
- Documentación de DistilBERT (referencia de arquitectura): https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación del pipeline text-classification: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline

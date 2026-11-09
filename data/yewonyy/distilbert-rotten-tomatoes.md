# yewonyy/distilbert-rotten-tomatoes

## Resumen

`yewonyy/distilbert-rotten-tomatoes` es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased` sobre un conjunto de datos no especificado, presumiblemente relacionado con críticas de cine del corpus Rotten Tomatoes. Lo publica el usuario yewonyy en Hugging Face con licencia Apache 2.0 y un total de 66.955.010 parámetros, coherente con la arquitectura DistilBERT base.

El modelo resuelve la tarea de clasificación de secuencias (text-classification) y se distribuye en formato safetensors dentro de la librería Transformers, con compatibilidad declarada con Text Embeddings Inference y endpoints de Hugging Face. Es relevante como ejemplo de ajuste ligero de un encoder compacto para análisis de sentimiento o clasificación binaria/multiclase sobre texto en inglés, aunque la documentación publicada es mínima.

La model card es la generada automáticamente por el `Trainer` de Transformers y no incluye descripción del dataset, métricas de evaluación ni usos previstos. El repositorio ocupa 1,3 GB, lo que sugiere la presencia de checkpoints intermedios además de los pesos finales. No se declaran idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT base uncased, un transformer encoder de 6 capas obtenido por destilación de BERT base (12 capas). La cabeza de clasificación se sustituye por una capa lineal ajustada a la tarea, lo que explica el recuento de 66.955.010 parámetros (frente a los 66.362.370 del checkpoint base sin cabeza ajustada).

El fine-tuning se realizó con los siguientes hiperparámetros declarados en la model card: learning rate 2e-5, batch size de entrenamiento y evaluación de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8 en variante `ADAMW_TORCH_FUSED`, scheduler lineal y 2 épocas. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo validación o técnicas de regularización adicionales. Las versiones de framework empleadas fueron Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto (text-classification) sobre secuencias de entrada, presumiblemente sentimiento o categoría de críticas de cine.
- Codificación contextual de texto en inglés heredada del modelo base DistilBERT uncased.
- Inferencia ligera: 66,9 M de parámetros permiten ejecución en CPU con latencias bajas.
- Compatibilidad con la pipeline `text-classification` de Transformers.
- Compatibilidad declarada con Text Embeddings Inference y endpoints de Hugging Face.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no declaradas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Análisis de sentimiento de críticas cinematográficas: el modelo clasifica reseñas de películas en categorías de opinión, aprovechando el ajuste específico sobre el dominio Rotten Tomatoes.
- Moderación de reseñas en plataformas de contenido: filtrado automático de comentarios negativos o tóxicos en foros de cine mediante la cabeza de clasificación.
- Enrutamiento de feedback de usuarios: clasificación rápida de opiniones entrantes en un sistema de atención al cliente o producto para dirigirlas al equipo adecuado.
- Etiquetado de datasets a escala: uso del modelo para pre-anotar grandes volúmenes de reseñas antes de una revisión humana, dado su bajo coste computacional.
- Análisis de reputación de marca: procesamiento por lotes de menciones públicas y reseñas para agregar sentimiento a nivel de producto o título.
- Prototipado rápido en CPU: despliegue en contenedores sin GPU para demos, pruebas A/B o pipelines de CI que validen clasificadores de texto.
- Extracción de señal en sistemas de recomendación: incorporar la polaridad de las reseñas como característica adicional en un motor de recomendación de películas.

## Benchmarks y rendimiento

El campo `model-index` de la model card declara una entrada para `distilbert-rotten-tomatoes` con la lista de resultados vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (≈268 MB de pesos), aproximadamente 134 MB en fp16 y menos de 70 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo es viable en GTX 1050, T4, L4 o superiores, aunque no las necesita.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090) y también en CPU.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (declarado compatible), endpoints de Hugging Face, ONNX Runtime y cuantización vía Optimum o PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en decenas de milisegundos por lote en CPU moderna y throughput de miles de secuencias por segundo en GPU, aunque no hay mediciones publicadas.
- Tamaño del repositorio: 1,3 GB, probablemente por checkpoints intermedios; conviene descargar solo los archivos necesarios para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yewonyy/distilbert-rotten-tomatoes | 66,9 M | no disponible (base: 512) | Clasificación de texto | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66,4 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 67,0 M | 512 | Análisis de sentimiento | Apache 2.0 | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | 66,9 M | 512 | Clasificación de emociones | Apache 2.0 | Hugging Face |

La comparación con alternativas se limita a similitud arquitectónica y de tarea; no hay métricas publicadas de este modelo que permitan contrastar rendimiento con las alternativas citadas.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composición, el equilibrio de clases y la posible presencia de sesgos en los datos.
- Sin métricas de evaluación: no hay accuracy, F1 ni matriz de confusión publicadas, por lo que no se puede validar la calidad del ajuste.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Idioma: el modelo base es uncased en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Longitud de contexto: DistilBERT base admite hasta 512 tokens; textos más largos requieren truncamiento o segmentación.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de producción.
- Repositorio de 1,3 GB con posible contenido redundante (checkpoints); verificar los archivos antes de desplegar.
- Sin información sobre usos previstos ni limitaciones declaradas por el autor: la model card es la plantilla automática sin completar.
- Fecha de creación futura (2026-11-09) en los metadatos, lo que puede indicar un error de registro o un repositorio de prueba.

## Enlaces

- Hugging Face: https://huggingface.co/yewonyy/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentación de Transformers (text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

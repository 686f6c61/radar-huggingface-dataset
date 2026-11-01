# ullahhafeez321/bert-sentiment-classifier

## Resumen

BERT Sentiment Classifier es un modelo de clasificación de sentimiento en ingles desarrollado por el usuario ullahhafeez321 a partir del checkpoint preentrenado `google-bert/bert-base-uncased`. Se trata de un ajuste fino (fine-tuning) supervisado sobre el conjunto de datos IMDb Movie Reviews para una tarea binaria de dos clases: resena positiva (etiqueta 1) y resena negativa (etiqueta 0). El modelo resuelve el problema clasico de analisis de sentimiento en resenas de cine, un caso de uso docente y de referencia en procesamiento de lenguaje natural.

Arquitectonicamente es un transformer encoder puro de la familia BERT en su variante base, con 109.483.778 parametros totales y una ventana de secuencia maxima configurada en 192 tokens durante el ajuste fino. El repositorio ocupa 0,9 GB y los pesos se distribuyen en formato safetensors, lo que facilita su carga con la libreria Transformers y su despliegue en entornos de inferencia estandar.

Su relevancia es limitada pero clara: sirve como ejemplo reproducible de un pipeline completo de clasificacion de texto (tokenizacion, fine-tuning, evaluacion con matriz de confusion y publicacion en Hugging Face) y como linea base ligera para tareas de analisis de sentimiento en ingles. No es un modelo de proposito general ni compite con modelos generativos; su valor esta en la simplicidad, el tamano reducido y la licencia permisiva MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT Base Uncased) |
| Parametros totales | 109.483.778 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 192 tokens (longitud maxima de secuencia configurada) |
| Tipos de cuantizacion | no disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con vocabulario uncased. Sobre la salida del encoder se anade una cabeza de clasificacion de dos clases (`AutoModelForSequenceClassification`). El ajuste fino se realizo durante 3 epocas, con batch size de 16, learning rate de 2e-5, weight decay de 0,01, 100 pasos de warmup, semilla 42 y longitud maxima de secuencia de 192 tokens. La metrica de seleccion del mejor checkpoint fue la precision de validacion.

El conjunto de entrenamiento procede del dataset IMDb Movie Reviews, con un total de 11.000 muestras divididas en 8.000 de entrenamiento, 1.000 de validacion y 2.000 de test. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un fine-tuning supervisado clasico con entropia cruzada. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal, ya que no aplican a esta arquitectura ni a esta tarea.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en resenas de cine en ingles.
- Generacion de puntuaciones de confianza por clase mediante softmax sobre los logits.
- Procesamiento de textos de hasta 192 tokens por muestra (truncado automatico).
- Integracion directa con el pipeline `text-classification` de Transformers.
- Compatibilidad con Text Embeddings Inference y endpoints compatibles segun las etiquetas del repositorio.
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en ingles.
- Tool calling / function calling: no soportado.
- Razonamiento multi-paso o modo agentico: no soportado.
- Vision, audio o modo thinking: no soportado.

## Casos de uso

- Clasificacion de resenas de cine en sitios web: el modelo recibe el texto de la resena y devuelve una etiqueta positiva o negativa con probabilidad asociada, adecuado por su ajuste especifico sobre el dominio IMDb.
- Filtrado de opiniones en aplicaciones de recomendacion: se puede usar para moderar o priorizar resenas segun su polaridad antes de mostrarlas, con un coste computacional bajo gracias a sus 109 millones de parametros.
- Proyectos educativos de NLP: sirve como ejemplo completo de pipeline de fine-tuning con Transformers, tokenizacion, evaluacion y despliegue, documentado paso a paso en el cuaderno de entrenamiento del autor.
- Prototipado rapido en Python y Streamlit: su tamano reducido y su carga via `AutoModelForSequenceClassification` permiten integrarlo en demos interactivas sin infraestructura GPU dedicada.
- Analisis de sentimiento como linea base: util para comparar contra modelos mas grandes o especializados en tareas de clasificacion de texto en ingles.
- Clasificacion por lotes en pipelines de datos: al ser un encoder ligero, puede procesar grandes volumenes de resenas en CPU con latencia aceptable para tareas offline.
- Etiquetado previo en sistemas de analisis de opinion: puede actuar como primer filtro de polaridad antes de un analisis mas profundo con modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas finales (accuracy, precision, recall, F1 y matriz de confusion) se obtienen al ejecutar las celdas de evaluacion del cuaderno y no se declaran valores numericos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,44 GB solo para pesos, mas activaciones y overhead del runtime; en la practica menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, A100, H100); el modelo no requiere GPU de datacenter.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: Transformers con PyTorch, Text Embeddings Inference (etiqueta `text-embeddings-inference`), endpoints compatibles y servidores de inferencia estandar de Hugging Face. No se documenta soporte explicito de llama.cpp, Ollama o vLLM en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un encoder de 109 millones de parametros, se espera una latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ullahhafeez321/bert-sentiment-classifier | 109.483.778 | 192 tokens | Clasificacion de sentimiento binaria (IMDb) | MIT | Hugging Face |
| google-bert/bert-base-uncased | 109.482.240 (aprox.) | 512 tokens | Modelo base preentrenado, sin cabeza de clasificacion | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66.955.010 (aprox.) | 512 tokens | Clasificacion de sentimiento binaria (SST-2) | Apache 2.0 | Hugging Face |
| roberta-base | 124.645.632 (aprox.) | 512 tokens | Modelo base preentrenado, sin cabeza de clasificacion | MIT | Hugging Face |

Nota: los datos de parametros y contexto de los modelos comparativos son valores de referencia de sus respectivas model cards publicas; no se dispone de comparaciones de rendimiento cuantitativas entre este modelo y las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido: el modelo fue ajustado exclusivamente sobre resenas de cine en ingles (IMDb) y puede degradarse en dominios como resenas de productos, noticias o redes sociales, tal como advierte el autor.
- Idioma: solo soporta ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Longitud de contexto limitada: la secuencia maxima configurada es de 192 tokens, inferior a los 512 tokens tipicos de BERT base; los textos mas largos se truncan y pueden perder informacion relevante.
- Dificultad con sarcasmo, ironia, lenguaje ambiguo y sentimiento mixto, segun la propia model card.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las probabilidades de salida no garantizan correccion; una confianza alta puede corresponder a una prediccion erronea.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre IMDb, puede heredar sesgos del corpus de resenas.
- Volumen de entrenamiento reducido: solo 8.000 muestras de entrenamiento, lo que limita la robustez frente a variaciones de estilo.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias de rendimiento en produccion.
- Sin metricas publicadas: no hay evidencia cuantitativa de calidad en el repositorio, por lo que cualquier uso en produccion requiere una evaluacion propia sobre el dominio objetivo.
- Repositorio con bajo uso (51 descargas, 0 likes): no hay validacion comunitaria ni reportes independientes de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ullahhafeez321/bert-sentiment-classifier
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset IMDb Movie Reviews: https://huggingface.co/datasets/stanfordnlp/imdb
- Repositorio del modelo (segun model card): https://huggingface.co/ullahhafeez321/bert-sentiment-classifier

# VENKATANISHNATH/imdb-sentiment-model

## Resumen

El modelo `VENKATANISHNATH/imdb-sentiment-model` es un clasificador de sentimiento binario (positivo/negativo) para reseñas de películas en inglés, desarrollado por el usuario VENKATANISHNATH como proyecto de aprendizaje. Se basa en la arquitectura `distilbert-base-uncased`, una versión destilada de BERT con aproximadamente 67 millones de parámetros, y se ha ajustado sobre un subconjunto reducido del dataset `stanfordnlp/imdb` (1.000 ejemplos de entrenamiento y 200 de evaluación). El modelo está diseñado para tareas de clasificación de texto y se distribuye en formato `safetensors`.

A pesar de su pequeño tamaño y de estar entrenado con una fracción mínima del dataset original, el modelo alcanza una precisión de validación del 79,5% en la tarea de análisis de sentimiento de reseñas. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un modelo transformer ligero, útil para entornos con recursos limitados o como punto de partida para experimentación. No obstante, su uso en producción es limitado debido a la escasez de datos de entrenamiento y a su enfoque exclusivo en el dominio de reseñas cinematográficas.

El repositorio no incluye información sobre benchmarks adicionales, métricas por clase, ni comparativas con otros modelos, por lo que la evaluación se limita a la precisión reportada en la validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens (arquitectura base), entrenado con max_length 128 |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (según modelo card) |
| Licencia | Apache-2.0 (según modelo card; la metadata de HuggingFace no la especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `distilbert-base-uncased`, una versión comprimida de BERT que reduce el número de capas de 12 a 6 y elimina los embeddings de segmento, manteniendo un rendimiento cercano al original con un 40% menos de parámetros. La arquitectura es un transformer encoder estándar con atención multi-cabeza, normalización de capas y conexiones residuales. Al ser un modelo denso, todos los parámetros se utilizan en cada inferencia.

El entrenamiento se realizó mediante fine-tuning sobre el dataset `stanfordnlp/imdb`, pero utilizando únicamente 1.000 ejemplos para entrenamiento y 200 para validación, durante 3 épocas y con una longitud máxima de entrada de 128 tokens. No se especifica el optimizador, la tasa de aprendizaje ni otras hiperparámetros. No se menciona el uso de técnicas como RLHF, DPO o aumentación de datos. La precisión de validación reportada es del 79,5%, un valor moderado dado el reducido conjunto de entrenamiento.

## Capacidades

- Clasificación binaria de sentimiento: asigna etiquetas `LABEL_0` (negativo) y `LABEL_1` (positivo) a textos de entrada.
- Procesamiento de texto en inglés, especialmente reseñas de películas o textos con estilo similar.
- Inferencia rápida gracias al tamaño reducido del modelo (67M parámetros), apto para CPU y GPU de baja gama.
- Integración sencilla con la librería `transformers` de HuggingFace mediante la carga de pesos en formato `safetensors`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Análisis de opiniones de usuarios en plataformas de reseñas: el modelo puede clasificar comentarios de películas, series o productos como positivos o negativos, permitiendo a las empresas monitorizar la satisfacción del cliente de forma automática.
- Filtrado de contenido en foros o redes sociales: se puede integrar en pipelines de moderación para detectar críticas negativas y priorizar respuestas de atención al cliente.
- Prototipado rápido de sistemas de análisis de sentimiento: gracias a su pequeño tamaño, es útil para validar flujos de trabajo de NLP en entornos de desarrollo o educación antes de escalar a modelos más grandes.
- Análisis de tendencias de mercado: las empresas pueden procesar lote de reseñas de productos para extraer señales de aceptación o rechazo, aunque con la limitación de que el modelo solo cubre un dominio específico.
- Experimentación académica: sirve como ejemplo didáctico de fine-tuning de DistilBERT, permitiendo a estudiantes comprender el proceso de ajuste de un transformer para una tarea concreta.
- Inferencia en dispositivos con recursos limitados: al ocupar solo 0.3 GB en disco y requerir poca memoria, puede ejecutarse en Raspberry Pi o en la nube con instancias de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la precisión de validación del 79,5% sobre un conjunto de 200 ejemplos del dataset IMDB. No se proporcionan métricas como F1, precisión por clase, matriz de confusión ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 67M parámetros, en FP32 ocupa aproximadamente 268 MB; en FP16 se reduce a ~134 MB. Puede ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2050) es suficiente. Para mayor velocidad se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU moderna e incluso en CPU sin problemas de latencia significativa.
- Opciones de despliegue: se puede servir con `transformers` (PyTorch), `ONNX Runtime`, `TensorRT`, o mediante frameworks como `vLLM` (aunque no es óptimo para modelos tan pequeños). También es compatible con `Ollama` si se convierte a formato GGUF, aunque no se proporciona ese formato.
- Latencia y throughput: no se han medido oficialmente. En CPU, una inferencia tarda típicamente entre 5 y 20 ms por texto corto; en GPU, menos de 1 ms.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros modelos de la misma categoría en la búsqueda web. Se mencionan repositorios similares como `amarshiv86/sentiment-analysis-imdb-model` y `thundarain018/imdb-sentiment-model`, pero no se ofrecen métricas comparables. Como referencia, el modelo base `distilbert-base-uncased` sin fine-tuning no está entrenado para clasificación de sentimiento, y el modelo original `bert-base-uncased` tiene 110M parámetros. La comparativa queda pendiente de datos públicos.

| Modelo | Parámetros | Contexto | Precisión validación | Licencia |
|---|---|---|---|---|
| VENKATANISHNATH/imdb-sentiment-model | 66,9M | 512 | 79,5% | Apache-2.0 |
| distilbert-base-uncased (base sin fine-tuning) | 66,9M | 512 | No aplica | Apache-2.0 |
| bert-base-uncased | 110M | 512 | No disponible | Apache-2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con solo 1.000 ejemplos del dataset IMDB, el modelo puede tener un sesgo hacia el estilo de reseñas de películas en inglés, y podría fallar en textos con vocabulario técnico, coloquialismos o jerga específica.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación es bajo. Sin embargo, puede asignar etiquetas incorrectas en textos ambiguos, sarcásticos o con doble sentido.
- Limitaciones de contexto: la longitud máxima de entrada es de 128 tokens durante el entrenamiento, aunque la arquitectura soporta 512. Textos más largos se truncarán, perdiendo información relevante.
- Limitaciones de idioma: solo está entrenado para inglés. No funciona con otros idiomas.
- Restricciones de licencia: aunque el modelo card indica Apache-2.0, la metadata de HuggingFace no la especifica, por lo que se recomienda contactar al autor para confirmar la licencia antes de uso comercial.
- Advertencia para producción: el modelo es un proyecto de aprendizaje con un rendimiento moderado y un dominio muy específico. No es adecuado para aplicaciones críticas sin un fine-tuning adicional con datos más representativos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/VENKATANISHNATH/imdb-sentiment-model)
- [Dataset IMDB (stanfordnlp/imdb)](https://huggingface.co/datasets/stanfordnlp/imdb)
- [Modelo base DistilBERT](https://huggingface.co/distilbert-base-uncased)

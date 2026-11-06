# Zubair-Dashti/distilbert-imdb-sentiment

## Resumen

DistilBERT IMDB Sentiment es un modelo de clasificación de texto ajustado para análisis de sentimiento binario en reseñas de películas en inglés. Lo desarrolla el usuario Zubair-Dashti y se publica bajo licencia Apache 2.0 en Hugging Face. El modelo parte de la arquitectura DistilBERT, una versión destilada de BERT que reduce el número de capas y parámetros manteniendo una parte importante de las capacidades del modelo original, lo que lo hace adecuado para inferencia rápida y con requisitos de hardware modestos.

El modelo resuelve la tarea concreta de clasificar un fragmento de texto como positivo o negativo, típicamente en el dominio de reseñas de películas (dataset IMDB). Con 66.955.010 parámetros (aproximadamente 67 millones), se sitúa en la gama ligera de modelos transformer y puede ejecutarse en CPU o en GPUs de consumo sin dificultad. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors.

Es relevante para desarrolladores que necesitan un clasificador de sentimiento rápido, de bajo coste computacional y con licencia permisiva para integrarlo en pipelines de análisis de opiniones, moderación de contenido o enriquecimiento de datos. No obstante, la información publicada por el autor es mínima (la model card solo contiene metadatos YAML), por lo que muchos detalles técnicos y de rendimiento no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por diseño, no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de tipo BERT reducido mediante destilación de conocimiento: conserva aproximadamente la mitad de las capas del BERT-base original y reduce el número de parámetros en torno al 40 %, manteniendo una parte sustancial del rendimiento en tareas de comprensión del lenguaje. El modelo base DistilBERT se preentrena con destilación sobre un corpus de texto en inglés, y este checkpoint concreto se ha ajustado para clasificación de sentimiento (text-classification) con dos etiquetas.

No se dispone de información publicada sobre el número de tokens de ajuste, la composición exacta del dataset de entrenamiento (presumiblemente reseñas IMDB, dado el nombre del modelo), ni sobre si se aplicaron técnicas de RLHF, DPO u otras variantes de alineación. Tampoco se documentan innovaciones técnicas adicionales más allá de la propia destilación inherente a DistilBERT. La model card únicamente incluye metadatos YAML y ejemplos de widget.

## Capacidades

- Clasificación de texto binaria para análisis de sentimiento (positivo/negativo).
- Especializado en el dominio de reseñas de películas en inglés (IMDB).
- Inferencia rápida y ligera gracias al tamaño reducido de DistilBERT.
- Ejecutable en CPU y en GPUs de consumo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de opiniones de clientes: clasificar automáticamente reseñas de productos o películas como positivas o negativas para agregar métricas de satisfacción en dashboards.
- Moderación de contenido: filtrar comentarios de usuarios con sentimiento negativo extremo para revisión humana en foros o plataformas de reseñas.
- Enriquecimiento de datasets: etiquetar grandes volúmenes de texto no estructurado con polaridad de sentimiento para análisis posteriores o entrenamiento de modelos.
- Monitorización de reputación de marca: procesar menciones y reseñas en inglés para detectar tendencias de opinión negativas de forma temprana.
- Preprocesado en pipelines de NLP: usar el clasificador como primer filtro antes de modelos generativos más costosos, reduciendo el volumen de texto a procesar.
- Análisis de reseñas cinematográficas: caso de uso directo para el que el modelo parece entrenado, útil en sistemas de recomendación o estudios de crítica.
- Clasificación en entornos con recursos limitados: despliegue en dispositivos edge o servidores sin GPU gracias a sus 67 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (67 M de parámetros × 4 bytes ≈ 268 MB), aproximadamente 130-270 MB según cuantización.
- GPU recomendadas: cualquier GPU moderna; funciona bien en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque el modelo es tan pequeño que la GPU no es imprescindible.
- Cabe en cualquier GPU de consumo e incluso en CPU con latencia aceptable.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, Text Embeddings Inference (TEI), o exportación a otros runtimes; compatible con pipelines de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zubair-Dashti/distilbert-imdb-sentiment | 66,9 M | no disponible | apache-2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | apache-2.0 | Hugging Face |
| bert-base-uncased | ~110 M | 512 tokens | apache-2.0 | Hugging Face |
| roberta-base | ~125 M | 512 tokens | mit | Hugging Face |

Los modelos comparables son alternativas de la misma familia y tamaño; no se dispone de datos de rendimiento de este checkpoint para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; los modelos entrenados en IMDB pueden heredar sesgos del corpus de reseñas.
- Riesgo de alucinación: no aplica de forma directa al ser un clasificador, pero puede producir clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- Limitaciones de contexto o idioma: solo inglés; la longitud máxima de entrada no está confirmada en la model card (DistilBERT admite hasta 512 tokens).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el entrenamiento.
- Caveats para producción: la model card es prácticamente vacía; no hay información sobre el dataset de ajuste, métricas de validación ni procedencia de los datos, lo que dificulta evaluar su fiabilidad. Se recomienda validar el modelo en el dominio objetivo antes de desplegarlo.
- El modelo tiene muy pocas descargas (32) y cero likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Zubair-Dashti/distilbert-imdb-sentiment

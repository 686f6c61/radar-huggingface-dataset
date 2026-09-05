# vltruong01/amazon-all-beauty-led-large-summarization

## Resumen

El modelo `vltruong01/amazon-all-beauty-led-large-summarization` es un sistema de resumen abstractivo de reseñas de productos, desarrollado por el usuario vltruong01. Está construido sobre la arquitectura Longformer Encoder-Decoder (LED) y parte del modelo base `allenai/led-large-16384`, con el que comparte sus 459,85 millones de parámetros y su ventana de contexto de hasta 16.384 tokens. Este modelo ha sido ajustado específicamente para el dominio de Amazon Reviews 2023, categoría All_Beauty, con el objetivo de generar un único resumen consensuado a partir de múltiples reseñas de un mismo producto.

El problema que resuelve es la síntesis de opiniones de clientes a nivel de producto: en lugar de leer decenas de reseñas, el modelo produce un texto natural que condensa la opinión mayoritaria, los puntos positivos y negativos recurrentes y las quejas minoritarias significativas. Su relevancia radica en el creciente volumen de reseñas en comercio electrónico y en la necesidad de automatizar la extracción de información útil para consumidores y equipos de producto.

Durante el ajuste, la longitud máxima de fuente se limitó a 4.096 tokens y la salida a 192, aunque la arquitectura LED soporta contextos mucho mayores. El modelo es exclusivamente de texto y está orientado a la tarea de summarization, con soporte para entradas largas mediante la asignación de atención global a elementos estructurales como el título del producto y las cabeceras de cada reseña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Longformer Encoder-Decoder (LED) |
| Parametros totales | 459.851.865 |
| Longitud de contexto | 16.384 tokens (capacidad base); 4.096 tokens como longitud máxima de fuente en el ajuste fino |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LED es una variante de Longformer con arquitectura encoder-decoder. El encoder usa atención dispersa local (tipo ventana) combinada con atención global en tokens seleccionados, lo que reduce el coste computacional de O(n²) a O(n) en el encoder, manteniendo un contexto de 16.384 tokens. En este ajuste se asigna atención global al primer token, a todos los tokens de la línea `Product: <título>`, al primer token de cada cabecera `[Review N]` y al primer token de cada línea `Rating: X/5`. Esto permite que el modelo acceda fácilmente a la identidad del producto y a la estructura de cada reseña a lo largo de entradas largas.

El entrenamiento se realizó en un dataset propio (`vltruong01/amazon-all-beauty-led-summarization`) derivado de Amazon Reviews 2023. Tras un filtrado de control de calidad se obtuvieron 1.959 ejemplos limpios, divididos en 1.567 de entrenamiento, 196 de validación y 196 de prueba. El modelo se ajustó completamente durante 3 épocas con una tasa de aprendizaje de 1e-5 y un tamaño de lote efectivo de 8, en precisión FP16 y con activación de gradient checkpointing. Un aspecto destacable es que los textos de referencia para el entrenamiento fueron generados sintéticamente por un modelo GPT «teacher» bajo un prompt restringido, y solo se usaron para construir los objetivos; el modelo desplegado no incluye ese profesor. Esto afecta a la interpretación de las métricas de evaluación, que comparan con resúmenes sintéticos y no con referencias humanas.

La generación de inferencia usa beam search con 6 beams, penalización de repetición de 1.05 y no repetición de n-gramas de tamaño 3, para producir salidas coherentes y sin duplicados.

## Capacidades

- Generación de resúmenes abstractivos: el modelo genera un resumen en lenguaje natural que sintetiza el consenso de múltiples reseñas de un mismo producto.
- Manejo de entradas largas: gracias a la arquitectura LED y a la atención global estructurada, procesa hasta 4.096 tokens de entrada en su configuración de ajuste, con la posibilidad de extenderse hasta 16.384 tokens.
- Comprensión de la estructura de las reseñas: está entrenado para interpretar un formato de entrada específico con `[Review N]`, `Rating: X/5` y `Title`, extrayendo tanto opiniones mayoritarias como quejas minoritarias.
- Enfoque de dominio: al haber sido ajustado exclusivamente con reseñas de la categoría All_Beauty de Amazon Reviews 2023, su vocabulario y estilo están adaptados a ese dominio.
- No incluye capacidades de tool calling, agentes, visión ni audio: es un modelo puramente textual de summarization.

## Casos de uso

- Análisis de reseñas en comercio electrónico: el modelo resume automáticamente las opiniones de un producto en un párrafo coherente, permitiendo a los clientes decidir con rapidez sin leer decenas de reseñas.
- Monitorización de producto para gestores de marca: condensa el feedback de cientos de compradores en puntos positivos y negativos recurrentes, facilitando la detección de problemas de calidad o de packaging.
- Generación de contenido para fichas de producto: el resumen puede usarse como texto descriptivo de la sección «opiniones de clientes» sin redacción manual, en plataformas de e-commerce o catálogos.
- Análisis de competencia: al aplicar el modelo a reseñas de productos de la competencia, se obtienen rápidamente fortalezas y debilidades expresadas por los usuarios.
- Investigación de mercado: resumir opiniones sobre distintas subcategorías (p. ej., cuidado de la piel, maquillaje) para identificar tendencias de consumo y demandas recurrentes.
- Mejora de sistemas de recomendación: el resumen generado puede incorporarse como representación semántica de la opinión del producto en motores de recomendación basados en texto, enriqueciendo las señales de relevancia.

## Benchmarks y rendimiento

El rendimiento se evaluó sobre 196 ejemplos de un conjunto de prueba separado. Es importante destacar que las métricas se calcularon contra resúmenes sintéticos generados por un modelo teacher, no contra referencias humanas.

| Metrica | Valor (test) |
|---|---|
| ROUGE-1 | 0,4806 |
| ROUGE-2 | 0,1607 |
| ROUGE-L | 0,3264 |
| ROUGE-Lsum | 0,3263 |
| BERTScore Precision | 0,9074 |
| BERTScore Recall | 0,9052 |
| BERTScore F1 | 0,9062 |
| Perdida de validacion | 2,6452 |
| Perdida de test | 2,6579 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

Estimaciones propias basadas en el tamaño del modelo y la arquitectura; no hay mediciones oficiales en los recursos consultados.

- VRAM estimada para inferencia: en FP16, el modelo ocupa aproximadamente 0,9 GB, pero con activaciones, logits y batch 1 a 4.096 tokens se recomienda al menos 6 GB de VRAM.
- GPU recomendadas: cualquier NVIDIA con 8 GB o más, como RTX 3060, RTX 3060 Ti, RTX 4070, A4 o superiores.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en una RTX 3060 de 12 GB. En entornos de producción con beam search y batched inference, son preferibles GPUs con más memoria, como A10 o L4.
- Opciones de despliegue: Transformers, vLLM, TGI o cualquier framework compatible con arquitecturas seq2seq. El modelo se distribuye como safetensors; para usarlo con llama.cpp u Ollama sería necesario convertirlo previamente a GGUF, aunque la arquitectura LED está menos soportada en estos entornos.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen datos de comparacion con otros modelos de resumen de reseñas.

## Limitaciones y advertencias

- Sesgos: el modelo fue entrenado solo en la categoría All_Beauty de Amazon Reviews 2023, por lo que puede contener sesgos específicos de este conjunto de datos y generalizar mal a otros dominios de producto.
- Riesgo de alucinacion: los objetivos de entrenamiento son resúmenes sintéticos generados por un modelo GPT teacher, lo que puede llevar al modelo a reproducir patrones del profesor en lugar de afirmaciones estrictamente respaldadas por las reseñas.
- Limitaciones de idioma: el modelo solo está entrenado y evaluado en inglés; no está preparado para entradas en otros idiomas.
- Limitación de contexto práctica: aunque la arquitectura soporta 16.384 tokens, el ajuste fino se realizó con 4.096. Utilizar entradas mayores puede degradar el rendimiento si no se respeta la estructura de atención global aprendida.
- Licencia: desconocida. Antes de un uso comercial conviene revisar la licencia del modelo base y los términos de uso del dataset de Amazon Reviews 2023.
- Restricciones de datos: el conjunto de datos procede de Amazon Reviews 2023, que puede estar sujeto a condiciones específicas de distribución y uso.

## Enlaces

- Modelo en HuggingFace: [vltruong01/amazon-all-beauty-led-large-summarization](https://huggingface.co/vltruong01/amazon-all-beauty-led-large-summarization)
- Dataset de entrenamiento: [vltruong01/amazon-all-beauty-led-summarization](https://huggingface.co/datasets/vltruong01/amazon-all-beauty-led-summarization)
- Modelo base: [allenai/led-large-16384](https://huggingface.co/allenai/led-large-16384)

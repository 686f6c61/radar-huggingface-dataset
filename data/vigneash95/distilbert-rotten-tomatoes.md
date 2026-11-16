# Vigneash95/distilbert-rotten-tomatoes

## Resumen

Vigneash95/distilbert-rotten-tomatoes es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, la variante destilada de BERT desarrollada por Hugging Face. El modelo se ha entrenado para una tarea de clasificación binaria sobre reseñas de la plataforma Rotten Tomatoes, presumiblemente predicción de sentimiento (positivo o negativo), aunque la model card no documenta explícitamente el dataset de entrenamiento ni el mapeo de etiquetas.

Se trata de un modelo compacto de 66.955.010 parámetros (aproximadamente 67 millones), con una arquitectura transformer encoder de 6 capas y una ventana de contexto de 512 tokens, coherente con la familia DistilBERT. Su relevancia práctica radica en su bajo coste computacional: puede ejecutarse en CPU con latencias de milisegundos y desplegarse en entornos con recursos muy limitados, lo que lo hace útil como clasificador de sentimiento ligero en pipelines de procesamiento de reseñas.

El modelo se publicó en noviembre de 2026 bajo licencia Apache 2.0 y no registra descargas ni interacciones en el momento de la consulta. Es un artefacto de fine-tuning experimental, sin documentación complementaria sobre datos, metodología de evaluación o limitaciones, lo que condiciona su uso en producción sin una validación previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, 12 cabezas de atención, dimensión oculta 768 |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; compatible con cuantización dinámica vía PyTorch y con conversión a ONNX) |
| Idiomas soportados | no disponible (el modelo base es uncased en inglés; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de distilbert-base-uncased, un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT-base (12 capas, 110 millones de parámetros). DistilBERT conserva el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y un 60 % más de velocidad de inferencia. La cabeza de clasificación se ha reentrenado para la tarea específica de Rotten Tomatoes.

El fine-tuning se realizó durante 2 épocas con un learning rate de 2e-05, batch size de entrenamiento de 16, batch de evaluación de 32, semilla 42, optimizador AdamW fused (betas 0.9/0.999, epsilon 1e-08) y scheduler lineal. El conjunto de entrenamiento procesó 1.068 pasos en total (534 pasos por época). No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo aumentación de datos ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un clasificador). Las versiones de framework empleadas fueron Transformers 5.23.0, PyTorch 2.15.0, Datasets 5.2.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria o multiclase (la model card no especifica el número exacto de etiquetas) sobre reseñas de cine del dominio Rotten Tomatoes.
- Inferencia rápida en CPU y GPU de gama baja gracias a sus 67 millones de parámetros.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para reseñas de longitud media.
- Compatibilidad con la librería transformers y con text-embeddings-inference (según los tags del repositorio).
- Compatibilidad con endpoints de Hugging Face (tag endpoints_compatible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento extendido: es un clasificador discriminativo, no un modelo generativo.
- Capacidades multilingües no documentadas; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de cine: el modelo clasifica reseñas de Rotten Tomatoes en positivas o negativas, adecuado para agregar opiniones de usuarios en plataformas de contenido audiovisual.
- Moderación de comentarios en foros de cine: permite filtrar o priorizar reseñas con sentimiento negativo para revisión humana, con coste de inferencia mínimo en CPU.
- Enriquecimiento de datasets de opinión: clasificación masiva de corpus de reseñas para construir índices de sentimiento por película o por franquicia.
- Monitorización de reputación de estrenos: procesamiento por lotes de reseñas recientes para generar métricas de sentimiento agregado por título.
- Preetiquetado en pipelines de anotación: el modelo sirve como primer paso de etiquetado automático que luego se corrige manualmente, reduciendo el coste de anotación.
- Clasificación en dispositivos de borde: al ocupar unos 0,3 GB en safetensors y poder cuantizarse, es viable en Raspberry Pi o contenedores sin GPU para tareas de filtrado en tiempo real.
- Prototipado rápido de clasificadores de dominio: sirve como línea base para comparar con modelos más grandes antes de invertir en fine-tuning de mayor escala.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación durante el entrenamiento):

| Metrica | Epoca 1 (paso 534) | Epoca 2 (paso 1068) |
|---|---|---|
| Training loss | 0.4231 | 0.2554 |
| Validation loss | 0.3946 | 0.3852 |
| Accuracy | 0.8340 | 0.8527 |

El model-index del repositorio no contiene resultados adicionales (lista vacía). No se han publicado resultados de benchmarks estándar (MMLU, GLUE, SST-2, etc.) en la información disponible, por lo que no es posible comparar con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB para los pesos (67 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,14 GB para los pesos.
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060 y superiores; también en iGPU y CPU.
- GPU recomendadas para despliegue de alto throughput: T4, L4, A10G o A100 si se procesan lotes grandes; para uso individual, cualquier GPU con más de 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, ONNX Runtime, Hugging Face Inference Endpoints, y conversión a llama.cpp no aplicable (no es un modelo generativo). vLLM y TGI no están optimizados para clasificadores de este tamaño, aunque TGI puede servir modelos de clasificación.
- Latencia estimada: del orden de milisegundos por muestra en CPU moderna y por debajo del milisegundo en GPU para lotes pequeños; no se dispone de cifras oficiales de throughput publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vigneash95/distilbert-rotten-tomatoes | 66,9 M | 512 | Clasificación de sentimiento (Rotten Tomatoes) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Clasificación de sentimiento (SST-2) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 | Representaciones generales (requiere fine-tuning) | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Representaciones generales (requiere fine-tuning) | MIT | Hugging Face |

Frente a distilbert-base-uncased-finetuned-sst-2-english, el modelo aquí descrito está especializado en el dominio de Rotten Tomatoes, pero carece de documentación sobre su dataset y de evaluación en benchmarks públicos, mientras que la variante SST-2 cuenta con métricas estándar y amplia validación comunitaria. Frente a bert-base-uncased y roberta-base, este modelo ofrece menor coste de inferencia a cambio de menor capacidad de representación y menor versatilidad fuera del dominio de reseñas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el número de ejemplos, el mapeo de etiquetas ni el proceso de limpieza de datos, lo que impide auditar el modelo.
- No se han publicado métricas en benchmarks estándar; la única referencia es una accuracy de 0,8527 en el conjunto de validación propio, sin información sobre su composición.
- Riesgo de sobreajuste al dominio de Rotten Tomatoes: el rendimiento puede degradarse fuera de reseñas de cine o con estilos de escritura distintos.
- El modelo base es uncased y está entrenado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Ventana de contexto limitada a 512 tokens: reseñas más largas se truncan, lo que puede perder información relevante.
- Posibles sesgos heredados de distilbert-base-uncased (datos de entrenamiento de Wikipedia y BookCorpus) y del corpus de Rotten Tomatoes, no evaluados por el autor.
- Riesgo de clasificaciones erróneas en textos sarcásticos, irónicos o con sentimiento mixto, habitual en críticas cinematográficas.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de documentación y evaluación hace recomendable una validación exhaustiva con datos propios antes de desplegarlo en producción.
- El repositorio no registra descargas ni validación comunitaria; es un artefacto experimental sin mantenimiento conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vigneash95/distilbert-rotten-tomatoes
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de DistilBERT (paper): https://arxiv.org/abs/1910.01108
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference

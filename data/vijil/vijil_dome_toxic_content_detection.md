# vijil/vijil_dome_toxic_content_detection

## Resumen

Vijil Dome Toxic Content Detection es un modelo de clasificación de texto especializado en la detección de contenido tóxico, desarrollado por Vijil y publicado en Hugging Face bajo el identificador `vijil/vijil_dome_toxic_content_detection`. Forma parte de la familia Dome de Vijil, orientada a tareas de seguridad y moderación de contenido en pipelines de IA generativa. El modelo se distribuye en formato safetensors con 149.606.402 parámetros (aproximadamente 150 millones), lo que lo sitúa en la categoría de modelos encoder de tamaño medio, adecuados para inferencia de baja latencia en producción.

La arquitectura declarada en los metadatos es ModernBERT, un transformer encoder moderno que incorpora mejoras sobre BERT clásico como atención con RoPE, Flash Attention y contextos más largos. El pipeline es `text-classification`, por lo que el modelo devuelve etiquetas o puntuaciones de toxicidad sobre un texto de entrada, no genera texto libre. Está pensado para integrarse en sistemas de moderación, filtrado y evaluación de seguridad de aplicaciones LLM.

Su relevancia actual radica en la creciente demanda de clasificadores de seguridad ligeros y desplegables en infraestructura propia, que permitan filtrar entradas y salidas de modelos generativos sin depender de APIs externas. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face, lo que condiciona su uso en producción. No se dispone de información pública sobre licencia, idiomas soportados ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.606.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,6 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura ModernBERT, una evolución del transformer encoder bidireccional clásico que incorpora rotatory position embeddings (RoPE), atención con Flash Attention, capas de normalización pre-norm y una mezcla de atención local y global para manejar secuencias largas con menor coste computacional. Con 149,6 millones de parámetros, se sitúa en el rango de ModernBERT-base, lo que permite inferencia rápida incluso en CPU y GPUs de gama media.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de las categorías de toxicidad ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de la arquitectura ModernBERT. La información disponible se limita a los metadatos del repositorio de Hugging Face.

## Capacidades

- Clasificación de texto para detección de contenido tóxico, devolviendo etiquetas o puntuaciones de probabilidad.
- Integración con la librería `transformers` mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con Text Embeddings Inference (TEI) y con endpoints compatibles según los tags del repositorio.
- Diseñado para moderación de entradas y salidas en pipelines de IA generativa.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes, dado que es un clasificador.
- No se dispone de información sobre capacidades multilingües ni sobre modos especiales (thinking mode, etc.).

## Casos de uso

- Moderación de entradas en chatbots: el clasificador se ejecuta sobre el mensaje del usuario antes de pasarlo al LLM generativo, bloqueando o marcando contenido tóxico con baja latencia gracias a sus ~150 M de parámetros.
- Filtrado de salidas de modelos generativos: se aplica como capa posterior al LLM para detectar respuestas tóxicas antes de mostrarlas al usuario final, integrándose en un pipeline de post-procesado.
- Evaluación de seguridad en pipelines de CI/CD: se puede usar como test automático que puntúa conjuntos de prompts y respuestas para detectar regresiones de toxicidad en nuevas versiones de un modelo o sistema.
- Moderación de comunidades y foros: clasificación por lotes de comentarios y publicaciones para priorizar revisiones humanas o aplicar acciones automáticas según umbrales de toxicidad.
- Investigación en seguridad de IA: generación de métricas cuantitativas de toxicidad sobre datasets de evaluación, comparando modelos o configuraciones de prompting.
- Enriquecimiento de datasets: etiquetado automático de grandes corpus de texto para construir datasets de entrenamiento o evaluación filtrados por toxicidad.
- Despliegue en infraestructura propia: al ser un encoder de ~0,6 GB en safetensors, puede servirse con TEI o con transformers en contenedores ligeros sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos más overhead de activaciones, en torno a 1-2 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB de pesos, con overhead total por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A10, L4, A100 o H100 son suficientes y sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: `transformers` (PyTorch), Text Embeddings Inference (TEI) según los tags, y servidores compatibles con endpoints de Hugging Face. No se documenta soporte explícito de llama.cpp, Ollama o vLLM, aunque al ser un encoder podría adaptarse a algunos de ellos.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por petición en GPU y throughput alto en batching, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| vijil/vijil_dome_toxic_content_detection | 149,6 M | no disponible | Clasificación de toxicidad | no disponible | Restringido (gated) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de detección de toxicidad, ya que la ficha proporcionada no incluye datos de rendimiento ni detalles de licencia de este modelo ni de posibles competidores.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos del modelo; como clasificador de toxicidad, es probable que herede sesgos de los datos de entrenamiento, pero no hay documentación pública al respecto.
- Riesgo de falsos positivos y falsos negativos inherente a la moderación automática; se recomienda calibrar umbrales con datos propios antes de producción.
- No se documentan los idiomas soportados; el uso en castellano u otros idiomas distintos del inglés no está garantizado.
- La licencia no está disponible en la información proporcionada; el acceso es restringido (gated) y requiere aceptar condiciones, lo que puede limitar el uso comercial y la redistribución.
- No se publican resultados de benchmarks ni métricas de evaluación, lo que dificulta comparar su rendimiento con alternativas.
- Al ser un clasificador encoder, no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- No se documenta la longitud máxima de contexto; textos muy largos podrían requerir truncado.
- El repositorio tiene pocas descargas (513) y cero likes, lo que sugiere una adopción limitada y escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/vijil/vijil_dome_toxic_content_detection
- Paper de referencia citado en los tags (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification

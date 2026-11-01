# verasajin97/distilbert-base-uncased-finetuned-emotion

## Resumen

`verasajin97/distilbert-base-uncased-finetuned-emotion` es un modelo de clasificación de texto derivado de DistilBERT, la variante destilada del transformer encoder de BERT. Lo publica el usuario de HuggingFace verasajin97 como resultado de un fine-tuning con la librería `transformers` sobre un conjunto de datos de emociones que el autor no especifica (la model card indica "unknown dataset"). El modelo resuelve una tarea concreta: asignar una etiqueta de emoción a un texto de entrada en inglés, con una precisión declarada del 92,45 % en el conjunto de evaluación.

Se trata de un modelo pequeño (66,96 millones de parámetros, unos 0,3 GB de pesos en safetensors) pensado para inferencia ligera y de bajo coste. La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 66 M de parámetros, destilado de BERT-base, con un tokenizador WordPiece sin distinción de mayúsculas (`uncased`). No es un modelo generativo ni conversacional; es un clasificador de secuencia.

Su relevancia es práctica: sirve como ejemplo de fine-tuning rápido de DistilBERT para análisis de sentimiento o emociones, y por su tamaño puede desplegarse en CPU o en GPUs de consumo con latencias de milisegundos. Ahora bien, la documentación es mínima (la propia model card está generada automáticamente y contiene secciones "More information needed"), el número de descargas es muy bajo (22) y no hay métricas de benchmark publicadas más allá de las de validación del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT/BERT) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors se puede cuantizar a int8/fp16 con herramientas estándar) |
| Idiomas soportados | no disponible (el tokenizador es `uncased` en inglés; se asume inglés, sin confirmación del autor) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 M de parámetros obtenido por destilación de conocimiento de BERT-base (12 capas, 110 M de parámetros). DistilBERT reduce el tamaño aproximadamente un 40 % y conserva alrededor del 97 % del rendimiento de BERT en tareas de comprensión del lenguaje, según los resultados originales de Sanh et al. (2019). La cabeza de clasificación se ha reentrenado para la tarea de emociones.

Los hiperparámetros de entrenamiento declarados son: learning rate 2e-5, batch size de 64 (entrenamiento y evaluación), 2 épocas, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y semilla 42. El entrenamiento se ejecutó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La pérdida de entrenamiento bajó de 0,8039 a 0,2404 entre la época 1 y la 2, y la pérdida de validación de 0,2968 a 0,2085. No se documenta el dataset, el número de tokens de entrenamiento, la composición del corpus ni si hubo técnicas de alineación (RLHF/DPO). Tampoco se describe ninguna innovación técnica adicional más allá del fine-tuning estándar.

## Capacidades

- Clasificación de texto en una única etiqueta de emoción por secuencia (tarea `text-classification`).
- Análisis de sentimiento y detección de emociones en textos cortos en inglés (asumiendo el idioma del tokenizador base).
- Inferencia rápida en CPU y GPU de consumo gracias a sus 66 M de parámetros.
- Integración directa con el pipeline `transformers` y con `text-embeddings-inference` (según los tags del repositorio).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües; el tokenizador `uncased` está orientado a inglés.
- No dispone de modo "thinking", audio ni multimodalidad.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificar cada reseña en una categoría emocional para agregar métricas de satisfacción por producto o por canal. El modelo es adecuado por su bajo coste y su latencia de milisegundos en CPU.
- Moderación de comentarios en foros y redes: detectar emociones negativas o hostiles en textos cortos para priorizar la revisión humana. La ventana de 512 tokens cubre la mayoría de comentarios.
- Enrutamiento de tickets de soporte: etiquetar el tono emocional de un ticket entrante (frustración, satisfacción, neutralidad) para asignarlo al equipo adecuado o activar protocolos de escalado.
- Análisis de encuestas de satisfacción (NPS, CSAT): procesar respuestas abiertas de clientes y agruparlas por emoción para informes periódicos. El modelo puede ejecutarse en lote sobre miles de respuestas en minutos.
- Investigación en ciencias sociales y psicolingüística: anotar corpus de textos con etiquetas emocionales como paso previo a análisis estadísticos, siempre que se valide la calidad del etiquetado en el dominio concreto.
- Preprocesado en pipelines de NLP más amplios: usar la etiqueta emocional como feature adicional en un sistema de recomendación o de priorización de contenido.
- Clasificación en dispositivos con recursos limitados: al pesar 0,3 GB, puede desplegarse en entornos edge o en contenedores pequeños sin GPU dedicada.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados de benchmarks publicados (lista `results` vacía). Los únicos datos disponibles son las métricas de validación del entrenamiento declaradas en la model card:

| Métrica | Época 1 | Época 2 (final) |
|---|---|---|
| Pérdida de entrenamiento | 0,8039 | 0,2404 |
| Pérdida de validación | 0,2968 | 0,2085 |
| Accuracy (validación) | 0,9100 | 0,9245 |
| F1 (validación) | 0,9097 | 0,9243 |

No se han publicado resultados de benchmarks en la información disponible (MMLU, GLUE, etc. no están presentes). No se dispone de comparaciones con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB para los pesos (66,96 M parámetros × 4 bytes) más overhead de activaciones y del runtime, en torno a 0,5-1 GB en total.
- VRAM estimada en fp16: aproximadamente 0,13 GB para los pesos; en int8, unos 0,07 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no aprovecha GPUs de gama alta por su tamaño.
- Cabe en cualquier GPU de consumo e incluso en CPU: la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: pipeline de `transformers`, `text-embeddings-inference` (según los tags), ONNX Runtime, y cuantización con herramientas estándar (por ejemplo, `optimum`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama, aunque al ser un encoder pequeño podría convertirse a GGUF con herramientas de la comunidad.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera una latencia de pocos milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|---|
| verasajin97/distilbert-base-uncased-finetuned-emotion | 66,96 M | 512 tokens | apache-2.0 | Clasificación de emociones | HuggingFace (22 descargas) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | apache-2.0 | Análisis de sentimiento (positivo/negativo) | HuggingFace (muy popular) |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 tokens | apache-2.0 | Clasificación de emociones (6 clases) | HuggingFace |
| roberta-base-go_emotions | ~125 M | 512 tokens | MIT | Clasificación de emociones (28 clases) | HuggingFace |

La comparativa se basa en modelos de la misma categoría (encoders pequeños para clasificación de sentimiento/emociones). No se dispone de métricas comparables publicadas para este modelo concreto frente a las alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. El modelo de verasajin97 tiene muy poca tracción (22 descargas, 0 likes) frente a alternativas consolidadas de la comunidad.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "unknown dataset", por lo que se desconoce la composición, el dominio y el equilibrio de clases. Esto impide evaluar sesgos y generalización.
- Riesgo de alucinación y errores de etiquetado: como todo clasificador, puede asignar etiquetas incorrectas, especialmente en textos ambiguos, irónicos o fuera del dominio de entrenamiento.
- Sesgos desconocidos: al no documentarse los datos, no se pueden identificar sesgos demográficos, culturales o de género en las etiquetas.
- Limitación de idioma: el tokenizador es `uncased` en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Límite de contexto de 512 tokens: textos más largos se truncan, lo que puede perder información relevante para la clasificación.
- Licencia apache-2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; la licencia del modelo base (DistilBERT) también es apache-2.0.
- Documentación mínima: la model card está generada automáticamente y contiene secciones sin completar ("More information needed"), lo que dificulta la reproducibilidad y la validación en producción.
- Sin métricas de benchmark externas: solo se dispone de métricas de validación del propio entrenamiento, que pueden estar sobreajustadas al conjunto de evaluación.
- Advertencia para producción: antes de desplegarlo, conviene validar el modelo en un conjunto de datos propio del dominio objetivo y revisar las etiquetas de salida (que el autor no enumera en la información disponible).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/verasajin97/distilbert-base-uncased-finetuned-emotion
- Modelo base DistilBERT: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference

# Subha95/bengali-sentiment-bert

## Resumen

bengali-sentiment-bert es un modelo de clasificación de texto obtenido mediante fine-tuning de google-bert/bert-base-multilingual-cased, publicado por el usuario Subha95 en Hugging Face. Su propósito declarado, a partir del nombre y de la tarea del pipeline (text-classification), es el análisis de sentimiento en bengalí, aunque la model card no documenta explícitamente el dataset de entrenamiento ni los idiomas cubiertos.

Se trata de un BERT multilingüe base con 177.857.285 parámetros y licencia Apache 2.0, entrenado durante 5 épocas con un batch total de 16 y una tasa de aprendizaje de 2e-05. El modelo alcanza en el conjunto de evaluación un F1 macro de 0,9055, un F1 micro de 0,9187 y una exactitud exacta (exact match) de 0,8166, según los datos declarados por el autor.

Su relevancia es limitada y muy específica: es un modelo pequeño, con solo 52 descargas y sin likes en el momento de la consulta, lo que indica una adopción escasa. Resulta útil como punto de partida para tareas de clasificación de sentimiento en bengalí o como referencia de fine-tuning ligero, pero carece de documentación suficiente para uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder bidireccional), base multilingüe |
| Parametros totales | 177.857.285 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada) |
| Idiomas soportados | no disponible (el nombre sugiere bengalí; el modelo base es multilingüe con 104 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-multilingual-cased, un transformer encoder bidireccional de tipo BERT con vocabulario en minúsculas y mayúsculas (cased) y cobertura de 104 idiomas. Sobre esa base se aplicó un fine-tuning supervisado para clasificación de texto, con una cabeza de clasificación cuyo número de etiquetas no se especifica en la model card.

Los hiperparámetros documentados son: learning rate de 2e-05, batch de entrenamiento de 8 con acumulación de gradientes de 2 (batch total efectivo de 16), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 130 pasos de warmup, semilla 42 y 5 épocas. El entrenamiento se realizó con Transformers 5.22.2, PyTorch 2.15.0+cu132, Datasets 5.2.0 y Tokenizers 0.23.3. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO; el README indica explícitamente "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento.

## Capacidades

- Clasificación de texto: genera una etiqueta de sentimiento (u otra categoría definida en el fine-tuning) para un texto de entrada.
- Análisis de sentimiento en bengalí, según el nombre del modelo; no confirmado con documentación.
- Codificación contextual multilingüe heredada del modelo base, potencialmente reutilizable para otros idiomas, aunque sin garantías de rendimiento.
- No soporta tool calling ni function calling: es un modelo encoder de clasificación, no un modelo generativo.
- No soporta agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión ni audio.
- No es un modelo de generación de texto: no puede producir respuestas abiertas.

## Casos de uso

- Análisis de sentimiento en redes sociales en bengalí: clasificar comentarios o publicaciones como positivos, negativos o neutros; el modelo está ajustado para esta tarea y su tamaño reducido permite procesar lotes grandes con bajo coste.
- Moderación de comentarios en plataformas de contenido: filtrar automáticamente mensajes con tono negativo o tóxico como primera etapa de un pipeline de moderación, usando la etiqueta predicha como señal.
- Monitorización de opinión de marca: procesar reseñas o menciones en bengalí y agregar la distribución de sentimiento por producto o periodo; el F1 macro de 0,9055 en evaluación sugiere una calidad razonable para esta tarea.
- Enrutamiento de tickets de soporte: clasificar la carga emocional de mensajes entrantes para priorizar casos negativos hacia agentes humanos, aprovechando la inferencia rápida de un modelo de 177 millones de parámetros.
- Etiquetado asistido de datasets: pre-anotar grandes volúmenes de texto en bengalí para revisión humana posterior, reduciendo el coste de anotación manual.
- Investigación en procesamiento de lenguaje de bajo recursos: servir como baseline de fine-tuning para experimentos con bengalí, dado su bajo coste computacional y su licencia permisiva.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas adicionales):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,1376 |
| F1 macro | 0,9055 |
| F1 micro | 0,9187 |
| Precision macro | 0,9295 |
| Recall macro | 0,8850 |
| Exact match accuracy | 0,8166 |

Evolución por época según la model card:

| Epoca | Validation loss | F1 macro | F1 micro | Precision macro | Recall macro | Exact match accuracy |
|---|---|---|---|---|---|---|
| 1 | 0,2283 | 0,7929 | 0,8358 | 0,8297 | 0,7856 | 0,6834 |
| 2 | 0,1823 | 0,8529 | 0,8797 | 0,8886 | 0,8315 | 0,7568 |
| 3 | 0,1467 | 0,8973 | 0,9114 | 0,9279 | 0,8709 | 0,8108 |
| 4 | 0,1438 | 0,8911 | 0,9098 | 0,9298 | 0,8677 | 0,8069 |
| 5 | 0,1376 | 0,9055 | 0,9187 | 0,9295 | 0,8850 | 0,8166 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB solo para pesos (177,9 M de parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,36 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, T4, A10, A100 o H100 son válidas, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (Pipeline de text-classification), Text Embeddings Inference (el tag text-embeddings-inference está presente), endpoints compatibles de Hugging Face; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Subha95/bengali-sentiment-bert | 177,9 M | no disponible | Apache 2.0 | Hugging Face, 52 descargas | Fine-tuning de bert-base-multilingual-cased para sentimiento en bengalí |
| google-bert/bert-base-multilingual-cased | 177,9 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base sin fine-tuning; no clasifica sentimiento por sí solo |
| Modelos de sentimiento en bengalí de terceros | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas específicas de análisis de sentimiento en bengalí.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") en descripción, usos previstos, limitaciones y datos de entrenamiento.
- No se especifica el dataset de entrenamiento ni el número de etiquetas, lo que impide conocer la distribución de clases y el dominio de aplicación.
- No se documentan los idiomas soportados; el nombre sugiere bengalí, pero no hay confirmación oficial.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, religión, política u otros.
- La exactitud exacta (0,8166) es notablemente inferior al F1 macro (0,9055), lo que sugiere posibles desequilibrios entre clases o métricas calculadas sobre subconjuntos distintos; conviene verificar la definición exacta de cada métrica.
- El modelo base tiene un límite de 512 tokens; textos más largos requerirán truncamiento, aunque este dato no se confirma en la model card.
- Licencia Apache 2.0: permite uso comercial y modificación, pero sin garantías del autor.
- Adopción muy baja (52 descargas, 0 likes) y sin validación independiente; no se recomienda su uso en producción sin una evaluación propia sobre datos representativos del dominio objetivo.
- Fecha de creación indicada como 2026-11-12, posterior a la fecha habitual de consulta; conviene verificar la integridad de los metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Subha95/bengali-sentiment-bert
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

# Sultan0336/distilbert-imdb-sentiment

## Resumen

`Sultan0336/distilbert-imdb-sentiment` es un modelo de clasificación de secuencias (análisis de sentimiento binario) obtenido por ajuste fino de `distilbert/distilbert-base-uncased` sobre el corpus de reseñas de cine IMDb. Lo publica el usuario Sultan0336 como parte de un ejercicio académico de comparación entre arquitecturas encoder y decoder, y no como un modelo orientado a producción. La tarea es estrictamente de clasificación: dado un texto en inglés, devuelve la etiqueta NEGATIVE (0) o POSITIVE (1). No es un generador conversacional.

La arquitectura es DistilBERT, un transformer bidireccional destilado de BERT-base con 6 capas y 66.955.010 parámetros totales, lo que lo sitúa en el rango de los 67 millones habitual de esta familia. El contexto efectivo de entrenamiento y evaluación es de 128 tokens, muy por debajo de los 512 tokens que admite el tokenizador original de DistilBERT. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors.

Su relevancia es limitada y muy acotada: sirve como referencia reproducible de un pipeline de ajuste fino supervisado con métricas publicadas, y como ejemplo didáctico de las diferencias entre atención bidireccional y causal en tareas de clasificación. Con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de adopción por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima usada en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 67 M de parametros, la cuantizacion es poco relevante en la practica) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder de 6 capas con atención bidireccional completa, obtenido por destilación de conocimiento a partir de BERT-base. El checkpoint parte de `distilbert-base-uncased` y añade una cabeza de clasificación de secuencia con dos etiquetas. El autor señala explícitamente el contraste con DistilGPT2, que emplea atención causal y una cabeza de clasificación superpuesta; esa comparación es el eje del ejercicio académico para el que se creó el modelo.

El ajuste fino se realizó sobre `stanfordnlp/imdb` con un subconjunto reducido: 4.000 reseñas de entrenamiento, 500 de validación y 1.000 de test reservadas, todas ellas balanceadas por clase. La validación proviene del split de entrenamiento original y el test del split de test original; se eliminaron duplicados exactos tras normalización, se retiraron los saltos de línea HTML y se normalizó el espaciado. La configuración de entrenamiento fue: semilla 42, 2 épocas, optimizador AdamW, learning rate 2e-5, weight decay 0,01, warmup ratio 0,1, batch size 8 con acumulación de gradientes de 2 pasos, y selección del checkpoint por macro-F1 de validación. El tiempo total de entrenamiento reportado es de 51,24 segundos. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias, lo cual es esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación binaria de sentimiento (NEGATIVE / POSITIVE) en textos en inglés.
- Procesamiento de reseñas de hasta 128 tokens; los textos más largos se truncan.
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (67 M de parámetros).
- Integración directa con el pipeline `text-classification` de transformers y con Text Embeddings Inference (el tag `text-embeddings-inference` y `endpoints_compatible` figura en el repositorio).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.
- Multilingüismo: únicamente inglés; el tokenizador es `uncased` y el vocabulario original de DistilBERT.

## Casos de uso

- Moderación y triaje de reseñas de productos o contenidos audiovisuales: clasificar automáticamente opiniones de usuarios en positivas o negativas para enrutarlas a paneles de análisis o a colas de revisión manual, con un coste de inferencia mínimo.
- Análisis de sentimiento en pipelines de monitorización de reputación: procesar lotes de comentarios en inglés y agregar la proporción de sentimiento por producto, canal o periodo temporal.
- Filtrado previo en sistemas de recomendación: usar la etiqueta de sentimiento como señal auxiliar para ponderar reseñas antes de alimentar un motor de ranking.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de texto en inglés para su posterior revisión humana, aprovechando el throughput medido de 865 muestras por segundo en el conjunto de test.
- Docencia y experimentación en procesamiento de lenguaje natural: servir como referencia reproducible para comparar encoders bidireccionales frente a decoders causales en tareas de clasificación, que es el propósito declarado del autor.
- Prototipado rápido en entornos con recursos limitados: al ocupar 0,3 GB y caber holgadamente en CPU, permite desplegar un clasificador de sentimiento en contenedores pequeños o en dispositivos de borde sin GPU.
- Validación de pipelines de MLOps: su configuración de entrenamiento documentada (semilla, hiperparámetros, splits) facilita reproducir el experimento y verificar la integridad de un flujo de entrenamiento y evaluación.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el conjunto de test reservado (1.000 reseñas, balanceado):

| Metrica | Valor |
|---|---|
| Test loss | 0,3906 |
| Test accuracy | 0,838 |
| Test macro precision | 0,8381 |
| Test macro recall | 0,838 |
| Test macro F1 | 0,8380 |
| Test runtime | 1,156 s |
| Test samples per second | 865,045 |
| Test steps per second | 54,498 |
| Training seconds | 51,24 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 270 MB de pesos (67 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica cabe en cualquier GPU con 1 GB o más.
- En fp16: aproximadamente 135 MB de pesos.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU con latencia baja. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente; en A100 o H100 el cuello de botella será el overhead de lanzamiento de kernels, no el cómputo.
- Cabe en cualquier GPU consumer y en la mayoría de sistemas embebidos con al menos 512 MB de RAM libre.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (tag `text-embeddings-inference`), TorchServe, FastAPI con transformers, ONNX Runtime tras exportación. No se documenta compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Throughput medido: 865 muestras por segundo y 54,5 pasos por segundo en el conjunto de test, con un runtime total de 1,156 s para 1.000 muestras. Esa cifra corresponde al hardware usado por el autor, que no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sultan0336/distilbert-imdb-sentiment | 66,96 M | 128 tokens | Clasificacion de sentimiento binaria (IMDb) | apache-2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | 66,96 M | 512 tokens | Modelo base; requiere cabeza de clasificacion | apache-2.0 | HuggingFace, ampliamente adoptado |
| TextBlob / VADER (baseline lexico) | no aplica | no aplica | Sentimiento por reglas | MIT / NLTK | Librerias Python |
| RoBERTa-base ajustado para sentimiento | ~125 M | 512 tokens | Clasificacion de sentimiento | MIT | Multiples checkpoints en HuggingFace |

El modelo base sin ajustar no es directamente comparable en rendimiento porque carece de cabeza de clasificación entrenada, pero sirve de referencia de tamaño y contexto. Frente a baselines léxicos como VADER, este checkpoint ofrece una accuracy medida del 83,8 % en su propio test, aunque la comparación no es directa al no compartir conjunto de evaluación. No se dispone de datos de benchmarks de alternativas en la información proporcionada.

## Limitaciones y advertencias

- Muestra de entrenamiento muy pequeña (4.000 reseñas) y una única semilla: los resultados pueden no ser estables ante reejecuciones o cambios en el split.
- Dominio restringido a reseñas de cine; el rendimiento fuera de ese dominio (por ejemplo, opiniones de productos, tuits o texto técnico) no está validado y probablemente sea inferior.
- No existe etiqueta neutra: textos ambiguos se fuerzan a POSITIVE o NEGATIVE.
- Truncamiento a 128 tokens: las reseñas largas pierden información y el sentimiento global puede quedar mal representado.
- El autor advierte que la ironía y el sentimiento mixto pueden clasificarse erróneamente.
- Las puntuaciones softmax no están calibradas como probabilidades: no deben interpretarse como niveles de confianza fiables.
- El propio autor señala que el experimento no permite aislar el efecto de la arquitectura de las diferencias de preentrenamiento, tokenizador y número de parámetros.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación.
- Licencia apache-2.0: permite uso comercial y modificación, pero conviene verificar los términos del dataset IMDb (`stanfordnlp/imdb`) para usos derivados.
- Sin descargas ni validación externa: no hay evidencia de que el modelo generalice más allá del conjunto de test del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sultan0336/distilbert-imdb-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/stanfordnlp/imdb
- Términos del dataset: https://huggingface.co/datasets/stanfordnlp/imdb
- Paper de DistilBERT: no disponible en la información proporcionada
- Repositorio o demo adicional: no disponible en la información proporcionada

# Tuibingu03/TABERT_SimCSE

## Resumen

TABERT-SimCSE es un modelo de embeddings de frases para vietnamita desarrollado por el usuario Tuibingu03 y publicado en HuggingFace. Se construye mediante fine-tuning del modelo base `vinai/phobert-base-v2` con la técnica Unsupervised SimCSE (Simple Contrastive Learning of Sentence Embeddings), un método de aprendizaje contrastivo que no requiere pares etiquetados de similitud. El resultado es un encoder que transforma frases y párrafos en vectores densos de 768 dimensiones, útiles para similitud semántica, búsqueda semántica, clustering y recuperación de información.

El modelo parte de la arquitectura RoBERTa-base de PhoBERT (12 capas, 12 cabezas de atención, hidden size 768, aproximadamente 135 millones de parámetros y vocabulario de 64.001 tokens), con una longitud máxima de secuencia de 256 tokens. Se ha entrenado sobre 345.863 párrafos extraídos de 28.511 artículos periodísticos en vietnamita, lo que orienta su uso hacia el dominio de noticias y textos cortos.

Su relevancia actual reside en cubrir una carencia de modelos de embeddings específicos para vietnamita con licencia AGPL-3.0 y pesos en safetensors, integrables vía `transformers` y compatibles con endpoints. No obstante, el repositorio no registra descargas ni likes en el momento de la consulta, y el autor no ha publicado comparativas frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (backbone PhoBERT) |
| Parametros totales | Aproximadamente 135M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en RoBERTa-base, heredado de `vinai/phobert-base-v2`: 12 capas, 12 cabezas de atención, hidden size de 768 y vocabulario de 64.001 tokens. La entrada debe segmentarse previamente con VnCoreNLP antes de la tokenización con el tokenizador de PhoBERT. En inferencia se extrae directamente el embedding de la posición `[CLS]` del backbone afinado, sin usar la cabeza de proyección.

El entrenamiento emplea Unsupervised SimCSE: para cada párrafo se realizan dos forward passes independientes con dropout aleatorio (hidden dropout 0,3 y attention dropout 0,3) para generar pares positivos, y el resto de párrafos del batch actúan como negativos. La pérdida es InfoNCE sobre la matriz de similitud coseno con temperatura τ = 0,05. Se usa un MLP projection head (Linear 768→768 + Tanh) solo durante el entrenamiento. Los hiperparámetros incluyen learning rate 5e-6, batch size 128, optimizador AdamW con weight decay 0,0, scheduler lineal con warmup ratio 0,05, precisión mixta FP16/BF16 con `torch.amp.GradScaler` y muestreo por bucketing de longitud para reducir padding. Los datos provienen de párrafos de noticias filtrados a un rango de 16 a 128 tokens tras segmentación y tokenización; el dataset no se distribuye en el repositorio.

## Capacidades

- Generación de embeddings de frases y párrafos en vietnamita con dimensión fija de 768.
- Similitud semántica de texto (STS) mediante distancia coseno entre embeddings.
- Búsqueda semántica sobre corpus en vietnamita.
- Recuperación de información (information retrieval) a partir de representaciones densas.
- Clustering de frases y párrafos por contenido semántico.
- Extracción de features para modelos de clasificación posteriores.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni agentes.
- No dispone de modo thinking, visión ni audio.
- Capacidad monolingüe: únicamente vietnamita.

## Casos de uso

- Búsqueda semántica en portales de noticias: indexar los 345.863 párrafos del dominio periodístico con embeddings de 768 dimensiones y recuperar los más cercanos a una consulta mediante similitud coseno, aprovechando que el modelo fue entrenado exactamente sobre ese tipo de texto.
- Deduplicación de contenido periodístico: agrupar párrafos con alto coseno para detectar reescrituras o syndicación entre los 28.511 artículos, usando el modelo como paso previo a un clustering (por ejemplo, HDBSCAN) sobre los vectores.
- Sistemas de recomendación de artículos: calcular la similitud entre el embedding del artículo leído y el resto del catálogo para sugerir piezas relacionadas temáticamente.
- Moderación y clasificación de comentarios: usar los embeddings como entrada a un clasificador ligero (regresión logística o MLP) para etiquetar textos cortos en vietnamita, con la ventaja de que el encoder ya captura semántica sin necesidad de fine-tuning adicional.
- Construcción de un índice vectorial para asistentes de preguntas frecuentes: almacenar respuestas en una base vectorial (FAISS, Qdrant, Milvus) y recuperar la más próxima a la pregunta del usuario, limitando las entradas a menos de 256 tokens.
- Análisis de temas en corpus vietnamitas: generar embeddings de párrafos y aplicar reducción de dimensionalidad (UMAP) y clustering para explorar tendencias temáticas en grandes volúmenes de noticias.
- Filtrado de pares para anotación: pre-seleccionar pares de frases con similitud alta para revisión humana en tareas de paráfrasis, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card sobre conjuntos STS en vietnamita:

| Dataset | Pares (N) | Spearman (ρ) | Pearson (r) |
|---|---:|---:|---:|
| stsb_seg | 1.035 | 0,6536 | 0,6855 |
| sts_sickr_seg | 9.599 | 0,6852 | 0,7448 |
| sts12_seg | 2.803 | 0,4560 | 0,5099 |
| sts14_seg | 3.625 | 0,5599 | 0,6062 |
| sts15_seg | 2.978 | 0,6557 | 0,6517 |
| sts16_seg | 1.174 | 0,6769 | 0,6655 |
| stsbenchmark_seg | 8.272 | 0,6642 | 0,6889 |
| Media (7 datasets) | 29.486 | 0,6217 | 0,6504 |
| stsb_vi_merged_10000 (evaluación separada) | 10.000 | 0,7371 | 0,7000 (dato truncado en la model card) |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,3 GB para los pesos (135M parámetros), más overhead de activaciones y tokenizador; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna; para alto throughput, A100, H100, L4 o RTX 4090. Para desarrollo, RTX 3060 o superior.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con PyTorch, `sentence-transformers` (cargando el modelo como encoder), vLLM no aplica (no es modelo generativo), TGI no aplica, llama.cpp no dispone de conversión documentada a GGUF. Compatible con HuggingFace Inference Endpoints según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TABERT-SimCSE (este) | ~135M | 256 tokens | Vietnamita | AGPL-3.0 | HuggingFace, safetensors |
| `vinai/phobert-base-v2` (base, sin fine-tuning SimCSE) | ~135M | 256 tokens | Vietnamita | MIT (según el repositorio original) | HuggingFace |
| `keepitreal/vietnamese-sbert` | ~135M (PhoBERT) | 256 tokens | Vietnamita | no disponible en esta ficha | HuggingFace |
| `bkai-foundation-models/vietnamese-bi-encoder` | ~135M (PhoBERT) | 256 tokens | Vietnamita | no disponible en esta ficha | HuggingFace |

No se dispone de datos de rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con párrafos de noticias; el rendimiento puede degradarse en textos técnicos, conversacionales, legales o literarios.
- Longitud limitada: la ventana máxima es de 256 tokens, y el entrenamiento filtró párrafos a 16-128 tokens; textos más largos deben truncarse o dividirse, con posible pérdida de contexto.
- Monolingüe: solo vietnamita; no soporta consultas cruzadas con otros idiomas.
- Requiere segmentación de palabras con VnCoreNLP antes de la tokenización; omitir este paso puede degradar la calidad de los embeddings.
- Riesgo de sesgo: al derivar de noticias, puede heredar sesgos de encuadre, geográficos o temáticos presentes en la cobertura periodística.
- Riesgo de alucinación no aplica en sentido generativo (no produce texto), pero la similitud coseno puede producir falsos positivos en pares léxicamente próximos pero semánticamente distintos.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en servicios en red puede requerir liberar el código del servicio. Revisar con asesoría legal antes de producción.
- Sin métricas de latencia, throughput ni consumo publicadas.
- Repositorio sin descargas ni validación comunitaria; el autor no aporta comparativas con alternativas consolidadas.
- La evaluación en `stsb_vi_merged_10000` aparece truncada en la model card (Pearson 0,7), por lo que no puede verificarse el valor completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tuibingu03/TABERT_SimCSE
- Modelo base PhoBERT: https://huggingface.co/vinai/phobert-base-v2
- Paper de SimCSE (referencia del método): no disponible en la información proporcionada
- Repositorio de VnCoreNLP: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada

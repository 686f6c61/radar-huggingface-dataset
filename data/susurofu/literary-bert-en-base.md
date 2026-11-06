# susurofu/literary-bert-en-base

## Resumen

Literary Sentiment Ordinal BERT — Base es un modelo de análisis de sentimiento a nivel de oración para texto literario en inglés, desarrollado por el usuario susurofu. Se trata de un fine-tuning de `google-bert/bert-base-uncased` (109.483.017 parámetros) que sustituye la clasificación convencional de tres clases por una regresión ordinal de diez niveles (1 = más negativo, 10 = más positivo). El modelo forma parte de un conjunto de cinco configuraciones "student" entrenadas sobre pseudo-etiquetas generadas por Gemma 4 31B a partir de oraciones literarias de Project Gutenberg.

Su relevancia reside en el enfoque: en lugar de una cabeza de clasificación estándar, implementa una cabeza ordinal personalizada con nueve logits acumulativos que modelan P(Y > k) para umbrales k = 1,...,9, lo que permite obtener una puntuación escalar continua (la esperanza del rating ordinal) y una etiqueta entera redondeada. Esto encaja mejor con la naturaleza gradual del sentimiento literario que una clasificación discreta, y lo hace útil para humanidades digitales y análisis estilístico.

El modelo se distribuye con licencia Apache 2.0, requiere `trust_remote_code=True` para cargar el código de modelado personalizado y está pensado para inferencia con Transformers. Su ventana de entrada está limitada a 256 tokens y su evaluación principal se realizó sobre un corpus humano anotado de Hemingway (*The Old Man and the Sea*, n = 1.923), no usado en entrenamiento ni en selección de checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con cabeza de regresión ordinal personalizada (9 logits acumulativos) |
| Parametros totales | 109.483.017 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder `google-bert/bert-base-uncased`, que produce una representación pooled mapeada a una puntuación latente de sentimiento s(x). Sobre ella se definen nueve umbrales ordenados entrenables θ₁ < ... < θ₉, parametrizados mediante un primer umbral y incrementos acumulativos con softplus. La salida son nueve logits definidos como logit_k = s(x) − θ_k para k = 1,...,9, que tras sigmoid representan P(Y > k). En inferencia, la puntuación esperada se calcula como E[Y|x] = 1 + Σ sigmoid(logit_k) y la etiqueta entera se obtiene redondeando y recortando a [1,10].

El entrenamiento usa hard-label pseudo-labeling (no destilación de logits suaves) con entropía cruzada binaria contra nueve objetivos binarios acumulativos 1[label > k]. Los datos son 10.889 oraciones literarias limpias de Project Gutenberg, etiquetadas independientemente por Gemma 4 31B en la escala 1–10. El split estratificado es 80/10/10 (8.711 / 1.089 / 1.089). Hiperparámetros: learning rate 2e-5, weight decay 0,01, warmup ratio 0,10, máximo 3 épocas, batch 16/32, optimizador AdamW con scheduler lineal (valores por defecto de Hugging Face Trainer), semilla 1111, FP16 cuando hay CUDA, evaluación y checkpoint cada 100 pasos, selección por MAE de validación mínima, checkpoint seleccionado en el paso 600. Las etiquetas del teacher están desbalanceadas: el 41,5% recibió puntuación 5 y el 57,9% quedó entre 4 y 6.

## Capacidades

- Extracción de características y representaciones pooled del texto (feature-extraction).
- Análisis de sentimiento ordinal a nivel de oración en escala de 1 a 10, con puntuación continua esperada y etiqueta entera redondeada.
- Interpretación descriptiva por tramos: 1–3 negativo, 4–6 casi neutro, 7–10 positivo.
- Regresión ordinal mediante cabeza personalizada con nueve logits acumulativos (no usar softmax/argmax).
- Procesamiento de texto literario en inglés, incluyendo pasajes narrativos de Project Gutenberg.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio según la información disponible.
- Capacidad multilingüe: solo inglés.

## Casos de uso

- Análisis de sentimiento en corpus literarios: el modelo permite puntuar oraciones de novelas y relatos en una escala gradual de 1 a 10, adecuado para estudios de evolución emocional de personajes o tramas en humanidades digitales.
- Investigación estilística y estilometría: al producir una puntuación continua en lugar de una clase discreta, facilita correlacionar el tono con autor, época o género en corpus de Project Gutenberg.
- Anotación asistida de datasets literarios: puede pre-etiquetar oraciones para revisión humana, reduciendo el coste de construir corpus anotados con matices de sentimiento.
- Análisis de obras concretas: la evaluación sobre *The Old Man of the Sea* de Hemingway demuestra su uso para estudiar el tono de una obra completa oración a oración.
- Filtrado y curación de datos: en pipelines de preparación de corpus, permite descartar o clasificar pasajes según su carga emocional antes de otros procesos.
- Extracción de embeddings para clasificación downstream: al ser un encoder BERT, sus representaciones pooled pueden alimentar modelos secundarios de clasificación o clustering de pasajes literarios.
- Monitorización de contenido narrativo en editoriales: evaluación del tono de manuscritos o traducciones literarias en inglés para control de calidad estilística.

## Benchmarks y rendimiento

Evaluación sobre el corpus humano independiente de Hemingway (*The Old Man and the Sea*, n = 1.923), con puntuaciones de referencia promediadas entre dos anotadores:

| Métrica | Todos (n = 1.923) | No neutras (n = 305) |
|---|---|---|
| MAE ↓ | 0,733 | 0,726 |
| Kendall τ ↑ | 0,580 | no disponible |
| Spearman ρ ↑ | 0,665 | no disponible |
| Accuracy ±1 ↑ | 0,815 | 0,803 |

La model card indica que la tabla de evaluación completa incluye al teacher y a líneas base externas, pero esos modelos no están incluidos en el repositorio y sus cifras no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~109,5 M parámetros; en FP32 ocupa aproximadamente 0,44 GB de pesos, en FP16 ~0,22 GB. Con activaciones y overhead de runtime, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; también A100/H100 para lotes grandes.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2–4 GB de VRAM, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Transformers con `AutoModel` y `trust_remote_code=True` (requerido por la cabeza personalizada). No se garantiza compatibilidad con `AutoModelForSequenceClassification` ni con `pipeline("sentiment-analysis")`. El tag `text-embeddings-inference` y `endpoints_compatible` aparece en los metadatos, pero la model card no documenta un procedimiento de despliegue específico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| susurofu/literary-bert-en-base | 109,5 M | 256 tokens | Sentimiento ordinal literario (1–10) | Apache 2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base general (MLM) | Apache 2.0 | Hugging Face |
| Modelos de sentimiento de 3 clases basados en BERT | ~110 M | 512 tokens | Clasificación negativa/neutra/positiva | variable | Hugging Face |

La comparación directa con alternativas de sentimiento literario ordinal no está disponible en la información proporcionada. Frente al BERT-base original, este modelo añade una cabeza ordinal específica y está especializado en texto literario, a costa de reducir la longitud máxima de entrada a 256 tokens.

## Limitaciones y advertencias

- La cabeza es personalizada: produce nueve logits acumulativos, no diez logits de clase. No debe interpretarse con `AutoModelForSequenceClassification`, `pipeline("sentiment-analysis")`, softmax ni argmax.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_ordinal_bert.py`); conviene revisarlo antes de usarlo en producción.
- Entrenado exclusivamente con pseudo-etiquetas de Gemma 4 31B sobre oraciones de Project Gutenberg; puede heredar sesgos y errores del teacher, incluido el fuerte desbalance hacia la puntuación 5 (41,5%).
- Solo inglés y limitado a 256 tokens de entrada; textos más largos deben dividirse en oraciones o fragmentos.
- Riesgo de alucinación no aplica en el sentido generativo (es un encoder de clasificación), pero sí de calibración deficiente fuera del dominio literario.
- La evaluación principal se basa en una única obra (Hemingway) y en dos anotadores; la generalización a otros autores o géneros no está documentada.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni soporte.
- No hay datos publicados sobre cuantización, latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/susurofu/literary-bert-en-base
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/susurofu/synthetic-sentiment-dataset-pg-gemma4
- Paper referenciado (arXiv): 2611.02985
- Repositorio de código de modelado: `modeling_ordinal_bert.py` (incluido en el repositorio de Hugging Face)
- Script de ejemplo: `example_inference.py` (incluido en el repositorio de Hugging Face)

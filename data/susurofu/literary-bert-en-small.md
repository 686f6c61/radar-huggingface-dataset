# susurofu/literary-bert-en-small

## Resumen

Literary-bert-en-small es un modelo BERT-small (28,76 millones de parámetros reales en safetensors) afinado por el usuario susurofu para el análisis de sentimiento a nivel de frase en texto literario en inglés. A diferencia de los clasificadores de sentimiento convencionales de tres clases, este modelo aborda la tarea como una regresión ordinal sobre diez niveles ordenados (1 = más negativo, 10 = más positivo), con una cabeza personalizada de logits acumulativos que estima la puntuación esperada E[Y|x] en el intervalo [1, 10].

El modelo parte del encoder preentrenado google/bert_uncased_L-4-H-512-A-8 y se ha entrenado con pseudoetiquetas generadas por Gemma 4 31B sobre 10.889 frases literarias limpias extraídas de Project Gutenberg. Su relevancia actual reside en el nicho de las humanidades digitales: proporciona una señal de sentimiento más granular y sensible al matiz literario que los modelos de tres clases, manteniendo un coste computacional muy bajo (0,1 GB de repositorio) y una licencia Apache 2.0 que permite uso comercial.

La evaluación se ha realizado sobre un corpus independiente anotado por humanos (1.923 frases de *The Old Man and the Sea* de Hemingway), excluido del entrenamiento y de la selección de checkpoint, lo que aporta una validación externa poco habitual en modelos de este tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (google/bert_uncased_L-4-H-512-A-8) con cabeza de regresión ordinal personalizada |
| Parámetros totales | 28.764.169 (28,76 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrada en entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con código personalizado en `modeling_ordinal_bert.py`) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder BERT-small de 4 capas, 512 de dimensión oculta y 8 cabezas de atención de Google. Sobre la representación pooled se proyecta una puntuación latente de sentimiento s(x), y se aprenden nueve umbrales ordenados θ₁ < ... < θ₉ parametrizados mediante un primer umbral más incrementos acumulativos con softplus. La salida son nueve logits acumulativos definidos como logit_k = s(x) − θ_k para k = 1,...,9, que tras sigmoide representan P(Y > k). La puntuación esperada se calcula como E[Y|x] = 1 + Σ sigmoid(logit_k), y la etiqueta redondeada se recorta al rango [1, 10].

El entrenamiento minimiza entropía cruzada binaria contra nueve objetivos binarios acumulativos 1[label > k], es decir, pseudoetiquetado con etiquetas duras (no destilación de logits suaves). Los datos son 10.889 frases literarias de Project Gutenberg etiquetadas de forma independiente por Gemma 4 31B en la escala 1–10, con un split estratificado 80/10/10 (8.711 / 1.089 / 1.089). Hiperparámetros destacados: learning rate 2e-5, weight decay 0,01, warmup ratio 0,10, máximo 3 épocas, batch 16/32, semilla 1111, FP16 cuando hay CUDA, longitud máxima tokenizada de 128 y selección de checkpoint por MAE de validación mínimo (checkpoint elegido: paso 1100). Las etiquetas del teacher están desbalanceadas: el 41,5 % recibió puntuación 5 y el 57,9 % se concentra entre 4 y 6.

## Capacidades

- Análisis de sentimiento ordinal a nivel de frase con diez niveles ordenados (1–10), devolviendo tanto una puntuación continua esperada como una etiqueta entera redondeada.
- Extracción de características (feature-extraction) mediante el encoder BERT subyacente.
- Regresión ordinal con umbrales aprendidos, lo que preserva la información de orden entre clases a diferencia de una clasificación nominal.
- Interpretación descriptiva de rangos: 1–3 negativo, 4–6 casi neutro, 7–10 positivo.
- Especialización en registro literario en inglés (prosa de ficción de dominio público).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Análisis de arco emocional en obras literarias: procesar novela por novela y obtener una curva de sentimiento frase a frase con la que estudiar la evolución narrativa; el modelo está entrenado específicamente sobre prosa de Project Gutenberg, por lo que el dominio coincide.
- Humanidades digitales y estilometría: cuantificar la tonalidad de corpus de ficción para comparar autores, épocas o géneros, aprovechando la escala ordinal de diez niveles en lugar de una etiqueta tripartita.
- Etiquetado asistido de corpus: preanotar grandes volúmenes de frases literarias con una puntuación de sentimiento y reservar la revisión humana para los casos cercanos a los umbrales, reduciendo el coste de anotación.
- Investigación en psicolingüística: estudiar la relación entre valencia emocional y estructuras sintácticas o léxicas en textos narrativos, con una señal más fina que la de un clasificador positivo/negativo/neutro.
- Filtrado y curación de datasets literarios: descartar o agrupar pasajes según su carga emocional antes de construir corpus de entrenamiento para modelos generativos.
- Sistemas de recomendación de lectura: puntuar fragmentos o reseñas con registro literario para construir perfiles de preferencia tonal de los lectores.
- Componente de bajo coste en pipelines de NLP: al ocupar 0,1 GB y ejecutarse en CPU, puede desplegarse como microservicio de puntuación de sentimiento literario sin GPU.

## Benchmarks y rendimiento

Evaluación sobre el corpus independiente anotado por humanos de Hemingway (n = 1.923 frases, referencia promediada de dos anotadores):

| Métrica | Valor |
|---|---|
| MAE | 0,717 |
| Kendall τ | 0,468 |
| Spearman ρ | 0,541 |
| Precisión dentro de ±1 | 0,837 |

Subconjunto de 305 frases no neutras según la referencia:

| Métrica | Valor |
|---|---|
| MAE | 0,982 |
| Precisión dentro de ±1 | 0,698 |

La model card indica que la tabla de evaluación completa incluye resultados del teacher y de líneas base externas, pero esos datos no se han proporcionado en la información disponible; no se reproducen aquí para no inventar cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (28,76 M de parámetros, ~115 MB de pesos) y aproximadamente 60 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo es viable en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin aprovechar su capacidad.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el código personalizado); text-embeddings-inference aparece entre las etiquetas del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el código personalizado de la cabeza ordinal dificulta su conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| literary-bert-en-small | 28,76 M | 128 tokens | Sentimiento ordinal literario (1–10) | Apache 2.0 | HuggingFace |
| google/bert_uncased_L-4-H-512_A-8 | ~29 M | 512 tokens | Encoder general (MLM) | Apache 2.0 | HuggingFace |
| Clasificadores de sentimiento BERT-base (p. ej. finetunes de SST-2) | ~110 M | 512 tokens | Sentimiento de 2–3 clases | variable | HuggingFace |

La comparación con alternativas de la misma tarea es limitada: no se dispone de datos de benchmarks de otros modelos de sentimiento literario ordinal en la información proporcionada. Frente al encoder base, este modelo añade la cabeza ordinal y la especialización de dominio a costa de reducir la longitud de entrada efectiva a 128 tokens.

## Limitaciones y advertencias

- La cabeza es personalizada: produce nueve logits acumulativos, no diez logits de clase. No debe usarse `AutoModelForSequenceClassification` ni `pipeline("sentiment-analysis")`; es obligatorio `AutoModel` con `trust_remote_code=True` y revisar `modeling_ordinal_bert.py` antes de ejecutar código del repositorio.
- Los logits no deben pasarse por softmax ni argmax; la interpretación correcta es la suma de sigmoides descrita en la model card.
- Longitud máxima de 128 tokens: las frases o pasajes más largos se truncan, lo que puede perder contexto emocional.
- Entrenado únicamente en inglés y sobre prosa literaria de dominio público; el rendimiento fuera de ese registro (redes sociales, texto técnico, diálogo) no está validado.
- Las etiquetas de entrenamiento son pseudoetiquetas de un LLM (Gemma 4 31B) con fuerte desbalanceo (41,5 % en la puntuación 5), lo que puede sesgar las predicciones hacia el centro de la escala y arrastrar los sesgos del teacher.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente en los extremos de la escala, donde hay menos ejemplos (80 frases con puntuación 10, 239 con puntuación 1).
- La validación externa se limita a una sola obra (Hemingway); la generalización a otros autores y épocas no está cuantificada.
- Licencia Apache 2.0: permite uso comercial, pero el código personalizado y la dependencia de `trust_remote_code` deben auditarse antes de desplegar en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/susurofu/literary-bert-en-small
- Modelo base: https://huggingface.co/google/bert_uncased_L-4-H-512_A-8
- Dataset de entrenamiento: https://huggingface.co/datasets/susurofu/synthetic-sentiment-dataset-pg-gemma4
- Referencia arXiv citada en las etiquetas: arxiv:2611.02985 (paper no verificado en la información disponible)

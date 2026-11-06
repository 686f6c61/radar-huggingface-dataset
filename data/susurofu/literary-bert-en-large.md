# susurofu/literary-bert-en-large

## Resumen

Literary-bert-en-large es un ajuste fino de BERT-large (google-bert/bert-large-uncased) desarrollado por el usuario susurofu para el análisis de sentimiento a nivel de oración en texto literario en inglés. A diferencia de los clasificadores de sentimiento convencionales de tres clases (positivo/neutro/negativo), este modelo aborda la tarea como una regresión ordinal sobre diez niveles ordenados (1 = más negativo, 10 = más positivo), produciendo una puntuación escalar continua que representa la calificación ordinal esperada.

El modelo emplea una cabeza personalizada de regresión ordinal con logits acumulativos: el encoder genera una representación pooled que se proyecta a una puntuación latente, y nueve umbrales entrenables parametrizados mediante softplus acumulativo producen nueve logits que representan P(Y > k) para k = 1,...,9. Esta formulación permite capturar la naturaleza gradual del sentimiento literario, donde las fronteras entre categorías son difusas y la intensidad emocional importa tanto como la polaridad.

El modelo se entrenó con 10.889 oraciones literarias limpias de Project Gutenberg, etiquetadas mediante pseudo-etiquetas generadas por Gemma 4 31B. Su relevancia actual radica en su aplicación a las humanidades digitales: permite cuantificar la evolución del sentimiento en corpus literarios extensos con una granularidad que los clasificadores discretos no ofrecen, y su evaluación independiente sobre anotaciones humanas de *The Old Man and the Sea* de Hemingway proporciona una validación externa poco habitual en modelos de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-large) con cabeza de regresión ordinal personalizada |
| Parámetros totales | 335.142.921 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización a GGUF/otros no documentada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-large-uncased, un encoder transformer de 24 capas y 340M de parámetros. Sobre la representación pooled del encoder se añade una cabeza personalizada que proyecta a una puntuación latente de sentimiento s(x). Nueve umbrales ordenados θ₁ < ... < θ₉ se parametrizan mediante un primer umbral y incrementos acumulativos de softplus, garantizando el orden. El modelo devuelve logit_k = s(x) − θ_k para k = 1,...,9, que tras sigmoid representan P(Y > k). En inferencia, la puntuación esperada se calcula como E[Y|x] = 1 + Σ sigmoid(logit_k), y la calificación redondeada se recorta al rango [1, 10].

El entrenamiento utiliza entropía cruzada binaria contra nueve objetivos binarios acumulativos 1[label > k], con pseudo-etiquetas duras (hard-label pseudo-labeling) generadas por Gemma 4 31B, no destilación de logits suaves. Los datos consisten en 10.889 oraciones literarias limpias de Project Gutenberg, con un split estratificado 80/10/10 (8.711 / 1.089 / 1.089). La selección del checkpoint se realizó por MAE mínimo en validación, excluyendo las anotaciones de Hemingway del entrenamiento y de la selección. La configuración de entrenamiento incluye learning rate 2e-5, weight decay 0.01, warmup ratio 0.10, máximo 3 épocas, batch size 16/32, optimizador AdamW con scheduler lineal, FP16 cuando CUDA estaba disponible, semilla 1111 y checkpoint seleccionado en el paso 1600.

## Capacidades

- Análisis de sentimiento ordinal a nivel de oración en texto literario inglés, con diez niveles ordenados (1–10).
- Producción de puntuaciones continuas (regresión ordinal) además de etiquetas enteras redondeadas.
- Extracción de características (feature-extraction) mediante el encoder BERT-large subyacente.
- Evaluación de la intensidad emocional gradual, no solo la polaridad discreta.
- Procesamiento de oraciones de hasta 256 tokens.
- No soporta tool calling ni function calling (es un modelo encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Análisis de la evolución del sentimiento en novelas: el modelo permite puntuar oración a oración un texto completo y trazar curvas de arco emocional, aprovechando su granularidad ordinal de diez niveles para detectar transiciones graduales que un clasificador de tres clases perdería.
- Humanidades digitales y estilometría: investigadores pueden cuantificar el tono afectivo de corpus de Project Gutenberg y comparar autores o épocas, con la ventaja de que el modelo fue entrenado específicamente sobre ese dominio literario.
- Evaluación de traducciones literarias: comparar la puntuación de sentimiento entre el texto original y su traducción para detectar pérdidas o alteraciones del tono emocional en segmentos concretos.
- Filtrado y curación de corpus: identificar oraciones con carga emocional extrema (puntuaciones 1–3 o 7–10) para construir subconjuntos temáticos o para tareas de análisis de discurso.
- Investigación en psicología de la literatura: medir la respuesta emocional evocada por pasajes y correlacionarla con anotaciones humanas, usando las métricas de MAE y correlación ordinal reportadas como referencia.
- Docencia y análisis literario asistido: generar visualizaciones del perfil sentimental de un texto para su uso en aulas o ensayos, con la ventaja de que el modelo produce una escala interpretable (1–10) en lugar de etiquetas opacas.
- Baseline para experimentos de anotación automática: servir como modelo estudiante en configuraciones de pseudo-etiquetado supervisado por LLMs, dado que el autor documenta el proceso completo de destilación desde Gemma 4 31B.

## Benchmarks y rendimiento

Evaluación sobre el corpus independiente de Hemingway anotado por humanos (n = 1.923), con puntuaciones de referencia promediadas entre dos anotadores:

| Modelo | MAE ↓ | Kendall τ ↑ | Spearman ρ ↑ | Pearson r ↑ | Acc. ±1 ↑ |
|---|---|---|---|---|---|
| Literary-bert-en-large | 0,769 | 0,589 | 0,676 | no disponible | 0,787 |
| Docente (Gemma 4 31B) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Baselines externos | no disponible | no disponible | no disponible | no disponible | no disponible |

Sobre 305 oraciones no neutras definidas por referencia: MAE 0,887 y accuracy within ±1 de 0,711.

La model card indica que la tabla completa incluye resultados del docente y de baselines externos, pero los valores concretos de esas filas no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB para los pesos (335M parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para batch pequeño.
- VRAM estimada en FP32: aproximadamente 1,3 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 2–4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. El modelo es muy ligero para los estándares actuales.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio para cargar `modeling_ordinal_bert.py`); text-embeddings-inference está listado en los tags; vLLM, llama.cpp y Ollama no están documentados para esta cabeza personalizada y requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 340M con contexto de 256 tokens, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Literary-bert-en-large | 335M | 256 tokens | Regresión ordinal de sentimiento literario (1–10) | Apache 2.0 | Hugging Face (35 descargas) |
| google-bert/bert-large-uncased | 340M | 512 tokens | Encoder base, sin cabeza de sentimiento | Apache 2.0 | Hugging Face (ampliamente usado) |
| Modelos de sentimiento BERT estándar (p. ej. bert-base-multilingual-uncased-sentiment) | ~110M–340M | 512 tokens | Clasificación discreta (3–5 clases) | Varía | Hugging Face |

La comparación directa con alternativas de regresión ordinal literaria no está disponible en la información proporcionada. Frente a los clasificadores de sentimiento BERT convencionales, la diferencia principal es la formulación ordinal continua y el dominio de entrenamiento específicamente literario.

## Limitaciones y advertencias

- El modelo produce nueve logits acumulativos, no diez logits de clase; no debe usarse `AutoModelForSequenceClassification` ni `pipeline("sentiment-analysis")` para interpretar las salidas. Pasar los logits por softmax/argmax es incorrecto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_ordinal_bert.py`); el autor recomienda revisarlo antes de ejecutarlo.
- Entrenado exclusivamente con pseudo-etiquetas generadas por Gemma 4 31B, no con anotaciones humanas; los sesgos del docente pueden propagarse al estudiante.
- Fuerte desbalance de etiquetas en el conjunto de entrenamiento: 41,5% de las oraciones recibieron puntuación 5 y 57,9% puntuaciones 4–6; solo 80 oraciones tienen puntuación 10. Esto puede infrarepresentar los extremos del espectro.
- Evaluación humana limitada a una sola obra (Hemingway, *The Old Man and the Sea*); la generalización a otros autores, géneros o épocas no está validada.
- Solo inglés; no soporta otros idiomas.
- Longitud máxima de 256 tokens, inferior a los 512 típicos de BERT-large; oraciones largas se truncan.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración deficiente en oraciones ambiguas o irónicas, donde la puntuación ordinal puede ser poco fiable.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo (35 descargas, 0 likes) y la ausencia de validación en producción aconsejan precaución.
- No se han publicado cifras de latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/susurofu/literary-bert-en-large
- Modelo base: https://huggingface.co/google-bert/bert-large-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/susurofu/synthetic-sentiment-dataset-pg-gemma4
- Paper referenciado (arXiv:2611.02985): https://arxiv.org/abs/2611.02985
- Project Gutenberg: https://www.gutenberg.org

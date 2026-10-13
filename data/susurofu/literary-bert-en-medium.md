# susurofu/literary-bert-en-medium

## Resumen

Literary-bert-en-medium es un encoder BERT-medium (41.373.705 parámetros) ajustado por el usuario susurofu para el análisis de sentimiento a nivel de frase en texto literario en inglés. A diferencia de los clasificadores de sentimiento convencionales, no predice tres clases discretas, sino una puntuación ordinal en una escala de diez niveles (1 = más negativo, 10 = más positivo), mediante una cabeza personalizada de regresión ordinal con logits acumulativos.

El modelo parte del checkpoint `google/bert_uncased_L-8_H-512_A-8` (BERT-medium) y se ha entrenado sobre 10.889 frases literarias limpias extraídas de Project Gutenberg, con etiquetas pseudo-anotadas por Gemma 4 31B. Es una de las cinco configuraciones "student" del proyecto, seleccionada por mínima MAE en validación. Su interés actual reside en el nicho de las humanidades digitales: permite cuantificar el tono emocional de corpus narrativos con una granularidad que los clasificadores de tres clases no ofrecen.

La relevancia práctica del modelo es doble. Por un lado, es muy ligero (0,2 GB de repositorio, ventana de 128 tokens) y puede ejecutarse en CPU o en cualquier GPU de consumo. Por otro, incorpora una innovación metodológica poco habitual: los nueve logits de salida representan `P(Y > k)` y deben transformarse con sigmoide y suma para obtener la puntuación esperada, lo que obliga a usar `AutoModel` con `trust_remote_code=True` en lugar del pipeline estándar de clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-medium con cabeza de regresión ordinal (9 umbrales acumulativos) |
| Parametros totales | 41.373.705 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento; el encoder base admite 512 posiciones, no validadas para esta tarea) |
| Tipos de cuantizacion | no especificados por el autor; pesos safetensors compatibles con FP32/FP16/BF16 estándar de PyTorch. No hay GGUF publicado |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible (el campo de licencia está vacío en la ficha de HuggingFace) |
| Formato de pesos | safetensors (con código de modelado personalizado `modeling_ordinal_bert.py`) |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de `google/bert_uncased_L-8_H-512_A-8` (8 capas, 512 dimensiones ocultas, 8 cabezas de atención). El encoder produce una representación pooled que se proyecta a una puntuación latente de sentimiento `s(x)`. Sobre ella se definen nueve umbrales ordenados `θ₁ < ... < θ₉`, parametrizados como un primer umbral más incrementos acumulativos con `softplus` para garantizar el orden. La salida es `logit_k = s(x) − θ_k` para `k = 1,...,9`. El entrenamiento minimiza entropía cruzada binaria frente a nueve objetivos binarios acumulativos `1[label > k]`; en inferencia, `E[Y|x] = 1 + Σ sigmoid(logit_k)`, y la etiqueta redondeada se recorta a `[1,10]`. Se trata de pseudo-etiquetado con etiquetas duras, no de destilación de logits suaves.

Los datos de entrenamiento son 10.889 frases literarias de Project Gutenberg, con un procedimiento de muestreo por autor y obra y eliminación de pasajes cortos o estructurales. Las etiquetas las generó Gemma 4 31B, anotando cada frase de forma independiente en la escala 1–10 y devolviendo un campo JSON `Sentiment_score`. El split estratificado es 80/10/10 (8.711 / 1.089 / 1.089), distinto del conjunto de evaluación humana. La distribución de etiquetas del profesor está fuertemente desbalanceada (41,5 % con puntuación 5; 57,9 % entre 4 y 6), lo que se refleja en el sesgo hacia el centro que se comenta más abajo.

| Distribución de etiquetas del profesor | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| Frases | 239 | 800 | 1.436 | 821 | 4.519 | 960 | 637 | 923 | 474 | 80 |

Hiperparámetros principales: learning rate 2e-5, weight decay 0,01, warmup ratio 0,10, máximo 3 épocas, batch de entrenamiento/evaluación 16/32, acumulación de gradiente 1, optimizador AdamW con scheduler lineal (valores por defecto de Hugging Face Trainer), validación cada 100 pasos, selección de checkpoint por mínima MAE de validación, máximo 6 checkpoints retenidos, semilla 1111 y FP16 activado cuando había CUDA disponible. El checkpoint seleccionado fue el paso 1.100.

## Capacidades

- Regresión ordinal de sentimiento a nivel de frase: devuelve una puntuación continua esperada en el intervalo [1, 10] y su redondeo entero.
- Interpretación descriptiva por tramos: 1–3 negativo, 4–6 casi neutro, 7–10 positivo.
- Extracción de características: al exponer `AutoModel`, permite obtener la representación pooled del encoder para tareas posteriores de clustering, búsqueda o visualización.
- Análisis de texto literario en inglés, incluido registro narrativo clásico (el conjunto de evaluación humana proviene de *The Old Man and the Sea* de Hemingway).
- Procesamiento por lotes con padding y truncado a 128 tokens.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificación, no un modelo generativo.
- No tiene modo "thinking", ni capacidades de visión, audio o generación de texto.
- Multilingüismo: únicamente inglés (`en`).

## Casos de uso

- Análisis de arcos emocionales en novelas: aplicar el modelo frase a frase sobre un texto completo y reconstruir la trayectoria de valencia a lo largo de los capítulos. La escala ordinal de diez niveles permite detectar cambios graduales de tono que un clasificador de tres clases aplastaría.
- Anotación asistida para humanidades digitales: preanotar un corpus con puntuaciones 1–10 antes de que los anotadores humanos revisen, reduciendo el coste de proyectos de anotación manual. La MAE de 0,752 frente a anotadores humanos da una referencia del error esperado.
- Filtrado y curación de corpus: descartar o clasificar pasajes según su carga emocional antes de construir datasets de entrenamiento o de análisis estilométrico.
- Búsqueda semántica por tono: indexar frases con su puntuación y permitir consultas del tipo "pasajes con sentimiento negativo intenso" en bibliotecas digitales o archivos literarios.
- Estudios de recepción y traducción: comparar la puntuación media de un original y sus traducciones para detectar desplazamientos sistemáticos de tono entre versiones.
- Señal auxiliar en pipelines editoriales: priorizar manuscritos o capítulos con perfiles emocionales atípicos para revisión humana, usando el modelo como componente rápido y de bajo coste.
- Investigación en evaluación de sentimiento: servir de baseline "student" en experimentos de destilación de pseudo-etiquetas generadas por modelos grandes, dado que forma parte de una familia de cinco configuraciones comparables.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden al conjunto de evaluación humana independiente de Hemingway (n = 1.923 frases de *The Old Man and the Sea*, con puntuaciones de referencia promediadas entre dos anotadores). Esta obra no se usó ni para el ajuste fino ni para la selección del checkpoint.

| Conjunto | MAE ↓ | Kendall τ ↑ | Spearman ρ ↑ | Precisión ±1 ↑ |
|---|---|---|---|---|
| Hemingway, todas las frases (n = 1.923) | 0,752 | 0,489 | 0,568 | 0,808 |
| Hemingway, frases no neutras (n = 305) | 0,998 | no disponible | no disponible | 0,675 |

La model card menciona que su tabla de evaluación incluye también resultados del modelo profesor y de baselines externos, pero esos datos no están incluidos en el repositorio ni en la información disponible, por lo que no se pueden reproducir aquí. La comparación directa con esos baselines figura como no disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 166 MB para los pesos en FP32 y unos 83 MB en FP16/BF16. Con activaciones y lotes pequeños, el consumo total se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo; su uso solo se justifica por throughput en lotes muy grandes.
- Compatibilidad con GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1050 4 GB o superior) e incluso en CPU, dado el tamaño del modelo y la ventana de 128 tokens.
- Opciones de despliegue: `transformers` con `AutoModel` y `trust_remote_code=True` (obligatorio, porque la cabeza ordinal no es estándar); el repositorio está etiquetado como compatible con Text Embeddings Inference y con endpoints de HuggingFace. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas sin conversión y reimplementación de la cabeza.
- Latencia y throughput: no disponible. Al tratarse de un encoder de 41 M de parámetros con secuencias de 128 tokens, es un modelo de coste muy bajo, pero no se han publicado cifras medidas.

## Comparativa con modelos similares

No se han publicado comparaciones directas de benchmarks entre este modelo y alternativas de la misma categoría. La tabla siguiente recoge solo características estructurales de checkpoints públicos de la misma familia o tarea; los campos no verificables se marcan como no disponibles.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| susurofu/literary-bert-en-medium | 41,4 M | 128 tokens (entrenamiento) | Regresión ordinal de sentimiento literario, 10 niveles | no disponible | safetensors + código personalizado |
| google/bert_uncased_L-8_H-512_A-8 | 41,4 M | 512 tokens | Encoder base (MLM), sin cabeza de clasificación | Apache 2.0 | safetensors / PyTorch |
| distilbert-base-uncased-finetuned-sst-2-english | 66 M | 512 tokens | Clasificación binaria de sentimiento (SST-2) | Apache 2.0 | safetensors / PyTorch |
| Modelo profesor Gemma 4 31B | ~31.000 M | no disponible | Generación y anotación de pseudo-etiquetas | no disponible | no disponible |

Rendimiento comparado: no disponible. La diferencia funcional clave frente a los clasificadores de sentimiento convencionales es la granularidad ordinal (10 niveles) y el dominio objetivo (texto literario en lugar de reseñas o redes sociales).

## Limitaciones y advertencias

- La cabeza de salida no es estándar: produce nueve logits acumulativos, no diez logits de clase. Usar `AutoModelForSequenceClassification` o el pipeline `sentiment-analysis` por defecto dará resultados incorrectos. Los logits nunca deben pasarse por softmax ni por argmax.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio (`modeling_ordinal_bert.py`). Conviene revisar ese archivo antes de desplegarlo en producción.
- El identificador usado en el ejemplo de la model card (`susurofu/ordinal-literary-sentiment-bert-medium`) no coincide con el identificador del repositorio (`susurofu/literary-bert-en-medium`). Verificar cuál resuelve correctamente antes de integrarlo.
- Las etiquetas de entrenamiento son pseudo-etiquetas generadas por un modelo (Gemma 4 31B), no anotaciones humanas, y están fuertemente desbalanceadas hacia el centro de la escala: el 41,5 % de las frases recibió un 5 y el 57,9 % se sitúa entre 4 y 6. Es esperable un sesgo hacia valores centrales y una infrarepresentación de los extremos (en especial el 10, con solo 80 ejemplos).
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de calibración incorrecta fuera del dominio: el modelo se entrenó con prosa literaria clásica en inglés, y su comportamiento en redes sociales, texto técnico o diálogo informal no está validado.
- Limitación de idioma: solo inglés. No se ha entrenado ni evaluado en castellano.
- Limitación de longitud: máximo de 128 tokens; las frases más largas se truncan, lo que puede alterar la puntuación.
- La licencia no está declarada en la ficha de HuggingFace. Sin una licencia explícita, el uso comercial queda en una zona jurídica indeterminada y conviene contactar con el autor antes de integrarlo en un producto.
- Los resultados de evaluación provienen de un único corpus humano (Hemingway, 1.923 frases) y de una única tradición literaria; la generalización a otros autores, géneros o épocas no está cuantificada.
- El modelo no genera explicaciones ni justifica sus puntuaciones: la salida es un escalar sin trazabilidad.
- Las métricas publicadas (MAE 0,752; precisión ±1 0,808) proceden de anotaciones humanas con dos anotadores promediados; no se reporta el acuerdo entre anotadores, lo que limita la interpretación del techo de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/susurofu/literary-bert-en-medium
- Modelo base: https://huggingface.co/google/bert_uncased_L-8_H-512_A-8
- Documentación de Transformers sobre modelos con código personalizado: https://huggingface.co/docs/transformers/custom_models
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Todas las entradas devueltas tratan sobre la herramienta de parafraseo QuillBot y no guardan relación con el modelo.
- Paper, blog o repositorio adicional del autor: no disponible.

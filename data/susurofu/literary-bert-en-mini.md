# susurofu/literary-bert-en-mini

## Resumen

Literary Sentiment Ordinal BERT — Mini es un encoder BERT-mini (`google/bert_uncased_L-4_H-256_A-4`, 11.170.825 parámetros) afinado por el usuario susurofu para asignar una puntuación de sentimiento ordinal en una escala de 1 a 10 sobre frases de literatura en inglés. A diferencia de los clasificadores de sentimiento habituales (positivo/neutro/negativo), el modelo trata el sentimiento como una variable ordinal continua: produce nueve logits acumulados que, tras una sigmoide y una suma, dan una expectativa matemática `E[Y|x]` en el intervalo [1, 10].

El problema que resuelve es concreto y de nicho: la ausencia de anotaciones graduadas de valencia emocional en corpus literarios. Para construir la supervisión se generaron 10.889 pseudoetiquetas con Gemma 4 31B sobre frases limpias de Project Gutenberg, y el modelo se entrena con regresión ordinal por entropía cruzada binaria sobre los nueve umbrales acumulados. La validación final se hace contra un corpus humano independiente (1.923 frases de *The Old Man and the Sea* de Hemingway, nunca usado en entrenamiento ni en selección de checkpoint).

Su relevancia ahora es doble: por un lado demuestra que un modelo de 11 M de parámetros puede alcanzar un MAE de 0,766 frente a anotadores humanos en una tarea subjetiva; por otro, es una de las cinco configuraciones "estudiante" destiladas a partir de un profesor de 31 B, una receta de destilación de pseudoetiquetas reproducible y barata para humanidades digitales. La contrapartida es su alcance muy acotado: solo inglés, 128 tokens de entrada y una cabeza custom que exige `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (`bert_uncased_L-4_H-256_A-4`: 4 capas, 256 de ocultas, 4 cabezas de atención) con cabeza custom de regresión ordinal (9 umbrales acumulados) |
| Parametros totales | 11.170.825 (11,3 M) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión de entrenamiento; no hay versiones GGUF, ONNX ni int8 publicadas) |
| Idiomas soportados | en (inglés únicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors + código Python custom (`modeling_ordinal_bert.py`) |
| Tarea (pipeline) | `text-classification` (en la práctica, regresión ordinal / feature extraction) |
| Salida | 9 logits acumulados `logit_k = s(x) − θ_k`, k = 1..9; NO son 10 logits de clase |
| Modelo base | `google/bert_uncased_L-4_H-256_A-4` |
| Dataset de entrenamiento | `susurofu/synthetic-sentiment-dataset-pg-gemma4` |
| Descargas / likes | 92 descargas, 1 like (a fecha de la última actualización, 2026-10-25) |
| Creado / actualizado | 2026-10-12 / 2026-10-25 |

## Arquitectura y entrenamiento

El encoder BERT-mini genera una representación pooled que se proyecta a un único score latente de sentimiento `s(x)`. A partir de ahí, nueve umbrales entrenables `θ₁ < ... < θ₉` se parametrizan con un primer umbral libre más incrementos acumulados vía `softplus`, garantizando el orden. El modelo devuelve `logit_k = s(x) − θ_k` para k = 1..9; tras la sigmoide, cada logit representa `P(Y > k)`. En inferencia, el score esperado se calcula como `E[Y|x] = 1 + Σ sigmoid(logit_k)` y la etiqueta discreta es el entero más cercano recortado a [1, 10]. El entrenamiento minimiza entropía cruzada binaria contra nueve objetivos binarios acumulados `1[label > k]`, con pseudoetiquetas duras (no destilación de logits suaves).

Los datos de supervisión son 10.889 frases literarias limpias de Project Gutenberg, con muestreo por autor y obra y eliminación de pasajes cortos o estructurales. Cada frase fue anotada de forma independiente por Gemma 4 31B, que devolvía un campo JSON `Sentiment_score` entero en la escala 1–10. El reparto es estratificado 80/10/10 (8.711 / 1.089 / 1.089), y el conjunto de test humano de Hemingway (1.923 frases, media de dos anotadores) se mantuvo completamente fuera del entrenamiento y de la selección de checkpoint. Hiperparámetros: learning rate 2e-5, weight decay 0,01, warmup ratio 0,10, 3 épocas máximas, batch 16 en train y 32 en eval, acumulación de gradiente 1, AdamW con scheduler lineal, seed 1111, FP16 cuando había CUDA, evaluación y checkpoint cada 100 pasos de optimización, selección por menor MAE de validación y checkpoint escogido en el paso 1.600.

La distribución de etiquetas del profesor está fuertemente desbalanceada hacia el centro de la escala: el score 5 concentra el 41,5 % de las frases y el rango 4–6 el 57,9 %. El desglose completo es: score 1 → 239; 2 → 800; 3 → 1.436; 4 → 821; 5 → 4.519; 6 → 960; 7 → 637; 8 → 923; 9 → 474; 10 → 80.

## Capacidades

- Puntuación de sentimiento ordinal a nivel de frase en una escala de 1 a 10, con salida continua (score esperado) y discreta (entero redondeado).
- Interpretación descriptiva por tramos: 1–3 negativo, 4–6 casi neutro, 7–10 positivo.
- Extracción de representaciones (`feature-extraction`): el encoder pooled puede reutilizarse como embedding de frase de 256 dimensiones.
- Análisis de texto literario narrativo en inglés (prosa de ficción), que es el dominio de entrenamiento.
- No soporta tool calling ni function calling: no es un modelo generativo ni conversacional.
- No soporta agentes, razonamiento multi-paso ni cadena de pensamiento: es un encoder discriminativo de una sola pasada.
- No soporta visión, audio ni multimodalidad.
- Multilingüe: no. Únicamente inglés (`en`); el tokenizador es `uncased`, por lo que la puntuación y las mayúsculas se normalizan.

## Casos de uso

- Análisis de arco emocional en corpus narrativos: puntuar cada frase de una novela con el score continuo y reconstruir la curva de valencia a lo largo del texto; los 128 tokens cubren la mayoría de frases literarias sin truncar y el coste por frase es mínimo.
- Humanidades digitales a escala de archivo: procesar decenas de miles de frases de Project Gutenberg o de un repositorio institucional para estudios de estilo, comparación entre autores o evolución histórica del tono, algo inviable con un profesor de 31 B por coste de inferencia.
- Filtrado y curación previa de corpus de entrenamiento: marcar pasajes con valencia muy negativa (score ≤ 3) para revisión editorial antes de usar el corpus en un pipeline de datos, o para equilibrar la distribución de tono de un dataset.
- Investigación en psicolingüística y validación de anotaciones: usar el modelo como segundo anotador automático y comparar sus puntuaciones con las de anotadores humanos para detectar frases con alta discrepancia; el MAE de 0,766 y la precisión ±1 de 0,829 sobre Hemingway dan una referencia cuantitativa de la concordancia esperada.
- Segmentación de guiones o audiolibros: clasificar tramos de un texto para asignar indicaciones de narración (tono neutro, tenso, positivo) en un pipeline de TTS, usando el score continuo como señal de control.
- Sistemas de recomendación de lectura por tono: calcular el perfil emocional agregado de un libro o relato y usarlo como característica en un recomendador ("lecturas de tono similar"), con la ventaja de que el modelo cabe en CPU y no requiere GPU dedicada.
- Señal auxiliar en moderación editorial de contenido sensible: detectar frases con carga negativa extrema en manuscritos o comentarios de usuarios y derivarlas a revisión humana, siempre como filtro de primera pasada y nunca como decisión final.

## Benchmarks y rendimiento

Evaluación sobre el corpus humano independiente de Hemingway (n = 1.923 frases, referencia = media de dos anotadores):

| Metrica | Todas las frases (n = 1.923) | Subconjunto no neutro (n = 305) |
|---|---|---|
| MAE ↓ | 0,766 | 0,969 |
| Kendall τ ↑ | 0,402 | no disponible |
| Spearman ρ ↑ | 0,472 | no disponible |
| Pearson r ↑ | no disponible | no disponible |
| Precision ±1 ↑ | 0,829 | 0,708 |

La model card incluye además una tabla comparativa con el profesor (Gemma 4 31B) y con modelos de referencia externos, pero en la información disponible esa tabla aparece truncada en la columna "Prec. ±1", por lo que los valores de los modelos comparados no se pueden reproducir aquí. Los resultados del profesor y de los baselines externos se marcan, por tanto, como no disponibles.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en cualquier precisión. El checkpoint en fp32 ocupa aproximadamente 45 MB (11,17 M de parámetros × 4 bytes); en fp16, unos 22 MB.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con CUDA, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. El cuello de botella es el preprocesado y el I/O, no la memoria.
- Cabe en GPU de consumo: sí, holgadamente, y también en CPU. Es viable en un portátil o en una Raspberry Pi para lotes pequeños, aunque la latencia por frase en CPU es mayor.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)` (obligatorio, por la cabeza custom); el repositorio está etiquetado como compatible con `text-embeddings-inference` y con endpoints compatibles. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no pueden cargarlo tal cual; vLLM y TGI requerirían adaptar la cabeza ordinal, ya que asumen `AutoModelForSequenceClassification` estándar.
- Latencia y throughput: no publicados. Como estimación por tamaño (11 M de parámetros, 128 tokens), con batches grandes en una GPU moderna se puede procesar del orden de miles de frases por segundo, y cientos por segundo en CPU multinúcleo; conviene medirlo en el hardware objetivo antes de dimensionar un pipeline.
- Advertencia de despliegue: no usar `pipeline("sentiment-analysis")` ni `AutoModelForSequenceClassification`; interpretarían los nueve logits acumulados como clases independientes y producirían resultados incorrectos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| susurofu/literary-bert-en-mini | 11,17 M | 128 tokens | Ordinal 1–10 (9 logits acumulados) | Apache-2.0 | MAE 0,766 y precisión ±1 0,829 en Hemingway (n = 1.923) |
| google/bert_uncased_L-4_H-256_A-4 (encoder base) | 11,3 M | 512 posiciones en el encoder original (128 en este fine-tune) | Representaciones / MLM, sin cabeza de sentimiento | Apache-2.0 | no disponible (no es un modelo de sentimiento) |
| Los otros cuatro "estudiantes" de la misma familia (Gemma 4 31B como profesor) | no disponible | no disponible | Ordinal 1–10 | no disponible | no disponible en esta información |
| Gemma 4 31B (profesor de las pseudoetiquetas) | ~31 B (según denominación) | no disponible | Generativa, etiquetado vía prompt | no disponible | Referenciado en la model card, valores truncados en la fuente |
| Clasificadores de sentimiento de 3 clases tipo DistilBERT/RoBERTa (p. ej. SST-2, Twitter) | ~66 M / ~125 M | 512 tokens | 3 clases ordinales nominales | Apache-2.0 / MIT habitualmente | no disponible en esta información; no evaluados sobre Hemingway |

La diferencia funcional clave frente a los clasificadores de tres clases no es solo de tamaño: aquí la salida es una escala graduada con umbrales ordenados, lo que permite medir intensidad y calcular correlaciones de rango (Kendall, Spearman) contra anotaciones humanas, algo que una clasificación categórica no ofrece.

## Limitaciones y advertencias

- Solo inglés: el tokenizador y el corpus son ingleses; cualquier texto en otro idioma produce puntuaciones sin significado validado.
- Ventana de 128 tokens: frases largas o párrafos se truncan. El modelo está diseñado para frases, no para documentos completos.
- Sesgo hacia el centro de la escala: el profesor asignó el 41,5 % de las etiquetas al score 5 y solo 80 casos al score 10, de modo que el modelo tiende a comprimir las predicciones hacia valores medios y probablemente infradetecta los extremos positivos.
- Dominio acotado: el entrenamiento usa prosa de Project Gutenberg y la evaluación es Hemingway (1920s–1950s). El rendimiento en textos contemporáneos, diálogo, poesía o lenguaje informal no está validado.
- Error no despreciable: MAE 0,766 y 0,969 sobre escala de 10, y precisión ±1 de 0,829 significa que aproximadamente una de cada seis frases se desvía más de un punto. No es apto para decisiones automáticas sin revisión.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de falsa confianza: una puntuación concreta puede no corresponder a ninguna interpretación humana estable en frases ambiguas o irónicas.
- La supervisión es sintética: las etiquetas provienen de un único LLM profesor, con los sesgos de ese profesor incorporados y sin verificación humana en el conjunto de entrenamiento.
- Riesgo de ejecución de código: requiere `trust_remote_code=True`, lo que descarga y ejecuta `modeling_ordinal_bert.py` del repositorio. Conviene auditar ese archivo y fijar una revisión concreta antes de usarlo en producción.
- Uso incorrecto habitual: aplicar softmax o argmax sobre los nueve logits invalida la semántica del modelo.
- Licencia: los pesos son Apache-2.0, lo que permite uso comercial, pero las pseudoetiquetas se generaron con Gemma 4 31B; conviene revisar los términos de uso de Gemma antes de explotar comercialmente el modelo o sus derivados.
- Madurez: 92 descargas y 1 like indican una validación comunitaria prácticamente nula. No hay informes independientes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/susurofu/literary-bert-en-mini
- Modelo base: https://huggingface.co/google/bert_uncased_L-4_H-256_A-4
- Dataset de pseudoetiquetas: https://huggingface.co/datasets/susurofu/synthetic-sentiment-dataset-pg-gemma4
- Código de la cabeza ordinal (incluido en el repo): `modeling_ordinal_bert.py` en https://huggingface.co/susurofu/literary-bert-en-mini/blob/main/modeling_ordinal_bert.py
- Script de inferencia de ejemplo (incluido en el repo): `example_inference.py` en https://huggingface.co/susurofu/literary-bert-en-mini/blob/main/example_inference.py
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

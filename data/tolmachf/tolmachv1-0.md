# tolmachf/tolmachv1.0

## Resumen

El modelo `tolmachv1.0`, desarrollado por el usuario `tolmachf`, es un regresor fine-tuneado sobre `answerdotai/ModernBERT-base` para puntuar ensayos de la tarea 2 del IELTS Writing. A diferencia de los modelos generativos de lenguaje, este modelo resuelve un problema de regresión: recibe como entrada el par `(pregunta, ensayo)` y devuelve cinco valores entre 1 y 9 correspondientes a las bandas de Overall, Task Response, Coherence & Cohesion, Lexical Resource y Grammatical Range & Accuracy. Está diseñado para la evaluación automatizada de ensayos académicos en inglés, un área con demanda creciente en plataformas de aprendizaje y herramientas de corrección.

El modelo se entrenó con 114.349 ensayos del dataset `ndtran0101/writing9-ielts-essays`, un corpus que tras limpieza contiene 165.800 filas, de las cuales 163.286 tienen etiquetas para los cinco criterios. La evaluación se realizó sobre una partición held-out de 6.000 ensayos. En cuanto a la arquitectura, se trata de un encoder transformer moderno (ModernBERT-base) con una longitud de contexto configurada en 768 tokens, elegida empíricamente porque el percentil 99 de la longitud de un par pregunta+ensayo es de 581 tokens. El repositorio pesa 0,6 GB y no es un modelo `transformers` estándar, sino un `state_dict` de PyTorch que requiere un loader personalizado incluido en el propio repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base fine-tuneado como regresor de regresión (encoder transformer) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 tokens (max_len configurado; el modelo base ModernBERT soporta hasta 8192) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | unknown |
| Formato de pesos | state_dict de PyTorch (`model.pt`) con tokenizer ModernBERT y loader personalizado (`modeling_band_regressor.py`) |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un regresor construido sobre `answerdotai/ModernBERT-base`, un encoder transformer de la familia BERT. La entrada se compone de la pregunta del IELTS y el ensayo del estudiante, concatenados y tokenizados con el tokenizer de ModernBERT. La salida es un vector de cinco valores continuos que se interpretan como las bandas de los cinco criterios de evaluación. El checkpoint no es un modelo `transformers` estándar, sino un `state_dict` de PyTorch, por lo que se necesita el módulo `modeling_band_regressor.py` incluido en el repositorio para cargarlo y ejecutarlo.

El entrenamiento se realizó sobre 114.349 ensayos del dataset `ndtran0101/writing9-ielts-essays`, excluyendo las filas sintéticas etiquetadas como `band9_augmented`. La evaluación se llevó a cabo sobre una partición held-out de 6.000 ensayos del mismo dataset. La longitud de contexto se determinó de forma empírica: con 448 tokens se truncaban el 15,8% de los ensayos, perdiendo la conclusión en promedio, lo que perjudicaba especialmente a los criterios de Coherence & Cohesion. ModernBERT elimina el truncamiento por completo y, según el autor, supera a una variante `roberta-base/512` en todas las diez métricas evaluadas. El `max_len` se fijó en 768 tokens, por encima del percentil 99 de 581 tokens. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Predicción de cinco bandas IELTS (Overall, Task Response, Coherence & Cohesion, Lexical Resource y Grammatical Range & Accuracy) a partir del par pregunta-ensayo.
- Salida en rango 1–9, redondeada a la media banda más cercana por defecto; también ofrece salida cruda sin redondeo mediante `score_many`.
- Procesamiento por lotes de ensayos mediante la función `score_many(questions, essays)`.
- Soporte exclusivo para texto en inglés.
- No es un modelo generativo: no genera texto, ni soporta tool calling, ni tiene capacidades de agentes o razonamiento multi-paso.
- Requiere el loader personalizado incluido en el repositorio; no se puede abrir con `AutoModel.from_pretrained`.

## Casos de uso

- Plataformas de preparación de IELTS: el modelo puede puntuar ensayos al instante y devolver las cinco bandas, lo que permite al estudiante identificar rápidamente sus puntos débiles en cada criterio. Con un MAE de 0,658 en Overall, la puntuación es lo bastante aproximada para orientar el estudio.
- Cursos de escritura académica: los estudiantes pueden usarlo como herramienta de autoevaluación antes de entregar sus trabajos, recibiendo una estimación de la banda y un desglose por criterios que les ayuda a priorizar la revisión.
- Apoyo a profesores: el modelo puede pre-puntuar un volumen alto de ensayos y filtrar aquellos que probablemente necesitan revisión humana, reduciendo el tiempo de corrección. Debe usarse como una señal más, no como juez único.
- Investigación en evaluación automatizada de escritura (AES): sirve como referencia comparativa frente a baselines clásicos como TF-IDF + Ridge (MAE 0,865 en Overall) o variantes de roberta-base, para estudiar el impacto de arquitecturas modernas en esta tarea.
- Analítica de progreso estudiantil: las cinco salidas permiten monitorizar la evolución de un estudiante a lo largo del tiempo en cada dimensión, detectando mejoras o estancamientos en aspectos concretos como gramática o cohesión.
- Etiquetado débil de datos: el modelo puede generar puntuaciones automáticas para grandes volúmenes de ensayos, sirviendo como fuente de etiquetas para entrenar otros modelos o construir datasets de evaluación.
- Evaluación de ensayos generados por LLM: puede usarse como una señal adicional para puntuar textos producidos por modelos de lenguaje, aunque con la advertencia de que en este dominio tiende a puntuar alrededor de una banda por debajo de un examinador LLM fuerte.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, no verificados de forma independiente. Evaluación sobre una partición held-out de 6.000 ensayos del dataset `writing9-ielts-essays`, con predicciones sin calibrar.

| Criterio | MAE | ±0.5 | ±1.0 | Pearson r |
|---|---|---|---|---|
| Overall | 0.658 | 50.3% | 80.0% | 0.772 |
| Task Response | 1.026 | 32.8% | 58.3% | 0.570 |
| Coherence & Cohesion | 0.847 | 43.0% | 69.0% | 0.602 |
| Lexical Resource | 0.717 | 54.2% | 76.1% | 0.802 |
| Grammatical Range & Accuracy | 0.892 | 52.8% | 70.8% | 0.773 |

El autor también reporta un baseline TF-IDF + Ridge sobre la misma partición, que alcanza un MAE de 0.865 y una correlación de Pearson de 0.625 en Overall. El modelo transformer supera al baseline en los cinco criterios; la mayor diferencia se observa en Grammar, donde la precisión dentro de media banda se triplica (17.5% → 52.8%), algo que el autor atribuye a la incapacidad estructural de un modelo bag-of-words para capturar la gramática.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se han publicado mediciones oficiales.
- GPU recomendadas: no disponible. Al tratarse de un encoder base, es probable que funcione en GPUs de consumo, pero no hay confirmación.
- ¿Cabe en GPU consumer? No hay datos oficiales. El tamaño del repositorio (0,6 GB) sugiere que la inferencia es ligera, pero no se puede afirmar con certeza.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama o TGI, ya que el checkpoint es un `state_dict` de PyTorch con un loader personalizado. Se puede cargar con PyTorch usando `modeling_band_regressor.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | MAE Overall | Pearson r Overall | Contexto | Observaciones |
|---|---|---|---|---|
| tolmachv1.0 (ModernBERT-base) | 0.658 | 0.772 | 768 tokens | Regresor fine-tuneado con loader personalizado |
| TF-IDF + Ridge | 0.865 | 0.625 | No aplica | Baseline clásico; no captura gramática |
| roberta-base/512 | no disponible | no disponible | 512 tokens | Superado por ModernBERT en todas las métricas según el autor |

No se han encontrado en la información disponible comparaciones con otros modelos de puntuación de ensayos de la misma categoría.

## Limitaciones y advertencias

- Compresión de escala: los ensayos débiles se puntúan hacia arriba (+0.46 en bandas 4–5.5) y los fuertes hacia abajo (−0.83 en bandas 8–9). Existe una corrección de calibración en `calibration.json` que reduce el sesgo a +0.30/−0.56, pero aumenta el MAE de Overall de 0.658 a 0.681; el autor solo la acepta para el criterio Overall.
- Evaluación de una sola fuente: el entrenamiento y el test provienen del mismo dataset. El rendimiento fuera de esa fuente no se ha medido, y la correlación r = 0.77 no debe asumirse como transferible.
- Domain shift en texto generado por LLM: en ensayos escritos por un modelo de lenguaje, el sistema puntúa aproximadamente una banda por debajo de un examinador LLM fuerte, porque se entrenó con escritura humana y el texto generado queda parcialmente fuera de distribución.
- Criterio más débil: Task Response (Pearson r = 0.57). Juzgar si un ensayo responde realmente a la pregunta requiere comprender el prompt, y 114k ejemplos con etiquetas ruidosas no bastan para lograrlo.
- Ruido de anotación: en 84 pares de ensayos idénticos evaluados de forma independiente, los raters humanos discrepan 0.393 bandas en Overall, con un error de un solo rater de aproximadamente 0.278. El modelo es 2.4 veces peor que un humano en Overall y unas 6 veces peor en Lexical y Grammar.
- No debe usarse como juez único en ninguna decisión con consecuencias para una persona. En el pipeline para el que fue diseñado, es una señal ruidosa entre varias, y un examinador LLM toma la decisión final.
- Licencia unknown: no se especifican los permisos de uso, lo que puede limitar su aplicación comercial.
- No es un modelo `transformers` estándar: no se puede abrir con `AutoModel.from_pretrained`; requiere el loader personalizado incluido en el repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/tolmachf/tolmachv1.0

No se han encontrado otros enlaces relevantes en la búsqueda web.

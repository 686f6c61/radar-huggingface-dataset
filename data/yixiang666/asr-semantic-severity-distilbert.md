# yixiang666/asr-semantic-severity-distilbert

## Resumen

El modelo `yixiang666/asr-semantic-severity-distilbert` es un clasificador de texto basado en DistilBERT afinado para una tarea muy concreta: puntuar en una escala ordinal de 1 a 5 cuánto cambia el significado de una intervención el hecho de que un sistema ASR (reconocimiento automático del habla) cometa un error concreto. Es decir, no mide si una transcripción es correcta o incorrecta, sino la gravedad semántica de cada error individual, desde "insignificante" hasta "crítico". Lo desarrolla el autor `yixiang666` en el marco del proyecto de curso *Context-Aware Semantic Error Profiling for ASR* (CMU 11-751, otoño de 2026).

El modelo es un "student" destilado a partir de etiquetas generadas por un profesor LLM (DeepSeek-V4.1-Flash) sobre 9.000 tramos de error extraídos de transcripciones de reuniones del corpus AMI, procedentes de tres sistemas ASR distintos (Whisper large-v3, wav2vec2-large y Parakeet-TDT-0.6b-v2). La innovación principal es tratar la tarea como una regresión ordinal con umbrales acumulativos, lo que permite obtener una puntuación continua en [1, 5] en lugar de una clasificación discreta.

Su relevancia práctica radica en que alimenta una métrica alternativa al WER clásico, el Semantic-WER, que pondera cada edición de palabra según la gravedad semántica del error en lugar de contarlas todas por igual. Con 66,9 millones de parámetros y un contexto máximo de 256 tokens, es un modelo muy ligero pensado para integrarse en pipelines de evaluación de ASR, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) con cabeza de clasificación ordinal de 4 salidas |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncado en el tokenizador) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatibles con cuantización estándar de transformers, pero no se documentan variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un DistilBERT base uncased (6 capas, 768 dimensiones ocultas, ~66 M de parámetros) con una cabeza de clasificación que devuelve 4 logits crudos. Estos logits no se interpretan como clases independientes, sino como parámetros de un modelo ordinal de umbrales acumulativos: se aplica softplus a las diferencias entre logits consecutivos, se acumulan y se obtienen los logits de P(severidad > k) para k = 1..4. La puntuación final es 1 + la suma de las sigmoides de esos umbrales, lo que da un valor continuo en [1, 5] que luego se redondea al nivel entero.

El entrenamiento se realizó por destilación desde un profesor LLM (DeepSeek-V4.1-Flash) con una rúbrica fija (v2.4) sobre 9.000 tramos de error de AMI, 3.000 por cada uno de los tres sistemas ASR. La entrada es un par de secuencias tokenizadas conjuntamente: el contexto previo de la reunión y un objetivo que marca el error como `[[ref span → hyp span]]` seguido de `[SEP]` y la referencia con solo ese error aplicado. El checkpoint se seleccionó por MAE en el split de desarrollo. No se documentan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset más allá de AMI, ni si hubo RLHF o DPO (no aplica en una tarea de clasificación).

## Capacidades

- Puntuación de gravedad semántica de errores ASR individuales en escala ordinal de 1 a 5, con salida continua en [1, 5].
- Procesamiento de pares (contexto, objetivo) con marcado explícito del error mediante `[[ref → hyp]]` y separador `[SEP]`.
- Uso del contexto conversacional previo (intervenciones anteriores de la reunión) para desambiguar el impacto del error.
- Salida compatible con `text-classification` de transformers y con Text Embeddings Inference (endpoints compatibles).
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Evaluación de sistemas ASR con Semantic-WER: el modelo puntúa cada error de una transcripción y el pipeline pondera las ediciones de palabra por `(severidad − 1) / 4`, obteniendo una métrica más alineada con el impacto real que el WER plano.
- Priorización de correcciones en post-edición de transcripciones: dado un transcript con múltiples errores, el modelo permite ordenar cuáles afectan más al significado para que un revisor humano los corrija primero.
- Control de calidad en pipelines de subtitulado automático: filtrar segmentos donde los errores detectados superan un umbral de severidad (por ejemplo, ≥ 4) para revisión manual, reduciendo el coste de QA.
- Comparación de modelos ASR en producción: al evaluar Whisper, wav2vec2 y Parakeet sobre el mismo audio, el modelo permite comparar no solo la tasa de error sino la gravedad semántica de los errores de cada sistema.
- Investigación en métricas de ASR: como componente del proyecto Semantic-WER, sirve para estudiar la correlación entre métricas automáticas y juicio humano en dominios de reuniones.
- Detección de errores críticos en dominios sensibles: en transcripciones de reuniones con decisiones (fechas, cifras, negaciones), el modelo ayuda a identificar errores que invierten el significado (por ejemplo, "cannot" → "can") y que un WER bajo podría ocultar.
- Análisis de errores por sistema ASR: agregar las puntuaciones por tipo de error y por sistema para diagnosticar qué modelos fallan de forma más dañina, no solo más frecuente.

## Benchmarks y rendimiento

| Conjunto | Etiquetas de referencia | n | QWK | Spearman | MAE |
|---|---|---:|---:|---:|---:|
| AMI test, balanceado (400 tramos por ASR) | Profesor DeepSeek | 1.200 | 0,768 | 0,711 | 0,333 |
| Piloto humano | Media de 2 anotadores | 50 | 0,798 | 0,758 | no disponible |

En los mismos 50 tramos valorados por humanos, las baselines sin entrenamiento alcanzan QWK 0,583 (distancia BERTScore) y 0,640 (SemDist), tras mapeo isotónico a 1–5. Dos anotadores humanos coinciden con un α de Krippendorff ordinal de 0,789.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (66,9 M de parámetros, ~268 MB de pesos); en fp16 ~134 MB. Cabe holgadamente en cualquier GPU consumer, incluso integradas.
- GPU recomendadas: no requiere GPU dedicada; una RTX 4090, A100 o H100 lo ejecutan con latencia despreciable, pero también funciona en CPU con throughput aceptable para evaluación por lotes.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos ~1 GB de VRAM libre (GTX 1050, RTX 3060, etc.).
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (endpoints compatibles), y cualquier runtime que cargue safetensors de transformers; no se documentan integraciones con vLLM, llama.cpp u Ollama (no aplica a un encoder de clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| asr-semantic-severity-distilbert | 66,9 M | 256 | Clasificación ordinal de gravedad de errores ASR | Apache 2.0 | Hugging Face |
| DistilBERT base uncased | 66,4 M | 512 | Clasificación/encoding genérico | Apache 2.0 | Hugging Face |
| BERTScore (baseline) | no aplica (métrica) | no aplica | Distancia semántica sin entrenamiento | no disponible | Librería |
| SemDist (baseline) | no aplica (métrica) | no aplica | Distancia semántica sin entrenamiento | no disponible | Librería |

Las baselines BERTScore y SemDist alcanzan QWK 0,583 y 0,640 respectivamente en el piloto humano, frente a 0,798 del modelo. No se dispone de comparación con otros clasificadores ordinales específicos para esta tarea.

## Limitaciones y advertencias

- Solo inglés y solo dominio de reuniones (AMI): no se ha validado en otros idiomas ni en otros dominios (conversación espontánea, llamadas, etc.).
- Entrenado únicamente con errores de tres sistemas ASR concretos (Whisper large-v3, wav2vec2-large, Parakeet-TDT-0.6b-v2); puede generalizar mal a otros sistemas.
- La validación humana cubre solo 50 tramos, que además se usaron durante el desarrollo de la rúbrica y la elección del profesor, por lo que el QWK humano puede estar optimista.
- Un solo seed de entrenamiento: no se reporta variabilidad entre ejecuciones.
- Las etiquetas provienen de un profesor LLM (DeepSeek-V4.1-Flash), por lo que el modelo hereda sus sesgos y juicios.
- Puntúa errores de uno en uno: ignora interacciones entre varios errores en la misma intervención.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir puntuaciones mal calibradas fuera de la distribución de AMI.
- Licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento fuera del dominio evaluado.

## Enlaces

- Hugging Face: https://huggingface.co/yixiang666/asr-semantic-severity-distilbert
- Repositorio del proyecto: https://github.com/DEM1TASSE/asr-semantic-wer
- Dataset AMI: https://huggingface.co/datasets/edinburghcstr/ami
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased

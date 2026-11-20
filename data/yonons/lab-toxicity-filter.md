# yonons/lab-toxicity-filter

## Resumen

`yonons/lab-toxicity-filter` es un modelo de clasificación de toxicidad derivado de `bert-base-uncased`, publicado por el usuario yonons en Hugging Face. El modelo se presenta como un filtro de toxicidad orientado a moderación de foros, entrenado sobre un dataset denominado `forum-moderation` durante 6 épocas con una tasa de aprendizaje de 2e-5 y un tamaño de lote de 8. No se especifica el pipeline declarado en la ficha de Hugging Face, aunque por su base y propósito cabe inferir una tarea de clasificación de texto.

La relevancia del modelo es limitada: cuenta con cero descargas y cero likes, no declara licencia, idiomas ni pipeline, y su propio autor restringe el uso previsto a "experimentos offline y paneles de control". Los únicos datos de rendimiento publicados son sobre un conjunto denominado `held-out-2025`, con un macro-F1 de 0,733 y una precisión de 0,757.

Se trata, por tanto, de un artefacto experimental de laboratorio más que de un modelo listo para producción. Su interés principal es documental: ilustra un caso de fine-tuning de BERT para moderación con métricas publicadas, pero carece de la información mínima (licencia, idiomas, pipeline, composición del dataset) que exigiría una evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (bert-base-uncased como modelo base); no se detalla la cabeza de clasificación |
| Parametros totales | no disponible (el modelo base bert-base-uncased tiene aproximadamente 110 millones, pero no se confirma para este derivado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base admite 512 tokens, no confirmado para este derivado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés únicamente (según la model card: "Trained on English data only") |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de tipo BERT. No se especifica la cabeza de clasificación ni el número de etiquetas de salida, aunque el contexto de "filtro de toxicidad" sugiere una clasificación binaria o multiclase de toxicidad. Tampoco se detalla si se congelaron capas del encoder o se hizo fine-tuning completo.

El entrenamiento se realizó sobre un dataset llamado `forum-moderation`, con 6 épocas, tasa de aprendizaje 2e-5 y batch size 8. No se indica el número de tokens, la composición del dataset, ni si se aplicaron técnicas de desbalanceo de clases, aumentación de datos o RLHF/DPO (poco habituales en un modelo de clasificación de este tamaño). La model card incluye un changelog con una versión inicial (2025-08-06) y una actualización de la tabla de evaluación (2025-10-06), pero no documenta cambios en los pesos.

## Capacidades

- Clasificación de texto orientada a detección de toxicidad, presumiblemente en una o varias categorías (no se especifican las etiquetas).
- Entrenado exclusivamente con datos en inglés.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documenta razonamiento multi-paso, matemáticas, código ni visión.
- No se documenta modo "thinking" ni capacidades multimodales.
- El uso previsto declarado es limitado: experimentos offline y paneles de control.

## Casos de uso

- Moderación experimental de foros en inglés: el modelo puede puntuar mensajes de un foro y generar señales de toxicidad para análisis offline, siempre que se valide su calibración sobre el corpus concreto de cada comunidad.
- Paneles de control de comunidad: agregación de puntuaciones de toxicidad por hilo, usuario o periodo para visualizar tendencias en un dashboard, dado que el autor lo declara como uso previsto.
- Investigación sobre sesgos en moderación automatizada: al ser un artefacto pequeño y reproducible, sirve como línea base para comparar con clasificadores más grandes o con enfoques multilingües.
- Filtrado previo en pipelines de anotación: uso como primer pasador para priorizar mensajes que requieren revisión humana, reduciendo el volumen de revisión manual.
- Evaluación de técnicas de fine-tuning de BERT: el modelo documenta hiperparámetros concretos (6 épocas, lr 2e-5, batch 8) que permiten reproducir o comparar recetas de ajuste.
- Docencia y prototipado: ejemplo didáctico de clasificador de toxicidad basado en BERT para prácticas de NLP, sin pretensión de producción.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre `held-out-2025`:

| Metrica | Valor |
|---|---|
| macro-F1 | 0.733 |
| precision | 0.757 |

No se han publicado resultados adicionales (recall, exactitud, AUC, desglose por clase) ni comparaciones con otros modelos en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo del tamaño de bert-base (aproximadamente 110 millones de parámetros), la inferencia en FP32 requeriría del orden de 0,5 GB de VRAM, y en FP16 alrededor de 0,25 GB; estas cifras son estimaciones basadas en el modelo base, no en datos publicados para este derivado.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) sería suficiente para inferencia en FP16, pero no se confirma.
- Cabe en GPU consumer: presumiblemente sí, dado el tamaño del modelo base, aunque no se documenta.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: el modelo no declara licencia, idiomas, pipeline ni formato de pesos, y sus únicos datos de rendimiento son dos métricas sobre un conjunto privado (`held-out-2025`). Como referencia estructural, se puede comparar con el modelo base del que deriva:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yonons/lab-toxicity-filter | no disponible (base bert-base-uncased) | no disponible | Clasificación de toxicidad | no disponible | Hugging Face, 0 descargas |
| bert-base-uncased | ~110 M | 512 tokens | Encoder generalista | Apache 2.0 (modelo original) | Hugging Face, ampliamente usado |
| Alternativas de moderación | no disponible | no disponible | Clasificación de toxicidad | no disponible | no disponible |

No se identifican en la información proporcionada modelos comparables específicos de moderación de toxicidad con los que contrastar parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El autor restringe explícitamente el uso a "experimentos offline y paneles de control"; no está pensado para moderación automática en producción.
- Entrenado únicamente con datos en inglés; no se garantiza su comportamiento en castellano ni en otros idiomas.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse que no hay autorización explícita.
- No se documenta la composición del dataset `forum-moderation` ni el proceso de etiquetado, por lo que no se puede evaluar la calidad ni los sesgos de las anotaciones.
- El macro-F1 de 0,733 y la precisión de 0,757 se obtienen sobre un conjunto no descrito (`held-out-2025`); no hay información sobre el desbalance de clases ni sobre el rendimiento por categoría, lo que limita la interpretación.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador, no un generador), pero sí existe riesgo de falsos positivos y falsos negativos en la detección de toxicidad.
- No se documentan sesgos demográficos, culturales o lingüísticos; en un clasificador de toxicidad, estos sesgos son especialmente relevantes y deberían auditarse antes de cualquier uso.
- No se especifica el pipeline en Hugging Face ni el formato de pesos, lo que dificulta la integración directa con `transformers` u otras librerías.
- La fecha de creación indicada (2026-11-20) es posterior a las fechas del changelog (2025), lo que sugiere posibles inconsistencias en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yonons/lab-toxicity-filter
- Modelo base: https://huggingface.co/bert-base-uncased
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.

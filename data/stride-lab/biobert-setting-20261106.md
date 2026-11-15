# STRIDE-lab/biobert-setting-20261106

## Resumen

biobert-setting-20261106 es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab (Universidad de Berna) en el marco del proyecto PsyNamic. Se trata de un ajuste fino (fine-tuning) de dmis-lab/biobert-v1.1, un BERT base de 108 millones de parámetros preentrenado sobre literatura biomédica (PubMed), especializado en la detección multi-etiqueta del contexto de consumo de sustancias (setting) a partir de títulos y resúmenes de artículos científicos.

El modelo resuelve una tarea concreta: clasificar cada abstract en una o varias de siete categorías de contexto (Clinical, Naturalistic, Party setting, Other setting, Unknown, Not applicable y Palliative Setting). Es la versión desplegada en la aplicación web de PsyNamic tras la revisión de noviembre de 2026, y sustituye al checkpoint anterior basado en PubMedBERT (STRIDE-lab/pubmedbert-setting-20250221).

Su relevancia radica en que es un modelo pequeño, ligero y de licencia permisiva (Apache 2.0) que ofrece un rendimiento validado con intervalos de confianza bootstrap sobre un conjunto de test reservado, con un F1 ponderado de 0,850. Es adecuado para pipelines de extracción de información biomédica a escala, donde el coste computacional y la trazabilidad metodológica importan tanto como la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), clasificación multi-etiqueta |
| Parametros totales | 108.315.655 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers/PyTorch) |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una cabeza de clasificación de secuencias configurada para salida multi-etiqueta de 7 clases. Se inicializa desde dmis-lab/biobert-v1.1, que a su vez parte de bert-base-uncased y se preentrenó sobre corpus biomédicos (PubMed y PMC). El ajuste fino se realizó sobre un dataset privado del proyecto PsyNamic, con batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup del 10 %, 30 épocas máximas, dropout 0,1, gradient clipping 1,0 y early stopping con paciencia de 5 épocas. La longitud máxima de secuencia fue de 512 tokens y la tarea se trató como multi-etiqueta (varias etiquetas por abstract posibles).

La selección del modelo siguió un protocolo pre-registrado: se ajustaron cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; se eligió el checkpoint con menor pérdida de validación (early stopping) y el modelo base se seleccionó por F1 ponderado en validación. El conjunto de test se usó una única vez, tras la selección, lo que refuerza la validez de las métricas reportadas. La regla de predicción aplica una sigmoide por etiqueta y un umbral de 0,12, ajustado en validación con una regla pre-especificada (partir del umbral con máximo F1 ponderado y bajarlo mientras la precisión ponderada se mantenga dentro de 0,05 de su valor en ese punto).

## Capacidades

- Clasificación multi-etiqueta de abstracts biomédicos en siete categorías de contexto de consumo de sustancias.
- Procesamiento de pares título + abstract con truncación a 512 tokens.
- Salida de probabilidades por etiqueta (sigmoide), lo que permite umbrales ajustables según el caso de uso.
- Detección de contextos clínicos, naturalistas, de fiesta, paliativos, otros, desconocidos y no aplicables.
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (108 M de parámetros).
- Compatible con `text-embeddings-inference` y con endpoints compatibles según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito; es un clasificador, no un modelo generativo.

## Casos de uso

- Extracción de información en revisiones sistemáticas: el modelo puede procesar automáticamente miles de abstracts de PubMed para etiquetar el contexto de consumo de sustancias y priorizar la lectura manual, reduciendo el trabajo de cribado.
- Enriquecimiento de bases de datos bibliográficas: integrar el clasificador en un pipeline ETL que añada metadatos de contexto a registros de literatura biomédica, con la ventaja de su licencia Apache 2.0 para uso comercial.
- Monitorización de literatura sobre políticas de drogas: clasificar nuevos artículos según si describen contextos clínicos, naturalistas o de fiesta, para alimentar paneles de seguimiento temático.
- Apoyo a la webapp PsyNamic: es el modelo desplegado en producción en la aplicación web del proyecto, por lo que su caso de uso principal es la clasificación interactiva de abstracts introducidos por usuarios.
- Filtrado previo en estudios epidemiológicos: identificar abstracts que describan contextos palliativos o clínicos para su inclusión en análisis secundarios, con umbral ajustable según la tolerancia a falsos positivos.
- Investigación metodológica en NLP biomédico: servir como baseline reproducible (protocolo de selección y umbral documentados) para comparar futuros clasificadores de contexto en el dominio de las adicciones.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede ejecutarse en servidores modestos o incluso en portátiles para tareas de clasificación por lotes.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (98 abstracts), con umbral ajustado 0,12 e intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| F1 ponderado | 0,850 [0,762–0,906] |
| Precision ponderada | 0,820 [0,720–0,882] |
| Recall ponderado | 0,891 [0,814–0,942] |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que se trata de un clasificador especializado y no de un modelo generativo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB (108 M parámetros × 4 bytes) más overhead de activaciones; en fp16, alrededor de 0,22 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU sin problemas para inferencia por lotes; el throughput depende del hardware, pero al ser un BERT base es adecuado para procesar miles de abstracts en minutos.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (según tags), ONNX Runtime, y cuantización estándar de PyTorch. No se documenta soporte explícito de llama.cpp u Ollama, aunque la conversión a GGUF sería técnicamente posible al ser un BERT estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biobert-setting-20261106 | 108 M | 512 | Clasificación multi-etiqueta de setting | Apache 2.0 | Hugging Face |
| STRIDE-lab/pubmedbert-setting-20250221 | No disponible | 512 (probable) | Clasificación de setting (versión previa) | No disponible | Hugging Face |
| dmis-lab/biobert-v1.1 | 108 M | 512 | Modelo base biomédico (no clasificador específico) | Apache 2.0 | Hugging Face |

La comparación con el checkpoint previo (pubmedbert-setting-20250221) es directa: el modelo actual lo sustituye tras la revisión de noviembre de 2026, aunque no se proporcionan métricas del anterior en la información disponible para comparar rendimiento. Frente a BioBERT base, la diferencia es que este modelo está ajustado para una tarea concreta y no es un modelo de propósito general.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no soporta otros idiomas.
- El dataset de entrenamiento es privado, lo que limita la reproducibilidad completa del ajuste fino.
- El conjunto de test es pequeño (98 abstracts), por lo que los intervalos de confianza son amplios (F1 ponderado entre 0,762 y 0,906).
- El umbral de 0,12 está ajustado para la webapp PsyNamic; otros usos pueden requerir recalibración y el rendimiento puede degradarse fuera de la distribución de entrenamiento.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en abstracts ambiguos o con contextos mixtos.
- Sesgos potenciales derivados del corpus biomédico de preentrenamiento y del dataset privado de anotación; no se documentan análisis de sesgo por subgrupos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo se distribuye sin garantías y el autor no documenta limitaciones de dominio más allá de la tarea de setting.
- No es un modelo generativo: no debe usarse para responder preguntas, resumir ni generar texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biobert-setting-20261106
- Modelo base: https://huggingface.co/dmis-lab/biobert-v1.1
- Checkpoint previo sustituido: https://huggingface.co/STRIDE-lab/pubmedbert-setting-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn

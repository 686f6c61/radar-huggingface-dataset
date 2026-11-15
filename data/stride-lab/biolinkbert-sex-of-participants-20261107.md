# STRIDE-lab/biolinkbert-sex-of-participants-20261107

## Resumen

`STRIDE-lab/biolinkbert-sex-of-participants-20261107` es un modelo de clasificación de texto especializado en un dominio muy concreto: determinar la distribución por sexo de la población de estudio a partir del título y el resumen de una publicación biomédica. Lo desarrolla el laboratorio STRIDE en el marco del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a la extracción estructurada de metadatos metodológicos de la literatura en psiquiatría y disciplinas afines.

Técnicamente es un fine-tuning de `michiyasunaga/BioLinkBERT-base`, un encoder BERT de 108,2 millones de parámetros preentrenado con enlaces documentales (link prediction) sobre corpus biomédicos. El modelo resultante es un clasificador de una sola etiqueta con cinco clases posibles (Both sexes, Female, Male, Not applicable, Unknown), sin capacidades generativas ni de razonamiento: es un componente de extracción dentro de un pipeline de anotación automatizada.

Su relevancia es acotada pero clara: sustituye al checkpoint anterior basado en BioBERT (`submission-v1`) tras una revisión de noviembre de 2026, y reporta un F1 ponderado de 0,945 en un conjunto de test retenido de 96 abstracts. Es un modelo de producción para una tarea de nicho, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), fine-tuning de BioLinkBERT-base |
| Parametros totales | 108.236.549 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch/transformers) |

## Arquitectura y entrenamiento

El modelo parte de BioLinkBERT-base, un encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) preentrenado con un objetivo adicional de predicción de enlaces entre documentos (citation link prediction) sobre PubMed. Sobre esa base se añade una cabeza de clasificación de secuencias con cinco salidas y se ajusta con `AutoModelForSequenceClassification`.

El fine-tuning se realizó con un conjunto de datos privado no especificado, con los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas máximas, dropout 0,1, early stopping con paciencia 5, gradient clipping 1,0 y max_length 512. La selección del checkpoint se hizo por menor pérdida de validación (early stopping) y la elección del modelo base entre cinco candidatos (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) se basó en F1 ponderado de validación. El conjunto de test se utilizó una única vez, después de la selección, lo que reduce el riesgo de sobreajuste en la estimación reportada. No se documenta uso de RLHF, DPO ni datos sintéticos.

## Capacidades

- Clasificación de texto de una sola etiqueta: predice la distribución por sexo de la población de estudio a partir de `<title>. <abstract>`.
- Cinco clases: Both sexes (0), Female (1), Male (2), Not applicable (3), Unknown (4).
- Decisión por argmax sobre el softmax de las logits; no usa umbral (el `threshold` de 0,5 del JSON solo aplica a métricas de validación en tareas multilabel).
- Procesamiento de entradas de hasta 512 tokens, adecuado para títulos y resúmenes biomédicos completos.
- Sin tool calling, sin function calling, sin capacidades de agente, sin generación de texto libre, sin visión, audio ni modo de razonamiento.
- Multilingüe: no; únicamente inglés.
- Compatible con `text-embeddings-inference` y endpoints según los tags del repo, aunque su uso previsto es clasificación, no embeddings.

## Casos de uso

- Extracción de metadatos en revisiones sistemáticas: dado un corpus de abstracts de PubMed, el modelo etiqueta automáticamente la distribución por sexo de cada estudio, reduciendo el trabajo manual de cribado en revisiones sobre sesgos de sexo y género en investigación biomédica.
- Enriquecimiento de bases de datos bibliográficas: integración en pipelines ETL que procesan abstracts y añaden un campo estructurado `sex_of_participants` a registros existentes, con la ventaja de que la salida es una de cinco categorías cerradas y fácilmente validable.
- Auditoría de equidad en publicación científica: análisis a escala de la proporción de estudios que incluyen ambos sexos frente a los que solo incluyen uno, usando el modelo como clasificador de primer paso y revisión humana sobre las clases `Unknown` y `Not applicable`.
- Preanotación asistida en la webapp PsyNamic: el modelo actúa como sugerencia automática que el anotador humano confirma o corrige, aprovechando su F1 ponderado de 0,945 para reducir el coste de anotación.
- Filtrado de candidatos en revisiones sistemáticas vivas: descartar o priorizar abstracts según su distribución por sexo antes del cribado manual, especialmente útil cuando el volumen de literatura supera la capacidad del equipo revisor.
- Componente de un pipeline multimodal de extracción metodológica: combinado con otros clasificadores del proyecto PsyNamic (tamaño de muestra, diseño del estudio, etc.) para reconstruir la ficha metodológica completa de cada publicación de forma automática.

## Benchmarks y rendimiento

Conjunto de test retenido (96 abstracts), argmax como en la webapp, intervalos de confianza bootstrap del 95 % (1.000 remuestras BCa):

| Metrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,945 [0,876–0,979] |
| Weighted precision | 0,953 [0,902–0,980] |
| Weighted recall | 0,948 [0,896–0,979] |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparativas numéricas con los otros cuatro modelos base evaluados durante la selección.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB de pesos (108 M de parámetros), más activaciones y overhead del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16/bf16: alrededor de 0,22 GB de pesos, ejecutable incluso en CPU con latencia aceptable para lotes pequeños.
- GPU recomendadas: cualquiera consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; para alto throughput en servidor, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: sí, sin problema, incluidas GPUs de gama baja y portátiles.
- Opciones de despliegue: `transformers` con PyTorch (uso documentado), `text-embeddings-inference` según los tags, y servidores de inferencia estándar compatibles con modelos de clasificación de Hugging Face (por ejemplo, endpoints de Hugging Face Inference). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biolinkbert-sex-of-participants-20261107 (este) | 108,2 M | 512 | Clasificación sexo de participantes (5 clases) | Apache 2.0 | Hugging Face |
| STRIDE-lab/biobert-sex-of-participants-20250221 | No disponible en la información | No disponible | Misma tarea (versión anterior, `submission-v1`) | No disponible en la información | Hugging Face |
| michiyasunaga/BioLinkBERT-base | No disponible en la información | No disponible | Modelo base preentrenado, sin cabeza de clasificación | No disponible en la información | Hugging Face |

La comparación con alternativas de propósito general (BERT-base, RoBERTa, modelos generativos) no aporta valor aquí: la tarea es de clasificación cerrada y específica del dominio biomédico, y no se han publicado métricas de otros modelos sobre este mismo conjunto de test en la información disponible.

## Limitaciones y advertencias

- Modelo de una sola tarea y cinco clases: no sirve para ninguna otra función; cualquier uso fuera de la clasificación de sexo de participantes producirá salidas sin sentido.
- Solo inglés: los abstracts en otros idiomas no están cubiertos y probablemente degraden el rendimiento.
- Conjunto de test muy pequeño (96 abstracts): los intervalos de confianza son amplios (F1 entre 0,876 y 0,979), por lo que la métrica puntual debe interpretarse con cautela.
- Datos de entrenamiento privados y no documentados: no se conoce la composición del corpus, su distribución de clases ni posibles sesgos de anotación; la reproducibilidad es limitada.
- Riesgo de alucinación conceptual: al ser un clasificador, no genera texto, pero puede asignar con alta confianza una clase incorrecta en abstracts ambiguos o con información de sexo implícita; conviene revisar manualmente las predicciones de baja probabilidad.
- Las clases `Unknown` y `Not applicable` son especialmente sensibles a diferencias de criterio entre anotadores; el modelo hereda los criterios de las guías de anotación del proyecto (OSF), no una definición universal.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base BioLinkBERT puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Sin garantías de mantenimiento: el repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un modelo recién publicado y sin validación externa por parte de la comunidad.
- Fecha de creación en el repo (2026-11-15) posterior a la fecha indicada en el nombre del checkpoint (20261107); conviene no confundir la versión del modelo con la fecha de publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-sex-of-participants-20261107
- Modelo base: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Checkpoint anterior (BioBERT, `submission-v1`): https://huggingface.co/STRIDE-lab/biobert-sex-of-participants-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn

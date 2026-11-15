# STRIDE-lab/scibert-condition-20261106

## Resumen

`scibert-condition-20261106` es un modelo de clasificación de texto multietiqueta desarrollado por STRIDE-lab en el marco del proyecto PsyNamic, una iniciativa de la Universidad de Berna orientada a la extracción estructurada de información a partir de literatura biomédica. El modelo se ha entrenado para identificar la condición o población objeto de estudio en resúmenes de artículos científicos, una tarea clave para la construcción de revisiones sistemáticas y meta-análisis automatizados.

Se trata de un fine-tuning de `allenai/scibert_scivocab_uncased`, un BERT base con vocabulario científico de 30.522 tokens preentrenado sobre corpus de Semantic Scholar. El checkpoint resultante cuenta con 109,9 millones de parámetros, emplea una arquitectura transformer encoder estándar con una cabeza de clasificación multietiqueta de 14 etiquetas y procesa secuencias de hasta 512 tokens.

El modelo es relevante por su rendimiento en la tarea: alcanza un weighted F1 de 0,902 (IC 95 %: 0,834–0,937) sobre un conjunto de test reservado de 96 resúmenes, con un umbral de decisión ajustado a 0,12. Sustituye a la versión anterior basada en PubMedBERT (`STRIDE-lab/pubmedbert-condition-20250221`) como modelo desplegado en la aplicación web de PsyNamic tras la revisión de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) con cabeza de clasificación multietiqueta |
| Parametros totales | 109.929.230 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también compatible con PyTorch vía transformers) |

## Arquitectura y entrenamiento

El modelo parte de `allenai/scibert_scivocab_uncased`, un BERT base de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un vocabulario específico de 30.522 tokens construido a partir de corpus científicos. Sobre esta base se añade una cabeza de clasificación lineal con 14 salidas, una por etiqueta, y se aplica una función sigmoide independiente a cada logit para permitir clasificación multietiqueta (varias condiciones pueden coexistir en un mismo resumen).

El entrenamiento se realizó sobre un dataset privado no especificado en la model card, con los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas máximas, dropout 0,1, gradient clipping 1,0, early stopping con paciencia 5 y max_length 512. La selección del modelo base se hizo comparando cinco alternativas (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) entrenadas con hiperparámetros idénticos, eligiendo la de mejor weighted F1 en validación; el checkpoint final es el de menor pérdida de validación. El conjunto de test se utilizó una única vez, tras la selección.

La innovación técnica principal no reside en la arquitectura, sino en la regla de predicción: en lugar del umbral estándar de 0,5 usado durante el entrenamiento para calcular métricas de validación, el modelo desplegado aplica un umbral de 0,12, ajustado sobre validación con una regla preespecificada (partir del umbral de máximo weighted F1 y bajarlo mientras la precisión ponderada se mantenga dentro de 0,05 de su valor en ese punto). Esto prioriza el recall (0,959) sobre la precisión (0,865), un compromiso razonable en tareas de cribado bibliográfico.

## Capacidades

- Clasificación multietiqueta de la condición o población estudiada en resúmenes científicos, con 14 etiquetas posibles: condición psiquiátrica, depresión, ansiedad, trastorno de estrés postraumático, alcoholismo, otras adicciones, anorexia, enfermedad de Alzheimer, demencia no Alzheimer, abuso de sustancias, dolor crónico, contexto paliativo, consumo recreativo de drogas y participantes sanos.
- Procesamiento de pares título + resumen con truncación a 512 tokens.
- Salida de probabilidades calibradas por etiqueta mediante sigmoide, lo que permite ajustar el umbral según el compromiso precisión-recall deseado.
- Capacidad de identificar múltiples condiciones simultáneas en un mismo texto (multietiqueta real, no multiclase).
- Especialización en dominio biomédico y psiquiátrico gracias al preentrenamiento científico de SciBERT.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador discriminativo, no un modelo generativo.
- No dispone de capacidades de visión, audio ni modo thinking.

## Casos de uso

- Cribado automatizado en revisiones sistemáticas: el modelo clasifica miles de resúmenes recuperados de PubMed según la condición estudiada, permitiendo priorizar la lectura manual de aquellos que cumplen los criterios de inclusión de una revisión sobre depresión, ansiedad o dolor crónico.
- Construcción de bases de datos estructuradas de evidencia: integrado en pipelines de extracción de información, etiqueta cada artículo con las condiciones investigadas para alimentar repositorios consultables por condición y población.
- Filtrado en meta-análisis sobre salud mental: dado el rendimiento en etiquetas como depresión, ansiedad y PTSD, se puede usar para identificar estudios elegibles en revisiones centradas en trastornos psiquiátricos específicos.
- Monitorización de literatura en psiquiatría traslacional: desplegado sobre feeds de nuevas publicaciones, permite alertar a investigadores sobre artículos que abordan poblaciones concretas (p. ej., participantes sanos frente a pacientes con Alzheimer).
- Enriquecimiento de metadatos en repositorios institucionales: clasificación automática de la producción científica de un grupo de investigación según las condiciones clínicas abordadas, facilitando la generación de informes.
- Investigación metodológica en NLP biomédico: al ser un fine-tuning con hiperparámetros e informe de selección documentados, sirve como referencia reproducible para comparar estrategias de umbral adaptativo en clasificación multietiqueta.
- Componente en la webapp PsyNamic: es el modelo desplegado en producción en `psynamic.dcr.unibe.ch` para la anotación asistida de condiciones en revisiones sistemáticas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (96 resúmenes), con umbral ajustado de 0,12 e intervalos de confianza bootstrap del 95 % (1.000 remuestreos BCa):

| Métrica (test) | Valor [IC 95 %] |
|---|---|
| Weighted F1 | 0,902 [0,834–0,937] |
| Weighted precision | 0,865 [0,778–0,909] |
| Weighted recall | 0,959 [0,897–0,988] |

No se han publicado resultados comparativos con otros modelos en la información disponible, más allá de la mención de que SciBERT fue seleccionado frente a BiomedBERT-abstract, BioBERT, BioLinkBERT y ClinicalBERT sobre la base del weighted F1 en validación (sin cifras publicadas).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos, más activaciones; en la práctica, menos de 1 GB para batches pequeños.
- VRAM estimada en FP16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque para este tamaño las GPU de gama baja son adecuadas.
- Cabe en GPU consumer: sí, en cualquier modelo con 4 GB o más (GTX 1650, RTX 3050, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference (el repo incluye el tag `text-embeddings-inference` y `endpoints_compatible`), vLLM no es aplicable por ser un modelo de clasificación, ONNX Runtime y TorchScript son opciones viables.
- Latencia y throughput: no disponibles en la información proporcionada; para un BERT base de 110 M de parámetros se espera un throughput de cientos a miles de documentos por segundo en GPU moderna con batching, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| STRIDE-lab/scibert-condition-20261106 | 109,9 M | 512 | Clasificación multietiqueta de condición (14 etiquetas) | apache-2.0 | Weighted F1 0,902 |
| STRIDE-lab/pubmedbert-condition-20250221 | no disponible | no disponible | Misma tarea (versión previa) | no disponible | no disponible |
| allenai/scibert_scivocab_uncased (base) | 109,9 M | 512 | Modelo de lenguaje enmascarado, sin cabeza de clasificación | apache-2.0 | no aplica |
| BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT | no disponible | no disponible | Clasificación de condición (comparados en validación) | no disponible | no publicado |

La model card indica que SciBERT fue el mejor de cinco modelos base en validación, pero no se publican las cifras individuales de los competidores, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: no soporta otros idiomas, y su uso sobre textos en castellano produciría resultados no fiables.
- Dominio restringido a resúmenes científicos biomédicos y psiquiátricos; el rendimiento fuera de este dominio (notas clínicas, textos divulgativos, redes sociales) no está evaluado y probablemente sea inferior.
- El conjunto de test es pequeño (96 resúmenes), lo que se refleja en intervalos de confianza amplios (F1 entre 0,834 y 0,937); la variabilidad real en producción puede ser mayor.
- El umbral de 0,12 está ajustado para priorizar recall; en aplicaciones donde los falsos positivos sean costosos, será necesario recalibrar el umbral.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación, especialmente en etiquetas poco representadas en el dataset de entrenamiento (cuyas distribuciones no se publican).
- El dataset de entrenamiento es privado y no se documenta su composición, tamaño ni distribución de etiquetas, lo que dificulta evaluar sesgos de representación (p. ej., infrarrepresentación de condiciones raras).
- Licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.
- No es un modelo generativo: no puede redactar resúmenes, responder preguntas ni mantener conversaciones; su uso está limitado a clasificación.
- La model card no documenta evaluaciones de sesgo demográfico, geográfico ni de otro tipo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/scibert-condition-20261106
- Modelo base: https://huggingface.co/allenai/scibert_scivocab_uncased
- Versión previa (PubMedBERT): https://huggingface.co/STRIDE-lab/pubmedbert-condition-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Aplicación web PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación completas: https://osf.io/gh6cn

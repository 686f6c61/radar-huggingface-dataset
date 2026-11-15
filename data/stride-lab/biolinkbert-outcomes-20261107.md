# STRIDE-lab/biolinkbert-outcomes-20261107

## Resumen

`biolinkbert-outcomes-20261107` es un modelo de clasificación de texto biomédico desarrollado por STRIDE-lab en el marco del proyecto PsyNamic (Universidad de Berna). Se trata de un fine-tuning de `michiyasunaga/BioLinkBERT-base` sobre la tarea de "Outcomes", cuyo objetivo es identificar de forma multi-etiqueta los dominios de resultado evaluados en resúmenes (abstracts) de estudios científicos. El modelo sustituye a la versión anterior `STRIDE-lab/scibert-outcomes-20250221` (tag `submission-v1`) y es el que se despliega en la aplicación web de PsyNamic tras la revisión de noviembre de 2026.

Arquitectónicamente es un transformer encoder tipo BERT con 108.243.470 parámetros totales (aproximadamente 110M, coherente con la familia BERT-base), especializado en texto biomédico inglés mediante el preentrenamiento de BioLinkBERT sobre literatura científica. Su ventana de entrada está limitada a 512 tokens, suficiente para procesar título más abstract de un artículo.

La relevancia del modelo radica en su carácter aplicado: no es un modelo generativo de propósito general, sino un clasificador afinado para una tarea concreta de extracción de información en revisiones sistemáticas y meta-investigación. Su publicación con métricas de test, umbral de decisión calibrado y comparación entre cinco modelos base lo convierte en un ejemplo de buenas prácticas de evaluación en NLP biomédico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BioLinkBERT-base) |
| Parametros totales | 108.243.470 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantización no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers/PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `michiyasunaga/BioLinkBERT-base`, un encoder BERT-base preentrenado con enlaces de documentos (document linking) sobre corpus biomédicos (PubMed y Wikipedia médica). Sobre esa base se añade una cabeza de clasificación multi-etiqueta (`AutoModelForSequenceClassification`) con 15 etiquetas de salida, entrenada con pérdida de entropía cruzada binaria por etiqueta y activación sigmoide en inferencia.

Los hiperparámetros de fine-tuning documentados son: batch size 8, learning rate 5e-5, weight decay 0.01, scheduler lineal con warmup ratio 0.1, hasta 30 épocas con early stopping (paciencia 5), dropout 0.1, gradient clipping 1.0 y max_length 512. El dataset de entrenamiento es privado (`<private_dataset>`), por lo que no se conoce su tamaño ni composición. La selección del modelo se realizó comparando cinco bases (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos, eligiendo BioLinkBERT por weighted F1 en validación. El checkpoint final es el de menor pérdida de validación. No se documenta uso de RLHF ni DPO (no aplica a un clasificador).

Una innovación operativa destacable es la regla de umbral: aunque el entrenamiento usa 0.5 solo para métricas de validación, el despliegue aplica un umbral de 0.29 por etiqueta, ajustado en validación con una regla preespecificada (partir del umbral de máximo weighted F1 y bajarlo mientras el weighted precision se mantenga dentro de 0.05 de su valor en ese punto).

## Capacidades

- Clasificación multi-etiqueta de abstracts biomédicos en 15 dominios de resultado (conducción de vehículo, suicidio, encuestas, entrevistas, neurotoxicidad, visitas a urgencias, fMRI, MRI, PET/SPECT, funciones fisiológicas, EEG, funciones mentales, experiencia psicodélica, biomarcadores solubles).
- Procesamiento de pares título + abstract concatenados como entrada única.
- Salida de probabilidades por etiqueta mediante sigmoide, permitiendo umbrales ajustables por caso de uso.
- Especialización en vocabulario y terminología biomédica y psiquiátrica gracias al preentrenamiento de BioLinkBERT.
- No soporta tool calling ni function calling (es un clasificador, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Cribado en revisiones sistemáticas: el modelo clasifica automáticamente abstracts recuperados de PubMed según los dominios de resultado evaluados, permitiendo priorizar o filtrar candidatos antes de la lectura manual. Su ventana de 512 tokens cubre título más abstract típicos.
- Meta-investigación en psiquiatría y psicodélicos: permite agregar a escala qué tipos de outcomes (biomarcadores, neuroimagen, escalas funcionales, eventos adversos) se reportan en la literatura, alimentando análisis de sesgo de notificación.
- Enriquecimiento de bases de datos bibliográficas: integración en pipelines ETL que etiqueten registros con dominios de resultado para búsquedas facetadas.
- Monitorización de literatura sobre seguridad: detección de abstracts que reportan suicidio, neurotoxicidad o visitas a urgencias como outcomes, útil en farmacovigilancia.
- Automatización de la webapp PsyNamic: clasificación en tiempo real de abstracts introducidos por usuarios, con el umbral 0.29 calibrado para ese despliegue.
- Investigación metodológica en NLP biomédico: serving como baseline reproducible para comparar clasificadores de outcomes, dado que el autor documenta hiperparámetros, regla de umbral y métricas con intervalos de confianza bootstrap.
- Análisis de tendencias por modalidad de medición: distinguir entre estudios que usan fMRI, PET/SPECT, EEG o biomarcadores solubles para estudios bibliométricos.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (94 abstracts), con umbral ajustado 0.29 e intervalos de confianza bootstrap del 95% (1.000 remuestreos BCa):

| Metrica (test) | Valor [IC 95%] |
|---|---|
| Weighted F1 | 0.827 [0.778–0.866] |
| Weighted precision | 0.827 [0.758–0.870] |
| Weighted recall | 0.847 [0.796–0.891] |

No se han publicado en la información disponible resultados comparativos por etiqueta ni frente a los otros cuatro modelos base evaluados (solo se indica que BioLinkBERT fue seleccionado por weighted F1 en validación).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB para pesos (108M parámetros × 4 bytes) más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, T4, L4); para alto throughput, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el modelo está etiquetado como `text-embeddings-inference` y `endpoints_compatible`), y exportación a ONNX no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño (BERT-base) se espera un throughput alto en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| biolinkbert-outcomes-20261107 | 108,2M | 512 | Clasificación multi-etiqueta de outcomes | apache-2.0 | Hugging Face (este modelo) |
| STRIDE-lab/scibert-outcomes-20250221 | no disponible en la información | no disponible | Misma tarea (versión previa, submission-v1) | no disponible | Hugging Face |
| michiyasunaga/BioLinkBERT-base | ~110M (BERT-base) | 512 | Modelo base (MLM, no clasificador) | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa más allá de la indicación del autor de que BioLinkBERT superó a BiomedBERT-abstract, BioBERT, ClinicalBERT y SciBERT en weighted F1 de validación.

## Limitaciones y advertencias

- El modelo solo procesa inglés; abstracts en otros idiomas no están soportados.
- El conjunto de test es muy reducido (94 abstracts), lo que implica intervalos de confianza amplios (weighted F1 entre 0,778 y 0,866); el rendimiento en producción puede desviarse dentro de ese rango.
- El umbral 0.29 está calibrado para la distribución del dataset de PsyNamic; en otros corpus puede requerir recalibración.
- El dataset de entrenamiento es privado y no se documenta su tamaño ni composición, lo que dificulta evaluar sesgos de dominio (por ejemplo, sobrerrepresentación de ciertas áreas terapéuticas o revistas).
- Riesgo de falsos negativos y positivos en etiquetas poco frecuentes; no se publican métricas por etiqueta.
- Entrada truncada a 512 tokens: abstracts largos o con material suplementario pueden perder información relevante.
- Es un clasificador, no un generador: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del dominio de entrenamiento; conviene validar antes de uso clínico o regulatorio.
- El modelo no debe usarse como sustituto de revisión experta en contextos donde los outcomes tengan implicaciones clínicas o de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/biolinkbert-outcomes-20261107
- Modelo base: https://huggingface.co/michiyasunaga/BioLinkBERT-base
- Versión previa sustituida: https://huggingface.co/STRIDE-lab/scibert-outcomes-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp PsyNamic: https://psynamic.dcr.unibe.ch
- Guías de anotación: https://osf.io/gh6cn

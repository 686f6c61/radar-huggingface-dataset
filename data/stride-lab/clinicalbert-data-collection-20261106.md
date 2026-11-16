# STRIDE-lab/clinicalbert-data-collection-20261106

## Resumen

ClinicalBERT-data-collection-20261106 es un modelo de clasificación de texto en inglés, especializado en el dominio biomédico, desarrollado por STRIDE-lab en el marco del proyecto PsyNamic. Se trata de un ajuste fino (fine-tuning) del modelo base `emilyalsentzer/Bio_ClinicalBERT`, un transformer BERT entrenado sobre notas clínicas, y su tarea concreta es clasificar el momento en que se evalúa un desenlace (outcome) en un estudio: prospectivo, retrospectivo, no aplicable o desconocido.

El modelo resuelve un problema muy acotado dentro del ámbito de la investigación clínica y la síntesis de evidencia: la anotación automática de la temporalidad del desenlace en resúmenes de estudios. Sustituye a una versión anterior del mismo laboratorio (`STRIDE-lab/biobert-data-collection-20250221`) y es el checkpoint desplegado en la aplicación web de PsyNamic tras la revisión de noviembre de 2026.

Con 108,3 millones de parámetros, una ventana de contexto de 512 tokens y una licencia Apache 2.0, es un modelo ligero y de propósito muy específico, pensado para integrarse en un pipeline de extracción de datos más amplio, no como un modelo generativo de uso general. Su relevancia actual radica en que demuestra un flujo de trabajo reproducible de selección de modelo base y evaluación con intervalos de confianza bootstrap sobre un conjunto de test reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: Bio_ClinicalBERT) |
| Parametros totales | 108.313.348 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,4 GB); compatible con PyTorch/transformers |

## Arquitectura y entrenamiento

El modelo es un BERT encoder de 108 millones de parámetros con una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) que produce logits sobre cuatro etiquetas. Parte de `emilyalsentzer/Bio_ClinicalBERT`, un checkpoint preentrenado sobre notas clínicas del MIMIC-III, lo que le aporta vocabulario y representaciones del dominio biomédico. El ajuste fino se realizó sobre un conjunto de datos privado (no publicado) con los siguientes hiperparámetros: batch size 8, learning rate 5e-5, weight decay 0,01, scheduler lineal con warmup ratio 0,1, 30 épocas, dropout 0,1, gradient clipping 1,0, early stopping con paciencia 5 y max_length 512.

La selección del modelo siguió un protocolo explícito: se ajustaron cinco modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, ClinicalBERT y SciBERT) con hiperparámetros idénticos; se eligió el checkpoint con menor pérdida de validación y el modelo base con mejor F1 ponderado en validación. El conjunto de test se utilizó una sola vez, después de la selección, lo que reduce el riesgo de sobreajuste en la evaluación. No se documenta el número de tokens de entrenamiento ni la composición del dataset, más allá de que la fuente de las directrices de anotación es el apéndice S1, sección 4.2, del artículo de PsyNamic (OSF: https://osf.io/gh6cn).

## Capacidades

- Clasificación de texto de una sola etiqueta (single-label) sobre cuatro categorías: Not applicable, Prospective, Retrospective y Unknown.
- Predicción por argmax sobre la distribución softmax de las cuatro etiquetas.
- Procesamiento de pares título + resumen de estudios (entrada del tipo `<title>. <abstract>`), truncada a 512 tokens.
- Dominio biomédico y clínico en inglés, gracias al preentrenamiento de Bio_ClinicalBERT.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.
- No es un modelo generativo: no produce texto libre, solo etiquetas.

## Casos de uso

- Anotación automática de temporalidad en revisiones sistemáticas: el modelo clasifica cada resumen de estudio como prospectivo, retrospectivo, no aplicable o desconocido, lo que permite cribar y organizar grandes volúmenes de literatura antes de la revisión manual.
- Extracción de datos en pipelines de síntesis de evidencia: integrado como paso de preetiquetado en herramientas de extracción, reduce el trabajo manual de los revisores, que solo validan las predicciones del modelo.
- Enriquecimiento de bases de datos bibliográficas: se puede ejecutar por lotes sobre colecciones de resúmenes para añadir un campo de temporalidad del desenlace y facilitar búsquedas filtradas.
- Control de calidad en la webapp de PsyNamic: es el modelo desplegado en producción en `psynamic.dcr.unibe.ch`, donde clasifica las entradas de los usuarios en tiempo real con una latencia muy baja propia de un BERT base.
- Filtrado previo en revisiones de literatura clínica: descarta o marca estudios con temporalidad desconocida o no aplicable, priorizando la revisión manual de los casos prospectivos y retrospectivos.
- Investigación metodológica sobre selección de modelos: sirve como referencia reproducible de un flujo de comparación de cinco encoders biomédicos con evaluación única sobre test y CIs bootstrap, útil para replicar protocolos en otras tareas de anotación.
- Despliegue en entornos con recursos limitados: al ser un BERT base de 108 M de parámetros, puede ejecutarse en CPU o en GPUs de consumo para clasificación por lotes de miles de resúmenes.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test reservado (96 resúmenes), con argmax como en la webapp y CIs bootstrap del 95 % (1.000 remuestras BCa):

| Métrica (test) | Valor [IC 95 %] |
|---|---|
| F1 ponderado | 0,901 [0,834–0,952] |
| Precisión ponderada | 0,923 [0,869–0,978] |
| Exhaustividad (recall) ponderada | 0,906 [0,833–0,948] |

No se han publicado en la información disponible resultados comparativos de los otros cuatro modelos base (BiomedBERT-abstract, BioBERT, BioLinkBERT, SciBERT) ni métricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,45 GB para los pesos (108 M parámetros × 4 bytes), más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,22 GB para los pesos; en la práctica, menos de 1,5 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100 y H100, aunque el modelo es lo bastante pequeño como para no necesitar GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: transformers (PyTorch), text-embeddings-inference (el repo incluye la etiqueta `text-embeddings-inference`), endpoints compatibles; también es viable exportarlo a ONNX o cuantizarlo a INT8 para CPU. No se documenta soporte nativo de llama.cpp, Ollama o TGI en la model card.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU para clasificación por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| clinicalbert-data-collection-20261106 | 108,3 M | 512 | Clasificación de temporalidad del desenlace (4 clases) | Apache 2.0 | Hugging Face |
| emilyalsentzer/Bio_ClinicalBERT (base) | 108,3 M | 512 | Modelo de representaciones; requiere cabeza de clasificación | MIT (según el repo original) | Hugging Face |
| STRIDE-lab/biobert-data-collection-20250221 (versión anterior) | No disponible | 512 | Misma tarea (versión `submission-v1`) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- El conjunto de test es muy reducido (96 resúmenes), por lo que los intervalos de confianza son amplios (F1 ponderado entre 0,834 y 0,952) y la generalización a otras poblaciones de resúmenes no está garantizada.
- El modelo está entrenado exclusivamente en inglés y en el dominio biomédico; su uso fuera de ese dominio o en otros idiomas no está validado.
- No se documentan sesgos específicos, pero al derivar de Bio_ClinicalBERT (entrenado con notas clínicas de MIMIC-III) puede heredar sesgos de esa fuente, incluyendo sesgos demográficos y de documentación clínica.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas confiadas: el argmax siempre asigna una etiqueta, incluso cuando la probabilidad es baja; no se documenta umbral de abstención.
- El dataset de entrenamiento es privado, lo que impide auditar la composición, el balance de clases y la calidad de las anotaciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Bio_ClinicalBERT tiene su propia licencia (MIT según el repo original) que conviene verificar antes de un despliegue comercial.
- El modelo no es generativo ni conversacional: no debe emplearse para tareas de generación de texto, razonamiento o agentes.
- La etiqueta `threshold: 0.5` de los parámetros de entrenamiento no tiene efecto en este modelo single-label, que predice por argmax; no debe interpretarse como un umbral de decisión configurable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/STRIDE-lab/clinicalbert-data-collection-20261106
- Modelo base: https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT
- Versión anterior (submission-v1): https://huggingface.co/STRIDE-lab/biobert-data-collection-20250221
- Código del proyecto PsyNamic: https://github.com/Ineichen-Group/PsyNamic
- Webapp de PsyNamic: https://psynamic.dcr.unibe.ch
- Directrices de anotación: https://osf.io/gh6cn

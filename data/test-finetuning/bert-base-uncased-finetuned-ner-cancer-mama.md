# Test-FineTuning/bert-base-uncased-finetuned-ner-cancer-mama

## Resumen

El modelo `bert-base-uncased-finetuned-ner-cancer-mama` es un ajuste fino de BERT base para reconocimiento de entidades nombradas (NER) en textos clínicos en español sobre cáncer de mama. Lo desarrolla Carlos Andres Borja y se publica bajo la cuenta de Hugging Face `Test-FineTuning`. La tarea es clasificación de tokens con esquema BIO sobre 24 tipos de entidad clínica (49 etiquetas contando `O`), cubriendo desde diagnósticos y estadificación TNM hasta fármacos, dosis, cirugías y antecedentes familiares.

Arquitectura transformer encoder-only de BERT base, con 108.929.329 parámetros y una longitud máxima de secuencia de 512 tokens. El modelo parte de `google-bert/bert-base-uncased`, un checkpoint entrenado originalmente en inglés, y se ha ajustado sobre un corpus clínico anotado en español de 10.874 oraciones y 161.530 tokens, con validación cruzada de 5 folds.

Su relevancia es acotada pero concreta: cubre un nicho (extracción de información estructurada de informes oncológicos en español) donde escasean los modelos públicos especializados. El autor lo declara explícitamente como uso educativo y de investigación, sin validación clínica, lo que limita su aplicabilidad en producción sanitaria pero lo hace útil como base para experimentación y como referencia metodológica de fine-tuning NER biomédico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parámetros totales | 108.929.329 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (repo en safetensors; cuantizaciones GGUF/ONNX no publicadas) |
| Idiomas soportados | español (`es`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (12 capas, hidden size 768, 12 cabezas de atención, ~110 M de parámetros) con una cabeza de clasificación de tokens añadida para 49 etiquetas BIO. No hay innovaciones arquitectónicas: es un fine-tuning convencional de token classification sobre un encoder preentrenado en inglés, lo que implica que el tokenizador WordPiece de `bert-base-uncased` procesa texto en español sin vocabulario específico del dominio ni del idioma.

El entrenamiento se realizó con validación cruzada K-Fold (K=5) por oraciones, con mezcla y semilla fija (42). En cada fold, el modelo se reinicia desde `bert-base-uncased` y se entrena durante 5 épocas con learning rate 2e-5, batch size 8, weight decay 0.01, precisión mixta fp16 y longitud máxima de 512 tokens, sobre una NVIDIA T4. La selección del checkpoint se hizo por mejor F1 en validación (`load_best_model_at_end`), y en los cinco folds el mejor epoch fue el quinto. Solo el primer sub-token de cada palabra recibe etiqueta; el resto y los tokens especiales se enmascaran con `-100` en la pérdida. El modelo publicado corresponde al fold 2, el de mayor F1 en su conjunto de test, lo que introduce un sesgo de selección que el propio autor advierte.

El corpus de entrenamiento es un conjunto anotado en formato `.bio` proporcionado por el docente del proyecto, no publicado con el modelo: 10.874 oraciones, 161.530 tokens y 49 etiquetas. El autor indica que se revisó la calidad (sin líneas malformadas, sin etiquetas inválidas ni etiquetas `I-` huérfanas). No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de este tipo.

## Capacidades

- Reconocimiento de entidades nombradas clínicas en español sobre texto oncológico de mama, con 24 tipos de entidad.
- Extracción de conceptos de diagnóstico y tumor (`CANCER_CONCEPT`), estadio (`STAGE`), estadificación TNM (`TNM`) y biomarcadores (`BIOMARKER`).
- Detección de progresión y recidiva (`PROGRESION`).
- Extracción de tratamiento farmacológico: fármacos (`DRUG`), dosis (`DOSE`), frecuencia (`FREQ`), duración (`DURATION`), línea o número de ciclo (`LINE_CICLE_NUMBER`) y nombre del tratamiento (`TREATMENT_NAME`).
- Identificación de cirugías (`SURGERY`).
- Normalización temporal: fechas explícitas (`DATE`) y relativas (`IMPLICIT_DATE`).
- Detección de eventos clínicos (`OCURRENCE_EVENT`) y servicios clínicos (`CLINICAL_SERVICE`).
- Extracción de datos demográficos y clínicos: edad (`AGE`), comorbilidades (`COMORBIDITY`), alergias (`ALLERGIES`).
- Antecedentes: familiares (`FAMILY`), ginecológicos (`GINECOLOGICAL_HISTORY`) y gineco-obstétricos (`GINE_OBSTETRICS`).
- Hábitos tóxicos (`TOXIC_HABITS`) y su cuantificación (`HABIT-QUANTITY`).
- No soporta tool calling, function calling, agentes, razonamiento multi-step, visión ni audio: es un modelo discriminativo de clasificación de tokens.
- Capacidad multilingüe limitada al español por diseño, aunque el backbone se preentrenó en inglés.

## Casos de uso

- Estructuración de informes oncológicos: el modelo permite convertir texto libre de informes de mama en campos estructurados (diagnóstico, TNM, biomarcadores) para alimentar bases de datos clínicas o registros de tumores, aprovechando sus 24 tipos de entidad específicos del dominio.
- Extracción de regimenes de tratamiento: a partir de notas de evolución, se pueden recuperar fármacos, dosis, frecuencia, duración y número de ciclos en una sola pasada, lo que facilita la reconstrucción de líneas de tratamiento.
- Investigación retrospectiva: sobre cohorts de historias clínicas, el modelo permite poblar variables de estudio (estadio, biomarcadores, comorbilidades) de forma semiautomática, con revisión humana posterior dado que no está validado clínicamente.
- Preanotación para anotadores humanos: al ser un modelo NER entrenado con validación cruzada, puede usarse como primer paso en flujos de anotación activa, reduciendo el esfuerzo manual en corpus oncológicos en español.
- Docencia y experimentación en NLP clínico: el modelo y su notebook de Colab (`NER_inferencia_mama_prostata_Colab.ipynb`) sirven como referencia reproducible de un pipeline NER biomédico completo (tokenización, esquema BIO, agregación de sub-tokens, evaluación por folds).
- Detección de eventos adversos y progresión: la etiqueta `PROGRESION` y las entidades de eventos clínicos permiten construir alertas o índices de recidiva a partir de notas de seguimiento, siempre con supervisión experta.
- Enriquecimiento de sistemas de búsqueda clínica: los spans extraídos con posiciones `start`/`end` permiten indexar informes por entidades (fármaco, estadio, biomarcador) y habilitar búsquedas facetadas sobre repositorios documentales.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que se usaron métricas de precision, recall, F1 y accuracy, y que el modelo publicado es el del fold 2 por ser el de mayor F1 en su test, pero no se incluyen las cifras concretas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos, más activaciones; en la práctica, menos de 1 GB para batches pequeños.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA T4, y el modelo funciona sin problemas en RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas últimas sobredimensionadas para este tamaño).
- Cabe en GPU consumer: sí, en cualquier GPU moderna con 4 GB o más; incluso en CPU la inferencia es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline `token-classification` o `AutoModelForTokenClassification`), `text-embeddings-inference` no aplica, y es compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags). Para servir en producción se puede usar TorchServe, FastAPI con `transformers`, o exportar a ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (110 M de parámetros) y la longitud máxima de 512 tokens, se espera un throughput alto en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Test-FineTuning/bert-base-uncased-finetuned-ner-cancer-mama` | 108,9 M | 512 | NER clínico en español (cáncer de mama) | Apache 2.0 | Hugging Face, 36 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 | Modelo base genérico (inglés) | Apache 2.0 | Hugging Face, ampliamente usado |
| `PlanTL-GOB-ES/bsc-bio-ehr-es` | no disponible en la información | no disponible | NER biomédico en español (modelo de referencia del dominio) | no disponible | Hugging Face |
| `pucpr/clinicalner` (familia de modelos clínicos) | no disponible en la información | no disponible | NER clínico | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han publicado métricas del modelo en la información proporcionada, y los modelos comparables citados no incluyen sus cifras en este contexto. La diferencia principal frente a `bert-base-uncased` es la cabeza de clasificación de 49 etiquetas y el ajuste sobre corpus oncológico en español; frente a modelos biomédicos específicos en español como los de PlanTL, la ventaja es la granularidad de etiquetas oncológicas (TNM, biomarcadores, líneas de tratamiento), aunque la falta de benchmarks publicados impide afirmar superioridad.

## Limitaciones y advertencias

- Uso declarado exclusivamente educativo y de investigación; el autor indica explícitamente que no está validado para uso clínico ni para tomar decisiones sobre pacientes.
- Sesgo de selección del checkpoint: el modelo publicado es el fold 2, elegido entre cinco por su F1 en test, por lo que su rendimiento individual está inflado respecto a la media de los folds.
- Backbone preentrenado en inglés (`bert-base-uncased`) con tokenizador WordPiece sin vocabulario específico del español ni del dominio; esto puede degradar la tokenización de términos clínicos en español y de abreviaturas.
- Longitud de contexto limitada a 512 tokens, insuficiente para informes oncológicos largos sin truncado o segmentación.
- Corpus de entrenamiento no publicado, lo que impide auditar la composición, los sesgos demográficos o la calidad de las anotaciones más allá de la revisión declarada por el autor.
- Riesgo de alucinación de entidades: como todo modelo NER, puede generar spans plausibles pero incorrectos, especialmente en textos con abreviaturas ambiguas o formatos no vistos.
- Etiquetas nombradas en inglés (procedentes del corpus original) aunque el modelo procese texto en español, lo que puede confundir en integraciones.
- Sin métricas publicadas de precision, recall, F1 ni accuracy, pese a que la model card declara esas métricas; no es posible evaluar su calidad de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero la falta de validación clínica y de benchmarks desaconseja su uso en producción sanitaria sin una evaluación propia y supervisión humana.
- Solo cubre cáncer de mama; el notebook menciona también próstata, pero la model card no documenta ese dominio para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Test-FineTuning/bert-base-uncased-finetuned-ner-cancer-mama
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Notebook de inferencia (mencionado en la model card): `NER_inferencia_mama_prostata_Colab.ipynb` en el material del curso (no se proporciona URL directa)
- Paper de BERT: no disponible en la información proporcionada
- Repositorio del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

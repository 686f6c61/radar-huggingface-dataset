# victim6543/nerbenign

## Resumen

`victim6543/nerbenign` es un modelo de clasificación de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER), obtenido mediante fine-tuning de `prajjwal1/bert-tiny` sobre el dataset CoNLL-2003. Lo publica el usuario `victim6543` en Hugging Face y se enmarca en la categoría de modelos BERT minúsculos, con tan solo 4,37 millones de parámetros totales, lo que lo sitúa entre los transformers más ligeros disponibles para tareas de etiquetado secuencial.

El modelo resuelve la tarea de identificar y clasificar entidades (personas, organizaciones, localizaciones y miscelánea) en texto, siguiendo el esquema de anotación de CoNLL-2003. Su interés práctico radica en el reducido coste computacional: puede ejecutarse en CPU con latencias muy bajas y desplegarse en entornos con recursos limitados, lo que lo hace útil para prototipado rápido, pipelines de preprocesado o sistemas embebidos donde un modelo mayor no es viable.

La model card es escasa y generada automáticamente por el Trainer de Hugging Face, sin secciones de descripción, usos previstos ni limitaciones completadas por el autor. Los resultados declarados en el model-index (F1 de 0,8177 sobre CoNLL-2003) no están verificados (`verified: false`). La licencia no está especificada en la información disponible, lo que constituye una limitación relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), variante tiny de `prajjwal1/bert-tiny` |
| Parametros totales | 4.371.081 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (BERT estandar: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica de PyTorch y ONNX en funcion de la herramienta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `prajjwal1/bert-tiny`, un encoder transformer BERT con solo 2 capas y dimensión oculta reducida (arquitectura BERT estándar pero con hiperparámetros minimizados). Sobre esta base se añade una cabeza de clasificación de tokens para etiquetar cada token con las categorías de CoNLL-2003 (PER, ORG, LOC, MISC en formato BIO). El número total de parámetros, 4.371.081, confirma que se trata de un modelo extremadamente compacto.

El entrenamiento se realizó sobre el dataset CoNLL-2003 con los siguientes hiperparámetros declarados en la model card: learning rate de 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), optimizador Adam con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal, 5 épocas y semilla 42. El entrenamiento se ejecutó con Transformers 4.10.0, PyTorch 1.9.0+cu102, Datasets 1.11.0 y Tokenizers 0.10.3. No se documenta el número de tokens de entrenamiento ni si hubo técnicas adicionales de alineación (RLHF/DPO), algo esperable en un fine-tuning supervisado clásico de NER.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en texto: identificación de personas, organizaciones, localizaciones y entidades misceláneas según el esquema CoNLL-2003.
- Clasificación a nivel de token (token classification), no generación de texto.
- Ejecución muy rápida en CPU y GPU de gama baja gracias a sus 4,37 M de parámetros.
- Compatible con el pipeline `token-classification` de Transformers y con `endpoints_compatible`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües: no documentadas; el entrenamiento se realizó sobre CoNLL-2003, que es un corpus en inglés.

## Casos de uso

- Preprocesado de pipelines NLP: extracción rápida de entidades en grandes volúmenes de texto antes de pasos más costosos, aprovechando su bajo coste computacional.
- Prototipado de sistemas NER: validación rápida de arquitecturas y flujos de anotación antes de escalar a modelos mayores como BERT-base o RoBERTa.
- Anonimización de datos personales: detección de nombres de personas y organizaciones en textos para enmascararlos en entornos de desarrollo o pruebas.
- Despliegue en dispositivos con recursos limitados: inferencia en CPU, Raspberry Pi o contenedores pequeños donde un modelo de cientos de millones de parámetros no cabe.
- Etiquetado asistido en anotación de corpus: sugerencia automática de entidades para acelerar la revisión humana en proyectos de anotación.
- Filtrado y enrutamiento de documentos: clasificación de documentos por presencia de entidades relevantes (por ejemplo, menciones de organizaciones) en sistemas de gestión documental.
- Educación y experimentación: modelo didáctico para estudiar fine-tuning de BERT y evaluación NER con métricas seqeval sobre CoNLL-2003.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`) sobre el conjunto de evaluación de CoNLL-2003:

| Metrica | Valor |
|---|---|
| Precision | 0,8083 |
| Recall | 0,8274 |
| F1 | 0,8177 |
| Accuracy | 0,9598 |
| Loss (evaluacion) | 0,1689 |

Evolución declarada por época en la model card:

| Epoca | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|
| 1.0 | 0,1692 | 0,8072 | 0,8248 | 0,8159 | 0,9594 |
| 2.0 | 0,1678 | 0,8101 | 0,8277 | 0,8188 | 0,9600 |
| 3.0 | 0,1697 | 0,8103 | 0,8269 | 0,8186 | 0,9599 |
| 4.0 | 0,1694 | 0,8106 | 0,8263 | 0,8183 | 0,9600 |
| 5.0 | 0,1689 | 0,8083 | 0,8274 | 0,8177 | 0,9598 |

No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que además no aplican a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (4,37 M de parámetros); en la práctica puede ejecutarse completamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobradamente suficiente. En servidor, A100 o H100 no aportan ventaja significativa.
- Cabe en cualquier GPU consumer y en CPU, incluyendo entornos embebidos.
- Opciones de despliegue: `transformers` (pipeline `token-classification`), exportación a ONNX, TorchScript, y potencialmente `llama.cpp` no aplica (no es un modelo generativo). `vLLM` y `TGI` no están orientados a este tipo de modelo; para serving ligero se recomienda `FastAPI` + `transformers` o `ONNX Runtime`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por secuencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 CoNLL-2003 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| victim6543/nerbenign | 4,37 M | no disponible | 0,8177 (no verificado) | no disponible | Hugging Face |
| prajjwal1/bert-tiny (base) | ~4,4 M | 512 | no disponible (no fine-tuned para NER) | Apache 2.0 (segun el modelo base) | Hugging Face |
| BERT-base NER (p.ej. dslim/bert-base-NER) | ~110 M | 512 | ~0,91 (referencia habitual, no verificado en esta ficha) | MIT/Apache segun variante | Hugging Face |
| RoBERTa-large NER | ~355 M | 512 | >0,93 (referencia habitual, no verificado en esta ficha) | MIT | Hugging Face |

La comparativa con los modelos de referencia de mayor tamaño se basa en valores orientativos de la literatura; no se dispone de una evaluación directa en la información proporcionada. La ventaja principal de `nerbenign` es su tamaño mínimo; la desventaja, su menor F1 frente a modelos base y large.

## Limitaciones y advertencias

- Model card incompleta: el autor no ha documentado descripción, usos previstos, limitaciones ni datos de entrenamiento más allá de los hiperparámetros.
- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor; riesgo legal relevante para producción.
- Resultados no verificados (`verified: false`): las métricas declaradas proceden del propio autor y no han sido auditadas de forma independiente.
- Entrenado únicamente sobre CoNLL-2003 (inglés, dominio periodístico): el rendimiento fuera de ese dominio o en otros idiomas es incierto.
- Riesgo de alucinación y errores de etiquetado: como todo modelo NER, puede generar falsos positivos y negativos, especialmente en entidades ambiguas o poco frecuentes.
- Sesgos potenciales heredados del corpus CoNLL-2003 y del modelo base `bert-tiny`, no documentados por el autor.
- Contexto limitado (no confirmado, pero BERT estándar admite 512 tokens): textos largos requieren segmentación.
- No apto para tareas generativas, razonamiento, código ni matemáticas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; considerar como modelo experimental.

## Enlaces

- Hugging Face: https://huggingface.co/victim6543/nerbenign
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Dataset CoNLL-2003: https://huggingface.co/datasets/conll2003
- Documentación de Transformers sobre token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

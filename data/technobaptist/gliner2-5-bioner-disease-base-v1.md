# TechnoBaptist/GLiNER2.5-BioNER-Disease-Base-v1

## Resumen

GLiNER2.5-BioNER-Disease-Base-v1 es un modelo de extracción de menciones de enfermedades (named entity recognition, NER) para texto biomédico y clínico en inglés, desarrollado por TechnoBaptist a partir del modelo base fastino/gliner2.5-base-v1. Está diseñado para una tarea muy concreta: identificar todas las menciones de enfermedades en texto médico y devolverlas con offsets de caracteres exactos y una puntuación de confianza. Su salida es una lista de entidades con los campos `text`, `start`, `end` y `score`, donde `text[start:end]` corresponde al span exacto en el texto original.

El modelo se apoya en la familia GLiNER2, una arquitectura de extracción de entidades zero-shot que permite especificar las etiquetas en tiempo de inferencia mediante prompting estructurado, en lugar de depender de un conjunto fijo de clases. Con 193.581.591 parámetros (194M), es lo suficientemente pequeño para ejecutarse en CPU sin problemas, lo que lo hace adecuado para procesamiento por lotes de notas clínicas en entornos con recursos limitados o con requisitos de privacidad que impiden enviar datos a servicios externos.

Su relevancia actual radica en que está afinado específicamente sobre el corpus NCBI Disease para la etiqueta `disease`, y el autor reporta una mejora sustancial frente al modelo base en el conjunto de test BC5CDR: 67,04 F1 frente a 52,68 F1 del base, es decir, +14,4 puntos de F1. El modelo se distribuye con licencia Apache-2.0 y está integrado en el SDK OpenMed, lo que facilita su uso en pipelines de NLP clínico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER2 (extractor de entidades zero-shot basado en transformer encoder; detalles internos no disponibles) |
| Parámetros totales | 193.581.591 (194M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de fastino/gliner2.5-base-v1, un extractor GLiNER2 que sigue el paradigma de reconocimiento de entidades nombradas generalista: en lugar de un clasificador con etiquetas fijas, el modelo recibe en la entrada el texto y las etiquetas de interés (en este caso, `disease`) y predice los spans correspondientes. El autor no detalla en la información disponible la composición exacta del encoder, el número de capas ni la longitud máxima de secuencia del modelo base.

El ajuste fino se realizó sobre el corpus ncbi/ncbi_disease, un conjunto de referencia para NER de enfermedades en literatura biomédica. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO (poco probables en una tarea de token classification). La evaluación se realizó sobre BC5CDR, un corpus distinto al de entrenamiento, con 500 abstracts de PubMed y 4.424 menciones de enfermedad anotadas manualmente, lo que proporciona una medida de generalización cruzada entre corpus.

## Capacidades

- Extracción de menciones de enfermedades en texto biomédico y clínico en inglés, con una única etiqueta: `disease`.
- Devolución de offsets de caracteres exactos (`start`, `end`) y puntuación de confianza por entidad.
- Umbral de confianza configurable (por defecto 0,7; la evaluación principal usa 0,5).
- Procesamiento de notas clínicas largas: el SDK OpenMed divide el texto en frases y devuelve offsets sobre el texto original.
- Anotación de contexto clínico opcional mediante `assert_context=True`: negación, experimentador (paciente/familiar) y temporalidad de cada mención.
- Ejecución en CPU y en GPU (configurable mediante `OpenMedConfig(device="cuda")`).
- Carga única del modelo con caché para procesamiento por lotes de muchas notas.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido; es un modelo especializado de token classification.

## Casos de uso

- **Extracción de enfermedades en notas clínicas electrónicas**: el modelo identifica todas las menciones de enfermedad en informes de alta, historiales y notas de evolución, devolviendo offsets exactos que permiten resaltar las entidades en un visor clínico o indexarlas en una base de datos.
- **Codificación y estructuración de historiales**: las menciones extraídas pueden mapearse posteriormente a códigos SNOMED CT o ICD-10 mediante un paso de normalización, facilitando la explotación analítica de texto libre.
- **Detección de comorbilidades en cohortes de investigación**: procesamiento por lotes de abstracts de PubMed o corpus clínicos para construir variables de enfermedad en estudios observacionales, aprovechando que el modelo corre en CPU y puede desplegarse sobre grandes volúmenes sin coste de API.
- **Filtrado y triaje de literatura biomédica**: identificación rápida de abstracts que mencionan enfermedades de interés en revisiones sistemáticas, con umbral ajustable para priorizar precisión o recall según la fase del cribado.
- **Anonimización y enriquecimiento de datos clínicos**: combinado con el resto de herramientas del SDK OpenMed, las menciones de enfermedad permiten enriquecer registros ya de-identificados sin exponer datos a servicios externos, manteniendo el cumplimiento de privacidad.
- **Sistemas de alertas clínicas**: detección de enfermedades mencionadas en texto libre (por ejemplo, en notas de urgencias) para disparar reglas de negocio o revisiones, con la ventaja de que el modelo se ejecuta localmente y no requiere conectividad.
- **Preprocesamiento para pipelines de NLP clínico**: uso como primer eslabón que etiqueta entidades de enfermedad antes de tareas posteriores como relación entre entidades, resumen o extracción de eventos adversos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente). Evaluación sobre BC5CDR test (500 abstracts de PubMed, 4.424 menciones, coincidencia exacta de span, umbral 0,5):

| Modelo | Precisión | Recall | F1 |
|---|---:|---:|---:|
| GLiNER2.5-BioNER-Disease-Base-v1 (este modelo) | 69,90 | 64,40 | **67,04** |
| fastino/gliner2.5-base-v1 (antes del ajuste) | 51,51 | 53,91 | 52,68 |

A umbral 0,7 (valor por defecto, elegido sobre el conjunto de desarrollo antes de testear): precisión 70,93, recall 61,44, F1 65,84. El autor reporta una mejora de +14,4 puntos de F1 (IC 95%: +12,6 a +16,1, bootstrap emparejado sobre documentos de test).

Comparativa dentro de la familia de enfermedades de OpenMed, mismo conjunto de test y umbral:

| Modelo | Parámetros | F1 BC5CDR (0,5) |
|---|---:|---:|
| OpenMed GLiFormer BioNER Disease Large v1 | 576M | 69,01 |
| **GLiNER2.5-BioNER-Disease-Base-v1** (este modelo) | 194M | 67,04 |
| OpenMed GLiFormer BioNER Disease Base v1 | 264M | 64,10 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,8 GB en fp32 (194M parámetros), y del orden de 0,2 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. El modelo está pensado para ejecutarse también en CPU.
- Cabe en GPU consumer: sí, en todas las GPU modernas, e incluso en entornos sin GPU.
- Opciones de despliegue: SDK OpenMed (`pip install -U "openmed[gliner2]"`, OpenMed 3.2 o superior), con soporte de CPU y CUDA. Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no están documentadas en la información disponible para este modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 BC5CDR (0,5) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| GLiNER2.5-BioNER-Disease-Base-v1 | 194M | No disponible | 67,04 | Apache-2.0 | HuggingFace (TechnoBaptist) |
| OpenMed GLiFormer BioNER Disease Large v1 | 576M | No disponible | 69,01 | No disponible | HuggingFace (OpenMed) |
| OpenMed GLiFormer BioNER Disease Base v1 | 264M | No disponible | 64,10 | No disponible | HuggingFace (OpenMed) |
| fastino/gliner2.5-base-v1 | No disponible | No disponible | 52,68 | No disponible | HuggingFace (fastino) |

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Está especializado en una única etiqueta (`disease`); no extrae fármacos, genes, procedimientos ni otras entidades clínicas.
- El rendimiento reportado (67,04 F1) procede del autor y no ha sido verificado de forma independiente; los resultados pueden variar en dominios distintos de NCBI Disease y BC5CDR.
- El ajuste se realizó solo sobre NCBI Disease, por lo que puede presentar sesgos hacia el estilo y vocabulario de ese corpus; el rendimiento en notas clínicas reales (con abreviaturas, errores tipográficos y jerga institucional) no está documentado.
- Riesgo de alucinación de spans: como todo modelo de extracción, puede generar menciones espurias o fragmentadas, especialmente con umbrales bajos; se recomienda ajustar el umbral según el caso de uso.
- La anotación de contexto clínico (negación, experimentador, temporalidad) depende del SDK OpenMed y de sus reglas, no del modelo en sí; su fiabilidad no está cuantificada en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, pero se recomienda revisar las condiciones del modelo base fastino/gliner2.5-base-v1, cuya licencia no se detalla en la información proporcionada.
- El modelo tiene solo 15 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia; conviene evaluarlo sobre datos propios antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/GLiNER2.5-BioNER-Disease-Base-v1
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Organización OpenMed en HuggingFace: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- Paquete OpenMed en PyPI: https://pypi.org/project/openmed/
- Modelo OpenMed GLiFormer BioNER Disease Large v1: https://huggingface.co/OpenMed/GLiFormer-BioNER-Disease-Large-v1
- Modelo OpenMed GLiFormer BioNER Disease Base v1: https://huggingface.co/OpenMed/GLiFormer-BioNER-Disease-Base-v1
- Paper de referencia (arXiv:2508.01630): https://arxiv.org/abs/2508.01630
- Paper de referencia (arXiv:2507.18546): https://arxiv.org/abs/2507.18546
- Dataset NCBI Disease: https://huggingface.co/datasets/ncbi/ncbi_disease
- Cuenta de OpenMed en X: https://x.com/OpenMed_AI

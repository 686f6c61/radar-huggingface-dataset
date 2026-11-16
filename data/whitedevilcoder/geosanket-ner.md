# whitedevilcoder/geosanket-ner

## Resumen

GeoSanket NER es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de anuncios de proyectos gubernamentales. Se trata de un fine-tune del modelo `google-bert/bert-base-multilingual-cased` publicado por el autor `whitedevilcoder` en Hugging Face, orientado a la tarea de token classification. Su proposito concreto es extraer siete tipos de entidades estructuradas —PROJECT, BUDGET, SPENT, PROGRESS, LEADER, SCHEME y DEPT— a partir de texto libre de comunicados y anuncios de obra publica.

El modelo parte de la arquitectura BERT multilingue en su variante base, con 177.274.383 parametros totales, lo que corresponde a la configuracion estandar de `bert-base-multilingual-cased` (12 capas, 768 dimensiones ocultas, vocabulario multilingue ampliado). El repositorio ocupa 1,4 GB y los pesos se distribuyen en formato safetensors. Los idiomas declarados son ingles (en) e hindi (hi).

Su relevancia es acotada pero clara: no compite como modelo generalista, sino como extractor de campos para pipelines de digitalizacion de informacion administrativa. El autor reporta en la model card una evaluacion sobre un conjunto de test con plantillas retenidas (held-out-template) a nivel de entidad, con precision 0,8668, recall 0,8877 y F1 0,8771. El modelo tiene un volumen de descargas muy bajo (18) y no cuenta con licencia declarada, lo que condiciona su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingue) |
| Parametros totales | 177.274.383 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base: 512 tokens como maximo posicional) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT en configuracion base, heredada de `google-bert/bert-base-multilingual-cased`. Esto implica 12 capas de atencion bidireccional, 768 dimensiones ocultas y un vocabulario multilingue de aproximadamente 119.000 tokens. El modelo se ha fine-tuneado para token classification, con una cabeza de clasificacion sobre las representaciones contextuales para etiquetar cada token con las categorias BIO del esquema de entidades (PROJECT, BUDGET, SPENT, PROGRESS, LEADER, SCHEME, DEPT).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el numero de tokens procesados ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO (no aplicables en un encoder de clasificacion). La model card unicamente documenta el resultado de evaluacion sobre un conjunto de test con plantillas retenidas, lo que sugiere que el entrenamiento se realizo sobre datos generados o estructurados con plantillas y que la evaluacion busca medir la generalizacion a plantillas no vistas. No se detalla la innovacion tecnica mas alla del propio ajuste supervisado.

## Capacidades

- Extraccion de entidades nombradas en siete categorias de dominio administrativo: PROJECT, BUDGET, SPENT, PROGRESS, LEADER, SCHEME y DEPT.
- Token classification a nivel de entidad, con etiquetado BIO sobre texto de entrada.
- Procesamiento de texto en ingles e hindi, segun los idiomas declarados.
- Especializacion en lenguaje de anuncios de proyectos gubernamentales (presupuestos, gasto ejecutado, porcentaje de progreso, responsable, esquema y departamento).
- No dispone de generacion de texto, razonamiento general, codigo ni matematicas: es un encoder discriminativo, no un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Digitalizacion de comunicados oficiales: el modelo extrae de forma automatica el nombre del proyecto, el presupuesto asignado, el gasto ejecutado y el porcentaje de progreso a partir de notas de prensa administrativas, reduciendo la introduccion manual de datos en sistemas de gestion.
- Construccion de bases de datos de obra publica: alimentar un pipeline ETL que convierta anuncios en texto libre en registros estructurados (tabla con columnas PROJECT, BUDGET, SPENT, PROGRESS, LEADER, SCHEME, DEPT) para su explotacion analitica.
- Monitorizacion de ejecucion presupuestaria: procesar lotes de anuncios periodicos y comparar los campos BUDGET y SPENT para detectar desviaciones o proyectos con progreso bajo.
- Enrutamiento y clasificacion documental: usar las entidades LEADER y DEPT para asignar cada anuncio al departamento o responsable correspondiente dentro de un flujo de tramitacion.
- Extraccion para portales de transparencia: generar fichas estructuradas de proyectos a partir de texto publicado, facilitando la consulta publica y la reutilizacion de datos.
- Preprocesado para sistemas RAG: enriquecer los documentos con metadatos extraidos (esquema, departamento, presupuesto) antes de indexarlos, mejorando el filtrado y la recuperacion en busquedas posteriores.
- Analisis de texto en hindi e ingles: al ser multilingue, permite procesar anuncios en ambos idiomas dentro de una misma organizacion sin desplegar dos modelos separados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision (entity-level, held-out-template) | 0,8668 |
| Recall (entity-level, held-out-template) | 0,8877 |
| F1 (entity-level, held-out-template) | 0,8771 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible. Los unicos datos de rendimiento son los de la evaluacion propia del autor sobre test con plantillas retenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp32 (177 M de parametros) y en torno a 0,35 GB en fp16; con cuantizacion int8 se situaria cerca de 0,2 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una T4, RTX 3060 o superior ofrece margen holgado. Para lotes grandes, A100 o H100 permiten mayor throughput, aunque el modelo es pequeno y no las requiere.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch) con pipeline de token-classification, ONNX Runtime, TGI (Text Generation Inference no aplica a clasificacion; usar en su lugar servicios de inferencia de clasificacion), y exportacion a GGUF mediante llama.cpp para CPU si se convierte el modelo. vLLM no esta orientado a encoders de clasificacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en decenas de milisegundos por secuencia corta en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| GeoSanket NER (este modelo) | 177 M | no disponible (BERT base, 512 max.) | en, hi | no disponible | NER de dominio administrativo (7 entidades) |
| google-bert/bert-base-multilingual-cased | 177 M | 512 tokens | 104 idiomas | Apache 2.0 | Encoder base multilingue, sin fine-tune de NER |
| dslim/bert-base-NER | 108 M | 512 tokens | en | MIT | NER generalista (PER, ORG, LOC, MISC) |
| Davlan/bert-base-multilingual-cased-ner-hrl | 177 M | 512 tokens | 10 idiomas de alto recursos | AFL-3.0 | NER generalista multilingue (PER, ORG, LOC) |

La comparativa se limita a estos modelos porque no se dispone de informacion sobre otros fine-tunes de NER especificos del dominio de proyectos gubernamentales. GeoSanket NER se diferencia por su esquema de entidades de dominio (presupuesto, gasto, progreso, departamento) frente a los esquemas genericos PER/ORG/LOC de los modelos de referencia.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia en el repositorio ni en la model card, lo que impide determinar si el uso comercial esta permitido. Es un bloqueo critico para produccion.
- Idiomas limitados a ingles e hindi: no se declara soporte para castellano ni otros idiomas, aunque el modelo base sea multilingue; el fine-tune puede degradar el rendimiento fuera de los idiomas de entrenamiento.
- Especializacion estrecha: el modelo esta entrenado para un esquema fijo de siete entidades de dominio administrativo; no es util para NER generalista ni para otras tareas.
- Riesgo de sobreajuste a plantillas: la evaluacion se realiza sobre plantillas retenidas, pero no se documenta la variedad de datos de entrenamiento; el rendimiento en texto real no estructurado puede ser inferior al reportado.
- Riesgo de alucinacion de entidades: como todo modelo de clasificacion, puede etiquetar fragmentos incorrectamente, especialmente en textos con ruido, abreviaturas o cifras ambiguas.
- Longitud de contexto limitada: al derivar de BERT base, la ventana maxima es de 512 tokens; anuncios largos requeriran truncamiento o segmentacion.
- Sin datos de sesgo: no se documentan sesgos conocidos ni evaluaciones de robustez.
- Volumen de adopcion muy bajo (18 descargas, 0 likes) y sin mantenimiento documentado mas alla de la fecha de actualizacion del repositorio; no hay garantias de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whitedevilcoder/geosanket-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased

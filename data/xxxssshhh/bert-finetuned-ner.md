# xxxssshhh/bert-finetuned-ner

## Resumen

bert-finetuned-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning supervisado de google-bert/bert-base-cased. Lo publica el usuario xxxssshhh en Hugging Face y se distribuye con licencia Apache 2.0. El modelo resuelve la tarea de token classification, es decir, asignar una etiqueta BIO a cada token de una secuencia para extraer personas, organizaciones, localizaciones y otras categorías de entidad. Su relevancia practica es la de un componente ligero y desplegable para pipelines de extraccion de informacion en produccion.

La arquitectura es la de BERT base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con 107.726.601 parametros totales segun los pesos en safetensors. Al ser un modelo encoder-only, no genera texto libre: produce logits por token que se decodifican a etiquetas de entidad. Su ventana de contexto util es de 512 tokens, el limite posicional de bert-base-cased.

El modelo se entreno durante 3 epocas con un learning rate de 2e-05, batch de 8 y optimizador AdamW fused, alcanzando en el conjunto de evaluacion un F1 de 0,9417, precision de 0,9341, recall de 0,9495 y accuracy de 0,9860. La model card no especifica el dataset de entrenamiento ni los idiomas soportados, lo que limita la trazabilidad del resultado. Es un artefacto pequeno (1,3 GB de repo) y facil de servir con transformers o con runtimes de inferencia ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), 12 capas, 768 dimensiones ocultas, 12 cabezas de atencion |
| Parametros totales | 107.726.601 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (limite posicional de bert-base-cased) |
| Tipos de cuantizacion | no disponible en la model card; compatible con cuantizacion dinamica de PyTorch y con conversion a ONNX/GGUF mediante herramientas externas |
| Idiomas soportados | no disponible; el modelo base es google-bert/bert-base-cased, entrenado principalmente con texto en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo con transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de bert-base-cased para token classification. BERT base es un transformer bidireccional con embeddings de token, posicion y segmento, 12 bloques de self-attention multi-cabeza y una cabeza de clasificacion por token anadida para la tarea NER. El entrenamiento se realizo con la libreria transformers 5.22.1 sobre PyTorch 2.14.1, con 3 epocas, 5.268 pasos totales, batch de 8, learning rate 2e-05 con scheduler lineal, semilla 42 y AdamW fused con betas (0,9; 0,999) y epsilon 1e-08.

La model card indica que el modelo se entreno sobre un dataset no identificado ("unknown dataset") y no documenta la composicion de los datos, el esquema de etiquetas BIO ni si hubo aumento de datos. La evolucion del entrenamiento muestra una perdida de validacion que se estabiliza entre la epoca 2 (0,0646) y la epoca 3 (0,0638), mientras que el F1 de validacion sube de 0,9207 a 0,9380 y finalmente a 0,9417. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal ni destilacion.

## Capacidades

- Reconocimiento de entidades nombradas por token (token classification) con etiquetas en formato BIO.
- Extraccion de entidades en texto no estructurado: personas, organizaciones, localizaciones y otras clases definidas por el dataset de entrenamiento (no documentadas).
- Clasificacion a nivel de token con salida de logits y probabilidades por etiqueta.
- Inferencia por lotes mediante el pipeline `token-classification` de transformers.
- No soporta generacion de texto, razonamiento generativo ni codigo: es un encoder discriminativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues: no documentadas; el modelo base esta orientado a ingles.
- Capacidades especiales: no disponibles.

## Casos de uso

- Extraccion de entidades en documentos legales y contratos: el modelo etiqueta tokens de personas y organizaciones en clausulas de hasta 512 tokens, lo que permite poblar bases de datos de partes contratantes en pipelines de ingestion documental.
- Anonimizacion y seudonimizacion de datos personales: al detectar entidades de tipo persona u organizacion, se pueden enmascarar antes de almacenar o compartir textos, un paso habitual en cumplimiento de RGPD.
- Enriquecimiento de CRM y atencion al cliente: procesar correos y transcripciones para extraer nombres de clientes, empresas y ubicaciones y rellenar campos estructurados automaticamente.
- Analisis de noticias y monitorizacion de medios: extraer entidades de titulares y cuerpos de noticia para construir grafos de entidades y seguir menciones de empresas o figuras publicas.
- Preprocesado para sistemas RAG: identificar entidades en los fragmentos recuperados para filtrar, etiquetar o enlazar con bases de conocimiento antes de pasarlos a un modelo generativo.
- Indexacion de curriculos y ofertas de empleo: detectar empresas, titulaciones y localizaciones en CV para busquedas facetadas en portales de empleo.
- Etiquetado asistido en anotacion de datos: usar las predicciones como preanotacion en herramientas como Label Studio o Prodigy, con revision humana posterior, dado el F1 de 0,9417 reportado en validacion.

## Benchmarks y rendimiento

La model card declara resultados en el conjunto de evaluacion, aunque el model-index no contiene entradas. Se reproducen tal cual:

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Validation loss | 0,0626 | 0,0646 | 0,0638 |
| Precision | 0,9057 | 0,9309 | 0,9341 |
| Recall | 0,9362 | 0,9451 | 0,9495 |
| F1 | 0,9207 | 0,9380 | 0,9417 |
| Accuracy | 0,9830 | 0,9852 | 0,9860 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, CoNLL-2003) en la informacion disponible, ni comparaciones con otros modelos NER.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,45 GB solo para pesos (107,7 M de parametros), mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; en CPU la inferencia es viable para lotes pequenos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para throughput moderado. Para alto volumen, una T4, L4, RTX 3060 o superior es mas que suficiente. A100/H100 solo tienen sentido para servir muchos modelos o lotes muy grandes.
- Cabe en GPU de consumo: si, en cualquier GPU consumer con 2 GB o mas de VRAM, e incluso en iGPU.
- Opciones de despliegue: pipeline de transformers, Text Generation Inference no aplica (no es generativo), vLLM no soporta encoder-only para esta tarea, ONNX Runtime, TorchScript, FastAPI con transformers, o conversion a GGUF para llama.cpp si se dispone de la herramienta de conversion.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xxxssshhh/bert-finetuned-ner | 107,7 M | 512 tokens | NER (token classification) | Apache 2.0 | Hugging Face, 43 descargas |
| google-bert/bert-base-cased | 108 M | 512 tokens | Modelo base sin fine-tuning para NER | Apache 2.0 | Hugging Face |
| dslim/bert-base-NER | 108 M | 512 tokens | NER en ingles (CoNLL-2003) | MIT | Hugging Face |
| Jean-Baptiste/roberta-large-ner-english | 355 M | 512 tokens | NER en ingles | MIT | Hugging Face |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado, por lo que se desconoce el esquema de etiquetas, el dominio y la cobertura linguistica.
- Los resultados de F1 (0,9417) y accuracy (0,9860) proceden de un conjunto de evaluacion no identificado; no son comparables con cifras de CoNLL-2003 ni de otros benchmarks estandar.
- El modelo base esta orientado al ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Limite de 512 tokens por secuencia: los documentos largos requieren fragmentacion con solapamiento, lo que puede partir entidades en los bordes.
- Riesgo de alucinacion de entidades: al ser un clasificador por token, puede etiquetar como entidad fragmentos que no lo son, especialmente en dominios alejados del entrenamiento.
- Sesgos heredados de bert-base-cased: el corpus de preentrenamiento puede introducir sesgos de genero, nacionalidad y profesion en las etiquetas asignadas.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y conservacion del aviso de licencia; no impone restricciones de uso adicionales.
- Solo 43 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de validacion independiente.
- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"), lo que reduce la fiabilidad de la documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xxxssshhh/bert-finetuned-ner
- Modelo base: https://huggingface.co/bert-base-cased
- Modelo base (organizacion Google): https://huggingface.co/google-bert/bert-base-cased
- Paper de BERT: https://arxiv.org/abs/1810.04805
- Documentacion de token classification en transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Referencia de modelos NER comparables: https://huggingface.co/dslim/bert-base-NER

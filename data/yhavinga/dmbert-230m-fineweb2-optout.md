# yhavinga/dmbert-230m-fineweb2-optout

## Resumen

dmbert-230m-fineweb2-optout es un codificador (encoder) de tipo ModernBERT para neerlandes, desarrollado por yhavinga, con 230 millones de parametros y preentrenado desde cero mediante modelado de lenguaje enmascarado (masked language modelling) sobre la porcion neerlandesa de FineWeb-2. Se trata de un modelo base, no instruido, pensado para ser afinado en tareas de clasificacion, clasificacion de tokens, question answering extractivo o retrieval. Resuelve el problema de disponer de un encoder neerlandes moderno, con atencion rotatoria y ventana deslizante, entrenado sobre un corpus reciente y filtrado.

El modelo incorpora un filtrado especifico: se eliminaron los documentos de sitios cuya reserva legible por maquina de mineria de texto y datos (text and data mining, TDM) fue detectada en noviembre de 2026, y se sustituyeron mas tipos de datos personales por marcadores de posicion que en recetas anteriores. El entrenamiento consumio aproximadamente 163.300 millones de tokens, unas 2,2 pasadas sobre el corpus, en secuencias de hasta 1.024 tokens, usando JAX/Flax sobre un Cloud TPU v4-32.

Es relevante ahora porque ofrece una alternativa con licencia Apache 2.0 y pesos en safetensors a los encoders multilingues genericos, y porque su receta de filtrado opt-out lo hace interesante para equipos que necesitan trazabilidad sobre el origen de los datos de entrenamiento. El tokenizador es un SentencePiece BPE de tipo Llama con 32.000 tokens y fallback de bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT: encoder Transformer pre-norm, rotary position embeddings (RoPE), GeGLU, sin terminos de sesgo en el encoder, atencion local y global alternada |
| Parametros totales | 230.110.592 (el recuento del Hub muestra ~263M porque la matriz de embeddings se almacena dos veces por el weight tying) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de preentrenamiento; `max_position_embeddings` = 8.192 como limite arquitectonico, no como longitud entrenada |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | neerlandes (nl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32); tamano del repo 1,1 GB |

Detalles adicionales de arquitectura: 22 capas, hidden size 1.024, 16 cabezas de atencion (tamano de cabeza 64), intermediate size 1.536. Atencion global en cada tercera capa (capas 0, 3, ..., 21) y ventana deslizante de 128 tokens en el resto. Base RoPE de 160.000 en capas globales y 10.000 en locales. La cabeza de masked-LM consta de una capa densa, GELU y LayerNorm, seguida del decoder atado con sesgo.

## Arquitectura y entrenamiento

El modelo es un encoder Transformer puro de tipo ModernBERT, con normalizacion previa, embeddings posicionales rotatorios, activacion GeGLU y eliminacion de sesgos en el encoder. La innovacion principal frente a BERT clasico es la combinacion de atencion global cada tres capas con atencion local de ventana deslizante de 128 tokens en las demas, lo que reduce el coste computacional en secuencias largas. La cabeza de masked-LM usa una capa densa con GELU y LayerNorm y un decoder atado a los embeddings de entrada.

El preentrenamiento se realizo con modelado de lenguaje enmascarado sobre la porcion neerlandesa de FineWeb-2, tras eliminar los documentos de sitios con reserva TDM detectada en noviembre de 2026 y sustituir datos personales por marcadores. Se procesaron unos 163.300 millones de tokens en aproximadamente 2,2 pasadas sobre el corpus, con secuencias de hasta 1.024 tokens. Cada documento se tokenizo sin tokens especiales y se corto en piezas de como maximo 1.024 tokens; cada pieza empieza con `<s>` y la que contiene el final del documento termina con `</s>`. El entrenamiento se ejecuto con JAX/Flax sobre un Cloud TPU v4-32. No se menciona en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa, lo cual es coherente con un modelo base de tipo encoder.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask) en neerlandes, con prediccion de tokens enmascarados.
- Generacion de representaciones contextuales para clasificacion de secuencias (sentimiento, topicos, etc.).
- Clasificacion de tokens (NER, etiquetado morfosintactico, chunking).
- Question answering extractivo sobre pasajes en neerlandes.
- Retrieval y ranking de pasajes mediante embeddings del encoder (requiere afinado o pooling adecuado).
- Fine-tuning supervisado con `AutoModelForSequenceClassification` y otras cabezas de la libreria transformers.
- Tokenizacion con offsets de caracteres exactos (`return_offsets_mapping=True`), util para tareas de alineacion y extraccion.
- Soporte de pares de frases con el formato `<s> A <s> B`.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un encoder base.

## Casos de uso

- Clasificacion de textos en neerlandes en produccion: afinando la cabeza de clasificacion sobre un corpus etiquetado, el modelo puede servir para moderacion de comentarios, deteccion de spam o categorizacion de tickets. Su contexto de 1.024 tokens cubre la mayoria de textos cortos y medios.
- Reconocimiento de entidades nombradas (NER): la clasificacion de tokens con offsets exactos permite alinear predicciones con el texto original, lo que simplifica la integracion en pipelines de extraccion de entidades en documentos neerlandeses.
- Question answering extractivo: afinado sobre SQuAD-nl u otros conjuntos neerlandeses, permite construir sistemas de busqueda de respuestas sobre documentacion interna, con la ventaja de que el encoder es ligero y rapido en inferencia.
- Retrieval y busqueda semantica: usando las representaciones del encoder (con pooling y afinado contrastivo), se puede indexar documentacion neerlandesa y recuperar pasajes relevantes en un sistema RAG.
- Filtrado y deduplicacion de corpus: el modelo puede puntuar la fluidez o la probabilidad de textos neerlandeses para tareas de limpieza de datos, aprovechando su entrenamiento en masked LM sobre FineWeb-2.
- Analisis de sentimiento en resenas de producto o encuestas: afinando con un conjunto pequeno de etiquetas, se obtiene un clasificador rapido que cabe en CPU o en GPU de gama baja.
- Etiquetado linguistico y anotacion asistida: la tokenizacion con offsets exactos y el vocabulario BPE de 32.000 tokens facilitan la construccion de herramientas de anotacion para linguistas que trabajan con neerlandes.

## Benchmarks y rendimiento

La model card menciona una evaluacion y un test de memorizacion que incluyen tanto este modelo como dmbert-230m-culturax, pero no se proporcionan en la informacion disponible los resultados numericos de dichos benchmarks. Tampoco se incluyen cifras de MMLU, HumanEval, GSM8K ni de tareas especificas de NLP neerlandes.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1 GB para los pesos (230M parametros x 4 bytes), mas memoria para activaciones y batch; en la practica, 2-4 GB son suficientes para batches moderados.
- En cuantizacion de 8 bits, el modelo ocuparia alrededor de 0,25-0,3 GB de pesos; en 4 bits, alrededor de 0,15 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 4090, RTX 3090, RTX 4070 o incluso una GTX 1660 pueden ejecutar inferencia y fine-tuning ligero. Para entrenamiento a mayor escala, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer sin problema, y tambien en CPU para inferencia con lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), y por ser un encoder estandar, es compatible con ONNX Runtime, TorchScript y despliegues con FastAPI o similar. No se mencionan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un encoder y no un modelo generativo, las herramientas orientadas a decodificacion no son el objetivo principal.
- Latencia y throughput: no se proporcionan cifras en la informacion disponible. Por el tamano (230M parametros) y la atencion local en la mayoria de capas, se espera un throughput alto en GPU consumer, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| yhavinga/dmbert-230m-fineweb2-optout | 230M | 1.024 (entrenado); 8.192 (limite) | nl | Apache 2.0 | Filtrado opt-out TDM, FineWeb-2 |
| yhavinga/dmbert-230m-culturax | 230M | 1.024 (entrenado); 8.192 (limite) | nl | Apache 2.0 | Misma arquitectura y receta, corpus CulturaX sin filtrado TDM |
| ModernBERT-base (multilingue/ingles) | ~149M | 8.192 | en (y variantes) | Apache 2.0 | Referencia arquitectonica; no especifico de neerlandes |
| BERTje | ~110M | 512 | nl | Apache 2.0 | Encoder neerlandes clasico, sin RoPE ni atencion local |

La comparativa se limita a los datos disponibles. No se dispone de resultados de benchmarks que permitan comparar rendimiento entre estos modelos; la principal diferencia documentada es el corpus de entrenamiento y el filtrado opt-out de este modelo frente a dmbert-230m-culturax.

## Limitaciones y advertencias

- Es un modelo base: no esta instruido ni alineado, por lo que no debe usarse directamente como asistente conversacional sin afinado.
- La longitud de contexto entrenada es de 1.024 tokens; aunque `max_position_embeddings` sea 8.192, usar secuencias mas largas sin afinado puede degradar el rendimiento.
- El tokenizador trunca por la izquierda por defecto (`truncation_side="left"`), lo que puede descartar el inicio de textos largos si no se ajusta manualmente.
- El formato del token `<mask>` afecta a las predicciones: escribir espacios alrededor del token produce ids distintos a los vistos en preentrenamiento y degrada la calidad del fill-mask.
- Riesgo de alucinacion: aunque es un encoder y no genera texto libre, las predicciones de fill-mask pueden ser incorrectas o reflejar sesgos del corpus.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el corpus FineWeb-2 y el filtrado aplicado pueden introducir sesgos de cobertura o de representacion.
- Limitaciones de idioma: solo neerlandes; no se garantiza un rendimiento aceptable en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el origen o los derechos de los datos de entrenamiento mas alla del filtrado TDM descrito.
- El recuento de parametros del Hub (~263M) difiere del real (230M) por el weight tying; conviene tenerlo en cuenta al planificar memoria.
- No se publican resultados de benchmarks ni de memorizacion en la informacion disponible, lo que limita la evaluacion objetiva antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yhavinga/dmbert-230m-fineweb2-optout
- Modelo relacionado (CulturaX): https://huggingface.co/yhavinga/dmbert-230m-culturax
- Tokenizador: https://huggingface.co/yhavinga/dutch-llama-tokenizer
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paper ModernBERT: https://arxiv.org/abs/2412.13663
- Paper adicional referenciado (arxiv:2405.18392): https://arxiv.org/abs/2405.18392
- Paper adicional referenciado (arxiv:1910.00896): https://arxiv.org/abs/1910.00896

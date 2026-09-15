# youssefhl/distilbert-imdb-sentiment

## Resumen

distilbert-imdb-sentiment es un ajuste fino de distilbert-base-uncased publicado por el usuario youssefhl en Hugging Face para clasificacion binaria de sentimiento (positivo/negativo) en resenas. Se trata de un encoder transformer de 6 capas y 66.955.010 parametros segun los pesos safetensors del repositorio, con una ventana de contexto fija de 512 tokens heredada de DistilBERT y tokenizador WordPiece en minusculas (uncased) con vocabulario de 30.522 tokens. La licencia declarada es Apache 2.0 y el pipeline registrado es text-classification.

El modelo se entrena mediante el Trainer de Transformers a partir de un dataset que la propia model card describe como "unknown dataset", aunque el nombre del repositorio apunta al corpus IMDB de resenas de cine. El autor declara en la model card unas metricas de evaluacion de 0,878 de accuracy y 0,8770 de F1, con una perdida de validacion de 0,3600. Los hiperparametros registrados son learning rate 2e-5, batch de 16, 3 epocas y 375 pasos totales.

Su relevancia practica es la de un clasificador de sentimiento ligero y barato de desplegar: con menos de 70 millones de parametros y pesos de unos 268 MB en FP32, es ejecutable en CPU y en cualquier GPU de consumo, lo que lo hace util como linea base para prototipos, filtrado de resenas y tareas de etiquetado a gran escala donde el coste por inferencia importa mas que la precision maxima. No obstante, la documentacion es practicamente inexistente, el repositorio no tiene descargas ni likes, y el model-index esta vacio, por lo que su validacion externa es nula en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 12 cabezas de atencion, dimension oculta 768) con cabeza de clasificacion para text-classification |
| Parametros totales | 66.955.010 (segun los pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite fijo de DistilBERT; no disponible en la model card, se deduce de la arquitectura base) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | ingles (modelo base distilbert-base-uncased); la model card no declara lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 0,8 GB |
| Modelo base | distilbert/distilbert-base-uncased |
| Pipeline | text-classification |
| Fecha de creacion | 2026-09-15 (segun metadatos de Hugging Face) |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, una destilacion del encoder de BERT-base que reduce el numero de capas de 12 a 6 y elimina los embeddings de tipo de token (token-type embeddings), manteniendo la dimension oculta de 768 y 12 cabezas de atencion. La destilacion se realiza durante el preentrenamiento, de modo que el modelo conserva aproximadamente el 97 % del rendimiento de BERT-base con un 40 % menos de parametros y una velocidad de inferencia un 60 % superior, segun lo publicado por sus autores. Sobre esta base, el autor ha anadido una cabeza de clasificacion para producir logits de sentimiento binario.

No hay informacion publicada sobre la composicion del dataset de ajuste fino mas alla de la etiqueta "unknown dataset" de la model card generada automaticamente, aunque el nombre del modelo apunta al corpus IMDB de resenas de cine. A partir de los hiperparametros declarados (375 pasos totales, batch de 16 y 3 epocas) se puede inferir que el conjunto de entrenamiento tenia aproximadamente 125 pasos por epoca, es decir, unos 2.000 ejemplos por epoca y unos 6.000 ejemplos en total: una fraccion pequena de los 25.000 ejemplos de entrenamiento del corpus IMDB completo. Esta cifra es una estimacion derivada de los hiperparametros, no un dato confirmado por el autor.

El procedimiento de entrenamiento declarado usa optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, en su variante fused de PyTorch, learning rate 2e-5, scheduler lineal, semilla 42 y evaluacion con batch de 16. No se documenta ningun proceso de RLHF, DPO, calibracion ni ajuste posterior. El historial de perdidas muestra sobreajuste a partir de la segunda epoca: la perdida de entrenamiento cae de 0,3037 a 0,1384, mientras la de validacion sube de 0,3393 a 0,3600 entre las epocas 1 y 3, con la accuracy estabilizada en 0,878.

## Capacidades

- Clasificacion binaria de sentimiento (positivo / negativo) sobre texto en ingles, con salida de logits y probabilidades por clase.
- Procesamiento de documentos de hasta 512 tokens en una sola pasada; los textos mas largos requieren truncado o segmentacion previa.
- Inferencia por lotes (batching) para etiquetado masivo de resenas, comentarios o tickets.
- Extraccion de representaciones contextuales del encoder (pooler output / hidden states), reutilizables como features para otras tareas.
- No dispone de generacion de texto: es un modelo exclusivamente encoder, sin cabeza de lenguaje causal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base es uncased en ingles y no se documenta entrenamiento en otros idiomas.
- Capacidades de vision, audio o modo thinking: no disponibles.
- Ajuste adicional mediante fine-tuning sobre la cabeza de clasificacion, ya que el modelo se distribuye con ella.

## Casos de uso

- Analisis de sentimiento de resenas de producto: el modelo clasifica cada resena como positiva o negativa en una unica pasada de hasta 512 tokens, lo que permite procesar catalogos completos por lotes con un coste de computo minimo.
- Moderacion y triaje de comentarios: integrado en un pipeline previo a la moderacion humana, sirve para priorizar los comentarios con sentimiento negativo extremo y reducir el volumen de revision manual.
- Linea base en experimentos de NLP: al ser un ajuste fino sobre IMDB, funciona como referencia rapida para comparar contra arquitecturas mayores (BERT-base, RoBERTa, DeBERTa) antes de justificar un mayor coste de inferencia.
- Etiquetado de datos a gran escala: permite preanotar corpus de resenas o encuestas para su posterior revision humana, aprovechando que el modelo cabe en CPU y puede ejecutarse en paralelo sobre muchos nucleos.
- Analisis de encuestas de satisfaccion con respuestas abiertas: clasificacion del comentario libre en positivo o negativo para construir metricas agregadas tipo NPS o CSAT a partir de texto no estructurado.
- Monitorizacion de reputacion de marca: ejecucion programada sobre menciones y resenas en ingles para generar series temporales de sentimiento con un modelo de 67 millones de parametros desplegable en una instancia pequena.
- Filtrado previo en sistemas de recomendacion: descartar o priorizar resenas segun polaridad antes de pasarlas a un sistema de ranking mas costoso.
- Procesamiento en el borde (edge) o entornos sin GPU: al ocupar unos 268 MB en FP32, puede ejecutarse en dispositivos con recursos limitados donde no es viable desplegar un modelo de varios miles de millones de parametros.

## Benchmarks y rendimiento

El model-index del repositorio esta declarado pero su lista de resultados esta vacia, por lo que no hay entradas estructuradas de benchmarks. La model card incluye las siguientes metricas en el conjunto de evaluacion, declaradas por el autor:

| Metrica | Valor (conjunto de evaluacion) |
|---|---|
| Loss | 0,3600 |
| Accuracy | 0,878 |
| F1 | 0,8770 |

Evolucion durante el entrenamiento, segun la model card del autor:

| Training loss | Epoca | Paso | Validation loss | Accuracy | F1 |
|---|---|---|---|---|---|
| 0,3037 | 1.0 | 125 | 0,3393 | 0,853 | 0,8571 |
| 0,2632 | 2.0 | 250 | 0,3433 | 0,866 | 0,8686 |
| 0,1384 | 3.0 | 375 | 0,3600 | 0,878 | 0,8770 |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales en la informacion disponible. El autor no especifica sobre que conjunto se calcularon las metricas de evaluacion, ni si corresponden al split de test oficial de IMDB, por lo que la cifra de 0,878 de accuracy debe tratarse como un dato no verificado externamente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB para los pesos en FP32, unos 134 MB en FP16/BF16 y unos 67 MB en INT8. Con activaciones y batching, un presupuesto practico de 1 a 2 GB de VRAM cubre lotes moderados a 512 tokens.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100, H100 ni similares. Una NVIDIA T4, L4, RTX 3060, RTX 4090 o incluso una GPU integrada es suficiente. Tambien puede ejecutarse en CPU con latencias aceptables para lotes pequenos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo de los ultimos diez anos, y puede residir por completo en memoria unificada o incluso en RAM de sistema.
- Opciones de despliegue: pipeline de transformers, ONNX Runtime, text-embeddings-inference (etiqueta presente en el repositorio), endpoints compatibles con la Inference API de Hugging Face (etiqueta endpoints_compatible), TorchServe o FastAPI con PyTorch. vLLM soporta modelos de clasificacion basados en pooling, aunque no es su caso de uso principal y el rendimiento no esta optimizado para encoders de este tamano.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en IMDB |
|---|---|---|---|---|---|
| distilbert-imdb-sentiment (este modelo) | 66.955.010 | 512 tokens | Apache 2.0 | Hugging Face, 0 descargas | Accuracy 0,878 declarada por el autor |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Entrenado en SST-2, no en IMDB; metrica no comparable directamente |
| textattack/bert-base-uncased-imdb | ~110 M | 512 tokens | Apache 2.0 | Hugging Face | Ajuste fino clasico sobre IMDB; consultese su model card para la cifra publicada |
| RoBERTa-base ajustado sobre IMDB | ~125 M | 512 tokens | MIT (modelo base) | Hugging Face | Los ajustes sobre RoBERTa-base suelen superar el 93 % de accuracy en la literatura publicada |

La comparacion de rendimiento entre estas alternativas no puede cerrarse con los datos de esta ficha: el model-index de este modelo esta vacio y no se ha verificado de forma independiente su accuracy. Como referencia estructural, este modelo es el mas ligero del grupo (67 M de parametros frente a 110 M de BERT-base y 125 M de RoBERTa-base) manteniendo la misma ventana de 512 tokens y una licencia permisiva equivalente. Para produccion con requisitos de precision alta, las alternativas de mayor tamano son habitualmente la opcion preferida; para latencia y coste, este modelo parte con ventaja.

## Limitaciones y advertencias

- Sobreajuste documentado: la perdida de validacion aumenta de 0,3393 en la epoca 1 a 0,3600 en la epoca 3 mientras la de entrenamiento cae a 0,1384, lo que indica que el modelo memoriza el conjunto de entrenamiento. La epoca 1 o 2 probablemente ofrece un mejor equilibrio, pero no se publican los pesos intermedios.
- Dataset de entrenamiento no documentado: la model card indica "unknown dataset". El nombre sugiere IMDB, pero no se confirma la composicion, el preprocesado ni el split utilizado.
- Volumen de entrenamiento reducido: los 375 pasos con batch 16 implican del orden de 6.000 ejemplos vistos en total, muy por debajo de los 25.000 del conjunto de entrenamiento completo de IMDB. Esto limita la generalizacion fuera del dominio de resenas de cine.
- Dominio restringido: un clasificador entrenado sobre resenas de cine en ingles puede degradarse notablemente en otros dominios (tecnico, legal, redes sociales, resenas de producto) y en registros informales o con jerga.
- Idioma: el tokenizador es uncased y esta entrenado para ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Clasificacion estrictamente binaria: no existe clase neutra. Los textos mixtos o neutros se forzaran a una de las dos polaridades.
- Limite de 512 tokens: los textos mas largos deben truncarse o dividirse, lo que puede perder informacion relevante y sesgar el resultado hacia el fragmento conservado.
- Riesgo de sesgo: el corpus IMDB contiene opiniones subjetivas y posibles sesgos demograficos o de dominio; no se ha realizado ninguna evaluacion de sesgo o equidad.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la clasificacion erronea con alta confianza.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se indique que el modelo base proviene de distilbert-base-uncased. Conviene revisar tambien las condiciones del corpus de entrenamiento original si finalmente se confirma que es IMDB.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin resultados en el model-index y con la model card autogenerada sin revisar (la propia plantilla pide revisarla y completarla). No es adecuado como dependencia critica en produccion sin una evaluacion propia.
- Versiones de framework inusuales: la model card declara Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2, versiones que no se corresponden con las publicadas en el momento de redactar esta ficha. Conviene verificar la compatibilidad real al cargar los pesos.
- Metadatos temporales anomalos: la fecha de creacion declarada es 2026-09-15, posterior a la fecha de redaccion de esta ficha en el contexto habitual de publicacion; se reproduce tal cual figura en Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youssefhl/distilbert-imdb-sentiment
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper del corpus IMDB (Maas et al., 2011): https://arxiv.org/abs/1103.03916
- Dataset IMDB en Hugging Face: https://huggingface.co/datasets/stanfordnlp/imdb
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces recuperados correspondian a servicios de correo ajenos al contenido.

# tareenmj/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

`learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto binario obtenido mediante fine-tuning de DistilBERT base uncased, publicado por el usuario tareenmj en Hugging Face. El modelo resuelve una tarea concreta de clasificacion: determinar si un texto esta relacionado con comida o no (etiqueta "food" frente a "not food"), presumiblemente en el contexto de un ejercicio de aprendizaje del ecosistema Hugging Face. Con 66.955.010 parametros y un repositorio de 0,3 GB, es un modelo pequeno y ligero, pensado para inferencia rapida y despliegue sencillo.

La arquitectura subyacente es DistilBERT, una version destilada de BERT que conserva aproximadamente el 97 % del rendimiento del original con un 40 % menos de parametros y una velocidad de inferencia un 60 % superior. El fine-tuning se realizo con la libreria Transformers (version 5.22.1) y el Trainer de Hugging Face, con 10 epocas, learning rate de 1e-4 y batch size de 32. El modelo se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada fuera del ambito educativo o de prototipado: no hay informacion publica sobre el dataset de entrenamiento, los idiomas soportados ni casos de uso previstos. La accuracy de 1.0 reportada en el conjunto de evaluacion debe interpretarse con cautela, ya que no se especifica el tamano ni la composicion de dicho conjunto, y el numero de pasos de entrenamiento (70) sugiere un dataset muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo estandar de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion dinamica via PyTorch) |
| Idiomas soportados | no disponible (modelo base entrenado principalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas con 66 millones de parametros, destilado de BERT-base mediante knowledge distillation. Sobre esta base se anadio una cabeza de clasificacion para una tarea binaria. El fine-tuning se ejecuto con el Trainer de Transformers durante 10 epocas, con AdamW fused (betas 0,9 y 0,999, epsilon 1e-8), learning rate lineal de 1e-4, batch size de 32 en entrenamiento y evaluacion, y semilla 42. El numero total de pasos registrados es 70 (7 pasos por epoca), lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos, un volumen extremadamente reducido.

No se dispone de informacion sobre la composicion del dataset, el numero de tokens de entrenamiento, si hubo aumentacion de datos ni si se aplicaron tecnicas de regularizacion adicionales. Tampoco se documenta el proceso de seleccion de la cabeza de clasificacion ni el vocabulario de etiquetas mas alla de la denominacion implicita "food / not food". La version de framework utilizada (Transformers 5.22.1, PyTorch 2.14.1+cu130) es notablemente reciente respecto a la fecha de creacion del repositorio.

## Capacidades

- Clasificacion de texto binaria: asigna una etiqueta de "comida" o "no comida" a una secuencia de texto de entrada.
- Inferencia rapida: al ser un modelo de 66 millones de parametros, procesa lotes grandes con baja latencia en CPU y GPU.
- Integracion con el pipeline `text-classification` de Transformers.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints de Hugging Face, segun los tags del repositorio.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; el modelo base uncased esta entrenado predominantemente en ingles.

## Casos de uso

- Filtrado de resenas en plataformas gastronomicas: clasificar resenas de restaurantes o productos alimentarios para separar las que tratan sobre comida de las que no, permitiendo enrutar las primeras a un modulo de analisis de sentimiento especifico.
- Moderacion de contenido en foros de cocina: detectar mensajes fuera de tematica en comunidades culinarias y redirigirlos al subforo adecuado.
- Etiquetado automatico de datasets: pre-anotar grandes volumenes de texto con la etiqueta food/not food para acelerar la construccion de corpus supervisados, con revision humana posterior.
- Enrutamiento en asistentes conversacionales: decidir si una consulta de usuario debe dirigirse a un modulo de recetas y nutricion o a un flujo generico, reduciendo el coste de invocar modelos mayores.
- Clasificacion de titulares en agregadores de noticias: separar noticias de gastronomia del resto de secciones en un pipeline de ingestion editorial.
- Prototipado educativo: servir como ejemplo practico de fine-tuning de DistilBERT con el Trainer de Hugging Face en cursos y talleres de NLP.
- Preprocesado en pipelines de vision por computador: como etapa previa de filtrado de textos asociados a imagenes de alimentos antes de un clasificador multimodal.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluacion, segun la model card. No se han publicado resultados en el model-index (lista de resultados vacia) ni comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,0005 |
| Accuracy (evaluacion) | 1,0 |

Evolucion durante el entrenamiento (seleccion de epocas):

| Epoca | Validation loss | Accuracy |
|---|---|---|
| 1 | 0,0718 | 1,00 |
| 2 | 0,0186 | 1,00 |
| 3 | 0,0371 | 0,98 |
| 4 | 0,0029 | 1,00 |
| 5 | 0,0009 | 1,00 |
| 6 | 0,0007 | 1,00 |
| 7 | 0,0006 | 1,00 |
| 8 | 0,0005 | 1,00 |
| 9 | 0,0005 | 1,00 |
| 10 | 0,0005 | 1,00 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (267 MB de pesos), aproximadamente 130 MB en fp16 y menos de 70 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona sobradamente en T4, L4, RTX 3060, RTX 4090, A100 y H100.
- Cabe en cualquier GPU consumer, incluidas integradas modernas, y en CPU con latencias de milisegundos por lote pequeno.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (TEI), endpoints de Hugging Face, ONNX Runtime, TorchScript y cuantizacion dinamica de PyTorch. No se distribuyen pesos GGUF, por lo que llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no se han publicado mediciones. Por el tamano del modelo, se espera un throughput de miles de secuencias por segundo en GPU moderna con batch grande, y de cientos por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (DistilBERT fine-tuned) | 66,9 M | 512 | Clasificacion binaria food/not food | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 | Analisis de sentimiento binario | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 512 | Clasificacion general (requiere fine-tuning) | MIT | Hugging Face |
| bert-base-uncased | 110 M | 512 | Clasificacion general (requiere fine-tuning) | Apache 2.0 | Hugging Face |

La comparacion se limita a arquitecturas y tamanos, ya que no existen benchmarks publicos de este modelo frente a alternativas. DistilBERT ofrece un equilibrio velocidad/precision favorable frente a BERT-base, y RoBERTa-base mejora ligeramente el rendimiento a costa de duplicar parametros y latencia.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado: se desconoce su dominio, idioma, tamano y posibles sesgos.
- La accuracy de 1.0 es sospechosamente alta y probablemente refleja un conjunto de evaluacion muy pequeno o poco representativo; no debe tomarse como indicador de generalizacion.
- Solo se registran 70 pasos de entrenamiento, lo que sugiere un dataset de entrenamiento de aproximadamente 224 ejemplos; el riesgo de sobreajuste es elevado.
- El modelo base uncased esta entrenado principalmente en ingles; el rendimiento en castellano u otros idiomas no esta validado.
- No se documentan las etiquetas exactas del clasificador ni el formato esperado de entrada, lo que dificulta su uso directo sin inspeccionar la configuracion.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si de clasificaciones erroneas fuera de la distribucion de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el dataset impide verificar la procedencia de los datos de entrenamiento.
- No apto para produccion sin una evaluacion propia sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tareenmj/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion del Trainer de Hugging Face: https://huggingface.co/docs/transformers/main_classes/trainer

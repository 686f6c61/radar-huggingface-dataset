# Tijani12/imdb-model

## Resumen

Tijani12/imdb-model es un clasificador de texto binario obtenido mediante ajuste fino (fine-tuning) de DistilBERT-base-uncased sobre el conjunto de datos Stanford NLP IMDB, el corpus de referencia para análisis de sentimiento en resenas de cine en ingles. Lo desarrolla el usuario Tijani12 y se publica bajo licencia MIT, con un unico commit fechado en noviembre de 2026. El modelo resuelve una tarea acotada: asignar a un texto en ingles una etiqueta de sentimiento (positivo o negativo) dentro del pipeline `text-classification` de Transformers.

La relevancia practica es la de un modelo de referencia ligero y de bajo coste para clasificacion de sentimiento en ingles, no la de un modelo generativo de proposito general. Con 66.955.010 parametros y un repositorio de 0,3 GB, esta pensado para inferencia en CPU o en GPU de consumo, y es compatible con Text Embeddings Inference y con endpoints de Hugging Face. La model card del autor es minima (una sola frase: "This is just a simple imdb classifier I trained"), por lo que la mayor parte de los detalles de entrenamiento no estan documentados.

No debe confundirse con otros repositorios del mismo autor, como Tijani12/Qwen3.8-27B-Q4_K_M-GGUF, que no guardan relacion con este clasificador. Toda la informacion tecnica disponible procede de los metadatos del repositorio, de la model card y de la ficha del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite posicional de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | distilbert/distilbert-base-uncased |
| Dataset de ajuste | stanfordnlp/imdb |
| Libreria | transformers |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-classification |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un transformer encoder de 6 capas con 12 cabezas de atencion, dimension oculta de 768 y 66 millones de parametros, obtenido originalmente por destilacion de BERT-base (12 capas, 110 millones de parametros). Sobre esa base se anade una cabeza de clasificacion para la tarea de sentimiento. El vocabulario es el de BERT uncased (WordPiece, 30.522 tokens) y la posicion maxima es de 512 tokens, lo que implica que las resenas mas largas se truncan o segmentan.

El ajuste fino se realizo sobre stanfordnlp/imdb, con 25.000 resenas de entrenamiento y 25.000 de test, etiquetadas como positivas o negativas. La model card no especifica hiperparametros (tasa de aprendizaje, numero de epocas, tamano de lote, semilla), ni si hubo busqueda de hiperparametros, ni el regimen de congelacion de capas. Tampoco se documenta ningun proceso de RLHF, DPO ni aumentacion de datos. No se han publicado innovaciones tecnicas adicionales: es un fine-tuning estandar de clasificacion.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en textos en ingles.
- Analisis de sentimiento a nivel de documento, adecuado para resenas y opiniones de extension media.
- Inferencia rapida en CPU y GPU de consumo gracias a su tamano reducido (66,9 M de parametros).
- Integracion directa con el pipeline `text-classification` de Transformers y con Text Embeddings Inference.
- Compatible con los endpoints de Hugging Face (`endpoints_compatible`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de tool calling, function calling ni capacidades de agente.
- Multilingue: no; solo ingles.

## Casos de uso

- Moderacion de resenas de producto: clasificar automaticamente resenas de tiendas o plataformas como positivas o negativas para priorizar la revision humana de las negativas. El modelo es adecuado por su bajo coste por inferencia y su entrenamiento especifico en resenas.
- Monitorizacion de reputacion de marca: procesar menciones y opiniones en ingles recopiladas de foros o redes y agregar el sentimiento por periodos, desplegando el modelo en CPU con Transformers o TEI.
- Enrutamiento de tickets de soporte: etiquetar el tono de los mensajes entrantes en ingles para dirigir los casos negativos a colas prioritarias, dado que la inferencia cabe en una sola GPU de consumo o incluso en CPU.
- Analisis de resenas de cine y series: caso de uso original del dataset IMDB; util para estudios de recepcion o para construir datasets etiquetados de forma automatica.
- Filtrado previo en pipelines de datos: separar textos positivos y negativos antes de un etiquetado mas costoso con modelos mayores, usando este clasificador como primera etapa de bajo coste.
- Prototipado y docencia: modelo de referencia para demostrar fine-tuning de clasificacion con Transformers, por su tamano manejable (0,3 GB) y su licencia permisiva MIT.
- Clasificacion por lotes en entornos sin GPU: al ser un modelo de 66,9 M de parametros, permite procesar grandes volumenes en CPU con latencia aceptable, sin depender de infraestructura acelerada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones con otros modelos, y los metadatos del repositorio no aportan cifras de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB de pesos (66,9 M de parametros), mas activaciones; en la practica cabe en cualquier GPU con 1-2 GB libres.
- En FP16: aproximadamente 0,13 GB de pesos.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, T4, A10, A100 y H100; el modelo no aprovecha la capacidad de las GPU de gama alta por su tamano.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en iGPU con suficiente memoria compartida.
- CPU: viable para inferencia y clasificacion por lotes; es el escenario mas razonable dado el tamano.
- Opciones de despliegue: Transformers (pipeline `text-classification`), Text Embeddings Inference (TEI), endpoints de Hugging Face; no se documentan pesos GGUF ni ONNX, por lo que llama.cpp y Ollama no estan soportados de forma nativa sin conversion.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Tijani12/imdb-model | 66,9 M | 512 tokens | en | MIT | Fine-tuning de DistilBERT sobre IMDB; sin metricas publicadas |
| distilbert-base-uncased-finetuned-sst-2-english | 67 M | 512 tokens | en | Apache 2.0 | Clasificador de sentimiento de referencia de Hugging Face, ampliamente usado |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | en | MIT | Basado en RoBERTa, entrenado en datos de redes sociales; tres clases |
| finiteautomata/bertweet-base-sentiment-analysis | 135 M | 128 tokens | en | MIT | Basado en BERTweet, orientado a texto informal |

La comparacion se limita a modelos de la misma categoria (clasificacion de sentimiento en ingles de tamano pequeno); no se dispone de metricas de este modelo para comparar rendimiento numerico con las alternativas.

## Limitaciones y advertencias

- La model card es practicamente inexistente: no documenta datos de entrenamiento mas alla del dataset, hiperparametros ni evaluacion, lo que dificulta reproducir o auditar el modelo.
- No hay metricas publicadas; se desconoce su exactitud real y si supera o no a la clase mayoritaria en el conjunto de test de IMDB.
- Entrenado exclusivamente en resenas de cine en ingles: el dominio y el idioma estan muy acotados, y el rendimiento en otros generos textuales (redes sociales, texto tecnico, resenas cortas) es incierto.
- Solo admite ingles; el uso con textos en castellano u otros idiomas no es fiable.
- Limite de 512 tokens: las resenas largas se truncan, lo que puede perder informacion relevante del final del texto.
- Riesgo de sesgo heredado de DistilBERT y del corpus IMDB, que no representa de forma equilibrada todos los registros linguisticos.
- Riesgo de alucinacion no aplica en sentido estricto (no genera texto), pero la clasificacion puede ser erronea en textos ambiguos, sarcasticos o mixtos.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright.
- El repositorio tiene 0 descargas y 0 likes, y un unico commit; no hay evidencia de mantenimiento ni de validacion por la comunidad.
- No se ofrecen pesos cuantizados ni formatos alternativos, lo que limita el despliegue fuera del ecosistema Transformers sin trabajo adicional de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tijani12/imdb-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de ajuste: https://huggingface.co/datasets/stanfordnlp/imdb
- Otro repositorio del autor (no relacionado): https://huggingface.co/Tijani12/Qwen3.8-27B-Q4_K_M-GGUF/tree/main

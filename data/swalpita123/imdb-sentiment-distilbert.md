# Swalpita123/imdb-sentiment-distilbert

## Resumen

imdb-sentiment-distilbert es un modelo de clasificacion de sentimiento desarrollado por el usuario Swalpita123 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) de DistilBERT, la version destilada de BERT desarrollada originalmente por Hugging Face, entrenado sobre el dataset IMDB, un conjunto de resenas de peliculas etiquetadas como positivas o negativas. El modelo resuelve la tarea clasica de analisis de sentimiento binario sobre texto en ingles.

Su relevancia radica en el reducido tamano del modelo: con aproximadamente 67 millones de parametros y un repositorio de tan solo 0,3 GB, es lo suficientemente ligero para ejecutarse en CPU o en GPUs de consumo, lo que lo hace adecuado para despliegues sencillos de analisis de sentimiento sin infraestructura costosa. La model card del autor es practicamente vacia, por lo que gran parte de los detalles de entrenamiento y evaluacion no estan disponibles publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT base suele ser 512 tokens, pero no consta en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset IMDB esta en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder de tipo discriminativo, no generativo. DistilBERT se obtiene mediante destilacion de conocimiento a partir de BERT-base, reduciendo a la mitad el numero de capas y parametros manteniendo alrededor del 97 por ciento de su rendimiento en tareas de comprension del lenguaje. Sobre el encoder se anade tipicamente una cabeza de clasificacion lineal para la salida binaria.

Los datos de entrenamiento concretos no estan disponibles en la model card, aunque el nombre del repositorio indica que se ha utilizado el dataset IMDB, compuesto por 50.000 resenas de peliculas etiquetadas como positivas o negativas (25.000 de entrenamiento y 25.000 de prueba). No hay informacion sobre hiperparametros, numero de epocas, metricas de evaluacion ni uso de tecnicas como RLHF o DPO (estas ultimas no aplican a modelos encoder de clasificacion).

## Capacidades

- Clasificacion de sentimiento binario (positivo/negativo) sobre resenas de peliculas en ingles
- Clasificacion de texto general aplicable a otros tipos de resenas u opiniones cortas, con posible degradacion fuera del dominio de entrenamiento
- Integrable en pipelines de la libreria `transformers` de Hugging Face mediante la clase de clasificacion de texto
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling
- No es apto para agentes ni razonamiento multi-paso

## Casos de uso

- Analisis de sentimiento de resenas de cine: clasificacion automatica de resenas de peliculas en positivo o negativo, su caso de entrenamiento directo, con alta fiabilidad esperada dentro del dominio IMDB
- Monitorizacion de opiniones en redes sociales: filtrado previo de comentarios o menciones para detectar polaridad antes de un analisis mas profundo, ejecutandose en CPU sin coste de GPU
- Cuantificacion de satisfaccion de clientes: procesamiento por lotes de encuestas o resenas de productos para obtener metricas agregadas de sentimiento en dashboards
- Filtrado en pipelines de datos: etiquetado masivo y economico de corpus de texto como paso previo a anotaciones humanas o a modelos mas grandes
- Prototipado y ensenanza: base ligera para aprender fine-tuning, evaluacion y despliegue de modelos de clasificacion gracias a su tamano reducido y licencia MIT
- Integracion en aplicaciones backend: despliegue como microservicio de inferencia ligero (por ejemplo, con FastAPI) donde la latencia y el consumo de recursos deben ser minimos

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1 ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 67 millones de parametros en pesos de precision completa (unos 0,3 GB en el repositorio), funciona sin problemas en CPU; en GPU bastarian menos de 1 GB de VRAM
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (incluso integrada o una GTX 1650) es mas que suficiente. No se necesitan A100, H100 ni tarjetas de gama alta
- Cabe con holgura en cualquier GPU de consumo, incluidas portatiles; la inferencia en CPU es totalmente viable con latencias de milisegundos por peticion
- Opciones de despliegue: libreria `transformers` de Hugging Face (recomendado, al ser un modelo encoder con cabezas de clasificacion), API de Inference de Hugging Face, ONNX Runtime para optimizacion en produccion, o servidores como Text Embeddings Inference no aplican; no es compatible con llama.cpp, Ollama ni vLLM al no ser un modelo generativo
- Latencia y throughput estimados: no disponible; por el tamano del modelo se espera latencia de pocos milisegundos por texto en CPU moderna y throughput alto en procesamiento por lotes

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Comentario |
|---|---|---|---|---|
| Swalpita123/imdb-sentiment-distilbert | 66,9 M | Sentimiento binario (IMDB) | MIT | Fine-tuning comunitario, sin metricas publicadas |
| distilbert-base-uncased-finetuned-sst-2-english (Hugging Face) | 67 M | Sentimiento binario (SST-2) | Apache 2.0 | Modelo de referencia oficial, ampliamente validado |
| cardiffnlp/twitter-roberta-base-sentiment | 125 M | Sentimiento (3 clases, tweets) | MIT | Mayor cobertura de dominios y clases |
| lxyuan/distilbert-base-multilingual-cased-sentiments-student | 66 M | Sentimiento multilingue | Apache 2.0 | Soporta multiples idiomas, a diferencia del modelo analizado |

## Limitaciones y advertencias

- El modelo es exclusivamente clasificador: no genera texto ni razona, por lo que no debe usarse como LLM
- Entrenado presumiblemente solo con resenas de peliculas en ingles: su rendimiento en otros idiomas o dominios (noticias, mensajes tecnicos, sarcasmo) no esta verificado y puede degradarse seriamente
- La model card esta practicamente vacia: no hay metricas de evaluacion, ni detalles de entrenamiento, ni declaracion de sesgos, lo que exige validacion propia antes de uso en produccion
- Riesgo de alucinacion: no aplicable al no ser generativo, pero si riesgo de clasificaciones erroneas ante sarcasmo, negaciones complejas o textos fuera de dominio
- Sesgos: hereda los sesgos del corpus IMDB (resenas de cine en ingles, mayoritariamente de usuarios de plataformas anglosajonas); no se ha documentado auditoria de sesgos
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones relevantes, solo con conservacion del aviso de copyright
- Popularidad muy baja (23 descargas y 1 like en el momento de la ficha), sin comunidad que haya validado el modelo; se recomienda comparar con alternativas consolidadas antes de adoptarlo

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Swalpita123/imdb-sentiment-distilbert
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo de referencia fine-tuned para sentimiento (SST-2): https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Dataset IMDB: https://huggingface.co/datasets/stanfordnlp/imdb

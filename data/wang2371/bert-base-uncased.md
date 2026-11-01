# wang2371/bert-base-uncased

## Resumen

BERT base uncased es un modelo de lenguaje basado en la arquitectura Transformer, presentado en el articulo "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding" (arXiv:1810.04805) y publicado originalmente por Google Research. Esta ficha corresponde a la réplica alojada por el usuario wang2371 en HuggingFace, que reproduce los pesos del modelo original `bert-base-uncased` (110.106.428 parametros) bajo licencia Apache 2.0. El modelo esta entrenado exclusivamente en ingles y no distingue entre mayusculas y minusculas.

El modelo se preentrena de forma auto-supervisada sobre un corpus de texto en ingles (BookCorpus y Wikipedia) mediante dos objetivos: masked language modeling (MLM), en el que se enmascara el 15% de los tokens y el modelo debe predecirlos, y next sentence prediction (NSP), en el que debe determinar si dos fragmentos de texto son consecutivos en el original. Esto le permite aprender representaciones bidireccionales del lenguaje, a diferencia de los modelos autoregresivos como GPT, que solo atienden al contexto previo.

Su relevancia actual no reside en la generacion de texto, sino en su uso como extractor de caracteristicas y base para fine-tuning en tareas de clasificacion de secuencias, etiquetado de tokens, question answering extractivo y similitud semantica. Sigue siendo un estandar de referencia en la literatura y un componente habitual en pipelines de NLP que requieren bajo coste computacional y latencia reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (BERT) |
| Parametros totales | 110.106.428 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors; no se documentan variantes GGUF/ONNX en la informacion proporcionada) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow, JAX, Rust, CoreML, ONNX |

## Arquitectura y entrenamiento

BERT base uncased es un transformer encoder con 12 capas, 12 cabezas de atencion, dimension oculta de 768 y 110 millones de parametros. A diferencia de los decoders autoregresivos, la atencion es bidireccional: cada token atiende a todos los demas de la secuencia, lo que permite construir representaciones contextuales completas de la frase. El tokenizador es WordPiece con un vocabulario de 30.522 tokens y normaliza el texto a minusculas, eliminando ademas las marcas de acento.

El preentrenamiento se realizo sobre BookCorpus (aproximadamente 800 millones de palabras) y Wikipedia en ingles (aproximadamente 2.500 millones de palabras), sumando alrededor de 3.300 millones de palabras en total, con un total de 3.300 millones de tokens procesados en la fase de preentrenamiento segun el paper original. Los objetivos de entrenamiento son MLM (enmascaramiento aleatorio del 15% de los tokens) y NSP. No se aplico RLHF ni DPO; el modelo es puramente un encoder preentrenado sin ajuste por preferencias. La innovacion tecnica principal del paper fue demostrar que el preentrenamiento bidireccional profundo supera a los enfoques unidireccionales previos en tareas de comprension del lenguaje.

## Capacidades

- Generacion de representaciones contextuales de texto en ingles para tareas downstream.
- Masked language modeling: prediccion de tokens enmascarados en una secuencia.
- Next sentence prediction: clasificacion de pares de frases como consecutivas o no.
- Clasificacion de secuencias (sentimiento, topicos, deteccion de spam) tras fine-tuning.
- Etiquetado de tokens (NER, POS tagging) tras fine-tuning.
- Question answering extractivo (SQuAD-style) tras fine-tuning.
- Extraccion de embeddings para similitud semantica y recuperacion de informacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo thinking.
- Capacidades multilingues: limitadas al ingles; existen variantes multilingues separadas.

## Casos de uso

- Clasificacion de sentimiento en resenas: se anade una capa densa sobre el token [CLS] y se fine-tunea con un dataset etiquetado; el modelo base de 110M parametros permite entrenamiento rapido en una sola GPU consumer.
- Reconocimiento de entidades nombradas (NER): se fine-tunea con etiquetado BIO sobre textos en ingles para extraer personas, organizaciones y localizaciones en pipelines de extraccion de informacion.
- Question answering extractivo: se fine-tunea sobre SQuAD para localizar la respuesta dentro de un parrafo, util en sistemas de busqueda documental con contexto de hasta 512 tokens.
- Deteccion de similitud semantica entre frases: se usan los embeddings de [CLS] o el promedio de los estados ocultos para alimentar un clasificador de pares (paraphrase detection, duplicate question detection).
- Moderacion de contenido: fine-tuning para clasificar comentarios toxicos o spam en ingles, con inferencia por debajo de 10 ms en GPU moderna para secuencias cortas.
- Feature extraction para pipelines de ML clasico: se generan embeddings de 768 dimensiones que alimentan clasificadores como SVM o regresion logistica en entornos con recursos limitados.
- Reranking en busqueda: se usa como cross-encoder para reordenar candidatos recuperados por un retriever, aprovechando su atencion bidireccional sobre pares query-documento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv:1810.04805) reporta resultados en GLUE, SQuAD v1.1 y SQuAD v2.0 para el modelo base, pero no se incluyen en la informacion proporcionada para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 440 MB para los pesos (110M parametros x 4 bytes), mas activaciones segun longitud de secuencia.
- VRAM estimada en FP16: aproximadamente 220 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: GTX 1060 6GB, RTX 3060, RTX 4090, e incluso en CPU para inferencia por lotes pequenos.
- GPU recomendadas para fine-tuning: RTX 3090/4090 para lotes grandes; A100/H100 para entrenamiento a gran escala o destilacion.
- Opciones de despliegue: HuggingFace Transformers (PyTorch/TensorFlow/JAX), ONNX Runtime, TorchScript, CoreML, Rust (via `rust-bert`), vLLM no aplica (no es modelo generativo), llama.cpp no aplica.
- Latencia estimada: del orden de 1-5 ms por secuencia corta en GPU moderna; throughput de miles de secuencias por segundo en A100 con batching.
- En CPU, latencia de decenas de milisegundos por secuencia; viable para servicios de baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bert-base-uncased (este repo) | 110M | 512 | en | apache-2.0 | HuggingFace |
| bert-base-cased | 110M | 512 | en | apache-2.0 | HuggingFace |
| bert-large-uncased | 340M | 512 | en | apache-2.0 | HuggingFace |
| roberta-base | 125M | 512 | en | mit | HuggingFace |
| distilbert-base-uncased | 66M | 512 | en | apache-2.0 | HuggingFace |

BERT base uncased ofrece un equilibrio entre calidad y coste computacional; RoBERTa base mejora el preentrenamiento (mas datos, sin NSP, dynamic masking) a costa de un tamano ligeramente superior, y DistilBERT reduce el tamano un 40% con una perdida de rendimiento de aproximadamente 3 puntos en GLUE segun su model card. La eleccion depende del presupuesto de latencia y de si se necesita la variante cased.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; no soporta castellano ni otros idiomas sin fine-tuning especifico o uso de variantes multilingues.
- No es un modelo generativo: no puede producir texto libre de forma autoregresiva; para generacion hay que usar modelos tipo GPT.
- Longitud de contexto fija de 512 tokens; secuencias mas largas deben truncarse o dividirse.
- Riesgo de sesgos de genero, raza y religion presentes en BookCorpus y Wikipedia; la model card original advierte de predicciones sesgadas en tareas de fill-mask.
- Riesgo de alucinacion en tareas extractivas cuando la respuesta no esta en el contexto; el modelo puede seleccionar un span incorrecto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia de los pesos en esta réplica (wang2371) frente al repositorio oficial `bert-base-uncased`.
- Este repositorio concreto tiene solo 18 descargas y 0 likes; no es el repositorio canonico y podria no estar sincronizado con actualizaciones del original.
- No dispone de tokenizer propio en el repo indicado; es necesario cargar el tokenizer desde el repositorio oficial o desde la libreria Transformers.
- Para produccion se recomienda validar la integridad de los pesos (hash) y preferir el repositorio oficial de HuggingFace o Google Research.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wang2371/bert-base-uncased
- Repositorio oficial: https://huggingface.co/bert-base-uncased
- Paper original: https://arxiv.org/abs/1810.04805
- Repositorio de codigo original: https://github.com/google-research/bert
- Readme de versiones: https://github.com/google-research/bert/blob/master/README.md

# zakerzel/upy-u2t02-simcse-supervised

## Resumen

zakerzel/upy-u2t02-simcse-supervised es un modelo de embeddings de frases (sentence embeddings) en ingles, desarrollado por el usuario zakerzel (Gael) como trabajo para la unidad U2T02 del curso Trends in Data Science (UPY). No es un modelo generativo, sino un encoder que transforma oraciones en vectores densos de 768 dimensiones para tareas de similitud semantica y recuperacion de informacion.

La arquitectura subyacente es bert-base-uncased (transformer encoder, ~109,5 millones de parametros) afinada con SimCSE en su variante supervisada, una tecnica de aprendizaje contrastivo que toma pares de implicacion (entailment) como positivos y pares de contradiccion como negativos duros. El modelo se entreno sobre un subconjunto de 100.000 registros de SNLI, del que se derivaron 33.351 ejemplos supervisados.

Es relevante como ejemplo didactico reproducible de fine-tuning con SimCSE y por su peso ligero (0,4 GB en el repositorio), lo que permite ejecutarlo en CPU y GPU de consumo. Su alcance esta acotado: solo ingles, dominio limitado al estilo de SNLI (frases tipo descripcion de imagen) y una longitud maxima de secuencia de 64 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT, bert-base-uncased) |
| Parametros totales | 109.482.240 (~109,5 M) |
| Longitud de contexto | 64 tokens de maxima secuencia de entrenamiento; el encoder BERT base admite hasta 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base (12 capas, 768 de dimension oculta, 12 cabezas de atencion) inicializado desde bert-base-uncased y afinado con SimCSE supervisado. La cabecera de similitud usa pooling `cls` sobre el token [CLS], con embeddings normalizados en L2 y similitud coseno en evaluacion. Se aplico una proyeccion MLP solo durante el entrenamiento, descartada en la exportacion y evaluacion.

La receta de entrenamiento reportada es: 33.351 ejemplos supervisados extraidos de `snli_train_100k.jsonl`, batch de 64, learning rate 5e-05, 3 epocas, temperatura 0.05, dropout 0.1, semilla 42 y `max_seq_length` de 64. De los 33.351 pares supervisados, 9.488 incluyen un negativo duro de contradiccion real. El checkpoint se selecciono unicamente por el Spearman en el split de desarrollo de STS-B, sin usar regresor en la evaluacion.

## Capacidades

- Generacion de embeddings de frases en ingles para similitud semantica y similitud coseno.
- Recuperacion de informacion (retrieval) semantico en ingles.
- Agrupamiento (clustering) de textos por proximidad de embeddings.
- Mineria de parafrasis y deteccion de duplicados cercanos.
- Clasificacion y regresion aguas abajo usando los embeddings como caracteristicas fijas (`feature-extraction`).
- Compatible con la libreria sentence-transformers y con Text Embeddings Inference (TEI) y endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Busqueda semantica en ingles: indexar un corpus de frases u oraciones cortas en una base vectorial y recuperar las mas similares a una consulta mediante similitud coseno. Adecuado por su encoder ligero (109,5 M) y su ventana de 64 tokens.
- Deduplicacion de textos cortos: calcular embeddings de titulares, comentarios o descripciones y agrupar los que superen un umbral de similitud coseno para eliminar redundancia.
- Agrupamiento tematico de comentarios o resenas: proyectar frases a vectores y aplicar k-means o HDBSCAN para descubrir temas recurrentes sin etiquetas.
- Clasificacion de texto con embeddings congelados: usar los vectores como entrada de un clasificador ligero (regresion logistica, SVM) en tareas de analisis de sentimiento o intencion, dado que el modelo expone `pipeline_tag: sentence-similarity`.
- Filtrado de pares contradictorios: aprovechar el entrenamiento con negativos de contradiccion para detectar pares de frases incompatibles en tareas de verificacion de consistencia.
- Prototipado docente y experimentos reproducibles: servir como referencia para estudiar SimCSE, con hiperparametros y semilla documentados, en un entorno de CPU o GPU de consumo.
- Reranking ligero: reordenar un conjunto reducido de candidatos recuperados por otro sistema usando la puntuacion de similitud coseno del modelo.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| STS-B dev | Spearman x100 | 82,29 |
| STS-B test | Spearman x100 | 78,32 |
| STS-B test (reload/export) | Spearman x100 | 78,32 |
| STS-B test | Alignment | 0,1377 |
| STS-B test | Uniformity | -2,2771 |

La evaluacion se realizo con embeddings normalizados en L2, similitud coseno y correlacion de Spearman frente a las puntuaciones humanas de STS-B, sin regresor. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en inferencia: en fp32 los pesos ocupan aproximadamente 0,44 GB; en fp16, unos 0,22 GB; en int8, unos 0,11 GB. Con activaciones y batches pequenos, el consumo total se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. No requiere A100 ni H100. Funciona bien en RTX 3060, RTX 4090, T4 e integradas modestas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de consumo.
- Tambien ejecutable en CPU para lotes pequenos gracias a su tamano reducido.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, exportacion a ONNX y frameworks de embeddings compatibles. No se distribuye en formato GGUF, por lo que llama.cpp u Ollama no son aplicables sin conversion previa.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS-B test (Spearman x100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| upy-u2t02-simcse-supervised | ~109,5 M | 64 | 78,32 | Apache-2.0 | HuggingFace |
| sup-simcse-bert-base-uncased (Princeton) | ~110 M | 512 | no disponible en la informacion | no disponible | HuggingFace / GitHub |
| all-MiniLM-L6-v2 | ~22,7 M | 256 | no disponible en la informacion | Apache-2.0 | HuggingFace |
| bert-base-uncased (sin fine-tuning) | ~110 M | 512 | no disponible en la informacion | Apache-2.0 | HuggingFace |

El modelo se situa en la misma categoria que los encoders de frases basados en BERT. Frente a alternativas mas pequenas como all-MiniLM-L6-v2 ofrece mas parametros, pero su ventana de 64 tokens es mas restrictiva. No hay datos de rendimiento comparativos publicados en la informacion disponible para el resto de modelos.

## Limitaciones y advertencias

- Entrenado sobre un subconjunto de 100.000 registros de SNLI, no sobre el dataset completo usado en el paper original de SimCSE.
- SNLI esta dominado por frases tipo descripcion de imagen (image-captions), por lo que la cobertura de dominio es limitada y puede degradarse en textos largos o especializados.
- Solo ingles: no fue evaluado para uso multilingue ni de dominio especializado.
- La longitud maxima de secuencia es de 64 tokens, muy inferior a los 512 del encoder base, por lo que oraciones largas se truncan.
- No es un modelo generativo: no produce texto ni admite tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de bert-base-uncased y de la distribucion de SNLI; pueden aparecer correlaciones espurias en dominios alejados de la captions.
- Resultado modesto en STS-B test (78,32 Spearman x100) y valores de alignment/uniformity (0,1377 / -2,2771) que indican un espacio de embeddings con cierta anisotropia.
- Licencia Apache-2.0, que permite uso comercial, pero con descargas muy bajas (13) y sin validacion externa, por lo que se recomienda reevaluar antes de llevarlo a produccion.
- El checkpoint se selecciono solo con el split de desarrollo de STS-B, lo que puede introducir sobreajuste a esa metrica de seleccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zakerzel/upy-u2t02-simcse-supervised
- Perfil del autor: https://huggingface.co/zakerzel
- Repositorio SimCSE (Princeton NLP): https://github.com/princeton-nlp/SimCSE
- Paper SimCSE (arXiv): https://arxiv.org/abs/2104.08821
- Paper SimCSE (ACL Anthology, EMNLP 2021): https://aclanthology.org/2021.emnlp-main.552/
- Encoder base bert-base-uncased: https://huggingface.co/google-bert/bert-base-uncased

# wraithklu/codesentinel-clone-detector

## Resumen

CodeSentinel Clone Detector es un modelo de embeddings de frases (sentence-transformers) especializado en la deteccion de codigo clonado, es decir, en determinar si dos fragmentos de codigo fuente son semanticamente equivalentes aunque difieran en su implementacion superficial. Lo desarrolla el usuario wraithklu y se construye mediante fine-tuning del modelo base `microsoft/codebert-base`, un transformer tipo RoBERTa preentrenado sobre codigo.

El modelo resuelve un problema clasico en ingenieria de software: la identificacion de duplicados logicos en bases de codigo grandes, util para refactorizacion, auditoria de licencias, deteccion de plagio academico y mantenimiento de calidad. Con 124.645.632 parametros y un pipeline de `sentence-similarity`, produce embeddings densos que permiten comparar fragmentos de codigo mediante similitud coseno.

Es relevante porque aplica el paradigma de sentence-transformers, habitualmente usado en texto natural, al dominio del codigo, ofreciendo una alternativa ligera (0,5 GB de repositorio) frente a modelos de lenguaje generativos de mayor tamano para tareas de recuperacion y comparacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: microsoft/codebert-base) con pooling para sentence-transformers |
| Parametros totales | 124.645.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre codigo fuente, principalmente Java segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/codebert-base`, un transformer encoder con arquitectura RoBERTa adaptado al dominio del codigo mediante preentrenamiento sobre repositorios de GitHub. Sobre esta base, el autor aplica fine-tuning con la libreria `sentence-transformers` usando la funcion de perdida `CosineSimilarityLoss`, lo que entrena al modelo para producir embeddings cuyo producto escalar normalizado refleje la similitud semantica entre fragmentos de codigo.

El entrenamiento se realizo con un dataset de 10.000 ejemplos (tag `dataset_size:10000`) y esta etiquetado como `generated_from_trainer`. Los ejemplos de la model card muestran pares de metodos Java, lo que sugiere que el corpus de entrenamiento esta compuesto mayoritariamente por codigo Java. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de embeddings densos para fragmentos de codigo fuente, orientados a similitud semantica.
- Deteccion de codigo clonado semantico (Type-4) y estructural, no solo coincidencia textual.
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de recuperacion y clasificacion.
- Comparacion por similitud coseno entre pares de fragmentos de codigo.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints de Hugging Face.
- Integrable en pipelines de `sentence-transformers` para busqueda semantica de codigo.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Deteccion de duplicados en bases de codigo: indexar todos los fragmentos de un repositorio con el modelo y calcular similitudes cosenas por pares para identificar metodos clonados que deberian refactorizarse en una funcion comun.
- Auditoria de licencias y plagio: comparar el codigo de un proyecto contra una base de referencia para detectar fragmentos copiados de otros repositorios con licencias incompatibles.
- Revision de codigo en CI/CD: integrar el modelo en un pipeline que compare cada pull request contra el resto del repositorio y marque posibles duplicados logicos antes del merge.
- Busqueda semantica de codigo interno: construir un indice vectorial de la base de codigo de la empresa para que los desarrolladores encuentren implementaciones existentes mediante descripcion o fragmento de ejemplo.
- Refactorizacion asistida: agrupar metodos similares por embeddings para proponer consolidaciones y reducir deuda tecnica.
- Deteccion de plagio academico en asignaturas de programacion: comparar las entregas de los alumnos entre si y contra soluciones de referencia para identificar copias con renombrado de variables o reestructuracion.
- Mantenimiento de forks: comparar un fork con su upstream para identificar divergencias logicas y facilitar la sincronizacion de parches.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el conjunto de validacion de BigCloneBench:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Semantic Similarity | bigclonebench validation | Pearson Cosine | 0,9050 |
| Semantic Similarity | bigclonebench validation | Spearman Cosine | 0,8343 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (124,6 M de parametros), mas overhead de activaciones y tokenizacion; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU moderna; para alto throughput, A100, H100 o L4; para desarrollo local, RTX 3060, RTX 4090 o incluso CPU.
- Cabe en GPU consumer sin problema, incluidas GTX 1650, RTX 3050 y superiores.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), Hugging Face Inference Endpoints, ONNX Runtime; no se documenta soporte explicito de vLLM, llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wraithklu/codesentinel-clone-detector | 124,6 M | no disponible | Embeddings de codigo para clone detection | no disponible | Hugging Face |
| microsoft/codebert-base | 124,6 M | 512 tokens | Encoder de codigo preentrenado (no sentence-transformers) | MIT | Hugging Face |
| jinaai/jina-embeddings-v2-base-code | 161 M | 8192 tokens | Embeddings de codigo de proposito general | Apache 2.0 | Hugging Face |
| Salesforce/codet5p-110m-embedding | 110 M | 512 tokens | Embeddings de codigo | BSD-3-Clause | Hugging Face |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de resultados de benchmarks comparativos directos en la informacion proporcionada. La principal ventaja de este modelo es su especializacion en clone detection, mientras que su limitacion es la falta de documentacion sobre licencia, contexto e idiomas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de usarlo en produccion.
- Idiomas y lenguajes de programacion no documentados: los ejemplos de la model card son Java, por lo que el rendimiento en otros lenguajes (Python, C++, JavaScript) es incierto.
- Longitud de contexto no documentada: al derivar de CodeBERT, es probable que herede un limite de 512 tokens, lo que impediria procesar funciones o clases largas sin truncamiento.
- Dataset de entrenamiento pequeno (10.000 ejemplos): riesgo de sobreajuste y de generalizacion limitada a dominios distintos del corpus original.
- Riesgo de falsos positivos y negativos en clone detection: la similitud cosena no distingue entre clones genuinos y coincidencias estructurales triviales (por ejemplo, getters/setters o metodos boilerplate).
- Sin verificacion independiente: los benchmarks de BigCloneBench estan declarados por el autor con `verified: false`.
- Sin descargas ni likes: el modelo no tiene traccion en la comunidad, lo que reduce la probabilidad de que se hayan detectado y corregido problemas.
- Riesgo de sesgo hacia el estilo de codigo del corpus de entrenamiento (posiblemente proyectos Java de GitHub), con peor rendimiento en codigo de otros ecosistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wraithklu/codesentinel-clone-detector
- Modelo base CodeBERT: https://huggingface.co/microsoft/codebert-base
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de CodeBERT: https://arxiv.org/abs/2002.08155
- Libreria sentence-transformers: https://www.sbert.net/
- Dataset BigCloneBench: https://github.com/clonebench/BigCloneBench
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

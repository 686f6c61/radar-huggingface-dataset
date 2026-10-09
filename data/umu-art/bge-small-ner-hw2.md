# umu-art/bge-small-ner-hw2

## Resumen

`umu-art/bge-small-ner-hw2` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante ajuste fino de `BAAI/bge-small-en-v1.5`, un codificador BERT de pequeno tamano orientado originalmente a la generacion de embeddings de texto. El resultado es un clasificador de tokens (pipeline `token-classification`) de 33.215.625 parametros, publicado por el usuario `umu-art` bajo licencia MIT.

El modelo resuelve la tarea de etiquetado secuencial a nivel de token, es decir, asignar una categoria (por ejemplo, persona, organizacion o localizacion) a cada token de una frase. Al partir de un encoder ya preentrenado sobre grandes volumenes de texto, el ajuste fino solo necesita 3 epocas sobre un dataset de etiquetado para alcanzar un F1 de 0.8983 y una exactitud global de 0.9799 en el conjunto de evaluacion declarado por el autor.

Su relevancia practica radica en su tamano reducido (33 millones de parametros) y su licencia permisiva, lo que permite desplegarlo en CPU o en GPUs de consumo con una huella de memoria minima. No obstante, la model card esta practicamente vacia: no se especifica el dataset de entrenamiento, el esquema de etiquetas ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), ajustado para token classification |
| Parametros totales | 33.215.625 (33,2 M, dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base BAAI/bge-small-en-v1.5 soporta hasta 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF en el repo) |
| Idiomas soportados | no disponibles en la model card (el modelo base es de tipo `en`, orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de `BAAI/bge-small-en-v1.5`: un transformer encoder de tipo BERT de tamano "small", con 12 capas y una dimension de ocultacion reducida, concebido por BAAI (Beijing Academy of Artificial Intelligence) para generar embeddings densos. Sobre esa base, este modelo anade una cabeza de clasificacion de tokens y se reentrena para la tarea de NER, dando lugar a los 33,2 millones de parametros totales.

El procedimiento de ajuste fino se realizo con las siguientes hiperparametros declarados: learning rate 2e-05, `train_batch_size` y `eval_batch_size` de 16, 3 epocas, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), scheduler lineal y semilla 42. El autor no documenta el dataset de entrenamiento ("unknown dataset"), su composicion, ni si hubo etapas de RLHF/DPO (no aplicables en una tarea de clasificacion). Las librerias utilizadas fueron Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1 y Tokenizers 0.21.4.

## Capacidades

- Etiquetado de entidades nombradas (NER) a nivel de token sobre texto: asignacion de una clase a cada token de la secuencia de entrada.
- Clasificacion de secuencias cortas propias de la tarea de token classification.
- Hereda la tokenizacion y el preentrenamiento en ingles del modelo base, por lo que su comportamiento es optimo sobre texto en ingles.
- No dispone de capacidades documentadas de generacion de texto, razonamiento, codigo o matematicas: es un modelo discriminativo, no generativo.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se documentan modos especiales (thinking mode, vision, audio, etc.).
- El catalogo de entidades reconocidas depende del dataset de entrenamiento, que no se especifica.

## Casos de uso

- Extraccion de entidades en documentos en ingles: el modelo clasifica tokens en categorias como nombres de persona, organizacion o lugar, lo que permite poblar bases de datos estructuradas a partir de texto no estructurado.
- Preprocesado de pipelines de NLP: situado antes de un sistema de busqueda o de un RAG, el modelo puede etiquetar entidades para enriquecer metadatos e indices.
- Anonimizacion y cumplimiento normativo: la deteccion de entidades permite localizar y enmascarar informacion personal identificable (PII) en textos antes de almacenarlos o compartirlos.
- Analisis de correos y tickets de soporte: extraer remitentes, empresas y ubicaciones mencionadas para clasificar y enrutar incidencias.
- Extraccion de informacion en dominios como noticias o finanzas: identificar empresas y personas citadas para construir grafos de conocimiento.
- Prototipado y ajuste de esquemas de etiquetado: al ser un modelo pequeno y de licencia MIT, sirve como punto de partida para experimentar con nuevos conjuntos de entidades antes de escalar a modelos mayores.
- Despliegue en entornos con recursos limitados: su tamano (33 M de parametros) permite ejecutarlo en CPU o en dispositivos de borde para tareas de etiquetado en tiempo real.

## Benchmarks y rendimiento

Los unicos resultados disponibles son los declarados por el autor sobre el conjunto de evaluacion (no se especifica cual). El `model-index` oficial no contiene resultados adicionales.

| Metrica | Valor (epoca 3, final) |
|---|---|
| Loss (evaluacion) | 0.0852 |
| Precision | 0.8827 |
| Recall | 0.9145 |
| F1 | 0.8983 |
| Accuracy | 0.9799 |

Evolucion por epoca durante el entrenamiento:

| Training Loss | Epoca | Paso | Validation Loss | Precision | Recall | F1 | Accuracy |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 0.0381 | 1.0 | 625 | 0.0901 | 0.8775 | 0.9125 | 0.8946 | 0.9789 |
| 0.0402 | 2.0 | 1250 | 0.0859 | 0.8804 | 0.9147 | 0.8972 | 0.9793 |
| 0.0515 | 3.0 | 1875 | 0.0852 | 0.8827 | 0.9145 | 0.8983 | 0.9799 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, CoNLL, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. En fp32 el modelo ocupa aproximadamente 130 MB de pesos; en fp16, unos 66 MB. Con overhead de activaciones, menos de 1 GB de memoria es suficiente.
- GPU recomendadas: cualquier GPU moderna sirve, incluida una NVIDIA GTX 1060 o superior; tambien es viables en GPU integradas y CPU.
- Cabe sin problemas en GPUs de consumo (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo de la libreria `transformers` con pesos en safetensors, puede servirse con la API `pipeline` de Hugging Face, con Hugging Face Inference Endpoints (el repo esta marcado como `endpoints_compatible`), con Text Generation Inference no aplica (es un modelo de clasificacion, no generativo) y con `torch`/`onnx` en entornos propios. No se publican variantes GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este modelo, ni de fichas tecnicas de alternativas equivalentes en la informacion proporcionada. Como referencia estructural cabe mencionar otros ajustes finos del mismo modelo base publicados en Hugging Face (`Fosfor1618/bge-small-ner-hw2`, `akmlva/bge-small-ner`), que comparten arquitectura y tamano pero cuyos resultados y datasets no se detallan aqui.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| umu-art/bge-small-ner-hw2 | 33,2 M | no disponible | MIT | Hugging Face |
| akmlva/bge-small-ner | no disponible | no disponible | no disponible | Hugging Face |
| Fosfor1618/bge-small-ner-hw2 | no disponible | no disponible | no disponible | Hugging Face |
| BAAI/bge-small-en-v1.5 (base) | 33 M aprox. | 512 tokens | MIT | Hugging Face |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ni el esquema de etiquetas, por lo que se desconoce que entidades reconoce realmente y con que calidad fuera del conjunto de evaluacion del autor.
- No se especifican los idiomas soportados; el modelo base es de tipo `en`, por lo que no hay garantia de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinacion no aplica en el sentido generativo (es un clasificador), pero si existe riesgo de falsos positivos y falsos negativos en la deteccion de entidades, con precision de 0.8827 y recall de 0.9145 declarados.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de entrenamiento.
- El modelo tiene 0 descargas y 0 "likes" en el momento del analisis, sin validacion externa de la comunidad.
- La fecha de creacion indicada (2026-10-08) resulta anomala y podria tratarse de un error en los metadatos del repositorio.
- No hay variantes cuantizadas ni formatos GGUF publicados, lo que limita las opciones de despliegue en algunos entornos.
- Al ser un modelo de clasificacion de tokens, no puede usarse para generacion de texto, resumen, traduccion ni tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umu-art/bge-small-ner-hw2
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Sitio de la serie BGE (BAAI): https://bge.baai.ac.cn/
- Ficha de BGE Small En en Inferbase: https://inferbase.ai/models/baai-bge-small-en
- Ajuste similar: https://huggingface.co/Fosfor1618/bge-small-ner-hw2
- Ajuste similar: https://huggingface.co/akmlva/bge-small-ner
- Variante GGUF del modelo base: https://local-ai-zone.github.io/models/bge-small-en-v1-5-q8-0.html

# tahamajs/bert-full-attention-sst2

## Resumen

`tahamajs/bert-full-attention-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atencion multi-cabeza estandar se han sustituido por el mecanismo `full_attention` de la libreria NeuralOps, desarrollada por Taha Majlesi. Forma parte de un "attention zoo" de modelos BERT preentrenados con distintos mecanismos de atencion subcuadratica, orientado a comparar empiricamente el impacto de cada mecanismo sobre el rendimiento en modelado de lenguaje enmascarado.

El modelo se ha destilado sobre WikiText-2 mediante un pipeline de destilacion de conocimiento en tres etapas (calibracion Ridge en forma cerrada, MSE/CKA de subespacio con backbone congelado y KD de logits fusionada con LR diferencial), ejecutado durante 300 segundos en una NVIDIA RTX 3090. Aunque el nombre del repositorio incluye el sufijo `sst2`, la model card solo documenta evaluacion sobre WikiText-2, no sobre SST-2.

Es relevante como pieza de investigacion reproducible: permite estudiar el comportamiento de un mecanismo de atencion alternativo sobre una arquitectura BERT conocida, con telemetria de entrenamiento detallada y una licencia permisiva (MIT). No obstante, su adopcion en produccion es limitada por su naturaleza experimental, su tamano (base, ~110 M de parametros) y la escasez de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `full_attention` de NeuralOps en las 12 capas |
| Parametros totales | no disponible (derivado de bert-base-uncased, ~110 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.5 GB, libreria `neuralops`, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion) y reemplaza el mecanismo de self-attention estandar por el modulo `full_attention` de NeuralOps en todas las capas. El modelo se entrena mediante destilacion de conocimiento desde el profesor original (`bert-base-uncased`) sobre WikiText-2, con un curriculum de tres etapas: Stage 0 aplica calibracion Ridge en forma cerrada; Stage 1 optimiza una perdida de subespacio (MSE/CKA) con el backbone congelado; Stage 2 realiza KD de logits fusionada con tasas de aprendizaje diferenciales.

La telemetria reportada indica 257 pasos completados, un throughput de 44.578,5 tokens/s, un pico de VRAM de 13.512 MB y una duracion total de 300 segundos en una RTX 3090. No se detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un modelo de fill-mask). La innovacion principal es el propio mecanismo `full_attention` y el pipeline de destilacion acelerado en GPU.

## Capacidades

- Modelado de lenguaje enmascarado (fill-mask): predice tokens `[MASK]` en texto en ingles.
- Extraccion de representaciones contextuales para tareas downstream (clasificacion, NER, similitud) mediante fine-tuning.
- Destilacion de conocimiento desde BERT-base: el modelo es un alumno destilado, no un generador de texto libre.
- Capacidad multilingue limitada al ingles (entrenado sobre bert-base-uncased y WikiText-2 en ingles).
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No soporta vision, audio ni generacion autoregresiva de texto.
- Integracion con la API de NeuralOps (`neuralops.load_pretrained_bert`) y con el pipeline `fill-mask` de Transformers.

## Casos de uso

- Evaluacion comparativa de mecanismos de atencion: usar el modelo como referencia en experimentos que comparen `full_attention` frente a otros mecanismos del attention zoo de NeuralOps sobre la misma tarea (MLM en WikiText-2).
- Investigacion en destilacion de conocimiento: reproducir o extender el pipeline de tres etapas (Ridge, MSE/CKA, KD de logits) sobre otras arquitecturas o datasets.
- Prototipado rapido de tareas de fill-mask en ingles: completar frases y validar hipotesis linguisticas con el pipeline `fill-mask` de Transformers.
- Fine-tuning para clasificacion de texto en ingles: reutilizar el encoder como inicializacion en tareas de sentiment analysis, topic classification o deteccion de spam, dado su origen BERT-base.
- Extraccion de embeddings para busqueda semantica o clustering: emplear las representaciones del encoder en pipelines de retrieval a pequena escala.
- Docencia y formacion: ilustrar el impacto de sustituir el mecanismo de atencion en un modelo conocido con telemetria de entrenamiento publicada (tiempo, VRAM, throughput).
- Base para experimentos de eficiencia: medir coste y calidad de `full_attention` frente a atencion estandar en hardware consumer (RTX 3090).

## Benchmarks y rendimiento

Resultados reportados en la model card sobre WikiText-2 con MLM Pseudo-Perplexity (15% de enmascaramiento, `seed=42`):

| Fase de evaluacion | MLM PPL | Precision en tokens enmascarados (%) | Delta vs baseline |
|---|---|---|---|
| BERT profesor (`bert-base-uncased`) | 6,84 | 68,42 | Referencia |
| Stage 0 (calibracion Ridge en forma cerrada) | 0,00 | 91,63 | -6,84 |
| Stage 2 (modelo destilado tras KD) | 0,00 | 91,86 | -6,84 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, SST-2) en la informacion disponible. El valor de PPL de 0,00 debe interpretarse con cautela: es un resultado atipico que sugiere una posible fuga de informacion en el protocolo de evaluacion o un artefacto de la metrica, y no se ha contrastado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo tipo BERT-base (~110 M de parametros) en FP32 se requieren aproximadamente 0,5 GB de pesos, y en FP16 alrededor de 0,25 GB, mas overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP32; el entrenamiento reportado se realizo en una NVIDIA RTX 3090 (24 GB) con un pico de 13.512 MB.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: la model card recomienda la API de NeuralOps (`neuralops.load_pretrained_bert`) o el pipeline `fill-mask` de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; dado que el modelo usa `custom_code`, es probable que requiera `trust_remote_code=True`.
- Latencia y throughput: en destilacion se reportan 44.578,5 tokens/s en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-full-attention-sst2` | ~110 M (no confirmado) | 512 (heredado, no confirmado) | Fill-mask (MLM) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` | 110 M | 512 | Fill-mask (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased` | 66 M | 512 | Fill-mask (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| `roberta-base` | 125 M | 512 | Fill-mask (MLM) | MIT | Hugging Face, ampliamente usado |

La comparacion de rendimiento con estas alternativas no esta disponible en la informacion proporcionada; solo se reporta la comparacion frente al profesor `bert-base-uncased` en WikiText-2.

## Limitaciones y advertencias

- Modelo experimental de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente.
- El resultado de PPL de 0,00 en Stage 0 y Stage 2 es sospechoso y sugiere un posible fallo metodologico o fuga de datos en la evaluacion; no debe tomarse como evidencia de calidad superior al profesor.
- El nombre del repositorio menciona `sst2`, pero la model card no documenta evaluacion en SST-2; existe una discrepancia entre nombre y contenido.
- Solo soporta ingles; no hay capacidades multilingues.
- No es un modelo generativo: no sirve para chat, generacion de texto libre, agentes ni tool calling.
- Requiere la libreria `neuralops` y posiblemente `trust_remote_code=True` por el uso de `custom_code`, lo que implica revisar el codigo antes de ejecutarlo en produccion.
- Riesgo de alucinacion en el sentido de predicciones de tokens `[MASK]` poco fiables fuera del dominio de WikiText-2.
- Licencia MIT: permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene conservar los avisos de atribucion correspondientes.
- No se documentan sesgos especificos; al heredar de bert-base-uncased, es probable que arrastre sesgos presentes en el corpus original (BooksCorpus y Wikipedia en ingles).
- La longitud de contexto no se especifica de forma explicita; se asume la de bert-base-uncased (512 tokens), pero no esta confirmada para el mecanismo `full_attention`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-full-attention-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext

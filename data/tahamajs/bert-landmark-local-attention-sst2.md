# tahamajs/bert-landmark-local-attention-sst2

## Resumen

`tahamajs/bert-landmark-local-attention-sst2` es un checkpoint de BERT-Base (110M parametros) en el que se han sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `landmark_local_attention` de la libreria NeuralOps. El modelo lo publica Taha Majlesi (tahamajs) como parte del proyecto "Subquadratic Attention Zoo", un catalogo de variantes de BERT con mecanismos de atencion subcuadraticos. El objetivo es demostrar que es posible mantener una precision razonable en tareas de clasificacion de texto reduciendo la complejidad operativa de la atencion de O(N²) a O(N) u O(N log N).

El checkpoint se ha destilado sobre la tarea SST-2 del benchmark GLUE (analisis de sentimiento binario) y alcanza un 82,45% de accuracy en el split de validacion, frente al 91,63% del profesor original `bert-base-uncased`. La destilacion se realizo con el protocolo "Cached Representation Distillation" de NeuralOps, que evita mantener el profesor en VRAM durante el entrenamiento mediante cacheado offline de representaciones.

Es relevante por su enfoque de serializacion modular: el repositorio solo contiene los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), no los 450 MB del BERT base congelado, que se reconstruyen en tiempo de carga. Esto lo convierte en un ejemplo practico de atencion subcuadratica aplicada a un modelo de referencia ampliamente conocido, aunque su alcance se limita a una unica tarea de clasificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atencion `landmark_local_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110M (BERT-Base); pesos publicados: solo atencion + cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) |
| Libreria | neuralops (con `trust_remote_code=True` en Transformers) |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | Clasificacion de texto (SST-2, binaria) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura BERT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion, 110M parametros) y reemplaza la atencion multi-cabeza estandar por `landmark_local_attention`, un mecanismo de atencion subcuadratica con complejidad efectiva O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan y publican los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue el protocolo Cached Representation Distillation de NeuralOps en dos etapas: primero una alineacion de subespacio oculto y despues una combinacion de KL sobre logits y entropia cruzada de tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) durante 53,3 segundos, con 94 pasos de optimizacion, un throughput efectivo de 14.435,6 tokens/s y un pico de VRAM de 14.749 MB. El cacheado offline de representaciones del profesor elimina la necesidad de mantener el profesor en memoria durante el entrenamiento.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (SST-2): etiquetas 0 (negativo) y 1 (positivo).
- Atencion subcuadratica: reduce el coste computacional de la atencion frente a la atencion cuadratica estandar, lo que puede resultar ventajoso en secuencias largas.
- Carga modular: reconstruye el BERT base congelado desde `bert-base-uncased` y aplica los pesos de atencion destilados en tiempo de carga.
- Integracion con la API `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- Integracion con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni modo thinking.

## Casos de uso

- Clasificacion de sentimiento en resenas o comentarios en ingles: el modelo devuelve una etiqueta binaria directamente desde `AutoModelForSequenceClassification`, adecuado para pipelines de moderacion o analisis de opinion a escala.
- Filtrado de feedback de usuarios en productos digitales: permite etiquetar rapidamente grandes volumenes de texto corto en ingles como positivo o negativo antes de un analisis mas profundo.
- Experimentacion academica con atencion subcuadratica: sirve como punto de partida reproducible para comparar `landmark_local_attention` con atencion cuadratica en una tarea GLUE estandar.
- Benchmarking de destilacion: el checkpoint y sus metricas (82,45% de accuracy, delta de +31,54% frente al estudiante pre-KD) permiten evaluar el protocolo Cached Representation Distillation de NeuralOps.
- Prototipado de bajo coste en memoria: al publicar solo ~55 MB de pesos de atencion, es util en entornos con almacenamiento limitado donde se quiera reconstruir el modelo a partir del BERT base.
- Investigacion sobre eficiencia computacional: la complejidad O(N) u O(N log N) de la atencion permite estudiar el equilibrio entre precision y coste en secuencias largas dentro del limite de contexto de BERT.

## Benchmarks y rendimiento

Evaluacion en el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63% | 50,92% | 82,45% | +31,54% |
| Entropia cruzada de validacion | 0,2428 | no calibrado | 0,4403 | convergido |

Telemetria de entrenamiento:

| Metrica | Valor |
|---|---|
| GPU | NVIDIA GeForce RTX 3090 24 GB |
| Duracion | 53,3 s |
| Pasos de optimizacion | 94 |
| Throughput efectivo | 14.435,6 tokens/s |
| Pico de VRAM | 14.749 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento uso 14.749 MB en una RTX 3090. La inferencia de un BERT-Base de 110M suele requerir bastante menos, pero no se documenta una cifra concreta.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (documentada para entrenamiento); para inferencia cabe en GPUs consumer de gama media-alta, aunque no se especifica.
- Cabe en consumer GPU: si, el entrenamiento se realizo en una RTX 3090 de 24 GB; para inferencia se espera un requisito menor, no confirmado.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 14.435,6 tokens/s en RTX 3090; no se publica latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-landmark-local-attention-sst2` | 110M (BERT-Base) | no disponible | 82,45% | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63% (referencia del autor) | Apache 2.0 | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de atencion subcuadratica en la informacion proporcionada.

## Limitaciones y advertencias

- Precision inferior al profesor: 82,45% frente a 91,63% en SST-2, una perdida de 9,18 puntos porcentuales.
- Alcance limitado: solo se ha entrenado y evaluado en una tarea de clasificacion binaria (SST-2); no se ha validado en otras tareas GLUE ni en generacion.
- Solo ingles: el modelo esta entrenado y evaluado unicamente en ingles.
- Dependencia de codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene revisar `modeling_neuralops_bert.py` antes de usarlo en produccion.
- Dependencia del BERT base: los pesos publicados no son autonomos; la carga reconstruye `bert-base-uncased` desde el Hub, por lo que se necesita acceso a ese modelo.
- Riesgo de alucinacion: no aplica directamente al ser un clasificador, pero la calibracion es limitada (entropia cruzada de 0,4403 frente a 0,2428 del profesor).
- Sesgos: no se documentan analisis de sesgo; al heredar el BERT base, puede arrastrar sesgos presentes en los datos originales.
- Licencia MIT: permite uso comercial, pero el modelo base `bert-base-uncased` tiene licencia Apache 2.0, que debe respetarse por separado.
- Sin datos de benchmarks mas alla de SST-2 ni de latencia de inferencia; no se recomienda para produccion sin una evaluacion propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-landmark-local-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

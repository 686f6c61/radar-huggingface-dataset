# tahamajs/bert-lsh-attention-sst2

## Resumen

`tahamajs/bert-lsh-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las doce capas de atencion softmax cuadratica originales han sido sustituidas por el mecanismo `lsh_attention` (Locality-Sensitive Hashing) de la libreria NeuralOps, desarrollada por Taha Majlesi. El objetivo es demostrar que es posible reemplazar la atencion cuadratica O(N²) por una variante subcuadratica (O(N) u O(N log N)) manteniendo un rendimiento razonable tras un proceso de destilacion de conocimiento desde el modelo profesor original.

El modelo esta especializado en clasificacion binaria de sentimiento sobre la tarea SST-2 del benchmark GLUE y se distribuye como pesos modulares de solo atencion en FP16 (unos 55 MB), que se recombinan en tiempo de carga con la base BERT congelada. Se trata, por tanto, mas de una pieza de investigacion sobre eficiencia de atencion que de un modelo listo para produccion: alcanza un 79,13 % de accuracy en SST-2 frente al 91,63 % del profesor, lo que refleja una perdida notable de calidad a cambio de la reduccion de complejidad.

La relevancia actual reside en el interes por arquitecturas de atencion subcuadraticas para contextos largos y en el formato de serializacion modular que evita duplicar los 450 MB de pesos base. La licencia es MIT y el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion LSH (`lsh_attention`) en las 12 capas |
| Parametros totales | 110 M (base BERT-base); pesos distribuidos: solo atencion + cabeza de clasificacion en FP16 (~55 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (formato de pesos publicado); no se documentan otras variantes |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion y cabeza de tarea) + pesos base congelados de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parametros, encoder bidireccional) y sustituye en cada capa el bloque de Multi-Head Attention estandar por `lsh_attention`, un mecanismo basado en hashing sensible a la localidad que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, con dos etapas: alineamiento de subespacio oculto y, despues, KL sobre logits combinado con entropia cruzada de la tarea. Se ejecuto sobre una NVIDIA GeForce RTX 3090 (24 GB) en 53,2 segundos, con 91 pasos de optimizacion, un throughput efectivo de 14.001,2 tokens/s y un pico de VRAM de 23.021 MB. El uso de representaciones cacheadas offline del profesor elimina la necesidad de mantener el modelo profesor en VRAM durante la destilacion.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre texto en ingles, tarea SST-2 de GLUE.
- Inferencia con atencion subcuadratica, potencialmente mas eficiente en secuencias largas que la atencion cuadratica estandar.
- Carga modular: los pesos de atencion se recombinan con la base BERT congelada mediante el shim `modeling_neuralops_bert.py`.
- Integracion con `transformers` mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Integracion con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No se documentan capacidades de generacion, tool calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como referencia reproducible para medir la perdida de calidad al sustituir softmax por LSH en un encoder BERT, con un delta de accuracy de -12,5 puntos frente al profesor.
- Analisis de sentimiento en ingles a pequeña escala: clasificacion de resenas o comentarios con un modelo de 110 M de parametros que cabe en cualquier GPU consumer.
- Experimentos de destilacion: el protocolo Cached Representation Distillation y los resultados (51,61 % pre-KD frente a 79,13 % post-KD) sirven de base para comparar estrategias de alineamiento.
- Prototipado de pipelines de eficiencia: permite evaluar el coste real de cargar pesos modulares de solo atencion frente a checkpoints completos en entornos con poco almacenamiento.
- Benchmarking de mecanismos de atencion: util como baseline dentro del Attention Zoo de NeuralOps para comparar `lsh_attention` con otras variantes subcuadraticas.
- Docencia y formacion: ejemplo didactico de sustitucion de un bloque de atencion y de serializacion parametro-eficiente en un modelo estandar.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`lsh_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,61 % | 79,13 % | +27,52 % (frente a pre-KD) |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4690 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 440 MB; en FP16, unos 220 MB. Cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento documentado se ejecuto en una RTX 3090 (24 GB) con un pico de 23.021 MB, aunque ese consumo corresponde al proceso de destilacion, no a la inferencia.
- Cabe en GPU consumer: si, incluidas GTX 1060, RTX 2060, RTX 3060 y superiores.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la libreria NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se registro un throughput de 14.001,2 tokens/s en una RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-lsh-attention-sst2` | 110 M (base) | no disponible | 79,13 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (segun la model card) | Apache 2.0 | Hugging Face, `transformers` nativo |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` nativo |

## Limitaciones y advertencias

- Perdida de calidad sustancial: 79,13 % de accuracy frente al 91,63 % del profesor, un descenso de 12,5 puntos que lo aleja de los modelos BERT especializados en SST-2.
- El estudiante pre-destilacion apenas supera el azar (51,61 %), lo que indica que el mecanismo LSH por si solo no aprende la tarea sin el proceso de destilacion.
- Solo soporta ingles y una unica tarea de clasificacion binaria; no es un modelo de proposito general.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad en entornos de produccion.
- Dependencia de la libreria NeuralOps y de la base `bert-base-uncased` para reconstruir el modelo; el repositorio no contiene los pesos base completos.
- Riesgo de alucinacion no aplicable en sentido estricto (es un clasificador), pero si de calibracion: la entropia cruzada de validacion (0,4690) es casi el doble que la del profesor (0,2428).
- No se documentan sesgos especificos; al heredar la base BERT-base, es previsible que arrastre sesgos del corpus original, aunque no se cuantifican.
- Sin datos publicados sobre rendimiento en secuencias largas, pese a ser el principal argumento del mecanismo subcuadratico.
- El modelo fue creado en noviembre de 2026 y no registra descargas ni likes, por lo que no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-lsh-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

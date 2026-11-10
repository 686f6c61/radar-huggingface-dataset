# tahamajs/bert-rpc-attention-sst2

## Resumen

`tahamajs/bert-rpc-attention-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo propio denominado `rpc_attention`, publicado dentro de la librería NeuralOps. El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye como un conjunto de pesos de atención más la cabeza de clasificación en FP16, de aproximadamente 55 MB, que se combinan en tiempo de carga con los pesos congelados del BERT base original.

La relevancia del checkpoint no reside en su calidad absoluta, sino en su carácter de prueba de concepto: demuestra que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática (O(N) u O(N log N) según el autor) manteniendo una precisión razonable en una tarea concreta tras un proceso de destilación de representaciones en dos etapas. El entrenamiento se ejecutó en una única RTX 3090 en 51,9 segundos y 230 pasos de optimización, con un pico de VRAM de 7726 MB.

Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, orientado a quien quiera reproducir o auditar el protocolo de destilación de NeuralOps, no a un uso directo en producción. La licencia es MIT y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `rpc_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110M (base BERT) + cabeza de clasificación; el repo solo almacena pesos de atención y cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, attention-only) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110M parámetros) y reemplaza en todas las capas el mecanismo de multi-head attention estándar por `rpc_attention`, un operador de atención subcuadrática de la librería NeuralOps con complejidad efectiva O(N) u O(N log N) frente a O(N²) del MHA clásico. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación, lo que explica el tamaño reducido del repositorio (~55 MB) frente a los ~450 MB del checkpoint completo.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation" en dos etapas: primero una alineación de subespacio oculto (Stage 1) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2). El profesor es el propio `bert-base-uncased` afinado, y sus representaciones se cachean offline para no consumir VRAM adicional durante la destilación. El proceso completo se ejecutó en una RTX 3090 (24 GB) en 51,9 segundos, con 230 pasos de optimización y un throughput efectivo de 36 338,1 tokens/s, alcanzando un pico de 7726 MB de VRAM. El dataset utilizado es la partición de entrenamiento de SST-2 (GLUE).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, con una única etiqueta de salida por secuencia.
- Inferencia estándar vía `AutoModelForSequenceClassification` con `trust_remote_code=True`, o mediante la API modular `neuralops.hub.bert_zoo.load_pretrained_bert`.
- Carga modular: el código remoto inicializa los pesos congelados de `bert-base-uncased` y aplica encima los parámetros de atención destilados.
- No soporta generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.
- No se documentan capacidades de extracción de embeddings más allá de la representación interna de BERT.

## Casos de uso

- **Auditoría de mecanismos de atención subcuadrática**: sirve como referencia reproducible para comparar `rpc_attention` frente a MHA estándar en una tarea controlada (SST-2), dado que el protocolo de destilación y las métricas están documentados.
- **Investigación en destilación de representaciones**: el checkpoint permite reproducir el protocolo de dos etapas (alineación de subespacio + KL/CE) sobre un profesor BERT-base y medir el delta de precisión resultante.
- **Prototipado de clasificadores de sentimiento de bajo coste**: con ~55 MB de pesos descargables y una RTX 3090 como referencia, es viable montar un experimento local de clasificación binaria de reseñas en inglés sin infraestructura grande.
- **Pruebas de integración de la librería NeuralOps**: útil para validar la API `load_pretrained_bert`, el shim `modeling_neuralops_bert.py` y la serialización attention-only en pipelines propios.
- **Benchmark interno de eficiencia**: la complejidad subcuadrática declarada permite medir latencia y memoria frente a BERT-base en secuencias largas, aunque el modelo solo se haya evaluado en SST-2.
- **Docencia y divulgación**: ejemplo compacto de sustitución de un operador de atención en un transformer preentrenado y de destilación con profesor cacheado offline.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`rpc_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63% | 51,26% | 81,88% | +30,62% |
| Cross-entropy de validación | 0,2428 | no calibrada | 0,5112 | no disponible |

Telemetría de entrenamiento (RTX 3090, clúster Sharif HPC): 51,9 s, 230 pasos, 36 338,1 tokens/s, pico de VRAM 7726 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo completo (BERT-base + atención destilada) en FP16 ronda los ~220 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU de referencia usada en el desarrollo: NVIDIA GeForce RTX 3090 (24 GB, Ampere).
- Cabe en GPU consumer: sí, en cualquier tarjeta con al menos ~1 GB de VRAM libre en FP16 (estimación a partir del tamaño de pesos; no confirmada por el autor).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles; solo se publica throughput de entrenamiento (36 338,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-rpc-attention-sst2` | 110M (base) + atención destilada | no disponible | 81,88% | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 | 91,63% (referencia de la model card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110M | 512 | no disponible en la información | Apache 2.0 | Hugging Face |

La comparación con DistilBERT y con el BERT afinado de TextAttack se ofrece como referencia de categoría; no se dispone de sus cifras exactas en la información proporcionada, por lo que no se comparan numéricamente.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en SST-2; no hay evidencia de su comportamiento en otras tareas de GLUE ni en dominios fuera de reseñas de cine.
- La precisión destilada (81,88%) está casi 10 puntos por debajo del profesor (91,63%), lo que refleja una pérdida sustancial de calidad respecto a BERT-base afinado.
- El estudiante pre-destilación cae a 51,26% de accuracy, cerca del azar, lo que sugiere que el mecanismo `rpc_attention` no funciona sin el proceso de destilación.
- Solo soporta inglés; no hay capacidades multilingües.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí riesgo de clasificaciones erróneas fuera de distribución.
- Sesgos: no se documenta ningún análisis de sesgo; al heredar de `bert-base-uncased` y de SST-2, es probable que arrastre los sesgos del corpus original (no verificado).
- El repositorio depende de código remoto (`trust_remote_code=True` y `modeling_neuralops_bert.py`), lo que implica ejecutar código de un autor con 0 descargas; conviene auditar el shim antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks adicionales y el estado de investigación del artefacto desaconsejan su uso en producción sin validación propia.
- El contexto máximo no se declara explícitamente; se asume el de BERT-base (512 tokens), pero no está confirmado en la model card.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-rpc-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Paper, blog o demo específicos del modelo: no disponibles en la información proporcionada.

# tahamajs/bert-qcqa-attention-sst2

## Resumen

`bert-qcqa-attention-sst2` es un checkpoint de BERT-Base (110 millones de parametros) publicado por Taha Majlesi (usuario `tahamajs`) en el que se sustituyen los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `qcqa_attention` de la libreria NeuralOps. El objetivo es demostrar que es posible mantener la precision de la tarea GLUE SST-2 (clasificacion binaria de sentimiento) con una atencion de complejidad subcuadratica, teoricamente O(N) u O(N log N) frente a O(N^2), reduciendo ademas el coste de almacenamiento a unos 55 MB de pesos de atencion en FP16.

El modelo se ha destilado desde el propio `bert-base-uncased` como profesor mediante el protocolo NeuralOps Cached Representation Distillation, que evita reservar VRAM para el profesor cacheando offline las representaciones. Segun la model card, el estudiante sin destilar cae a un 52,98 % de accuracy en SST-2 y tras la destilacion recupera el 91,63 % del profesor. Todo el entrenamiento se ejecuto en una unica RTX 3090 de 24 GB en 49,6 segundos y 255 pasos.

Es relevante ahora porque forma parte de un "attention zoo" que compara variantes de atencion eficiente sobre un mismo backbone y una misma tarea, lo que facilita evaluaciones controladas de mecanismos subcuadraticos. No obstante, se trata de un artefacto de investigacion muy acotado: una sola tarea, un solo idioma y un unico checkpoint, con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `qcqa_attention` subcuadratica en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); los pesos distribuidos son solo de atencion y cabeza de clasificacion (~55 MB FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el backbone base admite 512 tokens, pero la model card no lo especifica para esta variante) |
| Tipos de cuantizacion | pesos distribuidos en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parametros, y reemplaza la atencion multi-cabeza estandar por `qcqa_attention`, un mecanismo de la familia de atencion subcuadratica con complejidad efectiva O(N) u O(N log N) segun la model card. El repositorio no re-subee los pesos congelados del backbone: solo incluye los parametros de atencion destilados y la cabeza de clasificacion, y un shim de codigo remoto (`modeling_neuralops_bert.py`) reconstruye el modelo completo inicializando el resto desde `bert-base-uncased`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol en dos etapas: primero una alineacion de subespacio oculto y despues una combinacion de KL sobre logits y entropia cruzada de tarea. Se ejecuto sobre la particion de validacion de SST-2 (872 muestras binarias) en una RTX 3090, con 255 pasos, 49,6 s de duracion, 42.120,5 tokens/s de throughput efectivo y un pico de VRAM de 8.083 MB. La model card no detalla el numero total de tokens de entrenamiento ni la composicion del dataset mas alla de GLUE/SST-2, ni menciona el uso de RLHF o DPO.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre la tarea SST-2 de GLUE.
- Extraccion de representaciones contextuales de frases en ingles mediante el encoder BERT subyacente.
- Ejecucion con complejidad de atencion subcuadratica, lo que en teoria permite secuencias mas largas con menor coste que la atencion cuadratica estandar.
- Carga modular a traves de la API `load_pretrained_bert` de NeuralOps, que reconstruye el modelo sobre el backbone congelado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue: no disponible; el modelo esta entrenado y evaluado solo en ingles.

## Casos de uso

- Clasificacion de sentimiento en resenas y comentarios en ingles: el modelo devuelve directamente una etiqueta binaria a partir de la cabeza de clasificacion, adecuado para pipelines de moderacion o analisis de opinion donde solo se necesita polaridad.
- Filtrado previo en pipelines de datos: usar el modelo como clasificador rapido y ligero (55 MB de pesos de atencion) para descartar o etiquetar grandes volumenes de texto antes de pasarlos a un modelo mayor.
- Investigacion sobre atencion eficiente: sirve como checkpoint de referencia para comparar `qcqa_attention` con otras variantes del attention zoo de NeuralOps sobre una misma tarea y un mismo backbone.
- Destilacion de conocimiento: el protocolo Cached Representation Distillation documentado puede replicarse para destilar otras variantes de atencion desde `bert-base-uncased` sin necesidad de VRAM adicional para el profesor.
- Benchmarking de latencia y memoria: util para medir en hardware consumer (RTX 3090) el impacto real de una atencion subcuadratica frente a MHA en una tarea de clasificacion acotada.
- Prototipado educativo: ejemplo compacto de sustitucion de mecanismos de atencion en un transformer con `trust_remote_code` y serializacion modular de pesos.

## Benchmarks y rendimiento

Evaluacion sobre la particion de validacion de GLUE SST-2 (872 muestras binarias), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante sin destilar | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 52,98 % | 91,63 % | +38,65 pp |
| Entropia cruzada de validacion | 0,2428 | sin calibrar | 0,2688 | convergido |

Telemetria de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,6 s |
| Pasos de optimizacion | 255 |
| Throughput efectivo | 42.120,5 tokens/s |
| Pico de VRAM | 8.083 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el pico documentado durante el entrenamiento fue de 8.083 MB en una RTX 3090, por lo que la inferencia deberia quedar por debajo de esa cifra al cargar el backbone BERT-Base completo en FP32/FP16.
- GPU recomendadas: cualquier GPU con al menos ~8 GB de VRAM; el autor uso una RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060 Ti/3070/3080/3090, RTX 4060 Ti/4070/4080/4090 y equivalentes).
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo el throughput de entrenamiento (42.120,5 tokens/s) y la duracion total del entrenamiento (49,6 s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-qcqa-attention-sst2` | 110 M (base) | no disponible | 91,63 % | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, ampliamente usado |
| Otras variantes del attention zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (segun repositorio) | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de otras variantes del zoo en la informacion proporcionada, por lo que la comparativa con alternativas subcuadraticas queda incompleta.

## Limitaciones y advertencias

- El modelo solo realiza clasificacion binaria de sentimiento en ingles; no es un modelo generativo ni un asistente conversacional.
- Entrenado y evaluado exclusivamente sobre SST-2 (872 muestras de validacion); no hay evidencia de generalizacion a otros dominios o tareas.
- La model card no documenta sesgos conocidos, pero al derivar de `bert-base-uncased` hereda los sesgos de su corpus de preentrenamiento (texto web en ingles).
- Riesgo de alucinacion no aplicable en sentido estricto (tarea de clasificacion), pero si de calibracion: la entropia cruzada del estudiante (0,2688) es ligeramente superior a la del profesor (0,2428).
- Requiere `trust_remote_code=True` y ejecuta codigo remoto (`modeling_neuralops_bert.py`), lo que implica revisar el codigo antes de usarlo en produccion.
- La carga depende de la libreria `neuralops` y de la disponibilidad de `bert-base-uncased` en el Hub; no es un checkpoint autonomo.
- Licencia MIT permite uso comercial, pero el backbone base `bert-base-uncased` esta bajo Apache 2.0, cuyas condiciones deben respetarse igualmente.
- Repositorio con 0 descargas y 0 likes; sin validacion externa de la comunidad en el momento de redactar esta ficha.
- No se documentan longitudes de contexto efectivas para la variante subcuadratica, lo que impide confirmar la ventaja teorica en secuencias largas.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-qcqa-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

# tahamajs/bert-sink-attention-sst2

## Resumen

`tahamajs/bert-sink-attention-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por un mecanismo denominado `sink_attention`, implementado en su libreria NeuralOps. El objetivo declarado es explorar mecanismos de atencion subcuadraticos (complejidad efectiva O(N) u O(N log N) frente a O(N^2)) manteniendo la arquitectura base de BERT, y publicar los pesos resultantes como parte de un "Attention Zoo" de referencia.

El modelo se ha entrenado mediante destilacion de representaciones en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de tarea) sobre la tarea SST-2 del benchmark GLUE, con el modelo base BERT como profesor. El entrenamiento se ejecuto en una unica NVIDIA RTX 3090 de 24 GB durante 50,8 segundos y 305 pasos de optimizacion, con un pico de VRAM de 5920 MB.

La relevancia de esta ficha es acotada: se trata de un experimento de investigacion publicado con licencia MIT, con 0 descargas y 0 likes en el momento de la consulta, y cuyos resultados empiricos son sustancialmente inferiores al profesor (50,92 % de accuracy frente a 91,63 % en SST-2). No es un modelo listo para produccion, sino una sonda tecnica sobre atencion subcuadratica y serializacion modular de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `sink_attention` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base); el repositorio solo distribuye pesos de atencion y cabeza de tarea (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos publicados (`attention_weights.safetensors`); no se documentan otras |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atencion y cabeza de clasificacion, FP16, ~55 MB); requiere `trust_remote_code=True` y descarga de `bert-base-uncased` congelado |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-base (12 capas, 110 M de parametros, encoder bidireccional) y reemplaza la atencion multi-cabeza estandar por `sink_attention`, un mecanismo con complejidad efectiva subcuadratica (O(N) u O(N log N) segun la model card). El resto del modelo (embeddings, FFN, normalizaciones) permanece congelado y se inicializa desde `bert-base-uncased` en tiempo de carga mediante un shim de codigo remoto (`modeling_neuralops_bert.py`). El repositorio solo contiene los parametros entrenados de atencion y la cabeza de clasificacion, lo que reduce la huella de descarga a unos 55 MB.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps: primero un alineamiento de subespacio en representaciones ocultas y despues una fase combinada de KL sobre logits del profesor y entropia cruzada de la tarea. Se ejecuto en una RTX 3090 (24 GB) con 305 pasos, 50,8 s de duracion y un throughput de 49.176,5 tokens/s, con 5920 MB de VRAM pico. No se documentan el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de SST-2 de GLUE.

## Capacidades

- Clasificacion de texto binaria (analisis de sentimiento) sobre secuencias en ingles, con salida de dos logits (0 = negativo, 1 = positivo).
- Atencion subcuadratica: el interes tecnico esta en el mecanismo, no en las capacidades de la tarea.
- Inferencia compatible con `AutoModelForSequenceClassification` de Hugging Face con `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: no, solo ingles.
- Generacion de texto: no, es un encoder de clasificacion.

## Casos de uso

- Investigacion sobre atencion subcuadratica: servir como punto de partida reproducible para comparar `sink_attention` con MHA estandar en tareas GLUE, usando el protocolo de destilacion documentado.
- Docencia y divulgacion: ejemplo didactico de sustitucion modular de bloques de atencion en un transformer preentrenado sin reentrenar el modelo completo.
- Prototipado de serializacion modular de pesos: el esquema de publicar solo pesos de atencion (~55 MB) frente al modelo completo (~450 MB) es reutilizable para distribuir variantes de atencion de forma eficiente.
- Analisis de sentimiento en ingles de baja exigencia: clasificacion binaria de resenas o comentarios donde un 50,92 % de accuracy sea aceptable como linea base (por ejemplo, en un estudio comparativo interno, no en produccion).
- Benchmarking de pipelines de destilacion: medir coste y convergencia de la destilacion en dos etapas con cache offline de representaciones del profesor en una sola GPU de consumo.
- Reproduccion de experimentos: validar el flujo de `neuralops.hub.bert_zoo` y el shim de codigo remoto en entornos de investigacion con `transformers`.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 56,54 % | 50,92 % | -5,62 % (respecto a pre-KD); -40,71 % respecto al profesor |
| Entropia cruzada de validacion | 0,2428 | No calibrado | 0,6946 | No disponible |

Telemetria de entrenamiento: RTX 3090 24 GB, 50,8 s, 305 pasos, 49.176,5 tokens/s, 5920 MB de VRAM pico. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia: el modelo completo en FP32 ronda los 440 MB de pesos (BERT-base, 110 M de parametros); en FP16, unos 220 MB. Con activaciones y batch pequeno, cabe holgadamente en cualquier GPU de consumo con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; para entrenamiento o destilacion se uso una RTX 3090 de 24 GB con 5920 MB de pico.
- Cabe en GPU consumer: si, en practicamente todas las GPU con soporte CUDA y al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere descargar `bert-base-uncased`); la API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; el throughput de 49.176,5 tokens/s corresponde al entrenamiento, no a la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-sink-attention-sst2` | 110 M (solo atencion publicada) | No disponible (base 512) | 50,92 % | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (segun la model card) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 | No disponible en la informacion proporcionada | MIT | Hugging Face |

La comparativa se limita a la tarea SST-2; no se dispone de datos de otros benchmarks para los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 50,92 % de accuracy en SST-2 frente a 91,63 %, apenas por encima del azar en una tarea binaria; no es apto para produccion.
- El propio autor etiqueta el resultado como "Subquadratic Probe", lo que sugiere un experimento exploratorio y no un modelo final.
- Entropia cruzada de validacion de 0,6946, coherente con la baja accuracy; no se documenta calibracion.
- Solo ingles; no hay capacidades multilingues.
- Requiere `trust_remote_code=True` y ejecucion de codigo remoto (`modeling_neuralops_bert.py`), lo que implica una superficie de riesgo en entornos de produccion.
- Depende de descargar `bert-base-uncased` congelado; el repositorio no es autocontenido.
- No se documentan sesgos especificos, pero al derivar de BERT-base hereda los sesgos de su corpus de entrenamiento original.
- Riesgo de alucinacion no aplica en sentido estricto (es clasificacion), pero la fiabilidad de las predicciones es baja.
- Licencia MIT permite uso comercial, pero el rendimiento hace inviable ese escenario sin un reentrenamiento sustancial.
- Sin descargas ni likes en el momento de la consulta; sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-sink-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Cita (BibTeX en la model card): Majlesi, Taha (2026), "NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark"

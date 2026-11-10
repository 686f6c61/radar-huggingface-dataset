# tahamajs/bert-linformer-attention-sst2

## Resumen

`tahamajs/bert-linformer-attention-sst2` es un checkpoint de BERT-Base (`bert-base-uncased`, 110M parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `linformer_attention` de la libreria NeuralOps. El objetivo es demostrar que es posible reducir la complejidad operativa de la atencion de O(N²) a O(N) u O(N log N) manteniendo una precision razonable en una tarea de clasificacion de sentimiento, mediante un proceso de destilacion de conocimiento desde el modelo profesor original.

El modelo se ha afinado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles, 872 muestras de validacion), alcanzando un 84,29% de accuracy tras la destilacion, frente al 91,63% del BERT-Base profesor y al 50,92% del estudiante antes de la destilacion. El entrenamiento se ejecuto en una unica NVIDIA RTX 3090 de 24 GB en 52,9 segundos (232 pasos de optimizacion), con un pico de VRAM de 7652 MB.

La relevancia del checkpoint es fundamentalmente metodologica: forma parte de un "attention zoo" que compara mecanismos de atencion subcuadraticos sobre una misma arquitectura base, y emplea una serializacion modular que almacena unicamente los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), reconstruyendo los pesos congelados del BERT base en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion Linformer en las 12 capas |
| Parametros totales | 110M (BERT-Base); pesos especializados publicados: ~55 MB en FP16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; el checkpoint no especifica una longitud propia) |
| Tipos de cuantizacion | FP16 para los pesos de atencion publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion y cabeza de tarea); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (transformer encoder de 12 capas, 110M parametros) y reemplaza en todas las capas el mecanismo de multi-head attention cuadratico por `linformer_attention`, que proyecta las claves y los valores a una dimension latente de rango reducido para lograr una complejidad efectiva de O(N) u O(N log N) en lugar de O(N²). Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion, que el shim de codigo remoto (`modeling_neuralops_bert.py`) aplica sobre el modelo base al cargar.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de representaciones ocultas en subespacio y una segunda etapa con perdida KL sobre logits del profesor mas entropia cruzada de la tarea. El profesor es el `bert-base-uncased` afinado en SST-2 (91,63% de accuracy). El protocolo cachea offline las representaciones del profesor, de modo que no ocupa VRAM durante la destilacion (pico total de 7652 MB). Se ejecutaron 232 pasos en 52,9 segundos sobre una RTX 3090, con un throughput efectivo de 35.901,1 tokens/segundo.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, tarea SST-2 de GLUE.
- Clasificacion de secuencias de texto cortas con una unica etiqueta de salida (0 = negativo, 1 = positivo).
- Inferencia eficiente en memoria gracias a la atencion subcuadratica Linformer, especialmente relevante en secuencias largas.
- Carga modular: reconstruye el BERT base congelado y aplica solo los pesos de atencion destilados.
- Integracion con Hugging Face Transformers mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Integracion con la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".

## Casos de uso

- Analisis de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo clasifica directamente frases cortas en positivo/negativo, adecuado para pipelines de moderacion o analitica de opinion donde el coste computacional importa.
- Investigacion sobre atencion subcuadratica: sirve como checkpoint de referencia dentro del Attention Zoo de NeuralOps para comparar Linformer frente a otros mecanismos (softmax, lineales, etc.) sobre una misma base BERT y un mismo protocolo de destilacion.
- Experimentos de destilacion de conocimiento: el protocolo con cache offline de representaciones del profesor es replicable en hardware de consumo (una sola RTX 3090), util para estudiar tecnicas de KD sin grandes presupuestos.
- Clasificacion de texto a gran escala con requisitos de memoria ajustados: al almacenar solo ~55 MB de pesos especializados, el despliegue en multiples instancias es barato en disco y en transferencia.
- Prototipado rapido de clasificadores de sentimiento: la carga en una linea con `AutoModelForSequenceClassification` permite integrar el modelo en notebooks o servicios ligeros sin infraestructura adicional.
- Benchmarking de eficiencia de atencion: util para medir latencia y throughput de Linformer frente a atencion cuadratica en secuencias de distinta longitud sobre el mismo esqueleto BERT.
- Educacion y divulgacion: ejemplo didactico de como sustituir un componente arquitectonico (la atencion) y medir el impacto en precision y coste mediante destilacion.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`linformer_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63% | 50,92% | 84,29% | +33,37% |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4582 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 52,9 s |
| Pasos de optimizacion | 232 |
| Throughput efectivo | 35.901,1 tokens/s |
| Pico de VRAM | 7652 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base BERT-Base en FP32 ocupa aproximadamente 440 MB de pesos, por lo que la inferencia cabe holgadamente en GPUs de 8 GB o menos. El pico documentado de 7652 MB corresponde al entrenamiento/destilacion, no a inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia; el autor uso una RTX 3090 (24 GB) para el entrenamiento.
- Cabe en GPU de consumo: si, incluidas RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API `neuralops.hub.bert_zoo`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento documentado de 35.901,1 tokens/s en RTX 3090; no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-linformer-attention-sst2` | 110M (BERT-Base) | no disponible | 84,29% | MIT | Hugging Face |
| `bert-base-uncased` afinado en SST-2 (profesor) | 110M | 512 tokens | 91,63% | Apache 2.0 (modelo base) | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| `roberta-base` afinado en SST-2 | 125M | 512 tokens | no disponible en la informacion proporcionada | MIT | Hugging Face |

La comparativa se limita a arquitecturas encoder de tamano similar; los datos de los modelos alternativos no se han verificado en la informacion proporcionada y se indican como no disponibles cuando no constan.

## Limitaciones y advertencias

- Precision inferior al profesor: 84,29% frente a 91,63% en SST-2, una diferencia de 7,34 puntos porcentuales que puede ser inaceptable en produccion sensible a la precision.
- Entropia cruzada de validacion mas alta que el profesor (0,4582 frente a 0,2428), lo que indica menor calibracion de las probabilidades.
- Solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Tarea unica: clasificacion binaria de sentimiento; no es un modelo generativo ni soporta instrucciones, tool calling ni agentes.
- El estudiante pre-destilacion tenia un 50,92% de accuracy (practicamente azar), lo que sugiere que el mecanismo Linformer sin destilacion no aprende bien la tarea por si solo; la calidad depende criticamente del protocolo de KD.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en produccion.
- Los pesos publicados son solo de atencion y cabeza de tarea (~55 MB); la carga depende de descargar `bert-base-uncased` desde el Hub, lo que introduce una dependencia externa.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas en dominios distintos al de resenas (SST-2 procede de criticas de cine).
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que debe respetarse.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-linformer-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2

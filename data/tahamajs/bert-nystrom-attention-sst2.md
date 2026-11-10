# tahamajs/bert-nystrom-attention-sst2

## Resumen

`tahamajs/bert-nystrom-attention-sst2` es un checkpoint de BERT-Base (110M parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `nystrom_attention` de su libreria NeuralOps. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles) y se distribuye como pesos de atencion unicamente en FP16 (~55 MB), que se aplican sobre los pesos congelados de `bert-base-uncased` en tiempo de carga.

La relevancia del artefacto es experimental y metodologica: demuestra que es posible sustituir la atencion cuadratica por una aproximacion subcuadratica (O(N) u O(N log N)) en un transformer preentrenado y recuperar buena parte del rendimiento original mediante destilacion de representaciones en cache, sin asignar VRAM al modelo profesor. El autor reporta un 87,73 % de accuracy en la validacion de SST-2 tras la destilacion, frente al 91,63 % del profesor BERT-Base y al 81,42 % del estudiante antes de la destilacion.

Se trata de un modelo de investigacion con 0 descargas y 1 like en el momento de la consulta, publicado en noviembre de 2026, con licencia MIT y soporte exclusivo de ingles. No es un modelo generativo ni un LLM: es un clasificador de secuencias para sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Base (transformer encoder, 12 capas) con atencion Nystrom sustituyendo la atencion softmax cuadratica |
| Parametros totales | 110M (BERT-Base); el repo solo almacena pesos de atencion y cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, 512 tokens, no confirmada en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atencion; no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serializacion `attention_only_fp16` |
| Libreria | `neuralops` (requiere `trust_remote_code=True`) |
| Modelo base | `google-bert/bert-base-uncased` (congelado) |
| Tarea / pipeline | `text-classification` (SST-2, binaria) |
| Tamano del repo | 0.5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110M parametros, y reemplaza en todas las capas el mecanismo de atencion multi-cabeza estandar (O(N^2)) por `nystrom_attention`, una aproximacion de bajo rango que reduce la complejidad efectiva a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los pesos de atencion y la cabeza de clasificacion, que se inyectan en tiempo de carga mediante un shim de codigo remoto (`modeling_neuralops_bert.py`).

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", que cachea offline las representaciones del profesor para evitar asignar VRAM a este durante la destilacion. El proceso consta de dos etapas: alineamiento de subespacio oculto y, despues, KL sobre logits mas entropia cruzada de la tarea. Se ejecuto en una NVIDIA GeForce RTX 3090 (24 GB) del cluster HPC de Sharif, con 221 pasos de optimizacion, 49,6 segundos de duracion, un throughput efectivo de 36.507,5 tokens/s y un pico de VRAM de 7.854 MB.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles sobre textos de una sola secuencia.
- Inferencia con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo aplicando solo los pesos de atencion destilados sobre BERT-Base.
- Aprovecha la atencion subcuadratica para reducir el coste computacional en secuencias largas, aunque no se documentan mediciones de latencia o memoria frente al BERT original.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni modos de razonamiento extendido.
- Multilingue: no; solo ingles.

## Casos de uso

- Clasificacion de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo devuelve directamente la polaridad binaria y puede integrarse en un pipeline de Transformers con una sola llamada a `from_pretrained`.
- Filtrado y moderacion de comentarios: usar la salida de sentimiento como senal auxiliar para priorizar revision humana de contenido negativo en foros o secciones de comentarios.
- Analisis de opinion a escala en redes sociales: al ser un modelo de 110M parametros con atencion subcuadratica, es adecuado para procesar grandes volumenes de textos cortos en lotes sobre una sola GPU consumer.
- Investigacion sobre atencion eficiente: sirve como checkpoint de referencia para comparar el impacto de Nystrom attention frente a softmax en tareas de comprension del lenguaje, con una linea base reproducible en SST-2.
- Destilacion y experimentacion academica: el protocolo de destilacion con representaciones cacheadas y el codigo de NeuralOps permiten replicar el experimento en una RTX 3090 en menos de un minuto de entrenamiento.
- Prototipado de clasificadores con requisitos estrictos de memoria: el repo de ~55 MB de pesos de atencion mas el base congelado permite desplegar el modelo en entornos con almacenamiento limitado, descargando el base una sola vez y reutilizandolo entre variantes del zoo.

## Benchmarks y rendimiento

Evaluacion reportada por el autor en el split de validacion de GLUE SST-2 (872 muestras de clasificacion binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`nystrom_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 81,42 % | 87,73 % | +6,31 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,3874 | no disponible |

Telemetria de entrenamiento: 221 pasos, 49,6 s, 36.507,5 tokens/s, pico de VRAM 7.854 MB en RTX 3090. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo solo se evalua en SST-2.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa aproximadamente 440 MB de pesos (110M parametros); en FP16, unos 220 MB. Con activaciones y overhead de PyTorch, cabe holgadamente en cualquier GPU con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; el autor entreno en una RTX 3090 de 24 GB, pero el pico de VRAM fue de solo 7.854 MB.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la libreria `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican directamente.
- Latencia y throughput: no se publican mediciones de inferencia; el unico dato disponible es el throughput de entrenamiento (36.507,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-nystrom-attention-sst2` | 110M (atencion Nystrom) | no disponible (base BERT: 512) | 87,73 % | MIT | Hugging Face, requiere `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 | 91,63 % (segun el autor) | Apache 2.0 | Hugging Face, Transformers estandar |
| BERT-Base afinado en SST-2 (referencia GLUE) | 110M | 512 | ~92-93 % (valores habituales de la literatura, no verificados en esta ficha) | Apache 2.0 | Multiples checkpoints en Hugging Face |
| DistilBERT-base-uncased | 66M | 512 | ~91 % (valores habituales, no verificados) | Apache 2.0 | Hugging Face, Transformers estandar |

La comparativa se limita a BERT y sus variantes porque el modelo es un checkpoint de investigacion especifico de SST-2; no se dispone de datos de benchmarks de alternativas con atencion subcuadratica en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 1 like: no hay evidencia de uso en produccion ni validacion independiente de los resultados reportados.
- Solo ingles: no soporta otros idiomas, y la model card no documenta el comportamiento fuera del dominio de SST-2 (resenas de cine).
- Rendimiento inferior al profesor: 87,73 % frente a 91,63 % en SST-2, una perdida de 3,9 puntos porcentuales que puede ser inaceptable en tareas sensibles.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que implica ejecutar codigo remoto no auditado de un autor individual; riesgo de seguridad y de mantenimiento a largo plazo.
- Dependencia del base congelado: el repo no contiene los pesos completos de BERT, por lo que la carga depende de la disponibilidad de `google-bert/bert-base-uncased` y del shim de codigo remoto.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de calibracion: la entropia cruzada del estudiante (0,3874) es notablemente superior a la del profesor (0,2428), lo que sugiere probabilidades menos calibradas.
- Sesgos: no se documenta ningun analisis de sesgos; al heredar el preentrenamiento de BERT-Base, arrastra los sesgos de su corpus (BookCorpus y Wikipedia en ingles).
- Licencia MIT permite uso comercial, pero la ausencia de garantias y de validacion externa desaconseja su uso en produccion sin una evaluacion propia.
- La longitud de contexto efectiva con atencion Nystrom no se documenta; no se confirma que mantenga los 512 tokens de BERT-Base ni su comportamiento en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-nystrom-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

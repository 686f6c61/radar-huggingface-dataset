# tahamajs/bert-hymba-transx-sst2

## Resumen

`tahamajs/bert-hymba-transx-sst2` es un checkpoint de clasificacion de sentimiento en ingles construido sobre `google-bert/bert-base-uncased` (110 M parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `hymba_transx` de su libreria NeuralOps. El resultado es un modelo de clasificacion binaria (positivo/negativo) afinado y destilado sobre la tarea SST-2 del benchmark GLUE, con una complejidad operativa subcuadratica declarada de O(N) u O(N log N) frente a la O(N^2) de la atencion multi-cabeza estandar.

El modelo se distribuye bajo un esquema de serializacion modular poco habitual: el repositorio solo contiene los pesos de atencion especializados y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, ~55 MB), mientras que los pesos congelados del BERT base se inicializan en tiempo de carga desde `bert-base-uncased` mediante un shim de codigo remoto (`modeling_neuralops_bert.py`). Esto reduce drasticamente la huella de descarga, pero obliga a usar `trust_remote_code=True` y a depender de la libreria `neuralops`.

La relevancia del modelo es fundamentalmente metodologica: demuestra que es posible destilar representaciones de un teacher BERT hacia un student con atencion subcuadratica manteniendo (y de hecho superando ligeramente) la precision del teacher en SST-2, con un coste de entrenamiento de 50,4 segundos en una unica RTX 3090. No es un modelo de proposito general: es una prueba de concepto de investigacion sobre eficiencia de atencion, no un clasificador listo para produccion multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atencion `hymba_transx` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base-uncased); pesos publicados: solo atencion + cabeza (~55 MB FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de BERT-base, tipicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16) + shim de codigo remoto; el repo completo ocupa 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-base (12 capas, 768 de dimension oculta, 110 M parametros) y reemplaza en todas las capas el mecanismo de atencion multi-cabeza clasico por `hymba_transx`, un mecanismo de atencion subcuadratica de la Attention Zoo de NeuralOps con complejidad efectiva declarada de O(N) u O(N log N). Los pesos del cuerpo BERT permanecen congelados; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation": una primera etapa de alineamiento de representaciones en subespacio oculto y una segunda etapa de destilacion por KL sobre logits combinada con entropia cruzada de la tarea. El teacher es `bert-base-uncased` original, y la destilacion se hace con representaciones cacheadas offline, de modo que el teacher no consume VRAM durante el entrenamiento (pico de 11.964 MB en una RTX 3090). El proceso completo duro 50,4 segundos, 124 pasos de optimizacion, con un throughput efectivo de 20.144,7 tokens/s. El dataset de evaluacion y ajuste es SST-2 (split de validacion GLUE, 872 muestras de clasificacion binaria).

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto de una sola frase o parrafo corto.
- Inferencia con `transformers.AutoModelForSequenceClassification` usando `trust_remote_code=True`, o mediante la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- Atencion subcuadratica: en teoria mas eficiente que BERT clasico para secuencias largas, aunque el modelo no esta validado para contextos extensos.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo thinking.
- Capacidad multilingue: no disponible (solo ingles).
- No es un modelo generativo: no produce texto, solo logits de clasificacion.

## Casos de uso

- Clasificacion de sentimiento en resenas de producto en ingles: el modelo devuelve directamente la polaridad (0/1) con una precision del 92,09 % en SST-2, adecuado para pipelines de analisis de opinion a bajo coste.
- Filtrado de comentarios en foros y redes: al ser un clasificador binario ligero (~55 MB de pesos descargables), puede desplegarse en servicios de moderacion que solo necesitan separar tono positivo de negativo.
- Baseline de investigacion en eficiencia de atencion: sirve como punto de comparacion reproducible para evaluar mecanismos subcuadraticos frente a atencion softmax en tareas GLUE.
- Experimentos de destilacion de conocimiento: el protocolo de destilacion con representaciones cacheadas documentado permite replicar el entrenamiento en una unica GPU de 24 GB en menos de un minuto.
- Prototipado academico de clasificadores BERT modificados: util para validar la integracion de la libreria NeuralOps en flujos de Hugging Face con `trust_remote_code`.
- Analisis de sentimiento por lotes en entornos con VRAM limitada: al no recargar los 450 MB del BERT base en el repo, la descarga e inicializacion son rapidas, lo que facilita pruebas en CI o notebooks.
- No es adecuado para clasificacion multilingue, para tareas generativas ni para contextos largos no validados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de validacion de GLUE SST-2 (872 muestras):

| Metrica | Teacher (`bert-base-uncased`) | Student pre-KD (`hymba_transx`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,40 % | 92,09 % | +0,69 % |
| Cross-entropy de validacion | 0,2428 | no calibrado | 0,2843 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB): duracion 50,4 s, 124 pasos, throughput 20.144,7 tokens/s, pico de VRAM 11.964 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo base BERT-base en FP16 ocupa ~220 MB y los pesos de atencion publicados ~55 MB. En la practica, cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en una RTX 3090 (24 GB) con pico de 11.964 MB, pero la inferencia no requiere ese nivel. A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en RTX 3060, RTX 4060, RTX 4090, etc., e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la libreria `neuralops`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (el modelo no es generativo y su codigo remoto es especifico de NeuralOps).
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta throughput de entrenamiento (20.144,7 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc. | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-hymba-transx-sst2` | 110 M (base) + atencion subcuadratica | no disponible | 92,09 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (teacher) | 110 M | 512 tokens | 91,63 % (segun la card) | Apache 2.0 | Hugging Face, transformers estandar |
| `textattack/bert-base-uncased-SST-2` (referencia habitual) | 110 M | 512 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face, transformers estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion | Apache 2.0 | Hugging Face, transformers estandar |

La comparativa se limita a la precision reportada por el autor; no hay datos de benchmarks cruzados ni mediciones independientes que permitan validar la ventaja subcuadratica en latencia real.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, a pesar de que BERT-base subyacente es multilingue en origen.
- Tarea unica: clasificacion binaria de sentimiento; no genera texto ni resuelve otras tareas GLUE.
- Requiere `trust_remote_code=True` y la libreria `neuralops`, lo que introduce dependencia de codigo de terceros y riesgo de ejecucion remota en produccion.
- Pesos modulares: el repo no contiene el cuerpo BERT completo; la carga depende de descargar `bert-base-uncased` por separado y de que el shim funcione correctamente.
- Riesgo de alucinacion no aplica (no es generativo), pero puede haber sesgos heredados del corpus de BERT y de SST-2 (resenas de cine en ingles, dominio acotado).
- Precision reportada por el propio autor sin validacion independiente; el delta de +0,69 pp sobre el teacher esta dentro del ruido estadistico de 872 muestras.
- Sin datos de robustez fuera de dominio, contextos largos ni cuantizaciones alternativas.
- Licencia MIT permite uso comercial, pero el codigo remoto y la libreria NeuralOps deben revisarse por separado.
- Cero descargas y cero likes en el momento de la ficha: modelo de investigacion sin adopcion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-hymba-transx-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Citacion (BibTeX): `@software{neuralops2026bertzoo, title = {NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark}, author = {Majlesi, Taha}, year = {2026}, url = {https://github.com/tahamajs/NeuralOps}}`

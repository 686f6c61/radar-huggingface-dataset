# tahamajs/bert-minimal-nova-sst2

## Resumen

`tahamajs/bert-minimal-nova-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las 12 capas de atencion softmax cuadratica del transformer original han sido sustituidas por el mecanismo `minimal_nova`, desarrollado dentro de la libreria NeuralOps. El autor es Taha Majlesi y el modelo se publica como pieza del "Subquadratic Attention Zoo" de NeuralOps, un esfuerzo por ofrecer variantes de atencion subcuadratica (complejidad efectiva O(N) u O(N log N)) sobre arquitecturas BERT estandar, manteniendo el resto de la red congelada.

El checkpoint se ha afinado y destilado especificamente para la tarea SST-2 del benchmark GLUE (clasificacion binaria de sentimiento en ingles), partiendo de un estudiante `minimal_nova` que sin destilacion rendia un 51,38% de accuracy y que tras el protocolo de destilacion por representaciones cacheado de NeuralOps alcanza un 90,02%, frente al 91,63% del profesor `bert-base-uncased`. La relevancia actual del modelo es doble: por un lado demuestra que es posible recuperar casi por completo el rendimiento del profesor sustituyendo la atencion cuadratica por una alternativa lineal, y por otro introduce un formato de serializacion modular ("attention-only") que reduce el peso descargable a unos 55 MB en FP16.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamano total del repo es de 0,4 GB y la licencia es MIT. La libreria declarada es `neuralops` (no `transformers` nativo), por lo que la carga requiere `trust_remote_code=True` o el uso del API de carga modular de NeuralOps.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `minimal_nova` (subcuadratica) en las 12 capas |
| Parametros totales | 110 M (base BERT-base) + cabeza de clasificacion; solo se serializan los pesos de atencion y la cabeza (~55 MB FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens, pero la model card no lo declara explicitamente para esta variante) |
| Tipos de cuantizacion | pesos publicados en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion + cabeza de tarea); el resto de pesos se inicializan desde `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT-base de 12 capas en el que cada bloque de atencion multi-cabeza softmax (O(N^2)) se reemplaza por el mecanismo `minimal_nova` de NeuralOps, con complejidad efectiva O(N) u O(N log N). El resto de la red (embeddings, feed-forward, normalizaciones) permanece congelado desde `bert-base-uncased`. El modelo se serializa en formato "attention-only": el repo solo contiene `attention_weights.safetensors` (~55 MB en FP16) con los pesos de atencion destilados y la cabeza de clasificacion; el shim remoto `modeling_neuralops_bert.py` reconstruye el modelo completo inicializando los pesos base desde `bert-base-uncased` y aplicando encima los parametros de atencion.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", un esquema en dos etapas (Stage 1: alineamiento de subespacio oculto; Stage 2: KL de logits + cross-entropy de tarea) que cachea offline las representaciones del profesor para no reservar VRAM del profesor durante el entrenamiento. Se ejecuto fisicamente en una NVIDIA GeForce RTX 3090 de 24 GB (clúster HPC de Sharif), con 268 pasos de optimizacion, 49,8 s de duracion total, throughput efectivo de 44.098,4 tokens/s y un pico de VRAM de 23.021 MB. El dataset de evaluacion y ajuste es SST-2 (split de validacion de 872 muestras binarias) dentro de GLUE. No se documentan el numero total de tokens de entrenamiento ni la composicion completa del dataset mas alla de SST-2.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (positivo/negativo) sobre texto corto, entrenada especificamente para SST-2.
- Razonamiento linguistico limitado al encoder BERT-base subyacente: representaciones contextuales de hasta 512 tokens (heredadas del modelo base, no confirmadas en la model card para esta variante).
- No soporta generacion de texto: es un modelo encoder-only con cabeza de clasificacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no, solo ingles.
- No dispone de modo "thinking", vision ni audio.
- La innovacion funcional es la atencion subcuadratica `minimal_nova`, que reduce el coste computacional asintotico frente a MHA estandar.

## Casos de uso

- Clasificacion de sentimiento en resenas de producto o resenas de peliculas en ingles: el modelo esta afinado directamente sobre SST-2, por lo que es adecuado como clasificador listo para usar en entornos con dominios similares (critica cinematografica, opiniones cortas).
- Moderacion de comentarios y filtrado de toxicidad en ingles: al ser un encoder rapido y ligero (~55 MB descargables), puede desplegarse en pipelines de preprocesado que necesiten clasificar grandes volumenes de texto corto con baja latencia.
- Enrutamiento de tickets de soporte: usar la salida de sentimiento como senal auxiliar para priorizar tickets negativos en un sistema de atencion al cliente, combinado con otras senales.
- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para comparar `minimal_nova` frente a MHA estandar en GLUE SST-2, con el protocolo de destilacion documentado y los hiperparametros de entrenamiento publicados.
- Benchmark de destilacion: util para validar implementaciones del "Cached Representation Distillation Protocol" de NeuralOps, ya que la model card publica la curva pre-KD (51,38%) vs post-KD (90,02%) y las metricas de cross-entropy.
- Experimentos de eficiencia en hardware consumer: al ejecutarse en una RTX 3090 y con un footprint de pesos reducido, es un banco de pruebas asequible para medir el ahorro de memoria y computo de la atencion lineal en tareas de clasificacion.
- Fine-tuning ligero sobre dominios propios: al ser un checkpoint con licencia MIT y pesos de atencion modulares, puede adaptarse a otras tareas de clasificacion de frases en ingles reemplazando solo la cabeza.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`minimal_nova`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63% | 51,38% | 90,02% | +38,65 pp |
| Cross-entropy de validacion | 0,2428 | no calibrado | 0,3186 | convergido |

Telemetria de entrenamiento (RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 49,8 s |
| Pasos de optimizacion | 268 |
| Throughput efectivo | 44.098,4 tokens/s |
| Pico de VRAM | 23.021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo completo (BERT-base de 110 M parametros) en FP16 ocupa aproximadamente 220 MB de pesos, mas activaciones. El repo descargable es de ~55 MB porque solo contiene los pesos de atencion y la cabeza.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP16; el autor documento el entrenamiento en una NVIDIA GeForce RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida para el modelo base.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (via `AutoModelForSequenceClassification`), o el API modular de NeuralOps (`neuralops.hub.bert_zoo.load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta 44.098,4 tokens/s durante el entrenamiento en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-minimal-nova-sst2` | 110 M (solo atencion serializada, ~55 MB) | no disponible | 90,02% | MIT | Hugging Face, libreria `neuralops` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63% | Apache 2.0 | Hugging Face, `transformers` |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, `transformers` |

La comparativa con `distilbert` y `textattack/bert-base-uncased-SST-2` se incluye por categoria (clasificacion SST-2 en ingles) pero sus cifras exactas de accuracy no estan en la informacion proporcionada; no se inventan.

## Limitaciones y advertencias

- El modelo solo esta entrenado y evaluado en SST-2 (ingles, frases cortas); su generalizacion a otros dominios o idiomas no esta documentada.
- El estudiante destilado queda 1,61 puntos por debajo del profesor en accuracy (90,02% vs 91,63%), por lo que en produccion con requisitos estrictos de precision puede ser preferible el modelo base.
- La cross-entropy de validacion del estudiante (0,3186) es superior a la del profesor (0,2428), lo que indica una calibracion peor de las probabilidades; conviene recalibrar si se usan scores como confianza.
- No se documentan sesgos especificos, pero al heredar el encoder de `bert-base-uncased` arrastra los sesgos del corpus original de BERT (texto web en ingles, predominantemente estadounidense).
- Riesgo de alucinacion: no aplica en el sentido generativo (es un encoder de clasificacion), pero si puede producir clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- La carga requiere `trust_remote_code=True` o el API de NeuralOps, lo que implica ejecutar codigo remoto del autor; conviene revisar `modeling_neuralops_bert.py` antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` se distribuye bajo Apache 2.0; conviene verificar el cumplimiento de ambas licencias en un despliegue comercial.
- El repo tiene 0 descargas y 0 likes, y la fecha de creacion es 2026-11-09; se trata de un checkpoint muy reciente y sin validacion independiente por parte de la comunidad.
- El modelo depende de la disponibilidad de `bert-base-uncased` en el Hub: si se retira o cambia, la reconstruccion del checkpoint fallara.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-minimal-nova-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

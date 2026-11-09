# tahamajs/bert-moba-attention-sst2

## Resumen

`tahamajs/bert-moba-attention-sst2` es un checkpoint de BERT-base (110M parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `moba_attention` de la libreria NeuralOps, con complejidad efectiva subcuadratica (O(N) u O(N log N)) frente a la O(N^2) de la multi-head attention clasica. El modelo se ha afinado y destilado sobre la tarea SST-2 del benchmark GLUE para clasificacion binaria de sentimiento en ingles.

El checkpoint sigue una serializacion modular "attention-only": el repositorio solo contiene los pesos de atencion destilados y la cabeza de clasificacion en FP16 (`attention_weights.safetensors`, unos 55 MB), mientras que los pesos congelados de BERT-base se reconstruyen en tiempo de carga desde `google-bert/bert-base-uncased`. Esto reduce drasticamente el footprint de descarga frente a los ~450 MB del modelo base completo.

Es relevante como prueba de concepto de un zoo de atenciones subcuadraticas sobre BERT: demuestra que se puede reemplazar la atencion cuadratica y recuperar (o incluso superar ligeramente) la precision del profesor mediante destilacion por representaciones cacheted, con un coste de entrenamiento muy bajo (150 pasos, 48,8 s en una RTX 3090). El modelo es de noviembre de 2026, con cero descargas y cero likes en el momento de la ficha, por lo que debe tratarse como material de investigacion incipiente y no como un clasificador de produccion consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atencion `moba_attention` subcuadratica en las 12 capas |
| Parametros totales | 110M (BERT-base); el repositorio solo serializa los pesos de atencion y la cabeza de clasificacion (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, tipicamente 512 tokens; el autor no lo declara explicitamente) |
| Tipos de cuantizacion | FP16 (formato `attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atencion y cabeza); pesos base reconstruidos desde `bert-base-uncased` |
| Libreria | `neuralops` (requiere `trust_remote_code=True` en Transformers) |
| Tamano del repo | 0.5 GB |
| Pipeline | `text-classification` (2 clases: negativo/positivo) |
| Dataset de evaluacion | GLUE SST-2 (872 muestras de validacion) |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base encoder-only de 12 capas en el que la atencion multi-head estandar se reemplaza por `moba_attention`, un mecanismo de atencion subcuadratica con complejidad operativa efectiva O(N) u O(N log N). El resto de la pila (embeddings, feed-forward, normalizacion) permanece congelado desde `bert-base-uncased`; solo se entrenan y serializan los parametros de atencion y la cabeza de clasificacion de SST-2.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una destilacion en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits mas entropia cruzada de tarea) con representaciones del profesor cacheadas offline, de forma que no se reserva VRAM para el profesor durante el entrenamiento. Se ejecuto en una NVIDIA GeForce RTX 3090 de 24 GB: 150 pasos de optimizacion, 48,8 s de duracion, throughput efectivo de 25 176,1 tokens/s y pico de VRAM de 23 021 MB. No se documentan el volumen de tokens de entrenamiento ni la composicion del dataset mas alla de GLUE/SST-2.

## Capacidades

- Clasificacion binaria de sentimiento en ingles (SST-2): salida de 2 clases (0 = negativo, 1 = positivo).
- Comprension de secuencias a nivel de frase/oracion propia de BERT-base afinado.
- Atencion subcuadratica: coste de atencion menor que la MHA cuadratica para secuencias largas, aunque el autor no cuantifica ganancias de latencia ni de memoria.
- Carga modular via API `neuralops.hub.bert_zoo.load_pretrained_bert` o via `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- No se documentan tool calling, function calling, capacidades de agente, multi-step reasoning, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el modelo esta restringido a ingles.

## Casos de uso

- Analisis de sentimiento de resenas de producto en ingles: clasificador ligero de 2 clases que se puede desplegar sobre BERT-base con pesos de atencion de solo ~55 MB, util para enriquecer catalogos o dashboards de opinion.
- Moderacion de comentarios y foros: filtrado de polaridad negativa en texto corto en ingles, con inferencia barata en CPU o GPU consumer.
- Enrutado de tickets de soporte: clasificar el tono de mensajes de clientes para priorizar casos negativos antes de la atencion humana.
- Investigacion sobre atenciones subcuadraticas: banco de pruebas reproducible para comparar `moba_attention` frente a MHA estandar en tareas GLUE, con receta de destilacion documentada.
- Experimentos de destilacion eficiente: servir como referencia del protocolo de representaciones cacheadas (cero VRAM de profesor) para replicar el flujo en otras tareas o modelos.
- Prototipado de pipelines de clasificacion con `transformers`: integracion directa en scripts de evaluacion y notebooks gracias a la API estandar `AutoModelForSequenceClassification`.
- Benchmarking de despliegue modular: medir el coste real de reconstruir los pesos base desde el hub y aplicar los pesos de atencion en tiempo de carga en entornos con ancho de banda limitado.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias), segun la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`moba_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Precision GLUE SST-2 | 91,63% | 91,63% | 91,97% | +0,34% |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,2893 | convergida |

Telemetria de entrenamiento (cluster HPC Sharif, RTX 3090 24 GB): 48,8 s, 150 pasos, 25 176,1 tokens/s, pico de VRAM 23 021 MB.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de BERT-base (110M) con pesos de atencion en FP16, la huella es muy reducida (del orden de cientos de MB en FP16, incluyendo la reconstruccion del base congelado).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor cita una RTX 3090 (24 GB) para el entrenamiento, no para inferencia.
- Cabe en GPU consumer: si, con amplio margen (GTX 16xx, RTX 20xx/30xx/40xx).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere la libreria `neuralops`); la API `neuralops.hub.bert_zoo`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se publica throughput de entrenamiento (25 176,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-moba-attention-sst2` | 110M (BERT-base) | no disponible (heredado de BERT-base) | 91,97% | MIT | Hugging Face, libreria `neuralops`, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110M | 512 tokens | 91,63% (segun la model card) | Apache 2.0 | Hugging Face, `transformers` estandar |
| `textattack/bert-base-uncased-SST-2` (referencia de la comunidad) | 110M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estandar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estandar |

La comparativa se limita a modelos BERT de la misma categoria; no se dispone de resultados de benchmarks de las alternativas en la informacion proporcionada, por lo que solo se contrastan parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo ingles: el modelo esta entrenado y evaluado exclusivamente en ingles; no se garantiza comportamiento en otros idiomas.
- Tarea unica: clasificacion binaria de sentimiento SST-2; no es un modelo generativo ni sirve para otras tareas GLUE sin reentrenamiento.
- Riesgo de alucinacion: bajo en sentido estricto (no genera texto), pero puede producir clasificaciones erroneas o sobreconfiadas en dominios distintos de SST-2.
- Sesgos: no documentados por el autor; al heredar representaciones de `bert-base-uncased`, puede arrastrar sesgos del corpus original.
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y la libreria `neuralops`; la reconstruccion de pesos base desde el hub introduce dependencia de red y de versiones.
- Madurez: checkpoint de noviembre de 2026 con cero descargas y cero likes; sin validacion externa ni resultados de benchmarks mas alla de SST-2.
- Licencia MIT: permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y la del codigo remoto deben verificarse por separado.
- La model card no documenta el volumen de tokens de entrenamiento, la composicion del dataset ni la longitud de contexto efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-moba-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2

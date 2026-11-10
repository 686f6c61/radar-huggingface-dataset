# tahamajs/bert-routing-attention-sst2

## Resumen

`tahamajs/bert-routing-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática originales se han sustituido por el mecanismo `routing_attention` de la librería NeuralOps, con complejidad operativa efectiva O(N) u O(N log N) en lugar de O(N²). Lo desarrolla Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un "attention zoo" que publica variantes de atención subcuadrática sobre arquitecturas BERT preentrenadas. El modelo resuelve una tarea concreta: clasificación binaria de sentimiento sobre GLUE SST-2, y su interés es fundamentalmente metodológico, ya que demuestra el protocolo de destilación de representaciones en caché (Cached Representation Distillation) de NeuralOps sobre una GPU de consumo.

El repositorio no contiene los pesos completos del modelo base (unos 450 MB en FP32), sino únicamente los parámetros de atención destilados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, aproximadamente 55 MB). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo inicializando los pesos congelados desde `bert-base-uncased` y aplicando encima los parámetros de atención destilados. El entrenamiento se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB en 55 segundos y 83 pasos de optimización, con un pico de VRAM de 8657 MB y un throughput de 12 352,9 tokens por segundo.

La relevancia actual del checkpoint es limitada como modelo de producción (su accuracy en SST-2 es de 76,15 %, muy por debajo del 91,63 % del profesor BERT-base), pero es un artefacto útil para investigar atención subcuadrática, destilación eficiente en memoria y serialización modular de pesos de atención. La licencia MIT y el soporte de `trust_remote_code` facilitan su reproducción y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `routing_attention` (subcuadrática, O(N) u O(N log N)) en las 12 capas, en lugar de MHA softmax cuadrática |
| Parametros totales | 110 M (base BERT-base); el repositorio solo publica los pesos de atención y la cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la de `bert-base-uncased`, 512 tokens, aunque no se explicita en la model card) |
| Tipos de cuantizacion | FP16 para los pesos de atención publicados; no se documentan otras cuantizaciones (GGUF, INT8, etc.) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB); requiere `trust_remote_code=True` y la librería `neuralops` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 dimensiones ocultas, 110 M de parámetros) y reemplaza en todas las capas el bloque de atención multi-cabeza estándar por `routing_attention`, un mecanismo de atención subcuadrática de la librería NeuralOps. La model card declara complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la MHA clásica, aunque no se detalla el algoritmo interno de enrutamiento ni el número de cabezas o patrones de dispersión utilizados. Los pesos base de BERT permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que se serializan de forma modular.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation en dos etapas: primero una alineación de subespacio oculto (Stage 1 Subspace Hidden Alignment) y después una combinación de KL sobre logits y entropía cruzada de la tarea (Stage 2 Logit KL + Task CE). La destilación usa representaciones del profesor cacheadas offline, de modo que no se asigna VRAM al profesor durante el entrenamiento ("zero teacher VRAM"). Se ejecutó en una RTX 3090 de 24 GB, con 83 pasos de optimización, 55 segundos de duración, 12 352,9 tokens/s de throughput efectivo y 8657 MB de VRAM pico, sobre el split de entrenamiento de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con salida de logits vía `AutoModelForSequenceClassification`.
- Inferencia con la API estándar de Hugging Face Transformers usando `trust_remote_code=True`, o mediante la API de alto nivel `neuralops.hub.bert_zoo.load_pretrained_bert`.
- Reconstrucción modular: carga únicamente los pesos de atención destilados sobre el BERT-base congelado, sin descargar los 450 MB completos del modelo base en el repositorio.
- Capacidad de servir como banco de pruebas para comparar atención subcuadrática frente a atención cuadrática en una tarea GLUE concreta.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; es un clasificador de secuencia, no un modelo generativo.
- Multilingüismo: solo inglés; no se documentan capacidades en otros idiomas.

## Casos de uso

- Investigación en atención subcuadrática: usar el checkpoint como referencia reproducible para medir el coste/beneficio de `routing_attention` frente a MHA estándar en SST-2, con la ventaja de que el entrenamiento completo cabe en una RTX 3090 y dura menos de un minuto.
- Análisis de sentimiento en inglés a pequeña escala: clasificación de reseñas o comentarios binarios donde no se requiera la precisión de un BERT-base completo y se priorice un footprint de pesos reducido (~55 MB más el base congelado).
- Destilación eficiente en memoria: servir de ejemplo práctico del protocolo Cached Representation Distillation de NeuralOps para equipos que quieran destilar modelos sin mantener el profesor en VRAM.
- Serialización modular de pesos: estudiar el patrón de publicar solo los parámetros de atención y la cabeza de tarea, útil para pipelines de investigación que versionan variantes de atención sobre un mismo backbone.
- Benchmarking de latencia y memoria: comparar el consumo de VRAM y el throughput de `routing_attention` frente a MHA en GPUs de consumo (RTX 3090, 4090) para tareas de clasificación corta.
- Docencia y reproducción: material didáctico para explicar destilación por alineación de representaciones y logits, dado el bajo coste computacional y la licencia MIT.
- Filtrado de datos en pipelines de NLP: clasificador ligero de polaridad para preetiquetar o filtrar corpus en inglés antes de un modelo mayor, aceptando el menor accuracy.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`routing_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 50,92 % | 76,15 % | +25,23 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,5551 | Convergido |

Telemetría de entrenamiento (clúster Sharif HPC):

| Métrica | Valor |
|---|---|
| GPU física | NVIDIA GeForce RTX 3090 24 GB (Ampere, Tensor Cores) |
| Duración del entrenamiento | 55,0 s |
| Pasos de optimización | 83 |
| Throughput efectivo | 12 352,9 tokens/s |
| VRAM pico | 8657 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otras tareas GLUE) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio publica ~55 MB de pesos de atención en FP16, pero la reconstrucción carga el BERT-base congelado (~110 M de parámetros, ~440 MB en FP32 o ~220 MB en FP16), por lo que el consumo real ronda 1-2 GB incluyendo activaciones y tokenizer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento documentado se ejecutó en una RTX 3090 de 24 GB con 8657 MB de pico.
- Cabe en GPU de consumo: sí, en RTX 3060, 3070, 3080, 3090, 4060, 4070, 4080, 4090 y equivalentes; también en GPUs de portátil con 6 GB o más.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y la librería `neuralops`; la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: solo se documenta el throughput de entrenamiento (12 352,9 tokens/s en RTX 3090); no se publican cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-routing-attention-sst2` | 110 M (base) + atención destilada | No disponible (hereda BERT-base) | 76,15 % | MIT | Hugging Face, requiere `neuralops` y `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del propio autor) | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | No disponible en esta información | Apache 2.0 | Hugging Face, Transformers estándar |
| Variantes de atención eficiente sobre BERT (p. ej. Longformer, BigBird) | 110-150 M | 4096 tokens o más | No disponible en esta información | Apache 2.0 | Hugging Face, Transformers estándar |

La comparativa se limita a los datos disponibles; no se han encontrado en la información proporcionada resultados de benchmarks de las alternativas que permitan una comparación numérica homogénea más allá del profesor BERT-base.

## Limitaciones y advertencias

- Precisión muy inferior al profesor: 76,15 % frente a 91,63 % en SST-2, una caída de 15,48 puntos porcentuales; no es adecuado para producción que requiera calidad cercana a BERT-base.
- El estudiante pre-destilación rinde al nivel del azar (50,92 %), lo que indica que la mayor parte de la capacidad proviene de la destilación y no de la inicialización de la atención.
- Solo inglés y solo clasificación binaria de sentimiento; no es un modelo generativo ni soporta instrucciones, tool calling ni agentes.
- Dependencia de código remoto: requiere `trust_remote_code=True` y la librería `neuralops`, lo que añade superficie de riesgo y acoplamiento a un proyecto de autor único.
- La model card no documenta sesgos, composición del dataset más allá de GLUE SST-2, ni evaluación de robustez o alucinación (no aplica al ser clasificador, pero sí la calibración: entropía cruzada de 0,5551 es alta).
- No se publican pesos completos ni formatos GGUF/ONNX; el despliegue está limitado al ecosistema Transformers + NeuralOps.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` es Apache 2.0 y el código remoto debe auditarse antes de integrarlo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; madurez y mantenimiento no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-routing-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue
- Paper de BERT: https://arxiv.org/abs/1810.04805
- No se han encontrado en la información proporcionada papers, blogs, demos ni otros repositorios adicionales específicos de este checkpoint.

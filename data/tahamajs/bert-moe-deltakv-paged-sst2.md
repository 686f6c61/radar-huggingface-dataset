# tahamajs/bert-moe-deltakv-paged-sst2

## Resumen

`tahamajs/bert-moe-deltakv-paged-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased`, publicado por el autor independiente Taha Majlesi (tahamajs) dentro del proyecto NeuralOps. El modelo sustituye los bloques de atención softmax cuadrática de las 12 capas del transformer BERT original por un mecanismo denominado `moe_deltakv_paged`, que combina mezcla de expertos con una variante de atención delta-KV paginada y reduce la complejidad operativa de O(N²) a O(N) u O(N log N). El resultado es un encoder BERT de 110 millones de parámetros con atención subcuadrática, ajustado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE.

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible destilar las representaciones de un transformer estándar hacia una arquitectura de atención alternativa manteniendo una precisión competitiva. Según la model card, el estudiante destilado alcanza un 90,14 % de accuracy en la partición de validación de SST-2, frente al 91,63 % del profesor BERT-base original y al 85,67 % del estudiante antes de la destilación. El proceso completo de destilación se ejecutó en una única NVIDIA RTX 3090 en 55,5 segundos y 107 pasos de optimización.

El checkpoint se distribuye de forma modular: solo se publican los pesos de atención y la cabeza de clasificación en FP16 (aproximadamente 55 MB), mientras que los pesos congelados del BERT base se reconstruyen en tiempo de carga desde el repositorio original. Está pensado como pieza de investigación y evaluación de mecanismos de atención eficientes, no como un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `moe_deltakv_paged` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parámetros totales | 110 M (heredados de BERT-base); el repo publica solo los pesos de atención y la cabeza de clasificación |
| Parámetros activos | no disponible (el tag `moe` sugiere mezcla de expertos, pero no se especifica el número de expertos ni los parámetros activos) |
| Longitud de contexto | no disponible (BERT-base soporta 512 tokens, pero la model card no lo declara explícitamente para esta variante) |
| Tipos de cuantización | no disponible (los pesos se publican en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB); requiere `trust_remote_code=True` con el shim `modeling_neuralops_bert.py` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 768 de dimensión oculta, 12 cabezas de atención, 110 M de parámetros) y reemplaza la atención multi-cabeza estándar por el mecanismo `moe_deltakv_paged` de la librería NeuralOps. La model card describe la complejidad efectiva como O(N) u O(N log N) frente a la O(N²) de la atención softmax convencional, aunque no detalla la formulación interna del mecanismo ni el número de expertos del componente MoE. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, un esquema de destilación en dos etapas: primero una alineación de subespacio de representaciones ocultas y después una combinación de divergencia KL sobre logits y entropía cruzada sobre la tarea. La destilación usa caché offline de representaciones del profesor, de modo que no se reserva VRAM para el modelo profesor durante el ajuste. Se ejecutó en una RTX 3090 de 24 GB (clúster HPC Sharif), con un pico de 23 021 MB de VRAM, 107 pasos de optimización, 55,5 segundos de duración y un throughput efectivo de 15 801,5 tokens por segundo. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, especializada en la tarea SST-2 de GLUE.
- Codificación de secuencias de texto con atención subcuadrática, lo que reduce el coste computacional en secuencias largas frente a BERT estándar.
- Reutilización del tokenizador y del vocabulario de `bert-base-uncased`.
- Integración con `AutoModelForSequenceClassification` de Hugging Face Transformers mediante `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo sobre los pesos congelados de BERT base.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modos de pensamiento explícito.
- No se documentan capacidades multilingües: el modelo está entrenado y evaluado solo en inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa con una accuracy del 90,14 % en SST-2, suficiente para monitorización de reputación o análisis de opinión a escala.
- Moderación de comentarios y filtrado de toxicidad como señal auxiliar: puede usarse como clasificador de polaridad previo a un sistema de moderación más complejo, aprovechando su bajo coste de inferencia.
- Investigación en mecanismos de atención eficientes: sirve como punto de comparación reproducible para evaluar `moe_deltakv_paged` frente a atención softmax en tareas de clasificación, con métricas y telemetría de entrenamiento publicadas.
- Destilación y compresión de modelos: el protocolo NeuralOps documentado (caché offline de representaciones, dos etapas) puede replicarse sobre otros encoders para estudiar la transferencia de conocimiento hacia arquitecturas subcuadráticas.
- Clasificación de sentimiento en pipelines de análisis de redes sociales o encuestas: al ser un encoder de 110 M de parámetros con pesos de atención de 55 MB, se puede desplegar en infraestructura modesta para procesar lotes de textos cortos.
- Docencia y experimentación con arquitecturas híbridas MoE + atención lineal: el checkpoint modular permite cargar solo los pesos de atención sobre BERT base y estudiar el efecto del mecanismo sin reentrenar el encoder completo.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-destilación | Estudiante post-destilación | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 85,67 % | 90,14 % | +4,47 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3309 | convergido |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 55,5 s |
| Pasos de optimización | 107 (etapa 1: alineación de subespacio oculto; etapa 2: KL sobre logits + CE de tarea) |
| Throughput efectivo | 15 801,5 tokens/s |
| VRAM pico | 23 021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con los pesos base de BERT-base en FP32 (unos 440 MB) más los pesos de atención en FP16 (55 MB), el modelo completo ocupa del orden de 0,5 GB en memoria, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP32; el entrenamiento documentado se realizó en una NVIDIA RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (requiere el shim `modeling_neuralops_bert.py`); la API `neuralops.hub.bert_zoo` de la librería NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo se documenta el throughput de entrenamiento (15 801,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-moe-deltakv-paged-sst2` | 110 M (atención + cabeza publicadas) | no disponible | 90,14 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tuned en SST-2) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, Transformers estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face, Transformers estándar |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face, Transformers estándar |

La comparativa se limita a la referencia del profesor publicada en la propia model card; no se dispone de resultados verificables de los otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado exclusivamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Es un clasificador binario de sentimiento específico de SST-2: no es un modelo de propósito general y no debe usarse para generación, razonamiento ni otras tareas sin un ajuste previo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en dominios alejados de SST-2 (por ejemplo, texto técnico, ironía o sentimiento mixto).
- La model card no documenta sesgos conocidos ni evaluación de sesgo; al derivar de BERT-base, puede heredar sesgos presentes en los datos de preentrenamiento de este.
- El checkpoint no incluye los pesos completos de BERT: requiere descargar `bert-base-uncased` desde Hugging Face y ejecutar código remoto (`trust_remote_code=True`), lo que introduce una dependencia de seguridad y de red en producción.
- La licencia MIT del repositorio no exime de las condiciones de la licencia Apache 2.0 del modelo base `bert-base-uncased`, que debe respetarse al redistribuir o desplegar.
- No se documentan cuantizaciones oficiales (GGUF, INT8, INT4), por lo que el despliegue en entornos con restricciones de memoria debe validarse manualmente.
- La model card no especifica la longitud de contexto efectiva del mecanismo `moe_deltakv_paged` ni el número de expertos; conviene validar el comportamiento en secuencias cercanas a 512 tokens antes de usarlo en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado evaluaciones independientes que reproduzcan los resultados declarados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-moe-deltakv-paged-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base BERT: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

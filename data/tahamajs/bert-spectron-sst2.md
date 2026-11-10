# tahamajs/bert-spectron-sst2

## Resumen

bert-spectron-sst2 es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que el autor, Taha Majlesi, ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `spectron`, una atención subcuadrática (complejidad efectiva O(N) u O(N log N)) implementada en la librería NeuralOps. El modelo se ha ajustado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación de representaciones en caché (NeuralOps Cached Representation Distillation Protocol), con el objetivo de recuperar parte de la precisión perdida al cambiar el mecanismo de atención.

El resultado es un clasificador binario de sentimiento en inglés que alcanza un 88,76 % de accuracy en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor original y al 72,48 % del estudiante antes de la destilación, lo que supone una mejora de 16,28 puntos porcentuales tras el proceso de KD. La relevancia del artefacto es fundamentalmente metodológica: demuestra que es posible sustituir la atención cuadrática por una alternativa subcuadrática en un BERT-Base completo y recuperar competitividad en una tarea concreta con un coste de entrenamiento muy reducido (51,6 segundos y 256 pasos en una RTX 3090).

El repositorio no publica los pesos completos, sino únicamente los parámetros de atención destilados y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB), que se aplican en tiempo de carga sobre los pesos congelados de `bert-base-uncased`. El modelo está pensado para experimentación con atención eficiente, no como sustituto directo de BERT-Base en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `spectron` subcuadrática en las 12 capas |
| Parametros totales | 110 M (base BERT-Base) más los parámetros de atención destilados; el repo solo almacena estos últimos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 512 tokens; la model card no especifica el contexto efectivo con `spectron`) |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (atención y cabeza de clasificación en FP16, ~55 MB) con código remoto `modeling_neuralops_bert.py` |
| Libreria | `neuralops` |
| Tarea | `text-classification` (clasificación binaria de sentimiento) |
| Modelo base | `google-bert/bert-base-uncased` |
| Dataset de evaluación | GLUE / SST-2 |
| Tamano del repo | 0,0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de BERT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas, ~110 M de parámetros) y reemplaza la atención multi-cabeza softmax estándar por el mecanismo `spectron`, que reduce la complejidad operativa de O(N²) a O(N) u O(N log N) según la model card. No se detalla en la información disponible la formulación matemática exacta de `spectron` ni si combina componentes lineales con aproximaciones tipo kernel o de bajo rango; solo se indica que pertenece al catálogo "Subquadratic Attention Zoo" de NeuralOps.

El entrenamiento se realizó con el protocolo de destilación de representaciones en caché de NeuralOps, que evita reservar VRAM para el profesor mediante el almacenamiento offline de representaciones. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 256 pasos de optimización divididos en dos etapas: alineación de subespacio oculto y, después, KL sobre logits más entropía cruzada de la tarea. La duración total fue de 51,6 segundos, con un throughput efectivo de 40.658,2 tokens/s y un pico de VRAM de 7.673 MB. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset más allá de SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de entrada.
- Inferencia compatible con `AutoModelForSequenceClassification` de Hugging Face mediante `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo aplicando solo los pesos de atención destilados sobre el BERT base congelado.
- Aprovechamiento de atención subcuadrática, lo que en teoría permite procesar secuencias largas con menor coste que la atención cuadrática, aunque no se documentan resultados a contextos superiores a los de SST-2.
- No se documentan capacidades de generación, razonamiento, código, matemáticas, tool calling, agentes, visión ni audio: es un clasificador de secuencia, no un modelo generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Clasificación de sentimiento en reseñas o comentarios en inglés: el modelo está ajustado específicamente sobre SST-2 y puede emplearse para etiquetar polaridad positiva/negativa en textos cortos con un accuracy de referencia del 88,76 % en validación.
- Investigación en atención eficiente: sirve como punto de partida reproducible para comparar mecanismos subcuadráticos frente a atención softmax en tareas de comprensión, dado que el checkpoint es ligero (~55 MB) y el protocolo de destilación está documentado.
- Prototipado rápido de pipelines de clasificación: al cargarse sobre `bert-base-uncased` con código remoto, permite integrarse en experimentos de Hugging Face sin reentrenar desde cero.
- Destilación de bajo coste en hardware de consumo: el entrenamiento documentado cabe en una RTX 3090 con 7,7 GB de pico de VRAM, por lo que es replicable en entornos académicos con una sola GPU.
- Moderación de contenido o filtrado de opiniones a pequeña escala: como clasificador binario ligero, puede usarse para triaje previo de textos antes de modelos mayores.
- Benchmarking de la librería NeuralOps: útil para validar la API `bert_zoo` y el formato `attention_only_fp16` en pipelines internos de investigación.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante `spectron` pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 72,48 % | 88,76 % |
| Entropía cruzada de validación | 0,2428 | No calibrada | 0,3225 |
| Delta de accuracy | — | — | +16,28 pp |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Métrica | Valor |
|---|---|
| Duración total | 51,6 s |
| Pasos de optimización | 256 |
| Throughput efectivo | 40.658,2 tokens/s |
| Pico de VRAM | 7.673 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo requiere cargar BERT-Base (~110 M de parámetros) más los pesos de atención en FP16; en FP32 son aproximadamente 450 MB de pesos, y en FP16 alrededor de 220-250 MB. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: RTX 3090 (la usada en el entrenamiento), RTX 4090, A100 o H100 para lotes grandes; cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en lote pequeño.
- Cabe en GPU consumer: sí, en GTX 1650/1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de clasificación con código remoto, su integración en esos servidores no está garantizada.
- Latencia y throughput: no se publican cifras de inferencia; solo la telemetría de entrenamiento (40.658,2 tokens/s en RTX 3090 con 256 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-spectron-sst2` | 110 M (base) + atención destilada | No disponible | 88,76 % | MIT | Hugging Face (repo ligero, requiere código remoto) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face |
| BERT-Base fine-tuned en SST-2 (referencia estándar) | 110 M | 512 | ~92-93 % típico en la literatura (no verificado en esta ficha) | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de resultados de otros modelos de atención subcuadrática (por ejemplo, variantes lineales de BERT) en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni sirve para tareas fuera de SST-2 sin reajuste.
- Pérdida de 2,87 puntos de accuracy respecto al profesor BERT-Base en SST-2 (88,76 % frente a 91,63 %), lo que puede ser relevante en aplicaciones sensibles a la precisión.
- El repositorio no incluye los pesos completos: depende de `bert-base-uncased` y de código remoto (`modeling_neuralops_bert.py`), lo que introduce riesgo de suministro y de ejecución de código de terceros con `trust_remote_code=True`.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos específicos, pero al heredar el preentrenamiento de `bert-base-uncased` arrastra los sesgos de su corpus (texto web en inglés), incluidos sesgos demográficos y de dominio.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de SST-2 (por ejemplo, textos largos, dominios especializados o ironía).
- La longitud de contexto efectiva con `spectron` no está documentada; no se garantiza el comportamiento a 512 tokens ni más allá.
- Licencia MIT permite uso comercial, pero la dependencia del modelo base Apache 2.0 y del código remoto de NeuralOps debe revisarse por separado.
- No hay benchmarks más allá de SST-2, ni comparaciones con otros mecanismos de atención eficiente, lo que limita la evaluación objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-spectron-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

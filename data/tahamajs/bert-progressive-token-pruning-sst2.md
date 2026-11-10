# tahamajs/bert-progressive-token-pruning-sst2

## Resumen

`tahamajs/bert-progressive-token-pruning-sst2` es un checkpoint de clasificación de sentimiento en inglés derivado de `google-bert/bert-base-uncased`, en el que las doce capas de atención softmax cuadrática del transformer original han sido sustituidas por el mecanismo `progressive_token_pruning` de la librería NeuralOps. El modelo lo publica el desarrollador Taha Majlesi (usuario `tahamajs`) como parte de su "Subquadratic Attention Zoo", una colección de variantes de BERT con mecanismos de atención subcuadráticos evaluadas sobre GLUE. El problema que aborda es el coste cuadrático O(N²) de la atención estándar en secuencias largas, sustituyéndolo por una complejidad efectiva O(N) u O(N log N) mediante poda progresiva de tokens.

La relevancia del checkpoint es fundamentalmente metodológica y de investigación: demuestra que es posible destilar una variante de atención subcuadrática a partir de un profesor BERT-Base estándar con una pérdida de precisión mínima en SST-2 (91,51 % frente a 91,63 % del profesor, un delta de -0,11 puntos). El entrenamiento se ejecutó en una única RTX 3090 de 24 GB en 59,6 segundos y 176 pasos de optimización, con un pico de VRAM de 7934 MB, gracias al protocolo de destilación con caché offline de representaciones que evita mantener al profesor en memoria.

El repositorio no contiene los pesos completos de BERT (unos 450 MB), sino únicamente los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, ~55 MB); el código remoto reconstruye el modelo base congelado al cargar. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `progressive_token_pruning` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (arquitectura base BERT-Base); el repo solo almacena los pesos de atención y la cabeza de clasificación |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) con código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza en todas las capas el mecanismo de multi-head attention estándar por `progressive_token_pruning`, que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N) mediante la eliminación progresiva de tokens. Los pesos base de BERT permanecen congelados; solo se entrenan y serializan los parámetros de atención especializados y la cabeza de clasificación de la tarea.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation", una destilación en dos etapas: primero una alineación de subespacio oculto y después una combinación de divergencia KL sobre logits más entropía cruzada de la tarea. La destilación usa representaciones del profesor cacheadas offline, de modo que el profesor no ocupa VRAM durante el entrenamiento (pico de 7934 MB en una RTX 3090). Se ejecutaron 176 pasos de optimización en 59,6 segundos, con un throughput efectivo de 24 172,8 tokens/s. El conjunto de evaluación es la partición de validación de SST-2 (872 muestras de clasificación binaria).

## Capacidades

- Clasificación de texto binaria (análisis de sentimiento positivo/negativo) sobre secuencias en inglés, con `pipeline_tag: text-classification`.
- Atención subcuadrática que habilita el procesamiento de secuencias largas con coste reducido frente a la atención cuadrática de BERT estándar.
- Carga modular: los pesos de atención se aplican sobre el BERT base congelado mediante código remoto, sin duplicar los 450 MB del modelo base.
- Integración con la API de alto nivel de NeuralOps (`load_pretrained_bert`) para reconstruir el modelo con `attention_type="progressive_token_pruning"`.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; el checkpoint está especializado en clasificación.

## Casos de uso

- Análisis de sentimiento en producción sobre reseñas o comentarios en inglés: el modelo ofrece una precisión de 91,51 % en SST-2 con una huella de pesos de ~55 MB más el BERT base congelado, lo que abarata el despliegue en comparación con un fine-tuning completo.
- Investigación sobre eficiencia de atención: sirve como referencia reproducible para comparar mecanismos subcuadráticos frente a la atención softmax de BERT-Base en una tarea GLUE estándar, con telemetría de entrenamiento documentada (pasos, throughput, VRAM).
- Clasificación de documentos largos: la complejidad O(N) u O(N log N) de `progressive_token_pruning` resulta adecuada para entradas que exceden la longitud típica de 512 tokens de BERT, aunque la longitud de contexto efectiva no está documentada.
- Destilación de bajo coste en hardware de consumo: el protocolo de caché offline permite reproducir el entrenamiento en una única RTX 3090, útil para equipos con presupuesto limitado que quieran adaptar variantes de atención a nuevas tareas.
- Filtrado y moderación de contenido en inglés: la cabeza de clasificación binaria puede reutilizarse como base para etiquetado de polaridad en pipelines de preprocesado.
- Base para experimentos de la Attention Zoo: el checkpoint se integra en la API de NeuralOps para comparar variantes de atención sobre el mismo backbone congelado.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,63 % | 91,51 % | -0,11 % |
| Entropía cruzada de validación | 0,2428 | sin calibrar | 0,2997 | convergido |

Telemetría de entrenamiento: 176 pasos, 59,6 s, 24 172,8 tokens/s, pico de VRAM 7934 MB en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo aporta ~55 MB de pesos de atención en FP16; hay que sumar el BERT base congelado (~110 M de parámetros, en torno a 440 MB en FP32 o 220 MB en FP16). En la práctica, la inferencia cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: RTX 3090 (la usada en el entrenamiento), así como cualquier GPU con al menos ~2-4 GB de VRAM libre para el modelo completo en FP16.
- Cabe en GPU de consumo: sí; el entrenamiento documentado se ejecutó en una RTX 3090 de 24 GB con un pico de 7934 MB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía `AutoModelForSequenceClassification`) y la API `neuralops.hub.bert_zoo`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica el throughput de entrenamiento (24 172,8 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-progressive-token-pruning-sst2` | 110 M (base) | no disponible | 91,51 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, fine-tuning SST-2) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, estándar |
| Otras variantes de la Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (repo) | Hugging Face / GitHub |

No se dispone de datos de benchmarks de otras alternativas subcuadráticas en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay evidencia de comportamiento multilingüe.
- La longitud de contexto efectiva no está documentada; el backbone base BERT-Base está limitado habitualmente a 512 tokens.
- La precisión reportada (91,51 %) procede de una única partición de validación de SST-2 (872 muestras); no hay evaluación en otros conjuntos GLUE ni en dominios fuera de distribución.
- La entropía cruzada del modelo destilado (0,2997) es superior a la del profesor (0,2428), lo que indica una calibración de probabilidades peor pese a mantener la exactitud.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`) al cargar; conviene auditar ese código antes de usarlo en producción.
- El repositorio no incluye los pesos completos de BERT; depende de la descarga de `bert-base-uncased` desde el Hub, lo que añade una dependencia externa.
- Riesgo de alucinación y sesgos: no se documentan análisis de sesgo ni evaluaciones de robustez; al ser un modelo de clasificación entrenado sobre SST-2 (reseñas de películas), puede generalizar mal a otros dominios de texto.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validación independiente por parte de la comunidad.
- Licencia MIT: permite uso comercial, pero el código remoto y la dependencia del modelo base deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-progressive-token-pruning-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/

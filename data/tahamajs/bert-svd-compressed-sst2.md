# tahamajs/bert-svd-compressed-sst2

## Resumen

`tahamajs/bert-svd-compressed-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `svd_compressed`, perteneciente a su librería NeuralOps. El objetivo es reducir la complejidad operativa de la atención de O(N²) a un régimen subcuadrático (O(N) u O(N log N) según el autor) manteniendo una precisión competitiva en la tarea GLUE SST-2 mediante destilación de conocimiento desde el modelo profesor original.

El modelo se distribuye como un conjunto de pesos de solo atención más la cabeza de clasificación en FP16 (~55 MB), no como un checkpoint completo de BERT: el código remoto (`modeling_neuralops_bert.py`) reconstruye la base congelada desde `bert-base-uncased` y aplica encima los parámetros destilados. Está pensado como demostración de la metodología de destilación de NeuralOps (protocolo de destilación con representaciones cacheadas offline, sin asignación de VRAM para el profesor) y como pieza del "Subquadratic Attention Zoo" del autor.

Es relevante ahora como ejemplo temprano y reproducible de sustitución de atención cuadrática en un transformer encoder estándar con resultados medidos en un benchmark público, aunque su alcance es acotado: una sola tarea (SST-2), un solo idioma (inglés) y un único checkpoint publicado sin métricas adicionales de eficiencia en inferencia a longitudes largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `svd_compressed` (subcuadrática) en las 12 capas |
| Parametros totales | ~110 M (base BERT-Base); el repo solo contiene pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; no se especifica para el mecanismo `svd_compressed`) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) + código remoto Python (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, ~110 M de parámetros, encoder transformer bidireccional) y reemplaza la atención multi-cabeza softmax estándar por el mecanismo `svd_compressed` de NeuralOps, que el autor describe como de complejidad efectiva O(N) u O(N log N) frente a O(N²). Los pesos base de BERT permanecen congelados y se inicializan desde `bert-base-uncased` en tiempo de carga; el repositorio solo serializa los parámetros de atención destilados y la cabeza de clasificación de la tarea, siguiendo la especificación de serialización modular de NeuralOps.

El entrenamiento emplea el "NeuralOps Cached Representation Distillation Protocol": alineamiento de representaciones ocultas en una primera etapa (subspace hidden alignment) seguido de una segunda etapa con KL sobre logits y entropía cruzada de la tarea. El profesor se ejecuta offline y sus representaciones se cachean, de modo que no consume VRAM durante la destilación del estudiante. El entrenamiento se ejecutó en una NVIDIA RTX 3090 (24 GB) durante 51,6 s, en 263 pasos de optimización, con un throughput efectivo de 41.791,5 tokens/s y un pico de VRAM de 7.376 MB. No se detalla la composición exacta del dataset de destilación más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con salida de logits vía `AutoModelForSequenceClassification`.
- Razonamiento de secuencia corta propio de un encoder BERT fine-tuneado en SST-2; no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Multilingüismo limitado al inglés (el modelo base `bert-base-uncased` es principalmente inglés).
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Análisis de sentimiento en reseñas de producto en inglés: clasificación binaria directa con una precisión reportada del 90,25 % en la validación de SST-2, adecuada para filtrado automático de opiniones negativas en pipelines de e-commerce.
- Moderación de comentarios en foros angloparlantes: el modelo puede etiquetar polaridad de mensajes como señal auxiliar en un sistema de moderación, con la ventaja de un footprint de descarga de ~55 MB que simplifica el despliegue.
- Enriquecimiento de datasets de investigación: uso como etiquetador barato para preanotar sentimiento en corpus en inglés antes de revisión humana, dado su bajo coste de inferencia en GPU de consumo.
- Docencia y reproducción de experimentos de destilación: el checkpoint sirve como referencia reproducible del protocolo de destilación de NeuralOps (263 pasos, 51,6 s en RTX 3090) para comparar mecanismos de atención subcuadrática.
- Benchmarking de atención eficiente: útil para evaluar el impacto de `svd_compressed` frente a atención cuadrática en tareas de clasificación de secuencia, comparando precisión y coste computacional.
- Prototipado rápido en entornos con VRAM limitada: al no requerir cargar el checkpoint completo de BERT más allá de los pesos base congelados y los ~55 MB de atención, encaja en entornos de desarrollo con GPUs modestas.

## Benchmarks y rendimiento

Evaluación reportada por el autor en el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`svd_compressed`) | Modelo destilado |
|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 72,48 % | 90,25 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2956 |

Delta de exactitud tras destilación: +17,78 puntos porcentuales. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de VRAM reportado durante el entrenamiento fue de 7.376 MB en una RTX 3090; para inferencia en FP16 se espera un consumo notablemente menor, aunque no se publica una cifra específica.
- GPU recomendadas: NVIDIA RTX 3090 (usada por el autor), así como cualquier GPU Ampere o superior (A100, H100, RTX 4090) por compatibilidad con Tensor Cores y FP16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 en adelante, dado el tamaño reducido de los pesos de atención (~55 MB) más los pesos base congelados de BERT-Base (~440 MB en FP32).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (documentado) y la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: durante el entrenamiento se reportan 41.791,5 tokens/s y 51,6 s para 263 pasos en RTX 3090; no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-svd-compressed-sst2` | ~110 M (base) + ~55 MB atención | no disponible | 90,25 % | MIT | Hugging Face (`neuralops`, código remoto) |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 tokens | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face (`transformers`) |
| Alternativas de atención eficiente tipo Longformer/BigBird | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otras alternativas de atención subcuadrática en la información proporcionada, por lo que la comparativa se limita al profesor y al propio estudiante.

## Limitaciones y advertencias

- El modelo solo se ha evaluado en una tarea (SST-2) y un idioma (inglés); no hay evidencia de generalización a otras tareas GLUE ni a otros dominios.
- La exactitud destilada (90,25 %) queda 1,38 puntos por debajo del profesor (91,63 %); el autor la califica de "excelente (>=90 %)" pero existe una pérdida medible.
- La entropía cruzada de validación del estudiante (0,2956) es superior a la del profesor (0,2428), lo que sugiere menor calibración de las probabilidades.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas en dominios alejados de SST-2 (reseñas de películas).
- Dependencia de `trust_remote_code=True` y de la librería `neuralops`: el código remoto se ejecuta en el entorno del usuario y debe auditarse antes de usarlo en producción.
- El repositorio no incluye los pesos base completos; la carga depende de la disponibilidad de `bert-base-uncased` en el Hub.
- Licencia MIT, lo que permite uso comercial, pero sin garantías del autor sobre robustez o sesgos.
- No se documentan sesgos específicos, aunque al derivar de BERT-Base hereda los sesgos del corpus original (BookCorpus/Wikipedia en inglés).
- No hay soporte documentado para cuantización más allá de FP16 ni para motores de inferencia de alto rendimiento (vLLM, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-svd-compressed-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue (tarea `sst2`)
- Cita del autor: `@software{neuralops2026bertzoo, title = {NeuralOps: Pretrained BERT Subquadratic Attention Zoo on GLUE Benchmark}, author = {Majlesi, Taha}, year = {2026}, url = {https://github.com/tahamajs/NeuralOps}}`

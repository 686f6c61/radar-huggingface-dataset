# tahamajs/bert-performer-attention-sst2

## Resumen

`tahamajs/bert-performer-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que las 12 capas de atención softmax cuadrática originales se han sustituido por el mecanismo `performer_attention` de la librería NeuralOps. El modelo resultante se ha destilado desde el `bert-base-uncased` original y se ha ajustado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE. Lo publica Taha Majlesi (usuario `tahamajs`) bajo licencia MIT y está pensado como pieza de un "zoo" de atenciones subcuadráticas (lineales o cuasi-lineales) que reduzcan el coste computacional de BERT en secuencias largas.

La relevancia práctica del checkpoint es doble. Por un lado, demuestra empíricamente el coste de cambiar atención cuadrática por atención aproximada de tipo Performer: la precisión en SST-2 cae del 91,63 % del profesor BERT-Base al 79,01 % tras la destilación (y al 75,11 % sin destilar), es decir, una pérdida de 12,62 puntos absolutos. Por otro, el repositorio sigue una serialización "attention-only" en FP16 de unos 55 MB, que se carga sobre los pesos congelados de `bert-base-uncased` mediante código remoto (`trust_remote_code=True`), lo que reduce drásticamente el tamaño de descarga frente a un checkpoint completo.

El modelo no es un modelo generativo ni un LLM: es un clasificador de secuencias de propósito específico, entrenado únicamente en inglés y evaluado solo en SST-2. No hay datos publicados sobre otros subconjuntos de GLUE, ni sobre tareas generativas, tool calling o razonamiento multi-paso. Su interés es principalmente de investigación en eficiencia de atención y destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `performer_attention` en las 12 capas (sustituye a la MHA softmax cuadrática) |
| Parametros totales | 110 M (base BERT-Base); el repo solo almacena los pesos de atención y la cabeza de clasificación ajustados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base admite hasta 512 tokens, pero la model card no lo especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP16 (`attention_weights.safetensors`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `safetensors` en FP16, serialización "attention-only" (~55 MB); requiere `trust_remote_code=True` y carga los pesos base congelados de `bert-base-uncased` |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estándar (12 capas, 768 de dimensión oculta, 12 cabezas) en el que cada bloque de self-attention softmax se reemplaza por `performer_attention`, un mecanismo de atención aproximada basado en features aleatorias positivas que reduce la complejidad de O(N²) a O(N) u O(N log N) en función de la implementación. El resto de componentes (embeddings, feed-forward, layer norm) se mantienen congelados desde `bert-base-uncased`.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": primero una fase de alineamiento de representaciones ocultas (Stage 1) y después una fase de destilación por KL sobre logits combinada con entropía cruzada sobre la tarea (Stage 2). Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 50,3 s, con 221 pasos de optimización, un throughput efectivo de 35 998,9 tokens/s y un pico de VRAM de 8409 MB. El protocolo evita asignar VRAM al profesor mediante caché offline de representaciones. El dataset de ajuste es SST-2 (dentro de GLUE) y el modelo solo se ha evaluado en esa tarea.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, entrenada específicamente sobre SST-2.
- Clasificación de secuencias cortas a medias (frases y oraciones), heredando el tokenizador y el vocabulario de `bert-base-uncased`.
- Inferencia con menor coste asintótico que BERT-Base en secuencias largas gracias a la atención Performer, aunque no se han publicado mediciones de latencia o throughput en inferencia.
- Carga modular vía `neuralops.hub.bert_zoo.load_pretrained_bert` con `attention_type="performer_attention"` y `task="sequence-classification"`.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- No se ha validado en otras tareas de GLUE (MNLI, QQP, CoLA, etc.) ni en otros idiomas distintos del inglés.

## Casos de uso

- Clasificación de sentimiento en reseñas y comentarios en inglés: el modelo devuelve una etiqueta binaria directamente desde `AutoModelForSequenceClassification`; útil como baseline ligero en pipelines de análisis de opinión donde el coste por token importa.
- Filtrado previo en pipelines de moderación o triaje: al ser un clasificador de 110 M con serialización de 55 MB, se puede desplegar en CPU o GPU pequeña para descartar contenido negativo antes de pasarlo a modelos mayores.
- Investigación en eficiencia de atención: sirve como punto de comparación reproducible (mismo profesor, mismo dataset, mismas métricas) para evaluar el impacto de `performer_attention` frente a softmax cuadrática en tareas de clasificación.
- Docencia y experimentación con destilación: el protocolo de destilación con caché offline de representaciones y los 221 pasos de entrenamiento en una RTX 3090 lo hacen asequible para reproducir experimentos en un solo equipo.
- Benchmarking de mecanismos subcuadráticos: útil para medir la curva precisión-coste de Performer frente a otras atenciones del zoo NeuralOps (linear, linformer, etc.) sobre SST-2.
- Prototipado rápido en entornos con poca VRAM: la descarga de ~55 MB y la carga sobre pesos base congelados permiten iterar sin almacenar checkpoints completos de 450 MB.
- Clasificación por lotes en entornos serverless: el bajo footprint y la licencia MIT facilitan su integración en funciones ligeras para etiquetar grandes volúmenes de texto en inglés.

## Benchmarks y rendimiento

Evaluación publicada en el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-destilacion (`performer_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 75,11 % | 79,01 % | +3,90 % (frente al pre-KD); −12,62 % frente al profesor |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,5698 | — |

No se han publicado resultados en otros subconjuntos de GLUE (MMLU, HumanEval, GSM8K no aplican a este modelo) ni comparativas con otros mecanismos de atención del zoo NeuralOps en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico de VRAM durante el entrenamiento fue de 8409 MB en una RTX 3090, pero la inferencia de un BERT-Base de 110 M en FP16 suele requerir del orden de 1-2 GB, incluyendo activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM para FP16; el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060/4060 en adelante; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`), y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que en general no cubren clasificadores BERT con código remoto.
- Latencia y throughput: solo se publica throughput de entrenamiento (35 998,9 tokens/s) y duración total (50,3 s, 221 pasos); no hay cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (acc.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-performer-attention-sst2` | 110 M | no disponible (base BERT: 512) | 79,01 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor, ajustado a SST-2) | 110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face, `transformers` estándar |
| BERT-Base con atención lineal/Performer sin destilar | 110 M | 512 | 75,11 % | MIT (según NeuralOps) | Repositorio NeuralOps |
| Otros clasificadores SST-2 pequeños (p. ej. DistilBERT) | ~66 M | 512 | no disponible en la información proporcionada | Apache 2.0 (DistilBERT) | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no hay resultados de benchmarks de terceros ni comparaciones con mecanismos alternativos del mismo zoo.

## Limitaciones y advertencias

- Pérdida de precisión notable: 79,01 % frente al 91,63 % del profesor en SST-2, una caída de 12,62 puntos absolutos; no es adecuado como sustituto directo de BERT-Base en producción sin validación adicional.
- Solo validado en SST-2; no hay evidencia de rendimiento en otras tareas de GLUE ni en dominios distintos del análisis de sentimiento.
- Solo inglés; no se ha evaluado en otros idiomas.
- Dependencia de código remoto: la carga requiere `trust_remote_code=True` y el shim `modeling_neuralops_bert.py`, lo que implica revisar y confiar en el código del repositorio antes de desplegarlo.
- Los pesos publicados son solo de atención y cabeza de clasificación (~55 MB); el modelo completo depende de descargar `bert-base-uncased` por separado, lo que añade una dependencia externa.
- Riesgo de alucinación no aplica en el sentido generativo (es un clasificador), pero sí puede producir etiquetas erróneas con alta confianza en textos fuera de distribución o con ironía/sarcasmo.
- Sesgos heredados de `bert-base-uncased` y de SST-2 (reseñas de películas), que no representan necesariamente otros dominios.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- Sin métricas de latencia, throughput de inferencia ni robustez publicadas; el rendimiento en producción debe medirse empíricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-performer-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue

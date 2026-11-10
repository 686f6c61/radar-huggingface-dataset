# tahamajs/bert-lora-attention-sst2

## Resumen

`tahamajs/bert-lora-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática del transformer original han sido sustituidas por un mecanismo denominado `lora_attention`, perteneciente a la librería NeuralOps. El modelo lo publica el desarrollador Taha Majlesi (usuario `tahamajs`) dentro de un proyecto personal de "attention zoo" orientado a explorar mecanismos de atención subcuadráticos sobre arquitecturas BERT preentrenadas.

El objetivo declarado es demostrar que es posible reemplazar la atención cuadrática O(N²) por una variante de complejidad efectiva O(N) u O(N log N) y recuperar, mediante destilación de representaciones en caché, el rendimiento del profesor original, e incluso superarlo ligeramente en la tarea SST-2 del benchmark GLUE (92,78 % de accuracy frente al 91,63 % del profesor). El entrenamiento se ejecutó en una única NVIDIA RTX 3090 de 24 GB durante 49,4 segundos y 237 pasos de optimización.

La relevancia del artefacto es fundamentalmente metodológica y experimental: no es un modelo de propósito general ni un sustituto de BERT en producción, sino una prueba de concepto de serialización modular (solo se distribuyen los pesos de atención y la cabeza de clasificación, unos 55 MB en FP16) y de destilación sin asignación de VRAM para el profesor. Su ámbito es la clasificación binaria de sentimiento en inglés sobre SST-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `lora_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110 M (base BERT-base); el checkpoint distribuido contiene solo pesos de atención y cabeza de clasificación (~55 MB FP16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos publicados (`attention_weights.safetensors`); no se documentan otras variantes |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, solo atención y cabeza de clasificación); requiere `trust_remote_code=True` y la base `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 millones de parámetros, y sustituye en cada capa el bloque de multi-head attention estándar por el mecanismo `lora_attention` de NeuralOps, que según la model card ofrece una complejidad operativa efectiva de O(N) u O(N log N) frente a la O(N²) de la atención softmax convencional. No se detalla en la información disponible la formulación matemática interna de `lora_attention` (por ejemplo, si combina proyecciones de bajo rango con kernels linealizados, atención dispersa o aproximaciones tipo Performer/Linformer). Los pesos base de BERT permanecen congelados; el repositorio solo almacena los parámetros de atención entrenados y la cabeza de clasificación.

El entrenamiento sigue el protocolo "NeuralOps Cached Representation Distillation": una primera etapa de alineamiento de subespacio oculto y una segunda etapa de destilación por KL sobre logits combinada con entropía cruzada de la tarea. La destilación se hace contra representaciones del profesor cacheadas offline, de modo que el profesor no consume VRAM durante el entrenamiento (pico de 7.873 MB en una RTX 3090). Se ejecutaron 237 pasos en 49,4 segundos con un throughput efectivo de 39.339,6 tokens/s. El conjunto de datos es la partición de entrenamiento de SST-2 (GLUE) y la evaluación se realiza sobre las 872 muestras de validación. No se documenta el uso de RLHF ni DPO, algo esperable en una tarea de clasificación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos tipo SST-2.
- Sustitución de atención cuadrática por un mecanismo subcuadrático, con la promesa teórica de mejor escalado en secuencias largas (no verificada empíricamente en la información disponible más allá de SST-2).
- Carga modular: reconstruye el modelo base desde `bert-base-uncased` y aplica los pesos de atención destilados en tiempo de carga.
- Integración con la API de alto nivel de NeuralOps (`load_pretrained_bert`).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking"; es un clasificador de texto, no un modelo generativo.
- Capacidad multilingüe: únicamente inglés.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios en inglés: el modelo devuelve una etiqueta binaria directamente desde `AutoModelForSequenceClassification`, adecuado para pipelines de análisis de opinión a bajo coste computacional.
- Moderación de comentarios y filtrado de toxicidad binaria (previa adaptación de la cabeza de clasificación): la arquitectura es reutilizable para cualquier tarea de clasificación de secuencias cortas en inglés.
- Enrutamiento de tickets de soporte: usar la salida positiva/negativa como señal auxiliar para priorizar quejas en sistemas de atención al cliente.
- Investigación en mecanismos de atención eficiente: sirve como referencia reproducible para comparar `lora_attention` con atención softmax estándar en GLUE, dado que el autor publica telemetría de entrenamiento y deltas de accuracy.
- Destilación de modelos pequeños en entornos con VRAM limitada: el protocolo de representaciones cacheadas permite reproducir el entrenamiento en una sola GPU de consumo (RTX 3090), útil como plantilla metodológica.
- Experimentos docentes sobre parametrización eficiente: al distribuir solo ~55 MB de pesos de atención, es un ejemplo práctico de serialización modular y de carga con `trust_remote_code`.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 92,78 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2796 |
| Delta de accuracy | — | — | +1,15 % |

Telemetría de entrenamiento (RTX 3090, 24 GB): 237 pasos, 49,4 s, 39.339,6 tokens/s, pico de VRAM 7.873 MB. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es coherente con el alcance del modelo (clasificación, no generación).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en FP16 para el modelo completo (base de 110 M de parámetros más la cabeza); el checkpoint descargable son ~55 MB, pero la carga requiere instanciar la base BERT.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor usó una RTX 3090 (24 GB) para el entrenamiento, no para inferencia.
- Cabe en GPU de consumo: sí, en GTX 1650/1660, RTX 3050 en adelante; también en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (documentado); la API `neuralops.hub.bert_zoo`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (el código remoto personalizado y el formato de pesos parcial lo hacen improbable sin adaptación).
- Latencia y throughput: no disponible para inferencia; el throughput de 39.339,6 tokens/s corresponde al entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-lora-attention-sst2` | 110 M (base) / ~55 MB checkpoint | no disponible | 92,78 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (fine-tuned SST-2) | 110 M | 512 | 91,63 % (profesor del autor) | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (referencia habitual de la comunidad) | Apache 2.0 | Hugging Face, estándar |
| `roberta-base` fine-tuned SST-2 | 125 M | 512 | ~94-95 % (referencia habitual de la comunidad) | MIT | Hugging Face, estándar |

Nota: los valores de DistilBERT y RoBERTa son cifras de referencia ampliamente citadas de la literatura, no extraídas de la información proporcionada; el único dato verificado aquí es el 91,63 % / 92,78 % del autor. La comparación de eficiencia de atención con estos modelos no está cuantificada en la model card.

## Limitaciones y advertencias

- Modelo de clasificación binaria de sentimiento, no un modelo generativo: no debe esperarse capacidad de razonamiento, código, matemáticas ni diálogo.
- Entrenado y evaluado únicamente en SST-2 (inglés); el rendimiento fuera de ese dominio no está documentado y probablemente degrade.
- El delta de +1,15 % de accuracy se mide sobre 872 muestras de validación, una diferencia de ~10 ejemplos; la significancia estadística no se reporta y debe tomarse con cautela.
- La entropía cruzada del estudiante destilado (0,2796) es superior a la del profesor (0,2428), lo que sugiere peor calibración de las probabilidades aunque la accuracy suba.
- No se documentan análisis de sesgos; al heredar el preentrenamiento de `bert-base-uncased`, arrastra los sesgos de su corpus (BookCorpus + Wikipedia en inglés).
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de predicciones erróneas en dominios fuera de distribución.
- Requiere `trust_remote_code=True` y ejecución de código remoto (`modeling_neuralops_bert.py`), lo que implica un riesgo de seguridad en producción y complica la auditoría.
- Dependencia de la librería NeuralOps y de su API para la carga modular; la compatibilidad futura con versiones de Transformers no está garantizada.
- Licencia MIT: permite uso comercial, pero al derivar de `bert-base-uncased` (Apache 2.0) conviene verificar el cumplimiento de ambas.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni mantenimiento comunitario demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-lora-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

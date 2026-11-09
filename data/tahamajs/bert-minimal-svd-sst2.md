# tahamajs/bert-minimal-svd-sst2

## Resumen

`bert-minimal-svd-sst2` es un checkpoint de clasificación de sentimiento en inglés publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps. Se trata de un `bert-base-uncased` (110 M de parámetros) en el que los bloques de atención softmax cuadrática de las 12 capas del transformer se han sustituido por el mecanismo `minimal_svd`, una aproximación de atención subcuadrática con complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la multi-head attention estándar. El modelo se ha ajustado sobre la tarea SST-2 del benchmark GLUE mediante un protocolo de destilación de representaciones en caché (NeuralOps Cached Representation Distillation).

La relevancia del modelo es fundamentalmente metodológica: demuestra que es posible destilar un mecanismo de atención alternativo sobre un backbone BERT congelado en apenas 230 pasos de optimización y 68,2 segundos en una única RTX 3090, recuperando el 90,02 % de accuracy en SST-2 frente al 91,63 % del profesor original. El repositorio no redistribuye los pesos completos de BERT, sino únicamente los parámetros de atención y la cabeza de clasificación en FP16 (~55 MB), que se reconstruyen sobre el modelo base congelado en tiempo de carga.

Se distribuye con licencia MIT, soporta exclusivamente inglés y requiere `trust_remote_code=True` por el shim de código remoto (`modeling_neuralops_bert.py`). Es un artefacto de investigación, no un modelo de propósito general: su pipeline es `text-classification` binaria de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `minimal_svd` subcuadrática en las 12 capas |
| Parametros totales | 110 M (backbone BERT-base congelado) + adaptadores de atención y cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 para los pesos de atención; el backbone base se carga en su precisión original |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB), solo atención y cabeza de tarea |
| Libreria | neuralops (con shim compatible con `transformers`) |
| Modelo base | `google-bert/bert-base-uncased` (congelado) |
| Dataset de evaluación | GLUE SST-2 (split de validación, 872 muestras) |
| Region | US |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros, y reemplaza en todas las capas el bloque de multi-head attention softmax por el mecanismo `minimal_svd` de la librería NeuralOps, que reduce la complejidad operativa de O(N²) a O(N) u O(N log N) mediante una descomposición SVD de baja dimensión del espacio de atención. El backbone permanece congelado; solo se entrenan los parámetros de atención sustituidos y la cabeza de clasificación, que se serializan de forma modular en `attention_weights.safetensors` (~55 MB en FP16) y se aplican sobre el modelo base en tiempo de carga mediante el shim `modeling_neuralops_bert.py`.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, en dos etapas: primero una alineación de representaciones ocultas en subespacio y después una destilación por KL sobre logits combinada con entropía cruzada de la tarea. La destilación usa caché offline de representaciones del profesor, de modo que no se asigna VRAM al profesor durante el ajuste. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB, Ampere) con un total de 230 pasos de optimización, 68,2 s de duración, throughput efectivo de 27 612,9 tokens/s y un pico de VRAM de 23 021 MB. No se especifica en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE SST-2.

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre texto de entrada, con salida de logits de dos clases.
- Atención subcuadrática (`minimal_svd`) con coste O(N) u O(N log N), orientada a secuencias largas donde la atención cuadrática resulta prohibitiva.
- Destilación de conocimiento desde un profesor BERT-base hacia un estudiante con atención alternativa, preservando el 98,2 % relativo de la accuracy del profesor en SST-2 (90,02 % frente a 91,63 %).
- Carga modular eficiente en memoria: solo se descargan ~55 MB de pesos de atención, no los ~450 MB del backbone completo.
- Integración con `transformers` mediante `AutoModelForSequenceClassification` y `trust_remote_code=True`, y con la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No dispone de tool calling, function calling, capacidades de agente, multi-step reasoning, visión, audio ni modo thinking; es un clasificador de secuencia, no un modelo generativo.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo clasifica cada reseña en positiva o negativa con un accuracy del 90,02 % en SST-2, adecuado para pipelines de monitorización de opinión a escala media donde el coste de inferencia importa.
- Moderación de comentarios y detección de toxicidad polarizada: como clasificador binario rápido, puede prefiltrar grandes volúmenes de texto en inglés antes de pasar a modelos más caros, aprovechando su atención subcuadrática para lotes largos.
- Investigación en eficiencia de atención: sirve como checkpoint de referencia para comparar mecanismos subcuadráticos (`minimal_svd`) frente a atención softmax estándar en la misma tarea y backbone, con métricas reproducibles de destilación.
- Destilación de bajo coste en hardware consumer: el protocolo documentado (230 pasos, 68,2 s, RTX 3090) es replicable para adaptar otros mecanismos de atención a tareas de clasificación con recursos limitados.
- Clasificación de sentimiento en streaming de redes sociales: la huella de pesos (~55 MB) y la atención lineal permiten desplegar el modelo en entornos con memoria restringida y latencia baja para clasificación por lotes.
- Evaluación comparativa de backbones en GLUE: al mantener el backbone BERT-base congelado y solo sustituir la atención, permite aislar el impacto del mecanismo de atención en el rendimiento de la tarea sin confundir con cambios en el preentrenamiento.
- Integración en pipelines de NLP con `transformers`: la carga mediante `AutoModelForSequenceClassification` con `trust_remote_code=True` facilita su incorporación en flujos existentes de clasificación de texto en inglés.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`minimal_svd`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 51,38 % | 90,02 % | +38,65 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3128 | convergido |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB):

| Metrica | Valor |
|---|---|
| Duración del entrenamiento | 68,2 s |
| Pasos de optimización | 230 |
| Throughput efectivo | 27 612,9 tokens/s |
| Pico de VRAM | 23 021 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone BERT-base en FP32 ocupa aproximadamente 440 MB y en FP16 unos 220 MB; los pesos de atención añaden ~55 MB. La inferencia cabe holgadamente en GPUs con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento documentado se realizó en una NVIDIA GeForce RTX 3090 (24 GB), pero la inferencia no requiere esa capacidad.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía principal), API `neuralops.hub.bert_zoo`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: el throughput de entrenamiento fue de 27 612,9 tokens/s en RTX 3090; no se proporcionan cifras de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-minimal-svd-sst2` | 110 M (backbone) + adaptadores | no disponible | 90,02 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens (típico) | 91,63 % | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens (típico) | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens (típico) | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con alternativas de la misma categoría (clasificadores SST-2 sobre BERT) no está disponible con métricas verificadas en la información proporcionada; solo se dispone del par profesor-estudiante documentado por el autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de `bert-base-uncased` y entrenarse solo en SST-2, hereda los sesgos del corpus de reseñas de películas y del preentrenamiento original.
- Riesgo de alucinación: no aplica en sentido generativo (es un clasificador), pero puede producir clasificaciones erróneas con alta confianza en dominios distintos al de entrenamiento.
- Limitaciones de contexto o idioma: solo inglés; la longitud máxima de contexto no se especifica y se asume la del backbone (típicamente 512 tokens, sin confirmar).
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y el código remoto (`modeling_neuralops_bert.py`) debe auditarse antes de producción por el uso de `trust_remote_code=True`.
- Caveat de producción: el modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay validación externa ni mantenimiento documentado.
- La entropía cruzada del estudiante (0,3128) es superior a la del profesor (0,2428), lo que indica calibración menos precisa de las probabilidades.
- El repositorio no incluye los pesos completos del backbone; depende de la disponibilidad de `bert-base-uncased` en el Hub para reconstruirse.
- El rendimiento pre-KD (51,38 %) muestra que el mecanismo `minimal_svd` sin destilación no es funcional por sí solo; el checkpoint solo es útil en su versión destilada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-minimal-svd-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

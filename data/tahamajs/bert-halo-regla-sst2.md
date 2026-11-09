# tahamajs/bert-halo-regla-sst2

## Resumen

`tahamajs/bert-halo-regla-sst2` es una variante de `google-bert/bert-base-uncased` en la que las 12 capas de atención multi-cabeza estándar han sido sustituidas por el mecanismo `halo_regla`, una atención subcuadrática implementada en la librería NeuralOps. El modelo se ha destilado sobre el conjunto GLUE SST-2 (análisis de sentimiento binario en inglés) mediante el protocolo de destilación en dos etapas de NeuralOps, con caché offline de representaciones del profesor. Lo publica Taha Majlesi (usuario `tahamajs`) bajo licencia MIT.

El interés técnico reside en que sustituye la atención cuadrática de BERT por una alternativa de coste subcuadrático sin degradar de forma apreciable la precisión en la tarea de clasificación: el modelo destilado alcanza un 91,17 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor original. Es, por tanto, una pieza de investigación sobre eficiencia atencional más que un modelo de propósito general.

El modelo tiene 117,86 millones de parámetros, un tamaño de repositorio de 0,5 GB y está pensado exclusivamente para clasificación de texto en inglés. No debe confundirse con un modelo generativo: es un `AutoModelForSequenceClassification` con dos etiquetas de salida (negativo/positivo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `halo_regla` (subcuadrática) en las 12 capas |
| Parametros totales | 117.861.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de bert-base-uncased, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Librería | neuralops (con `trust_remote_code=True` en Transformers) |
| Modelo base | google-bert/bert-base-uncased |
| Tarea | text-classification (SST-2, 2 etiquetas) |
| Dataset de destilación | GLUE SST-2 |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza las 12 capas de atención multi-cabeza por `halo_regla`, un mecanismo de atención subcuadrática de la Attention Zoo de NeuralOps. El resto de la arquitectura BERT (embeddings, feed-forward, normalización, cabeza de clasificación) se mantiene. El modelo requiere `trust_remote_code=True` porque la implementación de la atención no forma parte del código estándar de Transformers.

El entrenamiento consiste en una destilación de conocimiento sobre SST-2 usando el protocolo "2-Stage Cached Representation Distillation" de NeuralOps, con caché offline de representaciones del profesor (sin VRAM del profesor durante el entrenamiento). El currículo es: etapa 1 con alineación de estados ocultos (coseno + MSE de subespacio) y etapa 2 con KL sobre logits de secuencia más entropía cruzada de la tarea. Se ejecutó en una RTX 3090 de 24 GB (clúster HPC de Sharif), con 178 pasos, 49,6 segundos de duración, throughput de 29.393,1 tokens/s y un pico de VRAM de 10.736 MB.

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) en inglés, tarea SST-2.
- Clasificación de texto corto con la cabeza `AutoModelForSequenceClassification`.
- Inferencia con la API estándar de Transformers (`trust_remote_code=True`).
- Carga mediante la API de alto nivel de NeuralOps (`load_pretrained_bert`).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidad multilingüe: solo inglés (heredado de `bert-base-uncased`, que es monolingüe).

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés en positivo/negativo; adecuado por su precisión del 91,17 % en SST-2 y su bajo coste de inferencia (117 M de parámetros).
- Moderación de comentarios en foros en inglés: filtrado rápido de mensajes con polaridad negativa como señal previa a revisión humana.
- Investigación sobre atención eficiente: sirve como referencia reproducible para comparar `halo_regla` frente a atención estándar en una tarea downstream concreta, dado que se publican métricas del profesor y del estudiante.
- Benchmark de destilación: útil para validar pipelines de destilación de representaciones en dos etapas con caché offline, ya que la model card documenta telemetría completa (pasos, tiempo, throughput, VRAM).
- Clasificación por lotes en CPU o GPU de gama baja: con 117 M de parámetros y pesos safetensors de 0,5 GB, cabe en hardware modesto para procesar grandes volúmenes de texto corto.
- Docencia y prototipado: ejemplo mínimo de cómo sustituir la atención de un modelo Hugging Face por una implementación custom y cargarla con `trust_remote_code`.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras), según la model card:

| Métrica | Profesor (baseline) | Estudiante pre-KD | Modelo destilado (post-KD) | Delta vs pre-KD |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,74 % | 91,17 % | -0,57 % |
| Validation loss | 0,2428 | no disponible | 0,3172 | no disponible |

Telemetría de entrenamiento (RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración | 49,6 s |
| Pasos de destilación | 178 |
| Throughput | 29.393,1 tokens/s |
| VRAM pico | 10.736 MB |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16, alrededor de 0,25 GB. La model card no documenta cuantizaciones, por lo que no hay cifras oficiales para int8/int4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; RTX 3090, A100 o H100 son sobredimensionadas para este modelo. El entrenamiento de destilación usó una RTX 3090.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (GTX 1060 en adelante, orientativo).
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la API de NeuralOps. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de inferencia; solo la telemetría de entrenamiento (29.393,1 tokens/s en destilación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/bert-halo-regla-sst2 | 117,86 M | no disponible | 91,17 % | MIT | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos BERT-base afinados en SST-2 (genéricos) | ~110 M | 512 | típicamente ~92-93 % (referencia externa, no verificada aquí) | variable | Hugging Face |

La comparativa directa con alternativas concretas afinadas en SST-2 no está disponible en la información proporcionada; los datos del profesor (91,63 %) y del estudiante (91,74 %) sí aparecen en la model card.

## Limitaciones y advertencias

- Solo clasificación binaria de sentimiento en inglés; no es un modelo generativo ni de propósito general.
- Rendimiento validado únicamente en SST-2; no hay evidencia de generalización a otros dominios o tareas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar la implementación de `halo_regla` antes de usarla en producción.
- Dependencia de la librería `neuralops` para la carga vía API de alto nivel; la compatibilidad con el ecosistema estándar (vLLM, TGI, ONNX) no está confirmada.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí puede producir clasificaciones erróneas en entradas fuera de distribución.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de películas); no se documentan análisis de sesgo.
- Licencia MIT permite uso comercial, pero la licencia del modelo base (`bert-base-uncased`, Apache 2.0) y de los datos de GLUE/SST-2 debe verificarse por separado.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-halo-regla-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset GLUE SST-2: https://huggingface.co/datasets/glue

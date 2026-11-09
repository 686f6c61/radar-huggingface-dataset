# tahamajs/bert-naive-svd-sst2

## Resumen

`tahamajs/bert-naive-svd-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por un mecanismo denominado `naive_svd`, perteneciente a su librería NeuralOps. El objetivo declarado es demostrar que una atención subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) puede recuperar prácticamente el rendimiento del profesor original tras un proceso de destilación de representaciones en caché.

El modelo se entrena y evalúa exclusivamente sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés), con 872 muestras de validación. Según la model card, el estudiante pre-destilación alcanza un 51,38 % de accuracy y, tras dos etapas de destilación (alineamiento de subespacio oculto y KL sobre logits más entropía cruzada de tarea), llega al 90,37 %, frente al 91,63 % del profesor BERT-base.

La relevancia es fundamentalmente metodológica: el repositorio publica únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), no el modelo completo, y se apoya en `trust_remote_code=True` para reconstruir la base congelada desde `bert-base-uncased`. Es un artefacto de investigación sobre eficiencia atencional, no un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención `naive_svd` (subcuadrática) en las 12 capas |
| Parametros totales | ~110 M (base BERT-base); el repositorio solo publica los pesos de atención y la cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | FP16 para los pesos publicados (`attention_weights.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), serialización `attention_only_fp16`; requiere código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, ~110 M de parámetros) y reemplaza la atención multi-cabeza estándar por el mecanismo `naive_svd` de NeuralOps, que el autor describe como de complejidad efectiva O(N) u O(N log N). La serialización es modular: el repositorio no contiene los pesos base congelados, sino únicamente los parámetros de atención destilados y la cabeza de clasificación en FP16, y el shim de código remoto inicializa la base desde `bert-base-uncased` y aplica encima los pesos destilados.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", con asignación cero de VRAM al profesor mediante caché offline de representaciones. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 50,0 s, con 278 pasos de optimización en dos etapas: primero alineamiento de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea. El throughput efectivo reportado es de 45.511,8 tokens/s y el pico de VRAM de 23.021 MB. No se detalla la composición del corpus de entrenamiento más allá de GLUE/SST-2 ni si hubo RLHF o DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, entrenada específicamente en SST-2.
- Atención subcuadrática: el autor declara complejidad efectiva O(N) u O(N log N) frente a O(N²) de la MHA estándar, orientada a secuencias largas.
- Reconstrucción modular: carga de solo los pesos de atención sobre la base BERT congelada mediante `trust_remote_code=True` o la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- Integración con Hugging Face Transformers vía `AutoModelForSequenceClassification` y `AutoTokenizer`.
- No se documentan tool calling, function calling, capacidades de agente, generación de texto libre, matemáticas, visión ni audio.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Clasificación de sentimiento en reseñas de producto en inglés: el modelo devuelve directamente la etiqueta binaria (0 negativo, 1 positivo) sobre SST-2, lo que lo hace adecuado como línea base de comparación frente a BERT-base en pipelines de análisis de opinión.
- Investigación sobre atención eficiente: sirve como referencia reproducible para medir la pérdida de accuracy al sustituir softmax por `naive_svd` en las 12 capas, con el par profesor/estudiante ya cuantificado (91,63 % vs. 90,37 %).
- Destilación de representaciones en caché: el protocolo descrito (278 pasos, 50 s en una RTX 3090, cero VRAM de profesor) es replicable para experimentar con otras variantes del attention zoo de NeuralOps.
- Moderación de comentarios a pequeña escala: al ser un clasificador BERT-base de ~110 M, puede ejecutarse en CPU o GPU de gama media para filtrar toxicidad o polaridad en foros en inglés, siempre con validación adicional.
- Evaluación comparativa de mecanismos atencionales: útil como punto de control en estudios que comparen softmax, linear attention y aproximaciones SVD sobre GLUE.
- Docencia y prototipado: el tamaño reducido del repositorio (~55 MB de pesos descargables, 0,4 GB de repo) y la licencia MIT facilitan su uso en entornos académicos y cuadernos de demostración.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`naive_svd`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,38 % | 90,37 % | +38,99 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2904 | no disponible |

Telemetría de entrenamiento reportada: 50,0 s, 278 pasos, 45.511,8 tokens/s, pico de 23.021 MB de VRAM en RTX 3090. No se publican resultados en otros subconjuntos de GLUE (MNLI, QQP, CoLA, etc.) ni comparaciones con otros mecanismos de atención.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo reconstruido ronda los ~110 M de parámetros; en FP16 requiere aproximadamente 0,25-0,5 GB incluyendo activaciones para secuencias cortas, y en FP32 alrededor de 0,5-1 GB. Cifra exacta no disponible en la información.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090); el autor validó el entrenamiento en una RTX 3090 de 24 GB, pero la inferencia no necesita ese margen.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM; también en CPU para lotes pequeños.
- Opciones de despliegue: Hugging Face Transformers (`AutoModelForSequenceClassification` con `trust_remote_code=True`), API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el único dato publicado es de entrenamiento (45.511,8 tokens/s en RTX 3090); no hay cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-naive-svd-sst2` | ~110 M (solo atención publicada) | no disponible | 90,37 % | MIT | Hugging Face, requiere código remoto |
| `google-bert/bert-base-uncased` (profesor) | ~110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, Transformers nativo |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face, Transformers nativo |
| Otros modelos del NeuralOps attention zoo | no disponible | no disponible | no disponible | MIT (según el repo) | Hugging Face |

La comparación con DistilBERT se incluye por categoría (clasificador SST-2 de tamaño reducido), pero no se dispone de su accuracy exacta en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en SST-2: no debe esperarse generalización a otras tareas de clasificación ni a otros dominios sin fine-tuning adicional.
- Solo inglés: no hay soporte multilingüe ni evaluación en otros idiomas.
- La accuracy del 90,37 % se mide sobre 872 muestras de validación; el intervalo de confianza es amplio y la diferencia de ~1,26 pp frente al profesor no se acompaña de test de significancia.
- El estudiante pre-destilación cae al 51,38 %, lo que indica que el mecanismo `naive_svd` por sí solo no iguala a softmax sin el proceso de destilación; la receta de entrenamiento es parte esencial del resultado.
- Requiere `trust_remote_code=True` y ejecución de código del autor (`modeling_neuralops_bert.py`): riesgo de seguridad y de mantenimiento a largo plazo.
- Los pesos publicados son solo de atención y cabeza de clasificación; la reconstrucción depende de que `bert-base-uncased` siga disponible y sin cambios.
- No se documentan sesgos demográficos ni evaluaciones de robustez; al heredar de BERT-base, es probable que arrastre sesgos del corpus original (no cuantificado en la información).
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador), pero sí de clasificaciones erróneas en textos ambiguos, sarcasmo o dominios distintos de reseñas.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de validación en producción recomienda evaluación propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-naive-svd-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Paper de BERT: https://arxiv.org/abs/1810.04805

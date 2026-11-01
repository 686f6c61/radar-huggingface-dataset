# Subha95/bengali-sentiment-v2

## Resumen

bengali-sentiment-v2 es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de google-bert/bert-base-multilingual-cased, el encoder BERT multilingüe de Google con 177.857.285 parámetros. Lo publica el usuario Subha95 en HuggingFace bajo licencia Apache 2.0 y está orientado a análisis de sentimiento en bengalí, aunque la model card no documenta explícitamente el conjunto de datos ni los idiomas de entrenamiento.

El modelo se generó automáticamente con el `Trainer` de Transformers y conserva la arquitectura original de BERT-base multilingüe: 12 capas de transformer, 768 dimensiones ocultas y 12 cabezas de atención, con una cabeza de clasificación adaptada a la tarea de sentimiento. El entrenamiento se realizó durante 3 épocas con un learning rate de 2e-05, batch size de 8 y el optimizador AdamW fused, alcanzando en la última época una pérdida de validación de 0.3462 y un F1 macro de 0.7174.

Su relevancia es limitada pero concreta: cubre un nicho poco atendido (análisis de sentimiento en bengalí) sobre una base multilingüe consolidada, con un tamaño que permite desplegarlo en hardware modesto. No obstante, la ausencia de documentación sobre el dataset, los idiomas y los casos de uso previstos obliga a tratar sus resultados con cautela y a validarlo empíricamente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base multilingüe) con cabeza de clasificación de secuencias |
| Parametros totales | 177.857.285 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | No disponible (el nombre sugiere bengalí; la base es multilingüe con 104 idiomas, pero el autor no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google-bert/bert-base-multilingual-cased, un encoder transformer bidireccional con 12 capas, 768 dimensiones ocultas, 12 cabezas de atención y aproximadamente 178 millones de parámetros. Sobre esta base se añadió una cabeza de clasificación (`BertForSequenceClassification`) cuyo número de etiquetas no se documenta en la model card. El vocabulario multilingüe de la base cubre 104 idiomas, lo que en principio permite procesar texto en bengalí y en otras lenguas, aunque el autor no confirma qué idiomas se usaron en el fine-tuning.

El entrenamiento se realizó con el `Trainer` de Transformers 5.21.0 sobre PyTorch 2.15.0+cu132, con 3 épocas, batch size de 8, learning rate de 2e-05, scheduler lineal y semilla 42. Se completaron 612 pasos (204 por época). La model card indica que el dataset de entrenamiento es "None", es decir, no se declara: no hay información sobre el número de ejemplos, la composición del corpus, el balance de clases ni si hubo aumentación de datos. Tampoco se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador supervisado. La pérdida de entrenamiento descendió de 0.3892 a 0.3004 y la de validación de 0.3781 a 0.3462, sin señales claras de sobreajuste en las tres épocas registradas.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento (presumiblemente positivo/negativo/neutro, aunque el número de clases no se documenta) a una secuencia de entrada.
- Procesamiento de texto en bengalí: el nombre del modelo y la base multilingüe apuntan a este idioma como objetivo principal.
- Soporte multilingüe potencial: al derivar de BERT-base multilingüe, puede procesar texto en cualquiera de los 104 idiomas de la base, aunque el rendimiento fuera del bengalí no está validado.
- Embeddings de texto: la torre encoder puede usarse para extraer representaciones contextuales (tag `text-embeddings-inference`).
- Compatibilidad con endpoints: etiquetado como `endpoints_compatible`, apto para despliegue en HuggingFace Inference Endpoints.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Análisis de sentimiento en redes sociales en bengalí: clasificar tuits, comentarios de Facebook o publicaciones de foros en bengalí para monitorizar la percepción de una marca o de un evento. El modelo está afinado específicamente para esta tarea y su tamaño permite procesar lotes grandes en CPU.
- Moderación de comentarios: filtrar automáticamente comentarios negativos o tóxicos en plataformas con audiencia bengalí, usando la etiqueta de sentimiento como señal previa a una revisión humana.
- Análisis de opiniones de productos: procesar reseñas de e-commerce en bengalí para agregar la satisfacción de los clientes por producto o categoría y alimentar dashboards de negocio.
- Monitorización de reputación de marca: ingesta continua de menciones en bengalí y clasificación por sentimiento para alertar en tiempo real cuando el volumen de menciones negativas supera un umbral.
- Investigación en PLN de bajos recursos: servir como baseline o punto de comparación en estudios sobre análisis de sentimiento en lenguas del sur de Asia, dado que los modelos específicos para bengalí son escasos.
- Enrutamiento de tickets de soporte: clasificar la opinión expresada en el primer mensaje de un ticket escrito en bengalí para priorizar casos con sentimiento negativo y reducir el tiempo de respuesta.
- Etiquetado asistido de corpus: pre-anotar grandes volúmenes de texto en bengalí con sentimiento estimado, que luego revisores humanos corrigen, acelerando la creación de datasets.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (autorreportados, sin especificar el dataset):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 (final) |
|---|---|---|---|
| Training loss | 0.3892 | 0.3557 | 0.3004 |
| Validation loss | 0.3781 | 0.3613 | 0.3462 |
| F1 macro | 0.5848 | 0.6813 | 0.7174 |
| F1 micro | 0.6937 | 0.7429 | 0.7611 |
| Precision macro | 0.8163 | 0.8102 | 0.8027 |
| Recall macro | 0.5252 | 0.6203 | 0.6725 |
| Exact match accuracy | 0.3943 | 0.4829 | 0.5171 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El model-index del autor está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,7 GB solo para pesos (178 M de parámetros × 4 bytes), más activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en FP16: aproximadamente 0,35 GB para pesos; en INT8, unos 0,18 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas NVIDIA T4, RTX 3060, RTX 4090, A100 o H100. El modelo es lo bastante pequeño para ejecutarse también en CPU con latencias aceptables para clasificación por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PyTorch, HuggingFace Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), ONNX Runtime y TorchScript. llama.cpp, Ollama y vLLM no son aplicables de forma nativa a un encoder BERT de clasificación, aunque vLLM soporta algunos modelos BERT para embeddings.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera un throughput alto en GPU (miles de secuencias por segundo en lotes) y decenas a cientos de secuencias por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Subha95/bengali-sentiment-v2 | 177,9 M | 512 tokens | Clasificación de sentimiento (bengalí) | Apache 2.0 | HuggingFace, 31 descargas |
| google-bert/bert-base-multilingual-cased | 177,9 M | 512 tokens | Encoder multilingüe base (sin cabeza de tarea) | Apache 2.0 | HuggingFace, ampliamente usado |
| Modelos de sentimiento en bengalí de terceros | No disponible | No disponible | Clasificación de sentimiento | Variable | No verificado en la información disponible |

La comparación con alternativas específicas de sentimiento en bengalí no está disponible: no se han identificado en la información proporcionada otros modelos comparables con métricas publicadas. Frente a su base, la única diferencia es la cabeza de clasificación y el fine-tuning; el resto de la arquitectura y el tamaño son idénticos.

## Limitaciones y advertencias

- Dataset de entrenamiento no declarado: la model card indica "None dataset", por lo que se desconoce el dominio, el tamaño, el balance de clases y la procedencia de los datos. Esto impide evaluar la representatividad y el riesgo de sesgos.
- Idiomas no confirmados: aunque el nombre sugiere bengalí, el autor no especifica los idiomas de entrenamiento ni de evaluación; el rendimiento en otros idiomas es incierto.
- Métricas modestas: F1 macro de 0.7174 y exact match accuracy de 0.5171 en el conjunto de evaluación indican un rendimiento limitado, especialmente en exactitud por secuencia, lo que sugiere confusión entre clases o un problema de desbalance.
- Riesgo de sobreajuste al dominio: al no documentarse el corpus, el modelo puede degradarse fuera del registro o la temática de los datos originales.
- Sin información sobre sesgos: no hay análisis de sesgos demográficos, dialectales ni de género; en bengalí, las variaciones dialectales y la mezcla con inglés (code-switching) son frecuentes y podrían afectar al rendimiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y verificar la licencia de los datos de entrenamiento, que no se declaran.
- Modelo de clasificación, no generativo: no debe usarse para generación de texto, razonamiento ni tareas conversacionales; su uso está acotado a clasificación y extracción de embeddings.
- Sin benchmarks externos: no hay resultados en conjuntos de referencia públicos, por lo que la comparación con el estado del arte en sentimiento en bengalí no es posible con los datos disponibles.
- Repositorio con pocas señales de validación: 31 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de revisión por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Subha95/bengali-sentiment-v2
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Paper de BERT multilingüe (Devlin et al., 2019): https://arxiv.org/abs/1901.07291

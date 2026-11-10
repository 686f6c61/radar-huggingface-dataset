# tahamajs/bert-optimized-hybrid-attention-sst2

## Resumen

`tahamajs/bert-optimized-hybrid-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `optimized_hybrid_attention` de la librería NeuralOps, con complejidad operativa subcuadrática (O(N) u O(N log N)). Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps ("Subquadratic Attention Zoo") y está afinado para clasificación binaria de sentimiento en la tarea SST-2 de GLUE.

El modelo no se distribuye como un transformer completo: el repositorio contiene únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB, `attention_weights.safetensors`), y un shim de código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo cargando los pesos congelados de `bert-base-uncased` desde el Hub. La destilación se realizó con el protocolo *Cached Representation Distillation* de NeuralOps sobre una única RTX 3090, con 185 pasos de optimización y 59,4 s de entrenamiento.

Su relevancia es acotada pero clara: sirve como referencia reproducible de cómo sustituir atención cuadrática por alternativas subcuadráticas en un backbone estándar sin pérdida de accuracy en la tarea evaluada (91,63 % en SST-2, idéntico al teacher), y como ejemplo de serialización modular de pesos de atención. No obstante, es un artefacto de investigación con licencia MIT, cero descargas y sin benchmarks más allá de SST-2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `optimized_hybrid_attention` (subcuadrática) en las 12 capas |
| Parametros totales | 110 M (base BERT-Base); pesos publicados: solo atención + cabeza de clasificación (~55 MB FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de `bert-base-uncased`, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 en los pesos de atención publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16), serialización modular "attention-only" |
| Libreria | `neuralops` (requiere `trust_remote_code=True` en Transformers) |
| Modelo base | `google-bert/bert-base-uncased` |
| Tarea | Clasificación binaria de sentimiento (SST-2, GLUE) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT-Base estándar (12 capas, 768 de dimensión oculta, 12 cabezas) en el que cada bloque de self-attention softmax cuadrática O(N²) se reemplaza por `optimized_hybrid_attention`, un mecanismo híbrido de complejidad efectiva O(N) u O(N log N). Los pesos del backbone permanecen congelados; solo se entrenan y publican los parámetros de atención y la cabeza de clasificación. El shim de código remoto inicializa el base desde `bert-base-uncased` y aplica encima los pesos destilados.

El entrenamiento sigue el *NeuralOps Cached Representation Distillation Protocol*: alineamiento de representaciones ocultas en subespacio (etapa 1) seguido de KL sobre logits más entropía cruzada de la tarea (etapa 2), con las representaciones del teacher cacheadas offline para no reservar VRAM del teacher. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB), con 185 pasos, 59,4 s de duración, throughput de 25 534,7 tokens/s y un pico de 9 664 MB de VRAM. El dataset de evaluación y ajuste es SST-2 (split de validación de 872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, con salida de logits de dos clases.
- Inferencia compatible con `AutoModelForSequenceClassification` de Transformers mediante `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`neuralops.hub.bert_zoo.load_pretrained_bert`) reconstruyendo la atención sobre el BERT base.
- Eficiencia teórica subcuadrática en secuencias largas respecto a la atención cuadrática original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas de clasificación.
- Multilingüismo: no disponible; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: clasificación binaria de opiniones en inglés con un modelo de 110 M y ~55 MB de pesos de atención, adecuado para despliegue de bajo coste en CPU o GPU modesta.
- Moderación de comentarios en foros: filtrado rápido de tono negativo/positivo en pipelines de preprocesado antes de modelos generativos más caros.
- Investigación en atención subcuadrática: banco de pruebas reproducible para comparar `optimized_hybrid_attention` frente a MHA estándar en una tarea GLUE concreta, con pesos de atención aislados y fáciles de intercambiar.
- Docencia y experimentación con destilación: ejemplo completo del protocolo de destilación con representaciones cacheadas (185 pasos, <1 min en una RTX 3090) para replicar el flujo en otros backbones.
- Prototipado de clasificadores de texto: punto de partida para fine-tuning adicional sobre SST-2 u otras tareas de clasificación de secuencias en inglés.
- Evaluación de eficiencia en secuencias largas: medir empíricamente el escalado O(N) frente a O(N²) en inferencia con entradas de hasta 512 tokens, aunque la model card no documenta resultados en este régimen.
- Integración en entornos con restricciones de memoria: al publicar solo ~55 MB de atención FP16, encaja en despliegues donde no se quiere almacenar el checkpoint completo de 450 MB.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Teacher (`bert-base-uncased`) | Student pre-KD | Student post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 91,63 % | 91,63 % | +0,00 % |
| Cross-entropy de validación | 0,2428 | sin calibrar | 0,3081 | — |

Telemetría de entrenamiento (RTX 3090 24 GB): 59,4 s, 185 pasos, 25 534,7 tokens/s, pico de 9 664 MB de VRAM. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada; con un backbone BERT-Base de 110 M en FP32 se sitúa típicamente por debajo de 1 GB, pero el dato no está confirmado en la model card.
- GPU de referencia del autor: NVIDIA GeForce RTX 3090 (24 GB) para entrenamiento y destilación.
- Cabe en GPU de consumo: sí, por tamaño del backbone; no se documentan pruebas en GPUs concretas distintas de la RTX 3090.
- Opciones de despliegue: Transformers con `trust_remote_code=True` y la librería `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo es de clasificación y requiere código remoto personalizado).
- Latencia y throughput: solo se reporta throughput de entrenamiento (25 534,7 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-optimized-hybrid-attention-sst2` | 110 M (base) + atención destilada | no disponible | 91,63 % | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (teacher) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned en SST-2 | ~125 M | 512 tokens | no disponible en esta información | MIT | Hugging Face |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada; las cifras de SST-2 de los modelos comparables no se han verificado aquí.

## Limitaciones y advertencias

- Modelo de clasificación binaria de sentimiento: no genera texto ni sirve para tareas generativas, de razonamiento o de código.
- Solo inglés; no hay soporte multilingüe documentado.
- Entrenado y evaluado exclusivamente en SST-2 (872 muestras de validación); el rendimiento en otros dominios o datasets no está documentado.
- Riesgo de sobreajuste a la distribución de SST-2 y de degradación fuera de dominio; no se han publicado análisis de sesgos.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en entradas ambiguas o de dominio distinto.
- Requiere `trust_remote_code=True` y la librería `neuralops`: introduce dependencia de código remoto y superficie de seguridad adicional en producción.
- Los pesos publicados son solo de atención y cabeza; sin el backbone `bert-base-uncased` descargado aparte el modelo no funciona.
- Licencia MIT permite uso comercial, pero no hay garantías ni validación en producción por parte del autor.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni mantenimiento demostrado.
- No se documenta el comportamiento en secuencias cercanas al límite de contexto ni el escalado real del mecanismo subcuadrático en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-optimized-hybrid-attention-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: no disponible enlace directo en la información proporcionada
- Paper o blog del método: no disponible en la información proporcionada

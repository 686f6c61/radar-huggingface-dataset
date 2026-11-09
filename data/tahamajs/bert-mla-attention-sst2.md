# tahamajs/bert-mla-attention-sst2

## Resumen

`tahamajs/bert-mla-attention-sst2` es un checkpoint de BERT-Base (110M parametros) en el que el autor, Taha Majlesi, ha sustituido los bloques de atencion softmax cuadratica de las 12 capas del transformer por el mecanismo `mla_attention` de su libreria NeuralOps, con complejidad operativa subcuadratica (O(N) u O(N log N) segun la model card). El modelo resultante se ha destilado desde `bert-base-uncased` sobre la tarea SST-2 del benchmark GLUE mediante el protocolo "Cached Representation Distillation" de NeuralOps, que cachea las representaciones del profesor en disco para no reservar VRAM adicional durante el entrenamiento.

El interes practico es doble: por un lado, demuestra que es posible recuperar casi todo el rendimiento del profesor original (89,22 % de accuracy frente al 91,63 % de `bert-base-uncased`) tras reemplazar la atencion cuadratica por una subcuadratica, lo que abre la puerta a BERTs mas eficientes en contextos largos; por otro, el repositorio solo publica los pesos de atencion y la cabeza de clasificacion en FP16 (~55 MB), no el modelo completo, lo que ilustra una serializacion modular y eficiente en almacenamiento.

Es un modelo de investigacion, no un producto listo para produccion: el autor lo publica como parte de un "Attention Zoo" comparativo, con cero descargas y cero likes en el momento de redactar esta ficha, y depende de codigo remoto (`trust_remote_code=True`) para reconstruir el modelo completo a partir de los pesos base congelados de `bert-base-uncased`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atencion `mla_attention` subcuadratica en las 12 capas |
| Parametros totales | 110M (heredados de BERT-Base; el repo solo publica ~55 MB de pesos de atencion y cabeza de clasificacion) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica una ventana distinta de la de BERT-Base, 512 tokens) |
| Tipos de cuantizacion | FP16 (pesos publicados en `attention_weights.safetensors`); no se documentan otras cuantizaciones |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atencion y cabeza, FP16); requiere `bert-base-uncased` para los pesos base congelados |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, 768 de hidden, 12 cabezas) y reemplaza en todas las capas el bloque de atencion multi-cabeza estandar por `mla_attention`, un mecanismo de la libreria NeuralOps que, segun la model card, reduce la complejidad efectiva de O(N²) a O(N) u O(N log N). El resto del encoder (embeddings, feed-forward, normalizacion) se mantiene congelado desde el modelo base; el repositorio solo contiene los pesos entrenados de atencion y la cabeza de clasificacion binaria en FP16 (~55 MB), y el codigo remoto (`modeling_neuralops_bert.py`) reconstruye el modelo completo al vuelo.

El entrenamiento se realizo con el protocolo "Cached Representation Distillation" de NeuralOps en dos etapas: primero una alineacion de subespacio oculto (Stage 1) y despues una combinacion de KL sobre logits y entropia cruzada sobre la tarea (Stage 2). Se ejecuto en una unica NVIDIA RTX 3090 de 24 GB, con 271 pasos de optimizacion, 48,8 segundos de duracion total y un throughput efectivo de 45.463,2 tokens/s, alcanzando un pico de 23.021 MB de VRAM (sin coste adicional por el profesor gracias al cacheado offline de representaciones). El dataset de evaluacion y ajuste es SST-2 de GLUE (clasificacion binaria de sentimiento, 872 muestras de validacion).

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) en ingles, con salida de logits de dos clases.
- Comprension de lenguaje natural basica heredada de BERT-Base (representaciones contextuales de 768 dimensiones).
- Atencion subcuadratica: en teoria, mejor escalado a secuencias largas que la atencion cuadratica estandar, aunque la model card no documenta evaluaciones con contextos superiores a los de BERT-Base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No soporta vision, audio ni modo "thinking".
- Multilingue: no, solo ingles.

## Casos de uso

- Clasificacion de sentimiento en resenas de producto o comentarios de usuarios en ingles: el modelo devuelve directamente una etiqueta binaria por secuencia, adecuado para pipelines de analisis de opinion a gran escala.
- Moderacion de contenido basica en ingles: como clasificador de polaridad puede usarse como primera etapa de filtrado antes de modelos mas costosos.
- Enrutamiento de tickets de soporte: la señal de sentimiento puede priorizar conversaciones negativas en un sistema de atencion al cliente.
- Investigacion sobre atencion subcuadratica: sirve como punto de comparacion reproducible frente a BERT-Base estandar en SST-2 para estudiar el coste/beneficio de `mla_attention`.
- Destilacion y eficiencia energetica: el protocolo de destilacion con cache offline (48,8 s en una RTX 3090) es replicable para experimentos de compresion en entornos con VRAM limitada.
- Benchmarking de librerias de atencion: util como caso de prueba dentro del "Attention Zoo" de NeuralOps para validar la integracion con `transformers` mediante `trust_remote_code=True`.
- Prototipado educativo: ejemplo minimo de como sustituir el bloque de atencion de un transformer preentrenado sin reentrenar desde cero.

## Benchmarks y rendimiento

Evaluacion sobre el split de validacion de GLUE SST-2 (872 muestras binarias), segun la model card:

| Metrica | Teacher (`bert-base-uncased`) | Student pre-KD (`mla_attention`) | Student post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 75,57 % | 89,22 % | +13,65 pp |
| Cross-entropy de validacion | 0,2428 | no calibrada | 0,3183 | convergida |

Telemetria de entrenamiento (RTX 3090, 24 GB): 48,8 s de duracion, 271 pasos, 45.463,2 tokens/s de throughput efectivo, 23.021 MB de VRAM pico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB de pesos (110M parametros), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en una RTX 3090. Para inferencia basta una GTX 1650, RTX 3050 o superior; en CPU es viable para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (metodo documentado); la API `neuralops.hub.bert_zoo.load_pretrained_bert` para carga modular. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas herramientas no aplican de forma directa.
- Latencia y throughput: no se publican cifras de inferencia; solo la telemetria de entrenamiento (45.463,2 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-mla-attention-sst2` | 110M | no disponible (base BERT: 512) | 89,22 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (teacher) | 110M | 512 | 91,63 % (segun la model card) | Apache 2.0 | Hugging Face, `transformers` nativo |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` nativo |
| `textattack/bert-base-uncased-SST-2` | 110M | 512 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` nativo |

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, a pesar de que BERT-Base original es multilingue en su variante `bert-base-multilingual-cased`.
- Tarea unica: es un clasificador binario de sentimiento; no sirve para generacion, extraccion de entidades, QA ni otras tareas sin reentrenar la cabeza.
- Brecha frente al profesor: pierde 2,41 puntos de accuracy respecto a `bert-base-uncased` (89,22 % vs 91,63 %) y la cross-entropy de validacion empeora (0,3183 vs 0,2428).
- Dependencia de codigo remoto: requiere `trust_remote_code=True` y descargar `bert-base-uncased` por separado; el repositorio no es autocontenido y depende de la libreria NeuralOps y de su API para reconstruir el modelo.
- Riesgo de alucinacion: bajo en el sentido generativo (no genera texto), pero puede producir clasificaciones erroneas en dominios alejados de SST-2 (resenas de pelicula), especialmente en textos ironicos o de dominio especializado.
- Sesgos: hereda los sesgos de `bert-base-uncased` y de SST-2, un dataset de resenas de cine con posibles sesgos demograficos y de dominio.
- Madurez: cero descargas y cero likes en el momento de la ficha; creado y actualizado el mismo dia (2026-11-09), sin validacion externa ni revision por pares.
- Licencia MIT permite uso comercial, pero el codigo de NeuralOps y el modelo base `bert-base-uncased` (Apache 2.0) tienen sus propias condiciones que deben respetarse por separado.
- Sin soporte documentado para herramientas de despliegue estandar (vLLM, TGI, llama.cpp, Ollama), lo que complica su integracion en infraestructura de produccion existente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-mla-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue
- Paper de referencia de BERT: https://arxiv.org/abs/1810.04805

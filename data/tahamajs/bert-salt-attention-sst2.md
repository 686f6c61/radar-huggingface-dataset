# tahamajs/bert-salt-attention-sst2

## Resumen

`tahamajs/bert-salt-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `salt_attention` de la librería NeuralOps, con complejidad operativa subcuadrática (O(N) u O(N log N)) frente a la O(N²) de la atención multi-cabeza estándar. Lo desarrolla Taha Majlesi dentro del proyecto NeuralOps, un "attention zoo" que compara mecanismos de atención alternativos sobre arquitecturas preentrenadas.

El modelo se ha destilado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés), partiendo de `bert-base-uncased` como profesor. El repositorio no contiene los pesos completos de BERT, sino únicamente los pesos de atención y la cabeza de clasificación en FP16 (unos 55 MB), que se aplican sobre los pesos base congelados descargados al vuelo mediante código remoto.

Su relevancia es fundamentalmente experimental: demuestra que es viable sustituir la atención cuadrática de un transformer preentrenado por una variante subcuadrática y recuperar buena parte del rendimiento mediante destilación de representaciones en caché (de 53,67 % a 80,73 % de accuracy en SST-2), aunque queda lejos del profesor (91,63 %). No es un modelo pensado para producción general, sino una pieza de investigación sobre eficiencia atencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `salt_attention` subcuadrática en las 12 capas |
| Parametros totales | 110 M (base BERT-Base; el repo solo serializa atención y cabeza de clasificación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | FP16 en los pesos de atención; no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, ~55 MB) más código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros) y reemplaza en todas las capas el bloque de atención softmax cuadrática por `salt_attention`, un mecanismo de la librería NeuralOps con escalado subcuadrático declarado de O(N) u O(N log N). El resto de la arquitectura (embeddings, feed-forward, normalización) se mantiene congelado y se inicializa desde el checkpoint original de BERT en tiempo de carga; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol", una destilación en dos etapas: primero alineación de subespacio oculto y después KL sobre logits más entropía cruzada de la tarea, con las representaciones del profesor cacheadas de forma offline para no ocupar VRAM adicional. Según la model card, se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 58,0 s, con 248 pasos de optimización, un throughput efectivo de 35 047,4 tokens/s y un pico de VRAM de 7361 MB. El conjunto de datos es la tarea SST-2 de GLUE; no se detalla el número de tokens de entrenamiento ni la composición completa del corpus más allá de SST-2.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, tarea SST-2 de GLUE.
- Clasificación de secuencias cortas mediante `AutoModelForSequenceClassification` con `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert` para reconstruir el modelo sobre BERT base.
- Atención subcuadrática con coste O(N) u O(N log N) declarado, orientada a secuencias largas.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; solo se declara inglés.

## Casos de uso

- Análisis de sentimiento en reseñas o comentarios en inglés: el modelo devuelve una etiqueta binaria por secuencia y puede integrarse en pipelines de moderación o monitorización de opinión con `transformers`.
- Investigación sobre eficiencia atencional: sirve como punto de comparación reproducible entre atención cuadrática y `salt_attention` sobre el mismo backbone y la misma tarea.
- Destilación de representaciones en caché: el protocolo descrito (profesor offline, cero VRAM extra) es reutilizable para adaptar otros mecanismos de atención a modelos preentrenados con recursos limitados.
- Prototipado rápido en GPU de consumo: con ~55 MB de pesos de atención y un pico de 7,3 GB en entrenamiento, cabe en tarjetas como la RTX 3090 o similares para experimentos de fine-tuning.
- Docencia y experimentación con arquitecturas alternativas: permite mostrar de forma práctica cómo se sustituye un bloque de atención y se recupera rendimiento vía KD.
- Evaluación de robustez de clasificadores ligeros: útil para medir la brecha frente al profesor BERT-Base en tareas de comprensión de lenguaje antes de desplegar variantes subcuadráticas.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de SST-2 (872 muestras de clasificación binaria), según la model card:

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`salt_attention`) | Modelo destilado post-KD |
|---|---:|---:|---:|
| Accuracy GLUE SST-2 | 91,63 % | 53,67 % | 80,73 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4645 |

Delta de accuracy tras la destilación: +27,06 puntos. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de BERT-Base (110 M) más los pesos de atención en FP16, el modelo completo ocupa del orden de cientos de MB en FP16, aunque la cifra exacta no se documenta.
- VRAM de entrenamiento observada: 7361 MB de pico en una RTX 3090 (24 GB) con el protocolo de destilación en caché.
- GPU recomendadas: cualquier GPU con al menos ~8 GB para el flujo de destilación descrito; para inferencia basta con GPUs de consumo modestas o incluso CPU, aunque no se aportan cifras.
- Cabe en GPU de consumo: sí, según el pico de VRAM reportado (RTX 3090 y tarjetas con VRAM similar o superior).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 35 047,4 tokens/s en RTX 3090; no se reportan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-salt-attention-sst2` | 110 M (base) | no disponible | 80,73 % | MIT | Hugging Face (código remoto) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens (típico) | 91,63 % (referencia en la model card) | Apache 2.0 | Hugging Face |
| Alternativas subcuadráticas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos del "attention zoo" de NeuralOps ni de variantes subcuadráticas equivalentes para establecer una comparación más amplia.

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 80,73 % frente a 91,63 % en SST-2, una brecha de casi 11 puntos que lo hace poco adecuado para producción sensible a la precisión.
- Entropía cruzada de validación de 0,4645, notablemente superior a la del profesor (0,2428), lo que indica menor calibración de las probabilidades.
- Solo se ha evaluado en una tarea (SST-2) y en inglés; no hay evidencia de generalización a otras tareas de GLUE ni a otros dominios.
- Requiere `trust_remote_code=True` y ejecuta código remoto (`modeling_neuralops_bert.py`), lo que implica revisar el código antes de usarlo en entornos controlados.
- El repositorio no contiene los pesos completos: depende de la descarga de `bert-base-uncased` y de la librería `neuralops` para reconstruir el modelo, lo que añade dependencias y puntos de fallo.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un clasificador, el riesgo se traslada a etiquetas erróneas o sesgadas en dominios distintos del entrenamiento.
- Sin datos publicados de robustez, sesgo demográfico ni comportamiento fuera de distribución.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` mantiene su propia licencia (Apache 2.0) y debe respetarse.
- Fecha de creación del repositorio (2026-11-09) y ausencia de descargas o likes sugieren que es un artefacto de investigación reciente sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-salt-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

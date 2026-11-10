# tahamajs/bert-lola-attention-sst2

## Resumen

`bert-lola-attention-sst2` es un checkpoint de clasificación de sentimiento en inglés publicado por Taha Majlesi (tahamajs) bajo el paraguas del proyecto NeuralOps. Se trata de un BERT-Base (110 M de parámetros) en el que las doce capas de atención softmax cuadrática originales se han sustituido por el mecanismo `lola_attention`, una atención subcuadrática con complejidad efectiva O(N) u O(N log N) que forma parte del llamado Attention Zoo de NeuralOps. El modelo se ha destilado desde el `bert-base-uncased` original sobre la tarea SST-2 del benchmark GLUE.

La relevancia del checkpoint es fundamentalmente metodológica: demuestra que es posible reemplazar la atención cuadrática de un transformer preentrenado por una variante subcuadrática y recuperar buena parte del rendimiento mediante destilación de representaciones en caché (protocolo "Cached Representation Distillation" de NeuralOps), sin necesidad de reentrenar el modelo base completo. El resultado reportado es un 82,68 % de accuracy en el split de validación de SST-2 (872 muestras), frente al 91,63 % del profesor BERT-Base y un 53,67 % del estudiante antes de destilar.

El repositorio no contiene los pesos completos del modelo, sino únicamente los pesos de atención y la cabeza de clasificación en FP16 (unos 55 MB en `attention_weights.safetensors`). El código remoto (`modeling_neuralops_bert.py`) reconstruye el modelo cargando los pesos congelados de `bert-base-uncased` desde el Hub y aplicando encima los parámetros de atención destilados. Está pensado como pieza de investigación dentro del ecosistema NeuralOps, no como un clasificador listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `lola_attention` subcuadrática en las 12 capas |
| Parámetros totales | 110 M (BERT-Base); el repo solo serializa atención + cabeza de clasificación (~55 MB en FP16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base BERT-Base soporta 512 tokens; el autor no especifica el contexto efectivo de `lola_attention`) |
| Tipos de cuantización | No disponible (pesos publicados en FP16; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) + pesos base descargados de `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 110 M de parámetros, y sustituye en todas las capas el bloque de multi-head attention softmax estándar por `lola_attention`, un mecanismo de atención subcuadrática con complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la atención cuadrática. La serialización es modular: solo se publican los pesos de atención especializados y la cabeza de clasificación, mientras que el resto del encoder se inicializa congelado desde el checkpoint original de Google.

El entrenamiento sigue el protocolo NeuralOps Cached Representation Distillation, que alinea representaciones del profesor en modo offline para evitar mantener el profesor en VRAM durante la destilación. El proceso consta de dos etapas: una primera de alineamiento de subespacio oculto y una segunda con pérdida KL sobre logits más entropía cruzada de la tarea. Se ejecutó en una NVIDIA GeForce RTX 3090 de 24 GB, con 218 pasos de optimización, 51,9 segundos de duración total, un throughput efectivo de 34 430,5 tokens/s y un pico de VRAM de 8360 MB. No se documentan detalles sobre el corpus de destilación más allá de SST-2 ni sobre el uso de RLHF o DPO (no aplicables a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo), específicamente sobre el formato de la tarea SST-2 de GLUE.
- Inferencia con la API estándar de Hugging Face Transformers (`AutoModelForSequenceClassification`) usando `trust_remote_code=True`.
- Carga modular a través de la API de NeuralOps (`load_pretrained_bert` con `attention_type="lola_attention"`).
- Atención subcuadrática: el interés técnico es la eficiencia asintótica en secuencias largas, aunque el autor no publica mediciones de escalado ni de latencia a distintas longitudes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe limitada al inglés; no se reportan evaluaciones en otros idiomas.

## Casos de uso

- Investigación sobre atención subcuadrática: sirve como punto de partida reproducible para estudiar cómo afecta `lola_attention` a la calidad de representaciones de un BERT preentrenado, comparando directamente contra `bert-base-uncased`.
- Destilación de mecanismos de atención alternativos: el protocolo Cached Representation Distillation y los 218 pasos documentados permiten replicar el experimento en una única GPU de consumo (RTX 3090) en menos de un minuto de cómputo.
- Clasificación de sentimiento en prototipos: para demos o pipelines internos donde el 82,68 % de accuracy en SST-2 sea suficiente y se acepte el coste de descargar el modelo base completo.
- Benchmark de eficiencia de atención: útil para medir empíricamente la ganancia de complejidad O(N) frente a O(N²) en secuencias largas, aunque el autor no publica dichas mediciones y habría que realizarlas.
- Base para fine-tuning ligero: al publicarse solo los pesos de atención y la cabeza, se puede experimentar con adaptadores sobre el mismo esqueleto congelado sin reentrenar los 110 M de parámetros.
- Docencia y divulgación: ejemplo compacto y de código abierto (MIT) de sustitución de atención en un transformer estándar con destilación, útil en cursos de arquitecturas eficientes.

## Benchmarks y rendimiento

Evaluación reportada por el autor sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 53,67 % | 82,68 % | +29,01 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,3921 | convergido |

Telemetría de entrenamiento declarada: RTX 3090 (24 GB), 51,9 s, 218 pasos, 34 430,5 tokens/s, pico de VRAM 8360 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K u otros) ni comparaciones con modelos de atención eficiente de terceros.

## Requisitos de hardware

- VRAM en inferencia: el modelo necesita cargar el BERT-Base completo (~440 MB en FP32) más los pesos de atención en FP16 (~55 MB); en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el autor entrenó en una RTX 3090. Para inferencia batch, una RTX 3060 de 12 GB o superior es más que suficiente.
- Cabe en GPU de consumo: sí, en todas las NVIDIA consumer desde la serie GTX 10xx en adelante, así como en CPU (la inferencia sería más lenta pero viable para clasificación de frases).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` (requiere el código remoto del repo) y la API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para inferencia; solo se publica throughput de entrenamiento (34 430,5 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-lola-attention-sst2` | 110 M (BERT-Base) | no disponible | 82,68 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (fine-tuned SST-2, profesor) | 110 M | 512 tokens | 91,63 % | Apache 2.0 | Hugging Face, estándar |
| `textattack/bert-base-uncased-SST-2` (referencia típica) | 110 M | 512 tokens | ~92-93 % (referencia habitual en la literatura) | Apache 2.0 | Hugging Face |
| Alternativas de atención eficiente (Longformer, BigBird) | 110-150 M | 4096 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación directa con fine-tunes estándar de BERT-Base en SST-2 sitúa a este checkpoint unos 9-10 puntos por debajo en accuracy, lo que refleja el coste de sustituir la atención cuadrática por una subcuadrática sin reentrenar el modelo base completo. No se dispone de datos de modelos comparables de atención subcuadrática evaluados específicamente en SST-2 dentro de la información proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al profesor: 82,68 % frente a 91,63 % en SST-2; no es adecuado para producción donde se requiera precisión cercana al estado del arte.
- El estudiante pre-destilación cae al 53,67 %, lo que indica que el mecanismo de atención por sí solo no preserva las representaciones originales sin destilación.
- Solo inglés y solo clasificación de sentimiento binaria; no es un modelo generativo ni sirve para otras tareas sin fine-tuning adicional.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en entornos sensibles.
- Dependencia del modelo base: necesita descargar `bert-base-uncased` desde el Hub, por lo que el footprint real no son 55 MB sino ~500 MB.
- Riesgo de alucinación no aplica en sentido estricto (es un clasificador), pero sí puede producir clasificaciones erróneas o sobreconfiadas en dominios distintos de SST-2.
- No hay evaluación de sesgos ni de robustez fuera de SST-2; el dataset de evaluación es pequeño (872 muestras) y de dominio cinematográfico.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0 y sus términos también aplican.
- Proyecto con 0 descargas y 0 likes en el momento de la ficha; sin mantenimiento ni comunidad verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-lola-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia en el repositorio NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue

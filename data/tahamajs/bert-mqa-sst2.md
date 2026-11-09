# tahamajs/bert-mqa-sst2

## Resumen

`tahamajs/bert-mqa-sst2` es un checkpoint derivado de `google-bert/bert-base-uncased` en el que las doce capas de atención softmax cuadrática del transformer original se han sustituido por el mecanismo `mqa` (multi-query attention) implementado en la librería NeuralOps. El modelo lo publica Taha Majlesi bajo el paraguas del proyecto NeuralOps, un "attention zoo" que busca evaluar mecanismos de atención subcuadráticos sobre arquitecturas BERT preentrenadas. El checkpoint está ajustado para clasificación binaria de sentimiento en la tarea SST-2 del benchmark GLUE.

La relevancia del modelo no reside en su calidad predictiva, sino en su función como sonda experimental: demuestra el flujo completo de destilación de representaciones con asignación cero de VRAM al profesor y serialización modular de solo los pesos de atención en FP16 (~55 MB). El checkpoint acompaña a un repositorio de código (`NeuralOps`) que reconstruye el modelo base congelado y aplica encima los pesos de atención destilados.

Arquitectónicamente es un transformer encoder de 12 capas con 110 millones de parámetros heredados de BERT-Base, pero con atención multi-query en lugar de multi-head. El resultado empírico es contundente: la precisión en SST-2 se queda en el 50,92 %, idéntica a la de un clasificador aleatorio binario, muy por debajo del 91,63 % del profesor. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Base) con atención multi-query (MQA) subcuadrática |
| Parametros totales | 110 M (base BERT-Base); el repo solo almacena ~55 MB de pesos de atención y cabeza de clasificación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base; típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 para los pesos de atención; el resto de pesos del base en su formato original |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB); requiere `trust_remote_code=True` y reconstrucción del base |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros, y reemplaza en todas las capas el bloque de atención multi-head estándar por el mecanismo `mqa` de NeuralOps, que promete complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la atención cuadrática. La serialización es modular: el repositorio no reempaqueta los 450 MB del BERT base congelado, sino solo los pesos de atención destilados y la cabeza de clasificación en FP16 (~55 MB). El código remoto (`modeling_neuralops_bert.py`) inicializa el base congelado desde `bert-base-uncased` y aplica los pesos destilados en tiempo de carga.

El entrenamiento se realizó con el "NeuralOps Cached Representation Distillation Protocol", que cachea offline las representaciones del profesor para evitar asignar VRAM al modelo docente durante la destilación. El proceso se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) del clúster HPC Sharif, con una duración de 48,5 segundos, 330 pasos de optimización en dos fases (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea) y un throughput efectivo de 55.788,1 tokens/segundo. El pico de VRAM fue de 23.021 MB. No se documentan en la model card el número total de tokens de entrenamiento, la composición del dataset más allá de GLUE/SST-2, ni si hubo RLHF o DPO (no aplicable a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) sobre texto en inglés, limitada a la tarea SST-2.
- Inferencia estándar vía `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`load_pretrained_bert`) que reconstruye el modelo sobre el base congelado.
- Atención subcuadrática de complejidad O(N) u O(N log N) en teoría, aunque sin validación empírica de ganancia de throughput frente a MHA en la información disponible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Soporte multilingüe: únicamente inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Investigación sobre mecanismos de atención subcuadráticos: sirve como punto de partida reproducible para estudiar el impacto de MQA en un encoder BERT preentrenado, con protocolo de destilación documentado y código público.
- Reproducción de experimentos de destilación con VRAM cero del profesor: el protocolo de caché offline de representaciones es replicable en GPUs de consumo (RTX 3090, 24 GB) y el modelo sirve de referencia de implementación.
- Estudio de serialización modular de pesos: útil para quienes diseñan pipelines de checkpoints que solo almacenan deltas o adaptadores sobre un base congelado, reduciendo el tamaño del repo de ~450 MB a ~55 MB.
- Benchmark de regresión en tooling de atención: al ser un artefacto pequeño y de licencia MIT, se puede integrar en suites de pruebas de librerías de atención para detectar roturas en la carga con `trust_remote_code`.
- Docencia y divulgación: ejemplo didáctico de cómo una sustitución de atención sin ajuste fino suficiente colapsa el rendimiento a azar (50,92 % en SST-2), ilustrando la diferencia entre una sonda arquitectónica y un modelo funcional.
- No es adecuado para análisis de sentimiento en producción, atención al cliente, moderación de contenido ni ninguna tarea donde se espere precisión superior al azar.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`mqa`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Exactitud GLUE SST-2 | 91,63 % | 50,92 % | 50,92 % | +0,00 % |
| Entropía cruzada de validación | 0,2428 | sin calibrar | 0,6937 | convergido |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB): 48,5 s de duración, 330 pasos, 55.788,1 tokens/s de throughput efectivo, 23.021 MB de VRAM pico. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo descarga ~55 MB de pesos de atención en FP16, pero la reconstrucción carga el BERT base congelado (~450 MB en FP32, ~220 MB en FP16), por lo que se necesita al menos ~1 GB de VRAM incluyendo activaciones para secuencias cortas.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM es suficiente; el autor validó el entrenamiento en una RTX 3090 (24 GB), pero la inferencia cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con ≥4 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el shim `modeling_neuralops_bert.py`); API de NeuralOps (`neuralops.hub.bert_zoo.load_pretrained_bert`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no encaja en esos servidores.
- Latencia y throughput: no disponible para inferencia; solo se publica throughput de entrenamiento (55.788,1 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (exactitud) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-mqa-sst2` | 110 M (base) | no disponible | 50,92 % | MIT | Hugging Face (repo de 0,5 GB) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (según la propia card) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación relevante es con el propio profesor: el checkpoint `mqa` pierde 40,71 puntos porcentuales de exactitud respecto a BERT-Base en SST-2, lo que indica que la sustitución de atención no se compensó con el ajuste fino. Los modelos DistilBERT y TextAttack se incluyen como alternativas de la misma categoría (clasificación de sentimiento en inglés sobre SST-2), pero sus cifras exactas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento a nivel de azar: 50,92 % de exactitud en una tarea binaria equivale a un clasificador aleatorio; el modelo no es funcional para análisis de sentimiento real.
- La destilación no mejoró la exactitud (delta +0,00 %), solo calibró la entropía cruzada; el checkpoint es una sonda arquitectónica, no un modelo entrenado para uso práctico.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del autor (`modeling_neuralops_bert.py`); auditar antes de desplegar en entornos sensibles.
- Dependencia de la librería `neuralops`, cuyo mantenimiento y compatibilidad con versiones futuras de `transformers` no están garantizados.
- Solo inglés; sin soporte multilingüe ni de otros dominios distintos de reseñas de cine de SST-2.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de clasificaciones erróneas arbitrarias por el bajo rendimiento.
- Sesgos heredados de `bert-base-uncased` y del corpus SST-2 (reseñas de cine en inglés, posible sesgo de dominio y demográfico), no evaluados en la model card.
- Licencia MIT permite uso comercial, pero el uso comercial de un clasificador con exactitud del 50,92 % no tiene sentido práctico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria ni mantenimiento demostrado.
- El tamaño del repo (0,5 GB) es mayor que los ~55 MB de pesos de atención declarados, presumiblemente por el shim de código y metadatos; verificar antes de asumir el footprint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-mqa-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Modelo base (org. Google): https://huggingface.co/google-bert/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

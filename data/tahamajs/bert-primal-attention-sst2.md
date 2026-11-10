# tahamajs/bert-primal-attention-sst2

## Resumen

`tahamajs/bert-primal-attention-sst2` es un checkpoint de `bert-base-uncased` (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `primal_attention` de la librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N) según el autor). El modelo lo publica Taha Majlesi (usuario `tahamajs`) como parte de su "Subquadratic Attention Zoo", un proyecto de investigación que compara mecanismos de atención alternativos sobre la misma arquitectura base.

El checkpoint se ha afinado y destilado específicamente para la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés), alcanzando un 91,86 % de accuracy en el split de validación (872 muestras), frente al 91,63 % del profesor `bert-base-uncased` original, es decir, una caída de solo 0,23 puntos. La destilación se realizó con el protocolo "Cached Representation Distillation" de NeuralOps, que evita mantener el profesor en VRAM cacheando offline las representaciones.

Su relevancia es fundamentalmente metodológica: demuestra que es posible intercambiar el mecanismo de atención de un transformer preentrenado y recuperar el rendimiento del profesor con muy poco coste de ajuste (283 s en una RTX 3090, 4 pasos de optimización). No es un modelo de propósito general: es un clasificador de sentimiento en inglés empaquetado como pesos de atención en FP16 de ~55 MB sobre la base congelada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `primal_attention` (subcuadrática) en las 12 capas |
| Parámetros totales | 110 M (base BERT) + cabeza de clasificación; solo se distribuyen los pesos de atención y la cabeza |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de `bert-base-uncased`, típicamente 512 tokens, no confirmado en la model card) |
| Tipos de cuantización | FP16 (formato nativo de los pesos distribuidos); no se documentan otras |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + código remoto `modeling_neuralops_bert.py` |
| Librería | `neuralops` (con soporte vía `trust_remote_code=True` en Transformers) |
| Tarea | Clasificación de secuencias (SST-2, sentimiento binario) |
| Modelo base | `google-bert/bert-base-uncased` (congelado) |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base estándar (12 capas, 768 de dimensión oculta, 12 cabezas) en el que cada bloque de self-attention softmax O(N²) se reemplaza por `primal_attention`, un mecanismo de la NeuralOps Library que el autor describe como de complejidad efectiva O(N) u O(N log N). El resto de la red (embeddings, FFN, layer norms) permanece congelado desde `bert-base-uncased`; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": primero se cachean offline las representaciones del profesor (`bert-base-uncased`) para no ocupar VRAM, y después se optimiza en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits + cross-entropy de la tarea). Se ejecutó en una NVIDIA RTX 3090 (24 GB) durante 283 s, con 4 pasos de optimización, throughput de 115,8 tokens/s y un pico de VRAM de 8107 MB. El dataset es SST-2 (GLUE), en inglés.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos cortos, típicamente reseñas.
- Inferencia con atención subcuadrática, lo que en teoría reduce el coste para secuencias largas frente a BERT estándar (aunque no se documentan experimentos con longitudes >512).
- Carga modular: los pesos de atención se aplican sobre la base BERT congelada mediante código remoto.
- Integración con `AutoModelForSequenceClassification` de Transformers (`trust_remote_code=True`) y con la API `neuralops.hub.bert_zoo.load_pretrained_bert`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Multilingüe: no; solo inglés.
- No dispone de modo "thinking" ni capacidades especiales más allá de la clasificación.

## Casos de uso

- Análisis de sentimiento de reseñas de producto en inglés: el modelo está afinado exactamente para SST-2, por lo que es directamente aplicable a reseñas cortas de e-commerce con una accuracy esperada en torno al 91-92 % en dominio similar.
- Moderación de comentarios y filtrado de opiniones negativas: clasificación binaria rápida en pipelines de ingesta, con un footprint de pesos de ~55 MB más la base BERT congelada (~450 MB), lo que abarata el despliegue en CPU/GPU pequeñas.
- Investigación sobre mecanismos de atención eficientes: sirve como checkpoint de referencia para reproducir y comparar `primal_attention` frente a softmax cuadrática sobre la misma base, con métricas y telemetría publicadas.
- Destilación y experimentos de sustitución de atención: el protocolo de destilación cacheada permite reutilizar el checkpoint como estudiante en nuevos experimentos con muy poco coste de cómputo (283 s en una RTX 3090).
- Clasificación de sentimiento en streaming de redes sociales o tickets de soporte en inglés, donde el bajo coste de inferencia y el tamaño reducido de los pesos permiten escalar horizontalmente.
- Benchmark interno de latencia/throughput para atención subcuadrática: útil para validar si el mecanismo aporta ventajas reales en secuencias largas antes de invertir en modelos mayores.
- Base para fine-tuning ligero en otras tareas de clasificación GLUE (si bien solo se ha validado en SST-2).

## Benchmarks y rendimiento

Evaluación en el split de validación de GLUE SST-2 (872 muestras binarias), según la model card:

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`primal_attention`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 92,09 % | 91,86 % | -0,23 % |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,2649 | — |

Telemetría de entrenamiento (RTX 3090 24 GB): 283,0 s, 4 pasos de optimización, 115,8 tokens/s, pico de VRAM 8107 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la base BERT congelada en FP32 ronda los 450 MB de pesos (~1,1 GB con activaciones en batch pequeño); los pesos de atención en FP16 añaden ~55 MB. En la práctica, menos de 2 GB de VRAM para batches moderados.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; el autor entrenó en una RTX 3090 (24 GB), pero la inferencia es viable en GPUs consumer modestas (GTX 1660, RTX 3060, etc.) e incluso en CPU para baja concurrencia.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; la API `neuralops.hub.bert_zoo`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo es un clasificador BERT, no un LLM generativo).
- Latencia y throughput: el autor reporta 115,8 tokens/s durante el entrenamiento en RTX 3090; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-primal-attention-sst2` | 110 M (+ atención ~55 MB) | no disponible | 91,86 % | MIT | Hugging Face (0 descargas) |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| `textattack/bert-base-uncased-SST-2` (referencia típica) | 110 M | 512 | ~92 % (no verificado en esta fuente) | Apache 2.0 | Hugging Face |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 | ~91 % (no verificado en esta fuente) | Apache 2.0 | Hugging Face |

La comparativa con `textattack` y `distilbert` es orientativa; los valores exactos no están en la información proporcionada y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo clasificación binaria de sentimiento en inglés; no genera texto ni soporta otras tareas sin reentrenamiento.
- Entrenado y validado únicamente en SST-2; el rendimiento fuera de ese dominio (otras reseñas, jerga, dominios técnicos) no está medido y puede degradarse.
- Solo inglés; no hay soporte multilingüe.
- Riesgo de sesgos heredados de `bert-base-uncased` y de SST-2 (sesgo de dominio, de género, de registro), no evaluado en la model card.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en entradas ambiguas o sarcásticas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` está bajo Apache 2.0; hay que respetar ambas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación de la comunidad, tratar como experimental.
- No se documentan experimentos con secuencias >512 tokens pese a la motivación subcuadrática; la ventaja de `primal_attention` en contexto largo no está demostrada aquí.
- El checkpoint distribuye solo los pesos de atención (~55 MB), no la base completa; el shim remoto reconstruye la base desde `bert-base-uncased`, lo que añade una dependencia de red y de versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-primal-attention-sst2
- Repositorio NeuralOps (GitHub): https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE / SST-2: https://gluebenchmark.com/

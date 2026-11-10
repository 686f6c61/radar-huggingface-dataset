# tahamajs/bert-soa-attn-sst2

## Resumen

`tahamajs/bert-soa-attn-sst2` es un checkpoint de clasificación de sentimiento derivado de `bert-base-uncased` en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `soa_attn` de su librería NeuralOps, con complejidad efectiva subcuadrática (O(N) u O(N log N)). El modelo se ha destilado sobre la tarea SST-2 del benchmark GLUE mediante el protocolo "Cached Representation Distillation" de NeuralOps, que evita asignar VRAM al modelo profesor cacheando offline las representaciones.

El resultado reportado es una accuracy del 91,97 % en el split de validación de SST-2 (872 muestras binarias), frente al 91,63 % del `bert-base-uncased` profesor, con una entropía cruzada de validación de 0,2695. El entrenamiento se ejecutó en una única RTX 3090 de 24 GB en 51,5 segundos y 280 pasos de optimización, con un pico de 7.319 MB de VRAM y un throughput de 44.560 tokens/s.

La relevancia del checkpoint es doble: por un lado, demuestra empíricamente que un mecanismo de atención subcuadrática puede igualar o superar ligeramente a la atención cuadrática estándar en una tarea de clasificación de secuencias cortas; por otro, introduce un formato de serialización "attention-only" en FP16 de unos 55 MB que se reconstruye sobre los pesos congelados de BERT-Base, reduciendo drásticamente el tamaño de descarga. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `soa_attn` subcuadrática en las 12 capas |
| Parametros totales | ~110 M (base BERT-Base) + cabeza de clasificación; el repo solo almacena ~55 MB de pesos de atención y cabeza |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-Base soporta 512 tokens; el autor no especifica el contexto efectivo de `soa_attn`) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` en FP16, más shim de código remoto (`modeling_neuralops_bert.py`) |
| Libreria | `neuralops` (con soporte vía `trust_remote_code=True` en Transformers) |
| Tarea | Clasificación de secuencias (sentimiento binario, SST-2) |
| Dataset de evaluación | GLUE SST-2 (split de validación, 872 muestras) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (transformer encoder de 12 capas, ~110 M de parámetros) y reemplaza la atención multi-cabeza softmax cuadrática por `soa_attn`, un mecanismo de atención subcuadrática con complejidad efectiva O(N) u O(N log N) según el autor. No se detalla en la información disponible la formulación matemática concreta de `soa_attn` (si es lineal, con kernel, sparse o basada en estado recurrente), ni el número de cabezas o dimensión de las mismas tras la sustitución.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": primero se cachean offline las representaciones del profesor (`bert-base-uncased`), de modo que durante la destilación no se necesita cargar el profesor en VRAM (cero overhead de memoria del profesor). La optimización tiene dos etapas: una primera de alineamiento de subespacio oculto y una segunda con pérdida KL sobre logits más entropía cruzada de la tarea. Se ejecutaron 280 pasos en 51,5 s sobre una RTX 3090, con un pico de 7.319 MB de VRAM y 44.560,5 tokens/s de throughput efectivo. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset más allá de GLUE/SST-2, ni si hubo RLHF/DPO (no aplica a una tarea de clasificación).

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, entrenada y evaluada sobre SST-2.
- Inferencia sobre pares de secuencia-texto con la API estándar de `AutoModelForSequenceClassification` de Transformers (`trust_remote_code=True`).
- Carga modular vía la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo aplicando solo los pesos de atención destilados sobre el BERT base congelado.
- Atención subcuadrática: en principio más eficiente en memoria y cómputo para secuencias largas que la atención cuadrática, aunque el autor no publica mediciones de escalado con longitud de secuencia.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, modo thinking ni audio. El modelo es exclusivamente un clasificador.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Análisis de sentimiento en reseñas de producto: el modelo clasifica reseñas cortas en inglés como positivas o negativas con una accuracy reportada del 91,97 % en SST-2, adecuado para pipelines de moderación o analítica de opiniones.
- Filtrado de comentarios en foros y redes: clasificación binaria rápida de mensajes para enrutar contenido negativo a revisión humana, con un footprint de descarga de ~55 MB que facilita el despliegue en entornos con almacenamiento limitado.
- Investigación en mecanismos de atención eficiente: sirve como checkpoint de referencia para comparar `soa_attn` frente a atención softmax estándar en tareas de clasificación, replicando el protocolo de destilación descrito.
- Benchmarking de destilación con profesor cacheado: el protocolo "Cached Representation Distillation" permite reproducir el entrenamiento en una sola GPU consumer (RTX 3090) en menos de un minuto, útil para experimentos académicos de bajo presupuesto.
- Prototipado de clasificadores con atención subcuadrática: la API `load_pretrained_bert` de NeuralOps permite intercambiar el tipo de atención y reutilizar la cabeza de clasificación para nuevas tareas de sequence classification.
- Evaluación de eficiencia en secuencias largas: si `soa_attn` cumple su complejidad O(N) u O(N log N), el checkpoint puede emplearse como base para experimentos de clasificación de documentos largos, aunque el autor no publica resultados en ese régimen.

## Benchmarks y rendimiento

Evaluación sobre GLUE SST-2, split de validación (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`soa_attn`) | Modelo destilado post-KD |
|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 89,33 % | **91,97 %** |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2695 |
| Delta de accuracy vs. profesor | — | −2,30 pp | **+0,34 pp** |

Telemetría de entrenamiento reportada por el autor:

| Metrica | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 24 GB (Ampere) |
| Duración del entrenamiento | 51,5 s |
| Pasos de optimización | 280 (2 etapas) |
| Throughput efectivo | 44.560,5 tokens/s |
| Pico de VRAM | 7.319 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 7.319 MB de pico en una RTX 3090. Para inferencia en FP16 con BERT-Base (~110 M de parámetros) se espera un consumo muy inferior, pero el autor no lo documenta.
- GPU recomendadas: cualquier GPU con al menos ~8 GB de VRAM para FP16; el autor valida explícitamente la RTX 3090 (24 GB). No se documentan pruebas en A100, H100 ni otras GPUs.
- Cabe en GPU consumer: sí, según la telemetría de entrenamiento en RTX 3090; no se especifican modelos inferiores (RTX 4090, 3090 Ti, 3080, etc.).
- Opciones de despliegue: Transformers con `trust_remote_code=True`, o la API `neuralops.hub.bert_zoo.load_pretrained_bert`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo y los pesos son un shim de atención, no un checkpoint completo estándar).
- Latencia y throughput: solo se reporta throughput de entrenamiento (44.560,5 tokens/s en RTX 3090); no se publican métricas de latencia o throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-soa-attn-sst2` | ~110 M (base) + cabeza | no disponible | 91,97 % (validación) | MIT | Hugging Face, 0 descargas |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (validación, reportado por el autor) | Apache 2.0 | Hugging Face, ampliamente usado |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en esta información | Apache 2.0 | Hugging Face |
| `roberta-base` fine-tuned en SST-2 | 125 M | 512 tokens | no disponible en esta información | MIT | Hugging Face |

La comparativa se limita a los datos aportados por el autor; no se dispone de mediciones propias ni de resultados de terceros para `distilbert` o `roberta` en esta ficha. El checkpoint destaca por su tamaño de descarga (~55 MB) y por igualar al profesor, pero carece de validación independiente.

## Limitaciones y advertencias

- El modelo solo realiza clasificación binaria de sentimiento en inglés; no genera texto ni soporta otras tareas sin reentrenamiento de la cabeza.
- La accuracy reportada (91,97 %) procede de un único split de validación de SST-2 (872 muestras) y no ha sido replicada de forma independiente; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- No se documentan sesgos conocidos, pero al derivar de `bert-base-uncased` y entrenarse solo en SST-2, hereda los sesgos del corpus de reseñas de películas y puede no generalizar a otros dominios (redes sociales, atención al cliente, etc.).
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, sarcásticos o fuera de dominio.
- Limitación de idioma: solo inglés; no se ha evaluado en castellano ni en otros idiomas.
- La longitud de contexto efectiva de `soa_attn` no está documentada; no se garantiza el comportamiento del mecanismo más allá de la longitud de las secuencias de SST-2.
- Restricciones de licencia: MIT permite uso comercial, pero el código remoto (`modeling_neuralops_bert.py`) y la librería NeuralOps deben auditarse antes de producción, ya que `trust_remote_code=True` ejecuta código del autor.
- El repositorio no incluye los pesos completos de BERT-Base: requiere descargar `bert-base-uncased` por separado y aplicar el shim; esto añade una dependencia externa y un paso de reconstrucción que puede fallar si cambia la versión del modelo base.
- No hay soporte documentado para cuantización, vLLM, llama.cpp u Ollama, lo que limita su despliegue en entornos de inferencia de alto rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/bert-soa-attn-sst2
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/glue/viewer/sst2

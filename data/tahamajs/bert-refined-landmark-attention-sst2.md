# tahamajs/bert-refined-landmark-attention-sst2

## Resumen

`tahamajs/bert-refined-landmark-attention-sst2` es un checkpoint de clasificación de texto derivado de `google-bert/bert-base-uncased` en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `refined_landmark_attention` de la librería NeuralOps. El autor, Taha Majlesi, publica este modelo como parte de un "Subquadratic Attention Zoo" orientado a evaluar mecanismos de atención subcuadráticos sobre la suite GLUE, en este caso la tarea SST-2 (análisis de sentimiento binario en inglés).

El modelo se distribuye en un formato no convencional: solo se serializan los pesos de atención y la cabeza de clasificación en FP16 (`attention_weights.safetensors`, aproximadamente 55 MB), mientras que los pesos base congelados de BERT-Base se reconstruyen en tiempo de carga desde `bert-base-uncased` mediante un shim de código remoto (`modeling_neuralops_bert.py`). Esto reduce drásticamente la huella de descarga, pero exige `trust_remote_code=True` y la librería `neuralops` para su uso.

Es relevante como referencia empírica de destilación sobre atención subcuadrática: parte de una precisión de 50,92 % antes de la destilación y alcanza 79,82 % tras el protocolo de destilación por representaciones en caché, frente al 91,63 % del profesor BERT-Base. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-Base con atención `refined_landmark_attention` (subcuadrática, O(N) u O(N log N)) en las 12 capas |
| Parametros totales | ~110 M (BERT-Base); pesos publicados: solo atención + cabeza de clasificación en FP16 (~55 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, 512 tokens por defecto, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (único formato publicado); no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (FP16, atención y cabeza de clasificación únicamente) + código remoto Python |
| Libreria | `neuralops` (con compatibilidad vía `transformers` usando `trust_remote_code=True`) |
| Tarea | Clasificación de texto binaria (SST-2: 0 = negativo, 1 = positivo) |
| Modelo base | `google-bert/bert-base-uncased` (congelado, se descarga aparte) |
| Dataset de evaluación | GLUE / SST-2 (split de validación, 872 muestras) |

## Arquitectura y entrenamiento

El modelo mantiene el esqueleto de BERT-Base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 M parámetros) pero reemplaza la atención multi-cabeza estándar por `refined_landmark_attention`, un mecanismo de landmarks que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). Los pesos base de BERT permanecen congelados; solo se entrenan los parámetros de atención y la cabeza de clasificación, que son los que se publican.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una destilación en dos etapas (alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea) con el profesor cacheado offline, lo que elimina la necesidad de mantener el profesor en VRAM. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) durante 52,7 segundos, con 139 pasos de optimización y un throughput efectivo de 21.613,1 tokens/s, alcanzando un pico de 13.298 MB de VRAM. El resultado es un estudiante calibrado que recupera 28,90 puntos porcentuales de precisión respecto a su estado pre-destilación.

## Capacidades

- Clasificación de sentimiento binaria en inglés (positivo/negativo) sobre textos cortos, típicos de SST-2.
- Inferencia con atención subcuadrática, con coste teórico lineal o cuasi-lineal en la longitud de secuencia.
- Compatible con la API de `transformers` (`AutoModelForSequenceClassification`) mediante `trust_remote_code=True`.
- Carga modular a través de `neuralops.hub.bert_zoo.load_pretrained_bert` para reconstruir el modelo sobre BERT-Base.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo "thinking": es exclusivamente un clasificador.
- Capacidad multilingüe limitada al inglés; no se documenta transferencia a otros idiomas.

## Casos de uso

- **Investigación en mecanismos de atención eficiente:** sirve como punto de comparación reproducible para medir la pérdida de precisión al sustituir atención cuadrática por `refined_landmark_attention` en BERT-Base sobre SST-2 (79,82 % frente a 91,63 % del profesor).
- **Reproducción de experimentos de destilación:** el protocolo de destilación con representaciones cacheadas se puede replicar con este checkpoint como estudiante de referencia y un profesor BERT-Base, útil para validar pipelines de Knowledge Distillation en entornos con VRAM limitada (cabe en una RTX 3090 con 13,3 GB de pico).
- **Prototipado de clasificadores de sentimiento de bajo coste:** para demos o pruebas internas donde la precisión no sea crítica, el modelo clasifica reseñas o tuits en inglés con una huella de descarga de ~55 MB más los pesos base de BERT.
- **Banco de pruebas para la librería NeuralOps:** permite validar la API `load_pretrained_bert`, la serialización `attention_only_fp16` y el shim `modeling_neuralops_bert.py` en integraciones CI.
- **Experimentos de eficiencia en secuencias largas:** al ser subcuadrático, es adecuado para estudiar el escalado de coste en longitudes superiores a las de BERT estándar (aunque la ventana efectiva publicada no se documenta).
- **Educación y divulgación:** ejemplo didáctico de cómo se publica un checkpoint modular de solo atención y cómo se reconstruye un modelo completo a partir de pesos parciales.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 50,92 % | 79,82 % | +28,90 pp |
| Cross-entropy de validación | 0,2428 | no calibrado | 0,4396 | — |

Telemetría de entrenamiento (RTX 3090, 24 GB):

| Metrica | Valor |
|---|---|
| Duracion del entrenamiento | 52,7 s |
| Pasos de optimizacion | 139 |
| Throughput efectivo | 21.613,1 tokens/s |
| Pico de VRAM | 13.298 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **VRAM para inferencia:** no documentada explícitamente; por el tamaño de BERT-Base (~110 M parámetros) y los pesos en FP16, se estima un uso inferior a 1 GB en inferencia, aunque es una estimación, no un dato publicado.
- **VRAM para el entrenamiento/destilación reportado:** 13.298 MB de pico en una RTX 3090 (24 GB).
- **GPU recomendadas:** cualquier GPU con al menos ~2 GB de VRAM para inferencia (RTX 3060, RTX 4090, A100, H100); para reproducir el entrenamiento, RTX 3090 o superior.
- **Cabe en GPU de consumo:** sí, en la práctica totalidad de GPU consumer modernas.
- **Opciones de despliegue:** `transformers` con `trust_remote_code=True` y la librería `neuralops`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el formato es específico y requiere código remoto).
- **Latencia y throughput:** solo se reporta throughput de entrenamiento (21.613,1 tokens/s); no hay datos de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy SST-2 | Licencia | Formato |
|---|---|---|---|---|---|
| `tahamajs/bert-refined-landmark-attention-sst2` | ~110 M (solo atención publicada) | no disponible | 79,82 % | MIT | safetensors FP16 + código remoto |
| `google-bert/bert-base-uncased` (profesor, fine-tune SST-2) | ~110 M | 512 tokens | 91,63 % | Apache 2.0 | safetensors / PyTorch |
| `distilbert-base-uncased-finetuned-sst-2-english` | ~66 M | 512 tokens | no disponible en esta ficha | Apache 2.0 | safetensors |

La comparación con DistilBERT se incluye por categoría (clasificador SST-2 destilado), pero no se dispone de su accuracy exacta en la información proporcionada; los datos de contexto y licencia son los estándar del modelo y no se han verificado en esta búsqueda.

## Limitaciones y advertencias

- **Precisión notablemente inferior al profesor:** 79,82 % frente a 91,63 % en SST-2; una caída de casi 12 puntos porcentuales la hace inadecuada para producción sensible a la calidad.
- **Formato no estándar:** requiere `trust_remote_code=True` y la librería `neuralops`; no funciona con `AutoModel` sin el shim remoto, lo que añade superficie de ataque y dependencia de código de terceros.
- **Descarga implícita de pesos base:** aunque el repo pesa ~55 MB, en la práctica se descargan los ~450 MB de `bert-base-uncased` al cargar.
- **Solo inglés y solo clasificación binaria:** no hay soporte multilingüe ni para otras tareas GLUE en este checkpoint.
- **Riesgo de sesgo y alucinación:** al ser un clasificador, no genera texto, pero hereda los sesgos de BERT-Base y del corpus SST-2 (reseñas de películas), por lo que puede fallar en dominios distintos.
- **Contexto y robustez no documentados:** no se especifica la longitud máxima efectiva ni el comportamiento en secuencias largas, pese a la motivación subcuadrática.
- **Artefacto de investigación:** con 0 descargas y 0 likes, no hay validación comunitaria; la licencia MIT permite uso comercial, pero la calidad y el mantenimiento no están garantizados.
- **Reproducibilidad:** el autor reporta 52,7 s de entrenamiento y 139 pasos, cifras que conviene tratar con cautela sin código de entrenamiento público verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-refined-landmark-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset GLUE / SST-2: https://huggingface.co/datasets/glue

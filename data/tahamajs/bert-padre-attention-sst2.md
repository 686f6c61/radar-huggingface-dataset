# tahamajs/bert-padre-attention-sst2

## Resumen

`tahamajs/bert-padre-attention-sst2` es un checkpoint de clasificación de sentimiento derivado de `google-bert/bert-base-uncased` en el que el autor (Taha Majlesi) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `padre_attention` de su librería NeuralOps. El modelo se ha ajustado y destilado sobre la tarea SST-2 del benchmark GLUE y se distribuye como pesos de atención en FP16 (~55 MB) más una cabeza de clasificación, no como un BERT completo.

La propuesta técnica es un ejercicio de "attention zoo": demostrar que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática O(N) u O(N log N) manteniendo la precisión en una tarea de clasificación estándar. El autor reporta una exactitud del 91,51 % en el split de validación de SST-2, frente al 91,63 % del profesor BERT-base original, es decir, una pérdida de 0,23 puntos porcentuales tras la destilación.

Es relevante ahora como referencia reproducible para investigadores que exploran alternativas eficientes a la atención estándar, aunque su alcance es limitado: una única tarea, un único idioma (inglés) y un único checkpoint. No es un modelo generativo ni un modelo de propósito general, sino una pieza de evaluación de mecanismos de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `padre_attention` subcuadrática en las 12 capas |
| Parametros totales | 110 M (base BERT-base); los pesos distribuidos son solo de atención y cabeza (~55 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT-base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | FP16 para los pesos de atención; el resto de pesos base en el formato original de `bert-base-uncased` |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16, ~55 MB) + código remoto (`modeling_neuralops_bert.py`) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` (12 capas, 110 M de parámetros, encoder bidireccional) y reemplaza la multi-head attention softmax cuadrática por `padre_attention`, un mecanismo de la NeuralOps Library con complejidad efectiva O(N) u O(N log N) según la model card. Los pesos base de BERT permanecen congelados y se cargan dinámicamente desde el repositorio original; el repositorio solo almacena los parámetros de atención destilados y la cabeza de clasificación, lo que explica el tamaño de ~55 MB frente a los ~450 MB de un BERT-base completo.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda etapa con KL sobre logits más entropía cruzada de la tarea. Se ejecutó en una única NVIDIA RTX 3090 (24 GB) durante 49,4 s, con 210 pasos de optimización, throughput de 34.854,9 tokens/s y un pico de VRAM de 8.615 MB. El autor destaca que la destilación se hizo con representaciones cacheadas offline, sin asignar VRAM al profesor durante el entrenamiento. El dataset es SST-2 (dentro de GLUE); no se detalla el número de tokens de entrenamiento ni la composición completa del corpus más allá de la tarea.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés sobre textos cortos, formato SST-2.
- Inferencia compatible con `AutoModelForSequenceClassification` de Hugging Face con `trust_remote_code=True`.
- Carga modular vía API de NeuralOps (`load_pretrained_bert`) que reconstruye el modelo sobre BERT-base congelado.
- Atención subcuadrática que, según el autor, reduce el coste computacional frente a la atención cuadrática estándar en secuencias largas.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No incluye modo "thinking" ni capacidades especiales más allá de la clasificación.

## Casos de uso

- Evaluación de mecanismos de atención eficientes: sirve como checkpoint de referencia para comparar `padre_attention` frente a atención softmax estándar en una tarea controlada (SST-2), midiendo la pérdida de precisión con un protocolo reproducible.
- Análisis de sentimiento en reseñas de producto o comentarios en inglés: clasificación binaria directa con una precisión reportada del 91,51 % en validación, adecuada para prototipos y pipelines de filtrado.
- Investigación en destilación de conocimiento: el protocolo de destilación con representaciones cacheadas y sin VRAM de profesor es replicable en clusters con GPUs de 24 GB, útil para estudiar eficiencia de KD.
- Benchmark de atención subcuadrática en entornos con restricciones de memoria: el formato de solo atención (~55 MB) permite iterar sobre variantes de atención sin re-descargar el modelo base completo.
- Clasificación de textos cortos en pipelines de moderación o triaje: al ser un modelo pequeño y rápido, puede integrarse como primer filtro antes de modelos más grandes en inglés.
- Docencia y reproducción de experimentos: el entrenamiento de 49,4 s en una RTX 3090 y los 210 pasos lo hacen viable como ejemplo práctico de sustitución de atención y destilación en cursos o tutoriales.

## Benchmarks y rendimiento

Evaluación reportada por el autor en el split de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`padre_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Exactitud SST-2 | 91,63 % | 91,74 % | 91,51 % | -0,23 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,2791 | convergido |

Telemetría de entrenamiento: RTX 3090 24 GB, 49,4 s, 210 pasos, 34.854,9 tokens/s, pico de VRAM 8.615 MB. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa ~450 MB; en FP16 ~225 MB. Con los pesos de atención en FP16 (~55 MB) más el BERT-base congelado, la inferencia cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; el autor entrenó en una RTX 3090. Para producción a gran escala, A100 o H100 no son necesarias dado el tamaño.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~2 GB de VRAM libre en FP16.
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True`; API de NeuralOps (`neuralops.hub.bert_zoo`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo es de clasificación, no generativo).
- Latencia y throughput: no se reportan cifras de inferencia; solo el throughput de entrenamiento (34.854,9 tokens/s) en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-padre-attention-sst2` | 110 M (base) + atención destilada | no disponible | 91,51 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (reportado por el autor) | Apache 2.0 | Hugging Face, estándar |
| BERT-base ajustado en SST-2 (referencia GLUE) | 110 M | 512 tokens | ~92-93 % típico en literatura | Apache 2.0 | Amplia disponibilidad |
| Variantes de atención eficiente (Longformer, BigBird) | 110-150 M | 4.096 tokens | no disponible en esta comparación | Apache 2.0 | Hugging Face |

La comparación directa más justa es contra el profesor `bert-base-uncased`, ya que el checkpoint del autor solo difiere en el mecanismo de atención y la destilación. No se dispone de datos de benchmarks de las alternativas de atención eficiente en SST-2 dentro de la información proporcionada.

## Limitaciones y advertencias

- Alcance muy restringido: una sola tarea (SST-2), un solo idioma (inglés) y un solo checkpoint; no es un modelo de propósito general.
- Solo se distribuyen los pesos de atención y la cabeza de clasificación; el resto del modelo se carga desde `bert-base-uncased`, por lo que la reproducibilidad depende de la disponibilidad de ese repositorio y del código remoto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas en dominios distintos de SST-2 (reseñas de películas); no se reportan evaluaciones de robustez fuera de dominio.
- Sesgos: hereda los sesgos de `bert-base-uncased` y de SST-2; no se documentan análisis de sesgo ni de equidad.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene licencia Apache 2.0; conviene verificar la compatibilidad en despliegues comerciales.
- No hay datos publicados sobre latencia, throughput de inferencia ni comportamiento con secuencias largas más allá de la afirmación teórica de complejidad subcuadrática.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-padre-attention-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue

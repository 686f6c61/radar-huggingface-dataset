# tahamajs/bert-spectron-fp8-sst2

## Resumen

BERT-base con atención subcuadrática `spectron_fp8` es un checkpoint de clasificación de texto publicado por el desarrollador independiente Taha Majlesi (tahamajs) dentro del proyecto NeuralOps. Se trata de un `bert-base-uncased` (110 millones de parámetros, 12 capas) en el que se han sustituido los bloques de atención softmax cuadrática por el mecanismo `spectron_fp8` de la librería NeuralOps, que declara una complejidad operativa efectiva O(N) u O(N log N) frente a la O(N²) de la multi-head attention estándar. El modelo se ha afinado y destilado específicamente para la tarea SST-2 del benchmark GLUE (análisis de sentimiento binario en inglés).

La relevancia del checkpoint es doble. Por un lado, demuestra la viabilidad de sustituir la atención de un transformer preentrenado por una variante subcuadrática y recuperar calidad mediante destilación de representaciones en caché (protocolo "Cached Representation Distillation" de NeuralOps, sin asignación de VRAM para el profesor). Por otro, introduce un formato de serialización modular que solo almacena los pesos de atención entrenados y la cabeza de clasificación (~55 MB en FP16), reconstruyendo el resto del modelo base congelado en tiempo de carga.

El resultado es un modelo pequeño, de licencia MIT, orientado exclusivamente a clasificación de sentimiento en inglés, con un rendimiento declarado del 86,01 % de accuracy en el split de validación de SST-2, frente al 91,63 % del profesor `bert-base-uncased`. No es un modelo generativo ni multilingüe, y su uso previsto es la experimentación con mecanismos de atención eficientes, no el despliegue en producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-base con atención subcuadrática `spectron_fp8` en las 12 capas |
| Parámetros totales | 110 M (modelo base BERT-base); el repo solo serializa atención + cabeza de clasificación |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base BERT-base soporta 512 tokens, no confirmado explícitamente para esta variante) |
| Tipos de cuantización | FP16 en los pesos de atención (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), con código remoto `modeling_neuralops_bert.py`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un encoder transformer de 12 capas y 110 M de parámetros, y reemplaza en cada capa el bloque de multi-head attention por el mecanismo `spectron_fp8` de NeuralOps. El autor declara complejidad subcuadrática efectiva (O(N) u O(N log N)) frente a la O(N²) del softmax estándar, aunque la model card no detalla la formulación matemática interna del mecanismo ni el coste exacto por token. Los pesos del modelo base permanecen congelados; solo se entrenan y serializan los parámetros de atención y la cabeza de clasificación.

El entrenamiento sigue el protocolo "Cached Representation Distillation" de NeuralOps: primero una fase de alineamiento de subespacio oculto (Stage 1) y después una fase de KL sobre logits más entropía cruzada de la tarea (Stage 2). La destilación usa representaciones del profesor cacheadas offline, de modo que el profesor no ocupa VRAM durante el entrenamiento. Según la model card, el proceso se ejecutó en una NVIDIA RTX 3090 de 24 GB, con 112 pasos de optimización, 55,5 segundos de duración, throughput de 16.538,3 tokens/s y un pico de VRAM de 15.866 MB. El dataset es GLUE SST-2 (clasificación binaria de sentimiento).

## Capacidades

- Clasificación de texto binaria (positivo/negativo) sobre secuencias en inglés, específicamente afinada para SST-2.
- Inferencia compatible con `AutoModelForSequenceClassification` de Transformers usando `trust_remote_code=True`.
- Carga modular a través de la API `neuralops.hub.bert_zoo.load_pretrained_bert`, que reconstruye el modelo base y aplica solo los pesos de atención destilados.
- Sustitución de atención cuadrática por un mecanismo subcuadrático, útil como banco de pruebas para investigación en eficiencia de atención.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidad multilingüe: no; únicamente inglés.
- No se documentan capacidades de embedding reutilizable más allá de la cabeza de clasificación.

## Casos de uso

- Análisis de sentimiento en reseñas de producto o comentarios de clientes en inglés: el modelo está afinado directamente sobre SST-2 y devuelve una etiqueta binaria con una accuracy declarada del 86,01 %, suficiente para triaje automático de opiniones a bajo coste.
- Filtrado previo en pipelines de moderación o soporte: clasificar mensajes entrantes como positivos o negativos antes de enrutarlos a un modelo mayor, aprovechando el reducido tamaño del checkpoint (~55 MB de pesos de atención más el base congelado).
- Investigación en atención eficiente: servir como referencia reproducible para comparar `spectron_fp8` con atención softmax estándar en una tarea GLUE concreta, con métricas de destilación y telemetría de entrenamiento publicadas.
- Experimentos de destilación de representaciones: el protocolo de destilación con caché offline permite reproducir el entrenamiento en una única GPU consumer de 24 GB, útil para laboratorios con recursos limitados.
- Benchmarking de serialización modular: evaluar el esquema de pesos "attention-only" de NeuralOps, que evita re-subir los 450 MB del modelo base y facilita iterar sobre variantes de atención.
- Docencia y prototipado rápido: ejemplo mínimo de sustitución de un bloque arquitectónico en un transformer preentrenado con código remoto y API de alto nivel, adecuado para demostraciones en cursos de NLP.

## Benchmarks y rendimiento

Evaluación declarada por el autor sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`spectron_fp8`) | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy GLUE SST-2 | 91,63 % | 52,18 % | 86,01 % | +33,83 pp |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4375 | convergido |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos de entrenamiento reportados son: 112 pasos, 55,5 s, 16.538,3 tokens/s y 15.866 MB de VRAM pico en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo descarga ~55 MB de pesos de atención en FP16, pero el código remoto inicializa el `bert-base-uncased` completo (~440 MB en FP32, ~220 MB en FP16), por lo que el consumo real en memoria ronda 1-2 GB incluyendo activaciones y tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor reportó entrenamiento en una RTX 3090 de 24 GB, pero la inferencia es mucho más ligera.
- Cabe en GPU consumer: sí, en GTX 1650/1660, RTX 3050/3060/4060 y superiores; también en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (vía principal documentada), API `neuralops.hub.bert_zoo`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al requerir código remoto personalizado es probable que estos runners no funcionen sin adaptación.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento (16.538,3 tokens/s en RTX 3090).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/bert-spectron-fp8-sst2` | 110 M (base) + atención destilada | no disponible | 86,01 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia del autor) | Apache 2.0 | Hugging Face, estándar |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, estándar |
| `textattack/bert-base-uncased-SST-2` | 110 M | 512 tokens | no disponible en la información proporcionada | Apache 2.0 | Hugging Face, estándar |

La comparativa se limita a los datos publicados por el autor; no se dispone de mediciones independientes que permitan contrastar el 86,01 % frente a los checkpoints SST-2 de referencia de la comunidad.

## Limitaciones y advertencias

- Rendimiento inferior al profesor: 86,01 % frente a 91,63 % en SST-2, una caída de 5,62 puntos porcentuales que puede ser crítica en aplicaciones sensibles.
- El estudiante pre-destilación rinde al 52,18 %, prácticamente azar, lo que indica que la calidad depende enteramente del proceso de destilación y no de la arquitectura por sí sola.
- Modelo exclusivamente binario y en inglés: no admite otras tareas GLUE, clasificación multietiqueta, generación ni idiomas distintos del inglés.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de calibración: la entropía cruzada de validación (0,4375) es casi el doble que la del profesor (0,2428), por lo que las probabilidades de salida están peor calibradas.
- Requiere `trust_remote_code=True` y ejecuta código Python personalizado (`modeling_neuralops_bert.py`) descargado del Hub; implica un riesgo de seguridad en entornos de producción y complica auditorías.
- Dependencia de la librería NeuralOps y de la disponibilidad del modelo base `bert-base-uncased` para reconstruir los pesos; si el Hub o el repo base cambian, la carga puede romperse.
- Licencia MIT permite uso comercial, pero no se documentan sesgos del modelo base ni del dataset SST-2, que proviene de reseñas de películas y no representa dominios generales.
- Sin descargas ni likes en el momento de la ficha, sin validación independiente de las métricas declaradas y con fecha de creación futura (2026-11-09) en los metadatos, lo que exige cautela sobre la madurez del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/bert-spectron-fp8-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Dataset GLUE: https://huggingface.co/datasets/glue
- Dataset SST-2: https://huggingface.co/datasets/sst2

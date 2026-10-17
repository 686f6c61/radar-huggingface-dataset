# VINAY-UMRETHE/Refusal-Classifier

## Resumen

Refusal-Classifier es un modelo de clasificación de texto desarrollado por el usuario VINAY-UMRETHE sobre HuggingFace. Se trata de un fine-tuning de answerdotai/ModernBERT-base, un encoder transformer de 149,6 millones de parámetros, adaptado para una tarea muy concreta: clasificar la respuesta de un LLM ante un prompt dado en una de cinco categorías relacionadas con el rechazo (refusal): `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.

El problema que resuelve es relevante en el ámbito de la evaluación de seguridad y alineamiento de modelos generativos. Detectar automáticamente si un LLM ha rechazado una petición, la ha cumplido o ha respondido con una limitación de capacidad permite construir pipelines de auditoría, filtrado y monitorización de sistemas desplegados en producción. La tarea se formula como clasificación de pares (prompt, respuesta) mediante tokenización con `text_pair`.

El modelo recibió su checkpoint final en el paso 300, seleccionado por el mayor macro F1 de validación (0,9416), y reporta en test un accuracy de 0,9371 y un macro F1 de 0,9382 sobre 445 filas. Es un modelo pequeño, monolingüe en inglés y sin licencia declarada, lo que limita su uso comercial sin consultar al autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de ModernBERT-base) para clasificación de secuencias |
| Parámetros totales | 149.608.709 (≈149,6 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (según el ejemplo de uso de la model card, `max_length=8192`) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Número de clases | 5 (`compliant`, `full_refusal`, `partial_refusal`, `capability_limitation`, `clarification`) |
| Modelo base | answerdotai/ModernBERT-base |
| Tamaño del repositorio | 0,6 GB |
| Librería | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-base, un encoder transformer de 149,6 millones de parámetros entrenado originalmente sobre datos en inglés y código. Sobre esa base se añade una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) con 5 etiquetas de salida. La entrada se construye como un par (prompt, respuesta) mediante `tokenizer(prompt, text_pair=response, ...)`, de modo que el encoder procesa conjuntamente la petición del usuario y la contestación del LLM.

El entrenamiento se realizó con el `Trainer` de Hugging Face sobre una partición 80/10/10 del conjunto de datos (entrenamiento, validación y test). La selección del checkpoint se hizo maximizando el macro F1 de validación, que alcanzó 0,9416 en el paso 300. No se documentan en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores; tampoco se detalla si hubo congelación parcial de capas del encoder base o fine-tuning completo.

La innovación principal no reside en la arquitectura (heredada íntegramente del modelo base) sino en la taxonomía de cinco clases, que distingue entre rechazo total, rechazo parcial, limitación de capacidad y petición de aclaración, en lugar de reducir el problema a una clasificación binaria de rechazo/no rechazo.

## Capacidades

- Clasificación de respuestas de LLM en cinco categorías de rechazo mediante pares prompt-respuesta.
- Distinción fina entre `full_refusal` y `partial_refusal`, útil para medir grados de cumplimiento.
- Identificación de respuestas que alegan `capability_limitation` (falta de acceso a datos, conocimiento o herramientas).
- Detección de respuestas de tipo `clarification`, en las que el modelo pide más información al usuario.
- Salida de probabilidades por clase mediante `softmax` sobre los logits, apta para umbrales personalizados.
- Procesamiento de entradas largas de hasta 8192 tokens.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento: es un clasificador, no un generador.
- Capacidad multilingüe: no, únicamente inglés.

## Casos de uso

- Auditoría de seguridad de LLM: clasificar automáticamente un corpus de respuestas generadas para cuantificar la tasa de rechazos totales, parciales y limitaciones de capacidad, generando métricas de alineamiento por versión de modelo.
- Monitorización en producción: integrar el clasificador como componente de un pipeline que etiquete en tiempo real las respuestas de un asistente conversacional y dispare alertas cuando la proporción de `full_refusal` se desvíe de lo esperado.
- Investigación sobre jailbreaks: evaluar si un prompt malicioso consigue convertir un `full_refusal` en un `compliant`, comparando la clasificación antes y después de aplicar una técnica de ataque.
- Filtrado y enrutado de datos: descartar o redirigir respuestas de tipo `capability_limitation` antes de usarlas en pipelines de evaluación o de destilación, evitando entrenar con ejemplos poco informativos.
- Detección de necesidad de clarificación: identificar respuestas `clarification` en un sistema multi-turno para activar automáticamente una plantilla de pregunta de seguimiento al usuario.
- Evaluación comparativa de modelos: construir un ranking de LLM según su comportamiento de rechazo ante un mismo conjunto de prompts, con métricas por clase y macro F1.
- Análisis de regresiones tras actualizaciones: ejecutar el clasificador sobre un conjunto de referencia fijo cada vez que se despliega una nueva versión del LLM y comparar la distribución de etiquetas con la versión anterior.
- Anotación asistida de datasets: preetiquetar grandes volúmenes de pares prompt-respuesta para revisión humana posterior, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados una sola vez sobre el split de test (445 filas) con el checkpoint publicado:

| Métrica global | Valor |
|---|---|
| Accuracy | 0,9371 |
| Macro F1 | 0,9382 |
| Weighted F1 | 0,9375 |
| Macro F1 de validación (selección de checkpoint) | 0,9416 (paso 300) |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| `compliant` | 0,8646 | 0,8925 | 0,8783 | 93 |
| `full_refusal` | 0,9880 | 0,9318 | 0,9591 | 88 |
| `partial_refusal` | 0,9341 | 0,9659 | 0,9497 | 88 |
| `capability_limitation` | 0,9881 | 0,9432 | 0,9651 | 88 |
| `clarification` | 0,9231 | 0,9545 | 0,9385 | 88 |
| Macro avg | 0,9396 | 0,9376 | 0,9382 | 445 |
| Weighted avg | 0,9387 | 0,9371 | 0,9375 | 445 |

No se han publicado comparaciones con otros clasificadores de rechazo (MMLU, HumanEval, GSM8K y similares no aplican a esta tarea). La clase con peor rendimiento es `compliant` (F1 0,8783), lo que sugiere confusión con clases de rechazo parcial o clarificación.

## Requisitos de hardware

- VRAM estimada para pesos: ≈0,6 GB en fp32 (coincide con el tamaño del repositorio), ≈0,3 GB en fp16/bf16, ≈0,15 GB en int8 y ≈0,08 GB en int4 (estimaciones teóricas a partir de los 149,6 M de parámetros).
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o Apple Silicon.
- Inferencia en CPU perfectamente viable para lotes pequeños, dado el reducido tamaño del modelo.
- GPU recomendadas para alto throughput: A100, H100 o L40S si se necesita procesar grandes volúmenes por segundo con batching.
- Opciones de despliegue: `transformers` (uso directo mostrado en la model card), Text Embeddings Inference (el repositorio incluye el tag `text-embeddings-inference` y `endpoints_compatible`), y servidores de inferencia compatibles con clasificación de secuencias.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Clases | Licencia |
|---|---|---|---|---|---|
| VINAY-UMRETHE/Refusal-Classifier | 149,6 M | 8192 | Clasificación de rechazos | 5 | no disponible |
| answerdotai/ModernBERT-base | 149,6 M | 8192 | Encoder base (sin cabeza de clasificación) | no aplica | Apache 2.0 |
| Otros clasificadores de rechazo o seguridad | no disponible | no disponible | Clasificación | no disponible | no disponible |

La información disponible no permite establecer comparaciones cuantitativas con alternativas equivalentes de detección de rechazos. El único punto de referencia documentado es el modelo base del que deriva, que no resuelve la misma tarea.

## Limitaciones y advertencias

- Idioma: solo inglés. La propia model card advierte que el rendimiento empeora en otros idiomas.
- Robustez: se esperan resultados peores ante rechazos formulados de manera distinta a los del conjunto de entrenamiento.
- Clase `compliant` con menor precisión (0,8646): parte de las respuestas clasificadas como conformes podrían ser en realidad rechazos parciales o clarificaciones.
- Tamaño de test reducido (445 filas, 88-93 por clase), lo que limita la significación estadística de las métricas publicadas.
- Evaluación realizada una sola vez sobre el split de test con el checkpoint publicado; no se documentan intervalos de confianza ni validación cruzada.
- Licencia no declarada: no se puede asumir uso comercial libre sin consultar previamente al autor.
- Riesgo de error de clasificación en dominios alejados de los datos de entrenamiento; no es un sistema de seguridad por sí mismo y no debería usarse como único mecanismo de bloqueo.
- El modelo no genera texto ni tiene capacidades de razonamiento, tool calling o agentes; cualquier expectativa en ese sentido es incorrecta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopción ni de validación por terceros.
- Los resultados de búsqueda web obtenidos no contienen información relevante sobre este modelo (se refieren a la localidad francesa de Vinay).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Modelo base (answerdotai/ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
- Curvas de entrenamiento (Space de Trackio): https://huggingface.co/spaces/VINAY-UMRETHE/Refusal-Classifier-trackio

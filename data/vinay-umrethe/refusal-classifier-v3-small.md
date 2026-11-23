# VINAY-UMRETHE/Refusal-Classifier-V3-Small

## Resumen

Refusal-Classifier-V3-Small es un modelo de clasificación de texto en inglés, desarrollado por VINAY-UMRETHE, que detecta y categoriza el tipo de respuesta que un LLM da ante una petición del usuario. Se ha obtenido por fine-tuning del modelo encoder answerdotai/ModernBERT-base y resuelve un problema concreto en el ciclo de vida de los sistemas conversacionales: distinguir de forma automática si una respuesta es conforme, un rechazo total, un rechazo parcial, una limitación de capacidad técnica o una petición de aclaración.

El modelo es relevante ahora porque la evaluación de la seguridad y la calidad de los asistentes basados en LLM exige métricas objetivas sobre el comportamiento de rechazo. En lugar de revisar manualmente miles de pares prompt-respuesta, este clasificador permite etiquetar a escala con cinco categorías bien definidas, lo que facilita auditorías de alineamiento, control de regresiones en producción y construcción de datasets de preferencias.

Arquitectura ModernBERT (encoder transformer con atención de contexto largo), 149,6 millones de parámetros, licencia Apache 2.0 y un tamaño de repositorio de 0,6 GB. Es un modelo pequeño y desplegable en CPU o GPU de consumo, pensado como componente de clasificación dentro de pipelines más amplios, no como generador de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 149.608.709 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (max_length usado en la tokenización de ejemplo) |
| Tipos de cuantizacion | no disponible (pesos safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer moderno que incorpora atención con RoPE, alternancia de capas de atención global y local, y soporte de secuencias largas. Sobre esa base se ha añadido una cabeza de clasificación de secuencias con cinco etiquetas (`compliant`, `full_refusal`, `partial_refusal`, `capability_limitation`, `clarification`). La entrada se construye como un par de secuencias (prompt, respuesta) con `text_pair`, truncando a 8.192 tokens.

El fine-tuning se realizó sobre el split `train` de un dataset de rechazos en inglés, con selección de checkpoint sobre el split `validation` según macro F1; el mejor checkpoint se alcanzó en el paso 2000 con un macro F1 de validación de 0,9957. La evaluación final se hizo una sola vez sobre el split `test` (1.124 filas). No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de una tarea de clasificación supervisada, lo esperable es entrenamiento con pérdida de entropía cruzada, pero el autor no lo detalla.

## Capacidades

- Clasificación de pares prompt-respuesta en cinco categorías de rechazo y conformidad.
- Distinción entre rechazo por políticas de seguridad (`full_refusal`, `partial_refusal`) y rechazo por limitaciones técnicas (`capability_limitation`), una separación poco habitual en clasificadores de seguridad.
- Detección de respuestas que solicitan aclaración en lugar de responder o rechazar (`clarification`).
- Procesamiento de entradas largas de hasta 8.192 tokens, adecuado para prompts y respuestas extensas.
- Salida de logits por clase, lo que permite obtener probabilidades calibradas mediante softmax y aplicar umbrales personalizados.
- Capacidad monolingüe: solo inglés.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un clasificador, no un generador.
- Compatible con text-embeddings-inference y endpoints de Hugging Face según los tags del repositorio.

## Casos de uso

- Auditoría de alineamiento y seguridad: clasificar a escala las respuestas de un LLM desplegado para medir su tasa de rechazo total, parcial y conformidad, y detectar regresiones tras cambios de prompt o de versión del modelo.
- Construcción de datasets de preferencias: etiquetar pares prompt-respuesta para entrenar modelos de recompensa o filtrar ejemplos antes de un DPO, separando rechazos legítimos de respuestas conformes.
- Monitorización en producción: ejecutar el clasificador como paso posterior a cada respuesta generada y disparar alertas cuando la proporción de `full_refusal` o `capability_limitation` se desvía del umbral esperado.
- Evaluación de sistemas con herramientas: identificar respuestas etiquetadas como `capability_limitation` para diagnosticar si el agente carece de una tool necesaria o si el arnés de herramientas está fallando.
- Investigación sobre tasas de rechazo diferencial: analizar si el modelo rechaza más ante determinados colectivos o formulaciones, usando la clase `partial_refusal` para estudiar respuestas mixtas.
- Filtrado de datos de entrenamiento: descartar o reetiquetar respuestas de un corpus sintético que sean rechazos o aclaraciones antes de usarlas para fine-tuning.
- Detección de prompts ambiguos: usar la clase `clarification` para medir la frecuencia con la que un asistente pide aclaraciones y ajustar el diseño de la interfaz o del system prompt.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test (1.124 filas), con el checkpoint publicado:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9956 |
| Macro F1 | 0,9959 |
| Weighted F1 | 0,9956 |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| `compliant` | 1,0000 | 1,0000 | 1,0000 | 184 |
| `full_refusal` | 0,9803 | 1,0000 | 0,9901 | 249 |
| `partial_refusal` | 1,0000 | 0,9835 | 0,9917 | 242 |
| `capability_limitation` | 1,0000 | 0,9960 | 0,9980 | 252 |
| `clarification` | 1,0000 | 1,0000 | 1,0000 | 197 |
| Macro avg | 0,9961 | 0,9959 | 0,9959 | 1124 |
| Weighted avg | 0,9956 | 0,9956 | 0,9956 | 1124 |

No se han publicado comparaciones con otros clasificadores de rechazo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB de pesos más activaciones; en fp16/bf16 alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para clasificación por lotes. Para alto throughput, una RTX 4090, L4 o A10 son más que suficientes; A100/H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3060, etc.), e incluso en CPU.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference (según tags), endpoints de Hugging Face. No se documenta soporte específico de vLLM, llama.cpp u Ollama (son para generación, no para clasificación).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Refusal-Classifier-V3-Small | 149,6 M | 8.192 tokens | Clasificación de rechazos (5 clases) | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | 149,6 M | 8.192 tokens | Encoder base (MLM) | Apache 2.0 | Hugging Face |
| Clasificadores de toxicidad/safety genéricos (p. ej. basados en DeBERTa) | 100-400 M | 512-1.024 tokens | Clasificación binaria de seguridad | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas específicas de clasificación de rechazo en la información proporcionada. La comparación con ModernBERT-base es estructural (mismo backbone), y la comparación con clasificadores de seguridad genéricos es cualitativa: este modelo distingue cinco categorías frente a la clasificación binaria habitual.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de rechazo en inglés; el rendimiento en otros idiomas no está garantizado y el autor advierte de resultados peores.
- Sensible a la formulación: rechazos redactados de forma distinta a la del dataset de entrenamiento pueden clasificarse incorrectamente.
- Riesgo de alucinación no aplica en sentido generativo (no genera texto), pero sí de falsos positivos y negativos en la clasificación; las métricas publicadas son sobre un test interno del autor, no sobre un benchmark externo independiente.
- El modelo no se ha evaluado de forma independiente; las métricas de 0,9956 de accuracy proceden del propio autor y deben tomarse con cautela en dominios distintos.
- Licencia Apache 2.0: permite uso comercial y modificación, con atribución y conservación del aviso de licencia.
- Al ser un clasificador de pares prompt-respuesta, requiere que el pipeline proporcione ambos textos; no clasifica respuestas aisladas sin el prompt original.
- No sustituye a una revisión humana en decisiones de alto riesgo: la distinción entre `partial_refusal` y `capability_limitation` puede ser sutil en respuestas mixtas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V3-Small
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base

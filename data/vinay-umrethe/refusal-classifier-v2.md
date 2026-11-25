# VINAY-UMRETHE/Refusal-Classifier-v2

## Resumen

Refusal-Classifier-v2 es un modelo de clasificación de texto desarrollado por Vinay Umrethe (usuario VINAY-UMRETHE en Hugging Face) que detecta y categoriza el tipo de respuesta que un asistente conversacional da ante una petición del usuario. No genera texto: toma un par prompt-respuesta y asigna una de cinco etiquetas (`compliant`, `full_refusal`, `partial_refusal`, `capability_limitation`, `clarification`). Resuelve un problema concreto en el ciclo de vida de los LLM: medir de forma automática y a escala cuándo un modelo rechaza una petición, cuándo la cumple, cuándo solo cumple la parte segura y cuándo simplemente pide aclaraciones o alega limitaciones técnicas.

El modelo es un fine-tuning de `answerdotai/ModernBERT-base`, un transformer encoder de 149.608.709 parámetros con atención de contexto largo. Se distribuye en formato safetensors, con licencia Apache 2.0 y un tamaño de repositorio de 0,6 GB. Está pensado para pipelines de evaluación de seguridad, monitorización de despliegues y construcción de datasets de rechazos, no para inferencia generativa.

Su relevancia actual radica en que los rechazos de los LLM son un fenómeno difícil de etiquetar de forma consistente: distinguir un rechazo por política de seguridad de una limitación técnica o de una petición de aclaración requiere criterio semántico. Este clasificador automatiza esa distinción con métricas publicadas de accuracy 0,9872 y macro F1 0,9874 sobre un conjunto de test de 1017 filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, fine-tuning para clasificación de secuencias) |
| Parametros totales | 149.608.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens en el ejemplo de uso (heredada de ModernBERT-base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT con 149,6 millones de parámetros, optimizado para contextos largos y eficiencia en inferencia. Sobre esa base se añadió una cabeza de clasificación de secuencias con cinco clases de salida, y se realizó un fine-tuning supervisado sobre un dataset de rechazos en inglés. La entrada se construye como un par de secuencias (prompt como texto principal y respuesta como `text_pair`), truncado a 8192 tokens.

El entrenamiento usó los splits `train` y `validation` del dataset del autor, con selección del checkpoint según el mejor macro F1 en validación. El checkpoint publicado corresponde al paso 1800, con un macro F1 de validación de 0,9937. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador supervisado, pero no se confirma el detalle). Tampoco se especifican innovaciones técnicas adicionales más allá del uso de la arquitectura ModernBERT y del esquema de clasificación multi-etiqueta de cinco clases.

## Capacidades

- Clasificación de pares prompt-respuesta en cinco categorías: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.
- Distinción entre rechazo por política de seguridad (`full_refusal`, `partial_refusal`) y rechazo por limitación técnica o de herramientas (`capability_limitation`).
- Detección de respuestas que cumplen la petición sin advertencias (`compliant`).
- Detección de respuestas que piden aclaración en lugar de responder o rechazar (`clarification`).
- Procesamiento de contexto largo: el ejemplo de uso trunca a 8192 tokens, adecuado para conversaciones multi-turno o prompts extensos.
- Salida con probabilidades por clase mediante softmax, lo que permite umbrales de confianza ajustables.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face según los tags del repositorio.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Evaluación de seguridad de LLM en producción: clasificar automáticamente las respuestas de un modelo desplegado para medir su tasa de rechazo por política y detectar regresiones tras cambios de prompt o de versión.
- Construcción de datasets de rechazos: etiquetar a escala grandes volúmenes de pares prompt-respuesta para entrenar o evaluar modelos de moderación y de alineamiento.
- Monitorización de asistentes conversacionales: detectar cuándo un asistente deriva peticiones legítimas a `capability_limitation` por falta de herramientas, lo que indica carencias en el harness del agente.
- Análisis de calidad de atención al cliente automatizada: identificar respuestas `clarification` excesivas que indican prompts ambiguos o un diseño de flujo deficiente, y medir la proporción de respuestas `compliant` reales.
- Auditoría de cumplimiento normativo: generar informes sobre qué porcentaje de peticiones potencialmente sensibles reciben `partial_refusal` (rechazo de la parte dañina con cumplimiento de la educativa), útil para revisar políticas de uso aceptable.
- Investigación sobre sobre-rechazo (over-refusal): comparar la distribución de etiquetas entre modelos y versiones para cuantificar si un ajuste de seguridad está rechazando peticiones benignas (`compliant` esperado frente a `full_refusal` observado).
- Filtrado en pipelines de datos: descartar o marcar respuestas de un corpus sintético según su tipo de rechazo antes de usarlas para entrenamiento.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el split de test (1017 filas), con el checkpoint publicado:

| Metrica | Valor |
|---|---|
| Accuracy | 0,9872 |
| Macro F1 | 0,9874 |
| Weighted F1 | 0,9872 |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| `compliant` | 0,9716 | 0,9884 | 0,9799 | 173 |
| `full_refusal` | 0,9841 | 0,9920 | 0,9880 | 249 |
| `partial_refusal` | 0,9905 | 0,9674 | 0,9788 | 215 |
| `capability_limitation` | 0,9955 | 0,9911 | 0,9933 | 224 |
| `clarification` | 0,9936 | 1,0000 | 0,9968 | 156 |
| Macro avg | 0,9871 | 0,9878 | 0,9874 | 1017 |
| Weighted avg | 0,9873 | 0,9872 | 0,9872 | 1017 |

El macro F1 de validación en el paso 1800 fue de 0,9937. No se han publicado comparaciones con otros clasificadores de rechazo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 149,6 millones de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,6 GB de pesos; en fp16/bf16 alrededor de 0,3 GB, más el overhead de activaciones y tokenizador. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: funciona en GPUs de gama baja y media (RTX 3060, RTX 4060, T4, L4). Para lotes grandes o alto throughput, A10G, A100 o H100 no son necesarias pero permiten mayor paralelismo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM efectiva; incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (con `AutoModelForSequenceClassification`), `text-embeddings-inference` (según tags del repo), endpoints de Hugging Face, y servidores de inferencia compatibles con modelos de clasificación de transformers. No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Refusal-Classifier-v2 | 149,6 M | 8192 tokens (uso) | Clasificación de rechazos (5 clases) | Apache 2.0 | Hugging Face |
| ModernBERT-base (base) | 149,6 M | 8192 tokens | Encoder general, clasificación y embeddings | Apache 2.0 | Hugging Face |
| Clasificadores de rechazo alternativos | no disponible | no disponible | Clasificación de rechazos | no disponible | no disponible |

No se dispone de información sobre otros clasificadores de rechazo comparables con métricas publicadas en la información proporcionada. La comparación con ModernBERT-base es estructural (mismo backbone), no de rendimiento en la tarea.

## Limitaciones y advertencias

- Entrenado exclusivamente con rechazos en inglés: el rendimiento en otros idiomas será peor, según advierte el propio autor.
- Sensible a la formulación: rechazos redactados de forma distinta a los del dataset de entrenamiento pueden clasificarse incorrectamente.
- Riesgo de alucinación no aplica como tal (no genera texto), pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en casos límite entre `partial_refusal` y `compliant`.
- El conjunto de test es de 1017 filas y proviene del mismo dataset que el entrenamiento; las métricas pueden no generalizar a distribuciones de rechazos de otros modelos o dominios.
- No es un modelo generativo: no debe usarse para producir respuestas ni para moderación directa sin un clasificador complementario.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el copyright corresponde a Vinay Umrethe (2026).
- No se documentan sesgos específicos más allá de la limitación de idioma y de dominio del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-v2
- Modelo base ModernBERT-base: https://huggingface.co/answerdotai/ModernBERT-base

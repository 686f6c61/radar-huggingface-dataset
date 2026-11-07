# VINAY-UMRETHE/Refusal-Classifier-V2

## Resumen

Refusal-Classifier-V2 es un modelo de clasificación de texto en inglés, desarrollado por Vinay Umrethe, que se encarga de detectar y categorizar las negativas (refusals) de un modelo de lenguaje ante una petición del usuario. Se trata de un fine-tune de answerdotai/ModernBERT-base, una arquitectura transformer encoder de tipo BERT modernizado, con 149.608.709 parámetros totales y un tamaño de repositorio de 0,6 GB. El modelo recibe un par prompt-respuesta y asigna una de cinco etiquetas: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.

El problema que resuelve es la necesidad de auditar y monitorizar el comportamiento de sistemas de IA en producción: distinguir entre una respuesta que cumple la petición, una negativa por políticas de seguridad, una negativa parcial, una limitación técnica real (falta de herramientas, corte de conocimiento) y una petición de aclaración. Esta granularidad es relevante para evaluar la tasa de rechazo, detectar sobre-rechazo (over-refusal) y construir pipelines de evaluación automática de asistentes conversacionales.

El checkpoint publicado se seleccionó por el mayor macro F1 en validación (0,9937 en el paso 1800) y se evaluó una única vez sobre el split de test de 1017 filas, con una accuracy de 0,9872 y un macro F1 de 0,9874. La licencia es Apache 2.0 y el modelo está pensado exclusivamente para texto en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder, base_model: answerdotai/ModernBERT-base) |
| Parámetros totales | 149.608.709 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max_length usado en el ejemplo de uso; contexto nativo de ModernBERT-base no detallado en la información proporcionada) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de clasificación de secuencias sobre answerdotai/ModernBERT-base, un encoder transformer de la familia BERT con 149,6 millones de parámetros. La tarea es de clasificación de pares de texto (prompt y respuesta) en cinco clases, implementada mediante `AutoModelForSequenceClassification` con una cabeza de clasificación sobre el encoder. El tokenizador asociado procesa el prompt como texto principal y la respuesta como `text_pair`, con truncación a `max_length=8192`.

El entrenamiento se realizó sobre el split `train` de un dataset de refusals en inglés (no se detalla en la información proporcionada el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO, que en un modelo de clasificación no aplicarían). La selección del checkpoint se basó en el macro F1 sobre el split de validación, alcanzando 0,9937 en el paso 1800. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las propias de ModernBERT-base.

## Capacidades

- Clasificación de texto en inglés para pares prompt-respuesta en cinco categorías: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.
- Detección de negativas por políticas de seguridad, ética, moral o legal (`full_refusal`).
- Detección de negativas parciales, donde se rechaza la parte dañina pero se responde a la parte segura o educativa (`partial_refusal`).
- Distinción entre negativa por políticas y limitación técnica real, como falta de acceso a internet, datos en tiempo real, generación de imágenes o tool calling (`capability_limitation`).
- Detección de respuestas que solicitan aclaración en lugar de responder o rechazar (`clarification`).
- Salida de probabilidades por clase mediante softmax sobre los logits, lo que permite umbrales de confianza ajustables.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada al inglés; el autor advierte explícitamente que el rendimiento empeora en otros idiomas.

## Casos de uso

- Auditoría de asistentes conversacionales en producción: el modelo clasifica cada par prompt-respuesta de un log de conversaciones para medir la tasa de `full_refusal`, `partial_refusal` y `compliant`, permitiendo detectar sobre-rechazo o infra-rechazo en un despliegue real.
- Monitorización de seguridad y cumplimiento: integrar el clasificador en un pipeline que marque respuestas con etiqueta `full_refusal` o `partial_refusal` para revisión humana o para alimentar dashboards de política de contenido.
- Evaluación de benchmarks de rechazo: usar el modelo para etiquetar automáticamente las respuestas de otros LLM en conjuntos de evaluación de seguridad, sustituyendo anotación manual con una accuracy reportada de 0,9872 sobre el test split.
- Detección de limitaciones técnicas frente a negativas de política: en sistemas con agentes y herramientas, clasificar respuestas como `capability_limitation` para distinguir fallos de integración (falta de tool calling, corte de conocimiento) de rechazos deliberados por seguridad.
- Análisis de calidad de atención al cliente automatizada: identificar cuándo el asistente pide aclaración (`clarification`) en lugar de responder, lo que señala prompts ambiguos o flujos de conversación mal diseñados.
- Investigación sobre comportamiento de LLM: estudiar la distribución de tipos de negativa entre distintos modelos o versiones, usando el clasificador como instrumento de medida reproducible sobre pares prompt-respuesta en inglés.
- Filtrado de datasets: descartar o etiquetar muestras con `full_refusal` o `partial_refusal` antes de reentrenar o ajustar un modelo generativo, reduciendo la contaminación por respuestas evasivas.

## Benchmarks y rendimiento

Evaluación publicada por el autor sobre el split de test (1017 filas), con el checkpoint publicado:

| Métrica | Valor |
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
| macro avg | 0,9871 | 0,9878 | 0,9874 | 1017 |
| weighted avg | 0,9873 | 0,9872 | 0,9872 | 1017 |

No se han publicado resultados comparativos con otros clasificadores de rechazo en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 149,6 M de parámetros en safetensors (repo de 0,6 GB), la inferencia en FP32 requiere aproximadamente 0,6 GB de pesos más overhead de activaciones; en FP16/BF16 se reduce a unos 0,3 GB de pesos. Las cifras exactas de activaciones para contexto de 8192 tokens no están documentadas en la información proporcionada.
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños; para throughput alto en servidor se puede usar A100 o H100, aunque el modelo es pequeño y no las requiere.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre para lotes moderados.
- Opciones de despliegue: transformers (uso documentado en la model card), text-embeddings-inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible para este modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Refusal-Classifier-V2 | 149,6 M | 8192 tokens (uso documentado) | Clasificación de refusals en 5 clases | Apache 2.0 | Hugging Face |
| Refusal-Classifier (versión previa del mismo autor) | no disponible | no disponible | Clasificación de refusals | no disponible | Hugging Face |
| answerdotai/ModernBERT-base (modelo base) | no disponible en la información | no disponible en la información | Encoder base para fine-tune | no disponible en la información | Hugging Face |

No se dispone en la información proporcionada de otros clasificadores de rechazo comparables con métricas publicadas; la comparativa con alternativas de la misma categoría queda, por tanto, limitada a las versiones del mismo autor y al modelo base.

## Limitaciones y advertencias

- Entrenado exclusivamente con un dataset de refusals en inglés: el rendimiento en otros idiomas es previsiblemente peor, según advierte el propio autor.
- Sensible a la formulación: refusals redactados de forma distinta a la de los datos de entrenamiento pueden clasificarse erróneamente.
- Riesgo de alucinación de etiqueta: al ser un clasificador, puede asignar con alta confianza una clase incorrecta en entradas fuera de distribución; se recomienda calibrar umbrales sobre datos propios.
- Sesgos del dataset de entrenamiento no documentados en la información disponible; la composición y procedencia de los datos no se detalla.
- No es un modelo generativo: no produce respuestas, solo etiquetas; no debe usarse como sustituto de un LLM.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de copyright de Vinay Umrethe y las condiciones de la licencia.
- El contexto de 8192 tokens en el ejemplo de uso puede truncar conversaciones largas; las respuestas que excedan ese límite se recortan y pueden perder la parte relevante para la clasificación.
- Solo 70 descargas y 0 likes en el momento de la ficha: modelo de nicho con validación comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Versión previa del mismo autor: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Repositorio del modelo (archivos y versiones): https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-v2/tree/main

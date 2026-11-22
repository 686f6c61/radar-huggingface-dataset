# VINAY-UMRETHE/Refusal-Classifier

## Resumen

Refusal-Classifier es un modelo de clasificación de texto desarrollado por Vinay Umrethe (usuario VINAY-UMRETHE en Hugging Face) que detecta y categoriza el tipo de respuesta que un LLM ofrece ante una petición del usuario. Se trata de un fine-tuning de answerdotai/ModernBERT-base, un transformer encoder de 149,6 millones de parámetros, sobre el dataset Refusal-Classification del mismo autor. El modelo resuelve un problema concreto en el ámbito del alineamiento y la evaluación de LLMs: distinguir de forma automática entre una respuesta que cumple la petición, una que la rechaza por políticas de seguridad, una que la rechaza parcialmente, una que se limita por incapacidad técnica y una que pide aclaración.

La relevancia actual del modelo radica en que muchas evaluaciones de seguridad y de calidad de asistentes dependen de clasificar correctamente los rechazos, y hacerlo con un encoder pequeño y rápido resulta mucho más económico que recurrir a un LLM juez. El modelo clasifica pares prompt-respuesta en cinco etiquetas mutuamente excluyentes y emplea una longitud máxima de 8192 tokens, lo que permite manejar conversaciones y respuestas largas. Su licencia Apache 2.0 facilita la integración en pipelines comerciales.

El checkpoint publicado fue seleccionado por el mayor macro F1 en validación (0,9416 en el paso 300) y alcanza un 0,9371 de accuracy y un 0,9382 de macro F1 en el split de test de 445 filas. Es un modelo exclusivamente en inglés y orientado a la clasificación, no a la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) para clasificación de secuencias |
| Parametros totales | 149.608.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (max_length usado en el ejemplo de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer de tipo BERT modernizado, y se fine-tunea como clasificador de secuencias con cinco clases de salida (compliant, full_refusal, partial_refusal, capability_limitation y clarification). La entrada es un par de textos: el prompt del usuario y la respuesta del asistente, tokenizados con `text_pair` y truncados a un máximo de 8192 tokens. El checkpoint publicado corresponde al paso 300, elegido por el mayor macro F1 en el split de validación (0,9416).

El entrenamiento se realizó sobre el split `train` del dataset VINAY-UMRETHE/Refusal-Classification, con selección de checkpoint mediante el split `validation` y evaluación final única sobre el split `test` (445 filas). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al ser un clasificador supervisado, el ajuste es por clasificación con etiquetas, no por preferencias. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las propias de ModernBERT.

## Capacidades

- Clasificación de pares prompt-respuesta en cinco categorías: cumplimiento, rechazo total, rechazo parcial, limitación de capacidad y petición de aclaración.
- Distinción entre rechazo por políticas de seguridad y limitación técnica (falta de herramientas, corte de conocimiento, incapacidad de generar imágenes, etc.).
- Detección de rechazos parciales en los que el modelo rechaza la parte dañina y responde a la parte segura o educativa.
- Manejo de entradas largas de hasta 8192 tokens, adecuado para respuestas extensas y conversaciones multi-turno.
- Salida de logits por clase, lo que permite obtener probabilidades calibradas mediante softmax.
- No soporta tool calling, function calling ni razonamiento agéntico: es un modelo de clasificación, no un generador.
- Capacidad monolingüe en inglés; no se documenta soporte multilingüe.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Evaluación de seguridad de asistentes conversacionales: clasificar automáticamente las respuestas de un LLM ante prompts sensibles para medir su tasa de rechazo total, parcial y de cumplimiento, usando el modelo como juez ligero en lugar de un LLM de gran tamaño.
- Auditoría de alineamiento en pipelines de RLHF o DPO: etiquetar grandes volúmenes de pares prompt-respuesta para construir datasets de preferencias o para detectar respuestas que se desvían de la política de seguridad.
- Monitorización en producción: integrar el clasificador en un servicio de inferencia para marcar en tiempo real respuestas que sean rechazos o peticiones de aclaración y activar revisiones humanas o fallbacks.
- Detección de limitaciones técnicas: identificar cuándo un asistente responde "no tengo acceso a internet" o "no puedo generar imágenes" para distinguir fallos de capacidad de rechazos por política y priorizar mejoras de herramientas.
- Análisis de conversaciones multi-turno: procesar historiales largos (hasta 8192 tokens) para estudiar cómo evoluciona el comportamiento de rechazo a lo largo de un diálogo.
- Control de calidad de datasets: filtrar y etiquetar corpus de instrucciones y respuestas antes de usarlos en entrenamiento, separando ejemplos compliant de los que contienen rechazos o aclaraciones.
- Investigación sobre refusal behavior: cuantificar la frecuencia y el tipo de rechazos en distintos modelos y comparar su comportamiento ante el mismo conjunto de prompts.

## Benchmarks y rendimiento

Evaluación publicada en el split `test` (445 filas) con el checkpoint publicado:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9371 |
| Macro F1 | 0.9382 |
| Weighted F1 | 0.9375 |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| compliant | 0.8646 | 0.8925 | 0.8783 | 93 |
| full_refusal | 0.9880 | 0.9318 | 0.9591 | 88 |
| partial_refusal | 0.9341 | 0.9659 | 0.9497 | 88 |
| capability_limitation | 0.9881 | 0.9432 | 0.9651 | 88 |
| clarification | 0.9231 | 0.9545 | 0.9385 | 88 |
| macro avg | 0.9396 | 0.9376 | 0.9382 | 445 |
| weighted avg | 0.9387 | 0.9371 | 0.9375 | 445 |

El macro F1 en validación del checkpoint seleccionado (paso 300) fue de 0,9416. La clase con peor rendimiento es `compliant` (F1 0,8783), mientras que `capability_limitation` y `full_refusal` superan el 0,95 de F1.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,6 GB en precisión completa (fp32) para los 149,6 millones de parámetros; aproximadamente 0,3 GB en fp16/bf16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU consumer e incluso en CPU para lotes pequeños.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference (el modelo declara compatibilidad con endpoints), y despliegue estándar mediante Hugging Face Inference Endpoints. No se documenta soporte específico para vLLM, llama.cpp u Ollama al ser un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 149,6 millones de parámetros, se espera una latencia baja por muestra, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La model card indica que existe una versión posterior, VINAY-UMRETHE/Refusal-Classifier-V2, que puede considerarse una alternativa directa del mismo autor.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Refusal-Classifier | 149,6 M | 8192 tokens | apache-2.0 | Clasificador de 5 clases, solo inglés |
| Refusal-Classifier-V2 | no disponible | no disponible | no disponible | Versión posterior del mismo autor, sin datos publicados en la información disponible |
| ModernBERT-base (modelo base) | no disponible en la información proporcionada | no disponible | no disponible | Encoder base sin fine-tuning para esta tarea |

## Limitaciones y advertencias

- Entrenado exclusivamente con rechazos en inglés; se espera un rendimiento peor en otros idiomas.
- Peor rendimiento ante rechazos formulados de forma distinta a los del conjunto de entrenamiento.
- Riesgo de confundir rechazos por política con limitaciones de capacidad cuando el texto es ambiguo.
- La clase `compliant` es la que presenta menor F1 (0,8783) y menor precisión (0,8646), por lo que puede producir falsos positivos de cumplimiento o de rechazo en respuestas límite.
- El modelo clasifica, no genera: no debe usarse como asistente ni para producir respuestas.
- El tamaño del conjunto de test (445 filas) es reducido, lo que limita la robustez estadística de las métricas publicadas.
- No se documentan sesgos específicos del dataset de entrenamiento ni su composición, lo que dificulta evaluar sesgos sistemáticos.
- Licencia Apache 2.0, que permite uso comercial con atribución y sin garantías; el autor declara copyright en 2026.
- No se documentan cuantizaciones ni formatos alternativos a safetensors, lo que limita su uso en entornos sin transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/VINAY-UMRETHE/Refusal-Classification
- Versión posterior: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V2

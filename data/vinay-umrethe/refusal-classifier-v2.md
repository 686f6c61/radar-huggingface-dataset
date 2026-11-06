# VINAY-UMRETHE/Refusal-Classifier-v2

## Resumen

Refusal-Classifier-v2 es un modelo de clasificación de texto derivado de answerdotai/ModernBERT-base mediante fine-tuning, desarrollado por el usuario VINAY-UMRETHE y publicado en Hugging Face. Su función es determinar, a partir de un par prompt-respuesta, si un LLM ha respondido de forma conforme a la petición o si, por el contrario, ha rehusado total o parcialmente, ha alegado una limitación de capacidades o ha solicitado una aclaración. Clasifica cada par en una de cinco etiquetas: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.

El modelo resuelve un problema concreto en el ámbito de la evaluación y monitorización de sistemas conversacionales: la detección automática de rechazos (refusals) para auditar el comportamiento de asistentes, medir tasas de sobre-rechazo o filtrar respuestas en pipelines de datos. Al estar construido sobre ModernBERT, aprovecha una arquitectura transformer encoder-only con atención optimizada y una ventana de contexto de 8.192 tokens, lo que permite procesar pares prompt-respuesta largos sin truncamiento agresivo.

Con 149,6 millones de parámetros y un tamaño de repositorio de 0,6 GB, es un modelo compacto y ligero, adecuado para inferencia en CPU o GPU de consumo. El checkpoint publicado reporta un macro F1 de 0,9843 en el conjunto de test (445 filas), aunque no se han publicado resultados de benchmarks estándar ni información sobre el dataset de entrenamiento más allá del esquema de partición 80/10/10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder-only) |
| Parametros totales | 149.608.709 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (según el ejemplo de uso de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un transformer encoder-only que incorpora innovaciones como atención con rotación posicional (RoPE), alternancia de atención local y global, y capas de embedding desacopladas. Sobre esta base se ha aplicado un fine-tuning de clasificación de secuencias con cinco clases de salida, usando la librería `transformers` y el `Trainer` de Hugging Face. La entrada es un par de secuencias (prompt y respuesta) codificadas mediante `text_pair`, y la salida es una distribución softmax sobre las cinco etiquetas.

El entrenamiento se realizó sobre una partición 80/10/10 del dataset (no se especifica el número total de ejemplos ni su composición). La selección del checkpoint se hizo maximizando el macro F1 de validación, que alcanzó 0,9937 en el paso 1800. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un ajuste supervisado estándar de clasificación. Tampoco se detalla la composición del dataset, la procedencia de los datos ni si hubo aumento de datos o balanceo de clases.

## Capacidades

- Clasificación de pares prompt-respuesta en cinco categorías de rechazo: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.
- Detección de rechazos totales (respuestas del tipo "no puedo ayudar con eso").
- Detección de rechazos parciales (el modelo rechaza parte de la petición pero ofrece una alternativa).
- Detección de limitaciones de capacidad (el modelo alega no tener acceso a datos en tiempo real, no poder predecir el futuro, etc.).
- Detección de solicitudes de aclaración (el modelo pide más información antes de responder).
- Procesamiento de pares largos gracias a la ventana de contexto de 8.192 tokens.
- Inferencia por lotes mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking; es un clasificador, no un modelo generativo.
- Capacidad multilingüe limitada: solo inglés según la model card.

## Casos de uso

- Auditoría de seguridad de asistentes conversacionales: clasificar automáticamente las respuestas de un LLM desplegado para medir la tasa de rechazos ante prompts sensibles y detectar sobre-rechazo (falsos positivos de seguridad) o infra-rechazo (respuestas peligrosas que deberían haberse rechazado).
- Evaluación de sistemas de moderación: integrar el clasificador como componente de un pipeline de evaluación que etiquete cada respuesta generada y agregue métricas por categoría de rechazo, permitiendo comparar versiones de un modelo o de un filtro de seguridad.
- Filtrado de datasets de instrucciones: procesar grandes corpus de pares prompt-respuesta para eliminar o separar ejemplos con rechazos, mejorando la calidad de datasets de entrenamiento o de evaluación.
- Monitorización en producción: ejecutar el clasificador en tiempo real sobre las respuestas de un chatbot para generar alertas cuando la tasa de rechazos se desvía de los umbrales esperados, con bajo coste computacional gracias a sus 149,6 M de parámetros.
- Investigación sobre comportamiento de modelos: analizar cómo distintos LLM responden a las mismas familias de prompts y cuantificar diferencias en sus políticas de rechazo mediante las cinco etiquetas disponibles.
- Construcción de datasets etiquetados de rechazo: usar el modelo para pre-etiquetar grandes volúmenes de respuestas y luego revisar manualmente solo los casos de baja confianza, acelerando la anotación.
- Control de calidad en pipelines RAG: detectar cuándo el generador está rechazando responder por limitación de capacidades (por ejemplo, falta de datos en el contexto recuperado) y activar mecanismos de recuperación adicional.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test (445 filas):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9843 |
| Macro F1 | 0,9843 |
| Weighted F1 | 0,9843 |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| `compliant` | 0,9787 | 0,9892 | 0,9840 | 93 |
| `full_refusal` | 1,0000 | 0,9773 | 0,9885 | 88 |
| `partial_refusal` | 0,9667 | 0,9886 | 0,9775 | 88 |
| `capability_limitation` | 0,9885 | 0,9773 | 0,9829 | 88 |
| `clarification` | 0,9886 | 0,9886 | 0,9886 | 88 |
| **macro avg** | 0,9845 | 0,9842 | 0,9843 | 445 |
| **weighted avg** | 0,9844 | 0,9843 | 0,9843 | 445 |

El macro F1 de validación en el momento de selección del checkpoint (paso 1800) fue de 0,9937. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 (149,6 M de parámetros × 4 bytes), alrededor de 0,3 GB en fp16 y menos de 0,2 GB en int8. Cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son más que suficientes. También es viable la inferencia en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (nativo), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), y potencialmente ONNX u otros runtimes de clasificación. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo y la longitud máxima de 8.192 tokens, la latencia dependerá fuertemente de la longitud de los pares procesados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de rechazos en la documentación proporcionada. Como referencia estructural, se compara con su modelo base:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Refusal-Classifier-v2 | 149,6 M | 8.192 tokens | Clasificación de rechazos (5 clases) | no disponible | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en la información | no disponible en la información | Encoder base (masked LM) | no disponible | Hugging Face |

No se conocen alternativas específicas de clasificación de rechazos en la información disponible.

## Limitaciones y advertencias

- Solo inglés: la model card indica explícitamente que el modelo está entrenado para rechazos en inglés y que se esperan peores resultados en otros idiomas.
- Sensibilidad a la formulación: el rendimiento puede degradarse ante rechazos redactados de forma distinta a la de los datos de entrenamiento.
- Dataset no documentado: no se especifica el tamaño total, la procedencia ni la composición del dataset de entrenamiento, lo que dificulta evaluar la cobertura y los sesgos.
- Riesgo de sobreajuste al estilo: al ser un clasificador entrenado sobre un dataset concreto, puede no generalizar a estilos de rechazo de otros modelos o dominios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es necesario contactar con el autor antes de usarlo en producción.
- Sin benchmarks estándar: las métricas publicadas provienen de un único split de test de 445 filas, sin validación cruzada ni evaluación en datasets externos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Fecha de creación futura (2026-11-04) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-v2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Curvas de entrenamiento (Trackio Space): https://huggingface.co/spaces/VINAY-UMRETHE/Refusal-Classifier-v2-trackio

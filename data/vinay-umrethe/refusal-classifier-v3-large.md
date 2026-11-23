# VINAY-UMRETHE/Refusal-Classifier-V3-Large

## Resumen

Refusal-Classifier-V3-Large es un modelo de clasificación de texto desarrollado por Vinay Umrethe (usuario VINAY-UMRETHE en Hugging Face) que detecta y categoriza los rechazos (refusals) emitidos por modelos de lenguaje. Se trata de un fine-tuning de answerdotai/ModernBERT-large, una arquitectura transformer encoder-only con 395,8 millones de parámetros, adaptada a una tarea de clasificación de cinco clases: cumplimiento, rechazo total, rechazo parcial, limitación de capacidad y petición de aclaración.

El modelo resuelve un problema concreto en el ámbito de la evaluación y monitorización de sistemas LLM: determinar de forma automática si una respuesta de un asistente cumple la petición del usuario, la rechaza por políticas de seguridad, la rechaza solo en parte, no puede atenderla por limitaciones técnicas o solicita más información. Esta granularidad de cinco etiquetas va más allá de la detección binaria de rechazo, lo que resulta útil para auditar comportamientos de modelos, medir tasas de sobre-rechazo y construir pipelines de evaluación de seguridad.

Es relevante ahora porque la proliferación de asistentes conversacionales y agentes exige herramientas fiables para clasificar respuestas a escala. El modelo se publica con licencia Apache 2.0, admite secuencias de hasta 8192 tokens en el ejemplo de uso y reporta métricas muy altas en su conjunto de test (exactitud de 0,9956 y F1 macro de 0,9959). Está entrenado únicamente en inglés y su fecha de creación en el repositorio es de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (transformer encoder-only), fine-tuned para clasificación de secuencias |
| Parametros totales | 395.836.421 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 8192 tokens en el ejemplo de uso publicado |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | Text classification (5 etiquetas de refusal) |
| Modelo base | answerdotai/ModernBERT-large |
| Tamano del repositorio | 1.6 GB |
| Libreria | transformers |
| Etiquetas de salida | compliant, full_refusal, partial_refusal, capability_limitation, clarification |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT-large, un transformer encoder-only que emplea atención con rotaciones posicionales y mecanismos de atención lineal para procesar contextos largos de forma eficiente. Sobre esta base se ha realizado un fine-tuning supervisado para una tarea de clasificación de secuencias con cinco clases, tomando como entrada el par (prompt, respuesta) mediante el tokenizador con `text_pair`. La cabeza de clasificación produce logits que, tras aplicar softmax, dan la probabilidad de cada etiqueta.

El entrenamiento se realizó sobre el split `train` de un dataset de refusals en inglés, con selección de checkpoint sobre el split `validation` según el F1 macro. El checkpoint final se eligió en el paso 2300, con un F1 macro de validación de 0,9973, y se evaluó una única vez sobre el split `test` de 1124 filas. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales más allá del uso de la arquitectura ModernBERT como base.

## Capacidades

- Clasificación de respuestas de asistentes en cinco categorías: `compliant`, `full_refusal`, `partial_refusal`, `capability_limitation` y `clarification`.
- Detección de rechazos por políticas de seguridad, ética, moral o legal.
- Distinción entre rechazo parcial (rechaza la parte dañina y atiende la educativa) y rechazo total.
- Identificación de limitaciones técnicas (falta de herramientas, acceso a internet, conocimiento desactualizado) como categoría separada de los rechazos de seguridad.
- Detección de peticiones de aclaración en las que el asistente solicita más información al usuario.
- Procesamiento de pares prompt-respuesta con contexto de hasta 8192 tokens.
- Salida de probabilidades por clase mediante softmax, lo que permite umbrales de confianza personalizados.
- No soporta tool calling, function calling, generación de texto ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Auditoría de seguridad de LLM: clasificar a escala las respuestas de un modelo desplegado para medir su tasa de rechazos totales y parciales, y detectar sobre-rechazo en consultas legítimas.
- Evaluación de alineamiento: comparar el comportamiento de distintos modelos o versiones ante un mismo conjunto de prompts, agregando las cinco etiquetas como métricas de comportamiento.
- Monitorización en producción: integrar el clasificador como etapa de filtrado sobre las respuestas de un asistente para alertar cuando aparecen rechazos inesperados o limitaciones de capacidad no previstas.
- Construcción de datasets: etiquetar automáticamente grandes volúmenes de pares prompt-respuesta para crear corpus de entrenamiento o de evaluación de refusal, aprovechando la granularidad de cinco clases.
- Análisis de agentes y herramientas: detectar cuándo un agente responde con `capability_limitation` por falta de acceso a herramientas o por corte de conocimiento, lo que ayuda a diagnosticar fallos de integración.
- Investigación sobre comportamiento conversacional: estudiar la distribución de `clarification` frente a `compliant` para evaluar si un asistente pide demasiada información o responde de forma demasiado precipitada.
- Control de calidad en pipelines de anotación: usar el clasificador como pre-etiquetador y revisión humana posterior, reduciendo el coste de anotación manual de refusal.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test (1124 filas), con el checkpoint publicado:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9956 |
| Macro F1 | 0.9959 |
| Weighted F1 | 0.9956 |

| Etiqueta | Precision | Recall | F1 | Filas de test |
|---|---|---|---|---|
| compliant | 1.0000 | 1.0000 | 1.0000 | 184 |
| full_refusal | 0.9841 | 0.9960 | 0.9900 | 249 |
| partial_refusal | 0.9958 | 0.9835 | 0.9896 | 242 |
| capability_limitation | 1.0000 | 1.0000 | 1.0000 | 252 |
| clarification | 1.0000 | 1.0000 | 1.0000 | 197 |
| macro avg | 0.9960 | 0.9959 | 0.9959 | 1124 |
| weighted avg | 0.9956 | 0.9956 | 0.9956 | 1124 |

No se han publicado comparaciones con otros clasificadores de refusal en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,6 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 0,8 GB para pesos, con un consumo total típico de 1,5 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para alto throughput, A100 o H100 permiten lotes grandes y menor latencia.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (TEI), vLLM para clasificación, o exportación a ONNX. El tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al ser un encoder de 395 M de parámetros, se espera una latencia baja en GPU moderna para secuencias cortas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Refusal-Classifier-V3-Large | 395,8 M | 8192 tokens (ejemplo de uso) | Clasificación de refusal en 5 clases | Apache 2.0 | Hugging Face |
| ModernBERT-large (base) | 395,8 M | 8192 tokens | Encoder general, sin cabeza de clasificación de refusal | Apache 2.0 | Hugging Face |
| Clasificadores binarios de refusal (genéricos) | Variable | Variable | Detección binaria de rechazo | Variable | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; se espera un rendimiento notablemente inferior en otros idiomas.
- Sensible a la formulación: la model card advierte que los rechazos redactados de forma distinta a los del entrenamiento pueden clasificarse peor.
- Riesgo de sobreajuste al dataset de entrenamiento: las métricas de test son muy altas (F1 macro de 0,9959) y podrían no generalizar a dominios o estilos de respuesta diferentes.
- No es un modelo generativo: no puede producir texto, razonar ni invocar herramientas; su única salida es una etiqueta con probabilidades.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre sesgos del dataset subyacente.
- No se documentan sesgos específicos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su cobertura.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.
- La fecha de creación del repositorio (noviembre de 2026) es posterior a la fecha actual de muchos entornos, lo que conviene verificar antes de integrarlo en pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/Refusal-Classifier-V3-Large
- Modelo base ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large

# Tgratzi/bert-tma-tuned-v2.1.1

## Resumen

El modelo `bert-tma-tuned-v2.1.1` es un ajuste fino (fine-tuning) de `bert-base-uncased` desarrollado por el usuario Tgratzi. Está diseñado para tareas de clasificación de texto, como lo indica su pipeline de `text-classification`. Con 109,5 millones de parámetros, mantiene la arquitectura original de BERT base, un transformer encoder-only, y se distribuye bajo licencia Apache 2.0. El modelo se publicó en agosto de 2026 y, aunque no se especifica el dataset de entrenamiento ni la tarea concreta, las métricas de evaluación reportadas (accuracy 0,9618 y F1 macro 0,9204) sugieren un rendimiento sólido en la tarea objetivo.

La relevancia de este modelo radica en su tamaño compacto y su facilidad de despliegue, lo que lo hace adecuado para entornos con recursos limitados. Al estar basado en BERT, hereda su capacidad de comprensión contextual del lenguaje, aunque su ventana de contexto está limitada a 512 tokens (típica de BERT base). No se dispone de información sobre los idiomas soportados, pero al derivar de `bert-base-uncased` es razonable asumir que está optimizado para inglés, aunque no está confirmado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 109.505.310 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 en BERT base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-uncased`, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. El entrenamiento se realizó con el framework Transformers de Hugging Face, utilizando el optimizador AdamW con una tasa de aprendizaje de 1,5e-5, batch size de 32 para entrenamiento y 16 para evaluación, y un scheduler lineal con warmup ratio de 0,1. Se entrenó durante 8 épocas con precisión mixta (Native AMP). No se especifica el dataset de entrenamiento ni si se aplicaron técnicas como RLHF o DPO; la model card indica que el dataset es "unknown". Tampoco se detalla el número de tokens de entrenamiento ni la composición del corpus.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, como análisis de sentimiento, detección de spam o categorización de documentos.
- Comprensión contextual: al heredar la arquitectura BERT, captura relaciones contextuales bidireccionales en el texto.
- Eficiencia computacional: con 109M parámetros, es ligero y adecuado para inferencia en CPU o GPUs de gama media.
- Integración con Hugging Face: compatible con `transformers` y `text-embeddings-inference`, lo que facilita su uso en pipelines existentes.
- No se han documentado capacidades adicionales como tool calling, agentes o razonamiento multi-paso, ya que es un modelo de clasificación puro.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar comentarios o publicaciones como positivos, negativos o neutros, integrándose en sistemas de monitorización de marca.
- Moderación de contenido: detección automática de mensajes ofensivos o inapropiados en foros o plataformas de mensajería.
- Clasificación de tickets de soporte: categorización de solicitudes de atención al cliente por tipo (reembolso, problema técnico, consulta) para enrutarlas al equipo adecuado.
- Detección de spam en correos electrónicos: clasificación binaria para filtrar mensajes no deseados.
- Análisis de opiniones en reseñas de productos: extracción de valoraciones positivas o negativas para generar resúmenes automáticos.
- Clasificación de documentos legales o médicos: asignación de etiquetas a textos largos, aunque la ventana de 512 tokens limita su uso a fragmentos o resúmenes.

## Benchmarks y rendimiento

La model card no incluye resultados en el campo `model-index` (results: []), pero el autor reporta las siguientes métricas de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0,1678 |
| Accuracy | 0,9618 |
| F1 Macro | 0,9204 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 109M parámetros, en FP16 ocupa aproximadamente 220 MB de VRAM, y en FP32 unos 440 MB. Esto permite ejecutarlo en GPUs con 2 GB o más de memoria.
- GPU recomendadas: cualquier GPU consumer moderna, como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superiores. También puede ejecutarse en CPU con razonable latencia para clasificación de textos cortos.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `text-embeddings-inference`, y puede exportarse a ONNX o TensorFlow para entornos de producción.
- Latencia y throughput: no se proporcionan datos oficiales, pero para un modelo de este tamaño, la inferencia en GPU suele ser inferior a 10 ms por muestra, y en CPU puede rondar los 50-100 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| bert-tma-tuned-v2.1.1 | 109M | no disponible | Apache 2.0 | Fine-tune de BERT base, tarea desconocida |
| bert-base-uncased | 110M | 512 | Apache 2.0 | Modelo base original, sin fine-tuning |
| distilbert-base-uncased | 66M | 512 | Apache 2.0 | Versión destilada, más ligera pero con menor rendimiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se sabe qué datos se usaron, lo que impide evaluar posibles sesgos o la generalización a dominios específicos.
- Ventana de contexto limitada: hereda el límite de 512 tokens de BERT base, por lo que no es adecuado para documentos largos sin truncamiento.
- Idiomas no confirmados: aunque probablemente esté optimizado para inglés, no hay documentación oficial sobre cobertura multilingüe.
- Riesgo de alucinación en clasificación: aunque es un modelo discriminativo, puede producir etiquetas incorrectas si el texto de entrada está fuera de la distribución del entrenamiento.
- Sin garantías de producción: al ser un modelo publicado por un usuario individual, no hay respaldo de una organización ni evidencia de pruebas exhaustivas en entornos reales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para evitar problemas de derechos de autor.

## Enlaces

- [Hugging Face - Tgratzi/bert-tma-tuned-v2.1.1](https://huggingface.co/Tgratzi/bert-tma-tuned-v2.1.1)
- [Hugging Face - Tgratzi/bert-tma-tuned (versión anterior)](https://huggingface.co/Tgratzi/bert-tma-tuned)
- [Bytez - ficha del modelo](https://bytez.com/model/Tgratzi/bert-tma-tuned)

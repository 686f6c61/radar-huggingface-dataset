# tadiecool29/STL-ethiollm-l-250K-sentiment

## Resumen

STL-ethiollm-l-250K-sentiment es un modelo de análisis de sentimiento obtenido mediante fine-tuning del modelo base EthioNLP/EthioLLM-l-250K, desarrollado por el usuario tadiecool29. El modelo base pertenece a la familia EthioLLM, un conjunto de modelos multilingües diseñados para cinco lenguas etíopes (amárico, ge'ez, afan oromo, somalí y tigriña) y el inglés, presentado en el artículo "EthioLLM: Multilingual Large Language Models". Este fine-tuning se ha realizado sobre un conjunto de datos no especificado, con el objetivo de adaptar el modelo a la tarea de clasificación de sentimiento.

El modelo tiene 559.893.507 parámetros y se distribuye en formato safetensors. La información pública no detalla la arquitectura interna, la longitud de contexto ni los idiomas soportados específicamente para esta versión, aunque se infiere que hereda las capacidades multilingües del modelo base. Su relevancia radica en ofrecer una herramienta de análisis de sentimiento para lenguas etíopes, un área con escasos recursos, aunque su rendimiento (F1 de 0,6753) es moderado y el dataset de entrenamiento no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (hereda del modelo base, probablemente amárico, ge'ez, afan oromo, somalí, tigriña e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo. Se trata de un fine-tuning del modelo EthioNLP/EthioLLM-l-250K, que según el paper de EthioLLM es un modelo de lenguaje basado en transformer, aunque no se especifican sus dimensiones exactas (número de capas, heads, etc.) en la documentación disponible. El proceso de entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 16, batch size de evaluación de 32, optimizador AdamW (variante torch fused), scheduler de tipo coseno con 300 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado, por lo que se desconoce su composición, tamaño y procedencia. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de sentimiento: el modelo está entrenado para asignar una etiqueta de sentimiento (presumiblemente positiva, negativa o neutra) a un texto de entrada.
- Multilingüismo potencial: al derivar de EthioLLM-l-250K, es probable que pueda procesar textos en amárico, ge'ez, afan oromo, somalí, tigriña e inglés, aunque no se confirma explícitamente para este fine-tuning.
- No se documentan capacidades de generación de texto, tool calling, razonamiento multi-paso, visión u otras funcionalidades más allá de la clasificación de sentimiento.

## Casos de uso

- Monitoreo de opinión en redes sociales: el modelo puede clasificar comentarios o publicaciones en lenguas etíopes para medir la percepción pública sobre una marca, producto o evento. Su ventana de contexto no está especificada, pero para textos cortos es adecuado.
- Análisis de reseñas de productos: permite categorizar reseñas de comercio electrónico o plataformas de servicios en positivo, negativo o neutro, facilitando la gestión de reputación.
- Investigación académica en NLP para lenguas de bajos recursos: sirve como punto de partida para estudios sobre análisis de sentimiento en lenguas etíopes, aunque su rendimiento (F1 ~0,67) debe considerarse como base.
- Atención al cliente automatizada: integrado en un sistema de tickets, puede priorizar quejas o comentarios negativos para su revisión humana, aunque su precisión limitada requiere supervisión.
- Análisis de noticias y medios: clasifica artículos o titulares según su tono emocional, útil para estudios de medios o seguimiento de campañas.
- Filtrado de contenido en foros o plataformas: detecta mensajes con sentimiento negativo o abusivo, aunque la falta de datos sobre sesgos y el rendimiento moderado exigen validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible. El model-index de HuggingFace está vacío. El autor reporta los siguientes resultados de evaluación en el conjunto de validación durante el entrenamiento (época 7, la última mostrada):

| Metrica | Valor |
|---|---|
| Loss | 1,1001 |
| Precision (sentimiento) | 0,6750 |
| Recall (sentimiento) | 0,6760 |
| F1 | 0,6753 |
| Accuracy (sentimiento) | 0,6808 |

Estos valores indican un rendimiento moderado, con una precisión y recall equilibrados, pero sin alcanzar niveles altos de exactitud.

## Requisitos de hardware

- VRAM estimada: con 559,9 millones de parámetros, en FP32 (2,2 GB) se necesitan al menos 4 GB de VRAM para inferencia básica. Con cuantización a 8 bits (~0,6 GB) o 4 bits (~0,3 GB) podría ejecutarse en GPUs con 2-4 GB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: una GPU de consumo como NVIDIA RTX 3060 (12 GB) o superior es suficiente para FP32. Para cuantización, una GTX 1660 o similar podría bastar.
- Compatibilidad con GPUs de consumo: sí, dado su tamaño moderado, cabe en la mayoría de GPUs modernas de consumo.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, Hugging Face TGI, o mediante llama.cpp si se convierte a GGUF (no incluido). También es compatible con Ollama si se convierte.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la inferencia para textos cortos debería ser de decenas de milisegundos, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de análisis de sentimiento para lenguas etíopes. El único punto de referencia es el modelo base EthioLLM-l-250K, que no tiene métricas de sentimiento publicadas en la documentación consultada. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica qué datos se usaron para el fine-tuning, lo que impide evaluar posibles sesgos o la representatividad de los dominios cubiertos.
- Rendimiento moderado: con un F1 de 0,6753, el modelo puede cometer errores significativos en clasificación, especialmente en textos ambiguos o con matices culturales.
- Idiomas no confirmados: aunque el modelo base es multilingüe, no se garantiza que este fine-tuning funcione correctamente en todas las lenguas etíopes; se recomienda probar en cada idioma.
- Sin información sobre contexto: se desconoce la longitud máxima de secuencia soportada, lo que limita su uso en textos largos.
- Licencia MIT: permite uso comercial y modificación, pero al ser un fine-tuning de un modelo con licencia MIT (según el modelo base), no hay restricciones adicionales conocidas.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo, pero la asignación de etiquetas puede ser incorrecta.
- Falta de documentación: la model card es escasa y generada automáticamente, sin detalles sobre limitaciones específicas o sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-ethiollm-l-250K-sentiment
- Modelo base EthioLLM-l-250K: https://huggingface.co/EthioNLP/EthioLLM-l-250K
- Paper de EthioLLM (arXiv): https://arxiv.org/html/2403.13737v3

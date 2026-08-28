# Thiago-Reis-Porto/modernJabuticaBERT-Large-1k

## Resumen

modernJabuticaBERT-Large-1k es un modelo de tipo encoder transformer orientado a la extracción de características (feature extraction) y generación de embeddings de texto. Ha sido desarrollado por Thiago-Reis-Porto, en el contexto de la colección JabuticaBERT de AMADEUS AI, y forma parte de una línea de modelos de lenguaje entrenados desde cero para portugués brasileño. El nombre del modelo sugiere que emplea la arquitectura ModernBERT (etiqueta `modernbert` en Hugging Face) y que su longitud de contexto es de 1024 tokens (sufijo "1k"), aunque este dato no está confirmado en la documentación oficial.

El modelo cuenta con aproximadamente 394,8 millones de parámetros y un tamaño de repositorio de 1,6 GB en formato safetensors. Su pipeline declarado es `feature-extraction`, lo que indica que está pensado para ser utilizado como codificador de texto en tareas posteriores como clasificación, búsqueda semántica o recuperación de información. Según el paper asociado, los modelos JabuticaBERT se entrenan desde cero con el corpus Jabuticaba, una colección a gran escala de texto en portugués brasileño, utilizando el objetivo de Replaced Token Detection (RTD) y entrenamiento de contexto largo. Este modelo concreto no dispone de una model card detallada, por lo que gran parte de sus especificaciones técnicas deben inferirse de la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (según etiqueta `modernbert`), encoder transformer |
| Parametros totales | 394.781.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el sufijo "1k" sugiere 1024 tokens, sin confirmar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués brasileño (según paper, no confirmado en model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se corresponde con un encoder transformer basado en ModernBERT, una evolución de BERT que incorpora mejoras como atención eficiente, normalización pre-LayerNorm y soporte para secuencias largas. El modelo se entrena desde cero, no como fine-tuning de un modelo existente, utilizando el corpus Jabuticaba, una colección de texto brasileño diseñada para preentrenamiento de modelos de lenguaje. El objetivo de entrenamiento principal es Replaced Token Detection (RTD), similar al enfoque de ELECTRA, que consiste en predecir si un token ha sido reemplazado por un generador auxiliar. Además, se aplica entrenamiento de contexto largo, lo que permite al modelo manejar secuencias más extensas que los BERT clásicos. No se dispone de información sobre hiperparámetros concretos, régimen de entrenamiento o composición exacta del dataset.

## Capacidades

- Extracción de características y generación de embeddings de texto para representaciones densas de frases o documentos.
- Adecuado para tareas de clasificación de texto, análisis de sentimiento, reconocimiento de entidades nombradas (NER) y otras tareas de comprensión del lenguaje natural en portugués.
- Soporte de secuencias de contexto largo (probablemente 1024 tokens, según el nombre), lo que permite procesar documentos más extensos que los modelos BERT tradicionales.
- No se mencionan capacidades de generación de texto, tool calling, agentes o razonamiento multi-paso, ya que es un modelo encoder puro.
- Multilingüismo limitado: está especializado en portugués brasileño, sin evidencia de soporte para otros idiomas.

## Casos de uso

- Clasificación de textos en portugués: el modelo puede utilizarse como base para clasificar comentarios, reseñas o documentos en categorías predefinidas, aprovechando sus embeddings de alta calidad. Se integraría con una capa de clasificación lineal o MLP sobre la representación de la secuencia.
- Análisis de sentimiento en redes sociales: al estar entrenado con corpus brasileño, es adecuado para detectar opiniones positivas, negativas o neutras en publicaciones de Twitter, Facebook o comentarios de productos, con un ajuste fino sobre un pequeño conjunto etiquetado.
- Búsqueda semántica y recuperación de información: los embeddings generados pueden indexarse en bases vectoriales (por ejemplo, FAISS o Milvus) para implementar motores de búsqueda por similitud en dominios como jurisprudencia, artículos académicos o documentación técnica en portugués.
- Reconocimiento de entidades nombradas (NER): el modelo puede fine-tunearse para extraer personas, organizaciones, lugares y fechas en textos legales o periodísticos brasileños, gracias a su capacidad de representar contexto bidireccional.
- Clasificación de documentos legales o administrativos: su contexto largo (si se confirma 1024 tokens) permite procesar párrafos extensos de contratos o sentencias, facilitando la categorización automática en despachos de abogados o administraciones públicas.
- Sistemas de recomendación basados en contenido: los embeddings de artículos, noticias o productos pueden compararse para sugerir elementos similares a los usuarios, mejorando la experiencia en portales de contenido brasileños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (JabuticaBERT: Modern Portuguese Encoders from Scratch with RTD and Long-Context Training) podría contener evaluaciones, pero no se han proporcionado datos concretos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 394,8 millones de parámetros, en precisión fp32 el modelo ocupa aproximadamente 1,6 GB (coincide con el tamaño del repo). En fp16 o bf16, el uso de memoria se reduce a unos 800 MB, más overhead de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16. Una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3080, RTX 4070, A10, etc.).
- Es compatible con GPUs de consumo, siempre que se utilice una cuantización o precisión reducida.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con la librería `transformers` de Hugging Face, con Text Embeddings Inference (TEI) para endpoints de embeddings, o con frameworks como ONNX Runtime para optimización en CPU.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de este tamaño, la inferencia en GPU suele ser del orden de milisegundos por secuencia, dependiendo de la longitud y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| modernJabuticaBERT-Large-1k | 394,8 M | 1024 (inferido) | ModernBERT | no disponible | Hugging Face |
| BERTimbau Large | 335 M | 512 | BERT | MIT | Hugging Face |
| Albertina (DeBERTa) | 127 M / 355 M | 512 | DeBERTa | MIT | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estos modelos. BERTimbau es un referente clásico para portugués, mientras que Albertina ofrece variantes más eficientes. modernJabuticaBERT destaca por su mayor contexto y arquitectura moderna, pero su licencia y rendimiento relativo no están documentados.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos o riesgos sociotécnicos. Al estar entrenado con un corpus brasileño, puede reflejar sesgos presentes en los textos de origen.
- Al ser un modelo encoder, no genera texto, por lo que el riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir representaciones sesgadas o incorrectas en tareas downstream.
- La longitud de contexto no está confirmada oficialmente; si es 1024 tokens, documentos más largos deberán truncarse o dividirse.
- La licencia no está especificada, lo que supone un riesgo para uso comercial o redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre el régimen de entrenamiento (precisión, duración, hardware), lo que dificulta evaluar su reproducibilidad.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thiago-Reis-Porto/modernJabuticaBERT-Large-1k
- Colección JabuticaBERT de AMADEUS AI: https://huggingface.co/collections/amadeusai/jabuticabert
- Paper en ACL Anthology: https://aclanthology.org/2026.propor-1.93/
- PDF del paper: https://aclanthology.org/2026.propor-1.93.pdf

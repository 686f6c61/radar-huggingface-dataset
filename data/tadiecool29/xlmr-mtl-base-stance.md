# tadiecool29/xlmr-MTL-base-stance

## Resumen

xlmr-MTL-base-stance es un modelo de clasificación multilingüe desarrollado por tadiecool29, un estudiante de Data Science and Analytics. Se trata de un fine-tuning de FacebookAI/xlm-roberta-base, un transformer multilingüe de 278 millones de parámetros entrenado por Meta AI sobre 2 TB de datos filtrados de CommonCrawl en 100 idiomas. El modelo está especializado en dos tareas simultáneas: detección de postura (stance detection) y análisis de sentimiento, mediante un enfoque de aprendizaje multitarea (MTL).

La relevancia de este modelo radica en su capacidad para abordar dos tareas complementarias de análisis de opinión en un solo paso de inferencia, lo que reduce costes computacionales y simplifica el pipeline en aplicaciones de monitorización de redes sociales, análisis de debates y estudios de opinión pública. Al estar basado en XLM-RoBERTa, hereda su robustez multilingüe, lo que permite analizar textos en decenas de idiomas sin necesidad de modelos separados por lengua.

El modelo se publica con licencia MIT, lo que facilita su uso comercial y académico sin restricciones significativas. Los pesos están disponibles en formato safetensors, compatible con el ecosistema de Hugging Face Transformers. La model card es escasa en detalles sobre el dataset de entrenamiento, pero reporta métricas de evaluación en F1 y precisión para ambas tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | 278.049.031 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de XLM-RoBERTa-base) |
| Tipos de cuantizacion | no disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | 100 idiomas (multilingue, segun XLM-RoBERTa-base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder con atención totalmente densa, entrenado originalmente con masked language modeling (MLM) sobre 2 TB de datos multilingües. La variante base tiene 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con un vocabulario de 250.000 tokens (SentencePiece). El fine-tuning añade una cabeza de clasificación multitarea que produce dos salidas simultáneas: una para postura (stance) y otra para sentimiento.

El entrenamiento se realizó con el Trainer de Hugging Face durante 6 épocas, con una tasa de aprendizaje de 1e-05, scheduler cosine con 300 pasos de warmup, batch size de 16 para entrenamiento y 32 para evaluación, y precisión mixta (Native AMP). El optimizador fue AdamW con betas (0.9, 0.999). El dataset de entrenamiento no está documentado en la model card (se indica "None dataset"), lo que limita la reproducibilidad. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning.

## Capacidades

- Clasificación de postura (stance detection): identifica si un texto expresa una posición a favor, en contra o neutral respecto a un objetivo o tema concreto.
- Análisis de sentimiento: clasifica la polaridad emocional del texto (positivo, negativo o neutral).
- Aprendizaje multitarea: ambas tareas se resuelven en una única pasada de inferencia, compartiendo representaciones internas.
- Multilingüismo: al heredar el encoder de XLM-RoBERTa, puede procesar textos en 100 idiomas, incluyendo lenguas de bajos recursos.
- Clasificación de secuencias: adecuado para textos completos (tuits, reseñas, comentarios, párrafos) de hasta 512 tokens.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo encoder-only.

## Casos de uso

- Monitorización de redes sociales: analizar tuits, publicaciones de Facebook o comentarios de Reddit para detectar la postura de los usuarios sobre un tema (política, producto, evento) y su sentimiento asociado, permitiendo medir la opinión pública en tiempo real.
- Gestión de reputación de marca: procesar menciones de una empresa en múltiples idiomas para clasificar si los clientes expresan apoyo, crítica o neutralidad, y si el tono es positivo, negativo o mixto, facilitando la priorización de respuestas de atención al cliente.
- Análisis de debates y foros: clasificar intervenciones en hilos de discusión (por ejemplo, en plataformas como Reddit o foros especializados) para identificar argumentos a favor y en contra de una propuesta, junto con la carga emocional de cada intervención.
- Investigación en ciencias sociales: analizar corpus de encuestas abiertas, entrevistas o textos de prensa para estudiar la opinión pública sobre políticas gubernamentales, con la ventaja de trabajar en múltiples idiomas sin entrenar modelos separados.
- Detección de desinformación: combinar la postura con el sentimiento para identificar contenidos que expresan una postura extrema (muy a favor o muy en contra) con alta carga emocional, un patrón frecuente en noticias falsas o campañas de manipulación.
- Análisis de reseñas de productos: clasificar reseñas de comercio electrónico en distintos idiomas para extraer tanto la postura (recomendación o rechazo) como el sentimiento (satisfacción o insatisfacción), permitiendo a fabricantes y distribuidores identificar problemas recurrentes.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación, sin especificar el dataset:

| Metrica | Valor |
|---|---|
| Loss | 1.3431 |
| Stance F1 | 0.7692 |
| Sentiment F1 | 0.7227 |
| F1 (media) | 0.7459 |
| Stance Accuracy | 0.7643 |
| Sentiment Accuracy | 0.7294 |

Evolución del entrenamiento (selección de épocas):

| Epoca | Stance F1 | Sentiment F1 | F1 media | Stance Acc | Sentiment Acc |
|---|---|---|---|---|---|
| 1 | 0.5958 | 0.6085 | 0.6021 | 0.5998 | 0.6272 |
| 3 | 0.7371 | 0.6968 | 0.7169 | 0.7332 | 0.7057 |
| 6 | 0.7692 | 0.7227 | 0.7459 | 0.7643 | 0.7294 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (278M parámetros × 4 bytes). En FP16 se reduce a unos 0,6 GB, más la memoria para activaciones y el tokenizador.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Tarjetas como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores funcionan sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU consumer moderna, incluso en las de gama de entrada.
- Opciones de despliegue: Hugging Face Transformers (Python), ONNX Runtime, TensorFlow Serving, TorchServe. No se han publicado conversiones a GGUF ni integraciones con llama.cpp u Ollama.
- Latencia estimada: en una GPU RTX 3060, la inferencia para un texto de 128 tokens debería completarse en menos de 10 ms. En CPU (8 núcleos), la latencia puede ser de 50-150 ms por texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xlmr-MTL-base-stance | 278M | 512 | Stance + sentimiento | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278M | 512 | MLM (base) | MIT | Hugging Face |
| MiuN2k3/mtl-xlmr-base-viwiki | 278M | 512 | Multitarea (desconocido) | no disponible | Hugging Face |
| bert-base-multilingual-cased | 178M | 512 | MLM (base) | Apache 2.0 | Hugging Face |

El modelo se distingue de su base (xlm-roberta-base) por estar especializado en dos tareas concretas, lo que mejora el rendimiento en esas tareas a costa de perder la capacidad de MLM. Frente a bert-base-multilingual-cased, ofrece un 56% más de parámetros y mejor cobertura de idiomas de bajos recursos, pero requiere más VRAM.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, lo que impide evaluar posibles sesgos o la representatividad de los datos.
- No se especifican los idiomas concretos en los que el modelo fue evaluado, aunque hereda la cobertura de XLM-RoBERTa.
- El rendimiento en tareas de stance detection depende en gran medida de la definición de "objetivo" (target), que no está documentada. El modelo puede no generalizar bien a dominios muy distintos del dataset de entrenamiento.
- Riesgo de alucinación: al ser un modelo encoder-only, no genera texto, por lo que el riesgo de alucinación es nulo. Sin embargo, puede producir clasificaciones erróneas en textos ambiguos o con ironía.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.
- El tamaño del repositorio (1,1 GB) es elevado para un modelo de 278M parámetros, lo que sugiere que los pesos están en FP32. Para despliegues en producción, se recomienda convertir a FP16 o cuantizar a INT8 para reducir latencia y uso de memoria.
- No se han publicado resultados de benchmarks externos (MMLU, GLUE, etc.), por lo que no es posible comparar su rendimiento general con otros modelos de la misma familia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/xlmr-MTL-base-stance
- Modelo base (XLM-RoBERTa-base): https://huggingface.co/FacebookAI/xlm-roberta-base
- Perfil de GitHub del autor: https://github.com/tadiecool29/tadiecool29/blob/main/README.md
- Modelo similar (mtl-xlmr-base-viwiki): https://huggingface.co/MiuN2k3/mtl-xlmr-base-viwiki

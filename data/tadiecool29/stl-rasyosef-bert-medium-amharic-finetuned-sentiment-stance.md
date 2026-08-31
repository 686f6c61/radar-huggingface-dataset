# tadiecool29/STL-rasyosef-bert-medium-amharic-finetuned-sentiment-stance

## Resumen
El modelo STL-rasyosef-bert-medium-amharic-finetuned-sentiment-stance es un ajuste fino (fine-tuning) del modelo rasyosef/bert-medium-amharic-finetuned-sentiment, orientado a la clasificación de postura (stance) en textos en amárico. Desarrollado por el usuario tadiecool29, este modelo hereda la arquitectura BERT-medium preentrenada desde cero sobre 290 millones de tokens de texto amárico, con un contexto de 512 tokens y un vocabulario de 28 672 subpalabras. Con aproximadamente 40 millones de parámetros, es un modelo compacto diseñado para tareas específicas de análisis de opinión y detección de posturas, aunque su dataset de entrenamiento no ha sido documentado. Su relevancia radica en cubrir un idioma con pocos recursos computacionales, ofreciendo una alternativa ligera para tareas de clasificación en amárico.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | BERT-medium (encoder transformer) |
| Parametros totales | 40 428 036 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura BERT-medium, un encoder transformer con 8 capas, 512 dimensiones ocultas y 8 cabezas de atención, preentrenado en amárico por rasyosef. Sobre este modelo base ya ajustado para clasificación de sentimiento, se realiza un nuevo fine-tuning para la tarea de detección de postura, utilizando un dataset no especificado. El entrenamiento se llevó a cabo con una tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje coseno con 300 pasos de calentamiento, y 10 épocas completas. Se empleó precisión mixta nativa (AMP). No se han documentado innovaciones técnicas adicionales ni detalles sobre la composición del dataset de entrenamiento.

## Capacidades
- Clasificación de postura (stance) en textos amáricos, con etiquetas de postura (por ejemplo, a favor, en contra, neutral, aunque no se especifican las clases exactas).
- Al ser un derivado de un modelo de análisis de sentimiento, conserva cierta capacidad para tareas de clasificación de sentimiento, aunque no es su objetivo principal.
- Procesamiento de texto en amárico, incluyendo tokenización adaptada al idioma.
- Inferencia rápida y ligera gracias a su tamaño reducido (40M parámetros).
- No admite generación de texto, tool calling, ni capacidades multimodales; es exclusivamente un clasificador de secuencias.

## Casos de uso
- Análisis de opiniones en redes sociales en amárico: el modelo puede clasificar la postura de usuarios ante temas concretos (política, productos, eventos) a partir de tweets o comentarios, gracias a su entrenamiento en stance detection.
- Monitoreo de debates públicos: permite identificar automáticamente si un texto apoya o rechaza una propuesta, útil para medios y organizaciones que siguen discusiones en foros amáricos.
- Investigación en lingüística computacional: sirve como herramienta para estudiar la expresión de posturas en textos amáricos, con un modelo ligero que puede ejecutarse en entornos con recursos limitados.
- Sistemas de atención al cliente: aunque no es su uso principal, puede adaptarse para clasificar la actitud de los clientes en encuestas o reseñas, complementando análisis de sentimiento.
- Filtrado de contenido en plataformas: puede integrarse en pipelines para detectar mensajes con posturas extremas o polarizadas en comunidades amáricas, ayudando a moderar contenido.
- Prototipos y educación: al ser un modelo pequeño y de código abierto (sin licencia especificada), es adecuado para experimentos académicos y demostraciones de clasificación de texto en idiomas de bajos recursos.

## Benchmarks y rendimiento
Según la model card, el modelo alcanza los siguientes resultados en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 0.7572 |
| Precision (stance) | 0.7384 |
| Recall (stance) | 0.7441 |
| F1 | 0.7401 |
| Accuracy (stance) | 0.7319 |

La tabla de entrenamiento muestra una mejora progresiva desde la época 1 hasta la época 10, con F1 estable alrededor de 0.74. No se han publicado comparaciones con otros modelos en la información disponible, ni se proporcionan resultados en benchmarks estándar como MMLU o GLUE.

## Requisitos de hardware
- VRAM estimada: menos de 1 GB para inferencia en FP32, y aún menos en cuantización (aunque no se ofrecen versiones cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU.
- Es compatible con hardware de consumo; puede ejecutarse en una Raspberry Pi 4 con suficiente memoria RAM.
- Opciones de despliegue: la librería transformers de Hugging Face, ONNX Runtime, y potencialmente llama.cpp si se convierte a GGUF, aunque no hay versiones oficiales.
- Latencia y throughput: al ser un modelo de 40M parámetros, la inferencia es muy rápida; en CPU se pueden procesar cientos de secuencias por segundo, y en GPU miles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la misma categoría (clasificación de stance en amárico). El modelo base rasyosef/bert-medium-amharic-finetuned-sentiment es su predecesor inmediato, pero no se han publicado métricas comparativas entre ambos. Otras alternativas podrían ser modelos multilingües como XLM-R o mBERT, pero no se han evaluado en esta tarea específica. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias
- El dataset de entrenamiento no está documentado, lo que impide conocer su composición, tamaño y posibles sesgos.
- El modelo solo soporta amárico; no es utilizable en otros idiomas.
- La longitud de contexto está limitada a 512 tokens, por lo que textos más largos deben truncarse o dividirse.
- No se especifica la licencia, lo que genera incertidumbre sobre su uso comercial o distribución.
- Al ser un modelo pequeño, su precisión puede ser inferior a modelos más grandes, especialmente en dominios especializados.
- Riesgo de alucinación o clasificaciones erróneas en textos ambiguos o fuera del dominio de entrenamiento.
- No se han realizado evaluaciones de sesgos de género, raza o religión, por lo que podría reflejar sesgos presentes en los datos de preentrenamiento.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-rasyosef-bert-medium-amharic-finetuned-sentiment-stance
- Modelo base (sentimiento): https://huggingface.co/rasyosef/bert-medium-amharic-finetuned-sentiment
- Modelo base preentrenado: https://huggingface.co/rasyosef/bert-medium-amharic
- Repositorio GitHub de los modelos BERT en amárico: https://github.com/rasyosef/bert-amharic
- Repositorio GitHub de clasificación de sentimiento en amárico: https://github.com/rasyosef/amharic-sentiment-classification
- Página de proyectos del autor: https://rasyosef.github.io/projects.html

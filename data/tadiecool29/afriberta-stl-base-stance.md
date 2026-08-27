# tadiecool29/afriberta-stl-base-stance

## Resumen

`afriberta-stl-base-stance` es un modelo de clasificación de postura (stance detection) obtenido mediante fine-tuning de `castorini/afriberta_base`, un transformer encoder multilingüe de 111 millones de parámetros desarrollado por el grupo Castorini para lenguas africanas de bajos recursos. El modelo ha sido entrenado por el usuario `tadiecool29` sobre un conjunto de datos no especificado, con el objetivo de clasificar la postura o el sentimiento de un texto respecto a un tema o entidad.

Aunque la ficha del modelo no detalla el dataset ni la tarea exacta, las métricas reportadas (precisión, recall, F1 y exactitud de sentimiento) indican que se trata de una tarea de clasificación de texto a nivel de secuencia, probablemente binaria o multiclase. Al estar basado en AfriBERTa, hereda su arquitectura de 8 capas, 6 cabezas de atención, 768 unidades ocultas y una ventana de contexto limitada (típicamente 512 tokens). El modelo se distribuye en formato `safetensors` y es compatible con la librería `transformers`.

Su relevancia radica en ofrecer una opción ligera y de bajo coste computacional para análisis de opinión y detección de postura en lenguas africanas, un ámbito donde los recursos supervisados son escasos. Sin embargo, la ausencia de información sobre la licencia, el dataset de entrenamiento y los resultados de benchmarks públicos limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) |
| Parametros totales | 111.458.308 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 tokens en AfriBERTa base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base AfriBERTa soporta lenguas africanas de bajos recursos) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `castorini/afriberta_base`, un transformer encoder de 8 capas, 6 cabezas de atención, 768 unidades ocultas y 3072 unidades en la capa feed-forward. AfriBERTa fue preentrenado con un corpus multilingüe de lenguas africanas de bajos recursos, usando un vocabulario compartido y una estrategia de entrenamiento con datos limitados. El fine-tuning se realizó con la librería `transformers` (versión 5.15.0) y PyTorch 2.11.0, empleando un optimizador AdamW con learning rate de 1e-5, batch size de 16 para entrenamiento y 32 para evaluación, programación de tasa de aprendizaje coseno con 300 pasos de warmup y 6 épocas. Se usó precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card, por lo que se desconoce su composición, tamaño o método de anotación. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación de postura o sentimiento en textos cortos (oraciones o párrafos).
- Análisis de opinión sobre temas, entidades o productos.
- Probablemente soporta múltiples clases (a favor, en contra, neutral) aunque no se confirma.
- Al ser un modelo pequeño (111M), es adecuado para inferencia en entornos con recursos limitados.
- No se reportan capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Monitorización de redes sociales: clasificar automáticamente la postura de tweets o publicaciones sobre un tema concreto (política, salud, medio ambiente) para medir la opinión pública.
- Análisis de reseñas de productos: determinar si una reseña expresa una postura positiva, negativa o neutral hacia un producto o servicio.
- Detección de desinformación: identificar textos que toman una postura contraria a hechos verificados en campañas de verificación.
- Investigación académica en lingüística computacional: estudiar la distribución de posturas en corpus de lenguas africanas de bajos recursos.
- Sistemas de alerta temprana: detectar cambios de opinión en comunidades online sobre temas sensibles.
- Clasificación de comentarios en foros o artículos de noticias para moderación o análisis de engagement.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, etc.) en la información disponible. El model-index de HuggingFace está vacío. Sin embargo, la model card reporta métricas de evaluación del propio autor sobre el conjunto de validación:

| Metrica | Valor |
|---|---|
| Loss | 0.7544 |
| Sentiment Precision | 0.7669 |
| Sentiment Recall | 0.7678 |
| F1 | 0.7651 |
| Sentiment Acc | 0.7584 |

Estos valores corresponden al mejor resultado tras 6 épocas (según la tabla de entrenamiento, la época 5 alcanzó F1 de 0.7725, pero la evaluación final reporta 0.7651). No se especifica el tamaño ni la composición del conjunto de validación.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 111M parámetros, la inferencia en FP32 requiere aproximadamente 0.45 GB de memoria, y en FP16 unos 0.23 GB. Con batch pequeño, cabe en GPUs con 2 GB de VRAM o menos.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, RTX 2060, o incluso CPU).
- Es desplegable en CPU con razonable latencia (del orden de milisegundos por secuencia corta).
- Opciones de despliegue: librería `transformers` con PyTorch, o mediante servidores de inferencia como Hugging Face Inference Endpoints, vLLM (aunque está optimizado para modelos generativos, puede servir encoders), o simplemente con `pipeline` de transformers.
- Latencia y throughput: no se dispone de datos medidos, pero para un modelo de este tamaño se espera un throughput alto (cientos de secuencias por segundo en GPU).

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de stance detection. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `castorini/afriberta_base` | 111M | 512 (típico) | MIT (según repo) | Modelo preentrenado multilingüe para lenguas africanas |
| `tadiecool29/afriberta-stl-base-stance` | 111M | no disponible | no disponible | Fine-tune para stance/sentimiento |

No se han encontrado otros modelos de la misma categoría con datos públicos comparables.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, por lo que se desconocen posibles sesgos de dominio, idioma o tema.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- Las métricas reportadas provienen de una única evaluación del autor y no han sido validadas externamente.
- El modelo está pensado para textos cortos; su rendimiento en documentos largos puede degradarse debido a la ventana de contexto limitada.
- No se ha evaluado su comportamiento en lenguas fuera del ámbito africano, aunque el modelo base fue entrenado principalmente con lenguas africanas de bajos recursos.
- Existe riesgo de alucinación o clasificaciones erróneas en textos ambiguos o con sarcasmo, como es común en tareas de sentimiento.
- No se garantiza la reproducibilidad completa al no publicarse el dataset ni los scripts de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/afriberta-stl-base-stance
- Modelo base AfriBERTa: https://huggingface.co/castorini/afriberta_base
- Repositorio de AfriBERTa (GitHub): https://github.com/castorini/afriberta

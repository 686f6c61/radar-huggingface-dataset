# tadiecool29/MTL-afriberta-large-stance-sentiment

## Resumen

El modelo `MTL-afriberta-large-stance-sentiment` es un ajuste fino (fine-tuning) de `castorini/afriberta_large`, un modelo multilingüe de tipo BERT preentrenado para lenguas africanas de bajos recursos. Desarrollado por el usuario `tadiecool29`, este modelo está especializado en dos tareas de clasificación de texto: detección de postura (stance) y análisis de sentimiento (sentiment), combinadas en un enfoque de aprendizaje multitarea (MTL). Con aproximadamente 125,6 millones de parámetros, el modelo hereda la arquitectura encoder-only de AfriBERTa y está diseñado para procesar textos en once lenguas africanas, entre ellas suajili, hausa, igbo, somalí y amárico.

La relevancia de este modelo radica en su aplicación a lenguas con escasos recursos digitales, donde los modelos multilingües generalistas suelen tener un rendimiento limitado. Al partir de AfriBERTa, que fue entrenado específicamente con corpus africanos, y ajustarlo para tareas de stance y sentiment, se ofrece una herramienta útil para análisis de opinión, moderación de contenido y monitoreo social en contextos africanos. La licencia MIT permite su uso comercial sin restricciones, aunque la documentación disponible es escasa y no se especifica el conjunto de datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT-like) |
| Parametros totales | 125.636.359 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 11 lenguas africanas (segun documentacion de AfriBERTa: Afaan Oromoo, amarico, gahuza, hausa, igbo, pidgin nigeriano, somali, suajili, tigrinya, entre otras) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `castorini/afriberta_large` es un transformer encoder-only con arquitectura similar a BERT, preentrenado con un corpus multilingüe de 11 lenguas africanas. El ajuste fino se realizó con una cabeza de clasificación multitarea que produce dos salidas simultáneas: una para postura (stance) y otra para sentimiento (sentiment). Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0.9, 0.999), programador de tasa de aprendizaje coseno con 300 pasos de calentamiento y 6 épocas. Se utilizó precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está especificado en la model card (aparece como "None dataset"), lo que limita la reproducibilidad del proceso.

No se documentan innovaciones técnicas adicionales más allá del enfoque multitarea. El modelo se entrenó con el framework Transformers 5.15.0 y PyTorch 2.11.0, y los resultados de evaluación muestran una pérdida final de 1.4959, con F1 de postura de 0.7543 y F1 de sentimiento de 0.6939.

## Capacidades

- Clasificación de postura (stance) en textos, identificando posiciones a favor, en contra o neutrales sobre un tema.
- Análisis de sentimiento (sentiment) para determinar la polaridad emocional (positivo, negativo, neutro).
- Procesamiento multilingüe de lenguas africanas de bajos recursos, gracias al preentrenamiento de AfriBERTa.
- Salida dual simultánea: el modelo puede predecir stance y sentiment en una sola pasada, lo que lo hace eficiente para tareas combinadas.
- No soporta generación de texto libre, tool calling, agentes, visión ni audio, al ser un modelo encoder-only de clasificación.

## Casos de uso

- Monitoreo de opinión pública en redes sociales: el modelo puede analizar publicaciones en suajili, hausa o igbo para detectar sentimiento y postura sobre temas políticos o sociales, permitiendo a organizaciones y medios medir la reacción de la audiencia en tiempo real.
- Moderación de contenido en plataformas multilingües: al clasificar comentarios como positivos/negativos y detectar posturas extremas, puede ayudar a filtrar discursos de odio o contenido polarizante en foros y redes sociales africanas.
- Análisis de debates y discursos políticos: permite a periodistas e investigadores evaluar la postura de oradores en parlamentos o debates televisados, extrayendo automáticamente la posición sobre temas específicos.
- Investigación académica en NLP de bajos recursos: sirve como punto de partida para estudios sobre análisis de sentimiento en lenguas africanas, donde hay pocos recursos etiquetados.
- Atención al cliente en empresas locales: puede clasificar quejas o comentarios de clientes en lenguas africanas, identificando si el tono es negativo y si la postura es de insatisfacción, para priorizar respuestas.
- Análisis de noticias y artículos de opinión: permite a agencias de noticias clasificar automáticamente la postura editorial de artículos sobre temas controvertidos, facilitando la comparación entre medios.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor, sin comparación con otros modelos):

| Metrica | Valor |
|---|---|
| Loss | 1.4959 |
| Stance F1 | 0.7543 |
| Sentiment F1 | 0.6939 |
| F1 (promedio) | 0.7241 |
| Stance Acc | 0.7469 |
| Sentiment Acc | 0.6970 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 125,6 millones de parámetros y pesos en FP32, el modelo ocupa aproximadamente 0,5 GB. En FP16, la VRAM necesaria es de unos 0,25 GB, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo de clasificación, se puede servir con la librería Transformers de Hugging Face, o mediante herramientas como vLLM (aunque no es óptimo para encoder-only), o simplemente con un script de Python usando PyTorch. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: al ser un modelo pequeño, la latencia es baja (del orden de milisegundos por muestra en GPU). No se dispone de datos de throughput específicos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso |
|---|---|---|---|---|---|
| MTL-afriberta-large-stance-sentiment | 125,6 M | no disponible | 11 lenguas africanas | MIT | Clasificacion stance/sentiment |
| AfriBERTa large (base) | 125,6 M | no disponible | 11 lenguas africanas | MIT | Preentrenamiento general |
| mBERT (multilingual BERT) | 178 M | 512 tokens | 104 idiomas | Apache-2.0 | Clasificacion general multilingue |
| XLM-R base | 278 M | 512 tokens | 100 idiomas | MIT | Clasificacion multilingue |

No se dispone de datos de rendimiento comparativo en las mismas tareas para estos modelos. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado, lo que impide evaluar posibles sesgos o la representatividad de las lenguas y dominios cubiertos.
- La longitud de contexto no se especifica; se asume que hereda el límite de AfriBERTa (probablemente 512 tokens), pero no está confirmado.
- Al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación no aplica directamente, pero sí puede producir clasificaciones erróneas en textos ambiguos o fuera del dominio de entrenamiento.
- Los idiomas soportados son los de AfriBERTa, pero no se indica si el ajuste fino cubre todas las lenguas por igual; es posible que algunas tengan mejor rendimiento que otras.
- La licencia MIT permite uso comercial sin restricciones, pero al no haber documentación sobre el dataset, el usuario debe validar el modelo en su propio dominio antes de producción.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que sugiere que no ha sido ampliamente probado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-afriberta-large-stance-sentiment
- Modelo base AfriBERTa large: https://huggingface.co/castorini/afriberta_large
- Repositorio de AfriBERTa en GitHub: https://github.com/castorini/afriberta
- Pagina de AfriBERTa large en PromptLayer: https://www.promptlayer.com/models/afribertalarge/

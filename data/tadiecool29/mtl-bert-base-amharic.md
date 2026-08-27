# tadiecool29/MTL-bert-base-amharic

## Resumen

MTL-bert-base-amharic es un modelo de clasificación de texto basado en BERT, desarrollado por el usuario tadiecool29 como un ajuste fino (fine-tuning) del modelo `Davlan/bert-base-multilingual-cased-finetuned-amharic`. Este último es una adaptación del BERT multilingüe de Google al idioma amárico, con un vocabulario específico para esta lengua. El modelo resultante está orientado a tareas de análisis de sentimiento y detección de postura (stance) en textos en amárico, un idioma de bajos recursos con escasez de modelos de procesamiento de lenguaje natural especializados.

Con 177,86 millones de parámetros, sigue la arquitectura BERT base (encoder transformer) y se entrenó durante 6 épocas con un conjunto de datos no especificado. Los resultados de evaluación reportados por el autor muestran una F1 global de 0,6902, con una F1 de 0,7235 para detección de postura y 0,6570 para sentimiento. Aunque la información pública es limitada, el modelo representa un intento de mejorar el rendimiento en tareas de clasificación para el amárico, un área donde los modelos multilingües suelen tener un desempeño deficiente.

La relevancia de este modelo radica en su potencial para aplicaciones de análisis de opiniones, monitoreo de redes sociales y estudios sociolingüísticos en contextos donde se habla amárico, principalmente en Etiopía. Sin embargo, al carecer de documentación detallada sobre el conjunto de datos de entrenamiento y las licencias, su uso en producción requiere una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) |
| Parametros totales | 177.858.823 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | amárico (por el nombre y el modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), un transformer encoder de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, tal como corresponde a la variante "base". El punto de partida es `Davlan/bert-base-multilingual-cased-finetuned-amharic`, que a su vez es una adaptación del BERT multilingüe de Google con un vocabulario amárico específico, entrenado sobre textos en amárico para mejorar el rendimiento en tareas como el reconocimiento de entidades nombradas.

El ajuste fino se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 1e-5, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0.9, 0.999) y épsilon 1e-8, programador de tasa de aprendizaje coseno con 300 pasos de calentamiento, y 6 épocas completas. Se utilizó entrenamiento con precisión mixta (Native AMP). El conjunto de datos de entrenamiento no está especificado en la model card, indicado como "None". Las métricas de evaluación incluyen pérdida, F1 y precisión para las tareas de postura y sentimiento, lo que sugiere que el modelo fue entrenado para clasificación multi-etiqueta o multitarea, aunque no se detalla la arquitectura de salida.

## Capacidades

- Clasificación de texto en amárico: el modelo está diseñado para tareas de análisis de sentimiento (positivo, negativo, neutro) y detección de postura (a favor, en contra, neutral) en textos escritos en amárico.
- Procesamiento de lenguaje natural para un idioma de bajos recursos: al estar especializado en amárico, puede ofrecer mejor rendimiento que modelos multilingües genéricos en esta lengua.
- Inferencia de clasificación: al ser un modelo BERT, no genera texto libre, sino que produce etiquetas de clasificación para secuencias de entrada.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar comentarios y publicaciones en amárico para determinar si expresan sentimiento positivo, negativo o neutro, útil para monitorizar la percepción de marcas o eventos en Etiopía.
- Detección de postura en debates políticos: permite identificar si un texto se posiciona a favor o en contra de una afirmación o propuesta, aplicable a análisis de discursos parlamentarios o foros de discusión.
- Investigación sociolingüística: los investigadores pueden utilizar el modelo para etiquetar corpus de textos amáricos con sentimiento y postura, facilitando estudios sobre opinión pública y polarización.
- Moderación de contenido: en plataformas que operan en amárico, el modelo puede ayudar a detectar comentarios agresivos o polarizados, aunque se requiere validación adicional para este uso.
- Análisis de reseñas de productos: clasificar reseñas escritas en amárico en tiendas en línea para extraer métricas de satisfacción del cliente.
- Monitoreo de noticias y medios: clasificar artículos o titulares en amárico según su tono o postura, útil para agencias de noticias o analistas de medios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GLUE) en la información disponible. La model card reporta métricas de evaluación sobre el conjunto de validación, que se presentan a continuación:

| Metrica | Valor |
|---|---|
| Loss | 1,7034 |
| Stance F1 | 0,7235 |
| Sentiment F1 | 0,6570 |
| F1 global | 0,6902 |
| Stance Accuracy | 0,7170 |
| Sentiment Accuracy | 0,6621 |

Estos valores corresponden al final del entrenamiento (época 6). No se dispone de comparaciones con otros modelos en las mismas condiciones.

## Requisitos de hardware

- El modelo tiene 177,86 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 711 MB de memoria. Con cuantización a 8 bits, el tamaño se reduce a unos 178 MB.
- Es viable ejecutar inferencia en CPU con un rendimiento aceptable para tareas por lotes, aunque para aplicaciones en tiempo real se recomienda una GPU.
- Una GPU de consumo como una NVIDIA GTX 1060 (6 GB) o superior es suficiente para cargar el modelo en memoria y realizar inferencia con baja latencia.
- Para despliegue en producción, se puede utilizar Hugging Face Transformers con PyTorch, o servidores de inferencia como vLLM o TGI, aunque estos últimos están más orientados a modelos generativos.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación en amárico. Como referencia, el modelo base `Davlan/bert-base-multilingual-cased-finetuned-amharic` tiene la misma arquitectura y tamaño, pero fue entrenado para reconocimiento de entidades nombradas, no para sentimiento o postura. Otros modelos como los de la colección `rasyosef/amharic-text-embedding-models` están orientados a recuperación de pasajes y embeddings, no a clasificación directa. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de utilizarlo en aplicaciones comerciales.
- El conjunto de datos de entrenamiento no está documentado, por lo que se desconocen posibles sesgos en las etiquetas de sentimiento o postura, así como la representatividad de los dominios cubiertos.
- Al ser un modelo de clasificación, no genera texto y su uso se limita a tareas de etiquetado. No es adecuado para generación de contenido.
- La longitud de contexto no está confirmada para este fine-tuning, aunque el modelo base soporta 512 tokens. Textos más largos requerirán truncamiento o estrategias de ventana deslizante.
- Las métricas reportadas (F1 ~0,69) indican un rendimiento moderado, que puede no ser suficiente para aplicaciones críticas sin una evaluación adicional en datos reales.
- El modelo está especializado en amárico; su uso en otros idiomas no está soportado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tadiecool29/MTL-bert-base-amharic)
- [Modelo base: Davlan/bert-base-multilingual-cased-finetuned-amharic](https://huggingface.co/Davlan/bert-base-multilingual-cased-finetuned-amharic)
- [Colección de modelos de embedding en amárico (rasyosef)](https://huggingface.co/collections/rasyosef/amharic-text-embedding-models)
- [Repositorio GitHub de modelos BERT en amárico (rasyosef)](https://github.com/rasyosef/bert-amharic)

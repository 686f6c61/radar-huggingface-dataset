# tadiecool29/STL-afroxlmr-base-stance

## Resumen

STL-afroxlmr-base-stance es un modelo de clasificación de postura (stance detection) desarrollado por tadiecool29, obtenido mediante fine-tuning del modelo multilingüe AfroXLMR-base sobre un conjunto de datos no especificado. El modelo base, Davlan/afro-xlmr-base, es una adaptación de XLM-R base entrenada con masked language modeling sobre 17 lenguas africanas y 3 lenguas de alto recurso, lo que le confiere capacidades multilingües orientadas a contextos africanos.

El modelo resultante tiene 278 millones de parámetros y está diseñado para la tarea de detección de postura, es decir, determinar si un texto expresa una posición a favor, en contra o neutral respecto a un tema o afirmación. Su relevancia radica en que cubre un nicho lingüístico poco atendido por los modelos comerciales, ofreciendo una alternativa de código abierto con licencia MIT para análisis de opinión en lenguas africanas. La ficha técnica del autor reporta un F1 de 0,7592 en el conjunto de evaluación, aunque no se especifica la naturaleza de dicho conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-R base adaptado, fine-tune de Davlan/afro-xlmr-base) |
| Parametros totales | 278.046.724 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de XLM-R base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32) |
| Idiomas soportados | no disponible (el modelo base cubre 17 lenguas africanas y 3 de alto recurso, pero no se detalla la lista) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de AfroXLMR-base, que a su vez deriva de XLM-R base. Se trata de un transformer encoder monolítico (no MoE) con 278 millones de parámetros, entrenado originalmente con masked language modeling sobre un corpus multilingüe africano. El fine-tuning se realizó con una cabeza de clasificación para la tarea de detección de postura, utilizando un optimizador AdamW con learning rate de 1e-5, scheduler coseno con 300 pasos de warmup, batch size de 16 para entrenamiento y 32 para evaluación, durante 10 épocas con precisión mixta nativa (AMP). No se especifica el dataset de entrenamiento ni el proceso de alineamiento (RLHF/DPO), y la model card indica que la información sobre datos y procedimiento está pendiente de completar.

## Capacidades

- Clasificación de postura (stance detection): determina si un texto expresa una posición a favor, en contra o neutral respecto a un tema o afirmación concreto.
- Procesamiento multilingüe: hereda del modelo base la capacidad de trabajar con lenguas africanas y de alto recurso, aunque no se detalla la lista exacta de idiomas soportados.
- Análisis de sentimiento y opinión: al ser un encoder, puede utilizarse como extractor de características para tareas relacionadas con análisis de opinión.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de clasificación puro, sin capacidades generativas.

## Casos de uso

- Monitorización de opinión pública en redes sociales: el modelo puede clasificar automáticamente tuits o publicaciones en lenguas africanas para medir la postura de la población sobre temas políticos o sociales, aprovechando su naturaleza multilingüe.
- Análisis de debates parlamentarios: permite etiquetar intervenciones de diputados en asambleas de países africanos para estudiar la posición de los partidos respecto a proyectos de ley, con un coste computacional bajo.
- Investigación académica en lingüística computacional: sirve como baseline para estudios sobre detección de postura en lenguas de bajos recursos, dado que es un modelo abierto y ligero.
- Moderación de contenido en foros y plataformas: puede integrarse en pipelines de moderación para identificar mensajes que toman postura sobre temas sensibles, aunque requiere validación adicional por su limitada precisión.
- Análisis de reseñas de productos: clasifica la postura del autor de una reseña respecto a un producto o servicio, útil para sistemas de recomendación en mercados africanos.
- Detección de desinformación: combinado con otros clasificadores, puede ayudar a identificar textos que expresan posturas extremas sobre temas de salud o política, aunque no es suficiente por sí solo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, etc.) en la información disponible. La model card reporta las siguientes métricas de evaluación del propio autor, sin especificar el conjunto de datos:

| Metrica | Valor |
|---|---|
| Loss | 0,9352 |
| Stance Precision | 0,7596 |
| Stance Recall | 0,7595 |
| F1 | 0,7592 |
| Stance Acc | 0,7506 |

Estos valores corresponden a la época 9 (última) del entrenamiento. La evolución por épocas muestra una mejora progresiva hasta la época 6, con un ligero estancamiento posterior y un aumento de la loss de validación a partir de la época 4, lo que sugiere posible sobreajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278M parámetros × 4 bytes), reducible a ~300 MB con cuantización de 8 bits, aunque no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como GTX 1060, RTX 2060 o superiores. También puede ejecutarse en CPU con razonable latencia para clasificación por lotes.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en cualquier GPU moderna.
- Opciones de despliegue: compatible con Hugging Face Transformers, puede servirse con vLLM o TGI para inferencia en producción, aunque al ser un encoder puro, es más habitual usar pipelines de clasificación con PyTorch o TensorFlow.
- Latencia y throughput: no disponible, pero al ser un modelo de 278M parámetros, la inferencia en GPU es del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de detección de postura en lenguas africanas. Como referencia, el modelo base AfroXLMR-base compite con XLM-R base y mBERT en tareas multilingües, pero no hay datos de rendimiento comparativo para este fine-tuning específico. Se recomienda consultar la literatura sobre stance detection en lenguas africanas para identificar alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de un modelo entrenado con masked language modeling, puede heredar sesgos presentes en los corpus originales, especialmente en cuanto a género, etnia y temas políticos.
- Riesgo de alucinación: no aplica directamente, ya que no genera texto, pero la clasificación puede ser errónea en textos ambiguos o con ironía, lo que puede llevar a decisiones incorrectas en producción.
- Limitaciones de contexto: la longitud de contexto no está documentada, pero al derivar de XLM-R base, se espera un máximo de 512 tokens, insuficiente para documentos largos.
- Limitaciones de idioma: aunque el modelo base cubre lenguas africanas, no se especifica cuáles, y el fine-tuning pudo haberse realizado sobre un único idioma o dominio, reduciendo su generalización.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías y sin documentación de datos de entrenamiento, lo que dificulta la auditoría.
- Caveat para producción: las métricas reportadas (F1 ~0,76) son moderadas y no se conoce el conjunto de evaluación; es imprescindible validar el modelo con datos propios antes de desplegarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tadiecool29/STL-afroxlmr-base-stance)
- [Modelo base AfroXLMR-base en Hugging Face](https://huggingface.co/Davlan/afro-xlmr-base)
- [Descripción de AfroXLMR-base en AIBase](https://model.aibase.com/models/details/1915680575741460482)

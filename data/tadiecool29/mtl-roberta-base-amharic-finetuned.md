# tadiecool29/MTL-roberta-base-amharic-finetuned

## Resumen

MTL-roberta-base-amharic-finetuned es un modelo de lenguaje entrenado mediante fine-tuning sobre FacebookAI/xlm-roberta-base, especializado en el procesamiento de texto en amhárico. El modelo fue desarrollado por el usuario tadiecool29 y está diseñado para resolver tareas de análisis de sentimiento y detección de postura (stance detection) en textos en amhárico, una lengua semítica hablada principalmente en Etiopía.

El modelo emplea una arquitectura transformer basada en XLM-RoBERTa, con un total de 278 millones de parámetros. Su relevancia radica en que aborda el procesamiento del lenguaje natural en un idioma de bajos recursos, donde los modelos multilingües genéricos suelen tener un rendimiento limitado. Al estar fine-tuning sobre un modelo multilingüe, conserva la capacidad de transferencia de conocimiento de lenguas relacionadas mientras se adapta a las particularidades del amhárico.

La licencia MIT permite su uso comercial sin restricciones significativas, lo que facilita su adopción en aplicaciones de producción. El modelo se distribuye en formato safetensors y es compatible con el ecosistema de Hugging Face Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) |
| Parametros totales | 278.049.031 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de XLM-RoBERTa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Amharico (fine-tuning); herencia multilingue de XLM-RoBERTa |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-base, un transformer encoder basado en la arquitectura RoBERTa con enmascaramiento de lenguaje. XLM-RoBERTa fue preentrenado con 2,5 TB de datos filtrados de CommonCrawl en 100 idiomas, incluyendo el amhárico. El fine-tuning se realizó sobre un dataset no especificado por el autor, con un enfoque de aprendizaje multitarea (MTL) que combina dos objetivos: análisis de sentimiento y detección de postura.

El entrenamiento se llevó a cabo durante 10 épocas con una tasa de aprendizaje de 1e-05, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0,9; 0,999), scheduler coseno con 300 pasos de warmup y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado, pero los resultados de evaluación sugieren que contiene textos etiquetados con sentimiento y postura, probablemente relacionados con noticias o redes sociales en amhárico.

## Capacidades

- Análisis de sentimiento en textos en amhárico, clasificando la polaridad emocional (positiva, negativa, neutra).
- Detección de postura (stance detection), identificando la posición del autor respecto a un tema o afirmación concreta.
- Clasificación de textos cortos y largos dentro del límite de 512 tokens.
- Procesamiento de texto en amhárico con transferencia de conocimiento de lenguas relacionadas gracias a su base multilingüe.
- Fine-tuning adicional sobre dominios específicos gracias a su arquitectura estándar de encoder.
- Compatibilidad con el ecosistema Transformers para integración en pipelines de NLP.

## Casos de uso

- Monitorización de redes sociales en amhárico: el modelo puede analizar publicaciones de Twitter, Facebook o foros etíopes para detectar sentimiento hacia marcas, políticos o eventos, ayudando a empresas y organizaciones a medir la opinión pública.
- Análisis de noticias y medios etíopes: permite clasificar artículos periodísticos en amhárico según su tono (positivo, negativo, neutro) y la postura del medio respecto a temas como política, economía o salud.
- Investigación académica en PLN para lenguas de bajos recursos: sirve como punto de partida para estudios sobre procesamiento de lenguas semíticas y comparación con modelos multilingües genéricos.
- Detección de desinformación y discurso de odio: combinando la detección de postura con análisis de sentimiento, puede ayudar a identificar contenido polarizante o engañoso en amhárico.
- Atención al cliente para empresas etíopes: integrado en sistemas de tickets o chatbots, puede clasificar automáticamente las quejas o consultas de clientes según su tono emocional para priorizar respuestas.
- Análisis de encuestas y feedback: procesa respuestas abiertas en amhárico para extraer sentimiento y postura sobre productos, servicios o políticas públicas.

## Benchmarks y rendimiento

El modelo no presenta resultados en benchmarks estandarizados como MMLU, HumanEval o GLUE. Los datos disponibles provienen de la evaluación durante el entrenamiento, con los siguientes resultados finales en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss | 1,6333 |
| Stance F1 | 0,7179 |
| Sentiment F1 | 0,7022 |
| F1 (media) | 0,7100 |
| Stance Acc | 0,7107 |
| Sentiment Acc | 0,7070 |

La evolución del entrenamiento muestra una mejora progresiva hasta la época 8, con una ligera degradación en las últimas épocas, lo que sugiere un posible sobreajuste. El mejor F1 combinado se alcanzó en la época 8 con 0,7201.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en FP32 (278M parámetros), reducible a unos 300-400 MB con cuantización a int8 o int4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia. Tarjetas como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas.
- Compatible con GPU de consumo: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: Transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como vLLM o TGI (aunque al ser un encoder, la inferencia es rápida incluso en CPU).
- Latencia estimada: en GPU moderna, inferencia en menos de 10 ms por secuencia de 128 tokens. En CPU, entre 50-200 ms dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| MTL-roberta-base-amharic-finetuned | 278M | 512 | MIT | Amharico, sentimiento y postura |
| rasyosef/roberta-base-amharic | 125M | 512 | no disponible | Amharico, clasificacion general |
| FacebookAI/xlm-roberta-base | 278M | 512 | MIT | Multilingue (100 idiomas) |

El modelo comparte arquitectura y tamaño con XLM-RoBERTa base, pero está especializado en amhárico. Frente a rasyosef/roberta-base-amharic, que tiene menos parámetros, este modelo ofrece mayor capacidad de representación. No se dispone de comparativas directas de rendimiento entre estos modelos en los mismos conjuntos de datos.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que dificulta evaluar posibles sesgos o la representatividad de los dominios cubiertos.
- Los resultados de evaluación muestran signos de sobreajuste a partir de la época 8, lo que puede afectar a la generalización en datos no vistos.
- El modelo está limitado a 512 tokens de contexto, por lo que no es adecuado para documentos largos sin truncamiento.
- Aunque la licencia MIT permite uso comercial, el autor no proporciona garantías sobre el rendimiento en producción ni documentación sobre limitaciones éticas.
- El amhárico es un idioma con variaciones dialectales; el modelo puede no funcionar igualmente bien en todas las variantes.
- No se han publicado evaluaciones sobre sesgos de género, raza o religión, un aspecto crítico para aplicaciones de análisis de sentimiento.
- El repositorio no incluye ejemplos de uso ni documentación de la API, lo que dificulta su adopción rápida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-roberta-base-amharic-finetuned
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Repositorio relacionado (clasificacion de noticias en amharico): https://github.com/rasyosef/amharic-news-category-classification
- Paper sobre embeddings en amharico: https://arxiv.org/abs/2505.19356

# vansonhust/phobert-news-sentiment-vi

## Resumen

PhoBERT News Sentiment VI es un modelo de clasificación de texto en vietnamita desarrollado por el usuario vansonhust, obtenido mediante fine-tuning del modelo `wonrax/phobert-base-vietnamese-sentiment`. Su tarea concreta es determinar si una noticia periodística describe un evento positivo, negativo o neutro para las personas o la localidad mencionadas, una formulación distinta del análisis de sentimiento convencional orientado a opiniones de producto. El modelo se creó en el contexto de un proyecto académico de ingeniería de datos (curso IT5427) sobre un lakehouse de noticias con arquitectura Bronze-Silver-Gold.

Técnicamente se trata de un transformer encoder de tipo RoBERTa adaptado al vietnamita (PhoBERT), con 135 millones de parámetros y un límite práctico de 160 tokens de entrada tras la segmentación de palabras con `pyvi`. El repositorio ocupa 0,5 GB y los pesos se distribuyen en formato safetensors. No se especifica la longitud de contexto nativa del modelo base en la información disponible.

Su relevancia es limitada y muy específica: no compite con modelos generalistas, sino que resuelve una tarea de clasificación ternaria sobre titulares y entradillas de noticias vietnamitas con un macro-F1 de 0,744 en un conjunto de test de 150 artículos, superando tanto a una línea base basada en léxico de palabras clave (0,563) como al modelo base sin fine-tuning (0,529). Es un modelo pequeño, de nicho y con fecha de creación futura (noviembre de 2026), lo que conviene tener en cuenta al evaluar su vigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (PhoBERT base) |
| Parámetros totales | 135.000.579 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada práctica limitada a 160 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible (se indica que sigue los términos del modelo base y de PhoBERT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `wonrax/phobert-base-vietnamese-sentiment`, un PhoBERT base afinado previamente para sentimiento en vietnamita. PhoBERT es una adaptación de RoBERTa al vietnamita que requiere segmentación de palabras (word segmentation) como paso previo, en este caso mediante la librería `pyvi`. Sobre esa base se realizó un fine-tuning de clasificación con tres etiquetas: `0 = NEGATIVE`, `1 = POSITIVE` y `2 = NEUTRAL`, manteniendo los identificadores del modelo base.

El conjunto de entrenamiento consta de 1.200 artículos procedentes de cinco medios vietnamitas (240 por medio), publicados entre el 1 y el 14 de noviembre de 2026. El etiquetado se generó con 11 reglas escritas: precios, propuestas y relaciones públicas se marcan como NEUTRAL; detenciones, sentencias y multas como POSITIVE; accidentes, desastres y delitos como NEGATIVE, entre otras. La distribución resultante es de 678 NEUTRAL, 339 POSITIVE y 183 NEGATIVE. El entrenamiento usó 5 épocas, AdamW con learning rate 2e-5, batch de 16 y pesos de clase por frecuencia inversa, seleccionando la época sobre un conjunto de desarrollo separado. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de clasificación de este tamaño.

La entrada se construye concatenando el titular, un punto y los primeros 220 caracteres del párrafo de entradilla, todo tokenizado con `pyvi` y truncado a 160 tokens. Esta decisión de diseño implica que el modelo solo ve el arranque de la noticia, no el cuerpo completo.

## Capacidades

- Clasificación de texto ternaria (positivo, negativo, neutro) sobre noticias en vietnamita.
- Evaluación del impacto de un evento noticioso sobre personas o localidades, no del tono subjetivo del texto.
- Procesamiento de titulares y entradillas cortas (hasta 220 caracteres de sumario, 160 tokens).
- Manejo de texto segmentado con `pyvi`, requisito imprescindible para obtener resultados correctos.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni uso como agente.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni otras modalidades.
- Multilingüismo limitado exclusivamente al vietnamita.

## Casos de uso

- Clasificación automática de flujos de noticias: integrado en un pipeline de ingesta, el modelo etiqueta cada artículo como positivo, negativo o neutro para enriquecer un lakehouse de datos (capa Silver o Gold) con metadatos de sentimiento de evento.
- Monitorización de reputación local: medios regionales o ayuntamientos pueden procesar titulares sobre su localidad y detectar rápidamente eventos negativos (accidentes, delitos) frente a neutros (propuestas, precios) para priorizar la respuesta informativa.
- Filtrado y triaje en alertas de actualidad: un sistema de alertas puede usar la etiqueta NEGATIVE con su recall de 0,76 para elevar a revisión humana las noticias de sucesos, reduciendo el volumen de lectura manual.
- Análisis de tendencia temática a corto plazo: al clasificar lotes de noticias de varios medios durante una ventana temporal, permite agregar proporciones de eventos positivos y negativos por día o por medio, útil en estudios de comunicación.
- Enriquecimiento de datasets para investigación: sirve como etiquetador preliminar de corpus periodísticos vietnamitas antes de una revisión humana, aprovechando su macro-F1 de 0,744 como punto de partida.
- Prototipado académico de pipelines NLP: por su tamaño reducido (135 M de parámetros, 0,5 GB) y su formato safetensors, es adecuado para prácticas docentes de fine-tuning y despliegue de clasificadores en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de test reservado de 150 artículos:

| Sistema | macro-F1 | Recall NEGATIVE |
|---|---|---|
| Léxico de palabras clave (pipeline anterior) | 0,563 | 0,72 |
| Modelo base sin fine-tuning | 0,529 | 0,69 |
| Este modelo | 0,744 | 0,76 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo coherente con la naturaleza de clasificador especializado del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB solo para pesos (135 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16: alrededor de 0,3 GB para pesos, con huella total por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con latencias aceptables para clasificación por lotes.
- Opciones de despliegue: `transformers` con PyTorch (ruta natural dado el formato safetensors), `vLLM` no aplica de forma habitual a clasificadores encoder, `llama.cpp` y `Ollama` no soportan este formato de modelo; `TGI` podría no ser la vía principal. La integración más directa es un pipeline de `text-classification` de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vansonhust/phobert-news-sentiment-vi | 135 M | 160 tokens (práctico) | Clasificación de sentimiento de evento en noticias (vi) | no disponible | Hugging Face |
| wonrax/phobert-base-vietnamese-sentiment (base) | 135 M | no disponible | Sentimiento general en vietnamita | no disponible | Hugging Face |
| Léxico de palabras clave (línea base del proyecto) | no aplica | no aplica | Clasificación por reglas | no disponible | Interno del proyecto |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y evaluación fueron generadas por un anotador automático de IA (dos pasadas independientes con kappa de Cohen de 0,79), no por humanos, por lo que las métricas pueden ser optimistas respecto al juicio humano.
- Los datos cubren solo dos semanas de noticias de cinco medios; la deriva temática hace necesario reentrenar con datos etiquetados más recientes antes de confiar en el modelo a largo plazo.
- No es adecuado para reseñas de productos ni para texto de redes sociales.
- La entrada se limita al titular y los primeros 220 caracteres de la entradilla, truncados a 160 tokens; el modelo no procesa el cuerpo completo de la noticia.
- Requiere segmentación de palabras con `pyvi`; sin ella, el rendimiento se degrada.
- El desbalance de clases es notable (678 NEUTRAL frente a 183 NEGATIVE), lo que puede sesgar las predicciones hacia la clase mayoritaria.
- La licencia no está especificada explícitamente; los términos siguen el modelo base y PhoBERT, por lo que debe verificarse antes de un uso comercial.
- Riesgo de alucinación no aplicable en sentido estricto (es un clasificador, no un generador), pero sí de clasificaciones erróneas en titulares ambiguos o irónicos.
- El modelo tiene fecha de creación de noviembre de 2026 y cero descargas y likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vansonhust/phobert-news-sentiment-vi
- Modelo base: https://huggingface.co/wonrax/phobert-base-vietnamese-sentiment

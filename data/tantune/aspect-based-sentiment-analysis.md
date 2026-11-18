# tantune/aspect-based-sentiment-analysis

## Resumen

`tantune/aspect-based-sentiment-analysis` es un modelo de clasificación de texto obtenido mediante fine-tuning de `albert/albert-base-v2` sobre un conjunto de datos no especificado, orientado a la tarea de análisis de sentimiento basado en aspectos (aspect-based sentiment analysis, ABSA). Lo publica el usuario `tantune` en Hugging Face y se distribuye con licencia Apache 2.0. Se trata de un modelo pequeño, de 11.685.891 parámetros, derivado de la arquitectura ALBERT, que emplea factorización de embeddings y compartición de parámetros entre capas para reducir drásticamente el número de pesos frente a un BERT-base convencional.

El modelo se ha entrenado con la librería Transformers (versión 5.22.1) y PyTorch 2.14.1, y se presenta como un `text-classification` estándar, sin pipeline específico de ABSA ni tokenizador de pares aspecto-texto documentado. La model card es la generada automáticamente por el `Trainer` y no incluye descripción del dataset, idioma, ni detalles sobre el formato de entrada esperado, por lo que la información disponible es muy limitada.

Su relevancia actual es acotada: no tiene descargas ni likes, el repositorio ocupa 0,2 GB y no se han publicado resultados de benchmarks más allá de la accuracy de validación declarada (0,8356). Resulta útil como punto de partida para experimentación con ABSA sobre ALBERT, pero no como modelo listo para producción sin una evaluación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ALBERT (transformer encoder con embeddings factorizados y compartición de parámetros entre capas), base `albert-base-v2` |
| Parametros totales | 11.685.891 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base ALBERT admite hasta 512 tokens, aunque la model card no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes o GGUF, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `albert-base-v2`, un transformer encoder de la familia ALBERT que reduce el número de parámetros mediante dos técnicas: factorización de los embeddings (proyectando el vocabulario a un espacio de menor dimensión antes de expandirlo al tamaño oculto) y compartición de los pesos de atención y feed-forward entre todas las capas. El resultado es un modelo con 11,7 millones de parámetros, mucho más ligero que un BERT-base (110 millones), manteniendo una profundidad de 12 capas y un tamaño oculto de 768 en el modelo base original.

El fine-tuning se realizó con los siguientes hiperparámetros: learning rate 2e-5, batch size de 32 en entrenamiento y evaluación, 5 épocas, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP), con semilla 42. El conjunto de datos de entrenamiento no se especifica ("unknown dataset" en la model card). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de un fine-tuning supervisado convencional sobre una cabeza de clasificación. No se declaran innovaciones técnicas propias más allá del uso del modelo base.

## Capacidades

- Clasificación de texto (sentiment analysis) sobre secuencias de entrada, con una única etiqueta de salida por ejemplo.
- Análisis de sentimiento orientado a aspectos, presumiblemente, aunque el formato exacto de entrada (par aspecto-texto, concatenación, etc.) no está documentado.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un modelo exclusivamente de clasificación.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no declaradas; el modelo base ALBERT se entrenó principalmente en inglés, pero no se confirma el idioma del fine-tuning.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Clasificación de opiniones en reseñas de producto: el modelo puede etiquetar la polaridad de un texto de reseña, aprovechando su fine-tuning sobre datos de sentimiento; adecuado por su bajo coste computacional y su tamaño reducido.
- Análisis de sentimiento por aspecto en encuestas de satisfacción: si el formato de entrada admite pares aspecto-texto, puede asignar polaridad a cada aspecto mencionado (precio, servicio, calidad), aunque el usuario debe validar el formato esperado.
- Moderación de comentarios en foros o redes: clasificación rápida de sentimiento para priorizar revisiones humanas, gracias a la baja latencia de un modelo de 11,7 M de parámetros.
- Enriquecimiento de datasets de opinión: etiquetado automático de grandes volúmenes de texto para construir corpus de sentimiento, con la ventaja de poder ejecutarse en CPU.
- Prototipado de pipelines de NLP: punto de partida para experimentar con ABSA antes de invertir en modelos mayores, dado su reducido tamaño y licencia permisiva.
- Investigación académica sobre eficiencia: comparación de ALBERT frente a BERT-base en tareas de clasificación de sentimiento, con un modelo de menos de una décima parte de los parámetros.
- Integración en sistemas embebidos o edge: inferencia en dispositivos con recursos limitados por su tamaño de 0,2 GB en disco y su bajo requisito de memoria.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (evaluación durante el entrenamiento):

| Epoca | Paso | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 113 | 0,5375 | 0,7998 |
| 2 | 226 | 0,5668 | 0,7989 |
| 3 | 339 | 0,4303 | 0,8248 |
| 4 | 452 | 0,4548 | 0,8382 |
| 5 | 565 | 0,4687 | 0,8356 |

El model-index no incluye resultados adicionales (lista vacía). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de ABSA (SemEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (11,7 M de parámetros equivalen a unos 47 MB de pesos); en fp16, unos 24 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100. Funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 3050, RTX 4090, etc., e incluso en Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), `text-embeddings-inference` no aplica; vLLM no está orientado a clasificación; llama.cpp y Ollama no soportan este formato de forma nativa sin conversión; TGI soporta modelos de clasificación con limitaciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tantune/aspect-based-sentiment-analysis | 11,7 M | no disponible | Clasificación de sentimiento (ABSA) | Apache 2.0 | Hugging Face, sin descargas |
| albert-base-v2 | 11,7 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| distilbert-base-uncased | 66 M | 512 tokens | Modelo base (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |

No se dispone de comparativas de rendimiento con modelos específicos de ABSA (por ejemplo, fine-tunes sobre SemEval) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, el idioma ni el formato de entrada esperado, lo que impide conocer su dominio de aplicación real.
- No se han publicado métricas de evaluación más allá de la accuracy de validación (0,8356) sobre un conjunto no descrito; el riesgo de sobreajuste o de sesgo del dataset es desconocido.
- Riesgo de alucinación no aplica en sentido estricto (es clasificación, no generación), pero sí de clasificaciones erróneas en dominios distintos al de entrenamiento.
- No se declaran sesgos conocidos, pero al desconocerse el corpus de entrenamiento no puede descartarse sesgo de dominio o de anotación.
- Limitación de contexto: el modelo base ALBERT admite 512 tokens, aunque no se confirma en la model card; textos más largos requerirán truncamiento.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento (desconocido) no imponga restricciones adicionales.
- El repositorio no tiene descargas ni validación comunitaria; no se recomienda su uso en producción sin una evaluación propia sobre datos representativos.
- El modelo se generó automáticamente con el `Trainer` y la model card no ha sido revisada por el autor ("More information needed" en varias secciones).

## Enlaces

- Hugging Face: https://huggingface.co/tantune/aspect-based-sentiment-analysis
- Modelo base: https://huggingface.co/albert-base-v2
- Documentación de ALBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/albert

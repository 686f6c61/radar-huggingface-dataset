# vietnamese-acsa/bamibert-hotel-acsa-multilabel

## Resumen

El modelo `vietnamese-acsa/bamibert-hotel-acsa-multilabel` es un ajuste fino (fine-tuning) del modelo BamiBERT, un BERT preentrenado específicamente para vietnamita, desarrollado por Qualcomm AI Research. Este checkpoint concreto ha sido entrenado para la clasificación de texto multilabel en el dominio hotelero, probablemente orientado al análisis de sentimiento por aspectos (ACSA, *Aspect-based Sentiment Analysis*), aunque la model card no proporciona detalles sobre la tarea exacta ni el conjunto de datos utilizado.

El modelo base BamiBERT se entrenó desde cero sobre un corpus de 129 GB de texto vietnamita sin comprimir durante 20 épocas, con una longitud máxima de contexto de 2048 tokens, lo que supone una mejora frente a modelos anteriores como PhoBERT que operaban con contextos más cortos. Este checkpoint de clasificación hereda esa arquitectura y la adapta a una tarea específica de etiquetado múltiple, con un total de 103 millones de parámetros, un tamaño contenido que permite su despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su especialización para un dominio concreto (hostelería) y en su capacidad para procesar texto vietnamita, un idioma con escasez de recursos lingüísticos. Sin embargo, la ausencia de documentación detallada y de resultados de evaluación publicados limita su uso directo en producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (BERT-based) |
| Parametros totales | 103.055.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredado de BamiBERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (inferido por el modelo base; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BamiBERT, un transformer BERT entrenado desde cero para vietnamita. Según el paper de BamiBERT, el modelo preentrenado se entrenó sobre 129 GB de texto vietnamita sin comprimir durante 20 épocas, con una longitud de contexto extendida de 2048 tokens, operando directamente sobre texto crudo sin normalización previa. El checkpoint `bamibert-hotel-acsa-multilabel` es un ajuste fino de ese modelo base para una tarea de clasificación multilabel, aunque la model card no especifica el conjunto de datos de entrenamiento ni la naturaleza exacta de las etiquetas.

Los hiperparámetros de entrenamiento declarados en la model card son: learning rate de 5e-05, batch size de entrenamiento de 8, batch size de evaluación de 32, semilla 42, optimizador AdamW (fused) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 3 épocas. El entrenamiento se realizó con Transformers 5.5.0, PyTorch 2.11.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. No se menciona el uso de técnicas como RLHF o DPO, ni innovaciones específicas en el ajuste fino.

## Capacidades

- Clasificación de texto multilabel: el modelo asigna una o varias etiquetas a un texto de entrada, probablemente relacionadas con aspectos de reseñas hoteleras (por ejemplo, limpieza, ubicación, servicio, relación calidad-precio).
- Procesamiento de texto vietnamita: al estar basado en BamiBERT, maneja correctamente la morfología y los caracteres diacríticos del vietnamita.
- Longitud de contexto de 2048 tokens: permite procesar reseñas largas o documentos de tamaño medio sin truncamiento excesivo.
- Inferencia eficiente: con 103 millones de parámetros, es adecuado para entornos con recursos moderados.
- No se han documentado capacidades adicionales como tool calling, generación de código, razonamiento multi-paso o soporte de agentes, ya que es un modelo de clasificación puro.

## Casos de uso

- Análisis de sentimiento por aspectos en reseñas de hoteles: el modelo puede clasificar cada reseña en múltiples categorías (por ejemplo, "limpieza positiva", "ubicación negativa", "servicio positivo") para generar informes de satisfacción por atributo.
- Monitorización de opiniones en plataformas de reservas: integración en un pipeline que procese reseñas de Booking, TripAdvisor o Agoda para detectar tendencias y problemas recurrentes en establecimientos hoteleros.
- Filtrado y enrutado de comentarios de clientes: asignar automáticamente cada reseña a los departamentos correspondientes (recepción, limpieza, restauración) según las etiquetas predichas.
- Generación de resúmenes agregados para gestión hotelera: agrupar reseñas por etiquetas y calcular estadísticas de satisfacción por aspecto para la toma de decisiones.
- Detección de incidencias críticas: identificar reseñas que combinan etiquetas negativas en aspectos clave (por ejemplo, "seguridad" y "limpieza") para priorizar su atención.
- Investigación académica en PLN vietnamita: servir como punto de partida para experimentos de clasificación de texto en dominios específicos, dado que es uno de los pocos modelos vietnamitas con ajuste fino disponible públicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `model-index` con una lista vacía de resultados, y no se encontraron evaluaciones externas en la búsqueda web. Por tanto, no es posible comparar su rendimiento con otros modelos de clasificación de texto vietnamita.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en FP32 (103 millones de parámetros × 4 bytes), reducible a unos 0,1 GB con cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas.
- Compatible con GPUs de consumo: sí, cabe en cualquier GPU moderna de gama media.
- Opciones de despliegue: al ser un modelo de Transformers estándar, puede servirse con vLLM, Hugging Face Inference Endpoints, TGI, o ejecutarse en CPU con ONNX Runtime. También es compatible con `text-embeddings-inference` según los tags del repositorio.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo pequeño, la inferencia en GPU debería ser del orden de milisegundos por muestra.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base BamiBERT se puede comparar con PhoBERT (otro BERT vietnamita), pero no hay datos de rendimiento de este checkpoint específico. Se recomienda al usuario evaluar el modelo en su propio conjunto de datos antes de adoptarlo.

## Limitaciones y advertencias

- La model card es automática y no proporciona información sobre el conjunto de datos de entrenamiento, las etiquetas utilizadas ni el rendimiento esperado. Esto impide conocer su precisión real y su comportamiento en dominios fuera del hotelero.
- No se han publicado resultados de evaluación, por lo que el riesgo de alucinación o clasificación errónea es desconocido.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- El modelo está especializado en vietnamita; su uso con otros idiomas no es viable.
- Al ser un ajuste fino de BamiBERT, hereda las limitaciones del modelo base, como posibles sesgos presentes en el corpus de preentrenamiento (129 GB de texto web vietnamita).
- No se ha documentado la composición de las etiquetas multilabel, por lo que la interpretación de las salidas requiere un análisis adicional.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vietnamese-acsa/bamibert-hotel-acsa-multilabel
- Modelo base BamiBERT: https://huggingface.co/Qualcomm-AI-Research/BamiBERT
- Paper de BamiBERT: https://huggingface.co/papers/2607.02259
- Versión HTML del paper: https://arxiv.org/html/2607.02259v1
- PDF del paper: https://arxiv.org/pdf/2607.02259
- Resumen del paper en OpenTrain: https://www.opentrain.ai/papers/bamibert-a-new-bert-based-language-model-for-vietnamese--arxiv-2607.02259/

# ychafiqui/v3_moroccan_law_qst_classif_arabert_19_classes

## Resumen
El modelo `ychafiqui/v3_moroccan_law_qst_classif_arabert_19_classes` es un clasificador de texto derivado de la familia AraBERT, publicado en Hugging Face por el usuario `ychafiqui`. Por el identificador del repositorio, el modelo está orientado a clasificar preguntas (question classification) relacionadas con la legislación marroquí en 19 categorías distintas. El prefijo "arabert" indica que parte de pesos preentrenados en árabe, mientras que "moroccan_law" sugiere que el ajuste fino se ha realizado sobre un corpus jurídico de Marruecos.

El modelo cuenta con 369.442.835 parámetros totales según los pesos en formato safetensors, lo que lo sitúa en el rango típico de un BERT-base multilingüe o de una variante AraBERT de tamaño medio-grande. El repositorio ocupa 1,5 GB. Se trata de un modelo discriminativo de clasificación de texto, no de un modelo generativo, por lo que no dispone de ventana de contexto en el sentido habitual de los LLM: procesa una única entrada de texto y devuelve una etiqueta entre 19 posibles.

La relevancia de esta ficha es principalmente documental: la model card está autogenerada por Hugging Face y prácticamente todos los campos aparecen como "[More Information Needed]", sin métricas, sin descripción del dataset, sin hiperparámetros y sin licencia declarada. Cualquier uso en producción requiere validación propia por parte del integrador.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | BERT (familia AraBERT, encoder transformer) |
| Parametros totales | 369.442.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT, típicamente 512 tokens; valor no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre del modelo sugiere árabe, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | text-classification |
| Numero de clases | 19 (según el identificador del modelo, no confirmado en la model card) |
| Tamano del repositorio | 1,5 GB |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura declarada en las etiquetas del repositorio es `bert`, con `text-classification` como pipeline. El nombre del modelo indica que se trata de una variante AraBERT, es decir, un BERT preentrenado sobre texto árabe y posteriormente ajustado para clasificación de preguntas. No obstante, la model card no especifica la arquitectura exacta, el número de capas, la dimensión oculta ni el número de cabezas de atención; tampoco confirma si se trata de AraBERTv0.2-base, AraBERTv2-base o una variante con vocabulario extendido.

No hay información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset jurídico marroquí, ni si se aplicaron técnicas de aumento de datos, balanceo de clases o validación cruzada. La model card tampoco documenta hiperparámetros de ajuste fino (learning rate, batch size, épocas) ni el procedimiento de tokenización. La única referencia técnica presente en las etiquetas es el enlace al artículo `arxiv:1910.09700`, que corresponde al calculador de impacto medioambiental de Lacoste et al., citado en la plantilla estándar de Hugging Face y no relacionado con el modelo en sí.

## Capacidades
- Clasificación de texto en 19 categorías (según el identificador del modelo; las etiquetas concretas no están documentadas).
- Procesamiento de preguntas jurídicas en el dominio del derecho marroquí, presumiblemente en árabe.
- Inferencia de embeddings de texto a través del encoder BERT subyacente.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles, según las etiquetas del repositorio.
- No dispone de tool calling ni function calling: es un modelo discriminativo, no generativo.
- No dispone de capacidades de agente, razonamiento multi-paso ni generación de texto libre.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingües: no confirmadas; el nombre sugiere árabe, pero no hay evidencia documentada de otros idiomas.

## Casos de uso
- Clasificación de consultas jurídicas entrantes: en un portal de servicios legales marroquíes, el modelo puede etiquetar automáticamente cada pregunta recibida en una de las 19 categorías para enrutarla al departamento o profesional adecuado. Es adecuado por tratarse de un clasificador especializado en dominio jurídico.
- Enrutamiento en asistentes de atención al ciudadano: integrado como paso previo a un LLM generativo, permite seleccionar la plantilla de respuesta o la base de conocimiento correspondiente según la categoría detectada.
- Análisis de volumen de consultas: agregación de las etiquetas predichas sobre grandes lotes de preguntas para detectar qué áreas del derecho concentran más demanda (laboral, familia, fiscal, etc.).
- Filtrado y triaje de correo o formularios: clasificación previa de mensajes recibidos por despachos de abogados para priorizar casos urgentes o derivar los que no encajan en el ámbito de la firma.
- Construcción de datasets anotados: uso del modelo como preetiquetador para reducir el coste de anotación manual en proyectos de etiquetado jurídico, con revisión humana posterior.
- Búsqueda semántica sobre FAQs jurídicas: extracción de embeddings del encoder para indexar y recuperar preguntas similares en un sistema de preguntas frecuentes.
- Monitorización de tendencias regulatorias: clasificación periódica de consultas públicas o foros para detectar cambios en las preocupaciones jurídicas de la ciudadanía.
- Evaluación comparativa interna: servir como baseline de clasificación jurídica árabe frente a modelos más grandes en pruebas de ablación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: aproximadamente 1,5 GB solo para pesos (369 M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB.
- VRAM estimada en fp16/bf16: en torno a 0,8-1 GB para pesos, más overhead; alrededor de 1,5-2 GB en total.
- VRAM estimada con cuantización int8: aproximadamente 0,4 GB para pesos; no se documentan formatos de cuantización específicos para este modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas NVIDIA T4, RTX 3060, RTX 4060, RTX 4090, A10, A100 y H100. El modelo es sobradamente pequeño para todas ellas.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090 e incluso iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers con pipeline `text-classification`, Text Embeddings Inference (TEI) para servir embeddings y clasificación, TorchServe, FastAPI con carga directa del modelo, ONNX Runtime si se exporta. No se documenta soporte de llama.cpp ni Ollama, dado que no es un modelo generativo GGUF.
- Latencia y throughput estimados: no disponibles. Por el tamaño (369 M parámetros, encoder BERT), se espera una latencia por debajo de decenas de milisegundos en GPU moderna para entradas de hasta 512 tokens, y throughput de varios centenares a miles de peticiones por segundo por GPU con batching, pero estos valores son estimaciones teóricas no verificadas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ychafiqui/v3_moroccan_law_qst_classif_arabert_19_classes | 369 M | no disponible | Clasificación jurídica árabe (19 clases) | no disponible | Hugging Face, 0 descargas |
| aubmindlab/bert-base-arabertv02 | ~136 M (BERT-base) | 512 tokens | Modelo base árabe | Apache 2.0 (según el repositorio original) | Hugging Face, ampliamente usado |
| CAMeL-Lab/bert-base-arabic-camelbert-mix | ~110 M (BERT-base) | 512 tokens | Modelo base árabe | no disponible en esta ficha | Hugging Face |
| UBC-NLP/MARBERT | ~163 M (BERT-base) | 512 tokens | Modelo base árabe marroquí (dialectal) | MIT (según el repositorio original) | Hugging Face |

La comparación con los modelos base es orientativa: este modelo es un ajuste fino específico sobre legislación marroquí, mientras que AraBERT, CAMeLBERT y MARBERT son encoders preentrenados generalistas que servirían como punto de partida para tareas similares. No se dispone de métricas comparativas de rendimiento para este modelo, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias
- La model card está autogenerada y prácticamente vacía: no hay información sobre datos de entrenamiento, métricas, hiperparámetros ni evaluación.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; usar en producción sin aclarar la licencia implica riesgo legal.
- Idiomas no declarados formalmente: aunque el nombre indica árabe, no se confirma el dialecto (árabe estándar moderno, árabe marroquí o mezcla) ni el tratamiento de texto en francés, habitual en documentos jurídicos marroquíes.
- Riesgo de sesgo: al estar entrenado presumiblemente sobre un corpus jurídico concreto, puede sobrerrepresentar ciertas áreas del derecho y infrarrepresentar otras; no hay documentación sobre balanceo de clases.
- Riesgo de alucinación: aunque es un clasificador y no genera texto, puede producir etiquetas erróneas con alta confianza en entradas ambiguas, fuera de dominio o con vocabulario jurídico no visto en entrenamiento.
- Sin métricas publicadas: no es posible estimar precisión, recall, F1 macro ni matriz de confusión; cualquier uso requiere validación sobre un conjunto de test propio.
- Número de descargas y likes igual a cero en el momento de la consulta, lo que sugiere que el modelo no ha sido validado por la comunidad.
- Compatibilidad con `text-embeddings-inference` declarada en las etiquetas, pero no verificada con documentación.
- Fecha de creación indicada como 2026-11-15, posterior a la fecha habitual de publicación de modelos; conviene verificar la integridad del repositorio antes de integrarlo.
- Sin información sobre tokenizador, vocabulario o preprocesamiento: puede requerir normalización específica del árabe (eliminación de diacríticos, tatweel, etc.) que no está documentada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ychafiqui/v3_moroccan_law_qst_classif_arabert_19_classes
- Paper citado en las etiquetas (calculador de impacto medioambiental de Lacoste et al., no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML citado en la plantilla: https://mlco2.github.io/impact#compute
- Repositorio AraBERT (referencia por el prefijo del nombre, no confirmado como base): https://github.com/aub-mind/arabert
- Paper AraBERT: https://arxiv.org/abs/2003.00104

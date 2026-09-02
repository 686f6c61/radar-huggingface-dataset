# Sumeet1023/campus-grievance-distilbert

## Resumen

El modelo `Sumeet1023/campus-grievance-distilbert` es un clasificador de texto basado en DistilBERT, diseñado para la categorización de quejas y reclamaciones en entornos universitarios. Ha sido desarrollado por el usuario Sumeet1023 y publicado en Hugging Face con el pipeline de `text-classification`. Su objetivo es automatizar la gestión de incidencias estudiantiles, asignando categorías o prioridades a las quejas para facilitar su derivación a los departamentos responsables.

Se trata de un modelo de tamaño reducido, con aproximadamente 66,96 millones de parámetros, lo que lo hace adecuado para despliegues con recursos limitados. Al estar basado en DistilBERT, hereda la arquitectura de transformer encoder de BERT pero con un 40 % menos de parámetros y una inferencia más rápida, manteniendo un 97 % de las capacidades lingüísticas del modelo original. La información pública disponible es escasa: la model card está prácticamente vacía, sin detalles sobre el dataset de entrenamiento, el proceso de fine-tuning o las métricas de evaluación. Esto limita la reproducibilidad y la confianza en su rendimiento real.

A pesar de estas carencias documentales, el modelo responde a una necesidad práctica en el ámbito académico: la clasificación automática de quejas en campus universitarios. Su relevancia radica en que ofrece una solución ligera y de bajo coste computacional para una tarea de NLP aplicada, aunque cualquier uso en producción debería ir precedido de una validación exhaustiva con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, destilacion de BERT) |
| Parametros totales | 66.955.779 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (probablemente ingles, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT publicada por Hugging Face en 2019. DistilBERT utiliza la misma arquitectura de transformer encoder que BERT, pero con la mitad de capas (6 en lugar de 12), manteniendo la dimension de ocultacion de 768 y 12 cabezas de atencion. El proceso de destilacion se realizo sobre el corpus de preentrenamiento de BERT (Wikipedia y BookCorpus) utilizando una funcion de perdida combinada de destilacion, de aprendizaje supervisado y de perdida coseno entre las representaciones ocultas del profesor y el alumno.

En cuanto al entrenamiento especifico de este modelo, no se dispone de informacion publica. La model card no indica el dataset de quejas utilizado, el numero de epocas, la tasa de aprendizaje, ni si se aplicaron tecnicas de aumento de datos o regularizacion adicional. Tampoco se especifica si el fine-tuning se realizo sobre una tarea de clasificacion multiclase o multilabel, ni el numero de categorias de quejas contempladas. Esta falta de transparencia es una limitacion importante para evaluar su idoneidad en entornos reales.

## Capacidades

- Clasificacion de texto: el modelo esta orientado a la clasificacion de quejas o reclamaciones, probablemente en categorias predefinidas (por ejemplo, infraestructura, academicas, administrativas, acoso, etc.), aunque no se han publicado las etiquetas exactas.
- Procesamiento de lenguaje natural general: al estar basado en DistilBERT, conserva capacidades de comprension del lenguaje para tareas de clasificacion, incluyendo manejo de contexto bidireccional y representaciones contextuales.
- Inferencia ligera: con 66 millones de parametros, es adecuado para entornos con recursos computacionales limitados, como CPUs o GPUs de gama baja.
- Integracion con transformers: compatible con la libreria `transformers` de Hugging Face, lo que facilita su uso en pipelines existentes.
- No se ha confirmado soporte para tool calling, agentes, razonamiento multi-paso, vision o audio. Es un modelo exclusivamente de texto y de una sola tarea (clasificacion).

## Casos de uso

- Gestion de quejas en universidades: el modelo puede integrarse en un sistema de tickets para clasificar automaticamente las quejas de estudiantes y derivarlas al departamento correspondiente (por ejemplo, mantenimiento, secretaria, servicios informaticos). Su tamano reducido permite ejecutarlo en servidores modestos o incluso en el edge.
- Analisis de encuestas de satisfaccion: las respuestas abiertas de encuestas estudiantiles pueden clasificarse por tema o sentimiento, facilitando la deteccion de problemas recurrentes en el campus.
- Moderacion de foros y redes sociales internas: clasificar publicaciones de estudiantes en categorias (queja, sugerencia, pregunta) para priorizar la atencion del personal administrativo.
- Automatizacion de correos electronicos: un sistema de correo institucional puede usar el modelo para etiquetar los mensajes entrantes como quejas, solicitudes o consultas, mejorando la eficiencia del equipo de atencion.
- Monitorizacion de redes sociales: clasificar menciones de la universidad en Twitter o Facebook para identificar quejas publicas y responder con rapidez.
- Investigacion academica: como punto de partida para experimentos de clasificacion de textos en el dominio educativo, permitiendo comparar con otros modelos de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision o recall sobre ningun conjunto de datos de evaluacion. Tampoco se ha comparado con otros clasificadores de quejas. Por tanto, no es posible cuantificar su rendimiento real sin una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 66 millones de parametros, la inferencia en FP32 requiere aproximadamente 268 MB de memoria para los pesos (66,96 M x 4 bytes). Con cuantizacion INT8, se reduciria a unos 67 MB. En la practica, con el overhead de activaciones y el tokenizador, se puede ejecutar en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, o incluso integradas como Intel Iris Xe). Para produccion con alto throughput, una T4 o A10 es suficiente.
- CPU: es viable ejecutar el modelo en CPU, con latencias de decenas de milisegundos por muestra en hardware moderno.
- Opciones de despliegue: compatible con `transformers` (Python), `ONNX Runtime`, `TensorRT`, y puede servirse con `FastAPI` o `Triton`. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, ya que estos se orientan a modelos generativos.
- Latencia y throughput estimados: no disponibles. Dependera del hardware y del batch size, pero en una GPU T4 se pueden esperar cientos de inferencias por segundo para secuencias cortas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sumeet1023/campus-grievance-distilbert | 66,96 M | 512 | Clasificacion de quejas | No disponible | Hugging Face |
| DistilBERT base (distilbert-base-uncased) | 66,96 M | 512 | Modelo base para fine-tuning | Apache 2.0 | Hugging Face |
| BERT base (bert-base-uncased) | 110 M | 512 | Modelo base para fine-tuning | Apache 2.0 | Hugging Face |
| RoBERTa base (roberta-base) | 125 M | 512 | Modelo base para fine-tuning | MIT | Hugging Face |

La comparativa se limita a los modelos base porque no se dispone de otros clasificadores de quejas publicados con los mismos datos. El modelo en cuestion es un fine-tune de DistilBERT, por lo que su rendimiento dependera del dataset de entrenamiento, que no ha sido documentado. En terminos de tamano, es comparable a DistilBERT base, pero su licencia y su rendimiento especifico son desconocidos.

## Limitaciones y advertencias

- Model card incompleta: no se proporciona informacion sobre el dataset de entrenamiento, las etiquetas de clasificacion, el proceso de fine-tuning ni las metricas de evaluacion. Esto impide evaluar su calidad y reproducibilidad.
- Sesgos potenciales: al ser un fine-tune de DistilBERT, puede heredar sesgos presentes en el corpus de preentrenamiento (Wikipedia y BookCorpus), asi como sesgos introducidos por el dataset de quejas utilizado, que no se ha descrito.
- Riesgo de alucinacion: aunque es un modelo de clasificacion y no genera texto libre, puede asignar categorias incorrectas a quejas ambiguas o fuera del dominio de entrenamiento.
- Limitaciones de idioma: no se ha especificado el idioma de entrenamiento. Si el dataset de quejas estaba en ingles, el modelo no funcionara bien con textos en otros idiomas.
- Restricciones de licencia: la licencia no esta disponible, lo que genera incertidumbre legal para uso comercial o redistribucion. Se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Dominio limitado: esta disenado exclusivamente para clasificacion de quejas en campus; no es util para otras tareas de NLP como generacion, traduccion o extraccion de informacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sumeet1023/campus-grievance-distilbert
- Documentacion de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper de DistilBERT (arXiv): https://arxiv.org/abs/1910.01108
- Repositorio de ejemplo de clasificador de quejas (no oficial): https://github.com/yugops/ai-grievance-classifier
- Sistema de monitorizacion de quejas con DistilBERT (no oficial): https://github.com/Syed-ZeeshanGit/grievance-monitoring-ml-system

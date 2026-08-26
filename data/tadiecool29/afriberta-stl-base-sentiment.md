# tadiecool29/afriberta-stl-base-sentiment

## Resumen

El modelo `afriberta-stl-base-sentiment` es un ajuste fino (fine-tuning) del modelo multilingüe AfriBERTa base, desarrollado por el usuario tadiecool29. AfriBERTa es un transformer encoder preentrenado específicamente para lenguas africanas de bajos recursos, con aproximadamente 111 millones de parámetros. Este fine-tuning se ha realizado para la tarea de análisis de sentimiento, es decir, clasificar textos según su polaridad (positiva, negativa o neutral). El modelo se publica con formato safetensors y está pensado para su uso con la librería Transformers de Hugging Face.

La relevancia de este modelo radica en que aborda una tarea de procesamiento del lenguaje natural (PLN) en un dominio lingüístico poco cubierto por los modelos comerciales, como son las lenguas africanas. Al partir de AfriBERTa, que ya ha sido entrenado con datos de estas lenguas, el fine-tuning para sentimiento permite obtener un clasificador específico sin necesidad de entrenar desde cero. Sin embargo, la información pública es limitada: no se especifica el dataset de entrenamiento ni la licencia, y las métricas de evaluación son modestas (F1 de 0,71), lo que sugiere que el modelo puede ser útil como punto de partida, pero requiere validación adicional para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT, basado en AfriBERTa base) |
| Parametros totales | 111.457.539 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base AfriBERTa soporta lenguas africanas, pero no se especifica para este fine-tuning) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, `castorini/afriberta_base`, es un transformer encoder con 8 capas, 6 cabezas de atención, 768 unidades ocultas y un tamaño de feed-forward de 3072. Fue preentrenado con un enfoque de enmascarado (masked language modeling) sobre un corpus multilingüe de lenguas africanas de bajos recursos, como swahili, yoruba, igbo, entre otras. El fine-tuning para análisis de sentimiento se realizó sobre un dataset no especificado (indicado como "None" en la model card), con los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 16, batch size de evaluación de 32, optimizador AdamW, scheduler de tipo coseno con 300 pasos de warmup, y 6 épocas. Se utilizó entrenamiento con precisión mixta (Native AMP). No se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Clasificación de sentimiento: el modelo asigna una etiqueta de polaridad (positiva, negativa o neutral) a un texto de entrada. Es la capacidad principal y la única documentada.
- Procesamiento de lenguas africanas: al derivar de AfriBERTa, conserva la capacidad de representar texto en lenguas africanas de bajos recursos, aunque no se especifica qué lenguas concretas cubre este fine-tuning.
- Inferencia ligera: con solo 111 millones de parámetros, el modelo es adecuado para entornos con recursos limitados, como CPUs o GPUs de gama baja.
- Integración con Transformers: al estar publicado en formato safetensors y ser compatible con la librería Transformers, se puede cargar fácilmente con `AutoModelForSequenceClassification` y usar en pipelines de clasificación.

No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso. Es un modelo exclusivamente de clasificación.

## Casos de uso

- Análisis de opiniones en redes sociales: el modelo puede clasificar comentarios o publicaciones en lenguas africanas para medir la opinión pública sobre productos, servicios o eventos. Se usaría cargando el modelo con `pipeline("sentiment-analysis")` y pasando los textos, lo que permite procesar grandes volúmenes de datos de forma eficiente.
- Moderación de contenido en plataformas digitales: para detectar mensajes con sentimiento negativo (por ejemplo, discursos de odio o quejas) en foros o chats que operan en lenguas africanas. El modelo puede integrarse en un sistema de moderación automática que priorice la revisión humana de los casos más extremos.
- Monitoreo de marca: empresas que operan en mercados africanos pueden usar el modelo para rastrear menciones de su marca en medios sociales y clasificar el tono de las conversaciones, ayudando a identificar crisis de reputación tempranamente.
- Investigación académica en PLN para lenguas de bajos recursos: investigadores pueden utilizar este modelo como baseline o componente en estudios sobre análisis de sentimiento en lenguas africanas, comparando su rendimiento con otros enfoques.
- Asistencia a servicios de atención al cliente: el modelo puede preclasificar los mensajes entrantes de clientes según su estado de ánimo, permitiendo enrutar los casos más urgentes (por ejemplo, quejas fuertes) a agentes especializados.
- Análisis de noticias y artículos: para clasificar el tono de artículos periodísticos o blogs en lenguas africanas, útil para estudios de medios o para alimentar sistemas de recomendación de contenido.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición de dicho conjunto):

| Metrica | Valor |
|---|---|
| Loss | 0,8213 |
| Precision (sentimiento) | 0,7191 |
| Recall (sentimiento) | 0,7099 |
| F1 | 0,7111 |
| Accuracy (sentimiento) | 0,7161 |

No se proporcionan comparaciones con otros modelos ni resultados en benchmarks estandarizados como MMLU, HumanEval o GLUE. Los valores indican un rendimiento moderado, típico de un modelo pequeño entrenado con un dataset limitado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 111 millones de parámetros, el modelo en FP32 ocupa aproximadamente 445 MB de memoria. En FP16, unos 222 MB. Por tanto, cabe en cualquier GPU con al menos 1 GB de VRAM, y también puede ejecutarse en CPU con memoria RAM suficiente (alrededor de 1 GB para el modelo y los tensores).
- GPU recomendadas: cualquier GPU consumer moderna, como una NVIDIA GTX 1050 Ti (4 GB) o superior, es suficiente. Incluso una Raspberry Pi con suficiente RAM podría ejecutar inferencia, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI, o mediante la API de Hug Face Inference Endpoints. También se puede exportar a ONNX o TensorRT para optimización. Para entornos ligeros, se puede convertir a GGUF y usar con llama.cpp u Ollama, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 3090), la inferencia para un texto corto debería ser del orden de milisegundos, permitiendo cientos de peticiones por segundo. En CPU, la latencia puede ser de decenas de milisegundos por texto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de análisis de sentimiento para lenguas africanas. El modelo base AfriBERTa tiene una variante `afriberta_large` con más parámetros, pero no se han publicado comparaciones de rendimiento entre este fine-tuning y otros clasificadores. Se recomienda al usuario evaluar el modelo en su propio conjunto de datos antes de adoptarlo.

## Limitaciones y advertencias

- Dataset de entrenamiento no especificado: la model card indica "None dataset", lo que impide conocer la procedencia, el tamaño y la calidad de los datos de entrenamiento. Esto genera incertidumbre sobre la generalización del modelo.
- Rendimiento moderado: las métricas de evaluación (F1 de 0,71) son relativamente bajas, lo que puede deberse a un dataset pequeño o desequilibrado. No se recomienda su uso en aplicaciones críticas sin una evaluación adicional.
- Sesgos potenciales: al ser un fine-tuning de un modelo preentrenado en lenguas africanas, puede heredar sesgos presentes en los datos de preentrenamiento. Además, el dataset de fine-tuning, al no estar documentado, podría introducir sesgos adicionales.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, por lo que el riesgo de alucinación es bajo. Sin embargo, puede producir clasificaciones erróneas en textos ambiguos o fuera del dominio de entrenamiento.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar el uso comercial. Se recomienda contactar con el autor antes de utilizarlo en proyectos comerciales.
- Cobertura lingüística limitada: aunque AfriBERTa cubre varias lenguas africanas, no se especifica cuáles están soportadas en este fine-tuning. Es posible que el modelo tenga un rendimiento muy desigual entre lenguas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/afriberta-stl-base-sentiment
- Modelo base AfriBERTa: https://huggingface.co/castorini/afriberta_base
- Repositorio de AfriBERTa (GitHub): https://github.com/castorini/afriberta

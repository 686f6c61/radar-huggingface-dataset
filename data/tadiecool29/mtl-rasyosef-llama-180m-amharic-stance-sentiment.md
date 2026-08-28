# tadiecool29/MTL-rasyosef-Llama-180M-Amharic-stance-sentiment

## Resumen

El modelo MTL-rasyosef-Llama-180M-Amharic-stance-sentiment es un ajuste fino (fine-tune) del modelo base rasyosef/Llama-3.2-180M-Amharic, un decoder transformer de 180 millones de parámetros preentrenado desde cero sobre 274 millones de tokens de texto en amárico. Este ajuste se ha realizado para abordar dos tareas de procesamiento del lenguaje natural en amárico: detección de postura (stance detection) y análisis de sentimiento (sentiment analysis). El modelo ha sido desarrollado por el usuario tadiecool29 y está publicado en Hugging Face con licencia no especificada.

La relevancia de este modelo radica en que el amárico es una lengua etíope con escasos recursos lingüísticos computacionales, y este ajuste proporciona una herramienta específica para analizar opiniones y posiciones en textos amáricos. Al estar basado en una arquitectura Llama 3.2 compacta, requiere pocos recursos de hardware y puede desplegarse en entornos modestos. El contexto máximo no se ha documentado explícitamente para este ajuste, aunque el modelo base declara una ventana de 1024 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer (estilo Llama 3.2) |
| Parametros totales | 180.332.551 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (el modelo base declara 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base está entrenado en amárico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de rasyosef/Llama-3.2-180M-Amharic, una versión reducida del Llama-3.2-1B de Meta, preentrenada desde cero durante 26 horas en una GPU A100 de 40 GB con 274 millones de tokens de texto amárico. La arquitectura es un transformer decoder estándar con atención causal, sin mezcla de expertos ni mecanismos híbridos. El ajuste fino se realizó con el framework Transformers de Hugging Face, utilizando un optimizador AdamW con tasa de aprendizaje de 2e-05, programación de tasa coseno con 300 pasos de calentamiento, tamaño de lote efectivo de 8 (tras acumulación de gradientes) y 3 épocas completas. El conjunto de datos de entrenamiento no se ha documentado públicamente.

La innovación principal de este ajuste es la multitarea: el modelo se entrena simultáneamente para predecir la postura (a favor, en contra, neutro) y el sentimiento (positivo, negativo, neutro) de un texto. No se mencionan técnicas adicionales como RLHF o DPO, y el modelo se presenta como un clasificador de secuencias, no como un generador conversacional.

## Capacidades

- Detección de postura (stance detection): clasifica si un texto expresa una posición a favor, en contra o neutral respecto a un tema.
- Análisis de sentimiento (sentiment analysis): clasifica la polaridad emocional del texto en positivo, negativo o neutro.
- Procesamiento de texto en amárico: al estar basado en un modelo preentrenado en amárico, puede procesar textos en esta lengua.
- Salida de clasificación multitarea: genera simultáneamente las dos etiquetas (postura y sentimiento) para cada entrada.
- No se han documentado capacidades de generación de texto, tool calling, agentes, visión o audio.

## Casos de uso

- Monitorización de redes sociales en amárico: el modelo puede analizar publicaciones de Twitter, Facebook o foros etíopes para detectar la opinión pública sobre temas políticos o sociales, clasificando cada mensaje por postura y sentimiento.
- Análisis de reseñas de productos y servicios: en comercios electrónicos locales, permite clasificar automáticamente las reseñas de clientes en amárico para identificar satisfacción o quejas recurrentes.
- Investigación sociológica y política: los investigadores pueden aplicar el modelo a corpus de noticias o discursos para estudiar la polarización y las posturas en debates públicos etíopes.
- Servicios de atención al cliente: integrado en un sistema de tickets, puede priorizar quejas con sentimiento muy negativo y detectar posturas de cancelación o abandono.
- Análisis de encuestas abiertas: en estudios de mercado, las respuestas abiertas en amárico pueden clasificarse automáticamente para extraer tendencias de opinión.
- Moderación de contenidos: en plataformas de comentarios, el modelo puede señalar mensajes con sentimiento extremo o posturas agresivas para su revisión humana.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición del conjunto):

| Metrica | Valor |
|---|---|
| Pérdida (loss) | 1.9512 |
| F1 de postura | 0.7659 |
| F1 de sentimiento | 0.7327 |
| F1 global | 0.7493 |
| Exactitud de postura | 0.7556 |
| Exactitud de sentimiento | 0.7382 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El campo `model-index` de la model card aparece vacío, por lo que no hay benchmarks oficiales adicionales.

## Requisitos de hardware

- Al tratarse de un modelo de 180 millones de parámetros, la inferencia es muy ligera. En precisión FP32, el peso del modelo ocupa aproximadamente 720 MB, por lo que cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- Puede ejecutarse en CPU con memoria RAM suficiente (2-4 GB) sin problemas de latencia notables para clasificación de frases cortas.
- Es compatible con GPUs de consumo como NVIDIA GTX 1060, RTX 2060, RTX 3060, o incluso integradas de gama alta.
- Para despliegue en producción, se puede usar Hugging Face Transformers directamente, o servidores de inferencia como vLLM, TGI o llama.cpp (si se convierte a GGUF).
- No se han publicado mediciones de latencia o throughput específicas, pero para un modelo de este tamaño se esperan tiempos de inferencia inferiores a 10 ms por lote pequeño en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MTL-rasyosef-Llama-180M-Amharic-stance-sentiment (este) | 180M | no disponible | stance + sentimiento | no disponible | Hugging Face |
| rasyosef/Llama-3.2-180M-Amharic (base) | 180M | 1024 | modelo base (generación) | no disponible | Hugging Face |
| rasyosef/Llama-3.2-180M-Amharic-Instruct | 180M | 1024 | instrucciones | no disponible | Hugging Face |

No se dispone de otros modelos comparables de análisis de sentimiento en amárico en la información recopilada. La comparación con el modelo base muestra que este ajuste añade la capacidad de clasificación multitarea, mientras que el base es un modelo generativo sin supervisión.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no se ha documentado, lo que impide evaluar posibles sesgos o la representatividad de los dominios cubiertos.
- Las métricas reportadas provienen de un único conjunto de evaluación no descrito; no hay validación externa ni benchmarks independientes.
- El modelo solo está orientado al amárico; no es adecuado para otros idiomas.
- No se ha especificado la licencia, por lo que su uso comercial conlleva incertidumbre legal.
- La ventana de contexto no está confirmada para este ajuste; si se mantiene la del modelo base (1024 tokens), textos más largos requerirán truncamiento.
- No se han realizado pruebas de robustez frente a texto adversarial o ruido.
- Al ser un modelo pequeño, su precisión es limitada en comparación con modelos de mayor tamaño; puede fallar en matices lingüísticos complejos o sarcasmo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/MTL-rasyosef-Llama-180M-Amharic-stance-sentiment
- Modelo base: https://huggingface.co/rasyosef/Llama-3.2-180M-Amharic
- Modelo base instruct: https://huggingface.co/rasyosef/Llama-3.2-180M-Amharic-Instruct
- Repositorio de demostración del modelo base: https://github.com/rasyosef/llama-3.2-amharic

# twuan/AU-Guided-FER

## Resumen

AU-Guided-FER es un framework de reconocimiento de expresiones faciales (FER, por sus siglas en inglés) guiado por unidades de acción (Action Units, AU), desarrollado por el investigador twuan (cuenta de HuggingFace) y publicado también bajo el nombre de wuanhi en GitHub. El modelo aborda el problema del sesgo de anotación entre distintos conjuntos de datos de FER mediante un enfoque de adaptación de dominio no supervisada denominado AdaFER, que utiliza la detección de AUs como información objetiva y transversal para alinear los dominios de origen y destino.

La relevancia de este modelo radica en que las expresiones faciales son el resultado de combinaciones de AUs, que son movimientos musculares faciales objetivos y medibles. Al guiar el aprendizaje con AUs, el sistema mejora la generalización entre datasets con diferentes etiquetas de emoción, un problema habitual en la práctica. El repositorio de HuggingFace contiene los pesos del modelo (1,8 GB) con licencia MIT, aunque la model card es mínima y no especifica arquitectura, tamaño de parámetros ni detalles de entrenamiento. La información técnica disponible proviene principalmente del artículo de arXiv (2012.10078) y de la publicación en MDPI Applied Sciences (2022).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (framework AdaFER basado en redes neuronales convolucionales, segun el paper) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o binarios de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El framework AdaFER propuesto en el paper de 2020 (arXiv:2012.10078) se compone de dos modulos principales: un detector de AUs avanzado que se aplica tanto al dominio fuente como al destino, y un clasificador de expresiones faciales que se entrena de forma adversaria para alinear las representaciones entre dominios. La idea central es que las AUs son universales y no dependen del dataset, por lo que sirven como puente para reducir el sesgo de anotacion entre conjuntos de datos como FER2013, AffectNet o RAF-DB. El entrenamiento es no supervisado en el dominio destino, es decir, no se utilizan etiquetas de emocion en el conjunto de destino, solo en el fuente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que se trata de un modelo de vision clasico.

## Capacidades

- Reconocimiento de expresiones faciales en imagenes, clasificando emociones basicas (alegria, tristeza, enfado, sorpresa, miedo, asco, neutral) u otras categorias segun el dataset de entrenamiento.
- Deteccion de unidades de accion (AUs) faciales, que son los movimientos musculares individuales que componen las expresiones.
- Adaptacion de dominio no supervisada: el modelo puede transferir conocimiento entre datasets de FER con diferentes distribuciones de etiquetas sin necesidad de anotar el conjunto de destino.
- Alineacion de representaciones entre dominios mediante aprendizaje adversarial, lo que mejora la robustez frente a variaciones de iluminacion, pose y etnia.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Analisis de emociones en video vigilancia: el modelo puede integrarse en sistemas de seguridad para detectar estados emocionales de personas en tiempo real, aprovechando su capacidad de adaptarse a nuevos entornos sin reentrenamiento manual.
- Evaluacion de experiencia de usuario (UX): en pruebas de usabilidad, se puede usar para medir reacciones faciales de usuarios ante interfaces o productos, clasificando expresiones de satisfaccion o frustracion.
- Investigacion en psicologia y neurociencia: los investigadores pueden emplear el modelo para anotar automaticamente expresiones faciales en estudios de comportamiento, reduciendo el esfuerzo de codificacion manual.
- Sistemas de recomendacion adaptativa: en plataformas de contenido, el modelo puede inferir el estado emocional del usuario a partir de la camara y ajustar las recomendaciones (por ejemplo, sugerir contenido mas alegre si se detecta tristeza).
- Automatizacion de atencion al cliente: integrado en quioscos o aplicaciones de soporte, puede detectar si el cliente esta enfadado o confundido y derivar la conversacion a un agente humano.
- Analisis de publicidad y marketing: las empresas pueden medir la reaccion emocional de los consumidores ante anuncios o productos en estudios de mercado, utilizando el modelo para procesar grabaciones de sesiones de visionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arXiv y el articulo de MDPI reportan experimentos en datasets como FER2013, RAF-DB y AffectNet, pero no se incluyen cifras concretas en los materiales accesibles desde la ficha de HuggingFace. Se recomienda consultar el articulo original para obtener metricas detalladas de precision y comparaciones con otros metodos.

## Requisitos de hardware

- Tamano del repositorio: 1,8 GB, lo que sugiere que los pesos del modelo ocupan aproximadamente esa cantidad en disco. Para inferencia, se estima que la VRAM necesaria ronda entre 2 y 4 GB si se usa una cuantizacion de 16 bits, y menos de 2 GB con cuantizacion de 8 bits, aunque no se ha confirmado el formato de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 2060 o superior. En el caso de GPUs de datacenter, una A100 o V100 seria suficiente para procesamiento por lotes.
- Si cabe en consumer GPU: si, en la mayoria de las GPUs modernas de consumo, siempre que se gestione la memoria adecuadamente.
- Opciones de despliegue: al ser un modelo de vision, se puede servir con frameworks como TorchServe, ONNX Runtime o TensorFlow Serving. No se ha documentado soporte para vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependera de la resolucion de entrada y del hardware utilizado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AU-Guided-FER (este) | FER con AUs y adaptacion de dominio | no disponible | no aplica | MIT | HuggingFace, GitHub |
| EmoNeXt-FER-Optimized (del mismo autor) | FER basado en arquitectura NeXt | no disponible | no aplica | MIT | HuggingFace |
| Modelos clasicos de FER (VGG, ResNet fine-tuned) | FER supervisado | 20-50 M | no aplica | variada | multiples repos |

No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada. La comparativa se limita a aspectos cualitativos: AU-Guided-FER destaca por su capacidad de adaptacion de dominio, mientras que los modelos clasicos requieren reentrenamiento o fine-tuning por dataset.

## Limitaciones y advertencias

- Sesgos conocidos: los modelos de reconocimiento de expresiones faciales suelen estar sesgados hacia ciertas etnias, generos y rangos de edad debido a la composicion de los datasets de entrenamiento. No se ha documentado una mitigacion especifica en este modelo.
- Riesgo de alucinacion: al ser un modelo discriminativo de vision, no genera texto, por lo que el riesgo de alucinacion es bajo, pero puede producir falsos positivos en la deteccion de emociones en imagenes ambiguas o de baja calidad.
- Limitaciones de contexto: el modelo esta disenado para imagenes estaticas o secuencias de video, no para texto. No soporta entradas multimodales mas alla de la imagen.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero no se incluyen garantias. Es responsabilidad del usuario verificar que los datos de entrenamiento no infrinjan derechos de terceros.
- Caveat para produccion: la adaptacion de dominio no supervisada puede fallar si el dominio destino es muy diferente del fuente (por ejemplo, imagenes de baja resolucion o condiciones extremas de iluminacion). Se recomienda validar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/twuan/AU-Guided-FER
- GitHub (repositorio del codigo): https://github.com/wuanhi/AU-Guided-FER
- Paper en arXiv: https://arxiv.org/abs/2012.10078
- Articulo en MDPI Applied Sciences: https://www.mdpi.com/2076-3417/12/9/4366
- Modelo relacionado del mismo autor: https://huggingface.co/twuan/EmoNeXt-FER-Optimized

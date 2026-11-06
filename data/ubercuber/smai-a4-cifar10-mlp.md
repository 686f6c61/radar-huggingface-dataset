# UberCuber/smai-a4-cifar10-mlp

## Resumen

El modelo `UberCuber/smai-a4-cifar10-mlp` es un clasificador de imagenes de tipo perceptron multicapa (MLP) entrenado sobre el conjunto de datos CIFAR-10. Lo desarrolla el usuario UberCuber como entrega para la asignacion 4 de la asignatura SMAI (Question 1, seccion 1.5), por lo que se trata de un artefacto academico y no de un modelo pensado para produccion. Su arquitectura es una red totalmente conectada de tres capas ocultas de pequeno tamano que recibe las imagenes aplanadas (32x32x3 = 3072 caracteristicas) y produce logits para las 10 clases del dataset.

El modelo tiene 402.250 parametros y se entrena con descenso de gradiente estocastico (SGD) durante 100 epocas, con inicializacion He Normal y activacion ReLU en las capas ocultas. No incorpora convoluciones, atencion ni ningun componente de contexto: es un MLP puro sobre pixeles aplanados y estandarizados. Su relevancia es exclusivamente docente, como referencia de linea base para comparar con arquitecturas convolucionales o transformers de vision en CIFAR-10.

Los resultados publicados en la model card son modestos: 0,8507 de precision en entrenamiento y 0,4518 en test, lo que refleja el sobreajuste tipico de un MLP sin regularizacion sobre imagenes y su limitacion estructural para capturar patrones espaciales. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) totalmente conectado, `[3072, 128, 64, 10]` |
| Parametros totales | 402.250 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (no se documentan cuantizaciones) |
| Idiomas soportados | Ingles (etiqueta `en`; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (no se especifica safetensors ni GGUF; el repo figura con 0,0 GB) |

## Arquitectura y entrenamiento

La red es un MLP de tres capas: entrada de 3072 dimensiones (imagen CIFAR-10 aplanada de 32x32x3), dos capas ocultas de 128 y 64 neuronas con activacion ReLU, y una capa de salida de 10 neuronas con activacion lineal que produce logits, entrenada con perdida de entropia cruzada categorica (CCE). La inicializacion es He Normal con desviacion estandar `sqrt(2 / n_in)` y sesgos a cero. El optimizador es SGD con tasa de aprendizaje 0,05, tamano de lote 64 y 100 epocas.

El preprocesado parte del dataset `uoft-cs/cifar10`, con una particion propia de 70% entrenamiento (35.000 imagenes), 15% validacion (7.500) y 15% test (7.500), usando una semilla derivada del numero de matricula (`roll_number % 100000 = 1114`). Las imagenes se aplanan a 3072 caracteristicas y se estandarizan por caracteristica (media cero y varianza unitaria) calculando las estadisticas sobre el conjunto de entrenamiento en `float64`. No se documenta uso de aumento de datos, regularizacion, RLHF/DPO ni ninguna innovacion tecnica adicional; tampoco se especifican el numero de tokens de entrenamiento (no aplica) ni la composicion del dataset mas alla de CIFAR-10.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion).
- Inferencia sobre imagenes de 32x32 pixeles RGB preprocesadas y aplanadas.
- Salida de logits por clase (sin capa softmax en el modelo; la probabilidad se obtiene aplicando softmax externamente).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo de razonamiento (thinking mode), vision avanzada, audio ni otras capacidades especiales.
- No soporta imagenes de resolucion distinta de 32x32 sin redimensionado y aplanado previos.

## Casos de uso

- Linea base academica en CIFAR-10: sirve para comparar el rendimiento de un MLP simple (45,18% de precision en test) frente a CNN y transformers de vision en el mismo dataset, cuantificando la mejora que aporta la convolucion.
- Docencia de aprendizaje profundo: permite ilustrar conceptos de aplanado de imagenes, estandarizacion por caracteristica, inicializacion He Normal y sobreajuste (85,07% en train frente a 45,18% en test).
- Pruebas de infraestructura de entrenamiento: por su tamano reducido (402.250 parametros) y su bajo coste computacional, es util para validar pipelines de PyTorch, particiones de datos y semillas reproducibles.
- Reproduccion de experimentos de asignatura: la semilla documentada (`1114`) y la particion 70/15/15 permiten replicar exactamente los resultados de la entrega.
- Ejemplo de preprocesado en `float64`: util como referencia de como calcular estadisticas de normalizacion sobre el conjunto de entrenamiento sin fuga de datos.
- Prototipado rapido en CPU: al no requerir GPU, puede ejecutarse en cualquier maquina para pruebas de integracion de un clasificador de 10 clases.
- Comparacion de funciones de perdida e inicializacion: sirve como punto de partida para experimentar con otras inicializaciones u optimizadores manteniendo la misma arquitectura.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las precisiones de entrenamiento y test sobre la particion propia del autor:

| Metrica | Valor |
|---|---|
| Precision de entrenamiento | 0,8507 |
| Precision de test | 0,4518 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje ni un clasificador de proposito general. Tampoco se ofrecen comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision completa (402.250 parametros en float32 ocupan aproximadamente 1,6 MB; el resto corresponde a activaciones y buffers), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente, e incluso una CPU es adecuada.
- Cabe en GPU consumer: si, en todas las gamas actuales.
- Opciones de despliegue: PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por lote seria del orden de microsegundos a milisegundos en CPU y GPU moderna, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede contrastar con las arquitecturas habituales de CIFAR-10, aunque sin cifras de benchmark verificadas para este modelo:

| Modelo | Parametros | Contexto | Precision en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UberCuber/smai-a4-cifar10-mlp | 402.250 | No aplica | 45,18% (test, particion propia) | MIT | Hugging Face |
| CNN tipica de CIFAR-10 | No disponible | No aplica | No disponible | No disponible | No disponible |
| Vision Transformer pequeno | No disponible | No aplica | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Precision de test baja (45,18%) y gran brecha respecto a entrenamiento (85,07%), indicativo de sobreajuste severo y escasa capacidad de generalizacion.
- Al ser un MLP sobre pixeles aplanados, no explota la estructura espacial de las imagenes; su rendimiento queda muy por debajo de arquitecturas convolucionales.
- No se documentan sesgos especificos, pero al entrenarse solo con CIFAR-10 hereda los sesgos y desequilibrios de ese dataset.
- Riesgo de alucinacion no aplica (no genera texto), pero si de clasificaciones erroneas con alta confianza en clases visualmente similares.
- Limitacion de idioma: la etiqueta `en` es irrelevante para la tarea; el modelo no procesa lenguaje.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el modelo es un artefacto academico sin garantias de calidad para produccion.
- No se especifica el formato exacto de los pesos en el repositorio (0,0 GB), lo que puede dificultar la carga directa sin inspeccionar los ficheros.
- No recomendado para produccion: sin validacion externa, sin documentacion de robustez y con un pipeline de preprocesado muy especifico (aplanado y estandarizacion con estadisticas del train del autor).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UberCuber/smai-a4-cifar10-mlp
- Dataset CIFAR-10 en Hugging Face: https://huggingface.co/datasets/uoft-cs/cifar10

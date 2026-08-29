# zeromodels/regnet-x-320

## Resumen

`zeromodels/regnet-x-320` es una conversión pura a Keras 3 del checkpoint original `facebook/regnet-x-320`, un modelo de clasificación de imágenes y backbone de la familia RegNet desarrollada por Facebook AI (Meta). RegNet propone un espacio de diseño sistemático para redes convolucionales, donde el ancho y la profundidad de cada etapa siguen una regla lineal cuantizada, lo que permite obtener arquitecturas eficientes y escalables. Este modelo concreto, la variante X, utiliza un stem de convolución 3x3 con stride 2 y cuatro etapas de bloques residuales `1x1 -> 3x3 agrupado -> [SE] -> 1x1`.

La relevancia de esta conversión radica en que ofrece una única implementación en Keras 3 que puede ejecutarse sin modificaciones sobre TensorFlow, PyTorch o JAX, facilitando la portabilidad entre frameworks. El modelo está pensado para usarse como clasificador de ImageNet o como backbone de cuatro etapas para tareas de visión por computador, con soporte para extracción de características multiescala. El repositorio ocupa 0,4 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNet-X (CNN con bloques residuales, stem 3x3 stride 2, cuatro etapas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (implementacion Keras 3, probablemente .h5 o .keras) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RegNet-X descrita en el paper "Designing Network Design Spaces" (arXiv:2003.13678). Consiste en un stem de convolucion 3x3 con stride 2, seguido de cuatro etapas compuestas por bloques residuales de tipo `1x1 -> 3x3 agrupado -> [SE] -> 1x1`. La variante X no utiliza capas de squeeze-and-excitation (SE) en todas las etapas, a diferencia de la variante Y. El checkpoint original fue entrenado por Facebook AI para clasificacion de imagenes en ImageNet, aunque los detalles exactos del entrenamiento (numero de epocas, optimizador, etc.) no se incluyen en la informacion proporcionada.

La conversion a Keras 3 mantiene los pesos originales y permite cargar el modelo con `from_weights`, tanto como clasificador (`RegNetImageClassify`) como backbone (`RegNetModel`). La normalizacion de la entrada esta integrada en el modelo, por lo que se pueden pasar pixeles crudos en rango [0, 255]. Soporta tanto formato `channels_last` como `channels_first` de forma bit-exacta.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clases (por defecto, las 1000 clases de ImageNet).
- Extraccion de caracteristicas multiescala: como backbone, produce mapas de caracteristicas en strides 4, 8, 16 y 32, util para deteccion de objetos, segmentacion o tareas de vision de baja resolucion.
- Multi-backend: la misma implementacion corre en TensorFlow, PyTorch y JAX sin cambios de codigo, seleccionando el backend mediante la variable de entorno `KERAS_BACKEND`.
- Normalizacion integrada: acepta imagenes sin preprocesado adicional, simplificando el pipeline de inferencia.
- Compatibilidad con pesos originales: puede cargar directamente los checkpoints de `facebook/regnet-x-320` mediante `from_weights("hf:facebook/regnet-x-320")`.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede servir como clasificador de imagenes en aplicaciones web o moviles, devolviendo logits de las 1000 clases de ImageNet. Su tamano reducido (0,4 GB) permite desplegarlo en entornos con recursos limitados.
- Backbone para deteccion de objetos: al extraer caracteristicas en cuatro escalas, puede integrarse en arquitecturas como Faster R-CNN o YOLO para detectar objetos en imagenes, aprovechando su diseno eficiente.
- Segmentacion semantica: las caracteristicas multiescala del backbone son adecuadas para decodificadores de segmentacion (por ejemplo, U-Net o DeepLab), permitiendo segmentar objetos o regiones en imagenes medicas o de satelite.
- Extraccion de embeddings para busqueda visual: usando la salida de la penultima capa, se pueden generar vectores de caracteristicas para construir sistemas de busqueda por similitud o deduplicacion de imagenes.
- Transferencia de aprendizaje en dominios especificos: el modelo preentrenado en ImageNet puede fine-tuning en datasets pequenos (por ejemplo, clasificacion de defectos industriales o especies de plantas) con pocas epocas, gracias a su arquitectura regularizada.
- Prototipado rapido multiplataforma: al ser compatible con TensorFlow, PyTorch y JAX, los equipos pueden experimentar en un framework y desplegar en otro sin reescribir el modelo, ideal para entornos con restricciones de stack tecnologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo hereda el rendimiento del checkpoint original de Facebook, pero no se proporcionan metricas concretas (top-1/top-5 en ImageNet, etc.) en la documentacion de esta conversion.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de vision de tamano moderado (0,4 GB de pesos), la inferencia requiere menos de 1 GB de VRAM en precision FP32, y puede ejecutarse en CPU con tiempos de inferencia razonables para imagenes de 224x224.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, o incluso hardware integrado. Para entrenamiento o fine-tuning, se recomienda una GPU con 4-8 GB (por ejemplo, RTX 3060 o superior).
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: al ser un modelo Keras 3, puede servirse con TensorFlow Serving, TorchServe, o mediante frameworks de inferencia como ONNX Runtime (si se exporta). No hay soporte nativo para vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos especificos, pero para una imagen de 224x224, la inferencia en GPU moderna suele estar por debajo de 10 ms; en CPU puede rondar los 50-100 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RegNet-X-320 (este) | no disponible | no aplica | no publicado | Apache 2.0 | Hugging Face |
| ResNet-50 | ~25M | no aplica | top-1 ~76% en ImageNet (referencia) | Apache 2.0 | Ampliamente disponible |
| EfficientNet-B0 | ~5.3M | no aplica | top-1 ~77% en ImageNet (referencia) | Apache 2.0 | Ampliamente disponible |

Nota: los datos de rendimiento de ResNet-50 y EfficientNet-B0 son referencias generales de la literatura, no de esta conversion especifica. No se dispone de comparaciones directas con el modelo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce logits de clasificacion o caracteristicas; no genera imagenes ni texto.
- Sesgos de ImageNet: al estar preentrenado en ImageNet, puede heredar sesgos de las categorias y la distribucion de ese dataset (por ejemplo, sesgos de raza o genero en clases como "persona").
- Riesgo de alucinacion: no aplica, al no ser un modelo de lenguaje.
- Limitaciones de contexto: no procesa secuencias, solo imagenes de tamano fijo (por defecto 224x224). Para otras resoluciones, es necesario reescalar o adaptar la entrada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.
- Dependencia de Keras 3: el modelo requiere la libreria `zeromodels` y Keras 3, lo que puede limitar su uso en entornos con versiones antiguas de TensorFlow o PyTorch.
- Sin cuantizacion oficial: no se proporcionan pesos cuantizados, por lo que la inferencia en dispositivos de borde puede requerir conversion manual a formatos como TFLite o ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/regnet-x-320
- Modelo original de Facebook: https://huggingface.co/facebook/regnet-x-320
- Paper "Designing Network Design Spaces": https://arxiv.org/abs/2003.13678
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Coleccion de modelos RegNet en Hugging Face: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b

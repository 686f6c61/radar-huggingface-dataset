# zeromodels/regnet-y-120

## Resumen

`zeromodels/regnet-y-120` es una conversión a Keras 3 del modelo RegNet-Y-120 original de Meta AI (Facebook), publicada por el proyecto ZeroModels. RegNet es una familia de redes neuronales convolucionales (ConvNets) diseñada mediante un espacio de búsqueda de arquitecturas que sigue una regla cuantizada-lineal para los anchos y profundidades de cada etapa. La variante Y incorpora bloques de Squeeze-and-Excitation (SE), lo que mejora la precisión respecto a la variante X con un coste computacional adicional moderado.

El modelo se presenta como un clasificador de imágenes sobre ImageNet-1k y como backbone de cuatro etapas para tareas de visión por computador. Su relevancia actual radica en que ofrece una implementación unificada en Keras 3 que funciona sin modificaciones sobre TensorFlow, PyTorch y JAX, facilitando la portabilidad entre frameworks. El checkpoint pesa 0.2 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y de investigación sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RegNet-Y (ConvNet con bloques residuales 1x1 -> 3x3 agrupado -> SE -> 1x1, 4 etapas) |
| Parametros totales | no disponible (el repo no especifica el numero exacto; el checkpoint original de facebook/regnet-y-120 tiene aproximadamente 46 M, pero no se confirma en esta conversion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se mencionan cuantizaciones en la informacion) |
| Idiomas soportados | no aplica (clasificacion de imagenes, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (formato .keras o .h5, no especificado en la model card) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RegNet-Y descrita en el paper "Designing Network Design Spaces" (arXiv:2003.13678). Consiste en un stem de convolucion 3x3 con stride 2, seguido de cuatro etapas de bloques residuales compuestos por una convolucion 1x1, una convolucion 3x3 agrupada (grouped convolution), un bloque Squeeze-and-Excitation y una convolucion 1x1 final. Los anchos y profundidades de cada etapa se determinan mediante una regla cuantizada-lineal que define el espacio de diseno.

El checkpoint original fue entrenado en ImageNet-1k, un dataset de clasificacion con 1.28 millones de imagenes y 1000 clases. No se dispone de informacion detallada sobre el proceso de entrenamiento (epocas, optimizador, aumentacion de datos) en la conversion de ZeroModels. La conversion a Keras 3 mantiene los pesos originales y permite cargarlos directamente desde Hugging Face, con soporte para los backends JAX, PyTorch y TensorFlow. La normalizacion de la imagen esta integrada en el modelo, por lo que se pueden pasar pixeles en rango [0, 255] directamente.

## Capacidades

- Clasificacion de imagenes: devuelve logits de 1000 clases de ImageNet-1k.
- Extraccion de caracteristicas: como backbone, produce mapas de caracteristicas en cuatro escalas con strides 4, 8, 16 y 32, util para tareas de deteccion, segmentacion o metric learning.
- Multi-backend: funciona sin cambios en TensorFlow, PyTorch y JAX mediante Keras 3.
- Soporte de formatos de canal: acepta tanto `channels_last` como `channels_first` con resultados bit-exactos.
- Normalizacion integrada: no requiere preprocesado manual de los pixeles.
- Carga de pesos desde Hugging Face: tanto desde el repositorio de ZeroModels como desde el original de Facebook (`hf:facebook/regnet-y-120`).

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede servir como clasificador de imagenes en aplicaciones de moderacion de contenido, diagnostico visual o catalogacion de productos. Su tamano reducido (0.2 GB) permite desplegarlo en entornos con recursos limitados, como CPUs o GPUs de gama media.
- Backbone para deteccion de objetos: las caracteristicas multiescala (strides 4, 8, 16, 32) se pueden alimentar a cabezales de deteccion como Faster R-CNN o YOLO, aprovechando la representacion jerarquica del modelo.
- Segmentacion semantica: los mapas de caracteristicas de las cuatro etapas sirven como encoder en arquitecturas tipo U-Net o DeepLab, proporcionando un encoder ligero y bien estudiado.
- Extraccion de embeddings para busqueda visual: las caracteristicas de la ultima etapa pueden usarse como vectores de imagen para sistemas de recuperacion por similitud, gracias a la normalizacion integrada y la solidez del entrenamiento en ImageNet.
- Transferencia de aprendizaje en dominios especificos: al ser un modelo preentrenado en ImageNet, se puede fine-tuning en datasets pequenos de dominios como imagenes medicas, satelitales o industriales, con la ventaja de poder elegir el backend (JAX, TF, Torch) segun el ecosistema del proyecto.
- Prototipado rapido en investigacion: la implementacion unificada en Keras 3 permite comparar el rendimiento del mismo modelo en diferentes frameworks sin cambios de codigo, util para experimentos de reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de ZeroModels no incluye metricas de precision, latencia o throughput. El modelo original de Facebook reporta una precision top-1 de aproximadamente 79.4% en ImageNet-1k, pero este dato no se confirma en la conversion y no debe atribuirse a esta version sin verificacion.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de vision de 0.2 GB, la inferencia en FP32 requiere aproximadamente 0.8 GB de VRAM (peso del modelo + activaciones). Con cuantizacion a FP16 o INT8, el consumo se reduce a unos 0.4-0.5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. Tambien es viable en CPU para inferencia por lotes pequenos.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna, incluso en Raspberry Pi con limitaciones de memoria.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante frameworks de inferencia como ONNX Runtime (si se exporta). No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos. En una GPU media (RTX 3060), se espera una latencia de inferencia de unos 5-10 ms por imagen a 224x224, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision ImageNet (top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/regnet-y-120 | ~46 M (estimado) | no aplica | no disponible | Apache 2.0 | Hugging Face |
| facebook/regnet-y-120 | ~46 M | no aplica | ~79.4% (reportado por Meta) | Apache 2.0 | Hugging Face |
| ResNet-50 | 25.6 M | no aplica | ~76.1% | Apache 2.0 | Hugging Face |
| EfficientNet-B0 | 5.3 M | no aplica | ~77.1% | Apache 2.0 | Hugging Face |

La comparativa se basa en modelos de clasificacion de imagenes de tamano similar. Los datos de precision de RegNet-Y-120 provienen de la publicacion original de Meta, no de la conversion de ZeroModels. ResNet-50 y EfficientNet-B0 son alternativas clasicas con licencia permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado en ImageNet-1k, que contiene sesgos de representacion cultural y geografica. Puede tener un rendimiento inferior en categorias subrepresentadas o en imagenes de dominios no occidentales.
- Riesgo de alucinacion: no aplica directamente, al ser un clasificador, pero puede producir predicciones erroneas con alta confianza en clases no vistas o imagenes fuera de distribucion.
- Limitaciones de contexto: no procesa texto ni secuencias, por lo que no es adecuado para tareas de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia. No hay restricciones de uso militar o de vigilancia.
- Caveat de produccion: la conversion a Keras 3 no ha sido validada con benchmarks publicos; se recomienda verificar la precision en el dataset objetivo antes de desplegar en produccion.
- Dependencia de Keras 3: el modelo requiere la instalacion de `zeromodels` y Keras 3, lo que puede introducir incompatibilidades con versiones antiguas de TensorFlow o PyTorch.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zeromodels/regnet-y-120
- Modelo original de Facebook: https://huggingface.co/facebook/regnet-y-120
- Paper "Designing Network Design Spaces": https://arxiv.org/abs/2003.13678
- Pagina de papers en Hugging Face: https://huggingface.co/papers/2003.13678
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentacion de RegNet en ZeroModels: https://imvision12.github.io/ZeroModels/regnet/
- Coleccion de modelos RegNet en Hugging Face: https://huggingface.co/collections/zeromodels/regnet-6a9270a4e723a861ea988d0b

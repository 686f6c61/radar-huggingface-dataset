# zeromodels/pvt-v2-b0

## Resumen

PVTv2 (Pyramid Vision Transformer v2) es un backbone de visión por computadora basado en transformadores jerárquicos, presentado en el artículo "PVTv2: Improved Baselines with Pyramid Vision Transformer" (arXiv:2106.13797). El checkpoint `zeromodels/pvt-v2-b0` es una conversión pura en Keras 3 del modelo original `OpenGVLab/pvt_v2_b0`, desarrollada por el equipo de ZeroModels. Esta versión permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita su integración en entornos heterogéneos.

El modelo resuelve el problema de obtener representaciones visuales multiescala eficientes para tareas como clasificación, detección y segmentación. Con aproximadamente 3,7 millones de parámetros, es una opción ligera que alcanza un 70,5 % de precisión top-1 en ImageNet-1k. Su relevancia actual radica en que combina las ventajas de los transformadores con propiedades de las CNN (mediante parches solapados y capas convolucionales), sin necesidad de embeddings posicionales, lo que permite procesar resoluciones de entrada arbitrarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) con parches solapados, feed-forward convolucional y sin embeddings posicionales |
| Parametros totales | ~3,7 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (libreria zeromodels basada en Keras 3) |

## Arquitectura y entrenamiento

PVTv2 introduce tres mejoras clave sobre el PVT original: *overlapping patch embedding* (parches solapados que preservan la continuidad local), una red *feed-forward* convolucional (que incorpora información espacial en la fase de MLP) y la eliminación de los embeddings posicionales, lo que permite que el modelo acepte cualquier resolución de entrada. Además, existe una variante opcional con atención lineal para reducir el coste computacional en resoluciones altas.

El checkpoint `pvt-v2-b0` fue entrenado en ImageNet-1k, aunque la información disponible no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de visión supervisado de forma clásica. La conversión a Keras 3 mantiene los pesos originales de PyTorch y garantiza resultados bit-exactos entre los tres backends soportados.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clases a partir de una imagen de entrada (por defecto 224x224 píxeles).
- Extraccion de caracteristicas multiescala: mediante `PvtV2Model` con `as_backbone=True` se obtienen las salidas de las cuatro etapas del modelo, formando una piramide de caracteristicas util para deteccion y segmentacion.
- Resolucion de entrada arbitraria: al no usar embeddings posicionales, el modelo puede procesar imagenes de cualquier dimension sin reentrenamiento.
- Multi-backend: la implementacion en Keras 3 permite ejecutar el mismo codigo en TensorFlow, PyTorch y JAX sin cambios.
- Normalizacion integrada: el grafo incluye la normalizacion de los píxeles, por lo que se pueden pasar valores crudos en el rango [0, 255].
- Compatibilidad con checkpoints originales: se pueden cargar directamente los pesos de `OpenGVLab/pvt_v2_b0` mediante `from_weights("hf:OpenGVLab/pvt_v2_b0")`.

## Casos de uso

- Clasificacion de imagenes en produccion: al ser un modelo ligero (3,7 M de parametros), puede desplegarse en entornos con recursos limitados, como servidores sin GPU o dispositivos edge, manteniendo una precision razonable (70,5 % top-1 en ImageNet).
- Backbone para deteccion de objetos: la piramide de caracteristicas de cuatro etapas se puede conectar a cabezales como Faster R-CNN o RetinaNet, aprovechando la multiescala inherente del modelo.
- Segmentacion semantica: las caracteristicas de las distintas etapas sirven como encoder en arquitecturas tipo U-Net o DeepLab, beneficiandose de la resolucion arbitraria de entrada.
- Transfer learning en dominios especificos: se puede fine-tuning sobre datasets propios (por ejemplo, imagenes medicas o industriales) con un coste computacional bajo, gracias al tamano reducido del modelo.
- Prototipado rapido en investigacion: la implementacion multi-backend permite experimentar con el mismo modelo en JAX, TensorFlow o PyTorch sin reescribir codigo, acelerando la validacion de ideas.
- Sistemas de vision en tiempo real: su baja latencia (al ser un modelo pequeno) lo hace adecuado para aplicaciones de videovigilancia, control de calidad o robotica donde se requiere inferencia rapida.

## Benchmarks y rendimiento

La informacion disponible solo incluye el resultado en ImageNet-1k. La siguiente tabla recoge las variantes PVTv2 publicadas por ZeroModels, con sus respectivas precisiones top-1:

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-v2-b0 | 70,5 % |
| pvt-v2-b1 | 78,7 % |
| pvt-v2-b2 | 82,0 % |
| pvt-v2-b2-linear | 82,1 % |
| pvt-v2-b3 | 83,1 % |
| pvt-v2-b4 | 83,6 % |
| pvt-v2-b5 | 83,8 % |

No se han publicado resultados de benchmarks adicionales (como COCO o ADE20K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al tener solo ~3,7 millones de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32. Con cuantizacion a FP16 o INT8, el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas las de gama de entrada como NVIDIA GTX 1650 o superiores. Tambien se puede ejecutar en CPU sin problemas para inferencia por lotes pequenos.
- Compatibilidad con hardware de consumo: si, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y en placas como Raspberry Pi si se convierte a TFLite o TensorRT.
- Opciones de despliegue: al ser Keras 3, se puede exportar a SavedModel, TFLite, ONNX o TensorRT. Tambien se puede servir con TensorFlow Serving o mediante frameworks como FastAPI con el backend de PyTorch.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamano se espera una latencia inferior a 10 ms en GPU moderna para una imagen 224x224, y decenas de milisegundos en CPU.

## Comparativa con modelos similares

La comparativa se realiza con otras variantes de la misma familia PVTv2, ya que son los modelos mas directamente comparables en la informacion disponible:

| Modelo | Parametros | ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| pvt-v2-b0 | ~3,7 M | 70,5 % | Apache 2.0 | Hugging Face |
| pvt-v2-b1 | ~13,1 M | 78,7 % | Apache 2.0 | Hugging Face |
| pvt-v2-b2 | ~25,4 M | 82,0 % | Apache 2.0 | Hugging Face |
| pvt-v2-b5 | ~81,6 M | 83,8 % | Apache 2.0 | Hugging Face |

Frente a otros backbones ligeros como MobileNetV3 o EfficientNet-B0, no se dispone de datos comparativos en la informacion proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Precision moderada: con un 70,5 % de top-1 en ImageNet, es inferior a modelos mas grandes de la misma familia (por ejemplo, pvt-v2-b5 alcanza 83,8 %). No es adecuado para tareas que requieran una precision muy alta sin fine-tuning.
- Sesgos del dataset: al estar entrenado en ImageNet, puede heredar sesgos presentes en las clases y en las imagenes de ese dataset (por ejemplo, sesgos de genero, raza o contexto cultural en las categorias).
- Sin capacidades generativas: es un modelo de vision puro, no genera texto ni tiene capacidades multimodales.
- Riesgo de alucinacion: no aplica, al no ser un modelo de lenguaje.
- Limitaciones de contexto: al ser un modelo de vision, no procesa secuencias de texto; la "longitud de contexto" no es un concepto aplicable.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados.
- Dependencia de Keras 3: el modelo requiere la libreria `zeromodels` y Keras 3 para cargar los pesos; no es un checkpoint estandar de PyTorch o TensorFlow, aunque se pueden cargar los pesos originales de OpenGVLab.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/pvt-v2-b0
- Coleccion de modelos PVT y PVTv2: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Paper original (arXiv): https://arxiv.org/abs/2106.13797
- Paper en Hugging Face: https://huggingface.co/papers/2106.13797
- Repositorio oficial de PVT (GitHub): https://github.com/whai362/PVT
- Repositorio de ZeroModels (GitHub): https://github.com/IMvision12/ZeroModels
- Documentacion de PVTv2 en ZeroModels: https://imvision12.github.io/ZeroModels/pvt_v2/
- Documentacion de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Modelo original de OpenGVLab: https://huggingface.co/OpenGVLab/pvt_v2_b0
- Documentacion de PVTv2 en Transformers: https://huggingface.co/docs/transformers/model_doc/pvt_v2

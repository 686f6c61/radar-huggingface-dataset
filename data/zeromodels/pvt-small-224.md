# zeromodels/pvt-small-224

## Resumen

zeromodels/pvt-small-224 es una conversión pura a Keras 3 del checkpoint original Zetatech/pvt-small-224, que implementa el Pyramid Vision Transformer (PVT) descrito en el paper arXiv:2102.12122. PVT es un transformer de visión jerárquico diseñado como backbone versátil para tareas de predicción densa, que introduce la atención con reducción espacial (spatial-reduction attention) sobre parches no solapados y embeddings posicionales aprendidos. El modelo tiene aproximadamente 24,5 millones de parámetros y alcanza un top-1 del 79,8% en ImageNet-1k.

La relevancia de este modelo radica en que la implementación de zeromodels permite ejecutar el mismo checkpoint sin modificaciones sobre tres backends distintos: TensorFlow, PyTorch y JAX, gracias a Keras 3. Esto lo convierte en una opción interesante para equipos que trabajan con múltiples frameworks y necesitan un backbone de visión estándar con pesos ya entrenados. El repositorio incluye tanto la interfaz de clasificación de imágenes (PvtImageClassify) como la de extracción de características por etapas (PvtModel con as_backbone=True).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer (PVT), transformer jerárquico con atención de reducción espacial |
| Parametros totales | ~24,5 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (HDF5/weights), compatible con safetensors vía conversión; carga directa desde Hugging Face |

## Arquitectura y entrenamiento

PVT sigue una arquitectura de transformer jerárquico con cuatro etapas piramidales. Cada etapa opera sobre parches no solapados de tamaño variable y emplea atención con reducción espacial (spatial-reduction attention), que reduce la resolución de las claves y valores antes de la atención para disminuir el coste computacional. El modelo incorpora embeddings posicionales aprendidos y produce un mapa de características multiescala con cuatro niveles de resolución, lo que lo hace adecuado como backbone para tareas como detección de objetos, segmentación semántica o clasificación.

El checkpoint fue preentrenado en ImageNet-1k (ILSVRC2012), un dataset de aproximadamente 1 millón de imágenes y 1.000 clases, a resolución 224x224. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre el uso de técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica. La conversión de zeromodels no modifica los pesos originales; únicamente reimplementa la arquitectura en Keras 3 para que sea portable entre backends. La normalización de la imagen está integrada en el grafo, por lo que se deben pasar píxeles crudos en rango [0, 255].

## Capacidades

- Clasificación de imágenes: devuelve logits de clase para las 1.000 categorías de ImageNet-1k.
- Extracción de características multiescala: el modelo expone un mapa de características piramidal de cuatro etapas, útil como backbone para tareas densas.
- Compatibilidad multi-backend: el mismo checkpoint funciona en TensorFlow, PyTorch y JAX sin cambios en el código.
- Soporte de canales en formato channels_last y channels_first, con resultados bit-exactos en ambos.
- Carga directa de checkpoints originales de Hugging Face mediante el prefijo hf: (por ejemplo, hf:Zetatech/pvt-small-224).
- Normalización integrada en el grafo, lo que simplifica el preprocesado en producción.

## Casos de uso

- Backbone para detección de objetos: las características piramidales de cuatro etapas pueden alimentar cabezales como Faster R-CNN o RetinaNet, aprovechando la resolución multiescala para detectar objetos de distintos tamaños.
- Segmentación semántica: el mapa de características multiescala es adecuado para decodificadores tipo U-Net o FPN, permitiendo segmentar imágenes con detalle a diferentes escalas.
- Clasificación de imágenes en producción: con un top-1 del 79,8% en ImageNet-1k, sirve como modelo de referencia para tareas de clasificación genérica, con un coste computacional moderado.
- Extracción de embeddings visuales: las características de la última etapa pueden usarse como representación compacta para búsqueda de imágenes por similitud o clustering.
- Fine-tuning en dominios específicos: al ser un modelo preentrenado de tamaño medio (~24,5M de parámetros), es viable ajustarlo en datasets pequeños de dominios como medicina, agricultura o industria con una GPU de gama media.
- Experimentación multi-framework: equipos que migran entre TensorFlow, PyTorch y JAX pueden usar este checkpoint para mantener consistencia en sus pipelines de visión sin reimplementar la arquitectura.

## Benchmarks y rendimiento

El modelo alcanza un top-1 del 79,8% en ImageNet-1k. La siguiente tabla recoge los resultados de las variantes PVT disponibles en la colección de zeromodels:

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-tiny-224 | 75,1% |
| pvt-small-224 | 79,8% |
| pvt-medium-224 | 81,2% |
| pvt-large-224 | 81,7% |

No se han publicado resultados adicionales de benchmarks (COCO, ADE20K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~24,5M de parámetros, la inferencia en lotes pequeños requiere menos de 2 GB de VRAM en FP32; con cuantización a FP16 o INT8, cabe en GPUs con 1 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) es suficiente para inferencia y fine-tuning ligero. Para entrenamiento desde cero o fine-tuning con lotes grandes, se recomienda una RTX 3060 o superior.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como la RTX 3060, RTX 4060 o incluso en la mayoría de GPUs integradas para inferencia simple.
- Opciones de despliegue: al ser una implementación Keras 3, se puede servir con TensorFlow Serving, TorchServe o mediante exportación a TensorFlow Lite para edge. También es posible convertirlo a ONNX para usar con ONNX Runtime.
- Latencia y throughput: no disponible. Depende del backend elegido y del hardware; en una GPU moderna se espera una latencia de pocos milisegundos por imagen, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Top-1 ImageNet-1k | Licencia | Formato |
|---|---|---|---|---|
| zeromodels/pvt-small-224 | ~24,5M | 79,8% | Apache 2.0 | Keras 3 (multi-backend) |
| ViT-Small (DeiT-S) | ~22M | 79,8% | Apache 2.0 | PyTorch / JAX |
| Swin-Tiny | ~28M | 81,3% | MIT | PyTorch / JAX |

PVT-small ofrece un rendimiento comparable a DeiT-S con un diseño jerárquico que facilita su uso como backbone denso, mientras que Swin-Tiny supera ligeramente en precisión a costa de más parámetros. La ventaja diferencial de la versión de zeromodels es su portabilidad entre backends, algo que no ofrecen las implementaciones nativas de DeiT o Swin.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet-1k, el modelo puede presentar sesgos hacia las categorías y estilos visuales de ese dataset, con menor precisión en dominios no representados.
- Riesgo de alucinación: en tareas de clasificación, el modelo puede asignar confianza alta a clases incorrectas en imágenes fuera de distribución; se recomienda calibrar la salida con softmax y umbrales de confianza.
- Limitaciones de contexto: al ser un modelo de visión, no procesa texto ni soporta instrucciones en lenguaje natural; su entrada está restringida a imágenes de 224x224 píxeles.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribución correspondiente.
- Caveat de producción: la normalización está integrada en el grafo, por lo que pasar imágenes ya normalizadas producirá resultados incorrectos; hay que usar píxeles crudos en [0, 255].
- Dependencia de Keras 3: el modelo requiere la librería zeromodels y Keras 3; no es un checkpoint estándar de PyTorch o TensorFlow, lo que puede limitar su integración en pipelines existentes sin esa dependencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zeromodels/pvt-small-224
- Paper original: https://arxiv.org/abs/2102.12122
- Paper en Hugging Face: https://huggingface.co/papers/2102.12122
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de PVT: https://imvision12.github.io/ZeroModels/pvt/
- Guía de carga de pesos: https://imvision12.github.io/ZeroModels/loading_weights/
- Colección de variantes PVT y PVTv2: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Checkpoint original: https://huggingface.co/Zetatech/pvt-small-224
- Repositorio oficial de PVT: https://github.com/whai362/PVT

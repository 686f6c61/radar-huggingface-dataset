# zeromodels/pvt-large-224

## Resumen

PVT (Pyramid Vision Transformer) es un transformer jerárquico para visión, presentado en el artículo *Pyramid Vision Transformer: A Versatile Backbone for Dense Prediction without Convolutions* (arXiv:2102.12122). A diferencia de los vision transformers clásicos como ViT, PVT construye una pirámide de características en cuatro etapas, lo que lo hace adecuado como backbone para tareas densas como detección de objetos y segmentación semántica, además de clasificación de imágenes.

El modelo `zeromodels/pvt-large-224` es una conversión pura a Keras 3 del checkpoint original `Zetatech/pvt-large-224`, realizada por el proyecto ZeroModels. La conversión permite ejecutar el mismo modelo sin modificaciones en TensorFlow, PyTorch o JAX, manteniendo resultados bit-exactos respecto al original. Con aproximadamente 61,4 millones de parámetros y una precisión top-1 del 81,7% en ImageNet-1k, este checkpoint ofrece un equilibrio entre coste computacional y rendimiento para tareas de visión.

La relevancia actual de este modelo radica en su flexibilidad de despliegue: al estar implementado en Keras 3, los desarrolladores pueden elegir el backend de ejecución según su infraestructura, y además puede usarse tanto como clasificador final como backbone para extracción de características en pipelines de visión por computador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer (PVT) - transformer jerárquico con atención de reducción espacial, 4 etapas piramidales |
| Parametros totales | ~61,4 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos Keras, formato interno de ZeroModels) |

## Arquitectura y entrenamiento

PVT sigue un diseño jerárquico en cuatro etapas. Cada etapa procesa parches no superpuestos de la imagen y aplica una atención de reducción espacial (spatial-reduction attention), que reduce la complejidad computacional frente a la atención global estándar. Los embeddings posicionales son aprendidos. Esta estructura produce un mapa de características multiescala, similar a las redes convolucionales piramidales, lo que facilita su uso como backbone en tareas densas.

El modelo fue entrenado en ImageNet-1k, alcanzando un top-1 del 81,7%. No se dispone de detalles adicionales sobre el proceso de entrenamiento (número de épocas, aumentación de datos, etc.) en la información proporcionada. La conversión a Keras 3 no modifica los pesos originales; simplemente reempaqueta el checkpoint para que sea cargable desde la librería `zeromodels`.

## Capacidades

- Clasificación de imágenes: devuelve logits de clases a partir de una imagen de entrada de 224x224 píxeles.
- Extracción de características multiescala: mediante `PvtModel` con `as_backbone=True`, se obtienen las características de las cuatro etapas piramidales, útiles para tareas densas.
- Soporte multi-backend: el mismo código funciona en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Normalización integrada: el modelo espera píxeles en bruto `[0, 255]`; la normalización está incluida en el grafo, simplificando el preprocesado.
- Compatibilidad con checkpoints originales: se pueden cargar directamente pesos de Hugging Face (`hf:Zetatech/pvt-large-224`).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en un servicio de clasificación de imágenes (por ejemplo, moderación de contenido o etiquetado automático) gracias a su tamaño moderado y a la posibilidad de ejecutarse en CPU o GPU con poca memoria.
- Extracción de características para búsqueda visual: usando `PvtModel` como backbone, se pueden obtener embeddings de imagen para construir sistemas de búsqueda por similitud o recomendación visual.
- Backbone para detección de objetos: las características piramidales de cuatro etapas son directamente utilizables en arquitecturas como Faster R-CNN o RetinaNet, permitiendo detectar objetos a múltiples escalas.
- Backbone para segmentación semántica: la salida multiescala puede alimentar decodificadores tipo U-Net o FPN para segmentar píxeles en categorías, por ejemplo en imágenes médicas o de satélite.
- Fine-tuning en dominios específicos: al ser un modelo preentrenado en ImageNet, se puede ajustar con un conjunto de datos propio (por ejemplo, defectos industriales o especies animales) con un coste de entrenamiento reducido.
- Prototipado rápido con Keras 3: gracias a su compatibilidad con múltiples backends, los equipos pueden experimentar en JAX para investigación y desplegar en TensorFlow o PyTorch sin cambiar el código del modelo.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es la precisión top-1 en ImageNet-1k. No se han proporcionado resultados en otros benchmarks (COCO, ADE20K, etc.) en la información disponible.

| Modelo | ImageNet-1k top-1 |
|---|---|
| PVT-Tiny (224) | 75,1% |
| PVT-Small (224) | 79,8% |
| PVT-Medium (224) | 81,2% |
| PVT-Large (224) | 81,7% |

## Requisitos de hardware

- Con 61,4 millones de parámetros, el modelo en FP32 ocupa aproximadamente 245 MB de memoria. La inferencia con una entrada de 224x224 requiere menos de 1 GB de VRAM en GPU, incluyendo activaciones.
- Puede ejecutarse en GPUs consumer como NVIDIA RTX 3060, RTX 4060 o superiores, así como en GPUs de datacenter (A100, H100) sin problema.
- También es viable su ejecución en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- No se han publicado datos de latencia o throughput específicos para este checkpoint.
- Opciones de despliegue: al ser un modelo Keras 3, se puede exportar a TensorFlow SavedModel, TFLite o usar directamente con el runtime de Keras. No es compatible con vLLM, Ollama o TGI, orientados a modelos de lenguaje.

## Comparativa con modelos similares

La comparativa se realiza con otros tamaños de la misma familia PVT, ya que no se dispone de datos de modelos alternativos (como ViT-Base o Swin-Tiny) en la información proporcionada.

| Modelo | Parámetros | ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| PVT-Tiny (224) | ~5,7M | 75,1% | Apache 2.0 | Hugging Face |
| PVT-Small (224) | ~12,2M | 79,8% | Apache 2.0 | Hugging Face |
| PVT-Medium (224) | ~24,4M | 81,2% | Apache 2.0 | Hugging Face |
| PVT-Large (224) | ~61,4M | 81,7% | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Es un modelo exclusivamente de visión; no procesa texto ni admite tareas multimodales.
- Los sesgos presentes en ImageNet-1k pueden transferirse al modelo, afectando a clasificaciones en dominios sensibles (personas, objetos culturales, etc.).
- No se han publicado cuantizaciones oficiales; el uso de cuantización post-entrenamiento requeriría un proceso adicional de calibración.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías.
- Para tareas densas (detección, segmentación), el modelo debe usarse como backbone y requiere un decodificador adicional; no es un modelo listo para esas tareas por sí solo.
- La resolución de entrada está fijada en 224x224; para resoluciones mayores sería necesario ajustar la arquitectura o usar versiones específicas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/zeromodels/pvt-large-224)
- [Paper original (arXiv:2102.12122)](https://arxiv.org/abs/2102.12122)
- [Repositorio GitHub de ZeroModels](https://github.com/IMvision12/ZeroModels)
- [Documentación de PVT en ZeroModels](https://imvision12.github.io/ZeroModels/pvt/)
- [Colección de modelos PVT y PVTv2 en Hugging Face](https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876)
- [Checkpoint original Zetatech/pvt-large-224](https://huggingface.co/Zetatech/pvt-large-224)

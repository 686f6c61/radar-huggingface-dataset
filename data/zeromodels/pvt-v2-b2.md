# zeromodels/pvt-v2-b2

## Resumen

El modelo `zeromodels/pvt-v2-b2` es una conversión pura a Keras 3 del checkpoint original `OpenGVLab/pvt_v2_b2`, perteneciente a la familia Pyramid Vision Transformer v2 (PVTv2). Desarrollado por el equipo de ZeroModels, este modelo permite ejecutar la arquitectura PVTv2 de forma idéntica sobre los tres backends de Keras 3: TensorFlow, PyTorch y JAX, sin necesidad de modificar el código. Está diseñado para tareas de clasificación de imágenes y como backbone para extracción de características en cuatro etapas.

PVTv2 introduce mejoras sobre el PVT original: patch embeddings superpuestos, una red feed-forward convolucional y la eliminación de embeddings posicionales, lo que permite procesar imágenes de cualquier resolución. El modelo tiene aproximadamente 25,4 millones de parámetros y alcanza un 82,0 % de top-1 en ImageNet-1k. Su licencia Apache 2.0 permite uso comercial sin restricciones, y al ser un checkpoint de Keras 3, es especialmente útil para equipos que trabajan con múltiples frameworks o que desean portar modelos entre ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) con patch embeddings superpuestos, feed-forward convolucional y sin embeddings posicionales |
| Parametros totales | ~25,4 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no especificado; checkpoint de Keras 3 (carga mediante `from_weights`) |

## Arquitectura y entrenamiento

PVTv2 es un transformer piramidal que procesa la imagen en cuatro etapas, generando una pirámide de características de resolución decreciente. A diferencia del PVT original, emplea patch embeddings superpuestos para mejorar la continuidad espacial, una red feed-forward convolucional (ConvFFN) que incorpora información local, y prescinde por completo de embeddings posicionales, lo que permite que el modelo acepte cualquier resolución de entrada. Existe además una variante con atención lineal (b2-linear) que reduce el coste computacional en resoluciones altas.

El checkpoint original fue entrenado en ImageNet-1k, como se describe en el paper arXiv:2106.13797. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica. La conversión de ZeroModels no modifica los pesos, sino que los reempaqueta en un formato compatible con Keras 3, garantizando que la salida sea bit-exacta respecto al original.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clases mediante `PvtV2ImageClassify`.
- Extraccion de caracteristicas: `PvtV2Model` con `as_backbone=True` devuelve una piramide de caracteristicas de cuatro etapas, util para tareas downstream como deteccion de objetos o segmentacion.
- Resolucion de entrada flexible: al no usar embeddings posicionales, acepta imagenes de cualquier dimension (aunque el entrenamiento original fue a 224x224).
- Multi-backend: el mismo codigo funciona en TensorFlow, PyTorch y JAX sin cambios, seleccionando el backend mediante la variable de entorno `KERAS_BACKEND`.
- Normalizacion integrada: los pesos incluyen la normalizacion de la entrada, por lo que se pueden pasar pixeles crudos en rango [0, 255] directamente.
- Compatibilidad con checkpoints originales: se pueden cargar directamente los pesos de `OpenGVLab/pvt_v2_b2` mediante `from_weights("hf:OpenGVLab/pvt_v2_b2")`.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede integrarse en pipelines de vision artificial para categorizar imagenes en tiempo real, gracias a su tamano reducido (25,4 M de parametros) y su latencia baja en GPUs consumer.
- Backbone para deteccion de objetos: las caracteristicas de las cuatro etapas pueden alimentar cabezales como Faster R-CNN o RetinaNet, aprovechando la piramide multiescala.
- Segmentacion semantica: la salida de `PvtV2Model` como backbone es adecuada para arquitecturas tipo U-Net o DeepLab, donde se necesitan caracteristicas de distintas resoluciones.
- Transferencia de aprendizaje en dominios especificos: al ser un modelo preentrenado en ImageNet-1k, se puede fine-tuning en datasets propios (medicina, agricultura, etc.) con pocos datos.
- Prototipado multi-framework: al ser una conversion Keras 3, un mismo codigo puede ejecutarse en JAX para investigacion, TensorFlow para despliegue en TF Serving y PyTorch para integracion con ecosistemas existentes, sin reescribir nada.
- Sistemas de vision en el edge: con solo ~100 MB en FP32, el modelo puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o GPUs integradas, para aplicaciones de clasificacion offline.

## Benchmarks y rendimiento

El modelo alcanza un 82,0 % de top-1 en ImageNet-1k, segun la model card. No se han publicado resultados adicionales de benchmarks (como COCO o ADE20K) en la informacion disponible. La siguiente tabla compara las variantes de PVTv2 disponibles en la coleccion de ZeroModels:

| Variante | Parametros | ImageNet-1k top-1 |
|---|---|---|
| pvt-v2-b0 | ~3,4 M | 70,5 % |
| pvt-v2-b1 | ~13,2 M | 78,7 % |
| pvt-v2-b2 | ~25,4 M | 82,0 % |
| pvt-v2-b2-linear | ~25,4 M | 82,1 % |
| pvt-v2-b3 | ~40,2 M | 83,1 % |
| pvt-v2-b4 | ~62,6 M | 83,6 % |
| pvt-v2-b5 | ~81,6 M | 83,8 % |

## Requisitos de hardware

- VRAM estimada: con 25,4 M de parametros, en FP32 ocupa ~100 MB; en FP16 ~50 MB. Cabe en cualquier GPU con mas de 1 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning, una RTX 3090 o A100 permiten batches grandes.
- CPU: al ser un modelo pequeno, puede ejecutarse en CPU con latencias aceptables (del orden de decenas de milisegundos por imagen).
- Opciones de despliegue: al ser Keras 3, se puede exportar a SavedModel para TensorFlow Serving, a TorchScript para PyTorch, o usar directamente con JAX. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamano se estima una latencia inferior a 10 ms en una GPU moderna para una imagen de 224x224.

## Comparativa con modelos similares

La comparativa se realiza con otras variantes de PVTv2 y con modelos transformer de tamano similar, aunque no se dispone de datos de benchmarks de estos ultimos en la informacion proporcionada.

| Modelo | Parametros | ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| PVTv2-B2 (este) | ~25,4 M | 82,0 % | Apache 2.0 | Hugging Face, Keras 3 |
| PVTv2-B1 | ~13,2 M | 78,7 % | Apache 2.0 | Hugging Face, Keras 3 |
| PVTv2-B3 | ~40,2 M | 83,1 % | Apache 2.0 | Hugging Face, Keras 3 |
| ViT-Base (referencia) | ~86 M | 84,5 % (aprox.) | Apache 2.0 | Hugging Face, PyTorch/JAX |

Nota: los datos de ViT-Base son aproximados y no provienen de la informacion proporcionada; se incluyen solo como referencia orientativa. No se dispone de comparativas directas con otros modelos en la documentacion consultada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar preentrenado en ImageNet-1k, puede heredar sesgos de ese dataset (por ejemplo, en categorias de personas, objetos o escenarios).
- Riesgo de alucinacion: no aplica, al ser un modelo discriminativo de clasificacion, no generativo.
- Limitaciones de contexto o idioma: no aplica, es un modelo de vision sin capacidad de procesamiento de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright.
- Caveat para produccion: la conversion Keras 3 requiere que el backend este configurado antes de importar Keras; ademas, el formato de pesos no es estandar (no es safetensors), por lo que la interoperabilidad con otras herramientas (ONNX, TensorRT) puede requerir conversion adicional.
- El modelo no incluye soporte para vision-language ni tareas multimodales; es exclusivamente para vision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/pvt-v2-b2
- Coleccion PVT/PVTv2 de ZeroModels: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Repositorio ZeroModels en GitHub: https://github.com/IMvision12/ZeroModels
- Documentacion de PVTv2 en ZeroModels: https://imvision12.github.io/ZeroModels/pvt_v2/
- Paper original: https://arxiv.org/abs/2106.13797
- Repositorio oficial de PVT: https://github.com/whai362/PVT
- Modelo base original: https://huggingface.co/OpenGVLab/pvt_v2_b2

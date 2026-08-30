# zeromodels/levit-256

## Resumen

LeViT-256 es un clasificador de imágenes híbrido que combina capas convolucionales y transformadores, diseñado por Meta AI (Graham et al., 2021) para ofrecer una inferencia rápida sin sacrificar precisión. El modelo presentado aquí, `zeromodels/levit-256`, es una conversión pura a Keras 3 del checkpoint original `facebook/levit-256`, lo que permite ejecutarlo sin modificaciones en TensorFlow, PyTorch o JAX mediante el backend de Keras. Con 18,9 millones de parámetros y 1,1 GMACs, está pensado para entornos con recursos limitados o aplicaciones de baja latencia.

La arquitectura combina un stem convolucional de cuatro capas que reduce la imagen 16 veces, seguido de tres etapas de atención con bias relativo 2D aprendible. Cada capa lineal incorpora BatchNorm fusionada y activaciones Hardswish. Los checkpoints publicados por Meta están destilados: una segunda cabeza de clasificación se promedia con la principal durante la inferencia. Este modelo resuelve el problema del alto coste computacional de los Vision Transformers puros, manteniendo un rendimiento competitivo en ImageNet-1k.

La relevancia actual de esta versión radica en su portabilidad: al ser una conversión Keras 3, los desarrolladores pueden integrar el mismo modelo en diferentes frameworks sin reescribir código, y utilizarlo tanto como clasificador final como backbone para tareas de visión más complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida convolucional-transformer (LeViT) |
| Parametros totales | 18,9 M |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de imagen 224x224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (H5); safetensors disponible vía el modelo original (`hf:facebook/levit-256`) |

## Arquitectura y entrenamiento

LeViT-256 sigue el diseño propuesto en el paper "LeViT: a Vision Transformer in ConvNet's Clothing for Faster Inference" (arXiv:2104.01136). La entrada de 224x224 píxeles pasa por un stem convolucional de cuatro capas que reduce la resolución espacial 16 veces, produciendo 256 canales. A continuación, tres etapas de atención procesan los tokens, con dimensiones ocultas de 256, 384 y 512 respectivamente. Cada etapa añade un bias de posición relativa 2D aprendible, y todas las capas lineales tienen BatchNorm fusionada, lo que acelera la inferencia. Las activaciones son Hardswish.

El entrenamiento original se realizó en ImageNet-1k a resolución 224x224, utilizando destilación: se entrena una segunda cabeza de clasificación y en inferencia se promedian las salidas de ambas cabezas. El modelo `zeromodels/levit-256` no es un reentrenamiento, sino una conversión de pesos del checkpoint oficial de Meta AI al formato Keras 3, manteniendo exactamente la misma arquitectura y los mismos pesos. La normalización de ImageNet está integrada en el modelo, por lo que se deben pasar píxeles crudos en rango [0, 255].

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k.
- Extracción de características: el modelo sin cabeza (`LevitModel.from_weights`) devuelve la secuencia final de tokens, utilizable como backbone para tareas downstream.
- Inferencia eficiente: 1,1 GMACs y 18,9 M de parámetros, diseñado para baja latencia.
- Multi-backend: funciona con TensorFlow, PyTorch y JAX a través de Keras 3, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Preprocesamiento integrado: la normalización está dentro del modelo, simplificando el pipeline.
- Soporte de destilación: la cabeza de clasificación promedia automáticamente las dos salidas de destilación.
- No dispone de capacidades de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Clasificación de imágenes en tiempo real en dispositivos edge: su bajo coste computacional (1,1 GMACs) permite ejecutarlo en hardware limitado, como Raspberry Pi o GPUs de gama baja, para tareas de moderación de contenido o control de calidad visual.
- Extracción de características para búsqueda visual: usando el backbone, se pueden generar embeddings de imágenes para sistemas de recuperación por similitud, por ejemplo en catálogos de productos o archivos fotográficos.
- Fine-tuning para dominios específicos: sobre ImageNet-1k, se puede ajustar para clasificación médica (radiografías, histología), industrial (defectos en piezas) o agrícola (enfermedades en cultivos), con un coste de entrenamiento reducido.
- Backbone para detección de objetos o segmentación: al obtener la secuencia de tokens, se puede conectar a cabezas de detección (como DETR) o segmentación, aprovechando la eficiencia del modelo en pipelines de visión por computador.
- Prototipado rápido con Keras 3: al ser multi-backend, los investigadores pueden experimentar con el mismo modelo en JAX para investigación y luego desplegarlo en TensorFlow o PyTorch en producción sin cambios de código.
- Aplicaciones de baja latencia en servidores: para servicios de clasificación en línea con alta concurrencia, el modelo puede servir miles de peticiones por segundo en GPUs modestas, gracias a su pequeño tamaño y a la fusión de BatchNorm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (precisión top-1, top-5) en la información disponible. Los datos de eficiencia del modelo, según la ficha de `timm/levit_256.fb_dist_in1k`, son:

| Metrica | Valor |
|---|---|
| Parametros (M) | 18,9 |
| GMACs | 1,1 |
| Activaciones (M) | 4,2 |
| Tamano de imagen | 224x224 |

Estos valores indican un coste computacional muy bajo en comparación con Vision Transformers convencionales, pero no se dispone de la precisión exacta en ImageNet-1k en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: en FP32, los pesos ocupan aproximadamente 75 MB; en FP16, unos 38 MB. La inferencia puede ejecutarse en GPUs con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1650, RTX 3060 o superiores. También es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU actual sin problemas.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow SavedModel, TorchScript o JAX; también es posible convertir a ONNX para usar con TensorRT u otros runtime. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada, pero por diseño (1,1 GMACs) se espera una latencia de pocos milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. LeViT-256 se sitúa en la categoría de backbones de visión eficientes, similar en tamaño a otros como DeiT-S (22 M de parámetros) o MobileViT-S (5,6 M), pero no se tienen cifras exactas de rendimiento para establecer una tabla comparativa. Se recomienda consultar el paper original para comparaciones detalladas con ViT, ResNet y otros modelos de la época.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto ni tiene capacidades multimodales.
- Preentrenado en ImageNet-1k: puede heredar sesgos presentes en ese dataset (por ejemplo, distribución de clases y contextos geográficos).
- Resolución de entrada fija: el preprocesamiento recomendado es resize a 256 y center-crop a 224; usar otras resoluciones puede degradar el rendimiento.
- Dependencia de Keras 3: la versión `zeromodels` requiere Keras 3 y la librería `zeromodels`; no es un checkpoint estándar de PyTorch o TensorFlow, aunque se puede cargar el original vía `hf:`.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo y no generativo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe atribuir la autoría original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeromodels/levit-256
- Paper original: https://arxiv.org/abs/2104.01136
- Repositorio ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de backbones: https://imvision12.github.io/ZeroModels/classification_backbones/
- Modelo original de Meta: https://huggingface.co/facebook/levit-256
- Versión timm: https://huggingface.co/timm/levit_256.fb_dist_in1k

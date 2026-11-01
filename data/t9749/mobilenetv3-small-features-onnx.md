# t9749/mobilenetv3-small-features-onnx

## Resumen

`t9749/mobilenetv3-small-features-onnx` es un extractor de características de imagen derivado de `timm/mobilenetv3_small_100.lamb_in1k`, el checkpoint de Ross Wightman en la librería `pytorch-image-models` (timm). El autor ha eliminado la cabeza de clasificación (`num_classes=0`) y ha exportado el modelo a ONNX (opset 17) en fp16, con entradas y salidas en float32, de modo que recibe una imagen RGB de 224 x 224 píxeles y devuelve un vector de 1024 dimensiones pensado para búsqueda de similitud mediante coseno.

No es un modelo generativo ni un LLM: es un codificador convolucional ligero para *image feature extraction* y *image similarity*. Su relevancia práctica reside en que permite implementar funciones de "más como esto" en galerías de imágenes con un coste computacional mínimo (unos 5 ms por imagen en CPU según el autor) y sin dependencia de PyTorch en producción, ya que el artefacto distribuido es un grafo ONNX autocontenido.

El modelo base MobileNetV3-Small es una CNN con bloques *squeeze-and-excitation* y activaciones h-swish, diseñada para eficiencia en dispositivos móviles. El autor declara su uso en MovieZam, una aplicación Android de galería multimedia, para la función de recomendación por similitud visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV3-Small (timm `mobilenetv3_small_100`), cabeza de clasificación eliminada, exportada a ONNX |
| Parametros totales | no disponible (el modelo base MobileNetV3-Small ronda los 2,5 M de parámetros con clasificador; el autor no publica el recuento del artefacto exportado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224 x 224 x 3) |
| Tipos de cuantizacion | pesos en fp16; entradas y salidas en float32; no se documentan otras cuantizaciones (int8, etc.) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); el repositorio ocupa 0.0 GB según HuggingFace |
| Dimension de salida | vector float32 `[1, 1024]` |
| Entrada | tensor float32 `[1, 3, 224, 224]`, RGB, normalizado con media ImageNet (0.485, 0.456, 0.406) y desviación (0.229, 0.224, 0.225) |

## Arquitectura y entrenamiento

La arquitectura es MobileNetV3-Small, una red convolucional con convoluciones separables en profundidad, bloques de *squeeze-and-excitation* y activaciones h-swish, optimizada para inferencia en dispositivos con recursos limitados. El checkpoint base (`timm/mobilenetv3_small_100.lamb_in1k`) fue entrenado por Ross Wightman sobre ImageNet-1k con el optimizador LAMB y resolución de 224 x 224; el autor de esta ficha no aporta detalles adicionales sobre el entrenamiento.

La modificación aplicada consiste en eliminar la capa de clasificación (`num_classes=0`) para exponer la representación interna de 1024 dimensiones, y exportar el grafo con `torch.onnx` (opset 17). Los pesos se convierten a fp16, pero las entradas y salidas se mantienen en float32 para facilitar la integración con runtimes ONNX estándar. No se documenta ningún ajuste fino posterior ni entrenamiento contrastivo específico para similitud: las características son las del modelo de clasificación reutilizadas como embedding.

## Capacidades

- Extracción de características de imagen: una imagen RGB de 224 x 224 produce un vector float32 de 1024 dimensiones.
- Búsqueda de similitud visual mediante distancia coseno entre embeddings.
- Detección de duplicados y agrupación de imágenes visualmente parecidas.
- Recuperación de imágenes por similitud (*content-based image retrieval*).
- Inferencia en CPU con latencia baja (aproximadamente 5 ms por imagen según el autor).
- Ejecución mediante runtime ONNX, sin dependencia de PyTorch en producción.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No soporta visión generativa ni descripción de imágenes: solo produce embeddings.

## Casos de uso

- Función "más como esto" en galerías de fotos: el caso declarado por el autor. Se indexan los embeddings de todas las imágenes de la galería y, al seleccionar una, se recuperan las más cercanas por coseno. Es adecuado por su latencia de milisegundos en CPU y su tamaño reducido, que permite ejecutarlo en el propio dispositivo Android.
- Deduplicación de bibliotecas de imágenes: calcular embeddings de un corpus y marcar como duplicados los pares con coseno por encima de un umbral. El autor aporta estadísticas útiles para calibrarlo: pares de la misma escena tienen mediana 0,76 (el 90 % por encima de 0,44), mientras que pares no relacionados tienen mediana 0,14 y percentil 99 de 0,61.
- Búsqueda visual en catálogos de comercio electrónico: indexar el catálogo de productos y permitir búsqueda por imagen de referencia, con un índice vectorial (FAISS, hnswlib) alimentado con los vectores de 1024 dimensiones.
- Moderación y agrupación de contenido en plataformas UGC: agrupar subidas visualmente similares para detectar spam de imágenes repetidas o campañas coordinadas.
- Organización automática de archivos multimedia: agrupar fotos por escena o evento sin metadatos EXIF, usando la similitud de embeddings como criterio de clustering.
- Preprocesado para pipelines de visión mayores: usar los embeddings como entrada compacta para clasificadores ligeros, sistemas de recomendación o modelos de reranking, evitando ejecutar una CNN grande en cada petición.
- Prototipado rápido en edge: al ser un grafo ONNX de MobileNetV3-Small, se puede desplegar con ONNX Runtime en dispositivos con poca memoria sin infraestructura GPU.

## Benchmarks y rendimiento

El autor publica una única evaluación, sobre INRIA Holidays (primeras 150 escenas, 405 fotos), midiendo *mean average precision* de recuperación de la misma escena con similitud coseno:

| Vector | mAP |
|---|---|
| Estas características (fp32) | 0.822 |
| Estas características (fichero fp16) | 0.819 |
| Las 1000 puntuaciones de clase del clasificador | 0.746 |
| *Difference hash* de 64 bits | 0.145 |

Datos adicionales aportados por el autor: pares de la misma escena con coseno mediano de 0,76 (90 % por encima de 0,44); pares no relacionados con mediana de 0,14 y percentil 99 de 0,61; latencia de aproximadamente 5 ms por imagen en CPU. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no procesa texto.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso de uso declarado; el modelo está pensado para CPU. En GPU, el grafo fp16 de MobileNetV3-Small ocupa del orden de decenas de MB, aunque el autor no publica cifras exactas.
- GPU recomendadas: cualquiera con soporte de ONNX Runtime (CUDA o TensorRT); no se requiere una GPU de datacenter para este modelo.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna; también en CPU de móvil, según el caso de uso declarado por el autor.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, CoreML, NNAPI), OpenVINO, o conversión a otros formatos desde ONNX. No se distribuyen pesos GGUF ni safetensors.
- Latencia y throughput: aproximadamente 5 ms por imagen en CPU según el autor; no se publican cifras de throughput en lote ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t9749/mobilenetv3-small-features-onnx | no disponible (base ~2,5 M) | embedding 1024 | Similitud de imagen en CPU/edge | Apache-2.0 | ONNX en HuggingFace |
| timm/mobilenetv3_small_100.lamb_in1k | ~2,5 M (con clasificador) | 1000 clases | Clasificación ImageNet | Apache-2.0 | PyTorch en timm |
| CLIP (ViT-B/32) | ~150 M | embedding 512 | Similitud imagen-texto e imagen-imagen | MIT (OpenAI) | PyTorch/ONNX |
| DINOv2 (ViT-S/14) | ~22 M | embedding 384 | Características visuales de propósito general | Apache-2.0 | PyTorch |

La comparación con CLIP y DINOv2 es cualitativa: no se dispone de resultados de esos modelos sobre el mismo subconjunto de INRIA Holidays empleado por el autor, por lo que no se puede establecer una comparación numérica directa. La ventaja de este modelo frente a ellos es el coste computacional y la facilidad de despliegue en CPU; la desventaja, una calidad de embedding inferior en tareas de recuperación exigentes.

## Limitaciones y advertencias

- El modelo no ha sido entrenado con un objetivo contrastivo: los embeddings provienen de un clasificador ImageNet y no están optimizados específicamente para similitud. El propio autor documenta que supera a las puntuaciones del clasificador (0,822 frente a 0,746 de mAP), pero no hay garantía de que generalice igual de bien fuera del dominio de fotos naturales.
- Entrada fija de 224 x 224: imágenes de otras resoluciones o relaciones de aspecto deben redimensionarse, lo que puede degradar la recuperación en escenas con detalle fino.
- Solo se ha evaluado en un conjunto (INRIA Holidays, 405 fotos); no hay validación en dominios como ilustraciones, capturas de pantalla, documentos escaneados o imágenes médicas.
- No procesa texto ni proporciona etiquetas semánticas: la interpretación de los embeddings queda enteramente del lado de la aplicación.
- El artefacto está en fp16 con E/S en float32; no se documentan cuantizaciones int8, por lo que no se puede asumir una reducción adicional de tamaño sin validación propia.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; conviene conservar el aviso de licencia y la atribución a timm y a Ross Wightman, tal como indica el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ofrece garantías de mantenimiento; para producción conviene fijar una revisión concreta del repositorio.
- No se publican datos de sesgo: al derivar de ImageNet-1k, hereda los sesgos de representación de dicho dataset, aunque en un extractor de características el efecto se manifiesta como menor discriminación en categorías poco representadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/t9749/mobilenetv3-small-features-onnx
- Modelo base en timm: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- Repositorio pytorch-image-models: https://github.com/huggingface/pytorch-image-models
- Paper de MobileNetV3 (Howard et al., 2019): https://arxiv.org/abs/1905.02244
- Dataset INRIA Holidays: https://lear.inrialpes.fr/~jegou/data.php
- ONNX Runtime: https://onnxruntime.ai/

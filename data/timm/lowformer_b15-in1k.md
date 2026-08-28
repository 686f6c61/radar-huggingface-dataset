# timm/lowformer_b15.in1k

## Resumen

LowFormer B15 es un modelo de clasificación de imágenes desarrollado por los autores del paper "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones" (arXiv:2409.03460) y convertido al ecosistema `timm` por Ross Wightman. Su objetivo principal es ofrecer un equilibrio entre precisión y latencia real medida en hardware, en lugar de optimizar únicamente el número de operaciones (MACs). Para ello combina bloques convolucionales MBConv fusionados y agrupados con un mecanismo de atención eficiente que reduce la resolución espacial mediante convoluciones depthwise con stride y la recupera con convoluciones transpuestas.

La variante `b15` es una escala intermedia entre los modelos B1 y B2 del paper, con 34 millones de parámetros y 2.6 GMACs a resolución 224x224. Está entrenado en ImageNet-1k y alcanza un 81.1% de Top-1 en validación, lo que lo sitúa como una opción competitiva para tareas de visión en entornos con restricciones de cómputo. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su formato de pesos `safetensors` facilita su integración en pipelines modernos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido convolucional-transformer (LowFormer) |
| Parametros totales | 34.010.676 (34.0 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (pesos en FP32; se puede cuantizar externamente) |
| Idiomas soportados | No disponible (modelo visual, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LowFormer B15 sigue una arquitectura híbrida que combina bloques MBConv (convoluciones móviles invertidas) con un bloque de atención eficiente. La atención proyecta la entrada a una resolución espacial menor mediante una convolución depthwise con stride, calcula la atención sobre esa versión reducida y luego recupera la resolución original con una convolución transpuesta. Este diseño reduce el coste computacional de la atención sin sacrificar la capacidad de modelar dependencias globales. El modelo utiliza también bloques MBConv fusionados y agrupados, lo que mejora la eficiencia en hardware real.

El entrenamiento se realizó sobre ImageNet-1k por los autores del paper, y el checkpoint fue convertido al formato de `timm` manteniendo la configuración de preprocesado (resize bicúbico, media y desviación estándar de ImageNet, y recorte central con `crop_pct=0.95`). No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo puramente supervisado para clasificación. La variante `b15` amplía el ancho del stem y de las etapas intermedias respecto a B1, manteniendo los anchos de cabeza de B2.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k.
- Extracción de embeddings de imagen (eliminando la cabeza clasificadora, `num_classes=0`).
- Extracción de mapas de características multi-escala con `features_only=True`, útil para tareas downstream como detección o segmentación.
- Preprocesado integrado en la configuración del modelo, lo que simplifica su uso en producción.
- Soporte para inferencia en FP16 y FP32; la precisión en bfloat16 puede degradar ligeramente en algunas variantes, aunque `b15` se mantiene dentro de 0.25 puntos de Top-1 respecto a FP32.

## Casos de uso

- Clasificación de productos en comercio electrónico: el modelo puede etiquetar imágenes de productos en categorías predefinidas, con una latencia baja que permite su despliegue en servidores de catálogo o en dispositivos de punto de venta.
- Moderación de contenido visual: al clasificar imágenes en categorías de riesgo (violencia, desnudos, etc.) usando un clasificador personalizado sobre los embeddings extraídos, se puede integrar en pipelines de revisión automática.
- Búsqueda visual por similitud: los embeddings de 320 dimensiones (tras `forward_head(pre_logits=True)`) permiten indexar imágenes y realizar búsquedas por similitud con métricas como coseno, útil en sistemas de recomendación o archivos fotográficos.
- Backbone para detección de objetos: los mapas de características multi-escala (resoluciones 56x56, 28x28, 14x14, 7x7) pueden alimentar cabezas de detección como Faster R-CNN o YOLO, aprovechando la eficiencia del modelo para aplicaciones en tiempo real.
- Segmentación semántica: las características jerárquicas extraídas con `features_only=True` sirven como encoder en arquitecturas tipo U-Net, permitiendo segmentar imágenes médicas o de conducción autónoma con un coste computacional moderado.
- Clasificación en dispositivos edge: con solo 34M de parámetros y 2.6 GMACs, el modelo puede ejecutarse en CPUs de gama media o GPUs integradas, habilitando aplicaciones de visión en cámaras inteligentes o robots.

## Benchmarks y rendimiento

La siguiente tabla muestra la precisión Top-1 / Top-5 en ImageNet-1k (validación) medida en FP32 con interpolación bicúbica y recorte central (`crop_pct=0.95`), según la model card oficial.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14.10 | 78.388 / 94.026 | 79.194 / 94.462 | 79.306 / 94.444 |
| lowformer_b1.in1k | 17.94 | 79.806 / 94.592 | 80.260 / 94.914 | 80.406 / 95.072 |
| **lowformer_b15.in1k** | **33.98** | **81.102 / 95.258** | **81.558 / 95.470** | **81.708 / 95.588** |
| lowformer_b3.in1k | 57.09 | 83.656 / 96.656 | 83.988 / 96.738 | 84.066 / 96.834 |
| lowformer_e1.in1k | 18.90 | 78.772 / 94.120 | 79.366 / 94.450 | 79.624 / 94.562 |
| lowformer_e2.in1k | 22.75 | 81.612 / 95.714 | 81.982 / 95.948 | 82.156 / 96.098 |
| lowformer_e3.in1k | 41.32 | 83.044 / 96.344 | 83.166 / 96.536 | 83.402 / 96.552 |

No se han publicado resultados de benchmarks adicionales (como latencia medida en hardware específico) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 34M de parámetros en FP32, los pesos ocupan aproximadamente 136 MB; la inferencia típica requiere menos de 1 GB de VRAM, pero este dato no está confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, Jetson Nano) es suficiente para inferencia en FP32. También puede ejecutarse en CPU con razonable rendimiento gracias a su bajo coste computacional.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja y media (RTX 2060, RTX 3060, etc.) sin problemas.
- Opciones de despliegue: al ser un modelo `timm`, se puede exportar a ONNX, TensorRT o TorchScript para optimización. También es compatible con librerías de inferencia como Hugging Face Transformers (a través de `timm`), y se puede servir con FastAPI o TorchServe.
- Latencia y throughput: no se proporcionan mediciones oficiales. Dado su tamaño, se espera una latencia inferior a 10 ms en GPU moderna y decenas de ms en CPU, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

La comparativa se centra en la familia LowFormer, ya que son los modelos más directamente comparables por arquitectura y entrenamiento. No se dispone de datos de otros backbones como MobileNet o EfficientNet en la información proporcionada.

| Modelo | Params (M) | Top-1 (224) | Top-1 (256) | Top-1 (288) | Licencia |
|---|---:|---:|---:|---:|---|
| lowformer_b0.in1k | 14.10 | 78.388 | 79.194 | 79.306 | Apache 2.0 |
| lowformer_b1.in1k | 17.94 | 79.806 | 80.260 | 80.406 | Apache 2.0 |
| **lowformer_b15.in1k** | **33.98** | **81.102** | **81.558** | **81.708** | **Apache 2.0** |
| lowformer_b3.in1k | 57.09 | 83.656 | 83.988 | 84.066 | Apache 2.0 |
| lowformer_e2.in1k | 22.75 | 81.612 | 81.982 | 82.156 | Apache 2.0 |

`b15` ofrece un punto intermedio entre eficiencia y precisión: supera a `b1` en ~1.3 puntos de Top-1 con el doble de parámetros, y se acerca a `e2` (que tiene menos parámetros pero mayor precisión) a costa de más cómputo. Para aplicaciones donde la latencia es crítica, `b0` o `b1` pueden ser más adecuados; para máxima precisión, `b3` o `e3` son superiores.

## Limitaciones y advertencias

- Sesgos del dataset: al estar entrenado en ImageNet-1k, el modelo puede heredar sesgos de ese conjunto (por ejemplo, sobrerrepresentación de ciertas categorías o estereotipos visuales). No se han realizado evaluaciones de sesgo específicas.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de clasificación, no generativo.
- Limitaciones de contexto: no aplica, pero la resolución de entrada está fijada a 224x224 (aunque se puede ajustar con `crop_pct`). Resoluciones mayores aumentan el coste computacional.
- Precisión en bfloat16: aunque `b15` se mantiene dentro de 0.25 puntos de Top-1 respecto a FP32, otras variantes como `b0` y `b1` pierden hasta 3.0 y 1.5 puntos respectivamente. Se recomienda usar FP16 o FP32 para máxima precisión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright. No hay restricciones de uso militar o de vigilancia explícitas.
- Caveat de producción: la latencia real depende del hardware, runtime y batch size; los valores de precisión reportados son en FP32 y pueden variar con cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/lowformer_b15.in1k
- Repositorio oficial del paper: https://github.com/altair199797/LowFormer
- Paper "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones": https://arxiv.org/abs/2409.03460
- Librería timm (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Documentación de timm: https://timm.fast.ai/

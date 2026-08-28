# timm/lowformer_b3.in1k

## Resumen

LowFormer es una familia de backbones de visión por computador diseñados para optimizar la latencia real medida en hardware, en lugar de limitarse al recuento de MACs. El modelo `lowformer_b3.in1k` es la variante B3, desarrollada por Moritz Nottebaum, Matteo Dunnhofer y otros en el paper "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones" (WACV 2025). Combina etapas de convoluciones MBConv fusionadas y agrupadas con un bloque de atención eficiente que reduce la resolución espacial mediante una convolución depthwise con stride y la recupera con una convolución transpuesta, logrando un equilibrio entre precisión y velocidad.

Con 57,1 millones de parámetros y una resolución de entrada de 224x224 píxeles, este modelo alcanza un 83,656% de Top-1 en ImageNet-1k, superando a otras variantes de la familia y a muchos backbones eficientes de tamaño similar. Está disponible en el ecosistema `timm` (PyTorch Image Models) con pesos en formato safetensors y licencia Apache 2.0, lo que facilita su integración en proyectos de clasificación, extracción de características y como encoder para tareas de detección y segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LowFormer (híbrido convolucional-transformer con atención eficiente) |
| Parametros totales | 57.119.688 (57,1 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión); resolución de entrada 224x224 |
| Tipos de cuantizacion | FP32, FP16, bfloat16 (precisión de inferencia documentada; no se especifican cuantizaciones de menor precisión) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LowFormer combina bloques MBConv (convoluciones depthwise separables) con un mecanismo de atención eficiente que opera a menor resolución espacial. El bloque de atención proyecta la entrada a una resolución reducida mediante una convolución depthwise con stride, aplica la atención sobre esa representación compacta y luego recupera la resolución original con una convolución transpuesta. Esta estrategia reduce el coste computacional y la latencia en hardware real, a diferencia de otros diseños que solo optimizan el número de operaciones.

El modelo fue entrenado por los autores del paper en ImageNet-1k con supervisión completa (clasificación). No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que es un modelo de visión supervisado. El checkpoint se convirtió al formato de `timm` y se distribuye con el preprocesamiento estándar: resize bicúbico, normalización con media y desviación de ImageNet, y center crop con `crop_pct=0.95`. La arquitectura permite extraer mapas de características multi-escala con `features_only=True` y embeddings globales con `num_classes=0`.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k.
- Extracción de embeddings de imagen (vectores de características) para tareas de búsqueda visual o similitud.
- Extracción de mapas de características multi-escala (con `features_only=True`) para usar como backbone en detectores de objetos o segmentadores.
- Fine-tuning en datasets propios para clasificación personalizada.
- Inferencia eficiente en hardware real, con especial atención a la latencia medida (no solo MACs).
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en pipelines de moderación de contenido, clasificación de productos o diagnóstico visual. Su tamaño moderado (57 M parámetros) permite desplegarlo en servicios con requisitos de latencia ajustados, manteniendo una precisión competitiva (83,7% Top-1 en ImageNet).
- Búsqueda visual por similitud: usando la salida de embeddings (eliminando la capa de clasificación), se pueden indexar imágenes en una base de datos vectorial y realizar búsquedas por contenido. La extracción de características es rápida y el modelo es lo suficientemente ligero para procesar grandes volúmenes.
- Backbone para detección de objetos: al extraer mapas de características en cuatro escalas (64, 128, 256 y 512 canales), puede usarse como encoder en arquitecturas como Faster R-CNN o YOLO. Su diseño eficiente reduce la latencia total del sistema.
- Backbone para segmentación semántica: los mapas multi-escala son adecuados para decodificadores tipo U-Net o FPN, permitiendo segmentar imágenes en tiempo real en dispositivos con recursos limitados.
- Aplicaciones en edge computing: gracias a su optimización para latencia real, puede ejecutarse en dispositivos embebidos (Jetson, Raspberry Pi con aceleración) para tareas de visión en tiempo real, como videovigilancia o control de calidad industrial.
- Transfer learning en dominios específicos: partiendo de los pesos preentrenados en ImageNet, se puede fine-tuning en datasets pequeños (médico, agrícola, etc.) con pocas épocas, obteniendo mejores resultados que entrenando desde cero.

## Benchmarks y rendimiento

La siguiente tabla muestra la precisión en el conjunto de validación de ImageNet-1k, medida en FP32 con interpolación bicúbica y center crop (`crop_pct=0.95`). Los valores son Top-1 / Top-5 en porcentaje, variando solo la resolución de entrada.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14,10 | 78,388 / 94,026 | 79,194 / 94,462 | 79,306 / 94,444 |
| lowformer_b1.in1k | 17,94 | 79,806 / 94,592 | 80,260 / 94,914 | 80,406 / 95,072 |
| lowformer_b15.in1k | 33,98 | 81,102 / 95,258 | 81,558 / 95,470 | 81,708 / 95,588 |
| **lowformer_b3.in1k** | **57,09** | **83,656 / 96,656** | **83,988 / 96,738** | **84,066 / 96,834** |
| lowformer_e1.in1k | 18,90 | 78,772 / 94,120 | 79,366 / 94,450 | 79,624 / 94,562 |
| lowformer_e2.in1k | 22,75 | 81,612 / 95,714 | 81,982 / 95,948 | 82,156 / 96,098 |
| lowformer_e3.in1k | 41,32 | 83,044 / 96,344 | 83,166 / 96,536 | 83,402 / 96,552 |

No se han publicado resultados de benchmarks adicionales (como COCO o ADE20K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP32, los pesos ocupan aproximadamente 228 MB (57,1 M × 4 bytes); en FP16, unos 114 MB. La inferencia con batch pequeño cabe en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo ligero que no requiere hardware especializado.
- Opciones de despliegue: se puede usar directamente con `timm` en PyTorch, exportar a ONNX o TensorRT para optimización, o integrar en frameworks de inferencia como TorchServe. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras concretas en la documentación. El paper original reporta mejoras de latencia frente a otros backbones, pero los valores dependen del hardware y del runtime.

## Comparativa con modelos similares

La comparativa más directa es con otras variantes de la familia LowFormer, como se muestra en la tabla de benchmarks. Frente a otros backbones eficientes de tamaño similar (por ejemplo, EfficientNet-B3 o MobileNetV3-Large), LowFormer destaca por su diseño orientado a latencia real, aunque no se dispone de datos numéricos de esos modelos en la información proporcionada. La variante B3 ofrece la mejor precisión de la familia B, con un coste de 6,1 GMACs y 13,6 M de activaciones, lo que la sitúa como una opción equilibrada para tareas que requieren alta exactitud sin sacrificar demasiada velocidad.

## Limitaciones y advertencias

- Es un modelo de visión exclusivamente; no procesa texto ni tiene capacidades multimodales.
- La precisión puede degradarse ligeramente al usar autocast en bfloat16 (la documentación indica que las variantes b0 y b1 pierden ~3 y ~1,5 puntos de Top-1, respectivamente; b3 se mantiene dentro de 0,25 puntos). Se recomienda FP16 para igualar los resultados de FP32.
- El modelo fue entrenado en ImageNet-1k, por lo que puede heredar sesgos presentes en ese dataset (por ejemplo, distribución de clases y contextos geográficos).
- La resolución de entrada estándar es 224x224; aunque se puede ajustar, el preprocesamiento óptimo está codificado en la configuración del modelo.
- No se documentan cuantizaciones de menor precisión (int8, int4), por lo que el despliegue en hardware con soporte limitado de FP16 podría requerir conversión manual.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe atribuir adecuadamente a los autores originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/lowformer_b3.in1k
- Repositorio oficial de LowFormer: https://github.com/altair199797/LowFormer
- Paper en arXiv: https://arxiv.org/abs/2409.03460
- Documentación de timm: https://timm.fast.ai/
- Repositorio de PyTorch Image Models: https://github.com/huggingface/pytorch-image-models

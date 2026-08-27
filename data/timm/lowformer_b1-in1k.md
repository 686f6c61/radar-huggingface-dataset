# timm/lowformer_b1.in1k

## Resumen

LowFormer-B1 es un modelo de clasificación de imágenes desarrollado por Moritz Nottebaum, Matteo Dunnhofer y colaboradores, presentado en el artículo "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones" (WACV 2025). El modelo combina etapas convolucionales MBConv fusionadas y agrupadas con un bloque de atención eficiente que reduce la resolución espacial mediante una convolución depthwise con stride y la recupera con una convolución transpuesta. Esta arquitectura híbrida está diseñada para optimizar la latencia real medida en hardware, no solo el número de MACs, lo que lo hace especialmente adecuado para despliegue en dispositivos con recursos limitados.

El checkpoint concreto `lowformer_b1.in1k` es la variante B1 de la familia LowFormer, entrenada en ImageNet-1k por los autores del paper y convertida al formato de `timm` (PyTorch Image Models). Con 17,9 millones de parámetros y 1,4 GMACs, ofrece una precisión Top-1 de 79,806 % a resolución 224×224, superando a modelos de tamaño similar en la misma familia. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su integración nativa con `timm` facilita su uso en pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LowFormer-B1 (híbrido convolucional-transformer con atención eficiente) |
| Parametros totales | 17.956.056 (17,9 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | no disponible (pesos en FP32; se recomienda FP16, evitar bfloat16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (timm state-dict) |

## Arquitectura y entrenamiento

LowFormer-B1 sigue un diseño de backbone híbrido que intercala etapas convolucionales MBConv (fusionadas y agrupadas) con bloques de atención eficiente. La atención se implementa proyectando la entrada a una resolución espacial menor mediante una convolución depthwise con stride, aplicando la atención en esa resolución reducida y recuperando la resolución original con una convolución transpuesta. Esto reduce el coste computacional de la atención sin perder información relevante, y está optimizado para latencia real en GPUs y hardware edge, no solo para el recuento de MACs.

El modelo fue entrenado en ImageNet-1k por los autores del paper, con preprocesamiento estándar (resize bicúbico, normalización con media y desviación de ImageNet, center crop con `crop_pct=0.95`). No se aplicaron técnicas de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada. El checkpoint se convirtió al formato de `timm` manteniendo los pesos originales. Una nota importante: las variantes `lowformer_b0` y `lowformer_b1` pierden aproximadamente 3,0 y 1,5 puntos de Top-1 respectivamente si se usa autocast `bfloat16`; se recomienda FP16 o FP32 para mantener la precisión.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con salida de logits y probabilidades softmax.
- Extracción de embeddings de imagen: se puede eliminar la cabeza clasificadora (`num_classes=0`) para obtener vectores de características de 256 dimensiones (o el tamaño de la penúltima capa).
- Extracción de mapas de características multi-escala: usando `features_only=True`, el modelo devuelve mapas de activación de 4 etapas con formas `[1, 32, 56, 56]`, `[1, 64, 28, 28]`, `[1, 128, 14, 14]` y `[1, 256, 7, 7]` para entrada 224×224.
- Soporte nativo en la librería `timm`, incluyendo transformaciones de preprocesado automáticas mediante `resolve_model_data_config`.
- Compatible con `torch.jit` y exportación a ONNX para despliegue en producción.
- Funciona a resoluciones superiores (256, 288) con mejora de precisión, aunque con mayor coste computacional.

## Casos de uso

- Clasificación de imágenes en dispositivos edge: con solo 17,9 M de parámetros y 1,4 GMACs, el modelo puede ejecutarse en tiempo real en Jetson Nano, Raspberry Pi 4 o NPUs de móviles, manteniendo una precisión competitiva (79,8 % Top-1 a 224×224).
- Extracción de embeddings para búsqueda visual: al eliminar la cabeza clasificadora, se obtienen vectores de 256 dimensiones que pueden indexarse en bases vectoriales (FAISS, Milvus) para sistemas de búsqueda por similitud en catálogos de productos o fotos.
- Backbone para detección de objetos y segmentación: los mapas de características multi-escala extraídos con `features_only=True` pueden alimentar cabezas de detección (como Faster R-CNN o RetinaNet) o segmentación (U-Net, DeepLab), aprovechando la eficiencia del modelo en pipelines de visión completos.
- Filtrado y moderación de contenido: clasificación automática de imágenes en categorías (violencia, desnudos, spam) en plataformas sociales, con latencia baja y coste de inferencia reducido.
- Análisis de imágenes médicas: clasificación de radiografías o retinografías en patologías, donde la eficiencia permite procesar grandes volúmenes en servidores con GPUs modestas o incluso en CPU.
- Sistemas de recomendación visual: generación de embeddings de productos para recomendación por similitud en e-commerce, combinando el modelo con un índice vectorial y actualizaciones frecuentes del catálogo.

## Benchmarks y rendimiento

La siguiente tabla muestra la precisión en el conjunto de validación de ImageNet-1k medida en FP32 con interpolación bicúbica y center crop (`crop_pct=0.95`), según la model card oficial. Se comparan las variantes de la familia LowFormer.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14,10 | 78,388 / 94,026 | 79,194 / 94,462 | 79,306 / 94,444 |
| **lowformer_b1.in1k** | **17,94** | **79,806 / 94,592** | **80,260 / 94,914** | **80,406 / 95,072** |
| lowformer_b15.in1k | 33,98 | 81,102 / 95,258 | 81,558 / 95,470 | 81,708 / 95,588 |
| lowformer_b3.in1k | 57,09 | 83,656 / 96,656 | 83,988 / 96,738 | 84,066 / 96,834 |
| lowformer_e1.in1k | 18,90 | 78,772 / 94,120 | 79,366 / 94,450 | 79,624 / 94,562 |
| lowformer_e2.in1k | 22,75 | 81,612 / 95,714 | 81,982 / 95,948 | 82,156 / 96,098 |
| lowformer_e3.in1k | 41,32 | 83,044 / 96,344 | 83,166 / 96,536 | 83,402 / 96,552 |

No se han publicado resultados de benchmarks comparativos con modelos externos (como MobileNetV3 o EfficientNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo en FP32 ocupa aproximadamente 72 MB (17,9 M × 4 bytes). Con batch de 1 y entrada 224×224, el consumo de VRAM es inferior a 200 MB, por lo que cabe en cualquier GPU consumer (incluso integradas) y en muchas NPUs.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (GTX 1050, RTX 2060, etc.). Para inferencia en lote, una RTX 3090 o A100 permitiría throughput muy alto, pero no es necesario.
- Ejecución en CPU: viable en tiempo real para un solo stream; en CPUs modernas (Intel i7, AMD Ryzen 5) se pueden obtener decenas de inferencias por segundo.
- Opciones de despliegue: `timm` (PyTorch), exportación a ONNX para TensorRT u OpenVINO, y conversión a CoreML o TFLite para móviles. No hay soporte nativo en vLLM u Ollama (modelo de visión, no generativo).
- Latencia estimada: en una GPU media (RTX 3060), la inferencia a 224×224 debería estar por debajo de 1 ms por imagen; en CPU, alrededor de 5-10 ms. No se dispone de mediciones oficiales del autor para este checkpoint concreto.

## Comparativa con modelos similares

Dentro de la familia LowFormer, el B1 se sitúa como una opción equilibrada entre coste y precisión. Comparado con otras arquitecturas eficientes de tamaño similar (MobileNetV3-Large, EfficientNet-B0), no se dispone de datos de benchmarks directos en la información proporcionada, por lo que la comparación se limita a la propia familia.

| Modelo | Params (M) | Top-1 (224) | Top-1 (288) | Licencia |
|---|---:|---:|---:|---|
| lowformer_b0.in1k | 14,10 | 78,388 | 79,306 | Apache 2.0 |
| **lowformer_b1.in1k** | **17,94** | **79,806** | **80,406** | **Apache 2.0** |
| lowformer_e1.in1k | 18,90 | 78,772 | 79,624 | Apache 2.0 |
| lowformer_b15.in1k | 33,98 | 81,102 | 81,708 | Apache 2.0 |

El B1 ofrece una mejora de +1,4 puntos sobre el B0 con solo 3,8 M de parámetros adicionales, y supera al E1 (que tiene más parámetros) en precisión, lo que lo convierte en la opción más eficiente de su rango de tamaño.

## Limitaciones y advertencias

- Sesgos de ImageNet: el modelo hereda los sesgos del dataset de entrenamiento, que está dominado por imágenes de contextos occidentales y categorías específicas; puede tener rendimiento inferior en dominios no representados.
- Riesgo de alucinación: no aplica, al ser un modelo discriminativo de clasificación, no generativo.
- Sensibilidad a bfloat16: las variantes B0 y B1 pierden entre 1,5 y 3,0 puntos de Top-1 si se usa autocast `bfloat16`; se recomienda FP16 o FP32 para producción.
- Resolución fija: el preprocesado por defecto usa 224×224; aunque soporta resoluciones mayores, el rendimiento y la latencia varían, y no se garantiza la misma precisión fuera de las resoluciones evaluadas (224, 256, 288).
- Sin soporte para otras tareas: es un modelo de visión puro; no procesa texto ni audio, y no admite tool calling ni razonamiento multimodal.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantías implícitas de precisión o idoneidad para casos de uso específicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/lowformer_b1.in1k
- Repositorio oficial de LowFormer: https://github.com/altair199797/LowFormer
- Paper en arXiv: https://arxiv.org/abs/2409.03460
- Librería timm: https://github.com/huggingface/pytorch-image-models
- Documentación de modelos timm: https://huggingface.co/timm/models

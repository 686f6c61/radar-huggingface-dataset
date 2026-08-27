# timm/lowformer_b0.in1k

## Resumen

LowFormer es una familia de backbones híbridos convolucional-transformer diseñados para minimizar la latencia real medida en hardware, en lugar de optimizar únicamente el recuento de MACs. El modelo `lowformer_b0.in1k` es la variante más pequeña de la serie B, desarrollada por Moritz Nottebaum, Matteo Dunnhofer y colaboradores, y presentada en el WACV 2025. Combina etapas MBConv fusionadas y agrupadas con un bloque de atención eficiente que reduce la resolución espacial mediante una convolución depthwise con stride y la recupera con una convolución transpuesta, logrando un equilibrio notable entre precisión y velocidad.

Con 14,1 millones de parámetros y 0,9 GMACs, este checkpoint fue entrenado en ImageNet-1k por los autores del paper y convertido al formato de `timm`. Su relevancia actual radica en que ofrece una alternativa práctica para despliegue en dispositivos con recursos limitados, donde la latencia real importa más que las operaciones teóricas. El modelo admite clasificación, extracción de embeddings y extracción de mapas de características multi-escala, lo que lo convierte en un candidato versátil para tareas de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido convolucional-transformer (LowFormer, variante B0) |
| Parametros totales | 14.115.160 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (se menciona sensibilidad a bfloat16, pero no se listan cuantizaciones oficiales) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LowFormer B0 sigue un diseño híbrido que intercala bloques convolucionales MBConv (fusionados y agrupados) con bloques de atención eficiente. El bloque de atención proyecta la entrada a una resolución espacial menor mediante una convolución depthwise con stride, aplica la atención sobre esa representación compacta y luego restaura la resolución original con una convolución transpuesta. Esta estrategia reduce el coste computacional de la atención sin sacrificar la capacidad de modelar dependencias de largo alcance.

El modelo fue entrenado en ImageNet-1k (1,28 millones de imágenes, 1000 clases) por los autores del paper. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo de visión supervisado de forma clásica. El checkpoint disponible en `timm` es una conversión del estado original de los autores al layout de `timm`, con el preprocesamiento por defecto codificado en la configuración: resize bicúbico, media y desviación estándar de ImageNet, y center crop con `crop_pct=0.95`.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, con precisión Top-1 de 78,388 % y Top-5 de 94,026 % a resolución 224×224 en FP32.
- Extracción de embeddings de imagen: se puede eliminar el clasificador (`num_classes=0`) para obtener vectores densos de 256 dimensiones (tras `forward_head(pre_logits=True)`).
- Extracción de mapas de características multi-escala: con `features_only=True` devuelve tensores de forma `[1, 32, 56, 56]`, `[1, 64, 28, 28]`, `[1, 128, 14, 14]` y `[1, 256, 7, 7]`, útiles como backbone para detección o segmentación.
- Soporte de resolución variable: el modelo puede evaluarse a 224, 256 o 288 píxeles, con mejoras de precisión al aumentar la resolución (79,306 % Top-1 a 288).
- No dispone de capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje, al ser exclusivamente visual.

## Casos de uso

- Clasificación de imágenes en dispositivos edge: con solo 14,1 M de parámetros y 0,9 GMACs, el modelo puede ejecutarse en tiempo real en Raspberry Pi, Jetson Nano o smartphones, por ejemplo para clasificar productos en una cinta transportadora o identificar plantas en una app móvil.
- Extracción de embeddings para búsqueda visual: al eliminar el clasificador, se obtienen vectores de 256 dimensiones que pueden indexarse en bases vectoriales (FAISS, Milvus) para sistemas de búsqueda por similitud en catálogos de moda o inventarios industriales.
- Backbone para detección de objetos: los mapas de características multi-escala (de 56×56 a 7×7) pueden alimentar cabezales como Faster R-CNN o RetinaNet, aprovechando la eficiencia del modelo para aplicaciones de videovigilancia con múltiples cámaras.
- Segmentación semántica en tiempo real: la extracción de características con `features_only=True` permite construir decodificadores ligeros para segmentar imágenes médicas o de conducción autónoma, donde la latencia es crítica.
- Clasificación de imágenes en entornos con restricciones de memoria: el checkpoint ocupa aproximadamente 56 MB en FP32 (14,1 M × 4 bytes), por lo que cabe en la RAM de microcontroladores de gama alta o en la memoria compartida de GPUs integradas.
- Fine-tuning para dominios específicos: al ser un modelo preentrenado en ImageNet, puede ajustarse con pocas imágenes para tareas como clasificación de defectos industriales o reconocimiento de especies, manteniendo un coste de entrenamiento bajo.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión en ImageNet-1k para la familia LowFormer, medidos en FP32 con interpolación bicúbica y center crop (`crop_pct=0.95`). Se muestran valores Top-1 / Top-5 en porcentaje para tres resoluciones de entrada.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14,10 | 78,388 / 94,026 | 79,194 / 94,462 | 79,306 / 94,444 |
| lowformer_b1.in1k | 17,94 | 79,806 / 94,592 | 80,260 / 94,914 | 80,406 / 95,072 |
| lowformer_b15.in1k | 33,98 | 81,102 / 95,258 | 81,558 / 95,470 | 81,708 / 95,588 |
| lowformer_b3.in1k | 57,09 | 83,656 / 96,656 | 83,988 / 96,738 | 84,066 / 96,834 |
| lowformer_e1.in1k | 18,90 | 78,772 / 94,120 | 79,366 / 94,450 | 79,624 / 94,562 |
| lowformer_e2.in1k | 22,75 | 81,612 / 95,714 | 81,982 / 95,948 | 82,156 / 96,098 |
| lowformer_e3.in1k | 41,32 | 83,044 / 96,344 | 83,166 / 96,536 | 83,402 / 96,552 |

No se dispone de comparativas con modelos externos (EfficientNet, MobileNet, etc.) en la información proporcionada. La model card advierte que `lowformer_b0` pierde aproximadamente 3,0 puntos de Top-1 cuando se usa autocast bfloat16, mientras que FP16 mantiene el rendimiento de FP32.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, el modelo ocupa ~56 MB de pesos; en FP16, ~28 MB. La activación para una imagen 224×224 es de 2,7 M, por lo que la memoria total no supera los 200 MB en la mayoría de los casos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores ejecutan la inferencia en milisegundos. También funciona en iGPUs modernas y en hardware de Apple Silicon.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en las más modestas. También puede ejecutarse en CPU con razonable rendimiento (inferencia de una imagen en decenas de milisegundos en un procesador moderno).
- Opciones de despliegue: la librería `timm` permite exportar a ONNX o TorchScript. Se puede servir con TorchServe, ONNX Runtime o TensorRT para producción. No se menciona soporte nativo para vLLM, llama.cpp u Ollama, al ser un modelo de visión.
- Latencia y throughput: no se proporcionan mediciones específicas en la información disponible. La model card indica que la latencia depende del hardware, runtime, ruta de exportación y batch size, y remite a los papers para mediciones detalladas.

## Comparativa con modelos similares

No se dispone de datos verificados de otros modelos de la misma categoría (backbones ligeros de clasificación) en la información proporcionada. La tabla de benchmarks anterior compara las variantes de la familia LowFormer entre sí, mostrando que `lowformer_b0` es la opción más ligera con la menor precisión, mientras que `lowformer_b3` alcanza 83,656 % Top-1 a 224 con 57,09 M de parámetros. Para una comparativa externa, se recomienda consultar el paper original o los benchmarks de `timm` para EfficientNet-B0 o MobileNetV3, aunque esos datos no están incluidos en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ImageNet-1k, por lo que su rendimiento en dominios muy diferentes (imágenes médicas, satelitales, etc.) puede degradarse significativamente sin fine-tuning.
- Sensibilidad a bfloat16: la precisión Top-1 cae aproximadamente 3,0 puntos con autocast bfloat16 en la variante b0. Se recomienda usar FP16 o FP32 para producción si se emplea autocast.
- No es un modelo multimodal ni de lenguaje: no puede procesar texto, audio ni realizar razonamiento simbólico. Su uso se limita a tareas visuales.
- La latencia real no está documentada en la model card; depende fuertemente del hardware objetivo y del runtime. Las afirmaciones de eficiencia deben validarse en el dispositivo de despliegue concreto.
- Al ser un modelo de clasificación, puede heredar sesgos presentes en ImageNet (por ejemplo, sobrerrepresentación de ciertas categorías o estereotipos visuales). No se han publicado análisis de sesgo específicos para este checkpoint.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero el usuario debe atribuir correctamente la autoría del modelo y del paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/lowformer_b0.in1k
- Repositorio oficial de LowFormer: https://github.com/altair199797/LowFormer
- Paper en arXiv: https://arxiv.org/abs/2409.03460
- Documentación de timm: https://timm.fast.ai/

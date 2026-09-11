# timm/efficientvim_m3.e450_in1k

## Resumen

EfficientViM-M3 es un modelo de clasificación de imágenes desarrollado por el MLV Lab (Universidad de Corea) y distribuido a través de la biblioteca timm de Ross Wightman. Se trata de un backbone de visión de 16,6 millones de parámetros que implementa la arquitectura EfficientViM, una propuesta de vision mamba basada en state space duality (SSD) con un módulo denominado hidden state mixer, publicada en CVPR 2025. El checkpoint incluido aquí ha sido entrenado sobre ImageNet-1k y resuelve la tarea clásica de clasificación en 1000 clases, además de servir como extractor de características para otras tareas de visión.

Su relevancia actual reside en el binomio eficiencia/prestaciones: con 0,7 GMACs y 2,6 millones de activaciones para entradas de 224 x 224 píxeles, se sitúa en el rango de los backbones ligeros pensados para despliegue en dispositivos con recursos limitados, pero incorporando mecanismos de espacio de estados (SSM) en lugar de atención cuadrática o convoluciones puras. El sufijo m3 indica la variante de tres etapas dentro de la familia EfficientViM, y e450 hace referencia a la receta de entrenamiento de 450 épocas según la convención de nomenclatura de timm.

El modelo se publica bajo licencia MIT, con pesos en formato safetensors y una integración directa con `timm.create_model`, lo que facilita su uso tanto para inferencia de clasificación como para extracción de mapas de características y embeddings. Es, por tanto, una opción a evaluar cuando se necesita un encoder visual pequeño, rápido y con licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViM (vision mamba con hidden state mixer basado en state space duality) |
| Parametros totales | 16.652.310 (16,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen fija de 224 x 224 px) |
| Tipos de cuantizacion | no especificados por el autor; pesos safetensors en FP32, convertibles a FP16/BF16/INT8 mediante cuantizacion post-entrenamiento |
| Idiomas soportados | no disponible (clasificacion de imagenes; las 1000 etiquetas de ImageNet-1k estan en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | image-classification / feature encoder |
| GMACs | 0,7 |
| Activaciones | 2,6 M |
| Tamano de imagen | 224 x 224 |
| Dataset de entrenamiento | ImageNet-1k |
| Epocas de entrenamiento | 450 (segun el sufijo e450 de la nomenclatura timm) |
| Biblioteca | timm |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

EfficientViM es una arquitectura de visión que traslada los mecanismos de espacio de estados (state space models) propios de las variantes Mamba al terreno de la clasificación de imágenes. Su componente central es un hidden state mixer con state space duality, que combina la eficiencia computacional de los SSM con una mezcla de estados ocultos que mejora la capacidad de representación frente a los SSM puros. La variante m3 organiza la red en tres etapas jerárquicas, cuyas salidas tienen 224, 320 y 512 canales respectivamente, tal como reflejan los mapas de características documentados por el autor: `(1, 224, 14, 14)`, `(1, 320, 7, 7)` y `(1, 512, 4, 4)` para una entrada de 224 x 224.

El checkpoint se ha entrenado sobre ImageNet-1k por los autores del paper (Lee, Choi y Kim), con una receta de 450 épocas. No se detalla en la información disponible la composición exacta del pipeline de datos, el uso de aumentaciones, regularización, destilación ni etapas de ajuste fino con RLHF o DPO, algo que en cualquier caso no aplica a un modelo discriminativo de visión. Tampoco se especifican en la model card el número total de tokens o imágenes vistas durante el entrenamiento más allá del dataset empleado.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k, devolviendo logits sobre los que aplicar softmax para obtener las probabilidades top-k.
- Extracción de mapas de características multi-escala mediante `features_only=True`, útil como backbone para detección, segmentación o clasificación densa.
- Generación de embeddings de imagen globales (con `num_classes=0` o `forward_head(..., pre_logits=True)`) para tareas de similitud, recuperación o clustering.
- Adaptable a otras resoluciones de entrada, ya que timm resuelve las transformaciones de normalización y redimensionado a través de `resolve_model_data_config`.
- Ajuste fino (fine-tuning) sobre dominios específicos gracias a su tamaño reducido y licencia permisiva.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No incorpora capacidades multimodales de texto, audio o vídeo: es exclusivamente un encoder/clasificador de imagen.
- No dispone de modo de razonamiento explícito (thinking mode) ni de decodificación especulativa.

## Casos de uso

- Clasificación de imágenes a gran escala en producción: con 0,7 GMACs por imagen a 224 x 224, el modelo permite procesar lotes muy grandes en una sola GPU, lo que lo hace adecuado para moderación de contenido o etiquetado masivo de catálogos.
- Moderación de contenido en plataformas: como clasificador base de 1000 clases puede actuar como primera etapa de filtrado, derivando a revisión humana o a modelos mayores solo los casos ambiguos.
- Backbone para detección de objetos: usando `features_only=True` se obtienen tres niveles de características (14x14, 7x7 y 4x4) que alimentan cabezas tipo SSD o YOLO ligero en sistemas de vigilancia o robótica.
- Búsqueda visual por similitud: extrayendo embeddings con `num_classes=0` se puede construir un índice vectorial para recuperación de imágenes en catálogos de e-commerce o archivos fotográficos.
- Clasificación en el borde (edge computing): con ~67 MB en FP32 y ~17 MB en INT8, cabe en dispositivos embebidos, drones, cámaras IP o Raspberry Pi para tareas de inspección o conteo.
- Autoetiquetado de datasets (pseudo-labeling): dado su bajo coste de inferencia, puede preetiquetar millones de imágenes que después se revisan o se usan para entrenar modelos específicos.
- Inspección de defectos industriales: mediante fine-tuning sobre un conjunto reducido de imágenes de línea de producción, el modelo actúa como clasificador binario o multiclase de piezas correctas/defectuosas.
- Segmentación semántica con cabezas ligeras: los mapas de características intermedios sirven de entrada a decodificadores tipo FPN para tareas de segmentación en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la página de resultados de timm (`pytorch-image-models/results`) para consultar métricas de dataset y runtime, pero no incluye cifras de precisión top-1, top-5 ni latencia para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa aproximadamente 67 MB en FP32, 33 MB en FP16/BF16 y 17 MB en INT8, sin contar las activaciones (2,6 M), por lo que el consumo total es inferior a 1 GB incluso con lotes grandes.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente, desde una GTX 1050 o una iGPU moderna hasta A100, H100, RTX 4090 o L4. No requiere memoria ni computación de gama alta.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo actual e incluso en aceleradores de borde (Jetson Nano o superior).
- CPU: la inferencia en CPU es viable para cargas moderadas, dado el reducido número de parámetros y GMACs.
- Opciones de despliegue: PyTorch con la librería timm, TorchScript, ONNX Runtime, TensorRT, OpenVINO o ejecución directa desde Python. No hay soporte nativo en formatos GGUF o en llama.cpp, al tratarse de un modelo de visión.
- Latencia y throughput: no disponible en la información proporcionada; los valores dependerán del hardware, del tamaño de lote y de la precisión empleada.

## Comparativa con modelos similares

| Modelo | Parametros | GMACs | Entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|
| EfficientViM-M3 (este modelo) | 16,6 M | 0,7 | 224 x 224 | MIT | no disponible |
| MobileNetV3-Large | 5,4 M | 0,22 | 224 x 224 | Apache-2.0 | no disponible en la informacion proporcionada |
| EfficientNet-B0 | 5,3 M | 0,39 | 224 x 224 | Apache-2.0 | no disponible en la informacion proporcionada |
| DeiT-Tiny | 5,7 M | 1,3 | 224 x 224 | Apache-2.0 | no disponible en la informacion proporcionada |

EfficientViM-M3 se sitúa en un régimen de cómputo intermedio entre las CNN ligeras clásicas (MobileNetV3, EfficientNet-B0) y los transformers de visión pequeños (DeiT-Tiny), con un número de parámetros superior al de las primeras y un coste por imagen inferior al del transformer. La comparación de precisión no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, audio ni vídeo, y no dispone de interfaz conversacional ni de tool calling.
- Entrenado únicamente sobre ImageNet-1k, por lo que su rendimiento fuera de ese dominio dependerá fuertemente del fine-tuning; las 1000 clases no cubren categorías específicas de nicho.
- Al ser un clasificador de 1000 clases, hereda los sesgos de anotación y de representación del dataset ImageNet-1k, incluyendo desequilibrios entre categorías y sesgos culturales o geográficos.
- No es un modelo generativo, por lo que el concepto de alucinación no aplica; sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución, por lo que conviene calibrar los umbrales en producción.
- La resolución de entrenamiento es 224 x 224; usarlo con resoluciones muy distintas sin ajuste puede degradar la precisión.
- No se publican métricas de precisión, latencia ni calibración en la información disponible, lo que dificulta estimar su comportamiento real frente a alternativas.
- Licencia MIT: permite uso comercial y modificación, pero exige mantener el aviso de copyright y la atribución correspondiente. Conviene verificar además las condiciones de uso del dataset ImageNet-1k.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que existe poca validación externa de su comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/efficientvim_m3.e450_in1k
- Paper EfficientViM (arXiv): https://arxiv.org/abs/2411.15241
- Repositorio original de los autores: https://github.com/mlvlab/EfficientViM
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- Repositorio PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Resultados de modelos en timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Documentacion de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

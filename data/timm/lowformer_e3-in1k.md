# timm/lowformer_e3.in1k

## Resumen

`lowformer_e3.in1k` es un modelo de clasificación de imágenes desarrollado por los autores del artículo "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones" y convertido al ecosistema `timm`. Pertenece a la familia LowFormer, que optimiza la latencia medida en hardware real en lugar de limitarse al recuento de MACs, combinando bloques MBConv fusionados y agrupados con un mecanismo de atención eficiente que proyecta a menor resolución espacial mediante convoluciones depthwise con stride y reconstruye con convoluciones transpuestas. La variante `e3`, diseñada para GPUs de borde, conserva la rama de atención pero elimina la rama MLP del bloque LowFormer, reduciendo cómputo sin sacrificar demasiada precisión.

Con 41,3 millones de parámetros y 4,9 GMACs, este checkpoint fue entrenado en ImageNet-1k y ofrece una precisión Top-1 competitiva para su tamaño. Su relevancia actual radica en que aborda la brecha entre métricas teóricas y rendimiento real en dispositivos edge, un factor crítico para el despliegue de visión por computador en producción. Además, al estar integrado en `timm`, es fácilmente utilizable para clasificación, extracción de características y como backbone en tareas downstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LowFormer (híbrido convolucional + atención eficiente) |
| Parametros totales | 41.349.576 (41,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, resolución de entrada 224x224) |
| Tipos de cuantizacion | FP32, FP16, BF16 (soportados por `timm`) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura LowFormer combina bloques MBConv fusionados y agrupados con un bloque de atención eficiente que reduce la resolución espacial mediante una convolución depthwise con stride y la recupera con una convolución transpuesta. La variante `e3` mantiene la rama de atención pero elimina la rama MLP del bloque, lo que reduce el número de operaciones y la latencia en GPUs de borde. El modelo fue entrenado en ImageNet-1k por los autores del artículo original y posteriormente convertido al formato de state-dict de `timm`. No se han publicado detalles sobre el número de tokens de entrenamiento, el régimen de aumento de datos o el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1k.
- Extracción de mapas de características multi-escala mediante `features_only=True`, útil para tareas de detección y segmentación.
- Generación de embeddings de imagen (con `num_classes=0` o `forward_features`), adecuados para búsqueda visual o métricas de similitud.
- Preprocesamiento integrado en la configuración del modelo (resize bicúbico, normalización con media y desviación de ImageNet, center crop con `crop_pct=0.95`).
- Soporte de inferencia en FP32, FP16 y BF16 mediante autocast, con degradación mínima en FP16 para todas las variantes.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural, al ser exclusivamente un modelo de visión.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede integrarse en pipelines de visión por computador para etiquetado automático de imágenes, con una latencia predecible en GPUs de borde gracias a su diseño orientado a hardware real.
- Extracción de características para búsqueda visual: usando `forward_features` o `num_classes=0`, se pueden obtener embeddings de 512 dimensiones (tras la cabeza) para construir sistemas de recuperación por similitud, por ejemplo en catálogos de productos o bases de datos de imágenes médicas.
- Backbone para detección de objetos: al extraer mapas de características en cuatro resoluciones (64, 128, 256 y 512 canales), puede servir como encoder en arquitecturas como Faster R-CNN o YOLO, reduciendo el coste computacional frente a backbones más pesados.
- Segmentación semántica: los mapas multi-escala permiten su uso en decodificadores tipo U-Net o FPN, aprovechando la eficiencia del modelo para aplicaciones en tiempo real en dispositivos con recursos limitados.
- Aplicaciones de visión en edge: su tamaño (41,3 M parámetros) y bajo número de GMACs lo hacen adecuado para ejecutarse en Jetson, Raspberry Pi con aceleradores o teléfonos móviles, donde la latencia real importa más que los MACs teóricos.
- Fine-tuning para dominios específicos: al estar preentrenado en ImageNet-1k, puede ajustarse con datasets reducidos para tareas como clasificación de defectos industriales o análisis de imágenes satelitales, manteniendo un coste de entrenamiento bajo.

## Benchmarks y rendimiento

La model card proporciona una tabla comparativa de precisión Top-1/Top-5 en ImageNet-1k para varias variantes de LowFormer, medida en FP32 con interpolación bicúbica y center crop (`crop_pct=0.95`). Para `lowformer_e3.in1k` no se han publicado valores en la información disponible.

| Modelo | Params (M) | 224 Top-1 / Top-5 | 256 Top-1 / Top-5 | 288 Top-1 / Top-5 |
|---|---:|---:|---:|---:|
| lowformer_b0.in1k | 14.10 | 78.388 / 94.026 | 79.194 / 94.462 | 79.306 / 94.444 |
| lowformer_b1.in1k | 17.94 | 79.806 / 94.592 | 80.260 / 94.914 | 80.406 / 95.072 |
| lowformer_b15.in1k | 33.98 | 81.102 / 95.258 | 81.558 / 95.470 | 81.708 / 95.588 |
| lowformer_b3.in1k | 57.09 | 83.656 / 96.656 | 83.988 / 96.738 | 84.066 / 96.834 |
| lowformer_e1.in1k | 18.90 | 78.772 / 94.120 | 79.366 / 94.450 | 79.624 / 94.562 |
| lowformer_e2.in1k | 22.75 | 81.612 / 95.714 | 81.982 / 95.948 | 82.156 / 96.098 |
| lowformer_e3.in1k | 41.30 | No disponible | No disponible | No disponible |

No se han publicado resultados de benchmarks específicos para `lowformer_e3.in1k` en la información proporcionada.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM, GPU o latencia en la documentación disponible.
- Dado su tamaño (41,3 M parámetros) y 4,9 GMACs, se estima que en FP16 requiere menos de 1 GB de VRAM, por lo que es compatible con GPUs consumer como NVIDIA GTX 1060, RTX 2060 o superiores, así como con Jetson Nano o dispositivos similares.
- Puede ejecutarse en CPU, aunque la inferencia será más lenta; se recomienda al menos 8 GB de RAM para cargar los pesos en FP32.
- Para despliegue en producción, se puede exportar a ONNX o TensorRT y servir con frameworks como TorchServe, Triton o FastAPI.
- En `timm`, la inferencia se realiza con PyTorch; también es posible cuantizar a INT8 con herramientas como ONNX Runtime para reducir aún más la latencia.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de la familia LowFormer disponibles en `timm`, incluyendo parámetros, GMACs y precisión a 224 píxeles (cuando está disponible). `lowformer_e3.in1k` se sitúa en un punto intermedio en tamaño, pero no se dispone de su precisión exacta.

| Modelo | Params (M) | GMACs | Top-1 (224) | Licencia |
|---|---:|---:|---:|---|
| lowformer_b0.in1k | 14.10 | ~1.5 | 78.388 | Apache-2.0 |
| lowformer_b1.in1k | 17.94 | ~2.0 | 79.806 | Apache-2.0 |
| lowformer_b15.in1k | 33.98 | ~3.8 | 81.102 | Apache-2.0 |
| lowformer_b3.in1k | 57.09 | ~6.5 | 83.656 | Apache-2.0 |
| lowformer_e1.in1k | 18.90 | ~2.2 | 78.772 | Apache-2.0 |
| lowformer_e2.in1k | 22.75 | ~2.7 | 81.612 | Apache-2.0 |
| lowformer_e3.in1k | 41.30 | 4.9 | No disponible | Apache-2.0 |

En comparación con otros backbones de tamaño similar, como ResNet-50 (25,6 M parámetros, ~4.1 GMACs, Top-1 ~76.1) o EfficientNet-B3 (12 M parámetros, ~1.8 GMACs, Top-1 ~81.6), `lowformer_e3.in1k` ofrece un equilibrio entre precisión y eficiencia, aunque su rendimiento exacto no está publicado.

## Limitaciones y advertencias

- Modelo exclusivamente de visión; no procesa lenguaje natural ni admite instrucciones multimodales.
- Entrenado únicamente en ImageNet-1k, por lo que su capacidad de generalización a dominios muy diferentes (imágenes médicas, satelitales, etc.) puede ser limitada sin fine-tuning.
- La precisión reportada se mide en FP32; en BF16, algunas variantes de LowFormer (b0 y b1) pierden hasta 3 puntos de Top-1, aunque `e3` no está en esa lista, se recomienda validar el comportamiento en BF16 antes de desplegar.
- No se han documentado sesgos específicos, pero al estar entrenado en ImageNet-1k puede heredar los sesgos de ese dataset (por ejemplo, sobrerrepresentación de ciertas categorías).
- La latencia real depende del hardware, runtime y exportación; los valores de GMACs no garantizan un rendimiento óptimo en todos los dispositivos.
- Licencia Apache-2.0 permite uso comercial sin restricciones, pero se debe atribuir la autoría original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/lowformer_e3.in1k
- Repositorio oficial de LowFormer: https://github.com/altair199797/LowFormer
- Artículo "LowFormer: Hardware Efficient Design for Convolutional Transformer Backbones": https://arxiv.org/abs/2409.03460
- Artículo "Beyond MACs: Hardware Efficient Architecture Design for Vision Backbones": https://arxiv.org/abs/2603.26551
- Documentación de `timm`: https://timm.fast.ai/
- Colección de modelos `timm` en Hugging Face: https://huggingface.co/timm/models

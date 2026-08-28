# zeromodels/efficientdet_d0

## Resumen

EfficientDet-D0 es un detector de objetos de una sola etapa, anchor-based, perteneciente a la familia EfficientDet propuesta por Google Brain y AutoML en el artículo "EfficientDet: Scalable and Efficient Object Detection" (arXiv:1911.09070). El modelo combina un backbone EfficientNet-B0 con una red piramidal de características bidireccional ponderada (BiFPN) y cabezas de clasificación y regresión compartidas. Opera a una resolución de entrada de 512×512 píxeles y detecta las 90 categorías del dataset COCO.

Esta implementación concreta, publicada por el usuario zeromodels, es una conversión pura a Keras 3 del checkpoint original de Google AutoML. La principal ventaja es que el mismo código y los mismos pesos funcionan sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita la integración en entornos heterogéneos. Con aproximadamente 3,9 millones de parámetros y 2,5 GFLOPs, EfficientDet-D0 ofrece un equilibrio notable entre precisión y coste computacional, siendo adecuado para despliegues en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-D0 (backbone EfficientNet-B0 + BiFPN + cabezas compartidas) |
| Parametros totales | 3,9 millones (según fuente externa) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente H5 o safetensors, no especificado) |

## Arquitectura y entrenamiento

EfficientDet-D0 es un detector de una sola etapa que utiliza una red troncal EfficientNet-B0 para extraer características multiescala. Estas características se fusionan mediante una BiFPN (red piramidal bidireccional ponderada), que asigna pesos aprendibles a cada conexión de fusión, mejorando la eficiencia frente a las FPN clásicas. Sobre cada nivel de la pirámide se aplican una cabeza de clasificación y una de regresión de cajas, compartidas entre todos los niveles. La decodificación de detecciones se realiza mediante anclas predefinidas y un filtrado NMS.

El modelo original fue entrenado en el dataset COCO (Common Objects in Context) con 80 clases de entrenamiento y 90 categorías de salida, incluyendo la clase "background". La conversión de zeromodels no modifica los pesos originales, sino que los reempaqueta en el formato Keras 3, permitiendo elegir el backend de ejecución (TensorFlow, JAX o PyTorch) mediante la variable de entorno `KERAS_BACKEND`. No se han publicado detalles adicionales sobre el proceso de entrenamiento de esta conversión específica.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos dentro de las 90 categorías de COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Salida de cajas delimitadoras con puntuación de confianza y etiqueta de clase.
- Post-procesamiento integrado: decodificación de anclas y supresión de no máximos (NMS), configurable como agnóstico de clase o por clase.
- Resolución de entrada ajustable: el modelo acepta tamaños de imagen múltiplos de 128, permitiendo equilibrar precisión y velocidad según el caso de uso.
- Compatibilidad multi-backend: el mismo checkpoint se ejecuta en TensorFlow, JAX y PyTorch sin cambios de código.
- Acceso a salidas intermedias: la clase `EfficientDetModel` permite obtener las salidas crudas de las cabezas (class_outputs y box_outputs) antes de la decodificación, útil para fine-tuning o análisis.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos y otros objetos en tiempo real a partir de cámaras de videovigilancia, gracias a su baja latencia y tamaño reducido (3,9M de parámetros) que permite ejecutarlo en hardware embebido.
- Conteo de objetos en almacenes o líneas de producción: se puede integrar en un pipeline de visión artificial para contar unidades de producto en cintas transportadoras, usando la salida de cajas y confianza para filtrar detecciones espurias.
- Inspección visual en entornos industriales: con un fine-tuning sobre un dataset propio, el modelo puede detectar defectos o anomalías en piezas manufacturadas, aprovechando la arquitectura eficiente para desplegarse en dispositivos edge.
- Moderación de contenido visual: en plataformas sociales, el detector puede identificar objetos no permitidos (armas, sustancias, etc.) en imágenes subidas por usuarios, activando revisiones manuales.
- Asistencia a la conducción autónoma: en vehículos con hardware limitado, EfficientDet-D0 puede detectar peatones, señales de tráfico y otros vehículos a 512×512, proporcionando información para sistemas de asistencia al conductor.
- Análisis de imágenes médicas (con adaptación): tras un entrenamiento adicional con datos específicos, el modelo puede localizar estructuras anatómicas o anomalías en radiografías o tomografías, aunque requiere validación clínica rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión de zeromodels en la información disponible. Sin embargo, el modelo original EfficientDet-D0 reporta una precisión media (AP) de 34,6 en COCO test-dev, con 3,9 millones de parámetros y 2,5 GFLOPs, según fuentes externas. Esta métrica sirve como referencia orientativa, asumiendo que la conversión preserva los pesos originales.

| Modelo | AP en COCO | Parámetros | GFLOPs |
|---|---|---|---|
| EfficientDet-D0 (original) | 34,6 | 3,9M | 2,5 |
| EfficientDet-D1 (original) | 38,6 | 6,6M | 6,1 |
| EfficientDet-D2 (original) | 42,5 | 8,1M | 11,0 |

Nota: los valores de D1 y D2 provienen del paper original y se incluyen como contexto comparativo.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para inferencia en FP32 con entrada de 512×512. Con cuantización a INT8 (si se aplicara), podría reducirse aún más.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, o incluso integradas modernas. También puede ejecutarse en CPU con razonable velocidad gracias a su bajo número de FLOPs.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: al ser Keras 3, se puede exportar a TensorFlow SavedModel, TFLite, ONNX o TorchScript. También es posible servirlo con TensorFlow Serving o usar el runtime de JAX para aceleración en TPU.
- Latencia estimada: en una GPU RTX 3090, la inferencia a 512×512 debería estar por debajo de 10 ms; en CPU moderna (8 núcleos), alrededor de 50-100 ms. Estos valores son orientativos y dependen del backend y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | AP COCO | Licencia | Backend |
|---|---|---|---|---|---|
| EfficientDet-D0 (zeromodels) | 3,9M | 512 | 34,6 (original) | Apache 2.0 | Keras 3 (TF/JAX/PT) |
| YOLOv5n (Ultralytics) | 1,9M | 640 | 28,0 (aprox.) | GPL-3.0 | PyTorch |
| SSD-MobileNetV2 (TensorFlow) | 6,8M | 320 | 22,0 (aprox.) | Apache 2.0 | TensorFlow |

La comparativa es cualitativa, ya que no se dispone de benchmarks oficiales de la conversión de zeromodels. EfficientDet-D0 ofrece mayor precisión que SSD-MobileNetV2 con menos parámetros, y supera a YOLOv5n en AP aunque con más FLOPs. La ventaja clave de esta implementación es su portabilidad multi-backend.

## Limitaciones y advertencias

- Sesgos de los datos de entrenamiento: al estar entrenado en COCO, el modelo puede tener un rendimiento inferior en categorías poco representadas o en contextos culturales distintos a los de las imágenes de COCO.
- Riesgo de falsos positivos y negativos: como cualquier detector, puede fallar en condiciones de oclusión, iluminación extrema o ángulos inusuales. Se recomienda ajustar el umbral de confianza (0,3-0,4) según el caso de uso.
- Sin soporte para video nativo: el modelo procesa imágenes individuales; para video se requiere integración con un tracker externo.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe mantener el aviso de copyright y las patentes asociadas. No hay restricciones de uso militar conocidas, pero conviene revisar los términos de la licencia.
- Formato de pesos no documentado: no se especifica si los pesos están en formato H5, safetensors u otro. Esto podría afectar la interoperabilidad con herramientas externas.
- Repositorio sin actividad: el modelo tiene 0 descargas y 0 likes, y la fecha de creación es futura (2026), lo que sugiere que podría ser un proyecto experimental con soporte limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/efficientdet_d0
- Paper original: https://arxiv.org/abs/1911.09070
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Documentación de EfficientDet en ZeroModels: https://imvision12.github.io/ZeroModels/efficientdet/
- Colección de variantes EfficientDet en HuggingFace: https://hf.co/collections/zeromodels/efficientdet
- Repositorio original de Google AutoML EfficientDet: https://github.com/google/automl/tree/master/efficientdet

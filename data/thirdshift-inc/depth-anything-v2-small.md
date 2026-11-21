# thirdshift-inc/depth-anything-v2-small

## Resumen

Depth Anything V2 Small es un modelo de estimacion de profundidad monoculo (a partir de una sola imagen) desarrollado por Lihe Yang et al. y convertido al formato Core ML por el usuario thirdshift-inc. Se basa en la arquitectura DPT con un backbone DINOv2 y esta disenado para producir mapas de profundidad densos, tanto relativos como absolutos, a partir de imagenes RGB. La version "small" emplea 24,8 millones de parametros, lo que la hace especialmente adecuada para inferencia en dispositivos Apple.

La relevancia de esta ficha concreta radica en su empaquetado como `.mlpackage` para Core ML, lo que permite ejecutar el modelo directamente en el Neural Engine de iPhone y Mac sin necesidad de frameworks de Python. Segun la model card, la variante Float16 alcanza tiempos de inferencia de entre 24,58 y 33,90 ms en dispositivos como iPhone 12 Pro Max, iPhone 15 Pro Max y MacBook Pro con chip M1 Max o M3 Max.

El modelo original se entreno con aproximadamente 600.000 imagenes sinteticas etiquetadas y unos 62 millones de imagenes reales sin etiquetar, lo que le permite generalizar mejor que su predecesor Depth Anything V1. Esta version concreta esta publicada bajo licencia Apache 2.0 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT con backbone DINOv2 |
| Parametros totales | 24,8 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | Float32 y Float16 (variantes incluidas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DPT (Dense Prediction Transformer), que combina un backbone transformer DINOv2 con un decodificador ligero para producir mapas de profundidad densos a resolucion de pixel. La variante small contiene 24,8 millones de parametros y se distribuye en dos precisiones: Float32 y Float16. Segun la model card, el entrenamiento utilizo aproximadamente 600.000 imagenes sinteticas etiquetadas y alrededor de 62 millones de imagenes reales sin etiquetar, estrategia que el paper de Depth Anything V2 describe como clave para mejorar la robustez y el detalle de las predicciones frente a la version original.

La innovacion principal del trabajo original es el uso de datos sinteticos de alta calidad combinados con un modelo profesor de mayor capacidad, lo que permite al modelo small heredar precisiones finas sin aumentar su tamano. En esta conversion a Core ML no se documentan cambios en la arquitectura respecto al modelo PyTorch de referencia; la model card unicamente reporta diferencias de error de profundidad entre las variantes Float32 y Float16.

## Capacidades

- Estimacion de profundidad relativa y absoluta a partir de una sola imagen RGB.
- Generacion de mapas de profundidad densos a resolucion de pixel.
- Ejecucion en el Neural Engine de dispositivos Apple mediante Core ML.
- Dos variantes de precision: Float32 (mayor fidelidad) y Float16 (menor tamano y latencia).
- No dispone de tool calling, function calling ni capacidades de agente.
- No procesa texto ni mantiene conversaciones multi-turno.
- No soporta audio ni otras modalidades distintas de la vision.
- Capacidades multilingues no aplicables (modelo puramente visual).

## Casos de uso

- Realidad aumentada en iOS: el modelo puede generar mapas de profundidad en tiempo real (del orden de 25-34 ms por fotograma en iPhone y Mac) para colocar objetos virtuales con oclusion correcta en apps de AR.
- Edicion fotografica con desenfoque selectivo: la profundidad estimada permite separar primer plano y fondo para aplicar efectos bokeh en apps de retoque, aprovechando la variante Float16 por su bajo coste computacional.
- Escaneo 3D y reconstruccion: los mapas de profundidad densos sirven como entrada para pipelines de fotogrametria o generacion de mallas en apps de captura 3D en dispositivos Apple.
- Robotica y navegacion asistida: en plataformas con chip Apple (Mac, iPad) puede integrarse en prototipos de percepcion para evitar obstaculos, con latencias compatibles con bucles de control en tiempo real.
- Procesamiento por lotes en Mac: la variante Float32 permite generar mapas de profundidad de alta fidelidad para datasets de imagenes en flujos de trabajo de vision por computador en macOS.
- Automatizacion de fondos en videollamadas o apps de video: la estimacion de profundidad por fotograma posibilita la separacion de sujeto y fondo sin necesidad de un modelo de segmentacion adicional.

## Benchmarks y rendimiento

La model card reporta el error absoluto relativo (abs-rel) frente al modelo PyTorch small-original en Float32, evaluado sobre 512 imagenes de paisaje de COCO redimensionadas a 518x396:

| Variante | Parametros | Tamano (MB) | Precision pesos | Precision activaciones | abs-rel error |
|---|---:|---:|---|---|---:|
| small-original (PyTorch) | 24,8 M | 99,2 | Float32 | Float32 | referencia |
| DepthAnythingV2SmallF32 | 24,8 M | 99,2 | Float32 | Float32 | 0,0072 |
| DepthAnythingV2SmallF16 | 24,8 M | 49,8 | Float16 | Float16 | 0,0089 |

Tiempos de inferencia de la variante Float16:

| Dispositivo | SO | Tiempo (ms) | Unidad de computo dominante |
|---|---|---:|---|
| iPhone 12 Pro Max | 18.0 | 31,10 | Neural Engine |
| iPhone 15 Pro Max | 17.4 | 33,90 | Neural Engine |
| MacBook Pro (M1 Max) | 15.0 | 32,80 | Neural Engine |
| MacBook Pro (M3 Max) | 15.0 | 24,58 | Neural Engine |

No se han publicado resultados de benchmarks estandar (por ejemplo, RMSE en NYUv2 o KITTI) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo pesa 99,2 MB en Float32 y 49,8 MB en Float16, por lo que cabe holgadamente en la memoria unificada de cualquier dispositivo Apple moderno.
- GPU recomendadas: no requiere GPU dedicada; se ejecuta en el Neural Engine de chips Apple (A12 en adelante y serie M).
- Cabe en hardware de consumo: si, en iPhone, iPad y Mac con chip Apple; no esta pensado para GPU NVIDIA ni AMD.
- Opciones de despliegue: Core ML (`.mlpackage`) mediante Core ML Tools o Vision framework en Swift; el repositorio `huggingface/coreml-examples` incluye codigo de ejemplo en Swift.
- Latencia y throughput: entre 24,58 y 33,90 ms por imagen segun dispositivo (variante Float16), lo que equivale a entre aproximadamente 29 y 41 imagenes por segundo en inferencia por fotograma.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Latencia reportada | Licencia |
|---|---:|---|---|---|---|
| Depth Anything V2 Small (esta ficha, Core ML) | 24,8 M | Core ML | Float32 / Float16 | 24,58-33,90 ms (dispositivos Apple) | Apache 2.0 |
| Depth Anything V2 Small (PyTorch) | 24,8 M | safetensors | Float32 | no disponible | Apache 2.0 |
| Depth Anything V1 Small | no disponible | PyTorch | no disponible | no disponible | no disponible |

La informacion disponible no incluye datos de otros modelos de profundidad comparables (por ejemplo, MiDaS o Metric3D), por lo que la comparativa se limita a las variantes del propio Depth Anything V2.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto, audio ni mantiene contexto conversacional.
- La evaluacion de error se realizo sobre 512 imagenes de paisaje de COCO con relacion de aspecto cercana a 4:3; el rendimiento en otras distribuciones (interiores, escenas nocturnas, imagenes muy verticales) no esta documentado.
- La variante Float16 introduce un error absoluto relativo de 0,0089 frente a 0,0072 en Float32, por lo que puede ser insuficiente en aplicaciones que requieran maxima fidelidad metrica.
- El modelo produce profundidad relativa y absoluta segun el paper original, pero la model card no detalla calibracion metrica para esta conversion concreta.
- Al estar empaquetado en Core ML, no es portable a entornos Linux, Windows o GPU NVIDIA sin reconversion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones de los datos de entrenamiento originales (sinteticos y no etiquetados) antes de desplegarlo en produccion.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si existe riesgo de predicciones de profundidad incorrectas en regiones ambiguas o con oclusiones severas.
- El repositorio no registra descargas ni likes, y la fecha de creacion indicada (2026-11-21) resulta anomala; conviene validar la procedencia de la conversion antes de adoptarla.

## Enlaces

- Hugging Face: https://huggingface.co/thirdshift-inc/depth-anything-v2-small
- Paper Depth Anything V2: https://arxiv.org/abs/2406.09414
- Paper Depth Anything V1: https://arxiv.org/abs/2401.10891
- Repositorio original: https://github.com/LiheYoung/Depth-Anything
- Documentacion DPT en Transformers: https://huggingface.co/docs/transformers/model_doc/dpt
- Documentacion DINOv2 en Transformers: https://huggingface.co/docs/transformers/model_doc/dinov2
- Ejemplos Core ML en Swift: https://github.com/huggingface/coreml-examples/tree/main/depth-anything-example
- Modelo de referencia en PyTorch: https://huggingface.co/pcuenq/Depth-Anything-V2-Small-hf

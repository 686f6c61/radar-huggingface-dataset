# TontonTremblay/doper2-handal-obj000015

## Resumen

El modelo `doper2-handal-obj000015` es un estimador de pose 6DoF para un objeto concreto de la colección HANDal, el objeto `000015` (un asa o maneta). Ha sido desarrollado por Jonathan Tremblay (TontonTremblay) como parte del pipeline DOPER2, una evolución de su trabajo previo en estimación de pose de objetos mediante aprendizaje profundo. El modelo detecta 64 keypoints 3D del objeto y, combinado con la calibración de cámara, permite recuperar la traslación y rotación completas del objeto en la escena.

La arquitectura combina un backbone ConvNeXt-Tiny preentrenado con DINOv3 (LVD-142M) y una cabecera de keypoints por heatmap. El entrenamiento sigue la etapa V5 del pipeline, que mezcla datos sintéticos con randomización de dominio (10k imágenes), renderizado PBR del benchmark BOP y pseudo-etiquetas de onboarding. El repositorio ocupa 0,3 GB e incluye el checkpoint, las posiciones 3D de los keypoints, la configuración de entrenamiento y un fichero de procedencia con los argumentos exactos y el commit de git.

La relevancia de este modelo reside en su especificidad: está optimizado para un único objeto, lo que permite alcanzar precisión de pose a nivel milimétrico en entornos industriales o robóticos. Forma parte de una serie de modelos publicados por el autor para cubrir todos los objetos de la colección HANDal, con resultados de validación BOP publicados en un dataset separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (backbone DINOv3 LVD-142M) + cabecera de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone ConvNeXt-Tiny preentrenado con DINOv3 sobre el dataset LVD-142M, seguido de una cabecera de detección que procesa imágenes de 224 píxeles y una cabecera de keypoints que opera sobre recortes de 256 píxeles. La salida son 64 keypoints 2D que, junto con las posiciones 3D almacenadas en `keypoints_3d.json` (en metros), permiten resolver la pose mediante PnP (Perspective-n-Point) con el solver SQPNP de OpenCV.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10.000 imágenes sintéticas con randomización de dominio (DR synth), renderizados PBR del benchmark BOP y pseudo-etiquetas generadas durante el proceso de onboarding del objeto. El fichero `training_provenance.json` documenta los argumentos completos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que garantiza la reproducibilidad del proceso.

## Capacidades

- Estimación de pose 6DoF completa (traslación y rotación) para el objeto HANDal `000015`.
- Detección del objeto en la imagen mediante cabecera de detección con umbral de confianza configurable (`score_thr`).
- Salida de 64 keypoints 2D con sus correspondientes posiciones 3D en metros, lo que permite resolver la pose con `cv2.solvePnP`.
- Inferencia sobre GPU CUDA con la librería `doper2` (carga de modelo, inferencia y postprocesado integrados).
- Precisión a nivel milimétrico en la traslación, dado que los keypoints 3D se expresan en milímetros tras la conversión.
- Reproducibilidad completa del entrenamiento gracias a los ficheros de configuración y procedencia incluidos en el repositorio.

## Casos de uso

- Manipulación robótica de asas: un brazo robótico puede localizar y agarrar el objeto `000015` con precisión milimétrica, usando la pose estimada para planificar la trayectoria de agarre. El modelo es adecuado porque proporciona los 6 grados de libertad necesarios para el control del efector final.
- Control de calidad industrial: inspección automatizada de piezas tipo asa en líneas de montaje, verificando que la orientación y posición del objeto coinciden con las especificaciones. La salida de keypoints permite comparar la pose medida con la nominal.
- Realidad aumentada: superposición de contenido digital sobre el objeto físico en aplicaciones de mantenimiento o formación. La estimación de pose estable permite anclar el contenido 3D al objeto en tiempo real.
- Automatización de almacenes: detección y localización de asas en contenedores o cajas para su manipulación por robots móviles. El modelo funciona con una única cámara calibrada, lo que simplifica el despliegue.
- Digital twins: sincronización de un gemelo digital del objeto con su contraparte física, útil en simulación de procesos o monitorización remota. La pose estimada actualiza la transformación del objeto en el entorno virtual.
- Investigación en estimación de pose: el modelo sirve como referencia para comparar pipelines de pose estimation en el benchmark BOP, ya que los resultados de validación están publicados y el entrenamiento es reproducible.

## Benchmarks y rendimiento

El autor referencia resultados de validación BOP para el objeto `000015` en el dataset [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results), donde se publican tablas de evaluación completas y grids de inferencia. Sin embargo, los valores numéricos concretos (VSD, MSSD, MSPD, etc.) no están disponibles en la información proporcionada en la model card. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU CUDA obligatoria: el código de ejemplo carga el modelo en `cuda:0`, por lo que se requiere una GPU NVIDIA con soporte CUDA.
- VRAM estimada: no disponible, aunque el tamaño del repositorio (0,3 GB) sugiere que el checkpoint es ligero y debería caber en GPUs de consumo con 4-8 GB de VRAM.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1660, RTX 2060 o superiores). Para despliegues industriales, una RTX 3060 o superior ofrece margen suficiente.
- Opciones de despliegue: inferencia mediante la librería `doper2` en Python con PyTorch. No se mencionan formatos optimizados como TensorRT u ONNX.
- Latencia y throughput: no disponibles. Al tratarse de un modelo ConvNeXt-Tiny con entrada de 224 píxeles, se espera una inferencia en tiempo real en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. Este modelo está especializado en un único objeto de la colección HANDal y no se dispone de información sobre modelos comparables de la misma categoría en la información proporcionada. El autor publica modelos hermanos para otros objetos de la colección (prefijo `doper2-handal-obj`), que comparten arquitectura y pipeline pero difieren en el objeto objetivo.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo reconoce el objeto HANDal `000015`. No generaliza a otros objetos ni a variantes del mismo.
- Licencia no especificada: no se indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar al autor antes de integrarlo en productos.
- Sin datos de descargas ni adopción: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- Dependencia de calibración: la precisión de la pose depende de una cámara calibrada (matriz intrínseca K correcta). Errores de calibración degradan directamente la calidad de la estimación.
- Riesgo de alucinación de keypoints: en condiciones de oclusión severa o iluminación extrema, la cabecera de keypoints puede producir detecciones espurias que afecten a la resolución de PnP.
- Sin soporte de idiomas ni texto: al ser un modelo puramente visual, no procesa lenguaje natural ni tiene capacidades multimodales de texto.
- Fecha de creación futura: el modelo fue creado el 2 de septiembre de 2026, lo que sugiere que es muy reciente y puede no haber sido sometido a pruebas exhaustivas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000015
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Perfil del autor en HuggingFace: https://huggingface.co/TontonTremblay
- GitHub del autor: https://github.com/TontonTremblay

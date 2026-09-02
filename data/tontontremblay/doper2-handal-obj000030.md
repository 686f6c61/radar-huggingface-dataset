# TontonTremblay/doper2-handal-obj000030

## Resumen

El modelo `doper2-handal-obj000030` es un modelo de estimación de pose 6D (tres grados de rotación y tres de traslación) desarrollado por Jonathan Tremblay (TontonTremblay) para el objeto HANDal `000030`, un objeto doméstico del dataset HANDal. Forma parte del pipeline DOPER2, un sistema de estimación de pose para objetos industriales y domésticos.

El modelo utiliza un backbone ConvNeXt-Tiny preentrenado con DINOv3 sobre el dataset LVD-1689M y una cabeza de predicción de keypoints por heatmap. Predice 64 keypoints 3D en metros, que se resuelven mediante PnP (Perspective-n-Point) para obtener la pose completa del objeto. El repositorio tiene un tamaño de 0,3 GB e incluye el checkpoint entrenado, la configuración de entrenamiento y los keypoints 3D de referencia.

La relevancia de este modelo radica en su especialización para un objeto concreto, lo que lo hace adecuado para aplicaciones de robótica de manipulación, control de calidad y realidad aumentada donde se necesita una estimación de pose precisa y robusta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (DINOv3) + cabeza de keypoints por heatmap |
| Parámetros totales | no disponible |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ConvNeXt-Tiny preentrenado con DINOv3 sobre el dataset LVD-1689M (large vocabulary dataset con 1689 millones de imágenes), seguido de una cabeza de predicción de keypoints basada en heatmaps. El detector opera a 224 px de resolución y el recorte de keypoints a 256 px.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina datos sintéticos con randomización de dominio (DR synth, 10k imágenes), renderizado f

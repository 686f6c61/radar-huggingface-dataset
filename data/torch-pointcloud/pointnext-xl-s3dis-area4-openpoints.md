# torch-pointcloud/pointnext-xl.s3dis-area4.openpoints

## Resumen
`pointnext-xl.s3dis-area4.openpoints` es un modelo de segmentación semántica de nubes de puntos 3D, no un modelo de lenguaje. Lo publica la organización `torch-pointcloud` como conversión del repositorio oficial PointNeXt (MIT) a safetensors y a la librería `torch-pointcloud`. La arquitectura es PointNeXt, una revisión escalada de PointNet++ con bloques residuales invertidos, y el checkpoint tiene 41.705.677 parámetros.

El modelo recibe nubes de puntos con 4 canales de entrada y asigna una de las 13 clases de S3DIS a cada punto. Se ha entrenado en S3DIS Area 4 y declara 64,78 de mIoU y 88,61 de OA en esa misma área, resultados no verificados. Su interés práctico es que ofrece un baseline ligero, con licencia MIT y pesos safetensors, para segmentación de interiores dentro de un pipeline PyTorch.

Al ser un modelo de visión 3D, no tiene longitud de contexto, no soporta tool calling ni generación de texto, y sus requisitos de hardware dependen del número de puntos y del lote. La model card es mínima: no documenta cuantizaciones, latencia ni detalles de entrenamiento.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | PointNeXt (PointNet++ escalado con bloques residuales invertidos) |
| Parámetros totales | 41.705.677 (41,7 M) |
| Longitud de contexto | No aplica: modelo de nubes de puntos; la entrada se limita por el número de puntos y la memoria |
| Tipos de cuantización

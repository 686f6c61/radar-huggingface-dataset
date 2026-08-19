# wencai234/YSGYoloDetector

## Resumen

YSGYoloDetector es un modelo de detección de objetos especializado en la detección de texto y globos de diálogo en cómics y CG (computer graphics) a todo color, desarrollado por la comunidad YSG (淫叔馆) y publicado en Hugging Face por wencai234. El modelo resuelve un problema muy concreto: la localización precisa de texto en páginas de cómics japoneses, coreanos e ingleses, incluyendo texto rotado, texto vertical y texto que se extiende a lo largo de toda la página, una tarea que los detectores de texto genéricos manejan mal.

El proyecto ha pasado por múltiples iteraciones: comenzó con YOLOv11, evolucionó a YOLO26 (versión 2.0) y finalmente incorpora RTDETR y RFDETR (versión 3.0.1) para mejorar la detección de texto extremadamente largo. El modelo se distribuye en formato PyTorch (.pt) y ONNX, con un tamaño de repositorio de 7,8 GB. Está diseñado específicamente para su uso con la herramienta X-AnyLabeling modificada por el autor, que permite exportar los resultados de detección a proyectos de software de traducción de cómics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11, YOLO26, RTDETR, RFDETR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no LLM) |
| Tipos de cuantizacion | no disponible (formato .pt y ONNX) |
| Idiomas soportados | no disponible (detecta texto en japones, chino, ingles y coreano, segun el autor) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ONNX |

## Arquitectura y entrenamiento

El modelo se basa en arquitecturas de deteccion de objetos de una sola etapa (YOLO) y basadas en transformers (DETR). La version 1.x utilizaba YOLOv11 de Ultralytics, entrenado con datos de miles de galerias de E站 (ExHentai), centrandose en imagenes CG a todo color de artistas especificos. La version 2.0 migro a YOLO26 (publicado en enero de 2026) con un tamaño de entrenamiento de 1600 píxeles (frente a los 640 o 1024 anteriores) y un dataset 2 a 4 veces mayor que las versiones 1.1 y 1.2. Se aplicaron tecnicas de data augmentation en modo "imagen original", que reemplazan la imagen original por versiones aumentadas (inversion horizontal, inversion de color, ruido, lineas de escaneo) en lugar de anadir ejemplos adicionales. Para datos OBB (bounding boxes orientados), se aplico rotacion aleatoria en el 60% de las imagenes.

La version 3.0.1 incorpora RFDETR (de Roboflow), que resuelve la limitacion de YOLO para detectar texto cuya longitud es comparable al ancho de la imagen completa. RFDETR puede generar bounding boxes que cubren la totalidad del texto largo, evitando perdidas en la etapa de OCR posterior. Esta version es un "modelo de reconocimiento preliminar" (3.0.1) entrenado sin el super-dataset completo, especializado en CG a todo color de ilustradores.

## Capacidades

- Deteccion de texto en comics y CG a todo color, incluyendo texto dentro y fuera de globos de dialogo
- Deteccion de texto rotado (OBB) en multiples angulos, con etiquetas especificas para texto vertical y horizontal inclinado
- Deteccion de texto extremadamente largo que abarca toda la pagina (gracias a RFDETR en la version 3.0.1)
- Clasificacion en seis categorias de etiquetas: `balloon` (texto fuera de globos), `qipao` (texto dentro de globos), `shuqing` (texto vertical inclinado), `changfangtiao` (texto horizontal largo), `hengxie` (texto horizontal inclinado) y `other` (marcos y cajas)
- Compatibilidad con la herramienta X-AnyLabeling modificada, que permite exportar resultados a proyectos de software de traduccion de comics (gratuito y de pago)
- Deteccion de texto en imagenes de comercio electronico, manhwa coreano de formato largo y comics en ingles, ademas de CG japoneses
- Rendimiento limitado en comics en blanco y negro (el autor desaconseja su uso en este tipo de contenido)

## Casos de uso

- Traduccion automatizada de comics japoneses (CG): el modelo detecta todos los textos de una pagina, los clasifica por tipo y permite exportar los resultados a software de traduccion como el gratuito de codigo abierto o el de pago, agilizando el flujo de trabajo del traductor.
- Traduccion de manhwa coreano de formato largo: gracias a la deteccion de texto vertical y horizontal inclinado, el modelo puede manejar los formatos de globos tipicos de los webtoons coreanos.
- Localizacion de comics en ingles: el modelo reconoce texto en ingles y puede integrarse en pipelines de traduccion para el mercado europeo o americano.
- OCR de imagenes de comercio electronico: el autor indica que el modelo funciona bien en imagenes de productos, lo que permite extraer texto de anuncios o fichas de producto.
- Deteccion de texto en CG de ilustradores especificos: el modelo esta entrenado con datos de artistas concretos de E站, por lo que es especialmente preciso en el estilo de estos ilustradores.
- Filtrado y clasificacion de paginas: el modelo puede usarse para identificar paginas con texto (frente a paginas sin texto) en grandes colecciones de imagenes, facilitando la organizacion de bibliotecas de comics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas (mAP, precision, recall) en la model card ni en el repositorio de GitHub. La evaluacion se basa en pruebas cualitativas del propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un modelo de deteccion de objetos basado en YOLO/DETR, el consumo de VRAM depende del tamaño de la imagen de entrada. El autor recomienda usar imagenes de 1600 píxeles para la version 2.0, lo que aumenta los requisitos de memoria.
- GPU recomendadas: no disponible. Modelos YOLO de tamaño similar suelen ejecutarse en GPUs consumer de 8 GB o mas, pero no hay datos especificos para este modelo.
- Compatibilidad con GPU consumer: probablemente si, dado que YOLOv11 y YOLO26 estan disenados para ejecutarse en hardware consumer, pero no hay confirmacion explicita del autor.
- Opciones de despliegue: el modelo se usa principalmente con la herramienta X-AnyLabeling modificada, disponible en https://github.com/lhj5426/X-AnyLabeling. Tambien puede usarse con el framework Ultralytics para YOLO y con el repositorio de Roboflow para RFDETR.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Enfoque | Formato | Licencia |
|---|---|---|---|---|
| YSGYoloDetector | YOLOv11, YOLO26, RTDETR, RFDETR | Deteccion de texto en comics CG a color | .pt, ONNX | MIT |
| YOLOv11 (Ultralytics) | YOLO | Deteccion de objetos generica | .pt, ONNX | AGPL-3.0 |
| RFDETR (Roboflow) | DETR | Deteccion de objetos generica con mejor manejo de objetos alargados | .pt | Apache-2.0 |
| RTDETR (Baidu) | DETR | Deteccion de objetos en tiempo real | .pt | Apache-2.0 |

La diferencia principal de YSGYoloDetector frente a los modelos base es el entrenamiento especializado en texto de comics y CG a color, con etiquetas semanticas propias del dominio (globos, texto vertical, texto inclinado, etc.). No existen modelos publicados comparables con el mismo enfoque especifico.

## Limitaciones y advertencias

- Rendimiento deficiente en comics en blanco y negro: el autor indica explicitamente que el modelo no funciona bien con este tipo de contenido y desaconseja su uso.
- Contenido NSFW: el modelo esta entrenado con datos de E站 (ExHentai), que incluye contenido adulto. Esto puede introducir sesgos en la deteccion y debe tenerse en cuenta si se usa en entornos profesionales.
- La version 3.0.1 es un modelo preliminar: el autor la describe como "version de reconocimiento" (摸底) sin entrenamiento con el dataset completo, por lo que su rendimiento puede ser inferior al de la futura version 3.0 definitiva.
- El modelo OBB (deteccion de texto rotado) debe usarse solo en paginas con texto rotado: el autor advierte que ejecutar el modelo OBB en paginas sin texto rotado produce resultados catastroficos.
- Dependencia de herramientas especificas: el flujo de trabajo recomendado requiere el uso de X-AnyLabeling modificado, que no es la version oficial de la herramienta.
- Documentacion limitada: la model card esta escrita en chino y no incluye especificaciones tecnicas detalladas (parametros, dataset exacto, metricas de rendimiento).
- El modelo esta entrenado para un tipo de contenido muy concreto (CG a todo color de artistas de E站) y puede no generalizar bien a otros estilos de comic o ilustracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wencai234/YSGYoloDetector
- Repositorio de entrenamiento y datos: https://github.com/lhj5426/YSG
- Herramienta X-AnyLabeling modificada: https://github.com/lhj5426/X-AnyLabeling
- Repositorio de RFDETR: https://github.com/roboflow/rf-detr
- Repositorio de Ultralytics (YOLO): https://github.com/ultralytics/ultralytics

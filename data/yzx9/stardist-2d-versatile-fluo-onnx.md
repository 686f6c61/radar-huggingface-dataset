# yzx9/stardist-2d-versatile-fluo-onnx

## Resumen

StarDist 2D Versatile Fluorescence — ONNX es una conversión al formato ONNX de los pesos oficiales `2D_versatile_fluo` del proyecto StarDist, una familia de modelos de segmentación de objetos (principalmente núcleos celulares) en imágenes de microscopía de fluorescencia. El modelo original fue desarrollado por Schmidt, Weigert y colaboradores y presentado en el artículo «Cell Detection with Star-Convex Polygons» (MICCAI 2018). Esta versión concreta la publica el usuario `yzx9` en Hugging Face como un grafo ONNX listo para inferencia, con licencia BSD-3-Clause.

El modelo resuelve el problema de la detección y segmentación de instancias en bioimagen: en lugar de predecir máscaras semánticas planas, StarDist predice polígonos estrellados-convexos (star-convex polygons) alrededor de cada objeto, lo que permite separar instancias que se tocan o se solapan. Es una pieza muy utilizada en pipelines de análisis de imágenes biomédicas, especialmente en el ecosistema de Fiji/ImageJ y Python (paquete `stardist`).

La relevancia de esta ficha concreta es de despliegue: al estar exportado a ONNX, el modelo puede ejecutarse sin dependencias de TensorFlow o del runtime nativo de StarDist, integrándose en aplicaciones C++, .NET, Java o en servicios de inferencia ONNX Runtime. El repositorio tiene un tamaño de 0.0 GB según Hugging Face y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con cabeceras de predicción de polígonos star-convexos (StarDist) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 512x512 píxeles) |
| Tipos de cuantizacion | no disponible (pesos exportados sin cuantizar, presumiblemente float32) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (grafo único) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StarDist descrita en el paper de MICCAI 2018: una red de tipo U-Net que, para cada píxel candidato a centro de objeto, predice un conjunto de distancias radiales que definen un polígono star-convexo, junto con una puntuación de objetividad. La separación de instancias se resuelve después con supresión de no máximos (NMS) sobre los polígonos propuestos. La entrada del grafo ONNX es un tensor float32 en formato NHWC de forma `[1, 512, 512, 1]` (una sola imagen en escala de grises, 512x512) y la salida es un tensor `[1, 512, 512, 33]`, que corresponde a 32 rayos radiales más la puntuación de objetividad por píxel.

Según la model card, los pesos provienen de la conversión oficial publicada en Zenodo (registro 6348085) y el entrenamiento se realizó sobre el subconjunto CC0 del dataset DSB 2018 (Data Science Bowl 2018). La normalización de la imagen y la NMS se ejecutan fuera del grafo ONNX, por lo que el integrador debe replicar el preprocesado (normalización de intensidades) y el postprocesado (NMS poligonal) del paquete StarDist original para obtener resultados equivalentes.

## Capacidades

- Segmentación de instancias de núcleos celulares en imágenes de fluorescencia 2D.
- Detección de objetos mediante polígonos star-convexos, lo que permite separar núcleos que se tocan o solapan.
- Inferencia puramente visual: no procesa texto ni tiene capacidades generativas.
- Entrada de imagen en escala de grises de 512x512 píxeles, un solo canal.
- Salida por píxel de 32 distancias radiales más una puntuación de objetividad.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión general, audio ni multimodalidad más allá de la imagen de fluorescencia.
- Ejecutable mediante ONNX Runtime en múltiples plataformas y lenguajes.

## Casos de uso

- Análisis de imágenes de microscopía de fluorescencia en laboratorio: el modelo segmenta núcleos celulares en imágenes 2D de 512x512, adecuado para recuento celular y morfometría en experimentos de biología celular.
- Integración en pipelines de Fiji/ImageJ o Python sin TensorFlow: al estar en ONNX, puede invocarse desde ONNX Runtime en scripts de análisis de imágenes que ya usan otros modelos ONNX.
- Despliegue en aplicaciones de escritorio o C++: el formato ONNX permite embeber el modelo en herramientas nativas de adquisición y análisis de imágenes sin arrastrar el stack de Python.
- Servicios de inferencia en la nube: ONNX Runtime permite servir el modelo en contenedores ligeros con CPU o GPU, útil para plataformas de análisis de imágenes biomédicas por lotes.
- Preprocesado para pipelines de citometría de imagen: la segmentación de núcleos sirve como paso previo para extraer características por célula en estudios de alto contenido.
- Docencia y reproducibilidad: al ser una conversión de pesos oficiales con licencia permisiva, sirve para replicar resultados del paper de StarDist en entornos donde no se puede instalar el paquete original.
- Validación cruzada de herramientas: puede compararse su salida con la del runtime nativo de StarDist para verificar la fidelidad de la conversión ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de segmentación (IoU, F1, AP) ni comparaciones con el modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio es 0.0 GB según Hugging Face, lo que sugiere un modelo pequeño (probablemente decenas de MB), apto para GPUs de gama baja.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML); para una U-Net de este tamaño bastan GPUs consumer como GTX 1650, RTX 3050 o superiores.
- Cabe en GPU consumer: sí, con alta probabilidad, dado el tamaño reducido del repositorio y la entrada fija de 512x512.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, TensorRT), integración en aplicaciones C++/C#/Java mediante las APIs de ONNX Runtime; no se distribuye en GGUF ni en formato para llama.cpp u Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StarDist 2D Versatile Fluorescence — ONNX (este) | no disponible | 512x512x1 | Segmentación de núcleos en fluorescencia | BSD-3-Clause | Hugging Face (ONNX) |
| StarDist 2D_versatile_fluo (original) | no disponible | 512x512x1 | Segmentación de núcleos en fluorescencia | BSD-3-Clause | Zenodo / paquete stardist |
| Cellpose | no disponible | variable | Segmentación celular generalista | BSD-3-Clause (versiones recientes) | GitHub / PyPI |
| Mask R-CNN (genérico) | no disponible | variable | Segmentación de instancias genérica | variable según implementación | Múltiples |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para imágenes de fluorescencia 2D; su rendimiento en otras modalidades (brightfield, histología H&E, imágenes 3D) no está garantizado.
- La normalización y la NMS se ejecutan fuera del grafo ONNX: una implementación incorrecta del pre/postprocesado produce resultados distintos a los del paquete StarDist original.
- La entrada está fijada a 512x512 píxeles y un solo canal; imágenes de otro tamaño requieren redimensionado o teselado externo.
- Riesgo de falsos positivos y negativos en imágenes con bajo contraste, ruido o núcleos muy agrupados; no se han publicado métricas en la model card.
- Sesgos: el entrenamiento se limita al subconjunto CC0 del DSB 2018, por lo que la distribución de tipos celulares y condiciones de imagen está acotada.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución; debe conservarse el aviso de copyright y la cláusula de no endorsement.
- El repositorio no registra descargas ni likes, y la fecha de creación indicada (2026-11-16) es posterior a la consulta; conviene verificar la integridad de los artefactos antes de usarlos en producción.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.

## Enlaces

- Hugging Face: https://huggingface.co/yzx9/stardist-2d-versatile-fluo-onnx
- Pesos originales en Zenodo: https://zenodo.org/records/6348085
- Paper StarDist (MICCAI 2018): Schmidt, Weigert et al., «Cell Detection with Star-Convex Polygons»
- Repositorio StarDist (GitHub): no disponible en la información proporcionada
- Documentación de ONNX Runtime: no disponible en la información proporcionada

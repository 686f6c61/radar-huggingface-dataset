# torch-pointcloud/openscene-lseg.scannet20.songyou-peng

## Resumen

OpenScene es un modelo de segmentación semántica de nubes de puntos en vocabulario abierto (open-vocabulary), desarrollado originalmente por Songyou Peng y colaboradores (ETH Zúrich, Google Research, Microsoft) y publicado en CVPR 2023. Este checkpoint concreto, alojado por el usuario `torch-pointcloud`, es una conversión de los pesos oficiales al formato de la librería PyTorch PointCloud, destilada sobre el conjunto de datos ScanNet con 20 clases. El modelo resuelve el problema de asignar una etiqueta semántica a cada punto de una escena 3D sin depender de un conjunto cerrado de categorías: en lugar de predecir índices de clase, proyecta cada punto a un espacio de embeddings de 512 dimensiones alineado con CLIP, de modo que la etiqueta final se obtiene por similitud coseno con los prompts de texto que el usuario elija en tiempo de inferencia.

La arquitectura es una U-Net convolucional dispersa (sparse convolutional U-Net) con 15,5 millones de parámetros, 3 canales de entrada (coordenadas) y 96 canales de características internas. La innovación clave es la destilación de las representaciones 3D al espacio de texto de CLIP (`openai/clip-vit-base-patch32`), lo que permite clasificar con vocabularios arbitrarios sin reentrenamiento. Es relevante para desarrolladores que trabajan en robótica, escaneo 3D, gemelos digitales o realidad aumentada, porque ofrece segmentación abierta con un modelo muy ligero (0,1 GB) que cabe en GPUs de consumo.

Este checkpoint está empaquetado para la librería `torch-pointcloud` y requiere `spconv` compilado contra la versión de PyTorch y CUDA del entorno. No es un modelo de lenguaje: no genera texto ni mantiene conversaciones; su única salida son embeddings por punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net convolucional dispersa (sparse conv U-Net) destilada a espacio CLIP |
| Parámetros totales | 15.551.072 (15,5 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; el ejemplo usa 8192 puntos por muestra) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (el vocabulario depende de los prompts de texto CLIP) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Dimensión de embedding | 512 (alineada con `openai/clip-vit-base-patch32`) |
| Canales de características | 96 |
| Dataset de evaluación | ScanNet (20 clases) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una U-Net de convoluciones dispersas que opera sobre nubes de puntos organizadas en rejillas dispersas (`pos_grid`). Recibe coordenadas de punto (y, según el pipeline de ejemplo, color y normal como parte del diccionario de entrada) y produce un embedding de 512 dimensiones por punto. La red se entrena mediante destilación: las representaciones 3D se alinean con los embeddings de texto de CLIP para las clases del dataset, de forma que la inferencia se reduce a un producto escalar entre el embedding del punto y el embedding del prompt textual, seguido de `argmax` para asignar etiqueta. El checkpoint se ha destilado específicamente sobre ScanNet con 20 clases.

No se dispone en la información proporcionada de detalles sobre el número de tokens o puntos de entrenamiento, la composición exacta del dataset más allá de ScanNet, ni si se emplearon técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica principal es la segmentación open-vocabulary: el vocabulario no está fijado en los pesos, sino que se define en tiempo de ejecución mediante `CLIPTextEncoder` y una plantilla de prompt (`weights["prompt_template"]`). El modelo expone además `forward_features` para extraer las 96 características intermedias, útil para tareas aguas abajo.

## Capacidades

- Segmentación semántica de nubes de puntos en vocabulario abierto: asigna etiquetas por similitud coseno con prompts de texto CLIP arbitrarios.
- Segmentación de escenas interiores con las 20 clases de ScanNet (silla, mesa, pared, etc.).
- Extracción de características por punto (96 canales) mediante `forward_features`, reutilizable para clasificación o agrupación aguas abajo.
- Procesamiento de nubes de puntos de gran tamaño mediante convoluciones dispersas (el ejemplo usa 8192 puntos por muestra).
- Integración con el ecosistema CLIP para definir vocabularios personalizados sin reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni generación de texto: es un modelo puramente perceptivo 3D.
- Capacidades multilingües: dependen del modelo de texto CLIP asociado; no se documentan idiomas específicos para este checkpoint.

## Casos de uso

- Segmentación de escenas interiores escaneadas: dado un escaneo RGB-D o una nube de puntos de una habitación, el modelo etiqueta cada punto con categorías como silla, mesa o pared usando los prompts adecuados, lo que permite inventariar objetos sin un clasificador cerrado.
- Robótica móvil en interiores: un robot puede construir un mapa semántico de su entorno etiquetando la nube de puntos en tiempo real con un vocabulario definido por la aplicación (por ejemplo, "obstáculo", "puerta", "suelo transitable"), gracias al bajo coste computacional de sus 15,5 M de parámetros.
- Gemelos digitales y BIM: segmentación automática de nubes de puntos procedentes de escaneos láser para separar elementos estructurales y mobiliario antes de la modelización, usando un vocabulario adaptado al proyecto.
- Realidad aumentada y mixta: identificación de superficies y objetos en la escena del usuario para anclar contenido virtual, aprovechando la extracción de características por punto.
- Anotación asistida de datasets 3D: preetiquetado automático de nubes de puntos con vocabulario abierto para reducir el esfuerzo de anotación manual, revisando después las etiquetas con el vocabulario de destino.
- Investigación en visión 3D: evaluación de técnicas de destilación 2D-3D y experimentos de open-vocabulary segmentation sobre ScanNet, usando el checkpoint como línea base reproducible con licencia Apache 2.0.
- Búsqueda semántica en escenas 3D: indexar los embeddings de 512 dimensiones por punto o por región para consultas del tipo "encuentra todas las superficies similares a una estantería" mediante similitud vectorial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados) sobre ScanNet con 20 clases:

| Métrica | Valor |
|---|---|
| mIoU | 52,97 |
| mAcc | 63,43 |
| OA | 80,9 |
| simple/mIoU | 52,04 |
| simple/mAcc | 62,83 |
| simple/OA | 80,1 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 15,5 M de parámetros los pesos ocupan unas decenas de MB, y el consumo dominante proviene de las activaciones de las convoluciones dispersas sobre la nube de puntos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la compilación de `spconv`; el ejemplo de uso emplea `.cuda()` y advierte de que los kernels son GPU-only.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con suficiente memoria para las activaciones (GTX 1060 en adelante, RTX 2060/3060/4090); no se documenta un mínimo exacto.
- Opciones de despliegue: librería `torch-pointcloud` con `spconv` y `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros modelos comparables (por ejemplo, variantes de OpenScene sobre otros datasets o métodos de segmentación 3D cerrada) para establecer una comparativa numérica fiable. Se indica "no disponible".

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y están marcados como no verificados (`verified: false`).
- El modelo está destilado sobre ScanNet con 20 clases; su rendimiento fuera de dominios de interiores similares no está documentado.
- La calidad de la segmentación depende fuertemente de la elección de prompts y del modelo de texto CLIP asociado; vocabularios mal formulados degradan las etiquetas.
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA del entorno, lo que complica el despliegue reproducible.
- Los kernels son GPU-only según la model card; no se documenta soporte CPU.
- Riesgo de alucinación en el sentido de asignar una etiqueta del vocabulario a puntos que no corresponden a esa categoría, especialmente en clases ausentes del vocabulario elegido.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos de ScanNet (escenas interiores, distribución geográfica y de mobiliario limitada).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes dependientes (`spconv`, CLIP y el modelo de texto asociado).
- El repositorio tiene muy pocas descargas (17) y ningún "like"; no hay evidencia de validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/openscene-lseg.scannet20.songyou-peng
- Paper OpenScene (arXiv): https://arxiv.org/abs/2211.15654
- Repositorio original de OpenScene: https://github.com/pengsongyou/openscene
- Librería PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de PyTorch PointCloud: https://pytorch-pointcloud.org/latest/installation/
- Modelo de texto CLIP asociado: https://huggingface.co/openai/clip-vit-base-patch32

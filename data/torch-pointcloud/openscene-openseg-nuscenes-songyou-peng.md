# torch-pointcloud/openscene-openseg.nuscenes.songyou-peng

## Resumen

OpenScene es un modelo de segmentación semántica de nubes de puntos en 3D con vocabulario abierto, desarrollado por Songyou Peng y colaboradores (ETH Zúrich, Google Research, Microsoft Research) y publicado en CVPR 2023. El modelo combina una U-Net de convoluciones dispersas que procesa la geometría 3D con un espacio de embeddings de 768 dimensiones alineado con el codificador de texto de CLIP (`openai/clip-vit-large-patch14-336`), de modo que cada punto de la nube se puede etiquetar comparando su embedding con el de cualquier prompt textual, sin necesidad de definir un conjunto cerrado de clases durante el entrenamiento.

Este checkpoint concreto (`openscene-openseg.nuscenes.songyou-peng`) es la variante destilada sobre el dataset nuScenes y ha sido convertida al formato de la librería `torch-pointcloud` por Arthur Dujardin. Con solo 15,6 millones de parámetros y un repositorio de 0,1 GB, es un modelo notablemente ligero para una tarea de percepción 3D, lo que lo hace atractivo para prototipado rápido, experimentación académica y despliegue en entornos con recursos limitados.

Su relevancia actual radica en que demuestra que la segmentación 3D open-vocabulary no requiere modelos masivos: destilando el conocimiento de CLIP hacia una red convolucional dispersa se obtiene un segmentador compacto que acepta vocabularios arbitrarios en tiempo de inferencia. Es, por tanto, una pieza útil para investigación en robótica, conducción autónoma y comprensión de escenas 3D, aunque con las limitaciones propias de un modelo pequeño entrenado en un único dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | U-Net de convoluciones dispersas (sparse CNN) con embeddings destilados al espacio de texto de CLIP |
| Parámetros totales | 15.575.648 (15,6 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de nubes de puntos, no de texto; el ejemplo de uso emplea 8192 puntos por muestra) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (el vocabulario lo define el usuario mediante prompts de texto en el codificador CLIP) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Dimensión de embedding | 768 (alineada con `openai/clip-vit-large-patch14-336`) |
| Canales de features internas | 96 |
| Dataset de entrenamiento/destilación | nuScenes |
| Librería | `torch-pointcloud` (requiere `spconv` y `transformers`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el diseño de OpenScene: una U-Net con convoluciones dispersas (implementada con `spconv`) que consume nubes de puntos con tres canales de entrada (coordenadas, intensidad y marca temporal, según el pipeline de datos del ejemplo) y produce un embedding de 768 dimensiones por punto. Ese espacio de salida se destila para alinearse con el espacio de texto de CLIP ViT-L/14-336, de forma que la similitud coseno entre el embedding de un punto y el embedding de un prompt textual determina la etiqueta. La red interna trabaja con 96 canales de features, lo que explica su reducido tamaño (15,6 M de parámetros).

El entrenamiento se realiza sobre nuScenes, un dataset de conducción autónoma con nubes de puntos LiDAR anotadas. La model card no detalla el número de tokens/puntos vistos, la composición exacta del dataset ni si hubo etapas de ajuste fino adicionales; únicamente indica que el checkpoint se ha convertido desde el repositorio oficial `pengsongyou/openscene` (Apache 2.0) al formato de `torch-pointcloud`. La innovación principal es la destilación de CLIP hacia una red 3D compacta, que permite vocabulario abierto sin un cabezal de clasificación fijo. El modelo requiere kernels GPU (`model.cuda().eval()`), por lo que no está pensado para inferencia en CPU en su forma actual.

## Capacidades

- Segmentación semántica de nubes de puntos 3D con vocabulario abierto: cualquier clase se define mediante un prompt de texto en el codificador CLIP, sin reentrenamiento.
- Etiquetado por punto mediante similitud coseno entre embeddings 3D y embeddings de texto (`embeddings @ text.t()` y `argmax`).
- Extracción de features por punto (96 canales) mediante `forward_features`, útil como backbone para tareas posteriores.
- Procesamiento de nubes de puntos con coordenadas, intensidad y marca temporal como entradas.
- Soporte de vocabularios personalizados y plantillas de prompt configurables (`prompt_template`).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión 2D, audio ni modo "thinking": es un modelo puramente de percepción 3D.
- Capacidades multilingües: dependen del codificador de texto CLIP asociado; la model card no documenta idiomas concretos.

## Casos de uso

- Segmentación open-vocabulary en conducción autónoma: usar el modelo sobre nubes LiDAR de nuScenes o datos similares para etiquetar vehículos, peatones, calzada o vegetación definiendo los prompts en tiempo de inferencia, lo que permite adaptarse a nuevas categorías sin reentrenar.
- Prototipado rápido de pipelines de percepción 3D: con 15,6 M de parámetros y 0,1 GB de pesos, se puede integrar en cuadernos de experimentación y validar vocabularios en minutos antes de invertir en modelos mayores.
- Extracción de features para aprendizaje downstream: `forward_features` produce descriptores de 96 canales por punto que pueden alimentar clasificadores ligeros, clustering o modelos de reconstrucción de escenas.
- Anotación asistida de datos 3D: generar preetiquetas automáticas sobre nuevas nubes de puntos y revisarlas manualmente, reduciendo el coste de anotación semántica en proyectos de robótica o cartografía.
- Investigación en destilación multimodal 3D-texto: servir como línea base reproducible para estudiar la alineación entre embeddings geométricos y el espacio de CLIP, gracias a su tamaño reducido y a la licencia Apache 2.0.
- Búsqueda semántica en escenas 3D: etiquetar puntos con vocabularios específicos de dominio (por ejemplo, "contenedor", "barandilla", "señal") para construir índices consultables de entornos capturados con LiDAR.
- Despliegue en robótica móvil con recursos limitados: su huella de memoria reducida permite ejecutarlo en plataformas con GPU de gama media para segmentación de obstáculos en tiempo casi real, siempre que se disponga de kernels `spconv` compatibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (no verificados, `verified: false`), sobre el dataset nuScenes:

| Métrica | Valor |
|---|---|
| mIoU | 42,97 |
| mAcc | 56,99 |
| OA | 77,60 |
| simple/mIoU | 41,84 |
| simple/mAcc | 56,05 |
| simple/OA | 77,28 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 15,6 M de parámetros en precisión FP32 los pesos ocupan aproximadamente 62 MB, por lo que la VRAM vendrá dominada por las activaciones de `spconv` y el codificador CLIP de texto (ViT-L/14-336, cientos de millones de parámetros) si se usa para generar los prompts.
- GPU recomendadas: no especificadas en la model card; el modelo exige kernels GPU (`spconv` compilado contra la versión de torch y CUDA), por lo que se necesita una GPU compatible con CUDA. Una RTX 4090, A100 o H100 son opciones holgadas para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU NVIDIA con soporte CUDA moderno, dado el reducido tamaño del checkpoint; no se documentan cifras exactas de memoria.
- Opciones de despliegue: la vía oficial es la librería `torch-pointcloud` (`tp.create_model(...)`) junto con `spconv` y `transformers`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU (nuScenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenScene (este checkpoint, nuScenes) | 15,6 M | 3 canales, nube de puntos (ejemplo con 8192 puntos) | 42,97 | Apache 2.0 | HuggingFace (`torch-pointcloud`) |
| OpenScene (checkpoint original) | no disponible en la información | nube de puntos | no disponible en la información | Apache 2.0 | GitHub `pengsongyou/openscene` |
| Alternativas de segmentación 3D open-vocabulary | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada; la comparativa detallada con alternativas como otros segmentadores 3D open-vocabulary queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de nubes de puntos 3D: no genera texto, no razona y no dispone de tool calling ni capacidades de agente.
- Entrenado y destilado únicamente sobre nuScenes (conducción autónoma), por lo que su generalización a otros dominios (interiores, robótica industrial, escenas aéreas) no está garantizada.
- Rendimiento modesto en términos absolutos (mIoU 42,97): adecuado para prototipado y experimentación, pero probablemente insuficiente como sistema único en producción crítica.
- Métricas no verificadas (`verified: false`) y declaradas por el autor; deben tomarse con cautela.
- Riesgo de etiquetado erróneo en clases ambiguas o poco representadas, derivado de la similitud coseno con prompts de texto; la calidad depende en gran medida de la formulación de los prompts.
- Dependencia de kernels GPU (`spconv`) compilados contra la versión concreta de torch y CUDA, lo que complica el despliegue reproducible y descarta la inferencia en CPU en su forma actual.
- Requiere descargar el codificador de texto CLIP (`openai/clip-vit-large-patch14-336`) para definir vocabularios, lo que añade peso y dependencias más allá del propio checkpoint.
- La model card no documenta sesgos, idiomas soportados ni comportamiento en vocabularios multilingües.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias del codificador CLIP asociado y del dataset nuScenes, que tienen condiciones propias.
- No se documentan cuantizaciones alternativas ni formatos de despliegue ligeros (GGUF, ONNX), lo que limita optimizaciones de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/openscene-openseg.nuscenes.songyou-peng
- Paper OpenScene (arXiv): https://arxiv.org/abs/2211.15654
- Repositorio original OpenScene: https://github.com/pengsongyou/openscene
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-large-patch14-336
- Dataset nuScenes: https://www.nuscenes.org/

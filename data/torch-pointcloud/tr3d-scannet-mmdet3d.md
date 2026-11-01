# torch-pointcloud/tr3d.scannet.mmdet3d

## Resumen

TR3D (Towards Real-Time Indoor 3D Object Detection) es un detector de objetos 3D para nubes de puntos de interiores, publicado originalmente en ICIP 2023 por Danila Rukhovich, Anna Vorontsova y Anton Konushin. Este checkpoint concreto, `tr3d.scannet.mmdet3d`, es una conversión del modelo original de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y está entrenado sobre el dataset ScanNet para 18 clases de objetos de interior.

El modelo emplea una arquitectura fully convolutional sobre vóxeles dispersos (sparse voxel CNN) con 14,7 millones de parámetros, 128 canales de características y una entrada de 3 canales (coordenadas más color). Su diseño está optimizado para inferencia en tiempo real, con kernels acelerados mediante `spconv` que requieren GPU. Es relevante para tareas de percepción 3D en robótica, realidad aumentada y digitalización de interiores, donde la latencia importa tanto como la precisión.

Este checkpoint no es un modelo de lenguaje: no procesa texto ni dispone de ventana de contexto, capacidades multilingües ni tool calling. Su ámbito es exclusivamente la detección de objetos en nubes de puntos 3D de escenas interiores, y su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fully convolutional sparse voxel CNN (TR3D) |
| Parametros totales | 14.671.448 (14,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos declarados: canales de entrada 3, 18 clases de salida, 128 canales de características, tamaño del repositorio 0,1 GB.

## Arquitectura y entrenamiento

TR3D es un detector 3D totalmente convolucional que opera sobre vóxeles dispersos. La entrada es una nube de puntos con coordenadas XYZ y color RGB, que se voxeliza y se procesa mediante convoluciones dispersas 3D (implementadas con `spconv`). El backbone extrae características de 128 canales y una cabeza de detección predice cajas 3D para 18 clases de objetos de interior. La naturaleza fully convolutional, sin componentes recurrentes ni operaciones densas sobre el volumen completo, es lo que permite el rendimiento en tiempo real que da nombre al método.

El entrenamiento se realizó sobre el dataset ScanNet, un conjunto de reconstrucciones 3D de interiores con anotaciones densas. La información disponible no detalla el número de tokens ni de iteraciones, la composición exacta del dataset, ni si se aplicaron etapas de refinamiento posteriores. Este checkpoint es una conversión directa desde mmdetection3d, por lo que hereda los pesos y el pipeline de entrenamiento originales del paper de ICIP 2023.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores (18 clases de ScanNet).
- Predicción de cajas 3D (posición, dimensiones y orientación) a partir de coordenadas y color.
- Extracción de características por punto mediante `forward_features`, con 128 canales, útil para tareas posteriores de segmentación o recuperación.
- Inferencia en tiempo real gracias a la arquitectura fully convolutional y a los kernels dispersos de `spconv`.
- Procesamiento por lotes de muestras mediante `collate`, con soporte de índice de batch.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües, visión 2D, audio ni modo de razonamiento.

## Casos de uso

- Digitalización de interiores y modelado BIM: el modelo detecta muebles y elementos estructurales en nubes de puntos capturadas con escáneres o LiDAR, lo que permite generar inventarios automáticos de espacios con las 18 clases de ScanNet y alimentar pipelines de reconstrucción semántica.
- Robótica móvil en interiores: un robot equipado con cámara de profundidad puede usar el detector para localizar obstáculos y objetos de mobiliario en tiempo real, aprovechando el diseño de baja latencia del modelo para la planificación de trayectorias.
- Realidad aumentada y mixta: la detección de cajas 3D permite anclar contenido virtual sobre objetos físicos (por ejemplo, colocar etiquetas sobre sillas o mesas) en aplicaciones de interiorismo y mantenimiento asistido.
- Inspección y control de calidad en obra: comparación de la nube de puntos capturada con el modelo esperado para detectar elementos faltantes o mal colocados, usando las predicciones 3D como entrada a un sistema de verificación.
- Anotación asistida de datasets 3D: preetiquetado automático de nubes de puntos para acelerar el etiquetado humano en proyectos de percepción, con las cajas generadas como propuesta inicial que un anotador revisa.
- Navegación asistida y accesibilidad: detección de obstáculos y mobiliario en interiores para sistemas de guiado de personas con discapacidad visual, integrado en dispositivos con GPU de baja potencia.
- Extracción de características para aprendizaje por transferencia: el método `forward_features` permite reutilizar los 128 canales como embedding de punto para tareas de segmentación semántica o clasificación de escenas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| ScanNet | mAP@0.25 | 71,98 |
| ScanNet | mAP@0.5 | 58,57 |

No se han publicado en la información disponible resultados adicionales (latencia, throughput, comparación con otros detectores) más allá de estos dos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 14,7 M de parámetros y kernels dispersos, el consumo es moderado, pero la voxelización de nubes densas puede elevar el uso de memoria según el número de puntos de entrada.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con una versión de `spconv` compilada para esa combinación de PyTorch y CUDA; el modelo es GPU-only según la model card.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 o superiores, siempre que se compile `spconv` para la versión de CUDA correspondiente; no hay cifras oficiales de VRAM publicadas.
- Opciones de despliegue: la librería `torch-pointcloud` (instalable con `pip install torch-pointcloud`), con dependencia obligatoria de `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible; el paper original defiende el rendimiento en tiempo real, pero la información proporcionada no incluye cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tr3d.scannet.mmdet3d (este) | 14,7 M | ScanNet | 71,98 | 58,57 | Apache-2.0 | HuggingFace, torch-pointcloud |
| TR3D original (mmdetection3d) | 14,7 M (equivalente) | ScanNet | mismos valores en el paper | mismos valores en el paper | Apache-2.0 | GitHub open-mmlab |
| Otros detectores 3D de ScanNet | no disponible | ScanNet | no disponible | no disponible | no disponible | no disponible |

La información disponible no incluye resultados de benchmarks de modelos alternativos (por ejemplo, VoteNet, FCAF3D u otros detectores 3D de interiores) que permitan una comparación numérica fiable, por lo que se indica "no disponible" en esas filas.

## Limitaciones y advertencias

- Ámbito restringido: solo detecta las 18 clases de ScanNet en escenas interiores; no es un modelo generalista ni funciona con texto.
- Dependencia de `spconv`: requiere compilar la librería para la combinación exacta de PyTorch y CUDA, lo que complica el despliegue y la reproducibilidad en entornos nuevos.
- Solo GPU: los kernels son GPU-only, por lo que no hay inferencia en CPU documentada.
- Métricas no verificadas: los valores de mAP proceden de la model card y están marcados como `verified: false`; conviene reproducirlos antes de usarlos en producción.
- Riesgo de degradación fuera de dominio: el entrenamiento se limita a ScanNet, con sensores y condiciones de captura concretos; la precisión puede caer con otros escáneres, densidades de puntos o entornos exteriores.
- Sin información sobre sesgos: la model card no documenta sesgos demográficos, geográficos ni de otro tipo.
- Licencia permisiva: Apache-2.0 permite uso comercial y modificación, pero se recomienda conservar la atribución del paper y del autor original.
- Sin garantías de soporte: el repositorio tiene 22 descargas y 0 likes, y no se documenta mantenimiento activo más allá de la librería `torch-pointcloud`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/tr3d.scannet.mmdet3d
- Paper TR3D (arXiv): https://arxiv.org/abs/2302.02858
- Repositorio de la librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio original en OpenMMLab (mmdetection3d): https://github.com/open-mmlab/mmdetection3d
- Dataset ScanNet: https://github.com/ScanNet/ScanNet

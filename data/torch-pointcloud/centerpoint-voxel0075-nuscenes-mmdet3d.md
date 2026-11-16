# torch-pointcloud/centerpoint-voxel0075.nuscenes.mmdet3d

## Resumen

CenterPoint (variante voxel0075) es un detector de objetos 3D para nubes de puntos LiDAR, entrenado sobre el dataset nuScenes. Lo desarrolla el proyecto torch-pointcloud (Arthur Dujardin) como conversión del checkpoint original de OpenMMLab (mmdetection3d) al formato safetensors y a la librería torch-pointcloud. El modelo implementa el detector basado en centros de la publicación "Center-based 3D Object Detection and Tracking" (Yin et al., CVPR 2021): proyecta la nube de puntos a una vista cenital (BEV) mediante voxelización a 0,075 m y predice mapas de calor de centros para las 10 clases de nuScenes.

Su relevancia es práctica: ofrece un checkpoint ligero (8,9 millones de parámetros, ~9 MB) con pesos en safetensors, licencia Apache-2.0 y una API de una línea (`tp.create_model`) para inferencia y extracción de características. Es un modelo de percepción para conducción autonómica y robótica, no un modelo de lenguaje: no genera texto ni razona sobre instrucciones.

La arquitectura es una red convolucional 3D dispersa (sparse conv, requiere `spconv`) seguida de un backbone 2D en BEV con 512 canales de características. El contexto aquí no es una ventana de tokens sino el volumen de la escena: la voxelización fija la resolución espacial, no la longitud de entrada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterPoint (detector basado en centros sobre BEV), convoluciones 3D dispersas + backbone 2D |
| Parametros totales | 8.951.286 (~8,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de percepción; resolución espacial por voxel de 0,075 m) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases detectadas | 10 |
| Canales de características | 512 |
| Dataset de entrenamiento | nuScenes |
| Librería | torch-pointcloud (requiere `spconv`) |

## Arquitectura y entrenamiento

CenterPoint es un detector one-stage anclado en centros. La nube de puntos LiDAR se voxeliza con un tamaño de voxel de 0,075 m (de ahí el sufijo voxel0075) y se procesa con convoluciones 3D dispersas (`spconv`), que solo computan sobre voxels ocupados y evitan el coste de una convolución 3D densa. La salida se colapsa a una representación BEV (bird's-eye view) que pasa por un backbone 2D con 512 canales de características; sobre esa representación se predicen mapas de calor de centros por clase, junto con regresión de dimensiones, orientación y velocidad.

El entrenamiento se realizó sobre nuScenes, el dataset multimodal de conducción autonómica de 10 clases (coche, camión, autobús, peatón, moto, bicicleta, remolque, construcción, barrera de tráfico y cono de tráfico, entre otras). No se detalla en la información disponible el número de tokens/iteraciones, la composición exacta del dataset ni si hubo etapas de refinamiento; tampoco se documenta uso de RLHF/DPO (irrelevante en este tipo de modelo). La innovación técnica destacable es el paradigma center-based, que sustituye las anclas por mapas de calor de centros, simplificando el detector y eliminando heurísticas de NMS complejas en la etapa de propuesta.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: predice cajas 3D con clase, dimensiones, orientación y velocidad sobre 10 clases de nuScenes.
- Voxelización configurable a 0,075 m, con 5 canales de entrada (coordenadas e intensidad).
- Extracción de características (`forward_features`) que devuelve un tensor de 512 canales por voxel para reutilizarlo en cabezas o pipelines posteriores.
- Inferencia solo en GPU (los kernels de `spconv` no están implementados para CPU).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo.
- No incluye modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción para conducción autonómica: el modelo detecta vehículos, peatones y elementos de tráfico a partir de LiDAR en escenas nuScenes, adecuado como detector de referencia en pipelines de planificación y seguimiento.
- Prototipado de detección 3D en robótica móvil: con 8,9 M de parámetros y pesos de ~9 MB, se puede integrar en robots con GPU embebida para detección de obstáculos en exteriores.
- Extracción de features para modelos downstream: `forward_features` entrega embeddings de 512 canales por voxel que sirven de entrada a clasificadores de escena, segmentación o modelos de ocupación.
- Evaluación comparativa de detectores 3D: al estar convertido desde mmdetection3d con métricas declaradas (mAP 56,42, NDS 64,96), sirve como baseline reproducible para comparar variantes de voxelización o backbones.
- Investigación académica sobre detección center-based: permite reproducir el paper de Yin et al. sin montar el entorno completo de OpenMMLab, usando la API ligera de torch-pointcloud.
- Etiquetado semiautomático de datos LiDAR: usar las detecciones como preanotaciones para acelerar el etiquetado de nuevos datasets de nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre nuScenes:

| Metrica | Valor | Verificado |
|---|---|---|
| mAP | 56,42 | no |
| NDS | 64,96 | no |

No se han publicado en la información disponible otros resultados (por clase, por rango de distancia, latencia o throughput) ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 8,9 M de parámetros el peso es mínimo (~9 MB en fp32), pero el consumo real depende del número de voxels y del tamaño de la escena.
- GPU recomendadas: no disponible; cualquier GPU NVIDIA con CUDA compatible con la compilación de `spconv` (A100, H100, RTX 4090, RTX 3090, etc.).
- Cabe en GPU consumer: sí, por tamaño de parámetros; el límite práctico es la memoria para voxels y la compatibilidad de `spconv` con la versión de CUDA/torch.
- Opciones de despliegue: torch-pointcloud (`tp.create_model`), con `spconv` compilado a medida. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP | NDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| centerpoint-voxel0075.nuscenes.mmdet3d | 8,9 M | nuScenes | 56,42 | 64,96 | Apache-2.0 | Hugging Face |
| CenterPoint original (mmdetection3d) | no disponible en la información | nuScenes | no disponible | no disponible | Apache-2.0 | GitHub |
| Alternativas de detección 3D (PointPillars, SECOND, etc.) | no disponible en la información | nuScenes | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numéricos de los modelos alternativos en la información proporcionada; la comparación queda limitada a licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de percepción puramente geométrico: no procesa lenguaje, no razona y no sigue instrucciones; no debe presentarse como un LLM.
- Dependencia de `spconv`: requiere compilación específica para la versión de torch y CUDA, lo que complica el despliegue reproducible en entornos heterogéneos.
- Inferencia solo en GPU; no hay camino CPU documentado.
- Entrenado exclusivamente sobre nuScenes (entornos urbanos de Singapur y Boston); el rendimiento fuera de esa distribución (clima, sensores, geografía) puede degradarse y no está cuantificado.
- Métricas declaradas por el autor y marcadas como no verificadas (`verified: false`); no hay validación independiente en la información disponible.
- Riesgo de falsos negativos y positivos en objetos pequeños, ocluidos o a larga distancia, inherente a la voxelización a 0,075 m; no se documentan análisis por rango.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del dataset nuScenes (licencia propia, uso no comercial por defecto en algunas versiones) antes de explotar el modelo en producción.
- El repo indica tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar materializados en el repositorio; verificar antes de usar `pretrained=True`.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/centerpoint-voxel0075.nuscenes.mmdet3d
- Paper CenterPoint: https://arxiv.org/abs/2006.11275
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación e instalación: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- DOI Zenodo (PyTorch PointCloud): https://doi.org/10.5281/zenodo.22159632
- Dataset nuScenes: https://www.nuscenes.org/

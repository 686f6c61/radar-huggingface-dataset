# torch-pointcloud/fcaf3d.sunrgbd.mmdet3d

## Resumen

FCAF3D (Fully Convolutional Anchor-Free 3D Object Detection) es un detector de objetos 3D para nubes de puntos, desarrollado originalmente por Danila Rukhovich, Anna Vorontsova y Anton Konushin y publicado en ECCV 2022. Este checkpoint concreto, `fcaf3d.sunrgbd.mmdet3d`, ha sido convertido desde MMDetection3D al framework PyTorch PointCloud por el usuario `torch-pointcloud`, y está entrenado sobre el dataset SUN RGB-D para detección de objetos 3D en interiores.

El modelo resuelve la detección de objetos 3D en escenas RGB-D de interior, prediciendo cajas 3D axis-aligned a partir de nubes de puntos. Su principal innovación es que elimina los anclas (anchor-free) y las propuestas de región (region proposals), usando una arquitectura totalmente convolucional sobre vóxeles dispersos. Cuenta con 70,5 millones de parámetros, 3 canales de entrada, 10 clases de objetos y 512 características por vóxel.

Es relevante ahora porque ofrece una implementación limpia y ligera (0,3 GB de pesos) en formato safetensors, integrada en una librería moderna de PyTorch, lo que facilita su uso en pipelines de percepción 3D sin depender del ecosistema completo de MMDetection3D. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCAF3D: detector 3D totalmente convolucional, anchor-free y sin propuestas de región, sobre vóxeles dispersos (sparse voxel) |
| Parametros totales | 70.498.638 (70,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de nube de puntos, no secuencia de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Clases | 10 |
| Caracteristicas por voxel | 512 |
| Dataset de entrenamiento | SUN RGB-D |
| Tarea | Deteccion de objetos 3D (3D object detection) |

## Arquitectura y entrenamiento

FCAF3D es un detector de objetos 3D totalmente convolucional y anchor-free. A diferencia de los detectores 3D basados en propuestas (como VoteNet o los métodos de dos etapas), FCAF3D procesa directamente vóxeles dispersos mediante convoluciones 3D dispersas (implementadas con `spconv`) y predice directamente las cajas 3D en cada vóxel ocupado, sin necesidad de anclas ni de una etapa de generación de propuestas. La red tiene 3 canales de entrada (coordenadas y color), produce 512 características por vóxel y clasifica en 10 clases de objetos de interior.

El checkpoint está entrenado sobre el dataset SUN RGB-D, un benchmark de comprensión de escenas RGB-D de interiores con anotaciones de cajas 3D. No se dispone de información detallada sobre el número exacto de tokens/puntos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento posteriores (RLHF/DPO no aplican en este dominio). Este checkpoint ha sido convertido desde la implementación original de MMDetection3D (Apache-2.0) al framework PyTorch PointCloud, manteniendo los pesos en formato safetensors.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas de interior, con predicción de cajas 3D axis-aligned.
- Clasificación en 10 clases de objetos del dataset SUN RGB-D.
- Procesamiento de nubes de puntos con coordenadas (pos), color (color) y normales (normal).
- Extracción de características por vóxel (512 canales) mediante `forward_features`, útil para tareas downstream como segmentación o clasificación.
- Funciona exclusivamente en GPU (kernels CUDA-only para convoluciones dispersas).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de visión 3D, no de lenguaje.

## Casos de uso

- Percepción robótica en interiores: el modelo detecta objetos 3D (muebles, sanitarios, etc.) en nubes de puntos capturadas por sensores RGB-D, adecuado para robots de servicio que necesitan localizar obstáculos y objetos manipulables en tiempo real.
- Reconstrucción y comprensión de escenas: integrado en pipelines de escaneo 3D, permite etiquetar automáticamente objetos en mapas de interior generados con LiDAR o cámaras de profundidad.
- Anotación asistida de datasets 3D: como preetiquetador para acelerar el etiquetado manual de cajas 3D en nuevos datasets de interiores, aprovechando su naturaleza anchor-free para generar propuestas directas.
- Realidad aumentada y virtual: localización de objetos 3D en el entorno para anclar contenido virtual sobre muebles u objetos reales detectados en la escena.
- Análisis de inventario y logística en interiores: detección de objetos y su posición 3D en almacenes o estancias para tareas de conteo y organización espacial.
- Investigación en detección 3D: como baseline reproducible y ligero (70,5 M parámetros) para comparar arquitecturas anchor-free frente a métodos basados en propuestas en el benchmark SUN RGB-D.
- Extracción de características 3D: uso de `forward_features` para obtener embeddings de 512 canales por vóxel que alimenten clasificadores o segmentadores downstream.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP@0.25 | SUN RGB-D | 64,7 |
| mAP@0.5 | SUN RGB-D | 47,93 |

No se han publicado en la información disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 70,5 M parámetros y pesos en safetensors (repo de 0,3 GB), la inferencia requiere GPU con kernels CUDA para `spconv`. Se estima un consumo moderado, aunque el dato exacto no está publicado.
- GPU recomendadas: cualquier GPU NVIDIA compatible con la compilación de `spconv` para la versión de torch y CUDA instalada; el modelo es GPU-only.
- No se garantiza su funcionamiento en CPU: la model card indica explícitamente "GPU-only kernels".
- Opciones de despliegue: librería `torch-pointcloud` (`pip install torch-pointcloud`) junto con `spconv` compilado para la versión de torch y CUDA correspondiente. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.5 (SUN RGB-D) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fcaf3d.sunrgbd.mmdet3d (este) | 70,5 M | Nube de puntos, 3 canales | 47,93 (declarado) | Apache-2.0 | HuggingFace, torch-pointcloud |
| FCAF3D original (MMDetection3D) | ~70,5 M (misma arquitectura) | Nube de puntos, 3 canales | no disponible en la informacion | Apache-2.0 | GitHub open-mmlab/mmdetection3d |
| VoteNet | no disponible en la informacion | Nube de puntos | no disponible en la informacion | no disponible | MMDetection3D |
| Otros detectores 3D anchor-free | no disponible en la informacion | Nube de puntos | no disponible en la informacion | no disponible | no disponible |

No se dispone en la información proporcionada de resultados numéricos de modelos comparables para establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre SUN RGB-D (escenas de interior), por lo que su generalización a escenas exteriores, LiDAR vehicular o dominios distintos es limitada.
- Solo 10 clases de objetos: no cubre categorías fuera del vocabulario de SUN RGB-D.
- Requiere GPU y una compilación específica de `spconv` compatible con la versión de torch y CUDA; esto complica el despliegue en entornos heterogéneos.
- Riesgo de falsos positivos y negativos en escenas con oclusiones densas u objetos poco representados en el dataset de entrenamiento.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes; no debe evaluarse con métricas de NLP.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, `torch-pointcloud`) para producción.
- No se documentan sesgos específicos ni limitaciones idiomáticas (no aplican), pero sí puede heredar sesgos de composición del dataset SUN RGB-D (entornos y objetos típicos de interiores occidentales).

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/fcaf3d.sunrgbd.mmdet3d
- Paper FCAF3D (arXiv): https://arxiv.org/abs/2112.00322
- Repositorio MMDetection3D (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Librería PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de PyTorch PointCloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632

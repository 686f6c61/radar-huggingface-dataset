# torch-pointcloud/minkunet18-w32.semantickitti.mmdet3d

## Resumen

MinkUNet18-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente una U-Net residual dispersa (sparse residual U-Net) basada en convoluciones de Minkowski. Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como conversión del checkpoint original de MMDetection3D, y está entrenado sobre el dataset SemanticKITTI para etiquetar cada punto de una escena LiDAR en una de 19 clases (coche, peatón, vegetación, edificio, etc.).

El modelo resuelve el problema de la comprensión semántica de escenas 3D captadas por LiDAR, un componente clave en conducción autónoma, robótica móvil y cartografía. Frente a las redes densas sobre vóxeles, emplea convoluciones dispersas que operan solo sobre las posiciones ocupadas, lo que reduce drásticamente el coste computacional y de memoria para nubes de puntos dispersas.

Con 21,7 millones de parámetros y un tamaño de repo de 0,1 GB, es un modelo compacto y desplegable en GPU de gama media. Su relevancia actual radica en que ofrece un checkpoint listo para usar desde Python con la librería torch-pointcloud, con licencia Apache-2.0 y métricas declaradas de mIoU 63,06 y OA 92,02 sobre SemanticKITTI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet18-W32 (U-Net residual con convoluciones dispersas de Minkowski) |
| Parametros totales | 21.735.603 (21,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de nube de puntos, no de texto) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 |
| Canales de caracteristicas | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una MinkUNet18-W32, una variante de U-Net con bloques residuales que sustituye las convoluciones densas por convoluciones dispersas generalizadas de Minkowski (paper 4D Spatio-Temporal ConvNets, Choy et al., CVPR 2019). El modelo procesa la nube de puntos como un tensor disperso indexado por coordenadas de vóxel, con 4 canales de entrada (coordenadas x, y, z e intensidad), 19 clases de salida y 96 canales de características en el cuello de botella. El sufijo "W32" hace referencia al ancho de los canales de la red.

El checkpoint se ha convertido desde la implementación de referencia de open-mmlab/mmdetection3d (Apache-2.0) al formato de torch-pointcloud. Se ha entrenado sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR de KITTI (Behley et al., ICCV 2019), que cubre 19 clases semánticas. No se dispone de información detallada sobre el número de tokens/puntos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos específicas más allá de las del pipeline de MMDetection3D. El modelo requiere el paquete `spconv` compilado contra la versión de PyTorch y CUDA del entorno, ya que emplea kernels GPU específicos.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR en 19 clases (coche, camión, autobús, persona, ciclista, motocicleta, carretera, acera, edificio, valla, vegetación, tronco, terreno, poste, señal de tráfico, etc.).
- Procesamiento de nubes de puntos dispersas de forma eficiente mediante convoluciones de Minkowski.
- Entrada de 4 canales por punto: coordenadas espaciales (x, y, z) e intensidad de retorno LiDAR.
- Extracción de características por punto: `forward_features` devuelve un vector de 96 dimensiones por punto, reutilizable para tareas downstream (clasificación, clustering, recuperación).
- Capacidad de reconfigurar la cabeza de clasificación con `reset_classifier(num_classes=N)` para adaptar el modelo a otro número de clases.
- Inferencia por lotes con gestión de índices de lote (`batch`) para procesar varias nubes de puntos simultáneamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto LiDAR de la escena en tiempo de inferencia, proporcionando la base para la detección y el seguimiento de obstáculos en el pipeline de percepción de un vehículo autónomo.
- Robótica móvil en exteriores: un robot con LiDAR puede usar el modelo para construir mapas semánticos del entorno (carretera, acera, vegetación, edificios) y planificar rutas con conocimiento del tipo de superficie.
- Cartografía y mantenimiento de infraestructuras: procesamiento por lotes de nubes de puntos de escaneos móviles para inventariar elementos viarios (postes, señales, vallas) y detectar cambios con el tiempo.
- Análisis de movilidad urbana: segmentación de peatones, ciclistas y vehículos en secuencias LiDAR para estudios de flujos y ocupación del espacio público.
- Preprocesado para modelos downstream: usar `forward_features` para obtener descriptores de 96 dimensiones por punto y alimentar clasificadores ligeros o modelos de segmentación de instancias.
- Investigación y benchmarking: punto de partida reproducible sobre SemanticKITTI para comparar arquitecturas dispersas, con checkpoint listo para cargar en PyTorch y métricas de referencia declaradas.
- Etiquetado asistido de datos: generar preetiquetas semánticas sobre nuevas nubes de puntos para acelerar la anotación manual en proyectos de percepción 3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 63,06 |
| SemanticKITTI | OA (accuracy global) | 92,02 |

No se han publicado en la información disponible resultados desglosados por clase ni comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 21,7 M de parámetros y nubes de puntos de miles de puntos, el modelo es ligero y cabe holgadamente en GPUs de consumo, aunque el consumo real depende del número de puntos y del tamaño de lote.
- GPU recomendadas: cualquier GPU NVIDIA compatible con la compilación de `spconv` para la versión de PyTorch y CUDA instalada (por ejemplo, RTX 3090, RTX 4090, A100, H100). El modelo es GPU-only: los kernels de convolución dispersa no funcionan en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no se dispone de cifras oficiales de consumo.
- Opciones de despliegue: inferencia nativa con PyTorch y torch-pointcloud; requiere `spconv` compilado contra el entorno. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minkunet18-w32.semantickitti.mmdet3d | 21,7 M | SemanticKITTI | 63,06 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| MinkUNet18 original (MMDetection3D) | ~21,7 M | SemanticKITTI | No disponible en la información | Apache-2.0 | GitHub (open-mmlab) |
| Otras arquitecturas de segmentación LiDAR (Cylinder3D, SPVCNN, etc.) | No disponible | SemanticKITTI | No disponible en la información | Variable | Variable |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada; la comparativa se limita al origen del checkpoint (MMDetection3D) y a la categoría general de segmentación semántica LiDAR.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de nubes de puntos LiDAR; no es un modelo de lenguaje ni procesa texto, imágenes RGB ni audio.
- Entrenado únicamente sobre SemanticKITTI: el dominio (escenas de conducción en carretera) y las 19 clases están fijados; el rendimiento puede degradarse en sensores, densidades de puntos o entornos distintos (interiores, LiDAR aéreo, etc.).
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA; una compilación incorrecta impide la ejecución. El modelo es GPU-only.
- Las métricas (mIoU 63,06, OA 92,02) están declaradas por el autor y no verificadas de forma independiente (`verified: false`).
- Riesgo de confusión entre clases semánticamente próximas (por ejemplo, tipos de vehículos o elementos de mobiliario urbano) inherente a la segmentación de 19 clases.
- No se documentan sesgos específicos ni análisis de robustez frente a condiciones meteorológicas adversas, oclusiones o ruido en la nube de puntos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene revisar las licencias de las dependencias (`spconv`, torch-pointcloud) y del dataset SemanticKITTI, que tiene sus propias condiciones de uso.
- No se dispone de información sobre calibración, incertidumbre por punto ni versiones cuantizadas del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/minkunet18-w32.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/
- Guía de instalación (incluye `spconv`): https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/

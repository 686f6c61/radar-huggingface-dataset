# torch-pointcloud/fcaf3d.scannet.mmdet3d

## Resumen

FCAF3D (Fully Convolutional Anchor-Free 3D Object Detection) es un detector de objetos 3D para nubes de puntos, publicado originalmente en ECCV 2022 por Danila Rukhovich, Anna Vorontsova y Anton Konushin. El checkpoint `fcaf3d.scannet.mmdet3d` es una conversión del modelo original de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. Detecta objetos en escenas interiores representadas como nubes de puntos, sin necesidad de anchors ni de propuestas de regiones.

El modelo opera sobre vóxeles dispersos: convierte la nube de puntos en una rejilla voxelizada, extrae características con un backbone totalmente convolucional y predice directamente centros, dimensiones y clases de los objetos. Con 70,5 millones de parámetros y 18 clases de objetos de interior, está entrenado específicamente sobre el dataset ScanNet.

Su relevancia actual es práctica: ofrece un checkpoint listo para usar en PyTorch con pesos en safetensors, dentro de un ecosistema que permite cargarlo con una sola llamada (`tp.create_model`) y ejecutarlo en GPU. Es útil como línea base reproducible para detección 3D en interiores y como componente de pipelines de percepción en robótica o escaneo de interiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCAF3D: detector 3D totalmente convolucional y sin anchors sobre vóxeles dispersos (sparse voxel CNN) |
| Parametros totales | 70.499.414 (70,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 |
| Clases | 18 |
| Canales de caracteristicas | 512 |
| Dataset de entrenamiento | ScanNet |
| Libreria | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

FCAF3D es un detector 3D completamente convolucional y sin anchors. La nube de puntos se voxeliza y se procesa mediante convoluciones dispersas (implementadas con `spconv`), generando un mapa de características de 512 canales. Sobre ese mapa, la cabeza de detección predice directamente para cada vóxel la probabilidad de ser centro de objeto, las dimensiones del bounding box y la clase, sin generar propuestas ni usar anchors. Esta formulación reduce la complejidad del pipeline frente a detectores de dos etapas y evita hiperparámetros asociados a anchors.

El modelo está entrenado sobre ScanNet, un dataset de reconstrucciones 3D de escenas interiores con anotaciones ricas, y cubre 18 clases de objetos. La información disponible no detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron etapas de refinamiento posteriores. El checkpoint es una conversión directa de los pesos originales de mmdetection3d, por lo que hereda el entrenamiento del modelo publicado en el paper de ECCV 2022.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores: predice bounding boxes 3D con clase para cada objeto.
- Funciona sobre vóxeles dispersos, lo que permite procesar nubes de puntos de tamaño variable sin densificar la escena.
- Detección sin anchors: no requiere configuración de anchors ni de propuestas de regiones.
- Extracción de características: el método `forward_features` devuelve un mapa de 512 canales reutilizable para tareas posteriores (segmentación, clasificación, etc.).
- Entrada con posición, color y normal por punto, más etiquetas opcionales de segmento e instancia.
- Salida por lotes (`batch`) para procesar varias escenas simultáneamente.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión 2D, audio ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de interiores: procesar nubes de puntos capturadas con escáneres o cámaras de profundidad para localizar y clasificar muebles y elementos estructurales, aprovechando las 18 clases de ScanNet.
- Robótica móvil en interiores: dotar a un robot de percepción 3D de objetos cercanos para planificación de navegación y manipulación, con inferencia en GPU y un modelo de solo 70,5 M de parámetros.
- Inventario automático de espacios: detectar y contar objetos (sillas, mesas, estanterías, etc.) en reconstrucciones 3D de oficinas o viviendas para tareas de auditoría.
- Línea base para investigación en detección 3D: comparar nuevas arquitecturas contra un detector convolucional sin anchors con métricas públicas en ScanNet (mAP@0.25 y mAP@0.5).
- Preprocesado para reconstrucción aumentada: usar `forward_features` para obtener descriptores de 512 canales por vóxel y alimentar etapas posteriores de segmentación semántica o instanciación.
- Generación de datos sintéticos anotados: aplicar el detector sobre nubes de puntos sintéticas para preetiquetar escenas y acelerar la creación de datasets.
- Integración en pipelines de inspección de edificios: detectar elementos de mobiliario y estructura en escaneos para informes automatizados.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| mAP@0.25 | ScanNet | 69,55 |
| mAP@0.5 | ScanNet | 55,1 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 70,5 M de parámetros, los pesos ocupan aproximadamente 282 MB en FP32 y unos 141 MB en FP16; el consumo real depende del número de puntos y del tamaño de la rejilla voxelizada, que domina el uso de memoria.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `spconv` (por ejemplo, RTX 3090, RTX 4090, A100, H100). El modelo es GPU-only según la model card.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque el requisito exacto depende del tamaño de la escena y del lote.
- Opciones de despliegue: `torch-pointcloud` con PyTorch y `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.5 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fcaf3d.scannet.mmdet3d | 70,5 M | Nube de puntos, 18 clases | 55,1 | Apache 2.0 | Hugging Face (torch-pointcloud) |
| FCAF3D original (mmdetection3d) | no disponible | Nube de puntos, 18 clases | no disponible en esta ficha | Apache 2.0 | GitHub (OpenMMLab) |
| VoteNet | no disponible | Nube de puntos, 18 clases | no disponible en esta ficha | Apache 2.0 | mmdetection3d |
| PointPillars | no disponible | Nube de puntos, 18 clases | no disponible en esta ficha | Apache 2.0 | mmdetection3d |

La información disponible no incluye métricas de los modelos alternativos, por lo que no se puede establecer una comparación cuantitativa fiable más allá del resultado declarado para este checkpoint.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanNet: el dominio son escenas interiores; el rendimiento fuera de ese dominio (exteriores, industria, conducción) no está garantizado.
- Limitado a 18 clases de objetos de interior; no detecta categorías fuera de ese conjunto.
- Requiere `spconv` compilado para la versión concreta de PyTorch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: la model card indica kernels GPU-only; no hay ruta de inferencia en CPU documentada.
- Riesgo de falsos positivos y negativos en escenas con oclusiones densas o geometría ambigua, habitual en detección 3D.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las obligaciones de atribución y las licencias de las dependencias (`spconv`, `torch-pointcloud`).
- El checkpoint tiene muy pocas descargas (19) y ningún «like», lo que sugiere escasa validación por parte de la comunidad.
- No apto para tareas de lenguaje, razonamiento, agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/fcaf3d.scannet.mmdet3d
- Paper FCAF3D (arXiv): https://arxiv.org/abs/2112.00322
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- Paper ScanNet (CVPR 2017): https://arxiv.org/abs/1702.04405

# torch-pointcloud/minkunet34-w32-torchsparse.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, no un modelo de lenguaje. Se trata de una red residual en forma de U (U-Net) que opera mediante convoluciones dispersas de Minkowski, implementada sobre la librería `torch-pointcloud` y exportada desde el ecosistema MMDetection3D de OpenMMLab. El checkpoint que nos ocupa, `minkunet34-w32-torchsparse.semantickitti.mmdet3d`, está entrenado sobre el dataset SemanticKITTI y resuelve la tarea de asignar una de 19 clases semánticas a cada punto de un barrido LiDAR de escena urbana.

El modelo cuenta con 37,9 millones de parámetros, recibe 4 canales de entrada (coordenadas xyz más intensidad) y produce 96 características internas por punto en su variante más ancha (w32). Su relevancia radica en que ofrece un checkpoint listo para usar en PyTorch con pesos en safetensors, algo poco habitual en el ecosistema de segmentación 3D, donde la mayoría de implementaciones viven acopladas a frameworks de detección como MMDetection3D o a código de investigación difícil de reproducir.

Está pensado para investigadores y desarrolladores que necesitan un baseline sólido de segmentación semántica LiDAR sin montar el pipeline completo de OpenMMLab. La licencia Apache-2.0 permite uso comercial, y su tamaño reducido (0,2 GB de repositorio) lo hace desplegable en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32, U-Net residual con convoluciones dispersas de Minkowski (sparse conv) |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada variable de puntos LiDAR) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica; tarea de visión 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |
| Canales de entrada | 4 (xyz + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Características internas | 96 (variante w32) |
| Dependencias | `spconv` compilado para la versión de PyTorch y CUDA del entorno |
| Dataset de entrenamiento | SemanticKITTI |

## Arquitectura y entrenamiento

MinkUNet34-W32 es una U-Net residual con un backbone de 34 capas adaptado al dominio disperso mediante convoluciones de Minkowski (MinkowskiEngine), que operan únicamente sobre las coordenadas ocupadas del voxel grid en lugar de sobre el volumen denso. Esto reduce drásticamente el coste computacional y de memoria frente a convoluciones 3D densas, manteniendo la capacidad de agregar contexto espacial a múltiples escalas mediante el encoder-decoder con conexiones de salto. La variante W32 fija el ancho de los canales a 96 características por punto en la salida del backbone.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR en entornos urbanos, con 19 clases (carretera, acera, coche, peatón, vegetación, edificio, etc.). La model card no documenta el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o refinamiento posteriores; únicamente indica que el checkpoint fue convertido desde MMDetection3D. No se reporta RLHF, DPO ni técnicas de alineación, por tratarse de una tarea de percepción supervisada.

La innovación técnica principal es la propia convolución de Minkowski (paper de Choy et al., CVPR 2019), que generaliza las convoluciones dispersas a 4D (espacio-tiempo) y permite procesar nubes de puntos de forma eficiente. El checkpoint requiere kernels GPU-only de `spconv`, lo que condiciona el despliegue.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR en 19 clases de escena urbana (SemanticKITTI).
- Procesamiento de nubes de puntos dispersas de tamaño variable (el ejemplo de la model card usa 8192 puntos sintéticos, pero la arquitectura admite muestras mayores).
- Extracción de características por punto mediante `forward_features`, devolviendo un vector de 96 dimensiones por punto utilizable para tareas downstream.
- Reutilización como backbone: `reset_classifier(num_classes=0)` permite descabezar el clasificador y usar el modelo como extractor congelado o para fine-tuning.
- Entrada multimodal por punto: coordenadas xyz más intensidad de retorno LiDAR (4 canales).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente perceptivo.

## Casos de uso

- Segmentación de escenas urbanas en pipelines de conducción autónoma: el modelo clasifica cada punto del barrido LiDAR en 19 categorías, permitiendo distinguir carretera, acera, vehículos, peatones y vegetación para tareas de percepción y planificación.
- Preprocesado para detección de objetos 3D: usar la salida semántica como máscara previa para aislar puntos de clase coche o peatón antes de alimentar un detector como PointPillars o CenterPoint.
- Etiquetado asistido de datos LiDAR: generar pre-etiquetas automáticas sobre nuevas secuencias y reducir el coste de anotación manual, con revisión humana posterior de las clases minoritarias.
- Mapeo y reconstrucción de entornos: agregar las predicciones semánticas a lo largo de secuencias SemanticKITTI para construir mapas de ocupación con clases semánticas.
- Extracción de características para búsqueda o clustering: usar `forward_features` para obtener embeddings de 96 dimensiones por punto y alimentar modelos de segmentación no supervisada o recuperación de escenas similares.
- Baseline de investigación: punto de partida reproducible para comparar nuevas arquitecturas de segmentación LiDAR sin reimplementar el pipeline de MMDetection3D.
- Análisis de accesibilidad urbana: clasificar aceras, pasos de peatones y obstáculos a partir de nubes de puntos capturadas con LiDAR para estudios de movilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el dataset SemanticKITTI:

| Metrica | Valor | Verificado |
|---|---|---|
| mIoU (mean IoU) | 68,92 | No |
| OA (overall accuracy) | 92,49 | No |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 37,9 M de parámetros, los pesos en fp32 ocupan aproximadamente 150 MB; el grueso del consumo proviene de las activaciones de las convoluciones dispersas, que dependen del número de puntos de entrada.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con `spconv` compilado para esa versión (A100, H100, RTX 4090, RTX 3090, etc.). La model card indica que los kernels son GPU-only.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo es reducido; una RTX 3060 o superior debería ser suficiente para inferencia con nubes de puntos de tamaño típico de SemanticKITTI, aunque el consumo real depende del número de puntos y del batch.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas para modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet34-W32 (este) | 37,9 M | Nube de puntos variable, 4 canales | 68,92 (declarado) | Apache-2.0 | Hugging Face, safetensors |
| MinkUNet (variante MMDetection3D original) | no disponible | Nube de puntos variable | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |
| Cylinder3D | no disponible | Voxelización cilíndrica | no disponible en esta ficha | no disponible | Repositorio de investigación |
| SPVNAS | no disponible | Búsqueda de arquitectura dispersa | no disponible en esta ficha | no disponible | Repositorio de investigación |

No se dispone de datos comparativos verificados de otros modelos en la información proporcionada; la comparativa se limita a señalar alternativas conocidas de la misma categoría sin cifras confirmadas.

## Limitaciones y advertencias

- Modelo puramente perceptivo: no genera texto, no razona y no soporta instrucciones; no debe presentarse como un modelo de lenguaje.
- Resultados de benchmark declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- Entrenado exclusivamente en SemanticKITTI: generaliza mal a sensores LiDAR con distinta densidad, a entornos no urbanos o a configuraciones de retorno diferentes.
- Requiere `spconv` compilado para la versión exacta de PyTorch y CUDA, lo que complica la reproducibilidad y el despliegue en entornos heterogéneos.
- Kernels GPU-only: no hay ruta CPU documentada, lo que limita su uso en entornos sin GPU NVIDIA.
- Riesgo de confusión entre clases minoritarias (por ejemplo, peatones o ciclistas) y de degradación en condiciones de oclusión o lluvia, habitual en datos LiDAR.
- Licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las licencias del dataset SemanticKITTI y de las dependencias (`spconv`, `torch-pointcloud`) para su caso concreto.
- No se documentan sesgos demográficos ni geográficos, pero el dataset de origen está sesgado hacia ciudades alemanas y condiciones de captura específicas.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-torchsparse.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/

# torch-pointcloud/minkunet18-w32.semantickitti.mit-han-lab

## Resumen

MinkUNet18-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente una U-Net residual dispersa (sparse residual U-Net) basada en convoluciones de Minkowski. Lo publica el usuario `torch-pointcloud` como conversión del checkpoint original de `mit-han-lab/spvnas` (MIT) al formato de la librería `torch-pointcloud`, y está entrenado sobre el dataset SemanticKITTI para clasificar cada punto LiDAR en una de 19 clases (coche, peatón, carretera, edificio, vegetación, etc.).

El modelo tiene 21,7 millones de parámetros, recibe nubes con 4 canales de entrada (coordenadas XYZ más intensidad) y produce logits por punto. Su relevancia práctica está en que es un checkpoint pequeño, con licencia MIT y pesos en safetensors, listo para inferencia en GPU dentro de pipelines de percepción 3D, sin necesidad de reentrenar desde cero. Frente a alternativas densas, el uso de convoluciones dispersas evita procesar el espacio vacío, lo que reduce coste computacional en escenas LiDAR típicas donde más del 95 % del volumen es vacío.

La ficha se apoya en la model card y en el model-index del autor, que declara 61,06 de mIoU y 91,64 de exactitud global (OA) en SemanticKITTI. No hay información sobre el proceso de entrenamiento más allá de la referencia al paper de Minkowski Convolutional Neural Networks y al repositorio SPVNAS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet18 (U-Net residual dispersa con convoluciones de Minkowski), ancho W32 |
| Parametros totales | 21.735.603 (21,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto); entrada variable por número de puntos |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 0,1 GB) |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Caracteristicas internas | 96 |
| Libreria | torch-pointcloud (requiere spconv) |
| Hardware de inferencia | solo GPU (kernels dispersos) |

## Arquitectura y entrenamiento

La arquitectura es una MinkUNet18, es decir, una U-Net con bloques residuales (ResNet-18 de base) adaptada a convoluciones dispersas de Minkowski. En lugar de operar sobre tensores densos, las convoluciones se aplican únicamente sobre las coordenadas ocupadas por puntos LiDAR, lo que permite procesar nubes de decenas de miles de puntos con un coste proporcional a la ocupación real de la escena. El modelo usa un ancho de 32 canales (W32), 4 canales de entrada y una cabeza de clasificación de 19 clases.

El checkpoint se entrenó sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR de KITTI, que cubre 19 clases de escena urbana. La model card no detalla el número de tokens, la composición exacta del dataset, ni si hubo aumentos de datos, RLHF/DPO (no aplica) u otras técnicas de refinamiento. El modelo se presenta como conversión directa desde `mit-han-lab/spvnas`, por lo que la receta de entrenamiento es la del repositorio original de SPVNAS y no se documenta aquí. No se describe ninguna innovación adicional como decodificación especulativa o atención lineal, ya que no es un modelo generativo.

## Capacidades

- Segmentación semántica por punto de nubes LiDAR en 19 clases de SemanticKITTI.
- Entrada de 4 canales: coordenadas XYZ e intensidad de retorno.
- Inferencia sobre nubes de tamaño variable (el ejemplo de la model card usa 8192 puntos sintéticos).
- Extracción de características: `forward_features` devuelve un vector de 96 dimensiones por punto, útil para tareas down-stream (clustering, retrieval, clasificación).
- Posibilidad de reiniciar el clasificador (`reset_classifier(num_classes=0)`) para usar el backbone como extractor puro.
- Procesamiento por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No soporta visión 2D, audio ni modalidades distintas de la nube de puntos 3D.

## Casos de uso

- Percepción en vehículos autónomos y ADAS: el modelo etiqueta cada punto LiDAR de la escena en tiempo de inferencia, permitiendo distinguir carretera, vehículos, peatones y vegetación para la planificación de trayectorias. Su tamaño de 21,7 M lo hace viable en GPUs de a bordo.
- Etiquetado automático de datos (auto-labeling): usar el modelo para pre-anotar grandes volúmenes de nubes LiDAR y reducir el coste de anotación manual, revisando después solo los puntos de baja confianza.
- Robótica móvil y AGVs: segmentación de escenas en almacenes o entornos industriales para evitar obstáculos y clasificar el terreno transitable.
- Análisis de movilidad urbana y gemelos digitales: procesar secuencias LiDAR de vehículos de mapeo para extraer inventarios de mobiliario urbano, edificios y vegetación.
- Extracción de características para búsqueda y clustering: usar los embeddings de 96 dimensiones por punto para agrupar instancias o alimentar clasificadores ligeros aguas abajo.
- Investigación en segmentación 3D: servir como baseline reproducible con licencia MIT para comparar nuevas arquitecturas sobre SemanticKITTI.
- Preprocesado en pipelines de mapas HD: filtrar y clasificar puntos antes de la construcción de mapas semánticos de alta definición.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 61,06 |
| SemanticKITTI | OA (exactitud global) | 91,64 |

No se han publicado en la información disponible resultados adicionales (por clase, latencia o throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Inferencia exclusivamente en GPU: la model card indica que los kernels de convolución dispersa son GPU-only (`model.cuda().eval()`).
- VRAM estimada: no disponible de forma oficial. Con 21,7 M de parámetros en FP32 el peso ronda los 87 MB; el consumo real depende del número de puntos y del tamaño de lote, por lo que se recomienda reservar al menos varios GB para escenas LiDAR completas.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con `spconv` (por ejemplo, RTX 3090, RTX 4090, A100, H100). No se documentan requisitos mínimos concretos.
- Cabe en GPU de consumo (RTX 3060 en adelante) siempre que se compile `spconv` para la versión de CUDA y PyTorch instalada.
- Opciones de despliegue: `torch-pointcloud` con `spconv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet18-W32 (este) | 21,7 M | XYZ + intensidad | 19 | 61,06 (declarado) | MIT | HuggingFace |
| Cylinder3D | no disponible | LiDAR | 19 | no disponible en esta ficha | no disponible | no disponible |
| SPVNAS (original) | no disponible | LiDAR | 19 | no disponible en esta ficha | MIT (repo) | GitHub mit-han-lab |
| RandLA-Net | no disponible | LiDAR | 19 | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación numérica queda limitada a este checkpoint. La ventaja diferencial de esta versión es su empaquetado listo para `torch-pointcloud` con pesos safetensors y licencia MIT.

## Limitaciones y advertencias

- Los resultados de mIoU y OA están declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos como referencia.
- Entrenado exclusivamente sobre SemanticKITTI: el rendimiento puede degradarse en dominios distintos (LiDAR de otros sensores, entornos no urbanos, climas adversos).
- Requiere `spconv` compilado para la combinación exacta de PyTorch y CUDA; una incompatibilidad de versiones impide la carga del modelo.
- Solo funciona en GPU; no hay ruta de inferencia en CPU documentada.
- No es un modelo de lenguaje: no admite prompts, tool calling ni conversación; cualquier uso de ese tipo es inaplicable.
- Riesgo de confusión entre clases minoritarias (por ejemplo, peatones o ciclistas) inherente a los benchmarks LiDAR; no se publican métricas por clase.
- La licencia MIT permite uso comercial, pero el usuario debe cumplir también las licencias de las dependencias (`spconv`, `torch-pointcloud`).
- No se documentan sesgos específicos más allá de los derivados del dataset de entrenamiento (escenas urbanas centroeuropeas).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/minkunet18-w32.semantickitti.mit-han-lab
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio original SPVNAS (mit-han-lab): https://github.com/mit-han-lab/spvnas
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/

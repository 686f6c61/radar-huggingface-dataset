# torch-pointcloud/spunet-v1m1.scannet20.pointcept

## Resumen

SpUNet-v1m1.scannet20.pointcept es un modelo de segmentación semántica de nubes de puntos 3D basado en una U-Net con convoluciones dispersas (sparse convolutions), implementada sobre la librería Minkowski Engine. Lo publica el proyecto `torch-pointcloud` (Arthur Dujardin) como un checkpoint convertido desde el repositorio Pointcept, con el objetivo de ofrecer una implementación reproducible y empaquetada en PyTorch del clásico SpUNet para la comunidad de visión 3D.

El modelo está entrenado sobre ScanNet con 20 clases semánticas de interiores (suelo, pared, silla, mesa, etc.) y cuenta con 39,2 millones de parámetros. Recibe nubes de puntos con 6 canales de entrada (coordenadas XYZ más color RGB) y predice una etiqueta por punto. Es relevante porque proporciona un baseline sólido y ligero para tareas de segmentación de escenas interiores, con métricas publicadas de mIoU 75,67 y exactitud global (OA) 91,28 sobre el conjunto de evaluación de ScanNet.

La arquitectura sigue el diseño de las 4D Spatio-Temporal ConvNets de Choy et al. (CVPR 2019), aplicando convoluciones sobre una rejilla dispersa para procesar eficientemente nubes de puntos de gran tamaño sin voxelizar densamente toda la escena. El checkpoint se distribuye en formato safetensors bajo licencia MIT, con un tamaño de repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpUNet (U-Net con convoluciones dispersas sobre Minkowski Engine) |
| Parametros totales | 39.174.996 (39,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de nube de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (XYZ + RGB) |
| Clases de salida | 20 |
| Caracteristicas internas | 96 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es una SpUNet, es decir, una U-Net compuesta por bloques de convolución dispersa 3D implementados con Minkowski Engine. En lugar de operar sobre una rejilla densa, las convoluciones se aplican únicamente sobre las posiciones ocupadas de la nube de puntos, lo que reduce drásticamente el coste computacional y de memoria en escenas grandes. La red recibe un tensor de características de 6 canales por punto (posición XYZ y color RGB) y produce un logit por clase y punto, con una representación interna de 96 características por punto.

El entrenamiento se realizó sobre ScanNet, un dataset de reconstrucciones 3D de interiores con anotaciones semánticas densas por punto, restringido a 20 clases. No se dispone de información detallada sobre el número de tokens, composición exacta del dataset, esquema de aumentación de datos ni si se aplicaron técnicas de refinamiento posteriores. El checkpoint es una conversión del modelo original de Pointcept al formato de la librería `torch-pointcloud`, que empaqueta los pesos y las transformaciones de preprocesado necesarias para la inferencia.

## Capacidades

- Segmentación semántica por punto de nubes de puntos 3D de escenas interiores en 20 clases de ScanNet.
- Procesamiento de nubes de puntos con información de color (6 canales de entrada).
- Extracción de características por punto mediante `forward_features`, con salida de 96 dimensiones por punto.
- Posibilidad de eliminar la cabeza de clasificación (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de representaciones.
- Inferencia por lotes con collate de múltiples nubes de puntos.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente perceptivo de visión 3D.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Segmentación de escenas interiores para robótica móvil: el modelo etiqueta suelo, paredes, muebles y otros elementos de una nube de puntos capturada por LiDAR o RGB-D, permitiendo a un robot de interior construir mapas semánticos y planificar la navegación.
- Anotación asistida de datos 3D: preetiquetar nubes de puntos de nuevos escaneos para que anotadores humanos solo revisen y corrijan, reduciendo el coste de crear datasets de segmentación semántica.
- Reconstrucción y modelado BIM: clasificar elementos estructurales y mobiliario en escaneos de edificios para generar modelos semánticos de interiores.
- Realidad aumentada y mixta: identificar superficies y objetos en la escena capturada por el dispositivo para anclar contenido virtual de forma coherente con el entorno.
- Extracción de características para tareas downstream: usar la salida de 96 dimensiones por punto como entrada de clasificadores de escena, detección de objetos 3D o modelos de registro de nubes de puntos.
- Automatización de inventario en interiores: segmentar objetos y mobiliario en escaneos de oficinas o almacenes para tareas de inventariado y análisis de ocupación.
- Investigación en visión 3D: servir como baseline reproducible de SpUNet sobre ScanNet 20 para comparar nuevas arquitecturas de segmentación de nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| mIoU | ScanNet (20 clases) | 75,67 |
| OA (exactitud global) | ScanNet (20 clases) | 91,28 |

No se han publicado en la información disponible resultados adicionales de benchmarks ni comparativas con otros modelos.

## Requisitos de hardware

- El modelo requiere GPU: los kernels de `spconv` / Minkowski Engine son exclusivos de CUDA, según indica la model card (`model.cuda().eval()  # GPU-only kernels`).
- VRAM estimada: no disponible de forma oficial. Con 39,2 M de parámetros, el peso de los pesos en FP32 ronda los 157 MB; el consumo real depende del número de puntos de entrada y de la implementación de convoluciones dispersas.
- GPU recomendadas: no disponible. Por tamaño del modelo, cualquier GPU NVIDIA con soporte CUDA moderno (por ejemplo, RTX 3090, RTX 4090, A100, H100) debería poder ejecutarlo; no se han publicado mediciones específicas.
- Cabe en GPU de consumo: probablemente sí por tamaño de parámetros, aunque no hay datos oficiales de VRAM pico durante la inferencia.
- Opciones de despliegue: librería `torch-pointcloud` con `spconv` compilado para la versión de PyTorch y CUDA correspondiente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otras variantes de SpUNet, PointNet++ o MinkowskiNet sobre ScanNet 20), por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spunet-v1m1.scannet20.pointcept | 39,2 M | ScanNet 20 | 75,67 | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de nubes de puntos de interiores; no es un modelo de lenguaje ni un modelo multimodal general.
- Entrenado solo sobre ScanNet con 20 clases: el vocabulario semántico está cerrado y no generaliza a clases no vistas ni a dominios muy distintos (exteriores, industria, conducción autónoma).
- Dependencia de `spconv` con una compilación que coincida con la versión de PyTorch y CUDA del entorno, lo que añade fricción en el despliegue y en la reproducibilidad.
- Requiere GPU con CUDA; no hay soporte documentado de inferencia en CPU.
- Las métricas publicadas (mIoU 75,67, OA 91,28) figuran como no verificadas en el model-index; conviene validarlas en el propio pipeline antes de usarlas como referencia.
- No se documentan sesgos específicos, pero al entrenarse en interiores de ScanNet puede heredar sesgos de composición de escenas y de distribución geográfica del dataset.
- Riesgo de predicciones erróneas en puntos con oclusión, ruido de sensor o geometría ambigua; no se aportan estimaciones de calibración ni de incertidumbre.
- Licencia MIT, que permite uso comercial y modificación, pero se recomienda revisar las licencias de las dependencias (spconv, Minkowski Engine) y del dataset ScanNet para usos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/spunet-v1m1.scannet20.pointcept
- Paper de referencia (4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks): https://arxiv.org/abs/1904.08755
- Repositorio Pointcept (origen del checkpoint): https://github.com/Pointcept/Pointcept
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud (incluye spconv): https://pytorch-pointcloud.org/latest/installation/

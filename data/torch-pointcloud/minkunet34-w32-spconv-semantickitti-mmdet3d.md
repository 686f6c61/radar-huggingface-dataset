# torch-pointcloud/minkunet34-w32-spconv.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32-SPConv es un modelo de segmentación semántica de nubes de puntos 3D basado en una U-Net residual dispersa (sparse residual U-Net) con convoluciones dispersas de Minkowski. Lo desarrolla el proyecto torch-pointcloud (Arthur Dujardin) y se distribuye como checkpoint convertido desde MMDetection3D, la caja de herramientas de OpenMMLab. El modelo resuelve la clasificación por punto de escenas LiDAR, asignando cada punto a una de 19 clases semánticas (carretera, vehículo, peatón, vegetación, etc.).

Se trata de un modelo específico de dominio, no de un modelo de lenguaje: procesa tensores de puntos con 4 canales de entrada (coordenadas XYZ más intensidad) y produce logits por punto. Con 37,9 millones de parámetros y una anchura de características de 96, es lo bastante compacto para inferencia en GPU de gama media, aunque sus kernels dispersos dependen de `spconv` y requieren compilación específica para la versión de PyTorch y CUDA.

Su relevancia actual reside en que ofrece un punto de partida reproducible para percepción 3D en conducción autónoma y robótica, con métricas declaradas sobre SemanticKITTI (mIoU 68,65 y OA 92,06) y una licencia Apache-2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 con convoluciones dispersas (SPConv), U-Net residual |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos; entrada variable por número de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases de salida | 19 |
| Anchura de caracteristicas | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

El modelo sigue el diseño MinkUNet propuesto en el artículo "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks" (Choy et al., CVPR 2019). Es una U-Net residual con 34 capas adaptada al dominio disperso: en lugar de convoluciones densas sobre vóxeles, emplea convoluciones de Minkowski (implementadas aquí mediante `spconv`) que operan únicamente sobre las posiciones ocupadas de la nube de puntos. La variante W32 fija la anchura base de los canales y el modelo expone 96 características en su etapa final, con una cabeza de clasificación de 19 clases.

El checkpoint se ha convertido desde MMDetection3D y se distribuye a través de la librería `torch-pointcloud`. La model card no detalla el número de tokens ni la composición exacta del dataset más allá de indicar SemanticKITTI, el benchmark estándar de segmentación semántica LiDAR con secuencias de KITTI. No se documentan fases de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de percepción. Tampoco se especifican aumentos de datos, schedule de entrenamiento ni función de pérdida en la información disponible.

## Capacidades

- Segmentación semántica por punto de nubes de puntos LiDAR en 19 clases de SemanticKITTI.
- Procesamiento de nubes dispersas de tamaño variable mediante convoluciones de Minkowski.
- Extracción de características: `forward_features` devuelve un vector de 96 dimensiones por punto, reutilizable para tareas downstream (detección, clustering, clasificación de instancias).
- Reconfiguración de la cabeza de clasificación con `reset_classifier(num_classes=0)` para usar el modelo como backbone congelado.
- Entrada multimodal básica: coordenadas XYZ más intensidad de retorno LiDAR (4 canales).
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multimodales de imagen, audio o vídeo.

## Casos de uso

- Percepción en conducción autónoma: segmentar cada barrido LiDAR en carretera, vehículos, peatones y vegetación para alimentar módulos de planificación y frenado de emergencia; el modelo está entrenado específicamente sobre SemanticKITTI, el dominio de referencia para esta tarea.
- Anotación semántica automatizada de datasets LiDAR: preetiquetar nubes de puntos nuevas y revisar solo las regiones de baja confianza, reduciendo el coste de anotación manual en pipelines de datos.
- Robótica móvil en exteriores: clasificar el terreno circundante de un robot o vehículo autónomo para distinguir superficies transitables de obstáculos y vegetación.
- Backbone para modelos downstream: usar las características de 96 dimensiones por punto como entrada a cabezas de detección 3D, segmentación de instancias o clustering panóptico.
- Control de calidad y validación de sensores LiDAR: detectar discrepancias entre la segmentación esperada y la observada para identificar calibraciones defectuosas o retornos anómalos.
- Investigación y benchmarking: servir como línea base reproducible de MinkUNet34 sobre SemanticKITTI para comparar nuevas arquitecturas de convolución dispersa o estrategias de aumento de datos.
- Prototipado rápido en GPU de consumo: al tener 37,9 M de parámetros, permite iterar en una RTX 4090 o similar sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion de nubes de puntos | mIoU | 68,65 |
| SemanticKITTI | Segmentacion de nubes de puntos | OA (accuracy global) | 92,06 |

No se han publicado en la información disponible resultados desglosados por clase (IoU por categoría), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,9 M de parámetros en FP32 el peso ocupa aproximadamente 150 MB, por lo que la VRAM vendrá dominada por el tamaño del batch de puntos y las estructuras dispersas intermedias.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `spconv`; una RTX 3090, RTX 4090, A100 o H100 son opciones razonables.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque el consumo real depende del número de puntos por muestra y del batch.
- El modelo es GPU-only según la model card ("GPU-only kernels"); no se contempla inferencia en CPU.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` con `spconv` compilado para la versión exacta de PyTorch y CUDA. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet34-W32-SPConv (este) | 37,9 M | SemanticKITTI | 68,65 | Apache-2.0 | Hugging Face, torch-pointcloud |
| MinkUNet (variantes MMDetection3D) | no disponible | SemanticKITTI | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |
| Otras arquitecturas de segmentacion LiDAR (Cylinder3D, SPVCNN, RangeNet++) | no disponible | SemanticKITTI | no disponible en esta ficha | variable | no disponible |

No se dispone en la información proporcionada de métricas de modelos comparables para establecer una comparación cuantitativa fiable; los datos de las filas alternativas no están confirmados en esta ficha.

## Limitaciones y advertencias

- Modelo de dominio específico: entrenado sobre SemanticKITTI (entornos urbanos y de carretera en Alemania); el rendimiento puede degradarse en otros sensores, densidades de puntos o condiciones meteorológicas no representadas.
- Solo 19 clases: cualquier objeto fuera de la taxonomía de SemanticKITTI se asignará a una clase existente o a la clase de fondo, sin detección de lo desconocido.
- Dependencia frágil de `spconv`: requiere una compilación alineada con la versión de PyTorch y CUDA, lo que complica la reproducibilidad y el despliegue en entornos heterogéneos.
- Inferencia exclusivamente en GPU: no hay soporte documentado para CPU, lo que limita el despliegue en dispositivos embebidos sin CUDA.
- Métricas no verificadas: los valores de mIoU y OA proceden de la model card y no han sido validados de forma independiente.
- Riesgo de sesgo geográfico y de sensor: la distribución de entrenamiento condiciona fuertemente los resultados en despliegues reales.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, `torch-pointcloud`) y citar los artículos originales según la model card.
- No apto para tareas de generación de texto, razonamiento o agentes: es un modelo discriminativo de percepción 3D.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-spconv.semantickitti.mmdet3d
- Paper Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/

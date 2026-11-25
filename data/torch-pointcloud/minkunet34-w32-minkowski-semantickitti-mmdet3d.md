# torch-pointcloud/minkunet34-w32-minkowski.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR desarrollado dentro del ecosistema `torch-pointcloud` por Arthur Dujardin, y publicado en Hugging Face bajo la organización `torch-pointcloud`. Implementa la arquitectura MinkUNet, una U-Net residual dispersa basada en convoluciones de Minkowski (Minkowski Engine) presentada en el artículo "4D Spatio-Temporal ConvNets" (Choy et al., CVPR 2019). El checkpoint concreto es una conversión del modelo oficial de `open-mmlab/mmdetection3d` entrenado sobre el dataset SemanticKITTI.

El modelo resuelve la tarea de asignar una clase semántica a cada punto de una nube LiDAR de escenas urbanas, con 19 clases de salida (carretera, coche, peatón, edificio, vegetación, etc.). Con 37,9 millones de parámetros y una entrada de 4 canales (x, y, z, intensidad), está pensado para integrarse en pipelines de percepción 3D para conducción autónoma y robótica móvil. Su relevancia actual radica en que ofrece un checkpoint listo para usar en PyTorch con pesos en `safetensors`, evitando la dependencia de configuraciones complejas de MMDetection3D.

A diferencia de los modelos de lenguaje, este es un modelo puramente discriminativo y específico de dominio: no genera texto ni soporta instrucciones. Su valor está en la reproducibilidad de un baseline clásico de segmentación LiDAR con métricas declaradas (mIoU 69,2 y OA 92,36 sobre SemanticKITTI) y una licencia Apache-2.0 permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 (U-Net residual dispersa con convoluciones de Minkowski) |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Dimensión de features | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Tamaño del repositorio | 0,2 GB |
| Librería | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

MinkUNet34-W32 es una red encoder-decoder de tipo U-Net construida sobre convoluciones dispersas de Minkowski. La clave de la arquitectura es que las convoluciones se calculan únicamente sobre las coordenadas ocupadas de la nube de puntos (vóxeles activos), lo que permite procesar nubes LiDAR de decenas de miles de puntos con un coste proporcional a la ocupación y no al volumen del espacio. El sufijo "W32" indica un ancho de canal base de 32 en el primer nivel del encoder, y "34" hace referencia a la profundidad del backbone residual (equivalente a un ResNet-34 adaptado a 3D disperso).

La entrada son 4 canales por punto (coordenadas x, y, z e intensidad de retorno LiDAR), que se voxelizan antes de entrar en la red. La salida es un logit por punto para cada una de las 19 clases de SemanticKITTI. El modelo se entrenó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR de KITTI, y el checkpoint publicado es una conversión directa desde los pesos oficiales de MMDetection3D. No se documentan en la información disponible detalles sobre número de tokens, composición exacta del dataset, aumentos de datos ni si se aplicó algún tipo de refinamiento posterior al entrenamiento supervisado.

## Capacidades

- Segmentación semántica densa de nubes de puntos LiDAR: asigna una de 19 clases a cada punto de entrada.
- Procesamiento de escenas urbanas completas con decenas de miles de puntos por frame gracias a la convolución dispersa.
- Extracción de características: el método `forward_features` devuelve un vector de 96 dimensiones por punto, útil para tareas downstream (clustering, detección, retrieval).
- Clasificador intercambiable: `reset_classifier(num_classes=0)` permite reutilizar el backbone para otros dominios o números de clases.
- Inferencia solo en GPU: los kernels de `spconv`/Minkowski requieren CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo generativo).

## Casos de uso

- Percepción para conducción autónoma: segmentar cada frame LiDAR en carretera, vehículos, peatones y obstáculos para alimentar módulos de planificación y evitación de colisiones; el modelo está entrenado exactamente sobre el dominio de KITTI.
- Anotación automática de datasets LiDAR: preetiquetar nubes de puntos para acelerar el etiquetado humano en proyectos de percepción 3D, usando la salida del modelo como propuesta inicial que un anotador revisa.
- Robótica móvil en exteriores: clasificar el entorno (vegetación, suelo, estructuras) para navegación segura de robots y vehículos autónomos en campus o entornos urbanos.
- Mapeo semántico 3D: agregar las segmentaciones por frame en un mapa global para construir mapas semánticos de alta definición de un entorno recorrido.
- Extracción de features para modelos downstream: usar los vectores de 96 dimensiones por punto como entrada a clasificadores o detectores 3D personalizados, aprovechando el backbone preentrenado.
- Investigación y benchmarking: servir como baseline reproducible de MinkUNet sobre SemanticKITTI para comparar nuevas arquitecturas de segmentación LiDAR sin reentrenar desde cero.
- Filtrado y limpieza de nubes: aislar clases concretas (por ejemplo, suelo o vegetación) en pipelines de procesado de datos LiDAR industriales o topográficos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentación semántica de nubes de puntos | mIoU | 69,2 |
| SemanticKITTI | Segmentación semántica de nubes de puntos | OA (accuracy global) | 92,36 |

No se han publicado en la información disponible resultados adicionales por clase, comparativas con otros checkpoints ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,9 M de parámetros los pesos ocupan aproximadamente 150 MB en FP32, pero el consumo real depende del número de vóxeles activos y del tamaño de la escena, por lo que puede crecer con nubes grandes.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la compilación de `spconv`; para escenas SemanticKITTI completas se recomienda al menos 8-16 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 en adelante, siempre que se compile `spconv` para la versión de CUDA y PyTorch correspondiente.
- Opciones de despliegue: `torch-pointcloud` con PyTorch y `spconv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet34-W32 (este) | 37,9 M | Nube LiDAR, 4 canales, 19 clases | 69,2 (declarado) | Apache-2.0 | Hugging Face, safetensors |
| MinkUNet de MMDetection3D | ~37,9 M (misma arquitectura) | Nube LiDAR, 4 canales, 19 clases | no disponible en esta ficha | Apache-2.0 | GitHub (config + pesos) |
| Cylinder3D | no disponible | Nube LiDAR | no disponible en esta ficha | no disponible | Repositorio académico |
| SPVCNN | no disponible | Nube LiDAR | no disponible en esta ficha | no disponible | Repositorio académico |

No se dispone de datos verificados de otros modelos comparables en la información proporcionada; las filas sin cifras se indican como no disponibles para no inventar resultados.

## Limitaciones y advertencias

- Modelo específico de dominio: solo segmenta nubes de puntos LiDAR con el esquema de 19 clases de SemanticKITTI; no es un modelo de propósito general ni generativo.
- Dependencia de compilación: requiere `spconv` compilado para la versión exacta de PyTorch y CUDA, lo que complica el despliegue y la portabilidad.
- Solo GPU: los kernels de convolución dispersa no funcionan en CPU en la práctica, lo que limita el despliegue en entornos sin acelerador.
- Métricas no verificadas: los valores de mIoU y OA los declara el autor y están marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- Sesgos de dominio: entrenado con datos de KITTI (Alemania), puede degradarse en entornos con sensores, densidades o condiciones meteorológicas distintas.
- Riesgo de error en clases minoritarias: la accuracy global alta (92,36) no garantiza buen rendimiento en clases poco frecuentes; el mIoU de 69,2 indica margen de error relevante.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, Minkowski Engine) y del dataset original.
- Sin garantías de producción: no se documentan pruebas de robustez, calibración ni comportamiento ante nubes corruptas o fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-minkowski.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guía de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Dataset SemanticKITTI: http://semantic-kitti.org/

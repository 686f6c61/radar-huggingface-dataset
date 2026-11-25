# torch-pointcloud/fcaf3d.scannet.mmdet3d

## Resumen

FCAF3D (Fully Convolutional Anchor-Free 3D Object Detection) es un modelo de detección de objetos 3D sobre nubes de puntos, desarrollado originalmente por Danila Rukhovich, Anna Vorontsova y Anton Konushin y publicado en ECCV 2022. Esta ficha concreta, `torch-pointcloud/fcaf3d.scannet.mmdet3d`, es una conversión del checkpoint original de MMDetection3D al ecosistema de la librería `torch-pointcloud`, mantenida por Arthur Dujardin, y está entrenada sobre el dataset ScanNet para detectar 18 clases de objetos en escenas interiores.

El modelo resuelve el problema de la detección 3D en interiores a partir de nubes de puntos con información de posición, color y normales, sin necesidad de anclas (anchor-free) ni de propuestas en dos etapas. Con 70,5 millones de parámetros y una arquitectura totalmente convolucional sobre vóxeles dispersos, ofrece un equilibrio interesante entre precisión y coste computacional para tareas de percepción 3D.

Su relevancia actual radica en que proporciona un checkpoint listo para usar en formato `safetensors` dentro de una librería moderna de PyTorch, lo que facilita la integración en pipelines de robótica, realidad aumentada y análisis de escenas interiores sin depender del stack completo de MMDetection3D. Reporta un mAP@0.25 de 69,53 y un mAP@0.5 de 55,23 sobre ScanNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fully convolutional anchor-free sobre vóxeles dispersos (FCAF3D) |
| Parametros totales | 70.499.414 (70,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de nube de puntos, 8.192 puntos en el ejemplo de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión 3D, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (posición; color y normales según transformación) |
| Clases | 18 |
| Dimensión de features | 512 |
| Dataset de entrenamiento | ScanNet |
| Tamaño del repo | 0,3 GB |

## Arquitectura y entrenamiento

FCAF3D es un detector 3D totalmente convolucional y libre de anclas que opera directamente sobre vóxeles dispersos. La red procesa la nube de puntos mediante convoluciones dispersas (implementadas con `spconv`), extrae un mapa de features de 512 canales y predice, para cada vóxel, la pertenencia a objeto, la clase y los parámetros de la caja 3D (centro, dimensiones y orientación). Al prescindir de anclas y de una segunda etapa de refinamiento, reduce la complejidad del pipeline frente a detectores basados en propuestas como VoteNet.

El entrenamiento se realiza sobre ScanNet, un dataset de reconstrucciones 3D de escenas interiores con anotaciones ricas, con 18 clases de objetos. La model card no detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos específicas más allá de las del pipeline de MMDetection3D del que procede la conversión. La innovación principal del método es su formulación anchor-free y fully convolutional, que simplifica el diseño y mejora la generalización entre escenas.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores (18 clases de ScanNet).
- Predicción de cajas 3D con centro, dimensiones y orientación a partir de posición, color y normales.
- Extracción de features de 512 canales mediante `forward_features`, útil para tareas downstream como segmentación o recuperación.
- Procesamiento de nubes de puntos de tamaño variable (el ejemplo de la model card usa 8.192 puntos).
- Ejecución en GPU exclusivamente (kernels GPU-only según la model card).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo 3D.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Robótica de interiores: el modelo puede detectar objetos como sillas, mesas o puertas en la nube de puntos de un robot doméstico para planificación de manipulación y navegación, aprovechando su salida de cajas 3D orientadas.
- Realidad aumentada: integración en pipelines de captura de escena para anclar contenido virtual sobre objetos reales detectados, gracias a la predicción de orientación de las cajas.
- Análisis de escenas interiores a escala: procesamiento por lotes de reconstrucciones 3D (por ejemplo, de escaneos de viviendas) para inventariar mobiliario y elementos estructurales con las 18 clases de ScanNet.
- Preentrenamiento y extracción de features: usar `forward_features` para obtener representaciones de 512 canales que alimenten clasificadores o segmentadores downstream con menos datos etiquetados.
- Investigación en detección 3D: servir como baseline anchor-free frente a detectores basados en propuestas (VoteNet, Group-Free) en experimentos académicos sobre ScanNet.
- Sistemas de accesibilidad: detección de obstáculos y objetos relevantes en interiores para aplicaciones de asistencia a personas con discapacidad visual, a partir de nubes de puntos capturadas por sensores de profundidad.
- Automatización de inventario en entornos industriales o comerciales: detección de equipos y mobiliario en escaneos 3D para tareas de auditoría de espacios.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados):

| Dataset | Métrica | Valor |
|---|---|---|
| ScanNet | mAP@0.25 | 69,53 |
| ScanNet | mAP@0.5 | 55,23 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, mAP@0.5 en otras particiones, latencia o throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 70,5 M de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,28 GB, a lo que hay que sumar la memoria de activaciones y del grid de vóxeles dispersos, que depende del número de puntos de entrada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de `spconv`; la model card no especifica modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas consumer con suficiente VRAM para el tamaño de nube de puntos procesado, aunque no hay cifras oficiales.
- Opciones de despliegue: librería `torch-pointcloud` con `spconv` compilado para la versión de torch y CUDA correspondiente; ejecución GPU-only. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | mAP@0.5 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fcaf3d.scannet.mmdet3d | 70,5 M | nube de puntos (8.192 en ejemplo) | 55,23 (declarado, no verificado) | Apache-2.0 | Hugging Face, torch-pointcloud |
| VoteNet | no disponible en la información | nube de puntos | no disponible | no disponible | no disponible |
| Group-Free 3D | no disponible en la información | nube de puntos | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de parámetros, contexto ni rendimiento de los modelos alternativos, por lo que la comparación cuantitativa queda limitada al resultado declarado de FCAF3D.

## Limitaciones y advertencias

- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos como referencia en producción.
- El modelo está entrenado únicamente sobre ScanNet y con 18 clases; su generalización a otros dominios (exteriores, industrial, otros sensores) no está documentada.
- Requiere `spconv` compilado para la combinación exacta de torch y CUDA, lo que añade fricción de instalación y despliegue.
- Ejecución GPU-only: no hay soporte CPU documentado.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos pequeños o clases poco representadas; no se documentan métricas por clase.
- No es un modelo lingüístico: no tiene sesgos de idioma, pero puede heredar sesgos del dataset ScanNet (entornos interiores occidentales, ciertas categorías de mobiliario).
- Licencia Apache-2.0: permite uso comercial, pero el modelo deriva de MMDetection3D (también Apache-2.0); conviene revisar las licencias de los datasets y dependencias (spconv) en producción.
- No se documentan límites de tamaño de nube de puntos ni comportamiento con entradas muy grandes o muy pequeñas.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/fcaf3d.scannet.mmdet3d
- Paper FCAF3D: https://arxiv.org/abs/2112.00322
- Repositorio MMDetection3D: https://github.com/open-mmlab/mmdetection3d
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet

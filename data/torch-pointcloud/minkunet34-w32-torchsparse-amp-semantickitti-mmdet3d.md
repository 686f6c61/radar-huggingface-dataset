# torch-pointcloud/minkunet34-w32-torchsparse-amp.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, no un modelo de lenguaje. Implementa una U-Net residual dispersa (sparse residual U-Net) basada en convoluciones de Minkowski, la arquitectura presentada por Choy, Gwak y Savarese en "4D Spatio-Temporal ConvNets" (CVPR 2019). Este checkpoint concreto ha sido entrenado sobre el dataset SemanticKITTI con 19 clases y está empaquetado para la librería `torch-pointcloud` de Arthur Dujardin, con pesos convertidos desde MMDetection3D.

El modelo resuelve la tarea de asignar una etiqueta semántica a cada punto de una nube LiDAR (coche, peatón, carretera, edificio, vegetación, etc.), lo que es la base de la percepción 3D en conducción autónoma, robótica móvil y cartografía. Con 37,9 millones de parámetros y 96 canales de características en el tronco, es un modelo compacto pensado para inferencia sobre GPU con kernels dispersos, no para despliegue en CPU.

Su relevancia actual es práctica: la conversión desde MMDetection3D a un formato nativo de `torch-pointcloud` con pesos en safetensors facilita la reutilización del checkpoint fuera del ecosistema OpenMMLab, con una licencia Apache-2.0 permisiva y una API de extracción de características que permite usar el tronco como backbone en pipelines propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 (U-Net residual dispersa con convoluciones de Minkowski) |
| Parámetros totales | 37.892.787 (37,9 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos; entrada variable de N puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 |
| Canales de características | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Librería | torch-pointcloud (requiere spconv) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La red es una U-Net residual con operaciones de convolución dispersa de Minkowski: en lugar de densificar el volumen 3D, las convoluciones se calculan únicamente sobre las coordenadas ocupadas, lo que hace viable procesar nubes LiDAR de decenas de miles de puntos con un coste proporcional a la ocupación. La variante "34-W32" indica una profundidad tipo ResNet-34 con anchura base de 32 canales, que se materializa en 96 canales de características en la salida del tronco según la model card. La entrada son 4 canales (posición 3D más intensidad) y la salida son logits por punto para 19 clases.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de segmentación semántica de secuencias LiDAR (Behley et al., ICCV 2019). La model card no documenta el número de tokens ni épocas, la composición exacta del dataset, el uso de aumentos de datos ni si hubo una fase posterior de ajuste fino o destilación; tampoco se detalla la receta de optimización. El checkpoint se convirtió desde los pesos oficiales de MMDetection3D, y el sufijo "amp" sugiere entrenamiento con precisión mixta automática, aunque la model card no lo confirma explícitamente. No se documentan innovaciones adicionales como decodificación especulativa ni atención lineal, que no aplican a este dominio.

## Capacidades

- Segmentación semántica por punto de nubes LiDAR en 19 clases de SemanticKITTI (vehículo, peatón, ciclista, carretera, acera, edificio, vegetación, terreno, etc.).
- Procesamiento de nubes dispersas de tamaño variable sin voxelización densa explícita, gracias a las convoluciones de Minkowski.
- Extracción de características por punto mediante `forward_features`, que devuelve un vector de 96 dimensiones por punto reutilizable como backbone en tareas posteriores.
- Reemplazo del cabezal de clasificación con `reset_classifier(num_classes=...)` para ajuste fino en otros esquemas de clases o datasets.
- Integración con el pipeline de `torch-pointcloud`: transformaciones de datos, `collate` y gestión de coordenadas de rejilla (`pos_grid`) y batch.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multilingües: no es un modelo de lenguaje.
- No incluye visión 2D, audio ni modo de pensamiento.

## Casos de uso

- Percepción en conducción autónoma: etiquetado semántico de cada retorno LiDAR para alimentar módulos de planificación y predicción de trayectorias; el modelo está entrenado exactamente en el dominio de SemanticKITTI (secuencias de KITTI Odometry), por lo que es adecuado como línea base reproducible.
- Etiquetado automático de datos para anotación: usar las predicciones como preetiquetas en herramientas de anotación 3D, reduciendo el coste humano en la creación de nuevos datasets LiDAR; el mIoU de 69,16 es suficiente para un primer pase con revisión posterior.
- Robótica móvil en exteriores: segmentación de suelo transitable, obstáculos y vegetación en tiempo de ejecución sobre GPU embebida o de escritorio, aprovechando que la convolución dispersa escala con los puntos ocupados y no con el volumen.
- Cartografía y modelado urbano: clasificación de edificios, carreteras y vegetación en levantamientos LiDAR móviles para generar mapas semánticos de alta definición.
- Extracción de características para modelos posteriores: congelar el tronco y usar los vectores de 96 dimensiones por punto como entrada a clasificadores ligeros, detectores o tareas de segmentación con otras taxonomías mediante `reset_classifier`.
- Investigación y reproducibilidad: comparar variantes de arquitectura dispersa (MinkUNet frente a SPVCNN, Cylinder3D, etc.) sobre SemanticKITTI con un checkpoint ya convertido y una API estable.
- Análisis de escenas industriales o mineras: adaptación mediante ajuste fino a nubes de puntos de sensores no automotrices, siempre que se reentrene el cabezal para el nuevo conjunto de clases.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 69,16 |
| SemanticKITTI | OA (accuracy global) | 92,25 |

La información disponible no incluye resultados por clase, comparación con otras arquitecturas ni mediciones de latencia o throughput. No se han publicado en la información proporcionada otros benchmarks (nuScenes, Waymo, etc.).

## Requisitos de hardware

- Inferencia exclusivamente en GPU: los kernels de `spconv` y las convoluciones de Minkowski requieren CUDA; la model card indica explícitamente "GPU-only kernels".
- VRAM estimada: no disponible de forma oficial. Con 37,9 M de parámetros en fp32, los pesos ocupan aproximadamente 150 MB; el consumo real depende del número de puntos por muestra y de los mapas de ocupación intermedios, por lo que conviene presupuestar varios GB para lotes de decenas de miles de puntos.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cualquier GPU NVIDIA con soporte CUDA moderna (RTX 3060 en adelante, A100, H100) debería poder ejecutar el modelo; las GPU de gama alta aportan margen para lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU NVIDIA con al menos 4-8 GB de VRAM para lotes moderados, aunque el dato no está confirmado por el autor.
- Despliegue: `torch-pointcloud` con `spconv` compilado contra la versión de PyTorch y CUDA instaladas. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MinkUNet34-W32 (este) | 37,9 M | x, y, z, intensidad | 19 | 69,16 (declarado) | Apache-2.0 | Hugging Face, torch-pointcloud |
| MinkUNet34 (MMDetection3D) | ~37,9 M | x, y, z, intensidad | 19 | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |
| Otras arquitecturas dispersas (SPVCNN, Cylinder3D) | no disponible | no disponible | 19 | no disponible en esta ficha | variable | variable |

La comparación cuantitativa con alternativas no puede completarse con la información proporcionada: no se dispone de los resultados de los modelos de referencia en las mismas condiciones de entrenamiento y evaluación. El checkpoint de MMDetection3D del que se convirtió este modelo es el pariente más directo y debería producir resultados equivalentes, pero no se ha verificado numéricamente en esta ficha.

## Limitaciones y advertencias

- Dominio restringido: entrenado únicamente en SemanticKITTI (entornos urbanos y de carretera alemanes); el rendimiento puede degradarse en otros sensores, densidades de puntos, climas o escenas interiores.
- Esquema cerrado de 19 clases: cualquier clase fuera de ese conjunto se asignará a una de las existentes; requiere ajuste fino del cabezal para nuevas taxonomías.
- Métricas no verificadas: los valores de mIoU y OA los declara el autor con `verified: false`; no se han reproducido de forma independiente en la información disponible.
- Dependencia de compilación: `spconv` debe compilarse contra la versión exacta de PyTorch y CUDA, lo que complica la reproducibilidad y el despliegue en entornos heterogéneos.
- Solo GPU: no hay ruta de inferencia en CPU documentada, lo que limita el despliegue en dispositivos sin CUDA.
- Sin datos de sesgo ni robustez: la model card no documenta análisis de sesgos por clase, sensibilidad a oclusiones, ni comportamiento con nubes incompletas o ruidosas.
- Riesgo de errores en clases minoritarias: con un mIoU global de 69,16 y una accuracy global de 92,25, la diferencia entre ambas métricas sugiere un desequilibrio de clases notable; clases poco frecuentes (motocicleta, bicicleta, peatón) probablemente tengan IoU bajo.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución, pero conviene revisar las licencias de las dependencias (`spconv`, `torch-pointcloud`) y del dataset original.
- Madurez: el repositorio tiene 19 descargas y 0 likes en el momento de la consulta, sin señales de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-torchsparse-amp.semantickitti.mmdet3d
- Paper de la arquitectura (Minkowski Convolutional Neural Networks): https://arxiv.org/abs/1904.08755
- Repositorio de la librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI de la librería (Zenodo): https://doi.org/10.5281/zenodo.22159632

# torch-pointcloud/spvcnn-47gmacs.semantickitti.mit-han-lab

## Resumen

El modelo `spvcnn-47gmacs.semantickitti.mit-han-lab` es un checkpoint de segmentación semántica de nubes de puntos 3D basado en la arquitectura SPVCNN (Sparse Point-Voxel Convolution), desarrollado por el equipo de torch-pointcloud (PyTorch PointCloud) a partir del trabajo original de MIT Han Lab (SPVNAS). El modelo está entrenado sobre el dataset SemanticKITTI, un referente para la comprensión de escenas LiDAR en entornos de conducción autónoma, y alcanza un mIoU de 61,59 en la partición de evaluación estándar.

La arquitectura combina convoluciones voxel dispersas con operaciones sobre puntos, lo que permite procesar nubes de puntos de gran tamaño (típicamente decenas de miles de puntos por escaneo) de forma eficiente en memoria y cómputo. Con solo 8,8 millones de parámetros, el modelo logra un equilibrio notable entre precisión y coste computacional, siendo adecuado para aplicaciones en tiempo real sobre hardware embebido o GPUs de gama media.

Este checkpoint es relevante porque ofrece un modelo preentrenado, listo para usar mediante la librería `torch-pointcloud`, que simplifica la integración en proyectos de investigación y desarrollo de sistemas de percepción 3D. Su licencia MIT permite uso comercial sin restricciones, y su tamaño reducido lo convierte en una opción atractiva frente a alternativas más pesadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPVCNN (sparse point-voxel convolution) |
| Parametros totales | 8.802.021 (8,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones en la model card) |
| Idiomas soportados | no aplica (modelo de vision 3D, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

SPVCNN es una arquitectura híbrida que combina convoluciones voxel dispersas (sparse voxel convolutions) con operaciones sobre puntos. La idea central, presentada en el paper "Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution" (Tang et al., ECCV 2020), es convertir la nube de puntos en una representación voxel dispersa para aplicar convoluciones 3D eficientes y, posteriormente, devolver las características a los puntos originales mediante una operación de devoxelización. Esto permite capturar contexto local y global con un coste computacional muy inferior al de las convoluciones densas.

El modelo fue entrenado sobre SemanticKITTI, un dataset que contiene secuencias LiDAR de escenarios urbanos y rurales con 19 clases semánticas (vehículos, peatones, edificios, vegetación, etc.). El checkpoint se obtuvo mediante conversión del modelo preentrenado publicado por MIT Han Lab en el repositorio `spvnas`, que utilizó búsqueda de arquitectura neuronal (3D-NAS) para optimizar el diseño de la red bajo una restricción de 47 GMACs (de ahí el nombre del modelo). El entrenamiento original incluyó técnicas de aumento de datos y optimización específicas para datos LiDAR, aunque los detalles exactos del pipeline de entrenamiento no se detallan en la model card.

## Capacidades

- Segmentación semántica de nubes de puntos 3D: asigna una etiqueta de clase a cada punto de la nube (19 clases de SemanticKITTI).
- Extracción de características por punto: mediante `forward_features` o `model.reset_classifier(num_classes=0)` se obtienen embeddings de 61 dimensiones por punto, útiles para tareas downstream como detección de objetos o agrupamiento.
- Procesamiento eficiente de nubes densas: gracias a las convoluciones voxel dispersas, puede manejar escaneos LiDAR completos (miles de puntos) sin agotar memoria.
- Integración con el ecosistema `torch-pointcloud`: compatible con la factoría `create_model`, transforms y utilidades de la librería.
- Requiere kernels CUDA (torchsparse): no funciona en CPU, solo en GPU con soporte CUDA.

## Casos de uso

- Conducción autónoma (percepción LiDAR): el modelo segmenta cada punto del escaneo en clases como vehículo, peatón, carretera o vegetación, proporcionando la entrada para módulos de planificación y evitación de obstáculos. Su bajo coste computacional (47 GMACs) permite ejecutarlo en tiempo real en plataformas embebidas tipo Jetson.
- Robótica móvil y navegación: en entornos interiores o exteriores, la segmentación semántica de nubes de puntos ayuda a distinguir superficies transitables, obstáculos y objetos manipulables, mejorando la toma de decisiones del robot.
- Análisis de escenas urbanas para cartografía: los mapas semánticos 3D generados a partir de secuencias LiDAR son útiles para planificación urbana, gestión de infraestructuras o simulación de conducción.
- Investigación en visión 3D: sirve como modelo base para fine-tuning en otros datasets de nubes de puntos (por ejemplo, nuScenes o Waymo) o como extractor de características para tareas de detección y registro.
- Benchmarking de arquitecturas eficientes: al ser un modelo compacto con resultados publicados, es un punto de referencia para evaluar nuevas arquitecturas de segmentación 3D.
- Sistemas de asistencia al conductor (ADAS): la segmentación en tiempo real de los datos del LiDAR puede alimentar sistemas de aviso de colisión o de mantenimiento de carril.

## Benchmarks y rendimiento

El modelo reporta un mIoU (mean Intersection over Union) de 61,59 en el conjunto de validación de SemanticKITTI (secuencia 08), según el model-index de HuggingFace. El valor de referencia del paper original es 61,4, por lo que el checkpoint es ligeramente superior. No se dispone de otros benchmarks (por ejemplo, precisión por clase o comparativas con otros modelos) en la información proporcionada.

| Dataset | Metrica | Valor |
|---|---|---|
| SemanticKITTI (validacion) | mIoU | 61,59 |

## Requisitos de hardware

- El modelo requiere GPU con soporte CUDA (no funciona en CPU) debido a las extensiones de torchsparse.
- Con 8,8 millones de parámetros, el uso de VRAM es reducido; se estima que puede ejecutarse con menos de 4 GB de VRAM para una nube de 8192 puntos, aunque el valor exacto no está documentado.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 6 GB de VRAM (GTX 1660, RTX 2060, RTX 3060, etc.) para inferencia en tiempo real. Para entrenamiento o fine-tuning, se recomienda una RTX 3080 o superior.
- Compatible con GPUs de gama consumer (RTX 30, RTX 40) siempre que se compile torchsparse con la versión de CUDA adecuada.
- Opciones de despliegue: la librería `torch-pointcloud` ofrece inferencia directa en Python; no hay soporte oficial para vLLM, llama.cpp u otros motores orientados a LLM.
- Latencia: no se proporcionan datos concretos, pero dado el coste de 47 GMACs, la inferencia sobre un escaneo típico (≈ 100k puntos) debería estar en el rango de decenas de milisegundos en una GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. El paper original (Tang et al., 2020) reporta que SPVNAS supera a MinkowskiNet en un 3,3% de mIoU en SemanticKITTI, manteniendo una latencia similar. Sin embargo, no se incluyen métricas detalladas de otros modelos en la model card. Como referencia cualitativa:

| Modelo | Parametros | mIoU (SemanticKITTI) | Licencia |
|---|---|---|---|
| spvcnn-47gmacs (este) | 8,8 M | 61,59 | MIT |
| MinkowskiNet (baseline) | no disponible | ~58 (referencia del paper) | MIT (aprox.) |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos de SemanticKITTI, que provienen de un sensor LiDAR específico (Velodyne HDL-64E) y de entornos urbanos alemanes. Su rendimiento puede degradarse en otros dominios (clima, sensor, país) sin fine-tuning.
- La segmentación puede fallar en clases poco representadas en el dataset (por ejemplo, motocicletas o otros vehículos) debido al desequilibrio de clases.
- No se documentan sesgos específicos, pero es probable que el modelo tenga dificultades con objetos pequeños o parcialmente ocluidos.
- Dependencia de `torchsparse`, que requiere compilación específica para la versión de PyTorch y CUDA. Esto puede dificultar el despliegue en entornos con restricciones de compilación.
- No es un modelo generativo ni de lenguaje; no aplica riesgo de alucinación.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo derivado de SPVNAS debe atribuir correctamente las fuentes (ver citas en la model card).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/spvcnn-47gmacs.semantickitti.mit-han-lab
- Paper original (SPVNAS): https://arxiv.org/abs/2007.16100
- Repositorio SPVNAS (MIT Han Lab): https://github.com/mit-han-lab/spvnas
- Librería torch-pointcloud (GitHub): https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/installation/

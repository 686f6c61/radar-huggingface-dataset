# torch-pointcloud/minkunet18-w16.semantickitti.mit-han-lab

## Resumen

MinkUNet18-W16 es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente una U-Net residual dispersa (sparse residual U-Net) de la familia Minkowski. Lo publica el usuario `torch-pointcloud` en HuggingFace como conversión del checkpoint original de `mit-han-lab/spvnas`, el repositorio de referencia del laboratorio MIT HAN Lab para redes convolucionales dispersas en 4D. Resuelve el problema de asignar una clase semántica a cada punto de una escena LiDAR, con 19 clases de interés sobre el dataset SemanticKITTI.

El modelo es deliberadamente pequeño: 5,44 millones de parámetros totales, 4 canales de entrada (x, y, z, intensidad), 48 características internas y 19 clases de salida. Su interés no está en la escala sino en la eficiencia: al operar con convoluciones dispersas de Minkowski solo sobre vóxeles ocupados, evita el coste de procesar el espacio vacío de una nube de puntos, lo que lo hace viable para percepción 3D en tiempo real sobre GPU.

Es relevante ahora porque el ecosistema de HuggingFace apenas tiene modelos de segmentación de nubes de puntos listos para usar con `transformers`-style API, y esta conversión a la librería `torch-pointcloud` permite cargar el checkpoint con `tp.create_model(..., pretrained=True)` y obtener tanto logits por punto como características de 48 dimensiones para tareas aguas abajo. La licencia MIT y los pesos en safetensors facilitan su integración en pipelines de robótica y conducción autónoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet18-W16 (U-Net residual con convoluciones dispersas de Minkowski) |
| Parametros totales | 5.441.379 (5,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Caracteristicas internas | 48 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (requiere spconv) |

## Arquitectura y entrenamiento

MinkUNet18-W16 es una U-Net residual adaptada a datos dispersos mediante convoluciones de Minkowski, presentadas en el paper "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks" (Choy et al., CVPR 2019). La red opera sobre una rejilla de vóxeles y ejecuta las convoluciones únicamente en las posiciones ocupadas, de modo que el coste computacional escala con el número de puntos y no con el volumen del espacio. El sufijo "W16" indica un ancho de canal base de 16, y "18" hace referencia a la profundidad del backbone de tipo ResNet-18 empleado como encoder dentro del esquema U-Net.

El checkpoint se ha entrenado sobre SemanticKITTI, el dataset de secuencias LiDAR del KITTI Odometry con anotaciones semánticas densas por punto (Behley et al., ICCV 2019). La entrada son 4 canales por punto (coordenadas e intensidad) y la salida son 19 clases. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino específicas; esos datos no están disponibles en la información proporcionada.

La innovación técnica principal reside en el uso de `spconv` como backend de convoluciones dispersas, que requiere una compilación alineada con la versión de PyTorch y CUDA del entorno. El modelo se distribuye como conversión del checkpoint original de `mit-han-lab/spvnas` a la API de `torch-pointcloud`, lo que añade una capa de abstracción para carga, transformación de datos y extracción de características.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR por punto, con 19 clases (vehículo, peatón, ciclista, carretera, acera, edificio, vegetación, etc. según la taxonomía de SemanticKITTI).
- Procesamiento de nubes de puntos dispersas de forma eficiente mediante convoluciones de Minkowski sobre vóxeles ocupados.
- Extracción de características: `forward_features` devuelve un vector de 48 dimensiones por punto, útil para tareas aguas abajo (clustering, detección, retrieval).
- Clasificador configurable: `reset_classifier(num_classes=N)` permite adaptar la cabeza de salida a otro número de clases.
- Entrada multimodal de 4 canales: coordenadas 3D más intensidad de retorno LiDAR.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de pensamiento (thinking), visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto de la nube LiDAR con su clase semántica, lo que permite al vehículo distinguir carretera, acera, vehículos, peatones y vegetación en cada barrido. Con 5,4 M de parámetros es lo bastante ligero para ejecutarse dentro del bucle de percepción a bordo.
- Segmentación en robótica móvil: un robot con LiDAR 3D puede usar el modelo para construir mapas semánticos del entorno y planificar trayectorias evitando zonas no transitables (vegetación, edificios) frente a superficies navegables (carretera, acera).
- Anotación automática de datasets: dado que alcanza un mIoU de 58,9 en SemanticKITTI, puede emplearse como preetiquetador para reducir el coste de anotación manual de nuevas secuencias LiDAR, revisando después las predicciones con herramientas de corrección.
- Extracción de características para modelos aguas abajo: las representaciones de 48 dimensiones por punto sirven como entrada a detectores 3D, modelos de segmentación de instancias o sistemas de place recognition, evitando entrenar un encoder desde cero.
- Control de calidad de mapas HD: comparar la segmentación semántica de barridos LiDAR con la cartografía existente permite detectar cambios en el entorno (obras, nueva vegetación, mobiliario urbano) de forma automatizada.
- Investigación en eficiencia de redes dispersas: el modelo es un baseline pequeño y reproducible para comparar variantes de convoluciones dispersas, poda o cuantización en tareas de segmentación 3D, gracias a su licencia MIT y a su reducido tamaño.
- Procesamiento de secuencias LiDAR en bruto: integrado en un pipeline con `torch-pointcloud` y `spconv`, permite procesar los ficheros `.bin` de KITTI y obtener nubes etiquetadas listas para visualización o análisis estadístico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 58,9 |
| SemanticKITTI | Segmentacion semantica de nubes de puntos | OA (accuracy global) | 91,73 |

No se han publicado en la información disponible resultados desglosados por clase (IoU por categoría), ni comparativas oficiales con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,4 M de parámetros, los pesos en fp32 ocupan aproximadamente 22 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 2 GB de memoria; el consumo real vendrá dominado por el tamaño de la nube de puntos y las estructuras dispersas de `spconv`.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con `spconv` compilado para la versión de PyTorch correspondiente. Una RTX 4090, A100 o H100 ofrecen margen de sobra; una GTX 1660 o RTX 3060 también deberían ser suficientes para inferencia.
- Cabe en GPU de consumo: sí, con requisitos muy bajos de memoria. El cuello de botella es la compilación de `spconv`, no la VRAM.
- El modelo es GPU-only según la model card ("GPU-only kernels"): no se contempla ejecución en CPU.
- Opciones de despliegue: la vía documentada es `torch-pointcloud` con `spconv`; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de nubes de puntos).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet18-W16 (este) | 5,4 M | SemanticKITTI | 58,9 | MIT | HuggingFace (`torch-pointcloud`) |
| MinkUNet18-W32 (variante de mayor ancho) | no disponible | SemanticKITTI | no disponible | MIT (repo original) | `mit-han-lab/spvnas` |
| Cylinder3D / SPVNAS / otros | no disponible | SemanticKITTI | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks de alternativas comparables para establecer una comparativa cuantitativa rigurosa. La comparación más directa es con la variante de mayor ancho de la misma familia (W32), cuyos parámetros y métricas no se detallan en esta ficha.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación semántica de nubes de puntos LiDAR; no genera texto, no razona y no procesa imágenes 2D ni audio.
- El mIoU de 58,9 sobre SemanticKITTI es moderado: en escenas con clases minoritarias (peatones, ciclistas, motocicletas) el rendimiento por clase puede ser bajo, aunque no se publican los IoU desglosados.
- Entrenado únicamente con la taxonomía y las condiciones de captura de SemanticKITTI (LiDAR de KITTI, entorno urbano y de carretera en Alemania); el rendimiento puede degradarse con otros sensores, densidades de puntos o entornos (interiores, minería, agrícola).
- Riesgo de alucinación en el sentido de predicciones erróneas: puntos mal clasificados en zonas ambiguas u ocluidas son inevitables en cualquier segmentador; conviene aplicar umbrales de confianza o post-procesado.
- Requiere `spconv` compilado contra la versión exacta de PyTorch y CUDA del entorno, lo que complica el despliegue reproducible en producción y en contenedores.
- Ejecución solo en GPU: no hay soporte CPU documentado, lo que limita su uso en dispositivos embebidos sin CUDA.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias del dataset SemanticKITTI y del repositorio original `mit-han-lab/spvnas` si se redistribuyen pesos derivados.
- El repositorio tiene 0,0 GB reportados y solo 20 descargas: es un artefacto reciente y poco validado por la comunidad, por lo que la reproducibilidad de las métricas declaradas no está confirmada de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/torch-pointcloud/minkunet18-w16.semantickitti.mit-han-lab
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio original de referencia (spvnas): https://github.com/mit-han-lab/spvnas
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset SemanticKITTI: http://semantic-kitti.org/
- Paper de SemanticKITTI: https://arxiv.org/abs/1904.01416

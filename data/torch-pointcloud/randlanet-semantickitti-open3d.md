# torch-pointcloud/randlanet.semantickitti.open3d

## Resumen

RandLA-Net es una red neuronal para segmentación semántica de nubes de puntos a gran escala, publicada originalmente en CVPR 2020 por investigadores de la Universidad de Oxford y la Universidad de Wuhan. Este repositorio concreto, `torch-pointcloud/randlanet.semantickitti.open3d`, es una conversión de los pesos de Open3D-ML al formato de la librería `torch-pointcloud`, manteniendo la arquitectura original y el entrenamiento sobre el dataset SemanticKITTI. El modelo clasifica cada punto LiDAR en una de 19 clases semánticas (carretera, edificio, vehículo, peatón, vegetación, etc.).

La relevancia de RandLA-Net radica en su eficiencia: frente a aproximaciones que requieren operaciones costosas sobre vecindarios completos, emplea muestreo aleatorio de puntos combinado con agregación local de características, lo que permite procesar nubes de decenas de miles de puntos en una sola pasada. Con solo 1,2 millones de parámetros, es un modelo extremadamente ligero que puede ejecutarse en GPUs de consumo e incluso en tiempo real sobre secuencias LiDAR.

Esta ficha es especialmente relevante para desarrolladores que trabajan en percepción 3D, conducción autónoma o robótica móvil y necesitan un modelo de segmentación semántica de nubes de puntos listo para usar, con licencia permisiva MIT y pesos en formato safetensors. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que produce etiquetas por punto sobre geometría 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandLA-Net (random sampling + local feature aggregation) |
| Parametros totales | 1.250.003 (1,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje; procesa nubes de puntos de tamaño variable, típicamente 8.192 puntos por muestra en el uso de ejemplo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | no aplica (modelo de visión 3D, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas xyz) |
| Numero de clases | 19 (SemanticKITTI) |
| Dimension de caracteristicas | 32 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,0 GB (pesos muy ligeros) |

## Arquitectura y entrenamiento

RandLA-Net es una red neuronal de segmentación semántica de nubes de puntos diseñada para escenas a gran escala. Su innovación principal es el uso de **muestreo aleatorio** (random sampling) en lugar de muestreo por distancia o por densidad, lo que reduce drásticamente el coste computacional al tiempo que preserva la cobertura espacial. Para compensar la pérdida de información que introduce el muestreo aleatorio, la red incorpora un módulo de **agregación local de características** (Local Feature Aggregation) basado en atención espacial y pooling, que captura el contexto local de cada punto de forma jerárquica a lo largo de varias capas de codificación.

El modelo fue entrenado sobre **SemanticKITTI**, un dataset de secuencias LiDAR de escenas de conducción urbana y rural con 19 clases semánticas anotadas. La model card no detalla el número de tokens ni la composición exacta del dataset de entrenamiento más allá de la referencia al dataset. No se menciona uso de RLHF ni DPO (no aplica a este tipo de modelo). Los pesos de este repositorio se han convertido desde la implementación de **Open3D-ML** (licencia MIT) al formato de la librería `torch-pointcloud`, y la model card no indica que se haya realizado un reentrenamiento adicional: se trata de una conversión de pesos.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR en 19 clases (carretera, acera, edificio, vegetación, vehículo, persona, ciclista, etc.).
- Procesamiento de nubes de puntos de tamaño variable, con ejemplo de uso sobre 8.192 puntos por muestra.
- Extracción de características por punto mediante `forward_features` (vector de 32 dimensiones por punto).
- Posibilidad de reemplazar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de características en tareas downstream.
- Entrada de 3 canales (coordenadas xyz); la model card no indica uso de intensidad ni color en la entrada del modelo, aunque el ejemplo de datos incluye el campo `intensity`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo "thinking", visión 2D, audio ni generación de texto.

## Casos de uso

- **Percepción para conducción autónoma**: el modelo segmenta nubes LiDAR de escenas viarias en clases semánticas (carretera, vehículos, peatones, vegetación), lo que permite construir mapas locales de ocupación y alimentar módulos de planificación de trayectorias. Su ligereza (1,2 M de parámetros) lo hace viable en vehículos con GPUs embebidas.
- **Robótica móvil en interiores y exteriores**: un robot equipado con LiDAR puede usar RandLA-Net para distinguir suelo transitable, obstáculos y personas, mejorando la navegación segura en entornos dinámicos.
- **Análisis de escenas urbanas a partir de datos de escaneo**: ayuntamientos y empresas de cartografía pueden procesar nubes de puntos de levantamientos LiDAR para inventariar mobiliario urbano, vegetación y edificios de forma automática.
- **Preprocesado para pipelines de reconstrucción 3D**: la segmentación semántica por punto permite separar clases antes de tareas de reconstrucción de superficie, registro o modelado BIM, reduciendo ruido y mejorando la calidad de la malla.
- **Extracción de características para modelos downstream**: usando `forward_features` o eliminando el clasificador, se obtienen embeddings de 32 dimensiones por punto que pueden alimentar clasificadores ligeros, clustering o modelos de detección de objetos 3D.
- **Investigación en percepción 3D**: al ser una implementación ligera y con licencia MIT, es un baseline adecuado para comparar nuevas arquitecturas de segmentación de nubes de puntos sobre SemanticKITTI sin necesidad de reentrenar desde cero.
- **Prototipado rápido en GPUs de consumo**: con 1,2 M de parámetros y pesos en safetensors de tamaño despreciable, se puede desplegar en una RTX 3060 o incluso en CPU para pruebas de concepto, lo que facilita la validación de ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 54,76 |
| SemanticKITTI | OA (accuracy global) | 90,19 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (por ejemplo, desglose por clase, comparación con otros modelos en el mismo split) ni latencia o throughput medidos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB para una nube de 8.192 puntos en FP32; el modelo tiene 1,2 M de parámetros (unos 5 MB en FP32) y las activaciones dependen del número de puntos de entrada.
- **GPU recomendadas**: cualquier GPU moderna sirve; para entrenamiento o nubes de puntos muy grandes se recomienda una RTX 3090/4090, A100 o H100. Para inferencia en producción embebida, una Jetson Orin o incluso una GTX 1650 son suficientes.
- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU de consumo con al menos 2 GB de VRAM; también es viable en CPU para lotes pequeños.
- **Opciones de despliegue**: la librería `torch-pointcloud` (instalable con `pip install torch-pointcloud`) es la vía oficial; al ser un modelo PyTorch estándar, puede exportarse a TorchScript o ONNX para despliegue con ONNX Runtime o TensorRT.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Dado el reducido número de parámetros, se espera una latencia de milisegundos por muestra en GPU moderna, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU SemanticKITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RandLA-Net (este repo) | 1,2 M | Nube de puntos variable (ej. 8.192 puntos) | 54,76 | MIT | Hugging Face, torch-pointcloud |
| PointNet++ | no disponible en la informacion | Nube de puntos variable | no disponible en la informacion | no disponible en la informacion | Implementaciones multiples |
| KPConv | no disponible en la informacion | Nube de puntos variable | no disponible en la informacion | no disponible en la informacion | Implementaciones multiples |
| Cylinder3D | no disponible en la informacion | Voxelizacion cilindrica | no disponible en la informacion | no disponible en la informacion | Codigo publico |

No se dispone en la informacion proporcionada de datos verificados de parametros, contexto o rendimiento de los modelos alternativos sobre SemanticKITTI, por lo que la comparativa cuantitativa no puede completarse con rigor. RandLA-Net destaca por su bajo numero de parametros y su licencia MIT, que facilita el uso comercial.

## Limitaciones y advertencias

- **Sesgos del dataset**: entrenado exclusivamente sobre SemanticKITTI (escenas de conduccion en Alemania), por lo que puede generalizar mal a otros entornos (interiores, industria, otros paises) o a sensores LiDAR con caracteristicas distintas.
- **Riesgo de error en clases minoritarias**: la mIoU de 54,76 sobre 19 clases indica un rendimiento desigual; clases poco representadas (por ejemplo, motoristas o personas) suelen tener IoU bajo, lo que puede provocar confusiones peligrosas en aplicaciones de seguridad.
- **Alucinacion en sentido figurado**: el modelo puede asignar etiquetas erroneas a puntos atipicos u oclusiones; no hay mecanismo de abstención ni de confianza calibrada por punto en la informacion disponible.
- **Dependencia de la entrada**: espera coordenadas xyz; la model card no especifica el uso de intensidad ni color en la entrada del modelo, aunque el ejemplo de datos los incluye. Cambiar el numero de puntos o el preprocesado puede degradar el rendimiento.
- **Limitaciones de idioma**: no aplica, pero conviene subrayar que no procesa lenguaje natural ni texto.
- **Licencia MIT**: permisiva para uso comercial, pero se recomienda conservar la atribucion al autor original y revisar las licencias del dataset SemanticKITTI, que puede tener restricciones propias para uso comercial.
- **Resultados no verificados**: las metricas de la model card estan marcadas como `verified: false`; conviene reproducirlas en el propio pipeline antes de usarlas como referencia en produccion.
- **Conversion de pesos**: al tratarse de una conversion desde Open3D-ML, posibles diferencias en el preprocesado entre ambas implementaciones podrian afectar a los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/randlanet.semantickitti.open3d
- Paper RandLA-Net (arXiv): https://arxiv.org/abs/1911.11236
- Repositorio Open3D-ML (origen de los pesos): https://github.com/isl-org/Open3D-ML
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SemanticKITTI: http://semantic-kitti.org/

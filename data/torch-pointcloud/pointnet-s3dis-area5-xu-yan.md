# torch-pointcloud/pointnet.s3dis-area5.xu-yan

## Resumen

PointNet es un modelo de segmentación semántica de nubes de puntos 3D, concretamente la implementación publicada por el proyecto torch-pointcloud bajo el identificador `pointnet.s3dis-area5.xu-yan`. No es un modelo de lenguaje: procesa conjuntos de puntos (coordenadas XYZ más color RGB) y asigna una etiqueta semántica a cada punto, con 13 clases de interior. Está entrenado sobre el dataset S3DIS, evaluado en el área 5, y es una conversión de la implementación de referencia de yanx27 (`Pointnet_Pointnet2_pytorch`) al formato de la librería torch-pointcloud.

El modelo es relevante como pieza de referencia y línea base reproducible: PointNet (Qi et al., CVPR 2017) es el trabajo fundacional que demostró que una red puede consumir nubes de puntos sin voxelización previa, usando transformaciones de entrada y de características junto con una agregación simétrica (max pooling) para lograr invariancia a permutaciones. Con solo 3,5 millones de parámetros y pesos en safetensors, es un candidato práctico para prototipado, docencia y comparaciones frente a arquitecturas posteriores (PointNet++, KPConv, Point Transformer).

La ficha describe un checkpoint de segmentación por punto, no un modelo generativo: no hay contexto de tokens, ni idiomas, ni tool calling. La licencia MIT y el tamaño reducido del repositorio facilitan su integración en pipelines de PyTorch existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet (MLP compartida por punto con transformaciones de entrada y de características, agregación por max pooling) |
| Parametros totales | 3.541.718 (3,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada de nube de puntos, el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no aplica; tarea de visión 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (XYZ + RGB) |
| Clases de salida | 13 (segmentación semántica S3DIS) |
| Dimensión de características | 1088 |
| Dataset de entrenamiento/evaluación | S3DIS, área 5 como test |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

PointNet aplica una MLP compartida de forma independiente a cada punto, precedida por una red T-Net que predice una transformación afín 3x3 sobre las coordenadas de entrada y otra de 64x64 sobre las características intermedias, con el objetivo de alcanzar invariancia a transformaciones rígidas. La agregación global se realiza mediante max pooling simétrico, lo que garantiza invariancia al orden de los puntos. La cabeza de segmentación concatena la característica global con las características por punto y produce logits por clase para cada punto. La entrada declarada tiene 6 canales (posición y color) y la salida cubre 13 clases de interior.

El checkpoint se ha entrenado sobre S3DIS (Stanford 3D Indoor Spaces), un dataset de habitaciones de interior escaneadas con 13 categorías semánticas, y se evalúa sobre el área 5, el protocolo estándar de generalización de habitación no vista del benchmark. La model card no detalla el número de épocas, la composición exacta de aumentos de datos ni si se aplicó algún esquema de regularización adicional; esos datos figuran como no disponibles. El modelo se distribuye como conversión de los pesos de yanx27/Pointnet_Pointnet2_pytorch a la interfaz de torch-pointcloud, que expone `create_model`, `forward_features` y `reset_classifier`.

## Capacidades

- Segmentación semántica por punto: asigna una de 13 clases a cada punto de una nube de puntos de interior.
- Consumo directo de nubes de puntos sin voxelización: entrada como tensor de posiciones, colores y vector de batch.
- Extracción de características: `forward_features` devuelve descriptores de 1088 dimensiones por punto, reutilizables para tareas aguas abajo.
- Clasificación por punto con cabeza sustituible: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro.
- Invariancia a permutaciones y, por diseño, robustez parcial a transformaciones rígidas mediante las T-Net.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión 2D, audio ni capacidades multilingües.

## Casos de uso

- Segmentación de escenas de interior para robótica móvil: el modelo etiqueta suelo, paredes, sillas o mesas en una nube de puntos capturada por LiDAR o RGB-D, proporcionando un mapa semántico por punto que un planificador puede consumir para navegación.
- Línea base reproducible en investigación: con 3,5 M de parámetros y licencia MIT, sirve como referencia inferior para comparar PointNet++, KPConv o Point Transformer en el mismo protocolo S3DIS área 5.
- Docencia y prototipado rápido: la API de torch-pointcloud (`create_model`, `collate`, `forward_features`) permite montar un pipeline completo de segmentación en pocas líneas.
- Preetiquetado asistido de datos 3D: usar el modelo para generar etiquetas iniciales sobre nuevas nubes de puntos y revisarlas manualmente, reduciendo el coste de anotación en proyectos de interior.
- Extracción de descriptores para búsqueda o clustering: los vectores de 1088 dimensiones por punto pueden alimentar un índice de similitud o un agrupamiento no supervisado de regiones.
- Verificación de pipelines de conversión de pesos: útil como caso de prueba para validar la integración de safetensors y la interfaz de torch-pointcloud antes de migrar modelos mayores.
- Detección de mobiliario en escaneos de edificios: clasificación por punto para inventariado de elementos en levantamientos 3D de interiores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`) sobre S3DIS, área 5:

| Metrica | Valor |
|---|---|
| mIoU | 43,88 |
| OA (accuracy global) | 79,39 |

No se han publicado en la información disponible resultados adicionales (por clase, por categoría o frente a otros modelos) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 3,5 M de parámetros los pesos ocupan del orden de 14 MB en FP32 y 7 MB en FP16. El consumo dominante es la nube de puntos de entrada y las activaciones intermedias, no los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para nubes de puntos de tamaño moderado.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2-4 GB de VRAM disponible para el batch completo, dependiendo del número de puntos por muestra.
- Opciones de despliegue: PyTorch nativo con la librería torch-pointcloud; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU S3DIS (área 5) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnet.s3dis-area5.xu-yan | 3,5 M | nube de puntos, 6 canales | 43,88 (declarado, no verificado) | MIT | HuggingFace, torch-pointcloud |
| PointNet++ (referencia yanx27) | no disponible en la información | nube de puntos | no disponible en la información | MIT (repo de origen) | GitHub |
| KPConv | no disponible en la información | nube de puntos | no disponible en la información | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación cuantitativa queda limitada al resultado declarado del propio checkpoint.

## Limitaciones y advertencias

- Los resultados de mIoU y OA están marcados como no verificados en la model card; deben tomarse como referencia del autor, no como cifra auditada.
- PointNet es una arquitectura de 2017; su precisión por punto es inferior a la de métodos posteriores (PointNet++, KPConv, Point Transformer) en el mismo benchmark.
- El modelo está entrenado exclusivamente en interiores S3DIS con 13 clases; no generaliza a exteriores, vehículos autónomos ni otras taxonomías sin reentrenamiento.
- Espera un esquema de entrada concreto (posición, color, `norm_pos`) y un transformador específico de la librería; usarlo fuera de torch-pointcloud requiere replicar ese preprocesado.
- No hay información sobre sesgos del dataset ni sobre el impacto de la iluminación o del sensor de captura en las predicciones.
- La licencia MIT permite uso comercial, pero la atribución a los trabajos originales (PointNet y S3DIS) es recomendable en publicaciones y productos derivados.
- No apto para tareas de lenguaje, razonamiento, código, visión 2D o agentes; cualquier uso en esos dominios queda fuera de su ámbito.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointnet.s3dis-area5.xu-yan
- Paper PointNet: https://arxiv.org/abs/1612.00593
- Repositorio de origen de los pesos: https://github.com/yanx27/Pointnet_Pointnet2_pytorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632

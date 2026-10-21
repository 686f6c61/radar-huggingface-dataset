# torch-pointcloud/pointpillars-multihead.nuscenes.openpcdet

## Resumen

PointPillars multihead es un modelo de detección de objetos 3D sobre nubes de puntos LiDAR, publicado en HuggingFace por el proyecto torch-pointcloud (Arthur Dujardin) como conversión de un checkpoint de OpenPCDet entrenado sobre el dataset nuScenes. Implementa la arquitectura PointPillars presentada en CVPR 2019: la nube de puntos se organiza en "pilares" verticales, se codifica con un encoder tipo PointNet y se procesa con un backbone 2D que alimenta varias cabezas de detección (de ahí el sufijo "multihead"). El resultado son cajas 3D con clase, centro, dimensiones y orientación para 10 clases de nuScenes.

El modelo es deliberadamente pequeño: 6.089.398 parámetros, 5 canales de entrada (posición XYZ, intensidad y timestamp) y 384 características por pilar. Ese tamaño lo sitúa en la gama de detectores 3D ligeros aptos para inferencia en tiempo real sobre hardware modesto, en contraste con detectores basados en voxels dispersos o transformers que multiplican el coste computacional.

Su relevancia actual es doble: por un lado sirve como baseline reproducible y rápido para investigación en detección 3D; por otro, la conversión a la librería torch-pointcloud facilita integrarlo en pipelines de PyTorch con una API de alto nivel (`tp.create_model`) sin depender del ecosistema completo de OpenPCDet. El autor declara mAP 44,34 y NDS 57,08 en el split de validación de nuScenes, métricas no verificadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PointPillars: encoder de pilares tipo PointNet + backbone 2D + cabezas de detección múltiples (multihead) |
| Parámetros totales | 6.089.398 (6,1 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de detección 3D sobre nubes de puntos, no generativo) |
| Tipos de cuantización | no disponible (el autor solo publica pesos safetensors; no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |
| Tarea | 3d-object-detection (pipeline `object-detection`) |
| Dataset de entrenamiento | nuScenes |
| Canales de entrada | 5 (posición XYZ, intensidad, timestamp) |
| Clases de salida | 10 |
| Dimensiones de características | 384 |
| Puntos por muestra en el ejemplo de la model card | 8192 |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-08-28 / 2026-10-20 |

## Arquitectura y entrenamiento

PointPillars evita la voxelización 3D completa: proyecta la nube de puntos en una rejilla de pilares sobre el plano XY, agrega los puntos de cada pilar y aprende una representación mediante una capa tipo PointNet (un MLP compartido más un max-pooling). Esa representación se dispersa en un tensor pseudo-imagen 2D que se procesa con un backbone convolucional 2D estándar, lo que permite reutilizar operaciones densas muy optimizadas en GPU. Sobre el mapa de características resultante (384 canales según la model card) se aplican las cabezas de detección, que en esta variante "multihead" se organizan de forma separada, presumiblemente por clase o por atributo de la caja.

El checkpoint procede de OpenPCDet (Apache-2.0) y ha sido convertido al formato de torch-pointcloud; no se documentan en la model card ni el número de tokens/puntos de entrenamiento, ni el calendario de learning rate, ni las augmentaciones, ni si hubo fases de refinamiento posteriores. Tampoco se especifica si la entrada admite barridos múltiples (sweeps) concatenados o una sola nube por muestra, aunque el canal de timestamp sugiere que el pipeline de datos contempla información temporal relativa. La innovación técnica relevante es la eficiencia: al sustituir convoluciones 3D o atención sobre vecindarios por un backbone 2D, el coste de inferencia cae en órdenes de magnitud respecto a detectores de voxels dispersos.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR con cajas orientadas (clase, centro, dimensiones y ángulo de guiñada) sobre 10 clases de nuScenes.
- Codificación de nubes de puntos mediante pilares, con soporte de posición, intensidad y timestamp como canales de entrada.
- Extracción de características intermedias mediante `model.forward_features(...)`, que devuelve 384 canales por pilar rellenado; útil para tareas posteriores (tracking, clasificación de escenas, segmentación aguas abajo).
- Procesamiento por lotes: la API recibe `voxel`, `pos_voxel`, `voxel_num_points` y `batch`, por lo que admite batches de tamaño variable con el `collate` de la librería.
- Integración nativa con PyTorch mediante `torch-pointcloud`, con transformación de datos incluida en el objeto `info` devuelto por `create_model`.
- No soporta tool calling ni function calling (no aplica).
- No soporta agentes ni razonamiento multi-paso (no aplica).
- No tiene capacidades multilingües, de visión 2D, audio ni modo "thinking" (no aplica).
- No se documentan capacidades de detección multi-sensor ni fusión cámara-LiDAR.

## Casos de uso

- Percepción en vehículos autónomos y ADAS: el modelo entrega cajas 3D de vehículos, peatones y ciclistas a partir del LiDAR, con un coste computacional que permite integrarlo en el bucle de percepción a decenas de hercios; su licencia Apache-2.0 facilita prototipos comerciales.
- Robótica móvil en almacenes e interiores: con 6,1 M de parámetros puede ejecutarse en la CPU o en una GPU embebida del propio robot (Jetson Orin, por ejemplo) para detectar obstáculos y personas, algo inviable con detectores 3D de gran tamaño.
- Pre-etiquetado de datasets de nubes de puntos: usar el modelo para generar cajas candidatas sobre datos nuevos y reducir el trabajo de anotación manual, que es el cuello de botella típico en proyectos LiDAR.
- Detección de obstáculos en maquinaria industrial y agrícola: sobre LiDAR 3D montado en tractores o vehículos de obra, el modelo identifica personas y vehículos en el entorno de trabajo para sistemas de parada de emergencia.
- Análisis de tráfico e infraestructura urbana: con LiDAR fijo en intersecciones, el detector extrae trayectorias de objetos 3D para estudios de movilidad, conteo de vehículos y detección de incidentes.
- Baseline de investigación y ablaciones: su simplicidad y su tamaño permiten entrenar y evaluar variantes en pocas GPU-horas, sirviendo de referencia frente a arquitecturas de voxels dispersos o basadas en atención.
- Extracción de características para modelos downstream: `forward_features` proporciona embeddings de 384 canales que se pueden conectar a cabezas de tracking multi-objeto o de clasificación de escenas.
- Validación de pipelines de datos LiDAR: al estar empaquetado con su propio `transform` y `collate`, sirve para comprobar de extremo a extremo la cadena de voxelización antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; el campo `verified` es `false` en la model-index).

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| nuScenes | 3d-object-detection | mAP | 44,34 |
| nuScenes | 3d-object-detection | NDS | 57,08 |

No se han publicado en la información disponible otros resultados (por clase, por rango de distancia, Latency, ni comparaciones controladas con el checkpoint original de OpenPCDet), ni se especifica si las métricas corresponden al split de validación o al de test.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 24 MB en fp32 y 12 MB en fp16, calculado a partir de los 6.089.398 parámetros.
- VRAM estimada: no disponible de forma oficial; el peso de los parámetros es despreciable y el consumo real lo dominan las activaciones del backbone 2D, que dependen del número de pilares no vacíos y del tamaño del batch. En configuraciones típicas de inferencia cabe holgadamente en cualquier GPU consumer con 4-8 GB (GTX 1650, RTX 3050, RTX 3060, RTX 4090).
- GPU recomendadas: no requiere A100 ni H100; una RTX 3090/4090 o una L4 es más que suficiente para inferencia por lotes. Para entrenamiento desde cero, una única GPU de 16-24 GB es adecuada por el tamaño del modelo, aunque el coste lo marca el volumen del dataset.
- Cabe en GPU consumer: sí, con margen amplio. También es viable la inferencia en CPU para batches pequeños, aunque la latencia no está documentada.
- Opciones de despliegue: PyTorch + `torch-pointcloud` es la vía soportada oficialmente (ejemplo de la model card). No se documentan exportaciones a TorchScript, ONNX o TensorRT. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de FPS ni de tiempo por muestra.

## Comparativa con modelos similares

| Modelo | Familia | Parámetros | Entrada | Licencia | Disponibilidad | mAP / NDS en nuScenes |
|---|---|---|---|---|---|---|
| pointpillars-multihead.nuscenes.openpcdet | PointPillars (encoder de pilares + backbone 2D) | 6,1 M | LiDAR, 5 canales | Apache-2.0 | HuggingFace, vía torch-pointcloud | 44,34 / 57,08 (declarados por el autor) |
| PointPillars original (OpenPCDet) | PointPillars | no disponible en la información proporcionada | LiDAR | Apache-2.0 | Repositorio OpenPCDet | no disponible |
| SECOND (OpenPCDet) | Voxels dispersos + sparse CNN | no disponible | LiDAR | Apache-2.0 | Repositorio OpenPCDet | no disponible |
| CenterPoint (OpenPCDet) | Detección 3D basada en centroides, ancla libre | no disponible | LiDAR (y variante con fusión de cámara) | Apache-2.0 | Repositorio OpenPCDet | no disponible |
| PV-RCNN (OpenPCDet) | Voxels + puntos clave | no disponible | LiDAR | Apache-2.0 | Repositorio OpenPCDet | no disponible |

La comparación cuantitativa con esas alternativas no está disponible en la información proporcionada; solo se constata que este checkpoint es la variante más ligera y la única empaquetada para `torch-pointcloud` entre las listadas, frente a propuestas de mayor coste computacional que suelen obtener mejor mAP a costa de VRAM y latencia.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con nuScenes (LiDAR de 32 haces, entorno urbano de Boston y Singapur) y con su taxonomía de 10 clases; el rendimiento caerá con otros sensores, densidades de puntos, alturas de montaje o clases no contempladas.
- Cajas 3D aproximadas: la discretización en pilares pierde resolución vertical, lo que penaliza objetos pequeños o parcialmente ocluidos (peatones lejanos, señales, conos) frente a detectores basados en voxels.
- Falsos positivos y negativos: aunque no es un modelo generativo y no "alucina" texto, sí produce detecciones espurias y confianzas mal calibradas; no debe usarse como única fuente de verdad en sistemas de seguridad.
- Métricas no verificadas: mAP 44,34 y NDS 57,08 son cifras declaradas por el autor, sin validación independiente ni detalle del protocolo de evaluación (clase, umbrales, distancia).
- Reproducibilidad limitada: no se documentan hiperparámetros de entrenamiento, augmentaciones ni el commit exacto de OpenPCDet del que procede la conversión, por lo que reentrenar y replicar el resultado no está garantizado.
- Ausencia de tracción: 0 descargas, 0 likes y un repositorio de 0.0 GB en el momento de la consulta; no hay evidencia de uso en producción ni incidencias reportadas que permitan juzgar su robustez.
- Licencia de los pesos: Apache-2.0, permisiva para uso comercial y modificación, con obligación de conservar avisos. No obstante, el dataset nuScenes tiene sus propias condiciones de uso que conviene revisar antes de explotar comercialmente un modelo derivado.
- Sin soporte de texto, idiomas ni otras modalidades: cualquier expectativa de uso como modelo conversacional o multimodal no está cubierta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/pointpillars-multihead.nuscenes.openpcdet
- Paper de PointPillars (CVPR 2019): https://arxiv.org/abs/1812.05784
- Repositorio OpenPCDet (origen del checkpoint): https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Referencia del software PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
- PyTorch (dependencia de ejecución): https://pytorch.org/
- Los resultados de búsqueda web disponibles no aportaron enlaces adicionales relevantes sobre este modelo concreto; el resto de coincidencias correspondían a páginas generales sobre PyTorch y Torch que no documentan el checkpoint.

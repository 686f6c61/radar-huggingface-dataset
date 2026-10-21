# torch-pointcloud/randlanet.toronto3d.open3d

## Resumen

RandLA-Net aplicado a Toronto-3D (`torch-pointcloud/randlanet.toronto3d.open3d`) es un modelo de segmentación semántica de nubes de puntos 3D, no un modelo de lenguaje. Lo publica el proyecto torch-pointcloud, una biblioteca PyTorch para tareas de nubes de puntos, y consiste en una conversión de los pesos de referencia de Open3D-ML (licencia MIT) al formato safetensors para su uso directo desde esa librería.

El modelo resuelve la asignación de una clase semántica a cada punto de una escena LiDAR urbana, con 8 clases definidas por el dataset Toronto-3D y 6 canales de entrada. Su interés práctico está en que RandLA-Net está diseñado específicamente para escenas grandes: sustituye el muestreo por puntos más lejanos (FPS) por muestreo aleatorio, lo que reduce el coste computacional y de memoria frente a arquitecturas anteriores de procesamiento de nubes de puntos.

Con 5.010.816 parámetros (aproximadamente 5,0 M) y un peso en FP32 de unos 20 MB, es un modelo muy ligero que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU. Declara un mIoU de 73,88 y una exactitud global (OA) de 95,85 sobre Toronto-3D, métricas no verificadas por un tercero según el `model-index`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RandLA-Net (muestreo aleatorio de puntos + agregación local de características, encoder-decoder con conexiones skip) |
| Parámetros totales | 5.010.816 (≈5,0 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una nube de puntos (el ejemplo de la model card usa 8192 puntos por muestra) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 |
| Clases de salida | 8 |
| Dimensión de características internas | 32 |
| Dataset de entrenamiento | Toronto-3D |
| Librería | torch-pointcloud (PyTorch) |

## Arquitectura y entrenamiento

RandLA-Net es una red de segmentación semántica de nubes de puntos descrita en el artículo «RandLA-Net: Efficient Semantic Segmentation of Large-Scale Point Clouds» (Hu et al., CVPR 2020). Su bloque diferencial es el muestreo aleatorio de puntos en lugar del muestreo por puntos más lejanos (FPS) empleado por arquitecturas previas: el muestreo aleatorio tiene coste constante por punto y permite procesar escenas de gran escala con memoria acotada. Sobre esa base, la red aplica módulos de agregación local de características (codificación de geometría local y pooling con atención) en una estructura encoder-decoder con conexiones skip para recuperar resolución en la predicción por punto.

La model card únicamente especifica el dataset de entrenamiento (Toronto-3D, dataset LiDAR móvil de vías urbanas, CVPR Workshops 2020), el número de canales de entrada (6), las 8 clases y la dimensión de características (32). No se documentan el número de tokens/puntos de entrenamiento, la composición exacta del dataset, el esquema de aumento de datos, los hiperparámetros de optimización ni si hubo etapas de refinamiento posteriores. Tampoco se detalla la composición de los 6 canales de entrada: la muestra de código de la model card maneja posiciones (3), color (3), intensidad (1) y `gps_time` (1), pero no aclara cuáles de ellos consume finalmente la red.

El modelo se distribuye como conversión de Open3D-ML, lo que implica que reproduce la configuración y los pesos de esa implementación de referencia en lugar de un reentrenamiento propio.

## Capacidades

- Segmentación semántica por punto sobre nubes de puntos 3D, con 8 clases de salida orientadas a escenas viarias urbanas.
- Procesamiento de nubes de puntos de gran tamaño mediante muestreo aleatorio, con coste de memoria que no crece de forma cuadrática con el número de puntos.
- Entrada multimodal a nivel de punto: la model card indica 6 canales, con posiciones, color, intensidad y tiempo GPS presentes en el pipeline de datos de ejemplo.
- Extracción de características: expone `forward_features` y `reset_classifier(num_classes=0)` para obtener descriptores de 32 dimensiones por punto, reutilizables en tareas posteriores (clustering, clasificación de escena, fine-tuning).
- Fine-tuning sobre otros datasets de nubes de puntos mediante la API de torch-pointcloud (`create_model` con pesos preentrenados).
- Ejecución en GPU y CPU con PyTorch en modo evaluación (`model.eval()`), integrable en pipelines de inferencia por lotes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni generación de texto, código, matemáticas, visión 2D o audio. No dispone de modo «thinking» ni de capacidades multilingües.

## Casos de uso

- **Inventario de mobiliario y señalización urbana**: clasificar cada punto de un levantamiento LiDAR móvil para separar calzada, marcas viales, edificios, postes y vehículos, generando un inventario georreferenciado automatizado a partir de un recorrido de captura.
- **Generación y mantenimiento de mapas HD**: la segmentación por punto alimenta la capa semántica de mapas de carretera (superficie transitable frente a elementos verticales), un paso previo habitual en pipelines de cartografía para conducción asistida.
- **Preetiquetado para anotación humana**: usar las predicciones como etiquetas iniciales en una herramienta de anotación reduce el coste de crear nuevos datasets; con un OA declarado de 95,85 el volumen de corrección manual es acotado, aunque requiere revisión en clases minoritarias.
- **Análisis de vegetación y riesgo en vía**: identificar los puntos clasificados como vegetación próximos a la calzada para planificar poda o detectar invasiones de gálibo en corredores viarios.
- **Extracción de descriptores para búsqueda y clustering de escenas**: obtener vectores de 32 dimensiones por punto (o agregados por región) para agrupar tramos de vía similares, detectar anomalías o indexar levantamientos en un catálogo consultable.
- **Control de calidad de capturas LiDAR**: comparar la distribución de clases predicha con la esperada en un tramo conocido para detectar caídas de calibración, pérdida de retorno de intensidad o degradación del sensor.
- **Prototipado e investigación en segmentación 3D**: su tamaño (5 M de parámetros, ~20 MB en FP32) permite iterar en una sola GPU de consumo, servir como baseline en comparativas o como modelo de referencia para destilación hacia variantes más pequeñas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), no verificados de forma independiente (`verified: false`):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| Toronto-3D | Segmentación semántica de nubes de puntos | mIoU | 73,88 |
| Toronto-3D | Segmentación semántica de nubes de puntos | OA (exactitud global) | 95,85 |

La información proporcionada no incluye resultados por clase, matrices de confusión ni comparaciones con otros modelos sobre el mismo dataset. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Tamaño de pesos**: 5.010.816 parámetros; en FP32 ≈ 20,0 MB (5.010.816 × 4 bytes) y en FP16 ≈ 10,0 MB. El repo de HuggingFace ocupa 0,0 GB según la plataforma.
- **VRAM estimada**: el consumo está dominado por el número de puntos por muestra, no por los pesos. Con el ejemplo de la model card (8192 puntos) el modelo y las activaciones caben holgadamente en menos de 1 GB; para nubes de millones de puntos la memoria crece con el tamaño del lote y el número de puntos muestreados. No hay cifras oficiales publicadas.
- **GPU recomendadas**: cualquier GPU con 4 GB o más es suficiente para inferencia por lotes pequeños (GTX 1650, RTX 3050/3060, RTX 4090). Para procesar levantamientos completos por teselas en paralelo, una A100 o H100 permiten mayor paralelismo de lotes, aunque el modelo no las requiere.
- **CPU**: viable para inferencia puntual o por lotes reducidos, al ser un modelo de 5 M de parámetros.
- **Opciones de despliegue**: PyTorch con la librería `torch-pointcloud` (`pip install torch-pointcloud`), que envuelve la carga de pesos, el transform de datos y el `collate`. No hay soporte documentado en vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de modelo. La exportación a ONNX o TorchScript no está documentada en la información disponible.
- **Latencia y throughput**: no disponibles. Dependen del número de puntos, del tamaño de lote y del hardware; no se publican mediciones.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros modelos de segmentación de nubes de puntos, por lo que la comparación cuantitativa no está disponible. A continuación se recoge lo que sí puede afirmarse con la documentación consultada:

| Modelo | Enfoque de muestreo | Parámetros | mIoU en Toronto-3D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| randlanet.toronto3d.open3d (este) | Aleatorio | 5,0 M | 73,88 (no verificado) | MIT | HuggingFace + torch-pointcloud |
| RandLA-Net original (Open3D-ML) | Aleatorio | no disponible | no disponible | MIT | GitHub (isl-org/Open3D-ML) |
| Otras variantes de RandLA-Net en torch-pointcloud | Aleatorio | no disponible | no disponible | no disponible | no disponible en la información |
| PointNet++ / KPConv / Cylinder3D | FPS / convolución de kernel puntual / proyección cilíndrica | no disponible | no disponible | no disponible | no disponible |

La única comparación defendible con los datos disponibles es que este checkpoint es una conversión de la implementación de Open3D-ML, por lo que debería reproducir su comportamiento, y que frente a arquitecturas basadas en FPS su ventaja declarada en el artículo original es la eficiencia en escenas de gran escala.

## Limitaciones y advertencias

- **Dominio restringido**: entrenado exclusivamente con Toronto-3D, un dataset LiDAR móvil de vías urbanas de Toronto. La generalización a otras ciudades, sensores, densidades de puntos o entornos interiores/semiurbanos no está evaluada y es esperable una degradación del rendimiento.
- **Métricas no verificadas**: mIoU 73,88 y OA 95,85 figuran con `verified: false` en el `model-index`; proceden del autor y no se acompañan de script de evaluación ni de resultados por clase. La OA alta puede enmascarar un rendimiento pobre en clases minoritarias.
- **Adopción nula**: 0 descargas y 0 likes en el momento de la consulta, con creación en octubre de 2026. No hay evidencia de uso en producción ni informes independientes de terceros.
- **Documentación de entrenamiento incompleta**: no se detallan hiperparámetros, composición exacta de los 6 canales de entrada, aumentos de datos ni partición train/val/test empleada, lo que limita la reproducibilidad.
- **Sin cuantizaciones publicadas**: solo hay pesos en safetensors; no se ofrecen versiones INT8, FP16 o formatos para inferencia en dispositivos de borde, y no se documenta compatibilidad con ONNX, TensorRT o TorchScript.
- **Confusión entre clases próximas**: es esperable cierta confusión entre superficies con límites difusos (por ejemplo, calzada frente a marcas viales), habitual en segmentación viaria; no se aportan métricas por clase para cuantificarlo.
- **Dependencia del pipeline de datos**: el rendimiento depende fuertemente del `transform` y del `collate` de torch-pointcloud y de la presencia de color, intensidad y tiempo GPS; alimentar el modelo sin alguno de esos canales puede alterar los resultados.
- **Licencia**: los pesos se distribuyen bajo MIT, lo que permite uso comercial y modificación. Conviene revisar por separado los términos del dataset Toronto-3D y del código de Open3D-ML, no detallados en la información disponible.
- **No es un modelo generativo**: no admite instrucciones en lenguaje natural, no razona en varios pasos y no puede usarse como asistente conversacional ni para generación de código.

## Enlaces

- [Modelo en HuggingFace: torch-pointcloud/randlanet.toronto3d.open3d](https://huggingface.co/torch-pointcloud/randlanet.toronto3d.open3d)
- [Paper de RandLA-Net (arXiv:1911.11236)](https://arxiv.org/abs/1911.11236)
- [Open3D-ML (origen de la conversión, MIT)](https://github.com/isl-org/Open3D-ML)
- [PyTorch PointCloud, librería torch-pointcloud](https://github.com/arthurdjn/pytorch-pointcloud)
- [DOI de PyTorch PointCloud (Zenodo): 10.5281/zenodo.22159632](https://doi.org/10.5281/zenodo.22159632)
- [PyTorch (framework base)](https://pytorch.org/)
- Referencia del dataset: Tan et al., «Toronto-3D: A Large-scale Mobile LiDAR Dataset for Semantic Segmentation of Urban Roadways», CVPR Workshops 2020 (citado en la model card, sin URL directa en la información disponible).

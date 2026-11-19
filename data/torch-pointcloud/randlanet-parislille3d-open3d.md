# torch-pointcloud/randlanet.parislille3d.open3d

## Resumen

RandLA-Net es una red neuronal para segmentación semántica de nubes de puntos a gran escala. Este checkpoint concreto, publicado por el autor `torch-pointcloud`, contiene los pesos del modelo entrenado sobre el dataset urbano Paris-Lille-3D y convertidos desde Open3D-ML a la librería PyTorch PointCloud. El modelo resuelve el problema de asignar una etiqueta semántica (por ejemplo, suelo, edificio, vehículo o vegetación) a cada punto de una nube de puntos LiDAR capturada en entorno urbano.

La arquitectura RandLA-Net, presentada en el paper CVPR 2020 de Hu et al., sustituye las operaciones costosas de búsqueda de vecinos y agrupación jerárquica por un muestreo aleatorio simple combinado con un módulo de agregación de características locales (Local Feature Aggregation). Esto permite procesar nubes de puntos de millones de puntos en una sola pasada, algo que arquitecturas previas basadas en vecinos más cercanos no podían hacer de forma eficiente.

El modelo es relevante para desarrolladores que trabajan en percepción 3D, cartografía, conducción autónoma o gemelos digitales urbanos, porque ofrece un checkpoint compacto (5 millones de parámetros, pesos en safetensors) con métricas publicadas sobre un benchmark público y una licencia MIT permisiva. No es un modelo de lenguaje: es un modelo puramente geométrico y visual 3D, sin capacidades de texto ni de visión 2D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandLA-Net (muestreo aleatorio + agregación de características locales) |
| Parametros totales | 5.010.825 (5,0 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo 3D, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas XYZ) |
| Clases de salida | 9 |
| Dimensión de features | 32 |
| Dataset de entrenamiento | Paris-Lille-3D |

## Arquitectura y entrenamiento

RandLA-Net es una red encoder-decoder para segmentación de nubes de puntos. El encoder aplica una secuencia de capas de muestreo aleatorio (random sampling) que reducen progresivamente el número de puntos, intercaladas con bloques de agregación de características locales que combinan atención espacial, pooling y una MLP compartida para capturar el contexto geométrico de cada punto. El decoder recupera la resolución original mediante interpolación de características y conexiones de salto, hasta producir un logit por clase y por punto. La elección del muestreo aleatorio, en lugar de FPS (farthest point sampling) o búsquedas de vecinos, es la innovación clave: reduce el coste computacional de O(N log N) a O(N) y permite escalar a nubes de millones de puntos.

El checkpoint se ha entrenado sobre Paris-Lille-3D, un dataset LiDAR urbano con anotación semántica de 9 clases. La model card no detalla el número de épocas, la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino adicional. Tampoco se documenta el uso de RLHF, DPO ni ningún otro esquema de alineación, algo esperable en un modelo de segmentación geométrica. Los pesos proceden de una conversión directa desde Open3D-ML (licencia MIT) al formato de PyTorch PointCloud, lo que facilita su uso con `torch-pointcloud` y su integración en pipelines PyTorch nativos.

## Capacidades

- Segmentación semántica por punto en nubes de puntos 3D con 9 clases de salida (entorno urbano).
- Procesamiento de nubes de puntos de gran escala gracias al muestreo aleatorio eficiente.
- Extracción de características por punto mediante `forward_features`, útil para tareas downstream (clustering, clasificación, recuperación).
- Reducción de dimensionalidad del clasificador con `reset_classifier(num_classes=0)` para obtener embeddings de 32 dimensiones.
- Entrada con coordenadas XYZ e intensidad opcional, según el pipeline de transformación de la librería.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente geométrico.
- No soporta visión 2D, audio ni texto.

## Casos de uso

- Segmentación de nubes LiDAR urbanas: el modelo etiqueta cada punto como suelo, edificio, vehículo, vegetación, etc., lo que permite generar mapas semánticos 3D de ciudades a partir de capturas móviles o aéreas.
- Cartografía y gemelos digitales: integrado en pipelines de reconstrucción 3D, facilita la separación de elementos urbanos para alimentar visores GIS o simulaciones de planificación urbana.
- Percepción para conducción autónoma y robótica móvil: al procesar nubes de puntos a gran escala con bajo coste, puede servir como módulo de segmentación en tiempo casi real sobre LiDAR de vehículos o robots.
- Análisis de infraestructura viaria: permite aislar la clase suelo y detectar anomalías (baches, obstáculos) en levantamientos periódicos de carreteras.
- Preprocesado para modelos downstream: los embeddings de 32 dimensiones por punto sirven como características de entrada para clasificadores, detectores o modelos de registro de nubes.
- Investigación en percepción 3D: al ser un checkpoint MIT con métricas publicadas sobre Paris-Lille-3D, es una línea base reproducible para comparar nuevas arquitecturas de segmentación.
- Inventario de vegetación urbana: la clase correspondiente a vegetación permite estimar cobertura arbórea y planificar mantenimiento en entornos municipales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| Paris-Lille-3D | Segmentación de nubes de puntos | mIoU | 83,05 |
| Paris-Lille-3D | Segmentación de nubes de puntos | OA (accuracy global) | 98,67 |

No se han publicado en la información disponible resultados comparativos con otros modelos sobre el mismo dataset ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,0 M de parámetros, los pesos en FP32 ocupan aproximadamente 20 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento o nubes de puntos muy grandes se recomienda una GPU con 8 GB o más (RTX 3060, RTX 4070, A100, H100).
- Cabe en GPU consumer: sí, en cualquier GPU moderna (GTX 1650 en adelante) e incluso en CPU para nubes de tamaño moderado.
- Opciones de despliegue: la librería oficial es `torch-pointcloud` (PyTorch); también puede ejecutarse a través de Open3D-ML, del que proceden los pesos originales. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RandLA-Net (este checkpoint) | 5,0 M | Paris-Lille-3D | 83,05 | MIT | Hugging Face + Open3D-ML |
| PointNet++ | no disponible en la información | Paris-Lille-3D | no disponible | MIT (implementación original) | Ampliamente disponible |
| KPConv | no disponible en la información | Paris-Lille-3D | no disponible | MIT (implementación original) | Ampliamente disponible |
| SparseConvNet / MinkowskiNet | no disponible en la información | Paris-Lille-3D | no disponible | MIT / BSD | Ampliamente disponible |

No se dispone de datos comparativos de rendimiento sobre Paris-Lille-3D para los modelos alternativos en la información proporcionada. La comparativa se limita a la categoría (segmentación semántica de nubes de puntos) y a la disponibilidad de implementaciones de referencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de nubes de puntos 3D; no procesa texto, imagen 2D ni audio.
- Entrenado únicamente sobre Paris-Lille-3D (entorno urbano francés); el rendimiento puede degradarse en otros dominios (interiores, industria, agricultura, minería) sin reentrenamiento.
- Solo 9 clases de salida; no cubre categorías fuera del esquema del dataset.
- Entrada limitada a 3 canales (XYZ); la intensidad es opcional según el pipeline, pero no se documenta su uso en el entrenamiento.
- Riesgo de confusión entre clases geométricamente similares (por ejemplo, vehículo frente a mobiliario urbano) en zonas densas u ocluidas.
- No se documentan sesgos geográficos ni demográficos, pero al estar entrenado en una única ciudad, la generalización geográfica es una incógnita.
- No se han verificado de forma independiente las métricas publicadas (mIoU 83,05 / OA 98,67); el autor las marca como no verificadas.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright.
- No apto para producción crítica sin validación en el dominio objetivo: al no documentarse el proceso de entrenamiento (épocas, aumentos, splits), la reproducibilidad es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/randlanet.parislille3d.open3d
- Paper RandLA-Net (arXiv): https://arxiv.org/abs/1911.11236
- Repositorio PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Open3D-ML (origen de los pesos): https://github.com/isl-org/Open3D-ML
- Dataset Paris-Lille-3D: https://github.com/Paris-Lille-3D/Paris-Lille-3D (referencia del dataset citado en el paper de Roynard et al., 2018)

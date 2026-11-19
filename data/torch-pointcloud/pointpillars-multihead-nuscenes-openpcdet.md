# torch-pointcloud/pointpillars-multihead.nuscenes.openpcdet

## Resumen

PointPillars multihead es un detector de objetos 3D para nubes de puntos LiDAR, entrenado sobre el dataset nuScenes y publicado por el proyecto torch-pointcloud. No es un modelo de lenguaje: es una red convolucional que convierte nubes de puntos en pseudonimágenes (pillars) y aplica un backbone 2D para predecir cajas 3D con sus clases y orientaciones. Su relevancia radica en que ofrece pesos ya entrenados y convertidos desde OpenPCDet en formato safetensors, listos para cargarse con la librería `torch-pointcloud` mediante una API de una sola llamada, lo que elimina el trabajo habitual de reproducir configuraciones de entrenamiento.

El modelo es deliberadamente compacto: 6,09 millones de parámetros y un repositorio de tamaño despreciable, lo que permite ejecutarlo en GPU de consumo e incluso en CPU para prototipado. La variante "multihead" indica que la cabeza de detección está adaptada a las 10 clases de nuScenes, frente a las 3 clases habituales de KITTI en las implementaciones originales de PointPillars.

Los resultados declarados por el autor son mAP 44,12 y NDS 57,07 sobre nuScenes, métricas no verificadas de forma independiente. Es un punto de partida razonable para pipelines de percepción en conducción autónoma, robótica móvil o análisis de escenas urbanas, no un modelo de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (pillar encoder + backbone 2D convolucional + cabeza de detección multihead) |
| Parametros totales | 6.089.398 (6,1 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no secuencial) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de detección sobre nubes de puntos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `torch-pointcloud`) |

Otros datos técnicos declarados: 5 canales de entrada, 10 clases de salida, 384 características por pillar tras el backbone.

## Arquitectura y entrenamiento

PointPillars organiza la nube de puntos en columnas verticales (pillars) sobre el plano XY y codifica cada una como un tensor denso de tamaño fijo, que después procesa con convoluciones 2D. Esto evita el coste de las convoluciones 3D y de los voxels dispersos, y es la razón por la que el modelo es tan ligero y rápido. La cabeza multihead predice, por ancla y clase, el desplazamiento respecto al centro, las dimensiones, el ángulo de orientación y la puntuación de confianza.

El entrenamiento se realizó sobre nuScenes, un dataset de conducción autónoma con 10 clases de objetos anotados (coche, peatón, camión, autobús, bicicleta, moto, remolque, construcción, barrera y cono de tráfico, entre otras). Los pesos publicados se han convertido desde la implementación de referencia de OpenPCDet (Apache-2.0), de modo que la arquitectura y el pipeline de preprocesado son los de dicha librería. La model card no detalla el número de tokens ni la composición exacta del dataset más allá de la referencia a nuScenes, ni menciona fases de RLHF o ajuste fino adicional. La innovación destacable es la integración: el objeto `info` devuelto por `create_model` incluye la transformación necesaria para pasar de un diccionario de puntos (`pos`, `intensity`, `timestamp`) al formato de voxels que espera la red.

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR: cajas delimitadoras con clase, centro, dimensiones y orientación.
- Clasificación en 10 clases propias de nuScenes, incluidas clases minoritarias como barrera o cono de tráfico.
- Entrada multimodal a nivel de punto: posición (3), intensidad (1) y timestamp (1), cinco canales en total.
- Extracción de características: el método `forward_features` devuelve un tensor de 384 canales por pillar, reutilizable como extractor para tareas posteriores (segmentación, clasificación de escenas, destilación).
- Procesamiento por lotes: la API `collate` permite agrupar varias muestras con `batch_from="pos_voxel"`.
- Inferencia en modo evaluación con `torch.no_grad`, apta para despliegue en producción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Percepción en conducción autónoma: el modelo detecta vehículos, peatones y elementos de vía a partir del LiDAR de un vehículo, con 10 clases cubiertas y métricas publicadas sobre nuScenes, lo que permite integrarlo como etapa de detección en un stack de planificación.
- Robótica móvil en exteriores: un robot de reparto o de inspección puede usar el modelo para evitar obstáculos y localizar personas u objetos con un coste computacional de 6,1 M de parámetros, viable en GPUs embebidas.
- Análisis de tráfico urbano: procesamiento por lotes de grabaciones LiDAR de intersecciones para contar vehículos y peatones por clase y franja horaria, aprovechando la clasificación multihead de 10 clases.
- Etiquetado asistido (auto-labeling): el modelo genera propuestas de cajas 3D que un anotador humano revisa, acelerando la creación de datasets propietarios; `forward_features` permite además reutilizar el backbone para modelos de segmentación.
- Extracción de características para modelos downstream: los 384 canales por pillar sirven como entrada a cabezas ligeras personalizadas (por ejemplo, detección de una clase concreta no presente en nuScenes) mediante ajuste fino.
- Prototipado e investigación en percepción 3D: al cargarse con `pip install torch-pointcloud` y una llamada a `create_model`, permite reproducir un baseline de PointPillars en minutos para comparar con arquitecturas nuevas.
- Validación de pipelines de datos LiDAR: comprobar que el preprocesado de una captura propia (calibración, intensidades, timestamps) produce detecciones coherentes antes de invertir en un entrenamiento completo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre nuScenes y tarea de detección de objetos 3D:

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mAP | nuScenes | 44,12 | No |
| NDS | nuScenes | 57,07 | No |

No se han publicado en la información disponible resultados de latencia, throughput ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB para lotes pequeños; los 6,1 M de parámetros ocupan unos 24 MB en FP32 y unos 12 MB en FP16. El consumo real lo domina el volumen de voxels de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las GPU de gama alta estarán infrautilizadas.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX moderna con soporte CUDA; también es viable en CPU para prototipado con latencias mayores.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` con PyTorch; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI (estas dos últimas no aplican a un modelo de visión).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Dataset | mAP / NDS | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pointpillars-multihead.nuscenes.openpcdet | 6,1 M | 10 | nuScenes | 44,12 / 57,07 | Apache-2.0 | Hugging Face, safetensors |
| PointPillars original (OpenPCDet, KITTI) | ~4,8 M (aprox., no confirmado en la información) | 3 | KITTI | no disponible en la información | Apache-2.0 | Repositorio OpenPCDet |
| Otras arquitecturas LiDAR de OpenPCDet (p. ej. SECOND, PV-RCNN) | no disponible | 3-10 | KITTI / nuScenes | no disponible | Apache-2.0 | Repositorio OpenPCDet |

La comparación cuantitativa con alternativas no puede completarse con los datos disponibles: no se han proporcionado métricas de otros modelos bajo el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Las métricas mAP 44,12 y NDS 57,07 están declaradas por el autor y marcadas como no verificadas; deben tomarse como referencia y no como garantía.
- El modelo está entrenado exclusivamente con la distribución de sensores de nuScenes; el rendimiento puede degradarse con LiDAR de otras marcas, densidades de puntos o condiciones meteorológicas no representadas.
- Las 10 clases están fijadas a la taxonomía de nuScenes; no detecta clases fuera de ese conjunto sin reentrenamiento.
- No se documentan sesgos específicos, pero los datasets de conducción urbana suelen sobrerrepresentar escenas diurnas y despejadas y subrepresentar condiciones nocturnas o de lluvia.
- Riesgo de falsos negativos en objetos pequeños o muy ocluidos, inherente a la discretización en pillars de PointPillars.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las condiciones del dataset nuScenes para cualquier uso derivado de los datos.
- El repositorio tiene 0,0 GB declarados y ningún "like"; conviene validar la integridad de los pesos tras la descarga.
- No hay soporte documentado para exportación a formatos de inferencia optimizados (ONNX, TensorRT), lo que puede limitar el despliegue en entornos embebidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars-multihead.nuscenes.openpcdet
- Paper PointPillars: https://arxiv.org/abs/1812.05784
- Repositorio OpenPCDet (origen de la conversión): https://github.com/open-mmlab/OpenPCDet
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
- Dataset nuScenes: https://www.nuscenes.org

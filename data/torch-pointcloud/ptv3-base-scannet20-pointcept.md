# torch-pointcloud/ptv3-base.scannet20.pointcept

## Resumen

`ptv3-base.scannet20.pointcept` es un modelo de segmentación semántica de nubes de puntos 3D basado en Point Transformer V3 (PTV3), la arquitectura presentada en el artículo "Point Transformer V3: Simpler, Faster, Stronger" (Wu et al., CVPR 2024). El checkpoint lo publica el proyecto `torch-pointcloud`, que lo ha convertido desde el repositorio de referencia Pointcept (licencia MIT) para integrarlo en su propia librería de PyTorch. No es un modelo de lenguaje: procesa nubes de puntos con coordenadas, color y normales, y devuelve una etiqueta semántica por punto entre 20 clases de interior.

El modelo tiene 46,2 millones de parámetros, acepta 6 canales de entrada (3 de posición y 3 de color o normales, según la configuración) y produce 20 clases, correspondientes a la anotación de 20 clases del dataset ScanNet. Su innovación principal es el uso de atención de vecindad serializada (serialized neighborhood attention), que reorganiza los puntos en una secuencia según un orden espacial y aplica atención local sobre vecinos, evitando los kernels de vecindad dispersos y costosos de versiones anteriores.

Es relevante para quien necesite un modelo de segmentación 3D listo para usar en producción o investigación, con pesos en safetensors, licencia MIT y una integración directa en una librería de PyTorch. Sus resultados declarados en ScanNet 20 clases son mIoU 77,42 y exactitud global (OA) del 92 %, aunque no están verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (transformer con atención de vecindad serializada) |
| Parametros totales | 46.171.604 (46,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos; el ejemplo de uso emplea 8192 puntos por muestra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repo: 0,2 GB) |
| Canales de entrada | 6 |
| Clases de salida | 20 |
| Dimensión de features | 64 |
| Dataset de entrenamiento | ScanNet (20 clases) |
| Librería | torch-pointcloud |
| Dependencias | spconv y flash-attn (compilación acorde a la versión de torch y CUDA) |

## Arquitectura y entrenamiento

PTV3 es un transformer diseñado específicamente para nubes de puntos. En lugar de construir grafos de vecindad con kernels dispersos, serializa los puntos siguiendo un orden espacial (space-filling curve) y aplica atención sobre vecinos contiguos en esa secuencia. Esto reduce el coste computacional y permite entrenar con batches grandes y resoluciones altas. El checkpoint concreto usa 64 canales internos de features, 6 canales de entrada y una cabeza de clasificación de 20 clases.

Según la model card, el modelo se ha entrenado en ScanNet con la anotación de 20 clases. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO (no aplicables en este dominio). El checkpoint es una conversión directa desde Pointcept, el repositorio de referencia del artículo, manteniendo la licencia MIT.

## Capacidades

- Segmentación semántica de nubes de puntos 3D: asigna una de 20 clases a cada punto de la nube.
- Entrada multimodal geométrica: acepta posición (3 canales), color (3 canales) y normales (3 canales), combinables según la transformación de datos.
- Extracción de features: `forward_features` devuelve representaciones de 64 dimensiones por punto, útiles para tareas posteriores (clasificación, clustering, recuperación).
- Configuración de la cabeza de clasificación: `reset_classifier(num_classes=0)` permite usar el modelo como extractor puro de embeddings.
- Procesamiento por lotes: soporta `collate` para agrupar varias nubes en un batch con índices de batch.
- Ejecución en GPU: los kernels de vecindad serializada son exclusivos de GPU (`model.cuda().eval()`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de visión 2D.

## Casos de uso

- Segmentación de escenas de interior: reconstrucciones 3D de habitaciones y edificios obtenidas con escáneres o SLAM se procesan para etiquetar suelo, pared, mesa, silla, etc., aprovechando el entrenamiento específico en ScanNet.
- Robótica móvil en interiores: un robot equipado con LiDAR o cámara de profundidad usa el modelo para identificar obstáculos y superficies transitables antes de planificar trayectorias.
- Digitalización de patrimonio y arquitectura: nubes de puntos de edificios se segmentan en elementos estructurales para generar modelos BIM o documentación as-built.
- Anotación asistida de datasets 3D: el modelo pre-etiqueta nubes de puntos y reduce el trabajo manual de anotadores, que solo revisan y corrigen las predicciones.
- Realidad aumentada y mixta: segmentación en tiempo real de la escena captada por el dispositivo para anclar objetos virtuales sobre superficies reconocidas.
- Análisis de inventario en retail o almacenes: detección y clasificación de estanterías, cajas y mobiliario a partir de escaneos 3D del espacio.
- Extracción de embeddings para búsqueda o clustering: usando `forward_features` se obtienen vectores de 64 dimensiones por punto para agrupar regiones o alimentar clasificadores ligeros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Métrica | Valor |
|---|---|---|---|
| ScanNet (20 clases) | Segmentación semántica de nubes de puntos | mIoU | 77,42 |
| ScanNet (20 clases) | Segmentación semántica de nubes de puntos | OA | 92,00 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Con 46,2 M de parámetros, los pesos en precisión completa ocupan aproximadamente 0,18 GB, pero el consumo real depende del número de puntos por muestra y de los buffers de atención.
- GPU recomendadas: no especificadas por el autor. El modelo requiere GPU por el uso de kernels de vecindad serializada y `flash-attn`.
- GPU de consumo: no se confirma compatibilidad. La dependencia de `flash-attn` y `spconv` exige compilaciones específicas por versión de CUDA, lo que limita las opciones a GPUs NVIDIA compatibles.
- Despliegue: la vía documentada es la librería `torch-pointcloud` (`pip install torch-pointcloud`), con `spconv` y `flash-attn` compilados para la versión de torch y CUDA del entorno. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Clases | mIoU ScanNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ptv3-base.scannet20.pointcept | 46,2 M | 6 canales | 20 | 77,42 (declarado) | MIT | Hugging Face, torch-pointcloud |
| Point Transformer V2 | no disponible en la información | nube de puntos | variable | no disponible en la información | MIT (Pointcept) | Pointcept |
| PointNeXt | no disponible en la información | nube de puntos | variable | no disponible en la información | MIT (Pointcept) | Pointcept |
| MinkowskiEngine-based models | no disponible en la información | nube de puntos | variable | no disponible en la información | MIT | Repositorios propios |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en ScanNet, que contiene escenas de interior. El rendimiento en exteriores, industria o escenas aéreas no está garantizado.
- Solo 20 clases: la taxonomía es fija; para otras categorías hay que reentrenar o ajustar la cabeza de clasificación.
- Resultados no verificados: las métricas de la model card están marcadas como `verified: false`.
- Dependencias frágiles: `spconv` y `flash-attn` requieren compilación contra la versión exacta de torch y CUDA, lo que complica el despliegue reproducible.
- Solo GPU: los kernels no funcionan en CPU, lo que descarta entornos sin acelerador NVIDIA.
- Sin información sobre sesgos: no se documentan sesgos de clase ni desequilibrios del dataset ScanNet en la información disponible.
- Riesgo de error en regiones ambiguas: como todo modelo de segmentación, puede confundir clases con geometría similar (por ejemplo, silla y mesa) o fallar en objetos parcialmente ocluidos.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de las dependencias (`spconv`, `flash-attn`) y del dataset ScanNet, que tiene sus propios términos de uso.
- Sin soporte de texto ni de idiomas: no es adecuado para tareas de NLP ni de visión 2D.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/ptv3-base.scannet20.pointcept
- Paper Point Transformer V3: https://arxiv.org/abs/2312.10035
- Repositorio Pointcept: https://github.com/Pointcept/Pointcept
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación: https://pytorch-pointcloud.org/latest/installation/
- Paper ScanNet: https://arxiv.org/abs/1702.04405 (Dai et al., CVPR 2017)

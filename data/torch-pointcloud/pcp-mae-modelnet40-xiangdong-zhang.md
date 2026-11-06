# torch-pointcloud/pcp-mae.modelnet40.xiangdong-zhang

## Resumen

PCP-MAE (Point Cloud Prediction Masked Autoencoder) es un modelo de clasificación de nubes de puntos 3D desarrollado por Xiangdong Zhang, Shaofeng Zhang y Junchi Yan, publicado en NeurIPS 2024. La versión recogida aquí, `pcp-mae.modelnet40.xiangdong-zhang`, es el checkpoint afinado sobre el dataset ModelNet40 y convertido al ecosistema de la librería `torch-pointcloud` por Arthur Dujardin. Resuelve la tarea de clasificar una nube de puntos 3D en una de 40 categorías de objetos (silla, mesa, avión, etc.).

La innovación central del trabajo es el preentrenamiento auto-supervisado de tipo masked point autoencoder: en lugar de reconstruir las coordenadas de los puntos enmascarados, el modelo predice sus centros, lo que estabiliza el entrenamiento y mejora la representación aprendida. El modelo es deliberadamente compacto: 22,3 millones de parámetros y un vector de características de 768 dimensiones, lo que lo hace viable en GPUs de consumo.

Es relevante para desarrolladores e investigadores que necesitan un backbone de clasificación de nubes de puntos con licencia MIT, pesos en safetensors y una API Python integrada en `torch-pointcloud`, sin depender de frameworks propietarios ni de checkpoints de gran tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para nubes de puntos (masked point autoencoder, PCP-MAE) |
| Parámetros totales | 22.347.688 (22,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de nube de puntos, 8192 puntos en el ejemplo de uso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimensión de características | 768 |
| Número de clases | 40 (ModelNet40) |
| Entrada | coordenadas `pos` (N, 3) y normales `normal` (N, 3) |
| Modelo base | torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang |
| Tamaño del repositorio | 0,1 GB |
| Librería | torch-pointcloud |

## Arquitectura y entrenamiento

El modelo sigue la familia de masked autoencoders adaptada a nubes de puntos. Durante el preentrenamiento se enmascaran grupos de puntos y la red debe predecir los centros de las regiones enmascaradas en lugar de reconstruir cada coordenada individual; esta formulación, descrita en el paper PCP-MAE (arXiv:2408.08753), evita la ambigüedad de reconstruir puntos dispersos y produce representaciones más discriminativas. La arquitectura es un transformer con atención sobre tokens de puntos y un vector de características de 768 dimensiones.

El checkpoint publicado aquí es el resultado del ajuste fino supervisado sobre ModelNet40, con 40 clases de salida. El preentrenamiento se realizó sobre el modelo base `pcp-mae.pretrain.xiangdong-zhang`; la información disponible no detalla el volumen de tokens ni la composición exacta del corpus de preentrenamiento más allá del uso de ModelNet40 para la fase supervisada. No se documenta en la información proporcionada el uso de RLHF, DPO ni técnicas de decodificación especulativa, que no aplican a una tarea de clasificación.

## Capacidades

- Clasificación de nubes de puntos 3D en 40 categorías de ModelNet40.
- Extracción de características: `forward_features` devuelve embeddings de 768 dimensiones por muestra, útiles para transfer learning o recuperación.
- Clasificador reconfigurable: `reset_classifier(num_classes=0)` permite usar el backbone sin cabeza de clasificación.
- Entrada multimodálica de geometría: coordenadas y normales por punto.
- Procesamiento por lotes mediante `collate` de `torch-pointcloud`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente viso-geométrico.

## Casos de uso

- Clasificación de objetos escaneados en robótica móvil: el modelo recibe la nube de puntos de un sensor LiDAR o RGB-D y devuelve la categoría del objeto, con 22,3 M de parámetros que permiten inferencia en el propio robot o en un edge device.
- Preprocesado en pipelines de realidad aumentada: identificar el tipo de objeto antes de superponer contenido digital, usando el backbone de 768 dimensiones como extractor de características.
- Etiquetado automático de datasets 3D: generar etiquetas preliminares sobre nubes de puntos no anotadas para acelerar la revisión humana en proyectos de percepción.
- Recuperación de formas 3D (shape retrieval): usar los embeddings de `forward_features` para indexar y buscar objetos similares en una base de datos de mallas escaneadas.
- Transfer learning a dominios específicos: partir del checkpoint de ModelNet40 y reentrenar la cabeza para clases industriales (piezas, componentes) con pocos datos etiquetados.
- Control de calidad en fabricación: clasificar piezas 3D capturadas por escáneres de luz estructurada para detectar categorías inesperadas en una línea de producción.
- Investigación en representación 3D: servir de baseline reproducible (licencia MIT, pesos safetensors) para comparar métodos de auto-supervisión en nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre ModelNet40 (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| ModelNet40 | OA (overall accuracy) | 93,64 |
| ModelNet40 | mAcc (mean accuracy) | 90,60 |

No se han publicado en la información disponible resultados de benchmarks adicionales (p. ej. comparativas con PointNet, PointNet++ o DGCNN) ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 22,3 M de parámetros en fp32 el modelo ocupa aproximadamente 90 MB de pesos, más el coste de activaciones para lotes de nubes de 8192 puntos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobradas para inferencia y fine-tuning ligero.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: la vía documentada es la librería `torch-pointcloud` sobre PyTorch (`tp.create_model`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables (PointNet, PointNet++, DGCNN, Point Transformer) sobre ModelNet40, por lo que la comparación numérica no está disponible. A continuación se comparan únicamente los atributos conocidos de este modelo:

| Modelo | Parámetros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| pcp-mae.modelnet40.xiangdong-zhang | 22,3 M | nube de puntos (8192 puntos en el ejemplo) | MIT | Hugging Face, safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para clasificación de 40 clases de ModelNet40; no generaliza a categorías fuera de ese conjunto sin reentrenamiento de la cabeza.
- ModelNet40 contiene objetos CAD sintéticos y limpios; el rendimiento sobre nubes de puntos reales con ruido, oclusiones o densidades variables puede degradarse y no está documentado.
- No es un modelo generativo ni de lenguaje: no admite prompts, razonamiento ni conversación.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- Riesgo de sesgo inherente al dataset: la distribución de clases de ModelNet40 no representa la diversidad de objetos del mundo real.
- Licencia MIT: permite uso comercial y modificación, pero conviene conservar la atribución del paper y de la conversión a `torch-pointcloud`.
- No se documentan cuantizaciones oficiales; cualquier despliegue en precisión reducida debe validarse empíricamente.
- La fecha de creación del repositorio (2026-10-30) y el bajo número de descargas (19) sugieren un modelo poco adoptado; conviene verificar la reproducibilidad antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pcp-mae.modelnet40.xiangdong-zhang
- Paper PCP-MAE: https://arxiv.org/abs/2408.08753
- Repositorio original del autor: https://github.com/aHapBean/PCP-MAE
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Modelo base de preentrenamiento: https://huggingface.co/torch-pointcloud/pcp-mae.pretrain.xiangdong-zhang

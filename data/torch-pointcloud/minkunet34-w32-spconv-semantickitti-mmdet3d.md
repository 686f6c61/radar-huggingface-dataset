# torch-pointcloud/minkunet34-w32-spconv.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32-SPConv es un modelo de segmentación semántica de nubes de puntos LiDAR, concretamente un U-Net residual disperso (sparse residual U-Net) entrenado sobre el dataset SemanticKITTI. Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como checkpoint convertido desde MMDetection3D, con el objetivo de ofrecer una implementación lista para usar dentro del ecosistema PyTorch nativo de esa librería, sin depender del stack de OpenMMLab.

El modelo resuelve la tarea de asignar una clase semántica a cada punto de una escena LiDAR (19 clases en SemanticKITTI: coche, peatón, ciclista, carretera, edificio, vegetación, etc.). Con 37,9 millones de parámetros y 4 canales de entrada (x, y, z e intensidad), es un modelo compacto y eficiente en comparación con los transformers de nubes de puntos actuales, pensado para inferencia sobre escenas de escaneo LiDAR de vehículos autónomos.

Su relevancia radica en que proporciona un baseline reproducible y con licencia Apache-2.0 para percepción 3D, con métricas declaradas de mIoU 68,64 y OA 92,06 sobre el split de validación de SemanticKITTI. Es una pieza útil para pipelines de percepción en robótica y conducción autónoma, así como para experimentos de investigación que necesiten un modelo de referencia de segmentación LiDAR sin entrenamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 con convoluciones dispersas (SPConv), U-Net residual disperso |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa nubes de puntos de tamaño variable) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Numero de clases | 19 (SemanticKITTI) |
| Dimension de caracteristicas | 96 |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una MinkUNet, es decir, una U-Net residual adaptada a convoluciones dispersas de Minkowski (Minkowski Convolutional Neural Networks, Choy et al., CVPR 2019). En lugar de densificar el espacio 3D en vóxeles, las convoluciones operan únicamente sobre las posiciones ocupadas, lo que reduce drásticamente el coste computacional y de memoria en escenas LiDAR con gran dispersión espacial. La variante W32 indica un ancho de canal base de 32, y la profundidad corresponde a un backbone de 34 capas con conexiones residuales. El modelo procesa 4 canales de entrada (coordenadas y intensidad) y produce logits por punto para 19 clases.

El checkpoint se ha convertido desde MMDetection3D (Apache-2.0) al formato de torch-pointcloud, lo que implica que los pesos son equivalentes a los del modelo original de referencia. La información disponible no detalla el número exacto de tokens de entrenamiento, la composición del dataset más allá de SemanticKITTI ni si se aplicaron técnicas de aumento de datos específicas, por lo que esos extremos deben considerarse no disponibles. No se documenta uso de RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo de texto.

## Capacidades

- Segmentación semántica por punto de nubes de puntos LiDAR en 19 clases de SemanticKITTI.
- Procesamiento de escenas 3D dispersas mediante convoluciones de Minkowski, con memoria proporcional a los vóxeles ocupados.
- Extracción de características por punto: `forward_features` devuelve un vector de 96 dimensiones por punto, útil como backbone para tareas posteriores.
- Reutilización como extractor de features con `reset_classifier(num_classes=0)` para transferencia a otras tareas de segmentación o clasificación.
- Entrada multimodal básica: coordenadas espaciales más intensidad de retorno LiDAR.
- Ejecución GPU-only: los kernels de spconv requieren CUDA, no hay soporte CPU documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Percepción en conducción autónoma: el modelo etiqueta cada punto LiDAR de la escena con clases como coche, peatón, ciclista o carretera, proporcionando la base para la detección y el seguimiento de obstáculos en el pipeline de percepción del vehículo.
- Segmentación de escenas urbanas para mapas HD: al clasificar puntos de edificios, vegetación, acera y calzada, se puede enriquecer la cartografía 3D con etiquetas semánticas que ayuden a la localización y planificación.
- Robótica móvil en exteriores: un robot con LiDAR puede usar el modelo para distinguir terreno transitable de obstáculos, con inferencia en GPU embebida (por ejemplo, Jetson) gracias a sus 37,9 M de parámetros.
- Extracción de features para modelos downstream: mediante `forward_features` se obtienen embeddings de 96 dimensiones por punto que alimentan clasificadores ligeros, clustering o modelos de detección 3D.
- Investigación en segmentación de nubes de puntos: sirve como baseline reproducible con licencia Apache-2.0 para comparar nuevas arquitecturas sobre SemanticKITTI sin necesidad de reentrenar desde cero.
- Análisis de datos LiDAR a gran escala: procesamiento por lotes de escenas capturadas con vehículos instrumentados para generar datasets etiquetados o auditorías de calidad de anotaciones existentes.
- Prototipado rápido en robótica y automoción: la API `tp.create_model(..., pretrained=True)` permite integrar el modelo en pocas líneas dentro de un proyecto PyTorch, reduciendo el tiempo de puesta en marcha frente a configuraciones de MMDetection3D.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 68,64 |
| SemanticKITTI | OA (accuracy global) | 92,06 |

No se han publicado en la información disponible resultados adicionales por clase, comparativas con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,9 M de parámetros y convoluciones dispersas, el consumo depende del número de puntos y del tamaño de la escena, no solo del peso del modelo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la compilación de spconv; se espera funcionamiento en RTX 3090, RTX 4090, A100 y H100.
- GPU de consumo: sí, es plausible en GPUs consumer modernas (RTX 3060 en adelante), siempre que se compile spconv para la versión de CUDA y PyTorch correspondiente.
- Despliegue: la vía documentada es la librería `torch-pointcloud` con `spconv`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Requisito crítico: los kernels de spconv requieren compilación específica para la combinación de torch y CUDA del entorno, lo que añade complejidad al despliegue.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet34-W32-SPConv (este) | 37,9 M | SemanticKITTI | 68,64 | Apache-2.0 | HuggingFace (torch-pointcloud) |
| Cylinder3D | No disponible en la informacion | SemanticKITTI | No disponible en la informacion | No disponible | No disponible |
| SPVCNN | No disponible en la informacion | SemanticKITTI | No disponible en la informacion | No disponible | No disponible |
| RangeNet++ | No disponible en la informacion | SemanticKITTI | No disponible en la informacion | No disponible | No disponible |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse sin inventar cifras. La comparación cualitativa relevante es que este checkpoint ofrece una integración nativa con torch-pointcloud y pesos en safetensors, mientras que las alternativas suelen distribuirse dentro de frameworks como MMDetection3D o repositorios de investigación con configuraciones más pesadas.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre SemanticKITTI: el dominio son escenas de conducción urbana y rural capturadas con LiDAR de un vehículo instrumentado; el rendimiento puede degradarse en otros sensores, densidades de puntos o entornos (interiores, industria, drones).
- Las 19 clases están fijas; no reconoce categorías fuera del esquema de SemanticKITTI y asignará una de las clases conocidas a puntos de objetos no vistos.
- Métricas no verificadas: los valores de mIoU y OA proceden de la model card y no han sido validados de forma independiente en esta ficha.
- Sesgos potenciales derivados de la distribución geográfica y de sensores del dataset original (KITTI, Alemania), con posible menor robustez en otras condiciones meteorológicas o de iluminación.
- Riesgo de error en clases minoritarias (por ejemplo, motociclistas o personas) y en objetos ocluidos o lejanos, típico de los modelos de segmentación LiDAR.
- Dependencia de spconv y de una compilación alineada con la versión de CUDA y PyTorch; la rotura de compatibilidad es un riesgo operativo real en producción.
- Ejecución GPU-only: no hay soporte CPU documentado, lo que limita el despliegue en entornos sin NVIDIA.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias del dataset SemanticKITTI y de los pesos originales de MMDetection3D para cumplir con sus términos de atribución.
- No es un modelo de lenguaje: no genera texto, no soporta instrucciones en lenguaje natural ni tool calling; cualquier uso conversacional requeriría un modelo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/minkunet34-w32-spconv.semantickitti.mmdet3d
- Paper de Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Repositorio de torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Repositorio de MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Paper de SemanticKITTI: https://arxiv.org/abs/1904.08755 (referencia cruzada en la model card; el paper original de SemanticKITTI es Behley et al., ICCV 2019)

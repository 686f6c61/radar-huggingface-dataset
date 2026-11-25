# torch-pointcloud/fcaf3d.sunrgbd.mmdet3d

## Resumen

FCAF3D (Fully Convolutional Anchor-Free 3D Object Detection) es un detector de objetos 3D para nubes de puntos, desarrollado originalmente por Danila Rukhovich, Anna Vorontsova y Anton Konushin y presentado en ECCV 2022. Este checkpoint concreto (`fcaf3d.sunrgbd.mmdet3d`) ha sido convertido desde MMDetection3D y publicado por el usuario `torch-pointcloud` para su uso con la librería PyTorch PointCloud de Arthur Dujardin. Detecta objetos 3D en escenas interiores representadas como nubes de puntos, devolviendo cajas 3D orientadas con sus clases.

El modelo emplea una arquitectura totalmente convolucional y libre de anclas (anchor-free) que opera sobre vóxeles dispersos. Con 70,5 millones de parámetros, 512 canales de características y 10 clases de objetos, está entrenado sobre el dataset SUN RGB-D, un benchmark de comprensión de escenas interiores RGB-D. Su relevancia actual radica en que ofrece un detector 3D compacto y con licencia permisiva, listo para integrarse en pipelines de percepción mediante una API de PyTorch.

No se trata de un modelo de lenguaje: no genera texto ni procesa lenguaje natural. Su entrada es una nube de puntos con posición, color y normales, y su salida son cajas 3D con clase y puntuación de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FCAF3D: detector 3D totalmente convolucional, anchor-free, sobre vóxeles dispersos (sparse voxel) |
| Parametros totales | 70.498.638 (70,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de percepción 3D, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (posición, color, normal) |
| Canales de características | 512 |
| Clases | 10 |
| Dataset de entrenamiento | SUN RGB-D |
| Tarea | Detección de objetos 3D |
| Librería | torch-pointcloud (requiere spconv compilado para torch/CUDA) |

## Arquitectura y entrenamiento

FCAF3D es un detector de objetos 3D completamente convolucional y sin anclas. En lugar de proponer regiones o anclas, predice directamente las cajas 3D a partir de un backbone convolucional disperso que opera sobre vóxeles de la nube de puntos. La arquitectura procesa la nube de puntos como una rejilla de vóxeles dispersos, extrae características de 512 canales y aplica cabezas convolucionales para clasificación y regresión de cajas 3D orientadas. El checkpoint incluye además la capacidad de extraer características mediante `forward_features`, útil como extractor para tareas posteriores.

El entrenamiento se realizó sobre el dataset SUN RGB-D, un benchmark de escenas interiores RGB-D con 10 clases de objetos. La información disponible no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento posteriores como RLHF o DPO (no aplicables en este dominio). El modelo original fue entrenado en el marco de MMDetection3D y este checkpoint es una conversión directa de esos pesos a la librería torch-pointcloud. La innovación principal del método es la eliminación de anclas y de propuestas de región, lo que simplifica el pipeline y reduce la complejidad de la cabeza de detección.

## Capacidades

- Detección de objetos 3D en nubes de puntos de escenas interiores: devuelve cajas 3D orientadas con clase y puntuación.
- Clasificación en 10 clases de objetos del dataset SUN RGB-D.
- Procesamiento de nubes de puntos con posición, color y normales (3 canales de entrada).
- Extracción de características de 512 canales mediante `forward_features`, reutilizable para otras tareas de aprendizaje sobre nubes de puntos.
- Funcionamiento GPU-only: los kernels de vóxeles dispersos requieren GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de percepción 3D, no un modelo de lenguaje.
- No dispone de modo thinking, visión 2D genérica, audio ni generación de texto.

## Casos de uso

- Robótica de interior: el modelo detecta objetos como sillas, mesas o camas en nubes de puntos captadas por sensores RGB-D, permitiendo a un robot doméstico localizar y manipular objetos en escenas interiores con 10 clases predefinidas.
- Reconstrucción y modelado de escenas: integrado en un pipeline de captura 3D, permite segmentar objetos individuales a partir de la nube de puntos para generar mallas o inventarios de mobiliario.
- Anotación automática de datos 3D: sirve como preanotador para acelerar el etiquetado de nuevas nubes de puntos, generando cajas 3D candidatas que un humano revisa y corrige.
- Navegación asistida y accesibilidad: detección de obstáculos y objetos relevantes en interiores para aplicaciones de asistencia a personas con discapacidad visual, a partir de sensores de profundidad.
- Investigación en percepción 3D: el checkpoint es un punto de partida reproducible para comparar métodos de detección 3D y para hacer fine-tuning sobre dominios específicos con la API de torch-pointcloud.
- Extracción de características para tareas downstream: usando `forward_features`, se obtienen embeddings de 512 canales por punto para clasificación de escenas, segmentación o búsqueda de similitud entre nubes de puntos.
- Prototipado rápido en entornos con GPU: la instalación vía `pip install torch-pointcloud` y la carga con `tp.create_model` permiten tener un detector 3D funcional en pocas líneas de código.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) sobre el dataset SUN RGB-D para la tarea de detección de objetos 3D:

| Metrica | Valor |
|---|---|
| mAP@0.25 | 64,35 |
| mAP@0.5 | 47,82 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, mAP@0.5 con otras métricas de dificultad, latencia o throughput) ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 70,5 M de parámetros y pesos en safetensors (repo de 0,3 GB), el modelo es compacto; la memoria adicional la determina el número de puntos de la nube y el tamaño de los mapas de vóxeles dispersos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilación de spconv y torch. El modelo es GPU-only, por lo que no funciona en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas consumer con suficiente VRAM para el tamaño de la nube de puntos de entrada (no se especifica una cifra exacta en la información disponible).
- Opciones de despliegue: librería torch-pointcloud (requiere `spconv` compilado para la versión de torch y CUDA). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables (por ejemplo, otros detectores 3D sobre SUN RGB-D como VoteNet, ImVoteNet o TR3D) que permitan una comparación rigurosa. Se indica a continuación lo que sí es comparable a nivel de ficha:

| Modelo | Parametros | Contexto | mAP@0.5 (SUN RGB-D) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fcaf3d.sunrgbd.mmdet3d | 70,5 M | no aplica | 47,82 | Apache 2.0 | Hugging Face (torch-pointcloud) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre SUN RGB-D (escenas interiores), por lo que el rendimiento fuera de ese dominio (exteriores, conducción, industria) no está garantizado.
- Solo 10 clases de objetos: cualquier objeto fuera de ese conjunto no será detectado correctamente.
- Requiere GPU: los kernels de vóxeles dispersos son GPU-only; no hay inferencia en CPU documentada.
- Dependencia de compilación: necesita `spconv` compilado para la versión concreta de torch y CUDA, lo que puede complicar el despliegue y la reproducibilidad.
- Métricas no verificadas: los valores de mAP declarados en la model card figuran como no verificados (`verified: false`).
- Riesgo de falsos positivos y negativos en escenas con oclusiones, objetos pequeños o nubes de puntos dispersas; no se documentan análisis de sesgo específicos.
- Sin capacidades lingüísticas: no debe emplearse para tareas de texto, razonamiento o agentes.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (spconv, torch-pointcloud) y del dataset original SUN RGB-D para usos concretos.
- Para producción: validar el modelo sobre datos propios antes de desplegar, dado que la conversión desde MMDetection3D puede introducir diferencias respecto al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/fcaf3d.sunrgbd.mmdet3d
- Paper FCAF3D (arXiv): https://arxiv.org/abs/2112.00322
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación de instalación de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Dataset SUN RGB-D (referencia en la model card): Song et al., CVPR 2015 (sin URL directa en la información disponible)

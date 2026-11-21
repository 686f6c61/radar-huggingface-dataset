# torch-pointcloud/votenet.sunrgbd.mmdet3d

## Resumen

VoteNet es un detector de objetos 3D en nubes de puntos basado en el mecanismo de *deep Hough voting*, publicado originalmente por Charles R. Qi, Or Litany, Kaiming He y Leonidas J. Guibas en ICCV 2019. El modelo identifica objetos 3D (camas, sillas, mesas, etc.) directamente a partir de coordenadas de puntos, sin depender de imágenes RGB ni de cajas 2D previas. Esta ficha corresponde a la conversión del checkpoint original de MMDetection3D al formato de la librería `torch-pointcloud`, publicada por el usuario `torch-pointcloud` bajo licencia Apache-2.0.

El modelo es deliberadamente ligero: aproximadamente 1,0 M de parámetros (959.442 en el fichero safetensors), 10 clases de objetos y un extractor de características de 256 canales. Está entrenado sobre el benchmark SUN RGB-D y reporta mAP@0.25 de 59,77 y mAP@0.5 de 36,39. No es un modelo generativo ni lingüístico: es un detector geométrico puro, por lo que no dispone de contexto textual, capacidades multilingües ni tool calling.

Su relevancia actual radica en la facilidad de despliegue: al estar empaquetado como modelo de `torch-pointcloud` con pesos en safetensors, se puede cargar con una sola llamada (`tp.create_model`) e integrar en pipelines de percepción 3D en PyTorch sin arrastrar la dependencia completa de MMDetection3D. Es útil como línea base reproducible para investigación en detección 3D y para prototipos de robótica o realidad aumentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoteNet (deep Hough voting sobre PointNet++) |
| Parámetros totales | 959.442 (~1,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de nube de puntos, no textual) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Otros datos técnicos declarados en la model card: canales de entrada = 1, número de clases = 10, dimensión de características = 256, dataset = SUN RGB-D, tarea = detección de objetos 3D.

## Arquitectura y entrenamiento

VoteNet combina un backbone PointNet++ para extraer características por punto con un módulo de votación tipo Hough: cada semilla predice un desplazamiento hacia el centro del objeto al que pertenece, y los votos se agrupan para proponer cajas 3D. Sobre esas propuestas se aplica una cabeza de clasificación y regresión de cajas. La innovación clave frente a detectores 2D-to-3D es que opera directamente sobre la geometría, evitando la dependencia de detectores de imagen y de calibración cámara-LiDAR.

El entrenamiento se realizó sobre SUN RGB-D, un benchmark de comprensión de escenas RGB-D con anotaciones de cajas 3D en interiores. La model card no detalla el número de tokens/puntos de entrenamiento, la composición exacta del dataset ni si hubo aumentos de datos específicos; esa información debe consultarse en el paper original (arXiv:1904.09664). El checkpoint aquí publicado es una conversión desde MMDetection3D (Apache-2.0) a `torch-pointcloud`, no un reentrenamiento.

## Capacidades

- Detección de objetos 3D en nubes de puntos: devuelve cajas 3D (centro, dimensiones, orientación) y etiquetas de clase para 10 categorías de SUN RGB-D.
- Entrada geométrica pura: consume coordenadas (`pos`) y, opcionalmente, color por punto (`color`), sin requerir imagen RGB.
- Extracción de características: `forward_features` devuelve un vector de 256 canales por punto, reutilizable para tareas aguas abajo (segmentación, clustering, recuperación).
- Procesamiento por lotes: la API `collate` permite agrupar varias nubes en un batch con índices de batch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, visión 2D, audio ni generación de texto.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Percepción en robótica de interiores: un robot móvil equipado con LiDAR o cámara de profundidad puede usar el modelo para localizar sillas, mesas o camas en tiempo real y planificar la navegación; los ~1 M de parámetros permiten inferencia en CPU o GPU de gama baja.
- Realidad aumentada y escaneo 3D: a partir de una nube de puntos capturada con un dispositivo RGB-D, el modelo genera cajas 3D que se pueden anclar a objetos físicos para superponer contenido virtual.
- Anotación asistida de datasets: preetiquetar nubes de puntos de interiores con las 10 clases de SUN RGB-D y revisar manualmente, reduciendo el coste de anotación 3D.
- Línea base para investigación: comparar nuevas arquitecturas de detección 3D contra un checkpoint reproducible y ligero, sin necesidad de montar MMDetection3D completo.
- Extracción de características para clustering: usar `forward_features` (256 canales) como embedding geométrico para segmentación no supervisada o recuperación de formas.
- Prototipos de inventario de espacios: contar y clasificar muebles en escaneos de habitaciones para aplicaciones de inmobiliaria o facility management, dado que el modelo está entrenado en escenas de interior.
- Integración en pipelines de PyTorch: al cargarse con `tp.create_model`, se puede insertar como módulo dentro de un modelo mayor entrenable de extremo a extremo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Benchmark | Métrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 59,77 |
| SUN RGB-D | mAP@0.5 | 36,39 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, por clase, latencia o throughput) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en FP32 (~4 MB de pesos) más el coste de activaciones de la nube de puntos; con 8.192 puntos por muestra el consumo es muy reducido.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha la capacidad de las GPUs de datacenter.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `torch-pointcloud` (librería nativa), PyTorch estándar; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de nube de puntos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dataset | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoteNet (este modelo) | ~1,0 M | no aplica | SUN RGB-D | 36,39 | Apache-2.0 | Hugging Face (`torch-pointcloud`) |
| VoteNet original (MMDetection3D) | ~1,0 M | no aplica | SUN RGB-D | no disponible en esta ficha | Apache-2.0 | GitHub open-mmlab |
| PointNet++ (clasificación/segmentación) | no disponible | no aplica | varios | no aplica (no es detector) | no disponible | múltiples repositorios |

No se dispone en la información proporcionada de resultados numéricos de alternativas como PointRCNN, F-PointNet o VoteNet-variants para una comparación rigurosa; los datos de mAP de esos modelos deben consultarse en sus respectivos papers.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en SUN RGB-D (escenas de interior), por lo que el rendimiento en exteriores, LiDAR vehicular o clases no presentes en las 10 categorías será pobre.
- Métricas no verificadas: los valores de mAP están marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en producción.
- Sin información sobre sesgos: la model card no documenta sesgos de clase, desbalance del dataset ni errores sistemáticos por categoría.
- Riesgo de falsos positivos y negativos en escenas densas u ocluidas; VoteNet es sensible a la calidad de la nube de puntos y a la densidad de muestreo.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural; cualquier uso conversacional es inválido.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de MMDetection3D y del paper original; revise las atribuciones requeridas (cita a Qi et al. 2019 y a Song et al. 2015).
- El repositorio ocupa 0,0 GB según Hugging Face; verifique la integridad de los pesos tras la descarga.
- Sin garantías de mantenimiento: la model card no indica soporte continuo ni versionado semántico.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/votenet.sunrgbd.mmdet3d
- Paper original (Deep Hough Voting for 3D Object Detection in Point Clouds): https://arxiv.org/abs/1904.09664
- Repositorio MMDetection3D (origen de la conversión): https://github.com/open-mmlab/mmdetection3d
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de torch-pointcloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SUN RGB-D (paper CVPR 2015): referencia en la model card, sin URL directa proporcionada.

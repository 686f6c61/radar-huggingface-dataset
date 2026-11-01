# torch-pointcloud/litept-large.nuscenes.prs-eth

## Resumen

LitePT-large.nuscenes.prs-eth es un modelo de segmentacion semantica de nubes de puntos 3D, concretamente la variante grande de LitePT (Lighter Yet Stronger Point Transformer) entrenada sobre el dataset nuScenes para conduccion autonoma. Lo desarrolla el grupo de investigacion de prs-eth (ETH Zurich) y esta empaquetado y distribuido en HuggingFace por el proyecto torch-pointcloud, una libreria de PyTorch orientada a tareas de point cloud. El modelo resuelve la asignacion de una clase semantica a cada punto de una nube LiDAR entre 16 categorias (vehiculos, peatones, vegetacion, edificios, etc.).

La arquitectura es un transformer hibrido para nubes de puntos: convoluciones en las etapas tempranas y atencion con embedding rotacional 3D en las etapas tardias, una combinacion disenada para reducir coste computacional sin perder capacidad de modelado global. Cuenta con 85,9 millones de parametros, 4 canales de entrada (coordenadas xyz mas intensidad) y 72 caracteristicas internas. El checkpoint esta convertido desde el repositorio oficial de LitePT bajo licencia MIT.

Su relevancia actual radica en que ofrece un rendimiento competitivo en segmentacion semantica LiDAR (mIoU 81,11 y OA 94,68 en nuScenes segun el autor) con un coste de parametros contenido, lo que lo hace atractivo para pipelines de percepcion en vehiculos autonomos y robotica donde el presupuesto de computo es limitado. El modelo esta pensado exclusivamente para inferencia en GPU, ya que depende de kernels CUDA especificos (spconv y flash-attn).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido para point cloud (convoluciones en etapas tempranas, atencion con embedding rotacional 3D en etapas tardias) |
| Parametros totales | 85.871.869 (85,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; tarea de vision 3D) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (xyz + intensidad) |
| Clases de salida | 16 |
| Dimension de caracteristicas | 72 |
| Dataset de entrenamiento | nuScenes |
| Libreria | torch-pointcloud |
| Tamano del repo | 0,3 GB |

## Arquitectura y entrenamiento

LitePT es un transformer para nubes de puntos que combina dos paradigmas: en las primeras etapas usa operaciones convolucionales (probablemente sparse convolutions via spconv) para extraer caracteristicas locales de forma eficiente, y en las etapas finales emplea mecanismos de atencion con 3D rotary position embedding (RoPE 3D) para capturar dependencias globales entre puntos. Esta hibridacion busca el equilibrio entre la eficiencia de las convoluciones y la expresividad de la atencion, reduciendo el coste cuadratico tipico de los transformers puros sobre nubes de puntos.

El modelo se entrena sobre nuScenes, un dataset multimodal de conduccion autonoma con nubes LiDAR anotadas semanticamente en 16 clases. La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). La innovacion tecnica principal es la propia arquitectura LitePT, descrita en el paper "LitePT: Lighter Yet Stronger Point Transformer" (CVPR 2026), que propone un diseno mas ligero que los point transformers previos manteniendo o mejorando la precision. El checkpoint esta convertido desde el repositorio oficial prs-eth/LitePT.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D: asigna una de 16 clases a cada punto de una nube LiDAR.
- Procesamiento de nubes con 4 canales de entrada (coordenadas xyz mas intensidad de retorno).
- Extraccion de caracteristicas (feature extraction) mediante `forward_features` o reseteando el clasificador, devolviendo vectores de 72 dimensiones por punto.
- Inferencia por lotes (batched inference) con gestion de indices de batch para multiples nubes simultaneas.
- No soporta generacion de texto, razonamiento linguistico, codigo, matematicas, vision 2D ni tool calling: es un modelo puramente de percepcion 3D.
- No dispone de capacidades multilingues ni de modo thinking.
- No soporta audio ni modalidades distintas a la nube de puntos.

## Casos de uso

- Percepcion en vehiculos autonomos: el modelo segmenta nubes LiDAR de escenas urbanas en tiempo real para identificar vehiculos, peatones, ciclistas, vegetacion y elementos de infraestructura, alimentando modulos de planificacion y evitacion de obstaculos. Su tamano contenido (85,9 M de parametros) lo hace viable en plataformas embebidas con GPU.
- Robotica movil y navegacion: un robot equipado con LiDAR puede usar el modelo para construir mapas semanticos del entorno y distinguir superficies transitables de obstaculos, mejorando la planificacion de rutas en interiores y exteriores.
- Etiquetado automatico de datos (auto-labeling): util para pre-anotar grandes volumenes de nubes de puntos LiDAR y acelerar la creacion de datasets de percepcion, reduciendo el coste de anotacion manual.
- Analisis de escenas urbanas y gemelos digitales: segmentacion de escaneos LiDAR de ciudades para inventariar mobiliario urbano, vegetacion y edificios, con aplicaciones en planificacion urbana y mantenimiento de infraestructuras.
- Sistemas ADAS de asistencia a la conduccion: integracion en pipelines de percepcion de nivel 2-3 para deteccion semantica de obstaculos y alertas al conductor, aprovechando la ventana de 16 clases de nuScenes.
- Investigacion en point clouds: uso como backbone preentrenado para extraer caracteristicas de 72 dimensiones por punto y reutilizarlas en tareas downstream como deteccion 3D, clasificacion de escenas o segmentacion de instancias.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| nuScenes | Segmentacion semantica de point cloud | simple/mIoU | 81,11 |
| nuScenes | Segmentacion semantica de point cloud | simple/OA | 94,68 |

No se han publicado en la informacion disponible resultados comparativos adicionales con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 85,9 M de parametros en precision FP32 los pesos ocupan aproximadamente 0,34 GB, pero el consumo real depende del numero de puntos por nube y de los kernels de atencion.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con spconv y flash-attn; se recomiendan tarjetas con al menos 8-16 GB de VRAM para lotes de nubes de tamano realista (por ejemplo, RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en GPUs NVIDIA consumer modernas (RTX 3060 en adelante), siempre que se compile spconv y flash-attn para la version de CUDA y PyTorch correspondiente.
- Opciones de despliegue: la libreria torch-pointcloud (`pip install torch-pointcloud`); requiere ademas `spconv` y `flash-attn` compilados para el entorno. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Inferencia exclusiva en GPU: el modelo usa kernels CUDA especificos y no funciona en CPU segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (otros point transformers como PointTransformerV3, PTv2, MinkowskiEngine o SPVCNN) medidos en el mismo protocolo, por lo que la comparativa cuantitativa no esta disponible. A nivel cualitativo:

| Modelo | Parametros | Dataset | mIoU nuScenes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litept-large.nuscenes.prs-eth | 85,9 M | nuScenes | 81,11 | MIT | HuggingFace (torch-pointcloud) |
| PointTransformerV3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| PTv2 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentacion semantica de nubes de puntos LiDAR; no es un modelo de lenguaje ni de vision 2D y no debe evaluarse con criterios de LLM.
- Entrenado unicamente en nuScenes: el dominio (escenas de conduccion en Singapur y Boston) puede no generalizar bien a otros entornos, sensores o densidades de nube.
- Las 16 clases estan fijas al esquema de nuScenes; no se puede cambiar el conjunto de clases sin reentrenar.
- Requiere GPU NVIDIA y dependencias fragiles (spconv y flash-attn compilados contra la version exacta de PyTorch y CUDA), lo que complica el despliegue reproducible en produccion.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas en puntos ambiguos, oclusiones o clases raras (por ejemplo, peatones lejanos o bicicletas).
- Sesgos potenciales derivados de la distribucion del dataset nuScenes (geografia, condiciones meteorologicas, hora del dia), no documentados en la model card.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (nuScenes tiene su propia licencia de uso no comercial para el dataset original) y de las dependencias (spconv, flash-attn).
- Los benchmarks declarados no estan verificados (`verified: false`); deben tratarse como resultados del autor.
- No hay informacion sobre cuantizacion ni optimizaciones para inferencia en hardware no NVIDIA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/litept-large.nuscenes.prs-eth
- Paper LitePT: https://arxiv.org/abs/2512.13689
- Repositorio oficial LitePT: https://github.com/prs-eth/LitePT
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/

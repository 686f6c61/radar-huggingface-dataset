# torch-pointcloud/openscene-openseg.scannet20.songyou-peng

## Resumen

`openscene-openseg.scannet20.songyou-peng` es un modelo de segmentacion de nubes de puntos 3D con vocabulario abierto, distribuido por el proyecto `torch-pointcloud`. Implementa la arquitectura OpenScene descrita en el articulo "OpenScene: 3D Scene Understanding with Open Vocabularies" (Peng et al., CVPR 2023), en la que una U-Net convolucional dispersa se destila en el espacio de texto de CLIP para permitir el etiquetado semantico de escenas 3D mediante prompts textuales arbitrarios, sin depender de un conjunto cerrado de clases.

El checkpoint esta entrenado sobre ScanNet con 20 clases y cuenta con 15,6 millones de parametros. Su salida es un embedding de 768 dimensiones alineado con `openai/clip-vit-large-patch14-336`, lo que permite clasificar cada punto comparando su embedding con el de un prompt de texto codificado por CLIP. La entrada son nubes de puntos con coordenadas, color y normales (3 canales), procesadas mediante convoluciones dispersas.

Su relevancia practica radica en que separa el entrenamiento del vocabulario: el modelo no esta atado a las 20 clases de ScanNet y puede reutilizarse con vocabularios propios sin reentrenar, lo que resulta util en robotica, escaneo de interiores y analisis de escenas 3D donde las taxonomias cambian con frecuencia. El modelo se distribuye bajo licencia Apache-2.0 y esta empaquetado para la libreria `torch-pointcloud`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de convoluciones dispersas (sparse conv) destilada en el espacio de texto de CLIP |
| Parametros totales | 15.575.648 (15,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida depende de los prompts de texto de CLIP) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 3 (coordenadas, color, normales) |
| Dimension del embedding | 768, alineado con `openai/clip-vit-large-patch14-336` |
| Caracteristicas internas | 96 |
| Dataset de entrenamiento | ScanNet (20 clases) |

## Arquitectura y entrenamiento

El modelo sigue la propuesta de OpenScene: una red troncal de segmentacion de nubes de puntos basada en convoluciones dispersas (sparse convolutional U-Net) con 15,6 M de parametros que produce, por cada punto, un embedding de 768 dimensiones. Esta troncal se entrena por destilacion para que sus embeddings coincidan con los del codificador de texto de CLIP (`openai/clip-vit-large-patch14-336`), de modo que la similitud coseno entre el embedding de un punto y el de un prompt textual indique la pertenencia a esa categoria.

La innovacion clave es el entrenamiento en espacio abierto: en lugar de aprender un clasificador de clases fijas, el modelo aprende a proyectar geometria y color 3D en el mismo espacio semantico que CLIP. Esto permite etiquetar con vocabularios definidos en tiempo de inferencia. El checkpoint se ha convertido desde el repositorio original `pengsongyou/openscene` y se distribuye a traves de `torch-pointcloud`. No se dispone de informacion detallada sobre el numero de tokens, la composicion exacta del dataset mas alla de ScanNet ni sobre el uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Segmentacion semantica de nubes de puntos 3D con vocabulario abierto: asigna a cada punto la categoria textual mas similar de un conjunto de prompts definido por el usuario.
- Extraccion de caracteristicas por punto mediante `forward_features`, que devuelve un tensor de 96 canales utilizable como representacion intermedia para tareas posteriores.
- Alineacion multimodal con CLIP: los embeddings de puntos son comparables directamente con embeddings de texto de `openai/clip-vit-large-patch14-336`.
- Procesamiento de nubes de puntos con coordenadas, color y normales, con soporte de batching mediante `collate`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo de vision 3D.
- No dispone de modo thinking, vision 2D nativa, audio ni generacion de texto.
- Capacidades multilingues determinadas por el codificador de texto de CLIP asociado, no por el modelo de segmentacion en si.

## Casos de uso

- Segmentacion de escenas de interior escaneadas: dado un escaneo de una habitacion (por ejemplo, con un sensor RGB-D o LiDAR), el modelo etiqueta cada punto como silla, mesa, pared, etc., definiendo el vocabulario en tiempo de inferencia sin reentrenar.
- Robotica movil y navegacion: un robot puede generar mapas semanticos de su entorno etiquetando nubes de puntos con categorias relevantes para la planificacion (suelo transitable, obstaculos, mobiliario) y adaptar el vocabulario segun la tarea.
- Digitalizacion de patrimonio y arquitectura: clasificacion automatica de nubes de puntos de edificios en elementos estructurales, permitiendo generar inventarios y modelos BIM con taxonomias personalizadas.
- Analisis de escenas para realidad aumentada: identificacion de superficies y objetos en tiempo de ejecucion para anclar contenido virtual, aprovechando la capacidad de definir vocabularios especificos de la aplicacion.
- Anotacion asistida de datasets 3D: preetiquetado de nubes de puntos con vocabularios abiertos para reducir el coste de anotacion manual, con revision humana posterior.
- Investigacion en vision 3D de vocabulario abierto: el modelo sirve como linea base reproducible para experimentos de destilacion CLIP-3D, evaluacion de transferencia de vocabulario y comparacion de arquitecturas de convolucion dispersa.
- Extraccion de caracteristicas para aprendizaje downstream: las representaciones de 96 canales pueden alimentar clasificadores ligeros para deteccion, agrupacion o recuperacion de escenas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre ScanNet (20 clases). No estan verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| mIoU | 46,11 |
| mAcc | 66,64 |
| OA | 69,76 |
| simple/mIoU | 45,33 |
| simple/mAcc | 66,07 |
| simple/OA | 69,09 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 15,6 M de parametros el peso del modelo es del orden de decenas de MB, pero el consumo real depende del numero de puntos procesados y de las estructuras dispersas de `spconv`.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la version de `spconv` instalada. El codigo de ejemplo usa `.cuda()` y kernels exclusivos de GPU.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU consumer moderna con CUDA, dado el reducido numero de parametros; el limite practico lo marca la memoria necesaria para las convoluciones dispersas sobre nubes grandes.
- Opciones de despliegue: `torch-pointcloud` con PyTorch, `spconv` y `transformers` (para el codificador de texto CLIP). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos de segmentacion de nubes de puntos con vocabulario abierto, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | mIoU ScanNet20 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openscene-openseg.scannet20.songyou-peng | 15,6 M | no aplica | 46,11 | Apache-2.0 | Hugging Face (`torch-pointcloud`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El modelo esta destilado sobre ScanNet (20 clases); el rendimiento puede degradarse con vocabularios muy alejados de las categorias de interior de ScanNet o con dominios distintos (exteriores, industria, LiDAR aereo).
- La calidad de la segmentacion depende del codificador de texto CLIP asociado y de la formulacion de los prompts; pequenos cambios en el texto pueden alterar las etiquetas.
- Riesgo de confusion entre categorias semanticamente proximas y de asignaciones erroneas en puntos ambiguos o con oclusiones.
- Requiere `spconv` compilado contra la version de PyTorch y CUDA del entorno, lo que complica el despliegue reproducible.
- Los kernels son exclusivos de GPU; no se documenta inferencia en CPU.
- No se documentan sesgos especificos, pero al derivar de CLIP puede heredar sesgos del corpus de texto e imagen utilizado para entrenar dicho codificador.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente; conviene revisar tambien las licencias de las dependencias (`spconv`, CLIP).
- El modelo no genera texto ni razona: no debe presentarse como un modelo de lenguaje ni utilizarse para tareas conversacionales.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/openscene-openseg.scannet20.songyou-peng
- Paper OpenScene: https://arxiv.org/abs/2211.15654
- Repositorio original: https://github.com/pengsongyou/openscene
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-large-patch14-336

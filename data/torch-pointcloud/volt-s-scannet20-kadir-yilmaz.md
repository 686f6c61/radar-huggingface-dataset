# torch-pointcloud/volt-s.scannet20.kadir-yilmaz

## Resumen

Volt-s.scannet20.kadir-yilmaz es un modelo de segmentación semántica de nubes de puntos 3D, concretamente la variante pequena (S) de la familia Volt, publicada por el autor Kadir Yilmaz y redistribuida en el Hub por la organizacion torch-pointcloud. El modelo resuelve la tarea de asignar una clase semantica a cada punto de una escena 3D, con 20 categorias de interior definidas por el dataset ScanNet. Su relevancia radica en que aplica un transformer "vanilla" sobre tokens de parches volumetricos, una propuesta que revisa el uso de transformers estandar en comprension de escenas 3D frente a arquitecturas especializadas con sesgos inductivos.

La arquitectura es un transformer plano sobre tokens de parches volumetricos, con 23,7 millones de parametros, 128 canales de caracteristicas, 6 canales de entrada (posicion, color y normal) y una cabeza de clasificacion de 20 clases. El checkpoint esta empaquetado para la libreria `torch-pointcloud` y requiere `flash-attn` para sus kernels de atencion, que son exclusivos de GPU.

El modelo se distribuye con licencia MIT y un repositorio de 0,1 GB en formato safetensors. Esta pensado para investigacion y prototipado en vision 3D, no como un modelo de lenguaje: no procesa texto ni dispone de capacidades generativas, de tool calling ni multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer plano sobre tokens de parches volumetricos (Volume Transformer) |
| Parametros totales | 23.687.444 (23,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa nubes de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible (modelo de vision 3D, no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados: canales de entrada 6 (posicion, color, normal), 20 clases de salida, 128 canales de caracteristicas, dataset ScanNet (20 clases), libreria `torch-pointcloud`, dependencia de `flash-attn`.

## Arquitectura y entrenamiento

Volt es un transformer "vanilla" aplicado a comprension de escenas 3D. En lugar de disenar un backbone especifico para nubes de puntos con operadores de vecindad local, el modelo tokeniza la escena en parches volumetricos y aplica atencion estandar sobre esos tokens, siguiendo la linea del paper "Volume Transformer: Revisiting Vanilla Transformers for 3D Scene Understanding" (Yilmaz, Kruse, Hofer, de Geus y Leibe, ECCV 2026). La variante S es la de menor capacidad de la familia, con 23,7 M de parametros y 128 canales de caracteristicas.

El checkpoint se entrena para segmentacion semantica sobre ScanNet con 20 clases. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en esta tarea). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; la innovacion central es precisamente el uso de atencion estandar sobre tokens volumetricos. El modelo deriva del checkpoint original `KadirYilmaz/Volt` (MIT) y ha sido convertido al formato de `torch-pointcloud`.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D en 20 clases de interior (ScanNet).
- Procesamiento de nubes con 6 canales por punto: posicion (3), color (3) y normal (3) segun la model card, con entrada configurada a 6 canales.
- Extraccion de caracteristicas por punto mediante `forward_features`, con salida de 128 dimensiones utilizable como embedding para tareas downstream.
- Reconfiguracion de la cabeza de clasificacion (`reset_classifier`) para adaptar el numero de clases o para obtener solo caracteristicas.
- Inferencia por lotes con `collate` sobre muestras que incluyen `pos`, `color`, `normal`, `segment` e `instance`.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- Sin capacidades de vision 2D, audio ni thinking mode.

## Casos de uso

- Segmentacion de escenas de interior para robotica movil: el modelo asigna etiquetas por punto a nubes capturadas por LiDAR o RGB-D, permitiendo distinguir suelo, paredes, muebles y otros elementos con 20 clases y 77,27 de mIoU en ScanNet, lo que facilita la construccion de mapas semanticos.
- Anotacion asistida de datasets 3D: preetiquetar nubes de puntos con el modelo y revisar manualmente las predicciones reduce el coste de anotacion en proyectos de vision 3D, dado el OA de 91,77 declarado.
- Extraccion de embeddings para busqueda y clustering de escenas: usando `forward_features` se obtienen vectores de 128 dimensiones por punto que pueden alimentar modelos de recuperacion o agrupamiento de geometrias similares.
- Preprocesado para realidad aumentada y virtual: la segmentacion por punto permite aislar superficies y objetos en una captura 3D antes de renderizar o colocar contenido virtual en la escena.
- Digitalizacion de interiores (BIM, inmobiliaria): clasificar los puntos de un escaneo de una vivienda en categorias como pared, suelo o mobiliario acelera la generacion de modelos semanticos del espacio.
- Investigacion en arquitecturas 3D: al ser un transformer vanilla sobre parches volumetricos de solo 23,7 M de parametros, sirve como baseline ligero y reproducible para comparar frente a backbones especializados en tareas de segmentacion de nubes de puntos.
- Prototipado en pipelines de percepcion con GPU: el modelo es pequeno (0,1 GB de repo) y puede integrarse en un servicio de inferencia por lotes con `torch-pointcloud`, siempre que se disponga de `flash-attn` y CUDA.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScanNet con 20 clases:

| Metrica | Valor |
|---|---|
| mIoU | 77,27 |
| OA (accuracy global) | 91,77 |
| simple/mIoU | 76,38 |
| simple/OA | 91,36 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- Inferencia exclusivamente en GPU: la model card indica que los kernels son GPU-only y el ejemplo de uso llama a `model.cuda().eval()`.
- Dependencia obligatoria de `flash-attn`, que requiere una compilacion compatible con la version de PyTorch y CUDA instaladas.
- VRAM estimada: no disponible de forma oficial; con 23,7 M de parametros el peso en precision FP32 ronda los 95 MB y en FP16 unos 47 MB, por lo que el cuello de botella sera la activacion de la atencion sobre los tokens de la nube, no el tamano del modelo.
- Deberia caber en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) para nubes de tamano moderado, aunque no se han publicado mediciones oficiales de memoria.
- Opciones de despliegue: la libreria `torch-pointcloud` es la via documentada; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros modelos de segmentacion de nubes de puntos sobre ScanNet 20 clases, ni de sus especificaciones, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | mIoU ScanNet 20 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| volt-s.scannet20.kadir-yilmaz | 23,7 M | no disponible | 77,27 (declarado) | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado en vision 3D: no genera texto, no razona en lenguaje natural y no soporta ninguna tarea de NLP; usarlo fuera de la segmentacion de nubes de puntos no es viable.
- Dominio restringido: entrenado en ScanNet, un dataset de escenas de interior. El rendimiento en exteriores, escenas industriales u otras distribuciones no esta documentado y probablemente se degrade.
- Las metricas declaradas (mIoU 77,27, OA 91,77) no estan verificadas por un tercero (`verified: false`); deben tratarse como resultados del autor.
- Riesgo de error por clase: un mIoU de 77,27 implica que algunas de las 20 clases se segmentan con bastante menos precision que la media; en produccion conviene evaluar por clase antes de confiar en la salida.
- Dependencia fragil de `flash-attn`: la instalacion debe coincidir con la version de torch y CUDA, lo que complica el despliegue reproducible en entornos heterogeneos.
- Requiere GPU: no hay ruta documentada de inferencia en CPU.
- Licencia MIT: permite uso comercial y modificacion con atribucion; aun asi, conviene revisar la licencia del dataset ScanNet para usos derivados de los datos de entrenamiento.
- Sin garantias de calibracion de confianza: no se documenta el comportamiento de las probabilidades por punto, relevante si se usan umbrales en un pipeline automatico.
- Sesgos: no documentados; al derivar de un dataset academico de interiores, puede reflejar los sesgos de composicion y geografia de ScanNet.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/volt-s.scannet20.kadir-yilmaz
- Checkpoint original: https://huggingface.co/KadirYilmaz/Volt
- Paper: https://arxiv.org/abs/2604.19609
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion (incluye flash-attn): https://pytorch-pointcloud.org/latest/installation/
- Dataset ScanNet: https://github.com/ScanNet/ScanNet

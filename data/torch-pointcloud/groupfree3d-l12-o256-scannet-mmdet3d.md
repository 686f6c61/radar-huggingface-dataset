# torch-pointcloud/groupfree3d-l12-o256.scannet.mmdet3d

## Resumen

Group-Free 3D es un detector de objetos 3D sobre nubes de puntos, publicado originalmente por investigadores de Microsoft Research Asia (Liu et al., ICCV 2021). Este checkpoint concreto, `groupfree3d-l12-o256.scannet.mmdet3d`, es una conversión del modelo oficial de OpenMMLab (mmdetection3d) al formato de la librería `torch-pointcloud`, mantenida por Arthur Dujardin. El modelo resuelve la detección de objetos 3D en escenas interiores, prediciendo cajas 3D con clase y orientación a partir de nubes de puntos anotadas con coordenadas, color y normales.

La innovación central del paper es prescindir del agrupamiento geométrico clásico (como el usado en VoteNet) y sustituirlo por un decodificador transformer que razona directamente sobre un conjunto de candidatos a objeto muestreados. Esto permite modelar relaciones entre objetos de forma global ("group-free"), mejorando la precisión en escenas con objetos próximos o parcialmente ocluidos. Este checkpoint emplea la variante L12 (12 capas en el decodificador) con 256 candidatos iniciales.

Con 27,8 millones de parámetros y un tamaño de repositorio de 0,1 GB, es un modelo compacto y ligero, adecuado para investigación en percepción 3D y para pipelines de robótica o realidad aumentada en interiores. Su relevancia actual radica en que sirve como referencia reproducible en formato safetensors dentro del ecosistema `torch-pointcloud`, facilitando la evaluación y el fine-tuning sin depender del stack completo de mmdetection3d.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector sobre candidatos a objeto muestreados (Group-Free 3D) |
| Parametros totales | 27.804.033 (27,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 288 |
| Numero de clases | 18 (categorias de ScanNet) |
| Candidatos iniciales | 256 |
| Capas del decodificador | 12 |
| Dataset de entrenamiento | ScanNet |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Group-Free 3D descrita en el paper de Liu et al. (2021). Un backbone de extracción de características (con salida de 288 canales, según la model card) procesa la nube de puntos, y a continuación un conjunto de 256 candidatos a objeto se refina mediante un decodificador transformer de 12 capas. Cada capa aplica self-attention entre candidatos y cross-attention hacia las características de la nube, de modo que el modelo aprende a agrupar puntos y a predecir cajas 3D de forma conjunta, sin depender de un paso previo de agrupamiento geométrico. La salida incluye clase, centro, dimensiones y orientación de cada caja.

El entrenamiento se realizó sobre ScanNet, un dataset de reconstrucciones 3D de escenas interiores con 18 clases de objetos anotadas. La model card no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este dominio). El checkpoint es una conversión directa desde los pesos oficiales de mmdetection3d, por lo que el procedimiento de entrenamiento y las hiperparámetros subyacentes son los del repositorio original de OpenMMLab; la model card no aporta información adicional sobre innovaciones técnicas más allá de la propia arquitectura transformer.

## Capacidades

- Detección de objetos 3D en escenas interiores: predice cajas 3D con clase, centro, dimensiones y orientación sobre nubes de puntos.
- Clasificación en 18 categorías de ScanNet (sillas, mesas, camas, puertas, etc.).
- Procesamiento de nubes de puntos con coordenadas (pos), color y normales como entrada.
- Extracción de características de 288 canales mediante `forward_features`, útil para tareas downstream (segmentación, retrieval, etc.).
- Razonamiento global entre objetos gracias al decodificador transformer, que modela relaciones entre candidatos.
- No soporta tool calling, agentes, razonamiento multi-step textual ni capacidades multilingües: es un modelo puramente de visión 3D.
- No dispone de modo thinking, visión 2D, audio ni generación de texto.

## Casos de uso

- Robótica de manipulación en interiores: el modelo detecta objetos sobre la nube de puntos captada por una cámara RGB-D (por ejemplo, RealSense) y proporciona cajas 3D que el planificador de agarre puede usar directamente. Su tamaño compacto (27,8 M de parámetros) permite ejecución en el borde.
- Realidad aumentada y mixta: anclar contenido virtual a objetos físicos detectados en la escena, usando las cajas 3D para posicionar etiquetas o instrucciones sobre muebles y electrodomésticos.
- Inventario y auditoría de espacios: escanear una habitación u oficina y contar o localizar objetos de las 18 clases de ScanNet para tareas de inventario automatizado.
- Navegación asistida para personas con discapacidad visual: detección de obstáculos y objetos relevantes (puertas, sillas, mesas) a partir de la nube de puntos de un sensor portátil.
- Investigación en percepción 3D: servir como baseline reproducible en formato safetensors para comparar nuevas arquitecturas de detección 3D sin montar el stack de mmdetection3d.
- Preentrenamiento y fine-tuning: usar `forward_features` para extraer características de 288 canales y alimentar cabezales de segmentación semántica o de instancia en datasets propios.
- Digitalización de interiores (BIM): detección automática de mobiliario en escaneos de edificios para generar planos o modelos semánticos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el dataset ScanNet (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| mAP@0.25 | 66,86 |
| mAP@0.5 | 48,51 |

No se han publicado en la información disponible otros resultados de benchmarks (por ejemplo, en SUN RGB-D) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en fp32 (27,8 M de parámetros, unos 111 MB); el consumo real vendrá dominado por la nube de puntos de entrada y las activaciones intermedias, no por el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM. Funciona en RTX 3060, RTX 4090, A100, H100 y GPUs integradas modestas; también es viable en CPU para inferencia puntual.
- Cabe holgadamente en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: la librería `torch-pointcloud` (PyTorch) es la vía oficial; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP@0.5 (ScanNet) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Group-Free 3D L12 O256 (este) | 27,8 M | 8192 puntos (ejemplo) | 48,51 | Apache-2.0 | Hugging Face (torch-pointcloud) |
| VoteNet | no disponible | nube de puntos | no disponible en esta ficha | Apache-2.0 (mmdetection3d) | mmdetection3d |
| Group-Free 3D original (mmdetection3d) | no disponible | nube de puntos | no disponible en esta ficha | Apache-2.0 | GitHub OpenMMLab |

No se dispone en la información proporcionada de cifras comparables de VoteNet u otras variantes de Group-Free para establecer una comparación cuantitativa rigurosa; los datos de la tabla para esos modelos quedan como no disponibles.

## Limitaciones y advertencias

- Entrenado exclusivamente en ScanNet: generaliza mal a dominios distintos (exteriores, escenas sintéticas, sensores con otra distribución de ruido).
- Limitado a 18 clases de interiores; no detecta categorías fuera de ese conjunto.
- Riesgo de falsos positivos y de cajas mal orientadas en escenas con oclusión severa o puntos dispersos.
- La model card no documenta sesgos específicos, pero al derivar de ScanNet hereda los sesgos de su distribución (entornos principalmente domésticos y de oficina occidentales).
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de detecciones espurias.
- Licencia Apache-2.0: permite uso comercial con atribución; conviene revisar también la licencia del dataset ScanNet para usos derivados.
- El checkpoint es una conversión de terceros (`torch-pointcloud`); los resultados de benchmarks no están verificados de forma independiente.
- No hay garantías de soporte a largo plazo por parte del autor original del paper para este formato concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/groupfree3d-l12-o256.scannet.mmdet3d
- Paper Group-Free 3D: https://arxiv.org/abs/2104.00678
- Repositorio mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Dataset ScanNet: https://github.com/ScanNet/ScanNet
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632

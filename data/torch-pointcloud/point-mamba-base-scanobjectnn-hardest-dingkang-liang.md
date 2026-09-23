# torch-pointcloud/point-mamba-base.scanobjectnn-hardest.dingkang-liang

## Resumen

PointMamba es un modelo de clasificación de nubes de puntos 3D basado en un modelo de espacio de estados (SSM, state space model) que opera sobre puntos serializados. Esta ficha concreta corresponde al checkpoint `point-mamba-base.scanobjectnn-hardest.dingkang-liang`, publicado por el proyecto torch-pointcloud, que es una conversión del trabajo original de Dingkang Liang y colaboradores (Universidad Huazhong de Ciencia y Tecnología y otros), presentado en NeurIPS 2024 con el título "PointMamba: A Simple State Space Model for Point Cloud Analysis".

El modelo resuelve la tarea de clasificación de objetos a partir de nubes de puntos, es decir, recibe un conjunto de coordenadas 3D y devuelve una etiqueta entre 15 clases. Se trata de un modelo pequeño: 12.293.647 parámetros totales, una dimensión de característica de 384 y un clasificador de 15 clases. El checkpoint ha sido ajustado (fine-tuning) sobre la partición más difícil del conjunto de datos ScanObjectNN (PB_T50_RS), que contiene escaneos reales con oclusiones, ruido y objetos parcialmente visibles.

Su relevancia actual radica en dos factores: por un lado, demuestra que las arquitecturas de espacio de estados, popularizadas en el procesamiento de lenguaje natural con Mamba, son competitivas en dominios no textuales como la visión 3D; por otro, el checkpoint está empaquetado para la librería `torch-pointcloud`, lo que simplifica su integración en pipelines de PyTorch. La model card declara una exactitud global (OA) de 89,28 y una exactitud media por clase (mAcc) de 88,06, frente a la referencia de 89,31 del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de espacio de estados (SSM) tipo Mamba sobre puntos serializados; backbone PointMamba con 384 dimensiones de caracteristica |
| Parametros totales | 12.293.647 (12,3 M, segun safetensors) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; el ejemplo de uso de la model card emplea 8192 puntos por muestra |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de nube de puntos 3D, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |
| Clases de salida | 15 |
| Dataset de ajuste | ScanObjectNN (PB_T50_RS) |
| Modelo base | torch-pointcloud/point-mamba-base.pretrain.dingkang-liang |
| Dependencia adicional | `mamba-ssm` (requiere compilacion acorde a la version de PyTorch y CUDA) |
| Entrada esperada | coordenadas `pos` (N, 3) mas caracteristicas opcionales `x` y vector `batch` |

## Arquitectura y entrenamiento

PointMamba es un modelo de espacio de estados aplicado a nubes de puntos. A diferencia de los transformadores con atencion cuadratica, un SSM procesa la secuencia de forma recurrente con coste lineal respecto al numero de elementos, lo que permite manejar nubes de puntos densas sin el coste de memoria asociado a la atencion global. La innovacion principal del trabajo es el proceso de serializacion de los puntos desordenados en una secuencia unidimensional con una estructura espacial preservada, de modo que el SSM pueda modelar dependencias entre puntos vecinos sin necesidad de convoluciones ni de codificacion posicional explicita. El backbone empleado en este checkpoint tiene 384 canales de caracteristica y una cabeza de clasificacion de 15 clases.

El checkpoint aqui descrito no se entrena desde cero: parte del modelo preentrenado `point-mamba-base.pretrain.dingkang-liang` y se ajusta sobre la particion PB_T50_RS de ScanObjectNN, compuesta por escaneos reales de objetos de interior con perturbaciones. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset de preentrenamiento ni si se emplearon etapas de RLHF o DPO (tecnicas propias de modelos de lenguaje y no aplicables a esta tarea). El modelo se distribuye convertido desde el repositorio original `LMD0311/PointMamba`, con licencia Apache-2.0, y su ejecucion depende de kernels de `mamba-ssm` compilados para CUDA, por lo que la inferencia es exclusiva de GPU.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 clases, con salida de logits por muestra.
- Extraccion de caracteristicas: el metodo `forward_features` devuelve representaciones de 384 dimensiones por muestra, utiles para busqueda, clustering o modelos posteriores.
- Reutilizacion como backbone: es posible reinicializar el clasificador con `reset_classifier(num_classes=0)` o con otro numero de clases para transfer learning.
- Procesamiento de nubes de puntos sin orden implicito, mediante serializacion interna de los puntos.
- Coste lineal en el numero de puntos gracias a la formulacion SSM, en lugar de la atencion cuadratica.
- Inferencia por lotes mediante el mecanismo `collate` de `torch-pointcloud`.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision 2D ni audio.
- No se declaran capacidades multilingues (la entrada no es textual).

## Casos de uso

- Clasificacion de objetos en escaneos reales: el modelo esta ajustado especificamente sobre ScanObjectNN PB_T50_RS, la particion con oclusiones, ruido y objetos incompletos, por lo que es adecuado para reconocer objetos capturados con sensores de profundidad o LiDAR en entornos reales.
- Percepcion en robotica movil: clasificar objetos detectados en la nube de puntos antes de decidir una accion de manipulacion o navegacion; los 12,3 M de parametros permiten ejecutarlo en el bucle de control junto al resto del stack.
- Extraccion de embeddings para recuperacion 3D: usando `forward_features`, generar vectores de 384 dimensiones e indexarlos en una base vectorial para buscar formas tridimensionales similares o agrupar escaneos por similitud.
- Transfer learning a dominios propios: sustituir la cabeza de 15 clases por una adaptada a un catalogo interno (piezas industriales, productos, componentes) y ajustar sobre un dataset propio pequeno, partiendo del backbone preentrenado.
- Control de calidad en fabricacion: clasificar piezas capturadas con escaneres 3D en linea de produccion para detectar modelos erroneos o piezas malformadas, siempre que las clases relevantes esten cubiertas por el ajuste.
- Preetiquetado de grandes volumenes de escaneos: usar el modelo como anotador automatico inicial sobre nubes de puntos sin etiquetar y reservar la revision humana para los casos de baja confianza.
- Investigacion en arquitecturas SSM: servir como linea base reproducible para comparar variantes de serializacion de puntos o de diseno de SSM frente a alternativas basadas en atencion.
- Realidad aumentada y reconstruccion: clasificar la escena capturada por el dispositivo para decidir que elementos virtuales anclar y como colocarlos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente; el campo `verified` es `false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | Clasificacion de nubes de puntos | OA (exactitud global) | 89,28 |
| ScanObjectNN (PB_T50_RS) | Clasificacion de nubes de puntos | mAcc (exactitud media por clase) | 88,06 |
| ScanObjectNN (PB_T50_RS) | Clasificacion de nubes de puntos | OA de referencia citada en la model card | 89,31 |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo, ModelNet40) ni comparaciones numericas con otras arquitecturas sobre el mismo dataset.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 49 MB en fp32 y unos 25 MB en fp16 o bf16, calculado a partir de los 12.293.647 parametros. El consumo real de memoria lo dominan las activaciones, que dependen del numero de puntos por muestra (el ejemplo oficial usa 8192) y del tamano de lote.
- GPU obligatoria: la model card indica explicitamente que los kernels son solo para GPU (`model.cuda().eval()`, "GPU-only kernels"). Es necesaria una GPU NVIDIA con CUDA, ya que `mamba-ssm` requiere una compilacion especifica acorde a las versiones de PyTorch y CUDA instaladas.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano del modelo (12,3 M de parametros), cualquier GPU NVIDIA con soporte CUDA y suficiente memoria para el lote deberia ser suficiente, incluidas tarjetas de gama de consumo; A100 o H100 solo tendrian sentido por agregacion de lotes muy grandes.
- Opciones de despliegue: la via documentada es `torch-pointcloud` junto con `mamba-ssm` sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este caso.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Instalacion: `pip install torch-pointcloud`, mas la compilacion de `mamba-ssm` siguiendo la guia de instalacion de PyTorch PointCloud.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Dataset de evaluacion | OA | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| point-mamba-base.scanobjectnn-hardest.dingkang-liang (este checkpoint) | 12,3 M | Nube de puntos, 8192 puntos en el ejemplo | ScanObjectNN (PB_T50_RS) | 89,28 | Apache-2.0 | HuggingFace, libreria `torch-pointcloud` |
| point-mamba-base.pretrain.dingkang-liang (modelo base) | no disponible | Nube de puntos | no disponible (es el preentrenamiento del que deriva este checkpoint) | no disponible | no disponible en la informacion facilitada | HuggingFace |
| Implementacion original LMD0311/PointMamba | no disponible | Nube de puntos | ScanObjectNN (PB_T50_RS) | 89,31 (referencia citada en la model card) | Apache-2.0 | Repositorio GitHub |

No se dispone de datos en la informacion proporcionada para comparar con otras familias de clasificacion de nubes de puntos (PointNet++, DGCNN, Point Transformer, Point-MAE, PointGPT u otras). Por tanto, esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Catalogo cerrado: la cabeza de clasificacion cubre unicamente 15 clases, correspondientes a las categorias de ScanObjectNN. No reconocera objetos fuera de ese conjunto sin un ajuste adicional.
- Resultados no verificados: las metricas OA 89,28 y mAcc 88,06 proceden de la propia model card y el campo `verified` es `false`; no se han reproducido de forma independiente en la informacion disponible.
- Modelo reducido: con 12,3 M de parametros, su capacidad de representacion es limitada frente a arquitecturas mayores; no es adecuado para tareas generativas ni de segmentacion sin modificaciones.
- Dependencia de `mamba-ssm`: requiere compilar kernels CUDA especificos para la combinacion de versiones de PyTorch y CUDA. Esto complica el despliegue, la reproducibilidad y el uso en entornos sin GPU NVIDIA o en CPU.
- Ambito del dataset: ScanObjectNN contiene escenas de interior con perturbaciones; el rendimiento en escenas exteriores, nubes de puntos muy dispersas o sensores distintos a los del dataset puede degradarse.
- Sin datos de sesgo: no se documenta ningun analisis de sesgos ni de equilibrio entre clases mas alla de la exactitud media por clase.
- Riesgo de error silencioso: al ser un clasificador, el modelo siempre devuelve una etiqueta con una confianza asociada; se recomienda umbral de confianza y revision humana en aplicaciones criticas.
- Repo reportado como 0.0 GB: el campo de tamano del repositorio aparece como 0.0 GB pese a que los pesos safetensors existen (12,3 M de parametros). Conviene verificar la descarga completa antes de desplegar.
- Licencia: Apache-2.0, que permite uso comercial y modificacion, siempre que se conserven los avisos de licencia y se cite correctamente. El checkpoint es una conversion no oficial realizada por el proyecto torch-pointcloud, no publicada por los autores originales del paper.
- Adopcion nula actual: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/point-mamba-base.scanobjectnn-hardest.dingkang-liang
- Paper de PointMamba (arXiv:2402.10739): https://arxiv.org/abs/2402.10739
- Repositorio original PointMamba (LMD0311): https://github.com/LMD0311/PointMamba
- Libreria PyTorch PointCloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de PyTorch PointCloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud (Zenodo): https://doi.org/10.5281/zenodo.22159632
- Dataset ScanObjectNN (paper, ICCV 2019): Uy, M. A., Pham, Q.-H., Hua, B.-S., Nguyen, D. T., Yeung, S.-K., "Revisiting Point Cloud Classification: A New Benchmark Dataset and Classification Model on Real-World Data"
- Cita del modelo:
```bibtex
@inproceedings{liang2024pointmamba,
  title   = {PointMamba: A Simple State Space Model for Point Cloud Analysis},
  author  = {Dingkang Liang and Xin Zhou and Wei Xu and Xingkui Zhu and Zhikang Zou and Xiaoqing Ye and Xiao Tan and Xiang Bai},
  booktitle = {NeurIPS},
  year    = {2024}
}
```

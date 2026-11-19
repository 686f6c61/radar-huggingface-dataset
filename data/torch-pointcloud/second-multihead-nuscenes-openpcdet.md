# torch-pointcloud/second-multihead.nuscenes.openpcdet

## Resumen

`second-multihead.nuscenes.openpcdet` es un modelo de deteccion de objetos 3D sobre nubes de puntos LiDAR, basado en la arquitectura SECOND (Sparsely Embedded Convolutional Detection) y entrenado sobre el dataset nuScenes. Lo publica el proyecto `torch-pointcloud`, que mantiene Arthur Dujardin, y se trata de una conversion del checkpoint original de OpenPCDet al formato del ecosistema `torch-pointcloud`. El modelo resuelve la tarea de localizar y clasificar objetos (vehiculos, peatones, ciclistas, etc.) en 10 clases a partir de barridos LiDAR, devolviendo cajas 3D con orientacion.

La arquitectura es una red convolucional dispersa sobre vóxeles (sparse 3D conv), con 9,0 millones de parametros, 5 canales de entrada y 512 canales de caracteristicas. Su relevancia actual radica en que ofrece un baseline de deteccion 3D ligero y reproducible en PyTorch, con pesos en `safetensors` y una API de una linea (`tp.create_model`) para cargar el checkpoint, lo que facilita integrarlo en pipelines de investigacion sobre conduccion autonoma sin depender de la infraestructura original de OpenPCDet.

El checkpoint declara mAP 50,44 y NDS 61,9 sobre nuScenes. No es un modelo de lenguaje ni multimodal generativo: es un detector puro de nubes de puntos, con licencia Apache-2.0 y un tamano de repositorio de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (sparse convolutional voxel detector) |
| Parametros totales | 9.048.038 (9,0 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (no aplica; modelo de vision 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 5 |
| Clases de deteccion | 10 |
| Canales de caracteristicas | 512 |
| Dataset de entrenamiento | nuScenes |
| Libreria | torch-pointcloud (requiere `spconv`) |

## Arquitectura y entrenamiento

SECOND es un detector 3D basado en convoluciones dispersas sobre vóxeles: la nube de puntos LiDAR se voxeliza, se aplica una red convolucional 3D dispersa (sparse conv) para extraer caracteristicas y despues un cabezal de deteccion tipo multihead (de ahi el sufijo `multihead`) que predice cajas 3D con clases y orientacion. La model card indica 5 canales de entrada, 10 clases y 512 canales de caracteristicas, con un total de 9,0 M de parametros.

El entrenamiento se realizo sobre nuScenes, el dataset multimodal de conduccion autonoma (Caesar et al., CVPR 2020), y el checkpoint se ha convertido desde OpenPCDet (Apache-2.0) al formato de `torch-pointcloud`. No se especifican en la informacion disponible el numero de tokens equivalente, la composicion exacta del dataset, ni si hubo etapas de refinamiento o aumentacion adicionales; tampoco se detalla el esquema de optimizacion ni la duracion del entrenamiento. La innovacion tecnica destacable es la propia conversion de pesos a `safetensors` con una API de carga unificada, que permite usar el modelo fuera del entorno OpenPCDet original.

## Capacidades

- Deteccion de objetos 3D sobre nubes de puntos LiDAR, con 10 clases de nuScenes (vehiculo, peaton, ciclista, bus, camion, etc.).
- Regresion de cajas 3D con orientacion (yaw) y prediccion de clase por objeto.
- Extraccion de caracteristicas por vóxel mediante `forward_features`, con 512 canales, reutilizables como backbone para tareas aguas abajo.
- Inferencia por lotes sobre vóxeles (`voxel`, `pos_voxel`, `voxel_num_points`, `batch`), pensada para GPU.
- Integracion con el transformador de datos de `torch-pointcloud` (`info["transform"]`) y con la funcion `collate` del propio paquete.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-step, vision 2D, audio ni capacidades multilingues: es exclusivamente un detector 3D.

## Casos de uso

- Deteccion de obstaculos en conduccion autonoma: el modelo recibe barridos LiDAR y devuelve cajas 3D de vehiculos y peatones, adecuado como baseline para comparar arquitecturas sobre nuScenes.
- Preprocesado de datasets de nubes de puntos: usar `forward_features` para generar embeddings de 512 canales por vóxel y alimentar clasificadores o segmentadores aguas abajo.
- Validacion de pipelines de percepcion: integrar el modelo en tests automatizados que comprueben que las transformaciones de datos y el `collate` producen salidas coherentes antes de desplegar un detector propio.
- Investigacion academica en deteccion 3D: al ser una conversion fiel de un checkpoint OpenPCDet con metricas declaradas (mAP 50,44, NDS 61,9), sirve como referencia reproducible para ablaciones.
- Prototipado de sistemas de robotica movil: con 9,0 M de parametros y pesos de 0,1 GB, cabe en GPUs de gama media y permite iterar rapidamente en entornos de laboratorio.
- Generacion de pseudo-etiquetas sobre nuScenes: usar las detecciones del modelo como etiquetas debiles para entrenar modelos mas ligeros o para aumentar datos en clases poco representadas.
- Analisis de escenas urbanas: agregar las cajas detectadas por fotograma para estudiar densidad de trafico y presencia de peatones en secuencias LiDAR.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| 3d-object-detection | nuScenes | mAP | 50,44 |
| 3d-object-detection | nuScenes | NDS | 61,9 |

No se han publicado en la informacion disponible resultados de otras metricas (por ejemplo, mAP por clase, latencia o throughput) ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo (9,0 M de parametros, repositorio de 0,1 GB) es previsible que quepa con holgura en GPUs consumer, pero no se confirma.
- GPU recomendadas: no disponibles; la model card solo indica que los kernels son exclusivos de GPU (`model.cuda().eval()`, `# GPU-only kernels`).
- Cabe en GPU consumer: probable por tamano, pero no confirmado en la informacion disponible.
- Dependencias de despliegue: `torch-pointcloud` y `spconv`, este ultimo requiere una compilacion alineada con la version de PyTorch y CUDA (ver guia de instalacion de pytorch-pointcloud.org).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo); el uso previsto es via Python/PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos sobre nuScenes, por lo que no es posible establecer una comparativa numerica fiable. Como referencia cualitativa, la familia de detectores 3D de OpenPCDet incluye arquitecturas como PointPillars, VoxelNet y CenterPoint, pero sus metricas y configuraciones concretas no figuran en los datos disponibles.

| Modelo | Parametros | Contexto | mAP (nuScenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| second-multihead.nuscenes.openpcdet | 9,0 M | no aplica | 50,44 | Apache-2.0 | Hugging Face, safetensors |
| Alternativas de OpenPCDet (PointPillars, VoxelNet, CenterPoint) | no disponible | no aplica | no disponible | Apache-2.0 (repo) | repositorio OpenPCDet |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion 3D sobre LiDAR; no procesa texto, imagenes 2D ni audio.
- Dependencia de `spconv` con compilacion especifica por version de PyTorch y CUDA: un desajuste impide cargar el modelo.
- Inferencia solo en GPU segun la model card; no se documenta soporte CPU.
- Metricas declaradas por el autor y marcadas como no verificadas (`verified: false`); conviene reproducirlas antes de usarlas como referencia.
- Entrenado unicamente sobre nuScenes (entorno urbano de Singapur y Boston); el rendimiento puede degradarse en otros sensores, densidades de puntos o condiciones climaticas no representadas.
- No se documentan sesgos especificos, tasas de alucinacion ni comportamiento por clase; tampoco limitaciones de idioma (no aplica).
- Licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion a OpenPCDet y a los autores de SECOND y nuScenes.
- No se especifican limitaciones de contexto porque el modelo no usa ventana de tokens; la limitacion practica es el numero de puntos por muestra y el esquema de voxelizacion definido por el transformador de datos.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/second-multihead.nuscenes.openpcdet
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion: https://pytorch-pointcloud.org/latest/installation/
- Dataset nuScenes: https://www.nuscenes.org/

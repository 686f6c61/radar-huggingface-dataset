# torch-pointcloud/second.kitti.openpcdet

## Resumen

`second.kitti.openpcdet` es un checkpoint de deteccion de objetos 3D sobre nubes de puntos LiDAR, basado en la arquitectura SECOND (Sparsely Embedded Convolutional Detection) publicada por Yan, Mao y Li en 2018. Lo distribuye el proyecto `torch-pointcloud` (Arthur Dujardin) como una conversion de los pesos de referencia de OpenPCDet al formato safetensors, con el objetivo de ofrecer una via de uso directa desde PyTorch sin depender del ecosistema original de entrenamiento.

El modelo resuelve la deteccion de tres clases de objetos (coche, peaton y ciclista) en escenas de conduccion autonoma del benchmark KITTI, a partir de un tensor de vóxeles con cuatro canales de entrada (coordenadas e intensidad). Con solo 5,3 millones de parametros, es un detector muy compacto que prioriza la eficiencia en inferencia sobre la precision maxima, lo que lo hace adecuado como linea base reproducible o como componente de extraccion de caracteristicas.

Su relevancia actual es practica: los checkpoints de SECOND en OpenPCDet requieren compilar `spconv` contra una version concreta de PyTorch y CUDA, una tarea fragil en produccion. Esta ficha documenta una alternativa empaquetada con licencia Apache-2.0, con metricas declaradas por el autor (mAP 66,26 en KITTI) y una API de carga en dos lineas de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (detector 3D con convolucion dispersa sobre vóxeles, tipo VoxelNet) |
| Parametros totales | 5.332.488 (5,3 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos por vóxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `torch-pointcloud`) |
| Canales de entrada | 4 |
| Clases detectadas | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 512 |
| Dataset de entrenamiento | KITTI |
| Pipeline declarado | object-detection |

## Arquitectura y entrenamiento

SECOND es un detector 3D de una etapa que transforma la nube de puntos en una rejilla de vóxeles y aplica convoluciones 3D dispersas para no procesar el espacio vacio, que en LiDAR es la inmensa mayoria del volumen. Sobre el extractor de caracteristicas disperso se situa una cabeza de deteccion que predice cajas 3D orientadas con regresion de angulo, lo que evita el problema de discontinuidad angular de las parametrizaciones naive. El checkpoint declara 4 canales de entrada, 512 caracteristicas y 3 clases, coherente con la configuracion estandar de SECOND en OpenPCDet para KITTI.

El entrenamiento se realizo sobre KITTI, el benchmark de referencia de conduccion autonoma (Geiger et al., CVPR 2012), con las clases Car, Pedestrian y Cyclist. No se dispone de informacion sobre el numero de tokens o muestras, la composicion exacta del split, ni sobre si hubo etapas de refinamiento posteriores; la model card solo indica que los pesos se convirtieron desde `open-mmlab/OpenPCDet`. La innovacion tecnica relevante es precisamente la conversion: empaquetar el modelo en `torch-pointcloud` con transformaciones de datos y `collate` incluidos, de modo que el usuario no tenga que replicar el pipeline de OpenPCDet.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR: cajas orientadas con clase, centro, dimensiones y angulo de guinada.
- Tres clases: coche, peaton y ciclista, las tres clases evaluadas en KITTI.
- Entrada multimodal a nivel de punto: coordenadas XYZ mas intensidad de retorno (4 canales).
- Extraccion de caracteristicas densas de 512 canales mediante `forward_features`, utilizable como backbone para tareas aguas abajo (segmentacion, recuperacion, clasificacion de escenas).
- Integracion nativa con PyTorch y con las utilidades de `torch-pointcloud` (`create_model`, `transform`, `collate`).
- Soporte de ejecucion en GPU mediante kernels dispersos de `spconv`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: no es un modelo de lenguaje.
- No dispone de modo thinking, vision 2D, audio ni generacion de texto.

## Casos de uso

- Linea base reproducible en investigacion: sirve para validar pipelines de deteccion 3D antes de escalar a detectores mas costosos (PointPillars, CenterPoint, PV-RCNN), gracias a sus 5,3 M de parametros y a la carga en dos lineas con `tp.create_model`.
- Prototipado rapido de conduccion autonoma: permite montar un detector funcional sobre KITTI en horas en lugar de dias, evitando la compilacion manual de `spconv` contra el entorno de OpenPCDet.
- Extraccion de caracteristicas para modelos aguas abajo: `forward_features` devuelve 512 canales por voxel, utilizables como entrada de cabezas personalizadas de segmentacion semantica o de clasificacion de escenas.
- Preetiquetado de datos LiDAR: el modelo puede generar cajas candidatas sobre nubes nuevas para acelerar el etiquetado humano en proyectos de anotacion de datos de sensores.
- Deteccion de peatones y ciclistas en sistemas de seguridad: las clases Pedestrian y Cyclist estan explicitamente soportadas, lo que permite construir alertas de proximidad en entornos urbanos o industriales.
- Educacion y docencia: por su tamano reducido y su arquitectura bien documentada, es un caso de estudio adecuado para explicar convoluciones dispersas y representaciones voxelizadas en cursos de vision 3D.
- Integracion en pipelines de robotica movil: deteccion de obstaculos en tiempo real sobre LiDAR de 64 haces en plataformas con GPU de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false`).

| Metrica | Dataset | Valor |
|---|---|---|
| mAP | KITTI | 66,26 |
| AP / Car | KITTI | 78,63 |
| AP / Pedestrian | KITTI | 52,98 |
| AP / Cyclist | KITTI | 67,16 |

No se han publicado resultados adicionales de benchmarks (latencia, throughput, consumo de memoria) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,3 M de parametros, los pesos ocupan del orden de 21 MB en FP32 y 11 MB en FP16; el consumo dominante proviene de los mapas de activacion de la red dispersa y del tamano del lote, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA compatible con la compilacion de `spconv`. El modelo exige GPU (`model.cuda()`), ya que los kernels dispersos son GPU-only.
- Cabe en GPU de consumo: si, previsiblemente en cualquier RTX con suficiente memoria para el volumen de voxeles del lote; no se dispone de cifras oficiales de memoria pico.
- Opciones de despliegue: `torch-pointcloud` con PyTorch y `spconv` (requiere compilacion alineada con la version de torch y CUDA). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no aplican a este tipo de red.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mAP KITTI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| second.kitti.openpcdet | 5,3 M | 4 canales (XYZ + intensidad) | 3 | 66,26 | Apache-2.0 | Hugging Face, `torch-pointcloud` |
| SECOND original (OpenPCDet) | no disponible en la informacion | 4 canales | 3 | no disponible en la informacion | Apache-2.0 | GitHub `open-mmlab/OpenPCDet` |
| PointPillars | no disponible en la informacion | nube de puntos | 3 | no disponible en la informacion | Apache-2.0 (OpenPCDet) | GitHub `open-mmlab/OpenPCDet` |
| CenterPoint | no disponible en la informacion | nube de puntos | 3 | no disponible en la informacion | Apache-2.0 (OpenPCDet) | GitHub `open-mmlab/OpenPCDet` |

La comparacion cuantitativa con alternativas no puede completarse con los datos disponibles; la unica cifra contrastable es la del propio checkpoint.

## Limitaciones y advertencias

- Metricas no verificadas: los valores de mAP y AP proceden de la model card y estan marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- Dependencia fragil de `spconv`: la instalacion requiere una compilacion binaria alineada con la version exacta de PyTorch y CUDA, lo que complica la reproducibilidad en entornos contenerizados o con actualizaciones frecuentes.
- Solo GPU: los kernels dispersos no tienen implementacion CPU documentada, lo que impide desplegar el modelo en servidores sin acelerador.
- Ambito restringido a KITTI: el modelo esta entrenado para escenas de conduccion con la configuracion de sensores de KITTI; el rendimiento fuera de esa distribucion (LiDAR de otros fabricantes, entornos interiores, climas adversos) es desconocido y probablemente degrade.
- Solo tres clases: no detecta camiones, autobuses, motocicletas, senalizacion ni mobiliario urbano, lo que limita su uso directo en produccion sin reentrenamiento.
- Riesgo de falsos negativos en objetos pequenos o lejanos: los peatones y ciclistas obtienen AP notablemente inferior a los coches (52,98 y 67,16 frente a 78,63), lo que refleja la dificultad del modelo con objetos de pocos puntos.
- Sensibilidad a la calibracion y al rango de voxelizacion: los parametros de transformacion deben coincidir con los usados en entrenamiento; alterarlos invalida las predicciones.
- Sin informacion sobre sesgos: no se documenta analisis de sesgo por condiciones meteorologicas, iluminacion, densidad de trafico ni geografia.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; el uso en vehiculos reales exige validacion de seguridad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/second.kitti.openpcdet
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio OpenPCDet (origen de los pesos): https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Benchmark KITTI (paper CVPR 2012): https://www.cvlibs.net/datasets/kitti/

# torch-pointcloud/tr3d.sunrgbd.mmdet3d

## Resumen

tr3d.sunrgbd.mmdet3d es un modelo de deteccion de objetos 3D en interiores entrenado sobre el conjunto de datos SUN RGB-D. Lo desarrolla el proyecto torch-pointcloud (Arthur Dujardin) como una conversion del checkpoint original de TR3D publicado en OpenMMLab mmdetection3d, y se distribuye con licencia Apache 2.0. El modelo resuelve la localizacion y clasificacion de objetos en escenas RGB-D mediante deteccion 3D sobre nubes de puntos, devolviendo cajas 3D con orientacion.

Arquitecturalmente es un detector convolucional totalmente disperso (fully convolutional sparse voxel detector) de tipo TR3D, disenado para inferencia en tiempo real en entornos de interior. El checkpoint contiene 14,7 millones de parametros, acepta nubes de puntos con 3 canales de entrada (coordenadas, color y normal) y predice 10 clases de objetos. Su relevancia actual radica en que ofrece un detector 3D ligero y de bajo coste computacional, empaquetado en la libreria torch-pointcloud con pesos en formato safetensors, lo que simplifica su integracion en pipelines de robotica, realidad aumentada y analisis de escenas.

Frente a los grandes modelos multimodales de lenguaje, este es un modelo especializado y compacto: no procesa texto ni imagenes 2D de forma generativa, sino que realiza una tarea discriminativa de deteccion 3D. Su interes para desarrolladores e investigadores esta en la relacion entre su reducido tamano (0,1 GB de repositorio) y su rendimiento declarado en SUN RGB-D, con mAP@0.25 de 66,77 y mAP@0.5 de 50,15.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TR3D, detector convolucional totalmente disperso sobre vóxeles (sparse voxel) |
| Parametros totales | 14.670.674 (14,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de nube de puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos tecnicos declarados por el autor: canales de entrada 3, 10 clases de objetos, 128 canales de caracteristicas, tamano del repositorio 0,1 GB.

## Arquitectura y entrenamiento

TR3D es un detector de objetos 3D disenado para escenas de interior en tiempo real. La arquitectura es una red convolucional totalmente dispersa que opera sobre una representacion de vóxeles dispersos de la nube de puntos, evitando el coste de las convoluciones densas en el espacio 3D vacio. El modelo recibe tres canales por punto (coordenadas, color y normal), los transforma en vóxeles y produce caracteristicas de 128 canales que alimentan las cabezas de deteccion para 10 clases de objetos, con prediccion de cajas 3D y orientacion.

El entrenamiento se realizo sobre el conjunto SUN RGB-D, un benchmark de comprension de escenas RGB-D de interiores presentado en CVPR 2015. El checkpoint distribuido aqui es una conversion directa del modelo original de OpenMMLab mmdetection3d (Apache 2.0) al formato de la libreria torch-pointcloud. No se dispone de informacion detallada sobre el numero de tokens o muestras, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino adicionales mas alla del entrenamiento original descrito en el paper TR3D (ICIP 2023).

Como innovacion destacable, el paper TR3D propone un diseno orientado a inferencia en tiempo real para deteccion 3D en interiores, con un detector compacto de 14,7 M de parametros. La conversion a torch-pointcloud mantiene las cabezas de deteccion y el pipeline de preprocesado, exponiendo ademas una funcion `forward_features` que devuelve las caracteristicas de 128 canales para tareas de extraccion de representaciones.

## Capacidades

- Deteccion de objetos 3D en escenas de interior a partir de nubes de puntos RGB-D.
- Clasificacion en 10 clases de objetos propias de SUN RGB-D (categorias de mobiliario y objetos de interior).
- Regresion de cajas 3D con orientacion y dimensiones en el espacio tridimensional.
- Procesamiento de nubes de puntos con coordenadas, color y normales como entrada.
- Extraccion de caracteristicas de 128 canales mediante `forward_features`, util para tareas posteriores de representacion.
- Inferencia en GPU con kernels dispersos (spconv), orientada a tiempo real segun el diseno del paper.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto ni capacidades multilingues: es un modelo puramente perceptivo y discriminativo.

## Casos de uso

- Robotica movil de interior: el modelo puede detectar obstaculos y mobiliario en la nube de puntos de un sensor RGB-D embarcado, permitiendo a un robot planificar trayectorias y evitar colisiones en tiempo real gracias a su bajo coste computacional.
- Realidad aumentada y mixta: integrado en un pipeline de captura RGB-D, permite anclar objetos virtuales sobre superficies y muebles detectados, aprovechando la prediccion de cajas 3D con orientacion.
- Analisis de escenas para domotica: inventariado automatico de mobiliario y objetos en una habitacion a partir de un escaneo, util para asistentes de hogar o sistemas de recomendacion de distribucion de espacios.
- Reconstruccion y modelado 3D asistido: las cajas detectadas sirven como semilla para segmentacion y reconstruccion de mallas de objetos, reduciendo el trabajo manual en herramientas de modelado.
- Vehiculos autonomos y AGV en interiores: deteccion de personas y objetos en almacenes o entornos industriales cerrados, donde la ventana de percepcion es de corto alcance y la latencia critica.
- Investigacion en vision 3D: el modelo sirve como baseline reproducible para comparar nuevos detectores 3D sobre SUN RGB-D, con pesos en safetensors y una API de carga sencilla en torch-pointcloud.
- Extraccion de caracteristicas para clasificacion o segmentacion: `forward_features` permite reutilizar el backbone de 128 canales como extractor de representaciones en tareas derivadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Metrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 66,77 |
| SUN RGB-D | mAP@0.5 | 50,15 |

No se han publicado en la informacion disponible resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que el modelo no realiza tareas de lenguaje ni codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 14,7 M de parametros en precision completa el peso de los parametros ronda los 60 MB, por lo que el consumo dominante proviene de las activaciones y de los kernels dispersos de spconv, no de los pesos.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA y con spconv; el modelo es GPU-only segun la model card. Tarjetas como RTX 3090, RTX 4090, A100 o H100 son adecuadas, aunque el modelo es lo bastante pequeno para GPUs de gama media.
- Cabe en GPU de consumo: si, dado el reducido numero de parametros; se recomienda al menos una GPU con soporte CUDA moderno y suficiente memoria para el lote de nubes de puntos.
- Opciones de despliegue: la libreria oficial torch-pointcloud (`pip install torch-pointcloud`), que requiere `spconv` compilado para la version de torch y CUDA. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el paper TR3D esta orientado a tiempo real, pero no se aportan cifras concretas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tr3d.sunrgbd.mmdet3d | 14,7 M | Nube de puntos RGB-D | 10 | SUN RGB-D | Apache 2.0 | Hugging Face, torch-pointcloud |
| TR3D original (mmdetection3d) | no disponible | Nube de puntos RGB-D | 10 | SUN RGB-D | Apache 2.0 | GitHub OpenMMLab |
| Otros detectores 3D de interior (p. ej. VoteNet, FCAF3D) | no disponible en esta ficha | Nube de puntos | variable | SUN RGB-D | variable | Repositorios de investigacion |

La comparativa detallada con alternativas como VoteNet o FCAF3D no esta disponible en la informacion proporcionada; no se aportan sus parametros ni resultados sobre SUN RGB-D en este contexto.

## Limitaciones y advertencias

- Modelo especializado en deteccion 3D de interior: no genera texto, no razona y no procesa lenguaje natural; no debe evaluarse con metricas de LLM.
- Dominio restringido: entrenado exclusivamente sobre SUN RGB-D, con 10 clases de objetos de interior; su rendimiento fuera de ese dominio (exteriores, industria, otras categorias) no esta garantizado.
- Riesgo de alucinacion en el sentido de falsos positivos y cajas mal localizadas: como todo detector, puede predecir objetos inexistentes o con geometria incorrecta, especialmente en escenas con oclusiones o ruido en la nube de puntos.
- Dependencia de spconv: requiere compilar spconv para la version exacta de PyTorch y CUDA, lo que complica el despliegue y la reproducibilidad en entornos heterogeneos.
- GPU-only: la model card indica kernels solo para GPU; no se documenta soporte de inferencia en CPU.
- Idiomas: no aplica; el modelo no tiene capacidades linguisticas ni multilingues.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar las condiciones de los datos de SUN RGB-D y del checkpoint original de mmdetection3d para usos derivados.
- Resultados de benchmarks no verificados (`verified: false`): las cifras de mAP provienen del autor y no han sido validadas de forma independiente en la informacion disponible.
- Sin datos de cuantizacion publicados: no se documentan variantes GGUF, ONNX u otras, lo que limita el despliegue en hardware no NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/tr3d.sunrgbd.mmdet3d
- Paper TR3D: https://arxiv.org/abs/2302.02858
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentacion de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- OpenMMLab mmdetection3d (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- Dataset SUN RGB-D (paper CVPR 2015): https://arxiv.org/abs/1409.1556 (referencia de la cita; enlace directo al paper de SUN RGB-D no disponible en la informacion proporcionada)

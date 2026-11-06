# torch-pointcloud/second.kitti.mmdet3d

## Resumen

`second.kitti.mmdet3d` es un checkpoint de deteccion de objetos 3D sobre nubes de puntos LiDAR, correspondiente a la arquitectura SECOND (Sparsely Embedded Convolutional Detection) publicada por Yan, Mao y Li en 2018 en la revista *Sensors*. El modelo esta entrenado sobre el dataset KITTI y ha sido convertido desde la implementacion de referencia de OpenMMLab en `mmdetection3d` al formato de la libreria `torch-pointcloud`, mantenida por Arthur Dujardin. Detecta tres clases de objetos: coche, peaton y ciclista.

Se trata de un detector de voxels con convoluciones dispersas (sparse convolutions) que procesa nubes de puntos LiDAR de 4 canales de entrada (coordenadas XYZ mas intensidad) y produce cajas 3D orientadas. Con 5,3 millones de parametros (5.332.488 segun los pesos en safetensors) y un extractor de caracteristicas de 512 canales, es un modelo muy compacto en comparacion con los detectores 3D basados en transformers o en pilares que dominan el estado del arte actual.

Su relevancia hoy es fundamentalmente practica y de investigacion: ofrece una linea base clasica, ligera y bien documentada para tareas de percepcion 3D en conduccion autonoma, ademas de servir como referencia reproducible para comparar arquitecturas modernas. No es un modelo de lenguaje ni procesa texto: es exclusivamente un detector 3D sobre nubes de puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SECOND (detector 3D con convoluciones dispersas sobre voxels) |
| Parametros totales | 5.332.488 (5,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (XYZ + intensidad) |
| Clases detectadas | 3 (coche, peaton, ciclista) |
| Canales de caracteristicas | 512 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud |
| Dependencia adicional | spconv (compilacion especifica para la version de torch y CUDA) |

## Arquitectura y entrenamiento

SECOND es un detector de objetos 3D que aplica una red de convoluciones dispersas sobre una representacion en voxels de la nube de puntos LiDAR. La nube se voxeliza, se extraen caracteristicas por voxel y se procesan mediante capas de convolucion 3D dispersas (sparse convolution), que solo calculan sobre las posiciones ocupadas y evitan el coste de las convoluciones densas. La salida se proyecta a un mapa de caracteristicas 2D tipo BEV (bird's-eye view) del que se predicen cajas 3D con orientacion, clase y puntuacion. El checkpoint declara 4 canales de entrada, 3 clases y 512 canales de caracteristicas.

El modelo fue entrenado sobre el dataset KITTI, el benchmark de referencia para percepcion en conduccion autonoma (Geiger, Lenz y Urtasun, CVPR 2012). El checkpoint disponible no documenta el numero de tokens, la composicion exacta del split ni si se aplicaron tecnicas de aumento de datos o refinamiento posteriores; esa informacion no esta disponible en la model card. La innovacion tecnica principal de SECOND es precisamente la convolucion dispersa eficiente, que reduce el coste computacional frente a las convoluciones 3D densas y permite procesar nubes de puntos a resolucion de voxel razonable en GPU. La model card indica que las kernels son exclusivas de GPU ("GPU-only kernels").

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR: predice cajas 3D con orientacion para coche, peaton y ciclista.
- Extraccion de caracteristicas: el metodo `forward_features` devuelve un vector de 512 canales por objeto o region, util para tareas posteriores (clasificacion, re-identificacion, clustering).
- Procesamiento de nubes de puntos con coordenadas XYZ e intensidad (4 canales de entrada).
- Inferencia por lotes mediante el `collate` de `torch-pointcloud`, con soporte de voxelizacion y agrupacion por lotes.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de lenguaje.
- No tiene capacidades multilingues ni de texto.
- No dispone de modo "thinking", vision 2D, audio ni otras modalidades.

## Casos de uso

- Percepcion en conduccion autonoma: el modelo detecta coches, peatones y ciclistas en nubes LiDAR de KITTI, lo que permite construir un pipeline de percepcion 3D basico para prototipos de vehiculos autonomos o simuladores, con la ventaja de su bajo coste computacional (5,3 M de parametros).
- Linea base para investigacion en deteccion 3D: sirve como referencia reproducible para comparar nuevas arquitecturas (PointPillars, CenterPoint, detectores basados en transformers) sobre el mismo dataset y las mismas metricas.
- Extraccion de caracteristicas para tareas downstream: usando `forward_features`, se pueden obtener embeddings de 512 canales para alimentar clasificadores, sistemas de seguimiento de objetos (tracking) o modulos de prediccion de trayectorias.
- Robotica movil y navegacion: en robots con LiDAR, el detector puede identificar obstaculos y personas en el entorno, integrándose en bucles de planificacion de movimiento donde la latencia y el consumo de memoria son criticos.
- Analisis de escenas urbanas y movilidad: procesamiento de capturas LiDAR de entornos viarios para estudios de flujo de trafico, conteo de peatones y ciclistas, o analisis de accesibilidad.
- Docencia y formacion: por su tamano reducido y su documentacion clara (paper original, conversion desde mmdetection3d, ejemplos de uso), es adecuado para cursos de vision 3D y aprendizaje profundo sobre nubes de puntos.
- Prototipado rapido en GPU de consumo: al ser un modelo pequeno con kernels GPU, puede ejecutarse en tarjetas de gama media para pruebas de concepto sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente, `verified: false`):

| Metrica | Valor |
|---|---|
| mAP | 65,55 |
| AP/Car | 77,39 |
| AP/Cyclist | 66,32 |
| AP/Pedestrian | 52,94 |

No se han publicado en la informacion disponible otros resultados de benchmarks (por ejemplo, desgloses por dificultad facil/moderada/dificil de KITTI, ni comparaciones con otros detectores). No se inventan cifras adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5,3 M de parametros el peso de los pesos es marginal (del orden de decenas de MB en fp32), pero el consumo real depende del volumen de voxels y del tamano del lote, no solo de los parametros.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA compatible con la compilacion de `spconv`; el modelo requiere GPU ("GPU-only kernels"). No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, por el reducido numero de parametros, siempre que la version de `spconv` sea compatible con la GPU y el CUDA instalado.
- Opciones de despliegue: la libreria `torch-pointcloud` (con `spconv`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de resultados de otros detectores 3D sobre KITTI para establecer una comparativa cuantitativa fiable. Como referencia cualitativa de la categoria:

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| second.kitti.mmdet3d | 5,3 M | Nube LiDAR, 4 canales | Apache-2.0 | Hugging Face (torch-pointcloud) |
| PointPillars (mmdetection3d) | no disponible | Nube LiDAR, pilares | Apache-2.0 | mmdetection3d |
| CenterPoint (mmdetection3d) | no disponible | Nube LiDAR, voxels | Apache-2.0 | mmdetection3d |

No se han publicado en la informacion disponible cifras comparativas de rendimiento entre estos modelos; la comparativa se limita a la disponibilidad y la licencia.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en deteccion 3D sobre nubes de puntos: no procesa texto, imagenes 2D ni audio, y no debe evaluarse con criterios de modelos de lenguaje.
- Entrenado unicamente sobre KITTI: el dominio (escenas viarias alemanas, sensores concretos) puede no generalizar a otros LiDAR, densidades de puntos o entornos.
- Solo tres clases (coche, peaton, ciclista); no detecta camiones, autobuses, motocicletas ni otros objetos.
- Riesgo de falsos negativos y positivos en objetos pequenos o lejanos, comun en detectores 3D con voxelizacion; no se documentan metricas por rango de distancia.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false`); deben tomarse con cautela.
- Requiere `spconv` compilado para la version exacta de PyTorch y CUDA, lo que puede complicar el despliegue en entornos con versiones distintas.
- Dependencia de GPU: las kernels no funcionan en CPU, lo que limita el despliegue en entornos sin acelerador.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar las licencias del dataset KITTI y de las dependencias (`spconv`, `torch-pointcloud`) para produccion.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a condiciones meteorologicas o de iluminacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/second.kitti.mmdet3d
- Paper SECOND: https://www.mdpi.com/1424-8220/18/10/3337
- Repositorio de referencia mmdetection3d: https://github.com/open-mmlab/mmdetection3d
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset KITTI (paper CVPR 2012): https://www.cvlibs.net/datasets/kitti/

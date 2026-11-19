# torch-pointcloud/pointpillars.kitti.openpcdet

## Resumen

PointPillars es un detector de objetos 3D para nubes de puntos LiDAR que organiza la escena en columnas verticales (pillars) y aplica una codificacion tipo PointNet seguida de una red troncal 2D convolucional. Este checkpoint concreto, `torch-pointcloud/pointpillars.kitti.openpcdet`, es una conversion a safetensors y a la libreria `torch-pointcloud` de los pesos de referencia de OpenPCDet, entrenados sobre el dataset KITTI. Desarrollado por Arthur Dujardin bajo el espacio `torch-pointcloud`, el modelo resuelve la deteccion de coches, peatones y ciclistas en escenas de conduccion autonoma con un coste computacional muy bajo: 4,8 millones de parametros.

Su relevancia actual es practica: frente a los detectores 3D basados en transformers o en voxelizaciones densas, PointPillars sigue siendo un caballo de batalla para despliegue en tiempo real y en hardware modesto, y esta implementacion ofrece una API Python limpia (`tp.create_model`) con extraccion de caracteristicas de 384 canales, lo que facilita reutilizarlo como backbone en pipelines propios. La licencia Apache-2.0 y la procedencia desde OpenPCDet lo hacen apto para uso comercial sin fricciones.

No es un modelo de lenguaje: no procesa texto ni tiene ventana de contexto en el sentido habitual. Su entrada es una nube de puntos con coordenadas e intensidad, y su salida son cajas 3D con clase y orientacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (pillar encoder tipo PointNet + backbone 2D convolucional + cabeza de deteccion SSD-like) |
| Parametros totales | 4.840.904 (4,8 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D sobre nubes de puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases detectadas | 3 (Car, Pedestrian, Cyclist) |
| Dimension de caracteristicas | 384 |
| Dataset de entrenamiento | KITTI |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,0 GB (pesos muy ligeros) |

## Arquitectura y entrenamiento

PointPillars elimina la necesidad de voxelizar en 3D: proyecta la nube de puntos sobre una rejilla en el plano XY y agrupa los puntos de cada celda en un "pillar". Cada pillar se codifica con una capa tipo PointNet (MLP compartida mas max-pooling) en un vector de 384 dimensiones, que se dispersa de vuelta a una representacion densa 2D (pseudo-imagen). Sobre esa pseudo-imagen actua un backbone convolucional 2D con bloques de downsample y upsampling y conexiones de salto, y finalmente una cabeza de deteccion tipo SSD predice clase, offset de caja, dimensiones, altura y angulo de orientacion (con la parametrizacion por seno/coseno habitual para resolver la ambiguedad angular).

El checkpoint se ha entrenado sobre KITTI, el benchmark clasico de conduccion autonoma con anotaciones 3D en coordenadas de camara LiDAR. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si hubo aumentos de datos especificos, fases de refinamiento o tecnicas de ensemble en test. La conversion procede de OpenPCDet (Apache-2.0) y se ha reempaquetado en `torch-pointcloud`, que expone tanto `forward` completo como `forward_features` para extraer los 384 canales del backbone. No se documenta decodificacion especulativa, atencion lineal ni innovaciones de inferencia mas alla del propio diseno de pillars, que ya es en si la innovacion clave del paper original (2019) al permitir convoluciones 2D en lugar de 3D.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con cajas orientadas (7 grados de libertad: centro, dimensiones y angulo).
- Clasificacion en tres categorias: coche, peaton y ciclista.
- Regresion de atributos geometricos: dimensiones de la caja, offset respecto al centro del pillar y orientacion.
- Extraccion de caracteristicas densas de 384 canales mediante `forward_features`, util como representacion intermedia para tareas posteriores.
- Procesamiento por lotes con `collate` y `batch_from="pos_voxel"`, apto para inferencia en GPU con tensores dispersos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No tiene capacidades multilingues ni de texto.
- No incluye modo "thinking", vision 2D, audio ni otras modalidades.

## Casos de uso

- Percepcion en vehiculos autonomos y ADAS: el modelo detecta coches, peatones y ciclistas en tiempo real con solo 4,8 M de parametros, lo que permite ejecutarlo en la unidad de a bordo junto a otros modulos de planificacion.
- Robotica movil en interiores y exteriores: integrado en la pila de percepcion de un robot con LiDAR, proporciona cajas 3D para evitar obstaculos dinamicos con latencia baja.
- Preetiquetado y anotacion semiautomatica: `forward_features` permite generar propuestas de cajas 3D sobre nuevas grabaciones y reducir el trabajo manual de etiquetado, que es el cuello de botella en datasets de conduccion.
- Baseline academico y reproduccion de resultados: al ser una conversion directa de OpenPCDet sobre KITTI, sirve para comparar nuevas arquitecturas contra un punto de referencia bien conocido y reproducible.
- Extraccion de caracteristicas para modelos posteriores: los 384 canales del backbone pueden alimentar clasificadores de escena, segmentacion o tareas de prediccion de trayectorias.
- Despliegue en hardware de borde: su tamano (0,0 GB de repo) y su backbone 2D lo hacen viable en GPUs de gama media o incluso en plataformas embebidas con aceleracion, donde los detectores 3D densos no caben.
- Vigilancia y analitica de trafico: deteccion de peatones y ciclistas en intersecciones monitorizadas con LiDAR para estudios de movilidad o seguridad vial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre KITTI (no verificados, `verified: false`):

| Metrica | Valor |
|---|---|
| mAP | 64,16 |
| AP/Car | 77,35 |
| AP/Pedestrian | 52,39 |
| AP/Cyclist | 62,74 |

No se han publicado en la informacion disponible resultados de latencia, throughput ni comparaciones directas con otras implementaciones de PointPillars.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 4,8 M de parametros, los pesos en FP32 ocupan aproximadamente 19 MB; el consumo dominante es la pseudo-imagen intermedia y los tensores de pillars, no los pesos. Cabe holgadamente en cualquier GPU con 2 GB o mas.
- GPU recomendadas: RTX 3060/4060 y superiores para desarrollo; A100, H100 o L4 para despliegue en servidor con lotes grandes. Tambien funciona en CPU para pruebas, con latencia mayor.
- Cabe en GPU de consumo: si, en practicamente todas las GPU NVIDIA modernas, incluidas las de portatil con poca VRAM.
- Opciones de despliegue: la via documentada es la libreria `torch-pointcloud` (`pip install torch-pointcloud`). No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | mAP KITTI (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointpillars.kitti.openpcdet (este) | 4,8 M | LiDAR, 4 canales | 64,16 | Apache-2.0 | Hugging Face, via torch-pointcloud |
| PointPillars original (OpenPCDet) | ~4,8 M | LiDAR, 4 canales | no disponible en esta ficha | Apache-2.0 | GitHub open-mmlab/OpenPCDet |
| Otros detectores 3D de OpenPCDet (SECOND, PV-RCNN, CenterPoint) | no disponible | LiDAR | no disponible en esta ficha | Apache-2.0 | GitHub open-mmlab/OpenPCDet |

La comparacion cuantitativa con SECOND, PV-RCNN o CenterPoint no puede establecerse con los datos disponibles; en terminos cualitativos, esos detectores suelen superar a PointPillars en precision a costa de mayor coste computacional y complejidad de despliegue.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre KITTI: la generalizacion a otros sensores, densidades de puntos o entornos (nieve, lluvia, escenas interiores) no esta validada y probablemente degrade.
- Solo tres clases (Car, Pedestrian, Cyclist); no detecta camiones, autobuses, motocicletas ni senalizacion.
- Los valores de benchmark estan marcados como no verificados por el autor; conviene reproducirlos antes de usarlos como referencia en publicaciones.
- La nube de puntos debe preprocesarse con la transformacion que expone `info["transform"]`; usar otra voxelizacion o rango altera los resultados.
- Riesgo de falsos negativos en objetos pequenos o lejanos, limitacion inherente a la resolucion de la rejilla de pillars.
- No hay informacion sobre sesgos demograficos o de escena, pero al entrenarse con KITTI (ciudades alemanas en condiciones diurnas) es esperable un sesgo hacia ese dominio.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; no impone restricciones de campo de uso, pero el usuario debe cumplir la normativa aplicable en conduccion autonoma y proteccion de datos.
- Alucinacion en el sentido generativo no aplica; el riesgo equivalente son detecciones espurias en zonas con retorno LiDAR escaso o ruidoso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointpillars.kitti.openpcdet
- Paper PointPillars (arXiv:1812.05784): https://arxiv.org/abs/1812.05784
- Repositorio OpenPCDet: https://github.com/open-mmlab/OpenPCDet
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset KITTI: https://www.cvlibs.net/datasets/kitti/

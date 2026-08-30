# torch-pointcloud/spvcnn-119gmacs.semantickitti.mit-han-lab

## Resumen

El modelo `spvcnn-119gmacs.semantickitti.mit-han-lab` es un modelo de segmentación semántica de nubes de puntos 3D basado en la arquitectura SPVCNN (Sparse Point-Voxel Convolution), desarrollado por el grupo MIT Han Lab y convertido a la librería `torch-pointcloud` por Arthur Dujardin. El modelo resuelve el problema de asignar una etiqueta semántica (coche, peatón, carretera, etc.) a cada punto de una nube de puntos LiDAR, una tarea fundamental en percepción para vehículos autónomos, robótica y cartografía 3D.

La arquitectura combina convoluciones dispersas en voxeles con operaciones sobre puntos, logrando un equilibrio entre eficiencia computacional y precisión. El modelo tiene 21,8 millones de parámetros, fue entrenado sobre el dataset SemanticKITTI y alcanza un mIoU de 63,74 en la tarea de segmentación semántica. Su relevancia radica en que es un checkpoint oficial de referencia, listo para usar con la librería `torch-pointcloud`, y representa un punto de partida sólido para investigación y aplicaciones industriales en percepción 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPVCNN (Sparse Point-Voxel Convolution) |
| Parametros totales | 21.791.251 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision 3D, no textual) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura SPVCNN propuesta en el artículo "Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution" (ECCV 2020). Esta arquitectura combina dos representaciones complementarias: por un lado, voxeliza la nube de puntos para aplicar convoluciones 3D dispersas (sparse convolutions) que capturan contexto espacial a gran escala de forma eficiente; por otro, opera directamente sobre los puntos originales para preservar la resolución geométrica fina. El resultado es una red que procesa nubes de puntos de forma jerárquica, con un coste computacional reducido frente a las convoluciones densas.

El entrenamiento se realizó sobre el dataset SemanticKITTI, que contiene secuencias LiDAR de escenas urbanas anotadas con 19 clases semánticas. El modelo fue generado mediante búsqueda de arquitectura neuronal (NAS) optimizando el equilibrio entre precisión y coste computacional (119 GMACs). El checkpoint disponible es una conversión del modelo original de `mit-han-lab/spvnas` a la librería `torch-pointcloud`, que requiere `torchsparse` para los kernels CUDA. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO, al tratarse de un modelo de percepción 3D supervisado de forma clásica.

## Capacidades

- Segmentación semántica punto a punto en nubes de puntos LiDAR, asignando una de las 19 clases de SemanticKITTI a cada punto.
- Extracción de características por punto (features de 96 dimensiones) mediante el método `forward_features`, útil para tareas downstream como detección de objetos o agrupamiento.
- Clasificación flexible: el método `reset_classifier` permite adaptar el modelo a un número distinto de clases sin reentrenar toda la red.
- Procesamiento de nubes de puntos con 4 canales de entrada (coordenadas x, y, z e intensidad).
- Inferencia eficiente gracias a las convoluciones dispersas, con un coste de 119 GMACs.
- Integración nativa con la librería `torch-pointcloud`, que proporciona transformaciones, collate y utilidades de carga de datos.
- Compatible con GPU gracias a los kernels de `torchsparse` (no funciona en CPU).

## Casos de uso

- Percepción para vehículos autónomos: el modelo puede segmentar en tiempo real las nubes de puntos LiDAR de un vehículo para identificar carretera, vehículos, peatones y otros elementos, alimentando los módulos de planificación y evitación de obstáculos. Su coste de 119 GMACs lo hace adecuado para inferencia en hardware embarcado.
- Robótica móvil y drones: en entornos interiores o exteriores, el modelo permite a un robot comprender su entorno (suelo, paredes, objetos) para navegación autónoma o manipulación. La extracción de características por punto facilita la integración con algoritmos de SLAM.
- Cartografía y modelado urbano: a partir de datos LiDAR de escáneres móviles o aéreos, el modelo puede etiquetar automáticamente edificios, vegetación, vehículos y otros elementos, acelerando la generación de mapas 3D semánticos para ciudades digitales.
- Análisis de entornos industriales: en almacenes o plantas de producción, la segmentación de nubes de puntos permite monitorizar la ubicación de mercancías, maquinaria o personas, mejorando la seguridad y la logística.
- Investigación en visión 3D: el checkpoint sirve como baseline reproducible para comparar nuevas arquitecturas o técnicas de segmentación. Su licencia MIT y su integración con `torch-pointcloud` facilitan su uso en experimentos académicos.
- Sistema de extracción de características para detección de objetos: usando `forward_features`, el modelo puede generar descriptores por punto que se alimentan a redes de propuesta de objetos (como PointRCNN) para detectar y clasificar objetos 3D en escenas LiDAR.

## Benchmarks y rendimiento

El modelo declara un mIoU de 63,74 en el dataset SemanticKITTI (tarea de segmentación semántica de nubes de puntos). Este valor coincide con la referencia del artículo original (63,8). No se han publicado resultados adicionales en la model card.

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| SemanticKITTI | Segmentacion semantica de nubes de puntos | mIoU | 63,74 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- El modelo tiene 21,8 millones de parametros, por lo que su huella de memoria es reducida. Los pesos en safetensors ocupan aproximadamente 87 MB.
- Requiere GPU con soporte CUDA, ya que los kernels de `torchsparse` son exclusivamente GPU. No es posible ejecutarlo en CPU.
- VRAM estimada: menos de 2 GB para inferencia en lotes pequeños (una nube de puntos de 8192 puntos), por lo que es ejecutable en GPUs de gama media como NVIDIA GTX 1660, RTX 2060 o superiores.
- GPU recomendada: cualquier GPU NVIDIA con al menos 4 GB de VRAM para mayor comodidad, por ejemplo RTX 3060, RTX 3090 o A100 en entornos de servidor.
- Opciones de despliegue: se usa a traves de la libreria `torch-pointcloud` con PyTorch. No se mencionan integraciones con vLLM, llama.cpp u Ollama (modelos no textuales).
- Latencia: no disponible en la informacion proporcionada, pero dado el coste de 119 GMACs, se espera una inferencia en tiempo real (decenas de milisegundos) en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Modelos alternativos para segmentacion semantica de nubes de puntos incluyen:

- PointNet++ (Qi et al., 2017): arquitectura clasica basada en MLPs sobre vecindades, sin convoluciones voxel. Menos eficiente en nubes grandes.
- SalsaNext (Cortinhal et al., 2020): red basada en proyeccion 2D del LiDAR, rapida pero con menor precision en clases pequenas.
- MinkowskiNet (Choy et al., 2019): usa convoluciones dispersas genericas, similar a SPVCNN pero sin la rama de puntos.

No se dispone de tablas de rendimiento comparativo en la documentacion del modelo.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente en SemanticKITTI, por lo que su rendimiento puede degradarse en otros sensores LiDAR (diferentes lineas, densidades) o en entornos muy distintos (campo abierto, nieve, lluvia intensa).
- Las 19 clases de SemanticKITTI no cubren todas las categorias posibles; objetos poco frecuentes o clases no anotadas seran etiquetados como "otro" o "desconocido".
- Requiere `torchsparse`, cuya compilacion depende de la version de PyTorch y CUDA. Esto puede dificultar la portabilidad a entornos sin acceso a compilacion o con versiones antiguas.
- No es un modelo multimodal ni de lenguaje; no aplica para tareas de texto o vision 2D.
- La licencia MIT permite uso comercial sin restricciones, pero el dataset SemanticKITTI tiene su propia licencia de uso (no comercial para fines academicos, aunque existe una version comercial). Verificar los terminos de SemanticKITTI antes de uso en produccion.
- El modelo no incluye mecanismos de incertidumbre ni calibracion; las predicciones pueden ser sobreconfiadas en areas con datos escasos.
- No se proporcionan garantias de soporte o mantenimiento por parte del autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/torch-pointcloud/spvcnn-119gmacs.semantickitti.mit-han-lab)
- [Organizacion torch-pointcloud en HuggingFace](https://huggingface.co/torch-pointcloud)
- [Repositorio original mit-han-lab/spvnas](https://github.com/mit-han-lab/spvnas)
- [Articulo "Searching Efficient 3D Architectures with Sparse Point-Voxel Convolution"](https://arxiv.org/abs/2007.16100)
- [Libreria torch-pointcloud en GitHub](https://github.com/arthurdjn/pytorch-pointcloud)
- [Documentacion de instalacion de torch-pointcloud](https://pytorch-pointcloud.org/installation/)
- [Dataset SemanticKITTI](https://semantic-kitti.org/)

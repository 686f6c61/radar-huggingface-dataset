# torch-pointcloud/3detr-m.sunrgbd.fair

## Resumen

3detr-m.sunrgbd.fair es un modelo de deteccion de objetos 3D basado en 3DETR (3D Detection Transformer), una arquitectura de deteccion end-to-end con paradigma de prediccion de conjuntos (set prediction) que prescinde de componentes heuristicos como anchors o supresion no maxima (NMS). Lo publica el proyecto torch-pointcloud (Arthur Dujardin) como conversion de los pesos originales de facebookresearch/3detr, y se distribuye bajo licencia Apache-2.0.

El modelo esta entrenado sobre el dataset SUN RGB-D, un benchmark de comprension de escenas RGB-D de interior con anotaciones de cajas 3D orientadas. Detecta 10 clases de objetos y trabaja directamente sobre nubes de puntos (coordenadas xyz mas color RGB), no sobre imagenes. Con 7,4 millones de parametros y 256 canales de caracteristicas, es un modelo muy ligero, pensado para investigacion y prototipado en percepcion 3D mas que para despliegues de gran escala.

Su relevancia actual radica en que ofrece una implementacion reproducible y empaquetada (via `torch-pointcloud`) de un detector transformer 3D clasico, con metricas declaradas en la model card (mAP@0.25 de 59,13 y mAP@0.5 de 32,26 en SUN RGB-D), lo que facilita la comparacion y el reentrenamiento sin tener que reconstruir el pipeline original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer 3D end-to-end con set prediction (3DETR) |
| Parametros totales | 7.451.113 (7,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre nubes de puntos de 8192 puntos en el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision 3D, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria torch-pointcloud) |
| Clases detectadas | 10 |
| Canales de caracteristicas | 256 |
| Dataset de entrenamiento | SUN RGB-D |

## Arquitectura y entrenamiento

3DETR es un detector transformer que trata la deteccion 3D como un problema de prediccion de conjuntos: un encoder transformer procesa los tokens de la nube de puntos y un decoder genera directamente un conjunto fijo de cajas 3D con sus clases, eliminando la necesidad de anchors, propuestas o NMS. El modelo de esta ficha emplea 256 canales de caracteristicas y un total de 7,4 M de parametros, lo que lo situa entre los detectores 3D mas compactos de su familia.

El entrenamiento se realizo sobre SUN RGB-D, un benchmark de escenas interiores RGB-D con 10 clases de objetos anotadas con cajas 3D. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron fases de refinamiento adicionales; estos datos figuran como no disponibles. Los pesos proceden de la conversion del repositorio oficial facebookresearch/3detr (Apache-2.0) al formato de la libreria torch-pointcloud, que expone ademas extraccion de caracteristicas de 256 canales mediante `forward_features`.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos: predice cajas 3D orientadas con clase para 10 categorias de objetos de interior.
- Entrada multimodal a nivel de punto: acepta coordenadas xyz y color RGB por punto (segun el ejemplo de uso, 8192 puntos).
- Prediccion de conjuntos end-to-end: no requiere anchors ni NMS en post-proceso.
- Extraccion de caracteristicas: `forward_features` devuelve representaciones de 256 canales por punto, reutilizables en tareas downstream.
- Integracion con PyTorch: API `tp.create_model` con carga de pesos preentrenados y transformaciones de datos incluidas.
- Sin soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de vision 3D.
- Sin modo thinking, vision 2D, audio ni generacion de texto.

## Casos de uso

- Deteccion de objetos en escenas interiores robotizadas: el modelo procesa nubes de puntos de sensores RGB-D (tipo Kinect o Realsense) y devuelve cajas 3D de 10 clases, adecuado para navegacion y manipulacion en interiores.
- Prototipado rapido de pipelines de percepcion 3D: al ser un modelo de 7,4 M de parametros con API de una linea (`tp.create_model`), permite validar un pipeline completo de deteccion 3D en pocas horas.
- Baseline academico para investigacion en deteccion 3D: sus metricas declaradas en SUN RGB-D (mAP@0.25 59,13; mAP@0.5 32,26) sirven como referencia para comparar nuevas arquitecturas.
- Extraccion de caracteristicas para tareas downstream: las representaciones de 256 canales por punto pueden alimentar clasificadores de escena, segmentacion o modelos de reconstruccion.
- Reentrenamiento y fine-tuning sobre dominios propios: la licencia Apache-2.0 y el bajo coste computacional permiten adaptar el modelo a nuevos datasets de nubes de puntos sin restricciones comerciales.
- Analisis de escenas en realidad aumentada: deteccion de muebles y objetos para colocacion de contenido virtual en entornos interiores capturados con RGB-D.
- Educacion y docencia: ejemplo compacto y reproducible de deteccion 3D con transformers, con pesos publicados y codigo de carga documentado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| SUN RGB-D | mAP@0.25 | 59,13 |
| SUN RGB-D | mAP@0.5 | 32,26 |

No se han publicado en la informacion disponible resultados adicionales (por ejemplo, por clase, latencia o throughput) ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 7,4 M de parametros en precision completa el peso ocupa aproximadamente 30 MB, y el consumo dominante proviene de la nube de puntos de entrada (8192 puntos) y de las activaciones del transformer.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU consumer con soporte CUDA (GTX 1650 en adelante).
- Opciones de despliegue: la libreria oficial es `torch-pointcloud` sobre PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mAP@0.25 | mAP@0.5 | Licencia |
|---|---|---|---|---|---|
| 3detr-m.sunrgbd.fair | 7,4 M | SUN RGB-D | 59,13 | 32,26 | Apache-2.0 |
| 3DETR original (facebookresearch) | no disponible en la informacion | SUN RGB-D | no disponible | no disponible | Apache-2.0 |
| Otros detectores 3D (VoteNet, Group-Free 3D) | no disponible en la informacion | SUN RGB-D | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados comparables de otros detectores 3D sobre SUN RGB-D, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente en SUN RGB-D (escenas interiores), por lo que su rendimiento fuera de ese dominio (exteriores, industria, conduccion) no esta garantizado.
- Solo 10 clases: la granularidad semantica es limitada frente a detectores con vocabularios mayores.
- Metricas no verificadas: los valores de mAP de la model card estan marcados como `verified: false`; conviene reproducirlos antes de usarlos como referencia en produccion.
- Sin informacion sobre sesgos: la model card no documenta sesgos conocidos ni analisis de robustez.
- Riesgo de falsos positivos y omisiones en escenas con oclusiones o puntos dispersos, inherente a los detectores 3D sobre nubes de puntos.
- Sin soporte linguistico ni multimodalidad texto: no puede usarse para tareas de lenguaje, agentes o tool calling.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero se recomienda conservar la atribucion a los autores originales (Misra et al.) y al proyecto torch-pointcloud.
- Dependencia de la libreria `torch-pointcloud`: la API de carga y las transformaciones de datos son especificas de esa libreria, lo que puede complicar la portabilidad a otros frameworks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/3detr-m.sunrgbd.fair
- Paper 3DETR (arXiv:2109.08141): https://arxiv.org/abs/2109.08141
- Repositorio original facebookresearch/3detr: https://github.com/facebookresearch/3detr
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632
- Dataset SUN RGB-D (paper CVPR 2015): no disponible como enlace directo en la informacion proporcionada

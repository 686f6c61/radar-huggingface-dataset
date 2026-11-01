# torch-pointcloud/recon.scanobjectnn-hardest.zekun-qi

## Resumen

recon.scanobjectnn-hardest.zekun-qi es un modelo de clasificación de nubes de puntos 3D, no un modelo de lenguaje. Se trata de un checkpoint de ajuste fino (fine-tuning) del modelo ReCon, una arquitectura de transformer de puntos enmascarado con consultas contrastivas cross-modales, desarrollada por Zekun Qi y colaboradores y publicada en ICML 2023 bajo el título "Contrast with Reconstruct". El modelo parte del checkpoint preentrenado torch-pointcloud/recon.pretrain.zekun-qi y se ha ajustado sobre la partición más difícil del dataset ScanObjectNN (PB_T50_RS), que contiene objetos 3D reales con oclusión y perturbaciones.

El modelo resuelve la tarea de clasificar nubes de puntos 3D en 15 categorías de objetos, y su relevancia radica en que ReCon combina el aprendizaje contrastivo con el generativo: el preentrenamiento reconstruye puntos enmascarados mientras alinea representaciones con consultas cross-modales, lo que produce representaciones 3D transferibles. Con 43,6 millones de parámetros y una dimensión de características de 1536, es un modelo compacto orientado a visión 3D y robótica más que a procesamiento de lenguaje natural.

Este checkpoint concreto se distribuye a través de la librería torch-pointcloud de Arthur Dujardin, que facilita la carga y el uso del modelo en PyTorch, y declara unos resultados de 90,56 de overall accuracy (OA) y 89,39 de mean accuracy (mAcc) en ScanObjectNN PB_T50_RS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de puntos enmascarado con consultas contrastivas cross-modales (ReCon) |
| Parametros totales | 43.573.519 (43,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de nubes de puntos, no de texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (modelo 3D sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,2 GB) |
| Clases de salida | 15 |
| Dimension de caracteristicas | 1536 |
| Puntos de entrada | 8192 (segun el ejemplo de uso de la model card) |
| Dataset de ajuste fino | ScanObjectNN (PB_T50_RS) |
| Libreria | torch-pointcloud (PyTorch) |

## Arquitectura y entrenamiento

ReCon es un transformer de nubes de puntos que combina dos objetivos durante el preentrenamiento: un objetivo generativo de reconstruccion de puntos enmascarados (masked point modeling) y un objetivo contrastivo guiado por consultas cross-modales. Las consultas contrastivas se derivan de la informacion reconstruida, de modo que el modelo aprende representaciones que preservan tanto la geometria local como la semantica global del objeto. El checkpoint base es torch-pointcloud/recon.pretrain.zekun-qi, preentrenado de forma auto-supervisada, y este modelo es el resultado del ajuste fino supervisado sobre ScanObjectNN.

El ajuste fino se realiza sobre la particion PB_T50_RS de ScanObjectNN, que es la variante mas exigente del benchmark: objetos 3D reales escaneados, con perturbaciones, oclusiones y ruido, y 15 clases. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a esta tarea). La conversion a la libreria torch-pointcloud se realiza a partir del repositorio original qizekun/ReCon, distribuido bajo licencia MIT.

## Capacidades

- Clasificacion de nubes de puntos 3D en 15 categorias de objetos (tarea point-cloud-classification).
- Extraccion de caracteristicas: el metodo forward_features y reset_classifier(num_classes=0) permiten obtener embeddings de 1536 dimensiones por muestra para tareas downstream.
- Procesamiento de nubes de puntos con 8192 puntos de entrada y coordenadas (x, y, z) mediante la clave "pos".
- Aprendizaje de representaciones 3D transferibles gracias al preentrenamiento contrastivo-generativo de ReCon.
- Soporte de inferencia por lotes mediante la funcion collate de torch-pointcloud, que construye el tensor de batch.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision 2D, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Clasificacion de objetos en escaneos 3D: el modelo recibe nubes de puntos de 8192 puntos y devuelve logits sobre 15 clases, util para inventariar objetos en escenas capturadas con LiDAR o camaras de profundidad.
- Robótica de percepcion: reconocimiento de objetos sobre la marcha para tareas de manipulacion o navegacion, aprovechando el bajo coste computacional de un modelo de 43,6 M de parametros.
- Extraccion de embeddings para busqueda o clustering: usando reset_classifier(num_classes=0) se obtienen vectores de 1536 dimensiones que sirven para recuperacion de objetos 3D o agrupamiento no supervisado.
- Preentrenamiento de modelos downstream: las representaciones de ReCon pueden inicializar clasificadores o segmentadores de nubes de puntos en dominios con pocos datos etiquetados.
- Control de calidad en fabricacion: clasificacion de piezas escaneadas en 3D para detectar categorias o piezas anomalas en linea de produccion.
- Vehiculos autonomos y mapeado: identificacion de clases de objetos en datos de sensores 3D para enriquecer mapas semanticos o sistemas de deteccion.
- Prototipado rapido en investigacion: al cargarse con tp.create_model en una sola linea, sirve como baseline reproducible para experimentos de vision 3D con ScanObjectNN.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados) en el model-index de la model card:

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| ScanObjectNN (PB_T50_RS) | point-cloud-classification | OA (accuracy) | 90,56 |
| ScanObjectNN (PB_T50_RS) | point-cloud-classification | mAcc (accuracy) | 89,39 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, en ModelNet40 u otras particiones de ScanObjectNN) en la informacion disponible. Los valores anteriores proceden del model-index declarado por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 43,6 M de parametros, los pesos en precision FP32 ocupan aproximadamente 0,17 GB; en FP16 unos 0,09 GB. El consumo real lo domina la nube de puntos de entrada (8192 puntos por muestra) y los mapas de activacion, por lo que un lote pequeno cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia con lotes moderados; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Para entrenamiento o lotes grandes se recomienda una GPU con 16 GB o mas.
- Cabe en GPU consumer: si, en practicamente todas las GPU NVIDIA consumer modernas, dado el tamano reducido del modelo.
- Opciones de despliegue: la via documentada es la libreria torch-pointcloud sobre PyTorch (pip install torch-pointcloud). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje y no aplican a este modelo 3D.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible no incluye resultados de modelos alternativos sobre ScanObjectNN PB_T50_RS, por lo que la comparacion numerica no puede completarse sin inventar datos. Se ofrece una comparacion estructural:

| Modelo | Parametros | Contexto / entrada | OA en ScanObjectNN PB_T50_RS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| recon.scanobjectnn-hardest.zekun-qi | 43,6 M | Nube de 8192 puntos | 90,56 (declarado, no verificado) | MIT | HuggingFace (torch-pointcloud) |
| PointNet++ (referencia clasica) | No disponible | Nube de puntos | No disponible | No disponible | Implementaciones multiples |
| Point Transformer (referencia) | No disponible | Nube de puntos | No disponible | No disponible | Implementaciones multiples |
| ReCon (checkpoint original qizekun/ReCon) | No disponible | Nube de puntos | No disponible | MIT | GitHub |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada; los valores de la tabla para dichos modelos se marcan como no disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente sobre ScanObjectNN (15 clases de objetos escaneados); su comportamiento fuera de esa distribucion de clases y sensores es incierto.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el clasificador puede asignar una de las 15 clases con alta confianza a objetos que no pertenecen a ninguna de ellas (falsos positivos fuera de distribucion).
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni tiene capacidades multilingues. La entrada esta limitada a nubes de puntos con la estructura esperada (clave "pos" y batch construido con collate).
- Robustez: la particion PB_T50_RS es la mas dificil de ScanObjectNN, con oclusion y perturbaciones; el rendimiento puede degradarse en escaneos con ruido o densidades de puntos distintas de las de entrenamiento.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; debe conservarse el aviso de copyright y citar el trabajo original.
- Caveats para produccion: los resultados de benchmarks son declarados por el autor y no verificados; la libreria torch-pointcloud es un proyecto de terceros (Arthur Dujardin) y la API puede cambiar; el pipeline de HuggingFace no esta definido para este modelo, por lo que la carga debe hacerse mediante la libreria torch-pointcloud y no con transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/torch-pointcloud/recon.scanobjectnn-hardest.zekun-qi
- Modelo base preentrenado: https://huggingface.co/torch-pointcloud/recon.pretrain.zekun-qi
- Paper ReCon (ICML 2023): https://arxiv.org/abs/2302.02318
- Repositorio original ReCon: https://github.com/qizekun/ReCon
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria torch-pointcloud: https://doi.org/10.5281/zenodo.22159632
- Dataset ScanObjectNN (paper ICCV 2019): no se proporciona enlace directo en la informacion disponible

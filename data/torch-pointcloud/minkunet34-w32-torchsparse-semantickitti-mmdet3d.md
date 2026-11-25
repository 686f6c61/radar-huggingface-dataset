# torch-pointcloud/minkunet34-w32-torchsparse.semantickitti.mmdet3d

## Resumen

MinkUNet34-W32 es un modelo de segmentación semántica de nubes de puntos LiDAR, implementado como una U-Net residual dispersa (sparse residual U-Net) sobre convoluciones de Minkowski. Lo desarrolla el proyecto torch-pointcloud (Arthur Dujardin) y este checkpoint concreto se ha convertido desde MMDetection3D, donde se entrenó originalmente sobre el dataset SemanticKITTI. El modelo resuelve la tarea de asignar una clase semántica a cada punto de una escena LiDAR (19 clases: coche, peatón, bicicleta, carretera, edificio, vegetación, etc.), un problema central en percepción para conducción autónoma, robótica móvil y cartografía 3D.

La arquitectura sigue el diseño MinkUNet propuesto en el paper "4D Spatio-Temporal ConvNets: Minkowski Convolutional Neural Networks" (Choy et al., CVPR 2019), adaptado a la variante de 34 capas con ancho de features 32. Cuenta con 37,9 millones de parámetros, 4 canales de entrada (x, y, z, intensidad) y una cabeza de clasificación de 19 clases. El checkpoint se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache-2.0, lo que facilita su uso comercial.

Su relevancia actual radica en que ofrece un baseline sólido y reproducible de segmentación LiDAR con un rendimiento declarado de 68,91 mIoU y 92,49 % de accuracy global en SemanticKITTI, empaquetado en una librería Python (`torch-pointcloud`) que abstrae la construcción del modelo y el preprocesado. Es una pieza útil para pipelines de percepción 3D, extracción de features y comparación de arquitecturas dispersas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MinkUNet34-W32 (U-Net residual dispersa sobre convoluciones de Minkowski, spconv/torchsparse) |
| Parametros totales | 37.892.787 (37,9 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de nubes de puntos; procesa conjuntos de puntos, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Canales de entrada | 4 (x, y, z, intensidad) |
| Clases de salida | 19 (SemanticKITTI) |
| Ancho de features | 96 (features de la cabeza) |
| Dataset de entrenamiento | SemanticKITTI |
| Libreria | torch-pointcloud (requiere spconv compilado para la version de torch/CUDA) |

## Arquitectura y entrenamiento

El modelo es una U-Net residual dispersa de 34 capas construida con convoluciones de Minkowski, que operan únicamente sobre vóxeles ocupados en lugar de densificar toda la rejilla 3D. Esto reduce drásticamente el coste computacional y la memoria frente a convoluciones 3D densas, algo crítico en nubes de puntos LiDAR con millones de puntos y alta dispersión espacial. La red emplea un encoder con bloques residuales y un decoder con conexiones skip, y produce logits por punto para las 19 clases de SemanticKITTI.

El entrenamiento se realizó sobre SemanticKITTI, el benchmark de referencia para segmentación semántica de secuencias LiDAR de KITTI, con 4 canales de entrada (coordenadas e intensidad). Este checkpoint procede de la implementación de MMDetection3D (Apache-2.0) y ha sido convertido al formato de `torch-pointcloud`. No se detallan en la información disponible el número exacto de tokens/puntos de entrenamiento, la composición precisa del dataset ni si se aplicaron técnicas de aumento de datos o ajuste fino adicional más allá de lo que define el pipeline de MMDetection3D. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, que no aplican a este tipo de arquitectura.

## Capacidades

- Segmentación semántica de nubes de puntos LiDAR en 19 clases (coche, camión, autobús, persona, ciclista, motocicleta, carretera, acera, edificio, valla, vegetación, tronco, terreno, poste, señal de tráfico, etc.).
- Procesamiento de nubes de puntos dispersas de forma eficiente mediante convoluciones de Minkowski (spconv).
- Extracción de features por punto: la cabeza puede sustituirse por una identidad (`reset_classifier(num_classes=0)`) para obtener embeddings de 96 dimensiones por punto, útiles para tareas downstream.
- Entrada multimodal básica a nivel de punto: coordenadas (x, y, z) e intensidad de retorno LiDAR.
- Ejecución GPU-only: los kernels de spconv requieren CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Percepción para conducción autónoma: el modelo etiqueta cada punto de la nube LiDAR con su clase semántica, permitiendo a un vehículo autónomo distinguir carretera, peatones, vehículos y obstáculos en tiempo real, aprovechando su eficiencia sobre vóxeles dispersos.
- Anotación automática de datasets 3D: pre-etiquetar grandes volúmenes de nubes de puntos LiDAR para acelerar la creación de datasets de percepción, reduciendo el coste de anotación manual.
- Robótica móvil indoor/outdoor: segmentación del entorno para navegación segura, detección de suelo transitable, obstáculos y estructuras en robots con LiDAR.
- Cartografía y modelado urbano: clasificación de edificios, vegetación, terreno y mobiliario urbano a partir de levantamientos LiDAR para gemelos digitales y SIG 3D.
- Extracción de features para modelos downstream: usar los embeddings de 96 dimensiones por punto como entrada a clasificadores de escena, detectores 3D o modelos de segmentación de instancias.
- Baseline y comparación de arquitecturas: referencia reproducible para evaluar nuevas arquitecturas de segmentación LiDAR (sparse convs, transformers 3D) sobre SemanticKITTI con métricas estándar (mIoU, OA).
- Investigación en percepción 3D: punto de partida para experimentos de destilación, compresión o adaptación de dominio en segmentación de nubes de puntos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| SemanticKITTI | mIoU | 68,91 |
| SemanticKITTI | OA (accuracy global) | 92,49 |

No se han publicado en la información disponible resultados adicionales (por clase, latencia, throughput) ni comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 37,9 M de parámetros y kernels dispersos, el consumo depende fuertemente del número de puntos y del tamaño de vóxel. Para nubes de decenas de miles de puntos, es habitual que quepa en GPUs de 8-16 GB, pero no hay cifra confirmada.
- GPU recomendadas: no disponible. Al requerir CUDA y spconv, se recomienda una GPU NVIDIA con drivers y CUDA compatibles con la versión de spconv compilada (por ejemplo, RTX 3090/4090, A100, H100 según el tamaño de lote).
- Cabe en GPU consumer: probablemente sí en RTX 3060/4060 y superiores para lotes pequeños, aunque no confirmado en la información disponible.
- Opciones de despliegue: `torch-pointcloud` (con `spconv`), PyTorch nativo; no se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset | mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinkUNet34-W32 (este) | 37,9 M | SemanticKITTI | 68,91 | Apache-2.0 | Hugging Face, torch-pointcloud |
| MinkUNet (variantes MMDetection3D) | similar | SemanticKITTI | no disponible en la informacion | Apache-2.0 | MMDetection3D |
| Otras arquitecturas de segmentacion LiDAR (Cylinder3D, SPVCNN, RangeNet++) | no disponible | SemanticKITTI | no disponible en la informacion | variable | variable |

No se dispone en la información proporcionada de cifras de benchmarks de modelos alternativos para una comparación cuantitativa rigurosa; se indica "no disponible" en lugar de inventar valores.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de nubes de puntos; no es un modelo de lenguaje ni soporta texto, tool calling o agentes.
- Rendimiento limitado al dominio de SemanticKITTI (escenas urbanas y de carretera con LiDAR de KITTI); puede degradarse en otros sensores, densidades, entornos indoor o condiciones meteorológicas adversas.
- Riesgo de confusión entre clases similares (por ejemplo, vegetación vs. tronco, o tipos de vehículos) y de errores en puntos alejados o con baja densidad.
- Requiere kernels CUDA y `spconv` compilado para la combinación exacta de PyTorch y CUDA; la instalación puede ser frágil y no funciona en CPU.
- Los resultados de benchmarks están declarados por el autor y no verificados (`verified: false`); deben tomarse como referencia, no como cifra auditada.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (spconv, MMDetection3D) y del dataset SemanticKITTI para usos concretos.
- No se documentan sesgos específicos ni evaluaciones de robustez; en producción conviene validar sobre datos propios antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/minkunet34-w32-torchsparse.semantickitti.mmdet3d
- Paper Minkowski Convolutional Neural Networks: https://arxiv.org/abs/1904.08755
- Paper SemanticKITTI: https://arxiv.org/abs/1904.08755 (referencia citada en la model card para Minkowski; SemanticKITTI en ICCV 2019)
- Repositorio torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Documentación torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- MMDetection3D (origen del checkpoint): https://github.com/open-mmlab/mmdetection3d
- DOI Zenodo de PyTorch PointCloud: https://doi.org/10.5281/zenodo.22159632

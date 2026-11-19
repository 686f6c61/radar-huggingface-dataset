# torch-pointcloud/ptv3-base.s3dis-area5.pointcept

## Resumen

ptv3-base.s3dis-area5.pointcept es un checkpoint de segmentación semántica de nubes de puntos 3D basado en Point Transformer V3 (PTV3), publicado por la organización torch-pointcloud. No es un modelo de lenguaje: es un modelo de visión 3D que asigna una etiqueta semántica a cada punto de una escena, en este caso con 13 clases de interior (suelo, pared, silla, mesa, etc.) según el dataset S3DIS. El checkpoint ha sido convertido desde el repositorio oficial Pointcept y empaquetado para la librería `torch-pointcloud`.

La relevancia de PTV3 radica en su propuesta de "serialized neighborhood attention": en lugar de recurrir a mecanismos de atención jerárquicos y costosos propios de las versiones anteriores de Point Transformer, el modelo serializa los vecinos de cada punto mediante un orden espacial (curvas de Hilbert) y aplica atención de ventana sobre esa secuencia. Esto simplifica la arquitectura, reduce el coste computacional y mejora el rendimiento en tareas de segmentación y detección sobre nubes de puntos a gran escala.

El checkpoint concreto tiene 46,2 millones de parámetros, trabaja con entradas de 6 canales (coordenadas XYZ más color RGB) y 64 dimensiones de característica interna, y reporta mIoU de 72,03 y exactitud global (OA) de 91,15 sobre el split Area 5 de S3DIS. Su licencia MIT y su integración en una librería pip lo hacen directamente utilizable en pipelines de percepción 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Point Transformer V3 (serialized neighborhood attention), transformer sobre nubes de puntos |
| Parametros totales | 46.194.585 (46,2 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre nubes de puntos de tamano variable) |
| Tipos de cuantizacion | no disponible (entrenado y distribuido en safetensors de precision completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (XYZ + RGB) |
| Clases de salida | 13 (S3DIS) |
| Dimension de caracteristicas | 64 |
| Dataset de entrenamiento | S3DIS (evaluacion en Area 5) |
| Libreria | torch-pointcloud |
| Tamano del repositorio | 0,4 GB |
| Dependencia adicional | spconv (compilacion acorde a la version de torch y CUDA) |

## Arquitectura y entrenamiento

PTV3 es un transformer diseñado especificamente para nubes de puntos. Su innovacion central es sustituir la atencion sobre vecindarios arbitrarios por una atencion serializada: los puntos se ordenan mediante un recorrido espacial continuo (curvas de Hilbert en 3D) y la atencion se aplica como ventana sobre esa secuencia, lo que permite usar kernels eficientes y paralelizables tipo atención de secuencias. El modelo mantiene un esquema encoder-decoder con etapas de downsampling y upsampling sobre la nube de puntos, y utiliza capas de convolucion dispersa (spconv) para la agregacion local.

Este checkpoint concreto corresponde a la variante "base" con 46,2 M de parametros, 64 canales de caracteristica y 13 clases de salida, entrenado sobre S3DIS (Stanford 3D Indoor Spaces) y evaluado en el split Area 5, el protocolo habitual de validacion cruzada de ese dataset (entrenamiento sobre las areas 1, 2, 3, 4 y 6, evaluacion sobre la 5). El autor no documenta en la model card el numero exacto de tokens/puntos de entrenamiento, la composicion del dataset mas alla de S3DIS ni si se aplicaron tecnicas de aumento de datos especificas; esa informacion debe consultarse en el paper de PTV3 y en el repositorio Pointcept.

## Capacidades

- Segmentacion semantica de nubes de puntos 3D: asigna una de 13 clases a cada punto de una escena de interior (suelo, pared, ventana, puerta, mesa, silla, sofa, estanteria, pizarra, libro, techo, papelera, otros).
- Procesamiento de nubes de puntos de tamano variable, con coordenadas XYZ y color RGB como entrada.
- Extraccion de caracteristicas por punto: `forward_features` devuelve un vector de 64 dimensiones por punto, reutilizable como backbone para tareas posteriores (clasificacion, deteccion, segmentacion de instancias).
- Reconfiguracion de la cabeza de clasificacion (`reset_classifier`) para adaptar el modelo a otros conjuntos de clases o a extraccion pura de embeddings.
- Ejecucion en GPU mediante kernels especializados (requiere CUDA; la model card indica "GPU-only kernels").
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo generativo de texto.

## Casos de uso

- Digitalizacion de interiores y gemelos digitales: el modelo segmenta escaneos de edificios en clases semanticas (suelo, pared, mobiliario), lo que permite generar modelos BIM o planos etiquetados a partir de nubes de puntos capturadas con LiDAR o fotogrametria.
- Robotica de navegacion indoor: integrar la salida por punto en la pila de percepcion de un robot movil para distinguir superficies transitables (suelo) de obstaculos (paredes, muebles) y planificar rutas.
- Realidad aumentada y virtual: separar semanticamente el entorno fisico escaneado para anclar objetos virtuales sobre superficies correctas o para aplicar sustituciones de mobiliario en visualizaciones.
- Inventariado y facility management: contar y localizar elementos como sillas, mesas o estanterias en escaneos de oficinas para auditorias de activos, aprovechando la clasificacion por punto del checkpoint.
- Preprocesado para anotacion semiautomatica: usar las predicciones como borrador inicial en herramientas de etiquetado 3D, reduciendo el coste manual de anotar nubes de puntos para entrenar otros modelos.
- Backbone para investigacion en vision 3D: extraer caracteristicas de 64 dimensiones por punto con `forward_features` y entrenar cabezas ligeras para tareas downstream (clasificacion de escena, segmentacion de instancias, deteccion de objetos).
- Analisis de accesibilidad y cumplimiento normativo: identificar obstaculos y anchos de paso en escaneos de espacios publicos a partir de la segmentacion semantica de suelo y paredes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`):

| Dataset | Tarea | Metrica | Valor |
|---|---|---|---|
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | mIoU | 72,03 |
| S3DIS (Area 5) | Segmentacion semantica de nubes de puntos | OA (exactitud global) | 91,15 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre el mismo split, ni latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 46,2 M de parametros en precision completa, los pesos ocupan aproximadamente 0,18 GB; el consumo real depende del numero de puntos por escena y de las estructuras de vecindad de spconv, que pueden dominar el uso de memoria en escenas grandes.
- GPU recomendadas: no especificadas por el autor. Dado el requisito de kernels CUDA, se necesita una GPU NVIDIA compatible con la version de torch y la compilacion de spconv instalada.
- GPU de consumo: el tamano de pesos sugiere que cabe en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), aunque el pico de memoria depende del numero de puntos procesados por lote; no hay cifras publicadas.
- Opciones de despliegue: la via documentada es la libreria `torch-pointcloud` (`pip install torch-pointcloud`) con `spconv` compilado para la version de torch y CUDA del entorno. No se documentan exportaciones a ONNX, TensorRT ni integraciones con vLLM, llama.cpp u Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ptv3-base.s3dis-area5.pointcept | 46,2 M | Nube de puntos variable, 6 canales | 72,03 (declarado) | MIT | Hugging Face, `torch-pointcloud` |
| Point Transformer V3 (original, Pointcept) | no disponible en la informacion | Nube de puntos variable | no disponible en la informacion | MIT | GitHub Pointcept |
| Otras variantes de PTV3 | no disponible en la informacion | Nube de puntos variable | no disponible en la informacion | no disponible | no disponible |

No se dispone en la informacion proporcionada de cifras de benchmarks de modelos alternativos (PointNet++, PointNepean, MinkUNet, etc.) que permitan una comparacion numerica fiable; se indica "no disponible" en lugar de estimar valores.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre S3DIS (escenas de interior de oficinas y aulas). El rendimiento en exteriores, vehiculos, industria o escenas con sensores distintos puede degradarse notablemente.
- Cierre de clases: la cabeza de salida esta fijada a 13 clases de S3DIS; para otras taxonomias hay que reentrenar o reconfigurar el clasificador.
- Dependencia de color: la entrada usa 6 canales (XYZ + RGB); escaneos sin informacion de color requieren adaptar la entrada o reentrenar.
- Requisito de GPU y spconv: los kernels son solo CUDA y la instalacion de spconv debe coincidir con la version de torch y CUDA, lo que complica el despliegue en entornos heterogeneos o en CPU.
- Metricas no verificadas: los valores de mIoU y OA proceden del autor y figuran como `verified: false`; no hay validacion independiente publicada en la informacion disponible.
- Riesgo de error en clases minoritarias: como en cualquier segmentador semantico, las clases con pocos puntos (papelera, pizarra, libro) suelen presentar menor IoU que las mayoritarias (suelo, pared), aunque no se publican desgloses por clase.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo depende de spconv y de `torch-pointcloud`, cuyas licencias deben revisarse por separado antes de distribuirlo en producto.
- Sin garantias de produccion: no se documentan pruebas de robustez ante ruido, oclusiones o densidades de punto atipicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/ptv3-base.s3dis-area5.pointcept
- Paper de Point Transformer V3: https://arxiv.org/abs/2312.10035
- Repositorio Pointcept (origen del checkpoint): https://github.com/Pointcept/Pointcept
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- Guia de instalacion de torch-pointcloud: https://pytorch-pointcloud.org/latest/installation/
- Dataset S3DIS (paper): Armeni et al., "3D Semantic Parsing of Large-Scale Indoor Spaces", CVPR 2016

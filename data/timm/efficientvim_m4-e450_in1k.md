# timm/efficientvim_m4.e450_in1k

## Resumen

EfficientViM es una familia de modelos de clasificación de imágenes basada en una arquitectura híbrida de espacio de estados (state space model, SSM) con mezclador de estado oculto y dualidad de espacio de estados (Hidden State Mixer based State Space Duality, HSM-SSD). El modelo fue desarrollado por los autores del artículo EfficientViM (mlvlab, KAIST) y presentado en CVPR 2025. La variante recogida aquí, `efficientvim_m4.e450_in1k`, es la redistribución oficial dentro de la librería `timm` (PyTorch Image Models) mantenida por Ross Wightman y Hugging Face.

Se trata de un modelo denso de 19.666.737 parámetros (19,6 M) especializado en clasificación de imágenes a 256 x 256 píxeles, con un coste de 1,1 GMACs y 4,5 M de activaciones por imagen. Esa relación entre precisión y coste lo sitúa en el segmento de backbones ligeros, pensado para despliegue en GPU de gama baja, dispositivos de borde y pipelines de alto rendimiento donde el coste de cómputo por imagen es un factor crítico.

Su relevancia actual reside en que combina la eficiencia lineal de los modelos Mamba/SSM con un diseño de mezcla de estados ocultos que mejora la mezcla de información entre canales, un punto históricamente débil de las SSM en visión. Al estar integrado en `timm`, se puede usar directamente con `timm.create_model` para clasificación, extracción de mapas de características (feature maps) y obtención de embeddings, lo que facilita su reutilización como backbone en detección, segmentación o recuperación de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViM: Vision Mamba con mezclador de estado oculto y dualidad de espacio de estados (HSM-SSD) |
| Parametros totales | 19.666.737 (19,6 M) segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica; entrada de imagen de 256 x 256 px |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados en el repo) |
| Idiomas soportados | no aplica (clasificacion de imagenes; etiquetas de ImageNet-1k en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante libreria timm / PyTorch) |
| Tarea (pipeline) | image-classification |
| GMACs por imagen | 1,1 |
| Activaciones | 4,5 M |
| Dataset de entrenamiento | ImageNet-1k (1.000 clases) |
| Tamano del repositorio | 0,1 GB |
| Libreria | timm |
| Descargas / likes | 0 / 0 |
| Fecha de creacion del repo | 2026-09-11 |

## Arquitectura y entrenamiento

EfficientViM sustituye el bloque transformer clasico por una pila de bloques SSM con dos componentes clave: un mezclador de estado oculto (hidden state mixer) que permite el intercambio de informacion entre los canales del estado latente, y un mecanismo de dualidad de espacio de estados (SSD) que reformula la recurrencia como un producto matricial, habilitando entrenamiento en paralelo sobre GPU. La variante `m4` corresponde a un escalado concreto de la familia, con 19,6 M de parametros y 1,1 GMACs a 256 x 256, lo que la sitúa en el extremo mas ligero de la gama.

El modelo fue entrenado por los autores del articulo sobre ImageNet-1k en resolucion 256 x 256. La model card distribuida por `timm` no detalla el numero exacto de tokens o imagenes vistas, la composicion de las recetas de aumento de datos, ni si se emplearon fases de ajuste adicionales mas alla del entrenamiento supervisado sobre etiquetas de ImageNet-1k; esa informacion debe consultarse en el articulo original. Tampoco se documenta en el repositorio el uso de tecnicas como decodificacion especulativa, dado que no es un modelo generativo.

La innovacion principal es la SSD aplicada a vision con mezcla de estados ocultos: permite capturar dependencias globales con coste lineal en el numero de tokens (parches), frente al coste cuadratico de la atencion completa. El resultado, segun el planteamiento del articulo, es una mejora del compromiso entre precision y coste frente a backbones convolucionales y transformers ligeros comparables, manteniendo un numero de parametros moderado y una huella de activaciones muy pequena (4,5 M).

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k mediante la cabeza de clasificacion incluida en el checkpoint.
- Extraccion de mapas de caracteristicas multi-nivel con `features_only=True`, util como backbone para deteccion, segmentacion y tareas densas. Los ejemplos de la model card muestran salidas de forma `[1, 224, 16, 16]`, `[1, 320, 8, 8]` y `[1, 512, 4, 4]` para una entrada de 224 x 224.
- Generacion de embeddings de imagen de dimension fija eliminando la cabeza (`num_classes=0`) o usando `forward_head(..., pre_logits=True)`, apto para busqueda por similitud, clustering y clasificacion con cabezas lineales.
- Ajuste fino (fine-tuning) para dominios especificos con conjuntos de datos propios.
- No dispone de capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas ni dialogo: es exclusivamente un modelo de vision.
- No soporta tool calling, function calling ni comportamiento agentico.
- No es multimodal: no procesa texto ni audio, y no realiza tareas de imagen-a-texto ni texto-a-imagen.
- No es un modelo de zero-shot con vocabulario abierto; su salida esta limitada a las clases aprendidas o a las que se definan al reentrenar la cabeza.

## Casos de uso

- Clasificacion de imagenes en produccion a gran escala: con 1,1 GMACs por imagen a 256 x 256, el modelo permite procesar lotes muy grandes por GPU con un coste energetico bajo, adecuado para pipelines donde se deben etiquetar millones de imagenes con presupuesto limitado.
- Backbone para deteccion y segmentacion: los mapas de caracteristicas multi-nivel extraidos con `features_only=True` se pueden conectar a cabezas tipo YOLO o a decodificadores de segmentacion, aprovechando la mezcla global de contexto de la SSM sin el coste cuadratico de la atencion.
- Recuperacion de imagenes por similitud: generando embeddings con `num_classes=0` y normalizando los vectores, se puede construir un indice vectorial (FAISS, Milvus) para busqueda visual en catalogos de producto, archivos fotograficos o bibliotecas de medios.
- Control de calidad industrial: fine-tuning sobre imagenes de linea de produccion para detectar defectos (grietas, manchas, piezas mal ensambladas) con inferencia en GPU de gama baja o incluso CPU junto a la camara.
- Clasificacion de imagenes en dispositivos de borde: el tamano del checkpoint (0,1 GB en el repo) y el bajo numero de activaciones permiten exportarlo a ONNX o TensorRT e integrarlo en sistemas embebidos con GPU integrada para tareas de vigilancia, conteo o triaje.
- Moderacion de contenido visual como primera etapa: filtrado rapido de imagenes candidatas antes de pasar las dudosas a un modelo mayor o a revision humana, reduciendo el coste computacional del sistema completo.
- Analitica de imagen cientifica o agricola: fine-tuning en dominios especificos (hojas de cultivo, muestras de microscopia, imagenes satelitales de pequeno tamano) donde se necesita un modelo compacto que se pueda reentrenar con recursos modestos.
- Destilacion y generacion de pseudoetiquetas: usar sus predicciones o embeddings como senal para entrenar modelos aun mas pequenos o para etiquetar datos no anotados en un pipeline de aprendizaje semisupervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card distribuida por `timm` no incluye valores de exactitud top-1/top-5 en ImageNet-1k ni comparaciones numericas con otros modelos; unicamente detalla parametros (19,6 M), GMACs (1,1), activaciones (4,5 M) y resolucion de entrada (256 x 256), y remite al apartado de resultados de rendimiento del repositorio de `pytorch-image-models` para consultar metricas de ejecucion y del dataset evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 79 MB en FP32 (19.666.737 x 4 bytes), unos 39 MB en FP16/BF16 y unos 20 MB en INT8. Sumando activaciones (4,5 M) y buffers intermedios, la inferencia en lotes pequenos se mantiene por debajo de 1 GB de VRAM en cualquier precision habitual.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, desde una GTX 1050/RTX 2060 hasta una RTX 4090. Las A100 o H100 solo tienen sentido para entrenamiento o fine-tuning con lotes muy grandes o para servir muchas replicas en paralelo.
- Compatibilidad con GPU de consumo: si, y tambien con GPU integradas que compartan memoria del sistema, dado el bajo coste de computo (1,1 GMACs).
- Ejecucion en CPU: viable para inferencia por lotes moderados o despliegues de baja frecuencia; no se publican cifras de latencia en CPU.
- Opciones de despliegue: `timm` + PyTorch (via directa recomendada por la model card), exportacion a ONNX y TorchScript, TensorRT u OpenVINO para optimizacion, y uso dentro del ecosistema Hugging Face mediante la integracion de `timm`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque son herramientas para modelos generativos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. Como referencia indirecta, el coste de 1,1 GMACs por imagen a 256 x 256 es muy bajo en terminos relativos, pero no se dispone de mediciones publicadas de latencia o imagenes por segundo en esta busqueda.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad en timm | Precision publicada |
|---|---|---|---|---|---|
| efficientvim_m4.e450_in1k | 19,6 M | Clasificacion de imagenes (ImageNet-1k) | MIT | Si | no disponible en la informacion |
| ResNet-18 | ~11,7 M | Clasificacion de imagenes (ImageNet-1k) | BSD-3 / Apache-2.0 segun implementacion | Si | no disponible en la informacion |
| MobileNetV3-Large | ~5,4 M | Clasificacion de imagenes (ImageNet-1k) | Apache-2.0 | Si | no disponible en la informacion |
| DeiT-Tiny | ~5,7 M | Clasificacion de imagenes (ImageNet-1k) | Apache-2.0 | Si | no disponible en la informacion |

Nota: los recuentos de parametros de los modelos alternativos son valores de referencia ampliamente conocidos y no han sido verificados en la busqueda realizada; no se ha encontrado en la informacion disponible ningun dato comparativo de exactitud entre EfficientViM-M4 y estas alternativas, por lo que la comparacion se limita a tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- Alcance cerrado: el modelo clasifica unicamente entre las clases aprendidas en ImageNet-1k; cualquier uso real requiere fine-tuning de la cabeza de clasificacion o de todo el modelo.
- Sin soporte multilingue ni multimodal: no procesa texto, audio ni video, y no puede usarse para tareas de generacion, dialogo o recuperacion aumentada.
- Sesgos heredados de ImageNet-1k: el conjunto de entrenamiento presenta sesgos de representacion geografica y cultural, etiquetas ruidosas en algunas clases y una taxonomia de 1.000 categorias que no cubre dominios especializados (medicina, industria, teledeteccion).
- Riesgo de sobreconfianza: al ser un clasificador discriminativo no genera texto y, por tanto, no alucina en el sentido linguistico, pero puede producir probabilidades softmax mal calibradas en clases poco representadas o en imagenes fuera de distribucion.
- Resolucion fija de trabajo: el modelo esta entrenado a 256 x 256; usarlo con resoluciones muy distintas sin reajustar los transformadores de datos puede degradar la precision. La model card recomienda obtener los transformadores con `timm.data.resolve_model_data_config`.
- Documentacion incompleta: la model card no especifica receta de entrenamiento, numero de epocas, tokens vistos, tecnicas de regularizacion ni resultados de evaluacion, lo que dificulta reproducir o auditar el comportamiento del modelo.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la atribucion. Se recomienda citar tanto el articulo de EfficientViM como la libreria `timm`.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad; conviene evaluar el checkpoint en el caso de uso propio antes de llevarlo a produccion.
- Uso del dataset: ImageNet-1k se distribuye con sus propias condiciones de uso, que son independientes de la licencia MIT del checkpoint; es responsabilidad del usuario verificar que su uso del conjunto de datos es conforme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/efficientvim_m4.e450_in1k
- Articulo (arXiv): https://arxiv.org/abs/2411.15241
- Repositorio original de EfficientViM: https://github.com/mlvlab/EfficientViM
- Libreria timm en Hugging Face: https://huggingface.co/timm
- Repositorio timm en GitHub: https://github.com/huggingface/pytorch-image-models
- Resultados y metricas de runtime de timm: https://github.com/huggingface/pytorch-image-models/tree/main/results
- timm en PyPI: https://pypi.org/project/timm/
- Documentacion de timm: https://timm.fast.ai/
- DOI de la libreria timm (Zenodo): https://doi.org/10.5281/zenodo.4414861

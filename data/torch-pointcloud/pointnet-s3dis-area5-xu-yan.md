# torch-pointcloud/pointnet.s3dis-area5.xu-yan

## Resumen

PointNet es una red neuronal para segmentación semántica de nubes de puntos 3D, publicada originalmente por Charles R. Qi, Hao Su, Kaichun Mo y Leonidas J. Guibas en CVPR 2017 (arXiv:1612.00593). Este checkpoint concreto, `pointnet.s3dis-area5.xu-yan`, es una conversión al formato de la librería `torch-pointcloud` de la implementación de referencia de Yan Xu (repositorio `yanx27/Pointnet_Pointnet2_pytorch`), entrenada sobre el dataset S3DIS con partición Area 5 como conjunto de test.

El modelo resuelve la asignación de una clase semántica a cada punto de una nube 3D, con 13 clases de mobiliario y estructura propios de interiores (suelo, pared, silla, mesa, etc.). No es un modelo de lenguaje: es un modelo de visión 3D puro, con 3,5 millones de parámetros, entrada de 6 canales (coordenadas XYZ más color RGB) y salida de logits por punto.

Su relevancia actual es la de un baseline clásico y ligero para tareas de segmentación de interiores, útil como referencia de comparación frente a arquitecturas posteriores (PointNet++, RandLA-Net, KPConv, Point Transformer) y como pieza de bajo coste computacional en pipelines de digitalización de espacios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet (MLP compartida por punto con transformaciones de entrada y de características) |
| Parametros totales | 3.541.718 (3,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (nube de puntos; el ejemplo de la model card usa 8192 puntos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Canales de entrada | 6 (XYZ + RGB) |
| Clases de salida | 13 |
| Dimension de caracteristicas | 1088 |
| Dataset de entrenamiento | S3DIS, partición Area 5 |
| Libreria | torch-pointcloud |

## Arquitectura y entrenamiento

PointNet procesa la nube de puntos como un conjunto desordenado aplicando una MLP compartida punto a punto, seguida de una operación de agregación simétrica (max-pooling global) que garantiza invariancia a permutaciones. El modelo incorpora dos módulos T-Net: una transformación de entrada (3x3) que alinea la nube de forma canónica y una transformación de características (64x64) que alinea el espacio latente antes de la agregación. Para segmentación, concatena la característica global con las características locales por punto y aplica capas fully-connected hasta los 13 logits por punto. La dimensión de características indicada en la model card es 1088, coherente con la concatenación de la representación local (64) y la global (1024).

El entrenamiento se realizó sobre S3DIS (Stanford 3D Indoor Spaces), un dataset de escaneos RGB-D de seis áreas de edificios de oficinas y educativos con anotaciones semánticas a nivel de punto. La partición Area 5 se usa como test, una convención habitual en la literatura. No se dispone de información sobre número de tokens equivalentes, composición exacta del dataset, aumentos de datos aplicados ni si hubo etapas de refinamiento posteriores; la model card no los detalla. El checkpoint es una conversión directa de la implementación de Yan Xu, por lo que hereda su receta de entrenamiento original.

## Capacidades

- Segmentación semántica por punto en nubes 3D de interiores con 13 clases.
- Entrada multimodal a nivel de punto: coordenadas XYZ más color RGB (6 canales).
- Extracción de características globales y por punto (vector de 1088 dimensiones) mediante `forward_features`.
- Posibilidad de reinicializar el clasificador (`reset_classifier(num_classes=0)`) para usar el modelo como extractor de características en tareas downstream.
- Invariancia a permutaciones del conjunto de puntos por diseño arquitectónico.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo de texto.
- No tiene capacidades multilingües ni de visión 2D convencional.
- No dispone de modo de razonamiento (thinking), audio ni vídeo.

## Casos de uso

- Segmentación de escaneos de interiores para modelado BIM: el modelo etiqueta cada punto de una nube capturada con LiDAR o fotogrametría, permitiendo separar suelo, paredes, techo y mobiliario antes de la reconstrucción semántica.
- Digitalización de espacios para realidad aumentada: al clasificar por punto los elementos de una habitación, se pueden anclar objetos virtuales sobre superficies identificadas (suelo, mesas, paredes) con un coste computacional muy bajo gracias a sus 3,5 M de parámetros.
- Preprocesado en robótica móvil indoor: un robot puede usar el modelo para distinguir obstáculos estructurales (paredes) de mobiliario y suelo, alimentando capas de navegación con etiquetas semánticas a nivel de punto.
- Baseline de referencia en investigación: por su tamaño reducido y su licencia MIT, es un punto de comparación estándar al evaluar arquitecturas más recientes sobre S3DIS Area 5 con la métrica mIoU.
- Extracción de características para clasificación de escenas: usando `forward_features` se obtiene un descriptor global de 1088 dimensiones que puede alimentar un clasificador ligero para categorizar habitaciones o edificios.
- Etiquetado asistido y control de calidad de anotaciones: el modelo puede preanotar nubes nuevas y un revisor humano corrige los errores, acelerando la creación de datasets propios de interiores.
- Prototipado en hardware modesto: al ser un modelo de 3,5 M de parámetros y pesos safetensors de tamaño reducido, se puede ejecutar en CPU o en GPUs de gama baja para pruebas de concepto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| mIoU | S3DIS (Area 5) | 43,79 |
| OA (accuracy global) | S3DIS (Area 5) | 79,06 |

No se han publicado en la información disponible resultados adicionales de benchmarks (por clase, latencia o throughput).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para lotes pequeños; el modelo tiene 3,5 M de parámetros y pesos en safetensors de tamaño reducido (el repositorio ocupa 0,0 GB según Hugging Face).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090 o una T4 están sobredimensionadas para este modelo.
- Cabe en cualquier GPU de consumo actual e incluso en iGPU y en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: la librería nativa es `torch-pointcloud` (`pip install torch-pointcloud`), con carga vía `tp.create_model(..., pretrained=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en producción será el preprocesado de la nube (muestreo a un número fijo de puntos, p. ej. 8192) más que el forward pass.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | mIoU S3DIS Area 5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PointNet (este checkpoint) | 3,5 M | XYZ + RGB (6 canales) | 13 | 43,79 | MIT | Hugging Face, torch-pointcloud |
| PointNet++ | no disponible en la informacion | XYZ + RGB | 13 | no disponible en la informacion | MIT (implementacion yanx27) | Repositorio GitHub yanx27 |
| RandLA-Net | no disponible en la informacion | XYZ + RGB | 13 | no disponible en la informacion | MIT (implementacion original) | Repositorio GitHub |
| KPConv | no disponible en la informacion | XYZ + RGB | 13 | no disponible en la informacion | Licencia del proyecto original | Repositorio GitHub |

No se dispone de cifras de benchmarks de los modelos alternativos en la información proporcionada; la comparación cuantitativa de rendimiento queda por tanto limitada al dato de mIoU de este checkpoint.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en interiores de tipo oficina y educativo (S3DIS); su generalización a exteriores, industria o escenas urbanas no está garantizada.
- Sensible a la densidad y al ruido de la nube: PointNet original no explota estructura local, lo que penaliza en escenas con objetos pequeños o densidades heterogéneas frente a arquitecturas jerárquicas.
- Requiere un número fijo de puntos por muestra (el ejemplo usa 8192); el submuestreo o remuestreo puede alterar los resultados.
- Depende del color RGB como canal de entrada; en nubes sin color (solo geometría) el rendimiento esperado cae y no se documenta un modo de solo geometría.
- mIoU de 43,79 es un valor moderado para S3DIS Area 5 en el estado del arte actual; no es adecuado como solución de producción de alta precisión sin fine-tuning o sustitución por un modelo más moderno.
- Riesgo de alucinación en el sentido de etiquetas incorrectas en puntos ambiguos (bordes, objetos ocluidos), sin mecanismo de calibración de confianza documentado.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda conservar la atribución a los autores originales de PointNet, al repositorio de Yan Xu y a la librería torch-pointcloud.
- No hay información sobre sesgos de género, etnia u otros sesgos sociales, ya que el modelo no procesa datos personales ni texto.
- La fecha de creación indicada en Hugging Face (2026-10-30) y la referencia de la librería en la cita sugieren un empaquetado reciente del checkpoint original de 2017; conviene verificar la versión de `torch-pointcloud` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/torch-pointcloud/pointnet.s3dis-area5.xu-yan
- Paper original PointNet (arXiv:1612.00593): https://arxiv.org/abs/1612.00593
- Repositorio de la implementación de referencia (Yan Xu): https://github.com/yanx27/Pointnet_Pointnet2_pytorch
- Librería torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la librería: https://doi.org/10.5281/zenodo.22159632
- Dataset S3DIS (paper CVPR 2016): https://arxiv.org/abs/1604.03829

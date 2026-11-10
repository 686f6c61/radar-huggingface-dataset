# tomi-volantis/rtdetrv2_r18vd_120e_coco_rerun_48.1

## Resumen

`rtdetrv2_r18vd_120e_coco_rerun_48.1` es un checkpoint de deteccion de objetos publicado por el usuario `tomi-volantis` en Hugging Face bajo licencia Apache 2.0. Por la nomenclatura del identificador, corresponde a una ejecucion de entrenamiento de RT-DETRv2 con backbone ResNet-18 (variante `vd`, probablemente inicializada desde pesos preentrenados en ImageNet), durante 120 epocas sobre el conjunto de datos COCO. El sufijo `rerun_48.1` sugiere una repeticion del entrenamiento con un resultado de 48,1 (con toda probabilidad, mAP en el rango COCO), aunque el autor no lo documenta.

RT-DETRv2 es la segunda iteracion de Real-Time DEtection TRansformer, una familia de detectores end-to-end que elimina la necesidad de supresion no maxima (NMS) y de anclas, manteniendo latencias compatibles con aplicaciones en tiempo real. La relevancia de este checkpoint es acotada: se trata de un artefacto de investigacion o experimento personal con cero descargas y cero interacciones en el momento de la consulta, y su model card practicamente no aporta informacion tecnica.

La ficha se ha elaborado a partir del identificador del modelo, la licencia declarada y el conocimiento publico de la arquitectura RT-DETRv2; todos los datos que no pueden inferirse de forma fiable se marcan como no disponibles, sin estimaciones inventadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (detector transformer end-to-end, sin NMS ni anclas) con backbone ResNet-18 |
| Parametros totales | no disponible (no declarado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | no disponible (no se documentan pesos cuantizados; FP32/FP16 habituales en PyTorch) |
| Idiomas soportados | no disponible (no es un modelo linguistico; las etiquetas de clase son las 80 de COCO) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica en la model card; probablemente `.pth`/`.pt` de PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos basado en transformer que sigue el paradigma DETR: un backbone convolucional extrae caracteristicas multiescala, un encoder híbrido las procesa y un decoder transformer genera un conjunto fijo de predicciones (cajas y clases) que se asignan a las etiquetas mediante matching hungaro, eliminando la supresion no maxima en inferencia. La variante `r18vd` emplea ResNet-18 como backbone, lo que la situa en el extremo ligero de la familia y la hace apta para despliegue con recursos limitados. RT-DETRv2 incorpora mejoras sobre RT-DETR original, como un esquema de inicializacion de queries y una seleccion de caracteristicas multiescala mas flexible.

Segun el identificador, el entrenamiento se realizo durante 120 epocas sobre COCO (`120e_coco`), un regimen habitual en las recetas oficiales de RT-DETR para configuraciones ligeras. No se dispone de informacion sobre el numero exacto de imagenes, aumentos de datos, hiperparametros, uso de EMA ni estrategia de inicializacion mas alla de lo que sugiere el sufijo `vd`. Tampoco se documenta si hubo ajuste fino posterior, destilacion ni evaluacion adicional. El sufijo `rerun_48.1` apunta a una repeticion del experimento con un resultado de 48,1, presumiblemente mAP en COCO val2017, pero el autor no lo confirma en la model card.

## Capacidades

- Deteccion de objetos en imagenes: localizacion y clasificacion de las 80 categorias de COCO en una sola pasada, sin NMS.
- Salida end-to-end: el modelo produce directamente cajas y puntuaciones, lo que simplifica el postprocesado en produccion.
- Inferencia en tiempo real: el backbone ResNet-18 y la ausencia de NMS permiten latencias bajas en GPU, aunque no se publican mediciones.
- Deteccion multiescala: el encoder híbrido procesa caracteristicas de varias resoluciones, lo que ayuda con objetos de distinto tamano.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues ni de generacion de texto.
- No se documentan modos especiales (thinking, vision-lenguaje, audio) ni variantes instruidas.

## Casos de uso

- Prototipado rapido de deteccion en tiempo real: al ser un checkpoint ligero con backbone ResNet-18, sirve para validar pipelines de vision antes de invertir en modelos mayores; se cargaria con la libreria de referencia de RT-DETR y se ejecutaria sobre video o camaras IP.
- Vision artificial en dispositivos de borde: la combinacion de backbone pequeno y ausencia de NMS reduce el coste computacional, lo que permite desplegarlo en GPUs de gama media o en plataformas embebidas con aceleracion, siempre que se valide el rendimiento real.
- Moderacion y analisis de imagenes en lotes: deteccion de personas, vehiculos o animales en grandes volumenes de imagenes para tareas de etiquetado asistido o auditoria de contenido.
- Sistemas de videovigilancia: deteccion de intrusiones o conteo de objetos en flujos continuos, aprovechando la naturaleza end-to-end del modelo para simplificar el pipeline.
- Baseline para experimentos academicos: punto de partida reproducible (120 epocas COCO) para comparar variantes de backbone, aumentos de datos o estrategias de entrenamiento en RT-DETR.
- Preetiquetado para anotacion humana: generar cajas candidatas que un anotador revise, reduciendo el coste de construir datasets propios; requiere umbral de confianza conservador por la falta de validacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El sufijo `rerun_48.1` del identificador sugiere un valor de 48,1 (probablemente mAP COCO), pero el autor no lo documenta ni aporta la metrica exacta, el conjunto de evaluacion ni la configuracion de inferencia, por lo que no se incluye como resultado verificado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un detector con backbone ResNet-18 en FP32 se situa tipicamente en el rango de 1-3 GB, y en FP16 aproximadamente la mitad, pero son estimaciones no verificadas para este checkpoint.
- GPU recomendadas: no declaradas por el autor. Por tamano de backbone, cabria esperar buen rendimiento en RTX 3060/4060 y superiores, asi como en A100/H100 para despliegues de alto throughput.
- Compatibilidad con GPU de consumo: probable en GPUs con 4 GB o mas de VRAM, sin confirmacion empirica.
- Opciones de despliegue: la familia RT-DETR se sirve habitualmente con PyTorch, ONNX Runtime, TensorRT y frameworks como PaddleDetection o las implementaciones de referencia; no se documenta soporte especifico para este checkpoint en vLLM, llama.cpp u Ollama, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: no disponibles; no se aportan mediciones de FPS ni de tiempo por imagen.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Contexto/entrada | mAP COCO | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rtdetrv2_r18vd_120e_coco_rerun_48.1 | ResNet-18 | no disponible | imagen (resolucion no declarada) | no verificado (sufijo sugiere 48,1) | Apache 2.0 | Hugging Face, 0 descargas |
| RT-DETRv2-R18 (checkpoint oficial) | ResNet-18 | no disponible en esta ficha | imagen | no disponible en esta ficha | Apache 2.0 (repo oficial) | Repositorio oficial de RT-DETR |
| YOLOv8n | CSPDarknet ligero | ~3,2 M | imagen 640x640 | ~37,3 mAP (referencia publica) | AGPL-3.0 | Ultralytics |
| YOLOv8s | CSPDarknet | ~11,2 M | imagen 640x640 | ~44,9 mAP (referencia publica) | AGPL-3.0 | Ultralytics |

La comparacion con los checkpoints oficiales de RT-DETRv2 no puede completarse con datos verificados de este repositorio; las cifras de YOLOv8 se incluyen como referencia publica de la categoria y no como validacion de este checkpoint. La licencia Apache 2.0 frente a la AGPL de Ultralytics es una diferencia relevante para uso comercial.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, formato de pesos ni metricas, lo que impide reproducir o auditar el resultado.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad; el checkpoint debe tratarse como no verificado.
- El valor `48.1` del identificador no esta confirmado como mAP ni como metrica oficial; no debe citarse como resultado validado.
- Sesgos desconocidos: al entrenarse sobre COCO, hereda los sesgos de anotacion y de representacion de ese dataset (clases desbalanceadas, sesgos geograficos y de contexto), pero no se documenta ningun analisis.
- Riesgo de falsos positivos y negativos en dominios distintos de COCO; no se aportan evaluaciones de robustez ni de generalizacion.
- Sin soporte linguistico ni generativo: no puede usarse para tareas de texto, dialogo ni razonamiento.
- Licencia Apache 2.0 permite uso comercial y modificacion con atribucion, pero al no haber model card detallada conviene verificar la procedencia de los pesos antes de integrarlos en produccion.
- No se documenta compatibilidad con versiones concretas de las librerias de RT-DETR, lo que puede provocar errores de carga si el formato de pesos difiere del esperado.

## Enlaces

- Hugging Face: https://huggingface.co/tomi-volantis/rtdetrv2_r18vd_120e_coco_rerun_48.1
- Repositorio oficial de RT-DETR (referencia de la arquitectura): https://github.com/lyuwenyu/RT-DETR
- Paper RT-DETR (arXiv): https://arxiv.org/abs/2304.08069
- Paper RT-DETRv2 (arXiv): https://arxiv.org/abs/2407.17140
- Dataset COCO: https://cocodataset.org

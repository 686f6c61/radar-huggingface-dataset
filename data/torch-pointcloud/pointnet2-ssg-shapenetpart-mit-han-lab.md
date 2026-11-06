# torch-pointcloud/pointnet2-ssg.shapenetpart.mit-han-lab

## Resumen

PointNet2-ssg.shapenetpart.mit-han-lab es un modelo de segmentación semántica de partes de nubes de puntos 3D, concretamente una implementación de PointNet++ con muestreo de un solo nivel (single-scale grouping, SSG) entrenada sobre el conjunto de datos ShapeNetPart. Lo publica el repositorio `torch-pointcloud` (Arthur Dujardin) como una conversión de los pesos originales del proyecto PVCNN de MIT-HAN-Lab, empaquetados en formato safetensors para su uso directo con la librería homónima.

El modelo resuelve una tarea clásica en visión 3D: dado un conjunto de puntos con coordenadas xyz (y opcionalmente normales), asignar a cada punto una etiqueta de parte dentro de una de las 50 clases posibles repartidas entre 16 categorías de objetos. Con solo 1,4 millones de parámetros, es un modelo extremadamente ligero pensado para investigación, prototipado y pipelines donde el coste computacional importa más que la precisión absoluta.

Su relevancia actual es la de un baseline reproducible y de licencia MIT para segmentación de partes en 3D. No compite con los modelos de lenguaje ni con arquitecturas modernas de nubes de puntos (Point Transformer, PVCNN, etc.), sino que sirve como referencia canónica de PointNet++ y como componente listo para usar dentro del ecosistema `torch-pointcloud`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointNet++ (hierarchical set abstraction, single-scale grouping) |
| Parametros totales | 1.417.138 (1,4 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; procesa nubes de puntos de tamaño variable, ejemplo con 8192 puntos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión 3D, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos tecnicos: canales de entrada 3, 50 clases de salida, 128 caracteristicas por punto en la extraccion de features, tarea `point-cloud-part-segmentation`, dataset ShapeNetPart.

## Arquitectura y entrenamiento

PointNet++ es una red jerarquica que aplica capas de "set abstraction" para muestrear y agrupar puntos en regiones locales, extrayendo caracteristicas mediante mini-PointNets y propagando despues esas caracteristicas hacia atras con capas de "feature propagation" para obtener una etiqueta por punto. La variante SSG (single-scale grouping) usa un unico radio de agrupamiento por nivel, a diferencia de MSG (multi-scale grouping), lo que reduce el coste computacional a cambio de algo de robustez ante variaciones de densidad.

El entrenamiento se realizo sobre ShapeNetPart, un subconjunto de ShapeNet con anotaciones a nivel de parte para 16 categorias de objetos y 50 etiquetas de parte. La model card no detalla el numero de tokens ni la composicion exacta del dataset, ni si hubo tecnicas de aumento o regularizacion especificas. Los pesos publicados son una conversion de los del repositorio `mit-han-lab/pvcnn` (licencia MIT) al formato de `torch-pointcloud`; no se trata de un reentrenamiento desde cero, sino de una adaptacion de pesos existentes.

No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal o modulos hifridos. El valor tecnico esta en la reproducibilidad: pesos en safetensors, integracion con `torch-pointcloud` y API de extraccion de features (`forward_features`) y reinicializacion del clasificador (`reset_classifier`).

## Capacidades

- Segmentacion de partes de nubes de puntos 3D: asigna una etiqueta de parte (hasta 50 clases) a cada punto de la nube.
- Clasificacion por categoria de objeto: la entrada incluye un tensor `category` que condiciona la prediccion de partes.
- Extraccion de caracteristicas por punto: `forward_features` devuelve un vector de 128 dimensiones por punto, util como representacion para tareas posteriores.
- Reutilizacion como backbone: `reset_classifier(num_classes=0)` permite usar el modelo como extractor de features sin cabeza de clasificacion.
- Procesamiento de nubes de puntos de tamano variable (el ejemplo de la model card usa 8192 puntos).
- Entrada opcional de normales (`normal`) ademas de coordenadas (`pos`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision 2D, audio ni capacidades multilingues.

## Casos de uso

- Segmentacion de partes en escaneos 3D de objetos: dado un escaneo de una silla, un avion o una mesa, el modelo etiqueta cada punto como respaldo, asiento, pata, ala, etc., gracias a sus 50 clases de parte entrenadas sobre ShapeNetPart.
- Preprocesado para pipelines de robotica manipulativa: identificar las partes de un objeto (asa, tapa, cuerpo) para que un brazo robotico sepa donde agarrar; el modelo es lo bastante ligero (1,4 M de parametros) para ejecutarse en el bucle de percepcion.
- Etiquetado asistido de datos 3D: usar las predicciones del modelo como preanotacion en herramientas de anotacion de nubes de puntos, reduciendo el coste manual en la creacion de datasets propios.
- Extraccion de features para clasificacion o retrieval 3D: emplear `forward_features` para obtener descriptores de 128 dimensiones por punto y alimentar un clasificador o un sistema de busqueda de formas similares.
- Benchmark y validacion de pipelines de vision 3D: al ser un baseline canonico de PointNet++ con metricas publicadas (ins_mIoU 85,04, cls_mIoU 82,64), sirve para verificar que un pipeline de carga, transformacion y evaluacion funciona correctamente antes de pasar a modelos mayores.
- Prototipado rapido en investigacion: gracias a su tamano minimo y a la instalacion via `pip install torch-pointcloud`, permite iterar sobre tecnicas de aumento de datos, funciones de perdida o arquitecturas derivadas sin grandes requisitos de hardware.
- Educacion y docencia: ejemplo completo y reproducible de segmentacion de partes en 3D con pesos listos para usar y API sencilla.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Valor |
|---|---|---|
| ins_mIoU | ShapeNetPart | 85,04 |
| cls_mIoU | ShapeNetPart | 82,64 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1,4 M de parametros, los pesos ocupan del orden de 5,7 MB en fp32 y unos 2,8 MB en fp16. La memoria dominante sera la de las activaciones y la nube de puntos de entrada (el ejemplo usa 8192 puntos).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama media como RTX 3060 o T4 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con suficiente memoria para el lote de puntos; tambien es viable en CPU para inferencia puntual.
- Opciones de despliegue: la via documentada es `torch-pointcloud` (`pip install torch-pointcloud`) con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pointnet2-ssg.shapenetpart.mit-han-lab (este) | 1,4 M | nube de puntos (ej. 8192 puntos) | Segmentacion de partes ShapeNetPart | MIT | Hugging Face, `torch-pointcloud` |
| PointNet++ MSG (variante multi-scale) | no disponible | nube de puntos | Segmentacion de partes ShapeNetPart | MIT (referencia original) | Codigo en repositorios academicos |
| PVCNN (mit-han-lab) | no disponible | nube de puntos | Segmentacion de partes / clasificacion | MIT | GitHub `mit-han-lab/pvcnn` |
| Point Transformer | no disponible | nube de puntos | Segmentacion / clasificacion | no disponible | Repositorios academicos |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada para establecer diferencias cuantitativas con estas alternativas. La comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre ShapeNetPart: generaliza mal a categorias de objetos o dominios (escaneos reales, LiDAR, mallas convertidas) fuera de la distribucion del dataset.
- Solo 16 categorias de objeto y 50 clases de parte; no cubre la diversidad de formas del mundo real.
- Requiere que la entrada incluya la categoria del objeto (`category`) para condicionar la prediccion de partes; un uso sin esa informacion no esta documentado.
- Sensible a la densidad y al ruido de la nube de puntos; la variante SSG es menos robusta que MSG ante variaciones de escala.
- Riesgo de sobreajuste a las poses y muestreos tipicos de ShapeNetPart.
- No es un modelo generativo ni linguistico: no hay riesgo de alucinacion textual, pero si de predicciones erroneas de parte en puntos ambiguos.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar la atribucion a los autores originales (Qi et al., 2017) y al repositorio de conversion.
- Los resultados de benchmarks estan declarados por el autor y no verificados (`verified: false`); conviene reproducirlos antes de usarlos como referencia en produccion.
- No se documentan sesgos demograficos ni linguisticos (no aplican), pero si posibles sesgos de dominio derivados del dataset.
- El repositorio tiene 0 GB de tamano y 21 descargas; es un modelo de nicho con poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/torch-pointcloud/pointnet2-ssg.shapenetpart.mit-han-lab
- Paper PointNet++: https://arxiv.org/abs/1706.02413
- Repositorio de origen de los pesos (PVCNN, MIT-HAN-Lab): https://github.com/mit-han-lab/pvcnn
- Libreria torch-pointcloud: https://github.com/arthurdjn/pytorch-pointcloud
- DOI de la libreria: https://doi.org/10.5281/zenodo.22159632
- Paper ShapeNetPart (Yi et al., 2016): no disponible como enlace directo en la informacion proporcionada

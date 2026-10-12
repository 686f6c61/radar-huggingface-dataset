# timm/mobilenetv3_small_100.lamb_in1k

## Resumen

`timm/mobilenetv3_small_100.lamb_in1k` es un modelo de clasificación de imágenes basado en la arquitectura MobileNet-v3, publicado por el equipo de `timm` (PyTorch Image Models) en HuggingFace. Se trata de la variante "small" con factor de anchura 1.0, entrenada sobre ImageNet-1k mediante un recetario propio de `timm` que emplea el optimizador LAMB. Con tan solo 2.554.968 parámetros y 0.1 GMACs, está pensado para escenarios donde el coste computacional y el consumo de memoria son la restricción principal.

El modelo resuelve el problema clásico de clasificación de imágenes en 224 x 224 píxeles sobre las 1.000 clases de ImageNet-1k, pero su relevancia actual va más allá: se usa habitualmente como backbone ligero para extracción de características (feature maps), generación de embeddings de imagen y transfer learning en tareas donde no es viable desplegar una red grande. Su enorme volumen de descargas (más de 21 millones) lo sitúa entre los modelos de visión más reutilizados del ecosistema `timm`.

La licencia Apache-2.0 y la integración nativa con la librería `timm` lo convierten en una opción de partida muy accesible para prototipado rápido, sistemas embebidos y pipelines de etiquetado automático a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNet-v3 (CNN con bloques invertidos y atención SE), variante small, ancho 1.0 |
| Parametros totales | 2.554.968 (2,5 M) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 224 x 224) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos exportables a fp16/int8 mediante herramientas externas) |
| Idiomas soportados | no aplica (clasificacion de imagenes); no disponible en la informacion |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y PyTorch (bin); libreria `timm` |
| GMACs | 0,1 |
| Activaciones | 1,4 M |
| Tamano de imagen de entrada | 224 x 224 |
| Dataset de entrenamiento | ImageNet-1k |
| Numero de clases | 1.000 (ImageNet-1k) |
| Descargas en HuggingFace | 21.210.318 |
| Likes | 136 |
| Fecha de creacion | 2022-12-16 |
| Ultima actualizacion | 2025-10-19 |

## Arquitectura y entrenamiento

MobileNet-v3 es una red convolucional disenada mediante busqueda de arquitectura (NAS) y refinamiento manual, descrita en el paper "Searching for MobileNetV3" (arXiv:1905.02244). Combina bloques residuales invertidos con convoluciones separables en profundidad, modulos de atencion squeeze-and-excitation (SE) y funciones de activacion no lineales especificas (h-swish) para reducir el coste de computo. Esta variante `small_100` es la mas pequena de la familia, con aproximadamente 2,5 M de parametros y 0,1 GMACs por imagen de 224 x 224, lo que la hace apta para dispositivos moviles y CPU.

El entrenamiento se realizo en `timm` sobre ImageNet-1k (1.000 clases) siguiendo un recetario basado en el optimizador LAMB, similar al recetario `A2` de "ResNet Strikes Back" (arXiv:2110.00476) pero con una duracion un 50 % mayor, promediado de pesos por EMA y sin CutMix. La planificacion de la tasa de aprendizaje usa decaimiento exponencial escalonado con calentamiento (warmup). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo por otra parte esperable en un clasificador de vision.

Ademas de la cabeza de clasificacion, el modelo puede emplearse como backbone de caracteristicas: al activar `features_only=True` devuelve mapas de distintas resoluciones (por ejemplo 16 x 112 x 112, 16 x 56 x 56, 24 x 28 x 28, 48 x 14 x 14 y 576 x 7 x 7), y con `num_classes=0` o `forward_head(..., pre_logits=True)` genera un vector de embedding de 576 dimensiones.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet-1k a 224 x 224.
- Extraccion de mapas de caracteristicas multi-escala mediante `features_only=True`, util para deteccion, segmentacion o tareas auxiliares.
- Generacion de embeddings de imagen (vector de 576 dimensiones) para busqueda por similitud, clustering o recuperacion.
- Uso como backbone preentrenado para transfer learning con reemplazo de la cabeza de clasificacion.
- Inferencia en CPU y en dispositivos de baja potencia gracias a su reducido numero de parametros y GMACs.
- Soporte de procesamiento por lotes (batch) a traves de la API de `timm`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingues, de audio ni de generacion de texto.

## Casos de uso

- Clasificacion de imagenes en el borde: el modelo cabe en dispositivos moviles o embebidos (Raspberry Pi, moviles Android/iOS) y permite etiquetar imagenes en local con 0,1 GMACs por inferencia, sin depender de la nube.
- Etiquetado automatico de datasets: procesar grandes volumenes de imagenes para preclasificarlas en las 1.000 categorias de ImageNet y reducir el trabajo manual de anotacion previo a un entrenamiento mayor.
- Extraccion de embeddings para busqueda visual: usar el vector de 576 dimensiones como firma para indexar un catalogo de imagenes y ofrecer busqueda por similitud o recomendacion visual.
- Backbone para transfer learning en dominios especificos: sustituir la cabeza de clasificacion y reentrenar sobre datasets propios (medicina, industria, agricultura) aprovechando el preentrenamiento en ImageNet-1k y el bajo coste de ajuste.
- Moderacion de contenido y filtrado preliminar: combinado con un clasificador especifico, sirve como primera etapa rapida para descartar o priorizar imagenes antes de pasar por modelos mas pesados.
- Control de calidad industrial en linea: clasificar piezas o productos en cadenas de produccion con latencias muy bajas sobre hardware de gama baja o aceleradores edge (Coral, Jetson Nano).
- Prototipado rapido de pipelines de vision: validar una idea de producto con `timm.create_model(..., pretrained=True)` en minutos antes de invertir en modelos mayores.
- Preprocesado de datos en investigacion: obtener representaciones de imagen para analisis estadistico, deteccion de duplicados o estudio de distribuciones de un corpus visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de resultados de `timm` para consultar metricas de precision y tiempos de ejecucion, pero no incluye cifras concretas de ImageNet top-1/top-5 en el material proporcionado.

## Requisitos de hardware

- VRAM para inferencia: muy baja. Los pesos en fp32 ocupan aproximadamente 10 MB (2,55 M de parametros) y en fp16 alrededor de 5 MB; con las activaciones (~1,4 M en fp32) y el overhead del framework, la inferencia por lotes pequenos se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funcionan sin problema RTX 3060, RTX 4090, A100 o H100, aunque el modelo tambien se ejecuta comodamente en CPU.
- Consumer GPU: si, cabe en cualquier GPU de consumo e incluso en iGPU; es uno de los modelos mas ligeros del catalogo `timm`.
- Despliegue: `timm` (PyTorch) de forma nativa; exportable a ONNX y TorchScript para servir con ONNX Runtime o TensorRT; compatible con frameworks de inferencia edge como TFLite o Core ML previa conversion; no esta pensado para vLLM ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada; el diseno MobileNet-v3 orientado a moviles sugiere latencias muy bajas, pero no se aportan cifras en el material recibido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timm/mobilenetv3_small_100.lamb_in1k | 2,55 M | 224 x 224, 1.000 clases | no disponible | apache-2.0 | HuggingFace, timm |
| timm/efficientnet_b3.ra2_in1k | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace, timm |
| timm/resnet50.a1_in1k | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace, timm |
| google/vit-base-patch16-224 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace, transformers |

Los modelos alternativos se han seleccionado por aparecer como referencias de la misma categoria (clasificacion de imagenes en ImageNet-1k con `timm` o `transformers`), pero la informacion proporcionada no incluye sus especificaciones ni metricas, por lo que no es posible establecer una comparacion cuantitativa fiable. Como referencia general de familia, EfficientNet-B3 y ResNet-50 son redes significativamente mas grandes que MobileNet-v3 small, mientras que ViT-base es un transformer de vision de mayor coste computacional.

## Limitaciones y advertencias

- Sesgos: el modelo se entrena exclusivamente con ImageNet-1k, un dataset con sesgos conocidos de representacion geografica, cultural y de genero; las predicciones pueden reflejar esos sesgos en clases sensibles.
- Alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en imagenes fuera de la distribucion de ImageNet-1k.
- Dominio limitado: solo reconoce las 1.000 clases de ImageNet-1k; para categorias nuevas o especificas hay que reentrenar la cabeza o hacer ajuste fino.
- Resolucion fija: el recetario de entrenamiento usa 224 x 224; resoluciones muy distintas pueden degradar la precision si no se adaptan las transformaciones.
- Idioma: no aplica, es un modelo puramente visual.
- Licencia: Apache-2.0, permisiva para uso comercial, pero conviene revisar las condiciones del dataset ImageNet-1k si se redistribuye el modelo o datos derivados.
- Produccion: al ser un modelo muy pequeno, su techo de precision es inferior al de arquitecturas mayores; conviene validar con datos propios antes de desplegarlo en tareas criticas.
- No dispone de capacidades de razonamiento, dialogo, tool calling ni generacion de texto, por lo que no es adecuado para casos de uso de lenguaje natural.
- La informacion disponible no incluye cifras de precision ni de robustez, lo que dificulta estimar su comportamiento real sin evaluacion propia.

## Enlaces

- HuggingFace: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- Repositorio original PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Pagina de resultados de `timm`: https://github.com/huggingface/pytorch-image-models/tree/main/results
- Paper "Searching for MobileNetV3": https://arxiv.org/abs/1905.02244
- Paper "ResNet Strikes Back" (recetario A2 de referencia): https://arxiv.org/abs/2110.00476
- Listado de modelos con libreria `timm` en HuggingFace: https://huggingface.co/models?library=timm
- Listado de modelos de clasificacion de imagenes en HuggingFace: https://huggingface.co/models?pipeline_tag=image-classification&sort=downloads
- Guia de tareas de HuggingFace (imagen de ejemplo usada en la model card): https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/beignets-task-guide.png

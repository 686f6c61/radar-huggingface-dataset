# timm/resnet50.bamboo

## Resumen

`timm/resnet50.bamboo` es una exportación a pesos nativos de timm del ResNet-50 que el equipo de Yuanhan Zhang (Shanghai AI Laboratory / SenseTime / Universidad de Sídney) publicó junto al artículo «Bamboo: Building Mega-Scale Vision Dataset Continually with Human-Machine Synergy» (arXiv:2203.07845). El modelo es una CNN residual de 50 capas de arquitectura estándar, entrenada sobre Bamboo-CLS, un subconjunto de clasificación del conjunto de datos Bamboo. La conversión no incluye reentrenamiento ni reescalado de pesos: se eliminó el wrapper del checkpoint original y el prefijo `module.`.

Su particularidad es que **no tiene clasificador**: el checkpoint publicado carece de cabeza lineal, de modo que `num_classes=0` devuelve directamente características pooled de 2.048 dimensiones para imágenes RGB de 224 × 224. Esto lo convierte en un extractor de características de propósito general, no en un modelo de clasificación listo para usar. Cuenta con unos 23,5 millones de parámetros y el repositorio ocupa 0,1 GB, por lo que es muy ligero frente a los backbones tipo ViT.

Es relevante ahora como pieza de evaluación y como backbone de transferencia: permite comparar representaciones aprendidas sobre Bamboo frente a las de ImageNet-1k o CLIP dentro del mismo ecosistema timm, con una API de carga de una sola línea. El interés práctico es acotado pero legítimo en investigación de representaciones visuales y en pipelines de *image retrieval* o *linear probing*. Hay que tener en cuenta que la licencia no está clara (ver la sección de limitaciones) y que el modelo no se ha publicado con métricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN residual de 50 capas con conexiones de identidad); backbone sin cabeza de clasificación |
| Parametros totales | 23.561.152 segun los safetensors del repo; 23.508.032 segun la model card (la diferencia corresponde a buffers como `num_batches_tracked`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada RGB de 224 x 224 pixeles) |
| Tipos de cuantizacion | no disponible; el autor solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | no disponible (el modelo no procesa texto) |
| Licencia | no disponible (declaraciones upstream contradictorias: la demo declara CC-BY-4.0; las instrucciones de descarga del dataset indican uso academico no comercial) |
| Formato de pesos | safetensors (compatible con timm / PyTorch) |
| Dimension de caracteristicas | 2.048 (pooled, con `num_classes=0`) |
| Resolucion de entrada | 224 x 224, resize bicubico del lado corto a 224 y center crop 224 (`crop_pct=1.0`) |
| Normalizacion | media `(0.485, 0.456, 0.406)`, desviacion tipica `(0.229, 0.224, 0.225)` (ImageNet) |
| Salidas del clasificador | 0 |

## Arquitectura y entrenamiento

La arquitectura es un ResNet-50 convencional: un *stem* con convolucion 7 × 7 y max pooling, seguido de cuatro etapas de bloques residuales *bottleneck* (3, 4, 6 y 3 bloques) y un *global average pooling* final. En esta exportacion se ha suprimido la capa totalmente conectada de 1.000 clases, por lo que la salida es el vector pooled de 2.048 dimensiones. La conversion, segun la model card, se limita a eliminar el wrapper del checkpoint y el prefijo `module.`; no se aplico *fine-tuning* ni reescalado de pesos.

El entrenamiento se realizo sobre Bamboo-CLS, el subconjunto de clasificacion del dataset Bamboo, descrito en el articulo como un conjunto de datos visual a escala masiva construido de forma continua mediante sinergia humano-maquina. La model card no detalla el numero de imagenes, la composicion exacta del corpus, el numero de epocas, la funcion de perdida ni si hubo etapas de ajuste adicionales; tampoco hay informacion sobre RLHF/DPO, que no aplica a un modelo puramente visual. Un detalle relevante para reproducibilidad: la receta de preprocesado de este export sigue la **configuracion del benchmark** del repositorio oficial (`rn50_bamboo_v0_1.yaml`), que usa normalizacion ImageNet; la demo de clasificacion del ViT de los autores usa una receta distinta.

## Capacidades

- Extraccion de caracteristicas visuales: devuelve un vector pooled de 2.048 dimensiones por imagen, apto para similitud coseno, clustering o recuperacion.
- Transferencia por *linear probing*: congelando el backbone y entrenando una capa lineal sobre las caracteristicas se obtiene un clasificador para dominios especificos.
- *Fine-tuning* completo del backbone para tareas de vision downstream (clasificacion, deteccion como backbone, segmentacion con cabezas adicionales).
- Recuperacion de imagenes (*image retrieval*) y deduplicacion visual mediante embeddings.
- Analisis de representaciones: comparacion de espacios latentes entre backbones entrenados con distintos corpus.
- Procesamiento por lotes en GPU con preprocesado estandar de timm (`resolve_model_data_config` / `create_transform`).
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa texto.
- No dispone de modo *thinking*, vision-languaje, audio ni generacion de texto.
- No realiza clasificacion zero-shot por si mismo: requiere una sonda entrenada o una cabeza externa.

## Casos de uso

- **Recuperacion de imagenes en un catalogo**: indexar un corpus de producto calculando el embedding de 2.048 dimensiones de cada imagen y sirviendo busquedas por similitud con un indice vectorial (FAISS, Qdrant). El coste por imagen es bajo gracias a los 23,5 M de parametros.
- **Deduplicacion y curaduria de datasets**: detectar imagenes casi duplicadas o near-duplicates en un corpus propio comparando embeddings con un umbral de similitud coseno, como paso previo al entrenamiento de otros modelos.
- **Sonda lineal para clasificacion de dominio especifico**: congelar el backbone, extraer caracteristicas de un dataset etiquetado propio (por ejemplo, control de calidad industrial) y entrenar una regresion logistica encima; util cuando hay pocas etiquetas y no se quiere reentrenar la red completa.
- **Backbone en pipelines de deteccion o segmentacion**: sustituir el extractor de un detector (RetinaNet, Faster R-CNN) o de una cabeza de segmentacion por este ResNet-50 preentrenado en Bamboo y comparar la transferencia frente a pesos ImageNet.
- **Investigacion en representaciones visuales**: usar el modelo como linea base en estudios que comparan corpus de preentrenamiento (Bamboo frente a ImageNet-1k o CLIP) manteniendo constante la arquitectura y el preprocesado.
- **Filtrado previo en pipelines de generacion de imagen**: calcular embeddings para agrupar, filtrar o puntuar imagenes generadas antes de un paso de anotacion o de entrenamiento de un modelo generativo.
- **Sistema de recomendacion visual**: alimentar un motor de recomendacion con los vectores de 2.048 dimensiones como caracteristicas de item, combinables con senales tabulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de *linear probing*, *k-NN*, *retrieval* ni comparaciones cuantitativas frente a otros backbones, y el articulo no se cita con cifras en la documentacion del repositorio.

## Requisitos de hardware

- **VRAM en inferencia**: los pesos en fp32 ocupan aproximadamente 94 MB; en fp16, unos 47 MB. El grueso del consumo son las activaciones, que dependen del tamano de lote y de la resolucion (224 × 224 como referencia).
- **GPU recomendadas**: cualquier GPU con 4 GB o mas es suficiente para inferencia con lotes moderados; una RTX 4090, A10, L4 o A100 ofrecen margen de sobra. El modelo no requiere GPU de datacenter.
- **GPU de consumo**: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos (GTX 1050 Ti en adelante), y tambien en CPU para lotes pequenos.
- **Opciones de despliegue**: timm / PyTorch como via nativa; exportacion a ONNX o TorchScript para servir con ONNX Runtime; TensorRT para maximizar *throughput*. No aplica llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponible (no se han publicado mediciones). En terminos cualitativos, es un modelo lo bastante pequeno como para ejecutarse en tiempo real en GPU moderna, pero no hay cifras oficiales en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Clasificador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `timm/resnet50.bamboo` | 23,5 M | 224 x 224 RGB; salida 2.048-d | No (0 clases) | no disponible (declaraciones upstream contradictorias) | HuggingFace, via timm |
| ResNet-50 ImageNet-1k (p. ej. `timm/resnet50.a1_in1k`) | ~25,6 M | 224 x 224 RGB; salida 1.000-d | Si (1.000 clases) | Apache-2.0 en la mayoria de variantes timm (verificar) | HuggingFace, via timm |
| ViT-B/16 de Bamboo (demo de los autores) | ~86 M (arquitectura ViT-B/16) | 224 x 224 RGB; normalizacion CLIP en la demo | Demo de clasificacion separada | CC-BY-4.0 declarada en la demo | Demo en HuggingFace Spaces; pesos via repositorio de los autores |
| CLIP RN50 (referencia de backbone multimodal) | ~102 M (torre visual + texto) | 224 x 224 RGB + texto | Proyeccion conjunta | MIT en las publicaciones de OpenAI (verificar variante) | Amplia, multiples repositorios |

Las cifras de modelos comparables son aproximadas y proceden de sus arquitecturas de referencia, no de la documentacion de este modelo. No hay datos de rendimiento comparativo disponibles para `resnet50.bamboo`.

## Limitaciones y advertencias

- **Sin clasificador**: el checkpoint no incluye cabeza de clasificacion; cualquier uso supervisado exige entrenar una sonda o anadir una capa. No sirve como clasificador listo para usar.
- **Licencia ambigua**: la model card senala explicitamente que la demo declara CC-BY-4.0 mientras las instrucciones de descarga del dataset Bamboo indican uso academico no comercial, y aclara que ninguna de las dos constituye una nueva concesion de licencia sobre los pesos convertidos. Antes de un uso comercial hay que contactar con los autores originales.
- **Riesgo de sesgo del corpus**: no se documenta la composicion de Bamboo-CLS, por lo que no es posible auditar sesgos demograficos, geograficos ni de dominio. Un modelo entrenado con datos web a escala masiva tiende a heredar los sesgos del corpus.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero no hay garantia de calibracion en las caracteristicas; la similitud coseno no implica equivalencia semantica y puede producir falsos positivos en *retrieval*.
- **Idioma**: no aplica a texto; el modelo no procesa lenguaje. No hay soporte multilingue que evaluar.
- **Dependencia del preprocesado**: la model card advierte que este export usa la receta del benchmark (normalizacion ImageNet, `crop_pct=1.0`), distinta de la demo del ViT de los autores. Usar otra normalizacion degrada las caracteristicas sin aviso.
- **Sin datos de validacion**: al no haber benchmarks publicados, no hay forma de verificar que las caracteristicas superen a las de un ResNet-50 ImageNet-1k estandar para una tarea concreta; conviene medirlo antes de adoptarlo en produccion.
- **Caveat de produccion**: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y se creo y actualizo el mismo dia. Es un artefacto reciente y sin validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/resnet50.bamboo
- Articulo (arXiv:2203.07845): https://arxiv.org/abs/2203.07845
- Repositorio oficial de Bamboo: https://github.com/ZhangYuanhan-AI/Bamboo
- Configuracion del benchmark usada en el preprocesado (`rn50_bamboo_v0_1.yaml`): https://github.com/ZhangYuanhan-AI/Bamboo/blob/f6337a76b3e48a1c5eff2bbd5b9dd044e42f0654/Bamboo-Benchmark/configs/models_cfg/rn50_bamboo_v0_1.yaml
- Instrucciones de descarga del dataset y terminos de uso: https://github.com/ZhangYuanhan-AI/Bamboo/tree/f6337a76b3e48a1c5eff2bbd5b9dd044e42f0654#downloads
- Demo de los autores (ViT-B/16, normalizacion CLIP): https://huggingface.co/spaces/CVPR/Bamboo_ViT-B16_demo
- Metadatos de la demo con la declaracion CC-BY-4.0: https://huggingface.co/spaces/CVPR/Bamboo_ViT-B16_demo/blob/2bbf27dfb670d5e1b1d3f1e0b97596f95e4c62a0/README.md
- Fichero `conversion.json` con URLs de origen y hashes SHA256: disponible en el repositorio del modelo en HuggingFace

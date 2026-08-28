# zeromodels/pvt-v2-b4

## Resumen

El modelo `zeromodels/pvt-v2-b4` es una conversión pura a Keras 3 del checkpoint `OpenGVLab/pvt_v2_b4`, perteneciente a la familia Pyramid Vision Transformer v2 (PVTv2). Desarrollado originalmente por OpenGVLab y convertido por el proyecto ZeroModels, este modelo resuelve tareas de clasificación de imágenes y extracción de características multiescala mediante una arquitectura de transformer piramidal que incorpora operaciones convolucionales. Su relevancia actual radica en que permite ejecutar el mismo checkpoint de forma idéntica sobre tres backends de Keras 3 (TensorFlow, PyTorch y JAX), lo que facilita la portabilidad entre entornos de investigación y producción.

La arquitectura PVTv2 introduce tres innovaciones clave respecto al PVT original: overlapping patch embeddings, una red feed-forward convolucional y la eliminación de los embeddings posicionales, lo que permite procesar imágenes a cualquier resolución de entrada. Con aproximadamente 62,6 millones de parámetros y un top-1 del 83,6 % en ImageNet-1k, este modelo se posiciona como un backbone ligero y eficiente para tareas de visión por computador, incluyendo detección de objetos, segmentación semántica y clasificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pyramid Vision Transformer v2 (PVTv2) |
| Parametros totales | ~62,6 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision; sin embeddings posicionales, acepta resoluciones de entrada arbitrarias) |
| Tipos de cuantizacion | No disponible (no se publican cuantizaciones oficiales) |
| Idiomas soportados | No disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Keras 3 (cargable con `from_weights`; compatible con TensorFlow, PyTorch y JAX) |

## Arquitectura y entrenamiento

PVTv2 es un transformer piramidal jerarquico que combina mecanismos de atencion con operaciones convolucionales. A diferencia del PVT original, utiliza overlapping patch embeddings para preservar la continuidad espacial local, sustituye la red feed-forward estandar por una convolutional feed-forward network que inyecta propiedades de las CNN, y elimina por completo los embeddings posicionales, de modo que el modelo puede procesar imagenes de cualquier resolucion sin interpolacion. Ademas, ofrece una variante opcional de atencion lineal (linear attention) para reducir el coste computacional en resoluciones altas. La arquitectura produce una piramide de caracteristicas en cuatro etapas, cada una con resoluciones decrecientes y canales crecientes.

El modelo fue entrenado en ImageNet-1k, alcanzando un top-1 del 83,6 %. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas como RLHF o DPO, ya que se trata de un modelo de vision supervisado de forma clasica. La conversion a Keras 3 mantiene los pesos originales del checkpoint de OpenGVLab, garantizando resultados bit-exactos respecto al modelo de referencia.

## Capacidades

- Clasificacion de imagenes: devuelve logits de clases mediante `PvtV2ImageClassify`, con normalizacion integrada en el grafo (entrada de pixeles crudos en rango [0, 255]).
- Extraccion de caracteristicas multiescala: `PvtV2Model` con `as_backbone=True` devuelve una piramide de caracteristicas de cuatro etapas, util para tareas de vision aguas abajo.
- Multi-backend: el mismo codigo y pesos funcionan sin modificaciones en TensorFlow, PyTorch y JAX, seleccionables mediante la variable de entorno `KERAS_BACKEND`.
- Soporte de resolucion arbitraria: al no usar embeddings posicionales, el modelo acepta imagenes de cualquier tamano sin necesidad de reentrenamiento.
- Compatibilidad con checkpoints originales: se pueden cargar directamente los pesos de `OpenGVLab/pvt_v2_b4` mediante `from_weights("hf:OpenGVLab/pvt_v2_b4")`.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural, al ser exclusivamente un modelo de vision.

## Casos de uso

- Clasificacion de imagenes en produccion: el modelo puede integrarse en pipelines de clasificacion generalista, aprovechando su top-1 del 83,6 % en ImageNet-1k y su normalizacion integrada, que simplifica el preprocesado.
- Backbone para deteccion de objetos: las caracteristicas de cuatro etapas de `PvtV2Model` sirven como extractor de caracteristicas para detectores como Faster R-CNN o DETR, gracias a su piramide multiescala.
- Backbone para segmentacion semantica: la salida de caracteristicas jerarquicas se puede conectar a decodificadores tipo U-Net o FPN para segmentacion de imagenes medicas, satelitales o industriales.
- Extraccion de caracteristicas para busqueda visual: los embeddings de la ultima etapa pueden usarse para construir indices de similitud en sistemas de recuperacion de imagenes por contenido.
- Fine-tuning en dominios especificos: al ser un modelo preentrenado en ImageNet, es adecuado para transfer learning en datasets reducidos, como diagnostico por imagen medica o inspeccion de calidad en manufactura.
- Despliegue multiplataforma: al ser una conversion Keras 3, el mismo checkpoint puede ejecutarse en entornos TensorFlow (produccion clasica), PyTorch (investigacion) o JAX (experimentacion), sin necesidad de convertir pesos entre frameworks.
- Prototipado rapido en notebooks: la carga con `from_weights` y la API sencilla permiten validar hipotesis de clasificacion o extraccion de caracteristicas en pocas lineas de codigo.

## Benchmarks y rendimiento

La informacion disponible solo incluye el top-1 en ImageNet-1k reportado en la model card. No se han publicado resultados adicionales (MMLU, HumanEval, etc.) por tratarse de un modelo de vision. La siguiente tabla recoge los valores de las variantes de la familia PVTv2 segun la model card:

| Variante | ImageNet-1k top-1 |
|---|---|
| pvt-v2-b0 | 70,5 % |
| pvt-v2-b1 | 78,7 % |
| pvt-v2-b2 | 82,0 % |
| pvt-v2-b2-linear | 82,1 % |
| pvt-v2-b3 | 83,1 % |
| pvt-v2-b4 | 83,6 % |
| pvt-v2-b5 | 83,8 % |

No se dispone de datos de latencia, throughput ni comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM, GPU recomendadas ni opciones de despliegue en la documentacion del modelo.
- Con aproximadamente 62,6 millones de parametros, el modelo es ligero: en precision FP32 ocuparia unos 250 MB en memoria, y en FP16 unos 125 MB, lo que sugiere que puede ejecutarse en GPUs de consumo como la RTX 3060 o superiores, aunque estos valores son estimaciones orientativas y no datos oficiales.
- Al ser un modelo Keras 3, puede desplegarse con las herramientas estandar del ecosistema Keras (TensorFlow Serving, SavedModel, etc.), pero no se mencionan integraciones con vLLM, llama.cpp u Ollama, que son especificas de modelos de lenguaje.
- No se dispone de informacion sobre latencia o throughput en diferentes hardware.

## Comparativa con modelos similares

La comparativa se limita a las variantes de la misma familia PVTv2, ya que no se dispone de datos de otros backbones comparables en la informacion proporcionada.

| Modelo | Parametros | ImageNet-1k top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|
| pvt-v2-b3 | ~40,4 M (estimado) | 83,1 % | Apache-2.0 | HuggingFace (zeromodels) |
| pvt-v2-b4 | ~62,6 M | 83,6 % | Apache-2.0 | HuggingFace (zeromodels) |
| pvt-v2-b5 | ~81,6 M (estimado) | 83,8 % | Apache-2.0 | HuggingFace (zeromodels) |

Los valores de parametros de b3 y b5 no estan confirmados en la informacion proporcionada; se indican como estimaciones. El modelo b4 ofrece un equilibrio entre tamano y precision, siendo ligeramente inferior al b5 pero con menos parametros.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no soporta tareas de lenguaje natural, tool calling ni razonamiento textual.
- Sin cuantizaciones oficiales: no se publican versiones cuantizadas (int8, int4, etc.), por lo que el despliegue en dispositivos con memoria limitada puede requerir conversion manual.
- Dependencia de Keras 3 y la libreria zeromodels: el modelo requiere instalar `zeromodels` y configurar `KERAS_BACKEND` antes de importar Keras, lo que anade una dependencia adicional al ecosistema.
- Normalizacion integrada: la entrada debe ser pixeles crudos en rango [0, 255]; si se aplica una normalizacion externa, los resultados no seran correctos.
- No se dispone de informacion sobre sesgos del modelo, riesgo de alucinacion (no aplica al no ser generativo) o limitaciones de contexto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del checkpoint original de OpenGVLab para confirmar ausencia de restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopcion limitada y una validacion comunitaria escasa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeromodels/pvt-v2-b4
- Paper original (arXiv): https://arxiv.org/abs/2106.13797
- Repositorio oficial PVT (GitHub): https://github.com/whai362/PVT
- Documentacion de ZeroModels para PVTv2: https://imvision12.github.io/ZeroModels/pvt_v2/
- Coleccion de variantes PVT y PVTv2 en HuggingFace: https://huggingface.co/collections/zeromodels/pvt-and-pvtv2-6a90e9dd0a2b03a982d0b876
- Checkpoint original de OpenGVLab: https://huggingface.co/OpenGVLab/pvt_v2_b4
- Documentacion de Transformers para PVTv2: https://huggingface.co/docs/transformers/model_doc/pvt_v2

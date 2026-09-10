# timm/qwen3_vit_306m.qwen3_5_2b

## Resumen

`timm/qwen3_vit_306m.qwen3_5_2b` es un encoder de imagen tipo ViT de 305,5 millones de parámetros extraído de los pesos de visión del modelo multimodal Qwen3.5-2B y reempaquetado de forma nativa para la librería timm (PyTorch Image Models) por Ross Wightman. No es un modelo de lenguaje ni un clasificador: es un extractor de características visuales que produce embeddings de imagen de 1024 dimensiones y mapas de características espaciales, listo para fine-tuning con una cabeza lineal. El checkpoint es un remap de pesos sin entrenamiento adicional y no conserva ningún peso del modelo de lenguaje original.

Su relevancia es doble. Por un lado, expone de forma aislada la torre visual de un modelo de la familia Qwen3.5 bajo licencia Apache 2.0, lo que permite reutilizarla como backbone en pipelines propios sin cargar los ~2.000 millones de parámetros del modelo completo. Por otro, al estar integrado en timm, hereda utilidades maduras de resolución de configuración de datos, extracción de mapas intermedios y exportación, lo que reduce el trabajo de integración a una sola línea de código.

Técnicamente opera a 768 × 768 píxeles, con anchura de backbone de 1024, 959,1 GMACs por imagen y 2.607 millones de activaciones medidas. Usa posiciones absolutas aprendidas e interpoladas más RoPE 2D axial, y acepta entradas rectangulares siempre que cada dimensión sea divisible por 16 (por 32 si se usa el merger 2×2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con MLP GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parametros totales | 305.456.128 (305,5 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (encoder de imagen; entrada de 768 x 768 px, con soporte de entradas rectangulares divisibles por 16) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB, compatible con timm y transformers) |
| Anchura del backbone | 1024 |
| GMACs | 959,1 (a 768 x 768) |
| Activaciones | 2607,0 M |
| Tamano de imagen por defecto | 768 x 768 |
| Normalizacion de entrada | media (0,5, 0,5, 0,5), desviacion (0,5, 0,5, 0,5) |
| Modelo de origen | Qwen/Qwen3.5-2B (revision 15852e8c16360a2fea060d615a32b45270f8a8fc) |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

Se trata de un transformer de vision puro. Los pesos proceden de la torre visual de Qwen3.5-2B y se han remapeado a la implementacion de timm sin ningun tipo de entrenamiento posterior, ajuste fino ni destilacion. El checkpoint no incluye la cabeza de clasificacion: el modelo devuelve embeddings agrupados (pooling promedio sobre las caracteristicas del encoder con LayerNorm sin parametros afines) hasta que el usuario anade una capa lineal. Tampoco contiene pesos del modelo de lenguaje.

Detalles de implementacion destacables: los MLP usan activacion GELU-tanh; la posicion se codifica de dos maneras complementarias, con embeddings absolutos aprendidos (interpolados segun la rejilla de entrada) y con RoPE 2D axial (regenerado en cada resolucion, no interpolado). La entrada de imagen es puramente 2D: el kernel temporal original es una Conv3d que se ha sumado en una Conv2d, de modo que se repite un unico fotograma a lo largo del kernel temporal original. `forward_features()` devuelve caracteristicas crudas sin normalizar en formato NHWC (1, 48, 48, 1024) para 768 x 768; `forward()` devuelve el embedding agrupado de 1024 dimensiones; `forward_intermediates()` permite recuperar mapas intermedios en NCHW (por ejemplo, 1, 1024, 48, 48). No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni fases de RLHF o DPO para este checkpoint, porque no hubo entrenamiento asociado al remap.

## Capacidades

- Extraccion de embeddings globales de imagen: salida de 1024 dimensiones por imagen, utilizable directamente para similitud coseno, recuperacion o clasificacion lineal.
- Extraccion de mapas de caracteristicas espaciales crudas mediante `forward_features()`, en formato NHWC.
- Recuperacion de mapas intermedios de capas concretas mediante `forward_intermediates()`, con control del formato de salida (NCHW) y del indice de capa.
- Fine-tuning para clasificacion: `timm.create_model(..., num_classes=N)` anade una cabeza lineal inicializada aleatoriamente que debe entrenarse con el conjunto objetivo.
- Soporte de entradas rectangulares, no solo cuadradas, siempre que cada dimension sea divisible por 16 (32 si se emplea el merger 2×2).
- Normalizacion de entrada preconfigurada y resoluble via `timm.data.resolve_model_data_config`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente, vision-lenguaje, audio ni modo de razonamiento. Cualquier uso conversacional requeriria el modelo base Qwen3.5-2B completo, no este checkpoint.

## Casos de uso

- Busqueda y recuperacion visual (image retrieval): el embedding agrupado de 1024 dimensiones permite indexar un corpus de imagenes en una base vectorial y recuperar las mas similares por distancia coseno, sin necesidad de entrenamiento adicional.
- Deduplicacion y curacion de datasets a gran escala: calcular embeddings de millones de imagenes y agruparlas por proximidad para detectar duplicados, near-duplicates o muestras atipicas antes de entrenar otros modelos.
- Clasificacion de imagenes por transferencia: congelar el encoder y entrenar unicamente la cabeza lineal (`num_classes=N`) en dominios como diagnostico medico, control de calidad industrial o catalogacion de producto.
- Backbone en pipelines multimodales propios: sustituir la torre visual de un VLM casero por este encoder bajo Apache 2.0 y emparejarlo con un decodificador de texto propio.
- Segmentacion densa y deteccion: los mapas intermedios de 48 x 48 a 768 x 768 ofrecen una rejilla espacial suficiente para cabezas de segmentacion semantica o de deteccion ligera anadidas sobre `forward_intermediates()`.
- Indexado de catalogos de e-commerce: generar embeddings de las fichas de producto para busqueda por similitud visual ("mas como este") o recomendacion basada en apariencia.
- Inspeccion visual automatizada en linea de produccion: extraer caracteristicas de cada pieza capturada por camara y clasificar defectos con un clasificador ligero entrenado sobre esas caracteristicas, con un coste de 0,96 TFLOPs por imagen.
- Analisis exploratorio y clustering de colecciones de imagenes: proyectar los embeddings con UMAP o t-SNE para estudiar la estructura latente de un archivo fotografico o de un dataset cientifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ImageNet, zero-shot, retrieval ni ninguna otra tarea, y al no haberse entrenado ninguna cabeza de clasificacion no existirian resultados propios que reportar. Los unicos datos de coste computacional publicados son los ya citados: 959,1 GMACs y 2.607,0 M de activaciones a 768 x 768.

## Requisitos de hardware

- Peso de los parametros: aproximadamente 1,22 GB en FP32 (4 bytes por parametro), 611 MB en FP16/BF16 y 306 MB en INT8. El repositorio ocupa 1,2 GB, coherente con pesos en FP32.
- El cuello de botella real es la activacion, no el peso: la metrica de timm indica 2.607 M de elementos de activacion a 768 x 768, del orden de 10,4 GB en FP32 y 5,2 GB en FP16 para una sola pasada. Reducir la resolucion de entrada disminuye este valor de forma aproximadamente cuadratica.
- Inferencia perfectamente viable en GPU de consumo: cabe con holgura en una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 en FP16, e incluso en GPUs de 8 GB si se baja la resolucion de entrada. No requiere A100 ni H100.
- Ejecucion en CPU posible para lotes pequenos o uso por peticion aislada, dado el reducido numero de parametros, aunque con mayor latencia.
- Opciones de despliegue: timm (`timm.create_model('hf-hub:timm/qwen3_vit_306m.qwen3_5_2b', pretrained=True)`), transformers a traves del wrapper de timm, exportacion a ONNX o TorchScript para servir con ONNX Runtime o TensorRT, y servidores de modelos como Triton o TorchServe. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponible. Como referencia de orden de magnitud, 0,96 TFLOPs por imagen es una carga baja para cualquier GPU moderna, por lo que el rendimiento practico dependera mas del preprocesado y del ancho de banda de memoria que del computo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Dimension del embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3_vit_306m.qwen3_5_2b | 305,5 M | 768 x 768 (cualquier multiple de 16) | 1024 | Apache 2.0 | HuggingFace, via timm |
| CLIP ViT-L/14 | aprox. 304 M en la torre visual (428 M con el codificador de texto) | 224 x 224 | 768 | MIT (variante OpenAI) | HuggingFace, OpenCLIP |
| DINOv2 ViT-L/14 | aprox. 304 M | 224 x 224 (adaptable) | 1024 | Apache 2.0 | HuggingFace |
| SigLIP So400m-patch14-384 | aprox. 400 M | 384 x 384 | 1152 | Apache 2.0 | HuggingFace |

La comparacion cuantitativa de rendimiento no es posible con la informacion disponible: no hay resultados publicados de este checkpoint en tareas estandar de clasificacion, recuperacion o segmentacion. Las cifras de parametros y licencias de los modelos alternativos proceden de sus propias fichas publicas y deben verificarse antes de tomar una decision de produccion. La ventaja diferencial de este modelo es la resolucion nativa alta (768 px frente a los 224 px de CLIP ViT-L/14 o DINOv2 ViT-L/14), lo que resulta relevante para tareas que requieren detalle espacial fino.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones y no soporta tool calling, agentes ni razonamiento multi-paso. Cualquier expectativa en ese sentido es un error de uso.
- No incluye cabeza de clasificacion. Las etiquetas de ImageNet u otras solo se obtienen tras entrenar la capa lineal anadida; los logits iniciales son aleatorios y carecen de significado.
- No se ha entrenado ni ajustado nada en este checkpoint. Es un remap de pesos, por lo que su calidad depende enteramente de la torre visual de Qwen3.5-2B y de como esta se haya entrenado en el modelo original.
- Sesgos: no se documenta ninguna evaluacion de sesgo, equidad o representatividad del dataset subyacente. Al tratarse de pesos heredados de un modelo multimodal, es previsible que arrastre los sesgos visuales de los datos con los que se entreno Qwen3.5-2B, que no se detallan.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto. El riesgo equivalente es la produccion de embeddings poco discriminativos en dominios muy alejados de la distribucion de entrenamiento original.
- Restriccion geometrica estricta: cada dimension de la imagen debe ser divisible por 16, y por 32 si se usa la variante con merger 2×2. Las imagenes que no cumplan esto deben redimensionarse o rellenarse, lo que altera las caracteristicas.
- Preprocesado obligatorio: la normalizacion esperada es media 0,5 y desviacion 0,5 en los tres canales RGB. Usar otra normalizacion degrada las caracteristicas de forma silenciosa.
- Limitacion de contexto: al ser un encoder de una sola imagen, no existe ventana de contexto ni procesamiento de secuencias de imagenes o video. La dimension temporal original se ha colapsado sumando los pesos Conv3d en Conv2d, por lo que no hay modelado temporal.
- Licencia: Apache 2.0, que permite uso comercial y modificacion. No obstante, el modelo base Qwen3.5-2B puede tener terminos adicionales propios; conviene revisar su licencia antes de un despliegue comercial, aunque la model card enlaza la licencia Apache 2.0 del origen.
- Comunidad practicamente inexistente: cero descargas y cero likes en el momento de la consulta, sin issues ni informes de terceros. No hay validacion externa de su comportamiento en produccion.
- Idiomas: al no procesar texto, la dimension linguistica es irrelevante para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_306m.qwen3_5_2b
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Revision de origen de los pesos: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/15852e8c16360a2fea060d615a32b45270f8a8fc/LICENSE
- Blog tecnico de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organizacion timm en HuggingFace: https://huggingface.co/timm
- Documentacion de timm en HuggingFace: https://huggingface.co/docs/timm/index
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Cita de PyTorch Image Models (Wightman, 2019): doi 10.5281/zenodo.4414861

# timm/qwen3_vit_88m.qwen3_5_0_8b

## Resumen

`timm/qwen3_vit_88m.qwen3_5_0_8b` es un codificador de características de imagen de 87,4 millones de parámetros extraído del modelo multimodal Qwen3.5-0.8B y reempaquetado como modelo nativo de la librería timm (PyTorch Image Models) por Ross Wightman. No es un modelo de lenguaje: contiene únicamente los pesos del codificador visual, remapeados al formato de timm, junto con un envoltorio listo para clasificación que aplica average pooling y LayerNorm sin parámetros afines sobre las características del encoder. La anchura del backbone es de 768 y la resolución de referencia es 768 x 768 píxeles, lo que produce una rejilla de 48 x 48 tokens (2304 parches) y un coste de 295,1 GMACs por imagen.

Su relevancia es doble. Por un lado, expone de forma aislada el encoder visual de Qwen3.5, un modelo pensado para agentes multimodales nativos, de modo que puede reutilizarse en tareas puramente visuales (recuperación, clasificación, segmentación densa) sin cargar los pesos del modelo de lenguaje. Por otro, al ser un checkpoint timm estándar, se integra con el ecosistema habitual de `timm.create_model`, `forward_features` y `forward_intermediates`, lo que facilita el fine-tuning y la extracción de mapas de características intermedios.

El checkpoint se publica bajo licencia Apache 2.0, en formato safetensors y con un tamaño de repositorio de 0,3 GB. No incluye cabeza de clasificación entrenada ni pesos de lenguaje; cualquier cabeza nueva se inicializa de forma aleatoria y debe entrenarse con datos propios. No hay resultados de benchmarks publicados asociados a este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con anchura de backbone 768, MLPs GELU-tanh, posiciones absolutas aprendidas (interpoladas) y RoPE 2D axial |
| Parametros totales | 87.414.528 (87,4 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (codificador de imagen); rejilla de 48 x 48 = 2304 tokens para 768 x 768 px |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay variantes cuantizadas oficiales) |
| Idiomas soportados | no disponible (no procesa texto; el modelo procesa imagenes RGB) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo de timm / PyTorch) |
| Tamano del repositorio | 0,3 GB |
| Resolucion de referencia | 768 x 768 px (295,1 GMACs, 978,5 M de activaciones) |
| Divisibilidad de entrada | cada dimension divisible por 16; por 32 si se usa el merger 2x2 |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Normalizacion de entrada | media = (0,5, 0,5, 0,5), desviacion = (0,5, 0,5, 0,5) |
| Salida por defecto | embedding de imagen de 768 dimensiones (`model(x)`) |

## Arquitectura y entrenamiento

El modelo es un transformer de vision puro. El backbone tiene anchura 768 y procesa la imagen como una secuencia de parches, usando posiciones absolutas aprendidas que se interpolan a la rejilla de entrada y RoPE 2D axial regenerado en cada tamano. Los bloques MLP utilizan activacion GELU-tanh. El envoltorio de timm aplica average pooling y una LayerNorm sin parametros afines, de modo que la salida `model(x)` es un vector de 768 dimensiones listo para alimentar una cabeza lineal; `forward_features(x)` devuelve las caracteristicas crudas sin normalizar en formato NHWC, con forma `(1, 48, 48, 768)` para una entrada de 768 x 768.

Un detalle tecnico relevante es el origen del codificador: los pesos originales corresponden a un modelo con kernel de parche temporal, es decir, capaz de procesar video. En esta version solo imagen, las entradas repiten un unico fotograma y los pesos del Conv3d temporal se han sumado en un Conv2d. Esto significa que el checkpoint es un remapeo nativo de los pesos de vision del modelo original, sin entrenamiento adicional alguno. No hay informacion disponible sobre el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO aplicadas al codificador visual dentro del entrenamiento de Qwen3.5.

La consecuencia practica es doble: por un lado se obtiene un encoder limpio y ligero, facil de integrar en pipelines de timm; por otro, al no haberse realizado ningun ajuste tras el remapeo, el comportamiento en tareas densas o especificas depende enteramente de la calidad de los pesos originales de Qwen3.5-0.8B y de la fidelidad del remapeo.

## Capacidades

- Extraccion de embeddings globales de imagen: `model(x)` devuelve un vector de 768 dimensiones por imagen, util para busqueda por similitud, clustering y recuperacion.
- Extraccion de caracteristicas crudas no normalizadas en formato NHWC mediante `forward_features(x)`, con resolucion de rejilla completa.
- Extraccion de mapas de caracteristicas intermedios con `forward_intermediates`, en formato NCHW o NHWC, util para tareas densas.
- Adaptacion a clasificacion: acepta `num_classes` en `timm.create_model`, anadiendo una cabeza lineal nueva (inicializada aleatoriamente) sobre el embedding agrupado.
- Soporte de entradas rectangulares, siempre que cada dimension sea divisible por 16 (o por 32 con el merger 2x2).
- Compatibilidad con el ecosistema timm: `resolve_model_data_config`, `create_transform`, exportacion a otros formatos soportados por la libreria.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: carece de pesos de lenguaje.
- No hay capacidades de audio ni de video nativas en este checkpoint (los pesos temporales fueron plegados en un Conv2d).
- Capacidades multilingues: no aplica, es un modelo puramente visual.

## Casos de uso

- Busqueda semantica y recuperacion de imagenes: generar embeddings de 768 dimensiones para cada imagen de un corpus y construir un indice vectorial; la similitud coseno sobre estos embeddings permite recuperacion por contenido sin coste de un modelo de lenguaje.
- Deduplicacion y curación de datasets visuales: extraer embeddings de un corpus grande y agrupar por distancia para detectar imagenes duplicadas o casi duplicadas antes de entrenar otros modelos.
- Fine-tuning de clasificacion de imagenes: sustituir la cabeza con `num_classes=N` y entrenar solo la cabeza (o hacer un ajuste fino completo) sobre un dataset etiquetado; con 87,4 M de parametros el entrenamiento cabe en una sola GPU de consumo.
- Segmentacion y deteccion densa: usar `forward_intermediates` para obtener mapas de caracteristicas a resolucion 48 x 48 y construir una cabeza de segmentacion semantica o un detector ligero encima.
- Moderacion de contenido visual: entrenar un clasificador binario o multietiqueta sobre los embeddings congelados para filtrar contenido no deseado en plataformas, con un coste de inferencia muy bajo.
- Preprocesado en pipelines multimodales: emplear el encoder como torre visual en una arquitectura vision-lenguaje propia, alimentando sus embeddings a un decodificador de texto independiente.
- Recuperacion aumentada en bases de datos de producto: indexar catalogos de imagenes de e-commerce y devolver los articulos visualmente mas similares a una consulta, con latencia de milisegundos en GPU.
- Distilacion hacia modelos mas pequenos: usar los embeddings del encoder como objetivo de destilacion para entrenar redes de vision mas compactas en dispositivos embebidos.
- Extraccion de caracteristicas para analisis cualitativo: estudiar la representacion interna del encoder visual de Qwen3.5 sin necesidad de cargar el modelo multimodal completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud (ImageNet, COCO, ADE20K ni similares) y las busquedas web realizadas solo devuelven documentacion general de la libreria timm, sin resultados de evaluacion para este checkpoint.

Los unicos datos de rendimiento computacional publicados son estaticos:

| Metrica | Valor |
|---|---|
| Parametros | 87,4 M |
| GMACs (768 x 768) | 295,1 |
| Activaciones | 978,5 M |
| Anchura del backbone | 768 |
| Rejilla de tokens (768 x 768) | 48 x 48 |

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 349 MB en fp32, 175 MB en fp16/bf16 y 87 MB en int8. El repositorio ocupa 0,3 GB.
- Memoria de activaciones: 978,5 M de activaciones para una imagen de 768 x 768, lo que supone del orden de 3,9 GB en fp32 y 2 GB en fp16 por elemento de lote. Es el factor limitante real, no los pesos; conviene procesar por lotes pequenos o usar checkpointing de activaciones.
- Cabe en cualquier GPU de consumo: tarjetas con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) ejecutan inferencia en fp16 sin problema con lotes pequenos. Tambien es viable en CPU para inferencia por lotes.
- GPU recomendadas segun carga: RTX 4090 o A100/H100 para extraccion masiva de caracteristicas por lotes grandes o entrenamiento de ajuste fino completo; GPU de gama media para clasificacion con backbone congelado.
- Despliegue: la via nativa es la libreria timm (`timm.create_model('hf-hub:timm/qwen3_vit_88m.qwen3_5_0_8b', pretrained=True)`); tambien es compatible con el pipeline `image-feature-extraction` de Hugging Face transformers. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto y no se publican pesos GGUF.
- Latencia y throughput: no publicados. Como referencia derivada, los 295,1 GMACs por imagen equivalen a unos 590 GFLOPs por imagen de 768 x 768, de modo que en una GPU moderna el coste por imagen es del orden de pocos milisegundos y el cuello de botella suele ser el preprocesado de imagen y la transferencia de datos, no el computo.
- Exportacion: al ser un modelo timm estandar es exportable a ONNX y a otros formatos soportados por la libreria, lo que permite desplegarlo con TensorRT o Runtime para reducir latencia.

## Comparativa con modelos similares

Comparativa con otros codificadores visuales de tamano similar. Los datos de rendimiento de este checkpoint no estan publicados, por lo que la comparacion se limita a parametros, resolucion, licencia y disponibilidad.

| Modelo | Parametros | Resolucion de referencia | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| timm/qwen3_vit_88m.qwen3_5_0_8b | 87,4 M | 768 x 768 | Apache 2.0 | timm / HF Hub, safetensors | no disponible |
| ViT-B/16 (timm, pesos ImageNet) | ~86 M | 224 x 224 | Apache 2.0 | timm / HF Hub | metricas publicadas por timm, no comparables directamente por diferencia de resolucion |
| DINOv2 ViT-B/14 | ~86 M | 518 x 518 | Apache 2.0 | HF Hub / repositorio propio | metricas publicadas por el equipo de DINOv2, no comparables directamente |
| CLIP ViT-B/16 | ~86 M (torre visual) | 224 x 224 | MIT (pesos OpenAI) | HF Hub / OpenAI | metricas publicadas de zero-shot, no comparables directamente |

Nota: las cifras de parametros y licencias de las alternativas son las habitualmente publicadas por sus autores; no se dispone de una evaluacion homogenea que permita comparar la calidad de las representaciones de este checkpoint con las de los modelos citados.

## Limitaciones y advertencias

- No contiene pesos de modelo de lenguaje ni cabeza de clasificacion entrenada. Es exclusivamente un codificador de caracteristicas visuales.
- `forward_features()` devuelve caracteristicas crudas sin normalizar en formato NHWC; si se usan directamente para similitud coseno o clasificacion conviene normalizarlas o anadir una cabeza.
- Restriccion geometrica: cada dimension de la imagen debe ser divisible por 16, y por 32 en las variantes que usan el merger 2x2. Entradas que no cumplan esto deben redimensionarse.
- El checkpoint es un remapeo de pesos, sin entrenamiento adicional. Los pesos temporales Conv3d se plegaron en un Conv2d sumandolos, por lo que la capacidad original de procesar video no se conserva en esta version.
- No se han publicado resultados de benchmarks, evaluaciones de robustez ni analisis de sesgos para este checkpoint. No hay evidencia publica de su calidad en tareas concretas mas alla de lo que indique la evaluacion propia.
- Sesgos: no documentados en la informacion disponible. Al derivar de Qwen3.5-0.8B, heredara los sesgos presentes en los datos de entrenamiento de dicho modelo, que tampoco se detallan.
- Alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es producir embeddings poco informativos o erroneos en dominios alejados de los datos de entrenamiento.
- Idioma y contexto: no aplica, el modelo solo procesa imagenes. La metadata de Hugging Face no declara idiomas soportados.
- Licencia: el checkpoint se declara Apache 2.0, pero la model card enlaza la licencia de Qwen/Qwen3.5-0.8B como fuente. Antes de un uso comercial conviene verificar los terminos vigentes de dicho modelo base, ya que la licencia del derivado no exime de comprobar la del origen.
- Produccion: el checkpoint lleva muy pocas descargas y ninguna validacion comunitaria (0 descargas, 0 likes en el momento de la consulta), de modo que no existe historial de uso en produccion que respalde su fiabilidad.
- Coste de memoria: las activaciones (978,5 M para 768 x 768) dominan el consumo de VRAM frente a los pesos (175 MB en fp16); planificar el lote en consecuencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_88m.qwen3_5_0_8b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revision exacta de los pesos de origen: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/2fc06364715b967f1860aea9cf38778875588b17/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organizacion timm en Hugging Face: https://huggingface.co/timm
- Documentacion de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

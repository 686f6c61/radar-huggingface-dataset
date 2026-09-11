# timm/deepseek_vit_412m.deepseek_v4_flash_vision_exp

## Resumen

deepseek_vit_412m.deepseek_v4_flash_vision_exp es un codificador de características de imagen (vision encoder) publicado por el equipo de timm (Ross Wightman) a partir de los pesos de visión del modelo multimodal DeepSeek-V4-Flash-Vision-Exp de DeepSeek-AI. No es un modelo de lenguaje: se trata de un Vision Transformer de 411,8 millones de parámetros con parches de 14x14 que produce embeddings de imagen de 1024 dimensiones, además de mapas de características intermedios. El checkpoint es un remapeo nativo a timm de los pesos originales, sin entrenamiento adicional y sin cabeza de clasificación entrenada.

Su relevancia práctica es doble. Por un lado, permite reutilizar la torre visual de un VLM reciente dentro del ecosistema timm, con transformaciones de datos resueltas automáticamente (`resolve_model_data_config`) y compatibilidad con el resto de utilidades de la librería. Por otro, al publicarse bajo licencia MIT, se puede emplear como extractor de características congelado para retrieval, indexado de datasets, segmentación densa o como inicialización para fine-tuning de clasificación.

La arquitectura emplea parches de 14x14, MLP con SwiGLU, RMSNorm y RoPE 2D axial, sin embeddings de posición absolutos aprendidos. La entrada por defecto es de 392x392 píxeles (rejilla de 28x28 tokens de parche) y el coste computacional declarado es de 363 GMACs por imagen, con 610,9 millones de activaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 14x14, MLP SwiGLU, RMSNorm y RoPE 2D axial; sin embeddings de posicion absolutos aprendidos |
| Parametros totales | 411.842.560 (411,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen. Resolucion por defecto 392x392 px (28x28 = 784 tokens de parche) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en FP32. Al ser un modelo timm estandar puede convertirse a FP16/BF16 o INT8 con herramientas de PyTorch, pero no hay variantes oficiales |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (cargable con timm y con transformers) |
| Autor / organizacion | timm (Ross Wightman), a partir de pesos de DeepSeek-AI |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-Vision-Exp |
| Revision de origen | 6821d6ad3681a4b137b066b76094fa82ebd0a380 |
| Ancho del backbone | 1024 |
| Dimension del embedding de imagen | 1024 (salida agrupada por average pooling) |
| Tamano de parche | 14x14 px |
| Resolucion de entrada por defecto | 392x392 px |
| Coste por imagen | 363,0 GMACs; 610,9 M de activaciones |
| Tamano del repositorio | 1,6 GB |
| Variantes incluidas | clasificador simple (pooling), `_enc` y `_align` (con aligner hacia el ancho del LLM de origen) |

## Arquitectura y entrenamiento

El modelo es un ViT puro de tipo encoder. Cada parche de 14x14 se proyecta mediante una capa lineal que en timm se reformula como `Conv2d` sin alterar el calculo. El bloque transformer usa MLPs con activacion SwiGLU, normalizacion RMSNorm y atencion con RoPE 2D axial, lo que evita depender de embeddings de posicion absolutos aprendidos y facilita trabajar con resoluciones distintas de la de entrenamiento. El ancho del backbone es 1024 y la salida final se normaliza con una RMSNorm sin parametros afines (`affine-free`), tras lo cual se aplica average pooling para obtener el embedding de imagen.

El checkpoint no incorpora entrenamiento adicional: es un remapeo de los pesos de vision del modelo DeepSeek-V4-Flash-Vision-Exp. Se conserva el aligner nativo, que agrupa tokens de parche en bloques de 3x3 en orden `channel-major` y los proyecta al ancho del LLM de origen mediante un MLP de dos capas con activacion GELU; los grupos incompletos se rellenan con ceros por abajo y por la derecha. Este aligner esta disponible en las variantes `_enc` y `_align`, pero se omite en la variante de clasificador simple, que devuelve directamente embeddings agrupados hasta que se le anade una cabeza de clasificacion. No se han publicado datos sobre el dataset de entrenamiento original, el numero de tokens de imagen, ni si hubo fases de RLHF o DPO (no aplicables a una torre visual).

En el apartado de preprocesado hay diferencias relevantes respecto de la implementacion original. La normalizacion RGB usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`, igual que el modelo de origen. La transformacion de evaluacion por defecto de timm usa `crop_mode="border"`, `crop_pct=1.0` y redimensionado bicubico sobre un lienzo fijo con relleno gris para preservar la relacion de aspecto; el procesador original selecciona dimensiones de lienzo variables y usa relleno gris 127, mientras que timm usa 128. Se admiten entradas rectangulares siempre que sus dimensiones sean divisibles por 14; con `dynamic_img_pad=True` se rellenan con ceros las entradas normalizadas por abajo y por la derecha hasta un multiplo del tamano de parche, aunque esto no reproduce la politica de resize adaptativo del modelo original.

## Capacidades

- Extraccion de embeddings de imagen: `forward()` devuelve un vector de 1024 dimensiones por imagen (salida agrupada) en la variante de clasificador.
- Extraccion de caracteristicas densas: `forward_features()` devuelve el mapa NHWC de (1, 28, 28, 1024) con la RMSNorm final aplicada.
- Mapas intermedios: `forward_intermediates()` y `features_only=True` permiten obtener mapas de caracteristicas de capas intermedias, con la opcion `norm=True` para aplicarles la RMSNorm final del encoder. Los mapas intermedios no incluyen el aligner.
- Proyeccion al espacio del LLM de origen: las variantes `_enc` y `_align` devuelven tokens NLC proyectados mediante el aligner 3x3 y el MLP GELU de dos capas.
- Entradas rectangulares: soporta imagenes no cuadradas cuyas dimensiones sean divisibles por 14, con relleno opcional mediante `dynamic_img_pad=True`.
- Fine-tuning para clasificacion: se puede instanciar con `num_classes=N` para anadir una cabeza lineal, que se inicializa de forma aleatoria y debe entrenarse.
- Uso como encoder congelado: al ser un modelo timm, se integra en pipelines estandar de PyTorch, con `torch.compile`, exportacion a ONNX o TorchScript.
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, uso de agentes ni razonamiento multi-paso: carece de pesos de lenguaje.
- No dispone de modo "thinking", entrada de audio ni capacidad de dialogo.
- Capacidades multilingues: no aplica; el modelo no procesa texto.

## Casos de uso

- Busqueda visual y retrieval de imagenes: los embeddings de 1024 dimensiones permiten construir un indice vectorial y recuperar imagenes similares por distancia coseno. Es adecuado porque el modelo esta pensado como extractor de caracteristicas puro y su salida agrupada es directamente indexable.
- Deduplicacion e indexado de datasets a gran escala: se pueden precalcular embeddings de un corpus de imagenes y detectar duplicados o near-duplicates antes de entrenar otros modelos. El coste de 363 GMACs por imagen hace viable el procesado por lotes en GPU.
- Fine-tuning para clasificacion supervisada: anadiendo una cabeza lineal (`num_classes=N`) y entrenando sobre el dataset objetivo, sirve para tareas como control de calidad industrial, clasificacion de productos o cribado de imagenes medicas.
- Segmentacion densa y tareas de vision densa: los mapas de (28, 28, 1024) y los mapas intermedios via `forward_intermediates()` proporcionan una rejilla con paso de 14 px util para cabezas de segmentacion o deteccion ligera.
- Torre visual dentro de un VLM propio: las variantes `_enc` y `_align` ya incluyen la proyeccion al ancho del LLM de origen, lo que simplifica reutilizar el encoder en una arquitectura multimodal nueva o en experimentos de destilacion.
- Sistemas de recomendacion visual: los embeddings sirven como representacion de item en un recomendador (moda, inmobiliaria, catalogo de producto), combinables con senales tabulares en una capa posterior.
- Moderacion y clasificacion de contenido: con fine-tuning especifico, el encoder puede separar categorias visuales en un pipeline de filtrado previo a la publicacion, dejando la decision final a un clasificador entrenado sobre sus features.
- Clustering no supervisado de imagenes: agrupar grandes colecciones (satelite, microscopia, catalogo editorial) usando los embeddings congelados y algoritmos como k-means o HDBSCAN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ImageNet, zero-shot, retrieval ni ninguna otra evaluacion, y tampoco se ha encontrado documentacion adicional en la busqueda web.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,65 GB solo de pesos (411,8 M de parametros x 4 bytes) mas unos 2,4 GB de activaciones (610,9 M x 4 bytes) para lote de 1 a 392x392, lo que situa el consumo practico en el entorno de 4 a 6 GB con overhead del runtime.
- VRAM estimada en FP16/BF16: alrededor de 0,83 GB de pesos y 1,2 GB de activaciones, es decir, del orden de 2 a 3 GB por lote pequeno.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Incluso tarjetas de 6-8 GB son suficientes para inferencia con lote pequeno.
- GPU de centro de datos (A100 40/80 GB, H100) recomendadas si se necesita procesar grandes volumenes por lotes o hacer fine-tuning completo del encoder.
- Inferencia en CPU: posible con PyTorch u ONNX Runtime, aunque con 363 GMACs por imagen el throughput sera bajo; adecuada solo para cargas esporadicas o batch offline.
- Opciones de despliegue: timm y PyTorch nativos, `torch.compile`, exportacion a ONNX Runtime o TensorRT, TorchScript. No hay conversion oficial a GGUF ni soporte declarado en llama.cpp u Ollama para este checkpoint. vLLM y TGI no son el cauce habitual para un encoder de imagen independiente.
- Latencia y throughput: no disponible. No se publican cifras de milisegundos por imagen ni de imagenes por segundo en ninguna GPU concreta.

## Comparativa con modelos similares

No hay resultados de benchmarks publicos de este checkpoint, por lo que la comparacion es estructural (escala, tamano de parche, resolucion, licencia y disponibilidad), no de rendimiento.

| Modelo | Parametros | Parche | Resolucion tipica | Dimension de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| timm/deepseek_vit_412m.deepseek_v4_flash_vision_exp | 411,8 M | 14 | 392x392 (rectangular con multiplos de 14) | 1024 | MIT | HuggingFace (timm), 0 descargas y 0 likes en el momento de la consulta |
| facebook/dinov2-large | 304 M | 14 | 224 (hasta 518 en variantes de alta resolucion) | 1024 | Apache-2.0 | HuggingFace, ampliamente usado y evaluado |
| openai/clip-vit-large-patch14 | 304 M (torre visual) | 14 | 224 | 1024 en el encoder, 768 tras proyeccion | MIT | HuggingFace, muy extendido |
| google/siglip-so400m-patch14-384 | 878 M en total (torre visual en torno a 428 M, dato aproximado) | 14 | 384 | no disponible con exactitud | Apache-2.0 | HuggingFace |

Frente a estas alternativas, la propuesta de timm destaca por su licencia MIT (igual que CLIP, mas permisiva en la practica que Apache-2.0 para ciertos usos) y por integrarse de forma nativa en timm, con transformaciones y utilidades de extraccion de features resueltas. Como contrapartida, carece de evaluaciones publicadas y de comunidad: zero descargas y zero likes en el momento del registro, frente a los modelos de DINOv2, CLIP o SigLIP, que cuentan con benchmarks extensos y anos de validacion en produccion.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso. Cualquier uso de ese tipo requiere anadirle un LLM aparte.
- La variante de clasificador no incluye cabeza entrenada; hay que anadir una y entrenarla con datos propios antes de obtener predicciones utiles.
- No se han publicado datos sobre el dataset de entrenamiento original, su composicion, sesgos potenciales o filtros aplicados. No es posible evaluar sesgos demograficos o culturales con la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes espurias o poco fiables en dominios alejados de los datos de vision del modelo original (por ejemplo, imagenes medicas, satelitales o tecnicas muy especificas).
- Diferencias de preprocesado respecto al modelo original: timm usa relleno gris 128 frente al 127 del procesador original y una politica de crop y resize distinta (`crop_mode="border"`, `crop_pct=1.0`). Los resultados numericos no seran identicos a los de la implementacion de referencia, algo critico si se pretende reproducir exactamente el comportamiento del VLM original.
- `dynamic_img_pad=True` no reproduce la politica de resize adaptativo del modelo de origen; solo rellena con ceros hasta un multiplo del tamano de parche.
- Las dimensiones de entrada deben ser divisibles por 14 salvo que se active el relleno dinamico.
- Al no usar embeddings de posicion absolutos aprendidos, el comportamiento en resoluciones muy alejadas de las de entrenamiento no esta documentado.
- Licencia MIT heredada del modelo base, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. No obstante, conviene verificar la licencia del repositorio DeepSeek-V4-Flash-Vision-Exp referenciado, ya que el checkpoint declara el fichero LICENSE de la revision de origen como fuente.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de la comunidad ni casos de uso reportados en produccion.
- La fecha de creacion registrada es el 11 de septiembre de 2026; conviene comprobar si existen revisiones posteriores del repositorio o del modelo base.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/timm/deepseek_vit_412m.deepseek_v4_flash_vision_exp
- Modelo base (DeepSeek-V4-Flash-Vision-Exp): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Revision de origen de los pesos: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/tree/6821d6ad3681a4b137b066b76094fa82ebd0a380
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/LICENSE
- Codigo de inferencia de vision original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/inference/vision.py
- Preprocesado original de imagen: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/inference/image_processor.py
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Citacion del modelo base (DeepSeek-AI, 2026): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Citacion de timm (Wightman, 2019; DOI 10.5281/zenodo.4414861): https://github.com/huggingface/pytorch-image-models
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a mapas de pistas de esqui de la zona del Sella Ronda y no guardan relacion con esta ficha.

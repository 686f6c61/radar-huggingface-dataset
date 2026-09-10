# timm/qwen3_vit_416m.qwen3_5_27b

## Resumen

qwen3_vit_416m.qwen3_5_27b es un codificador de caracteristicas de imagen (vision encoder) extraido de la torre de vision del modelo multimodal Qwen3.5-27B y redistribuido por el proyecto timm (PyTorch Image Models) como un checkpoint nativo de timm. No es un modelo generativo: no contiene pesos de lenguaje ni cabeza de clasificacion entrenada, y su unica funcion es producir embeddings de imagen y mapas de caracteristicas intermedios. El checkpoint tiene 415.006.704 parametros (415,0 M), anchura de backbone 1152 y trabaja sobre entradas de 768 x 768, con un coste de 1280,1 GMACs por imagen.

Su relevancia es doble. Por un lado, permite reutilizar la torre de vision de un modelo multimodal grande y reciente (Qwen3.5-27B, presentado como base para agentes multimodales nativos) en pipelines propios de vision, sin necesidad de cargar el modelo completo de 27.000 millones de parametros. Por otro lado, al estar integrado en timm, hereda toda la infraestructura de esa libreria: transformaciones estandar, extraccion de features crudas, mapas intermedios por indice de bloque y fine-tuning de clasificacion con una cabeza lineal.

Es un artefacto de "remap" sin entrenamiento adicional: la model card indica explicitamente que los pesos de vision originales se han remapeado a timm tal cual. La licencia declarada es Apache 2.0, heredada del modelo de origen. El repositorio tiene 1,7 GB y, en el momento de la ficha, registra 0 descargas y 0 "likes", por lo que se trata de una publicacion practicamente sin uso comunitario documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (ViT) con parches Conv3d temporales convertidos a Conv2d, MLP con GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parametros totales | 415.006.704 (415,0 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (codificador de imagen, no procesa texto). Entrada de imagen recomendada: 768 x 768; cada dimension debe ser divisible por 16 (por 32 si se usa el merger 2x2) |
| Tipos de cuantizacion | no se publican variantes cuantizadas. Pesos distribuidos en safetensors; convertibles a fp16/bf16 y, con herramientas externas de PyTorch/timm, a int8 |
| Idiomas soportados | no aplica (modelo de vision sin capacidades de texto); la model card no declara idiomas |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-27B, revision fc05daec18b0a78c049392ed2e771dde82bdf654) |
| Formato de pesos | safetensors (checkpoint nativo de timm, cargable via `hf-hub:timm/...`); no hay GGUF ni otros formatos |

Datos adicionales publicados en la model card: GMACs 1280,1 por imagen a 768 x 768; activaciones 2993,6 M; anchura de backbone 1152; tamano de imagen 768 x 768; normalizacion de entrada con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.

## Arquitectura y entrenamiento

Se trata de un transformer de vision (ViT) de tipo denso con anchura 1152. La model card describe varias particularidades tecnicas: los MLP usan activacion GELU-tanh; el modelo combina posiciones absolutas aprendidas con RoPE 2D de tipo axial; las posiciones absolutas se interpolan para la rejilla de entrada y el RoPE se regenera para cada tamano. La ruta de parcheo original era temporal (Conv3d) y se ha convertido a Conv2d sumando los pesos del kernel temporal, de modo que en entradas de imagen se repite un unico fotograma. El checkpoint incluye un wrapper listo para clasificacion con average pooling y LayerNorm sin parametros afines (affine-free) sobre las caracteristicas del encoder.

No ha habido entrenamiento adicional: es un remapeo de los pesos de vision de Qwen3.5-27B a la interfaz de timm, y no incorpora pesos de modelo de lenguaje ni cabeza de clasificacion entrenada. Por tanto, no se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF/DPO para este checkpoint concreto. La unica referencia de procedencia es la revision del modelo base Qwen/Qwen3.5-27B y el paper/blog de Qwen3.5 ("Towards Native Multimodal Agents").

La API expone tres modos de salida: `forward()` devuelve embeddings de imagen agrupados (pooled) con forma `(1, 1152)`; `forward_features()` devuelve caracteristicas crudas del backbone sin normalizar en formato NHWC, con forma `(1, 48, 48, 1152)` a 768 x 768; y `forward_intermediates()` permite obtener mapas de caracteristicas de bloques concretos en formato NCHW, por ejemplo `(1, 1152, 48, 48)`.

## Capacidades

- Extraccion de embeddings globales de imagen: representacion pooled de 1152 dimensiones por imagen, utilizable directamente para similitud, recuperacion o clustering.
- Extraccion de mapas de caracteristicas densos: `forward_features()` devuelve la rejilla completa (48 x 48 x 1152 a 768 x 768) sin normalizar, apta para tareas que requieren estructura espacial.
- Extraccion de caracteristicas intermedias por capa: `forward_intermediates(indices=..., output_fmt='NCHW')` permite construir cabezas de deteccion o segmentacion sobre niveles intermedios del backbone.
- Fine-tuning para clasificacion: se puede instanciar con `num_classes=N`, en cuyo caso anade una cabeza lineal inicializada aleatoriamente que debe entrenarse con datos propios.
- Soporte de entrada rectangular: la model card indica que se admiten entradas no cuadradas, siempre que cada dimension sea divisible por 16 (32 si se usa el merger 2x2).
- Normalizacion de entrada fija: transformaciones de timm con media y desviacion estandar de 0,5 sobre RGB.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, audio, tool calling ni capacidades de agente: es exclusivamente un codificador de imagen.
- No dispone de capacidades multilingues (no procesa lenguaje) ni de modo "thinking".
- Variantes de salida: la variante `_enc` devuelve tokens fusionados espacialmente desde `forward()`; la variante clasificador devuelve embeddings agrupados hasta que se anade una cabeza.

## Casos de uso

- Busqueda visual y recuperacion de imagenes: usar los embeddings pooled de 1152 dimensiones como indice vectorial (por ejemplo, en FAISS o pgvector) para recuperar imagenes similares a partir de una consulta. Es adecuado porque el vector es compacto y se obtiene en una sola pasada por el encoder.
- Deduplicacion y cura del datasets a gran escala: calcular embeddings de un corpus de imagenes y aplicar umbrales de similitud coseno para detectar duplicados o near-duplicates antes de entrenar otros modelos. La rejilla 48 x 48 x 1152 permite ademas comparar a nivel local si se necesita mas granularidad.
- Clasificacion de imagenes por transferencia: instanciar el modelo con `num_classes` igual al numero de clases del dominio (por ejemplo, 45 en el ejemplo de la model card) y entrenar unicamente la cabeza lineal, o hacer fine-tuning completo si hay datos suficientes. El backbone ya esta preentrenado en el pipeline multimodal de Qwen3.5.
- Deteccion y segmentacion densa: alimentar los mapas intermedios obtenidos con `forward_intermediates()` a una cabeza tipo FPN, UPerNet o similar, aprovechando la resolucion espacial de 48 x 48 y la anchura de 1152 canales.
- Componente de vision en un VLM propio: emplear este encoder como torre visual dentro de una arquitectura multimodal propia, con un proyector entrenado desde cero, en lugar de cargar los 27.000 millones de parametros de Qwen3.5-27B.
- Inspeccion visual industrial y control de calidad: entrenar un clasificador binario o multiclase sobre imagenes de producto a resolucion 768 x 768 para detectar defectos, con soporte de entradas rectangulares para lineas de produccion con formatos no cuadrados.
- Analisis no supervisado y organizacion de archivos: clustering de embeddings (k-means, HDBSCAN) para agrupar fotos por tematica, escena o estilo sin etiquetas.
- Destilacion y alineacion vision-lenguaje: usar el encoder congelado para generar pseudo-etiquetas o caracteristicas objetivo y entrenar un modelo mas pequeno que las reproduzca, o alinearlo con un encoder de texto en un esquema tipo CLIP con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de ImageNet, MMLU, HumanEval ni de ningun otro conjunto de evaluacion. Los unicos datos de rendimiento publicados son de coste computacional: 1280,1 GMACs y 2993,6 M de activaciones por imagen a 768 x 768, con 415,0 M de parametros.

## Requisitos de hardware

- Peso del modelo: aproximadamente 1,66 GB en fp32, 0,83 GB en fp16/bf16 y 0,42 GB en int8, calculado a partir de los 415.006.704 parametros.
- VRAM estimada para inferencia: depende del lote y la resolucion. Los pesos en bf16 son inferiores a 1 GB, pero a 768 x 768 el modelo acumula 2993,6 M de activaciones segun timm, por lo que la memoria total es varias veces superior al peso de los parametros. Se recomienda operar en bf16/fp16 y con lotes moderados.
- GPU recomendadas: para desarrollo y lotes pequenos basta una GPU consumer con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090). Para alto throughput conviene A100, H100 o L40S.
- Cabe en GPU consumer: si. Cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16 a 768 x 768 con lote 1; con lotes grandes conviene 16-24 GB.
- Opciones de despliegue: PyTorch + timm (via `timm.create_model('hf-hub:timm/qwen3_vit_416m.qwen3_5_27b', pretrained=True)`), exportacion a ONNX o TorchScript mediante las utilidades de timm, y TensorRT para produccion. No aplican vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje y no hay pesos GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia de carga, cada imagen a 768 x 768 implica 1280,1 GMACs, un coste computacionalmente significativo para un modelo de 415 M de parametros.

## Comparativa con modelos similares

La comparacion es orientativa y no se apoya en benchmarks publicados para este checkpoint. Los recuentos de parametros de los modelos alternativos son valores publicos aproximados.

| Modelo | Parametros | Resolucion tipica | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timm/qwen3_vit_416m.qwen3_5_27b | 415 M | 768 x 768 (divisible por 16) | Embeddings pooled de 1152 dim + features NHWC/NCHW | Apache 2.0 | Hugging Face, via timm. 0 descargas registradas |
| CLIP ViT-L/14 (openai) | ~304 M (aprox.) | 224 x 224 | Embeddings alineados con texto | Licencia propia de OpenAI (revisar) | Ampliamente extendido, integrado en muchas librerias |
| SigLIP SO400M (google) | ~878 M (aprox.) | 384 x 384 | Embeddings alineados con texto | Apache 2.0 | Hugging Face y transformers |
| DINOv2 ViT-L/14 (Meta) | ~300 M (aprox.) | 224 / 518 | Embeddings auto-supervisados | Apache 2.0 | Hugging Face y torch.hub |
| InternViT-300M (OpenGVLab) | ~300 M (aprox.) | 448 x 448 | Features de vision para VLM | MIT (revisar) | Hugging Face |

Frente a estas alternativas, la diferencia principal de este checkpoint es que no ha sido entrenado con un objetivo de alineacion texto-imagen ni con auto-supervision explicita, sino que hereda las caracteristicas aprendidas dentro del entrenamiento multimodal de Qwen3.5-27B. Como contrapartida, carece de cabeza entrenada, de benchmarks publicados y de uso comunitario verificable. No se dispone de datos para afirmar que supere o iguale a estas alternativas en ninguna tarea concreta.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas. Cualquier uso conversacional requeriria anadirle un modelo de lenguaje.
- No incluye cabeza de clasificacion entrenada. La cabeza que se anade con `num_classes` se inicializa aleatoriamente y hay que entrenarla con el conjunto de datos objetivo.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad de representacion en ImageNet, retrieval u otras tareas.
- Sesgos desconocidos: al proceder de Qwen3.5-27B, el encoder puede heredar los sesgos presentes en los datos de entrenamiento de ese modelo, que no se documentan en la model card.
- Restricciones de resolucion: cada dimension de la imagen debe ser divisible por 16, y por 32 si se utiliza la variante con merger 2x2. Las entradas que no cumplan esto deben redimensionarse.
- Normalizacion obligatoria: los pesos esperan entradas normalizadas con media y desviacion estandar de 0,5. Otras normalizaciones degradaran las caracteristicas.
- Manejo temporal nulo en esta implementacion: los pesos Conv3d originales se han sumado a un Conv2d y la entrada de imagen repite un unico fotograma. No debe usarse como encoder de video sin revisar el comportamiento de las capas temporales.
- Sin variantes cuantizadas oficiales: no hay GGUF, AWQ ni GPTQ publicados; cualquier cuantizacion es responsabilidad del usuario y no esta validada.
- Sin uso comunitario verificable: 0 descargas y 0 "likes" en el momento de la ficha, lo que implica ausencia de validacion externa y de casos de exito reportados.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card enlaza la licencia del modelo de origen (Qwen/Qwen3.5-27B, revision fc05daec...) como fuente. Conviene verificar ese documento antes de un despliegue comercial.
- Naturaleza del artefacto: es un reempaquetado de pesos sin entrenamiento adicional. Cualquier problema de calidad de la torre de vision original se traslada intacto a este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m.qwen3_5_27b
- Modelo base Qwen/Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Revision de origen de los pesos: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Licencia del modelo de origen: https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE
- Blog de Qwen3.5 "Towards Native Multimodal Agents": https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden a informacion sobre un campus universitario en Marsella), por lo que no se incluye ninguno.

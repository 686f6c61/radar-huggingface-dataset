# timm/qwen3_vit_416m_enc.qwen3_5_9b

## Resumen

`timm/qwen3_vit_416m_enc.qwen3_5_9b` es el codificador visual nativo extraído del modelo multimodal Qwen3.5-9B y reempaquetado por el equipo de timm (Ross Wightman) en formato compatible con la librería `timm`. No es un modelo de lenguaje: es un image feature encoder de 455,1 millones de parámetros que incluye el backbone ViT, el módulo de fusión espacial (spatial merger) y la proyección lineal hasta el ancho del LLM original (4096 dimensiones). El problema que resuelve es el de disponer de un extractor de características visuales de alta calidad, desacoplado del modelo generativo del que procede, para tareas de visión por computador puras.

La relevancia de este checkpoint es doble. Por un lado, permite reutilizar el sistema visual de un modelo frontera multimodal sin cargar los aproximadamente 9000 millones de parámetros del LLM asociado, lo que reduce drásticamente los requisitos de memoria. Por otro, su naturaleza de "remap nativo" sin entrenamiento adicional garantiza que las características extraídas son idénticas a las que vería el LLM de Qwen3.5-9B, lo que lo convierte en una pieza útil para reproducir o auditar el pipeline multimodal original, o para conectar el encoder a otras cabezas y modelos.

El checkpoint procesa imágenes a 768x768 píxeles, produce tokens espaciales proyectados de dimensión 4096 (576 tokens para una rejilla de 24x24) y mapas de características crudos de 1152 canales. Se distribuye bajo licencia Apache 2.0 y en formato safetensors, aunque no incluye pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con spatial merger y proyeccion lineal; backbone ViT del sistema visual de Qwen3.5-9B |
| Parametros totales | 455.125.744 (455,1 M; el nombre del checkpoint indica 416 M, correspondientes al backbone) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: la secuencia de salida es de 576 tokens proyectados para una entrada de 768x768 (rejilla espacial 24x24) |
| Tipos de cuantizacion | No documentados por el autor; el repositorio (1,8 GB) es coherente con pesos en fp32 sin cuantizar |
| Idiomas soportados | No disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors (libreria timm; tambien compatible con transformers) |
| Tamano del repositorio | 1,8 GB |
| Resolucion de imagen | 768 x 768 |
| GMACs | 1303,2 por imagen |
| Activaciones | 2998,6 M |
| Ancho del backbone | 1152 |
| Ancho de proyeccion | 4096 |
| Salida de `forward()` | (1, 576, 4096) tokens espaciales proyectados |
| Salida de `forward_features()` | (1, 48, 48, 1152) caracteristicas crudas del backbone en formato NHWC |
| Pipeline declarado | image-feature-extraction |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer que replica el *vision tower* de Qwen3.5-9B. La particularidad de este reempaquetado es que se ha convertido a un formato de imagen pura: las entradas de imagen repiten un unico fotograma a lo largo del kernel temporal original, de modo que los pesos temporales de la convolucion Conv3d se han sumado en una Conv2d equivalente. Esto implica que el encoder funciona correctamente con imagenes estaticas, pero ha perdido de forma deliberada cualquier capacidad de modelar informacion temporal en la entrada. El backbone emplea MLP con activacion GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial; las posiciones absolutas se interpolan segun la rejilla de entrada y el RoPE se regenera en cada tamano.

No ha habido entrenamiento adicional ni ajuste fino: segun la model card, se trata de un "native timm remap of the original vision weights", procedente de la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del repositorio de Qwen3.5-9B. El checkpoint contiene unicamente los pesos de vision, el merger espacial y la proyeccion al ancho del LLM; no incluye pesos del modelo de lenguaje ni ninguna cabeza de clasificacion entrenada. La normalizacion de las transformaciones de timm usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`, admite entradas rectangulares y exige que cada dimension de la imagen sea divisible por 16 (por 32 si se emplea el merger 2x2, que es el caso de la variante `_enc`, con salida de 576 tokens a 768x768).

## Capacidades

- Extraccion de caracteristicas de imagen: genera tokens espaciales proyectados de dimension 4096 mediante `forward()` y mapas crudos del backbone de 1152 canales mediante `forward_features()`.
- Mapas de caracteristicas intermedias: `forward_intermediates()` permite recuperar mapas a distintas profundidades (por ejemplo, (1, 1152, 48, 48) en NCHW), utiles para tareas densas.
- Compatibilidad nativa con el pipeline multimodal de Qwen3.5-9B: la proyeccion a 4096 dimensiones alinea la salida con el espacio de embeddings del LLM de origen.
- Entradas rectangulares y multiples resoluciones: soporta imagenes de distinta relacion de aspecto siempre que las dimensiones cumplan la divisibilidad exigida (16, o 32 con el merger 2x2).
- Rejilla espacial fija de 24x24 tokens para 768x768, lo que habilita tareas de localizacion y grounding sobre una rejilla conocida.
- Inferencia sin cabecera: devuelve embeddings pooled (en la variante clasificadora) o tokens fusionados (en la variante `_enc`), listos para *linear probing* o *few-shot*.
- No soporta: generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, capacidades multilingues, audio, modo *thinking* ni ninguna funcionalidad generativa. No incluye pesos de lenguaje.

## Casos de uso

- Busqueda visual e indexacion de imagenes: los tokens de 4096 dimensiones (o los embeddings pooled) sirven como firma vectorial para construir indices de similitud en bases de datos vectoriales; el encoder es lo bastante pequeno (455 M de parametros) para ejecutarse en un servidor modesto.
- Sustitucion del vision tower en un pipeline multimodal propio: al conservar la proyeccion exacta a 4096 dimensiones del Qwen3.5-9B original, se puede reconstruir el camino imagen-a-LLM y conectar el encoder a un LLM de anchura compatible para experimentar con el pipeline sin cargar el modelo completo.
- Segmentacion semantica y tareas densas: los mapas intermedios de 1152 canales y 48x48 de resolucion espacial permiten entrenar cabezas de segmentacion o deteccion ligera sobre caracteristicas preentrenadas, con menos datos que partiendo de cero.
- Clasificacion de imagenes mediante *linear probing*: congelando el encoder y entrenando una capa lineal sobre las caracteristicas pooled se obtiene un clasificador rapido de reentrenar, adecuado para taxonomias internas que cambian con frecuencia.
- Moderacion y filtrado de contenido visual: extraer caracteristicas de imagenes subidas por usuarios para alimentar un clasificador de politica de contenido, con la ventaja de que el encoder se ejecuta en GPU de consumo.
- Control de calidad industrial: comparar caracteristicas de imagenes de producto en una linea de fabricacion para detectar piezas defectuosas por distancia de embeddings frente a un conjunto de referencia de piezas correctas.
- Recuperacion aumentada para agentes visuales: usar la rejilla de 24x24 tokens como representacion espacial sobre la que un LLM externo razone en tareas de grounding, ya que la salida esta alineada con el espacio del LLM de Qwen3.5.
- Catalogacion automatica en comercio electronico: generar embeddings de imagenes de producto para deduplicacion, agrupacion por estilo y recomendacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de clasificacion, recuperacion ni segmentacion (ImageNet, COCO, ADE20K u otros), y los resultados de busqueda web recibidos no contienen informacion tecnica sobre este modelo. Como referencia de coste computacional, la propia card declara 1303,2 GMACs y 2998,6 M de activaciones por imagen de 768x768, pero no se acompana de cifras de precision ni de latencia.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 1,82 GB en fp32 (455,1 M de parametros a 4 bytes) y en torno a 0,91 GB en bf16/fp16. Son valores derivados del numero de parametros; el autor no publica cifras de despliegue.
- VRAM para activaciones: la card declara 2998,6 M de activaciones, lo que en fp32 equivaldria a unos 12 GB si se materializan todos los mapas intermedios simultaneamente; en inferencia con `torch.inference_mode()` y liberacion de intermedios, el pico real es muy inferior (estimacion orientativa de 2 a 6 GB segun resolucion y si se usan `forward_intermediates`).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente para inferencia en bf16 a 768x768. Tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090 cubren el caso de uso sin problema. Para lotes grandes o extraccion masiva de caracteristicas, A100, H100 o L40S reducen el tiempo total por throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 8-12 GB de VRAM, e incluso en iGPU o CPU para inferencia puntual, dado el tamano del modelo.
- Opciones de despliegue: PyTorch con `timm` (`timm.create_model('hf-hub:timm/qwen3_vit_416m_enc.qwen3_5_9b', pretrained=True)`), `transformers` por compatibilidad de safetensors, exportacion a ONNX Runtime o TensorRT para produccion, y TorchScript. No aplica vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia indirecta, 1303,2 GMACs por imagen de 768x768 sitian el coste por imagen muy por debajo del de un ViT-L/14 a alta resolucion, pero no se aportan medidas reales.

## Comparativa con modelos similares

Los datos de parametros y contexto de los modelos alternativos que aparecen a continuacion son cifras publicas aproximadas y no forman parte de la informacion proporcionada en esta busqueda; se incluyen solo como orientacion cualitativa.

| Modelo | Parametros | Resolucion tipica | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| timm/qwen3_vit_416m_enc.qwen3_5_9b | 455,1 M (dato confirmado) | 768x768 | 576 tokens de 4096 dim. + mapas de 1152 canales | Apache 2.0 | Vision tower de un VLM, alineado con Qwen3.5-9B; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (modelo completo) | ~9000 M (orden de magnitud, no confirmado) | No disponible | Texto y vision | No disponible en esta ficha | Incluye LLM, encoder y cabezas; mucho mayor coste de despliegue |
| SigLIP 2 (variantes ~400 M) | ~400 M (aproximado) | 384-512 px | Embeddings de imagen y texto | Apache 2.0 en varias variantes | Encoder contrastivo imagen-texto; benchmarks publicos extensos |
| DINOv2 ViT-L/14 | ~304 M (aproximado) | 518 px | Embeddings y mapas densos | Apache 2.0 | Referencia auto-supervisada para tareas densas; benchmarks publicos extensos |
| CLIP ViT-L/14 | ~304 M (aproximado) | 224 px | Embeddings alineados imagen-texto | MIT en el codigo, licencia de pesos variable | Modelo contrastivo clasico; sin alineacion con LLM generativo |

La diferencia principal frente a SigLIP 2, DINOv2 y CLIP es que este checkpoint no es un modelo autocontenido con objetivos propios, sino una pieza de un sistema multimodal mayor, lo que limita su evaluacion comparativa hasta que se publiquen resultados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones, no soporta tool calling ni razonamiento multi-paso. Cualquier caso de uso conversacional requiere acoplarlo a un LLM externo.
- No incluye cabeza de clasificacion entrenada: para clasificar hay que entrenar una capa adicional; no cabe esperar etiquetas listas para usar.
- Ausencia total de benchmarks publicados: no se puede verificar su calidad relativa frente a otros encoders sin ejecutar evaluaciones propias.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion de terceros sobre su comportamiento en produccion.
- Procesamiento exclusivamente de imagen estatica: al sumar los pesos temporales de la Conv3d en una Conv2d, el modelo pierde cualquier capacidad de modelar video o secuencias temporales.
- Restricciones de forma de entrada: cada dimension de la imagen debe ser divisible por 16, y por 32 si se usa el merger 2x2 (caso de la variante `_enc`). Entradas que no cumplan esto fallaran o requeriran redimensionado.
- Dependencia de la normalizacion: las transformaciones asumen `mean` y `std` de 0,5 en los tres canales; usar otra normalizacion degrada las caracteristicas sin aviso explicito.
- Riesgo de degradacion fuera de la resolucion de referencia: las posiciones absolutas aprendidas se interpolan y el RoPE se regenera en cada tamano, por lo que resoluciones muy alejadas de 768x768 pueden reducir la calidad de las representaciones.
- Sesgos desconocidos: el autor no documenta la composicion del dataset de entrenamiento del vision tower original, por lo que no es posible auditar sesgos de genero, etnia, geografia ni dominio.
- Licencia: Apache 2.0 permite uso comercial, pero la propia card enlaza la licencia de Qwen/Qwen3.5-9B como origen, por lo que conviene verificar la revision concreta de la que se extrajeron los pesos antes de un despliegue comercial.
- Idiomas: no aplica, pero cualquier capacidades multilingue depende por completo del LLM al que se conecte el encoder.
- Empaquetado reciente y sin versionado de produccion: publicado el 2026-09-10, sin historial de mantenimiento ni garantia de compatibilidad futura con versiones de `timm`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m_enc.qwen3_5_9b
- Modelo base, Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Revision del codigo fuente utilizada: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Blog de Qwen3.5, Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de timm: https://doi.org/10.5281/zenodo.4414861

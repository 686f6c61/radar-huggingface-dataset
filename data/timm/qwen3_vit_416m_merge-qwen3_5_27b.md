# timm/qwen3_vit_416m_merge.qwen3_5_27b

## Resumen

`timm/qwen3_vit_416m_merge.qwen3_5_27b` es un codificador de características de imagen (image feature encoder) extraído del tower de visión del modelo multimodal Qwen/Qwen3.5-27B y reempaquetado por el proyecto timm (Ross Wightman, Hugging Face) en formato nativo de esta librería. No es un modelo generativo ni un modelo de lenguaje: es únicamente el backbone visual, con 459.845.360 parámetros, sin pesos de LLM y sin cabeza de clasificación entrenada.

El problema que resuelve es concreto: permitir reutilizar el encoder visual de Qwen3.5-27B sin cargar el modelo completo de 27.000 millones de parámetros, algo inviable en hardware de consumo. Se conserva el merger espacial nativo y la proyección a anchura del LLM (5120), seguida de average pooling y LayerNorm sin affine, de modo que la salida pooled puede alimentar directamente una cabeza de clasificación o un pipeline multimodal propio.

Es relevante ahora porque expone, en un único archivo safetensors de 1,8 GB y bajo licencia Apache 2.0, un backbone ViT de 459,8 M de parámetros y 1305,9 GMACs por imagen a 768x768. El checkpoint es un remap nativo de los pesos originales, sin entrenamiento adicional, y su rendimiento real depende del fine-tuning que haga cada usuario. El repositorio no registra descargas ni likes y no incluye benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) extraído del tower de visión de Qwen3.5-27B; patch embedding, atención con RoPE 2D axial, MLPs GELU-tanh, merger espacial nativo y proyección a anchura de LLM |
| Parámetros totales | 459.845.360 (459,8 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (codificador de imagen sin entrada de texto). Entrada por defecto de 768x768, que produce 576 tokens espaciales proyectados |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No disponible (el modelo no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga mediante timm con `hf-hub:`) |
| Anchura del backbone | 1152 |
| Anchura de proyección | 5120 |
| Tamaño de parche | 16 (el merger 2x2 agrupa a parches efectivos de 32) |
| GMACs por imagen | 1305,9 a 768x768 |
| Activaciones (suma reportada) | 2999,2 M de elementos |
| Tamaño del repositorio | 1,8 GB |
| Modelo base | Qwen/Qwen3.5-27B (revisión `fc05daec18b0a78c049392ed2e771dde82bdf654`) |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión con backbone de anchura 1152 y proyección final a 5120, la anchura que espera el LLM de origen. El autor documenta tres detalles de diseño heredados del modelo original: los MLP usan activación GELU-tanh, las posiciones absolutas son aprendidas y se interpolan para la rejilla de entrada, y la atención incorpora RoPE 2D axial que se regenera para cada resolución. La entrada se parchea con kernel 16 y el merger espacial nativo devuelve tokens en formato NLC; cuando se usa el merger 2x2, la rejilla efectiva trabaja a paso 32.

No hubo entrenamiento adicional: el checkpoint es un remap nativo de los pesos de visión originales de Qwen3.5-27B, sin cabeza de clasificación y sin pesos de lenguaje. La única modificación estructural documentada es la adaptación de la entrada temporal: el kernel Conv3d temporal original se suma a un Conv2d para esta implementación solo-imagen, repitiendo un mismo fotograma en todas las posiciones del kernel temporal. Esto implica que la salida puede diferir del encoder original cuando este procesa vídeo real con varios fotogramas.

Las entradas son imágenes RGB normalizadas con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)` mediante las transformaciones de timm, y se admiten entradas rectangulares. Cada dimensión de la imagen debe ser divisible por 16, y por 32 si se emplea la variante con merger 2x2. `forward_features()` devuelve los tokens NLC proyectados (por ejemplo, 1x576x5120 a 768x768), `encoder.forward_features()` devuelve las características crudas del backbone en formato NHWC y `forward()` devuelve el embedding pooled de imagen mientras no se añada una cabeza de clasificación.

## Capacidades

- Extracción de embeddings globales de imagen: `forward()` devuelve un vector pooled de 5120 dimensiones por imagen.
- Extracción de características espaciales: `forward_features()` devuelve los tokens proyectados del merger nativo (576 tokens a 768x768) para tareas densas.
- Extracción de mapas de características intermedios: `forward_intermediates()` permite obtener mapas en formato NCHW, por ejemplo (1, 1152, 48, 48).
- Base para clasificación: `create_model(..., num_classes=N)` añade una cabeza lineal aleatoria que debe entrenarse con el dataset objetivo.
- Soporte de imágenes de resolución y relación de aspecto variables, sujeto a las restricciones de divisibilidad por 16 o 32.
- No incluye tool calling, function calling, razonamiento multi-paso, generación de texto, visión generativa, audio ni modo de pensamiento: al carecer de pesos de lenguaje y de cabeza entrenada, no realiza ninguna de estas funciones por sí mismo.
- No hay capacidades multilingües declaradas, ya que el modelo no procesa texto.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: usar el embedding pooled de 5120 dimensiones como índice vectorial para búsqueda por similitud en catálogos, bancos de imágenes o archivos fotográficos, con una sola pasada por imagen y sin necesidad de cargar el LLM de 27B.
- Clasificación con fine-tuning: inicializar el backbone con los pesos preentrenados y entrenar únicamente una cabeza lineal (`num_classes`) para tareas como clasificación de producto, diagnóstico por imagen o categorización de documentos escaneados.
- Tareas densas de visión: emplear `forward_features()` (576 tokens) o `forward_intermediates()` (mapas 1152x48x48) como entrada a cabezas de segmentación semántica, detección o estimación de profundidad.
- Deduplicación y curación de datasets a escala: calcular embeddings de grandes corpus de imágenes para agrupar near-duplicates, detectar sesgos de composición o filtrar datos antes de entrenar otros modelos.
- Componente visual de un pipeline multimodal propio: al conservar la proyección de anchura 5120 del modelo de origen, el encoder puede acoplarse a un LLM con la anchura de entrada correspondiente para construir sistemas de captioning, VQA o búsqueda multimodal, con la ventaja de que el emparejamiento de anchuras ya viene resuelto.
- Inspección visual industrial y control de calidad: con una cabeza ligera entrenada sobre las características pooled o densas, detectar defectos en línea de producción, aprovechando que el modelo cabe en GPU de gama media y puede ejecutarse en lotes grandes.
- Moderación de contenido y sistemas de recomendación visual: usar los embeddings como señal para clasificadores de contenido y para similitud entre ítems en motores de recomendación.
- Investigación sobre representaciones visuales: estudiar o comparar el tower de visión de Qwen3.5-27B de forma aislada, sin el coste de memoria del modelo completo, y verificar el efecto del remap temporal Conv3d a Conv2d.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y los resultados de la búsqueda web no contenían información relevante sobre este modelo.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,84 GB en fp32 (formato publicado), 0,92 GB en fp16/bf16 y 0,46 GB en int8.
- VRAM estimada para inferencia a 768x768 y lote 1: por debajo de 4 GB en fp16, incluyendo activaciones y buffers; es una estimación derivada del tamaño de parámetros y no una medida publicada.
- La cifra de activaciones reportada por timm (2999,2 M de elementos) es una suma acumulada de todas las capas, no el pico de memoria por capa; el consumo real está dominado por los mapas intermedios que se materialicen.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3060, RTX 4060, RTX 4090). También es viable en CPU para inferencia por lotes pequeños.
- GPU de datacenter (A100, H100, L40S) recomendadas para procesamiento por lotes a gran escala o para extracción simultánea de características intermedias.
- Opciones de despliegue: PyTorch con timm mediante `timm.create_model('hf-hub:timm/qwen3_vit_416m_merge.qwen3_5_27b', pretrained=True)`; exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT. El repositorio incluye la etiqueta `transformers`, aunque la librería declarada es timm.
- No se documenta en la información proporcionada soporte para GGUF, llama.cpp, Ollama, vLLM ni TGI; estos formatos y servidores no están publicados para este checkpoint.
- Latencia y throughput: no disponibles. El coste computacional por imagen es de 1305,9 GMACs (aproximadamente 2,6 GFLOPs) a 768x768, lo que sitúa la inferencia en el rango bajo de carga para GPUs modernas, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

No se dispone de datos de comparación en la información proporcionada. La model card no incluye métricas frente a alternativas y los resultados de la búsqueda web no aportaron información sobre modelos comparables. A continuación se indican las familias que compiten en la misma categoría (encoders de características de imagen), sin datos numéricos verificados en esta búsqueda:

| Modelo | Categoría | Parámetros | Contexto de entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|
| timm/qwen3_vit_416m_merge.qwen3_5_27b | Encoder ViT extraído de un multimodal | 459,8 M | Imagen flexible (múltiplos de 16 o 32), 768x768 por defecto | Apache 2.0 | No publicado |
| Familia CLIP (ViT-L/14 y similares) | Encoder imagen-texto | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |
| Familia SigLIP (SO400M y similares) | Encoder imagen-texto | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |
| Familia DINOv2 (ViT-L/14 y similares) | Encoder auto-supervisado de propósito general | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible |

## Limitaciones y advertencias

- No contiene pesos de lenguaje ni cabeza de clasificación entrenada: `forward()` devuelve embeddings pooled y cualquier tarea supervisada requiere entrenar una cabeza nueva con datos propios.
- El checkpoint no ha recibido entrenamiento adicional, por lo que su calidad depende enteramente del entrenamiento original del tower de visión de Qwen3.5-27B.
- Divergencia funcional respecto al modelo original en vídeo: la suma del kernel temporal Conv3d en un Conv2d y la repetición de un único fotograma modifican el comportamiento frente a entradas con múltiples fotogramas. No debe usarse como sustituto exacto del encoder original para tareas de vídeo.
- Restricciones de entrada: cada dimensión debe ser divisible por 16, y por 32 si se usa el merger 2x2. No se documenta comportamiento con entradas que incumplan esta condición.
- Sin capacidades de texto: no hay soporte multilingüe, tool calling, agentes ni razonamiento multi-paso. Cualquier función de ese tipo debe aportarla un LLM externo.
- Riesgo de sesgos: no se documenta la composición del dataset de entrenamiento original ni se han publicado evaluaciones de sesgo o robustez para este checkpoint.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios alejados de la distribución de entrenamiento del modelo original.
- Licencia Apache 2.0 según el autor, con enlace a la licencia del modelo fuente Qwen3.5-27B. Conviene verificar los términos de la licencia original antes de un uso comercial; esta ficha no constituye asesoramiento legal.
- Adopción no validada: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- El modelo incluye LayerNorm sin affine y posiciones interpoladas, por lo que debe ejecutarse en modo evaluación; los cambios de resolución respecto a la rejilla usada en el entrenamiento original pueden degradar las representaciones.
- Repositorio de 1,8 GB con pesos presumiblemente en fp32; la conversión a fp16 o int8 para reducir memoria no está documentada por el autor y puede alterar las salidas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m_merge.qwen3_5_27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Revisión concreta de los pesos de origen: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-27B/blob/fc05daec18b0a78c049392ed2e771dde82bdf654/LICENSE
- Blog de Qwen3.5, Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de timm (Zenodo): https://doi.org/10.5281/zenodo.4414861
- Nota sobre la búsqueda web: los resultados obtenidos no guardaban relación con el modelo (contenido sobre la festividad estadounidense del Labor Day), por lo que no se ha utilizado información externa procedente de ellos.

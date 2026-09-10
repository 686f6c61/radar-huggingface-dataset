# timm/qwen3_vit_416m_enc.qwen3_vl_235b_a22b

## Resumen

qwen3_vit_416m_enc.qwen3_vl_235b_a22b es un encoder de características de imagen publicado por el equipo de timm (Ross Wightman) a partir del codificador visual nativo de Qwen/Qwen3-VL-235B-A22B-Instruct. No es un modelo entrenado desde cero: es un remapeo de los pesos de visión originales al ecosistema timm, sin entrenamiento adicional, que incluye el backbone ViT, el merger espacial y la proyección a la anchura del LLM de origen (4096). El checkpoint tiene 455.125.744 parámetros (455,1 M) y ocupa 1,8 GB en el repositorio.

El modelo resuelve un problema de ingeniería concreto: extraer las representaciones visuales de un VLM de 235B sin necesidad de cargar el modelo completo. Con 768 × 768 de entrada y parches de 16 píxeles, devuelve 576 tokens proyectados de 4096 dimensiones, listos para alimentar la torre de lenguaje de Qwen3-VL o cualquier cabeza propia. El autor reporta 1303,2 GMACs y 2998,6 M de activaciones por imagen en esa resolución.

Su relevancia actual radica en que permite reutilizar un encoder visual de última generación bajo licencia Apache 2.0, con API estándar de timm (`forward_features`, `forward_intermediates`, `features_only=True`), para tareas de extracción de features, probing lineal, destilación o construcción de pipelines multimodales. Se publicó el 10 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con MLP GELU-tanh, posiciones absolutas aprendidas e interpoladas, RoPE axial 2D, merger espacial y proyección a la anchura del LLM origen |
| Parámetros totales | 455.125.744 (455,1 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: es un encoder de imagen. Entrada por defecto de 768 × 768 y salida de 576 tokens proyectados de 4096 dimensiones; admite entradas rectangulares con cada dimensión divisible por 16 (o por 32 si se usa el merger 2x2) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo de visión sin componente de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (remap nativo a timm) |
| Anchura del backbone | 1152 |
| Anchura de la proyección | 4096 |
| Resolución de entrenamiento | 768 × 768 |
| GMACs por imagen (768 × 768) | 1303,2 |
| Activaciones por imagen (768 × 768) | 2998,6 M |
| Pipeline declarado | image-feature-extraction |
| Biblioteca | timm |
| Modelo base | Qwen/Qwen3-VL-235B-A22B-Instruct (revisión 710c13861be6c466e66de3f484069440b8f31389) |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El checkpoint reproduce la torre visual de Qwen3-VL-235B-A22B-Instruct con la interfaz de timm. El backbone es un ViT de anchura 1152 con MLP de activación GELU-tanh, posiciones absolutas aprendidas que se interpolan a la rejilla de entrada y RoPE axial 2D que se regenera para cada tamaño. Para adaptarlo a imágenes estáticas, el kernel temporal Conv3d original se suma en una convolución 2D, de modo que la entrada de imagen repite un único fotograma. Tras el backbone, un merger espacial (con variante 2x2) reduce la rejilla de parches y una proyección la lleva a 4096 dimensiones, la anchura del LLM de Qwen3-VL.

No ha habido entrenamiento adicional: es un remapeo directo de los pesos de visión nativos. Como consecuencia, el checkpoint no incluye la cabeza de clasificación, no incorpora los proyectores DeepStack de Qwen3-VL (aunque las características intermedias siguen siendo accesibles) y no contiene ningún peso del modelo de lenguaje. La normalización de las transformaciones de timm usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`. `forward_features()` devuelve características NHWC sin normalizar del backbone, mientras que la variante `_enc` devuelve los tokens fusionados y proyectados.

## Capacidades

- Extracción de características de imagen: `model(x)` devuelve tensores de forma (1, 576, 4096) con los tokens espaciales fusionados y proyectados a la anchura del LLM.
- Características crudas del backbone: `model.forward_features(x)` devuelve mapas NHWC de forma (1, 48, 48, 1152) sin normalizar.
- Mapas de características intermedias: `forward_intermediates()` y `features_only=True` permiten obtener activaciones de capas concretas (por ejemplo, (1, 1152, 48, 48) con `output_fmt='NCHW'`).
- Entradas rectangulares: soporta imágenes no cuadradas siempre que cada dimensión sea divisible por 16, o por 32 si se emplea el merger 2x2.
- Compatibilidad directa con el espacio de embeddings de Qwen3-VL: la proyección a 4096 dimensiones permite conectar los tokens visuales con la torre de lenguaje del modelo base.
- No dispone de cabeza de clasificación entrenada ni de pooling integrado en la variante `_enc`; cualquier tarea supervisada requiere añadir una cabeza o definir una estrategia de agregación de tokens.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No procesa vídeo ni información temporal: el kernel temporal original se ha colapsado a 2D.
- No se documentan capacidades multilingües, de audio ni de otro tipo.

## Casos de uso

- Extracción de embeddings visuales para búsqueda por similitud e indexado de catálogos de imágenes: se ejecuta el encoder y se agregan (por ejemplo, con media o pooling sobre los 576 tokens) para obtener un vector por imagen que alimente un índice vectorial.
- Preprocesado en pipelines multimodales: los tokens de 4096 dimensiones se inyectan directamente en la torre de lenguaje de Qwen3-VL, de modo que se puede reconstruir parcialmente el pipeline del VLM sin cargar los 235B de parámetros completos.
- Ajuste fino de tareas de visión con cabeza propia (clasificación, regresión, detección ligera): al ser un encoder preentrenado de 455 M de parámetros, sirve como inicialización congelada o con fine-tuning parcial para datasets pequeños o medianos.
- Probing lineal y evaluación de representaciones: `forward_features()` y `forward_intermediates()` permiten extraer características de distintas profundidades para estudiar qué información codifica cada capa sin modificar los pesos.
- Destilación de conocimiento: se pueden generar etiquetas o embeddings del encoder grande para entrenar un ViT más pequeño que replique su comportamiento en producción con menor coste.
- Segmentación y tareas densas: los mapas intermedios de resolución 48 × 48 con 1152 canales son utilizables como entrada a decodificadores tipo U-Net para segmentación semántica o estimación de profundidad.
- Curación y filtrado de datasets de imagen-texto: los embeddings del encoder permiten detectar duplicados, outliers o pares mal alineados antes de entrenar otros modelos.
- Comparación de codificadores visuales en investigación: al exponer una API timm estándar, facilita experimentos controlados frente a CLIP, SigLIP o DINOv2 con el mismo pipeline de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas computacionales para la entrada de 768 × 768: 1303,2 GMACs y 2998,6 M de activaciones, con 455,1 M de parámetros. No hay datos de ImageNet, clasificación lineal, recuperación de imagen-texto ni ninguna otra evaluación de calidad de representaciones para este checkpoint concreto.

## Requisitos de hardware

- Peso de los parámetros: 1,82 GB en fp32 y aproximadamente 0,91 GB en fp16/bf16 (455,1 M de parámetros).
- Memoria de activaciones: el autor reporta 2998,6 M de activaciones por imagen de 768 × 768; si se materializasen todas simultáneamente en bf16 supondrían del orden de 5,7 GB, aunque en la práctica el pico de memoria es inferior. Como estimación, se recomienda un mínimo de 8 GB de VRAM para inferencia en bf16 con lote 1 y 16-24 GB para lotes mayores.
- GPU consumer: cabe con holgura en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y sin problemas en RTX 4080/4090 para lotes pequeños o resolución reducida.
- GPU de datacenter: A100, H100 o L40S son adecuadas para throughput alto y para procesar lotes grandes a 768 × 768 o resoluciones superiores.
- Opciones de despliegue: timm (biblioteca declarada) y PyTorch son la vía nativa; también es exportable a ONNX y TensorRT y compatible con `torch.compile` para acelerar la inferencia.
- Frameworks que no aplican a este checkpoint: vLLM, TGI, llama.cpp y Ollama están orientados a modelos generativos de lenguaje; este artefacto es un encoder de visión y no incluye pesos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado medidas de latencia ni de imágenes por segundo para ninguna GPU concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / parche | Tokens de salida | Licencia |
|---|---|---|---|---|
| timm/qwen3_vit_416m_enc.qwen3_vl_235b_a22b (este) | 455,1 M | 768 × 768, parche 16 + merger 2x2 | 576 tokens de 4096 dims | Apache 2.0 |
| CLIP ViT-L/14 (OpenAI) | ~304 M | 224 × 224, parche 14 | 256 tokens de 768 dims | MIT |
| SigLIP SO400M/14-384 | ~878 M | 384 × 384, parche 14 | 729 tokens de 1152 dims | Apache 2.0 |
| DINOv2 ViT-L/14 | ~304 M | 518 × 518, parche 14 | 1369 tokens de 1024 dims | Apache 2.0 |

Los datos de parámetros, resolución y dimensión de salida de los modelos alternativos proceden de su documentación pública y son aproximados. No se dispone de comparativas de rendimiento (lineal probing, recuperación, detección) entre este checkpoint y las alternativas, por lo que no es posible establecer una jerarquía de calidad a partir de la información disponible. La diferencia estructural relevante es que este encoder proyecta a 4096 dimensiones para encajar con el LLM de Qwen3-VL, mientras que las alternativas están pensadas para espacios de embeddings propios.

## Limitaciones y advertencias

- No incluye cabeza de clasificación ni pooling: para obtener un único vector por imagen hay que definir manualmente la agregación de los 576 tokens.
- No ha recibido entrenamiento adicional; su calidad depende enteramente del encoder original de Qwen3-VL-235B-A22B-Instruct.
- Los proyectores DeepStack de Qwen3-VL se han omitido, por lo que este checkpoint no reproduce exactamente el comportamiento del pipeline multimodal completo del modelo base.
- El kernel temporal se ha colapsado a 2D: no admite vídeo ni secuencias temporales.
- Restricciones de resolución: cada dimensión de la imagen debe ser divisible por 16, o por 32 si se usa el merger 2x2; no se documenta comportamiento con entradas arbitrarias.
- `forward_features()` devuelve características NHWC sin normalizar, y la normalización esperada es `mean=std=0.5`; usar otra normalización degrada las representaciones.
- No genera texto, por lo que no puede alucinar contenido lingüístico, pero sus representaciones pueden ser poco fiables en dominios alejados de los datos de entrenamiento originales (imágenes médicas, satelitales o industriales muy específicas).
- No hay evaluación publicada de sesgos para este checkpoint; los sesgos serían los heredados del encoder de Qwen3-VL y de su dataset de entrenamiento, que no se detalla en esta ficha.
- Licencia del remap: Apache 2.0. El propio autor enlaza el fichero LICENSE de Qwen3-VL como fuente; conviene verificar los términos aplicables al modelo base antes de un uso comercial.
- Estado de validación por la comunidad: 0 descargas y 0 likes en el momento de la publicación, sin issues ni informes independientes de calidad.
- Al ser un artefacto derivado y reciente (creado el 10 de septiembre de 2026), no hay garantías de mantenimiento ni de compatibilidad a largo plazo con versiones futuras de timm.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m_enc.qwen3_vl_235b_a22b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct
- Revisión del modelo base utilizada: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct/tree/710c13861be6c466e66de3f484069440b8f31389
- Qwen3-VL Technical Report (arXiv:2511.21631): https://arxiv.org/abs/2511.21631
- PyTorch Image Models (timm), repositorio: https://github.com/huggingface/pytorch-image-models
- Organización timm en HuggingFace: https://huggingface.co/timm
- Documentación de timm en HuggingFace: https://huggingface.co/docs/timm/index
- Documentación de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Fichero de licencia del modelo base: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE

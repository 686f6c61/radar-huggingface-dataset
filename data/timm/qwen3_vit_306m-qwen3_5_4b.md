# timm/qwen3_vit_306m.qwen3_5_4b

## Resumen

`timm/qwen3_vit_306m.qwen3_5_4b` es un encoder de visión extraído del modelo multimodal Qwen3.5-4B y remapeado al formato nativo de la librería timm (PyTorch Image Models). No es un modelo generativo ni un modelo de lenguaje: es exclusivamente la torre de visión de Qwen3.5-4B, publicada como extractor de características de imagen. Lo mantiene el proyecto timm, liderado por Ross Wightman dentro de Hugging Face, y se distribuye bajo licencia Apache 2.0.

El checkpoint contiene 305.456.128 parámetros (305,5 M) con un ancho de backbone de 1024, y está pensado para producir embeddings de imagen de 1024 dimensiones o mapas de características espaciales. La entrada de referencia es de 768 × 768 píxeles, con un coste declarado de 959,1 GMACs por imagen y 2607,0 M de activaciones. Su relevancia actual radica en que permite reutilizar el encoder visual de un modelo multimodal reciente sin arrastrar los pesos del modelo de lenguaje, integrándolo en pipelines de visión clásicos (clasificación, recuperación, segmentación, destilación) a través de la API estándar de timm.

El punto crítico es que se trata de un remapeo de pesos sin entrenamiento adicional: no incluye cabeza de clasificación entrenada, no procesa texto y no se ha publicado ninguna evaluación de rendimiento para este checkpoint concreto. Es, por tanto, una pieza de infraestructura para reutilización e investigación, no un modelo listo para producción sin fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) extraído de Qwen3.5-4B; MLP con activación GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parámetros totales | 305.456.128 (305,5 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; encoder de visión con entrada de referencia 768 × 768, dimensiones divisibles por 16 (o por 32 si se usa el merger 2×2) |
| Tipos de cuantización | no disponible; no se publican variantes cuantizadas ni ficheros GGUF |
| Idiomas soportados | no aplica (no procesa texto ni lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,2 GB) |

Datos adicionales declarados en la model card: ancho de backbone 1024, 959,1 GMACs, 2607,0 M de activaciones, imagen de referencia 768 × 768, revisión de origen `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del repositorio Qwen/Qwen3.5-4B.

## Arquitectura y entrenamiento

Se trata de un Vision Transformer (ViT) con ancho de backbone 1024 que corresponde a la torre de visión del modelo Qwen3.5-4B. El checkpoint publicado es un remapeo nativo a timm de esos pesos, sin entrenamiento adicional. Según la model card, el proceso de conversión incluye dos decisiones técnicas relevantes: las entradas de imagen repiten un único fotograma a lo largo del kernel temporal original, y los pesos de la convolución temporal Conv3d se suman en una Conv2d, de modo que la implementación resultante es exclusivamente para imagen y no procesa vídeo. Los MLP usan activación GELU-tanh, se emplean posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) combinadas con RoPE 2D axial (regenerado para cada tamaño de entrada).

El envoltorio de timm añade average pooling y una LayerNorm sin parámetros afines sobre las características del encoder, dejándolo preparado para añadir una cabeza de clasificación. `forward()` devuelve un embedding de imagen agrupado de forma (1, 1024); `forward_features()` devuelve las características crudas sin normalizar en formato NHWC con forma (1, 48, 48, 1024); y `forward_intermediates()` permite obtener mapas de características intermedios. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si hubo fases de RLHF o DPO en el backbone original, ya que la model card no documenta esos datos.

## Capacidades

- Extracción de embeddings globales de imagen: salida de 1024 dimensiones por imagen mediante pooling sobre las características del encoder.
- Extracción de características espaciales crudas: mapas NHWC de forma (1, 48, 48, 1024) para una entrada de 768 × 768.
- Acceso a mapas de características intermedios mediante `forward_intermediates()`, útil para tareas densas.
- Clasificación de imágenes mediante fine-tuning: se puede instanciar con `num_classes=N`, aunque la cabeza lineal se inicializa de forma aleatoria y debe entrenarse.
- Soporte de entradas rectangulares, siempre que cada dimensión sea divisible por 16 (o por 32 si se utiliza la variante con merger 2×2).
- Reutilización como backbone congelado en arquitecturas multimodales o de destilación.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, function calling, uso agéntico ni razonamiento multi-paso.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode): no procesa lenguaje.
- No procesa vídeo ni audio: la dimensión temporal original se ha colapsado a una convolución 2D.

## Casos de uso

- Recuperación de imágenes por similitud: los embeddings de 1024 dimensiones permiten indexar catálogos y buscar por vecino más cercano en un espacio vectorial, sin necesidad de entrenar ninguna cabeza adicional.
- Clasificación de imágenes por dominio específico: instanciar el modelo con `num_classes` y entrenar la cabeza lineal sobre un dataset propio (por ejemplo, defectos de fabricación, especies, tipos de documento) aprovechando que el backbone ya viene preentrenado.
- Backbone para segmentación o detección densa: `forward_intermediates()` expone mapas de (1, 1024, 48, 48) que se pueden conectar a cabezas de segmentación semántica o a decodificadores tipo DETR.
- Destilación de conocimiento hacia modelos más pequeños: al ser un encoder de 305,5 M de parámetros con 959,1 GMACs, resulta un profesor razonable para destilar hacia variantes de 50-100 M en tareas de visión concretas.
- Etiquetado y curación de datasets de imágenes a gran escala: generar embeddings para agrupar (clustering), detectar duplicados y outliers semánticos antes de entrenar otros modelos.
- Moderación de contenido visual: entrenar un clasificador ligero sobre los embeddings congelados para filtrar imágenes no aptas en plataformas de contenido generado por usuarios.
- Componente visual en pipelines multimodales propios: usar el encoder como extractor de características congelado junto a un LLM separado, sustituyendo al backbone original de Qwen3.5-4B cuando no se necesitan sus pesos de lenguaje.
- Investigación en representaciones visuales: análisis de la estructura de los mapas de características, estudios de transferencia y comparación de espacios latentes frente a otros encoders de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `timm/qwen3_vit_306m.qwen3_5_4b` no incluye métricas de ImageNet, COCO, ADE20K ni de ninguna otra evaluación, y tampoco se documentan resultados del backbone original de Qwen3.5-4B para esta configuración concreta. Los únicos datos cuantitativos disponibles son de coste computacional, no de calidad:

| Métrica de coste | Valor |
|---|---|
| Parámetros | 305,5 M |
| GMACs (768 × 768) | 959,1 |
| Activaciones | 2607,0 M |
| Ancho del backbone | 1024 |

## Requisitos de hardware

- Peso de los pesos: aproximadamente 1,2 GB en fp32 y en torno a 0,6 GB en fp16/bf16 (estimación derivada de los 305,5 M de parámetros; el repositorio ocupa 1,2 GB).
- Memoria de activaciones: la model card declara 2607,0 M de activaciones para una imagen de 768 × 768, lo que equivaldría a unos 10,4 GB si se materializasen todas en fp32. En inferencia sin gradientes el pico real es muy inferior, pero conviene dimensionar con margen y reducir el tamaño de lote si se trabaja en GPU de gama media (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar inferencia en bf16 con lotes pequeños; para lotes grandes o entrenamiento de la cabeza de clasificación son preferibles A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090, dado el tamaño de pesos inferior a 1 GB en media precisión.
- Opciones de despliegue: timm y PyTorch (vía `timm.create_model('hf-hub:timm/qwen3_vit_306m.qwen3_5_4b', pretrained=True)`); exportación a ONNX o TorchScript usando las utilidades de timm; integración como extractor en pipelines de Hugging Face Transformers. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. No hay mediciones publicadas; el único dato de coste es de 959,1 GMACs por imagen de 768 × 768.

## Comparativa con modelos similares

Comparativa con otros encoders de visión de tamaño comparable. Los datos de parámetros y resolución de los modelos alternativos provienen de sus fichas públicas; la columna de rendimiento se deja como no disponible porque no hay benchmarks en la información proporcionada para ninguno de ellos.

| Modelo | Parámetros (torre de visión) | Resolución de referencia | Licencia | Benchmarks comparables |
|---|---|---|---|---|
| timm/qwen3_vit_306m.qwen3_5_4b | 305,5 M | 768 × 768 | Apache 2.0 | no disponible |
| CLIP ViT-L/14 (OpenAI) | ~304 M | 224 × 224 | MIT (pesos con términos propios) | no disponible en esta información |
| DINOv2 ViT-L/14 (Meta) | ~304 M | 224 × 224 (hasta 518) | Apache 2.0 | no disponible en esta información |
| SigLIP ViT-L/16 (Google) | ~300 M (variante L) | 224 × 224 | Apache 2.0 | no disponible en esta información |

Diferencias cualitativas relevantes: CLIP y SigLIP son encoders alineados con texto mediante entrenamiento contrastivo, por lo que soportan búsqueda texto-imagen de serie; DINOv2 está optimizado para características densas auto-supervisadas. Este checkpoint, en cambio, es un extractor puro sin alineamiento texto-imagen y sin cabeza entrenada, con una resolución de entrada más alta (768 × 768) y un coste por imagen muy superior (959,1 GMACs frente a las decenas de GMACs típicas de los modelos a 224 × 224).

## Limitaciones y advertencias

- No incluye pesos de modelo de lenguaje ni cabeza de clasificación entrenada: los logits de una cabeza nueva son aleatorios hasta que se entrene con datos propios.
- No hay ningún benchmark publicado: no se puede afirmar que supere o iguale a otros encoders en ninguna tarea sin evaluarlo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad ni reportes de uso en producción.
- No procesa vídeo: los pesos temporales Conv3d se han sumado a una Conv2d y la entrada repite un único fotograma.
- Restricción de forma de entrada: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se usa la variante con merger 2×2. Las entradas que no cumplan esto fallarán o requerirán recorte.
- La normalización es fija y específica: `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`. Usar otra normalización degrada las características de forma silenciosa.
- `forward_features()` devuelve características crudas sin normalizar en formato NHWC, mientras que `forward()` devuelve embeddings agrupados y normalizados: confundir ambas salidas produce resultados incorrectos en pipelines posteriores.
- No aplica el concepto de alucinación generativa, pero sí puede producir embeddings poco informativos o mal calibrados en dominios muy alejados de los datos de entrenamiento originales, que no están documentados.
- Sesgos: no documentados en la información disponible. Al heredar los pesos del backbone de Qwen3.5-4B, es razonable asumir los sesgos de sus datos de entrenamiento, pero no se puede concretar sin más información.
- Licencia: el checkpoint se publica como Apache 2.0, con la licencia origen enlazada al repositorio de Qwen3.5-4B. Antes de un uso comercial conviene verificar los términos del modelo base por si imponen condiciones adicionales.
- Es un artefacto de infraestructura con fecha de creación de septiembre de 2026: puede quedar obsoleto si el proyecto timm o Qwen actualizan sus remapeos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_306m.qwen3_5_4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión de origen de los pesos: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentación de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

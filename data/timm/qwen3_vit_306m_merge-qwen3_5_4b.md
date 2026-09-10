# timm/qwen3_vit_306m_merge.qwen3_5_4b

## Resumen

`timm/qwen3_vit_306m_merge.qwen3_5_4b` es un encoder de características de imagen extraído del modelo multimodal Qwen3.5-4B y reempaquetado como checkpoint nativo de la librería timm (PyTorch Image Models). No es un modelo generativo ni un modelo de lenguaje: se trata únicamente de la torre visual del Qwen3.5-4B, con sus pesos originales remapeados al formato de timm y sin ningún entrenamiento adicional. Conserva el merger espacial nativo y la proyección al ancho del LLM, seguidos de *average pooling* y una LayerNorm sin parámetros afines.

El checkpoint tiene 332.727.808 parámetros (etiquetado como "306m" en el nombre del repositorio), una anchura de backbone de 1024 y una anchura de proyección de 2560. Trabaja con entradas de imagen de 768x768 píxeles y devuelve, por un lado, un embedding global de imagen de 2560 dimensiones y, por otro, 576 tokens espaciales proyectados (rejilla 24x24) de 2560 dimensiones cada uno. Su coste computacional declarado es de 974,8 GMACs por imagen a 768x768.

Su relevancia actual es de tipo práctico: permite reutilizar la torre visual de un VLM reciente dentro del ecosistema timm (con `forward_features`, `forward_intermediates` y fine-tuning de clasificación con una cabeza lineal) sin arrastrar los pesos del modelo de lenguaje ni depender del stack completo de Qwen. Está publicado bajo licencia Apache 2.0, aunque el repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) con RoPE axial 2D y posiciones absolutas aprendidas; MLPs GELU-tanh y merger espacial nativo |
| Parámetros totales | 332.727.808 (332,7 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada nativa de 768x768 píxeles y salida de 576 tokens espaciales (rejilla 24x24) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (encoder de imagen sin procesamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,3 GB) |
| Anchura del backbone | 1024 |
| Anchura de proyección | 2560 |
| Dimensión del embedding de imagen | 2560 |
| Tokens espaciales de salida | 576 x 2560 (formato NLC) |
| Resolución de entrada | 768x768; se admiten entradas rectangulares |
| Restricción de dimensiones | cada dimensión debe ser divisible por 16; con el merger 2x2, por 32 |
| GMACs | 974,8 por imagen a 768x768 |
| Activaciones | 2610,9 M |
| Normalización de entrada | media (0,5, 0,5, 0,5) y desviación típica (0,5, 0,5, 0,5) |
| Modelo base | Qwen/Qwen3.5-4B (revisión 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a) |
| Librería | timm (con soporte de transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión puro. El backbone emplea MLPs con activación GELU-tanh, posiciones absolutas aprendidas que se interpolan para la rejilla de entrada y RoPE axial 2D que se regenera en cada tamaño de imagen. Tras el backbone, un merger espacial nativo reduce la rejilla de parches y proyecta los tokens a la anchura del LLM (2560), de modo que las características resultantes son directamente compatibles con el espacio de embeddings multimodal de Qwen3.5-4B. La implementación en timm sustituye el kernel temporal Conv3d original por un Conv2d equivalente, obtenido sumando los pesos temporales, porque esta variante solo procesa imágenes: la entrada de imagen repite un único fotograma a lo largo del kernel temporal original. No hay, por tanto, soporte real de vídeo en este checkpoint.

No ha habido entrenamiento adicional de ningún tipo: se trata de un remapeo nativo de los pesos visuales originales, sin RLHF, sin DPO y sin ajuste fino. Tampoco incluye los pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada. La información disponible no detalla la composición del dataset de entrenamiento original ni el número de tokens vistos, más allá de la referencia al blog técnico de Qwen3.5 ("Towards Native Multimodal Agents").

## Capacidades

- Extracción de embeddings globales de imagen de 2560 dimensiones mediante `forward()` (con *average pooling* y LayerNorm sin afines).
- Extracción de tokens espaciales proyectados en formato NLC (576 x 2560) mediante `forward_features()`, adecuados para tareas densas.
- Extracción de mapas de características intermedios del backbone en formato NHWC o NCHW mediante `forward_intermediates()` (por ejemplo, `(1, 1024, 48, 48)` con `indices=3`).
- Fine-tuning de clasificación: al crear el modelo con `num_classes=N` se añade una cabeza lineal inicializada aleatoriamente que debe entrenarse con el dataset objetivo.
- Soporte de entradas rectangulares, siempre que cada dimensión sea divisible por 16 (o por 32 si se usa el merger 2x2).
- Integración directa con las utilidades de datos de timm (`resolve_model_data_config`, `create_transform`) y con el pipeline `image-feature-extraction` de Hugging Face.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni modo de pensamiento: no incorpora pesos de lenguaje.
- No dispone de clasificación zero-shot guiada por texto, ya que no incluye torre de texto ni alineación imagen-texto entrenada de forma independiente.
- Capacidades multilingües: no aplica.

## Casos de uso

- Recuperación de imágenes (image retrieval): los embeddings globales de 2560 dimensiones permiten indexar y buscar imágenes por similitud vectorial en bases de datos tipo FAISS o Milvus, sin necesidad de desplegar un VLM completo.
- Clasificación de imágenes con fine-tuning: partiendo del modelo preentrenado y añadiendo una cabeza lineal (`num_classes=N`), se puede adaptar a dominios concretos (por ejemplo, inspección de defectos, clasificación de producto) entrenando únicamente la cabeza o haciendo un ajuste ligero.
- Tareas densas de visión: los mapas intermedios de `(1, 1024, 48, 48)` y los 576 tokens espaciales permiten construir cabezas de detección, segmentación semántica o estimación de profundidad sobre una rejilla de 24x24.
- Deduplicación y curación de datasets: calcular embeddings de grandes corpus de imágenes para eliminar duplicados casi idénticos y filtrar contenido de baja calidad antes de entrenar otros modelos.
- Componente visual en pipelines multimodales: sustituir la torre visual de Qwen3.5-4B en flujos que ya trabajan con timm, manteniendo la anchura de proyección de 2560 para conectar con un proyector o un LLM propio.
- Destilación y entrenamiento de modelos estudiante: usar los tokens proyectados como objetivo (target) para entrenar encoders más pequeños, aprovechando que el modelo es un extractor congelado y determinista.
- Control de calidad industrial: extracción de características de imágenes de línea de producción para detectar anomalías mediante comparación con un banco de embeddings de referencia de piezas correctas.
- Preprocesado para búsqueda visual dentro de aplicaciones de catálogo: generar embeddings por producto para búsqueda "más como esto" en comercio electrónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara métricas de complejidad computacional, que se recogen a continuación:

| Métrica | Valor |
|---|---|
| Parámetros (M) | 332,7 |
| GMACs (768x768) | 974,8 |
| Activaciones (M) | 2610,9 |
| Tamaño de imagen | 768 x 768 |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de métricas de visión como ImageNet top-1, ya que este checkpoint no incluye cabeza de clasificación entrenada.

## Requisitos de hardware

- Pesos en safetensors con precisión fp32: el repositorio ocupa 1,3 GB, por lo que la carga del modelo requiere del orden de 1,4 GB de VRAM solo para pesos.
- El modelo declara 2610,9 M de activaciones: en fp32 a 768x768 y lote 1 eso supone aproximadamente 10,4 GB adicionales, y en bf16/fp16 unos 5,2 GB, estimación derivada del dato de activaciones de la model card.
- En bf16/fp16, el consumo total estimado para una imagen de 768x768 se sitúa en la horquilla de 6-8 GB de VRAM, incluyendo pesos, activaciones y overhead del framework.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes a alta resolución; RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti para inferencia individual en bf16.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4070 de 12 GB son suficientes en bf16 a 768x768 con lote 1. En tarjetas de 8 GB puede ser necesario reducir la resolución o el lote.
- Opciones de despliegue: timm sobre PyTorch (`timm.create_model('hf-hub:timm/qwen3_vit_306m_merge.qwen3_5_4b', pretrained=True)`), y el pipeline `image-feature-extraction` de transformers. Servidores orientados a LLM como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo. La exportación a ONNX o TorchScript y el despliegue con TensorRT no están documentados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se limita a atributos estructurales de encoders visuales ampliamente conocidos. No existe comparativa de rendimiento publicada para este checkpoint, por lo que la columna de benchmarks se marca como no disponible. Los datos de las alternativas provienen de sus model cards públicas.

| Modelo | Parámetros (torre visual) | Resolución nativa | Dimensión de embedding | Licencia | Zero-shot con texto | Benchmarks comparativos |
|---|---|---|---|---|---|---|
| qwen3_vit_306m_merge.qwen3_5_4b | 332,7 M | 768x768 (rectangular admitido) | 2560 | Apache 2.0 | no | no disponible |
| CLIP ViT-L/14 | ~303 M | 224 (hasta 336 con fine-tuning) | 768 | MIT | sí | no disponible |
| SigLIP SoViT-400m/patch14-384 | ~428 M | 384 | 1152 | Apache 2.0 | sí | no disponible |
| DINOv2 ViT-L/14 | ~304 M | 224 (hasta 518 con interpolación) | 1024 | Apache 2.0 | no | no disponible |

A diferencia de CLIP y SigLIP, este checkpoint no está alineado con texto, por lo que no sirve para clasificación zero-shot mediante prompts. Su ventaja específica es la compatibilidad dimensional con el espacio de embeddings de Qwen3.5-4B (anchura 2560) y su integración directa en timm.

## Limitaciones y advertencias

- No genera texto ni etiquetas: no incluye pesos del modelo de lenguaje ni cabeza de clasificación entrenada. Cualquier uso supervisado exige entrenar una cabeza nueva desde cero.
- No soporta zero-shot con texto, ya que no incorpora torre de texto ni alineación imagen-texto.
- No procesa vídeo: el kernel temporal Conv3d original se ha colapsado a Conv2d sumando sus pesos, de modo que la dimensión temporal se ha eliminado por completo.
- Restricciones de resolución: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se utiliza el merger 2x2. Las dimensiones que no cumplan esta condición provocarán errores de forma.
- Riesgo de alucinación: no aplica en el sentido generativo, pero un uso incorrecto del embedding (por ejemplo, como clasificador sin entrenar la cabeza) producirá salidas sin significado.
- Sesgos: la información disponible no documenta la composición del dataset de entrenamiento original de Qwen3.5-4B, por lo que no es posible caracterizar sesgos demográficos, culturales o geográficos del encoder visual.
- Idiomas: el modelo no procesa texto, por lo que cualquier capacidad multilingüe depende exclusivamente de los componentes que se conecten aguas abajo.
- Licencia: Apache 2.0, heredada del modelo base Qwen3.5-4B, lo que permite uso comercial. Conviene verificar igualmente los términos del modelo base por si existiesen condiciones adicionales no recogidas en este repositorio.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones, y fue creado y actualizado el mismo día (2026-09-10), por lo que carece de validación externa por parte de la comunidad.
- Entorno de producción: al ser un checkpoint remapeado y no entrenado, cualquier cambio en la implementación de referencia de timm o en las funciones de interpolación de posiciones puede alterar los embeddings resultantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_306m_merge.qwen3_5_4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión del código fuente del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/LICENSE
- Blog técnico de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Cuenta de timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm: https://huggingface.co/docs/timm/index
- Documentación de referencia de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

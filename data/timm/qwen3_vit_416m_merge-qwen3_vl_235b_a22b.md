# timm/qwen3_vit_416m_merge.qwen3_vl_235b_a22b

## Resumen

`timm/qwen3_vit_416m_merge.qwen3_vl_235b_a22b` es un codificador de características de imagen (ViT) extraído del modelo multimodal Qwen3-VL-235B-A22B-Instruct y reempaquetado por el equipo de PyTorch Image Models (timm, mantenido por Ross Wightman) para su uso con la librería `timm` y `transformers`. No es un modelo generativo: contiene únicamente los pesos de la torre de visión, sin los pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada, y no ha recibido entrenamiento adicional respecto al checkpoint original.

El checkpoint conserva el merger espacial nativo y la proyección al ancho del LLM (4096), a la que añade un *average pooling* y una LayerNorm sin afines, de modo que `forward()` devuelve embeddings de imagen ya agrupados y `forward_features()` devuelve los tokens espaciales proyectados en formato NLC. Con 455,1 millones de parámetros, un ancho de backbone de 1152 y 1303,2 GMACs a 768×768, es relevante porque permite reutilizar la torre visual de uno de los modelos abiertos multimodales más grandes disponibles (235B totales, 22B activos en el MoE original) como extractor de características ligero para clasificación, recuperación por similitud o destilación.

La utilidad práctica principal es servir de punto de partida para *fine-tuning* de clasificación (basta con instanciar el modelo con `num_classes=N`), para generar embeddings a escala o para obtener mapas de características intermedias mediante `features_only=True`. Al estar publicado con licencia Apache 2.0 y en formato safetensors, su integración en pipelines de visión por computador es directa, aunque carece por completo de validación comunitaria: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial nativo, posiciones absolutas aprendidas, RoPE axial 2D y MLP con activación GELU-tanh |
| Parametros totales | 455.125.744 (455,1 M) |
| Parametros activos | No aplica: este checkpoint no es MoE. El modelo base (Qwen3-VL-235B-A22B-Instruct) sí lo es, con 235B totales y 22B activos |
| Longitud de contexto | No aplica: es un codificador de imagen, no procesa secuencias de texto |
| Tipos de cuantizacion | No disponible: la model card no especifica cuantizaciones publicadas. Los pesos se distribuyen en safetensors sin indicar la precisión exacta |
| Idiomas soportados | No aplica / no disponible: modelo de extracción de características visuales, sin capacidades lingüísticas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de modelo | Codificador de características de imagen (image-feature-extraction) |
| Librería | timm |
| Ancho del backbone | 1152 |
| Ancho de proyección | 4096 |
| Resolución de entrada | 768 × 768 por defecto; soporta entradas rectangulares |
| Restricción de dimensiones | Cada dimensión debe ser divisible por 16; las variantes con merger 2×2 requieren divisibilidad por 32 |
| GMACs | 1303,2 (a 768 × 768) |
| Activaciones | 2998,6 M |
| Normalización de entrada | mean = (0,5, 0,5, 0,5), std = (0,5, 0,5, 0,5) |
| Modelo base | Qwen/Qwen3-VL-235B-A22B-Instruct |
| Revisión fuente | 710c13861be6c466e66de3f484069440b8f31389 |
| Tamaño del repositorio | 1,8 GB |
| Fecha de creación | 2026-09-10 |

## Arquitectura y entrenamiento

Se trata de un *remap* nativo a timm de los pesos de visión originales de Qwen3-VL, sin ningún entrenamiento adicional y sin cabeza de clasificación entrenada. La torre visual es un transformer con MLP de activación GELU-tanh, posiciones absolutas aprendidas más RoPE axial 2D; las posiciones absolutas se interpolan para la rejilla de entrada y el RoPE se regenera para cada tamaño. Sobre el backbone se conserva el merger espacial nativo y la proyección al ancho del LLM (de 1152 a 4096), seguidos de *average pooling* y una LayerNorm sin parámetros afines. Los proyectores DeepStack del modelo original se han omitido.

La adaptación a imagen pura implica una modificación estructural concreta: las entradas de imagen repiten un mismo fotograma a lo largo del kernel temporal original, y los pesos del Conv3d temporal se suman en un Conv2d, eliminando de facto el eje temporal. Como consecuencia, el modelo no procesa vídeo ni secuencias temporales, solo imágenes individuales. No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; al no haber entrenamiento adicional en este checkpoint, esas fases corresponderían en todo caso al modelo base Qwen3-VL-235B-A22B-Instruct, descrito en el informe técnico arXiv:2511.21631.

## Capacidades

- Extracción de embeddings de imagen agrupados: `forward(x)` devuelve un tensor de forma (1, 4096) por imagen.
- Extracción de tokens espaciales proyectados: `forward_features(x)` devuelve (1, 576, 4096) en formato NLC, útil para tareas densas o atención sobre parches.
- Acceso a características crudas del backbone: `encoder.forward_features(x)` devuelve mapas NHWC sin proyectar, con ancho 1152.
- Mapas de características intermedias: `forward_intermediates()` y `features_only=True` permiten obtener mapas NCHW (por ejemplo, (1, 1152, 48, 48) en las capas solicitadas).
- Fine-tuning para clasificación: instanciando el modelo con `num_classes=N` se añade una cabeza lineal aleatoria que debe entrenarse con el dataset objetivo.
- Soporte de entradas rectangulares sujeto a la restricción de divisibilidad por 16 (o 32 con merger 2×2).
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento multilingüe: carece de pesos de lenguaje.
- No soporta visión temporal ni vídeo, audio u otras modalidades.

## Casos de uso

- Clasificación de imágenes mediante fine-tuning: se carga el modelo con `num_classes` ajustado al número de clases del dominio (el ejemplo de la model card usa 45) y se entrena únicamente la cabeza, aprovechando que los pesos del backbone ya provienen de un entrenamiento multimodal a gran escala.
- Recuperación de imágenes por similitud: los embeddings agrupados de 4096 dimensiones permiten construir índices vectoriales para búsqueda visual (k-NN o bases vectoriales), comparando directamente la salida de `forward()`.
- Destilación de un modelo multimodal grande: al ser la torre visual de Qwen3-VL-235B-A22B-Instruct, sirve como extractor de referencia para destilar capacidades visuales hacia modelos más pequeños sin necesidad de cargar el MoE completo de 235B.
- Preentrenamiento de tareas densas (detección, segmentación, estimación de profundidad) usando los mapas intermedios de `features_only=True`, que evitan la proyección al espacio del LLM y ofrecen resoluciones espaciales de 48×48 con 1152 canales.
- Etiquetado y curación de datasets: generar embeddings sobre un corpus de imágenes para agrupar, deduplicar o detectar muestras anómalas antes de entrenar otros modelos.
- Control de calidad industrial o médico con imágenes rectangulares: la admisión de entradas no cuadradas con divisibilidad por 16 permite trabajar con formatos de cámara o escáner sin recortes agresivos.
- Construcción de *baselines* de visión reproducible en entornos timm: al ser un checkpoint pequeño (1,8 GB) y sin dependencias del stack de LLM, se integra en pipelines de experimentación rápida con una sola llamada a `timm.create_model`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, COCO, retrieval ni ninguna otra evaluación, y no se ha realizado entrenamiento adicional que pudiera respaldar cifras propias. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,8 GB en FP32, 0,9 GB en FP16/BF16 y 0,45 GB en INT8 (cálculo derivado de los 455,1 M de parámetros; la precisión real del repositorio no se especifica).
- Footprint de activaciones elevado: la model card declara 2998,6 M de activaciones a 768×768, lo que en FP16 ronda los 6 GB y en FP32 unos 12 GB en el peor caso de resolución completa y lote pequeño. Para lotes grandes conviene reducir la resolución efectiva o usar *gradient checkpointing*.
- GPU recomendadas: cualquier GPU con 8 GB o más es suficiente para inferencia a 768×768; para entrenamiento de la cabeza o *fine-tuning* completo se recomienda 16-24 GB (RTX 4090, L4, A10G, A100).
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 en FP16, incluso con margen para lotes moderados.
- Opciones de despliegue: uso directo con `timm` sobre PyTorch, exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT. No está pensado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos publicados en la información disponible. La comparación paramétrica con otros extractores de características visuales habituales se ofrece a título orientativo, con cifras aproximadas de conocimiento general no verificadas en la documentación de este checkpoint.

| Modelo | Parámetros (aprox.) | Tipo | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| qwen3_vit_416m_merge.qwen3_vl_235b_a22b | 455,1 M | ViT de Qwen3-VL, salida proyectada a 4096 | Apache 2.0 | timm / HuggingFace, safetensors | No disponible |
| Qwen3-VL-235B-A22B-Instruct (completo) | 235 B totales / 22 B activos | MoE multimodal (visión + lenguaje) | Apache 2.0 | HuggingFace | No disponible en esta ficha |
| DINOv2 ViT-L/14 | ~300 M | ViT auto-supervisado | Apache 2.0 | HuggingFace / torch.hub | No disponible |
| CLIP ViT-L/14 | ~428 M (con torre de texto) | ViT + transformer de texto contrastivo | MIT (variante OpenAI) | HuggingFace | No disponible |
| SigLIP SO400M/14 | ~400 M | ViT con pérdida sigmoidea contrastiva | Apache 2.0 | HuggingFace | No disponible |

## Limitaciones y advertencias

- No contiene pesos de modelo de lenguaje ni cabeza de clasificación entrenada: no puede generar texto, razonar ni responder preguntas, y `forward()` solo produce embeddings.
- No ha recibido ningún entrenamiento adicional respecto al checkpoint original; se trata de un remap de pesos con la adaptación temporal Conv3d → Conv2d.
- Los proyectores DeepStack del modelo original están omitidos, por lo que se pierde esa vía de características intermedias del Qwen3-VL completo.
- No procesa vídeo: la suma de los pesos temporales colapsa el eje de tiempo a una única imagen repetida.
- Restricción geométrica estricta: las dimensiones de entrada deben ser divisibles por 16 (o por 32 si se emplea el merger 2×2), lo que puede exigir redimensionado o *padding* previo.
- No hay resultados de benchmarks publicados ni validación independiente; con 0 descargas y 0 likes, el checkpoint no ha sido probado por la comunidad.
- La precisión de los pesos en safetensors no se especifica en la model card, lo que dificulta planificar el consumo de memoria exacto.
- Hereda los sesgos del corpus de entrenamiento del modelo base Qwen3-VL, que no se documentan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos aplicables al modelo base Qwen3-VL en su propio repositorio antes de desplegarlo en producción.
- Ausencia total de soporte multilingüe y de cualquier capacidad de texto: no debe emplearse en pipelines que esperen entrada o salida en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m_merge.qwen3_vl_235b_a22b
- Modelo base Qwen3-VL-235B-A22B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct
- Revisión fuente de los pesos: https://huggingface.co/Qwen/Qwen3-VL-235B-A22B-Instruct/tree/710c13861be6c466e66de3f484069440b8f31389
- Informe técnico de Qwen3-VL (arXiv:2511.21631): https://arxiv.org/abs/2511.21631
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Origen de la licencia del modelo base: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE

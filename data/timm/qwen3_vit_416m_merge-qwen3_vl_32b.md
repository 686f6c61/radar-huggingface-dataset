# timm/qwen3_vit_416m_merge.qwen3_vl_32b

## Resumen

`qwen3_vit_416m_merge.qwen3_vl_32b` es un codificador de características de imagen publicado por el equipo de timm (Ross Wightman) a partir del módulo de visión de Qwen3-VL-32B-Instruct. No es un modelo de lenguaje ni un modelo multimodal completo: es un remapeo nativo a timm de los pesos del ViT de Qwen3-VL, sin entrenamiento adicional, que conserva el merger espacial original y la proyección al ancho del LLM (5120 dimensiones), seguida de un *average pooling* y una LayerNorm sin parámetros afines. El checkpoint resultante tiene 459.845.360 parámetros y se distribuye en safetensors bajo licencia Apache 2.0.

Su relevancia es práctica: permite reutilizar el encoder visual de un VLM de 32B como extractor de características independiente, con API de timm (`forward_features`, `forward_intermediates`, `features_only=True`) y listo para añadir una cabeza de clasificación lineal. Es útil para *retrieval* visual, clasificación por *fine-tuning*, extracción de mapas intermedios para tareas densas y para construir o destilar pipelines multimodales que necesiten exactamente la misma representación que ve Qwen3-VL-32B antes de entrar en el LLM.

Al proceder de un remapeo y no de un entrenamiento nuevo, hereda las capacidades y los sesgos del ViT original, pero no incluye los proyectores DeepStack ni los pesos del modelo de lenguaje, y no se ha publicado ninguna evaluación de rendimiento específica para este checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) con patch embedding, MLP GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial; merger espacial nativo + proyección al ancho del LLM |
| Parámetros totales | 459.845.360 (459,8 M) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica: es un codificador de imágenes, no procesa secuencias de texto |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors (no hay variantes GGUF, INT8 ni INT4 documentadas) |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 (etiquetada en el repositorio; la model card enlaza además la licencia de origen de Qwen3-VL) |
| Formato de pesos | safetensors (tamaño del repositorio: 1,8 GB) |
| Ancho del backbone | 1152 |
| Ancho de proyección | 5120 |
| Resolución de referencia | 768 x 768 |
| GMACs | 1305,9 |
| Activaciones | 2999,2 M |
| Modelo base | Qwen/Qwen3-VL-32B-Instruct (revisión 0cfaf48183f594c314753d30a4c4974bc75f3ccb) |
| Librería | timm (integración con `transformers` vía `hf-hub:`) |

## Arquitectura y entrenamiento

El modelo es un transformer de visión en el que el parche temporal original se ha colapsado: las entradas de imagen repiten un único fotograma a lo largo del kernel temporal, de modo que los pesos de la Conv3d temporal se suman en una Conv2d para esta implementación exclusivamente de imagen. El backbone emplea MLP con activación GELU-tanh, posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) y RoPE 2D axial, que se regenera para cada tamaño de imagen. Sobre el backbone se mantiene el merger espacial nativo y la proyección de 5120 dimensiones, tras lo cual se aplica *average pooling* y una LayerNorm sin affine, dejando el modelo listo para recibir una cabeza de clasificación. Las normalizaciones de timm usan `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.

No hay entrenamiento propio: la model card indica explícitamente que es un remapeo nativo de los pesos de visión originales, «with no additional training», y que no contiene pesos del modelo de lenguaje ni ninguna cabeza de clasificación entrenada. Por tanto, no se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO aplicadas a este checkpoint; toda la capacidades heredadas proceden del entrenamiento original de Qwen3-VL-32B-Instruct, cuyos detalles se remiten al informe técnico arXiv:2511.21631. Los proyectores DeepStack de Qwen3-VL se omiten, aunque las características intermedias del backbone siguen siendo accesibles mediante `forward_intermediates()` o `features_only=True`.

## Capacidades

- Extracción de embeddings globales de imagen: `forward()` devuelve un vector de 5120 dimensiones por imagen (pooling + LayerNorm sin affine).
- Extracción de tokens espaciales proyectados: `forward_features()` devuelve tokens en formato NLC con forma (1, 576, 5120) para una imagen de 768 x 768.
- Características crudas del backbone: `encoder.forward_features()` devuelve features NHWC sin proyectar (ancho 1152).
- Mapas de características intermedios: `forward_intermediates(..., output_fmt='NCHW')`, con salidas del tipo (1, 1152, 48, 48), aptas para tareas densas.
- Clasificación mediante *fine-tuning*: se puede instanciar con `num_classes=N`; la cabeza lineal se inicializa de forma aleatoria y debe entrenarse con datos propios.
- Compatibilidad con entradas rectangulares, siempre que cada dimensión sea divisible por 16 (y por 32 en variantes que usen el merger 2x2).
- Orientado a *image feature extraction* como pipeline declarado en Hugging Face.
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No procesa texto, audio ni vídeo (el eje temporal se ha colapsado a Conv2d).
- Capacidades multilingües: no aplica / no disponibles.

## Casos de uso

- Búsqueda y recuperación visual: usar `forward()` para indexar un corpus de imágenes con vectores de 5120 dimensiones y resolver consultas por similitud coseno, reutilizando el mismo encoder que alimenta a Qwen3-VL-32B.
- Clasificación por *fine-tuning*: añadir una cabeza lineal (`num_classes=N`) y entrenarla sobre un dataset etiquetado (por ejemplo, control de calidad industrial o categorización de producto), aprovechando que el backbone ya está preentrenado y solo hay que ajustar 459,8 M de parámetros.
- Deduplicación y curación de datasets de imagen: calcular embeddings de un corpus grande y agrupar por proximidad para eliminar imágenes casi idénticas antes de entrenar otros modelos.
- Tareas densas (segmentación, detección o *depth*): emplear `forward_intermediates()` para obtener mapas de (1, 1152, 48, 48) a 768 x 768 y montar una cabeza densa ligera encima.
- Reconstrucción o destilación de pipelines multimodales: al conservar la proyección de 5120 dimensiones del LLM de Qwen3-VL-32B, sirve como encoder congelado para experimentar con la interfaz visión-lenguaje sin cargar el modelo de 32B completo.
- Filtrado y moderación de contenido a escala: precomputar embeddings y entrenar un clasificador binario sobre ellos para descartar imágenes no deseadas en un *pipeline* de ingesta.
- Extracción de características para *caching* offline: generar features una sola vez y entrenar modelos posteriores sobre representaciones congeladas, reduciendo el coste de cómputo del entrenamiento.
- Investigación en representaciones visuales: analizar el efecto del RoPE axial, las posiciones absolutas interpoladas o la LayerNorm sin affine sobre la geometría de los embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, zero-shot, retrieval ni ninguna otra evaluación comparativa, y el modelo no ha sido entrenado ni evaluado por el autor del remapeo. Los únicos datos cuantitativos publicados son los de coste computacional y tamaño:

| Métrica (model card) | Valor |
|---|---|
| Parámetros | 459,8 M |
| GMACs | 1305,9 |
| Activaciones | 2999,2 M |
| Resolución de referencia | 768 x 768 |
| Ancho del backbone | 1152 |
| Ancho de proyección | 5120 |

## Requisitos de hardware

- VRAM estimada solo para pesos: en FP32, unos 1,84 GB; en BF16/FP16, unos 0,92 GB; en INT8, unos 0,46 GB; en INT4, unos 0,23 GB. Son estimaciones derivadas de los 459,8 M de parámetros, no cifras publicadas por el autor.
- La model card reporta 2999,2 M de activaciones para la resolución de referencia (768 x 768); la memoria pico real dependerá del tamaño de lote y de si se retienen mapas intermedios.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070/4080/4090 y equivalentes, incluso con lotes moderados en BF16.
- Para lotes grandes o extracción masiva de características, se recomiendan GPU de datacenter (A100, H100, L40S) por ancho de banda de memoria y paralelismo.
- Despliegue: la vía documentada es timm mediante `timm.create_model('hf-hub:timm/qwen3_vit_416m_merge.qwen3_vl_32b', pretrained=True)`, con `timm.data.resolve_model_data_config` para el preprocesado. No hay soporte documentado en vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de lenguaje ni se publican pesos GGUF.
- Latencia y throughput: no disponibles. Como referencia de coste, 1305,9 GMACs equivalen a aproximadamente 2,6 GFLOPs por imagen de 768 x 768 en una pasada hacia delante.

## Comparativa con modelos similares

En la información proporcionada no se incluyen datos de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible establecer una comparación cuantitativa rigurosa. La comparación cualitativa sería la siguiente:

| Aspecto | qwen3_vit_416m_merge.qwen3_vl_32b | Encoders de visión alternativos en timm (SigLIP, DINOv2/v3, CLIP) | Encoder de Qwen3-VL-32B-Instruct original |
|---|---|---|---|
| Parámetros | 459,8 M | No disponible en la información proporcionada | No disponible (forma parte de un VLM de 32B) |
| Contexto / resolución | 768 x 768 de referencia; entradas rectangulares divisibles por 16 | No disponible | No disponible |
| Rendimiento | Sin benchmarks publicados | No disponible | No disponible |
| Licencia | Apache 2.0 | No disponible | Sujeta a la licencia de Qwen3-VL |
| Disponibilidad | Repositorio timm en Hugging Face, safetensors, 1,8 GB | No disponible | Hugging Face, requiere cargar el VLM completo |

La ventaja diferencial de este checkpoint frente a otros encoders es que reproduce exactamente la representación visual que consume el LLM de Qwen3-VL-32B (ancho de proyección 5120), lo que facilita sustituirlo o destilarlo sin reentrenar la interfaz multimodal.

## Limitaciones y advertencias

- No incluye pesos del modelo de lenguaje: no genera texto, no razona y no mantiene conversaciones.
- No incluye cabeza de clasificación entrenada; cualquier uso supervisado exige *fine-tuning* sobre datos propios.
- No procesa vídeo ni información temporal: los pesos de la Conv3d temporal se han sumado en una Conv2d y la entrada de imagen repite un solo fotograma.
- Los proyectores DeepStack de Qwen3-VL se omiten, de modo que la salida no es idéntica a la que se obtendría ejecutando el VLM original completo.
- Restricciones de forma: cada dimensión de la imagen debe ser divisible por 16 (por 32 si se usa el merger 2x2), lo que obliga a ajustar el preprocesado.
- No hay benchmarks publicados ni evaluación independiente; el rendimiento real en *retrieval*, clasificación o tareas densas es desconocido y debe validarse en el dominio de destino.
- Riesgo de sesgos heredados del entrenamiento original de Qwen3-VL-32B-Instruct; la model card no documenta sesgos ni evaluación de equidad.
- La LayerNorm sin parámetros afines y el *average pooling* pueden alterar la escala y comparabilidad de los embeddings respecto a otras representaciones; conviene recalibrar cualquier umbral de similitud.
- Sin torre de texto asociada, no sirve por sí solo para recuperación texto-imagen en modo zero-shot.
- Licencia Apache 2.0 en el repositorio, pero al derivar de Qwen3-VL-32B-Instruct conviene revisar los términos de la licencia de origen antes de un uso comercial en producción.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: no hay validación comunitaria ni *feedback* de terceros.
- Al ser un remapeo sin entrenamiento, cualquier comportamiento deficiente en un dominio concreto es responsabilidad del modelo base, no de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m_merge.qwen3_vl_32b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Revisión de origen de los pesos: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct/tree/0cfaf48183f594c314753d30a4c4974bc75f3ccb
- Informe técnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- Repositorio de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Licencia de origen de Qwen3-VL: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
- PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de timm: https://doi.org/10.5281/zenodo.4414861

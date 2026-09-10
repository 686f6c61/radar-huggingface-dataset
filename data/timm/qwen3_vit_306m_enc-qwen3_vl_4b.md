# timm/qwen3_vit_306m_enc.qwen3_vl_4b

## Resumen

`timm/qwen3_vit_306m_enc.qwen3_vl_4b` es un encoder de características de imagen extraído del modelo multimodal Qwen3-VL-4B-Instruct y remapeado al formato de la librería PyTorch Image Models (timm) por Ross Wightman. No es un modelo de lenguaje ni un modelo de clasificación: es únicamente el codificador de visión nativo de Qwen3-VL, incluyendo el merger espacial y la proyección al ancho del LLM original. El checkpoint contiene 332.727.808 parámetros según los pesos en safetensors (el nombre del repo indica 306 M, cifra que no coincide con el recuento real), con un ancho de backbone de 1024 y una proyección de salida de 2560.

Su relevancia práctica es que expone, como módulo independiente y con API estándar de timm, el extractor visual de un VLM reciente y ampliamente utilizado. Esto permite reutilizar el encoder para generación de embeddings de imagen, clasificación con cabeza propia, recuperación visual o preprocesado en pipelines multimodales, sin necesidad de cargar los aproximadamente 4 000 millones de parámetros del modelo completo. El checkpoint es un remapeo nativo de los pesos de visión originales, sin entrenamiento adicional, y se publica bajo licencia Apache 2.0.

La implementación es solo para imagen: las entradas repetidas se generan repitiendo un único fotograma sobre el kernel temporal original, y los pesos del Conv3d temporal se suman en un Conv2d. Por tanto, esta variante no modela temporalidad ni vídeo. Tampoco incluye los proyectores DeepStack de Qwen3-VL, aunque las características intermedias del backbone siguen siendo accesibles mediante `forward_intermediates()` o `features_only=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial y proyección lineal; extraído de Qwen3-VL-4B-Instruct |
| Parametros totales | 332.727.808 (332,7 M) según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: entrada de imagen de 768 x 768 píxeles por defecto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; el repo solo contiene safetensors) |
| Idiomas soportados | no disponible (no procesa texto; es un encoder de imagen) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Ancho de backbone | 1024 |
| Ancho de proyeccion | 2560 |
| Salida de tokens | (1, 576, 2560) tokens espaciales proyectados para 768 x 768 |
| Salida de features crudas | (1, 48, 48, 1024) en formato NHWC, sin normalizar |
| GMACs | 974,8 |
| Activaciones | 2610,9 M |
| Tamano del repo | 1,3 GB |
| Modelo base | Qwen/Qwen3-VL-4B-Instruct (revisión ebb281ec70b05090aa6165b016eac8ec08e71b17) |
| Libreria | timm |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

Se trata de un transformer de visión (ViT) con parches espaciales, seguido de un merger espacial y una proyección lineal que lleva las características al ancho del LLM de Qwen3-VL (2560). La normalización de la implementación timm usa `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)` sobre píxeles RGB. Los MLP del backbone emplean activación GELU-tanh. El modelo combina posiciones absolutas aprendidas (interpoladas para la rejilla de entrada) con RoPE 2D axial, que se regenera para cada tamaño de imagen, lo que permite entradas rectangulares siempre que cada dimensión sea divisible por 16. Las variantes que usan el merger 2x2 requieren divisibilidad por 32.

No hubo entrenamiento adicional: el checkpoint es un remapeo nativo de los pesos de visión originales de Qwen3-VL-4B-Instruct, por lo que no se dispone de información propia sobre composición del dataset, número de tokens de entrenamiento ni etapas de alineación (RLHF/DPO) para este artefacto concreto. Las innovaciones reseñables de la implementación son la conversión del kernel temporal Conv3d a Conv2d para uso exclusivamente de imagen, la interpolación de posiciones absolutas según la rejilla de entrada, la regeneración de RoPE por resolución y la omisión de los proyectores DeepStack, cuyas características intermedias siguen expuestas vía `forward_features()`, `forward_intermediates()` y `features_only=True`.

## Capacidades

- Extracción de características de imagen: `forward()` devuelve tokens espaciales proyectados de forma `(1, 576, 2560)` para una entrada de 768 x 768.
- Extracción de características crudas del backbone: `forward_features()` devuelve un tensor NHWC `(1, 48, 48, 1024)` sin normalizar.
- Mapas de características intermedios: `forward_intermediates()` con salida configurable en NCHW (por ejemplo `(1, 1024, 48, 48)`), útil para detección, segmentación o destilación.
- Soporte de imágenes rectangulares, con la restricción de divisibilidad por 16 (o 32 si se usa el merger 2x2).
- Integración directa con timm mediante `timm.create_model('hf-hub:timm/qwen3_vit_306m_enc.qwen3_vl_4b', pretrained=True)` y las utilidades `timm.data` para transformaciones.
- Compatibilidad con `features_only=True` en el ecosistema timm para su uso como backbone.
- Uso como generador de embeddings previo a añadir una cabeza de clasificación (la variante `_enc` no incluye cabeza entrenada).
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni razonamiento multi-paso: no contiene pesos de modelo de lenguaje.
- No soporta audio ni vídeo: la componente temporal se ha colapsado a 2D en esta implementación.
- Capacidades multilingües: no aplica, el modelo no procesa texto.

## Casos de uso

- Recuperación de imágenes (image retrieval): los tokens proyectados de 2560 dimensiones sirven como embeddings para indexar un corpus visual en una base de datos vectorial y resolver búsquedas por similitud.
- Deduplicación y curaduría de datasets: calcular embeddings de un conjunto de imágenes y agrupar por distancia para detectar duplicados o near-duplicates antes de entrenar otros modelos.
- Clasificación de imágenes con cabeza propia: congelar el backbone y entrenar una cabeza lineal o MLP sobre las características de 1024 canales, aprovechando que el encoder ya está preentrenado en un pipeline multimodal.
- Preprocesado en pipelines multimodales: generar los tokens visuales que alimentarían a un LLM de la familia Qwen3-VL, útil cuando se quiere separar el servicio de visión del servicio de lenguaje o servir vision embeddings a distintos consumidores.
- Detección y segmentación con características intermedias: usar `forward_intermediates()` para obtener mapas a resolución 48 x 48 con 1024 canales y alimentar cabezas densas ligeras, dado que el modelo conserva la estructura de los proyectores DeepStack omitidos.
- Moderación y análisis de contenido visual a escala: extraer embeddings por lotes para clasificadores de contenido, filtrado de material no deseado o etiquetado automático en pipelines de ingesta.
- Búsqueda visual en comercio electrónico: indexar catálogos de producto y responder consultas de "imagen similar" con embeddings de 2560 dimensiones, con un coste de cómputo de 974,8 GMACs por imagen a 768 x 768.
- Destilación y ajuste fino eficiente: al ser un módulo de 332,7 M de parámetros con licencia Apache 2.0, es viable ajustarlo por LoRA o congelarlo como extractor fijo en experimentos académicos.
- Investigación en representaciones visuales: comparar las características de un encoder entrenado dentro de un VLM frente a encoders de clasificación clásicos, reutilizando el mismo pipeline de datos de timm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye métricas de exactitud, y los resultados de búsqueda se limitan a documentación general de la librería timm. Los únicos datos cuantitativos publicados son de coste computacional:

| Metrica | Valor |
|---|---|
| Parametros | 332,7 M |
| GMACs (768 x 768) | 974,8 |
| Activaciones | 2610,9 M |
| Precision / recall / mAP / top-1 | no disponible |
| Comparacion con otros encoders | no disponible |

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 1,33 GB en FP32, 0,67 GB en BF16/FP16 y 0,33 GB en INT8 (estimaciones derivadas de los 332,7 M de parámetros; el repo solo distribuye safetensors sin cuantizar).
- Memoria de pico: la model card declara 2610,9 M de activaciones a 768 x 768, por lo que el consumo durante el forward puede superar holgadamente el peso de los parámetros; conviene reservar varios gigabytes adicionales según el tamaño de lote y la resolución.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y superiores son suficientes incluso en precisión completa; también es viable en CPU para inferencia de baja frecuencia.
- GPU de centro de datos (A100, H100, L40S) recomendadas solo si se necesita alto throughput por lotes o se procesan resoluciones mayores con lotes grandes.
- Despliegue: timm sobre PyTorch es la vía soportada y documentada; exportación a TorchScript u ONNX mediante las utilidades de timm es factible en el ecosistema, aunque no se documenta explícitamente en la model card.
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este artefacto, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timm/qwen3_vit_306m_enc.qwen3_vl_4b | Encoder de vision (ViT) | 332,7 M | 768 x 768 px, rectangular con divisibilidad por 16 | apache-2.0 | Hugging Face, via timm |
| Qwen/Qwen3-VL-4B-Instruct | VLM completo (vision + lenguaje) | aproximado de 4 000 M indicado en el nombre del checkpoint; no verificado en la informacion disponible | texto + imagen | apache-2.0 (segun el repo del modelo base) | Hugging Face |
| Otros encoders de vision de la coleccion timm (CLIP, SigLIP, DINOv2) | Encoder de vision | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face, via timm |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a tipo de modelo, licencia y canal de distribucion.

## Limitaciones y advertencias

- No contiene pesos de modelo de lenguaje ni cabeza de clasificacion entrenada; cualquier tarea de texto, dialogo o clasificacion requiere componentes adicionales.
- No modela temporalidad: los pesos del Conv3d temporal se han sumado a un Conv2d, por lo que no sirve para tareas de video sin modificaciones.
- Restriccion de entrada estricta: cada dimension de la imagen debe ser divisible por 16, y por 32 si se emplea el merger 2x2. Entradas que no cumplan esto fallaran o requeriran redimensionado.
- Los proyectores DeepStack de Qwen3-VL estan omitidos, de modo que las caracteristicas disponibles no son identicas a las que consume el LLM original en todas sus etapas.
- `forward_features()` devuelve caracteristicas crudas sin normalizar; si se usan para similitud coseno o indexado hay que normalizarlas explicitamente.
- La normalizacion esperada es mean=0,5 y std=0,5 por canal; usar otra normalizacion degrada las representaciones sin aviso de error.
- La discrepancia entre el nombre del checkpoint (306 M) y el recuento real de parametros (332,7 M) puede inducir a error en estimaciones de memoria y comparaciones.
- Riesgo de sesgo y de alucinacion: no se han publicado evaluaciones de sesgo ni de robustez para este artefacto; hereda las caracteristicas del encoder de Qwen3-VL-4B-Instruct, sobre cuyo dataset de vision no se ofrece detalle en la informacion disponible.
- Estado de validacion de la comunidad nulo: 0 descargas y 0 likes en el momento de la consulta, sin evidencia publica de uso en produccion.
- Licencia Apache 2.0 permite uso comercial, pero al derivar del modelo base de Qwen conviene conservar la atribucion y revisar los terminos del repositorio de origen.
- No se publican variantes cuantizadas oficiales; cualquier cuantizacion aplicada por terceros no esta validada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_306m_enc.qwen3_vl_4b
- Modelo base (Qwen3-VL-4B-Instruct): https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Revision de origen del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/tree/ebb281ec70b05090aa6165b016eac8ec08e71b17
- Qwen3-VL Technical Report (arXiv:2511.21631): https://arxiv.org/abs/2511.21631
- Licencia del modelo base (Qwen3-VL): https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
- PyTorch Image Models (repositorio): https://github.com/huggingface/pytorch-image-models
- Organizacion timm en Hugging Face: https://huggingface.co/timm
- Documentacion de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentacion de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

# timm/qwen3_vit_416m.qwen3_vl_32b

## Resumen

`timm/qwen3_vit_416m.qwen3_vl_32b` es un encoder de características de imagen publicado por el proyecto timm (Ross Wightman / Hugging Face), extraído del tower visual de Qwen3-VL-32B-Instruct. No es un modelo generativo: es un Vision Transformer de 415,0 M de parámetros que produce embeddings de imagen de 1152 dimensiones y mapas de características intermedios, listo para usar como backbone congelado o para fine-tuning de clasificación. Su publicación responde a una necesidad práctica: reutilizar el encoder visual de un VLM grande sin arrastrar los 32 000 M de parámetros del modelo de lenguaje ni la infraestructura asociada.

El checkpoint es un remapeo nativo a timm de los pesos originales de visión, sin entrenamiento adicional, y omite los proyectores DeepStack del modelo original. El autor declara explícitamente que no contiene pesos de lenguaje ni cabeza de clasificación entrenada: el wrapper incluye pooling promedio y una LayerNorm sin afinado sobre las características del encoder. La imagen de referencia es de 768 × 768 y el coste declarado es de 1280,1 GMACs por imagen, con 2993,6 M de activaciones.

Es relevante ahora porque permite usar el tower visual de un VLM de última generación (informe técnico Qwen3-VL en arXiv:2511.21631) como extractor de features independiente, en licencia Apache 2.0 y formato safetensors, dentro del ecosistema timm. La contrapartida es la madurez: el repositorio acumula 0 descargas y 0 likes, no se han publicado benchmarks y no hay cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) derivado del tower visual de Qwen3-VL; MLP con activación GELU-tanh, posiciones absolutas aprendidas (interpoladas a la rejilla de entrada) y RoPE 2D axial regenerado por tamaño; kernel temporal Conv3d sumado a Conv2d para uso solo-imagen |
| Parametros totales | 415.006.704 (415,0 M) |
| Longitud de contexto | No aplica: es un encoder de visión. Entrada de referencia 768 × 768 píxeles; admite entradas rectangulares con cada dimensión divisible por 16 (por 32 en variantes con merger 2×2) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; el tamaño del repo (1,7 GB para 415 M de parámetros) es coherente con fp32, aunque el autor no lo especifica |
| Idiomas soportados | No disponible / no aplica: no procesa texto |
| Licencia | Apache 2.0 (origen de licencia declarado en el repositorio Qwen3-VL) |
| Formato de pesos | safetensors (librería timm; también integrable vía transformers) |
| Ancho del backbone | 1152 |
| Dimension del embedding de imagen | 1152 (salida agrupada por pooling promedio) |
| Rejilla de características de `forward_features()` | 48 × 48 × 1152 en NHWC para 768 × 768 (sin normalizar) |
| GMACs | 1280,1 por imagen a 768 × 768 |
| Activaciones | 2993,6 M |
| Normalizacion de entrada | RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)` |
| Modelo base | Qwen/Qwen3-VL-32B-Instruct (revisión 0cfaf48183f594c314753d30a4c4974bc75f3ccb) |
| Pipeline declarado | image-feature-extraction |
| Tamaño del repositorio | 1,7 GB |
| Fecha de publicacion | 2026-09-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión puro. El backbone tiene un ancho de 1152, usa MLP con activación GELU-tanh y combina dos esquemas posicionales: posiciones absolutas aprendidas, que se interpolan a la rejilla de entrada, y RoPE 2D axial, que se regenera en cada tamaño. La adaptación a imagen fija un fotograma repetido sobre el kernel temporal original, de modo que los pesos del Conv3d temporal se suman en un Conv2d; el modelo resultante es estrictamente 2D. La cabeza del wrapper aplica average pooling y una LayerNorm sin parámetros afines sobre las características del encoder, de forma que la salida es un vector de 1152 dimensiones listo para una cabeza lineal.

No ha habido entrenamiento adicional: el autor indica que se trata de un remapeo nativo de los pesos de visión originales a timm. Por tanto, los datos de entrenamiento, el número de tokens, la composición del dataset y cualquier fase de alineación (RLHF/DPO) corresponden al modelo Qwen3-VL-32B-Instruct original y no se detallan en la información disponible de esta ficha. Sí se documenta una omisión deliberada: los proyectores DeepStack de Qwen3-VL no están incluidos, por lo que las features de este checkpoint no equivalen a las que consume el modelo de lenguaje del VLM original. La API de timm permite recuperar mapas intermedios mediante `forward_intermediates()` o `features_only=True`, y el checkpoint no incorpora cabeza de clasificación: si se crea con `num_classes=N`, la cabeza se inicializa aleatoriamente.

## Capacidades

- Extracción de embeddings globales de imagen: salida de 1152 dimensiones por imagen tras pooling promedio.
- Extracción de mapas de características espaciales: `forward_features()` devuelve tensores NHWC de 48 × 48 × 1152 sin normalizar a 768 × 768.
- Acceso a características intermedias por capa mediante `forward_intermediates()` con `output_fmt` configurable (por ejemplo NCHW).
- Fine-tuning de clasificación: creación del modelo con `num_classes=N` y entrenamiento de la cabeza lineal sobre las features del backbone.
- Clasificación sin entrenamiento mediante prototipos o k-NN sobre los embeddings de 1152 dimensiones.
- Aprendizaje por transferencia con backbone congelado para tareas densas (segmentación, detección) usando los mapas intermedios.
- Soporte de entradas rectangulares, sujeto a la restricción de divisibilidad por 16 (o 32 con merger 2×2), lo que permite ajustar el coste a distintas relaciones de aspecto.
- No soporta generación de texto, tool calling, uso como agente ni razonamiento multi-turno: no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni modalidades adicionales (audio, vídeo con dimensión temporal real).

## Casos de uso

- Recuperación visual de imágenes (image retrieval): indexar un corpus con los embeddings de 1152 dimensiones y resolver búsquedas por similitud coseno en una base vectorial; el vector es lo bastante compacto para índices HNSW a gran escala.
- Filtrado y deduplicación de datasets a escala web: calcular embeddings de cada imagen y agrupar por proximidad para eliminar duplicados casi idénticos antes de entrenar otros modelos.
- Clasificación de imágenes por transferencia: congelar el backbone y entrenar una cabeza lineal (por ejemplo, 45 clases) sobre las features agrupadas, aprovechando el `num_classes` de timm.
- Clasificación few-shot con k-NN o prototipos: construir el clasificador sin entrenamiento a partir de unos pocos ejemplos etiquetados, útil en dominios con datos escasos.
- Segmentación semántica y detección densa: emplear `forward_intermediates()` para obtener mapas a resolución 48 × 48 sobre los que montar una cabeza densa ligera.
- Preprocesado de pipelines multimodales: usar el encoder como extractor de features visuales desacoplado del LLM, por ejemplo para cachear representaciones visuales y no recalcular el tower en cada consulta.
- Inspección visual industrial o control de calidad: comparar embeddings de piezas contra prototipos de referencia para detectar desviaciones de apariencia.
- Investigación en representaciones visuales: analizar las features intermedias de un tower visual entrenado como parte de un VLM de 32 000 M de parámetros sin necesidad de cargar el modelo completo.
- Recomendación visual en comercio electrónico: generar embeddings de catálogo y de la imagen consultada por el usuario para sugerir productos visualmente similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen métricas de ImageNet, MMLU, HumanEval, GSM8K ni ninguna otra. El único dato de rendimiento declarado es de coste computacional: 1280,1 GMACs, 2993,6 M de activaciones y una entrada de referencia de 768 × 768, que no equivalen a una métrica de calidad.

## Requisitos de hardware

- Pesos: aproximadamente 1,66 GB en fp32 y 0,83 GB en bf16/fp16, calculados a partir de los 415,0 M de parámetros. No hay cuantizaciones publicadas en el repositorio.
- Activaciones: los 2993,6 M de valores declarados equivalen a unos 12 GB en fp32 y unos 6 GB en bf16 por imagen a 768 × 768. Es la partida dominante del consumo de memoria, muy por encima de los pesos.
- Estimación de memoria total por imagen a 768 × 768: en torno a 13,6 GB en fp32 y 6,8 GB en bf16, sumando pesos y activaciones.
- GPU de consumo: cabe en tarjetas de 16 GB (RTX 4080, RTX 5080, RTX 4090 en bf16) con lote 1. Las de 24 GB (RTX 3090, RTX 4090) dan margen para lotes pequeños.
- GPU de centro de datos: A100, H100 o L40S para lotes grandes y despliegues con concurrencia; el coste de 1280,1 GMACs por imagen favorece el uso de tensor cores en bf16.
- Despliegue: timm sobre PyTorch es la vía documentada (`timm.create_model('hf-hub:timm/qwen3_vit_416m.qwen3_vl_32b', pretrained=True)`), con posibilidad de exportar a TorchScript u ONNX mediante las utilidades de timm y servir con TorchServe, Triton u ONNX Runtime. vLLM, TGI, llama.cpp y Ollama no son aplicables porque el modelo no es generativo.
- Latencia y throughput medidos: no disponibles. No hay cifras publicadas y el repositorio no registra descargas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| timm/qwen3_vit_416m.qwen3_vl_32b | Encoder ViT de features | 415,0 M | Imagen 768 × 768 (múltiplos de 16) | Apache 2.0 | Safetensors en timm | No disponible |
| Qwen/Qwen3-VL-32B-Instruct (origen del tower visual) | VLM completo generativo | No disponible en esta ficha (del orden de decenas de miles de millones) | No disponible en esta ficha | Apache 2.0 (según repo de origen) | Safetensors en el Hub | No verificado en esta búsqueda |
| Otros backbones de timm (familia SigLIP, DINOv2, CLIP ViT) | Encoders ViT de features | No disponible en esta búsqueda | No disponible | Variable según modelo | timm / Hugging Face | No verificado en esta búsqueda |

No se dispone de datos verificados en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas concretas. La comparación natural de este checkpoint es con el tower visual del Qwen3-VL-32B original, del que deriva por remapeo, y con otros encoders ViT de propósito general del catálogo de timm.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-step. Cualquier caso de uso que requiera generar salidas lingüísticas necesita otro modelo.
- No incluye pesos del modelo de lenguaje ni cabeza de clasificación entrenada. Si se crea con `num_classes=N`, la cabeza es aleatoria y hay que entrenarla.
- Los proyectores DeepStack del Qwen3-VL original se omiten, de modo que las features de este checkpoint no son intercambiables con las que espera el LLM de Qwen3-VL.
- Restricción de entrada: cada dimensión de la imagen debe ser divisible por 16, y por 32 en variantes con merger 2×2. Las imágenes deben redimensionarse o rellenarse en consecuencia.
- La normalización exigida es con media y desviación 0,5 en los tres canales; usar otra normalización degrada las features sin previo aviso.
- Resolución de referencia 768 × 768. Aunque el RoPE se regenera por tamaño y las posiciones absolutas se interpolan, no se documenta el comportamiento fuera de ese régimen.
- No se detallan los datos de entrenamiento originales ni fases de alineación, por lo que los sesgos del modelo se heredan del Qwen3-VL-32B-Instruct sin información para auditarlos. Riesgo de sesgo demográfico, cultural y geográfico no cuantificado.
- La calidad de los embeddings en dominios alejados de los datos de entrenamiento del VLM original (imágenes médicas, satelitales, microscopía) no está validada en la información disponible.
- Riesgo de falsos positivos en tareas de similitud si se usan los embeddings agrupados sin normalizar ni calibrar umbrales por dominio.
- Licencia Apache 2.0 declarada, con origen en el repositorio de Qwen3-VL. Conviene verificar las condiciones del repositorio original antes de un uso comercial a gran escala, en particular por si el modelo base incorpora términos adicionales.
- Madurez mínima: 0 descargas, 0 likes y ningún benchmark publicado. No hay evidencia comunitaria de funcionamiento en producción.
- Un repositorio de 1,7 GB sin cuantizaciones publicadas eleva el coste de almacenamiento y distribución si se despliega en muchos nodos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m.qwen3_vl_32b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Revisión de origen: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct/tree/0cfaf48183f594c314753d30a4c4974bc75f3ccb
- Licencia de origen (Qwen3-VL): https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE
- Informe técnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentación de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/

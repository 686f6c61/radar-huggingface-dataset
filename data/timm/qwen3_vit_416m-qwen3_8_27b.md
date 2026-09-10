# timm/qwen3_vit_416m.qwen3_8_27b

## Resumen

`timm/qwen3_vit_416m.qwen3_8_27b` es un codificador de características visuales de 415 millones de parámetros extraído del modelo multimodal Qwen3.8-27B y reempaquetado de forma nativa para la librería `timm` (PyTorch Image Models). No es un modelo generativo: se trata exclusivamente de la torre de visión, sin pesos de lenguaje ni cabeza de clasificación entrenada, publicada como envoltorio listo para extracción de características y para ajuste fino posterior. Lo mantiene el equipo de `timm` (Ross Wightman / HuggingFace) y se distribuye bajo licencia Apache 2.0.

Su relevancia es doble. Por un lado, permite reutilizar el codificador visual de un modelo frontera de Qwen sin cargar los 27B del modelo completo, lo que abarata mucho el despliegue en tareas de visión. Por otro, sirve como extractor de embeddings de propósito general: a 768 × 768 píxeles produce un vector global de 1152 dimensiones y un mapa de características sin normalizar de 48 × 48 × 1152, útil tanto para clasificación como para segmentación densa.

El checkpoint es un remapeo directo de los pesos originales, sin entrenamiento adicional, por lo que su comportamiento depende enteramente del preentrenamiento de Qwen3.8-27B. No tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks para esta variante concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) extraído del codificador visual de Qwen3.8-27B; MLP con activación GELU-tanh; posiciones absolutas aprendidas más RoPE 2D axial; la convolución temporal Conv3d original se suma en una Conv2d para uso solo-imagen |
| Parámetros totales | 415.006.704 (415,0 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada nativa de 768 × 768 píxeles, que produce 2304 tokens de parche (rejilla 48 × 48) con ancho de backbone 1152 |
| Tipos de cuantización | no se publican versiones cuantizadas; el repositorio contiene safetensors en fp32 (1,7 GB); admite fp16/bf16 vía PyTorch; no hay GGUF ni cuantizaciones de llama.cpp |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | safetensors, cargables con `timm` y `transformers` desde el Hub |
| Ancho del backbone | 1152 |
| GMACs | 1280,1 |
| Activaciones | 2993,6 M |
| Tamaño de imagen | 768 × 768 (se admiten entradas rectangulares) |
| Divisibilidad de la entrada | cada dimensión debe ser divisible por 16; si se usa el merger 2×2, por 32 |
| Normalización de entrada | RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)` |
| Salidas | `forward()` devuelve embedding agrupado (1, 1152); `forward_features()` devuelve características NHWC sin normalizar (1, 48, 48, 1152) |
| Revisión de origen | 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0 |
| Pipeline | image-feature-extraction |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión con ancho 1152 y parches de 16 píxeles. El detalle relevante es que procede de un modelo multimodal con entrada de vídeo: el kernel temporal original era una convolución 3D que, en esta versión solo-imagen, se ha plegado en una convolución 2D sumando los pesos temporales, de modo que una imagen se trata como un único fotograma repetido. El modelo usa MLP con activación GELU-tanh, combina posiciones absolutas aprendidas (interpoladas según la rejilla de entrada) con RoPE 2D axial regenerado en cada resolución, y expone mapas de características intermedios mediante `forward_intermediates()`. Incluye además una variante con LayerNorm sin parámetros afines y agrupación promedio sobre las características del codificador.

No ha habido entrenamiento adicional: la model card indica explícitamente que es un remapeo nativo de los pesos de visión originales de Qwen3.8-27B, sin pesos de modelo de lenguaje y sin cabeza de clasificación entrenada. Es decir, no se documentan número de tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO para este checkpoint. Si el usuario añade una cabeza lineal (`num_classes=N`), esa cabeza se inicializa de forma aleatoria y debe entrenarse con su propio conjunto de datos. La información de preentrenamiento disponible se remite al modelo origen y al blog de Qwen3.8-Max.

## Capacidades

- Extracción de embeddings globales de imagen: `model(x)` devuelve un vector de 1152 dimensiones por imagen.
- Extracción de características espaciales densas: `forward_features(x)` devuelve un tensor NHWC de 48 × 48 × 1152 sin normalizar, apto para tareas densas.
- Mapas de características intermedios por capa mediante `forward_intermediates()`, con salida configurable en NCHW.
- Ajuste fino para clasificación: se puede instanciar con `num_classes` arbitrario y entrenar la cabeza.
- Soporte de entradas rectangulares, siempre que cada dimensión sea divisible por 16 (o 32 si se usa el merger 2×2).
- Inferencia bajo `torch.inference_mode()` con pesos precargados desde el Hub (`pretrained=True`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, ni entrada de audio o vídeo real (el eje temporal se ha plegado a 2D).
- Capacidades multilingües: no aplica, el modelo no procesa lenguaje.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: generar embeddings de 1152 dimensiones para cada imagen de un catálogo e indexarlos en una base vectorial; la similitud coseno permite recuperar imágenes semánticamente cercanas sin entrenar nada.
- Deduplicación y curaduría de datasets: calcular embeddings sobre millones de imágenes y agrupar o eliminar duplicados y near-duplicates en pipelines de preparación de datos.
- Clasificación de imágenes por ajuste fino: sustituir la cabeza por una capa lineal con el número de clases objetivo y entrenar solo esa cabeza sobre el backbone congelado, lo que reduce drásticamente el coste frente a entrenar un ViT desde cero.
- Segmentación y predicción densa: usar los mapas intermedios de 48 × 48 con 1152 canales como entrada de una cabeza de segmentación semántica o de estimación de profundidad, aprovechando la resolución espacial conservada.
- Moderación de contenido visual: construir un clasificador binario o multietiqueta sobre los embeddings para filtrar imágenes inapropiadas en una plataforma, con un coste de inferencia muy inferior al de un modelo multimodal completo.
- Inspección visual en industria: extraer características de imágenes de producto en línea de producción y detectar anomalías comparando el embedding con el de una referencia considerada correcta.
- Sistemas multimodal RAG: usar el codificador como torre de visión cuando el resto del pipeline ya está alineado con la familia Qwen3.8, evitando cargar el modelo de 27B completo en memoria.
- Recomendación de contenido visual: generar embeddings de miniaturas o fotogramas clave y alimentar un modelo de ranking o de similitud para sugerir contenido relacionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, zero-shot, recuperación ni ninguna otra tarea, y el repositorio no registra descargas ni evaluaciones de la comunidad en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM de pesos: 415 M de parámetros equivalen a aproximadamente 1,66 GB en fp32 (coherente con los 1,7 GB del repositorio), 0,83 GB en bf16/fp16 y unos 0,42 GB en int8.
- VRAM de activaciones: la model card declara 2993,6 M de activaciones a 768 × 768, lo que en una estimación aritmética supone del orden de 12 GB en fp32 o 6 GB en bf16 para lote 1. Es una cifra orientativa, no medida.
- GPU de consumo: cabe sin problema con bf16 en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), teniendo en cuenta el pico de activaciones a resolución completa; a resoluciones menores el consumo baja de forma aproximadamente cuadrática.
- GPU de centro de datos: A100, H100 o L40S permiten lotes grandes y resolución nativa sin ajustes; una única A100 de 40 GB es suficiente para inferencia y para ajuste fino de la cabeza con el backbone congelado.
- Despliegue: la vía documentada es `timm` con PyTorch; también se puede usar dentro de `transformers`. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos de lenguaje y no a codificadores de visión. La exportación a ONNX o TorchScript no está documentada en la model card.
- Latencia y throughput: no disponible. Como referencia estructural, el coste por imagen es de 1280,1 GMACs a 768 × 768.

## Comparativa con modelos similares

No se dispone de datos verificados sobre alternativas en la información proporcionada, y sin benchmarks publicados de esta variante no es posible establecer comparaciones de rendimiento fiables. Los codificadores de imagen de propósito general con los que competiría en el mismo nicho —por ejemplo CLIP ViT-L/14, SigLIP SO400M o la familia DINOv2— no aparecen documentados en la información disponible, por lo que sus cifras de parámetros, contexto de entrada, licencia y disponibilidad se marcan como no disponibles.

| Modelo | Parámetros | Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timm/qwen3_vit_416m.qwen3_8_27b | 415 M | 768 × 768 (múltiplos de 16) | Sin benchmarks publicados | Apache 2.0 | HuggingFace Hub vía timm |
| CLIP ViT-L/14 | no disponible | no disponible | no disponible | no disponible | no disponible |
| SigLIP SO400M | no disponible | no disponible | no disponible | no disponible | no disponible |
| DINOv2 (variante grande) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto ni tiene pesos de lenguaje: cualquier expectativa de uso conversacional, tool calling o razonamiento es inaplicable.
- No incluye cabeza de clasificación entrenada; si se añade una, se inicializa aleatoriamente y hay que entrenarla.
- No se ha realizado ningún entrenamiento adicional sobre los pesos de visión originales, por lo que su calidad depende de la alineación con el stack multimodal de Qwen3.8-27B y puede no ser óptima para tareas genéricas de recuperación.
- No hay benchmarks publicados ni validación independiente; el repositorio tenía 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de retroalimentación de la comunidad.
- Restricciones de forma de entrada: cada dimensión debe ser divisible por 16, y por 32 si se utiliza el merger 2×2; las imágenes que no cumplan esto deben redimensionarse o rellenarse.
- La normalización esperada es fija (`mean` y `std` de 0,5), y usar otros valores degrada las características.
- `forward_features()` devuelve características sin normalizar; hay que normalizarlas explícitamente antes de calcular similitudes.
- El eje temporal está plegado: no admite vídeo real, solo imágenes individuales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos si se usa como clasificador sin ajuste fino ni calibración.
- Sesgos: no documentados en la información disponible; al heredar los pesos de Qwen3.8-27B, arrastra los sesgos de los datos de entrenamiento de ese modelo, que no se detallan.
- Licencia: Apache 2.0, apta para uso comercial, pero conviene verificar el fichero LICENSE del repositorio original de Qwen3.8-27B en la revisión indicada, ya que la licencia declarada aquí es heredada.
- Fecha de creación del repositorio: 2026-09-10, con actualización el mismo día; se trata de una publicación reciente y poco rodada.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo ni sobre su modelo origen; los enlaces devueltos tratan de otros temas y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m.qwen3_8_27b
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión de origen: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Licencia del modelo origen: https://huggingface.co/Qwen/Qwen3.8-27B/blob/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0/LICENSE
- Blog de Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Cita del modelo: Qwen Team, «Qwen3.8-Max: A New Bar for Coding and Cowork», agosto de 2026
- Cita de timm: Ross Wightman, «PyTorch Image Models», 2019, DOI 10.5281/zenodo.4414861

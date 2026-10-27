# zxyty/physicalai-dinov3-vitl16

## Resumen

`zxyty/physicalai-dinov3-vitl16` es un backbone de visión basado en DINOv3, la familia de modelos fundacionales auto-supervisados publicada por Meta AI (paper arXiv:2508.10104). Concretamente se trata de una instancia ViT-L/16 (Vision Transformer con parche de 16×16) de 303.129.600 parámetros, derivada de la destilación del ViT-7B de DINOv3 sobre el dataset web LVD-1689M (1.689 millones de imágenes extraídas de un pool de 17.000 millones de imágenes públicas de Instagram). El repositorio lo publica el usuario `zxyty` bajo el identificador "physicalai", sin documentación propia sobre el proceso de ajuste ni sobre qué añade respecto al checkpoint original de Meta.

El modelo no genera texto: es un extractor de características visuales que devuelve un token de clase, cuatro tokens de registro y tokens de parche (201 tokens para una imagen de 224×224). Su interés práctico está en que las características densas funcionan sin fine-tuning con clasificadores tan simples como una regresión logística o k-NN, y sirven para segmentación semántica, estimación de profundidad, correspondencias de keypoints 3D, recuperación de imágenes y descubrimiento no supervisado de objetos.

Es relevante ahora porque DINOv3 se presenta como el estado del arte universal en visión sin ajuste fino, y porque este checkpoint concreto (ViT-L, 1,2 GB de repo, ~0,6 GB en bf16) cabe en cualquier GPU de consumo, a diferencia del ViT-7B del que se destila. La contrapartida es que la licencia es la DINOv3 License de Meta, con acceso condicionado (gated) y términos específicos que hay que revisar antes de un uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16), patch size 16, con class token y register tokens |
| Parametros totales | 303.129.600 (~303 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión). Acepta imágenes de lado múltiplo de 16 px; a 224×224 produce 1 token de clase + 4 de registro + 196 de parche = 201 tokens. Si la imagen no es múltiplo de 16, se recorta al múltiplo menor más cercano |
| Tipos de cuantizacion | No disponible. Se distribuyen pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | `en` (etiqueta declarada); el modelo no procesa texto, solo imágenes |
| Licencia | DINOv3 License (`license_name: dinov3-license`, `license: other`), acceso con formulario gated |
| Formato de pesos | safetensors, compatible con la librería `transformers` |
| Dimensión de embedding | 1024 (según ficha de Tenzro) |
| Resolución de entrada | 224 px por defecto (según ficha de Tenzro) |
| Tamaño del repositorio | 1,2 GB |
| Pipeline | `image-feature-extraction` |
| Modelo base declarado | `facebook/dinov3-vit7b16-pretrain-lvd1689m` (ViT-7B; este ViT-L es un destilado) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer con parches de 16×16, en la variante "L" (large) de la familia DINOv3. Incorpora el esquema de register tokens introducido en DINOv2, de modo que la secuencia de salida incluye 1 token de clase, 4 tokens de registro y los tokens de parche correspondientes. Para 224×224 la secuencia resultante es de 201 tokens, frente a los 261 de DINOv2, porque el patch size pasa de 14 a 16. El modelo devuelve `pooler_output` (token de clase) y la secuencia completa de tokens, lo que permite tanto tareas de clasificación/recuperación a nivel de imagen como tareas densas (segmentación, profundidad, correspondencias) a nivel de parche.

El entrenamiento original de DINOv3 es auto-supervisado (self-distillation tipo DINO) sobre LVD-1689M, un conjunto curado de 1.689 millones de imágenes construido a partir de un pool de 17.000 millones de imágenes web. Según la model card de la familia, el ViT-7B se entrena desde cero y los ViT-S/S+/B/L/H+ y los ConvNeXt-T/S/B/L se obtienen por destilación del ViT-7B. No se ha publicado en la información disponible el número exacto de tokens vistos, la composición detallada del dataset ni si hubo etapas de RLHF/DPO (no aplicables en un backbone auto-supervisado de visión). Tampoco hay información sobre qué ajuste adicional, si alguno, ha aplicado el autor `zxyty` bajo la etiqueta "physicalai": el repositorio no incluye README propio más allá de la model card heredada de Meta.

## Capacidades

- Extracción de características visuales densas: token de clase, 4 tokens de registro y tokens de parche por imagen.
- Clasificación de imágenes sin fine-tuning mediante k-NN o regresión logística sobre el token de clase.
- Clasificación con una capa lineal sobre el token de clase y la media de los tokens de parche.
- Recuperación de imágenes (image retrieval) por vecinos más cercanos en el espacio de embeddings.
- Correspondencias geométricas y semánticas de keypoints 3D entre pares de imágenes.
- Estimación de profundidad y segmentación semántica con cabezas lineales sobre las características congeladas.
- Descubrimiento no supervisado de objetos.
- Seguimiento de segmentación en vídeo y clasificación de vídeo con una sonda atencional de 4 capas.
- Procesamiento de imágenes de alta resolución siempre que el lado sea múltiplo de 16.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un backbone visual.
- No soporta audio ni modalidad de texto; la etiqueta de idioma `en` es heredada del trámite de la model card.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: indexar un catálogo con los embeddings del token de clase y resolver consultas por vecinos más cercanos con FAISS o hnswlib; el modelo funciona sin entrenamiento adicional y el vector es de 1024 dimensiones.
- Inspección visual en industria: servir como extractor congelado y entrenar solo una regresión logística o un k-NN sobre el token de clase para detectar defectos o clasificar piezas, con un coste de etiquetado mínimo.
- Deduplicación y curaduría de datasets a escala: calcular embeddings de miles de millones de imágenes y agrupar por similitud para eliminar duplicados y near-duplicates antes de entrenar otros modelos.
- Segmentación semántica en teledetección y agricultura: congelar el backbone y añadir una cabeza lineal sobre los tokens de parche para generar máscaras de cultivos, agua o infraestructura; la familia DINOv3 incluye además variantes entrenadas sobre SAT-493M para datos de satélite.
- Robótica y navegación: usar las características para estimar profundidad monocular o para establecer correspondencias entre fotogramas consecutivos, alimentando un pipeline de SLAM visual o de agarre.
- Anotación asistida y descubrimiento de objetos: localizar objetos recurrentes sin supervisión para preanotar datasets y reducir el trabajo manual de etiquetado.
- Analítica de vídeo: seguimiento de segmentación a lo largo de un vídeo y conteo de instancias usando las características por parche como descriptor por fotograma.
- Backbone congelado para un VLM o un policy de robot: sustituir el codificador visual de un modelo multimodal por este ViT-L y entrenar solo el adaptador, aprovechando que 303 M de parámetros caben en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia DINOv3 remite al paper (arXiv:2508.10104) para las cifras, pero no se incluyen tablas numéricas en el material proporcionado, y el repositorio `zxyty/physicalai-dinov3-vitl16` no aporta métricas propias ni una descripción del ajuste realizado.

## Requisitos de hardware

- VRAM para pesos: ~0,61 GB en bf16/fp16 (303 M × 2 bytes), ~1,21 GB en fp32, ~0,30 GB en int8. Cifras calculadas a partir del número de parámetros; no publicadas por el autor.
- VRAM total en inferencia: el repositorio declara un mínimo de 4 GB de RAM/VRAM según la ficha de Tenzro; con imágenes a 224×224 las activaciones por muestra son del orden de decenas de MB, por lo que un batch grande es viable en GPU pequeñas (estimación, no medida publicada).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y RTX 4090; incluso una GTX 1650 de 4 GB debería poder ejecutar batch 1 en fp16 (estimación).
- GPU de datacenter: A100 40/80 GB, H100 o L40S para extracción masiva por lotes, donde el cuello de botella es el ancho de banda de memoria y el preprocesado de imágenes, no la capacidad.
- Despliegue: `transformers` con `AutoModel`/`pipeline(task="image-feature-extraction")`, exportación a ONNX Runtime o TensorRT para latencia baja, y `torch.compile` para acelerar en GPU. No aplica vLLM, TGI ni llama.cpp, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de imágenes por segundo en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zxyty/physicalai-dinov3-vitl16` (este) | 303 M | Imágenes múltiplo de 16 px; 201 tokens a 224² | Extracción de características visuales | DINOv3 License (gated, uso comercial condicionado) | HuggingFace, 0 descargas, 0 likes |
| `facebook/dinov3-vitl16-pretrain-lvd1689m` | No disponible en la búsqueda (misma arquitectura ViT-L/16) | Igual | Igual | DINOv3 License (gated) | HuggingFace, repositorio oficial de Meta |
| `facebook/dinov3-vit7b16-pretrain-lvd1689m` | 7 B (según la model card de la familia) | Igual, patch 16 | Igual, pero mucho mayor | DINOv3 License (gated) | HuggingFace, checkpoint del que se destila este ViT-L |
| DINOv2 ViT-L/14 | ~304 M (dato de conocimiento general, no verificado en la búsqueda) | Patch 14, 261 tokens a 224² | Extracción de características visuales | Licencia DINOv2 (uso comercial permitido) | HuggingFace, ampliamente desplegado |

La comparación relevante es con el checkpoint original de Meta: este repositorio no documenta ninguna mejora sobre `facebook/dinov3-vitl16-pretrain-lvd1689m`, por lo que a falta de información debe asumirse comportamiento equivalente o no verificado. Frente a DINOv2 ViT-L/14, DINOv3 declara mejores características densas y mayor equidad geográfica, pero con una licencia más restrictiva que la de su predecesor.

## Limitaciones y advertencias

- Ausencia total de documentación del ajuste: el repositorio tiene 0 descargas y 0 likes, no incluye README propio y no explica qué aporta la etiqueta "physicalai" ni sobre qué datos se habría ajustado. No hay garantía de que los pesos difieran del checkpoint oficial de Meta.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en clasificación y de correspondencias espurias en tareas densas cuando el dominio se aleja del dataset web de entrenamiento.
- Sesgos geográficos y socioeconómicos documentados por Meta: el rendimiento cae de forma notable en el tramo de renta baja frente al tramo de renta alta, y persiste una diferencia relativa entre Europa y África pese a la mejora sobre DINOv2.
- El fine-tuning incrementa los sesgos, porque alinea las características con las etiquetas del conjunto de ajuste; la recomendación del autor original es mantener el backbone congelado salvo última necesidad.
- Licencia DINOv3 License: acceso condicionado por formulario (nombre, apellidos, fecha de nacimiento, país, afiliación, cargo, geolocalización IP) y aceptación de la política de privacidad de Meta. Es una licencia personalizada, no Apache/MIT; hay que revisar los términos exactos antes de uso comercial, redistribución o despliegue en producto.
- Idioma: la etiqueta `en` no implica capacidades lingüísticas; el modelo no procesa texto.
- Restricción de resolución: imágenes cuyo lado no sea múltiplo de 16 se recortan al múltiplo inferior, lo que puede eliminar contenido en los bordes.
- No es un modelo generativo: no puede usarse para captioning, VQA ni instrucciones en lenguaje natural sin añadir una cabeza o un adaptador externo.
- Al tratarse de un ViT-L destilado del ViT-7B, queda por debajo del 7B en las tareas densas que el paper reporta para el modelo grande.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zxyty/physicalai-dinov3-vitl16
- Checkpoint original de Meta (ViT-L/16): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Modelo base declarado (ViT-7B/16): https://huggingface.co/facebook/dinov3-vit7b16-pretrain-lvd1689m
- Paper DINOv3: https://arxiv.org/abs/2508.10104
- Repositorio de referencia en PyTorch: https://github.com/facebookresearch/dinov3
- Página de investigación de Meta AI: https://ai.meta.com/research/dinov3/
- Texto de la licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Ficha técnica de Tenzro: https://www.tenzro.com/models/dinov3-vitl16
- Variante con cabeza de visión y codificador de texto dino.txt: https://huggingface.co/PIA-SPACE-LAB/dinov3_vitl16_dinotxt_vision_head_and_text_encoder

# timm/deepseek_vit_412m_enc.deepseek_v4_flash_vision_exp

## Resumen

Este checkpoint es un codificador de características de imagen (image feature encoder) extraído de la torre de visión de DeepSeek-V4-Flash-Vision-Exp y reempaquetado de forma nativa para la librería timm por el propio equipo de timm (Ross Wightman y colaboradores). No es un modelo de lenguaje ni un modelo multimodal completo: contiene únicamente los pesos del encoder visual original, incluyendo el alineador espacial 3×3 y la proyección a la anchura del LLM de origen. Según la model card, se trata de un remapeo de pesos sin entrenamiento adicional, sin pesos de lenguaje y sin cabeza de clasificación entrenada.

La relevancia práctica es doble. Por un lado, permite reutilizar la torre de visión de un VLM de nueva generación (DeepSeek-V4-Flash-Vision-Exp) como extractor de características independiente, con la API estándar de timm. Por otro, al conservar el alineador y la proyección a 4096 dimensiones, facilita experimentar con el mismo espacio de embeddings que consume el LLM original sin necesidad de cargar el modelo completo.

El recuento real de parámetros en safetensors es de 466.376.704 (466,4 M), aunque el nombre del checkpoint indica "412m"; conviene tener en cuenta esta discrepancia al comparar. La entrada por defecto es de 392×392 píxeles con parches de 14×14, y el coste declarado es de 368,5 GMACs y 611,8 M de activaciones por imagen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con parches de 14×14, MLP SwiGLU, RMSNorm y RoPE 2D axial; sin embeddings posicionales absolutos aprendidos |
| Parámetros totales | 466.376.704 (466,4 M) según safetensors; el nombre del checkpoint indica 412m |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica: es un codificador de imagen, sin ventana de contexto de texto; entrada de 392×392 por defecto, con dimensiones divisibles por 14 |
| Tipos de cuantización | no disponible: la model card no documenta variantes cuantizadas (GGUF, AWQ, GPTQ, etc.); los pesos se distribuyen en safetensors en precisión completa (fp32) |
| Idiomas soportados | no aplica: el modelo no procesa texto, solo imágenes |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1,9 GB, coherente con ~4 bytes por parámetro en fp32) |
| Tipo de modelo | Image Feature Encoder (pipeline: image-feature-extraction) |
| Resolución de entrada | 392 × 392 (por defecto); entradas rectangulares soportadas si las dimensiones son divisibles por 14 |
| Anchura del backbone | 1024 |
| Anchura de proyección | 4096 (anchura del LLM de origen) |
| GMACs | 368,5 por imagen |
| Activaciones declaradas | 611,8 M |
| Salida del backbone | NHWC, por ejemplo (1, 28, 28, 1024) con RMSNorm final aplicada |
| Salida proyectada (`_enc`) | NLC, por ejemplo (1, 100, 4096) para una imagen de 392×392 |
| Librería | timm (carga vía `hf-hub:timm/deepseek_vit_412m_enc.deepseek_v4_flash_vision_exp`) |

## Arquitectura y entrenamiento

El backbone es un Vision Transformer con parches de 14×14, MLPs con activación SwiGLU, normalización RMSNorm y RoPE 2D axial, sin embeddings posicionales absolutos aprendidos. La proyección lineal de parches original se ha reformulado como una convolución `Conv2d` sin alterar el cálculo. Sobre el backbone se conserva el alineador nativo, que agrupa tokens de parche en bloques de 3×3 en orden channel-major y los proyecta mediante un MLP GELU de dos capas hasta la anchura del LLM de origen (4096). Los grupos incompletos se rellenan con ceros por abajo y por la derecha, de modo que una imagen de 392×392 genera 28×28 = 784 parches que, agrupados de 3 en 3, dan una rejilla de 10×10 = 100 tokens proyectados.

No ha habido entrenamiento adicional: el checkpoint es un remapeo nativo de los pesos de visión originales. Esto implica que no existe cabeza de clasificación entrenada ni proceso de ajuste (RLHF, DPO u otro) documentado para este repositorio concreto. La información proporcionada no describe la composición del dataset, el número de tokens de imagen vistos durante el preentrenamiento original ni la receta de alineación visión-lenguaje; esos detalles pertenecen al modelo de origen y no se detallan aquí.

Como innovaciones reseñables del empaquetado: se ofrecen variantes `_enc` (devuelve tokens proyectados NLC) y `_align` (retiene el alineador), mientras que la variante clasificadora simple omite el alineador y devuelve embeddings agrupados a la espera de que se añada una cabeza. También se exponen mapas intermedios del backbone mediante `forward_intermediates()` y `features_only=True`, que no incluyen el alineador y a los que se puede aplicar la RMSNorm final con `norm=True`.

## Capacidades

- Extracción de características de imagen: `forward_features()` devuelve las características finales del backbone en formato NHWC tras la RMSNorm, por ejemplo (1, 28, 28, 1024) para 392×392.
- Proyección al espacio del LLM: `forward()` devuelve tokens NLC proyectados a 4096 dimensiones (por ejemplo, (1, 100, 4096)) en la variante `_enc`, alineados con la anchura del LLM de DeepSeek-V4-Flash-Vision-Exp.
- Mapas de características intermedios: `forward_intermediates(indices=..., norm=True, output_fmt='NCHW')` y `features_only=True` permiten obtener representaciones multinivel, por ejemplo (1, 1024, 28, 28).
- Soporte de entradas rectangulares: cualquier resolución con dimensiones divisibles por 14, con la opción `dynamic_img_pad=True` para rellenar con ceros las entradas normalizadas por abajo y por la derecha.
- Agrupación espacial 3×3 con relleno de ceros en grupos incompletos, en orden channel-major.
- Preprocesado integrado en timm: normalización con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`, redimensionado bicúbico y `crop_mode="border"` con `crop_pct=1.0` sobre un lienzo con relleno gris para preservar la relación de aspecto.
- Generación de texto: no soportada.
- Razonamiento, código y matemáticas: no soportados (no hay pesos de lenguaje en el repositorio).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no aplica (no procesa texto).
- Capacidades especiales: no hay modo "thinking", ni audio, ni generación de imagen; el modelo solo codifica imágenes en vectores.

## Casos de uso

- Búsqueda visual y recuperación de imágenes: extraer los tokens proyectados de 4096 dimensiones de un catálogo de imágenes e indexarlos en un motor vectorial (FAISS, Milvus, Qdrant) para búsqueda por similitud. El modelo es adecuado porque produce embeddings densos y ricos sin necesidad de cargar el VLM completo; conviene aplicar una agregación (por ejemplo, media sobre los 100 tokens) porque la variante `_enc` no realiza pooling.
- Deduplicación y curación de datasets: usar las características del backbone (28×28×1024) para detectar imágenes casi duplicadas o muy similares antes de entrenar otro modelo, reduciendo coste de anotación y sesgo por repetición.
- Clasificación downstream mediante linear probe: al no incluir cabeza entrenada ni haber sufrido fine-tuning de tarea, el encoder es un punto de partida limpio para entrenar clasificadores lineales o cabezas ligeras con relativamente pocas muestras etiquetadas.
- Backbone para investigación en visión-lenguaje: la proyección a 4096 coincide con la anchura del LLM de origen, lo que permite reproducir o modificar el pipeline de alineación visión-lenguaje, sustituir el alineador o estudiar el efecto del agrupado 3×3.
- Segmentación y detección densa: los mapas intermedios obtenidos con `forward_intermediates()` o `features_only=True` (por ejemplo, tensores de 1024×28×28) sirven como entrada para cabezas densas de segmentación semántica o detección en pipelines de investigación.
- Moderación de contenido y filtrado visual: usar los embeddings como señal de entrada para clasificadores de política (contenido violento, NSFW, marcas) en un sistema de revisión previa, aprovechando que el coste por imagen es bajo (368,5 GMACs).
- Inspección visual industrial y control de calidad: extraer características de imágenes de producto o de línea de producción y entrenar un detector de defectos con pocas muestras, ya que el encoder aporta representaciones generales sin necesidad de preentrenar desde cero.
- Indexado multimodal para RAG: generar embeddings de imágenes que después se conectan a un LLM que comparta anchura de 4096, permitiendo construir un recuperador de contexto visual en asistentes documentales.
- Análisis exploratorio y clustering: proyectar los embeddings de un corpus de imágenes con t-SNE o UMAP para descubrir agrupaciones temáticas, estilos o dominios antes de definir una taxonomía de anotación.
- Extracción de características para audio o texto: no aplica; el modelo está limitado al dominio visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, COCO, retrieval ni comparativas de zero-shot, y el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta.

Los únicos datos cuantitativos publicados son arquitectónicos y se recogen aquí tal cual, sin interpretación adicional:

| Métrica declarada | Valor |
|---|---|
| Parámetros (M) | 466,4 |
| GMACs | 368,5 |
| Activaciones (M) | 611,8 |
| Tamaño de imagen | 392 × 392 |
| Anchura del backbone | 1024 |
| Anchura de proyección | 4096 |
| Tokens proyectados por imagen (392×392) | 100 |
| Rejilla del backbone (392×392) | 28 × 28 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,87 GB (466,4 M × 4 bytes, coherente con el tamaño de repositorio de 1,9 GB); en fp16/bf16 bajarían a unos 0,93 GB. Sumando el volumen de activaciones declarado (611,8 M), una estimación conservadora para una imagen de 392×392 en fp32 es de 3 a 5 GB de pico, y de 2 a 3 GB en fp16/bf16. Son estimaciones derivadas de los datos de la model card, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre sirve para lotes pequeños; para procesar lotes grandes o volúmenes altos de imágenes conviene una A100, H100, L40S o similar. En el segmento de consumo, una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 son suficientes para inferencia en fp16/bf16 con lotes moderados.
- ¿Cabe en GPU de consumo? Sí. Con 466,4 M de parámetros, el modelo entra holgadamente en GPUs consumer con 8 GB o más de VRAM; incluso en fp32 cabe en tarjetas de 6-8 GB para lotes de una sola imagen.
- CPU: la inferencia en CPU es viable para uso puntual, pero no hay datos de latencia publicados; 368,5 GMACs por imagen implican un coste considerable en CPU y hacen recomendable GPU para procesamiento por lotes.
- Opciones de despliegue: timm con PyTorch (`timm.create_model('hf-hub:timm/...', pretrained=True).eval()` y `torch.inference_mode()`), integración con el ecosistema Hugging Face mediante `hf-hub`, y descarga de pesos vía `safetensors`. Servidores de inferencia para LLM (vLLM, TGI, Ollama, llama.cpp) no aplican, porque este checkpoint no genera texto ni dispone de pesos de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

La información disponible no incluye datos comparativos con otros codificadores visuales (DINOv2, CLIP, SigLIP, etc.) ni benchmarks que permitan un ranking objetivo. La comparación se limita, por tanto, a la relación con su modelo de origen y con la familia de modelos de timm.

| Modelo | Parámetros | Entrada | Alineador / proyección | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|---|
| timm/deepseek_vit_412m_enc.deepseek_v4_flash_vision_exp (este) | 466,4 M | 392×392, divisible por 14 | Sí: agrupado 3×3 y proyección a 4096 | MIT | safetensors (timm) | no disponible |
| deepseek-ai/DeepSeek-V4-Flash-Vision-Exp (pesos originales de la torre de visión) | mismos pesos que este checkpoint | lienzo de dimensión variable, relleno gris 127 | Sí, versión original | MIT según el fichero LICENSE del repositorio de origen | pesos originales del VLM | no disponible |
| Otros extractores ViT de timm (familia `vit_*`, por ejemplo) | no disponible | no disponible | no disponible | variable según modelo | safetensors | no disponible |

Diferencias concretas documentadas frente al pipeline original: el transform por defecto de timm usa `crop_mode="border"`, `crop_pct=1.0` y redimensionado bicúbico sobre un lienzo con relleno gris 128, mientras que el procesador original selecciona dimensiones de lienzo variables y usa relleno gris 127. Además, `dynamic_img_pad=True` no reproduce la política de redimensionado adaptativo del procesador original.

## Limitaciones y advertencias

- No es un modelo generativo ni multimodal completo: no contiene pesos de lenguaje y no puede generar texto, responder preguntas ni ejecutar tool calling.
- No incluye cabeza de clasificación entrenada. La variante clasificadora devuelve embeddings agrupados hasta que se añada una cabeza; no se puede usar directamente para clasificación zero-shot.
- No ha recibido entrenamiento adicional: es un remapeo de pesos, por lo que cualquier comportamiento heredado (sesgos, dominios cubiertos, calidad de representación) proviene íntegramente de DeepSeek-V4-Flash-Vision-Exp, cuya composición de datos no se detalla en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos o falsos negativos cuando los embeddings se usan como señal en clasificadores posteriores, especialmente fuera de la distribución de entrenamiento del modelo original.
- Diferencias de preprocesado respecto al pipeline original: el relleno gris es 128 en timm frente a 127 en el procesador original, y la política de recorte y redimensionado no es idéntica. Esto puede introducir un desplazamiento de distribución si se comparan embeddings generados con uno y otro pipeline.
- Restricción de resolución: por defecto las dimensiones deben ser divisibles por 14; `dynamic_img_pad=True` permite otras resoluciones pero no replica el redimensionado adaptativo original.
- La variante `_enc` no aplica pooling, de modo que para obtener un único vector por imagen hay que agregar manualmente los 100 tokens (por ejemplo, con media).
- Idiomas: no aplica, pero conviene recordar que el modelo no procesa texto en absoluto; cualquier capacidad multilingüe debe aportarla otro componente del sistema.
- Licencia MIT, según se indica tanto en los tags del repositorio como en el fichero LICENSE del modelo de origen. Aun así, al derivar de pesos de DeepSeek, conviene revisar la licencia del repositorio de origen en la revisión concreta utilizada (6821d6ad3681a4b137b066b76094fa82ebd0a380) antes de un uso comercial, y mantener la atribución correspondiente.
- Ausencia de benchmarks y de adopción: 0 descargas y 0 "likes" en el momento de la consulta, y ninguna métrica publicada. No se debe asumir un rendimiento competitivo sin evaluarlo en la tarea objetivo.
- Los mapas intermedios obtenidos con `features_only=True` no incluyen el alineador; si se necesita el espacio proyectado hay que usar la salida de `forward()`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/deepseek_vit_412m_enc.deepseek_v4_flash_vision_exp
- Modelo base (DeepSeek-V4-Flash-Vision-Exp): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Revisión de origen de los pesos: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/tree/6821d6ad3681a4b137b066b76094fa82ebd0a380
- Licencia del modelo de origen: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/LICENSE
- Código original de la torre de visión: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/inference/vision.py
- Preprocesado original de imágenes: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp/blob/6821d6ad3681a4b137b066b76094fa82ebd0a380/inference/image_processor.py
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm: https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Cita del modelo original (DeepSeek-AI, 2026): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Vision-Exp
- Cita de PyTorch Image Models (Ross Wightman, 2019): https://github.com/huggingface/pytorch-image-models

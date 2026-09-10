# timm/qwen3_vit_88m_enc.qwen3_5_0_8b

## Resumen

El modelo `timm/qwen3_vit_88m_enc.qwen3_5_0_8b` es un codificador de características de imagen (ViT) extraído del componente de visión de Qwen/Qwen3.5-0.8B. Lo publica el proyecto timm (Ross Wightman) como un remapeo nativo de los pesos originales, sin entrenamiento adicional, y está pensado para usarse con la librería `timm` mediante `timm.create_model`. No es un modelo generativo: es un extractor de *embeddings* visuales que devuelve tokens espaciales ya proyectados al ancho del LLM de origen (1024), lo que permite reutilizar el encoder dentro de una arquitectura multimodal o como backbone congelado para tareas de visión.

Técnicamente es un transformer de visión de 100.003.072 parámetros (≈100 M), anchura de backbone 768, anchura de proyección 1024 y entrada de referencia de 768×768 píxeles, con 302,4 GMACs y 980,9 M de activaciones por imagen. La implementación colapsa el kernel temporal Conv3d original a un Conv2d, de modo que la entrada es una única imagen repetida en el eje temporal, y usa MLPs con GELU-tanh, posiciones absolutas aprendidas (interpoladas al tamaño de entrada) y RoPE 2D axial.

Su relevancia actual es doble: por un lado, permite reutilizar el encoder visual de Qwen3.5 fuera del stack completo del VLM, con una licencia Apache 2.0 y un tamaño que cabe en cualquier GPU de consumo; por otro, sirve como pieza de comparación para estudiar cómo se comportan los encoders nativos de los modelos multimodales recientes frente a alternativas auto-supervisadas como DINOv2 o SigLIP. El repositorio no documenta benchmarks ni idiomas soportados, y en el momento de la consulta acumula 0 descargas y 0 *likes*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con MLPs GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial; incluye *spatial merger* y proyección al ancho del LLM fuente |
| Parámetros totales | 100.003.072 (≈100,0 M, dato de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje. Entrada de imagen de referencia 768×768 px; cada dimensión debe ser divisible por 16 (por 32 si se usa el merger 2×2) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible / no aplica (modelo de extracción de características de imagen, no procesa texto) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-0.8B) |
| Formato de pesos | safetensors (tamaño de repositorio: 0,4 GB) |
| Anchura de backbone | 768 |
| Anchura de proyección | 1024 |
| GMACs (768×768) | 302,4 |
| Activaciones (768×768) | 980,9 M |
| Pipeline | image-feature-extraction |
| Librería | timm |
| Modelo base | Qwen/Qwen3.5-0.8B (revisión 2fc06364715b967f1860aea9cf38778875588b17) |

## Arquitectura y entrenamiento

El checkpoint es un ViT de aproximadamente 100 M de parámetros que reproduce el encoder de visión nativo de Qwen3.5-0.8B. La model card indica explícitamente que se trata de un «native timm remap de los pesos originales de visión, sin entrenamiento adicional»: no hay fase de preentrenamiento propia, ni ajuste fino, ni datos de entrenamiento declarados por parte de timm. El bloque incluye el *spatial merger* y la proyección a la anchura del LLM de origen (1024), de manera que la salida de `forward()` son tokens espaciales proyectados con forma `(1, 576, 1024)` para una entrada de 768×768.

La implementación tiene varias particularidades técnicas reseñables. El kernel temporal original (Conv3d) se suma a un Conv2d para esta variante de solo imagen, por lo que la entrada temporal se repite como un único fotograma. El backbone emplea MLPs con activación GELU-tanh, posiciones absolutas aprendidas que se interpolan a la rejilla de entrada, y RoPE 2D axial que se regenera para cada resolución, de modo que se admiten entradas rectangulares. Las transformaciones de timm normalizan los píxeles RGB con `mean=(0,5, 0,5, 0,5)` y `std=(0,5, 0,5, 0,5)`. `forward_features()` devuelve características crudas sin normalizar en formato NHWC — `(1, 48, 48, 768)` — mientras que `forward()` devuelve los tokens ya fusionados espacialmente. `forward_intermediates()` permite además extraer mapas de características intermedios en formato NCHW.

## Capacidades

- Extracción de características de imagen: genera *embeddings* de tokens espaciales proyectados a 1024 dimensiones, listos para alimentar un LLM o una cabeza aguas abajo.
- Extracción de características crudas del backbone: `forward_features()` devuelve un mapa `(1, 48, 48, 768)` sin normalizar, útil para tareas densas.
- Mapas intermedios: `forward_intermediates()` expone las activaciones de capas intermedias, lo que habilita *feature pyramids* para detección o segmentación.
- Entradas rectangulares: admite imágenes no cuadradas siempre que cada dimensión sea divisible por 16 (32 con el merger 2×2).
- Interpolación de posiciones: al regenerar RoPE y interpolar las posiciones absolutas, puede procesar resoluciones distintas de 768×768.
- Uso como backbone congelado: al ser un modelo de 100 M de parámetros con licencia permisiva, es apto para *linear probing* y *fine-tuning* ligero.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes.
- No soporta generación de texto, visión-lenguaje, audio ni modo *thinking*: carece de pesos de lenguaje y de cabeza de clasificación (la model card indica que la variante clasificadora devuelve *embeddings* agrupados hasta que se añada una cabeza).

## Casos de uso

- Búsqueda visual e imagen-a-imagen: los tokens proyectados a 1024 dimensiones de `forward()` sirven como firma vectorial para indexar catálogos y recuperar imágenes similares con un índice ANN, sin necesidad de un VLM completo.
- Sustitución del encoder visual en un pipeline multimodal: al conservar el *spatial merger* y la proyección al ancho del LLM, el checkpoint puede reutilizarse como torre de visión de un sistema que ya tenga el resto de la pila de Qwen3.5, reduciendo el consumo de memoria al separar el encoder del modelo de lenguaje.
- Clasificación de imágenes con cabeza lineal: congelando el backbone y añadiendo una capa lineal sobre los *embeddings* agrupados se resuelven tareas de control de calidad industrial, triaje médico o clasificación de productos con pocos datos etiquetados.
- Detección y segmentación densa: los mapas intermedios `(1, 768, 48, 48)` obtenidos con `forward_intermediates()` permiten construir *feature pyramids* para modelos tipo DETR o cabezas de segmentación.
- Deduplicación y curación de datasets: calcular el *embedding* de cada imagen de un corpus y agrupar por similitud coseno permite eliminar duplicados y casi duplicados antes de entrenar otros modelos, con un coste de 302,4 GMACs por imagen.
- Moderación de contenido visual: una cabeza de clasificación binaria o multietiqueta sobre los *embeddings* del backbone permite filtrar imágenes en un pipeline de moderación con latencia baja, al ser un modelo de 100 M y 0,4 GB de pesos.
- Extracción de características para *clustering* y exploración: agrupar los *embeddings* de una colección no etiquetada (por ejemplo, un archivo fotográfico) para descubrir categorías latentes o construir un buscador semántico rudimentario.
- Enseñanza e investigación: al ser un remapeo limpio del encoder de Qwen3.5 en formato timm, sirve como referencia reproducible para comparar encoders nativos de VLMs frente a encoders auto-supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de *downstream* (ImageNet, MMLU, etc.) ni comparaciones con otros encoders. Los únicos datos cuantitativos publicados son de coste computacional:

| Métrica | Valor |
|---|---|
| Parámetros | 100,0 M |
| GMACs (768×768) | 302,4 |
| Activaciones (768×768) | 980,9 M |
| Anchura de backbone | 768 |
| Anchura de proyección | 1024 |
| Resolución de referencia | 768×768 px |

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 0,4 GB, consistente con pesos en fp32 (100 M × 4 bytes ≈ 400 MB). En bf16/fp16 el peso del modelo baja a aproximadamente 200 MB.
- VRAM para activaciones: la cifra documentada de 980,9 M de activaciones equivale a unos 3,9 GB por imagen en fp32 (≈2 GB en bf16) a 768×768. Es el factor dominante del consumo, muy por encima del peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para lotes pequeños en fp32; una RTX 3060, RTX 4070 o RTX 4090 es más que suficiente. En un A100 o H100 el modelo queda infrautilizado salvo que se procesen lotes grandes en paralelo.
- GPU de consumo: sí, cabe holgadamente. Incluso tarjetas de gama de entrada con 4 GB pueden ejecutarlo con precisión reducida o lotes de una imagen.
- CPU: es viable para inferencia puntual o lotes pequeños, dado el reducido número de parámetros, aunque el coste por imagen será sensiblemente mayor.
- Opciones de despliegue: `timm` (`timm.create_model('hf-hub:timm/qwen3_vit_88m_enc.qwen3_5_0_8b')`), PyTorch nativo y la integración con `transformers` (etiquetada en los *tags*). No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo de lenguaje. La exportación a ONNX o TensorRT no está documentada.
- Latencia y throughput: no disponibles. El único indicador publicado es el coste de 302,4 GMACs por imagen a 768×768.

## Comparativa con modelos similares

Advertencia: los datos de los modelos comparados no forman parte de la información proporcionada y proceden de conocimiento general sobre estas familias; conviene verificarlos antes de publicarlos. No hay datos de rendimiento comparativo disponibles.

| Modelo | Parámetros | Entrada / parches | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3_vit_88m_enc.qwen3_5_0_8b | 100,0 M | 768×768, divisible por 16 (32 con merger) | 576 tokens de 1024 dim (proyectados) o mapa 48×48×768 (crudo) | Apache 2.0 | HuggingFace (timm), 0 descargas |
| DINOv2 ViT-B/14 | ≈86 M (referencia externa) | Parches 14×14 (referencia externa) | *Embeddings* auto-supervisados | Apache 2.0 (referencia externa) | HuggingFace / torch.hub |
| SigLIP ViT-B/16 | ≈93 M (referencia externa) | Parches 16×16 (referencia externa) | *Embeddings* alineados con texto | Apache 2.0 (referencia externa) | HuggingFace |
| CLIP ViT-B/16 (torre de visión) | ≈86 M (referencia externa) | 224×224 (referencia externa) | *Embeddings* alineados con texto | MIT (referencia externa) | HuggingFace / OpenCLIP |

Diferencias cualitativas relevantes: el modelo de timm es el único de la tabla que incorpora el *spatial merger* y la proyección al ancho de un LLM concreto (1024), lo que lo hace directamente conectable a la pila de Qwen3.5; a cambio, carece de cabeza de clasificación y de alineación explícita con texto, algo que sí ofrecen SigLIP y CLIP. Los datos de rendimiento comparativo no están disponibles.

## Limitaciones y advertencias

- No contiene pesos del modelo de lenguaje ni cabeza de clasificación entrenada: es exclusivamente un extractor de características. Cualquier tarea *downstream* requiere añadir una cabeza o integrarlo en una pila mayor.
- Ausencia total de validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el mismo día (10 de septiembre de 2026). No hay evidencia empírica de su comportamiento en producción.
- No hay benchmarks publicados, por lo que no puede compararse objetivamente con alternativas sin evaluarlo uno mismo.
- Restricción de resolución: cada dimensión de la imagen debe ser divisible por 16, y por 32 si se utiliza el *spatial merger* 2×2. Las resoluciones que se alejen mucho de 768×768 pueden degradar la calidad de las características, ya que las posiciones absolutas se interpolan.
- Limitación temporal: el kernel Conv3d original se colapsa a Conv2d, de modo que la variante solo procesa imágenes individuales; no hay soporte nativo de vídeo ni de secuencias temporales.
- Idiomas: no aplica, pero cualquier sesgo presente en los datos de preentrenamiento de Qwen3.5 se hereda a través de los pesos del encoder.
- Riesgo de alucinación: no aplica en sentido estricto, ya que el modelo no genera texto; sí puede producir *embeddings* poco discriminativos en dominios alejados de sus datos de entrenamiento originales.
- Licencia: Apache 2.0, que permite uso comercial. Conviene revisar igualmente los términos y la licencia del modelo fuente Qwen/Qwen3.5-0.8B, de la que se hereda.
- Consumo de memoria dominado por las activaciones (980,9 M), no por el tamaño del modelo: en lotes grandes o resoluciones altas el ahorro de memoria respecto a un VLM completo es notable, pero no despreciable.
- La normalización de entrada es específica (`mean=std=0,5`); usar las transformaciones por defecto de otra librería puede degradar los resultados de forma silenciosa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_88m_enc.qwen3_5_0_8b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-0.8B/tree/2fc06364715b967f1860aea9cf38778875588b17
- Licencia del modelo fuente: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/2fc06364715b967f1860aea9cf38778875588b17/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Organización timm en HuggingFace: https://huggingface.co/timm
- Documentación de timm en HuggingFace: https://huggingface.co/docs/timm/index
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Documentación de timm (fast.ai): https://timm.fast.ai/

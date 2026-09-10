# timm/qwen3_vit_416m.qwen3_5_9b

## Resumen

qwen3_vit_416m.qwen3_5_9b es un codificador de características de imagen de tipo Vision Transformer con 415.006.704 parámetros (415 M), extraído de la torre de visión del modelo multimodal Qwen3.5-9B y reempaquetado por el equipo de timm como checkpoint nativo de esa librería. No es un modelo generativo: no incluye pesos de lenguaje ni una cabeza de clasificación entrenada, sino únicamente el backbone visual listo para producir embeddings y mapas de características.

El checkpoint se distribuye con licencia Apache 2.0 en un repositorio de 1,7 GB y añade un envoltorio con average pooling y LayerNorm sin parámetros afines (affine-free) sobre las características del encoder, pensado para simplificar el ajuste fino en tareas de clasificación. Su interés actual reside en que permite reutilizar la torre de visión de un modelo frontera de 9B como extractor independiente dentro del ecosistema timm, sin cargar el modelo multimodal completo.

Con una anchura de backbone de 1.152 canales, 1.280,1 GMACs y una entrada nativa de 768x768 píxeles, está orientado a tareas densas de visión por computador (recuperación de imágenes, clasificación, segmentación y destilación) más que a interacción conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con MLP de activación GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial |
| Parámetros totales | 415.006.704 (415 M) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codificador de imagen; resolución de entrada nativa 768x768 px, admite entradas rectangulares) |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo sin componente de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carga mediante la librería timm) |
| Anchura del backbone | 1.152 canales |
| Coste computacional | 1.280,1 GMACs y 2.993,6 M de activaciones a 768x768 px |
| Tamaño del repositorio | 1,7 GB |
| Modelo base | Qwen/Qwen3.5-9B (revisión c202236235762e1c871ad0ccb60c8ee5ba337b9a) |
| Pipeline declarado | image-feature-extraction |

## Arquitectura y entrenamiento

El modelo es un encoder visual transformer puro. Los bloques MLP emplean activación GELU-tanh y el modelo combina posiciones absolutas aprendidas con RoPE 2D axial: las posiciones absolutas se interpolan para adaptarse al grid de entrada y el RoPE se regenera en cada resolución. Para su uso exclusivo con imágenes, las entradas repiten un mismo fotograma a lo largo del kernel temporal original y los pesos del Conv3d temporal se suman en un Conv2d. El envoltorio de clasificación aplica average pooling y una LayerNorm sin parámetros afines sobre las características del encoder.

No hay entrenamiento adicional documentado: se trata de un remap nativo a timm de los pesos de visión originales de Qwen3.5-9B, con lo que el conocimiento visual procede del entrenamiento multimodal de dicho modelo. La model card indica explícitamente que el checkpoint no contiene pesos de lenguaje ni cabeza de clasificación entrenada, y que la nueva cabeza lineal para fine-tuning se inicializa de forma aleatoria. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF o DPO.

## Capacidades

- Extracción de embeddings de imagen: `model(x)` devuelve un vector de 1.152 dimensiones por imagen.
- Extracción de características crudas del backbone: `forward_features()` devuelve un tensor NHWC sin normalizar de forma (1, 48, 48, 1.152) a 768x768.
- Mapas de características intermedios: `forward_intermediates()` permite obtener mapas en formato NCHW, aptos para tareas densas.
- Fine-tuning para clasificación: admite la sustitución de la cabeza con `num_classes=N`, con la cabeza inicializada aleatoriamente.
- Soporte de entradas rectangulares, con la restricción de que cada dimensión sea divisible por 16 (o por 32 si la variante usa el merger 2x2).
- Normalización fija de píxeles RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni uso como agente.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo en esta implementación (el eje temporal se colapsa a un único fotograma).

## Casos de uso

- Búsqueda y recuperación de imágenes (image retrieval): los embeddings de 1.152 dimensiones permiten indexar un corpus visual y recuperar imágenes similares mediante similitud coseno en bases vectoriales.
- Clasificación de imágenes con ajuste fino: se añade una cabeza lineal con `num_classes` y se entrena sobre el dataset objetivo, aprovechando pesos visuales preentrenados en un modelo multimodal grande.
- Predicción densa (segmentación y detección): los mapas intermedios de (1, 1.152, 48, 48) sirven como backbone para cabezas de segmentación semántica o de detección, dado que conservan resolución espacial de 48x48 a la entrada nativa.
- Deduplicación y curaduría de datasets: calcular embeddings sobre grandes colecciones de imágenes permite agrupar duplicados o near-duplicates antes de entrenar otros modelos.
- Sistemas de recomendación visual: los vectores de imagen pueden alimentar un motor de recomendación de producto comparando similitud entre catálogos.
- Control de calidad industrial: con fine-tuning sobre imágenes de defectos, el modelo puede clasificar piezas correctas y defectuosas en líneas de producción, siempre que la resolución y la iluminación se controlen.
- Aprendizaje por destilación: al ser un backbone de 415 M, puede actuar como teacher o feature extractor congelado para entrenar modelos más pequeños en tareas específicas.
- Moderación de contenido visual: clasificación de imágenes en categorías mediante fine-tuning del head de clasificación, con la salvedad de que el sesgo heredado debe auditarse antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 1,66 GB en fp32, 0,83 GB en fp16/bf16 y 0,42 GB en int8 (esta última requiere cuantización propia, no publicada).
- Memoria de activaciones: la model card declara 2.993,6 M de activaciones a 768x768 px, lo que en fp32 supone del orden de 12 GB en el peor caso de un lote completo; en inferencia con `torch.inference_mode` y lotes pequeños el consumo efectivo es muy inferior.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar inferencia en fp16 (RTX 3060, RTX 4060, RTX 3090, RTX 4090). Para entrenamiento de cabezas o extracción por lotes a 768x768 son preferibles A100, H100 o L40S.
- Cabe en GPU de consumo: sí, en tarjetas de gama media como RTX 3060 12 GB o superiores para inferencia y fine-tuning de la cabeza. El entrenamiento del backbone completo a 768x768 exige más memoria por las activaciones.
- Opciones de despliegue: carga nativa con `timm.create_model('hf-hub:timm/qwen3_vit_416m.qwen3_5_9b', pretrained=True)` sobre PyTorch. La exportación a ONNX o TorchScript no está documentada en la información disponible, y no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos generativos).
- Latencia y throughput: no disponibles. Como referencia de cómputo, el modelo requiere 1.280,1 GMACs por imagen a 768x768, aproximadamente 2,56 GFLOPs.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada nativa | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| qwen3_vit_416m.qwen3_5_9b | 415 M | 768x768 (admite rectangular) | Apache 2.0 | no disponible |
| ViT-L/16 (timm, supervisado) | ~304 M | 224x224 o 384x384 | Apache 2.0 | no disponible |
| DINOv2 ViT-L/14 | ~304 M | 518x518 | Apache 2.0 | no disponible |
| SigLIP ViT-L/16 | ~304 M | 384x384 | Apache 2.0 | no disponible |

Los datos de los modelos comparables proceden de sus especificaciones públicas y son aproximados. No existen evaluaciones directas publicadas que enfrenten este extractor con esas alternativas, por lo que la comparación debe limitarse a parámetros, resolución de entrada y licencia.

## Limitaciones y advertencias

- No es un modelo generativo ni un modelo multimodal completo: no genera texto, no responde a instrucciones y no soporta tool calling ni flujos de agente.
- No incluye cabeza de clasificación entrenada; cualquier uso supervisado exige entrenar una cabeza sobre datos propios.
- La ausencia de idiomas aplica en sentido estricto: el modelo no procesa texto, por lo que no cabe evaluar capacidades multilingües.
- Restricciones de entrada: cada dimensión de la imagen debe ser divisible por 16 (32 si se usa el merger 2x2). Omitir esta condición provoca errores de forma.
- La normalización es fija (`mean=(0.5, 0.5, 0.5)`, `std=(0.5, 0.5, 0.5)`); usar otra normalización degrada las características.
- Riesgo de sesgo: al heredar los pesos visuales de Qwen3.5-9B, el modelo puede reproducir sesgos presentes en los datos de entrenamiento de dicho modelo, no documentados en esta ficha.
- Alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir resultados poco fiables en dominios alejados de la distribución de entrenamiento (imágenes médicas, satelitales o industriales muy específicas).
- Licencia Apache 2.0, que permite uso comercial; la licencia se hereda del modelo origen Qwen3.5-9B y conviene verificar el fichero LICENSE original antes de un despliegue en producción.
- Discrepancia documental: el tag `base_model:finetune:Qwen/Qwen3.5-9B` sugiere ajuste fino, mientras que la model card afirma que no hay entrenamiento adicional. Debe tratarse como un remap de pesos, no como un modelo ajustado.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad ni con informes independientes de calidad.
- No hay resultados de benchmarks publicados que permitan estimar la calidad de las representaciones frente a alternativas consolidadas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/timm/qwen3_vit_416m.qwen3_5_9b
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Revisión concreta de los pesos de origen: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Licencia del modelo de origen: https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- Blog de Qwen3.5: Towards Native Multimodal Agents: https://qwen.ai/blog?id=qwen3.5
- Repositorio de PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- DOI de referencia de timm: https://doi.org/10.5281/zenodo.4414861
- Búsqueda web: no se encontraron resultados relevantes; los enlaces devueltos correspondían a un proveedor de formación en TI ajeno al modelo.

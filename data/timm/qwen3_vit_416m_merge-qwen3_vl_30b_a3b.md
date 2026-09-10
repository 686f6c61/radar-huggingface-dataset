# timm/qwen3_vit_416m_merge.qwen3_vl_30b_a3b

## Resumen

`timm/qwen3_vit_416m_merge.qwen3_vl_30b_a3b` es un encoder de características de imagen extraído del modelo multimodal Qwen3-VL-30B-A3B-Instruct mediante un remapeo nativo a la librería timm (PyTorch Image Models), mantenido por Ross Wightman. No es un modelo generativo ni un modelo de lenguaje: es únicamente la torre de visión del sistema Qwen3-VL, reempaquetada para su uso como extractor de embeddings de imagen, con pesos idénticos a los originales y sin entrenamiento adicional.

El checkpoint conserva el merger espacial nativo y la proyección al ancho del LLM (2048), seguidos de un average pooling y una LayerNorm sin componentes afines. Se distribuye sin cabecera de clasificación entrenada y sin pesos de lenguaje, de modo que `forward()` devuelve embeddings de imagen agrupados y `forward_features()` devuelve tokens espaciales proyectados en formato NLC.

Su relevancia es práctica: permite reutilizar la torre de visión de un VLM de 30B parámetros (3B activos) como backbone congelado o como base para fine-tuning supervisado en tareas de clasificación, recuperación de imágenes o generación de características intermedias, sin necesidad de cargar el modelo completo. El checkpoint tiene 445,7 M de parámetros, un ancho de backbone de 1152 y trabaja sobre entradas de 768 x 768 píxeles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con merger espacial y proyección, extraído de Qwen3-VL-30B-A3B-Instruct |
| Parámetros totales | 445.686.512 (445,7 M) |
| Parámetros activos | No aplica: el checkpoint es un encoder denso. El modelo base del que procede es MoE 30B-A3B |
| Longitud de contexto | No aplica (encoder de imagen, no procesa secuencias de texto) |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades lingüísticas propias) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cargable con timm y transformers) |
| Biblioteca | timm |
| Pipeline | image-feature-extraction |
| Tamaño de imagen de referencia | 768 x 768 |
| Ancho del backbone | 1152 |
| Ancho de proyección | 2048 |
| GMACs | 1297,8 |
| Activaciones (M) | 2997,4 |
| Tamaño del repositorio | 1,8 GB |
| Modelo base | Qwen/Qwen3-VL-30B-A3B-Instruct (revisión 9c4b90e1e4ba969fd3b5378b57d966d725f1b86c) |

## Arquitectura y entrenamiento

El modelo es la torre de visión de Qwen3-VL-30B-A3B-Instruct remapeada a timm, sin entrenamiento posterior ni ajuste alguno. Internamente mantiene el merger espacial nativo y la proyección al ancho del LLM (2048 dimensiones), seguidos de average pooling y una LayerNorm sin affine. La entrada se procesa con Conv3d temporal, pero como esta implementación es solo para imagen, los pesos temporales del Conv3d se suman en un Conv2d y cada imagen se repite como un único fotograma sobre el kernel temporal original.

Los bloques usan MLP con activación GELU-tanh, posiciones absolutas aprendidas y RoPE 2D axial. Las posiciones absolutas se interpolan para la rejilla de entrada y el RoPE se regenera en cada tamaño, por lo que se admiten entradas rectangulares. Los proyectores DeepStack de Qwen3-VL se han omitido deliberadamente. Las transformaciones de timm normalizan los píxeles RGB con `mean=(0.5, 0.5, 0.5)` y `std=(0.5, 0.5, 0.5)`.

Las dimensiones de cada imagen deben ser divisibles por 16; las variantes que usan el merger 2x2 requieren divisibilidad por 32. No se han publicado cifras sobre el dataset de entrenamiento original de la torre de visión, el número de tokens vistos ni si hubo fases de RLHF o DPO en la torre visual; esa información corresponde al informe técnico de Qwen3-VL y no se detalla en este repositorio.

## Capacidades

- Extracción de embeddings globales de imagen: `forward()` devuelve un vector de 2048 dimensiones por imagen.
- Extracción de características espaciales: `forward_features()` devuelve tokens proyectados en formato NLC; para 768 x 768 se obtienen 576 tokens de 2048 dimensiones.
- Mapas de características intermedias: `forward_intermediates()` y `features_only=True` permiten recuperar mapas del backbone (por ejemplo, `(1, 1152, 48, 48)` en las capas seleccionadas).
- Entradas rectangulares, siempre que cada dimensión sea divisible por 16 (o por 32 si se usa el merger 2x2).
- Fine-tuning para clasificación: se puede crear el modelo con `num_classes=N`; la nueva cabeza lineal se inicializa de forma aleatoria y debe entrenarse.
- Uso como backbone congelado para transfer learning en tareas densas.
- No incluye pesos de lenguaje, por lo que no realiza generación de texto, razonamiento, código, matemáticas, tool calling, uso de agentes, capacidades multilingües ni modo de pensamiento. Esas funciones pertenecen al modelo base Qwen3-VL-30B-A3B-Instruct, no a este checkpoint.
- No incorpora cabecera de clasificación entrenada ni capacidades de segmentación o detección listas para usar.

## Casos de uso

- Recuperación de imágenes por similitud: generar embeddings de 2048 dimensiones con `forward()` e indexarlos en una base vectorial (FAISS, Qdrant, Milvus) para búsquedas por vecino más cercano sobre catálogos de producto o archivos fotográficos.
- Clasificación con fine-tuning supervisado: sustituir la cabeza por una capa lineal con el número de clases objetivo y entrenarla sobre el dataset propio, aprovechando que el backbone ya incorpora representaciones visuales de un VLM entrenado a gran escala.
- Backbone para visión densa: usar `forward_intermediates()` para alimentar cabezas de detección o segmentación con mapas de 1152 canales a 48 x 48, útil en pipelines de inspección industrial o imagen médica.
- Deduplicación y agrupamiento de datasets: calcular embeddings sobre corpus de imágenes y aplicar clustering para detectar duplicados, near-duplicates o desbalance de clases antes de entrenar otros modelos.
- Preprocesado para pipelines multimodales: emplear este encoder como extractor visual independiente cuando se quiere controlar el coste de cómputo sin cargar el Qwen3-VL completo, por ejemplo para precalcular características en un sistema RAG multimodal.
- Etiquetado y curación de datos: proyectar imágenes no etiquetadas en el espacio de 2048 dimensiones, entrenar un clasificador ligero sobre los embeddings y usarlo para preetiquetar grandes volúmenes de imágenes.
- Extracción de características para analítica visual: análisis de similitud entre campañas creativas, control de calidad de impresión o comparación de imágenes de referencia frente a producción, sin necesidad de entrenar un modelo desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de ImageNet, zero-shot ni comparativas con otros extractores, y el repositorio declara explícitamente que no ha habido entrenamiento ni ajuste posterior al remapeo de pesos.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,8 GB en FP32; unos 0,9 GB en FP16/BF16.
- Activaciones: el cálculo de timm reporta 2997,4 M de activaciones para una imagen de 768 x 768, lo que implica un consumo de memoria relevante durante la pasada forward (del orden de 6 GB en FP16 y 12 GB en FP32 si se materializan todas). Es un factor limitante mayor que el propio peso del modelo.
- GPU recomendadas: cualquier GPU con 8-12 GB de VRAM permite inferencia con batch pequeño; RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090 son suficientes para inferencia. Para lotes grandes o fine-tuning, se recomienda A100, H100, L40S o RTX 6000 Ada.
- Cabe en GPU de consumo: sí, en GPUs de 8 GB o más si se reduce el tamaño de imagen o el batch. Con 768 x 768 y batch 1, 8 GB es ajustado; 12 GB es una cifra cómoda.
- Opciones de despliegue: timm y PyTorch directamente (`timm.create_model`), ONNX Runtime y TensorRT mediante exportación, TorchScript, y servidores de inferencia genéricos (Triton, TorchServe). No aplica vLLM, llama.cpp, Ollama ni TGI, porque no contiene pesos de lenguaje.
- Latencia y throughput: no disponible. La cifra de 1297,8 GMACs por imagen de 768 x 768 sirve como referencia de coste computacional, pero no se han publicado mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada típica | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| qwen3_vit_416m_merge (este) | 445,7 M | 768 x 768 (divisible por 16/32) | Apache 2.0 | safetensors (timm) | No disponible |
| DINOv2 ViT-L/14 | Aprox. 304 M | 518 x 518 (parche 14) | Apache 2.0 | safetensors / PyTorch | No disponible en esta ficha |
| CLIP ViT-L/14 | Aprox. 304 M de visión | 224 o 336 | MIT | safetensors / PyTorch | No disponible en esta ficha |

Los valores de parámetros y licencias de DINOv2 y CLIP proceden de su documentación pública y se incluyen solo como referencia de categoría; no se dispone de comparativas de rendimiento verificadas entre estos modelos y el checkpoint de timm en la información consultada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni soporta agentes. Cualquier expectativa en ese sentido es un error de interpretación.
- No incluye cabecera de clasificación entrenada. La cabeza creada con `num_classes=N` se inicializa aleatoriamente y requiere entrenamiento con datos propios.
- Los proyectores DeepStack de Qwen3-VL se han omitido, de modo que los mapas de características obtenidos no son idénticos a los del modelo original completo.
- Los pesos temporales del Conv3d se han plegado en un Conv2d, por lo que el modelo no procesa vídeo real; solo imagen tratada como un fotograma repetido.
- Restricción de forma de entrada: cada dimensión debe ser divisible por 16, y por 32 si se utiliza el merger 2x2. Esto obliga a redimensionar o recortar las imágenes en producción.
- La normalización esperada es `mean=0.5` y `std=0.5`. Usar otra normalización degrada las representaciones.
- No se han publicado métricas de sesgo, robustez ni evaluación de equidad. Al proceder de un VLM entrenado con datos web a gran escala, es esperable heredar sesgos visuales y culturales del corpus original, aunque no se cuantifican en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos si se usa el espacio de embeddings para clasificación sin validación: la similitud en el espacio latente no garantiza equivalencia semántica.
- Licencia Apache 2.0, que permite uso comercial y modificación, siempre que se conserve el aviso de licencia y la atribución correspondiente. Conviene verificar la licencia del modelo base Qwen3-VL-30B-A3B-Instruct para usos derivados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timm/qwen3_vit_416m_merge.qwen3_vl_30b_a3b
- Modelo base Qwen3-VL-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Revisión de origen de los pesos: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct/tree/9c4b90e1e4ba969fd3b5378b57d966d725f1b86c
- Informe técnico de Qwen3-VL: https://arxiv.org/abs/2511.21631
- PyTorch Image Models (timm), repositorio: https://github.com/huggingface/pytorch-image-models
- Organización timm en Hugging Face: https://huggingface.co/timm
- Documentación de timm en Hugging Face: https://huggingface.co/docs/timm/index
- Documentación de timm (timmdocs): https://timm.fast.ai/
- Paquete timm en PyPI: https://pypi.org/project/timm/
- Licencia de Qwen3-VL: https://raw.githubusercontent.com/QwenLM/Qwen3-VL/96588727e44c78b25ba03ea03b8e12f7e64fd0da/LICENSE

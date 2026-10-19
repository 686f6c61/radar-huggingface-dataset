# timm/vit_base_patch16_radio_v3.c_radio

## Resumen

`timm/vit_base_patch16_radio_v3.c_radio` es un codificador de características de imagen (no generativo) publicado por el equipo de PyTorch Image Models (timm) como remapeo nativo de los pesos originales `nvidia/C-RADIOv3-B` de NVIDIA, sin entrenamiento adicional. Se trata de un Vision Transformer base con parches de 16x16 (ViT-B/16), 86.456.064 parámetros y una entrada fija de 512x512 píxeles que produce 1032 tokens (8 de prefijo más 1024 parches) de dimensión 768. Forma parte de la familia C-RADIOv3, los modelos fundacionales de visión "aglomerativos" de NVIDIA, entrenados por destilación multi-profesor.

El interés práctico del modelo está en que condensa en un único codificador de 86,5 M de parámetros las representaciones de cuatro profesores grandes (DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H). De ahí que sus características sirvan simultáneamente para recuperación semántica, segmentación densa y tareas que normalmente requieren backbones distintos, con un coste de 108 GMACs por imagen a 512x512.

Es relevante ahora porque permite sustituir varios backbones especializados por uno solo en pipelines de visión, y porque el checkpoint de timm es directamente consumible con `timm.create_model(..., pretrained=True)`, sin depender del código del repositorio original. Conviene tener en cuenta que este remapeo no incluye las cabezas adaptadoras de los profesores, por lo que no ofrece alineamiento texto-imagen zero-shot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16) para extraccion de caracteristicas; 12 capas, 768 dimensiones, parches de 16x16, 8 tokens de prefijo (CLS por profesor + registers) |
| Parametros totales | 86.456.064 (86,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1032 tokens visuales por imagen a 512x512 (8 de prefijo + 1024 parches); no hay contexto textual |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors en el formato original (fp32, ~0,3 GB). No hay versiones GGUF, ONNX ni int8 oficiales |
| Idiomas soportados | No disponible (codificador de imagen, sin entrada ni salida de texto) |
| Licencia | NVIDIA Open Model License (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors (pesos remapeados a timm; tamano del repo 0,3 GB) |

Otros datos tecnicos: 108,0 GMACs por imagen, 249,3 M de activaciones, resolucion de entrenamiento nativa 512x512, malla de posiciones de 32x32 parches.

## Arquitectura y entrenamiento

El modelo es un transformer de vision puro con normalizacion de entrada interna equivalente a la media y desviacion tipica de OpenAI CLIP (la `pretrained_cfg` de timm aplica esa misma normalizacion en las transformaciones de datos). La proyeccion lineal sin sesgo del patch embedding original se ha remapeado a una convolucion con sesgo cero, y las embeddings de posicion se han reescalado una unica vez con interpolacion bilineal desde la malla de 128x128 de RADIO hasta 32x32 (512x512), con `align_corners=True`. A 512x512 las salidas coinciden con el modelo original; para cualquier otra resolucion (via `img_size` o `dynamic_img_size=True`) se remuestrea desde esta malla reducida y las salidas se desvian del modelo de NVIDIA, por lo que el autor recomienda la variante `naflexvit_base_patch16_radio_v3.c_radio` para ese caso.

El entrenamiento original de C-RADIOv3 es una destilacion multi-profesor (aglomerativa) de DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H, sobre el dataset NV-CC-Img-Text-Dataset segun la model card de NVIDIA. Los 8 tokens de prefijo corresponden a un token CLS por profesor seguido de registers; timm los modela como `cls_token` mas `reg_token`, y la salida de resumen estilo RADIO es la concatenacion de los tres primeros CLS (DFN CLIP, SigLIP2, DINOv2), de 2304 dimensiones. No se incluyen las cabezas adaptadoras de los profesores. Las innovaciones tecnicas asociadas a la familia estan descritas en RADIOv2.5 (baselines aglomerativos), FeatSharp (nitidez de caracteristicas), PHI-S (equilibrado de distribuciones en destilacion multi-profesor sin etiquetas) y AM-RADIO.

## Capacidades

- Extraccion de embeddings globales de imagen: `forward_head(tokens, pre_logits=True)` devuelve un vector de 768 dimensiones a partir del primer token CLS.
- Salida de resumen multi-profesor estilo RADIO: concatenacion de los tokens CLS [0, 1, 2] en un vector de 2304 dimensiones que agrega las visiones de DFN CLIP, SigLIP2 y DINOv2.
- Caracteristicas espaciales densas: 1024 tokens de 768 dimensiones, uno por parche de 16x16, aptos para tareas densas (segmentacion, profundidad, correspondencia).
- Mapas de caracteristicas intermedios mediante `forward_intermediates(..., output_fmt='NCHW')`, con formas del tipo (1, 768, 32, 32).
- Clasificacion por kNN y probing lineal sobre las caracteristicas congeladas.
- Transferencia a tareas densas: segmentacion semantica en ADE20k y Pascal VOC mediante cabezas ligeras.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un codificador visual.
- No soporta generacion de texto, dialogo, codigo ni matematicas.
- No dispone de alineamiento texto-imagen zero-shot en este checkpoint (las cabezas adaptadoras y el codificador de texto de SigLIP2 no se incluyen).

## Casos de uso

- Busqueda y recuperacion visual (image retrieval): indexar el vector de resumen de 2304 dimensiones de cada imagen en una base vectorial y resolver consultas por similitud coseno; el coste de 108 GMACs por imagen permite indexar lotes grandes en una sola GPU consumer.
- Segmentacion semantica con cabeza ligera: congelar el backbone, extraer los mapas (1, 768, 32, 32) de una capa intermedia y entrenar un decodificador lineal o FPN pequeño; los 49,79 mIoU en ADE20k y 84,68 mIoU en Pascal VOC indican que las caracteristicas ya separan clases densas sin reentrenar el codificador.
- Clasificacion few-shot y kNN: usar el token CLS como descriptor y un kNN sobre el conjunto de entrenamiento (81,22 Top-1 en ImageNet kNN) para prototipos rapidos en dominios donde no hay datos etiquetados suficientes.
- Deduplicacion y curaduria de datasets de imagenes a escala: calcular embeddings de 768 dimensiones y agrupar por similitud para eliminar near-duplicates antes de entrenar otros modelos, con un throughput alto al ser un ViT-B.
- Destilacion de un modelo mayor: emplear las caracteristicas del codificador como objetivo (teacher) para entrenar backbones mas pequenos o tareas especificas, aprovechando que agrega cuatro profesores en un unico espacio.
- Preprocesado visual para pipelines multimodales: conectar los 1024 tokens espaciales a un proyector y a un LLM para construir un VLM ligero, manteniendo el codificador congelado y entrenando solo el conector.
- Inspeccion visual industrial y deteccion de anomalias: comparar embeddings de parches de piezas correctas frente a defectuosas mediante distancia en el espacio de caracteristicas, sin necesidad de un dataset de fallos extenso.
- Percepcion en robotica y manipulacion: extraer caracteristicas densas por parche a partir de la camara para estimacion de pose o correspondencia entre fotogramas con un modelo de menos de 100 M de parametros.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA en las model cards originales de la familia C-RADIO. Los valores zero-shot emplean el adaptador SigLIP2 y el codificador de texto originales, que no estan incluidos en este checkpoint de timm (los resultados reflejan por tanto la calidad del backbone, no una capacidad usable directamente con este repo).

| Benchmark | C-RADIOv3-B (este) | C-RADIOv3-L | C-RADIOv4-SO400M | C-RADIOv3-H | C-RADIOv4-H |
|---|---|---|---|---|---|
| ImageNet zero-shot (Top-1) | 71,30 | 79,95 | 82,01 | 82,65 | 83,09 |
| ImageNet kNN (Top-1) | 81,22 | 84,33 | 85,75 | 86,23 | 86,68 |
| ADE20k segmentacion semantica (mIoU) | 49,79 | 51,87 | 55,14 | 52,75 | 55,20 |
| Pascal VOC segmentacion semantica (mIoU) | 84,68 | 86,12 | 87,22 | 86,41 | 87,24 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,35 GB en fp32 y 0,17 GB en fp16; con las 249,3 M de activaciones y un lote pequeno a 512x512, el consumo cabe holgadamente por debajo de 2 GB en fp16 y alrededor de 2-3 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria; RTX 3060/4060, RTX 4090, A100, H100, L4 o T4 son suficientes. El modelo no necesita tensor parallelism ni sharding.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida para lotes de una imagen.
- Opciones de despliegue: `timm` con PyTorch (via recomendada, `timm.create_model('hf-hub:timm/vit_base_patch16_radio_v3.c_radio', pretrained=True)`), exportacion a ONNX o TorchScript para servir con Triton u ONNX Runtime, y `transformers` para `image-feature-extraction` cuando exista integracion del checkpoint. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de coste computacional, 108 GMACs por imagen a 512x512.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / tokens | ImageNet kNN | ADE20k mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| C-RADIOv3-B (este, remapeo timm) | 86,5 M | 512x512 / 1032 tokens | 81,22 | 49,79 | NVIDIA Open Model License | HuggingFace, libreria timm |
| C-RADIOv3-L | no disponible | no disponible | 84,33 | 51,87 | NVIDIA Open Model License | HuggingFace (`nvidia`) |
| C-RADIOv3-H | no disponible | no disponible | 86,23 | 52,75 | NVIDIA Open Model License | HuggingFace (`nvidia`) |
| C-RADIOv4-SO400M | no disponible | no disponible | 85,75 | 55,14 | NVIDIA Open Model License | HuggingFace (`nvidia`) |
| `timm/naflexvit_base_patch16_radio_v3.c_radio` | 86,5 M (misma familia) | resolucion nativa flexible | no disponible | no disponible | NVIDIA Open Model License | HuggingFace, libreria timm |

La variante `naflexvit` es la alternativa directa dentro de timm cuando se necesita el comportamiento original a resoluciones distintas de 512x512.

## Limitaciones y advertencias

- No es un modelo generativo ni multimodal de texto: no produce descripciones, no responde preguntas y no admite instrucciones.
- Ausencia de alineamiento texto-imagen: sin las cabezas adaptadoras ni el codificador de texto de SigLIP2, el zero-shot de ImageNet reportado no es reproducible con este checkpoint; requiere entrenar una cabeza propia.
- Deriva a resoluciones distintas de 512x512: la malla de posiciones se remuestreo una sola vez a 32x32, de modo que otros tamanos se interpolan desde esa malla reducida y se desvian del modelo original. Para uso a resolucion variable, usar la variante naflexvit.
- Riesgo de sesgo heredado: el entrenamiento original usa NV-CC-Img-Text-Dataset, un corpus web a gran escala; las caracteristicas pueden reflejar sesgos de representacion de ese dataset en tareas de clasificacion o recuperacion.
- Alucinacion no aplica en el sentido generativo, pero si hay riesgo de falsos positivos en tareas densas derivadas (segmentacion, deteccion de anomalias) cuando el dominio se aleja del de los profesores.
- Licencia: NVIDIA Open Model License, no es una licencia OSI. Permite uso comercial sujeto a los terminos del acuerdo (atribucion, inclusion de avisos y restricciones especificas); conviene revisar el PDF y el fichero NOTICE antes de desplegar en produccion.
- Sin cuantizaciones oficiales: no hay GGUF, ONNX ni int8 publicados; cualquier optimizacion de ese tipo debe validarse por cuenta propia y puede alterar las caracteristicas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente nulo, sin issues ni recetas de terceros.
- Para segmentacion o deteccion en produccion hara falta una cabeza entrenada especificamente; los mIoU de la tabla corresponden a protocolos de evaluacion congelados de NVIDIA, no a un modelo listo para inferir mascaras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/vit_base_patch16_radio_v3.c_radio
- Pesos originales de NVIDIA: https://huggingface.co/nvidia/C-RADIOv3-B
- Revision concreta de los pesos de origen: https://huggingface.co/nvidia/C-RADIOv3-B/tree/44653a0482cf460bb4f12595fc3cc3dfecc403d1
- Repositorio original RADIO (NVlabs): https://github.com/NVlabs/RADIO
- Variante de resolucion flexible en timm: https://huggingface.co/timm/naflexvit_base_patch16_radio_v3.c_radio
- PyTorch Image Models: https://github.com/huggingface/pytorch-image-models
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Paper RADIOv2.5: https://arxiv.org/abs/2412.07679
- Paper FeatSharp: https://arxiv.org/abs/2502.16025
- Paper PHI-S: https://arxiv.org/abs/2410.01680
- Paper AM-RADIO: https://arxiv.org/abs/2312.06709

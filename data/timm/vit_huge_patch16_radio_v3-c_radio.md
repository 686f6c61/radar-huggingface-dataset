# timm/vit_huge_patch16_radio_v3.c_radio

## Resumen

`timm/vit_huge_patch16_radio_v3.c_radio` es un codificador de características de imagen (image feature extractor) publicado por el equipo de timm como remapeo nativo de los pesos originales de NVIDIA `nvidia/C-RADIOv3-H`, sin entrenamiento adicional. C-RADIOv3 es un modelo fundacional de visión de tipo "aglomerativo": en lugar de entrenarse contra una única señal, se destila de cuatro profesores especializados (DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H), de modo que un solo backbone concentra alineación semántica con texto, características densas de alta calidad y sensibilidad a la segmentación.

El checkpoint es un Vision Transformer con parches de 16×16 y 631.983.360 parámetros, con una resolución nativa de 512×512 que produce 1032 tokens (8 de prefijo más 1024 parches) de dimensión 1280. Su interés práctico es que sustituye a varios codificadores por uno solo en pipelines de visión: clasificación lineal o kNN, segmentación semántica, detección, estimación densa o extracción de embeddings para búsqueda y clustering, sin necesidad de reentrenar.

Es relevante ahora porque el ecosistema timm permite cargarlo con una sola línea (`timm.create_model('hf-hub:...', pretrained=True)`) y expone tanto el embedding global como los mapas espaciales intermedios. Conviene tener en cuenta que este remapeo no incluye las cabezas adaptadoras de los profesores, por lo que no ofrece alineación texto-imagen zero-shot; además, la rejilla de posiciones se ha remuestreado de 128×128 a 32×32, de forma que las salidas coinciden con el original a 512×512 pero no en otras resoluciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H/16), parches de 16×16, dimensión oculta 1280, 8 tokens de prefijo (CLS + registers) |
| Parámetros totales | 631.983.360 (632.0 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1032 tokens visuales a 512×512 (8 de prefijo + 1024 parches); no procesa texto |
| Tipos de cuantización | No disponibles. Pesos en safetensors; el repositorio ocupa 2,5 GB. La cuantización posterior (int8, fp16) es posible vía PyTorch/timm pero no se documenta |
| Idiomas soportados | No aplica: codificador de imagen sin torre de texto ni tokenizador. Idiomas no disponibles |
| Licencia | NVIDIA Open Model License (junio de 2024) |
| Formato de pesos | safetensors (formato nativo de timm, `pytorch_model.bin` no incluido) |
| Resolución de entrada | 512×512 nativa |
| Cómputo por imagen | 738.0 GMACs (≈1,48 TFLOPs), 969,3 M de activaciones |
| Pipeline | image-feature-extraction |
| Modelo base | nvidia/C-RADIOv3-H (revisión d7fd0e2b0a1761f1af150582e06c41e9a99b0bf8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de visión estándar con patch embedding de 16×16 y dimensión oculta 1280 (confirmada por la forma de salida `(1, 1032, 1280)` del ejemplo de uso). El modelo original opera con una rejilla de posiciones de 128×128; este checkpoint la remuestrea una sola vez a 32×32 mediante el método de resize de RADIO, de manera que a 512×512 las salidas coinciden con el modelo original. Los 8 tokens de prefijo corresponden a un token CLS por profesor seguido de registers; timm los modela como `cls_token` más `reg_token`, y la salida "summary" de RADIO equivale a la concatenación de los CLS [0, 1, 2] (DFN CLIP, SigLIP2, DINOv2), es decir, un vector de 3840 dimensiones. La proyección lineal del patch embedding sin sesgo se ha remapeado a una convolución con sesgo cero, y las posiciones se redimensionan con interpolación bilineal sin antialiasing, recortando arriba a la izquierda con `align_corners=True`.

El entrenamiento es una destilación multi-profesor: DFN5B CLIP ViT-H/14-378 (alineación imagen-texto a gran escala), SigLIP2-SO400M (alineación sigmoide), DINOv2-g/14 con registers (características densas auto-supervisadas) y SAM ViT-H (semántica de segmentación). Los datos proceden del NV-CC-Img-Text-Dataset, según la model card de NVIDIA. La técnica de destilación se apoya en los métodos descritos en los artículos AM-RADIO, PHI-S (equilibrado de distribución para destilación multi-profesor sin etiquetas) y RADIOv2.5; FeatSharp aborda la nitidez de los mapas de características. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF/DPO (no aplicables a un codificador de visión).

## Capacidades

- Extracción de embeddings globales de imagen: vector de 1280 dimensiones con `forward_head(tokens, pre_logits=True)` o de 3840 dimensiones concatenando los tres CLS de profesor.
- Extracción de características espaciales densas: 1024 tokens de 1280 dimensiones correspondientes a una rejilla 32×32.
- Mapas de características intermedios por capa mediante `forward_intermediates` en formato NCHW, por ejemplo `(1, 1280, 32, 32)`.
- Características multi-dominio por destilación: alineación semántica tipo CLIP/SigLIP2, descriptores densos tipo DINOv2 y semántica de segmentación tipo SAM en un único backbone.
- Clasificación sin reentrenamiento mediante kNN o linear probe sobre los embeddings (86,23 % top-1 en ImageNet kNN según NVIDIA).
- Segmentación semántica con decodificador ligero (52,75 mIoU en ADE20k, 86,41 mIoU en Pascal VOC).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo ni de lenguaje.
- No dispone de alineación texto-imagen zero-shot en este checkpoint: las cabezas adaptadoras de los profesores no están incluidas.

## Casos de uso

- Clasificación de imágenes con backbone congelado: extraer el embedding de 1280 dimensiones y entrenar un clasificador lineal o kNN encima; adecuado cuando no hay presupuesto para fine-tuning completo y se necesita una línea base sólida (86,23 % top-1 kNN en ImageNet reportado por NVIDIA).
- Segmentación semántica con decodificador ligero: usar los mapas `(1, 1280, 32, 32)` de `forward_intermediates` como entrada de un cabezal de segmentación tipo Linear/DPT, con resultados de referencia de 52,75 mIoU en ADE20k y 86,41 mIoU en Pascal VOC.
- Búsqueda visual y deduplicación de imágenes: indexar el vector de 1280 o 3840 dimensiones en una base vectorial (FAISS, Qdrant) para recuperación por similitud, clustering de catálogos o detección de duplicados en datasets grandes.
- Preentrenamiento de modelos visión-lenguaje: congelar el codificador como torre visual y entrenar solo un proyector y el LLM; la alineación con DFN5B CLIP y SigLIP2 reduce el trabajo de adaptación frente a un ViT genérico.
- Análisis denso en pipelines industriales: inspección visual, segmentación de defectos o estimación de profundidad y normales usando las características espaciales de 32×32 y las intermedias, con el modelo congelado y un cabezal específico por tarea.
- Curación y etiquetado semiautomático de datasets: generar embeddings para agrupar imágenes no etiquetadas, seleccionar muestras representativas o detectar clases infrarepresentadas antes de anotar.
- Prompting tipo SAM en visión: aprovechar la destilación de SAM ViT-H para tareas de segmentación asistida por puntos o cajas, con un decodificador de máscaras entrenado sobre las características del backbone.
- Extracción de características en lote para motores de recomendación visual o moderación de contenido, donde se necesita un único extractor que cubra similitud semántica y estructura fina.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA en las model cards de C-RADIOv4. La columna C-RADIOv3-H corresponde a la arquitectura de este checkpoint. Los resultados zero-shot emplean el adaptador SigLIP2 y el codificador de texto originales, que no están incluidos en este repositorio, por lo que no son reproducibles directamente con estos pesos.

| Benchmark | C-RADIOv3-B | C-RADIOv3-L | C-RADIOv4-SO400M | C-RADIOv3-H | C-RADIOv4-H |
|---|---|---|---|---|---|
| ImageNet zero-shot (top-1) | 71,30 | 79,95 | 82,01 | 82,65 | 83,09 |
| ImageNet kNN (top-1) | 81,22 | 84,33 | 85,75 | 86,23 | 86,68 |
| ADE20k segmentación semántica (mIoU) | 49,79 | 51,87 | 55,14 | 52,75 | 55,20 |
| Pascal VOC segmentación semántica (mIoU) | 84,68 | 86,12 | 87,22 | 86,41 | 87,24 |

No se han publicado en la información disponible resultados desagregados por tarea de detección, profundidad ni recuperación para este checkpoint concreto.

## Requisitos de hardware

- VRAM para pesos: 632 M de parámetros equivalen a unos 2,53 GB en fp32, 1,26 GB en fp16/bf16 y 0,63 GB en int8 (cálculo derivado del número de parámetros, no publicado por el autor).
- Activaciones: 969,3 M de activaciones declaradas, aproximadamente 3,9 GB en fp32 y 1,9 GB en fp16 para un lote de 1 imagen a 512×512; el consumo real crece de forma lineal con el tamaño de lote.
- GPU consumer: cabe con holgura en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) e incluso en GPUs de 8 GB si se usa fp16 y lotes pequeños.
- GPU de datacenter: A100 40/80 GB, H100 y L40S para inferencia por lotes grandes o extracción masiva de características; el modelo es ideal para procesos offline de alto throughput.
- Despliegue: timm + PyTorch (`timm.create_model('hf-hub:timm/vit_huge_patch16_radio_v3.c_radio', pretrained=True)`), exportación a ONNX, TorchScript o TensorRT, y `torch.compile`. vLLM, TGI, llama.cpp u Ollama no aplican al no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de coste computacional, 738 GMACs por imagen a 512×512 (≈1,48 TFLOPs) sitúan la inferencia muy por encima de un ViT-B/16 en coste por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | ImageNet kNN | ADE20k mIoU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| C-RADIOv3-H (este checkpoint) | 632 M | 1032 tokens a 512×512 | 86,23 | 52,75 | NVIDIA Open Model License | timm y HF (nvidia/C-RADIOv3-H) |
| C-RADIOv3-L | No disponible | No disponible | 84,33 | 51,87 | NVIDIA Open Model License | HF (familia C-RADIO) |
| C-RADIOv3-B | No disponible | No disponible | 81,22 | 49,79 | NVIDIA Open Model License | HF (familia C-RADIO) |
| C-RADIOv4-H | No disponible | No disponible | 86,68 | 55,20 | NVIDIA Open Model License | HF (familia C-RADIO) |

Frente a las variantes de menor tamaño de la misma familia, C-RADIOv3-H gana 5,0 puntos de top-1 kNN y 2,96 mIoU en ADE20k respecto a C-RADIOv3-B. Frente a C-RADIOv4-H pierde 0,45 puntos de kNN y 2,45 mIoU en ADE20k, a cambio de una generación anterior del método de destilación. No se dispone en la información proporcionada de datos de parámetros, contexto ni licencia de los modelos comparados más allá de lo indicado.

## Limitaciones y advertencias

- No incluye cabezas adaptadoras de profesor ni codificador de texto: la alineación texto-imagen zero-shot del repositorio original de NVIDIA no está disponible con estos pesos.
- Resolución nativa fija de 512×512. Otras resoluciones (vía `img_size` o `dynamic_img_size=True`) se remuestrean desde la rejilla reducida de 32×32 y se desvían del modelo original; para el comportamiento original en cualquier resolución debe usarse `timm/naflexvit_huge_patch16_radio_v3.c_radio`.
- Normalización interna con media y desviación típica de OpenAI CLIP en el rango [0, 1]; usar otras estadísticas degrada las características. El `pretrained_cfg` de timm ya aplica la normalización correcta en las transformaciones.
- Licencia NVIDIA Open Model License: no es una licencia OSI y contiene condiciones específicas de uso, redistribución y atribución. Es imprescindible revisar el texto completo (`LICENSE.pdf` y `NOTICE`) antes de un despliegue comercial.
- Sesgos heredados de los profesores (DFN5B CLIP, SigLIP2, DINOv2, SAM) y del NV-CC-Img-Text-Dataset, con coberturas demográficas y geográficas desiguales; no se documentan evaluaciones de sesgo específicas para este checkpoint.
- Riesgo de que las características no generalicen fuera del dominio de los datos de destilación; conviene validar con un conjunto propio antes de usar el modelo congelado en producción.
- No es un modelo generativo: no produce texto, etiquetas ni máscaras por sí mismo, solo representaciones; cualquier tarea requiere un cabezal o un decodificador adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria todavía inexistentes para este remapeo concreto.
- No se publican datos sobre idiomas ni sobre rendimiento en dominios especializados (médico, satelital, industrial).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/timm/vit_huge_patch16_radio_v3.c_radio
- Pesos originales de NVIDIA: https://huggingface.co/nvidia/C-RADIOv3-H
- Variante con comportamiento original a cualquier resolución: https://huggingface.co/timm/naflexvit_huge_patch16_radio_v3.c_radio
- Repositorio oficial de RADIO (NVlabs): https://github.com/NVlabs/RADIO
- PyTorch Image Models (timm): https://github.com/huggingface/pytorch-image-models
- Licencia NVIDIA Open Model License: https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Paper RADIOv2.5: https://arxiv.org/abs/2412.07679
- Paper FeatSharp: https://arxiv.org/abs/2502.16025
- Paper PHI-S: https://arxiv.org/abs/2410.01680
- Paper AM-RADIO: https://arxiv.org/abs/2312.06709

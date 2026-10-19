# timm/vit_large_patch16_radio_v3.c_radio

## Resumen

El modelo es un encoder visual C-RADIOv3-L de NVIDIA, publicado en timm como un remapeo nativo de los pesos originales y sin entrenamiento adicional. Se trata de un Vision Transformer ViT-L/16 de 304,2 M de parámetros que genera embeddings globales y características espaciales densas a partir de imágenes de 512 x 512; no es un modelo generativo de texto ni un VLM completo.

Resuelve la necesidad de disponer de una representación visual única y reutilizable para clasificación, segmentación, recuperación visual y destilación, aglutinando varios profesores mediante destilación multi-profesor: DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H. Con 365,1 GMACs por imagen y una salida de 1.024 tokens espaciales, es relevante para pipelines de visión que necesitan features densas y un embedding resumido sin encadenar varios backbones.

El checkpoint de timm no incluye las cabezas adaptadoras de los profesores, por lo que no ofrece alineación texto-imagen zero-shot directamente. Su uso principal es la extracción de características para cabezas ligeras, retrieval, segmentación y destilación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-L/16; C-RADIOv3 (Agglomerative Vision Foundation Model) |
| Parámetros totales | 304.202.752 (304,2 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica como contexto de texto. Entrada de imagen de 512 x 512: 1.024 parches de 16 x 16 + 8 tokens de prefijo = 1.032 tokens de visión |
| Tipos de cuantización | No disponible; no se publican cuantizaciones oficiales. Los pesos safetensors pueden convertirse con herramientas externas |
| Idiomas soportados | No aplica; el modelo no procesa texto. No disponible a nivel de idioma |
| Licencia | NVIDIA Open Model License (`license: other`; no es una licencia OSI) |
| Formato de pesos | safetensors; remapeo nativo para timm |

## Arquitectura y entrenamiento

C-RADIOv3 es un modelo fundacional visual aglomerativo entrenado por destilación multi-profesor a partir de DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registers y SAM ViT-H. El checkpoint de timm reproduce los pesos de `nvidia/C-RADIOv3-L` y no añade entrenamiento. La entrada se normaliza internamente con la media y la desviación típica de OpenAI CLIP; la configuración `pretrained_cfg` de timm aplica la misma normalización en las transformaciones. Se reportan 365,1 GMACs y 663,6 M de activaciones para una imagen de 512 x 512.

Los 8 tokens de prefijo corresponden a un token CLS por profesor seguido de registros; timm los modela como `cls_token` y `reg_token`. La rejilla de embeddings de posición se remuestrea una vez de la rejilla 128 x 128 de RADIO a 32 x 32 para 512 x 512, y las salidas coinciden con el modelo original a esa resolución. Otras resoluciones se remuestrean desde esa rejilla reducida y pueden desviarse del modelo original; para el comportamiento original a cualquier resolución se indica el variante `naflexvit_large_patch16_radio_v3`.

El remapeo de timm convierte la proyección lineal sin sesgo del patch embedding en una convolución con sesgo cero y redimensiona las posiciones con interpolación bilineal sin antialiasing, recorte superior izquierdo y `align_corners=False`. No se incluyen las cabezas adaptadoras de los profesores, por lo que no hay alineación texto-imagen zero-shot desde este repositorio. El dataset de entrenamiento indicado por NVIDIA es NV-CC-Img-Text-Dataset.

## Capacidades

- Extracción de un embedding global de 1.024 dimensiones mediante el primer token CLS (`forward_head(..., pre_logits=True)`).
- Generación del resumen estilo RADIO de 3.072 dimensiones mediante la concatenación de los tokens CLS [0, 1, 2], correspondientes a DFN CLIP, SigLIP2 y DINOv2.
- Extracción de características espaciales densas: 1.024 tokens de parche con 1.024 dimensiones para una imagen de 512 x 512.
- Obtención de mapas de características intermedias mediante `forward_intermediates`, por ejemplo mapas de forma `(1, 1024, 32, 32)`.
- Uso como backbone para clasificación lineal, kNN, segmentación semántica, detección y otras tareas densas.
- Soporte de extracción de features para retrieval visual, clustering y deduplicación de imágenes.
- Capacidad de servir como profesor en destilación o como extractor congelado para entrenar cabezas ligeras.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta capacidades multilingües de texto ni vision-language zero-shot con este checkpoint, al faltar las cabezas adaptadoras y el codificador de texto.
- No dispone de modo thinking, audio ni otras capacidades generativas.

## Casos de uso

- Búsqueda y recuperación visual: indexar embeddings globales de 1.024 o 3.072 dimensiones en una base vectorial para recuperar imágenes similares por contenido visual, sin depender de etiquetas textuales.
- Clasificación de imágenes con pocas etiquetas: congelar el encoder y entrenar una regresión logística o un clasificador kNN sobre las features globales; los resultados kNN reportados en ImageNet lo sitúan en 84,33 Top-1 para C-RADIOv3-L.
- Segmentación semántica: usar los 1.024 tokens espaciales de 1.024 dimensiones como entrada de un decodificador ligero; en ADE20k se reporta 51,87 mIoU y en Pascal VOC 86,12 mIoU para este tamaño.
- Backbone para detección y segmentación densa: aprovechar los mapas intermedios de 32 x 32 para tareas que requieren resolución espacial y múltiples escalas, como detección de objetos o segmentación de instancias.
- Deduplicación y clustering de datasets: calcular embeddings globales para agrupar imágenes visualmente similares, detectar duplicados casi idénticos o analizar la distribución de un corpus de imágenes.
- Destilación de representaciones: utilizar las salidas del modelo como profesor para entrenar un backbone más pequeño que replique sus features globales y espaciales en entornos con menos recursos.
- Precomputación de features para entrenamiento de cabezas: extraer una vez las features de un dataset grande y entrenar después clasificadores o decodificadores sin volver a ejecutar el ViT en cada época.
- Control de calidad e inspección visual: combinar embeddings globales con un clasificador ligero para detectar anomalías, defectos o cambios de distribución en imágenes industriales, siempre que se valide con datos del dominio.

## Benchmarks y rendimiento

Resultados reportados por NVIDIA en las model cards originales de C-RADIOv4. Los resultados zero-shot utilizan el adaptador SigLIP2 original y el codificador de texto, que no están incluidos en este checkpoint de timm; por tanto, el valor zero-shot no es reproducible solo con este repositorio.

| Benchmark | C-RADIOv3-B | C-RADIOv3-L | C-RADIOv4-SO400M | C-RADIOv3-H | C-RADIOv4-H |
|---|---:|---:|---:|---:|---:|
| ImageNet zero-shot Top-1 | 71,30 | 79,95 | 82,01 | 82,65 | 83,09 |
| ImageNet kNN Top-1 | 81,22 | 84,33 | 85,75 | 86,23 | 86,68 |
| ADE20k segmentación semántica, mIoU | 49,79 | 51,87 | 55,14 | 52,75 | 55,20 |
| Pascal VOC segmentación semántica, mIoU | 84,68 | 86,12 | 87,22 | 86,41 | 87,24 |

No se han publicado en la información disponible resultados independientes adicionales ni latencias medidas para este checkpoint.

## Requisitos de hardware

- Pesos en FP32: aproximadamente 1,22 GB; en BF16/FP16: aproximadamente 0,61 GB; en INT8: aproximadamente 0,30 GB.
- VRAM orientativa para inferencia con batch 1 y 512 x 512: 2-4 GB en BF16/FP16 y 4-6 GB en FP32, incluyendo activaciones y overhead. Son estimaciones no oficiales; lotes mayores aumentan el consumo.
- Cabe en GPUs consumer de 8 GB o más para batch 1; para lotes grandes o entrenamiento de cabezas se recomiendan 12-24 GB, por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB.
- Para servicio de alto throughput se recomiendan GPU de datacenter como A100, H100, L40S, L4 o A10, según el equilibrio entre latencia y coste.
- Desplieg

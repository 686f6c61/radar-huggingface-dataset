# timm/naflexvit_large_patch16_radio_v3.c_radio

## Resumen

El modelo `timm/naflexvit_large_patch16_radio_v3.c_radio` es un codificador de características visuales de NVIDIA, publicado como remapeo nativo a timm de `nvidia/C-RADIOv3-L`, sin entrenamiento adicional. Forma parte de la familia C-RADIOv3, un modelo fundacional visual de tipo aglomerativo entrenado por destilación multi-profesor a partir de DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registros y SAM ViT-H. Con 319,9 millones de parámetros, es un Vision Transformer de parche 16 y variante NaFlex, que admite resolución y relación de aspecto variables.

Su interés práctico es que concentra en un solo backbone características globales y espaciales densas que antes requerían varios codificadores especializados: embeddings de imagen, tokens de parche, mapas intermedios y capacidades de segmentación semántica y clasificación kNN. La variante NaFlex conserva la rejilla completa de posiciones de 128x128, lo que permite trabajar hasta 2048 px y mantener el remuestreo de posiciones del RADIO original en distintas resoluciones y aspect ratios.

No es un modelo generativo ni un modelo de lenguaje: no responde a instrucciones, no hace tool calling y no incluye el adaptador de texto necesario para alineamiento texto-imagen zero-shot. Se distribuye con licencia NVIDIA Open Model License y formato safetensors, pensado para usarse como extractor de características en pipelines de visión por computador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NaFlexViT: Vision Transformer con parche de 16 px y resolución/relación de aspecto variables; variante NaFlex de C-RADIOv3 |
| Parámetros totales | 319,9 M (319.931.392) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; a 512x512 genera 1024 tokens de parche más 8 tokens de prefijo (1032 tokens). Rejilla de posiciones de 128x128, hasta 2048 px |
| Tipos de cuantización | No documentados; el repositorio publica pesos safetensors sin variantes cuantizadas oficiales |
| Idiomas soportados | No aplica (encoder visual sin entrada de texto) |
| Licencia | NVIDIA Open Model License (`license: other` en el Hub) |
| Formato de pesos | safetensors; repositorio timm de 1,3 GB |
| Resolución de entrada | Variable mediante NaFlex; tamaño de imagen de referencia 512x512 |
| Carga computacional | 365,1 GMACs y 663,6 M de activaciones a 512x512 |
| Modelo base | `nvidia/C-RADIOv3-L`; remapeo a timm sin entrenamiento adicional |
| Dimensión de embedding | 1024 por token; resumen RADIO de 3072 dimensiones mediante concatenación de los tokens CLS [0, 1, 2] |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo ViT-L/16 con anchura de 1024 dimensiones y 8 tokens de prefijo: tokens CLS asociados a los profesores y tokens de registro. timm los modela como un `cls_token` más `reg_token`. La salida `forward_features` devuelve 1032 tokens a 512x512: 8 de prefijo y 1024 de parche. El resumen RADIO se obtiene concatenando los tokens CLS [0, 1, 2], correspondientes a DFN CLIP, SigLIP2 y DINOv2, mientras que los tokens espaciales se obtienen descartando los tokens de prefijo.

El entrenamiento es una destilación multi-profesor de tipo aglomerativo: el modelo aprende a reproducir representaciones de DFN5B CLIP ViT-H/14-378, SigLIP2-SO400M, DINOv2-g/14 con registros y SAM ViT-H. La model card cita el conjunto NV-CC-Img-Text-Dataset de NVIDIA y técnicas como PHI-S para el balanceo de distribuciones en destilación sin etiquetas. No hay RLHF ni DPO, ya que no es un modelo generativo. La variante NaFlex mantiene la rejilla de posiciones de 128x128 del RADIO original y aplica un remuestreo bilineal sin antialiasing, con `align_corners=False`, para adaptarse a resoluciones y relaciones de aspecto arbitrarias.

Entre las innovaciones destacables están la integración de características CLIP, SigLIP, DINOv2 y SAM en un único espacio, el soporte de resolución variable mediante NaFlex y la posibilidad de extraer mapas de características intermedias con `forward_intermediates`, por ejemplo tensores de 1024x32x32 a 512x512. La normalización de entrada se aplica internamente con media y desviación estándar de OpenAI CLIP, y la configuración de timm reproduce esa normalización en las transformaciones de datos.

## Capacidades

- Extracción de embeddings globales de imagen de 1024 dimensiones usando el primer token CLS, aptos para clasificación, retrieval y similitud visual.
- Generación del resumen RADIO de 3072 dimensiones concatenando los tokens CLS [0, 1, 2], que combina información de varios profesores.
- Extracción de características espaciales densas: 1024 tokens de parche de 1024 dimensiones a una entrada de 512x512.
- Obtención de mapas de características intermedias mediante `forward_intermediates`, útil para segmentación, detección y destilación.
- Soporte de resolución y relación de aspecto variables con la pipeline NaFlex de timm, manteniendo la rejilla de posiciones de 128x128.
- Clasificación kNN y evaluación lineal sobre características congeladas; la model card reporta 84,33 de top-1 en ImageNet kNN.
- Segmentación semántica con cabezas ligeras; se reportan 51,87 mIoU en ADE20k y 86,12 mIoU en Pascal VOC.
- Uso como backbone visual para sistemas multimodales, con la salvedad de que requiere entrenar una proyección o cabeza específica.
- No incluye tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No incluye adaptador de texto ni codificador de texto, por lo que no permite alineamiento texto-imagen zero-shot directamente.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Segmentación semántica y etiquetado denso: usar los tokens de parche y los mapas intermedios como entrada a una cabeza de segmentación ligera; la model card reporta 51,87 mIoU en ADE20k y 86,12 mIoU en Pascal VOC, lo que lo hace adecuado como backbone congelado o con fine-tuning parcial.
- Búsqueda y recuperación visual: generar el embedding global de 1024 dimensiones o el resumen de 3072 dimensiones para indexar imágenes en FAISS o un motor vectorial y resolver búsquedas por similitud, duplicados y agrupación de colecciones.
- Clasificación few-shot y kNN: construir un banco de embeddings etiquetados y clasificar imágenes nuevas por vec

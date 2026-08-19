# sugam24/geonusaf-unetformer-r18-block-fold0

## Resumen

GeoNUSAF - UNetFormer (ResNet-18) es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por Sugam Dahal (usuario sugam24 en Hugging Face). Está entrenado para clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola. El modelo se basa en la arquitectura UNetFormer propuesta por Wang et al. (2022) en el artículo "UNetFormer: A UNet-like transformer for efficient semantic segmentation of remote sensing urban scene imagery", publicada en ISPRS Journal of Photogrammetry and Remote Sensing.

La implementación utiliza un encoder ResNet-18 preentrenado en ImageNet y un decoder con atención global-local, diseñado para equilibrar eficiencia y precisión en escenas urbanas. El checkpoint disponible corresponde al fold 0 de una validación cruzada por bloques (block split) con semilla 42, y alcanza un mIoU de validación de 0,2894. Es un modelo de tamaño reducido (el repositorio pesa 0,4 GB) orientado a tareas de mapeo de cobertura terrestre, aunque su rendimiento es modesto en algunas clases como río y carretera.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm, decoder con atención global-local) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint .pt con model_state, cfg y metrics) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer descrita en el paper de Wang et al. (2022). El encoder es un ResNet-18 (preentrenado en ImageNet) que extrae características multiescala. El decoder emplea tres bloques Transformer de atención global-local y un cabezal de refinamiento de características, lo que permite modelar información global y local sin aumentar excesivamente la complejidad computacional. Esta implementación es independiente del repositorio de referencia (GeoSeg, con licencia GPL-3.0), según indica el autor.

El entrenamiento se realizó sobre imágenes del valle de Katmandú con una resolución efectiva de 0,586 m/px, recortadas a 512x512 y normalizadas con estadísticas de ImageNet. Se usaron 6 clases con índice de ignorancia 255. El optimizador fue AdamW con weight decay 0,0001, tasa de aprendizaje de 0,0006 para el decoder y 6e-05 para el encoder, y un peso de 0,4 para la cabeza auxiliar. La mejor época fue la 7. La validación se hizo mediante split por bloques (block split) basado en un proxy de orden de exportación, no en división espacial, lo que puede inflar ligeramente las métricas.

## Capacidades

- Segmentación semántica de imágenes de teledetección (satélite o aéreas) en 6 clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Entrada de 512x512 píxeles con normalización ImageNet.
- Detección de cobertura terrestre en entornos urbanos y periurbanos.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede clasificar automáticamente parcelas residenciales, carreteras y zonas agrícolas en imágenes de alta resolución, útil para catastro y planificación urbana en ciudades como Katmandú.
- Monitoreo de recursos naturales: la clase "bosque" muestra el mejor IoU (0,5731), por lo que puede emplearse para estimar cobertura forestal y detectar deforestación en áreas de estudio similares.
- Gestión de riesgos de inundación: aunque la clase "río" tiene un IoU muy bajo (0,0112), el modelo podría servir como entrada preliminar para identificar cauces en imágenes de gran resolución, siempre que se combine con post-procesado.
- Análisis de expansión urbana: comparando predicciones de diferentes fechas, se puede cuantificar el crecimiento de zonas residenciales y la pérdida de suelo agrícola o sin uso.
- Agricultura de precisión: la clase "agrícola" con IoU 0,3623 permite delimitar parcelas cultivadas, aunque con margen de error; puede ser útil para estimar superficies de cultivo en regiones con características similares.
- Generación de mapas temáticos para SIG: el modelo produce máscaras de segmentación que pueden integrarse en flujos de trabajo GIS para actualizar cartografía de cobertura terrestre.

## Benchmarks y rendimiento

El autor proporciona métricas de validación para el fold 0. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| mIoU | 0,2894 |
| mF1 | 0,4141 |
| OA (overall accuracy) | 0,5611 |
| Kappa | 0,4260 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,4436 | 0,6146 |
| Road | 0,1395 | 0,2448 |
| River | 0,0112 | 0,0221 |
| Forest | 0,5731 | 0,7287 |
| UnusedLand | 0,2065 | 0,3423 |
| Agricultural | 0,3623 | 0,5319 |

## Requisitos de hardware

No se dispone de requisitos oficiales de hardware en la información proporcionada. Dado que el checkpoint pesa 0,4 GB y la arquitectura usa un encoder ResNet-18 (relativamente ligero), es probable que el modelo pueda ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM para inferencia a 512x512, pero no hay datos confirmados. Tampoco se especifican opciones de despliegue (vLLM, llama.cpp, etc., no aplican por ser un modelo de visión). Se recomienda usar PyTorch con CUDA para inferencia.

## Comparativa con modelos similares

No se han encontrado comparaciones directas con otros modelos de segmentación semántica en la información disponible. El modelo se basa en UNetFormer, que en el paper original se compara favorablemente con U-Net, DeepLabV3 y otros, pero no se dispone de esos datos para este checkpoint concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase "River" (IoU 0,0112) y bajo en "Road" (IoU 0,1395), lo que limita su uso en aplicaciones que requieran precisión en estas categorías.
- El modelo fue entrenado exclusivamente con datos del valle de Katmandú; su generalización a otras regiones geográficas o tipos de imagen no está garantizada.
- La validación por bloques (block split) no es una validación espacial estricta, por lo que las métricas pueden estar optimistas.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No se proporcionan detalles sobre el dataset de entrenamiento (número de imágenes, balance de clases, etc.), lo que dificulta evaluar posibles sesgos.
- El checkpoint corresponde solo al fold 0 de 3; los resultados pueden variar con otros folds.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
- Paper original UNetFormer: https://arxiv.org/abs/2109.08937
- Repositorio GeoSeg (referencia): https://github.com/WangLibo1995/GeoSeg
- Repositorio alternativo UNetFormer: https://github.com/manhhv87/UNetFormer
- Artículo en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S0924271622001654
- Perfil del autor en Hugging Face: https://huggingface.co/sugamd24

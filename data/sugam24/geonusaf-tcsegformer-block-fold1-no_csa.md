# sugam24/geonusaf-tcsegformer-block-fold1-no_csa

## Resumen

El modelo `sugam24/geonusaf-tcsegformer-block-fold1-no_csa` es un sistema de segmentación semántica para clasificación de usos del suelo en el Valle de Katmandú (Nepal). Forma parte de la serie GeoNUSAF, desarrollada por el usuario sugam24, que explora variantes del arquitecto SegFormer para teledetección urbana. Este checkpoint concreto corresponde al pliegue 1 de 3 de una validación cruzada por bloques, con la ablación `no_ca` (sin reweighting de clases CSA) y con la ruta de detalle activada.

El modelo distingue seis clases (residencial, carretera, río, bosque, suelo no utilizado y agrícola) sobre imágenes de 512×512 píxeles a una resolución de 0,586 m/píxel. Aunque su métrica global (mIoU 0,3979) es modesta, el rendimiento por clase es muy desigual, con resultados fuertes en residencial y bosque pero débiles en carretera y río. Su interés principal es servir como punto de referencia para el estudio de la segmentación de uso del suelo en entornos urbanos del sur de Asia, y como base para comparar la influencia de diferentes técnicas de regularización (soft-clDice, reweighting de clases, muestreo balanceado) en la arquitectura SegFormer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (backbone `nvidia/segformer-b0-finetuned-ade-512-512`) |
| Parametros totales | no disponible (el backbone SegFormer-B0 tiene ~3,7 millones de parámetros, pero no se especifica el total del modelo completo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 512×512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión por satélite, no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño del repo: 0,3 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SegFormer, concretamente en la variante B0 preentrenada sobre ADE20K. El entrenamiento se realizó sobre imágenes del Valle de Katallaú con etiquetas de uso del suelo de seis clases, con un índice de ignoración de 255 para píxeles no etiquetados. El esquema de división de datos es por bloques (block split), una variante de validación cruzada que agrupa las imágenes por bloques espaciales para evitar la fuga de información entre entrenamiento y validación; este checkpoint corresponde al fold 1 de 3, con semilla 42.

La configuración incluye varias técnicas de entrenamiento: un muestreador balanceado para compensar el desequilibrio de clases, una función de pérdida soft-clDice con mu=0,3, y la ruta de detalle (`detail path`) activada. La ablación `no_csa` indica que no se aplicó el reweighting de clases CSA (con tau=[0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y w_min=0,25 como configuración de referencia, pero desactivado aquí). El mejor epoch se alcanzó en el 11.

## Capacidades

- Segmentación semántica de imágenes de teledetección con seis clases de uso del suelo: residencial, carretera, río, bosque, terreno no utilizado y agrícola.
- Procesamiento de imágenes de alta resolución (0,586 m/píxel) en cuadros de 512×512 píxeles.
- Inferencia sobre escenas de paisaje urbano y periurbano, con capacidad de distinguir zonas construidas de zonas naturales.
- Entrenamiento con técnicas de regularización (soft-clDice, muestreo balanceado) que mejoran la consistencia de los bordes y la robustez ante clases desequilibradas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multimodal: es un modelo puramente de visión para segmentación.

## Casos de uso

- Planificación urbana y ordenación territorial: el modelo puede generar mapas de uso de suelo actualizados a partir de imágenes aéreas o de satélite, ayudando a detectar expansión urbana no planificada en el Valle de Katla.
- Monitorización de cambios ambientales: mediante comparación de predicciones a lo largo del tiempo, es posible cuantificar la pérdida de bosque o el crecimiento de zonas residenciales en áreas periurbanas.
- Gestión de infraestructuras: la clase "carretera" permite extraer redes viarias para planificación de mantenimiento o rutas de evacuación, aunque su baja IoU (0,2234) indica que requiere post-procesado o datos auxiliares.
- Análisis de riesgo de inundación: la clase "río" (IoU 0,0998) puede servir para detectar cauces y zonas de inundación potencial, aunque su rendimiento es limitado y se recomienda combinar con otros datos hidrológicos.
- Agricultura de precisión: la clase "agrícola" (IoU 0,4646) permite identificar parcelas de cultivo y monitorear la expansión de tierras de cultivo, útil para estudios de seguridad alimentaria.
- Investigación metodológica: como checkpoint de una serie de ablaciones, permite comparar el efecto de la ruta de detalle y del reweighting CSA en el rendimiento de segmentación, sirviendo como referencia para el desarrollo de modelos más robustos.

## Benchmarks y rendimiento

Los resultados de validación del fold 1 se presentan a continuación. No se han publicado resultados de benchmarks en la información disponible, por lo que estos datos provienen directamente de la model card del autor.

| Metrica | Valor |
|---|---|
| mIoU | 0,3979 |
| mF1 | 0,5265 |
| Exactitud global (OA) | 0,7467 |
| Kappa | 0,5654 |

Rendimiento por clase (IoU, precisión del usuario y precisión del productor):

| Clase | IoU | UA (precision) | PA (recall) |
|---|---|---|---|
| Residencial | 0,7960 | 0,9383 | 0,8399 |
| Carretera | 0,2234 | 0,2446 | 0,7205 |
| Río | 0,0998 | 0,1073 | 0,5877 |
| Bosque | 0,5955 | 0,9631 | 0,6094 |
| Terreno no utilizado | 0,2083 | 0,4012 | 0,3023 |
| Agrícola | 0,4646 | 0,5717 | 0,7127 |

Los resultados muestran un buen rendimiento en residencial y bosque, pero una dificultad significativa en carretera, río y terreno no utilizado, probablemente debido al desequilibrio de clases y a la similitud espectral entre estas categorías.

## Requisitos de hardware

- Tamaño del repo: 0,3 GB, lo que sugiere pesos del modelo en formato de precisión estándar (FP32 o FP16) para un backbone SegFormer-B0, que es relativamente ligero.
- No se especifican los requisitos de VRAM exactos en la información disponible. Como referencia, SegFormer-B0 tiene alrededor de 3,7 millones de parámetros y puede ejecutarse en GPUs de consumidor como una RTX 3060 (12 GB) o incluso en CPU para inferencia, aunque la inferencia en GPU es recomendable para imágenes de 512×512.
- El despliegue puede realizarse con librerías de segmentación como `transformers` de Hugging Face (para cargar el checkpoint y hacer inferencia) o con frameworks específicos de visión como `mmsegmentation`.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8-12 GB de VRAM (p. ej., RTX 3080, RTX 4060 Ti o superior).
- No se dispone de datos de latencia ni throughput; el modelo es de baja complejidad, por lo que se espera una inferencia rápida incluso en hardware modesto.

## Comparativa con modelos similares

No se ha publicado una comparación con otros modelos en la información disponible. Sin embargo, se pueden mencionar alternativas de la misma familia:

| Modelo | Arquitectura | Contexto de entrada | Rendimiento (mIoU) | Licencia |
|---|---|---|---|---|
| GeoNUSAF TC-SegFormer (no_csa) | SegFormer-B0 | 512×512 | 0,3979 | no disponible |
| `geonusaf-tcsegformer-block-fold1-no_detail` (modelo hermano) | SegFormer-B0 | 512×512 | no disponible en esta ficha | no disponible |
| SegFormer-B0 (preentrenado en ADE-20K) | SegFormer-B0 | 512×512 | ~0,37 en ADE-20K (referencia general, no específica para uso de suelo) | Apache-2.0 (original) |

La comparación con el modelo hermano `no_detail` sería relevante para entender el impacto de la ruta de detalle, pero no se proporcionan sus métricas. Para aplicaciones de teledetección, se podrían considerar modelos como UNet, DeepLabV3+ o Swin Transformer, pero no hay datos de comparación directa en esta ficha.

## Limitaciones y advertencias

- Rendimiento débil en clases críticas: la carretera (IoU 0,2234) y el río (IoU 0,0998) tienen IoU muy baja, lo que limita su uso directo en aplicaciones de gestión de infraestructuras o riesgos naturales sin post-procesado adicional.
- Especificidad geográfica: el modelo se entrenó exclusivamente con imágenes del Valle de Katla, por lo que no se puede garantizar su generalización a otras regiones con diferentes tipos de suelo, vegetación o urbanismo.
- Desequilibrio de clases: aunque se usó un muestreador balanceado, las clases minoritarias (río, terreno no utilizado) siguen presentando una precisión muy baja, lo que indica que el modelo puede tener sesgo hacia las clases mayoritarias (residencial, bosque).
- Ablación experimental: es un checkpoint de investigación con la configuración `no_csa`; no se recomienda su uso directo en producción sin validar su rendimiento con el modelo completo (con CSA) o con el fold de validación correspondiente.
- Licencia no especificada: la ausencia de licencia implica que no se conoce si el modelo puede usarse comercialmente; se debe contactar con el autor antes de cualquier uso comercial.
- No hay datos sobre cuantización: no se proporcionan versiones cuantizadas (GGUF, ONNX, etc.), por lo que la inferencia se limita al formato original de la librería `transformers`.
- Posible riesgo de alucinación visual: en segmentación semántica, el modelo puede producir etiquetas espurias en regiones ambiguas, especialmente en clases con baja IoU como río o carretera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_csa
- Modelo hermano (ablación `no_detail`): https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_detail
- Repositorio de scripts relacionados (SarahGeoAI/SegFormer-Segmentation): https://github.com/SarahGeoAI/SegFormer-Segmentation
- Búsqueda de modelos con etiqueta `geonusaf`: https://huggingface.co/models?other=geonusaf

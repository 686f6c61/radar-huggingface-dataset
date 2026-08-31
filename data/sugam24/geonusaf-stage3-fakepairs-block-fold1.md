# sugam24/geonusaf-stage3-fakepairs-block-fold1

## Resumen

GeoNUSAF Stage 3 - synthetic image-mask pairs (block fold 1) es un conjunto de datos sintéticos de pares imagen-máscara para segmentación de uso de suelo en el Valle de Katmandú, desarrollado por sugam24 como parte del proyecto GeoNUSAF. El dataset se genera encadenando dos modelos de difusión: un generador de máscaras semánticas (Stage-1, DDPM) y un generador de imágenes condicionado por máscara (Stage-2, mask2image). El resultado son pares imagen-máscara de 512x512 píxeles a 1,374 m/px, con seis clases de uso de suelo, pensados como aumento de datos para entrenar modelos de segmentación de la Parte 1 del proyecto.

La relevancia actual radica en que aborda la escasez de datos etiquetados en teledetección: en lugar de depender únicamente de anotaciones manuales, se generan pares sintéticos que imitan la distribución de los datos reales de entrenamiento. El dataset incluye tres conjuntos (R1, R2 y R3) con 804, 1608 y 2412 pares respectivamente, todos derivados de 804 pares reales de entrenamiento del block fold 1. La calidad se evalúa mediante métricas de layout mIoU, KID, FID y ratios de memorización, que indican que los datos sintéticos son estadísticamente indistinguibles de los reales en términos de distancia a los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dataset sintético generado por difusión (Stage-1 mask DDPM + Stage-2 mask2image) |
| Parametros totales | no disponible (no es un modelo único, sino un dataset) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no aplica; datos en PNG (imagen BGR y máscara de un canal) |

## Arquitectura y entrenamiento

El dataset se produce mediante una cadena de dos modelos de difusión. El generador de máscaras es `sugam24/geonusaf-stage1-maskddpm-onehot-block-fold1` (epoch 1399), que produce máscaras semánticas one-hot mediante muestreo DDIM con 200 pasos, pool ratio 2.5 y post-procesamiento morfológico (modal3/close0/thin30/bulk0). El generador de imágenes es `Pranilllllll/geonusaf-stage2-mask2image-block-fold1-D` (step 7000), que condiciona la generación de imágenes RGB a partir de la máscara, usando DDIM con 30 pasos, guidance 3.5, cond scale 1.0 y detección de bordes Canny con umbral 0.4. La resolución es de 512x512 píxeles a 1,374 m/px.

Los datos reales de entrenamiento son 804 pares del block fold 1 (train_sha1 `eb0aebdd9919`). Se generan tres conjuntos independientes: R1 (804 pares), R2 (1608 pares) y R3 (2412 pares), cada uno con extracciones independientes. La calidad se valida con un scorer SegFormer-B0 (`Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold1`) que establece un techo de mIoU de 0,4646 sobre los datos reales. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Proporciona pares imagen-máscara sintéticos de 512x512 píxeles con seis clases semánticas: Residential, Road, River, Forest, UnusedLand y Agricultural.
- Las máscaras incluyen un valor 255 para píxeles de ignorar, compatible con frameworks de segmentación estándar.
- Los pares sintéticos mantienen una alta fidelidad de layout: el mIoU de layout alcanza 0,4395 en R1, un 94,6% del techo real.
- Las imágenes se generan con control de bordes (Canny) para preservar estructuras geométricas.
- Los ratios de memorización (feature/pixel/mask) están en torno a 1,0, lo que indica que los datos sintéticos no están más cerca de los datos de entrenamiento que un tile real nuevo.
- El dataset está diseñado exclusivamente para entrenamiento, evitando fugas de datos en evaluación.

## Casos de uso

- Aumento de datos para segmentación semántica en teledetección: los pares sintéticos pueden combinarse con los 804 pares reales para entrenar modelos como SegFormer, U-Net o DeepLabV3, mejorando la generalización en el Valle de Katmandú.
- Entrenamiento de modelos en dominios con pocas etiquetas: cuando no se dispone de suficientes anotaciones manuales, este dataset permite ampliar el conjunto de entrenamiento sin coste de anotación.
- Validación de técnicas de generación sintética: los tres conjuntos (R1, R2, R3) permiten estudiar el impacto del volumen de datos sintéticos en el rendimiento final del segmentador.
- Desarrollo de pipelines de aumento de datos para agricultura de precisión: las clases Agricultural y UnusedLand son relevantes para monitorización de cultivos y gestión de tierras.
- Investigación en aprendizaje con datos sintéticos: el dataset sirve como banco de pruebas para medir la brecha entre datos reales y sintéticos en segmentación remota.
- Entrenamiento de modelos de cambio de uso de suelo: al disponer de pares imagen-máscara con clases como River y Forest, se pueden entrenar modelos para detectar cambios temporales en el territorio.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad para cada conjunto:

| Conjunto | Layout mIoU | Ratio al techo | KID vs val | FID vs val | Memorización (feat / pixel / mask) |
|---|---|---|---|---|---|
| R1 | 0,4395 | 0,946 | 0,04698 ± 0,00925 | 128,7 | 0,99 / 0,89 / 1,39 |
| R2 | 0,4375 | 0,942 | 0,05243 ± 0,00936 | 132,2 | 1,00 / 0,90 / 1,34 |
| R3 | 0,4337 | 0,933 | 0,05179 ± 0,00994 | 133,0 | 1,01 / 0,90 / 1,42 |

El techo de mIoU del scorer sobre datos reales es 0,4646. Los ratios de memorización se interpretan como: un valor ≥ 1,0 indica que los datos sintéticos no están más cerca de los datos de entrenamiento que un tile real nuevo. No se han publicado comparaciones con otros datasets sintéticos en la información disponible.

## Requisitos de hardware

- El dataset ocupa 10,7 GB en el repositorio, por lo que se requiere almacenamiento suficiente para descargarlo y procesarlo.
- No se necesita GPU para utilizar el dataset directamente; solo se requiere memoria RAM para cargar las imágenes y máscaras en un pipeline de entrenamiento.
- Para regenerar datos sintéticos adicionales con los modelos de difusión subyacentes, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) para el muestreo DDIM a 512x512.
- El entrenamiento de modelos de segmentación con estos datos puede realizarse en GPUs de consumo medio (8-12 GB VRAM) dependiendo del tamaño del modelo y del batch.
- Opciones de despliegue: el dataset se consume directamente desde HuggingFace mediante `datasets` o descarga manual; no requiere servidores de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre datasets sintéticos comparables en la misma categoría (pares imagen-máscara generados por difusión para teledetección). La información proporcionada no incluye referencias a alternativas como datasets sintéticos de segmentación urbana o agrícola. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso restringido a entrenamiento: los pares sintéticos no deben incluirse en conjuntos de validación o test, ya que los generadores vieron los tiles de entrenamiento del block fold 1, lo que provocaría fugas de datos.
- Las imágenes se almacenan en formato BGR en disco (escritas con `cv2.imwrite`), por lo que deben leerse con `cv2.IMREAD_COLOR` para mantener el orden de canales correcto.
- Las máscaras contienen valores 0-5 para clases semánticas y 255 para píxeles de ignorar; es necesario configurar el `ignore_index` en el modelo de segmentación.
- La calidad de los datos sintéticos depende de los modelos de difusión subyacentes; si estos se actualizan, los pares generados pueden variar.
- El dataset está limitado geográficamente al Valle de Katmandú y a las seis clases definidas; no es directamente transferible a otras regiones o taxonomías sin reentrenamiento.
- No se han documentado sesgos específicos, pero al derivarse de datos reales de una sola región, puede haber sesgos geográficos y de distribución de clases.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero se debe verificar que los modelos generadores subyacentes tengan licencias compatibles.

## Enlaces

- Repositorio del dataset: https://huggingface.co/sugam24/geonusaf-stage3-fakepairs-block-fold1
- Generador de máscaras (Stage-1): https://huggingface.co/sugam24/geonusaf-stage1-maskddpm-onehot-block-fold1
- Generador de imágenes (Stage-2): https://huggingface.co/Pranilllllll/geonusaf-stage2-mask2image-block-fold1-D
- Scorer de referencia: https://huggingface.co/Pranilllllll/segformer-b0-kaggle-ktm-dataset-block-fold1
- Modelo de segmentación asociado: https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1
- Perfil de GitHub del autor: https://github.com/sugam24

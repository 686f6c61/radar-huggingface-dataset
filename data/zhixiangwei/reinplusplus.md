# zhixiangwei/ReinPlusPlus

## Resumen

Rein++ es un conjunto de checkpoints para segmentación semántica desarrollado por el autor zhixiangwei, asociado al artículo "Rein++: Efficient Generalization and Adaptation for Semantic Segmentation With Vision Foundation Models", publicado en IEEE TPAMI en 2026. El modelo aborda dos problemas clásicos de la segmentación semántica en producción: la generalización a dominios no vistos (domain generalization) y la adaptación eficiente a un dominio objetivo concreto (domain adaptation), aprovechando como columna vertebral los vision foundation models DINOv3 en sus variantes ViT-L y ViT-7B.

La propuesta técnica se apoya en adaptadores Rein sobre el backbone DINOv3 congelado, más una cabeza de segmentación entrenada para cada régimen experimental. El repositorio publica seis checkpoints: cinco modelos Rein-G (generalización) sobre DINOv3-L y DINOv3-7B, y un modelo Rein-A (adaptación) sobre DINOv3-L. Cada checkpoint incluye únicamente los parámetros del adaptador y la cabeza de segmentación; el backbone DINOv3 debe descargarse por separado desde el repositorio oficial de Meta y cargarse antes.

El interés actual del release es doble: por un lado, reproduce resultados de las Tablas II y VII del paper con métricas re-evaluadas que coinciden casi exactamente con las publicadas; por otro, emplea backbones de hasta 7B parámetros, lo que sitúa la segmentación semántica en la misma escala que los modelos fundacionales de visión contemporáneos. La licencia GPL-3.0 y la dependencia de pesos DINOv3 con sus propios términos condicionan su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores Rein sobre backbone ViT DINOv3 (ViT-L/16 y ViT-7B/16) con cabeza de segmentación semántica |
| Parametros totales | No disponible (los checkpoints publicados contienen solo adaptador y cabeza; el backbone DINOv3 se descarga aparte) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (etiquetas y documentación en inglés; el modelo opera sobre imágenes) |
| Licencia | GPL-3.0 para los checkpoints Rein++; pesos DINOv3 bajo los términos de acceso y licencia de Meta |
| Formato de pesos | PyTorch (`.pth`), acompañado de `config.py` y `manifest.json` por modelo |

## Arquitectura y entrenamiento

Rein++ sigue un esquema de adaptación eficiente sobre un vision foundation model congelado. El backbone es DINOv3 en configuración ViT-L/16 o ViT-7B/16, preentrenado con LVD-1689M (1.689 millones de imágenes). Sobre él se insertan los adaptadores Rein y una cabeza de segmentación que se entrenan para cada escenario. Los checkpoints liberados corresponden a la rama estudiante empleada en evaluación y contienen exclusivamente los parámetros del adaptador y de la cabeza; el backbone debe cargarse previamente con los ficheros oficiales de Meta (`dinov3_vitl16_pretrain_lvd1689m-8aa4cbdd.pth` o `dinov3_vit7b16_pretrain_lvd1689m-a955f4ea.pth`), cuyos SHA-256 están documentados en la model card.

Los experimentos cubren tres regímenes de generalización y uno de adaptación. En generalización: `usg2cbm` (UrbanSyn + SYNTHIA + GTAV → Cityscapes / BDD100K / Mapillary), `c2abm` (Cityscapes → ACDC / BDD100K / Mapillary) y `g2cbm` (GTAV → Cityscapes / BDD100K / Mapillary). En adaptación: `g2c` (GTAV → Cityscapes). Las evaluaciones se realizan sobre conjuntos de validación: Cityscapes (500 imágenes), BDD100K (1.000), Mapillary Vistas v1.2 (2.000) y ACDC (406 imágenes repartidas en noche, nieve, niebla y lluvia). El número exacto de tokens o imágenes de entrenamiento, la composición detallada del dataset y el uso de RLHF/DPO no se detallan en la información disponible, aunque por la naturaleza de la tarea no cabe esperar alineamiento por preferencias. El código de entrenamiento se anuncia para una release progresiva posterior.

## Capacidades

- Segmentación semántica densa con 19 clases de Cityscapes (road, sidewalk, building, wall, fence, pole, traffic light, traffic sign, vegetation, terrain, sky, person, rider, car, truck, bus, train, motorcycle, bicycle), ignorando la etiqueta 255.
- Generalización a dominios no vistos: los modelos Rein-G se entrenan en fuentes sintéticas o en Cityscapes y se evalúan en ACDC, BDD100K y Mapillary sin ajuste en el dominio objetivo.
- Adaptación a dominio: el modelo Rein-A (`rda_g2c_dinov3_rein_ta`) realiza adaptación de GTAV a Cityscapes.
- Dos escalas de backbone: DINOv3-L y DINOv3-7B, lo que permite intercambiar precisión por coste computacional.
- Etiquetado con IDs de entrenamiento de Cityscapes y mapeo de etiquetas de Mapillary a las 19 clases del experimento.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de segmentación.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Conducción autónoma en condiciones adversas: el checkpoint `c2abm` con DINOv3-7B alcanza 77,54 de mIoU medio en ACDC (noche, nieve, niebla, lluvia), lo que lo hace adecuado para percepción robusta en vehículos que operan en climas variados sin reentrenamiento específico.
- Anotación automática de datasets urbanos: los modelos `usg2cbm` y `g2cbm` permiten generar máscaras de 19 clases sobre Cityscapes, BDD100K y Mapillary a partir de datos sintéticos, reduciendo el coste de etiquetado manual en pipelines de datos.
- Preetiquetado para fine-tuning supervisado: usar las predicciones del modelo Rein-G como inicialización de anotaciones y corregirlas manualmente, aprovechando su mIoU de 74,78–75,91 en el conjunto combinado.
- Adaptación rápida a una ciudad o sensor nuevo: el modelo Rein-A (`g2c`) sirve como punto de partida para adaptar un segmentador entrenado en GTAV a las particularidades de una nueva ciudad con un coste de ajuste reducido.
- Evaluación comparativa de backbones: al ofrecer la misma receta Rein sobre DINOv3-L y DINOv3-7B, permite medir empíricamente la ganancia de escala (por ejemplo, 74,78 frente a 75,91 en `usg2cbm`) para decidir el compromiso precisión/coste.
- Investigación en domain generalization: los seis checkpoints reproducen las Tablas II y VII del paper con métricas re-evaluadas, lo que facilita la comparación reproducible frente a otros métodos de generalización.
- Segmentación en mapas y cartografía: el modelo `usg2cbm` con DINOv3-7B obtiene 80,02 de mIoU en Cityscapes y 66,32 en BDD100K, útil para extraer capas de vialidad, vegetación y mobiliario urbano en imágenes de street-level.

## Benchmarks y rendimiento

Resultados en mIoU (%) sobre conjuntos de validación, según la model card. Las columnas "Paper" y "Re-evaluado" muestran los valores publicados y los medidos con el release.

| Modelo | Método / backbone | Tabla | Paper (mIoU) | Re-evaluado (mIoU) |
|---|---|---|---|---|
| `rdg_usg2cbm_dinov3_rein` | Rein-G / DINOv3-L | II | 78,9 / 63,4 / 74,8 | 78,91 / 63,44 / 74,78 |
| `rdg_usg2cbm_dinov3-7b_rein` | Rein-G / DINOv3-7B | II | 80,0 / 66,3 / 75,9 | 80,02 / 66,32 / 75,91 |
| `rdg_c2abm_dinov3_rein` | Rein-G / DINOv3-L | II | 72,5 / 65,0 / 77,4 | 72,52 / 65,04 / 77,41 |
| `rdg_c2abm_dinov3-7b_rein` | Rein-G / DINOv3-7B | II | 75,9 / 68,0 / 77,5 | 75,92 / 67,97 / 77,54 |
| `rdg_g2cbm_dinov3-7b_rein` | Rein-G / DINOv3-7B | II | 73,9 / 65,5 / 72,6 | 73,89 / 65,49 / 72,58 |
| `rda_g2c_dinov3_rein_ta` | Rein-A / DINOv3-L | VII | 79,0 | 79,03 |

El orden de métricas para los modelos `usg2cbm`, `c2abm` y `g2cbm` es Cityscapes / BDD100K / Mapillary. En `g2c`, la métrica única corresponde a Cityscapes. El valor de ACDC se calcula como media aritmética de noche, nieve, niebla y lluvia. No se han publicado en la información disponible resultados de benchmarks genéricos tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia, un backbone ViT-7B en precisión FP16 requiere del orden de 14 GB solo para pesos, a lo que se suman activaciones y la cabeza de segmentación; el ViT-L es sustancialmente más ligero.
- GPU recomendadas: A100 o H100 de 40/80 GB para los checkpoints DINOv3-7B; A100 40 GB, L40S o RTX 4090 (24 GB) para los checkpoints DINOv3-L en FP16.
- Cabe en GPU de consumo: los modelos DINOv3-L previsiblemente sí en RTX 4090 o RTX 3090 con precisión reducida; los DINOv3-7B exigen GPUs de 40 GB o más, salvo cuantización no documentada.
- Opciones de despliegue: el código de inferencia y evaluación es específico del proyecto (`tools/infer.py` y `tools/test.py` del subproyecto `projects/rein++`), sobre Linux, Python 3.10, PyTorch 2.1.0 con CUDA 11.8, MMCV 2.1.0, MMEngine 0.10.7, MMSegmentation 1.2.2 y MMDetection 3.3.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone | Contexto / resolución | Rendimiento | Licencia |
|---|---|---|---|---|---|
| Rein++ (este release) | Segmentación semántica con adaptadores | DINOv3-L / DINOv3-7B | No disponible | Hasta 80,02 mIoU en Cityscapes val (DINOv3-7B, `usg2cbm`) | GPL-3.0 (checkpoints) + términos DINOv3 |
| Segment Anything (SAM) | Segmentación promptable | ViT-H y variantes | Resolución variable | No comparable directamente (métrica distinta) | Apache 2.0 |
| Mask2Former | Segmentación universal | Swin / ViT-Adapter | Resolución variable | No disponible en esta información | MIT / CC BY-NC según variante |
| SegFormer | Segmentación semántica | MiT (B0–B5) | Resolución variable | No disponible en esta información | Apache 2.0 |

La comparación con SAM, Mask2Former o SegFormer no puede establecerse con cifras en esta ficha porque la información proporcionada no incluye sus resultados en los mismos conjuntos de validación. Rein++ se diferencia por su enfoque en generalización y adaptación de dominio con backbones de escala 7B y por una licencia GPL-3.0 que condiciona la distribución de derivados.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier obra derivada distribuida debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- Dependencia de los pesos DINOv3: el backbone se descarga por separado bajo los términos de acceso y licencia de Meta, que pueden imponer restricciones adicionales al uso comercial.
- Solo se publican adaptadores y cabezas: sin el backbone correcto (versión y SHA-256 exactos) los checkpoints no son utilizables.
- Cobertura limitada: únicamente cinco modelos Rein-G y un modelo Rein-A; el modelo DINOv3-L solo-GTAV de la Tabla II queda pendiente de una release posterior.
- Código de entrenamiento no liberado en esta primera entrega, lo que impide reproducir el pipeline completo de entrenamiento.
- Evaluación exclusivamente sobre validación: los resultados de ACDC no proceden del servidor de test oficial, por lo que no son directamente comparables con cifras publicadas en test.
- Etiquetas restringidas a 19 clases de Cityscapes con mapeo específico para Mapillary; no cubre taxonomías más amplias ni clases fuera de ese conjunto.
- Riesgo de sesgo geográfico y de sensor: el entrenamiento se apoya en datasets sintéticos (GTAV, SYNTHIA, UrbanSyn) y en Cityscapes, lo que puede degradar el rendimiento en ciudades, cámaras o condiciones no representadas.
- Riesgo de alucinación en el sentido de predicciones erróneas en regiones ambiguas u ocluidas, habitual en segmentación densa; se recomienda validación por clase antes de uso en producción.
- Idiomas: la documentación está en inglés y el modelo no procesa texto; no hay soporte multilingüe que evaluar.
- Sin datos publicados de latencia, throughput ni VRAM exacta, lo que dificulta el dimensionamiento de despliegues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhixiangwei/ReinPlusPlus
- Paper (DOI, IEEE TPAMI 2026): https://doi.org/10.1109/TPAMI.2026.3681631
- Referencia arXiv: https://arxiv.org/abs/2508.01667
- Código de inferencia y evaluación: https://github.com/w1oves/Rein/tree/train/projects/rein%2B%2B
- Informe de validación: https://huggingface.co/zhixiangwei/ReinPlusPlus/blob/main/VALIDATION.md
- Pesos DINOv3 (Meta): https://github.com/facebookresearch/dinov3#pretrained-models

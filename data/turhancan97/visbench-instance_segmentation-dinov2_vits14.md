# turhancan97/visbench-instance_segmentation-dinov2_vits14

## Resumen

`visbench-instance_segmentation-dinov2_vits14` no es un modelo fundacional, sino una cabeza de sondeo (*probe head*) entrenada sobre las características congeladas de DINOv2 ViT-S/14. La publica el usuario turhancan97 dentro del proyecto VisBench, un marco de evaluación cuyo objetivo es medir qué información semántica contienen realmente los embeddings de un backbone visual congelado. En lugar de ajustar el backbone, VisBench entrena módulos ligeros sobre sus representaciones y reporta métricas de tareas concretas.

La tarea que cubre esta sonda es segmentación de instancias de alto nivel (`instance_segmentation`, categoría `high_level`), evaluada sobre 20 clases con predicciones de cajas y máscaras. El backbone subyacente es DINOv2 ViT-S/14 a resolución 224, con pooling medio y `feature_mode=dense_only`, es decir, sin agregación global de características.

Su relevancia es metodológica más que de producto: permite reproducir y auditar la calidad de las representaciones de DINOv2 en una tarea densa de percepción, y sirve como referencia para comparar otros backbones bajo el mismo protocolo de sondeo. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y ocupa 0.0 GB, lo que sugiere un artefacto pequeño de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de sondeo (probe head) sobre backbone transformer ViT-S/14 congelado (DINOv2) |
| Parametros totales | No disponible (el backbone DINOv2 ViT-S/14 tiene ~22 M; la cabeza no reporta recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (carga mediante `visbench.hub.load_probe_from_hub`) |

## Arquitectura y entrenamiento

La sonda se ajusta sobre características densas de DINOv2 ViT-S/14 obtenidas con `pooling=mean` y `feature_mode=dense_only`. La clave de backbone registrada es `dinov2/dinov2_vits14/224/7764ea0f912e`, y el cargador rechaza cualquier otro backbone porque una cabeza entrenada con un pooling distinto produce formas compatibles pero resultados numéricamente incorrectos de forma silenciosa. La cabeza es de tipo `instance`, sin dimensión oculta (`hidden_dim=0`) y con `mask_hidden_dim=0`, con máscaras agnósticas de clase (`mask_classes=agnostic`) y tamaño de máscara 14.

El entrenamiento se realizó durante 10 épocas con AdamW, `lr=5e-4`, `weight_decay=1e-4`, batch de 8, calentamiento de 1.5 épocas y pérdida focal con `alpha=0.25` y `gamma=2.0`. Se combinan pérdidas de caja (`box_weight=2.0`) y de máscara (`mask_weight=1.0`), con entrenamiento de máscara sobre cajas ground-truth (`mask_train_boxes=ground_truth`). El protocolo es `visbench_anchor_free_instance`, con umbral de puntuación 0.05, NMS con IoU 0.5, hasta 100 detecciones por imagen y umbrales de IoU de 0.5 a 0.95 en pasos de 0.05. No se reporta número de tokens de entrenamiento ni composición del dataset.

## Capacidades

- Segmentación de instancias sobre imágenes de 224x224 con 20 clases evaluadas.
- Predicción de cajas delimitadoras y máscaras de instancia por imagen.
- Extracción de características densas vía backbone DINOv2 ViT-S/14 congelado.
- Sondeo de representaciones para auditoría de calidad de embeddings visuales.
- Integración con el ecosistema VisBench mediante `load_probe_from_hub`.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso.
- No es un modelo generativo ni multilingüe: su ámbito es exclusivamente visión por computador.

## Casos de uso

- Evaluación de backbones visuales: se usa para medir cuánta información de instancias contienen las características de DINOv2 ViT-S/14 y compararla con otros backbones bajo el mismo protocolo de sondeo.
- Reproducción de experimentos: permite replicar exactamente las métricas reportadas (`box_map_50=0.2858`, `mask_map_50=0.2687`) con los hiperparámetros documentados.
- Baseline en pipelines de segmentación: sirve como referencia ligera antes de invertir en un modelo especializado como Mask R-CNN o Mask2Former.
- Docencia e investigación en representaciones visuales: ilustra cómo una cabeza ligera sobre features congeladas puede resolver una tarea densa sin reentrenar el backbone.
- Validación de protocolos de sondeo: útil para detectar errores de configuración (pooling o feature mode) gracias al rechazo explícito de backbones incompatibles.
- Prototipado rápido de detección y segmentación: al no requerir ajuste del backbone, el coste de cómputo para experimentar es bajo.
- Auditoría de sesgos en percepción: las métricas por clase permiten analizar el rendimiento en las 20 clases evaluadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `box_map_50` | 0.2858 |
| `mask_map_50` | 0.2687 |
| `mask_map_50_95` | 0.0996 |
| `classes_scored` | 20.0000 |
| `detections_per_image` | 73.6970 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el backbone ViT-S/14 es pequeño (~22 M de parámetros) y la cabeza es aún menor, por lo que la inferencia debería caber holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para ViT-S/14 a 224x224; A100 o H100 no son necesarias.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la librería `visbench` con `load_probe_from_hub`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Tarea | Licencia |
|---|---|---|---|---|---|
| Este modelo | Probe head sobre DINOv2 ViT-S/14 | No disponible | 224x224 | Segmentación de instancias (sondeo) | No disponible |
| DINOv2 ViT-S/14 | Backbone ViT | ~22 M | 224x224 | Features visuales generales | Apache 2.0 (según el proyecto DINOv2) |
| Mask R-CNN (ResNet-50) | Detector/segmentador supervisado | ~44 M | Variable | Segmentación de instancias | BSD/MIT según implementación |
| Mask2Former | Segmentador universal | ~47 M (Swin-T) | Variable | Segmentación de instancias/semántica | MIT según implementación |

La comparación directa no es homogénea: este artefacto es una sonda de evaluación, no un modelo de producción, por lo que sus métricas no son directamente equiparables a las de detectores entrenados de extremo a extremo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el backbone `dinov2_vits14` exacto y rechaza cualquier otro, incluido el mismo backbone con otro pooling o feature mode.
- Rendimiento modesto: `mask_map_50_95=0.0996` indica baja precisión en máscaras con umbrales estrictos de IoU.
- Número elevado de detecciones por imagen (73.7 de media), lo que sugiere muchas predicciones de baja confianza.
- Solo evalúa 20 clases; no se documenta la taxonomía ni el dataset de evaluación.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- No disponible información sobre sesgos, alucinación (no aplica en el sentido generativo) ni robustez ante dominios distintos al de entrenamiento.
- No apto para producción como segmentador: su propósito es la evaluación de representaciones.
- Sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-instance_segmentation-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
- DINOv2 (backbone subyacente): no se proporciona enlace en la información disponible.

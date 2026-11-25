# turhancan97/visbench-instance_segmentation-dinov2_vitb14

## Resumen

`visbench-instance_segmentation-dinov2_vitb14` no es un modelo generativo ni un backbone de visión, sino una cabeza de sondeo (probe head) entrenada por el usuario turhancan97 dentro del marco VisBench. Su función es medir qué información contienen las representaciones congeladas del backbone DINOv2 ViT-B/14 para la tarea de segmentación de instancias, siguiendo el protocolo `visbench_anchor_free_instance`. El repositorio tiene 0 GB y no contiene pesos del backbone, solo el módulo pequeño que se ajusta sobre las features extraídas con `pooling=mean` y `feature_mode=dense_only`.

El interés de esta ficha es acotado: se trata de un artefacto de evaluación reproducible, no de un modelo desplegable en producción. Permite a investigadores reproducir el número reportado de segmentación de instancias sobre DINOv2 ViT-B/14 y compararlo con otras cabezas o backbones dentro de VisBench. La model card insiste en que cargar los pesos contra otro backbone, otro pooling u otro modo de features es rechazado explícitamente, porque el fallo sería silencioso: la cabeza tendría las formas correctas y produciría un número plausible pero erróneo.

La relevancia actual es metodológica: facilita la comparación controlada de representaciones visuales congeladas. No hay información sobre arquitectura del backbone más allá de su identificador, ni sobre licencia, idiomas o formato de pesos en los metadatos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de sondeo (probe head) de instancia sobre backbone DINOv2 ViT-B/14 congelado; protocolo `visbench_anchor_free_instance` |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; solo se indica `hidden_dim=0` y `mask_hidden_dim=0` para la cabeza) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; `image_size=224`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería `visbench`, carga vía `load_probe_from_hub`) |

## Arquitectura y entrenamiento

La cabeza se ajusta sobre features densas de DINOv2 ViT-B/14 a resolución 224, con pooling medio y modo `dense_only`, sin selección de capas (`layers=None`). El protocolo es `visbench_anchor_free_instance`, con `head=instance`, `hidden_dim=0` y `mask_hidden_dim=0`, lo que sugiere una cabeza lineal o de complejidad mínima sobre las features del backbone. La segmentación de máscaras se realiza a `mask_size=14`, con `mask_classes=agnostic` y entrenamiento de máscaras sobre cajas ground-truth (`mask_train_boxes=ground_truth`).

El entrenamiento usó 10 épocas con AdamW, `lr=0.0005`, `weight_decay=0.0001`, `batch_size=8` y 1.5 épocas de warmup. La función de pérdida combina una componente focal (`focal_alpha=0.25`, `focal_gamma=2.0`) con pesos `box_weight=2.0` y `mask_weight=1.0`. En inferencia se aplican `score_threshold=0.05`, NMS con `nms_iou=0.5`, `max_detections=100` y umbrales de IoU de 0.5 a 0.95 en pasos de 0.05. No se documenta el volumen de datos de entrenamiento ni la composición del dataset.

## Capacidades

- Segmentación de instancias sobre features congeladas de DINOv2 ViT-B/14, con predicción de cajas y máscaras.
- Evaluación de representaciones: mide la información de instancias presente en las features del backbone bajo un protocolo fijo.
- Reproducibilidad: la model card detalla todos los hiperparámetros necesarios para replicar el ajuste.
- Verificación de compatibilidad: rechaza la carga contra backbones, poolings o modos de features distintos.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Evaluación de backbones visuales: comparar DINOv2 ViT-B/14 con otros backbones dentro de VisBench usando esta cabeza como sonda estandarizada para segmentación de instancias.
- Reproducción de resultados académicos: replicar los valores reportados (`box_map_50=0.3060`, `mask_map_50=0.2847`, `mask_map_50_95=0.1080`) con los hiperparámetros documentados.
- Análisis de pooling y modo de features: estudiar cómo afecta `pooling=mean` y `dense_only` al rendimiento en instancias, entrenando cabezas equivalentes con otras configuraciones.
- Auditoría de artefactos de investigación: verificar que un pipeline de evaluación carga el probe correcto y detecta desajustes de backbone antes de producir métricas.
- Docencia y formación: ilustrar el concepto de probing lineal sobre representaciones congeladas con un caso real y reproducible.
- Integración en pipelines de VisBench: usar `load_probe_from_hub` para incorporar la sonda en flujos automatizados de benchmarking de representaciones visuales.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `box_map_50` | 0.3060 |
| `mask_map_50` | 0.2847 |
| `mask_map_50_95` | 0.1080 |
| `classes_scored` | 20.0000 |
| `detections_per_image` | 83.8592 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para la cabeza; depende del backbone DINOv2 ViT-B/14 (~86 M de parámetros) y del tamaño de lote.
- GPU recomendadas: no disponible; el backbone ViT-B/14 a 224 px es ligero y cabe en GPUs de consumo, pero no se documentan requisitos oficiales.
- Cabe en GPU de consumo: probablemente sí con el backbone ViT-B/14, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga vía `visbench.hub.load_probe_from_hub` con `visbench.get_backbone("dinov2_vitb14")`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otras cabezas de sondeo o backbones comparables dentro de VisBench ni fuera de él.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vitb14` (clave `dinov2/dinov2_vitb14/224/7764ea0f912e`), con `pooling=mean` y `feature_mode=dense_only`; cualquier otra combinación se rechaza.
- No es un modelo autónomo: requiere el backbone y la librería VisBench para funcionar.
- No sirve para generación de texto, código, matemáticas ni tareas de lenguaje.
- Licencia no especificada: no se puede asumir uso comercial sin confirmación del autor.
- Sin información sobre sesgos, alucinación o robustez fuera del dominio de evaluación.
- Los resultados reportados corresponden a 20 clases y un protocolo concreto; no son extrapolables a otros datasets o configuraciones.
- El repositorio tiene 0 GB y 0 descargas: artefacto de investigación sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-instance_segmentation-dinov2_vitb14
- Repositorio VisBench: https://github.com/turhancan97/VisBench

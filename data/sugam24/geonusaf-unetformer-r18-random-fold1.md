# sugam24/geonusaf-unetformer-r18-random-fold1

## Resumen

GeoNUSAF - UNetFormer (ResNet-18) es un modelo de segmentación semántica para teledetección, desarrollado por el usuario sugam24, que clasifica usos del suelo en el valle de Katmandú (Nepal) en seis categorías: Residential, Road, River, Forest, UnusedLand y Agricultural. El modelo emplea una arquitectura UNetFormer con encoder ResNet-18 preentrenado en ImageNet y un decoder con atención global-local, y ha sido entrenado sobre imágenes de 512x512 píxeles con una resolución efectiva de 0.586 m/px. Está publicado como checkpoint de PyTorch (0.7 GB) y corresponde al primer fold de una validación cruzada con split aleatorio (semilla 42).

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana, la gestión de recursos naturales y el monitoreo ambiental, ya que permite obtener mapas de cobertura del suelo de forma automatizada a partir de imágenes de satélite. Aunque el conjunto de entrenamiento está limitado al valle de Katmandú, la arquitectura y el enfoque de entrenamiento son transferibles a otras regiones con datos similares. No se especifica la licencia ni se proporcionan detalles sobre el dataset original, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer con encoder ResNet-18 (timm, ImageNet) y decoder global-local attention |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible (la implementacion de referencia es GPL-3.0, pero no se indica la licencia de este modelo) |
| Formato de pesos | PyTorch (checkpoint `best.pt` con `model_state`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer propuesta por Wang et al. (2022) en ISPRS J. Photogramm. Remote Sens. 190:196-214, aunque se trata de una implementación independiente. El encoder es un ResNet-18 de timm preentrenado en ImageNet, que extrae características multiescala. El decoder combina atención global y local para refinar los mapas de segmentación, lo que permite capturar tanto dependencias de largo alcance como detalles finos. Se incluye una cabeza auxiliar con peso 0.4 en la pérdida total.

El entrenamiento se realizó con un split aleatorio (fold 1 de 3, semilla 42) sobre un dataset de imágenes del valle de Katmandú. Las imágenes se normalizan con estadísticas de ImageNet y se recortan a 512x512 píxeles. Se usó AdamW con weight decay 0.0001, learning rate de 0.0006 para el decoder y 6e-05 para el encoder, y la mejor época fue la 12. La función de pérdida no se especifica, pero es habitual en segmentación (cross-entropy o similar). No se menciona el uso de RLHF ni DPO (no aplica a visión).

## Capacidades

- Segmentación semántica de imágenes de teledetección con 6 clases de uso del suelo: Residential, Road, River, Forest, UnusedLand y Agricultural.
- Clasificación píxel a píxel con resolución efectiva de 0.586 m/px, adecuada para imágenes de satélite de alta resolución.
- Manejo de regiones no etiquetadas mediante `ignore_index=255`.
- Inferencia sobre imágenes de 512x512 píxeles con normalización ImageNet.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Planificación urbana**: el modelo puede generar mapas de expansión residencial a partir de imágenes satelitales, ayudando a identificar zonas de crecimiento no planificado y a evaluar la densidad urbana en el valle de Katmandú.
- **Gestión de infraestructuras viarias**: la clase Road permite cartografiar la red de carreteras, útil para planificación de transporte y análisis de accesibilidad en zonas de difícil acceso.
- **Monitoreo de recursos hídricos**: la clase River facilita la delimitación de cauces y la detección de cambios en la superficie fluvial, relevante para gestión de inundaciones y conservación de ecosistemas.
- **Conservación forestal**: la segmentación de Forest permite cuantificar la cobertura arbórea y detectar deforestación o degradación en áreas protegidas.
- **Agricultura de precisión**: la clase Agricultural ayuda a identificar parcelas cultivadas y a estimar la superficie agrícola, útil para políticas de seguridad alimentaria y seguimiento de cultivos.
- **Gestión de suelo no utilizado**: la clase UnusedLand permite detectar terrenos baldíos o degradados, información clave para proyectos de reforestación o reurbanización.

## Benchmarks y rendimiento

Los resultados de validación del fold 1 (split aleatorio) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0.4754 |
| mF1 | 0.6234 |
| OA (Overall Accuracy) | 0.7652 |
| Kappa | 0.6261 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0.8157 | 0.8985 |
| Road | 0.3343 | 0.5011 |
| River | 0.3600 | 0.5294 |
| Forest | 0.6167 | 0.7629 |
| UnusedLand | 0.2613 | 0.4144 |
| Agricultural | 0.4643 | 0.6342 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El rendimiento es notablemente inferior en clases minoritarias como Road y UnusedLand, lo que sugiere un desbalance en el dataset.

## Requisitos de hardware

- El checkpoint ocupa 0.7 GB, por lo que el modelo es relativamente ligero y puede ejecutarse en GPUs de consumo medio.
- Estimación orientativa: un ResNet-18 con decoder UNetFormer suele tener entre 15 y 30 millones de parámetros, requiriendo aproximadamente 2-4 GB de VRAM en FP32 para inferencia con batch size 1. Con cuantización (por ejemplo, FP16 o INT8) podría caber en GPUs con 2 GB o menos.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4060, o superiores; también puede ejecutarse en CPU para inferencia a baja velocidad.
- Opciones de despliegue: al ser un checkpoint de PyTorch, puede servirse con TorchServe, ONNX Runtime o exportarse a TensorRT. No se han proporcionado archivos GGUF ni integración con vLLM u Ollama.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (segmentación semántica de teledetección con UNetFormer y ResNet-18). Se recomienda consultar la literatura de referencia (Wang et al., 2022) para comparaciones con otras arquitecturas como U-Net, DeepLabV3+ o SegFormer.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con imágenes del valle de Katmandú; su rendimiento en otras regiones geográficas o con diferentes sensores puede degradarse significativamente.
- Las clases Road y UnusedLand presentan IoU bajos (0.3343 y 0.2613 respectivamente), lo que indica dificultad para segmentar estas categorías, probablemente por desbalance o ambigüedad espectral.
- La validación usa un split aleatorio, no espacial, por lo que las métricas pueden sobreestimar la capacidad de generalización a nuevas áreas geográficas.
- No se especifica la licencia del modelo ni del dataset, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se proporciona información sobre el preprocesamiento exacto de las imágenes de entrada (por ejemplo, bandas, sensor, proyección), lo que dificulta la reproducción en otros entornos.
- Al ser un modelo de visión, no es aplicable a tareas de lenguaje natural ni a razonamiento simbólico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold1
- Referencia de arquitectura: Wang et al. (2022), "UNetFormer: A UNet-like transformer for efficient semantic segmentation of remote sensing urban scene imagery", ISPRS J. Photogramm. Remote Sens. 190:196-214 (el repositorio de referencia es GPL-3.0, pero no se proporciona enlace directo).

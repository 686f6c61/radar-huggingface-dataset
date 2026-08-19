# sugam24/geonusaf-unetformer-r18-random-fold2

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección urbana, desarrollado por sugam24, que aplica la arquitectura UNetFormer sobre un encoder ResNet-18 para clasificar el uso del suelo en el valle de Katmandú (Nepal). El modelo distingue seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola, con una resolución efectiva de 0,586 m/píxel. Este checkpoint corresponde al segundo pliegue de una validación cruzada aleatoria de tres pliegues, con semilla 42.

La relevancia de este modelo radica en su aplicación práctica para planificación urbana, gestión de riesgos y monitorización ambiental en regiones con cartografía limitada. Al estar basado en UNetFormer, combina un encoder convolucional ligero con un decoder basado en transformadores que modela atención global-local, logrando un equilibrio entre eficiencia y precisión. El repositorio incluye el checkpoint `best.pt` con el estado del modelo, la configuración y las métricas de validación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm con pesos ImageNet, decoder con atención global-local) |
| Parametros totales | no disponible (encoder ResNet-18 ≈ 11,7 M; total con decoder no publicado) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de visión, entrada 512×512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `best.pt` (contiene `model_state`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura UNetFormer descrita por Wang et al. (2022) en ISPRS Journal of Photogrammetry and Remote Sensing. El encoder es un ResNet-18 preentrenado en ImageNet, extraído de la librería timm, que produce características multiescala. El decoder, basado en transformadores, emplea un mecanismo de atención global-local para combinar información contextual de largo alcance con detalles locales de alta resolución, lo que resulta especialmente adecuado para escenas urbanas heterogéneas en imágenes satelitales.

El entrenamiento se realizó con una entrada de 512×512 píxeles normalizada con medias y desviaciones de ImageNet, y una resolución efectiva de 0,586 m/píxel. Se utilizó el optimizador AdamW con peso de decaimiento 0,0001 y tasas de aprendizaje diferenciadas: 0,0006 para el decoder y 6e-05 para el encoder. Se empleó una cabeza auxiliar con peso 0,4 en la función de pérdida. El mejor epoch fue el 98, con métricas de validación de mIoU 0,5259, mF1 0,6726, precisión global 0,7830 y kappa 0,6558. La división de datos fue aleatoria en tres pliegues, siendo este el segundo, y se utilizó `ignore_index=255` para píxeles no etiquetados.

## Capacidades

- Segmentación semántica de uso del suelo en imágenes de teledetección con seis clases: residencial, carretera, río, bosque, suelo sin uso y agrícola.
- Procesamiento de imágenes de 512×512 píxeles con normalización ImageNet y resolución efectiva de 0,586 m/píxel.
- Detección de estructuras urbanas y elementos lineales como carreteras y ríos mediante atención global-local.
- Inferencia sobre imágenes aéreas o satelitales de alta resolución en regiones con características similares al valle de Katmandú.
- Capacidad de transferencia limitada a otros dominios geográficos, dado que el entrenamiento se realizó sobre un conjunto de datos específico.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal más allá de imágenes.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas de cobertura del suelo actualizados para apoyar decisiones de zonificación y expansión urbana en ciudades con cartografía desactualizada, gracias a su capacidad para distinguir áreas residenciales, carreteras y suelo sin uso.
- Gestión de riesgos naturales: la clasificación de ríos y zonas agrícolas permite identificar áreas vulnerables a inundaciones o deslizamientos en el valle de Katmandú, integrando las predicciones en sistemas de alerta temprana.
- Monitorización ambiental: el seguimiento temporal de cambios en bosque y suelo agrícola ayuda a cuantificar deforestación o pérdida de tierras de cultivo, utilizando el modelo sobre series temporales de imágenes satelitales.
- Catastro y registro de propiedades: las máscaras de segmentación de áreas residenciales pueden servir como capa base para actualizar registros catastrales en zonas de crecimiento informal.
- Infraestructura vial: la detección de carreteras con IoU de 0,4114 permite extraer redes viales para actualizar mapas de navegación o planificar mantenimiento, aunque con precisión moderada.
- Investigación académica: el modelo sirve como punto de partida para experimentos de fine-tuning en otras regiones o con otras bandas espectrales, gracias a su arquitectura ligera y a la disponibilidad del checkpoint y configuración.

## Benchmarks y rendimiento

Los resultados de validación del modelo (pliegue 2 de la división aleatoria) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5259 |
| mF1 | 0,6726 |
| Precisión global (OA) | 0,7830 |
| Kappa | 0,6558 |

Desglose por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0,8150 | 0,8980 |
| Carretera | 0,4114 | 0,5829 |
| Río | 0,4927 | 0,6601 |
| Bosque | 0,6710 | 0,8031 |
| Suelo sin uso | 0,2818 | 0,4397 |
| Agrícola | 0,4834 | 0,6517 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor indica que la arquitectura es una implementación independiente del trabajo de Wang et al. (2022), cuyo repositorio de referencia es GPL-3.0.

## Requisitos de hardware

- El modelo es ligero: el encoder ResNet-18 tiene aproximadamente 11,7 millones de parámetros, por lo que la inferencia es viable en GPUs de consumo medio.
- VRAM estimada para inferencia con batch 1 y entrada 512×512: aproximadamente 1-2 GB en FP32, dependiendo del tamaño del decoder (no especificado).
- GPUs recomendadas: NVIDIA GTX 1060 6 GB o superior, RTX 3060, RTX 4090; también puede ejecutarse en CPU con tiempos mayores.
- El checkpoint `best.pt` es un archivo PyTorch nativo; se puede cargar con `torch.load` y requiere las dependencias de timm para el encoder.
- Opciones de despliegue: inferencia directa en Python con PyTorch, exportación a ONNX o TorchScript para servir con TensorRT o similares. No se mencionan integraciones con vLLM, Ollama o TGI, que son específicas de modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de segmentación semántica en el mismo conjunto de datos (p. ej., UNet, DeepLabV3, SegFormer) dentro de la información proporcionada. El propio UNetFormer original, descrito en el artículo de Wang et al. (2022), reporta resultados en conjuntos como LoveDA y Vaihingen, pero no se pueden comparar directamente con este checkpoint porque el conjunto de datos de GeoNUSAF es diferente. Se recomienda consultar los resultados del mismo modelo en otros pliegues (fold 0, fold 1) para evaluar la variabilidad de la validación cruzada.

## Limitaciones y advertencias

- Sesgos geográficos: el modelo fue entrenado exclusivamente con datos del valle de Katmandú; su rendimiento puede degradarse significativamente en otras regiones con diferentes patrones de uso del suelo, estilos arquitectónicos o condiciones atmosféricas.
- Clases desbalanceadas: la clase "suelo sin uso" presenta un IoU de solo 0,2818, lo que indica dificultades para segmentar áreas no urbanizadas, probablemente por su heterogeneidad o baja representación en el conjunto de datos.
- Validación con división aleatoria: el autor advierte que la división aleatoria no es una validación espacial real; las imágenes adyacentes pueden compartir características, inflando las métricas. Para aplicaciones críticas se recomienda una validación espacial (p. ej., por bloques).
- Licencia no especificada: no se indica la licencia del modelo ni de los pesos, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de usarlo en producción.
- Implementación independiente: aunque la arquitectura sigue el paper de UNetFormer, el código no es el oficial y no se han publicado detalles sobre el preprocesado exacto de los datos de entrenamiento, lo que dificulta la reproducibilidad.
- Riesgo de alucinación visual: como todo modelo de segmentación, puede producir predicciones espurias en áreas con sombras, nubes o artefactos de sensor, especialmente en clases con bajo IoU.
- Sin soporte para otras modalidades: el modelo solo acepta imágenes RGB (presumiblemente) y no maneja bandas multiespectrales adicionales, lo que limita su uso en sensores como Sentinel-2 o WorldView.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold2
- Pliegue 0 del mismo modelo: https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold0
- Artículo original de UNetFormer (arXiv): https://arxiv.org/abs/2109.08937
- Artículo en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S0924271622001654
- Repositorio de referencia GeoSeg (WangLibo1995): https://github.com/WangLibo1995/GeoSeg
- Repositorio alternativo UnetFormer (whulearner): https://github.com/whulearner/UnetFormer

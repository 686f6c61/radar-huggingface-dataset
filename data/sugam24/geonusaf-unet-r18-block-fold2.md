# sugam24/geonusaf-unet-r18-block-fold2

## Resumen

El modelo `geonusaf-unet-r18-block-fold2` es un sistema de segmentación semántica para teledetección, desarrollado por sugam24, que clasifica el uso del suelo en el valle de Katmandú (Nepal). Combina una arquitectura U-Net con un encoder ResNet18 preentrenado en ImageNet, alcanzando 12,46 millones de parámetros. El modelo distingue seis clases de cobertura terrestre: residencial, carretera, río, bosque, suelo sin uso y agrícola.

La relevancia actual del modelo radica en su aplicación al análisis de imágenes de telorría de alta resolución (GSD efectivo de 0,586 m/px) para la planificación urbana y el monitoreo de recursos naturales en regiones montañosas densamente pobladas. El checkpoint distribuido contiene los pesos EMA (decay 0,999), que suelen ofrecer mejor generalización que los pesos finales. El modelo se enmarca en una serie de variantes (fold0, fold2, unetformer) que permiten comparar estrategias de entrenamiento y arquitecturas sobre el mismo conjunto de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet50 (preentrenado en ImageNet) y decoder de canales [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, entrada de imagen 512x512) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es modelo de texto) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pt` (checkpoint `best.pt` con `model_state`, `cfg`, `metrics` y `arch_sig`) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura U-Net estándar con encoder ResNet50 preentrenado en ImageNet y un decoder con canales [128, 64, 32, 16, 8]. La entrada es de 512x512 píxeles normalizada según ImageNet, con una resolución efectiva de 0,586 m/px. El entrenamiento se realizó con una división de datos en bloques (split mode `block`), correspondiente a la partición `fold 2` de 3, con semilla 42.

Las técnicas de regularización incluyen weight decay 0,01 (exento para normas y sesgos), label smoothing 0,05, dropout 0,1 y promedio móvil exponencial (EMA) con decay 0,999. El modelo alcanzó su mejor rendimiento en la época 68, con métricas de validación de mIoU 0,4207, mF1 0,5508, exactitud global (OA) 0,8311 y kappa 0,6062. No se especifican datos sobre el volumen total de datos de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Segmentación semántica de imágenes de telor de detección con seis clases de uso de suelo: residencial, carretera, río, biomasa, suelo sinuso y agrícola.
- Procesamiento de imágenes de alta resolución con entrada de 512x512 y normalización ImageNet.
- Clasificación de píxeles con soporte para `ignore_index=255`, lo que permite excluir regiones no etiquetadas del cálculo de pérdida.
- No soporta generación de texto, razonamiento simbólico, tool calling, agentes ni capacidades multilingües, al ser un modelo exclusivamente de visión.
- No dispone de modo de pensamiento (thinking mode) ni capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Mapeo de uso de suelo en el valle de Katmandú: el modelo genera mapas temáticos de seis clases, adecuados para estudios de expansión urbana y planificación territorial.
- Monitoreo de cambios en cobertura forestal: la clase `Forest` (IoU 0,4649) permite detectar deforestación o regeneración en series temporales de imágenes satelitales.
- Gestión de recursos hídricos: la clase `River` (IoU 0,1142) puede ayudar a cartografiar cauces y zonas de inundación, aunque su rendimiento actual es limitado.
- Planificación de infraestructuras de transporte: la clase `Road` (IoU 0,3820) ofrece una base para identificar redes viarias en imágenes aéreas.
- Agricultura de precisión: la clase `Agricultural` (IoU 0,5195) permite delinear parcelas de cultivo para estimación de superficies y gestión de riego.
- Evaluación de suelo urbano no aprovechado: la clase `UnusedLand` (IoU 0,1762) puede orientar la identificación de terrenos baldíos para futuras intervenciones urbanísticas.

## Benchmarks y rendimiento

Los resultados de validación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU (validacion) | 0,4207 |
| mF1 (validacion) | 0,5508 |
| Exactitud global (OA) | 0,8311 |
| Kappa | 0,6062 |

Rendimiento por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8675 | 0,9290 |
| Road | 0,3820 | 0,5528 |
| River | 0,1142 | 0,2050 |
| Forest | 0,4649 | 0,6347 |
| UnusedLand | 0,1762 | 0,2995 |
| Agricultural | 0,5195 | 0,6838 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia en GPU: con 12,46 millones de parámetros, la inferencia puede ejecutarse en GPUs con 2 GB de VRAM o más (p. ej., RTX 3060, RTX 4060, T4) usando cuantización FP16.
- Inferencia en CPU: viable para imágenes individuales, aunque la latencia será mayor; se recomienda para procesamiento por lotes pequeño.
- Entrenamiento o fine-tuning: se recomienda una GPU con al menos 8 GB de VRAM para manejar el lote y el optimizador con pesos EMA.
- Opciones de despliegue: PyTorch nativo, `segmentation-models-pytorch` (librería oficial), ONNX Runtime, o servidores de inferencia como TorchServe o Triton.
- Latencia y throughput estimados: no disponibles en la informacion publicada.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras arquitecturas (p. ej., UNetFormer, DeepLab, SegFormer) sobre el mismo conjunto de datos en la informacion proporcionada. Existen variantes del mismo autor (fold0, unetformer-r18-block-fold2) pero no se han publicado sus métricas de rendimiento para comparación.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con imágenes del valle de Katmandú; su generalización a otras regiones geográficas no está garantizada y puede degradar significativamente el rendimiento.
- Las clases minoritarias o difíciles, como `River` (IoU 0,1142) y `UnusedLand` (IoU 0,1762), presentan un rendimiento bajo, lo que limita su uso en aplicaciones críticas que dependan de estas categorías.
- No se especifica la licencia de uso, por lo que cualquier despliegue comercial requiere verificar los derechos de uso con el autor.
- No se documentan sesgos específicos, pero la limitación geográfica implica un sesgo hacia el entorno urbano y ecológico del valle de Katmandú.
- La exactitud global (0,8311) puede estar dominada por la clase `Residential`, muy bien clasificada (IoU 0,8675), enmascarando el rendimiento pobre de otras clases.
- No se indica el tamaño del dataset de entrenamiento ni su distribución temporal, lo que impide evaluar la robustez frente a cambios estacionales o de sensor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold2
- Variante fold0: https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold0
- Variante UNetFormer: https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold2
- Documentacion de Segmentation Models (PyTorch): https://segmentation-models-pytorch.readthedocs.io/en/latest/models.html
- Articulo de referencia sobre UNetFormer (arquitectura relacionada): https://www.sciencedirect.com/science/article/pii/S0924271622001654

# sugam24/geonusaf-unet-r18-random-fold0

## Resumen

GeoNUSAF es un modelo de segmentación semántica de imágenes de teledetección desarrollado por sugam24 para la clasificación de uso del suelo en el valle de Katmandú. Se basa en una arquitectura UNet con encoder ResNet18 preentrenado en ImageNet y un decoder con canales progresivos [128, 64, 32, 16, 8], sumando 12,46 millones de parámetros. El modelo distingue seis clases de cobertura terrestre: Residencial, Carretera, Río, Bosque, Suelo no utilizado y Agrícola, procesando imágenes de 512x512 píxeles con una resolución efectiva de 0,586 m/px.

Este checkpoint concreto corresponde al fold 0 de un split aleatorio de los datos, y sus pesos son las medias exponenciales móviles (EMA) con decay 0,999, lo que suele mejorar la generalización frente a los pesos finales brutos. Es relevante porque ofrece un modelo compacto y reproducible para tareas de planificación urbana y monitoreo ambiental, con métricas de validación detalladas y una arquitectura ampliamente conocida en la comunidad de segmentación.

El modelo se distribuye con licencia no especificada y se publicó en agosto de 2026, aunque no ha recibido descargas ni interacciones en Hugging Face. La implementación se apoya en la librería segmentation-models-pytorch, lo que facilita su integración en pipelines existentes de segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet18 (ImageNet) y decoder [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (segmentacion de imagenes, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | checkpoint `best.pt` con `model_state`, `cfg`, `metrics` y `arch_sig` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNet clásica implementada en segmentation-models-pytorch, con un encoder ResNet18 preentrenado en ImageNet y un decoder de cuatro etapas con 128, 64, 32, 16 y 8 canales. La entrada es una imagen de 512x512 píxeles normalizada según el estándar de ImageNet, y el modelo genera un mapa de segmentación con seis clases más la clase de ignorancia (ignore_index=255). El entrenamiento usó un split aleatorio con 3 folds (este es el fold 0, seed 42) y se aplicaron regularizaciones como weight decay 0,01 (eximiendo norm y bias), label smoothing 0,05 y dropout 0,1. Los pesos guardados corresponden a la media EMA con decay 0,999, tomados en la época 64 de validación óptima.

No se especifican detalles sobre el dataset de entrenamiento (número de imágenes, composición, resolución original) ni si se aplicaron técnicas de aumentación de datos. La arquitectura es puramente convolucional, sin mecanismos de atención, lo que la hace eficiente en términos de cómputo y adecuada para imágenes de alta resolución.

## Capacidades

- Segmentación semántica de imágenes de teledetección: identifica 6 clases de cobertura terrestre (Residencial, Carretera, Río, Bosque, Suelo no utilizado, Agrícola).
- Procesamiento de imágenes de 512x512 píxeles con resolución efectiva de 0,586 m/px, adecuado para datos satelitales o aéreos.
- Capacidad de distinguir clases con características visuales similares (p. ej., suelo no utilizado frente a agrícola) gracias a la regularización y el entrenamiento con EMA.
- Soporte para inferencia en lote mediante la librería segmentation-models-pytorch, que integra fácilmente con frameworks como PyTorch.
- No incluye capacidades de texto, audio, ni tool calling; es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- **Planificación urbana**: el modelo puede segmentar áreas residenciales y carreteras en imágenes satelitales, permitiendo cartografiar la expansión urbana del valle de Katmandu y apoyar decisiones de zonificación.
- **Monitoreo de recursos hídricos**: la clase Río permite delimitar cauces y detectar cambios en la cobertura de agua, útil para gestión de cuencas y alerta temprana de inundaciones.
- **Inventario forestal**: la clase Bosque posibilita estimar la superficie forestal y su evolución, lo que sirve para políticas de reforestación y control de deforestación.
- **Gestión de suelo no utilizado**: la segmentación de suelo sin uso ayuda a identificar terrenos baldíos en zonas urbanas, facilitando la planificación de nuevos desarrollos o espacios verdes.
- **Agricultura de precisión**: la clase Agrícola permite delimitar parcelas de cultivo y monitorear su extensión, útil para estimar producción y detectar cambios en el uso de suelo agrícola.
- **Integración en pipelines de teledetección**: al ser un modelo UNet estándar, puede integrarse en flujos de procesamiento de imágenes satelitales con segmentation-models-pytorch, reentrenarse con datos locales o usarse como baseline para comparar arquitecturas más complejas.

## Benchmarks y rendimiento

La validación reporta las siguientes métricas en el fold 0:

| Metrica | Valor |
|---|---|
| mIoU | 0,4533 |
| mF1 | 0,5968 |
| OA (exactitud general) | 0,7655 |
| Kappa | 0,6264 |

Rendimiento por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residencial | 0,8053 | 0,8922 |
| Carretera | 0,3970 | 0,5683 |
| Río | 0,1575 | 0,2721 |
| Bosque | 0,5576 | 0,7160 |
| Suelo no utilizado | 0,3063 | 0,4689 |
| Agrícola | 0,4962 | 0,6632 |

Los resultados son moderados, con un rendimiento notable en la clase Residencial (IoU 0,81) pero muy bajo en la clase Río (IoU 0,16), lo que indica dificultad para distinguir cauces de agua en las imágenes disponibles. No se han publicado comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: con 12,46 M de parámetros y entrada de 512x512, la inferencia requiere aproximadamente 1-2 GB de VRAM en FP32 (el modelo ocupa ~50 MB en pesos). Con cuantización FP16 o INT8, cabría en GPUs con 1 GB o menos.
- **GPU recomendadas**: cualquier GPU consumer con al menos 4 GB de VRAM (p ej., GTX 1650, RTX 3050) para inferencia; para entrenamiento se recomienda al menos 8 GB para el batch típico.
- **Compatibilidad**: es viable en GPUs consumer como RTX 3060, RTX 4090, o incluso en CPUs para inferencia con latencia de unos cientos de milisegundos por imagen.
- **Opciones de despliegue**: al ser un modelo PyTorch, se puede servir con TorchServe, o exportar a ONNX para inferencia con TensorRT o ONNX Runtime. También es compatible con segmentación-models-pytorch para integración directa en scripts.
- **Latencia y throughput**: no se proporcionan datos, pero para una imagen 512x512 en una RTX 4090 se espera una latencia de ~10-20 ms; en CPU, puede rondar los 200-500 ms por imagen.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / Entrada | mIoU | Licencia |
|---|---|---|---|---|---|
| **geonusaf-unet-r18-random-fold0** (este) | UNet + ResNet18 | 12,46 M | 512x512 | 0,4533 | no disponible |
| geonusaf-unetformer-r18-random-fold2 | UNetFormer + ResNet18 | no disponible | 512x512 | no disponible | no disponible |
| UNetFormer (GeoSeg) | UNet-like transformer | no disponible | - | - | no disponible |

La comparativa es limitada porque no hay datos públicos de benchmarks del modelo UNetFormer del mismo autor. El UNetFormer de GeoSeg es un modelo de referencia en segmentación de teledetección que introduce atención Transformer, pero no se dispone de métricas comparables. En general, los UNet con encoders preentrenados como ResNet18 son la línea base estándar en este tipo de tareas.

## Limitaciones y advertencias

- **Sesgo geográfico**: el modelo se entrenó específicamente con datos del valle de Katmandu; su rendimiento en otras regiones puede degradarse significativamente, especialmente en clases como Río o Carretera que varían según el entorno.
- **Alucinación de clases**: al ser un modelo de segmentación, puede generar etiquetas erróneas en zonas ambiguas; la baja IoU en Río (0,16) indica que confunde agua con otras clases.
- **Clase de ignorancia**: se usa ignore_index=255, lo que implica que el modelo no predice en píxeles con esa etiqueta; si se aplica a datos sin esa anotación, puede dar resultados inconsistentes.
- **Licencia no disponible**: no se especifica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución; hay que contactar al autor antes de usar en producción.
- **Pesos EMA**: los pesos son la media EMA, lo que puede diferir del modelo final; si se quiere reproducir exactamente el entrenamiento, se necesitan los pesos brutos.
- **Sin documentación de dataset**: no se detalla el origen ni el tamaño del conjunto de entrenamiento, lo que dificulta evaluar la representatividad y los sesgos.
- **Sin soporte para otros idiomas**: al ser un modelo de visión, no aplica, pero no hay documentación técnica en español.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold0)
- [Modelo UNetFormer relacionado en Hugging Face](https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold2)
- [Repositorio GeoSeg (GitHub)](https://github.com/WangLibo1995/GeoSeg)

# sugam24/geonusaf-s4-segnext-t-R0-block-fold1

## Resumen

El modelo `sugam24/geonusaf-s4-segnext-t-R0-block-fold1` es un clasificador de segmentación semántica para imágenes de teledetección, desarrollado por el usuario sugam24 como parte del proyecto GeoNUSAF. Su objetivo es clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Se basa en la arquitectura SegNeXt (NeurIPS 2022), concretamente con un encoder MSCAN-T y un decoder LightHamHead, lo que lo convierte en un modelo muy compacto de solo 4,23 millones de parámetros.

Este modelo corresponde a la etapa 4 del pipeline GeoNUSAF, en su variante "arm R0" (solo datos reales, sin datos sintéticos), y se entrena con 804 pares de imágenes reales. Aunque el proyecto general explora el uso de datos sintéticos para aumentar el rendimiento, esta variante concreta se entrena exclusivamente con datos reales, lo que permite evaluar el impacto de dicha estrategia. Su relevancia radica en su tamaño reducido, su licencia Apache-2.0 y su aplicabilidad directa a tareas de mapeo urbano y monitoreo ambiental en regiones con pocos datos etiquetados.

La validación se realiza sobre 136 tiles reales de la partición fold-1, obteniendo un mIoU de 0,5313, un mF1 de 0,6715, una precisión global (OA) de 0,8186 y un coeficiente kappa de 0,6845. El modelo está disponible en Hugging Face con un tamaño de repositorio de 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt, NeurIPS 2022) |
| Parametros totales | 4,23 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (best.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, que combina un encoder MSCAN-T (Multi-Scale Convolutional Attention Network) con un decoder ligero LightHamHead. El encoder se inicializa con pesos preentrenados en ImageNet-1K (se cargan el 100% de los tensores). El decoder utiliza un fuse stride de 8, combinando las etapas 1, 2 y 3 del encoder. Se emplea un mecanismo de factorización de matrices no negativas (NMF) con rango R=16, 6 pasos de entrenamiento y 7 de evaluación, con inicialización aleatoria.

El entrenamiento se realizó durante 6000 pasos con un warmup de 500 pasos y una programación de tasa de aprendizaje coseno. La tasa de aprendizaje fue de 0,0006 para el decoder y de 6e-05 para el encoder. Se utilizaron pesos de clase derivados de los datos reales y una semilla fija (seed 42). El mejor paso se registró en el paso 1800. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento supervisado estándar para segmentación semántica.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de alta resolución (tiles) con un modelo ligero y eficiente, adecuado para despliegue en entornos con recursos limitados.
- Soporte para inferencia sobre imágenes individuales o lotes, gracias a su arquitectura convolucional.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.
- No es multilingüe; su entrada es exclusivamente visual.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede generar mapas detallados de cobertura terrestre en el valle de Katmandú, útiles para planificación urbana y gestión de infraestructuras. Su tamaño compacto permite ejecutarlo en estaciones de trabajo con GPU consumer.
- Monitoreo ambiental: clasificar bosques, ríos y suelos no utilizados ayuda a detectar cambios en la cobertura vegetal o la expansión de áreas degradadas, con aplicaciones en conservación y gestión de recursos naturales.
- Detección de cambios temporales: al comparar segmentaciones de imágenes tomadas en diferentes fechas, se pueden identificar nuevas construcciones, deforestación o variaciones en cauces fluviales, apoyando estudios de dinámica territorial.
- Planificación de infraestructuras viales: la clase "carretera" permite extraer redes viales de imágenes satelitales, facilitando la actualización de mapas de transporte y la planificación de nuevas rutas.
- Agricultura de precisión: la clase "agrícola" posibilita el seguimiento de cultivos y la estimación de superficies sembradas, útil para organismos agrícolas y aseguradoras.
- Investigación académica: al ser un modelo abierto y ligero, sirve como punto de partida para experimentos de segmentación semántica en teledetección, especialmente en regiones con datos limitados.

## Benchmarks y rendimiento

Los resultados de validación sobre 136 tiles reales de la partición fold-1 son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,5313 |
| mF1 | 0,6715 |
| OA (precision global) | 0,8186 |
| Kappa | 0,6845 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8381 | 0,9119 |
| Road | 0,3670 | 0,5369 |
| River | 0,3539 | 0,5228 |
| Forest | 0,7398 | 0,8504 |
| UnusedLand | 0,3118 | 0,4754 |
| Agricultural | 0,5770 | 0,7318 |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Al tratarse de un modelo de solo 4,23 M de parámetros, la inferencia puede ejecutarse en cualquier GPU moderna con al menos 2 GB de VRAM, incluyendo tarjetas de gama media como la GTX 1660 o RTX 2060.
- Es viable su ejecución en CPU para inferencia por lotes pequeños, aunque con mayor latencia.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060 o superior).
- Opciones de despliegue: PyTorch nativo, exportación a ONNX para inferencia en producción, o integración en pipelines de procesamiento de imágenes con OpenCV o rasterio.
- No se dispone de datos de latencia o throughput específicos en la informacion disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un modelo especializado en segmentación de teledetección con una arquitectura concreta, se recomienda consultar la literatura de SegNeXt y otros modelos de segmentación semántica para establecer comparaciones.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes del valle de Katmandú, por lo que su capacidad de generalización a otras regiones geográficas o condiciones atmosféricas es limitada.
- La validación se realizó sobre datos reales de la misma región, pero el rendimiento en áreas no vistas puede ser inferior.
- Las clases con menor rendimiento (Road, River, UnusedLand) presentan IoU por debajo de 0,37, lo que indica dificultades para segmentar elementos lineales o de baja densidad.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en una región concreta, puede reflejar las características particulares de ese entorno.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones comerciales.
- El modelo no es un sistema de lenguaje; no debe emplearse para tareas de procesamiento de texto o conversación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sugam24/geonusaf-s4-segnext-t-R0-block-fold1)

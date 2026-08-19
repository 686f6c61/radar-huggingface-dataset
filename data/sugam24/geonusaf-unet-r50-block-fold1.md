# sugam24/geonusaf-unet-r50-block-fold1

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por sugam24, que clasifica el uso del suelo en el Valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Utiliza una arquitectura U-Net con encoder ResNet-50 preentrenado en ImageNet, implementada con la librería segmentation-models-pytorch. El modelo se presenta como un checkpoint de un experimento con división de datos en bloques (block split) y corresponde al primer pliegue de un total de tres.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos de alta resolución espacial (GSD efectivo de 0,586 m/px). Aunque no se especifican detalles del conjunto de entrenamiento, las métricas de validación indican un rendimiento moderado, con un mIoU de 0,4980 y una precisión global del 79,04%. El checkpoint incluye el estado del modelo, la configuración y las métricas, lo que facilita su reproducción y análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (smp.Unet) con encoder ResNet-50 preentrenado en ImageNet |
| Parametros totales | no disponible (estimable en ~30-40 M, no confirmado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision por imagenes) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) en el archivo `best.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clasica con un encoder ResNet-50 preentrenado en ImageNet, proporcionado por la libreria segmentation-models-pytorch. La entrada son imagenes de 512x512 píxeles normalizadas con la media y desviacion estandar de ImageNet. La salida es un mapa de segmentacion con 6 clases, utilizando `ignore_index=255` para píxeles no etiquetados. El entrenamiento se realizo con una division de datos en bloques (block split) y el primer pliegue de una validacion cruzada de 3 pliegues, con semilla 42. La mejor epoca fue la 16, alcanzando un mIoU de validacion de 0,4980. No se proporcionan detalles sobre el numero de imagenes de entrenamiento, la funcion de perdida, el optimizador ni la programacion de la tasa de aprendizaje.

## Capacidades

- Segmentacion semantica de imagenes aereas o satelitales en 6 clases de uso del suelo: residencial, carretera, rio, bosque, suelo no utilizado y agricola.
- Clasificacion por píxel con resolucion efectiva de 0,586 m/px, adecuada para analisis urbano y de cobertura terrestre.
- Inferencia sobre imagenes de 512x512 píxeles con normalizacion ImageNet.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales adicionales; es exclusivamente un modelo de vision para segmentacion.

## Casos de uso

- Planificacion urbana: el modelo puede generar mapas de uso del suelo actualizados para el Valle de Katmandú, ayudando a identificar zonas residenciales, carreteras y espacios no utilizados. Su entrada de 512x512 con GSD de 0,586 m/px permite capturar detalles de manzanas y calles.
- Monitoreo ambiental: la clasificacion de bosque, rio y suelo agricola facilita el seguimiento de cambios en la cobertura vegetal o la expansion urbana, siempre que se disponga de imagenes con caracteristicas similares a las de entrenamiento.
- Gestion de desastres: mapas rapidos de carreteras y zonas residenciales pueden apoyar la evaluacion de danos tras inundaciones o terremotos, aunque el modelo no ha sido validado en condiciones post-desastre.
- Analisis de crecimiento urbano: comparando predicciones de diferentes fechas (si se reentrena con datos temporales) se puede cuantificar la expansion de areas residenciales y la perdida de suelo agricola.
- Cartografia de infraestructuras: la deteccion de carreteras y rios, aunque con menor precision (IoU de 0,3726 y 0,4509 respectivamente), puede servir como capa base para sistemas de informacion geografica.
- Investigacion academica: el checkpoint con configuracion y metricas permite reproducir el experimento o utilizarlo como punto de partida para tecnicas de adaptacion de dominio o aprendizaje por transferencia en otras regiones.

## Benchmarks y rendimiento

El modelo reporta las siguientes metricas de validacion en su model card (no se proporcionan comparaciones con otros modelos):

| Metrica | Valor |
|---|---|
| mIoU | 0,4980 |
| mF1 | 0,6448 |
| Overall Accuracy (OA) | 0,7904 |
| Kappa | 0,6289 |

Metricas por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8315 | 0,9080 |
| Road | 0,3726 | 0,5429 |
| River | 0,4509 | 0,6215 |
| Forest | 0,6017 | 0,7513 |
| UnusedLand | 0,2377 | 0,3841 |
| Agricultural | 0,4934 | 0,6607 |

No se han publicado resultados de benchmarks comparativos con otros modelos de segmentacion en la informacion disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la informacion proporcionada.
- El tamaño del repositorio es de 2,3 GB, lo que sugiere que el checkpoint incluye pesos en precision completa (fp32) junto con la configuracion y metricas. Un modelo U-Net con ResNet-50 tipicamente tiene entre 30 y 40 millones de parametros, lo que en fp32 ocupa unos 120-160 MB; el resto del peso del repo podria corresponder a otros archivos o al estado del optimizador.
- Para inferencia sobre una sola imagen de 512x512, una GPU con 4 GB de VRAM seria suficiente, y posiblemente incluso CPU, aunque con mayor latencia.
- Para despliegue en produccion se puede exportar a ONNX o TensorRT, o utilizar el propio checkpoint con segmentation-models-pytorch. No se menciona compatibilidad con vLLM, Ollama o TGI, que son herramientas para modelos generativos de texto.
- Dado que no hay datos de latencia ni throughput, se recomienda realizar pruebas locales para estimar el rendimiento segun el hardware disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se puede establecer una comparativa fiable con otras arquitecturas de segmentacion (por ejemplo, DeepLabV3, FPN o SegFormer) sin datos adicionales de rendimiento sobre el mismo conjunto de datos.

## Limitaciones y advertencias

- El modelo ha sido entrenado exclusivamente con datos del Valle de Katmandú; su capacidad de generalizacion a otras regiones geograficas es incierta y probablemente baja.
- Las clases "Road" y "UnusedLand" presentan un rendimiento significativamente inferior (IoU de 0,3726 y 0,2377 respectivamente), lo que limita su utilidad en aplicaciones que requieran precision alta en esas categorias.
- No se especifica la licencia, por lo que el uso comercial del modelo y sus pesos no esta claramente permitido. Se recomienda contactar con el autor para aclarar los terminos.
- No se proporcionan detalles sobre el conjunto de datos de entrenamiento (numero de imagenes, fuentes, balance de clases), lo que dificulta evaluar posibles sesgos.
- El modelo no soporta otras modalidades ni tareas fuera de la segmentacion semantica de las 6 clases definidas.
- Al ser un checkpoint de un experimento de validacion cruzada (fold 1 de 3), no se ha publicado un modelo final consolidado ni un analisis de robustez entre pliegues.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sugam24/geonusaf-unet-r50-block-fold1)

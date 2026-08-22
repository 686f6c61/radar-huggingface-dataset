# sugam24/geonusaf-unet-r18-block-fold1

## Resumen

El modelo `sugam24/geonusaf-unet-r18-block-fold1` es un sistema de segmentación semántica para imágenes de teledetección, desarrollado por el usuario sugam24. Está diseñado específicamente para la clasificación de usos del suelo en el valle de Katmandú, con un total de 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo emplea una arquitectura UNet con encoder ResNet18 preentrenado en ImageNet y un decodificador con canales [128, 64, 32, 16, 8], sumando 12,46 millones de parámetros. La entrada es de 512x512 píxeles con una resolución efectiva de 0,586 m/px.

Este checkpoint corresponde al primer pliegue (fold 1) de un esquema de división por bloques (block split) con 3 pliegues en total. Los pesos publicados son los pesos EMA (media móvil exponencial con decay 0,999), no los pesos finales crudos. El modelo alcanza un mIoU de validación de 0,4516 y una precisión global (OA) de 0,7898. Aunque no se especifica licencia ni idiomas, su naturaleza es puramente visual, por lo que no requiere soporte lingüístico. Es relevante para aplicaciones de planificación urbana, monitoreo ambiental y gestión de recursos naturales en entornos de alta densidad urbana como el valle de Katmandú.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet18 (preentrenado en ImageNet) y decodificador [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (checkpoint `best.pt` con `model_state`, `cfg`, `metrics` y `arch_sig`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNet clásica, con un encoder ResNet18 que extrae características multiescala y un decodificador que reconstruye la máscara de segmentación a resolución completa. El decodificador utiliza canales de 128, 64, 32, 16 y 8, lo que permite una progresión suave hacia la salida final. La entrada es de 512x512 píxeles con normalización ImageNet y una resolución efectiva de 0,586 m/px, adecuada para imágenes aéreas o satelitales de alta resolución.

El entrenamiento se realizó con un esquema de división por bloques (block split) en 3 pliegues, siendo este el fold 1 con semilla 42. Se aplicaron técnicas de regularización: weight decay de 0,01 (exento en norm y bias), label smoothing de 0,05, dropout de 0,1 y EMA con decay 0,999. La mejor época fue la 62, y los pesos publicados corresponden a la versión EMA. No se menciona el número total de tokens ni la composición del dataset, pero el contexto es claramente de teledetección urbana. No se indica el uso de RLHF ni DPO, ya que es un modelo de segmentación supervisada.

## Capacidades

- Segmentación semántica de imágenes de teledetección (aéreas o satelitales) con 6 clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Clasificación píxel a píxel con `ignore_index=255` para áreas no etiquetadas.
- Inferencia sobre imágenes de 512x512 píxeles con normalización ImageNet.
- Soporte para entrenamiento y evaluación con la librería `segmentation-models-pytorch` (smp).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No soporta visión general (solo segmentación), ni audio, ni otras modalidades.

## Casos de uso

- Cartografía de usos del suelo: el modelo puede generar mapas temáticos de cobertura terrestre a partir de ortofotos o imágenes satelitales, facilitando la actualización de catastros y planes urbanísticos en el valle de Katmandú.
- Planificación urbana: permite identificar zonas residenciales, carreteras y espacios no utilizados, ayudando a los ayuntamientos a detectar expansión urbana informal o áreas degradadas.
- Gestión de recursos hídricos: la clase "río" permite monitorizar cauces y detectar cambios en la morfología fluvial, aunque su rendimiento es bajo (IoU 0,1329), por lo que se recomienda combinar con otras fuentes.
- Monitoreo forestal: la clase "bosque" alcanza un IoU de 0,6495, siendo útil para seguimiento de deforestación o evaluación de cobertura arbórea en zonas periurbanas.
- Agricultura de precisión: la clase "agrícola" (IoU 0,5232) puede emplearse para delimitar parcelas de cultivo y estimar superficies productivas.
- Análisis de expansión urbana: al comparar predicciones de diferentes fechas, se puede cuantificar el crecimiento de áreas residenciales y la pérdida de suelo agrícola o forestal, siempre que se disponga de imágenes multitemporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Sin embargo, la model card incluye métricas de validación del propio modelo, que se presentan a continuación.

| Metrica | Valor |
|---|---|
| mIoU (validacion) | 0,4516 |
| mF1 (validacion) | 0,5807 |
| OA (validacion) | 0,7898 |
| Kappa (validacion) | 0,6255 |

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8310 | 0,9077 |
| Road | 0,3965 | 0,5678 |
| River | 0,1329 | 0,2346 |
| Forest | 0,6495 | 0,7875 |
| UnusedLand | 0,1763 | 0,2998 |
| Agricultural | 0,5232 | 0,6870 |

Estas métricas indican un buen rendimiento en clases dominantes como residencial y bosque, pero un desempeño pobre en río y suelo no utilizado, probablemente debido a la escasez de muestras o a la variabilidad espectral de estas categorías.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware en la información disponible. No obstante, dado que el modelo tiene 12,46 millones de parámetros y una entrada de 512x512, se puede estimar un consumo de VRAM moderado:

- VRAM estimada para inferencia: aproximadamente 1-2 GB con precisión FP32, y menos de 1 GB con cuantización a FP16 o INT8 (si se aplicara).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media y baja.
- Opciones de despliegue: al ser un modelo de `segmentation-models-pytorch`, puede servirse con frameworks como TorchServe, ONNX Runtime o mediante scripts de inferencia personalizados. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la optimización (por ejemplo, TensorRT).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea y con las mismas métricas. Existen otros checkpoints del mismo autor (fold0, unetformer) y repositorios como GeoSeg que incluyen arquitecturas como UNetFormer, pero no se han publicado comparativas directas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos geográficos: el modelo está entrenado exclusivamente con imágenes del valle de Katmandú, por lo que su generalización a otras regiones o climas puede ser limitada.
- Rendimiento desigual por clase: las clases "River" (IoU 0,1329) y "UnusedLand" (IoU 0,1763) tienen un rendimiento muy bajo, lo que puede generar errores en aplicaciones que dependan de estas categorías.
- Riesgo de alucinación: al ser un modelo de segmentación, no genera texto, pero puede producir máscaras incorrectas en áreas ambiguas o con sombras, nubes o artefactos.
- Limitaciones de contexto: la resolución efectiva de 0,586 m/px limita la detección de objetos pequeños o detalles finos.
- Licencia no especificada: no se indica la licencia, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones no declaradas. Se recomienda contactar al autor antes de usarlo en producción.
- Dependencia de la librería `segmentation-models-pytorch`: para cargar el modelo se requiere esta librería, que a su vez depende de PyTorch y otras herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold1
- Checkpoint fold0 del mismo autor: https://huggingface.co/sugam24/geonusaf-unet-r18-block-fold0
- Checkpoint UNetFormer del mismo autor: https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold1
- Repositorio GeoSeg (arquitecturas de segmentación para teledetección): https://github.com/WangLibo1995/GeoSeg
- Documentación de U-Net (referencia general): https://www.geeksforgeeks.org/machine-learning/u-net-architecture-explained/

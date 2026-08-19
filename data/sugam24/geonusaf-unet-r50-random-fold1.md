# sugam24/geonusaf-unet-r50-random-fold1

## Resumen

El modelo `sugam24/geonusaf-unet-r50-random-fold1` es un sistema de segmentación semántica para imágenes de teledetección del valle de Katmandú, desarrollado por Sugam Dahal (usuario `sugam24`). Utiliza una arquitectura U-Net con encoder ResNet-50 preentrenado en ImageNet, implementada con la librería `segmentation-models-pytorch`. El modelo clasifica cada píxel en una de seis clases de uso del suelo: residencial, carretera, río, bosque, suelo no utilizado y agrícola.

Se trata de un checkpoint correspondiente al primer pliegue de una validación cruzada con división aleatoria (semilla 42), con entrada de 512x512 píxeles y resolución efectiva de 0,586 m/px. Los resultados de validación son notablemente bajos (mIoU de 0,0542), lo que indica que el modelo no ha aprendido adecuadamente a segmentar las clases, probablemente debido a un entrenamiento insuficiente (la mejor época es la 0) o a un desequilibrio severo en los datos. A pesar de ello, el repositorio puede servir como referencia para experimentos de segmentación en entornos urbanos con pocos recursos computacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-50 (ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (.pt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura U-Net clásica con encoder ResNet-50 preentrenado en ImageNet, implementada mediante `segmentation-models-pytorch`. La entrada son imágenes de 512x512 píxeles normalizadas con la media y desviación estándar de ImageNet. El entrenamiento se realizó sobre un conjunto de datos de teledetección del valle de Katmandú con 6 clases y `ignore_index=255` para píxeles no etiquetados. Se utilizó una división aleatoria con semilla 42 y se seleccionó el primer pliegue de un total de tres.

No se especifican detalles sobre el número de épocas, tamaño del dataset, función de pérdida o técnicas de optimización. El checkpoint `best.pt` guarda el estado del modelo, la configuración y las métricas. La mejor época registrada es la 0, lo que sugiere que el modelo no llegó a converger o que el proceso de entrenamiento fue interrumpido prematuramente. Tampoco se menciona el uso de técnicas como aumento de datos, regularización o ajuste fino adicional.

## Capacidades

- Segmentación semántica de imágenes de satélite o aéreas en 6 clases de uso del suelo: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes con resolución efectiva de 0,586 m/px, adecuado para análisis a escala de barrio o municipal.
- Inferencia sobre imágenes de 512x512 píxeles con normalización ImageNet.
- No dispone de capacidades de generación de texto, razonamiento multimodal, tool calling ni agentes, al ser un modelo exclusivamente de visión.

## Casos de uso

- Cartografía de uso del suelo: el modelo puede etiquetar automáticamente parcelas urbanas y rurales en imágenes aéreas, aunque su baja precisión actual lo hace inadecuado para producción.
- Planificación urbana: podría ayudar a identificar zonas residenciales, carreteras y espacios verdes, pero necesita un reentrenamiento con métricas aceptables.
- Monitorización ambiental: la clase "bosque" y "río" podrían usarse para detectar cambios en cobertura vegetal o cursos de agua, siempre que se mejore el rendimiento.
- Gestión de catastro: la segmentación de "suelo no utilizado" y "agrícola" podría apoyar la actualización de registros catastrales, pero con las métricas actuales no es fiable.
- Investigación académica: sirve como punto de partida para estudiar técnicas de segmentación en entornos urbanos con datos limitados, o para comparar arquitecturas.
- Desarrollo de pipelines de teledetección: puede integrarse en flujos de trabajo con `segmentation-models-pytorch` para experimentar con diferentes encoders y estrategias de entrenamiento.

## Benchmarks y rendimiento

Los resultados de validación del modelo son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,0542 |
| mF1 | 0,1010 |
| Overall Accuracy (OA) | 0,1403 |
| Kappa | 0,0230 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,0638 | 0,1200 |
| Road | 0,0160 | 0,0315 |
| River | 0,0125 | 0,0247 |
| Forest | 0,1093 | 0,1971 |
| UnusedLand | 0,0623 | 0,1173 |
| Agricultural | 0,0613 | 0,1155 |

Estos valores son extremadamente bajos, lo que indica que el modelo no ha aprendido a segmentar correctamente ninguna clase. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- El tamaño del repositorio es de 0,5 GB, correspondiente al checkpoint del modelo.
- Al ser un U-Net con ResNet-50, la inferencia puede ejecutarse en GPUs de consumo como una NVIDIA GTX 1060 o superior, aunque no se especifican requisitos exactos.
- No se indica soporte para cuantización ni formatos optimizados como TensorRT u ONNX.
- Para despliegue, se puede utilizar PyTorch directamente o frameworks como `segmentation-models-pytorch`; no se mencionan herramientas como vLLM u Ollama (no aplicables a modelos de visión).
- Se desconoce la latencia y el throughput en diferentes hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que el rendimiento es muy bajo, no es posible establecer una comparativa significativa con alternativas como DeepLabV3, SegFormer u otros U-Net entrenados sobre datasets de teledetección.

## Limitaciones y advertencias

- Rendimiento de validación muy pobre: mIoU de 0,0542 y kappa de 0,0230, lo que indica que las predicciones son casi aleatorias.
- La mejor época es la 0, lo que sugiere que el entrenamiento no progresó o se detuvo prematuramente.
- Desequilibrio severo entre clases: la clase "Road" tiene un IoU de 0,0160 y "River" de 0,0125, prácticamente sin aprendizaje.
- No se especifica la licencia, por lo que no está claro si es utilizable en proyectos comerciales.
- No se proporcionan datos sobre el dataset de entrenamiento, su tamaño o composición, lo que dificulta evaluar posibles sesgos.
- El modelo no está listo para producción; cualquier uso real requeriría un reentrenamiento exhaustivo y una validación independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sugam24/geonusaf-unet-r50-random-fold1)
- [Perfil del autor en Hugging Face](https://huggingface.co/sugam24)

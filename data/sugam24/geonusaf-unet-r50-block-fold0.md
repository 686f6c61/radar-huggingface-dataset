# sugam24/geonusaf-unet-r50-block-fold0

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección orientado al uso del suelo en el valle de Katmandú (Nepal). Desarrollado por el usuario sugam24 (Sugam Dahal) y publicado en Hugging Face, emplea una arquitectura U-Net con encoder ResNet-50 preentrenado en ImageNet, implementada mediante la librería `segmentation-models-pytorch`. El modelo distingue seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola, con una entrada de 512×512 píxeles y una resolución efectiva de 0,586 m/px.

Este checkpoint corresponde al fold 0 de un esquema de validación por bloques (block split) con 3 pliegues, semilla 42, y fue entrenado durante 75 épocas. El repositorio ocupa 6,5 GB e incluye el checkpoint `best.pt` con el estado del modelo, la configuración y las métricas. Su relevancia radica en ofrecer una solución específica para planificación territorial y monitoreo ambiental en entornos urbanos de alta densidad, aunque sus métricas de validación son modestas (mIoU 0,3565) y requieren consideración antes de un uso productivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (smp.Unet) con encoder ResNet-50 preentrenado en ImageNet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de imágenes) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.pt`) según la model card, aunque no se especifica explícitamente |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura U-Net clásica con un encoder ResNet-50 preentrenado en ImageNet como extractor de características, y un decoder convolucional que produce mapas de probabilidad por clase. La entrada es de 512×512 píxeles con normalización ImageNet y una resolución efectiva de 0,586 m/px, lo que permite procesar imágenes aéreas o satelitales de alta resolución. El entrenamiento se realizó sobre un dataset de segmentación de uso del suelo del valle de Katmandú, con 6 clases y `ignore_index=255` para píxeles no etiquetados. Se empleó un esquema de validación por bloques (block split) con 3 pliegues, siendo este el fold 0 con semilla 42. La mejor época fue la 75, aunque no se detallan hiperparámetros adicionales (tasa de aprendizaje, optimizador, función de pérdida, etc.). Tampoco se especifica el número de imágenes ni la composición del dataset de entrenamiento.

## Capacidades

- Segmentación semántica de uso del suelo en imágenes de teledetección.
- Detección de seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de 512×512 píxeles con normalización ImageNet.
- Inferencia sobre imágenes de mayor tamaño mediante estrategias de teselado (tile inference), como es habitual en este tipo de modelos.
- No dispone de capacidades de generación de texto, razonamiento multimodal ni tool calling.

## Casos de uso

- Planificación urbana: identificación de zonas residenciales y carreteras para actualizar mapas de uso del suelo y apoyar decisiones de zonificación.
- Gestión de recursos naturales: delimitación de bosques, ríos y tierras agrícolas para monitorear cambios en la cobertura vegetal y la hidrología.
- Evaluación de riesgos de inundación: las clases de río y suelo no utilizado permiten detectar áreas vulnerables en llanuras aluviales del valle de Katmandú.
- Agricultura de precisión: seguimiento de parcelas agrícolas y estimación de superficie cultivada para planificación de cosechas.
- Catastro y gestión de tierras: actualización de registros catastrales mediante la delimitación automática de parcelas residenciales y agrícolas.
- Monitoreo de expansión urbana: análisis multitemporal para cuantificar la pérdida de suelo agrícola o forestal frente al crecimiento de áreas residenciales.

## Benchmarks y rendimiento

Los resultados de validación del fold 0 se presentan en la model card:

| Metrica | Valor |
|---|---|
| mIoU | 0,3565 |
| mF1 | 0,4922 |
| Overall Accuracy (OA) | 0,6293 |
| Kappa | 0,5071 |

Rendimiento por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,6171 | 0,7632 |
| Road | 0,2081 | 0,3445 |
| River | 0,0845 | 0,1558 |
| Forest | 0,6156 | 0,7621 |
| UnusedLand | 0,2270 | 0,3700 |
| Agricultural | 0,3865 | 0,5576 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación del modelo.
- El tamaño del repositorio (6,5 GB) sugiere que el checkpoint completo puede ocupar varios gigabytes, pero el número exacto de parámetros no está disponible.
- Para inferencia con imágenes de 512×512, una GPU con al menos 8 GB de VRAM podría ser suficiente, pero no hay confirmación oficial.
- Se recomienda usar `segmentation-models-pytorch` para cargar el modelo y PyTorch para la inferencia. No se mencionan integraciones con vLLM, Ollama u otros frameworks de despliegue.
- Dado que es un modelo de visión, el despliegue en CPU es posible pero lento; se recomienda GPU para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de segmentación de uso del suelo en la documentación proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Las métricas de validación son bajas, especialmente para las clases carretera (IoU 0,208) y río (IoU 0,084), lo que indica dificultades para segmentar estas categorías.
- El modelo fue entrenado exclusivamente para el valle de Katmandú; su generalización a otras regiones geográficas es incierta y probablemente deficiente.
- No se especifica la licencia, por lo que el uso comercial requiere contactar con el autor o verificar los términos en el repositorio.
- No se documentan sesgos potenciales ni limitaciones éticas. La ausencia de información sobre el dataset de entrenamiento impide evaluar posibles desequilibrios de clases o sesgos geográficos.
- El checkpoint corresponde a un único fold (0 de 3); para un uso robusto se recomendaría entrenar o evaluar los tres pliegues y promediar resultados.
- No se proporcionan instrucciones de instalación ni ejemplos de inferencia, lo que puede dificultar la reproducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unet-r50-block-fold0
- Perfil del autor en Hugging Face: https://huggingface.co/sugamd24 (según resultados de búsqueda, aunque no se confirma que sea el mismo autor)
- Documentación de Segmentation Models PyTorch: https://segmentation-models-pytorch.readthedocs.io/en/latest/models.html (referencia general de la librería, no específica del modelo)

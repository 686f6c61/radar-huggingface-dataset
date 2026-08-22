# sugam24/geonusaf-unet-r18-random-fold2

## Resumen

El modelo `sugam24/geonusaf-unet-r18-random-fold2` es un sistema de segmentación semántica de uso del suelo para imágenes de teledetección, desarrollado por el usuario sugam24. Está entrenado específicamente para el valle de Katmandú (Nepal) y clasifica cada píxel en una de seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. La arquitectura combina un codificador ResNet-18 preentrenado en ImageNet con un decodificador UNet de canales decrecientes [128, 64, 32, 16, 8], alcanzando 12,46 millones de parámetros. El modelo se enmarca en el proyecto GeoNUSAF y corresponde al segundo pliegue (fold 2) de una división aleatoria de tres pliegues, con semilla 42.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos de alta resolución espacial (GSD efectivo de 0,586 m/px). Aunque su rendimiento global es moderado (mIoU de validación 0,4484), destaca en la clase residencial (IoU 0,8104) y forestal (IoU 0,6457), mientras que presenta dificultades en clases minoritarias como río (IoU 0,1349). El checkpoint publicado contiene los pesos EMA (decay 0,999), lo que suele proporcionar una mejor generalización que los pesos finales crudos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet con encoder ResNet-18 (ImageNet) y decoder [128, 64, 32, 16, 8] |
| Parametros totales | 12,46 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`best.pt` con `model_state`, `cfg`, `metrics`, `arch_sig`) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura UNet clásica con un codificador ResNet-18 preentrenado en ImageNet como extractor de características. El decodificador reduce progresivamente el número de canales desde 128 hasta 8, seguido de una capa de clasificación por píxel para las seis clases objetivo. La entrada es una imagen de 512x512 píxeles normalizada con la media y desviación estándar de ImageNet, con una resolución espacial efectiva de 0,586 metros por píxel. La clase de fondo o no etiquetada se ignora mediante `ignore_index=255`.

El entrenamiento se realizó con una división aleatoria de los datos en tres pliegues, siendo este el segundo. Se aplicaron varias técnicas de regularización: weight decay de 0,01 (excluyendo normas y sesgos), label smoothing de 0,05, dropout de 0,1 y promedio exponencial de pesos (EMA) con decay 0,999. El mejor epoch fue el 77, y los pesos publicados corresponden a la versión EMA, no a los pesos finales crudos. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset, pero el contexto geográfico (valle de Katmandú) y las clases definidas indican un conjunto de imágenes aéreas o satelitales etiquetadas manualmente.

## Capacidades

- Segmentación semántica de uso del suelo en imágenes de teledetección, con seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Procesamiento de imágenes de alta resolución (512x512 píxeles, GSD 0,586 m/px) con normalización ImageNet.
- Clasificación píxel a píxel con salida de mapa de etiquetas, adecuada para análisis geoespacial.
- Capacidad de transferencia limitada a entornos similares al valle de Katmandú; no se ha demostrado generalización a otras regiones.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión estática.
- No es un modelo de lenguaje; no genera texto ni responde a instrucciones.

## Casos de uso

- Planificación urbana: el modelo puede generar mapas de ocupación del suelo para identificar zonas residenciales, carreteras y espacios no utilizados, facilitando la toma de decisiones sobre expansión urbana y ordenación territorial en el valle de Katmandú.
- Monitoreo ambiental: la clasificación de bosques, ríos y suelo agrícola permite detectar cambios en la cobertura vegetal, la deforestación o la degradación de riberas a lo largo del tiempo, comparando predicciones de distintas fechas.
- Gestión de riesgos naturales: la identificación de ríos y zonas residenciales próximas puede ayudar a evaluar la exposición a inundaciones o deslizamientos, integrando el mapa de segmentación en sistemas de información geográfica (SIG).
- Cartografía de infraestructuras: la detección de carreteras (aunque con IoU moderado de 0,375) puede servir para actualizar mapas viales en zonas donde los datos oficiales están desactualizados.
- Agricultura de precisión: la clase agrícola (IoU 0,4469) permite delimitar parcelas cultivadas y estimar su extensión, útil para estudios de seguridad alimentaria o gestión de recursos hídricos.
- Investigación académica: el modelo sirve como punto de partida para experimentos de segmentación en entornos urbanos de alta densidad, comparando arquitecturas o técnicas de regularización (EMA, label smoothing) sobre un dataset específico.

## Benchmarks y rendimiento

Los resultados de validación publicados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4484 |
| mF1 | 0,5859 |
| Exactitud global (OA) | 0,7560 |
| Kappa | 0,6248 |

Rendimiento por clase (validación):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8104 | 0,8953 |
| Road | 0,3750 | 0,5455 |
| River | 0,1349 | 0,2377 |
| Forest | 0,6457 | 0,7847 |
| UnusedLand | 0,2777 | 0,4347 |
| Agricultural | 0,4469 | 0,6177 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados indican un desequilibrio notable entre clases: la clase residencial domina el rendimiento, mientras que río y suelo no utilizado presentan métricas muy bajas, probablemente por su menor presencia en el dataset o por la dificultad intrínseca de separación espectral.

## Requisitos de hardware

- El modelo tiene 12,46 millones de parámetros, lo que en precisión FP32 ocupa aproximadamente 50 MB de memoria. Con la entrada de 512x512 píxeles y el batch de inferencia típico, la VRAM necesaria es modesta, estimable en menos de 1 GB para una sola imagen.
- Cualquier GPU moderna con al menos 4 GB de VRAM puede ejecutar la inferencia sin problemas. Una NVIDIA GTX 1060, RTX 2060 o superior es suficiente.
- Para entrenamiento o fine-tuning, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti) para manejar el batch y la retropropagación.
- El despliegue puede realizarse con PyTorch estándar, o mediante librerías de segmentación como `segmentation-models-pytorch` (SMP), que es la librería indicada en el repositorio.
- No se dispone de datos de latencia o throughput específicos, pero al ser un modelo pequeño, la inferencia en GPU es casi instantánea (del orden de milisegundos por imagen).
- También es posible ejecutar la inferencia en CPU, aunque con tiempos mayores (varios segundos por imagen), dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de resultados comparativos directos con otros modelos en la información proporcionada. Sin embargo, se puede contextualizar con alternativas comunes en segmentación de teledetección:

| Modelo | Parametros | Contexto | Rendimiento (mIoU) | Licencia |
|---|---|---|---|---|
| GeoNUSAF UNet-R18 (este) | 12,46 M | Imágenes 512x512, 6 clases | 0,4484 (val) | no disponible |
| UNetFormer (ResNet-18) | ~20-30 M (estimado) | Teledetección urbana | no disponible | MIT (según repo GeoSeg) |
| DeepLabV3+ (ResNet-50) | ~40 M | Segmentación general | no disponible | Apache 2.0 |

La comparación es orientativa; no hay datos de benchmarks comunes (como LoveDA o Vaihingen) para este modelo concreto. El proyecto GeoSeg (enlace en la sección de enlaces) incluye implementaciones de UNetFormer y otros modelos que podrían servir como referencia, pero no se han ejecutado sobre el mismo dataset.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos del valle de Katmandú; su aplicación a otras regiones geográficas puede producir resultados poco fiables debido a diferencias en el paisaje, la vegetación, el estilo de construcción y las condiciones atmosféricas.
- El rendimiento en clases minoritarias es muy bajo: río (IoU 0,1349) y suelo no utilizado (IoU 0,2777). Esto limita su uso en aplicaciones que requieran precisión en estas categorías, como la cartografía hidrológica.
- La clase carretera también presenta un IoU moderado (0,3750), lo que puede generar errores en la delineación de vías, especialmente en zonas con sombras o vegetación que oculta parcialmente la carretera.
- No se especifica la licencia del modelo ni de los datos de entrenamiento. Antes de un uso comercial, es necesario contactar con el autor para aclarar los términos de uso.
- El checkpoint contiene pesos EMA, que suelen ser más robustos que los pesos finales, pero no se garantiza que el rendimiento en producción sea idéntico al reportado en validación.
- No hay información sobre el dataset de entrenamiento (número de imágenes, resolución original, fuentes), lo que dificulta evaluar posibles sesgos de muestreo o duplicación de escenas.
- El modelo no incluye mecanismos de incertidumbre; las predicciones son deterministas y no ofrecen una medida de confianza por píxel, lo que puede ser un inconveniente en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold2
- Modelo relacionado (UNetFormer, mismo autor): https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold2
- Modelo relacionado (fold 0): https://huggingface.co/sugam24/geonusaf-unet-r18-random-fold0
- Repositorio GeoSeg (implementaciones de segmentación para teledetección): https://github.com/WangLibo1995/GeoSeg

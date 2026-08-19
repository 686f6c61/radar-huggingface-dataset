# sugam24/geonusaf-unetformer-r18-block-fold2

## Resumen

GeoNUSAF es un modelo de segmentación semántica para imágenes de teledetección urbana, desarrollado por Sugam Dahal (usuario `sugam24`), que aplica la arquitectura UNetFormer al caso de uso del valle de Katmandú (Nepal). El modelo clasifica cada píxel de la imagen en seis categorías de uso del suelo: residencial, carretera, río, bosque, suelo sin uso y agrícola. Se trata de una implementación independiente de la arquitectura propuesta por Wang et al. (2022) en el artículo *UNetFormer: A UNet-like transformer for efficient semantic segmentation of remote sensing urban scene imagery*, publicada en ISPRS Journal of Photogrammetry and Remote Sensing.

El checkpoint publicado corresponde al pliegue 2 de un esquema de validación cruzada por bloques (block split), con un encoder ResNet-18 preentrenado en ImageNet y un decoder con atención global-local. La entrada es de 512x512 píxeles con una resolución efectiva de 0,586 m/píxel. El modelo alcanza un mIoU de validación de 0,4842 y una precisión global del 85,32 %. Su relevancia radica en ofrecer una solución práctica y reproducible para cartografía de usos del suelo en entornos urbanos densos, con un coste computacional moderado gracias al encoder ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer (encoder ResNet-18 de timm, decoder con atención global-local) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen fija 512x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pt` con `model_state`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UNetFormer, que combina un encoder convolucional ResNet-18 (obtenido de la librería `timm`, preentrenado en ImageNet) con un decoder basado en transformadores de atención global-local. El decoder procesa las características multiescala del encoder y aplica mecanismos de atención para capturar dependencias de largo alcance, lo que resulta especialmente útil en escenas urbanas con estructuras heterogéneas y objetos pequeños como carreteras o ríos. La implementación es independiente del repositorio de referencia (que está bajo licencia GPL-3.0), aunque sigue la misma arquitectura descrita en el artículo de Wang et al. (2022).

El entrenamiento se realizó sobre un dataset propio del valle de Katmandú, con seis clases y `ignore_index=255` para píxeles no etiquetados. Se empleó un esquema de validación cruzada por bloques (block split) con 3 pliegues, siendo este el pliegue 2, con semilla 42. Los hiperparámetros incluyen una tasa de aprendizaje de 0,0006 para el decoder y 6e-05 para el encoder, optimizador AdamW con weight decay 0,0001, y un peso de 0,4 para la cabeza auxiliar. El mejor epoch fue el 26, y las métricas de validación se calcularon sobre ese checkpoint. Cabe destacar que el split por bloques utiliza un proxy de orden de exportación, no una partición espacial real, lo que puede inflar ligeramente las métricas al existir correlación espacial entre bloques vecinos.

## Capacidades

- Segmentación semántica de imágenes de teledetección aérea o satelital, con clasificación píxel a píxel en seis clases de uso del suelo.
- Detección de áreas residenciales, carreteras, ríos, bosques, suelo sin uso y zonas agrícolas.
- Manejo de escenas urbanas complejas gracias al decoder con atención global-local, que integra información contextual de largo alcance.
- Entrada de 512x512 píxeles con normalización ImageNet, compatible con imágenes de resolución submétrica (GSD efectivo 0,586 m/px).
- Inferencia directa con PyTorch, sin necesidad de preprocesamiento adicional más allá de la normalización estándar.
- No soporta tool calling, agentes ni generación de texto; es un modelo exclusivamente de visión para segmentación.

## Casos de uso

- Cartografía de usos del suelo urbano: el modelo puede generar mapas de cobertura terrestre actualizados para el valle de Katmandú, útiles para organismos municipales y planificadores urbanos que necesitan información precisa sobre la distribución de zonas residenciales, infraestructuras y espacios verdes.
- Planificación de infraestructuras de transporte: la detección de carreteras (IoU 0,3954) permite identificar la red viaria existente y planificar nuevas rutas, aunque su precisión limitada recomienda combinar con otras fuentes de datos.
- Monitoreo ambiental y de recursos hídricos: la clase río (IoU 0,3881) ayuda a delimitar cauces fluviales y zonas de inundación potencial, información clave para gestión de riesgos y conservación de ecosistemas acuáticos.
- Análisis de expansión urbana: la comparación de segmentaciones en diferentes fechas permite cuantificar el crecimiento de áreas residenciales y la pérdida de suelo agrícola o forestal, apoyando estudios de cambio de uso del suelo.
- Agricultura de precisión: la clase agrícola (IoU 0,5294) puede utilizarse para identificar parcelas cultivadas y estimar su extensión, lo que facilita la gestión de cultivos y la evaluación de cosechas en la región.
- Investigación académica en teledetección: el modelo sirve como punto de partida para experimentos con arquitecturas transformer aplicadas a segmentación de escenas urbanas, y su código y checkpoint están disponibles para reproducibilidad y comparación.

## Benchmarks y rendimiento

Los resultados de validación del pliegue 2 (mejor epoch 26) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4842 |
| mF1 | 0,6274 |
| Exactitud global (OA) | 0,8532 |
| Kappa | 0,6384 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8791 | 0,9356 |
| Road | 0,3954 | 0,5667 |
| River | 0,3881 | 0,5592 |
| Forest | 0,5147 | 0,6796 |
| UnusedLand | 0,1984 | 0,3311 |
| Agricultural | 0,5294 | 0,6923 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La clase con peor rendimiento es UnusedLand, probablemente por su baja representación o alta variabilidad espectral, mientras que Residential alcanza un IoU muy alto.

## Requisitos de hardware

- No se dispone de datos específicos de VRAM, latencia o throughput en la información proporcionada.
- El checkpoint pesa 1,2 GB, lo que sugiere un modelo con decenas de millones de parámetros (típico de un ResNet-18 con decoder transformer). Una GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia con entrada 512x512 en FP32, aunque no está confirmado.
- Es probable que el modelo funcione en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060 o superiores, y en GPUs de datacenter como T4, V100 o A100.
- Para despliegue en producción, se recomienda exportar a TorchScript o usar servidores de inferencia como TorchServe, o convertirlo a ONNX para optimización con TensorRT.
- No se ha probado con frameworks como vLLM u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de segmentación en el mismo dataset. Sin embargo, se puede contextualizar:

- **UNetFormer original (Wang et al., 2022)**: la implementación de referencia, disponible en el repositorio GeoSeg, reporta resultados en datasets como LoveDA y Vaihingen. GeoNUSAF es una implementación independiente con encoder ResNet-18 y entrenamiento específico para Katmandú, por lo que las métricas no son directamente comparables.
- **U-Net con encoder ResNet-18**: una alternativa clásica sin atención global-local. GeoNUSAF debería superarla en escenas con dependencias de largo alcance, pero no hay datos numéricos.
- **DeepLabV3+ con ResNet-50**: modelo más pesado que suele lograr mayor precisión en segmentación semántica, pero requiere más recursos. No se han publicado comparativas.

En ausencia de benchmarks comunes, no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- El esquema de validación por bloques (block split) no es una validación espacial real; los bloques vecinos pueden estar correlacionados, lo que probablemente sobreestima las métricas de generalización.
- La clase UnusedLand tiene un IoU muy bajo (0,1984), lo que indica dificultades para distinguirla de otras clases o una representación insuficiente en el conjunto de entrenamiento.
- Las clases Road y River también presentan IoU moderados (alrededor de 0,39), lo que puede limitar su uso en aplicaciones que requieran alta precisión en estas categorías.
- La licencia no está especificada, por lo que no se garantiza el uso comercial. Se recomienda contactar con el autor antes de utilizar el modelo en entornos productivos.
- El modelo está entrenado exclusivamente para el valle de Katmandú; su aplicabilidad a otras regiones geográficas o con diferentes características espectrales no está validada.
- No se proporcionan datos sobre sesgos demográficos o geográficos, pero al ser un modelo de visión, los sesgos pueden derivarse de la distribución de las imágenes de entrenamiento (por ejemplo, estaciones del año, condiciones de iluminación).
- El checkpoint contiene únicamente `model_state`, `cfg` y `metrics`; no se incluye el código de inferencia ni el dataset, por lo que la reproducibilidad completa requiere acceso al código original del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold2
- Otros pliegues: https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
- Repositorio de referencia UNetFormer (Wang et al., 2022): https://github.com/manhhv87/UNetFormer
- Implementación en GeoSeg (configuración para LoveDA): https://github.com/WangLibo1995/GeoSeg/blob/main/config/loveda/unetformer.py
- Perfil del autor: https://huggingface.co/sugamd24

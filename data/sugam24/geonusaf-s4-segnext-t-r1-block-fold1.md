# sugam24/geonusaf-s4-segnext-t-R1-block-fold1

## Resumen

GeoNUSAF Stage 4 - SegNeXt-T - arm R1 - block fold 1 es un modelo de segmentación semántica para imágenes de teledetección, desarrollado por sugam24. Su objetivo es clasificar el uso del suelo en el valle de Katmandú (Nepal) en seis clases: residencial, carretera, río, bosque, terreno sin usar y agrícola. El modelo se basa en la arquitectura SegNeXt (NeurIPS 2022), concretamente un encoder MSCAN-T con un decoder LightHamHead, y cuenta con 4,23 millones de parámetros, lo que lo hace ligero y adecuado para despliegue en entornos con recursos limitados.

La relevancia de este modelo radica en su enfoque de entrenamiento híbrido: combina 804 imágenes reales con 804 imágenes sintéticas generadas en una etapa previa (stage 3), lo que busca mejorar la generalización en escenarios con pocos datos etiquetados. El modelo se valida exclusivamente sobre 136 teselas reales, sin píxeles sintéticos, y reporta un mIoU de 0,5337. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MSCAN-T encoder + LightHamHead decoder (SegNeXt, NeurIPS 2022) |
| Parametros totales | 4,23 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador, procesa imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegNeXt, presentada en NeurIPS 2022. El encoder es un MSCAN-T (Multi-Scale Convolutional Attention Network) preentrenado en ImageNet-1K, del cual se cargaron el 100% de los tensores. El decoder es un LightHamHead (Lightweight Hamburger) que fusiona las características de las etapas 1, 2 y 3 con un stride de 8. El diseño ligero (4,23 M de parámetros) busca un equilibrio entre precisión y eficiencia computacional.

El entrenamiento se realizó durante 6000 pasos con un calentamiento de 500 pasos y un decaimiento coseno hasta 6000. La tasa de aprendizaje fue de 0,0006 para el decoder y de 6e-05 para el encoder. Se utilizaron pesos de clase derivados de los datos reales y una semilla fija (42). El conjunto de entrenamiento consta de 1608 pares imagen-etiqueta: 804 reales y 804 sintéticos procedentes del dataset `sugam24/geonusaf-stage3-fakepairs-block-fold1` (arm R1). La validación se realizó sobre 136 teselas reales del fold 1, sin ningún píxel sintético. El modelo guarda en `best.pt` los pesos del estado del modelo (EMA si está activado), la arquitectura, la configuración y las métricas.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando píxeles en seis clases: residencial, carretera, río, bosque, terreno sin usar y agrícola.
- Procesamiento de imágenes de alta resolución de zonas urbanas y periurbanas, con un campo receptivo multiescala gracias al encoder MSCAN.
- Manejo de clases desbalanceadas mediante pesos de clase calculados sobre los datos reales.
- Entrenamiento con datos sintéticos adicionales para mejorar la robustez en escenarios con escasez de anotaciones reales.
- Inferencia eficiente gracias a su bajo número de parámetros (4,23 M), apta para entornos con recursos computacionales limitados.
- Soporte para `ignore_index=255`, lo que permite excluir regiones no etiquetadas durante el entrenamiento y la evaluación.

## Casos de uso

- Monitoreo del crecimiento urbano: el modelo puede identificar áreas residenciales en imágenes satelitales de distintas fechas, permitiendo cuantificar la expansión de la mancha urbana en el valle de Katmandú y otras regiones con características similares.
- Gestión de infraestructuras viarias: la clase "carretera" (IoU 0,3903) permite cartografiar la red de transporte, aunque con una precisión moderada, útil para planificación de mantenimiento y estudios de accesibilidad.
- Conservación de recursos hídricos: la detección de ríos (IoU 0,3526) ayuda a monitorear cambios en cauces y a evaluar riesgos de inundación en zonas ribereñas.
- Agricultura de precisión: la clase "agrícola" (IoU 0,5845) puede emplearse para estimar superficies cultivadas y apoyar la gestión de cultivos, especialmente en regiones con parcelas pequeñas.
- Gestión forestal: la clase "bosque" (IoU 0,7424) permite realizar un seguimiento de la cobertura arbórea, detectar deforestación o evaluar el impacto de incendios.
- Planificación territorial y detección de cambios: al clasificar también "terreno sin usar" (IoU 0,2861), el modelo puede alimentar sistemas de información geográfica para identificar terrenos baldíos y apoyar decisiones de zonificación.

## Benchmarks y rendimiento

Los resultados de validación (136 teselas reales del fold 1) se muestran a continuación. La validación no contiene píxeles sintéticos.

| Metrica | Valor |
|---|---|
| mIoU | 0,5337 |
| mF1 | 0,6724 |
| OA (Overall Accuracy) | 0,8233 |
| Kappa | 0,6906 |

Rendimiento por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8464 | 0,9168 |
| Road | 0,3903 | 0,5615 |
| River | 0,3526 | 0,5214 |
| Forest | 0,7424 | 0,8522 |
| UnusedLand | 0,2861 | 0,4449 |
| Agricultural | 0,5845 | 0,7377 |

Estos valores indican un buen desempeño en clases dominantes como residencial y bosque, pero una precisión notablemente menor en carreteras, ríos y terrenos sin usar, probablemente debido a su menor representación o a la dificultad intrínseca de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 4,23 M de parámetros, el modelo ocupa aproximadamente 17 MB en float32. Con overhead de activaciones y buffers, se estima un consumo inferior a 500 MB para imágenes de tamaño moderado (por ejemplo, 512x512 píxeles).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU con tiempos de inferencia aceptables (del orden de segundos por imagen).
- Compatibilidad con hardware de bajo consumo: por su tamaño reducido, es adecuado para dispositivos edge como Jetson Nano o Raspberry Pi con aceleración (Coral TPU no es directamente compatible sin conversión, pero la inferencia en CPU es viable).
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, FastAPI o integrarse en pipelines de procesamiento de imágenes. Para producción a mayor escala, se puede convertir a ONNX o TensorRT para acelerar la inferencia.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de una imagen 512x512 debería tomar menos de 50 ms. En CPU, puede rondar 1-2 segundos por imagen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (misma arquitectura, tamaño o tarea) dentro de los datos proporcionados. La model card menciona una variante "R0" (sin datos sintéticos) del mismo fold, pero no se ofrecen métricas para comparar. Otros modelos de segmentación remota como U-Net, DeepLabV3 o Swin-UperNet existen en la literatura, pero no se han evaluado en este mismo conjunto de datos, por lo que no es posible establecer una comparación directa con datos reales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el valle de Katmandú; su rendimiento en otras regiones geográficas o con otras características espectrales puede degradarse significativamente.
- Las clases "carretera", "río" y "terreno sin usar" presentan IoU bajos (0,39, 0,35 y 0,29 respectivamente), lo que limita su uso en aplicaciones que requieran alta precisión en estas categorías.
- La inclusión de datos sintéticos puede introducir sesgos si la distribución sintética difiere de la real; aunque la validación excluye píxeles sintéticos, el modelo podría estar sobreajustado a las características de los datos generados.
- No se especifican detalles sobre la resolución de las imágenes de entrada ni sobre el preprocesamiento requerido, lo que puede dificultar la reproducción exacta.
- El modelo se proporciona en formato PyTorch (.pt), sin cuantizaciones precalculadas; para despliegue en hardware específico puede ser necesario convertirlo a otros formatos.
- No se han publicado resultados de benchmarks externos (por ejemplo, en conjuntos de datos estándar como Cityscapes o DeepGlobe), por lo que su rendimiento general fuera del dominio de entrenamiento no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-s4-segnext-t-R1-block-fold1
- Modelo variante R0 (misma etapa, sin datos sintéticos): https://huggingface.co/sugam24/geonusaf-s4-segnext-t-R0-block-fold1
- Dataset de pares sintéticos (stage 3): https://huggingface.co/sugam24/geonusaf-stage3-fakepairs-block-fold1 (referenciado en la model card, sin URL directa en los datos proporcionados)

# sugam24/geonusaf-unetformer-r18-block-fold1

## Resumen

El modelo `sugam24/geonusaf-unetformer-r18-block-fold1` es un sistema de segmentación semántica para teledetección, desarrollado por el usuario sugam24, que clasifica el uso del suelo en el Valle de Katmandú (Nepal) en seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Se basa en la arquitectura UNetFormer con encoder ResNet-18 preentrenado en ImageNet, y emplea un decoder con atención global-local, tal como se describe en la implementación independiente de Wang et al. (2022). El modelo se publica como un checkpoint de un experimento de validación cruzada por bloques (fold 1 de 3), con una resolución efectiva de 0,586 m/px y entrada de 512x512 píxeles.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos de teledetección de alta resolución. Al estar entrenado específicamente para el Valle de Katmandú, ofrece una solución adaptada a un contexto geográfico concreto, aunque su arquitectura general podría transferirse a otras regiones con ajuste fino. El repositorio contiene un checkpoint (`best.pt`) con los pesos del modelo, la configuración y las métricas de validación, lo que facilita su reproducción y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNetFormer con encoder ResNet-18 (timm, ImageNet) y decoder de atención global-local |
| Parametros totales | no disponible (estimacion: ~30-40 M, basada en ResNet-18 + decoder UNetFormer) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512) |
| Tipos de cuantizacion | no disponible (repo en PyTorch, probablemente fp32) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (checkpoint `best.pt` con `model_state`, `cfg` y `metrics`) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de UNetFormer propuesto por Wang et al. (2022), con un encoder ResNet-18 (preentrenado en ImageNet) que extrae características multiescala y un decoder que combina atención global y local para refinar la segmentación. El modelo se entrena con una función de pérdida auxiliar (peso 0,4) además de la pérdida principal, lo que mejora la regularización. El entrenamiento se realizó con AdamW (weight decay 0,0001), tasas de aprendizaje de 0,0006 para el decoder y 6e-05 para el encoder, y se detuvo en la época 16 según el mejor rendimiento en validación.

Los datos de entrenamiento corresponden a imágenes de teledetección del Valle de Katmandú con una resolución efectiva de 0,586 m/px, normalizadas con estadísticas de ImageNet. La validación se realizó mediante validación cruzada por bloques (block split), que divide el conjunto en bloques secuenciales según un orden de exportación proxy, no mediante división espacial. Esta elección puede introducir cierta correlación espacial entre particiones, lo que debe tenerse en cuenta al interpretar las métricas. El modelo clasifica seis clases con `ignore_index=255` para píxeles no etiquetados.

## Capacidades

- Segmentación semántica de uso del suelo en imágenes de teledetección de alta resolución.
- Clasificación de seis clases específicas: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Entrada de 512x512 píxeles con normalización ImageNet y GSD efectivo de 0,586 m/px.
- Soporte de inferencia con PyTorch estándar; no se documentan capacidades adicionales como detección de objetos o procesamiento de secuencias.
- No se menciona soporte para tool calling, agentes, ni capacidades multimodales más allá de la visión.

## Casos de uso

- Planificación urbana: el modelo puede identificar zonas residenciales y carreteras en imágenes aéreas, facilitando la actualización de mapas catastrales y la detección de expansión urbana no planificada.
- Monitoreo ambiental: la clasificación de bosques, ríos y suelo no utilizado permite evaluar cambios en la cobertura vegetal, la erosión o la degradación de ecosistemas en el Valle de Katmandú.
- Gestión de recursos agrícolas: la detección de áreas agrícolas ayuda a estimar superficies de cultivo y a monitorizar cambios estacionales, útil para políticas de seguridad alimentaria.
- Respuesta a desastres: tras inundaciones o deslizamientos, la segmentación rápida de carreteras y ríos puede apoyar la planificación de rutas de evacuación y evaluación de daños.
- Investigación académica: el checkpoint y la configuración publicados permiten reproducir los experimentos y comparar con otras arquitecturas de segmentación en el mismo conjunto de datos.
- Transferencia a otras regiones: aunque entrenado para Katmandú, el modelo puede servir como punto de partida para ajuste fino en otras zonas urbanas con características similares.

## Benchmarks y rendimiento

Los resultados de validación proporcionados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU (validacion) | 0,4993 |
| mF1 (validacion) | 0,6427 |
| OA (validacion) | 0,8085 |
| Kappa (validacion) | 0,6442 |

Rendimiento por clase (validacion):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,8383 | 0,9120 |
| Road | 0,3339 | 0,5006 |
| River | 0,3880 | 0,5591 |
| Forest | 0,6584 | 0,7940 |
| UnusedLand | 0,2503 | 0,4004 |
| Agricultural | 0,5268 | 0,6901 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Las clases con menor rendimiento son Road, River y UnusedLand, lo que sugiere dificultades en la separacion de estas categorias, posiblemente por su heterogeneidad o solapamiento espectral.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la informacion disponible.
- Dado que el modelo usa un encoder ResNet-18 (relativamente ligero) y una entrada de 512x512, se estima que la inferencia en fp32 requiere aproximadamente 2-4 GB de VRAM, lo que permite su ejecucion en GPUs de consumo como NVIDIA GTX 1660 Super, RTX 2060 o superiores.
- Para entrenamiento o ajuste fino, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 3080 o A100) para manejar el lote y la memoria del optimizador.
- El despliegue puede realizarse con PyTorch estándar, o mediante herramientas como TorchServe, ONNX Runtime o TensorRT para optimizacion en produccion. No se menciona soporte para llama.cpp, vLLM u Ollama, ya que no es un modelo de lenguaje.
- La latencia estimada para una imagen 512x512 en una GPU moderna es del orden de decenas de milisegundos, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente para el Valle de Katmandú; su rendimiento en otras regiones o con diferentes condiciones atmosfericas o de sensor puede degradarse significativamente.
- La validacion cruzada por bloques (block split) no es espacial, por lo que las metricas pueden estar optimistas si existe correlacion espacial entre bloques adyacentes.
- Las clases Road, River y UnusedLand presentan IoU bajos (0,33, 0,39 y 0,25 respectivamente), lo que indica errores de segmentacion considerables en estas categorias.
- No se especifica la licencia de uso; se recomienda contactar al autor antes de cualquier uso comercial.
- No se documentan sesgos especificos, pero al ser un modelo de vision entrenado con datos de una region concreta, puede heredar sesgos geograficos y de cobertura del suelo.
- El checkpoint contiene solo el estado del modelo y la configuracion; no se incluyen datos de entrenamiento ni el codigo completo, lo que limita la reproducibilidad total.

## Enlaces

- Repositorio HuggingFace: [sugam24/geonusaf-unetformer-r18-block-fold1](https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold1)
- Referencia de la arquitectura: Wang et al. (2022), ISPRS J. Photogramm. Remote Sens. 190:196-214 (implementacion independiente, el repositorio original es GPL-3.0).

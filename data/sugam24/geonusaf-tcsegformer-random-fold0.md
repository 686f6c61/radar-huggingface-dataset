# sugam24/geonusaf-tcsegformer-random-fold0

## Resumen

El modelo `sugam24/geonusaf-tcsegformer-random-fold0` es un sistema de segmentación semántica de imágenes de satélite desarrollado por sugam24 para el mapeo de usos del suelo en el valle de Katmandú (Nepal). Se basa en el backbone SegFormer-B0 preentrenado en ADE20K y está ajustado sobre el dataset GeoNUSAF, que cubre seis clases de cobertura terrestre a una resolución de 0,586 metros por píxel. El modelo forma parte de un experimento de validación cruzada con tres particiones (random, block y sequence-block), siendo esta la partición aleatoria correspondiente al fold 0.

La relevancia de este modelo radica en su aplicación práctica para la teledetección y la planificación urbana en regiones con datos limitados. Al emplear una arquitectura transformer ligera (SegFormer-B0) y técnicas de regularización como CSA reweighting y soft-clDice, consigue un equilibrio entre precisión y eficiencia computacional, lo que lo hace adecuado para despliegue en entornos con recursos moderados. Sin embargo, los resultados de validación muestran un rendimiento desigual entre clases, con buenos resultados en residencial y bosque, pero bajos en carretera y río.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (backbone preentrado en ADE20K) |
| Parametros totales | no disponible (SegFormer-B0, tamano aproximado 3,7M, no confirmado) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imagenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,6 GB, probablemente safetensors o binario) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SegFormer, un transformer jerárquico diseñado para segmentación semántica. El backbone concreto es `nvidia/segformer-b0-finetuned-ade-512-512`, es decir, la variante B0 preentrenada en el dataset ADE20K con resolución de entrada de 512x512. Sobre este backbone se añade una cabeza de segmentación que produce mapas de probabilidad por píxel para seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.

El entrenamiento se realizó sobre el dataset GeoNUSAF, que cubre el valle de Katmandú con imágenes a 0,586 m/px. Se utilizó una partición aleatoria (random split) como proxy del orden de exportación de las imágenes, con validación cruzada de 3 folds; este modelo corresponde al fold 0 con semilla 42. La mejor época fue la 17. Se aplicaron varias técnicas de mejora: reweighting por clases CSA (con tau = [0.6, 0.35, 0.35, 0.6, 0.6, 0.6] y w_min = 0.25), pérdida soft-clDice con mu = 0.3, y un muestreador balanceado para mitigar el desequilibrio entre clases. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Segmentación semántica de imágenes de satélite: clasifica cada píxel en una de seis categorías de uso del suelo.
- Procesamiento de imágenes de alta resolución (512x512 a 0,586 m/px).
- Detección de áreas residenciales, carreteras, ríos, bosques, suelo no utilizado y zonas agrícolas.
- No soporta generación de texto, tool calling, agentes ni razonamiento multimodal; es un modelo puramente visual de segmentación.

## Casos de uso

- Planificación urbana: el modelo puede identificar zonas residenciales y de suelo no utilizado para apoyar decisiones de expansión urbana o regulación del uso del suelo en el valle de Katmandú.
- Monitoreo ambiental: la detección de bosques y ríos permite seguir cambios en la cobertura vegetal y los cuerpos de agua a lo largo del tiempo, útil para estudios de impacto ambiental.
- Gestión de infraestructuras: la segmentación de carreteras ayuda a actualizar mapas viales y a planificar mantenimiento o nuevas rutas, aunque su precisión en esta clase es limitada (IoU 0,2958).
- Agricultura de precisión: la clase agrícola (IoU 0,4552) permite delimitar parcelas de cultivo y estimar superficies productivas, apoyando políticas agrarias.
- Respuesta ante desastres: en caso de inundaciones o deslizamientos, el modelo puede ayudar a identificar rápidamente zonas afectadas comparando segmentaciones temporales.
- Investigación académica: sirve como punto de partida para experimentos con técnicas de segmentación en entornos de datos limitados, dado su tamaño reducido y su enfoque en regularización.

## Benchmarks y rendimiento

Los resultados de validación para el fold 0 (random split) son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4623 |
| mF1 | 0,6081 |
| OA (Overall Accuracy) | 0,7534 |
| Kappa | 0,6340 |

Desglose por clase:

| Clase | IoU | UA (precision) | PA (recall) |
|---|---|---|---|
| Residencial | 0,7911 | 0,9104 | 0,8579 |
| Carretera | 0,2958 | 0,3488 | 0,6607 |
| Rio | 0,2496 | 0,3312 | 0,5034 |
| Bosque | 0,6575 | 0,8059 | 0,7812 |
| Suelo no utilizado | 0,3246 | 0,4384 | 0,5558 |
| Agricola | 0,4552 | 0,6488 | 0,6040 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPU recomendada o latencia.
- Dado que el backbone es SegFormer-B0 (un modelo ligero de aproximadamente 3,7 millones de parametros), es previsible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero esta afirmacion es una estimacion no confirmada.
- El tamaño del repositorio es de 0,6 GB, lo que sugiere que los pesos ocupan menos de 600 MB, compatible con inferencia en CPU para imagenes individuales, aunque con mayor latencia.
- Para despliegue en produccion, se podrian usar frameworks como ONNX Runtime, TensorRT o TorchServe, pero no hay configuraciones documentadas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma tarea y dataset. El autor ha publicado otras variantes (por ejemplo, `geonusaf-tcsegformer-block-fold1` y `geonusaf-unetformer-r18-random-fold0`), pero no se proporcionan metricas comparativas entre ellas en la documentacion disponible.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente con imagenes del valle de Katmandú; su generalizacion a otras regiones geograficas o escalas no esta garantizada.
- Las clases minoritarias (carretera, rio, suelo no utilizado) presentan IoU bajos (0,25-0,32), lo que indica errores frecuentes de segmentacion en estas categorias.
- La licencia no esta especificada, por lo que no se puede determinar si es apto para uso comercial sin consultar al autor.
- No se documentan sesgos especificos, pero el desequilibrio de clases y la limitacion geografica pueden introducir sesgos en las predicciones.
- El modelo no soporta entrada de texto ni interaccion conversacional; es exclusivamente un clasificador de imagenes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sugam24/geonusaf-tcsegformer-random-fold0
- Variante con block split (fold 1): https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1
- Variante con UnetFormer (random fold 0): https://huggingface.co/sugam24/geonusaf-unetformer-r18-random-fold0

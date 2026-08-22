# sugam24/geonusaf-tcsegformer-block-fold1-no_detail

## Resumen

GeoNUSAF TC-SegFormer (no_detail) es un modelo de segmentación semántica diseñado para clasificar el uso del suelo en imágenes de satélite de alta resolución del valle de Katmandú (Nepal). Desarrollado por el usuario sugam24, este modelo emplea una arquitectura SegFormer-B0 preentrenada sobre el dataset ADE20K y ajustada para reconocer seis clases terrestres: residencial, carretera, río, bosque, suelo no utilizado y agrícola. El modelo se enmarca en un estudio de validación cruzada por bloques (block split) y representa el pliegue 1 de 3, con una configuración de ablación que omite el "detail path" para evaluar el impacto de esta componente.

La relevancia de este modelo radica en su aplicación práctica para la planificación urbana y el monitoreo ambiental en regiones con datos geoespaciales limitados. Al trabajar a una resolución de 0.586 m/píxel y con parches de 512×512 píxeles, ofrece una herramienta de bajo coste computacional para cartografiar usos del suelo. El modelo incorpora técnicas avanzadas de entrenamiento como reweighting por clases (CSA), pérdida soft-clDice y muestreo balanceado, lo que mejora el rendimiento en clases minoritarias como ríos y carreteras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (transformer jerárquico para visión) |
| Parametros totales | no disponible (el backbone SegFormer-B0 tiene ~3.7M, pero no se especifica el total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, no textual) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en SegFormer-B0, un transformer jerárquico para segmentación semántica que combina un encoder con atención por ventanas y un decoder ligero basado en MLP. El backbone se inicializa con los pesos de `nvidia/segformer-b0-finetuned-ade-512-512`, preentrenado en ADE20K, y se ajusta sobre el dataset GeoNUSAF del valle de Katmandú. La resolución de entrada es de 512×512 píxeles con una escala de 0.586 m/píxel, y se emplea `ignore_index=255` para píxeles no etiquetados.

El entrenamiento incorpora varias innovaciones: un esquema de reweighting por clases (CSA) con tau específicos por clase y un peso mínimo de 0.25, una pérdida soft-clDice con mu=0.3 para mejorar la segmentación de estructuras finas, y un muestreador balanceado para mitigar el desequilibrio de clases. La validación se realiza mediante una partición por bloques (sequence-block cross-validation) que respeta la correlación espacial, y el pliegue 1 de 3 se entrena durante 27 épocas con semilla 42. La configuración `no_detail` desactiva el "detail path", un componente opcional que podría añadir información de bordes o texturas de alta frecuencia.

## Capacidades

- Segmentación semántica de imágenes aéreas y de satélite, clasificando cada píxel en una de seis clases de uso del suelo: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Inferencia a alta resolución (0.586 m/px) con parches de 512×512, adecuada para ortofotos y productos de sensores remotos.
- Manejo de desequilibrios de clases mediante técnicas de reweighting y pérdida soft-clDice, mejorando la detección de clases minoritarias como ríos y carreteras.
- Generalización dentro del valle de Katmandú gracias a la validación por bloques, que evalúa la capacidad de extrapolación a áreas no vistas.
- Compatibilidad con el ecosistema Hugging Face Transformers, permitiendo integración con pipelines de segmentación existentes.
- No soporta tareas generativas ni multimodales; es un modelo puramente discriminativo para visión.

## Casos de uso

- Planificación urbana: el modelo puede cartografiar automáticamente zonas residenciales, carreteras y espacios verdes, facilitando la actualización de catastros y la detección de asentamientos informales en el valle de Katmandú.
- Monitoreo de cambios de uso del suelo: al comparar segmentaciones de diferentes fechas, permite identificar expansión urbana, deforestación o cambios en cauces fluviales, con aplicaciones en estudios ambientales.
- Gestión de riesgos naturales: la detección precisa de ríos y suelos no utilizados ayuda a modelar inundaciones y deslizamientos, mejorando los sistemas de alerta temprana.
- Inventario agrícola: la clasificación de áreas agrícolas permite estimar superficies de cultivo y apoyar políticas de seguridad alimentaria en la región.
- Infraestructura vial: la segmentación de carreteras, aunque con menor precisión (IoU 0.37), puede servir como entrada para actualizar mapas de red vial en zonas rurales.
- Investigación en teledetección: el modelo sirve como baseline para experimentos de ablación y comparación con otras arquitecturas (p.ej., UNetFormer) en el mismo dataset.

## Benchmarks y rendimiento

Los resultados de validación del pliegue 1 se presentan a continuación. No se han publicado comparaciones con otros modelos en la información disponible, por lo que estos números son los únicos datos objetivos.

| Metrica | Valor |
|---|---|
| mIoU | 0.4788 |
| mF1 | 0.6159 |
| Exactitud global (OA) | 0.7945 |
| Coeficiente kappa | 0.6432 |

| Clase | IoU | UA (precision) | PA (recall) |
|---|---|---|---|
| Residencial | 0.8214 | 0.9556 | 0.8540 |
| Carretera | 0.3713 | 0.4706 | 0.6377 |
| Rio | 0.2155 | 0.2287 | 0.7882 |
| Bosque | 0.6971 | 0.9312 | 0.7349 |
| Suelo no utilizado | 0.2357 | 0.5265 | 0.2991 |
| Agricola | 0.5318 | 0.5651 | 0.9003 |

El rendimiento es notablemente alto para las clases residencial y bosque, mientras que las clases de río y suelo no utilizado presentan IoU bajos, lo que indica dificultad para segmentar elementos lineales o con alta variabilidad espectral.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de VRAM, GPU recomendadas o latencia en la información proporcionada.
- Dado que el backbone es SegFormer-B0, un modelo ligero (~3.7M parámetros), se espera que la inferencia sea viable en GPUs de consumo como una NVIDIA GTX 1060 o superior, con un consumo de VRAM inferior a 2 GB para parches de 512×512.
- Para despliegue en producción, se recomienda usar frameworks como Hugging Face Transformers con PyTorch, o convertirlo a ONNX para inferencia optimizada en CPU/GPU.
- No se han documentado opciones de cuantización específicas, aunque al ser un modelo pequeño podría cuantizarse a INT8 sin pérdidas significativas.

## Comparativa con modelos similares

Se identifican dos variantes del mismo autor en Hugging Face, pero no se dispone de sus métricas detalladas:

| Modelo | Split | Fold | Configuracion | mIoU (validacion) |
|---|---|---|---|---|
| `geonusaf-tcsegformer-block-fold1-no_detail` (este) | block | 1 | no_detail | 0.4788 |
| `geonusaf-tcsegformer-random-fold2` | random | 2 | no especificado | no disponible |
| `geonusaf-unetformer-r18-block-fold0` | block | 0 | UNetFormer + ResNet-18 | no disponible |

La comparación directa no es posible sin más datos. Se recomienda consultar los repositorios individuales para obtener métricas adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con imágenes del valle de Katmandú a una resolución específica (0.586 m/px). Su aplicación a otras regiones geográficas o resoluciones diferentes puede degradar significativamente el rendimiento.
- La clase "río" presenta un IoU muy bajo (0.2155), lo que limita su uso en aplicaciones hidrológicas críticas donde se requiera alta precisión.
- No se ha publicado información sobre la licencia del modelo ni sobre los datos de entrenamiento, por lo que no se puede garantizar su uso comercial o su reproducibilidad.
- El modelo no maneja imágenes multiespectrales (p.ej., infrarrojo) ni datos LiDAR; está limitado a imágenes RGB o de tres canales.
- Al ser un modelo discriminativo, no genera texto ni respuestas; su salida es un mapa de etiquetas por píxel.
- No se han documentado sesgos específicos, pero es probable que existan desequilibrios en la representación de clases, como se refleja en las métricas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugam24/geonusaf-tcsegformer-block-fold1-no_detail
- Variante con random split (fold 2): https://huggingface.co/sugam24/geonusaf-tcsegformer-random-fold2
- Variante UNetFormer (block fold 0): https://huggingface.co/sugam24/geonusaf-unetformer-r18-block-fold0
- Repositorio GitHub del autor (proyecto ControlNet para imágenes de satélite): https://github.com/sugam24/Stable-diffusion-with-control-net

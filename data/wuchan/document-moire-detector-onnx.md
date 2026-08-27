# WUCHAN/document-moire-detector-ONNX

## Resumen

El modelo `WUCHAN/document-moire-detector-ONNX` es una conversión a formato ONNX del clasificador de imágenes `Jwalit/document-moire-detector`, un Vision Transformer (DeiT-small) ajustado para detectar patrones moiré en imágenes de documentos. El moiré es un artefacto visual que aparece al fotografiar o escanear pantallas, y degrada la calidad de los documentos digitalizados. Este modelo resuelve ese problema mediante una clasificación binaria: distingue entre imágenes limpias y aquellas que contienen artefactos moiré.

La versión ONNX está pensada para su uso con `transformers.js`, lo que permite ejecutar el modelo directamente en el navegador o en entornos JavaScript sin necesidad de un backend de Python. El modelo base tiene 22 millones de parámetros y una resolución de entrada de 224×224 píxeles. Su relevancia actual radica en la creciente necesidad de automatizar el control de calidad en flujos de digitalización documental, donde la detección temprana de artefactos evita costes de reprocesado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT-small (Vision Transformer, patch 16×16) |
| Parametros totales | 22 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (entrada de imagen 224×224) |
| Tipos de cuantizacion | no disponible (formato ONNX, posible cuantizacion no documentada) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo base es `facebook/deit-small-patch16-224`, un Vision Transformer con 22 millones de parametros. Se realizo un ajuste fino (fine-tuning) con 8.000 imagenes sinteticas (4.000 limpias y 4.000 con moire) generadas mediante seis tecnicas diferentes: aliasing por reescalado, superposicion de patrones sinusoidales, interferencia multifrecuencia, simulacion de pantalla, moire sutil de baja intensidad y moire localizado en regiones elipticas. El entrenamiento uso 5 epocas, una tasa de aprendizaje de 3e-5 con programacion coseno, batch efectivo de 64, label smoothing de 0.05 y 60 pasos de calentamiento. El mejor checkpoint se selecciono por F1 en la epoca 2. La conversion a ONNX se realizo automaticamente mediante el espacio de Hugging Face `onnx-community/convert-to-onnx`, sin modificaciones adicionales de la arquitectura.

## Capacidades

- Clasificacion binaria de imagenes: detecta si una imagen de documento contiene artefactos moire (etiqueta `moire`) o no (etiqueta `clean`).
- Entrada de imagen de 224×224 píxeles, compatible con el pipeline `image-classification` de Transformers.js.
- Ejecucion en navegador o Node.js gracias al formato ONNX y la libreria `transformers.js`.
- No soporta tool calling, agentes, generacion de texto ni capacidades multimodales mas alla de la clasificacion de imagenes.
- No es multilingue: el modelo no procesa texto, solo imagenes.

## Casos de uso

- Control de calidad en digitalizacion documental: el modelo puede integrarse en un pipeline de escaneo para detectar automaticamente paginas con moire y reenviarlas a un proceso de reescaneo o correccion, evitando que documentos defectuosos lleguen al archivo final.
- Deteccion de capturas de pantalla en repositorios de imagenes: en sistemas de gestion documental, el modelo puede filtrar imagenes que provienen de fotografias de pantalla (comun en actas, informes o presentaciones) y marcarlas para su revision manual.
- Preprocesamiento en flujos OCR: antes de aplicar un motor de reconocimiento optico de caracteres, el modelo puede descartar o limpiar imagenes con moire, ya que este artefacto degrada significativamente la precision del OCR.
- Verificacion de calidad en aplicaciones moviles de escaneo: una app de escaneo puede usar el modelo (via ONNX en el dispositivo) para avisar al usuario en tiempo real de que la imagen capturada contiene moire y sugerirle reencuadrar o cambiar el angulo.
- Automatizacion de triage en sistemas de tickets: en plataformas de soporte donde los usuarios adjuntan fotos de pantallas o documentos, el modelo puede clasificar las imagenes entrantes y priorizar aquellas que requieren intervencion humana por baja calidad.
- Analisis de lotes en investigacion: para conjuntos de datos de documentos historicos digitalizados, el modelo puede anotar automaticamente que imagenes presentan artefactos moire, facilitando la limpieza del corpus antes de su uso en entrenamiento de otros modelos.

## Benchmarks y rendimiento

Los resultados del modelo base (Jwalit/document-moire-detector) se recogen en la model card. La version ONNX no incluye benchmarks propios, pero al ser una conversion directa, se espera un rendimiento equivalente.

| Metrica | Valor |
|---|---|
| Accuracy | 99.12 % |
| F1 Score | 0.9913 |
| Precision | 98.52 % |
| Recall | 99.75 % |
| Eval Loss | 0.170 |

Comparacion con la version V1 (DeiT-tiny, 5.5M parametros):

| Metrica | V1 (DeiT-tiny) | V2 (DeiT-small) |
|---|---|---|
| Accuracy | 99.5 % | 99.1 % |
| F1 Score | 0.995 | 0.991 |
| Precision | 99.3 % | 98.5 % |
| Recall | 99.7 % | 99.8 % |

La V2 sacrifica ligeramente precision para lograr un recall casi perfecto, lo que significa que detecta practicamente todos los patrones moire, incluidos los muy sutiles, a costa de un 1.5 % de falsos positivos.

## Requisitos de hardware

- Al ser un modelo de 22 millones de parametros en formato ONNX, la inferencia es viable en CPU. El tamano del repositorio es de 0.2 GB, por lo que la VRAM necesaria es inferior a 1 GB si se usa GPU.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti o superior) para inferencia en lotes. En CPU, un procesador moderno de 4 nucleos puede ejecutar la clasificacion en decenas de milisegundos por imagen.
- Es adecuado para hardware de consumo: puede ejecutarse en un Raspberry Pi 4 o en un navegador web mediante `transformers.js` sin necesidad de GPU.
- Opciones de despliegue: `transformers.js` (navegador y Node.js), ONNX Runtime (Python, C++, Java), o cualquier runtime compatible con ONNX.
- Latencia estimada: en CPU moderna, entre 20 y 50 ms por imagen a 224×224; en GPU, inferior a 5 ms. No se dispone de datos de throughput oficiales.

## Comparativa con modelos similares

No se han encontrado modelos publicados especificamente para deteccion de moire en documentos con los que comparar directamente. La unica referencia disponible es la version V1 del mismo autor (DeiT-tiny), ya mencionada en la seccion de benchmarks. Otros modelos de clasificacion de calidad de imagen (como NIMA o BRISQUE) abordan problemas relacionados pero no detectan moire de forma especifica. Por tanto, la comparativa se limita a la evolucion interna del modelo.

| Modelo | Parametros | Accuracy | F1 | Licencia |
|---|---|---|---|---|
| document-moire-detector V1 (DeiT-tiny) | 5.5M | 99.5 % | 0.995 | Apache 2.0 |
| document-moire-detector V2 (DeiT-small) | 22M | 99.1 % | 0.991 | Apache 2.0 |
| document-moire-detector-ONNX (este) | 22M | no disponible (equivalente a V2) | no disponible | Apache 2.0 |

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con patrones moire sinteticos generados por seis metodos. Es posible que no capture todas las variaciones reales de moire que aparecen en fotografia de pantallas o escaneos con ciertos tipos de panel LCD.
- Esta optimizado para imagenes de documentos. Su rendimiento en escenas naturales o fotografias generales puede degradarse.
- La resolucion de entrada se limita a 224×224 píxeles. El moire muy sutil presente en imagenes de alta resolucion puede perderse tras el reescalado.
- El modelo tiene un recall mayor que la precision: aproximadamente un 1.5 % de imagenes limpias pueden marcarse erroneamente como moire. Esto es aceptable si el coste de un falso positivo es bajo, pero debe tenerse en cuenta en flujos donde la intervencion manual sea cara.
- La version ONNX no incluye el procesador de imagenes (image processor) en el repositorio; el usuario debe aplicar el mismo preprocesado que el modelo original (reescalado a 224×224, normalizacion con las medias y desviaciones de DeiT).
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar el modelo con un conjunto de datos propio antes de desplegarlo.

## Enlaces

- Modelo ONNX en Hugging Face: https://huggingface.co/WUCHAN/document-moire-detector-ONNX
- Modelo original (Jwalit/document-moire-detector): https://huggingface.co/Jwalit/document-moire-detector
- README del modelo original: https://huggingface.co/Jwalit/document-moire-detector/blob/main/README.md
- Repositorio de modelos ONNX de la comunidad: https://github.com/onnx/models
- Documentacion de pipelines de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageClassificationPipeline

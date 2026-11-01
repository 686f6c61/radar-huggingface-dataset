# Vernard/agriscan-crop-disease-models

## Resumen

AgriScan Crop and Disease Models es un conjunto de dos modelos de visión por computador desarrollados por Vernard para la plataforma AgriScan, impulsada por CDSA – Cross Domain Solution Architect (Pty) Ltd. Ambos modelos se basan en la arquitectura MobileNetV2 con pesos preentrenados en ImageNet y están implementados en TensorFlow/Keras. El primero clasifica imágenes de hojas en tres categorías de cultivo (maíz, patata y tomate), mientras que el segundo clasifica hojas en 17 categorías que cubren enfermedades y estados sanos de esos mismos tres cultivos.

El modelo resuelve un problema acotado: la identificación visual de cultivos y la clasificación preliminar de enfermedades foliares a partir de imágenes de hojas. Su relevancia actual es limitada y experimental; se trata de prototipos de investigación publicados para el desarrollo interno de AgriScan y para experimentación en el ámbito agrícola. No es un modelo de lenguaje ni un modelo multimodal general: son clasificadores de imagen de tamaño reducido, con entrada fija de 224 × 224 píxeles RGB y salida de clase discreta.

El repositorio tiene un tamaño de 0,0 GB según HuggingFace, 55 descargas y ningún "me gusta", lo que refleja su carácter incipiente. La model card advierte explícitamente de que el rendimiento no ha sido validado de forma independiente en condiciones agrícolas reales y de que la precisión reportada para el clasificador de enfermedades está sesgada por una fuga de datos entre validación y test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN, pesos preentrenados en ImageNet) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224 × 224 × 3) |
| Tipos de cuantizacion | no disponible (formato nativo Keras; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase están en inglés) |
| Licencia | other (licencia no especificada en detalle; requiere revisión del autor para uso comercial) |
| Formato de pesos | Keras `.keras` (`agriscan_crop_classifier_best.keras` y `agriscan_mobilenetv2_best.keras`) |

## Arquitectura y entrenamiento

Ambos modelos emplean MobileNetV2, una red neuronal convolucional diseñada para inferencia eficiente en dispositivos con recursos limitados, con pesos inicializados desde ImageNet y adaptados mediante transferencia de aprendizaje a las tareas agrícolas. La entrada es una imagen RGB redimensionada a 224 × 224 píxeles. El pipeline de preprocesamiento original aplica una capa `Rescaling` de Keras con `scale=1/127.5` y `offset=-1`, que mapea los valores de píxel de 0–255 al rango aproximado de -1 a 1; la model card advierte de no aplicar este reescalado dos veces si ya está incluido en el modelo cargado.

El entrenamiento se realizó sobre clases seleccionadas del dataset PlantVillage para maíz, patata y tomate. No se documentan en la información disponible el número de tokens (no aplica), el volumen exacto de imágenes de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de aumento de datos, regularización específica, ajuste fino completo o congelación de capas. Tampoco se indica si hubo optimización de hiperparámetros más allá del proceso estándar de entrenamiento en Keras. La model card reconoce desequilibrio de clases en el dataset de entrenamiento.

La innovación técnica destacable es mínima: se trata de una aplicación estándar de transferencia de aprendizaje con MobileNetV2 sobre un dataset académico de imágenes de hojas. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Clasificación de imágenes de hojas en tres categorías de cultivo: maíz, patata y tomate (modelo `agriscan_crop_classifier_best.keras`).
- Clasificación de imágenes de hojas en 17 categorías de enfermedad y estado sano para maíz, patata y tomate (modelo `agriscan_mobilenetv2_best.keras`).
- Clases de maíz: Cercospora/Gray leaf spot, Common rust, Northern leaf blight y Healthy.
- Clases de patata: Early blight, Late blight y Healthy.
- Clases de tomate: Bacterial spot, Early blight, Late blight, Leaf mold, Septoria leaf spot, Spider mites, Target spot, Tomato Yellow Leaf Curl Virus, Tomato mosaic virus y Healthy.
- Entrada de imagen RGB de 224 × 224 píxeles con preprocesamiento específico documentado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües en el sentido de modelo de lenguaje; las etiquetas de salida están en inglés.
- No dispone de modo "thinking", visión general más allá de la clasificación de hojas, audio ni otras modalidades.

## Casos de uso

- Prototipado de una aplicación móvil de diagnóstico agrícola: el modelo de clasificación de cultivos puede integrarse en una app que, tras capturar una foto de una hoja, determine de qué cultivo se trata antes de invocar el clasificador de enfermedades específico, aprovechando su bajo coste computacional y su formato Keras compatible con TensorFlow Lite.
- Investigación académica sobre transferencia de aprendizaje en agricultura: sirve como línea base reproducible con MobileNetV2 y PlantVillage para comparar con arquitecturas más recientes o con datasets de campo, dado que la model card documenta el pipeline de preprocesamiento y las limitaciones de evaluación.
- Evaluación comparativa de robustez frente a imágenes de campo: el modelo puede emplearse para medir la caída de precisión entre el dataset PlantVillage y fotografías reales de explotaciones, un experimento necesario antes de cualquier despliegue operativo.
- Desarrollo de sistemas de alerta temprana en invernadero: con imágenes controladas y buena iluminación, el clasificador de enfermedades puede generar avisos preliminares sobre patologías como tizón temprano o mildiu en tomate y patata, siempre con revisión humana.
- Herramienta educativa para formación de agricultores: permite mostrar de forma interactiva las diferencias visuales entre enfermedades foliares del maíz, la patata y el tomate, usando las 17 clases documentadas como catálogo de referencia.
- Módulo de preetiquetado en pipelines de anotación: el clasificador puede generar etiquetas iniciales sobre grandes lotes de imágenes de hojas para que anotadores humanos las revisen y corrijan, acelerando la construcción de datasets propios.
- Integración en sistemas de gestión de cultivos (FMS): como componente de un sistema mayor que combine imágenes con datos meteorológicos y de suelo, el modelo puede aportar una señal adicional de clasificación de cultivo o enfermedad, sin sustituir la diagnosis de un especialista.

## Benchmarks y rendimiento

| Modelo | Métrica | Resultado | Conjunto de evaluación | Nota |
|---|---|---|---|---|
| Clasificador de cultivos | Test accuracy | 99,36% | Split de test de PlantVillage (4.841 imágenes) | 4.810 aciertos, 31 errores |
| Clasificador de enfermedades | Validation accuracy | 93,12% | Split usado también como validación durante entrenamiento | Resultado preliminar, no independiente |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no se trata de un modelo de lenguaje. La model card advierte que el resultado del clasificador de enfermedades no constituye una evaluación final independiente porque el split de test se usó también como validación durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de MobileNetV2 (del orden de millones de parámetros), la inferencia cabe holgadamente en GPUs de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA y TensorFlow es suficiente. Para entrenamiento, una GPU de gama media como RTX 3060 o superior es adecuada; para inferencia, CPU o GPU integrada puede bastar.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en dispositivos móviles mediante TensorFlow Lite, aunque no se documentan conversiones ni benchmarks de latencia.
- Opciones de despliegue: TensorFlow/Keras nativo; conversión a TensorFlow Lite o TensorFlow Serving no documentada pero técnicamente posible. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AgriScan Crop and Disease Models | MobileNetV2 | no disponible | Imagen 224 × 224 × 3 | 3 cultivos / 17 enfermedades | other | HuggingFace (55 descargas) |
| MobileNetV2 (ImageNet) | MobileNetV2 | ~3,5 M (referencia de la arquitectura) | Imagen 224 × 224 × 3 | 1.000 clases ImageNet | Apache 2.0 (referencia) | TensorFlow/Keras, TF Hub |
| EfficientNet-B0 (ImageNet) | EfficientNet | ~5,3 M (referencia de la arquitectura) | Imagen 224 × 224 × 3 | 1.000 clases ImageNet | Apache 2.0 (referencia) | TensorFlow/Keras, TF Hub |
| ResNet-50 (ImageNet) | ResNet | ~25,6 M (referencia de la arquitectura) | Imagen 224 × 224 × 3 | 1.000 clases ImageNet | Apache 2.0 (referencia) | TensorFlow/Keras, PyTorch Hub |

La comparativa con modelos de propósito general no es directa porque AgriScan está especializado en tres cultivos y 17 clases de enfermedad, mientras que los modelos de ImageNet cubren 1.000 clases genéricas. No se dispone de benchmarks comparativos publicados entre AgriScan y otros clasificadores agrícolas en la información proporcionada. Los datos de parámetros de MobileNetV2, EfficientNet-B0 y ResNet-50 son de referencia de la arquitectura y no están confirmados en la model card de AgriScan.

## Limitaciones y advertencias

- Generalización limitada: las imágenes de PlantVillage pueden diferir significativamente de fotografías tomadas en explotaciones reales (iluminación, fondo, cámara, estadio de la enfermedad).
- Validación de campo inexistente: el rendimiento no se ha establecido de forma independiente en distintas granjas, estaciones, condiciones de luz, dispositivos, cultivares ni estadios de enfermedad.
- Desequilibrio de clases en el dataset de entrenamiento, lo que puede sesgar las predicciones hacia las clases mayoritarias.
- Fuga de datos en la evaluación del clasificador de enfermedades: el split de test se usó también como validación durante el entrenamiento, por lo que el 93,12% no es una medida final independiente.
- Las puntuaciones de confianza del modelo no están calibradas como probabilidades de acierto.
- Imágenes borrosas, mal iluminadas, obstruidas o mal encuadradas pueden producir predicciones poco fiables.
- Entradas fuera de las tres categorías de cultivo soportadas pueden recibir clasificaciones incorrectas sin señal de rechazo.
- Una predicción no constituye un diagnóstico confirmado de patología vegetal; no debe usarse como única base para seleccionar pesticidas, tratamientos u otras decisiones agrícolas consecuentes.
- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere consultar al autor.
- No se documentan sesgos demográficos ni geográficos específicos más allá de la procedencia del dataset PlantVillage.
- No se proporcionan datos sobre latencia, throughput ni consumo energético en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vernard/agriscan-crop-disease-models
- Dataset PlantVillage (referencia del dataset de entrenamiento): no se proporciona enlace directo en la información disponible.
- Documentación del proyecto AgriScan / CDSA – Cross Domain Solution Architect (Pty) Ltd: no disponible en la información proporcionada.
- Paper o blog técnico del modelo: no disponible en la información proporcionada.
- Repositorio de código: no disponible en la información proporcionada.
- Demo: no disponible en la información proporcionada.

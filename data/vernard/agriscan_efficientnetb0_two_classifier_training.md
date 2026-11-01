# Vernard/AgriScan_EfficientNetB0_Two_Classifier_Training

## Resumen

AgriScan EfficientNetB0 es un par de clasificadores de imágenes basados en EfficientNetB0, desarrollados por el autor Vernard en el marco del proyecto AgriScan, una iniciativa de inteligencia agrícola asociada a CDSA. El repositorio contiene (o está previsto que contenga) dos modelos entrenados de forma independiente: un clasificador de cultivo que distingue entre maíz, patata y tomate, y un clasificador de enfermedad que predice una de 17 clases de condición de cultivo dentro de esas tres especies. Ambos operan sobre imágenes RGB de 224 × 224 píxeles y se distribuyen en formato nativo de Keras (`.keras`).

El modelo resuelve un problema acotado de visión por computador aplicada a la agricultura: la identificación automática del cultivo y la detección de enfermedades foliares a partir de fotografías. Se apoya en transferencia de aprendizaje desde un backbone EfficientNetB0 preentrenado en ImageNet, con un entrenamiento en dos fases (cabeza de clasificación primero, ajuste fino de las capas superiores del backbone después) sobre el conjunto de datos PlantVillage, filtrado a las clases de maíz, patata y tomate.

Es relevante ahora como prototipo de investigación reproducible y ligero (el repositorio ocupa aproximadamente 0,1 GB), pensado para evaluación piloto controlada más que para despliegue operativo. El autor declara explícitamente que no se han publicado métricas de rendimiento porque el entrenamiento debía completarse antes de reportar resultados, y que el modelo es un clasificador de conjunto cerrado, no un detector general de plantas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetB0 (transferencia desde ImageNet) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224 × 224 píxeles) |
| Tipos de cuantización | no disponible (pesos en Keras `.keras`; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | other (licencia no especificada en detalle; revisar términos del repositorio y del dataset) |
| Formato de pesos | Keras `.keras` (TensorFlow/Keras) |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNetB0 con backbone preentrenado en ImageNet, adaptada mediante transferencia de aprendizaje a dos tareas de clasificación independientes. El clasificador de cultivo tiene 3 clases de salida (maíz, patata, tomate) y el clasificador de enfermedad tiene 17 clases de salida definidas en `class_names.json`. La entrada es una imagen RGB redimensionada a 224 × 224 píxeles. El flujo de entrenamiento descrito consiste en entrenar primero la cabeza de clasificación sobre el backbone congelado y después ajustar finamente las capas superiores del backbone.

Los datos de entrenamiento provienen del dataset `mohanty/PlantVillage`, usando los manifiestos `splits/color_train.txt` y `splits/color_test.txt` filtrados a las clases de maíz, patata y tomate. La partición de entrenamiento se divide en subconjuntos de entrenamiento y validación, y la partición de test original se reserva para la evaluación final. No se documentan el número de tokens (no aplica), el número exacto de imágenes, la composición detallada del dataset ni si se aplicaron técnicas de aumento de datos, regularización o calibración. Tampoco se especifica si hubo ajuste de hiperparámetros más allá del esquema de dos fases.

Como innovación técnica destacable, el autor advierte que el backbone de EfficientNetB0 en Keras incluye su propio reescalado de entrada y que no debe aplicarse el preprocesado específico de MobileNetV2 (`Rescaling(1/127.5, offset=-1)`) salvo que se cambie y reentrene la arquitectura. El flujo de inferencia recomendado ejecuta ambos clasificadores de forma secuencial y compara el cultivo predicho por el clasificador de cultivo con el cultivo implícito en la etiqueta de enfermedad; si discrepan o la confianza es baja, debe devolverse un resultado incierto o de revisión.

## Capacidades

- Clasificación de cultivo en tres clases cerradas: maíz, patata y tomate, a partir de imágenes RGB de 224 × 224 píxeles.
- Clasificación de condición de cultivo en 17 clases cerradas que combinan especie y enfermedad, definidas en `class_names.json`.
- Inferencia sobre imágenes individuales mediante Keras/TensorFlow, con salida de probabilidades softmax por clase.
- Flujo de doble clasificador con lógica de contraste entre cultivo predicho y cultivo implícito en la etiqueta de enfermedad.
- Capacidad de servir como componente de un pipeline mayor de cribado fitosanitario, siempre que la aplicación implemente el enrutamiento, la política de confianza y el manejo de discrepancias.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, visión general, audio ni modo de pensamiento. Es exclusivamente un clasificador de imágenes de conjunto cerrado.
- Capacidades multilingües: no aplica; las etiquetas y la documentación están en inglés.

## Casos de uso

- Cribado preliminar de cultivo en aplicaciones móviles de campo: el clasificador de cultivo permite etiquetar rápidamente una fotografía como maíz, patata o tomate antes de derivar la imagen al clasificador de enfermedad, reduciendo el espacio de búsqueda de 17 clases a las condiciones compatibles con esa especie.
- Triaje de imágenes en un servicio de asesoramiento agrícola: el par de clasificadores puede preclasificar las fotos enviadas por agricultores y enrutar los casos de alta confianza a respuestas automáticas y los de baja confianza o discrepancia a revisión por un técnico.
- Prototipado de herramientas de diagnóstico foliar para investigación: al ser un modelo ligero en formato Keras, sirve como línea base reproducible para comparar con arquitecturas mayores o con modelos entrenados en imágenes de campo reales.
- Evaluación piloto controlada en invernadero o parcela experimental: con imágenes capturadas en condiciones similares a PlantVillage, el modelo puede medir la viabilidad de un sistema de alerta temprana de enfermedades en maíz, patata y tomate.
- Componente de un pipeline de visión en el borde: EfficientNetB0 es una arquitectura compacta y el repositorio pesa unos 0,1 GB, lo que facilita su conversión y despliegue en dispositivos con recursos limitados, siempre que se valide la precisión tras la conversión.
- Generación de datasets etiquetados de forma asistida: el modelo puede preetiquetar grandes volúmenes de imágenes de estas tres especies para su posterior revisión humana, acelerando la curación de datos de entrenamiento.
- Educación y demostración técnica: como ejemplo didáctico de transferencia de aprendizaje en dos fases con Keras y de diseño de un flujo de doble clasificador con política de incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las métricas de evaluación deben añadirse tras completar el entrenamiento y que no deben usarse puntuaciones de entrenamiento o validación como resultados de test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para EfficientNetB0 a 224 × 224 en FP32, el modelo es muy ligero y cabe holgadamente en GPUs de consumo; una estimación conservadora sitúa el uso por debajo de 1-2 GB incluyendo el grafo de TensorFlow, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA para TensorFlow/Keras; para entrenamiento o ajuste fino se recomiendan A100, H100 o RTX 4090; para inferencia basta una RTX 3060 o superior, e incluso CPU es viable para lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con al menos 4 GB de VRAM; no confirmado por el autor.
- Opciones de despliegue: TensorFlow Serving, Keras nativo en Python, conversión a TensorFlow Lite para móvil y borde, conversión a ONNX Runtime. No se documentan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AgriScan EfficientNetB0 (este modelo) | EfficientNetB0, dos clasificadores | 3 (cultivo) + 17 (enfermedad) | 224 × 224 RGB | no aplica | other | HuggingFace, Keras `.keras` |
| EfficientNetB0 preentrenado en ImageNet | EfficientNetB0 | 1000 (ImageNet) | 224 × 224 RGB | no aplica | según distribución original | Ampliamente disponible en Keras/TensorFlow |
| MobileNetV2 preentrenado en ImageNet | MobileNetV2 | 1000 (ImageNet) | 224 × 224 RGB | no aplica | según distribución original | Ampliamente disponible en Keras/TensorFlow |
| Clasificadores PlantVillage de la comunidad | Diversas CNN (ResNet, VGG, EfficientNet) | variable (38 clases típicas) | variable | no aplica | variable | Múltiples repositorios en HuggingFace y GitHub |

La comparación con modelos genéricos de ImageNet no es directa porque las tareas difieren: este modelo está especializado en tres cultivos y 17 condiciones, mientras que los backbones genéricos cubren 1000 clases sin relación agrícola. Frente a otros clasificadores de PlantVillage de la comunidad, la diferencia principal es el alcance reducido (solo maíz, patata y tomate) y la ausencia de métricas publicadas, lo que impide una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Clasificador de conjunto cerrado: no es un detector general de plantas y puede asignar una etiqueta no soportada a imágenes que no sean de plantas.
- Solo predice entre las clases presentes en las etiquetas de entrenamiento; las enfermedades desconocidas y otros cultivos no están soportados.
- Las imágenes de PlantVillage pueden diferir de las fotografías de campo de los agricultores en iluminación, fondos, calidad de cámara, geografía, variedades de cultivo y gravedad de la enfermedad, lo que puede degradar la precisión en producción.
- Una puntuación softmax alta no garantiza la corrección y no debe tratarse como probabilidad calibrada sin un trabajo adicional de calibración.
- Las predicciones no sustituyen el asesoramiento agrícola experto ni el diagnóstico de laboratorio.
- Es necesario validar con imágenes de campo representativas antes de cualquier despliegue operativo.
- El orden de las etiquetas en `class_names.json` es significativo; reordenarlas manualmente rompe la correspondencia entre índices de salida y etiquetas.
- No debe aplicarse el preprocesado de MobileNetV2 (`Rescaling(1/127.5, offset=-1)`) salvo que se modifique y reentrene la arquitectura.
- Los dos clasificadores son modelos independientes; la aplicación debe implementar el enrutamiento, la política de confianza y el manejo de discrepancias.
- No se han publicado métricas de evaluación, por lo que no hay evidencia cuantitativa de rendimiento en test.
- Licencia "other" sin detalle: es imprescindible revisar los términos del repositorio y del dataset `mohanty/PlantVillage` antes de un uso comercial o de redistribuir activos derivados.
- Riesgo de sesgo derivado de la composición del dataset PlantVillage, que no se documenta en detalle.
- No se especifican el número de imágenes de entrenamiento, la composición del dataset ni las técnicas de aumento de datos, lo que dificulta evaluar la robustez del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vernard/AgriScan_EfficientNetB0_Two_Classifier_Training
- Dataset PlantVillage en HuggingFace: https://huggingface.co/datasets/mohanty/PlantVillage

# sudhir2016/tomato-blight-resnet18

## Resumen

El modelo `sudhir2016/tomato-blight-resnet18` es un checkpoint de clasificación de imágenes publicado en Hugging Face por el usuario sudhir2016. Por su nombre e identificador, está orientado a la detección de tizón temprano (early blight) o tizón tardío (late blight) en hojas de tomate, una tarea clásica de visión artificial aplicada a la agricultura. El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` y con el pipeline `image-classification`.

La arquitectura subyacente es ResNet-18, una red neuronal convolucional residual de 18 capas (incluyendo capas de convolución y fully connected) introducida por He et al. en 2015. El checkpoint contiene 11.190.216 parámetros, cifra coherente con una ResNet-18 adaptada a clasificación de imágenes, aunque no se especifica el número de clases de salida. No se dispone de información sobre el dataset de entrenamiento, hiperparámetros ni procedimiento de ajuste fino.

La relevancia de este modelo es limitada y fundamentalmente práctica: se trata de un artefacto pequeño (11,19 M de parámetros) que puede ejecutarse en CPU o en GPU de gama baja, lo que lo hace atractivo para despliegues en campo o en dispositivos con recursos restringidos. Sin embargo, la ausencia total de documentación en la model card (generada automáticamente y con todos los campos marcados como "More Information Needed"), la falta de licencia declarada y la ausencia de métricas publicadas impiden validar su calidad o su idoneidad para producción sin una evaluación empírica previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (red neuronal convolucional residual) |
| Parametros totales | 11.190.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, tarea de visión) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es ResNet-18, una CNN residual con bloques de dos capas convolucionales y conexiones de identidad (skip connections) que mitigan el problema del desvanecimiento del gradiente en redes profundas. El checkpoint contiene 11.190.216 parámetros, un tamaño típico de una ResNet-18 con una cabeza de clasificación adaptada al número de clases del problema (probablemente dos o varias clases de enfermedades del tomate, aunque este dato no se especifica). El tag `arxiv:1910.09700` en el repositorio corresponde al artículo de Lacoste et al. sobre el cálculo del impacto ambiental del aprendizaje automático, citado en la plantilla estándar de model card, y no a un paper sobre el propio modelo.

No se dispone de información sobre el dataset de entrenamiento (número de imágenes, composición, procedencia), el régimen de entrenamiento (precisión mixta, número de épocas, optimizador), ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino desde pesos preentrenados en ImageNet. La model card es la plantilla automática de Hugging Face sin rellenar, por lo que todos los apartados de detalles técnicos, datos y evaluación aparecen como "More Information Needed". Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades

- Clasificación de imágenes: el pipeline declarado es `image-classification`, por lo que el modelo está diseñado para asignar una etiqueta a una imagen de entrada.
- Detección de enfermedades en hojas de tomate: por el identificador del modelo (`tomato-blight`), se infiere que las clases de salida están relacionadas con tizón del tomate, aunque no se confirma en la documentación.
- Inferencia ligera: con 11,19 M de parámetros, es adecuado para ejecución en CPU y dispositivos de borde.
- Compatibilidad con `transformers`: puede cargarse mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de visión).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: no disponible (no aplica).
- Capacidades especiales (thinking mode, visión general, audio): únicamente clasificación de imágenes; no se documentan otras capacidades.

## Casos de uso

- Diagnóstico preliminar de enfermedades del tomate en campo: el modelo puede clasificar una imagen de hoja capturada con un teléfono móvil y devolver una etiqueta de enfermedad, sirviendo como primera criba para agricultores sin acceso a un fitopatólogo.
- Aplicación móvil de agricultura de precisión: al tener solo 11,19 M de parámetros, puede integrarse en una app Android o iOS mediante conversión a ONNX o TFLite y ejecutarse en el dispositivo sin conexión a internet.
- Monitorización en invernadero con cámaras trampa: combinado con un pipeline de captura periódica de imágenes, el modelo puede etiquetar hojas de forma automatizada y generar alertas tempranas cuando detecte signos de tizón.
- Preetiquetado en anotación de datasets agrícolas: el modelo puede usarse para proponer etiquetas iniciales sobre grandes lotes de imágenes, reduciendo el coste de anotación manual antes de una revisión humana.
- Filtrado en sistemas de gestión de cultivos: integrado en una plataforma de trazabilidad, puede clasificar imágenes subidas por el usuario y enrutarlas al técnico adecuado según la enfermedad detectada.
- Docencia y prototipado en visión artificial: por su tamaño reducido y su arquitectura estándar, es útil como ejemplo didáctico de fine-tuning de ResNet-18 para clasificación de imágenes en cursos de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (11,19 M de parámetros × 4 bytes ≈ 44,8 MB de pesos, más activaciones y buffers); en FP16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA T4, GTX 1650 o RTX 3050 son más que adecuadas. También puede ejecutarse en CPU sin problemas de latencia para imágenes individuales.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas.
- Opciones de despliegue: `transformers` (PyTorch), exportación a ONNX Runtime, TensorFlow Lite para móvil, y servidores de inferencia como TorchServe o Triton. No se documenta soporte específico para vLLM, llama.cpp u Ollama (no aplican a modelos de visión de este tipo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para una ResNet-18 en GPU moderna se espera un throughput de cientos a miles de imágenes por segundo en batch, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sudhir2016/tomato-blight-resnet18 | 11,19 M | Clasificación de imágenes (tizón del tomate) | Imagen (resolución no disponible) | no disponible | Hugging Face |
| ResNet-18 (torchvision, preentrenado en ImageNet) | 11,69 M | Clasificación de imágenes genérica (1000 clases) | Imagen 224×224 | BSD-3-Clause | torchvision |
| MobileNetV3-Small (torchvision) | 2,54 M | Clasificación de imágenes genérica | Imagen 224×224 | BSD-3-Clause | torchvision |
| EfficientNet-B0 (torchvision) | 5,29 M | Clasificación de imágenes genérica | Imagen 224×224 | BSD-3-Clause | torchvision |

La comparación con alternativas genéricas es limitada porque este checkpoint está especializado (presuntamente) en una tarea concreta y no se dispone de métricas para comparar su precisión frente a un ResNet-18 preentrenado en ImageNet ajustado al mismo dataset. Los modelos de torchvision son referencias de arquitectura, no alternativas directas para la tarea de detección de tizón.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática sin rellenar; no se especifican clases, dataset, métricas ni procedimiento de entrenamiento.
- Licencia no declarada: no se indica licencia, lo que impide conocer si el uso comercial está permitido. Es un riesgo legal para cualquier despliegue en producción.
- Sin métricas de evaluación: no hay precisión, recall, F1 ni matriz de confusión publicadas; no se puede validar la calidad del modelo sin evaluarlo empíricamente.
- Riesgo de sobreajuste o sesgo de dominio: al desconocerse el dataset de entrenamiento, no se sabe si el modelo generaliza a condiciones de iluminación, variedades de tomate o cámaras distintas de las usadas en entrenamiento.
- Riesgo de alucinación en sentido amplio: como clasificador, puede asignar una etiqueta de enfermedad a una hoja sana o viceversa si la imagen está fuera de la distribución de entrenamiento; no hay umbral de confianza documentado.
- Uso agrícola crítico: un falso negativo en la detección de tizón puede provocar pérdidas de cosecha; el modelo no debe usarse como único criterio de decisión sin validación por un experto.
- Idiomas: no aplica, pero la ausencia de documentación en cualquier idioma dificulta su adopción.
- Fecha de creación futura: el repositorio figura creado en 2026-11-19, lo que puede indicar un error de metadatos o una fecha de sistema incorrecta; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/sudhir2016/tomato-blight-resnet18
- Paper de referencia citado en la plantilla (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
- Paper original de ResNet (He et al., 2015): no disponible en la información proporcionada, pero es la referencia arquitectónica del modelo.
- Repositorio, demo o blog del autor: no disponible.

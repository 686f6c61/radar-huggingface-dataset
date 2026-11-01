# theshoaibme/panorgan-pulmonology-chestxray-classifier

## Resumen

PanOrganNet Pulmonology Chest X-Ray Classifier es un modelo de clasificación de imágenes médicas desarrollado por el usuario theshoaibme como parte del proyecto Pan-Organ Diagnostic Paradigm (PanOrganNet). Se trata de un clasificador de radiografías de tórax que distingue entre cuatro categorías clínicas pulmonares: normal, COVID-19, opacidad pulmonar no COVID y neumonía viral no COVID. El modelo se presenta como la versión de producción oficial para la rama de neumología dentro de un marco más amplio de diagnóstico por órganos.

Técnicamente, el modelo se basa en la arquitectura EfficientNetV2_S con 20,18 millones de parámetros, adaptada mediante una cabeza de clasificación de cuatro clases con dropout de 0,2. Trabaja con imágenes RGB de 224x224 píxeles normalizadas con estadísticas de ImageNet. El repositorio ocupa aproximadamente 0,1 GB y los pesos se distribuyen en formato PyTorch (`.pt`), lo que implica que no hay versiones GGUF ni safetensors publicadas.

El modelo resulta relevante en el contexto del cribado automatizado de patologías pulmonares mediante radiografía simple, un área con alta demanda de herramientas de triaje. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace atractivo para integraciones en entornos clínicos. Sin embargo, la información pública disponible es limitada y no incluye detalles sobre el proceso de entrenamiento, validación externa ni sesgos demográficos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2_S (CNN) |
| Parámetros totales | 20.182.612 (20,18 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imagen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificación de imagen, sin componente textual) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo emplea EfficientNetV2_S, una red neuronal convolucional de la familia EfficientNetV2 que combina búsqueda de arquitectura neuronal (NAS) con bloques de convolución fusionados (Fused-MBConv) y atención por squeeze-and-excitation. La cabeza de clasificación original se sustituye por una secuencia de dropout (0,2) y una capa lineal que proyecta las características finales a cuatro clases. La entrada es una imagen RGB de 224x224 normalizada con media y desviación estándar de ImageNet, según se especifica en el `config.json` del repositorio.

El entrenamiento se realizó sobre el dataset PanOrganNet Processed Pulmonology, con 14.815 radiografías de entrenamiento y 3.175 de validación, y se evaluó sobre un conjunto de prueba independiente de 3.175 radiografías (15 % estratificado). No se especifican en la información disponible el número de épocas, la función de pérdida, el optimizador, el uso de aumentación de datos ni si se aplicaron técnicas de ajuste fino o regularización adicionales. Tampoco se detalla la composición exacta del dataset por clase ni la procedencia de las imágenes, aunque la cita bibliográfica hace referencia al trabajo de Chowdhury et al. (2020) sobre cribado de neumonía viral y COVID-19, lo que sugiere que el dataset podría derivar de dicho estudio o de fuentes similares.

## Capacidades

- Clasificación de radiografías de tórax en cuatro categorías clínicas: normal, COVID-19, opacidad pulmonar no COVID y neumonía viral no COVID.
- Salida de probabilidades por clase mediante softmax, lo que permite umbrales de confianza ajustables.
- Inferencia sobre imágenes RGB de 224x224, compatible con pipelines estándar de torchvision.
- Integración sencilla en PyTorch mediante `torchvision.models.efficientnet_v2_s` y carga de pesos desde Hugging Face Hub.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales.

## Casos de uso

- **Triaje automatizado en urgencias**: el modelo puede preclasificar radiografías de tórax en las cuatro categorías para priorizar la revisión radiológica de casos sospechosos de COVID-19 o neumonía viral, reduciendo el tiempo de lectura en picos de demanda.
- **Cribado poblacional en programas de salud pública**: con 20,18 M de parámetros y entrada de 224x224, el modelo puede desplegarse en servidores modestos para procesar lotes de radiografías en campañas de detección de patología pulmonar.
- **Segunda opinión asistida por IA en atención primaria**: integrado como herramienta de apoyo a la decisión, el modelo puede señalar opacidades no evidentes para médicos de familia sin acceso inmediato a un radiólogo.
- **Investigación en COVID-19 y neumonía**: el modelo sirve como línea base reproducible para estudios comparativos de clasificación de radiografías, dado que los pesos y el dataset están publicados.
- **Monitorización de pacientes con patología respiratoria crónica**: en entornos de seguimiento, el modelo puede comparar radiografías seriadas y alertar sobre cambios compatibles con opacidades nuevas.
- **Docencia y formación radiológica**: el modelo puede utilizarse para generar etiquetas de referencia en conjuntos de imágenes docentes y para ilustrar la variabilidad de las opacidades pulmonares entre categorías.
- **Validación de pipelines de imagen médica**: al ser un modelo compacto y con pesos abiertos, es útil como componente de prueba en pipelines de preprocesamiento, normalización y despliegue de modelos médicos.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Exactitud en test | 95,87 % |
| F1 macro | 0,9641 |
| Sensibilidad (recall) | 95,53 % |
| Especificidad | 98,62 % |

Los resultados se obtuvieron sobre un conjunto de prueba independiente de 3.175 radiografías (15 % estratificado del dataset PanOrganNet Processed Pulmonology). No se proporcionan métricas desglosadas por clase, matrices de confusión, curvas ROC-AUC ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un único lote de imagen; el modelo es muy ligero (20,18 M de parámetros).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050, RTX 4090, A100 o H100; el modelo no aprovecha GPUs de gama alta por su reducido tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime (previa exportación), Triton Inference Server; no se distribuyen pesos en GGUF, por lo que llama.cpp y Ollama no son aplicables.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PanOrganNet Pulmonology (este modelo) | 20,18 M | 224x224x3 | 95,87 % accuracy, F1 0,9641 | CC-BY-4.0 | Hugging Face |
| COVID-Net (Wang et al.) | no disponible | 224x224 | no disponible en la información | no disponible | GitHub |
| CheXNet (Rajpurkar et al.) | ~7 M (DenseNet-121) | 224x224 | no disponible en la información | no disponible | GitHub |
| TorchXRayVision (varios) | variable | 224x224 | no disponible en la información | Apache 2.0 / otras | Hugging Face / GitHub |

No se dispone de datos comparativos directos publicados en la información proporcionada. La comparativa se limita a referencias generales de la literatura; no se han verificado métricas equivalentes sobre el mismo conjunto de prueba.

## Limitaciones y advertencias

- No se han publicado análisis de sesgo demográfico, equidad por subgrupos (edad, sexo, etnia) ni validación externa en cohortes independientes del dataset de entrenamiento.
- El modelo puede presentar riesgo de alucinación en el sentido de falsos positivos o falsos negativos con alta confianza, especialmente en imágenes con artefactos, baja calidad o patologías no representadas en las cuatro clases.
- La clasificación se limita a cuatro categorías; no detecta otras patologías pulmonares (tuberculosis, cáncer de pulmón, derrame pleural, neumotórax) ni anomalías extrapulmonares.
- No se especifica el rendimiento en poblaciones pediátricas, pacientes con comorbilidades ni en imágenes adquiridas con equipos diferentes a los del dataset de entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se ofrece garantía clínica ni certificación como dispositivo médico; su uso en diagnóstico requiere validación regulatoria local.
- El formato de pesos es exclusivamente PyTorch (`.pt`), lo que limita el despliegue en entornos que requieren ONNX, TensorRT o GGUF sin conversión previa.
- No se documentan los criterios de estratificación del conjunto de prueba ni si hubo separación por paciente, lo que podría inflar las métricas si imágenes del mismo paciente aparecen en train y test.
- El modelo no proporciona explicabilidad (mapas de saliencia, Grad-CAM) de forma nativa, lo que dificulta la auditoría clínica.

## Enlaces

- Hugging Face: https://huggingface.co/theshoaibme/panorgan-pulmonology-chestxray-classifier
- Dataset: https://huggingface.co/datasets/theshoaibme/panorgan-processed-pulmonology
- Paper de referencia citado: Chowdhury, M. E. H., Rahman, T., Khandakar, A., et al. "Can AI help in screening Viral and COVID-19 pneumonia?" IEEE Access, vol. 8, pp. 132665-132676, 2020.
